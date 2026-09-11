# Interactive Lesson v1 — living handoff

## 2026-09-11 continuation

Branch `agent/admin-student-preview-v1` adds a staff-only, audited and read-only student preview. It uses
the existing assignment and student projection contracts, never authenticates as the student, hides
teacher content and leaves all student mutation checks unchanged. See `STAFF_STUDENT_PREVIEW_V1.md`.

Production smoke then showed that the flat 32-button outline pushed real task content below the fold.
Branch `agent/student-lesson-player-v1` replaces it with a focused sequential player and lets staff use
response controls as ephemeral test inputs. Preview values remain in page memory only and never call
save or submit. No backend deployment is required for this follow-up.

After #114 reached production, Elena's third activity exposed a content compatibility issue: its prompt
contains `___` blanks but the immutable v1 content predates `evaluation.response`. Branch
`agent/inline-assignment-authoring-v1` deterministically adapts those legacy blanks into fillable fields
and adds an in-page Builder dialog targeted at the exact source draft/activity. Explicit modern response
contracts remain authoritative; published versions stay immutable. Inferred legacy fields are optional:
this preserves the submission rules of already published lessons while still saving any answers a student
enters. Explicitly authored modern fields keep their configured required/optional behavior.

The same branch contains a small cost-controlled authoring accelerator: Builder can request exactly one
Haiku-generated activity, preview it and then insert it as a normal editable block with a fresh stable ID.
The dedicated Vercel endpoint is staff-only, capped at 700 output tokens and 10 requests per 15-minute
process window, validates its structured result and makes no Firebase or student-data writes. Generation
is never automatic; each paid call requires an explicit teacher button press.

Status: MERGED and DEPLOYED; genuine teacher/student production acceptance remains open. This file is updated during implementation;
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
Run the genuine teacher/student acceptance described at the end of this document.

## Implementation checkpoint (supersedes initial not-yet-implemented list)
Pure `interactive-lesson-core.js` + server copy added: five modes, exact field IDs,
answer validation, allowlisted student projection, student-only UID mapping (no parent aliases).
6 new core tests pass; combined normalization/authoring/UX/core run 40/40 pass.
Builder responses.js mounts on editor render and uses existing undo/commit/autosave boundary.
Inline and sticky Lesson Mode previews share the response renderer and remain ephemeral.
The interactiveLessonApi and interactiveAssignments direct-deny rule are deployed.
Endpoints: students/list/assign/get/save/submit/review. Assignment pins immutable version,
strict teacherUid student scope, explicit linked active student account, revision checks.
The interactive-lesson/ runner/review page is covered by browser and emulator verification.
Student roster UI replaces manual student ID; listing assignments currently first 50 with notice.
Cloud publication additionally validates response metadata on server.

The earlier outstanding checks were completed before merge. CI run 34154609330 passed 495 checks:
162 Functions, 263 CRM/learning, 18 browser, 25 existing emulator, 14 cloud-draft emulator and
13 interactive emulator; 0 failures. Automatic Vercel Preview was READY. Real Chrome verified a
60-minute template, short-answer configuration, editable inline and sticky Lesson Mode previews,
and an empty console warning/error query. Preview responses caused no persistence requests.

PR #103 was owner-merged as main `ea1e8994778afdd6f8330caf50b715a0cd05e0e7`; PR #104 subsequently
merged the recovery and revoked-link protections. Production deployment is recorded below.

Reconciliation branch `agent/reconcile-interactive-lesson-103` contains only:
- safe local-recovery removal after confirmed save/submit/reload and account-switch clearing;
- student assignment-list filtering after a student-account link is revoked;
- emulator assertion for both revoked `get` and `list`;
- current state/handoff documentation.

Reconciliation PR #104 is merged as `37a6566b95ea85738c105fcbcf7bc99a5b4e2165`.
CI run 34190554235 is PASS: Functions 162/162, CRM/learning 263/263, browser 18/18,
existing emulator 25/25, cloud emulator 14/14 and interactive emulator 13/13; 0 failures.
Its Vercel Preview was READY. Anonymous Chrome smoke of `/interactive-lesson/` showed the safe
sign-in gate and no console warnings/errors.

