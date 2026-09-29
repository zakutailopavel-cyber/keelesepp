'use strict';

// Finance v2 §2: one invoice per student per month for the lessons planned in the calendar (billing mode
// "current": due by the 10th of that month; "advance": issued the month before). The client counts the planned
// lessons and last month's difference; the server takes the price from the private plan, never from the request.

const cleanText = (value, max = 300) => String(value || '').trim().slice(0, max);

function units(value, field, { min, max }) {
  const number = Math.round(Number(value) * 100) / 100;
  if (!Number.isFinite(number) || number < min || number > max) throw new Error(`Valid ${field} required`);
  return number;
}

function monthlyInvoiceInput(values = {}) {
  const studentId = cleanText(values.studentId, 160);
  if (!studentId) throw new Error('studentId required');
  const month = cleanText(values.month, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Valid month required');
  const due = cleanText(values.due, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(due) || Number.isNaN(new Date(`${due}T12:00:00Z`).getTime())) throw new Error('Valid due date required');
  return {
    studentId,
    month,
    due,
    plannedUnits: units(values.plannedUnits, 'plannedUnits', { min: 0, max: 62 }),
    correctionUnits: units(values.correctionUnits || 0, 'correctionUnits', { min: -62, max: 62 }),
    correctionNote: cleanText(values.correctionNote, 300),
  };
}

const MONTHS = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
const monthLabel = (month) => `${MONTHS[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;
const euros = (cents) => (cents / 100).toFixed(2).replace('.', ',');

function monthlyInvoiceLines(input, plan = {}) {
  const priceCents = Math.max(0, Math.round(Number(plan.lessonPriceCents) || 0));
  if (!priceCents) throw new Error('Lesson price missing');
  const minutes = Number(plan.lessonMinutes) || 60;
  const lines = [];
  if (input.plannedUnits > 0) {
    lines.push({
      type: 'monthly_planned_lessons',
      description: `Keeletunnid, ${monthLabel(input.month)}: ${String(input.plannedUnits).replace('.', ',')} × ${minutes} min × ${euros(priceCents)} €`,
      quantity: input.plannedUnits,
      unitPriceCents: priceCents,
      amountCents: Math.round(input.plannedUnits * priceCents),
    });
  }
  if (input.correctionUnits) {
    lines.push({
      type: 'monthly_correction',
      description: `Eelmise kuu tasaarveldus: ${input.correctionUnits > 0 ? '+' : ''}${String(input.correctionUnits).replace('.', ',')} tundi${input.correctionNote ? ` (${input.correctionNote})` : ''}`,
      quantity: input.correctionUnits,
      unitPriceCents: priceCents,
      amountCents: Math.round(input.correctionUnits * priceCents),
    });
  }
  const amountCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  if (amountCents <= 0) throw new Error('Invoice total must be positive');
  return {
    lines: lines.map((line) => ({ ...line, amount: line.amountCents / 100 })),
    amountCents,
    priceCents,
    minutes,
    description: `Keeletunnid, ${monthLabel(input.month)}`,
  };
}

// the same month can be invoiced once per student
const monthlyInvoiceId = (studentId, month) => `monthly_${studentId}_${month}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 120);

module.exports = { monthlyInvoiceInput, monthlyInvoiceLines, monthlyInvoiceId, monthLabel };
