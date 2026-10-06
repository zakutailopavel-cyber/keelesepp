export const LIBRARY_TYPES = Object.freeze({
  lesson: { label: 'Tunnikava', tone: 'success' },
  worksheet: { label: 'Tööleht', tone: 'info' },
  exercise: { label: 'Harjutus', tone: 'neutral' },
  test: { label: 'Kontrolltöö', tone: 'danger' },
  homework: { label: 'Kodutöö', tone: 'neutral' },
  material: { label: 'Materjal', tone: 'info' },
});

export const UNGROUPED_KEY = '__ungrouped__';
export const CURRICULUM_KEY_PREFIX = '__curriculum__:';

const normalize = (value) => String(value || '')
  .toLocaleLowerCase('et-EE')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim();

// The three core sheets of a curriculum lesson, from the summary the worksheet service keeps on the lesson.
export const LESSON_PHASES = Object.freeze([
  { id: 'discover', label: 'Avasta' },
  { id: 'practice', label: 'Harjuta' },
  { id: 'transfer', label: 'Kasuta' },
]);

export const PHASE_FILTERS = Object.freeze({
  none: 'Lehti pole',
  drafts: 'On mustandeid',
  partial: 'Osaliselt valmis',
  ready: 'Kõik valmis',
});

export function lessonPhases(source) {
  const summary = source?.worksheetPhases || {};
  return LESSON_PHASES.map(({ id, label }) => {
    const entry = summary[id];
    if (!entry) return { id, label, state: 'none', title: '', version: 0, publishedVersion: 0, updatedAt: '', newerDraft: false };
    const publishedVersion = Number(entry.publishedVersion) || 0;
    const version = Number(entry.version) || 0;
    return {
      id,
      label,
      state: publishedVersion ? 'published' : 'draft',
      title: String(entry.title || ''),
      version,
      publishedVersion,
      updatedAt: String(entry.updatedAt || ''),
      newerDraft: Boolean(publishedVersion) && entry.status !== 'published' && version > publishedVersion,
    };
  });
}

export const phasesDone = (phases) => phases.filter((phase) => phase.state === 'published').length;

export function matchesPhaseFilter(phases, filter) {
  if (!filter) return true;
  const done = phasesDone(phases);
  if (filter === 'none') return phases.every((phase) => phase.state === 'none');
  if (filter === 'drafts') return phases.some((phase) => phase.state === 'draft' || phase.newerDraft);
  if (filter === 'partial') return done > 0 && done < phases.length;
  if (filter === 'ready') return done === phases.length;
  return true;
}

// module heading: „Avasta 5/5 · Harjuta 0/5 · Kasuta 0/5” over the lessons that have the three phases
export function modulePhaseProgress(items) {
  const lessons = items.filter((item) => item.withPhases);
  if (!lessons.length) return '';
  return LESSON_PHASES.map(({ id, label }) => `${label} ${lessons.filter((item) => item.phases.find((phase) => phase.id === id)?.state === 'published').length}/${lessons.length}`).join(' · ');
}

export function publishedWorksheetDoc(record) {
  if (record?.worksheetDocStatus === 'draft') return record?.publishedWorksheetDoc?.blocks?.length ? record.publishedWorksheetDoc : null;
  return record?.publishedWorksheetDoc?.blocks?.length ? record.publishedWorksheetDoc : record?.worksheetDoc;
}

export function isUnpublishedWorksheet(record) {
  return Boolean(record?.worksheetDoc && record.worksheetDocStatus === 'draft' && !publishedWorksheetDoc(record));
}

function hasWorksheet(record) {
  const visualFields = (record?.files || []).flatMap((file) => file?.interactiveOverlay?.elements || [])
    .filter((element) => ['input', 'textarea', 'choice', 'checkbox'].includes(element?.type));
  return Boolean(record?.worksheetDoc || publishedWorksheetDoc(record)?.blocks?.length || record?.worksheetData?.blocks?.length || visualFields.length);
}

export function curriculumType(record) {
  // A Kontrolltöö stays a test even with a constructor worksheet (assignment still sends the worksheet, see library.assign).
  if (record?.examPart || record?.type === 'test') return 'test';
  if (record?.worksheetDoc) return 'worksheet';
  if (hasWorksheet(record)) return 'worksheet';
  if (record?.type === 'hw') return 'homework';
  if (record?.type === 'material') return 'material';
  return 'lesson';
}

