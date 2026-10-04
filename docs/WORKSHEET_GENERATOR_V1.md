# Worksheet Generator v1

## Goal

KeeleSepp generates editable Worksheet Studio documents deterministically from a curriculum lesson profile. Content generation is local and pure: no AI provider, translation service, search engine, HTTP generation endpoint, Firestore write or timestamp participates in output selection.

The full product progression is:

1. `Avasta` — notice and understand the target language in context.
2. `Harjuta` — controlled accuracy practice.
3. `Kasuta` — transfer through speaking and writing.

A teacher may also generate one `Avasta`, `Harjuta`, `Kasuta` or `Täistööleht` document for one to three selected focus IDs.

## PR 1 boundary — pure generator core

The first slice lives in `crm-v2/src/features/worksheet-generator/engine/` and exposes:

- `generateLessonBundle()`;
- `generateFocusWorksheet()`;
- deterministic seed, shuffle and sample helpers;
- lesson-kind, CEFR level, legacy-focus and vocabulary normalization;
- phase recipes and current Worksheet Studio block materialization;
- stable generator diagnostics and pre-persistence quality checks.

The reference profile is `crm-v2/src/features/worksheet-generator/fixtures/a2b1-016.generator-profile.json` for `a2b1-016 — Ajamäärused ja päevaplaan`.

Same profile + lesson + seed + generator version produces byte-equivalent output. `worksheetDoc` remains an ordinary `keelesepp.worksheet/2` document and contains no generator-only fields. Generation metadata stays on the returned `GeneratedSheet` envelope. Block defaults come from the current Worksheet Studio registry, but every generated block receives deterministic IDs and fully materialized profile content.

Blocking quality diagnostics stop future persistence. The core rejects unsupported profile versions, unknown or excessive focus selection, unknown blocks, placeholder content, missing scorable answer keys and focus coverage below 70%. Source scarcity produces explicit diagnostics instead of fabricated language.

This slice does not add a route, button, Firebase service, collection, rule, migration, assignment or deployment.

## Didactic planner v1 — Activity Catalog and real variants

The generator no longer treats each phase as one fixed list of five block types. `activityCatalog.js` is the
versioned pedagogical source of truth for logical activities. Each activity declares its phase, Worksheet Studio
block type, activity family, compatible lesson kinds and CEFR range, skills, production mode, cognitive load,
didactic tags and required curated sources. Several logical activities may deliberately reuse the same renderer;
the catalog describes *why and when* an activity is used, while Worksheet Studio remains the only rendering contract.

`planner.js` compiles that catalog into a deterministic five-activity plan for each phase. A valid plan must cover:

- `Avasta`: input, noticing and reflection;
- `Harjuta`: accuracy and controlled practice;
- `Kasuta`: oral production, written production and reflection.

Selection is seeded, level-safe and lesson-kind-aware. It prefers different activity families and accepts recent
activity IDs as a cooldown history. If there are not enough compatible activities or curated source banks, generation
fails closed with stable diagnostics instead of filling the sheet with generic or invented language.

The phase materializer now receives activity IDs from the planner and builds the requested blocks through the existing
Worksheet Studio registry. `quality.js` verifies that the plan and produced task blocks agree, that phase requirements
are present and that a `Täistööleht` contains discover → practice → transfer progression. Generator-only plan metadata
remains outside `worksheetDoc`.

Regeneration is a real variation operation. The teacher UI increments a deterministic `variant` seed and feeds the
previous saved activity IDs back as cooldown history. Generation metadata records `activityIds`,
`activityCatalogVersion`, `didacticPlanVersion` and `variant`, while published worksheet snapshots and manual edits
retain their existing persistence semantics.

The current catalog is intentionally limited to activities that can be materialized from existing curated profile
banks without an AI/provider call. New catalog entries are additive only when their source contract and Worksheet
Studio materializer are deterministic. The reference profile remains `a2b1-016`; broad curriculum coverage is still a
separate data-authoring rollout.

