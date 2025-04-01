import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3001
  },
  build: {
    rollupOptions: {
      input: {
        app: './index.html',
      },
    },
  },
  optimizeDeps: {
    include: ['@gala-chain/api', '@gala-chain/connect'],
  },
})
