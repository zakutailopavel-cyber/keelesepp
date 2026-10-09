import { createBlock } from '../../worksheet-studio/engine/registry.js';
import { activityById } from './activityCatalog.js';
import { difficultySpec } from './difficulty.js';
import { sampleSeeded, shuffleSeeded } from './seed.js';

const clean = (value) => String(value ?? '').trim();
// „Poes” → „Poes.”, „Kus keegi on?” stays as it is
const withStop = (label) => (/[.!?…]$/.test(String(label).trim()) ? String(label).trim() : `${String(label).trim()}.`);
const escapeRegExp = (value) => String(value).replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');

function block(type, data, { id, goal }) {
  const created = createBlock(type);
  return { ...created, id, goal, data };
}

function hasFocus(item, focusIds) {
  return !focusIds.length || (item.focusIds || []).some((id) => focusIds.includes(id));
}

function contextMatches(item, contextId) {
  return !contextId || !(item.contextIds || []).length || item.contextIds.includes(contextId);
}

export function renderTemplate(template, seed) {
  let rendered = clean(template.text);
  Object.entries(template.slots || {}).forEach(([slot, values], index) => {
    const selected = sampleSeeded(values || [], 1, `${seed}:${template.id}:${slot}:${index}`)[0] || '';
    rendered = rendered.replaceAll(`{${slot}}`, selected);
  });
  return rendered;
}

function sentenceCandidates(profile, focusIds, contextId) {
  const all = (profile.banks?.sentences || []).filter((item) => hasFocus(item, focusIds));
  if (!contextId) return all;
  const preferred = all.filter((item) => contextMatches(item, contextId));
  const fallback = all.filter((item) => !preferred.includes(item));
  return [...preferred, ...fallback];
}

function takeSentences(profile, state, { focusIds, contextId, count, seed, allowReuse = false }) {
  const result = [];
  for (const item of shuffleSeeded(sentenceCandidates(profile, focusIds, contextId), seed)) {
    const rendered = renderTemplate(item, seed);
    if (!allowReuse && (state.usedSentenceIds.has(item.id) || state.usedRenderedSentences.has(rendered))) continue;
    if (!allowReuse) {
      state.usedSentenceIds.add(item.id);
      state.usedRenderedSentences.add(rendered);
    }
    result.push({ ...item, rendered });
    if (result.length === count) break;
  }
    return result;
}

function targetInSentence(sentence, profile, focusIds) {
  const words = (profile.activeVocabulary || [])
    .filter((item) => hasFocus(item, focusIds))
    .map((item) => item.word)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  return words.find((word) => new RegExp(`(^|\\s)${escapeRegExp(word)}(?=[.,!?;:]|\\s|$)`, 'iu').test(sentence)) || '';
}

// Pattern sentences know their exact answer (one occurrence, checked when the pattern was filled).
function knownAnswerGap(item) {
  if (!item?.answer) return '';
  const pattern = new RegExp(`(^|[^\\p{L}])(${escapeRegExp(item.answer)})(?=[^\\p{L}]|$)`, 'u');
  return pattern.test(item.rendered) ? item.rendered.replace(pattern, `$1[${item.answer}]`) : '';
}

function markGap(sentence, profile, focusIds) {
  const target = targetInSentence(sentence, profile, focusIds);
  if (!target) return '';
  return sentence.replace(new RegExp(escapeRegExp(target), 'iu'), `[${target}]`);
}

function vocabularyFor(profile, focusIds) {
  return (profile.activeVocabulary || []).filter((item) => hasFocus(item, focusIds));
}

function vocabularyPairs(profile, focusIds, count, seed) {
  return sampleSeeded(vocabularyFor(profile, focusIds).filter((item) => item.translation), count, seed)
    .map((item) => ({ left: item.word, right: item.translation }));
}

function focusGroups(profile, focusIds) {
  const vocab = vocabularyFor(profile, focusIds);
  return (profile.focuses || [])
    .filter((focus) => focusIds.includes(focus.id))
    .map((focus) => ({
      name: focus.label,
      words: vocab.filter((item) => (item.focusIds || []).includes(focus.id)).map((item) => item.word).join(', '),
    }))
    .filter((group) => group.words)
    .slice(0, 4);
}

