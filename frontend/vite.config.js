import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// const adminHtmlFallback = () => ({
//   name: "admin-html-fallback",
//   configureServer(server) {
//     server.middlewares.use((req, res, next) => {
//       const url = req.url.split("?")[0];
//       if (
//         (url === "/hackstack/admin" || url.startsWith("/hackstack/admin/")) &&
//         !url.includes(".")
//       ) {
//         req.url = "/hackstack/admin.html";
//       }
//       next();
//     });
//   },
// });

// https://vite.dev/config/
export default defineConfig({
  base: "/hackstack/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
      },
    },
  },
  server: {
    // In production, nginx routes /auth, /modules, etc. directly to the backend.
    // In local dev, Vite must proxy each backend route prefix explicitly since
    // the staging backend does NOT use an /api prefix on its routes.
    proxy: {
      "/auth":           { target: "http://localhost:5000", changeOrigin: true },
      "/modules":        { target: "http://localhost:5000", changeOrigin: true },
      "/progress":       { target: "http://localhost:5000", changeOrigin: true },
      "/quizzes":        { target: "http://localhost:5000", changeOrigin: true },
      "/leaderboards":   { target: "http://localhost:5000", changeOrigin: true },
      "/users":          { target: "http://localhost:5000", changeOrigin: true },
      "/admin":          { target: "http://localhost:5000", changeOrigin: true },
      "/dashboard":      { target: "http://localhost:5000", changeOrigin: true },
      "/notifications":  { target: "http://localhost:5000", changeOrigin: true },
      "/admin-whitelist":{ target: "http://localhost:5000", changeOrigin: true },
    },
  },
});
