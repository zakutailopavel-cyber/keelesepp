export function lessonIsBillable(lesson = {}) {
  if (String(lesson.invoiceId || '').trim() || lesson.billingStatus === 'invoiced') return false;
  if (lesson.packageAccountingSource === 'package_ledger_v1' || lesson.packageConsumptionStatus === 'consumed') return false;
  if (lesson.billingStatus === 'late_cancel_billable') return true;
  return lesson.status === 'Toimunud' && (!lesson.billingStatus || lesson.billingStatus === 'unbilled');
}

export function selectBillableLessons(lessons = [], student = {}) {
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

export function lessonAccountingRows(lessons = [], students = [], plans = []) {
  const planByStudent = new Map(plans.map((plan) => [plan.studentId, plan]));
  return students.map((student) => {
    const items = selectBillableLessons(lessons, student);
    const plan = planByStudent.get(student.id);
    const lessonPriceCents = Math.max(0, Number(plan?.lessonPriceCents) || Math.round((Number(student.lessonPrice) || 0) * 100));
    return {
      student,
      lessons: items,
      lessonPriceCents,
      amountCents: items.length * lessonPriceCents,
    };
  }).filter((row) => row.lessons.length)
    .sort((left, right) => right.lessons.length - left.lessons.length || left.student.name.localeCompare(right.student.name, 'et'));
}

export function billingAttentionLessons(lessons = []) {
  return lessons.filter((lesson) => (
    ['Puudus_p', 'Puudus_eta'].includes(lesson.status)
    && !lesson.billingStatus
    && !lesson.invoiceId
    && lesson.packageConsumptionStatus !== 'consumed'
  )).sort((left, right) => `${right.date || ''}:${right.id || ''}`.localeCompare(`${left.date || ''}:${left.id || ''}`));
}

export function defaultInvoiceDue(date = new Date()) {
  const due = new Date(date.getFullYear(), date.getMonth() + 1, 10, 12);
  return due.toISOString().slice(0, 10);
}
