import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// Worksheet constructor: blocks teachers saved as their own templates, shared with all staff.
const COLLECTION = 'worksheetBlockTemplates';

const clean = (value) => JSON.parse(JSON.stringify(value ?? null));

export const worksheetTemplatesService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(200)));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
  },

  async create({ title, block, user }) {
    const name = String(title || '').trim().slice(0, 120);
    if (!name) throw new Error('Anna mallile nimi.');
    if (!block?.type) throw new Error('Mall peab sisaldama plokki.');
    const stored = clean({ ...block, id: undefined });
    if (JSON.stringify(stored).length > 200000) throw new Error('Plokk on malliks liiga suur.');
    const { db } = requireFirebaseClient();
    const record = { title: name, block: stored, ownerUid: user?.uid || '', ownerName: user?.displayName || user?.email || '', createdAt: new Date().toISOString() };
    const ref = await addDoc(collection(db, COLLECTION), record);
    return { id: ref.id, ...record };
  },

  async remove(id) {
    const { db } = requireFirebaseClient();
    await deleteDoc(doc(db, COLLECTION, id));
  },
};
