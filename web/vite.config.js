import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

// Multi-page app: every top-level *.html file in this project (index.html,
// plus one per game — spy.html, quiz.html, ...) becomes its own Rollup
// entry/React root, all sharing web/src/shared/. Auto-discovered so adding
// a new game's <name>.html here is enough — no config edit needed.
const htmlEntries = Object.fromEntries(
  readdirSync(here)
    .filter((f) => f.endsWith('.html'))
    .map((f) => [f.replace(/\.html$/, ''), resolve(here, f)])
);

// Relative base so the built assets work regardless of the GitHub Pages
// subpath (project pages, custom domain, local preview, etc.) — the build
// output gets merged into the static site's root by the deploy workflow.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: htmlEntries
    }
  }
});
