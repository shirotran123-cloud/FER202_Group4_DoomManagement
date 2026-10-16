import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    // Proxy /api sang backend DMS (npm run server). Đổi cổng qua VITE_API_PROXY.
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY ?? "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
})
