// Word strips (owner 2026-10-30: „иллюстрации должны быть не только в начале листа, а эргономично дополнять рабочие
// листы на протяжении всего урока”): a compact row of 3–5 word pictures (art/words, docs/TEXTBOOK_ART_BIBLE.md §10) goes
// directly before a task that uses those words. Pure and deterministic; applied when a course sheet is built
// (admin/course/registry.js). A strip is not a task: `data.artFor` keeps it out of the gates like the „Vaata pilti” card.
import A2_WORDS from './words/a2.js';
import { rowsOf } from '../../worksheet-studio/engine/layout.js';
import { isFinalShapeTask } from '../../worksheet-studio/didactics/taskCatalogue.js';

export const WORD_STRIP = 'wordstrip';
// a task that uses at least `trigger` of the lesson's words gets a strip; a strip shows min–max words
export const STRIP_WORDS = { trigger: 2, min: 3, max: 5 };
const MAX_STRIPS = 3;
// a strip before task i and the next one before task j: at least 2 tasks stand between them
const TASK_GAP = 2;
export const ALL_WORDS = Object.freeze([...A2_WORDS]);
// the same image under two words (byte for byte, wordStrips.test.js): a sheet shows only one of them, or a strip would
// show one picture twice. Drop a pair when its picture is redrawn.
export const SAME_PICTURE = Object.freeze({ luhike: 'pikk', bussipeatus: 'peatus' });
const pictureOf = (entry) => SAME_PICTURE[entry.id] || entry.id;

// ---------- what the learner reads, and what the learner must find ----------
// keyed text → the text around the keys: [answer], [[sentence]] and {*right|wrong} say nothing to the learner
export const withoutKeys = (value) => String(value || '')
  .replace(/\[\[[^\]]*\]\]/g, ' ')
  .replace(/\[[^\]]*\]/g, ' ')
  .replace(/\{[^}]*\}/g, ' ');

// the tasks whose very job is the meaning or the writing of the words: a picture above them would solve them, so they
// never get a strip and their words count as answers
const MEANING_TASKS = new Set(['match', 'manymatch', 'categorize', 'crossword', 'translation', 'dictation', 'picmatch', 'pictures', 'scenelabel', 'wordsearch', 'letterhunt', 'wordorder', 'clock']);
// never read by the learner on the sheet
const HIDDEN_KEYS = new Set(['teacher', 'explain', 'explanation', 'transcript', 'audio', 'img', 'src', 'alt', 'caption', 'kind', 'mode', 'genre', 'skill', 'stamp', 'lineWidth', 'aspect', 'columns', 'showBank', 'bubble', 'from']);
// answers: the whole value
const ANSWER_KEYS = new Set(['answer', 'answers', 'accept', 'model', 'correct', 'solution', 'bank', 'extra', 'word']);
const OPEN_TASKS = new Set(['speaking', 'writing', 'guidedletter', 'planning', 'examwriting']);

const eachString = (value, visit, key = '') => {
  if (typeof value === 'string') visit(key, value);
  else if (Array.isArray(value)) value.forEach((item) => eachString(item, visit, key));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => { if (!HIDDEN_KEYS.has(k)) eachString(v, visit, k); });
};

// The text a task shows, keys removed. An open task's instruction is its prompt; a closed task's instruction and any
// title are generic („Vali õige vorm”, „Vasta küsimusele”) and do not count. Options are not counted: the right one is an
// answer, and a wrong one is no reason for a picture.
export function visibleText(block) {
  const parts = [];
  eachString(block?.data, (key, value) => {
    if (ANSWER_KEYS.has(key) || key === 'options' || key === 'title' || key === 'titleMore' || key === 'name') return;
    if (key === 'instruction' && !OPEN_TASKS.has(block.type)) return;
    parts.push(withoutKeys(value));
  });
  return parts.join('\n');
}

// Everything the sheet asks the learner to find. A word in here gets no picture anywhere on the sheet.
export function answerText(block) {
  const parts = [];
  const whole = MEANING_TASKS.has(block?.type);
  eachString(block?.data, (key, value) => {
    if (key === 'title' || key === 'titleMore' || key === 'instruction') return;
    if (whole || ANSWER_KEYS.has(key)) { parts.push(value); return; }
    if (key === 'options') { parts.push(...value.split('\n').filter((line) => line.trim().startsWith('*'))); return; }
    for (const match of value.matchAll(/\[\[([^\]]*)\]\]|\[([^\]]*)\]|\{([^}]*)\}/g)) {
      if (match[1] !== undefined || match[2] !== undefined) parts.push(match[1] ?? match[2]);
      else parts.push(...match[3].split('|').filter((option) => option.trim().startsWith('*')));
    }
  });
  return parts.join('\n');
}

