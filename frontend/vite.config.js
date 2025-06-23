import { defineConfig } from 'vite'

export default defineConfig({
  base: '/dang-ky-hanh-thien/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'app.chuaphucminh.com',
      'chuaphucminh.com',
      'localhost'
    ]
  }
})


