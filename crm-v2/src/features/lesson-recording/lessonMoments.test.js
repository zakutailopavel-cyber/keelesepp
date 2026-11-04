import { describe, expect, it } from 'vitest';
import { cleanMomentLabel, isMomentKey, lessonLengthMs, momentRecord, momentsForLesson, playFrom, segmentAt } from './lessonMoments.js';
import { joinRecordingParts, lessonTimeline } from './lessonTimeline.js';

const invitation = { id: 'inv-1', studentId: 's1', teacherUid: 't1' };
const user = { uid: 't1', displayName: 'Kati' };
const NOW = Date.parse('2026-11-04T10:20:00.000Z');

describe('momentRecord', () => {
  it('keeps the offset in the running recording', () => {
    const record = momentRecord({ invitation, user, recording: { id: 'inv-1_1', t0: NOW - 754000 }, now: NOW, label: '  hea   lause ' });
    expect(record).toEqual({
      invitationId: 'inv-1', recordingId: 'inv-1_1', teacherUid: 't1', studentId: 's1', atMs: 754000,
      at: '2026-11-04T10:20:00.000Z', label: 'hea lause', byUid: 't1', byName: 'Kati', createdAt: '2026-11-04T10:20:00.000Z',
    });
  });

  it('keeps only the clock time without a recording', () => {
    const record = momentRecord({ invitation, user, now: NOW });
    expect(record.recordingId).toBe('');
    expect(record.atMs).toBeNull();
    expect(record.at).toBe('2026-11-04T10:20:00.000Z');
  });

  it('an admin marks in the teacher\'s lesson: the lesson stays the teacher\'s, the mark is the admin\'s', () => {
    const record = momentRecord({ invitation, user: { uid: 'a1', email: 'admin@x.ee' }, now: NOW });
    expect(record.teacherUid).toBe('t1');
    expect(record.byUid).toBe('a1');
    expect(record.byName).toBe('admin@x.ee');
  });

  it('needs a lesson and a user', () => {
    expect(() => momentRecord({ invitation: {}, user })).toThrow('Tund puudub.');
    expect(() => momentRecord({ invitation, user: null })).toThrow();
  });

  it('cuts long labels', () => {
    expect(cleanMomentLabel('a'.repeat(100))).toHaveLength(80);
  });
});

describe('isMomentKey', () => {
  const key = (k, extra = {}) => ({ key: k, target: { tagName: 'DIV' }, ...extra });
  it('B outside text fields, without modifiers', () => {
    expect(isMomentKey(key('b'))).toBe(true);
    expect(isMomentKey(key('B'))).toBe(true);
    expect(isMomentKey(key('m'))).toBe(false);
    expect(isMomentKey(key('b', { ctrlKey: true }))).toBe(false);
    expect(isMomentKey(key('b', { metaKey: true }))).toBe(false);
    expect(isMomentKey(key('b', { repeat: true }))).toBe(false);
    expect(isMomentKey(key('b', { target: { tagName: 'INPUT' } }))).toBe(false);
    expect(isMomentKey(key('b', { target: { tagName: 'TEXTAREA' } }))).toBe(false);
    expect(isMomentKey(key('b', { target: { isContentEditable: true } }))).toBe(false);
  });
});

