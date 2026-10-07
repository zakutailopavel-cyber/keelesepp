"use strict";

const PDFDocument = require("pdfkit");

function money(value) {
  return (Number(value) || 0).toFixed(2).replace(".", ",");
}

function formatEtDate(value) {
  const iso = String(value || "").slice(0, 10);
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : "—";
}

function invoiceFileName(invoice) {
  const safeNumber = String(invoice?.num || invoice?.number || "invoice")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `arve-${safeNumber || "document"}.pdf`;
}

function invoiceParties(invoice = {}, student = {}) {
  return {
    payerName: invoice.payerName
      || invoice.parentName
      || student.payerName
      || student.companyName
      || student.parentName
      || invoice.studentName
      || student.name
      || "—",
    payerRegCode: invoice.payerRegCode
      || student.payerRegCode
      || student.companyRegCode
      || "",
    payerAddress: invoice.payerAddress
      || invoice.parentAddress
      || student.payerAddress
      || student.address
      || "",
    payerEmail: invoice.payerEmail
      || invoice.parentEmail
      || student.payerEmail
      || student.parentEmail
      || student.contactEmail
      || student.guardianEmail
      || student.email
      || "",
  };
}

function lineAmount(line = {}) {
  if (Number.isInteger(line.amountCents)) return line.amountCents / 100;
  return Number(line.amount) || 0;
}

// Amount in Estonian words for the invoice („Summa tasumiseks”), as in the first KeeleSepp version.
const ONES = ["", "üks", "kaks", "kolm", "neli", "viis", "kuus", "seitse", "kaheksa", "üheksa"];
const TEENS = ["kümme", "üksteist", "kaksteist", "kolmteist", "neliteist", "viisteist", "kuusteist", "seitseteist", "kaheksateist", "üheksateist"];
function underThousand(n) {
  if (n === 0) return "";
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  if (n < 100) return `${ONES[Math.floor(n / 10)]}kümmend${n % 10 ? ` ${ONES[n % 10]}` : ""}`;
  return `${ONES[Math.floor(n / 100)]}sada${n % 100 ? ` ${underThousand(n % 100)}` : ""}`;
}
function etWords(n) {
  const whole = Math.max(0, Math.floor(n));
  if (whole === 0) return "null";
  if (whole < 1000) return underThousand(whole);
  const thousands = Math.floor(whole / 1000);
  const rest = whole % 1000;
  const prefix = thousands === 1 ? "tuhat" : `${etWords(thousands)} tuhat`;
  return rest ? `${prefix} ${underThousand(rest)}` : prefix;
}
function amountInWords(amount) {
  const value = Math.max(0, Number(amount) || 0);
  const cents = Math.round((value - Math.floor(value)) * 100);
  const euros = etWords(value);
  return cents ? `${euros} eurot ja ${cents} senti` : `${euros} eurot`;
}

// quantity / unit / unit price of one line: monthly lines carry quantity + unit price, lesson lines are one lesson,
// a manual charge is one piece
function lineDetails(line = {}) {
  const amount = lineAmount(line);
  const quantity = Number(line.quantity) || 1;
  const unitPrice = Number.isInteger(line.unitPriceCents) ? line.unitPriceCents / 100 : Number(line.unitPrice) || (quantity ? amount / quantity : amount);
  const unit = line.unit || (line.type === "manual_charge" ? "tk" : "tund");
  return { amount, quantity, unitPrice, unit };
}

const quantityText = (value) => String(Math.round(value * 100) / 100).replace(".", ",");

