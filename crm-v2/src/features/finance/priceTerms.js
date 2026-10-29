// Price terms of a student card (team request 2026-10-29): „Üldtingimused” = the school's standard hourly rate,
// „Soodustus” = an own hourly rate with a required reason (several courses, several children, …).
// The invoices keep reading the per-lesson price of studentRevenuePlans (lessonPriceCents + lessonMinutes,
// subjectPrices); the terms only decide how that price is set. Nothing here re-prices a stored plan by itself.

// The school's standard rate: 25 € per 60 minutes. The one place to change it.
export const STANDARD_HOURLY_RATE_CENTS = 2500;
export const DISCOUNT_REASON_MAX = 300;
export const PRICE_TERMS = [
  { id: 'general', label: 'Üldtingimused' },
  { id: 'discount', label: 'Soodustus' },
];
// shown (never stored) for a card whose price differs from the standard and has no reason yet
export const LEGACY_REASON_PLACEHOLDER = 'Varasem kokkulepe — põhjus lisamata';

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

export function parseEuroCents(text) {
  const value = Number(String(text ?? '').trim().replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : 0;
}

export function isStandardLessonPrice(lessonCents, minutes) {
  return Number(lessonCents) === lessonCentsFromHourly(STANDARD_HOURLY_RATE_CENTS, minutes);
}

// The terms shown for a stored plan. A plan saved with terms keeps them; an older plan is read from its price only
// (all prices at the standard rate → general, otherwise discount with an empty reason). Nothing is written.
export function priceTermsOf(plan) {
  if (!plan?.lessonPriceCents) return { priceTerms: 'general', discountReason: '', legacy: false };
  const minutes = minutesOf(plan.lessonMinutes);
  const allStandard = isStandardLessonPrice(plan.lessonPriceCents, minutes)
    && Object.values(plan.subjectPrices || {}).every((own) => isStandardLessonPrice(own?.lessonPriceCents, own?.lessonMinutes || minutes));
  if (plan.priceTerms === 'discount') return { priceTerms: 'discount', discountReason: String(plan.discountReason || ''), legacy: false };
  if (plan.priceTerms === 'general' && allStandard) return { priceTerms: 'general', discountReason: '', legacy: false };
  if (allStandard) return { priceTerms: 'general', discountReason: '', legacy: !plan.priceTerms };
  // stored as general but the price is not the standard one (e.g. edited elsewhere): shown as a discount to explain
  return { priceTerms: 'discount', discountReason: String(plan.discountReason || ''), legacy: true };
}

// The hourly rate field of the form for a stored price
export function hourlyTextOf(lessonCents, minutes) {
  return lessonCents ? centsText(hourlyCentsFromLesson(lessonCents, minutes)) : '';
}

export function validatePriceTerms({ priceTerms, hourlyRate, discountReason, subjectHourly = {} } = {}) {
  const errors = {};
  if (!PRICE_TERMS.some((item) => item.id === priceTerms)) errors.priceTerms = 'Vali hinnatingimused.';
  if (priceTerms === 'discount') {
    const cents = parseEuroCents(hourlyRate);
    if (!cents || cents > 1000000) errors.hourlyRate = 'Sisesta tunnitasu vahemikus 0,01–10 000 eurot tunnis.';
    const reason = String(discountReason || '').trim();
    if (!reason) errors.discountReason = 'Kirjuta soodustuse põhjus (nt mitu kursust, mitu last).';
    else if (reason.length > DISCOUNT_REASON_MAX) errors.discountReason = `Põhjus on kuni ${DISCOUNT_REASON_MAX} märki.`;
    Object.entries(subjectHourly || {}).forEach(([subject, text]) => {
      if (!String(text ?? '').trim()) return; // empty = the card's hourly rate
      const own = parseEuroCents(text);
      if (!own || own > 1000000) errors[`subject:${subject}`] = 'Sisesta tunnitasu vahemikus 0,01–10 000 eurot tunnis.';
    });
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

// Per-lesson prices for the plan from the terms form.
// form: { priceTerms, hourlyRate, lessonMinutes, subjects: { [subject]: { hourlyRate, lessonMinutes } } }
// initial: the same form as first shown for the stored plan. A row whose rate and length were not touched keeps
// its stored per-lesson price exactly (an old price like 17 € / 45 min is not re-rounded through the hourly rate).
export function lessonPricesFromTerms(form, initial = null, plan = null) {
  const minutes = minutesOf(form.lessonMinutes);
  const general = form.priceTerms === 'general';
  const hourlyCents = general ? STANDARD_HOURLY_RATE_CENTS : parseEuroCents(form.hourlyRate);
  const mainUntouched = !general && plan?.lessonPriceCents && initial?.priceTerms === 'discount'
    && String(form.hourlyRate).trim() === String(initial.hourlyRate).trim()
    && String(form.lessonMinutes) === String(initial.lessonMinutes);
  const lessonPriceCents = mainUntouched ? plan.lessonPriceCents : lessonCentsFromHourly(hourlyCents, minutes);
  const subjectPrices = {};
  Object.entries(form.subjects || {}).forEach(([subject, row]) => {
    const rowMinutes = minutesOf(row?.lessonMinutes);
    const was = initial?.subjects?.[subject];
    const text = String(row?.hourlyRate ?? '').trim();
    const untouched = !general && initial?.priceTerms === 'discount' && was
      && text === String(was.hourlyRate ?? '').trim()
      && String(row?.lessonMinutes) === String(was.lessonMinutes);
    const stored = plan?.subjectPrices?.[subject];
    if (untouched && stored?.lessonPriceCents) {
      subjectPrices[subject] = { lessonPriceCents: stored.lessonPriceCents, lessonMinutes: stored.lessonMinutes || rowMinutes };
      return;
    }
    // a subject without an own price stays billed at the card's price while nothing on the card changed
    if (untouched && !text && mainUntouched) return;
    const ownHourly = general ? STANDARD_HOURLY_RATE_CENTS : (parseEuroCents(text) || hourlyCents);
    subjectPrices[subject] = { lessonPriceCents: lessonCentsFromHourly(ownHourly, rowMinutes), lessonMinutes: rowMinutes };
  });
  return { lessonPriceCents, hourlyRateCents: general ? STANDARD_HOURLY_RATE_CENTS : (mainUntouched ? hourlyCentsFromLesson(plan.lessonPriceCents, minutes) : hourlyCents), subjectPrices };
}
