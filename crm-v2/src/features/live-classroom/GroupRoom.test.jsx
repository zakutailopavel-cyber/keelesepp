import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import GroupRoom from './GroupRoom.jsx';

class FakeRecorder {
  static isTypeSupported() { return true; }
  constructor(stream, opts) { this.mimeType = opts?.mimeType || 'audio/webm'; this.state = 'inactive'; }
  start() { this.state = 'recording'; }
  stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new globalThis.Blob(['x']) }); this.onstop?.(); }
}
const track = (kind) => ({ kind, enabled: true, stop: vi.fn() });
const stream = () => { const tracks = [track('audio'), track('video')]; return { getTracks: () => tracks, getAudioTracks: () => [tracks[0]], getVideoTracks: () => [tracks[1]] }; };

beforeEach(() => {
  globalThis.MediaRecorder = FakeRecorder;
  globalThis.MediaStream = class { constructor(tracks) { this.tracks = tracks; } getAudioTracks() { return this.tracks; } };
});
afterEach(() => { delete globalThis.MediaRecorder; });

const room = { id: 'room-1', teacherUid: 't1', teacherName: 'Pavel', title: 'Grupp', status: 'open', members: [{ studentUid: 'u-mari', studentName: 'Mari' }, { studentUid: 'u-jaan', studentName: 'Jaan' }] };
const service = {
  subscribe: (id, cb) => { cb(room); return () => {}; }, subscribeSignals: () => () => {}, sendSignal: vi.fn(async () => {}),
  heartbeat: vi.fn(async () => {}), subscribePresence: (id, cb) => { cb([]); return () => {}; }, close: vi.fn(async () => {}),
  subscribeMessages: (id, cb) => { cb([]); return () => {}; }, sendMessage: vi.fn(),
};
const board = { subscribePages: (s, cb) => { cb([]); return () => {}; }, subscribeElements: (s, p, cb) => { cb([]); return () => {}; }, add: vi.fn(), update: vi.fn(), remove: vi.fn(), clear: vi.fn(), addPage: vi.fn() };

describe('GroupRoom recording', () => {
  it("records each student with consent separately, on the student's own invitation", async () => {
    const recordingService = { start: vi.fn(async ({ invitation }) => ({ id: `${invitation.id}_1` })), uploadSegment: vi.fn(async () => ({})), finish: vi.fn(async () => '') };
    const recordings = [
      { invitation: { id: 'inv-mari', studentId: 's-mari', studentUid: 'u-mari', studentName: 'Mari' }, consent: true },
      { invitation: { id: 'inv-jaan', studentId: 's-jaan', studentUid: 'u-jaan', studentName: 'Jaan' }, consent: false },
    ];
    render(<GroupRoom roomId="room-1" role="teacher" user={{ uid: 't1', displayName: 'Pavel' }} service={service} boardService={board} library={{ list: async () => ({ curriculumLessons: [] }) }}
      recordings={recordings} recordingService={recordingService} callOptions={{ turnService: null, mediaDevices: { getUserMedia: vi.fn(async () => stream()) }, peerFactory: () => ({}) }} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Alusta kõnet/ })); });
    await waitFor(() => expect(recordingService.start).toHaveBeenCalledTimes(1));
    expect(recordingService.start).toHaveBeenCalledWith(expect.objectContaining({ invitation: recordings[0].invitation }));
    expect(await screen.findByText(/Salvestan \(1\)/)).toBeInTheDocument();
  });
});

describe('GroupRoom prepared worksheets (2026-11-27: Anna and Timur)', () => {
  const invitations = [
    { id: 'inv-mari', studentId: 's-mari', studentUid: 'u-mari', roomKey: 'room-1', status: 'accepted' },
    { id: 'inv-jaan', studentId: 's-jaan', studentUid: 'u-jaan', roomKey: 'room-1', status: 'accepted' },
  ];
  const props = { roomId: 'room-1', user: { uid: 't1', displayName: 'Pavel' }, service, boardService: board, library: { list: async () => ({ curriculumLessons: [] }) }, callOptions: { turnService: null } };

  it("moves each joined student's prepared sheets into that student's own lesson", async () => {
    const homework = { adoptPreparedWorksheets: vi.fn(async () => 1) };
    render(<GroupRoom {...props} role="teacher" invitations={invitations} homework={homework} />);
    await waitFor(() => expect(homework.adoptPreparedWorksheets).toHaveBeenCalledTimes(2));
    expect(homework.adoptPreparedWorksheets).toHaveBeenCalledWith({ studentId: 's-mari', fromKey: 'prep_s-mari', toKey: 'inv-mari' });
    expect(homework.adoptPreparedWorksheets).toHaveBeenCalledWith({ studentId: 's-jaan', fromKey: 'prep_s-jaan', toKey: 'inv-jaan' });
  });

  it('a student in the group room moves nothing', async () => {
    const homework = { adoptPreparedWorksheets: vi.fn(async () => 1) };
    render(<GroupRoom {...props} role="student" invitations={invitations} myInvitation={invitations[0]} homework={homework} />);
    await screen.findByRole('region', { name: 'Grupitund' });
    expect(homework.adoptPreparedWorksheets).not.toHaveBeenCalled();
  });
});