function dialogueData(profile, focusIds, state, seed) {
  const item = shuffleSeeded(
    (profile.banks?.dialogues || []).filter((entry) => hasFocus(entry, focusIds) && !state.usedDialogueIds.has(entry.id)),
    seed,
  )[0];
  if (!item) return null;
  state.usedDialogueIds.add(item.id);
  return {
    title: 'Täida dialoog.',
    instruction: 'Kirjuta puuduvad sõnad.',
    speakerA: item.speakers?.[0] || 'A',
    speakerB: item.speakers?.[1] || 'B',
    lines: (item.lines || []).map(({ who, text }) => ({ who, text })),
  };
}

function meaningChoiceData(profile, focusIds, seed, spec) {
  const vocab = vocabularyFor(profile, focusIds).filter((item) => item.translation);
  const items = shuffleSeeded(vocab, seed).slice(0, spec.closedItemCount);
  const translations = vocab.map((item) => item.translation);
  const questions = items.map((item, index) => {
    const distractors = shuffleSeeded(translations.filter((value) => value !== item.translation), `${seed}:distractors:${index}`).slice(0, spec.distractorCount);
    const options = shuffleSeeded([
      { text: item.translation, correct: true },
      ...distractors.map((text) => ({ text, correct: false })),
    ], `${seed}:options:${index}`);
    return { q: `Mida tähendab „${item.word}“?`, options: options.map((option) => `${option.correct ? '*' : ''}${option.text}`).join('\n') };
  });
  return { title: 'Vali sobiv tähendus.', instruction: 'Vali üks õige vastus.', questions };
}

// Distractors of another part of speech cannot fit the gap grammatically, so the item keeps one correct answer
// ("___ isa töötab haiglas": tema / sinu would both be right). Same-type words only fill up a short list.
function gapDistractors(profile, focusIds, target, seed, count) {
  const vocab = vocabularyFor(profile, focusIds);
  const targetType = vocab.find((item) => item.word.toLocaleLowerCase('et') === target.toLocaleLowerCase('et'))?.lexicalType || '';
  const others = vocab.filter((item) => item.word.toLocaleLowerCase('et') !== target.toLocaleLowerCase('et'));
  const differentType = shuffleSeeded(others.filter((item) => !targetType || item.lexicalType !== targetType), `${seed}:other-type`);
  const sameType = shuffleSeeded(others.filter((item) => targetType && item.lexicalType === targetType), `${seed}:same-type`);
  return [...differentType, ...sameType].slice(0, count).map((item) => item.word);
}

function contextChoiceData(profile, focusIds, contextId, state, seed, spec) {
  const sentences = takeSentences(profile, state, { focusIds, contextId, count: 1, seed });
  const questions = sentences.map((item, index) => {
    const gapped = knownAnswerGap(item);
    if (gapped) {
      const distractors = sampleSeeded(item.distractors || [], spec.distractorCount, `${seed}:form-distractors:${index}`);
      const options = shuffleSeeded([{ text: item.answer, correct: true }, ...distractors.map((text) => ({ text, correct: false }))], `${seed}:options:${index}`);
      return { q: gapped.replace(`[${item.answer}]`, '___'), options: options.map((option) => `${option.correct ? '*' : ''}${option.text}`).join('\n') };
    }
    const target = targetInSentence(item.rendered, profile, focusIds);
    if (!target) return null;
    const q = item.rendered.replace(new RegExp(escapeRegExp(target), 'iu'), '___');
    const distractors = gapDistractors(profile, focusIds, target, `${seed}:distractors:${index}`, spec.distractorCount);
    const options = shuffleSeeded([
      { text: target, correct: true },
      ...distractors.map((text) => ({ text, correct: false })),
    ], `${seed}:options:${index}`);
    return { q, options: options.map((option) => `${option.correct ? '*' : ''}${option.text}`).join('\n') };
  }).filter(Boolean);
  return { title: 'Vali lausesse sobiv vorm.', instruction: 'Vali konteksti sobiv vastus.', questions };
}

function trueFalseData(profile, focusIds, contextId, state, seed) {
  const all = (profile.banks?.sentences || []).filter((item) => hasFocus(item, focusIds));
  const trueItems = all.filter((item) => contextMatches(item, contextId));
  const falseItems = all.filter((item) => (item.contextIds || []).length && !item.contextIds.includes(contextId));
  const truth = shuffleSeeded(trueItems, `${seed}:true`)[0];
  const falsehood = shuffleSeeded(falseItems, `${seed}:false`)[0];
  const selected = [
    truth ? { item: truth, answer: 'true' } : null,
    falsehood ? { item: falsehood, answer: 'false' } : null,
  ].filter(Boolean);
  selected.forEach(({ item }) => {
    state.usedSentenceIds.add(item.id);
    state.usedRenderedSentences.add(renderTemplate(item, seed));
  });
  // The learner must see the situation, otherwise "does it fit?" cannot be answered.
  const context = (profile.contexts || []).find((item) => item.id === contextId);
  return {
    title: 'Kas lause sobib olukorraga?',
    instruction: context?.label ? `Olukord: ${withStop(context.label)} Märgi Õ, kui lause sobib selle olukorraga, ja V, kui ei sobi.` : 'Märgi Õ või V.',
    statements: shuffleSeeded(selected, `${seed}:order`).map(({ item, answer }) => ({ text: renderTemplate(item, seed), answer })),
  };
}

