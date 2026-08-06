import {
  CalendarCheck2,
  FilePlus2,
  ReceiptText,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Select,
} from "../../components/ui/index.js";
import {
  billingAttentionLessons,
  defaultInvoiceDue,
  lessonAccountingRows,
} from "./lessonAccounting.js";
import BatchInvoicePanel from "./BatchInvoicePanel.jsx";
import "./studentInvoiceCreator.css";

const money = (cents) =>
  new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR" }).format(
    Number(cents || 0) / 100,
  );
const dateLabel = (value) =>
  value
    ? new Date(`${value}T12:00:00`).toLocaleDateString("et-EE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";
const absenceLabel = {
  Puudus_p: "Teatatud puudumine",
  Puudus_eta: "Teatamata puudumine",
};

export default function LessonAccountingPanel({
  lessons,
  students,
  plans,
  onCreateInvoice,
  onSetDisposition,
}) {
  const rows = useMemo(
    () => lessonAccountingRows(lessons, students, plans),
    [lessons, plans, students],
  );
  const attention = useMemo(() => billingAttentionLessons(lessons), [lessons]);
  const studentById = useMemo(
    () => new Map(students.map((student) => [student.id, student])),
    [students],
  );
  const [creatorStudentId, setCreatorStudentId] = useState("");
  const [invoiceRow, setInvoiceRow] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [invoiceForm, setInvoiceForm] = useState({
    due: defaultInvoiceDue(),
    description: "",
    paymentReference: "",
  });
  const [dispositionLesson, setDispositionLesson] = useState(null);
  const [disposition, setDisposition] = useState({
    billingStatus: "cancelled_on_time",
    reason: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const totalLessons = rows.reduce((sum, row) => sum + row.lessons.length, 0);
  const totalCents = rows.reduce((sum, row) => sum + row.amountCents, 0);
  const creatorRow =
    rows.find((row) => row.student.id === creatorStudentId) || null;

  useEffect(() => {
    if (!rows.length) {
      setCreatorStudentId("");
      return;
    }
    if (!rows.some((row) => row.student.id === creatorStudentId)) {
      setCreatorStudentId(rows[0].student.id);
    }
  }, [creatorStudentId, rows]);

  const openInvoice = (row) => {
    setInvoiceRow(row);
    setSelectedIds(row.lessons.map((lesson) => lesson.id));
    setInvoiceForm({
      due: defaultInvoiceDue(),
      description: "",
      paymentReference: "",
    });
    setError("");
  };
  const toggleLesson = (lessonId) =>
    setSelectedIds((current) =>
      current.includes(lessonId)
        ? current.filter((id) => id !== lessonId)
        : [...current, lessonId],
    );
  const createInvoice = async (event) => {
    event.preventDefault();
    if (!selectedIds.length) {
      setError("Vali vähemalt üks tund.");
      return;
    }
    if (!invoiceRow.lessonPriceCents) {
      setError("Määra õpilasele enne tunni hind.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onCreateInvoice({
        studentId: invoiceRow.student.id,
        lessonIds: selectedIds,
        due: invoiceForm.due,
        description: invoiceForm.description,
        paymentReference: invoiceForm.paymentReference,
      });
      setInvoiceRow(null);
    } catch (nextError) {
      setError(nextError.message || "Arve loomine ebaõnnestus.");
    } finally {
      setSaving(false);
    }
  };
  const openDisposition = (lesson) => {
    setDispositionLesson(lesson);
    setDisposition({
      billingStatus: ["Puudus_p", "Puudus_eta"].includes(lesson.status)
        ? "cancelled_on_time"
        : "free",
      reason: "",
    });
    setError("");
  };
  const saveDisposition = async (event) => {
    event.preventDefault();
    if (!disposition.reason.trim()) {
      setError("Lisa muudatuse põhjus.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSetDisposition(
        dispositionLesson.id,
        disposition.billingStatus,
        disposition.reason,
      );
      setDispositionLesson(null);
    } catch (nextError) {
      setError(nextError.message || "Tunni arvestuse muutmine ebaõnnestus.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="lesson-accounting-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Tunniarvestus</span>
          <h2>Arveldamata tunnid</h2>
        </div>
        <div className="forecast-totals">
          <span>
            <strong>{totalLessons}</strong> tundi
          </span>
          <span>
            <strong>{money(totalCents)}</strong> kokku
          </span>
        </div>
      </div>
      <p className="form-hint">
        Selles nimekirjas on ainult läbiviidud või tasuliseks märgitud tunnid,
        mida ei ole veel arvele lisatud. Summa arvutatakse õpilase tunni hinna
        järgi.
      </p>

      <BatchInvoicePanel rows={rows} onCreateInvoice={onCreateInvoice} />

      <section className="student-invoice-creator" aria-labelledby="student-invoice-creator-title">
        <div className="student-invoice-creator__intro">
          <span className="student-invoice-creator__icon" aria-hidden="true">
            <UserRound size={22} />
          </span>
          <div>
            <span className="eyebrow">Uus arve</span>
            <h3 id="student-invoice-creator-title">Loo õpilasele arve</h3>
            <p>
              Vali õpilane ja ava arve koostaja. Arvele saab lisada tema
              läbiviidud, kuid veel arveldamata tunnid.
            </p>
          </div>
        </div>
        <div className="student-invoice-creator__selection">
          <Select
            label="Õpilane"
            value={creatorStudentId}
            disabled={!rows.length}
            onChange={(event) => setCreatorStudentId(event.target.value)}
          >
            {!rows.length ? (
              <option value="">Arveldamata tunde ei ole</option>
            ) : null}
            {rows.map((row) => (
              <option key={row.student.id} value={row.student.id}>
                {row.student.name}
              </option>
            ))}
          </Select>
          <div className="student-invoice-creator__summary" aria-live="polite">
            {creatorRow ? (
              <>
                <span>
                  <strong>{creatorRow.lessons.length}</strong> tundi
                </span>
                <span>•</span>
                <span>
                  <strong>
                    {creatorRow.lessonPriceCents
                      ? money(creatorRow.amountCents)
                      : "Hind puudub"}
                  </strong>
                </span>
              </>
            ) : (
              <span>Uued tunnid ilmuvad siia pärast nende toimumist.</span>
            )}
          </div>
        </div>
        <div className="student-invoice-creator__action">
          <Button
            disabled={!creatorRow || !creatorRow.lessonPriceCents}
            onClick={() => creatorRow && openInvoice(creatorRow)}
          >
            <FilePlus2 size={17} /> Loo arve
          </Button>
        </div>
      </section>

      {rows.length ? (
        <div className="billing-student-list">
          {rows.map((row) => (
            <section key={row.student.id}>
              <div className="billing-student-main">
                <div className="student-mini-avatar">
                  {row.student.name
                    .split(/\s+/)
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <span>
                  <strong>{row.student.name}</strong>
                  <small>
                    {row.student.teacher || "Õpetaja määramata"} ·{" "}
                    {money(row.lessonPriceCents)} / tund
                  </small>
                </span>
              </div>
              <div className="billing-student-summary">
                <Badge tone="info">{row.lessons.length} tundi</Badge>
                <strong>
                  {row.lessonPriceCents
                    ? money(row.amountCents)
                    : "Hind puudub"}
                </strong>
                <Button
                  disabled={!row.lessonPriceCents}
                  onClick={() => openInvoice(row)}
                >
                  <FilePlus2 size={17} /> Loo arve
                </Button>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Kõik läbiviidud tunnid on arvestatud"
          description="Uued tunnid ilmuvad siia pärast nende märkimist toimunuks."
          action={<CalendarCheck2 size={28} />}
        />
      )}
      {attention.length ? (
        <section className="billing-attention">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Kontrollida</span>
              <h3>Puudumiste arvestus</h3>
            </div>
            <Badge tone="danger">{attention.length}</Badge>
          </div>
          {attention.map((lesson) => (
            <div key={lesson.id}>
              <TriangleAlert size={18} />
              <span>
                <strong>
                  {studentById.get(lesson.studentId)?.name ||
                    lesson.studentName ||
                    "Õpilane"}
                </strong>
                <small>
                  {dateLabel(lesson.date)} ·{" "}
                  {absenceLabel[lesson.status] || lesson.status}
                </small>
              </span>
              <Button
                variant="secondary"
                onClick={() => openDisposition(lesson)}
              >
                Määra arvestus
              </Button>
            </div>
          ))}
        </section>
      ) : null}

      <Modal
        open={Boolean(invoiceRow)}
        title={`Loo arve: ${invoiceRow?.student.name || ""}`}
        onClose={() => !saving && setInvoiceRow(null)}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setInvoiceRow(null)}
            >
              Loobu
            </Button>
            <Button type="submit" form="lesson-invoice-form" loading={saving}>
              <ReceiptText size={17} /> Loo arve
            </Button>
          </>
        }
      >
        {invoiceRow ? (
          <form
            id="lesson-invoice-form"
            className="invoice-builder"
            onSubmit={createInvoice}
          >
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="invoice-builder-summary">
              <span>Valitud {selectedIds.length} tundi</span>
              <strong>
                {money(selectedIds.length * invoiceRow.lessonPriceCents)}
              </strong>
            </div>
            <div className="invoice-lesson-picker">
              {invoiceRow.lessons.map((lesson) => (
                <label key={lesson.id}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(lesson.id)}
                    onChange={() => toggleLesson(lesson.id)}
                  />
                  <span>
                    <strong>{dateLabel(lesson.date)}</strong>
                    <small>
                      {lesson.topic ||
                        lesson.subject ||
                        (lesson.billingStatus === "late_cancel_billable"
                          ? "Hiline tühistus"
                          : "Keeletund")}
                    </small>
                  </span>
                  <b>{money(invoiceRow.lessonPriceCents)}</b>
                </label>
              ))}
            </div>
            <div className="form-grid">
              <Input
                id="invoice-due"
                label="Maksetähtaeg"
                type="date"
                value={invoiceForm.due}
                onChange={(event) =>
                  setInvoiceForm({ ...invoiceForm, due: event.target.value })
                }
                required
              />
              <Input
                id="invoice-reference"
                label="Viitenumber (valikuline)"
                value={invoiceForm.paymentReference}
                onChange={(event) =>
                  setInvoiceForm({
                    ...invoiceForm,
                    paymentReference: event.target.value,
                  })
                }
              />
              <label className="textarea-field form-grid__wide">
                <span>Kirjeldus</span>
                <textarea
                  rows="3"
                  value={invoiceForm.description}
                  onChange={(event) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      description: event.target.value,
                    })
                  }
                  placeholder={`${selectedIds.length} keeletundi`}
                />
              </label>
            </div>
          </form>
        ) : null}
      </Modal>
      <Modal
        open={Boolean(dispositionLesson)}
        title="Määra tunni arvestus"
        onClose={() => !saving && setDispositionLesson(null)}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setDispositionLesson(null)}
            >
              Loobu
            </Button>
            <Button
              type="submit"
              form="lesson-disposition-form"
              loading={saving}
            >
              Salvesta
            </Button>
          </>
        }
      >
        {dispositionLesson ? (
          <form
            id="lesson-disposition-form"
            className="form-grid"
            onSubmit={saveDisposition}
          >
            {error ? (
              <p className="form-error form-grid__wide" role="alert">
                {error}
              </p>
            ) : null}
            <p className="form-hint form-grid__wide">
              {studentById.get(dispositionLesson.studentId)?.name ||
                dispositionLesson.studentName ||
                "Õpilane"}{" "}
              · {dateLabel(dispositionLesson.date)}
            </p>
            <Select
              className="form-grid__wide"
              label="Arvestus"
              value={disposition.billingStatus}
              onChange={(event) =>
                setDisposition({
                  ...disposition,
                  billingStatus: event.target.value,
                })
              }
            >
              {["Puudus_p", "Puudus_eta"].includes(dispositionLesson.status) ? (
                <>
                  <option value="cancelled_on_time">
                    Õigeaegselt tühistatud — tasuta
                  </option>
                  <option value="late_cancel_billable">
                    Hiline tühistus — lisada arvele
                  </option>
                </>
              ) : (
                <>
                  <option value="free">Tasuta tund</option>
                  <option value="written_off">Mahakantud</option>
                  <option value="unbilled">Taasta arveldamiseks</option>
                </>
              )}
            </Select>
            <label className="textarea-field form-grid__wide">
              <span>Põhjus *</span>
              <textarea
                rows="4"
                value={disposition.reason}
                onChange={(event) =>
                  setDisposition({ ...disposition, reason: event.target.value })
                }
                placeholder="Miks arvestust muudeti?"
              />
            </label>
          </form>
        ) : null}
      </Modal>
    </Card>
  );
}