# Spec for one module (agent C team): Harno-format redesign of a B1-course module, stage A2+/B1-

You are an expert teacher of Estonian as a second language and of the Harno level exams. You edit ONE module file of
KeeleSepp's A2 → B1 course so that it meets its stage (A2+/B1-, checked against the Harno **B1** exam) and trains the
Harno exam formats. Work ONLY in /Users/pavel/keelesepp-harnob1 (never cd elsewhere). Do not commit, push or write to
any database. Edit ONLY your file (given in your task). Do not touch tests, quality.js, qualityBaseline.json, blocks.js,
levels.js or any other module. Other agents edit other modules in the same worktree at the same time — ignore their
test failures.

Paths (cwd for commands: /Users/pavel/keelesepp-harnob1/crm-v2):
- Your module: crm-v2/src/features/worksheet-generator/admin/course/b1/moduleNN.js
- Block builders: crm-v2/src/features/worksheet-generator/admin/course/blocks.js (read it: B.reading, B.choice, B.gaps,
  B.cloze, B.listening, B.letter, B.rolecards, B.notice, B.speaking …)
- Harno exam: /Users/pavel/keelesepp-harnob1/docs/HARNO_LEVEL_REQUIREMENTS.md (B1 section, lines 149–257)
- Good examples of B.listening / B.reading: crm-v2/src/features/worksheet-generator/admin/course/b2/module01.js

## Already done
MODULE.level is already set to 'A2+/B1-' (roadmap levelStage of all lessons 041–060). Keep it.

## Diagnostics (use constantly)
```
cd /Users/pavel/keelesepp-harnob1/crm-v2 && npx vite-node /private/tmp/claude-501/-Users-pavel-keelesepp-release/17a3ad5e-d115-4a02-80d4-7e45c7eed020/scratchpad/b1harno/diagC.mjs NN
```
(NN = 10, 11 or 12; an optional 3rd argument filters lessons, e.g. `diagC.mjs 10 047`). It prints per sheet: didactic
score, average sentence length (avg), minutes, blocks, the number of `fresh` gate problems, every didactic issue
(W = warning, t = tip) and gate problems (Q). Module-level problems are printed as MOD.

GOAL: `fresh 0` for your module. In practice that means, for EVERY sheet:
- **no W (warning) at all** — every warning is a fresh gate problem;
- **at most 2 t (tips)** — the didactic score must stay ≥ 85 (warning −12, tip −6);
- 6–18 blocks, 40–55 minutes, ≥ 5 different task types, last block selfcheck (or rubric);
- Harjuta (practice) needs a form task (gaps / wordforms / table / transformation / dictation / translation), a meaning
  task (choice / truefalse / match / manymatch / categorize / crossword / reading / listening), a sentence task
  (errorfix / wordorder / transformation) and a productive task (speaking / writing / dialogue / rolecards /
  guidedletter / planning);
- Kasuta (transfer) starts with text / tip / image / reading / listening / dialogue and has ≥ 2 different productive types;
- module: no two sheets of one phase with the same task-type sequence; neighbouring lessons of one phase share ≤ 75 % of
  task types; a lesson's sheets differ in sequence.
- module: ≥ 1 listening block and ≥ 1 reading block with a passage ≥ 200 words.
Finally also run `npx vitest run src/features/worksheet-generator/admin/course < /dev/null` (only your module counts:
failures that list only `fixed` problems are fine) and `npx eslint <your file>`.

## The B1- norms the check measures (levels.js 'B1-', didacticCheck.js)
- **Average sentence length over all task sentences of a sheet ≥ 6.05 words** (warning) and ≤ 13.7. Counted sentences:
  reading passage sentences, gaps / listening / wordorder lines (solved), dialogue lines, true/false statements, choice
  questions (not options), errorfix answers, transformation/wordforms answers of > 2 words, cloze sentences. Dictation,
  translation, match, categorize are NOT counted. Today most sheets have avg 5.3–6.0. Main lever: rewrite reading texts
  into longer B1- sentences (10–14 words: sest / kuna / et / kui / kuigi / mis / kus / aga / ning, conditional, relative
  clauses) — and lengthen very short true/false statements, dialogue lines, gap sentences where natural.
- **No single sentence > 18 words** (tip). Keep every sentence ≤ 18 words.
- **Reading passage 150–320 words** (warning). Lengthen every reading text to ~170–230 words (keep content and answers
  valid; add real details, a reason, a consequence, an opinion). Every reading has ≥ 1 „Miks / Kuidas / Mida arvad”
  question (tip otherwise). Avoid that ≥ 80 % of answers are 1–3 words copied verbatim from the text (tip).
- Speaking minSec/maxSec: must satisfy min ≥ 68 and max ≤ 225 → use e.g. [90, 150], [120, 180] (tip otherwise).
- Writing (B.writing) sentences: min ≥ 7, max ≤ 14 (the current [8, 10] is fine).
- Closed tasks (gaps etc.): 5–10 items each (tip otherwise). Cloze: count of {…} gaps 5–10.
- A gaps block with a visible bank costs one tip at B1- ("pank") and a WARNING when bank ≤ number of gaps → a bank must
  hold more items than gaps. Bank items are split by commas: never put a comma inside a bank phrase.
- Recognition tasks (cloze, truefalse, match, manymatch, choice, pictures, crossword …) ≤ 50 % of the tasks (warning).
- Choice: exactly one `*`-right option, 3 options; the right option must not be much longer than the wrong ones (if the
  right one has ≥ 4 words and ≥ 2× the longest wrong one in half the questions → warning). Options in Estonian.
