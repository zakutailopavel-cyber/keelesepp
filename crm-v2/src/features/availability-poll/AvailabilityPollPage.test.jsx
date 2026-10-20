import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AvailabilityPollPage from './AvailabilityPollPage.jsx';
import { cellsOf, pollPayload } from './pollModel.js';

describe('„Sobivad ajad”', () => {
  it('a tap cycles suits → best → empty; an hour goes as its two half hours', () => {
    expect(pollPayload({ 'Mon-16': 'ok', 'Wed-10': 'best', 'Fri-09': '' })).toEqual({ slots: ['Mon-16:00', 'Mon-16:30', 'Wed-10:00', 'Wed-10:30'], preferred: ['Wed-10:00', 'Wed-10:30'] });
    expect(cellsOf(['Mon-16:00', 'Mon-16:30', 'Wed-10:00'], ['Wed-10:00'])).toEqual({ 'Mon-16': 'ok', 'Wed-10': 'best' });
  });

  it('an adult learner ticks the box and gives no parent', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    render(<AvailabilityPollPage post={post} />);
    fireEvent.click(screen.getByRole('button', { name: 'ET' }));
    fireEvent.click(screen.getByLabelText(/täiskasvanud õpilane/));
    expect(screen.queryByLabelText(/Lapsevanema/)).toBeNull();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'E 16:00' }));
    fireEvent.change(screen.getByLabelText(/Sinu ees- ja perekonnanimi/), { target: { value: 'Viktoria Tamm' } });
    fireEvent.change(screen.getByLabelText('Telefon'), { target: { value: '55555555' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Saada ajad/ })); });
    expect(post).toHaveBeenCalledWith(expect.objectContaining({ adult: true, name: 'Viktoria Tamm', parentName: '' }));
  });

  it('no subject, goals or lesson count are asked (current students)', () => {
    render(<AvailabilityPollPage post={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'ET' }));
    expect(screen.queryByText('Mida soovid õppida?')).toBeNull();
    expect(screen.queryByText('Mitu tundi nädalas?')).toBeNull();
    expect(screen.queryByText('Kuidas sulle sobib?')).toBeNull();
  });

  it('the learner marks hours, gives a phone and sends; nothing goes without a time or a contact', async () => {
    const post = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    render(<AvailabilityPollPage post={post} />);
    fireEvent.click(screen.getByRole('button', { name: 'ET' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Saada ajad/ })); });
    expect(screen.getByRole('alert')).toHaveTextContent('vähemalt üks');
    fireEvent.pointerDown(screen.getByRole('button', { name: 'E 16:00' }));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'K 10:00' }));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'K 10:00' }));
    expect(screen.getAllByText('Märgitud 2 h nädalas').length).toBeGreaterThan(0);
    fireEvent.change(screen.getByLabelText(/Õpilase \(lapse\)/), { target: { value: 'Mari' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Saada ajad/ })); });
    expect(screen.getByRole('alert')).toHaveTextContent('õpilase ees- ja perekonnanimi');
    fireEvent.change(screen.getByLabelText(/Õpilase \(lapse\)/), { target: { value: 'Mari Maasikas' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Saada ajad/ })); });
    expect(screen.getByRole('alert')).toHaveTextContent('lapsevanema ees- ja perekonnanimi');
    fireEvent.change(screen.getByLabelText(/Lapsevanema/), { target: { value: 'Olga Maasikas' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Saada ajad/ })); });
    expect(screen.getByRole('alert')).toHaveTextContent('telefon või e-post');
    fireEvent.change(screen.getByLabelText('Telefon'), { target: { value: '+372 5555 5555' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Saada ajad/ })); });
    expect(post).toHaveBeenCalledWith(expect.objectContaining({ source: 'availability', name: 'Mari Maasikas', parentName: 'Olga Maasikas', slots: ['Mon-16:00', 'Mon-16:30', 'Wed-10:00', 'Wed-10:30'], preferred: ['Wed-10:00', 'Wed-10:30'] }));
    expect(screen.getByRole('status')).toHaveTextContent('Aitäh');
  });

  it('speaks Russian', () => {
    render(<AvailabilityPollPage post={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'RU' }));
    expect(screen.getByRole('heading', { name: 'Когда вам удобно заниматься?' })).toBeInTheDocument();
    expect(screen.getByText(/ВСЁ время/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Будни вечером 17–21' }));
    expect(screen.getAllByText('Отмечено 20 ч в неделю').length).toBeGreaterThan(0);
    expect(screen.getByText('Понедельник').parentElement).toHaveTextContent('17–21');
  });
});
