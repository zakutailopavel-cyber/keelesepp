# Interactive Lesson v1 — living handoff

Status: IN PROGRESS, not production-ready. This file is updated during implementation;
PROJECT_STATE.md and fresh GitHub main remain authoritative.

## Owner objective and constraints
Deliver practical teacher authoring and actual student completion now: short/long text,
single/multiple choice, gaps, resume, explicit submit, teacher review/feedback.
Improve Builder through real fillable blocks, not a separate mock editor. Canva-level ease
is a longer-term target, not a claim about this first slice.
Owner explicitly requested a handoff before context/usage limits so another agent can continue.
No automatic merge, Firebase production deploy, migration, synthetic student evidence,
skillMap/mastery/credit writes, or changes to existing completed LearningSessions.
Automatic GitHub Vercel previews allowed; production deployment only after owner merge.

## Verified starting point
Main d2bf81108c43b0d2a665c8688e6d765429037058; PR102 merged.
Branch agent/interactive-lesson-v1, worktree /tmp/keelesepp-interactive-v1.
Owner supplied successful deployment screenshot for lessonDraftsApi and firestore.rules.
That proves owner-reported deployment, NOT an authenticated cloud lifecycle smoke.
Previous PR102 CI: 470 pass; no new tests have run in this workstream yet.
No production data modified during this workstream.

## Preflight completed
Read AGENTS.md, current PROJECT_STATE, architecture cloud section, normalized and authoring
contracts, draft Function and ownership rule references. Fresh remote main checked.
Open independent PRs: 83 layout,78 retry,74 calendar,72 ERP spike,71 finance.
Potential shared export/workflow touch points must remain additive; do not mix their changes.

## Intended boundaries and design (not yet implemented)
- Pin lessonId + immutable lessonVersionId in a separate interactive assignment/attempt.
- Never put a mutable cloud draft in LearningSession or retrofit completed sessions.
- Extend optional response metadata, preserving activity and choice/gap IDs across routes.
- Student projection must explicitly exclude expected answers, evaluation keys and teacher notes.
- Trusted authenticated server resolves actual student ownership using existing CRM mapping;
  never trust a submitted uid/studentId or email match without verifying existing conventions.
- Revision-checked answer saves, active -> submitted -> reviewed transitions, no autoscore/mastery.
- Preview uses local ephemeral responses and makes no student/session writes.
- local recovery must be scoped by assignment + authenticated UID, not shared browser identity.

## Next implementation sequence
1. Read full ownership/auth architecture and related assignment UI, plus special docs.
2. Define/test pure response contract and student projection for text/choice/gaps.
3. Integrate teacher-friendly answer configuration + interactive local preview in Builder.
4. Implement authenticated assignment/attempt API + direct-client deny rules + emulator tests.
5. Student runner/review UI, exact immutable version reopening and conflict handling.
6. Full regression and browser tests; draft PR; update PROJECT_STATE and this handoff.
7. Stop at explicit Firebase permission gate with exact deploy scope and results.

## Acceptance still outstanding
All new feature acceptance is pending: authored form blocks, student access/ownership,
answers/resume, submit/review, server enforcement, browser flow, CI, preview and production smoke.
Do not describe planned functionality as implemented. No new Function deployed.

## Exactly one next safe step
Implement and test the pure response contract and answer-safe student projection after checking
existing student ownership mapping; preserve root normalized contract compatibility.

## Implementation checkpoint (supersedes initial not-yet-implemented list)
Pure `interactive-lesson-core.js` + server copy added: five modes, exact field IDs,
answer validation, allowlisted student projection, student-only UID mapping (no parent aliases).
6 new core tests pass; combined normalization/authoring/UX/core run 40/40 pass.
Builder responses.js mounts on editor render and uses existing undo/commit/autosave boundary.
Inline interactive preview shares response renderer and is ephemeral. Existing sticky lesson
preview is still presentation-only: connecting fillable controls there remains outstanding.
New interactiveLessonApi code and interactiveAssignments direct-deny rule added, NOT DEPLOYED.
Endpoints: students/list/assign/get/save/submit/review. Assignment pins immutable version,
strict teacherUid student scope, explicit linked active student account, revision checks.
New interactive-lesson/ runner/review page implemented but not yet browser/emulator verified.
Student roster UI replaces manual student ID; listing assignments currently first 50 with notice.
Cloud publication additionally validates response metadata on server.

Outstanding before ready: emulator lifecycle/security tests, browser test coverage and actual UI
inspection, regression suite/CI, fix all findings, improve stale local recovery notice and ensure
account-switch/in-flight-save safety. Draft PR not yet created at this checkpoint.
