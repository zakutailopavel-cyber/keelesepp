// Academic-value gates of the B1 and B2 courses (docs/COURSE_DESIGN_COMMUNICATIVE.md §13, owner 2026-11-02: „каждый лист
// — это урок, он должен быть интересным и полезным”; the textbook must open the exam topics wider than one episode of the
// course's cast). The gates read built sheets (moduleSheets) and work for both courses: `profile` 'b1' | 'b2' sets the
// lengths. Modules not yet rewritten are listed in academicValueBaseline.json (academicValue.test.js runs the gates).
//
// Gates (codes):
//   per lesson (teaching lessons: no assessment, oral or diagnostic sheet)
//     av-goal      the lesson states its goal (canDo)
//     av-voice     ≥ 1 text from a non-cast voice: an input block without cast names, ≥ AV.voiceWords[stage] words
//                  (an infographic — a chart with its source — counts at any length)
//     av-opinion   ≥ 1 speaking question that asks an opinion / comparison and names no cast character
//     av-know      something new to know: a „Kas teadsid?” block (B.know), the topic opener, or a text with its source
//     av-fact      a number presented as fact (a percentage, or a figure with a statistics word) outside a cast scene has
//                  a source line („Allikas: …”) — per block, every lesson including the exam lessons
//   per module
//     av-opener    exactly one topic opener (B.topicOpener) on the Avasta sheet of lesson 1 (lesson 2 if lesson 1 is an
//                  entry test): body B1 200–350 / B2 300–450 words, no cast names, a source line, 3–4 questions, one of
//                  them comparing Estonia with the learner's home country
//     av-retell    3-2-1 / 4-3-2 retelling at most AV.retellMax a module
//     av-record    „record it at home” speaking tasks at most AV.recordMax a module
//     av-kasuta    the module's Kasuta sheets do not all follow voicemail → phone call → letter
//     av-examiner  an examiner-style question set: one speaking block with 6–8 questions, ≥ 2 of them asking an opinion
//                  or a reason, no cast names (B2: with the one-minute talk, „1 minut”)
//     av-article   B2: one cast-free text of 500–600 words (the exam's opinion / problem article)
//   per course
//     av-topics    the topic map (academicTopics.js) has an entry for every module and covers every required topic
//     av-genres    B1: ≥ AV.genreMin popular-science and ≥ AV.genreMin fiction excerpts (tag voice 'popsci' / 'fiction')
import { REQUIRED_TOPICS, TOPIC_MAP, topicName } from './academicTopics.js';

export const AV = Object.freeze({
  // minimum words of a non-cast text by the sheet's level stage
  voiceWords: { 'A2+': 80, 'B1-': 120, B1: 120, 'B1+': 150, 'B2-': 180, B2: 180 },
  opener: { b1: [200, 350], b2: [300, 450] },
  openerQuestions: [3, 4],
  retellMax: 1,
  // share of a module's Kasuta sheets that may follow „voicemail or phone call → letter”
  kasutaChainShare: 0.5,
  recordMax: 2,
  examinerQuestions: [6, 8],
  examinerOpinion: 2,
  article: [500, 600],
  genreMin: 4,
});

export const VOICES = ['article', 'opinion', 'interview', 'expert', 'forum', 'news', 'infographic', 'fiction', 'popsci'];

// ---------- text helpers ----------
const L = '\\p{L}';
const word = (alts) => new RegExp(`(?<!${L})(?:${alts})(?!${L})`, 'iu');
// the course's recurring cast (docs/TEXTBOOK_ART_BIBLE.md §4 and the B1 / B2 storylines) with their case endings;
// a bare sentence-initial „Anna” before a pronoun or object is the verb „anna” (give), not the character
const CASE = '(?:t|le|ga|l|lt|s|st|sse|ni|na|ks|ta)?';
const CAST_RE = new RegExp(`(?<!${L})(?:(?:Sofia|Kadri|Helgi|Mia|Muki|Anna)${CASE}|(?:Jaan|Liis|Viktor|Oskar)i?${CASE}|Markus(?:e${CASE})?|Tuul(?:e)? Logistika${L}*|Kase kool${L}*)(?!${L})`, 'gu');
const ANNA_VERB = /^(?:mulle|talle|meile|neile|teile|andeks|teada|nõu|abi|oma|see|üks|mõni|palun|edasi|vastus|märku|endast|kõik)$/iu;
export function castNames(text) {
  const s = String(text || '');
  const out = [];
  for (const m of s.matchAll(CAST_RE)) {
    if (m[0] === 'Anna') {
      const next = s.slice(m.index + 4).trim().split(/\s+/)[0]?.replace(/[^\p{L}]/gu, '') || '';
      if (ANNA_VERB.test(next)) continue;
    }
    out.push(m[0]);
  }
  return out;
}
export const hasCast = (text) => castNames(text).length > 0;

