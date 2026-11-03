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
//
// English sheets (meta.language 'en', the English B2 course `enb2`, docs/COURSE_FINAL_SHAPE_EN_B2.md §8): the same gates
// with English words (LEXICON.en) — the English cast (Kaisa, Markus, Ellie …), „Source:”, „Did you know?”, „Think about it”,
// English opinion and comparison cues, „your home country” (at most twice a module; „where you live”, „another country you
// know well” instead). The language comes from each sheet's meta.language; an Estonian sheet is checked exactly as before.
// profile 'enb2': opener B1+ 250–350 / B2- and B2 300–450 words, article 450–600 words, the examiner's set is the state
// exam's monologue (a talk of at least 1 min 45 s + the examiner's questions).
import { REQUIRED_TOPICS, TOPIC_MAP, topicName } from './academicTopics.js';

export const AV = Object.freeze({
  // minimum words of a non-cast text by the sheet's level stage
  voiceWords: { 'A2+': 80, 'B1-': 120, B1: 120, 'B1+': 150, 'B2-': 180, B2: 180 },
  opener: { b1: [200, 350], b2: [300, 450], enb2: [300, 450] },
  // English B2 by the module's stage (docs/COURSE_FINAL_SHAPE_EN_B2.md §8)
  openerEnStage: { 'B1+': [250, 350], 'B2-': [300, 450], B2: [300, 450] },
  openerQuestions: [3, 4],
  retellMax: 1,
  // share of a module's Kasuta sheets that may follow „voicemail or phone call → letter”
  kasutaChainShare: 0.5,
  recordMax: 2,
  examinerQuestions: [6, 8],
  examinerOpinion: 2,
  article: [500, 600],
  articleEn: [450, 600],
  genreMin: 4,
});

export const VOICES = ['article', 'opinion', 'interview', 'expert', 'forum', 'news', 'infographic', 'fiction', 'popsci'];

