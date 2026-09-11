/**
 * Swap title/description/OG tags on HTML responses so X unfurls / and /pricing
 * correctly. The SPA serves the same index.html for every route.
 */
import type { Config, Context } from "@netlify/edge-functions";
import { SITE_ORIGIN, metaForPath, type PageMeta } from "../../shared/meta.ts";

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function setAttr(html: string, attr: "name" | "property", key: string, content: string): string {
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*\\/?>`, "i");
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  return re.test(html) ? html.replace(re, tag) : `${tag}\n${html}`;
}

function applyMeta(html: string, meta: PageMeta, path: string): string {
  const url = `${SITE_ORIGIN}${path === "/" ? "/" : path}`;
  let next = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeAttr(meta.title)}</title>`);
  next = setAttr(next, "name", "description", meta.description);
  next = setAttr(next, "property", "og:title", meta.title);
  next = setAttr(next, "property", "og:description", meta.description);
  next = setAttr(next, "property", "og:url", url);
  next = setAttr(next, "property", "og:image", meta.image);
  next = setAttr(next, "name", "twitter:title", meta.title);
  next = setAttr(next, "name", "twitter:description", meta.description);
  next = setAttr(next, "name", "twitter:image", meta.image);
  next = next.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${escapeAttr(url)}" />`);
  return next;
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/") || /\.[a-z0-9]+$/i.test(url.pathname)) return;
  const response = await context.next();
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("text/html")) return response;
  const html = await response.text();
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const meta = metaForPath(path);
  const patched = applyMeta(html, meta, path);
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  return new Response(patched, { status: response.status, headers });
};

export const config: Config = {
  path: ["/", "/pricing", "/pricing/", "/launch", "/launch/", "/marketing", "/marketing/", "/thanks", "/thanks/", "/record", "/record/", "/v/:id"],
  onError: "bypass",
};
