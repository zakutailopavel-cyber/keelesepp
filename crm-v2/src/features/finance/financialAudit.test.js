import { describe, expect, it } from "vitest";
import { auditActionLabel, auditCategory, filterAuditEntries } from "./financialAudit.js";

const entries = [
  { id: "1", action: "payment.created", invoiceNum: "KS-101", studentName: "Sofia Tamm", createdAt: "2026-08-04T10:00:00.000Z" },
  { id: "2", action: "payment.document_attached", invoiceNum: "KS-102", createdAt: "2026-07-15T10:00:00.000Z" },
];

describe("financial audit filtering", () => {
  it("maps actions to readable labels and categories", () => {
    expect(auditActionLabel("payment.created")).toBe("Makse registreeriti");
    expect(auditCategory("payment.document_attached")).toBe("document");
    expect(auditActionLabel("bank_transaction.saved_as_advance")).toBe("Pangamakse salvestati avansina");
  });

  it("filters by query, category, and month", () => {
    expect(filterAuditEntries(entries, { query: "sofia" })).toEqual([entries[0]]);
    expect(filterAuditEntries(entries, { category: "document" })).toEqual([entries[1]]);
    expect(filterAuditEntries(entries, { month: "2026-08" })).toEqual([entries[0]]);
  });
});
