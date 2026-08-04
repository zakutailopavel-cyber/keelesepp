import {
  ArrowRight,
  CalendarCheck2,
  CircleCheck,
  Clock3,
  CreditCard,
  Mail,
  ReceiptText,
  RotateCcw,
  Search,
  Send,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../app/AuthContext.jsx";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  Modal,
  PageHeader,
  Select,
} from "../../components/ui/index.js";
import { useAsyncData } from "../../hooks/useAsyncData.js";
import {
  bankTransactionsService,
  financeApi,
  financialPeriodsService,
  invoiceDeliveryApi,
  invoicesService,
  lessonsService,
  paymentsService,
  revenuePlansService,
  studentsService,
} from "../../services/firebase/index.js";
import { validateRevenuePlan } from "../../services/firebase/revenuePlans.js";
import { hasAnyRole, ROLES } from "../../utils/roles.js";
import { invoiceBalanceCents } from "../students/studentFinance.js";
import {
  displayDate,
  invoiceAmountCents,
  invoicePaidCents,
  invoiceStatus,
  revenueForecast,
  validatePayment,
} from "./finance.js";
import LessonAccountingPanel from "./LessonAccountingPanel.jsx";
import BankReconciliationPanel from "./BankReconciliationPanel.jsx";
import FinancialPeriodPanel from "./FinancialPeriodPanel.jsx";
import "./financeWorkspace.css";

const money = (value) =>
  new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR" }).format(
    Number(value || 0) / 100,
  );
const today = () => new Date().toISOString().slice(0, 10);
const statusLabel = {
  paid: "Makstud",
  overdue: "Üle tähtaja",
  partial: "Osaliselt",
  unpaid: "Tasumata",
};
const methodLabel = {
  bank: "Pangaülekanne",
  cash: "Sularaha",
  card: "Kaardimakse",
  other: "Muu",
};
const badgeTone = (value) =>
  value === "paid"
    ? "success"
    : value === "overdue"
      ? "danger"
      : value === "partial"
        ? "info"
        : "neutral";

function paymentDraft(invoice) {
  return {
    amount: (invoiceBalanceCents(invoice) / 100).toFixed(2),
    paidAt: today(),
    method: "bank",
    reference: invoice.paymentReference || invoice.num || invoice.number || "",
    note: "",
  };
}

function forecastDraft(student, plans) {
  const plan = plans.find((item) => item.studentId === student?.id);
  return {
    studentId: student?.id || "",
    lessonPrice: plan?.lessonPriceCents
      ? String(plan.lessonPriceCents / 100)
      : String(student?.lessonPrice || ""),
    weeklyLessons: plan?.weeklyLessons
      ? String(plan.weeklyLessons)
      : String(student?.weeklyLessons || student?.lessonsPerWeek || ""),
  };
}

