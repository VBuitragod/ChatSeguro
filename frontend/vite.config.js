import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // las rutas se generan correctamente en Vercel
  base: './', 
})