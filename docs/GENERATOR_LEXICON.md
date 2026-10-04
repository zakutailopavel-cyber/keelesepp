# Generator lexicon — Estonian word forms without AI

Status: step 1 of the rule-based generator (owner decision 2026-10-04: "нормальный генератор без ИИ" instead of
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

## Next steps

2. Sentence patterns per grammar point (`{PERSON} elab {CITY:inessive}.`) with semantic constraints — the engine
   fills slots from this lexicon, so the answer of a gap is the exact form it inserted.
3. Task builders: gaps and choices with exact keys and same-word case distractors (Tartus / Tartu / Tartust),
   automatic error repair (wrong case of the same word).
4. Roadmap mapping: lesson → grammar points + themes for all 100 A2 lessons.
5. Teacher review screen: mark a generated sentence as bad so it is never used again.
Hand-written packs stay as the gold standard and take precedence.
