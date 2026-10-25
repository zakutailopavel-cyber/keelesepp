// Block builders for the KeeleSepp course sheets (B1 / B2, docs/B1_B2_COURSE_PRODUCTION.md). Each builder returns a
// Worksheet Studio block (engine/registry.js) with its answer key in the block's own contract. Ids are stable per
// lesson + phase + slot, so a republished sheet keeps the learners' answer keys.

import { ARCHETYPES, LEAD_PAIRS, TEACHING_ARCHETYPES, isCatalogueId, isHarnoFormat } from '../../../worksheet-studio/didactics/taskCatalogue.js';
import { EXAM_PART_DEFAULTS, RUBRIC_SCALES } from '../../../worksheet-studio/engine/blocks/harnoScales.js';

const block = (id, type, tone, goal, data, width = 'full') => ({ id, type, width, span: width === 'full' ? 12 : 6, tone, goal, data });
const join = (v) => (Array.isArray(v) ? v.join('\n') : String(v || ''));

// default sub-goal of each task type (lesson quality contract A3, owner 2026-10-12): form tasks train the form
// (g_notice), word tasks the vocabulary (g_vocab), speaking/writing/dialogue the use (g_use)
// the teacher's answer key explains every answer (owner 2026-10-21): one line per item, in the order the key lists them
// (engine/answerKey.js); students never see it
export const why = (block, lines) => ({ ...block, data: { ...block.data, explain: lines.join('\n') } });

// how the teacher runs an open task (owner 2026-10-22, docs/METHODOLOGY_STANDARD.md §3): above all the one-to-one variant
// of a pair or group task — the teacher is the partner. Shown in the teacher's key only.
export const teach = (block, note) => ({ ...block, data: { ...block.data, teacher: note } });

// Didactic tags of a task (docs/COURSE_FINAL_SHAPE_B1.md §3, §9; checked by worksheet-studio/didactics/finalShape.js):
//   task     catalogue id (R01…G13); without it the block type's default applies (taskCatalogue.js DEFAULT_TASK)
//   harno    the Harno B1 format the task practises in exam form (R1, R2, R3a, R3b, R4, L1, L2, L3a, L3b, L4, W1a, W1b,
//            W2a, W2b, S0, S1a, S1b, S2) — in a teaching lesson this makes it the lesson's „Eksaminurk”
//   level    cognitive level 1–4 (1 recognise, 2 controlled, 3 guided production, 4 free production / negotiate)
//   fluency  true: a fluency task with known language (4-3-2, timed retelling, speed reading) — Nation's 4th strand
//   main     true: the main task of Kasuta (the can-do done); without it the last speaking / writing task of Kasuta
//   topic    on a vocab block: the words that are topic words on purpose (not in the EKI A1–B1 lists, §8 V14)
// The tags live on the block (`block.tag`), never in the learner's text. A wrong value fails at once, not in a gate.
const TAG_KEYS = ['task', 'harno', 'level', 'fluency', 'main', 'topic'];
export function tag(block, tags = {}) {
  const unknown = Object.keys(tags).filter((k) => !TAG_KEYS.includes(k));
  if (unknown.length) throw new Error(`${block.id}: tundmatu silt ${unknown.join(', ')} (lubatud: ${TAG_KEYS.join(', ')})`);
  if (tags.task !== undefined && !isCatalogueId(tags.task)) throw new Error(`${block.id}: ülesandetüüp ${tags.task} pole kataloogis (taskCatalogue.js)`);
  if (tags.harno !== undefined && !isHarnoFormat(tags.harno)) throw new Error(`${block.id}: Harno vorm ${tags.harno} on tundmatu (R1…S2)`);
  if (tags.level !== undefined && ![1, 2, 3, 4].includes(tags.level)) throw new Error(`${block.id}: tase peab olema 1–4`);
  if (tags.topic !== undefined && (block.type !== 'vocab' || !Array.isArray(tags.topic))) throw new Error(`${block.id}: teemasõnad (topic) on sõnavarakasti sõnade loend`);
  const clean = Object.fromEntries(Object.entries(tags).filter(([, v]) => v !== undefined && v !== false));
  return { ...block, tag: { ...(block.tag || {}), ...clean } };
}

