import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/mill2meal-frontend/',
  plugins: [react()],
  server: {
    port: 3000,
  }
})