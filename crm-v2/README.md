# KeeleSepp CRM v2

A separate React/Vite workspace for rebuilding the CRM without disrupting the current production interface.

## Run locally

```bash
cd crm-v2
npm ci
cp .env.example .env
npm run dev
```

Use the existing KeeleSepp Firebase web configuration in `.env`. Real values are
not committed. Without configuration the application renders an explicit setup
message instead of crashing.

## Verify

```bash
npm run lint
npm run build
npm test
```

## Acceptance deployment

The dedicated CRM v2 deployment is available at
[keelesepp-crm-v2.vercel.app](https://keelesepp-crm-v2.vercel.app). The Vercel
project uses `crm-v2/` as its root directory and does not change the legacy
`www.epkoolitus.ee` project. Firebase web configuration is stored in Vercel
environment variables, not in Git.

Use [ACCEPTANCE.md](./ACCEPTANCE.md) for the role-based manual smoke test.

## Current scope

- new application shell
- responsive sidebar and top navigation
- role-aware authentication and protected routes
- modular Firebase services (no Firestore calls from components)
- real `students` collection list, filters, gradual loading and profile route
- create, edit and non-destructive archive student workflows
- teacher-scoped student visibility compatible with legacy teacher aliases
- student schedule, progress and administrator-only financial summary
- legacy hidden-field handling and duplicate-student protection
- shared UI primitives and explicit loading, empty and error states
- placeholder boundaries for the remaining feature migrations

## Migration rule

The current CRM remains the source of truth until individual v2 modules are connected to Firebase and validated. No existing production routes are replaced by this workspace yet.
