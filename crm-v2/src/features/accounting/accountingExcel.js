// Excel exports of the registers (SpreadsheetML 2003: opens in Excel, LibreOffice and Numbers without a library). The
// columns follow the owner's templates: P2evaraamat.xls (Järjekorra nr | Kontode nimetus ja operatsiooni sisu | Konto
// number | Summa: Deebet, Kreedit) and K2ibeandmik_a.xls (Konto nr | Konto nimetus | Saldo D/K | Käibed D/K | Saldo D/K).

const esc = (value) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const num = (cents) => (cents ? `<Cell ss:StyleID="money"><Data ss:Type="Number">${(cents / 100).toFixed(2)}</Data></Cell>` : '<Cell/>');
const text = (value, style = '') => `<Cell${style ? ` ss:StyleID="${style}"` : ''}><Data ss:Type="String">${esc(value)}</Data></Cell>`;
const row = (cells) => `<Row>${cells.join('')}</Row>`;

function workbook(sheets) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="title"><Font ss:Bold="1" ss:Size="14"/></Style>
<Style ss:ID="head"><Font ss:Bold="1"/><Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/></Style>
<Style ss:ID="bold"><Font ss:Bold="1"/></Style>
<Style ss:ID="money"><NumberFormat ss:Format="#,##0.00"/></Style>
</Styles>
${sheets.map(({ name, columns, rows }) => `<Worksheet ss:Name="${esc(name)}"><Table>${columns.map((w) => `<Column ss:Width="${w}"/>`).join('')}${rows.join('\n')}</Table></Worksheet>`).join('\n')}
</Workbook>`;
}

const periodLabel = ({ from, to }) => `${from || '…'} – ${to || '…'}`;

export function journalWorkbook(rows, { company, period }) {
  const out = [
    row([text('Päevaraamat', 'title')]),
    row([text(company), text(`Periood: ${periodLabel(period)}`)]),
    row([]),
    row([text('Järjekorra nr', 'head'), text('Kuupäev', 'head'), text('Kontode nimetus ja operatsiooni sisu', 'head'), text('Konto number', 'head'), text('Deebet', 'head'), text('Kreedit', 'head'), text('Algdokument', 'head')]),
  ];
  let debit = 0;
  let credit = 0;
  rows.forEach((entry) => {
    out.push(row([text(entry.number, 'bold'), text(entry.date, 'bold'), text(entry.description, 'bold'), text(''), text(''), text(''), text(entry.documentRef)]));
    entry.lines.forEach((l) => {
      debit += l.debitCents || 0;
      credit += l.creditCents || 0;
      out.push(row([text(''), text(''), text(`${l.name}${l.note ? ` · ${l.note}` : ''}`), text(l.account), num(l.debitCents), num(l.creditCents), text('')]));
    });
  });
  out.push(row([text(''), text(''), text('Kokku', 'bold'), text(''), num(debit), num(credit), text('')]));
  return workbook([{ name: 'Päevaraamat', columns: [70, 70, 320, 70, 80, 80, 140], rows: out }]);
}

export function trialBalanceWorkbook(balance, { company, period }) {
  const out = [
    row([text('Käibeandmik', 'title')]),
    row([text(company), text(`Periood: ${periodLabel(period)}`)]),
    row([]),
    row([text('Konto nr', 'head'), text('Konto nimetus', 'head'), text('Algsaldo deebet', 'head'), text('Algsaldo kreedit', 'head'), text('Käive deebet', 'head'), text('Käive kreedit', 'head'), text('Lõppsaldo deebet', 'head'), text('Lõppsaldo kreedit', 'head')]),
    ...balance.rows.map((r) => row([text(r.code), text(r.name), num(r.opening.debit), num(r.opening.credit), num(r.turnover.debit), num(r.turnover.credit), num(r.closing.debit), num(r.closing.credit)])),
    row([text(''), text('Kokku', 'bold'), num(balance.total.opening.debit), num(balance.total.opening.credit), num(balance.total.turnover.debit), num(balance.total.turnover.credit), num(balance.total.closing.debit), num(balance.total.closing.credit)]),
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
