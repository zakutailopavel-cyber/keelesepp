import { addDoc, collection, doc, getDocs, limit, orderBy, query, updateDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { templateRecord } from '../../features/worksheet-studio/sheetReuse.js';

// Whole-sheet and whole-lesson templates of the constructor („Salvesta mallina”, „Uus mallist”), shared with all staff.
// Rules (firestore.rules `worksheetTemplates`): staff read and create their own; the author or an admin renames or
// archives; nothing is deleted. Block templates stay in `worksheetBlockTemplates` (worksheetTemplates.js).
const COLLECTION = 'worksheetTemplates';

export const worksheetSheetTemplatesService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(150)));
    return snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })).filter((entry) => entry.archived !== true);
  },

  async create({ kind, title, sheets, user }) {
    const record = templateRecord({ kind, title, sheets });
    const now = new Date().toISOString();
    const stored = JSON.parse(JSON.stringify({
      ...record, ownerUid: user?.uid || '', ownerName: user?.displayName || user?.email || '', createdAt: now, updatedAt: now, archived: false,
    }));
    const { db } = requireFirebaseClient();
    const ref = await addDoc(collection(db, COLLECTION), stored);
    return { id: ref.id, ...stored };
  },

  async archive(id, user) {
    const { db } = requireFirebaseClient();
    const now = new Date().toISOString();
    await updateDoc(doc(db, COLLECTION, id), { archived: true, archivedAt: now, archivedBy: user?.uid || '', updatedAt: now });
  },
};
