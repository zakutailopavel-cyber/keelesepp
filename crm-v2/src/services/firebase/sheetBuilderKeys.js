import { requireFirebaseClient } from './client.js';

// Keys of the ChatGPT worksheet connector (functions/sheet-builder-api.js): administrators only. The key itself is shown
// once when it is made; the server keeps only its hash.
export const SHEET_BUILDER_URL = String(import.meta.env.VITE_SHEET_BUILDER_API_URL || 'https://us-central1-keelesepp-5136b.cloudfunctions.net/sheetBuilderApi').replace(/\/$/, '');

async function call(path, { method = 'GET', body } = {}) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Logi uuesti sisse.');
  const token = await auth.currentUser.getIdToken();
  const response = await globalThis.fetch(`${SHEET_BUILDER_URL}${path}`, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Ühendus ei vastanud.');
  return data;
}

export const sheetBuilderKeysService = {
  list: () => call('/keys').then((data) => data.keys || []),
  create: (label) => call('/keys', { method: 'POST', body: { label } }),
  revoke: (id) => call('/keys/revoke', { method: 'POST', body: { id } }),
};
