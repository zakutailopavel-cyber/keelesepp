"""Three key forms of every EKI level lemma, for the student's word cards (owner 2026-10-12: „все слова должны быть
в трех формах”): nouns, adjectives, numerals → nimetav, omastav, osastav (soodustus, soodustuse, soodustust);
verbs → ma-, da-tegevusnimi, 3rd person present (lugema, lugeda, loeb).

Source: tools/lexicon/etlex-levels.json (EKI etLex, CC BY). Forms: Vabamorf (EstNLTK 1.7.5), offline; the CRM only reads
the JSON. A lemma whose genitive or partitive is ambiguous (kool → koola / kooli) is left out rather than guessed,
unless every reading gives the same three forms.

    .venv/bin/python tools/lexicon/build_key_forms.py   # → crm-v2/public/word-forms.json
"""
import json
from pathlib import Path

from estnltk.vabamorf.morf import synthesize

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'tools/lexicon/etlex-levels.json'
OUT = ROOT / 'crm-v2/public/word-forms.json'
NOMINAL = {'S': 'S', 'A': 'A', 'N': 'N', 'O': 'O'}


def one(values):
    values = [v for v in dict.fromkeys(values or []) if v]
    return values[0] if len(values) == 1 else None


def main():
    lemmas = json.loads(SRC.read_text())['lemmas']
    out, skipped = {}, 0
    for lemma, pos, _level in lemmas:
        key = lemma.lower()
        if key in out or ' ' in lemma:
            continue
        if pos == 'V':
            da = one(synthesize(lemma, 'da', partofspeech='V'))
            b = one(synthesize(lemma, 'b', partofspeech='V'))
            forms = [lemma, da, b] if da and b else None
        elif pos in NOMINAL:
            g = one(synthesize(lemma, 'sg g', partofspeech=NOMINAL[pos]))
            p = one(synthesize(lemma, 'sg p', partofspeech=NOMINAL[pos]))
            forms = [lemma, g, p] if g and p else None
        else:
            continue
        if forms:
            out[key] = forms
        else:
            skipped += 1
    # the generator's hand-checked lexicon wins (its genitive is resolved: kool → kooli, Toomas → Toomase)
    curated = json.loads((ROOT / 'crm-v2/src/features/worksheet-generator/lexicon/forms.json').read_text())['entries']
    for entry in curated:
        f = entry.get('forms') or {}
        first = lambda code: (f.get(code) or [None])[0]
        if entry.get('pos') == 'verb':
            forms = [entry['lemma'], first('da'), first('b')]
        else:
            forms = [entry['lemma'], first('sg g'), first('sg p')]
        if all(forms):
            out[entry['lemma'].lower()] = forms
    OUT.write_text(json.dumps({'source': 'EKI etLex (CC BY) + Vabamorf', 'forms': out}, ensure_ascii=False, separators=(',', ':')))
    print('words', len(out), 'skipped (ambiguous)', skipped, 'bytes', OUT.stat().st_size)


main()
