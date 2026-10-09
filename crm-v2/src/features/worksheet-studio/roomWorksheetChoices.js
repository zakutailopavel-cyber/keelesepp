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
