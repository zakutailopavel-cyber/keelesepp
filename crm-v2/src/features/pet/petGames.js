// Pet mini-games on the learner's own topics: the material comes from the worksheets his teacher gave him (worksheetDoc
// blocks with their right answers), so the games always follow what he is learning now. Pure: the component passes in
// the assignments and a random source. Nothing here is written anywhere; playing only fills the pet's joy (petCare).
//
//   catch — „Püüa sõna”: the right word for a gap / a form / a question falls from the sky; catch it before it lands
//   pairs — „Paarid”: memory cards from matching tasks
//   order — „Lauseehitus”: build the sentence from its words
//   truth — „Kiire kontroll”: right or wrong, before the time runs out (true/false tasks, sentences with an error)

export const GAME_SIZE = { catch: 5, pairs: 6, order: 3, truth: 6 };
const MIN = { catch: 3, pairs: 3, order: 2, truth: 3 };
export const GAMES = [
  { key: 'catch', label: 'Püüa sõna', ru: 'Поймай нужное слово, пока оно не упало' },
  { key: 'pairs', label: 'Paarid', ru: 'Найди пары карточек' },
  { key: 'order', label: 'Lauseehitus', ru: 'Собери предложение из слов' },
  { key: 'truth', label: 'Kiire kontroll', ru: 'Верно или неверно — быстро!' },
];

const clean = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const same = (a, b) => clean(a).toLocaleLowerCase('et') === clean(b).toLocaleLowerCase('et');
const lines = (v) => String(v || '').split('\n').map(clean).filter(Boolean);
const words = (v) => clean(v).split(' ').filter(Boolean);

export function shuffle(list, random = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const uniqueBy = (list, key) => {
  const seen = new Set();
  return list.filter((x) => { const k = key(x).toLocaleLowerCase('et'); if (!k || seen.has(k)) return false; seen.add(k); return true; });
};

// "Ma ärkan [hommikul|varakult] kell [7]." → the first gap is asked, the other gaps are filled with their answer
function gapSentence(line) {
  const parts = String(line).split(/(\[[^\]]*\])/g);
  const at = parts.findIndex((p) => p.startsWith('['));
  if (at < 0) return null;
  const fill = (list) => list.map((p) => (p.startsWith('[') ? clean(p.slice(1, -1).split('|')[0]) : p)).join('');
  const answer = clean(parts[at].slice(1, -1).split('|')[0]);
  if (!answer) return null;
  return { before: clean(fill(parts.slice(0, at))), after: clean(fill(parts.slice(at + 1))), answer, full: clean(fill(parts)) };
}

