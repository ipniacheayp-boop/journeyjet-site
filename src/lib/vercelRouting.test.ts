import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const config = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"));

describe("Vercel direct-page routing", () => {
  it("serves existing assets and prerendered pages before the application fallback", () => {
    expect(config.routes[0]).toEqual({ handle: "filesystem" });
  });

  it("loads the application for sign-in, callback and protected page links", () => {
    const fallback = config.routes[1];
    expect(fallback.dest).toBe("/index.html");
    for (const path of ["/signin", "/signup", "/auth/callback", "/account", "/forgot-password", "/reset-password"]) {
      expect(new RegExp(`^${fallback.src}$`).test(path)).toBe(true);
    }
  });

  it("deploys the existing production build output", () => {
    expect(config.buildCommand).toBe("bun run build");
    expect(config.outputDirectory).toBe("dist");
  });
});