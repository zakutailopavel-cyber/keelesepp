import { dayKey, lessonAnalysis, lessonTimeline } from './lessonTimeline.js';

describe('lesson timeline', () => {
  it('pairs each recording with the board page of the same day and keeps board-only days', () => {
    const recordings = [{ id: 'r1', startedAt: '2026-10-04T15:00:00', title: 'Eesti keel' }];
    const pages = [
      { id: 'p1', title: 'Tund 04.10.2026', createdAt: new Date('2026-10-04T15:05:00') },
      { id: 'p0', title: 'Tund 01.10.2026', createdAt: { toDate: () => new Date('2026-10-01T10:00:00') } },
    ];
    const rows = lessonTimeline(recordings, pages);
    expect(rows.map((row) => [row.day, row.recording?.id || null, row.pageId])).toEqual([['2026-10-04', 'r1', 'p1'], ['2026-10-01', null, 'p0']]);
    expect(dayKey('nonsense')).toBe('');
  });

  it('counts who talked how much, the student turns, longest answer and questions', () => {
    const analysis = lessonAnalysis([
      { speaker: 'teacher', startMs: 0, endMs: 6000, text: 'Kuidas sul läheb täna?' },
      { speaker: 'student', startMs: 6000, endMs: 8000, text: 'Hästi, aitäh.' },
      { speaker: 'student', startMs: 8000, endMs: 12000, text: 'Ma käisin eile poes ja ostsin leiba' },
      { speaker: 'teacher', startMs: 12000, endMs: 14000, text: 'Tubli.' },
      { speaker: 'student', startMs: 14000, endMs: 16000, text: 'Mis see sõna tähendab?' },
    ]);
    expect(analysis.student).toEqual({ words: 13, ms: 8000, turns: 2 });
    expect(analysis.teacher.turns).toBe(2);
    expect(analysis.studentShare).toBe(50);
    expect(analysis.longestStudentLine).toBe('Ma käisin eile poes ja ostsin leiba');
    expect(analysis.studentQuestions).toEqual(['Mis see sõna tähendab?']);
  });
});
