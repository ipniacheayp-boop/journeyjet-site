/**
 * SEO discovery & indexing audit.
 *
 * Audits EVERY URL in the generated sitemaps against the prerendered output in
 * `dist/`, and writes a report to `docs/seo-audit-report.md`.
 *
 * Run after a build + prerender:
 *   bun run build && bunx tsx scripts/audit-seo.ts
 *
 * Checks per sitemap URL:
 *   HTTP 200 (a prerendered document exists)   • no `noindex`
 *   robots.txt allows crawling                 • self-referencing HTTPS canonical
 *   no redirect                                • not a soft 404 / thin page
 *   internally linked (inbound <a href>)       • canonical present in the sitemap
 *   no `//` or trailing-slash URL variants     • near-duplicate content detection
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { resolve, join } from "path";

const ROOT = resolve(".");
const DIST = resolve(ROOT, "dist");
const HOST = "https://tripile.com";
const MIN_WORDS = 60; // below this a programmatic page is a soft-404 / thin-content candidate

if (!existsSync(DIST)) {
  console.error("dist/ not found — run `bun run build` (which prerenders) before auditing.");
  process.exit(1);
}

/* ---------------------------------------------------------------- sitemaps */

function sitemapUrls(file: string): string[] {
  const p = resolve(ROOT, "public", file);
  if (!existsSync(p)) return [];
  return [...readFileSync(p, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const sitemapFiles = ["sitemap.xml", "sitemap-hotels.xml"];
const allSitemapUrls = sitemapFiles.flatMap(sitemapUrls);
const sitemapUrlSet = new Set(allSitemapUrls);

/* ------------------------------------------------------------- robots.txt */

const robotsTxt = existsSync(resolve(ROOT, "public/robots.txt"))
  ? readFileSync(resolve(ROOT, "public/robots.txt"), "utf8")
  : "";

const wildcardDisallows: string[] = (() => {
  const out: string[] = [];
  let inWildcard = false;
  for (const raw of robotsTxt.split("\n")) {
    const line = raw.trim();
    if (/^user-agent:/i.test(line)) inWildcard = line.split(":")[1].trim() === "*";
    else if (inWildcard && /^disallow:/i.test(line)) {
      const value = line.slice("disallow:".length).trim();
      if (value) out.push(value);
    }
  }
  return out;
})();

const robotsBlocks = (path: string) => wildcardDisallows.some((rule) => path.startsWith(rule));

const sitemapDirectives = [...robotsTxt.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => m[1]);

/* --------------------------------------------------------------- redirects */

/** Routes declared as <Navigate to="…"> in App.tsx never belong in a sitemap. */
const appTsx = readFileSync(resolve(ROOT, "src/App.tsx"), "utf8");
const redirectPaths = new Set(
  [...appTsx.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<Navigate/g)].map((m) => m[1]),
);

/* ------------------------------------------------------- prerendered pages */

interface Doc {
  path: string;
  html: string;
  canonical?: string;
  robots?: string;
  title?: string;
  description?: string;
  words: number;
  text: string;
  links: string[];
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name === "index.html") out.push(full);
  }
  return out;
}

const attr = (html: string, re: RegExp) => html.match(re)?.[1];

function readDoc(file: string): Doc {
  const html = readFileSync(file, "utf8");
  const rel = file.slice(DIST.length).replace(/\\/g, "/").replace(/\/index\.html$/, "");
  const path = rel === "" ? "/" : rel;
  const article = html.match(/<article[^>]*id="seo-static-content"[\s\S]*?<\/article>/)?.[0] ?? "";
  const text = article
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return {
    path,
    html,
    canonical: attr(html, /<link rel="canonical" href="([^"]+)"/),
    robots: attr(html, /<meta name="robots" content="([^"]+)"/),
    title: attr(html, /<title>([\s\S]*?)<\/title>/),
    description: attr(html, /<meta name="description" content="([^"]+)"/),
    words: text ? text.split(" ").length : 0,
    text,
    links: [...article.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1].replace(/\/$/, "") || "/"),
  };
}

const docs = walk(DIST).map(readDoc);
const docByPath = new Map(docs.map((d) => [d.path, d]));

/* --------------------------------------------------------- internal links */

/**
 * Site-wide navigation links (header, footer, homepage) come from the React
 * components rather than the prerendered article, so they are collected from
 * source. JS-executing crawlers follow these on every page.
 */
