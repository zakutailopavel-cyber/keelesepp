// „Как дела у ребёнка?” (owner 2026-11-01): what the first screen of „Minu pere” says about one child, in order: the next
// lesson, what the child should do now and whether it is done, the teacher's latest words. Pure: the page passes what it read.
import { TASK_STATE, groupTasks, isTaskLate, mergeTasks } from '../homework/taskList.js';
import { nextLesson } from '../pet/petLife.js';
import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';
import { tallinnLocal } from '../calendar/unmarkedLessons.js';

const clean = (value) => String(value ?? '').trim();
const time = (value) => Date.parse(value || '') || 0;

// the newest thing the teacher said: a reviewed work (comment or grade) or the note of a held lesson; exactly as written
export function latestFeedback({ submissions = [], lessons = [] } = {}) {
  const works = submissions
    .filter((item) => item.reviewStatus === 'reviewed' && (clean(item.teacherFeedback) || clean(item.teacherGrade)))
    .map((item) => ({ key: `work-${item.id}`, text: clean(item.teacherFeedback), grade: clean(item.teacherGrade), about: clean(item.title).replace(/\s*·\s*(Avasta|Harjuta|Kasuta|Õpik)\s*$/, ''), at: time(item.reviewedAt || item.completedAt), date: String(item.reviewedAt || item.completedAt || '').slice(0, 10) }));
  const notes = lessons
    .filter((item) => clean(item.notes) && (!item.status || item.status === 'Toimunud'))
    .map((item) => ({ key: `lesson-${item.id}`, text: clean(item.notes), grade: '', about: clean(item.topic), at: time(`${item.date}T${item.time || '12:00'}:00`), date: String(item.date || '').slice(0, 10) }));
  return [...works, ...notes].sort((a, b) => b.at - a.at)[0] || null;
}

const minutesOf = (time) => { const match = /^(\d{1,2}):(\d{2})/.exec(String(time || '')); return match ? Number(match[1]) * 60 + Number(match[2]) : null; };

/**
 * „Järgmised tunnid” (audit 2026-11-24, finding 19: a lesson held this morning was still listed as next): the lessons
 * not over yet by the school's clock (Europe/Tallinn), not only from today's date. A lesson is over when its start +
 * duration (60 min when not known) has passed; one going on right now stays. A lesson without a time stays on its day.
 * Sorted by day and time; the status is not judged here (the list shows what it showed before).
 */
export function upcomingLessons(occurrences = [], now = new Date()) {
  const here = tallinnLocal(new Date(now).toISOString());
  if (!here) return occurrences;
  const clock = minutesOf(here.time);
  return occurrences
    .filter((lesson) => {
      if (!lesson.occurrenceDate) return false;
      if (lesson.occurrenceDate !== here.date) return lesson.occurrenceDate > here.date;
      const start = minutesOf(lesson.time);
      if (start === null) return true;
      const length = Number(lesson.duration) > 0 ? Number(lesson.duration) : 60;
      return start + length > clock;
    })
    .sort((a, b) => `${a.occurrenceDate} ${a.time || ''}`.localeCompare(`${b.occurrenceDate} ${b.time || ''}`));
}

export function childSummary({ homework = [], assignments = [], submissions = [], lessons = [], occurrences = [], today }) {
  const tasks = mergeTasks({ homework, assignments, submissions });
  const { todo } = groupTasks(tasks);
  return {
    next: nextLesson(occurrences),
    total: tasks.length,
    todo,
    late: todo.filter((task) => isTaskLate(task, today)).length,
    done: tasks.filter((task) => task.state !== TASK_STATE.TODO).length,
    feedback: latestFeedback({ submissions, lessons }),
  };
}

const NOT_AN_INVOICE_ANY_MORE = ['Tühistatud', 'cancelled', 'voided', 'Krediteeritud', 'credited'];
export const isRealInvoice = (invoice) => !NOT_AN_INVOICE_ANY_MORE.includes(invoice.status) && !invoice.credited;

// what is due, only what is really due
export function moneyDue(invoices = []) {
  const open = invoices.filter((invoice) => isRealInvoice(invoice) && invoiceBalanceCents(invoice) > 0);
  return { cents: open.reduce((sum, invoice) => sum + invoiceBalanceCents(invoice), 0), count: open.length, overdue: open.some((invoice) => isInvoiceOverdue(invoice)) };
}
