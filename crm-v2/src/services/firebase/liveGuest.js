import { signInWithCustomToken } from 'firebase/auth';
import { requireFirebaseClient } from './client.js';

// Live Classroom guest link (functions/live-guest.js): the teacher makes a lesson link for a student without a login;
// whoever opens it is signed in as a short-lived guest of that one lesson.
const defaultStaffOperationsUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/staffOperationsApi';
const baseUrl = () => String(import.meta.env.VITE_STAFF_OPERATIONS_API_URL || defaultStaffOperationsUrl).replace(/\/$/, '');

async function post(path, body, idToken = '') {
  const response = await globalThis.fetch(`${baseUrl()}${path}`, {
    method: 'POST',
    headers: { ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Päring ebaõnnestus.');
  return data;
}

export const isGuestSession = async (firebaseUser) => Boolean(firebaseUser && (await firebaseUser.getIdTokenResult()).claims?.liveGuest === true);

export const liveGuestService = {
  // staff: a pending invitation + link for the card → { invitationId, url, expiresAt }
  async createLink({ studentId, title }) {
    const { auth } = requireFirebaseClient();
    if (!auth.currentUser) throw new Error('Logi uuesti sisse.');
    return post('/live/guest-link', { studentId, title, origin: globalThis.location?.origin || '' }, await auth.currentUser.getIdToken());
  },
  // anyone with the link: joins and signs this browser in as the lesson's guest (an earlier guest keeps its uid)
  async join(token) {
    const { auth } = requireFirebaseClient();
    const current = auth.currentUser;
    const guestToken = current && await isGuestSession(current) ? await current.getIdToken() : '';
    const data = await post('/live/guest-join', { token }, guestToken);
    if (!current || current.uid !== data.uid) await signInWithCustomToken(auth, data.token);
    return data;
  },
  // the signed-in person (a teacher testing the link, a parent) — the guest page asks before replacing the session
  currentAccount() {
    const { auth } = requireFirebaseClient();
    return auth.currentUser;
  },
};