// The lesson's archetype and lead skills (§4): spread into a lesson — `...shape('LUGU', 'R→W')` — or declare the whole
// module at once with withShapes(LESSONS, { 'a2b1-021': 'LUGU R→W', 'a2b1-025': 'EKS' }). The lead is input → output:
// L or R → S or W.
export function shape(archetype, lead = '') {
  if (!ARCHETYPES[archetype]) throw new Error(`tundmatu tunni tüüp ${archetype} (${Object.keys(ARCHETYPES).join(', ')})`);
  if (!TEACHING_ARCHETYPES.includes(archetype)) return { archetype };
  const pair = String(lead).replace(/\s+/g, '').replace('->', '→');
  if (!LEAD_PAIRS.includes(pair)) throw new Error(`${archetype}: juhtoskused peavad olema ${LEAD_PAIRS.join(' / ')}, mitte „${lead}”`);
  const [input, output] = pair.split('→');
  return { archetype, lead: { input, output } };
}
export function withShapes(lessons, map) {
  const missing = Object.keys(map).filter((id) => !lessons[id]);
  if (missing.length) throw new Error(`withShapes: tundi ei ole (${missing.join(', ')})`);
  return Object.fromEntries(Object.entries(lessons).map(([id, lesson]) => {
    if (!map[id]) return [id, lesson];
    const [archetype, lead] = String(map[id]).trim().split(/\s+/);
    return [id, { ...lesson, ...shape(archetype, lead) }];
  }));
}

