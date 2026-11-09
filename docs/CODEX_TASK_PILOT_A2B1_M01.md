# Codex: pilot — A2→B1 module 1 in the „stations” design (v3)

Owner's request, 2026-11-09: „сделай пилот A2→B1 первого модуля, чтобы качество работы было на высшем уровне”.
This file is the whole contract for that work. Read it to the end before writing anything. Where it conflicts with
older course documents, this file wins **for this module only**.

## 0. Why we are doing this — the owner's complaint, in his words

> „Курс очень слабый, куча однотипных шаблонов урока. Иногда читаешь задание и думаешь: оно вообще глупое.
> Всё завязано на одном тексте или слушании, и если его пропустить, то ничего сделать не получается.”

An audit of 12 lessons and all 312 teaching lessons (2026-11-09) confirmed this.
- **Same skeleton everywhere.** 97 % of the Kasuta sheets have the same structure: situation → input text → role
  cards → speaking → letter → rubric. 70 % of the Avasta sheets open with „Mäletad?” + a text. There are ~24 blocks
  per lesson.
- **Everything hangs on one input.** In 9 of 12 lessons, one text or audio carries ≥ 2/3 of the Kasuta tasks. Some
  tasks need input from an EARLIER phase, so if a teacher skips a sheet, the next sheet breaks.
- **Fake tasks.** A pronoun swap pretends to need a listening. „Say the same monologue three times.” „Ask three
  people” in a one-to-one lesson. A gap whose answer is printed one line above. Three drills on one notice board.
  A 526-word text that no task uses.
- **Root cause.** The quality gates count blocks and keywords, not purpose, and content was written to pass the
  gates. Do not repeat that: this pilot is judged by a human teacher, not by a gate count.

## 1. Before you start

1. Fresh `main`, then `gh pr list`. Do not touch a file that someone else has an open PR for.
2. **Precondition.** Claude is building the design-v3 contract and its gates in the PR from branch
   `agent/course-pilot-b1-m12`. It adds `docs/COURSE_DESIGN_STATIONS.md` and the per-module opt-in
   `MODULE.design: 'v3-stations'` with its own checks. If that file and the opt-in are **not on `main` yet, stop
   and report**. Do not invent your own gate changes, and do not weaken the old gates for the whole course.
3. Read **only** these, and only the parts named:
   - `docs/COURSE_DESIGN_STATIONS.md`: the whole file (it is short);
   - `docs/review/b1-m12-pilot.md`: the whole file;
   - `crm-v2/src/features/worksheet-generator/admin/course/b1/module12.js`: **one** rebuilt lesson as the pattern,
     not the whole module;
   - `crm-v2/src/features/worksheet-generator/admin/course/b1/module01.js`: the file you change;
   - `docs/CEFR_A2_B1_LEARNING_STANDARD.md`: only the levelStage table and the module-1 grammar axis (`grep -n`
     first, then read those lines);
   - `docs/TEXTBOOK_ART_BIBLE.md`: only the `visuals` brief format section.
4. Work on branch `agent/course-pilot-a2b1-m01`. Commit to that branch only, and open one draft PR.

### 1.1 Budget rules: do not burn the usage limit

The owner pays for a limited plan. Wasting it on re-reading the project is a failure of this task.

- **Do not explore the repository.** Do not list or open folders, other modules, the UI, `functions/` or the docs
  that are not named above. Everything you need is in this file and the files named in §1.3.
- **Never open large data files whole.** `crm-v2/public/word-forms.json` is 440 KB. Check a word with
  `grep -o '"sõna":\[[^]]*\]' crm-v2/public/word-forms.json`, one word at a time. The same applies to
  `lessonWords/*.json` and the generator lexicon.
- **Read a file once.** Keep notes; do not re-read what you have already read.
- **Tests.** Run only `npx vitest run src/features/worksheet-generator` (not the whole suite). Run it once when the
  module is written, and again only after fixes. No watch mode.
