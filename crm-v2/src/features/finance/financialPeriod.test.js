import { describe, expect, it } from "vitest";
import {
  financialPeriodCsv,
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
  });
});
