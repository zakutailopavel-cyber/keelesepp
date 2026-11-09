# Daily smoke: the live site checked every morning

Workflow `.github/workflows/daily-smoke.yml`, script `e2e/smoke/daily-smoke.cjs`.
Runs every day at **04:30 UTC** (06:30 Tallinn in winter, 07:30 in summer) and on demand. One browser job, about
2–3 minutes. It checks **https://crm.epkoolitus.ee** and **https://www.epkoolitus.ee**: production, read-only.

## What it checks

**Always (no login):**

| Group | Check |
|---|---|
| public | www home, www `/ru`, `/tasemetest`, `/privaatsus` open with HTTP 200, no console errors, no page crash |
| public | CRM `/login` (app shell + login form), `/kontroll` (button „Alusta kontrolli”), `/ajad` open the same way |
| public | CRM `/` without a session lands on `/login`; `sitemap.xml` and `robots.txt` answer 200 |
| backend | Cloud Functions `staffOperationsApi`, `financeApi`, `invoiceApi`, `languageApi`, `liveTurnApi`, `gcalApi`, `linkpayApi`, `taxFormApi`, `websiteLeadApi`, `metaMessagingApi` answer a CORS preflight from crm.epkoolitus.ee with 204 and allow that origin (the functions answer `OPTIONS` before doing anything else) |
| backend | `liveTurnApi/ping` (the room's warm-up call) 204; `/.well-known/oauth-protected-resource` (sheetBuilderApi through the site) gives the expected JSON |
| backend | an admin API called without a sign-in says 401; Firestore refuses an anonymous read of `students`, `users`, `invoices` (403) — the rules are in force |
| backend | rules release date: **skipped** (needs Google Cloud credentials) |

**With the test accounts (only when the secrets exist; otherwise these rows are „skip” and the run stays green):**

| Who | Check |
|---|---|
| student | signs in; `/student` first screen („Tere, …!”, card linked); `/homework` („Ülesanded”); opens the first worksheet (`.ws-page` visible, nothing typed) — „skip” when no worksheet is assigned |
| teacher | signs in; `/calendar`; `/students` → opens the card whose name contains **„Test”** (never another card); `/live-classroom` start page opens — **no call is started**, because starting one writes a `liveLessonInvitations` document |

Every signed-in step fails on a page crash or on the app's red error box („Andmete laadimine ebaõnnestus”,
„Lehte ei saanud avada”).

### Read-only guard

While a test account is signed in, the browser stops before they leave: every Firestore write (`Write` channel,
`commit`, `batchWrite`, transactions), every Storage upload, and every Cloud Functions call except `GET` / `OPTIONS`
and `liveTurnApi/ping`. The report lists what was stopped (row „writes stopped by the read-only guard”). Because of
this the test student's „Viimati sees” and the account bootstrap call do not run during the check. The only thing
that changes on Google's side is Firebase Auth's own „last sign-in” time of the two test accounts.

The check never creates accounts, never fills „Puuduvad andmed”, never sends e-mails or messages, never deploys.

## When it fails

1. The run is red. GitHub e-mails the person who last changed the workflow's schedule (the repository owner) —
   make sure GitHub → Settings → Notifications → **Actions** has e-mail on for failed workflows.
2. The run page shows a summary table (which step, why). The artifact **daily-smoke-&lt;run id&gt;** (kept 7 days) holds
   `summary.md`, `results.json` and screenshots of the failed **public** pages.
3. One issue **„Igapäevane kontroll ebaõnnestus”** (label `smoke`) is opened with the failed steps; while it keeps
   failing each run adds a comment; the first green run comments „Korras uuesti” and closes it. This uses only the
   workflow's own `GITHUB_TOKEN` in this repository.