## Lesson DNA and difficulty engine

`profiles/index.js` is the curated registry for generator-ready lessons. The teacher UI resolves a lesson through
this registry instead of importing one fixture directly, so adding another verified profile is a data-registration
change rather than a new UI condition.

Every generation builds a canonical `keelesepp.lesson-dna/1` envelope before planning. Lesson DNA records the lesson
and profile identity, normalized CEFR level, lesson kind, selected focus IDs, target/recycled vocabulary identity,
priority skills, duration, difficulty, deterministic variant and seed. The DNA is generator trace metadata and stays
outside the ordinary `keelesepp.worksheet/2` document.

The teacher can choose `Support`, `Core` or `Challenge`. Difficulty is deterministic and changes both planning and
materialization without bypassing didactic requirements. It can prefer lower/higher cognitive-load activities and
adjust scaffolding such as word-bank visibility, distractor count, controlled item count, speaking duration, planning
space and writing length. Every mode still has to satisfy the same Activity Catalog source requirements, five-task
phase contract and quality gate; scarce curated banks fail closed.

`generateLessonBundle()` and `generateFocusWorksheet()` return their Lesson DNA alongside sheets. Saved child-sheet
generation metadata records the selected difficulty and DNA while published/manual worksheet content keeps the
existing persistence and version semantics.

## Per-task deterministic regeneration

Generated child worksheets can regenerate one selected generated task inside the shared Worksheet Studio. The
regeneration engine derives its next seed from the current block content, so repeated regeneration is deterministic
without timestamps, hidden random state or an AI/provider call. It prefers a different compatible activity with the
same primary skill while preserving phase-critical didactic tags; when no safe alternative exists it keeps the same
activity and regenerates only its content.

The replacement preserves the block ID, goal and teacher-controlled layout fields. It rejects placeholder output,
missing deterministic answer keys, exact duplicates of the current task and exact duplicates of sibling tasks. Manual
or unsupported blocks fail closed. The editor change goes through normal Worksheet Studio history, so it is undoable
and remains local until the teacher explicitly saves. Firestore is not written by the regeneration click itself.

New generated records also persist `contextId` in generation metadata. Older generated sheets remain compatible:
context is reconstructed from the original deterministic bundle seed when the field is absent.

## Standalone focus worksheets

The teacher generation page can create one additional child worksheet for one curated lesson focus without changing
the three core Avasta / Harjuta / Kasuta records. The teacher chooses the focus and `Avasta`, `Harjuta`, `Kasuta` or
`Täistööleht`; the currently selected Support/Core/Challenge difficulty is reused.

Focus worksheets receive stable child IDs derived from phase + focus IDs and use `role: focus`, so their draft,
version and publish history is independent from core lesson sheets. Regenerating the same focus/phase creates another
draft version of that focus sheet and reuses its prior activity IDs as planner cooldown history. Focus generation
stores the same trace metadata as core generation (`phase`, focus/context IDs, Activity Catalog plan, Lesson DNA,
difficulty and variant) and opens in the same Worksheet Studio.

## Shared CEFR level lexicon

The generator reuses the existing authenticated Firebase Storage object `eesti_soned.json`; it does not copy or
fork that vocabulary dataset. CRM v2 owns the Storage adapter and passes the downloaded JSON as plain data into the
pure generator core. Generator modules therefore keep their no-Firebase/no-network boundary.

The browser adapter reads the object with the authenticated Firebase Storage SDK `getBytes()` call and a 10 MiB
ceiling. It does not turn a download URL into a second cross-origin `fetch`; that former two-step path surfaced only
the unhelpful browser error `Failed to fetch` in production. Invalid JSON and empty payloads still fail closed.

