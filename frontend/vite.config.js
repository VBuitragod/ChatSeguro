import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Esto ayuda a que Vercel encuentre los archivos en la raíz
  base: '/', 
})