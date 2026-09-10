import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Vite 8 uses OXC (not esbuild) for minification
    minify: 'oxc',

    // Raise warning threshold (Firebase + React are legitimately large)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Split vendor code into separate cacheable chunks
        manualChunks(id) {
          // React core – tiny and very stable; cached forever
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          // Firebase SDK – largest chunk; split further by sub-package
          if (id.includes('node_modules/@firebase') || id.includes('node_modules/firebase')) {
            if (id.includes('firestore')) return 'vendor-firebase-firestore'
            if (id.includes('auth'))      return 'vendor-firebase-auth'
            return 'vendor-firebase-core'
          }
          // Lucide icons – medium-sized icon library
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide'
          }
          // react-markdown + remark pipeline
          if (
            id.includes('node_modules/react-markdown') ||
            id.includes('node_modules/remark') ||
            id.includes('node_modules/unified') ||
            id.includes('node_modules/rehype') ||
            id.includes('node_modules/micromark') ||
            id.includes('node_modules/mdast') ||
            id.includes('node_modules/hast')
          ) {
            return 'vendor-markdown'
          }
          // bcryptjs – rarely changes; give it its own chunk
          if (id.includes('node_modules/bcryptjs')) {
            return 'vendor-bcryptjs'
          }
        },
      },
    },
  },
})

