import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FinanceDashboard from './FinanceDashboard.jsx';

describe('FinanceDashboard (calendar lessons)', () => {
  it('shows held and planned money of this month, the forecast and a month detail; can be hidden', async () => {
    const repository = { students: vi.fn(async () => [{ id: 's1', name: 'Mia', active: true }]), schedule: vi.fn(async () => [{ id: 'w1', studentId: 's1', recurring: true, day: 'Mon', startDate: '2026-09-01', time: '17:00', duration: 60, status: 'Planeeritud' }]), groups: vi.fn(async () => []) };
    render(<FinanceDashboard today={new Date('2026-10-20T12:00:00')} repository={repository} plans={[{ studentId: 's1', lessonPriceCents: 2500 }]}
      lessons={[{ id: 'l1', scheduleId: 'w1', studentId: 's1', date: '2026-10-05', status: 'Toimunud' }]} />);
    expect(await screen.findByText('Toimunud · oktoober 2026')).toBeInTheDocument();
    expect(screen.getByTestId('fd-detail')).toHaveTextContent('oktoober 2026 · toimunud 75 € (3 tundi, neist 2 märkimata) · kalendris veel 25 € (1 tundi)');
    fireEvent.click(screen.getByRole('button', { name: /november 2026: kalendris/ }));
    expect(screen.getByTestId('fd-detail')).toHaveTextContent('kalendris 125 € · 5 tundi');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Peida/ })); });
    expect(screen.queryByText('Toimunud · oktoober 2026')).toBeNull();
  });

  it('switches the period: sums from month to year and the same months ahead', async () => {
    ['keelesepp.financeDashboard.period', 'keelesepp.financeDashboard.hidden'].forEach((key) => globalThis.localStorage?.removeItem?.(key));
    const repository = { students: vi.fn(async () => [{ id: 's1', name: 'Mia', active: true }]), schedule: vi.fn(async () => [{ id: 'w1', studentId: 's1', recurring: true, day: 'Mon', startDate: '2026-09-01', time: '17:00', duration: 60, status: 'Planeeritud' }]), groups: vi.fn(async () => []) };
    render(<FinanceDashboard today={new Date('2026-10-20T12:00:00')} repository={repository} plans={[{ studentId: 's1', lessonPriceCents: 2500 }]} lessons={[]} />);
    await screen.findByText('Toimunud · oktoober 2026');
    fireEvent.click(screen.getByRole('button', { name: '3 kuud' }));
    expect(screen.getByRole('button', { name: '3 kuud' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Toimunud · aug – okt')).toBeInTheDocument();
    expect(screen.getByText('Kokku · 3 kuud')).toBeInTheDocument();
    expect(screen.getByText('Prognoos · järgmised 3 kuud')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Aasta' }));
    expect(screen.getByText('Prognoos · järgmised 12 kuud')).toBeInTheDocument();
  });
});
