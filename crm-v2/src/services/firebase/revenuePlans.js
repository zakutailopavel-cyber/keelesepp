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
    billingMode: data.billingMode === 'advance' ? 'advance' : 'current',
    chargeNoShow: data.chargeNoShow !== false,
    validFrom: clean(data.validFrom),
    priceHistory: Array.isArray(data.priceHistory) ? data.priceHistory : [],
    active: data.active !== false,
  };
}

export const LESSON_MINUTES = [30, 45, 60, 75, 90, 120];
export const BILLING_MODES = [
  { id: 'current', label: 'Jooksev kuu (tasuda 10.)' },
  { id: 'advance', label: 'Kuu ette' },
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
    const { db } = requireFirebaseClient();
    const updatedAt = new Date().toISOString();
    const updatedBy = user.displayName || user.email || '';
    const billing = {
      lessonMinutes: LESSON_MINUTES.includes(Number(values.lessonMinutes)) ? Number(values.lessonMinutes) : (previous?.lessonMinutes || 60),
      billingMode: values.billingMode === 'advance' ? 'advance' : values.billingMode === 'current' ? 'current' : (previous?.billingMode || 'current'),
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
    };
    // The price lives only here (admin / finance can read it). It is no longer copied to the student card,
    // which teachers and parents can read.
    const batch = writeBatch(db);
    batch.set(doc(db, 'studentRevenuePlans', student.id), plan, { merge: true });
    batch.set(doc(collection(db, 'activityLog')), {
      type: 'finance.revenue_plan_updated',
      label: `${student.name || 'Õpilane'} tuluprognoos uuendatud`,
      byUid: user.uid,
      byName: updatedBy || 'Administraator',
      byRole: 'admin',
      createdAt: updatedAt,
      date: updatedAt.slice(0, 10),
      meta: { studentId: student.id, studentName: student.name || '', lessonPriceCents: validation.lessonPriceCents, weeklyLessons: validation.weeklyLessons, billingMode: billing.billingMode },
    });
    await batch.commit();
    return normalizeRevenuePlan(student.id, plan);
  },
};
