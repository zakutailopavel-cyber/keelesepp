const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html=fs.readFileSync('haldus.html','utf8');
const css=fs.readFileSync('haldus.css','utf8');

test('notification centre projects the existing operational sources',()=>{
  for(const source of ['unreadMessages','newWsResults','scopedTasks','scopedInvoices','parentAlerts','assistantAlerts']){
    assert.match(html,new RegExp(source));
  }
  assert.match(html,/function NotificationCenter/);
  assert.doesNotMatch(html,/collection\('notifications'/);
});

test('notification actions navigate to source workflows',()=>{
  assert.match(html,/studentId:student\?\.id\|\|message\.studentId,targetTab:'students'/);
  assert.match(html,/targetTab:'tasks'/);
  assert.match(html,/targetTab:isAdmin\?'finance':'invoices'/);
  assert.match(html,/goTab\(item\.targetTab\|\|'dashboard'\)/);
});

test('notification centre is responsive and accessible',()=>{
  assert.match(html,/aria-label={`Teavitused:/);
  assert.match(html,/aria-label="Teavitused"/);
  assert.match(css,/\.notification-center-overlay\{/);
  assert.match(css,/@media\(max-width:700px\).*\.notification-center-trigger/);
});
