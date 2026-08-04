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

function hasWorksheet(record) {
  return Boolean(record?.worksheetData?.blocks?.length);
}

export function curriculumType(record) {
  if (record?.examPart || record?.type === 'test') return 'test';
  if (hasWorksheet(record)) return 'worksheet';
  if (record?.type === 'hw') return 'homework';
  if (record?.type === 'material') return 'material';
  return 'lesson';
}

function libraryItem(kind, source) {
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
  return item;
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
