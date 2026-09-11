import { describe, expect, it } from "vitest";
import { searchHubCanonical, searchHubPath } from "./searchHubSeo";

describe("searchHubCanonical", () => {
  it("uses the current hub route, not the homepage", () => {
    expect(searchHubCanonical("/flights")).toBe("https://tripile.com/flights");
    expect(searchHubCanonical("/hotels")).toBe("https://tripile.com/hotels");
    expect(searchHubCanonical("/car-rentals")).toBe("https://tripile.com/car-rentals");
  });

  it("strips trailing slashes so /hotels/ does not fall back to /flights", () => {
    expect(searchHubPath("/hotels/")).toBe("/hotels");
    expect(searchHubCanonical("/hotels/")).toBe("https://tripile.com/hotels");
    expect(searchHubCanonical("/car-rentals/")).toBe("https://tripile.com/car-rentals");
  });
});