function errorFixData(profile, focusIds, state, seed, spec) {
  const candidates = (profile.banks?.errorPairs || []).filter((item) =>
    hasFocus(item, focusIds) && !state.usedRenderedSentences.has(clean(item.correct)));
  const selected = sampleSeeded(candidates, spec.closedItemCount, seed);
  selected.forEach((item) => {
    if (clean(item.correct)) state.usedRenderedSentences.add(clean(item.correct));
  });
  const rows = selected.map((item) => ({ wrong: item.wrong, answer: item.correct }));
  return { title: 'Leia ja paranda viga.', instruction: 'Kirjuta lause õigesti.', rows };
}

function transformationData(profile, focusIds, state, seed, spec) {
  const candidates = (profile.banks?.transformations || []).filter((item) =>
    hasFocus(item, focusIds) && !state.usedRenderedSentences.has(clean(item.answer || item.to)));
  const selected = sampleSeeded(candidates, spec.closedItemCount, seed);
  selected.forEach((item) => {
    const answer = clean(item.answer || item.to);
    if (answer) state.usedRenderedSentences.add(answer);
  });
  return {
    title: 'Muuda lauseid.',
    instruction: 'Kirjuta uus lause juhise järgi.',
    rows: selected.map((item) => ({
      from: item.from || item.source || '',
      prompt: item.prompt || item.instruction || 'Muuda lauset.',
      answer: item.answer || item.to || '',
    })),
  };
}

function translationData(profile, focusIds, state, seed, spec) {
  const candidates = (profile.banks?.translations || []).filter((item) => hasFocus(item, focusIds) && !state.usedTranslationIds.has(item.id));
  const selected = sampleSeeded(candidates, spec.closedItemCount, seed);
  selected.forEach((item) => state.usedTranslationIds.add(item.id));
  return {
    title: 'Tõlgi eesti keelde.',
    instruction: 'Õpetaja kontrollib vastust.',
    // `alternatives` are accepted answers for the teacher; the block's hint is visible to the learner, so it stays empty.
    rows: selected.map((item) => ({ source: item.source, hint: '' })),
  };
}

function categorizeData(profile, focusIds) {
  const groups = focusGroups(profile, focusIds);
  const vocab = vocabularyFor(profile, focusIds);
  const splitAt = Math.ceil(vocab.length / 2);
  return {
    title: 'Sorteeri väljendid.',
    instruction: 'Paiguta sõnad õige fookuse alla.',
    groups: groups.length >= 2 ? groups : [
      { name: 'Põhiväljendid', words: vocab.slice(0, splitAt).map((item) => item.word).join(', ') },
      { name: 'Lisaväljendid', words: vocab.slice(splitAt).map((item) => item.word).join(', ') },
    ],
  };
}

function takeGapSentences(profile, state, { focusIds, contextId, count, seed }) {
  const result = [];
  for (const item of shuffleSeeded(sentenceCandidates(profile, focusIds, contextId), seed)) {
    const rendered = renderTemplate(item, seed);
    if (state.usedSentenceIds.has(item.id) || state.usedRenderedSentences.has(rendered)) continue;
    const candidate = { ...item, rendered };
    const marked = knownAnswerGap(candidate) || markGap(rendered, profile, focusIds);
    if (!marked) continue;
    state.usedSentenceIds.add(item.id);
    state.usedRenderedSentences.add(rendered);
    result.push({ ...candidate, marked });
    if (result.length === count) break;
  }
  return result;
}

