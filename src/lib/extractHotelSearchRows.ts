/** Legacy Places Text Search (maps.googleapis.com/.../textsearch/json) row → UI hotel row. */
function mapLegacyGoogleTextSearchRow(r: Record<string, unknown>): unknown {
  const geo = r.geometry as { location?: { lat?: number; lng?: number } } | undefined;
  const name = String(r.name ?? "Hotel");
  const addr = String(r.formatted_address ?? "");
  return {
    provider: "google-places",
    placeId: String(r.place_id ?? ""),
    hotel: {
      name,
      cityCode: "",
      address: addr,
      location: { lat: geo?.location?.lat, lng: geo?.location?.lng },
    },
    rating: typeof r.rating === "number" ? r.rating : 0,
    reviewCount: typeof r.user_ratings_total === "number" ? r.user_ratings_total : 0,
    photos: [],
    googleMapsUri: typeof r.url === "string" ? r.url : "",
    websiteUri: "",
    searchMeta: {},
    googlePlace: {
      formattedAddress: addr,
      shortFormattedAddress: addr,
      displayName: { text: name },
      location: { latitude: geo?.location?.lat, longitude: geo?.location?.lng },
      types: Array.isArray(r.types) ? r.types : [],
      rating: r.rating,
      userRatingCount: r.user_ratings_total,
    },
  };
}

function isLegacyGoogleResultRow(x: unknown): x is Record<string, unknown> {
  if (x == null || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return "place_id" in r || "formatted_address" in r;
}

/** Normalize Edge Function / client payloads so we always get an array of hotel rows for the UI. */
export function extractHotelSearchRows(payload: unknown): unknown[] {
  if (payload == null) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object") return [];

  const o = payload as Record<string, unknown>;

  if (Array.isArray(o.data)) return o.data;

  const inner = o.data;
  if (inner && typeof inner === "object" && Array.isArray((inner as Record<string, unknown>).data)) {
    return (inner as { data: unknown[] }).data;
  }

  if (Array.isArray(o.results)) {
    const rows = o.results as unknown[];
    if (rows.length > 0 && isLegacyGoogleResultRow(rows[0])) {
      return rows.map((item) => mapLegacyGoogleTextSearchRow(item as Record<string, unknown>));
    }
    return o.results;
  }

  return [];
}
