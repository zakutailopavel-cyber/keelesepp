import { followupRecord, normalizeFollowup } from './studentFollowups.js';

describe('studentFollowups', () => {
  it('keeps the record within the rules: note ≤ 300, ≤ 6 reasons as text, the writer\'s uid', () => {
    const record = followupRecord({ student: { id: 's1', name: ' Mari  Maas ' }, note: `  ${'x'.repeat(400)} `, reasons: [{ code: 'a', text: '2 kodutööd tegemata' }, ...Array(8).fill('muu')] }, { uid: 'admin-1', displayName: 'Pavel' });
    expect(record).toEqual({ studentId: 's1', studentName: 'Mari Maas', note: 'x'.repeat(300), reasons: ['2 kodutööd tegemata', 'muu', 'muu', 'muu', 'muu', 'muu'], byUid: 'admin-1', byName: 'Pavel' });
    expect(Object.keys(record)).not.toContain('at'); // the server's time is added on write
  });
  it('needs a student and a signed-in user', () => {
    expect(() => followupRecord({ student: null }, { uid: 'a' })).toThrow('Õpilane puudub.');
    expect(() => followupRecord({ student: { id: 's1' } }, null)).toThrow('Logi uuesti sisse.');
  });
  it('reads a stored timestamp as ISO', () => {
    const at = new Date('2026-11-04T10:00:00Z');
    expect(normalizeFollowup('f1', { studentId: 's1', at: { toDate: () => at } }).at).toBe('2026-11-04T10:00:00.000Z');
  });
});