function gapData(profile, focusIds, contextId, state, seed, spec) {
  // as many gap sentences as other closed tasks (support 2 / core 3 / challenge 4); only sentences with a findable
  // answer are taken, so no sentence is used up without becoming a gap
  const sentences = takeGapSentences(profile, state, { focusIds, contextId, count: spec.closedItemCount || 3, seed });
  const marked = sentences.map((item) => item.marked);
  // pattern sentences: the bank holds the right form and other forms of the same word (kooli / koolis / koolist)
  const formBank = sentences.every((item) => item.answer)
    ? shuffleSeeded([...new Set(sentences.flatMap((item) => [item.answer, ...(item.distractors || []).slice(0, 2)]))], `${seed}:form-bank`)
    : null;
  return {
    title: 'Täienda laused.',
    instruction: formBank ? 'Vali sõna õige vorm.' : 'Kasuta sobivat tunni väljendit.',
    bank: (formBank || vocabularyFor(profile, focusIds).map((item) => item.word)).join(', '),
    showBank: spec.showWordBank ? 'yes' : 'no',
    sentences: marked.join('\n'),
  };
}

function wordOrderData(profile, focusIds, contextId, state, seed) {
  const sentences = takeSentences(profile, state, { focusIds, contextId, count: 2, seed });
  return {
    title: 'Moodusta lause.',
    instruction: 'Pane sõnad õigesse järjekorda.',
    sentences: sentences.map((item) => item.rendered).join('\n'),
  };
}

function clockData(profile, contextId, seed, spec) {
  const context = (profile.contexts || []).find((item) => item.id === contextId) || {};
  const allTimes = (context.times || []).length ? context.times : (profile.contexts || []).flatMap((item) => item.times || []);
  return {
    title: 'Mis kell on?',
    instruction: 'Kirjuta kellaaeg eesti keeles.',
    columns: '3',
    items: sampleSeeded([...new Set(allTimes)], spec.clockItemCount, seed).map((time) => ({ time, extra: '' })),
  };
}

function readingData(profile, focusIds, contextId, state, seed) {
  const candidates = (profile.banks?.readingDocuments || []).filter((item) =>
    hasFocus(item, focusIds) &&
    contextMatches(item, contextId) &&
    !state.usedReadingIds.has(item.id));
  const fallback = (profile.banks?.readingDocuments || []).filter((item) =>
    hasFocus(item, focusIds) && !state.usedReadingIds.has(item.id));
  const item = shuffleSeeded(candidates.length ? candidates : fallback, seed)[0];
  if (!item) return null;
  state.usedReadingIds.add(item.id);
  return {
    title: 'Loe ja vasta.',
    instruction: 'Loe praktilist teksti. Vasta vähemalt viiele küsimusele teksti mõtte, mitte ainult sõnade järgi.',
    passageTitle: item.title || '',
    passage: item.passage,
    questions: item.questions,
    lineWidth: 'wide',
  };
}

function listeningData(profile, focusIds, contextId, state, seed) {
  const candidates = (profile.banks?.listeningScripts || []).filter((item) =>
    hasFocus(item, focusIds) &&
    contextMatches(item, contextId) &&
    !state.usedListeningIds.has(item.id));
  const fallback = (profile.banks?.listeningScripts || []).filter((item) =>
    hasFocus(item, focusIds) && !state.usedListeningIds.has(item.id));
  const item = shuffleSeeded(candidates.length ? candidates : fallback, seed)[0];
  if (!item) return null;
  state.usedListeningIds.add(item.id);
  return {
    title: item.title || 'Kuula ja täida.',
    instruction: 'Kuula õpetajat või helifaili ja täida puuduvad sõnad.',
    audio: null,
    sentences: item.sentences,
    transcript: item.transcript,
  };
}

function dictationData(profile, focusIds, contextId, state, seed) {
  const sentences = takeSentences(profile, state, { focusIds, contextId, count: 1, seed });
  return {
    title: 'Etteütlus.',
    instruction: 'Kuula õpetajat ja kirjuta laused.',
    sentences: sentences.map((item) => item.rendered).join('\n'),
    lines: Math.max(4, sentences.length * 2),
  };
}

function selectPrompt(profile, bankName, focusIds, contextId, seed) {
  const candidates = (profile.banks?.[bankName] || []).filter((item) => hasFocus(item, focusIds) && contextMatches(item, contextId));
  return shuffleSeeded(candidates, seed)[0] || shuffleSeeded((profile.banks?.[bankName] || []).filter((item) => hasFocus(item, focusIds)), `${seed}:fallback`)[0];
}

