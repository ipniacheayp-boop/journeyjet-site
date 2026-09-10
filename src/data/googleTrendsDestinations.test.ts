import { describe, expect, it } from "vitest";
import { popularDestinations } from "@/data/destinationsData";
import { trendingDestinations } from "@/data/googleTrendsDestinations";

describe("trendingDestinations catalog", () => {
  it("only uses existing popularDestinations slugs and city names", () => {
    for (const dest of trendingDestinations) {
      const source = popularDestinations.find((d) => d.slug === dest.slug);
      expect(source).toBeTruthy();
      expect(dest.city).toBe(source?.city);
      expect(dest.query).toBe(source?.city);
    }
  });

  it("does not invent pages for Bali or Maldives", () => {
    const slugs = trendingDestinations.map((d) => d.slug);
    expect(slugs).not.toContain("bali");
    expect(slugs).not.toContain("maldives");
  });
});
