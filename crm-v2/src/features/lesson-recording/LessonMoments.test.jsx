import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LessonMoments from './LessonMoments.jsx';

const recording = {
  id: 'inv-1_1', invitationId: 'inv-1', startedAt: '2026-11-04T10:00:00.000Z', endedAt: '2026-11-04T11:00:00.000Z',
  segments: [
    { track: 'student', path: 'lessonRecordings/inv-1_1/student_000.webm', startMs: 0, durationMs: 300000 },
    { track: 'student', path: 'lessonRecordings/inv-1_1/student_001.webm', startMs: 300000, durationMs: 300000 },
    { track: 'teacher', path: 'lessonRecordings/inv-1_1/teacher_000.webm', startMs: 0, durationMs: 600000 },
  ],
};
const moments = [
  { id: 'm1', invitationId: 'inv-1', recordingId: 'inv-1_1', atMs: 310000, at: '2026-11-04T10:05:10.000Z', label: 'hea lause', byName: 'Kati' },
  { id: 'm2', invitationId: 'inv-1', recordingId: '', atMs: null, at: '2026-11-04T12:30:00.000Z', label: '', byName: 'Kati' },
];

describe('LessonMoments', () => {
  it('lists the marks; a click plays the right file a few seconds earlier', async () => {
    const service = { audioUrl: vi.fn(async (path) => `https://files.example/${path}`) };
    const { container } = render(<LessonMoments recording={recording} moments={moments} errors={[{ startMs: 20000, said: 'mina olema' }]} service={service} />);
    expect(screen.getByText('Hetked (2)')).toBeInTheDocument();
    expect(screen.getByText('hea lause')).toBeInTheDocument();
    // outside the recording: clock time, no play button
    expect(screen.getByText('ilma märksõnata')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Kuula hetke/ })).toHaveLength(2); // the list + the time line
    fireEvent.click(screen.getByRole('button', { name: 'Kuula hetke 5:10: hea lause' }));
    await waitFor(() => expect(service.audioUrl).toHaveBeenCalledWith('lessonRecordings/inv-1_1/student_001.webm'));
    const audio = container.querySelector('audio');
    await waitFor(() => expect(audio.getAttribute('src')).toBe('https://files.example/lessonRecordings/inv-1_1/student_001.webm'));
    // the error on the time line plays the student's file
    fireEvent.click(screen.getByRole('button', { name: 'Kuula viga 0:20' }));
    await waitFor(() => expect(service.audioUrl).toHaveBeenCalledWith('lessonRecordings/inv-1_1/student_000.webm'));
  });

  it('says so when the audio is gone', async () => {
    const service = { audioUrl: vi.fn().mockRejectedValue(new Error('404')) };
    render(<LessonMoments recording={recording} moments={moments} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: 'Kuula hetke 5:10: hea lause' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('60 päeva');
  });

  it('a lesson without a recording lists the marks by clock time', () => {
    render(<LessonMoments moments={moments} />);
    expect(screen.getByText('Hetked (2)')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
    expect(document.querySelector('audio')).toBeNull();
  });

  it('shows nothing without marks and audio', () => {
    const { container } = render(<LessonMoments recording={{ ...recording, segments: [] }} moments={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
