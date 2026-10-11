import { publishedWorksheetDoc } from '../library/libraryModel.js';
import { vocabPairs } from '../vocabulary/deckModel.js';
import { clozeGaps } from '../worksheet-studio/engine/blocks/exam.jsx';
import { TEXTBOOK_SHEET_ID } from '../../services/firebase/lessonWorksheets.js';

// Pet mini-games on the learner's own topics: the material comes from the worksheets his teacher gave him (worksheetDoc
// blocks with their right answers), so the games always follow what he is learning now. Pure: the component passes in
// the assignments and a random source. Nothing here is written anywhere; playing only fills the pet's joy (petCare).
//
//   catch — „Püüa sõna”: the right word for a gap / a form / a question falls from the sky; catch it before it lands
//   pairs — „Paarid”: memory cards from matching tasks
//   order — „Lauseehitus”: build the sentence from its words
//   truth — „Kiire kontroll”: right or wrong, before the time runs out (true/false tasks, sentences with an error)
//   sort  — „Sorteeri”: drop each word into the right basket of the pet (categorize tasks)
//   guess — „Arva sõna”: guess the word letter by letter from its clue (crosswords, vocabulary lists, matching)
//
// Material: the worksheets the teacher assigned, and the published course sheets of the lessons the learner has had
// (courseTopics). Both are the learner's own topics; nothing else is offered. The lesson's „Õpik” sheet (licensed
// textbook content, TEXTBOOK_SHEET_ID) is never used for games. „Arva sõna” is offered only on Estonian sheets (the
// English course has its own letters and spelling).

export const GAME_SIZE = { catch: 5, pairs: 6, order: 3, truth: 6, sort: 8, guess: 4 };
const MIN = { catch: 3, pairs: 3, order: 2, truth: 3, sort: 6, guess: 3 };
export const GAMES = [
  { key: 'catch', label: 'Püüa sõna', ru: 'Поймай нужное слово, пока оно не упало' },
  { key: 'pairs', label: 'Paarid', ru: 'Найди пары карточек' },
  { key: 'order', label: 'Lauseehitus', ru: 'Собери предложение из слов' },
  { key: 'truth', label: 'Kiire kontroll', ru: 'Верно или неверно — быстро!' },
  { key: 'sort', label: 'Sorteeri', ru: 'Разложи слова по корзинкам' },
  { key: 'guess', label: 'Arva sõna', ru: 'Угадай слово по буквам' },
];
// the letters of the „Arva sõna” keyboard
export const LETTERS = 'abcdefghijklmnoprsšzžtuvõäöüy'.split('');

const clean = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const same = (a, b) => clean(a).toLocaleLowerCase('et') === clean(b).toLocaleLowerCase('et');
const lines = (v) => String(v || '').split('\n').map(clean).filter(Boolean);
const words = (v) => clean(v).split(' ').filter(Boolean);
// a sorting card stays word-sized: a word or a short phrase, not a sentence
const SORT_MAX_WORDS = 3;

// the textbook sheet (licensed content) is not game material: by its sheet id or its doc's phase
export const isTextbookSheet = (record, doc = record?.worksheetDoc) => record?.id === TEXTBOOK_SHEET_ID || doc?.meta?.phase === TEXTBOOK_SHEET_ID;
// the sheet's language: course sheets carry meta.language (English course: 'en'); the English course lessons are 'en-…'
export function sheetLanguage(doc, lessonId = '') {
  if (doc?.meta?.language) return String(doc.meta.language);
  return /^en-/.test(String(lessonId || '')) ? 'en' : 'et';
}

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

// „Valiklünktekst”: „Ladu {*asub|asuma|asudes} Ringtee ääres.” → one round per gap: its own sentence (the other gaps
// filled with their right option) and its own options as the wrong words
const MARK = '\u0000';
function clozeRows(passage) {
  const text = String(passage || '');
  const gaps = clozeGaps(text);
  let n = -1;
  const pieces = text.split(/(\{[^}]*\})/g).map((p) => (p.startsWith('{') ? { gap: (n += 1) } : { text: p }));
  return gaps.map((opts, gi) => {
    const right = opts.find((o) => o.correct);
    const wrong = opts.filter((o) => !o.correct).map((o) => clean(o.text)).filter(Boolean);
    if (!right || !clean(right.text) || !wrong.length) return null;
    const filled = pieces.map((p) => ('gap' in p ? (p.gap === gi ? MARK : (gaps[p.gap].find((o) => o.correct)?.text || '')) : p.text)).join('');
    const sentence = filled.split(/\n+|(?<=[.!?…])\s+/).find((x) => x.includes(MARK)) || '';
    const [before, after = ''] = sentence.split(MARK);
    return { before: clean(before), after: clean(after), answer: clean(right.text), full: clean(sentence.replace(MARK, right.text)), own: wrong };
  }).filter(Boolean);
}

