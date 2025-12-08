import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib/main.ts'),
      name: 'extending-pinia-store',
      fileName: 'extending-pinia-store',
    },
    rollupOptions: {
      external: ['pinia'],
      output: {
        globals: {
          pinia: 'Pinia'
        },
      },
    },
  },
})