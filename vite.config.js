import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiProxyTarget =
  process.env.VITE_DEV_PROXY_TARGET || "http://localhost:8080";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
      },
      "/oauth2": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "http://localhost:8091",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});
