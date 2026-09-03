# KeeleSepp Project State

Last verified: 2026-09-03, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `d1ec40a40ccbe13153100f9d28c0b3d2cfeac0c3` (`Adaptive lesson foundation (#77)`)
Active branch: `agent/adaptive-lesson-teacher-ui`
Draft PR: `#79 Adaptive lesson focused Lesson Mode`

## Current objective

Make the adaptive lesson feel like a focused KeeleSepp teaching product rather than a generic SaaS dashboard, with a separate compact mobile interaction model.

No Firestore, finance, calendar, curriculum generation or Live Classroom behavior is changed in this branch.

## Work completed

### Lesson Mode v4

Rebuilt `haldus-adaptive-lesson/index.html` around the owner feedback from real desktop/mobile screenshots.

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
- mobile layout is explicitly compact rather than a wrapped desktop grid: numbered stage strip, reduced header, compact judgement buttons and bottom floating actions.

### Adaptive behavior retained

Teacher judgement still moves one step toward support/advanced or keeps the current route. CEFR/category never changes because of the route. Vocabulary can still be marked difficult/known and passed to local handoff generation.

## Files changed in PR #79

- `haldus-adaptive-lesson/index.html`
- `adaptive-lesson-ui.test.js`
- `docs/ADAPTIVE_LESSON_SYSTEM.md`
- `docs/PROJECT_STATE.md`

## Data/schema changes

None. Session state remains local-only and the student remains a prototype placeholder.

## Verification

- PR #79 remains draft.
- V4 page and static contract test were committed to `agent/adaptive-lesson-teacher-ui`.
- `adaptive-lesson-ui.test.js` now asserts the two-zone/drawer model, semantic judgements, hidden methodology, dedicated mobile compact rules, vocabulary evidence and missing-mastery semantics.
- A fresh Vercel preview/manual browser review is required for the v4 head before approval.
- No production deploy, Firebase write, migration or paid API call was performed.

## Known limitations

- city illustration is still placeholder CSS/emoji art;
- no real selected CRM student yet;
- no adaptive evidence persistence yet;
- vocabulary audio/material actions are not connected;
- semantic route thresholds still need pedagogical validation before persistence.

## Next safe step

Review v4 in the fresh Vercel preview on both desktop and phone. If the visual/interaction direction is accepted, connect one selected CRM student in read-only mode next; do not add persistence yet.