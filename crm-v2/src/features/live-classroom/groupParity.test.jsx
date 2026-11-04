import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createGroupTalkTracker, groupTalkRows, talkHint } from './talkMeter.js';
import GroupTalkMeter from './GroupTalkMeter.jsx';
import MomentButton from './MomentButton.jsx';
import GroupLessonHints from './GroupLessonHints.jsx';
import GroupRoom from './GroupRoom.jsx';
import { momentRecord } from '../lesson-recording/lessonMoments.js';

// Group room parity (2026-11-04): „Hetk”, „Kõneaeg”, „Täna harjutada” and the device warning in group rooms.
afterEach(cleanup);

const SPEECH = 0.08;
const NOISE = 0.003;

describe('group talk tracker', () => {
  it('counts every side and gives the students’ share; the quietest student is marked', () => {
    const tracker = createGroupTalkTracker({ vad: { smoothing: 1 } });
    let now = 0;
    const run = (levels, ms) => { for (let t = 0; t < ms; t += 100) { now += 100; tracker.sample(levels, now, 100); } };
    const quiet = { teacher: NOISE, mari: NOISE, jaan: NOISE, olga: NOISE };
    run(quiet, 1000);
    run({ ...quiet, teacher: SPEECH }, 60_000);
    run({ ...quiet, mari: SPEECH }, 90_000);
    run({ ...quiet, jaan: SPEECH }, 45_000);
    run({ ...quiet, olga: SPEECH }, 5_000);
    const snap = tracker.snapshot(now);
    expect(snap.teacherSec).toBe(60);
    expect(snap.studentSec).toBe(140);
    expect(snap.share).toBeCloseTo(0.7, 2);
    expect(snap.people.mari.sec).toBe(90);
    expect(talkHint(snap)).toBe('good');
    const { rows, quietestId, quietLow } = groupTalkRows(snap, [{ id: 'mari', name: 'Mari' }, { id: 'jaan', name: 'Jaan' }, { id: 'olga', name: 'Olga' }]);
    expect(rows.map((row) => row.sec)).toEqual([90, 45, 5]);
    expect(rows[0].share).toBeCloseTo(0.45, 2);
    expect(quietestId).toBe('olga');
    expect(quietLow).toBe(true); // 5 s against a fair share of 140 / 3 s
  });

  it('a member who never spoke counts as 0; no „quietest” before 2 minutes of talk or with one student', () => {
    const tracker = createGroupTalkTracker({ vad: { smoothing: 1 } });
    for (let i = 1; i <= 600; i += 1) tracker.sample({ teacher: i > 10 ? SPEECH : NOISE, mari: NOISE }, i * 100, 100);
    const snap = tracker.snapshot(60_000);
    const early = groupTalkRows(snap, [{ id: 'mari', name: 'Mari' }, { id: 'jaan', name: 'Jaan' }]);
    expect(early.rows[1]).toMatchObject({ id: 'jaan', sec: 0 });
    expect(early.quietestId).toBeNull();
    expect(groupTalkRows({ ...snap, recent: { teacherSec: 300, studentSec: 0 } }, [{ id: 'mari', name: 'Mari' }]).quietestId).toBeNull();
  });
});

