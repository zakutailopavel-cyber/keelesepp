import { requireFirebaseClient } from './client.js';

// Short-lived TURN relay credentials for a Live Classroom call (functions/liveTurnApi, Cloudflare Realtime TURN).
// Any failure returns an empty list: the call then uses public STUN only, exactly as before TURN existed.
const defaultLiveTurnUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/liveTurnApi';

export const liveTurnService = {
  async iceServers(invitationId) {
    try {
      const { auth } = requireFirebaseClient();
      if (!auth.currentUser || !invitationId) return { iceServers: [], ttl: 0 };
      const token = await auth.currentUser.getIdToken();
      const baseUrl = String(import.meta.env.VITE_LIVE_TURN_API_URL || defaultLiveTurnUrl).replace(/\/$/, '');
      const response = await globalThis.fetch(`${baseUrl}/ice`, {
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
