"""Word forms of the EKI level vocabularies (A1, A2, B1) for the didactic check (docs/DIDACTIC_ENGINE.md).

Source: Jelena Kallas, Kristina Koppel. Eesti keele A1-, A2- ja B1-taseme sõnavara. Eesti Keele Instituut 2018,
https://arhiiv.eki.ee/litsents/ — licence CC BY 4.0. The lists are cumulative (A2 includes A1).

    .venv/bin/python tools/lexicon/build_level_forms.py parse <dir with A1.pdf A2.pdf B1.pdf>   # → eki-levels-2018.json
    .venv/bin/python tools/lexicon/build_level_forms.py build                                  # → levelForms.json

`parse` reads the PDFs (pypdf) into tools/lexicon/eki-levels-2018.json (lemma + part of speech per level).
`build` generates every form with Vabamorf (EstNLTK 1.7.5) and writes, per level, only the forms that first appear on
that level, lower-cased, to crm-v2/src/features/worksheet-studio/didactics/levelForms.json (loaded lazily by the
constructor). No network, nothing at runtime: the CRM only reads the JSON.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LIST = ROOT / 'tools/lexicon/eki-levels-2018.json'
OUT = ROOT / 'crm-v2/src/features/worksheet-studio/didactics/levelForms.json'
LEVELS = ['A1', 'A2', 'B1']

NOMINAL_CASES = ['n', 'g', 'p', 'ill', 'in', 'el', 'all', 'ad', 'abl', 'tr', 'ter', 'es', 'ab', 'kom']
NOMINAL = [f'sg {c}' for c in NOMINAL_CASES] + ['adt'] + [f'pl {c}' for c in NOMINAL_CASES]
VERB = ['ma', 'mas', 'mast', 'maks', 'mata', 'da', 'des', 'b', 'd', 'n', 'me', 'te', 'vad', 'neg', 'o', 'gu', 'ge', 'gem',
        's', 'sin', 'sid', 'sime', 'site', 'nud', 'tud', 'takse', 'ti', 'tav', 'v', 'ksin', 'ks', 'ksid', 'ksime', 'ksite',
        'vat', 'ta', 'tama', 'tuks', 'nuks', 'neg o', 'neg gu', 'neg nud', 'neg ks', 'neg vat', 'tagu', 'tavat']
POS_HINT = {'S': 'S', 'A': 'A', 'P': 'P', 'N': 'N', 'O': 'O', 'V': 'V', 'G': 'G'}


def parse(folder):
    import pypdf
    rx = re.compile(r'^\s*(.+?)\s+([SAVPNODKJGIXY])\s*$')
    out = {}
    for level in LEVELS:
        reader = pypdf.PdfReader(str(Path(folder) / f'{level}.pdf'))
        lines = '\n'.join(page.extract_text() or '' for page in reader.pages).splitlines()
        low = [x.strip().lower() for x in lines]
        start = max(i for i, x in enumerate(low) if x.startswith('sõnavara alfabeetilises järjekorras'))
        freq = max(i for i, x in enumerate(low) if x.startswith('sõnavara sageduse järjekorras'))
        end = max(i for i, x in enumerate(low) if x.startswith('nimisõnad'))
        seen = set()
        words = []
        for x in lines[start + 1:end]:
            m = rx.match(x)
            if m and (m.group(1).strip(), m.group(2)) not in seen:
                seen.add((m.group(1).strip(), m.group(2)))
                words.append([m.group(1).strip(), m.group(2)])
        out[level] = words
    LIST.write_text(json.dumps({'source': 'Kallas, Koppel. Eesti keele A1-, A2- ja B1-taseme sõnavara. EKI 2018. CC BY 4.0. https://arhiiv.eki.ee/litsents/', 'levels': out}, ensure_ascii=False, indent=0) + '\n')
    print({k: len(v) for k, v in out.items()})


def forms_of(lemma, pos):
    from estnltk.vabamorf.morf import synthesize
    out = {lemma.lower()}
    parts = lemma.split()
    if len(parts) > 1:  # „aru saama”: the particle as a word, the verb inflected
        out.update(p.lower() for p in parts[:-1])
        lemma = parts[-1]
        out.add(lemma.lower())
    codes = VERB if pos == 'V' else NOMINAL if pos in ('S', 'A', 'P', 'N', 'O') else []
    for code in codes:
        try:
            values = synthesize(lemma, code, partofspeech=POS_HINT.get(pos, '')) or synthesize(lemma, code)
        except Exception:  # noqa: BLE001 — an odd lemma must not stop the build
            values = []
        for v in values:
            for w in str(v).replace('+', '').split():
                out.add(w.lower())
    return out


def build():
    data = json.loads(LIST.read_text())['levels']
    known = set()
    result = {}
    for level in LEVELS:
        new = set()
        for lemma, pos in data[level]:
            new |= forms_of(lemma, pos)
        new -= known
        known |= new
        result[level] = '\n'.join(sorted(new))
        print(level, len(data[level]), 'lemmas', len(new), 'new forms')
    OUT.write_text(json.dumps({'source': 'EKI tasemete sõnavara 2018 (CC BY 4.0), forms by Vabamorf', 'levels': result}, ensure_ascii=False) + '\n')


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'parse':
        parse(sys.argv[2])
    elif len(sys.argv) > 1 and sys.argv[1] == 'build':
        build()
    else:
        print(__doc__)
