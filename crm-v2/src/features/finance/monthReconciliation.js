// „Kuu võrdlus” (owner 2026-11-26, built 2026-11-27): one month, one line per student — does the money that had to
// come match the money that is recorded? Pure: the page loads the data and acts only through existing operations
// (financeApi /payments, /cash/teacher-receipt, the invoice reminder, the bank statement panel). Nothing is stored.
//
// What a student owes for the month: the month's invoices (planMonth, else the invoice date); without an invoice — the
// held chargeable lessons at the card's price. What counts as received: payments on those invoices, a lesson's
// „Makstud sularahas” mark, and „Sain sularaha” receipts for lessons from that student in the month.
// A card with „Maksab sularahas” is never a debtor here: it waits for „Sain kätte” (owner 2026-11-26).
// FIE invoices are the owner's alone (owner 2026-11-09): left out unless `includeFie`.
import { financeRowState } from './financeRows.js';
import { invoiceBillsNothing, isChargeable, shiftMonth } from './monthlyBilling.js';
import { cardBillingMode } from './subjectBilling.js';

const clean = (value) => String(value ?? '').trim();
const sameName = (left, right) => clean(left).toLocaleLowerCase('et') === clean(right).toLocaleLowerCase('et');

export const invoiceMonth = (invoice = {}) => String(invoice.planMonth || invoice.month || invoice.date || '').slice(0, 7);
const invoiceLabel = (invoice = {}) => invoice.num || invoice.number || invoice.invoiceNumber || '';
const invoiceStudentIds = (invoice = {}) => [...new Set([invoice.studentId, ...(Array.isArray(invoice.studentIds) ? invoice.studentIds : [])].map(clean).filter(Boolean))];

// the card pays (some subject) in cash at the lesson
export const paysCash = (plan) => Array.isArray(plan?.cashSubjects) && plan.cashSubjects.length > 0;

// one lesson at the card's price: a further subject may have its own price and length; a 90 min lesson on a 60 min
// price is 1.5 lessons
export function lessonPriceCents(lesson = {}, plan = {}, student = {}) {
  const prices = plan?.subjectPrices && typeof plan.subjectPrices === 'object' ? plan.subjectPrices : {};
  const key = Object.keys(prices).find((subject) => sameName(subject, lesson.subject));
  const own = key ? prices[key] : null;
  const price = Number(own?.lessonPriceCents) || Number(plan?.lessonPriceCents) || Math.round((Number(student?.lessonPrice) || 0) * 100);
  const minutes = Number(own?.lessonMinutes) || Number(plan?.lessonMinutes) || 60;
  const units = (Number(lesson.duration) || minutes) / minutes;
  return Math.max(0, Math.round(price * units));
}

// already settled another way: on an invoice, from a package, or paid in cash at the lesson
const lessonOnInvoice = (lesson) => Boolean(clean(lesson.invoiceId)) || lesson.billingStatus === 'invoiced';
const lessonFromPackage = (lesson) => lesson.packageAccountingSource === 'package_ledger_v1' || lesson.packageConsumptionStatus === 'consumed';
const lessonCashPaid = (lesson) => Boolean(lesson.cashPaid && lesson.cashPaid.receiptId);

const lessonWord = (count) => (count === 1 ? '1 tund' : `${count} tundi`);

