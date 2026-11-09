#!/usr/bin/env node
// Daily check of the LIVE site (docs/DAILY_SMOKE.md). Read-only: it never creates accounts, never sends messages and
// blocks every data write the app would make while the test accounts are signed in (Firestore writes, Storage
// uploads, Cloud Functions POSTs). Public part always runs; the signed-in part runs only when the owner has put the
// test accounts into GitHub secrets.
//
//   node e2e/smoke/daily-smoke.cjs            # public part (+ signed-in part when SMOKE_* env vars are set)
//
// Env: SMOKE_STUDENT_EMAIL / SMOKE_STUDENT_PASSWORD, SMOKE_TEACHER_EMAIL / SMOKE_TEACHER_PASSWORD (optional),
// SMOKE_SIGNED_IN_SCREENSHOTS=true (optional: also keep screenshots of signed-in pages; the repository is public),
// SMOKE_OUT (report folder, default e2e/smoke/report). Exit code 1 when any step failed.
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const CRM = 'https://crm.epkoolitus.ee';
const WWW = 'https://www.epkoolitus.ee';
const FUNCTIONS = 'https://us-central1-keelesepp-5136b.cloudfunctions.net';
const FIRESTORE = 'https://firestore.googleapis.com/v1/projects/keelesepp-5136b/databases/(default)/documents';
const OUT = path.resolve(process.env.SMOKE_OUT || path.join(__dirname, 'report'));
const NAV_TIMEOUT = 30_000;
const UI_TIMEOUT = 20_000;
const SETTLE_MS = 2500;

const env = (name) => String(process.env[name] || '').trim();
const SECRETS = ['SMOKE_STUDENT_EMAIL', 'SMOKE_STUDENT_PASSWORD', 'SMOKE_TEACHER_EMAIL', 'SMOKE_TEACHER_PASSWORD'].map(env).filter(Boolean);
const SIGNED_IN_SCREENSHOTS = env('SMOKE_SIGNED_IN_SCREENSHOTS') === 'true';

// nothing secret reaches the report, the step summary or the issue (GitHub masks secrets in the log only)
function clean(text, max = 400) {
  let out = String(text ?? '');
  for (const secret of SECRETS) out = out.split(secret).join('***');
  // Firebase ID tokens / keys in URLs
  out = out.replace(/([?&](key|token|access_token|id_token)=)[^&\s]+/gi, '$1***').replace(/Bearer\s+[\w.-]+/g, 'Bearer ***');
  // Playwright's call log is long; the first lines say what failed
  out = out.split('\n').filter(Boolean).slice(0, 6).join(' | ');
  return out.length > max ? `${out.slice(0, max)}…` : out;
}

const results = [];
let shotCounter = 0;

async function step(group, name, fn, { page, publicPage = false } = {}) {
  const started = Date.now();
  const entry = { group, name, status: 'pass', ms: 0, detail: '' };
  try {
    const detail = await fn();
    if (detail && typeof detail === 'object' && detail.skip) {
      entry.status = 'skip';
      entry.detail = clean(detail.skip);
    } else if (detail) {
      entry.detail = clean(detail);
    }
  } catch (error) {
    entry.status = 'fail';
    entry.detail = clean(error?.message || error);
    if (page && (publicPage || SIGNED_IN_SCREENSHOTS)) {
      shotCounter += 1;
      const file = `${String(shotCounter).padStart(2, '0')}-${group}-${name}`.replace(/[^a-z0-9-]+/gi, '-').toLowerCase() + '.png';
      try {
        await page.screenshot({ path: path.join(OUT, file), fullPage: false, timeout: 10_000 });
        entry.screenshot = file;
      } catch { /* the page may be gone */ }
    }
  }
  entry.ms = Date.now() - started;
  results.push(entry);
  const mark = { pass: 'ok  ', fail: 'FAIL', skip: 'skip' }[entry.status];
  console.log(`${mark} [${group}] ${name} (${entry.ms} ms)${entry.detail ? ` — ${entry.detail}` : ''}`);
  return entry.status === 'pass';
}

function skipped(group, name, why) {
  results.push({ group, name, status: 'skip', ms: 0, detail: why });
  console.log(`skip [${group}] ${name} — ${why}`);
}

