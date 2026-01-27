import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    host: true, // hoặc '0.0.0.0' - cho phép truy cập từ bên ngoài
    port: 5173,
    strictPort: true, // báo lỗi nếu port đã dùng
  },
});