// Builds a complete generator profile for a lesson from grammar patterns + the Vabamorf lexicon, so a lesson whose
// roadmap focus is a covered grammar point becomes ready without hand-written sentences. Hand-written Content Packs
// still take precedence (factory.js); this is the fallback for lessons that have none.
import { lexeme } from '../lexicon/index.js';
import { hashSeed } from '../engine/seed.js';
import { sanitizeGeneratorProfile } from '../profiles/authoring.js';
import { generatePatternSentences } from './engine.js';
import { GRAMMAR_POINTS } from './grammarPatterns.js';

export const PATTERN_PROFILE_SOURCE = 'patterns/1';
const SENTENCES_PER_POINT = 12;
const ERROR_PAIRS_PER_POINT = 4;
const LEXICAL_TYPE = { noun: 'noun', adj: 'adjective', verb: 'verb' };

const safeId = (prefix, value) => `${prefix}-${hashSeed(value).toString(36)}`;

function vocabularyFrom(sentences, focusId) {
  const seen = new Set();
  const out = [];
  sentences.forEach((sentence) => Object.values(sentence.lemmas).forEach((lemma) => {
    const entry = lexeme(lemma);
    if (!entry || entry.pos === 'name' || seen.has(entry.lemma)) return;
    seen.add(entry.lemma);
    out.push({ id: safeId('pv', `${focusId}:${entry.lemma}`), word: entry.lemma, translation: entry.ru, lexicalType: LEXICAL_TYPE[entry.pos] || 'other', focusIds: [focusId] });
  }));
  return out.slice(0, 20);
}

// Wrong version of a pattern sentence: the target replaced by its first same-word distractor.
function errorPairOf(sentence, focusId) {
  const wrong = sentence.gapped.replace(`[${sentence.answer}]`, sentence.distractors[0]);
  return { id: safeId('pe', sentence.id), focusIds: [focusId], wrong: wrong.charAt(0).toLocaleUpperCase('et') + wrong.slice(1), correct: sentence.text };
}

export function canBuildPatternProfile(grammarIds = []) {
  return grammarIds.length > 0 && grammarIds.every((id) => GRAMMAR_POINTS[id]);
}

export function createPatternProfile(lesson = {}, grammarIds = [], { seed = lesson.id || 'lesson' } = {}) {
  if (!canBuildPatternProfile(grammarIds)) return null;
  const focuses = [];
  const contexts = [];
  const vocabulary = [];
  const sentences = [];
  const errorPairs = [];
  const speakingPrompts = [];
  const writingPrompts = [];
  const successCriteria = [];
  const used = [];

  grammarIds.forEach((grammar) => {
    const point = GRAMMAR_POINTS[grammar];
    const focusId = `gp-${grammar}`;
    const generated = generatePatternSentences({ grammar, count: SENTENCES_PER_POINT, seed: `${seed}:${grammar}`, exclude: used });
    const repairs = generatePatternSentences({ grammar, count: ERROR_PAIRS_PER_POINT, seed: `${seed}:${grammar}:errors`, exclude: [...used, ...generated.map((item) => item.id)] });
    used.push(...generated.map((item) => item.id), ...repairs.map((item) => item.id));
    focuses.push({ id: focusId, type: 'grammar', label: point.label, patterns: generated.slice(0, 3).map((item) => item.text), aliases: point.aliases });
    point.contexts.forEach(([id, label]) => contexts.push({ id, label, tags: [grammar], names: [], times: [] }));
    vocabulary.push(...vocabularyFrom(generated, focusId));
    generated.forEach((item, index) => sentences.push({
      id: safeId('ps', item.id), focusIds: [focusId], contextIds: item.context ? [item.context] : [], difficulty: 1 + (index % 2),
      text: item.text, slots: {}, answer: item.answer, distractors: item.distractors,
    }));
    errorPairs.push(...repairs.map((item) => errorPairOf(item, focusId)));
    speakingPrompts.push({ id: `${focusId}-sp`, focusIds: [focusId], contextIds: [point.contexts[0][0]], text: point.speakingPrompt });
    writingPrompts.push({ id: `${focusId}-wp`, focusIds: [focusId], contextIds: [point.contexts[0][0]], text: point.writingPrompt });
    successCriteria.push(point.successCriteria);
  });

  return sanitizeGeneratorProfile({
    lessonId: lesson.id,
    lessonKind: lesson.roadmapKind || lesson.kind,
    level: lesson.levelStage || lesson.level || 'A2',
    title: lesson.title || lesson.id,
    source: PATTERN_PROFILE_SOURCE,
    focuses,
    activeVocabulary: vocabulary,
    contexts,
    banks: { sentences, dialogues: [], errorPairs, translations: [], speakingPrompts, writingPrompts },
    successCriteria,
  }, { lessonId: lesson.id, lesson });
}
