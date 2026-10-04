import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./client.js', () => ({ requireFirebaseClient: () => ({ auth: { currentUser: { getIdToken: () => Promise.resolve('id-token') } } }) }));
const { liveTurnService } = await import('./liveTurn.js');

describe('liveTurnService', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('asks the TURN function with the user token and returns its servers', async () => {
    const fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ configured: true, iceServers: [{ urls: ['turn:turn.cloudflare.com:3478'], username: 'u', credential: 'c' }], ttl: 14400 }) });
    vi.stubGlobal('fetch', fetch);
    const result = await liveTurnService.iceServers('invite-1');
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/liveTurnApi\/ice$/), expect.objectContaining({ method: 'POST', body: JSON.stringify({ invitationId: 'invite-1' }) }));
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer id-token');
    expect(result).toEqual({ iceServers: [{ urls: ['turn:turn.cloudflare.com:3478'], username: 'u', credential: 'c' }], ttl: 14400 });
  });

  it('falls back to no relay on errors instead of failing the call', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    expect(await liveTurnService.iceServers('invite-1')).toEqual({ iceServers: [], ttl: 0 });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await liveTurnService.iceServers('invite-1')).toEqual({ iceServers: [], ttl: 0 });
    expect(await liveTurnService.iceServers('')).toEqual({ iceServers: [], ttl: 0 });
  });
});
