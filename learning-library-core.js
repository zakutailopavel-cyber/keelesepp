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
  const groupLabel=(dimension,key)=>{
    if(key===UNGROUPED_KEY){
      if(dimension==='subject') return 'Muu õppevara';
      if(dimension==='stage') return 'Määramata tase või vanus';
      return 'Üldised materjalid';
    }
    if(dimension==='topic'&&key.startsWith('__exam__:')){
      return `Eksam: ${titleCase(key.slice('__exam__:'.length))||'üldine'}`;
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
        label:groupLabel(dimension,key),
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

  const assignmentKind=item=>item?.assignMode||'homework';

  return{
    TYPE_META,
    UNGROUPED_KEY,
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
    assignmentKind
  };
});
