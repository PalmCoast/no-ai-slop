import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { ViteNodeRunner } from "vite-node/client";
import { installSourcemapsSupport } from "vite-node/source-map";
import { ViteNodeServer } from "vite-node/server";
import { applyRouteHtml, NOT_FOUND_SEO, PAGE_SEO, sitemapIndexXml, sitemapXml } from "../shared/seo.ts";
import { AEO_PAGES, RETIRED_AEO_PAGES } from "../shared/aeo.ts";
import { CONSULT_COMPARE_PAGES, RETIRED_CONSULT_PATHS } from "../shared/consultCompare.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const template = readFileSync(join(dist, "index.html"), "utf8");

const vite = await createServer({
  root,
  configFile: join(root, "vite.config.ts"),
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});
const node = new ViteNodeServer(vite);
installSourcemapsSupport({ getSourceMap: (source) => node.getSourceMap(source) });
const runner = new ViteNodeRunner({
  root: vite.config.root,
  base: vite.config.base,
  fetchModule(id) {
    return node.fetchModule(id);
  },
  resolveId(id, importer) {
    return node.resolveId(id, importer);
  },
});
const mod = (await runner.executeFile(join(root, "src/entry-server.tsx"))) as { render: (url: string) => string };
const render = mod.render;

const report = console.error;
console.error = (...args: unknown[]) => {
  const text = args.map((arg) => (typeof arg === "string" ? arg : "")).join(" ");
  if (text.includes("useLayoutEffect does nothing on the server")) return;
  report(...args);
};

