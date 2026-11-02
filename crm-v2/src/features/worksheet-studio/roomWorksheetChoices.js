import { publishedWorksheetDoc } from '../library/libraryModel.js';
import { displayDate } from '../finance/finance.js';

// What a teacher can put on the lesson board as a clickable worksheet: the student's own open worksheets (homework
// and personal sheets), the published Avasta / Harjuta / Kasuta sheets of the curriculum and older lesson sheets.

export const PHASES = [
  { id: 'discover', label: 'Avasta' },
  { id: 'practice', label: 'Harjuta' },
  { id: 'transfer', label: 'Kasuta' },
  { id: 'opik', label: 'Õpik' },
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
      detail: item.source === 'student_private_worksheet' ? 'Isiklik tööleht' : `Kodutöö${item.dueDate ? ` · tähtaeg ${displayDate(item.dueDate)}` : ''}`,
      level: item.level || '',
      search: norm(`${item.title} ${item.level} ${item.topic}`),
    }));
}

// what a teacher may remember of a lesson besides its title: the topic, the grammar, the goal, the module's goal
const aboutText = (lesson) => [lesson.topic, lesson.goal, lesson.roadmapModuleGoal, lesson.description]
  .map((value) => (typeof value === 'string' ? value : '')).join(' ').slice(0, 800);

// one line that reminds the teacher what the lesson teaches: the „Что учить:” line of the description (the words and
// forms), else the goal
export function lessonHint(lesson = {}) {
  const description = typeof lesson.description === 'string' ? lesson.description : '';
  const learn = description.split('\n').find((line) => /^\s*(Что учить|Mida õppida)\s*:/i.test(line));
  const text = (learn ? learn.replace(/^\s*[^:]+:\s*/, '') : typeof lesson.goal === 'string' ? lesson.goal : '').trim();
  return text.length > 110 ? `${text.slice(0, 107).trimEnd()}…` : text;
}

export function curriculumSheetChoices(lessons = []) {
  const choices = [];
  for (const lesson of lessons) {
    if (!lesson || lesson.__placeholder) continue;
    const module = lesson.roadmapModuleTitle || '';
    const number = Number(lesson.roadmapLessonNumber) || Number(lesson.order) || 0;
    const base = { level: lesson.level || '', module, lessonId: lesson.id, lessonTitle: lesson.title || '', number, subject: lesson.subject || '', topic: lesson.topic || '', about: norm(aboutText(lesson)), hint: lessonHint(lesson) };
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
  // the lesson number runs through the whole level, so it orders the course; module titles are words and sorting by
  // them first mixed the course up (owner 2026-10-19: lesson 5, then 16, …, 90, then 56)
  const numberRank = (choice) => choice.number || Number.MAX_SAFE_INTEGER;
  return choices.sort((a, b) => levelRank(a.level) - levelRank(b.level) || numberRank(a) - numberRank(b) || a.module.localeCompare(b.module, 'et', { numeric: true }) || phaseRank(a) - phaseRank(b) || a.title.localeCompare(b.title, 'et'));
}

export function filterChoices(choices = [], { query = '', level = '' } = {}) {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  return choices.filter((choice) => (!level || choice.level === level) && tokens.every((token) => choice.search.includes(token)));
}

// One row per lesson with its sheets (Avasta, Harjuta, Kasuta, Õpik): a teacher looks for a lesson, not for three
// sheets with the same title (owner 2026-11-02: „учитель не помнит всех тем и названий уроков”).
export function lessonRows(choices = []) {
  const rows = new Map();
  for (const choice of choices) {
    const row = rows.get(choice.lessonId) || { lessonId: choice.lessonId, level: choice.level, module: choice.module, number: choice.number, lessonTitle: choice.lessonTitle || choice.title, hint: choice.hint || '', about: choice.about || '', search: '', choices: [] };
    row.choices.push(choice);
    row.search = `${row.search} ${choice.search} ${choice.number || ''}`;
    rows.set(choice.lessonId, row);
  }
  return [...rows.values()];
}

// The search finds a lesson by its number, title, module or sheet titles first, then by what it is about (topic,
// grammar, goal), so „tingiv” or „kiri” finds lessons whose title does not say it.
export function findLessonRows(rows = [], { query = '', level = '' } = {}) {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  const inLevel = rows.filter((row) => !level || row.level === level);
  if (!tokens.length) return inLevel;
  const byName = [];
  const byContent = [];
  for (const row of inLevel) {
    if (tokens.every((token) => row.search.includes(token))) byName.push(row);
    else if (tokens.every((token) => row.search.includes(token) || row.about.includes(token))) byContent.push(row);
  }
  return [...byName, ...byContent];
}

// Lessons by module, in course order; with all levels shown a module is named with its level
export function moduleGroups(rows = [], { withLevel = false } = {}) {
  const groups = new Map();
  for (const row of rows) {
    const key = `${row.level}|${row.module}`;
    const group = groups.get(key) || { key, level: row.level, title: `${withLevel && row.level ? `${row.level} · ` : ''}${row.module || 'Muud tunnid'}`, rows: [] };
    group.rows.push(row);
    groups.set(key, group);
  }
  // „tunnid 21–25” tells where the module is in the course
  return [...groups.values()].map((group) => {
    const numbers = group.rows.map((row) => row.number).filter(Boolean);
    const first = Math.min(...numbers);
    const last = Math.max(...numbers);
    const range = !numbers.length ? '' : first === last ? `tund ${first}` : `tunnid ${first}–${last}`;
    return { ...group, range };
  });
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
    // only sheets worked on in a lesson room count as a held lesson; homework given ahead (e.g. Harjuta of the next
    // lessons) must not move the course forward (owner 2026-10-12: „5. Kontroll 1” suggested after lesson 1)
    ...assignments.filter((item) => item.liveRoomKey && index.has(item.lessonId)).map((item) => ({ id: item.lessonId, at: time(item.completedAt || item.assignedAt) })),
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
  // the sheets of a lesson often share a title, so a sheet on the board is known by its phase
  const placed = assignments.filter((item) => roomKey && item.liveRoomKey === roomKey && item.lessonId === next.lessonId);
  const onBoard = (choice) => placed.some((item) => (item.phase && choice.phase ? item.phase === choice.phase : item.title === choice.title));
  return {
    lessonId: next.lessonId, lessonTitle: next.lessonTitle, level: next.level, module: next.module, number: next.number,
    choices: curriculum.filter((choice) => choice.lessonId === next.lessonId && !onBoard(choice)),
  };
}
