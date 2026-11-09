# Sõnad: spaced repetition and flashcards (2026-11-09)

Phase 1 of the Duolingo-like learning area in the student cabinet. Owner goal: „нормальные флэш-карточки для изучения
слов … максимально красиво и эффективно”. Phase 2 (sentence / grammar exercise engine, `features/practice/engine/`) and
phase 3 (path, streak, XP, pet) are separate; this phase only exposes the hook for them.

## Files

| File | What |
| --- | --- |
| `crm-v2/src/features/vocabulary/srs.js` | The scheduler. Pure functions, no Firebase/React. Tests: `srs.test.js`. |
| `crm-v2/src/features/vocabulary/FlashcardSession.jsx` + `flashcards.css` | The „Kaardid” flashcards (default study way). |
| `crm-v2/src/features/vocabulary/cardFace.js` | What a card shows: part of speech, meaning per language, named forms, example, „when next”. |
| `crm-v2/src/features/vocabulary/dailyReview.js` | `dailyPlan` = „Täna kordamiseks” on the queue; `dailyWords` (summary-field pick) for the pet's feeding. |
| `crm-v2/src/services/firebase/studentWords.js` | `rate(word, { direction, rating, nextSide })`; `review(word, knew, direction)` = rate with Hea/Uuesti. |
| `crm-v2/src/features/practice/events.js` | `announcePractice(event)` / `onPractice(listener)` — the hook for phase 2/3. |
| `firestore.rules` `studentWordSrsValid` | Shape check of the new `srs` field. Emulator test: `functions/student-words-own-emulator.integration.js`. |

## Algorithm: FSRS-lite

- Memory model: FSRS-4.5 with its published default weights (`W` in `srs.js`). Stability `s` (days until recall
  falls to 90 %), difficulty `d` (1–10), retrievability `R = (1 + 19/81 · t/s)^-0.5`; the next interval is the day R
  reaches the desired retention 0.9 (= `s` days), at least 1 day, at most 365. No fuzz: same answers → same dates.
- Four answers: **Uuesti** (again) · **Raske** (hard) · **Hea** (good) · **Lihtne** (easy). In review the interval
  order Raske < Hea < Lihtne is enforced.
- New word: learning steps **1 min → 10 min** (Uuesti → 1 min, Raske → 5.5 min, Hea → next step, Lihtne → straight to
  days, ~14 d). Within the steps stability moves by the FSRS-5 short-term formula. The first graduation with Hea is
  capped at **3 days** (`FIRST_GOOD_MAX_DAYS`, beginners forget fast).
- Lapse (Uuesti in review): `lapses + 1`, stability by the FSRS forget formula, relearning step **10 min**, then days.
- In a session (`startSession` / `rateInSession` / `pickNext`) a card due within **20 min** (`LEARN_AHEAD_MIN`) comes
  back in the same session; when nothing is due yet the earliest learning card is shown (learning ahead), never the same
  card twice in a row if another waits. A card leaves the session when its next time is further away.

## Directions

Each word has two independent sides: `r` = recognition (Estonian word → meaning) and `p` = production (meaning →
Estonian word). `p` opens once `r` has left the first learning steps (`reverseOpen`: r in review or relearning). The
student's own corrected sentences („Sinu lause: …”) are asked one way only.

## Storage (`studentWords/{id}`) and migration

```
srs: { v: 1, r: Side, p?: Side }   // p only written once started
Side = { state: 'new'|'learning'|'review'|'relearning', s, d, due (ISO), last (ISO), reps, lapses, step, intro (YYYY-MM-DD) }
```

- Every answer writes exactly `srs`, `box`, `dueAt`, `reviewedAt`, `reviews` (`ratingPatch`). The old Leitner fields
  stay as a **summary** for everything else that reads them (pet, word growth, teacher report, skill estimate, home
  steps): `box` = Leitner box matching `r`'s stability (0 while learning), `dueAt` = the earliest due of the started
  sides, `reviews` + 1.
