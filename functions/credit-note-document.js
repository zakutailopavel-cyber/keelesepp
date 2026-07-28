"use strict";

const PDFDocument = require("pdfkit");

function money(value) {
  const amount = Number(value) || 0;
  return amount.toFixed(2).replace(".", ",");
}

function formatEtDate(value) {
  const iso = String(value || "").slice(0, 10);
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : "—";
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  }[character]));
}

function creditNoteFileName(creditNote) {
  const safeNumber = String(creditNote?.num || "credit-note")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `kreeditarve-${safeNumber || "document"}.pdf`;
}

function documentParties(creditNote, invoice = {}, student = {}) {
  return {
    payerName: creditNote.payerName
      || invoice.payerName
      || invoice.parentName
      || student.payerName
      || student.companyName
      || student.parentName
      || invoice.studentName
      || student.name
      || "—",
    payerRegCode: creditNote.payerRegCode
      || invoice.payerRegCode
      || student.payerRegCode
      || student.companyRegCode
      || "",
    payerAddress: creditNote.payerAddress
      || invoice.payerAddress
      || invoice.parentAddress
      || student.payerAddress
      || student.address
      || "",
    payerEmail: creditNote.payerEmail
      || invoice.payerEmail
      || invoice.parentEmail
      || student.payerEmail
      || student.parentEmail
      || student.contactEmail
      || student.guardianEmail
      || student.email
      || "",
  };
}

function buildCreditNotePdf({
  creditNote,
  invoice = {},
  student = {},
  paymentDetails = {},
}) {
  if (!creditNote?.num) throw new Error("Credit note number required");
  const parties = documentParties(creditNote, invoice, student);
  const amount = Math.abs(Number(creditNote.amount) || 0);
  const effectiveInvoiceAmount = Number(
    creditNote.effectiveInvoiceAmount ?? invoice.effectiveAmount ?? invoice.amount,
  ) || 0;
  const line = Array.isArray(creditNote.lines) ? creditNote.lines[0] || {} : {};
  const description = line.description
    || `Keeletunni parandus (${formatEtDate(creditNote.lessonDate || line.date)})`;

  return new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: "A4",
      margins: { top: 46, right: 46, bottom: 46, left: 46 },
      info: {
        Title: `Kreeditarve ${creditNote.num}`,
        Author: paymentDetails.company || "KeeleSepp",
        Subject: `Arve ${creditNote.invoiceNum || invoice.num || ""} parandus`,
      },
    });
    const chunks = [];
    document.on("data", chunk => chunks.push(chunk));
    document.on("error", reject);
    document.on("end", () => resolve(Buffer.concat(chunks)));

    const pageWidth = document.page.width - document.page.margins.left - document.page.margins.right;
    const left = document.page.margins.left;
    const rightColumn = left + pageWidth - 214;

    document.fillColor("#1C2B3A").font("Helvetica-Bold").fontSize(18)
      .text(paymentDetails.company || "KeeleSepp", left, 46);
    document.font("Helvetica").fontSize(9).fillColor("#42536A");
    [
      paymentDetails.regCode ? `Reg. kood: ${paymentDetails.regCode}` : "",
      paymentDetails.address || "",
      paymentDetails.email || "",
    ].filter(Boolean).forEach(value => document.text(value));

    document.font("Helvetica-Bold").fontSize(24).fillColor("#1C2B3A")
      .text("KREEDITARVE", rightColumn, 46, { width: 214, align: "right" });
    document.font("Helvetica").fontSize(10).fillColor("#42536A")
      .text(`Nr ${creditNote.num}`, rightColumn, 78, { width: 214, align: "right" })
      .text(`Kuupäev ${formatEtDate(creditNote.date)}`, rightColumn, 94, { width: 214, align: "right" })
      .text(`Algne arve ${creditNote.invoiceNum || invoice.num || "—"}`, rightColumn, 110, { width: 214, align: "right" });

    const partyTop = 156;
    document.roundedRect(left, partyTop, pageWidth, 92, 4).lineWidth(0.7).strokeColor("#CBD5E1").stroke();
    document.font("Helvetica-Bold").fontSize(9).fillColor("#64748B")
      .text("KREEDITARVE SAAJA", left + 14, partyTop + 13);
    document.font("Helvetica-Bold").fontSize(12).fillColor("#1C2B3A")
      .text(parties.payerName, left + 14, partyTop + 32, { width: pageWidth - 28 });
    document.font("Helvetica").fontSize(9).fillColor("#42536A");
    const payerDetails = [
      parties.payerRegCode ? `Reg. kood: ${parties.payerRegCode}` : "",
      parties.payerAddress,
      parties.payerEmail,
    ].filter(Boolean).join(" · ");
    document.text(payerDetails || "Saaja kontaktandmed puuduvad", left + 14, partyTop + 51, {
      width: pageWidth - 28,
    });

    const tableTop = 278;
    const columns = [left, left + 34, left + 338, left + 405, left + pageWidth];
    document.rect(left, tableTop, pageWidth, 30).fill("#F1F5F9");
    document.fillColor("#1C2B3A").font("Helvetica-Bold").fontSize(9);
    document.text("Nr", columns[0] + 8, tableTop + 10);
    document.text("Nimetus", columns[1] + 8, tableTop + 10);
    document.text("Kuupäev", columns[2] + 8, tableTop + 10);
    document.text("Summa", columns[3] + 8, tableTop + 10, { width: columns[4] - columns[3] - 16, align: "right" });

    const rowTop = tableTop + 30;
    document.rect(left, rowTop, pageWidth, 56).fillAndStroke("#FFFFFF", "#CBD5E1");
    document.fillColor("#1C2B3A").font("Helvetica").fontSize(9);
    document.text("1", columns[0] + 8, rowTop + 12);
    document.text(description, columns[1] + 8, rowTop + 10, { width: columns[2] - columns[1] - 16 });
    document.text(formatEtDate(creditNote.lessonDate || line.date), columns[2] + 8, rowTop + 12);
    document.font("Helvetica-Bold")
      .text(`-${money(amount)} EUR`, columns[3] + 8, rowTop + 12, {
        width: columns[4] - columns[3] - 16,
        align: "right",
      });

    const summaryTop = rowTop + 76;
    document.font("Helvetica").fontSize(10).fillColor("#42536A")
      .text("Krediteeritud summa", rightColumn - 45, summaryTop, { width: 150, align: "right" });
    document.font("Helvetica-Bold").fontSize(11).fillColor("#1C2B3A")
      .text(`-${money(amount)} EUR`, rightColumn + 110, summaryTop, { width: 104, align: "right" });
    document.font("Helvetica").fontSize(10).fillColor("#42536A")
      .text("Arve uus summa", rightColumn - 45, summaryTop + 22, { width: 150, align: "right" });
    document.font("Helvetica-Bold").fontSize(11).fillColor("#1C2B3A")
      .text(`${money(effectiveInvoiceAmount)} EUR`, rightColumn + 110, summaryTop + 22, { width: 104, align: "right" });

    const reasonTop = summaryTop + 70;
    document.roundedRect(left, reasonTop, pageWidth, 74, 4).fillAndStroke("#F8FAFC", "#CBD5E1");
    document.fillColor("#64748B").font("Helvetica-Bold").fontSize(9)
      .text("PARANDUSE PÕHJUS", left + 14, reasonTop + 13);
    document.fillColor("#1C2B3A").font("Helvetica").fontSize(10)
      .text(creditNote.reason || "—", left + 14, reasonTop + 32, { width: pageWidth - 28 });

    document.fillColor("#42536A").font("Helvetica").fontSize(9)
      .text(
        `Käesolev kreeditarve vähendab arve ${creditNote.invoiceNum || invoice.num || "—"} summat. `
          + "Kreeditarve alusel eraldi makset ei tehta.",
        left,
        reasonTop + 98,
        { width: pageWidth },
      );

    document.moveTo(left, 742).lineTo(left + pageWidth, 742).strokeColor("#CBD5E1").stroke();
    document.fillColor("#64748B").fontSize(8)
      .text(
        `${paymentDetails.company || "KeeleSepp"}`
          + `${paymentDetails.regCode ? ` · ${paymentDetails.regCode}` : ""}`
          + `${paymentDetails.email ? ` · ${paymentDetails.email}` : ""}`,
        left,
        752,
        { width: pageWidth, align: "center" },
      );
    document.end();
  });
}

