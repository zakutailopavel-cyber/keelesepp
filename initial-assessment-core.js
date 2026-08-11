(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.InitialAssessmentCore=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const GRAMMAR_TOPICS=[
    ['full_partial_object','Täis- ja osasihitis'],
    ['verb_rections','Tegusõna rektsioonid'],
    ['case_choice','Käändevalik'],
    ['word_order','Sõnajärg'],
    ['perfect_tense','Täisminevik'],
    ['pluperfect_tense','Enneminevik'],
    ['case_formation','Käändevormide moodustamine'],
    ['verb_tenses','Tegusõna ajavormid'],
    ['ma_da_infinitive','ma- ja da-infinitiiv'],
    ['comparison','Võrdlusastmed'],
    ['numerals_cases','Arvsõnad ja käänded'],
    ['conditional','Tingiv kõneviis'],
    ['quotative','Kaudne kõneviis'],
    ['impersonal','Umbisikuline tegumood'],
    ['participles','Kesksõnad'],
    ['conjunctions','Sidendid ja keerukad laused'],
    ['relative_clauses','Relatiivlaused'],
    ['adpositions','Kaassõnad'],
    ['negation','Eitus'],
    ['word_formation','Sõnamoodustus']
  ];

  const VOCABULARY_TOPICS=[
    ['education','Haridus ja õppimine'],
    ['work','Töö ja karjäär'],
    ['society','Ühiskond ja sotsiaalsed suhted'],
    ['health','Tervis ja eluviis'],
    ['environment','Keskkond'],
    ['technology','Tehnoloogia ja digielu'],
    ['media','Meedia ja teave'],
    ['culture','Kultuur ja vaba aeg'],
    ['travel','Reisimine ja transport'],
    ['home','Eluase ja olme'],
    ['shopping','Ostlemine ja teenused'],
    ['economy','Majandus ja raha'],
    ['public_services','Riik ja avalikud teenused'],
    ['communication','Suhted ja suhtlemine'],
    ['argumentation','Argumenteerimine ja abstraktne sõnavara']
  ];

  const SKILLS=[
    ['grammar','Grammatika'],
    ['vocabulary','Sõnavara'],
    ['reading','Lugemine'],
    ['writing','Kirjutamine'],
    ['speaking','Rääkimine'],
    ['listening','Kuulamine']
  ];

  const STATUSES={
    not_tested:{label:'Hindamata',color:'#64748b',bg:'#f1f5f9'},
    needs_work:{label:'Vajab tööd',color:'#b42318',bg:'#fef3f2'},
    developing:{label:'Areneb',color:'#b54708',bg:'#fffaeb'},
    near_target:{label:'Eesmärgi lähedal',color:'#175cd3',bg:'#eff8ff'},
    target_reached:{label:'Eesmärk saavutatud',color:'#067647',bg:'#ecfdf3'}
  };

  const PRIORITIES={
    very_high:{label:'Väga kõrge'},
    high:{label:'Kõrge'},
    medium:{label:'Keskmine'},
    maintain:{label:'Hoida taset'},
    low:{label:'Madal'}
  };

  function topicRows(definitions){
    return definitions.map(([id,name])=>({id,name,score:null,status:'not_tested',priority:'medium',comment:''}));
  }

  function skillRows(){
    return SKILLS.map(([id,name])=>({id,name,score:null,status:'not_tested',comment:''}));
  }

  function normalizeScore(value){
    if(value===''||value===null||typeof value==='undefined') return null;
    const number=Number(value);
    if(!Number.isFinite(number)) return null;
    return Math.max(0,Math.min(100,Math.round(number)));
  }

  function statusForScore(score){
    const value=normalizeScore(score);
    if(value===null) return 'not_tested';
    if(value<55) return 'needs_work';
    if(value<70) return 'developing';
    if(value<85) return 'near_target';
    return 'target_reached';
  }

  function buildInitialAssessment(student,actor,now){
    const timestamp=now||new Date().toISOString();
    return {
      studentId:student&&student.id||'',
      assessmentDate:timestamp.slice(0,10),
      currentLevel:student&&student.level||'',
      targetLevel:student&&student.targetLevel||'',
      overallStatus:'needs_work',
      grammarData:topicRows(GRAMMAR_TOPICS),
      vocabularyData:topicRows(VOCABULARY_TOPICS),
      skillsData:skillRows(),
      strengths:[],
      developmentAreas:[],
      learningFocus:'',
      createdAt:timestamp,
      updatedAt:timestamp,
      createdByUid:actor&&actor.uid||'',
      createdByName:actor&&(actor.displayName||actor.name)||'',
      updatedByUid:actor&&actor.uid||'',
      updatedByName:actor&&(actor.displayName||actor.name)||'',
      version:1
    };
  }

  function normalizeRows(rows,withPriority){
    return (Array.isArray(rows)?rows:[]).map(row=>{
      const score=normalizeScore(row&&row.score);
      const normalized={
        id:String(row&&row.id||''),
        name:String(row&&row.name||''),
        score,
        status:STATUSES[row&&row.status]?row.status:statusForScore(score),
        comment:String(row&&row.comment||'')
      };
      if(withPriority) normalized.priority=PRIORITIES[row&&row.priority]?row.priority:'medium';
      return normalized;
    }).filter(row=>row.id&&row.name);
  }

  function normalizeAssessment(data,student,actor,now){
    const base=buildInitialAssessment(student,actor,now);
    const source=data||{};
    return {
      ...base,
      ...source,
      studentId:student&&student.id||source.studentId||'',
      assessmentDate:String(source.assessmentDate||base.assessmentDate),
      currentLevel:String(source.currentLevel||''),
      targetLevel:String(source.targetLevel||''),
      overallStatus:STATUSES[source.overallStatus]?source.overallStatus:'needs_work',
      grammarData:normalizeRows(source.grammarData||base.grammarData,true),
      vocabularyData:normalizeRows(source.vocabularyData||base.vocabularyData,true),
      skillsData:normalizeRows(source.skillsData||base.skillsData,false),
      strengths:(Array.isArray(source.strengths)?source.strengths:[]).map(String).map(s=>s.trim()).filter(Boolean),
      developmentAreas:(Array.isArray(source.developmentAreas)?source.developmentAreas:[]).map(String).map(s=>s.trim()).filter(Boolean),
      learningFocus:String(source.learningFocus||''),
      createdAt:source.createdAt||base.createdAt,
      createdByUid:source.createdByUid||base.createdByUid,
      createdByName:source.createdByName||base.createdByName,
      updatedAt:now||new Date().toISOString(),
      updatedByUid:actor&&actor.uid||'',
      updatedByName:actor&&(actor.displayName||actor.name)||'',
      version:1
    };
  }

  return {GRAMMAR_TOPICS,VOCABULARY_TOPICS,SKILLS,STATUSES,PRIORITIES,normalizeScore,statusForScore,buildInitialAssessment,normalizeAssessment};
});
