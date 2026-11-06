// Billing per subject (owner 2026-11-06): on a card with several subjects every subject may have its own billing mode,
// lessons per week and no-show rule. They live in studentRevenuePlans.subjectBilling:
//   { "Inglise keel": { billingMode: "package" }, "Matemaatika": { weeklyLessons: 2, chargeNoShow: false } }
// A field that is absent is the card's own value (the card's main subject edits the card's fields), so a plan without
// `subjectBilling` bills exactly as before. Prices stay in `subjectPrices` (#1122), price terms stay card-wide.
//
// The browser copy of functions/subject-billing-core.js (the server checks invoices with that file; its test
// subject-billing-core.test.js runs both files on the same cases), so what the student card shows is what is charged.
// Keep the two files the same.

export const BILLING_MODE_IDS = ['advance', 'actual', 'current', 'package'];
export const SUBJECT_BILLING_FIELDS = ['billingMode', 'weeklyLessons', 'chargeNoShow'];
const MAX_SUBJECTS = 8;

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');
const sameSubject = (a, b) => clean(a).toLocaleLowerCase('et') === clean(b).toLocaleLowerCase('et');

export function cardBillingMode(plan) {
  return BILLING_MODE_IDS.includes(plan && plan.billingMode) ? plan.billingMode : 'advance';
}

// the card's own values (the main subject's, and every subject's that has none of its own)
export function cardBilling(plan) {
  return {
    billingMode: cardBillingMode(plan),
    weeklyLessons: Math.max(0, Number(plan && plan.weeklyLessons) || 0),
    chargeNoShow: !plan || plan.chargeNoShow !== false,
  };
}

// one stored override, only its valid fields ({} = nothing of its own)
export function cleanOverride(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const out = {};
  if (BILLING_MODE_IDS.includes(raw.billingMode)) out.billingMode = raw.billingMode;
  const weekly = Number(raw.weeklyLessons);
  if (raw.weeklyLessons !== undefined && raw.weeklyLessons !== null && raw.weeklyLessons !== '' && Number.isFinite(weekly) && weekly >= 0.5 && weekly <= 50) out.weeklyLessons = Math.round(weekly * 100) / 100;
  if (typeof raw.chargeNoShow === 'boolean') out.chargeNoShow = raw.chargeNoShow;
  return out;
}

// the stored map, cleaned: { subject: override } without empty overrides
export function subjectBillingOf(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).slice(0, MAX_SUBJECTS)
    .map(([subject, raw]) => [clean(subject), cleanOverride(raw)])
    .filter(([subject, override]) => subject && Object.keys(override).length));
}

// a subject's own override; the key is matched as written, else ignoring case („Inglise Keel” = „Inglise keel”)
function subjectOverride(plan, subject) {
  const map = plan && plan.subjectBilling;
  if (!subject || !map || typeof map !== 'object') return {};
  if (Object.prototype.hasOwnProperty.call(map, subject)) return cleanOverride(map[subject]);
  const key = Object.keys(map).find((item) => sameSubject(item, subject));
  return key ? cleanOverride(map[key]) : {};
}

// The billing of one subject of a card: its own value, else the card's. The main subject (or no subject: a card with
// one subject) is always the card's own values, also when a stale entry for it is stored.
// → { billingMode, weeklyLessons, chargeNoShow, own: { billingMode, weeklyLessons, chargeNoShow } (true = its own) }
export function subjectBilling(plan, subject = '', main = '') {
  const card = cardBilling(plan);
  const override = !subject || sameSubject(subject, main) ? {} : subjectOverride(plan, subject);
  const own = Object.fromEntries(SUBJECT_BILLING_FIELDS.map((field) => [field, field in override]));
  return { ...card, ...override, own };
}

// the plan as one subject is billed by (the price is not touched: subjectPrices / planForSubject do that)
export function planForSubjectBilling(plan, subject = '', main = '') {
  const { billingMode, weeklyLessons, chargeNoShow } = subjectBilling(plan, subject, main);
  return { ...(plan || {}), billingMode, weeklyLessons, chargeNoShow };
}

// does a plan carry any per-subject billing at all (false = the card bills exactly as before)
export function hasSubjectBilling(plan) {
  return Object.keys(subjectBillingOf(plan && plan.subjectBilling)).length > 0;
}

// How a card's monthly row is billed, from its subjects' modes:
// - package subjects get no monthly line (their lessons take package credits);
// - „Pärast toimunud tunde” (actual: last month's held lessons, due next month) and the modes billed for the month
//   ahead (advance / current) cannot share one monthly invoice: `mixedTiming` (the row is not invoiced, the card says why).
// → { mode, monthlySubjects, packageSubjects, mixedTiming }. mode: 'advance' | 'current' | 'actual' | 'package'.
export function cardMonthlyMode(plan, subjects = [], main = '') {
  const list = subjects.length ? subjects : [''];
  if (list.length < 2) {
    const mode = cardBillingMode(plan);
    return { mode, monthlySubjects: mode === 'package' ? [] : list.filter(Boolean), packageSubjects: mode === 'package' ? list.filter(Boolean) : [], mixedTiming: false };
  }
  const modes = list.map((subject) => subjectBilling(plan, subject, main).billingMode);
  const monthlySubjects = list.filter((_, index) => modes[index] !== 'package');
  const packageSubjects = list.filter((_, index) => modes[index] === 'package');
  const monthlyModes = modes.filter((mode) => mode !== 'package');
  if (!monthlyModes.length) return { mode: 'package', monthlySubjects, packageSubjects, mixedTiming: false };
  const actual = monthlyModes.filter((mode) => mode === 'actual').length;
  const mixedTiming = actual > 0 && actual < monthlyModes.length;
  if (actual === monthlyModes.length) return { mode: 'actual', monthlySubjects, packageSubjects, mixedTiming };
  const mainIndex = list.findIndex((subject) => sameSubject(subject, main));
  const mainMode = mainIndex >= 0 ? modes[mainIndex] : '';
  const mode = mainMode === 'advance' || mainMode === 'current' ? mainMode : monthlyModes.find((item) => item !== 'actual');
  return { mode, monthlySubjects, packageSubjects, mixedTiming };
}

// Revenue forecast cents per week of a plan: the card's price × the card's lessons per week, plus every further
// subject that has its OWN lessons per week × that subject's price. A subject without its own number counts inside the
// card's number (exactly as before per-subject billing). The main subject never has an entry (the card form writes none).
export function weeklyForecastCents(plan) {
  if (!plan) return 0;
  const card = Math.max(0, Number(plan.lessonPriceCents) || 0) * Math.max(0, Number(plan.weeklyLessons) || 0);
  const extra = Object.entries(subjectBillingOf(plan.subjectBilling))
    .filter(([, override]) => override.weeklyLessons)
    .reduce((sum, [subject, override]) => {
      const prices = plan.subjectPrices && typeof plan.subjectPrices === 'object' ? plan.subjectPrices : {};
      const key = Object.keys(prices).find((item) => sameSubject(item, subject));
      const price = Math.max(0, Number(key && prices[key] && prices[key].lessonPriceCents) || 0) || Math.max(0, Number(plan.lessonPriceCents) || 0);
      return sum + price * override.weeklyLessons;
    }, 0);
  return card + extra;
}