describe('GroupTalkMeter', () => {
  const meter = (people, extra = {}) => ({
    teacherSec: 400, studentSec: 500, share: 0.56, recent: { teacherSec: 200, studentSec: 300, share: 0.6 }, people, ...extra,
  });

  it('shows the students’ share and every student; the one who talks least is highlighted', () => {
    render(<GroupTalkMeter members={[{ id: 'mari', name: 'Mari' }, { id: 'jaan', name: 'Jaan' }]}
      meter={meter({ teacher: { sec: 400, recentSec: 200 }, mari: { sec: 450, recentSec: 280 }, jaan: { sec: 50, recentSec: 20 } })} />);
    const pill = screen.getByRole('button', { name: /Kõneaeg: õpilased räägivad 56 %, kõige vähem Jaan/ });
    expect(pill.className).toContain('tm-pill--low');
    expect(pill.textContent).toContain('vähim: Jaan');
    fireEvent.click(pill);
    const box = screen.getByRole('dialog', { name: 'Kõneaeg' });
    expect(box.textContent).toContain('Mari7:30');
    expect(box.textContent).toMatch(/Jaan · räägib kõige vähem/);
    expect(box.textContent).toContain('Jaan on viimased 10 minutit vähe rääkinud');
    expect(box.querySelector('.is-quiet').textContent).toContain('Jaan');
  });

  it('not amber when the quietest still has a fair part', () => {
    render(<GroupTalkMeter members={[{ id: 'mari', name: 'Mari' }, { id: 'jaan', name: 'Jaan' }]}
      meter={meter({ mari: { sec: 260, recentSec: 160 }, jaan: { sec: 240, recentSec: 140 } })} />);
    const pill = screen.getByRole('button', { name: /Kõneaeg/ });
    expect(pill.className).not.toContain('tm-pill--low');
    expect(pill.textContent).not.toContain('vähim');
  });

  it('measures each incoming track separately with Web Audio, never to the speakers', () => {
    vi.useFakeTimers();
    const connect = vi.fn();
    const contexts = [];
    const loud = new Set();
    class FakeContext {
      constructor() { this.state = 'running'; this.close = vi.fn(() => Promise.resolve()); this.suspend = vi.fn(() => Promise.resolve()); this.resume = vi.fn(() => Promise.resolve()); contexts.push(this); }
      createAnalyser() { const node = { fftSize: 0, getFloatTimeDomainData: (data) => data.fill(loud.has(node.trackId) ? 0.1 : 0) }; return node; }
      createMediaStreamSource(stream) { return { connect: (node) => { node.trackId = stream.tracks[0].id; connect(node); }, disconnect: vi.fn() }; }
    }
    // like a real MediaStream: the same track object on every call
    const stream = (id) => { const tracks = [{ id, kind: 'audio', enabled: true, readyState: 'live' }]; return { getAudioTracks: () => tracks }; };
    vi.stubGlobal('AudioContext', FakeContext);
    vi.stubGlobal('MediaStream', class { constructor(tracks) { this.tracks = tracks; } });
    try {
      const members = [{ id: 'u-mari', name: 'Mari' }, { id: 'u-jaan', name: 'Jaan' }];
      const { unmount } = render(<GroupTalkMeter local={stream('t')} remotes={[{ uid: 'u-mari', stream: stream('m') }, { uid: 'u-jaan', stream: stream('j') }]} members={members} />);
      expect(contexts).toHaveLength(1);
      act(() => { vi.advanceTimersByTime(500); });
      loud.add('m');
      act(() => { vi.advanceTimersByTime(3000); });
      // only Mari talks: the students have all of the talk
      fireEvent.click(screen.getByRole('button', { name: /Kõneaeg: õpilased räägivad 100 %/ }));
      expect(screen.getByRole('dialog').textContent).toMatch(/Mari0:0[23]/);
      expect(connect).toHaveBeenCalledTimes(3);
      expect(connect.mock.calls.every(([node]) => node && 'getFloatTimeDomainData' in node)).toBe(true);
      unmount();
      expect(contexts[0].close).toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
});

describe('group „Hetk”', () => {
  const user = { uid: 't1', displayName: 'Kati' };
  const targets = [
    { invitation: { id: 'inv-mari', studentId: 's-mari', teacherUid: 't1' }, recording: { id: 'inv-mari_1', t0: Date.now() - 30_000 } },
    { invitation: { id: 'inv-jaan', studentId: 's-jaan', teacherUid: 't1' }, recording: null },
  ];
  const fakeService = () => ({
    add: vi.fn(),
    addMany: vi.fn(async (records) => records.map((record, i) => ({ id: `m${i}`, ...record }))),
    setLabel: vi.fn(async () => 'x'),
    remove: vi.fn(async () => {}),
  });

  it('one press marks every student of the room on his own invitation and recording', async () => {
    const service = fakeService();
    render(<MomentButton targets={targets} groupRoomId="room-1" user={user} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: /Hetk/ }));
    await waitFor(() => expect(service.addMany).toHaveBeenCalledTimes(1));
    const [mari, jaan] = service.addMany.mock.calls[0][0];
    expect(mari).toMatchObject({ invitationId: 'inv-mari', studentId: 's-mari', recordingId: 'inv-mari_1', groupRoomId: 'room-1', byUid: 't1' });
    expect(mari.atMs).toBeGreaterThanOrEqual(30_000);
    expect(jaan).toMatchObject({ invitationId: 'inv-jaan', studentId: 's-jaan', recordingId: '', atMs: null, groupRoomId: 'room-1' });
    expect(mari.at).toBe(jaan.at);
    expect(service.add).not.toHaveBeenCalled();
    const input = await screen.findByRole('textbox', { name: /märksõna/ });
    fireEvent.change(input, { target: { value: 'paaristöö' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(service.setLabel).toHaveBeenCalledTimes(2));
    expect(service.setLabel.mock.calls).toEqual([['m0', 'paaristöö'], ['m1', 'paaristöö']]);
  });

  it('„Kustuta hetk” removes all of them; no student yet → a message', async () => {
    const service = fakeService();
    const { rerender } = render(<MomentButton targets={targets} groupRoomId="room-1" user={user} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: /Hetk/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Kustuta hetk' }));
    await waitFor(() => expect(service.remove).toHaveBeenCalledTimes(2));
    rerender(<MomentButton targets={[]} groupRoomId="room-1" user={user} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: /Hetk/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Tunnis pole veel ühtegi õpilast');
  });

  it('a 1:1 moment has no groupRoomId field', () => {
    expect(momentRecord({ invitation: targets[0].invitation, user })).not.toHaveProperty('groupRoomId');
    expect(momentRecord({ invitation: targets[0].invitation, user, groupRoomId: 'room-1' }).groupRoomId).toBe('room-1');
  });
});

const record = (id, invitationId, startedAt, errors) => ({ id, invitationId, startedAt, analysis: { errors } });
const err = (said, corrected) => ({ said, corrected, kind: 'sõnajärg', startMs: 1000 });

describe('GroupLessonHints', () => {
  it('one chip per member with an analysed lesson; the teacher switches between them', async () => {
    try { globalThis.localStorage?.removeItem?.('keelesepp.lessonHintsOpen'); } catch { /* no storage */ }
    const service = {
      listForStudent: vi.fn(async ({ studentId }) => (studentId === 's-mari'
        ? [record('r1', 'inv-old', '2026-10-28T10:00:00Z', [err('Täna ma olen väsinud.', 'Täna olen ma väsinud.')])]
        : studentId === 's-jaan' ? [record('r2', 'inv-old2', '2026-10-29T10:00:00Z', [err('Eile ma läksin poodi.', 'Eile läksin ma poodi.')])] : [])),
    };
    const members = [
      { studentId: 's-mari', name: 'Mari', invitationId: 'inv-g1' },
      { studentId: 's-jaan', name: 'Jaan', invitationId: 'inv-g2' },
      { studentId: 's-olga', name: 'Olga', invitationId: 'inv-g3' },
    ];
    render(<GroupLessonHints members={members} user={{ uid: 't1', roles: ['teacher'] }} service={service} />);
    const box = await screen.findByRole('complementary', { name: /Täna harjutada/ });
    expect(service.listForStudent).toHaveBeenCalledTimes(3);
    expect(service.listForStudent).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's-mari', isAdmin: false }));
    const chips = screen.getAllByRole('button', { pressed: undefined }).filter((button) => button.closest('.lesson-hints__who'));
    expect(chips.map((chip) => chip.textContent)).toEqual(['Mari', 'Jaan']);
    expect(box.textContent).toContain('Täna ma olen väsinud.');
    expect(box.textContent).not.toContain('Soojendus');
    expect(box.querySelector('a').getAttribute('href')).toBe('/students/s-mari?tab=learning');
    fireEvent.click(screen.getByRole('button', { name: 'Jaan' }));
    expect(box.textContent).toContain('Eile ma läksin poodi.');
    expect(box.querySelector('a').getAttribute('href')).toBe('/students/s-jaan?tab=learning');
  });

  it('nothing when no member has an analysed lesson', async () => {
    const service = { listForStudent: vi.fn(async () => []) };
    const { container } = render(<GroupLessonHints members={[{ studentId: 's-mari', name: 'Mari' }]} user={{ uid: 't1' }} service={service} />);
    await waitFor(() => expect(service.listForStudent).toHaveBeenCalled());
    expect(container.innerHTML).toBe('');
  });
});

describe('GroupRoom (teacher): Hetk, Kõneaeg, device warning', () => {
  const room = { id: 'room-1', teacherUid: 't1', teacherName: 'Pavel', title: 'Grupp', status: 'open', members: [
    { studentUid: 'u-mari', studentName: 'Mari', studentId: 's-mari' }, { studentUid: 'u-jaan', studentName: 'Jaan', studentId: 's-jaan' }] };
  const service = {
    subscribe: (id, cb) => { cb(room); return () => {}; }, subscribeSignals: () => () => {}, sendSignal: vi.fn(async () => {}),
    heartbeat: vi.fn(async () => {}), subscribePresence: (id, cb) => { cb([]); return () => {}; }, close: vi.fn(async () => {}),
    subscribeMessages: (id, cb) => { cb([]); return () => {}; }, sendMessage: vi.fn(),
  };
  const board = { subscribePages: (s, cb) => { cb([]); return () => {}; }, subscribeElements: (s, p, cb) => { cb([]); return () => {}; }, add: vi.fn(), update: vi.fn(), remove: vi.fn(), clear: vi.fn(), addPage: vi.fn() };
  const invitations = [
    { id: 'inv-mari', studentId: 's-mari', studentUid: 'u-mari', teacherUid: 't1', roomKey: 'room-1', status: 'accepted' },
    { id: 'inv-jaan', studentId: 's-jaan', studentUid: 'u-jaan', teacherUid: 't1', roomKey: 'room-1', status: 'pending' },
  ];
  const deviceCheck = { forStudent: vi.fn(async ({ studentId }) => (studentId === 's-mari'
    ? { hasAccount: true, deviceCheck: { at: '2026-11-03T18:00:00Z', status: 'fail', issues: ['camera-busy'], browser: 'Chrome 130' }, hadLiveLesson: true }
    : { hasAccount: true, deviceCheck: null, hadLiveLesson: true })) };

  it('the teacher marks moments for the students in the lesson and sees the members’ devices before the call', async () => {
    const momentsService = { addMany: vi.fn(async (records) => records.map((r, i) => ({ id: `m${i}`, ...r }))), add: vi.fn(async (r) => ({ id: 'm0', ...r })), setLabel: vi.fn(), remove: vi.fn() };
    render(<GroupRoom roomId="room-1" role="teacher" user={{ uid: 't1', displayName: 'Pavel', roles: ['teacher'] }} service={service} boardService={board}
      library={{ list: async () => ({ curriculumLessons: [] }) }} invitations={invitations} momentsService={momentsService} deviceCheck={deviceCheck}
      callOptions={{ turnService: null, mediaDevices: { getUserMedia: vi.fn() }, peerFactory: () => ({}) }} />);
    const notice = await screen.findByRole('status', { name: 'Õpilaste seadme kontroll' });
    expect(notice.textContent).toContain('1 õpilase seadmes on viga · 1 õpilane pole seadet kontrollinud');
    expect(notice.textContent).toMatch(/Mari — viga/);
    expect(notice.textContent).toMatch(/Jaan — pole seadet kontrollinud/);
    expect(deviceCheck.forStudent).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's-mari', studentUid: 'u-mari', teacherUid: 't1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Peida seadme hoiatus' }));
    expect(screen.queryByRole('status', { name: 'Õpilaste seadme kontroll' })).toBeNull();

    // only the accepted student is in the lesson: a single press saves one moment, keyed by the room
    fireEvent.click(screen.getByRole('button', { name: /Hetk/ }));
    await waitFor(() => expect(momentsService.add).toHaveBeenCalledTimes(1));
    expect(momentsService.add.mock.calls[0][0]).toMatchObject({ invitationId: 'inv-mari', studentId: 's-mari', groupRoomId: 'room-1' });
  });

  it('a student sees neither „Hetk” nor the warning', async () => {
    render(<GroupRoom roomId="room-1" role="student" user={{ uid: 'u-mari', displayName: 'Mari' }} service={service} boardService={board}
      library={{ list: async () => ({}) }} deviceCheck={deviceCheck} callOptions={{ turnService: null, mediaDevices: { getUserMedia: vi.fn() }, peerFactory: () => ({}) }} />);
    await screen.findByText(/Pavel \+ Mari, Jaan/);
    expect(screen.queryByRole('button', { name: /Hetk/ })).toBeNull();
    expect(screen.queryByRole('status', { name: 'Õpilaste seadme kontroll' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Kõneaeg/ })).toBeNull();
  });
});
