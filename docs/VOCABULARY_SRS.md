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
plus up to two saved forms such as mitmus), the course example sentence (with its own sound button), sound. Sound: the
stored Neurokõne file (see „Sõnade heli” below), else the card's own `audio` file, else the browser's Estonian
`speechSynthesis` voice (`et-EE`); none of them → no button. The shown card's word + example and the next two cards' words
are preloaded.
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
- Own words that are not course words have no stored file (browser voice only) until the generator is run again.
- The daily cap is the constant 10; no student setting yet.

## Sõnade heli: stored Neurokõne audio (2026-11-09)

Owner decision 2026-11-09: every course word, its example sentence and every practice „Kuula ja pane kokku” sentence gets
real Estonian audio, made **once** with TartuNLP Neurokõne (free public API `POST https://api.tartunlp.ai/text-to-speech/v2`,
`{ text, speaker: "mari", speed: 1 }` → WAV 22 050 Hz mono float) and stored by us. The app never calls the TTS service.
Credit „Hääl: Neurokõne (TartuNLP)” is shown small at the bottom of „Sõnad” (and on the staff practice preview).

| File | What |
| --- | --- |
| `crm-v2/src/features/vocabulary/wordAudioKey.js` | Shared by app and script: `normalizeAudioText` (NFC, trim, one space; case and punctuation kept), `sha1Hex` (small synchronous sha1), `wordAudioKey(text, speaker='mari')` = first **12 hex** of `sha1("mari|" + text)`. |
| `crm-v2/src/features/vocabulary/wordAudio.js` | App side: lazy `/word-audio.json` (`loadWordAudio`, `useWordAudio`), `wordAudioUrl` / `hasWordAudio`, `playEstonian(text, { audio, slow })`, `preloadWordAudio`, `WORD_AUDIO_CREDIT`. |
| `crm-v2/scripts/word-audio/build-word-audio.mjs` + `lib.mjs` | The generator (pure parts in `lib.mjs`, tests `lib.test.js`). |
| `crm-v2/public/word-audio.json` | Manifest `{ v, voice, speaker, ext: "m4a", base, generatedAt, keys: [12-hex …] }` — keys only, no text. |
| Storage `audio/words/<key>.m4a` | The files; `Cache-Control: public, max-age=31536000, immutable`, `audio/mp4`. |
| `storage.rules` `match /audio/words/{fileName}` | `get` for everyone (name `^[0-9a-f]{12}[.]m4a$`), no list, no write (the script writes with the Admin SDK). |

**Format: AAC-LC in .m4a, 48 kb/s mono 22 050 Hz** (macOS `aac_at` encoder). Chosen because MP4/AAC plays in every
target without exceptions (iOS / macOS Safari, Chrome, Firefox, Edge); Ogg Opus would be ~30 % smaller but Safari's
Ogg support is recent and uneven across iOS versions, and a silent card is worse than 3 KB. Processing per file: cut
the leading / trailing silence (`silencedetect` −50 dB, ≥ 0.1 s; 60 ms kept before, 120 ms after), two-pass `loudnorm`
to −18 LUFS (linear), `+faststart`, no metadata. A word is ~6–9 KB, a sentence ~10–14 KB.

**Order when something plays** (`playEstonian`): 1) the stored file (`slow` = playbackRate 0.75), 2) the lesson's own
`audio` file, 3) the browser's `et-EE` voice (rate 0.9 / 0.65). A file that fails (network, rules not deployed, codec)
falls through to the next. It never waits for the manifest inside a tap (iOS needs the play in the gesture): before the
list has arrived the old way is used. `audioSource(text, …)` tells which source would play first ('' → no button).

**Listening items**: `buildLesson({ canListen })` accepts `true/false` or a per-item function; the preview page passes
`item => hasEstonianVoice || hasWordAudio(fullSentence(item))`, so „Kuula ja pane kokku” exists whenever that sentence
has a stored file, also without a browser voice. Listening sentences = build items with ≤ `LISTEN_TILES` (10) tiles from
the A2/B1/B2/C1 course files, as `fullSentence(item)` says them.

**Running the generator** (from `crm-v2/`; resumable — keys already in the cache `~/.cache/keelesepp-word-audio/` or in
Storage are skipped; failures go to `failures.json` in the cache; exit code 1 if any failed):

```
node scripts/word-audio/build-word-audio.mjs --dry-run                 # counts only, no network
node scripts/word-audio/build-word-audio.mjs --limit 30 --no-upload    # pilot into the local cache
GOOGLE_APPLICATION_CREDENTIALS=<adc.json> node scripts/word-audio/build-word-audio.mjs \
  --admin-modules <dir with firebase-admin, e.g. ../functions/node_modules>   # synthesize missing, upload, write manifest
```

Politeness: 2 requests at a time, ≥ 340 ms between request starts (≤ ~3/s), up to 6 tries with exponential backoff
(2, 4, 8 … s, ≤ 60 s, +25 % jitter, `Retry-After` honoured) on 408 / 429 / 5xx / network errors. Texts > 400 chars or
without letters are skipped. **After new course words or sentences**: run it again (only the new texts are made), commit
the new `public/word-audio.json`.

Limits: one voice (mari); students' own words that are not course words have no file; a course text edited later gets
a new key (the old file stays unused in Storage); the manifest holds 12-hex keys, so a text added to the course is played
by the browser voice until the next generator run.
