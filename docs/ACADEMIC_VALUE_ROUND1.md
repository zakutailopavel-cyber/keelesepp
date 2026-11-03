# Academic value, round 1: rewriting the B1 and B2 modules

Owner 2026-11-02: bring all modules in order and raise their academic value; after the first round, look at what is
still missing. Every worksheet is a lesson — interesting and useful to the learner — and its blocks look like a textbook
page. The standard is `docs/COURSE_DESIGN_COMMUNICATIVE.md` §13; the gates are `admin/course/academicValue.js`. This file
is the work order and the per-module contract. Where it conflicts with `docs/CODEX_TASKS_B1B2_IDEAL.md`, this file wins
for the academic-value work; everything else there (Estonian quality, answer keys, uniqueness, listening audio) holds.

## 1. Order

1. B1 modules 1 → 18 (`admin/course/b1/module01.js` … `module18.js`, lessons a2b1-001 … 090).
2. B2 modules 1 → 18 (`admin/course/b2/module01.js` … `module18.js`, lessons b1b2-001 … 090).
3. Course-level gates last: B1 `av-genres` (4 popular-science + 4 fiction excerpts spread over the course — plan them while
   rewriting the B1 modules, e.g. one each in modules 3, 5, 8, 10, 12, 14, 16, 18), `av-topics` already passes.

Owner's priority wins: a module being taught right now may jump the queue. Never take a module someone else has an open
PR for (`gh pr list`). At most 2–3 module PRs open at a time.

## 2. Per-module contract

**Branch and PR:** one module = one branch `agent/av-<course>-module-NN` from fresh `main` = one PR (English title
„B1 module NN: academic value round 1”), not merged by the agent.

**Allowed files:** the module file; the course's `lessonGoals.js` (only that module's lessons, when a goal changes);
`academicValueBaseline.json` (regenerated); `qualityBaseline.json`, `finalShape*Baseline*.json` (regenerated only when a
known problem was fixed — never to hide a new one); `strictModules.json`; `listeningAudio.json` + `crm-v2/public/audio/<lesson>/*`
when a transcript changes; textbook art briefs (`worksheet-generator/art/visuals/*`) and pictures for new scenes;
`tools/course-audit/language-allow.txt` (only dictionary-checked words); one entry in `docs/PROJECT_STATE.md`.
**Forbidden:** the gates and the engine (`academicValue.js`, `academicTopics.js`, `quality.js`, `blocks.js`, `worksheet-studio/**`),
UI, rules, functions, other modules, production writes, publishing, deploys. A gate that looks wrong is described in
the PR, not changed. A theme change in the topic map is asked of the owner first.

**What to write (in this order):**

1. Read the module's row in the topic map (§13.1) and the module report:
   `ACADEMIC_REPORT=<module id> npx vitest run src/features/worksheet-generator/admin/course/academicValueGate.test.js --silent=false --reporter=verbose`
   and `COURSE_REPORT=<module id> npx vitest run src/features/worksheet-generator/admin/course/courseTools.test.js --reporter=verbose`.
2. Write the **topic opener** (`B.topicOpener`) on lesson 1's Avasta — real facts with a named source, „Mõtle kaasa”
   questions incl. Estonia vs the learner's home country.
3. For each teaching lesson: one **non-cast text** (label it with `tag(…, { voice })`), one **opinion / discussion**
   question wider than the episode, one **„Kas teadsid?”** (`B.know`) or sourced text. The cast may stay as the thread.
4. Module: the **examiner set** (`B.examiner`, 6–8 questions, B2 with the one-minute talk); B2: one **500–600-word
   article**; cut the 3-2-1 retelling to one, „record at home” to two; rotate Kasuta away from voicemail → call → letter.
5. Every number presented as a fact gets „Allikas: …”, or is removed, or moves inside a cast scene.
6. Keep stable block ids for kept tasks (learners' answers live on them); new blocks get new ids.

**Done when all hold:**

- `ACADEMIC_REPORT=<module id>` prints `PASS`; `UPDATE_ACADEMIC_BASELINE=1 npx vitest run …/academicValueGate.test.js`
  removed the module from `academicValueBaseline.json`.
- Every lesson still READY in the course report (structure, depth, keys, level, uniqueness, vocabulary, v4 variety,
  40–55 min a sheet); `npx vitest run src/features/worksheet-generator src/features/worksheet-studio` passes.
- Language check 0 unknown lower-case words (`docs/CODEX_TASKS_B1B2_IDEAL.md` §2).
- Facts checked: the PR lists every source named in the module (title + URL) and what each one supports.

## 3. Publishing — every lesson meets the standard, and nothing is lost

The agent does not publish. After review and merge, Claude publishes the whole module through the existing flow („Kursuse
tootmine” → „Avalda tund”, or the scratch publish script). Owner's rule (2026-10-28): every lesson must meet the standard
whether or not someone edited it by hand, so **a sheet edited by hand in the CRM is also republished**. Nothing is lost: the
hand-edited version stays in `worksheetVersions` (each publish is a new immutable version), and sheets already assigned to
learners keep their own copy and answers. Before publishing, export the module's current production sheets read-only and
list in the PR / hand-over which sheets had a hand-edited last version, so a teacher's useful change can be carried into the
code version if it is worth keeping. Publishing never deletes a sheet or a learner's answers.

## 4. Review after round 1

When all 36 modules are out of the baseline (or earlier, after B1 module 6 and B2 module 6 as a pilot check):

1. **Measure again** with the 2026-11-02 review method (a per-lesson digest of the built sheets, `COURSE_DUMP` in
   `courseTools.test.js`, read lesson by lesson): share of lessons locked into one cast
   episode, lessons opening the wider topic, lessons with facts worth reading, opinion speaking share, B2 readings ≥ 450
   words, lessons with a data source. Targets: locked ≤ 20 %, wider topic ≥ 80 %, opinion speaking in every lesson,
   sourced facts in every lesson that has numbers.
2. **Read samples by hand** (2 lessons a module, a different teacher than the writer if possible): is the opener true,
   current and interesting; do the questions lead to a real discussion; do the texts read like textbook pages.
3. **Owner check:** the owner teaches one rewritten lesson per course and says what is still missing.
4. **What the gates cannot see** goes to round 2: picture quality and page look (art bible), listening variety (real
   voices, interviews), the textbook's „Õpik” sheet, cross-module recycling of the new topic words, the C1 and A2 courses.
5. Write the findings and the round 2 plan into this file (§5) and `docs/PROJECT_STATE.md`.

## 5. Status

- 2026-11-02: standard (§13), topic map and gates in place; all 36 modules in the baseline (0 / 18 B1, 0 / 18 B2 pass).
  Counts per gate when the gates came — see `docs/PROJECT_STATE.md` (entry agent/academic-value-gates).
- 2026-11-03: B1 modules 1–18 out of the round-1 baseline. The learner's-eye review of the B1 course found what the gates
  let through; round 2 (its own gates and baseline) is `docs/ACADEMIC_VALUE_ROUND2.md`, standard §13.9. B2 modules still in
  round 1 aim for the round-2 gates in the same PR.
