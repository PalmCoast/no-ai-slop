import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SEED_QUESTIONS } from "../shared/ask.ts";
import { applyRouteHtml, NOT_FOUND_SEO, PAGE_SEO, pageForPath, sitemapXml } from "../shared/seo.ts";

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

for (const question of SEED_QUESTIONS) {
  const page = pageForPath(`/q/${question.slug}`);
  const html = applyRouteHtml(template, page);
  const out = join(dist, "q", question.slug, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

const sizes = new Set(written.map((html) => html.length));
if (sizes.size !== written.length) {
  throw new Error("Route HTML files are not structurally distinct");
}

writeFileSync(join(dist, "404.html"), applyRouteHtml(template, NOT_FOUND_SEO));
writeFileSync(join(dist, "sitemap.xml"), sitemapXml());
writeFileSync(
  join(dist, "_redirects"),
  [
    "/ /index.html 200!",
    "/board /board/index.html 200!",
    "/board/ /board/index.html 200!",
    "/apps /apps/index.html 200!",
    "/apps/ /apps/index.html 200!",
    "/hunt /hunt/index.html 200!",
    "/hunt/ /hunt/index.html 200!",
    "/launch / 301",
    "/launch/ / 301",
    "/q/* /index.html 200",
    "/* /404.html 404",
  ].join("\n") + "\n",
);
console.log("wrote dist/404.html dist/sitemap.xml dist/_redirects");
