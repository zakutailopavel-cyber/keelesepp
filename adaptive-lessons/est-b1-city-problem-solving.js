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
    id:'est-b1-city-problem-solving-01',
    subject:'Eesti keel',
    cefrLevel:'B1',
    category:'Linn ja teenused',
    title:'Probleemi lahendamine linnas',
    durationMinutes:60,
    goal:'Õpilane oskab selgitada linnas tekkinud probleemi, küsida abi ning pakkuda vähemalt üht lahendust viisakas ja arusaadavas eesti keeles.',
    successCriteria:[
      'kasutab vähemalt 6 tunni aktiivset sõna õigesti',
      'kirjeldab probleemi 3–5 seotud lausega',
      'esitab vähemalt 2 täpsustavat küsimust',
      'pakub lahenduse ja põhjendab seda vähemalt ühe põhjusega'
    ],
    prerequisites:[
      'kohad linnas ja põhilised teenused',
      'olevik ja lihtmineviku põhitunnetus',
      'küsimussõnad kus, kuhu, kust, miks, kuidas',
      'viisakusvormid palun, vabandage, kas te saaksite'
    ],
    teacherBrief:{
      beforeLesson:'Valmista ette linnakaart või ava tahvlil lihtne kaart. Ära õpeta kogu sõnavara ette enne diagnostikat.',
      principle:'Muuda toe hulka, mitte tunni eesmärki. Tugi-, põhi- ja edasijõudnu rada peavad jõudma sama kommunikatiivse tulemuseni.',
      doNotDo:'Ära hoia õpilast kogu tunni ühel rajal ainult esimese vea tõttu. Hinda iga etappi eraldi.',
      typicalErrors:[
        'õpilane nimetab ainult koha, kuid ei kirjelda probleemi',
        'paluma/soovima konstruktsioonides kaob da-infinitiiv',
        'küsimus jääb vene keele sõnajärjega',
        'põhjenduses kasutatakse ainult sest ilma tervikliku lauseta'
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
      {id:'polite-request',label:'Viisakas abipalve',patterns:['Kas te saaksite mind aidata?','Palun öelge, kuidas ma saan ...','Kas te oskate soovitada ...?']},
      {id:'problem-reason-solution',label:'Probleem → põhjus → lahendus',patterns:['Probleem on selles, et ...','See juhtus, sest ...','Seetõttu võiks ...']}
    ],
    diagnostic:{
      workspaceType:'diagnostic',
      durationMinutes:7,
      instruction:'Näita olukordi ükshaaval. Ära paranda enne diagnostika lõppu.',
      items:[
        {id:'d1',max:1,skillIds:['vocabulary'],prompt:'Ütle eesti keeles: «Автобус опаздывает».',expected:'Buss hilineb.'},
        {id:'d2',max:1,skillIds:['speaking'],prompt:'Küsi viisakalt võõralt inimeselt abi.',expected:'Kas te saaksite mind aidata? või samaväärne.'},
        {id:'d3',max:1,skillIds:['speaking'],prompt:'Sa ei leia raudteejaama. Ütle probleem ühe lausega.',expected:'Ma ei leia raudteejaama / Ma eksisin ära.'},
        {id:'d4',max:1,skillIds:['grammar','speaking'],prompt:'Küsi, kuidas minna kesklinna.',expected:'Kuidas ma saan kesklinna? / Kuidas kesklinna minna?'},
        {id:'d5',max:1,skillIds:['speaking'],prompt:'Paku üks lahendus: buss ei tule.',expected:'Võime minna jalgsi / võtta takso / oodata järgmist bussi.'}
      ],
      routeThresholds:{support:'0–2',core:'3–4',advanced:'5'}
    },
    stages:[
      {
        id:'stage-1-vocabulary',
        title:'1. Sõnavara aktiveerimine',
        workspaceType:'vocabulary',
        minutes:13,
        skill:'vocabulary',
        checkpoint:'10 punkti. 0–5 → tugi; 6–8 → põhi; 9–10 ilma vihjeta → edasijõudnu.',
        routes:{
          support:{
            teacherInstruction:'Kasuta korraga ainult 6 põhisõna: rike, hilinema, eksima, abi küsima, lahendus, selgitama. Hoia nähtaval sõna + tõlge + näitelause.',
            tasks:[
              'Sobita 6 sõna ja tõlge.',
              'Õpetaja loeb 6 olukorda; õpilane valib sobiva sõna.',
              'Lõpeta mudeli järgi 4 lauset: Buss ..., Ma ..., Probleem on ..., Lahendus on ...'
            ],
            supportTools:['sõnapank','näitelause','üks kord võib valida kahe vastuse vahel']
          },
          core:{
            teacherInstruction:'Kasuta 10 aktiivset sõna. Tõlge eemaldatakse pärast esimest kordust.',
            tasks:[
              'Selgita 5 sõna eesti keeles või anna näide.',
              'Vali 5 linnaprobleemile sobiv sõna ja moodusta lause.',
              'Koosta paarid probleem → võimalik lahendus.'
            ],
            supportTools:['vajadusel üks vihje sõna algustähega']
          },
          advanced:{
            teacherInstruction:'Kasuta kõiki 12 sõna. Ära näita tõlkeid. Nõua tähenduse tuletamist kontekstist.',
            tasks:[
              'Selgita vähemalt 8 sõna eesti keeles ilma tõlketa.',
              'Moodusta 3 lauset, kus ühes lauses on vähemalt 2 aktiivset sõna.',
              'Leia ise kaks linnaprobleemi, mida nimekirjas ei olnud, ja seosta need tunni sõnavaraga.'
            ],
            supportTools:[]
          }
        }
      },
      {
        id:'stage-2-language',
        title:'2. Probleemi selgitamine ja abi küsimine',
        workspaceType:'controlled_practice',
        minutes:15,
        skill:'grammar',
        checkpoint:'Hinda 5 lauset: arusaadavus, viisakus, konstruktsioon, sõnajärg, põhjus-tagajärg.',
        routes:{
          support:{
            teacherInstruction:'Anna kolm lausealgust korraga nähtavale. Õpilane valib sobiva ja lõpetab lause.',
            tasks:[
              'Lõpeta 5 lauset: Probleem on selles, et ... / Kas te saaksite ... / Ma soovin ...',
              'Pane 4 küsimuse sõnad õigesse järjekorda.',
              'Muuda 3 otsest käsku viisakaks palveks.'
            ],
            expectedAnswerExamples:['Kas te saaksite öelda, kus on bussipeatus?','Probleem on selles, et buss ei tulnud.']
          },
          core:{
            teacherInstruction:'Näita ainult funktsiooni: probleem, täpsustav küsimus, lahendus. Õpilane valib konstruktsiooni ise.',
            tasks:[
              'Kirjelda 3 olukorda kahe seotud lausega.',
              'Esita iga olukorra kohta üks viisakas küsimus.',
              'Lisa vähemalt ühele vastusele sest või seetõttu.'
            ],
            expectedAnswerExamples:['Buss hilineb, seetõttu jään ma kohtumisele hiljaks. Kas te oskate soovitada teist marsruuti?']
          },
          advanced:{
            teacherInstruction:'Ära anna lausemalle. Paranda alles pärast tervet vastust.',
            tasks:[
              'Selgita 3 probleemi nii, et kuulaja saaks olukorrast aru ilma pilti nägemata.',
              'Kasuta vähemalt kahte erinevat viisakat pöördumist.',
              'Sõnasta üks lahendus ümber ametlikumas registris.'
            ],
            expectedAnswerExamples:['Palun selgitage, kas asendusbuss väljub samast peatusest ning kui kaua tuleb oodata.']
          }
        }
      },
      {
        id:'stage-3-speaking-transfer',
        title:'3. Rollimäng ja ülekanne uude olukorda',
        workspaceType:'roleplay',
        taskWorkspaceTypes:['roleplay','transfer','roleplay'],
        minutes:18,
        skill:'speaking',
        checkpoint:'0–100: ülesande täitmine 40%, arusaadavus 25%, aktiivne sõnavara 20%, keeleline korrektsus 15%.',
        routes:{
          support:{
            teacherInstruction:'Õpilane valib ühe kolmest olukorrast. Hoia ekraanil 5 sammu: tervitus → probleem → küsimus → lahendus → lõpetamine.',
            tasks:[
              'Rollimäng: oled bussijaamas, sinu buss tühistati. Õpetaja on infotöötaja.',
              'Pärast esimest katset vaata koos üle, milline samm jäi puudu, ja korda rollimängu.'
            ],
            success:'Õpilane jõuab abiga kommunikatiivse tulemuseni ja kasutab vähemalt 4 aktiivset sõna.'
          },
          core:{
            teacherInstruction:'Anna olukord, kuid mitte lahendust. Õpetaja vastab rollis loomulikult ja esitab ühe ootamatu täpsustava küsimuse.',
            tasks:[
              'Rollimäng: telefon kadus trammis. Pöördu teenindaja poole, selgita olukorda ja lepi kokku järgmine samm.',
              'Teine olukord: oled turist ja vale buss viis sind tundmatusse piirkonda. Küsi abi möödujalt.'
            ],
            success:'Õpilane lahendab vähemalt ühe olukorra iseseisvalt ja kasutab vähemalt 6 aktiivset sõna.'
          },
          advanced:{
            teacherInstruction:'Loo ootamatu komplikatsioon poole dialoogi pealt. Ära paku sõnavara ega struktuuri.',
            tasks:[
              'Rollimäng: rong jääb ära, sul on 45 minuti pärast lennujaamas oluline kohtumine. Leia koos teenindajaga realistlik lahendus.',
              'Komplikatsioon: esimene pakutud lahendus ei sobi. Õpilane peab selle viisakalt tagasi lükkama ja alternatiivi põhjendama.',
              'Lõpus vaheta rollid: õpilane on teenindaja ja õpetaja klient.'
            ],
            success:'Õpilane juhib vestlust, põhjendab valikut ning reageerib uuele infole ilma ettevalmistatud mudelita.'
          }
        }
      },
      {
        id:'stage-4-exit',
        title:'4. Lõppkontroll ja handoff',
        workspaceType:'assessment',
        minutes:7,
        skill:'speaking',
        routes:{
          support:{tasks:['Ütle 3 uut sõna ja üks lause iga sõnaga.','Vasta: mida sa teed, kui buss ei tule?']},
          core:{tasks:['Selgita ühe minutiga üht tänast linnaprobleemi ja selle lahendust.']},
          advanced:{tasks:['Selgita ühe minutiga uut probleemi, mida tunnis ei harjutatud, ja paku kaks lahendust koos põhjendusega.']}
        },
        teacherRecord:['vocabulary 0–100','grammar 0–100','speaking 0–100','reading/listening/writing ainult siis, kui neid reaalselt hinnati','sõnapõhine evidence vähemalt raskete sõnade kohta','üks lühike märkus järgmisele õpetajale'],
        rule:'Ära märgi hindamata oskust nulliks. Null tähendab tegelikku tulemust 0; hindamata väärtus peab puuduma.'
      }
    ],
    homework:{
      support:'Kirjuta 6 lauset ühe linnaprobleemi kohta, kasutades etteantud lausealgusi ja vähemalt 5 aktiivset sõna.',
      core:'Kirjuta 90–110 sõna: linnas tekkis probleem. Kirjelda olukorda, abi küsimist ja lahendust. Kasuta vähemalt 7 aktiivset sõna.',
      advanced:'Salvesta 1,5–2 minuti suuline vastus uue linnaprobleemi kohta. Paku kaks lahendust ja põhjenda, kumb on parem.'
    },
    masteryPolicy:{
      advanceThreshold:75,
      criticalSkills:['speaking','grammar'],
      vocabularyMastered:85,
      vocabularyLearning:65,
      principle:'Tund võib olla toimunud, kuid programm ei loe oskust omandatuks ainult kohaloleku tõttu.'
    }
  };
});