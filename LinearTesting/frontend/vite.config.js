import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        adminReports: "admin-reports.html",
        dashboard: "dashboard.html",
        index: "index.html",
        login: "login.html",
        register: "register.html",
        skins: "skins.html",
        tasks: "tasks.html",
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
