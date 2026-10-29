import { describe, expect, it } from 'vitest';
import {
  CUSTOM_RATE, DISCOUNT_HOURLY_RATES_CENTS, GENERAL_RATE, SAME_RATE, STANDARD_HOURLY_RATE_CENTS, lessonCentsFromHourly,
  lessonPricesFromTerms, priceTermsOf, rateChoiceOf, validatePriceTerms,
} from './priceTerms.js';

describe('price terms', () => {
  it('the standard rate is 25 € per hour, the discounts 20 / 15 / 12 €, priced by lesson length', () => {
    expect(STANDARD_HOURLY_RATE_CENTS).toBe(2500);
    expect(DISCOUNT_HOURLY_RATES_CENTS).toEqual([2000, 1500, 1200]);
    expect(lessonCentsFromHourly(2500, 45)).toBe(1875);
    expect(lessonCentsFromHourly(1200, 90)).toBe(1800);
  });

  it('a stored price maps to a fixed rate, or to „Muu” prefilled with its own rate', () => {
    expect(rateChoiceOf(1125, 45)).toEqual({ hourlyRate: '1500', customRate: '', stored: false });
    expect(rateChoiceOf(1700, 45)).toEqual({ hourlyRate: CUSTOM_RATE, customRate: '22,67', stored: true });
    expect(rateChoiceOf(2500, 60)).toMatchObject({ hourlyRate: CUSTOM_RATE, customRate: '25' });
    expect(rateChoiceOf(2500, 60, { allowGeneral: true })).toMatchObject({ hourlyRate: GENERAL_RATE });
  });

  it('reads old plans from their price without writing anything', () => {
    expect(priceTermsOf(null)).toMatchObject({ priceTerms: 'general' });
    expect(priceTermsOf({ lessonPriceCents: 2500, lessonMinutes: 60 })).toMatchObject({ priceTerms: 'general', legacy: true });
    expect(priceTermsOf({ lessonPriceCents: 1875, lessonMinutes: 45 })).toMatchObject({ priceTerms: 'general' });
    expect(priceTermsOf({ lessonPriceCents: 2000, lessonMinutes: 60 })).toMatchObject({ priceTerms: 'discount', discountReason: '', legacy: true });
    expect(priceTermsOf({ lessonPriceCents: 2500, lessonMinutes: 45 })).toMatchObject({ priceTerms: 'discount', legacy: true });
    expect(priceTermsOf({ lessonPriceCents: 2500, lessonMinutes: 60, subjectPrices: { Matemaatika: { lessonPriceCents: 2000, lessonMinutes: 60 } } }).priceTerms).toBe('discount');
    expect(priceTermsOf({ lessonPriceCents: 2000, priceTerms: 'discount', discountReason: 'Kaks last' })).toEqual({ priceTerms: 'discount', discountReason: 'Kaks last', legacy: false });
  });

  it('a discount needs a rate (fixed or own, below 25 €) and a reason (≤ 300)', () => {
    const ok = { priceTerms: 'discount', hourlyRate: '1500', discountReason: 'Vend käib ka', lessonMinutes: '60' };
    expect(validatePriceTerms({ priceTerms: 'general' }).valid).toBe(true);
    expect(validatePriceTerms(ok).valid).toBe(true);
    expect(validatePriceTerms({ ...ok, hourlyRate: '1800' }).errors.hourlyRate).toBe('Vali tunnitasu.');
    expect(validatePriceTerms({ ...ok, hourlyRate: '' }).errors.hourlyRate).toBe('Vali tunnitasu.');
    expect(validatePriceTerms({ ...ok, hourlyRate: CUSTOM_RATE, customRate: '18,50' }).valid).toBe(true);
    for (const text of ['', '0', '25', '30', 'abc']) {
      expect(validatePriceTerms({ ...ok, hourlyRate: CUSTOM_RATE, customRate: text }).errors.hourlyRate).toMatch(/alla 25/);
    }
    // the standard rate as a row choice only where the card has further subjects
    expect(validatePriceTerms({ ...ok, hourlyRate: GENERAL_RATE }).errors.hourlyRate).toBeTruthy();
    expect(validatePriceTerms({ ...ok, hourlyRate: GENERAL_RATE, allowGeneral: true }).valid).toBe(true);
    expect(validatePriceTerms({ ...ok, discountReason: '  ' }).errors.discountReason).toMatch(/põhjus/);
    expect(validatePriceTerms({ ...ok, discountReason: 'x'.repeat(301) }).errors.discountReason).toMatch(/300/);
    const subjects = (row) => validatePriceTerms({ ...ok, subjects: { Matemaatika: { lessonMinutes: '45', ...row } } });
    expect(subjects({ hourlyRate: SAME_RATE }).valid).toBe(true);
    expect(subjects({ hourlyRate: GENERAL_RATE }).valid).toBe(true);
    expect(subjects({ hourlyRate: CUSTOM_RATE, customRate: '9,99' }).valid).toBe(true);
    expect(subjects({ hourlyRate: CUSTOM_RATE, customRate: '26' }).errors['subject:Matemaatika']).toMatch(/alla 25/);
    expect(subjects({ hourlyRate: '999' }).errors['subject:Matemaatika']).toBeTruthy();
  });

  it('a stored rate shown as „Muu” is valid untouched even at or above 25 €; edited it must be below 25 €', () => {
    const initial = { priceTerms: 'discount', hourlyRate: CUSTOM_RATE, customRate: '33,33', stored: true, lessonMinutes: '45' };
    const form = { ...initial, discountReason: 'Vana leping' };
    expect(validatePriceTerms(form, initial).valid).toBe(true);
    expect(validatePriceTerms({ ...form, customRate: '33' }, initial).errors.hourlyRate).toMatch(/alla 25/);
    expect(validatePriceTerms({ ...form, lessonMinutes: '60' }, initial).errors.hourlyRate).toMatch(/alla 25/);
  });

  it('general terms price every subject at the standard rate by its own length', () => {
    const form = { priceTerms: 'general', hourlyRate: '', lessonMinutes: '45', subjects: { Matemaatika: { hourlyRate: '', lessonMinutes: '60' } } };
    expect(lessonPricesFromTerms(form)).toEqual({ lessonPriceCents: 1875, hourlyRateCents: 2500, subjectPrices: { Matemaatika: { lessonPriceCents: 2500, lessonMinutes: 60 } } });
  });

  it('a discount prices every row from its choice: fixed, own, the standard rate or the card rate', () => {
    const form = { priceTerms: 'discount', hourlyRate: CUSTOM_RATE, customRate: '18,50', lessonMinutes: '60', subjects: {
      Matemaatika: { hourlyRate: SAME_RATE, lessonMinutes: '45' },
      Inglise: { hourlyRate: '1200', lessonMinutes: '60' },
      Vene: { hourlyRate: GENERAL_RATE, lessonMinutes: '45' },
      Saksa: { hourlyRate: CUSTOM_RATE, customRate: '10', lessonMinutes: '90' },
    } };
    expect(lessonPricesFromTerms(form)).toEqual({ lessonPriceCents: 1850, hourlyRateCents: 1850, subjectPrices: {
      Matemaatika: { lessonPriceCents: 1388, lessonMinutes: 45 },
      Inglise: { lessonPriceCents: 1200, lessonMinutes: 60 },
      Vene: { lessonPriceCents: 1875, lessonMinutes: 45 },
      Saksa: { lessonPriceCents: 1500, lessonMinutes: 90 },
    } });
  });

  it('an untouched stored price stays to the cent and its subjects stay as they are', () => {
    const plan = { lessonPriceCents: 1001, lessonMinutes: 120, subjectPrices: { Matemaatika: { lessonPriceCents: 1333, lessonMinutes: 45 } } };
    const initial = { priceTerms: 'discount', ...rateChoiceOf(1001, 120), lessonMinutes: '120', subjects: {
      Matemaatika: { ...rateChoiceOf(1333, 45), lessonMinutes: '45' },
      Vene: { hourlyRate: SAME_RATE, customRate: '', stored: false, lessonMinutes: '120' },
    } };
    expect(initial.customRate).toBe('5,01');
    expect(lessonPricesFromTerms(initial, initial, plan)).toEqual({ lessonPriceCents: 1001, hourlyRateCents: 501, subjectPrices: { Matemaatika: { lessonPriceCents: 1333, lessonMinutes: 45 } } });
    // editing the card's own rate re-prices the card; the empty subject gets that rate explicitly, the kept one stays
    expect(lessonPricesFromTerms({ ...initial, customRate: '6' }, initial, plan))
      .toEqual({ lessonPriceCents: 1200, hourlyRateCents: 600, subjectPrices: { Matemaatika: { lessonPriceCents: 1333, lessonMinutes: 45 }, Vene: { lessonPriceCents: 1200, lessonMinutes: 120 } } });
  });
});
