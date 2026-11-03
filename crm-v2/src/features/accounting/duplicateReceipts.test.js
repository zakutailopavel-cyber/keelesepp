import { describe, expect, it } from 'vitest';
import { possibleDuplicateReceipts } from './duplicateReceipts.js';

const customer = { type: 'customer', id: 'stu-1', name: 'Anna Ivanova' };
// what syncAccountingEntries writes for a CRM bank payment (functions/accounting-core.js automaticEntries)
const crm = (over = {}) => ({
  id: 'auto_payment_p1', sourceKey: 'payment:p1', origin: 'auto', documentType: 'payment', number: '2026-0100', date: '2026-09-10',
  documentRef: 'KS-117', description: 'Laekumine arvele KS-117 (pangaülekanne) · Anna Ivanova',
  lines: [{ account: '1010', debitCents: 17000, creditCents: 0 }, { account: '1200', debitCents: 0, creditCents: 17000, partner: customer }],
  ...over,
});
const manual = (over = {}) => ({
  id: 'manual_m1', origin: 'manual', number: '2026-0200', date: '2026-09-11', documentRef: 'LHV 11.09', description: 'Laekumine pangast',
  lines: [{ account: '1010', debitCents: 17000, creditCents: 0 }, { account: '1200', debitCents: 0, creditCents: 17000 }],
  ...over,
});

describe('possibleDuplicateReceipts', () => {
  it('pairs a CRM receipt with a manual 1010 entry of the same amount and the same client', () => {
    const pairs = possibleDuplicateReceipts([crm(), manual({ lines: [{ account: '1010', debitCents: 17000, creditCents: 0 }, { account: '1200', debitCents: 0, creditCents: 17000, partner: customer }] })]);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toEqual(expect.objectContaining({ amountCents: 17000, days: 1, reason: 'sama klient' }));
    expect(pairs[0].crm.id).toBe('auto_payment_p1');
    expect(pairs[0].manual.id).toBe('manual_m1');
  });

  it('matches the reference as a whole token and the payer name in any order, ignoring diacritics and case', () => {
    expect(possibleDuplicateReceipts([crm(), manual({ description: 'Makse ks-117' })])[0].reason).toBe('sama viide');
    expect(possibleDuplicateReceipts([crm(), manual({ description: 'Makse KS-1170' })])).toEqual([]);
    expect(possibleDuplicateReceipts([crm(), manual({ lines: [{ account: '1010', debitCents: 17000, creditCents: 0, note: 'IVANOVA ANNA' }, { account: '2500', debitCents: 0, creditCents: 17000 }] })])[0].reason).toBe('sama maksja nimi');
    const accented = crm({ description: 'Laekumine arvele KS-9 (pangaülekanne) · Jüri Õun', documentRef: 'KS-9', lines: [{ account: '1010', debitCents: 17000, creditCents: 0 }, { account: '1200', debitCents: 0, creditCents: 17000, partner: { type: 'customer', id: 'x', name: 'Jüri Õun' } }] });
    expect(possibleDuplicateReceipts([accented, manual({ description: 'juri oun' })])).toHaveLength(1);
  });

  it('a bank advance booked by the sync („credit:”) counts as a CRM receipt too', () => {
    const credit = crm({ id: 'auto_credit_c1', sourceKey: 'credit:c1', documentType: 'bankTransaction', documentRef: 'LHV-555', description: 'Ettemaks pangast · Anna Ivanova' });
    expect(possibleDuplicateReceipts([credit, manual({ description: 'Anna Ivanova ettemaks' })])).toHaveLength(1);
  });

  it('no pair: other amount, more than 120 days, other client, cash, a credit to 1010, or a stornoed / deleted entry', () => {
    const named = { description: 'Anna Ivanova' };
    expect(possibleDuplicateReceipts([crm(), manual({ ...named, lines: [{ account: '1010', debitCents: 16900, creditCents: 0 }, { account: '1200', debitCents: 0, creditCents: 16900 }] })])).toEqual([]);
    expect(possibleDuplicateReceipts([crm(), manual({ ...named, date: '2027-01-09' })])).toEqual([]);
    expect(possibleDuplicateReceipts([crm(), manual({ ...named, date: '2027-01-08' })])).toHaveLength(1);
    expect(possibleDuplicateReceipts([crm(), manual({ description: 'Mari Maasikas' })])).toEqual([]);
    const cash = crm({ lines: [{ account: '1000', debitCents: 17000, creditCents: 0 }, { account: '1200', debitCents: 0, creditCents: 17000, partner: customer }] });
    expect(possibleDuplicateReceipts([cash, manual(named)])).toEqual([]);
    expect(possibleDuplicateReceipts([crm(), manual({ ...named, lines: [{ account: '4340', debitCents: 17000, creditCents: 0 }, { account: '1010', debitCents: 0, creditCents: 17000 }] })])).toEqual([]);
    expect(possibleDuplicateReceipts([crm(), manual({ ...named, reversedBy: 'reversal_x' })])).toEqual([]);
    expect(possibleDuplicateReceipts([crm({ deleted: true }), manual(named)])).toEqual([]);
    // an automatic invoice entry is not a receipt; two manual entries are not a CRM pair
    expect(possibleDuplicateReceipts([crm({ id: 'auto_invoice_i1', sourceKey: 'invoice:i1' }), manual(named)])).toEqual([]);
  });

  it('a single short first name is not specific enough to pair on', () => {
    const shortName = crm({ description: 'Laekumine arvele KS-5 (pangaülekanne) · Ann', documentRef: 'KS-5', lines: [{ account: '1010', debitCents: 17000, creditCents: 0 }, { account: '1200', debitCents: 0, creditCents: 17000 }] });
    expect(possibleDuplicateReceipts([shortName, manual({ description: 'Ann' })])).toEqual([]);
  });
});
