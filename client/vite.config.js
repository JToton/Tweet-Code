import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  test: {
    globals: true,
    environment: "happy-dom",
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    minify: "terser",
    sourcemap: false,
  },
  base: "/",
  define: {
    "process.env": {},
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