The legacy level → lexical type → words shape is normalized by `vocabulary.js`. Lesson-specific `activeVocabulary`
remains authoritative for theme and focus. The shared lexicon is a CEFR-safe reserve and audit source only: sampling
never pulls vocabulary above the lesson ceiling, and a known target word that appears only above the current level
produces `VOCAB_ABOVE_LEVEL` as a warning rather than blocking generation. Unknown words are left to the curated
lesson profile instead of being guessed.

Storage load failures are non-blocking for an otherwise valid curated profile. The teacher sees a warning that CEFR
audit is limited, while the thematic profile can still generate. Saved generation trace records only the lexicon
source and word count outside `worksheetDoc`, not a copy of the shared vocabulary.

## Lesson-embedded Generator Content Packs

Generator coverage is no longer limited to profiles imported from source code. Staff can author a bounded
`generatorProfile` directly on `curriculumLessons/{lessonId}`. The same sanitizer and readiness path is used for
embedded packs and the reference fixture: known fields are normalized, unknown fields are discarded, source arrays
are capped and profile size is additionally limited by the Firebase write adapter.

Readiness is not a separate UI checklist. It calls the actual Activity Catalog / Didactic Planner and requires the
content pack to support five activities in Avasta, Harjuta and Kasuta together with minimum focus, vocabulary,
context, sentence and success-criteria sources. Incomplete packs may be saved as drafts. A ready embedded pack wins
over the code registry; an incomplete embedded draft does not disable an already verified static fallback.

The teacher editor uses structured `::` rows for focuses, target vocabulary, contexts, sentence templates, error
pairs, translations and productive prompts. Sentence rows retain optional slot JSON; the dialogue bank is available
as a smaller advanced JSON section. IDs are preserved so existing slots, focus patterns/aliases and dialogue content
survive ordinary edits. New packs can be scaffolded from roadmap lesson metadata but thematic vocabulary and natural
sentence/content banks remain curated rather than guessed from the lesson title.

Persistence is transactional on the existing curriculum lesson document and stores revision, updated-at/by metadata
with stale-editor conflict detection. No new Firestore collection or rule is required. The worksheet document and
assignment contracts are unchanged.

## Content Pack Factory v1

The first Factory version assembles a deterministic draft from a versioned curated Content Library. Reusable packs
contain focus definitions, vocabulary, controlled sentences, contexts, dialogues, optional error/translation pairs,
productive prompts and CEFR/lesson compatibility data; they are not random word lists. Library v2 contains
`introduction`, `basic-questions`, `olema-present`, `present-common-verbs`, `personal-info`, `numbers-dates` and the
module-two packs `family-relations`, `possession-genitive`, `appearance-character` and `people-profiles` (Library v3).
Every pack sentence contains at least one target word in its exact surface form (tested), so gap-fill and context
choice always have an answer key; context-choice distractors come from another part of speech first. True/false
items name the situation („Olukord: …”) that the learner judges each sentence against.

Factory selection uses stable lesson blueprints for A2-002…A2-010 and bounded keyword matching for future selected
lessons. Every draft runs through the real sanitizer, `catalogReadiness()` and `planLessonActivities()`. Unsupported
lessons return `Missing sources` instead of invented Estonian. The UI first shows a readable category/count preview;
the existing structured editor remains available for detailed changes. A draft is local UI state until the teacher
explicitly presses `Salvesta sisupakett`; an existing embedded profile is never replaced automatically. Coverage
Dashboard links missing lessons into this same single-lesson draft flow and does not bulk-write profiles.

Learner metadata is intentionally separated from Russian roadmap administration text. Generated worksheet titles
come from the curated profile, subtitles are fixed Estonian phase explanations, and `canDo` uses only the Content
Pack's checked success criterion. Roadmap goal, module and success strings are not copied into learner metadata.

## Child-sheet persistence boundary

