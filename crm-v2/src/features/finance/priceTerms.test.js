import { describe, expect, it } from 'vitest';
import {
  STANDARD_HOURLY_RATE_CENTS, hourlyTextOf, lessonCentsFromHourly, lessonPricesFromTerms, priceTermsOf, validatePriceTerms,
} from './priceTerms.js';

describe('price terms', () => {
  it('the standard rate is 25 € per hour, priced by lesson length', () => {
    expect(STANDARD_HOURLY_RATE_CENTS).toBe(2500);
    expect(lessonCentsFromHourly(2500, 60)).toBe(2500);
    expect(lessonCentsFromHourly(2500, 45)).toBe(1875);
    expect(lessonCentsFromHourly(2500, 90)).toBe(3750);
  });

  it('reads old plans from their price without writing anything', () => {
    expect(priceTermsOf(null)).toMatchObject({ priceTerms: 'general' });
    expect(priceTermsOf({ lessonPriceCents: 2500, lessonMinutes: 60 })).toMatchObject({ priceTerms: 'general', legacy: true });
    expect(priceTermsOf({ lessonPriceCents: 1875, lessonMinutes: 45 })).toMatchObject({ priceTerms: 'general' });
    expect(priceTermsOf({ lessonPriceCents: 2000, lessonMinutes: 60 })).toMatchObject({ priceTerms: 'discount', discountReason: '', legacy: true });
    // 25 € for a 45-minute lesson is not the standard hourly rate
    expect(priceTermsOf({ lessonPriceCents: 2500, lessonMinutes: 45 })).toMatchObject({ priceTerms: 'discount', legacy: true });
    // a second subject off the standard makes the card a discount
    expect(priceTermsOf({ lessonPriceCents: 2500, lessonMinutes: 60, subjectPrices: { Matemaatika: { lessonPriceCents: 2000, lessonMinutes: 60 } } }).priceTerms).toBe('discount');
    expect(priceTermsOf({ lessonPriceCents: 2000, priceTerms: 'discount', discountReason: 'Kaks last' })).toEqual({ priceTerms: 'discount', discountReason: 'Kaks last', legacy: false });
    // stored as general but re-priced elsewhere: shown as a discount, never silently as 25 €/h
    expect(priceTermsOf({ lessonPriceCents: 2200, priceTerms: 'general' }).priceTerms).toBe('discount');
  });

  it('requires a rate and a reason (≤ 300) for a discount', () => {
    expect(validatePriceTerms({ priceTerms: 'general' }).valid).toBe(true);
    expect(validatePriceTerms({ priceTerms: 'discount', hourlyRate: '20', discountReason: '  ' }).errors.discountReason).toMatch(/põhjus/);
    expect(validatePriceTerms({ priceTerms: 'discount', hourlyRate: '0', discountReason: 'Mitu kursust' }).errors.hourlyRate).toBeTruthy();
    expect(validatePriceTerms({ priceTerms: 'discount', hourlyRate: '20', discountReason: 'x'.repeat(301) }).errors.discountReason).toMatch(/300/);
    expect(validatePriceTerms({ priceTerms: 'discount', hourlyRate: '20,50', discountReason: 'Mitu kursust' }).valid).toBe(true);
    expect(validatePriceTerms({ priceTerms: 'discount', hourlyRate: '20', discountReason: 'a', subjectHourly: { Matemaatika: 'abc' } }).errors['subject:Matemaatika']).toBeTruthy();
  });

  it('general terms price every subject at the standard rate by its own length', () => {
    const form = { priceTerms: 'general', hourlyRate: '', lessonMinutes: '45', subjects: { Matemaatika: { hourlyRate: '', lessonMinutes: '60' } } };
    expect(lessonPricesFromTerms(form)).toEqual({ lessonPriceCents: 1875, hourlyRateCents: 2500, subjectPrices: { Matemaatika: { lessonPriceCents: 2500, lessonMinutes: 60 } } });
  });

  it('a discount prices from the hourly rate; an empty subject rate takes the card rate', () => {
    const form = { priceTerms: 'discount', hourlyRate: '20', lessonMinutes: '90', subjects: { Matemaatika: { hourlyRate: '', lessonMinutes: '45' }, Inglise: { hourlyRate: '22', lessonMinutes: '60' } } };
    expect(lessonPricesFromTerms(form)).toEqual({ lessonPriceCents: 3000, hourlyRateCents: 2000, subjectPrices: { Matemaatika: { lessonPriceCents: 1500, lessonMinutes: 45 }, Inglise: { lessonPriceCents: 2200, lessonMinutes: 60 } } });
  });

  it('an untouched old price is kept to the cent (no re-rounding through the hourly rate)', () => {
    const plan = { lessonPriceCents: 1001, lessonMinutes: 120, subjectPrices: { Matemaatika: { lessonPriceCents: 1333, lessonMinutes: 45 } } };
    const initial = { priceTerms: 'discount', hourlyRate: hourlyTextOf(1001, 120), lessonMinutes: '120', subjects: { Matemaatika: { hourlyRate: hourlyTextOf(1333, 45), lessonMinutes: '45' }, Vene: { hourlyRate: '', lessonMinutes: '120' } } };
    const result = lessonPricesFromTerms({ ...initial, discountReason: 'Mitu last' }, initial, plan);
    expect(result.lessonPriceCents).toBe(1001);
    expect(result.subjectPrices).toEqual({ Matemaatika: { lessonPriceCents: 1333, lessonMinutes: 45 } });
    // a subject without an own price stays billed at the card's price (not written)
    expect(result.subjectPrices.Vene).toBeUndefined();
    // touching the main rate re-prices the main lesson and gives the empty subject the new rate explicitly
    const changed = lessonPricesFromTerms({ ...initial, hourlyRate: '6' }, initial, plan);
    expect(changed.lessonPriceCents).toBe(1200);
    expect(changed.subjectPrices).toEqual({ Matemaatika: { lessonPriceCents: 1333, lessonMinutes: 45 }, Vene: { lessonPriceCents: 1200, lessonMinutes: 120 } });
  });
});
