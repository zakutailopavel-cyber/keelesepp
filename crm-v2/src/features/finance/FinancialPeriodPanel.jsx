import {
  Archive,
  BookCheck,
  BriefcaseBusiness,
  CalendarRange,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  Download,
  FileLock2,
  History,
  Landmark,
  LockKeyhole,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Input,
  Modal,
  Select,
} from "../../components/ui/index.js";
import { displayDate } from "./finance.js";
import {
  accountantExportCsv,
  financialIssue,
  financialIssueIdentity,
  financialPeriodCsv,
  financialPeriodLabel,
  previousIsoMonth,
} from "./financialPeriod.js";
import "./financialPeriod.css";

const money = (value) =>
  new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR" }).format(
    Number(value || 0) / 100,
  );
const issueTone = { error: "danger", attention: "info", warning: "neutral" };
const issueLevel = {
  error: "Viga",
  attention: "Vajab tähelepanu",
  warning: "Hoiatus",
};
const checklistLabel = {
  period_finished: ["Kuu on lõppenud", "Jooksvat kuud ei saa lukustada."],
  financial_review: [
    "Finantssverka on ajakohane",
    "Tunnid, arved, maksed ja pank peavad klappima.",
  ],
  payroll: [
    "Palgaarvestus on lahendatud",
    "Kõik tööaja kirjed peavad olema kinnitatud või tagasi lükatud.",
  ],
  expenses: [
    "Kuludokumendid on olemas",
    "Igal aktiivsel kulul peab olema tšekk või dokument.",
  ],
  export: [
    "Eksport on arhiveeritud",
    "Eksport peab vastama täpselt sulgemise tõenditele.",
  ],
};
const correctionTypes = [
  ["expense", "Kulu"],
  ["invoice", "Arve"],
  ["payment", "Makse"],
  ["payroll", "Palgaarvestus"],
  ["other", "Muu"],
];
const today = () => new Date().toISOString().slice(0, 10);
const nextMonthStart = (month) => {
  const [year, value] = String(month || "")
    .split("-")
    .map(Number);
  if (!year || !value) return today();
  return new Date(Date.UTC(year, value, 1)).toISOString().slice(0, 10);
};

