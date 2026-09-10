import netlify from "@netlify/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), netlify()],
  server: {
    port: 5173,
    strictPort: false,
    fs: {
      deny: ["**/netlify/**", ".env", ".env.*", "**/.data/**"],
    },
    proxy: {
      "/api": { target: "http://localhost:8888", changeOrigin: true },
    },
  },
  build: {
    target: "es2022",
  },
});
