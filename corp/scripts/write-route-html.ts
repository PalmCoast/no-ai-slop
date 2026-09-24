import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyRouteHtml, NOT_FOUND_SEO, PAGE_SEO, sitemapIndexXml, sitemapXml } from "../shared/seo.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const template = readFileSync(join(dist, "index.html"), "utf8");

const written: string[] = [];
for (const page of PAGE_SEO) {
  const html = applyRouteHtml(template, page);
  const out = page.path === "/" ? join(dist, "index.html") : join(dist, page.path.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  written.push(html);
  console.log("wrote", out.replace(root + "/", ""), "bytes", html.length);
}

const sizes = new Set(written.map((html) => html.length));
const bodies = new Set(written.map((html) => html.match(/<div id="root">[\s\S]*?<\/div>/)?.[0] ?? ""));
if (sizes.size !== written.length || bodies.size !== written.length) {
  throw new Error("Route HTML files are not structurally distinct");
}

writeFileSync(join(dist, "404.html"), applyRouteHtml(template, NOT_FOUND_SEO));
writeFileSync(join(dist, "sitemap.xml"), sitemapXml());
writeFileSync(join(dist, "sitemaps.xml"), sitemapIndexXml());
writeFileSync(
  join(dist, "_redirects"),
  [
    "/about /about/index.html 200!",
    "/about/ /about/index.html 200!",
    "/buzz /buzz/index.html 200!",
    "/buzz/ /buzz/index.html 200!",
    "/rankings /rankings/index.html 200!",
    "/rankings/ /rankings/index.html 200!",
    "/build /build/index.html 200!",
    "/build/ /build/index.html 200!",
    "/consult /consult/index.html 200!",
    "/consult/ /consult/index.html 200!",
    "/concierge /concierge/index.html 200!",
    "/concierge/ /concierge/index.html 200!",
    "/* /404.html 404",
  ].join("\n") + "\n",
);
console.log("wrote dist/404.html dist/sitemap.xml dist/sitemaps.xml dist/_redirects");
