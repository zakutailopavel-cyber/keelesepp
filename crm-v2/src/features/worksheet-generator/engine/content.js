import { createBlock } from '../../worksheet-studio/engine/registry.js';
import { sampleSeeded, shuffleSeeded } from './seed.js';

const clean = (value) => String(value ?? '').trim();

function block(type, data, { id, goal }) {
  const created = createBlock(type);
  return { ...created, id, goal, data };
}

function hasFocus(item, focusIds) {
  return !focusIds.length || (item.focusIds || []).some((id) => focusIds.includes(id));
}

export function renderTemplate(template, seed) {
  let rendered = clean(template.text);
  Object.entries(template.slots || {}).forEach(([slot, values], index) => {
    const selected = sampleSeeded(values || [], 1, `${seed}:${template.id}:${slot}:${index}`)[0] || '';
    rendered = rendered.replaceAll(`{${slot}}`, selected);
  });
  return rendered;
}

function takeSentences(profile, state, { focusIds, contextId, count, seed }) {
  const candidates = (profile.banks?.sentences || []).filter((item) => hasFocus(item, focusIds) && (!contextId || !(item.contextIds || []).length || item.contextIds.includes(contextId)));
  const result = [];
  for (const item of shuffleSeeded(candidates, seed)) {
    const rendered = renderTemplate(item, seed);
    if (state.usedSentenceIds.has(item.id) || state.usedRenderedSentences.has(rendered)) continue;
    state.usedSentenceIds.add(item.id);
    state.usedRenderedSentences.add(rendered);
    result.push({ ...item, rendered });
    if (result.length === count) break;
  }
  return result;
}

function markGap(sentence, profile, focusIds) {
  const words = (profile.activeVocabulary || []).filter((item) => hasFocus(item, focusIds)).map((item) => item.word).sort((a, b) => b.length - a.length);
  const target = words.find((word) => new RegExp(`(^|\\s)${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[.,!?;:]|\\s|$)`, 'iu').test(sentence));
  if (!target) return `[${sentence}]`;
  return sentence.replace(new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'iu'), `[${target}]`);
}

function vocabularyPairs(profile, focusIds, count, seed) {
  return sampleSeeded((profile.activeVocabulary || []).filter((item) => item.translation && hasFocus(item, focusIds)), count, seed)
    .map((item) => ({ left: item.word, right: item.translation }));
}

function dialogueBlock(profile, focusIds, state, id, goal, seed) {
  const item = shuffleSeeded((profile.banks?.dialogues || []).filter((entry) => hasFocus(entry, focusIds) && !state.usedDialogueIds.has(entry.id)), seed)[0];
  if (!item) return null;
  state.usedDialogueIds.add(item.id);
  return block('dialogue', { title: 'Täida dialoog.', instruction: 'Kirjuta puuduvad sõnad.', speakerA: item.speakers?.[0] || 'A', speakerB: item.speakers?.[1] || 'B', lines: item.lines.map(({ who, text }) => ({ who, text })) }, { id, goal });
}