const NAV_SOURCES = [
  "src/components/Header.tsx",
  "src/components/Footer.tsx",
  "src/pages/Index.tsx",
  "src/pages/SearchHubPage.tsx",
];
const globalNavLinks = new Set<string>();
for (const file of NAV_SOURCES) {
  const full = resolve(ROOT, file);
  if (!existsSync(full)) continue;
  const src = readFileSync(full, "utf8");
  for (const m of src.matchAll(/(?:to|href)\s*[:=]\s*"(\/[^"#?{}]*)"/g)) {
    globalNavLinks.add(m[1].replace(/\/$/, "") || "/");
  }
}

const inbound = new Map<string, number>();
for (const href of globalNavLinks) inbound.set(href, (inbound.get(href) ?? 0) + 1);
for (const doc of docs) {
  for (const href of new Set(doc.links)) {
    if (href === doc.path) continue;
    inbound.set(href, (inbound.get(href) ?? 0) + 1);
  }
}

/* -------------------------------------------- near-duplicate content check */

/**
 * Content skeleton: the page's own proper nouns and numbers are removed, so two
 * pages that only swap a city/state/airport name collapse to the same string.
 */
function skeleton(text: string): string {
  return text
    .replace(/[A-Z][a-zA-Z]+/g, "*")
    .replace(/\d+/g, "#")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
}

const skeletonGroups = new Map<string, string[]>();

/* ------------------------------------------------------------------ audit */

interface Finding {
  url: string;
  path: string;
  issues: string[];
}

const findings: Finding[] = [];
const uniqueSitemapUrls = [...new Set(allSitemapUrls)];

const counts = {
  total: uniqueSitemapUrls.length,
  ok200: 0,
  linked: 0,
  orphans: [] as string[],
  redirected: [] as string[],
  missing: [] as string[],
  thin: [] as string[],
  canonicalMismatch: [] as string[],
  noindex: [] as string[],
  robotsBlocked: [] as string[],
  badVariants: [] as string[],
  wrongHost: [] as string[],
  duplicateEntries: [] as string[],
};

const seenUrls = new Set<string>();

for (const url of allSitemapUrls) {
  const issues: string[] = [];
  if (seenUrls.has(url)) {
    counts.duplicateEntries.push(url);
    continue;
  }
  seenUrls.add(url);

  let path = url;
  if (url.startsWith(HOST)) path = url.slice(HOST.length) || "/";
  else {
    counts.wrongHost.push(url);
    issues.push(`non-canonical host (expected ${HOST})`);
  }

  if (/\/\//.test(path) || (path !== "/" && path.endsWith("/")) || /[?#]/.test(path)) {
    counts.badVariants.push(url);
    issues.push("malformed URL variant (`//`, trailing slash or query string)");
  }

  const normalized = path.replace(/\/+$/, "") || "/";

  if (redirectPaths.has(normalized)) {
    counts.redirected.push(url);
    issues.push("URL redirects (declared as a <Navigate> route)");
  }

  if (robotsBlocks(normalized)) {
    counts.robotsBlocked.push(url);
    issues.push("blocked by robots.txt");
  }

  const doc = docByPath.get(normalized);
  if (!doc) {
    counts.missing.push(url);
    issues.push("no prerendered document (served as SPA shell — soft-404 candidate)");
  } else {
    counts.ok200 += 1;
    if (/noindex/i.test(doc.robots ?? "")) {
      counts.noindex.push(url);
      issues.push("meta robots noindex");
    }
    const expected = normalized === "/" ? `${HOST}/` : `${HOST}${normalized}`;
    if (doc.canonical !== expected) {
      counts.canonicalMismatch.push(url);
      issues.push(`canonical mismatch (found ${doc.canonical ?? "none"}, expected ${expected})`);
    } else if (!sitemapUrlSet.has(doc.canonical)) {
      issues.push("canonical URL is not present in the sitemap");
    }
    if (doc.words < MIN_WORDS) {
      counts.thin.push(url);
      issues.push(`insufficient content (${doc.words} words)`);
    }
    const key = skeleton(doc.text);
    if (key) skeletonGroups.set(key, [...(skeletonGroups.get(key) ?? []), normalized]);
  }

  const inboundCount = inbound.get(normalized) ?? 0;
  if (inboundCount > 0) counts.linked += 1;
  else {
    counts.orphans.push(url);
    issues.push("orphan — no internal <a href> link found");
  }

  if (issues.length) findings.push({ url, path: normalized, issues });
}

/* --------------------------------------------- dead internal link targets */

const deadLinks = new Map<string, number>();
for (const doc of docs) {
  for (const href of new Set(doc.links)) {
    if (!docByPath.has(href) && !href.startsWith("/#")) {
      deadLinks.set(href, (deadLinks.get(href) ?? 0) + 1);
    }
  }
}

const duplicateContentGroups = [...skeletonGroups.entries()]
  .filter(([, paths]) => paths.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

/* ----------------------------------------------------------------- report */

const list = (items: string[], limit = 25) =>
  items.length === 0
    ? "_none_"
    : items.slice(0, limit).map((i) => `- ${i}`).join("\n") +
      (items.length > limit ? `\n- …and ${items.length - limit} more` : "");

const report = `# Tripile SEO discovery & indexing audit

Audited **${counts.total}** unique sitemap URLs (${allSitemapUrls.length} entries) from ${sitemapFiles.join(", ")} against ${docs.length} prerendered documents in \`dist/\`.
Canonical host: \`${HOST}\`. robots.txt sitemap directives: ${sitemapDirectives.map((s) => `\`${s}\``).join(", ") || "_none_"}.

