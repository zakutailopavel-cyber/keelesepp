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

describe('one lesson, one row', () => {
  it('joins the parts of one invitation on one day in time order', async () => {
    const { groupRecordings } = await import('./lessonTimeline.js');
    const parts = [
      { id: 'inv1_2', invitationId: 'inv1', startedAt: '2026-10-09T15:38:22Z', endedAt: '2026-10-09T15:51:00Z', status: 'done', transcript: [{ speaker: 'student', startMs: 1000, endMs: 2000, text: 'Teine.' }], analysis: { version: 3, errors: [{ startMs: 1000, said: 'a b', corrected: 'a c' }] } },
      { id: 'inv1_1', invitationId: 'inv1', startedAt: '2026-10-09T15:19:00Z', endedAt: '2026-10-09T15:35:00Z', status: 'done', transcript: [{ speaker: 'teacher', startMs: 0, endMs: 900, text: 'Esimene.' }] },
      { id: 'inv2_1', invitationId: 'inv2', startedAt: '2026-10-10T09:00:00Z', status: 'uploaded', transcript: [] },
    ];
    const [lesson, other] = groupRecordings(parts);
    expect(lesson.id).toBe('inv1_1');
    expect(lesson.parts).toEqual(['inv1_1', 'inv1_2']);
    expect(lesson.transcript.map((l) => [l.text, l.startMs])).toEqual([['Esimene.', 0], ['Teine.', 1163000]]);
    expect(lesson.analysis.errors[0].startMs).toBe(1163000);
    expect(lesson.status).toBe('done');
    expect(other.parts).toBeUndefined();
  });

  it('uses the analysis the Mac made for the whole lesson', async () => {
    const { joinRecordingParts } = await import('./lessonTimeline.js');
    const whole = { version: 3, parts: ['a', 'b'], errors: [], summary: { kokkuvote: 'Kogu tund.' } };
    const joined = joinRecordingParts([
      { id: 'a', startedAt: '2026-10-09T10:00:00Z', status: 'done', transcript: [], analysis: whole },
      { id: 'b', startedAt: '2026-10-09T10:10:00Z', status: 'transcribing', transcript: [], analysis: { version: 3, partOf: 'a' } },
    ]);
    expect(joined.analysis).toBe(whole);
    expect(joined.status).toBe('transcribing');
  });
});
