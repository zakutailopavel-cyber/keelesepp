import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MonthlyReportCard from './MonthlyReportCard.jsx';

const now = Date.parse('2026-11-04T12:00:00+02:00');
const admin = { uid: 'a', displayName: 'Anna', roles: ['admin'] };
function repo(extra = {}) {
  return {
    words: vi.fn().mockResolvedValue([]), assignments: vi.fn().mockResolvedValue([]), homework: vi.fn().mockResolvedValue([]),
    lessons: vi.fn().mockResolvedValue([{ date: '2026-10-05', status: 'Toimunud', topic: 'Pere ja kodu' }, { date: '2026-10-12', status: 'Toimunud', topic: 'Poes' }]),
    summaries: vi.fn().mockRejectedValue(new Error('x')), recordings: vi.fn().mockResolvedValue([]),
    reports: vi.fn().mockResolvedValue([{ id: 'r0', month: '2026-09', sentAt: '2026-10-02T10:00:00Z', byName: 'Anna', channel: 'copy' }]),
    markSent: vi.fn().mockImplementation(async (input) => ({ id: 'r1', ...input, sentAt: '2026-11-04T10:00:00Z', byName: 'Anna' })),
    send: vi.fn().mockResolvedValue({}),
    ...extra,
  };
}

describe('MonthlyReportCard — Kuu kokkuvõte vanemale', () => {
  it('drafts last month in the parent\'s language, copies, and records „Märgi saadetuks” — sends nothing itself', async () => {
    const repository = repo();
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(globalThis.navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<MonthlyReportCard student={{ id: 's1', name: 'Mia', parentName: 'Olga Tamm', preferredLanguage: 'et' }} user={admin} repository={repository} now={now} />);
    expect(await screen.findByText(/september 2026 · 2\.10\.2026 · Anna/)).toBeInTheDocument();
    expect(screen.getByLabelText('Kuu')).toHaveValue('2026-10');
    expect(screen.getByLabelText('Keel')).toHaveValue('et');
    fireEvent.click(screen.getByRole('button', { name: 'Koosta kokkuvõte' }));
    const box = await screen.findByRole('textbox', { name: /Kontrolli ja paranda/ });
    expect(box.value).toMatch(/^Tere, Olga!/);
    expect(box.value).toMatch(/Tunde sel kuul: 2\./);
    expect(box.value).toMatch(/• Pere ja kodu\n• Poes/);
    expect(screen.getByRole('list', { name: 'Andmed' })).toHaveTextContent('Tunde (Toimunud): 2');
    expect(repository.send).not.toHaveBeenCalled();
    expect(repository.markSent).not.toHaveBeenCalled();
    fireEvent.change(box, { target: { value: 'Tere! Mia oli tubli.' } });
    fireEvent.click(screen.getByRole('button', { name: /Kopeeri/ }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith('Tere! Mia oli tubli.'));
    fireEvent.click(screen.getByRole('button', { name: /Märgi saadetuks/ }));
    await waitFor(() => expect(repository.markSent).toHaveBeenCalledWith({ studentId: 's1', month: '2026-10', language: 'et', text: 'Tere! Mia oli tubli.', channel: 'copy', user: admin }));
    expect(await screen.findByText('Märgitud saadetuks.')).toBeInTheDocument();
    expect(screen.getByText(/oktoober 2026 · 4\.11\.2026 · Anna/)).toBeInTheDocument();
    expect(repository.send).not.toHaveBeenCalled();
  });

  it('defaults to Russian and sends to the conversation only after the admin confirms', async () => {
    const repository = repo({ reports: vi.fn().mockRejectedValue(new Error('denied')) });
    const confirm = vi.spyOn(globalThis, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<MonthlyReportCard student={{ id: 's1', name: 'Mia', teacher: 'Kati' }} user={admin} repository={repository} now={now} />);
    expect(screen.getByLabelText('Keel')).toHaveValue('ru');
    fireEvent.change(screen.getByLabelText('Kuu'), { target: { value: '2026-09' } });
    fireEvent.click(screen.getByRole('button', { name: 'Koosta kokkuvõte' }));
    const box = await screen.findByRole('textbox', { name: /Kontrolli ja paranda/ });
    expect(box.value).toMatch(/^Здравствуйте!\n\nКоротко об учёбе за месяц: сентябрь 2026 — Mia\.\nВ этом месяце уроков не было\./);
    fireEvent.click(screen.getByRole('button', { name: /Saada õpilase vestlusesse/ }));
    expect(repository.send).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Saada õpilase vestlusesse/ }));
    await waitFor(() => expect(repository.send).toHaveBeenCalledWith({ studentId: 's1', studentName: 'Mia', teacher: 'Kati', text: box.value }, admin));
    await waitFor(() => expect(repository.markSent).toHaveBeenCalledWith(expect.objectContaining({ month: '2026-09', channel: 'conversation', language: 'ru' })));
    expect(await screen.findByText('Kokkuvõte saadeti õpilase vestlusesse.')).toBeInTheDocument();
    confirm.mockRestore();
  });
});
