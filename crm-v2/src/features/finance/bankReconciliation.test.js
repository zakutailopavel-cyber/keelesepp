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
