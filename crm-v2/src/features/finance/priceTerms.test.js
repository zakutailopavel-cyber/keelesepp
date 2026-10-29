import { describe, expect, it } from 'vitest';
import {
  DISCOUNT_HOURLY_RATES_CENTS, LEGACY_RATE, STANDARD_HOURLY_RATE_CENTS, discountChoiceOf, lessonCentsFromHourly,
  lessonPricesFromTerms, priceTermsOf, validatePriceTerms,
} from './priceTerms.js';

describe('price terms', () => {
  it('the standard rate is 25 € per hour, the discounts 20 / 15 / 12 €, priced by lesson length', () => {
    expect(STANDARD_HOURLY_RATE_CENTS).toBe(2500);
    expect(DISCOUNT_HOURLY_RATES_CENTS).toEqual([2000, 1500, 1200]);
    expect(lessonCentsFromHourly(2500, 45)).toBe(1875);
    expect(lessonCentsFromHourly(1200, 90)).toBe(1800);
    expect(discountChoiceOf(1500, 60)).toBe('1500');
    expect(discountChoiceOf(1125, 45)).toBe('1500');
    expect(discountChoiceOf(1700, 45)).toBe(LEGACY_RATE);
  });

  it('reads old plans from their price without writing anything', () => {
    expect(priceTermsOf(null)).toMatchObject({ priceTerms: 'general' });
    expect(priceTermsOf({ lessonPriceCents: 2500, lessonMinutes: 60 })).toMatchObject({ priceTerms: 'general', legacy: true });
    expect(priceTermsOf({ lessonPriceCents: 1875, lessonMinutes: 45 })).toMatchObject({ priceTerms: 'general' });
    expect(priceTermsOf({ lessonPriceCents: 2000, lessonMinutes: 60 })).toMatchObject({ priceTerms: 'discount', discountReason: '', legacy: true });
    // 25 € for a 45-minute lesson is not the standard hourly rate
    expect(priceTermsOf({ lessonPriceCents: 2500, lessonMinutes: 45 })).toMatchObject({ priceTerms: 'discount', legacy: true });
    expect(priceTermsOf({ lessonPriceCents: 2500, lessonMinutes: 60, subjectPrices: { Matemaatika: { lessonPriceCents: 2000, lessonMinutes: 60 } } }).priceTerms).toBe('discount');
    expect(priceTermsOf({ lessonPriceCents: 2000, priceTerms: 'discount', discountReason: 'Kaks last' })).toEqual({ priceTerms: 'discount', discountReason: 'Kaks last', legacy: false });
    expect(priceTermsOf({ lessonPriceCents: 2200, priceTerms: 'general' }).priceTerms).toBe('discount');
  });

  it('a discount needs one of the fixed rates and a reason (≤ 300)', () => {
    const ok = { priceTerms: 'discount', hourlyRate: '1500', discountReason: 'Mitu kursust', lessonMinutes: '60' };
    expect(validatePriceTerms({ priceTerms: 'general' }).valid).toBe(true);
    expect(validatePriceTerms(ok).valid).toBe(true);
    expect(validatePriceTerms({ ...ok, hourlyRate: '1800' }).errors.hourlyRate).toBe('Vali tunnitasu.');
    expect(validatePriceTerms({ ...ok, hourlyRate: '' }).errors.hourlyRate).toBe('Vali tunnitasu.');
    expect(validatePriceTerms({ ...ok, discountReason: '  ' }).errors.discountReason).toMatch(/põhjus/);
    expect(validatePriceTerms({ ...ok, discountReason: 'x'.repeat(301) }).errors.discountReason).toMatch(/300/);
    expect(validatePriceTerms({ ...ok, subjects: { Matemaatika: { hourlyRate: '999', lessonMinutes: '60' } } }).errors['subject:Matemaatika']).toBeTruthy();
    expect(validatePriceTerms({ ...ok, subjects: { Matemaatika: { hourlyRate: '', lessonMinutes: '45' } } }).valid).toBe(true);
  });

  it('an old price may only be kept where it was stored and with its lesson length', () => {
    const initial = { priceTerms: 'discount', hourlyRate: LEGACY_RATE, lessonMinutes: '45', subjects: { Matemaatika: { hourlyRate: LEGACY_RATE, lessonMinutes: '45' } } };
    const form = { ...initial, discountReason: 'Vana leping' };
    expect(validatePriceTerms(form, initial).valid).toBe(true);
    expect(validatePriceTerms({ ...form, lessonMinutes: '60' }, initial).errors.hourlyRate).toMatch(/vali uus/);
    expect(validatePriceTerms({ ...form, hourlyRate: '2000', subjects: { Matemaatika: { hourlyRate: LEGACY_RATE, lessonMinutes: '60' } } }, initial).errors['subject:Matemaatika']).toMatch(/vali uus/);
    expect(validatePriceTerms({ ...form }, { ...initial, hourlyRate: '2000' }).errors.hourlyRate).toBeTruthy();
  });

  it('general terms price every subject at the standard rate by its own length', () => {
    const form = { priceTerms: 'general', hourlyRate: '', lessonMinutes: '45', subjects: { Matemaatika: { hourlyRate: '', lessonMinutes: '60' } } };
    expect(lessonPricesFromTerms(form)).toEqual({ lessonPriceCents: 1875, hourlyRateCents: 2500, subjectPrices: { Matemaatika: { lessonPriceCents: 2500, lessonMinutes: 60 } } });
  });

  it('a discount prices from the chosen rate; „sama kui kaardil” takes the card rate', () => {
    const form = { priceTerms: 'discount', hourlyRate: '2000', lessonMinutes: '90', subjects: { Matemaatika: { hourlyRate: '', lessonMinutes: '45' }, Inglise: { hourlyRate: '1200', lessonMinutes: '60' } } };
    expect(lessonPricesFromTerms(form)).toEqual({ lessonPriceCents: 3000, hourlyRateCents: 2000, subjectPrices: { Matemaatika: { lessonPriceCents: 1500, lessonMinutes: 45 }, Inglise: { lessonPriceCents: 1200, lessonMinutes: 60 } } });
  });

  it('a kept old price stays to the cent and its subjects stay as they are', () => {
    const plan = { lessonPriceCents: 1001, lessonMinutes: 120, subjectPrices: { Matemaatika: { lessonPriceCents: 1333, lessonMinutes: 45 } } };
    const form = { priceTerms: 'discount', hourlyRate: LEGACY_RATE, lessonMinutes: '120', subjects: { Matemaatika: { hourlyRate: LEGACY_RATE, lessonMinutes: '45' }, Vene: { hourlyRate: '', lessonMinutes: '120' } } };
    expect(lessonPricesFromTerms(form, plan)).toEqual({ lessonPriceCents: 1001, hourlyRateCents: 501, subjectPrices: { Matemaatika: { lessonPriceCents: 1333, lessonMinutes: 45 } } });
    // picking a rate re-prices the card; the empty subject gets that rate explicitly, the kept one stays
    expect(lessonPricesFromTerms({ ...form, hourlyRate: '1200' }, plan).subjectPrices)
      .toEqual({ Matemaatika: { lessonPriceCents: 1333, lessonMinutes: 45 }, Vene: { lessonPriceCents: 2400, lessonMinutes: 120 } });
  });
});
