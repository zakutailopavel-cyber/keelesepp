// Browser scenarios (docs/E2E_SCENARIOS.md). Run with `npm run emulated` (starts the emulators); the CRM dev server
// is started here, connected to the emulators and to the emulated Cloud Functions.
const { defineConfig, devices } = require('@playwright/test');

const PROJECT = 'demo-keelesepp-e2e';
const FN = (name) => `http://127.0.0.1:5001/${PROJECT}/us-central1/${name}`;
const PORT = 5179;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'report' }]],
  globalSetup: require.resolve('./seed.cjs'),
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'et-EE',
    timezoneId: 'Europe/Tallinn',
    permissions: ['camera', 'microphone'],
    launchOptions: { args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: `npm --prefix ../crm-v2 run dev -- --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_FIREBASE_EMULATORS: '1',
      VITE_FIREBASE_API_KEY: 'demo-key',
      VITE_FIREBASE_AUTH_DOMAIN: `${PROJECT}.firebaseapp.com`,
      VITE_FIREBASE_PROJECT_ID: PROJECT,
      VITE_FIREBASE_STORAGE_BUCKET: `${PROJECT}.appspot.com`,
      VITE_FIREBASE_APP_ID: '1:1:web:e2e',
      VITE_SUPER_ADMIN_EMAILS: 'admin@e2e.test',
      VITE_STAFF_OPERATIONS_API_URL: FN('staffOperationsApi'),
      VITE_LIVE_TURN_API_URL: FN('liveTurnApi'),
      VITE_LANGUAGE_API_URL: FN('languageApi'),
      VITE_INVOICE_API_URL: FN('invoiceApi'),
      VITE_FINANCE_API_URL: FN('financeApi'),
      VITE_MANUAL_INVOICE_API_URL: FN('manualInvoiceApi'),
      VITE_LINKPAY_API_URL: FN('linkpayApi'),
      VITE_GCAL_API_URL: FN('gcalApi'),
      VITE_INTERACTIVE_LESSON_API_URL: FN('interactiveLessonApi'),
      VITE_META_MESSAGING_API_URL: FN('metaMessagingApi'),
      VITE_TEACHER_SCOPE_MIGRATION_API_URL: FN('teacherScopeMigrationApi'),
      VITE_LEGACY_CRM_URL: 'http://127.0.0.1:9/legacy',
    },
  },
});