// everything a sheet offers for the games
export function sheetItems(doc) {
  const out = { catch: [], pairs: [], order: [], truth: [], sort: [], guess: [] };
  const answers = [];
  const gapRows = [];
  for (const b of doc?.blocks || []) {
    const d = b.data || {};
    if (b.type === 'gaps' || b.type === 'listening') {
      lines(d.sentences).map(gapSentence).filter(Boolean).forEach((g) => { gapRows.push(g); answers.push(g.answer); });
      String(d.bank || '').split(/[,;\n]/).map(clean).filter(Boolean).forEach((w) => answers.push(w));
    }
    if (b.type === 'cloze') clozeRows(d.passage).forEach((g) => gapRows.push(g));
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
    // „Ütle teisiti”: the expected sentence is a sentence to build
    if (b.type === 'transformation') {
      (d.rows || []).forEach((r) => { if (clean(r.answer)) out.order.push({ sentence: clean(r.answer) }); });
    }
    // a dialogue with gaps: „See on meie uus õpetaja. [Tal on] habe…” is a gap like in `gaps`
    if (b.type === 'dialogue') {
      (d.lines || []).map((l) => gapSentence(l?.text || '')).filter(Boolean).forEach((g) => { gapRows.push(g); answers.push(g.answer); });
    }
    // two or more named groups of words: every word goes into its group's basket. Cards stay word-sized: longer items
    // are skipped, and a group made mostly of sentences is not a basket
    if (b.type === 'categorize') {
      const groups = (d.groups || []).map((g) => {
        const all = String(g.words || '').split(/[,;\n]/).map(clean).filter(Boolean);
        const short = all.filter((w) => words(w).length <= SORT_MAX_WORDS);
        return { name: clean(g.name), words: short.length * 2 >= all.length ? short : [] };
      }).filter((g) => g.name && g.words.length);
      if (groups.length >= 2 && groups.length <= 4) out.sort.push({ groups });
    }
    if (b.type === 'crossword') {
      (d.rows || []).forEach((r) => out.guess.push({ clue: clean(r.clue), word: clean(r.answer) }));
    }
    // vocabulary lists and matching: the meaning is the clue (only single words make a fair letter game)
    if (b.type === 'vocab') vocabPairs(d.words).forEach(([word, meaning]) => out.guess.push({ clue: meaning, word }));
    if (b.type === 'match') (d.pairs || []).forEach((p) => out.guess.push({ clue: clean(p.right), word: clean(p.left) }));
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
    const wrong = g.own || uniqueBy([...(g.extra || []), ...pool].filter((w) => !same(w, g.answer)), (x) => x).slice(0, 6);
    if (!wrong.length) return;
    const { own, ...row } = g; // eslint-disable-line no-unused-vars
    out.catch.push({ ...row, options: [g.answer, ...wrong] });
    // a filled gap sentence of 3–9 words is also a sentence to build
    if (g.full && words(g.full).length >= 3 && words(g.full).length <= 9) out.order.push({ sentence: g.full });
  });
  out.pairs = uniqueBy(out.pairs, (p) => p.left);
  out.order = uniqueBy(out.order.filter((o) => words(o.sentence).length >= 3 && words(o.sentence).length <= 12), (o) => o.sentence);
  out.truth = uniqueBy(out.truth, (t) => t.text);
  // a clue that already contains the word (koer → koeri) gives it away
  const lower = (v) => clean(v).toLocaleLowerCase('et');
  if (sheetLanguage(doc) !== 'et') out.guess = [];
  out.guess = uniqueBy(out.guess.filter((g) => g.clue && guessable(g.word) && !lower(g.clue).includes(lower(g.word)) && !lower(g.word).includes(lower(g.clue))), (g) => g.word);
  return out;
}

// one word of 3–14 letters that the keyboard can type (no spaces, digits or punctuation)
export function guessable(word) {
  const w = clean(word).toLocaleLowerCase('et');
  return w.length >= 3 && w.length <= 14 && [...w].every((ch) => LETTERS.includes(ch));
}

