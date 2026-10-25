# E-mails to students and parents (owner decision 2026-10-25)

Notification e-mails from KeeleSepp to students and their parents. Invoices, payment reminders
(`sendInvoicePaymentReminders`, Finantsid) and the existing „Uus kodutöö” e-mail (`notifyHomeworkCreated`) are separate
and keep working as before (the new-homework e-mail now also respects the recipient's opt-out, see below).

Code: `functions/learner-email-core.js` (pure rules, texts, tokens), `functions/learner-email-service.js` (Firestore and
sending), glue in `functions/index.js` (triggers, tick, routes). CRM: Seaded → „E-kirjad õpilastele ja vanematele”
(`crm-v2/src/features/settings/LearnerEmailsCard.jsx`), public page `/e-kirjad/<token>`
(`crm-v2/src/features/learner/EmailPreferencesPage.jsx`).

## The seven e-mail types

Every type is **off** until the administrator switches it on in Seaded and saves. Nothing is sent before.

| Type (`id`) | When | Content |
| --- | --- | --- |
| Tunni meeldetuletus (`lessonReminder`) | daily at the chosen hour (default 17:00 Tallinn time) for tomorrow's lessons | date, time, length, subject, teacher, place (online / room + school address) |
| Tund tõsteti ümber (`lessonMoved`) | a staff change of a future lesson, 10 min after the last change | old and new time; for a weekly series: old and new weekday/time and „from” date |
| Tund jääb ära (`lessonCancelled`) | a staff cancellation of a future lesson, 10 min later | the cancelled date and time |
| Uus tunniplaan (`newSchedule`) | the planner's „Kinnita ajakava” (see contract below), 3 min after the batch's last lesson | weekly times, extra one-off lessons, start date, teacher(s), school address |
| Kodutöö tähtaeg homme (`homeworkDue`) | daily at the chosen hour for homework due tomorrow that is not handed in or closed | task text, due date, teacher |
| Töö on kontrollitud (`homeworkChecked`) | the teacher reviews a handed-in worksheet / exercise for the first time (`reviewStatus: 'reviewed'`) | title, grade, teacher's feedback |
| Teated (`announcement`) | a published, active announcement (Suhtlus → Teated) published after the type was switched on | title and text; only accounts that have not answered yet |

Lesson reminder selection uses the calendar's own rules (`crm-v2/src/features/calendar/calendarView.js`
`eventOccursOn` / `occurrenceStatus`, mirrored in `learner-email-core.js occursOn`): weekly series expanded by weekday,
`startDate` / `endDate`, `excludedDates`, `occurrenceStatuses[date] = Tühistatud`, cancelled one-off lessons and
drafts skipped, a moved occurrence appears at its new date (its own `schedule` doc), group lessons
(`groups/{id}.lessons[]`, `studentLessonMap`) included. Only live cards (`active !== false`, not archived, not merged).

### Who confirmed a change

Only staff can write `schedule` (firestore.rules): a student or parent can only *ask* („Ei saa tulla?” →
`lessonChangeRequests`, status `pending`), and the teacher's „Kinnita” in the calendar moves the lesson (the normal
calendar move). So every schedule change is a change confirmed by the teacher (or the administrator on the teacher's
behalf); a pending, declined or withdrawn request sends nothing. What is e-mailed (`scheduleChangeNotices`):

- one-off lesson: date or time changed, or status → `Tühistatud` (only if the old date is today or later);
- weekly series: a date added to `excludedDates` or `occurrenceStatuses[date] = Tühistatud` → at send time it is a move
  (a child doc with `movedFromSeriesId` + `movedFromDate`, or the older `seriesId` + `originalOccurrenceDate`) or a
  cancellation; weekday/time of the series changed; a continuing series created by „this and the following”
  (`continuesSeriesId`).

Not e-mailed: deleting a one-off lesson (a mistake being removed), ending a series (`endDate`), marking held / absent,
changes to past lessons, drafts, lessons carrying `plannerBatchId` (they get „Uus tunniplaan”), group lesson changes
(no group lessons in production on 2026-10-25; the reminder does cover groups).

The 10-minute settle window: the job is re-checked against the data as it is *then* (`resolveLessonChange`). The
calendar's „Võta tagasi” inside the window → nothing is sent; several quick moves → one e-mail with the first old time
and the final new time.

## Planner contract (for `agent/calendar-planner`)

When „Kinnita ajakava” writes lessons:

1. Every new `schedule` doc carries **`plannerBatchId`** (string, the same for the whole confirmation, e.g. a random
   id) and `source: 'planner'` (recommended; the trigger keys on `plannerBatchId`). Note: `scheduleService.create`
   overwrites `source` with `keelesepp-crm-v2` — write `source` explicitly or accept that only `plannerBatchId` counts.
2. Usual schedule fields: `studentId`, `teacher`/`teacherFull`, `teacherUid`, `recurring`, `day`, `time`, `duration`,
   `startDate`/`date`, optional `endDate`, `subject`, `online`, `roomName`; `status: 'Planeeritud'`. Lessons with
   `status: 'Tühistatud'` or `draft: true` are left out of the e-mail.
3. Write the docs only at „Kinnita” (not drafts). The e-mail goes 3 minutes after the last doc of the batch was written
   (each new doc of the batch pushes the time; a batch whose e-mail has started is not re-sent).
4. If the confirmation also changes or ends existing lessons of the same students, set the same `plannerBatchId` on
   those docs too: then no separate „moved / cancelled” e-mails go out for them.
