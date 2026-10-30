// TSD (Maksu- ja Tolliamet, form TSD + Lisa 1 part Ia): pure calculation in integer cents. The order is the one in
// emta.ee „Lisa 1 osa 1a täitmise näited”: pension and employee unemployment come off the gross, then the basic
// exemption (never more than what is left), income tax from the rest. Social tax on the gross, raised to the monthly
// base (code 1090) only for the types where it applies. docs/ACCOUNTING.md „TSD”.
import { NOT_ON_LISA_1, PAYMENT_TYPES } from './tsdRates.js';

const share = (cents, bps) => Math.round((cents * bps) / 10000);
const pad = (n) => String(n).padStart(2, '0');

const MONTHS = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
export const monthName = (month) => `${MONTHS[Number(month.slice(5, 7)) - 1]} ${month.slice(0, 4)}`;
export function shiftMonth(month, by) {
  const date = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1 + by, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}
export const lastDayOfMonth = (month) => `${month}-${pad(new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate())}`;

// the 10th of the next month; when that is a weekend, the next working day (emta.ee: 10.10.2026, a Saturday → 12.10)
export function dueDate(month) {
  const next = shiftMonth(month, 1);
  const date = new Date(Date.UTC(Number(next.slice(0, 4)), Number(next.slice(5, 7)) - 1, 10));
  while ([0, 6].includes(date.getUTCDay())) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

// the month being declared: until the 10th the accountant is still on last month's TSD
export function defaultTsdMonth(now = new Date()) {
  const month = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  return now.getDate() <= 10 ? shiftMonth(month, -1) : month;
}

// Estonian personal ID code (11 digits, the check digit by the two-step weights)
export function isValidIdCode(value) {
  const code = String(value || '').trim();
  if (!/^[1-8]\d{10}$/.test(code)) return false;
  const digits = [...code].map(Number);
  const sum = (weights) => weights.reduce((total, weight, index) => total + weight * digits[index], 0) % 11;
  let check = sum([1, 2, 3, 4, 5, 6, 7, 8, 9, 1]);
  if (check === 10) check = sum([3, 4, 5, 6, 7, 8, 9, 1, 2, 3]) % 10;
  return check === digits[10];
}

// one person's lines of one month. A person has one exemption and one monthly base, however many payment types.
export function calculatePayee(payee, lines, rates) {
  const pensionPercent = Number(payee.pensionRate) || 0;
  const pensionAge = Boolean(payee.pensionAge);
  const exemptionLimit = pensionAge ? rates.exemptionPensionAgeCents : rates.exemptionGeneralCents;
  let exemptionLeft = payee.exemptionApplied === true ? Math.min(Number(payee.exemptionCents ?? exemptionLimit), exemptionLimit) : 0;
  const entered = lines.filter((line) => PAYMENT_TYPES[line.code] && Number.isInteger(line.grossCents));
  const minimumPaid = entered.filter((line) => PAYMENT_TYPES[line.code].minimum).reduce((sum, line) => sum + line.grossCents, 0);
  let minimumLeft = payee.minimumExempt ? 0 : Math.max(0, rates.socialMinBaseCents - minimumPaid);
  return lines.map((line) => {
    const type = PAYMENT_TYPES[line.code];
    const minimumOverride = Number.isInteger(line.minimumIncreaseCents) ? line.minimumIncreaseCents : null;
    if (!type || !Number.isInteger(line.grossCents)) return { ...line, minimumOverride, calculated: false };
    const gross = line.grossCents;
    let minimumIncrease = 0;
    if (type.minimum) {
      minimumIncrease = minimumOverride ?? minimumLeft;
      minimumLeft = 0;
    }
    const socialBase = type.social ? gross : 0;
    const pension = type.pension ? share(gross, pensionPercent * 100) : 0;
    const unemploymentBase = type.unemployment ? gross : 0;
    const unemploymentEmployee = type.unemployment && !pensionAge ? share(gross, rates.unemploymentEmployeeBps) : 0;
    const unemploymentEmployer = type.unemployment ? share(gross, rates.unemploymentEmployerBps) : 0;
    const afterDeductions = Math.max(0, gross - pension - unemploymentEmployee);
    const exemption = type.exemption ? Math.min(exemptionLeft, afterDeductions) : 0;
    exemptionLeft -= exemption;
    const incomeTax = share(afterDeductions - exemption, rates.incomeTaxBps);
    return {
      ...line,
      minimumOverride,
      calculated: true,
      exemptionKind: exemption ? (pensionAge ? '650' : '610') : '',
      exemptionCents: exemption,
      socialBaseCents: socialBase,
      minimumIncreaseCents: minimumIncrease,
      socialCents: share(socialBase + minimumIncrease, rates.socialTaxBps),
      pensionCents: pension,
      unemploymentBaseCents: unemploymentBase,
      unemploymentEmployeeCents: unemploymentEmployee,
      unemploymentEmployerCents: unemploymentEmployer,
      incomeTaxCents: incomeTax,
      netCents: gross - pension - unemploymentEmployee - incomeTax,
    };
  });
}

const TOTAL_KEYS = ['grossCents', 'exemptionCents', 'socialBaseCents', 'minimumIncreaseCents', 'socialCents', 'pensionCents', 'unemploymentBaseCents', 'unemploymentEmployeeCents', 'unemploymentEmployerCents', 'incomeTaxCents', 'netCents'];

export function payeeWarnings(payee, lines, rates) {
  const out = [];
  if (!payee.idCode) out.push('isikukood puudub');
  else if (!isValidIdCode(payee.idCode)) out.push('isikukood ei ole korrektne');
  if (!payee.code) out.push('lepingu liik (väljamakse liik) puudub: rida ei lähe arvutusse');
  if (typeof payee.exemptionApplied !== 'boolean') out.push('maksuvaba tulu avaldus märkimata: arvutatud ilma maksuvaba tuluta');
  else if (payee.exemptionApplied && Number(payee.exemptionCents ?? 0) > (payee.pensionAge ? rates.exemptionPensionAgeCents : rates.exemptionGeneralCents)) out.push('avalduse summa on üle kuu piirmäära: kasutatud piirmäära');
  if (payee.pensionRate === null || payee.pensionRate === undefined || payee.pensionRate === '') out.push('kogumispensioni määr märkimata: arvutatud 0%');
  if (lines.some((line) => !Number.isInteger(line.grossCents))) out.push('bruto puudub: rida ei lähe arvutusse');
  if (lines.some((line) => line.grossCents === 0 && line.code && !PAYMENT_TYPES[line.code]?.minimum)) out.push('summa 0 on lubatud ainult kuumääraga liigil (10, 33)');
  if (new Set(lines.map((line) => line.code)).size < lines.length) out.push('sama väljamakse liik on kaks korda: liida summad üheks reaks');
  if (payee.pensionAge && !payee.minimumExempt && lines.some((line) => (line.minimumIncreaseCents || 0) > 0)) out.push('vanaduspensionär: kui saab riiklikku pensioni, kuumäär ei rakendu (SMS § 2 lg 4 p 6)');
  return out;
}

// the saved lines of the month; a person without a saved line gets one from the approved work time of the source month
export function monthLines(payee, month, payrollCents = {}) {
  const saved = (month?.lines || []).filter((line) => line.payeeId === payee.id);
  if (saved.length) return saved.map((line) => ({ ...line, fromPayroll: false }));
  const fromTime = Number(payrollCents[payee.id] || 0);
  return [{ id: `${payee.id}-auto`, payeeId: payee.id, code: payee.code || '', grossCents: fromTime || null, minimumIncreaseCents: null, fromPayroll: Boolean(fromTime) }];
}

// the whole month: rows as on Lisa 1 and the totals of the form's main page (codes 110–119)
export function tsdReport({ payees = [], month = null, payrollCents = {}, rates }) {
  const onLisa = payees.filter((payee) => !NOT_ON_LISA_1[payee.code] && payee.active !== false);
  const notOnLisa = payees.filter((payee) => NOT_ON_LISA_1[payee.code] && payee.active !== false);
  const people = onLisa
    .map((payee) => {
      const lines = calculatePayee(payee, monthLines(payee, month, payrollCents), rates);
      return { payee, lines, warnings: payeeWarnings(payee, lines, rates) };
    })
    .sort((a, b) => String(a.payee.name).localeCompare(String(b.payee.name), 'et'));
  const totals = Object.fromEntries(TOTAL_KEYS.map((key) => [key, 0]));
  people.forEach((person) => person.lines.filter((line) => line.calculated).forEach((line) => TOTAL_KEYS.forEach((key) => { totals[key] += line[key] || 0; })));
  const form = {
    110: totals.incomeTaxCents,
    115: totals.socialCents,
    116: totals.unemploymentEmployeeCents + totals.unemploymentEmployerCents,
    117: totals.pensionCents,
  };
  form[118] = form[110] + form[115] + form[116] + form[117];
  return {
    people,
    notOnLisa,
    totals,
    form,
    incomplete: people.filter((person) => person.warnings.length).length,
  };
}

// „Palga ja maksude arvestus”: the accountant's own monthly entry (the books, 03–09/2026): dated the last day of the
// month worked, net to 2210, TK + TTK together on 2340, TTK cost on 4730 when the chart has it
export function salaryEntry({ totals }, sourceMonth, accounts = []) {
  const active = (code) => accounts.some((account) => account.code === code && account.active !== false);
  const employerUnemployment = active('4730') ? '4730' : '4720';
  const name = monthName(sourceMonth);
  const lines = [
    { account: '4710', debitCents: totals.grossCents, note: `Palgakulu, ${name}` },
    { account: '4720', debitCents: totals.socialCents, note: 'Sotsiaalmaks' },
    { account: employerUnemployment, debitCents: totals.unemploymentEmployerCents, note: 'Tööandja töötuskindlustus' },
    { account: '2210', creditCents: totals.netCents, note: 'Väljamaksmisele kuuluv palk' },
    { account: '2320', creditCents: totals.socialCents, note: 'Sotsiaalmaks' },
    { account: '2330', creditCents: totals.incomeTaxCents, note: 'Kinnipeetud tulumaks' },
    { account: '2340', creditCents: totals.unemploymentEmployeeCents + totals.unemploymentEmployerCents, note: 'Töötuskindlustus' },
    { account: '2350', creditCents: totals.pensionCents, note: 'Kogumispension' },
  ].map((line) => ({ debitCents: 0, creditCents: 0, ...line })).filter((line) => line.debitCents || line.creditCents);
  return { date: lastDayOfMonth(sourceMonth), description: `Palga ja maksude arvestus, ${name}`, documentRef: `PL ${name}`, lines };
}

// what the books already say about the salary cost of the month worked (4710, debit minus credit)
export function bookedSalary(entries = [], sourceMonth) {
  const inMonth = entries.filter((entry) => !entry.deleted && String(entry.date || '').slice(0, 7) === sourceMonth);
  const cents = inMonth.reduce((sum, entry) => sum + (entry.lines || []).filter((line) => line.account === '4710').reduce((inner, line) => inner + (line.debitCents || 0) - (line.creditCents || 0), 0), 0);
  return { cents, entries: inMonth.filter((entry) => (entry.lines || []).some((line) => line.account === '4710')) };
}
