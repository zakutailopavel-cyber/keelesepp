import { collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// „Maksin ära” (owner 2026-11-09): the parent who owns an invoice says it was paid. invoicePaymentClaims/{invoiceId} —
// one per invoice, written once by its owner (own uid, server time, optional short note), never edited; only the
// administrator may delete it („Eemalda teade”, coordinator 2026-11-09) (firestore.rules). It is ONLY a notice: the invoice, its payments and the books stay untouched; the
// administrator checks the bank and adds the payment. No e-mail or message is sent.
export const PAYMENT_CLAIM_NOTE_MAX = 300;

export function paymentClaimRecord(invoiceId, note, user = {}) {
  const id = String(invoiceId || '').trim();
  if (!id) throw new Error('Arve puudub.');
  if (!user.uid) throw new Error('Sisselogimine puudub.');
  const clean = String(note || '').trim().replace(/\s+/g, ' ');
  if (clean.length > PAYMENT_CLAIM_NOTE_MAX) throw new Error(`Märkus võib olla kuni ${PAYMENT_CLAIM_NOTE_MAX} märki.`);
  const record = { invoiceId: id, claimedByUid: user.uid, claimedByName: String(user.displayName || user.email || '').trim().slice(0, 160) };
  if (clean) record.note = clean;
  return record;
}

// Firestore Timestamp → ISO text (the screens show it as a date)
const isoOf = (value) => {
  if (!value) return '';
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return String(value);
};
const fromSnapshot = (item) => ({ id: item.id, ...item.data(), claimedAt: isoOf(item.data().claimedAt) });

export const invoicePaymentClaimsService = {
  // administrator / bookkeeper: every claim as a Map invoiceId → claim
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'invoicePaymentClaims'));
    return new Map(snapshot.docs.map((item) => [item.id, fromSnapshot(item)]));
  },
  // the invoice's owner: the claims of these invoices (a refused or missing one is simply not there)
  async forInvoices(invoiceIds = []) {
    const { db } = requireFirebaseClient();
    const ids = [...new Set(invoiceIds.filter(Boolean).map(String))];
    const found = await Promise.all(ids.map((id) => getDoc(doc(db, 'invoicePaymentClaims', id)).then((snap) => (snap.exists() ? fromSnapshot(snap) : null)).catch(() => null)));
    return new Map(found.filter(Boolean).map((claim) => [claim.id, claim]));
  },
  async get(invoiceId) {
    const { db } = requireFirebaseClient();
    const snap = await getDoc(doc(db, 'invoicePaymentClaims', String(invoiceId)));
    return snap.exists() ? fromSnapshot(snap) : null;
  },
  async create(invoiceId, note, user) {
    const { db, auth } = requireFirebaseClient();
    const record = paymentClaimRecord(invoiceId, note, user?.uid ? user : (auth?.currentUser || {}));
    await setDoc(doc(db, 'invoicePaymentClaims', record.invoiceId), { ...record, claimedAt: serverTimestamp() });
    return { id: record.invoiceId, ...record, claimedAt: new Date().toISOString() };
  },
  // administrator only (rules): „Eemalda teade” clears a mistaken notice; the parent sees „Maksin ära” again
  async remove(invoiceId) {
    const { db } = requireFirebaseClient();
    await deleteDoc(doc(db, 'invoicePaymentClaims', String(invoiceId)));
  },
};

// the claims worth the administrator's attention: on an invoice that still has an open balance
export function openPaymentClaim(claims, invoice, balanceCents) {
  if (!claims || !invoice?.id || !(balanceCents > 0)) return null;
  return claims.get(invoice.id) || null;
}
