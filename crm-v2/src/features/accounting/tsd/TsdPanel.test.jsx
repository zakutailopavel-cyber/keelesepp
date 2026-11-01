import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TsdPanel from './TsdPanel.jsx';
import { tsdWorkbook } from '../accountingExcel.js';
import { COMPANY } from '../accountingReports.js';
import { TSD_RATES } from './tsdRates.js';
import { tsdReport } from './tsdCalc.js';

const malle = { id: 'p1', name: 'Malle Töötaja', idCode: '48203109990', code: '10', exemptionApplied: true, exemptionCents: 70000, pensionAge: false, pensionRate: 2, minimumExempt: false, active: true };
const accounts = ['4710', '4720', '4730', '2210', '2320', '2330', '2340', '2350'].map((code) => ({ code, name: code }));

function setup({ payees = [malle], month = { sourceMonth: '2026-09', lines: [{ id: 'l1', payeeId: 'p1', code: '10', grossCents: 210000, minimumIncreaseCents: null }] }, rates = null, sessions = [], entries = [], canEdit = true, staff = [] } = {}) {
  const repository = {
    load: vi.fn().mockResolvedValue({ payees, month, rates }),
    savePayee: vi.fn().mockImplementation(async (id, values) => ({ id: id || 'new', ...values })),
    saveMonth: vi.fn().mockImplementation(async (_, values) => values),
    saveRates: vi.fn().mockResolvedValue({}),
  };
  const createEntry = vi.fn().mockResolvedValue({ entry: { number: '2026-0600' } });
  render(<TsdPanel accounts={accounts} entries={entries} canEdit={canEdit} createEntry={createEntry} repository={repository} staffRepository={{ list: vi.fn().mockResolvedValue(staff) }} timeRepository={{ listAll: vi.fn().mockResolvedValue({ sessions, programDays: [] }) }} />);
  return { repository, createEntry };
}
const pick = (id, value) => fireEvent.change(document.getElementById(id), { target: { value } });

