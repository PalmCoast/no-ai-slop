import type { Config } from "@netlify/functions";
import { demoReport, decodeShareToken } from "../../shared/check.ts";
import { renderCheckCardPng, renderToolCardPng } from "../../shared/check-card.ts";

export default async (req: Request) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const url = new URL(req.url);
  const png = url.searchParams.get("demo") === "harbor-hvac"
    ? renderCheckCardPng(demoReport())
    : url.searchParams.get("tool") === "1"
      ? renderToolCardPng()
      : (() => {
          const report = decodeShareToken(url.searchParams.get("token") ?? "");
          return report ? renderCheckCardPng(report) : null;
        })();
  if (!png) return new Response("Unknown card", { status: 404 });
  const body = png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
  return new Response(body, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=86400",
      "x-content-type-options": "nosniff",
    },
  });
};

export const config: Config = {
  path: "/api/check-card",
  method: "GET",
};
