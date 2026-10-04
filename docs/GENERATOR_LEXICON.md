# Generator lexicon — Estonian word forms without AI

Status: steps 1–3 of the rule-based generator (owner decision 2026-10-04: "нормальный генератор без ИИ" instead of
writing every lesson by hand). Steps 2–5 are listed at the end.

## Why

Hand-written Content Packs (A2-001…A2-015) cannot scale to 100 lessons: every sentence is written per lesson.
A generator that combines words needs **real inflected forms** (kool → koolis, kooli, koolist; õde → õe; laps → last).
Gluing lemmas together produces wrong Estonian, so the generator must know the forms, not guess them.

## What is in the repository

| File | Role |
|---|---|
| `crm-v2/src/features/worksheet-generator/lexicon/source.json` | Hand-curated list: lemma, part of speech (`noun`, `name`, `adj`, `verb`), Russian translation, semantic tags (`family`, `food`, `place`, `town`, `profession`, …), `locative` (`in` = koolis/kooli/koolist, `ad` = turul/turule/turult), and decisions for ambiguous words (`gen`, `variants`, `missing`). |
| `tools/lexicon/build_forms.py` | Offline build with Vabamorf (EstNLTK 1.7.5, licence GPL-2.0 OR Apache-2.0). Writes `forms.json`. |
| `crm-v2/src/features/worksheet-generator/lexicon/forms.json` | Generated: every word with its forms (14 singular cases, short illative, plural cases; 23 verb forms). Committed; the CRM only reads it. |
| `crm-v2/src/features/worksheet-generator/lexicon/index.js` | `inflect(lemma, code)`, `formVariants`, `placeForms` (kus/kuhu/kust), `lexemesWithTags`, `sameWordDistractors`. |

No API or network at runtime: Vabamorf runs once on a developer machine, the result is a JSON file.

## Build rules (the script stops instead of guessing)

- A nominal needs one genitive. When Vabamorf returns several (kool → koola / kooli; Toomas → Tooma / Toomase), the
  source entry must give `gen`; it is then the stem hint for every form. Resolved this way: juht, kool, kapp, kott,
  müts, kurk (cucumber), kook, sool, silm, Toomas, väike.
- Forms with legitimate variants keep all of them, preferred first (kool pl p: koole, koolisid).
- `variants` pins the correct reading where the first Vabamorf variant is non-standard or the wrong meaning:
  minema (läheme, lähete, lähevad — not lähvad), pidama „must” (pidi, pidin — not pidas), jooksma (joosta),
  tee „tea” (pl p teesid — teid is „roads”).
- Proper names (people, cities, countries) are singular only.
- `--check` fails when `forms.json` does not match `source.json`.

```
python3 -m venv .venv && .venv/bin/pip install estnltk==1.7.5
.venv/bin/python tools/lexicon/build_forms.py          # rebuild after editing source.json
.venv/bin/python tools/lexicon/build_forms.py --check  # verify
```

## Coverage (version 1)

314 words for A2 modules 1–6: family and people (21), professions (15), places in town and home (39, each with
`locative`), home objects, things and clothes (32), food and drink (40), time (11), transport (9), body and health (13),
cities and countries (13), first names (14), adjectives — qualities, character, colours (44), verbs (63).

`lexicon.test.js` checks every entry and 53 forms verified by hand (koolis, poodi, õe, last, vette, pähe, koju, tuppa,
Tartus, Narvast, Toomase, väikese, teesid; süüa, sõi, lähen, läheme, läks, pean, pidi, joosta, …).

## Step 2 — sentence patterns (done)