- **Previews.** Render each lesson at most twice: a draft and a final.
- **Write it in one go.** Plan all three lessons on paper (stations, purposes, dependencies) before you write any
  code. Then write each lesson once and fix it in place; do not regenerate whole lessons.
- **If you are stuck** for more than two attempts on the same gate error, stop. Report the exact error instead of
  trying variants.
- **In the report, say roughly how much work it was:** the files read, the test runs, the renders.

## 2. Scope

The file is `crm-v2/src/features/worksheet-generator/admin/course/b1/module01.js`.

| Lesson | Now | What to do |
|---|---|---|
| a2b1-001 „Sisenemistest: kust ma alustan?” | entry test | **Do not change it.** |
| a2b1-002 „Eile läks kõik valesti” | teaching | **Rebuild in v3 stations.** |
| a2b1-003 „Harjumused ja tervisenädal” | teaching | **Rebuild in v3 stations.** |
| a2b1-004 „Nädal muutub” | teaching | **Rebuild in v3 stations.** |
| a2b1-005 „Kontroll 1: minu igapäevaelu” | module check | **Do not change the format.** Only adjust items so they test what the new 002–004 teach. |

Keep the existing lesson ids, the module topic (everyday life, a week, habits, changes) and the module's grammar
line. You may rewrite the can-do statements so that each one is observable.

Set `MODULE.design: 'v3-stations'`.

## 3. The design rules (non-negotiable)

**3.1 Independent stations.** A lesson is 4–6 stations of 8–15 minutes each.
- Each station has its own small input or none. Allowed inputs: a picture with a brief, a situation card, a 4–8 line
  dialogue, a short text of ≤ 120 words, an audio script of ≤ 60 seconds, a schedule, a chat screenshot, a form.
- Any station can be skipped or moved, and the rest of the lesson still works.
- At most **one** task per lesson may depend on an earlier station. That task carries a printed fallback card:
  „Kui jätsid X vahele, kasuta seda kaarti: …”.
- No dependency across phases or lessons.

**3.2 Purpose for every task.** Each task carries a `purpose` line: who does this, for whom, and with what result.
The task must pass the test „would a real person do this?”.
- Never: the answer can be copied from the same page.
- Never: a fake information gap, where after the swap both sides know everything.
- Never: „ask three people”. Never: repeat the same monologue. Never: „read it again and do a third drill”.
- Every task must work in a **one-to-one** lesson by design. The teacher plays a role with a real reason to be in
  the conversation, for example the landlord, the doctor's receptionist or the friend who missed the message.

**3.3 Variety.**
- No two lessons of the module share the same first two stations or the same kind of final task.
- Final tasks rotate between decide, plan, complain, advise, explain, negotiate and present.
- Use the constructor's under-used block families where they add value: pictures, profiles, schedules, diagrams,
  phrase banks, dialogues, ranking, choice cards, chat, forms.
- At most one closed drill per input. A self-check appears at most once in the module.

**3.4 Fewer, better blocks.**
- 12–16 blocks per lesson. That is a **ceiling**, not a target.
- Closed tasks have 5–8 items, and each item has a reason to exist: a different form, a different meaning or a
  different trap. Never pad.

**3.5 Teacher page per lesson.** It is in Russian for the teacher; the student sheets are in Estonian.
- The goal (can-do) in one line.
- The stations with their minutes.
- The **45-minute core path**: which 3 stations.
- One alternative station.
- An „if short on time” path.
- The 3 most likely learner errors, each with a one-line correction strategy.

**3.6 Grammar and vocabulary.**
- This is the A2→B1 transition (levelStage per the standard). The grammar is taught where the communicative task
  needs it: noticing → controlled use (5–8 items) → free use in the station's task.
- Recycle the module's words across stations; do not introduce a new word list per station.
- **No dictation.** It was removed from B1–C1 by the owner on 2026-11-04.

**3.7 Estonian quality.**
- The Estonian must be natural, idiomatic and correct, as a careful Estonian teacher would write it. Avoid calques
  from Russian or English.