function downloadCsv(content, filename) {
  const blob = new globalThis.Blob([content], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function FinancialPeriodPanel({
  periods,
  onPreview,
  onReview,
  onExport,
  onClose,
  onCorrection,
  onReload,
}) {
  const [month, setMonth] = useState(previousIsoMonth);
  const [snapshot, setSnapshot] = useState(null);
  const [closeSnapshot, setCloseSnapshot] = useState(null);
  const [latestExport, setLatestExport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [correctionDialog, setCorrectionDialog] = useState(false);
  const [correction, setCorrection] = useState({
    effectiveDate: today(),
    type: "other",
    description: "",
    amountDelta: "0",
    vatDelta: "0",
    sourceEntityId: "",
    reason: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const reviewedPeriod = useMemo(
    () => periods.find((period) => (period.month || period.id) === month),
    [month, periods],
  );

  const applyPreview = (result) => {
    setSnapshot(result.snapshot);
    setCloseSnapshot(result.closeSnapshot || null);
    setLatestExport(result.latestExport || null);
  };
  const preview = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      applyPreview(await onPreview(month));
    } catch (nextError) {
      setSnapshot(null);
      setCloseSnapshot(null);
      setLatestExport(null);
      setError(nextError.message || "Kuu kontrolli ei õnnestunud koostada.");
    } finally {
      setLoading(false);
    }
  };
  const refreshPreview = async () => {
    await onReload();
    applyPreview(await onPreview(month));
  };
  const review = async () => {
    setReviewing(true);
    setError("");
    try {
      await onReview(month);
      setSuccess(`${financialPeriodLabel(month)} on kontrollituks märgitud.`);
      await refreshPreview();
    } catch (nextError) {
      setError(nextError.message || "Kuu kinnitamine ebaõnnestus.");
    } finally {
      setReviewing(false);
    }
  };
  const generateExport = async () => {
    setExporting(true);
    setError("");
    try {
      const result = await onExport(month);
      setLatestExport(result.export);
      setSuccess(
        "Raamatupidamise eksport loodi ja arhiveeriti muutumatu tõendina.",
      );
      await refreshPreview();
    } catch (nextError) {
      setError(nextError.message || "Ekspordi loomine ebaõnnestus.");
    } finally {
      setExporting(false);
    }
  };
  const submitClose = async (event) => {
    event.preventDefault();
    if (!closeReason.trim()) {
      setError("Lisa kuu sulgemise põhjus või kinnitusmärkus.");
      return;
    }
    setClosing(true);
    setError("");
    try {
      await onClose(month, closeReason.trim());
      setCloseDialog(false);
      setCloseReason("");
      setSuccess(`${financialPeriodLabel(month)} on suletud ja lukustatud.`);
      await refreshPreview();
    } catch (nextError) {
      setError(nextError.message || "Kuu sulgemine ebaõnnestus.");
    } finally {
      setClosing(false);
    }
  };
  const submitCorrection = async (event) => {
    event.preventDefault();
    if (!correction.description.trim() || !correction.reason.trim()) {
      setError("Lisa paranduse kirjeldus ja põhjus.");
      return;
    }
    setClosing(true);
    setError("");
    try {
      await onCorrection({ ...correction, sourceMonth: month });
      setCorrectionDialog(false);
      setCorrection({
        effectiveDate: today(),
        type: "other",
        description: "",
        amountDelta: "0",
        vatDelta: "0",
        sourceEntityId: "",
        reason: "",
      });
      setSuccess(
        "Dateeritud paranduskirje lisati avatud perioodi. Suletud kuu ajalugu ei muudetud.",
      );
      await refreshPreview();
    } catch (nextError) {
      setError(nextError.message || "Paranduskirje lisamine ebaõnnestus.");
    } finally {
      setClosing(false);
    }
  };

  const summary = snapshot?.summary;
  const closeSummary = closeSnapshot?.summary;
  const status = closeSnapshot?.status || reviewedPeriod?.status || "open";

  return (
    <Card className="financial-period">
      <div className="section-heading financial-period__heading">
        <div>
          <span className="eyebrow">Kuu kontroll ja sulgemine</span>
          <h2>Finantsperioodi võrdlus</h2>
          <p>
            Kontrollib tunnid, arved, maksed, panga, palgaarvestuse, kulud ja
            arhiveeritud ekspordi enne kuu lukustamist.
          </p>
        </div>
        <div className="financial-period__controls">
          <Input
            aria-label="Kontrollitav kuu"
            type="month"
            value={month}
            max={new Date().toISOString().slice(0, 7)}
            onChange={(event) => {
              setMonth(event.target.value);
              setSnapshot(null);
              setCloseSnapshot(null);
              setLatestExport(null);
              setError("");
              setSuccess("");
            }}
          />
          <Button
            loading={loading}
            disabled={!month || reviewing || closing}
            onClick={preview}
          >
            <CalendarRange size={17} /> Kontrolli kuu
          </Button>
        </div>
      </div>

      {reviewedPeriod || status !== "open" ? (
        <div
          className={`financial-period__reviewed ${status === "closed" ? "is-closed" : ""}`}
        >
          {status === "closed" ? (
            <LockKeyhole size={19} />
          ) : (
            <BookCheck size={19} />
          )}
          <span>
            <strong>
              {status === "closed" ? "Kuu on suletud" : "Kuu on kontrollitud"}
            </strong>
            <small>
              Versioon {reviewedPeriod?.reviewVersion || 1} ·{" "}
              {displayDate(
                status === "closed"
                  ? reviewedPeriod?.closedAt
                  : reviewedPeriod?.lastReviewedAt,
              )}
            </small>
          </span>
          <Badge tone="success">
            {status === "closed" ? "Lukustatud" : "Kontrollitud"}
          </Badge>
        </div>
      ) : null}
      {error ? (
        <div className="action-error" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="success-notice" role="status">
          {success}
        </div>
      ) : null}

      {summary ? (
        <>
          <div className="financial-period__metrics">
            <span>
              <BookCheck size={18} />
              <small>Tunnid</small>
              <strong>{summary.lessonCount}</strong>
              <em>{summary.unbilledLessonCount} arveldamata</em>
            </span>
            <span>
              <ReceiptText size={18} />
              <small>Arved</small>
              <strong>{money(summary.issuedCents)}</strong>
              <em>{summary.invoiceCount} arvet</em>
            </span>
            <span>
              <CreditCard size={18} />
              <small>Maksed</small>
              <strong>{money(summary.paymentsCents)}</strong>
              <em>{summary.paymentCount} makset</em>
            </span>
            <span>
              <Landmark size={18} />
              <small>Laekumised</small>
              <strong>{money(summary.bankReceivedCents)}</strong>
              <em>{summary.bankTransactionCount} pangamakset</em>
            </span>
            <span
              className={
                summary.blockingIssueCount ? "has-attention" : "is-ready"
              }
            >
              <CircleAlert size={18} />
              <small>Erinevused</small>
              <strong>{summary.blockingIssueCount}</strong>
              <em>{summary.warningCount || 0} hoiatust</em>
            </span>
          </div>
          <div
            className={`financial-period__result ${snapshot.canReview ? "is-ready" : "has-blockers"}`}
          >
            <div>
              <strong>
                {snapshot.canReview
                  ? "Kuu andmed on omavahel kooskõlas"
                  : `${summary.blockingIssueCount} erinevust vajab lahendamist`}
              </strong>
              <p>
                {snapshot.canReview
                  ? `Arvestatud ettemaksed: ${money(summary.bankAdvanceCents)}. Järgmine samm on palga, kulude ja ekspordi kontroll.`
                  : "Paranda allolevad vead ja käivita kontroll uuesti."}
              </p>
            </div>
            <div>
              <Button
                variant="secondary"
                onClick={() =>
                  downloadCsv(
                    financialPeriodCsv(snapshot),
                    `keelesepp-finantskontroll-${snapshot.month}.csv`,
                  )
                }
              >
                <Download size={17} /> Kontrolli CSV
              </Button>
              {snapshot.canReview && status !== "closed" ? (
                <Button loading={reviewing} disabled={loading} onClick={review}>
                  <BookCheck size={17} /> Märgi kontrollituks
                </Button>
              ) : null}
            </div>
          </div>

          {closeSnapshot ? (
            <section className="period-close">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Sulgemise kontrollnimekiri</span>
                  <h2>Raamatupidamise kuu lõpetamine</h2>
                </div>
                {status === "closed" ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setError("");
                      setCorrectionDialog(true);
                    }}
                  >
                    <History size={17} /> Lisa paranduskirje
                  </Button>
                ) : null}
              </div>
              <div className="period-close__checklist">
                {closeSnapshot.checklist.map((item) => {
                  const content = checklistLabel[item.id] || [item.id, ""];
                  return (
                    <article
                      key={item.id}
                      className={item.ready ? "is-ready" : "has-blocker"}
                    >
                      {item.ready ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <CircleAlert size={20} />
                      )}
                      <span>
                        <strong>{content[0]}</strong>
                        <small>
                          {item.ready
                            ? "Valmis"
                            : `${content[1]}${item.count ? ` Lahendamata: ${item.count}.` : ""}`}
                        </small>
                      </span>
                      <Badge tone={item.ready ? "success" : "danger"}>
                        {item.ready ? "Valmis" : "Puudub"}
                      </Badge>
                    </article>
                  );
                })}
              </div>
              <div className="period-close__totals">
                <span>
                  <BriefcaseBusiness size={18} />
                  <small>Kinnitatud töötasu</small>
                  <strong>{money(closeSummary.payrollPayCents)}</strong>
                  <em>{closeSummary.payrollApprovedCount} kirjet</em>
                </span>
                <span>
                  <WalletCards size={18} />
                  <small>Kulud koos KM-ga</small>
                  <strong>
                    {money(
                      closeSummary.expenseAmountCents +
                        closeSummary.correctionAmountCents,
                    )}
                  </strong>
                  <em>
                    KM{" "}
                    {money(
                      closeSummary.expenseVatCents +
                        closeSummary.correctionVatCents,
                    )}
                  </em>
                </span>
                <span>
                  <ReceiptText size={18} />
                  <small>Nõuded kuu lõpus</small>
                  <strong>{money(closeSummary.closingReceivablesCents)}</strong>
                  <em>alguses {money(closeSummary.openingReceivablesCents)}</em>
                </span>
                <span>
                  <CreditCard size={18} />
                  <small>Ettemaksed kuu lõpus</small>
                  <strong>
                    {money(closeSummary.closingPayerCreditsCents)}
                  </strong>
                  <em>
                    alguses {money(closeSummary.openingPayerCreditsCents)}
                  </em>
                </span>
              </div>
              <div
                className={`period-close__actions ${closeSnapshot.alreadyClosed ? "is-closed" : ""}`}
              >
                <div>
                  {closeSnapshot.alreadyClosed ? (
                    <>
                      <LockKeyhole size={22} />
                      <span>
                        <strong>Periood on muutumatu</strong>
                        <small>
                          Hilisemad vead parandatakse dateeritud paranduskirjega
                          järgmises avatud kuus.
                        </small>
                      </span>
                    </>
                  ) : (
                    <>
                      <FileLock2 size={22} />
                      <span>
                        <strong>Ekspordi fingerprint seob kõik tõendid</strong>
                        <small>
                          Pärast andmete muutumist tuleb eksport uuesti
                          genereerida.
                        </small>
                      </span>
                    </>
                  )}
                </div>
                <div>
                  {latestExport && closeSnapshot.exportMatches ? (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        downloadCsv(
                          accountantExportCsv(latestExport),
                          `keelesepp-raamatupidamine-${month}.csv`,
                        )
                      }
                    >
                      <Download size={17} /> Laadi arhiivi CSV
                    </Button>
                  ) : null}
                  {closeSnapshot.canGenerateExport ? (
                    <Button
                      variant="secondary"
                      loading={exporting}
                      onClick={generateExport}
                    >
                      <Archive size={17} /> Loo ja arhiveeri eksport
                    </Button>
                  ) : null}
                  {closeSnapshot.canClose ? (
                    <Button
                      loading={closing}
                      onClick={() => {
                        setError("");
                        setCloseDialog(true);
                      }}
                    >
                      <LockKeyhole size={17} /> Sulge kuu
                    </Button>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {snapshot.issues.length ? (
            <div className="financial-period__issues">
              {snapshot.issues.map((issue, index) => {
                const content = financialIssue[issue.type] || [
                  issue.type,
                  issue.detail,
                ];
                const identity = financialIssueIdentity(issue);
                return (
                  <article key={`${issue.type}-${issue.entityId}-${index}`}>
                    <CircleAlert size={18} />
                    <span>
                      <strong>{content[0]}</strong>
                      <small>{content[1]}</small>
                    </span>
                    <span className="financial-period__issue-identity">
                      <strong>{identity.label}</strong>
                      {identity.meta ? <small>{identity.meta}</small> : null}
                      {identity.id ? (
                        <code title="Tehniline ID">ID: {identity.id}</code>
                      ) : null}
                    </span>
                    <Badge tone={issueTone[issue.severity] || "neutral"}>
                      {issueLevel[issue.severity] || issue.severity}
                    </Badge>
                  </article>
                );
              })}
            </div>
          ) : null}
        </>
      ) : (
        <div className="financial-period__empty">
          <CalendarRange size={26} />
          <strong>Vali kuu ja käivita kontroll</strong>
          <p>
            Kontroll on read-only. Eksport ja lukustamine on eraldi kinnitatavad
            sammud.
          </p>
        </div>
      )}

      <Modal
        open={closeDialog}
        title={`Sulge ${financialPeriodLabel(month)}`}
        onClose={() => !closing && setCloseDialog(false)}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={closing}
              onClick={() => setCloseDialog(false)}
            >
              Loobu
            </Button>
            <Button type="submit" form="period-close-form" loading={closing}>
              <LockKeyhole size={16} /> Sulge ja lukusta
            </Button>
          </>
        }
      >
        <form
          id="period-close-form"
          className="period-close__form"
          onSubmit={submitClose}
        >
          <p className="form-hint">
            Pärast sulgemist ei saa selle kuu tunde, arveid, palgakirjeid ega
            kulusid tavalisel viisil muuta. Parandused tehakse uue dateeritud
            kirjega.
          </p>
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
          <label className="textarea-field">
            <span>Sulgemise märkus *</span>
            <textarea
              aria-label="Sulgemise märkus"
              rows="4"
              value={closeReason}
              onChange={(event) => setCloseReason(event.target.value)}
            />
          </label>
        </form>
      </Modal>
      <Modal
        open={correctionDialog}
        title={`Paranduskirje suletud kuule ${month}`}
        onClose={() => !closing && setCorrectionDialog(false)}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={closing}
              onClick={() => setCorrectionDialog(false)}
            >
              Loobu
            </Button>
            <Button
              type="submit"
              form="period-correction-form"
              loading={closing}
            >
              Lisa paranduskirje
            </Button>
          </>
        }
      >
        <form
          id="period-correction-form"
          className="form-grid"
          onSubmit={submitCorrection}
        >
          <p className="form-hint form-grid__wide">
            Kirje jõustub valitud avatud kuupäeval. Suletud perioodi eksport ja
            algandmed jäävad muutumatuks.
          </p>
          {error ? (
            <p className="form-error form-grid__wide" role="alert">
              {error}
            </p>
          ) : null}
          <Input
            id="correction-effective-date"
            label="Paranduse kuupäev"
            type="date"
            min={nextMonthStart(month)}
            value={correction.effectiveDate}
            onChange={(event) =>
              setCorrection({
                ...correction,
                effectiveDate: event.target.value,
              })
            }
          />
          <Select
            id="correction-type"
            label="Liik"
            value={correction.type}
            onChange={(event) =>
              setCorrection({ ...correction, type: event.target.value })
            }
          >
            {correctionTypes.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            id="correction-description"
            className="form-grid__wide"
            label="Kirjeldus"
            value={correction.description}
            onChange={(event) =>
              setCorrection({ ...correction, description: event.target.value })
            }
          />
          <Input
            id="correction-amount"
            label="Summa muutus (€)"
            inputMode="decimal"
            value={correction.amountDelta}
            onChange={(event) =>
              setCorrection({ ...correction, amountDelta: event.target.value })
            }
          />
          <Input
            id="correction-vat"
            label="KM muutus (€)"
            inputMode="decimal"
            value={correction.vatDelta}
            onChange={(event) =>
              setCorrection({ ...correction, vatDelta: event.target.value })
            }
          />
          <Input
            id="correction-source"
            className="form-grid__wide"
            label="Lähteobjekti ID (valikuline)"
            value={correction.sourceEntityId}
            onChange={(event) =>
              setCorrection({
                ...correction,
                sourceEntityId: event.target.value,
              })
            }
          />
          <label className="textarea-field form-grid__wide">
            <span>Paranduse põhjus *</span>
            <textarea
              aria-label="Paranduse põhjus"
              rows="4"
              value={correction.reason}
              onChange={(event) =>
                setCorrection({ ...correction, reason: event.target.value })
              }
            />
          </label>
        </form>
      </Modal>
    </Card>
  );
}