function libraryItem(kind, source) {
  const publicDoc = publishedWorksheetDoc(source);
  if (publicDoc && publicDoc !== source.worksheetDoc) source = { ...source, worksheetDoc: publicDoc };
  const type = kind === 'exercise' ? 'exercise' : curriculumType(source);
  const description = source.description || source.builderObjectives || source.instruction || source.task || '';
  const item = {
    key: `${kind}:${source.id}`,
    sourceId: source.id,
    kind,
    type,
    typeLabel: LIBRARY_TYPES[type]?.label || 'Materjal',
    title: source.title || source.name || 'Pealkirjata õppematerjal',
    description,
    subject: source.subject || '',
    level: source.level || '',
    ageGroup: source.ageGroup || source.ageRange || source.targetAge || source.age || '',
    topic: source.topic || '',
    curriculumId: source.curriculumId || source.programId || source.planId || '',
    curriculum: source.curriculumTitle || source.curriculumName || source.programName || source.planTitle || '',
    examPart: source.examPart || '',
    source,
  };
  item.searchText = normalize([
    item.title,
    item.description,
    item.subject,
    item.level,
    item.ageGroup,
    item.topic,
    item.curriculum,
    item.typeLabel,
    source.lessonTypeLabel,
    ...(source.tags || []),
  ].join(' '));
  // table-of-contents position and "find by content" fields
  item.moduleNumber = Number(source.roadmapModuleNumber) || moduleNumberFromTitle(source.roadmapModuleTitle || source.topic);
  item.moduleTitle = source.roadmapModuleTitle || (String(source.topic || '').startsWith('__exam__') ? '' : source.topic) || '';
  item.moduleKey = item.moduleTitle ? `${item.level || '—'}|${item.moduleTitle}` : (item.examPart || String(source.topic || '').startsWith('__exam__') ? `${item.level || '—'}|__exam__` : `${item.level || '—'}|__other__`);
  // exam practice and loose materials come after the numbered modules of the level
  if (item.moduleKey.endsWith('|__exam__')) item.moduleNumber = 900;
  else if (item.moduleKey.endsWith('|__other__')) item.moduleNumber = 950;
  else if (!item.moduleNumber) item.moduleNumber = 800;
  item.lessonNumber = Number(source.roadmapLessonNumber) || Number(source.order) || 0;
  item.phases = lessonPhases(source);
  item.updatedAt = [String(source.worksheetDocUpdatedAt || source.updatedAt || source.createdAt || ''), ...item.phases.map((phase) => phase.updatedAt)].sort().at(-1);
  item.authorUid = source.authorUid || '';
  item.authorName = source.authorName || '';
  item.fileCount = (source.files || []).length;
  item.languageFocus = source.languageFocus || '';
  item.contentFields = contentFields(source);
  item.contentText = normalize(item.contentFields.map(([, text]) => text).join(' '));
  return item;
}

function moduleNumberFromTitle(title) {
  const match = String(title || '').match(/^\s*(\d{1,3})[.)]/);
  return match ? Number(match[1]) : 0;
}

const SKIP_KEYS = new Set(['img', 'image', 'src', 'url', 'id', 'type', 'width', 'tone', 'goal', 'answer', 'answers', 'color', 'focus', 'schema']);

function collectStrings(value, out, depth = 0) {
  if (out.length > 400 || depth > 8 || value == null) return;
  if (typeof value === 'string') { if (value.trim().length > 1 && !value.startsWith('data:') && !/^https?:/.test(value)) out.push(value); return; }
  if (Array.isArray(value)) { value.forEach((entry) => collectStrings(entry, out, depth + 1)); return; }
  if (typeof value === 'object') for (const [key, entry] of Object.entries(value)) if (!SKIP_KEYS.has(key)) collectStrings(entry, out, depth + 1);
}

