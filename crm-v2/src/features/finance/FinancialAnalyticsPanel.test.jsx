import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { test, vi } from "vitest";
import FinancialAnalyticsPanel from "./FinancialAnalyticsPanel.jsx";

test("renders server-calculated management analytics and opens source invoices", async () => {
  const onOpenInvoice = vi.fn();
  const onPreview = vi.fn().mockResolvedValue({
    snapshot: {
      month: "2026-08",
      summary: {
        cashInflowCents: 12000,
        cashOutflowCents: 3000,
        cashNetCents: 9000,
        marginCents: 5000,
        revenueCents: 10000,
        forecastCents: 12000,
        forecastVarianceCents: -2000,
        forecastAttainmentPercent: 83.3,
      },
      agedDebt: {
        asOfDate: "2026-08-04",
        balanceCents: 6000,
        buckets: [
          { id: "not_due", balanceCents: 0, invoiceCount: 0 },
          { id: "days_1_30", balanceCents: 6000, invoiceCount: 1 },
          { id: "days_31_60", balanceCents: 0, invoiceCount: 0 },
          { id: "days_61_plus", balanceCents: 0, invoiceCount: 0 },
        ],
        rows: [
          {
            id: "invoice-1",
            number: "KS-101",
            studentName: "Mari",
            due: "2026-07-20",
            daysOverdue: 15,
            balanceCents: 6000,
          },
        ],
      },
      breakdown: {
        subjects: [{ label: "Eesti keel", amountCents: 10000, lessonCount: 4 }],
        teachers: [],
        groups: [],
      },
      trend: [
        {
          month: "2026-08",
          revenueCents: 10000,
          cashInflowCents: 12000,
          expenseCents: 3000,
          payrollCents: 2000,
          marginCents: 5000,
        },
      ],
    },
  });
  render(
    <FinancialAnalyticsPanel
      onPreview={onPreview}
      onOpenInvoice={onOpenInvoice}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Koosta analüüs/ }));
  expect(await screen.findByText("Võlgade vanus")).toBeInTheDocument();
  expect(screen.getByText("Eesti keel")).toBeInTheDocument();
  expect(screen.getByText(/83.3%/)).toBeInTheDocument();
  const row = screen.getByText("KS-101").closest("tr");
  fireEvent.click(within(row).getByRole("button", { name: /Ava/ }));
  expect(onOpenInvoice).toHaveBeenCalledWith("invoice-1");
  await waitFor(() =>
    expect(onPreview).toHaveBeenCalledWith(
      expect.stringMatching(/^\d{4}-\d{2}$/),
    ),
  );
});
