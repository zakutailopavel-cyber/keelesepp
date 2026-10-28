import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { normalizeCampaign, recordOf, validateCampaign } from '../../features/campaigns/campaignModel.js';

// „Kampaaniad” (admin only, firestore.rules campaignValid): prepared here, posted by hand; archived, never deleted
export const campaignsService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'campaigns'));
    return snapshot.docs.map((item) => normalizeCampaign(item.id, item.data()));
  },
  async create(values, user) {
    if (!user?.roles?.includes('admin')) throw new Error('Kampaaniaid teeb administraator.');
    const error = validateCampaign(values);
    if (error) throw new Error(error);
    const { db } = requireFirebaseClient();
    const reference = doc(collection(db, 'campaigns'));
    const now = new Date().toISOString();
    const value = { ...recordOf(values), createdAt: now, createdByUid: user.uid, createdByName: String(user.displayName || user.email || '').slice(0, 120), updatedAt: now };
    await setDoc(reference, value);
    return normalizeCampaign(reference.id, value);
  },
  async update(campaign, values, user) {
    if (!user?.roles?.includes('admin')) throw new Error('Kampaaniaid muudab administraator.');
    const error = validateCampaign(values);
    if (error) throw new Error(error);
    const { db } = requireFirebaseClient();
    const value = { ...recordOf(values), updatedAt: new Date().toISOString() };
    await updateDoc(doc(db, 'campaigns', campaign.id), value);
    return normalizeCampaign(campaign.id, { ...campaign, ...value });
  },
};
