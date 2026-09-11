import { describe, expect, it } from "vitest";
import { extensionlessKeyFromIndexHtml } from "./extensionlessHtml";

describe("extensionlessKeyFromIndexHtml", () => {
  it("maps prerendered hub pages to slash-free S3 keys", () => {
    expect(extensionlessKeyFromIndexHtml("flights/index.html")).toBe("flights");
    expect(extensionlessKeyFromIndexHtml("hotels/index.html")).toBe("hotels");
    expect(extensionlessKeyFromIndexHtml("car-rentals/index.html")).toBe("car-rentals");
    expect(extensionlessKeyFromIndexHtml("deals/index.html")).toBe("deals");
    expect(extensionlessKeyFromIndexHtml("travel-guides/index.html")).toBe("travel-guides");
  });

  it("does not remap the homepage object", () => {
    expect(extensionlessKeyFromIndexHtml("index.html")).toBeNull();
  });
});