const written: string[] = [];
// Do not publish dist/ads/index.html. /ads and /ads/ already 302 to the $150 audit;
// the leftover landing still advertised $997 and $297. /ads/index.html 301s to /ads.
const SKIP_PRERENDER = new Set(["/ads"]);
for (const page of PAGE_SEO) {
  if (SKIP_PRERENDER.has(page.path)) continue;
  const rendered = render(page.path);
  const words = rendered.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  if (words < 80) throw new Error(`Prerender for ${page.path} is only ${words} words`);
  const html = applyRouteHtml(template, page, rendered);
  const out = page.path === "/" ? join(dist, "index.html") : join(dist, page.path.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  written.push(html);
  console.log("wrote", out.replace(root + "/", ""), "bytes", html.length, "words", words);
}

const hashes = new Set(written.map((html) => createHash("sha256").update(html).digest("hex")));
await vite.close();

if (hashes.size !== written.length) {
  throw new Error("Route HTML files are not structurally distinct");
}

writeFileSync(join(dist, "404.html"), applyRouteHtml(template, NOT_FOUND_SEO));
writeFileSync(join(dist, "sitemap.xml"), sitemapXml());
writeFileSync(join(dist, "sitemaps.xml"), sitemapIndexXml());
const BROOMS_RAM = "https://brooms.ai/collections/come-and-take-it-black-friday";
const BROOMS_DDR5 = "https://brooms.ai/pages/ddr5-ram-black-friday-deals";
const CONSUMER_MOVES: Array<[string, string]> = [
  ["/ram-deals/black-friday-ddr5-ram-deals", BROOMS_DDR5],
  ["/ram-deals/best-32gb-ddr5-ram", BROOMS_DDR5],
  ["/ram-deals/best-64gb-ddr5-ram", BROOMS_DDR5],
  ["/ram-deals/ddr4-ram-deals", BROOMS_RAM],
  ["/ram-deals/how-much-ram-for-gaming", BROOMS_RAM],
  ["/ram-deals", BROOMS_RAM],
  ["/picks", "https://brooms.ai/collections/black-friday"],
];
const SCANNER_PATHS = [
  "/wp-admin", "/wp-admin/*", "/wp-login.php", "/wp-includes/*", "/wp-content/*", "/wordpress/*", "/wp/*",
  "/xmlrpc.php", "/.env", "/.env.local", "/.env.production", "/.git/*", "/phpmyadmin/*", "/vendor/phpunit/*",
];
writeFileSync(
  join(dist, "_redirects"),
  [
    // Legacy hub URLs linked across the portfolio (audit 2026-09-30): send them to /about.
    "/hive /about 301!",
    "/hive/ /about 301!",
    "/hive.html /about 301!",
    "/about.html /about 301!",
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
    // B2B reset 2026-11-24: retired old-ladder pages 301 to the new offer pages.
    ...RETIRED_CONSULT_PATHS.flatMap((path) => [`${path} /consult 301!`, `${path}/ /consult 301!`]),
    ...RETIRED_AEO_PAGES.flatMap((r) => [`${r.path} ${r.to} 301!`, `${r.path}/ ${r.to} 301!`]),
    ...CONSULT_COMPARE_PAGES.flatMap((page) => [`${page.path} ${page.path}/index.html 200!`, `${page.path}/ ${page.path}/index.html 200!`]),
    "/concierge /concierge/index.html 200!",
    "/concierge/ /concierge/index.html 200!",
    "/concierge/vs-hiring /concierge/vs-hiring/index.html 200!",
    "/concierge/vs-hiring/ /concierge/vs-hiring/index.html 200!",
    ...AEO_PAGES.flatMap((page) => [`${page.path} ${page.path}/index.html 200!`, `${page.path}/ ${page.path}/index.html 200!`]),
    "/disclosure /disclosure/index.html 200!",
    "/disclosure/ /disclosure/index.html 200!",
    // 2026-11-27: consumer RAM-deal guides and /picks moved to brooms.ai (AH stays B2B only).
    ...CONSUMER_MOVES.flatMap(([path, to]) => [`${path} ${to} 301!`, `${path}/ ${to} 301!`, `${path}/index.html ${to} 301!`]),
    "/shop https://brooms.ai/collections/black-friday 301!",
    "/partners https://brooms.ai/collections/black-friday 301!",
    // 2026-11-27: scanner probes get a tiny 410 instead of the full 404 page.
    ...SCANNER_PATHS.map((path) => `${path} /gone.txt 410!`),
    "/x /x/index.html 200!",
    "/x/ /x/index.html 200!",
    "/ads/thanks /ads/thanks/index.html 200!",
    "/ads/thanks/ /ads/thanks/index.html 200!",
    "/ads/index.html /ads 301!",
    "/ads /consult 302!",
    "/ads/ /consult 302!",
    "/consult/north-star-ai-consultation-alternative /consult 301!",
    "/consult/north-star-ai-consultation-alternative/ /consult 301!",
    "/audit /consult 301!",
    "/audit/ /consult 301!",
    "/triage https://calendar.google.com/calendar/appointments/schedules/AcZssZ08PSsZYPUrigPxN1Ax27CJh01QY8fjWo1mGYVhlX5vh0QUTqBzXF4NSNwDyLw487B8fNegD8JV 302!",
    "/triage/ https://calendar.google.com/calendar/appointments/schedules/AcZssZ08PSsZYPUrigPxN1Ax27CJh01QY8fjWo1mGYVhlX5vh0QUTqBzXF4NSNwDyLw487B8fNegD8JV 302!",
    // 2026-11-26: exact /questions and freight paths only. Retired /questions/* slugs above stay 301 to /consult.
    "/questions https://firstdeploy.ai/questions/ 301!",
    "/questions/ https://firstdeploy.ai/questions/ 301!",
    "/freight-ops-ai-agent https://firstdeploy.ai/freight-ops-ai-agent/ 301!",
    "/freight-ops-ai-agent/ https://firstdeploy.ai/freight-ops-ai-agent/ 301!",
    "/* /404.html 404",
  ].join("\n") + "\n",
);
console.log("wrote dist/404.html dist/sitemap.xml dist/sitemaps.xml dist/_redirects");
