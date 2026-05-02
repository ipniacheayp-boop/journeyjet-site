/// <reference path="./deno-shim.d.ts" />
/**
 * Hotels search — Places API (New) `places:searchText`.
 *
 * Do not replace this file with the dashboard template that calls Legacy Text Search (`maps.googleapis.com/.../textsearch/json`)
 * and expects `{ query }`. The React app sends `{ cityCode, checkInDate, checkOutDate, adults, roomQuantity }` and expects `{ data: [...] }`.
 *
 * Deploy from repo: `supabase login && supabase functions deploy hotels-search --project-ref <YOUR_PROJECT_REF>`
 */
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_PLACES_ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

/**
 * Text Search field mask — only include fields supported by places:searchText.
 * (Some Place Detail–only fields cause INVALID_ARGUMENT if included here.)
 */
const PLACES_FIELD_MASK = [
  "places.id",
  "places.types",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.formattedAddress",
  "places.addressComponents",
  "places.plusCode",
  "places.location",
  "places.viewport",
  "places.rating",
  "places.googleMapsUri",
  "places.websiteUri",
  "places.utcOffsetMinutes",
  "places.adrFormatAddress",
  "places.businessStatus",
  "places.iconMaskBaseUri",
  "places.iconBackgroundColor",
  "places.displayName",
  "places.primaryType",
  "places.primaryTypeDisplayName",
  "places.shortFormattedAddress",
  "places.editorialSummary",
  "places.priceLevel",
  "places.userRatingCount",
  "places.currentOpeningHours",
  "places.regularOpeningHours",
  "places.photos",
].join(",");

interface GooglePlace {
  id?: string;
  name?: string;
  displayName?: { text?: string };
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  formattedAddress?: string;
  shortFormattedAddress?: string;
  adrFormatAddress?: string;
  editorialSummary?: { text?: string };
  priceLevel?: string;
  businessStatus?: string;
  location?: { latitude?: number; longitude?: number };
  photos?: Array<{ name?: string }>;
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  regularOpeningHours?: unknown;
  currentOpeningHours?: unknown;
  addressComponents?: unknown[];
}

const LODGING_TYPES = new Set([
  "lodging",
  "hotel",
  "motel",
  "resort_hotel",
  "bed_and_breakfast",
  "hostel",
  "campground",
  "rv_park",
  "other_lodging",
]);

