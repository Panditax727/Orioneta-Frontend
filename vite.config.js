import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiProxyTarget =
  process.env.VITE_DEV_PROXY_TARGET || "https://orioneta.accesscam.org";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: true,
      },
      "/oauth2": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: true,
      },
      "/ws": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
  },
});
