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

  const worksheetLanguage=item=>item?.languageId==='eng'||canonicalSubject(item?.subject)==='Inglise keel'?'eng':'est';
  const worksheetCopy=(language,key,values={})=>{
    const copy={
      est:{
        intro:'Tunni eesmärk',vocabInstruction:'Sobita sõna ja tõlge.',tableInstruction:'Täienda sõnavara tabelit näitelausega.',
        tableHeaders:['Sõna','Tõlge','Näitelause'],writingInstruction:'Kasuta uut sõnavara iseseisvalt.',
        writingTask:`Kirjuta teemal „${values.topic||''}”. Kasuta vähemalt ${values.wordCount||3} aktiivset sõna.`,
        aiExtra:'Koosta metoodiliselt terviklik tööleht. Säilita tunni eesmärk, kasuta aktiivset sõnavara ja lisa selged vastusevõtmed suletud ülesannetele.'
      },
      eng:{
        intro:'Lesson goal',vocabInstruction:'Match each word with its translation.',tableInstruction:'Complete the vocabulary table with an example sentence.',
        tableHeaders:['Word','Translation','Example sentence'],writingInstruction:'Use the new vocabulary independently.',
        writingTask:`Write about “${values.topic||''}”. Use at least ${values.wordCount||3} active words.`,
        aiExtra:'Create a coherent, classroom-ready worksheet in English. Keep the lesson goal, use the active vocabulary, and include clear answer keys for closed tasks.'
      }
    };
    return copy[language]?.[key]||copy.est[key]||'';
  };

  function buildWorksheetPrefill(item){
    if(!item?.topicId) throw new Error('Curriculum item is required');
    const language=worksheetLanguage(item);
    const vocab=(item.vocab||[]).filter(entry=>text(entry?.word)&&text(entry?.translation));
    const pairLimit=item.level==='A1'?5:item.level==='A2'?7:8;
    const pairs=vocab.slice(0,pairLimit).map(entry=>({l:text(entry.word),r:text(entry.translation)}));
    const tableWords=vocab.slice(0,Math.min(6,Math.max(3,vocab.length)));
    const cellData={};
    tableWords.forEach((entry,index)=>{
      cellData[`${index},0`]=text(entry.word);
      cellData[`${index},1`]=text(entry.translation);
    });
    const wordCount=['A1','A2'].includes(item.level)?3:5;
    const writingLines=item.level==='A1'?5:item.level==='A2'?7:10;
    const sourceText=materialDescription(item);
    return {
      sourceType:'curriculum_workspace',
      sourceKey:`curriculum:${item.topicId}:${item.lessonIndex}`,
      openTab:'build',
      curriculum:{
        languageId:item.languageId,
        subject:item.subject,
        level:item.level,
        topicId:item.topicId,
        topicName:item.topicName,
        lessonIndex:Number(item.lessonIndex)||0,
        lessonGoal:item.lessonGoal||'',
        sourceVersion:item.sourceVersion||''
      },
      meta:{
        title:`${item.topicName} — ${item.lessonNumber}`,
        subject:item.subject,
        level:item.level,
        topic:item.topicName,
        name:true,
        score:true,
        date:true
      },
      blocks:[
        {
          type:'text',instruction:'',size:'full',imageUrl:'',imagePos:'top',label:'',bold:true,
          content:`${worksheetCopy(language,'intro')}: ${item.lessonGoal||item.topicName}`
        },
        {
          type:'match',instruction:worksheetCopy(language,'vocabInstruction'),size:'full',imageUrl:'',imagePos:'top',label:'',
          pairs:pairs.length>=2?pairs:[{l:'',r:''},{l:'',r:''}]
        },
        {
          type:'table',instruction:worksheetCopy(language,'tableInstruction'),size:'full',imageUrl:'',imagePos:'top',label:'',
          headers:worksheetCopy(language,'tableHeaders'),rows:Math.max(3,tableWords.length),cellData
        },
        {
          type:'writing',instruction:worksheetCopy(language,'writingInstruction'),size:'full',imageUrl:'',imagePos:'top',label:'',
          task:worksheetCopy(language,'writingTask',{topic:item.topicName,wordCount}),lines:writingLines
        }
      ],
      ai:{
        prompt:`${item.topicName}: ${item.lessonGoal}`,
        lessonType:'kinnistamine',
        phase:'harjutamine',
        blockCount:5,
        extraInstr:worksheetCopy(language,'aiExtra'),
        sourceText
      }
    };
  }

  function analyzeWorksheet(meta={},blocks=[]){
    const list=Array.isArray(blocks)?blocks:[];
    const interactiveTypes=new Set(['fill','choice','writing','match','connect','order','reading','dialogue','image_label','diagram','comic','error_correction','transformation']);
    const hasAnswerKey=list.some(block=>(
      (block.type==='fill'&&/\[[^\]]+\]/.test(text(block.text)))||
      (block.type==='match'&&(block.pairs||[]).some(pair=>text(pair?.l)&&text(pair?.r)))||
      (block.type==='connect'&&(block.pairs||[]).some(pair=>text(pair?.l)&&text(pair?.r)))||
      (['choice','reading'].includes(block.type)&&(block.questions||[]).some(question=>Number.isInteger(question?.correct)))||
      (block.type==='image_label'&&(block.items||[]).some(item=>text(item?.answer)))||
      (block.type==='diagram'&&(block.nodes||[]).some(node=>node?.blank&&text(node?.text)))||
      (block.type==='comic'&&((block.taskMode==='complete'&&(block.panels||[]).some(panel=>panel?.blank!==false&&text(panel?.text)))||(block.taskMode==='order'&&(block.panels||[]).length>1)))||
      (block.type==='error_correction'&&(block.sentences||[]).some(sentence=>text(sentence?.correct)))||
      (block.type==='transformation'&&text(block.example?.to))
    ));
    const checks=[
      {key:'title',label:'Selge pealkiri',ok:Boolean(text(meta.title)&&normalize(meta.title)!=='uus tööleht')},
      {key:'placement',label:'Aine, tase ja teema',ok:Boolean(canonicalSubject(meta.subject)&&text(meta.level)&&text(meta.topic))},
      {key:'structure',label:'Vähemalt 3 sisublokki',ok:list.length>=3},
      {key:'activity',label:'Õpilase aktiivne ülesanne',ok:list.some(block=>interactiveTypes.has(block.type))},
      {key:'answers',label:'Kontrollitav vastusevõti',ok:hasAnswerKey}
    ];
    const passed=checks.filter(check=>check.ok).length;
    return {ready:passed===checks.length,passed,total:checks.length,percent:Math.round(passed/checks.length*100),checks};
  }

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

  function buildStudentJourney(curriculum,student={},lessons=[],homework=[],materials=[]){
    const catalog=catalogForStudent(flattenCurriculum(curriculum),student);
    const lessonRows=(lessons||[]).filter(lesson=>lesson.studentId===student.id&&lesson.curriculumTopicId);
    const completedKeys=new Set(lessonRows
      .filter(lesson=>lesson.status==='Toimunud')
      .map(lesson=>`${lesson.curriculumTopicId}:${Math.max(0,Number(lesson.curriculumLessonIndex)||0)}`));
    const plannedKey=student.curriculumPlan?.topicId
      ?`${student.curriculumPlan.topicId}:${Math.max(0,Number(student.curriculumPlan.lessonIndex)||0)}`
      :'';
    const homeworkByKey=new Map();
    (homework||[]).filter(item=>item.studentId===student.id&&item.curriculumTopicId).forEach(item=>{
      const key=`${item.curriculumTopicId}:${Math.max(0,Number(item.curriculumLessonIndex)||0)}`;
      const rows=homeworkByKey.get(key)||[];
      rows.push(item);
      homeworkByKey.set(key,rows);
    });
    const materialsByKey=new Map();
    (materials||[]).filter(item=>item.curriculumTopicId).forEach(item=>{
      const key=`${item.curriculumTopicId}:${Math.max(0,Number(item.curriculumLessonIndex)||0)}`;
      const rows=materialsByKey.get(key)||[];
      rows.push(item);
      materialsByKey.set(key,rows);
    });
    const doneHomeworkStatuses=new Set(['tehtud','valmis','completed','done']);
    const items=catalog.map(item=>{
      const homeworkRows=homeworkByKey.get(item.key)||[];
      const materialRows=materialsByKey.get(item.key)||[];
      const completed=completedKeys.has(item.key);
      return {
        ...item,
        completed,
        planned:item.key===plannedKey&&!completed,
        homeworkCount:homeworkRows.length,
        pendingHomeworkCount:homeworkRows.filter(row=>!doneHomeworkStatuses.has(normalize(row.status))).length,
        materialCount:materialRows.length,
        worksheetCount:materialRows.filter(row=>row.type==='worksheet'||row.sourceType==='worksheet_builder').length
      };
    });
    const topics=[];
    items.forEach(item=>{
      let topic=topics.find(row=>row.topicId===item.topicId);
      if(!topic){
        topic={topicId:item.topicId,topicName:item.topicName,topicIndex:item.topicIndex,items:[],completedLessons:0,totalLessons:0,percent:0,completed:false,active:false};
        topics.push(topic);
      }
      topic.items.push(item);
      topic.totalLessons+=1;
      if(item.completed) topic.completedLessons+=1;
      if(item.planned) topic.active=true;
    });
    topics.forEach(topic=>{
      topic.percent=topic.totalLessons?Math.round(topic.completedLessons/topic.totalLessons*100):0;
      topic.completed=topic.totalLessons>0&&topic.completedLessons===topic.totalLessons;
    });
    const nextItem=items.find(item=>item.planned)||items.find(item=>!item.completed)||null;
    return {
      subject:items[0]?.subject||canonicalSubject(student.subject),
      level:items[0]?.level||text(student.level),
      valid:items.length>0,
      items,
      topics,
      totalLessons:items.length,
      completedLessons:items.filter(item=>item.completed).length,
      totalTopics:topics.length,
      completedTopics:topics.filter(topic=>topic.completed).length,
      percent:items.length?Math.round(items.filter(item=>item.completed).length/items.length*100):0,
      pendingHomework:items.reduce((sum,item)=>sum+item.pendingHomeworkCount,0),
      materialCount:items.reduce((sum,item)=>sum+item.materialCount,0),
      plannedKey,
      nextItem
    };
  }

  function curriculumKeyFromRecord(record={},materialsById=new Map()){
    const linkedMaterial=text(record.lessonId)?materialsById.get(text(record.lessonId)):null;
    const source=record.curriculumTopicId?record:(linkedMaterial||record);
    const sourceKey=text(source.sourceKey||record.sourceKey);
    const sourceMatch=sourceKey.match(/^curriculum:([^:]+):(\d+)$/);
    const topicId=text(source.curriculumTopicId)||(sourceMatch?.[1]||'');
    if(!topicId)return '';
    const lessonIndex=source.curriculumLessonIndex!==undefined
      ?Math.max(0,Number(source.curriculumLessonIndex)||0)
      :Math.max(0,Number(sourceMatch?.[2])||0);
    return `${topicId}:${lessonIndex}`;
  }

  function buildCurriculumResults(curriculum,student={},assignments=[],materials=[]){
    const catalog=catalogForStudent(flattenCurriculum(curriculum),student);
    const catalogByKey=new Map(catalog.map(item=>[item.key,item]));
    const materialsById=new Map((materials||[]).filter(item=>item?.id).map(item=>[String(item.id),item]));
    const studentRows=(assignments||[]).filter(row=>row.studentId===student.id);
    const linked=[];
    let unmatched=0;
    studentRows.forEach(row=>{
      const key=curriculumKeyFromRecord(row,materialsById);
      const item=catalogByKey.get(key);
      if(!item){
        if(key)unmatched+=1;
        return;
      }
      const scorePct=Number(row.score?.pct);
      const score=Number.isFinite(scorePct)?Math.max(0,Math.min(100,Math.round(scorePct))):null;
      linked.push({
        ...row,
        curriculumKey:key,
        curriculumItem:item,
        scorePct:score,
        done:row.status==='done',
        needsReview:row.status==='done'&&row.seenByTeacher===false,
        errorCount:Array.isArray(row.errorLog)?row.errorLog.length:0,
        needsRetry:row.status==='done'&&((Array.isArray(row.errorLog)&&row.errorLog.length>0)||(score!==null&&score<70))
      });
    });
    linked.sort((a,b)=>String(b.completedAt||b.assignedAt||'').localeCompare(String(a.completedAt||a.assignedAt||'')));
    const completed=linked.filter(row=>row.done);
    const scored=completed.filter(row=>row.scorePct!==null);
    const byKey=new Map();
    linked.forEach(row=>{
      const rows=byKey.get(row.curriculumKey)||[];
      rows.push(row);
      byKey.set(row.curriculumKey,rows);
    });
    const retry=completed.filter(row=>row.needsRetry);
    return {
      valid:catalog.length>0,
      linked,
      recent:linked.slice(0,8),
      byKey,
      assigned:linked.length,
      completed:completed.length,
      pending:linked.filter(row=>!row.done).length,
      needsReview:linked.filter(row=>row.needsReview).length,
      averageScore:scored.length?Math.round(scored.reduce((sum,row)=>sum+row.scorePct,0)/scored.length):null,
      retry,
      unmatched
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
    buildWorksheetPrefill,
    analyzeWorksheet,
    explicitContentLevels,
    validateMaterialLevel,
    calculateProgress,
    buildStudentJourney,
    buildCurriculumResults
  };
});
