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
    expect(state).toEqual({ known: true, online: true, busy: true, host: 'Kooli-Mac', analyzing: [] });
    expect(transcriberLabel(state)).toContain('Kooli-Mac');
  });
  it('has no label before the status is known', () => {
    expect(transcriberLabel({ known: false })).toBe('');
    expect(transcriberLabel(transcriberState([], now))).toMatch(/ei tööta/);
  });
});

describe('analysisStatus', () => {
  const done = { id: 'a', status: 'done', transcript: [{ speaker: 'student', text: 'Tere' }], parts: ['a', 'b'] };
  it('says where the AI analysis of a lesson is', async () => {
    const { analysisStatus, transcriberState } = await import('./transcriberStatus.js');
    const now = Date.parse('2026-10-10T10:00:00Z');
    const busy = transcriberState([{ host: 'Mac', lastSeenAt: '2026-10-10T09:59:30Z', state: 'analyzing', recordingId: 'b', recordingIds: ['a', 'b'], detail: 'vead 8/40' }], now);
    expect(analysisStatus(done, busy)).toMatchObject({ key: 'running', label: 'Analüüsin… vead 8/40' });
    const idle = transcriberState([{ host: 'Mac', lastSeenAt: '2026-10-10T09:59:30Z', state: 'idle' }], now);
    expect(analysisStatus(done, idle).key).toBe('waiting');
    expect(analysisStatus(done, transcriberState([], now)).key).toBe('offline');
    expect(analysisStatus({ ...done, analysis: { version: 3, errors: [] } }, idle).key).toBe('ready');
    expect(analysisStatus({ ...done, analysis: { version: 3, error: 'x' } }, idle).key).toBe('failed');
    expect(analysisStatus({ ...done, status: 'uploaded' }, idle)).toBeNull();
  });
});