// ---------- Estonian word forms ----------
// A closed list of endings on a stem, never a bare prefix: „kohv” must not hit „kohvik”, „raamat” not „raamatukogu”,
// „hobi” not „hobune”, „kilo” not „kilomeeter”.
const NOUN_ENDINGS = ['', 'd', 't', 'de', 'te', 'ga', 's', 'st', 'sse', 'l', 'lt', 'le', 'ks', 'ni', 'na', 'ta', 'sid'];
const VERB_ENDINGS = ['ma', 'mas', 'mast', 'maks', 'mata', 'n', 'd', 'b', 'me', 'te', 'vad', 's', 'sin', 'sid', 'sime', 'site', 'ksin', 'ksid', 'ks', 'nud', 'tud', 'da', 'ta', 'ge', 'gem'];
// the stems a rule cannot find (consonant gradation, irregular verbs); `.word` is a form that takes no ending. An entry
// replaces the rule. A word entry of art/words may bring its own `forms`.
const STEMS = {
  nimi: 'nime', käsi: 'käe .käsi .kätt .käsi .käed', jalg: 'jala .jalg .jalga .jalgu', selg: 'selja .selg .selga', õde: 'õe .õde .õdesid', vend: 'venna .vend .venda .vendi',
  sõber: 'sõbra .sõber .sõpra .sõpru', hind: 'hinna .hind .hinda .hindu', tuba: 'toa .tuba .tuppa .tube .tubade', laps: 'lapse .laps .last .lapsi .laste', kapp: 'kapi .kapp .kappi',
  köök: 'köögi .köök .kööki', pank: 'panga .pank .panka', turg: 'turu .turg .turgu', aeg: 'aja .aeg .aega .aegu', leib: 'leiva .leib .leiba', kurk: 'kurgu .kurk .kurku', kõht: 'kõhu .kõht .kõhtu',
  laud: 'laua .laud .lauda .laudu', supp: 'supi .supp .suppi', kaup: 'kauba .kaup .kaupa', kaart: 'kaardi .kaart .kaarti', pikk: 'pika .pikk .pikka .pikki', lühike: 'lühikese .lühike .lühikest',
  juuksed: 'juukse .juuksed .juukseid', vanem: 'vanema .vanem .vanemat', sport: 'spordi .sport .sporti', kino: 'kino .kinno', apteek: 'apteegi .apteek .apteeki', väljapääs: 'väljapääsu .väljapääs',
  sissepääs: 'sissepääsu .sissepääs', vastuvõtt: 'vastuvõtu .vastuvõtt .vastuvõttu', kellaaeg: 'kellaaja .kellaaeg .kellaaega', sünniaeg: 'sünniaja .sünniaeg .sünniaega', allkiri: 'allkirja .allkiri',
  marsruut: 'marsruudi .marsruut .marsruuti', köögivili: 'köögivilja .köögivili', puuvili: 'puuvilja .puuvili', kontsert: 'kontserdi .kontsert .kontserti', kallis: 'kalli .kallis', riided: 'riiete .riided .riideid',
  jalanõud: 'jalanõu', liiter: 'liitri .liiter', osakond: 'osakonna .osakond .osakonda', elukoht: 'elukoha .elukoht .elukohta', telefoninumber: 'telefoninumbri .telefoninumber',
  // homonyms: only the forms that are this word („sa pead” = you must; „selge” = clear)
  pea: '.pea .peas .peaga',
};
const VERB_STEMS = {
  rääkima: 'räägi rääki .rääkida', õppima: 'õpi õppi .õppida', tulema: 'tule .tuli .tulin .tulid .tulime .tulite', minema: 'mine lähe .läks .läksin .läksid .läksime .läksite', sööma: 'söö .sõi .sõin .süüa',
  ärkama: 'ärka .ärgata .ärkas', puhkama: 'puhka .puhata', kordama: 'korda .korrata .korrake', liikuma: 'liigu liiku .liikuda', maksma: 'maksa .maksma .maksta .maksis .maksin .maksnud .makstud',
  muutma: 'muuda .muutma .muuta .muutis .muutsin .muutnud', täitma: 'täida .täitma .täita .täitis .täitsin .täitnud', mõõtma: 'mõõda .mõõtma .mõõta .mõõtis .mõõtsin .mõõtnud',
  kohtuma: 'kohtu .kohtuda',
};
const fromStems = (spec, endings) => spec.split(' ').flatMap((part) => (part.startsWith('.') ? [part.slice(1)] : endings.map((end) => part + end)));