5. Optional `plannerBatches/{batchId}` doc (server reads it, the planner may write it; no rules yet — add them in the
   planner PR if the browser writes it): `{ status: 'confirmed' | 'draft' | 'cancelled', notify: boolean }`.
   `notify: false` or status `draft` / `cancelled` → no e-mail for that batch.

One e-mail per student card per batch (to the student's addresses and to each parent address).

## Recipients, language, opt-out

- Student: the card's `email` + e-mails of linked student accounts (`linkedUserId`, `studentUid`, `linkedUserIds`).
- Parents: `parentEmail`, `guardianEmail`, `parentContacts[].email` + linked parent accounts (`linkedParentId`,
  `parentUid`, `guardianUid`, `linkedParentIds`). Disabled / pending / rejected accounts are skipped.
- Each address gets its own e-mail (one person never gets the same one twice); a card without any address gets
  nothing (job `skipped`, reason `no-email`). The homework types also respect the card's `homeworkEmailOptOut`.
- Announcements go only to the accounts in the announcement's audience (they must log in to answer).
- Language: the address's own choice on `/e-kirjad/<token>` (`et` | `ru` | `both`), else `preferredLanguage`
  (`'et' | 'ru' | 'en'`, added by `agent/missing-data-gate`) — on the student card for the student's addresses, on the
  parent's user profile for that parent — when it is `et` or `ru`; otherwise (none, or `en`: no English texts yet)
  **Estonian first, then Russian** in one e-mail. No other language field is read.
- Opt-out: every e-mail's footer links to `https://crm.epkoolitus.ee/e-kirjad/<token>` (no login; the token is the
  address signed with HMAC-SHA256, key in server-only `serverConfig/learnerEmail`, created on first use). The page
  turns the notifications off / on and picks the language → `emailPreferences/<sha256(address)>`. SMTP mails also carry
  `List-Unsubscribe` + `List-Unsubscribe-Post` (one click in Gmail / Outlook → `staffOperationsApi
  /email-preferences/one-click`). Opt-out covers the seven types and the new-homework e-mail; invoices and payment
  reminders are not affected.

## Sending, idempotency, limits

- Triggers only queue: `queueLearnerScheduleEmail` (`schedule` onWrite), `queueLearnerWorksheetReviewEmail` /
  `queueLearnerExerciseReviewEmail` (onUpdate). A trigger reads the settings only when the write is a relevant change.
- `learnerEmailsTick` (every 5 minutes, Europe/Tallinn): does nothing while every type is off; else (one tick at a time,
  lease `learnerEmailRuns/lease`) creates the daily jobs once a day from the chosen hour until 21:59 (marker
  `learnerEmailRuns/{lessonReminder|homeworkDue}`), queues announcements, then sends due jobs.
- Job ids are deterministic (`lessonReminder__<schedule>__<date>__<student>`, `lessonChange__<schedule>[__<date>]`,
  `lessonChange__series__<schedule>`, `newSchedule__<batch>`, `homeworkDue__<homework>__<date>`,
  `homeworkChecked__<collection>__<doc>`, `announcement__<id>`): one e-mail per occurrence / item per recipient. Each
  sent address is recorded on the job (`done`), so a retry never repeats it.
- At most 40 messages per tick (≈ 480 an hour) with a 0.4 s pause; the rest waits for the next tick. A delivery error
  retries after 15 min, after 3 attempts the job is `failed`. A job older than 36 h is dropped (`stale`).
- Daily times are Tallinn wall-clock (`Intl`, DST-safe; tested on 25.10.2026).
- Log: `emailLog` (administrator reads; server writes): kind, job id, ids (schedule, student, homework, announcement,
  batch), recipient count, opted-out count, status, reason — no addresses. `deliverEmail` still writes each message to
  `emailQueue` like every other e-mail (administrator and bookkeeper read).

## Settings (`emailSettings/learner`, administrator only)

`{ dailyHour: 6–21, siteAddress, types: { <id>: { enabled, enabledAt, subjectEt, subjectRu, introEt, introRu } },
updatedAt, updatedBy, updatedByName }` — the rules require the full shape (all seven types, all six keys). Empty text =
default text. Placeholders per type (Seaded shows them; unknown ones disappear): `{õpilane}`, `{kuupäev}`, `{kell}`,
`{uus_kuupäev}`, `{uus_kell}`, `{õpetaja}`, `{algus}`, `{tähtaeg}`, `{ülesanne}`, `{töö}`, `{hinne}`, `{pealkiri}`.
Seaded also shows a preview (`/learner-emails/preview`, sample data, unsaved texts included), „Saada proov mulle”
(`/learner-emails/test`, one e-mail to the administrator's own address, subject `[PROOV]`) and the last 30 log rows.

## Collections

| Collection | Access |
| --- | --- |
| `emailSettings/learner` | administrator read / write (validated) |
| `emailLog` | administrator read, server write |
| `learnerEmailJobs`, `learnerEmailRuns`, `emailPreferences`, `serverConfig`, `plannerBatches` | server only (closing deny rule) |

## Deploy

Functions: `learnerEmailsTick`, `queueLearnerScheduleEmail`, `queueLearnerWorksheetReviewEmail`,
`queueLearnerExerciseReviewEmail` (new), `staffOperationsApi` (routes), `notifyHomeworkCreated` (opt-out), and
`deliverEmail` callers (List-Unsubscribe header support). Rules: `emailSettings`, `emailLog`. Front end: Seaded card and
`/e-kirjad/:token`. After deploy everything stays off until the administrator switches types on.
