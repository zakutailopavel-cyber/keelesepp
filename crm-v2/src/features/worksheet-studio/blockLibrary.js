// „Kogu” — the task library of the constructor (owner 2026-10-13: „библиотеку материала, откуда по поиску вытаскивать
// блоки по темам, хэштеги: уровень A2, развитие разговорных навыков, тема моя семья”). Every task block of the course
// sheets (admin/course, A2…C1) with tags: level, skill, topic (module), lesson, phase. Search: words and #tags
// (Estonian, also Russian names of the skills), e.g. „#A2 #rääkimine #pere” or „#говорение семья”.
import { BLOCKS } from './engine/registry.js';

// the whole course as library entries; the course modules are big, so they are read only when needed
export async function loadCourseLibrary() {
  const { COURSE_MODULES, buildCourseSheet } = await import('../worksheet-generator/admin/course/registry.js');
  return buildLibrary(COURSE_MODULES, buildCourseSheet);
}

export const SKILLS = {
  rääkimine: 'Rääkimine', kirjutamine: 'Kirjutamine', lugemine: 'Lugemine', kuulamine: 'Kuulamine', grammatika: 'Grammatika', sõnavara: 'Sõnavara',
};
const SKILL_OF_TYPE = {
  speaking: 'rääkimine', rolecards: 'rääkimine', dialogue: 'rääkimine',
  writing: 'kirjutamine', guidedletter: 'kirjutamine', planning: 'kirjutamine', picrows: 'kirjutamine',
  reading: 'lugemine', cloze: 'lugemine', profiles: 'lugemine',
  listening: 'kuulamine', dictation: 'kuulamine',
  gaps: 'grammatika', wordforms: 'grammatika', transformation: 'grammatika', errorfix: 'grammatika', wordorder: 'grammatika', table: 'grammatika', diagram: 'grammatika',
  vocab: 'sõnavara', match: 'sõnavara', manymatch: 'sõnavara', categorize: 'sõnavara', crossword: 'sõnavara', translation: 'sõnavara', wordsearch: 'sõnavara', picmatch: 'sõnavara', scenelabel: 'sõnavara', clock: 'sõnavara',
};
// a choice / true-false task trains what its goal says
const SKILL_OF_GOAL = { g_read: 'lugemine', g_notice: 'grammatika', g_vocab: 'sõnavara', g_use: 'rääkimine' };
export const PHASE_TAG = { discover: 'avasta', practice: 'harjuta', transfer: 'kasuta' };

// Russian (and a few English) words for the tags, so the owner can search in Russian
const ALIASES = {
  говорение: 'rääkimine', разговор: 'rääkimine', разговорные: 'rääkimine', речь: 'rääkimine', speaking: 'rääkimine',
  письмо: 'kirjutamine', writing: 'kirjutamine', чтение: 'lugemine', reading: 'lugemine', аудирование: 'kuulamine', слушание: 'kuulamine', listening: 'kuulamine',
  грамматика: 'grammatika', grammar: 'grammatika', лексика: 'sõnavara', слова: 'sõnavara', vocabulary: 'sõnavara',
  семья: 'pere', работа: 'töö', еда: 'toit', магазин: 'pood', город: 'linn', дом: 'kodu', здоровье: 'tervis', погода: 'ilm', транспорт: 'transport', путешествие: 'reisimine',
  контроль: 'kontroll', экзамен: 'kontroll', тест: 'kontroll',
};

const words = (text) => String(text || '').toLocaleLowerCase('et').split(/[^\p{L}\d+-]+/u).filter((w) => w.length > 2);
const STOP = new Set(['ja', 'ning', 'või', 'kus', 'mis', 'kes', 'the', 'and']);
const plain = (value) => (typeof value === 'string' ? value : Array.isArray(value) ? value.map(plain).join(' ') : value && typeof value === 'object' ? Object.values(value).map(plain).join(' ') : '');

export function skillOf(block) {
  if (['choice', 'truefalse'].includes(block.type)) return SKILL_OF_GOAL[block.goal] || 'lugemine';
  return SKILL_OF_TYPE[block.type] || SKILL_OF_GOAL[block.goal] || '';
}

// one entry per task block of every course sheet
export function buildLibrary(modules, buildSheet) {
  const out = [];
  for (const mod of modules) {
    for (const lessonId of Object.keys(mod.LESSONS)) {
      for (const phase of Object.keys(PHASE_TAG)) {
        if (!mod.LESSONS[lessonId][phase]) continue;
        const doc = buildSheet(mod, lessonId, phase);
        const level = String(doc.meta?.level || mod.MODULE.level || '').toUpperCase();
        const topic = mod.MODULE.title || '';
        const lesson = doc.meta?.title || '';
        for (const block of doc.blocks) {
          // tasks only; a lesson's own self-check and rubric make no sense on another sheet
          if (!BLOCKS[block.type]?.task || ['selfcheck', 'rubric'].includes(block.type)) continue;
          const skill = skillOf(block);
          const tags = [...new Set([
            level.toLowerCase(), level.replace(/[+-]/g, '').toLowerCase(), skill, PHASE_TAG[phase], block.type,
            ...words(topic).filter((w) => !STOP.has(w)), ...words(lesson).filter((w) => !STOP.has(w)),
            ...(/kontroll|proovieksam|vahehindamine/i.test(lesson) ? ['kontroll'] : []),
          ].filter(Boolean))];
          out.push({
            key: `${lessonId}:${phase}:${block.id}`, lessonId, phase, level, skill, topic, lesson, block,
            title: block.data?.title || BLOCKS[block.type]?.label || block.type, label: BLOCKS[block.type]?.label || block.type,
            tags, text: `${plain(block.data)} ${topic} ${lesson}`.toLocaleLowerCase('et'),
          });
        }
      }
    }
  }
  return out;
}

// „#A2 #rääkimine pere” → every #tag must match a tag (prefix), every word must be in the text or the tags
export function parseQuery(query) {
  const parts = String(query || '').toLocaleLowerCase('et').split(/\s+/).filter(Boolean);
  const tags = []; const terms = [];
  for (const part of parts) {
    const raw = part.replace(/^#/, '');
    const word = ALIASES[raw] || raw;
    (part.startsWith('#') ? tags : terms).push(word);
  }
  return { tags, terms };
}

export function searchLibrary(entries, query, limit = 60) {
  const { tags, terms } = parseQuery(query);
  const hasTag = (entry, t) => entry.tags.some((tag) => tag === t || (t.length >= 3 && tag.startsWith(t)));
  const hits = entries.filter((entry) => tags.every((t) => hasTag(entry, t)) && terms.every((t) => hasTag(entry, t) || entry.text.includes(t)));
  return { total: hits.length, items: hits.slice(0, limit) };
}

// the tags offered as chips: levels and skills always, topics of the current hits
export function suggestedTags(entries, max = 14) {
  const count = new Map();
  entries.forEach((entry) => words(entry.topic).filter((w) => !STOP.has(w)).forEach((w) => count.set(w, (count.get(w) || 0) + 1)));
  return [...count].sort((a, b) => b[1] - a[1]).slice(0, max).map(([w]) => w);
}
