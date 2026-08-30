(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.WorksheetVisualLibrary=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  const clone=value=>JSON.parse(JSON.stringify(value));
  const normalize=value=>String(value??'').trim().toLocaleLowerCase('et-EE');
  const choose=(subject,et,en)=>subject==='Inglise keel'?en:et;
  const base=(type,instruction)=>({type,instruction,size:'full',imageUrl:'',imagePos:'top',label:''});
  const asset=name=>'/assets/worksheet-visuals/'+name;

  const definitions=[
    {
      id:'body-parts',type:'image_label',icon:'fa-person',titleEt:'Kehaosad pildil',titleEn:'Body parts on a picture',descriptionEt:'Paiguta nimetused sõbraliku tegelase kehaosade juurde.',descriptionEn:'Label body parts on a friendly illustrated character.',subjects:['Eesti keel','Inglise keel'],levels:['A1','A2'],ages:['child','youth','adult'],tags:['keha','body','sõnavara','vocabulary'],
      build:subject=>({...base('image_label',choose(subject,'Kirjuta numbrite juurde õiged kehaosad.','Write the correct body part next to each number.')),label:choose(subject,'Kehaosad','Body parts'),imageUrl:asset('body-parts.svg'),caption:choose(subject,'Kasuta sõnapanka või kirjuta vastused iseseisvalt.','Use the word bank or write the answers independently.'),showWordBank:true,items:(subject==='Inglise keel'?[['head',50,20],['hand',28,60],['leg',55,84],['foot',59,94]]:[['pea',50,20],['käsi',28,60],['jalg',55,84],['labajalg',59,94]]).map(([answer,x,y])=>({answer,x,y}))})
    },
    {
      id:'classroom-objects',type:'image_label',icon:'fa-school',titleEt:'Esemed klassiruumis',titleEn:'Classroom objects',descriptionEt:'Märgi pildil tahvel, uks, laud ja tool.',descriptionEn:'Label the board, door, desk and chair in the classroom.',subjects:['Eesti keel','Inglise keel'],levels:['A1','A2'],ages:['child','youth'],tags:['klass','classroom','esemed','objects'],
      build:subject=>({...base('image_label',choose(subject,'Nimeta pildil märgitud klassiruumi esemed.','Name the marked classroom objects.')),label:choose(subject,'Klassiruum','Classroom'),imageUrl:asset('classroom.svg'),caption:choose(subject,'Vaata pilti ja kirjuta iga numbri juurde õige sõna.','Look at the picture and write the correct word for each number.'),showWordBank:true,items:(subject==='Inglise keel'?[['board',29,34],['door',80,43],['desk',42,76],['chair',82,87]]:[['tahvel',29,34],['uks',80,43],['laud',42,76],['tool',82,87]]).map(([answer,x,y])=>({answer,x,y}))})
    },
    {
      id:'daily-routine-flow',type:'diagram',icon:'fa-route',titleEt:'Minu päeva järjestus',titleEn:'My daily routine',descriptionEt:'Päeva tegevused vooskeemina, kaks sammu õpilasele.',descriptionEn:'A daily routine flow with two steps for the student to complete.',subjects:['Eesti keel','Inglise keel'],levels:['A1','A2'],ages:['child','youth','adult'],tags:['päev','daily','routine','järjestus'],
      build:subject=>({...base('diagram',choose(subject,'Täida puuduvad päeva tegevused.','Complete the missing daily activities.')),label:choose(subject,'Päevakava','Daily routine'),title:choose(subject,'Kuidas minu päev kulgeb?','How does my day go?'),layout:'flow',centerText:'',nodes:(subject==='Inglise keel'?[['I wake up','pine',false],['I eat breakfast','gold',true],['I study or work','blue',false],['I practise the language','rose',true],['I go to sleep','pine',false]]:[['Ma ärkan','pine',false],['Ma söön hommikust','gold',true],['Ma õpin või töötan','blue',false],['Ma harjutan keelt','rose',true],['Ma lähen magama','pine',false]]).map(([text,color,blank])=>({text,color,blank}))})
    },
    {
      id:'sentence-builder',type:'diagram',icon:'fa-cubes-stacked',titleEt:'Lause ehitamise skeem',titleEn:'Sentence builder',descriptionEt:'Alus, öeldis, sihitis ja ajamäärus ühes skeemis.',descriptionEn:'Subject, verb, object and time phrase in one editable structure.',subjects:['Eesti keel','Inglise keel'],levels:['A1','A2','B1'],ages:['child','youth','adult'],tags:['grammatika','grammar','lause','sentence'],
      build:subject=>({...base('diagram',choose(subject,'Täida skeemi puuduvad lauseosad.','Complete the missing parts of the sentence structure.')),label:choose(subject,'Lause skeem','Sentence structure'),title:choose(subject,'Lihtlause järjekord','Basic sentence order'),layout:'flow',centerText:'',nodes:(subject==='Inglise keel'?[['Subject','blue',false],['Verb','gold',true],['Object','pine',true],['Time / place','rose',false]]:[['Alus','blue',false],['Öeldis','gold',true],['Sihitis','pine',true],['Aeg / koht','rose',false]]).map(([text,color,blank])=>({text,color,blank}))})
    },
    {
      id:'topic-mindmap',type:'diagram',icon:'fa-sitemap',titleEt:'Teema mõistekaart',titleEn:'Topic mind map',descriptionEt:'Universaalne mõistekaart sõnavara ja ideede kogumiseks.',descriptionEn:'A reusable mind map for collecting vocabulary and ideas.',subjects:['Eesti keel','Inglise keel'],levels:['A1','A2','B1','B2','C1','C2'],ages:['child','youth','adult'],tags:['mõistekaart','mindmap','sõnavara','ideas'],
      build:(subject,level)=>({...base('diagram',choose(subject,'Täida mõistekaardi tühjad harud.','Complete the empty branches of the mind map.')),label:choose(subject,'Mõistekaart','Mind map'),title:choose(subject,'Teema sõnavara ja ideed','Topic vocabulary and ideas'),layout:'mindmap',centerText:choose(subject,'Minu teema','My topic'),nodes:[{text:choose(subject,'Olulised sõnad','Key words'),color:'blue',blank:false},{text:choose(subject,'Näide','Example'),color:'gold',blank:true},{text:choose(subject,'Minu arvamus','My opinion'),color:'pine',blank:['B1','B2','C1','C2'].includes(level)},{text:choose(subject,'Küsimus','Question'),color:'rose',blank:true}]})
    },
    {
      id:'cafe-dialogue',type:'comic',icon:'fa-mug-hot',titleEt:'Kohvikus tellimine',titleEn:'Ordering at a cafe',descriptionEt:'Täienda kliendi ja teenindaja valitud kõnemulle.',descriptionEn:'Complete selected speech bubbles in a cafe conversation.',subjects:['Eesti keel','Inglise keel'],levels:['A1','A2'],ages:['youth','adult'],tags:['kohvik','cafe','dialoog','dialogue'],
      build:subject=>({...base('comic',choose(subject,'Täienda puuduvad repliigid viisakaks vestluseks.','Complete the missing lines to make a polite conversation.')),label:choose(subject,'Kohvikus','At a cafe'),title:choose(subject,'Tellimus kohvikus','Ordering at a cafe'),taskMode:'complete',panels:(subject==='Inglise keel'?[['Customer','🙂','Cafe','Hello! I would like a tea, please.','Order',true],['Server','😊','Cafe','Of course. Would you like lemon?','Question',false],['Customer','🙂','Cafe','Yes, please. Thank you!','Reply',true]]:[['Klient','🙂','Kohvik','Tere! Ma sooviksin palun teed.','Tellimus',true],['Teenindaja','😊','Kohvik','Muidugi. Kas soovite sidrunit?','Küsimus',false],['Klient','🙂','Kohvik','Jah, palun. Aitäh!','Vastus',true]]).map(([character,emoji,scene,text,caption,blank])=>({character,emoji,scene,text,caption,blank,imageUrl:asset('cafe-scene.svg')}))})
    },
    {
      id:'school-help-order',type:'comic',icon:'fa-people-arrows',titleEt:'Abi küsimine koolis',titleEn:'Asking for help at school',descriptionEt:'Pane neli vestluse kaadrit loogilisse järjekorda.',descriptionEn:'Put four school conversation panels into a logical order.',subjects:['Eesti keel','Inglise keel'],levels:['A1','A2','B1'],ages:['child','youth'],tags:['kool','school','abi','help','järjestus'],
      build:subject=>({...base('comic',choose(subject,'Pane vestluse kaadrid õigesse järjekorda.','Put the conversation panels in the correct order.')),label:choose(subject,'Koolivestlus','School conversation'),title:choose(subject,'Kuidas viisakalt abi küsida?','How to ask for help politely'),taskMode:'order',panels:(subject==='Inglise keel'?[['Student','😕','School','Excuse me, could you help me?','Start'],['Teacher','🙂','School','Of course. What do you need?','Question'],['Student','📘','School','I do not understand this exercise.','Explanation'],['Teacher','✅','School','Let us solve it together.','Solution']]:[['Õpilane','😕','Kool','Vabandage, kas te saaksite mind aidata?','Algus'],['Õpetaja','🙂','Kool','Muidugi. Mida sul vaja on?','Küsimus'],['Õpilane','📘','Kool','Ma ei saa sellest harjutusest aru.','Selgitus'],['Õpetaja','✅','Kool','Lahendame selle koos.','Lahendus']]).map(([character,emoji,scene,text,caption])=>({character,emoji,scene,text,caption,blank:false}))})
    },
    {
      id:'job-interview',type:'comic',icon:'fa-briefcase',titleEt:'Töövestlus',titleEn:'Job interview',descriptionEt:'B1–B2 töövestluse repliigid ja viisakas enesetutvustus.',descriptionEn:'B1–B2 interview prompts and a polite self-introduction.',subjects:['Eesti keel','Inglise keel'],levels:['B1','B2'],ages:['adult'],tags:['töö','job','interview','täiskasvanu'],
      build:subject=>({...base('comic',choose(subject,'Täienda kandidaadi vastused terviklausetega.','Complete the candidate’s answers using full sentences.')),label:choose(subject,'Töövestlus','Job interview'),title:choose(subject,'Esimene töövestlus','A first job interview'),taskMode:'complete',panels:(subject==='Inglise keel'?[['Interviewer','🧑‍💼','Office','Please tell me about yourself.','Introduction',false],['Candidate','🙂','Office','I have experience in customer service and enjoy learning new skills.','Answer',true],['Interviewer','📝','Office','Why would you like to work with us?','Motivation',false],['Candidate','💡','Office','Your work interests me and I can contribute to the team.','Answer',true]]:[['Intervjueerija','🧑‍💼','Kontor','Palun rääkige natuke endast.','Tutvustus',false],['Kandidaat','🙂','Kontor','Mul on klienditeeninduse kogemus ja mulle meeldib uusi oskusi õppida.','Vastus',true],['Intervjueerija','📝','Kontor','Miks soovite meie juures töötada?','Motivatsioon',false],['Kandidaat','💡','Kontor','Teie töö pakub mulle huvi ja saan meeskonda panustada.','Vastus',true]]).map(([character,emoji,scene,text,caption,blank])=>({character,emoji,scene,text,caption,blank,imageUrl:asset('interview-scene.svg')}))})
    },
    {
      id:'emotion-response',type:'connect',icon:'fa-face-smile',titleEt:'Tunne ja sobiv vastus',titleEn:'Emotion and suitable response',descriptionEt:'Ühenda olukord sobiva empaatilise vastusega.',descriptionEn:'Connect each situation with an empathetic response.',subjects:['Eesti keel','Inglise keel'],levels:['A2','B1','B2'],ages:['child','youth','adult'],tags:['tunded','emotion','suhtlus','communication'],
      build:subject=>({...base('connect',choose(subject,'Ühenda olukord kõige sobivama vastusega.','Connect each situation with the most suitable response.')),label:choose(subject,'Tunded ja vastused','Emotions and responses'),pairs:(subject==='Inglise keel'?[['I passed the exam!','Congratulations!'],['I lost my keys.','I am sorry. Can I help?'],['I am nervous about tomorrow.','You can do it. Let us prepare together.'],['I feel unwell.','Please rest and ask for help.']]:[['Ma sooritasin eksami!','Palju õnne!'],['Ma kaotasin võtmed.','Mul on kahju. Kas saan aidata?'],['Ma olen homse pärast närvis.','Sa saad hakkama. Valmistume koos.'],['Mul on halb olla.','Palun puhka ja küsi abi.']]).map(([l,r])=>({l,r}))})
    },
    {
      id:'word-definition',type:'connect',icon:'fa-bezier-curve',titleEt:'Sõna ja seletus',titleEn:'Word and definition',descriptionEt:'Universaalne nelja paari plokk uue sõnavara jaoks.',descriptionEn:'A reusable four-pair block for new vocabulary.',subjects:['Eesti keel','Inglise keel'],levels:['A1','A2','B1','B2','C1','C2'],ages:['child','youth','adult'],tags:['sõna','word','seletus','definition'],
      build:subject=>({...base('connect',choose(subject,'Ühenda sõna selle seletusega. Muuda näidised oma tunni järgi.','Connect each word with its definition. Adapt the examples to your lesson.')),label:choose(subject,'Sõna ja seletus','Word and definition'),pairs:(subject==='Inglise keel'?[['journey','travelling from one place to another'],['habit','something you do regularly'],['choice','a decision between options'],['goal','something you want to achieve']]:[['teekond','liikumine ühest kohast teise'],['harjumus','tegevus, mida tehakse regulaarselt'],['valik','otsus mitme võimaluse vahel'],['eesmärk','tulemus, mida soovitakse saavutada']]).map(([l,r])=>({l,r}))})
    }
  ];

  const PRESETS=definitions.map(({build,...preset})=>clone(preset));
  function filterPresets(filters={}){
    const subject=String(filters.subject||'');
    const level=String(filters.level||'');
    const age=String(filters.age||'all');
    const type=String(filters.type||'all');
    const query=normalize(filters.query);
    return PRESETS.filter(preset=>{
      if(subject&&subject!=='all'&&!preset.subjects.includes(subject))return false;
      if(level&&level!=='all'&&!preset.levels.includes(level))return false;
      if(age!=='all'&&!preset.ages.includes(age))return false;
      if(type!=='all'&&preset.type!==type)return false;
      if(query){
        const haystack=normalize([preset.titleEt,preset.titleEn,preset.descriptionEt,preset.descriptionEn,...preset.tags].join(' '));
        if(!haystack.includes(query))return false;
      }
      return true;
    });
  }

  function buildPreset(presetId,options={}){
    const definition=definitions.find(item=>item.id===presetId);
    if(!definition)throw new Error('Unknown visual preset');
    const subject=options.subject==='Inglise keel'?'Inglise keel':'Eesti keel';
    const level=String(options.level||definition.levels[0]||'A1');
    const block=definition.build(subject,level);
    return {id:definition.id,title:choose(subject,definition.titleEt,definition.titleEn),subject,level,block:{...clone(block),visualPresetId:definition.id}};
  }

  return {PRESETS,filterPresets,buildPreset};
});
