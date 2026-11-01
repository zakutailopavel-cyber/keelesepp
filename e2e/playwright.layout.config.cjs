// The sheet layout check (docs/WORKSHEET_PHONE_VIEW.md): the real player on a fake repository in a real browser, no
// emulators and no network. `npx playwright test -c playwright.layout.config.cjs`
const { defineConfig } = require('@playwright/test');

const PORT = process.env.LAYOUT_PORT || 5183;
module.exports = defineConfig({
  testDir: './layout',
  timeout: 240_000,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}`, locale: 'et-EE', timezoneId: 'Europe/Tallinn' },
  webServer: {
    command: `npm --prefix ../crm-v2 run dev -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}/sheet-lab.html`,
    reuseExistingServer: true,
    timeout: 120_000,
    env: { VITE_FIREBASE_API_KEY: 'demo-key', VITE_FIREBASE_AUTH_DOMAIN: 'demo-lab.firebaseapp.com', VITE_FIREBASE_PROJECT_ID: 'demo-lab', VITE_FIREBASE_STORAGE_BUCKET: 'demo-lab.appspot.com', VITE_FIREBASE_APP_ID: '1:1:web:lab' },
  },
});
