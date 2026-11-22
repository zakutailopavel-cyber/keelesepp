// The order a learner does the given worksheets in (owner 2026-10-26: „тяжело понять, какое сначала, какое потом”):
// the earliest deadline first, then the NEWEST day of giving first (owner 2026-11-22: „сейчас самое старое наверху а
// новое внизу, логично было бы наоборот”); work given on one day keeps the order it was given in (course order), and
// inside one lesson Avasta → Harjuta → Kasuta.
const PHASE_RANK = { discover: 1, practice: 2, transfer: 3, opik: 4 };
export const phaseOf = (item = {}) => item.phase || item.worksheetDoc?.meta?.phase || String(item.title || '').match(/·\s*(Avasta|Harjuta|Kasuta)\b/)?.[1]?.toLowerCase()
  .replace('avasta', 'discover').replace('harjuta', 'practice').replace('kasuta', 'transfer') || '';
const stamp = (value) => String(value?.toDate ? value.toDate().toISOString() : value || '');
const minute = (value) => stamp(value).slice(0, 16);
const day = (value) => stamp(value).slice(0, 10);

export function compareWorks(a = {}, b = {}) {
  return String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999'))
    || day(b.assignedAt).localeCompare(day(a.assignedAt))
    || minute(a.assignedAt).localeCompare(minute(b.assignedAt))
    || String(a.lessonId || '').localeCompare(String(b.lessonId || ''))
    || (PHASE_RANK[phaseOf(a)] || 9) - (PHASE_RANK[phaseOf(b)] || 9)
    || String(a.title || '').localeCompare(String(b.title || ''), 'et');
}

export const sortWorks = (items = []) => [...items].sort(compareWorks);
