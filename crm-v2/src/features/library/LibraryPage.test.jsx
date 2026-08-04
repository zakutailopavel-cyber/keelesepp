import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import LibraryPage from './LibraryPage.jsx';

const data = {
  curriculumLessons: [
    { id: 'lesson-1', title: 'Pere tunnikava', description: 'Tund perest', subject: 'Eesti keel', level: 'A1', topic: 'Minu pere' },
    { id: 'worksheet-1', title: 'Pere tööleht', subject: 'Eesti keel', level: 'A1', topic: 'Minu pere', worksheetData: { blocks: [{ type: 'fill', text: 'Minu [ema] nimi on Mari.' }] }, files: [{ name: 'Pere.pdf', url: 'https://files.example/Pere.pdf' }, { name: 'Perepilt.png', url: 'https://files.example/Perepilt.png' }] },
  ],
  exercises: [
    { id: 'exercise-1', title: 'Family match', subject: 'Inglise keel', level: 'A1', topic: 'My family', type: 'match' },
  ],
};

function renderPage() {
  const repository = {
    list: vi.fn().mockResolvedValue(data),
    assign: vi.fn().mockResolvedValue({ count: 1 }),
    saveMaterial: vi.fn().mockResolvedValue({ id: 'material-1', title: 'Uus materjal', created: true }),
    uploadFile: vi.fn().mockResolvedValue({ name: 'Uus.pdf', url: 'https://files.example/Uus.pdf', size: 1200, type: 'application/pdf', storagePath: 'curriculum/Uus.pdf' }),
    deleteUploadedFile: vi.fn().mockResolvedValue(undefined),
  };
  const studentRepository = { list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', level: 'A1', active: true }] }) };
  const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
  render(<MemoryRouter><AuthContext.Provider value={{ user }}><LibraryPage repository={repository} studentRepository={studentRepository} /></AuthContext.Provider></MemoryRouter>);
  return { repository, studentRepository, user };
}

describe('LibraryPage', () => {
  it('opens the real subject, stage and topic hierarchy', async () => {
    const { repository } = renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /Eesti keel.*2 materjali/ }));
    fireEvent.click(screen.getByRole('button', { name: /A1.*2 materjali/ }));
    fireEvent.click(screen.getByRole('button', { name: /Minu pere.*2 materjali/ }));

    expect(screen.getByRole('button', { name: /Pere tunnikava/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pere tööleht/ })).toBeInTheDocument();
    expect(repository.list).toHaveBeenCalledOnce();
  });

  it('searches across both Firebase collections and opens material details', async () => {
    renderPage();
    await screen.findByRole('button', { name: /Eesti keel.*2 materjali/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'family' } });
    const exercise = screen.getByRole('button', { name: /Family match/ });
    fireEvent.click(exercise);

    const dialog = screen.getByRole('dialog', { name: 'Family match' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ava töövahend/ })).toHaveAttribute('href', 'https://www.epkoolitus.ee/haldus-exercises/?exercise=exercise-1');
  });

  it('assigns a material only to students in the teacher UID scope', async () => {
    const { repository, studentRepository, user } = renderPage();
    await screen.findByRole('button', { name: /Eesti keel.*2 materjali/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'tööleht' } });
    fireEvent.click(screen.getByRole('button', { name: /Pere tööleht/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Määra õpilastele' }));

    const checkbox = await screen.findByRole('checkbox', { name: /Mari/ });
    fireEvent.click(checkbox);
    fireEvent.change(screen.getByLabelText('Tähtaeg'), { target: { value: '2026-08-10' } });
    fireEvent.change(screen.getByLabelText('Märkus õpilasele'), { target: { value: 'Tee lõpuni' } });
    fireEvent.click(screen.getByRole('button', { name: /Määra 1 õpilasele/ }));

    expect(await screen.findByRole('status')).toHaveTextContent('määrati 1 õpilasele');
    expect(studentRepository.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'teacher-1' }));
    expect(repository.assign).toHaveBeenCalledWith(expect.objectContaining({
      students: [expect.objectContaining({ id: 'student-1' })],
      dueDate: '2026-08-10',
      note: 'Tee lõpuni',
      user,
    }));
  });

  it('previews worksheet content and PDF without a download action', async () => {
    renderPage();
    await screen.findByRole('button', { name: /Eesti keel.*2 materjali/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'tööleht' } });
    fireEvent.click(screen.getByRole('button', { name: /Pere tööleht/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Eelvaade' }));

    expect(screen.getByRole('dialog', { name: 'Eelvaade: Pere tööleht' })).toHaveTextContent('Minu ema nimi on Mari.');
    expect(screen.getByTitle('PDF: Pere.pdf')).toHaveAttribute('src', 'https://files.example/Pere.pdf#toolbar=0&navpanes=0');
    expect(screen.getByRole('img', { name: 'Perepilt.png' })).toHaveAttribute('src', 'https://files.example/Perepilt.png');
    expect(screen.queryByText(/Laadi alla/i)).not.toBeInTheDocument();
  });

  it('creates a structured material in CRM v2 and reloads the library', async () => {
    const { repository, user } = renderPage();
    await screen.findByRole('button', { name: /Eesti keel.*2 materjali/ });
    fireEvent.click(screen.getByRole('button', { name: 'Loo materjal' }));
    const editor = within(screen.getByRole('dialog', { name: 'Loo õppematerjal' }));
    fireEvent.change(editor.getByLabelText('Pealkiri *'), { target: { value: 'Uus materjal' } });
    fireEvent.change(editor.getByLabelText('Materjali tüüp'), { target: { value: 'worksheet' } });
    fireEvent.change(editor.getByLabelText('Õppeaine *'), { target: { value: 'Eesti keel' } });
    fireEvent.change(editor.getByLabelText('Tase või vanus'), { target: { value: 'A2' } });
    fireEvent.change(editor.getByLabelText('Teema'), { target: { value: 'Igapäevaelu' } });
    fireEvent.click(editor.getByRole('button', { name: 'Lisa esimene ülesanne' }));
    fireEvent.change(editor.getByLabelText('Ülesande tüüp'), { target: { value: 'fill' } });
    fireEvent.change(editor.getByLabelText('Juhis või alapealkiri'), { target: { value: 'Täida lüngad' } });
    fireEvent.change(editor.getByLabelText('Sisu'), { target: { value: 'Hommikul ma [ärkan].' } });
    const pdf = new globalThis.File(['pdf'], 'Uus.pdf', { type: 'application/pdf' });
    fireEvent.change(editor.getByLabelText('Lisa materjali failid'), { target: { files: [pdf] } });
    await waitFor(() => expect(editor.getByText('Uus.pdf')).toBeInTheDocument());
    fireEvent.click(editor.getByRole('button', { name: 'Salvesta' }));

    expect(await screen.findByRole('status')).toHaveTextContent('„Uus materjal” loodi.');
    expect(repository.saveMaterial).toHaveBeenCalledWith(expect.objectContaining({
      item: null,
      user,
      values: expect.objectContaining({ title: 'Uus materjal', materialType: 'worksheet', subject: 'Eesti keel', blocks: [expect.objectContaining({ type: 'fill', text: 'Hommikul ma [ärkan].' })], files: [expect.objectContaining({ name: 'Uus.pdf', _new: true })] }),
    }));
    expect(repository.uploadFile).toHaveBeenCalledWith(expect.objectContaining({ file: pdf, user }));
    expect(repository.list).toHaveBeenCalledTimes(2);
  });

  it('opens existing curriculum material for editing while preserving its type', async () => {
    const { repository } = renderPage();
    await screen.findByRole('button', { name: /Eesti keel.*2 materjali/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'tunnikava' } });
    fireEvent.click(screen.getByRole('button', { name: /Pere tunnikava/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Muuda' }));
    const editor = within(screen.getByRole('dialog', { name: 'Muuda: Pere tunnikava' }));
    expect(editor.getByLabelText('Materjali tüüp')).toBeDisabled();
    fireEvent.change(editor.getByLabelText('Kirjeldus *'), { target: { value: 'Uuendatud tund perest' } });
    repository.saveMaterial.mockResolvedValueOnce({ id: 'lesson-1', title: 'Pere tunnikava', created: false });
    fireEvent.click(editor.getByRole('button', { name: 'Salvesta' }));
    expect(await screen.findByRole('status')).toHaveTextContent('„Pere tunnikava” salvestati.');
  });
});
