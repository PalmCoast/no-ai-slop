import type { Config, Context } from "@netlify/functions";
import { decodeShareToken, shareDocument } from "../../shared/check.ts";

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
  const fromPath = new URL(req.url).pathname.split("/").filter(Boolean)[1] ?? "";
  const token = context.params?.token || fromPath;
  const report = decodeShareToken(token);
  if (!report || report.demo) return new Response("Unknown card", { status: 404 });
  return new Response(shareDocument(report), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": "noindex, follow",
      "cache-control": "public, max-age=3600",
    },
  });
};

export const config: Config = {
  path: "/s/:token",
  method: "GET",
};
