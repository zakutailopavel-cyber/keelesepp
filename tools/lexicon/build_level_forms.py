"""Word forms of the EKI level vocabularies (A1–C1) for the didactic check (docs/DIDACTIC_ENGINE.md).

Source: EKI etLex adult learner lists (Sõnaveeb „Õpetaja tööriistad”, https://sonaveeb.ee/teacher-tools; Kallas, Üksik,
Koppel et al. „Eesti keele kui teise keele õpetaja tööriistad”, licence CC BY), read from the public etLex API
(https://etlex.eki.ee/etLex/api/v1.0). Every lemma has one level: A1, A2, B1, B2 or C1.
The older PDF lists (A1–B1, 2018) can still be parsed with `parse`.

    .venv/bin/python tools/lexicon/build_level_forms.py fetch     # → tools/lexicon/etlex-levels.json (≈10.6k lemmas)
    .venv/bin/python tools/lexicon/build_level_forms.py build     # → levelForms.json

`parse` reads the PDFs (pypdf) into tools/lexicon/eki-levels-2018.json (lemma + part of speech per level).
`build` generates every form with Vabamorf (EstNLTK 1.7.5) and writes, per level, only the forms that first appear on
that level, lower-cased, to crm-v2/src/features/worksheet-studio/didactics/levelForms.<level>.json (the constructor
loads only the levels up to the sheet's level). No network, nothing at runtime: the CRM only reads the JSON.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LIST = ROOT / 'tools/lexicon/eki-levels-2018.json'
ETLEX = ROOT / 'tools/lexicon/etlex-levels.json'
ETLEX_API = 'https://etlex.eki.ee/etLex/api/v1.0/projects/etLex/lemmas'
OUT_DIR = ROOT / 'crm-v2/src/features/worksheet-studio/didactics'  # levelForms.<level>.json, one per level
LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1']

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


def fetch():
    import time
    import urllib.request
    items, offset = [], 0
    while True:
        data = json.load(urllib.request.urlopen(f'{ETLEX_API}?limit=500&offset={offset}', timeout=60))
        batch = data.get('items', [])
        items += batch
        offset += len(batch)
        if not batch or offset >= data.get('total_count', 0):
            break
        time.sleep(0.5)
    rows = sorted({(i['lemma'], i['pos'].split(',')[0], i['level']) for i in items if i.get('level') in LEVELS})
    ETLEX.write_text(json.dumps({'source': 'EKI etLex (Sõnaveeb õpetaja tööriistad), CC BY, https://sonaveeb.ee/teacher-tools', 'lemmas': [list(r) for r in rows]}, ensure_ascii=False, indent=0) + '\n')
    print(len(rows), 'lemmas')


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
    # etLex: one level per lemma; without it the older cumulative PDF lists (A1–B1)
    if ETLEX.exists():
        by_level = {level: [] for level in LEVELS}
        for lemma, pos, level in json.loads(ETLEX.read_text())['lemmas']:
            by_level[level].append((lemma, pos))
    else:
        by_level = {level: [tuple(x) for x in json.loads(LIST.read_text())['levels'].get(level, [])] for level in LEVELS}
    known = set()
    result = {}
    for level in LEVELS:
        new = set()
        for lemma, pos in by_level[level]:
            new |= forms_of(lemma, pos)
        new -= known
        known |= new
        result[level] = '\n'.join(sorted(new))
        print(level, len(by_level[level]), 'lemmas', len(new), 'new forms')
    for level in LEVELS:
        (OUT_DIR / f'levelForms.{level}.json').write_text(json.dumps({'source': 'EKI etLex level vocabularies (CC BY), forms by Vabamorf', 'level': level, 'forms': result[level]}, ensure_ascii=False) + '\n')
    old = OUT_DIR / 'levelForms.json'
    if old.exists():
        old.unlink()


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'parse':
        parse(sys.argv[2])
    elif len(sys.argv) > 1 and sys.argv[1] == 'fetch':
        fetch()
    elif len(sys.argv) > 1 and sys.argv[1] == 'build':
        build()
    else:
        print(__doc__)
