import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function devApi() {
  return {
    name: "aisle-dev-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
        const url = req.url ?? "";
        if (!url.startsWith("/api/")) {
          next();
          return;
        }
        const { default: checkout } = await import("./netlify/functions/checkout.ts");
        const { default: order } = await import("./netlify/functions/order.ts");
        const { default: webhook } = await import("./netlify/functions/stripe-webhook.ts");
        const body = req.method === "GET" || req.method === "HEAD" ? undefined : await readBody(req);
        const request = new Request(`http://${req.headers.host ?? "127.0.0.1:5178"}${url}`, {
          method: req.method,
          headers: req.headers["content-type"] ? { "content-type": String(req.headers["content-type"]) } : undefined,
          body: body as BodyInit | undefined,
        });
        const handler = url.startsWith("/api/order") ? order : url.startsWith("/api/stripe-webhook") ? webhook : checkout;
        const response = await handler(request);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(Buffer.from(await response.arrayBuffer()));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApi()],
  server: {
    port: 5178,
    host: "127.0.0.1",
  },
});
