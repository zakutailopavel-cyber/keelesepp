import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      // ajad.html: the „Sobivad ajad” link with its own preview (title, description, picture), the same app
      input: { main: 'index.html', ajad: 'ajad.html' },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) return 'firebase';
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react';
          // icons (lucide-react) are not one chunk: each page carries the icons it uses, so the first load (login, the
          // student's home) does not download every staff page's icons (2026-11-04, ~13 KB gzip less on the first load)
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
    // whole-page and whole-course tests take 3–8 s on a busy runner; the 5 s default failed PR checks at random
    testTimeout: 20000,
  },
});
