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

## Verification required before merge

A fresh Vercel preview from the latest branch head must prove all of the following are no longer `404`:

- `/`
- `/haldus/`
- `/haldus-adaptive-lesson/`
- `/adaptive-lessons/scenes/bus-delay.jpg`

Only after those checks should a focused PR be opened to `main` and handed to the owner for merge.

## Known limitations

- Adaptive Lesson still uses a prototype student and local-only session state.
- Adaptive evidence is not persisted to Firestore.
- The reference lesson currently has one real narrative scene; scene selection is not yet data-driven per task.

## Next safe step

Move the active branch ref to the commit that removes root `public/`, verify the fresh branch deployment restores legacy static publishing and the adaptive lesson image, then open one focused routing/static-layout recovery PR to `main`.