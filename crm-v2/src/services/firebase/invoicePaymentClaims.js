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
// a notice on an FIE invoice (the owner's own FIE, owner 2026-11-09) lives in fieInvoicePaymentClaims: the owner and the
// family read it, nobody else (firestore.rules); the company's administrators and the bookkeeper never see it
const COLLECTIONS = ['invoicePaymentClaims', 'fieInvoicePaymentClaims'];
const readOne = (db, name, id) => getDoc(doc(db, name, id)).then((snap) => (snap.exists() ? fromSnapshot(snap) : null)).catch(() => null);

export const invoicePaymentClaimsService = {
  // administrator / bookkeeper: every claim as a Map invoiceId → claim
  async list() {
    const { db } = requireFirebaseClient();
    const [snapshot, fie] = await Promise.all([
      getDocs(collection(db, 'invoicePaymentClaims')),
      getDocs(collection(db, 'fieInvoicePaymentClaims')).catch(() => ({ docs: [] })),
    ]);
    return new Map([...snapshot.docs, ...fie.docs].map((item) => [item.id, fromSnapshot(item)]));
  },
  // the invoice's owner: the claims of these invoices (a refused or missing one is simply not there)
  async forInvoices(invoiceIds = []) {
    const { db } = requireFirebaseClient();
    const ids = [...new Set(invoiceIds.filter(Boolean).map(String))];
    const found = await Promise.all(ids.map(async (id) => (await readOne(db, COLLECTIONS[0], id)) || readOne(db, COLLECTIONS[1], id)));
    return new Map(found.filter(Boolean).map((claim) => [claim.id, claim]));
  },
  async get(invoiceId) {
    const { db } = requireFirebaseClient();
    const id = String(invoiceId);
    const snap = await getDoc(doc(db, COLLECTIONS[0], id));
    if (snap.exists()) return fromSnapshot(snap);
    return readOne(db, COLLECTIONS[1], id);
  },
  // `invoice` (optional): an FIE invoice's notice goes to its own collection
  async create(invoiceId, note, user, invoice = null) {
    const { db, auth } = requireFirebaseClient();
    const record = paymentClaimRecord(invoiceId, note, user?.uid ? user : (auth?.currentUser || {}));
    const name = invoice?.issuer === 'fie' ? COLLECTIONS[1] : COLLECTIONS[0];
    await setDoc(doc(db, name, record.invoiceId), { ...record, claimedAt: serverTimestamp() });
    return { id: record.invoiceId, ...record, claimedAt: new Date().toISOString() };
  },
  // administrator only (rules; an FIE notice: the owner): „Eemalda teade” clears a mistaken notice; the parent sees
  // „Maksin ära” again
  async remove(invoiceId, invoice = null) {
    const { db } = requireFirebaseClient();
    await deleteDoc(doc(db, invoice?.issuer === 'fie' ? COLLECTIONS[1] : COLLECTIONS[0], String(invoiceId)));
  },
};

// the claims worth the administrator's attention: on an invoice that still has an open balance
export function openPaymentClaim(claims, invoice, balanceCents) {
  if (!claims || !invoice?.id || !(balanceCents > 0)) return null;
  return claims.get(invoice.id) || null;
}
