#!/usr/bin/env python3
"""Estonian language gate for the course sheets (owner 2026-10-14: the ideal curriculum's quality gates).

Every Estonian word a learner reads or is expected to write (texts, tasks, options, answers, dictations, vocabulary)
goes through Vabamorf's speller (EstNLTK 1.7.5, offline). Not checked: the deliberately wrong sentences of error tasks,
the Russian sources of translations, teacher-only fields. Proper names unknown to the speller are listed separately.

    .venv/bin/python tools/course-audit/language.py <sheets.json> [course] [out.json]

<sheets.json>: [{ course, module, lessonId, phase, doc }] — dumped from admin/course/registry.js moduleSheets().
Prints the unknown words with their sheets and the speller's suggestions; exit code 1 when anything is unknown.
"""
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

from estnltk.vabamorf.morf import spellcheck

WORD = re.compile(r"[A-Za-zÕÄÖÜŠŽõäöüšž]+(?:-[A-Za-zÕÄÖÜŠŽõäöüšž]+)*")
CYRILLIC = re.compile(r"[А-Яа-яЁё]")
SKIP_KEYS = {'wrong', 'source', 'hint', 'img', 'audio', 'src', 'theme', 'tone', 'width', 'goal', 'id', 'type', 'answer_ru',
             'kind', 'layout', 'showBank', 'columns', 'style', 'mode', 'shape'}
# grammar terms of the explanations (endings, form names) and English words that only appear as technical values
GRAMMAR = re.compile(r"^(?:da|des|tavat|tav|tud|nud|vat|ga|le|sse|ks|lt|ni|sin|us|ti|di|dud|hta|hti|htud|htaks|daks|dakse|hakse|miseks|ok|võrd)(?:-.*)?$")
TECHNICAL = {'true', 'false', 'yes', 'no', 'flow', 'wide', 'compare', 'timeline', 'venn', 'tree', 'drive', 'kiss', 'full', 'half'}
# words checked by hand and correct although the speller does not know them (compounds, loans, „-mis” before „ja”)
ALLOW_FILE = Path(__file__).with_name('language-allow.txt')
ALLOW = {line.strip() for line in ALLOW_FILE.read_text(encoding='utf-8').splitlines() if line.strip() and not line.startswith('#')} if ALLOW_FILE.exists() else set()


def strings(value, key=''):
    """All learner-facing strings of a block's data, without the deliberately wrong error sentences."""
    if key in SKIP_KEYS:
        return
    if isinstance(value, str):
        if not CYRILLIC.search(value):
            # {*right|wrong|…} option gaps: only the right option (the wrong ones may be wrong forms on purpose)
            value = re.sub(r"\{([^}]*)\}", lambda m: ' '.join(o[1:] for o in m.group(1).split('|') if o.startswith('*')), value)
            # [a|b] gap answers and *right options are words the learner writes / reads
            yield re.sub(r"[\[\]|*{}]", ' ', value)
        else:
            # „kõigepealt — сначала”: the Estonian head of a vocabulary entry
            head = re.split(r"\s[—–-]\s", value)[0]
            if not CYRILLIC.search(head):
                yield head
    elif isinstance(value, list):
        for item in value:
            yield from strings(item, key)
    elif isinstance(value, dict):
        for k, v in value.items():
            yield from strings(v, k)


def main():
    path = sys.argv[1]
    course = sys.argv[2] if len(sys.argv) > 2 else ''
    out_path = sys.argv[3] if len(sys.argv) > 3 else ''
    sheets = [s for s in json.load(open(path, encoding='utf-8')) if not course or s['course'] == course]
    where = defaultdict(set)
    for sheet in sheets:
        label = f"{sheet['lessonId']} {sheet['phase']}"
        for block in sheet['doc'].get('blocks', []):
            data = block.get('data') or {}
            for text in strings(data):
                for word in WORD.findall(text):
                    if len(word) > 1 and word.lower() not in TECHNICAL and word not in ALLOW and not GRAMMAR.match(word.lower()):
                        where[word].add(label)
    words = sorted(where)
    unknown = []
    for word, result in zip(words, spellcheck(words, suggestions=True)):
        if not result['spelling']:
            unknown.append({'word': word, 'suggestions': result['suggestions'][:4], 'sheets': sorted(where[word]), 'name': word[0].isupper()})
    common = [u for u in unknown if not u['name']]
    names = [u for u in unknown if u['name']]
    print(f"{len(words)} different words, unknown: {len(common)} lower-case, {len(names)} capitalised (names?)")
    for u in common:
        print(f"  {u['word']:<22} → {', '.join(u['suggestions']) or '—':<40} {', '.join(u['sheets'][:4])}{' …' if len(u['sheets']) > 4 else ''}")
    if names:
        print('capitalised:', ', '.join(u['word'] for u in names[:80]))
    if out_path:
        json.dump({'unknown': common, 'names': names}, open(out_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return 1 if common else 0


if __name__ == '__main__':
    sys.exit(main())
