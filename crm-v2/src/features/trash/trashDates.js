// a trash date (ISO) as dd.mm.yyyy; '—' when missing
export const dateLabel = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
};

// why the purge of a card in the trash is on hold (card-trash-core purgeDecision reasons)
export const blockedReason = (reason) => ({
  'future-lessons': 'kaardil on eesootavad tunnid',
  'active-group': 'kaart on aktiivses grupis',
  'open-invoices': 'kaardil on tasumata arveid — taasta ja arhiveeri kaart',
}[reason] || 'kaardil on eesootavad tunnid või aktiivne grupp');

// whole days until the purge (0 when it is due)
export const daysLeft = (iso, now = Date.now()) => Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86400000));