- Check every inflected form you use against `crm-v2/public/word-forms.json`. Where that file has no entry, use the
  standard paradigm you are sure of, and flag uncertain cases in the PR body.
- Use real Estonian life (Tallinn/Tartu, Rimi, Bolt, the school, the polyclinic, the e-kool, ID-kaart). Never
  present invented facts as real data: no fake prices said to be real, no invented laws or statistics.

**3.8 Pictures.** A station that needs an illustration gets a `visuals` brief per `TEXTBOOK_ART_BIBLE.md`: black
line, white, one lime accent, and the purpose of the picture. Do not generate images. List the briefs in the PR.

## 4. Banned patterns

Search your own output for these before you open the PR.

| Pattern | Example from the old course | What to do instead |
|---|---|---|
| The answer is visible on the page | „Kirjuta lünka arv kaardi põhjal” with the number one line above | Make the learner combine or transform information |
| The task does not need its input | a pronoun swap after a listening | Delete it, or make the input truly necessary |
| A fake information gap | „A heard, B didn't, then swap” | A and B each hold different halves until the end |
| A one-to-one impossibility | „Interview three classmates” | The teacher plays one role with a real reason |
| A ritual repetition | the same monologue at 2 / 1.5 / 1 minutes | One performance, then one improved version with feedback |
| Drill stacking | 3 tasks on one notice board | One drill per input |
| A decorative input | a long text that no task uses | Cut it |
| A level mismatch | an A2 shop role play at C1 | Fit the B1 can-do |

## 5. Self-review — do this for every task, then write the result in the PR

1. What is the purpose (one line)? Would a real person do this outside class?
2. Can it be done without any other station? If not, is it the one allowed dependency, and does it have a fallback
   card?
3. Is the answer copyable from the page?
4. Does it work one-to-one?
5. Is it the 2nd+ drill on the same input?
6. Is the Estonian natural, and is every form checked?

## 6. Deliverables

1. `module01.js` with 002–004 rebuilt and 005 aligned, all marked `design: 'v3-stations'`.
2. `docs/review/a2b1-m01-pilot.md` in Russian for the owner, max 1.5 pages:
   - per lesson, the old sequence → the new stations (one line each);
   - which banned patterns were removed;
   - the 45-minute path per lesson.
3. Rendered previews of the student sheets and the teacher page for 002–004, as PDF or PNG, made through the
   existing worksheet preview/print path or a throwaway lab (not committed). List the paths in the PR.
4. One entry in `docs/PROJECT_STATE.md`.

## 7. Checks (all must pass)

```bash
cd crm-v2 && npx vitest run src/features/worksheet-generator
```

- The v3-stations gate must pass for module 01: independence, purpose present, block ceiling, variety, teacher page.
- `npx eslint` on the changed files.
- Do not write to production. Do not deploy. Do not touch the UI, `routes.jsx`, `firestore.rules`, `functions/` or
  CSS.

## 8. PR and report

- Use a draft PR. The title is `Course pilot: A2→B1 module 1 in v3 stations (002–004)`. Every commit ends with the
  repo's usual co-author line.
- In the PR body give:
  - the stations of each lesson (name, minutes, input, purpose);
  - the dependency (if any) and its fallback;
  - the self-review table from §5;
  - the flagged uncertain Estonian forms;
  - the picture briefs;
  - the test results;
  - the preview paths.
- Do **not** merge. The owner will teach the lessons to real students and decide.

## 9. How the owner will judge it

- He teaches 2 of the lessons and deliberately skips a different station each time. At least **80 %** of each lesson
  must still be runnable.
- At most **one** „this task is stupid” per lesson.
- The learners rate each station „useful / real” on a 3-point card, with an average of **≥ 2.3**.
- Teacher preparation takes **under 10 minutes** using only the teacher page.

If the pilot passes, the same rules become the gates for the whole course. If it does not, we change the rules, not
the scoring.
