import fs from "node:fs";
import { defineConfig } from "vite";

const DEBUG_LOG_PATH = "/opt/cursor/logs/debug.log";

export default defineConfig({
  plugins: [
    {
      name: "skiploom-debug-log",
      configureServer(server) {
        server.middlewares.use("/__debug-log", (request, response) => {
          if (request.method !== "POST") {
            response.statusCode = 405;
            response.end();
            return;
          }

          let body = "";
          request.setEncoding("utf8");
          request.on("data", (chunk) => {
            body += chunk;
          });
          request.on("end", () => {
            try {
              const entry = JSON.parse(body);
              // #region agent log
              fs.appendFileSync(DEBUG_LOG_PATH, `${JSON.stringify(entry)}\n`);
              // #endregion
              response.statusCode = 204;
            } catch {
              response.statusCode = 400;
            }
            response.end();
          });
        });
      },
    },
  ],
});
