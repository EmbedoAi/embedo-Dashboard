import { copyFileSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Repo name, because the site is served from https://<org>.github.io/<repo>/
const BASE = '/embedo-Dashboard/'

// GitHub Pages has no server-side rewrites, so a deep link like /users/123 would
// 404 on reload. Pages serves 404.html for unmatched paths while keeping the URL,
// so shipping the app shell as 404.html lets the router take over.
function spaFallback() {
  let outDir = 'dist'
  return {
    name: 'spa-fallback-404',
    configResolved(config: { build: { outDir: string } }) {
      outDir = config.build.outDir
    },
    closeBundle() {
      copyFileSync(path.join(outDir, 'index.html'), path.join(outDir, '404.html'))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [react(), spaFallback()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