// Text a teacher remembers from a lesson or worksheet: focus, goals, tasks and the worksheet itself.
function contentFields(source) {
  const fields = [
    ['Keelefookus', source.languageFocus],
    ['Eesmärk', source.goal || source.builderObjectives],
    ['Harjutamine', source.practice],
    ['Edukriteeriumid', source.successCriteria],
    ['Moodul', source.roadmapModuleTitle],
  ].filter(([, text]) => text);
  for (const doc of [source.worksheetDoc, source.worksheetData]) {
    if (!doc) continue;
    const strings = [];
    collectStrings({ meta: doc.meta, blocks: doc.blocks }, strings);
    if (strings.length) fields.push(['Tööleht', strings.join(' · ')]);
  }
  return fields.map(([label, text]) => [label, String(text)]);
}

export const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const levelRank = (level) => { const i = LEVEL_ORDER.indexOf(String(level || '').toUpperCase()); return i === -1 ? 99 : i; };

function snippetFor(item, tokens) {
  for (const [label, text] of item.contentFields || []) {
    const norm = normalize(text);
    const at = tokens.map((token) => norm.indexOf(token)).filter((index) => index >= 0).sort((a, b) => a - b)[0];
    if (at === undefined) continue;
    const start = Math.max(0, at - 40);
    const piece = text.slice(start, start + 140).replace(/\s+/g, ' ').trim();
    return { label, text: `${start ? '…' : ''}${piece}${start + 140 < text.length ? '…' : ''}` };
  }
  return null;
}

// Instant search over everything: every word must match the title/meta or the lesson content.
export function searchLibrary(items, { query = '', level = '', module = '', type = '', favorites = null, mineUid = '' } = {}) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const results = [];
  for (const item of items) {
    if (level && (item.level || '—') !== level) continue;
    if (module && item.moduleKey !== module) continue;
    if (type && item.type !== type) continue;
    if (favorites && !favorites.has(item.key)) continue;
    if (mineUid && item.authorUid !== mineUid) continue;
    if (!tokens.length) { results.push({ item, score: 0, snippet: null }); continue; }
    let score = 0;
    let ok = true;
    for (const token of tokens) {
      const inTitle = normalize(item.title).includes(token);
      const inMeta = item.searchText.includes(token);
      const inContent = item.contentText.includes(token);
      if (!inMeta && !inContent) { ok = false; break; }
      score += inTitle ? 10 : inMeta ? 5 : 1;
    }
    if (!ok) continue;
    const titleOnly = tokens.every((token) => item.searchText.includes(token));
    results.push({ item, score, snippet: titleOnly ? null : snippetFor(item, tokens) });
  }
  return results;
}

export function sortLibrary(results, sort = 'toc') {
  const list = [...results];
  const byToc = (a, b) => levelRank(a.item.level) - levelRank(b.item.level)
    || (a.item.moduleNumber || 999) - (b.item.moduleNumber || 999)
    || a.item.moduleTitle.localeCompare(b.item.moduleTitle, 'et')
    || (a.item.lessonNumber || 999) - (b.item.lessonNumber || 999)
    || a.item.title.localeCompare(b.item.title, 'et', { numeric: true });
  if (sort === 'recent') return list.sort((a, b) => b.item.updatedAt.localeCompare(a.item.updatedAt) || byToc(a, b));
  if (sort === 'title') return list.sort((a, b) => a.item.title.localeCompare(b.item.title, 'et', { numeric: true }));
  if (sort === 'relevance') return list.sort((a, b) => b.score - a.score || byToc(a, b));
  return list.sort(byToc);
}

export function levelFacets(items) {
  const counts = new Map();
  for (const item of items) counts.set(item.level || '—', (counts.get(item.level || '—') || 0) + 1);
  return [...counts.entries()].map(([key, count]) => ({ key, label: key === '—' ? 'Tasemeta' : key, count }))
    .sort((a, b) => levelRank(a.key) - levelRank(b.key) || a.label.localeCompare(b.label, 'et'));
}

export function moduleLabel(key, item) {
  if (key.endsWith('|__exam__')) return 'Eksamiks harjutamine';
  if (key.endsWith('|__other__')) return 'Muud materjalid';
  return item?.moduleTitle || key.split('|').slice(1).join('|');
}

export function moduleFacets(items) {
  const groups = new Map();
  for (const item of items) {
    if (!groups.has(item.moduleKey)) groups.set(item.moduleKey, { key: item.moduleKey, label: moduleLabel(item.moduleKey, item), level: item.level || '—', number: item.moduleNumber || 999, count: 0 });
    groups.get(item.moduleKey).count += 1;
  }
  return [...groups.values()].sort((a, b) => levelRank(a.level) - levelRank(b.level) || a.number - b.number || a.label.localeCompare(b.label, 'et', { numeric: true }));
}