const isVerb = (word) => word.length >= 5 && word.endsWith('ma');
export function wordForms(entry) {
  const word = String(entry?.word || '').toLocaleLowerCase('et');
  const own = Array.isArray(entry?.forms) ? entry.forms : [];
  let forms;
  if (VERB_STEMS[word]) forms = fromStems(VERB_STEMS[word], VERB_ENDINGS);
  else if (isVerb(word)) forms = fromStems(word.slice(0, -2), VERB_ENDINGS);
  else if (STEMS[word]) forms = fromStems(STEMS[word], NOUN_ENDINGS);
  else if (/.{2}ne$/.test(word)) forms = [word, `${word.slice(0, -2)}st`, `${word.slice(0, -2)}si`, `${word.slice(0, -2)}seid`, ...fromStems(`${word.slice(0, -2)}se`, NOUN_ENDINGS)];
  else if (/.{2}us$/.test(word)) forms = [word, `${word}t`, `${word}i`, `${word}id`, ...fromStems(`${word}e`, NOUN_ENDINGS)];
  else if (/.{2}ik$/.test(word)) forms = [word, `${word}ku`, `${word}ke`, ...fromStems(`${word}u`, NOUN_ENDINGS)];
  else if (/[aeiouõäöü]$/.test(word)) forms = fromStems(word, NOUN_ENDINGS);
  else forms = [word, ...['a', 'e', 'i', 'u'].flatMap((vowel) => fromStems(word + vowel, NOUN_ENDINGS))];
  return new Set([...forms, ...own]);
}

