# Lesson Builder — Ultimate Teacher UX

Base main: `73d43aa9c5a4226ea2a4472c645795d6370e1ff8`, merged #99.
Branch: `agent/lesson-builder-ultimate-ui`. This is a local teacher-facing authoring extension.

## Product workflow

Open `/haldus-lesson-builder/`. Start from scratch via the block library, choose a full lesson
structure, copy the school lesson or import a JSON backup. The interface uses Estonian teacher
terminology, consistent with the CRM. Normal teachers do not see activityId/phaseId/schemaVersion;
these are read-only under activity actions → additional technical details.

The structure panel groups contiguous activities by their human phase name (repeated phases stay
in the actual lesson order). Search and skill/type filters operate on the same ID-backed list.
Collapse phase groups or use selection to jump. Drag only the handle, with a movement threshold,
pointer capture, insertion marker and source placeholder. Pointer cancellation/Escape cancels.
Cross-phase drops change phaseId, never activity ID or routes. Keyboard Alt+Up/Down on a handle
and editor up/down buttons remain available. Move-to also supports choosing a phase explicitly.

The editor contains title, phase, type, minutes, layout, skills and three support variants:
**Vajab tuge / Tavaline / Rohkem väljakutset**. Copy Standard to all levels asks before replacing
variants. Easier/harder helpers deterministically copy Standard and append a short scaffolding or
challenge instruction; they do not invoke AI or claim pedagogical personalization.

Actions include duplicate (new UUID), in-app copy/paste (new UUID), delete with confirmation,
move-to and reset to template (same UUID). Destructive operations on reference copies warn that
the source remains unchanged. Deleting the last block is explicitly confirmed. Undo restores IDs
and content exactly; redo reapplies the recorded state rather than generating another ID.

Lesson settings cover title (top bar), CEFR, minutes, goal, topic, tags, skills, teacher notes and
success criteria. Custom phase IDs are allocated once and exposed only in technical details.

## Templates and visuals

`lesson-block-templates.js` is declarative data: **41 blocks**, nine categories and **9 lesson
structures**. Every starter has valid routes, prompt, expected-result placeholder, teacher guidance,
type/phase/skill and duration. Full templates allocate each activity UUID once and distribute
minutes to the advertised lesson duration. They are editable starting points, not certified content.

There are **13 visual presets**, plus the existing native layout: text, image placeholder, cards,
questions, comparison, roleplay, dialogue, flashcards, checklist, reading, exam, reflection and
teacher-led. The existing Lesson Mode workspace model remains the content/route boundary;
`lesson-authoring-presentation.js` renders an escaped presentation in authoring preview only.
These presets do not implement answer submission, audio upload, remote image loading or a debate
engine. Vocabulary/flashcard lines are authored display content, not a second word-evidence model.

## Contract extension

The normalized activity schema is unchanged. Optional `draft.authoring` is local authoring metadata:

```ts
{
  lesson: {
    cefr: 'A1' | 'A2' | 'B1' | 'B2' | 'C1', minutes: number,
    goal: string, topic: string, tags: string, notes: string,
    skills: string[], successCriteria: string
  },
  activities: Record<ActivityId, {
    minutes: number, layout: string,
    templateId?: string, reference?: boolean
  }>,
  phases: Array<{id: string, title: string}>
}
```

Older v1 drafts are upgraded in memory: IDs/routes stay unchanged; existing phase/vocabulary/context
is retained. `lesson-authoring-core.validate` validates this optional metadata; durations are finite
0–240, layouts/CEFR are allowlisted, settings text is bounded and JSON-only. The earlier authoring
restriction coupling diagnostic type to diagnostic phase is removed: phase and format are independent
in the existing normalized contract. This does not rewrite or reinterpret registered lessons.
Preview only projects known fields. No curriculum binding, assignment or publication ID is invented.

## History, storage and validation

`lesson-builder-ux-core.js` owns operations, a **50-snapshot** history, grouped typing (700 ms),
validation and a testable local autosave controller. Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z work in the
main editor. Native text undo remains available while a modal is open; committed modal edits can
be undone through the main history after closing. History is session-local and resets after reload.