describe('momentsForLesson', () => {
  const recording = { id: 'inv-1_1', invitationId: 'inv-1', startedAt: '2026-11-04T10:00:00.000Z', endedAt: '2026-11-04T11:00:00.000Z' };
  it('places recorded marks by their offset and others by the clock', () => {
    const moments = [
      { id: 'a', invitationId: 'inv-1', recordingId: 'inv-1_1', atMs: 60000, at: '2026-11-04T10:01:00.500Z' },
      { id: 'b', invitationId: 'inv-1', recordingId: '', atMs: null, at: '2026-11-04T10:30:00.000Z' },
      { id: 'c', invitationId: 'inv-1', recordingId: '', atMs: null, at: '2026-11-04T09:50:00.000Z' },
      { id: 'd', invitationId: 'inv-2', recordingId: '', atMs: null, at: '2026-11-04T10:30:00.000Z' },
    ];
    const out = momentsForLesson(recording, moments);
    expect(out.map((m) => [m.id, m.offsetMs])).toEqual([['c', null], ['a', 60000], ['b', 30 * 60000]]);
  });

  it('moves a mark of a later part by that part\'s start (like the transcript)', () => {
    const joined = joinRecordingParts([
      { id: 'inv-1_1', invitationId: 'inv-1', startedAt: '2026-11-04T10:00:00.000Z', status: 'done', segments: [{ track: 'student', seq: 0, path: 'a', startMs: 0, durationMs: 300000 }] },
      { id: 'inv-1_2', invitationId: 'inv-1', startedAt: '2026-11-04T10:10:00.000Z', status: 'done', segments: [{ track: 'student', seq: 0, path: 'b', startMs: 0, durationMs: 300000 }] },
    ]);
    expect(joined.segments.map((s) => s.startMs)).toEqual([0, 600000]);
    const out = momentsForLesson(joined, [{ id: 'x', invitationId: 'inv-1', recordingId: 'inv-1_2', atMs: 5000, at: '2026-11-04T10:10:05.000Z' }]);
    expect(out[0].offsetMs).toBe(605000);
  });
});

describe('player helpers', () => {
  const segments = [
    { track: 'student', path: 's0', startMs: 0, durationMs: 300000 },
    { track: 'student', path: 's1', startMs: 300000, durationMs: 300000 },
    { track: 'teacher', path: 't0', startMs: 0, durationMs: 300000 },
    { track: 'student', path: 's2', startMs: 700000, durationMs: 100000 },
  ];
  it('starts a few seconds earlier', () => {
    expect(playFrom(10000)).toBe(7000);
    expect(playFrom(1000)).toBe(0);
  });
  it('finds the file and the time inside it', () => {
    expect(segmentAt(segments, 310000)).toEqual({ segment: segments[1], offsetMs: 10000 });
    expect(segmentAt(segments, 10000, 'teacher')).toEqual({ segment: segments[2], offsetMs: 10000 });
    // a gap (reconnect): the next file from its start
    expect(segmentAt(segments, 650000)).toEqual({ segment: segments[3], offsetMs: 0 });
    expect(segmentAt(segments, 999999)).toEqual({ segment: segments[3], offsetMs: 100000 });
    expect(segmentAt([], 0)).toBeNull();
  });
  it('the time line is as long as the last file, line or mark', () => {
    expect(lessonLengthMs({ segments, transcript: [{ endMs: 900000 }], moments: [{ offsetMs: 100 }, { offsetMs: null }] })).toBe(900000);
  });
});

describe('lessonTimeline with moments', () => {
  it('puts marks on their lesson, a day\'s board page, or a row of their own', () => {
    const recordings = [{ id: 'inv-1_1', invitationId: 'inv-1', startedAt: '2026-11-04T10:00:00.000Z', status: 'done' }];
    const pages = [{ id: 'p1', title: 'Tund 3.11', createdAt: '2026-11-03T10:00:00.000Z' }];
    const moments = [
      { id: 'a', invitationId: 'inv-1', at: '2026-11-04T10:05:00.000Z' },
      { id: 'b', invitationId: 'inv-9', at: '2026-11-03T10:05:00.000Z' },
      { id: 'c', invitationId: 'inv-8', at: '2026-11-02T10:05:00.000Z' },
    ];
    const rows = lessonTimeline(recordings, pages, moments);
    expect(rows.map((row) => [row.key, row.moments.map((m) => m.id)])).toEqual([
      ['rec-inv-1_1', ['a']], ['page-p1', ['b']], ['moments-inv-8|2026-11-02', ['c']],
    ]);
  });
});
