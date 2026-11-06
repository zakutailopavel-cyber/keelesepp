import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import TokenInvoiceDialog from './TokenInvoiceDialog.jsx';
import { TOKEN_PRICE_MISSING, tokenPlanPrice, tokenRowPriceView, tokenRowState } from './tokenInvoiceRows.js';

// „Tunnihind” on the composing page (Oleksiy 2026-11-06): the price per hour for control, derived from the server's
// per-lesson price (studentRevenuePlans lessonPriceCents / subjectPrices + lessonMinutes)
const nb = (text) => text.replace(/\u00a0/g, ' ');
const card = (id, extra = {}) => ({ id, name: `Õpilane ${id}`, subject: 'Eesti keel', parentName: 'Kati', parentEmail: 'kati@example.ee', active: true, ...extra });
const view = (plan, lessons = 8, extra = {}) => tokenRowPriceView(tokenRowState({ studentId: 'a', lessons }, { cards: [card('a', extra)], plans: [{ studentId: 'a', ...plan }] }));

describe('„Tunnihind” in the Tunnipakett dialog', () => {
  it('60 min: the hourly price is the lesson price, no separate lesson line', () => {
    const result = view({ lessonPriceCents: 2500, lessonMinutes: 60 });
    expect(nb(result.hourly)).toBe('Tunnihind: 25,00 € / h');
    expect(result.lesson).toBe('');
    expect(nb(result.amount)).toBe('8 tundi × 25,00 € = 200,00 €');
  });

  it('45 min: the hourly price is derived from the lesson price, the lesson length and price are shown', () => {
    const result = view({ lessonPriceCents: 1875, lessonMinutes: 45 });
    expect(nb(result.hourly)).toBe('Tunnihind: 25,00 € / h');
    expect(nb(result.lesson)).toBe('Tund 45 min = 18,75 €');
    expect(nb(result.amount)).toBe('8 tundi × 18,75 € = 150,00 €');
  });

  it('90 min: 37,50 € a lesson = 25,00 € / h', () => {
    const result = view({ lessonPriceCents: 3750, lessonMinutes: 90 }, 4);
    expect(nb(result.hourly)).toBe('Tunnihind: 25,00 € / h');
    expect(nb(result.lesson)).toBe('Tund 90 min = 37,50 €');
    expect(nb(result.amount)).toBe('4 tundi × 37,50 € = 150,00 €');
  });

  it('no price: a warning, no amount', () => {
    expect(view({ lessonMinutes: 60 })).toEqual({ status: 'missing', warning: TOKEN_PRICE_MISSING });
    expect(view({ lessonPriceCents: 0 }).status).toBe('missing');
  });

  it('the subject price replaces the card price like the server (planForSubject); its minutes fall back to the card', () => {
    const plan = { lessonPriceCents: 2000, lessonMinutes: 45, subjectPrices: { Matemaatika: { lessonPriceCents: 3000 }, Inglise: { lessonMinutes: 60 } } };
    expect(tokenPlanPrice(plan, 'Matemaatika')).toEqual({ priceCents: 3000, minutes: 45 });
    expect(tokenPlanPrice(plan, 'Eesti keel')).toEqual({ priceCents: 2000, minutes: 45 });
    // a subject entry without a price: the server takes no price (refuses), so the dialog does not borrow the card's
    expect(tokenPlanPrice(plan, 'Inglise')).toEqual({ priceCents: 0, minutes: 60 });
    const result = view(plan, 2, { subject: 'Matemaatika' });
    expect(nb(result.hourly)).toBe('Tunnihind: 40,00 € / h');
    expect(nb(result.lesson)).toBe('Tund 45 min = 30,00 €');
  });

  it('the dialog shows the hourly price per row; a row without price shows the warning and blocks creating', () => {
    const api = { createTokens: vi.fn(), createTokensCombined: vi.fn() };
    const cards = [card('a'), card('b', { subject: 'Matemaatika' })];
    const plans = [{ studentId: 'a', lessonPriceCents: 1875, lessonMinutes: 45 }, { studentId: 'b', lessonMinutes: 60 }];
    render(<TokenInvoiceDialog studentCards={cards} plans={plans} api={api} tokensApi={{ listByStudent: vi.fn().mockResolvedValue([]) }} directionsService={{ list: vi.fn().mockResolvedValue([]) }} />);
    fireEvent.click(screen.getByRole('button', { name: /Tunnipakett/ }));
    fireEvent.change(screen.getByLabelText('Õpilane'), { target: { value: 'a' } });
    const first = document.querySelector('[data-token-price="1"]');
    expect(nb(first.textContent)).toBe('Tunnihind: 25,00 € / h (Eesti keel) · Tund 45 min = 18,75 €8 tundi × 18,75 € = 150,00 €');
    expect(screen.getByRole('button', { name: 'Loo arve' })).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: /Lisa rida/ }));
    fireEvent.change(screen.getByLabelText('Õpilane (rida 2)'), { target: { value: 'b' } });
    expect(document.querySelector('[data-token-price="2"]')).toHaveTextContent(`Matemaatika: ${TOKEN_PRICE_MISSING}`);
    // the first row now reads „Rida 1: …”
    expect(nb(document.querySelector('[data-token-price="1"]').textContent)).toContain('Rida 1: 8 tundi × 18,75 € = 150,00 €');
    expect(screen.getByRole('button', { name: 'Loo arve' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Loo ja saada' })).not.toBeInTheDocument();
    expect(api.createTokensCombined).not.toHaveBeenCalled();
  });
});
