import { describe, expect, it } from 'vitest';
import { TRANSCRIBER_FRESH_MS, transcriberLabel, transcriberState } from './transcriberStatus.js';

const now = Date.parse('2026-10-04T10:00:00Z');
const at = (ms) => new Date(now - ms).toISOString();

describe('transcriberState', () => {
  it('is offline without a heartbeat or with an old one', () => {
    expect(transcriberState([], now).online).toBe(false);
    expect(transcriberState([{ id: 'mac', lastSeenAt: at(TRANSCRIBER_FRESH_MS + 1000) }], now).online).toBe(false);
    expect(transcriberState([{ id: 'mac', lastSeenAt: 'nonsense' }], now).online).toBe(false);
  });
  it('is online with a fresh heartbeat and tells when it is busy', () => {
    const state = transcriberState([
      { id: 'old', host: 'Old', lastSeenAt: at(TRANSCRIBER_FRESH_MS * 3) },
      { id: 'mac', host: 'Kooli-Mac', lastSeenAt: at(30 * 1000), state: 'transcribing' },
    ], now);
    expect(state).toEqual({ known: true, online: true, busy: true, host: 'Kooli-Mac' });
    expect(transcriberLabel(state)).toContain('Kooli-Mac');
  });
  it('has no label before the status is known', () => {
    expect(transcriberLabel({ known: false })).toBe('');
    expect(transcriberLabel(transcriberState([], now))).toMatch(/ei tööta/);
  });
});
