import { describe, expect, it } from 'vitest';
import { debtAgeBuckets, debtsByPayer } from './financeDebts.js';

const invoice = (id, due, amount, payer = {}) => ({ id, due, amount, amountCents: amount * 100, status: 'Ootel', ...payer });

describe('debt age and families', () => {
  it('buckets by days past the due date', () => {
    const buckets = debtAgeBuckets([
      invoice('a', '2031-05-20', 10), invoice('b', '2031-05-01', 20), invoice('c', '2031-04-01', 30), invoice('d', '2031-02-01', 40),
    ], '2031-05-10');
    expect(buckets.map((bucket) => [bucket.id, bucket.cents, bucket.count])).toEqual([['notDue', 1000, 1], ['d30', 2000, 1], ['d60', 3000, 1], ['older', 4000, 1]]);
  });

  it('totals per payer, largest first, with the students named', () => {
    const rows = debtsByPayer([
      invoice('a', '2031-05-01', 50, { payerEmail: 'ema@example.com', payerName: 'Ema', studentName: 'Kati' }),
      invoice('b', '2031-05-01', 70, { payerEmail: 'EMA@example.com', payerName: 'Ema', studentName: 'Mati' }),
      invoice('c', '2031-05-01', 60, { studentName: 'Juta' }),
    ]);
    expect(rows.map((row) => [row.name, row.cents, row.count, row.students])).toEqual([['Ema', 12000, 2, ['Kati', 'Mati']], ['Juta', 6000, 1, ['Juta']]]);
  });
});
