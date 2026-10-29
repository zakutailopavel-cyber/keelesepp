// Price terms of a student card (team request 2026-10-29): „Üldtingimused” = the school's standard hourly rate,
// „Soodustus” = one of the fixed discount rates with a required reason (several courses, several children, …).
// The invoices keep reading the per-lesson price of studentRevenuePlans (lessonPriceCents + lessonMinutes,
// subjectPrices); the terms only decide how that price is set. Nothing here re-prices a stored plan by itself.

// The school's rates per 60 minutes. The one place to change them.
export const STANDARD_HOURLY_RATE_CENTS = 2500;
// owner 2026-10-29: „льгота — это выбор суммы 20 или 15 или 12 евро”
export const DISCOUNT_HOURLY_RATES_CENTS = [2000, 1500, 1200];
export const DISCOUNT_REASON_MAX = 300;
export const PRICE_TERMS = [
  { id: 'general', label: 'Üldtingimused' },
  { id: 'discount', label: 'Soodustus' },
];
// the rate choice of a card or subject whose stored price is none of the school's rates: kept as it is
export const LEGACY_RATE = 'legacy';
// shown (never stored) for a card whose price differs from the standard and has no reason yet
export const LEGACY_REASON_PLACEHOLDER = 'Varasem kokkulepe — põhjus lisamata';
// a further subject billed at the card's rate
export const SAME_RATE = '';

const minutesOf = (value) => Number(value) > 0 ? Number(value) : 60;

// price of one lesson of `minutes` at an hourly rate, whole cents
export function lessonCentsFromHourly(hourlyCents, minutes) {
  return Math.round((Number(hourlyCents) || 0) * minutesOf(minutes) / 60);
}

export function hourlyCentsFromLesson(lessonCents, minutes) {
  return Math.round((Number(lessonCents) || 0) * 60 / minutesOf(minutes));
}

export function centsText(cents) {
  return cents ? (Number(cents) / 100).toFixed(2).replace(/\.00$/, '').replace('.', ',') : '';
}

export function rateLabel(hourlyCents) {
  return `${centsText(hourlyCents)} € / h`;
}

export function isStandardLessonPrice(lessonCents, minutes) {
  return Number(lessonCents) === lessonCentsFromHourly(STANDARD_HOURLY_RATE_CENTS, minutes);
}

// the discount choice for a stored lesson price: one of the fixed rates, or LEGACY_RATE
export function discountChoiceOf(lessonCents, minutes) {
  const rate = DISCOUNT_HOURLY_RATES_CENTS.find((cents) => Number(lessonCents) === lessonCentsFromHourly(cents, minutes));
  return rate ? String(rate) : LEGACY_RATE;
}

// The terms shown for a stored plan. A plan saved with terms keeps them; an older plan is read from its price only
// (all prices at the standard rate → general, otherwise discount with an empty reason). Nothing is written.
export function priceTermsOf(plan) {
  if (!plan?.lessonPriceCents) return { priceTerms: 'general', discountReason: '', legacy: false };
  const minutes = minutesOf(plan.lessonMinutes);
  const allStandard = isStandardLessonPrice(plan.lessonPriceCents, minutes)
    && Object.values(plan.subjectPrices || {}).every((own) => isStandardLessonPrice(own?.lessonPriceCents, own?.lessonMinutes || minutes));
  if (plan.priceTerms === 'discount') return { priceTerms: 'discount', discountReason: String(plan.discountReason || ''), legacy: false };
  if (allStandard) return { priceTerms: 'general', discountReason: '', legacy: !plan.priceTerms };
  // no terms yet, or stored as general but re-priced elsewhere: shown as a discount, never silently as 25 €/h
  return { priceTerms: 'discount', discountReason: String(plan.discountReason || ''), legacy: true };
}

