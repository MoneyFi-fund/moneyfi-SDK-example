import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import tanstackRouter from '@tanstack/router-plugin/vite'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom', '@aptos-labs/ts-sdk'],
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          aptosmockup: ['aptosmoneyfimockupupgrade']
        }
      }
    },
  },
})
