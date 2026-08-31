const test=require('node:test');
const assert=require('node:assert/strict');
const curriculum=require('./haldus-curriculum-data');
const workflow=require('./curriculum-workflow-core');

test('curriculum workflow exposes every lesson with stable keys',()=>{
  const catalog=workflow.flattenCurriculum(curriculum);
  assert.equal(catalog.length,158);
  assert.equal(new Set(catalog.map(item=>item.key)).size,158);
  assert.equal(catalog[0].subject,'Eesti keel');
  assert.equal(catalog.at(-1).subject,'Inglise keel');
});

test('material and homework keep exact curriculum ownership',()=>{
  const item=workflow.flattenCurriculum(curriculum)[0];
  const user={uid:'teacher-1',displayName:'Teacher'};
  const material=workflow.buildMaterialRecord(item,user,'2026-08-29T10:00:00.000Z');
  const homework=workflow.buildHomeworkRecord(item,{id:'student-1',name:'Student'},user,'2026-09-01','2026-08-29T10:00:00.000Z');
  assert.equal(material.sourceKey,'curriculum:est-a1-01:0');
  assert.equal(material.curriculumLevel,'A1');
  assert.match(material.description,/Tunni käik:/);
  assert.equal(homework.studentId,'student-1');
  assert.equal(homework.curriculumTopicId,'est-a1-01');
  assert.match(homework.task,/Sõnavara:/);
});

test('student assignment requires the same language subject and CEFR level',()=>{
  const item=workflow.flattenCurriculum(curriculum)[0];
  assert.equal(workflow.validateStudentMatch(item,{id:'student-1',subject:'Eesti keel',level:'A1'}).ok,true);
  const wrongLevel=workflow.validateStudentMatch(item,{id:'student-1',subject:'Eesti keel',level:'B1'});
  assert.equal(wrongLevel.ok,false);
  assert.match(wrongLevel.errors[0],/B1/);
  assert.equal(workflow.catalogForStudent(workflow.flattenCurriculum(curriculum),{subject:'Eesti keel',level:''}).length,0);
});

test('material validation blocks folder and content level mismatches',()=>{
  assert.equal(workflow.validateMaterialLevel({subject:'Eesti keel',level:'A2',curriculumSubject:'Eesti keel',curriculumLevel:'A2',title:'A2 tööleht'}).ok,true);
  const metadataMismatch=workflow.validateMaterialLevel({subject:'Eesti keel',level:'A2',curriculumSubject:'Eesti keel',curriculumLevel:'B1',title:'Materjal'});
  assert.equal(metadataMismatch.ok,false);
  assert.match(metadataMismatch.errors[0],/B1/);
  const contentMismatch=workflow.validateMaterialLevel({subject:'Eesti keel',level:'A2',title:'Materjal',description:'Tase: B1'});
  assert.equal(contentMismatch.ok,false);
  assert.deepEqual(contentMismatch.contentLevels,['B1']);
});

test('student progress is derived from completed linked lessons without migration',()=>{
  const lessons=[
    {status:'Toimunud',curriculumTopicId:'est-a1-01',curriculumLessonIndex:0},
    {status:'Toimunud',curriculumTopicId:'est-a1-01',curriculumLessonIndex:1},
    {status:'Puudus_p',curriculumTopicId:'est-a1-02',curriculumLessonIndex:0}
  ];
  const progress=workflow.calculateProgress(curriculum,{subject:'Eesti keel',level:'A1'},lessons);
  assert.equal(progress.totalLessons,16);
  assert.equal(progress.completedLessons,2);
  assert.equal(progress.completedTopics,1);
  assert.equal(progress.nextItem.topicId,'est-a1-02');
});

