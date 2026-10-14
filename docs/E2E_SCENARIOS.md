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
| `homework.spec.cjs` | teacher assigns the sheet from Õppevara → student opens it in Ülesanded, answers, hands in → stored `done` with score ≥ 90% → teacher sees it in Kodutööd |

## Bugs these scenarios found (fixed)

- Registration: reading one's own profile before it exists was a rules evaluation error (#624, rules deployed).
- Login: `signIn` resolves only after the account bootstrap call; a user who already moved on was thrown back to the
  home page a second later (`LoginPage` navigates only while it is still shown).
- Worksheet: an autosave timer firing during „Esita tööleht” wrote `in_progress` over the submitted work — the student
  saw „Esitatud 100%”, the teacher saw „Täidab” (`DocWorksheetPlayer` skips autosave while submitting).

## Not covered yet

Live lesson (invite → room → word card → „Minu vead”), reschedule request, parent invoice. Next PR.
