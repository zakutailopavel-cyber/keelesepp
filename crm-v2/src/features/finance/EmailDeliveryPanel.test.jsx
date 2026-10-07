import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import EmailDeliveryPanel from './EmailDeliveryPanel.jsx';

describe('EmailDeliveryPanel', () => {
  it('shows that nothing gets delivered with the provider error and runs a test e-mail', async () => {
    const repository = { recent: vi.fn().mockResolvedValue([
      { id: 'q1', to: 'ema@example.com', type: 'reminder', invoiceNum: 'KS-2026-079', status: 'failed', error: 'EAUTH · 535 · Invalid login', createdAt: '2026-10-07T06:00:10.000Z' },
      { id: 'q2', to: 'isa@example.com', type: 'invoice', status: 'failed', error: 'EAUTH · 535 · Invalid login', createdAt: '2026-10-06T10:00:10.000Z' },
    ]) };
    const deliveryApi = { testEmail: vi.fn().mockResolvedValue({ ok: false, to: 'zakutailo.pavel@gmail.com', error: 'EAUTH · 535 · Invalid login' }) };
    render(<EmailDeliveryPanel repository={repository} deliveryApi={deliveryApi} />);
    expect(await screen.findByText(/Ükski viimastest kirjadest ei jõudnud kohale/)).toBeInTheDocument();
    expect(screen.getByText(/Meeldetuletus · KS-2026-079/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Saada testkiri endale/ }));
    expect(await screen.findByText(/Testkirja ei saanud saata aadressile zakutailo.pavel@gmail.com: EAUTH · 535 · Invalid login/)).toBeInTheDocument();
    expect(repository.recent).toHaveBeenCalledTimes(2);
  });

  it('shows the automatic reminders off and switches them on only after confirmation', async () => {
    const repository = { recent: vi.fn().mockResolvedValue([]) };
    let on = false;
    const deliveryApi = { testEmail: vi.fn(), reminderSettings: vi.fn(async (value) => { if (typeof value === 'boolean') on = value; return { autoEnabled: on }; }) };
    const confirm = vi.spyOn(globalThis, 'confirm').mockReturnValue(false);
    render(<EmailDeliveryPanel repository={repository} deliveryApi={deliveryApi} />);
    expect(await screen.findByText('Automaatsed meeldetuletused: VÄLJAS')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lülita sisse' }));
    expect(deliveryApi.reminderSettings).not.toHaveBeenCalledWith(true);
    confirm.mockReturnValue(true);
    fireEvent.click(screen.getByRole('button', { name: 'Lülita sisse' }));
    expect(await screen.findByText('Automaatsed meeldetuletused: SEES')).toBeInTheDocument();
    expect(deliveryApi.reminderSettings).toHaveBeenCalledWith(true);
    confirm.mockRestore();
  });
});
