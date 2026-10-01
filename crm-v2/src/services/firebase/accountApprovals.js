import { collection, doc, getDocFromServer, getDocs, query, where } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// Parents and students who registered themselves wait as approvalStatus "pending" until an
// administrator approves them; the decision runs on the server (links the student card, e-mails the person).
const defaultStaffOperationsUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/staffOperationsApi';
export const APPROVAL_RESPONSE_LOST_MESSAGE = 'Konto kinnitati, kuid vastust ei saadud. E-kiri võis jääda saatmata.';

export function normalizeAccount(id, data = {}) {
  return {
    id,
    displayName: data.displayName || data.email || 'Nimeta konto',
    email: data.email || '',
    role: data.role || '',
    childName: data.childName || '',
    preferredTeacher: data.preferredTeacher || '',
    createdAt: data.createdAt || '',
    approvalStatus: data.approvalStatus || 'approved',
    approvalReason: data.approvalReason || '',
    approvalDecidedAt: data.approvalDecidedAt || '',
  };
}

export const accountApprovalsService = {
  async list(status = 'pending') {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'users'), where('approvalStatus', '==', status)));
    return snapshot.docs.map((d) => normalizeAccount(d.id, d.data()))
      .sort((a, b) => String(b.approvalDecidedAt || b.createdAt).localeCompare(String(a.approvalDecidedAt || a.createdAt)));
  },

  async decide({ uid, decision, reason = '' }) {
    const { auth, db } = requireFirebaseClient();
    if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
    const token = await auth.currentUser.getIdToken();
    const baseUrl = String(import.meta.env.VITE_STAFF_OPERATIONS_API_URL || defaultStaffOperationsUrl).replace(/\/$/, '');
    let response;
    let data;
    try {
      response = await globalThis.fetch(`${baseUrl}/accounts/approval`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, decision, reason }),
      });
      data = await response.json().catch((error) => {
        if (response.ok) throw error;
        return {};
      });
    } catch {
      if (decision === 'approve') {
        // A network failure can happen after the server commits. Read the authoritative profile,
        // never a cached/default status, before reporting success or inviting a second approval.
        try {
          const snapshot = await getDocFromServer(doc(db, 'users', uid));
          if (snapshot.exists() && snapshot.data()?.approvalStatus === 'approved') {
            return { uid, approvalStatus: 'approved', mailed: false, responseLost: true, message: APPROVAL_RESPONSE_LOST_MESSAGE };
          }
        } catch { /* Reconciliation failed: retain the network error below. */ }
      }
      throw new Error('Konto kinnitamise serveriga ei õnnestunud ühendust saada. Ava CRM aadressil https://crm.epkoolitus.ee ja proovi uuesti.');
    }
    if (!response.ok) throw new Error(data.error || 'Otsust ei õnnestunud salvestada.');
    return data;
  },
};
