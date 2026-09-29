import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import BillingSettingsCard from './BillingSettingsCard.jsx';

const plan = { lessonPriceCents: 2500, lessonMinutes: 60, weeklyLessons: 2, billingMode: 'current', chargeNoShow: true, priceHistory: [{ lessonPriceCents: 2200, lessonMinutes: 60, validFrom: '', validTo: '2026-09-01' }] };

describe('BillingSettingsCard', () => {
  it('lets the admin change the price and billing mode', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    render(<BillingSettingsCard student={{ id: 's1', name: 'Mari' }} plan={plan} canEdit onSave={onSave} />);
    expect(screen.getByText(/Näevad ainult administraator/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Tunni hind (€)'), { target: { value: '28' } });
    fireEvent.change(screen.getByLabelText('Arveldus'), { target: { value: 'advance' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta/ })); });
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ lessonPrice: '28', billingMode: 'advance', lessonMinutes: '60', chargeNoShow: true }));
    expect(screen.getByRole('status')).toHaveTextContent('salvestatud');
    expect(screen.getByText(/Varasemad hinnad \(1\)/)).toBeInTheDocument();
  });

  it('is read-only for the finance role and rejects an empty price', async () => {
    const { rerender } = render(<BillingSettingsCard student={{ id: 's1' }} plan={null} canEdit={false} onSave={vi.fn()} />);
    expect(screen.getByText('Hind määramata')).toBeInTheDocument();
    expect(screen.getByLabelText('Tunni hind (€)')).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Salvesta/ })).toBeNull();
    const onSave = vi.fn();
    rerender(<BillingSettingsCard student={{ id: 's1' }} plan={null} canEdit onSave={onSave} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta/ })); });
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/Sisesta tunni hind/)).toBeInTheDocument();
  });
});