function transferData(activityId, profile, focusIds, contextId, seed, spec) {
  const vocab = vocabularyFor(profile, focusIds);
  const context = (profile.contexts || []).find((item) => item.id === contextId) || {};
  const criteria = profile.successCriteria || [];
  const speaking = selectPrompt(profile, 'speakingPrompts', focusIds, contextId, `${seed}:speaking`);
  const writing = selectPrompt(profile, 'writingPrompts', focusIds, contextId, `${seed}:writing`);

  if (activityId === 'transfer-rolecards') {
    return {
      title: 'Räägi õpetajaga.',
      instruction: 'Sina oled roll A, õpetaja on roll B. Leidke koos lahendus.',
      // the label is a free phrase („Poes”, „Kus keegi praegu on?”), so it stands on its own instead of inside a sentence
      roleA: context.label ? `Olukord: ${withStop(context.label)} Koosta plaan ja selgita oma valikuid.` : 'Koosta plaan ja selgita oma valikuid.',
      roleB: 'Küsi täpsustavaid küsimusi, muuda üht tingimust ja palu õpilasel oma plaani kohandada.',
      phrasesA: vocab.slice(0, 5).map((item) => item.word).join('\n'),
      phrasesB: vocab.slice(5).map((item) => item.word).join('\n'),
    };
  }
  if (activityId === 'transfer-speaking') {
    return {
      title: 'Räägi iseseisvalt.',
      instruction: 'Kasuta tunni sihtväljendeid ja põhjenda oma valikuid.',
      questions: speaking?.text || criteria[0] || 'Räägi teemast võimalikult täpselt.',
      img: null,
      aspect: '4:3',
      bubble: '',
      tipTitle: 'Kasuta',
      tipText: vocab.map((item) => item.word).join(', '),
      minSec: spec.speakingSeconds[0],
      maxSec: spec.speakingSeconds[1],
    };
  }
  if (activityId === 'transfer-planning') {
    return {
      title: 'Valmista vastus ette.',
      instruction: 'Pane enne rääkimist või kirjutamist põhiideed kirja.',
      prompts: 'Mis on sinu põhiidee?\nMilliseid tunni väljendeid kindlasti kasutad?\nMillise näite või põhjenduse lisad?\nKuidas lõpetad vastuse?',
      lines: spec.planningLines,
    };
  }
  if (activityId === 'transfer-problem-solving') {
    return {
      title: 'Lahenda olukord.',
      instruction: context.label ? `Olukord: ${withStop(context.label)} Mõtle läbi vähemalt kaks võimalust ja vali parem lahendus.` : 'Mõtle läbi vähemalt kaks võimalust ja vali parem lahendus.',
      prompts: 'Mis on probleem?\nMillised on vähemalt kaks võimalikku lahendust?\nMis on kummagi lahenduse pluss ja miinus?\nMillise lahenduse valid ja miks?\nMida teed, kui olukord muutub?',
      lines: Math.max(2, spec.planningLines),
    };
  }
  if (activityId === 'transfer-writing') {
    return {
      title: 'Kirjuta iseseisev tekst.',
      instruction: writing?.text || criteria[0] || 'Kirjuta teemast sidus tekst.',
      lines: 8,
      minSent: spec.writingSentences[0],
      maxSent: spec.writingSentences[1],
      keywords: vocab.map((item) => item.word).join(', '),
      minKeywords: Math.min(6, vocab.length),
      img: null,
    };
  }
  if (activityId === 'transfer-guided-letter') {
    return {
      title: 'Kirjuta terviklik kiri.',
      instruction: writing?.text || 'Kirjuta olukorrale sobiv kiri.',
      opening: 'Tere!',
      closing: 'Lugupidamisega',
      minWords: 120,
      maxWords: 160,
      lines: 16,
    };
  }
  if (activityId === 'transfer-rubric') {
    return { title: 'Kontrolli oma tööd.', instruction: 'Märgi punktid pärast ülesande lõpetamist.', items: criteria.join('\n') };
  }
  return {
    title: 'Kontrolli oma tööd.',
    titleMore: 'Kas ma oskan?',
    instruction: '',
    items: criteria.join('\n'),
    stamp: 'Ma kasutan tunni sihtkeelt iseseisvalt!',
  };
}

