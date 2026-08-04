# KeeleSepp CRM v2

CRM v2 is an isolated React/Vite application that replaces the legacy CRM one
module at a time. The existing `haldus.html` application remains the production
fallback and is not served or overwritten by this workspace.

## Local setup

Requirements: Node.js 22 and npm.

```bash
cd crm-v2
npm ci
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with the existing KeeleSepp Firebase **web** configuration.
The repository contains no private keys, access tokens or production secrets.
When required configuration is missing, the application shows a setup message
instead of initializing Firebase or crashing.

`VITE_SUPER_ADMIN_EMAILS` mirrors the existing server-side super-administrator
allowlist for route presentation. Firestore rules and Cloud Functions remain the
authoritative permission boundary.

`VITE_LEGACY_CRM_URL` keeps links to material tools that have not yet been
migrated on the existing production host instead of pointing them at Vercel.

## Commands

```bash
npm run dev      # local development server
npm run lint     # ESLint for src/
npm test         # Vitest component, route and service tests
npm run build    # production Vite build
npm run preview  # serve the production build locally
```

GitHub Actions runs `npm ci`, lint, build, tests and the Firebase security
regression suite for every relevant pull-request update.

## Architecture

- `src/app/` — providers, route definitions and navigation configuration.
- `src/components/ui/` — reusable controls and loading/empty/error states.
- `src/components/layout/` — the responsive authenticated application shell.
- `src/features/` — feature-owned pages and presentation logic.
- `src/services/firebase/` — the only layer allowed to call Firebase SDK APIs.
- `src/hooks/` — shared React hooks as features are migrated.
- `src/utils/` — pure role, privacy, teacher and error helpers.
- `src/styles/` — application tokens, responsive layout and component styles.

Components never call Firestore directly. Firebase initialization is lazy and
environment-driven; feature components depend on service interfaces that can be
replaced in tests.

## Authentication and roles

`AuthProvider` restores Firebase Authentication sessions and enriches them with
the matching `users/{uid}` profile and signed custom claims. Protected routes
support the canonical roles:

- `admin` — all current CRM v2 routes and student administration;
- `teacher` — only the teacher's UID-scoped students and learning data;
- `finance` — finance routes without student administration privileges;
- `student` and `parent` — authenticated shell boundaries prepared for later
  self-service modules.

Only `users.role` and signed token claims are authorization inputs. Client-owned
flags such as `isAdmin` or profile role arrays do not grant staff access.

## Firebase collections used by CRM v2

- `users` — role, display name and the authoritative teacher UID directory;
- `students` — profile, contacts, level, assignment, progress and active state;
- `schedule` — student schedule entries;
- `lessons` — completed lesson history and progress evidence;
- `invoices` — administrator-only financial summary;
- `homework` — assignments, deadlines and completion state;
- `messages` — student-linked conversations;
- `securityMigrations/teacherUidV1` — UID backfill and read-enforcement state.

The service preserves existing collection names and legacy field meanings. New
or reassigned students resolve `teacherUid` from the real staff directory; an
ambiguous teacher is rejected instead of producing an unscoped record.

## Migrated scope

CRM v2 currently includes:

- real Firestore list and profile data;
- name, phone and email search plus status, level and teacher filters;
- stable server-side `teacherUid` scoping for teacher sessions;
- desktop table, mobile cards and gradual loading;
- loading, empty, configuration and recoverable error states;
- create, edit, teacher assignment and non-destructive archive workflows;
- duplicate prevention, validation, submit locking and confirmations;
- schedule, recent lessons, progress and administrator-only finance summary;
- route, permission, service and state tests.
- a real-data dashboard with upcoming lessons and attention queues;
- week calendar with lesson creation, conflict prevention and cancellation;
- finance overview with invoice search, status filters and balances;
- teacher directory with current student and schedule workload;
- homework creation, completion, filtering and deletion;
- student-linked conversations with sending and unread counters;
- account, role and Firebase connection settings.
- a staff-only learning-library route that unifies `curriculumLessons` and
  `exercises` with searchable subject, level/age and curriculum/topic folders,
  plus UID-scoped multi-student assignment, activity logging and in-app previews
  for structured worksheets, exercises, images and PDF files;
- in-app creation and editing of legacy-compatible learning materials, including
  text, fill-in-the-blank and writing blocks with auditable Firebase writes.

## Migration and deployment status

The production teacher UID backfill has completed and a repeated preview reports
no pending mappings or conflicts. Two students with no assigned teacher remain
intentionally administrator-only. Strict teacher reads remain disabled until
the externally hosted legacy CRM build and every active teacher account pass the
manual checklist in [ACCEPTANCE.md](./ACCEPTANCE.md).

The isolated preview is available at
[keelesepp-crm-v2.vercel.app](https://keelesepp-crm-v2.vercel.app). Vercel uses
`crm-v2/` as the project root and does not replace `www.epkoolitus.ee`.

## Known limitations

- The legacy CRM is still the production source of truth outside Students.
- Advanced material blocks, file uploads, exercise editing and classroom
  publishing still open the existing legacy tools while those workflows are
  migrated into the v2 feature modules.
- Teacher read enforcement is deliberately off until the role-based production
  smoke test is complete; its rollback endpoint remains available.
- React Router 7.18.2 is pinned. The current npm advisory affects React Server
  Components action handling; CRM v2 is a client-only BrowserRouter SPA and does
  not enable RSC or server actions. Downgrading would reintroduce older XSS/RCE
  advisories, so the dependency must be upgraded when a fixed release is
  published.
- Firebase's browser bundle is isolated into its own build chunk but remains the
  largest client asset.

The legacy CRM remains available as a rollback path while CRM v2 is rolled out.
Complete the role-based checks in `ACCEPTANCE.md` before enabling strict teacher
reads or retiring `haldus.html`.
