const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const page=fs.readFileSync('haldus-exercises/index.html','utf8');
const firestore=fs.readFileSync('firestore.rules','utf8');
const storage=fs.readFileSync('storage.rules','utf8');

test('Õppevara exposes a dedicated searchable didactics workspace',()=>{
  assert.match(page,/tab==='didactics'/);
  assert.match(page,/Didaktika raamatukogu/);
  assert.match(page,/Otsi pealkirja, autorit või märksõna/);
  assert.match(page,/Kõik kategooriad/);
  assert.match(page,/Kõik ained/);
  assert.match(page,/Kõik keeled/);
});

test('teachers can batch upload and then maintain book metadata',()=>{
  assert.match(page,/function DidacticsUploadModal/);
  assert.match(page,/multiple accept="\.pdf,\.epub/);
  assert.match(page,/Korraga kuni 50 faili/);
  assert.match(page,/DidacticsLibraryCore\.storagePath/);
  assert.match(page,/function DidacticsEditModal/);
  assert.match(page,/collection\('didacticLibrary'\)/);
  assert.match(page,/sama nime ja suurusega fail on juba kogus/);
  assert.match(page,/Näita veel/);
});

test('didactics records and files are staff-only and size limited',()=>{
  assert.match(firestore,/match \/didacticLibrary\/\{materialId\}/);
  assert.match(firestore,/allow read: if isStaff\(\)/);
  assert.match(firestore,/request\.resource\.data\.uploaderUid == uid\(\)/);
  assert.match(storage,/match \/didactics\/\{staffUid\}\/\{fileName\}/);
  assert.match(storage,/request\.resource\.size <= 100 \* 1024 \* 1024/);
  assert.match(storage,/staffUid == request\.auth\.uid/);
});

test('bulk upload removes an uploaded blob when metadata creation fails',()=>{
  assert.match(page,/catch\(writeError\)\{await ref\.delete\(\)\.catch/);
});