- **Lazy migration** (`fromLegacy`, `wordSrs`): a word without `srs` is read from its Leitner fields — never answered →
  new; box 0 but answered → relearning (lapse 1, due = old `dueAt`); box ≥ 1 → review with stability = the box's days
  (1/3/7/14/30), due = old `dueAt`. Nothing is written up front; the first answer stores the migrated state. `p` starts
  new for old words (they were practised mostly et → meaning).
- Words are still created with `box: 0` and no `srs` (create rule unchanged).
- Before the new rules are deployed the `srs` write is refused (`permission-denied`); `rate` then writes the summary fields only, and the schedule is migrated again from them later.
- Course lesson decks (published sheets, „Teemad”) have no word doc: their cards are scheduled in memory only (learning
  steps work within the session, nothing is saved), exactly as before.

## Daily queue „Täna kordamiseks” (`buildQueue`, `dailyPlan`)

1. Everything due now: learning/relearning steps first, then reviews by due time (most overdue first), max 200.
2. Own corrected sentences: at most 2 per queue, one direction.
3. New sides up to the daily cap **10** (`DAILY_NEW`) minus sides first answered today (`intro === today`), oldest
   words first, `r` before `p`.

The „Sõnad” hero shows „Täna kordamiseks: N” (· X kordamist · Y uut · Z ununeb) and „Alusta” opens the queue in
„Kaardid”; `?paev=1` (home page step) opens it at once. When the queue is empty: „Järgmine kordamine: homme / täna kell
…”. `dailyPlan(...).done` keeps the home-page contract of 2026-10-23 (five answers today, or all of a shorter queue).

## Flashcards UI

One big card, 3D flip (`prefers-reduced-motion`: no flip/slide/fly-out, the answer simply replaces the question).
Front: the word (or the meaning for `p`), part-of-speech chip (from `pos` or the forms: tegusõna / käändsõna / väljend /
lause), sound button. Back: the answer, key forms with names (nimetav · omastav · osastav, or ma · da · tema for verbs,
plus up to two saved forms such as mitmus), the course example sentence, sound. Sound: the card's own `audio` file if
given, else the browser's Estonian `speechSynthesis` voice (`et-EE`); no Estonian voice → no button. No paid TTS.
Answer: 4 buttons with the next interval („10 min”, „3 p”), keys **1–4** (only after turning), **Space/Enter** turns,
swipe on touch **→ Hea, ← Uuesti, ↑ Lihtne** (the first swipe on an unturned card only turns it). Progress bar = cards
finished / cards in the session. End screen: first-try correct %, new words learned, answers, minutes, the next review
time, the words answered „Uuesti” („Korda raskemaid”, „Lisa raskemad minu sõnadesse” for course words). Colours only
from the tokens (`--surface`, `--ink`, `--muted`, `--border`, `--green`, `--danger`, `--amber`) → the dark theme follows.

Other ways (Õpi, Kirjuta, Sobita, Test) are unchanged; their answers now call `onResult(card, knew, dir)` and the page
saves them as Hea/Uuesti on the asked direction (first answer per word and direction in a session).

## Hook for phase 2/3

```js
import { announcePractice, onPractice } from '../practice/events.js';
const stop = onPractice((event) => { /* { kind: 'words', reviewed, correct, minutes, cards, learned, at } */ });
```

The flashcards announce once per finished session. Keep the module minimal (two functions, no state, no React).

## Not done / limits

- Weights are FSRS defaults, not fitted to our students (could be optimised later from `srs` history — there is no
  review log, only the current state).
- Translations: own words have one `translation`; course words only Russian. `meaningFor(card, lang)` picks
  `card.meanings[lang]` when a card has several — no data source provides them yet.
- Per-word audio files do not exist (`public/audio/` holds lesson dialogues); the browser voice is used.
- The daily cap is the constant 10; no student setting yet.
