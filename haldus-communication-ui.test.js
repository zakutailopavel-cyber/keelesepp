const fs=require('fs');
const test=require('node:test');
const assert=require('node:assert/strict');

const haldus=fs.readFileSync('haldus.html','utf8');
const communication=fs.readFileSync('haldus-communication/index.html','utf8');

test('haldus exposes communication hub in daily staff navigation',()=>{
  assert.match(haldus,/id:'communication'.*label:'Kommunikatsioon'.*href:'\/haldus-communication\/'/s);
  assert.match(haldus,/id:'communication'.*daily:true/s);
});

test('communication hub supports stable Meta and internal conversations',()=>{
  assert.match(communication,/function conversationId\(m\)/);
  assert.match(communication,/facebook/);
  assert.match(communication,/instagram/);
  assert.match(communication,/META_URL/);
  assert.match(communication,/\/reply/);
  assert.match(communication,/db\.collection\('messages'\)/);
});
