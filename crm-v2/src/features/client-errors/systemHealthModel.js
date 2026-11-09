// „Süsteemi olek” card (SystemHealthCard.jsx): the one state shown for `systemHealth/current`
const STALE_MS = 40 * 60 * 1000;
export const healthAt = (iso) => Date.parse(iso || '') || 0;
export const healthWhen = (iso) => (healthAt(iso) ? new Intl.DateTimeFormat('et-EE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Tallinn' }).format(new Date(healthAt(iso))) : '—');

// the card's one state: down (an open incident) / stale (the check stopped) / ok / unknown (no document yet)
export function healthView(current, now = Date.now()) {
  if (!current) return { tone: 'unknown', title: 'Kontroll pole veel käinud', note: 'Ajastatud kontroll (systemHealthTick) pole veel tulemust kirjutanud.' };
  const open = current.status === 'down' && current.incident && !current.incident.resolvedAt;
  if (open) return { tone: 'down', title: `Ei vasta: ${(current.incident.failingLabels || current.incident.failing || []).join(', ')}`, note: `Alates ${healthWhen(current.incident.startedAt)}` };
  if (now - healthAt(current.checkedAt) > STALE_MS) return { tone: 'stale', title: 'Kontroll ei käi', note: `Viimane kontroll ${healthWhen(current.checkedAt)}` };
  return { tone: 'ok', title: 'Kõik töötab', note: '' };
}
