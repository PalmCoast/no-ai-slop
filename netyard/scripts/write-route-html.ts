import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { ViteNodeRunner } from "vite-node/client";
import { installSourcemapsSupport } from "vite-node/source-map";
import { ViteNodeServer } from "vite-node/server";
import { applyRouteHtml, NOT_FOUND_SEO, PAGE_SEO, sitemapXml } from "../shared/seo.ts";

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
for (const page of PAGE_SEO) {
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
await vite.close();

const hashes = new Set(written.map((html) => createHash("sha256").update(html).digest("hex")));
if (hashes.size !== written.length) {
  throw new Error("Route HTML files are not structurally distinct");
}

writeFileSync(join(dist, "404.html"), applyRouteHtml(template, NOT_FOUND_SEO));
writeFileSync(join(dist, "sitemap.xml"), sitemapXml());
writeFileSync(
  join(dist, "_redirects"),
  [
    "/ /index.html 200!",
    "/plan /plan/index.html 200!",
    "/plan/ /plan/index.html 200!",
    "/tools /tools/index.html 200!",
    "/tools/ /tools/index.html 200!",
    "/compare /compare/index.html 200!",
    "/compare/ /compare/index.html 200!",
    "/buy /buy/index.html 200!",
    "/buy/ /buy/index.html 200!",
    "/launch /launch/index.html 200!",
    "/launch/ /launch/index.html 200!",
    "/thanks /thanks/index.html 200!",
    "/thanks/ /thanks/index.html 200!",
    "/* /404.html 404",
  ].join("\n") + "\n",
);
console.log("wrote dist/404.html dist/sitemap.xml dist/_redirects");
