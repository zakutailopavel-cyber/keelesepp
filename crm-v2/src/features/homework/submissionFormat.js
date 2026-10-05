// Shared wording for submitted works (Kodutööd and the student card).
export function formatDate(value) {
  if (!value) return 'Kuupäev puudub';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('et-EE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function readableValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Jah' : 'Ei';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(readableValue).join(', ');
  return Object.entries(value).map(([key, item]) => `${key}: ${readableValue(item)}`).join(' · ');
}
