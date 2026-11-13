import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  site: 'https://xinxueli-4bnezztmcww.qoder.zone',
  build: { format: 'file' },
  vite: { plugins: [tailwindcss()] },
})
