(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.WorksheetWorkflow=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const text=value=>String(value??'').trim();
  const clone=value=>JSON.parse(JSON.stringify(value));
  const STATUSES={
    draft:{label:'Mustand',description:'Ainult õpetajale nähtav tööversioon.'},
    reviewed:{label:'Kontrollitud',description:'Sisu on üle vaadatud, kuid pole veel õpilastele avaldatud.'},
    published:{label:'Avaldatud',description:'Valmis õpilastele määramiseks.'}
  };

  const copyFor=subject=>subject==='Inglise keel'?{
    goal:'Lesson goal',vocabulary:'Vocabulary practice',grammar:'Grammar practice',reading:'Reading comprehension',review:'Review and check',communication:'Communication',
    match:'Match each word with its meaning.',table:'Add an example sentence for each word.',write:'Use the target language in your own sentences.',
    fill:'Complete each sentence with the correct form.',transform:'Rewrite the sentences following the example.',read:'Read the text and answer the questions.',
    choose:'Choose the correct answer.',dialogue:'Complete the dialogue and practise it with a partner.',reflect:'Write a short answer using the lesson vocabulary.'
  }:{
    goal:'Tunni eesmärk',vocabulary:'Sõnavara harjutus',grammar:'Grammatika harjutus',reading:'Lugemisülesanne',review:'Kordamine ja kontroll',communication:'Suhtlusülesanne',
    match:'Sobita sõna ja tähendus.',table:'Lisa iga sõna juurde näitelause.',write:'Kasuta õpitavat keelt oma lausetes.',
    fill:'Täida lüngad õige vormiga.',transform:'Muuda lauseid näidise järgi.',read:'Loe tekst läbi ja vasta küsimustele.',
    choose:'Vali õige vastus.',dialogue:'Täienda dialoogi ja harjuta seda paarilisega.',reflect:'Kirjuta lühike vastus, kasutades tunni sõnavara.'
  };

  const TEMPLATES=[
    {id:'vocabulary',icon:'fa-spell-check',titleEt:'Sõnavara kinnistamine',titleEn:'Vocabulary practice',description:'Sobitamine, sõnavaratabel ja iseseisev kasutamine.',types:['match','table','writing']},
    {id:'grammar',icon:'fa-pen-ruler',titleEt:'Grammatika kinnistamine',titleEn:'Grammar practice',description:'Reegel, lüngad ja lausete muutmine.',types:['text','fill','transformation']},
    {id:'reading',icon:'fa-book-open-reader',titleEt:'Lugemine ja mõistmine',titleEn:'Reading comprehension',description:'Lugemistekst, kontrollküsimused ja avatud vastus.',types:['reading','writing']},
    {id:'review',icon:'fa-list-check',titleEt:'Kordamine ja kontroll',titleEn:'Review and check',description:'Mitut oskust ühendav kontrollitav tööleht.',types:['match','fill','choice','writing']},
    {id:'communication',icon:'fa-comments',titleEt:'Suhtlus ja dialoog',titleEn:'Communication and dialogue',description:'Dialoog, valikülesanne ja isiklik vastus.',types:['dialogue','choice','writing']}
  ];

  const baseBlock=(type,instruction)=>({type,instruction,size:'full',imageUrl:'',imagePos:'top',label:''});
  function buildTemplate(templateId,options={}){
    const subject=text(options.subject)||'Eesti keel';
    const level=text(options.level)||'B1';
    const topic=text(options.topic)||'Teema';
    const c=copyFor(subject);
    const english=subject==='Inglise keel';
    const words=english?[['word','meaning'],['example','sample'],['question','answer'],['learn','study']]:[['sõna','tähendus'],['näide','eeskuju'],['küsimus','vastus'],['õppima','teadmisi omandama']];
    const writingLines=['A1','A2'].includes(level)?5:8;
    const common={templateId,subject,level,topic};
    let title='';let blocks=[];
    if(templateId==='vocabulary'){
      title=`${c.vocabulary}: ${topic}`;
      blocks=[
        {...baseBlock('match',c.match),pairs:words.map(([l,r])=>({l,r}))},
        {...baseBlock('table',c.table),headers:english?['Word','Meaning','Example sentence']:['Sõna','Tähendus','Näitelause'],rows:4,cellData:Object.fromEntries(words.flatMap(([word,meaning],i)=>[[`${i},0`,word],[`${i},1`,meaning]]))},
        {...baseBlock('writing',c.write),task:english?`Write ${level==='A1'?'3':'5'} sentences about “${topic}”.`:`Kirjuta teemal „${topic}” ${level==='A1'?'3':'5'} lauset.`,lines:writingLines}
      ];
    }else if(templateId==='grammar'){
      title=`${c.grammar}: ${topic}`;
      blocks=[
        {...baseBlock('text',''),content:`${c.goal}: ${topic}`,bold:true},
        {...baseBlock('fill',c.fill),text:english?'I [study] every day. Yesterday I [studied] at home.':'Ma [õpin] iga päev. Eile ma [õppisin] kodus.'},
        {...baseBlock('transformation',c.transform),example:english?{from:'I study at home.',to:'I do not study at home.'}:{from:'Ma õpin kodus.',to:'Ma ei õpi kodus.'},sentences:english?['She works at school.','We live in Tallinn.','They speak English.']:['Ta töötab koolis.','Me elame Tallinnas.','Nad räägivad eesti keelt.']}
      ];
    }else if(templateId==='reading'){
      title=`${c.reading}: ${topic}`;
      blocks=[
        {...baseBlock('reading',c.read),passage:english?`Add a level-appropriate text about “${topic}” here.`:`Lisa siia tasemekohane tekst teemal „${topic}”.`,questions:[{q:english?'What is the main idea of the text?':'Mis on teksti põhiidee?',opts:english?['Answer A','Answer B','Answer C','Answer D']:['Vastus A','Vastus B','Vastus C','Vastus D'],correct:0},{q:english?'Which statement is true?':'Milline väide on õige?',opts:english?['Statement A','Statement B','Statement C','Statement D']:['Väide A','Väide B','Väide C','Väide D'],correct:0}]},
        {...baseBlock('writing',c.reflect),task:english?`What did you learn about “${topic}”?`:`Mida said teada teema „${topic}” kohta?`,lines:writingLines}
      ];
    }else if(templateId==='review'){
      title=`${c.review}: ${topic}`;
      blocks=[
        {...baseBlock('match',c.match),pairs:words.map(([l,r])=>({l,r}))},
        {...baseBlock('fill',c.fill),text:english?'Today I [learn] new words and [use] them in sentences.':'Täna ma [õpin] uusi sõnu ja [kasutan] neid lausetes.'},
        {...baseBlock('choice',c.choose),questions:[{q:english?'Choose the sentence that fits the topic.':'Vali teemaga sobiv lause.',opts:english?['Correct answer','Option B','Option C','Option D']:['Õige vastus','Variant B','Variant C','Variant D'],correct:0}]},
        {...baseBlock('writing',c.reflect),task:english?`Write a short summary about “${topic}”.`:`Kirjuta lühike kokkuvõte teemal „${topic}”.`,lines:writingLines}
      ];
    }else if(templateId==='communication'){
      title=`${c.communication}: ${topic}`;
      blocks=[
        {...baseBlock('dialogue',c.dialogue),lines:english?[{speaker:'A',text:'Hello! Can I ask you a question?'},{speaker:'B',text:'[answer]'},{speaker:'A',text:'Thank you!'}]:[{speaker:'A',text:'Tere! Kas ma võin sinult midagi küsida?'},{speaker:'B',text:'[vastus]'},{speaker:'A',text:'Aitäh!'}]},
        {...baseBlock('choice',c.choose),questions:[{q:english?'Which reply is polite and appropriate?':'Milline vastus on viisakas ja sobiv?',opts:english?['Yes, of course.','Never.','Go away.','I do not listen.']:['Jah, muidugi.','Mitte kunagi.','Mine ära.','Ma ei kuula.'],correct:0}]},
        {...baseBlock('writing',c.reflect),task:english?`Write your own short dialogue about “${topic}”.`:`Kirjuta oma lühike dialoog teemal „${topic}”.`,lines:writingLines}
      ];
    }else throw new Error('Unknown worksheet template');
    return {...common,title,blocks:clone(blocks)};
  }

  const normalizeStatus=value=>STATUSES[value]?value:'draft';
  const nextVersion=value=>Math.max(0,Number(value)||0)+1;
  const hasBlocks=data=>Array.isArray(data?.blocks)&&data.blocks.length>0;
  function curriculumFieldsFor(lesson={}){
    const sourceKey=text(lesson.sourceKey);
    const sourceMatch=sourceKey.match(/^curriculum:([^:]+):(\d+)$/);
    const topicId=text(lesson.curriculumTopicId)||(sourceMatch?.[1]||'');
    if(!topicId)return {};
    const lessonIndex=lesson.curriculumLessonIndex!==undefined
      ?Math.max(0,Number(lesson.curriculumLessonIndex)||0)
      :Math.max(0,Number(sourceMatch?.[2])||0);
    return {
      sourceType:text(lesson.sourceType)||'curriculum_workspace',
      sourceKey:sourceKey||`curriculum:${topicId}:${lessonIndex}`,
      curriculumLanguageId:text(lesson.curriculumLanguageId),
      curriculumSubject:text(lesson.curriculumSubject||lesson.subject),
      curriculumLevel:text(lesson.curriculumLevel||lesson.level),
      curriculumTopicId:topicId,
      curriculumTopicName:text(lesson.curriculumTopicName||lesson.topic),
      curriculumLessonIndex:lessonIndex,
      curriculumLessonGoal:text(lesson.curriculumLessonGoal),
      curriculumSourceVersion:text(lesson.curriculumSourceVersion)
    };
  }
  function isAssignableWorksheet(lesson={}){
    if(hasBlocks(lesson.publishedWorksheetData)) return true;
    if(!lesson.worksheetStatus) return hasBlocks(lesson.worksheetData);
    return normalizeStatus(lesson.worksheetStatus)==='published'&&hasBlocks(lesson.publishedWorksheetData||lesson.worksheetData);
  }
  function assignmentDataFor(lesson={}){
    if(!isAssignableWorksheet(lesson)) return null;
    const legacy=!lesson.worksheetStatus;
    return {
      worksheetData:clone(legacy?lesson.worksheetData:(lesson.publishedWorksheetData||lesson.worksheetData)),
      worksheetVersion:Number(legacy?(lesson.worksheetVersion||1):(lesson.publishedWorksheetVersion||lesson.worksheetVersion||1)),
      worksheetStatus:'published',
      curriculumFields:curriculumFieldsFor(lesson)
    };
  }
  function buildVersionFields({status,version,worksheetData,worksheetQuality,now}){
    const normalized=normalizeStatus(status);
    const at=text(now)||new Date().toISOString();
    const fields={worksheetData:clone(worksheetData),worksheetQuality:clone(worksheetQuality||{}),worksheetStatus:normalized,worksheetVersion:Number(version)||1,updatedAt:at};
    if(normalized==='reviewed') fields.reviewedAt=at;
    if(normalized==='published') Object.assign(fields,{publishedWorksheetData:clone(worksheetData),publishedWorksheetQuality:clone(worksheetQuality||{}),publishedWorksheetVersion:Number(version)||1,publishedAt:at});
    return fields;
  }
  function buildVersionRecord({lessonId,status,version,worksheetData,worksheetQuality,meta={},sourceFields={},user={},now}){
    const at=text(now)||new Date().toISOString();
    return {lessonId:text(lessonId),version:Number(version)||1,status:normalizeStatus(status),title:text(meta.title)||'Tööleht',subject:text(meta.subject),level:text(meta.level),topic:text(meta.topic),worksheetData:clone(worksheetData),worksheetQuality:clone(worksheetQuality||{}),...clone(sourceFields||{}),createdAt:at,createdBy:text(user.uid),createdByName:text(user.displayName||user.email)};
  }

  return {STATUSES,TEMPLATES,buildTemplate,normalizeStatus,nextVersion,curriculumFieldsFor,isAssignableWorksheet,assignmentDataFor,buildVersionFields,buildVersionRecord};
});
