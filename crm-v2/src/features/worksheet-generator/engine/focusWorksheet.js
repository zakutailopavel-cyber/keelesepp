const cleanIdPart = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-+/g, '-');

function shortHash(value) {
  let hash = 2166136261;
  for (const char of String(value || '')) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(36).slice(0, 6);
}

export const FOCUS_PHASES = Object.freeze([
  { id: 'discover', label: 'Avasta' },
  { id: 'practice', label: 'Harjuta' },
  { id: 'transfer', label: 'Kasuta' },
  { id: 'full', label: 'Täistööleht' },
]);

export function focusWorksheetId({ focusIds = [], phase = 'full' } = {}) {
  const normalizedPhase = FOCUS_PHASES.some((item) => item.id === phase) ? phase : 'full';
  const normalizedFocus = [...new Set((focusIds || []).map(cleanIdPart).filter(Boolean))].sort();
  const raw = `focus-${normalizedPhase}-${normalizedFocus.join('-') || 'selection'}`;
  if (raw.length <= 120) return raw;
  return `${raw.slice(0, 112).replace(/-+$/g, '')}-${shortHash(raw)}`;
}

export function focusPhaseLabel(phase) {
  return FOCUS_PHASES.find((item) => item.id === phase)?.label || 'Täistööleht';
}
