(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.KeeleSeppBlockTemplates=api;})(typeof window!=='undefined'?window:globalThis,function(){
  const PHASES=[['warmup','Soojendus'],['diagnostic','Diagnostika'],['vocabulary','Sõnavara'],['grammar','Grammatika'],['practice','Harjutamine'],['speaking','Rääkimine'],['transfer','Ülekanne'],['assessment','Kontroll'],['reflection','Refleksioon']];
  const LAYOUTS=[['text','Tekstiülesanne'],['image','Ülesanne + pildi koht'],['cards','Sõnakaardid'],['questions','Küsimused'],['comparison','Võrdlus'],['roleplay','Rollikaardid'],['dialogue','Dialoog'],['flashcard','Välkkaardid'],['checklist','Kontrollnimekiri'],['reading','Lugemistekst'],['exam','Eksamiülesanne'],['reflection','Refleksioon'],['teacher','Õpetaja juhitud']];
  // Declarative starter content. Layouts are presentation only, not an interaction engine.
  const rows=[
    ['diagnostic','Algus','Diagnostika','diagnostic','speaking','diagnostic','text',6,'Räägi, mida sa selle teema kohta juba tead. Too üks näide.'],
    ['warmup','Algus','Soojendus','warmup','speaking','scene','questions',5,'Mis jäi sulle eelmisest tunnist meelde?\nMillise küsimusega tuled tänasesse tundi?'],
    ['review','Algus','Varasema kordamine','warmup','vocabulary','controlled_practice','questions',5,'Nimeta kolm varem õpitud sõna. Kasuta üht uues lauses.'],
    ['new-words','Sõnavara','Uued sõnad','vocabulary','vocabulary','vocabulary','cards',8,'kool — õppimise koht\nõpetaja — inimene, kes õpetab\nõppima — uusi teadmisi omandama'],
    ['word-cards','Sõnavara','Sõnakaardid','vocabulary','vocabulary','vocabulary','flashcard',6,'tund — õppetöö aeg\nkodutöö — kodus tehtav ülesanne\nhinne — hinnang tööle'],
    ['meaning','Sõnavara','Sõna ja tähendus','vocabulary','vocabulary','controlled_practice','comparison',5,'Selgita paarid oma sõnadega.\nkool — õppimise koht\nraamatukogu — raamatute laenutamise koht'],
    ['sentence','Sõnavara','Sõna lauses','vocabulary','vocabulary','controlled_practice','text',5,'Vali kolm uut sõna ja kasuta igaüht tähenduslikus lauses.'],
    ['odd','Sõnavara','Leia liigne','vocabulary','vocabulary','controlled_practice','questions',4,'õpetaja, õpilane, kool, porgand\nMilline sõna ei sobi? Põhjenda.'],
    ['sort','Sõnavara','Rühmita sõnad','vocabulary','vocabulary','controlled_practice','comparison',5,'Jaga sõnad inimesteks ja tegevusteks.\nõpetaja, õppima, õpilane, kirjutama'],
    ['practice','Grammatika','Juhitud harjutamine','practice','grammar','controlled_practice','text',8,'Moodusta kolm lauset: Ma pean … / Ma tahan … / Ma saan …'],
    ['gap','Grammatika','Täida lünk','grammar','grammar','controlled_practice','questions',5,'Ma ___ eesti keelt. (õppima)\nTa ___ kooli. (minema)'],
    ['correct','Grammatika','Paranda viga','grammar','grammar','controlled_practice','text',5,'Leia ja paranda viga: Mina õpib eesti keelt. Selgita parandust.'],
    ['build','Grammatika','Koosta lause','grammar','grammar','controlled_practice','text',5,'Koosta lause: homme / mina / kooli / minema.'],
    ['rephrase','Grammatika','Ütle teisiti','grammar','grammar','controlled_practice','text',6,'Ütle sama mõte teisel viisil: Mul on vaja kodutöö lõpetada.'],
    ['form','Grammatika','Vali õige vorm','grammar','grammar','controlled_practice','questions',5,'Mina (õpin / õpib) iga päev.\nMeie (lähen / läheme) kooli. Põhjenda valikuid.'],
    ['read','Lugemine','Tekst ja küsimused','practice','reading','controlled_practice','reading',8,'Mari õpib õhtukoolis. Päeval ta töötab. Õhtul teeb ta kodutööd.\nMiks võiks Mari valida õhtukooli?\nMillal ta õpib?'],
    ['find','Lugemine','Leia info','practice','reading','controlled_practice','reading',5,'Kursus algab esmaspäeval kell 18. Tund kestab 60 minutit.\nLeia algusaeg ja tunni kestus.'],
    ['true-false','Lugemine','Õige või vale','practice','reading','controlled_practice','checklist',5,'Tekst: Mari õpib õhtuti.\nMari õpib hommikuti.\nMari õpib õhtuti. Põhjenda teksti abil.'],
    ['main-idea','Lugemine','Peamine mõte','practice','reading','controlled_practice','reading',6,'Loe õpetaja valitud lühitekst. Võta peamine mõte kokku ühe lausega.'],
    ['heading','Lugemine','Lõigu pealkiri','practice','reading','controlled_practice','reading',5,'Loe valitud lõik. Paku sobiv pealkiri ja põhjenda seda kahe märksõnaga.'],
    ['talk','Rääkimine','Vestlusküsimused','speaking','speaking','roleplay','questions',8,'Mida sulle meeldib õppida?\nMis aitab sul uut asja meelde jätta?\nMillist oskust tahaksid arendada?'],
    ['picture','Rääkimine','Kirjelda pilti','speaking','speaking','scene','image',6,'Vaata õpetaja näidatud pilti. Kirjelda inimesi, kohta ja tegevust. Lisa üks oletus.'],
    ['roleplay','Rääkimine','Rollimäng','speaking','speaking','roleplay','roleplay',10,'Õpilane soovib kursusele registreeruda. Küsi aja, hinna ja taseme kohta.'],
    ['situation','Rääkimine','Olukorraülesanne','speaking','speaking','roleplay','dialogue',7,'Sa ei saa järgmisel tunnil osaleda. Selgita olukorda ja lepi kokku uus aeg.'],
    ['opinion','Rääkimine','Avalda arvamust','speaking','speaking','roleplay','text',6,'Kas iseseisvalt või koos õppida on parem? Esita arvamus ja kaks põhjust.'],
    ['compare','Rääkimine','Võrdle','speaking','speaking','roleplay','comparison',7,'Võrdle veebis õppimist ja klassis õppimist. Too mõlema kohta eelis ja puudus.'],
    ['debate','Rääkimine','Kaitse seisukohta','speaking','speaking','roleplay','roleplay',10,'Kas kodutöö peaks olema vabatahtlik? Vali seisukoht, põhjenda ja vasta vastuväitele.'],
    ['short-answer','Kirjutamine','Lühivastus','practice','writing','controlled_practice','text',5,'Kirjuta 2–3 lauset sellest, mida sa täna õppisid.'],
    ['email','Kirjutamine','Sõnum või e-kiri','practice','writing','controlled_practice','exam',10,'Kirjuta õpetajale viisakas e-kiri. Selgita puudumist ja küsi kodutöö kohta.'],
    ['description','Kirjutamine','Kirjeldus','practice','writing','controlled_practice','text',8,'Kirjelda oma lemmikkohta õppimiseks. Kasuta vähemalt viit lauset.'],
    ['paragraph','Kirjutamine','Arvamuslõik','practice','writing','controlled_practice','text',10,'Kirjuta lõik: miks on keelte õppimine kasulik? Lisa väide, põhjendus ja näide.'],
    ['exam-writing','Kirjutamine','Eksamikirjutamine','assessment','writing','assessment','exam',15,'Kirjuta 80–100 sõna kursuse korraldajale. Küsi taseme, ajakava ja õppematerjalide kohta.'],
    ['listening','Kuulamine','Kuulamise ettevalmistus','practice','listening','scene','teacher',6,'Kuula õpetaja loetud teksti. Pane kirja kolm olulist märksõna.'],
    ['audio-questions','Kuulamine','Kuula ja vasta','practice','listening','controlled_practice','questions',8,'Õpetaja esitab valitud helimaterjali.\nKes räägib?\nMis on peamine mõte?\nMilline detail jäi meelde?'],
    ['transfer','Ülekanne','Uus olukord','transfer','speaking','transfer','text',7,'Kasuta õpitud väljendeid uues olukorras: küsi raamatukogus sobiva kursuse kohta infot.'],
    ['real-life','Ülekanne','Päriselu ülesanne','transfer','speaking','transfer','dialogue',8,'Sul on vaja muuta broneeringut. Selgita soovi, täpsusta tingimusi ja lepi kokku lahendus.'],
    ['problem','Ülekanne','Lahenda probleem','transfer','speaking','transfer','comparison',8,'Kaks kursust toimuvad samal ajal. Võrdle võimalusi ja paku põhjendatud lahendus.'],
    ['exit','Kontroll','Väljumispilet','assessment','vocabulary','assessment','questions',4,'Nimeta kolm uut sõna.\nKasuta üht neist uues lauses.\nMis vajab veel harjutamist?'],
    ['assessment','Kontroll','Lõppkontroll','assessment','speaking','assessment','exam',5,'Selgita uut olukorda iseseisvalt. Kasuta tänase tunni sõnavara ja lausemalle.'],
    ['reflection','Kontroll','Eneserefleksioon','reflection','speaking','assessment','reflection',3,'Täna oskan …\nMul on veel vaja harjutada …\nMinu järgmine samm on …'],
    ['checkpoint','Kontroll','Õpetaja vahekontroll','assessment','grammar','assessment','teacher',4,'Näita iseseisvalt, kuidas kasutad tänast lausemalli. Selgita oma valikut.']
  ];
  const BLOCKS=rows.map(([id,category,title,phase,skill,type,layout,minutes,prompt])=>({id,category,title,phase,skill,type,layout,minutes,prompt,teacherInstruction:category==='Kuulamine'?'Esita materjal ise; helifaili üleslaadimist siin ei ole. Hinda vastuse mõtet.':'Anna mõtlemisaega. Hinda sihtoskust ja küsi vajadusel üks täpsustav küsimus.',expected:'Kohanda vastuse näidet oma tunni eesmärgile; aktsepteeri sisuliselt õigeid vastuseid.'}));
  const LESSONS=[
    {id:'school45',title:'45 min · koolitund',minutes:45,blocks:['warmup','review','gap','practice','talk','exit','reflection']},
    {id:'language60',title:'60 min · individuaalne keeletund',minutes:60,blocks:['warmup','new-words','gap','practice','roleplay','transfer','assessment']},
    {id:'vocabulary',title:'Sõnavaratund',minutes:45,blocks:['review','new-words','word-cards','meaning','sentence','exit']},
    {id:'grammar',title:'Grammatikatund',minutes:45,blocks:['warmup','gap','correct','build','rephrase','checkpoint']},
    {id:'speaking',title:'Rääkimistund',minutes:60,blocks:['warmup','talk','picture','roleplay','compare','assessment']},
    {id:'exam',title:'Eksamiks valmistumine',minutes:60,blocks:['diagnostic','read','audio-questions','exam-writing','assessment']},
    {id:'revision',title:'Kordamistund',minutes:45,blocks:['review','odd','form','talk','exit','reflection']},
    {id:'conversation',title:'Vestlustund',minutes:45,blocks:['warmup','talk','opinion','debate','reflection']},
    {id:'diagnostic',title:'Diagnostiline tund',minutes:45,blocks:['diagnostic','read','short-answer','talk','checkpoint']}
  ];
  return {PHASES,LAYOUTS,BLOCKS,LESSONS};
});
