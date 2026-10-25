import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { EMAIL_TYPES, normalizeEmailSettings } from '../../features/settings/learnerEmailModel.js';

// E-mails to students and parents (docs/EMAIL_NOTIFICATIONS.md). The administrator keeps emailSettings/learner
// (firestore.rules: admin only, full shape) and reads emailLog (no addresses). Preview and the test e-mail go through
// staffOperationsApi /learner-emails/*; the recipient's own page /e-kirjad/<token> uses /email-preferences/* without
// a login (the signed link is the permission).
const defaultApiUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/staffOperationsApi';
const apiBase = () => String(import.meta.env.VITE_STAFF_OPERATIONS_API_URL || defaultApiUrl).replace(/\/$/, '');

async function call(path, body = {}, { auth: withAuth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (withAuth) {
    const { auth } = requireFirebaseClient();
    if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
    headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
  }
  const response = await globalThis.fetch(`${apiBase()}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Päring ebaõnnestus (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return data;
}

// the stored shape (every type with every text key, so the rules can check it)
export function settingsRecord(settings, user) {
  const value = normalizeEmailSettings(settings);
  return {
    dailyHour: value.dailyHour,
    siteAddress: value.siteAddress,
    types: Object.fromEntries(EMAIL_TYPES.map(({ id }) => [id, {
      enabled: value.types[id].enabled,
      enabledAt: value.types[id].enabledAt,
      subjectEt: value.types[id].subjectEt,
      subjectRu: value.types[id].subjectRu,
      introEt: value.types[id].introEt,
      introRu: value.types[id].introRu,
    }])),
    updatedAt: new Date().toISOString(),
    updatedBy: user.uid,
    updatedByName: String(user.displayName || user.email || '').slice(0, 120),
  };
}

export const learnerEmailsService = {
  async getSettings() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'emailSettings', 'learner'));
    return normalizeEmailSettings(snapshot.exists() ? snapshot.data() : {});
  },
  async saveSettings(settings, user) {
    const { db } = requireFirebaseClient();
    const record = settingsRecord(settings, user);
    await setDoc(doc(db, 'emailSettings', 'learner'), record);
    return normalizeEmailSettings(record);
  },
  async listLog(max = 30) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(collection(db, 'emailLog'), orderBy('at', 'desc'), limit(max)));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  },
  preview(type, { language = 'both', settings = null } = {}) {
    return call('/learner-emails/preview', { type, language, ...(settings ? { settings: settingsRecord(settings, { uid: '' }) } : {}) });
  },
  sendTest(type, { language = 'both', settings = null } = {}) {
    return call('/learner-emails/test', { type, language, ...(settings ? { settings: settingsRecord(settings, { uid: '' }) } : {}) });
  },
  preferenceStatus(token) {
    return call('/email-preferences/status', { token }, { auth: false });
  },
  savePreferences(token, { optOut, language }) {
    return call('/email-preferences/save', { token, optOut: optOut === true, language }, { auth: false });
  },
};