export function typeFacets(items) {
  const counts = new Map();
  for (const item of items) counts.set(item.type, (counts.get(item.type) || 0) + 1);
  return Object.keys(LIBRARY_TYPES).filter((key) => counts.has(key)).map((key) => ({ key, label: LIBRARY_TYPES[key].label, count: counts.get(key) }));
}

// consecutive results of the same module form one section of the table of contents
export function sectionsByModule(results) {
  const sections = [];
  for (const result of results) {
    const last = sections[sections.length - 1];
    if (last && last.key === result.item.moduleKey) last.results.push(result);
    else sections.push({ key: result.item.moduleKey, level: result.item.level, label: moduleLabel(result.item.moduleKey, result.item), results: [result] });
  }
  return sections;
}

export function buildLibraryItems(curriculumLessons = [], exercises = []) {
  return [
    ...curriculumLessons.filter((item) => item && !item.__placeholder).map((item) => libraryItem('curriculum', item)),
    ...exercises.filter(Boolean).map((item) => libraryItem('exercise', item)),
  ];
}

export function filterLibraryItems(items, { query = '', type = 'all' } = {}) {
  const normalizedQuery = normalize(query);
  return items.filter((item) => (
    (type === 'all' || item.type === type)
    && (!normalizedQuery || item.searchText.includes(normalizedQuery))
  ));
}

export function groupKeyForItem(item, dimension) {
  if (dimension === 'subject') return item.subject?.trim() || UNGROUPED_KEY;
  if (dimension === 'stage') return (item.level || item.ageGroup)?.trim() || UNGROUPED_KEY;
  if (dimension === 'topic') {
    if (item.curriculumId) return `${CURRICULUM_KEY_PREFIX}${item.curriculumId}`;
    const topic = (item.curriculum || item.topic)?.trim();
    if (topic?.startsWith('__exam__')) return `__exam__:${topic.replace(/^__exam__:?_*/, '')}`;
    if (topic) return topic;
    if (item.examPart) return `__exam__:${item.examPart}`;
    const examTag = item.source?.tags?.find((tag) => String(tag).startsWith('__exam__'));
    if (examTag) return `__exam__:${String(examTag).replace(/^__exam__:?_*/, '')}`;
    return UNGROUPED_KEY;
  }
  return UNGROUPED_KEY;
}

export function groupLabel(dimension, key, item) {
  if (key === UNGROUPED_KEY) {
    if (dimension === 'subject') return 'Muu õppevara';
    if (dimension === 'stage') return 'Määramata tase või vanus';
    return 'Üldised materjalid';
  }
  if (key.startsWith('__exam__:')) {
    const exam = key.slice('__exam__:'.length).replaceAll('_', ' ');
    return `Eksam: ${exam ? exam.charAt(0).toLocaleUpperCase('et-EE') + exam.slice(1) : 'üldine'}`;
  }
  if (key.startsWith(CURRICULUM_KEY_PREFIX)) return item?.curriculum || item?.topic || 'Õppekava';
  return key;
}

export function groupLibraryItems(items, dimension) {
  const groups = new Map();
  for (const item of items) {
    const key = groupKeyForItem(item, dimension);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.entries()]
    .map(([key, groupItems]) => ({
      key,
      label: groupLabel(dimension, key, groupItems[0]),
      count: groupItems.length,
      items: groupItems,
    }))
    .sort((left, right) => {
      if (left.key === UNGROUPED_KEY) return 1;
      if (right.key === UNGROUPED_KEY) return -1;
      return left.label.localeCompare(right.label, 'et', { numeric: true, sensitivity: 'base' });
    });
}

export function itemsInLibraryPath(items, path = {}) {
  return items.filter((item) => (
    (!path.subject || groupKeyForItem(item, 'subject') === path.subject)
    && (!path.stage || groupKeyForItem(item, 'stage') === path.stage)
    && (!path.topic || groupKeyForItem(item, 'topic') === path.topic)
  ));
}

export function pathDimension(path) {
  if (!path.subject) return 'subject';
  if (!path.stage) return 'stage';
  if (!path.topic) return 'topic';
  return null;
}
