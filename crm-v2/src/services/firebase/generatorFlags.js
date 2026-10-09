import { addDoc, collection, getDocs } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// „Halb lause”: sentences teachers marked bad in a worksheet; the generator never uses them again
// (worksheet-generator engine: createDiversityState({ blocked })). Staff create and read; admins delete (rules).
export const generatorFlagsService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'generatorFlags'));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async add({ text, lessonId = '', blockType = '' }, user) {
    if (!user?.uid) throw new Error('Kasutaja puudub.');
    const { db } = requireFirebaseClient();
    const ref = await addDoc(collection(db, 'generatorFlags'), {
      text: String(text || '').slice(0, 300), lessonId: String(lessonId).slice(0, 120), blockType: String(blockType).slice(0, 40),
      createdBy: user.uid, createdByName: String(user.displayName || user.email || '').slice(0, 120), createdAt: new Date().toISOString(),
    });
    return ref.id;
  },
};
