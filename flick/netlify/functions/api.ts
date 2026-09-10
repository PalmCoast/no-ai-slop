import type { Config } from "@netlify/functions";
import { completeClip, createClip, getClip, putChunk, readClipBytes, validateCreate } from "../lib/clips";
import { error, json, readJson, Router } from "../lib/http";
import type { CreateClipInput } from "../../shared/types";

const router = new Router();

router.on("GET", "/api/health", async () =>
  json({ ok: true, service: "flick", time: new Date().toISOString() }),
);

router.on("POST", "/api/clips", async (req) => {
  const body = await readJson<Partial<CreateClipInput>>(req);
  if (!body) return error(400, "bad_json", "Body must be JSON.");
  const input = validateCreate(body);
  const meta = await createClip(input);
  return json(meta, { status: 201 });
});

router.on("GET", "/api/clips/:id", async (_req, params) => {
  const meta = await getClip(params.id ?? "");
  if (!meta || meta.status !== "ready") return error(404, "not_found", "No such clip.");
  return json(meta);
});

router.on("PUT", "/api/clips/:id/chunks/:n", async (req, params) => {
  const index = Number(params.n);
  const buf = new Uint8Array(await req.arrayBuffer());
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
