/**
 * GET /s/:id — certificate page.
 * GET /s/:id/file — the BRD1 stamp bytes.
 */
import type { Config, Context } from "@netlify/functions";
import { hostedErrorHtml, isStampId, stampFileUrl, stampPageHtml, stampPageUrl } from "../../src/host.ts";
import { openSeal } from "../../src/stamp.ts";
import { publicOrigin } from "../lib/env.ts";
import { html } from "../lib/http.ts";
import { readPublic, stampBytes } from "../lib/store.ts";

export default async (req: Request, context: Context) => {
  const id = context.params.id ?? "";
  if (!isStampId(id)) return html(404, hostedErrorHtml("No stamp at this URL."));
  const file = new URL(req.url).pathname.endsWith("/file");
  let bytes: Uint8Array | null;
  try {
    bytes = await readPublic(id);
  } catch (cause) {
    console.error("stamp read failed", cause);
    return html(503, hostedErrorHtml("Netlify Blobs is not available for stamp storage."));
  }
  if (!bytes) return html(404, hostedErrorHtml("No stamp at this URL."));
  if (file) {
    return new Response(stampBytes(bytes), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${id}.stamp"`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }
  const opened = openSeal(bytes);
  const origin = publicOrigin();
  return new Response(stampPageHtml(opened, stampPageUrl(id, origin), stampFileUrl(id, origin)), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};

export const config: Config = {
  path: ["/s/:id", "/s/:id/file"],
};
