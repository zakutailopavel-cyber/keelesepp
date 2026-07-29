# KeeleSepp platform architecture

## Current shape

KeeleSepp is a progressively separated browser application. The CRM is still delivered from
`haldus.html`, while learning content and live teaching already have independent entry points:

- `haldus.html` — CRM, schedule, students, invoices and administration;
- `haldus-exercises/index.html` — learning library, curricula, exercises and assignments;
- `live-classroom.html` + `live-classroom.js` — private teacher desk and public student stage;
- `functions/` — trusted financial mutations and document/email generation;
- `firestore.rules` — authorization and browser-write schema boundaries.

This is an intentional migration path. A full rewrite would put working school operations at
risk, so new behavior must first be extracted behind small tested core modules.

## Tested browser contracts

### Learning library

`learning-library-core.js` is the source of truth for:

- adapting legacy curricula and exercises into one library item model;
- folder keys and labels;
- subject → level/age → curriculum/topic navigation;
- URL serialization and recovery of the current folder;
- conversion of a private material record into a public Live Classroom scene draft.

Folder URLs use `libSubject`, `libStage` and `libTopic`. Other query parameters are preserved.
When records have `curriculumId`, that immutable id is used as the folder key. Older records
continue to fall back to their curriculum title or topic and do not need a destructive migration.

### Live Classroom

`live-classroom-core.js` owns the public scene contract. A scene may contain only:

- type, title, body, bounded public options and version metadata;
- an optional minimal source reference (`kind`, `id`, `type`);
- an optional same-site action link to a learning task.

Answer keys, full worksheet objects and arbitrary links are not part of the public contract.
Every room scene update is versioned transactionally. Firestore rules repeat the same boundary
server-side and reject extra fields, external action links, invalid screen-share state and
non-sequential versions.

### Finance

Financial writes remain isolated from the learning-content slice. Browser screens can request
financial operations, but authoritative payment, credit, package and invoice mutations live in
Cloud Functions and are covered by unit and emulator tests.

## Firestore ownership

- `curriculumLessons`, `exercises` — staff-authored learning sources.
- `worksheetAssignments`, `homework`, `exerciseResults` — student-specific learning activity.
- `liveClassrooms` — one teacher and one student per current room.
- `liveClassrooms/{id}/responses` — append-only student responses for the current scene version.
- `activityLog` — operational audit events, including library assignment and classroom publish.
- financial collections — governed by the financial core and its immutable audit model.

Assignment records copy display metadata for historical readability and also store stable
`sourceId` and `curriculumId` references when available.

## Safe evolution rules

1. Preserve legacy records and add optional fields; do not rewrite history merely to fit a new UI.
2. Put reusable classification, validation and conversion logic in a tested core module.
3. Treat the student stage as a public projection, never as a view of the teacher workspace.
4. Use transactions for versioned or auditable state transitions.
5. Deploy `firestore.rules` separately after the web release is merged.

## Next extraction seams

The remaining large files should be reduced incrementally:

1. extract the library React view and assignment dialogs from `haldus-exercises/index.html`;
2. extract Live Classroom room transactions into a dedicated service module;
3. split CRM domains from `haldus.html` one workflow at a time;
4. add a versioned learning-history collection for completed classroom scenes;
5. add a migration tool that can attach stable curriculum ids to legacy topic-only records.

These are bounded extractions, not a request to replace the platform in one release.
