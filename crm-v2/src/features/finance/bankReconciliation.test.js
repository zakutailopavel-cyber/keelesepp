import { describe, expect, it } from "vitest";
import {
  bankRequestId,
  normalizeBankDate,
  parseBankAmount,
  parseBankStatement,
  prepareBankRows,
  suggestInvoice,
} from "./bankReconciliation.js";

const invoices = [
  {
    id: "invoice-1",
    num: "KS-2026-101",
    paymentReference: "2026101",
    payerName: "Maarika Tamm",
    studentId: "student-1",
    balanceDueCents: 5000,
  },
  {
    id: "invoice-2",
    num: "KS-2026-102",
    payerName: "Peeter Saar",
    studentId: "student-2",
    balanceDueCents: 3000,
  },
];

describe("bank statement reconciliation", () => {
  it("reads quoted semicolon CSV and skips outgoing payments", () => {
    const result = parseBankStatement(
      '\uFEFFKuupäev;Maksja;Selgitus;Viitenumber;Summa;Tehingu ID\n03.08.2026;"Maarika Tamm";"Arve KS-2026-101";2026101;50,00;TX-1\n04.08.2026;KeeleSepp;Pangatasu;;-1,20;TX-2',
    );
    expect(result.errors).toEqual([]);
    expect(result.skipped).toBe(1);
    expect(result.rows).toEqual([
      expect.objectContaining({
        paidAt: "2026-08-03",
        amountCents: 5000,
        payerName: "Maarika Tamm",
        reference: "Arve KS-2026-101 · 2026101",
        externalId: "TX-1",
      }),
    ]);
  });

  it("supports dot, comma and local date formats", () => {
    expect(parseBankAmount("1 234,56 EUR")).toBe(1234.56);
    expect(parseBankAmount("1,234.56")).toBe(1234.56);
    expect(normalizeBankDate("4/8/2026")).toBe("2026-08-04");
  });

  it("matches an open invoice by reference and prepares its payment", () => {
    const row = {
      sourceLine: 2,
      paidAt: "2026-08-03",
      amountCents: 5000,
      payerName: "Maarika Tamm",
      reference: "Tasumine, viide 2026101",
      externalId: "TX-1",
    };
    expect(suggestInvoice(row, invoices)?.id).toBe("invoice-1");
    expect(prepareBankRows([row], invoices)[0]).toMatchObject({
      invoiceId: "invoice-1",
      studentId: "student-1",
      allocationCents: 5000,
      match: "automatic",
      selected: true,
    });
  });

  it("does not guess when payer and amount are insufficient or ambiguous", () => {
    expect(
      suggestInvoice(
        { amountCents: 3000, payerName: "", reference: "Keeletund" },
        invoices,
      ),
    ).toBeNull();
  });

  it("creates a stable idempotency key for re-imported rows", () => {
    const row = {
      sourceLine: 2,
      paidAt: "2026-08-03",
      amountCents: 5000,
      payerName: "Maarika Tamm",
      reference: "Arve 101",
      externalId: "TX-1",
    };
    expect(bankRequestId(row)).toBe(bankRequestId({ ...row }));
    expect(bankRequestId(row)).toMatch(/^bank_[a-z0-9]+_[a-z0-9]+$/);
  });
});

describe('LHV statement', () => {
  const header = '"Kliendi konto","Dokumendi number","Kuupäev","Saaja/maksja konto","Saaja/maksja nimi","Saaja panga kood","Tühi","Deebet/Kreedit (D/C)","Summa","Viitenumber","Arhiveerimistunnus","Selgitus","Teenustasu","Valuuta","Isikukood või registrikood"';
  it('reads incoming EUR payments of an LHV CSV and skips outgoing and foreign ones', () => {
    const text = [header,
      '"EE127700771001234567","1","2026-10-03","EE382200221020145685","SMIRNOVA JEKATERINA","","","C","105.00","","2026100300012345","KS-2026-053 Aleksandr","0.00","EUR",""',
      '"EE127700771001234567","2","2026-10-04","EE382200221020145685","Elektrilevi","","","D","-25.00","","2026100400012346","arve","0.00","EUR",""',
      '"EE127700771001234567","3","2026-10-05","","Someone","","","C","10.00","","2026100500012347","x","0.00","USD",""'].join('\n');
    const parsed = parseBankStatement(text);
    expect(parsed.errors).toEqual([]);
    expect(parsed.skipped).toBe(2);
    expect(parsed.rows).toEqual([expect.objectContaining({ paidAt: '2026-10-03', amountCents: 10500, payerName: 'SMIRNOVA JEKATERINA', reference: 'KS-2026-053 Aleksandr', externalId: '2026100300012345' })]);
  });

  it('reads the current LHV English export (Sender/receiver name)', () => {
    const text = '"Customer account no","Document no","Date","Sender/receiver account","Sender/receiver name","Debit/Credit (D/C)","Amount","Reference number","Archiving code","Description","Currency","Personal code or register code","Sender/receiver bank BIC","Ultimate debtor name","Transaction reference","Account servicer reference"\n'
      + '"EE1","",2026-07-10,"EE2","KRISTINA TITOVA","C",14.00,"","2026071000000001","KS-2026-025","EUR","","HABAEE2XXXX","","1","X"';
    const { rows, errors } = parseBankStatement(text);
    expect(errors).toEqual([]);
    expect(rows[0]).toMatchObject({ paidAt: '2026-07-10', amountCents: 1400, payerName: 'KRISTINA TITOVA', reference: 'KS-2026-025', externalId: '2026071000000001' });
  });

  it('reads the English and Russian LHV headers', () => {
    const en = '"Customer account no","Document no","Date","Beneficiary\'s account no","Beneficiary\'s name","Beneficiary\'s bank code","Empty","Debit/Credit (D/C)","Amount","Reference number","Archiving code","Description","Fee","Currency"\n"EE1","1","2026-10-03","EE2","OLGA","","","C","40.00","","A1","KS-2026-080","0","EUR"';
    const ru = '"Номер счета клиента","Номер документа","Дата","Счет получателя/плательщика","Имя получателя/плательщика","Код банка получателя","Пусто","Дебет/Кредит (D/C)","Сумма","Ссылочный номер","Архивный признак","Пояснение","Комиссия","Валюта"\n"EE1","1","03.10.2026","EE2","OLGA","","","C","40,00","","A2","KS-2026-080","0","EUR"';
    for (const text of [en, ru]) {
      const { rows, errors } = parseBankStatement(text);
      expect(errors).toEqual([]);
      expect(rows[0]).toMatchObject({ paidAt: '2026-10-03', amountCents: 4000, payerName: 'OLGA', reference: 'KS-2026-080' });
    }
  });

  it('matches a payment by the parent name written surname first, or by the child named in the explanation, with the amount', () => {
    const invoices = [
      { id: 'a', num: 'KS-2026-090', amountCents: 10500, parentName: 'Jekaterina Smirnova', studentName: 'Aleksandr Smirnov' },
      { id: 'b', num: 'KS-2026-091', amountCents: 8000, payerName: 'Olga Ivanova', studentName: 'Maksim Ivanov' },
    ];
    expect(suggestInvoice({ payerName: 'SMIRNOVA JEKATERINA', reference: 'oktoober', amountCents: 10500 }, invoices)?.id).toBe('a');
    expect(suggestInvoice({ payerName: 'P. Petrov', reference: 'Maksim Ivanov oktoober', amountCents: 8000 }, invoices)?.id).toBe('b');
    expect(suggestInvoice({ payerName: 'Tundmatu', reference: 'kingitus', amountCents: 8000 }, invoices)).toBeNull();
  });
});
