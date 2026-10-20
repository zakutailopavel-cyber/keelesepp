import { collection, doc, getDoc, getDocs, writeBatch } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

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

export const LESSON_MINUTES = [30, 45, 60, 75, 90, 120];
export const BILLING_MODES = [
  { id: 'advance', label: 'Kuu ette (vaikimisi)' },
  { id: 'actual', label: 'Pärast toimunud tunde' },
  { id: 'current', label: 'Jooksev kuu (vana leping)' },
  // lesson tokens (owner 2026-10-14): a paid invoice for N lessons, every lesson takes one; no monthly invoice
  { id: 'package', label: 'Tunnipakett (ettemaks N tunni eest)' },
];

// A new price or lesson length starts from `validFrom`; the previous one is kept so earlier lessons keep their price.
export function nextPriceHistory(previous, next) {
  const history = Array.isArray(previous?.priceHistory) ? previous.priceHistory : [];
  const changed = previous?.lessonPriceCents && (previous.lessonPriceCents !== next.lessonPriceCents || (previous.lessonMinutes || 60) !== next.lessonMinutes);
  if (!changed) return history;
  return [...history, { lessonPriceCents: previous.lessonPriceCents, lessonMinutes: previous.lessonMinutes || 60, validFrom: previous.validFrom || '', validTo: next.validFrom }].slice(-60);
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
    const { db } = requireFirebaseClient();
    const updatedAt = new Date().toISOString();
    const updatedBy = user.displayName || user.email || '';
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
    };
    // The price lives only here (admin / finance can read it). It is no longer copied to the student card,
    // which teachers and parents can read.
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
      meta: { studentId: student.id, studentName: student.name || '', lessonPriceCents: validation.lessonPriceCents, weeklyLessons: validation.weeklyLessons, billingMode: billing.billingMode, ...(values.subjectPrices ? { subjectPrices: subjects.prices } : {}) },
    });
    await batch.commit();
    return normalizeRevenuePlan(student.id, plan);
  },
};