function placeDedupeKey(p: GooglePlace): string {
  const raw = p.id || (typeof p.name === "string" ? p.name.replace(/^places\//, "") : "");
  return raw.trim();
}

function placeRichnessScore(p: GooglePlace): number {
  let s = 0;
  if (p.displayName?.text) s += 12;
  if (p.formattedAddress || p.shortFormattedAddress) s += 6;
  if (Array.isArray(p.photos) && p.photos.length > 0) s += 4;
  if (p.types?.some((t) => LODGING_TYPES.has(t))) s += 15;
  if (p.primaryType && LODGING_TYPES.has(p.primaryType)) s += 6;
  s += typeof p.rating === "number" ? p.rating : 0;
  return s;
}

function isLikelyLodging(p: GooglePlace): boolean {
  if (p.primaryType && LODGING_TYPES.has(p.primaryType)) return true;
  return !!p.types?.some((t) => LODGING_TYPES.has(t));
}

function isLikelyNonBusinessLocality(p: GooglePlace): boolean {
  const t = p.types ?? [];
  if (t.includes("lodging") || t.includes("establishment")) return false;
  return t.some((x) =>
    ["locality", "political", "administrative_area_level_1", "administrative_area_level_2", "country"].includes(x)
  ) && !t.includes("establishment");
}

function mergePlace(a: GooglePlace, b: GooglePlace): GooglePlace {
  return placeRichnessScore(a) >= placeRichnessScore(b) ? a : b;
}

function buildPhotoUrl(photoName?: string, apiKey?: string): string | null {
  if (!photoName || !apiKey) return null;
  return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=720&maxWidthPx=1080&key=${encodeURIComponent(apiKey)}`;
}

function enrichPlaceWithPhotoUrls(place: GooglePlace, apiKey: string): GooglePlace {
  const photos = Array.isArray(place.photos)
    ? place.photos.map((photo) => ({
      ...photo,
      url: buildPhotoUrl(photo.name, apiKey),
    }))
    : place.photos;
  return { ...place, photos } as GooglePlace;
}

/** Turn huge Google JSON error bodies into short strings for the client toast. */
function summarizeGooglePlacesHttpError(rawBody: string): { error: string; details?: string } {
  const raw = rawBody.trim();
  if (!raw) return { error: "Google Places returned an error with no body." };

  try {
    const parsed = JSON.parse(raw) as {
      error?: {
        code?: number;
        message?: string;
        status?: string;
        details?: Array<{ reason?: string }>;
      };
    };
    const e = parsed?.error;
    const msg = e?.message ?? "";
    const reason = e?.details?.[0]?.reason ?? "";

    if (e?.code === 403 || e?.status === "PERMISSION_DENIED" || reason === "SERVICE_DISABLED") {
      const apiDisabled =
        /places\.googleapis\.com|Places API|SERVICE_DISABLED|not been used|it is disabled/i.test(msg + reason);
      if (apiDisabled) {
        return {
          error: "Places API (New) is not enabled for the Google Cloud project used by your API key.",
          details:
            'Google Cloud Console → APIs & Services → Library → enable “Places API (New)” (places.googleapis.com). Billing must be on for that project. Wait a few minutes after enabling, then retry.',
        };
      }
      return {
        error: "Google denied this request (403). Check API key restrictions and billing.",
        details: msg.length > 280 ? `${msg.slice(0, 280)}…` : msg,
      };
    }

    if (e?.code === 401 || e?.status === "UNAUTHENTICATED") {
      return {
        error: "Google rejected the API key.",
        details: "Confirm GOOGLE_PLACES_API_KEY in Supabase Edge Function secrets matches a key from the same project where Places API (New) is enabled.",
      };
    }

    return {
      error: "Google Places request failed.",
      details: msg.length > 400 ? `${msg.slice(0, 400)}…` : msg,
    };
  } catch {
    return {
      error: "Failed to fetch hotels from Google Places.",
      details: raw.length > 400 ? `${raw.slice(0, 400)}…` : raw,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    /** App sends cityCode; legacy/dashboard stubs used `query` — accept both. */
    const cityCode = String(body.cityCode ?? body.query ?? body.q ?? "").trim();
    const checkInDate = String(body.checkInDate ?? "");
    const checkOutDate = String(body.checkOutDate ?? "");
    const adults = Number(body.adults ?? 0);
    const rq = Number(body.roomQuantity);
    const roomQuantity = Number.isFinite(rq) && rq > 0 ? rq : 1;

    console.log('📥 Hotel search request:', { cityCode, checkInDate, checkOutDate, adults, roomQuantity });

    if (!cityCode || !checkInDate || !checkOutDate || !Number.isFinite(adults) || adults < 1) {
      console.error('❌ Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: cityCode, checkInDate, checkOutDate, adults' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const googleApiKey = Deno.env.get("GOOGLE_PLACES_API_KEY") || Deno.env.get("VITE_GOOGLE_PLACES_API_KEY");
    if (!googleApiKey) {
      throw new Error("Google Places API key is not configured");
    }

    const cityFlat = cityCode.replace(/,/g, " ").trim();
    const regionCode =
      /\bIndia\b/i.test(cityCode) || /,\s*IN\s*$/i.test(cityCode) ? "IN" : undefined;

    type Attempt = { textQuery: string; includedType?: "lodging"; omitRank?: boolean };

    /** Lodging-first order. Never stop at bare city text — that often returns one locality, not hotels. */
    const attemptDefs: Attempt[] = [
      { textQuery: `hotels in ${cityCode}`, includedType: "lodging" },
      { textQuery: `hotels ${cityFlat}`, includedType: "lodging" },
      { textQuery: `hotels in ${cityCode}` },
      { textQuery: `luxury hotels in ${cityCode}`, includedType: "lodging" },
      { textQuery: `lodging in ${cityCode}`, includedType: "lodging" },
      { textQuery: `best hotels in ${cityCode}` },
      { textQuery: cityCode.trim(), omitRank: true },
    ];

    const searchPayload = (a: Attempt) =>
      JSON.stringify({
        textQuery: a.textQuery,
        ...(a.includedType ? { includedType: a.includedType } : {}),
        ...(regionCode ? { regionCode } : {}),
        pageSize: 20,
        languageCode: "en",
        ...(!a.omitRank ? { rankPreference: "RELEVANCE" } : {}),
      });

    const callPlaces = async (body: string) =>
      fetch(GOOGLE_PLACES_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": googleApiKey,
          "X-Goog-FieldMask": PLACES_FIELD_MASK,
        },
        body,
      });

    const byKey = new Map<string, GooglePlace>();
    let sawSuccessfulPlacesCall = false;
    let lastGoogleError = "";

    for (const attempt of attemptDefs) {
      const body = searchPayload(attempt);
      const res = await callPlaces(body);
      if (!res.ok) {
        lastGoogleError = await res.text();
        continue;
      }
      sawSuccessfulPlacesCall = true;
      const placesData = await res.json();
      const batch = Array.isArray(placesData.places) ? placesData.places as GooglePlace[] : [];
      for (const raw of batch) {
        const key = placeDedupeKey(raw);
        if (!key) continue;
        const prev = byKey.get(key);
        byKey.set(key, prev ? mergePlace(prev, raw) : raw);
      }
    }

    let places = [...byKey.values()];

    const lodgingLike = places.filter((p) => isLikelyLodging(p) && !isLikelyNonBusinessLocality(p));
    if (lodgingLike.length > 0) {
      places = lodgingLike;
    }

    places.sort((a, b) => {
      const lb = isLikelyLodging(b) ? 1 : 0;
      const la = isLikelyLodging(a) ? 1 : 0;
      if (lb !== la) return lb - la;
      return placeRichnessScore(b) - placeRichnessScore(a);
    });

    places = places.slice(0, 20);

    if (places.length === 0 && !sawSuccessfulPlacesCall && lastGoogleError) {
      console.error("❌ Google Places API error:", lastGoogleError);
      const summary = summarizeGooglePlacesHttpError(lastGoogleError);
      return new Response(JSON.stringify(summary), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Google Places hotels found:", places.length);

    const normalizedHotels = places.map((place) => {
      const enriched = enrichPlaceWithPhotoUrls(place as GooglePlace, googleApiKey);
      const photoList = Array.isArray(enriched.photos) ? enriched.photos : [];
      const display =
        enriched.displayName?.text?.trim() ||
        enriched.shortFormattedAddress?.trim() ||
        enriched.formattedAddress?.trim() ||
        enriched.adrFormatAddress?.replace(/<[^>]+>/g, " ")?.trim() ||
        "Hotel";
      const addr =
        enriched.formattedAddress?.trim() ||
        enriched.shortFormattedAddress?.trim() ||
        enriched.adrFormatAddress?.replace(/<[^>]+>/g, " ")?.trim() ||
        "";
      return {
        provider: "google-places",
        placeId: placeDedupeKey(enriched) || enriched.id || "",
        hotel: {
          name: display,
          cityCode: cityCode,
          address: addr,
          location: {
            lat: enriched.location?.latitude,
            lng: enriched.location?.longitude,
          },
        },
        rating: enriched.rating || 0,
        reviewCount: enriched.userRatingCount || 0,
        photos: photoList.map((photo: { name?: string; url?: string | null }) => ({
          name: photo.name,
          url: photo.url ?? buildPhotoUrl(photo.name, googleApiKey),
        })),
        googleMapsUri: enriched.googleMapsUri || "",
        websiteUri: enriched.websiteUri || "",
        searchMeta: {
          cityQuery: cityCode,
          checkInDate,
          checkOutDate,
          adults,
          roomQuantity: roomQuantity || 1,
        },
        googlePlace: enriched,
      };
    });

    return new Response(
      JSON.stringify({ data: normalizedHotels }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in hotels-search:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});