import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const adminHtmlFallback = () => ({
  name: "admin-html-fallback",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url.split("?")[0];
      if (
        (url === "/admin" || url.startsWith("/admin/")) &&
        !url.includes(".")
      ) {
        req.url = "/admin.html";
      }
      next();
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  base: "/hackstack/,
  plugins: [react(), tailwindcss(), adminHtmlFallback()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        admin: "admin.html",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
