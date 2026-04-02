import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    fs: {
      // Allow serving files from the project root
      allow: ['..']
    }
  },
  optimizeDeps: {
    // Exclude better-sqlite3 from optimization as it's a native module
    exclude: ['better-sqlite3']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
