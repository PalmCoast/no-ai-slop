import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  INDEXNOW_KEY,
  allModels,
  guideHtml,
  homeHtml,
  llmsFull,
  llmsTxt,
  manifestJson,
  modelHtml,
  modelsIndexHtml,
  notFoundHtml,
  robotsTxt,
  sitemapXml,
} from "../src/site.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, "static"), dist, { recursive: true });
await cp(join(root, "src", "rates.mjs"), join(dist, "rates.js"));

await writeFile(join(dist, "index.html"), homeHtml());
await mkdir(join(dist, "models"), { recursive: true });
await writeFile(join(dist, "models", "index.html"), modelsIndexHtml());
for (const model of allModels()) {
  const dir = join(dist, "models", model.id);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), modelHtml(model));
}
await mkdir(join(dist, "guide"), { recursive: true });
await writeFile(join(dist, "guide", "index.html"), guideHtml());
await writeFile(join(dist, "404.html"), notFoundHtml());
await writeFile(join(dist, "sitemap.xml"), sitemapXml());
await writeFile(join(dist, "robots.txt"), robotsTxt());
await writeFile(join(dist, "llms.txt"), llmsTxt());
await writeFile(join(dist, "llms-full.txt"), llmsFull());
await writeFile(join(dist, "site.webmanifest"), manifestJson());
await writeFile(join(dist, `${INDEXNOW_KEY}.txt`), `${INDEXNOW_KEY}\n`);

console.log(`built ${dist}`);
