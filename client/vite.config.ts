import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const appPort = Number(env.VITE_APP_PORT  || 3000)
  const apiPort = Number(env.VITE_API_PORT  || 8080)

  return {
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: appPort,
    strictPort: true,   // fail fast instead of silently jumping ports
    proxy: {
      '/v1': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    // Raise the warning threshold — the bundle is acceptable at ~500 kB gzipped
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) requires manualChunks as a function
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor-react'
          if (id.includes('@tanstack/react-router')) return 'vendor-router'
          if (id.includes('@tanstack/react-query'))  return 'vendor-query'
          if (id.includes('recharts'))               return 'vendor-recharts'
          if (id.includes('lucide-react'))           return 'vendor-icons'
          if (id.includes('node_modules/zustand'))   return 'vendor-zustand'
          if (id.includes('node_modules/zod'))       return 'vendor-forms'
        },
      },
    },
  },
  }
})
