# CRM v2 migration plan (v1 → v2)

Status: plan, 2026-09-29. Owner decision of the same day is binding; everything else is a proposal until done.

## Owner decision (2026-09-29)

**Worksheet Studio is the only authoring tool.** Its visual level matches the approved hand-drawn v1 worksheets,
so no other builder is ported to v2 or developed further:

| Tool | Where | Decision |
|---|---|---|
| Worksheet Studio (`/library/worksheets/*`) | v2 | **the** builder for worksheets, exercises, homework, live lessons and the textbook |
| "Valmista tund" Lesson Builder (`haldus-lesson-builder`, cloud drafts, publish, lesson assignments) | v1 | retire: no port; stop new authoring |
| Worksheet Builder (`haldus-worksheet`) | v1 | retire |
| Exercise builder inside v1 Õppevara (`haldus-exercises`) | v1 | retire |
| "Loo materjal" worksheet blocks (`MaterialEditor`, `worksheetData`) | v2 | keep only metadata + attachments (lesson plans, files); worksheet content goes to the studio |
| "Loo harjutus" (`ExerciseEditor`, `exercises`) | v2 | retire for new content; a single exercise is a one-task studio worksheet |

Content already made with those tools is **not** lost:
- v1 `worksheetData` worksheets open converted in the studio (legacy adapter, #184);
- image/PDF worksheets move through "Üleviimine" (#186);
- existing exercises and published lesson assignments stay playable until finished (see step 3).

No data migration is needed: v1 and v2 use the same Firebase project and collections; Google Calendar sync runs
server-side (`syncScheduleToGoogle` trigger on `schedule`), so lessons created in v2 sync as before.

## What v2 already covers

Students (one child, several learning directions), parents, groups, teachers, calendar with quick attendance,
finance (invoices, payments, expenses, payroll and work time), communication (Facebook in/out), Õppevara + Worksheet
Studio, homework with structured worksheets, Live Classroom (invitations, video, presence, screen share, board,
worksheet in the room), student and parent cabinets.

## Remaining v1 functions (after the decision)

**Owner decision 2026-09-29: v2 is not a port of v1.** v1 was overloaded; a v1 function moves to v2 only when daily
work shows it is needed. The list below is a list of candidates, not a to-do list.

Builders are removed from the list. What is left, in priority order:

1. **Playing already issued v1 content** — published lesson assignments (e.g. the A2 assignment with 32 activities)
   and v1 exercises assigned as homework. Needed only until they are finished.
2. **"Minu tööpäev" / curriculum next step** (Teacher Home, curriculum goals, learning profile). Rebuild on the new
   base: a curriculum step points to studio worksheets; evidence comes from `score.perGoal` of worksheet assignments.
3. **Initial level test** (`tasemetest`).
4. **Student board outside the lesson** (`haldus-whiteboard`).
5. **Team tasks** (Ülesanded), **notification centre**.
6. **Admin tools**: Andmebaas, Töökindlus, Juhi abi, Tegevused (activity log viewer).

Adaptive lesson mode (`haldus-adaptive-lesson`, blueprints written by developers) is a delivery mode, not a teacher
builder. Open question for the owner: keep it as is, or rebuild adaptive routes on top of studio worksheets later.

## Steps

1. **Freeze old builders (small PR).** In v2: hide the worksheet-block part of "Loo materjal" and the "Loo harjutus"
   button (existing items stay viewable and assignable); in v1: label "Valmista tund", Worksheet Builder and the
   exercise builder "vana — kasuta Töölehe konstruktorit" with a link to v2. No data change.
2. **Role smoke (owner, ~30 min).** Administrator, teacher, parent, student log into v2 and follow the checklist in
   `docs/CRM_V2_READINESS.md` (gate 5). Instagram outbound stays a known gap.
3. **v2 becomes the default for staff.** Calendar, students, finance, Õppevara/studio, homework, Live Classroom.
   Links in the v2 menu open the remaining v1 functions (list above) until they are replaced. Students keep a link
   to their unfinished v1 lesson assignments; no new v1 assignments are created.
4. **Content move.** Convert image worksheets through "Üleviimine" by priority (the courses running now first).
   Progress is visible on that page.
5. **Replace remaining v1 functions** in the order of the list above, each as its own PR.
6. **Retire v1** after 2–3 weeks of daily work without going back to v1, and once all issued v1 assignments are
   finished or expired. v1 stays reachable read-only for one more month, then is switched off.

## Domain switch (owner decision 2026-09-29: v2 becomes the main CRM address)

Today one Vercel project (`keelesepp`, v1) serves both the school website and the old CRM on `www.epkoolitus.ee`,
`epkoolitus.ee` and `crm.epkoolitus.ee`. The switch moves **only `crm.epkoolitus.ee`** to the `keelesepp-crm-v2`
project:

| Address | After the switch |
|---|---|
| `crm.epkoolitus.ee/` | CRM v2 (login, registration at `/registreeru`, cabinets) |
| `crm.epkoolitus.ee/haldus…`, `/tasemetest`, `/kutse`, `/privaatsus`, `/tingimused`, `/interactive-lesson/…` | temporary (307) redirect to the same path on `www.epkoolitus.ee`, so old bookmarks, registration links (`/haldus#registreeru`) and v1-only tools keep working |
| `www.epkoolitus.ee` | unchanged: school website + v1 CRM at `/haldus` (fallback and remaining v1 tools) |

Ready in code (PR "v2 registration + legacy redirects"): self-registration for parents and students (same profile and
terms fields as v1, server account bootstrap links the student card), password reset from the login page, a new Google
account is asked for role + terms instead of landing on "Ligipääs puudub", redirects in `crm-v2/vercel.json`.

**Done 2026-09-29 (Claude, owner's word «меняем в2 на основной домен»):** steps 1–3 below. The v2 production build was
promoted from the PR preview (production builds were rate-limited); `crm.epkoolitus.ee` removed from `keelesepp` and
added to `keelesepp-crm-v2` (Valid Configuration); `crm.epkoolitus.ee` added to Firebase Authorized domains. Checked:
`/` opens v2 login, `/registreeru` opens registration, `/haldus` and `/haldus#registreeru` land on `www.epkoolitus.ee`.
Rollback: move the domain back to project `keelesepp` in Vercel → Domains. Step 4 (role smoke with real accounts) and
step 5 are still open.

Order (each step reversible by moving the domain back in Vercel):
1. The v2 production deployment that contains the PR above is live (check `/registreeru` on the v2 address).
2. Vercel → project `keelesepp` → Domains: remove `crm.epkoolitus.ee`; project `keelesepp-crm-v2` → Domains: add it.
   DNS already points `crm` at Vercel, so no DNS change is needed.
3. Firebase Authentication → Authorized domains: `crm.epkoolitus.ee` must be listed (it is used by v1 today).
4. Smoke on `crm.epkoolitus.ee`: login (email + Google), `/registreeru`, `/haldus` redirect, student `/student`,
   parent `/parent`, Live Classroom video.
5. After the switch (functions deploy, owner's word): e-mail button "Ava KeeleSepp kabinet" and invoice e-mails still
   use `APP_BASE_URL` = `www.epkoolitus.ee/haldus/` (v1). Point the cabinet link at `https://crm.epkoolitus.ee/`,
   but keep the Google Calendar OAuth return on v1 until v2 has its own "connect Google Calendar" screen.

**Also done 2026-09-29:** website buttons (header "Logi sisse"/"Registreeru", footer "Õpilase konto", level test
"Logi sisse") open `crm.epkoolitus.ee`; v1 (`/haldus`) shows a closable banner pointing to `crm.epkoolitus.ee`; the
Vercel project `keelesepp` (v1 + website) is **disconnected from GitHub** to save the free deploy quota. To publish a
website/v1 change: Vercel → keelesepp → Settings → Git → connect GitHub → Deployments → Create Deployment (`main`,
production) → disconnect again.

**Release process (owner decision 2026-09-29): batch releases, no automatic Vercel builds.** Both Vercel projects
(`keelesepp-crm-v2` for crm.epkoolitus.ee and `keelesepp` for www.epkoolitus.ee + v1) are disconnected from GitHub, so
pushes and merges no longer spend the free plan's 100 deployments/day. Work is checked locally (tests, lint, build,
local preview) and merged to `main` as usual; a release is then published once: Vercel → project → Settings → Git →
connect GitHub → Deployments → ⋯ → Create Deployment → `main` → Deploy to Production → disconnect again. Firebase
rules/functions are deployed separately with the owner's word.

Faster path (used 2026-09-30, no GitHub reconnect needed): from a clean checkout of `main`
(`git worktree add <dir> origin/main`, so no local `.env` or harness files are uploaded) run
`npx vercel link --yes --project keelesepp-crm-v2` and `npx vercel deploy --prod --yes` in the repo root (the project's
Root Directory is `crm-v2`; Vercel builds it with the project's env vars and aliases crm.epkoolitus.ee).

**Release 2026-09-30** (owner's /goal "довели до конца и сливай в мэйн и Версали"): PRs #209–#212 — Worksheet Studio
v2 (block size, task options, teacher marks, fill + add item), Finance v2 (private lesson price + "Arveldus" card,
monthly invoices tab "Kuuarved", no-show exceptions, three finance tabs), duplicates (permanent merge, manual pick,
purge of archived duplicates; the v2 tool now calls `staffOperationsApi`). Deployed: Firestore rules, functions
`financeApi`, `staffOperationsApi`, `manualInvoiceApi`, `invoiceApi`, and crm.epkoolitus.ee. Owner's one-time steps
after the release: Finantsid → "Vii hinnad üle"; Õpilased → "Kontrolli duplikaate" (earlier archived duplicates → type
KUSTUTA); set price and billing mode in each student's profile (Finantsid → Arveldus).

## Still needed before v1 can be switched off (checked 2026-09-29)

Blocking for daily work in v2 only:
- Vercel paid plan (or fewer deploys): the free build limit delays every production fix by up to 24 h.
- Role smoke by the owner (step 2 above), then real lessons in v2 for 2–3 weeks.
- Storage CORS (`gsutil cors set storage.cors.json gs://keelesepp-5136b.firebasestorage.app`), needed for photo
  cutting in the studio.
- TURN server for Live Classroom video on strict networks.

Blocking for switching v1 off (can wait, v1 stays at `www.epkoolitus.ee/haldus`):
- Google Calendar connect screen in v2 — built (Seaded → Google Calendar, PR #214);
  done for v1 switch-off once `gcalApi` is deployed with the `returnTo` support.
- Remaining v1 functions list above (Minu tööpäev/curriculum, level test, board outside the lesson, team tasks,
  notification centre, admin tools) and playing issued v1 lesson assignments.
- Instagram outbound messages.
- E-mail links (`APP_BASE_URL`) moved to v2.

## Risks

- Vercel free plan hit its build limit several times on 2026-09-29: production updates may be delayed; consider a
  paid plan before v2 becomes the default.
- Photo cutting from Storage originals needs one-time bucket CORS (`storage.cors.json`).
- Live Classroom video without a TURN server may fail on strict networks.
