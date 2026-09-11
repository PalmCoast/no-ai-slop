import type { Config } from "@netlify/functions";
import { completeClip, createClip, getClip, putChunk, bytesFromChunkRequest, readClipBytes, validateCreate } from "../lib/clips";
import { handleCheckout, handleClaim, handlePortal, handleStripeWebhook } from "../lib/billing";
import { assertCanPublish, consumeStreetPass, seatForRequest } from "../lib/entitlement";
import { error, json, readJson, Router } from "../lib/http";
import { paymentsMode } from "../lib/stripe";
import { openStore } from "../lib/store";
import { FREE_CLIP_LIMIT, FREE_MAX_BYTES, FREE_MAX_DURATION_MS, PAID_PLANS } from "../../shared/plans";
import type { CreateClipInput } from "../../shared/types";

const router = new Router();

router.on("GET", "/api/health", async () =>
  json({
    ok: true,
    service: "flick",
    time: new Date().toISOString(),
    storage: openStore().kind,
    hosted: Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY_BLOBS_CONTEXT),
    payments: paymentsMode(),
  }),
);

router.on("GET", "/api/me", async (req) => {
  const seat = await seatForRequest(req);
  return json({
    ...seat,
    payments: paymentsMode(),
    limits: {
      street: { clips: FREE_CLIP_LIMIT, durationMs: FREE_MAX_DURATION_MS, bytes: FREE_MAX_BYTES },
      paid: { durationMs: 15 * 60 * 1000, bytes: 100 * 1024 * 1024 },
    },
    products: PAID_PLANS,
  });
});

router.on("POST", "/api/checkout", handleCheckout);
router.on("POST", "/api/claim", handleClaim);
router.on("POST", "/api/portal", handlePortal);
router.on("POST", "/api/stripe-webhook", handleStripeWebhook);

router.on("POST", "/api/clips", async (req) => {
  const body = await readJson<Partial<CreateClipInput>>(req);
  if (!body) return error(400, "bad_json", "Body must be JSON.");
  const input = validateCreate(body);
  const seat = await assertCanPublish(req, input);
  const meta = await createClip(input);
  if (seat === "street") await consumeStreetPass(req, meta.id);
  return json(meta, { status: 201 });
});

router.on("GET", "/api/clips/:id", async (_req, params) => {
  const meta = await getClip(params.id ?? "");
  if (!meta || meta.status !== "ready") return error(404, "not_found", "No such clip.");
  return json(meta);
});

router.on("PUT", "/api/clips/:id/chunks/:n", async (req, params) => {
  const index = Number(params.n);
  const buf = await bytesFromChunkRequest(req);
  await putChunk(params.id ?? "", index, buf);
  return json({ ok: true, index });
});

router.on("POST", "/api/clips/:id/complete", async (_req, params) => {
  const meta = await completeClip(params.id ?? "");
  return json(meta);
});

router.on("GET", "/api/clips/:id/video", async (_req, params) => {
  const { meta, body } = await readClipBytes(params.id ?? "");
  return new Response(body, {
    headers: {
      "Content-Type": mimeHeader(meta.mimeType),
      "Content-Length": String(meta.size),
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${meta.id}.webm"`,
    },
  });
});

function mimeHeader(mimeType: string): string {
  const base = mimeType.split(";")[0]?.trim() || "video/webm";
  return base;
}

export default async (req: Request) => router.handle(req);

export { router };

export const config: Config = {
  path: "/api/*",
};
