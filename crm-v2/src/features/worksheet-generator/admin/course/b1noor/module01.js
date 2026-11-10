// „B1 noorkeele õppija” (course key b1noor, owner 2026-11-10): the A2 → B1 course rebuilt for teens (13–16) and the
// 9th-grade exam track (docs/A2B1_COURSE_BLUEPRINT.md §8). A separate course next to „Eesti keel B1” (b1): the learners
// of the current course keep their sheets; this one is seen by staff in „Kursuse tootmine” and assigned by hand only.
// Module 1 „Uus kool, uus algus” (b1noor-001…005), stage A2 → A2+, lesson design v3 stations
// (docs/COURSE_DESIGN_STATIONS.md §1–§6, the 10 evidence rules of A2B1_EVIDENCE.md).
// Lesson ids and the a2b1 lessons they stand for (the same slot of the grammar spiral, blueprint §3.2):
//   b1noor-001 = a2b1-001  entry test: the same design (parts, tasks, item counts, points, grammar areas) in teen contexts
//   b1noor-002 ≈ a2b1-002  RÄÄK L→S „Tere, ma olen uus!” — final: present (introduce yourself in a hobby group)
//   b1noor-003 ≈ a2b1-003  AVAS R→S „Minu nädal” — final: plan (two training times that fit the week)
//   b1noor-004 ≈ a2b1-004  PROB R→W „Huviringi kirja!” — final: decide (choose a group, form W1a, reply in Stuudium)
//   b1noor-005 = a2b1-005  module check: S0 / 9th-grade oral intro, the final task in a new situation, grammar + words
// Grammar (blueprint §3.2, module 1): present tense, questions (kas / question word) and word order — I; local cases
// (kus / kuhu / kust) — R; partitive after negation (mul ei ole trenni) — R from A2.
// Cast (teen, invented): Milana (15, 9. b, moved from Narva to Tallinn), Artjom (15, basketball), Robin (15, Estonian
// classmate), Daria (14, new from Ukraine), class teacher Kaie Lepp, robotics leader Toomas, coach Raivo; school „Kase kool”.
// Real facts used: school lunch is free in basic school; Stuudium / eKool are the e-schools. Every number in the
// lessons belongs to the cast's story.
// Listening: no recordings yet (MODULE.audio 'pending'): the teacher reads the transcripts until
// tools/listening-audio/build.mjs has made them.
import { B, tag, teach, why, withShapes } from '../blocks.js';
import { purpose, station } from '../stationBlocks.js';

const withInstruction = (b, instruction) => ({ ...b, data: { ...b.data, instruction } });

export const MODULE = { id: 'b1noor-module-01', course: 'b1noor', title: 'Uus kool, uus algus', level: 'A2+', design: 'v3-stations', template: 'v4', audio: 'pending' };

// the grammar areas of the entry test (the teacher's key names one per item and the module of this course that teaches it)
const AREA = {
  A: 'Kohakäänded (kus? kuhu? kust?) — moodul 1 ja 3.',
  B: 'Lihtminevik ja selle eitus — moodul 5.',
  C: 'Osastav sihitis (joon teed, ei söö leiba) — moodul 6.',
  D: 'Ma- või da-infinitiiv (pean minema, tahan minna) — moodul 4.',
  E: 'Tingiv kõneviis viisakas palves (saaksite, tahaksin) — moodul 4.',
};
const areas = (list) => list.split('').map((k) => AREA[k]);

