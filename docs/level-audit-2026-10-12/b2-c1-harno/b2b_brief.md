# Brief: Harno B2 redesign of ONE KeeleSepp B2-course module (one file)

You redesign ONE module file so that it trains the Harno B2 exam formats. Work ONLY in /Users/pavel/keelesepp-bch
(never cd elsewhere, never touch /Users/pavel/keelesepp-release). Do NOT commit, push, or write to any database.
Edit ONLY your file: crm-v2/src/features/worksheet-generator/admin/course/b2/moduleNN.js (NN given in your task).
Other agents edit the other module files in parallel — do not touch them, qualityBaseline.json, blocks.js, quality.js.

## Read first
- docs/HARNO_LEVEL_REQUIREMENTS.md, section „B2” (lines 258–378): exam parts, task types, lengths.
- crm-v2/src/features/worksheet-generator/admin/course/blocks.js (block builders).
- Remaining findings for your module: docs/level-audit-2026-10-12/b2-part2.md (your module) and the „Не исправлено”
  section of docs/level-audit-2026-10-12/b2-c1-fixes/b2b.md.
- Template (finished redesign, same pattern you must follow): lesson 'b1b2-035' (practice + transfer) in
  crm-v2/src/features/worksheet-generator/admin/course/b2/module07.js — it will be finished by the lead agent; if it is not
  yet rewritten when you look, follow this brief. Also b1/module18.js lessons 089/090 (B1 mocks) show the style.

