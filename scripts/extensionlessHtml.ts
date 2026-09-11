import { mkdirSync, copyFileSync, readdirSync, statSync } from "fs";
import { dirname, join, relative, resolve } from "path";

/**
 * S3 + CloudFront serves the object key exactly as requested.
 * Prerender writes `dist/flights/index.html`, which is only hit by `/flights/`.
 * Sitemap canonicals are slash-free (`/flights`), so we also publish a
 * `flights` object (Content-Type: text/html) that returns HTTP 200.
 */
export function extensionlessKeyFromIndexHtml(relPosix: string): string | null {
  const rel = relPosix.replace(/\\/g, "/");
  if (rel === "index.html") return null;
  if (!rel.endsWith("/index.html")) return null;
  return rel.slice(0, -"/index.html".length);
}

export function listExtensionlessHtml(distDir: string): { file: string; key: string }[] {
  const dist = resolve(distDir);
  const out: { file: string; key: string }[] = [];

  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const st = statSync(full);
      if (st.isDirectory()) {
        walk(full);
        continue;
      }
      if (name !== "index.html") continue;
      const rel = relative(dist, full);
      const key = extensionlessKeyFromIndexHtml(rel);
      if (!key) continue;
      out.push({ file: full, key });
    }
  };

  walk(dist);
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

export function stageExtensionlessHtml(distDir: string, stageDir: string): string[] {
  const staged: string[] = [];
  for (const { file, key } of listExtensionlessHtml(distDir)) {
    const dest = join(stageDir, key);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(file, dest);
    staged.push(key);
  }
  return staged;
}
