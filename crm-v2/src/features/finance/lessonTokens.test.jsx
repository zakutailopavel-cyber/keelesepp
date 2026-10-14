import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import TokenInvoiceDialog from './TokenInvoiceDialog.jsx';
import LessonTokensCard from '../students/LessonTokensCard.jsx';
import { monthlyBillingRows } from './monthlyBilling.js';
import { tokenSummary } from '../../services/firebase/lessonTokens.js';

const kaarel = { id: 'k1', name: 'Kaarel Laps', subject: 'Eesti keel', parentName: 'Liis Vanem', parentEmail: 'liis@example.ee', active: true };

describe('lesson tokens', () => {
  it('an invoice for N lessons at the card price, created and e-mailed, with the current balance shown', async () => {
    const api = { createTokens: vi.fn().mockResolvedValue({ invoice: { id: 'inv1', num: 'KS-2026-300' } }) };
    const deliveryApi = { send: vi.fn().mockResolvedValue({}) };
    const tokensApi = { listByStudent: vi.fn().mockResolvedValue([{ status: 'active', balanceCredits: 2, grantedCredits: 8, consumedCredits: 6 }]) };
    const onCreated = vi.fn();
    render(<TokenInvoiceDialog studentCards={[kaarel]} plans={[{ studentId: 'k1', lessonPriceCents: 2000, lessonMinutes: 60 }]} api={api} deliveryApi={deliveryApi} tokensApi={tokensApi} onCreated={onCreated} />);
    fireEvent.click(screen.getByRole('button', { name: /Tunnipakett/ }));
    fireEvent.change(screen.getByLabelText('Õpilane ja aine'), { target: { value: 'k1' } });
    expect(await screen.findByText('2 tundi')).toBeInTheDocument();
    expect(screen.getByText('Liis Vanem')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '9' }));
    expect(screen.getByRole('status')).toHaveTextContent('9 × 20,00 € = 180,00 €');
    fireEvent.click(screen.getByRole('button', { name: 'Loo ja saada' }));
    await waitFor(() => expect(api.createTokens).toHaveBeenCalledWith(expect.objectContaining({ studentId: 'k1', lessons: 9 })));
    expect(deliveryApi.send).toHaveBeenCalledWith('inv1');
    expect(onCreated).toHaveBeenCalledWith({ id: 'inv1', num: 'KS-2026-300' }, { sent: true });
  });

  it('refuses without a lesson price on the card', async () => {
    const api = { createTokens: vi.fn() };
    render(<TokenInvoiceDialog studentCards={[kaarel]} plans={[]} api={api} tokensApi={{ listByStudent: vi.fn().mockResolvedValue([]) }} />);
    fireEvent.click(screen.getByRole('button', { name: /Tunnipakett/ }));
    fireEvent.change(screen.getByLabelText('Õpilane ja aine'), { target: { value: 'k1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Loo arve' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('tunnihind');
    expect(api.createTokens).not.toHaveBeenCalled();
  });

  it('the student card shows lessons left, a low balance and every movement', async () => {
    const service = {
      listByStudent: vi.fn().mockResolvedValue([{ id: 'p1', status: 'active', balanceCredits: 1, grantedCredits: 9, consumedCredits: 8 }]),
      ledgerByStudent: vi.fn().mockResolvedValue([
        { id: 'l2', entryType: 'lesson_consumption', lessonDate: '2026-10-14', lessonTopic: 'Võrdlemine', creditsDelta: -1, balanceAfter: 1, createdAt: '2026-10-14T10:00:00Z' },
        { id: 'l1', entryType: 'grant', sourceInvoiceNum: 'KS-2026-300', creditsDelta: 9, balanceAfter: 9, createdAt: '2026-10-01T10:00:00Z' },
      ]),
    };
    render(<LessonTokensCard student={kaarel} service={service} />);
    expect(await screen.findByText('1 tundi alles')).toBeInTheDocument();
    expect(screen.getByText('Lõppemas')).toBeInTheDocument();
    expect(screen.getByText(/arve KS-2026-300/)).toBeInTheDocument();
    expect(screen.getByText('-1 → 1')).toBeInTheDocument();
  });

  it('a package card is never offered a monthly invoice; the summary counts only active packages', () => {
    const rows = monthlyBillingRows({ month: '2031-10', students: [kaarel], plans: [{ studentId: 'k1', lessonPriceCents: 2000, billingMode: 'package' }], schedule: [{ id: 'e', studentId: 'k1', recurring: true, day: 'Wed', startDate: '2031-09-03', duration: 60 }] });
    expect(rows[0].status).toBe('package');
    expect(tokenSummary([{ status: 'active', balanceCredits: 3, grantedCredits: 4, consumedCredits: 1 }, { status: 'closed', balanceCredits: 5 }])).toEqual({ balance: 3, granted: 4, consumed: 1, packages: 1 });
  });
});