function materializeActivity({ activityId, profile, focusIds, contextId, seed, state, id, goal, spec }) {
  const activity = activityById(activityId);
  if (!activity) return null;
  let data = null;

  switch (activityId) {
    case 'discover-vocabulary-match':
      data = { title: 'Ühenda sõna ja tähendus.', instruction: 'Leia sobiv paar.', pairs: vocabularyPairs(profile, focusIds, 5, seed) };
      break;
    case 'discover-context-truefalse':
      data = trueFalseData(profile, focusIds, contextId, state, seed);
      break;
    case 'discover-focus-choice':
      data = meaningChoiceData(profile, focusIds, seed, spec);
      break;
    case 'discover-focus-categorize':
      data = { ...categorizeData(profile, focusIds), title: 'Märka sihtväljendeid.' };
      break;
    case 'discover-guided-dialogue':
      data = dialogueData(profile, focusIds, state, seed);
      break;
    case 'discover-selfcheck':
      data = { ...transferData('transfer-selfcheck', profile, focusIds, contextId, seed, spec), title: 'Kontrolli arusaamist.', titleMore: 'Kas ma märkan?', stamp: 'Ma märkan tunni põhifookust!' };
      break;
    case 'practice-gap-fill':
      data = gapData(profile, focusIds, contextId, state, seed, spec);
      break;
    case 'practice-context-choice':
      data = contextChoiceData(profile, focusIds, contextId, state, seed, spec);
      break;
    case 'practice-sentence-transformation':
      data = transformationData(profile, focusIds, state, seed, spec);
      break;
    case 'practice-error-repair':
      data = errorFixData(profile, focusIds, state, seed, spec);
      break;
    case 'practice-translation':
      data = translationData(profile, focusIds, state, seed, spec);
      break;
    case 'practice-word-order':
      data = wordOrderData(profile, focusIds, contextId, state, seed);
      break;
    case 'practice-clock':
      data = clockData(profile, contextId, seed, spec);
      break;
    case 'practice-focus-categorize':
      data = categorizeData(profile, focusIds);
      break;
    case 'practice-functional-reading':
      data = readingData(profile, focusIds, contextId, state, seed);
      break;
    case 'practice-listening-comprehension':
      data = listeningData(profile, focusIds, contextId, state, seed);
      break;
    case 'practice-dictation':
      data = dictationData(profile, focusIds, contextId, state, seed);
      break;
    case 'transfer-rolecards':
    case 'transfer-speaking':
    case 'transfer-planning':
    case 'transfer-problem-solving':
    case 'transfer-writing':
    case 'transfer-guided-letter':
    case 'transfer-rubric':
    case 'transfer-selfcheck':
      data = transferData(activityId, profile, focusIds, contextId, seed, spec);
      break;
    default:
      return null;
  }

  if (!data) return null;
  state.usedActivityIds.add(activityId);
  return block(activity.blockType, data, { id, goal });
}

export function materializePhase({ phase, profile, focusIds, contextId, seed, state, activityIds = [], difficulty = 'core', levelStage = '' }) {
  // the lesson's own stage (A2+, A2+/B1-) is more exact than the profile's level
  const spec = difficultySpec({ level: levelStage || profile?.level, mode: difficulty, phase });
  const goal = `focus:${focusIds[0] || profile.focuses?.[0]?.id || 'lesson'}`;
  const blocks = [];
  activityIds.forEach((activityId, index) => {
    const generated = materializeActivity({
      activityId,
      profile,
      focusIds,
      contextId,
      seed: `${seed}:${activityId}:${index}`,
      state,
      id: `gen_${phase}_${index + 1}`,
      goal,
      spec,
    });
    if (generated) blocks.push(generated);
  });
  return blocks;
}

export function createDiversityState() {
  return {
    usedSentenceIds: new Set(),
    usedRenderedSentences: new Set(),
    usedQuestionIds: new Set(),
    usedDialogueIds: new Set(),
    usedListeningIds: new Set(),
    usedReadingIds: new Set(),
    usedContextIds: new Set(),
    usedTranslationIds: new Set(),
    usedActivityIds: new Set(),
  };
}

export function materializeFullFocus({ activityPlan = {}, ...args }) {
  const state = args.state;
  const discoverIds = (activityPlan.discover || []).slice(0, 1);
  const practiceIds = (activityPlan.practice || []).slice(0, 2);
  const transferIds = (activityPlan.transfer || []).filter((id) => !id.endsWith('selfcheck') && !id.endsWith('rubric')).slice(0, 2);
  const discover = materializePhase({ ...args, phase: 'discover', state, activityIds: discoverIds });
  const practice = materializePhase({ ...args, phase: 'practice', state, activityIds: practiceIds });
  const transfer = materializePhase({ ...args, phase: 'transfer', state, activityIds: transferIds });
  return [...discover, ...practice, ...transfer].map((item, index) => ({ ...item, id: `gen_full_${index + 1}` }));
}
