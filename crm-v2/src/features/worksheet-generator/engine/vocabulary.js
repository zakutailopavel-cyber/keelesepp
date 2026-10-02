import { sampleSeeded } from './seed.js';

const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'];
const clean = (value) => String(value ?? '').trim();

export function normalizeLevel(value) {
  const match = clean(value).toLocaleUpperCase('et').match(/^(A1|A2|B1|B2|C1)([+-])?$/);
  return match ? { base: match[1], modifier: match[2] === '+' ? 'plus' : match[2] === '-' ? 'minus' : '' } : { base: '', modifier: '' };
}

export function normalizeLevelLexicon(source = {}) {
  if (Array.isArray(source)) return source.map((item) => typeof item === 'string' ? { word: clean(item), lexicalType: '', level: '' } : ({ word: clean(item.word || item.lemma), lexicalType: clean(item.lexicalType || item.type), level: normalizeLevel(item.level).base })).filter((item) => item.word);
  return Object.entries(source || {}).flatMap(([level, value]) => {
    if (Array.isArray(value)) return value.flatMap((item) => typeof item === 'string' ? [{ word: clean(item), lexicalType: '', level: normalizeLevel(level).base }] : [{ word: clean(item.word || item.lemma), lexicalType: clean(item.lexicalType || item.type), level: normalizeLevel(item.level || level).base }]);
    if (value && typeof value === 'object') return Object.entries(value).flatMap(([type, words]) => (Array.isArray(words) ? words.map((word) => ({ word: clean(typeof word === 'string' ? word : word.word || word.lemma), lexicalType: clean(type), level: normalizeLevel(level).base })) : []));
    return [];
  }).filter((item) => item.word);
}


export function inspectVocabularyLevel({ activeVocabulary = [], levelLexicon = [], level = '' } = {}) {
  const base = normalizeLevel(level).base;
  const ceiling = ORDER.indexOf(base);
  const normalized = normalizeLevelLexicon(levelLexicon).filter((item) => item.level);
  if (!normalized.length || ceiling < 0) return { knownCount: 0, aboveLevel: [], diagnostics: [] };

  const levelsByWord = new Map();
  normalized.forEach((item) => {
    const key = item.word.toLocaleLowerCase('et');
    if (!levelsByWord.has(key)) levelsByWord.set(key, new Set());
    levelsByWord.get(key).add(item.level);
  });

  let knownCount = 0;
  const aboveLevel = [];
  (activeVocabulary || []).forEach((item) => {
    const word = clean(item.word || item.lemma);
    if (!word) return;
    const levels = [...(levelsByWord.get(word.toLocaleLowerCase('et')) || [])];
    if (!levels.length) return;
    knownCount += 1;
    const ranks = levels.map((itemLevel) => ORDER.indexOf(itemLevel)).filter((rank) => rank >= 0);
    if (ranks.length && Math.min(...ranks) > ceiling) {
      aboveLevel.push({ word, levels: levels.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)) });
    }
  });

  const diagnostics = aboveLevel.length
    ? [{
        severity: 'warning',
        code: 'VOCAB_ABOVE_LEVEL',
        message: `Tasemesõnastik märgib ${aboveLevel.length} tunni sihtsõna kõrgemale kui ${base}: ${aboveLevel.slice(0, 5).map((item) => item.word).join(', ')}.`,
        words: aboveLevel,
      }]
    : [];

  return { knownCount, aboveLevel, diagnostics };
}

export function selectVocabulary({ activeVocabulary = [], levelLexicon = [], level = '', count = 12, seed = '' } = {}) {
  const base = normalizeLevel(level).base;
  const ceiling = ORDER.indexOf(base);
  const active = activeVocabulary.map((item) => ({ ...item, word: clean(item.word) })).filter((item) => item.word);
  const activeWords = new Set(active.map((item) => item.word.toLocaleLowerCase('et')));
  const safe = normalizeLevelLexicon(levelLexicon).filter((item) => !item.level || ceiling < 0 || ORDER.indexOf(item.level) <= ceiling).filter((item) => !activeWords.has(item.word.toLocaleLowerCase('et')));
  const selected = [...active, ...sampleSeeded(safe, Math.max(0, count - active.length), seed)].slice(0, count);
  return { items: selected, diagnostics: selected.length < count ? [{ severity: 'warning', code: 'VOCAB_INSUFFICIENT', message: `Sõnavaras on ${selected.length}/${count} sobivat sõna.` }] : [] };
}