describe('TsdPanel', () => {
  it('shows the month as on Lisa 1 with the form totals (emta.ee Näide 1)', async () => {
    setup();
    const row = (await screen.findAllByText('Malle Töötaja'))[0].closest('tr');
    ['48203109990', '700,00', '693,00', '42,00', '33,60', '16,80', '291,37', '1 733,03'].forEach((text) => expect(within(row).getAllByText((_, el) => el?.textContent?.replace(/\s/g, ' ').trim().endsWith(text)).length).toBeGreaterThan(0));
    const form = screen.getByText(/Vorm TSD,/).closest('.tsd-form');
    expect(within(form).getByText('118').closest('tr').textContent.replace(/\s/g, '')).toContain('1076,77'); // 693 + 50,40 + 42 + 291,37
  });

  it('warns about what is missing and saves a person\'s data without touching the month', async () => {
    const { repository } = setup({ payees: [{ id: 'p2', name: 'Uus Õpetaja', idCode: '', code: '', exemptionApplied: null, exemptionCents: 0, pensionAge: false, pensionRate: null, minimumExempt: false, active: true }], month: null });
    const warning = await screen.findByText(/isikukood puudub/);
    ['lepingu liik', 'maksuvaba tulu avaldus', 'kogumispensioni', 'bruto puudub'].forEach((text) => expect(warning.textContent).toContain(text));
    fireEvent.click(screen.getByRole('button', { name: 'Muuda: Uus Õpetaja' }));
    pick('tsd-id', '36609159996');
    pick('tsd-code', '17');
    pick('tsd-exemption', 'yes');
    pick('tsd-pension', '4');
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.savePayee).toHaveBeenCalled());
    const [id, values] = repository.savePayee.mock.calls[0];
    expect(id).toBe('p2');
    expect(values).toMatchObject({ idCode: '36609159996', code: '17', exemptionApplied: true, exemptionCents: 70000, pensionRate: 4 });
    expect(repository.saveMonth).not.toHaveBeenCalled();
  });

  it('saves a typed gross and recalculates', async () => {
    const { repository } = setup();
    const input = await screen.findByLabelText('Bruto: Malle Töötaja');
    fireEvent.change(input, { target: { value: '600' } });
    fireEvent.blur(input);
    await waitFor(() => expect(repository.saveMonth).toHaveBeenCalled());
    expect(repository.saveMonth.mock.calls[0][1].lines[0]).toMatchObject({ payeeId: 'p1', grossCents: 60000 });
    expect((await screen.findByLabelText('Kuumäära suurendus: Malle Töötaja')).placeholder).toBe('286,00'); // Näide 3
  });

  it('lets the monthly base be set by hand for a part month and keeps other saved lines', async () => {
    const { repository } = setup({ month: { sourceMonth: '2026-09', lines: [{ id: 'l1', payeeId: 'p1', code: '10', grossCents: 30000, minimumIncreaseCents: null }, { id: 'l2', payeeId: 'p1', code: '21', grossCents: 100, minimumIncreaseCents: null }] } });
    const input = await screen.findByLabelText('Kuumäära suurendus: Malle Töötaja');
    fireEvent.change(input, { target: { value: '100' } });
    fireEvent.blur(input);
    await waitFor(() => expect(repository.saveMonth).toHaveBeenCalled());
    expect(repository.saveMonth.mock.calls[0][1].lines).toEqual([{ id: 'l1', payeeId: 'p1', code: '10', grossCents: 30000, minimumIncreaseCents: 10000 }, { id: 'l2', payeeId: 'p1', code: '21', grossCents: 100, minimumIncreaseCents: null }]);
  });

  it('keeps a work-time line unsaved until she changes it', async () => {
    const { repository } = setup({ payees: [{ ...malle, id: 't1' }], month: null, sessions: [{ staffUid: 't1', approvalStatus: 'approved', payAmountCents: 50000 }] });
    const input = await screen.findByLabelText('Bruto: Malle Töötaja');
    expect(repository.saveMonth).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: '510' } });
    fireEvent.blur(input);
    await waitFor(() => expect(repository.saveMonth).toHaveBeenCalled());
    expect(repository.saveMonth.mock.calls[0][1].lines).toEqual([expect.objectContaining({ payeeId: 't1', code: '10', grossCents: 51000 })]);
  });

  it('takes the gross from approved work time and shows that, for a teacher with no TSD card yet', async () => {
    setup({ payees: [], month: null, sessions: [{ staffUid: 't1', approvalStatus: 'approved', payAmountCents: 50000 }, { staffUid: 't1', approvalStatus: 'pending', payAmountCents: 900 }], staff: [{ id: 't1', name: 'Õpetaja Üks' }] });
    expect(await screen.findByText('Õpetaja Üks')).toBeTruthy();
    expect(screen.getByLabelText('Bruto: Õpetaja Üks').value).toBe('500,00');
    expect(screen.getByText('tööajast')).toBeTruthy();
  });

  it('says so when the CRM has no approved work time', async () => {
    setup();
    expect(await screen.findByText(/ei ole kuu september 2026 kinnitatud tööaega/)).toBeTruthy();
  });

  it('refuses to calculate a year without rates and asks for them', async () => {
    vi.useFakeTimers({ now: new Date(2027, 1, 20), toFake: ['Date'] });
    const { repository } = setup({ month: null });
    expect(await screen.findByText(/2027\. aasta määrad on sisestamata/)).toBeTruthy();
    expect(screen.queryByText(/Vorm TSD,/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Sisesta 2027. aasta määrad' }));
    [['incomeTaxBps', '22'], ['socialTaxBps', '33'], ['socialMinBaseCents', '946'], ['unemploymentEmployeeBps', '1,6'], ['unemploymentEmployerBps', '0,8'], ['exemptionGeneralCents', '700'], ['exemptionPensionAgeCents', '776']].forEach(([key, value]) => pick(`tsd-rate-${key}`, value));
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.saveRates).toHaveBeenCalled());
    expect(repository.saveRates.mock.calls[0]).toEqual([2027, { incomeTaxBps: 2200, socialTaxBps: 3300, socialMinBaseCents: 94600, unemploymentEmployeeBps: 160, unemploymentEmployerBps: 80, exemptionGeneralCents: 70000, exemptionPensionAgeCents: 77600 }]);
    vi.useRealTimers();
  });

  it('creates the salary entry only as a separate confirmed step, warning about a duplicate', async () => {
    const { createEntry } = setup({ entries: [{ id: 'e', number: '2026-0521', date: '2026-09-30', lines: [{ account: '4710', debitCents: 210000 }] }] });
    fireEvent.click(await screen.findByRole('button', { name: /Vaata ja loo palgakanne/ }));
    expect(createEntry).not.toHaveBeenCalled();
    expect(await screen.findByText(/palgakanne on juba olemas/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Loo kanne' }));
    await waitFor(() => expect(createEntry).toHaveBeenCalled());
    const entry = createEntry.mock.calls[0][0];
    expect(entry).toMatchObject({ date: '2026-09-30', documentRef: 'PL september 2026' });
    expect(entry.lines.reduce((sum, line) => sum + line.debitCents - line.creditCents, 0)).toBe(0);
  });

  it('read-only for someone who may not edit', async () => {
    setup({ canEdit: false });
    expect((await screen.findByLabelText('Bruto: Malle Töötaja')).disabled).toBe(true);
    expect(screen.queryByRole('button', { name: /Lisa väljamakse saaja/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /palgakanne/ })).toBeNull();
  });

  it('exports the form and Lisa 1 with the form codes', () => {
    const report = tsdReport({ payees: [malle], month: { lines: [{ id: 'l', payeeId: 'p1', code: '10', grossCents: 210000 }] }, rates: TSD_RATES[2026] });
    const xml = tsdWorkbook(report, { company: COMPANY, month: '2026-10', monthLabel: 'oktoober 2026', sourceLabel: 'september 2026', due: '2026-11-10', rateRows: [['Tulumaks', '22 %']] });
    ['Worksheet ss:Name="TSD"', 'Worksheet ss:Name="Lisa 1"', '1170', '48203109990', '291.37', '1076.77', 'raamatupidaja kontrollib', '10.11.2026'].forEach((text) => expect(xml).toContain(text));
  });
});
