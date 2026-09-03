import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const page = (name: string) => fileURLToPath(new URL(`./${name}.html`, import.meta.url));

export default defineConfig({
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      // Frontend-only dev: forward API calls to `netlify dev` if it is running.
      "/api": { target: "http://localhost:8888", changeOrigin: true },
    },
  },
  build: {
    target: "es2022",
    rollupOptions: {
      input: {
        index: page("index"),
        app: page("app"),
        thanks: page("thanks"),
        skill: page("skill"),
      },
    },
  },
});