test('student journey combines lessons, homework and created materials without changing source records',()=>{
  const student={id:'student-1',subject:'Eesti keel',level:'A1',curriculumPlan:{topicId:'est-a1-02',lessonIndex:0}};
  const lessons=[
    {studentId:'student-1',status:'Toimunud',curriculumTopicId:'est-a1-01',curriculumLessonIndex:0},
    {studentId:'student-1',status:'Toimunud',curriculumTopicId:'est-a1-01',curriculumLessonIndex:1},
    {studentId:'other',status:'Toimunud',curriculumTopicId:'est-a1-02',curriculumLessonIndex:0}
  ];
  const homework=[
    {studentId:'student-1',status:'Ootel',curriculumTopicId:'est-a1-02',curriculumLessonIndex:0},
    {studentId:'student-1',status:'Tehtud',curriculumTopicId:'est-a1-01',curriculumLessonIndex:0}
  ];
  const materials=[
    {type:'material',curriculumTopicId:'est-a1-02',curriculumLessonIndex:0},
    {type:'worksheet',curriculumTopicId:'est-a1-02',curriculumLessonIndex:0}
  ];
  const journey=workflow.buildStudentJourney(curriculum,student,lessons,homework,materials);
  assert.equal(journey.valid,true);
  assert.equal(journey.completedLessons,2);
  assert.equal(journey.completedTopics,1);
  assert.equal(journey.pendingHomework,1);
  assert.equal(journey.materialCount,2);
  assert.equal(journey.nextItem.key,'est-a1-02:0');
  assert.equal(journey.nextItem.planned,true);
  assert.equal(journey.nextItem.pendingHomeworkCount,1);
  assert.equal(journey.nextItem.worksheetCount,1);
});

test('student journey stays unavailable until subject and CEFR level are explicit',()=>{
  const journey=workflow.buildStudentJourney(curriculum,{id:'student-1',subject:'Eesti keel',level:''},[],[],[]);
  assert.equal(journey.valid,false);
  assert.equal(journey.items.length,0);
  assert.equal(journey.nextItem,null);
});

test('manual curriculum credits are append-only events and revocation restores progress',()=>{
  const student={id:'student-1',name:'Student',subject:'Eesti keel',level:'A1'};
  const item=workflow.flattenCurriculum(curriculum)[0];
  const award=workflow.buildCurriculumProgressEvent({action:'credit_awarded',item,student,user:{uid:'teacher-1',displayName:'Teacher'},reason:'Varem läbitud teises koolis',creditId:'credit-1'},'2026-08-31T10:00:00.000Z');
  const active=workflow.buildStudentJourney(curriculum,student,[],[],[],[award]);
  assert.equal(active.completedLessons,1);
  assert.equal(active.manualCreditCount,1);
  assert.equal(active.items[0].completionSource,'manual');
  const revoke=workflow.buildCurriculumProgressEvent({action:'credit_revoked',item,student,user:{uid:'teacher-1',displayName:'Teacher'},reason:'Zачёт внесён ошибочно',creditId:'credit-1'},'2026-08-31T11:00:00.000Z');
  const revoked=workflow.buildStudentJourney(curriculum,student,[],[],[],[award,revoke]);
  assert.equal(revoked.completedLessons,0);
  assert.equal(revoked.manualCreditCount,0);
  assert.equal(revoked.history.length,2);
});

test('curriculum results link explicit and legacy assignments without mixing students',()=>{
  const student={id:'student-1',subject:'Eesti keel',level:'A1'};
  const materials=[
    {id:'material-legacy',sourceKey:'curriculum:est-a1-02:1',curriculumTopicId:'est-a1-02',curriculumLessonIndex:1}
  ];
  const assignments=[
    {id:'done-1',studentId:'student-1',status:'done',score:{pct:80},errorLog:[{type:'fill'}],seenByTeacher:false,curriculumTopicId:'est-a1-01',curriculumLessonIndex:0,completedAt:'2026-08-30T10:00:00.000Z'},
    {id:'legacy-1',studentId:'student-1',status:'new',lessonId:'material-legacy',assignedAt:'2026-08-29T10:00:00.000Z'},
    {id:'other',studentId:'student-2',status:'done',score:{pct:100},curriculumTopicId:'est-a1-01',curriculumLessonIndex:0},
    {id:'wrong-level',studentId:'student-1',status:'done',curriculumTopicId:'est-b1-01',curriculumLessonIndex:0}
  ];
  const results=workflow.buildCurriculumResults(curriculum,student,assignments,materials);
  assert.equal(results.assigned,2);
  assert.equal(results.completed,1);
  assert.equal(results.pending,1);
  assert.equal(results.needsReview,1);
  assert.equal(results.averageScore,80);
  assert.equal(results.retry.length,1);
  assert.equal(results.unmatched,1);
  assert.equal(results.recent[0].id,'done-1');
  assert.equal(results.byKey.get('est-a1-02:1')[0].id,'legacy-1');
});