**The repository is public**: logs, the summary, the issue and artifacts can be seen by others. Therefore screenshots
of signed-in pages are **off** by default; the error texts have the secrets removed. Turn signed-in screenshots on
only when the test accounts see nothing but test data: repository **variable** `SMOKE_SIGNED_IN_SCREENSHOTS` =
`true` (Settings → Secrets and variables → Actions → **Variables**).

## What the owner must do (once)

The agent did not create any account and has no passwords. Do this yourself:

### 1. Test teacher account

- Create a teacher account the same way you add a real teacher, with an e-mail used only for this (e.g. a Gmail
  alias `yourname+smoketeacher@gmail.com`) and a long password of its own. Name it **„Test Õpetaja (smoke)”**.
- Role **Õpetaja**, **not** Administraator (an admin sees all students and all money). Account active.
- Sign in once yourself in a browser to make sure it works, then sign out.

### 2. Test student card + test student account

- Student account: open `https://crm.epkoolitus.ee/registreeru` (in a private window), role **Õpilane**, full name
  **„Test Õpilane (smoke)”** (the word „Test” is required — the teacher check opens only such a card), a second test
  e-mail (`yourname+smokestudent@gmail.com`) and its own password.
- As admin: **Kontod → Uued kontod** → that account → „Õpetaja (uuele õpilase kaardile)” = **Test Õpetaja (smoke)**
  → **Kinnita**. Approval creates the student card linked to the account. If the teacher's profile then shows
  „õpilast on määratud ainult nime järgi”, press **Seo õpetaja kontoga**.
- On the card: no price, no lessons in the calendar (so nothing is ever billed), and fill what „Puuduvad andmed”
  asks (class or „Täiskasvanu”, language, suitable times) — the check never fills that form itself and fails if the
  student meets it. Sign in once as the test student to see that the cabinet opens without it.
- Optional: in Firebase console → Firestore → `students/<that card>` add `testStudent: true` (boolean). It marks the
  card as a test card and lets an admin open it as „Testõpilane” and accept live invitations for it.
- Give the test student one worksheet: Õppevara → any lesson → a sheet → **Määra õpilastele** → „Test Õpilane
  (smoke)”. Without it the worksheet step is „skip”.
- The test teacher must teach **only** this test student, so nothing real appears on its pages.

### 3. Four secrets in GitHub

GitHub → repository **zakutailopavel-cyber/keelesepp** → **Settings → Secrets and variables → Actions → Secrets →
New repository secret**, four times:

| Name | Value |
|---|---|
| `SMOKE_STUDENT_EMAIL` | the test student's e-mail |
| `SMOKE_STUDENT_PASSWORD` | the test student's password |
| `SMOKE_TEACHER_EMAIL` | the test teacher's e-mail |
| `SMOKE_TEACHER_PASSWORD` | the test teacher's password |

Secrets are not shown in logs and are not given to pull requests from forks. Changing a password later: update the
secret too, or the „sign in” step goes red with „Vale e-post või parool”.

## Run it by hand

- GitHub → **Actions → Daily smoke (live site) → Run workflow** (branch `main`). Works once the workflow is on `main`.
- On a computer (public part only, unless you export the four `SMOKE_*` variables in that shell):

  ```bash
  cd e2e && npm ci && npx playwright install chromium
  node smoke/daily-smoke.cjs        # report in e2e/smoke/report/ (git-ignored)
  ```

GitHub turns scheduled workflows off after 60 days without any commit in a public repository; „Enable workflow” on
the Actions page turns it back on.

## Changing the check

- New public page: add a row to `pages` in `publicChecks` (URL + something that must be visible).
- New signed-in step: add `{ name, run(page) }` to `STUDENT_STEPS` / `TEACHER_STEPS`. Never click a button that
  saves, sends or starts something; the guard stops the write, but the step would test nothing real.
- A step that needs a Cloud Functions `POST` to show its page will now fail with the call listed under „writes
  stopped”: allow that exact read-only path in `readOnlyGuard` only after checking in `functions/index.js` that it
  writes nothing.
