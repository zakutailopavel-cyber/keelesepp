// Price terms of a student card (team request 2026-10-29): „Üldtingimused” = the school's standard hourly rate,
// „Soodustus” = one of the fixed discount rates or an own rate („Muu”), always with a required reason (brother /
// sister, several courses, the school's goodwill, …).
// The invoices keep reading the per-lesson price of studentRevenuePlans (lessonPriceCents + lessonMinutes,
// subjectPrices); the terms only decide how that price is set. Nothing here re-prices a stored plan by itself.

// The school's rates per 60 minutes. The one place to change them.
export const STANDARD_HOURLY_RATE_CENTS = 2500;
// owner 2026-10-29: „льгота … будет 20, 15 или 12 или свой вариант, который пропишет админ”
export const DISCOUNT_HOURLY_RATES_CENTS = [2000, 1500, 1200];
export const DISCOUNT_REASON_MAX = 300;
export const PRICE_TERMS = [
  { id: 'general', label: 'Üldtingimused' },
  { id: 'discount', label: 'Soodustus' },
];
// rate choices of a row (the card's main subject, or a further subject):
export const CUSTOM_RATE = 'custom'; // „Muu”: an own rate typed by the admin, > 0 and below the standard rate
export const GENERAL_RATE = 'general'; // the standard rate on a discounted card (one subject at 25, another discounted)
export const SAME_RATE = ''; // a further subject billed at the card's rate
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

export function rateLabel(hourlyCents) {
  return `${centsText(hourlyCents)} € / h`;
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
  if (allStandard) return { priceTerms: 'general', discountReason: '', legacy: !plan.priceTerms };
  // no terms yet, or stored as general but re-priced elsewhere: shown as a discount, never silently as 25 €/h
  return { priceTerms: 'discount', discountReason: String(plan.discountReason || ''), legacy: true };
}

// The row choice for a stored lesson price: the standard rate (where offered), a fixed discount rate, or „Muu” with
// the stored rate prefilled (`stored: true` — saved unchanged to the cent until the admin edits it).
export function rateChoiceOf(lessonCents, minutes, { allowGeneral = false } = {}) {
  if (allowGeneral && isStandardLessonPrice(lessonCents, minutes)) return { hourlyRate: GENERAL_RATE, customRate: '', stored: false };
  const rate = DISCOUNT_HOURLY_RATES_CENTS.find((cents) => Number(lessonCents) === lessonCentsFromHourly(cents, minutes));
  if (rate) return { hourlyRate: String(rate), customRate: '', stored: false };
  return { hourlyRate: CUSTOM_RATE, customRate: centsText(hourlyCentsFromLesson(lessonCents, minutes)), stored: true };
}

export function parseRateCents(text) {
  const value = Number(String(text ?? '').trim().replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : 0;
}

// a row still showing its stored price untouched: the stored cents are kept exactly
function keptRow(row, was) {
  return Boolean(was?.stored) && row?.hourlyRate === CUSTOM_RATE && was.hourlyRate === CUSTOM_RATE
    && String(row.customRate ?? '').trim() === String(was.customRate ?? '').trim()
    && String(row.lessonMinutes) === String(was.lessonMinutes);
}

function rowError(row, was, { allowSame, allowGeneral }) {
  const choice = row?.hourlyRate ?? SAME_RATE;
  if (choice === SAME_RATE) return allowSame ? '' : 'Vali tunnitasu.';
  if (choice === GENERAL_RATE) return allowGeneral ? '' : 'Vali tunnitasu.';
  if (choice === CUSTOM_RATE) {
    if (keptRow(row, was)) return '';
    const cents = parseRateCents(row.customRate);
    return cents > 0 && cents < STANDARD_HOURLY_RATE_CENTS ? '' : `Sisesta oma tunnitasu: üle 0 ja alla ${centsText(STANDARD_HOURLY_RATE_CENTS)} €.`;
  }
  return DISCOUNT_HOURLY_RATES_CENTS.includes(Number(choice)) ? '' : 'Vali tunnitasu.';
}

// form: { priceTerms, hourlyRate, customRate, discountReason, lessonMinutes, allowGeneral,
//         subjects: { [subject]: { hourlyRate, customRate, lessonMinutes } } }; initial: the form as first shown.
// hourlyRate is a fixed rate ('2000' …), CUSTOM_RATE, GENERAL_RATE or (subjects) SAME_RATE.
export function validatePriceTerms(form = {}, initial = null) {
  const errors = {};
  if (!PRICE_TERMS.some((item) => item.id === form.priceTerms)) errors.priceTerms = 'Vali hinnatingimused.';
  if (form.priceTerms === 'discount') {
    const main = rowError(form, initial, { allowSame: false, allowGeneral: Boolean(form.allowGeneral) });
    if (main) errors.hourlyRate = main;
    const reason = String(form.discountReason || '').trim();
    if (!reason) errors.discountReason = 'Kirjuta soodustuse põhjus (nt vend või õde, mitu kursust).';
    else if (reason.length > DISCOUNT_REASON_MAX) errors.discountReason = `Põhjus on kuni ${DISCOUNT_REASON_MAX} märki.`;
    Object.entries(form.subjects || {}).forEach(([subject, row]) => {
      const error = rowError(row, initial?.subjects?.[subject], { allowSame: true, allowGeneral: true });
      if (error) errors[`subject:${subject}`] = error;
    });
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

// Per-lesson prices for the plan from a valid terms form. An untouched stored „Muu” keeps its cents exactly;
// a subject „sama kui kaardil” stays unwritten while the card keeps its stored price (billed at the card's price).
export function lessonPricesFromTerms(form, initial = null, plan = null) {
  const minutes = minutesOf(form.lessonMinutes);
  const general = form.priceTerms === 'general';
  const rowHourly = (row, cardHourly) => {
    const choice = row?.hourlyRate ?? SAME_RATE;
    if (choice === SAME_RATE) return cardHourly;
    if (choice === GENERAL_RATE) return STANDARD_HOURLY_RATE_CENTS;
    if (choice === CUSTOM_RATE) return parseRateCents(row.customRate);
    return Number(choice) || 0;
  };
  const mainKept = !general && plan?.lessonPriceCents && keptRow(form, initial);
  const hourlyCents = general ? STANDARD_HOURLY_RATE_CENTS
    : (mainKept ? hourlyCentsFromLesson(plan.lessonPriceCents, minutes) : rowHourly(form, 0));
  const lessonPriceCents = mainKept ? plan.lessonPriceCents : lessonCentsFromHourly(hourlyCents, minutes);
  const subjectPrices = {};
  Object.entries(form.subjects || {}).forEach(([subject, row]) => {
    const rowMinutes = minutesOf(row?.lessonMinutes);
    const stored = plan?.subjectPrices?.[subject];
    if (!general && stored?.lessonPriceCents && keptRow(row, initial?.subjects?.[subject])) {
      subjectPrices[subject] = { lessonPriceCents: stored.lessonPriceCents, lessonMinutes: stored.lessonMinutes || rowMinutes };
      return;
    }
    if (!general && (row?.hourlyRate ?? SAME_RATE) === SAME_RATE && mainKept && !stored?.lessonPriceCents) return;
    const ownHourly = general ? STANDARD_HOURLY_RATE_CENTS : rowHourly(row, hourlyCents);
    subjectPrices[subject] = { lessonPriceCents: lessonCentsFromHourly(ownHourly, rowMinutes), lessonMinutes: rowMinutes };
  });
  return { lessonPriceCents, hourlyRateCents: hourlyCents, subjectPrices };
}
