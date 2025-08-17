import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true, // 🔁 Necessario per Docker su Windows
    },
    proxy: {
      '/api': {
        target: 'http://randomfilm:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})