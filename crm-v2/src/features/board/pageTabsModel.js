// Compact page tabs (owner 2026-11-04: long „Tööleht: … · Harjuta” pills ran off both edges of the live board).
// A worksheet page „Tööleht: <lesson> · <phase>” loses its prefix, and the pages of one lesson become one tab with a
// short chip per phase: „Probleemi lahendamine: Avasta · Harjuta · Kasuta”. Other pages stay single tabs.

export const PHASE_ORDER = ['Avasta', 'Harjuta', 'Kasuta', 'Õpik'];
const PREFIX = /^\s*Tööleht:\s*/i;
const PHASE_SUFFIX = new RegExp(`^(.*\\S)\\s*·\\s*(${PHASE_ORDER.join('|')})\\s*$`, 'i');

export const isSheetTitle = (title) => PREFIX.test(String(title || ''));

/** „Tööleht: Mina · Harjuta” → { lesson: 'Mina', phase: 'Harjuta' }; a title without a phase keeps it all as lesson. */
export function splitSheetTitle(title) {
  const plain = String(title || '').replace(PREFIX, '').trim();
  const match = plain.match(PHASE_SUFFIX);
  if (!match) return { lesson: plain || 'Tööleht', phase: '' };
  const phase = PHASE_ORDER.find((item) => item.toLocaleLowerCase('et') === match[2].toLocaleLowerCase('et')) || match[2];
  return { lesson: match[1].trim(), phase };
}

const phaseRank = (phase) => (phase ? PHASE_ORDER.indexOf(phase) + 1 || PHASE_ORDER.length + 1 : 0);

/**
 * @param pages  the visible board pages in their order: { id, title }
 * @returns Array<{ key, kind: 'page', page, label } | { key, kind: 'lesson', lesson, items: Array<{ page, phase }> }>
 *   A lesson with one page and no phase is a plain page tab (label = the title without „Tööleht:”).
 */
export function pageTabItems(pages = []) {
  const out = [];
  const lessons = new Map();
  pages.forEach((page) => {
    if (!isSheetTitle(page.title)) {
      out.push({ key: page.id, kind: 'page', page, label: page.title || 'Leht' });
      return;
    }
    const { lesson, phase } = splitSheetTitle(page.title);
    const key = lesson.toLocaleLowerCase('et');
    if (!lessons.has(key)) {
      const group = { key: `lesson:${key}`, kind: 'lesson', lesson, items: [] };
      lessons.set(key, group);
      out.push(group);
    }
    lessons.get(key).items.push({ page, phase });
  });
  return out.map((item) => {
    if (item.kind !== 'lesson') return item;
    if (item.items.length === 1 && !item.items[0].phase) return { key: item.items[0].page.id, kind: 'page', page: item.items[0].page, label: item.lesson };
    return { ...item, items: [...item.items].sort((a, b) => phaseRank(a.phase) - phaseRank(b.phase)) };
  });
}

/** the chip text of one page inside a lesson tab (a page without a phase next to phased ones) */
export const chipLabel = (entry) => entry.phase || 'Leht';
