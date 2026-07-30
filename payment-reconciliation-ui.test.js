const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync(require.resolve('./haldus.html'),'utf8');

test('payment matching explains the four-step workflow and accepts local files',()=>{
  assert.match(html,/Kuidas see töötab\?/);
  assert.match(html,/Lisa väljavõte/);
  assert.match(html,/Kontrolli ettepanekut/);
  assert.match(html,/Kinnita jaotus/);
  assert.match(html,/Kontrolli kuud/);
  assert.match(html,/accept="\.csv,\.txt,text\/csv,text\/plain"/);
  assert.match(html,/parseStatementDetailed\(rawStatement\)/);
});

test('saved payment totals use authoritative bank transactions',()=>{
  assert.match(html,/const recordedPaymentIds=React\.useMemo/);
  assert.match(html,/recordedPaymentIds\.has\(p\.id\)/);
  assert.match(html,/Makse muutub salvestatuks alles pärast/);
  assert.doesNotMatch(html,/onChange=\{\(\) => toggleVerified\(p\.id\)\}/);
});

test('payment allocation uses explicit confirmation language',()=>{
  assert.match(html,/3\. samm · kinnita jaotus/);
  assert.match(html,/Kinnita ja salvesta/);
  assert.match(html,/Alles selle nupu järel tekib auditeeritud maksekirje/);
});

test('bank import shows a normalized preview instead of requiring raw four-column text',()=>{
  assert.match(html,/Salvesta register ja kontrolli/);
  assert.match(html,/importResult\.formatLabel/);
  assert.match(html,/Näita lähtefaili/);
  assert.match(html,/registrisse salvestatakse kõik/);
  assert.match(html,/Pangamakse/);
  assert.match(html,/Õpilane ja arve/);
});

test('reconciliation exposes an authoritative student payment register',()=>{
  assert.match(html,/studentInvoiceRegister\(\{students,invoices,payments:invoicePayments\}\)/);
  assert.match(html,/Õpilaste maksed/);
  assert.match(html,/Summad pärinevad CRM-i arvetest ja kinnitatud maksekirjetest/);
  assert.match(html,/Kontrolli vana märget/);
});
