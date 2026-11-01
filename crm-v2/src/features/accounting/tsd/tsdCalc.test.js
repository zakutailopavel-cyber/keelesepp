import { describe, expect, it } from 'vitest';
import { bookedSalary, calculatePayee, defaultTsdMonth, dueDate, isValidIdCode, payeeWarnings, salaryEntry, shiftMonth, tsdReport } from './tsdCalc.js';
import { TSD_RATES, ratesForYear } from './tsdRates.js';

const rates = TSD_RATES[2026];
const one = (payee, grossCents, code = '10', extra = {}) => calculatePayee(payee, [{ id: 'a', code, grossCents, ...extra }], rates)[0];

// the worked examples of emta.ee „Lisa 1 osa 1a täitmise näited” (2026), every number as printed there
describe('TSD calculation against the official examples', () => {
  it('Näide 1: palk 2100, pension 2%, avaldus 700', () => {
    expect(one({ pensionRate: 2, exemptionApplied: true, exemptionCents: 70000 }, 210000)).toMatchObject({ socialCents: 69300, pensionCents: 4200, unemploymentEmployeeCents: 3360, unemploymentEmployerCents: 1680, exemptionCents: 70000, exemptionKind: '610', incomeTaxCents: 29137, netCents: 173303, minimumIncreaseCents: 0 });
  });
  it('Näide 2: palk 1200, avaldus 700', () => {
    expect(one({ pensionRate: 2, exemptionApplied: true, exemptionCents: 70000 }, 120000)).toMatchObject({ socialCents: 39600, pensionCents: 2400, unemploymentEmployeeCents: 1920, unemploymentEmployerCents: 960, incomeTaxCents: 10050 });
  });
  it('Näide 3: palk 600 alla kuumäära, maksuvaba tulu ainult 578,40', () => {
    expect(one({ pensionRate: 2, exemptionApplied: true, exemptionCents: 70000 }, 60000)).toMatchObject({ minimumIncreaseCents: 28600, socialCents: 29238, pensionCents: 1200, unemploymentEmployeeCents: 960, unemploymentEmployerCents: 480, exemptionCents: 57840, incomeTaxCents: 0, netCents: 57840 });
  });
  it('Lisa 1 täitmise põhimõtted: väljamakset ei ole, tööandja deklareerib kuumäära (1030 = 0, 1090 = 886)', () => {
    expect(one({ pensionRate: 0, exemptionApplied: false }, 0)).toMatchObject({ grossCents: 0, minimumIncreaseCents: 88600, socialCents: 29238, netCents: 0 });
  });
  it('Näide 14: töötasu 1500 ja juhatuse liikme tasu 700 samal inimesel', () => {
    const [work, board] = calculatePayee({ pensionRate: 0, exemptionApplied: false }, [{ id: 'a', code: '10', grossCents: 150000 }, { id: 'b', code: '21', grossCents: 70000 }], rates);
    expect(work).toMatchObject({ socialCents: 49500, unemploymentEmployeeCents: 2400, unemploymentEmployerCents: 1200, incomeTaxCents: 32472 });
    expect(board).toMatchObject({ socialCents: 23100, unemploymentEmployeeCents: 0, unemploymentEmployerCents: 0, incomeTaxCents: 15400 });
    expect(work.netCents + board.netCents).toBe(169728);
  });
  it('Näide 15: VÕS 600, pension 4%, kuumäär ei rakendu, avaldus 600', () => {
    expect(one({ pensionRate: 4, exemptionApplied: true, exemptionCents: 60000 }, 60000, '17')).toMatchObject({ minimumIncreaseCents: 0, socialCents: 19800, pensionCents: 2400, unemploymentEmployeeCents: 960, unemploymentEmployerCents: 480, exemptionCents: 56640, incomeTaxCents: 0, netCents: 56640 });
  });
  it('Vanaduspension, näide 3: 2300, avaldus 176, töötaja töötuskindlustust ei ole', () => {
    expect(one({ pensionRate: 0, exemptionApplied: true, exemptionCents: 17600, pensionAge: true, minimumExempt: true }, 230000)).toMatchObject({ socialCents: 75900, unemploymentEmployeeCents: 0, unemploymentEmployerCents: 1840, exemptionKind: '650', incomeTaxCents: 46728 });
  });
});

