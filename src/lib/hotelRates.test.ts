import { describe, expect, it } from "vitest";
import {
  buildEstimatedPrice,
  hmacHex,
  matchRatesToPlaces,
  parseSerpHotels,
  rateTokenPayload,
  verifyPriceConfirmation,
} from "../../supabase/functions/_shared/hotelRates";

const serp = {
  properties: [
    { name: "The Ritz Paris", gps_coordinates: { latitude: 48.8681, longitude: 2.3289 }, rate_per_night: { extracted_lowest: 1500, extracted_before_taxes_fees: 1300 }, total_rate: { extracted_lowest: 4500, extracted_before_taxes_fees: 3900 } },
    { name: "No Price Hotel", gps_coordinates: { latitude: 48.86, longitude: 2.33 } },
  ],
};

describe("SerpApi hotel rates", () => {
  it("drops properties without a returned rate instead of inventing one", () => {
    const rates = parseSerpHotels(serp, "USD");
    expect(rates).toHaveLength(1);
    expect(rates[0].total).toBe(4500);
  });

  it("matches by normalized name and coordinates, not coordinates alone", () => {
    const rates = parseSerpHotels(serp, "USD");
    const m = matchRatesToPlaces(
      [
        { key: "ritz", name: "Ritz Paris Hotel", lat: 48.8682, lng: 2.329 },
        { key: "neighbour", name: "Hôtel Vendôme", lat: 48.8681, lng: 2.3289 },
      ],
      rates,
    );
    expect(m.get("ritz")?.name).toBe("The Ritz Paris");
    expect(m.has("neighbour")).toBe(false);
  });

  it("uses the returned stay total and taxes", () => {
    const p = buildEstimatedPrice(parseSerpHotels(serp, "USD")[0], 3, 1)!;
    expect(p.total).toBe("4500");
    expect(p.taxes?.[0].amount).toBe("600");
    expect(p.priceType).toBe("estimated");
  });
});

describe("confirmed rate token", () => {
  it("accepts a valid signed confirmation and rejects a tampered total", async () => {
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    const base = { clientRequestId: "req1", total: 420, currency: "USD", amadeusOfferId: "AM1", expiresAt };
    const token = await hmacHex("secret", rateTokenPayload(base));
    const conf = { source: "amadeus" as const, ...base, token };
    expect(await verifyPriceConfirmation("secret", "req1", conf)).toBeNull();
    expect(await verifyPriceConfirmation("secret", "req1", { ...conf, total: 1 })).toBe("RATE_NOT_CONFIRMED");
    expect(await verifyPriceConfirmation("secret", "req1", undefined)).toBe("RATE_NOT_CONFIRMED");
  });
});