// the entry test: the design of a2b1-001 (four parts in Harno A2 form, the same tasks, item counts, points and grammar
// areas), rewritten in teen contexts — school, training, hobbies, family, phone and online (owner 2026-11-10)
const ENTRY_TEST = {
  title: 'Sisenemistest: kust ma alustan?',
  assessment: true,
  // the adult course's pictures (art/textbookArt.js) are keyed to a2b1-001; this test has none, so the reading sheet is short
  shortSheet: ['discover'],
  canDo: 'Ma teen sisenemistesti neli osa ja saan teada, millised oskused ja vormid vajavad harjutamist.',
  discover: [
    B.text('001_d_intro', 'Sisenemistest', 'Tere tulemast kursusele „B1 noorkeele õppija”! Täna teed sisenemistesti nagu iga uus õpilane. Test on Harno eksami moodi: lugemine, kuulamine, kirjutamine ja rääkimine. Läbi kukkuda ei saa. Tulemus näitab, mida sa juba oskad ja millest alustada.'),
    B.examPart('001_d_part', 'R', { part: 'Lugemine ja keel', minutes: 45, points: 63, tasks: 8, target: 60, note: 'Ülesanded 1–5 on lugemine, 6–8 on keel. Tee üksi ja ilma sõnaraamatuta.' }),
    B.vocab('001_d_vocab', 'Testi sõnad.', ['ülesanne — задание', 'lünk — пропуск', 'vastus — ответ', 'õige — правильный', 'vale — неправильный', 'punkt — балл', 'tulemus — результат', 'harjutama — упражняться']),
    B.match('001_d_signs', 'Lugemine 1. Sildid.', 'Mida tähendab iga silt koolis, kodus või poes? Ühenda silt ja selgitus.', [
      ['Söökla suletud', 'Täna ei saa siin lõunat süüa.'], ['Palun vaheta jalanõud!', 'Majas tuleb kanda teisi jalanõusid.'], ['Lift ei tööta', 'Üles tuleb minna trepist.'],
      ['Rattaparkla', 'Siia võib jalgratta jätta.'], ['Ettevaatust, märg põrand!', 'Siin tuleb aeglaselt ja ettevaatlikult käia.'],
      ['Raamatukogus palume vaikust', 'Siin ei tohi valjusti rääkida.'], ['Remondi tõttu suletud', 'Siin tehakse tööd ja uks on kinni.'], ['Pakiautomaat 24/7', 'Paki saab kätte igal ajal.'],
    ], 'full', 'g_vocab'),
    B.choice('001_d_say', 'Lugemine 2. Mida sa ütled?', 'Loe olukorda ja vali lause, mis sobib kõige paremini.', [
      ['Sa tuled hommikul klassi. Mida sa õpetajale ütled?', 'Tere hommikust!', 'Head ööd!', 'Head isu!'],
      ['Klassivend aitas sul matemaatika ülesannet lahendada. Mida sa ütled?', 'Aitäh, sa olid väga abiks!', 'Palun, pole tänu väärt.', 'Vabandust, ma ei saa.'],
      ['Sa jääd trenni kümme minutit hiljaks. Mida sa treenerile kirjutad?', 'Vabandust, jään natuke hiljaks.', 'Palju õnne, olen kohe seal!', 'Head reisi, näeme hiljem!'],
      ['Sa ei saanud õpetaja küsimusest aru. Mida sa ütled?', 'Palun korrake veel kord.', 'Jah, ma tean seda hästi.', 'Ei, aitäh, mul pole vaja.'],
      ['Sõber kutsub sind laupäeval kinno, aga sa ei saa tulla.', 'Kahjuks ei saa, mul on trenn.', 'Jah, tulen hea meelega.', 'Head nädalavahetust sulle!'],
      ['Müüja küsib: „Kas saan aidata?” Sa ainult vaatad.', 'Aitäh, ma ainult vaatan.', 'Jah, palun üks kilo.', 'Ei, ma ei ole kodus.'],
      ['Sinu sõbral on täna sünnipäev. Mida sa talle kirjutad?', 'Palju õnne sünnipäevaks!', 'Saa ruttu terveks!', 'Jõudu tööle!'],
      ['Sa saatsid sõnumi kogemata valele inimesele.', 'Vabandust, see sõnum ei olnud sulle.', 'Tere, ma olen kohe kohal.', 'Aitäh, kohtume homme jälle.'],
    ]),
    B.reading('001_d_morning', 'Lugemine 3. Artjomi hommik.', 'Loe Artjomi hommikust ja vasta küsimustele 1–5 sõnaga.', 'Artjomi hommik',
      'Artjom elab Maardus ja käib koolis Tallinnas. Koolipäeval ärkab ta kell kuus, sest buss läheb kell seitse. Kõigepealt viib ta koera Rocky õue. Siis joob ta klaasi vett ja sööb putru. Kohvi ta ei joo, sest kohv teeb ta närviliseks.\n\nKell pool seitse paneb Artjom jope selga ja võtab seljakoti. Bussis kuulab ta muusikat või eesti keele taskuhäälingut. Ta tahab rääkida paremini, sest tema korvpallivõistkonnas räägivad kõik eesti keelt.\n\nKoolis on Artjom tavaliselt kell kaheksa. Ta jõuab enne teisi ja kordab rahulikult kodutööd. Eelmisel nädalal oli aga teisiti. Bussijuht oli haige ja buss ei tulnud. Artjom ootas peatuses pool tundi. Lõpuks helistas ta naabripoisile Olegile, kelle isa sõidab iga päev autoga Tallinnasse. Oleg ja tema isa tulid kohe ning poisid jõudsid kooli koos.\n\nNüüd on Artjomil telefonis bussi äpp. Kui buss hilineb, saab ta kohe teada. Siis kirjutab ta Olegile või sõidab rongiga. Hiljaks jääda ta enam ei taha, sest esimene tund on tal matemaatika.',
      [['Kus Artjom koolis käib?', 'Tallinnas'], ['Mis kell Artjom koolipäeval ärkab?', 'kell kuus|kell 6|kuuelt'], ['Mida Artjom kõigepealt teeb?', 'viib koera õue|viib Rocky õue'], ['Miks Artjom kohvi ei joo?', 'kohv teeb ta närviliseks|see teeb närviliseks'], ['Mida Artjom bussis teeb?', 'kuulab muusikat|kuulab taskuhäälingut|kuulab muusikat või taskuhäälingut|kuulab muusikat või eesti keele taskuhäälingut'], ['Mis juhtus eelmisel nädalal?', 'buss ei tulnud|bussijuht oli haige'], ['Kuidas Artjom siis kooli jõudis?', 'Olegi isa autoga|autoga|Olegi isa tõi ta autoga']]),
    tag(B.adsmatch('001_d_ads', 'Lugemine 4 (B1 proov). Kuulutused.', 'Millist kuulutust (A–F) vajab iga inimene? Kirjuta täht. Üks kuulutus võib sobida mitmele.', [
      ['Keelekohvik „Räägime!”', 'Igal kolmapäeval kell 16 noortekeskuses. Räägime eesti keeles muusikast, filmidest, koolist ja spordist. Tasuta, registreeruda pole vaja.'],
      ['Jooga kogu perele', 'Esmaspäeviti ja neljapäeviti kell 7.30 enne kooli ja tööd. Rahulik tund, sobib ka algajatele. Kuu pilet 20 eurot.'],
      ['Rattatöökoda', 'Noortekeskuse töökojas parandame koos rattaid. Too oma ratas laupäeval kella kümnest kaheni. Tööriistad on meil olemas.'],
      ['Ujula hommikupilet', 'Tööpäeviti kella kuuest kaheksani on ujumine õpilastele poole odavam. Rätik on hinna sees.'],
      ['Kodutööklubi', 'Vanemad õpilased aitavad matemaatika ja eesti keele kodutöödega. E–N kell 15–17 kooli raamatukogus.'],
      ['Kokaring', 'Igal reedel kell 15 valmistame koos sooja toitu ja sööme selle ise ära. Toiduained on ringi poolt, too kaasa põll.'],
    ], [
      ['Daria tahab eesti keelt rääkida, aga koolis on selleks vähe aega.', 'A'], ['Robin tahab enne kooli odavalt ujuda.', 'D'],
      ['Artjomi jalgratta kett on katki.', 'C'], ['Milana ei saa matemaatika kodutööst aru.', 'E'],
      ['Kertu tahab õppida süüa tegema.', 'F'], ['Kertu ema tahab enne tööd rahulikult venitada ja hingata.', 'B'],
      ['Uus õpilane tahab tasuta uute inimestega tutvuda.', 'A'], ['Mart tahab nädala sees vara hommikul vees liikuda.', 'D'],
    ]), { harno: 'R1' }),
    why(B.cloze('001_d_letter', 'Keel 1. Milana kiri klassijuhatajale.', 'Vali Milana kirjas igasse lünka õige vorm.', 'Tere, õpetaja!', [
      'Tere, õpetaja! Ma olen Milana ja tulen {*teie|teid|teile} klassi. Ma elan Tallinnas ja käin pärast tunde {*noortekeskuses|noortekeskusesse|noortekeskusest}. Eesti keelt hakkasin õppima neli aastat tagasi.',
      '',
      'Eile {*käisin|käin|käima} esimest korda uues koolis. Ma ei {*leidnud|leidsin|leia} kohe õiget klassi ja küsisin teed. Tundides tahan rohkem {*rääkida|rääkima|räägin}, sest trennis pean palju eesti keelt {*kasutama|kasutada|kasutan}.',
      '',
      'Vahetunnis joon ma tavaliselt {*vett|vesi|veest}. Kas te {*saaksite|saate olema|saama} mulle saata selle nädala tunniplaani? Aitäh! Milana',
    ]), areas('AABBDDCE')),
    why(B.formtext('001_d_forms', 'Keel 2. Milana eilne õhtu.', 'Kirjuta sulgudes olev sõna Milana jutus õiges vormis.', 'Eile õhtul', [
      'Eile pärast tunde [läksin] (minema) koju jala. Kõigepealt käisin [poes] (pood). Ostsin [leiba|leiva] (leib) ja piima.',
      'Kodus [tegin] (tegema) kodutööd. Siis helistasin tädile [Tartusse] (Tartu). Tädi ei [olnud] (olema) kodus, ta oli veel tööl.',
      'Õhtul tahtsin raamatut [lugeda] (lugema), aga olin väga väsinud. Kell kümme läksin [voodisse] (voodi).',
    ]), areas('BACBABDA')),
    why(B.transformation('001_d_trans', 'Keel 3. Muuda lauset.', 'Kirjuta lause uuesti nii, nagu vihje ütleb.', [
      ['Ma ärkan kell seitse.', 'eile', 'Eile ärkasin kell seitse.|Ma ärkasin eile kell seitse.|Eile ärkasin ma kell seitse.'],
      ['Artjom sööb hommikul võileiva.', 'ei', 'Artjom ei söö hommikul võileiba.'],
      ['Ma tahan klaasi vett.', 'viisakalt: tahaksin', 'Ma tahaksin klaasi vett.|Tahaksin klaasi vett.'],
      ['Robin on praegu trennis.', 'kuhu? Robin läheb …', 'Robin läheb trenni.|Robin läheb praegu trenni.'],
      ['Täna me läheme ujuma.', 'eile', 'Eile läksime ujuma.|Eile me läksime ujuma.|Eile käisime ujumas.'],
      ['Ma pean täna kodus õppima.', 'tahan', 'Ma tahan täna kodus õppida.'],
      ['Kas sa aitad mind kodutööga?', 'viisakalt: aitaksid', 'Kas sa aitaksid mind kodutööga?'],
      ['Milana läheb kooli.', 'kust? Milana tuleb …', 'Milana tuleb koolist.'],
    ]), areas('BCEABDEA')),
    why(B.errorfix('001_d_fix', 'Keel 4. Paranda viga.', 'Leia igast lausest üks viga ja kirjuta lause õigesti.', [
      ['Eile läksin poodi ja ostsin piim.', 'Eile läksin poodi ja ostsin piima.'],
      ['Ma pean homme varem tõusta.', 'Ma pean homme varem tõusma.'],
      ['Me elame juba viis aastat Tallinnasse.', 'Me elame juba viis aastat Tallinnas.'],
      ['Ta ei tulid eile kooli.', 'Ta ei tulnud eile kooli.'],
      ['Kas te saaksite mind aitama?', 'Kas te saaksite mind aidata?'],
      ['Ma armastan hommikul kakao.', 'Ma armastan hommikul kakaod.'],
      ['Pärast trenni tulen spordisaalis koju.', 'Pärast trenni tulen spordisaalist koju.'],
      ['Eelmisel nädalal ma ärkan kell kuus.', 'Eelmisel nädalal ärkasin kell kuus.|Eelmisel nädalal ma ärkasin kell kuus.'],
    ]), areas('CDABDCAB')),
  ],
  practice: [
    B.examPart('001_p_part', 'L', { part: 'Kuulamine ja keel', minutes: 45, points: 62, tasks: 8, target: 60, note: 'Iga salvestist kuulad kaks korda. Ülesanded 5–8 on keel.' }),
    B.examListen('001_p_clips', 'Kuulamine 1. Kaheksa lühikest klippi.', 'Kuula iga klippi kaks korda ja vali õige vastus.', 'choice', [
      'Esimene klipp.', 'Teadustaja: Lugupeetud reisijad! Buss number seitseteist väljub täna kümme minutit hiljem, kell kaheksa kakskümmend. Vabandame!',
      'Teine klipp.', 'Müüja: Head kliendid! Kõik koolivihikud maksavad täna ainult ühe euro. Pliiatsid ja pastakad on tavalise hinnaga. Pakkumine kehtib pühapäevani.',
      'Kolmas klipp.', 'Õpetaja: Tere! Homme ei ole eesti keele tund ruumis kolmkümmend kaks, vaid teisel korrusel raamatukogus.',
      'Neljas klipp.', 'Robin: Artjom, ma olen juba sinu maja ees. Tule kohe alla, ma ootan sind poe juures. Võta vihmavari kaasa, väljas sajab.',
      'Viies klipp.', 'Teadustaja: Ujula on reedel remondi tõttu suletud. Laupäeval oleme avatud nagu tavaliselt.',
      'Kuues klipp.', 'Treener: Poisid, trenn algab homme kell viis, mitte kell neli. Võtke kaasa veepudel ja puhas särk.',
      'Seitsmes klipp.', 'Kooliõde: Tere! Sa võid tulla minu juurde neljapäeval kell kolm, pärast tunde.',
      'Kaheksas klipp.', 'Milana: Vanaema, ma ei tule laupäeval Narva, sest mul on võistlus. Ma tulen pühapäeval rongiga, kell kaksteist olen jaamas.',
    ], [
      ['Mis kell buss number seitseteist täna väljub?', 'kell 8.20', 'kell 8.10', 'kell 8.30'],
      ['Mis on poes täna odavam?', 'vihikud', 'pliiatsid', 'pastakad'],
      ['Kus on homme eesti keele tund?', 'raamatukogus', 'ruumis 32', 'aulas'],
      ['Kus Robin Artjomit ootab?', 'poe juures', 'bussipeatuses', 'kooli ees'],
      ['Millal on ujula suletud?', 'reedel', 'laupäeval', 'pühapäeval'],
      ['Mis kell algab homme trenn?', 'kell viis', 'kell neli', 'kell kuus'],
      ['Millal saab kooliõe juurde?', 'neljapäeval kell kolm', 'neljapäeval kell kaks', 'reedel kell kolm'],
      ['Millal sõidab Milana Narva?', 'pühapäeval', 'laupäeval', 'reedel'],
    ]),
    B.listening('001_p_message', 'Kuulamine 2. Treeneri sõnum.', 'Kuula treener Raivo telefonisõnumit uutele mängijatele. Kirjuta lünka üks sõna või number.', [
      'Tere! Siin Raivo, kooli korvpallitreener. Helistan kõigile uutele mängijatele.',
      'Meie trenn algab järgmisel teisipäeval kell neli pärastlõunal.',
      'Trennid on kaks korda nädalas, teisipäeval ja neljapäeval.',
      'Me treenime teisel korrusel, väikeses spordisaalis. Lift on maja paremal pool, trepp on otse ukse juures.',
      'Esimeses trennis teeme väikese testi. Võtke kaasa spordiriided ja veepudel.',
      'Võistkonna särki ei ole kohe vaja. Selle saate kätte teises trennis.',
      'Talvelaager maksab sada eurot. Maksta saab kahes osas: pool kohe ja pool kuu lõpus.',
      'Kui teil on väike vend või õde, siis teisipäeviti on samas majas lastering. See on tasuta.',
      'Kui te ei saa tulla, saatke mulle sõnum. Ootan teid! Head õhtut!',
    ], ['Trenn algab järgmisel [teisipäeval].', 'Esimene trenn algab kell [neli|4|16].', 'Trennid on [kaks|2] korda nädalas.', 'Spordisaal on teisel [korrusel].', 'Esimesse trenni tuleb kaasa võtta spordiriided ja [veepudel].', 'Võistkonna särgi saab kätte [teises|2.] trennis.', 'Talvelaager maksab [sada|100] eurot.', 'Kui ei saa tulla, tuleb Raivole saata [sõnum].']),
    B.examListen('001_p_where', 'Kuulamine 3. Kus nad on?', 'Kuula kaheksat lühikest vestlust. Ühenda vestlus ja koht.', 'match', [
      'Vestlus üks.', 'Poiss: Üks valuvaigisti, palun. Kas seda saab ilma retseptita?', 'Apteeker: Jah, saab. See maksab neli eurot. Võta üks tablett kolm korda päevas pärast sööki.',
      'Vestlus kaks.', 'Tüdruk: Ma tahaksin need raamatud tagasi tuua.', 'Raamatukoguhoidja: Aitäh! Kas soovid ka uusi laenutada? Uued koomiksid on akna all riiulil.',
      'Vestlus kolm.', 'Poiss: Vabandust, kas järgmine peatus on Kaubamaja?', 'Naine: Ei, Kaubamaja on kahe peatuse pärast.',
      'Vestlus neli.', 'Tüdruk: Üks kakao ja kaneelisai, palun.', 'Müüja: Kas sööd siin või võtad kaasa? Siin on praegu kõik lauad vabad.',
      'Vestlus viis.', 'Poiss: Lühemaks, palun, aga mitte väga lühikeseks.', 'Juuksur: Selge. Kas pesen ka pea?',
      'Vestlus kuus.', 'Tüdruk: Mis platvormilt läheb Tartu rong?', 'Mees: Teiselt platvormilt, viie minuti pärast. Piletit saab osta ka rongis.',
      'Vestlus seitse.', 'Poiss: Kas see masin on vaba? Ma tahan jalgu treenida.', 'Treener: Jah, palun, aga kõigepealt soojenda end.',
      'Vestlus kaheksa.', 'Tüdruk: Ma sisestasin koodi, aga kapi uks ei avane.', 'Mees: Proovi veel kord. Kood on kuus üks kaks.',
    ], [['Vestlus 1', 'apteegis'], ['Vestlus 2', 'raamatukogus'], ['Vestlus 3', 'bussis'], ['Vestlus 4', 'kohvikus'], ['Vestlus 5', 'juuksuris'], ['Vestlus 6', 'rongijaamas'], ['Vestlus 7', 'jõusaalis'], ['Vestlus 8', 'pakiautomaadi juures']]),
    tag(B.examListen('001_p_radio', 'Kuulamine 4 (B1 proov). Raadiointervjuu.', 'Kuula raadiointervjuud keelekohviku juhiga. Kas väide on õige või vale?', 'truefalse', [
      'Kati: Tere tulemast saatesse „Noorte tund”! Minu külaline on Maret, kes juhib noortekeskuses keelekohvikut.',
      'Maret: Tere! Aitäh kutsumast.',
      'Kati: Kes tulevad teie keelekohvikusse?',
      'Maret: Väga erinevad noored. Enamik käib päeval koolis ja tuleb meile pärast tunde. Noorim on kaksteist, vanim üheksateist.',
      'Kati: Mis on noorele kõige raskem?',
      'Maret: Paljud ütlevad, et grammatika. Minu arvates on raskem julgus. Noored oskavad palju, aga kardavad rääkida.',
      'Kati: Kuidas seda muuta?',
      'Maret: Me räägime alati paaris. Vead ei ole probleem. Kui sõnum on arusaadav, on see juba hea.',
      'Kati: Mida noor võiks kodus teha?',
      'Maret: Iga päev natuke. Parem on kümme minutit päevas kui kaks tundi pühapäeval. Kuulake raadiot ja vaadake eestikeelseid videoid.',
      'Kati: Kas eesti sõpradest on ka abi?',
      'Maret: Väga palju. Kahjuks lähevad eesti noored tihti vene või inglise keele peale. Paluge neil rääkida eesti keeles ja aeglasemalt.',
      'Kati: Kui kaua läheb A2 tasemelt B1 tasemele?',
      'Maret: Tavaliselt umbes aasta, kui õppida kaks korda nädalas ja teha kodus tööd. Mõnel läheb kiiremini, mõnel aeglasemalt.',
      'Kati: Miks keelekursus algab testiga?',
      'Maret: Test ei ole hinne. See näitab, mida noor juba oskab. Siis teame, mida korrata ja kust alustada.',
      'Kati: Mis teile oma töös kõige rohkem meeldib?',
      'Maret: Kui noor, kes alguses ei julgenud midagi öelda, räägib kevadel terve minuti. See on suur rõõm.',
      'Kati: Aitäh, Maret, ja edu keelekohvikule!',
    ], [
      ['Enamik keelekohviku noori käib päeval koolis.', true], ['Vanim külaline on kaksteist aastat vana.', false],
      ['Mareti arvates on grammatika kõige raskem.', false], ['Paljud noored kardavad eesti keeles rääkida.', true],
      ['Keelekohvikus räägitakse paaris.', true], ['Maret soovitab õppida kaks tundi pühapäeval.', false],
      ['Test näitab, kust õppimist alustada.', true], ['Testi tulemus on hinne.', false],
      ['A2 tasemelt B1 tasemele jõuab tavaliselt umbes aastaga.', true],
    ]), { harno: 'L4' }),
    B.truefalse('001_p_message_tf', 'Treeneri sõnum veel kord.', 'Kuula Raivo sõnumit veel kord. Kas väide on õige või vale?', [
      ['Raivo on kooli korvpallitreener.', true],
      ['Raivo helistab ainult vanadele mängijatele.', false],
      ['Trennid on teisipäeval ja neljapäeval.', true],
      ['Lift on maja vasakul pool.', false],
      ['Esimeses trennis on väike test.', true],
      ['Võistkonna särk tuleb osta enne esimest trenni.', false],
      ['Talvelaagri eest saab maksta kahes osas.', true],
      ['Lastering maksab kümme eurot.', false],
    ], 'full', 'g_listen'),
    B.gaps('001_p_where_gaps', 'Kus nad on? Veel kord.', 'Kuula vestlusi veel kord. Kirjuta lünka üks sõna või arv.', [
      'Valuvaigisti maksab [neli|4] eurot.',
      'Tabletti tuleb võtta kolm korda päevas pärast [sööki].',
      'Uued koomiksid on akna all [riiulil].',
      'Kaubamaja on kahe [peatuse] pärast.',
      'Tüdruk tellib kohvikus kakao ja [kaneelisaia].',
      'Tartu rong läheb teiselt [platvormilt].',
      'Rongipiletit saab osta ka [rongis].',
      'Poiss tahab jõusaalis [jalgu] treenida.',
    ], '', 'full', 'g_read'),
    B.choice('001_p_radio_q', 'Raadiointervjuu veel kord.', 'Kuula Mareti intervjuud veel kord. Vali igale küsimusele õige vastus.', [
      ['Mis saates Maret esineb?', '„Noorte tund”', '„Kooliraadio”', '„Spordiuudised”'],
      ['Kui vana on keelekohviku noorim külaline?', 'kaksteist', 'kümme', 'üheksateist'],
      ['Mida teevad noored keelekohvikus alati?', 'räägivad paaris', 'kirjutavad testi', 'vaatavad filmi'],
      ['Mida soovitab Maret kodus kuulata?', 'raadiot', 'laule', 'audioraamatuid'],
      ['Mida soovitab Maret vaadata?', 'eestikeelseid videoid', 'pikki filme', 'ingliskeelseid uudiseid'],
      ['Mida võiks paluda eesti sõpradelt?', 'rääkida eesti keeles ja aeglasemalt', 'rääkida inglise keeles', 'parandada kõiki vigu'],
      ['Kui tihti tuleb õppida, et jõuda umbes aastaga B1 tasemele?', 'kaks korda nädalas', 'iga päev kaks tundi', 'kord kuus'],
      ['Mis teeb Maretile kõige rohkem rõõmu?', 'kui arg noor räägib kevadel terve minuti', 'kui kõik saavad testis head hinded', 'kui kursus lõpeb'],
    ], 'full', 'g_listen'),
    why(B.gaps('001_p_gaps', 'Keel 1. Kus, kuhu või kust?', 'Kirjuta sulgudes olev sõna sobivas kohavormis.', [
      'Ma õpin suures [koolis] (kool).', 'Pärast tunde lähen [poodi|poesse] (pood).', 'Artjom tuleb hommikul [Maardust] (Maardu).', 'Lapsed mängivad [õues] (õu).',
      'Pane piim tagasi [külmkappi] (külmkapp).', 'Võta oma vihik [laualt] (laud).', 'Laupäeval sõidame [maale] (maa).', 'Robin tuli just [trennist] (trenn).',
    ]), areas('AAAAAAAA')),
    why(B.wordforms('001_p_past', 'Keel 2. Mis juhtus eile?', 'Kirjuta tegusõna lihtminevikus. Vaata, kes teeb.', [
      ['minema', 'Eile … ma kooli jala.', 'läksin'], ['tegema', 'Mida sa eile õhtul …?', 'tegid'], ['olema', 'Me … eile terve päeva kodus.', 'olime'], ['nägema', 'Ma … eile poes Robinit.', 'nägin'],
      ['sööma', 'Timur … eile kaks kooki.', 'sõi'], ['ostma', 'Nad … eile uue telefoni.', 'ostsid'], ['tooma', 'Kertu … eile kooli kooki.', 'tõi'], ['saama', 'Sa … eile minult sõnumi.', 'said'],
    ]), areas('BBBBBBBB')),
    why(B.choice('001_p_forms', 'Keel 3. Vali õige vorm.', 'Vali vorm, mis sobib lausesse.', [
      ['Kas te … mulle tunniplaani e-postiga saata?', 'saaksite', 'saaksin', 'saama'], ['Ma … tassi teed, palun.', 'sooviksin', 'soovima', 'sooviksid'],
      ['Milana ei söö hommikul …', 'leiba', 'leib', 'leiva'], ['Mul on vaja uut …', 'telefoni', 'telefon', 'telefonisse'],
      ['Artjom peab homme varem …', 'tõusma', 'tõusta', 'tõuseb'], ['Mulle meeldib õhtul raamatut …', 'lugeda', 'lugema', 'loen'],
      ['Kas sa … mind homme kolimisel aidata?', 'saaksid', 'saaks', 'saaksite'], ['Ma ostsin turult kaks …', 'õuna', 'õun', 'õunad'],
    ], 'full', 'g_notice'), areas('EECCDDEC')),
  ],
  transfer: [
    B.examPart('001_t_wpart', 'W', { part: 'Kirjutamine', minutes: 35, points: 20, tasks: 2, target: 60, note: 'Ülesanne 1 on lühike sõnum. Ülesanne 2 on B1 proov: lühike lugu.' }),
    tag(B.examWriting('001_t_note', 'Kirjutamine 1. Sõnum klassijuhatajale.', 'Kirjuta klassijuhatajale umbes 50 sõna. Kirjuta kõigist neljast punktist.', 'teade', {
      situation: 'Sa tuled uude kooli. Klassijuhataja palus kõigil uutel õpilastel Stuudiumis endast kirjutada.', points: ['kes sa oled ja kus sa elad', 'miks sa eesti keelt õpid', 'mis on eesti keeles sinu jaoks kõige raskem', 'mis päeval sa pärast tunde koolis olla ei saa ja miks'], words: [40, 60], opening: 'Tere, õpetaja!',
    }), { harno: 'W1b' }),
    B.rubricW1('001_t_r1', ['kes sa oled ja kus elad', 'miks sa õpid', 'mis on raske', 'mis päeval ei saa']),
    B.planning('001_t_plan', 'Plaan enne lugu.', 'Enne kirjutamist pane igale reale kaks-kolm märksõna.', ['Millal see päev oli?', 'Mis oli alguses tavaline?', 'Mis läks teisiti?', 'Mida sa tegid?', 'Kuidas päev lõppes?'], 2),
    tag(B.examWriting('001_t_story', 'Kirjutamine 2 (B1 proov). Lugu.', 'Kirjuta lugu pealkirjaga „Päev, mis läks teisiti”. Umbes 70 sõna.', 'jutt', {
      situation: 'Kirjuta ühest päevast oma elus (koolis, trennis, reisil), kui midagi läks plaanist teisiti.', points: ['millal ja kus see oli', 'mis juhtus', 'mida sa tegid', 'kuidas sa end tundsid'], words: [60, 80],
    }), { harno: 'W2a' }),
    B.rubricW2('001_t_r2'),
    B.examPart('001_t_spart', 'S', { part: 'Rääkimine', minutes: 15, points: 20, tasks: 2, target: 60, note: 'Rääkimine on õpetajaga üks-ühele.' }),
    teach(tag(B.speaking('001_t_me', 'Rääkimine 1. Räägi endast.', 'Vasta õpetaja küsimustele. Ütle igale vastusele üks põhjus või näide.', [
      'Kes sa oled ja kus sa elad?', 'Kuidas näeb välja sinu tavaline koolipäev?', 'Mida sa eelmisel nädalavahetusel tegid?', 'Mida sulle meeldib vabal ajal teha?', 'Miks sa eesti keelt õpid?', 'Mida sa tahaksid pärast põhikooli teha?',
    ], [60, 120]), { harno: 'S1a' }), 'Üks-ühele: õpetaja küsib, õpilane vastab. Õpetaja märgib, kas vastuses on põhjus või näide ja mis vormid (minevik, ma/da, osastav) tulevad õigesti. Teemad on samad mis 9. klassi lõpueksami suulise osa sissejuhatuses.'),
    teach(tag(B.phoneCards('001_t_call', 'Rääkimine 2 (B1 proov). Telefonikõne.', 'A helistab noortekeskusse, B on noortekeskuse töötaja. A küsib kõik küsimused ja kirjutab vastused üles.', 'Sa tahad teada, kas noortekeskuses on eesti keele vestlusring.',
      ['Helistaja', ['Kas teil on eesti keele vestlusring?', 'Mis päevadel ja mis kell?', 'Kas see maksab midagi?', 'Kus see toimub?', 'Kuidas saab registreeruda?']],
      ['Noortekeskuse töötaja', ['Vestlusring on olemas.', 'Esmaspäeval ja kolmapäeval kell 16–17.30.', 'Õpilastele on see tasuta.', 'Noortekeskuse teisel korrusel, ruumis 5.', 'Registreerida saab kodulehel või telefoni teel.']]), { harno: 'S2' }),
    'Üks-ühele: õpetaja on noortekeskuse töötaja ja annab vastused kaardilt; õpilane helistab. Hinda, kas kõik viis küsimust said küsitud ja vastused kirja.'),
    B.rubricSpeaking('001_t_rs'),
    teach(B.table('001_t_profile', 'Minu profiil.', 'Kirjuta iga osa punktid. Võrdle eesmärgiga ja märgi, mida harjutada.', 'Osa, Minu punktid, Eesmärk (60%), Mida harjutada?', [
      'Lugemine (ülesanded 1–4) |  | 19 punkti 31-st | ', 'Kuulamine (ülesanded 1–4) |  | 19 punkti 32-st | ', 'Kirjutamine |  | 12 punkti 20-st | ', 'Rääkimine |  | 12 punkti 20-st | ',
      'Keel: lihtminevik (moodul 5) |  | 60% vastustest | ', 'Keel: osastav sihitis (moodul 6), ma- ja da-vorm (moodul 4) |  | 60% vastustest | ', 'Keel: kus, kuhu, kust (moodul 1 ja 3) ja viisakas palve (moodul 4) |  | 60% vastustest | ',
    ]), 'Õpetajale: vastuste võtmes on iga keeleülesande juures kirjas, mis vormi see kontrollib (kohakäänded, lihtminevik, osastav, ma/da, tingiv) ja mis moodulis seda õpitakse. Loe õiged vastused vormide kaupa kokku, täida profiil koos õpilasega ja kirjuta see õpilase kaardile. Suunamine: alla 50% kahes või enamas osas → kõigepealt A2 kursus; 50–79% → moodul 1; vähemalt 80% igas osas → kiirrada (blueprint §5.1).'),
    B.text('001_t_next', 'Mida tulemus tähendab?', 'Kui mõni osa jäi alla 60%, on see sinu esimene eesmärk. Õpetaja paneb sinu kodutöösse just nende vormide harjutused. Mooduli lõpus teed kontrolli ja võrdled tulemust selle testiga.'),
  ],
};

