import { defineConfig } from 'vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import { cloudflare } from "@cloudflare/vite-plugin";

import tanstackRouter from '@tanstack/router-plugin/vite'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
    tailwindcss(),
    // cloudflare()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    target: 'esnext',
    keepNames: true
  },
  build: {
    minify: false,
    rollupOptions: {
      output: {
        format: 'es'
      },
      external: (id) => {
        // Don't bundle these as they might cause conflicts
        return id.includes('@aptos-labs/wallet-adapter') || 
               id.includes('@aptos-connect') ||
               id.includes('@identity-connect');
      }
    }
  },
  optimizeDeps: {
    include: ['@chakra-ui/react']
  }
})