// Invoice layout of the first KeeleSepp version (haldus printInvoice): seller with address and contacts, number /
// date / due / currency table, payer and payment terms, a line table with unit, quantity, price and VAT, the sum in
// words, payment info and signature lines.
function buildInvoicePdf({ invoice, student = {}, paymentDetails = {} }) {
  const invoiceNumber = invoice?.num || invoice?.number;
  if (!invoiceNumber) throw new Error("Invoice number required");
  const parties = invoiceParties(invoice, student);
  const lines = Array.isArray(invoice.lines) && invoice.lines.length
    ? invoice.lines
    : [{ description: invoice.desc || "Keeletunnid", date: invoice.date, amount: invoice.amount, quantity: Number(invoice.lessonCount) || 1, unit: Number(invoice.lessonCount) ? "tund" : "tk" }];
  const correctedIds = new Set(invoice.correctedLessonIds || []);
  const originalAmount = Number(invoice.amount) || 0;
  const creditedAmount = Number(invoice.creditedAmount) || 0;
  const effectiveAmount = Number(invoice.effectiveAmount ?? invoice.amount) || 0;
  const previousNumber = Array.isArray(invoice.previousInvoiceNumbers) ? invoice.previousInvoiceNumbers.at(-1) || "" : "";
  const dueDay = paymentDetails.paymentDueDay || 10;
  const isParentInvoice = invoice.invoiceTargetType === "parent";
  const studentName = invoice.studentName || student.name || "";

  return new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: "A4",
      margins: { top: 46, right: 46, bottom: 46, left: 46 },
      info: { Title: `Arve ${invoiceNumber}`, Author: paymentDetails.company || "KeeleSepp", Subject: `KeeleSepp arve ${invoiceNumber}` },
    });
    const chunks = [];
    document.on("data", chunk => chunks.push(chunk));
    document.on("error", reject);
    document.on("end", () => resolve(Buffer.concat(chunks)));

    const left = document.page.margins.left;
    const width = document.page.width - left - document.page.margins.right;
    const ink = "#111827";
    const muted = "#4B5563";
    const border = "#D1D5DB";

    // seller + number / date table
    const metaWidth = 200;
    const metaLeft = left + width - metaWidth;
    document.fillColor(ink).font("Helvetica-Bold").fontSize(16).text(paymentDetails.company || "KeeleSepp", left, 46, { width: width - metaWidth - 20 });
    document.font("Helvetica").fontSize(8.5).fillColor(muted);
    [
      paymentDetails.regCode ? `Reg. kood: ${paymentDetails.regCode}` : "",
      paymentDetails.address || "",
      paymentDetails.email ? `E-post: ${paymentDetails.email}` : "",
      paymentDetails.phone ? `Tel: ${paymentDetails.phone}` : "",
      paymentDetails.iban ? `${paymentDetails.iban}, ${paymentDetails.bank || ""}${paymentDetails.swift ? `, SWIFT: ${paymentDetails.swift}` : ""}` : "",
    ].filter(Boolean).forEach(value => document.text(value, { width: width - metaWidth - 20 }));
    const metaRows = [["Arve nr.", invoiceNumber], ["Kuupäev", formatEtDate(invoice.date || invoice.createdAt)], ["Tähtaeg", formatEtDate(invoice.due || invoice.dueDate)], ["Valuuta", "EUR"]];
    metaRows.forEach(([label, value], index) => {
      const y = 46 + index * 20;
      document.rect(metaLeft, y, metaWidth / 2, 20).fillAndStroke("#F9FAFB", border);
      document.rect(metaLeft + metaWidth / 2, y, metaWidth / 2, 20).fillAndStroke("#FFFFFF", border);
      document.fillColor(muted).font("Helvetica-Bold").fontSize(8.5).text(label, metaLeft + 7, y + 6);
      document.fillColor(ink).font("Helvetica").fontSize(8.5).text(value, metaLeft + metaWidth / 2 + 7, y + 6);
    });

    let y = 150;
    document.fillColor(ink).font("Helvetica-Bold").fontSize(18).text(`Arve ${invoiceNumber}`, left, y);
    if (previousNumber) document.font("Helvetica-Bold").fontSize(8).fillColor("#B54708").text(`Parandatud · eelmine nr ${previousNumber}`, left, y + 22);
    y += 40;

    // payer + payment terms
    const half = (width - 28) / 2;
    document.fillColor(ink).font("Helvetica-Bold").fontSize(9.5).text("Maksja", left, y).text("Maksetingimused", left + half + 28, y);
    document.font("Helvetica-Bold").fontSize(9).text(parties.payerName, left, y + 16, { width: half });
    document.font("Helvetica").fontSize(8.5).fillColor(muted);
    [
      parties.payerRegCode ? `Reg. kood: ${parties.payerRegCode}` : "",
      parties.payerAddress,
      parties.payerEmail,
      student.phone ? `Tel: ${student.phone}` : "",
    ].filter(Boolean).forEach(value => document.text(value, { width: half }));
    document.text(`Maksetingimus: tasumine kuni ${dueDay}. kuupäevani`, left + half + 28, y + 16, { width: half })
      .text(`Maksetähtaeg: ${formatEtDate(invoice.due || invoice.dueDate)}`, { width: half })
      .text(`Viivis: ${paymentDetails.lateFeePerDay || "0,0%"} päevas`, { width: half })
      .text(`Selgitus: ${invoice.paymentReference || invoiceNumber}`, { width: half });
    y += 84;

    // line table
    const columns = [
      { title: "Nr.", width: 26, align: "center" },
      { title: "Nimetus", width: 0, align: "left" },
      { title: "Ühik", width: 40, align: "center" },
      { title: "Kogus", width: 44, align: "right" },
      { title: "Hind", width: 56, align: "right" },
      { title: "Summa", width: 58, align: "right" },
      { title: "KM", width: 38, align: "right" },
      { title: "Kokku", width: 62, align: "right" },
    ];
    columns[1].width = width - columns.reduce((sum, column) => sum + column.width, 0);
    let x = left;
    columns.forEach((column) => { column.x = x; x += column.width; });
    const drawRow = (values, top, { header = false, height = 22, bold = false, strike = false } = {}) => {
      columns.forEach((column, index) => {
        document.rect(column.x, top, column.width, height).fillAndStroke(header ? "#F3F4F6" : "#FFFFFF", ink);
        document.fillColor(strike ? "#6B7280" : ink).font(header || bold ? "Helvetica-Bold" : "Helvetica").fontSize(header ? 7.5 : 8.5)
          .text(String(values[index] ?? ""), column.x + 4, top + 6, { width: column.width - 8, align: header ? "center" : column.align, strike: strike && index > 3 });
      });
    };
    drawRow(columns.map((column) => column.title), y, { header: true });
    y += 22;
    lines.forEach((line, index) => {
      const corrected = correctedIds.has(line.lessonId);
      const detail = lineDetails(line);
      const name = `${line.description || "Keeletund"}${line.date ? ` (${formatEtDate(line.date)})` : ""}${corrected ? " · krediteeritud" : ""}`;
      const height = Math.max(22, document.font("Helvetica").fontSize(8.5).heightOfString(name, { width: columns[1].width - 8 }) + 12);
      if (y + height > 690) { document.addPage(); y = 46; drawRow(columns.map((column) => column.title), y, { header: true }); y += 22; }
      drawRow([index + 1, name, detail.unit, quantityText(detail.quantity), money(detail.unitPrice), money(detail.amount), "0,00", money(detail.amount)], y, { height, strike: corrected });
      y += height;
    });
    drawRow(["", "", "", "", "", money(originalAmount), "0,00", money(originalAmount)], y, { bold: true });
    y += 22;
    if (creditedAmount > 0) {
      document.fillColor(ink).font("Helvetica").fontSize(9).text(`Kreeditarved: -${money(creditedAmount)} EUR`, left, y + 8, { width, align: "right" });
      y += 18;
    }
    if (y > 640) { document.addPage(); y = 46; }
    y += 14;
    document.fillColor(ink).font("Helvetica-Bold").fontSize(9.5).text(`Summa tasumiseks: ${money(effectiveAmount)} EUR`, left, y);
    document.font("Helvetica").fontSize(9).fillColor(muted).text(amountInWords(effectiveAmount), left, y + 14);
    y += 42;

    // payment info + student
    const boxHeight = 74;
    [[left, "Makseinfo", [`Saaja: ${paymentDetails.company || "KeeleSepp"}`, `IBAN: ${paymentDetails.iban || "—"}`, `Pank: ${paymentDetails.bank || "—"}`, paymentDetails.swift ? `SWIFT: ${paymentDetails.swift}` : ""]],
      [left + half + 28, isParentInvoice ? "Arve saaja" : "Õpilane", [isParentInvoice ? parties.payerName : studentName || parties.payerName, !isParentInvoice && student.subject ? `Õppeaine: ${student.subject}` : ""]],
    ].forEach(([boxLeft, title, rows]) => {
      document.rect(boxLeft, y, half, boxHeight).lineWidth(0.7).strokeColor(border).stroke();
      document.fillColor(ink).font("Helvetica-Bold").fontSize(9).text(title, boxLeft + 10, y + 10);
      document.font("Helvetica").fontSize(8.5).fillColor(muted);
      rows.filter(Boolean).forEach((row, index) => document.text(row, boxLeft + 10, y + 26 + index * 11, { width: half - 20 }));
    });
    y += boxHeight + 46;

    // signatures
    if (y > 760) { document.addPage(); y = 80; }
    [[left, "Väljastas", paymentDetails.issuer ? `Koostaja: ${paymentDetails.issuer}` : ""], [left + half + 28, "Võttis vastu", "Kuupäev"]].forEach(([lineLeft, label, note]) => {
      document.moveTo(lineLeft, y).lineTo(lineLeft + half - 40, y).lineWidth(0.7).strokeColor(ink).stroke();
      document.fillColor(ink).font("Helvetica").fontSize(9).text(label, lineLeft, y + 6);
      if (note) document.fillColor("#6B7280").fontSize(8).text(note, lineLeft, y + 20);
    });

    document.end();
  });
}

module.exports = {
  amountInWords,
  buildInvoicePdf,
  invoiceFileName,
  invoiceParties,
};
