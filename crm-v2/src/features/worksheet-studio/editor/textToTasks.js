// „Tekstist ülesanded” (owner 2026-10-10): the teacher pastes one text and it turns into different tasks — reading,
// gaps (words the teacher clicks, or picked automatically), word order, dictation, sentence halves to match and a
// vocabulary list. Pure: the panel shows the result and inserts the blocks.

const clean = (t) => String(t || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim();
const wordsOf = (s) => s.split(/\s+/).filter(Boolean);
const bare = (w) => w.replace(/[^\p{L}\p{N}-]/gu, '');

export function sentencesOf(text) {
  return clean(text).replace(/\n+/g, ' ').split(/(?<=[.!?…])\s+/).map((s) => s.trim()).filter((s) => wordsOf(s).length >= 3);
}

// the text as clickable words: [{ i, s (sentence index), word, bare }]
export function tokensOf(text) {
  const out = [];
  sentencesOf(text).forEach((sentence, s) => wordsOf(sentence).forEach((word) => out.push({ i: out.length, s, word, bare: bare(word) })));
  return out;
}

// gaps from the words the teacher chose (token indexes); one line per sentence that has a chosen word
export function gapsFromChoice(text, chosen = [], { bank = true } = {}) {
  const pick = new Set(chosen);
  const tokens = tokensOf(text);
  const lines = [];
  const used = [];
  sentencesOf(text).forEach((_, s) => {
    const row = tokens.filter((t) => t.s === s);
    if (!row.some((t) => pick.has(t.i) && t.bare)) return;
    lines.push(row.map((t) => (pick.has(t.i) && t.bare ? (used.push(t.bare), t.word.replace(t.bare, `[${t.bare}]`)) : t.word)).join(' '));
  });
  return {
    title: 'Täienda laused.', instruction: bank ? 'Kasuta sõnapanga sõnu.' : 'Kirjuta puuduv sõna õiges vormis.',
    sentences: lines.join('\n'), bank: bank ? [...new Set(used)].sort((a, b) => a.localeCompare(b, 'et')).join(', ') : '', showBank: bank ? 'yes' : 'no',
  };
}

// automatic choice: the longest word (5+ letters, not the first) of each sentence, up to `count` sentences
export function autoGapChoice(text, count = 8) {
  const tokens = tokensOf(text);
  const chosen = [];
  const seen = new Set();
  for (let s = 0; chosen.length < count && tokens.some((t) => t.s === s); s += 1) {
    const row = tokens.filter((t) => t.s === s && t.bare.length >= 5 && t.i !== tokens.find((x) => x.s === s).i && !seen.has(t.bare.toLowerCase()));
    if (!row.length) continue;
    const best = row.sort((a, b) => b.bare.length - a.bare.length)[0];
    seen.add(best.bare.toLowerCase());
    chosen.push(best.i);
  }
  return chosen;
}

export const wordOrderFrom = (text, count = 6) => ({
  title: 'Pane sõnad õigesse järjekorda.', instruction: 'Kirjuta lause õigesti.',
  sentences: sentencesOf(text).filter((s) => wordsOf(s).length >= 4 && wordsOf(s).length <= 10).slice(0, count).join('\n'),
});

export const dictationFrom = (text, count = 6) => ({
  title: 'Etteütlus.', instruction: 'Kuula ja kirjuta laused.', lines: count,
  sentences: sentencesOf(text).filter((s) => wordsOf(s).length <= 12).slice(0, count).join('\n'),
});

// sentence halves to match (split before the middle word)
export function halvesFrom(text, count = 6) {
  const pairs = sentencesOf(text).filter((s) => wordsOf(s).length >= 6 && wordsOf(s).length <= 16).slice(0, count).map((s) => {
    const w = wordsOf(s);
    const cut = Math.ceil(w.length / 2);
    return { left: `${w.slice(0, cut).join(' ')} …`, right: `… ${w.slice(cut).join(' ')}` };
  });
  return { title: 'Ühenda lause algus ja lõpp.', instruction: 'Leia igale algusele sobiv lõpp.', pairs };
}

export const readingFrom = (text, title = '') => ({
  title: 'Loe tekst.', instruction: 'Loe tekst ja vasta küsimustele.', passageTitle: title, passage: clean(text), questions: '', lineWidth: 'wide',
});

export function vocabFrom(text, count = 12) {
  const words = [...new Set(tokensOf(text).map((t) => t.bare.toLocaleLowerCase('et')).filter((w) => w.length >= 6))];
  return { title: 'Sõnavara', words: words.sort((a, b) => b.length - a.length).slice(0, count).join(', '), columns: '3' };
}

export const TEXT_TASKS = [
  { key: 'reading', label: 'Lugemine (tekst + küsimused)', type: 'reading' },
  { key: 'gaps', label: 'Lüngad', type: 'gaps' },
  { key: 'wordorder', label: 'Sõnajärg', type: 'wordorder' },
  { key: 'dictation', label: 'Etteütlus', type: 'dictation' },
  { key: 'halves', label: 'Lause algus ja lõpp (ühenda)', type: 'match' },
  { key: 'vocab', label: 'Sõnavara', type: 'vocab' },
];

// the data of each chosen task: { reading: {...}, gaps: {...}, … }; tasks without content are left out
export function tasksFromText(text, keys, { chosen = null, bank = true, title = '' } = {}) {
  const make = {
    reading: () => readingFrom(text, title),
    gaps: () => gapsFromChoice(text, chosen?.length ? chosen : autoGapChoice(text), { bank }),
    wordorder: () => wordOrderFrom(text),
    dictation: () => dictationFrom(text),
    halves: () => halvesFrom(text),
    vocab: () => vocabFrom(text),
  };
  const filled = (k, d) => (k === 'halves' ? d.pairs.length >= 2 : k === 'vocab' ? Boolean(d.words) : k === 'reading' ? Boolean(d.passage) : Boolean(d.sentences));
  return keys.map((k) => [k, make[k]?.()]).filter(([k, d]) => d && filled(k, d));
}
