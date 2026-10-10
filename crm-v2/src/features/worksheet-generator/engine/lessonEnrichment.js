// Lesson enrichment (docs/MATERIAL_QUALITY_CHECKLIST.md): after a lesson's Avasta / Harjuta / Kasuta sheets are built,
// fill the gaps the checklist measures — a listening task made from the lesson's own text (A1, A3), pair work (A2),
// a self-check on every sheet (J5), a stretch line for faster learners (J4) and a real-life task (K4). Each step runs
// only when the lesson lacks it, never removes anything and keeps a sheet within SHEET_MINUTES.max.
import { SHEET_MINUTES, sheetMinutes } from '../../worksheet-studio/didactics/timeEstimate.js';

const PRODUCTIVE = ['speaking', 'writing', 'rolecards', 'guidedletter'];
const CLOSING = ['selfcheck', 'rubric'];
const LISTENING = ['listening', 'dictation'];
const INTERACTION = /\b(paaris|paarilise\w*|kaaslase\w*|rühmas|rühma\w*|grupis|klassikaaslase\w*|lugege|rääkige|küsige|arutage|vahetage|tutvustage|leppige|mängige|võrrelge)\b/i;
const STRETCH_MARK = /(kiiremale|lisaülesanne|kui jõuad)/i;
const sentenceEnd = (text) => (/[.!?…]$/.test(text) ? text : `${text}.`);
const OPENING = ['text', 'image', 'tip', 'notice', 'vocab', 'dialogue', 'reading', 'listening', 'pictures'];
const WARM_UP = {
  basic: (topic) => `Tänane teema: ${sentenceEnd(topic)} Mõtle hetk: mida sa sellest juba tead? Ütle paarilisele 2–3 sõna.`,
  advanced: (topic) => `Tänane teema: ${sentenceEnd(topic)} Arutage paarilisega üks minut: milline on teie kogemus sellel teemal?`,
};
const REAL_LIFE_MARK = /\b(päriselus|kodus|veebis|linnas)\b/i;

export function levelBand(level = '') {
  const key = String(level).toUpperCase();
  if (key.startsWith('C')) return 'C1';
  if (key.startsWith('B2')) return 'B2';
  if (key.startsWith('B')) return 'B1';
  return 'A2';
}

const LISTEN = {
  A2: { count: 4, words: [4, 12], title: 'Kuula ja kirjuta.', instruction: 'Kuula lauseid (heli või õpetaja loeb). Kirjuta puuduv sõna. Võrdle paarilisega.' },
  B1: { count: 4, words: [5, 16], title: 'Kuula ja täida.', instruction: 'Kuula lauseid kaks korda (heli või õpetaja loeb). Täida lüngad ja võrdle paarilisega.' },
  B2: { count: 5, words: [6, 20], title: 'Kuula ja täida.', instruction: 'Kuula tunni teksti lõiku kaks korda (heli või õpetaja loeb). Täida lüngad, siis võrdle paarilisega.' },
  C1: { count: 5, words: [7, 24], title: 'Kuula ja täida.', instruction: 'Kuula lõiku kaks korda (heli või õpetaja loeb). Täida lüngad ja võrdle paarilisega: milline lause on kõige olulisem ja miks?' },
};

const SELF_CHECK = {
  basic: {
    discover: ['Ma saan aru tunni sõnadest.', 'Ma märkan uut vormi.', 'Ma oskan öelda 2–3 lauset teemal.'],
    practice: ['Ma kasutan uusi vorme õigesti.', 'Ma leian ja parandan oma vead.', 'Ma teen harjutused ilma abita.'],
    transfer: ['Ma oskan selles olukorras suhelda.', 'Ma kirjutan lühikese teksti.', 'Ma kasutan tunni sõnu ja väljendeid.'],
  },
  advanced: {
    discover: ['Ma mõistan teksti põhiideed ja detaile.', 'Ma märkan tunni keelemustrit.', 'Ma oskan teemal oma arvamust öelda.'],
    practice: ['Ma kasutan sihtvorme täpselt.', 'Ma leian ja parandan oma vead.', 'Ma teen ülesanded ilma abita.'],
    transfer: ['Ma lahendan uue olukorra eesti keeles.', 'Ma räägin ja kirjutan selgelt ning seostatult.', 'Ma kasutan tunni väljendeid loomulikult.'],
  },
};

const STRETCH = {
  A2: 'Kiiremale: kirjuta või ütle veel 2 lauset.',
  B1: 'Kiiremale: lisa üks näide oma elust.',
  B2: 'Kiiremale: lisa vastuargument ja vasta sellele.',
  C1: 'Kiiremale: lisa vastuargument, lükka see ümber ja lõpeta soovitusega.',
};

