import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/voronacar-calc/', // Указываем Vite точное имя репозитория на GitHub Pages
})