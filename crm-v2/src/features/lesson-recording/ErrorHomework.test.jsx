import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import ErrorHomework from './ErrorHomework.jsx';
import { LessonAi } from './TranscriptView.jsx';

const e = (startMs, said, corrected, kind = 'vorm') => ({ startMs, said, corrected, kind, source: 'gec' });
const analysis = {
  errors: [
    e(5000, 'Ma lähen raamatukogu homme.', 'Ma lähen homme raamatukokku.', 'sõnajärg, vorm'),
    e(9000, 'Ta elab Tartu ja töötab koolis.', 'Ta elab Tartus ja töötab koolis.'),
    e(12000, 'Meie pere sõidab suvel Pärnu.', 'Meie pere sõidab suvel Pärnusse.'),
    e(15000, 'Ma tulen tööst kell viis.', 'Ma tulen töölt kell viis.'),
    { ...e(18000, 'Kas sa lähed kooli täna?', 'Kas sa lähed täna kooli?', 'sõnajärg'), source: 'teacher' },
  ],
  focus: [{ key: 'cases', topic: 'Падеж', count: 4, teacher: 0, examples: [] }],
};
const recording = { id: 'inv1_1', invitationId: 'inv1', studentId: 's1', studentName: 'Anna', language: 'et', startedAt: '2026-11-04T10:00:00Z' };
const user = { uid: 't1', displayName: 'Kati', roles: ['teacher'] };

function services() {
  const save = vi.fn(async ({ document }) => ({ id: 'draft1', title: document.meta.title }));
  return {
    save,
    createFromLesson: vi.fn(async () => ({ id: 'hw1' })),
    getById: vi.fn(async () => ({ id: 's1', name: 'Anna Tamm', level: 'A2', subject: 'Eesti keel' })),
    get value() { return { worksheets: { forStudent: () => ({ save }) }, homework: { createFromLesson: this.createFromLesson }, students: { getById: this.getById } }; },
  };
}
const renderIt = (fake, props = {}) => render(<AuthContext.Provider value={{ user }}><ErrorHomework analysis={analysis} recording={recording} services={fake.value} now={new Date('2026-11-04T12:00:00')} {...props} /></AuthContext.Provider>);

describe('ErrorHomework', () => {
  it('shows a preview draft; nothing is written until „Saada õpilasele”', async () => {
    const fake = services();
    renderIt(fake);
    fireEvent.click(screen.getByRole('button', { name: /Koosta kodutöö vigadest/ }));
    expect(await screen.findByText(/Õpilane ei näe seda enne/)).toBeInTheDocument();
    expect(screen.getByText(/Paranda lause \(4\)/)).toBeInTheDocument(); // the teacher's own line is not a row
    expect(screen.getByText(/Vali õige vorm \(\d\) · Kohakäänded/)).toBeInTheDocument();
    expect(screen.getAllByLabelText('Õpilase lause').map((input) => input.value)).toContain('Ta elab Tartu ja töötab koolis.');
    expect(fake.save).not.toHaveBeenCalled();
    expect(fake.createFromLesson).not.toHaveBeenCalled();
  });

  it('the teacher edits and removes rows; the sheet sent has exactly those rows', async () => {
    const fake = services();
    renderIt(fake);
    fireEvent.click(screen.getByRole('button', { name: /Koosta kodutöö vigadest/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Eemalda lause 1' }));
    const right = screen.getAllByLabelText('Õige lause')[0];
    fireEvent.change(right, { target: { value: 'Ta elab Tartus ning töötab koolis.' } });
    const choiceCount = screen.getAllByLabelText('Ülesanne').length;
    fireEvent.click(screen.getByRole('button', { name: 'Eemalda ülesanne 1' }));
    fireEvent.change(screen.getByLabelText('Tähtaeg'), { target: { value: '2026-11-12' } });
    fireEvent.click(screen.getByRole('button', { name: /Saada õpilasele/ }));
    await waitFor(() => expect(fake.createFromLesson).toHaveBeenCalled());
    const { document, origin, status } = fake.save.mock.calls[0][0];
    expect(status).toBe('published');
    expect(origin).toEqual({ kind: 'lesson-errors', recordingId: 'inv1_1', invitationId: 'inv1' });
    const fix = document.blocks.find((b) => b.type === 'errorfix');
    expect(fix.data.rows).toHaveLength(3);
    expect(fix.data.rows[0]).toEqual({ wrong: 'Ta elab Tartu ja töötab koolis.', answer: 'Ta elab Tartus ning töötab koolis.' });
    expect(document.blocks.find((b) => b.type === 'choice').data.questions).toHaveLength(choiceCount - 1);
    expect(document.meta.subtitle).toContain('Anna Tamm');
    expect(fake.createFromLesson).toHaveBeenCalledWith(expect.objectContaining({ due: '2026-11-12', source: 'lesson-errors', recordingId: 'inv1_1', worksheet: { id: 'draft1', title: document.meta.title } }));
    expect(await screen.findByText(/Kodutöö saadetud: tööleht „Kodutöö tunnist/)).toBeInTheDocument();
  });

  it('„Loobu” closes the draft without writing; a failure is shown', async () => {
    const fake = services();
    fake.save.mockRejectedValueOnce(new Error('permission denied'));
    renderIt(fake);
    fireEvent.click(screen.getByRole('button', { name: /Koosta kodutöö vigadest/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Loobu' }));
    expect(screen.queryByText(/eelvaade/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Koosta kodutöö vigadest/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Saada õpilasele/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('permission denied');
    expect(fake.createFromLesson).not.toHaveBeenCalled();
  });

  it('says so when the lesson has no usable sentences', async () => {
    const fake = services();
    renderIt(fake, { analysis: { errors: [e(1, 'Jah.', 'Jah, jah.')], focus: [{ key: 'vocab', count: 1 }] } });
    fireEvent.click(screen.getByRole('button', { name: /Koosta kodutöö vigadest/ }));
    expect(await screen.findByText(/pole kodutööks sobivaid lauseid/)).toBeInTheDocument();
  });

  it('is in the lesson analysis next to „Tee tööleht vigadest”', () => {
    render(<MemoryRouter><AuthContext.Provider value={{ user }}><LessonAi analysis={analysis} recording={{ ...recording, analysis }} homeworkServices={services().value} /></AuthContext.Provider></MemoryRouter>);
    expect(screen.getByRole('button', { name: /Tee tööleht vigadest/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Koosta kodutöö vigadest/ })).toBeInTheDocument();
  });
});