const REAL_LIFE = {
  A2: () => ['Ütle poes, kohvikus või tööl vähemalt üks tunni lause eesti keeles.', 'Kirjuta üles üks uus sõna, mida kuulsid või nägid linnas.'],
  B1: (topic) => [`Leia veebis või linnas üks eestikeelne kuulutus, teade või postitus teemal „${topic}”.`, 'Kirjuta üles 2 kasulikku väljendit ja kasuta neid järgmises tunnis.'],
  B2: (topic) => [`Loe või kuula sel nädalal üht eestikeelset uudist või arutelu teemal „${topic}” (ERR, raadio, veebis).`, 'Kirjuta üles 2 uut väljendit ja üks mõte, millega nõustud või ei nõustu.'],
  C1: (topic) => [`Jälgi sel nädalal üht eestikeelset avalikku arutelu teemal „${topic}” (ERR, raadio, veebis).`, 'Kirjuta üles üks seisukoht, selle põhjendus ja oma vastuargument.'],
};

const STOP = new Set('ja ning et kui aga sest see seda selle selles sellest sellele sellega need neid nende ta tema temaga mina minu mul ma sa sina sinu sul me meie meil te teie teil nad nemad neil tal on oli olid olen oled oleme olete olnud olema ei ka mis kes kus mida kuidas millal miks siis nüüd juba veel väga oma või kuid samuti seal siin saab tuleb kõik üks mitte ainult kuna mille kelle palju vähe rohkem kõige iga igal pärast enne ehk nagu ilma koos vaid isegi'.split(' '));

const wordsOf = (text) => String(text || '').split(/\s+/).filter(Boolean);
const clean = (text) => String(text || '')
  .replace(/\{\{([^}]*)\}\}/g, '$1')
  .replace(/\[([^\]|]*)(\|[^\]]*)?\]/g, '$1')
  .replace(/\s*\([^)]*\)/g, '')
  .replace(/\*\*/g, '')
  .replace(/\s+/g, ' ')
  .trim();
const sentencesOf = (text) => clean(text).split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);

// the lesson's own sentences, best sources first: reading passages, dialogues, situation texts, model sentences
function lessonSentences(docs) {
  const blocks = docs.flatMap((doc) => doc.blocks || []);
  const out = [];
  const add = (text) => sentencesOf(text).forEach((s) => out.push(s));
  blocks.filter((b) => b.type === 'reading').forEach((b) => add(b.data?.passage));
  blocks.filter((b) => b.type === 'dialogue').forEach((b) => (b.data?.lines || []).forEach((line) => add(line.text)));
  blocks.filter((b) => b.type === 'text').forEach((b) => add(b.data?.text));
  blocks.filter((b) => b.type === 'wordorder' || b.type === 'gaps').forEach((b) => String(b.data?.sentences || '').split('\n').forEach(add));
  return [...new Set(out)];
}

function gapWord(sentence) {
  const tokens = wordsOf(sentence).map((raw, index) => ({ raw, word: raw.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ''), index }));
  const pick = tokens
    .filter((t) => t.word.length >= 4 && /^\p{L}+$/u.test(t.word) && !STOP.has(t.word.toLocaleLowerCase('et')))
    .filter((t) => t.index === 0 || t.word[0] === t.word[0].toLocaleLowerCase('et'))
    .sort((a, b) => (a.index === 0) - (b.index === 0) || b.word.length - a.word.length || b.index - a.index)[0];
  return pick?.word || '';
}

export function listeningFromLesson(docs, band, count = LISTEN[band].count) {
  const [min, max] = LISTEN[band].words;
  const candidates = lessonSentences(docs).filter((s) => {
    const n = wordsOf(s).length;
    return n >= min && n <= max && /[.!?]$/.test(s) && !/[[\]{}…/]|\.\.\./.test(s) && gapWord(s);
  });
  if (candidates.length < 3) return null;
  const take = Math.min(count, candidates.length);
  const picked = Array.from({ length: take }, (_, i) => candidates[Math.floor((i * candidates.length) / take)]);
  const sentences = picked.map((s) => { const word = gapWord(s); return s.replace(word, `[${word}]`); });
  return {
    id: `enr_listening_${band}`,
    type: 'listening',
    width: 'full',
    span: 12,
    tone: 'sky',
    goal: 'g_read',
    data: { title: LISTEN[band].title, instruction: LISTEN[band].instruction, audio: null, sentences: sentences.join('\n'), transcript: picked.join(' ') },
  };
}

const tasksOf = (doc) => doc.blocks || [];
const fits = (doc) => sheetMinutes(doc) <= SHEET_MINUTES.max;
const withBlocks = (doc, blocks) => ({ ...doc, blocks });

function insertBeforeWork(doc, block) {
  const blocks = tasksOf(doc);
  let at = blocks.findIndex((b) => PRODUCTIVE.includes(b.type));
  if (at < 0) at = blocks.findIndex((b) => CLOSING.includes(b.type));
  if (at < 0) at = blocks.length;
  return withBlocks(doc, [...blocks.slice(0, at), block, ...blocks.slice(at)]);
}

// before the sheet's final self-check / rubric, else at the end
function insertBeforeClosing(doc, block) {
  const blocks = tasksOf(doc);
  const last = blocks.length - 1;
  return withBlocks(doc, last >= 0 && CLOSING.includes(blocks[last].type) ? [...blocks.slice(0, last), block, blocks[last]] : [...blocks, block]);
}

const appendInstruction = (block, text) => ({ ...block, data: { ...block.data, instruction: `${String(block.data?.instruction || '').trim()} ${text}`.trim() } });

