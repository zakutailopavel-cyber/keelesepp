const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const root=__dirname;
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/keelesepp-c1-curriculum.json'),'utf8'));
const modules=manifest.shards.map(url=>JSON.parse(fs.readFileSync(path.join(root,url.replace(/^\//,'')),'utf8')).module);
const lessons=modules.flatMap(module=>module.lessons);

const moduleTitles=[
  'Eneseväljendus, identiteet ja suhted',
  'Kodu, kogukond ja linnakeskkond',
  'Teenused, tarbimine ja raha',
  'Haridus, õppimine ja info',
  'Töö, professionaalne suhtlus ja organisatsioon',
  'Tervis, heaolu ja sotsiaalne toimetulek',
  'Liikuvus, keskkond ja elukeskkonna areng',
  'Kultuur, keel ja meedia',
  'Ühiskond, institutsioonid ja avalik elu',
  'Teadus, tehnoloogia ja tulevik'
];

const grammarTitles=[
  'Sihitis C1-tasemel','Rektsioon ja käändevalik','Sõnajärg ja infostruktuur','Käänete keerukam kasutus',
  'Ajavormid sidusas tekstis','Kõneviisid ja modaalsus','ma- ja da-infinitiiv ning käändelised vormid',
  'Kesksõnad ja lühendatud tarindid','Isikuline, umbisikuline ja passiivne väljendus',
  'Nominalisatsioon ja info tihendamine','Relatiivlaused ja viitamine',
  'Kõrvallausete süsteem ja lausestuse hierarhia','Sidendid ja tekstisisesed seosed',
  'Määruslikud suhted, kaassõnad ja käänded','Kaudne kõne ja refereerimine',
  'Stiilivariandid ja paralleelvormid','Kirjavahemärgid keerukas lauses',
  'Viiteselgus, asesõnad ja tekstiline sidusus','Keeletäpsus ja veaparandus','C1 grammatika tervikpilt'
];

test('C1 curriculum keeps the DOCX course totals and exact module order',()=>{
  assert.equal(manifest.totalHours,240);
  assert.equal(manifest.contactHours,200);
  assert.equal(manifest.independentHours,40);
  assert.equal(modules.length,10);
  assert.deepEqual(modules.map(module=>module.title),moduleTitles);
  assert.ok(modules.every(module=>module.lessons.length===10));
});

test('C1 curriculum has 100 ordered stable lessons and all unique prompts',()=>{
  assert.equal(lessons.length,100);
  assert.deepEqual(lessons.map(lesson=>lesson.number),Array.from({length:100},(_,index)=>index+1));
  assert.equal(new Set(lessons.map(lesson=>lesson.id)).size,100);
  assert.equal(new Set(lessons.map(lesson=>lesson.sourceKey)).size,100);
  assert.equal(new Set(lessons.map(lesson=>lesson.prompt)).size,100);
  for(const lesson of lessons){
    assert.ok(lesson.title);
    assert.ok(lesson.focus);
    assert.ok(lesson.prompt.length>800,`lesson ${lesson.number} prompt`);
    assert.equal(lesson.hours,2);
  }
});

test('grammar is a separate 20-lesson track and each module ends with assessment',()=>{
  const grammar=lessons.filter(lesson=>lesson.kind==='grammar');
  const assessments=lessons.filter(lesson=>lesson.kind==='assessment');
  assert.equal(lessons.filter(lesson=>lesson.kind==='theme').length,70);
  assert.equal(grammar.length,20);
  assert.equal(assessments.length,10);
  assert.deepEqual(grammar.map(lesson=>lesson.title.replace(/^Grammatika:\s*/,'')),grammarTitles);
  assert.deepEqual(assessments.map(lesson=>lesson.number),[10,20,30,40,50,60,70,80,90,100]);
  assert.ok(grammar.every(lesson=>/отдельный грамматический рабочий лист/i.test(lesson.prompt)));
  assert.ok(assessments.every(lesson=>/не объясняй новый материал/i.test(lesson.prompt)));
  assert.ok(assessments.every(lesson=>/отдельный грамматический блок только по уже пройденным/i.test(lesson.prompt)));
});

test('C1 importer reuses curriculumLessons and existing worksheet generator',()=>{
  const importer=fs.readFileSync(path.join(root,'haldus-c1-curriculum/index.html'),'utf8');
  const library=fs.readFileSync(path.join(root,'haldus-exercises/index.html'),'utf8');
  assert.match(importer,/collection\('curriculumLessons'\)/);
  assert.match(importer,/worksheetPrompt:lesson\.prompt/);
  assert.match(importer,/items\.length!==100/);
  assert.match(library,/level!=='C1'/);
  assert.match(library,/roadmapCount>=100/);
  assert.match(library,/\/haldus-c1-curriculum\//);
  assert.match(library,/Kasuta prompti/);
  assert.match(library,/ai:\{prompt:lesson\.worksheetPrompt/);
  assert.match(library,/openTeacherWorkspace\('\/haldus-worksheet\//);
  assert.match(library,/source-prompt/);
  assert.match(library,/240 ak t/);
});