describe('TSD rules around the examples', () => {
  it('the exemption is one per person across payment types and never above the limit', () => {
    const [first, second] = calculatePayee({ pensionRate: 0, exemptionApplied: true, exemptionCents: 99900 }, [{ id: 'a', code: '17', grossCents: 40000 }, { id: 'b', code: '21', grossCents: 50000 }], rates);
    expect(first.exemptionCents).toBe(39360); // 400 − 6,40
    expect(second.exemptionCents).toBe(70000 - 39360);
  });
  it('the monthly base is raised once and can be set by hand (a part month, SMS § 2 lg 3) or switched off (lg 4)', () => {
    const [first, second] = calculatePayee({ pensionRate: 0, exemptionApplied: false }, [{ id: 'a', code: '10', grossCents: 30000 }, { id: 'b', code: '33', grossCents: 20000 }], rates);
    expect([first.minimumIncreaseCents, second.minimumIncreaseCents]).toEqual([38600, 0]);
    expect(one({ pensionRate: 0 }, 30000, '10', { minimumIncreaseCents: 10000 }).minimumIncreaseCents).toBe(10000);
    expect(one({ pensionRate: 0, minimumExempt: true }, 30000).minimumIncreaseCents).toBe(0);
  });
  it('reproduces the booked March 2026: two people on 592 € with no monthly base', () => {
    const payees = ['a', 'b'].map((id) => ({ id, name: id, code: '17', idCode: '', pensionRate: 2, exemptionApplied: true, exemptionCents: 70000 }));
    const month = { lines: payees.map((payee) => ({ id: payee.id, payeeId: payee.id, code: '17', grossCents: 59200 })) };
    const report = tsdReport({ payees, month, rates });
    expect(report.totals).toMatchObject({ grossCents: 118400, socialCents: 39072, unemploymentEmployerCents: 948, netCents: 114138, pensionCents: 2368 });
    expect(report.form[116]).toBe(2842);
    expect(report.form).toMatchObject({ 110: 0, 115: 39072, 117: 2368, 118: 44282 }); // „TSD 04/2026”: 442,82 paid
  });
  it('checks an ID code by its check digit', () => {
    ['48203109990', '36609159996', '47809099994'].forEach((code) => expect(isValidIdCode(code)).toBe(true)); // emta.ee examples
    ['48203109991', '123', '', '98203109990'].forEach((code) => expect(isValidIdCode(code)).toBe(false));
  });
  it('dates: the 10th moved off a weekend, the default month, the year without rates', () => {
    expect(dueDate('2026-09')).toBe('2026-10-12');
    expect(dueDate('2026-10')).toBe('2026-11-10');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(defaultTsdMonth(new Date(2026, 9, 30))).toBe('2026-10');
    expect(defaultTsdMonth(new Date(2026, 10, 5))).toBe('2026-10');
    expect(ratesForYear(2027)).toBeNull();
    expect(ratesForYear(2027, rates)).toBe(rates);
  });
  it('says what is missing and keeps an unfinished row out of the totals', () => {
    const payee = { id: 'x', name: 'Mari', code: '', idCode: '123' };
    const report = tsdReport({ payees: [payee, { id: 'y', name: 'Jaan', code: '10', exemptionApplied: false, pensionRate: 0, idCode: '36609159996' }, { id: 'z', name: 'FIE', code: 'fie' }], rates });
    const warnings = report.people.find((person) => person.payee.id === 'x').warnings.join(' ');
    expect(warnings).toMatch(/isikukood ei ole korrektne/);
    expect(warnings).toMatch(/lepingu liik/);
    expect(warnings).toMatch(/kogumispensioni/);
    expect(warnings).toMatch(/maksuvaba tulu avaldus/);
    expect(report.totals.grossCents).toBe(0);
    expect(report.form[118]).toBe(0);
    expect(report.notOnLisa.map((person) => person.id)).toEqual(['z']);
    expect(payeeWarnings({ idCode: '36609159996', code: '10', exemptionApplied: true, exemptionCents: 90000, pensionRate: 2 }, [], rates).join()).toMatch(/piirmäära/);
    expect(payeeWarnings({ idCode: '36609159996', code: '10', exemptionApplied: false, pensionRate: 2 }, [{ code: '10', grossCents: 1 }, { code: '10', grossCents: 2 }], rates).join()).toMatch(/kaks korda/);
  });
  it('fills the gross from approved work time until the accountant saves her own', () => {
    const payee = { id: 'y', name: 'Jaan', code: '17', exemptionApplied: false, pensionRate: 0 };
    expect(tsdReport({ payees: [payee], payrollCents: { y: 50000 }, rates })).toMatchObject({ totals: { grossCents: 50000 } });
    expect(tsdReport({ payees: [payee], payrollCents: { y: 50000 }, month: { lines: [{ id: 'l', payeeId: 'y', code: '17', grossCents: 40000 }] }, rates }).totals.grossCents).toBe(40000);
  });
});

describe('salary entry', () => {
  const report = tsdReport({ payees: [{ id: 'a', name: 'A', code: '10', pensionRate: 2, exemptionApplied: false }], month: { lines: [{ id: 'l', payeeId: 'a', code: '10', grossCents: 200000 }] }, rates });
  it('balances, on the accountant\'s accounts and date', () => {
    const entry = salaryEntry(report, '2026-09', [{ code: '4730' }]);
    expect(entry.date).toBe('2026-09-30');
    expect(entry.documentRef).toBe('PL september 2026');
    const debit = entry.lines.reduce((sum, line) => sum + line.debitCents, 0);
    expect(debit).toBe(entry.lines.reduce((sum, line) => sum + line.creditCents, 0));
    expect(entry.lines.map((line) => line.account)).toEqual(['4710', '4720', '4730', '2210', '2320', '2330', '2340', '2350']);
  });
  it('books the employer unemployment on 4720 when the chart has no 4730', () => {
    expect(salaryEntry(report, '2026-09', []).lines.filter((line) => line.account === '4720')).toHaveLength(2);
  });
  it('finds what is already booked for the month, leaving a deleted entry out', () => {
    const booked = bookedSalary([{ date: '2026-09-30', lines: [{ account: '4710', debitCents: 100 }] }, { date: '2026-09-30', deleted: true, lines: [{ account: '4710', debitCents: 50 }] }, { date: '2026-08-31', lines: [{ account: '4710', debitCents: 7 }] }], '2026-09');
    expect(booked.cents).toBe(100);
    expect(booked.entries).toHaveLength(1);
  });
});
