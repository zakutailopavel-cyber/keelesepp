// Excel exports of the registers (SpreadsheetML 2003: opens in Excel, LibreOffice and Numbers without a library). The
// columns follow the owner's templates: the Päevaraamat export of the accounting software (a ruled grid: Kanne |
// Kuupäev | Dokument over Konto | Kuupäev | Dokument | Kirjeldus | Deebet | Kreedit, docs/ACCOUNTING.md) and K2ibeandmik_a.xls
// (Konto nr | Konto nimetus | Saldo D/K | Käibed D/K | Saldo D/K).

import { dmy } from './accountingReports.js';

const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (cents) => (cents ? `<Cell ss:StyleID="money"><Data ss:Type="Number">${(cents / 100).toFixed(2)}</Data></Cell>` : '<Cell/>');
const text = (value, style = '') => `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="String">${esc(value)}</Data></Cell>`;
const row = (cells) => `<Row>${cells.join('')}</Row>`;
const borderSide = '<Border ss:Position="POS" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#8C96A3"/>';
const BORDERS = `<Borders>${['Top', 'Bottom', 'Left', 'Right'].map((p) => borderSide.replace('POS', p)).join('')}</Borders>`;
const gText = (value, style = 'g', across = 0) => `<Cell ss:StyleID="${style}"${across ? ` ss:MergeAcross="${across}"` : ''}><Data ss:Type="String">${esc(value)}</Data></Cell>`;
const gNum = (cents, style = 'gMoney') => `<Cell ss:StyleID="${style}"><Data ss:Type="Number">${((cents || 0) / 100).toFixed(2)}</Data></Cell>`;