- Instructions ≤ 20 words (tip).
- true/false: false statements must not be recognisable by „alati / ainult / kõik / mitte kunagi …”.

## Answer-key conventions
- gaps / listening / dialogue: `[right|variant]`; every gaps line must contain `[`.
- errorfix / transformation / wordforms answers are split by `,` `;` and newline: an answer must NOT contain a comma;
  separate accepted variants with `; `. (So write keys without commas, or choose sentences without commas.)
- choice: `[q, right, wrong1, wrong2]` (right first; it is marked and shuffled by the builder).
- B.cloze passage: `… {*õige|vale|vale} …` — exactly one `*` per gap, 3 options, ~10 gaps, text ≤ 200 words.
- B.listening(id, title, instruction, transcriptLines[], sentences[]): sentences with `[answer|variant]`, audio is
  null — the instruction says „Õpetaja loeb teksti kaks korda.” Answers 1–2 words (content scored).

## WHAT TO DO in your module
1. Keep MODULE.level 'A2+/B1-'. Meet the norms on every sheet (see diag). Do not lower quality: plausible distractors,
   correct natural Estonian, complete keys, no answer given away. Keep lesson ids, phases, goal fields, and existing
   block ids of tasks you keep. New blocks get new ids in the module's style (e.g. '050_p_cloze', '048_p_listen').
   Goal of a new block: reading/listening → 'g_read' (builder default), writing/speaking → 'g_use', form → 'g_notice'.
   You may remove weak blocks (a dictation or a Russian translation that repeats the sheet) to make room — the audit
   found a dictation + translation on almost every sheet; replacing some of them by Harno formats is welcome.
2. Listening: add **one B.listening in a regular (non-assessment) lesson** (replace that sheet's dictation), plus the
   one in the assessment Harjuta (below). Transcript: natural Estonian, 200–300 words (B1-), dialogue / announcement /
   voice message / radio piece; 6–8 items, 1–2-word answers or gap sentences; instruction: „Õpetaja loeb teksti kaks
   korda. …”.
3. Every reading text ≥ 150 words (norm); the module has ≥ 1 text of 200–300 words with exam-type questions (the
   assessment Harjuta text below satisfies this).
4. The assessment lesson (5th lesson of the module: Kontroll / Vahehindamine) becomes a Harno-B1-format check, using
   its two sheets (replace their contents; you may reuse good existing blocks/ids):
   **Harjuta (practice) = title idea „Lugemine ja kuulamine (eksami vormis)”** — 4–5 of these exam parts, within 40–55 min:
   - B.notice (6 short ads/notices, lines „A. …”, „B. …” … „F. …”, topic of the module) + B.gaps: 9 situation
     sentences, each ending with the answer letter, e.g. `'Mari tahab nädalavahetusel ujuma minna. → [C]'`;
     instruction: „Millise kuulutuse (A–F) leiab inimene? Üks kuulutus sobib mitmele.” (no bank).
   - B.reading with a 220–290-word newspaper/magazine text on the module topic (its 2 open questions: one „Miks …?”)
     + B.choice with 6 multiple-choice items (3 plausible options) on that text.
   - B.cloze with ~10 option gaps (3 options each: same word class, plausible forms/words), text 120–190 words.
   - B.gaps as a connected 120–150-word text cut into lines, with 6–7 gaps filled from a bank of PHRASES / clause parts
     with 2 more options than gaps (Harno reading 4). No commas inside bank items.
   - B.listening (see 2.), 8 items.
   The Harjuta gate still needs a sentence task (errorfix / wordorder / transformation) and a productive task (e.g. a
   short B.speaking: retell the listening text / the article, [90, 150] s). End with B.selfcheck whose items name the
   exam skills (e.g. „Ma leian kuulutusest vajaliku info.”, „Ma mõistan 250-sõnalise artikli põhimõtet.”,
   „Ma valin lünka sobiva sõna.”, „Ma mõistan kuuldud teadet kahel kuulamisel.”). Recognition ≤ 50 % of tasks.
   **Kasuta (transfer) = „Kirjutamine ja rääkimine (eksami vormis)”**:
   - starts with B.text situation (what the exam part is);
   - B.letter: a note of 40–60 words covering 4 given points: why, when, who replaces you, how to contact you
     (instruction lists the 4 points; topic fits the module);
   - B.letter: a personal letter (or a story on a given title) of 90–120 words with 4–5 prompts in the instruction;
   - B.speaking „reach an agreement”: a situation with two options, the pair must decide together (questions list the
     two options and pros/cons prompts; [120, 180] s); optionally a short examiner-questions B.speaking (part a);
   - B.rolecards: phone role-play — card A asks for information (calls an institution of the module topic), card B
     is the employee with the information; phrasesA = questions, phrasesB = answer-card facts;
   - plus 1–2 support tasks so that ≥ 5 types and 40–55 min (e.g. a B.transformation „ütle viisakamalt”, a B.planning
     for the letter, a B.errorfix of typical letter errors), and B.selfcheck at the end naming the exam skills.
5. Write correct Estonian. Typical pitfalls: case government (vastutab millegi eest, tegeleb millegagi), V2 word order,
   ma-/da-infinitive, partitive objects, comma before et / sest / kui / mis / kuigi.

## Report
Write your part of the report in RUSSIAN to
/private/tmp/claude-501/-Users-pavel-keelesepp-release/17a3ad5e-d115-4a02-80d4-7e45c7eed020/scratchpad/b1harno/C_modNN.md:
stage set; which exam formats were added where (lessonId · phase · block id · format); texts lengthened (block id:
words before → after); listening added; what is still missing for the Harno exam; the exact diag result
(`fresh N`) and eslint result. Return a 5-line summary.