## What to do in your module
1. The module's LAST lesson (Kontroll / Vahehindamine) becomes a Harno-B2-format check:
   - **practice (Harjuta) = reading + listening parts**, in this order (ids in the module style `NNN_p_*`; keep existing ids
     for kept tasks: `_how` tip, `_listen`, `_read`, `_trans`, `_self`, speaking id):
     1. B.tip `NNN_p_how` (full): „Lugemine ja kuulamine (Harno B2 vormis)”, the parts, points, time, pass rule
        (each part ≥ 60 %).
     2. B.listening `NNN_p_listen`: a lecture / radio talk / interview transcript of **250–400 words** (count them!),
        written as natural spoken Estonian, as an array of lines; **8–9 gap sentences** with 1–2-word answers (Harno
        listening 3), answers with variants `[a|b]`. Instruction: teacher reads twice.
     3. B.truefalse `NNN_p_tf` (width 'full'): **8 statements** on the same recording (Harno listening 4, second
        listening). Do NOT make false statements false through „alati / ainult / kõik / mitte kunagi / üksnes” — avoid
        those words in false statements entirely.
     4. B.reading `NNN_p_read`: a problem / opinion article with differing viewpoints, **440–495 words** (the B1+ norm
        cap is 500 — never exceed 500, never under 400), **6 paragraphs**, each starting with „**A** ”, „**B** ”…„**F** ”
        (join paragraphs with '\n\n'). Only 1–2 questions in the reading block itself, at least one starting with „Miks”
        or „Kuidas” (inference); e.g. [['Miks …?', 'key|variants'], ['Mida sina arvad: …? Miks?']].
     5. B.choice `NNN_p_choice` (width 'full', goal 'g_read'): **7 questions, 4 options each** (right first in the array,
        it is shuffled on display), all options of similar length and plausible, at least 3 inference questions
        (author's intention, implied view, what a paragraph's function is). Harno reading 1.
     6. B.table `NNN_p_match` (goal 'g_read'): „Väide ja lõik”: **8 statements** ↔ paragraphs A–F, header
        'Väide, Lõik', rows like '1. … | [C]'. Paraphrase — never copy a sentence from the text. Some paragraphs used
        twice. Harno reading 2.
     7. B.cloze `NNN_p_cloze`: a coherent text of **200–250 words** with **10 gaps**, 4 options each:
        `{*right|wrong|wrong|wrong}` — words AND expressions (rektsioon, case of the object, connectors, verb forms,
        collocations). Paragraphs joined with '\n\n'. Harno reading 3. Exactly 10 gaps (the norm allows max 10 items).
     8. B.gaps `NNN_p_sent` (width 'full', goal 'g_read'): sentence-bank gap text (Harno reading 4): a coherent text of
        ~250–320 words written as **7 lines**, each line containing one gap `[whole sentence]`; bank = the 7 sentences
        **+ 1 extra** plausible sentence (array). **Bank sentences must contain NO commas and no semicolons** (the bank
        is split on commas). Instruction: „Vali igasse lünka sobiv lause. Üks lause jääb üle.”
     9. B.transformation `NNN_p_trans` „Keeleosa: ütle teisiti.”: 6 rows on **B2 grammar targets**: kaudne kõneviis
        (-vat), nominaliseerimine (-mine/-us), des-vorm lauselühendina, kesksõnad laiendina (-v/-tav/-nud/-tud), tingiv
        minevik (oleksin teinud), mata-vorm. The prompt column names the form; answers fully derivable from the
        source sentence, with variants separated by „|”. Every answer must differ from its source.
     10. B.speaking (keep existing id of the practice speaking if any, else `NNN_p_say`): short „Räägi loetust” [90, 120] s.
     11. B.rubric `NNN_p_score`: points per part, e.g. 'Kuulamine 3 (lüngad): … / 8', … 'Lugemine 4 (laused): … / 7',
         'Keeleosa: … / 6', 'Lävend: igas osas vähemalt 60 %'.
     12. B.selfcheck `NNN_p_self`: items with the pass rule („Lugemine: vähemalt 60 % igas osas.” …).
     Remove from this sheet the old keeleosa gaps, letters, rolecards etc. (writing/speaking move to Kasuta).
   - **transfer (Kasuta) = writing + speaking parts**:
     1. B.text `NNN_t_situation` (keep id; MUST be the first block): situation + the parts, points, time and pass rule.
     2. B.table `NNN_t_data` (new): a small data source (5–6 rows, header like 'Näitaja, 2024, 2026' or 'Küsimus, Jah, Ei'),
        **no [ ] gaps** — the source for the summary option of writing 2.
     3. B.planning `NNN_t_plan` (new): 2 minutes' preparation notes for the talk (3–4 prompts, lines 2).
     4. B.letter `NNN_t_letter` (keep an existing letter id): Harno writing 1: a **semi-formal or formal letter /
        explanatory note** with a named addressee and register, **[120, 150] words**; opening/closing set.
     5. B.letter `NNN_t_essay` (new): Harno writing 2, **[160, 190] words**: „Vali A või B. A: arutlus (poolt- ja
        vastuargumendid, näited, järeldus). B: kokkuvõte tabeli andmetest + oma kommentaar.” Instruction ≤ 30 words!
     6. B.speaking (keep an existing id): Harno speaking 1: a **work-related topic card** (speech at a meeting / short
        presentation), „2 minutit ettevalmistust, kõne umbes 1 minut, siis vastad partneri küsimusele” → seconds
        **[90, 120]** (the norm does not allow less than 90).
     7. B.rolecards (keep an existing id): Harno speaking 2: pair discussion; roleA = argument card **A (poolt)** with
        3 arguments, roleB = card **B (vastu)** with 3 arguments; the pair must agree on a **joint position**; ≤ 4 min.
     8. B.rubric (keep id if exists): Harno criteria with points (writing 1 … / 10, writing 2 … / 15, speaking 1 … / 10,
        speaking 2 … / 15 or similar; register, structure, length, examples, turn-taking) and the pass rule.
     9. B.selfcheck (keep id): pass rule.
     Remove the old reading/crossword/reflection writing of this sheet if needed for time.
2. Elsewhere in the module (light touch, keep structure):
   - Letters (B.letter) to an institution/person with maxWords > 160 → [120, 150] or [130, 160] (Harno ~140); opinion /
     argument texts → [160, 190]. Leave texts already within these bounds.
   - Speaking monologues longer than 180 s (e.g. [180, 210]) → the exam talk [90, 120] with a topic card + partner
     question, or [120, 150]. Leave 150–180 s talks alone.
   - Fix any old titles that promise text lengths („300–350 sõna”) that are not true.
