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

function buildInvoicePdf({ invoice, student = {}, paymentDetails = {} }) {
  const invoiceNumber = invoice?.num || invoice?.number;
  if (!invoiceNumber) throw new Error("Invoice number required");
  const parties = invoiceParties(invoice, student);
  const lines = Array.isArray(invoice.lines) && invoice.lines.length
    ? invoice.lines
    : [{ description: invoice.desc || "Keeletunnid", date: invoice.date, amount: invoice.amount }];
  const correctedIds = new Set(invoice.correctedLessonIds || []);
  const originalAmount = Number(invoice.amount) || 0;
  const creditedAmount = Number(invoice.creditedAmount) || 0;
  const effectiveAmount = Number(invoice.effectiveAmount ?? invoice.amount) || 0;

  return new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: "A4",
      margins: { top: 46, right: 46, bottom: 46, left: 46 },
      info: {
        Title: `Arve ${invoiceNumber}`,
        Author: paymentDetails.company || "KeeleSepp",
        Subject: `KeeleSepp arve ${invoiceNumber}`,
      },
    });
    const chunks = [];
    document.on("data", chunk => chunks.push(chunk));
    document.on("error", reject);
    document.on("end", () => resolve(Buffer.concat(chunks)));

    const left = document.page.margins.left;
    const width = document.page.width - left - document.page.margins.right;
    const rightColumn = left + width - 214;

    const drawHeader = () => {
      document.fillColor("#1C2B3A").font("Helvetica-Bold").fontSize(18)
        .text(paymentDetails.company || "KeeleSepp", left, 46);
      document.font("Helvetica").fontSize(9).fillColor("#42536A");
      [
        paymentDetails.regCode ? `Reg. kood: ${paymentDetails.regCode}` : "",
        paymentDetails.address || "",
        paymentDetails.email || "",
      ].filter(Boolean).forEach(value => document.text(value));

      document.font("Helvetica-Bold").fontSize(24).fillColor("#1C2B3A")
        .text("ARVE", rightColumn, 46, { width: 214, align: "right" });
      document.font("Helvetica").fontSize(10).fillColor("#42536A")
        .text(`Nr ${invoiceNumber}`, rightColumn, 78, { width: 214, align: "right" })
        .text(`Kuupäev ${formatEtDate(invoice.date || invoice.createdAt)}`, rightColumn, 94, { width: 214, align: "right" })
        .text(`Tähtaeg ${formatEtDate(invoice.due || invoice.dueDate)}`, rightColumn, 110, { width: 214, align: "right" });
    };

    const drawTableHeader = y => {
      const columns = [left, left + 34, left + 330, left + 410, left + width];
      document.rect(left, y, width, 30).fill("#F1F5F9");
      document.fillColor("#1C2B3A").font("Helvetica-Bold").fontSize(9)
        .text("Nr", columns[0] + 8, y + 10)
        .text("Nimetus", columns[1] + 8, y + 10)
        .text("Kuupäev", columns[2] + 8, y + 10)
        .text("Summa", columns[3] + 8, y + 10, { width: columns[4] - columns[3] - 16, align: "right" });
      return columns;
    };

    drawHeader();
    const partyTop = 156;
    document.roundedRect(left, partyTop, width, 92, 4).lineWidth(0.7).strokeColor("#CBD5E1").stroke();
    document.font("Helvetica-Bold").fontSize(9).fillColor("#64748B")
      .text("ARVE SAAJA", left + 14, partyTop + 13);
    document.font("Helvetica-Bold").fontSize(12).fillColor("#1C2B3A")
      .text(parties.payerName, left + 14, partyTop + 32, { width: width - 28 });
    document.font("Helvetica").fontSize(9).fillColor("#42536A");
    const payerDetails = [
      parties.payerRegCode ? `Reg. kood: ${parties.payerRegCode}` : "",
      parties.payerAddress,
      parties.payerEmail,
    ].filter(Boolean).join(" · ");
    document.text(payerDetails || "Saaja kontaktandmed puuduvad", left + 14, partyTop + 51, { width: width - 28 });

    let y = 278;
    let columns = drawTableHeader(y);
    y += 30;
    lines.forEach((line, index) => {
      if (y > 660) {
        document.addPage();
        drawHeader();
        y = 142;
        columns = drawTableHeader(y);
        y += 30;
      }
      const corrected = correctedIds.has(line.lessonId);
      document.rect(left, y, width, 48).fillAndStroke(corrected ? "#F8FAFC" : "#FFFFFF", "#CBD5E1");
      document.fillColor(corrected ? "#64748B" : "#1C2B3A").font("Helvetica").fontSize(9)
        .text(String(index + 1), columns[0] + 8, y + 11)
        .text(
          `${line.description || "Keeletund"}${corrected ? " · krediteeritud" : ""}`,
          columns[1] + 8,
          y + 9,
          { width: columns[2] - columns[1] - 16 },
        )
        .text(formatEtDate(line.date), columns[2] + 8, y + 11);
      document.font(corrected ? "Helvetica" : "Helvetica-Bold")
        .text(`${money(lineAmount(line))} EUR`, columns[3] + 8, y + 11, {
          width: columns[4] - columns[3] - 16,
          align: "right",
          strike: corrected,
        });
      y += 48;
    });

    if (y > 620) {
      document.addPage();
      drawHeader();
      y = 150;
    }
    y += 18;
    const labelX = rightColumn - 45;
    const valueX = rightColumn + 110;
    document.font("Helvetica").fontSize(10).fillColor("#42536A")
      .text("Arve summa", labelX, y, { width: 150, align: "right" });
    document.font("Helvetica-Bold").fontSize(11).fillColor("#1C2B3A")
      .text(`${money(originalAmount)} EUR`, valueX, y, { width: 104, align: "right" });
    if (creditedAmount > 0) {
      y += 22;
      document.font("Helvetica").fontSize(10).fillColor("#42536A")
        .text("Kreeditarved", labelX, y, { width: 150, align: "right" });
      document.font("Helvetica-Bold").fontSize(11).fillColor("#1C2B3A")
        .text(`-${money(creditedAmount)} EUR`, valueX, y, { width: 104, align: "right" });
    }
    y += 24;
    document.font("Helvetica-Bold").fontSize(11).fillColor("#1C2B3A")
      .text("Tasuda", labelX, y, { width: 150, align: "right" })
      .text(`${money(effectiveAmount)} EUR`, valueX, y, { width: 104, align: "right" });

    const paymentTop = Math.min(y + 54, 690);
    document.roundedRect(left, paymentTop, width, 76, 4).fillAndStroke("#F8FAFC", "#CBD5E1");
    document.fillColor("#64748B").font("Helvetica-Bold").fontSize(9)
      .text("MAKSEANDMED", left + 14, paymentTop + 12);
    document.fillColor("#1C2B3A").font("Helvetica").fontSize(9)
      .text(`Saaja: ${paymentDetails.company || "KeeleSepp"}`, left + 14, paymentTop + 29)
      .text(`IBAN: ${paymentDetails.iban || "—"} · ${paymentDetails.bank || ""}`, left + 14, paymentTop + 43)
      .text(`Selgitus: ${invoice.paymentReference || invoiceNumber}`, left + 14, paymentTop + 57);

    document.end();
  });
}

module.exports = {
  buildInvoicePdf,
  invoiceFileName,
  invoiceParties,
};
