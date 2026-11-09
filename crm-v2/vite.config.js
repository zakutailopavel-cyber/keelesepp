import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// build id for `clientErrors` records: the deploy's commit (Vercel) or the local commit, else the build date
function buildId() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA;
  if (sha) return sha.slice(0, 7);
  try { return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().slice(0, 12); }
  catch { return new Date().toISOString().slice(0, 10); }
}

export default defineConfig({
  plugins: [react()],
  define: { __APP_BUILD__: JSON.stringify(buildId()) },
  resolve: {
    // every `firebase/firestore` import gets the SDK + a report of writes the rules refuse (client error tracking)
    alias: [
      { find: /^firebase\/firestore$/, replacement: fileURLToPath(new URL('./src/services/firebase/firestoreWithReporting.js', import.meta.url)) },
      // Firestore Pipelines' regex engine (~45 KB gzip on every first load); the CRM never uses Pipelines (re2jsStub.js)
      { find: /^re2js$/, replacement: fileURLToPath(new URL('./src/services/firebase/re2jsStub.js', import.meta.url)) },
    ],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      // ajad.html: the „Sobivad ajad” link with its own preview (title, description, picture), the same app
      input: { main: 'index.html', ajad: 'ajad.html' },
      output: {
        manualChunks(id) {
          // Storage (uploads, recordings, PDFs) is its own file: only pages that upload or download files load it
          // (services/firebase/storageClient.js), not /login or the shell (2026-11-09)
          if (id.includes('node_modules/@firebase/storage') || id.includes('node_modules/firebase/storage')) return 'firebase-storage';
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
