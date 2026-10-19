# Teacher UID migration runbook

This change prepares the legacy CRM for teacher-scoped reads without moving data to another Firebase project and without changing the CRM v2 branch.

## Safety model

- `students`, `lessons`, and `schedule` keep their current staff-wide behavior while `securityMigrations/teacherUidV1.readEnforced` is absent or `false`.
- The backfill never overwrites an existing valid `teacherUid`.
- Unknown teacher names, ambiguous staff identities, and stale UIDs block both apply and enforcement.
- Records with no assigned teacher are reported separately and remain admin-only after enforcement.
- The browser can read migration state and the canonical teacher directory, but cannot modify them.
- Only an authenticated administrator can preview, apply, enforce, or roll back through the Cloud Function.

## Rollout order

1. Deploy the Function, Firestore rules, and compatible legacy clients. Do not enforce yet.
2. Call `POST /teacherScopeMigrationApi/preview` with an administrator Firebase ID token.
3. Resolve every item in `directoryConflicts` and `unresolved`. Review `unassigned` deliberately.
4. Call `POST /teacherScopeMigrationApi/apply`. This writes missing UIDs and the canonical directory, but leaves `readEnforced: false`.
5. Smoke-test the old CRM as an administrator and as every active teacher. Confirm new students, lessons, and schedule entries contain `teacherUid`.
6. Call `POST /teacherScopeMigrationApi/enforce`. The endpoint recalculates the full plan and refuses enforcement if a required patch or unresolved identity remains.
7. Verify each teacher sees only their own students, lessons, and schedule entries; verify administrators retain full access.

Use `POST /teacherScopeMigrationApi/status` to inspect the current state.

## Immediate rollback

If a teacher loses expected access, call `POST /teacherScopeMigrationApi/rollback` with an administrator token. This changes only `readEnforced` back to `false`; it does not delete migrated UIDs or business data. Investigate with `/preview`, correct the records, apply again if needed, and only then re-enable enforcement.

Do not edit the migration document from a browser client and do not enable the flag manually before the smoke test.
