import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  define: {
    'window.API_BASE_URL': JSON.stringify('https://api.chuaphucminh.xyz'),
//    'window.API_BASE_URL': JSON.stringify(process.env.VITE_API_URL || 'https://api.chuaphucminh.xyz')
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
        users: 'users.html',
      },
    },
    preserveEntrySignatures: 'strict',
    minify: 'terser', // Minify code
    sourcemap: false, // Tắt sourcemap cho production
    chunkSizeWarningLimit: 1000, // Cảnh báo khi chunk lớn
  }
})
