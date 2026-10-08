import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Project Pages URL: https://kalpanabhatt8.github.io/cards/
  base: "/cards/",
});
