#!/usr/bin/env python3
"""Build the generator's inflected-form lexicon from source.json with Vabamorf (EstNLTK).

Runs offline, once per lexicon change; the CRM only reads the generated forms.json (no runtime API).

    python3 -m venv .venv && .venv/bin/pip install estnltk==1.7.5
    .venv/bin/python tools/lexicon/build_forms.py          # writes forms.json
    .venv/bin/python tools/lexicon/build_forms.py --check  # fails if forms.json is stale

Rules:
- Nominals need an unambiguous genitive: when Vabamorf returns several (kool → koola / kooli), the source entry
  must give `gen`, which is then used as the stem hint for every form. Unresolved ambiguity stops the build.
- A form with several variants keeps all of them, preferred first (`variants` in the source can reorder/limit them).
- A required form that Vabamorf cannot build stops the build, unless the source lists it in `missing`.
"""
import json
import sys
from pathlib import Path

from estnltk.vabamorf.morf import synthesize

ROOT = Path(__file__).resolve().parents[2]
LEXICON_DIR = ROOT / 'crm-v2/src/features/worksheet-generator/lexicon'
SOURCE = LEXICON_DIR / 'source.json'
TARGET = LEXICON_DIR / 'forms.json'

NOMINAL_FORMS = [
    'sg n', 'sg g', 'sg p', 'sg ill', 'adt', 'sg in', 'sg el', 'sg all', 'sg ad', 'sg abl', 'sg tr', 'sg ter', 'sg es', 'sg kom',
    'pl n', 'pl g', 'pl p', 'pl ill', 'pl in', 'pl el', 'pl all', 'pl ad', 'pl abl', 'pl kom',
]
# Forms that are optional by nature (short illative exists only for some words).
OPTIONAL_NOMINAL = {'adt'}
VERB_FORMS = ['ma', 'mas', 'mast', 'maks', 'da', 'des', 'n', 'd', 'b', 'me', 'te', 'vad', 'o', 'ge', 's', 'sin', 'sid', 'sime', 'site', 'nud', 'tud', 'takse', 'ks']
POS_HINT = {'noun': 'S', 'name': 'H', 'adj': 'A', 'verb': 'V'}


def unique(values):
    seen, out = set(), []
    for value in values:
        if value not in seen:
            seen.add(value)
            out.append(value)
    return out


def build_entry(entry, problems):
    lemma, pos = entry['lemma'], entry['pos']
    forms = {}
    if pos == 'verb':
        codes, hint = VERB_FORMS, ''
    else:
        # proper names (people, cities, countries) are used in the singular only
        codes = [code for code in NOMINAL_FORMS if not code.startswith('pl ')] if pos == 'name' else NOMINAL_FORMS
        genitives = unique(synthesize(lemma, 'sg g', partofspeech=POS_HINT[pos]) or synthesize(lemma, 'sg g'))
        hint = entry.get('gen', '')
        if hint and hint not in genitives:
            problems.append(f"{lemma}: gen '{hint}' is not among Vabamorf genitives {genitives}")
        if not hint:
            if len(genitives) != 1:
                problems.append(f"{lemma}: ambiguous genitive {genitives} — add \"gen\" to the source entry")
                return None
            hint = genitives[0]
    for code in codes:
        if code in entry.get('missing', []):
            continue
        values = unique(synthesize(lemma, code, partofspeech=POS_HINT[pos], hint=hint) or synthesize(lemma, code, hint=hint))
        chosen = entry.get('variants', {}).get(code)
        if chosen:
            unknown = [value for value in chosen if value not in values]
            if unknown:
                problems.append(f"{lemma} {code}: variants {unknown} not produced by Vabamorf {values}")
            values = chosen
        if not values:
            if pos != 'verb' and code in OPTIONAL_NOMINAL:
                continue
            problems.append(f"{lemma} {code}: no form — add it to \"missing\" if the word has no such form")
            continue
        forms[code] = values
    result = {'lemma': lemma, 'pos': pos, 'ru': entry['ru'], 'tags': entry.get('tags', []), 'forms': forms}
    if entry.get('locative'):
        result['locative'] = entry['locative']
    # comparative (soojem, parem, väiksem) is irregular enough to be curated by hand in the source
    if entry.get('comparative'):
        result['comparative'] = entry['comparative']
    return result


def build():
    source = json.loads(SOURCE.read_text(encoding='utf-8'))
    problems, entries, seen = [], [], set()
    for entry in source['entries']:
        key = (entry['lemma'], entry['pos'])
        if key in seen:
            problems.append(f"duplicate entry {key}")
            continue
        seen.add(key)
        built = build_entry(entry, problems)
        if built:
            entries.append(built)
    return {
        'schema': 'keelesepp.generator-lexicon/1',
        'version': source['version'],
        'generator': 'Vabamorf via EstNLTK 1.7.5 (tools/lexicon/build_forms.py)',
        'entries': entries,
    }, problems


def main():
    data, problems = build()
    if problems:
        print('\n'.join(problems), file=sys.stderr)
        print(f'{len(problems)} problem(s); forms.json not written.', file=sys.stderr)
        sys.exit(1)
    text = json.dumps(data, ensure_ascii=False, indent=0, sort_keys=False) + '\n'
    if '--check' in sys.argv:
        if not TARGET.exists() or TARGET.read_text(encoding='utf-8') != text:
            print('forms.json is stale: run tools/lexicon/build_forms.py', file=sys.stderr)
            sys.exit(1)
        print(f'forms.json up to date ({len(data["entries"])} entries)')
        return
    TARGET.write_text(text, encoding='utf-8')
    print(f'wrote {TARGET.relative_to(ROOT)} ({len(data["entries"])} entries)')


if __name__ == '__main__':
    main()