async function http(url, { method = 'GET', headers = {}, body, redirect = 'follow' } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    return await fetch(url, { method, headers, body, redirect, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function expectStatus(res, wanted, label) {
  const list = Array.isArray(wanted) ? wanted : [wanted];
  if (!list.includes(res.status)) throw new Error(`${label}: HTTP ${res.status}, expected ${list.join(' or ')}`);
}

// console errors and uncaught exceptions of one page (public pages fail on them, signed-in pages only fail on crashes)
function watch(page) {
  const seen = { console: [], crashes: [] };
  page.on('console', (msg) => { if (msg.type() === 'error') seen.console.push(msg.text()); });
  page.on('pageerror', (error) => seen.crashes.push(error.message));
  return seen;
}

async function settle(page) {
  // Firestore keeps a long-poll open, so „network idle” may never come: give the page a moment instead
  await page.waitForTimeout(SETTLE_MS);
}

async function noErrorState(page) {
  const alert = page.locator('.state-view--error');
  if (await alert.count()) throw new Error(`the page shows an error: ${(await alert.first().innerText()).replace(/\s+/g, ' ')}`);
}

// ---------- public part ----------

async function publicChecks(browser) {
  const group = 'public';
  const pages = [
    { url: `${WWW}/`, name: 'www home', ready: (p) => p.locator('h1').first() },
    { url: `${WWW}/ru`, name: 'www Russian home', ready: (p) => p.locator('h1').first() },
    { url: `${WWW}/tasemetest`, name: 'www level test', ready: (p) => p.locator('body') },
    { url: `${WWW}/privaatsus`, name: 'www privacy', ready: (p) => p.locator('h1').first() },
    { url: `${CRM}/login`, name: 'CRM app shell + login form', ready: (p) => p.getByLabel('E-post') },
    { url: `${CRM}/kontroll`, name: 'CRM /kontroll device check', ready: (p) => p.getByRole('button', { name: /Alusta kontrolli/ }) },
    { url: `${CRM}/ajad`, name: 'CRM /ajad availability poll', ready: (p) => p.locator('#root *').first() },
  ];
  const context = await browser.newContext({ locale: 'et-EE', timezoneId: 'Europe/Tallinn', viewport: { width: 1280, height: 860 } });
  for (const item of pages) {
    const page = await context.newPage();
    const seen = watch(page);
    await step(group, item.name, async () => {
      const response = await page.goto(item.url, { waitUntil: 'load', timeout: NAV_TIMEOUT });
      if (!response) throw new Error('no response');
      if (response.status() !== 200) throw new Error(`HTTP ${response.status()}`);
      await item.ready(page).first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
      await settle(page);
      await noErrorState(page);
      const problems = [...seen.crashes.map((m) => `page error: ${m}`), ...seen.console.map((m) => `console error: ${m}`)];
      if (problems.length) throw new Error(problems.slice(0, 3).join(' | '));
      return `HTTP 200`;
    }, { page, publicPage: true });
    await page.close();
  }
  // the CRM root without a session lands on the login form (app shell, router and Firebase Auth start)
  {
    const page = await context.newPage();
    await step(group, 'CRM / sends a visitor to /login', async () => {
      await page.goto(`${CRM}/`, { waitUntil: 'load', timeout: NAV_TIMEOUT });
      await page.waitForURL(/\/login/, { timeout: UI_TIMEOUT });
      await page.getByLabel('E-post').waitFor({ state: 'visible', timeout: UI_TIMEOUT });
    }, { page, publicPage: true });
    await page.close();
  }
  await context.close();

  // static files the site needs
  for (const [name, url] of [['sitemap.xml', `${WWW}/sitemap.xml`], ['robots.txt', `${WWW}/robots.txt`]]) {
    await step(group, name, async () => { expectStatus(await http(url), 200, url); });
  }
}

// ---------- Cloud Functions and rules (no credentials) ----------

async function backendChecks() {
  const group = 'backend';
  // a CORS preflight from the CRM's origin: the function is deployed, starts, and still allows crm.epkoolitus.ee.
  // The functions answer OPTIONS before doing anything else (functions/index.js), so nothing runs or is written.
  const preflight = ['staffOperationsApi', 'financeApi', 'invoiceApi', 'languageApi', 'liveTurnApi', 'gcalApi', 'linkpayApi', 'taxFormApi', 'websiteLeadApi', 'metaMessagingApi'];
  for (const name of preflight) {
    await step(group, `${name} answers (CORS preflight)`, async () => {
      const res = await http(`${FUNCTIONS}/${name}/`, { method: 'OPTIONS', headers: { Origin: CRM, 'Access-Control-Request-Method': 'POST' } });
      expectStatus(res, 204, name);
      const allowed = res.headers.get('access-control-allow-origin');
      if (allowed !== CRM) throw new Error(`${name}: Access-Control-Allow-Origin is „${allowed || '(none)'}”, expected ${CRM}`);
    });
  }
  // the Live Classroom warm-up call (the room's own /ping: no credentials, no data)
  await step(group, 'liveTurnApi /ping', async () => {
    expectStatus(await http(`${FUNCTIONS}/liveTurnApi/ping`, { method: 'POST', headers: { Origin: CRM } }), 204, 'liveTurnApi/ping');
  });
  // the ChatGPT plugin's public OAuth description, through the site's rewrite to sheetBuilderApi
  await step(group, 'sheetBuilderApi via /.well-known (public JSON)', async () => {
    const res = await http(`${CRM}/.well-known/oauth-protected-resource`);
    expectStatus(res, 200, 'oauth-protected-resource');
    const body = await res.json();
    if (body?.resource !== `${CRM}/ai/mcp`) throw new Error(`unexpected body: ${JSON.stringify(body).slice(0, 120)}`);
  });
  // a protected read without a sign-in must be refused (status only: no data comes back either way)
  await step(group, 'admin API refuses an anonymous call (401)', async () => {
    const res = await http(`${FUNCTIONS}/teacherScopeMigrationApi/status`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    expectStatus(res, 401, 'teacherScopeMigrationApi/status');
  });
  for (const collection of ['students', 'users', 'invoices']) {
    await step(group, `Firestore rules refuse anonymous read of ${collection}`, async () => {
      const res = await http(`${FIRESTORE}/${collection}?pageSize=1`);
      expectStatus(res, 403, `anonymous read of ${collection}`);
    });
  }
  skipped(group, 'Firestore rules release date', 'needs Google Cloud credentials (Firebase Rules API); not checked');
}

// ---------- signed-in part (read-only) ----------

// Everything that would change data is stopped in the browser before it leaves; the summary lists what was stopped.
async function readOnlyGuard(context) {
  const blocked = [];
  await context.route((url) => /(^|\.)firestore\.googleapis\.com$/.test(url.hostname), (route) => {
    const url = route.request().url();
    if (/\/Write\/channel|:commit\b|:batchWrite\b|:beginTransaction\b/.test(url)) {
      blocked.push('Firestore write');
      return route.abort();
    }
    return route.continue();
  });
  await context.route((url) => /(^|\.)firebasestorage\.(googleapis\.com|app)$/.test(url.hostname), (route) => {
    if (route.request().method() !== 'GET') { blocked.push(`Storage ${route.request().method()}`); return route.abort(); }
    return route.continue();
  });
  await context.route((url) => /(^|\.)cloudfunctions\.net$/.test(url.hostname), (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    if (request.method() === 'GET' || request.method() === 'OPTIONS' || /\/liveTurnApi\/ping$/.test(pathname)) return route.continue();
    blocked.push(`${request.method()} ${pathname}`);
    return route.abort();
  });
  return blocked;
}

const summarizeBlocked = (blocked) => {
  const counts = blocked.reduce((map, item) => map.set(item, (map.get(item) || 0) + 1), new Map());
  return [...counts].map(([item, n]) => (n > 1 ? `${item} ×${n}` : item)).join(', ');
};

async function signIn(page, email, password, { staff }) {
  await page.goto(`${CRM}/login`, { waitUntil: 'load', timeout: NAV_TIMEOUT });
  await page.getByLabel('E-post').fill(email);
  await page.getByLabel('Parool').fill(password);
  await page.getByRole('button', { name: 'Logi sisse' }).click();
  const nav = page.getByRole('navigation').first();
  const gate = page.getByRole('dialog', { name: /puuduvad andmed/i });
  const loginError = page.locator('.login-card .form-error');
  const pending = page.getByRole('heading', { name: /Konto (ootab kinnitamist|ei ole kinnitatud)/ });
  await nav.or(gate).or(loginError).or(pending).first().waitFor({ state: 'visible', timeout: 30_000 });
  if (await loginError.first().isVisible().catch(() => false)) throw new Error(`sign-in refused: ${(await loginError.first().innerText()).replace(/\s+/g, ' ')}`);
  if (await pending.first().isVisible().catch(() => false)) throw new Error('the test account is not approved yet (Kontod → Uued kontod)');
  if (/\/login/.test(page.url())) throw new Error('still on /login after signing in');
  // filling „Puuduvad andmed” would write to the card: the owner fills the test card once in the app instead
  if (await gate.isVisible().catch(() => false)) throw new Error('„Puuduvad andmed” form is shown: fill the test card’s missing data once in the CRM (docs/DAILY_SMOKE.md)');
  // staff see „Mis on uut” once per browser; closing it only touches this browser's storage
  if (staff) {
    const notice = page.getByRole('dialog').filter({ has: page.getByRole('button', { name: 'Selge' }) });
    await notice.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
    if (await notice.isVisible().catch(() => false)) await notice.getByRole('button', { name: 'Selge' }).click();
  }
  await settle(page);
}

async function signedIn(browser, role, steps) {
  const group = role;
  const email = env(`SMOKE_${role.toUpperCase()}_EMAIL`);
  const password = env(`SMOKE_${role.toUpperCase()}_PASSWORD`);
  if (!email || !password) {
    skipped(group, 'signed-in checks', `secrets SMOKE_${role.toUpperCase()}_EMAIL / SMOKE_${role.toUpperCase()}_PASSWORD are not set (docs/DAILY_SMOKE.md)`);
    return;
  }
  const context = await browser.newContext({
    locale: 'et-EE', timezoneId: 'Europe/Tallinn', viewport: { width: 1280, height: 860 }, serviceWorkers: 'block',
  });
  const blocked = await readOnlyGuard(context);
  const page = await context.newPage();
  const seen = watch(page);
  const ok = await step(group, 'sign in', () => signIn(page, email, password, { staff: role === 'teacher' }), { page });
  if (!ok) {
    for (const item of steps) skipped(group, item.name, 'sign-in failed');
  } else {
    for (const item of steps) {
      seen.crashes.length = 0;
      await step(group, item.name, async () => {
        const detail = await item.run(page);
        if (seen.crashes.length) throw new Error(`page error: ${seen.crashes[0]}`);
        return detail;
      }, { page });
    }
  }
  results.push({ group, name: 'writes stopped by the read-only guard', status: 'info', ms: 0, detail: summarizeBlocked(blocked) || 'none' });
  console.log(`info [${group}] writes stopped by the read-only guard: ${summarizeBlocked(blocked) || 'none'}`);
  await context.close();
}

const STUDENT_STEPS = [
  {
    name: 'cabinet first screen (/student)',
    run: async (page) => {
      await page.goto(`${CRM}/student`, { waitUntil: 'load', timeout: NAV_TIMEOUT });
      await page.locator('h1.sh-hello').waitFor({ state: 'visible', timeout: UI_TIMEOUT });
      if (await page.getByText('Õpilase profiil ei ole kontoga seotud').count()) throw new Error('the test account is not linked to a student card');
      await settle(page);
      await noErrorState(page);
    },
  },
  {
    name: 'homework list (/homework)',
    run: async (page) => {
      await page.goto(`${CRM}/homework`, { waitUntil: 'load', timeout: NAV_TIMEOUT });
      await page.getByRole('heading', { name: 'Ülesanded' }).first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
      await settle(page);
      await noErrorState(page);
    },
  },
  {
    name: 'worksheet opens (read-only)',
    run: async (page) => {
      // the sheet buttons („Alusta” / „Jätka” / „Vaata”) carry data-preview-allowed (LearnerTasksPage); nothing is typed
      const open = page.locator('main button[data-preview-allowed]');
      if (!(await open.count())) return { skip: 'no worksheet is assigned to the test student — assign one (docs/DAILY_SMOKE.md)' };
      await open.first().click();
      await page.locator('.ws-page').first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
      await settle(page);
      await noErrorState(page);
      return `opened „${(await open.first().innerText().catch(() => '')).trim() || 'sheet'}”`;
    },
  },
];

const TEACHER_STEPS = [
  {
    name: 'calendar (/calendar)',
    run: async (page) => {
      await page.goto(`${CRM}/calendar`, { waitUntil: 'load', timeout: NAV_TIMEOUT });
      await page.locator('main h1').first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
      await settle(page);
      await noErrorState(page);
    },
  },
  {
    name: 'test student card',
    run: async (page) => {
      await page.goto(`${CRM}/students`, { waitUntil: 'load', timeout: NAV_TIMEOUT });
      await page.getByRole('heading', { name: 'Õpilased' }).first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
      // only a card with „Test” in its name is opened: the check never opens a real student's card
      const card = page.locator('main a[href^="/students/"]').filter({ hasText: /test/i });
      await card.first().waitFor({ state: 'visible', timeout: UI_TIMEOUT }).catch(() => {});
      if (!(await card.count())) throw new Error('the test teacher sees no student card with „Test” in its name (docs/DAILY_SMOKE.md)');
      await card.first().click();
      await page.waitForURL(/\/students\/[^/]+/, { timeout: UI_TIMEOUT });
      await page.locator('main h1').first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
      await settle(page);
      await noErrorState(page);
    },
  },
  {
    name: 'live room page opens (no call started)',
    run: async (page) => {
      // starting a call creates a liveLessonInvitations document, so the check only opens the room's start page
      await page.goto(`${CRM}/live-classroom`, { waitUntil: 'load', timeout: NAV_TIMEOUT });
      await page.locator('main').first().waitFor({ state: 'visible', timeout: UI_TIMEOUT });
      await page.getByRole('button', { name: /Kutsu õpilane tundi/ }).or(page.getByText(/Vali õpilane|Kutsu|õpilane/i)).first()
        .waitFor({ state: 'visible', timeout: UI_TIMEOUT });
      await settle(page);
      await noErrorState(page);
    },
  },
];

// ---------- report ----------

function report(startedAt) {
  const failed = results.filter((r) => r.status === 'fail');
  const counts = ['pass', 'fail', 'skip'].map((s) => `${results.filter((r) => r.status === s).length} ${s}`).join(' · ');
  const icon = { pass: '✅', fail: '❌', skip: '⏭️', info: 'ℹ️' };
  const lines = [
    `## Igapäevane kontroll — ${failed.length ? 'EBAÕNNESTUS' : 'korras'}`,
    '',
    `${new Date(startedAt).toISOString()} · ${Math.round((Date.now() - startedAt) / 1000)} s · ${counts}`,
    '',
    '| | Group | Step | Time | Detail |',
    '|---|---|---|---|---|',
    ...results.map((r) => `| ${icon[r.status]} | ${r.group} | ${r.name} | ${r.ms ? `${(r.ms / 1000).toFixed(1)} s` : ''} | ${String(r.detail || '').replace(/\|/g, '\\|')}${r.screenshot ? ` (screenshot ${r.screenshot})` : ''} |`),
    '',
  ];
  const md = lines.join('\n');
  fs.writeFileSync(path.join(OUT, 'summary.md'), md);
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ startedAt: new Date(startedAt).toISOString(), results }, null, 2));
  // a short list of the failed steps for the GitHub issue
  fs.writeFileSync(path.join(OUT, 'failed.md'), failed.map((r) => `- **${r.group} · ${r.name}** — ${r.detail}`).join('\n'));
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${md}\n`);
  return failed.length;
}

async function main() {
  const startedAt = Date.now();
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    await publicChecks(browser);
    await backendChecks();
    await signedIn(browser, 'student', STUDENT_STEPS);
    await signedIn(browser, 'teacher', TEACHER_STEPS);
  } finally {
    await browser.close();
  }
  const failed = report(startedAt);
  console.log(failed ? `\n${failed} step(s) failed — see ${path.join(OUT, 'summary.md')}` : '\nAll checks passed.');
  process.exitCode = failed ? 1 : 0;
}

main().catch((error) => {
  console.error(clean(error?.stack || error, 2000));
  try {
    results.push({ group: 'runner', name: 'smoke script', status: 'fail', ms: 0, detail: clean(error?.message || error) });
    report(Date.now());
  } catch { /* nothing more to do */ }
  process.exitCode = 1;
});
