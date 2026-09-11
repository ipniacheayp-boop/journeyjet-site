import { describe, expect, it } from "vitest";
import { popularDestinations } from "@/data/destinationsData";
import { findCatalogItemByTrendName, trendingDestinations } from "@/data/googleTrendsDestinations";

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

describe("findCatalogItemByTrendName", () => {
  const catalog = [
    { name: "Paris" },
    { name: "New York City" },
    { name: "Tokyo" },
  ];

  it("matches Google Trends city names to catalog rows", () => {
    expect(findCatalogItemByTrendName(catalog, "Paris")?.name).toBe("Paris");
    expect(findCatalogItemByTrendName(catalog, "New York")?.name).toBe("New York City");
    expect(findCatalogItemByTrendName(catalog, "tokyo")?.name).toBe("Tokyo");
  });

  it("does not invent a catalog row for unmatched trend names", () => {
    expect(findCatalogItemByTrendName(catalog, "Bangkok")).toBeUndefined();
    expect(findCatalogItemByTrendName(catalog, "Bali")).toBeUndefined();
  });
});
