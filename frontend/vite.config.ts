import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-components': ['framer-motion'],
          'syntax-highlighter': ['react-syntax-highlighter'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})
