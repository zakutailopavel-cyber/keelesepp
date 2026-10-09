// Homework list order and housekeeping: what is late comes first, closed work goes last, and tasks overdue for a
// long time can be closed in one go so the list shows what really needs doing.
import { isHomeworkOpen } from './homeworkStatus.js';

export const STALE_DAYS = 30;
const DAY = 24 * 60 * 60 * 1000;
const dayMs = (iso) => Date.parse(`${iso}T12:00:00`);

export const isOverdue = (item, today) => isHomeworkOpen(item) && Boolean(item?.due) && item.due < today;

// open late (oldest due first) → open (nearest due first, no due date last) → done / closed (newest first)
export function sortHomework(items = [], today = new Date().toISOString().slice(0, 10)) {
  const rank = (item) => (isOverdue(item, today) ? 0 : isHomeworkOpen(item) ? 1 : 2);
  return [...items].sort((a, b) => rank(a) - rank(b)
    || (rank(a) === 2
      ? String(b.submittedAt || b.updatedAt || b.date || '').localeCompare(String(a.submittedAt || a.updatedAt || a.date || ''))
      : String(a.due || '9999').localeCompare(String(b.due || '9999'))));
}

// open tasks whose due date passed more than `days` ago
export function staleHomework(items = [], today = new Date().toISOString().slice(0, 10), days = STALE_DAYS) {
  const limit = dayMs(today) - days * DAY;
  return items.filter((item) => isHomeworkOpen(item) && item.due && dayMs(item.due) < limit);
}

// a task the student finishes themselves (no interactive exercise that closes itself)
export const selfCompleted = (item) => !(item?.isExercise && item?.exerciseId);

// the quick „Kinnita” in the review list only for good results; a low grade is given after opening the work
export const QUICK_MIN_GRADE = 3;
