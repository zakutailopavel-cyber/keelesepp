// „Minu kassa” (owner 2026-11-11): view helpers. The server keeps the truth (functions/cash-core.js cashPosition /
// myCashView); these only sum a person's own entries for the menu and the dashboard line, and name things.

const cents = (entry) => Math.round(Number(entry?.amountCents) || 0);
// a hand-over moves money once the receiver confirmed it ("active"; old entries have no status)
const moves = (entry) => entry?.type === 'handover' && (entry.status === 'active' || !entry.status);

/** A person's own cash from their cashLedger entries (cashBoxService.ownEntries). Same sums as the server's cashPosition. */
export function myCashTotals(entries = [], uid = '') {
  let incoming = 0;
  let out = 0;
  let pendingOut = 0;
  let pendingIn = 0;
  for (const entry of entries) {
    if (!entry || entry.status === 'void') continue;
    if (entry.type === 'receipt' && entry.holderUid === uid) incoming += cents(entry);
    if (entry.type !== 'handover') continue;
    if (entry.toUid === uid && moves(entry)) incoming += cents(entry);
    if (entry.toUid === uid && entry.status === 'pending') pendingIn += 1;
    if (entry.fromUid === uid && moves(entry)) out += cents(entry);
    if (entry.fromUid === uid && entry.status === 'pending') pendingOut += cents(entry);
  }
  return {
    onHandCents: incoming - out,
    pendingOutCents: pendingOut,
    availableCents: incoming - out - pendingOut,
    pendingIn,
    ever: entries.some((entry) => entry && (entry.holderUid === uid || entry.fromUid === uid || entry.toUid === uid)),
  };
}

export const HANDOVER_STATUS = {
  pending: { label: 'ootab kinnitust', tone: 'warning' },
  active: { label: 'kinnitatud', tone: 'success' },
  rejected: { label: 'ei saanud kätte', tone: 'danger' },
  void: { label: 'tühistatud', tone: 'neutral' },
};

const shortDay = (iso) => (iso ? `${Number(String(iso).slice(8, 10))}.${Number(String(iso).slice(5, 7))}` : '');
export const dayLabel = (iso) => (iso ? `${shortDay(iso)}.${String(iso).slice(0, 4)}` : '');

// one line for an entry on hand: „Mari Tamm · tund 9.11 kell 16:00 · Eesti keel” or „Mari andis üle”
export function itemLine(item = {}) {
  if (item.type === 'handover') return `${item.fromName || 'Kolleeg'} andis üle`;
  const lesson = item.occurrenceDate ? `tund ${shortDay(item.occurrenceDate)}${item.lessonTime ? ` kell ${item.lessonTime}` : ''}` : '';
  return [item.studentName, lesson, item.subject].filter(Boolean).join(' · ');
}

// the amount the hand-over dialog shows for a choice: everything available, or the chosen entries
export function chosenCents(items = [], chosen = null, availableCents = 0) {
  if (!chosen) return Math.max(0, availableCents);
  const total = items.filter((item) => chosen.has(item.id)).reduce((sum, item) => sum + (Number(item.remainingCents) || 0), 0);
  return Math.max(0, Math.min(total, availableCents));
}