export function materializePhase({ phase, profile, focusIds, contextId, seed, state }) {
  const goal = `focus:${focusIds[0] || profile.focuses?.[0]?.id || 'lesson'}`;
  let sequence = 0;
  const make = (type, data) => block(type, data, { id: `gen_${phase}_${++sequence}`, goal });
  const sentenceCount = phase === 'practice' ? 4 : 3;
  const sentences = takeSentences(profile, state, { focusIds, contextId, count: sentenceCount, seed });
  const criteria = (profile.successCriteria || []).join('\n');
  const vocab = (profile.activeVocabulary || []).filter((item) => hasFocus(item, focusIds));

  if (phase === 'discover') {
    const pairs = vocabularyPairs(profile, focusIds, 5, `${seed}:pairs`);
    const focusGroups = (profile.focuses || []).filter((focus) => focusIds.includes(focus.id)).map((focus) => ({ name: focus.label, words: vocab.filter((item) => (item.focusIds || []).includes(focus.id)).map((item) => item.word).join(', ') })).filter((group) => group.words).slice(0, 4);
    const result = [
      make('match', { title: 'Ühenda sõna ja tähendus.', instruction: 'Leia sobiv paar.', pairs }),
      make('truefalse', { title: 'Kas lause sobib konteksti?', instruction: 'Märgi Õ või V.', statements: sentences.slice(0, 2).map((item) => ({ text: item.rendered, answer: 'true' })) }),
      make('categorize', { title: 'Märka ajamarkereid.', instruction: 'Paiguta sõnad õige fookuse alla.', groups: focusGroups }),
    ];
    const dialogue = dialogueBlock(profile, focusIds, state, `gen_${phase}_${++sequence}`, goal, seed);
    if (dialogue) result.push(dialogue);
    result.push(make('selfcheck', { title: 'Kontrolli arusaamist.', titleMore: 'Kas ma märkan?', instruction: '', items: criteria, stamp: 'Ma märkan tunni põhifookust!' }));
    return result;
  }

  if (phase === 'practice') {
    const errors = sampleSeeded((profile.banks?.errorPairs || []).filter((item) => hasFocus(item, focusIds)), 3, `${seed}:errors`);
    const translations = sampleSeeded((profile.banks?.translations || []).filter((item) => hasFocus(item, focusIds)), 3, `${seed}:translations`);
    const grouped = (profile.focuses || []).filter((focus) => focusIds.includes(focus.id)).slice(0, 4).map((focus) => ({ name: focus.label, words: vocab.filter((item) => (item.focusIds || []).includes(focus.id)).map((item) => item.word).join(', ') })).filter((group) => group.words);
    return [
      make('gaps', { title: 'Täienda laused.', instruction: 'Kasuta õiget ajamarkerit.', bank: vocab.map((item) => item.word).join(', '), showBank: 'yes', sentences: sentences.slice(0, 2).map((item) => markGap(item.rendered, profile, focusIds)).join('\n') }),
      make('errorfix', { title: 'Leia ja paranda viga.', instruction: 'Kirjuta lause õigesti.', rows: errors.map((item) => ({ wrong: item.wrong, answer: item.correct })) }),
      make('translation', { title: 'Tõlgi eesti keelde.', instruction: 'Õpetaja kontrollib vastust.', rows: translations.map((item) => ({ source: item.source, hint: item.alternatives?.join(' / ') || '' })) }),
      make('wordorder', { title: 'Moodusta lause.', instruction: 'Pane sõnad õigesse järjekorda.', sentences: (sentences.slice(2).length ? sentences.slice(2) : sentences.slice(0, 1)).map((item) => item.rendered).join('\n') }),
      make('categorize', { title: 'Sorteeri ajamarkerid.', instruction: 'Paiguta sõnad õige fookuse alla.', groups: grouped.length >= 2 ? grouped : [{ name: 'Ajamarkerid', words: vocab.slice(0, 5).map((item) => item.word).join(', ') }, { name: 'Järjekord', words: vocab.slice(5).map((item) => item.word).join(', ') }] }),
    ];
  }

  const speaking = shuffleSeeded((profile.banks?.speakingPrompts || []).filter((item) => hasFocus(item, focusIds)), `${seed}:speaking`)[0];
  const writing = shuffleSeeded((profile.banks?.writingPrompts || []).filter((item) => hasFocus(item, focusIds)), `${seed}:writing`)[0];
  const context = (profile.contexts || []).find((item) => item.id === contextId) || {};
  return [
    make('rolecards', { title: 'Planeerige päev koos.', instruction: 'Lugege rolli ja leidke ühine plaan.', roleA: `Koosta ${context.label || 'päeva'} plaan ja paku ajad.`, roleB: 'Küsi täpsustavaid küsimusi ning paku üks muudatus.', phrasesA: vocab.slice(0, 5).map((item) => item.word).join('\n'), phrasesB: vocab.slice(5).map((item) => item.word).join('\n') }),
    make('speaking', { title: 'Räägi oma plaanist.', instruction: 'Kasuta tunni ajamarkereid.', questions: speaking?.text || profile.successCriteria?.[0] || '', img: null, aspect: '4:3', bubble: '', tipTitle: 'Kasuta', tipText: vocab.map((item) => item.word).join(', '), minSec: 60, maxSec: 120 }),
    make('planning', { title: 'Valmista vastus ette.', instruction: 'Pane põhiideed kirja.', prompts: `Mis toimub kõigepealt?\nMida teed enne ja pärast?\nMis kell tegevused algavad ja lõpevad?`, lines: 2 }),
    make('writing', { title: 'Kirjuta päevaplaan.', instruction: writing?.text || 'Kirjuta oma päevast.', lines: 8, minSent: 6, maxSent: 10, keywords: vocab.map((item) => item.word).join(', '), minKeywords: Math.min(6, vocab.length), img: null }),
    make('selfcheck', { title: 'Kontrolli oma tööd.', titleMore: 'Kas ma oskan?', instruction: '', items: criteria, stamp: 'Ma kasutan ajamarkereid iseseisvalt!' }),
  ];
}

export function createDiversityState() {
  return { usedSentenceIds: new Set(), usedRenderedSentences: new Set(), usedQuestionIds: new Set(), usedDialogueIds: new Set(), usedContextIds: new Set(), usedTranslationIds: new Set() };
}

export function materializeFullFocus(args) {
  const state = args.state;
  const practice = materializePhase({ ...args, phase: 'practice', state }).slice(0, 2);
  const discover = materializePhase({ ...args, phase: 'discover', state }).slice(0, 1);
  const transfer = materializePhase({ ...args, phase: 'transfer', state }).slice(1, 3);
  return [...discover, ...practice, ...transfer].map((item, index) => ({ ...item, id: `gen_full_${index + 1}` }));
}
