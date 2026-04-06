import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@altapens/api-contracts': path.resolve(
        __dirname,
        '../../packages/api-contracts/src/index.ts',
      ),
      '@altapens/design-tokens': path.resolve(
        __dirname,
        '../../packages/design-tokens/src/index.ts',
      ),
      '@altapens/shared-types': path.resolve(
        __dirname,
        '../../packages/shared-types/src/index.ts',
      ),
    },
  },
})