export default function FinancePage({
  invoiceRepository = invoicesService,
  paymentRepository = paymentsService,
  financeRepository = financeApi,
  deliveryRepository = invoiceDeliveryApi,
  planRepository = revenuePlansService,
  studentRepository = studentsService,
  lessonRepository = lessonsService,
  bankRepository = bankTransactionsService,
  periodRepository = financialPeriodsService,
}) {
  const { user } = useAuth();
  const canRegisterPayment = hasAnyRole(user.roles, [ROLES.ADMIN]);
  const state = useAsyncData(async () => {
    const [invoices, plans, students, lessons, bankTransactions, periods] =
      await Promise.all([
        invoiceRepository.list(),
        planRepository.list(),
        canRegisterPayment
          ? studentRepository.list({
              status: "active",
              pageSize: 500,
              exhaustive: true,
            })
          : Promise.resolve({ items: [] }),
        canRegisterPayment
          ? lessonRepository.listForBilling()
          : Promise.resolve([]),
        canRegisterPayment ? bankRepository.list() : Promise.resolve([]),
        canRegisterPayment ? periodRepository.list() : Promise.resolve([]),
      ]);
    return {
      invoices,
      plans,
      students: students.items,
      lessons,
      bankTransactions,
      periods,
    };
  }, [
    bankRepository,
    canRegisterPayment,
    invoiceRepository,
    lessonRepository,
    planRepository,
    periodRepository,
    studentRepository,
  ]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(null);
  const [payments, setPayments] = useState({
    loading: false,
    items: [],
    error: "",
  });
  const [paymentMode, setPaymentMode] = useState(false);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [planOpen, setPlanOpen] = useState(false);
  const [planForm, setPlanForm] = useState({
    studentId: "",
    lessonPrice: "",
    weeklyLessons: "",
  });
  const [planErrors, setPlanErrors] = useState({});
  const [planSaving, setPlanSaving] = useState(false);
  const [deliveryBusy, setDeliveryBusy] = useState("");
  const [creditLine, setCreditLine] = useState(null);
  const [creditReason, setCreditReason] = useState("");

  useEffect(() => {
    let active = true;
    if (!selected || !canRegisterPayment) {
      setPayments({ loading: false, items: [], error: "" });
      return () => {
        active = false;
      };
    }
    setPayments({ loading: true, items: [], error: "" });
    paymentRepository
      .listByInvoice(selected.id)
      .then((items) => {
        if (active) setPayments({ loading: false, items, error: "" });
      })
      .catch((error) => {
        if (active)
          setPayments({ loading: false, items: [], error: error.message });
      });
    return () => {
      active = false;
    };
  }, [canRegisterPayment, paymentRepository, selected]);

  const filtered = useMemo(
    () =>
      (state.data?.invoices || []).filter((item) => {
        const haystack =
          `${item.studentName || ""} ${item.payerName || item.parentName || ""} ${item.num || item.number || item.invoiceNumber || ""}`.toLocaleLowerCase(
            "et",
          );
        return (
          haystack.includes(query.toLocaleLowerCase("et")) &&
          (status === "all" || invoiceStatus(item) === status)
        );
      }),
    [state.data, query, status],
  );

  const openInvoice = (invoice) => {
    setSelected(invoice);
    setPaymentMode(false);
    setForm(paymentDraft(invoice));
    setErrors({});
    setActionError("");
  };
  const closeInvoice = () => {
    if (!saving) {
      setSelected(null);
      setPaymentMode(false);
    }
  };
  const submitPayment = async (event) => {
    event.preventDefault();
    const validation = validatePayment(form);
    setErrors(validation.errors);
    if (!validation.valid) return;
    setSaving(true);
    setActionError("");
    try {
      await financeRepository.recordPayment(selected.id, {
        ...form,
        amount: validation.amount,
      });
      const invoiceNumber =
        selected.num || selected.number || selected.invoiceNumber || "";
      setSelected(null);
      setPaymentMode(false);
      setSuccess(`Makse arvele ${invoiceNumber} on registreeritud.`);
      await state.reload();
    } catch (error) {
      setActionError(error.message || "Makse registreerimine ebaõnnestus.");
    } finally {
      setSaving(false);
    }
  };

  const openForecast = (studentId = "") => {
    const student =
      state.data.students.find((item) => item.id === studentId) ||
      state.data.students[0];
    setPlanForm(forecastDraft(student, state.data.plans));
    setPlanErrors({});
    setActionError("");
    setPlanOpen(true);
  };
  const selectForecastStudent = (studentId) => {
    const student = state.data.students.find((item) => item.id === studentId);
    setPlanForm(forecastDraft(student, state.data.plans));
    setPlanErrors({});
  };
  const saveForecast = async (event) => {
    event.preventDefault();
    const validation = validateRevenuePlan(planForm);
    setPlanErrors(validation.errors);
    if (!validation.valid) return;
    const student = state.data.students.find(
      (item) => item.id === planForm.studentId,
    );
    if (!student) {
      setPlanErrors({ studentId: "Vali õpilane." });
      return;
    }
    setPlanSaving(true);
    setActionError("");
    try {
      await planRepository.save(student, planForm, user);
      setPlanOpen(false);
      setSuccess(`${student.name} tuluprognoos salvestati.`);
      await state.reload();
    } catch (error) {
      setActionError(
        error.message || "Tuluprognoosi salvestamine ebaõnnestus.",
      );
    } finally {
      setPlanSaving(false);
    }
  };

  const createLessonInvoice = async (values) => {
    const result = await financeRepository.createInvoiceFromLessons(values);
    const number = result.invoice?.num || result.invoice?.number || "";
    setSuccess(
      `Arve ${number} loodi ${result.invoice?.lessonCount || values.lessonIds.length} tunni eest.`,
    );
    await state.reload();
  };
  const setLessonDisposition = async (lessonId, billingStatus, reason) => {
    await financeRepository.setLessonBillingDisposition(
      lessonId,
      billingStatus,
      reason,
    );
    setSuccess("Tunni arvestus salvestati.");
    await state.reload();
  };
  const allocateBankTransaction = (transaction) =>
    financeRepository.allocateBankTransaction(transaction);
  const previewFinancialPeriod = (month) =>
    financeRepository.previewFinancialPeriod(month);
  const reviewFinancialPeriod = (month) =>
    financeRepository.reviewFinancialPeriod(month);
  const deliverInvoice = async (mode) => {
    setDeliveryBusy(mode);
    setActionError("");
    try {
      if (mode === "send") await deliveryRepository.send(selected.id);
      else await deliveryRepository.remind(selected.id);
      setSuccess(
        mode === "send"
          ? "Arve saadeti maksjale."
          : "Maksemeeldetuletus saadeti.",
      );
      setSelected(null);
      await state.reload();
    } catch (error) {
      setActionError(error.message || "Arve saatmine ebaõnnestus.");
    } finally {
      setDeliveryBusy("");
    }
  };
  const submitCredit = async (event) => {
    event.preventDefault();
    if (!creditReason.trim()) {
      setActionError("Lisa kreeditarve põhjus.");
      return;
    }
    setSaving(true);
    setActionError("");
    try {
      await financeRepository.creditInvoiceLessonLine(
        creditLine.invoiceId,
        creditLine.lessonId,
        creditReason,
      );
      setCreditLine(null);
      setSelected(null);
      setCreditReason("");
      setSuccess("Tunnirida krediteeriti ja arve jääk arvutati uuesti.");
      await state.reload();
    } catch (error) {
      setActionError(error.message || "Tunnirea krediteerimine ebaõnnestus.");
    } finally {
      setSaving(false);
    }
  };

  if (state.loading) return <LoadingState label="Laen finantsandmeid…" />;
  if (state.error)
    return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const { invoices, plans, students, lessons, bankTransactions, periods } =
    state.data;
  const forecast = revenueForecast(plans);
  const paid = invoices.reduce((sum, item) => sum + invoicePaidCents(item), 0);
  const balance = invoices.reduce(
    (sum, item) => sum + invoiceBalanceCents(item),
    0,
  );
  const overdue = invoices.filter((item) => invoiceStatus(item) === "overdue");
  const selectedStatus = selected ? invoiceStatus(selected) : null;
  const selectedBalance = selected ? invoiceBalanceCents(selected) : 0;

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Finantsid"
        title="Arved ja maksed"
        description="Reaalne ülevaade laekumistest, võlgadest ja prognoositavast tulust."
        actions={
          canRegisterPayment ? (
            <Button disabled={!students.length} onClick={() => openForecast()}>
              <TrendingUp size={17} /> Seadista prognoos
            </Button>
          ) : null
        }
      />
      {success ? (
        <div className="success-notice" role="status">
          {success}
          <button aria-label="Sulge teade" onClick={() => setSuccess("")}>
            ×
          </button>
        </div>
      ) : null}
      <section className="metric-grid">
        <Card className="metric-card metric-card--green">
          <div className="metric-card__top">
            <span>Laekunud</span>
            <i>
              <CircleCheck size={19} />
            </i>
          </div>
          <strong>{money(paid)}</strong>
          <small>kõigi arvete lõikes</small>
        </Card>
        <Card className="metric-card metric-card--amber">
          <div className="metric-card__top">
            <span>Laekumata</span>
            <i>
              <Clock3 size={19} />
            </i>
          </div>
          <strong>{money(balance)}</strong>
          <small>{overdue.length} tähtaja ületanud</small>
        </Card>
        <Card className="metric-card metric-card--blue">
          <div className="metric-card__top">
            <span>Arveid kokku</span>
            <i>
              <ReceiptText size={19} />
            </i>
          </div>
          <strong>{invoices.length}</strong>
          <small>andmebaasis</small>
        </Card>
        <Card className="metric-card metric-card--purple">
          <div className="metric-card__top">
            <span>Prognoos kuus</span>
            <i>
              <TrendingUp size={19} />
            </i>
          </div>
          <strong>{money(forecast.monthlyCents)}</strong>
          <small>{forecast.rows.length} õpilase plaan</small>
        </Card>
      </section>
      {canRegisterPayment ? (
        <LessonAccountingPanel
          lessons={lessons}
          students={students}
          plans={plans}
          onCreateInvoice={createLessonInvoice}
          onSetDisposition={setLessonDisposition}
        />
      ) : null}
      {canRegisterPayment ? (
        <BankReconciliationPanel
          invoices={invoices}
          students={students}
          transactions={bankTransactions}
          onAllocate={allocateBankTransaction}
          onReload={state.reload}
        />
      ) : null}
      {canRegisterPayment ? (
        <FinancialPeriodPanel
          periods={periods}
          onPreview={previewFinancialPeriod}
          onReview={reviewFinancialPeriod}
          onReload={state.reload}
        />
      ) : null}
      <Card className="revenue-forecast-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Tuluprognoos</span>
            <h2>Planeeritud tunnitulu</h2>
          </div>
          <div className="forecast-totals">
            <span>
              Nädal <strong>{money(forecast.weeklyCents)}</strong>
            </span>
            <span>
              Aasta <strong>{money(forecast.annualCents)}</strong>
            </span>
          </div>
        </div>
        <p className="form-hint">
          Keskmine kuu = nädalaplaan × 52 / 12. Prognoos ei arvesta puudumisi
          ega pühi. Arvete summa arvutatakse tegelikult arvestatud tundide
          järgi.
        </p>
        {forecast.rows.length ? (
          <div className="forecast-table-wrap">
            <table className="forecast-table">
              <thead>
                <tr>
                  <th>Õpilane</th>
                  <th>Hind / tund</th>
                  <th>Tunde nädalas</th>
                  <th>Nädalas</th>
                  <th>Keskmine kuu</th>
                  {canRegisterPayment ? (
                    <th>
                      <span className="sr-only">Tegevus</span>
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {forecast.rows.map((row) => (
                  <tr key={row.studentId}>
                    <td>
                      <strong>{row.studentName}</strong>
                    </td>
                    <td>{money(row.lessonPriceCents)}</td>
                    <td>{row.weeklyLessons}</td>
                    <td>{money(row.weeklyCents)}</td>
                    <td>
                      <strong>{money(row.monthlyCents)}</strong>
                    </td>
                    {canRegisterPayment ? (
                      <td>
                        <Button
                          variant="secondary"
                          onClick={() => openForecast(row.studentId)}
                        >
                          Muuda
                        </Button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Tuluprognoos ei ole seadistatud"
            description={
              canRegisterPayment
                ? "Lisa õpilasele tunni hind ja planeeritud tundide arv nädalas."
                : "Administraator ei ole veel õpilaste tuluprognoosi seadistanud."
            }
          />
        )}
      </Card>
      <Card className="list-card finance-list">
        <div className="list-toolbar">
          <div className="search-field">
            <Search size={18} />
            <input
              aria-label="Otsi arvet"
              placeholder="Otsi õpilase, maksja või arve numbri järgi"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Select
            aria-label="Arve staatus"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">Kõik staatused</option>
            <option value="unpaid">Tasumata</option>
            <option value="partial">Osaliselt</option>
            <option value="overdue">Üle tähtaja</option>
            <option value="paid">Makstud</option>
          </Select>
        </div>
        {filtered.length ? (
          <>
            <div className="students-table-wrap">
              <table className="students-table finance-table">
                <thead>
                  <tr>
                    <th>Arve</th>
                    <th>Õpilane</th>
                    <th>Kuupäev</th>
                    <th>Tähtaeg</th>
                    <th>Summa</th>
                    <th>Jääk</th>
                    <th>Staatus</th>
                    <th>
                      <span className="sr-only">Tegevus</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const value = invoiceStatus(item);
                    return (
                      <tr key={item.id} onClick={() => openInvoice(item)}>
                        <td>
                          <button
                            className="invoice-link"
                            onClick={(event) => {
                              event.stopPropagation();
                              openInvoice(item);
                            }}
                          >
                            {item.num ||
                              item.number ||
                              item.invoiceNumber ||
                              `#${item.id.slice(0, 6)}`}
                          </button>
                        </td>
                        <td>{item.studentName || "—"}</td>
                        <td>{displayDate(item.date || item.createdAt)}</td>
                        <td>{displayDate(item.due || item.dueDate)}</td>
                        <td>{money(invoiceAmountCents(item))}</td>
                        <td>
                          <strong>{money(invoiceBalanceCents(item))}</strong>
                        </td>
                        <td>
                          <Badge tone={badgeTone(value)}>
                            {statusLabel[value]}
                          </Badge>
                        </td>
                        <td>
                          <ArrowRight size={17} aria-hidden="true" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="students-mobile-list">
              {filtered.map((item) => {
                const value = invoiceStatus(item);
                return (
                  <button
                    className="finance-mobile-card"
                    key={item.id}
                    onClick={() => openInvoice(item)}
                  >
                    <div>
                      <strong>
                        {item.num ||
                          item.number ||
                          item.invoiceNumber ||
                          `#${item.id.slice(0, 6)}`}
                      </strong>
                      <Badge tone={badgeTone(value)}>
                        {statusLabel[value]}
                      </Badge>
                    </div>
                    <span>{item.studentName || "Õpilane määramata"}</span>
                    <dl>
                      <div>
                        <dt>Summa</dt>
                        <dd>{money(invoiceAmountCents(item))}</dd>
                      </div>
                      <div>
                        <dt>Jääk</dt>
                        <dd>{money(invoiceBalanceCents(item))}</dd>
                      </div>
                    </dl>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <EmptyState
            title="Sobivaid arveid ei leitud"
            description="Muuda otsingut või filtrit."
          />
        )}
      </Card>
      <Modal
        open={planOpen}
        title="Õpilase tuluprognoos"
        onClose={() => !planSaving && setPlanOpen(false)}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={planSaving}
              onClick={() => setPlanOpen(false)}
            >
              Loobu
            </Button>
            <Button type="submit" form="revenue-plan-form" loading={planSaving}>
              Salvesta prognoos
            </Button>
          </>
        }
      >
        <form
          id="revenue-plan-form"
          className="form-grid"
          onSubmit={saveForecast}
        >
          <p className="form-hint form-grid__wide">
            Hind salvestatakse õpilase väljale <code>lessonPrice</code> ning
            seda kasutatakse tunniarvestuses ja uute arvete loomisel.
          </p>
          {actionError ? (
            <div className="action-error form-grid__wide" role="alert">
              {actionError}
              <button
                type="button"
                aria-label="Sulge viga"
                onClick={() => setActionError("")}
              >
                ×
              </button>
            </div>
          ) : null}
          <Select
            id="forecast-student"
            className="form-grid__wide"
            label="Õpilane"
            value={planForm.studentId}
            error={planErrors.studentId}
            onChange={(event) => selectForecastStudent(event.target.value)}
            required
          >
            <option value="">Vali õpilane</option>
            {students.map((student) => (
              <option value={student.id} key={student.id}>
                {student.name}
              </option>
            ))}
          </Select>
          <Input
            id="forecast-price"
            label="Tunni hind (€)"
            inputMode="decimal"
            value={planForm.lessonPrice}
            error={planErrors.lessonPrice}
            onChange={(event) =>
              setPlanForm({ ...planForm, lessonPrice: event.target.value })
            }
            placeholder="25,00"
            required
          />
          <Input
            id="forecast-weekly-lessons"
            label="Tunde nädalas"
            type="number"
            min="0.5"
            max="50"
            step="0.5"
            value={planForm.weeklyLessons}
            error={planErrors.weeklyLessons}
            onChange={(event) =>
              setPlanForm({ ...planForm, weeklyLessons: event.target.value })
            }
            placeholder="2"
            required
          />
        </form>
      </Modal>
      <Modal
        open={Boolean(selected)}
        title={
          paymentMode
            ? "Registreeri makse"
            : `Arve ${selected?.num || selected?.number || selected?.invoiceNumber || ""}`
        }
        onClose={closeInvoice}
        footer={
          selected && !paymentMode ? (
            <>
              <Button variant="secondary" onClick={closeInvoice}>
                Sulge
              </Button>
              {canRegisterPayment ? (
                <Button
                  variant="secondary"
                  loading={deliveryBusy === "send"}
                  disabled={Boolean(deliveryBusy)}
                  onClick={() => deliverInvoice("send")}
                >
                  <Mail size={17} /> Saada arve
                </Button>
              ) : null}
              {canRegisterPayment && selectedBalance > 0 ? (
                <Button
                  variant="secondary"
                  loading={deliveryBusy === "remind"}
                  disabled={Boolean(deliveryBusy)}
                  onClick={() => deliverInvoice("remind")}
                >
                  <Send size={17} /> Saada meeldetuletus
                </Button>
              ) : null}
              {canRegisterPayment && selectedBalance > 0 ? (
                <Button onClick={() => setPaymentMode(true)}>
                  <CreditCard size={17} /> Registreeri makse
                </Button>
              ) : null}
            </>
          ) : paymentMode ? (
            <>
              <Button
                variant="secondary"
                disabled={saving}
                onClick={() => {
                  setPaymentMode(false);
                  setActionError("");
                }}
              >
                Tagasi
              </Button>
              <Button type="submit" form="payment-form" loading={saving}>
                <WalletCards size={17} /> Kinnita makse
              </Button>
            </>
          ) : null
        }
      >
        {selected && !paymentMode ? (
          <div className="invoice-detail">
            {actionError ? (
              <div className="action-error" role="alert">
                {actionError}
                <button
                  type="button"
                  aria-label="Sulge viga"
                  onClick={() => setActionError("")}
                >
                  ×
                </button>
              </div>
            ) : null}
            <div className="invoice-detail__hero">
              <div>
                <span className="eyebrow">Tasumisele kuuluv jääk</span>
                <strong>{money(selectedBalance)}</strong>
                <small>Kogusumma {money(invoiceAmountCents(selected))}</small>
              </div>
              <Badge tone={badgeTone(selectedStatus)}>
                {statusLabel[selectedStatus]}
              </Badge>
            </div>
            <dl className="invoice-detail__facts">
              <div>
                <dt>Õpilane</dt>
                <dd>
                  {selected.studentId && canRegisterPayment ? (
                    <Link to={`/students/${selected.studentId}`}>
                      {selected.studentName || "Ava õpilane"}{" "}
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    selected.studentName || "—"
                  )}
                </dd>
              </div>
              <div>
                <dt>Maksja</dt>
                <dd>{selected.payerName || selected.parentName || "—"}</dd>
              </div>
              <div>
                <dt>Arve kuupäev</dt>
                <dd>{displayDate(selected.date || selected.createdAt)}</dd>
              </div>
              <div>
                <dt>Maksetähtaeg</dt>
                <dd>{displayDate(selected.due || selected.dueDate)}</dd>
              </div>
              <div>
                <dt>Viitenumber</dt>
                <dd className="mono">{selected.paymentReference || "—"}</dd>
              </div>
              <div>
                <dt>Tunde</dt>
                <dd>
                  {selected.lessonCount ?? selected.lessonIds?.length ?? "—"}
                </dd>
              </div>
            </dl>
            {selected.desc ? (
              <div className="invoice-description">
                <span>Kirjeldus</span>
                <p>{selected.desc}</p>
              </div>
            ) : null}
            {selected.lines?.length ? (
              <section className="invoice-lines">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">Arve sisu</span>
                    <h2>Tunnid ja summad</h2>
                  </div>
                  <strong>{selected.lines.length} rida</strong>
                </div>
                <div>
                  {selected.lines.map((line, index) => {
                    const corrected = (
                      selected.correctedLessonIds || []
                    ).includes(line.lessonId);
                    return (
                      <article
                        className={corrected ? "is-corrected" : ""}
                        key={line.lessonId || index}
                      >
                        <CalendarCheck2 size={18} />
                        <span>
                          <strong>{displayDate(line.date)}</strong>
                          <small>{line.description || "Keeletund"}</small>
                        </span>
                        <b>
                          {money(
                            line.amountCents ??
                              Math.round(Number(line.amount || 0) * 100),
                          )}
                        </b>
                        {canRegisterPayment && !corrected && line.lessonId ? (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setCreditLine({
                                ...line,
                                invoiceId: selected.id,
                              });
                              setSelected(null);
                              setCreditReason("");
                              setActionError("");
                            }}
                          >
                            <RotateCcw size={15} /> Krediteeri
                          </Button>
                        ) : corrected ? (
                          <Badge tone="neutral">Krediteeritud</Badge>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>
            ) : null}
            <section className="payment-history">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Maksed</span>
                  <h2>Laekumiste ajalugu</h2>
                </div>
                <strong>{money(invoicePaidCents(selected))}</strong>
              </div>
              {!canRegisterPayment ? (
                <p className="form-hint">
                  Makseajalugu on nähtav administraatorile.
                </p>
              ) : payments.loading ? (
                <p className="form-hint">Laen makseid…</p>
              ) : payments.error ? (
                <p className="form-error">{payments.error}</p>
              ) : payments.items.length ? (
                <div className="payment-list">
                  {payments.items.map((payment) => (
                    <div
                      key={payment.id}
                      className={payment.status === "voided" ? "is-voided" : ""}
                    >
                      <CreditCard size={18} />
                      <div>
                        <strong>{money(invoiceAmountCents(payment))}</strong>
                        <span>
                          {displayDate(payment.paidAt)} ·{" "}
                          {methodLabel[payment.method] ||
                            payment.method ||
                            "Makse"}
                        </span>
                        {payment.reference ? (
                          <small>Viide: {payment.reference}</small>
                        ) : null}
                      </div>
                      <Badge
                        tone={
                          payment.status === "voided" ? "danger" : "success"
                        }
                      >
                        {payment.status === "voided"
                          ? "Tühistatud"
                          : "Kinnitatud"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="form-hint">
                  Sellele arvele ei ole veel makseid registreeritud.
                </p>
              )}
            </section>
          </div>
        ) : null}
        {selected && paymentMode ? (
          <form
            id="payment-form"
            className="payment-form"
            onSubmit={submitPayment}
          >
            <div className="payment-context">
              <span>
                Arve {selected.num || selected.number || selected.invoiceNumber}
              </span>
              <strong>Jääk {money(selectedBalance)}</strong>
            </div>
            {actionError ? (
              <div className="action-error" role="alert">
                {actionError}
                <button
                  type="button"
                  aria-label="Sulge viga"
                  onClick={() => setActionError("")}
                >
                  ×
                </button>
              </div>
            ) : null}
            <div className="form-grid">
              <Input
                id="payment-amount"
                label="Laekunud summa (€)"
                inputMode="decimal"
                value={form.amount}
                error={errors.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
                required
              />
              <Input
                id="payment-date"
                label="Makse kuupäev"
                type="date"
                value={form.paidAt}
                error={errors.paidAt}
                onChange={(event) =>
                  setForm({ ...form, paidAt: event.target.value })
                }
                required
              />
              <Select
                id="payment-method"
                label="Makseviis"
                value={form.method}
                onChange={(event) =>
                  setForm({ ...form, method: event.target.value })
                }
              >
                <option value="bank">Pangaülekanne</option>
                <option value="cash">Sularaha</option>
                <option value="card">Kaardimakse</option>
                <option value="other">Muu</option>
              </Select>
              <Input
                id="payment-reference"
                label="Viide"
                value={form.reference}
                onChange={(event) =>
                  setForm({ ...form, reference: event.target.value })
                }
              />
              <label className="field form-grid__wide">
                <span className="field__label">Märkus</span>
                <textarea
                  rows="3"
                  value={form.note}
                  onChange={(event) =>
                    setForm({ ...form, note: event.target.value })
                  }
                  placeholder="Valikuline sisemine märkus"
                />
              </label>
            </div>
            {Number(String(form.amount || "").replace(",", ".")) >
            selectedBalance / 100 ? (
              <p className="payment-warning">
                Sisestatud summa ületab arve jääki. Ülejääk registreeritakse
                ettemaksuna.
              </p>
            ) : null}
            <p className="payment-confirmation">
              Kinnitamisel luuakse muutmatu maksekirje ja finantsauditi kanne.
              Kontrolli summat enne salvestamist.
            </p>
          </form>
        ) : null}
      </Modal>
      <Modal
        open={Boolean(creditLine)}
        title="Krediteeri tunnirida"
        onClose={() => !saving && setCreditLine(null)}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => setCreditLine(null)}
            >
              Loobu
            </Button>
            <Button
              variant="danger"
              type="submit"
              form="credit-line-form"
              loading={saving}
            >
              Kinnita krediteerimine
            </Button>
          </>
        }
      >
        {creditLine ? (
          <form
            id="credit-line-form"
            className="form-grid"
            onSubmit={submitCredit}
          >
            {actionError ? (
              <p className="form-error form-grid__wide" role="alert">
                {actionError}
              </p>
            ) : null}
            <div className="invoice-builder-summary form-grid__wide">
              <span>
                {displayDate(creditLine.date)} ·{" "}
                {creditLine.description || "Keeletund"}
              </span>
              <strong>
                {money(
                  creditLine.amountCents ??
                    Math.round(Number(creditLine.amount || 0) * 100),
                )}
              </strong>
            </div>
            <label className="textarea-field form-grid__wide">
              <span>Põhjus *</span>
              <textarea
                rows="4"
                value={creditReason}
                onChange={(event) => setCreditReason(event.target.value)}
                placeholder="Miks see tunnirida krediteeritakse?"
              />
            </label>
            <p className="payment-warning form-grid__wide">
              Kinnitamisel luuakse muutmatu kreeditarve ning arve summa ja jääk
              arvutatakse uuesti. Algset arvet ei kustutata.
            </p>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