function mapLast(doc, test, fn) {
  const blocks = tasksOf(doc);
  const at = blocks.findLastIndex(test);
  if (at < 0) return doc;
  return withBlocks(doc, blocks.map((b, i) => (i === at ? fn(b) : b)));
}

const topicOf = (doc) => String(doc.meta?.title || '').replace(/\s+—\s+.*$/, '').trim();

// entries: [{ phase: 'discover' | 'practice' | 'transfer', doc }] → same shape, enriched
export function enrichLesson(entries, { level } = {}) {
  if (!entries?.length) return entries;
  const band = levelBand(level || entries[0].doc?.meta?.level);
  let list = entries.map((e) => ({ ...e }));
  const all = () => list.map((e) => e.doc);
  const has = (test) => all().some((doc) => tasksOf(doc).some(test));

  // listening from the lesson's own text: Harjuta first, then Avasta, then Kasuta — wherever it still fits in time
  if (!has((b) => LISTENING.includes(b.type))) {
    const order = ['practice', 'discover', 'transfer'];
    const targets = order.map((phase) => list.findIndex((e) => e.phase === phase)).filter((i) => i >= 0);
    let placed = false;
    for (const count of [LISTEN[band].count, 3]) {
      if (placed) break;
      const block = listeningFromLesson(all(), band, count);
      if (!block) break;
      for (const i of targets) {
        const next = insertBeforeWork(list[i].doc, block);
        if (fits(next)) { list[i] = { ...list[i], doc: next }; placed = true; break; }
      }
    }
  }

  // pair work: the first speaking task (else the first writing task) is done with a partner
  const interacts = () => has((b) => b.type === 'rolecards' || INTERACTION.test(String(b.data?.instruction || '')));
  if (!interacts()) {
    for (const type of ['speaking', 'writing', 'guidedletter']) {
      const i = list.findIndex((e) => tasksOf(e.doc).some((b) => b.type === type));
      if (i < 0) continue;
      const blocks = tasksOf(list[i].doc);
      const at = blocks.findIndex((b) => b.type === type);
      const note = type === 'speaking' ? 'Räägi paarilisega.' : 'Seejärel loe oma tekst paarilisele ette.';
      list[i] = { ...list[i], doc: withBlocks(list[i].doc, blocks.map((b, j) => (j === at ? appendInstruction(b, note) : b))) };
      break;
    }
  }

  // Avasta opens with a warm-up, not straight with a test
  const style = band === 'A2' ? 'basic' : 'advanced';
  list = list.map((e) => {
    const blocks = tasksOf(e.doc);
    if (e.phase !== 'discover' || !blocks.length || OPENING.includes(blocks[0].type)) return e;
    const block = { id: 'enr_warmup', type: 'text', width: 'full', span: 12, tone: 'white', goal: '', data: { heading: 'Häälestus', text: WARM_UP[style](topicOf(e.doc) || 'tunni teema') } };
    const next = withBlocks(e.doc, [block, ...blocks]);
    return fits(next) ? { ...e, doc: next } : e;
  });

  // every sheet ends with a self-check
  list = list.map((e) => {
    if (tasksOf(e.doc).some((b) => CLOSING.includes(b.type))) return e;
    const items = SELF_CHECK[style][e.phase] || SELF_CHECK[style].practice;
    const block = { id: `enr_selfcheck_${e.phase}`, type: 'selfcheck', width: 'full', span: 12, tone: 'sky', goal: '', data: { title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: 'Märgi, mida juba oskad.', items: items.join('\n'), stamp: 'Samm edasi!' } };
    return { ...e, doc: withBlocks(e.doc, [...tasksOf(e.doc), block]) };
  });

  // Kasuta (else the last sheet): a stretch line on the last free task and a real-life task before the self-check
  const found = list.findIndex((e) => e.phase === 'transfer');
  const transferIndex = found >= 0 ? found : list.length - 1;
  if (!has((b) => STRETCH_MARK.test(`${b.data?.title || ''} ${b.data?.instruction || ''}`))) {
    list[transferIndex] = { ...list[transferIndex], doc: mapLast(list[transferIndex].doc, (b) => PRODUCTIVE.includes(b.type), (b) => appendInstruction(b, STRETCH[band])) };
  }
  if (!has((b) => REAL_LIFE_MARK.test(String(b.data?.instruction || '')))) {
    const doc = list[transferIndex].doc;
    const prompts = REAL_LIFE[band](topicOf(doc) || 'tunni teema');
    const block = { id: 'enr_reallife', type: 'planning', width: 'full', span: 12, tone: 'cream', goal: 'g_use', data: { title: 'Päriselus.', instruction: 'Päriselus: tee see enne järgmist tundi.', prompts: prompts.join('\n'), lines: 2 } };
    const next = insertBeforeClosing(doc, block);
    list[transferIndex] = { ...list[transferIndex], doc: fits(next) ? next : mapLast(doc, (b) => CLOSING.includes(b.type), (b) => appendInstruction(b, `Päriselus: ${prompts[0]}`)) };
  }
  return list;
}
