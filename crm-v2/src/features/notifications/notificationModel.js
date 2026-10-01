import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';
import { formatDue, hasUnreadReply, isAssignedTo, isNewForMe, isOverdue, scopeTasks, todayIso } from '../tasks/taskModel.js';

// The notification centre does not store notifications: every item is derived from its source record and disappears
// when the source is handled (task done or opened, message read, work reviewed, invoice paid) — as in CRM v1.

export const CATEGORY_LABEL = { task: 'Ülesanded', message: 'Sõnumid', homework: 'Kodutööd', invoice: 'Arved' };
const SEVERITY_ORDER = { danger: 0, warning: 1, info: 2, success: 3 };
const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(cents / 100);

export function taskNotifications(tasks, user, today = todayIso()) {
  const items = [];
  scopeTasks(tasks, user).forEach((task) => {
    const to = `/tasks?task=${encodeURIComponent(task.id)}`;
    const title = task.title || 'Ülesanne';
    if (isNewForMe(task, user, today)) {
      items.push({ id: `task-new:${task.id}`, category: 'task', severity: 'info', title: 'Uus ülesanne sulle', detail: title, meta: task.createdByName ? `Lisas ${task.createdByName}` : '', to });
    }
    if (hasUnreadReply(task, user)) {
      items.push({ id: `task-reply:${task.id}`, category: 'task', severity: 'info', title: `Uus vastus · ${title}`, detail: String(task.lastReplyText || '').slice(0, 140), meta: task.lastReplyBy || '', to });
    }
    if (isOverdue(task, today) && (isAssignedTo(task, user) || user.roles?.includes('admin'))) {
      items.push({ id: `task-overdue:${task.id}`, category: 'task', severity: 'danger', title: 'Ülesande tähtaeg on möödas', detail: title, meta: `Tähtaeg ${formatDue(task.dueDate)} · ${task.assignedTo || 'vastutaja puudub'}`, to });
    } else if (task.status !== 'done' && task.dueDate === today && isAssignedTo(task, user)) {
      items.push({ id: `task-today:${task.id}`, category: 'task', severity: 'warning', title: 'Ülesande tähtaeg on täna', detail: title, meta: task.assignedTo || '', to });
    }
  });
  return items;
}

export function messageNotifications(messages, user) {
  const byStudent = new Map();
  messages.filter((message) => !message.read && message.fromUid && message.fromUid !== user.uid).forEach((message) => {
    const key = message.studentId || message.conversationId || message.id;
    const current = byStudent.get(key);
    if (!current || String(message.createdAt) > String(current.last.createdAt)) byStudent.set(key, { last: message, count: (current?.count || 0) + 1 });
    else current.count += 1;
  });
  return [...byStudent.entries()].map(([key, { last, count }]) => ({
    id: `message:${key}`,
    category: 'message',
    severity: 'info',
    title: `${count > 1 ? `${count} uut sõnumit` : 'Uus sõnum'} · ${last.studentName || last.fromName || 'Vestlus'}`,
    detail: last.text.slice(0, 140),
    meta: last.fromName || '',
    to: '/messages',
  }));
}

export function homeworkNotifications(submissions) {
  return submissions.filter((item) => item.reviewStatus !== 'reviewed').map((item) => ({
    id: `homework:${item.submissionKind}:${item.id}`,
    category: 'homework',
    severity: 'success',
    title: `Töö ootab kontrolli · ${item.studentName || 'Õpilane'}`,
    detail: item.title,
    meta: item.percentage != null ? `${item.percentage}%` : '',
    to: '/homework',
  }));
}

export function invoiceNotifications(invoices, today = new Date()) {
  return invoices.filter((invoice) => isInvoiceOverdue(invoice, today)).map((invoice) => ({
    id: `invoice:${invoice.id}`,
    category: 'invoice',
    severity: 'danger',
    title: `Arve on tähtaja ületanud · ${invoice.studentName || invoice.parentName || 'Klient'}`,
    detail: `${invoice.number ? `Arve ${invoice.number} · ` : ''}tasuda ${money(invoiceBalanceCents(invoice))}`,
    meta: invoice.due ? `Tähtaeg ${formatDue(String(invoice.due).slice(0, 10))}` : '',
    to: '/finance',
  }));
}

export function sortNotifications(items) {
  return [...items].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));
}
