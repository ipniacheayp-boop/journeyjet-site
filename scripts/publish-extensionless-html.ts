/**
 * After `aws s3 sync dist … --delete`, publish slash-free HTML objects so
 * https://tripile.com/flights returns the prerendered document (HTTP 200)
 * instead of CloudFront's 404→/index.html fallback (homepage canonical).
 *
 * Usage (CI): S3_BUCKET=… bunx tsx scripts/publish-extensionless-html.ts
 */
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { spawnSync } from "child_process";
import { stageExtensionlessHtml } from "./extensionlessHtml";

const ROOT = resolve(".");
const DIST = resolve(ROOT, "dist");
const bucket = process.env.S3_BUCKET?.trim();

const stageDir = mkdtempSync(join(tmpdir(), "tripile-ext-html-"));
try {
  const keys = stageExtensionlessHtml(DIST, stageDir);
  const required = ["flights", "hotels", "car-rentals", "deals", "travel-guides"];
  const missing = required.filter((k) => !keys.includes(k));
  if (missing.length) {
    throw new Error(
      `Prerendered HTML missing for canonical hub routes: ${missing.join(", ")}. Run bun run build first.`,
    );
  }
  console.log(`staged ${keys.length} extensionless HTML objects`);

  if (!bucket) {
    console.log("S3_BUCKET not set — dry run only.");
    process.exit(0);
  }

  const sync = spawnSync(
    "aws",
    [
      "s3",
      "sync",
      stageDir,
      `s3://${bucket}`,
      "--content-type",
      "text/html; charset=utf-8",
      "--metadata-directive",
      "REPLACE",
      "--cache-control",
      "public, max-age=0, must-revalidate",
    ],
    { stdio: "inherit" },
  );
  if (sync.status !== 0) {
    process.exit(sync.status ?? 1);
  }
} finally {
  rmSync(stageDir, { recursive: true, force: true });
}
