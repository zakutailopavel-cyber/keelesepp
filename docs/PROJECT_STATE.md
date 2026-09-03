# KeeleSepp Project State

Last verified: 2026-09-03, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `d1ec40a40ccbe13153100f9d28c0b3d2cfeac0c3` (`Adaptive lesson foundation (#77)`)
Active branch: `agent/adaptive-lesson-teacher-ui`
Draft PR: `#79 Adaptive lesson teacher-first UI`

## Current objective

Replace the visually busy adaptive-teacher dashboard prototype with a focused **Lesson Mode** where the current teaching task dominates and unrelated CRM/navigation/analytics disappear during the lesson.

This branch intentionally does **not** change Firestore, production data, lesson accounting, calendar behavior, curriculum generation or Live Classroom.

## Verified repository context

PR #77 is merged into `main` and provides the adaptive decision/mastery/handoff core, one B1 reference blueprint, the local adaptive lesson route, tests, documentation and repository handoff rules.

The first two UI prototypes were manually reviewed by the owner. Feedback on v2: still too dashboard-like, too many equally loud blocks, weak visual hierarchy and too much interface around the actual teaching action.

## Work completed on this branch

### Focused Lesson Mode v3

`haldus-adaptive-lesson/index.html` was rebuilt again rather than cosmetically patched.

The live lesson now removes the fake CRM navigation rail, reports/settings links, large management header, persistent summary strips and permanent recommendation panels.

Desktop layout now has only three persistent zones:

- compact lesson stages on the left;
- one large current activity in the centre;
- a narrow current-vocabulary/tool panel on the right.

The top bar contains only back, KeeleSepp identity, lesson/student context, elapsed time, a small route indicator and `Lõpeta tund`.

### One activity at a time

Diagnostic items and route-specific stage tasks are flattened into a single sequence. The centre workspace renders one current activity only.

Each activity exposes:

- current prompt/task;
- brief situation/context;
- a large quiet visual area;
- expected answer/direction for the teacher;
- optional `Õpetaja abi`, hidden by default;
- one three-choice teacher judgement;
- previous/next navigation.

### Simplified adaptive interaction

The live lesson uses only:

- `Vajab abi`;
- `Sai hakkama`;
- `Liiga kerge`.

The route changes one step toward support/advanced or stays unchanged. A route change is shown as a short transient notice instead of a permanent analytics block.

No percentage, attempts or hint counters are shown during normal teaching.

### Vocabulary

Only the first six active words are visible by default. The full lesson vocabulary is available with one button. Words can still be marked difficult/known for later handoff evidence.

### End-of-lesson detail

Detailed mastery remains outside the live flow and appears only in the final summary. Empty mastery fields are omitted rather than converted to zero.

### Tests and documentation

`adaptive-lesson-ui.test.js` now asserts the focused Lesson Mode contract: no CRM navigation during teaching, one activity, three semantic judgements, hidden methodical help, limited default vocabulary and mastery only at the end.

`docs/ADAPTIVE_LESSON_SYSTEM.md` now defines Lesson Mode as the canonical teacher UX direction.

## Files changed in PR #79

- `haldus-adaptive-lesson/index.html`
- `adaptive-lesson-ui.test.js`
- `docs/ADAPTIVE_LESSON_SYSTEM.md`
- `docs/PROJECT_STATE.md`

## Data/schema changes

None.

No Firestore collection, security rule, migration or production record is changed.

## Safety and known limitations

- Session state is local only.
- Student identity is still the prototype placeholder.
- The city visual remains CSS/emoji placeholder art, not a real lesson asset.
- Vocabulary audio is not implemented.
- Materials/worksheet actions are not wired to the library yet.
- Route transitions from semantic teacher judgement remain intentionally simple and must be reviewed before persistence.
- Reference lesson remains outside the generated curriculum dataset.

## Verification

- PR #79 remains draft and mergeable.
- The branch is based on verified main `d1ec40a...`.
- Vercel preview existed for the earlier v2 commit and returned HTTP 200.
- v3 changed the page after that preview; a fresh Vercel preview/manual browser review is required before approval.
- Static UI contract tests were updated, but no full repository checkout/test run is claimed in this session.
- No production deploy, Firebase write, migration or paid API call was performed.

## Unfinished work

The v3 Lesson Mode needs fresh Vercel preview/manual review. It is not connected to a real selected CRM student and does not persist adaptive evidence.

## Next safe step

Verify the fresh Vercel preview for PR #79 on desktop. If the focused Lesson Mode direction is accepted, only then connect one selected CRM student in read-only mode; do not add persistence yet.