## Summary

| Metric | Count |
| --- | --- |
| Total sitemap URLs | ${counts.total} |
| URLs returning 200 (prerendered document present) | ${counts.ok200} |
| URLs internally linked | ${counts.linked} |
| Orphan URLs (no inbound internal link) | ${counts.orphans.length} |
| Redirected URLs in sitemap | ${counts.redirected.length} |
| 404 / soft-404 candidates (no prerendered document) | ${counts.missing.length} |
| Canonical mismatches | ${counts.canonicalMismatch.length} |
| noindex URLs | ${counts.noindex.length} |
| Blocked by robots.txt | ${counts.robotsBlocked.length} |
| Duplicate URL variants (\`//\`, trailing slash, query) | ${counts.badVariants.length} |
| Non-canonical host | ${counts.wrongHost.length} |
| Duplicate sitemap entries | ${counts.duplicateEntries.length} |
| Pages with insufficient content (<${MIN_WORDS} words) | ${counts.thin.length} |
| Near-duplicate content groups (same template skeleton) | ${duplicateContentGroups.length} |
| Dead internal link targets | ${deadLinks.size} |

## Orphan URLs

${list(counts.orphans)}

## Redirected URLs found in the sitemap

${list(counts.redirected)}

## 404 / soft-404 candidates

${list(counts.missing)}

## Canonical mismatches

${list(counts.canonicalMismatch)}

## noindex URLs

${list(counts.noindex)}

## Robots-blocked URLs

${list(counts.robotsBlocked)}

## Duplicate URL variants

${list(counts.badVariants)}

## Pages with insufficient content

${list(counts.thin)}

## Near-duplicate content groups

${
  duplicateContentGroups.length === 0
    ? "_none_"
    : duplicateContentGroups
        .slice(0, 15)
        .map(([, paths]) => `- ${paths.length} pages share one template skeleton, e.g. ${paths.slice(0, 4).join(", ")}`)
        .join("\n")
}

## Dead internal link targets

${list([...deadLinks.entries()].map(([href, n]) => `${href} (linked ${n}×)`))}

## Per-URL findings

${
  findings.length === 0
    ? "_No issues found._"
    : findings
        .slice(0, 200)
        .map((f) => `- \`${f.path}\` — ${f.issues.join("; ")}`)
        .join("\n") + (findings.length > 200 ? `\n- …and ${findings.length - 200} more URLs with findings` : "")
}
`;

mkdirSync(resolve(ROOT, "docs"), { recursive: true });
writeFileSync(resolve(ROOT, "docs/seo-audit-report.md"), report);

console.log(
  [
    `sitemap URLs: ${counts.total}`,
    `200: ${counts.ok200}`,
    `linked: ${counts.linked}`,
    `orphans: ${counts.orphans.length}`,
    `redirected: ${counts.redirected.length}`,
    `missing: ${counts.missing.length}`,
    `canonical mismatch: ${counts.canonicalMismatch.length}`,
    `noindex: ${counts.noindex.length}`,
    `robots-blocked: ${counts.robotsBlocked.length}`,
    `bad variants: ${counts.badVariants.length}`,
    `thin: ${counts.thin.length}`,
    `dup content groups: ${duplicateContentGroups.length}`,
    `dead links: ${deadLinks.size}`,
  ].join(" | "),
);
console.log("report → docs/seo-audit-report.md");
