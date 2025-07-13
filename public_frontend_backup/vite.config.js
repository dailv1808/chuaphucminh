import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3005
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true, // Xóa thư mục dist trước khi build
    rollupOptions: {
      input: {
        main: 'index.html',
        dangkythien: 'dangkythien.html',
        trinhphap: 'trinhphap.html'
      },
    },
    minify: 'terser', // Minify code
    sourcemap: false, // Tắt sourcemap cho production
    chunkSizeWarningLimit: 1000, // Cảnh báo khi chunk lớn
  }
})
