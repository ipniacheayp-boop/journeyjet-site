/**
 * After `aws s3 sync dist … --delete`, publish slash-free HTML objects so
 * https://tripile.com/flights returns the prerendered document (HTTP 200)
 * instead of CloudFront's 404→/index.html fallback (homepage canonical).
 *
 * NOTE: this cannot stage via a directory tree + `aws s3 sync`, because keys
 * like `blog` (file) and `blog/my-post` (child) conflict on a filesystem but
 * are perfectly valid sibling objects in S3. Each object is uploaded with an
 * individual `aws s3 cp`, parallelized with a small worker pool.
 *
 * Usage (CI): S3_BUCKET=… bunx tsx scripts/publish-extensionless-html.ts
 */
import { resolve } from "path";
import { spawn } from "child_process";
import { listExtensionlessHtml } from "./extensionlessHtml";

const ROOT = resolve(".");
const DIST = resolve(ROOT, "dist");
const bucket = process.env.S3_BUCKET?.trim();
const CONCURRENCY = 16;

const entries = listExtensionlessHtml(DIST);
const keys = entries.map((e) => e.key);

const required = ["flights", "hotels", "car-rentals", "deals", "travel-guides"];
const missing = required.filter((k) => !keys.includes(k));
if (missing.length) {
  throw new Error(
    `Prerendered HTML missing for canonical hub routes: ${missing.join(", ")}. Run bun run build first.`,
  );
}
console.log(`found ${keys.length} extensionless HTML objects to publish`);

if (!bucket) {
  console.log("S3_BUCKET not set — dry run only.");
  process.exit(0);
}

function upload(file: string, key: string): Promise<void> {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(
      "aws",
      [
        "s3",
        "cp",
        file,
        `s3://${bucket}/${key}`,
        "--content-type",
        "text/html; charset=utf-8",
        "--cache-control",
        "public, max-age=0, must-revalidate",
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    let stderr = "";
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`aws s3 cp failed for key "${key}" (exit ${code}): ${stderr.trim()}`));
    });
    child.on("error", rejectPromise);
  });
}

let next = 0;
let completed = 0;
async function worker() {
  while (next < entries.length) {
    const { file, key } = entries[next++];
    await upload(file, key);
    completed++;
    if (completed % 200 === 0) console.log(`uploaded ${completed}/${entries.length}`);
  }
}

try {
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`published all ${entries.length} extensionless HTML objects to s3://${bucket}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
