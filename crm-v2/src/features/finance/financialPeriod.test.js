import { describe, expect, it } from "vitest";
import {
  accountantExportCsv,
  financialPeriodCsv,
  financialIssueIdentity,
  financialPeriodLabel,
  previousIsoMonth,
} from "./financialPeriod.js";

describe("financial period report", () => {
  it("selects the previous month by default", () => {
    expect(previousIsoMonth(new Date("2026-08-04T12:00:00.000Z"))).toBe(
      "2026-07",
    );
    expect(financialPeriodLabel("2026-07")).toContain("2026");
  });

  it("exports summary amounts and readable issues as Excel-friendly CSV", () => {
    const csv = financialPeriodCsv({
      month: "2026-07",
      summary: {
        lessonCount: 3,
        issuedCents: 7500,
        bankAdvanceCents: 1250,
        blockingIssueCount: 1,
      },
      issues: [
        {
          severity: "attention",
          type: "unbilled_lesson",
          entityId: "lesson-1",
          detail: "Mari",
        },
      ],
    });
    expect(csv).toContain("Arvete summa EUR;75,00");
    expect(csv).toContain("Ettemaksed EUR;12,50");
    expect(csv).toContain("Tund on arveldamata");
    expect(csv).toContain("Mari");
    expect(csv).toContain("lesson-1");
  });

  it("presents a person's name and lesson details before the technical ID", () => {
    expect(
      financialIssueIdentity({
        entityId: "opaque-id",
        entityLabel: "Nicole Smirnova",
        entityDate: "2026-07-14",
        entityTime: "17:30",
        entityTeacher: "Pavel Zakutailo",
        entityAmountCents: 2500,
      }),
    ).toEqual({
      label: "Nicole Smirnova",
      meta: "14.07.2026 · 17:30 · Pavel Zakutailo · 25,00 €",
      id: "opaque-id",
    });
  });

  it("exports archived accountant registers with stable IDs and expense evidence", () => {
    const csv = accountantExportCsv({
      id: "export-1",
      month: "2026-07",
      evidenceFingerprint: "abc123",
      registers: {
        payments: [
          {
            id: "payment-1",
            invoiceId: "invoice-1",
            amountCents: 3000,
            documents: [
              {
                id: "pay-doc-1",
                fileName: "payment-order.pdf",
                storagePath: "financial/payments/payment-1/pay-doc-1",
              },
            ],
          },
        ],
        expenses: [
          {
            id: "expense-1",
            expenseDate: "2026-07-10",
            category: "software",
            description: "Videotarkvara",
            amountCents: 2440,
            vatAmountCents: 440,
            netAmountCents: 2000,
            paymentMethod: "card",
            documents: [{ id: "doc-1", fileName: "receipt.pdf" }],
          },
        ],
        payroll: [
          {
            id: "work-1",
            staffUid: "teacher-1",
            staffName: "Pavel",
            startedAt: "2026-07-10T10:00:00Z",
            endedAt: "2026-07-10T11:00:00Z",
            durationMinutes: 60,
            approvalStatus: "approved",
            hourlyRateCents: 1500,
            payAmountCents: 1500,
          },
        ],
      },
    });
    expect(csv).toContain("KULUD");
    expect(csv).toContain("expense-1");
    expect(csv).toContain("receipt.pdf [doc-1]");
    expect(csv).toContain("payment-order.pdf");
    expect(csv).toContain("financial/payments/payment-1/pay-doc-1");
    expect(csv).toContain("PALGAARVESTUS");
    expect(csv).toContain("work-1");
  });
});
