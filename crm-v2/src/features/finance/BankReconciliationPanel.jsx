import {
  CheckCircle2,
  CircleAlert,
  FileUp,
  Landmark,
  RefreshCw,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Select,
} from "../../components/ui/index.js";
import { invoiceBalanceCents } from "../students/studentFinance.js";
import { displayDate } from "./finance.js";
import { parseBankStatement, prepareBankRows } from "./bankReconciliation.js";
import "./bankReconciliation.css";

const money = (value) =>
  new Intl.NumberFormat("et-EE", { style: "currency", currency: "EUR" }).format(
    Number(value || 0) / 100,
  );

const transactionStatus = {
  allocated: { label: "Seotud", tone: "success" },
  partially_allocated: { label: "Osaliselt seotud", tone: "info" },
  unapplied: { label: "Ettemaks", tone: "info" },
};

export default function BankReconciliationPanel({
  invoices,
  students,
  transactions,
  onAllocate,
  onReload,
}) {
  const fileInput = useRef(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [skipped, setSkipped] = useState(0);
  const [saving, setSaving] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const totals = useMemo(
    () =>
      (transactions || []).reduce(
        (result, item) => ({
          received: result.received + Number(item.amountCents || 0),
          allocated: result.allocated + Number(item.allocatedAmountCents || 0),
          unapplied: result.unapplied + Number(item.unappliedAmountCents || 0),
        }),
        { received: 0, allocated: 0, unapplied: 0 },
      ),
    [transactions],
  );

  const selectInvoice = (index, invoiceId) => {
    const invoice = invoices.find((item) => item.id === invoiceId);
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              invoiceId,
              studentId: invoice?.studentId || row.studentId || "",
              allocationCents: invoice
                ? Math.min(row.amountCents, invoiceBalanceCents(invoice))
                : 0,
              selected: Boolean(invoiceId || row.studentId),
              match: invoiceId ? "manual" : row.match,
              error: "",
            }
          : row,
      ),
    );
  };

  const selectStudent = (index, studentId) => {
    setRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              studentId,
              selected: Boolean(row.invoiceId || studentId),
              error: "",
            }
          : row,
      ),
    );
  };

  const loadFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResultMessage("");
    try {
      const parsed = parseBankStatement(await file.text());
      const existingIds = new Set((transactions || []).map((item) => item.id));
      setRows(
        prepareBankRows(parsed.rows, invoices).map((row) =>
          existingIds.has(row.requestId)
            ? { ...row, status: "imported", selected: false }
            : row,
        ),
      );
      setParseErrors(parsed.errors);
      setSkipped(parsed.skipped);
    } catch {
      setRows([]);
      setSkipped(0);
      setParseErrors([
        "Faili ei õnnestunud lugeda. Salvesta väljavõte CSV-vormingus.",
      ]);
    } finally {
      event.target.value = "";
    }
  };

  const reconcile = async () => {
    const selectedRows = rows.filter(
      (row) => row.selected && row.status === "ready",
    );
    if (!selectedRows.length) {
      setResultMessage(
        "Vali vähemalt üks makse ja määra sellele arve või ettemaksu õpilane.",
      );
      return;
    }
    setSaving(true);
    setResultMessage("");
    let saved = 0;
    for (const selected of selectedRows) {
      try {
        await onAllocate(selected);
        saved += 1;
        setRows((current) =>
          current.map((row) =>
            row.requestId === selected.requestId
              ? { ...row, status: "saved", selected: false, error: "" }
              : row,
          ),
        );
      } catch (error) {
        setRows((current) =>
          current.map((row) =>
            row.requestId === selected.requestId
              ? {
                  ...row,
                  status: "error",
                  error: error.message || "Makse salvestamine ebaõnnestus.",
                }
              : row,
          ),
        );
      }
    }
    if (saved) await onReload();
    setResultMessage(
      saved === selectedRows.length
        ? `${saved} pangamakset on edukalt seotud.`
        : `${saved}/${selectedRows.length} makset salvestati. Kontrolli veateatega ridu.`,
    );
    setSaving(false);
  };

  const openInvoices = invoices.filter(
    (invoice) => invoiceBalanceCents(invoice) > 0,
  );

  return (
    <Card className="bank-reconciliation">
      <div className="section-heading bank-reconciliation__heading">
        <div>
          <span className="eyebrow">Pangas laekunud raha</span>
          <h2>Pangaväljavõtte võrdlus</h2>
          <p>
            Impordi CSV. KeeleSepp otsib arve viitenumbri, numbri, maksja ja
            summa järgi.
          </p>
        </div>
        <Button variant="secondary" onClick={() => fileInput.current?.click()}>
          <FileUp size={17} /> Impordi CSV
        </Button>
        <input
          ref={fileInput}
          className="sr-only"
          type="file"
          accept=".csv,text/csv,text/plain"
          onChange={loadFile}
        />
      </div>

      <div className="bank-reconciliation__metrics">
        <span>
          <Landmark size={18} /> Laekunud{" "}
          <strong>{money(totals.received)}</strong>
        </span>
        <span>
          <CheckCircle2 size={18} /> Seotud{" "}
          <strong>{money(totals.allocated)}</strong>
        </span>
        <span className={totals.unapplied ? "has-attention" : ""}>
          <CircleAlert size={18} /> Ettemaksuna{" "}
          <strong>{money(totals.unapplied)}</strong>
        </span>
      </div>

      {fileName ? (
        <section className="bank-import-preview">
          <div className="bank-import-preview__title">
            <div>
              <strong>{fileName}</strong>
              <span>
                {rows.length} laekumist
                {skipped ? ` · ${skipped} väljaminekut jäeti vahele` : ""}
              </span>
            </div>
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => fileInput.current?.click()}
            >
              <RefreshCw size={16} /> Vali teine fail
            </Button>
          </div>
          {parseErrors.length ? (
            <div className="action-error" role="alert">
              {parseErrors.slice(0, 4).map((error) => (
                <span key={error}>{error}</span>
              ))}
            </div>
          ) : null}
          {rows.length ? (
            <div className="bank-import-table-wrap">
              <table className="bank-import-table">
                <thead>
                  <tr>
                    <th>Lisa</th>
                    <th>Makse</th>
                    <th>Summa</th>
                    <th>Seo arvega</th>
                    <th>Õpilane / ettemaks</th>
                    <th>Tulemus</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={row.requestId}
                      className={row.status === "error" ? "has-error" : ""}
                    >
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Lisa makse ${index + 1}`}
                          checked={row.selected}
                          disabled={["saved", "imported"].includes(row.status)}
                          onChange={(event) =>
                            setRows((current) =>
                              current.map((item, rowIndex) =>
                                rowIndex === index
                                  ? { ...item, selected: event.target.checked }
                                  : item,
                              ),
                            )
                          }
                        />
                      </td>
                      <td>
                        <strong>{row.payerName || "Maksja määramata"}</strong>
                        <small>
                          {displayDate(row.paidAt)} ·{" "}
                          {row.reference || "Selgitus puudub"}
                        </small>
                      </td>
                      <td>
                        <strong>{money(row.amountCents)}</strong>
                      </td>
                      <td>
                        <Select
                          aria-label={`Arve maksele ${index + 1}`}
                          value={row.invoiceId}
                          disabled={["saved", "imported"].includes(row.status)}
                          onChange={(event) =>
                            selectInvoice(index, event.target.value)
                          }
                        >
                          <option value="">Ei seo arvega</option>
                          {openInvoices.map((invoice) => (
                            <option value={invoice.id} key={invoice.id}>
                              {invoice.num || invoice.number} ·{" "}
                              {invoice.studentName} ·{" "}
                              {money(invoiceBalanceCents(invoice))}
                            </option>
                          ))}
                        </Select>
                        {row.match === "automatic" ? (
                          <small>Leitud automaatselt</small>
                        ) : null}
                      </td>
                      <td>
                        <Select
                          aria-label={`Õpilane maksele ${index + 1}`}
                          value={row.studentId}
                          disabled={["saved", "imported"].includes(row.status)}
                          onChange={(event) =>
                            selectStudent(index, event.target.value)
                          }
                        >
                          <option value="">Vali õpilane</option>
                          {students.map((student) => (
                            <option value={student.id} key={student.id}>
                              {student.name}
                            </option>
                          ))}
                        </Select>
                        {!row.invoiceId && row.studentId ? (
                          <small>Kogu summa läheb ettemaksuks</small>
                        ) : null}
                        {row.invoiceId &&
                        row.allocationCents < row.amountCents ? (
                          <small>
                            {money(row.amountCents - row.allocationCents)} jääb
                            ettemaksuks
                          </small>
                        ) : null}
                      </td>
                      <td>
                        {row.status === "saved" ? (
                          <Badge tone="success">Salvestatud</Badge>
                        ) : null}
                        {row.status === "imported" ? (
                          <Badge tone="neutral">Juba imporditud</Badge>
                        ) : null}
                        {row.status === "ready" ? (
                          <Badge
                            tone={
                              row.match === "automatic" ? "success" : "neutral"
                            }
                          >
                            {row.match === "automatic"
                              ? "Sobivus leitud"
                              : "Kontrolli"}
                          </Badge>
                        ) : null}
                        {row.status === "error" ? (
                          <small className="bank-row-error">{row.error}</small>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {rows.length ? (
            <div className="bank-import-preview__footer">
              <span role="status">{resultMessage}</span>
              <Button loading={saving} onClick={reconcile}>
                <Landmark size={17} /> Seo valitud maksed
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="bank-history">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Viimased toimingud</span>
            <h3>Pangamaksed</h3>
          </div>
          <strong>{transactions.length}</strong>
        </div>
        {transactions.length ? (
          <div className="bank-history__list">
            {transactions.slice(0, 8).map((transaction) => {
              const status =
                transactionStatus[transaction.status] ||
                transactionStatus.unapplied;
              return (
                <article key={transaction.id}>
                  <Landmark size={18} />
                  <span>
                    <strong>
                      {transaction.payerName || "Maksja määramata"}
                    </strong>
                    <small>
                      {displayDate(transaction.paidAt)} ·{" "}
                      {transaction.reference ||
                        transaction.externalId ||
                        "Viide puudub"}
                    </small>
                  </span>
                  <b>{money(transaction.amountCents)}</b>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Pangamakseid ei ole veel imporditud"
            description="Laadi panga CSV-väljavõte ja seo laekumised arvetega."
          />
        )}
      </section>
    </Card>
  );
}
