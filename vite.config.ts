import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/sitemap.xml": {
        target: "https://api.globalpromotionllc.com",
        changeOrigin: true,
        secure: true,
      },
      "/robots.txt": {
        target: "https://api.globalpromotionllc.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
