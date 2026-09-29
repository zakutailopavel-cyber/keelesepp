import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import RoomRecorder from './RoomRecorder.jsx';
import RecordingIndicator from './RecordingIndicator.jsx';
import StudentRecordingsPanel from './StudentRecordingsPanel.jsx';
import { recordingLanguage } from '../../services/firebase/lessonRecordings.js';

class FakeRecorder {
  static isTypeSupported() { return true; }
  static all = [];
  constructor(stream, opts) { this.stream = stream; this.mimeType = opts?.mimeType || 'audio/webm'; this.state = 'inactive'; FakeRecorder.all.push(this); }
  start() { this.state = 'recording'; }
  stop() { this.state = 'inactive'; this.ondataavailable?.({ data: new globalThis.Blob(['x'], { type: this.mimeType }) }); this.onstop?.(); }
}
const track = () => ({ kind: 'audio' });
const stream = () => ({ getAudioTracks: () => [track()] });
const invitation = { id: 'inv-1', studentId: 'st-1', studentUid: 'su', studentName: 'Mari', teacherName: 'Kati', title: 'Eesti keel' };
const user = { uid: 't1', displayName: 'Kati' };

beforeEach(() => {
  FakeRecorder.all = [];
  globalThis.MediaRecorder = FakeRecorder;
  globalThis.MediaStream = class { constructor(tracks) { this.tracks = tracks; } getAudioTracks() { return this.tracks; } };
});
afterEach(() => { delete globalThis.MediaRecorder; });

describe('RoomRecorder', () => {
  it('needs consent from the student card', () => {
    render(<RoomRecorder invitation={invitation} user={user} streams={{}} consent={false} />);
    expect(screen.getByText(/Salvestamiseks on vaja õpilase nõusolekut/)).toBeInTheDocument();
  });

  it('records teacher and student tracks and uploads them when stopped', async () => {
    const service = {
      start: vi.fn(async () => ({ id: 'inv-1_1' })),
      uploadSegment: vi.fn(async () => ({})),
      finish: vi.fn(async () => ''),
    };
    const { rerender } = render(<RoomRecorder invitation={invitation} user={user} streams={{ local: stream(), remote: null }} consent subject="Eesti keel" service={service} />);
    fireEvent.click(screen.getByRole('button', { name: 'Alusta salvestamist' }));
    await screen.findByText(/Salvestan/);
    expect(service.start).toHaveBeenCalledWith({ invitation, user, subject: 'Eesti keel' });
    expect(screen.getByText(/ootan õpilase heli/)).toBeInTheDocument();
    rerender(<RoomRecorder invitation={invitation} user={user} streams={{ local: stream(), remote: stream() }} consent subject="Eesti keel" service={service} />);
    expect(screen.getByText(/õpetaja \+ õpilane/)).toBeInTheDocument();
    expect(FakeRecorder.all).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: /Lõpeta salvestamine/ }));
    await waitFor(() => expect(service.finish).toHaveBeenCalledWith('inv-1_1'));
    const tracks = service.uploadSegment.mock.calls.map(([seg]) => seg.track).sort();
    expect(tracks).toEqual(['student', 'teacher']);
    expect(service.uploadSegment.mock.calls[0][0]).toMatchObject({ recordingId: 'inv-1_1', seq: 0 });
    expect(await screen.findByRole('button', { name: 'Alusta salvestamist' })).toBeInTheDocument();
  });

  it('asks to start the camera and microphone first', async () => {
    render(<RoomRecorder invitation={invitation} user={user} streams={{ local: null }} consent service={{ start: vi.fn() }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Alusta salvestamist' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Käivita enne video ja mikrofon.');
  });
});

describe('RecordingIndicator', () => {
  it('shows the student when the lesson is recorded', () => {
    let push;
    const service = { subscribeForStudent: vi.fn((_q, onData) => { push = onData; return () => {}; }) };
    render(<RecordingIndicator invitation={invitation} user={{ uid: 'su' }} service={service} />);
    expect(screen.queryByRole('status')).toBeNull();
    act(() => push([{ status: 'recording' }]));
    expect(screen.getByRole('status')).toHaveTextContent('Tundi salvestatakse');
    act(() => push([{ status: 'uploaded' }]));
    expect(screen.queryByRole('status')).toBeNull();
  });
});

describe('StudentRecordingsPanel', () => {
  it('toggles consent and opens the dialogue of a transcribed lesson', async () => {
    const service = {
      listForStudent: vi.fn().mockResolvedValue([{ id: 'r1', status: 'done', startedAt: '2026-09-29T10:00:00Z', title: 'Eesti keel', teacherName: 'Kati', segments: [{}, {}], transcript: [
        { speaker: 'teacher', startMs: 0, text: 'Tere! Mis kell sa ärkad?' },
        { speaker: 'student', startMs: 4000, text: 'Ma ärkan kell seitse.' },
      ] }]),
      setConsent: vi.fn(async ({ value }) => ({ recordingConsent: value })),
    };
    render(<StudentRecordingsPanel student={{ id: 'st-1', recordingConsent: false }} user={user} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: 'Märgi nõusolek saadud' }));
    await waitFor(() => expect(service.setConsent).toHaveBeenCalledWith({ studentId: 'st-1', value: true, user }));
    expect(await screen.findByText('Nõusolek on olemas')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Ava tekst' }));
    expect(screen.getByText('Ma ärkan kell seitse.')).toBeInTheDocument();
    expect(screen.getByText('Õpilane ütles 4 sõna')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Õpilane' }));
    expect(screen.queryByText('Tere! Mis kell sa ärkad?')).toBeNull();
  });

  it('uses English for English learners', () => {
    expect(recordingLanguage('Inglise keel')).toBe('en');
    expect(recordingLanguage('Eesti keel')).toBe('et');
  });
});
