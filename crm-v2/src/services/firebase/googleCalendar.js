import { requireFirebaseClient } from './client.js';

const defaultBaseUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/gcalApi';

// Teacher's own Google Calendar connection. OAuth tokens stay on the server (calendarConnections);
// the browser sees only the sanitized status.
async function request(path, { method = 'GET', query = {}, body } = {}) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
  const token = await auth.currentUser.getIdToken();
  const baseUrl = String(import.meta.env.VITE_GCAL_API_URL || defaultBaseUrl).replace(/\/$/, '');
  const search = new globalThis.URLSearchParams(query).toString();
  const response = await globalThis.fetch(`${baseUrl}${path}${search ? `?${search}` : ''}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Google Calendari päring ebaõnnestus.');
  return data;
}

export const googleCalendarService = {
  status(uid) {
    return request('/gcal/status', { query: { uid } });
  },
  // Google consent page; after it the server returns the teacher to `returnTo` with ?gcal=connected|error.
  async authUrl(uid, returnTo) {
    const data = await request('/gcal/auth-url', { query: { uid, returnTo } });
    return data.url;
  },
  // Light sync: only changed or failed lessons are pushed, then Google changes are imported.
  sync(uid) {
    return request('/gcal/sync', { method: 'POST', body: { uid, force: false } });
  },
  setSyncGroups(uid, syncGroups) {
    return request('/gcal/settings', { method: 'POST', body: { uid, syncGroups } });
  },
  disconnect(uid) {
    return request('/gcal/disconnect', { method: 'POST', body: { uid } });
  },
};
