(function(root,factory){
  const data=factory();
  if(typeof module==='object'&&module.exports) module.exports=data;
  if(root){
    root.HaldusPrograms=data.programs;
    root.HaldusSkillCatalog=data.skillCatalog;
  }
})(typeof window!=='undefined'?window:globalThis,function(){
  const programs = [
    {
      level:'Eelkool',
      title:'Eelkool',
      audience:'5-7 aastased lapsed',
      goal:'Laps harjub õppimise rütmiga, kuulab juhiseid ja kasutab esimesi sõnu mängulises keelekeskkonnas.',
      subjects:['Eesti keel','Inglise keel','Matemaatika'],
      modules:[
        'Kuulamine ja kordamine mängu kaudu',
        'Tähed, häälikud ja lihtsad sõnad',
        'Numbrid, kujundid ja värvid',
        'Lühikesed rutiinid: tervitamine, küsimused, vastused'
      ],
      outcomes:[
        {id:'PRE_FOLLOW_INSTRUCTIONS',label:'Järgib õpetaja lihtsaid juhiseid',skillIds:['PRE_LISTEN_INSTRUCTIONS']},
        {id:'PRE_BASIC_VOCAB',label:'Tunneb põhisõnavara ja kordab fraase',skillIds:['PRE_BASIC_VOCAB']},
        {id:'PRE_LEARNING_GAME',label:'Oskab osaleda lühikeses õppemängus',skillIds:['PRE_PARTICIPATION']}
      ]
    },
    {
      level:'A1',
      title:'A1 algtase',
      audience:'Algajad õppijad',
      goal:'Õpilane saab hakkama väga lihtsates igapäevastes olukordades ja oskab endast rääkida.',
      subjects:['Eesti keel','Inglise keel'],
      modules:[
        'Tervitused, tutvumine ja isikuandmed',
        'Perekond, kool, kodu ja hobid',
        'Lihtolevik, põhiküsimused ja eitused',
        'Lugemine ja lühikeste vastuste kirjutamine'
      ],
      outcomes:[
        {id:'A1_SIMPLE_SENTENCES',label:'Moodustab lihtsaid lauseid',skillIds:['A1_PRESENT_BASIC','A1_SIMPLE_Q']},
        {id:'A1_CLEAR_SPEECH',label:'Saab aru aeglasest ja selgest kõnest',skillIds:['A1_LISTEN_BASIC']},
        {id:'A1_SELF_INTRO',label:'Kirjutab lühikese enesetutvustuse',skillIds:['A1_WRITE_NAME']}
      ]
    },
    {
      level:'A2',
      title:'A2 suhtlustase',
      audience:'Õpilased, kes oskavad juba lihtsaid lauseid',
      goal:'Õpilane kirjeldab igapäevaelu, küsib infot ja kasutab põhilisi ajavorme.',
      subjects:['Eesti keel','Inglise keel'],
      modules:[
        'Minevik ja tulevik lihtsas suhtluses',
        'Kool, linn, ostud, tervis ja vaba aeg',
        'Dialoogid, rollimängud ja kuulamisülesanded',
        'Lühikesed tekstid ja lihtsad kirjad'
      ],
      outcomes:[
        {id:'A2_FAMILIAR_TOPICS',label:'Räägib tuttavatel teemadel',skillIds:['A2_DIALOGUE','A2_VOCAB_ROUTINE']},
        {id:'A2_BASIC_TENSES',label:'Kasutab põhilisi ajavorme',skillIds:['A2_PRESENT_FULL','A2_PAST_BASIC']},
        {id:'A2_SIMPLE_TEXTS',label:'Saab aru lihtsamatest tekstidest',skillIds:['A2_READ_TEXT']}
      ]
    },
    {
      level:'B1',
      title:'B1 iseseisev suhtleja',
      audience:'Õpilased, kes vajavad kindlust koolis ja eksamiks',
      goal:'Õpilane väljendab arvamust, põhjendab vastuseid ja mõistab tavatekste.',
      subjects:['Eesti keel','Inglise keel'],
      modules:[
        'Arvamuse avaldamine ja põhjendamine',
        'Teksti mõistmine ja kokkuvõte',
        'Grammatika kordamine: ajad, rektsioon, sidesõnad',
        'Suuline vastamine ja kirjalikud ülesanded'
      ],
      outcomes:[
        {id:'B1_EXPLAIN_IDEA',label:'Selgitab oma mõtet arusaadavalt',skillIds:['B1_SPEAK_DESC']},
        {id:'B1_STRUCTURED_TEXT',label:'Kirjutab struktureeritud teksti',skillIds:['B1_WRITE_PARA','B1_RELATIVE']},
        {id:'B1_EXAM_READINESS',label:'Valmistub tasemetööks või eksamiks',skillIds:['B1_READ_MEDIUM','B1_INTONATION']}
      ]
    },
    {
      level:'B2',
      title:'B2 tugev iseseisev tase',
      audience:'Õpilased, kes vajavad akadeemilisemat keelt',
      goal:'Õpilane kasutab täpsemat sõnavara, analüüsib tekste ja argumenteerib selgelt.',
      subjects:['Eesti keel','Inglise keel'],
      modules:[
        'Argumenteerimine ja arutlev tekst',
        'Keerukamad kuulamis- ja lugemisülesanded',
        'Sõnavara laiendamine teemavaldkondade kaupa',
        'Eksami formaadid ja ajajuhtimine'
      ],
      outcomes:[
        {id:'B2_COHERENT_ARGUMENT',label:'Kirjutab sidusa arutluse',skillIds:['B2_WRITE_ESSAY','B2_COMPLEX_SENT']},
        {id:'B2_PRECISE_LANGUAGE',label:'Kasutab täpseid väljendeid ja parandab vigu',skillIds:['B2_STYLE_REG','B2_GRAMMAR_FINE']},
        {id:'B2_LONG_CONVERSATION',label:'Suudab hoida pikemat vestlust',skillIds:['B2_ARGUMENT']}
      ]
    },
    {
      level:'C1',
      title:'C1 edasijõudnud tase',
      audience:'Edasijõudnud õppijad ja eksamiks valmistujad',
      goal:'Õpilane kasutab keelt paindlikult, täpselt ja loomulikult nii suuliselt kui kirjalikult.',
      subjects:['Eesti keel','Inglise keel'],
      modules:[
        'Akadeemiline ja ametlik väljendus',
        'Stiil, register ja täpne sõnakasutus',
        'Pikad tekstid, analüüs ja essee',
        'Suuline argumentatsioon ja tagasiside põhjal parandamine'
      ],
      outcomes:[
        {id:'C1_COMPLEX_IDEAS',label:'Väljendab keerulisi mõtteid täpselt',skillIds:['C1_NUANCE','C1_RHETORIC']},
        {id:'C1_DEMANDING_TEXTS',label:'Loeb ja analüüsib nõudlikke tekste',skillIds:['C1_READ_ALL']},
        {id:'C1_ADVANCED_EXAM',label:'Valmistub kõrgtaseme eksamiks',skillIds:['C1_WRITE_FORMAL','C1_LISTEN_NATIVE']}
      ]
    }
  ];
  const skillCatalog={
    Eelkool:[
      {id:'PRE_LISTEN_INSTRUCTIONS',cat:'kuulamine', name:'Lihtsate juhiste kuulamine'},
      {id:'PRE_BASIC_VOCAB',        cat:'sõnavara',  name:'Põhisõnavara ja fraasid'},
      {id:'PRE_PARTICIPATION',      cat:'rääkimine', name:'Õppemängus osalemine'}
    ],
    A1:[
      {id:'A1_GREET',        cat:'rääkimine',   name:'Tervimine'},
      {id:'A1_NUMBERS',      cat:'sõnavara',    name:'Arvud 1–100'},
      {id:'A1_COLORS',       cat:'sõnavara',    name:'Värvid'},
      {id:'A1_FAMILY_BASIC', cat:'sõnavara',    name:'Perekond'},
      {id:'A1_PRESENT_BASIC',cat:'grammatika',  name:'Olevik ma/sa/ta'},
      {id:'A1_NOMINATIV',    cat:'käänded',     name:'Nimetav kääne'},
      {id:'A1_READ_WORDS',   cat:'lugemine',    name:'Sõnade lugemine'},
      {id:'A1_WRITE_NAME',   cat:'kirjutamine', name:'Enda andmed'},
      {id:'A1_FOOD_BASIC',   cat:'sõnavara',    name:'Toit — põhisõnad'},
      {id:'A1_SIMPLE_Q',     cat:'lauseehitus', name:'Lihtsad küsimused'},
      {id:'A1_LISTEN_BASIC', cat:'kuulamine',   name:'Aeglane ja selge kõne'}
    ],
    A2:[
      {id:'A2_VOCAB_ROUTINE',cat:'sõnavara',    name:'Igapäevaelu'},
      {id:'A2_PRESENT_FULL', cat:'grammatika',  name:'Olevik kõik pöörded'},
      {id:'A2_PAST_BASIC',   cat:'grammatika',  name:'Lihtminevik'},
      {id:'A2_WORD_ORDER',   cat:'lauseehitus', name:'Sõnajärg'},
      {id:'A2_OSASTAV',      cat:'käänded',     name:'Osastav'},
      {id:'A2_ILLATIIV',     cat:'käänded',     name:'Sisseütlev'},
      {id:'A2_NEGATION',     cat:'grammatika',  name:'Eitus'},
      {id:'A2_QUESTIONS',    cat:'lauseehitus', name:'Küsimused'},
      {id:'A2_READ_TEXT',    cat:'lugemine',    name:'Lühitekst'},
      {id:'A2_WRITE_TEXT',   cat:'kirjutamine', name:'Kirjutamine'},
      {id:'A2_DIALOGUE',     cat:'rääkimine',   name:'Dialoog'},
      {id:'A2_TIME_EXPR',    cat:'sõnavara',    name:'Ajaväljendid'}
    ],
    B1:[
      {id:'B1_PAST_TYPES',   cat:'grammatika',  name:'Mineviku ajad'},
      {id:'B1_CONDITIONAL',  cat:'grammatika',  name:'Tingiv kõneviis'},
      {id:'B1_RELATIVE',     cat:'lauseehitus', name:'Põimlause'},
      {id:'B1_KAANDED_ADV',  cat:'käänded',     name:'Käänded edasijõudnud'},
      {id:'B1_PASSIVE',      cat:'grammatika',  name:'Umbisikuline tegumood'},
      {id:'B1_READ_MEDIUM',  cat:'lugemine',    name:'Keskmise teksti mõistmine'},
      {id:'B1_WRITE_PARA',   cat:'kirjutamine', name:'Lõigu kirjutamine'},
      {id:'B1_SPEAK_DESC',   cat:'rääkimine',   name:'Kirjeldamine'},
      {id:'B1_VOCAB_TOPIC',  cat:'sõnavara',    name:'Teemapõhine sõnavara'},
      {id:'B1_INTONATION',   cat:'kuulamine',   name:'Kuulamine'}
    ],
    B2:[
      {id:'B2_COMPLEX_SENT', cat:'lauseehitus', name:'Keerulised laused'},
      {id:'B2_SUBJUNCTIVE',  cat:'grammatika',  name:'Kaudne kõneviis'},
      {id:'B2_STYLE_REG',    cat:'kirjutamine', name:'Stiil ja register'},
      {id:'B2_IDIOMS',       cat:'sõnavara',    name:'Fraseoloogiad'},
      {id:'B2_ARGUMENT',     cat:'rääkimine',   name:'Argumenteerimine'},
      {id:'B2_READ_COMPLEX', cat:'lugemine',    name:'Keerulise teksti mõistmine'},
      {id:'B2_LISTEN_DETAIL',cat:'kuulamine',   name:'Detailne kuulamine'},
      {id:'B2_WRITE_ESSAY',  cat:'kirjutamine', name:'Essee'},
      {id:'B2_VOCAB_ABSTRACT',cat:'sõnavara',   name:'Abstraktne sõnavara'},
      {id:'B2_GRAMMAR_FINE', cat:'grammatika',  name:'Grammatika peensused'}
    ],
    C1:[
      {id:'C1_NUANCE',       cat:'sõnavara',    name:'Nüansirikkus'},
      {id:'C1_RHETORIC',     cat:'rääkimine',   name:'Retoorika'},
      {id:'C1_WRITE_FORMAL', cat:'kirjutamine', name:'Ametlik tekst'},
      {id:'C1_READ_ALL',     cat:'lugemine',    name:'Kõik tekstiliigid'},
      {id:'C1_LISTEN_NATIVE',cat:'kuulamine',   name:'Emakeelekõnelejad'},
      {id:'C1_COMPLEX_GRAM', cat:'grammatika',  name:'Kõrgem grammatika'},
      {id:'C1_CULTURE',      cat:'sõnavara',    name:'Kultuuriline arusaam'},
      {id:'C1_SPONTANEOUS',  cat:'rääkimine',   name:'Spontaanne kõne'}
    ]
  };
  return{programs,skillCatalog};
});