// form: { priceTerms, hourlyRate: '2000' | '1500' | '1200' | 'legacy' | '', discountReason, lessonMinutes,
//         subjects: { [subject]: { hourlyRate: '' (= card) | '2000' | … | 'legacy', lessonMinutes } } }
// initial: the form as first shown. A kept old price („Varasem kokkulepe”) is only valid with its lesson length.
export function validatePriceTerms(form = {}, initial = null) {
  const errors = {};
  if (!PRICE_TERMS.some((item) => item.id === form.priceTerms)) errors.priceTerms = 'Vali hinnatingimused.';
  if (form.priceTerms === 'discount') {
    const legacyOk = (choice, was, minutes, wasMinutes) => choice === LEGACY_RATE && was === LEGACY_RATE && String(minutes) === String(wasMinutes);
    if (form.hourlyRate === LEGACY_RATE) {
      if (!legacyOk(form.hourlyRate, initial?.hourlyRate, form.lessonMinutes, initial?.lessonMinutes)) errors.hourlyRate = 'Tunni pikkus muutus: vali uus tunnitasu.';
    } else if (!DISCOUNT_HOURLY_RATES_CENTS.includes(Number(form.hourlyRate))) errors.hourlyRate = 'Vali tunnitasu.';
    const reason = String(form.discountReason || '').trim();
    if (!reason) errors.discountReason = 'Kirjuta soodustuse põhjus (nt mitu kursust, mitu last).';
    else if (reason.length > DISCOUNT_REASON_MAX) errors.discountReason = `Põhjus on kuni ${DISCOUNT_REASON_MAX} märki.`;
    Object.entries(form.subjects || {}).forEach(([subject, row]) => {
      const was = initial?.subjects?.[subject];
      if (row?.hourlyRate === LEGACY_RATE && !legacyOk(row.hourlyRate, was?.hourlyRate, row.lessonMinutes, was?.lessonMinutes)) errors[`subject:${subject}`] = 'Tunni pikkus muutus: vali uus tunnitasu.';
      else if (![SAME_RATE, LEGACY_RATE].includes(row?.hourlyRate ?? SAME_RATE) && !DISCOUNT_HOURLY_RATES_CENTS.includes(Number(row.hourlyRate))) errors[`subject:${subject}`] = 'Vali tunnitasu.';
    });
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

// Per-lesson prices for the plan from a valid terms form. LEGACY_RATE keeps the stored cents exactly;
// a subject „sama kui kaardil” stays unwritten while the card keeps its old price (billed at the card's price, as today).
export function lessonPricesFromTerms(form, plan = null) {
  const minutes = minutesOf(form.lessonMinutes);
  const general = form.priceTerms === 'general';
  const mainLegacy = !general && form.hourlyRate === LEGACY_RATE && plan?.lessonPriceCents;
  const hourlyCents = general ? STANDARD_HOURLY_RATE_CENTS : (mainLegacy ? hourlyCentsFromLesson(plan.lessonPriceCents, minutes) : Number(form.hourlyRate) || 0);
  const lessonPriceCents = mainLegacy ? plan.lessonPriceCents : lessonCentsFromHourly(hourlyCents, minutes);
  const subjectPrices = {};
  Object.entries(form.subjects || {}).forEach(([subject, row]) => {
    const rowMinutes = minutesOf(row?.lessonMinutes);
    const choice = row?.hourlyRate ?? SAME_RATE;
    const stored = plan?.subjectPrices?.[subject];
    if (!general && choice === LEGACY_RATE && stored?.lessonPriceCents) {
      subjectPrices[subject] = { lessonPriceCents: stored.lessonPriceCents, lessonMinutes: stored.lessonMinutes || rowMinutes };
      return;
    }
    if (!general && choice === SAME_RATE && mainLegacy) return;
    const ownHourly = general ? STANDARD_HOURLY_RATE_CENTS : (Number(choice) || hourlyCents);
    subjectPrices[subject] = { lessonPriceCents: lessonCentsFromHourly(ownHourly, rowMinutes), lessonMinutes: rowMinutes };
  });
  return { lessonPriceCents, hourlyRateCents: hourlyCents, subjectPrices };
}
