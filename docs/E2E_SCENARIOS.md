# Browser scenarios (e2e)

Real browser (Playwright, Chromium) against the CRM dev server connected to local Firebase emulators: Auth, Firestore
with the real `firestore.rules`, Cloud Functions from `functions/` and Storage. Production is never touched: the
project id is `demo-keelesepp-e2e`, and `tests/helpers.cjs` `guard()` aborts every request to a production host and
fails the scenario on a page error.

## Run

```
cd e2e && npm ci && npx playwright install chromium   # once
./run.sh                 # all scenarios
./run.sh homework        # one file
```

Needs Java 21 for the emulators (`run.sh` uses `/opt/homebrew/opt/openjdk@21` when present). The functions emulator
reads `functions/.env.demo-keelesepp-e2e` (`ALLOWED_ORIGINS` for the dev server origin; no secrets). Secret Manager
403 lines in the output are expected — the demo project has no secrets and no scenario sends mail or calls LinkPay.
On a failure: `test-results/<scenario>/` has the screenshot and `trace.zip` (`npx playwright show-trace …`).

## Data

`seed.cjs` clears the emulators and writes the people in `fixtures.cjs` (admin, teacher, student Anna, parent Liis,
Olga who is a student and a parent), their cards (Kristi's card carries her mother's e-mail) and one published lesson
`e2e-001` „Minu päev” with a gaps block (5) and a choice block (5).

## Scenarios

| File | What is checked |
| --- | --- |
| `roles.spec.cjs` | the menu of each role: student, parent, student + parent, teacher (no finance/accounts), admin |
| `registration.spec.cjs` | a new student registers → admin approves → own card on first login; a mother whose e-mail is on her child's card gets a review `email_on_child_card` → „Seo lapsevanemana” |
| `invite.spec.cjs` | „Saada kutse” on Kaarel's card (he used his parent's login): the parent e-mail is refused, an own account is created and linked, the password is set from the e-mail link, he logs in to his own studies; a second click sends a new password link, never a second account |
| `observer.spec.cjs` | real WebRTC in three browsers (fake cameras): teacher invites Anna, she joins, the call starts; the admin opens „Käimasolevad tunnid” → „Vaata tundi”, receives both video+audio streams, never opens a camera or microphone; teacher and student see the eye badge and „Administraator vaatab tundi”; it disappears when the admin leaves, the call goes on |
| `room-bar.spec.cjs` | teacher in a recorded call: the lesson room's top bar has no overlapping buttons and nothing past its edge at 1920 / 1600 / 1440 / 1366 / 1280 / 1024 / 820 / 390 px (the phone's call row scrolls sideways by design) |
| `parent-edit.spec.cjs` | admin changes a parent's name, e-mail and phone on „Lapsevanemad”: Firebase login e-mail and name change (password stays), users doc and the child's card (parentName / parentEmail) follow, the parent logs in with the new e-mail; the seeded parent is restored afterwards |
| `combined-invoice.spec.cjs` | Anna learns Estonian and English (two cards, one per subject, one payer): „Kuuarved” with „Üks arve maksja kohta” makes ONE invoice through the real manualInvoiceApi (two lines, price per card from its plan, cardParts per card); both rows then show „(ühisarve)” with their own part and nothing is billed twice; cleans up after itself |
| `homework.spec.cjs` | teacher assigns the sheet from Õppevara → student opens it in Ülesanded, answers, hands in → stored `done` with score ≥ 90% → teacher sees it in Kodutööd |

## Bugs these scenarios found (fixed)

- Registration: reading one's own profile before it exists was a rules evaluation error (#624, rules deployed).
- Login: `signIn` resolves only after the account bootstrap call; a user who already moved on was thrown back to the
  home page a second later (`LoginPage` navigates only while it is still shown).
- Worksheet: an autosave timer firing during „Esita tööleht” wrote `in_progress` over the submitted work — the student
  saw „Esitatud 100%”, the teacher saw „Täidab” (`DocWorksheetPlayer` skips autosave while submitting).

## Not covered yet

Live lesson word card → „Minu vead”, reschedule request, parent invoice.
