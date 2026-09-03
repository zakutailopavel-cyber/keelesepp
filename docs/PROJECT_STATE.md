# KeeleSepp Project State

Last verified: 2026-09-03, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `91703ec1195a098ebc2a6cec2c5ab735c90f556f` (`Adaptive Lesson Mode + real scene artwork (#80)`)
Active branch: `agent/adaptive-lesson-route-fix`

## Current objective

Restore the legacy/root KeeleSepp deployment after PR #80 introduced a top-level `public/` directory that changed static publishing behavior, while preserving the adaptive Lesson Mode and its real narrative scene.

The legacy/root project is the production foundation. `crm-v2` remains separate and is not the target of this work.

## Incident

After PR #80 merged, the Vercel `keelesepp` production deployment was `READY`, but root static routes such as `/`, `/haldus/`, and `/haldus-adaptive-lesson/` returned `404 NOT_FOUND`. Build logs showed only API/serverless function compilation.

The regression correlated with the first introduction of a repository-root `public/` directory containing only `public/adaptive-lessons/scenes/bus-delay.jpg`. In the framework-less legacy Vercel project, this changed which files were treated as static output, leaving the historical root HTML site unreachable.

## Fix on active branch

- keep the first/legacy CRM architecture as the source of truth;
- add explicit `/haldus-adaptive-lesson` and `/haldus-adaptive-lesson/` rewrites to `haldus-adaptive-lesson/index.html`;
- remove the repository-root `public/` directory;
- reuse the same approved image blob at `adaptive-lessons/scenes/bus-delay.jpg`;
- keep Lesson Mode referencing `/adaptive-lessons/scenes/bus-delay.jpg`;
- do not touch `crm-v2`, Firestore, finance, calendar, or Live Classroom behavior.

## Verification

Latest preview deployment: `dpl_8dKhc55i98bUbuTpSt5WJuBG4HQZ`, commit `4cc8d2070ef2ae41ee5efd4e317892f29c6bb32a`, state `READY`.

The following preview routes all resolve through Vercel Protection with `302` rather than `404`, proving the deployment output contains and routes the legacy static site again:

- `/`
- `/haldus/`
- `/haldus-adaptive-lesson/`
- `/adaptive-lessons/scenes/bus-delay.jpg`

No production deployment, Firestore write, migration, finance/calendar change, or `crm-v2` modification was performed by this recovery branch.

## Known limitations

- Adaptive Lesson still uses a prototype student and local-only session state.
- Adaptive evidence is not persisted to Firestore.
- The reference lesson currently has one real narrative scene; scene selection is not yet data-driven per task.

## Next safe step

Open one focused recovery PR to `main`. After owner merge, verify production `/`, `/haldus/`, `/haldus-adaptive-lesson/`, and the scene asset before continuing adaptive lesson feature work.