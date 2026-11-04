// „Analüüs” → word-level „Viga” marks (owner bug 2026-11-04). The school Mac's checker (TartuNLP GEC) returns one
// correction per SENTENCE: { said: the learner's sentence (whitespace collapsed), corrected: the whole corrected
// sentence }. Marking `said` as such highlighted whole sentences, and a sentence that could not be found (e.g. the
// answer had a line break or two spaces where the checker had one) framed the whole answer field. Here the sentence is
// found again token by token, the two sentences are aligned word by word (LCS diff) and every changed word or short
// group becomes its own mark at the exact character offsets of the learner's text.

const TOKEN = /[\p{L}\p{N}]+(?:[-'’][\p{L}\p{N}]+)*|[^\s\p{L}\p{N}]/gu;
const isWord = (t) => /[\p{L}\p{N}]/u.test(t.text);
const nfc = (s) => String(s || '').normalize('NFC');

// words and single punctuation marks with their character offsets
export function tokenize(text) {
  const out = [];
  const source = String(text || '');
  for (const m of source.matchAll(TOKEN)) out.push({ text: nfc(m[0]), start: m.index, end: m.index + m[0].length });
  return out;
}

// LCS alignment of two token lists; case-sensitive and diacritic-sensitive (plaju ≠ palju, õpetaja ≠ opetaja)
export function alignTokens(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) for (let j = b.length - 1; j >= 0; j -= 1) {
    dp[i][j] = a[i].text === b[j].text ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  const ops = [];
  let i = 0; let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i].text === b[j].text) { ops.push({ type: 'same', i, j }); i += 1; j += 1; } else if (i < a.length && (j >= b.length || dp[i + 1][j] >= dp[i][j + 1])) { ops.push({ type: 'del', i }); i += 1; } else { ops.push({ type: 'ins', j }); j += 1; }
  }
  return ops;
}

// changed stretches between unchanged tokens: { del: [i…], ins: [j…], before: i of the last unchanged token or -1 }
function hunksOf(ops) {
  const hunks = [];
  let current = null;
  let before = -1;
  for (const op of ops) {
    if (op.type === 'same') { if (current) hunks.push(current); current = null; before = op.i; continue; }
    if (!current) current = { del: [], ins: [], before };
    current[op.type].push(op.type === 'del' ? op.i : op.j);
  }
  if (current) hunks.push(current);
  return hunks;
}

// the place of `said` in the text: its tokens in a row (any whitespace between them), else null
function locate(tokens, saidTokens) {
  if (!saidTokens.length) return null;
  outer: for (let k = 0; k + saidTokens.length <= tokens.length; k += 1) {
    for (let n = 0; n < saidTokens.length; n += 1) if (tokens[k + n].text !== saidTokens[n].text) continue outer;
    return k;
  }
  return null;
}

const slice = (text, list, from, to) => text.slice(list[from].start, list[to].end);
const PUNCT_NAME = { ',': 'koma', '.': 'punkt', '?': 'küsimärk', '!': 'hüüumärk', ':': 'koolon', ';': 'semikoolon' };
const MAX_GROUP = 3;
export const REWRITE_SHARE = 0.6;

// one sentence correction → marks { start, end, selectedText, parandus, selgitus } (offsets in `text`) and the
// changes that could not be placed ({ said, corrected }) — those are listed, never framed as the whole text
export function correctionMarks(text, correction) {
  const source = String(text || '');
  const said = tokenize(correction?.said);
  const fixed = tokenize(correction?.corrected);
  const tokens = tokenize(source);
  const at = locate(tokens, said);
  const ops = alignTokens(said, fixed);
  const hunks = hunksOf(ops);
  const marks = [];
  const missed = [];
  if (!hunks.length) return { marks, missed };
  const correctedText = String(correction?.corrected || '');
  const insText = (h) => (h.ins.length ? slice(correctedText, fixed, h.ins[0], h.ins[h.ins.length - 1]) : '');

  // most of the sentence changed: one mark „ümber sõnastada” instead of a patchwork
  const words = said.filter(isWord).length;
  const changed = Math.max(hunks.reduce((n, h) => n + h.del.filter((i) => isWord(said[i])).length, 0), hunks.reduce((n, h) => n + h.ins.filter((j) => isWord(fixed[j])).length, 0));
  if (at !== null && words && changed / words > REWRITE_SHARE) {
    const start = tokens[at].start;
    const end = tokens[at + said.length - 1].end;
    return { marks: [{ start, end, selectedText: source.slice(start, end), parandus: correctedText.trim(), selgitus: 'Sõnasta lause ümber.' }], missed };
  }

  // a stretch of the learner's tokens (indexes in `said`) → offsets in the text; found by place, else by search
  const place = (from, to) => {
    if (at !== null) return { start: tokens[at + from].start, end: tokens[at + to].end };
    const wanted = slice(String(correction?.said || ''), said, from, to);
    const found = findWord(source, wanted);
    return found < 0 ? null : { start: found, end: found + wanted.length };
  };
  const push = (from, to, parandus, selgitus, change) => {
    const spot = place(from, to);
    if (!spot) { missed.push(change); return; }
    marks.push({ ...spot, selectedText: source.slice(spot.start, spot.end), parandus, selgitus });
  };

  for (const h of hunks) {
    const change = { said: h.del.length ? slice(String(correction?.said || ''), said, h.del[0], h.del[h.del.length - 1]) : '', corrected: insText(h) };
    if (!h.del.length) {
      // something is missing: marked on the word before (or after, at the start of the sentence)
      const anchor = h.before >= 0 ? h.before : 0;
      if (!said.length) { missed.push(change); continue; }
      const added = h.ins.map((j) => fixed[j].text);
      const punct = added.length === 1 && !isWord(fixed[h.ins[0]]);
      const where = h.before >= 0 ? 'järele' : 'ette';
      const selgitus = punct ? `Lisa ${PUNCT_NAME[added[0]] || `„${added[0]}”`} sõna „${said[anchor].text}” ${where}.` : `Lisa „${change.corrected}” sõna „${said[anchor].text}” ${where}.`;
      push(anchor, anchor, `+ ${change.corrected}`, selgitus, change);
      continue;
    }
    if (!h.ins.length) { push(h.del[0], h.del[h.del.length - 1], '–', 'Jäta ära.', change); continue; }
    // a long stretch of word-for-word swaps: one mark per word
    if (h.del.length > MAX_GROUP && h.del.length === h.ins.length) {
      h.del.forEach((i, k) => push(i, i, fixed[h.ins[k]].text, '', { said: said[i].text, corrected: fixed[h.ins[k]].text }));
      continue;
    }
    push(h.del[0], h.del[h.del.length - 1], change.corrected, '', change);
  }
  return { marks, missed };
}

// `wanted` as a whole word (not inside another word); -1 when it is not in the text
function findWord(text, wanted) {
  if (!wanted) return -1;
  let from = 0;
  for (;;) {
    const at = text.indexOf(wanted, from);
    if (at < 0) return -1;
    const before = text[at - 1];
    const after = text[at + wanted.length];
    const edge = (ch) => ch === undefined || !/[\p{L}\p{N}]/u.test(ch);
    if (edge(before) && edge(after)) return at;
    from = at + 1;
  }
}
