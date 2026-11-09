---
name: Hotel pricing provider
description: Google Places for hotel details; SerpApi google_hotels for estimated prices; Amadeus confirms the chargeable rate
type: constraint
---
- Google Places: hotel names, photos, addresses, ratings, descriptions.
- SerpApi `google_hotels` (SERPAPI_KEY): the ONLY source of displayed hotel prices, labeled "Estimated".
- Never generate/fabricate hotel prices (no base prices, rating multipliers, jitter). No SerpApi match → "Price unavailable".
- Before charging, refresh SerpApi price and confirm a bookable rate with Amadeus; only the Amadeus-confirmed USD total may be charged.
