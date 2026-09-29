import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { handle } from "./netlify/lib/api";

function latchApi(): Plugin {
  return {
    name: "latch-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/")) return next();
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        const body = Buffer.concat(chunks);
        const host = req.headers.host ?? "127.0.0.1:5183";
        const request = new Request(`http://${host}${url}`, {
          method: req.method,
          headers: { "content-type": req.headers["content-type"] ?? "application/json" },
          body: req.method === "GET" || req.method === "HEAD" ? undefined : body,
        });
        try {
          const response = await handle(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          res.statusCode = 500;
          res.end(err instanceof Error ? err.message : "Request failed.");
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), latchApi()],
  server: {
    port: 5183,
    host: "127.0.0.1",
    strictPort: true,
  },
  preview: {
    port: 4183,
    host: "127.0.0.1",
  },
});