`worksheet-generator/patterns/grammarPatterns.js` defines grammar points and sentence frames with typed slots;
`patterns/engine.js` fills them from the lexicon (`generatePatternSentences`, `buildPatternSentence`,
`patternCoverage`). Each sentence carries `answer` (the exact form of the target slot) and `distractors` (other forms
of the same word from the pattern's `contrast` list). A combination is dropped — never guessed — when a form is
missing or fewer than two different wrong options exist (e.g. „Mari” cannot be a genitive target: Mari = Mari).

| Grammar point | Patterns | Valid sentences |
|---|---|---|
| `olema-present` (ma olen / elan / töötan …) | 3 | 159 |
| `genitive-possession` (minu venna kott, Toomase õde, Kelle …?) | 3 | 348 |
| `local-cases` (kus/kuhu/kust: koolis, kooli, koolist; turul, tööle, koju, Venemaalt) | 6 | 1 385 |
| `partitive-object` (söön putru, joob vett, ostan leiba ja piima, ei ole autot) | 4 | 661 |
| `adjective-agreement` (elab suures korteris, uut telefoni) | 3 | 646 |
| `numeral-partitive` (kaks last, kolm raamatut) | 2 | 54 |

Meaning restrictions live in the slots (whitelists): no „külla” (= visiting) as a destination, colours and sizes
only for clothes, bags and devices. Venemaa and Saksamaa take the outer local cases (Venemaal / Venemaale / Venemaalt).
`patterns.test.js`: 23 hand-checked sentences plus invariants for every generated sentence.

## Step 3 — lessons generated from patterns (done)

`patterns/profileFromPatterns.js` builds a complete generator profile from grammar points: focus, vocabulary (lexicon
lemmas with Russian), the point's three situations, 12 pattern sentences with `answer`/`distractors`, 4 error pairs
(target swapped for a same-word wrong form), one speaking and one writing prompt and the success criterion. Only the
prompts and criteria are hand-written — once per grammar point, not per lesson (`GRAMMAR_POINTS`).

`factory.js` `LESSON_GRAMMAR_POINTS` assigns grammar points to lessons where the patterns really teach the lesson focus;
precedence is hand-written pack → patterns → keyword suggestions. Ready from patterns: A2-016 Minu kodu, A2-017 sees
(`local-inner`: inner-case places only), A2-018 peal (`surface-local`: laual / lauale / laualt), A2-019, A2-020
Kontroll 4, A2-021 Kohad linnas, A2-026 Toit ja joogid, A2-027 Kui palju? Partitiiv.

Worksheet engine (`engine/content.js`): a sentence with `answer` gets its gap exactly there; the gap word bank shows
the right form among other forms of the same word („Vali sõna õige vorm”); context choice offers the same-word forms.
Fixed for all lessons: role cards no longer build „Koosta Poes plaan” (the situation stands alone: „Olukord: Poes.”),
and situation labels ending in „?” no longer get an extra full stop.

Bundle: the generator pages are lazy routes, so the lexicon loads only there (main bundle 257 kB gzip, below the
previous 300 kB; generator chunk 67 kB).

## Step 4 — more grammar points (done)

New points: `imperative` (mine, tule, võta, ära maga; minge), `modal-verbs` (pean + ma; võin/saan/oskan/tohin + da),
`infinitive-want` (tahan + da, hakkan + ma, proovin + da), `meeldima` (mulle meeldib ujuda, Kadrile meeldib apelsin),
`mul-on` (Toomasel on köha, mul valutab kõht, Maril on vaja ravimit), `past-simple` (läksin, käisin, sõitis,
käisime, ei läinud), `future-present` (homme olen kodus, järgmisel nädalal sõidab Mari Pärnusse), `comparison`
(soojem, parem, lühem — comparatives curated in `source.json` because they are irregular), plus `numeral-shop`.
Engine: a gap at the start of a sentence keeps the capital letter in the answer and options; „kuhu” uses the long
illative when the short one equals the base form (Tartusse, Pärnusse — not „Tartu”).
27 more lessons are generated from patterns; together with the hand-written packs **50 of 100 A2 lessons** are ready.

## Next steps

4. More grammar points (imperative, past tense, comparison, modal verbs, ma/da infinitive) and words, so the mapping
   can cover more of the 100 A2 lessons.
5. Teacher review screen: mark a generated sentence as bad so it is never used again.
Hand-written packs stay as the gold standard and take precedence.
