# Backups and restore

What is copied, what is not, and how to get data back. Written 2026-11-28 (audit point 5). One trial restore of the
database was made that day (see „Trial restore” below): restoring into a side database works and takes about a
quarter of an hour. Everything else — copying records back, scenario B, restoring files and accounts — comes from the
CLI's own help and Firebase's documented behaviour and has **not** been tried here.

Project `keelesepp-5136b`. The facts in „What exists” were read from the live project on 2026-11-28 (read-only calls);
re-check them with the commands shown before relying on them.

## What exists

| Data | Where | Copy | How far back |
| --- | --- | --- | --- |
| Database (students, lessons, invoices, payments, courses…) | Firestore `(default)`, `europe-west3` | Firestore scheduled backups, since 2026-11-09 | daily, kept 14 days; Sunday's, kept 8 weeks |
| Files (homework, recordings, board pictures, textbook art uploads, accounting documents) | Storage bucket `keelesepp-5136b.firebasestorage.app`, `us-east1` | **none**; only the bucket's soft delete | a deleted or overwritten file: 7 days |
| Login accounts (e-mail, password hash, Google sign-in) | Firebase Authentication | **none** | — |
| Code, rules, course content in the repository | GitHub `main` | git history | everything |
| Function secrets (`SMTP_PASS`, `EKILEX_API_KEY`, `CLOUDFLARE_TURN_*`, LinkPay) | Secret Manager | **none**; the owner has the originals at the providers | — |
| The app on Vercel | built from `main` | rebuilt from git | — |

State on 2026-11-28: 16 backups, all `READY`, newest snapshot 2026-11-27 21:01 UTC. The daily backup is taken in the
evening (19:00–21:00 UTC so far), so **up to a day of work can be lost**: what was entered after the last snapshot is
not in any backup.

