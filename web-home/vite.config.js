import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the built assets work regardless of the GitHub Pages
// subpath (project pages, custom domain, local preview, etc.) — the build
// output gets merged into the static site's root by the deploy workflow.
export default defineConfig({
  plugins: [react()],
  base: './'
});
