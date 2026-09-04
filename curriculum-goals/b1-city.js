(function(root,factory){
  const data=factory();
  if(typeof module==='object'&&module.exports) module.exports=data;
  if(root) root.KeeleSeppCurriculumGoalsB1City=data;
})(typeof window!=='undefined'?window:globalThis,function(){
  const goals=[
    {
      id:'EST_B1_CITY_VOCAB',
      curriculumId:'EST_B1',
      unitId:'EST_B1_CITY_SERVICES',
      subject:'Eesti keel',
      level:'B1',
      sequence:10,
      title:'Linnaprobleemide põhisõnavara aktiveerimine',
      description:'Õpilane tunneb ja kasutab linnas liikumise, teenuste ning tavapäraste probleemide lahendamiseks vajalikku põhisõnavara.',
      targetSkillIds:['B1_VOCAB_TOPIC'],
      criticalSkillIds:['B1_VOCAB_TOPIC'],
      prerequisiteGoalIds:[],
      nextGoalIds:['EST_B1_CITY_EXPLAIN_PROBLEM','EST_B1_CITY_ASK_HELP'],
      successCriteria:[
        'kasutab vähemalt 8 teemapõhist sõna arusaadavas kontekstis',
        'seostab probleemi sobiva sõna või väljendiga ilma vastust ette näitava mudelita'
      ],
      lessonBlueprintIds:['est-b1-city-vocabulary-01'],
      legacyTopics:['Linn ja teenused'],
      legacyTitles:['Linnaprobleemide sõnavara','Kohad linnas ja tegevused']
    },
    {
      id:'EST_B1_CITY_EXPLAIN_PROBLEM',
      curriculumId:'EST_B1',
      unitId:'EST_B1_CITY_SERVICES',
      subject:'Eesti keel',
      level:'B1',
      sequence:20,
      title:'Linnas tekkinud probleemi selgitamine',
      description:'Õpilane kirjeldab linnas tekkinud probleemi seotud lausetega nii, et kuulaja saab olukorrast aru ilma valmis vastusemudelita.',
      targetSkillIds:['B1_SPEAK_DESC','B1_VOCAB_TOPIC'],
      criticalSkillIds:['B1_SPEAK_DESC'],
      prerequisiteGoalIds:['EST_B1_CITY_VOCAB'],
      nextGoalIds:['EST_B1_CITY_SOLVE_PROBLEM'],
      successCriteria:[
        'kirjeldab probleemi vähemalt 3 seotud lausega',
        'nimetab probleemi põhjuse või tagajärje',
        'kasutab vähemalt 4 teemapõhist sõna õigesti'
      ],
      lessonBlueprintIds:[],
      legacyTopics:['Linn ja teenused'],
      legacyTitles:['Probleemi selgitamine linnas']
    },
    {
      id:'EST_B1_CITY_ASK_HELP',
      curriculumId:'EST_B1',
      unitId:'EST_B1_CITY_SERVICES',
      subject:'Eesti keel',
      level:'B1',
      sequence:30,
      title:'Viisakas abi ja täpsustava info küsimine',
      description:'Õpilane pöördub teenindaja või võõra inimese poole viisakalt, küsib abi ning esitab olukorra lahendamiseks täpsustava küsimuse.',
      targetSkillIds:['B1_SPEAK_DESC'],
      criticalSkillIds:['B1_SPEAK_DESC'],
      prerequisiteGoalIds:['EST_B1_CITY_VOCAB'],
      nextGoalIds:['EST_B1_CITY_SOLVE_PROBLEM'],
      successCriteria:[
        'alustab pöördumist sobiva viisakusvormiga',
        'esitab vähemalt 2 arusaadavat täpsustavat küsimust',
        'reageerib saadud infole ühe loomuliku jätkuküsimuse või vastusega'
      ],
      lessonBlueprintIds:[],
      legacyTopics:['Linn ja teenused'],
      legacyTitles:['Abi küsimine linnas','Viisakas abi küsimine']
    },
    {
      id:'EST_B1_CITY_SOLVE_PROBLEM',
      curriculumId:'EST_B1',
      unitId:'EST_B1_CITY_SERVICES',
      subject:'Eesti keel',
      level:'B1',
      sequence:40,
      title:'Probleemi lahendamine linnas',
      description:'Õpilane ühendab probleemi selgitamise, abi küsimise ja lahenduse pakkumise üheks arusaadavaks suhtlusülesandeks.',
      targetSkillIds:['B1_SPEAK_DESC','B1_VOCAB_TOPIC'],
      criticalSkillIds:['B1_SPEAK_DESC','B1_VOCAB_TOPIC'],
      prerequisiteGoalIds:['EST_B1_CITY_EXPLAIN_PROBLEM','EST_B1_CITY_ASK_HELP'],
      nextGoalIds:['EST_B1_CITY_TRANSFER'],
      successCriteria:[
        'selgitab linnaprobleemi 3–5 seotud lausega',
        'küsib viisakalt abi ja esitab vähemalt ühe täpsustava küsimuse',
        'pakub vähemalt ühe realistliku lahenduse ning põhjendab seda',
        'kasutab vähemalt 6 teemapõhist aktiivset sõna'
      ],
      lessonBlueprintIds:['est-b1-city-problem-solving-01'],
      legacyTopics:['Linn ja teenused'],
      legacyTitles:['Probleemi lahendamine linnas']
    },
    {
      id:'EST_B1_CITY_TRANSFER',
      curriculumId:'EST_B1',
      unitId:'EST_B1_CITY_SERVICES',
      subject:'Eesti keel',
      level:'B1',
      sequence:50,
      title:'Linnaprobleemi lahenduse ülekanne uude olukorda',
      description:'Õpilane rakendab sama suhtlusoskust uues linnateenuse olukorras, mida eelmises ülesandes ei harjutatud.',
      targetSkillIds:['B1_SPEAK_DESC','B1_VOCAB_TOPIC'],
      criticalSkillIds:['B1_SPEAK_DESC'],
      prerequisiteGoalIds:['EST_B1_CITY_SOLVE_PROBLEM'],
      nextGoalIds:[],
      successCriteria:[
        'lahendab vähemalt ühe uue linnateenuse probleemi ilma valmis vastusemudelita',
        'kohandab sõnavara ja küsimusi uue konteksti järgi',
        'põhjendab valitud lahendust vähemalt ühe põhjusega'
      ],
      lessonBlueprintIds:[],
      legacyTopics:['Linn ja teenused'],
      legacyTitles:['Ülekanne uude olukorda','Linnaprobleemi transfer']
    }
  ];

  return {
    graphId:'EST_B1_CITY_SERVICES_V1',
    curriculumId:'EST_B1',
    unitId:'EST_B1_CITY_SERVICES',
    subject:'Eesti keel',
    level:'B1',
    goals
  };
});