function composeCreditNoteEmail({
  creditNote,
  invoice = {},
  student = {},
  appBaseUrl = "",
}) {
  const parties = documentParties(creditNote, invoice, student);
  const amount = Math.abs(Number(creditNote.amount) || 0);
  const effectiveInvoiceAmount = Number(
    creditNote.effectiveInvoiceAmount ?? invoice.effectiveAmount ?? invoice.amount,
  ) || 0;
  const invoiceNum = creditNote.invoiceNum || invoice.num || "";
  const subject = `Kreeditarve ${creditNote.num} arve ${invoiceNum} kohta - KeeleSepp`;
  const text = [
    "Tere!",
    "",
    `Saadame Teile kreeditarve ${creditNote.num}, mis parandab arvet ${invoiceNum}.`,
    `Krediteeritud summa: -${money(amount)} EUR`,
    `Arve uus summa: ${money(effectiveInvoiceAmount)} EUR`,
    `Põhjus: ${creditNote.reason || "—"}`,
    "",
    "Kreeditarve PDF on kirjale lisatud.",
    "",
    "Lugupidamisega",
    "KeeleSepp",
  ].join("\n");
  const cabinetLink = appBaseUrl
    ? `<p style="margin-top:18px"><a href="${escapeHtml(appBaseUrl)}" style="display:inline-block;background:#2F5D50;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700">Ava KeeleSepp kabinet</a></p>`
    : "";
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#1C2B3A;line-height:1.5;max-width:640px">
      <h2 style="margin:0 0 12px;color:#1C2B3A">Kreeditarve ${escapeHtml(creditNote.num)}</h2>
      <p>Tere!</p>
      <p>Saadame Teile kreeditarve, mis parandab arvet <strong>${escapeHtml(invoiceNum)}</strong>.</p>
      <table style="border-collapse:collapse;width:100%;margin:16px 0;background:#fff">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Saaja</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(parties.payerName)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Kreeditarve</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(creditNote.num)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Algne arve</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(invoiceNum)}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Krediteeritud summa</td><td style="padding:8px;border:1px solid #e5e7eb">-${escapeHtml(money(amount))} EUR</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Arve uus summa</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(money(effectiveInvoiceAmount))} EUR</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:700">Põhjus</td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(creditNote.reason || "—")}</td></tr>
      </table>
      <p>Kreeditarve PDF on kirjale lisatud. Selle dokumendi alusel eraldi makset ei tehta.</p>
      ${cabinetLink}
      <p style="margin-top:20px">Lugupidamisega<br><strong>KeeleSepp</strong></p>
    </div>`;
  return {
    to: parties.payerEmail,
    subject,
    text,
    html,
  };
}

module.exports = {
  buildCreditNotePdf,
  composeCreditNoteEmail,
  creditNoteFileName,
  documentParties,
};
