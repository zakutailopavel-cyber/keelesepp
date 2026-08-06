import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { vi } from "vitest";
import LessonAccountingPanel from "./LessonAccountingPanel.jsx";

const students = [
  {
    id: "student-1",
    name: "Sofia Tamm",
    teacher: "Anna Saar",
    lessonPrice: 25,
  },
  {
    id: "student-2",
    name: "Martin Kask",
    teacher: "Anna Saar",
    lessonPrice: 30,
  },
];

const plans = [
  {
    studentId: "student-1",
    lessonPriceCents: 2500,
    weeklyLessons: 2,
    active: true,
  },
  {
    studentId: "student-2",
    lessonPriceCents: 3000,
    weeklyLessons: 1,
    active: true,
  },
];

const lessons = [
  {
    id: "lesson-1",
    studentId: "student-1",
    studentName: "Sofia Tamm",
    date: "2026-08-01",
    status: "Toimunud",
  },
  {
    id: "lesson-2",
    studentId: "student-2",
    studentName: "Martin Kask",
    date: "2026-08-02",
    status: "Toimunud",
  },
  {
    id: "lesson-3",
    studentId: "student-2",
    studentName: "Martin Kask",
    date: "2026-08-03",
    status: "Toimunud",
  },
];

function renderPanel(overrides = {}) {
  const onCreateInvoice = vi.fn().mockResolvedValue({});
  const onSetDisposition = vi.fn().mockResolvedValue({});
  render(
    <LessonAccountingPanel
      lessons={overrides.lessons || lessons}
      students={overrides.students || students}
      plans={overrides.plans || plans}
      onCreateInvoice={onCreateInvoice}
      onSetDisposition={onSetDisposition}
    />,
  );
  return { onCreateInvoice, onSetDisposition };
}

describe("LessonAccountingPanel student invoice creator", () => {
  it("shows a prominent student selector with lesson count and amount", async () => {
    renderPanel();

    expect(
      screen.getByRole("heading", { name: "Loo õpilasele arve" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Õpilane")).toHaveValue("student-1");
    expect(screen.getByText("1", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getAllByText("25,00 €").length).toBeGreaterThan(0);
  });

  it("opens the existing invoice builder for the selected student", async () => {
    renderPanel();

    fireEvent.change(screen.getByLabelText("Õpilane"), {
      target: { value: "student-2" },
    });

    const creator = screen
      .getByRole("heading", { name: "Loo õpilasele arve" })
      .closest("section");
    expect(within(creator).getByText("2", { selector: "strong" })).toBeInTheDocument();
    expect(within(creator).getByText("60,00 €")).toBeInTheDocument();

    fireEvent.click(within(creator).getByRole("button", { name: "Loo arve" }));

    const dialog = screen.getByRole("dialog", {
      name: "Loo arve: Martin Kask",
    });
    expect(within(dialog).getAllByRole("checkbox")).toHaveLength(2);
  });

  it("creates an invoice from the lessons selected in the builder", async () => {
    const { onCreateInvoice } = renderPanel();
    const creator = screen
      .getByRole("heading", { name: "Loo õpilasele arve" })
      .closest("section");

    fireEvent.click(within(creator).getByRole("button", { name: "Loo arve" }));
    const dialog = screen.getByRole("dialog", {
      name: "Loo arve: Sofia Tamm",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Loo arve" }));

    await waitFor(() =>
      expect(onCreateInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: "student-1",
          lessonIds: ["lesson-1"],
          due: expect.stringMatching(/^\d{4}-\d{2}-10$/),
        }),
      ),
    );
  });

  it("disables creation when there are no unbilled lessons", () => {
    renderPanel({ lessons: [] });

    expect(screen.getByLabelText("Õpilane")).toBeDisabled();
    const creator = screen
      .getByRole("heading", { name: "Loo õpilasele arve" })
      .closest("section");
    expect(within(creator).getByRole("button", { name: "Loo arve" })).toBeDisabled();
  });
});