// ---------- text helpers ----------
const L = '\\p{L}';
const word = (alts) => new RegExp(`(?<!${L})(?:${alts})(?!${L})`, 'iu');
// the course's recurring cast (docs/TEXTBOOK_ART_BIBLE.md §4 and the B1 / B2 storylines) with their case endings;
// a bare sentence-initial „Anna” before a pronoun or object is the verb „anna” (give), not the character
const CASE = '(?:t|le|ga|l|lt|s|st|sse|ni|na|ks|ta)?';
// the English courses' recurring cast (en/a2, en/b1 by frequency; docs/COURSE_FINAL_SHAPE_EN_B2.md §8), with „'s”
export const EN_CAST = ['Kaisa', 'Markus', 'Ellie', 'Mia', 'Tom', 'Karl', 'Liis', 'Daniel', 'Sara', 'Sam', 'Robin', 'Priya', 'Oskar', 'Kerli', 'Grace', 'Ruby', 'Anna'];
const CAST_EN_RE = new RegExp(`(?<!${L})(?:${EN_CAST.join('|')})(?:['’]s)?(?!${L})`, 'gu');
const CAST_RE = new RegExp(`(?<!${L})(?:(?:Sofia|Kadri|Helgi|Mia|Muki|Anna)${CASE}|(?:Jaan|Liis|Viktor|Oskar)i?${CASE}|Markus(?:e${CASE})?|Tuul(?:e)? Logistika${L}*|Kase kool${L}*)(?!${L})`, 'gu');
const ANNA_VERB = /^(?:mulle|talle|meile|neile|teile|andeks|teada|nõu|abi|oma|see|üks|mõni|palun|edasi|vastus|märku|endast|kõik)$/iu;
export function castNames(text, lang = 'et') {
  const s = String(text || '');
  if (lang === 'en') return [...s.matchAll(CAST_EN_RE)].map((m) => m[0].replace(/['’]s$/u, ''));
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
export const hasCast = (text, lang = 'et') => castNames(text, lang).length > 0;

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
const SOURCE_EN_RE = word('source|sources|data|based on');
const sourceRe = (lang) => (lang === 'en' ? SOURCE_EN_RE : SOURCE_RE);
const sourceLine = (s, lang = 'et') => new RegExp(`${sourceRe(lang).source}\\s*:`, 'iu').test(String(s || ''));
export const hasSource = (b, lang = 'et') => Boolean(String(b?.data?.source || '').trim()) || sourceLine(studentText(b), lang);

const clean = (s) => String(s || '')
  .replace(/\{\*?([^|}]*)[^}]*\}/g, '$1') // cloze options → the first option
  .replace(/\(([^)]*)\)/g, ' ') // formtext base forms
  .replace(/\[\[|\]\]|[[\]{}*_=]/g, '');
const paragraphs = (s) => String(s || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const dropSource = (s, lang = 'et') => paragraphs(s).filter((p) => !new RegExp(`^\\W*${sourceRe(lang).source}\\s*:`, 'iu').test(p)).join('\n\n');
export const words = (s) => clean(s).split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;

const INPUT = ['reading', 'cloze', 'formtext', 'insertion', 'listening', 'examlisten', 'text', 'tip', 'profiles', 'adsmatch', 'dialogue', 'chart'];
// the text a block offers to read or hear (not its questions)
export function mainText(b, lang = 'et') {
  const d = b?.data || {};
  switch (b?.type) {
    case 'reading': case 'cloze': case 'formtext': case 'insertion': return dropSource(d.passage, lang);
    case 'listening': case 'examlisten': return String(d.transcript || '');
    case 'text': case 'tip': return dropSource(d.text, lang);
    case 'profiles': return (d.people || []).map((p) => [p.name, p.facts, p.sentences].join('\n')).join('\n');
    case 'adsmatch': return (d.ads || []).map((a) => [a.title, a.text].join('\n')).join('\n');
    case 'dialogue': return (d.lines || []).map((l) => l.text).join('\n');
    case 'chart': return String(d.rows || '');
    default: return '';
  }
}

const OPINION = word('arvad|arvate|arvan|arvamus\\p{L}*|arvates|meelest|nõus|poolt|vastu|võrdle\\p{L}*|eelis\\p{L}*|puudus\\p{L}*|plussid|miinused|peaks|peaksid|tuleks|põhjenda\\p{L}*|kumb|kodumaa\\p{L}*|riigis|ühiskon\\p{L}*|arutle\\p{L}*|argument\\p{L}*|miks|hea või halb|parem või');
// round 2 (av-homecountry) asks for wordings that fit a learner born in Estonia too: „mõnes teises riigis”, „riigis, mida
// sa hästi tead”, „mujal maailmas”, „sinu kodukohas”
const HOME = word('kodumaa\\p{L}*|sinu riigis|teie riigis|sinu maal|teie maal|seal, kus sa|päritolumaa\\p{L}*|sinu kodu(?:linnas|riigis|kohas)|(?:mõnes |ühes )?teises riigis|teistes riikides|riigis, mida (?:sa|te) (?:hästi )?(?:tead|teate|tunned|tunnete)|mujal maailmas');
const SPEAKING = ['speaking', 'speakcard', 'rolecards'];
const sentences = (s) => String(s || '').split(/\n|(?<=[?.!])\s+/).map((x) => x.trim()).filter(Boolean);
const PERCENT = /\d(?:[\d\s.,]*\d)?\s?(?:%|protsen\p{L}*)/u;
const STATWORD = word('statisti\\p{L}*|uuring\\p{L}*|küsitlus\\p{L}*|andmetel|keskmiselt|rahvaloendus\\p{L}*|prognoos\\p{L}*');
const NUMBER = /\d|miljon|tuhat|saja|sada|kolmandik|neljandik|veerand|pool(?:ed|t|test)?(?!\p{L})|iga (?:teine|kolma|neljas|viies|kümnes)|enamik|kaks korda/iu;
// not a statistic: the learner's own score and exam thresholds, prices and discounts in an ad
const NOT_FACT = word('eesmärk\\p{L}*|lävend\\p{L}*|punkt\\p{L}*|osa|osas|testi\\p{L}*|eksam\\p{L}*|hinne|allahindl\\p{L}*|soodus\\p{L}*');
// a number presented as fact: a sentence with a percentage, or with a statistics word and a number
export const statSentences = (s, lang = 'et') => { const x0 = lex(lang); return sentences(s).filter((x) => !x.endsWith('?') && !x0.notFact.test(x) && !/[−–-]\s?\d+\s?%/u.test(x) && (x0.percent.test(x) || (x0.statword.test(x) && x0.number.test(x)))); };
export const hasStatistic = (s, lang = 'et') => statSentences(s, lang).length > 0;
const RETELL = /(?:4\s*[-–]\s*3\s*[-–]\s*2|3\s*[-–]\s*2\s*[-–]\s*1|3, 2 ja 1|kolm korda.{0,80}(?:uuele|järjest|lühema|kuulaja|paarilis|minut)|kolmele (?:kuulajale|paarilisele|inimesele))/iu;
const RECORD = word('salvesta\\p{L}*|lindista\\p{L}*');
const ONE_MINUTE = /(?:1|üks|ühe)[\s-]*minut|üheminuti/iu;
const askedText = (b) => [b.data?.title, b.data?.instruction].filter(Boolean).join('\n');

// ---------- English (docs/COURSE_FINAL_SHAPE_EN_B2.md §8) ----------
const OPINION_EN = word("think|thinks|opinion\\p{L}*|agree\\p{L}*|disagree\\p{L}*|for or against|compare\\p{L}*|comparison|advantage\\p{L}*|disadvantage\\p{L}*|pros|cons|should|ought to|better|worse|why|believe|society|argue|argument\\p{L}*|reason\\p{L}*|in your view|would you rather|worth it|good or bad|in Estonia|where you live");
// „your home country” is allowed at most twice a module; the wordings that fit a learner born in Estonia count as the
// comparison question too
const HOME_EN = word("home country|homeland|native country|your country|where you live|where you grew up|in your town|another country(?: (?:that )?you know(?: well)?)?|other countries|elsewhere in the world|in other parts of the world");
const PERCENT_EN = /\d(?:[\d\s.,]*\d)?\s?(?:%|per ?cent)/iu;
const STATWORD_EN = word('statistic\\p{L}*|survey\\p{L}*|study|studies|research\\p{L}*|according to|on average|census|forecast\\p{L}*');
const NUMBER_EN = /\d|million|billion|thousand|hundred|a third|a quarter|(?<!\p{L})half(?!\p{L})|majority|twice|every (?:second|third|fourth|fifth|tenth)/iu;
const NOT_FACT_EN = word('target\\p{L}*|goal\\p{L}*|points?|part|test\\p{L}*|exam\\p{L}*|marks?|score\\p{L}*|discount\\p{L}*|sale');
const RETELL_EN = /(?:4\s*[-–]\s*3\s*[-–]\s*2|3\s*[-–]\s*2\s*[-–]\s*1|three times.{0,80}(?:new|partner|shorter|listener|minute)|to three (?:listeners|partners|people))/iu;
const RECORD_EN = /(?<!\p{L})record(?:ing)? (?:yourself|your|it|a voice|an audio|at home)|(?<!\p{L})voice recording/iu;
// the state exam's monologue: at least 1 min 45 s (or a one- / two-minute talk)
const TALK_TIME_EN = /1\s*min(?:ute)?s?\s*(?:and\s*)?45|105\s*s(?:ec)?|(?:one|two|1|2)[\s-]*minutes?/iu;
export const LEXICON = {
  et: {
    opinion: OPINION, home: HOME, percent: PERCENT, statword: STATWORD, number: NUMBER, notFact: NOT_FACT, retell: RETELL, record: RECORD,
    talkTime: ONE_MINUTE, think: /^\W*Mõtle kaasa/iu, factBox: /Kas teadsid/iu, voicemail: /häälsõnum/iu, call: /helista|telefon/iu,
    letter: /kiri|kirja|sõnum/iu, homeCount: /kodumaa\p{L}*/giu,
  },
  en: {
    opinion: OPINION_EN, home: HOME_EN, percent: PERCENT_EN, statword: STATWORD_EN, number: NUMBER_EN, notFact: NOT_FACT_EN, retell: RETELL_EN, record: RECORD_EN,
    talkTime: TALK_TIME_EN, think: /^\W*Think about it/iu, factBox: /Did you know/iu, voicemail: /voicemail|voice message/iu, call: /(?<![\p{L}-])(?:phone|call)/iu,
    letter: /letter|e-?mail|message/iu, homeCount: /home country|homeland|native country/giu,
  },
};
const lex = (lang) => LEXICON[lang] || LEXICON.et;
// the language of a sheet, a lesson ({ phase: doc }) or a module ({ lessonId: { phase: doc } })
export const sheetLang = (doc) => (doc?.meta?.language === 'en' ? 'en' : 'et');
const lessonLang = (phases) => (Object.values(phases || {}).some((d) => sheetLang(d) === 'en') ? 'en' : 'et');
const moduleLang = (sheets) => (Object.values(sheets || {}).some((phases) => lessonLang(phases) === 'en') ? 'en' : 'et');

const blocksOf = (doc) => (doc?.blocks || []).filter((b) => !b.data?.artFor && !b.data?.artId);
export const isTeachingLesson = (phases) => !Object.values(phases || {}).some((d) => d?.meta?.assessment || d?.meta?.oral || d?.meta?.diagnostic);
// „English B1+” → „B1+” (the English course's stages use the same norms)
const stageOf = (doc) => String(doc?.meta?.level || 'B1').replace(/^English\s+/i, '');
const voiceMin = (doc) => AV.voiceWords[stageOf(doc)] ?? 120;

// a text from a non-cast voice: an input block whose text is long enough and names no cast character
export function isVoiceText(b, doc) {
  const lang = sheetLang(doc);
  if (!INPUT.includes(b.type) || b.data?.review || b.data?.opener) return false;
  if (hasCast(studentText(b), lang)) return false;
  if (b.type === 'chart') return hasSource(b, lang);
  return words(mainText(b, lang)) >= voiceMin(doc);
}
// a speaking question wider than the episode: an opinion / comparison cue, no cast name
export const opinionQuestions = (b, lang = 'et') => (SPEAKING.includes(b.type) ? sentences(studentText(b)).filter((s) => lex(lang).opinion.test(s) && !hasCast(s, lang)) : []);
const isKnow = (b, lang = 'et') => Boolean(b.data?.know || b.data?.opener) || (INPUT.includes(b.type) && !hasCast(studentText(b), lang) && hasSource(b, lang));

// ---------- per lesson ----------
export function lessonAcademicProblems(lessonId, phases) {
  const out = [];
  const docs = Object.entries(phases || {});
  const add = (phase, code, text) => out.push({ lessonId, phase, code, text });
  const lang = lessonLang(phases);
  // facts are real: every lesson, exam lessons included
  for (const [phase, doc] of docs) {
    for (const b of blocksOf(doc)) {
      if (!INPUT.includes(b.type) || b.type === 'adsmatch') continue;
      const s = studentText(b);
      if (hasStatistic(s, lang) && !hasCast(s, lang) && !hasSource(b, lang)) add(phase, 'av-fact', `${b.id}: arv või protsent esitatud faktina, aga allikat pole („${lang === 'en' ? 'Source' : 'Allikas'}: …”)`);
    }
  }
  if (!isTeachingLesson(phases)) return out;
  const all = docs.flatMap(([phase, doc]) => blocksOf(doc).map((b) => ({ b, doc, phase })));
  if (!docs.some(([, doc]) => String(doc?.meta?.canDo || '').trim())) add('*', 'av-goal', 'tunnil pole sõnastatud eesmärki (canDo)');
  if (!all.some(({ b, doc }) => isVoiceText(b, doc))) {
    const min = voiceMin(docs[0]?.[1]);
    add('*', 'av-voice', `tunnis pole ühtki teksti väljastpoolt tegelaste lugu (artikkel, intervjuu, ekspert, foorum, uudis, infograafik, ilukirjandus, populaarteadus; ≥ ${min} sõna, tegelaste nimedeta)`);
  }
  if (!all.some(({ b }) => opinionQuestions(b, lang).length)) add('*', 'av-opinion', 'tunnis pole arvamus- ega aruteluülesannet laiemal teemal (küsimus ilma tegelaste nimedeta: Mis sa arvad…? Kas Eestis / sinu kodumaal…?)');
  if (!all.some(({ b }) => isKnow(b, lang))) add('*', 'av-know', 'tunnis pole uut teadmist (B.know „Kas teadsid?”, teema avaleht või allikaga tekst)');
  return out;
}

// ---------- per module ----------
// sheets: { [lessonId]: { discover?, practice?, transfer? } }; profile: 'b1' | 'b2'
export function moduleAcademicProblems(sheets, { profile = 'b1' } = {}) {
  const out = [];
  const lang = moduleLang(sheets);
  const x = lex(lang);
  const ids = Object.keys(sheets || {});
  const add = (code, text, lessonId = '*', phase = '*') => out.push({ lessonId, phase, code, text });
  ids.forEach((id) => out.push(...lessonAcademicProblems(id, sheets[id])));
  const entries = ids.flatMap((id) => Object.entries(sheets[id]).flatMap(([phase, doc]) => blocksOf(doc).map((b) => ({ id, phase, doc, b }))));

  // the topic opener
  const openers = entries.filter(({ b }) => b.data?.opener);
  const firstTeaching = ids.slice(0, 2);
  if (!openers.length) add('av-opener', 'moodulil pole teema avalehte (B.topicOpener: fakte maailmast allikaga + „Mõtle kaasa” küsimused)');
  if (openers.length > 1) add('av-opener', `moodulis on ${openers.length} teema avalehte (üks moodulis)`);
  for (const { id, phase, doc, b } of openers.slice(0, 1)) {
    const [min, max] = (profile === 'enb2' && AV.openerEnStage[stageOf(doc)]) || AV.opener[profile] || AV.opener.b1;
    const paras = paragraphs(b.data.text);
    const end = paras.findIndex((p) => sourceLine(p, lang) || x.think.test(p));
    const body = (end < 0 ? paras : paras.slice(0, end)).join('\n\n');
    const n = words(body);
    const qs = (b.data.opener.questions || []).filter((q) => String(q).trim().endsWith('?'));
    const problems = [];
    if (!(firstTeaching.includes(id) && phase === 'discover')) problems.push('peab olema 1. tunni (sisenemistesti korral 2. tunni) Avasta lehel');
    if (n < min || n > max) problems.push(`${n} sõna (${profile.toUpperCase()}: ${min}–${max})`);
    if (hasCast(studentText(b), lang)) problems.push(`tegelased tekstis (${[...new Set(castNames(studentText(b), lang))].join(', ')})`);
    if (!String(b.data.opener.source || '').trim() || !sourceLine(b.data.text, lang)) problems.push('allikarida puudub');
    if (qs.length < AV.openerQuestions[0] || qs.length > AV.openerQuestions[1]) problems.push(`${qs.length} „Mõtle kaasa” küsimust (${AV.openerQuestions.join('–')})`);
    if (!qs.some((q) => x.home.test(q))) problems.push('ükski küsimus ei võrdle Eestit õppija kodumaaga');
    if (problems.length) add('av-opener', `teema avaleht ${b.id}: ${problems.join('; ')}`, id, phase);
  }

  // variety caps
  const retell = entries.filter(({ b }) => SPEAKING.includes(b.type) && x.retell.test(askedText(b)));
  if (retell.length > AV.retellMax) add('av-retell', `3-2-1 / 4-3-2 ümberjutustus ${retell.length} korda (${retell.map(({ b }) => b.id).join(', ')}; kuni ${AV.retellMax} moodulis)`);
  const record = entries.filter(({ b }) => SPEAKING.includes(b.type) && x.record.test(askedText(b)));
  if (record.length > AV.recordMax) add('av-record', `„salvesta kodus” ${record.length} korda (${record.map(({ b }) => b.id).join(', ')}; kuni ${AV.recordMax} moodulis)`);
  const kasuta = ids.filter((id) => isTeachingLesson(sheets[id]) && sheets[id].transfer).map((id) => sheets[id].transfer);
  const chain = (doc) => {
    const bs = blocksOf(doc);
    const voicemail = bs.some((b) => x.voicemail.test(studentText(b)));
    const call = bs.some((b) => (b.type === 'speakcard' && b.data?.mode === 'phone') || (['rolecards', 'speaking', 'dialogue', 'speakcard'].includes(b.type) && x.call.test(studentText(b))));
    const letter = bs.some((b) => ['guidedletter', 'examwriting'].includes(b.type) || (b.type === 'writing' && x.letter.test(studentText(b))));
    return (voicemail || call) && letter;
  };
  const chained = kasuta.filter(chain).length;
  if (kasuta.length >= 2 && chained > Math.floor(kasuta.length * AV.kasutaChainShare)) add('av-kasuta', `${chained}/${kasuta.length} Kasuta lehte on sama mustriga: häälsõnum või telefonikõne → kiri (kuni pooled)`);

  // speaking breadth: the examiner's question set
  const [qMin, qMax] = AV.examinerQuestions;
  const examiner = entries.filter(({ b }) => {
    if (b.type !== 'speaking') return false;
    const qs = sentences(b.data?.questions).filter((q) => q.endsWith('?'));
    if (qs.length < qMin || qs.length > qMax || hasCast(studentText(b), lang)) return false;
    // an examiner asks for reasons and opinions too, not only facts about the learner's day
    if (qs.filter((q) => x.opinion.test(q)).length < AV.examinerOpinion) return false;
    return !['b2', 'enb2'].includes(profile) || x.talkTime.test(askedText(b));
  });
  if (!examiner.length) add('av-examiner', profile === 'enb2' ? `moodulis pole eksamineerija küsimusteringi (monoloog vähemalt 1 min 45 s + ${qMin}–${qMax} küsimust mooduli teemal, tegelasteta; riigieksami ES2)` : profile === 'b2' ? `moodulis pole eksamineerija küsimusteringi (1-minutiline kõne + ${qMin}–${qMax} arutelu küsimust mooduli teemal, tegelasteta)` : `moodulis pole eksamineerija küsimusteringi (${qMin}–${qMax} küsimust mooduli teemal, tegelasteta)`);

  // B2: the exam's main reading — an opinion / problem article
  if (profile === 'b2' || profile === 'enb2') {
    const [aMin, aMax] = profile === 'enb2' ? AV.articleEn : AV.article;
    const art = entries.filter(({ b }) => ['reading', 'insertion', 'cloze', 'formtext'].includes(b.type) && !hasCast(studentText(b), lang) && words(mainText(b, lang)) >= aMin && words(mainText(b, lang)) <= aMax);
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

// ================= round 2 (docs/ACADEMIC_VALUE_ROUND2.md, COURSE_DESIGN_COMMUNICATIVE.md §13.9) =================
// A learner's-eye review of the finished B1 course (2026-11-03) found what round 1's gates let through: facts bolted on
// to an unchanged cast episode, openers that read like statistics dumps, „sinu kodumaa” in most lessons, Kasuta still a
// phone call + letter, the 3-2-1 retelling in other words, one radio host („Ülle”) everywhere, the same facts in several
// modules and the same four „Mõtle kaasa” questions. The round-2 gates have their own baseline
// (academicValueRound2Baseline.json, run by academicValueRound2Gate.test.js), so round 1's finished modules do not break.
//
//   per lesson
//     av-boltedon     a teaching lesson has a cast-free main text of the stage's length (AV.voiceWords) — a „Kas
//                     teadsid?” fact box, a tip, a chart or the opener does not count, and the radio host counts as cast
//   per module
//     av-opener-numbers  at most AV2.openerNumbers numbers (digits, years, percentages) in the opener's body
//     av-thinkvary    the opener's „Mõtle kaasa” questions are of ≥ AV2.thinkTypes types (thinkType)
//     av-retell2      any repeated retelling (3-2-1, 4-3-2, „kaks / kolm korda”, „esimest … teist korda”, „iga kord
//                     lühemalt”, „kolmele kuulajale”, „uuesti … kiiremini”) at most AV2.retellMax — round 1's av-retell
//                     broadened
//     av-kasuta2      at least half of the Kasuta sheets have no phone task (telefon, helista, häälsõnum, „kõne” + a
//                     case ending, a phone card) and at most half end with a letter / e-mail
//     av-homecountry  „kodumaa” (any case) at most AV2.homeMax times in the module
//     av-voices       ≤ AV2.hostMax listening texts opened by the same recurring voice (cast or the radio host), and ≥ 1
//                     listening text with no recurring voice (news, interview, street poll, expert)
//   per course
//     av-thinkvary    the home-country question sits in the same slot in at most a third of the openers; the same
//                     sequence of question types in at most AV2.thinkSameMax openers
//     av-fact-dup     the same fact in more than one module (both courses together): a near-duplicate sentence in two
//                     fact texts (Jaccard ≥ AV2.dupJaccard on word stems) or a key fact (FACT_KEYS) in two modules
export const AV2 = Object.freeze({
  openerNumbers: 8,
  thinkTypes: 3,
  retellMax: 1,
  kasutaPhoneShare: 0.5,
  kasutaLetterShare: 0.5,
  homeMax: 2,
  hostMax: 2,
  thinkSlotShare: 1 / 3,
  thinkSameMax: 3,
  dupJaccard: 0.4,
  dupJaccardOneNumber: 0.6,
  dupMinStems: 6,
});
// recurring voices that are not in round 1's cast list (the B1 radio host); round 2 treats them as cast
export const RECURRING_VOICES = ['Ülle'];
// the English courses: none yet besides the cast (add a recurring host here when a module gets one)
export const RECURRING_VOICES_EN = [];
const recurringRe = (list) => (list.length ? new RegExp(`(?<!${L})(?:${list.join('|')})\\p{L}{0,4}(?!${L})`, 'u') : null);
const RECURRING_RE = recurringRe(RECURRING_VOICES);
const RECURRING_EN_RE = recurringRe(RECURRING_VOICES_EN);
const hasRecurring = (s, lang = 'et') => { const re = lang === 'en' ? RECURRING_EN_RE : RECURRING_RE; return hasCast(s, lang) || Boolean(re?.test(String(s || ''))); };

// ---------- the opener ----------
const openerBody = (b, lang = 'et') => {
  const paras = paragraphs(b?.data?.text);
  const end = paras.findIndex((p) => sourceLine(p, lang) || lex(lang).think.test(p));
  return (end < 0 ? paras : paras.slice(0, end)).join('\n\n');
};
// a number token: 450 000, 7,3, 2019, 84 % (a range 2019–2021 is two)
export const numberTokens = (s) => String(s || '').match(/\d+(?:[ \u00a0\u202f]\d{3}(?!\d))*(?:[.,]\d+)?/gu) || [];

// the kind of a „Mõtle kaasa” question: the first that fits
export const THINK_TYPES = [
  ['home', HOME],
  ['compare', word('võrdle\\p{L}*|erine\\p{L}*|sarnane\\p{L}*|teisiti|samamoodi|kui Eestis|kui varem|mujal|teistes riikides|mõnes riigis')],
  ['problem', /(?:mida|kuidas)\s+(?:\p{L}+\s+){0,3}(?:peaks|tuleks|saaks|võiks)|lahend|mida sa teeksid|kui sina oleksid|kui sa oleksid/iu],
  ['prediction', /tulevikus|aasta pärast|aastate pärast|\d{4}\. aastal|hakkab|muutub|muutuvad|jääb alles|kaob/iu],
  ['reaction', /üllat|imesta|kõige rohkem meelde/iu],
  ['opinion', OPINION],
  ['experience', word('oled|olete|sul|sinu|sina|sa|su|teil|teie')],
];
export const THINK_TYPES_EN = [
  ['home', HOME_EN],
  ['compare', word('compare\\p{L}*|differ\\p{L}*|similar\\p{L}*|than in Estonia|than before|the same as|elsewhere|in other countries|in some countries')],
  ['problem', /what (?:should|could|can|would) (?:\p{L}+\s+){0,3}do|how (?:could|can|should|would) (?:\p{L}+\s+){0,3}(?:solve|change|improve|help|fix)|solv|solution|what would you do|if you were/iu],
  ['prediction', /in the future|in \d+ years|years from now|by \d{4}|will (?:\p{L}+\s+){0,2}(?:change|disappear|become|look|still)|going to change/iu],
  ['reaction', /surpris|amaz|shock|remember most|stands? out/iu],
  ['opinion', OPINION_EN],
  ['experience', word('you|your|yours')],
];
export const thinkType = (q, lang = 'et') => ((lang === 'en' ? THINK_TYPES_EN : THINK_TYPES).find(([, re]) => re.test(String(q || ''))) || ['other'])[0];

// ---------- retelling, phone and letter ----------
const RETELL2 = new RegExp([
  '[234]\\s*[-–]\\s*[123]\\s*[-–]\\s*[12](?!\\d)', // 4-3-2, 3-2-1
  '[234],\\s*(?:siis\\s+)?[123]\\s+(?:ja\\s+)?(?:lõpuks\\s+)?[12](?!\\d)', // 3, 2 ja 1
  '(?<!\\p{L})(?:kaks|kolm|neli|mitu|2|3|4)\\s+korda(?!\\s+(?:nädalas|päevas|kuus|aastas|rohkem|vähem|suurem|kiiremini))',
  'esimest korda[^]{0,120}teist korda|esimene kord[^]{0,120}teine kord|teisel korral|kolmandal korral',
  'iga kord (?:uuele|lühemalt|lühem|kiiremini|vähem|teisele)',
  '(?<!\\p{L})(?:kahele|kolmele|neljale|mitmele|2|3|4)\\s+(?:uuele\\s+|erinevale\\s+)?(?:kuulajale|paarilisele|inimesele|õppijale|kaaslasele)',
  'uuele (?:kuulajale|paarilisele)',
  '(?:uuesti|veel kord|teist korda)[^.?!]{0,60}(?:kiiremini|lühemalt|ilma (?:märkmete|pildi|teksti|paberi|toe|plaani))',
  'mitu korda järjest',
].join('|'), 'iu');
const RETELL2_EN = new RegExp([
  '[234]\\s*[-–]\\s*[123]\\s*[-–]\\s*[12](?!\\d)',
  '(?<!\\p{L})(?:two|three|four|several|2|3|4)\\s+times(?!\\s+(?:a|per|more|less|bigger|smaller|faster|as|higher|lower))',
  'first time[^]{0,120}second time|the second time|the third time',
  'each time (?:to a new|shorter|faster|with less|to another)',
  '(?<!\\p{L})(?:two|three|four|several|2|3|4)\\s+(?:new\\s+|different\\s+)?(?:listeners|partners|people|classmates)',
  'to a new (?:listener|partner)',
  '(?:again|once more)[^.?!]{0,60}(?:faster|shorter|without (?:notes|the picture|the text|a plan|help))',
].join('|'), 'iu');
export const isRetelling = (b, lang = 'et') => ['speaking', 'speakcard'].includes(b?.type) && (lang === 'en' ? RETELL2_EN : RETELL2).test(askedText(b));

const PHONE_RE = /telefon\p{L}*|helista(?!ja)\p{L}*|häälsõnum\p{L}*|kõnepost\p{L}*|automaatvastaja\p{L}*|videokõne\p{L}*|(?<!\p{L})kõne(?:t|d|le|ks)?\s+\p{L}+(?:sse|le|ga)(?!\p{L})/iu;
const PRODUCE = ['speaking', 'speakcard', 'rolecards', 'writing', 'guidedletter', 'examwriting'];
// a phone task: a phone card, or a call / voicemail in the task (for a speaking block also in its cards)
const PHONE_EN_RE = /phone\p{L}*|(?<![\p{L}-])call(?:s|ing|ed)?(?!\p{L})|ring (?:up|them|him|her)|voicemail|voice message|answerphone|video call/iu;
export const isPhoneTask = (b, lang = 'et') => {
  if (b?.type === 'speakcard' && b.data?.mode === 'phone') return true;
  return (lang === 'en' ? PHONE_EN_RE : PHONE_RE).test(SPEAKING.includes(b?.type) ? studentText(b) : askedText(b));
};
const LETTER_RE = /(?<!\p{L})(?:e-)?(?:kiri|kirja|kirjale|kirjas|kirjaga)(?!\p{L})|e-post\p{L}*|e-meil\p{L}*|(?<!\p{L})meil\p{L}*|(?<!hääl)sõnum\p{L}*/iu;
const LETTER_EN_RE = /(?<!\p{L})(?:letters?|e-?mails?|(?<!voice )messages?)(?!\p{L})/iu;
export const isLetterTask = (b, lang = 'et') => b?.type === 'guidedletter' || (['writing', 'examwriting'].includes(b?.type) && (lang === 'en' ? LETTER_EN_RE : LETTER_RE).test(askedText(b)));

// ---------- voices of listening ----------
const SPEAKER_RE = /^\s*([\p{Lu}][\p{L}-]+(?: [\p{Lu}][\p{L}-]+)?):/gmu;
// the speakers of a listening text: its „Name:” labels, or „Siin Name” in a voicemail
export function listeningSpeakers(b, lang = 'et') {
  const t = String(b?.data?.transcript || '');
  const labels = [...t.matchAll(SPEAKER_RE)].map((m) => m[1]);
  if (labels.length) return labels;
  const siin = t.slice(0, 200).match(lang === 'en' ? /(?<!\p{L})(?:[Tt]his is|[Ii]t's|[Ii]t’s|I'm|I’m) (\p{Lu}\p{L}+)/u : /(?<!\p{L})[Ss]iin (?:on )?(\p{Lu}\p{L}+)/u);
  return siin ? [siin[1]] : [];
}
// the recurring person behind a speaker label (the cast or the radio host), '' for anyone else
export const recurringVoice = (name, lang = 'et') => {
  const c = castNames(name, lang)[0];
  if (c) return c;
  return (lang === 'en' ? RECURRING_VOICES_EN : RECURRING_VOICES).find((v) => String(name).startsWith(v)) || '';
};
const LISTEN = ['listening', 'examlisten'];

// ---------- per lesson ----------
const isFactBox = (b, lang = 'et') => Boolean(b.data?.know) || b.type === 'tip' || lex(lang).factBox.test(String(b.data?.title || b.data?.heading || ''));
// a main text from outside the story: what av-voice counts, minus fact boxes, tips, charts and the radio host
export function isMainText(b, doc) {
  const lang = sheetLang(doc);
  if (!INPUT.includes(b.type) || b.type === 'chart' || b.data?.review || b.data?.opener || isFactBox(b, lang)) return false;
  if (hasRecurring(studentText(b), lang)) return false;
  return words(mainText(b, lang)) >= voiceMin(doc);
}
export function lessonRound2Problems(lessonId, phases) {
  if (!isTeachingLesson(phases)) return [];
  const docs = Object.entries(phases || {});
  if (docs.some(([, doc]) => blocksOf(doc).some((b) => isMainText(b, doc)))) return [];
  return [{ lessonId, phase: '*', code: 'av-boltedon', text: `tunnis pole põhiteksti väljastpoolt tegelaste lugu (≥ ${voiceMin(docs[0]?.[1])} sõna; „Kas teadsid?” kast, nõuanne, graafik ega teema avaleht ei loe — tegelaste episood + faktikast ei ole tund)` }];
}

// ---------- per module ----------
// the round-2 rules are the same for B1 and B2; lengths come from each sheet's level
export function moduleRound2Problems(sheets) {
  const out = [];
  const lang = moduleLang(sheets);
  const ids = Object.keys(sheets || {});
  const add = (code, text, lessonId = '*', phase = '*') => out.push({ lessonId, phase, code, text });
  ids.forEach((id) => out.push(...lessonRound2Problems(id, sheets[id])));
  const entries = ids.flatMap((id) => Object.entries(sheets[id]).flatMap(([phase, doc]) => blocksOf(doc).map((b) => ({ id, phase, doc, b }))));

  // the opener: a page to read, not a table of numbers; questions of several kinds
  const opener = entries.find(({ b }) => b.data?.opener);
  if (opener) {
    const n = numberTokens(openerBody(opener.b, lang)).length;
    if (n > AV2.openerNumbers) add('av-opener-numbers', `teema avalehes ${opener.b.id} on ${n} arvu (kuni ${AV2.openerNumbers}): jäta alles 3–5 tähtsamat, ülejäänu ütle sõnadega („üle poole”, „iga kolmas”) või vii graafikusse`, opener.id, opener.phase);
    const qs = (opener.b.data.opener.questions || []).map(String);
    const types = new Set(qs.map((q) => thinkType(q, lang)));
    if (qs.length && types.size < AV2.thinkTypes) add('av-thinkvary', `„Mõtle kaasa” küsimused on ${types.size} tüüpi (${[...types].join(', ')}; vähemalt ${AV2.thinkTypes}: kogemus, arvamus, võrdlus, ennustus, probleemi lahendus, reaktsioon)`, opener.id, opener.phase);
  }

  const retell = entries.filter(({ b }) => isRetelling(b, lang));
  if (retell.length > AV2.retellMax) add('av-retell2', `korduv ümberjutustus ${retell.length} korda (${retell.map(({ b }) => b.id).join(', ')}; kuni ${AV2.retellMax} moodulis: 3-2-1, „kaks korda”, „iga kord lühemalt”, „kolmele kuulajale” …)`);

  const kasuta = ids.filter((id) => isTeachingLesson(sheets[id]) && sheets[id].transfer).map((id) => blocksOf(sheets[id].transfer));
  if (kasuta.length >= 2) {
    const phone = kasuta.filter((bs) => bs.some((b) => isPhoneTask(b, lang))).length;
    if (kasuta.length - phone < Math.ceil(kasuta.length * AV2.kasutaPhoneShare)) add('av-kasuta2', `${phone}/${kasuta.length} Kasuta lehel on telefonikõne või häälsõnum (vähemalt pooled ilma: läbirääkimine, küsitlus, nõuandeveerg, miniprojekt, väitlus, esitlus)`);
    const letter = kasuta.filter((bs) => { const last = bs.filter((b) => PRODUCE.includes(b.type)).pop(); return last && isLetterTask(last, lang); }).length;
    if (letter > Math.floor(kasuta.length * AV2.kasutaLetterShare)) add('av-kasuta2', `${letter}/${kasuta.length} Kasuta lehte lõpeb kirja või e-kirjaga (kuni pooled)`);
  }

  const home = entries.reduce((n, { b }) => n + (studentText(b).match(lex(lang).homeCount) || []).length, 0);
  if (home > AV2.homeMax && lang === 'en') add('av-homecountry', `„your home country” ${home} korda (kuni ${AV2.homeMax} moodulis; paljud õppijad elavad Eestis): „in Estonia”, „where you live”, „in another country you know well”`);
  else if (home > AV2.homeMax) add('av-homecountry', `„kodumaa” ${home} korda (kuni ${AV2.homeMax} moodulis; paljud õppijad on sündinud Eestis): „mõnes teises riigis”, „riigis, mida sa hästi tead”, „sinu kodukohas”, „seal, kus sa üles kasvasid”, „mujal maailmas”`);

  const listens = entries.filter(({ b }) => LISTEN.includes(b.type));
  const hosts = {};
  listens.forEach(({ b }) => { const name = recurringVoice(listeningSpeakers(b, lang)[0] || '', lang); if (name) (hosts[name] = hosts[name] || []).push(b.id); });
  Object.entries(hosts).filter(([, bs]) => bs.length > AV2.hostMax).forEach(([name, bs]) => add('av-voices', `${name} alustab ${bs.length} kuulamisteksti (${bs.join(', ')}; kuni ${AV2.hostMax}): anna sõna uudisteinimesele, eksperdile, tänavaküsitlusele, teisele saatejuhile`));
  const outside = listens.filter(({ b, doc }) => !hasRecurring(studentText(b), lang) && !listeningSpeakers(b, lang).some((n) => recurringVoice(n, lang)) && (b.tag?.voice || words(mainText(b, lang)) >= voiceMin(doc)));
  if (listens.length && !outside.length) add('av-voices', 'moodulis pole kuulamisteksti väljastpoolt tegelaste ringi (uudis, intervjuu, tänavaküsitlus, ekspert; lehe taseme pikkusega või sildiga voice)');
  return out;
}

// ---------- per course ----------
// openers: [{ moduleId, questions }] of one course
export function thinkVaryProblems(openers) {
  const out = [];
  const add = (text) => out.push({ lessonId: '*', phase: '*', code: 'av-thinkvary', text });
  if (openers.length < 3) return out;
  const slots = {};
  openers.forEach(({ moduleId, questions, lang }) => { const i = questions.findIndex((q) => thinkType(q, lang) === 'home'); if (i >= 0) (slots[i + 1] = slots[i + 1] || []).push(moduleId); });
  const cap = Math.max(2, Math.ceil(openers.length * AV2.thinkSlotShare));
  Object.entries(slots).filter(([, ms]) => ms.length > cap).forEach(([slot, ms]) => add(`kodumaa / teise riigi küsimus on ${ms.length} avalehel ${slot}. kohal (kuni ${cap}): ${ms.join(', ')}`));
  const seqs = {};
  openers.forEach(({ moduleId, questions, lang }) => { const k = questions.map((q) => thinkType(q, lang)).join('-'); (seqs[k] = seqs[k] || []).push(moduleId); });
  Object.entries(seqs).filter(([, ms]) => ms.length > AV2.thinkSameMax).forEach(([k, ms]) => add(`${ms.length} avalehe küsimused on sama mustriga ${k} (kuni ${AV2.thinkSameMax}): ${ms.join(', ')}`));
  return out;
}
export function courseRound2Problems(modules, sheetsOf) {
  const openers = modules.flatMap((mod) => Object.values(sheetsOf(mod)).flatMap((phases) => Object.values(phases).flatMap((doc) => blocksOf(doc).filter((b) => b.data?.opener).map((b) => ({ moduleId: mod.MODULE.id, questions: (b.data.opener.questions || []).map(String), lang: sheetLang(doc) })))));
  return thinkVaryProblems(openers);
}

// key facts the review found repeated across modules; each may stand in one module of the two courses
export const FACT_KEYS = [
  ['X-tee', /X-te[eel]/u],
  ['igaüheõigus', /igaüheõigus/iu],
  ['„Teeme ära!”', /Teeme [Ää]ra(?!\p{L})|Let’s Do It/u],
  ['ID-kaart, mobiil-ID ja Smart-ID', /ID-kaar\p{L}*[^.]{0,80}(?:mobiil-ID|Smart-ID)/iu],
  ['e-residentsus', /e-residen/iu],
  ['digiallkiri', /digiallkir|digitaalallkir/iu],
  ['e-valimised', /e-hääl|e-valim|i-valim|internetis hääleta/iu],
  ['Balti kett', /Balti ket/iu],
  ['Skype', /Skype/u],
];
// the same key facts in the English courses' wording
export const FACT_KEYS_EN = [
  ['X-Road', /X-Road|X-tee/u],
  ['everyman’s right', /everyman['’]s right|right of public access/iu],
  ['Let’s Do It / World Cleanup Day', /Let['’]s Do It|World Cleanup Day|Teeme ära/iu],
  ['ID card, Mobile-ID and Smart-ID', /ID[- ]card[^.]{0,80}(?:Mobile-ID|Smart-ID)/iu],
  ['e-Residency', /e-[Rr]esiden/u],
  ['digital signature', /digital(?:ly)? sign/iu],
  ['i-voting', /i-voting|e-voting|online voting|vote online/iu],
  ['Baltic Way', /Baltic (?:Way|Chain)/iu],
  ['Skype', /Skype/u],
];
const STEM_STOP = new Set('aga ning kuid see seda selle need nende mis mida kes kus kui või siis ka on oli olid olla ole sest et ja ei veel väga kõik üle ainult juba nii kas palju rohkem enam umbes vähem eestis eesti aasta aastal'.split(' '));
const STEM_STOP_EN = new Set('that this these those there their they them with from have been were will would could should about into than then when what which while also more most only very many much some such over just like estonia estonian year years people'.split(' '));
const stems = (s, lang = 'et') => { const stop = lang === 'en' ? STEM_STOP_EN : STEM_STOP; return new Set(clean(s).toLowerCase().split(/[^\p{L}\d-]+/u).filter((w) => w.length >= 4 && !stop.has(w)).map((w) => w.slice(0, 6))); };
// a sentence about the course itself („Mooduli lõpus teed …”), not a fact
const COURSE_META = /mooduli|moodulis|selles tunnis|proovieksam|(?<!\p{L})(?:sa|sina) (?:teed|õpid|loed|kuulad|kirjutad)(?!\p{L})/iu;
const COURSE_META_EN = /this module|in this lesson|mock exam|(?<!\p{L})you (?:will )?(?:write|learn|read|listen|do)(?!\p{L})/iu;
const jaccard = (a, b) => { let i = 0; a.forEach((x) => { if (b.has(x)) i += 1; }); return i / (a.size + b.size - i || 1); };
// the fact text of a block: its main text (the opener's body) without the source line
const factText = (b, lang = 'et') => (b.data?.opener ? openerBody(b, lang) : mainText(b, lang)).replace(/\*?\(?(?:Allikas|Allikad|Andmed|Sources?|Data)\s*:[^*\n]*\*?\)?/giu, '');
// modules: [{ id, sheets }] in course order (B1 1–18, then B2 1–18). Sentence duplicates come from fact texts (a source
// line, a „Kas teadsid?” box or the opener); key facts also from cast-free texts of ≥ 60 words (an exam reading).
export function factDuplicates(modules) {
  const sents = []; const keyHits = new Map();
  for (const { id: moduleId, sheets } of modules) {
    for (const [lessonId, phases] of Object.entries(sheets || {})) {
      for (const [phase, doc] of Object.entries(phases)) {
        const lang = sheetLang(doc);
        for (const b of blocksOf(doc)) {
          if (!INPUT.includes(b.type) || hasRecurring(studentText(b), lang)) continue;
          const sourced = Boolean(b.data?.know || b.data?.opener) || hasSource(b, lang);
          const text = factText(b, lang);
          if (!sourced && words(text) < 60) continue;
          const where = { moduleId, lessonId, phase, blockId: b.id };
          (lang === 'en' ? FACT_KEYS_EN : FACT_KEYS).forEach(([key, re]) => { if (re.test(text)) { if (!keyHits.has(key)) keyHits.set(key, []); keyHits.get(key).push(where); } });
          if (sourced) sentences(text).filter((x) => !x.endsWith('?') && !(lang === 'en' ? COURSE_META_EN : COURSE_META).test(x)).forEach((x) => { const s = stems(x, lang); if (s.size >= AV2.dupMinStems) sents.push({ ...where, text: x, s }); });
        }
      }
    }
  }
  const dups = [];
  for (const [key, hits] of keyHits) {
    const first = hits[0];
    const later = hits.filter((h) => h.moduleId !== first.moduleId);
    later.filter((h, i) => later.findIndex((x) => x.moduleId === h.moduleId) === i).forEach((again) => dups.push({ kind: 'key', key, first, again }));
  }
  // one problem per repeating block and earlier module (a key fact and its sentence are one repeat)
  const seen = new Set(dups.map(({ first, again }) => `${again.moduleId}|${again.blockId}|${first.moduleId}`));
  for (let i = 0; i < sents.length; i += 1) {
    for (let j = i + 1; j < sents.length; j += 1) {
      const a = sents[i]; const b = sents[j];
      const pair = `${b.moduleId}|${b.blockId}|${a.moduleId}`;
      if (a.moduleId === b.moduleId || seen.has(pair)) continue;
      const v = jaccard(a.s, b.s);
      // the same frame with other numbers („keskmiselt 9 tundi” / „keskmiselt 3,3 tundi”) is another fact
      const na = numberTokens(a.text); const nb = new Set(numberTokens(b.text));
      if (na.length && nb.size && !na.some((x) => nb.has(x))) continue;
      // a figure on one side only („üheksa tundi” / „3,3 tundi”): only a very close sentence is the same fact
      const need = (na.length > 0) !== (nb.size > 0) ? AV2.dupJaccardOneNumber : AV2.dupJaccard;
      if (v >= need) { seen.add(pair); dups.push({ kind: 'sentence', key: b.text.slice(0, 90), similarity: Math.round(v * 100) / 100, first: a, again: b }); }
    }
  }
  return dups;
}
export const factDupProblems = (dups) => dups.map(({ kind, key, first, again }) => ({
  lessonId: again.lessonId, phase: again.phase, code: 'av-fact-dup', moduleId: again.moduleId,
  text: `${again.blockId}: ${kind === 'key' ? `sama fakt (${key})` : `peaaegu sama lause („${key}…”)`} on juba moodulis ${first.moduleId} (${first.blockId}) — vali teine fakt või viita varasemale („Mäletad, …”)`,
}));
