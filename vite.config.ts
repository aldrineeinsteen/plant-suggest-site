import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/plant-suggest-site/',
  plugins: [react()],
})
