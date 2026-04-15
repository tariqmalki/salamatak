import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Base path for GitHub Pages deployment
  // Replace 'salamatak' with your repo name if different
  base: '/salamatak/',
})
