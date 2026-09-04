(function(root,factory){
  const lesson=factory();
  if(typeof module==='object'&&module.exports) module.exports=lesson;
  if(root){
    root.KeeleSeppAdaptiveLessons=root.KeeleSeppAdaptiveLessons||{};
    root.KeeleSeppAdaptiveLessons[lesson.id]=lesson;
  }
})(typeof window!=='undefined'?window:globalThis,function(){
  return {
    schemaVersion:1,
    id:'est-b1-city-vocabulary-01',
    subject:'Eesti keel',
    cefrLevel:'B1',
    category:'Linn ja teenused',
    title:'Linnaprobleemide põhisõnavara',
    curriculumGoalIds:['EST_B1_CITY_VOCAB'],
    durationMinutes:60,
    goal:'Õpilane tunneb ja kasutab linnas liikumise, teenuste ning tavapäraste probleemide lahendamiseks vajalikku põhisõnavara arusaadavas kontekstis.',
    successCriteria:[
      'kasutab vähemalt 8 teemapõhist sõna arusaadavas kontekstis',
      'seostab probleemi sobiva sõna või väljendiga ilma vastust ette näitava mudelita',
      'eristab vähemalt 6 aktiivse sõna tähendust lähikontekstis',
      'kasutab vähemalt 4 aktiivset sõna uues linnasituatsioonis'
    ],
    prerequisites:[
      'põhilised kohad linnas',
      'lihtsad liikumise ja transpordi tegusõnad',
      'võime moodustada B1 tasemel lihtsaid terviklauseid'
    ],
    teacherBrief:{
      beforeLesson:'Ära näita sõnapanka enne diagnostikat. Alusta sellest, mida õpilane juba ise meenutab.',
      principle:'Aktiveeri sõnu kasutuses, mitte ainult tõlke paaridena. Muuda toe hulka, kuid hoia sama B1 sõnavaraeesmärk.',
      doNotDo:'Ära märgi tundmatut sõna automaatselt nulliks ega õpeta kõiki 12 sõna korraga, kui õpilane vajab väiksemat aktiivset hulka.',
      typicalErrors:[
        'õpilane tunneb sõna ära, kuid ei kasuta seda lauses',
        'rike ja hilinema lähevad olukorra kirjelduses segamini',
        'pöörduma kasutatakse ilma sobiva sihita',
        'abi küsima jääb otsetõlkeks ega moodusta loomulikku väljendit'
      ]
    },
    vocabulary:[
      {id:'rike',word:'rike',translation:'поломка / неисправность',example:'Bussil tekkis rike.'},
      {id:'hilinema',word:'hilinema',translation:'опаздывать',example:'Buss hilineb kakskümmend minutit.'},
      {id:'peatuma',word:'peatuma',translation:'останавливаться',example:'Tramm peatus vale peatuse juures.'},
      {id:'eksima',word:'eksima',translation:'ошибаться / заблудиться',example:'Ma eksisin vanalinnas ära.'},
      {id:'abi-kusima',word:'abi küsima',translation:'просить помощи',example:'Ma küsisin politseinikult abi.'},
      {id:'juhatama',word:'juhatama',translation:'показывать дорогу / направлять',example:'Kas te saaksite mind jaama juhatada?'},
      {id:'lahendus',word:'lahendus',translation:'решение',example:'Kõige lihtsam lahendus on minna jalgsi.'},
      {id:'asendusbuss',word:'asendusbuss',translation:'замещающий автобус',example:'Peatusest väljub asendusbuss.'},
      {id:'teatama',word:'teatama',translation:'сообщать',example:'Juht teatas hilinemisest.'},
      {id:'poorduma',word:'pöörduma',translation:'обращаться',example:'Probleemi korral pöörduge infolauda.'},
      {id:'selgitama',word:'selgitama',translation:'объяснять',example:'Palun selgitage, mis juhtus.'},
      {id:'soovitama',word:'soovitama',translation:'рекомендовать',example:'Ma soovitan minna järgmise bussiga.'}
    ],
    languageFocus:[
      {id:'city-collocations',label:'Linnaprobleemi sõnaühendid',patterns:['tekkis rike','buss hilineb','abi küsima','pöörduma infolauda','olukorda selgitama','lahendust soovitama']},
      {id:'problem-word-link',label:'Olukord → täpne sõna',patterns:['transport ei tööta → rike','ei leia teed → eksima','vajad infot → pöörduma / abi küsima','vajad alternatiivi → lahendus / asendusbuss']}
    ],
    diagnostic:{
      workspaceType:'diagnostic',
      durationMinutes:7,
      instruction:'Küsi vastused ükshaaval. Ära näita enne vastamist tõlget, sõnakaarti ega näitelauset.',
      items:[
        {id:'vocab-d1',max:1,skillIds:['vocabulary'],prompt:'Buss tuleb kakskümmend minutit plaanitust hiljem. Ütle olukord ühe sobiva tegusõnaga.',expected:'Buss hilineb.'},
        {id:'vocab-d2',max:1,skillIds:['vocabulary'],prompt:'Kuidas nimetad tehnilist probleemi, mille tõttu buss või tramm ei tööta?',expected:'rike'},
        {id:'vocab-d3',max:1,skillIds:['vocabulary'],prompt:'Sa ei leia õiget teed vanalinnas. Milline aktiivne tegusõna kirjeldab seda olukorda?',expected:'eksima / ära eksima'},
        {id:'vocab-d4',max:1,skillIds:['vocabulary'],prompt:'Ütle eesti keeles: «обратиться в информационный пункт».',expected:'pöörduma infolauda / pöörduda infolauda'}
      ],
      routeThresholds:{support:'0–1',core:'2–3',advanced:'4'}
    },
    stages:[
      {
        id:'stage-1-vocabulary',
        title:'1. Sõnade aktiveerimine',
        workspaceType:'vocabulary',
        minutes:20,
        skill:'vocabulary',
        checkpoint:'Õpilane peab kasutama sõna, mitte ainult selle ära tundma.',
        routes:{
          support:{
            teacherInstruction:'Tööta korraga 6 põhisõnaga. Hoia nähtaval sõna, tõlge ja näitelause; sulge tugi kohe, kui õpilane hakkab sõna ise kasutama.',
            tasks:[
              'Sobita 6 põhisõna nende tähenduse või olukorraga.',
              'Õpetaja ütleb 6 linnasituatsiooni. Õpilane valib iga olukorra jaoks sobiva aktiivse sõna.',
              'Moodusta iga 6 põhisõnaga üks lühike terviklause.'
            ],
            supportTools:['sõnakaart','tõlge','näitelause']
          },
          core:{
            teacherInstruction:'Kasuta 10 aktiivset sõna. Tõlge võib olla esimesel kordusel nähtav, seejärel peab õpilane töötama eesti keeles.',
            tasks:[
              'Selgita või näitlikusta 6 aktiivset sõna ilma vene tõlget ette ütlemata.',
              'Vali 6 linnasituatsiooni jaoks täpne aktiivne sõna või väljend.',
              'Moodusta vähemalt 8 aktiivse sõnaga loomulikud laused.'
            ],
            supportTools:['vajadusel üks neutraalne kontekstivihje']
          },
          advanced:{
            teacherInstruction:'Kasuta kõiki 12 sõna ilma tõlgeteta. Nõua tähenduse seletamist, parafraseerimist ja täpset konteksti.',
            tasks:[
              'Selgita eesti keeles vähemalt 8 aktiivse sõna tähendus ilma sõna tõlkimata.',
              'Loo 6 linnasituatsiooni, milles kaaslane peab sinu kirjelduse järgi õige sõna ära arvama.',
              'Kasuta vähemalt 10 aktiivset sõna lausetes nii, et vähemalt neljas lauses on kaks aktiivset sõna koos.'
            ],
            supportTools:[]
          }
        }
      },
      {
        id:'stage-2-lexical-practice',
        title:'2. Sõnaühendid ja täpne valik',
        workspaceType:'controlled_practice',
        minutes:14,
        skill:'vocabulary',
        checkpoint:'Hinda, kas õpilane valib tähenduse järgi sobiva sõna ja kasutab seda loomulikus sõnaühendis.',
        routes:{
          support:{
            teacherInstruction:'Näita korraga 4–6 sõnaühendit. Õpilane lõpetab lause või valib sobiva paari.',
            tasks:[
              'Lõpeta 6 sõnaühendit: tekkis ..., buss ..., abi ..., infolauda ..., olukorda ..., lahendust ... .',
              'Vali igale probleemile sobiv sõnaühend ja ütle terve lause.',
              'Asenda üldine sõna täpse aktiivse sõnaga: probleem, minema, ütlema, aitama.'
            ],
            expectedAnswerExamples:['tekkis rike; buss hilineb; abi küsima; pöörduma infolauda']
          },
          core:{
            teacherInstruction:'Näita ainult olukorda. Õpilane peab ise meenutama sobiva aktiivse sõna ja moodustama loomuliku sõnaühendi.',
            tasks:[
              'Paranda 6 ebatäpset lauset, asendades üldise sõna sobiva aktiivse sõnaga.',
              'Moodusta 6 sõnaühendit ning kasuta igaühte uues lauses.',
              'Selgita, miks valisid kahes sarnases olukorras erineva aktiivse sõna.'
            ],
            expectedAnswerExamples:['Bussil tekkis rike. Juht teatas hilinemisest. Probleemi korral pöördun infolauda.']
          },
          advanced:{
            teacherInstruction:'Ära näita mudeleid. Õpilane peab eristama lähitähendusi ja põhjendama sõnavalikut.',
            tasks:[
              'Parafraseeri 6 kirjeldust, kasutades igas vastuses täpsemat aktiivset sõna või väljendit.',
              'Moodusta vähemalt 6 loomulikku sõnaühendit ning selgita kahe valiku tähendusvarjundit.',
              'Leia kolm ebatäpset või ebaloomulikku sõnakasutust ja põhjenda parandust eesti keeles.'
            ],
            expectedAnswerExamples:['Ma eksisin ära, seetõttu küsisin abi. Juht teatas rikkest ja soovitas asendusbussi.']
          }
        }
      },
      {
        id:'stage-3-vocabulary-transfer',
        title:'3. Sõnavara kasutamine suhtluses',
        workspaceType:'roleplay',
        taskWorkspaceTypes:['roleplay','transfer','roleplay'],
        minutes:12,
        skill:'vocabulary',
        checkpoint:'Sõnavara hinnatakse kasutuse järgi: kas valitud sõna sobib olukorda ja aitab mõtet edasi anda.',
        routes:{
          support:{
            teacherInstruction:'Õpilane võib enne vastamist vaadata 6 põhisõna, kuid rollimängu ajal ära ütle talle valmis lauset.',
            tasks:[
              'Rollimäng: buss ei tule ja sa vajad infot. Kasuta vestluses vähemalt 4 aktiivset sõna.',
              'Uus olukord: eksisid vanalinnas ära. Kirjelda olukorda ja kasuta vähemalt 4 aktiivset sõna.',
              'Rollimäng: õpetaja on infotöötaja. Selgita üht transpordiprobleemi ja kasuta vähemalt 5 aktiivset sõna.'
            ],
            success:'Õpilane kasutab abiga vähemalt 5 aktiivset sõna sobivas kontekstis.'
          },
          core:{
            teacherInstruction:'Anna olukord, kuid ära anna sõnapanka. Märgi kasutatud aktiivsed sõnad ja küsi vajadusel üks täpsustav küsimus.',
            tasks:[
              'Rollimäng: tramm peatus ootamatult. Selgita olukorda ja kasuta vähemalt 6 aktiivset sõna.',
              'Uus olukord: vale buss viis sind tundmatusse piirkonda. Kirjelda, mis juhtus, kasutades vähemalt 6 aktiivset sõna.',
              'Rollimäng: küsi teenindajalt infot ja paku üks lahendus, kasutades kokku vähemalt 8 aktiivset sõna.'
            ],
            success:'Õpilane kasutab iseseisvalt vähemalt 8 aktiivset sõna arusaadavas suhtluskontekstis.'
          },
          advanced:{
            teacherInstruction:'Loo poole ülesande pealt uus komplikatsioon. Õpilane peab sõnavara paindlikult ümber valima ja kasutama ilma mudelita.',
            tasks:[
              'Rollimäng: rong jääb ära ja infotabloo annab vastuolulist infot. Kasuta vähemalt 8 aktiivset sõna.',
              'Uus olukord: ühistransport ei tööta ja esimene alternatiiv ei sobi. Selgita olukorda vähemalt 8 aktiivse sõnaga.',
              'Rollimäng: vaheta rolle ja anna ise kliendile selgitus ning soovitus, kasutades vähemalt 10 aktiivset sõna.'
            ],
            success:'Õpilane kasutab vähemalt 10 aktiivset sõna paindlikult ja täpselt, sh uues olukorras.'
          }
        }
      },
      {
        id:'stage-4-assessment',
        title:'4. Lõppkontroll',
        workspaceType:'assessment',
        minutes:7,
        skill:'vocabulary',
        routes:{
          support:{
            teacherInstruction:'Ära näita vastuseid ega tõlkeid. Võid olukorra ühe korra neutraalselt ümber sõnastada, kuid ära ütle sihtsõna.',
            tasks:[
              'Kuula 8 lühikest linnasituatsiooni ja nimeta iga olukorra jaoks sobiv aktiivne sõna või väljend.',
              'Kasuta vähemalt 8 tänast aktiivset sõna neljas arusaadavas lauses.'
            ],
            success:'Eesmärk on sama: vähemalt 8 aktiivset sõna sobivas kontekstis.'
          },
          core:{
            teacherInstruction:'Sooritus ilma sõnapangata. Märgi ainult tegelikult kasutatud ja konteksti sobivad sõnad.',
            tasks:[
              'Kuula 8 uut linnasituatsiooni ja nimeta iga olukorra jaoks sobiv aktiivne sõna või väljend.',
              'Kirjelda üht uut linnaprobleemi, kasutades vähemalt 8 aktiivset sõna.'
            ],
            success:'Õpilane kasutab vähemalt 8 aktiivset sõna arusaadavas kontekstis ilma vastusemudelita.'
          },
          advanced:{
            teacherInstruction:'Ära näita sõnapanka. Nõua täpset sõnavalikut ja vähemalt üht parafraseerimist.',
            tasks:[
              'Selgita 10 aktiivse sõna tähendus uute näidete abil ilma neid tõlkimata.',
              'Kirjelda uut linnaprobleemi, kasutades vähemalt 10 aktiivset sõna ning parafraseeri kaks neist teise väljendiga.'
            ],
            success:'Õpilane kasutab vähemalt 10 aktiivset sõna täpselt ja paindlikult uues kontekstis.'
          }
        },
        teacherRecord:['vocabulary 0–100 ainult päriselt hinnatud soorituse põhjal','rasked sõnad märgi eraldi vocabulary evidence’ina','üks lühike handoff järgmise eesmärgi jaoks']
      }
    ],
    homework:{
      support:'Vali 6 raskemat sõna ja kirjuta igaühega üks isiklik näitelause.',
      core:'Kirjuta 8–10 lausega linnaprobleemi kirjeldus, kasutades vähemalt 8 aktiivset sõna.',
      advanced:'Koosta 10 aktiivse sõnaga uus linnasituatsioon ja lisa iga sõna kohta lühike eestikeelne seletus.'
    },
    masteryPolicy:{
      canonical:'students.skillMap',
      automaticWrite:false,
      note:'Adaptive evidence ei muuda selles release slice’is automaatselt kanonilist mastery-projektsiooni.'
    }
  };
});