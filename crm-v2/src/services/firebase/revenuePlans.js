import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
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
    active: data.active !== false,
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
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'studentRevenuePlans'));
    return snapshot.docs.map((item) => normalizeRevenuePlan(item.id, item.data()))
      .filter((item) => item.active)
      .sort((left, right) => left.studentName.localeCompare(right.studentName, 'et', { sensitivity: 'base' }));
  },

  async save(student, values, user) {
    if (!user?.roles?.includes('admin')) throw new Error('Ainult administraator saab tuluprognoosi muuta.');
    if (!student?.id) throw new Error('Õpilast ei leitud.');
    const validation = validateRevenuePlan(values);
    if (!validation.valid) throw new Error(Object.values(validation.errors)[0]);
    const { db } = requireFirebaseClient();
    const updatedAt = new Date().toISOString();
    const updatedBy = user.displayName || user.email || '';
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
    };
    const batch = writeBatch(db);
    batch.set(doc(db, 'studentRevenuePlans', student.id), plan, { merge: true });
    batch.set(doc(db, 'students', student.id), {
      lessonPrice: validation.lessonPriceCents / 100,
      weeklyLessons: validation.weeklyLessons,
      revenuePlanUpdatedAt: updatedAt,
    }, { merge: true });
    batch.set(doc(collection(db, 'activityLog')), {
      type: 'finance.revenue_plan_updated',
      label: `${student.name || 'Õpilane'} tuluprognoos uuendatud`,
      byUid: user.uid,
      byName: updatedBy || 'Administraator',
      byRole: 'admin',
      createdAt: updatedAt,
      date: updatedAt.slice(0, 10),
      meta: { studentId: student.id, studentName: student.name || '', lessonPriceCents: validation.lessonPriceCents, weeklyLessons: validation.weeklyLessons },
    });
    await batch.commit();
    return normalizeRevenuePlan(student.id, plan);
  },
};
