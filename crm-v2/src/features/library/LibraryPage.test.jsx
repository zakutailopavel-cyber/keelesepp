import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import LibraryPage from './LibraryPage.jsx';

const data = {
  curriculumLessons: [
    { id: 'lesson-1', title: 'Pere tunnikava', description: 'Tund perest', subject: 'Eesti keel', level: 'A1', topic: 'Minu pere' },
    { id: 'worksheet-1', title: 'Pere tööleht', subject: 'Eesti keel', level: 'A1', topic: 'Minu pere', worksheetData: { blocks: [{ type: 'text', content: 'Loe juhis tähelepanelikult.' }, { type: 'fill', text: 'Minu [ema] nimi on Mari.' }] }, files: [{ name: 'Pere.pdf', url: 'https://files.example/Pere.pdf' }, { name: 'Perepilt.png', url: 'https://files.example/Perepilt.png' }] },
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
    saveExercise: vi.fn().mockResolvedValue({ id: 'exercise-new', title: 'Uus harjutus', created: true }),
    uploadFile: vi.fn().mockResolvedValue({ name: 'Uus.pdf', url: 'https://files.example/Uus.pdf', size: 1200, type: 'application/pdf', storagePath: 'curriculum/Uus.pdf' }),
    deleteUploadedFile: vi.fn().mockResolvedValue(undefined),
  };
  const studentRepository = { list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', level: 'A1', group: 'A1 õhturühm', active: true }, { id: 'student-2', name: 'Jaan', subject: 'Eesti keel', level: 'A1', group: 'A1 õhturühm', active: true }] }) };
  const groupRepository = { list: vi.fn().mockResolvedValue([{ id: 'group-1', name: 'A1 õhturühm', students: ['student-1', 'student-2'] }]) };
  const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
  render(<MemoryRouter><AuthContext.Provider value={{ user }}><LibraryPage repository={repository} studentRepository={studentRepository} groupRepository={groupRepository} /></AuthContext.Provider></MemoryRouter>);
  return { repository, studentRepository, groupRepository, user };
}

describe('LibraryPage', () => {
  it('shows every material at once as a table of contents with level and module filters', async () => {
    const { repository } = renderPage();
    expect(await screen.findByRole('button', { name: /^Pere tunnikava/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Pere tööleht/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Family match/ })).toBeInTheDocument();
    expect(screen.getByText(/^3 materjali/)).toBeInTheDocument();

    fireEvent.click(within(screen.getByRole('group', { name: 'Tase' })).getByRole('button', { name: /^A1/ }));
    const toc = within(screen.getByRole('complementary', { name: 'Moodulid' }));
    fireEvent.click(toc.getByRole('button', { name: /Minu pere/ }));
    expect(screen.getByText(/^2 materjali/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Family match/ })).not.toBeInTheDocument();
    expect(repository.list).toHaveBeenCalledOnce();
  });

  it('finds a worksheet by a word inside it and shows where it matched', async () => {
    renderPage();
    await screen.findByRole('button', { name: /^Pere tunnikava/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'juhis tähelepanelikult' } });
    expect(screen.getByText(/^1 materjali/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Pere tööleht/ })).toHaveTextContent('Tööleht:');
    expect(screen.queryByRole('button', { name: /^Pere tunnikava/ })).not.toBeInTheDocument();
  });

  it('keeps favourites and filters by them', async () => {
    renderPage();
    await screen.findByRole('button', { name: /^Pere tunnikava/ });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa lemmikutesse: Pere tööleht' }));
    expect(screen.getByRole('button', { name: 'Eemalda lemmikutest: Pere tööleht' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Lemmikud/ }));
    expect(screen.getByText(/^1 materjali/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Pere tööleht/ })).toBeInTheDocument();
  });

  it('searches across both Firebase collections and opens material details', async () => {
    renderPage();
    await screen.findByRole('button', { name: /^Pere tunnikava/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'family' } });
    const exercise = screen.getByRole('button', { name: /^Family match/ });
    fireEvent.click(exercise);

    const dialog = screen.getByRole('dialog', { name: 'Family match' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ava töövahend/ })).toHaveAttribute('href', 'https://www.epkoolitus.ee/haldus-exercises/?exercise=exercise-1');
  });

  it('assigns a material only to students in the teacher UID scope', async () => {
    const { repository, studentRepository, user } = renderPage();
    await screen.findByRole('button', { name: /^Pere tunnikava/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'tööleht' } });
    fireEvent.click(screen.getByRole('button', { name: /^Pere tööleht/ }));
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

  it('selects every student in a group when assigning a material', async () => {
    const { repository } = renderPage();
    await screen.findByRole('button', { name: /^Pere tunnikava/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'tööleht' } });
    fireEvent.click(screen.getByRole('button', { name: /^Pere tööleht/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Määra õpilastele' }));

    fireEvent.change(await screen.findByLabelText('Vali terve grupp'), { target: { value: 'group-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Määra 2 õpilasele' }));

    await waitFor(() => expect(repository.assign).toHaveBeenCalledWith(expect.objectContaining({
      students: [expect.objectContaining({ id: 'student-1' }), expect.objectContaining({ id: 'student-2' })],
    })));
  });

  it('previews worksheet content and PDF without a download action', async () => {
    renderPage();
    await screen.findByRole('button', { name: /^Pere tunnikava/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'tööleht' } });
    fireEvent.click(screen.getByRole('button', { name: /^Pere tööleht/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Eelvaade' }));

    expect(screen.getByRole('dialog', { name: 'Eelvaade: Pere tööleht' })).toHaveTextContent('Minu ema nimi on Mari.');
    expect(screen.getByRole('dialog', { name: 'Eelvaade: Pere tööleht' })).toHaveTextContent('Loe juhis tähelepanelikult.');
    expect(screen.getByTitle('PDF: Pere.pdf')).toHaveAttribute('src', 'https://files.example/Pere.pdf#toolbar=0&navpanes=0');
    expect(screen.getByRole('img', { name: 'Perepilt.png' })).toHaveAttribute('src', 'https://files.example/Perepilt.png');
    expect(screen.queryByText(/Laadi alla/i)).not.toBeInTheDocument();
  });

  it('creates a structured material in CRM v2 and reloads the library', async () => {
    const { repository, user } = renderPage();
    await screen.findByRole('button', { name: /^Pere tunnikava/ });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa materjal' }));
    const editor = within(screen.getByRole('dialog', { name: 'Loo õppematerjal' }));
    fireEvent.change(editor.getByLabelText('Pealkiri *'), { target: { value: 'Uus materjal' } });
    fireEvent.change(editor.getByLabelText('Materjali tüüp'), { target: { value: 'worksheet' } });
    fireEvent.change(editor.getByLabelText('Õppeaine *'), { target: { value: 'Eesti keel' } });
    fireEvent.change(editor.getByLabelText('Tase või vanus'), { target: { value: 'A2' } });
    fireEvent.change(editor.getByLabelText('Teema'), { target: { value: 'Igapäevaelu' } });
    fireEvent.click(editor.getByRole('button', { name: 'Lisa esimene ülesanne' }));
    fireEvent.change(editor.getByLabelText('Ülesande tüüp'), { target: { value: 'fill' } });
    fireEvent.change(editor.getByLabelText('Juhis või alapealkiri'), { target: { value: 'Täida lüngad' } });
    fireEvent.change(editor.getByLabelText('Tekst koos vastustega'), { target: { value: 'Hommikul ma [ärkan].' } });
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
    await screen.findByRole('button', { name: /^Pere tunnikava/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'tunnikava' } });
    fireEvent.click(screen.getByRole('button', { name: /^Pere tunnikava/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Muuda' }));
    const editor = within(screen.getByRole('dialog', { name: 'Muuda: Pere tunnikava' }));
    expect(editor.getByLabelText('Materjali tüüp')).toBeDisabled();
    fireEvent.change(editor.getByLabelText('Kirjeldus *'), { target: { value: 'Uuendatud tund perest' } });
    repository.saveMaterial.mockResolvedValueOnce({ id: 'lesson-1', title: 'Pere tunnikava', created: false });
    fireEvent.click(editor.getByRole('button', { name: 'Salvesta' }));
    expect(await screen.findByRole('status')).toHaveTextContent('„Pere tunnikava” salvestati.');
  });

  it('every row has a visible Muuda button: worksheets (also old image ones) open in the builder, other materials in the editor', async () => {
    const repository = { list: vi.fn().mockResolvedValue(data) };
    const user = { uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] };
    function Location() { const location = useLocation(); return <output data-testid="location">{location.pathname}</output>; }
    render(<MemoryRouter initialEntries={['/library']}><AuthContext.Provider value={{ user }}><Routes><Route path="*" element={<><LibraryPage repository={repository} studentRepository={{ list: vi.fn() }} groupRepository={{ list: vi.fn() }} /><Location /></>} /></Routes></AuthContext.Provider></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Muuda: Pere tunnikava' }));
    expect(screen.getByRole('dialog', { name: 'Muuda: Pere tunnikava' })).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Muuda: Pere tunnikava' })).getByRole('button', { name: 'Sulge' }));
    expect(screen.getByRole('button', { name: 'Muuda: Family match' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Muuda: Pere tööleht' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/library/worksheets/worksheet-1');
  });

  it('an old image-only worksheet from CRM v1 also opens in the builder', async () => {
    const repository = { list: vi.fn().mockResolvedValue({ curriculumLessons: [{ id: 'img-1', title: 'Toit pildil', type: 'worksheet', files: [{ name: 'toit.png', url: 'https://files.example/toit.png' }] }], exercises: [] }) };
    function Location() { const location = useLocation(); return <output data-testid="location">{location.pathname}</output>; }
    render(<MemoryRouter initialEntries={['/library']}><AuthContext.Provider value={{ user: { uid: 't', displayName: 'Õpetaja', roles: ['teacher'] } }}><Routes><Route path="*" element={<><LibraryPage repository={repository} studentRepository={{ list: vi.fn() }} groupRepository={{ list: vi.fn() }} /><Location /></>} /></Routes></AuthContext.Provider></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: 'Muuda: Toit pildil' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/library/worksheets/img-1');
  });

  it('opens an existing exercise in the correct editor', async () => {
    renderPage();
    await screen.findByRole('button', { name: /^Pere tunnikava/ });
    fireEvent.change(screen.getByLabelText('Otsi õppevara'), { target: { value: 'family' } });
    fireEvent.click(screen.getByRole('button', { name: /^Family match/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Muuda' }));
    const editor = within(screen.getByRole('dialog', { name: 'Muuda harjutust: Family match' }));
    expect(editor.getByLabelText('Harjutuse tüüp')).toBeDisabled();
    expect(editor.getByRole('heading', { name: 'Sobita paarid' })).toBeInTheDocument();
  });

  it('builds an advanced worksheet block in the legacy schema', async () => {
    const { repository } = renderPage();
    await screen.findByRole('button', { name: /^Pere tunnikava/ });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa materjal' }));
    const editor = within(screen.getByRole('dialog', { name: 'Loo õppematerjal' }));
    fireEvent.change(editor.getByLabelText('Pealkiri *'), { target: { value: 'Sõnapaarid' } });
    fireEvent.change(editor.getByLabelText('Materjali tüüp'), { target: { value: 'worksheet' } });
    fireEvent.change(editor.getByLabelText('Õppeaine *'), { target: { value: 'Inglise keel' } });
    fireEvent.click(editor.getByRole('button', { name: 'Lisa esimene ülesanne' }));
    fireEvent.change(editor.getByLabelText('Ülesande tüüp'), { target: { value: 'match' } });
    fireEvent.change(editor.getByLabelText('Paarid'), { target: { value: 'ema | mother\nisa | father' } });
    fireEvent.click(editor.getByRole('button', { name: 'Salvesta' }));

    await waitFor(() => expect(repository.saveMaterial).toHaveBeenCalledWith(expect.objectContaining({
      values: expect.objectContaining({ blocks: [expect.objectContaining({ type: 'match', pairs: [{ l: 'ema', r: 'mother' }, { l: 'isa', r: 'father' }] })] }),
    })));
  });
});