export const B = {
  text: (id, heading, text, width = 'full') => block(id, 'text', 'white', '', { heading, text }, width),
  tip: (id, title, text, width = 'half') => block(id, 'tip', 'white', '', { title, text: join(text) }, width),
  notice: (id, title, lines, width = 'half', goal = 'g_notice') => block(id, 'notice', 'white', goal, { title, lines: join(lines) }, width),
  vocab: (id, title, words, columns = '2', width = 'full') => block(id, 'vocab', 'cream', 'g_vocab', { title, words: Array.isArray(words) ? words.join(', ') : words, columns }, width),
  phrasebank: (id, sections) => block(id, 'phrasebank', 'cream', 'g_use', { sections: sections.map(([title, lines]) => ({ title, text: join(lines) })) }),
  // questions: [[q, right, wrong1, wrong2], …] — the right option is marked with * and mixed when shown
  choice: (id, title, instruction, questions, width = 'full', goal = 'g_read') => block(id, 'choice', 'sky', goal, {
    title, instruction, questions: questions.map(([q, right, ...wrong]) => ({ q, options: [`*${right}`, ...wrong].join('\n') })),
  }, width),
  truefalse: (id, title, instruction, statements, width = 'half', goal = 'g_read') => block(id, 'truefalse', 'sky', goal, {
    title, instruction, statements: statements.map(([text, ok]) => ({ text, answer: ok ? 'true' : 'false' })),
  }, width),
  gaps: (id, title, instruction, sentences, bank = '', width = 'full', goal = 'g_notice') => block(id, 'gaps', 'blue', goal, {
    title, instruction, sentences: join(sentences),
    // a bank of sentences (entries with commas) keeps one entry per line
    ...(Array.isArray(bank) && bank.some((w) => /[,;]/.test(w)) ? { bank: bank.join('\n'), bankLines: true } : { bank: Array.isArray(bank) ? bank.join(', ') : bank }),
    showBank: (Array.isArray(bank) ? bank.length : bank) ? 'yes' : 'no',
  }, width),
  match: (id, title, instruction, pairs, width = 'full', goal = 'g_vocab') => block(id, 'match', 'peach', goal, { title, instruction, pairs: pairs.map(([left, right]) => ({ left, right })) }, width),
  manymatch: (id, title, instruction, left, right, width = 'full', goal = 'g_vocab') => block(id, 'manymatch', 'peach', goal, { title, instruction, left: join(left), right: join(right) }, width),
  // an item with a comma (a whole sentence) cannot live in a comma list: such groups keep one item per line
  categorize: (id, title, instruction, groups, width = 'full', goal = 'g_vocab') => {
    const perLine = groups.some(([, words]) => Array.isArray(words) && words.some((w) => /[,;]/.test(w)));
    return block(id, 'categorize', 'peach', goal, { title, instruction, groups: groups.map(([name, words]) => (Array.isArray(words) ? (perLine ? { name, words: words.join('\n'), lines: true } : { name, words: words.join(', ') }) : { name, words })) }, width);
  },
  wordforms: (id, title, instruction, rows, width = 'half', goal = 'g_notice') => block(id, 'wordforms', 'blue', goal, { title, instruction, rows: rows.map(([base, prompt, answer]) => ({ base, prompt, answer })) }, width),
  errorfix: (id, title, instruction, rows, width = 'full', goal = 'g_notice') => block(id, 'errorfix', 'peach', goal, { title, instruction, rows: rows.map(([wrong, answer]) => ({ wrong, answer })) }, width),
  transformation: (id, title, instruction, rows, width = 'full', goal = 'g_notice') => block(id, 'transformation', 'blue', goal, { title, instruction, rows: rows.map(([from, prompt, answer]) => ({ from, prompt, answer })) }, width),
  wordorder: (id, title, instruction, sentences, width = 'half', goal = 'g_notice') => block(id, 'wordorder', 'sky', goal, { title, instruction, sentences: join(sentences) }, width),
  clock: (id, title, instruction, items, goal = 'g_vocab') => block(id, 'clock', 'blue', goal, { title, instruction, columns: '3', items }),
  table: (id, title, instruction, headers, rows, goal = 'g_use') => block(id, 'table', 'blue', goal, { title, instruction, headers, rows: join(rows) }),
  translation: (id, title, instruction, rows, width = 'half', goal = 'g_vocab') => block(id, 'translation', 'cream', goal, { title, instruction, rows: rows.map((source) => ({ source, hint: '' })) }, width),
  dialogue: (id, title, instruction, speakerA, speakerB, lines, goal = 'g_use') => block(id, 'dialogue', 'green', goal, { title, instruction, speakerA, speakerB, lines: lines.map(([who, text]) => ({ who, text })) }),
  diagram: (id, kind, data, width = 'half', goal = 'g_notice') => block(id, 'diagram', 'white', goal, { kind, ...data }, width),
  // „Andmediagramm” (Harno C1 writing 1): series 'A, B'; rows ['2015 | 62 | 8', …]; kind 'bar' | 'line'
  chart: (id, chartTitle, { kind = 'bar', unit = '', series = '', rows = [], source = '' } = {}, goal = 'g_read') => block(id, 'chart', 'white', goal, { chartTitle, kind, unit, series: Array.isArray(series) ? series.join(', ') : series, rows: join(rows), source }),
  crossword: (id, title, instruction, rows, width = 'half', goal = 'g_vocab') => block(id, 'crossword', 'cream', goal, { title, instruction, rows: rows.map(([clue, answer]) => ({ clue, answer })) }, width),
  // character / ID cards (Tegelaskaardid): people [[name, facts, sentences with [gaps]], …] — a card without a photo is
  // an ID card (personal data, A2 module 1)
  profiles: (id, title, instruction, people, columns = '3', goal = 'g_read') => block(id, 'profiles', 'peach', goal, {
    title, instruction, columns, people: people.map(([name, facts, sentences]) => ({ img: null, name, facts: join(facts), sentences: join(sentences) })),
  }),
  // reading: questions [[q, answer|alternatives], …]; {{word}} marks a word of the lesson in the passage
  reading: (id, title, instruction, passageTitle, passage, questions, goal = 'g_read') => block(id, 'reading', 'cream', goal, {
    title, instruction, passageTitle, passage: join(passage), questions: questions.map(([q, a]) => (a ? `${q} [${a}]` : q)).join('\n'), lineWidth: 'wide',
  }),
  // a text with option gaps (Harno B1 reading 3): „… {*õige|vale|vale} …”
  cloze: (id, title, instruction, passageTitle, passage, goal = 'g_read') => block(id, 'cloze', 'cream', goal, { title, instruction, passageTitle, passage: join(passage) }),
  // „Pane sõnad õigesse vormi” in a text: „Eile [käisin] (käima) poes.”
  formtext: (id, title, instruction, passageTitle, passage, goal = 'g_notice') => block(id, 'formtext', 'blue', goal, { title, instruction, passageTitle, passage: join(passage) }),
  // „Lünka sobiv lause”: the whole text, taken-out sentences in [[…]], extra sentences apart
  insertion: (id, title, instruction, passageTitle, passage, extra, goal = 'g_read') => block(id, 'insertion', 'cream', goal, { title, instruction, passageTitle, passage: join(passage), extra: join(extra) }),
  listening: (id, title, instruction, transcript, sentences, goal = 'g_read') => block(id, 'listening', 'sky', goal, { title, instruction, audio: null, sentences: join(sentences), transcript: join(transcript) }),
  dictation: (id, title, instruction, sentences, lines = 6) => block(id, 'dictation', 'sky', 'g_use', { title, instruction, sentences: join(sentences), lines }),
  speaking: (id, title, instruction, questions, [minSec, maxSec], tipText = '', goal = 'g_use') => block(id, 'speaking', 'green', goal, {
    title, instruction, questions: join(questions), img: null, aspect: '4:3', bubble: '', tipTitle: tipText ? 'Kasuta:' : '', tipText: join(tipText), minSec, maxSec,
  }),
  rolecards: (id, title, instruction, roleA, roleB, phrasesA, phrasesB, goal = 'g_use') => block(id, 'rolecards', 'green', goal, { title, instruction, roleA, roleB, phrasesA: join(phrasesA), phrasesB: join(phrasesB) }),
  planning: (id, title, instruction, prompts, lines = 3) => block(id, 'planning', 'cream', 'g_use', { title, instruction, prompts: join(prompts), lines }),
  writing: (id, title, instruction, [minSent, maxSent], keywords = [], minKeywords = 0, goal = 'g_use') => block(id, 'writing', 'cream', goal, {
    title, instruction, lines: Math.max(7, maxSent), minSent, maxSent, keywords: keywords.join(', '), minKeywords, img: null,
  }),
  letter: (id, title, instruction, opening, closing, [minWords, maxWords], goal = 'g_use') => block(id, 'guidedletter', 'cream', goal, { title, instruction, opening, closing, minWords, maxWords, lines: Math.ceil(maxWords / 9) }),
  rubric: (id, title, instruction, items) => block(id, 'rubric', 'white', '', { title, instruction, items: join(items) }),
  // „Mäletad?” — 2–3 minutes of review of the previous lesson at the start of Avasta (spaced recycling, METHODOLOGY_STANDARD
  // §3); not counted among the sheet's tasks
  // An item may name the lesson it comes from — ['Mida Markus eile tegi?', 'a2b1-021'] — so the gate can see the spacing
  // (§8 V13: one item from the previous lesson, one from a module 2–4 back); `from` is aligned with the lines
  review: (id, lines) => {
    const items = lines.map((x) => (Array.isArray(x) ? x : [x, '']));
    return block(id, 'tip', 'white', '', { title: 'Mäletad?', text: join(items.map(([text]) => text)), review: true, ...(items.some(([, from]) => from) ? { from: items.map(([, from]) => from || '') } : {}) }, 'full');
  },
  // ---------- Harno B1 exam formats (engine/blocks/harno.jsx, COURSE_FINAL_SHAPE_B1.md §2.2) ----------
  // R1: ads [[title, text], …] lettered A, B, …; situations [[text, 'C'], …] (a letter, or 'A|C' when two fit)
  adsmatch: (id, title, instruction, ads, situations, goal = 'g_read') => block(id, 'adsmatch', 'cream', goal, {
    title, instruction, ads: ads.map(([adTitle, text]) => ({ title: adTitle, text: join(text) })), situations: situations.map(([text, answer]) => ({ text, answer })),
  }),
  // R3b / R4: a text with a word or phrase bank — the removed parts in [[…]], `extra` the bank's extra options
  bankText: (id, title, instruction, passageTitle, passage, extra, goal = 'g_read') => block(id, 'insertion', 'cream', goal, { title, instruction, passageTitle, passage: join(passage), extra: join(extra) }),
  // L1, L2, L4: a recording (transcript for the audio tool and the teacher) + items in the form of `mode`:
  //   'choice'    [[question, right, wrong, wrong], …]   'truefalse' [[statement, true|false], …]   'match' [[left, right], …]
  examListen: (id, title, instruction, mode, transcript, items, goal = 'g_read', plays = 2) => block(id, 'examlisten', 'sky', goal, {
    title, instruction, mode, plays, audio: null, transcript: join(transcript),
    questions: mode === 'choice' ? items.map(([q, right, ...wrong]) => ({ q, options: [`*${right}`, ...wrong].join('\n') })) : [],
    statements: mode === 'truefalse' ? items.map(([text, ok]) => ({ text, answer: ok ? 'true' : 'false' })) : [],
    pairs: mode === 'match' ? items.map(([left, right]) => ({ left, right })) : [],
  }),
  // W1a / W1b / W2a / W2b: the Harno task card. genre: kusimustik | teade | kutse | kiri | jutt | vastus;
  // { situation, points: [content points], questions: [questionnaire], words: [min, max], opening, closing }
  examWriting: (id, title, instruction, genre, { situation = '', points = [], questions = [], words = [40, 60], opening = '', closing = '' } = {}, goal = 'g_use') => block(id, 'examwriting', 'cream', goal, {
    title, instruction, genre, situation: join(situation), points: join(points), questions: join(questions), opening, closing, minWords: words[0], maxWords: words[1], lines: Math.max(6, Math.ceil(words[1] / 9)),
  }),
  // S1b: the agreement task — situation, ideas [text, …] (pictures added in the studio), what to agree on
  ideaCard: (id, title, instruction, situation, ideas, outcome, [minSec, maxSec] = [180, 300], goal = 'g_use') => block(id, 'speakcard', 'green', goal, {
    title, instruction, mode: 'agreement', situation: join(situation), ideas: ideas.map((text) => ({ text, img: null })), outcome, minSec, maxSec,
  }),
  // S2: the phone role play — the caller's question card and the employee's answer card: [role, [lines]]
  phoneCards: (id, title, instruction, situation, [roleA, itemsA], [roleB, itemsB], [minSec, maxSec] = [240, 300], goal = 'g_use') => block(id, 'speakcard', 'green', goal, {
    title, instruction, mode: 'phone', situation: join(situation), minSec, maxSec,
    cardA: { label: 'Küsimuste kaart', role: roleA, items: join(itemsA) }, cardB: { label: 'Vastuste kaart', role: roleB, items: join(itemsB) },
  }),
  // the exam-scale rubrics (§2.4): W1 /8 (the task's four content points by name), W2 /12, speaking /20
  rubricW1: (id, points = [], title = 'Hindamine: kirjutamine 1 (8 punkti).') => block(id, 'examrubric', 'white', '', {
    title, instruction: 'Iga sisupunkt 1 punkt, keel ja vorm 0–4 punkti.', scale: 'W1',
    criteria: RUBRIC_SCALES.W1.criteria.map((c, i) => (i < 4 && points[i] ? { ...c, name: `Sisu: ${points[i]}` } : c)),
  }),
  rubricW2: (id, title = 'Hindamine: kirjutamine 2 (12 punkti).') => block(id, 'examrubric', 'white', '', { title, instruction: 'Neli kriteeriumi, igaüks 0–3 punkti.', scale: 'W2', criteria: RUBRIC_SCALES.W2.criteria }),
  rubricSpeaking: (id, title = 'Hindamine: rääkimine (20 punkti).') => block(id, 'examrubric', 'white', '', { title, instruction: 'Neli kriteeriumi, igaüks 0–5 punkti.', scale: 'S', criteria: RUBRIC_SCALES.S.criteria }),
  // the header of an exam part: 'W' | 'L' | 'R' | 'S' with Harno's minutes, tasks and points (override any), target 80 %
  examPart: (id, skill, overrides = {}) => block(id, 'exampart', 'sky', '', { skill, ...EXAM_PART_DEFAULTS[skill], target: 80, note: '', ...overrides }),
  selfcheck: (id, items, stamp, titleMore = 'Kas ma oskan?') => block(id, 'selfcheck', 'sky', '', { title: 'Kontrolli end.', titleMore, instruction: 'Märgi, mida juba oskad.', items: join(items), stamp }),
};
