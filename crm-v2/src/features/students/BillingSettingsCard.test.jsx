import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import BillingSettingsCard from './BillingSettingsCard.jsx';

const plan = { lessonPriceCents: 2500, lessonMinutes: 60, weeklyLessons: 2, billingMode: 'current', chargeNoShow: true, priceHistory: [{ lessonPriceCents: 2200, lessonMinutes: 60, validFrom: '', validTo: '2026-09-01' }] };
const save = () => act(async () => { fireEvent.click(screen.getByRole('button', { name: /Salvesta/ })); });

describe('BillingSettingsCard', () => {
  it('a card at 25 €/h is on general terms; the lesson price follows the length', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    render(<BillingSettingsCard student={{ id: 's1', name: 'Mari' }} plan={plan} canEdit onSave={onSave} />);
    expect(screen.getByText(/Näevad ainult administraator/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Üldtingimused · 25 € \/ h/ })).toBeChecked();
    expect(screen.queryByLabelText('Soodustuse põhjus')).toBeNull();
    fireEvent.change(screen.getByLabelText('Tunni pikkus'), { target: { value: '45' } });
    expect(screen.getByRole('note')).toHaveTextContent('18,75');
    fireEvent.change(screen.getByLabelText('Arveldus'), { target: { value: 'advance' } });
    await save();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ priceTerms: 'general', hourlyRateCents: 2500, discountReason: '', lessonPrice: '18.75', lessonMinutes: '45', billingMode: 'advance', chargeNoShow: true }));
    expect(screen.getByRole('status')).toHaveTextContent('salvestatud');
    expect(screen.getByText(/Varasemad hinnad \(1\)/)).toBeInTheDocument();
  });

  it('switching to a discount needs an hourly rate and a reason', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    render(<BillingSettingsCard student={{ id: 's1', name: 'Mari' }} plan={plan} canEdit onSave={onSave} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Soodustus' }));
    fireEvent.change(screen.getByLabelText('Tunnitasu (€ / h)'), { target: { value: '20' } });
    await save();
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/Kirjuta soodustuse põhjus/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Soodustuse põhjus'), { target: { value: ' Kaks last peres ' } });
    await save();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ priceTerms: 'discount', hourlyRateCents: 2000, lessonPrice: '20', discountReason: 'Kaks last peres' }));
  });

  it('an old price off the standard shows as a discount and is kept to the cent', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    const old = { lessonPriceCents: 1700, lessonMinutes: 45, weeklyLessons: 1 };
    render(<BillingSettingsCard student={{ id: 's2', name: 'Jaan' }} plan={old} canEdit onSave={onSave} />);
    expect(screen.getByRole('radio', { name: 'Soodustus' })).toBeChecked();
    expect(screen.getByLabelText('Tunnitasu (€ / h)')).toHaveValue('22,67');
    expect(screen.getByLabelText('Soodustuse põhjus')).toHaveValue('');
    expect(screen.getByLabelText('Soodustuse põhjus')).toHaveAttribute('placeholder', expect.stringMatching(/Varasem kokkulepe/));
    fireEvent.change(screen.getByLabelText('Soodustuse põhjus'), { target: { value: 'Vana leping' } });
    await save();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ priceTerms: 'discount', lessonPrice: '17', lessonMinutes: '45', discountReason: 'Vana leping' }));
  });

  it('a stored discount shows its reason and who changed it', () => {
    const discounted = { ...plan, lessonPriceCents: 2000, priceTerms: 'discount', hourlyRateCents: 2000, discountReason: 'Mitu kursust', priceTermsChangedAt: '2026-10-29T10:00:00.000Z', priceTermsChangedBy: 'Admin' };
    render(<BillingSettingsCard student={{ id: 's1' }} plan={discounted} canEdit={false} onSave={vi.fn()} />);
    expect(screen.getByLabelText('Soodustuse põhjus')).toHaveValue('Mitu kursust');
    expect(screen.getByLabelText('Soodustuse põhjus')).toBeDisabled();
    expect(screen.getByText(/muudetud 2026-10-29 · Admin/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Salvesta/ })).toBeNull();
  });

  it('a new card without a price starts on general terms (25 €/h)', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    render(<BillingSettingsCard student={{ id: 's1' }} plan={null} canEdit onSave={onSave} />);
    expect(screen.getByText('Hind määramata')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Üldtingimused/ })).toBeChecked();
    await save();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ priceTerms: 'general', lessonPrice: '25' }));
  });

  it('a card with two subjects: on a discount the second subject gets its own hourly rate and length', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    const student = { id: 'st', name: 'Stefania', subject: 'Eesti keel', enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel' }, { subject: 'Matemaatika', teacher: 'Yelyzaveta' }] };
    render(<BillingSettingsCard student={student} plan={plan} canEdit onSave={onSave} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Soodustus' }));
    fireEvent.change(screen.getByLabelText('Tunnitasu (€ / h)'), { target: { value: '22' } });
    fireEvent.change(screen.getByLabelText('Soodustuse põhjus'), { target: { value: 'Mitu kursust' } });
    fireEvent.change(screen.getByLabelText('Tunnitasu (€ / h) · Matemaatika'), { target: { value: '24' } });
    fireEvent.change(screen.getByLabelText('Tunni pikkus · Matemaatika'), { target: { value: '45' } });
    await save();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ lessonPrice: '22', subjectPrices: { Matemaatika: { lessonPrice: '18', lessonMinutes: '45' } } }));
  });
});
