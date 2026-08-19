const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync('haldus.html','utf8');
const backend=fs.readFileSync('functions/index.js','utf8');

test('v1 exposes expenses with receipts and immutable correction actions',()=>{
  assert.match(html,/function ExpensesView/);
  assert.match(html,/financeApiPost\('\/expenses'/);
  assert.match(html,/financeApiPost\('\/expenses\/correct'/);
  assert.match(html,/financeApiPost\('\/expenses\/void'/);
  assert.match(html,/financial\/expenses\/\$\{expense\.id\}/);
  assert.match(html,/Kulu tühistatud; ajalugu säilib/);
});

test('v1 exposes the reviewed export and financial period close sequence',()=>{
  assert.match(html,/function FinancialPeriodClosurePanel/);
  assert.match(html,/financeApiPost\('\/financial-periods\/preview'/);
  assert.match(html,/financeApiPost\('\/financial-periods\/export'/);
  assert.match(html,/financeApiPost\('\/financial-periods\/close'/);
  assert.match(html,/financeApiPost\('\/financial-periods\/corrections'/);
  assert.match(html,/Suletud perioodi vanu kirjeid ei kirjutata üle/);
});

test('data correction center uses exact protected account and record operations',()=>{
  assert.match(html,/function DataQualityView/);
  assert.match(html,/staffOperationsApiPost\('\/data-quality\/preview'/);
  assert.match(html,/staffOperationsApiPost\('\/data-quality\/relink'/);
  assert.match(html,/staffOperationsApiPost\('\/accounts\/link'/);
  assert.match(html,/staffOperationsApiPost\('\/accounts\/status'/);
  assert.match(html,/mitte nime oletades/);
  assert.match(backend,/if \(req\.path === "\/data-quality\/preview"\)/);
  assert.match(backend,/if \(req\.path === "\/accounts\/link"\)/);
  assert.match(backend,/listFirebaseAuthUsers/);
});

test('tariff controls are hidden while historical pricing data remains untouched',()=>{
  assert.match(html,/\{false&&isAdmin&&\(\s*<CollapsibleCard id="invoice-tariffs"/);
  assert.match(html,/\{false&&isAdmin&&invoiceTargetType==='student'&&selectedInvoiceStudent&&\(/);
  assert.match(backend,/if \(req\.path === "\/tariffs"\)/);
});
