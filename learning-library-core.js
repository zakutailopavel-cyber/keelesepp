(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  root.LearningLibraryCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const TYPE_META={
    lesson:{label:'Tunnikava',icon:'fa-chalkboard-user',color:'#2F5D50'},
    worksheet:{label:'Tööleht',icon:'fa-file-pen',color:'#0e7490'},
    exercise:{label:'Harjutus',icon:'fa-dumbbell',color:'#6d28d9'},
    test:{label:'Kontrolltöö',icon:'fa-clipboard-check',color:'#1d4ed8'},
    homework:{label:'Kodutöö',icon:'fa-house',color:'#A96E1A'},
    material:{label:'Materjal',icon:'fa-folder-open',color:'#be185d'}
  };
  const UNGROUPED_KEY='__ungrouped__';
  const CURRICULUM_KEY_PREFIX='__curriculum__:';
  const LIBRARY_PATH_PARAMS={
    subject:'libSubject',
    stage:'libStage',
    topic:'libTopic'
  };

  const normalize=value=>String(value||'')
    .toLocaleLowerCase('et-EE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .trim();

  const hasWorksheet=lesson=>Boolean(
    lesson?.worksheetData
    && Array.isArray(lesson.worksheetData.blocks)
    && lesson.worksheetData.blocks.length
  );

  const curriculumType=lesson=>{
    if(lesson?.examPart||lesson?.type==='test') return 'test';
    if(hasWorksheet(lesson)) return 'worksheet';
    if(lesson?.type==='hw') return 'homework';
    if(lesson?.type==='material') return 'material';
    return 'lesson';
  };

  const libraryItem=(kind,source)=>{
    const type=kind==='exercise'?'exercise':curriculumType(source);
    const meta=TYPE_META[type]||TYPE_META.material;
    const description=source?.description||source?.builderObjectives||source?.instruction||source?.task||'';
    const item={
      key:`${kind}:${source?.id||''}`,
      sourceId:source?.id||'',
      kind,
      type,
      typeLabel:meta.label,
      icon:meta.icon,
      color:meta.color,
      title:source?.title||source?.name||'Pealkirjata õppematerjal',
      description,
      subject:source?.subject||'',
      level:source?.level||'',
      topic:source?.topic||'',
      ageGroup:source?.ageGroup||source?.ageRange||source?.targetAge||source?.age||'',
      curriculumId:source?.curriculumId||source?.programId||source?.planId||'',
      curriculum:source?.curriculumTitle||source?.curriculumName||source?.programName||source?.planTitle||'',
      examPart:source?.examPart||'',
      assignMode:kind==='exercise'?'exercise':hasWorksheet(source)?'worksheet':'homework',
      source
    };
    item.searchText=normalize([
      item.title,item.description,item.subject,item.level,item.ageGroup,item.topic,item.curriculum,item.typeLabel,
      source?.lessonTypeLabel,(source?.tags||[]).join(' ')
    ].join(' '));
    return item;
  };

  const buildLibraryItems=(lessons=[],exercises=[])=>[
    ...lessons.filter(item=>item&&!item.__placeholder).map(item=>libraryItem('curriculum',item)),
    ...exercises.filter(Boolean).map(item=>libraryItem('exercise',item))
  ];

  const filterLibraryItems=(items=[],filters={})=>{
    const query=normalize(filters.query);
    return items.filter(item=>{
      if(filters.type&&filters.type!=='all'&&item.type!==filters.type) return false;
      if(filters.subject&&filters.subject!=='all'&&item.subject!==filters.subject) return false;
      if(filters.level&&filters.level!=='all'&&item.level!==filters.level) return false;
      if(filters.topic&&filters.topic!=='all'&&item.topic!==filters.topic) return false;
      return !query||item.searchText.includes(query);
    });
  };

  const cleanGroupValue=value=>String(value||'').trim();
  const examTopic=item=>{
    if(item?.examPart) return `__exam__:${cleanGroupValue(item.examPart)}`;
    const tagged=(Array.isArray(item?.source?.tags)?item.source.tags:[])
      .map(cleanGroupValue)
      .find(tag=>tag.startsWith('__exam__'));
    return tagged?`__exam__:${tagged.replace(/^__exam__:?_*/,'')}`:'';
  };
  const groupKeyForItem=(item,dimension)=>{
    if(dimension==='subject') return cleanGroupValue(item?.subject)||UNGROUPED_KEY;
    if(dimension==='stage') return cleanGroupValue(item?.level||item?.ageGroup)||UNGROUPED_KEY;
    if(dimension==='topic'){
      const curriculumId=cleanGroupValue(item?.curriculumId);
      if(curriculumId) return `${CURRICULUM_KEY_PREFIX}${curriculumId}`;
      const rawTopic=cleanGroupValue(item?.curriculum||item?.topic);
      if(rawTopic.startsWith('__exam__')){
        return `__exam__:${rawTopic.replace(/^__exam__:?_*/,'')}`;
      }
      return rawTopic||examTopic(item)||UNGROUPED_KEY;
    }
    return UNGROUPED_KEY;
  };
  const titleCase=value=>{
    const text=cleanGroupValue(value).replaceAll('_',' ');
    return text?text.charAt(0).toLocaleUpperCase('et-EE')+text.slice(1):'';
  };
  const groupLabel=(dimension,key,item)=>{
    if(key===UNGROUPED_KEY){
      if(dimension==='subject') return 'Muu õppevara';
      if(dimension==='stage') return 'Määramata tase või vanus';
      return 'Üldised materjalid';
    }
    if(dimension==='topic'&&key.startsWith('__exam__:')){
      return `Eksam: ${titleCase(key.slice('__exam__:'.length))||'üldine'}`;
    }
    if(dimension==='topic'&&key.startsWith(CURRICULUM_KEY_PREFIX)){
      return cleanGroupValue(item?.curriculum||item?.topic)||'Õppekava';
    }
    return key;
  };
  const groupLibraryItems=(items=[],dimension)=>{
    const grouped=new Map();
    items.filter(Boolean).forEach(item=>{
      const key=groupKeyForItem(item,dimension);
      if(!grouped.has(key)) grouped.set(key,[]);
      grouped.get(key).push(item);
    });
    return Array.from(grouped.entries())
      .map(([key,groupItems])=>({
        key,
        label:groupLabel(dimension,key,groupItems[0]),
        count:groupItems.length,
        items:groupItems,
        typeCounts:groupItems.reduce((counts,item)=>{
          counts[item.type]=(counts[item.type]||0)+1;
          return counts;
        },{})
      }))
      .sort((a,b)=>{
        if(a.key===UNGROUPED_KEY) return 1;
        if(b.key===UNGROUPED_KEY) return -1;
        return a.label.localeCompare(b.label,'et',{numeric:true,sensitivity:'base'});
      });
  };
  const itemsInLibraryPath=(items=[],path={})=>items.filter(item=>
    (!path.subject||groupKeyForItem(item,'subject')===path.subject)
    &&(!path.stage||groupKeyForItem(item,'stage')===path.stage)
    &&(!path.topic||groupKeyForItem(item,'topic')===path.topic)
  );

  const libraryPathFromSearch=search=>{
    const params=search instanceof URLSearchParams
      ?search
      :new URLSearchParams(String(search||'').replace(/^\?/,''));
    return Object.fromEntries(Object.entries(LIBRARY_PATH_PARAMS).map(([field,param])=>[
      field,
      cleanGroupValue(params.get(param)).slice(0,300)
    ]));
  };
  const searchWithLibraryPath=(search,path={})=>{
    const params=search instanceof URLSearchParams
      ?new URLSearchParams(search)
      :new URLSearchParams(String(search||'').replace(/^\?/,''));
    Object.entries(LIBRARY_PATH_PARAMS).forEach(([field,param])=>{
      const value=cleanGroupValue(path[field]).slice(0,300);
      if(value) params.set(param,value);
      else params.delete(param);
    });
    const result=params.toString();
    return result?`?${result}`:'';
  };
  const normalizeLibraryPath=(items=[],path={})=>{
    const normalized={subject:'',stage:'',topic:''};
    if(!path.subject) return normalized;
    const subjectItems=itemsInLibraryPath(items,{subject:path.subject});
    if(!subjectItems.length) return normalized;
    normalized.subject=path.subject;
    if(!path.stage) return normalized;
    const stageItems=itemsInLibraryPath(subjectItems,{stage:path.stage});
    if(!stageItems.length) return normalized;
    normalized.stage=path.stage;
    if(!path.topic) return normalized;
    const topicItems=itemsInLibraryPath(stageItems,{topic:path.topic});
    if(topicItems.length) normalized.topic=path.topic;
    return normalized;
  };

  const sceneText=(value,max=4000)=>String(value??'').trim().slice(0,max);
  const sceneSource=item=>({
    kind:sceneText(item?.kind,40),
    id:sceneText(item?.sourceId,180),
    type:sceneText(item?.type,40)
  });
  const publicQuestion=question=>({
    prompt:sceneText(question?.question||question?.q||question?.prompt,1000),
    options:(Array.isArray(question?.options)?question.options:question?.opts||[])
      .map(option=>sceneText(option,180))
      .filter(Boolean)
      .slice(0,8)
  });
  const fillPrompt=value=>sceneText(value,3600).replace(/\[[^\]]+\]/g,'_____');
  const rotatedWords=value=>{
    const words=sceneText(value,3000).split(/\s+/).filter(Boolean);
    if(words.length>1) return [...words.slice(1),words[0]];
    return words;
  };
  const rotatedValues=values=>{
    const clean=(Array.isArray(values)?values:[]).map(value=>sceneText(value,180)).filter(Boolean);
    return clean.length>1?[...clean.slice(1),clean[0]]:clean;
  };
  const draftFromTask=(item,task={})=>{
    const type=task.type||item?.source?.type||item?.type;
    const title=sceneText(item?.title||task.title||task.label||'Õppeülesanne',160);
    const fallback=sceneText(
      task.task||task.prompt||task.instruction||task.description
      ||item?.description||'Vaata materjali ja järgi õpetaja juhiseid.',
      3800
    );
    if(type==='choice'||type==='reading'){
      const question=publicQuestion((task.questions||[])[0]);
      if(question.prompt&&question.options.length>=2){
        const passage=type==='reading'?sceneText(task.passage||task.text,2400):'';
        return{
          type:'choice',
          title,
          body:[passage,question.prompt].filter(Boolean).join('\n\n').slice(0,4000),
          options:question.options
        };
      }
      if(type==='reading'){
        return{type:'message',title,body:sceneText(task.passage||task.text||fallback,4000),options:[]};
      }
    }
    if(type==='fill'){
      return{type:'short_answer',title,body:fillPrompt(task.text||fallback),options:[]};
    }
    if(type==='writing'){
      return{type:'short_answer',title,body:fallback,options:[]};
    }
    if(type==='translate'){
      const prompts=(task.items||task.pairs||[])
        .map((entry,index)=>`${index+1}. ${sceneText(entry?.from||entry?.l||entry?.source,300)}`)
        .filter(line=>!line.endsWith('. '))
        .slice(0,12);
      return{
        type:'short_answer',
        title,
        body:sceneText(prompts.length?`Tõlgi:\n${prompts.join('\n')}`:fallback,4000),
        options:[]
      };
    }
    if(type==='match'){
      const pairs=Array.isArray(task.pairs)?task.pairs:[];
      const left=pairs.map((pair,index)=>`${index+1}. ${sceneText(pair?.l,220)}`).filter(line=>!line.endsWith('. '));
      const right=rotatedValues(pairs.map(pair=>pair?.r));
      const body=left.length&&right.length
        ?`Sobita paarid.\n\n${left.join('\n')}\n\nValikud: ${right.join(' · ')}`
        :fallback;
      return{type:'short_answer',title,body:sceneText(body,4000),options:[]};
    }
    if(type==='order'){
      const words=rotatedWords(task.sentence||task.text);
      const body=words.length?`Pane sõnad õigesse järjekorda:\n${words.join(' · ')}`:fallback;
      return{type:'short_answer',title,body:sceneText(body,4000),options:[]};
    }
    return{type:'message',title,body:fallback,options:[]};
  };
  const classroomSceneDraft=item=>{
    const source=item?.source||{};
    const worksheetBlocks=source?.worksheetData?.blocks;
    const supported=new Set(['choice','reading','fill','writing','translate','match','order','text']);
    const task=Array.isArray(worksheetBlocks)
      ?worksheetBlocks.find(block=>supported.has(block?.type))
      :source;
    const draft=draftFromTask(item,task||source);
    return{...draft,source:sceneSource(item)};
  };

  const assignmentKind=item=>item?.assignMode||'homework';

  return{
    TYPE_META,
    UNGROUPED_KEY,
    CURRICULUM_KEY_PREFIX,
    LIBRARY_PATH_PARAMS,
    normalize,
    hasWorksheet,
    curriculumType,
    libraryItem,
    buildLibraryItems,
    filterLibraryItems,
    groupKeyForItem,
    groupLabel,
    groupLibraryItems,
    itemsInLibraryPath,
    libraryPathFromSearch,
    searchWithLibraryPath,
    normalizeLibraryPath,
    classroomSceneDraft,
    assignmentKind
  };
});
