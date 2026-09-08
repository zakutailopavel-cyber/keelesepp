(function(root,factory){
  const contract=typeof module==='object'&&module.exports?require('./activity-contract-core.js'):root.KeeleSeppActivityContract;
  const api=factory(contract);
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.KeeleSeppLessonWorkspaceCore=api;
})(typeof window!=='undefined'?window:globalThis,function(contract){
  const WORKSPACE_TYPES=['diagnostic','vocabulary','controlled_practice','scene','roleplay','transfer','assessment','summary'];
  const TYPE_SET=new Set(WORKSPACE_TYPES);
  const ROUTES=new Set(['support','core','advanced']);

  const clean=(value,max=1200)=>String(value??'').replace(/\s+/g,' ').trim().slice(0,max);
  const list=value=>Array.isArray(value)?value:[];
  const route=value=>ROUTES.has(value)?value:'core';

  function stageFor(lesson,item){
    if(!item||item.kind==='diagnostic') return null;
    return list(lesson?.stages).find(stage=>stage.id===item.stageId)||list(lesson?.stages)[Math.max(0,(Number(item.stage)||1)-1)]||null;
  }

  function routeVariant(lesson,item,currentRoute='core'){
    const stage=stageFor(lesson,item);
    if(!stage) return null;
    return stage.routes?.[route(currentRoute)]||stage.routes?.core||stage.routes?.support||stage.routes?.advanced||null;
  }

  function inferWorkspaceType(stage,item){
    const id=clean(stage?.id||item?.stageId,120);
    if(item?.kind==='diagnostic') return 'diagnostic';
    if(/vocab/i.test(id)) return 'vocabulary';
    if(/language|grammar|practice/i.test(id)) return 'controlled_practice';
    if(/speaking|role/i.test(id)) return Number(item?.taskIndex)===1?'transfer':'roleplay';
    if(/exit|assessment|check/i.test(id)) return 'assessment';
    return 'scene';
  }

  function workspaceTypeFor(lesson,item,currentRoute='core'){
    if(item?.activity) return item.activity.routes[route(currentRoute)].workspaceType;
    if(item?.kind==='diagnostic') return 'diagnostic';
    const stage=stageFor(lesson,item);
    const variant=routeVariant(lesson,item,currentRoute);
    const routeTypes=list(variant?.taskWorkspaceTypes);
    const stageTypes=list(stage?.taskWorkspaceTypes);
    const candidate=routeTypes[item?.taskIndex]||stageTypes[item?.taskIndex]||variant?.workspaceType||stage?.workspaceType||item?.workspaceType;
    return TYPE_SET.has(candidate)?candidate:inferWorkspaceType(stage,item);
  }

  function buildItems(lesson){
    const activities=lesson?.authoringActivities||contract.normalizeLesson(lesson);
    const validation=contract.validateActivities(activities);
    if(!validation.ok)throw new Error(validation.errors.join('; '));
    return activities.map(activity=>({
      kind:activity.source.kind,stage:activity.source.stage,stageId:activity.phaseId,
      id:activity.id,skillIds:activity.skillIds,title:activity.title,
      ...(activity.source.kind==='stage'?{taskIndex:activity.source.taskIndex}:{context:activity.source.taskIndex===1?'Õpilane vajab võõralt inimeselt abi.':'Lase õpilasel vastata lõpuni ilma parandamata.'}),prompt:activity.routes.core.prompt,
      expected:activity.routes.core.expected,method:activity.routes.core.teacherInstruction,
      workspaceType:activity.workspaceType,activity
    }));
  }

  function taskText(lesson,item,currentRoute='core'){
    if(item?.activity) return clean(item.activity.routes[route(currentRoute)].prompt,3000);
    if(item?.kind==='diagnostic') return clean(item.prompt,3000);
    const variant=routeVariant(lesson,item,currentRoute);
    const tasks=list(variant?.tasks);
    return clean(tasks[item?.taskIndex]??item?.prompt??'',3000);
  }

  function expectedText(lesson,item,currentRoute='core'){
    if(item?.activity) return clean(item.activity.routes[route(currentRoute)].expected,3000);
    if(item?.kind==='diagnostic') return clean(item.expected,3000);
    const stage=stageFor(lesson,item);
    const variant=routeVariant(lesson,item,currentRoute);
    return clean(list(variant?.expectedAnswerExamples)[0]||variant?.success||stage?.checkpoint||'Jälgi kommunikatiivse eesmärgi täitmist.',3000);
  }

  function teacherInstruction(lesson,item,currentRoute='core'){
    if(item?.activity) return clean(item.activity.routes[route(currentRoute)].teacherInstruction,4000);
    if(item?.kind==='diagnostic') return clean(item.method||lesson?.diagnostic?.instruction,4000);
    return clean(routeVariant(lesson,item,currentRoute)?.teacherInstruction||'Kohanda toe hulka, kuid hoia eesmärk sama.',4000);
  }

  function vocabularyForRoute(lesson,currentRoute='core'){
    const words=list(lesson?.vocabulary);
    const max=route(currentRoute)==='support'?6:route(currentRoute)==='advanced'?12:10;
    return words.slice(0,max).map(word=>({
      id:clean(word.id,120),
      word:clean(word.word,200),
      translation:clean(word.translation,300),
      example:clean(word.example,500)
    }));
  }

  function practicePatterns(lesson){
    return list(lesson?.languageFocus).flatMap(focus=>list(focus.patterns).map(pattern=>({
      focusId:clean(focus.id,120),
      label:clean(focus.label,240),
      pattern:clean(pattern,500)
    }))).slice(0,8);
  }

  function roleplaySteps(currentRoute='core'){
    if(route(currentRoute)==='support') return ['Tervita','Selgita probleemi','Küsi täpsustavalt','Paku või küsi lahendust','Lõpeta viisakalt'];
    if(route(currentRoute)==='advanced') return ['Selgita olukord','Reageeri komplikatsioonile','Lükka vajadusel lahendus viisakalt tagasi','Paku alternatiiv','Põhjenda valikut'];
    return ['Selgita olukord','Küsi abi','Reageeri ühele ootamatule küsimusele','Lepi kokku järgmine samm'];
  }

  function workspaceModel({lesson,item,currentRoute='core'}={}){
    const activity=(lesson?.authoringActivities||[]).find(activity=>activity.id===item?.id);
    const type=workspaceTypeFor(lesson,item,currentRoute);
    const prompt=taskText(lesson,item,currentRoute);
    const expected=expectedText(lesson,item,currentRoute);
    const instruction=teacherInstruction(lesson,item,currentRoute);
    const base={
      type,
      prompt,
      expected,
      teacherInstruction:instruction,
      route:route(currentRoute),
      title:item?.title||'',
      stageId:item?.stageId||'',
      taskIndex:Number(item?.taskIndex)||0,
      assets:activity?.assets||[]
    };
    if(type==='diagnostic') return {...base,showScene:false,showExpectedInitially:false,rule:'Ära anna vastust ega sõnavihjet enne, kui õpilane on lõpetanud.'};
    if(type==='vocabulary') return {...base,words:vocabularyForRoute(lesson,currentRoute),showTranslations:route(currentRoute)==='support'};
    if(type==='controlled_practice') return {...base,patterns:practicePatterns(lesson),showPatterns:route(currentRoute)!=='advanced'};
    if(type==='roleplay') return {...base,studentRole:prompt,teacherRole:instruction,steps:roleplaySteps(currentRoute),showScene:false};
    if(type==='transfer') return {...base,newSituation:prompt,rule:'Uus olukord: ära näita eelmise ülesande vastust ega lahendust.',steps:route(currentRoute)==='support'?['Mõista uut olukorda','Sõnasta probleem','Küsi abi','Paku lahendus']:[]};
    if(type==='assessment') return {...base,criteria:list(stageFor(lesson,item)?.successCriteria||lesson?.successCriteria).slice(0,4).map(value=>clean(value,300)),showExpectedInitially:false,rule:'Lõppkontrollis ei näidata vastusemudelit enne sooritust.'};
    return {...base,showScene:type==='scene'};
  }

  function sceneForWorkspace({scenes={},item,type}={}){
    if(type!=='scene') return null;
    return scenes?.[item?.id]||scenes?.[item?.stageId]||null;
  }

  return {
    WORKSPACE_TYPES,
    stageFor,
    routeVariant,
    workspaceTypeFor,
    buildItems,
    resolveResumeIndex:contract.resolveResumeIndex,
    taskText,
    expectedText,
    teacherInstruction,
    vocabularyForRoute,
    practicePatterns,
    roleplaySteps,
    workspaceModel,
    sceneForWorkspace
  };
});
