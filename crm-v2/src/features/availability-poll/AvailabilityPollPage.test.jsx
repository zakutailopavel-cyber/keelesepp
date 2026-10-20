import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AvailabilityPollPage from './AvailabilityPollPage.jsx';
import { cellsOf, pollPayload } from './pollModel.js';

describe('„Sobivad ajad”', () => {
  it('a tap cycles suits → best → empty; an hour goes as its two half hours', () => {
    expect(pollPayload({ 'Mon-16': 'ok', 'Wed-10': 'best', 'Fri-09': '' })).toEqual({ slots: ['Mon-16:00', 'Mon-16:30', 'Wed-10:00', 'Wed-10:30'], preferred: ['Wed-10:00', 'Wed-10:30'] });
    expect(cellsOf(['Mon-16:00', 'Mon-16:30', 'Wed-10:00'], ['Wed-10:00'])).toEqual({ 'Mon-16': 'ok', 'Wed-10': 'best' });
  });

  it('the learner marks hours, gives a phone and sends; nothing goes without a time or a contact', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    render(<AvailabilityPollPage post={post} />);
    fireEvent.click(screen.getByRole('button', { name: 'ET' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Saada' })); });
    expect(screen.getByRole('alert')).toHaveTextContent('vähemalt üks');
    fireEvent.pointerDown(screen.getByRole('button', { name: 'E 16:00' }));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'K 10:00' }));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'K 10:00' }));
    expect(screen.getByText('Märgitud 2 tundi nädalas')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nimi'), { target: { value: 'Mari' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Saada' })); });
    expect(screen.getByRole('alert')).toHaveTextContent('telefon või e-post');
    fireEvent.change(screen.getByLabelText('Telefon'), { target: { value: '+372 5555 5555' } });
    fireEvent.change(screen.getByLabelText('Õppeaine'), { target: { value: 'Matemaatika' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Saada' })); });
    expect(post).toHaveBeenCalledWith(expect.objectContaining({ source: 'availability', name: 'Mari', language: 'Matemaatika', slots: ['Mon-16:00', 'Mon-16:30', 'Wed-10:00', 'Wed-10:30'], preferred: ['Wed-10:00', 'Wed-10:30'] }));
    expect(screen.getByRole('status')).toHaveTextContent('Aitäh');
  });

  it('speaks Russian', () => {
    render(<AvailabilityPollPage post={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'RU' }));
    expect(screen.getByRole('heading', { name: 'Когда вам удобно заниматься?' })).toBeInTheDocument();
    expect(screen.getByText(/ВСЁ время/)).toBeInTheDocument();
  });
});
