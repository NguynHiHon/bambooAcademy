import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// XÓA dòng: import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    // XÓA dòng: tailwindcss()
  ],
})
