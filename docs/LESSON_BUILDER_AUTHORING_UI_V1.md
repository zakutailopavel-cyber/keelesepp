# Lesson Builder v1 — Authoring & Validation UI

Base: merged #98 / main `b23dabc989be3aad1989de98f4c1234cfdc20e4a`.
Branch: `agent/lesson-builder-authoring-ui-v1`. This slice is a local authoring tool, not a publication service.

## Teacher workflow

Open **Tunni koostaja** from Teacher Home. Start an empty draft or copy **Kool ja õppimine**.
Select an activity and edit title, phaseId, skillIds, workspaceType and each Support/Core/Advanced
prompt, expected answer and teacher instruction. Activity IDs are read-only. Adding an activity
allocates `act-<UUID>` once; copying the school lesson preserves all 12 existing IDs. Reorder moves
the activity object and never recomputes its ID. Save and reopen preserve identities and variants.

**Salvesta mustand** validates and explicitly saves one draft to this browser origin.
**Ekspordi JSON** produces a validated backup; **Impordi JSON** validates before replacing the editor.
Replacing an unsaved draft asks before discarding edits. A save replaces the previous local draft;
export separate versions if required. Storage failures surface an error instead of claiming success.

**Vaata tundi** validates then opens a snapshot in an iframe using existing Lesson Mode renderers.
Closing removes the sessionStorage snapshot. Reopen preview after editing to see the latest content.
Preview can exercise local navigation, routes and summary, but never saves student evidence or handoff.

## Draft envelope v1

```ts
type LessonDraft = {
  schemaVersion: 1;
  kind: 'keelesepp-lesson-draft';
  id: `draft-${string}`;
  title: string;
  activities: Array<Omit<Activity, 'source'>>;
  context?: {
    durationMinutes?: number;
    diagnosticDurationMinutes?: number;
    phases?: Array<{id: string; title: string; minutes?: number; successCriteria?: string[]}>;
    vocabulary?: Array<{id: string; word: string; translation: string; example: string}>;
    languageFocus?: Array<{id: string; label: string; patterns: string[]}>;
    successCriteria?: string[];
  };
};
```

`Activity` is the existing [normalized contract](NORMALIZED_ACTIVITY_CONTRACT_V1.md).
`source` is derived UI position, omitted from newly created draft content and regenerated for preview.
There is no parallel persistent activity ID. Preview lesson IDs are prefixed `authoring-preview-`;
no curriculum binding, curriculum credit or registered blueprint is changed. Context copies the
reference lesson's existing workspace scaffolds without rewriting teaching material.

`lesson-authoring-core.js` is pure UMD/CommonJS. Its boundary exposes `createDraft`, `fromLesson`,
`addActivity`, `updateActivity`, `moveActivity`, `validate`, `serialize`, `parse` and `previewLesson`.
`updateActivity` rejects ID/schemaVersion patches; JSON imports still validate unique, nonreserved IDs.
Published identity protection and version reconciliation will need a separate server-side design.

## Validation and security boundaries

- `activity-contract-core.validateActivities` checks schema, IDs, phases, variants and inert metadata.
- Authoring requires 1–100 activities, a nonempty lesson/activity title up to 180 characters,
  at least one of the six supported skills and all three nonempty route prompts up to 3000 characters.
- Expected answer is optional text up to 3000 characters; teacher instruction up to 4000.
- Workspace type is one of the existing seven activity types; summary is not an authored activity.
  All variants retain the activity workspace type. Diagnostic type and `diagnostic` phase must agree.
- Imported context is validated; duration values must be finite numbers from 0 to 240.
  Preview projects only recognized phase fields. Imported markup is rendered as escaped text.
- JSON text is bounded at 1,000,000 code units, with an additional 1,000,000-byte file-size check in UI.
  Unknown future capability metadata is retained as inert JSON, never executed or fetched as assets.
- Editor has no Firebase SDK, student API call or cloud save. Browser storage is not a secret store:
  other users of the same browser profile/origin can read the draft. Avoid student/private information.
- Preview reads `keelesepp.authoring-preview.<UUID>` from same-tab sessionStorage. Invalid/missing
  tokens fail closed. Even a URL with studentId cannot initialize persistent teaching in preview mode.
- Ordinary registered lessons still follow the existing registry, session store and Functions APIs.
  `currentActivityId`, phaseId, routeBySkill and all existing evidence contracts are unchanged.

No authentication service is added to the local editor. A future shared authoring/publication API
must add role checks, immutable versions and trusted validation before drafts can be assigned to students.

## Verification

- 10 authoring contract tests included in existing CI; 242 selected CRM/learning tests passed locally.
- 157 Functions unit tests passed unchanged using installed dependencies.
- All 36 school workspace models (12 activities × 3 routes) equal the source lesson models.
- Existing HTML preview navigation rendered 12 school, 15 city vocabulary and 14 city problem-solving
  activities without script errors or API calls in isolated DOM tests.
- Isolated authored preview with studentId exercised all 12 activities, preview judgements and summary:
  0 authentication token requests, 0 API calls, 0 script errors. Injected HTML remained text.
- Chrome: validation before empty save, copy, edit, reorder, save, reload and iframe navigation passed;
  stored IDs/order/text restored and console errors absent.
- Main post-#98 production smoke is recorded with its exact scope in PROJECT_STATE.md.
  No student evidence was created for any smoke in this workstream.

## Limitations and next step

One draft per browser origin; export/import is the only transfer/backup mechanism. No deletion UI,
publication, assignment, cloud draft library, AI, voice, collaboration, assets editor or automatic
progression. Copied vocabulary, language patterns and phase context are not editable in this slice.
Existing Lesson Mode scaffolds remain and may be generic for newly authored material. Preview is
nonpersistent and is not proof of live publication. In-use activity deletion/versioning remains deferred.

Next safe step: owner review of the draft PR and preview, then owner merge if accepted.
Production deployment only after owner merge; no Firebase production deployment is authorized.
