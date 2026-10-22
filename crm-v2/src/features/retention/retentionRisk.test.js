import { retentionRisk } from './retentionRisk.js';

const now = Date.parse('2026-10-23T12:00:00Z');
const day = (n) => new Date(now - n * 86400000).toISOString().slice(0, 10);

describe('retention risk (owner 2026-10-23)', () => {
  const students = [
    { id: 'a', name: 'Anna', active: true },
    { id: 'b', name: 'Boris', active: true },
    { id: 'c', name: 'Carl', active: true },
    { id: 'n', name: 'Uus', active: true },
    { id: 'x', name: 'Endine', active: false },
  ];
  const lessons = [
    { studentId: 'a', date: day(40), status: 'Toimunud' }, { studentId: 'a', date: day(30), status: 'Puudus_eta' }, { studentId: 'a', date: day(23), status: 'Tühistatud' },
    { studentId: 'b', date: day(3), status: 'Toimunud' }, { studentId: 'b', date: day(10), status: 'Toimunud' },
    { studentId: 'c', date: day(25), status: 'Toimunud' },
    { studentId: 'c', date: day(-3), status: 'Planeeritud' },
    { studentId: 'x', date: day(90), status: 'Toimunud' },
  ];

  it('names the reasons and ranks the riskiest first', () => {
    const { risky } = retentionRisk({
      students, lessons, now,
      unplannedIds: ['a', 'n'],
      overdueInvoices: [{ studentId: 'a' }],
      words: [{ studentId: 'b', reviewedAt: day(2) }, { studentId: 'c', reviewedAt: day(30) }],
    });
    expect(risky.map((item) => [item.student.id, item.level])).toEqual([['a', 'high'], ['c', 'some']]);
    expect(risky[0].reasons).toEqual(['2 viimasest 3 tunnist jäi ära', 'viimane tund 40 päeva tagasi', 'järgmist tundi pole kalendris', 'tasumata arve']);
    expect(risky[1].reasons).toEqual(['viimane tund 25 päeva tagasi', 'pole 2 nädalat ise harjutanud']);
  });

  it('a new student without lessons yet is not leaving, an inactive card is left out', () => {
    const { risky } = retentionRisk({ students, lessons, now, unplannedIds: ['n', 'x'] });
    expect(risky.map((item) => item.student.id)).not.toContain('n');
    expect(risky.map((item) => item.student.id)).not.toContain('x');
  });

  it('lists packages about to end as the moment to talk about the next one', () => {
    const { renewals } = retentionRisk({ now, students: [
      { id: 'p1', name: 'P1', packageTotal: 10, packageUsed: 9 },
      { id: 'p2', name: 'P2', packageTotal: 10, packageUsed: 10 },
      { id: 'p3', name: 'P3', packageTotal: 10, packageUsed: 4 },
      { id: 'p4', name: 'P4', packageTotal: 0, packageUsed: 3 },
    ] });
    expect(renewals.map((item) => [item.student.id, item.left])).toEqual([['p2', 0], ['p1', 1]]);
  });
});
