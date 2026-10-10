import { AUDIENCES, RESOURCE_TYPES } from './resources.js';

const fold = (value) => String(value || '').toLocaleLowerCase('et').normalize('NFD').replace(/[̀-ͯ]/g, '');

const haystack = (resource) => fold([
  resource.title,
  resource.author,
  resource.summary,
  resource.ideas,
  RESOURCE_TYPES[resource.type],
  ...resource.levels,
  ...resource.tags,
  ...resource.audience.map((key) => AUDIENCES[key]),
  ...(resource.links || []).map((item) => `${item.group} ${item.label}`),
].join(' '));

// every word of the query must appear somewhere in the card
export function filterResources(resources, { q = '', level = '', type = '', audience = '', filesOnly = false } = {}) {
  const words = fold(q).split(/\s+/).filter(Boolean);
  return resources.filter((resource) => {
    if (level && !resource.levels.includes(level)) return false;
    if (type && resource.type !== type) return false;
    if (audience && !resource.audience.includes(audience)) return false;
    if (filesOnly && resource.access !== 'file') return false;
    if (!words.length) return true;
    const text = haystack(resource);
    return words.every((word) => text.includes(word));
  });
}

export function typeCounts(resources) {
  const counts = {};
  resources.forEach((resource) => { counts[resource.type] = (counts[resource.type] || 0) + 1; });
  return counts;
}

// sections in RESOURCE_TYPES order, empty ones left out
export function groupByType(resources) {
  return Object.keys(RESOURCE_TYPES)
    .map((type) => ({ type, label: RESOURCE_TYPES[type], items: resources.filter((resource) => resource.type === type) }))
    .filter((section) => section.items.length);
}

// links of one card grouped by their `group`, first-seen order
export function groupLinks(links = []) {
  const groups = new Map();
  links.forEach((item) => groups.set(item.group, [...(groups.get(item.group) || []), item]));
  return [...groups].map(([group, items]) => ({ group, items }));
}