Firebase rollout is complete for `interactiveLessonApi` and its rules. Collection
`interactiveAssignments` remains denied to direct client reads/writes. The rollout required no
indexes or migrations and did not mutate students, LearningSession, evidence, skillMap, mastery
or curriculum progress. The owner updated the Function again after #104 merged.

## Production rollout update — 2026-09-08
PR #104 merged as main `37a6566b95ea85738c105fcbcf7bc99a5b4e2165`. The owner first deployed
`interactiveLessonApi` plus Firestore rules and then selectively updated `interactiveLessonApi`
from this final main. The screenshot showed `Successful update operation` and `Deploy complete`.
Read-only verification confirmed deployed hash `cd1859860ab83438630d6265622091851fb10efc`,
unauthenticated POST 401, production-origin OPTIONS 204 with no-store/nosniff/CORS headers, and
no Function errors in available logs. Authenticated Chrome teacher smoke loaded production
`/interactive-lesson/`, returned the empty assignment library and showed the assignment action;
console warnings/errors were empty. No assignment, response or student/evidence data was created.

Exactly one remaining acceptance action: the owner publishes a genuine fillable lesson and assigns
it to an existing linked student. Audit the real save/resume/submit/review flow read-only. Stop if
the student lacks a linked active Firebase user; do not invent or migrate an identity during smoke.

## Interactive template workstream — 2026-09-08