Not switched on (each is the owner's decision, some cost money):

- **Point-in-time recovery** is `DISABLED`. With it Firestore could be read as it was at any minute of the last 7 days.
  Without it only the last hour can be read back (`Version Retention Period 3600s`).
- **Delete protection** of the database was `DISABLED` until 2026-11-28; the owner had it switched on that day
  (`DELETE_PROTECTION_ENABLED`, checked after the change). Deleting `(default)` now needs the protection taken off first.
- **Object versioning** on the Storage bucket is off: there is the 7-day soft delete and nothing after it.
- No export of the login accounts is kept anywhere.

## Look at what is there (read-only)

```sh
firebase firestore:backups:schedules:list --database "(default)" --project keelesepp-5136b
firebase firestore:backups:list --project keelesepp-5136b
firebase firestore:databases:get "(default)" --project keelesepp-5136b
```

A backup's name looks like `projects/keelesepp-5136b/locations/europe-west3/backups/<id>`; the list shows its snapshot
time. Pick the newest snapshot that is **older than the damage**.

## Trial restore (2026-11-28)

Backup `84ca3854…` (snapshot 2026-11-27 21:01 UTC) was restored into a side database `restore-test` of the same
project with the command of scenario A.2, compared with production by document counts only, and deleted.

- Started 09:53:03 UTC. The command returns in seconds; the restore runs on.
- ~11 minutes later the database began to answer, but for about one more minute some requests still returned „Cannot
  serve requests when the database is undergoing a restore”. Steady answers from about 10:05 UTC: **12–13 minutes**
  for ~30 000 documents in top-level collections. **Do not trust the first good answer** — wait for a few minutes of
  answers without that error before reading or copying anything.
- 112 top-level collections in both. `students` 232 = 232, `invoices` 134 = 134, `payments` 118 = 118, `users`
  130 = 130. Fifteen collections differed, each by what was written after the snapshot (`lessons` 644 → 647,
  `schedule` 890 → 893, `worksheetVersions` 13 506 → 13 542, …); `aiRequests` had more in the backup (11 → 3: old ones
  are cleaned up).
- Not compared: the content of documents and the subcollections (board elements, call signals, messages of rooms).
- The restored database came up with delete protection and point-in-time recovery off and without rules.
- Deleted 10:08:44 UTC with `firebase firestore:databases:delete restore-test`; `firebase firestore:databases:list`
  showed only `(default)` afterwards.

## Rules before any restore

1. Stop and find out what was lost and when. A restore brings back the state of the snapshot — everything entered
   after it is not in it.
2. A Firestore backup **cannot be restored over the live database**. It is always restored into a new database with
   another id. So nothing in this file overwrites production by itself; the dangerous steps are the copy-back script
   and the delete in scenario B, and both need the owner's explicit yes (AGENTS.md).
3. A restored database has **no security rules**: the browser cannot read it, only the Admin SDK and the console can.
   It holds real personal data — delete it when the work is done.
4. A second database costs storage for as long as it exists (the project is on the Blaze plan).
5. Write what was done into `docs/PROJECT_STATE.md` and, for rules / functions, `docs/DEPLOY_LEDGER.md`.

## Scenario A — some records were deleted or spoiled (the likely one)

A wrong merge of two cards, a script that wrote the wrong field, a deleted invoice.

1. Within the first hour: the records can still be read as they were, without any backup (the last hour of versions is
   kept). Read them with the Admin SDK at a `readTime` before the damage and write them back. No restore needed.
2. Later: restore the backup into a side database.

   ```sh
   firebase firestore:databases:restore \
     --backup projects/keelesepp-5136b/locations/europe-west3/backups/<id> \
     --database restore-YYYYMMDD --project keelesepp-5136b
   firebase firestore:databases:get restore-YYYYMMDD --project keelesepp-5136b   # wait until it is ready
   ```

3. Compare and copy back with an Admin SDK script, run from a fresh checkout of `origin/main`: open both databases
   (`getFirestore(app)` and `getFirestore(app, 'restore-YYYYMMDD')`), print what would change (dry run), show the
   owner, then write only the named documents into `(default)`. Never copy a whole collection blindly — newer records
   would be overwritten with week-old ones.
4. Mind what hangs on a record: a lesson has its journal entry, token ledger and invoice line; an invoice has payments
   and accounting entries. Bring a group of records back together or not at all.
5. Delete the side database: `firebase firestore:databases:delete restore-YYYYMMDD --project keelesepp-5136b`.

## Scenario B — the whole database is gone or unusable

1. Tell teachers the system is down. Do not let anyone enter data meanwhile — it would be lost again.
2. Restore the newest good backup into a side database (as in A.2) and check it: counts of `students`, `lessons`,
   `invoices`, `payments`; the newest lesson and invoice dates.
3. The app, the functions and the rules all use the database id `(default)`. Two ways on:
   - **Restore into `(default)` itself.** Only possible when no `(default)` exists: take the delete protection off
     (`firebase firestore:databases:update "(default)" --delete-protection DISABLED`), delete the broken database
     (`firebase firestore:databases:delete "(default)"` — irreversible, owner's yes, and only after step 2 proved the
     backup good), restore the same backup with `--database "(default)"`, and switch the protection on again.
   - Keep the broken database for inspection and point everything at the new id instead — the web client, every
     function and the rules deploy would need changing. Slower and never tried; only if the old data must stay.
4. After the restore: `firebase deploy --only firestore:rules,firestore:indexes` (a restored database starts without
   rules — check the live rules with `tools/deploy-status/deploy-status.mjs`), then redeploy the functions with
   Firestore triggers (`syncLessonTokens`, `autoMarkLiveLesson`, `notifyHomeworkCreated`, …) and watch their logs.
5. Re-enter by hand what happened after the snapshot: lessons marked, payments recorded, invoices issued. The bank
   statements and the invoice e-mails already sent are the source for the money part.
6. Turn the backup schedules on again if they did not come back with the database:
   `firebase firestore:backups:schedules:list` — a schedule belongs to a database.

## Files (Storage)

There is no backup. What helps:

- A file deleted or overwritten in the last 7 days is kept by the bucket's soft delete. Listing and restoring it needs
  the Google Cloud CLI (`gcloud storage ls --soft-deleted gs://keelesepp-5136b.firebasestorage.app/<path>` and
  `gcloud storage restore gs://…/<file>#<generation>`), or the Cloud console. **`gcloud` is not installed on the
  owner's Mac** (2026-11-28) — install it before it is needed.
- After 7 days a deleted file is gone. If the bucket itself is deleted, soft delete keeps its objects for 7 days too.
- What a file was about usually survives in Firestore (the homework task, the worksheet answers, the lesson record);
  the file itself — a photo of homework, a recording, a board picture — does not.

## Login accounts

No copy exists. If Authentication were lost, every user would need a new account and every card re-linking
(`students.linkedUserId`, `users/{uid}`). An export is one command — `firebase auth:export <file>.json --project
keelesepp-5136b` — but the file holds password hashes and e-mail addresses: it must not go into the repository or a
shared folder. Importing it back needs the project's hash parameters (Firebase console → Authentication → Users → ⋮ →
Password hash parameters).

## What to do to make this real (owner's decisions)

1. ~~Trial restore~~ — done 2026-11-28, see below. Repeat it a few times a year and after any change of the schedules.
2. ~~Delete protection~~ — switched on 2026-11-28.
3. Switch on **point-in-time recovery** (extra storage cost): the loss window drops from a day to a minute for the last
   7 days. `firebase firestore:databases:update "(default)" --point-in-time-recovery ENABLED`.
4. **Object versioning** on the Storage bucket with a lifecycle rule that deletes old versions after e.g. 30 days, or
   a weekly copy of the bucket to a second bucket.
5. A monthly **account export** kept by the owner outside the repository.
6. Install `gcloud` on the owner's Mac and sign in once — also needed by `tools/deploy-status/deploy-status.mjs`.
7. A weekly check that the newest backup is younger than 26 hours (could be a step in `daily-smoke.yml`; needs a
   read-only service account in CI).
