import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/fantasy_baseball_draft_app/',
  resolve: {
    alias: {
      'vue': resolve(__dirname, 'node_modules/vue'),
      'pinia': resolve(__dirname, 'node_modules/pinia')
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Ensure proper path format for assets
        format: 'es',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})
