import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  css: {
    // Override global C:\postcss.config.mjs that references @tailwindcss/postcss
    postcss: {
      plugins: [],
    },
  },
})
