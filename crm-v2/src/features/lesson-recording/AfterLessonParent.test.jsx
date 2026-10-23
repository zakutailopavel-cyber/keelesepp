import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { AfterLesson } from './TranscriptView.jsx';

describe('AfterLesson: Kokkuvõte vanemale', () => {
  it('the teacher edits the plain text and adds it to the lesson summary', async () => {
    const summaries = { appendNote: vi.fn(async () => ({})) };
    const analysis = { focus: [{ topic: 'Osastav kääne', count: 3 }], errors: [{ said: 'a', corrected: 'b' }] };
    const recording = { studentId: 's1', invitationId: 'inv1', title: 'Tund' };
    render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 't1', displayName: 'Anna' } }}>
      <AfterLesson analysis={analysis} recording={recording} summaries={summaries} homework={{ create: vi.fn() }} words={{ add: vi.fn() }} />
    </AuthContext.Provider></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: 'Kokkuvõte vanemale' }));
    const box = screen.getByRole('textbox', { name: /Kokkuvõte vanemale ja õpilasele/ });
    expect(box.value).toContain('Tähelepanu vajab: Osastav kääne.');
    fireEvent.change(box, { target: { value: 'Mia oli tubli. Korda osastavat.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Saada' }));
    expect(await screen.findByText('Kokkuvõte on õpilase ja vanema „Tunnid” all.')).toBeInTheDocument();
    expect(summaries.appendNote).toHaveBeenCalledWith(expect.objectContaining({ invitationId: 'inv1', studentId: 's1', text: 'Mia oli tubli. Korda osastavat.' }));
  });
});
