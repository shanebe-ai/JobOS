/// <reference types="vitest" />
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true
  },
  test: {
    environment: 'happy-dom',
    globals: true,
  },
})
