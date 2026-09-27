(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.OppevaraUsabilityCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const meaningful=value=>typeof value==='string'&&value.trim().length>=3;
  const allText=value=>{
    if(typeof value==='string')return [value];
    if(Array.isArray(value))return value.flatMap(allText);
    if(value&&typeof value==='object')return Object.values(value).flatMap(allText);
    return [];
  };
  const suspiciousText=value=>allText(value).some(text=>{
    const normalized=text.toLowerCase();
    return /\b(?:asdf|qwer|lorem|testtest|gaegkgavn|eanignfeaing|gegege)\w*\b/.test(normalized)
      || /([a-zõäöü]{2,4})\1{2,}/i.test(normalized);
  });

  function exerciseIssues(exercise){
    const issues=[];
    if(!meaningful(exercise?.title))issues.push('Pealkiri puudub');
    if(suspiciousText(exercise))issues.push('Sisu näib olevat testtekst');
    const type=exercise?.type;
    if(type==='fill'&&!/\[[^\]]+\]/.test(exercise.text||''))issues.push('Lüngad puuduvad');
    if(type==='choice'&&!(exercise.questions||[]).some(q=>meaningful(q?.question)&&(q.options||[]).length>=2))issues.push('Küsimused või vastusevariandid puuduvad');
    if(type==='writing'&&!meaningful(exercise.task||exercise.prompt||exercise.instruction||exercise.description||exercise.text))issues.push('Kirjutamisülesanne puudub');
    if(type==='reading'){
      if(!meaningful(exercise.passage||exercise.text))issues.push('Lugemistekst puudub');
      if(!(exercise.questions||[]).length)issues.push('Küsimused puuduvad');
    }
    if(type!=='reading'&&type!=='choice'&&/küsimus/i.test(allText(exercise).join(' '))&&!(exercise.questions||[]).length)issues.push('Lubatud küsimused puuduvad');
    if(type==='match'&&!(exercise.pairs||[]).length)issues.push('Paarid puuduvad');
    if(type==='order'&&!(exercise.items||exercise.words||exercise.sentences||[]).length)issues.push('Järjestatav sisu puudub');
    if(type==='translate'&&!(exercise.items||exercise.pairs||[]).length)issues.push('Tõlkeüksused puuduvad');
    return [...new Set(issues)];
  }

  function lessonIssues(lesson){
    const issues=[];
    if(!meaningful(lesson?.title)||lesson?.title?.trim()==='—')issues.push('Pealkiri puudub');
    if(suspiciousText(lesson))issues.push('Sisu näib olevat testtekst');
    const blocks=lesson?.worksheetData?.blocks||[];
    const files=lesson?.files||[];
    const phaseText=allText(lesson?.phaseData||{}).some(meaningful);
    const hasContent=blocks.length||files.length||phaseText||[
      lesson?.description,lesson?.goal,lesson?.practice,lesson?.worksheetPrompt,lesson?.builderObjectives
    ].some(meaningful);
    if(!hasContent)issues.push('Õppesisu puudub');
    blocks.forEach(block=>{
      const asksQuestions=/küsimus/i.test(allText(block).join(' '));
      if((block.type==='reading'||asksQuestions)&&!(block.questions||[]).length)issues.push('Töölehe küsimused puuduvad');
    });
    return [...new Set(issues)];
  }

  function readiness(item,kind){
    const issues=kind==='exercise'?exerciseIssues(item):lessonIssues(item);
    if(item?.__placeholder||item?.worksheetStatus==='draft')return {key:'draft',label:'Mustand',issues};
    if(issues.length)return {key:'needs_review',label:'Vajab kontrolli',issues};
    if(item?.worksheetStatus==='reviewed')return {key:'reviewed',label:'Kontrollitud',issues:[]};
    return {key:'ready',label:'Valmis kasutamiseks',issues:[]};
  }

  return {allText,suspiciousText,exerciseIssues,lessonIssues,readiness};
});
