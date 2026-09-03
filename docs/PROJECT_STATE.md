# KeeleSepp Project State

Last verified: 2026-09-03, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `d1ec40a40ccbe13153100f9d28c0b3d2cfeac0c3` (`Adaptive lesson foundation (#77)`)
Active branch: `agent/adaptive-lesson-teacher-ui`
PR: not opened yet at the time of this state update

## Current objective

Turn the adaptive lesson prototype into a teacher-first live lesson workspace that uses the full desktop width and hides unnecessary algorithmic controls from the teacher.

This branch intentionally does **not** change Firestore, production data, lesson accounting, calendar behavior, curriculum data generation or Live Classroom.

## Verified repository context

PR #77 has been merged into `main`. The merged foundation contains:

- `adaptive-lesson-core.js` pure decision/mastery/handoff logic;
- `adaptive-lessons/est-b1-city-problem-solving.js` reference B1 blueprint;
- `haldus-adaptive-lesson/index.html` local-state teacher prototype;
- core/UI tests;
- adaptive architecture documentation;
- root `AGENTS.md` handoff rules.

The previous prototype was deployed and manually viewed by the owner. Main UX feedback: too much unused horizontal space and the live screen looked like an algorithm/configuration form rather than a teacher workspace.

## Work completed on this branch

### Teacher-first workspace redesign

Reworked `haldus-adaptive-lesson/index.html` around the accepted teacher mockup.

Desktop structure is now:

- compact dark KeeleSepp navigation rail;
- lesson/student/goal/time/current-route header;
- left lesson-stage navigation;
- wide central current-activity workspace;
- right active-vocabulary and teacher-tools panel.

The previous narrow centred container was removed.

### Simplified adaptive interaction

The live lesson no longer asks the teacher to enter stage percentage, attempt count and hint count.

Diagnostic and stage decisions now use three clear teacher judgements:

- `Vajab abi` — needs help;
- `Sai hakkama` — managed;
- `Liiga kerge` — too easy.

The semantic judgement changes the route one step toward support/advanced or keeps the current route. The numerical adaptive core remains available for future evidence/analytics and is not deleted.

### Diagnostic flow

Diagnostic questions are shown one at a time with:

- prompt;
- acceptable example answer;
- teacher note;
- optional hint;
- one-click teacher judgement;
- previous/next controls;
- progress and current route recommendation.

### Lesson stages

Each lesson stage displays only the current route variant with teacher instruction, tasks, optional success criterion and a final three-choice judgement.

### Vocabulary evidence

Lesson-specific vocabulary stays visible in the right panel. A teacher can cycle a word between unassessed, difficult and known. Marked words are included in the local handoff evidence.

### End-of-lesson detail

Detailed mastery inputs were moved out of the main flow into the final lesson summary. Empty mastery fields remain absent rather than becoming zero.

### Documentation

Updated `docs/ADAPTIVE_LESSON_SYSTEM.md` with a teacher UX contract: the primary live screen is an interactive teacher textbook/control panel, while technical scoring remains an implementation detail.

## Files changed

- `haldus-adaptive-lesson/index.html`
- `adaptive-lesson-ui.test.js`
- `docs/ADAPTIVE_LESSON_SYSTEM.md`
- `docs/PROJECT_STATE.md`

## Data/schema changes

None.

No Firestore collection, security rule, migration or production record is changed by this branch.

## Safety and known limitations

- Session state is still local only.
- Student identity remains the prototype placeholder.
- Tool buttons for materials/print/worksheet are visual placeholders except note/guide/end-session behavior.
- Audio icons beside vocabulary are visual only; no speech/audio service is called.
- The city scene is a CSS/emoji illustration, not a stored lesson asset yet.
- The current route transition from teacher judgement is intentionally simple and must be pedagogically reviewed before persistence.
- Existing reference lesson blueprint remains outside the generated curriculum dataset.

## Verification

- The branch was created directly from verified main `d1ec40a...`.
- `adaptive-lesson-ui.test.js` was updated to assert the teacher-first layout and interaction contract.
- No full repository test execution is claimed yet in this state entry.
- No production deploy, Firebase write, migration or paid API call was performed.

## Unfinished work

The redesigned screen still needs a Vercel preview/manual browser review. It is not connected to a real selected CRM student and does not persist adaptive evidence.

## Next safe step

Open a draft PR, verify the Vercel preview and manually review the redesigned teacher workspace on desktop before connecting any real CRM student or adding persistence.
