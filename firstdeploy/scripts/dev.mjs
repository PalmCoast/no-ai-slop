#!/usr/bin/env node
import { createReadStream, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);

const pages = {
  "/": "index.html",
  "/consult": "consult.html",
  "/about": "about.html",
  "/privacy": "privacy.html",
  "/terms": "terms.html",
  "/hive": "hive.html",
  "/flick": "flick.html",
  "/thanks": "thanks.html",
  "/404": "404.html",
};

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".toml": "text/plain; charset=utf-8",
};

function resolve(urlPath) {
  const clean = urlPath.split("?")[0].replace(/\/+$/, "") || "/";
  if (pages[clean]) return join(root, pages[clean]);
  const rel = normalize(clean).replace(/^(\.\.[/\\])+/, "");
  const file = join(root, rel);
  if (!file.startsWith(root)) return null;
  return existsSync(file) ? file : null;
}

const server = createServer((req, res) => {
  const file = resolve(req.url || "/");
  if (!file || !existsSync(file)) {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    createReadStream(join(root, "404.html")).pipe(res);
    return;
  }
  res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`First Deploy preview http://127.0.0.1:${port}`);
});