export function monthReconciliation({ month, students = [], plans = [], invoices = [], lessons = [], cashEntries = [], includeFie = false, today = new Date() } = {}) {
  const planByStudent = new Map(plans.map((plan) => [plan.studentId, plan]));
  const studentById = new Map(students.map((student) => [student.id, student]));
  const live = invoices.filter((invoice) => !invoiceBillsNothing(invoice) && (includeFie || invoice.issuer !== 'fie'));
  const nextMonth = shiftMonth(month, 1);

  // payer rows: a student, or (an invoice without a card) the payer's name
  const rows = new Map();
  const rowOf = (key, name, student = null) => {
    if (!rows.has(key)) rows.set(key, { key, studentId: student?.id || '', name: clean(name) || '—', student, invoices: [], invoicedCents: 0, paidCents: 0, balanceCents: 0, overdue: false, coveredByInvoice: false, lessonCount: 0, lessonCents: 0, cashLessonCount: 0, cashLessonCents: 0, receiptCents: 0 });
    return rows.get(key);
  };

  const coveredNext = new Set();
  for (const invoice of live) {
    const ids = invoiceStudentIds(invoice);
    const forMonth = invoiceMonth(invoice);
    // „Pärast toimunud tunde”: the lessons of a month are on the next month's invoice
    if (forMonth === nextMonth) ids.forEach((id) => { if (cardBillingMode(planByStudent.get(id)) === 'actual') coveredNext.add(id); });
    if (forMonth !== month) continue;
    const owner = ids[0] || '';
    const student = studentById.get(owner) || null;
    const row = rowOf(owner || `payer:${clean(invoice.payerName || invoice.studentName || invoice.id)}`, student?.name || invoice.studentName || invoice.payerName, student);
    const state = financeRowState(invoice, today);
    row.invoices.push({ invoice, label: invoiceLabel(invoice), ...state });
    row.invoicedCents += state.amountCents;
    row.paidCents += state.paidCents;
    row.balanceCents += state.balanceCents;
    row.overdue = row.overdue || state.overdue;
    // a family invoice covers the lessons of every card on it
    ids.forEach((id) => { const student2 = studentById.get(id); if (id === owner) row.coveredByInvoice = true; else if (student2) rowOf(id, student2.name, student2).coveredByInvoice = true; });
  }

  for (const lesson of lessons) {
    if (String(lesson.date || '').slice(0, 7) !== month) continue;
    const student = studentById.get(lesson.studentId);
    if (!student) continue;
    const plan = planByStudent.get(student.id) || {};
    if (lessonCashPaid(lesson)) {
      const row = rowOf(student.id, student.name, student);
      row.cashLessonCount += 1;
      row.cashLessonCents += Number(lesson.cashPaid.amountCents) || 0;
      continue;
    }
    if (!isChargeable(lesson, plan) || lessonOnInvoice(lesson) || lessonFromPackage(lesson) || cardBillingMode(plan) === 'package') continue;
    const row = rowOf(student.id, student.name, student);
    row.lessonCount += 1;
    row.lessonCents += lessonPriceCents(lesson, plan, student);
  }

  for (const entry of cashEntries) {
    if (entry.type !== 'receipt' || entry.source !== 'teacher' || entry.status === 'void' || entry.purpose === 'other') continue;
    if (String(entry.receivedAt || '').slice(0, 7) !== month || !studentById.has(entry.studentId)) continue;
    const student = studentById.get(entry.studentId);
    rowOf(student.id, student.name, student).receiptCents += Number(entry.amountCents) || 0;
  }

  const open = [];
  const matched = [];
  for (const row of rows.values()) {
    const plan = planByStudent.get(row.studentId);
    const covered = row.coveredByInvoice || coveredNext.has(row.studentId);
    const looseCount = covered ? 0 : row.lessonCount;
    const looseCents = covered ? 0 : Math.max(0, row.lessonCents - row.receiptCents);
    const base = { key: row.key, studentId: row.studentId, name: row.name, cash: paysCash(plan), invoices: row.invoices.filter((item) => item.balanceCents > 0).sort((a, b) => String(a.invoice.date || '').localeCompare(String(b.invoice.date || ''))), lessonCount: looseCount };
    if (row.balanceCents > 0) {
      const numbers = base.invoices.map((item) => item.label).filter(Boolean).join(', ');
      const reason = row.paidCents > 0 ? 'Arve osaliselt tasutud' : row.overdue ? 'Arve üle tähtaja' : 'Arve tasumata';
      open.push({ ...base, kind: 'invoice', reason, detail: numbers, amountCents: row.balanceCents });
    } else if (looseCount > 0 && (looseCents > 0 || row.lessonCents === 0)) {
      const noPrice = row.lessonCents === 0;
      if (base.cash) open.push({ ...base, kind: 'cash', reason: `Maksab sularahas · ${lessonWord(looseCount)} kinnitamata`, detail: noPrice ? 'kaardil puudub hind' : '', amountCents: looseCents });
      else open.push({ ...base, kind: 'lessons', reason: `${lessonWord(looseCount)} ilma arveta`, detail: noPrice ? 'kaardil puudub hind' : '', amountCents: looseCents });
    } else if (row.invoices.length || row.lessonCount || row.cashLessonCount || row.receiptCents) {
      const how = row.invoices.length ? 'arve makstud' : (row.cashLessonCount || row.receiptCents) ? 'sularaha' : 'arvel';
      matched.push({ key: row.key, studentId: row.studentId, name: row.name, how, amountCents: row.paidCents + row.cashLessonCents + row.receiptCents });
    }
  }

  open.sort((a, b) => b.amountCents - a.amountCents || a.name.localeCompare(b.name, 'et'));
  matched.sort((a, b) => a.name.localeCompare(b.name, 'et'));
  const total = open.length + matched.length;
  return {
    month,
    open,
    matched,
    total,
    openCents: open.reduce((sum, row) => sum + row.amountCents, 0),
    percent: total ? Math.round((matched.length / total) * 100) : 0,
  };
}

const MONTHS = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
export const monthLabel = (month) => { const [year, index] = String(month).split('-').map(Number); return `${MONTHS[index - 1] || ''} ${year || ''}`.trim(); };
