// „Võimalikud topeltlaekumised” (October 2026 accounting audit): the accountant books bank lines by hand while
// syncAccountingEntries books a receipt (1010 / 1200) for every CRM payment, so the same money can be in the books
// twice. This read-only projection pairs a CRM receipt entry with a manual entry that debits 1010 with the same amount
// for the same client or reference within MAX_DAYS. It only shows the pairs — a person decides; nothing is changed.

export const MAX_DAYS = 120;
const BANK = '1010';
const DAY_MS = 24 * 60 * 60 * 1000;

const live = (entry) => entry && !entry.deleted && !entry.reversedBy && !entry.reversed && entry.origin !== 'reversal';
const bankDebit = (entry) => (entry.lines || []).reduce((sum, line) => sum + (String(line.account) === BANK ? Number(line.debitCents) || 0 : 0), 0);
// a receipt the sync books from the CRM: an invoice payment („payment:<id>”) or bank money kept as an advance („credit:<id>”)
const sourceOf = (entry) => String(entry.sourceKey || String(entry.id || '').replace(/^auto_(payment|credit)_/, '$1:'));
const isCrmReceipt = (entry) => entry.origin === 'auto' && /^(payment|credit):/.test(sourceOf(entry));
const fold = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const words = (value) => fold(value).split(/[^a-z0-9]+/).filter((word) => word.length >= 2);
const compact = (value) => fold(value).replace(/[^a-z0-9]/g, '');
// whole tokens („KS-117” stays one token, so it never matches „KS-1170”)
const tokens = (value) => fold(value).split(/[\s,;:()/|·]+/).map(compact).filter(Boolean);
// a name is specific enough with two words, or one word of 5+ letters
const specificName = (list) => list.length >= 2 || (list.length === 1 && list[0].length >= 5);
const dayNumber = (date) => Math.round(Date.parse(`${String(date).slice(0, 10)}T12:00:00Z`) / DAY_MS);

// what identifies the client and the document of a CRM receipt
function receiptKeys(entry) {
  const partners = (entry.lines || []).map((line) => line.partner).filter((partner) => partner && (partner.id || partner.name));
  const refs = new Set([entry.documentRef, ...(String(entry.description || '').match(/arvele\s+(\S+)/i) || []).slice(1)]
    .map(compact).filter((ref) => ref.length >= 4));
  const payerName = String(entry.description || '').split(' · ').slice(1).join(' ');
  const names = [...new Set([...partners.map((partner) => partner.name), payerName].filter(Boolean))]
    .map(words).filter(specificName);
  return { ids: new Set(partners.map((partner) => partner.id).filter(Boolean)), refs, names };
}

// everything a person may have typed on the manual entry
function manualText(entry) {
  const parts = [entry.description, entry.documentRef, ...(entry.lines || []).flatMap((line) => [line.note, line.partner?.name])];
  return { words: new Set(parts.flatMap(words)), tokens: new Set(parts.flatMap(tokens)), ids: new Set((entry.lines || []).map((line) => line.partner?.id).filter(Boolean)) };
}

function matchReason(keys, text) {
  if ([...keys.ids].some((id) => text.ids.has(id))) return 'sama klient';
  if ([...keys.refs].some((ref) => text.tokens.has(ref))) return 'sama viide';
  if (keys.names.some((name) => name.every((word) => text.words.has(word)))) return 'sama maksja nimi';
  return '';
}

export function possibleDuplicateReceipts(entries = [], { maxDays = MAX_DAYS } = {}) {
  const active = (entries || []).filter(live);
  const receipts = active.filter((entry) => isCrmReceipt(entry) && bankDebit(entry) > 0).map((entry) => ({ entry, cents: bankDebit(entry), keys: receiptKeys(entry) }));
  const manual = active.filter((entry) => entry.origin === 'manual' && bankDebit(entry) > 0).map((entry) => ({ entry, cents: bankDebit(entry), text: manualText(entry) }));
  const pairs = [];
  receipts.forEach((receipt) => {
    manual.forEach((other) => {
      if (other.cents !== receipt.cents) return;
      const days = Math.abs(dayNumber(other.entry.date) - dayNumber(receipt.entry.date));
      if (!Number.isFinite(days) || days > maxDays) return;
      const reason = matchReason(receipt.keys, other.text);
      if (reason) pairs.push({ id: `${receipt.entry.id}|${other.entry.id}`, crm: receipt.entry, manual: other.entry, amountCents: receipt.cents, days, reason });
    });
  });
  return pairs.sort((a, b) => String(b.crm.date).localeCompare(String(a.crm.date)) || a.days - b.days);
}
