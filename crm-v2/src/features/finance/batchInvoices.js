function normalizeMonth(value) {
  const match = String(value || '').match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  return match ? match[0] : '';
}

export function currentBillingMonth(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function previousBillingMonth(date = new Date()) {
  const previous = new Date(date.getFullYear(), date.getMonth() - 1, 1, 12);
  return currentBillingMonth(previous);
}

export function defaultAutomaticBillingMonth(date = new Date()) {
  // Automatic period billing must operate on a completed month. Using the
  // current month produces partial invoices and makes a scheduled run on the
  // 10th especially surprising, so the previous calendar month is the safe
  // default. An administrator can still select another month explicitly.
  return previousBillingMonth(date);
}

export function lessonBelongsToMonth(lesson, month) {
  const normalizedMonth = normalizeMonth(month);
  return Boolean(normalizedMonth && String(lesson?.date || '').startsWith(`${normalizedMonth}-`));
}

export function buildBatchInvoicePlan(rows = [], month) {
  const normalizedMonth = normalizeMonth(month);
  if (!normalizedMonth) return { month: '', ready: [], blocked: [], totals: { invoices: 0, lessons: 0, amountCents: 0 } };

  const ready = [];
  const blocked = [];

  rows.forEach((row) => {
    const lessons = (row.lessons || []).filter((lesson) => lessonBelongsToMonth(lesson, normalizedMonth));
    if (!lessons.length) return;

    const item = {
      studentId: row.student?.id || '',
      studentName: row.student?.name || 'Õpilane',
      lessonIds: lessons.map((lesson) => lesson.id),
      lessonCount: lessons.length,
      lessonPriceCents: Number(row.lessonPriceCents || 0),
      amountCents: lessons.length * Number(row.lessonPriceCents || 0),
    };

    if (!item.studentId || !item.lessonPriceCents) blocked.push({ ...item, reason: !item.studentId ? 'Õpilase kirje puudub' : 'Tunni hind puudub' });
    else ready.push(item);
  });

  return {
    month: normalizedMonth,
    ready,
    blocked,
    totals: {
      invoices: ready.length,
      lessons: ready.reduce((sum, item) => sum + item.lessonCount, 0),
      amountCents: ready.reduce((sum, item) => sum + item.amountCents, 0),
    },
  };
}

export function batchInvoicePayload(item, { due, description = '', paymentReference = '' } = {}) {
  return {
    studentId: item.studentId,
    lessonIds: [...item.lessonIds],
    due,
    description,
    paymentReference,
  };
}
