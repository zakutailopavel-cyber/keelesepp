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
  // no total before the subject is chosen: each subject may have its own price
  const { priceCents, minutes } = subject ? tokenPlanPrice(plan, subject) : { priceCents: 0, minutes: 60 };
  const count = Math.max(0, Math.floor(Number(row.lessons) || 0));
  return { card, ownSubjects, subjects, subject, priceCents, minutes, count, amountCents: priceCents * count };
}

// the price of one lesson exactly as the server takes it (functions/combined-invoice-core.js planForSubject →
// functions/lesson-tokens-core.js tokenInvoiceLines): the subject's own entry in subjectPrices replaces the card's
// price (its minutes fall back to the card's), the price is rounded to whole cents, no minutes = 60
export function tokenPlanPrice(plan, subject = '') {
  const own = subject && plan?.subjectPrices && typeof plan.subjectPrices === 'object' ? plan.subjectPrices[subject] : null;
  const source = own ? { lessonPriceCents: own.lessonPriceCents, lessonMinutes: own.lessonMinutes || plan?.lessonMinutes } : plan || {};
  return {
    priceCents: Math.max(0, Math.round(Number(source.lessonPriceCents) || 0)),
    minutes: Number(source.lessonMinutes) || 60,
  };
}

export const tokenMoney = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format((Number(cents) || 0) / 100);
export const TOKEN_PRICE_MISSING = 'Hind määramata — lisa see õpilase kaardil (Finantsid → Arveldus)';

// „Tunnihind” for control (Oleksiy 2026-11-06): the server's price is per lesson; the price per hour is derived from it
// (price × 60 / minutes, rounded to cents) and is shown only — the invoice is always lessons × the lesson price
export function tokenRowPriceView(state = {}) {
  if (!state.subject) return { status: 'no-subject' };
  if (!state.priceCents) return { status: 'missing', warning: TOKEN_PRICE_MISSING };
  const hourlyCents = Math.round((state.priceCents * 60) / state.minutes);
  return {
    status: 'ok',
    hourlyCents,
    hourly: `Tunnihind: ${tokenMoney(hourlyCents)} / h`,
    lesson: state.minutes === 60 ? '' : `Tund ${state.minutes} min = ${tokenMoney(state.priceCents)}`,
    amount: state.count ? `${state.count} tundi × ${tokenMoney(state.priceCents)} = ${tokenMoney(state.amountCents)}` : '',
  };
}

// why these lines cannot be one invoice ('' = they can): every line complete, one payer, a card and subject once
export function tokenRowsError(states = []) {
  for (const [index, state] of states.entries()) {
    const label = states.length > 1 ? `Rida ${index + 1}: ` : '';
    if (!state.card) return `${label}Vali õpilane.`;
    if (!state.subject) return `${label}Vali aine: pakett kuulub ühele ainele ja ainult selle aine tunnid võtavad sellest.`;
    if (!state.priceCents) return `${label}${TOKEN_PRICE_MISSING}.`;
    if (state.count < 1 || state.count > 100) return `${label}Tundide arv peab olema 1–100.`;
  }
  if (new Set(states.map((state) => payerKey(state.card))).size > 1) return MIXED_PAYER_MESSAGE;
  const keys = states.map((state) => `${state.card.id}|${state.subject}`);
  if (new Set(keys).size !== keys.length) return 'Iga õpilane ja aine võib ühisel tunnipaketil olla üks kord.';
  return '';
}

// Oleksiy 2026-11-06 („Убрать автоматическую отправку счета по туннипакету!!”): the „Tunnipakett” dialog only creates
// the invoice; it is e-mailed by hand from its row in the invoice list („Saada”) after the administrator has checked it
export const TOKEN_INVOICE_NOT_SENT = 'Arve on loodud, aga EI OLE saadetud. Saada see arvete nimekirjast, kui oled kontrollinud.';
export const TOKEN_INVOICE_NOT_SENT_HINT = 'Arvet ei saadeta automaatselt: pärast loomist kontrolli see üle ja saada arvete nimekirjast („Saada”).';
export const tokenInvoiceCreatedMessage = (invoice = {}) => `Tunnipaketi arve${invoice.num ? ` ${invoice.num}` : ''}: ${TOKEN_INVOICE_NOT_SENT} Tunnid lisatakse pärast makset.`;

