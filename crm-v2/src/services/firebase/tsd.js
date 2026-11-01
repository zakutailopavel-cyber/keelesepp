import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// TSD (docs/ACCOUNTING.md „TSD”): written by admin / finance under the Firestore rules. The history on a document says
// who changed which field and when; the values, an ID code above all, stay out of it.
const stamp = (auth) => ({ updatedAt: new Date().toISOString(), updatedByUid: auth.currentUser?.uid || '' });
const withHistory = (previous, fields, meta) => [...(previous?.history || []), { at: meta.updatedAt, byUid: meta.updatedByUid, fields }].slice(-100);

export const tsdService = {
  async load(month) {
    const { db } = requireFirebaseClient();
    const [payees, monthDoc, settings] = await Promise.all([
      getDocs(collection(db, 'tsdPayees')),
      getDoc(doc(db, 'tsdMonths', month)),
      getDoc(doc(db, 'tsdSettings', month.slice(0, 4))),
    ]);
    return {
      payees: payees.docs.map((item) => ({ id: item.id, ...item.data() })),
      month: monthDoc.exists() ? monthDoc.data() : null,
      rates: settings.exists() ? settings.data() : null,
    };
  },
  async savePayee(id, values, previous) {
    const { db, auth } = requireFirebaseClient();
    const ref = id ? doc(db, 'tsdPayees', id) : doc(collection(db, 'tsdPayees'));
    const meta = stamp(auth);
    const fields = Object.keys(values).filter((key) => (previous?.[key] ?? null) !== (values[key] ?? null));
    const data = { ...values, ...meta, history: withHistory(previous, fields, meta) };
    await setDoc(ref, data);
    return { id: ref.id, ...data };
  },
  async saveMonth(month, values, previous) {
    const { db, auth } = requireFirebaseClient();
    const meta = stamp(auth);
    const data = { ...values, ...meta, history: withHistory(previous, ['lines'], meta) };
    await setDoc(doc(db, 'tsdMonths', month), data);
    return data;
  },
  async saveRates(year, rates) {
    const { db, auth } = requireFirebaseClient();
    const data = { ...rates, ...stamp(auth) };
    await setDoc(doc(db, 'tsdSettings', String(year)), data);
    return data;
  },
};
