import { invoiceBalanceCents } from "../students/studentFinance.js";

// column names of bank CSV exports; LHV „Konto väljavõte” (owner 2026-10-15) in Estonian, English and Russian, plus
// generic names. Compared after headerKey(): accents, spaces and punctuation removed.
const HEADER_ALIASES = {
  date: ["date", "kuupäev", "tehingukuupäev", "väärtuspäev", "bookingdate", "valuedate", "дата"],
  amount: ["amount", "summa", "tehingusumma", "credit", "creditamount", "сумма"],
  payerName: [
    "payer", "payername", "maksja", "maksjanimi", "nimi", "sender", "counterparty", "vastaspool", "saajamaksja",
    "maksesaajamaksja", "saaja/maksja nimi", "beneficiary's name", "sender/receiver name", "имя получателя/плательщика",
  ],
  reference: [
    "reference", "paymentreference", "viide", "viitenumber", "selgitus", "makseselgitus", "description", "details",
    "reference number", "ссылочный номер", "пояснение",
  ],
  externalId: [
    "externalid", "transactionid", "archiveid", "arhiveerimistunnus", "tehinguid", "id", "archiving code",
    "архивный признак",
  ],
  direction: ["deebet/kreedit (d/c)", "debit/credit (d/c)", "дебет/кредит (d/c)", "d/c", "deebetkreedit"],
  currency: ["valuuta", "currency", "валюта"],
};

function headerKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

function separatorCount(line, separator) {
  let count = 0;
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '"') {
      if (quoted && line[index + 1] === '"') index += 1;
      else quoted = !quoted;
    } else if (!quoted && line[index] === separator) count += 1;
  }
  return count;
}

function detectSeparator(headerLine) {
  return [";", "\t", ","].sort(
    (left, right) =>
      separatorCount(headerLine, right) - separatorCount(headerLine, left),
  )[0];
}

export function parseDelimitedLine(line, separator) {
  const cells = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === separator && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += character;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function columnIndexes(headers) {
  const normalized = headers.map(headerKey);
  return Object.fromEntries(
    Object.entries(HEADER_ALIASES).map(([field, aliases]) => [
      field,
      normalized.findIndex((header) => aliases.map(headerKey).includes(header)),
    ]),
  );
}

export function parseBankAmount(value) {
  const source = String(value || "").trim();
  if (!source) return null;
  const negative = /^\(.*\)$/.test(source) || /^-/.test(source);
  let normalized = source
    .replace(/[()€A-Za-z]/g, "")
    .replace(/[\s\u00a0]/g, "");
  const comma = normalized.lastIndexOf(",");
  const dot = normalized.lastIndexOf(".");
  if (comma > dot) normalized = normalized.replace(/\./g, "").replace(",", ".");
  else normalized = normalized.replace(/,/g, "");
  normalized = normalized.replace(/^-/, "");
  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return null;
  return negative ? -amount : amount;
}

export function normalizeBankDate(value) {
  const source = String(value || "").trim();
  const iso = source.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const local = source.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (!local) return "";
  return `${local[3]}-${local[2].padStart(2, "0")}-${local[1].padStart(2, "0")}`;
}

export function parseBankStatement(text) {
  const lines = String(text || "")
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2) {
    return {
      rows: [],
      skipped: 0,
      errors: ["Fail ei sisalda pangatehinguid."],
    };
  }
  const separator = detectSeparator(lines[0]);
  const headers = parseDelimitedLine(lines[0], separator);
  const indexes = columnIndexes(headers);
  const referenceIndexes = headers
    .map(headerKey)
    .map((header, index) =>
      HEADER_ALIASES.reference.map(headerKey).includes(header) ? index : -1,
    )
    .filter((index) => index >= 0);
  if (indexes.date < 0 || indexes.amount < 0) {
    return {
      rows: [],
      skipped: 0,
      errors: ["Väljavõttel peavad olema kuupäeva ja summa veerud."],
    };
  }

  const rows = [];
  const errors = [];
  let skipped = 0;
  lines.slice(1).forEach((line, rowIndex) => {
    const cells = parseDelimitedLine(line, separator);
    const paidAt = normalizeBankDate(cells[indexes.date]);
    const amount = parseBankAmount(cells[indexes.amount]);
    // outgoing payments (D) and other currencies are not invoice payments
    const outgoing = indexes.direction >= 0 && /^d/i.test(cells[indexes.direction] || "");
    const foreign = indexes.currency >= 0 && cells[indexes.currency] && !/^eur$/i.test(cells[indexes.currency]);
    if (outgoing || foreign || (amount !== null && amount <= 0)) {
      skipped += 1;
      return;
    }
    if (!paidAt || amount === null) {
      errors.push(
        `Rida ${rowIndex + 2}: kuupäeva või summat ei õnnestunud lugeda.`,
      );
      return;
    }
    rows.push({
      sourceLine: rowIndex + 2,
      paidAt,
      amount,
      amountCents: Math.round(amount * 100),
      payerName: indexes.payerName >= 0 ? cells[indexes.payerName] || "" : "",
      reference: referenceIndexes
        .map((index) => cells[index] || "")
        .filter(Boolean)
        .join(" · "),
      externalId:
        indexes.externalId >= 0 ? cells[indexes.externalId] || "" : "",
    });
  });
  return { rows, skipped, errors };
}

