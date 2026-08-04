import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  CircleDollarSign,
  Landmark,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Input,
  Select,
} from "../../components/ui/index.js";
import { displayDate } from "./finance.js";
import "./financialAnalytics.css";

const money = (value) =>
  new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR" }).format(
    Number(value || 0) / 100,
  );
const currentMonth = () => new Date().toISOString().slice(0, 7);
const bucketLabels = {
  not_due: "Tähtaeg ees",
  days_1_30: "1–30 päeva",
  days_31_60: "31–60 päeva",
  days_61_plus: "61+ päeva",
};
const dimensionLabels = {
  subjects: "Õppeaine",
  teachers: "Õpetaja",
  groups: "Grupp",
};

export default function FinancialAnalyticsPanel({ onPreview, onOpenInvoice }) {
  const [month, setMonth] = useState(currentMonth);
  const [snapshot, setSnapshot] = useState(null);
  const [dimension, setDimension] = useState("subjects");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const preview = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await onPreview(month);
      setSnapshot(result.snapshot);
    } catch (nextError) {
      setSnapshot(null);
      setError(
        nextError.message || "Finantsanalüütika koostamine ebaõnnestus.",
      );
    } finally {
      setLoading(false);
    }
  };

  const summary = snapshot?.summary;
  const breakdown = snapshot?.breakdown?.[dimension] || [];

  return (
    <Card className="financial-analytics">
      <div className="section-heading financial-analytics__heading">
        <div>
          <span className="eyebrow">Juhtimisvaade</span>
          <h2>Finantsanalüütika</h2>
          <p>
            Rahavoog, kasumlikkus, prognoosi täitmine ja võlgade vanus koos
            lähteandmeteni viiva drill-down’iga.
          </p>
        </div>
        <div className="financial-analytics__controls">
          <Input
            aria-label="Analüütika kuu"
            type="month"
            max={currentMonth()}
            value={month}
            onChange={(event) => {
              setMonth(event.target.value);
              setSnapshot(null);
              setError("");
            }}
          />
          <Button loading={loading} disabled={!month} onClick={preview}>
            <CalendarRange size={17} /> Koosta analüüs
          </Button>
        </div>
      </div>

      {error ? (
        <div className="action-error" role="alert">
          {error}
        </div>
      ) : null}

      {summary ? (
        <>
          <div className="financial-analytics__metrics">
            <span>
              <TrendingUp size={19} />
              <small>Raha sisse</small>
              <strong>{money(summary.cashInflowCents)}</strong>
              <em>pank ja otselaekumised</em>
            </span>
            <span>
              <TrendingDown size={19} />
              <small>Raha välja</small>
              <strong>{money(summary.cashOutflowCents)}</strong>
              <em>kulud ja tagastused</em>
            </span>
            <span>
              <WalletCards size={19} />
              <small>Rahavoo saldo</small>
              <strong>{money(summary.cashNetCents)}</strong>
              <em>tegelik perioodi liikumine</em>
            </span>
            <span
              className={
                summary.marginCents >= 0 ? "is-positive" : "is-negative"
              }
            >
              <CircleDollarSign size={19} />
              <small>Arvestuslik marginaal</small>
              <strong>{money(summary.marginCents)}</strong>
              <em>tulu − palk − kulud</em>
            </span>
          </div>

          <section className="analytics-forecast">
            <div>
              <span className="eyebrow">Prognoos vs tegelik</span>
              <strong>
                {money(summary.revenueCents)} / {money(summary.forecastCents)}
              </strong>
              <small>
                Arvestatud tulu võrreldes praeguste õpilasplaanide keskmise
                kuuga.
              </small>
            </div>
            <div className="analytics-forecast__progress">
              <span
                style={{
                  width: `${Math.min(100, Math.max(0, summary.forecastAttainmentPercent || 0))}%`,
                }}
              />
            </div>
            <Badge
              tone={summary.forecastVarianceCents >= 0 ? "success" : "danger"}
            >
              {summary.forecastAttainmentPercent === null
                ? "Prognoos puudub"
                : `${summary.forecastAttainmentPercent}% · ${money(summary.forecastVarianceCents)}`}
            </Badge>
          </section>

          <div className="analytics-columns">
            <section>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    Võlad seisuga {displayDate(snapshot.agedDebt.asOfDate)}
                  </span>
                  <h3>Võlgade vanus</h3>
                </div>
                <strong>{money(snapshot.agedDebt.balanceCents)}</strong>
              </div>
              <div className="aged-debt-buckets">
                {snapshot.agedDebt.buckets.map((bucket) => (
                  <article key={bucket.id}>
                    <small>{bucketLabels[bucket.id]}</small>
                    <strong>{money(bucket.balanceCents)}</strong>
                    <em>{bucket.invoiceCount} arvet</em>
                  </article>
                ))}
              </div>
              {snapshot.agedDebt.rows.length ? (
                <div className="analytics-table-wrap">
                  <table className="analytics-table">
                    <thead>
                      <tr>
                        <th>Arve / maksja</th>
                        <th>Tähtaeg</th>
                        <th>Jääk</th>
                        <th>
                          <span className="sr-only">Ava</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.agedDebt.rows.slice(0, 10).map((row) => (
                        <tr key={row.id}>
                          <td>
                            <strong>{row.number || row.id}</strong>
                            <small>
                              {row.studentName || row.payerName || "Määramata"}
                            </small>
                          </td>
                          <td>
                            {displayDate(row.due)}
                            <small>
                              {row.daysOverdue
                                ? `${row.daysOverdue} p üle`
                                : "tähtaeg ees"}
                            </small>
                          </td>
                          <td>
                            <strong>{money(row.balanceCents)}</strong>
                          </td>
                          <td>
                            <Button
                              variant="secondary"
                              onClick={() => onOpenInvoice(row.id)}
                            >
                              Ava <ArrowRight size={15} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="analytics-empty">
                  Selle kuupäeva seisuga tasumata arveid ei ole.
                </p>
              )}
            </section>

            <section>
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Tulude jaotus</span>
                  <h3>Mis tulu kujundab</h3>
                </div>
                <Select
                  aria-label="Tulude jaotuse mõõde"
                  value={dimension}
                  onChange={(event) => setDimension(event.target.value)}
                >
                  {Object.entries(dimensionLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              {breakdown.length ? (
                <div className="analytics-breakdown">
                  {breakdown.slice(0, 8).map((row) => (
                    <article key={row.label}>
                      <span>
                        <strong>{row.label}</strong>
                        <small>{row.lessonCount} tunnirida</small>
                      </span>
                      <strong>{money(row.amountCents)}</strong>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="analytics-empty">
                  Valitud kuul jaotatavat arvetulu ei ole.
                </p>
              )}
            </section>
          </div>

          <section className="analytics-trend">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Kuue kuu trend</span>
                <h3>Tulu, rahavoog ja marginaal</h3>
              </div>
              <BarChart3 size={22} />
            </div>
            <div className="analytics-table-wrap">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Kuu</th>
                    <th>Arvestatud tulu</th>
                    <th>Raha sisse</th>
                    <th>Kulud</th>
                    <th>Palgakulu</th>
                    <th>Marginaal</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.trend.map((row) => (
                    <tr key={row.month}>
                      <td>
                        <strong>{row.month}</strong>
                      </td>
                      <td>{money(row.revenueCents)}</td>
                      <td>{money(row.cashInflowCents)}</td>
                      <td>{money(row.expenseCents)}</td>
                      <td>{money(row.payrollCents)}</td>
                      <td>
                        <strong>{money(row.marginCents)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <p className="form-hint analytics-method">
            <Landmark size={16} /> Rahavoog ei loe pangaga seotud makset teist
            korda. Marginaal kasutab kinnitatud palgakulu; see ei tähenda
            automaatselt, et palk on juba välja makstud. Kõik summad põhinevad
            serveri read-only projektsioonil.
          </p>
        </>
      ) : (
        <div className="financial-analytics__empty">
          <ReceiptText size={26} />
          <strong>Koosta esimene juhtimisanalüüs</strong>
          <p>Vali kuu. Päring ei muuda ega lukusta ühtegi finantskirjet.</p>
        </div>
      )}
    </Card>
  );
}
