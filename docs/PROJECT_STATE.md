# KeeleSepp Project State

Last verified: 2026-09-03, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `d1ec40a40ccbe13153100f9d28c0b3d2cfeac0c3` (`Adaptive lesson foundation (#77)`)
Active branch: `agent/adaptive-lesson-teacher-ui`
Draft PR: `#79 Adaptive lesson focused Lesson Mode`

## Current objective

Make the adaptive lesson feel like a focused KeeleSepp teaching product rather than a generic SaaS dashboard, with purposeful illustrated teaching scenes and a separate compact mobile interaction model.

No Firestore, finance, calendar, curriculum generation or Live Classroom behavior is changed in this branch.

## Work completed

### Lesson Mode v4

Rebuilt `haldus-adaptive-lesson/index.html` around owner feedback from real desktop/mobile screenshots.

Key changes:

- KeeleSepp visual language: cream background, dark navy, gold accents, serif display typography and quieter cards;
- desktop reduced from three permanent teaching columns to two persistent zones: compact stages + one central activity;
- vocabulary no longer occupies a permanent right column;
- `Sõnad` opens vocabulary in a drawer only when needed;
- `Veel` opens goal/methodical guidance on demand;
- current activity remains visually dominant;
- expected answer is quieter than the student task;
- semantic teacher judgement remains `Vajab abi / Sai hakkama / Liiga kerge`;
- detailed mastery remains only in the final summary;
- mobile layout is explicitly compact rather than a wrapped desktop grid.

### Lesson scene direction approved

Owner approved a full narrative cartoon/caricature treatment instead of emoji placeholder art. `docs/LESSON_SCENE_STANDARD.md` now defines the reusable visual and pedagogical contract.

The approved direction uses expressive believable characters, real-life context, environmental clues, soft KeeleSepp-compatible colors and a wide scene that actively supports speaking/problem-solving. One scene should normally serve support/core/advanced routes; difficulty changes through instructions and scaffolding.

A reference delayed-bus scene was generated during design review. It is currently a conversation design asset, not yet a repository-hosted production asset. Do not claim the emoji placeholder has been replaced until the image is stored through an approved repository/storage path and wired into Lesson Mode.

### Adaptive behavior retained

Teacher judgement still moves one step toward support/advanced or keeps the current route. CEFR/category never changes because of the route. Vocabulary can still be marked difficult/known and passed to local handoff generation.

## Files changed in PR #79

- `haldus-adaptive-lesson/index.html`
- `adaptive-lesson-ui.test.js`
- `docs/ADAPTIVE_LESSON_SYSTEM.md`
- `docs/LESSON_SCENE_STANDARD.md`
- `docs/PROJECT_STATE.md`

## Data/schema changes

None. Session state remains local-only and the student remains a prototype placeholder. A future lesson blueprint should support a stable scene record (`id`, asset reference, `alt`, pedagogical purpose and optional focus vocabulary IDs).

## Verification

- PR #79 remains draft.
- V4 UI was manually reviewed by the owner on desktop; visual direction is improving but emoji placeholder scenes were rejected.
- The narrative cartoon/caricature scene direction was explicitly approved by the owner.
- No production deploy, Firebase write, migration or paid external API integration was performed.

## Known limitations

- current Lesson Mode code still renders emoji placeholder art; approved generated reference scene is not yet repository-hosted;
- no real selected CRM student yet;
- no adaptive evidence persistence yet;
- vocabulary audio/material actions are not connected;
- semantic route thresholds still need pedagogical validation before persistence.

## Next safe step

Add a repository/storage-backed lesson-scene asset path and wire the approved delayed-bus illustration into the reference lesson, with responsive rendering and alt text; keep persistence and CRM-student integration out of that change.