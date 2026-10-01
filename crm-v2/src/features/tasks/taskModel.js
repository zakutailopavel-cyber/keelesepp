import { canonicalTeacherName, isSameTeacher } from '../../utils/teachers.js';

export const STATUS_LABEL = { open: 'Uus', in_progress: 'Töös', done: 'Valmis' };
export const STATUS_ORDER = ['open', 'in_progress', 'done'];
export const PRIORITY_LABEL = { high: 'Kiire', normal: 'Tavaline', low: 'Madal' };
export const CATEGORY_LABEL = { general: 'Üldine', parent: 'Lapsevanem', payment: 'Arved', lesson: 'Tunnid', technical: 'Tehniline' };
export const FILTERS = [
  { id: 'open', label: 'Avatud' },
  { id: 'mine', label: 'Minu ülesanded' },
  { id: 'overdue', label: 'Tähtaeg möödas' },
  { id: 'created', label: 'Minu loodud' },
  { id: 'done', label: 'Valmis' },
  { id: 'all', label: 'Kõik' },
];
// "New task for you" is shown only for recent tasks, so tasks created in v1 before openedByUids existed do not all
// show up as new at once.
const NEW_TASK_DAYS = 14;

export const todayIso = (date = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Tallinn' }).format(date);

export function isAdmin(user) {
  return Boolean(user?.roles?.includes('admin'));
}

export function isOverdue(task, today = todayIso()) {
  return task.status !== 'done' && Boolean(task.dueDate) && task.dueDate < today;
}

export function isAssignedTo(task, user) {
  if (!user) return false;
  // The name is authoritative (v1 reassigns by name only and leaves assignedToUid untouched).
  if (task.assignedTo) return isSameTeacher(task.assignedTo, user.displayName);
  return Boolean(task.assignedToUid) && task.assignedToUid === user.uid;
}

export function isCreatedBy(task, user) {
  return Boolean(user) && (task.createdByUid === user.uid || (!task.createdByUid && isSameTeacher(task.createdByName, user.displayName)));
}

// Same scope as v1: the administrator sees every task, a teacher sees tasks assigned to or created by them.
export function scopeTasks(tasks, user) {
  if (isAdmin(user)) return tasks;
  return tasks.filter((task) => isAssignedTo(task, user) || isCreatedBy(task, user) || task.createdByUid === user?.uid || isSameTeacher(task.createdByName, user?.displayName));
}

export function hasUnreadReply(task, user) {
  return Boolean(task.lastReplyAt) && task.lastReplyByUid !== user?.uid && !(task.lastReplySeenBy || []).includes(user?.uid);
}

export function isNewForMe(task, user, today = todayIso()) {
  if (task.status === 'done' || !isAssignedTo(task, user) || isCreatedBy(task, user)) return false;
  if ((task.openedByUids || []).includes(user.uid)) return false;
  const created = String(task.createdAt || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(created)) return false;
  const age = (Date.parse(today) - Date.parse(created)) / 86_400_000;
  return age <= NEW_TASK_DAYS;
}

export function matchesFilter(task, filter, user, today = todayIso()) {
  if (filter === 'open') return task.status !== 'done';
  if (filter === 'mine') return task.status !== 'done' && isAssignedTo(task, user);
  if (filter === 'overdue') return isOverdue(task, today);
  if (filter === 'created') return isCreatedBy(task, user);
  if (filter === 'done') return task.status === 'done';
  if (filter.startsWith('cat:')) return (task.category || 'general') === filter.slice(4);
  return true;
}

export function matchesSearch(task, search) {
  const query = String(search || '').trim().toLocaleLowerCase('et');
  if (!query) return true;
  return [task.title, task.assignedTo, task.createdByName, task.lastReplyText, CATEGORY_LABEL[task.category]]
    .some((value) => String(value || '').toLocaleLowerCase('et').includes(query));
}

// Kiire first, then the earliest deadline (tasks without a deadline last), then the newest.
export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if ((a.priority === 'high') !== (b.priority === 'high')) return a.priority === 'high' ? -1 : 1;
    const due = (a.dueDate || '9999-99-99').localeCompare(b.dueDate || '9999-99-99');
    if (due) return due;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
}

export function staffOptions(staff = [], tasks = [], user) {
  const byName = new Map();
  staff.forEach((member) => {
    const name = canonicalTeacherName(member.name || member.displayName || member.email);
    if (name && !member.disabled) byName.set(name.toLocaleLowerCase('et'), { name, uid: member.id || member.uid || '' });
  });
  [user?.displayName, ...tasks.map((task) => task.assignedTo)].forEach((value) => {
    const name = canonicalTeacherName(value);
    if (name && !byName.has(name.toLocaleLowerCase('et'))) byName.set(name.toLocaleLowerCase('et'), { name, uid: name === canonicalTeacherName(user?.displayName) ? user.uid : '' });
  });
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, 'et'));
}

export function formatDue(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return '';
  const [year, month, day] = value.split('-');
  return `${day}.${month}.${year}`;
}