// everything a sheet offers for the games
export function sheetItems(doc) {
  const out = { catch: [], pairs: [], order: [], truth: [] };
  const answers = [];
  const gapRows = [];
  for (const b of doc?.blocks || []) {
    const d = b.data || {};
    if (b.type === 'gaps' || b.type === 'listening') {
      lines(d.sentences).map(gapSentence).filter(Boolean).forEach((g) => { gapRows.push(g); answers.push(g.answer); });
      String(d.bank || '').split(/[,;\n]/).map(clean).filter(Boolean).forEach((w) => answers.push(w));
    }
    if (b.type === 'wordforms') {
      (d.rows || []).filter((r) => clean(r.base) && clean(r.answer)).forEach((r) => {
        answers.push(clean(r.answer));
        gapRows.push({ prompt: `${clean(r.base)}${clean(r.prompt) ? ` → ${clean(r.prompt)}` : ''}`, answer: clean(r.answer), extra: [clean(r.base)] });
      });
    }
    if (b.type === 'choice') {
      (d.questions || []).forEach((q) => {
        const opts = lines(q.options);
        const right = opts.find((o) => o.startsWith('*'));
        if (!clean(q.q) || !right || opts.length < 2) return;
        out.catch.push({ prompt: clean(q.q), answer: clean(right.slice(1)), options: opts.map((o) => clean(o.replace(/^\*/, ''))) });
      });
    }
    if (b.type === 'match') {
      (d.pairs || []).filter((p) => clean(p.left) && clean(p.right)).forEach((p) => out.pairs.push({ left: clean(p.left), right: clean(p.right) }));
    }
    if (b.type === 'wordorder' || b.type === 'dictation') {
      lines(d.sentences).forEach((s) => out.order.push({ sentence: s }));
    }
    if (b.type === 'truefalse') {
      (d.statements || []).filter((s) => clean(s.text) && (s.answer === 'true' || s.answer === 'false')).forEach((s) => out.truth.push({ text: clean(s.text), right: s.answer === 'true' }));
    }
    if (b.type === 'errorfix') {
      (d.rows || []).filter((r) => clean(r.wrong) && clean(r.answer) && !same(r.wrong, r.answer)).forEach((r) => {
        out.truth.push({ text: clean(r.wrong), right: false, fix: clean(r.answer) });
        out.truth.push({ text: clean(r.answer), right: true });
      });
    }
  }
  const pool = uniqueBy(answers, (x) => x);
  gapRows.forEach((g) => {
    const wrong = uniqueBy([...(g.extra || []), ...pool].filter((w) => !same(w, g.answer)), (x) => x).slice(0, 6);
    if (!wrong.length) return;
    out.catch.push({ ...g, options: [g.answer, ...wrong] });
    // a filled gap sentence of 3–9 words is also a sentence to build
    if (g.full && words(g.full).length >= 3 && words(g.full).length <= 9) out.order.push({ sentence: g.full });
  });
  out.pairs = uniqueBy(out.pairs, (p) => p.left);
  out.order = uniqueBy(out.order.filter((o) => words(o.sentence).length >= 3 && words(o.sentence).length <= 12), (o) => o.sentence);
  out.truth = uniqueBy(out.truth, (t) => t.text);
  return out;
}

// The learner's topics, newest first; open (not yet done) worksheets first, they are what he is learning now.
export function learnerTopics(assignments = [], limit = 4) {
  return [...assignments]
    .filter((a) => a.worksheetDoc?.blocks?.length)
    .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done') || String(b.assignedAt).localeCompare(String(a.assignedAt)))
    .map((a) => {
      const items = sheetItems(a.worksheetDoc);
      const games = GAMES.filter((g) => items[g.key].length >= MIN[g.key]).map((g) => g.key);
      return { id: a.id, title: clean(a.title || a.worksheetDoc?.meta?.title) || 'Tööleht', level: a.worksheetDoc?.meta?.level || '', items, games };
    })
    .filter((t) => t.games.length)
    .filter((t, i, list) => list.findIndex((x) => same(x.title, t.title)) === i)
    .slice(0, limit);
}

// The rounds of one game (options shuffled; `catch` keeps 3 options: the answer and 2 others)
export function gameRounds(topic, game, random = Math.random) {
  const items = shuffle(topic?.items?.[game] || [], random).slice(0, GAME_SIZE[game]);
  if (game === 'catch') return items.map((it) => ({ ...it, options: shuffle([it.answer, ...shuffle(it.options.filter((o) => !same(o, it.answer)), random).slice(0, 2)], random) }));
  if (game === 'pairs') return shuffle(items.flatMap((p, i) => [{ id: `${i}a`, pair: i, text: p.left }, { id: `${i}b`, pair: i, text: p.right }]), random);
  if (game === 'order') return items.map((it) => { const w = words(it.sentence); let mixed = shuffle(w, random); if (w.length > 1 && mixed.join(' ') === w.join(' ')) mixed = [...w.slice(1), w[0]]; return { sentence: it.sentence, words: w, mixed }; });
  return items;
}

export const sameSentence = (a, b) => clean(a).replace(/[.!?]+$/, '') === clean(b).replace(/[.!?]+$/, '');
