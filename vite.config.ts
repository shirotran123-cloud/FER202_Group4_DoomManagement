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
  // jsqr chỉ phát hành UMD (không có field `module`/`exports`), nên phải để Vite
  // tiền-bundle nó; nếu không, dev server sẽ lỗi khi import mặc định.
  optimizeDeps: {
    include: ["jsqr", "qrcode", "write-excel-file/browser", "jspdf"],
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