Authoritative base main: `c13425af2131c6e33b8d6a5bb3ee4bbcb1e2f20d` (#105 merged).
Implementation branch: `agent/lesson-builder-interactive-templates-v1`.

The owner successfully saved and published a cloud lesson, but `/interactive-lesson/` still showed
an empty assignment list. The owner explicitly deferred investigation and asked development to
continue. Do not report this flow as production accepted, and do not create synthetic assignment
or student response data. The exact root cause is not established.

Current bounded implementation adds five ready-to-edit Builder blocks using the existing response
contract: short text, long text, single choice, multiple choice and gaps. Choice and gap field IDs
are pinned independently of labels, routes, text edits and activity ordering. A 35-minute
`Täidetav tööleht` whole-lesson template combines all five modes. Existing noninteractive templates
remain unchanged and can still be made fillable manually.

Files in this workstream:

- `lesson-block-templates.js` — declarative fillable blocks and worksheet;
- `lesson-builder-ux-core.js` — copies response metadata at the existing template boundary;
- `haldus-lesson-builder/app.js` — visible `Täidetav` markers;
- core/browser contract tests and project documentation.

No Firebase schema, rules, Functions, production data or deployment is part of this workstream.
Draft PR: [#106](https://github.com/zakutailopavel-cyber/keelesepp/pull/106), initial head
`833c9c271a1df4b208e9544a5d753c2797834e2d`. Vercel Preview is READY. Targeted verification:
42 normalized/authoring/interactive core tests, 20 Builder/Lesson Mode DOM tests and 4 cloud
publication validation tests passed. Visual local smoke created the worksheet with five unique
activities, showed every block as `Täidetav`, opened a required short-answer field in the sticky
student preview and confirmed the preview status says student data is not saved. The only console
message was the existing third-party Google FedCM migration warning; no application runtime error
was observed. The protected Vercel Preview itself requires Vercel login in the isolated browser.

Exactly one next safe step after this PR is reviewed: investigate why a genuinely published lesson
did not become visible as a student assignment, using the published version, teacher assignment
request and linked-student identity as read-only evidence before proposing any fix.

## Post-#106 update — 2026-09-08

PR #106 merged as main `120e81a133a50cd8b6285def5ac1cc99007e9670`. Read-only production UI
inspection opened the assignment form and confirmed that `60 min · individuaalne keeletund · v2`
is available as an immutable published version. The teacher assignment list contains zero records.
The observed result matches the contract: cloud save and Publish do not create an
`interactiveAssignments` document; only the separate `Määra õpilasele` action does. No assignment
was created, no student was selected and no production data was changed. Functions calls returned
HTTP 200 and available logs showed no error for the inspected reads.

Current branch `agent/lesson-builder-worksheet-composer-v1` implements a paste-to-worksheet
productivity slice. Up to 30 lines become stable-ID fillable activities in one undoable operation.
It supports short/long text, single/multiple choice and gaps with `|`-separated fields. Core tests
44/44 and Builder/Lesson Mode DOM tests 22/22 pass locally. Visual smoke pasted five mixed rows,
created five fillable cards, rendered the short-answer editor and completed local autosave with no
console warnings/errors. No Firebase or API change is included. PR #107 was owner-merged as main
`989696c6cc55983a8af46ed985290fcaaeadb709`; its Vercel production deployment reported READY.

## Image Block v1 checkpoint — 2026-09-09

Authoritative main is `568d42e1d1acd044895520612f01934bb4f81d0c` (#109 merged). Image Block
v1 adds the first real visual asset boundary: stable
image ID, HTTPS URL, required alt text and optional caption. It is edited in Builder, rendered in
local Lesson Mode preview, included in the allowlisted student projection and validated during
cloud publication. Legacy activities without assets remain unchanged.

Vercel production is READY. With explicit owner permission, `lessonDraftsApi` and
`interactiveLessonApi` were selectively deployed. Both are ACTIVE on source hash
`b11cbbe423e1e79e63ac87992839e876090a986e`; authenticated access remains required, production
CORS preflight succeeds and fresh smoke executions contain no runtime error. No Firebase Storage,
rules, indexes, migration, production assignment, response or evidence changed.

Exactly one next safe step: the owner performs one genuine publish, assign and student-open flow
with an image activity; audit it read-only before adding upload or asset-library storage.

## Student assignment delivery checkpoint — 2026-09-10

Authoritative main is `1f9a16f9a423e78907a0b68b02670f21ba0753ac`. PR #111 is merged and its
selective `gcalApi` deployment is production-smoked: the CRM origin now receives the expected CORS
header, the schedule shows the connected Google Calendar state, the status request returned HTTP 200
and fresh Function logs contained no runtime error.

The production assignment for Elena Polischuk is real and remains active:

- student card `e0ZrkleHtg0s8sKGlw1r`;
- Firebase account `363dvwinzHYY8AmxXzOhvtCZek73`, `len.mur86@gmail.com`;
- assignment `8f3cb3b6-9965-4637-9a4d-dd0032550008`;
- immutable lesson `A2 igapäevaelu – praktilised ülesanded · v1`;
- 32 activities; no answers, submit, review or evidence were created during verification.

The earlier empty assignment screen was captured before the separate `Määra õpilasele` action. Cloud
save and Publish intentionally do not create an assignment. Production teacher/admin verification now
lists and opens the assignment successfully. A genuine student-login verification is still required;
do not impersonate Elena or create answers for her.

Branch `agent/student-assignment-delivery-v1` closes the confusing publication-to-assignment handoff:

- successful publication offers a direct `Määra tund õpilasele` action;
- the immutable version is preselected on the assignment page;
- assignment is disabled until both version and student are selected;
- teacher lists use the student name and localized status;
- teacher open state explains whether answers are pending instead of instructing the teacher to answer;
- new assignments snapshot `studentName`, while existing assignments resolve it from the student card.

Local verification: interactive core/delivery tests 10/10 and Functions tests 163/163 passed. This
branch changes `interactiveLessonApi`, so production acceptance requires owner merge, Vercel READY,
then a selective `firebase deploy --project keelesepp-5136b --only functions:interactiveLessonApi`
and a real Elena login/open smoke. No rules, indexes, migrations, skillMap, curriculum progress,
LearningSession or evidence change is included.
