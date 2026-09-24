import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { isStampId, publishRefusal, stampPageHtml, stampPageUrl, stampPublicId } from "../src/host.ts";
import { STAMP_DESK_CENTS, STAMP_PRICE_ID, STAMP_SITE } from "../src/offer.ts";
import { run } from "../src/run.ts";
import { certificate, openSeal } from "../src/stamp.ts";
import { decodeStamp } from "../netlify/lib/decode.ts";
import checkout from "../netlify/functions/checkout.ts";
import hosted from "../netlify/functions/hosted.ts";

const root = dirname(fileURLToPath(import.meta.url));
const braidRoot = join(root, "..");
const sensor = readFileSync(join(braidRoot, "examples", "sensor.braid"), "utf8");

function sensorStamp(): Uint8Array {
  const result = run(sensor, "js");
  const blob = result.seals[0]?.blob;
  if (!blob) throw new Error("sensor program did not seal");
  return blob;
}

describe("stamp desk", () => {
  it("keeps the Palm Coast AI price at $29", () => {
    expect(STAMP_DESK_CENTS).toBe(2900);
    expect(STAMP_PRICE_ID).toBe("price_1UIE1RFJWYd4pYux4kwJRSfU");
    expect(STAMP_SITE).toBe("https://braid-firstdeploy.netlify.app");
  });

  it("publishes only a paid $29 Stamp Desk session", () => {
    const stampId = "ab".repeat(16);
    const paid = {
      payment_status: "paid",
      mode: "payment",
      currency: "usd",
      amount_total: 2900,
      metadata: { product: "braid", kind: "stamp-desk", stampId },
    };
    expect(publishRefusal(paid)).toBeNull();
    expect(publishRefusal({ ...paid, payment_status: "unpaid" })).toBe("unpaid");
    expect(publishRefusal({ ...paid, amount_total: 100 })).toBe("wrong_amount");
    expect(publishRefusal({ ...paid, metadata: { ...paid.metadata, product: "other" } })).toBe("wrong_product");
    expect(isStampId(stampId)).toBe(true);
    expect(stampPageUrl(stampId)).toBe(`https://braid-firstdeploy.netlify.app/s/${stampId}`);
  });

  it("rejects a stamp that is not BRD1 before any payment call", async () => {
    const bad = await checkout(new Request("https://braid-firstdeploy.netlify.app/api/checkout", { method: "POST", body: "{}" }));
    expect(bad.status).toBe(400);
    const res = await checkout(
      new Request("https://braid-firstdeploy.netlify.app/api/checkout", {
        method: "POST",
        body: JSON.stringify({ stamp: Buffer.from(sensorStamp()).toString("base64") }),
      }),
    );
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string; message: string };
    expect(body.error).toBe("payments_unconfigured");
    expect(body.message).toContain("STRIPE_SECRET_KEY");
  });

  it("asks for a Checkout session before the success page stores anything", async () => {
    const res = await hosted(new Request("https://braid-firstdeploy.netlify.app/hosted"));
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("Stripe Checkout");
  });

  it("addresses a stamp by the hash of its bytes", () => {
    const blob = sensorStamp();
    const decoded = decodeStamp(Buffer.from(blob).toString("base64"));
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(stampPublicId(decoded.bytes)).toMatch(/^[0-9a-f]{32}$/);
    expect(stampPublicId(decoded.bytes)).toBe(stampPublicId(blob));
  });

  it("renders a public page that shows the hash without a toolchain", () => {
    const opened = openSeal(sensorStamp());
    const page = stampPageHtml(opened, "https://braid-firstdeploy.netlify.app/s/abc", "https://braid-firstdeploy.netlify.app/s/abc/file");
    expect(page).toContain(opened.sha256);
    expect(page).toContain("Download the stamp file");
    expect(page).toContain(certificate(opened).split("\n")[0]);
    const hostile = stampPageHtml(
      { ...opened, note: `<script>alert("x")</script>` },
      "https://braid-firstdeploy.netlify.app/s/abc",
      "https://braid-firstdeploy.netlify.app/s/abc/file",
    );
    expect(hostile).not.toContain("<script>alert");
    expect(hostile).toContain("&lt;script&gt;");
  });
});

describe("brd1 reader", () => {
  it("checks the sensor stamp fixture", () => {
    const fixture = join(braidRoot, "examples", "sensor.stamp");
    const opened = openSeal(new Uint8Array(readFileSync(fixture)));
    const out = execFileSync("python3", ["tools/brd1_read.py", "examples/sensor.stamp"], {
      cwd: braidRoot,
      encoding: "utf8",
    });
    expect(out).toContain(`sha256 ${opened.sha256}`);
    expect(out).toContain("note bench logger frame");
    expect(out.trim().endsWith("ok")).toBe(true);
  });

  it("rejects a stamp whose hash was flipped", () => {
    const fixture = new Uint8Array(readFileSync(join(braidRoot, "examples", "sensor.stamp")));
    fixture[fixture.length - 1] = (fixture[fixture.length - 1] ?? 0) ^ 0xff;
    const dir = mkdtempSync(join(tmpdir(), "brd1-"));
    const path = join(dir, "bad.stamp");
    writeFileSync(path, fixture);
    try {
      execFileSync("python3", [join(braidRoot, "tools", "brd1_read.py"), path], { encoding: "utf8" });
      throw new Error("reader accepted a bad stamp");
    } catch (error) {
      const failed = error as { stdout?: string; stderr?: string; message?: string };
      expect(`${failed.stdout ?? ""}\n${failed.stderr ?? ""}\n${failed.message ?? ""}`).toContain("hash mismatch");
    }
  });
});
