import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { test, vi } from "vitest";
import InvoiceNumberingPanel from "./InvoiceNumberingPanel.jsx";

const duplicatePlan = {
  fingerprint: "a".repeat(64),
  invoiceCount: 3,
  duplicateGroupCount: 1,
  replacementCount: 1,
  riskyReplacementCount: 0,
  counterAfter: 42,
  groups: [{
    number: "KS-2026-037",
    count: 2,
    canonicalInvoiceId: "paid",
    canonicalStudentName: "Paid Student",
    replacements: [{
      invoiceId: "draft",
      studentName: "Draft Student",
      oldNumber: "KS-2026-037",
      newNumber: "KS-2026-042",
      risk: "draft",
    }],
  }],
};

test("invoice numbering repair requires a reason and confirmation", async () => {
  const onPreview = vi.fn().mockResolvedValueOnce({ plan: duplicatePlan }).mockResolvedValueOnce({
    plan: { ...duplicatePlan, duplicateGroupCount: 0, replacementCount: 0, groups: [] },
  });
  const onRepair = vi.fn().mockResolvedValue({ repair: { replacementCount: 1 } });
  const onReload = vi.fn().mockResolvedValue();
  render(<InvoiceNumberingPanel onPreview={onPreview} onRepair={onRepair} onReload={onReload} />);
  fireEvent.click(screen.getByRole("button", { name: /Kontrolli numbreid/ }));
  expect(await screen.findByText(/KS-2026-037 → KS-2026-042/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Paranda 1 arvenumbrit/ }));
  expect(screen.getByRole("alert")).toHaveTextContent("põhjus");
  fireEvent.change(screen.getByLabelText("Paranduse põhjus *"), { target: { value: "Korduv number" } });
  fireEvent.click(screen.getByLabelText(/Kontrollisin/));
  fireEvent.click(screen.getByRole("button", { name: /Paranda 1 arvenumbrit/ }));
  await waitFor(() => expect(onRepair).toHaveBeenCalledWith(duplicatePlan, "Korduv number"));
  expect(await screen.findByRole("status")).toHaveTextContent("1 arvenumbrit parandati");
});