// tokens of a text; a capital inside a sentence is a name („Pikk tänav”, „proua Kala”), not the word
const TOKEN = /\p{L}+(?:-\p{L}+)*/gu;
const isUpper = (char) => char !== char.toLocaleLowerCase('et');
function tokensOf(text, { names = false } = {}) {
  const out = [];
  for (const line of String(text || '').split('\n')) {
    for (const match of line.matchAll(TOKEN)) {
      const before = line.slice(0, match.index).trimEnd();
      const starts = !before || /[.!?:;…„”"—–-]$/.test(before);
      if (!names && isUpper(match[0][0]) && !starts) continue;
      out.push(match[0].toLocaleLowerCase('et'));
    }
  }
  return out;
}

// a homonym counts only when its block also speaks about this meaning („tee” is tea, road and „do!”; „kaart” a map, a
// bank card and a playing card)
const NEEDS_CONTEXT = {
  tee: /\b(kohvi?|joo|joon|jood|joob|tass|tassi|suhkru?|piim|piima)\b/i,
  kaart: /\b(linn|linna|tänav|tänava|marsruut|marsruudi|ristmik|kaardil|kaarti vaata)\b/i,
};

// „8 aastat vana”, „kui vana” is an age, not the old person in the picture; „kuidas läheb” is not going anywhere
const NOT_THIS_WORD = { vana: /(aasta(t|ne)?|kui) vanad?/gi, minema: /kuidas(\s+\p{L}+)*\s+läheb/giu };

const formsCache = new WeakMap();
const formsFor = (entry) => { if (!formsCache.has(entry)) formsCache.set(entry, wordForms(entry)); return formsCache.get(entry); };

// the lesson's words a text uses, in the order of the text
export function wordsInText(text, words) {
  const found = [];
  for (const entry of words) {
    if (NEEDS_CONTEXT[entry.word] && !NEEDS_CONTEXT[entry.word].test(text)) continue;
    const tokens = tokensOf(NOT_THIS_WORD[entry.word] ? String(text).replace(NOT_THIS_WORD[entry.word], ' ') : text);
    const forms = formsFor(entry);
    const at = tokens.findIndex((token) => forms.has(token));
    if (at >= 0) found.push({ entry, at });
  }
  return found.sort((a, b) => a.at - b.at).map((hit) => hit.entry);
}

// ---------- placement ----------
const isReview = (block) => Boolean(block?.data?.review);
const isArt = (block) => Boolean(block?.data?.artId || block?.data?.artFor);
// a hint in front of a task belongs to that task: a strip goes before them, not between
const LEAD_INS = new Set(['notice', 'tip', 'heading', 'phrasebank']);
export const isLeadIn = (block) => LEAD_INS.has(block?.type) && !isReview(block) && !isArt(block);
// the input a comprehension task depends on stays right above it, and so does a plan above its speech or text
const INPUTS = new Set(['reading', 'listening', 'examlisten', 'dialogue']);
const COMPREHENSION = new Set(['choice', 'truefalse', 'match', 'manymatch', 'table', 'gaps']);
const keepsTogether = (before, task) => (INPUTS.has(before?.type) && COMPREHENSION.has(task.type))
  || (before?.type === 'planning' && ['speaking', 'writing', 'guidedletter', 'examwriting', 'rolecards'].includes(task.type));

// where a strip for the task at `index` can stand, or -1
function stripPlace(blocks, index, rowStarts) {
  let at = index;
  while (at > 0 && isLeadIn(blocks[at - 1])) at -= 1;
  // never the first block of the sheet (it opens the situation), inside a row, or under a picture and its card
  if (at === 0 || !rowStarts.has(blocks[at]?.id) || isArt(blocks[at - 1]) || blocks[at - 1]?.type === 'exampart') return -1;
  if (at === index && keepsTogether(blocks[at - 1], blocks[index])) return -1;
  return at;
}

export function stripBlock(entries, lessonId, phase, n) {
  return {
    id: `wordstrip_${lessonId}_${phase}_${n}`,
    type: WORD_STRIP,
    width: 'full',
    span: 12,
    tone: 'white',
    data: {
      artFor: 'words',
      items: entries.map((entry) => ({ id: entry.id, word: entry.word, img: { src: entry.src, width: 800, height: 800, focus: { x: 50, y: 50 } }, alt: entry.alt || entry.word })),
    },
  };
}

// The strips of a teaching sheet: every word once, spread over the whole sheet, nothing that gives an answer away.
export function withWordStrips(doc, lessonId, phase, words = ALL_WORDS) {
  const blocks = doc?.blocks || [];
  if (!blocks.length || doc.meta?.assessment || doc.meta?.diagnostic || blocks.some((block) => block?.type === 'exampart' || block?.type === WORD_STRIP)) return doc;
  const lessonWords = words.filter((entry) => entry.lessonIds?.includes(lessonId));
  if (lessonWords.length < STRIP_WORDS.min) return doc;

  const rowStarts = new Set(rowsOf(blocks).map((row) => row[0]?.id));
  const taskAt = blocks.map((block, index) => (isFinalShapeTask(block) ? index : -1)).filter((index) => index >= 0);
  // a strip is in view of the task above it and of everything below it: a word that the learner must find there gets no picture
  const stillAsked = (order) => answerWords(blocks.slice(order ? taskAt[order - 1] : 0), lessonWords);
  const candidates = taskAt.flatMap((index, order) => {
    if (MEANING_TASKS.has(blocks[index].type)) return [];
    const at = stripPlace(blocks, index, rowStarts);
    if (at < 0) return [];
    const asked = stillAsked(order);
    const usable = lessonWords.filter((entry) => !asked.has(entry.id));
    // what fills a strip of two up to three: the lesson's words in the tasks below it, then elsewhere on the sheet
    const around = [...blocks.slice(index + 1), ...blocks.slice(0, index)].filter(isFinalShapeTask).map(visibleText).join('\n');
    return [{ at, order, words: wordsInText(visibleText(blocks[index]), usable), more: wordsInText(around, usable) }];
  });

  // the sheet is cut into equal zones and each zone gets at most one strip: its task with the most new words
  const zones = taskAt.length >= 6 ? MAX_STRIPS : taskAt.length >= 3 ? 2 : 1;
  const used = new Set();
  const take = (list, count) => {
    const taken = [];
    for (const entry of list) {
      if (taken.length >= count) break;
      if (!used.has(pictureOf(entry))) { used.add(pictureOf(entry)); taken.push(entry); }
    }
    return taken;
  };
  let picks = [];
  for (let zone = 0; zone < zones; zone += 1) {
    const from = Math.floor((zone * taskAt.length) / zones);
    const to = Math.floor(((zone + 1) * taskAt.length) / zones);
    const free = (candidate) => new Set(candidate.words.map(pictureOf).filter((picture) => !used.has(picture))).size;
    const best = candidates
      .filter((candidate) => candidate.order >= from && candidate.order < to && free(candidate) >= STRIP_WORDS.trigger)
      .filter((candidate) => !picks.length || candidate.order - picks[picks.length - 1].order >= TASK_GAP)
      .reduce((top, candidate) => (!top || free(candidate) > free(top) ? candidate : top), null);
    if (best) picks.push({ ...best, entries: take(best.words, STRIP_WORDS.max - 1) });
  }
  // only now a strip of two is filled up, and a strip with room takes its task's last words, so no strip starves a later one
  picks.forEach((pick) => { pick.entries.push(...take(pick.more, STRIP_WORDS.min - pick.entries.length)); });
  picks = picks.filter((pick) => pick.entries.length >= STRIP_WORDS.min);
  picks.forEach((pick) => { pick.entries.push(...take(pick.words, STRIP_WORDS.max - pick.entries.length)); });
  if (!picks.length) return doc;

  const next = [...blocks];
  picks.map((pick, i) => [pick, i + 1]).reverse().forEach(([pick, n]) => next.splice(pick.at, 0, stripBlock(pick.entries, lessonId, phase, n)));
  return { ...doc, blocks: next };
}

function answerWords(blocks, words) {
  const tokens = new Set(tokensOf(blocks.map(answerText).join('\n'), { names: true }));
  return new Set(words.filter((entry) => [...formsFor(entry)].some((form) => tokens.has(form))).map((entry) => entry.id));
}
