(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KeeleSeppCurriculumLessonBindings=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const SCHOOL=Object.freeze({
    key:'est-b1-01:0',topicId:'est-b1-01',lessonIndex:0,
    subject:'Eesti keel',level:'B1',topicName:'Образование и учёба',
    lessonNumber:'Урок 1',lessonGoal:'Школа и обучение: tund, õpetaja, kodutöö, hinne',
    lessonBlueprintId:'est-b1-school-learning-01',title:'Kool ja õppimine',
    curriculumGoalIds:Object.freeze(['EST_B1_SCHOOL_LEARNING_01'])
  });
  function forCurriculumItem(item){
    return item&&item.key===SCHOOL.key&&item.topicId===SCHOOL.topicId
      &&item.lessonIndex===SCHOOL.lessonIndex&&item.subject===SCHOOL.subject
      &&item.level===SCHOOL.level?SCHOOL:null;
  }
  function forBlueprint(id){return id===SCHOOL.lessonBlueprintId?SCHOOL:null;}
  return {SCHOOL,forCurriculumItem,forBlueprint};
});
