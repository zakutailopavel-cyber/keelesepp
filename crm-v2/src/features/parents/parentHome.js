// „Как дела у ребёнка?” (owner 2026-11-01): what the first screen of „Minu pere” says about one child, in order: the next
// lesson, what the child should do now and whether it is done, the teacher's latest words. Pure: the page passes what it read.
import { TASK_STATE, groupTasks, isTaskLate, mergeTasks } from '../homework/taskList.js';
import { nextLesson } from '../pet/petLife.js';
import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';

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