const SKIP_KEYS = new Set(['teacher', 'explain', 'audio', 'img', 'from', 'aspect', 'mode', 'scale', 'skill', 'columns', 'lineWidth', 'showBank', 'bankLines', 'opener', 'know', 'artFor', 'artId', 'generic']);
// every string the learner sees in a block (a listening transcript included: it is what the learner hears)
export function studentText(b) {
  const out = [];
  const walk = (v, key) => {
    if (SKIP_KEYS.has(key)) return;
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach((x) => walk(x, ''));
    else if (v && typeof v === 'object') Object.entries(v).forEach(([k, x]) => walk(x, k));
  };
  walk(b?.data || {}, '');
  return out.join('\n');
}

// a source line: „Allikas: …” / „Allikad: …” / „Andmed: …”, or a chart's own source field
const SOURCE_RE = word('allikas|allikad|andmed|põhineb');
const sourceLine = (s) => new RegExp(`${SOURCE_RE.source}\\s*:`, 'iu').test(String(s || ''));
export const hasSource = (b) => Boolean(String(b?.data?.source || '').trim()) || sourceLine(studentText(b));

const clean = (s) => String(s || '')
  .replace(/\{\*?([^|}]*)[^}]*\}/g, '$1') // cloze options → the first option
  .replace(/\(([^)]*)\)/g, ' ') // formtext base forms
  .replace(/\[\[|\]\]|[[\]{}*_=]/g, '');
