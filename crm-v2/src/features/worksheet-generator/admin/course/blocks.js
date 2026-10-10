// Block builders for the KeeleSepp course sheets (B1 / B2, docs/B1_B2_COURSE_PRODUCTION.md). Each builder returns a
// Worksheet Studio block (engine/registry.js) with its answer key in the block's own contract. Ids are stable per
// lesson + phase + slot, so a republished sheet keeps the learners' answer keys.

const block = (id, type, tone, goal, data, width = 'full') => ({ id, type, width, span: width === 'full' ? 12 : 6, tone, goal, data });
const join = (v) => (Array.isArray(v) ? v.join('\n') : String(v || ''));

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
  gaps: (id, title, instruction, sentences, bank = '', width = 'full', goal = 'g_use') => block(id, 'gaps', 'blue', goal, {
    title, instruction, sentences: join(sentences), bank: Array.isArray(bank) ? bank.join(', ') : bank, showBank: bank ? 'yes' : 'no',
  }, width),
  match: (id, title, instruction, pairs, width = 'full', goal = 'g_vocab') => block(id, 'match', 'peach', goal, { title, instruction, pairs: pairs.map(([left, right]) => ({ left, right })) }, width),
  manymatch: (id, title, instruction, left, right, width = 'full', goal = 'g_use') => block(id, 'manymatch', 'peach', goal, { title, instruction, left: join(left), right: join(right) }, width),
  categorize: (id, title, instruction, groups, width = 'full', goal = 'g_use') => block(id, 'categorize', 'peach', goal, { title, instruction, groups: groups.map(([name, words]) => ({ name, words: Array.isArray(words) ? words.join(', ') : words })) }, width),
  wordforms: (id, title, instruction, rows, width = 'half', goal = 'g_use') => block(id, 'wordforms', 'blue', goal, { title, instruction, rows: rows.map(([base, prompt, answer]) => ({ base, prompt, answer })) }, width),
  errorfix: (id, title, instruction, rows, width = 'full', goal = 'g_use') => block(id, 'errorfix', 'peach', goal, { title, instruction, rows: rows.map(([wrong, answer]) => ({ wrong, answer })) }, width),
  transformation: (id, title, instruction, rows, width = 'full', goal = 'g_use') => block(id, 'transformation', 'blue', goal, { title, instruction, rows: rows.map(([from, prompt, answer]) => ({ from, prompt, answer })) }, width),
  wordorder: (id, title, instruction, sentences, width = 'half', goal = 'g_use') => block(id, 'wordorder', 'sky', goal, { title, instruction, sentences: join(sentences) }, width),
  clock: (id, title, instruction, items, goal = 'g_use') => block(id, 'clock', 'blue', goal, { title, instruction, columns: '3', items }),
  table: (id, title, instruction, headers, rows, goal = 'g_use') => block(id, 'table', 'blue', goal, { title, instruction, headers, rows: join(rows) }),
  translation: (id, title, instruction, rows, width = 'half', goal = 'g_use') => block(id, 'translation', 'cream', goal, { title, instruction, rows: rows.map((source) => ({ source, hint: '' })) }, width),
  dialogue: (id, title, instruction, speakerA, speakerB, lines, goal = 'g_use') => block(id, 'dialogue', 'green', goal, { title, instruction, speakerA, speakerB, lines: lines.map(([who, text]) => ({ who, text })) }),
  diagram: (id, kind, data, width = 'half', goal = 'g_notice') => block(id, 'diagram', 'white', goal, { kind, ...data }, width),
  crossword: (id, title, instruction, rows, width = 'half', goal = 'g_vocab') => block(id, 'crossword', 'cream', goal, { title, instruction, rows: rows.map(([clue, answer]) => ({ clue, answer })) }, width),
  // reading: questions [[q, answer|alternatives], …]; {{word}} marks a word of the lesson in the passage
  reading: (id, title, instruction, passageTitle, passage, questions, goal = 'g_read') => block(id, 'reading', 'cream', goal, {
    title, instruction, passageTitle, passage: join(passage), questions: questions.map(([q, a]) => (a ? `${q} [${a}]` : q)).join('\n'), lineWidth: 'wide',
  }),
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
  selfcheck: (id, items, stamp, titleMore = 'Kas ma oskan?') => block(id, 'selfcheck', 'sky', '', { title: 'Kontrolli end.', titleMore, instruction: 'Märgi, mida juba oskad.', items: join(items), stamp }),
};
