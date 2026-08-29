(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.CurriculumWorkflow=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const SUBJECT_BY_LANGUAGE={est:'Eesti keel',eng:'Inglise keel'};

  const text=value=>String(value??'').trim();
  const normalize=value=>text(value).toLocaleLowerCase('et-EE').replace(/\s+/g,' ');
  const canonicalSubject=value=>{
    const normalized=normalize(value);
    if(['eesti keel','estonian','est'].includes(normalized)) return 'Eesti keel';
    if(['inglise keel','english','eng'].includes(normalized)) return 'Inglise keel';
    return text(value);
  };
  const languageIdForSubject=value=>{
    const subject=canonicalSubject(value);
    return subject==='Eesti keel'?'est':subject==='Inglise keel'?'eng':'';
  };

  function flattenCurriculum(curriculum={}){
    const catalog=[];
    (curriculum.languages||[]).forEach(language=>(language.levels||[]).forEach(level=>(level.topics||[]).forEach((topic,topicIndex)=>(topic.lessons||[]).forEach((lesson,lessonIndex)=>{
      catalog.push({
        key:`${topic.id}:${lessonIndex}`,
        sourceVersion:text(curriculum.version),
        sourceLanguage:text(curriculum.sourceLanguage),
        languageId:language.id,
        languageTitle:language.title,
        subject:SUBJECT_BY_LANGUAGE[language.id]||language.title,
        level:level.code,
        levelName:level.name,
        topicId:topic.id,
        topicName:topic.name,
        topicIndex,
        lessonIndex,
        lessonNumber:lesson.number||`Tund ${lessonIndex+1}`,
        lessonGoal:lesson.goal||'',
        steps:Array.isArray(lesson.steps)?lesson.steps:[],
        materials:lesson.materials||'',
        assessment:lesson.assessment||'',
        ageNote:lesson.ageNote||'',
        vocab:Array.isArray(topic.vocab)?topic.vocab:[]
      });
    }))));
    return catalog;
  }

  function catalogForStudent(catalog=[],student={}){
    const subject=canonicalSubject(student.subject||student.curriculumPlan?.subject||'');
    const level=text(student.level||student.curriculumPlan?.level||'').toUpperCase();
    if(!['Eesti keel','Inglise keel'].includes(subject)||!/^[ABC][12]$/.test(level)) return [];
    return (catalog||[]).filter(item=>item.subject===subject&&item.level===level);
  }

  function validateStudentMatch(item,student={}){
    const errors=[];
    if(!student?.id) errors.push('Vali õpilane.');
    const studentSubject=canonicalSubject(student.subject);
    const studentLevel=text(student.level).toUpperCase();
    if(student?.id&&!['Eesti keel','Inglise keel'].includes(studentSubject)){
      errors.push('Õpilase kaardil puudub sobiv keeleõppeaine.');
    }else if(student?.id&&studentSubject!==item?.subject){
      errors.push(`Õpilase aine ${student.subject||'—'} ei vasta õppekava ainele ${item?.subject||'—'}.`);
    }
    if(student?.id&&!/^[ABC][12]$/.test(studentLevel)){
      errors.push('Õpilase kaardil puudub korrektne CEFR-tase.');
    }else if(student?.id&&studentLevel!==text(item?.level).toUpperCase()){
      errors.push(`Õpilase tase ${student.level||'—'} ei vasta õppekava tasemele ${item?.level||'—'}.`);
    }
    return {ok:errors.length===0,errors,studentSubject,studentLevel};
  }

  function buildCurriculumPlan(item,user={},at=new Date().toISOString()){
    if(!item?.topicId) throw new Error('Curriculum item is required');
    return {
      languageId:item.languageId,
      subject:item.subject,
      level:item.level,
      topicId:item.topicId,
      topicName:item.topicName,
      lessonIndex:Number(item.lessonIndex)||0,
      lessonGoal:item.lessonGoal||'',
      assignedAt:at,
      assignedBy:text(user.uid),
      assignedByName:text(user.displayName||user.email)
    };
  }

  const materialDescription=item=>{
    const stepText=(item.steps||[]).map((step,index)=>`${index+1}. ${step.title}${step.duration?` (${step.duration})`:''}\n${(step.content||[]).join('\n')}`).join('\n\n');
    const vocab=(item.vocab||[]).map(word=>`${word.word} — ${word.translation}`).join(', ');
    return [
      `Eesmärk: ${item.lessonGoal}`,
      stepText&&`Tunni käik:\n${stepText}`,
      vocab&&`Aktiivne sõnavara: ${vocab}`,
      item.materials&&`Materjalid: ${item.materials}`,
      item.assessment&&`Hindamine: ${item.assessment}`,
      item.ageNote&&`Kohandamine: ${item.ageNote}`
    ].filter(Boolean).join('\n\n');
  };

  function buildMaterialRecord(item,user={},at=new Date().toISOString()){
    if(!item?.topicId) throw new Error('Curriculum item is required');
    return {
      title:`${item.topicName} — ${item.lessonNumber}`,
      type:'material',
      description:materialDescription(item),
      subject:item.subject,
      level:item.level,
      topic:item.topicName,
      files:[],
      order:item.lessonIndex,
      examPart:null,
      curriculumLanguageId:item.languageId,
      curriculumSubject:item.subject,
      curriculumLevel:item.level,
      curriculumTopicId:item.topicId,
      curriculumTopicName:item.topicName,
      curriculumLessonIndex:item.lessonIndex,
      curriculumLessonGoal:item.lessonGoal,
      curriculumSourceVersion:item.sourceVersion,
      sourceType:'curriculum_workspace',
      sourceKey:`curriculum:${item.topicId}:${item.lessonIndex}`,
      authorUid:text(user.uid),
      authorName:text(user.displayName||user.email),
      createdAt:at.slice(0,10),
      updatedAt:at
    };
  }

  function buildHomeworkRecord(item,student,user={},dueDate='',at=new Date().toISOString()){
    if(!item?.topicId||!student?.id) throw new Error('Curriculum item and student are required');
    const closingStep=(item.steps||[])[(item.steps||[]).length-1];
    const instructions=(closingStep?.content||[]).join(' ');
    const vocabulary=(item.vocab||[]).map(word=>word.word).join(', ');
    return {
      studentId:student.id,
      studentName:text(student.name),
      task:[`${item.topicName} — ${item.lessonNumber}`,instructions,vocabulary&&`Sõnavara: ${vocabulary}`].filter(Boolean).join('\n'),
      due:text(dueDate),
      status:'Ootel',
      date:at.slice(0,10),
      fileUrl:'',
      fileName:'',
      attachments:[],
      sourceType:'curriculum_workspace',
      sourceKey:`curriculum:${item.topicId}:${item.lessonIndex}`,
      curriculumLanguageId:item.languageId,
      curriculumSubject:item.subject,
      curriculumLevel:item.level,
      curriculumTopicId:item.topicId,
      curriculumTopicName:item.topicName,
      curriculumLessonIndex:item.lessonIndex,
      assignedBy:text(user.uid),
      assignedByName:text(user.displayName||user.email),
      createdAt:at
    };
  }

  function explicitContentLevels(value){
    const source=text(value).toUpperCase();
    const levels=new Set();
    const marker=/(?:TASE|LEVEL|УРОВЕНЬ)\s*[:\-–—]?\s*([ABC][12])/g;
    let match;
    while((match=marker.exec(source))) levels.add(match[1]);
    const heading=source.match(/^\s*([ABC][12])(?:\s|[-–—:])/);
    if(heading) levels.add(heading[1]);
    return [...levels];
  }

  function validateMaterialLevel(record={}){
    const errors=[];
    const warnings=[];
    const subject=canonicalSubject(record.subject);
    const level=text(record.level).toUpperCase();
    if(!/^[ABC][12]$/.test(level)&&subject!=='Matemaatika') warnings.push('Materjali tase ei ole CEFR-vormingus.');
    if(record.curriculumSubject&&canonicalSubject(record.curriculumSubject)!==subject){
      errors.push(`Õppekava aine ${record.curriculumSubject} ei vasta kausta ainele ${record.subject}.`);
    }
    if(record.curriculumLevel&&text(record.curriculumLevel).toUpperCase()!==level){
      errors.push(`Õppekava tase ${record.curriculumLevel} ei vasta kausta tasemele ${record.level}.`);
    }
    const contentLevels=explicitContentLevels(`${record.title||''}\n${record.description||''}`);
    const conflicting=contentLevels.filter(contentLevel=>contentLevel!==level);
    if(conflicting.length){
      errors.push(`Sisu märgib taset ${conflicting.join(', ')}, kuid materjal asub tasemel ${record.level||'—'}.`);
    }
    if(record.curriculumTopicId&&!record.curriculumTopicName) warnings.push('Õppekava teemal puudub nähtav nimi.');
    return {ok:errors.length===0,errors,warnings,contentLevels};
  }

  function calculateProgress(curriculum,student={},lessons=[]){
    const catalog=catalogForStudent(flattenCurriculum(curriculum),student);
    const completedLessons=(lessons||[]).filter(lesson=>lesson.status==='Toimunud'&&lesson.curriculumTopicId);
    const completedKeys=new Set(completedLessons.map(lesson=>`${lesson.curriculumTopicId}:${Math.max(0,Number(lesson.curriculumLessonIndex)||0)}`));
    const completedTopicIds=new Set();
    const topics=[...new Set(catalog.map(item=>item.topicId))];
    topics.forEach(topicId=>{
      const topicItems=catalog.filter(item=>item.topicId===topicId);
      if(topicItems.length&&topicItems.every(item=>completedKeys.has(item.key))) completedTopicIds.add(topicId);
    });
    const plannedKey=student.curriculumPlan?.topicId
      ?`${student.curriculumPlan.topicId}:${Math.max(0,Number(student.curriculumPlan.lessonIndex)||0)}`
      :'';
    const nextItem=catalog.find(item=>item.key===plannedKey&&!completedKeys.has(item.key))
      ||catalog.find(item=>!completedKeys.has(item.key))
      ||null;
    const completedCount=catalog.filter(item=>completedKeys.has(item.key)).length;
    return {
      subject:catalog[0]?.subject||canonicalSubject(student.subject),
      level:catalog[0]?.level||text(student.level),
      totalLessons:catalog.length,
      completedLessons:completedCount,
      totalTopics:topics.length,
      completedTopics:completedTopicIds.size,
      percent:catalog.length?Math.round(completedCount/catalog.length*100):0,
      nextItem
    };
  }

  return {
    SUBJECT_BY_LANGUAGE,
    canonicalSubject,
    languageIdForSubject,
    flattenCurriculum,
    catalogForStudent,
    validateStudentMatch,
    buildCurriculumPlan,
    buildMaterialRecord,
    buildHomeworkRecord,
    explicitContentLevels,
    validateMaterialLevel,
    calculateProgress
  };
});
