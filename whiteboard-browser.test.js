const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('./crm-v2/node_modules/jsdom');

const waitFor=async(check,timeout=1500)=>{
  const started=Date.now();
  while(Date.now()-started<timeout){
    const value=check();
    if(value) return value;
    await new Promise(resolve=>setTimeout(resolve,10));
  }
  throw new Error('Timed out waiting for whiteboard state');
};

function createWhiteboardDom(){
  let html=fs.readFileSync('haldus-whiteboard/index.html','utf8');
  const core=fs.readFileSync('whiteboard-core.js','utf8');
  html=html
    .replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs\/[^>]+><\/script>\s*/g,'')
    .replace(/<script src="\/whiteboard-core\.js\?v=[^"]+"><\/script>/,`<script>${core}</script>`);

  const firebaseMock=`
    (function(){
      const rows=new Map(), listeners=[];
      const notify=(type,id,data)=>listeners.forEach(listener=>listener({docChanges:()=>[{type,doc:{id,data:()=>data}}]}));
      const elementsRef={
        doc(id){ return {
          async set(data){ rows.set(id,data); notify(rows.has(id)?'modified':'added',id,data); },
          async delete(){ await new Promise(resolve=>setTimeout(resolve,25)); const previous=rows.get(id); rows.delete(id); notify('removed',id,previous); }
        };},
        onSnapshot(next){ listeners.push(next); queueMicrotask(()=>next({docChanges:()=>Array.from(rows,([id,data])=>({type:'added',doc:{id,data:()=>data}}))})); return ()=>{}; },
        async get(){ return {forEach(callback){ rows.forEach((data,id)=>callback({id,data:()=>data})); }}; }
      };
      const db={collection(name){
        if(name==='users') return {doc(){return {async get(){return {exists:true,data:()=>({role:'admin',displayName:'Test Admin'})};}};}};
        if(name==='securityMigrations') return {doc(){return {async get(){return {exists:true,data:()=>({readEnforced:true})};}};}};
        if(name==='students') return {where(){return this;},async get(){return {docs:[{id:'test-student',data:()=>({name:'Test Student',active:true,teacherUid:'test-admin'})}]};}};
        if(name==='whiteboards') return {doc(){return {collection(){return elementsRef;},async get(){return {exists:false,data:()=>({})};},async set(){}};}};
        throw new Error('Unexpected collection '+name);
      }};
      const auth={onAuthStateChanged(callback){queueMicrotask(()=>callback({uid:'test-admin',email:'admin@example.test',displayName:'Test Admin'}));}};
      const firestore=()=>db;
      firestore.FieldValue={serverTimestamp:()=>({kind:'timestamp'}),increment:value=>({kind:'increment',value})};
      window.firebase={initializeApp(){},auth:()=>auth,firestore};
      window.__wbStore=rows;
    })();
  `;
  html=html.replace('<script>\n(function(){',`<script>${firebaseMock}</script>\n<script>\n(function(){`);

  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://example.test/haldus-whiteboard/?student=test-student'});
  dom.window.confirm=()=>true;
  dom.window.alert=()=>{};
  return dom;
}

function pointer(window,type,x,y){
  return new window.MouseEvent(type,{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0});
}

test('real whiteboard UI saves pen, text and note, exposes palette, and restores an erased stroke',async()=>{
  const dom=createWhiteboardDom();
  const {window}=dom;
  await waitFor(()=>window.document.getElementById('board'));
  await waitFor(()=>window.document.getElementById('save-label')?.textContent==='Salvestatud');
  const board=window.document.getElementById('board');

  window.document.querySelector('[data-tool="pen"]').click();
  board.dispatchEvent(pointer(window,'pointerdown',120,120));
  board.dispatchEvent(pointer(window,'pointermove',140,140));
  board.dispatchEvent(pointer(window,'pointermove',160,150));
  board.dispatchEvent(pointer(window,'pointerup',160,150));
  await waitFor(()=>Array.from(window.__wbStore.values()).some(item=>item.type==='stroke'));
  const strokeEntry=Array.from(window.__wbStore.entries()).find(([,item])=>item.type==='stroke');
  assert.ok(strokeEntry);
  assert.deepEqual(JSON.parse(JSON.stringify(strokeEntry[1].points.map(point=>Object.keys(point).sort()))),[['x','y'],['x','y'],['x','y']]);
  assert.equal(strokeEntry[1].points.some(Array.isArray),false);

  window.document.querySelector('[data-tool="text"]').click();
  board.dispatchEvent(pointer(window,'pointerdown',220,180));
  const textEditor=await waitFor(()=>window.document.querySelector('textarea[aria-label="Tahvli tekst"]'));
  textEditor.value='Tere!';
  textEditor.dispatchEvent(new window.Event('blur'));
  await waitFor(()=>Array.from(window.__wbStore.values()).some(item=>item.type==='text'&&item.text==='Tere!'));

  window.document.querySelector('[data-tool="note"]').click();
  board.dispatchEvent(pointer(window,'pointerdown',260,240));
  const noteEditor=await waitFor(()=>window.document.querySelector('textarea[aria-label="Märkme tekst"]'));
  noteEditor.value='Oluline märkus';
  noteEditor.dispatchEvent(new window.Event('blur'));
  await waitFor(()=>Array.from(window.__wbStore.values()).some(item=>item.type==='note'&&item.text==='Oluline märkus'));
  board.dispatchEvent(pointer(window,'dblclick',270,250));
  const reopenedNote=await waitFor(()=>window.document.querySelector('textarea[aria-label="Märkme tekst"]'));
  assert.equal(reopenedNote.value,'Oluline märkus');
  reopenedNote.value='Muudetud märkus';
  reopenedNote.dispatchEvent(new window.Event('blur'));
  await waitFor(()=>Array.from(window.__wbStore.values()).some(item=>item.type==='note'&&item.text==='Muudetud märkus'));

  window.document.getElementById('btn-color').click();
  const palette=window.document.getElementById('color-pop');
  assert.equal(palette.parentElement,window.document.body);
  assert.equal(palette.style.position,'fixed');

  window.document.querySelector('[data-tool="eraser"]').click();
  board.dispatchEvent(pointer(window,'pointerdown',140,140));
  window.document.getElementById('btn-undo').click();
  await waitFor(()=>window.__wbStore.has(strokeEntry[0]));
  await waitFor(()=>window.document.getElementById('save-label').textContent==='Salvestatud');
  assert.equal(window.__wbStore.get(strokeEntry[0]).type,'stroke');
  assert.equal(window.document.getElementById('save-label').textContent,'Salvestatud');
  dom.window.close();
});
