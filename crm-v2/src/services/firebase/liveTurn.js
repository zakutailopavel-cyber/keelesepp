import { requireFirebaseClient } from './client.js';

// Short-lived TURN relay credentials for a Live Classroom call (functions/liveTurnApi, Cloudflare Realtime TURN).
// Any failure returns an empty list: the call then uses public STUN only, exactly as before TURN existed.
const defaultLiveTurnUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/liveTurnApi';

const liveTurnBaseUrl = () => String(import.meta.env.VITE_LIVE_TURN_API_URL || defaultLiveTurnUrl).replace(/\/$/, '');

export const liveTurnService = {
  // a cheap request that only wakes the function up (no credentials; the answer is ignored)
  warmUp() {
    try { globalThis.fetch?.(`${liveTurnBaseUrl()}/ping`, { method: 'POST' })?.catch?.(() => {}); } catch { /* offline: the call still works */ }
  },
  // „Seadme kontroll”: the same wake-up request, awaited — true when the function is reachable (no-cors: only
  // reachability counts, so it works from any origin and reads nothing)
  async ping() {
    try { const response = await globalThis.fetch(`${liveTurnBaseUrl()}/ping`, { method: 'POST', mode: 'no-cors', cache: 'no-store' }); return Boolean(response); } catch { return false; }
  },
  async iceServers(invitationId) {
    try {
      const { auth } = requireFirebaseClient();
      if (!auth.currentUser || !invitationId) return { iceServers: [], ttl: 0 };
      const token = await auth.currentUser.getIdToken();
      const response = await globalThis.fetch(`${liveTurnBaseUrl()}/ice`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId }),
      });
      if (!response.ok) return { iceServers: [], ttl: 0 };
      const data = await response.json();
      return { iceServers: Array.isArray(data?.iceServers) ? data.iceServers : [], ttl: Number(data?.ttl) || 0 };
    } catch {
      return { iceServers: [], ttl: 0 };
    }
  },
};