test('curriculum lesson opens as an editable worksheet starter with exact ownership',()=>{
  const item=workflow.flattenCurriculum(curriculum)[0];
  const prefill=workflow.buildWorksheetPrefill(item);
  assert.equal(prefill.sourceKey,'curriculum:est-a1-01:0');
  assert.equal(prefill.curriculum.topicId,'est-a1-01');
  assert.equal(prefill.meta.subject,'Eesti keel');
  assert.equal(prefill.meta.level,'A1');
  assert.equal(prefill.meta.topic,item.topicName);
  assert.equal(prefill.blocks.length,4);
  assert.equal(prefill.blocks[1].type,'match');
  assert.deepEqual(prefill.blocks[1].pairs[0],{l:item.vocab[0].word,r:item.vocab[0].translation});
  assert.match(prefill.ai.sourceText,/Tunni käik:/);
  assert.equal(prefill.ai.lessonType,'kinnistamine');
});

test('curriculum task studio opens the same lesson in four safe creation modes',()=>{
  const item=workflow.flattenCurriculum(curriculum)[0];
  assert.deepEqual(workflow.TASK_CREATION_MODES.map(mode=>mode.id),['guided','blank','visual','ai']);
  const blank=workflow.buildWorksheetPrefill(item,{creationMode:'blank'});
  assert.equal(blank.creationMode,'blank');
  assert.equal(blank.openTab,'build');
  assert.equal(blank.blocks.length,0);
  const visual=workflow.buildWorksheetPrefill(item,{creationMode:'visual'});
  assert.equal(visual.openTab,'templates');
  assert.equal(visual.templateMode,'visual');
  assert.equal(visual.blocks.length,0);
  const ai=workflow.buildWorksheetPrefill(item,{creationMode:'ai'});
  assert.equal(ai.openTab,'ai');
  assert.equal(ai.blocks.length,0);
  assert.equal(ai.curriculum.topicId,item.topicId);
  assert.match(ai.ai.sourceText,/Tunni käik:/);
});

test('worksheet quality gate detects incomplete work and accepts curriculum starter',()=>{
  const incomplete=workflow.analyzeWorksheet({title:'Uus tööleht',subject:'Eesti keel',level:'A1'},[]);
  assert.equal(incomplete.ready,false);
  assert.ok(incomplete.checks.some(check=>!check.ok));
  const item=workflow.flattenCurriculum(curriculum)[0];
  const prefill=workflow.buildWorksheetPrefill(item);
  const quality=workflow.analyzeWorksheet(prefill.meta,prefill.blocks);
  assert.equal(quality.ready,true);
  assert.equal(quality.percent,100);
});

test('interactive visual blocks satisfy activity and answer-key quality checks',()=>{
  const quality=workflow.analyzeWorksheet({title:'Visuaalne kordamine',subject:'Eesti keel',level:'A2',topic:'Kehaosad'},[
    {type:'image_label',items:[{answer:'pea',x:50,y:20}]},
    {type:'diagram',nodes:[{text:'Tulemus',blank:true}]},
    {type:'comic',taskMode:'order',panels:[{text:'Algus'},{text:'Lõpp'}]}
  ]);
  assert.equal(quality.checks.find(check=>check.key==='activity').ok,true);
  assert.equal(quality.checks.find(check=>check.key==='answers').ok,true);
  assert.equal(quality.ready,true);
});
