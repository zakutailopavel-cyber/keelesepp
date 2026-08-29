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
