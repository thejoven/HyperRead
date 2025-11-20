import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    // Plugin to copy logo from logo directory to dist root
    {
      name: 'copy-logo',
      writeBundle() {
        const logoSource = path.resolve(__dirname, 'logo/logo.png')
        const distLogo = path.resolve(__dirname, 'dist/logo.png')

        if (existsSync(logoSource)) {
          try {
            copyFileSync(logoSource, distLogo)
            console.log('Logo copied from logo directory to dist root')
          } catch (error) {
            console.warn('Failed to copy logo:', error)
          }
        }
      }
    },
    // Plugin to copy PDF.js worker file
    {
      name: 'copy-pdf-worker',
      writeBundle() {
        const workerSource = path.resolve(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
        const distDir = path.resolve(__dirname, 'dist')
        const distWorker = path.resolve(distDir, 'pdf.worker.min.mjs')

        if (existsSync(workerSource)) {
          try {
            if (!existsSync(distDir)) {
              mkdirSync(distDir, { recursive: true })
            }
            copyFileSync(workerSource, distWorker)
            console.log('PDF worker copied to dist root')
          } catch (error) {
            console.warn('Failed to copy PDF worker:', error)
          }
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      external: ['electron'],
      output: {
        manualChunks: {
          // 分离大型依赖
          'mermaid': ['mermaid'],
          'katex': ['katex'],
          'highlight': ['highlight.js'],
          'react-vendor': ['react', 'react-dom'],
          'markdown': ['react-markdown', 'remark-gfm', 'rehype-highlight', 'rehype-raw'],
        },
        chunkFileNames: 'assets/chunk-[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
    exclude: [
      'mermaid',
      'katex',
    ],
  },
  server: {
    port: 3000,
    host: true
  }
})