const clean = (value) => String(value ?? '').trim();
const key = (value) => clean(value).toLocaleLowerCase('et').replace(/[^\p{L}\p{N}+-]+/gu, ' ').replace(/\s+/g, ' ').trim();
const LEGACY_ALIASES = { kell: 'time-of-day', 'alates kuni': 'from-until', 'enne pärast': 'before-after', 'kõigepealt siis lõpuks': 'sequence' };

export function buildFocusIndex(profile = {}, focusLibrary = []) {
  const index = new Map();
  [...(profile.focuses || []), ...focusLibrary].forEach((focus) => {
    if (!focus?.id) return;
    [focus.id, focus.label, ...(focus.aliases || []), ...(focus.patterns || [])].forEach((alias) => {
      if (key(alias)) index.set(key(alias), focus.id);
    });
  });
  Object.entries(LEGACY_ALIASES).forEach(([alias, id]) => {
    if ((profile.focuses || []).some((focus) => focus.id === id)) index.set(alias, id);
  });
  return index;
}

export function normalizeFocusSelection({ profile = {}, selected = [], legacy = '', focusLibrary = [] } = {}) {
  const diagnostics = [];
  const index = buildFocusIndex(profile, focusLibrary);
  const legacyKey = key(legacy);
  const requested = selected.length ? selected : [...index.entries()].filter(([alias]) => alias.length > 3 && legacyKey.includes(alias)).map(([, id]) => id);
  if (!selected.length && !requested.length && clean(legacy)) requested.push(clean(legacy));
  const ids = [];
  requested.forEach((item) => {
    const value = typeof item === 'object' ? item?.id || item?.label : item;
    const direct = (profile.focuses || []).find((focus) => focus.id === value)?.id;
    const resolved = direct || index.get(key(value));
    if (!resolved) diagnostics.push({ severity: 'error', code: 'FOCUS_UNKNOWN', message: `Tundmatu fookus: ${value}` });
    else if (!ids.includes(resolved)) ids.push(resolved);
  });
  if (ids.length > 3) diagnostics.push({ severity: 'error', code: 'FOCUS_TOO_MANY', message: 'Valida saab kuni kolm fookust.' });
  return { focusIds: ids.slice(0, 3), diagnostics };
}
