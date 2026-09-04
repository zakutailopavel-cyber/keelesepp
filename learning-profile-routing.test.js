const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));

const rewriteMap=new Map(config.rewrites.map(item=>[item.source,item.destination]));
const headerMap=new Map(config.headers.map(item=>[item.source,item.headers]));

test('Learning Profile has stable Vercel routes with and without trailing slash',()=>{
  assert.equal(rewriteMap.get('/haldus-learning-profile'),'/haldus-learning-profile/index.html');
  assert.equal(rewriteMap.get('/haldus-learning-profile/'),'/haldus-learning-profile/index.html');
});

test('Learning Profile routes are explicitly served as UTF-8 HTML',()=>{
  for(const route of ['/haldus-learning-profile','/haldus-learning-profile/']){
    const headers=headerMap.get(route)||[];
    assert.ok(headers.some(header=>header.key==='Content-Type'&&header.value==='text/html; charset=utf-8'),route);
  }
});
