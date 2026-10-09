import { publishedWorksheetDoc } from '../library/libraryModel.js';

// What a teacher can put on the lesson board as a clickable worksheet: the student's own open worksheets (homework
// and personal sheets), the published Avasta / Harjuta / Kasuta sheets of the curriculum and older lesson sheets.

export const PHASES = [
  { id: 'discover', label: 'Avasta' },
  { id: 'practice', label: 'Harjuta' },
  { id: 'transfer', label: 'Kasuta' },
];

// the room key a worksheet carries while the teacher prepares the lesson before inviting (taken over by the room)
export const prepRoomKey = (studentId) => `prep_${studentId}`;

const norm = (value) => String(value || '').toLocaleLowerCase('et').normalize('NFD').replace(/[̀-ͯ]/g, '');

export function studentSheetChoices(assignments = [], roomKey = '') {
  return assignments
    .filter((item) => item.worksheetDoc?.blocks?.length && item.status !== 'done' && item.liveRoomKey !== roomKey)
    .map((item) => ({
      key: `assignment:${item.id}`,
      kind: 'assignment',
      assignmentId: item.id,
      title: item.title || 'Tööleht',
      detail: item.source === 'student_private_worksheet' ? 'Isiklik tööleht' : `Kodutöö${item.dueDate ? ` · tähtaeg ${item.dueDate}` : ''}`,
      level: item.level || '',
      search: norm(`${item.title} ${item.level} ${item.topic}`),
    }));
}

export function curriculumSheetChoices(lessons = []) {
  const choices = [];
  for (const lesson of lessons) {
    if (!lesson || lesson.__placeholder) continue;
    const module = lesson.roadmapModuleTitle || '';
    const number = Number(lesson.roadmapLessonNumber) || Number(lesson.order) || 0;
    const base = { level: lesson.level || '', module, lessonId: lesson.id, lessonTitle: lesson.title || '', number, subject: lesson.subject || '', topic: lesson.topic || '' };
    let hasPhase = false;
    for (const phase of PHASES) {
      const summary = lesson.worksheetPhases?.[phase.id];
      if (!(Number(summary?.publishedVersion) > 0)) continue;
      hasPhase = true;
      const title = summary.title || `${lesson.title} — ${phase.label}`;
      choices.push({ ...base, key: `phase:${lesson.id}:${phase.id}`, kind: 'phase', phase: phase.id, phaseLabel: phase.label, title, detail: `${number ? `${number}. ` : ''}${lesson.title} · ${phase.label}`, search: norm(`${title} ${lesson.title} ${module} ${lesson.level} ${phase.label}`) });
    }
    const legacy = publishedWorksheetDoc(lesson);
    if (!hasPhase && legacy?.blocks?.length) {
      const title = legacy.meta?.title || lesson.title || 'Tööleht';
      choices.push({ ...base, key: `lesson:${lesson.id}`, kind: 'lesson', title, detail: `${number ? `${number}. ` : ''}${lesson.title}${module ? ` · ${module}` : ''}`, search: norm(`${title} ${lesson.title} ${module} ${lesson.level}`), lesson });
    }
  }
  const levelRank = (level) => ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(String(level).toUpperCase()) + 1 || 99;
  const phaseRank = (choice) => PHASES.findIndex((phase) => phase.id === choice.phase);
  return choices.sort((a, b) => levelRank(a.level) - levelRank(b.level) || a.module.localeCompare(b.module, 'et', { numeric: true }) || a.number - b.number || phaseRank(a) - phaseRank(b) || a.title.localeCompare(b.title, 'et'));
}

export function filterChoices(choices = [], { query = '', level = '' } = {}) {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  return choices.filter((choice) => (!level || choice.level === level) && tokens.every((token) => choice.search.includes(token)));
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const time = (value) => {
  const t = Date.parse(String(value || '').length === 10 ? `${value}T12:00:00` : value || '');
  return Number.isFinite(t) ? t : 0;
};

// The student's next curriculum lesson with sheets: the one after the latest lesson they did — marked in the journal
// (`topicLessonId`) or worked on as a worksheet (`lessonId`) — at the same level; otherwise the first lesson of their
// level. Returns { lessonId, lessonTitle, level, module, number, choices: [its phase sheets not on this board] } or null.
export function nextLessonSuggestion({ curriculum = [], lessonRecords = [], assignments = [], studentLevel = '', roomKey = '' } = {}) {
  const order = [...new Map(curriculum.map((choice) => [choice.lessonId, choice])).values()];
  if (!order.length) return null;
  const index = new Map(order.map((choice, i) => [choice.lessonId, i]));
  const seen = [
    ...lessonRecords.filter((record) => (!record.status || record.status === 'Toimunud') && index.has(record.topicLessonId)).map((record) => ({ id: record.topicLessonId, at: time(record.date) })),
    ...assignments.filter((item) => index.has(item.lessonId)).map((item) => ({ id: item.lessonId, at: time(item.completedAt || item.assignedAt) })),
  ].sort((a, b) => b.at - a.at || index.get(b.id) - index.get(a.id));
  let next = null;
  if (seen.length) {
    const last = order[index.get(seen[0].id)];
    const following = order[index.get(last.lessonId) + 1];
    next = following && following.level === last.level ? following : null;
  } else {
    const level = LEVELS.includes(String(studentLevel).toUpperCase()) ? String(studentLevel).toUpperCase() : '';
    next = order.find((choice) => !level || choice.level === level) || null;
  }
  if (!next) return null;
  const onBoard = new Set(assignments.filter((item) => roomKey && item.liveRoomKey === roomKey && item.lessonId === next.lessonId).map((item) => item.title));
  return {
    lessonId: next.lessonId, lessonTitle: next.lessonTitle, level: next.level, module: next.module, number: next.number,
    choices: curriculum.filter((choice) => choice.lessonId === next.lessonId && !onBoard.has(choice.title)),
  };
}
