// The order a learner does the given worksheets in (owner 2026-10-26: „тяжело понять, какое сначала, какое потом”):
// the earliest deadline first, then the lesson given first, and inside one lesson Avasta → Harjuta → Kasuta.
const PHASE_RANK = { discover: 1, practice: 2, transfer: 3, opik: 4 };
const phaseOf = (item = {}) => item.phase || String(item.title || '').match(/·\s*(Avasta|Harjuta|Kasuta)\b/)?.[1]?.toLowerCase()
  .replace('avasta', 'discover').replace('harjuta', 'practice').replace('kasuta', 'transfer') || '';
const minute = (value) => String(value?.toDate ? value.toDate().toISOString() : value || '').slice(0, 16);

export function compareWorks(a = {}, b = {}) {
  return String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999'))
    || minute(a.assignedAt).localeCompare(minute(b.assignedAt))
    || String(a.lessonId || '').localeCompare(String(b.lessonId || ''))
    || (PHASE_RANK[phaseOf(a)] || 9) - (PHASE_RANK[phaseOf(b)] || 9)
    || String(a.title || '').localeCompare(String(b.title || ''), 'et');
}

export const sortWorks = (items = []) => [...items].sort(compareWorks);
