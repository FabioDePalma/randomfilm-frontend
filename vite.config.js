import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // Per Cloud Storage
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
    proxy: { // 👈 MANTIENI per development locale
      '/api': {
        target: 'http://randomfilm:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})