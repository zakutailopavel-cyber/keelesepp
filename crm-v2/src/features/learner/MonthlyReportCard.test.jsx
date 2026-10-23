import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MonthlyReportCard from './MonthlyReportCard.jsx';

describe('MonthlyReportCard', () => {
  it('drafts the report, lets the admin edit it and sends only after his confirmation', async () => {
    const repository = { words: vi.fn().mockResolvedValue([]), assignments: vi.fn().mockResolvedValue([]), homework: vi.fn().mockResolvedValue([]), lessons: vi.fn().mockRejectedValue(new Error('x')), send: vi.fn().mockResolvedValue({}) };
    const confirm = vi.spyOn(globalThis, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<MonthlyReportCard student={{ id: 's1', name: 'Mia', teacher: 'Anna' }} user={{ uid: 'a', roles: ['admin'] }} repository={repository} />);
    fireEvent.click(screen.getByRole('button', { name: 'Koosta aruanne' }));
    const box = await screen.findByRole('textbox', { name: /Kontrolli ja paranda/ });
    expect(box.value).toMatch(/^Kuu kokkuvõte/);
    fireEvent.change(box, { target: { value: 'Mia oli tubli.' } });
    fireEvent.click(screen.getByRole('button', { name: /Saada vanemale/ }));
    expect(repository.send).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Saada vanemale/ }));
    await waitFor(() => expect(repository.send).toHaveBeenCalledWith({ studentId: 's1', studentName: 'Mia', teacher: 'Anna', text: 'Mia oli tubli.' }, { uid: 'a', roles: ['admin'] }));
    expect(await screen.findByText('Aruanne saadeti õpilase vestlusesse.')).toBeInTheDocument();
    confirm.mockRestore();
  });
});
