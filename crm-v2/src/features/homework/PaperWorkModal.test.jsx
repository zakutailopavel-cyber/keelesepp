import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PaperWorkModal from './PaperWorkModal.jsx';

describe('PaperWorkModal', () => {
  it('saves the exam writing points and hands the new work on for the review', async () => {
    const addPaperWork = vi.fn(async (input) => ({ id: 'p1', ...input }));
    const onCreated = vi.fn();
    render(<PaperWorkModal student={{ id: 's1', name: 'Polina' }} user={{ uid: 't1' }} repository={{ addPaperWork }} onClose={() => {}} onCreated={onCreated} />);
    ['2', '2', '3', '2'].forEach((points, index) => fireEvent.change(screen.getAllByLabelText(/^Punktid:/)[index], { target: { value: points } }));
    expect(screen.getByText('Kokku: 9 / 20 · 45%')).toBeInTheDocument();
    expect(screen.getByLabelText('Kirjutamine')).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta ja hinda' }));
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(addPaperWork.mock.calls[0][0]).toMatchObject({ title: 'Põhikooli lõpueksam · kirjutamine', skills: ['Kirjutamine'] });
    expect(addPaperWork.mock.calls[0][0].parts.map((part) => part.points)).toEqual(['2', '2', '3', '2']);
  });

  it('shows the error when the points are wrong', async () => {
    const addPaperWork = vi.fn(async () => { throw new Error('„x”: punktid 0–5.'); });
    render(<PaperWorkModal student={{ id: 's1' }} user={{ uid: 't1' }} repository={{ addPaperWork }} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta ja hinda' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('punktid 0–5');
  });
});
