import { render, screen } from '@testing-library/react';
import TranscriberPanel from './TranscriberPanel.jsx';
import { nextWindowLabel, transcriberState, transcriberTileMeta, transcriptionQueue } from './transcriberStatus.js';

const NOW = Date.parse('2026-11-24T21:30:00Z');
const rec = (id, data) => ({ id, studentName: `${id} Test`, startedAt: '2026-11-24T09:00:00Z', ...data });
const list = [
  rec('Veronika', { status: 'uploaded', endedAt: '2026-11-24T18:05:00Z' }),
  rec('Denys', { status: 'uploaded', endedAt: '2026-11-24T10:03:00Z' }),
  rec('Mykyta', { status: 'transcribing' }),
  rec('Arseni', { status: 'done', transcript: [{ text: 'x' }], transcribedAt: '2026-11-24T21:00:00Z' }),
  rec('Uljana', { status: 'done', transcript: [{ text: 'x' }], transcribedAt: '2026-11-24T08:00:00Z', analysis: { summary: {}, analyzedAt: '2026-11-24T08:30:00Z' } }),
  rec('Aleksei', { status: 'failed', error: 'read ECONNRESET', failedAt: '2026-11-20T03:00:00Z' }),
  rec('part', { status: 'uploaded', partOf: 'x' }),
];

describe('„Tundide tekst”: the transcription on the owner\'s Mac, seen on the site', () => {
  it('sorts the lessons into waiting, working, analysis, done and failed (parts of a lesson are not lessons)', () => {
    const q = transcriptionQueue(list, { now: NOW });
    expect(q.waiting.map((r) => r.id)).toEqual(['Denys', 'Veronika']);
    expect(q.working.map((r) => r.id)).toEqual(['Mykyta']);
    expect(q.analysis.map((r) => r.id)).toEqual(['Arseni']);
    expect(q.doneToday.map((r) => r.id)).toEqual(['Uljana']);
    expect(q.failed.map((r) => r.id)).toEqual(['Aleksei']);
  });

  it('knows the night window, the progress and an offline Mac', () => {
    const on = transcriberState([{ id: 'm', host: 'MacBook-Pro', state: 'transcribing', recordingId: 'Mykyta', hours: '02-07', windowOpen: true, progress: { done: 3, total: 12 }, lastSeenAt: new Date(NOW - 30000).toISOString() }], NOW);
    expect(on).toMatchObject({ online: true, hours: '02-07', windowOpen: true, current: { recordingId: 'Mykyta', progress: { done: 3, total: 12 } } });
    const off = transcriberState([{ id: 'm', host: 'MacBook-Pro', state: 'idle', hours: '02-07', lastSeenAt: '2026-11-24T10:00:00Z' }], NOW);
    expect(off).toMatchObject({ online: false, lastSeenAt: '2026-11-24T10:00:00Z', hours: '02-07' });
    expect(nextWindowLabel('02-07', new Date(2026, 10, 24, 23, 0))).toBe('homme kell 02:00');
    expect(nextWindowLabel('02-07', new Date(2026, 10, 25, 1, 0))).toBe('täna kell 02:00');
    expect(transcriberTileMeta(on, transcriptionQueue(list, { now: NOW }))).toBe('3 ootab teksti · 1 analüüsi · Mac sees');
  });

  it('shows the Mac, what it does now with its progress, the numbers and the queue by name', () => {
    const state = transcriberState([{ id: 'm', host: 'MacBook-Pro', state: 'transcribing', recordingId: 'Mykyta', hours: '02-07', windowOpen: true, progress: { done: 3, total: 12 }, lastSeenAt: new Date(NOW - 30000).toISOString() }], NOW);
    render(<TranscriberPanel state={{ known: true, ...state }} queueState={{ list, error: '' }} now={NOW} />);
    expect(screen.getByText(/Mac on sees \(MacBook-Pro\)/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Teen teksti: Mykyta');
    expect(screen.getByRole('status')).toHaveTextContent('3/12 osa');
    expect(screen.getByLabelText('Järjekord')).toHaveTextContent('Veronika');
    expect(screen.getByLabelText('Ebaõnnestunud')).toHaveTextContent('ühendus katkes');
  });
});
