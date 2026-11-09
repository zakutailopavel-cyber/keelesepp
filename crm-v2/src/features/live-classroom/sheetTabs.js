// The worksheet tabs in the live lesson, teacher and student (owner 2026-11-04: too many „Tööleht: …” tabs). Only the sheets of
// the latest lesson are tabs: this room's sheets, or — when this room has none yet — the sheets opened on the most
// recent lesson day. Older ones are listed in „Varasemad tunnid”, grouped by lesson (room) and date; a sheet the student
// opens from there (or the teacher leads him to) stays a tab until he closes it.

const dayKey = (ms) => {
  const date = new Date(ms);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};
const dateLabel = (ms) => new Intl.DateTimeFormat('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(ms));
const timeLabel = (ms) => new Intl.DateTimeFormat('et-EE', { hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
const millis = (value) => {
  const parsed = typeof value === 'number' ? value : Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * @param roomSheets  this room's sheets (RoomWorksheetPanel, newest first) — always tabs
 * @param pastSheets  every room sheet of the student: { id, title, roomKey, openedAt }
 * @param roomKey     this room's key (the invitation id)
 * @param opened      ids of older sheets opened in this lesson (shown as tabs until closed)
 * @returns {{ latest: Set<string>, older: Array<{ key, label, sheets: Array<{ id, title }> }>, hidden: Set<string> }}
 */
export function groupSheetTabs({ roomSheets = [], pastSheets = [], roomKey = '', opened = new Set() } = {}) {
  const current = new Set(roomSheets.map((sheet) => sheet.id));
  pastSheets.forEach((sheet) => { if (roomKey && sheet.roomKey === roomKey) current.add(sheet.id); });
  const rest = pastSheets.filter((sheet) => !current.has(sheet.id))
    .map((sheet) => ({ ...sheet, at: millis(sheet.openedAt) }))
    .sort((a, b) => b.at - a.at);
  let latest = current;
  if (!current.size && rest.length) {
    // no sheet in this room yet: the most recent lesson day stays on the tabs
    const newestDay = rest[0].at ? dayKey(rest[0].at) : '';
    latest = new Set(rest.filter((sheet) => (newestDay ? sheet.at && dayKey(sheet.at) === newestDay : sheet === rest[0])).map((sheet) => sheet.id));
  }
  const groups = new Map();
  rest.filter((sheet) => !latest.has(sheet.id)).forEach((sheet) => {
    const key = sheet.roomKey || (sheet.at ? dayKey(sheet.at) : 'unknown');
    if (!groups.has(key)) groups.set(key, { key, at: sheet.at, sheets: [] });
    groups.get(key).sheets.push({ id: sheet.id, title: sheet.title || 'Tööleht' });
  });
  const list = [...groups.values()].sort((a, b) => b.at - a.at);
  const perDay = new Map();
  list.forEach((group) => { const day = group.at ? dayKey(group.at) : ''; perDay.set(day, (perDay.get(day) || 0) + 1); });
  const older = list.map((group) => {
    const base = group.at ? dateLabel(group.at) : 'Kuupäev puudub';
    const twice = group.at && perDay.get(dayKey(group.at)) > 1;
    return { key: group.key, label: twice ? `${base} · ${timeLabel(group.at)}` : base, sheets: group.sheets };
  });
  const hidden = new Set(older.flatMap((group) => group.sheets.map((sheet) => sheet.id)).filter((id) => !opened.has(id)));
  return { latest, older, hidden };
}
