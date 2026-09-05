(function(root,factory){
  const binding=typeof module==='object'&&module.exports?require('../functions/curriculum-lesson-bindings.js'):root.KeeleSeppCurriculumLessonBindings;
  const lesson=factory(binding.SCHOOL);
  if(typeof module==='object'&&module.exports) module.exports=lesson;
  if(root){root.KeeleSeppAdaptiveLessons=root.KeeleSeppAdaptiveLessons||{};root.KeeleSeppAdaptiveLessons[lesson.id]=lesson;}
})(typeof window!=='undefined'?window:globalThis,function(source){
  const variant=(teacherInstruction,tasks,extra={})=>({teacherInstruction,tasks,...extra});
  return {
    schemaVersion:1,id:source.lessonBlueprintId,title:source.title,
    subject:source.subject,cefrLevel:source.level,category:source.topicName,
    curriculumLessonKey:source.key,curriculumGoalIds:[...source.curriculumGoalIds],durationMinutes:60,
    goal:'Õpilane kirjeldab oma õppimist, kasutab sõnu tund, õpetaja, kodutöö ja hinne ning küsib õpetajalt täpsustust.',
    successCriteria:[
      'Kasutab sõnu tund, õpetaja, kodutöö ja hinne neljas tähenduslikus lauses.',
      'Moodustab vähemalt kolm arusaadavat lauset: mida õpib, mida peab tegema ja miks.',
      'Peab vähemalt nelja vooruga vestluse ning küsib ühe täpsustava küsimuse.',
      'Rakendab samu oskusi uuel kursusel ilma eelmise vestluse vastusemudelita.'
    ],
    prerequisites:['Lihtsa olevikulause moodustamine','Oskus küsida mis, millal ja miks'],
    teacherBrief:{beforeLesson:'Alusta ilma sõnakaartideta. Küsi diagnostika küsimused ükshaaval.',principle:'Hinda sõnavara, grammatikat ja rääkimist eraldi. Ühe oskuse abi ei määra teisi radu.',doNotDo:'Ära märgi osalemist omandamiseks. Märgi ainult kuuldud sooritus.',typicalErrors:['tund kui aeg ja tund kui õppetund','õpin / õpetan segiajamine','pean + ma-tegevusnimi','hinne ja hind segiajamine']},
    vocabulary:[
      {id:'tund',word:'tund',translation:'урок; час',example:'Eesti keele tund algab kell kümme.'},
      {id:'opetaja',word:'õpetaja',translation:'учитель',example:'Õpetaja selgitab uut teemat.'},
      {id:'kodutoo',word:'kodutöö',translation:'домашняя работа',example:'Ma teen kodutööd õhtul.'},
      {id:'hinne',word:'hinne',translation:'оценка',example:'Sain kontrolltöö eest hea hinde.'},
      {id:'oppima',word:'õppima',translation:'учиться; изучать',example:'Ma õpin eesti keelt.'},
      {id:'opetama',word:'õpetama',translation:'учить; преподавать',example:'Ta õpetab matemaatikat.'},
      {id:'oppeaine',word:'õppeaine',translation:'учебный предмет',example:'Minu lemmikõppeaine on ajalugu.'},
      {id:'ulesanne',word:'ülesanne',translation:'задание',example:'See ülesanne on keeruline.'},
      {id:'kontrolltoo',word:'kontrolltöö',translation:'контрольная работа',example:'Reedel on meil kontrolltöö.'},
      {id:'tunniplaan',word:'tunniplaan',translation:'расписание уроков',example:'Vaatan homset tunniplaani.'},
      {id:'tagasiside',word:'tagasiside',translation:'обратная связь',example:'Küsin õpetajalt tagasisidet.'},
      {id:'tahtaeg',word:'tähtaeg',translation:'срок',example:'Kodutöö tähtaeg on esmaspäeval.'}
    ],
    languageFocus:[{id:'school-sentences',label:'Õppimisest rääkimine',patterns:['Ma õpin … / Õpetaja õpetab …','Ma pean … tegema / õppima / kordama.','Ma küsin abi, sest …','Kas te saaksite … selgitada?']}],
    diagnostic:{workspaceType:'diagnostic',durationMinutes:6,instruction:'Ära näita vastust enne õpilase vastamist. Märgi hinnang ainult selle küsimuse oskusele.',items:[
      {id:'school-d-vocabulary',skillIds:['vocabulary'],max:1,prompt:'Nimeta eesti keeles: урок, учитель, домашняя работа, оценка. Kasuta kahte neist lauses.',expected:'tund, õpetaja, kodutöö, hinne; tähenduslikud laused.'},
      {id:'school-d-grammar',skillIds:['grammar'],max:1,prompt:'Räägi kahe lausega: mida sa õpid ja mida sa pead homseks tegema?',expected:'Nt Ma õpin eesti keelt. Ma pean homseks kodutöö tegema.'},
      {id:'school-d-speaking',skillIds:['speaking'],max:1,prompt:'Sa ei saanud õpetaja ülesandest aru. Alusta vestlust ja küsi täpsustust.',expected:'Arusaadav pöördumine ja küsimus ülesande kohta; õpetaja vastab alles pärast küsimust.'}
    ],routeThresholds:{support:'Vajab abi',core:'Sai hakkama',advanced:'Liiga kerge'}},
    stages:[
      {id:'school-vocabulary',title:'1. Koolisõnad',workspaceType:'vocabulary',minutes:10,skill:'vocabulary',checkpoint:'Neli sihtsõna peavad jõudma õpilase enda lausetesse.',routes:{
        support:variant('Kasuta esimest kuut kaarti. Õpilane näeb tõlget ja näidet; seejärel peida tugi.', ['Ütle, milline kaart tähendab урок, учитель, домашняя работа ja оценка. Seejärel ütle need neli sõna kaarte vaatamata.','Koosta iga nelja sihtsõnaga lause oma õppimise kohta. Võid esmalt vaadata kaardi näidet.']),
        core:variant('Kasuta kümmet kaarti. Tõlge avaneb ainult vajadusel; lõpuks sulge kaardid.', ['Selgita sõnu tund, õpetaja, kodutöö ja hinne eesti keeles või too näide.','Räägi oma koolipäevast kuue lausega. Kasuta kõiki nelja sihtsõna ja veel kahte kaardisõna.']),
        advanced:variant('Kasuta kõiki kaarte ilma tõlketa. Küsi täpsemat tähendust ja isiklikke näiteid.', ['Selgita kõiki nelja sihtsõna ning erinevust: õppima / õpetama ja hinne / hind.','Võrdle kaht õppimisviisi kaheksa lausega, kasutades sihtsõnu ning sõnu tagasiside ja tähtaeg.'])}},
      {id:'school-grammar',title:'2. Õpin ja pean tegema',workspaceType:'controlled_practice',minutes:12,skill:'grammar',checkpoint:'Pean + ma-tegevusnimi; õpin ja õpetan erinevad; sest seob põhjuse.',routes:{
        support:variant('Loe olukorrad ette ja näita lausealguseid. Küsi iga lause tähendust.', ['Lõpeta: Ma … eesti keelt. Õpetaja … eesti keelt. Homme on kontrolltöö: ma pean täna … .','Ütle kaks lauset: pead kodutöö tegema; vajad abi, sest ülesanne on raske. Kasuta nähtavaid lausealguseid.']),
        core:variant('Õpilane loob laused ise. Lausealguseid võib vaadata pärast esimest katset.', ['Paranda ja selgita: Mina õpetab eesti keelt. Ma pean teen kodutöö. Õpetaja õpib mulle uut sõna.','Ütle kolm seotud lauset: mida õpid, mida pead homseks tegema ja miks küsid õpetajalt abi.']),
        advanced:variant('Peida mudelid. Küsi nii paranduse põhjust kui uut isiklikku näidet.', ['Sõnasta ümber ja põhjenda parandusi: Ma pean teen ülesanne. Õpetaja õpib mulle grammatikat. Ma küsin abi miks see on raske.','Võrdle tänast ja homset õppimist nelja lausega; kasuta pean ja sest ning esita viisakas täpsustav küsimus.'])}},
      {id:'school-speaking',title:'3. Vestlus õpetajaga',workspaceType:'roleplay',minutes:10,skill:'speaking',routes:{
        support:variant('Sina oled õpetaja. Kodutöö on õpikust ülesanne 4, tähtaeg homme. Ütle need detailid ainult siis, kui õpilane küsib. Vajadusel tuleta meelde küsimise sammu.', ['Sa puudusid tunnist. Küsi õpetajalt, mida kodus teha ja mis ajaks. Täpsusta üht detaili ja korda kokkulepe oma sõnadega.']),
        core:variant('Sina oled õpetaja. Ülesanne 4 tuleb teha homseks; vastused tuleb kirjutada vihikusse. Vasta küsimustele ja küsi: „Kuidas sa kontrollid, et said ülesandest aru?”', ['Sa puudusid tunnist. Pea õpetajaga vähemalt nelja vooruga vestlus: uuri kodutööd ja tähtaega, küsi täpsustust ning kinnita järgmine samm.']),
        advanced:variant('Sina oled õpetaja. Kodutöö tähtaeg on homme. Poole vestluse pealt ütle, et esialgset ülesannet on muudetud: nüüd tuleb teha ülesanne 5. Palu õpilasel uus kokkulepe sõnastada.', ['Uuri puudutud tunni kodutööd. Selgita, miks sa vajad täpsustust, reageeri muudetud ülesandele ja lepi kokku järgmine samm.'])}},
      {id:'school-transfer',title:'4. Uuel kursusel',workspaceType:'transfer',minutes:8,skill:'speaking',routes:{
        support:variant('Uus kontekst on täiskasvanute veebikursus. Sa oled kursuse juhendaja. Õppija peab tegema helisalvestise reedeks; hinnet ei panda, antakse tagasisidet. Avalda üks detail korraga pärast küsimust.', ['Alustad veebikursust. Uuri, mida õppimiseks teha, millal töö esitada ja kuidas saad teada, kas said hakkama. Lõpuks ütle oma plaan.']),
        core:variant('Sina oled veebikursuse juhendaja. Helisalvestis tuleb esitada reedeks; numbrihinde asemel antakse tagasisidet. Ära korda varasema koolivestluse lauseid.', ['Alustad uut veebikursust. Uuri ülesannet, tähtaega ja hindamist. Võrdle saadud vastuse põhjal kursust oma senise õppimisega.']),
        advanced:variant('Sina oled veebikursuse juhendaja. Töö on reedeks, hinnet asendab tagasiside. Lisa komplikatsioon: õppijal ei tööta mikrofon; paku kirjalikku alternatiivi alles pärast tema ettepanekut.', ['Alustad veebikursust, kuid üks õppevahend ei tööta. Uuri töö eesmärki ja hindamist, paku alternatiiv ning põhjenda, kuidas see aitab sul õppida.'])}},
      ...['vocabulary','grammar','speaking'].map((skill,index)=>({
        id:`school-assessment-${skill}`,title:`${5+index}. ${['Sõnavara kontroll','Lausete kontroll','Vestluse kontroll'][index]}`,workspaceType:'assessment',minutes:3,skill,
        successCriteria:[[
          'Nimetab iseseisvalt kõik neli sihtsõna ja kasutab igaüht tähenduslikus lauses.',
          'Kolm arusaadavat lauset: õppimine, kohustus ja põhjus.',
          'Vähemalt neli vooru, üks täpsustav küsimus ja kokkulepe.'
        ][index]],
        routes:Object.fromEntries(['support','core','advanced'].map(route=>[route,variant(
          'Ära näita sõnakaarti ega vastusemudelit. '+(route==='support'?'Võid ülesannet neutraalselt korrata ja anda mõtlemisaega.':route==='advanced'?'Küsi lõpus lisapõhjendust.':'Anna aega iseseisvaks vastuseks.'),
          [[
            'Ütle eesti keeles урок, учитель, домашняя работа ja оценка ning kasuta iga sõna uues lauses.',
            'Ütle kolm lauset: mida õpid uuel kursusel, mida pead järgmiseks tegema ja miks. Kasuta pean ja sest.',
            'Uuel kursusel jäi juhis ebaselgeks. Alusta õpetajaga vestlust, küsi täpsustust, reageeri vastusele ja kinnita järgmine samm.'
          ][index]],{success:['Kõik neli sõna on tähenduse poolest õiged ja lauses kasutatud.','Kolm arusaadavat lauset; pean + ma-vorm ning põhjendus sõnaga sest.','Vähemalt neli vooru, üks täpsustav küsimus ja arusaadav kokkulepe.'][index]}
        )]))
      }))
    ],
    homework:{support:'Kirjuta nelja sihtsõnaga neli lauset ja üks küsimus õpetajale.',core:'Kirjuta kuus lauset oma õppimisplaanist. Kasuta nelja sihtsõna, pean ja sest.',advanced:'Võrdle koolis ja veebikursusel õppimist kaheksa lausega; selgita tagasiside rolli.'},
    masteryPolicy:{canonical:'students.skillMap',automaticWrite:false,note:'Tunni lõpetamine ei kinnita õppekava läbimist ega mastery-taset.'}
  };
});
