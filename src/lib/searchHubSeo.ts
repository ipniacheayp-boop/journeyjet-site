const SITE_ORIGIN = "https://tripile.com";

export const SEARCH_HUB_PATHS = ["/flights", "/hotels", "/car-rentals"] as const;
export type SearchHubPath = (typeof SEARCH_HUB_PATHS)[number];

export function normalizePublicPath(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";
  return path;
}

export function searchHubPath(pathname: string): SearchHubPath {
  const path = normalizePublicPath(pathname);
  if (path === "/hotels" || path === "/car-rentals" || path === "/flights") return path;
  return "/flights";
}

export function searchHubCanonical(pathname: string): string {
  return `${SITE_ORIGIN}${searchHubPath(pathname)}`;
}
