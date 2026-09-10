import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';
import { defineConfig, type Plugin } from 'vite';

/**
 * GitHub Pages serves this repo from a subpath and has no SPA rewrite rule.
 * Copying index.html to 404.html makes deep links (/377/17_0) resolve to the
 * app shell, which the router then handles client-side.
 */
function spaFallback(): Plugin {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist');
      const index = path.join(dist, 'index.html');
      if (fs.existsSync(index)) fs.copyFileSync(index, path.join(dist, '404.html'));
    },
  };
}

export default defineConfig(() => ({
  // Override with BASE_PATH=/ for local static previews or a custom domain.
  base: process.env.BASE_PATH ?? '/courses_interactive/',
  plugins: [react(), tailwindcss(), spaFallback()],
  resolve: {
    alias: {
      '@kit': path.resolve(__dirname, 'src/kit'),
      '@modules': path.resolve(__dirname, 'src/modules'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keep the heavy, rarely-changing libraries in their own cacheable
        // chunks; each module is already split by its dynamic import.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          katex: ['katex'],
          motion: ['motion'],
        },
      },
    },
  },
}));