export const LESSONS = withShapes({
  // ---------------------------------------------------------------- 001 entry test (design of a2b1-001, teen contexts)
  'b1noor-001': ENTRY_TEST,

  // ---------------------------------------------------------------- 002 RÄÄK L→S: questions
  'b1noor-002': {
    title: 'Tere, ma olen uus!',
    canDo: 'Ma tutvustan end uues klassis või huviringis ja küsin ise uute inimeste kohta kahte tüüpi küsimusi.',
    teacherPage: {
      goal: 'Ученик представляет себя в новой группе (класс, кружок) и сам задаёт вопросы двух типов: kas-вопрос и вопрос с вопросительным словом.',
      core: [2, 4, 5], alt: 1,
      short: 'Станция 2 (10 мин: правило и вопросы) → станция 5 (15 мин). Станции 1, 3 и 4 — дома или в начале следующего урока.',
      errors: [
        '«Kas kus sa elad?» — после вопросительного слова kas не нужно: «Kus sa elad?».',
        '«Ma elan Lasnamäe» вместо «Lasnamäel» (где? — местный падеж; повтор A2).',
        'Ответ одним «Jah»: естественнее «Jah, elan» / «Ei, ei ela» (в отрицании без окончания).',
      ],
      notes: [
        'Четыре пряди (Nation): ст. 1 — понимание на слух, ст. 2 — форма, ст. 3 — произношение (форма), ст. 4 — беглость, ст. 5 — продукция.',
        'Обратная связь: на ст. 2 и 3 сначала подсказка (повторить ошибку с вопросительной интонацией, «Kas kus…?»), модель — только если ученик не исправил сам. На ст. 4 и 5 не перебивать; в конце 2–3 пункта по целям из «Типичных ошибок».',
        'Дом 10 + 1: 10 минут в «Harjuta» не меньше 4 дней в неделю (карточки слов урока в обе стороны + предложения: вопросы kas / küsisõna, местные падежи). Реальное задание на выбор: (а) задать один вопрос по-эстонски учителю или тренеру в своей школе; (б) записать 3 вопроса, которые ты задашь новому человеку в классе. Следующий урок начинается с «Mis juhtus päriselt?» (2–3 мин).',
      ],
    },
    discover: [
      station(teach(purpose(B.listening('002_d_kaie', 'Klassijuhataja esimene päev.', 'Enne kuulamist arva vastused. Õpetaja loeb kaks korda, sina kirjuta lünka üks sõna.', [
        'Kaie: Tere hommikust, üheksas b! Mina olen teie klassijuhataja Kaie Lepp. Täna on meil kaks uut õpilast: Milana tuli Narvast ja Daria Ukrainast.',
        'Kaie: Meie klassiruum on teisel korrusel, ruum kakskümmend neli. Tunnid algavad kell kaheksa ja viisteist.',
        'Kaie: Lõunasöök on pärast neljandat tundi, sööklas esimesel korrusel. Koolilõuna on tasuta.',
        'Kaie: Kõik teated ja kodutööd on Stuudiumis. Palun vaadake seda iga päev.',
        'Kaie: Reedel kell kolm on aulas huviringide mess. Seal saab valida ringi: robootika, korvpall, kunst, teater ja palju muud.',
        'Kaie: Kui teil on küsimusi, kirjutage mulle Stuudiumis või tulge ruumi kakskümmend neli.',
      ], [
        'Klassiruum on [teisel] korrusel.',
        'Klassiruumi number on [24|kakskümmend neli].',
        'Tunnid algavad kell [8.15|kaheksa ja viisteist|8:15].',
        'Lõunasöök on pärast [neljandat|4.] tundi.',
        'Teated ja kodutööd on [Stuudiumis].',
        'Huviringide mess on [reedel] kell kolm.',
      ]), 'Sa oled Milana ja see on sinu esimene päev suures koolis. Kirjutad üles, kuhu ja millal minna, et sa ei eksiks ära.'),
      'Kuulamise tsükkel: 1) 30 s ennustamist (mis number võiks olla?); 2) esimene kuulamine ilma kirjutamata — „Millest Kaie räägib?”; 3) õpilane võrdleb oma ennustust; 4) teine kuulamine, lüngad; 5) üks rida „mis aitas / mis jäi kuulmata”.'), 1, 10),
      tag(B.vocab('002_d_vocab', 'Tunni sõnad.', ['klassijuhataja — классный руководитель', 'korrus — этаж', 'huviring — кружок', 'tunniplaan — расписание', 'söökla — столовая', 'vahetund — перемена', 'trenn — тренировка', 'juhendaja — руководитель кружка', 'tutvustama — представлять', 'küsimus — вопрос', 'kodutöö — домашнее задание', 'mess — ярмарка']), {}),
      station(B.notice('002_d_rule', 'Märka: kaks küsimuse tüüpi', [
        '**Kas** + tegusõna: **Kas** sa elad Lasnamäel? → Jah, **elan**. / Ei, **ei ela**.',
        'Küsisõna + tegusõna: **Kus** sa elad? **Mis** trennis sa käid? **Millal** su tunnid lõpevad?',
        'Küsisõna järel „kas” ei tule: ~~Kas kus sa elad?~~ → **Kus** sa elad?',
        'Kus? Kuhu? Kust? (A2): Ma elan **Tallinnas**. Ma kolisin **Tallinna**. Ma tulin **Narvast**.',
      ], 'full'), 2, 10),
      purpose(B.transformation('002_d_ask', 'Küsimused Robinile.', 'Milana teab Robini kohta neid asju. Tee igast lausest küsimus Robinile antud sõnaga.', [
        ['Robin elab Lasnamäel.', 'kus', 'Kus sa elad?'],
        ['Robin käib korvpallitrennis.', 'kas', 'Kas sa käid korvpallitrennis?|Kas sa käid korvpalli trennis?'],
        ['Robini trenn on teisipäeval ja neljapäeval.', 'millal', 'Millal su trenn on?|Millal sinu trenn on?|Millal on su trenn?|Millal on sinu trenn?'],
        ['Robin räägib eesti ja inglise keelt.', 'mis keeli', 'Mis keeli sa räägid?'],
        ['Robin tuleb kooli bussiga.', 'millega', 'Millega sa kooli tuled?|Millega sa tuled kooli?'],
        ['Robinil on üks vend.', 'kas', 'Kas sul on vend?|Kas sul on vendi?|Kas sul on õdesid või vendi?'],
        ['Robin on viisteist aastat vana.', 'kui vana', 'Kui vana sa oled?'],
      ]), 'Milana tahab vahetunnis Robiniga rääkida. Ta valmistab küsimused ette, et vestlus ei katkeks esimese vastuse järel.'),
    ],
    practice: [
      station(purpose(B.categorize('002_p_sound', 'Kooli või kooli?', 'Kuula õpetajat: kas „kooli” või „linna” on lühem või pikem? Pane lause veergu, siis loe.', [
        ['Lühem: kelle? mille?', ['Kooli õu on suur.', 'Kooli söökla on esimesel korrusel.', 'Linna buss on tasuta.']],
        ['Pikem: kuhu?', ['Ma lähen hommikul kooli.', 'Milana kolis linna.', 'Pärast trenni tulen kooli tagasi.']],
      ], 'full', 'g_notice'), 'Eestlane kuuleb kohe, kas sa ütled „kooli maja” või „lähen kooli”. Harjutad hääldust, et sinu lause oleks õigesti mõistetav.'), 3, 8),
      station(teach(tag(purpose(B.speaking('002_p_fast', 'Kiire tutvumine vahetunnis.', 'Õpetaja on Robin: vasta kaks minutit kiiresti. Siis tee vanaemale 30-sekundiline häälsõnum esimesest päevast.', [
        'Kust sa tulid?', 'Kus sa nüüd elad?', 'Mis keeli sa räägid?', 'Mis on sinu lemmikaine?', 'Mida sa pärast kooli teed?', 'Kas sa käid mõnes trennis või ringis?', 'Mis sulle siin koolis juba meeldib?',
      ], [120, 150], ['Ma tulin…', 'Nüüd elan…', 'Pärast kooli käin…', 'Mulle meeldib…, sest…']), 'Robin tahab uut õpilast vahetunni jooksul tundma õppida. Vastad kiiresti ja vabalt, nagu päris vestluses.'), { fluency: true }),
      'Ladusus: õpetaja küsib kiiresti ja ei paranda vahele. Häälsõnum on uus kuulaja (vanaema) ja uus eesmärk (kuidas läks), mitte sama jutt. Pärast märgi 2 viga, mis korduvad.'), 4, 10),
    ],
    transfer: [
      station(B.text('002_t_sit', 'Esimene kord huviringis', 'Reedel valisid sa huviringide messil robootikaringi. Täna on esimene kord. Ringi juhendaja Toomas palub igal uuel liikmel ennast tutvustada: kes sa oled, mida sa oskad ja mida tahad ringis teha. Juhendaja küsib ka ise küsimusi. Sinu variant: vali oma päris huviring või trenn ja tutvusta ennast seal.'), 5, 15, { final: 'present' }),
      teach(tag(purpose(B.rolecards('002_t_intro', 'Tutvustan end ringis.', 'Sina oled uus liige, õpetaja on juhendaja Toomas. Mida ja kuidas öelda, otsusta ise.',
        'Olukord: sa oled ringis esimest korda ja kedagi ei tunne.\nSinu eesmärk: tutvusta end nii, et juhendaja teab, kes sa oled, mida sa juba oskad ja mida tahad õppida; küsi ise vähemalt kaks küsimust.\nPiirang: sa ei tea veel, millal ring koguneb ja kas arvuti tuleb kaasa võtta.',
        'Juhendaja kaart on õpetajal: tal on oma küsimused ja üks üllatus.',
        ['Mina olen…, ma tulin…', 'Ma oskan juba natuke…', 'Ma tahaksin õppida…', 'Kas me…?', 'Millal…?'], ['Tere tulemast!', 'Räägi natuke endast.', 'Väga hea, et…']), 'Uues ringis otsustavad esimesed minutid, kas sa tunned end seal hästi. Tutvustad end juhendajale ja tead lõpus, millal ja kuhu tulla.'), { main: true, level: 4 }),
      'Üks-ühele, õpetaja kaart (juhendaja Toomas). Varjatud info: ring koguneb esmaspäeviti ja kolmapäeviti kell 15.30 ruumis 112; arvutid on koolis, kaasa võtta ainult vihik; mais on Tallinnas robotivõistlus. Takistused (ükshaaval, oota õpilase reaktsiooni): 1) katkesta: „Vabandust, kust sa tulid? Ma ei kuulnud.”; 2) „Kas sa oled varem programmeerinud?”; 3) räägi kiiresti ja kasuta sõna „võistlus” — õpilane peab küsima, mida see tähendab. Õnnestunud, kui: õpilane ütleb nime, kust ta tuli, mida oskab ja mida tahab teha, küsib ise vähemalt kaks küsimust (kas-küsimus ja küsisõnaga küsimus) ning teab lõpus, millal ja kuhu tulla. Tagasiside alles lõpus.'),
    ],
  },

  // ---------------------------------------------------------------- 003 AVAS R→S: word order, the week
  'b1noor-003': {
    title: 'Minu nädal',
    canDo: 'Ma räägin oma nädalast ja lepin treeneriga kokku trenniajad, mis sobivad minu tunniplaaniga.',
    teacherPage: {
      goal: 'Ученик описывает свою неделю (дни, время, порядок слов после «Esmaspäeval…») и договаривается о двух тренировках, которые реально помещаются в неделю.',
      core: [2, 4, 5], alt: 3,
      short: 'Станция 2 (10 мин) → станция 5 (15 мин). Чтение (ст. 1) — дома; ст. 3 и 4 — в следующий раз.',
      errors: [
        'Когда предложение начинается со времени, глагол обычно второй: «Reedel lähen ma…», «Esmaspäeval on mul…». «Reedel ma lähen…» в разговоре встречается, но в письме и на экзамене тренируем первый вариант.',
        '«Mul ei ole trenn» вместо «trenni» (после отрицания — партитив; повтор A2).',
        '«Ma käin noortekeskus» без падежа: где? noortekeskuses, куда? noortekeskusesse.',
      ],
      notes: [
        'Четыре пряди: ст. 1 — чтение (input), ст. 2 — форма, ст. 3 — слушание + медиация (input → output), ст. 4 — беглость, ст. 5 — продукция.',
        'Медиация (ст. 3): ученик объясняет Дарье объявления простыми словами; если Дарья «не понимает», надо сказать по-другому, а не громче.',
        'Обратная связь: на ст. 2 — подсказка, потом модель; на ст. 4 и 5 не перебивать, 2–3 пункта в конце.',
        'Дом 10 + 1: «Harjuta» 10 минут ≥ 4 дней (слова + предложения: порядок слов после времени, mul on / mul ei ole + партитив, местные падежи из урока 2). Реальное задание на выбор: (а) записать своё настоящее расписание недели по-эстонски (7 предложений «Esmaspäeval…»); (б) послушать одно школьное объявление или сообщение в Stuudium и пересказать один факт.',
      ],
    },
    discover: [
      station(purpose(B.reading('003_d_week', 'Milana nädal.', 'Loe Milana kirja ja vasta küsimustele lühidalt.', 'Milana kirjutab vanaemale', [
        'Tere, vanaema! Uues koolis on mul pikad päevad. Esmaspäeval ja kolmapäeval on mul seitse tundi ja koju jõuan alles kell neli. Teisipäeval on kõige raskem päev, siis on matemaatika ja füüsika. Neljapäeval lõpevad tunnid juba kell kaks. Siis käin raamatukogus ja teen kodutööd. Reedel on meil kehaline kasvatus ja pärast tunde lähen Artjomiga noortekeskusesse. Laupäeval magan kaua ja aitan emal koristada. Pühapäeval sõidan bussiga kesklinna. Eesti keelt räägin nüüd iga päev. Kallistan! Milana',
      ], [
        ['Mis päev on Milanal kõige raskem?', 'teisipäev|teisipäeval'],
        ['Mis kell jõuab Milana esmaspäeval koju?', 'kell neli|kell 4|neljaks'],
        ['Mida Milana neljapäeval pärast tunde teeb?', 'käib raamatukogus|teeb kodutööd|käib raamatukogus ja teeb kodutööd'],
        ['Kuhu läheb Milana reedel pärast tunde?', 'noortekeskusesse'],
        ['Kellega ta sinna läheb?', 'Artjomiga'],
        ['Mis koolipäeval lõpevad Milana tunnid kõige varem?', 'neljapäeval|neljapäev'],
      ]), 'Milana palus sul kiri enne saatmist üle lugeda. Artjom kutsub teda trenni, nii et leia ka, millal tal tegelikult vaba aega on.'), 1, 12),
      tag(B.vocab('003_d_vocab', 'Tunni sõnad.', ['aine — предмет', 'noortekeskus — молодёжный центр', 'raamatukogu — библиотека', 'vaba aeg — свободное время', 'algama — начинаться', 'tavaliselt — обычно', 'treener — тренер', 'võistkond — команда', 'proovitrenn — пробная тренировка', 'spordisaal — спортзал', 'nädal — неделя', 'sobima — подходить']), {}),
      station(B.notice('003_d_rule', 'Märka: kui lause algab ajaga', [
        'Tavaline lause: **Ma käin** reedel noortekeskuses.',
        'Kui lause algab ajaga, tuleb tegusõna tavaliselt teisele kohale: **Reedel käin** ma noortekeskuses. **Pärast tunde lähen** ma koju.',
        'Mul on-lause: **Mul on** trenn. → **Teisipäeval on mul** trenn.',
        'Eitus: **Mul ei ole** täna **trenni** (eituses osastav, A2).',
      ], 'full'), 2, 10),
      purpose(B.wordorder('003_d_order', 'Milana nädal treenerile.', 'Pane sõnad järjekorda. Lause algab ajaga, tegusõna tuleb selle järele.', [
        'Esmaspäeval | on | mul | seitse | tundi',
        'Neljapäeval | lõpevad | tunnid | kell | kaks',
        'Pärast | tunde | lähen | ma | noortekeskusesse',
        'Laupäeval | magan | ma | kaua',
        'Teisipäeval | ei | ole | mul | aega',
        'Pühapäeval | sõidan | ma | bussiga | kesklinna',
      ], 'full'), 'Milana kirjutab treenerile oma nädala. Paned tema laused korda, et treener saaks kiiresti aru, millal ta tulla saab.'),
    ],
    practice: [
      station(teach(purpose(B.listening('003_p_radio', 'Kooliraadio teated.', 'Enne kuulamist arva vastused. Õpetaja loeb teated kaks korda, sina kirjuta lünka üks sõna.', [
        'Kooliraadio: Tere hommikust, Kase kool! Siin on reede hommiku teated.',
        'Kooliraadio: Järgmisel kolmapäeval on ainult neli tundi, sest õpetajatel on koolitus. Lõunasöök on sel päeval kell üksteist.',
        'Kooliraadio: Raamatukogu on esmaspäeval suletud.',
        'Kooliraadio: Neljapäeval kell kolm on spordisaalis korvpalli proovitrenn. Oodatud on seitsmenda kuni üheksanda klassi õpilased. Kaasa võtke spordiriided ja veepudel.',
        'Kooliraadio: Ja veel: kaotatud asjad on sekretäri juures teisel korrusel. Seal on juba kolm mütsi ja üks telefon!',
      ], [
        'Kolmapäeval on ainult [neli|4] tundi.',
        'Kolmapäeval on lõunasöök kell [üksteist|11].',
        'Esmaspäeval on [raamatukogu] suletud.',
        'Korvpalli proovitrenn on neljapäeval kell [kolm|3|15].',
        'Trenni tuleb kaasa võtta spordiriided ja [veepudel].',
        'Kaotatud asjad on [sekretäri] juures.',
      ]), 'Uus õpilane Daria ei saanud kooliraadiost aru. Kirjutad olulised faktid üles, et saaksid need talle seletada.'),
      'Kuulamise tsükkel: ennusta → esimene kuulamine (mitu teadet?) → võrdle → teine kuulamine (lüngad) → üks rida refleksiooni.'), 3, 12),
      teach(purpose(B.speaking('003_p_daria', 'Seleta Dariale lihtsalt.', 'Õpetaja on Daria. Seleta talle märkmete järgi lihtsalt, mis järgmisel nädalal teisiti on.', [
        'Mis kolmapäeval teisiti on?', 'Kas ma saan esmaspäeval raamatukogus õppida?', 'Mis on proovitrenn? Kas ma võin ka tulla?', 'Ma kaotasin eile mütsi. Kust ma seda otsin?',
      ], [90, 150], ['Lihtsalt öeldes…', 'See tähendab, et…', 'Sa pead kaasa võtma…', 'Mine teisele korrusele…']), 'Daria tuli Ukrainast ja kuulab eesti keelt alles kuu aega. Seletad teated nii lihtsalt, et ta ei jää trennist ega lõunast ilma.'),
      'Vahendamine, õpetaja on Daria: ütle vahel „Ma ei saa aru, ütle lihtsamalt”. Õpilane peab ütlema teiste sõnadega, mitte valjemini. Õnnestunud, kui Daria teab nelja asja: kolmapäeval lühem päev ja lõuna kell 11, esmaspäeval raamatukogu kinni, trenn neljapäeval kell 15 (spordiriided, veepudel), kaotatud asjad sekretäri juures.'),
      station(tag(purpose(B.speaking('003_p_day', 'Minu tavaline päev 90 sekundiga.', 'Õpetaja on treener: räägi 90 sekundit oma päevast. Siis tee sõbrale 40-sekundiline häälsõnum nädala parimast päevast.', [
        'Mis kell sa ärkad ja kuidas kooli jõuad?', 'Mis tunnid sul täna on?', 'Mida sa vahetunnis teed?', 'Mida sa pärast kooli teed?', 'Mis kell sa magama lähed?',
      ], [90, 130], ['Hommikul…', 'Pärast tunde…', 'Õhtul…', 'Kõige parem päev on…, sest…']), 'Treener tahab teada, millal sul on jõudu trenniks. Räägid oma päevast vabalt ja ladusalt, ilma pikkade pausideta.'), { fluency: true }), 4, 10),
    ],
    transfer: [
      station(B.text('003_t_sit', 'Kas korvpall mahub nädalasse?', 'Proovitrenn läks hästi ja treener Raivo kutsub sind võistkonda. Trenn on kaks korda nädalas. Sinu nädal on juba täis: tunnid, kodutöö ja kodused asjad. Lepi treeneriga kokku, mis päevadel ja mis kell sa trenni tuled. Siis kirjuta oma uus nädal tabelisse. Sinu variant: kasuta oma päris tunniplaani ja oma päris trenni või ringi.'), 5, 15, { final: 'plan' }),
      teach(tag(purpose(B.rolecards('003_t_talk', 'Treener Raivo ja sinu nädal.', 'Õpetaja on treener Raivo. Mida ja kuidas öelda, otsusta ise.',
        'Olukord: sinu tunniplaan on sinu ees; esmaspäeval ja kolmapäeval jõuad koju alles kell neli.\nSinu eesmärk: leppida kokku kaks trenni nädalas nii, et kodutöö ja pere asjad ei kannata.\nPiirang: laupäeva hommikul aitad emal ja pühapäeval ei saa sa enne kella 12.',
        'Treeneri kaart on õpetajal: tal on oma ajad ja oma soovid.',
        ['Esmaspäeval mul ei sobi, sest…', 'Neljapäeval on mul aega pärast…', 'Kas trenn võiks olla…?', 'Siis lepime kokku, et…'], ['Meie trennid on…', 'Kas sulle sobib…?', 'Hea küll, siis…']), 'Treener tahab sind võistkonda, aga sinu nädal on juba täis. Lepid kokku kaks trenni, mis tegelikult sobivad.'), { main: true, level: 4 }),
      'Üks-ühele, õpetaja kaart (treener Raivo). Varjatud info: trenn võib olla esmaspäeval kell 16.30, teisipäeval kell 17, neljapäeval kell 15 või laupäeval kell 10; võistkond tahab, et uus mängija tuleks ka laupäeval. Takistused (ükshaaval): 1) „Kõige tähtsam trenn on laupäeva hommikul — kas tuled?”; 2) „Esmaspäeval kell 16.30 sobib ju, sa oled kell neli juba vaba!” (õpilane selgitab, miks ei sobi); 3) „Neljapäeval kell 15? Kas tunnid ei lõpe hiljem?” Õnnestunud, kui: lepitakse kokku kaks päeva ja kellaaega, õpilane põhjendab keeldumist (…, sest …) ja ütleb kokkuleppe ühe lausega, mis algab ajaga (Teisipäeval tulen ma…).'),
      purpose(B.table('003_t_plan', 'Minu uus nädal.', 'Kirjuta oma nädal koos trenniga. Iga päeva kohta üks lause: „Teisipäeval on mul…”.', 'Päev, Mis mul on?, Mis kell?', [
        'Esmaspäev |  | ', 'Teisipäev |  | ', 'Kolmapäev |  | ', 'Neljapäev |  | ', 'Reede |  | ', 'Laupäev |  | ', 'Pühapäev |  | ',
      ]), 'Pere peab teadma, millal sa koju tuled. Paned uue nädala kirja, et saaksid selle pere vestlusesse saata.'),
    ],
  },

  // ---------------------------------------------------------------- 004 PROB R→W: present tense and negation, the form
  'b1noor-004': {
    title: 'Huviringi kirja!',
    canDo: 'Ma valin kuulutuste järgi huviringi, täidan registreerimisvormi ja vastan juhendaja täpsustavale sõnumile.',
    teacherPage: {
      goal: 'Ученик выбирает кружок по объявлениям, заполняет анкету регистрации (формат Harno W1a) и отвечает руководителю на уточняющее сообщение.',
      core: [1, 4, 5], alt: 2,
      short: 'Станция 4 (10 мин: формы настоящего времени и отрицания) → станция 5 (15 мин). Ст. 1 — дома как упражнение Harno R1.',
      errors: [
        '«Ma ei käin», «ta ei käib» — в отрицании форма без окончания: «ei käi».',
        '«Ta käin» — у 3-го лица окончание -b: «ta käib», у «nad» — -vad: «nad käivad».',
        'Ответ на анкету без причины: где спрашивают «Miks?», нужно «…, sest …».',
      ],
      notes: [
        'Четыре пряди: ст. 1 — чтение (Harno R1), ст. 2 — слушание, ст. 3 — произношение, ст. 4 — форма, ст. 5 — письмо + онлайн-переписка (продукция).',
        'Онлайн-взаимодействие (ст. 5): ответ на сообщение руководителя в Stuudium — с одним уточняющим вопросом.',
        'Обратная связь в письме — по тем же целям (ei + основа, -b / -vad, «sest»): подчеркнуть, ученик исправляет сам, потом модель.',
        'Дом 10 + 1: «Harjuta» 10 минут ≥ 4 дней (смешанные предложения: настоящее время и отрицание, вопросы из урока 2, порядок слов из урока 3). Реальное задание на выбор: (а) открыть страницу кружков своей школы или молодёжного центра и выбрать один кружок (название, день, время); (б) спросить по-эстонски у руководителя или тренера одну вещь о занятиях.',
      ],
    },
    discover: [
      station(tag(purpose(B.adsmatch('004_d_ads', 'Huviringide mess.', 'Millist ringi (A–E) vajab iga noor? Kirjuta täht. Üks ring võib sobida kahele.', [
        ['Robootikaring', 'E ja K kell 15.30, ruum 112. Ehitame ja programmeerime roboteid. Arvutid on koolis olemas.'],
        ['Kooliteater', 'T ja N kell 16, aulas. Teeme kevadeks etenduse. Eesti keelt saab harjutada laval.'],
        ['Korvpall', 'E, T ja N kell 17, spordisaalis. Treener Raivo otsib võistkonda uusi mängijaid. Võistlused on laupäeviti.'],
        ['Kunstistuudio', 'K kell 14.30, ruum 305. Joonistame, maalime ja teeme koomikseid. Materjal on tasuta.'],
        ['Väitlusklubi', 'R kell 15, raamatukogus. Arutame noorte teemadel ja õpime oma arvamust põhjendama.'],
      ], [
        ['Artjom tahab sporti teha ja võistlustel mängida.', 'C'],
        ['Daria tahab rohkem eesti keelt rääkida ja talle meeldib laval olla.', 'B'],
        ['Robin armastab arvuteid ja tahab ise midagi ehitada.', 'A'],
        ['Milana joonistab vabal ajal koomikseid.', 'D'],
        ['Kertu tahab õppida, kuidas oma mõtet hästi põhjendada.', 'E'],
        ['Marko saab ringis käia ainult kolmapäeviti.', 'A|D'],
      ]), 'Reedel on huviringide mess ja sõbrad küsivad sinult nõu. Leiad igaühele ringi, mis sobib tema soovi ja ajaga.'), { harno: 'R1' }), 1, 12),
      tag(B.vocab('004_d_vocab', 'Tunni sõnad.', ['registreeruma — регистрироваться', 'vorm — анкета', 'kuulutus — объявление', 'mess — ярмарка', 'võistlus — соревнование', 'tasuta — бесплатно', 'täpsustama — уточнять', 'vastama — отвечать', 'küsima — спрашивать', 'sõnum — сообщение', 'põhjendama — обосновывать', 'juhendaja — руководитель кружка']), {}),
      station(teach(purpose(B.listening('004_d_voice', 'Juhendaja häälsõnum.', 'Enne kuulamist arva vastused. Õpetaja loeb sõnumi kaks korda, sina kirjuta lünka 1–2 sõna.', [
        'Toomas: Tere! Siin Toomas robootikaringist. Sa kirjutasid, et tahad ringi tulla. Väga tore!',
        'Toomas: Esimene kokkusaamine on esmaspäeval kell pool neli, ruumis sada kaksteist. See on esimesel korrusel, söökla kõrval.',
        'Toomas: Ring on tasuta, aga registreerida tuleb kooli kodulehel reedeks. Vormis küsitakse ka lapsevanema telefoni.',
        'Toomas: Kaasa võta vihik ja pliiats. Arvutid on meil olemas.',
        'Toomas: Kui sa esmaspäeval ei saa, kirjuta mulle Stuudiumis. Näeme!',
      ], [
        'Esimene kokkusaamine on esmaspäeval kell [pool neli|15.30].',
        'Ruum on [esimesel] korrusel.',
        'Ruum on [söökla] kõrval.',
        'Registreerida tuleb kooli [kodulehel].',
        'Vormis küsitakse lapsevanema [telefoni|telefoninumbrit].',
        'Kui sa ei saa tulla, kirjuta Toomasele [Stuudiumis].',
      ]), 'Juhendaja jättis sulle häälsõnumi. Kirjutad üles, mida ja millal teha, et sa ei jääks ringist ilma.'),
      'Kuulamise tsükkel: ennusta → esimene kuulamine (kas ennustus läks täide?) → teine kuulamine (lüngad) → üks rida refleksiooni.'), 2, 10),
    ],
    practice: [
      station(teach(purpose(B.gaps('004_p_vowels', 'Õ, ö või ü?', 'Kuula õpetajat ja kirjuta puuduv täht: õ, ö või ü. Siis loe laused ette.', [
        'Ma käin [ü]heksandas klassis.',
        'Ema tuleb t[ö]ölt kell kuus.',
        'Mu s[õ]ber elab Narvas.',
        'Reede [õ]htul on mess.',
        'Ma k[ü]sin juhendajalt.',
        'Lõuna on s[ö]öklas.',
      ], '', 'full', 'g_notice'), 'Kui ütled õ asemel o või ü asemel u, ei saa juhendaja sinust alati aru. Harjutad häälikuid, mida vene keeles ei ole.'),
      'Üks-ühele: kõigepealt taju — õpetaja loeb, õpilane ainult kirjutab tähe; siis hääldus — õpilane loeb, õpetaja näitab: õ juures huuled laiali, ö ja ü juures ümarad. Kui õpilane ütleb o või u, palu tal kuulata paari „sõber — sober”.'), 3, 8),
      station(B.notice('004_p_rule', 'Märka: olevik ja eitus', [
        'ma käi**n** · sa käi**d** · ta käi**b** · me käi**me** · te käi**te** · nad käi**vad**',
        'Eitus on kõigil sama: ma / sa / ta / me / nad **ei käi** · mul **ei ole** aega',
        'Küsimus ja vastus: **Kas** sa käid trennis? → Jah, **käin**. / Ei, **ei käi**.',
      ], 'full'), 4, 10),
      teach(purpose(B.formtext('004_p_form', 'Milana vastused vormis.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', 'Robootikaringi registreerimisvorm', [
        'Mis klassis sa käid? — Ma [käin] (käima) üheksandas klassis.',
        'Mis keeli sa räägid? — Ma [räägin] (rääkima) vene, eesti ja natuke inglise keelt.',
        'Kas sa oskad programmeerida? — Ei, ma veel ei [oska] (oskama), aga mulle [meeldib] (meeldima) arvutiga töötada.',
        'Mis päevadel sa saad tulla? — Esmaspäeval ma [saan] (saama), aga kolmapäeval ei [saa] (saama).',
        'Miks sa tahad ringi tulla? — Mu vend [õpib] (õppima) ülikoolis ja [ehitab] (ehitama) roboteid.',
      ]), 'Milana täidab ringi registreerimisvormi. Aitad tal vormid õigeks kirjutada, sest vormi loeb juhendaja.'),
      'Üks-ühele: õpilane täidab üksi, siis loeb vastused õpetajale ette nagu juhendajale. Vea korral esmalt vihje („ei käin?”), mudel alles siis, kui õpilane ise ei paranda.'),
    ],
    transfer: [
      station(B.text('004_t_sit', 'Vali ring ja registreeru', 'Vali üks ring messi kuulutuste või oma kooli päris ringide seast ja täida registreerimisvorm. Pärast seda kirjutab juhendaja sulle Stuudiumis:\n\n„Tere! Aitäh registreerimast! Sa kirjutasid, et saad käia ainult ühel päeval. Ring on aga kaks korda nädalas. Mis päeval sa tuled ja kas teisel päeval saaksid vahel tulla? Toomas”\n\nSinu variant: täida vorm oma päris ringi või trenni jaoks (päris telefoninumbrit ega aadressi kirjutama ei pea).'), 5, 15, { final: 'decide' }),
      tag(purpose(B.examWriting('004_t_form', 'Registreerimisvorm.', 'Vasta igale küsimusele lühidalt. Kus küsitakse „Miks?”, kirjuta ka põhjus (…, sest …).', 'kusimustik', {
        situation: 'Kooli huviringide registreerimisvorm, õppeaasta 2026/2027.',
        questions: ['Nimi ja klass', 'Mis ringi sa valid? Miks just selle?', 'Mis päevadel ja mis kell sa saad käia?', 'Mida sa juba oskad?', 'Mida sa tahad ringis õppida? Miks?', 'Mida sa tahad juhendajalt veel küsida?'],
        words: [40, 70],
      }), 'Juhendaja teeb ringi nimekirja vormide järgi. Täidad vormi nii, et ta teab, kes sa oled, miks tuled ja millal saad käia.'), { harno: 'W1a', main: true, level: 3 }),
      purpose(B.writing('004_t_reply', 'Juhendaja küsib Stuudiumis.', 'Vasta Toomase sõnumile 4–6 lausega: mis päeval tuled, miks teisel ei saa, ja üks küsimus.', [4, 6], ['sest', 'kas'], 2), 'Juhendaja vajab täpset vastust, et nimekiri valmis saada. Vastad tema sõnumile viisakalt ja küsid ise, mis jäi selgusetuks.'),
    ],
  },

  // ---------------------------------------------------------------- 005 module check (= a2b1-005)
  // Blueprint §5.2: A — the module's exam format (S0 / the 9th-grade oral intro), B — the final task in a new situation
  // (the summer camp: a form and introducing yourself), C — the module's grammar (questions, present tense, word order)
  // + local cases from A2 and the module's words. Pass mark 70 % a part; no new words or grammar.
  'b1noor-005': {
    title: 'Kontroll 1: mina ja minu nädal',
    assessment: true,
    // blueprint §5.2: a module check is 45–60 min in all (parts A, B, C), not three full-length exam sheets
    shortSheet: true,
    canDo: 'Ma räägin endast nagu eksami alguses, registreerin end uude kohta ja kasutan küsimusi, olevikku ja sõnajärge õigesti.',
    discover: [
      B.text('005_d_intro', 'Kontroll 1', 'See on mooduli 1 kontroll. Osa A: räägid endast nagu eksami alguses. Osa B: uus olukord — registreerud noortekeskuse suvelaagrisse ja tutvustad end laagris. Osa C: lugemine, keel ja sõnad. Eesmärk on igas osas vähemalt 70%. Uusi sõnu ega reegleid siin ei ole.'),
      B.examPart('005_d_part', 'R', { part: 'Osa C. Lugemine, keel ja sõnad', minutes: 40, points: 44, tasks: 6, target: 70, note: 'Sõnaraamatut ei kasuta.' }),
      B.vocab('005_d_vocab', 'Kontrolli sõnad.', ['kontroll — проверка', 'osa — часть', 'eesmärk — цель', 'tulemus — результат', 'laager — лагерь', 'matk — поход', 'lõke — костёр', 'magamiskott — спальный мешок']),
      B.reading('005_d_camp', 'Lugemine 1. Suvelaager.', 'Loe kuulutust ja vasta küsimustele lühidalt.', 'Noortekeskuse suvelaager', [
        'Tere, noored! Noortekeskus korraldab juunis suvelaagri 13–16-aastastele. Laager kestab seitse päeva ja on metsas järve ääres. Hommikuti on sport ja matkad, pärastlõunal saab valida ringi: robootika, teater, kunst või korvpall. Õhtuti teeme lõket ja räägime eesti keeles. Laagrisse tuleb noori Tallinnast, Narvast ja Tartust, nii et saad leida uusi sõpru üle Eesti. Elame neljakesi majakestes, igas majakeses on oma juhendaja. Söök on kolm korda päevas ja kokk arvestab ka allergiatega. Vihmase ilmaga mängime suures saalis lauamänge või vaatame filmi. Bussisõit on tasuta, buss väljub noortekeskuse eest. Kaasa on vaja võtta magamiskott, vihmajope ja veepudel. Telefoni võib kaasa võtta, aga õhtul kell kümme anname telefonid juhendajale. Kohti on ainult nelikümmend. Registreerida saab noortekeskuse kodulehel 15. maini. Küsimuste korral kirjuta juhendaja Kristile.',
      ], [
        ['Kui kaua laager kestab?', 'seitse päeva|7 päeva|nädal'],
        ['Kus laager on?', 'metsas järve ääres|järve ääres|metsas'],
        ['Mida saab pärastlõunal valida?', 'ringi|ringi: robootika, teater, kunst või korvpall'],
        ['Kust buss väljub?', 'noortekeskuse eest'],
        ['Mis kell annavad noored telefonid juhendajale?', 'kell kümme|kell 10|kell 22|kümnest'],
        ['Mitu kohta laagris on?', 'nelikümmend|40'],
      ]),
      B.truefalse('005_d_camp_tf', 'Lugemine 2. Kas see on õige?', 'Loe kuulutust veel kord. Kas lause on õige või vale?', [
        ['Laagrisse võivad tulla 13–16-aastased noored.', true],
        ['Bussisõidu eest tuleb maksta.', false],
        ['Õhtuti räägitakse laagris eesti keelt.', true],
        ['Telefoni ei tohi laagrisse kaasa võtta.', false],
        ['Registreerida saab kuni juuni lõpuni.', false],
        ['Küsimustega võib kirjutada juhendajale.', true],
      ], 'full'),
      B.match('005_d_words', 'Sõnad 1. Koolis.', 'Ühenda sõna ja selgitus.', [
        ['klassijuhataja', 'õpetaja, kes hoolitseb terve klassi eest'],
        ['tunniplaan', 'nimekiri, mis tunnid mis päeval on'],
        ['vahetund', 'paus kahe tunni vahel'],
        ['söökla', 'koht koolis, kus süüakse lõunat'],
        ['kodutöö', 'ülesanne, mida teed pärast tunde kodus'],
        ['korrus', 'maja osa: esimene, teine, kolmas…'],
      ], 'full', 'g_vocab'),
      B.match('005_d_words2', 'Sõnad 2. Pärast tunde.', 'Ühenda sõna ja selgitus.', [
        ['huviring', 'koht, kus noored pärast tunde oma hobiga tegelevad'],
        ['juhendaja', 'inimene, kes ringi juhib'],
        ['noortekeskus', 'maja, kus noored saavad vabal ajal koos olla'],
        ['võistkond', 'mängijad, kes mängivad koos'],
        ['registreeruma', 'oma nime kirja panema, et kuhugi tulla'],
        ['täpsustama', 'küsima või ütlema täpsemalt'],
      ], 'full', 'g_vocab'),
      why(B.cloze('005_d_cloze', 'Keel 1. Daria sõnum Milanale.', 'Vali Daria sõnumis igasse lünka õige vorm.', 'Tere, Milana!', [
        'Tere, Milana! {*Kas|Kus|Mis} sa homme kooli tuled? Mina tulen kell kaheksa. {*Kus|Kas|Kuhu} sa elad? Ma elan nüüd {*Lasnamäel|Lasnamäele|Lasnamäelt} ja sõidan kooli bussiga.',
        '',
        'Reedel on mul korvpallitrenn {*spordisaalis|spordisaali|spordisaalist}, aga neljapäeval mul ei ole {*trenni|trenn|trennis}. Kas me {*läheme|lähete|minema} neljapäeval koos raamatukokku? Pärast tunde käin ma tavaliselt seal.',
        '',
        'Ma ei {*räägi|räägin|rääkima} veel hästi eesti keelt, aga ma {*õpin|õpib|õppima} iga päev. Daria',
      ]), [
        'Kas-küsimus: vastus on jah või ei (tund 2).', 'Küsisõnaga küsimus: kus? (tund 2).', 'Kohakääne, kus? → Lasnamäel (A2, tund 2).',
        'Kohakääne, kus? → spordisaalis (tund 3).', 'Eituses osastav: ei ole trenni (tund 3).', 'Olevik, me-vorm: läheme (tund 4).',
        'Eitus: ei + tüvi, ei räägi (tund 4).', 'Olevik, ma-vorm: õpin (tund 4).',
      ]),
      why(B.gaps('005_d_where', 'Keel 2. Kus, kuhu või kust?', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Milana tuli Tallinna [Narvast] (Narva).',
        'Nüüd elab ta [Lasnamäel] (Lasnamäe).',
        'Pärast tunde läheb ta [noortekeskusesse] (noortekeskus).',
        'Trenn on [spordisaalis] (spordisaal).',
        'Laupäeval sõidab ta bussiga [kesklinna] (kesklinn).',
        'Õhtul tuleb ta [trennist] (trenn) hilja koju.',
      ], '', 'full', 'g_notice'), ['Kust? → -st: Narvast.', 'Kus? → -l: Lasnamäel.', 'Kuhu? → -sse: noortekeskusesse.', 'Kus? → -s: spordisaalis.', 'Kuhu? → kesklinna (lühike sisseütlev).', 'Kust? → -st: trennist.']),
      why(B.wordorder('005_d_order', 'Keel 2. Pane lause kokku.', 'Pane sõnad õigesse järjekorda. Alusta suure tähega sõnast.', [
        'Millal | algab | sinu | trenn',
        'Kas | sa | käid | kunstiringis',
        'Neljapäeval | on | mul | proovitrenn',
        'Pärast | tunde | lähen | ma | raamatukokku',
        'Mis | keeli | sa | räägid',
        'Laupäeval | ei | ole | mul | aega',
      ], 'full', 'g_notice'), ['Küsisõna + tegusõna (tund 2).', 'Kas-küsimus (tund 2).', 'Aeg ees, tegusõna teisel kohal (tund 3).', 'Aeg ees, tegusõna teisel kohal (tund 3).', 'Küsisõnaga küsimus (tund 2).', 'Eitus, mul ei ole + osastav (tund 3).']),
    ],
    practice: [
      B.examPart('005_p_lpart', 'L', { part: 'Osa B. Kuulamine', minutes: 15, points: 12, tasks: 2, target: 70, note: 'Õpetaja loeb iga teksti kaks korda.' }),
      B.listening('005_p_kristi', 'Kuulamine 1. Juhendaja Kristi sõnum.', 'Õpetaja loeb Kristi häälsõnumi kaks korda. Kirjuta lünka üks sõna või number.', [
        'Kristi: Tere! Siin Kristi noortekeskusest. Aitäh, et registreerusid suvelaagrisse!',
        'Kristi: Laager algab esmaspäeval, kümnendal juunil. Buss väljub noortekeskuse eest kell üheksa hommikul.',
        'Kristi: Esimesel päeval on matk, nii et pane jalga mugavad jalanõud.',
        'Kristi: Sa kirjutasid vormis, et tahad robootikaringi. Seal on kohti veel kolm.',
        'Kristi: Palun saada mulle reedeks lapsevanema luba. Vormi leiad kodulehelt.',
        'Kristi: Kui sul on küsimusi, helista mulle või kirjuta. Kohtumiseni!',
      ], [
        'Laager algab [esmaspäeval].',
        'Buss väljub kell [üheksa|9] hommikul.',
        'Esimesel päeval on [matk].',
        'Robootikaringis on veel [kolm|3] kohta.',
        'Lapsevanema luba tuleb saata [reedeks].',
        'Loa vormi leiab [kodulehelt|kodulehel].',
      ]),
      B.examListen('005_p_radio', 'Kuulamine 2. Noortekeskuse teated.', 'Õpetaja loeb viis lühikest teadet kaks korda. Vali õige vastus.', 'choice', [
        'Teade üks.', 'Juhendaja: Täna on kunstiring ruumis kaks, mitte ruumis üks.',
        'Teade kaks.', 'Juhendaja: Noortekeskus on reedel suletud, sest töötajatel on koolitus.',
        'Teade kolm.', 'Juhendaja: Korvpallitrenn algab täna pool tundi hiljem, kell pool kuus.',
        'Teade neli.', 'Juhendaja: Laupäeval läheme kinno. Kogunemine on kell kaks noortekeskuse ees.',
        'Teade viis.', 'Juhendaja: Kes kaotas sinise mütsi? See on köögis laua peal.',
      ], [
        ['Kus on täna kunstiring?', 'ruumis kaks', 'ruumis üks', 'köögis'],
        ['Miks on noortekeskus reedel suletud?', 'töötajatel on koolitus', 'on püha', 'on remont'],
        ['Mis kell algab täna korvpallitrenn?', 'pool kuus', 'kell viis', 'kell kuus'],
        ['Kus kohtutakse laupäeval?', 'noortekeskuse ees', 'kino ees', 'koolis'],
        ['Kus on sinine müts?', 'köögis laua peal', 'riidekapis', 'spordisaalis'],
      ]),
      B.examPart('005_p_wpart', 'W', { part: 'Osa B. Kirjutamine', minutes: 25, points: 20, tasks: 3, target: 70, note: 'Uus olukord, sama oskus nagu tunnis 4.' }),
      why(B.formtext('005_p_forms', 'Keel 3. Artjomi sõnum.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', 'Artjom kirjutab Kristile', [
        'Tere, Kristi! Ma [olen] (olema) Artjom ja ma [tulen] (tulema) laagrisse koos sõbraga. Me [mängime] (mängima) mõlemad korvpalli.',
        'Kas laagris [on] (olema) ka korvpalliplats? Mu sõber ei [räägi] (rääkima) eesti keelt hästi, aga ta [õpib] (õppima) kiiresti. Artjom',
      ]), ['olema: ma olen.', 'tulema: ma tulen.', 'mängima: me mängime.', 'olema: on.', 'Eitus: ei räägi.', 'õppima: ta õpib (astmevaheldus pp → p).']),
      why(B.gaps('005_p_neg', 'Keel 4. Jah või ei?', 'Vasta eitavalt. Kirjuta lünka tegusõna eitav vorm.', [
        'Kas sa käid laupäeval trennis? — Ei, ma [ei käi].',
        'Kas Robin elab Narvas? — Ei, ta [ei ela] Narvas.',
        'Kas te räägite soome keelt? — Ei, me [ei räägi].',
        'Kas sul on täna aega? — Ei, mul [ei ole] aega.',
        'Kas nad tulevad laagrisse? — Ei, nad [ei tule].',
        'Kas sa tead Kristi numbrit? — Ei, ma [ei tea].',
      ], '', 'full', 'g_notice'), ['Eitus: ei + tüvi, kõigil isikutel sama.', 'ei ela (mitte: ei elab).', 'ei räägi (mitte: ei räägime).', 'mul ei ole + osastav: aega.', 'ei tule (mitte: ei tulevad).', 'ei tea.']),
      why(B.transformation('005_p_ask', 'Keel 5. Tee küsimus.', 'Kirjuta küsimus, mille vastus on antud lauses. Kasuta antud sõna.', [
        ['Laager algab kümnendal juunil.', 'millal', 'Millal laager algab?|Millal algab laager?'],
        ['Buss väljub noortekeskuse eest.', 'kust', 'Kust buss väljub?|Kust väljub buss?'],
        ['Jah, laagris on korvpalliplats.', 'kas', 'Kas laagris on korvpalliplats?'],
        ['Matkale tuleb võtta vihmajope.', 'mida', 'Mida tuleb matkale võtta?|Mida matkale võtta?|Mida tuleb matkale kaasa võtta?'],
        ['Kristi töötab noortekeskuses.', 'kus', 'Kus Kristi töötab?|Kus töötab Kristi?'],
        ['Ei, ma ei räägi soome keelt.', 'kas', 'Kas sa räägid soome keelt?'],
      ]), ['Millal? — aeg.', 'Kust? — koht, kust tullakse.', 'Kas-küsimus, vastus jah.', 'Mida? — sihitis.', 'Kus? — koht.', 'Kas-küsimus, vastus ei.']),
      why(B.errorfix('005_p_fix', 'Keel 6. Paranda viga.', 'Igas lauses on üks viga. Kirjuta lause õigesti.', [
        ['Kas kus sa elad?', 'Kus sa elad?'],
        ['Ma ei käin laupäeval trennis.', 'Ma ei käi laupäeval trennis.'],
        ['Ma elan Lasnamäe.', 'Ma elan Lasnamäel.'],
        ['Täna mul ei ole trenn.', 'Täna mul ei ole trenni.|Täna ei ole mul trenni.'],
        ['Ta käin robootikaringis.', 'Ta käib robootikaringis.'],
        ['Pärast tunde ma lähen noortekeskus.', 'Pärast tunde lähen ma noortekeskusesse.|Pärast tunde ma lähen noortekeskusesse.'],
      ]), ['Küsisõna järel kas ei tule (tund 2).', 'Eitus: ei + tüvi (tund 4).', 'Kus? → Lasnamäel (tund 2).', 'Eituses osastav (tund 3).', 'Ta-vorm: käib (tund 4).', 'Kuhu? → noortekeskusesse (tund 3).']),
      tag(B.examWriting('005_p_form', 'Kirjutamine. Suvelaagri registreerimisvorm.', 'Täida vorm. Kus küsitakse „Miks?”, kirjuta ka põhjus.', 'kusimustik', {
        situation: 'Noortekeskus korraldab juunis nädala pikkuse suvelaagri 13–16-aastastele. Kohti on vähe, juhendajad valivad vormide järgi.',
        questions: ['Nimi, vanus ja klass', 'Kus sa elad ja kuidas sa laagrisse tuled?', 'Mida sa vabal ajal teed?', 'Mis keeli sa räägid?', 'Miks sa tahad laagrisse tulla?', 'Mida sa tahad juhendajalt küsida?'],
        words: [40, 70],
      }), { harno: 'W1a' }),
      B.rubricW1('005_p_r1', ['kes sa oled ja kus elad', 'mida sa vabal ajal teed', 'miks sa tahad tulla', 'küsimus juhendajale']),
    ],
    transfer: [
      B.examPart('005_t_part', 'S', { part: 'Osa A ja B. Rääkimine', minutes: 15, points: 20, tasks: 2, target: 70, note: 'Õpetajaga üks-ühele.' }),
      B.choice('005_t_ask', 'Enne rääkimist. Mida sa küsid?', 'Vali iga olukorra jaoks sobiv küsimus.', [
        ['Sa tahad teada, kas juhendaja räägib vene keelt.', 'Kas te räägite vene keelt?', 'Kus te räägite vene keelt?', 'Kas kus te räägite?'],
        ['Sa ei tea, mis kell hommikusöök on.', 'Mis kell on hommikusöök?', 'Kas on hommikusöök?', 'Kuhu on hommikusöök?'],
        ['Sa tahad teada, kus on sinu tuba.', 'Kus on minu tuba?', 'Kuhu on minu tuba?', 'Kust on minu tuba?'],
        ['Sa tahad teada, mida matkale kaasa võtta.', 'Mida ma pean matkale kaasa võtma?', 'Kas ma pean matkale?', 'Millal matk on kaasa?'],
        ['Sa ei kuulnud uue sõbra nime.', 'Vabandust, mis su nimi on?', 'Vabandust, kus su nimi on?', 'Vabandust, kas sa oled nimi?'],
        ['Sa tahad teada, kas õhtul on lõke.', 'Kas täna õhtul on lõke?', 'Kus täna õhtul on lõke?', 'Mis täna õhtul lõke?'],
      ], 'full', 'g_notice'),
      B.match('005_t_reply', 'Sobiv vastus.', 'Ühenda küsimus ja vastus.', [
        ['Kust sa tulid?', 'Narvast.'],
        ['Kus sa elad?', 'Tallinnas, Lasnamäel.'],
        ['Kuhu sa pärast kooli lähed?', 'Noortekeskusesse.'],
        ['Kas sa käid trennis?', 'Käin küll, korvpallis.'],
        ['Millal su trenn on?', 'Teisipäeval ja neljapäeval.'],
        ['Mis keeli sa räägid?', 'Eesti, vene ja inglise keelt.'],
      ], 'full', 'g_notice'),
      teach(B.dialogue('005_t_phone', 'Kõne laagrisse.', 'Kirjuta Milana küsimustesse puuduv küsisõna.', 'Milana', 'Kristi', [
        ['A', 'Tere! [Kas] laagris on veel vabu kohti?'],
        ['B', 'On küll, kolm kohta.'],
        ['A', '[Millal] laager algab?'],
        ['B', 'Kümnendal juunil.'],
        ['A', '[Kust] buss väljub?'],
        ['B', 'Noortekeskuse eest, kell üheksa.'],
        ['A', '[Mida] ma pean kaasa võtma?'],
        ['B', 'Magamiskoti, vihmajope ja veepudeli.'],
      ], 'g_notice'), 'Üks-ühele: pärast lünkade täitmist loevad õpilane (Milana) ja õpetaja (Kristi) dialoogi ette.'),
      teach(tag(withInstruction(B.examiner('005_t_intro', 'mina, minu kool ja minu vaba aeg', [
        'Kes sa oled ja kust sa pärit oled?',
        'Räägi oma kodukohast. Mis seal sulle meeldib?',
        'Kellest koosneb sinu pere?',
        'Mis on sinu lemmikaine ja miks?',
        'Mida sa vabal ajal teed?',
        'Kuidas sa tavaliselt koolivaheaja veedad?',
        'Mida sa tahad pärast põhikooli teha?',
      ], 'B1', [60, 120]), 'Vasta eksamineerija küsimustele 2–4 lausega. Ütle üks põhjus või näide.'), { harno: 'S0' }),
      'Osa A. Teemad on 9. klassi eesti keele teise keelena lõpueksami suulise osa sissejuhatusest (huvid ja vaheajad, plaanid, kodukoht, pere, kool). Hinda rubriigiga; märgi, kas vastuses on põhjus või näide.'),
      teach(tag(B.rolecards('005_t_camp', 'Osa B. Laagri esimene õhtu.', 'Õpetaja on laagri juhendaja. Mida ja kuidas öelda, otsusta ise.',
        'Olukord: suvelaagri esimene õhtu, kõik istuvad lõkke ääres ja keegi ei tunne sind.\nSinu eesmärk: tutvusta end nii, et juhendaja teab, kes sa oled ja mida sa laagris teha tahad; küsi ise vähemalt kaks küsimust homse päeva kohta.\nPiirang: sa ei tea, mis kell homme hommikusöök on ja mida matkale kaasa võtta.',
        'Juhendaja kaart on õpetajal.',
        ['Mina olen…', 'Ma tulin…', 'Ma tahaksin…', 'Kas…?', 'Mis kell…?'], ['Tere tulemast laagrisse!', 'Räägi endast.']), { harno: 'S1a', main: true }),
      'Osa B, õpetaja kaart (juhendaja). Varjatud info: hommikusöök kell 8.30, matk kell 10, kaasa vihmajope ja veepudel. Takistused: 1) „Kust sa tulid? Ma ei kuulnud.”; 2) „Mis keeli sa räägid? Kas saad teistele tõlkida?” Õnnestunud (2 punkti), kui õpilane tutvustab end ise, küsib vähemalt kaks küsimust (kas-küsimus ja küsisõnaga küsimus) ja teab lõpus hommikusöögi aega ja mida matkale kaasa võtta. Abiga 1, ei õnnestu 0.'),
      B.rubricSpeaking('005_t_rs'),
      teach(B.table('005_t_result', 'Võrdle sisenemistestiga.', 'Kirjuta oma tulemus ja sisenemistesti tulemus. Mis paranes?', 'Osa, Sisenemistest, Kontroll 1, Mis paranes?', [
        'A. Rääkimine endast |  |  | ', 'B. Vorm ja tutvustamine |  |  | ', 'C. Lugemine |  |  | ', 'C. Keel: küsimused, olevik, sõnajärg |  |  | ', 'C. Sõnad |  |  | ',
      ]), 'Õpetajale: alla 70% osas → üks sihitud kodutöö („Harjuta” selle vormi harjutused) ja lõpuülesanne uuesti järgmise tunni esimese jaamana. Moodulit ei korrata.'),
      B.selfcheck('005_t_self', ['Ma tutvustan end uues kohas.', 'Ma küsin kas-küsimusi ja küsisõnaga küsimusi.', 'Ma räägin oma nädalast (Esmaspäeval on mul…).', 'Ma täidan registreerimisvormi ja põhjendan.', 'Ma vastan juhendaja sõnumile.'], 'Moodul 1 tehtud'),
    ],
  },
}, {
  'b1noor-001': 'EKS', 'b1noor-002': 'RÄÄK L→S', 'b1noor-003': 'AVAS R→S', 'b1noor-004': 'PROB R→W', 'b1noor-005': 'EKS',
});
