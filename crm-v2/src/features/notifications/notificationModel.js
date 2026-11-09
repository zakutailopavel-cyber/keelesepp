import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';
import { FIELD_NAMES } from '../missing-data/missingDataModel.js';
import { formatDue, hasUnreadReply, isAssignedTo, isNewForMe, isOverdue, scopeTasks, todayIso } from '../tasks/taskModel.js';

// The notification centre does not store notifications: every item is derived from its source record and disappears
// when the source is handled (task done or opened, message read, work reviewed, invoice paid) — as in CRM v1.

export const CATEGORY_LABEL = { task: 'Ülesanded', message: 'Sõnumid', homework: 'Kodutööd', lesson: 'Tunnid', student: 'Õpilased', invoice: 'Arved', system: 'Süsteem' };
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
    to: `/finance?status=overdue&invoice=${encodeURIComponent(invoice.id)}`,
  }));
}

// „Ei saa tulla?”: a pending request to move a lesson (owner 2026-10-12); it disappears when the teacher answers
export function lessonChangeNotifications(requests = []) {
  return requests.filter((item) => item.status === 'pending').map((item) => ({
    id: `lesson-change:${item.id}`,
    category: 'lesson',
    severity: item.late ? 'danger' : 'warning',
    title: `${item.studentName || 'Õpilane'} ${!(item.proposals || []).length && !String(item.other || '').trim() ? 'ei tule tunnile' : 'palub tundi üle viia'}`,
    detail: `${formatDue(item.occurrenceDate)} kell ${item.occurrenceTime}${item.reason ? ` · ${item.reason}` : ''}`,
    meta: item.late ? 'vähem kui 24 h' : '',
    to: `/calendar?request=${encodeURIComponent(item.id)}`,
  }));
}

// „Sobivad ajad” changed by the student or parent and not yet reviewed (owner 2026-10-21): offer a new time quickly
export function availabilityNotifications(items = [], names = new Map()) {
  return items.filter((item) => item.changedAt && item.changedByRole !== 'admin' && (!item.reviewedAt || item.reviewedAt < item.changedAt)).map((item) => ({
    id: `availability:${item.studentId}:${item.changedAt}`,
    category: 'lesson',
    severity: 'warning',
    title: `${names.get(item.studentId) || 'Õpilane'} muutis sobivaid aegu`,
    detail: item.changedByName ? `Muutis ${item.changedByName}${item.changedByRole === 'parent' ? ' (lapsevanem)' : ''}` : 'Paku vajadusel uus tunniaeg',
    meta: 'sobivad ajad',
    to: `/students/${encodeURIComponent(item.studentId)}#sobivad-ajad`,
  }));
}

// „Puuduvad andmed” (owner 2026-10-25): a student / parent filled missing data after login; until the administrator
// marks it „Vaadatud” in Õpilased → Puuduvad andmed
export function missingDataNotifications(submissions = []) {
  return submissions.filter((item) => !item.reviewedAt).map((item) => ({
    id: `missing-data:${item.id}`,
    category: 'student',
    severity: 'info',
    title: `${item.studentNames.filter(Boolean).join(', ') || item.byName || 'Õpilane'} täitis puuduvad andmed`,
    detail: [...new Set(item.changes.map((change) => FIELD_NAMES[change.field] || change.field))].join(', '),
    meta: item.byName ? `${item.byName}${item.byRole === 'parent' ? ' (lapsevanem)' : ''}` : 'puuduvad andmed',
    to: `/students?puuduvad=1&taidetud=${encodeURIComponent(item.id)}`,
  }));
}

// „Märkimata tunnid” for a teacher (owner 2026-11-09: a daily reminder inside the CRM, never an e-mail): one line of
// the teacher's own past unmarked lessons (unmarkedLessonsService.reminder). The id carries the day, so the bell counts
// it as new once a day while lessons stay unmarked; it disappears when all are marked.
export function unmarkedNotifications(reminder, today = todayIso()) {
  if (!reminder?.total) return [];
  return [{
    id: `unmarked:${today}`,
    category: 'lesson',
    severity: reminder.stale ? 'danger' : 'warning',
    title: `${reminder.total} ${reminder.total === 1 ? 'tund' : 'tundi'} märkimata${reminder.oldestLabel ? ` (vanim ${reminder.oldestLabel})` : ''}`,
    detail: 'Märkimata tund ei jõua arvele ega õpilase ajalukku. Märgi: toimus või puudus.',
    meta: 'minu tunnid',
    to: '/calendar/markimata',
  }];
}

// „Süsteemi olek” (owner 2026-11-09, admin only, never an e-mail): from `systemHealth/current` and `/digest`, written by
// the scheduled functions (functions/system-health-core.js). One item per incident (the id carries the incident), a
// „works again” item for 24 h after it closes, a warning when the check itself has stopped, and the morning digest
// „Eile N viga — vaata Vead” on its day when N > 0.
const HEALTH_STALE_MS = 40 * 60 * 1000; // the check runs every 10 min
const tallinnTime = (iso) => {
  const at = Date.parse(iso);
  if (!at) return '';
  return new Intl.DateTimeFormat('et-EE', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Tallinn' }).format(new Date(at));
};

export function systemHealthNotifications({ current = null, digest = null } = {}, now = Date.now(), today = todayIso(new Date(now))) {
  const items = [];
  const incident = current?.incident && !current.incident.resolvedAt ? current.incident : null;
  if (current?.status === 'down' && incident) {
    items.push({
      id: `health-down:${incident.id}`,
      category: 'system',
      severity: 'danger',
      title: `Süsteem ei vasta: ${(incident.failingLabels || incident.failing || []).join(', ') || 'teadmata osa'}`,
      detail: `Alates ${tallinnTime(incident.startedAt)}. Kontrollin iga 10 minuti järel; kui kõik vastab, tuleb teade „töötab jälle”.`,
      meta: 'süsteemi olek',
      to: '/vead',
    });
  } else if (current?.lastIncident?.resolvedAt && now - Date.parse(current.lastIncident.resolvedAt) < 24 * 60 * 60 * 1000) {
    const last = current.lastIncident;
    items.push({
      id: `health-ok:${last.id}`,
      category: 'system',
      severity: 'success',
      title: 'Süsteem töötab jälle',
      detail: `${(last.failingLabels || last.failing || []).join(', ')} ei vastanud ${tallinnTime(last.startedAt)} – ${tallinnTime(last.resolvedAt)}`,
      meta: 'süsteemi olek',
      to: '/vead',
    });
  }
  if (current?.checkedAt && now - Date.parse(current.checkedAt) > HEALTH_STALE_MS) {
    items.push({
      id: `health-stale:${today}`,
      category: 'system',
      severity: 'warning',
      title: 'Süsteemi kontroll ei käi',
      detail: `Viimane kontroll ${tallinnTime(current.checkedAt)}. Ajastatud funktsioon systemHealthTick ei tööta.`,
      meta: 'süsteemi olek',
      to: '/vead',
    });
  }
  if (digest?.date === today && Number(digest.total) > 0) {
    const top = digest.top?.[0];
    items.push({
      id: `errors-digest:${digest.date}`,
      category: 'system',
      severity: 'warning',
      title: `Eile ${digest.total} viga — vaata Vead`,
      detail: top ? `Kõige sagedasem: ${top.message} (${top.route}, ${top.count}×)` : '',
      meta: digest.top?.length > 1 ? `${digest.top.length} eri viga tipus` : 'vigade kokkuvõte',
      to: '/vead',
    });
  }
  return items;
}

export function sortNotifications(items) {
  return [...items].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));
}
