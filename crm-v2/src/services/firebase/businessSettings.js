import { doc, getDoc, setDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { normalizeBusinessSettings } from '../../features/finance/businessReport.js';

// businessSettings/current (admin only): the school's monthly fixed costs and the owner's own lessons for „Ärinäitajad”
export const businessSettingsService = {
  async get() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'businessSettings', 'current'));
    return normalizeBusinessSettings(snapshot.exists() ? snapshot.data() : {});
  },
  async save(values, user) {
    if (!user?.roles?.includes('admin')) throw new Error('Ainult administraator saab kulusid muuta.');
    const { db } = requireFirebaseClient();
    const value = { ...normalizeBusinessSettings(values), updatedAt: new Date().toISOString(), updatedByUid: user.uid };
    await setDoc(doc(db, 'businessSettings', 'current'), value);
    return normalizeBusinessSettings(value);
  },
};
