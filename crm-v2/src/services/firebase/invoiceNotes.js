import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// „Sisemine märkus” of an invoice (team 2026-10-29): what the invoice was for, for the administrator and the bookkeeper
// only. It lives in invoiceNotes/{invoiceId}, NOT on the invoice document — the student and the parent can read their
// invoices, never this collection (firestore.rules). Not printed, not e-mailed.
export const INVOICE_NOTE_MAX = 1000;

export function invoiceNoteRecord(invoiceId, text, user = {}, now = new Date()) {
  const id = String(invoiceId || '').trim();
  if (!id) throw new Error('Arve puudub.');
  const clean = String(text || '').trim();
  if (clean.length > INVOICE_NOTE_MAX) throw new Error(`Märkus võib olla kuni ${INVOICE_NOTE_MAX} märki.`);
  if (!user.uid) throw new Error('Sisselogimine puudub.');
  return {
    invoiceId: id,
    text: clean,
    updatedAt: now.toISOString(),
    updatedByUid: user.uid,
    updatedByName: String(user.displayName || user.email || '').trim().slice(0, 160),
  };
}

export const invoiceNotesService = {
  // every note as a Map invoiceId → note (staff only; the rules refuse anyone else)
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'invoiceNotes'));
    return new Map(snapshot.docs.map((item) => [item.id, { id: item.id, ...item.data() }]));
  },
  async save(invoiceId, text, user) {
    const { db, auth } = requireFirebaseClient();
    const record = invoiceNoteRecord(invoiceId, text, user?.uid ? user : (auth?.currentUser || {}));
    await setDoc(doc(db, 'invoiceNotes', record.invoiceId), record);
    return { id: record.invoiceId, ...record };
  },
};

// after „Lisa arve” / „Tunnipakett”: save the note typed in the form; the invoice is already made, so a failure is
// reported back ({ noteError }) and never undoes it
export async function saveCreationNote(repository, invoice, text) {
  const clean = String(text || '').trim();
  if (!clean || !invoice?.id) return {};
  try { return { note: await repository.save(invoice.id, clean) }; }
  catch (caught) { return { noteError: caught?.message || 'viga' }; }
}