function workbook(sheets) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="title"><Font ss:Bold="1" ss:Size="14"/></Style>
<Style ss:ID="head"><Font ss:Bold="1"/><Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style>
<Style ss:ID="bold"><Font ss:Bold="1"/></Style>
<Style ss:ID="money"><NumberFormat ss:Format="#,##0.00"/></Style>
<Style ss:ID="g">${BORDERS}<Alignment ss:Vertical="Top" ss:WrapText="1"/></Style>
<Style ss:ID="gMoney">${BORDERS}<Alignment ss:Horizontal="Right" ss:Vertical="Top"/><NumberFormat ss:Format="#,##0.00"/></Style>
<Style ss:ID="gHead">${BORDERS}<Font ss:Bold="1"/><Interior ss:Color="#DCE9F7" ss:Pattern="Solid"/></Style>
<Style ss:ID="gHeadNum">${BORDERS}<Font ss:Bold="1"/><Interior ss:Color="#DCE9F7" ss:Pattern="Solid"/><Alignment ss:Horizontal="Right"/></Style>
<Style ss:ID="gHeadCenter">${BORDERS}<Font ss:Bold="1"/><Interior ss:Color="#DCE9F7" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>
<Style ss:ID="gEntry">${BORDERS}<Font ss:Bold="1"/><Interior ss:Color="#E5E7EB" ss:Pattern="Solid"/></Style>
<Style ss:ID="gTotal">${BORDERS}<Font ss:Bold="1"/><Alignment ss:Horizontal="Right"/><NumberFormat ss:Format="#,##0.00"/></Style>
<Style ss:ID="gBold">${BORDERS}<Font ss:Bold="1"/></Style>
</Styles>
${sheets.map(({ name, columns, rows }) => `<Worksheet ss:Name="${esc(name)}"><Table>${columns.map((w) => `<Column ss:Width="${w}"/>`).join('')}${rows.join('\n')}</Table></Worksheet>`).join('\n')}
</Workbook>`;
}

const periodLabel = ({ from, to }) => `${from || '…'} – ${to || '…'}`;

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const pad = (n) => String(n).padStart(2, '0');
export const stamp = (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

// Päevaraamat (journalReport) as the template's ruled grid, six columns (Konto | Kuupäev | Dokument | Kirjeldus |
// Deebet | Kreedit; no rate or currency, the accountant 2026-10-23), every cell bordered, no blank rows
export function journalWorkbook(report, { company, printedAt = new Date() }) {
  const { filters } = report;
  const out = [
    row([text('Päevaraamat', 'title')]),
    row([text('Periood'), text(`${dmy(filters.from) || '…'} kuni ${dmy(filters.to) || '…'}`)]),
    row([text('Kande kood'), text(filters.code ? `${filters.code} ${filters.codeName}` : 'Kõik')]),
    row([text('Järjestus'), text(filters.sortLabel)]),
    row([gText('Kanne', 'gHead'), gText('Kuupäev', 'gHead'), gText('Dokument', 'gHead'), gText('', 'gHead'), gText('', 'gHead'), gText('', 'gHead')]),
    row([gText('Konto', 'gHead'), gText('Kuupäev', 'gHead'), gText('Dokument', 'gHead'), gText('Kirjeldus', 'gHead'), gText('Deebet', 'gHeadNum'), gText('Kreedit', 'gHeadNum')]),
  ];
  report.entries.forEach((entry) => {
    out.push(row([gText(entry.label, 'gEntry'), gText(dmy(entry.date), 'gEntry'), gText(entry.documentRef, 'gEntry'), gText('', 'gEntry'), gText('', 'gEntry'), gText('', 'gEntry')]));
    entry.lines.forEach((l) => out.push(row([gText(`${l.account} ${l.name}`.trim()), gText(dmy(entry.date)), gText(l.documentRef), gText(l.description), gNum(l.debitCents), gNum(l.creditCents)])));
    out.push(row([gText('', 'g', 3), gNum(entry.debitCents, 'gTotal'), gNum(entry.creditCents, 'gTotal')]));
  });
  out.push(row([gText(`Kokku ${plural(report.entryCount, 'kanne', 'kannet')}`, 'gBold', 3), gNum(report.debitCents, 'gTotal'), gNum(report.creditCents, 'gTotal')]));
  out.push(row([gText(plural(report.lineCount, 'kirje', 'kirjet'), 'gBold', 5)]));
  out.push(row([text(company.name), text(stamp(printedAt)), text(''), text(''), text(`Rg-kood ${company.regCode}`)]));
  return workbook([{ name: 'Päevaraamat', columns: [190, 70, 90, 300, 80, 80], rows: out }]);
}

// Käibeandmik as a ruled grid: Konto | Nimetus | Algsaldo D/K | Käive D/K | Lõppsaldo D/K (two-level header), Kokku
export function trialBalanceWorkbook(balance, { company, period }) {
  const cell = (cents) => (cents ? gNum(cents) : gText(''));
  const six = (r) => [r.opening.debit, r.opening.credit, r.turnover.debit, r.turnover.credit, r.closing.debit, r.closing.credit];
  const out = [
    row([text('Käibeandmik', 'title')]),
    row([text('Periood'), text(`${dmy(period.from) || '…'} kuni ${dmy(period.to) || '…'}`)]),
    row([text('Ettevõte'), text(`${company.name}, Rg-kood ${company.regCode}`)]),
    `<Row><Cell ss:StyleID="gHead" ss:MergeDown="1"><Data ss:Type="String">Konto</Data></Cell><Cell ss:StyleID="gHead" ss:MergeDown="1"><Data ss:Type="String">Nimetus</Data></Cell>${['Algsaldo', 'Käive', 'Lõppsaldo'].map((t) => gText(t, 'gHeadCenter', 1)).join('')}</Row>`,
    `<Row><Cell ss:Index="3" ss:StyleID="gHeadNum"><Data ss:Type="String">Deebet</Data></Cell>${gText('Kreedit', 'gHeadNum')}${gText('Deebet', 'gHeadNum')}${gText('Kreedit', 'gHeadNum')}${gText('Deebet', 'gHeadNum')}${gText('Kreedit', 'gHeadNum')}</Row>`,
    ...balance.rows.map((r) => row([gText(r.code), gText(r.name), ...six(r).map(cell)])),
    row([gText('Kokku', 'gBold', 1), ...six(balance.total).map((v) => gNum(v, 'gTotal'))]),
  ];
  return workbook([{ name: 'Käibeandmik', columns: [60, 260, 85, 85, 85, 85, 85, 85], rows: out }]);
}

export function statementsWorkbook({ sheet, result }, { company, period }) {
  const side = (title, lines, totalCents) => [row([text(title, 'head'), text('', 'head')]), ...lines.map((l) => row([text(l.line), num(l.amountCents)])), row([text(`${title} kokku`, 'bold'), num(totalCents)]), row([])];
  const balanceRows = [
    row([text('Bilanss', 'title')]), row([text(company), text(`Seisuga ${period.to || ''}`)]), row([]),
    ...side('Varad', sheet.assets, sheet.assetsCents),
    ...side('Kohustised', sheet.liabilities, sheet.liabilitiesCents),
    ...side('Omakapital', sheet.equity, sheet.equityCents),
    row([text('Kohustised ja omakapital kokku', 'bold'), num(sheet.liabilitiesCents + sheet.equityCents)]),
  ];
  const resultRows = [
    row([text('Kasumiaruanne', 'title')]), row([text(company), text(`Periood: ${periodLabel(period)}`)]), row([]),
    ...side('Tulud', result.income, result.incomeCents),
    ...side('Kulud', result.expense, result.expenseCents),
    row([text('Aruandeperioodi kasum (kahjum)', 'bold'), num(result.profitCents)]),
  ];
  return workbook([
    { name: 'Bilanss', columns: [320, 100], rows: balanceRows },
    { name: 'Kasumiaruanne', columns: [320, 100], rows: resultRows },
  ]);
}

// Ostuarved: one row per invoice line, like the accountant's Excel (Tarnija | Reg-kood | Arve nr | Kuupäev | Tähtaeg |
// Konto | Kirjeldus | Summa | KM | KM maha | Arve kokku | Tasutud | Olek)
export function purchaseInvoicesWorkbook(invoices, { company, period, accounts = [], statusLabels = {} }) {
  const names = new Map(accounts.map((a) => [String(a.code), a.name]));
  const head = ['Tarnija', 'Reg-kood', 'Arve nr', 'Kuupäev', 'Tähtaeg', 'Konto', 'Kirjeldus', 'Summa', 'KM', 'KM maha', 'Arve kokku', 'Tasutud', 'Olek'];
  const out = [
    row([text('Ostuarved', 'title')]),
    row([text('Periood'), text(`${dmy(period.from) || '…'} kuni ${dmy(period.to) || '…'}`)]),
    row([text('Ettevõte'), text(`${company.name}, Rg-kood ${company.regCode}`)]),
    row(head.map((h, i) => gText(h, i >= 7 && i !== 9 && i < 12 ? 'gHeadNum' : 'gHead'))),
  ];
  invoices.forEach((invoice) => {
    (invoice.lines || []).forEach((l, index) => out.push(row([
      gText(invoice.supplierName), gText(invoice.supplierRegCode || ''), gText(invoice.documentNumber), gText(dmy(invoice.date)), gText(dmy(invoice.dueDate)),
      gText(`${l.account} ${names.get(String(l.account)) || ''}`.trim()), gText(l.description), gNum(l.amountCents), gNum(l.vatCents || 0), gText(l.vatDeductible ? 'jah' : ''),
      index === 0 ? gNum(invoice.totalCents) : gText(''), index === 0 ? gNum(invoice.paidCents || 0) : gText(''), gText(index === 0 ? statusLabels[invoice.status] || invoice.status : ''),
    ])));
  });
  const live = invoices.filter((i) => i.status !== 'voided');
  out.push(row([gText('Kokku', 'gBold', 9), gNum(live.reduce((n, i) => n + (i.totalCents || 0), 0), 'gTotal'), gNum(live.reduce((n, i) => n + (i.paidCents || 0), 0), 'gTotal'), gText('', 'gBold')]));
  return workbook([{ name: 'Ostuarved', columns: [150, 70, 70, 70, 70, 170, 220, 70, 60, 50, 80, 80, 70], rows: out }]);
}

export function suppliersWorkbook(suppliers, { company }) {
  const head = ['Nimi', 'Registrikood', 'KMKR nr', 'Aadress', 'E-post', 'IBAN', 'Vaikekonto', 'Aktiivne'];
  const out = [
    row([text('Tarnijad', 'title')]),
    row([text('Ettevõte'), text(`${company.name}, Rg-kood ${company.regCode}`)]),
    row(head.map((h) => gText(h, 'gHead'))),
    ...suppliers.map((s) => row([gText(s.name), gText(s.regCode), gText(s.vatNumber), gText(s.address), gText(s.email), gText(s.iban), gText(s.defaultAccount), gText(s.active === false ? 'ei' : 'jah')])),
  ];
  return workbook([{ name: 'Tarnijad', columns: [170, 80, 90, 220, 150, 160, 70, 50], rows: out }]);
}

export function downloadWorkbook(xml, fileName) {
  const blob = new globalThis.Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  globalThis.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