// The learner's topics, newest first; open (not yet done) worksheets first, they are what he is learning now.
// how much a topic offers for one game (for „Sorteeri” the words, not the tasks)
export function gameSize(items, key) {
  if (key === 'sort') return (items?.sort || []).reduce((n, task) => n + task.groups.reduce((m, g) => m + g.words.length, 0), 0);
  return items?.[key]?.length || 0;
}

export function learnerTopics(assignments = [], limit = 6) {
  return [...assignments]
    .filter((a) => a.worksheetDoc?.blocks?.length && !isTextbookSheet(a))
    .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done') || String(b.assignedAt).localeCompare(String(a.assignedAt)))
    .map((a) => {
      const items = sheetItems(a.worksheetDoc);
      const games = GAMES.filter((g) => gameSize(items, g.key) >= MIN[g.key]).map((g) => g.key);
      return { id: a.id, title: clean(a.title || a.worksheetDoc?.meta?.title) || 'Tööleht', level: a.worksheetDoc?.meta?.level || '', items, games, source: a.source === 'course' ? 'course' : 'assigned' };
    })
    .filter((t) => t.games.length)
    .filter((t, i, list) => list.findIndex((x) => same(x.title, t.title)) === i)
    .slice(0, limit);
}

// The published course sheets of the lessons the learner has had (lessons.topicLessonId), as pseudo-assignments for
// learnerTopics: one per lesson, the phase sheets merged. `sheetsByLesson`: { lessonId: [lesson worksheet records] }.
export function courseTopics(lessons = [], sheetsByLesson = {}, limit = 4) {
  const seen = new Set();
  return [...lessons]
    .filter((l) => l.topicLessonId && (!l.status || l.status === 'Toimunud'))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .filter((l) => (seen.has(l.topicLessonId) ? false : seen.add(l.topicLessonId)))
    .slice(0, limit)
    .map((l) => {
      const docs = (sheetsByLesson[l.topicLessonId] || []).filter((r) => !isTextbookSheet(r, publishedWorksheetDoc(r)))
        .map(publishedWorksheetDoc).filter((d) => d?.blocks?.length);
      if (!docs.length) return null;
      return { id: `course:${l.topicLessonId}`, source: 'course', status: 'done', assignedAt: l.date, title: clean(l.topic) || clean(docs[0].meta?.title) || 'Tund',
        worksheetDoc: { meta: { title: clean(l.topic) || docs[0].meta?.title, level: l.topicLevel || docs[0].meta?.level || '', language: sheetLanguage(docs[0], l.topicLessonId) }, blocks: docs.flatMap((d) => d.blocks) } };
    })
    .filter(Boolean);
}

// The rounds of one game (options shuffled; `catch` keeps 3 options: the answer and 2 others)
export function gameRounds(topic, game, random = Math.random) {
  const items = shuffle(topic?.items?.[game] || [], random).slice(0, GAME_SIZE[game]);
  if (game === 'catch') return items.map((it) => ({ ...it, options: shuffle([it.answer, ...shuffle(it.options.filter((o) => !same(o, it.answer)), random).slice(0, 2)], random) }));
  if (game === 'pairs') return shuffle(items.flatMap((p, i) => [{ id: `${i}a`, pair: i, text: p.left }, { id: `${i}b`, pair: i, text: p.right }]), random);
  if (game === 'order') return items.map((it) => { const w = words(it.sentence); let mixed = shuffle(w, random); if (w.length > 1 && mixed.join(' ') === w.join(' ')) mixed = [...w.slice(1), w[0]]; return { sentence: it.sentence, words: w, mixed }; });
  if (game === 'guess') return items.map((it) => ({ ...it, letters: [...clean(it.word).toLocaleLowerCase('et')] }));
  return items;
}

// „Sorteeri”: one categorize task (with the most words) → its baskets and up to GAME_SIZE.sort words, mixed
export function sortRound(topic, random = Math.random) {
  const tasks = [...(topic?.items?.sort || [])].sort((a, b) => b.groups.reduce((n, g) => n + g.words.length, 0) - a.groups.reduce((n, g) => n + g.words.length, 0));
  const task = tasks[Math.floor(random() * Math.min(tasks.length, 3))] || tasks[0];
  if (!task) return { baskets: [], words: [] };
  const all = task.groups.flatMap((g) => g.words.map((word) => ({ word, basket: g.name })));
  return { baskets: task.groups.map((g) => g.name), words: shuffle(all, random).slice(0, GAME_SIZE.sort) };
}

export const sameSentence = (a, b) => clean(a).replace(/[.!?]+$/, '') === clean(b).replace(/[.!?]+$/, '');