const paragraphs = (s) => String(s || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const dropSource = (s) => paragraphs(s).filter((p) => !new RegExp(`^\\W*${SOURCE_RE.source}\\s*:`, 'iu').test(p)).join('\n\n');
export const words = (s) => clean(s).split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;

const INPUT = ['reading', 'cloze', 'formtext', 'insertion', 'listening', 'examlisten', 'text', 'tip', 'profiles', 'adsmatch', 'dialogue', 'chart'];
// the text a block offers to read or hear (not its questions)
export function mainText(b) {
  const d = b?.data || {};
  switch (b?.type) {
    case 'reading': case 'cloze': case 'formtext': case 'insertion': return dropSource(d.passage);
    case 'listening': case 'examlisten': return String(d.transcript || '');
    case 'text': case 'tip': return dropSource(d.text);
    case 'profiles': return (d.people || []).map((p) => [p.name, p.facts, p.sentences].join('\n')).join('\n');
    case 'adsmatch': return (d.ads || []).map((a) => [a.title, a.text].join('\n')).join('\n');
    case 'dialogue': return (d.lines || []).map((l) => l.text).join('\n');
    case 'chart': return String(d.rows || '');
    default: return '';
  }
}

const OPINION = word('arvad|arvate|arvan|arvamus\\p{L}*|arvates|meelest|nõus|poolt|vastu|võrdle\\p{L}*|eelis\\p{L}*|puudus\\p{L}*|plussid|miinused|peaks|peaksid|tuleks|põhjenda\\p{L}*|kumb|kodumaa\\p{L}*|riigis|ühiskon\\p{L}*|arutle\\p{L}*|argument\\p{L}*|miks|hea või halb|parem või');
const HOME = word('kodumaa\\p{L}*|sinu riigis|teie riigis|sinu maal|teie maal|seal, kus sa|päritolumaa\\p{L}*|sinu kodu(?:linnas|riigis)');
const SPEAKING = ['speaking', 'speakcard', 'rolecards'];
const sentences = (s) => String(s || '').split(/\n|(?<=[?.!])\s+/).map((x) => x.trim()).filter(Boolean);
const PERCENT = /\d(?:[\d\s.,]*\d)?\s?(?:%|protsen\p{L}*)/u;
const STATWORD = word('statisti\\p{L}*|uuring\\p{L}*|küsitlus\\p{L}*|andmetel|keskmiselt|rahvaloendus\\p{L}*|prognoos\\p{L}*');
const NUMBER = /\d|miljon|tuhat|saja|sada|kolmandik|neljandik|veerand|pool(?:ed|t|test)?(?!\p{L})|iga (?:teine|kolma|neljas|viies|kümnes)|enamik|kaks korda/iu;
// not a statistic: the learner's own score and exam thresholds, prices and discounts in an ad
const NOT_FACT = word('eesmärk\\p{L}*|lävend\\p{L}*|punkt\\p{L}*|osa|osas|testi\\p{L}*|eksam\\p{L}*|hinne|allahindl\\p{L}*|soodus\\p{L}*');
// a number presented as fact: a sentence with a percentage, or with a statistics word and a number
export const statSentences = (s) => sentences(s).filter((x) => !x.endsWith('?') && !NOT_FACT.test(x) && !/[−–-]\s?\d+\s?%/u.test(x) && (PERCENT.test(x) || (STATWORD.test(x) && NUMBER.test(x))));
export const hasStatistic = (s) => statSentences(s).length > 0;
const RETELL = /(?:4\s*[-–]\s*3\s*[-–]\s*2|3\s*[-–]\s*2\s*[-–]\s*1|3, 2 ja 1|kolm korda.{0,80}(?:uuele|järjest|lühema|kuulaja|paarilis|minut)|kolmele (?:kuulajale|paarilisele|inimesele))/iu;
const RECORD = word('salvesta\\p{L}*|lindista\\p{L}*');
const ONE_MINUTE = /(?:1|üks|ühe)[\s-]*minut|üheminuti/iu;
const askedText = (b) => [b.data?.title, b.data?.instruction].filter(Boolean).join('\n');

const blocksOf = (doc) => (doc?.blocks || []).filter((b) => !b.data?.artFor && !b.data?.artId);
export const isTeachingLesson = (phases) => !Object.values(phases || {}).some((d) => d?.meta?.assessment || d?.meta?.oral || d?.meta?.diagnostic);
const stageOf = (doc) => String(doc?.meta?.level || 'B1');
const voiceMin = (doc) => AV.voiceWords[stageOf(doc)] ?? 120;

// a text from a non-cast voice: an input block whose text is long enough and names no cast character
export function isVoiceText(b, doc) {
  if (!INPUT.includes(b.type) || b.data?.review || b.data?.opener) return false;
  if (hasCast(studentText(b))) return false;
  if (b.type === 'chart') return hasSource(b);
  return words(mainText(b)) >= voiceMin(doc);
}
// a speaking question wider than the episode: an opinion / comparison cue, no cast name
export const opinionQuestions = (b) => (SPEAKING.includes(b.type) ? sentences(studentText(b)).filter((s) => OPINION.test(s) && !hasCast(s)) : []);
const isKnow = (b) => Boolean(b.data?.know || b.data?.opener) || (INPUT.includes(b.type) && !hasCast(studentText(b)) && hasSource(b));

// ---------- per lesson ----------
export function lessonAcademicProblems(lessonId, phases) {
  const out = [];
  const docs = Object.entries(phases || {});
  const add = (phase, code, text) => out.push({ lessonId, phase, code, text });
  // facts are real: every lesson, exam lessons included
  for (const [phase, doc] of docs) {
    for (const b of blocksOf(doc)) {
      if (!INPUT.includes(b.type) || b.type === 'adsmatch') continue;
      const s = studentText(b);
      if (hasStatistic(s) && !hasCast(s) && !hasSource(b)) add(phase, 'av-fact', `${b.id}: arv või protsent esitatud faktina, aga allikat pole („Allikas: …”)`);
    }
  }
  if (!isTeachingLesson(phases)) return out;
  const all = docs.flatMap(([phase, doc]) => blocksOf(doc).map((b) => ({ b, doc, phase })));
  if (!docs.some(([, doc]) => String(doc?.meta?.canDo || '').trim())) add('*', 'av-goal', 'tunnil pole sõnastatud eesmärki (canDo)');
  if (!all.some(({ b, doc }) => isVoiceText(b, doc))) {
    const min = voiceMin(docs[0]?.[1]);
    add('*', 'av-voice', `tunnis pole ühtki teksti väljastpoolt tegelaste lugu (artikkel, intervjuu, ekspert, foorum, uudis, infograafik, ilukirjandus, populaarteadus; ≥ ${min} sõna, tegelaste nimedeta)`);
  }
  if (!all.some(({ b }) => opinionQuestions(b).length)) add('*', 'av-opinion', 'tunnis pole arvamus- ega aruteluülesannet laiemal teemal (küsimus ilma tegelaste nimedeta: Mis sa arvad…? Kas Eestis / sinu kodumaal…?)');
  if (!all.some(({ b }) => isKnow(b))) add('*', 'av-know', 'tunnis pole uut teadmist (B.know „Kas teadsid?”, teema avaleht või allikaga tekst)');
  return out;
}

// ---------- per module ----------
// sheets: { [lessonId]: { discover?, practice?, transfer? } }; profile: 'b1' | 'b2'
export function moduleAcademicProblems(sheets, { profile = 'b1' } = {}) {
  const out = [];
  const ids = Object.keys(sheets || {});
  const add = (code, text, lessonId = '*', phase = '*') => out.push({ lessonId, phase, code, text });
  ids.forEach((id) => out.push(...lessonAcademicProblems(id, sheets[id])));
  const entries = ids.flatMap((id) => Object.entries(sheets[id]).flatMap(([phase, doc]) => blocksOf(doc).map((b) => ({ id, phase, doc, b }))));

  // the topic opener
  const openers = entries.filter(({ b }) => b.data?.opener);
  const firstTeaching = ids.slice(0, 2);
  if (!openers.length) add('av-opener', 'moodulil pole teema avalehte (B.topicOpener: fakte maailmast allikaga + „Mõtle kaasa” küsimused)');
  if (openers.length > 1) add('av-opener', `moodulis on ${openers.length} teema avalehte (üks moodulis)`);
  for (const { id, phase, b } of openers.slice(0, 1)) {
    const [min, max] = AV.opener[profile] || AV.opener.b1;
    const paras = paragraphs(b.data.text);
    const end = paras.findIndex((p) => sourceLine(p) || /^\W*Mõtle kaasa/iu.test(p));
    const body = (end < 0 ? paras : paras.slice(0, end)).join('\n\n');
    const n = words(body);
    const qs = (b.data.opener.questions || []).filter((q) => String(q).trim().endsWith('?'));
    const problems = [];
    if (!(firstTeaching.includes(id) && phase === 'discover')) problems.push('peab olema 1. tunni (sisenemistesti korral 2. tunni) Avasta lehel');
    if (n < min || n > max) problems.push(`${n} sõna (${profile.toUpperCase()}: ${min}–${max})`);
    if (hasCast(studentText(b))) problems.push(`tegelased tekstis (${[...new Set(castNames(studentText(b)))].join(', ')})`);
    if (!String(b.data.opener.source || '').trim() || !sourceLine(b.data.text)) problems.push('allikarida puudub');
    if (qs.length < AV.openerQuestions[0] || qs.length > AV.openerQuestions[1]) problems.push(`${qs.length} „Mõtle kaasa” küsimust (${AV.openerQuestions.join('–')})`);
    if (!qs.some((q) => HOME.test(q))) problems.push('ükski küsimus ei võrdle Eestit õppija kodumaaga');
    if (problems.length) add('av-opener', `teema avaleht ${b.id}: ${problems.join('; ')}`, id, phase);
  }

  // variety caps
  const retell = entries.filter(({ b }) => SPEAKING.includes(b.type) && RETELL.test(askedText(b)));
  if (retell.length > AV.retellMax) add('av-retell', `3-2-1 / 4-3-2 ümberjutustus ${retell.length} korda (${retell.map(({ b }) => b.id).join(', ')}; kuni ${AV.retellMax} moodulis)`);
  const record = entries.filter(({ b }) => SPEAKING.includes(b.type) && RECORD.test(askedText(b)));
  if (record.length > AV.recordMax) add('av-record', `„salvesta kodus” ${record.length} korda (${record.map(({ b }) => b.id).join(', ')}; kuni ${AV.recordMax} moodulis)`);
  const kasuta = ids.filter((id) => isTeachingLesson(sheets[id]) && sheets[id].transfer).map((id) => sheets[id].transfer);
  const chain = (doc) => {
    const bs = blocksOf(doc);
    const voicemail = bs.some((b) => /häälsõnum/iu.test(studentText(b)));
    const call = bs.some((b) => (b.type === 'speakcard' && b.data?.mode === 'phone') || (['rolecards', 'speaking', 'dialogue', 'speakcard'].includes(b.type) && /helista|telefon/iu.test(studentText(b))));
    const letter = bs.some((b) => ['guidedletter', 'examwriting'].includes(b.type) || (b.type === 'writing' && /kiri|kirja|sõnum/iu.test(studentText(b))));
    return (voicemail || call) && letter;
  };
  const chained = kasuta.filter(chain).length;
  if (kasuta.length >= 2 && chained > Math.floor(kasuta.length * AV.kasutaChainShare)) add('av-kasuta', `${chained}/${kasuta.length} Kasuta lehte on sama mustriga: häälsõnum või telefonikõne → kiri (kuni pooled)`);

  // speaking breadth: the examiner's question set
  const [qMin, qMax] = AV.examinerQuestions;
  const examiner = entries.filter(({ b }) => {
    if (b.type !== 'speaking') return false;
    const qs = sentences(b.data?.questions).filter((q) => q.endsWith('?'));
    if (qs.length < qMin || qs.length > qMax || hasCast(studentText(b))) return false;
    // an examiner asks for reasons and opinions too, not only facts about the learner's day
    if (qs.filter((q) => OPINION.test(q)).length < AV.examinerOpinion) return false;
    return profile !== 'b2' || ONE_MINUTE.test(askedText(b));
  });
  if (!examiner.length) add('av-examiner', profile === 'b2' ? `moodulis pole eksamineerija küsimusteringi (1-minutiline kõne + ${qMin}–${qMax} arutelu küsimust mooduli teemal, tegelasteta)` : `moodulis pole eksamineerija küsimusteringi (${qMin}–${qMax} küsimust mooduli teemal, tegelasteta)`);

  // B2: the exam's main reading — an opinion / problem article
  if (profile === 'b2') {
    const [aMin, aMax] = AV.article;
    const art = entries.filter(({ b }) => ['reading', 'insertion', 'cloze', 'formtext'].includes(b.type) && !hasCast(studentText(b)) && words(mainText(b)) >= aMin && words(mainText(b)) <= aMax);
    if (!art.length) add('av-article', `moodulis pole ${aMin}–${aMax}-sõnalist arvamus- või probleemartiklit (tegelasteta)`);
  }
  return out;
}

// ---------- per course ----------
// modules: [{ MODULE, LESSONS }] of one course (no supplements); sheetsOf: moduleSheets
export function topicMapProblems(course, moduleIds, map = TOPIC_MAP[course] || {}, required = REQUIRED_TOPICS[course] || []) {
  const out = [];
  const add = (text) => out.push({ lessonId: '*', phase: '*', code: 'av-topics', text });
  moduleIds.filter((id) => !map[id]?.main).forEach((id) => add(`${id}: teemakaardil pole põhiteemat (academicTopics.js)`));
  const covered = new Set(Object.values(map).flatMap((e) => [e.main, ...(e.secondary || [])]));
  const missing = required.filter((t) => !covered.has(t));
  if (missing.length) add(`teemad, mis pole ühegi mooduli põhi- ega kõrvalteema: ${missing.map(topicName).join(', ')}`);
  return out;
}
export function courseAcademicProblems(course, modules, sheetsOf) {
  const out = topicMapProblems(course, modules.map((mod) => mod.MODULE.id));
  if (course === 'b1') {
    const tagged = modules.flatMap((mod) => Object.values(sheetsOf(mod)).flatMap((phases) => Object.values(phases).flatMap((doc) => blocksOf(doc).filter((b) => isVoiceText(b, doc)).map((b) => b.tag?.voice))));
    for (const genre of ['popsci', 'fiction']) {
      const n = tagged.filter((v) => v === genre).length;
      if (n < AV.genreMin) out.push({ lessonId: '*', phase: '*', code: 'av-genres', text: `kursuses ${n} × ${genre === 'popsci' ? 'populaarteaduslik tekst' : 'ilukirjanduse katkend'} (tag voice '${genre}'; vähemalt ${AV.genreMin})` });
    }
  }
  return out;
}

export const academicKey = (p) => [p.lessonId, p.phase, p.code].join('|');
