import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { DISCOUNT_REASON_MAX, PRICE_TERMS } from '../../features/finance/priceTerms.js';
import { BILLING_MODE_IDS, subjectBillingOf } from '../../features/finance/subjectBilling.js';

function clean(value) {
  return String(value || '').trim();
}

export function normalizeRevenuePlan(id, data = {}) {
  return {
    id,
    ...data,
    studentId: clean(data.studentId || id),
    studentName: clean(data.studentName) || 'Nimetu õpilane',
    lessonPriceCents: Math.max(0, Math.round(Number(data.lessonPriceCents) || 0)),
    weeklyLessons: Math.max(0, Number(data.weeklyLessons) || 0),
    lessonMinutes: LESSON_MINUTES.includes(Number(data.lessonMinutes)) ? Number(data.lessonMinutes) : 60,
    billingMode: ['advance', 'actual', 'current', 'package'].includes(data.billingMode) ? data.billingMode : 'advance',
    chargeNoShow: data.chargeNoShow !== false,
    validFrom: clean(data.validFrom),
    priceHistory: Array.isArray(data.priceHistory) ? data.priceHistory : [],
    subjectPrices: subjectPricesOf(data.subjectPrices),
    // billing per subject (owner 2026-11-06): { "Inglise keel": { billingMode, weeklyLessons, chargeNoShow } }, a
    // missing field = the card's value (finance/subjectBilling.js)
    subjectBilling: subjectBillingOf(data.subjectBilling),
    active: data.active !== false,
  };
}

// the price of each further subject of the card (owner 2026-10-20): { "Matemaatika": { lessonPriceCents, lessonMinutes } };
// the card's own price is its main subject's
export function subjectPricesOf(value) {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(Object.entries(value).slice(0, 8)
    .map(([subject, price]) => [clean(subject), { lessonPriceCents: Math.max(0, Math.round(Number(price?.lessonPriceCents) || 0)), lessonMinutes: LESSON_MINUTES.includes(Number(price?.lessonMinutes)) ? Number(price.lessonMinutes) : 60 }])
    .filter(([subject, price]) => subject && price.lessonPriceCents > 0));
}

// form values { "Matemaatika": { lessonPrice: "28", lessonMinutes: "45" } } → stored prices, or an error per subject
export function validateSubjectPrices(values = {}) {
  const errors = {};
  const prices = {};
  Object.entries(values || {}).forEach(([subject, entry]) => {
    const text = String(entry?.lessonPrice ?? '').trim();
    if (!text) return; // no own price: the subject is billed at the card's price
    const price = Number(text.replace(',', '.'));
    if (!Number.isFinite(price) || price <= 0 || price > 10000) { errors[subject] = 'Sisesta tunni hind vahemikus 0,01–10 000 eurot.'; return; }
    prices[subject] = { lessonPriceCents: Math.round(price * 100), lessonMinutes: LESSON_MINUTES.includes(Number(entry?.lessonMinutes)) ? Number(entry.lessonMinutes) : 60 };
  });
  return { valid: Object.keys(errors).length === 0, errors, prices };
}

// form values { "Inglise keel": { billingMode: "package", weeklyLessons: "1,5", chargeNoShow: false } } → stored
// overrides, or an error per subject. A field left out (or '') is not stored: the subject takes the card's value.
export function validateSubjectBilling(values = {}) {
  const errors = {};
  const billing = {};
  Object.entries(values || {}).forEach(([subject, entry]) => {
    const name = clean(subject);
    if (!name || !entry || typeof entry !== 'object') return;
    const own = {};
    if (entry.billingMode !== undefined && entry.billingMode !== '') {
      if (!BILLING_MODE_IDS.includes(entry.billingMode)) { errors[name] = 'Vali arveldusviis.'; return; }
      own.billingMode = entry.billingMode;
    }
    const weeklyText = String(entry.weeklyLessons ?? '').trim();
    if (weeklyText) {
      const weekly = Number(weeklyText.replace(',', '.'));
      if (!Number.isFinite(weekly) || weekly < 0.5 || weekly > 50) { errors[name] = 'Sisesta 0,5–50 tundi nädalas.'; return; }
      own.weeklyLessons = Math.round(weekly * 100) / 100;
    }
    if (typeof entry.chargeNoShow === 'boolean') own.chargeNoShow = entry.chargeNoShow;
    if (Object.keys(own).length) billing[name] = own;
  });
  if (Object.keys(billing).length > 8) errors.form = 'Kuni 8 ainet saavad oma arvelduse.';
  return { valid: Object.keys(errors).length === 0, errors, billing };
}

