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
      examPart:source?.examPart||'',
      assignMode:kind==='exercise'?'exercise':hasWorksheet(source)?'worksheet':'homework',
      source
    };
    item.searchText=normalize([
      item.title,item.description,item.subject,item.level,item.topic,item.typeLabel,
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
      return !query||item.searchText.includes(query);
    });
  };

  const assignmentKind=item=>item?.assignMode||'homework';

  return{
    TYPE_META,
    normalize,
    hasWorksheet,
    curriculumType,
    libraryItem,
    buildLibraryItems,
    filterLibraryItems,
    assignmentKind
  };
});
