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
import { parseBankStatement, payerMemory, prepareBankRows } from "./bankReconciliation.js";
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

const MATCH = {
  sure: { label: "Kindel", tone: "success" },
  likely: { label: "Kinnita soovitus", tone: "warning" },
  manual: { label: "Vali käsitsi", tone: "neutral" },
};

// `payments` (optional): the recorded payments, so the memory of who pays for whom also knows the older statements
export default function BankReconciliationPanel({
  invoices,
  students,
  transactions,
  payments = [],
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
  // the preview: which kind of match is shown, and which row has its choosers open
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState("");

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
              allocations: [],
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
        prepareBankRows(parsed.rows, invoices, payerMemory({ transactions, payments })).map((row) =>
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
  const invoiceLabel = (id) => { const invoice = invoices.find((item) => item.id === id); return invoice ? `${invoice.num || invoice.number || "arve"} · ${invoice.studentName || ""}` : "arve"; };
  const studentName = (id) => students.find((student) => student.id === id)?.name || "õpilane";
  const chosen = rows.filter((row) => row.selected && row.status === "ready");

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
              <span className="bank-import-preview__counts" role="tablist" aria-label="Näita">
                <button type="button" role="tab" aria-selected={filter === "all"} className={filter === "all" ? "is-on" : ""} onClick={() => setFilter("all")}>Kõik {rows.length}</button>
                {["sure", "likely", "manual"].map((kind) => {
                  const count = rows.filter((row) => row.status === "ready" && row.match === kind).length;
                  return count ? <button type="button" role="tab" key={kind} aria-selected={filter === kind} className={`is-${kind} ${filter === kind ? "is-on" : ""}`} onClick={() => setFilter(kind)}>{MATCH[kind].label} {count}</button> : null;
                })}
              </span>
            </div>
            {rows.some((row) => row.status === "ready" && row.match === "likely" && !row.selected) ? (
              <Button variant="secondary" disabled={saving} onClick={() => setRows((current) => current.map((row) => (row.status === "ready" && row.match === "likely" ? { ...row, selected: true } : row)))}>
                Vali kõik soovitused
              </Button>
            ) : null}
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
            <div className="bank-feed" role="list" aria-label="Väljavõtte laekumised">
              {rows.map((row, index) => (filter !== "all" && !(row.status === "ready" && row.match === filter)) ? null : (
                <article
                  role="listitem"
                  key={row.requestId}
                  className={`bank-feed__row is-${row.status === "ready" ? row.match : row.status} ${row.selected ? "is-selected" : ""}`}
                >
                  <label className="bank-feed__check">
                    <input
                      type="checkbox"
                      aria-label={`Lisa makse ${index + 1}`}
                      checked={row.selected}
                      disabled={["saved", "imported"].includes(row.status)}
                      onChange={(event) => setRows((current) => current.map((item, rowIndex) => (rowIndex === index ? { ...item, selected: event.target.checked } : item)))}
                    />
                  </label>
                  <div className="bank-feed__who">
                    <strong>{row.payerName || "Maksja määramata"}</strong>
                    <small>{displayDate(row.paidAt)}{row.reference ? <> · <q>{row.reference}</q></> : " · selgituseta"}</small>
                  </div>
                  <div className="bank-feed__amount">{money(row.amountCents)}</div>
                  <div className="bank-feed__target">
                    {row.allocations?.length > 1 ? (
                      <span className="bank-feed__invoices">{row.allocations.map((item) => <span key={item.invoiceId} className="bank-feed__pill">{item.label || "arve"} · {money(item.amountCents)}</span>)}</span>
                    ) : row.invoiceId ? (
                      <span className="bank-feed__invoices"><span className="bank-feed__pill">{invoiceLabel(row.invoiceId)}</span>{row.allocationCents < row.amountCents ? <span className="bank-feed__pill is-credit">{money(row.amountCents - row.allocationCents)} ettemaksuks</span> : null}</span>
                    ) : row.studentId ? (
                      <span className="bank-feed__invoices"><span className="bank-feed__pill is-credit">Ettemaks · {studentName(row.studentId)}</span></span>
                    ) : (
                      <span className="bank-feed__none">Arvet ei leitud — vali käsitsi</span>
                    )}
                    {row.reason ? <small className="bank-feed__reason">{row.reason}</small> : null}
                  </div>
                  <div className="bank-feed__state">
                    {row.status === "saved" ? <Badge tone="success">Salvestatud</Badge> : null}
                    {row.status === "imported" ? <Badge tone="neutral">Juba imporditud</Badge> : null}
                    {row.status === "ready" ? <Badge tone={(MATCH[row.match] || MATCH.manual).tone}>{(MATCH[row.match] || MATCH.manual).label}</Badge> : null}
                    {row.status === "ready" ? (
                      <button type="button" className="bank-feed__edit" aria-expanded={editing === row.requestId} onClick={() => setEditing(editing === row.requestId ? "" : row.requestId)}>
                        {editing === row.requestId ? "Valmis" : "Muuda"}
                      </button>
                    ) : null}
                  </div>
                  {row.status === "error" ? <small className="bank-row-error">{row.error}</small> : null}
                  <div className="bank-feed__choose" hidden={editing !== row.requestId}>
                    <Select aria-label={`Arve maksele ${index + 1}`} value={row.invoiceId} disabled={["saved", "imported"].includes(row.status)} onChange={(event) => selectInvoice(index, event.target.value)}>
                      <option value="">Ei seo arvega</option>
                      {openInvoices.map((invoice) => (
                        <option value={invoice.id} key={invoice.id}>{invoice.num || invoice.number} · {invoice.studentName} · {money(invoiceBalanceCents(invoice))}</option>
                      ))}
                    </Select>
                    <Select aria-label={`Õpilane maksele ${index + 1}`} value={row.studentId} disabled={["saved", "imported"].includes(row.status)} onChange={(event) => selectStudent(index, event.target.value)}>
                      <option value="">Ettemaks: vali õpilane</option>
                      {students.map((student) => <option value={student.id} key={student.id}>{student.name}</option>)}
                    </Select>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
          {rows.length ? (
            <div className="bank-import-preview__footer">
              <span role="status">{resultMessage || (chosen.length ? `Valitud ${chosen.length} makset · ${money(chosen.reduce((sum, row) => sum + row.amountCents, 0))}` : "Vali maksed, mida siduda")}</span>
              <Button loading={saving} disabled={!chosen.length} onClick={reconcile}>
                <Landmark size={17} /> Seo valitud maksed{chosen.length ? ` (${chosen.length})` : ""}
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
