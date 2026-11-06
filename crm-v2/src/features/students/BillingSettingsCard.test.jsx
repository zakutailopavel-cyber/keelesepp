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

  it('a discount is one of 20 / 15 / 12 €/h plus a required reason', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    render(<BillingSettingsCard student={{ id: 's1', name: 'Mari' }} plan={plan} canEdit onSave={onSave} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Soodustus' }));
    expect(screen.getAllByRole('radio', { name: /^\d+ € \/ h$/ }).map((radio) => radio.parentElement.textContent)).toEqual(['20 € / h', '15 € / h', '12 € / h']);
    expect(screen.queryByRole('textbox', { name: /Tunnitasu/ })).toBeNull();
    await save();
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Vali tunnitasu.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: '15 € / h' }));
    await save();
    expect(screen.getByText(/Kirjuta soodustuse põhjus/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Soodustuse põhjus'), { target: { value: ' Kaks last peres ' } });
    await save();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ priceTerms: 'discount', hourlyRateCents: 1500, lessonPrice: '15', discountReason: 'Kaks last peres' }));
  });

  it('an old price off the school rates shows as „Muu” prefilled and is kept to the cent until edited', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    const old = { lessonPriceCents: 1700, lessonMinutes: 45, weeklyLessons: 1 };
    render(<BillingSettingsCard student={{ id: 's2', name: 'Jaan' }} plan={old} canEdit onSave={onSave} />);
    expect(screen.getByRole('radio', { name: 'Soodustus' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Muu' })).toBeChecked();
    expect(screen.getByLabelText('Oma tunnitasu (€ / h)')).toHaveValue('22,67');
    expect(screen.getByLabelText('Soodustuse põhjus')).toHaveAttribute('placeholder', expect.stringMatching(/Varasem kokkulepe/));
    fireEvent.change(screen.getByLabelText('Soodustuse põhjus'), { target: { value: 'Vana leping' } });
    await save();
    expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ priceTerms: 'discount', lessonPrice: '17', lessonMinutes: '45', discountReason: 'Vana leping' }));
    // edited, the own rate must be below 25 € and prices the lesson from it
    fireEvent.change(screen.getByLabelText('Oma tunnitasu (€ / h)'), { target: { value: '25' } });
    await save();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/alla 25/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Oma tunnitasu (€ / h)'), { target: { value: '18,40' } });
    await save();
    expect(onSave).toHaveBeenLastCalledWith(expect.objectContaining({ lessonPrice: '13.8', lessonMinutes: '45', hourlyRateCents: 1840 }));
  });

  it('„Muu” takes an own rate typed by the admin', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    render(<BillingSettingsCard student={{ id: 's1', name: 'Mari' }} plan={plan} canEdit onSave={onSave} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Soodustus' }));
    expect(screen.queryByRole('radio', { name: /Üldtingimused 25/ })).toBeNull();
    fireEvent.click(screen.getByRole('radio', { name: 'Muu' }));
    fireEvent.change(screen.getByLabelText('Oma tunnitasu (€ / h)'), { target: { value: '17,5' } });
    fireEvent.change(screen.getByLabelText('Soodustuse põhjus'), { target: { value: 'Kooli hea tahe' } });
    await save();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ priceTerms: 'discount', hourlyRateCents: 1750, lessonPrice: '17.5', discountReason: 'Kooli hea tahe' }));
  });

  it('a stored price at a school rate shows that rate chosen; read-only for finance with who changed it', () => {
    const discounted = { ...plan, lessonPriceCents: 2000, priceTerms: 'discount', hourlyRateCents: 2000, discountReason: 'Mitu kursust', priceTermsChangedAt: '2026-10-29T10:00:00.000Z', priceTermsChangedBy: 'Admin' };
    render(<BillingSettingsCard student={{ id: 's1' }} plan={discounted} canEdit={false} onSave={vi.fn()} />);
    expect(screen.getByRole('radio', { name: '20 € / h' })).toBeChecked();
    expect(screen.queryByRole('radio', { name: /Varasem kokkulepe/ })).toBeNull();
    expect(screen.getByLabelText('Soodustuse põhjus')).toHaveValue('Mitu kursust');
    expect(screen.getByLabelText('Soodustuse põhjus')).toBeDisabled();
    expect(screen.getByText(/muudetud 29\.10\.2026 · Admin/)).toBeInTheDocument();
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

  it('a card with two subjects: one subject at 25 €/h, the other discounted, from the same list', async () => {
    const onSave = vi.fn().mockResolvedValue({});
    const student = { id: 'st', name: 'Stefania', subject: 'Eesti keel', enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel' }, { subject: 'Matemaatika', teacher: 'Yelyzaveta' }] };
    render(<BillingSettingsCard student={student} plan={plan} canEdit onSave={onSave} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Soodustus' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Üldtingimused 25 € / h' }));
    fireEvent.change(screen.getByLabelText('Soodustuse põhjus'), { target: { value: 'Vend käib ka' } });
    fireEvent.click(screen.getByRole('tab', { name: /Matemaatika/ }));
    expect(screen.getAllByRole('radio').filter((radio) => radio.name.startsWith('hourlyRate')).map((radio) => radio.parentElement.textContent))
      .toEqual(['Kaardi hind (Eesti keel) · 25 € / h', 'Üldtingimused 25 € / h', '20 € / h', '15 € / h', '12 € / h', 'Muu']);
    fireEvent.click(screen.getByRole('radio', { name: 'Muu' }));
    fireEvent.change(screen.getByLabelText('Oma tunnitasu (€ / h)'), { target: { value: '16' } });
    fireEvent.change(screen.getByLabelText('Tunni pikkus'), { target: { value: '45' } });
    expect(screen.getByRole('tab', { name: /Matemaatika/ })).toHaveTextContent('12,00 € / 45 min');
    await save();
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ priceTerms: 'discount', lessonPrice: '25', subjectPrices: { Matemaatika: { lessonPrice: '12', lessonMinutes: '45' } } }));
  });

  // #bug 2026-11-06 (Oleksiy): every subject is an equal tab with the same fields and its own price
  describe('one tab per subject', () => {
    const student = { id: 'st', name: 'Stefania', subject: 'Eesti keel', enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel' }, { subject: 'Inglise keel', teacher: 'Anna' }, { subject: 'Matemaatika', teacher: 'Liza' }] };
    const priced = { lessonPriceCents: 2000, lessonMinutes: 60, weeklyLessons: 2, billingMode: 'advance', priceTerms: 'discount', hourlyRateCents: 2000, discountReason: 'Mitu kursust',
      subjectPrices: { Matemaatika: { lessonPriceCents: 1125, lessonMinutes: 45 } } };

    it('each tab shows its own price, length and hourly rate — the price billed for that subject', () => {
      render(<BillingSettingsCard student={student} plan={priced} canEdit onSave={vi.fn()} />);
      const tabs = screen.getAllByRole('tab');
      expect(tabs.map((tab) => tab.textContent.replace(/\s/g, ' '))).toEqual(['Eesti keel20,00 € / 60 min', 'Inglise keel20,00 € / 60 min', 'Matemaatika11,25 € / 45 min']);
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('radio', { name: '20 € / h' })).toBeChecked();
      expect(screen.getByLabelText('Tunni pikkus')).toHaveValue('60');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Tunni hind: 20,00 € / 60 min · tunnitasu 20 € / h');
      fireEvent.click(tabs[2]);
      expect(screen.getByRole('radio', { name: '15 € / h' })).toBeChecked();
      expect(screen.getByLabelText('Tunni pikkus')).toHaveValue('45');
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Tunni hind: 11,25 € / 45 min · tunnitasu 15 € / h');
      // the same fields on every tab
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Arveldus: Kuu ette (vaikimisi) · 2 tundi nädalas — ühine kõigile ainetele');
      // the saved summary: every subject at the price its invoice takes
      expect([...document.querySelectorAll('.billing-settings__saved li')].map((item) => item.textContent.replace(/\s/g, ' '))).toEqual(['Eesti keel: 20,00 € / 60 min', 'Inglise keel: 20,00 € / 60 min (kaardi hind)', 'Matemaatika: 11,25 € / 45 min']);
    });

    it('a subject without its own price says it is billed at the card price and offers „Määra oma hind”', async () => {
      const onSave = vi.fn().mockResolvedValue({});
      render(<BillingSettingsCard student={student} plan={priced} canEdit onSave={onSave} />);
      fireEvent.click(screen.getByRole('tab', { name: /Inglise keel/ }));
      expect(screen.getByRole('radio', { name: 'Kaardi hind (Eesti keel) · 20 € / h' })).toBeChecked();
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Oma hinda pole — arvel kehtib kaardi hind: 20 € / h · tund 20,00 € / 60 min');
      fireEvent.click(screen.getByRole('button', { name: 'Määra oma hind' }));
      expect(screen.getByRole('radio', { name: 'Muu' })).toBeChecked();
      // an empty own rate: the error opens on this tab and nothing is saved
      fireEvent.click(screen.getByRole('tab', { name: /Eesti keel/ }));
      await save();
      expect(onSave).not.toHaveBeenCalled();
      expect(screen.getByRole('tab', { name: /Inglise keel/ })).toHaveAttribute('aria-selected', 'true');
      fireEvent.change(screen.getByLabelText('Oma tunnitasu (€ / h)'), { target: { value: '18' } });
      await save();
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ lessonPrice: '20', subjectPrices: { 'Inglise keel': { lessonPrice: '18', lessonMinutes: '60' }, Matemaatika: { lessonPrice: '11.25', lessonMinutes: '45' } } }));
    });

    it('a subject with no price at all shows „Hind määramata”; arrow keys move between tabs', () => {
      render(<BillingSettingsCard student={student} plan={{ lessonPriceCents: 1700, lessonMinutes: 60, weeklyLessons: 1 }} canEdit onSave={vi.fn()} />);
      fireEvent.click(screen.getByRole('radio', { name: 'Muu' }));
      fireEvent.change(screen.getByLabelText('Oma tunnitasu (€ / h)'), { target: { value: '' } });
      expect(screen.getByRole('tabpanel')).toHaveTextContent('Hind määramata');
      expect(screen.getAllByRole('tab')[1]).toHaveTextContent('Hind määramata');
      fireEvent.keyDown(screen.getAllByRole('tab')[0], { key: 'ArrowRight' });
      expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true');
      expect(document.activeElement).toBe(screen.getAllByRole('tab')[1]);
      fireEvent.keyDown(screen.getAllByRole('tab')[0], { key: 'ArrowLeft' });
      expect(screen.getAllByRole('tab')[2]).toHaveAttribute('aria-selected', 'true');
    });
  });
});
