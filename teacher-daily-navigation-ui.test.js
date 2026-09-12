const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('haldus.html','utf8');

test('staff sidebar leads with daily workflow and keeps every other tool reachable',()=>{
  assert.match(source,/label:'Minu tööpäev'.*daily:true/);
  assert.match(source,/label:'Õpilaste ülesanded'.*daily:true/);
  assert.match(source,/label:'Valmista tund'.*daily:true/);
  assert.match(source,/Kõik muud tööriistad/);
  assert.match(source,/navItems\.filter\(item=>!item\.daily\)/);
});