Autosave debounces **700 ms** into the existing `keelesepp.lesson-authoring.v1` key. Explicit Save
flushes immediately. Invalid drafts do not overwrite the last valid draft; they remain dirty and
trigger beforeunload. Storage failures show an error and retain dirty state. One draft per origin,
last-writer-wins across tabs; export JSON for separate lesson backups. No cloud save is implied.
Malformed imports fail before replacing state. Replacing a nonempty lesson asks first; Undo also
restores the previous draft. Import/export preserves normalized content and IDs.

Errors block save/export/preview, display inline and link to affected fields. Warnings/tips are
non-mutating heuristics: missing assessment/goal, excessive activities/duration, duration mismatch,
unrepresented lesson skills, early assessment, identical support/challenge prompts, duplicate titles
and absent teacher instructions. Readiness is a six-item authoring checklist, **not student mastery**.

## Preview boundary

A **450 ms** debounce writes one validated sessionStorage snapshot and loads the existing Lesson
Mode with a selected activity ID and allowlisted route. Parent navigation messages must match the
iframe, origin and current token. Invalid drafts clear stale preview. Missing/invalid tokens fail
closed and cannot fall back to a registered lesson. Supplied studentId is ignored.

Student mode hides teacher answers, instructions and controls. Teacher mode exposes the existing
teacher scaffold. This is a local presentation switch, not authorization for sharing secret answers.
The preview provides previous/next navigation, Desktop fit-to-panel, Tablet 768 and Mobile 375
viewport simulations and a fullscreen overlay. No session, evidence, handoff, skillMap or curriculum
progress is saved. Production Lesson Mode only opts into new presentation for authoring preview.

## QA and visual review

Automated: 257 selected CRM/learning tests, 157 unchanged Functions unit tests, 10 isolated browser
behavior tests. Exact existing workspace parity: 123/123 models (school and two city lessons).
Browser tests exercise real DOM handlers for pointer/keyboard reorder, reload, routes, duplicate,
delete/undo/redo, autosave, import/export, safe HTML and preview with a forged studentId: zero
persistent API or auth-token requests. CI also runs the existing demo emulator integration suite.

Local Chrome review: 1440×1000 three columns, 1180×820 two columns, 834×1000 tablet and
390×844 mobile; pointer first→fifth, cross-phase changes and live preview. The second pass replaced
unreliable native drag, improved empty states/field errors, removed teacher-only student preview
surfaces and made side preview legible. Final automatic Vercel preview/manual checklist and exact
CI results are recorded in the draft PR.

## Limitations and next safe step

One local draft, no cloud database/publish API/assignment, no real audio or image upload, no
collaboration runtime and no paid AI. Presentation only where an interaction engine does not exist.
History does not persist between reloads; content and IDs do. Incomplete edits need correction before
save/export and remain protected by the unsaved-change warning. Published identity/version policy
requires a separate trusted backend workstream. Source/reference lessons are never rewritten.

Next safe step: complete the two pending real-Chrome JSON file import checks on the draft PR preview.
No agent merge, production Vercel deploy, Firebase production operation or student-data mutation.

### Vercel preview QA — 2026-09-07

[Draft PR #100](https://github.com/zakutailopavel-cyber/keelesepp/pull/100).
[Automatic preview](https://keelesepp-git-agent-lesso-6ab58d-zakutailopavel-cybers-projects.vercel.app/haldus-lesson-builder/).
[CI evidence](https://github.com/zakutailopavel-cyber/keelesepp/actions/runs/34053699747):
257 CRM + 157 Functions + 10 browser behavior + 25 emulator tests = **449 PASS, 0 FAIL**.

Real Chrome preview: scratch creation, 60-minute lesson template, nine different block templates,
pointer first-to-fifth and cross-phase reorder, duplicate with new ID, delete/Undo restoring the
same ID, three route edits, save/reload preserving ten activity IDs/order/content, fullscreen,
Desktop/Tablet/Mobile and Student/Teacher views verified. Export downloaded a JSON backup.
Console checks returned no errors. Preview remained local and no real student flow was used;
isolated browser tests additionally prove zero persistent calls with a forged studentId.

**Manual QA incomplete:** file import roundtrip and malformed-file upload could not be completed
because Chrome extension file upload returned `Not allowed` (file URL access disabled).
No extension permissions were changed. Both paths pass the automated DOM tests, but these
are not a substitute for the requested real-Chrome file-picker check. PR remains draft;
full Definition of Done is not claimed. Mobile/tablet preview frame centering was refined in
the final visual polish pass.
