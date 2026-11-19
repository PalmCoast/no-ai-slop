import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { festFallbackHtml, festJsonLd } from "./shared/fallback";
import { handle } from "./netlify/lib/check-api";

function festHtml(): Plugin {
  return {
    name: "fest-html",
    transformIndexHtml(html) {
      return html
        .replace("<!--fest-->", festFallbackHtml())
        .replace("<!--jsonld-->", () => `<script type="application/ld+json">${festJsonLd()}</script>`);
    },
  };
}

function checkApi(): Plugin {
  return {
    name: "fest-check-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/check")) return next();
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        const body = Buffer.concat(chunks);
        const host = req.headers.host ?? "127.0.0.1:5186";
        const request = new Request(`http://${host}${url}`, {
          method: req.method,
          headers: { "content-type": req.headers["content-type"] ?? "application/json" },
          body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
        });
        try {
          const ip = req.socket.remoteAddress ?? "local";
          const response = await handle(request, ip);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("content-type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ status: "unreachable", note: error instanceof Error ? error.message : "Request failed." }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), festHtml(), checkApi()],
  server: {
    port: 5186,
    host: "127.0.0.1",
    strictPort: true,
  },
  preview: {
    port: 4186,
    host: "127.0.0.1",
  },
});
