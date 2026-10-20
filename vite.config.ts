import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'https://localhost:3000',
          changeOrigin: true,
          secure: false,
          ws: true,
        },
        '/auth': {
          target: env.VITE_API_BASE_URL || 'https://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        '/admins': {
          target: env.VITE_API_BASE_URL || 'https://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})
