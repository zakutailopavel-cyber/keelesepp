import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { shareInFlight } from './shareInFlight.js';
import { isOwnerEmail } from '../../utils/roles.js';

// „Arve väljastaja” (owner 2026-11-09, docs/ACCOUNTING.md „FIE arved”): an invoice of the owner's own FIE
// (`issuer: 'fie'`) is read only by the owner and the family it belongs to (firestore.rules). Another administrator
// and the bookkeeper must ask for company invoices only (where issuer == 'company'); the owner reads everything, but the
// company's screens get company invoices only — the FIE ones come from listFie() for the separate „FIE” block.
export const isFieInvoice = (invoice) => invoice?.issuer === 'fie';
export const companyInvoices = (list = []) => list.filter((invoice) => !isFieInvoice(invoice));

const byDateDesc = (a, b) => String(b.date || b.createdAt || '').localeCompare(String(a.date || a.createdAt || ''));
const records = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

function signedInIsOwner() {
  const { auth } = requireFirebaseClient();
  return isOwnerEmail(auth?.currentUser?.email);
}

export const invoicesService = {
  list() {
    return shareInFlight('invoices', () => invoicesService.readAll());
  },
  // the company's invoices (every staff screen of the company: finance, debts, analytics, the bell)
  async readAll() {
    const { db } = requireFirebaseClient();
    const snapshot = signedInIsOwner()
      ? await getDocs(collection(db, 'invoices'))
      : await getDocs(query(collection(db, 'invoices'), where('issuer', '==', 'company')));
    return companyInvoices(records(snapshot)).sort(byDateDesc);
  },
  // the owner's FIE invoices (nobody else may read them: an empty list for anyone else)
  async listFie() {
    if (!signedInIsOwner()) return [];
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'invoices'), where('issuer', '==', 'fie')));
    return records(snapshot).sort(byDateDesc);
  },
  // one invoice (the side drawer's invoice panel, owner 2026-11-09): administrator and accountant read every company
  // invoice; an FIE invoice only the owner (anyone else: as if missing)
  async get(id) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'invoices', id)).catch((error) => {
      if (error?.code === 'permission-denied') return null;
      throw error;
    });
    return snapshot?.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  },
  // the card's own invoices and the combined invoices it is a line of (several cards of one payer on one invoice).
  // The family and the owner read FIE invoices too; another administrator / the bookkeeper gets company ones only.
  async listByStudent(studentId) {
    const { db } = requireFirebaseClient();
    const read = async (field, op) => {
      const base = [where(field, op, studentId)];
      try {
        return await getDocs(query(collection(db, 'invoices'), ...base));
      } catch (error) {
        if (error?.code !== 'permission-denied') throw error;
        return getDocs(query(collection(db, 'invoices'), ...base, where('issuer', '==', 'company')));
      }
    };
    const [own, combined] = await Promise.all([
      read('studentId', '=='),
      // staff only: the rules cannot prove such a query for a parent or a student (they get a combined invoice through
      // its first card and their own parent link), so a refusal here is not an error
      read('studentIds', 'array-contains').catch(() => ({ docs: [] })),
    ]);
    const byId = new Map([...own.docs, ...combined.docs].map((item) => [item.id, { id: item.id, ...item.data() }]));
    return [...byId.values()].sort(byDateDesc);
  },
};
