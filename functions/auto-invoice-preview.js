const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

const db = admin.firestore();
const SETTINGS_REF = db.collection('automationSettings').doc('monthlyInvoices');
const PREVIEW_REF = db.collection('automationPreviews').doc('monthlyInvoices');

const DEFAULT_SETTINGS = Object.freeze({
  enabled: false,
  invoiceDay: 1,
  dueDay: 10,
  mode: 'preview_only',
});

function previousBillingMonth(date = new Date()) {
  const target = new Date(date.getFullYear(), date.getMonth() - 1, 1, 12);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
}

function normalizedAutomaticInvoiceSettings(data = {}) {
  const invoiceDay = Math.min(28, Math.max(1, Number(data.invoiceDay) || DEFAULT_SETTINGS.invoiceDay));
  const dueDay = Math.min(28, Math.max(1, Number(data.dueDay) || DEFAULT_SETTINGS.dueDay));
  return {
    enabled: data.enabled === true,
    invoiceDay,
    dueDay,
    mode: data.enabled === true && data.mode === 'automatic' ? 'automatic' : 'preview_only',
  };
}

async function loadAutomaticInvoiceSettings() {
  const snap = await SETTINGS_REF.get();
  return normalizedAutomaticInvoiceSettings(snap.exists ? snap.data() : DEFAULT_SETTINGS);
}

function lessonIsBillable(lesson = {}) {
  if (String(lesson.invoiceId || '').trim() || lesson.billingStatus === 'invoiced') return false;
  if (lesson.packageAccountingSource === 'package_ledger_v1' || lesson.packageConsumptionStatus === 'consumed') return false;
  if (lesson.billingStatus === 'late_cancel_billable') return true;
  return lesson.status === 'Toimunud' && (!lesson.billingStatus || lesson.billingStatus === 'unbilled');
}

function selectBillableLessons(lessons = [], student = {}) {
  const candidates = lessons
    .filter((lesson) => lesson.studentId === student.id && lessonIsBillable(lesson))
    .sort((left, right) => `${left.date || ''}:${left.id || ''}`.localeCompare(`${right.date || ''}:${right.id || ''}`));
  const explicit = candidates.filter((lesson) => ['unbilled', 'late_cancel_billable'].includes(lesson.billingStatus) || lesson.accountingSource === 'crm_v2');
  const legacy = candidates.filter((lesson) => !lesson.billingStatus && lesson.accountingSource !== 'crm_v2');
  const hasCounter = Object.prototype.hasOwnProperty.call(student, 'lessonsSinceInvoice');
  const legacyCount = hasCounter ? Math.max(0, (Number(student.lessonsSinceInvoice) || 0) - explicit.length) : legacy.length;
  const selectedLegacy = legacy.slice(Math.max(0, legacy.length - legacyCount));
  return [...explicit, ...selectedLegacy]
    .filter((lesson, index, list) => list.findIndex((item) => item.id === lesson.id) === index)
    .sort((left, right) => `${left.date || ''}:${left.id || ''}`.localeCompare(`${right.date || ''}:${right.id || ''}`));
}

async function buildAutomaticInvoicePreview(month = previousBillingMonth(), settingsOverride = null) {
  const settings = settingsOverride || await loadAutomaticInvoiceSettings();
  const [studentsSnap, plansSnap, lessonsSnap] = await Promise.all([
    db.collection('students').get(),
    db.collection('studentRevenuePlans').get(),
    db.collection('lessons')
      .where('date', '>=', `${month}-01`)
      .where('date', '<=', `${month}-31`)
      .get(),
  ]);

  const students = studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const plans = plansSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const lessons = lessonsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const planByStudent = new Map(plans.map((plan) => [plan.studentId, plan]));
  const ready = [];
  const blocked = [];

  students.forEach((student) => {
    const selected = selectBillableLessons(lessons, student)
      .filter((lesson) => String(lesson.date || '').startsWith(`${month}-`));
    if (!selected.length) return;

    const plan = planByStudent.get(student.id);
    const lessonPriceCents = Math.max(
      0,
      Number(plan?.lessonPriceCents) || Math.round((Number(student.lessonPrice) || 0) * 100),
    );
    const item = {
      studentId: student.id,
      studentName: student.name || 'Õpilane',
      lessonIds: selected.map((lesson) => lesson.id),
      lessonCount: selected.length,
      lessonPriceCents,
      amountCents: selected.length * lessonPriceCents,
    };
    if (!lessonPriceCents) blocked.push({ ...item, reason: 'Tunni hind puudub' });
    else ready.push(item);
  });

  return {
    month,
    mode: 'preview_only',
    settings,
    ready,
    blocked,
    totals: {
      invoices: ready.length,
      lessons: ready.reduce((sum, item) => sum + item.lessonCount, 0),
      amountCents: ready.reduce((sum, item) => sum + item.amountCents, 0),
      blocked: blocked.length,
    },
    generatedAt: new Date().toISOString(),
  };
}

const automaticInvoicePreview = functions
  .region('us-central1')
  .pubsub.schedule('15 6 * * *')
  .timeZone('Europe/Tallinn')
  .onRun(async () => {
    const settings = await loadAutomaticInvoiceSettings();
    const preview = await buildAutomaticInvoicePreview(previousBillingMonth(), settings);
    await PREVIEW_REF.set(preview, { merge: false });
    console.log('Automatic invoice preview generated', {
      enabled: settings.enabled,
      mode: settings.mode,
      totals: preview.totals,
    });
    return null;
  });

module.exports = {
  automaticInvoicePreview,
  buildAutomaticInvoicePreview,
  loadAutomaticInvoiceSettings,
  normalizedAutomaticInvoiceSettings,
  previousBillingMonth,
  lessonIsBillable,
  selectBillableLessons,
};
