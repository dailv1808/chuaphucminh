import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  define: {
    'window.API_BASE_URL': JSON.stringify('http://192.168.0.200:8000'),
//    'window.API_BASE_URL': JSON.stringify(process.env.VITE_API_URL || 'http://192.168.0.200:8000')
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'app.chuaphucminh.com',
      'chuaphucminh.com',
      'chuaphucminh.xyz',
      'api.chuaphucminh.xyz',
      'admin.chuaphucminh.xyz',
      'localhost'
    ]
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
    assetsInclude: ['partials/**/*'],
    rollupOptions: {
      input: {
        main: 'index.html',
        meditators: 'all-meditators.html',
        approved: 'approved.html',
        checkedin: 'checked-in.html',
        checkedout: 'checked-out.html',
        kutiassign: 'kuti-assign.html',
        kutilist: 'kuti-list.html',
        login: 'login.html',
        pending: 'pending.html',
        qa: 'qa.html',
        slideshow: 'slideshow.html',
        qa_approval: 'qa_approval.html',
        users: 'users.html',
      },
    },
    preserveEntrySignatures: 'strict',
    minify: 'terser', // Minify code
    sourcemap: false, // Tắt sourcemap cho production
    chunkSizeWarningLimit: 1000, // Cảnh báo khi chunk lớn
  }
})
