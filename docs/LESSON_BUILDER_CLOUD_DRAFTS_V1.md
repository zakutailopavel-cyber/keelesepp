# Cloud Draft Library v1

## Scope and identity

Authenticated teacher/admin cloud persistence and immutable publication; no assignment or runtime
teaching integration. The existing JS lessons, LearningSession, evidence and completed sessions are
unchanged. Publication does not make teacher answers public or assign a lesson to a student.

- `lessonDrafts/{draftId}`: mutable `content` (existing authoring draft), `schemaVersion:1`,
  server `lessonId`, `ownerUid`, `revision`, `status:active|archived`, `versionNumber`, optional
  `lastPublishedVersionId`, `createdBy`, `updatedBy`, server `createdAt`, `updatedAt`; archive adds `archivedBy`, `archivedAt`.
- `lessonVersions/{lessonVersionId}`: immutable `content`, `lessonId`, `lessonVersionId`,
  sequential `versionNumber`, `sourceRevision`, `ownerUid`, `createdBy`, server `createdAt`.
  IDs are `<lessonId>_v<zero-padded version number>`; transaction.create prevents overwrite.
- `publishedLessons/{lessonId}`: trusted current-version pointer and title/owner/update audit.
  Registry preserves createdBy/createdAt and updates updatedBy/updatedAt. It is staff-only, not public anonymous content.

Create assigns new draft and lesson UUIDs on the server; content.id becomes draftId. Activity IDs
and text are preserved. Duplicate creates new logical draft/lesson IDs, preserving activity IDs
within that new lesson namespace. Save never changes draft ID. Published v1 remains byte-for-byte
independent when draft changes or v2 is published. Archive retains draft content and history;
it does not unpublish existing immutable versions. There is no hard-delete or version-write API.
LearningSession currently accepts only its existing trusted JS lessons and cannot reference these
mutable drafts. Future assignment must pin `{lessonId, lessonVersionId}`, never resolve a mutable
draft or floating registry pointer for an existing session.

## Trusted API

One HTTPS Function: `lessonDraftsApi` in `us-central1`.
`POST https://us-central1-keelesepp-5136b.cloudfunctions.net/lessonDraftsApi`
with Firebase Bearer ID token. Each request checks token revocation, users/{uid} role teacher/admin,
disabled/status fields. Teacher can access own records; admin can access a known draft across
owners. My drafts lists only the caller's own library. No student/parent/finance access, and no
client-provided role or ownership fields are trusted. Role is not inferred from email/name.

| action | input | result |
|---|---|---|
| create | content | server-assigned draft at revision 1 |
| list | optional cursor | caller's 50 draft summaries, nextCursor |
| get | draftId | exact content + revision, including archived |
| save | draftId, revision, content | revision + 1 |
| duplicate | draftId, revision | new draft at revision 1 |
| archive | draftId, revision | retained draft, archived, revision + 1 |
| publish | draftId, revision | immutable version + registry + revision + 1 atomically |
| history | draftId, optional cursor | 50 immutable version summaries |
| version | draftId, lessonVersionId | exact read-only version |

Save/archive/publish/duplicate read and check revision inside the transaction. Stale requests
return HTTP 409; archived drafts reject mutations. Publish revalidates saved content, not client
payload. Unknown actions return 400. Client cannot supply a version overwrite ID. Create/duplicate
have no automatic network retry; an ambiguous response should be resolved by opening My drafts
before retry, because a separate retry can create another logical draft.

Requests are capped at 704KB; content at 700KB UTF-8, below Firestore's document limit. JSON depth
and dangerous keys are bounded; existing normalized contract validates IDs, duplicate IDs,
routes, prompts, metadata and authoring/context fields. Orphan authoring activity metadata is
rejected. The two exact browser contract modules are vendored in `functions/lesson-contract/`
because Firebase deploy packages only functions/. A unit test enforces byte parity; update both
copies whenever the shared modules change. No second validation schema replaces the contract.

## Rules / indexes / security

Explicit deny-all client rules for all three collections (reads and writes), including admin.
All access is through the authenticated scoped API using Admin SDK. Existing rules are unchanged.
No composite index change: equality on ownerUid or lessonId plus document-ID pagination uses
standard indexing. Content and response payloads are not logged. CORS permits production aliases
and this project's preview domain pattern, localhost only in emulator. CORS is not authorization.

## Builder

Local autosave remains unchanged. Cloud save is explicit; My drafts, cloud duplicate/archive,
publication and read-only history are separate controls. Auth SDK loads only upon cloud action;
preview still calls neither cloud API nor LearningSession API. Signed-out users keep local editing
and receive a login link. Cloud revision bindings are stored separately by local draft ID and UID;
restoring a stale binding cannot silently advance revision. Conflict preserves local content and
offers deliberate cloud reopen or saving local work as a new copy. Reopen asks before replacing
local work. Current local edits must equal saved cloud content before publishing. No automatic
copy of JS lessons: existing Copy school lesson remains local until explicit Save cloud.

## Verification / rollout gate

Verified CI run 34122576802: 160 Functions + 257 CRM + 13 browser + 25 existing emulator + 14 cloud emulator = 469 PASS. A final school-copy validation test is added; final results are recorded in the PR.
No Firebase production deployment, migration, indexes, student evidence, skillMap, mastery,
credit, curriculumProgressEvents or completed-session mutation is permitted by this code workstream.
Vercel preview alone cannot enable the cloud backend. Until the Function is deployed, cloud calls
fail visibly and local authoring remains available.

Required owner-reviewed deployment, not executed:

```sh
firebase deploy --project keelesepp-5136b --only functions:lessonDraftsApi,firestore:rules
```

This deploy exports only the new Function and applies explicit client denials for the three new
collections. No existing Function deployment, index, data migration, backfill or destructive change.
Before permission, review exact branch diff, emulator results, collections, rules and this command.
After approved rollout, smoke with an owner-authored draft; no student teaching/evidence test data.
