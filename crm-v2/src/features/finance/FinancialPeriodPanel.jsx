import {
  BookCheck,
  CalendarRange,
  CircleAlert,
  CreditCard,
  Download,
  Landmark,
  ReceiptText,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge, Button, Card, Input } from "../../components/ui/index.js";
import { displayDate } from "./finance.js";
import {
  financialIssue,
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

function downloadReport(snapshot) {
  const blob = new globalThis.Blob([financialPeriodCsv(snapshot)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `keelesepp-finantsaruanne-${snapshot.month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function FinancialPeriodPanel({
  periods,
  onPreview,
  onReview,
  onReload,
}) {
  const [month, setMonth] = useState(previousIsoMonth);
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const reviewedPeriod = useMemo(
    () => periods.find((period) => (period.month || period.id) === month),
    [month, periods],
  );

  const preview = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const result = await onPreview(month);
      setSnapshot(result.snapshot);
    } catch (previewError) {
      setSnapshot(null);
      setError(previewError.message || "Kuu kontrolli ei õnnestunud koostada.");
    } finally {
      setLoading(false);
    }
  };

  const review = async () => {
    setReviewing(true);
    setError("");
    try {
      await onReview(month);
      setSuccess(`${financialPeriodLabel(month)} on kontrollituks märgitud.`);
      await onReload();
      const result = await onPreview(month);
      setSnapshot(result.snapshot);
    } catch (reviewError) {
      setError(reviewError.message || "Kuu kinnitamine ebaõnnestus.");
    } finally {
      setReviewing(false);
    }
  };

  const summary = snapshot?.summary;

  return (
    <Card className="financial-period">
      <div className="section-heading financial-period__heading">
        <div>
          <span className="eyebrow">Kuu kontroll</span>
          <h2>Finantsperioodi võrdlus</h2>
          <p>
            Kontrollib, et tunnid, arved, maksed ja pangalaekumised moodustavad
            terviku.
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
              setError("");
              setSuccess("");
            }}
          />
          <Button
            loading={loading}
            disabled={!month || reviewing}
            onClick={preview}
          >
            <CalendarRange size={17} /> Kontrolli kuu
          </Button>
        </div>
      </div>

      {reviewedPeriod ? (
        <div className="financial-period__reviewed">
          <BookCheck size={19} />
          <span>
            <strong>Kuu on kontrollitud</strong>
            <small>
              Versioon {reviewedPeriod.reviewVersion || 1} ·{" "}
              {displayDate(reviewedPeriod.lastReviewedAt)}
            </small>
          </span>
          <Badge tone="success">Kontrollitud</Badge>
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
                  ? `Arvestatud ettemaksed: ${money(summary.bankAdvanceCents)}. Kuu võib kontrollituks märkida.`
                  : "Paranda allolevad vead ja käivita kontroll uuesti."}
              </p>
            </div>
            <div>
              <Button
                variant="secondary"
                onClick={() => downloadReport(snapshot)}
              >
                <Download size={17} /> Ekspordi CSV
              </Button>
              {snapshot.canReview ? (
                <Button loading={reviewing} disabled={loading} onClick={review}>
                  <BookCheck size={17} /> Märgi kontrollituks
                </Button>
              ) : null}
            </div>
          </div>

          {snapshot.issues.length ? (
            <div className="financial-period__issues">
              {snapshot.issues.map((issue, index) => {
                const content = financialIssue[issue.type] || [
                  issue.type,
                  issue.detail,
                ];
                return (
                  <article key={`${issue.type}-${issue.entityId}-${index}`}>
                    <CircleAlert size={18} />
                    <span>
                      <strong>{content[0]}</strong>
                      <small>{content[1]}</small>
                    </span>
                    <code>{issue.entityId || "—"}</code>
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
            Tegemist on ainult kontrolliga — andmeid ei muudeta enne eraldi
            kinnitamist.
          </p>
        </div>
      )}
    </Card>
  );
}
