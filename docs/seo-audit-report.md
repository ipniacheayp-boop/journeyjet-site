# Tripile SEO discovery & indexing audit

Audited **1640** unique sitemap URLs (1640 entries) from sitemap.xml, sitemap-hotels.xml against 1640 prerendered documents in `dist/`.
Canonical host: `https://tripile.com`. robots.txt sitemap directives: `https://tripile.com/sitemap.xml`, `https://tripile.com/sitemap-hotels.xml`, `https://tripile.com/sitemap-index.xml`.

## Summary

| Metric | Count |
| --- | --- |
| Total sitemap URLs | 1640 |
| URLs returning 200 (prerendered document present) | 1640 |
| URLs internally linked | 1640 |
| Orphan URLs (no inbound internal link) | 0 |
| Redirected URLs in sitemap | 0 |
| 404 / soft-404 candidates (no prerendered document) | 0 |
| Canonical mismatches | 0 |
| noindex URLs | 0 |
| Blocked by robots.txt | 0 |
| Duplicate URL variants (`//`, trailing slash, query) | 0 |
| Non-canonical host | 0 |
| Duplicate sitemap entries | 0 |
| Pages with insufficient content (<60 words) | 0 |
| Near-duplicate content groups (same template skeleton) | 163 |
| Dead internal link targets | 0 |

## Orphan URLs

_none_

## Redirected URLs found in the sitemap

_none_

## 404 / soft-404 candidates

_none_

## Canonical mismatches

_none_

## noindex URLs

_none_

## Robots-blocked URLs

_none_

## Duplicate URL variants

_none_

## Pages with insufficient content

_none_

## Near-duplicate content groups

- 91 pages share one template skeleton, e.g. /deals/boston-barcelona-2026-01-03, /deals/seattle-sydney-2025-11-27, /deals/seattle-sydney-2026-01-25, /deals/denver-london-2025-11-26
- 66 pages share one template skeleton, e.g. /cheap-hotels-in/savannah, /cheap-hotels-in/macon, /cheap-hotels-in/springfield-il, /cheap-hotels-in/naperville
- 56 pages share one template skeleton, e.g. /deals/san-francisco-tokyo-2025-12-11, /deals/los-angeles-dubai-2026-02-17, /deals/san-francisco-sydney-2026-01-01, /deals/san-francisco-tokyo-2026-01-06
- 40 pages share one template skeleton, e.g. /flights-to/chicago, /flights-to/miami, /flights-to/orlando, /flights-to/atlanta
- 39 pages share one template skeleton, e.g. /cheap-car-rentals-in-chicago, /cheap-car-rentals-in-miami, /cheap-car-rentals-in-orlando, /cheap-car-rentals-in-atlanta
- 35 pages share one template skeleton, e.g. /cheap-hotels-in/toulouse, /cheap-hotels-in/funchal, /cheap-hotels-in/milan, /cheap-hotels-in/venice
- 30 pages share one template skeleton, e.g. /cheap-hotels-in/augusta-ga, /cheap-hotels-in/columbus-ga, /cheap-hotels-in/athens-ga, /cheap-hotels-in/alpharetta
- 27 pages share one template skeleton, e.g. /cheap-hotels-in/calgary, /cheap-hotels-in/banff, /cheap-hotels-in/jasper, /cheap-hotels-in/edmonton
- 24 pages share one template skeleton, e.g. /cheap-hotels-in/dublin, /cheap-hotels-in/galway, /cheap-hotels-in/cork, /cheap-hotels-in/killarney
- 21 pages share one template skeleton, e.g. /travel-guide/chicago, /travel-guide/miami, /travel-guide/orlando, /travel-guide/atlanta
- 20 pages share one template skeleton, e.g. /cheap-hotels-in/gulf-shores, /cheap-hotels-in/denali-park, /cheap-hotels-in/new-haven, /cheap-hotels-in/tybee-island
- 19 pages share one template skeleton, e.g. /travel-guide/london, /travel-guide/paris, /travel-guide/tokyo, /travel-guide/dubai
- 19 pages share one template skeleton, e.g. /cheap-hotels-in/santa-monica, /cheap-hotels-in/long-beach, /cheap-hotels-in/san-jose-ca, /cheap-hotels-in/santa-barbara
- 18 pages share one template skeleton, e.g. /airlines/air-canada, /airlines/air-france, /airlines/air-india, /airlines/alaska-airlines
- 17 pages share one template skeleton, e.g. /cheap-hotels-in/pasadena, /cheap-hotels-in/sacramento, /cheap-hotels-in/monterey, /cheap-hotels-in/napa

## Dead internal link targets

_none_

## Notes & recommendations

- **Templated near-duplicates.** 163 content skeletons are shared by more than one page. This is expected for programmatic sets (city, route, airline pages) as long as each page carries unique data; groups where the *only* variable is the place name are the ones worth expanding first.
- **Static article visibility.** The prerendered article is rendered with `display:none` and replaced by the React app on hydration. Google indexes it, but hidden text is a quality risk — consider making it visible (or removing it once server rendering is available).
- **Sitemap split.** Hotel *city* pages live in `sitemap-hotels.xml`; every other URL, including the hotel hubs, lives in `sitemap.xml`. No URL appears in both.
- **Re-run this audit** after any route, dataset or prerender change: `bun run build && bunx tsx scripts/audit-seo.ts`.

## Per-URL findings

_No issues found._
