import { cardPayerEmail, cardPayerName, invoicePayerPreview, invoiceShownEmail } from './invoicePayer.js';

// the browser mirror of functions/invoice-payer-core.js (bug 2026-11-04)
describe('invoicePayer', () => {
  it('a child card: the parent pays and gets the invoice', () => {
    const card = { name: 'Mari Tamm', parentName: 'Ema Tamm', parentEmail: 'ema@example.ee', email: 'mari@example.ee' };
    expect(cardPayerName(card)).toBe('Ema Tamm');
    expect(cardPayerEmail(card)).toBe('ema@example.ee');
  });

  it('an adult who pays himself, no parent name: his full name and own e-mail', () => {
    expect(invoicePayerPreview({ name: 'Aleksandr Smirnov', email: 'aleks@example.ee' })).toMatchObject({ payerName: 'Aleksandr Smirnov', email: 'aleks@example.ee', missingEmail: false, shortName: false });
  });

  it('missing parent name with a parent e-mail (the Jekaterina card)', () => {
    expect(invoicePayerPreview({ name: 'Jekaterina Lesnikova', parentName: '', parentEmail: 'lesnikovajekaterina@gmail.com', email: '' }))
      .toMatchObject({ studentName: 'Jekaterina Lesnikova', payerName: 'Jekaterina Lesnikova', email: 'lesnikovajekaterina@gmail.com', missingEmail: false });
  });

  it('billingEmail counts; nothing at all is flagged; a linked parent account is not', () => {
    expect(cardPayerEmail({ billingEmail: 'arved@firma.ee', email: 'self@example.ee' })).toBe('arved@firma.ee');
    expect(invoicePayerPreview({ name: 'Jekaterina' })).toMatchObject({ email: '', missingEmail: true, shortName: true });
    expect(invoicePayerPreview({ name: 'Mia Kask', linkedParentId: 'p1' }).missingEmail).toBe(false);
    expect(invoicePayerPreview({ name: 'Mia Kask', linkedParentId: 'p1' }, [{ id: 'p1', email: 'isa@example.ee' }]).email).toBe('isa@example.ee');
  });

  it('an old invoice without a payer e-mail shows the address it was sent to', () => {
    expect(invoiceShownEmail({ payerEmail: '', parentEmail: '', emailRecipient: 'lesnikovajekaterina@gmail.com' })).toBe('lesnikovajekaterina@gmail.com');
    expect(invoiceShownEmail({ payerEmail: 'pere@example.ee', emailRecipient: 'other@example.ee' })).toBe('pere@example.ee');
    expect(invoiceShownEmail({})).toBe('');
  });
});
