import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    // Override global C:\postcss.config.mjs that references @tailwindcss/postcss
    postcss: {
      plugins: [],
    },
  },
})
