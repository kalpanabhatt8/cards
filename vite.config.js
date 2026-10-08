import { copyFileSync, cpSync, existsSync, rmSync, writeFileSync } from "fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function publishToRepoRoot() {
  return {
    name: "publish-to-repo-root",
    buildStart() {
      // Always build/serve from the Vite source entry.
      if (existsSync("index.source.html")) {
        copyFileSync("index.source.html", "index.html");
      }
    },
    closeBundle() {
      // Branch-based GitHub Pages serves the repo root. Promote dist there so
      // https://kalpanabhatt8.github.io/cards/ loads bundled JS (not raw JSX).
      if (!existsSync("dist/index.html")) return;

      rmSync("assets", { recursive: true, force: true });
      if (existsSync("dist/assets")) {
        cpSync("dist/assets", "assets", { recursive: true });
      }

      for (const name of ["card-back.jpg", "font"]) {
        const from = `dist/${name}`;
        if (!existsSync(from)) continue;
        rmSync(name, { recursive: true, force: true });
        cpSync(from, name, { recursive: true });
      }

      rmSync("docs", { recursive: true, force: true });
      cpSync("dist", "docs", { recursive: true });

      writeFileSync(".nojekyll", "");
      writeFileSync("docs/.nojekyll", "");
      copyFileSync("dist/index.html", "index.html");
    },
  };
}

export default defineConfig({
  plugins: [react(), publishToRepoRoot()],
  // Project Pages URL: https://kalpanabhatt8.github.io/cards/
  base: "/cards/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