export const LESSON_MINUTES = [30, 45, 60, 75, 90, 120];
export const BILLING_MODES = [
  { id: 'advance', label: 'Kuu ette (vaikimisi)' },
  { id: 'actual', label: 'Pärast toimunud tunde' },
  { id: 'current', label: 'Jooksev kuu (vana leping)' },
  // lesson tokens (owner 2026-10-14): a paid invoice for N lessons, every lesson takes one; no monthly invoice
  { id: 'package', label: 'Tunnipakett (ettemaks N tunni eest)' },
];

// „?” help of the billing fields on the student card (FieldHelp): what each mode means for the invoices
export const BILLING_MODE_HELP = 'Kuu ette: arve tuleb kuu alguses selle kuu kalendris planeeritud tundide eest, tähtaeg 10. kuupäev; '
  + 'eelmise kuu toimumata tunnid tulevad järgmiselt arvelt maha. Jooksev kuu: sama arvutus, vana lepingu nimi. '
  + 'Pärast toimunud tunde: arve tuleb kuu lõpus ainult toimunud tundide eest, tähtaeg järgmise kuu 10. kuupäev. '
  + 'Tunnipakett: kuuarvet ei tehta, õpilane maksab ette N tunni eest (Finantsid → Tunnipakett) ja iga tund võtab ühe. '
  + 'Ühel kaardil ei saa „Pärast toimunud tunde” ja „Kuu ette” / „Jooksev kuu” koos olla (üks kuuarve), tunnipakett sobib iga viisiga.';
export const WEEKLY_LESSONS_HELP = 'Mitu tundi nädalas see aine tavaliselt on. Arvet see ei muuda (arve tuleb kalendrist), '
  + 'seda kasutab ainult tuluprognoos. Kui teisel ainel pole oma arvu, on selle tunnid kaardi arvu sees.';
export const NO_SHOW_HELP = 'Kui õpilane puudub ette teatamata: linnuke = tund on tasuline (kuuarvel ei tule tagasi, tunnipaketist võetakse tund). '
  + 'Ühe tunni erandi saab teha tunni juures.';

// A new price or lesson length starts from `validFrom`; the previous one is kept so earlier lessons keep their price.
export function nextPriceHistory(previous, next) {
  const history = Array.isArray(previous?.priceHistory) ? previous.priceHistory : [];
  const changed = previous?.lessonPriceCents && (previous.lessonPriceCents !== next.lessonPriceCents || (previous.lessonMinutes || 60) !== next.lessonMinutes);
  if (!changed) return history;
  const terms = previous.priceTerms ? { priceTerms: previous.priceTerms, ...(previous.discountReason ? { discountReason: previous.discountReason } : {}) } : {};
  return [...history, { lessonPriceCents: previous.lessonPriceCents, lessonMinutes: previous.lessonMinutes || 60, validFrom: previous.validFrom || '', validTo: next.validFrom, ...terms }].slice(-60);
}

// „Üldtingimused” / „Soodustus” (2026-10-29): the terms the price was set by, with who and when changed them.
// values without priceTerms (the forecast form of Finantsid) leave the stored terms as they are.
export function priceTermsRecord(values = {}, previous = null, actor = {}) {
  if (!values.priceTerms) return {};
  if (!PRICE_TERMS.some((item) => item.id === values.priceTerms)) throw new Error('Vali hinnatingimused.');
  const discountReason = values.priceTerms === 'discount' ? clean(values.discountReason) : '';
  if (values.priceTerms === 'discount' && !discountReason) throw new Error('Kirjuta soodustuse põhjus.');
  if (discountReason.length > DISCOUNT_REASON_MAX) throw new Error(`Soodustuse põhjus on kuni ${DISCOUNT_REASON_MAX} märki.`);
  const hourlyRateCents = Math.round(Number(values.hourlyRateCents) || 0);
  if (hourlyRateCents <= 0 || hourlyRateCents > 1000000) throw new Error('Sisesta tunnitasu vahemikus 0,01–10 000 eurot tunnis.');
  const same = previous?.priceTermsChangedAt && previous.priceTerms === values.priceTerms
    && clean(previous.discountReason) === discountReason && Number(previous.hourlyRateCents) === hourlyRateCents;
  return {
    priceTerms: values.priceTerms,
    hourlyRateCents,
    discountReason,
    priceTermsChangedAt: same ? previous.priceTermsChangedAt : actor.at,
    priceTermsChangedBy: same ? clean(previous.priceTermsChangedBy) : clean(actor.name),
    priceTermsChangedByUid: same ? clean(previous.priceTermsChangedByUid) : clean(actor.uid),
  };
}

