const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const html=fs.readFileSync(require.resolve('./haldus.html'),'utf8');

test('administrator finance workflows share one sidebar workspace',()=>{
  assert.match(html,/id:'finance',icon:'fa-wallet',label:'Finants'/);
  assert.doesNotMatch(html,/isAdmin\?\[\{id:'reconciliation'/);
  assert.doesNotMatch(html,/isAdmin\?\[\{id:'accounting'/);
});

test('finance workspace exposes the complete administrator workflow',()=>{
  assert.match(html,/function FinanceWorkspaceNav/);
  assert.match(html,/label:'Arved',\s+description:'Koosta, saada ja halda arveid'/);
  assert.match(html,/label:'Maksete sobitamine',\s+description:'Impordi pank ja jaga laekumised'/);
  assert.match(html,/label:'Kulud',\s+description:'Kulud, käibemaks ja tšekid'/);
  assert.match(html,/label:'Raamatupidamine',\s+description:'Kontrolli seoseid ja kinnita kuu'/);
  assert.match(html,/label:'Andmete parandamine',\s+description:'Kontod, duplikaadid ja valed seosed'/);
});

test('legacy administrator finance routes resolve inside the unified workspace',()=>{
  assert.match(html,/const ADMIN_FINANCE_SECTIONS=\['invoices','reconciliation','expenses','accounting','data-quality'\]/);
  assert.match(html,/if\(isAdmin&&ADMIN_FINANCE_SECTIONS\.includes\(t\)\)/);
  assert.match(html,/setFinanceSection\(tab\);\s+setTab\('finance'\)/);
});

test('role boundaries keep teacher and parent invoice views separate',()=>{
  assert.match(html,/tab==='invoices'&&!isStaff&&<ParentInvoicesView/);
  assert.match(html,/tab==='invoices'&&isStaff&&!isAdmin/);
  assert.match(html,/tab==='finance'&&isAdmin&&financeSection==='accounting'/);
  assert.match(html,/tab==='finance'&&isAdmin&&financeSection==='reconciliation'/);
  assert.match(html,/tab==='finance'&&isAdmin&&financeSection==='expenses'/);
  assert.match(html,/tab==='finance'&&isAdmin&&financeSection==='data-quality'/);
});