`lessonWorksheetsService` stores child sheets under `curriculumLessons/{lessonId}/worksheets/{worksheetId}`. Stable core IDs are `discover`, `practice` and `transfer`; focus sheets use their own IDs. The legacy root `worksheetDoc` contract stays untouched. Generated sheets begin as drafts and never overwrite manual or published work silently. Each transaction checks the loaded `worksheetDocUpdatedAt`, increments the version, writes an immutable `{lessonId}_{worksheetId}_studio_v{version}` history record, and keeps the last published snapshot when a newer draft is saved.

Firestore permits signed-in users to read these lesson materials and restricts child-sheet writes to staff. Existing `worksheetVersions` remain staff-readable/create-only and cannot be updated or deleted. The shared Worksheet Studio child route and teacher controls belong to the next UI slice.

## Teacher generation UI

The lesson material dialog links to `/library/lessons/{lessonId}/worksheets`. For a lesson with a curated generator profile the page offers `Genereeri 3 töölehte` and shows stable cards for `Avasta`, `Harjuta` and `Kasuta`. Generation saves all three as independent drafts. Re-generating existing core IDs requires explicit confirmation, creates new versions and keeps published snapshots intact. Lessons without a curated profile show `Generaator pole selle tunni jaoks veel valmis` and cannot generate generic content.

Each card opens `/library/lessons/{lessonId}/worksheets/{worksheetId}`. This route adapts `lessonWorksheetsService` to the existing Worksheet Studio instead of forking its editor, renderer or quality gate. Save and publish affect only the selected child sheet; its version history uses the child-aware immutable records.

Assignment continues to snapshot the selected published worksheet in `worksheetAssignments`. The source record will retain child-sheet identity and version for traceability; the student player continues reading the immutable assignment snapshot.

## Live teacher guidance and student profile

Generated worksheets must reuse the existing live-assignment path rather than create another session model:

- `homeworkService.subscribeWorksheetAssignment()` streams the learner's autosaved answers;
- `LiveWorksheetView` shows current answers, progress and per-field ✓/✗ marks;
- `setWorksheetLiveFocus()` writes `liveFocus.blockId`;
- `DocWorksheetPlayer` subscribes to the same assignment, highlights that block and scrolls it into view;
- `RoomWorksheetPanel` presents the same teacher/student assignment inside Live Classroom.

Teacher acceptance criteria for the integrated generator:

1. Open an active generated worksheet assignment and see answers update without reload.
2. Enter the learner's active session from Live Classroom or the assignment view.
3. Point to one task and see it highlighted for the learner.
4. See deterministic marks on completed scorable fields and add existing annotations/feedback without changing answer data.
5. Open a student's profile and see active, submitted and reviewed Worksheet Studio assignments.
6. Open an active assignment from the profile in live view and a completed assignment in review view.

The current `StudentProfilePage` does not yet load `worksheetAssignments`; adding the profile section belongs to the teacher UI/assignment integration slice. It must use `homeworkService.listWorksheetAssignmentsByStudentIds()` and the existing live/review components, not copy assignment data into the student document.

## Rollout order

1. Pure generator core and reference profile.
2. Child-sheet draft/publish/version persistence and rules. (implemented)
3. Teacher generation UI and shared Worksheet Studio route. (implemented for the reference profile)
4. Didactic Activity Catalog, seeded planner, cooldown and real regeneration variants. (draft PR #239)
5. Lesson DNA, profile registry and Support/Core/Challenge difficulty. (stacked draft PR #240)
6. Per-task deterministic regeneration in Worksheet Studio. (stacked draft PR #241)
7. Standalone focus worksheet teacher flow. (stacked draft PR #242)
8. Existing Firebase Storage CEFR lexicon adapter and audit. (stacked draft PR #243)
9. Lesson-embedded Generator Content Pack authoring and readiness. (stacked draft PR #244)
10. Assignment source traceability, live entry points and student-profile work history.
11. Curriculum coverage expansion becomes a content-authoring operation, not a code rollout.

No unsupported lesson is presented as generatable. No production deployment is part of PR 1.