export function validateRevenuePlan(values = {}) {
  const price = Number(String(values.lessonPrice || '').replace(',', '.'));
  const weeklyLessons = Number(String(values.weeklyLessons || '').replace(',', '.'));
  const errors = {};
  if (!Number.isFinite(price) || price <= 0 || price > 10000) errors.lessonPrice = 'Sisesta tunni hind vahemikus 0,01–10 000 eurot.';
  if (!Number.isFinite(weeklyLessons) || weeklyLessons < 0.5 || weeklyLessons > 50) errors.weeklyLessons = 'Sisesta 0,5–50 tundi nädalas.';
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    lessonPriceCents: Math.round(price * 100),
    weeklyLessons: Math.round(weeklyLessons * 100) / 100,
  };
}

export const revenuePlansService = {
  async get(studentId) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDoc(doc(db, 'studentRevenuePlans', studentId));
    return snapshot.exists() ? normalizeRevenuePlan(snapshot.id, snapshot.data()) : null;
  },

  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'studentRevenuePlans'));
    return snapshot.docs.map((item) => normalizeRevenuePlan(item.id, item.data()))
      .filter((item) => item.active)
      .sort((left, right) => left.studentName.localeCompare(right.studentName, 'et', { sensitivity: 'base' }));
  },

  // previous: the stored plan (from get/list), used for the price history
  async save(student, values, user, previous = null) {
    if (!user?.roles?.includes('admin')) throw new Error('Ainult administraator saab tuluprognoosi muuta.');
    if (!student?.id) throw new Error('Õpilast ei leitud.');
    const validation = validateRevenuePlan(values);
    if (!validation.valid) throw new Error(Object.values(validation.errors)[0]);
    const subjects = validateSubjectPrices(values.subjectPrices);
    if (!subjects.valid) throw new Error(Object.values(subjects.errors)[0]);
    const perSubject = validateSubjectBilling(values.subjectBilling);
    if (!perSubject.valid) throw new Error(Object.values(perSubject.errors)[0]);
    const updatedAt = new Date().toISOString();
    const updatedBy = user.displayName || user.email || '';
    const terms = priceTermsRecord(values, previous, { at: updatedAt, name: updatedBy, uid: user.uid });
    const { db } = requireFirebaseClient();
    const billing = {
      lessonMinutes: LESSON_MINUTES.includes(Number(values.lessonMinutes)) ? Number(values.lessonMinutes) : (previous?.lessonMinutes || 60),
      billingMode: ['advance', 'actual', 'current', 'package'].includes(values.billingMode) ? values.billingMode : (previous?.billingMode || 'advance'),
      chargeNoShow: values.chargeNoShow === undefined ? previous?.chargeNoShow !== false : Boolean(values.chargeNoShow),
      validFrom: /^\d{4}-\d{2}-\d{2}$/.test(String(values.validFrom || '')) ? values.validFrom : updatedAt.slice(0, 10),
    };
    const plan = {
      studentId: student.id,
      studentName: clean(student.name),
      lessonPriceCents: validation.lessonPriceCents,
      weeklyLessons: validation.weeklyLessons,
      currency: 'EUR',
      active: true,
      updatedAt,
      updatedBy,
      updatedByUid: user.uid,
      ...billing,
      priceHistory: nextPriceHistory(previous, { lessonPriceCents: validation.lessonPriceCents, ...billing }),
      ...(values.subjectPrices ? { subjectPrices: subjects.prices } : {}),
      // written only when the form sends it (a card with own billing for a subject, or one that had it): a plan
      // without it bills every subject by the card's values, and saves keep working before the rules know the field
      ...(values.subjectBilling ? { subjectBilling: perSubject.billing } : {}),
      ...terms,
    };
    // activityLog gets only that the plan changed — no price, rate, discount or terms (finance.* entries are read by
    // admin / finance only since 2026-11-11, but older rules let every teacher read them). The price lives only here
    // (admin / finance can read it). It is no longer copied to the student card, which teachers and parents can read.
    const batch = writeBatch(db);
    // mergeFields: every written field is replaced whole (a removed subject price really goes), the rest stays
    batch.set(doc(db, 'studentRevenuePlans', student.id), plan, { mergeFields: Object.keys(plan) });
    batch.set(doc(collection(db, 'activityLog')), {
      type: 'finance.revenue_plan_updated',
      label: `${student.name || 'Õpilane'} tuluprognoos uuendatud`,
      byUid: user.uid,
      byName: updatedBy || 'Administraator',
      byRole: 'admin',
      createdAt: updatedAt,
      date: updatedAt.slice(0, 10),
      // no price, per-subject prices, per-subject billing or terms here (review 2026-11-11): the history of the
      // price stays in the plan's own priceHistory, which only admin / finance read
      meta: { studentId: student.id, studentName: student.name || '', weeklyLessons: validation.weeklyLessons, billingMode: billing.billingMode, ...(values.subjectPrices ? { subjectPricesChanged: true } : {}) },
    });
    await batch.commit();
    return normalizeRevenuePlan(student.id, plan);
  },
};
