import { subjectsOf } from '../students/subjects.js';
import { payerKey } from './monthlyBilling.js';

// The lines of the „Tunnipakett” dialog (TokenInvoiceDialog.jsx). „Ühine tunnipakett” (owner 2026-11-04): several lines
// of one payer become ONE invoice (manualInvoiceApi /create-tokens-combined); the server checks the same rules
// (functions/lesson-tokens-core.js combinedTokenInput, functions/combined-invoice-core.js combinedTokenRecord).

// „Ühine tunnipakett”: at most 12 lines on one invoice (the same limit as the combined monthly / manual invoice)
export const TOKEN_ROWS_MAX = 12;
export const MIXED_PAYER_MESSAGE = 'Kaartidel on erinev maksja: ühine tunnipakett on ühe maksja (sama lapsevanema) lastele. Tee teisele maksjale eraldi arve.';

// one line of the dialog: its card, the subjects it may take, the chosen subject and that subject's price
// (studentRevenuePlans.subjectPrices[subject], else the card's price — the server prices it the same way)
export function tokenRowState(row, { cards = [], plans = [], schoolSubjects = [] } = {}) {
  const card = cards.find((item) => item.id === row.studentId) || null;
  const plan = plans.find((item) => (item.studentId || item.id) === row.studentId) || null;
  const ownSubjects = card ? subjectsOf(card) : [];
  // the card's subjects; a card that names none (every track ended) is offered the school's subjects
  const subjects = ownSubjects.length ? ownSubjects : schoolSubjects;
  const subject = subjects.includes(row.pickedSubject) ? row.pickedSubject : ownSubjects.length === 1 ? ownSubjects[0] : '';
  const subjectPrice = subject ? plan?.subjectPrices?.[subject] : null;
  // no total before the subject is chosen: each subject may have its own price
  const priceCents = subject ? Number(subjectPrice?.lessonPriceCents ?? plan?.lessonPriceCents) || 0 : 0;
  const minutes = subjectPrice?.lessonMinutes || plan?.lessonMinutes || 60;
  const count = Math.max(0, Math.floor(Number(row.lessons) || 0));
  return { card, ownSubjects, subjects, subject, priceCents, minutes, count, amountCents: priceCents * count };
}

// why these lines cannot be one invoice ('' = they can): every line complete, one payer, a card and subject once
export function tokenRowsError(states = []) {
  for (const [index, state] of states.entries()) {
    const label = states.length > 1 ? `Rida ${index + 1}: ` : '';
    if (!state.card) return `${label}Vali õpilane.`;
    if (!state.subject) return `${label}Vali aine: pakett kuulub ühele ainele ja ainult selle aine tunnid võtavad sellest.`;
    if (!state.priceCents) return `${label}Õpilasel puudub tunnihind: määra see õpilase kaardil (Finantsid → Arveldus).`;
    if (state.count < 1 || state.count > 100) return `${label}Tundide arv peab olema 1–100.`;
  }
  if (new Set(states.map((state) => payerKey(state.card))).size > 1) return MIXED_PAYER_MESSAGE;
  const keys = states.map((state) => `${state.card.id}|${state.subject}`);
  if (new Set(keys).size !== keys.length) return 'Iga õpilane ja aine võib ühisel tunnipaketil olla üks kord.';
  return '';
}