3. Grammar below level (A2/B1 drills): where a small drill in a non-check lesson trains only B1 grammar (e.g. tingiv
   olevik, „ütles, et”, umbisikuline olevik/minevik), replace 1–2 such drills in the module with a drill of the SAME
   block type and SAME id on a B2 target fitting the lesson (tingiv minevik, kaudne kõneviis -vat, umbisikulise kõik
   ajad incl. tingiv „tehtaks / oleks tehtud”, kesksõnad laiendina, des-lauselühend, nominaliseerimine). Otherwise
   leave it and note it in your report.
4. Quality: correct, natural Estonian (B2 level, sentences ~12–18 words), plausible distractors, complete keys
   (variants with „|”), real learner errors only. Keep `goal` fields of kept blocks, keep lesson ids, phases, titles of
   lessons (you may update canDo of the check lesson to describe the Harno format).

## Hard constraints of the automatic quality gate (module level B1+ or B1+/B2- → norms of B1+)
Each sheet (discover/practice/transfer of each lesson) must keep:
- 6–18 blocks; estimated work time **40–55 min** (formula in crm-v2/src/features/worksheet-studio/didactics/timeEstimate.js:
  reading words/100*1.5 + questions*0.6; listening transcriptWords/110*2 + gaps*0.4; cloze words/100*1.5 + gaps*0.35;
  choice 0.3/q; truefalse 0.2; table 0.25 per [gap] or 1 per row without gaps; gaps 0.35/line; transformation/errorfix
  0.6/row; speaking (min+max)/2/60+1; rolecards 5; planning 0.5/prompt; guidedletter (min+max)/2/10+2; rubric/selfcheck 1;
  text/tip/notice 0.5; images added automatically 0.3).
- ≥ 5 different task types; last block selfcheck or rubric.
- practice: needs a FORM task (gaps/wordforms/table/transformation/dictation/translation), a MEANING task, a SENTENCE task
  (errorfix/wordorder/transformation) and a PRODUCTIVE task (speaking/writing/rolecards/guidedletter/planning).
- transfer: first block text/tip/reading/listening/dialogue; ≥ 2 different productive types.
- Recognition tasks (cloze, choice, truefalse, match, manymatch, crossword, clock) ≤ 40 % of task blocks.
- Closed tasks 6–10 items each (cloze gaps, listening gap lines, gaps lines, truefalse, choice q, errorfix/transformation
  rows, match pairs); reading 250–500 words; sentence average ≤ ~17 words, no sentence > 24 words (tip only);
  instructions ≤ 30 words; guidedletter 80–192 words; speaking 90–300 s; gap banks need more items than gaps.
- Variety: no two sheets of the same phase in the module with the same task-type sequence, and neighbouring lessons'
  same-phase sheets must share ≤ 75 % of task types (intersection/union of type sets). The check lesson's new
  sheets are compared with the previous lesson's sheets of the same phase — verify!
- The didactic score must stay ≥ 85 (a warning = fail; each tip costs 6 points, so ≤ 2 tips per sheet).

## Checks you must run (from /Users/pavel/keelesepp-bch/crm-v2)
- Dump of your module's sheets (minutes, score, issues, block types and lengths):
  `MODS=NN OUT=/private/tmp/claude-501/-Users-pavel-keelesepp-release/17a3ad5e-d115-4a02-80d4-7e45c7eed020/scratchpad/bcharno/dumpNN.txt npx vitest run src/features/worksheet-generator/admin/course/zz_b2b_dump.test.js < /dev/null`
  then read the OUT file (do not edit or delete zz_b2b_dump.test.js — the lead owns it).
- `npx vitest run src/features/worksheet-generator/admin/course < /dev/null` — for `course module b1b2-module-NN` the
  test must pass (no fresh problems). Failures of OTHER modules are not yours.
- `npx eslint src/features/worksheet-generator/admin/course/b2/moduleNN.js` — no errors.
- Count words of every new text with a quick node/python script and report before → after.

## Report (return as your final message, in Russian, concise)
Per lesson: what exam formats were added where; texts lengthened (words before → after); listening words; writing /
speaking lengths changed (before → after); grammar drills replaced (which ids, what target); what is still missing;
exact test results for your module (the vitest line for your module and eslint).
