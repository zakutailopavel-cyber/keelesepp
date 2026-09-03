# KeeleSepp Project State

Last verified: 2026-09-03, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `d1ec40a40ccbe13153100f9d28c0b3d2cfeac0c3` (`Adaptive lesson foundation (#77)`)
Parent UI branch: `agent/adaptive-lesson-teacher-ui` / draft PR #79
Active branch: `agent/adaptive-lesson-scenes`

## Current objective

Integrate purposeful KeeleSepp cartoon/caricature scenes into adaptive lessons without changing Firestore, finance, calendar, Live Classroom or production student data.

## Work completed

### Lesson Mode v4 inherited

The branch inherits the KeeleSepp branded Lesson Mode from `agent/adaptive-lesson-teacher-ui`: compact stages, dominant current activity, vocabulary drawer, hidden methodology, semantic judgements (`Vajab abi / Sai hakkama / Liiga kerge`) and compact mobile mode.

### Real lesson scene asset added

The approved delayed-bus cartoon was converted to a compact repository asset and committed at:

- `public/adaptive-lessons/scenes/bus-delay.jpg`

The binary was added through the Git data/blob API, not as base64 embedded in HTML.

### Lesson Mode scene wired

`haldus-adaptive-lesson/index.html` now renders the repository-backed JPG through a real `<img>` instead of the previous emoji collage.

Rendering contract:

- desktop: wide `16/7` scene area;
- mobile: `4/3` scene area;
- `object-fit: cover` with centered crop;
- meaningful Estonian `alt` text;
- rounded border and quiet shadow consistent with KeeleSepp UI.

The current reference page still uses one scene for all activities. This is deliberate for the first vertical proof; per-activity scene metadata is the next data-model step.

### Scene standard

`docs/LESSON_SCENE_STANDARD.md` defines the approved visual/pedagogical standard: narrative educational cartoon/caricature scenes, believable people and emotions, useful environmental clues, KeeleSepp-compatible palette, no production emoji placeholders, and normally one scene reused across support/core/advanced routes with difficulty changed through scaffolding.

## Files changed on this branch

- `public/adaptive-lessons/scenes/bus-delay.jpg`
- `haldus-adaptive-lesson/index.html`
- `docs/PROJECT_STATE.md`

Inherited but not newly changed here:

- `docs/LESSON_SCENE_STANDARD.md`
- `docs/ADAPTIVE_LESSON_SYSTEM.md`
- `adaptive-lesson-ui.test.js`

## Data/schema changes

None. No Firestore collection/rule/migration change.

Future lesson data should support a stable scene record with at least `id`, asset reference, `alt`, pedagogical purpose and optional focus vocabulary IDs.

## Verification

- JPG blob creation succeeded in GitHub and was committed into the branch tree.
- `haldus-adaptive-lesson/index.html` now references `/adaptive-lessons/scenes/bus-delay.jpg`.
- No production deployment or database write was performed.
- A fresh Vercel preview/manual browser check is still required for this branch head.

## Known limitations

- one scene is currently reused for every activity in the reference lesson rather than selected from activity metadata;
- no real CRM student is connected;
- no adaptive evidence persistence;
- vocabulary audio/material actions are not wired;
- scene-generation workflow is not automated yet.

## Next safe step

Verify the fresh Vercel preview on desktop and phone. If the asset renders correctly, add per-activity `scene` metadata to the reference lesson blueprint and make Lesson Mode select the scene from lesson data instead of a hardcoded path.