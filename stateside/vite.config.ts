import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    fs: {
      deny: ["**/netlify/**", ".env", ".env.*", "**/.data/**"],
    },
    proxy: {
      // Frontend-only dev: forward API calls to `netlify dev` if it is running.
      "/api": { target: "http://localhost:8888", changeOrigin: true },
    },
  },
  build: {
    target: "es2022",
  },
});