function matchKey(value) {
  return String(value || "")
    .toLocaleLowerCase("et")
    .replace(/[^a-z0-9äöõüšž]/g, "");
}

// „SMIRNOVA JEKATERINA” and „Jekaterina Smirnova”: the same words in another order
function sameWords(left, rightKey) {
  const words = String(left || "").toLocaleLowerCase("et").split(/[^a-z0-9äöõüšž]+/).filter((word) => word.length >= 3);
  return words.length >= 2 && words.every((word) => rightKey.includes(word));
}

export function suggestInvoice(row, invoices) {
  const available = (invoices || []).filter(
    (invoice) => invoiceBalanceCents(invoice) > 0,
  );
  const reference = matchKey(row.reference);
  const payer = matchKey(row.payerName);
  const scored = available
    .map((invoice) => {
      const paymentReference = matchKey(invoice.paymentReference);
      const number = matchKey(
        invoice.num || invoice.number || invoice.invoiceNumber,
      );
      // the payer is the parent or the payer on the card; the explanation often names the child
      const names = [invoice.payerName, invoice.parentName, invoice.studentName].map(matchKey).filter((name) => name.length >= 4);
      const balance = invoiceBalanceCents(invoice);
      let score = 0;
      if (paymentReference && reference.includes(paymentReference))
        score += 120;
      if (number && reference.includes(number)) score += 100;
      if (payer && names.some((name) => payer.includes(name) || name.includes(payer))) score += 35;
      else if (names.some((name) => reference.includes(name))) score += 35;
      else if (payer && names.some((name) => sameWords(row.payerName, name))) score += 35;
      if (row.amountCents === balance) score += 30;
      return { invoice, score };
    })
    .filter((candidate) => candidate.score >= 60)
    .sort((left, right) => right.score - left.score);
  if (!scored.length || scored[0].score === scored[1]?.score) return null;
  return scored[0].invoice;
}

function hashText(value, seed) {
  let hash = seed;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function bankRequestId(row) {
  const signature = [
    row.externalId,
    row.sourceLine,
    row.paidAt,
    row.amountCents,
    row.payerName,
    row.reference,
  ].join("|");
  return `bank_${hashText(signature, 2166136261)}_${hashText(signature, 2246822519)}`;
}

export function prepareBankRows(rows, invoices) {
  return rows.map((row) => {
    const invoice = suggestInvoice(row, invoices);
    const balanceCents = invoice ? invoiceBalanceCents(invoice) : 0;
    return {
      ...row,
      requestId: bankRequestId(row),
      invoiceId: invoice?.id || "",
      studentId: invoice?.studentId || "",
      allocationCents: invoice ? Math.min(row.amountCents, balanceCents) : 0,
      match: invoice ? "automatic" : "manual",
      selected: Boolean(invoice),
      status: "ready",
      error: "",
    };
  });
}
