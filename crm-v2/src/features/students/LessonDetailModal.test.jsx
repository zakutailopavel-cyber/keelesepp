import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import LessonDetailModal from './LessonDetailModal.jsx';

const none = { subscribeForStudent: vi.fn((_id, onData) => { onData([]); return () => {}; }) };

function renderLesson(recordings) {
  return render(<MemoryRouter><LessonDetailModal
    lesson={{ date: '2026-10-09', time: '18:00' }}
    student={{ id: 's1', name: 'Ilja' }}
    user={{ uid: 't1' }}
    markLabel="Toimunud"
    onClose={vi.fn()}
    homeworkApi={{ listByStudentIds: vi.fn().mockResolvedValue([]) }}
    summaryApi={none}
    wordsApi={none}
    boardApi={{ subscribePages: vi.fn((_id, onData) => { onData([]); return () => {}; }) }}
    recordingApi={{ listForStudent: vi.fn().mockResolvedValue(recordings) }}
  /></MemoryRouter>);
}

describe('LessonDetailModal: the lesson text', () => {
  it('shows the transcript of the day right away, without another window', async () => {
    renderLesson([{ id: 'r1', status: 'done', startedAt: '2026-10-09T15:00:00Z', title: 'Eesti keel', teacherName: 'Pavel', segments: [{}], transcript: [
      { speaker: 'teacher', startMs: 0, text: 'Tere, Ilja!' },
      { speaker: 'student', startMs: 2000, text: 'Tere! Mul läheb hästi.' },
    ] }]);
    expect(await screen.findByText('Tere! Mul läheb hästi.')).toBeInTheDocument();
    expect(screen.getByText('Õpilase osa kõnest')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Tunni analüüs/ })).toBeNull();
  });

  it('says what the text is waiting for, and when a recording had no speech', async () => {
    renderLesson([
      { id: 'r2', status: 'transcribing', startedAt: '2026-10-09T15:00:00Z', title: 'Tund', segments: [], transcript: [] },
      { id: 'r3', status: 'done', startedAt: '2026-10-09T16:00:00Z', title: 'Tund', segments: [], transcript: [] },
    ]);
    expect(await screen.findByText(/Tekst ilmub siia mõne minuti jooksul/)).toBeInTheDocument();
    expect(screen.getByText(/ei leitud kõnet/)).toBeInTheDocument();
  });
});
