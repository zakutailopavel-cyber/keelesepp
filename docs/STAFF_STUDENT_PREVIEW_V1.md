# Staff Student Preview v1

## Purpose

Staff can verify a student's assigned interactive lesson without asking the student or parent to join.
This is a server-authorized read-only projection, not account impersonation. Staff retain their own
Firebase identity throughout the session.

## Flow

`Interactive lessons -> Kontrolli õpilase vaadet -> student -> assignment -> student projection -> exit`

The student selector is scoped by the existing `students` API: administrators can choose any student;
teachers can choose only cards whose `teacherUid` matches their authenticated UID. `previewStart`
rechecks the same scope on the server, queries assignments by immutable `studentId` and appends an
`activityLog` event with action, actor UID/role, student ID and server timestamp.

Each preview `get` checks both normal assignment access and that the selected preview student matches
the assignment. It returns `core.project(...)`, the same answer-safe student lesson projection, and
does not return `teacherContent`.

## Write boundary

Preview mode does not render answer controls, save, submit or review controls. It does not read or write
the student's local recovery key. The trusted API independently keeps answer mutations restricted to an
authenticated student whose UID equals `assignment.studentUid` while the assignment is active.

Therefore changing browser parameters or calling `save`/`submit` from a staff session remains rejected.

## Data and deployment

No schema migration, Firestore rule change or index is required. The only new production write after
rollout is the append-only audit event when staff explicitly starts a preview. Existing assignments,
answers, evidence, sessions, `students.skillMap`, curriculum progress and financial data are unchanged.

The feature requires the web assets from the merged main deployment and a selective update of
`interactiveLessonApi`. Firebase production deployment remains an owner gate.
