// A2 course (A1 → A2 roadmap), module 12 „Reisimine ja transport”, all five lessons a2-056…a2-060 (059 the simple
// past for a finished trip, 060 the module check in the Harno A2 form). Transport and the ticket (millega? -ga, kus/kuhu/kust), the timetable and
// the departure board (väljub, saabub, hilineb, platvorm, ümberistumine), buying a ticket and asking about the trip.
// Harno A2 formats: listening with 1–2-word answers (read twice), notices and timetables, a short message (30–50 words),
// picture description and an idea card.
// Cast by docs/TEXTBOOK_ART_BIBLE.md §4 in the lessons added 2026-10-13 (Anna office, Markus warehouse, Liis teacher /
// official, Viktor pensioner, Sofia student, Jaan café owner; Oksana + Mia 6, Olga accountant, Kati, Igor as extras).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-12', course: 'a2', title: 'Reisimine ja transport', level: 'A2', design: 'v2', template: 'v3' };

export const LESSONS = {
  'a2-056': {
    title: 'Transport ja pilet',
    canDo: 'Ma selgitan 5–6 lausega, kuidas ma ühest kohast teise sõidan, ja ütlen, millist piletit vajan (üks ots või edasi-tagasi).',
    template: 'v3',
    discover: [
      B.text('056_d_situation', 'Hommik bussipeatuses', 'Kell on 7.40. Anna seisab bussipeatuses. Ta sõidab iga päev bussiga tööle. Täna buss hilineb. Markus tuleb peatusesse jalgrattaga ja küsib, kuhu Anna sõidab.'),
      B.reading('056_d_read', 'Loe: Markuse teekond.', 'Loe tekst ja vasta küsimustele.', 'Kuidas Markus Tartusse sõidab',
        'Markus elab Tallinnas Mustamäel. Laupäeval sõidab ta Tartusse oma vanemate juurde. Kõigepealt läheb ta jalgsi bussipeatusesse. Peatus on maja lähedal, ainult viis minutit jala. Siis sõidab ta bussiga kesklinna. Kesklinnas läheb ta trammi peale ja sõidab Balti jaama. Balti jaam on suur ja seal on ka turg. Jaamas ostab ta piletiautomaadist rongipileti. Pilet Tartusse maksab üksteist eurot. Markus ostab edasi-tagasi pileti, sest pühapäeva õhtul tuleb ta tagasi. Rong väljub kell kümme ja sõit kestab umbes kaks tundi. Rongis loeb Markus raamatut ja joob kohvi. Mõnikord vaatab ta lihtsalt aknast välja. Tartusse saab ka bussiga, aga Markusele meeldib rong rohkem. Autot tal ei ole. Kui ilm on ilus, sõidab ta kesklinna jalgrattaga. Talvel ja vihmaga sõidab ta alati bussiga. Ta ütleb alati: „Rongis saan ma lugeda ja puhata.”',
        [['Kuidas läheb Markus bussipeatusesse?', 'jalgsi|jala|ta läheb jalgsi|ta läheb jala'], ['Millega sõidab Markus kesklinnast jaama?', 'trammiga|ta sõidab trammiga'], ['Kust ostab Markus rongipileti?', 'piletiautomaadist|automaadist|jaamast'], ['Miks ostab Markus edasi-tagasi pileti?', 'ta tuleb pühapäeval tagasi|sest ta tuleb pühapäeva õhtul tagasi|ta tuleb tagasi'], ['Mis kell jõuab rong umbes Tartusse?', 'kell kaksteist|kaksteist|12|umbes kell kaksteist|keskpäeval'], ['Miks meeldib Markusele rong?', 'rongis saab lugeda ja puhata|ta saab rongis lugeda ja puhata|seal saab puhata'], ['Kui palju maksab pilet Tartusse?', 'üksteist eurot|11 eurot'], ['Mis kell rong väljub?', 'kell kümme|kümme|10']]),
      B.notice('056_d_notice', 'Märka: millega? kuhu? kus?', ['Ma sõidan **bussiga**. (buss → buss**iga**)', 'Ta sõidab **trammiga** jaama.', 'Me sõidame **rongiga** Tartusse.', 'Aga: ma lähen **jalgsi** või **jala**.', 'Pilet **Tartusse**: üks ots või edasi-tagasi?', 'Ma ootan **peatuses**. Ma lähen **peatusesse**.'], 'full'),
      B.wordforms('056_d_forms', 'Millega sa sõidad?', 'Kirjuta sõna -ga vormis.', [
        ['buss', 'millega?', 'bussiga'], ['tramm', 'millega?', 'trammiga'], ['rong', 'millega?', 'rongiga'], ['lennuk', 'millega?', 'lennukiga'],
        ['takso', 'millega?', 'taksoga'], ['jalgratas', 'millega?', 'jalgrattaga, rattaga'], ['auto', 'millega?', 'autoga'], ['laev', 'millega?', 'laevaga']]),
      B.gaps('056_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', ['Anna ootab bussi [peatuses].', 'Rong väljub [jaamast] kell kümme.', 'Ma ostan [pileti] automaadist.', 'Ma tulen homme tagasi. Palun [edasi-tagasi] pilet.', 'Ma ei tule tagasi. Mul on vaja ainult [üks ots].', 'Lennuk lendab [lennujaamast] Londonisse.', 'Anna läheb hommikul bussi[peatusesse].', 'Kas ma saan selle [piletiga] ka trammis sõita?'], ['peatuses', 'jaamast', 'pileti', 'edasi-tagasi', 'üks ots', 'lennujaamast', 'peatusesse', 'piletiga', 'jaamas', 'lennukiga']),
      B.errorfix('056_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma sõidan tööle bussis.', 'Ma sõidan tööle bussiga.'], ['Ma lähen jaamasse jalgsiga.', 'Ma lähen jaama jalgsi.|Ma lähen jaamasse jalgsi.|Ma lähen jaama jala.'], ['Palun üks pilet Tartu.', 'Palun üks pilet Tartusse.'], ['Ma ootan bussi peatusesse.', 'Ma ootan bussi peatuses.'], ['Me sõidame Pärnusse rongil.', 'Me sõidame Pärnusse rongiga.'], ['Ma ostan pilet automaadist.', 'Ma ostan pileti automaadist.'], ['Ma sõidan bussis tööle.', 'Ma sõidan bussiga tööle.|Ma sõidan tööle bussiga.'], ['Ma lähen jalgsiga.', 'Ma lähen jalgsi.']]),
      B.translation('056_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я езжу на работу на автобусе.', 'Один билет до Тарту, пожалуйста.', 'Туда и обратно.', 'Где трамвайная остановка?', 'Я иду на вокзал пешком.', 'Поезд отправляется в десять часов.', 'Я жду автобус на остановке.', 'Мы едем в Пярну на поезде.']),
      B.speaking('056_d_say', 'Minu teekond.', 'Räägi paarilisele, kuidas sa tööle või kooli sõidad.', [
        'Millega sa sõidad?', 'Kui kaua sõit kestab?', 'Kus sa pileti ostad?', 'Mis sulle selles sõidus meeldib?',
      ], [60, 120], ['Ma sõidan …-ga.', 'Kõigepealt…, siis…', 'Sõit kestab … minutit.']),
      B.writing('056_d_write', 'Kuidas sa sõidad?', 'Kirjuta 6–8 lauset: kuidas sa tööle, poodi ja sõbra juurde sõidad.', [6, 8], ['sõidan', 'bussiga', 'jalgsi', 'pilet'], 2),
    ],
    practice: [
      B.cloze('056_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Sofia sõidab vanaema juurde', [
        'Sofia õpib Tartus, aga tema vanaema elab Narvas. Reedel sõidab Sofia {*bussiga|bussis|bussi} Narva.',
        '',
        'Bussijaama läheb ta {*jalgsi|jalgsiga|jalga}, sest see on lähedal. Jaamas ostab ta {*pileti|pilet|piletiga} automaadist.',
        '',
        'Sofia ostab {*edasi-tagasi|üks ots|edasi} pileti, sest pühapäeval tuleb ta tagasi. Buss {*väljub|väljus|väljuma} kell neli.',
        '',
        'Sõit {*kestab|kestis|kestma} kolm tundi. Narvas ootab vanaema teda {*bussijaamas|bussijaama|bussijaamast}. Koju sõidavad nad {*taksoga|taksos|takso}.',
      ], 'g_vocab'),
      B.choice('056_p_form', 'Vali õige vorm.', 'Vali lünka õige vorm.', [['Ma sõidan tööle ___.', 'bussiga', 'bussi', 'bussis'], ['Ma ootan bussi ___.', 'peatuses', 'peatusesse', 'peatusega'], ['Palun üks pilet ___.', 'Tartusse', 'Tartus', 'Tartuga'], ['Rong väljub ___ kell üheksa.', 'jaamast', 'jaama', 'jaamaga'], ['Me lendame Londonisse ___.', 'lennukiga', 'lennukis', 'lennukile'], ['Ma ostan ___ automaadist.', 'pileti', 'pilet', 'piletiga'], ['Sa sõidad Tartusse ja tuled samal õhtul tagasi. Mis pilet sobib?', 'edasi-tagasi', 'üks ots', 'trammipilet'], ['Sa kolid Pärnusse ja jääd sinna elama. Mis pilet sobib?', 'üks ots', 'edasi-tagasi', 'lennukipilet']], 'full', 'g_notice'),
      B.formtext('056_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Markuse teekonnad', [
        'Igal hommikul sõidab Markus tööle [bussiga] (buss).',
        '',
        'Ta ootab bussi [peatuses] (peatus) maja lähedal. Kesklinnas läheb ta [trammi] (tramm) peale.',
        '',
        'Laupäeval sõidab ta [rongiga] (rong) [Tartusse] (Tartu). Ta ostab [pileti] (pilet) automaadist.',
        '',
        'Rong väljub [jaamast] (jaam) kell kümme. Puhkusel lendab Markus [lennukiga] (lennuk) Itaaliasse.',
      ], 'g_notice'),
      B.gaps('056_p_gaps', 'Kirjuta õiges vormis.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma sõidan iga päev [trammiga] (tramm).', 'Anna läheb [peatusesse|bussipeatusesse] (peatus).', 'Viktor ostab [pileti] (pilet) automaadist.',
        'Rong saabub [jaama|jaamasse] (jaam) kell kaks.', 'Me sõidame suvel [rongiga] (rong) Pärnusse.', 'Liis ootab sõpra [jaamas] (jaam).',
        'Kui sajab [vihma] (vihm), sõidan ma bussiga.', 'Talvel ei sõida ma [jalgrattaga|rattaga] (jalgratas).',
      ]),
      B.transformation('056_p_trans', 'Ütle teisiti.', 'Kirjuta üks lause. Alusta antud sõnadega.', [
        ['Ma sõidan tööle. Ma kasutan bussi.', 'Ma sõidan …', 'Ma sõidan tööle bussiga.|Ma sõidan bussiga tööle.'],
        ['Ma lähen poodi. Ma ei kasuta autot ega bussi.', 'Ma lähen …', 'Ma lähen poodi jalgsi.|Ma lähen jalgsi poodi.|Ma lähen poodi jala.|Ma lähen jala poodi.'],
        ['Ma sõidan Tartusse ja tulen samal päeval tagasi.', 'Palun …', 'Palun edasi-tagasi pilet Tartusse.|Palun üks edasi-tagasi pilet Tartusse.'],
        ['Ma sõidan Pärnusse ja jään sinna.', 'Palun …', 'Palun üks ots Pärnusse.|Palun üks pilet Pärnusse, üks ots.'],
        ['Markus sõidab Riiga. Ta kasutab lennukit.', 'Markus lendab …', 'Markus lendab Riiga lennukiga.|Markus lendab lennukiga Riiga.'],
        ['Liis sõidab kesklinna. Ta kasutab trammi.', 'Liis sõidab …', 'Liis sõidab kesklinna trammiga.|Liis sõidab trammiga kesklinna.'], ['Kati sõidab Narva. Ta kasutab rongi.', 'Kati sõidab …', 'Kati sõidab Narva rongiga.|Kati sõidab rongiga Narva.'], ['Ma lähen kooli. Ma kasutan jalgratast.', 'Ma lähen …', 'Ma lähen kooli jalgrattaga.|Ma lähen jalgrattaga kooli.|Ma lähen kooli rattaga.']]),
      B.dialogue('056_p_dialog', 'Bussipeatuses.', 'Täida dialoog sobivate sõnadega.', 'Sofia', 'Jaan', [
        ['A', 'Vabandust, kas buss number kolm sõidab [kesklinna]?'], ['B', 'Ei, kesklinna sõidab buss number viis.'], ['A', 'Kus on viie [peatus|bussipeatus]?'],
        ['B', 'Üle tee, poe ees.'], ['A', 'Kas ma saan [pileti|piletit] osta bussis?'], ['B', 'Jah, telefoniga või kaardiga.'],
        ['A', 'Kui kaua [sõit] kesklinna kestab?'], ['B', 'Umbes kümme minutit.'], ['A', 'Aitäh [abi] eest!'], ['B', 'Pole tänu [väärt]! Head [sõitu]!']]),
      B.wordorder('056_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Ma sõidan iga päev trammiga tööle.', 'Kus on lähim bussipeatus?', 'Palun üks edasi-tagasi pilet Tartusse.', 'Rong väljub jaamast kell kaheksa.', 'Lennujaama sõidan ma taksoga.', 'Markus sõidab laupäeval rongiga Tartusse.', 'Bussipeatus on maja lähedal.', 'Ma ostan pileti piletiautomaadist.']),
      B.dictation('056_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma sõidan tööle bussiga.', 'Bussipeatus on maja lähedal.', 'Rong väljub jaamast kell kümme.', 'Palun üks pilet Tartusse.', 'Ma ostan edasi-tagasi pileti.', 'Poodi lähen ma jalgsi.', 'Lennujaama sõidan ma taksoga.', 'Kas see buss sõidab kesklinna?'], 8),
      B.speaking('056_p_route', 'Kuidas sinna saab?', 'Selgita paarilisele, kuidas sinu kodust jaama või kesklinna saab.', [
        'Kus on lähim peatus?', 'Millega sa sõidad?', 'Kas pead ümber istuma?', 'Kui kaua sõit kestab?', 'Kus saab pileti osta?',
      ], [60, 120], ['Kõigepealt lähed…', 'Siis sõidad …-ga…', 'Pileti saad osta…']),
    ],
    transfer: [
      B.text('056_t_situation', 'Uus olukord', 'Sinu sõbranna Maria tuleb esimest korda Tallinna. Ta saabub lennukiga. Sa oled tööl ja ei saa teda lennujaamas oodata. Selgita, kuidas ta sinu juurde saab.'),
      B.reading('056_t_info', 'Loe infot.', 'Loe lennujaama infot ja vasta küsimustele.', 'Lennujaamast kesklinna',
        'Tallinna lennujaamast saab kesklinna mitmel viisil. Tramm number neli väljub lennujaama eest iga kümne minuti järel. Peatus on otse terminali ees. Tramm sõidab kella kuuest hommikul kaheteistkümneni öösel. Trammis on ruumi ka suurele kohvrile. Sõit kesklinna kestab umbes kakskümmend minutit. Ka bussid number kaks ja kuus sõidavad kesklinna. Piletit saab osta telefoniga või piletiautomaadist peatuses. Üks sõit maksab kaks eurot. Lastel on sõit tasuta. Kui sul on suur kohver, võid sõita taksoga. Taksod ootavad lennujaama ukse ees. Sõit kesklinna maksab umbes viisteist eurot. Öösel trammid ei sõida. Siis saab sõita taksoga või öise bussiga.',
        [['Millega saab lennujaamast kesklinna?', 'trammi, bussi või taksoga|trammiga, bussiga või taksoga|trammiga|bussiga|taksoga'], ['Kui tihti tramm väljub?', 'iga kümne minuti järel|iga 10 minuti järel|iga kümne minuti tagant'], ['Kust saab trammipileti?', 'telefoniga või automaadist|piletiautomaadist|automaadist|telefoniga'], ['Kui palju on takso kallim kui tramm?', 'kolmteist eurot|13 eurot|13'], ['Millega saab öösel kesklinna?', 'taksoga või öise bussiga|taksoga|öise bussiga'], ['Kui kaua kestab trammisõit kesklinna?', 'umbes kakskümmend minutit|20 minutit|kakskümmend minutit'], ['Kas trammis on ruumi kohvrile?', 'jah|on|jah, suurele kohvrile'], ['Kui palju maksab üks sõit?', 'kaks eurot|2 eurot']]),
      B.listening('056_t_listen', 'Kuula teadet lennujaamas.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Head reisijad! Tere tulemast Tallinna lennujaama.', 'Tramm number neli väljub lennujaama eest iga kümne minuti järel.',
        'Täna sõidab tramm ainult kesklinnani, sest Kadriorus on teetööd.', 'Kadriorgu saab kesklinnast bussiga number viis.',
        'Pileti saab osta telefoniga või automaadist peatuses.', 'Üks sõit maksab kaks eurot. Lastele on sõit tasuta.',
        'Taksod ootavad välisukse juures paremal pool.', 'Viimane tramm väljub täna kell kaksteist öösel. Head reisi!',
      ], ['Tramm väljub iga [kümne|10] minuti järel.', 'Täna sõidab tramm ainult [kesklinnani|kesklinna].', 'Kadriorus on [teetööd|remont].', 'Kadriorgu saab bussiga number [viis|5].', 'Lastele on sõit [tasuta].', 'Viimane tramm väljub kell [kaksteist|12|24].', 'Tramm number [neli|4] väljub lennujaama eest.', 'Taksod ootavad välisukse juures [paremal].']),
      B.choice('056_t_choose', 'Mis on Mariale parim?', 'Loe olukorda. Vali sobiv vastus.', [
        ['Marial on väike kott ja ta tahab raha säästa.', 'Ta sõidab trammiga.', 'Ta sõidab taksoga.', 'Ta lendab lennukiga.'],
        ['Lennuk saabub kell kaks öösel.', 'Ta sõidab taksoga.', 'Ta sõidab trammiga.', 'Ta läheb jalgsi.'],
        ['Maria sõidab Tartusse ja tuleb pühapäeval tagasi.', 'edasi-tagasi pilet', 'üks ots', 'trammipilet'],
        ['Maria ei tea, kus on peatus.', 'Vabandust, kus on trammipeatus?', 'Vabandust, kus on lennuk?', 'Vabandust, mis pilet see on?'],
        ['Maria tahab teada hinda.', 'Kui palju üks sõit maksab?', 'Kui kaua sõit kestab?', 'Kus sõit maksab?'], ['Maria tahab minna Kadriorgu.', 'Ta sõidab trammiga kesklinna ja sealt bussiga number viis.', 'Ta sõidab trammiga otse Kadriorgu.', 'Ta lendab lennukiga.'], ['Mariaga sõidab tema kuueaastane poeg.', 'Poeg sõidab tasuta.', 'Poeg maksab kaks eurot.', 'Poeg peab jalgsi minema.'], ['Maria jõuab lennujaama kell üksteist õhtul.', 'Ta jõuab veel viimasele trammile.', 'Tramme enam ei ole.', 'Ta peab hommikuni ootama.']], 'full', 'g_use'),
      B.rolecards('056_t_roles', 'Telefonikõne.', 'Üks on Maria, teine tema sõber. Rääkige 2 minutit.',
        'Oled Maria. Oled lennujaamas. Küsi, millega sõita, kus osta pilet ja kus maha tulla.', 'Oled Maria sõber. Selgita teed: transport, pilet, peatus. Ütle, kus sa ootad.',
        ['Millega ma sõidan?', 'Kus ma pileti ostan?', 'Kus ma maha tulen?'], ['Sõida trammiga number neli.', 'Pileti saad osta…', 'Ma ootan sind peatuses.']),
      B.speaking('056_t_pic', 'Kirjelda pilti.', 'Õpetaja näitab pilti bussipeatusest. Kirjelda pilti 1 minut.', [
        'Kes on pildil?', 'Mida inimesed teevad?', 'Millist transporti sa näed?', 'Mis aastaaeg on ja milline on ilm?', 'Kuidas sina tavaliselt sõidad?',
      ], [60, 120], ['Pildil on…', 'Vasakul / paremal on…', 'Inimesed ootavad…']),
      B.letter('056_t_msg', 'Sõnum Mariale.', 'Kirjuta Mariale, kuidas ta lennujaamast sinu juurde saab.', 'Tere, Maria!', 'Kohtumiseni!', [40, 60]),
      B.rubric('056_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Sõnumis on transport, pilet, peatus ja kohtumise koht (40–60 sõna).', 'Millega? (-ga) ning kuhu?, kus?, kust? vormid on õiged.', 'Telefonikõnes küsib Maria ja sõber selgitab teed arusaadavalt.', 'Pildi kirjeldus kestab umbes minuti.']),
      B.selfcheck('056_t_self', ['Ma oskan nimetada transporti ja öelda, millega sõidan.', 'Ma oskan leida infotekstist transpordi, aja ja hinna.', 'Ma oskan valida pileti: üks ots või edasi-tagasi.', 'Ma oskan selgitada sõbrale teekonda suuliselt ja kirjalikult.'], 'Oskan teed selgitada'),
    ],
  },

  'a2-057': {
    title: 'Sõiduplaan ja väljumine',
    canDo: 'Ma leian sõiduplaanist ja tablolt väljumise aja, platvormi ja ümberistumise vähemalt neljas ülesandes viiest.',
    template: 'v3',
    discover: [
      B.text('057_d_situation', 'Jaamas', 'Liis on Balti jaamas. Ta sõidab ema juurde Valka. Rong Tartusse väljub kell 9.15 teiselt platvormilt. Täna hilineb rong kümme minutit. Tartus peab Liis bussile ümber istuma.'),
      B.choice('057_d_board', 'Loe tablood.', 'Mida tabloo ütleb? Vali õige vastus.', [
        ['Tablool: „Tartu 10.05, hilineb 15 min”. Mis kell rong väljub?', '10.20', '10.05', '9.50'],
        ['Tablool: „Pärnu 12.30, tühistatud”. Mis see tähendab?', 'Rong ei sõida.', 'Rong hilineb.', 'Rong väljub varem.'],
        ['Tablool: „Narva 14.10, platvorm 3”. Kust rong väljub?', 'kolmandalt platvormilt', 'kolmandal platvormil', 'kolmandale platvormile'],
        ['Tablool: „Viljandi 16.40, saabub”. Mis see tähendab?', 'Rong tuleb Viljandist siia.', 'Rong läheb Viljandisse.', 'Rong ei tule täna.'],
        ['Tablool: „Haapsalu 8.00, väljunud”. Mis see tähendab?', 'Rong on juba läinud.', 'Rong tuleb kohe.', 'Rong hilineb.'], ['Tablool: „Rakvere 9.40, platvorm 1”. Kust rong väljub?', 'esimeselt platvormilt', 'esimesel platvormil', 'esimesele platvormile'], ['Tablool: „Valga 15.20, hilineb 5 min”. Mis kell rong väljub?', '15.25', '15.20', '15.15'], ['Tablool: „Narva, ümberistumine Tapal”. Mis see tähendab?', 'Tapal pead minema teise rongi.', 'Rong ei sõida.', 'Rong on täis.']]),
      B.reading('057_d_read', 'Loe: Liisi reis.', 'Loe sõiduplaani ja Liisi kirja. Vasta küsimustele.', 'Liisi reis ema juurde',
        'Rong Tallinn – Tartu: väljub 9.15, platvorm 2. Saabub Tartusse 11.20.\nBuss Tartu – Valga: väljub Tartu bussijaamast 11.50. Saabub Valka 13.15.\n\nKallis ema! Ma tulen laupäeval sinu juurde. Rong väljub Tallinnast veerand kümme. Tartusse jõuan kakskümmend minutit üle üheteistkümne. Tartus pean ma ümber istuma. Rongijaamast lähen bussijaama jalgsi. See võtab umbes viisteist minutit. Buss Valka väljub kümme minutit enne kaheteistkümmet. Valka saabub buss veerand kaks. Palun ära tule bussijaama liiga vara! Kui rong hilineb, kirjutan sulle kohe. Siis sõidan järgmise bussiga. Järgmine buss väljub Tartust kell kaks. Kallistan! Liis',
        [['Mis kell väljub rong Tallinnast?', '9.15|veerand kümme|kell 9.15'], ['Kus peab Liis ümber istuma?', 'Tartus'], ['Kui palju aega on Liisil Tartus rongi ja bussi vahel?', 'pool tundi|30 minutit|kolmkümmend minutit'], ['Kuidas läheb Liis rongijaamast bussijaama?', 'jalgsi|jala'], ['Mis kell peab ema Valga bussijaamas olema?', 'veerand kaks|13.15|kell 13.15'], ['Mida teeb Liis, kui rong hilineb?', 'kirjutab emale|ta kirjutab emale|sõidab järgmise bussiga'], ['Kui kaua läheb Liis jalgsi rongijaamast bussijaama?', 'umbes viisteist minutit|15 minutit|viisteist minutit'], ['Mis kell saabub rong Tartusse?', '11.20|kakskümmend minutit üle üheteistkümne']]),
      B.notice('057_d_notice', 'Märka: väljub, saabub, hilineb', ['Rong **väljub** Tallinna**st** kell 9.15.', 'Rong **saabub** Tartu**sse** kell 11.20.', 'Rong **hilineb** kümme minuti**t**.', 'Rong väljub **teiselt** platvormilt. (mis platvormilt?)', 'Tartus pean ma **ümber istuma**.', 'Buss väljub **kümme minutit enne** kaheteistkümmet.'], 'full'),
      B.transformation('057_d_trans', 'Ütle teisiti.', 'Kirjuta lause uue sõnaga.', [
        ['Rong läheb Tallinnast ära kell 9.15.', 'Rong väljub …', 'Rong väljub Tallinnast kell 9.15.'], ['Rong jõuab Tartusse kell 11.20.', 'Rong saabub …', 'Rong saabub Tartusse kell 11.20.'],
        ['Rong pidi tulema kell 10, aga tuleb kell 10.15.', 'Rong hilineb …', 'Rong hilineb viisteist minutit.|Rong hilineb 15 minutit.'],
        ['Tartus lähen ma rongist bussi.', 'Tartus pean …', 'Tartus pean ma ümber istuma.|Tartus pean ma bussile ümber istuma.|Tartus pean ümber istuma.'],
        ['Täna buss ei sõida.', 'Buss on …', 'Buss on tühistatud.|Buss on täna tühistatud.'], ['Platvorm number kolm.', 'Rong väljub …', 'Rong väljub kolmandalt platvormilt.'], ['Rong tuleb Tartust siia kell 12.', 'Rong saabub …', 'Rong saabub Tartust kell 12.|Rong saabub Tartust kell kaksteist.'], ['Buss läheb ära esimeselt platvormilt.', 'Buss väljub …', 'Buss väljub esimeselt platvormilt.']]),
      B.errorfix('057_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Rong väljub kell üheksa kolmandal platvormilt.', 'Rong väljub kell üheksa kolmandalt platvormilt.'], ['Buss saabub Tartus kell üks.', 'Buss saabub Tartusse kell üks.'], ['Rong hilineb kümme minutid.', 'Rong hilineb kümme minutit.'], ['Tartus ma pean ümber istuda.', 'Tartus pean ma ümber istuma.|Tartus ma pean ümber istuma.'], ['Buss väljub Tallinna kell kaks.', 'Buss väljub Tallinnast kell kaks.'], ['Rong saabub kell kümme Tartus.', 'Rong saabub kell kümme Tartusse.'], ['Mis kella rong väljub?', 'Mis kell rong väljub?'], ['Rong väljub kolmas platvormilt.', 'Rong väljub kolmandalt platvormilt.']]),
      B.translation('057_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Поезд отправляется со второй платформы.', 'Автобус прибывает в Валгу в четверть второго.', 'Сегодня поезд опаздывает на десять минут.', 'В Тарту я пересаживаюсь на автобус.', 'Следующий автобус отправляется в два часа.', 'Во сколько поезд прибывает в Тарту?', 'Поезд отправляется в 9.15.', 'Автобус прибывает в Пярну в 12.40.']),
      B.speaking('057_d_say', 'Kas sa oled hiljaks jäänud?', 'Räägi ühest reisist, kus midagi muutus.', [
        'Kuhu sa sõitsid?', 'Millega sa sõitsid?', 'Mis juhtus? Kas buss või rong hilines?', 'Mida sa siis tegid?',
      ], [60, 120], ['Rong hilines…', 'Ma pidin ümber istuma…', 'Siis ma…']),
      B.writing('057_d_write', 'Minu reis.', 'Kirjuta 5–7 lauset: kuhu, millega, mis kell väljub ja saabub.', [5, 7], ['väljub', 'saabub', 'kell'], 2),
    ],
    practice: [
      B.formtext('057_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Viktori reis', [
        'Viktor sõidab laupäeval [Rakverre] (Rakvere). Rong [väljub] (väljuma) [Tallinnast] (Tallinn) kell seitse.',
        '',
        'Täna hilineb rong kümme [minutit] (minut). [Rakveres] (Rakvere) [istub] (istuma) Viktor bussile ümber.',
        '',
        'Buss [saabub] (saabuma) Haljalasse kell üksteist. [Bussijaamast] (bussijaam) läheb Viktor venna juurde.',
      ], 'g_notice'),
      B.listening('057_p_listen', 'Kuula teadet bussijaamas.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tähelepanu, Tartu bussijaam!', 'Buss Tartu – Võru hilineb täna pool tundi.', 'Buss väljub kell kaksteist kolmkümmend, mitte kell kaksteist.',
        'Buss Tartu – Viljandi väljub täna seitsmendalt platvormilt.', 'Buss Tartu – Pärnu kell neliteist on tühistatud.',
        'Pärnu sõitjad saavad sõita bussiga kell viisteist.', 'Vanad piletid kehtivad ka selles bussis.', 'Infot saate kassast. Kassa on avatud kella kaheksani.',
      ], ['Võru buss väljub kell [12.30|kaksteist kolmkümmend|pool üks].', 'Viljandi buss väljub [seitsmendalt] platvormilt.', 'Pärnu buss kell 14 on [tühistatud].', 'Pärnu sõitjad sõidavad kell [15|viisteist|kolm].', 'Vana pilet [kehtib] ka hilisemas bussis.', 'Kassa on avatud kella [kaheksani|8ni|20ni].', 'Teadaanne on [Tartu] bussijaamas.', 'Võru buss hilineb [pool tundi].']),
      B.cloze('057_p_cloze', 'Sõnum sõbrale.', 'Vali igasse lünka sobiv sõna.', 'Tere, Kati!', [
        'Ma tulen homme {*rongiga|rongi|rongis}. Rong väljub Tallinnast kell kaheksa.',
        '',
        'Tartusse {*saabub|saabuma|saabus} see kell kümme. Palun oota mind {*jaamas|jaama|jaamast}.',
        '',
        'Kui rong {*hilineb|hilinema|hilineda}, saadan sulle sõnumi. Pärast lõunat pean ma bussile {*ümber istuma|ümber istuda|ümber istun}, sest sõidan edasi Valka.',
        '',
        'Buss väljub {*kolmandalt|kolmandale|kolmandal} platvormilt. Bussipileti {*ostsin|ostis|ostma} juba internetist. Kas sa tuled mind bussi juurde {*saatma|saata|saadad}? Liis',
      ], 'g_vocab'),
      B.choice('057_p_forms', 'Vali õige vorm.', 'Vali lünka õige vorm.', [
        ['Rong väljub ___ platvormilt.', 'teiselt', 'teisele', 'teisel'], ['Buss saabub ___ kell 13.15.', 'Valka', 'Valgas', 'Valgast'],
        ['Rong ___ täna kümme minutit.', 'hilineb', 'hilinema', 'hilineda'], ['Tartus pean ma ___.', 'ümber istuma', 'ümber istuda', 'ümber istun'],
        ['Vabandust, mis ___ rong väljub?', 'kell', 'kella', 'kellal'], ['Buss hilineb kümme ___.', 'minutit', 'minut', 'minutid'],
        ['Rong saabub ___ platvormile.', 'esimesele', 'esimeselt', 'esimesel'], ['Mis kell buss ___ väljub?', 'Pärnust', 'Pärnusse', 'Pärnus']], 'full', 'g_notice'),
      B.wordforms('057_p_towns', 'Kuhu? Kus? Kust?', 'Kirjuta linna nimi küsimuse järgi.', [
        ['Tartu', 'kuhu?', 'Tartusse'], ['Pärnu', 'kust?', 'Pärnust'], ['Narva', 'kus?', 'Narvas'], ['Valga', 'kuhu?', 'Valka, Valgasse'],
        ['Viljandi', 'kust?', 'Viljandist'], ['Rakvere', 'kus?', 'Rakveres'], ['jaam', 'kuhu?', 'jaama, jaamasse'], ['Tallinn', 'kust?', 'Tallinnast']]),
      B.transformation('057_p_trans', 'Kirjuta täislausega.', 'Kirjuta tabloo info täislausena.', [
        ['Tartu 10.05 · platvorm 2', 'Rong Tartusse väljub …', 'Rong Tartusse väljub kell 10.05 teiselt platvormilt.|Rong Tartusse väljub teiselt platvormilt kell 10.05.'],
        ['Pärnu 12.30 · hilineb 10 min', 'Rong Pärnusse …', 'Rong Pärnusse hilineb kümme minutit.|Rong Pärnusse hilineb 10 minutit.'],
        ['Narva 14.10 · tühistatud', 'Rong Narva …', 'Rong Narva on tühistatud.'],
        ['Viljandi · saabub 16.40', 'Rong Viljandist …', 'Rong Viljandist saabub kell 16.40.'],
        ['Valga · ümberistumine Tartus', 'Valka sõitjad …', 'Valka sõitjad peavad Tartus ümber istuma.|Valka sõitjad istuvad Tartus ümber.'], ['Tapa · ümberistumine', 'Tapal pead …', 'Tapal pead ümber istuma.'], ['Rakvere 9.40 · platvorm 1', 'Rong Rakverre väljub …', 'Rong Rakverre väljub kell 9.40 esimeselt platvormilt.|Rong Rakverre väljub esimeselt platvormilt kell 9.40.'], ['Võru · hilineb 30 min', 'Buss Võrru …', 'Buss Võrru hilineb pool tundi.|Buss Võrru hilineb kolmkümmend minutit.']]),
      B.wordorder('057_p_order', 'Pane küsimus kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Mis kell buss Pärnusse väljub?', 'Kust rong Tartusse väljub?', 'Kas ma pean Tartus ümber istuma?', 'Mitu minutit rong hilineb?', 'Mis kell buss Valka saabub?', 'Rong Tartusse väljub teiselt platvormilt.', 'Buss hilineb täna kakskümmend minutit.', 'Tartus pean ma bussile ümber istuma.']),
      B.dictation('057_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Rong väljub täna teiselt platvormilt.', 'Buss saabub Pärnusse kell kaks.', 'Täna hilineb rong pool tundi.', 'Tartus pean ma bussile ümber istuma.', 'Buss kell neli on tühistatud.', 'Mis kell järgmine rong Tartusse väljub?', 'Vana pilet kehtib ka selles bussis.', 'Palun oota mind jaamas!'], 8),
      B.speaking('057_p_ask', 'Küsi ja vasta.', 'Vaata sõiduplaani. Küsi paariliselt aega ja ümberistumist.', [
        'Mis kell buss Pärnusse väljub?', 'Mis kell see saabub?', 'Kas pean ümber istuma?', 'Kas buss sõidab ka laupäeval?',
      ], [60, 120], ['Buss väljub kell…', 'See saabub kell…', 'Jah, Märjamaal.']),
    ],
    transfer: [
      B.text('057_t_situation', 'Uus olukord', 'Markus tahab täna sõita Pärnusse festivalile. Festival algab kell 19. Tema rong on tühistatud. Ta peab leidma uue võimaluse.'),
      B.dialogue('057_t_dialog', 'Infolauas.', 'Täida dialoog. Kasuta teksti infot.', 'Markus', 'Infotöötaja', [
        ['A', 'Tere! Minu rong Pärnusse on [tühistatud]. Mida ma saan teha?'], ['B', 'Täna läheb Pärnusse veel buss. See [väljub] kell 16.30.'],
        ['A', 'Mis kell buss Pärnusse [saabub]?'], ['B', 'Kell 18.40. Pileti saate osta bussijaamast.'], ['A', 'Aga kui buss [hilineb]?'], ['B', 'Siis kirjutage festivalile. Head [reisi]!'], ['A', 'Aitäh! Kas bussis on veel [vabu] kohti?'], ['B', 'Jah, pileteid on veel [kümme].']]),
      B.reading('057_t_options', 'Loe kolme võimalust.', 'Loe kolme varianti ja vasta küsimustele.', 'Kuidas Pärnusse saada?',
        'A. Buss Tallinn – Pärnu väljub bussijaamast kell 16.30. See saabub Pärnusse kell 18.40. Pilet maksab kaksteist eurot. Buss sõidab otse ja peatub ainult Märjamaal. Pileteid on veel kümme.\nB. Rong Tallinn – Pärnu väljub homme hommikul kell 8.05. See saabub Pärnusse kell 10.20. Pilet maksab üheksa eurot. Rongis saab süüa osta. Täna õhtul rongi enam ei ole.\nC. Liis sõidab täna autoga Pärnusse. Ta väljub Mustamäelt kell 17.00. Sõit kestab umbes kaks tundi. Bensiini eest tuleb maksta kuus eurot. Autos on veel üks vaba koht. Liis tahab sõita koos kellegagi, sest üksi on igav.',
        [['Milline variant on kõige odavam?', 'C|Liisi auto|autoga Liisiga'], ['Mis kell jõuab buss Pärnusse?', '18.40|kakskümmend minutit enne seitset|kell 18.40'], ['Miks ei sobi Markusele variant B?', 'rong sõidab alles homme|rong väljub homme|festival on täna'], ['Kui palju on bussipilet kallim kui sõit Liisiga?', 'kuus eurot|6 eurot|6'], ['Mis kell jõuab Liis umbes Pärnusse?', 'kell seitse|19|19.00|umbes kell seitse'], ['Mis kell väljub rong homme?', '8.05|kell 8.05'], ['Kus buss peatub?', 'Märjamaal|ainult Märjamaal'], ['Mitu vaba kohta on Liisi autos?', 'üks|1|üks koht']]),
      B.choice('057_t_react', 'Mida sa ütled?', 'Loe olukorda. Vali sobiv lause.', [
        ['Tablool on: „hilineb 30 min”. Sa kirjutad sõbrale:', 'Mu rong hilineb pool tundi.', 'Mu rong on tühistatud.', 'Mu rong väljub varem.'],
        ['Sa ei leia platvormi. Sa küsid:', 'Vabandust, kust rong Tartusse väljub?', 'Vabandust, mis kell praegu on?', 'Vabandust, kas see on minu pilet?'],
        ['Rong läks just ära. Sa küsid:', 'Millal väljub järgmine rong?', 'Millal see rong saabus?', 'Kas see rong hilineb?'],
        ['Sõber küsib: „Kas sa pead ümber istuma?”', 'Jah, Tartus lähen bussile.', 'Jah, ma istun akna all.', 'Ei, ma seisan platvormil.'],
        ['Kassas küsitakse: „Üks ots või edasi-tagasi?” Sa tuled homme tagasi.', 'Edasi-tagasi, palun.', 'Üks ots, palun.', 'Platvorm kaks, palun.'], ['Buss on täis. Sa küsid:', 'Millal väljub järgmine buss?', 'Kas see buss on tühi?', 'Kus on platvorm?'], ['Sa jääd hiljaks. Sa kirjutad sõbrale:', 'Vabandust, ma jõuan pool tundi hiljem.', 'Vabandust, ma olen varem.', 'Vabandust, rong on täis.'], ['Sa tahad teada, kas pilet kehtib.', 'Kas see pilet kehtib ka bussis?', 'Kas see pilet on ilus?', 'Kas see pilet on tühistatud?']], 'full', 'g_use'),
      B.rolecards('057_t_roles', 'Infolauas.', 'Üks on reisija, teine infolaua töötaja. Rääkige 2–3 minutit.',
        'Sinu rong on tühistatud. Küsi uut aega, platvormi ja ümberistumist.', 'Oled infolaua töötaja. Vaata sõiduplaani ja vasta. Paku kaks varianti.',
        ['Minu rong on tühistatud.', 'Mis kell järgmine rong väljub?', 'Kas pean ümber istuma?'], ['Järgmine rong väljub kell…', 'See väljub … platvormilt.', 'Te peate … ümber istuma.']),
      B.speaking('057_t_compare', 'Buss või rong?', 'Võrdle bussi ja rongi. Räägi 1 minut.', [
        'Kas sa sõidad pigem bussi või rongiga?', 'Mis on kiirem?', 'Mis on odavam?', 'Mida sa teed, kui buss hilineb?',
      ], [45, 90], ['Ma sõidan pigem…, sest…', 'Rong on kiirem kui…', 'Kui buss hilineb, ma…']),
      B.letter('057_t_letter', 'Kiri hotellile.', 'Sa jõuad Pärnusse hiljem. Kirjuta hotellile 50–70 sõna.', 'Tere!', 'Lugupidamisega', [50, 70]),
      B.rubric('057_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kirjas on, mis muutus, uus aeg ja palve (50–70 sõna).', 'väljub, saabub, hilineb ja tühistatud on õigesti kasutatud.', 'Infolauas leitakse uus aeg ja vajadusel ümberistumine.', 'Kohanimed on õiges vormis: kuhu, kus, kust.']),
      B.selfcheck('057_t_self', ['Ma oskan lugeda tablood ja sõiduplaani.', 'Ma oskan öelda: väljub, saabub, hilineb, on tühistatud.', 'Ma oskan leida aja, platvormi ja ümberistumise.', 'Ma oskan kirjutada sõnumi, kui reis muutub.'], 'Leian alati uue tee'),
    ],
  },

  'a2-058': {
    title: 'Pileti ostmine ja küsimused',
    canDo: 'Ma ostan kassas või automaadist pileti ja küsin ilma abita aega, platvormi, hinda ja ümberistumist.',
    template: 'v3',
    discover: [
      B.text('058_d_situation', 'Kassas', 'Sofia on Tartu bussijaamas. Ta tahab sõita Pärnusse. Piletiautomaat ei tööta. Sofia läheb kassasse ja ostab pileti kassapidajalt.'),
      B.truefalse('058_d_tf', 'Mis toimub?', 'Loe olukorda. Kas lause on õige või vale?', [
        ['Sofia on raudteejaamas.', false], ['Sofia sõidab Pärnusse.', true], ['Piletiautomaat ei tööta.', true], ['Sofia ostab pileti internetist.', false], ['Sofia räägib kassapidajaga.', true], ['Sofia tahab sõita Tartusse.', false], ['Sofia ostab pileti kassapidajalt.', true], ['Piletiautomaat töötab hästi.', false]]),
      B.reading('058_d_read', 'Loe vestlust kassas.', 'Loe vestlus ja vasta küsimustele.', 'Pilet Pärnusse',
        'Sofia: Tere! Palun üks pilet Pärnusse.\nKassapidaja: Tere! Mis kellaks?\nSofia: Mis kell järgmine buss väljub?\nKassapidaja: Järgmine otsebuss väljub kell 14.20. Kell 13.00 on ka buss, aga siis peate Viljandis ümber istuma.\nSofia: Ma tahan sõita otse. Kas kella 14.20 bussis on veel kohti?\nKassapidaja: Jah, on küll. Kas soovite täispiletit või sooduspiletit?\nSofia: Ma olen üliõpilane. Siin on minu üliõpilaskaart.\nKassapidaja: Hästi. Sooduspilet maksab kaheksa eurot. Üks ots või edasi-tagasi?\nSofia: Üks ots, palun. Tagasi tulen rongiga. Kas ma saan istuda akna all?\nKassapidaja: Jah, teie koht on number kaksteist, akna all.\nSofia: Aitäh! Kust buss läheb?\nKassapidaja: Viiendalt platvormilt. Head reisi!',
        [['Mis kell väljub otsebuss Pärnusse?', '14.20|kell 14.20|kakskümmend minutit üle kahe'], ['Miks ei sõida Sofia kella ühese bussiga?', 'siis peab ta ümber istuma|ta peab Viljandis ümber istuma|ta tahab sõita otse'], ['Miks saab Sofia sooduspileti?', 'ta on üliõpilane|sest ta on üliõpilane'], ['Miks ostab Sofia ühe otsa pileti?', 'ta tuleb tagasi rongiga|tagasi tuleb ta rongiga'], ['Kus on Sofia koht bussis?', 'akna all|number kaksteist akna all|koht 12'], ['Kust buss väljub?', 'viiendalt platvormilt|platvormilt 5'], ['Kui palju maksab sooduspilet?', 'kaheksa eurot|8 eurot'], ['Mis kell väljub buss, kus peab ümber istuma?', 'kell 13.00|kell üks|13.00']]),
      B.notice('058_d_notice', 'Märka viisakaid küsimusi.', ['**Palun** üks pilet Pärnusse.', '**Mis kell** järgmine buss väljub?', '**Kas** bussis on veel kohti?', '**Kas ma saan** istuda akna all?', '**Kust** buss läheb? — Viiendalt platvormilt.', '**Üks ots või edasi-tagasi?** — Üks ots, palun.'], 'full'),
      B.dialogue('058_d_dialog', 'Piletiautomaadi juures.', 'Täida dialoog sobivate sõnadega.', 'Jaan', 'Viktor', [
        ['A', 'Vabandust, kas te oskate seda [automaati] kasutada?'], ['B', 'Jah. Kõigepealt vali, [kuhu] sa sõidad.'], ['A', 'Tartusse. Ja siis?'],
        ['B', 'Siis vali: üks ots või [edasi-tagasi].'], ['A', 'Üks ots. Kas ma saan sularahas [maksta]?'], ['B', 'Ei, siin saab maksta ainult [kaardiga].'], ['A', 'Aitäh! Kust ma [pileti] saan?'], ['B', 'Pilet tuleb automaadist [välja]. Head reisi!']]),
      B.dictation('058_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Palun üks pilet Pärnusse.', 'Mis kell järgmine buss väljub?', 'Kas bussis on veel kohti?', 'Ma olen üliõpilane.', 'Üks ots, palun.', 'Kust buss läheb?', 'Kas buss sõidab otse Pärnusse?', 'Palun koht akna all.'], 8),
      B.translation('058_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Один билет до Пярну, пожалуйста.', 'Во сколько отправляется следующий автобус?', 'Есть ли ещё места?', 'Я студент.', 'Можно сесть у окна?', 'Откуда отходит автобус?', 'Сколько стоит льготный билет?', 'Автобус едет прямо?']),
      B.speaking('058_d_say', 'Sinu viimane reis.', 'Küsi paariliselt tema viimase reisi kohta.', [
        'Kuhu sa viimati sõitsid?', 'Kus sa pileti ostsid?', 'Kui palju pilet maksis?', 'Mis kell buss või rong väljus?',
      ], [45, 90], ['Ma sõitsin…', 'Pileti ostsin…', 'Pilet maksis…']),
      B.writing('058_d_write', 'Kirjuta dialoog.', 'Kirjuta kassas lühike dialoog: 6–8 repliiki.', [6, 8], ['palun', 'mis kell', 'kust', 'pilet'], 2),
    ],
    practice: [
      B.listening('058_p_listen', 'Kuula vestlust kassas.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere! Palun kaks piletit Narva.', '— Tere! Kas täispiletid?', '— Üks täispilet ja üks sooduspilet. Minu poeg on kümneaastane.', '— Selge. Mis kellaks?',
        '— Mis kell järgmine buss väljub?', '— Kell 15.30. See buss sõidab otse.', '— Väga hea. Kui palju piletid maksavad?', '— Kokku kakskümmend kaks eurot.',
        '— Kas ma saan sularahas maksta?', '— Jah, muidugi. Buss väljub kolmandalt platvormilt. Head reisi!',
      ], ['Klient ostab [kaks|2] piletit.', 'Poeg on [kümme|10] aastat vana.', 'Buss väljub kell [15.30|pool neli].', 'Buss sõidab [otse].', 'Piletid maksavad kokku [kakskümmend kaks|22] eurot.', 'Klient maksab [sularahas|sularahaga].', 'Buss väljub [kolmandalt] platvormilt.', 'Klient ostab ka ühe [sooduspileti].']),
      B.cloze('058_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Viktor ostab pileti', [
        'Viktor sõidab Narva oma õe juurde. Ta läheb bussijaama {*kassasse|kassas|kassast}.',
        '',
        '„Tere! Palun üks pilet {*Narva|Narvas|Narvast},” ütleb Viktor. „Ma olen pensionär. Kas pensionärile on {*sooduspilet|sooduspiletit|soodus}?”',
        '',
        'Kassapidaja vastab: „Jah. Sooduspilet maksab kuus {*eurot|euro|eurod}. Üks ots või {*edasi-tagasi|edasi|tagasi}?”',
        '',
        'Viktor ostab edasi-tagasi pileti ja maksab {*kaardiga|kaart|kaardil}. Buss {*väljub|väljus|väljuma} kell kümme. Viktor küsib: „{*Kust|Kus|Kuhu} buss läheb?” — „Teiselt platvormilt.”',
      ], 'g_vocab'),
      B.formtext('058_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Anna kassas', [
        'Anna ostab kaks [piletit] (pilet) [Tartusse] (Tartu).',
        '',
        'Ta küsib: „Mis kell järgmine buss [väljub] (väljuma)?” Buss läheb [neljandalt] (neljas) platvormilt.',
        '',
        'Anna maksab [kaardiga] (kaart). Buss [saabub] (saabuma) kahe [tunni] (tund) pärast. [Bussijaamas] (bussijaam) ootab teda õde.',
      ], 'g_notice'),
      B.transformation('058_p_ask', 'Tee küsimus.', 'Kirjuta küsimus, mis sobib vastusega.', [
        ['Buss väljub kell 14.20.', 'Mis kell …?', 'Mis kell buss väljub?'], ['Buss läheb viiendalt platvormilt.', 'Kust …?', 'Kust buss läheb?|Kust buss väljub?'],
        ['Pilet maksab kaheksa eurot.', 'Kui palju …?', 'Kui palju pilet maksab?'], ['Rong saabub Tartusse kell 11.20.', 'Mis kell …?', 'Mis kell rong Tartusse saabub?|Mis kell rong saabub Tartusse?'],
        ['Jah, bussis on veel kohti.', 'Kas …?', 'Kas bussis on veel kohti?|Kas bussis on kohti?|Kas bussis on vabu kohti?'], ['Ei, Viljandis on ümberistumine.', 'Kas …?', 'Kas buss sõidab otse?|Kas see buss sõidab otse?'], ['Rong väljub teiselt platvormilt.', 'Kust …?', 'Kust rong väljub?'], ['Sooduspilet maksab neli eurot.', 'Kui palju …?', 'Kui palju sooduspilet maksab?']]),
      B.choice('058_p_form', 'Vali õige vorm.', 'Vali lünka õige vorm.', [
        ['Palun üks pilet ___.', 'Tallinnasse', 'Tallinnas', 'Tallinnast'], ['Mis kell ___ järgmine buss?', 'väljub', 'väljuma', 'väljuda'],
        ['Kas ma saan ___ maksta?', 'kaardiga', 'kaart', 'kaardil'], ['Kas ma võin istuda ___ all?', 'akna', 'aken', 'aknas'],
        ['Palun kaks ___ Tartusse.', 'piletit', 'pilet', 'piletid'], ['Kas ma saan siit sooduspileti ___?', 'osta', 'ostma', 'ostan'], ['Ma olen ___, palun sooduspilet.', 'üliõpilane', 'üliõpilase', 'üliõpilast'], ['Buss läheb ___ platvormilt.', 'kolmandalt', 'kolmandale', 'kolmandal']], 'full', 'g_notice'),
      B.errorfix('058_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Palun üks pilet Pärnu.', 'Palun üks pilet Pärnusse.'], ['Kus kell buss väljub?', 'Mis kell buss väljub?'], ['Palun kaks pilet Tartusse.', 'Palun kaks piletit Tartusse.'],
        ['Kas ma saan maksma kaardiga?', 'Kas ma saan kaardiga maksta?|Kas ma saan maksta kaardiga?'], ['Kus buss Narva läheb? — Kolmandalt platvormilt.', 'Kust buss Narva läheb?'],
        ['Ma olen pensionär, palun soodus pilet.', 'Ma olen pensionär, palun sooduspilet.'], ['Mis kella rong Tartusse väljub?', 'Mis kell rong Tartusse väljub?'], ['Kas bussis on veel vaba kohad?', 'Kas bussis on veel vabu kohti?']]),
      B.dialogue('058_p_dialog', 'Rong on tühistatud.', 'Täida dialoog sobivate sõnadega.', 'Anna', 'Kassapidaja', [
        ['A', 'Tere! Minu rong Tartusse kell kümme on [tühistatud]. Mida teha?'], ['B', 'Vabandust! Järgmine rong [väljub] kell kaksteist.'],
        ['A', 'Kas see rong sõidab [otse]?'], ['B', 'Jah. Te ei pea uut [piletit] ostma.'], ['A', 'Väga hea. Kust see rong [läheb|väljub]?'], ['B', 'Teiselt [platvormilt]. Head reisi!'], ['A', 'Aitäh! Kas ma saan jaamas kohvi [osta]?'], ['B', 'Jah, kohvik on [esimesel] korrusel.']]),
      B.wordorder('058_p_order', 'Pane küsimus kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Palun üks pilet Pärnusse.', 'Mis kell järgmine buss Tartusse väljub?', 'Kust buss Narva läheb?', 'Kas see rong sõidab otse Valka?', 'Kas bussis on veel vabu kohti?', 'Üks täispilet ja üks sooduspilet, palun.', 'Kas ma saan sularahas maksta?', 'Buss väljub kolmandalt platvormilt.']),
      B.speaking('058_p_say', 'Kassas.', 'Osta paariliselt pilet. Paariline on kassapidaja.', [
        'Kuhu sa sõidad?', 'Mis kell?', 'Üks ots või edasi-tagasi?', 'Täispilet või sooduspilet?', 'Kuidas sa maksad?',
      ], [60, 120], ['Palun üks pilet…', 'Mis kell … väljub?', 'Kas ma saan kaardiga maksta?']),
    ],
    transfer: [
      B.text('058_t_situation', 'Uus olukord', 'Sa sõidad homme vanaemaga Tallinnast Narva. Vanaema on pensionär. Bussijaamas on järjekord ja automaat ei tööta. Selgub, et buss kell 10 on täis.'),
      B.reading('058_t_info', 'Loe piletireegleid.', 'Loe bussifirma infot ja vasta küsimustele.', 'Kuidas osta piletit?',
        'Pileteid saab osta internetist, bussijaama kassast ja bussijuhilt. Internetis on pilet kõige odavam. Bussijuhilt saab osta ainult siis, kui bussis on vabu kohti. Sooduspileti saavad lapsed, õpilased ja pensionärid. Pensionäril peab olema kaasas pensionitunnistus. Sooduspilet on poole odavam kui täispilet. Kui buss hilineb üle tunni, saad raha tagasi. Kui tahad piletit teisele ajale vahetada, tee seda vähemalt tund enne väljumist. Pileti vahetamine maksab üks euro. Suure koti eest ei pea maksma. Kassa on avatud iga päev kella seitsmest kümneni õhtul. Alla seitsmeaastased lapsed sõidavad tasuta.',
        [['Kus on pilet kõige odavam?', 'internetis'], ['Kes saavad sooduspileti?', 'lapsed, õpilased ja pensionärid|lapsed, õpilased, pensionärid|pensionärid'], ['Mida peab pensionär kaasa võtma?', 'pensionitunnistuse|pensionitunnistus'], ['Täispilet maksab 14 eurot. Kui palju maksab sooduspilet?', 'seitse eurot|7 eurot|7'], ['Millal saab raha tagasi?', 'kui buss hilineb üle tunni|kui buss hilineb rohkem kui tund'], ['Kui palju maksab pileti vahetamine?', 'üks euro|1 euro|ühe euro'], ['Millal saab bussijuhilt piletit osta?', 'kui bussis on vabu kohti'], ['Kas suure koti eest tuleb maksta?', 'ei|ei pea']]),
      B.listening('058_t_listen', 'Kuula sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin on bussifirma Teekaaslane klienditeenindus.', 'Teie buss Tallinnast Narva kell kümme on tühistatud.', 'Bussil on tehniline probleem.',
        'Te saate sõita bussiga kell kaksteist. Teie piletid kehtivad selles bussis.', 'Buss kell kaksteist väljub neljandalt platvormilt.',
        'Kui see aeg ei sobi, saate raha tagasi.', 'Palun helistage meile kella viieni. Vabandame!',
      ], ['Buss kell kümme on [tühistatud].', 'Bussil on [tehniline probleem|probleem].', 'Uus buss väljub kell [kaksteist|12].', 'Vanad piletid [kehtivad].', 'Buss väljub [neljandalt] platvormilt.', 'Helistada saab kella [viieni|5ni|17ni].', 'Bussifirma nimi on [Teekaaslane].', 'Kui aeg ei sobi, saab [raha] tagasi.']),
      B.errorfix('058_t_fix', 'Kontrolli sõnumit.', 'Paranda sõnumi vead.', [
        ['Buss väljub kell kaksteist kolmas platvormilt.', 'Buss väljub kell kaksteist kolmandalt platvormilt.'], ['Ma ostsin kaks pilet.', 'Ma ostsin kaks piletit.'],
        ['Sinu pilet on soodus pilet.', 'Sinu pilet on sooduspilet.'], ['Me kohtume bussijaamasse kell üksteist.', 'Me kohtume bussijaamas kell üksteist.'],
        ['Buss saabub Narvas kell kolm.', 'Buss saabub Narva kell kolm.|Buss saabub Narvasse kell kolm.'], ['Pilet maksab kaheksa euro.', 'Pilet maksab kaheksa eurot.'], ['Kas ma saan pilet teisele päevale vahetada?', 'Kas ma saan pileti teisele päevale vahetada?|Kas ma saan piletit teisele päevale vahetada?'], ['Buss hilines üle tund.', 'Buss hilines üle tunni.']]),
      B.rolecards('058_t_roles', 'Kassas: buss on täis.', 'Üks on reisija, teine kassapidaja. Rääkige 3 minutit.',
        'Sa tahad kaks piletit Narva kell 10: üks täispilet ja üks pensionärile. Buss on täis. Leia uus lahendus.', 'Oled kassapidaja. Buss kell 10 on täis. Paku bussi kell 12 või rongi. Küsi piletite tüüpi.',
        ['Palun kaks piletit Narva.', 'Kas … on veel kohti?', 'Mis kell järgmine buss väljub?'], ['Kahjuks on buss täis.', 'Järgmine buss väljub kell…', 'Kas soovite sooduspiletit?']),
      B.speaking('058_t_card', 'Ideekaart: reis.', 'Küsi paariliselt kaardi järgi. Siis vahetage rollid.', ['Kuhu?', 'Millega?', 'Mis kell?', 'Pileti hind?', 'Ümberistumine?'], [60, 120], ['Kuhu sa sõidad?', 'Mis kell buss väljub?', 'Kui palju pilet maksab?']),
      B.letter('058_t_letter', 'Kiri bussifirmale.', 'Buss hilines kaks tundi. Kirjuta bussifirmale ja küsi raha tagasi.', 'Tere!', 'Lugupidamisega', [40, 60]),
      B.rubric('058_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kirjas on reis, probleem ja palve (40–60 sõna).', 'Küsimused kassas on õiged: mis kell, kust, kui palju, kas.', 'Kassas leitakse lahendus, kui buss on täis.', 'Numbrid ja piletid on õiges vormis: kaks piletit, üks täispilet.']),
      B.selfcheck('058_t_self', ['Ma oskan küsida aega, platvormi, hinda ja ümberistumist.', 'Ma oskan leida tekstist piletireegleid.', 'Ma oskan öelda: palun kaks piletit Narva, kas ma saan…?', 'Ma oskan lahendada probleemi kassas, kui buss on täis.'], 'Reis on korraldatud'),
    ],
  },

  'a2-059': {
    title: 'Lihtminevik — teekond',
    canDo: 'Ma räägin 6–8 lausega lõppenud reisist: kuhu ja millega ma sõitsin, kui kaua teekond kestis, mida nägin ja millal tagasi tulin.',
    template: 'v3',
    discover: [
      B.text('059_d_situation', 'Esmaspäeva hommik', 'Esmaspäeva hommikul läheb üliõpilane Sofia enne loenguid Jaani kohvikusse. Jaan küsib: „Kuidas nädalavahetus läks?” Sofia naeratab. Ta käis laupäeval Pärnus ja tal on palju rääkida.'),
      B.reading('059_d_read', 'Loe: Sofia reis.', 'Loe teksti ja vasta küsimustele.', 'Minu laupäev Pärnus',
        'Eelmisel laupäeval käisin Pärnus. Hommikul läksin kell kuus bussijaama. Buss väljus kell 6.45. Teekond kestis peaaegu kolm tundi. Bussis lugesin raamatut ja magasin natuke. Pärnusse jõudsin kell 9.40. Kõigepealt läksin randa. Ilm oli ilus, aga vesi oli veel külm. Siis jalutasin vanalinnas ja nägin Tallinna väravat. Lõunat sõin väikeses kohvikus. Pärastlõunal tuli minu sõbranna Kati. Ta tuli Tartust oma autoga. Öösel ööbisime väikeses hotellis mere lähedal. Pühapäeva hommikul käisime muuseumis. Hotellist lahkusime kell kaksteist. Ma tahtsin tagasi sõita bussiga. Aga Kati pakkus, et sõidame koos. Nii tulin tagasi Kati autoga. Tartusse jõudsime kell neli. Ma olin väsinud, aga väga rahul.',
        [['Millal Sofia Pärnus käis?', 'eelmisel laupäeval|laupäeval'], ['Kui kaua teekond kestis?', 'peaaegu kolm tundi|kolm tundi'], ['Kuhu Sofia kõigepealt läks?', 'randa'], ['Mida Sofia vanalinnas nägi?', 'Tallinna väravat|väravat'], ['Kus Sofia ja Kati ööbisid?', 'väikeses hotellis|hotellis|hotellis mere lähedal'], ['Kuidas Sofia tagasi tuli?', 'Kati autoga|autoga'], ['Mis kell Sofia Pärnusse jõudis?', 'kell 9.40|9.40'], ['Kus Sofia lõunat sõi?', 'väikeses kohvikus|kohvikus']]),
      B.notice('059_d_notice', 'Märka: lihtminevik', ['ma **käisin**, sa **käisid**, ta **käis**', 'me **käisime**, te **käisite**, nad **käisid**', 'minema → ma **läksin**, ta **läks**', 'tulema → ma **tulin**, ta **tuli**', 'olema → ma **olin**, ta **oli**; nägema → ma **nägin**, ta **nägi**', 'Aeg: **eile, eelmisel laupäeval, aasta tagasi**']),
      B.wordforms('059_d_forms', 'Eile…', 'Kirjuta tegusõna lihtminevikus.', [
        ['käima', 'ma (eile)', 'käisin'], ['minema', 'ma (eile)', 'läksin'], ['tulema', 'ta (eile)', 'tuli'], ['olema', 'me (eile)', 'olime'],
        ['nägema', 'nad (eile)', 'nägid'], ['sõitma', 'sa (eile)', 'sõitsid'], ['jõudma', 'ta (eile)', 'jõudis'], ['sööma', 'me (eile)', 'sõime']]),
      B.transformation('059_d_trans', 'Täna → eile.', 'Kirjuta lause minevikus.', [
        ['Täna sõidan ma bussiga.', 'Eile …', 'Eile sõitsin ma bussiga.|Eile ma sõitsin bussiga.'], ['Täna läheb Kati jaama.', 'Eile …', 'Eile läks Kati jaama.|Eile Kati läks jaama.'],
        ['Täna tuleme hilja koju.', 'Eile …', 'Eile tulime hilja koju.|Eile me tulime hilja koju.|Eile tulime me hilja koju.'], ['Täna olen ma Pärnus.', 'Eile …', 'Eile olin ma Pärnus.|Eile ma olin Pärnus.'],
        ['Täna näevad nad merd.', 'Eile …', 'Eile nägid nad merd.|Eile nad nägid merd.'], ['Täna ööbib ta hotellis.', 'Eile …', 'Eile ööbis ta hotellis.|Eile ta ööbis hotellis.'], ['Täna sööme kohvikus.', 'Eile …', 'Eile sõime kohvikus.|Eile me sõime kohvikus.|Eile sõime me kohvikus.'], ['Täna jõuab buss hilja.', 'Eile …', 'Eile jõudis buss hilja.']]),
      B.errorfix('059_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Eile ma lähen Tartusse.', 'Eile läksin ma Tartusse.|Eile ma läksin Tartusse.'], ['Ta tulis koju hilja.', 'Ta tuli koju hilja.'], ['Me nägisime merd.', 'Me nägime merd.'], ['Laupäeval ma käis Pärnus.', 'Laupäeval käisin ma Pärnus.|Laupäeval ma käisin Pärnus.'], ['Nad olisid väsinud.', 'Nad olid väsinud.'], ['Eelmisel nädalal ma käin Riias.', 'Eelmisel nädalal käisin ma Riias.|Eelmisel nädalal ma käisin Riias.'], ['Eile ta tulis koju kell kuus.', 'Eile tuli ta koju kell kuus.|Eile ta tuli koju kell kuus.'], ['Kas sa nägisid merd?', 'Kas sa nägid merd?']]),
      B.translation('059_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Вчера я была в Тарту.', 'На прошлой неделе мы ездили в Ригу.', 'Дорога заняла два часа.', 'Мы ночевали в гостинице.', 'Домой я приехала поздно вечером.', 'В прошлую субботу я была в Пярну.', 'Автобус отправился в семь часов.', 'Мы приехали в Тарту вечером.']),
      B.speaking('059_d_say', 'Minu viimane reis.', 'Räägi paarilisele oma viimasest reisist.', ['Kuhu sa sõitsid ja millal?', 'Millega sa sõitsid?', 'Kui kaua teekond kestis?', 'Mida sa seal nägid ja tegid?', 'Millal sa tagasi tulid?'], [60, 90], ['Eelmisel … käisin…', 'Ma sõitsin …-ga.', 'Seal ma nägin…']),
      B.writing('059_d_write', 'Minu nädalavahetus.', 'Kirjuta 6–8 lauset: kuhu sa eelmisel nädalavahetusel läksid.', [6, 8], ['käisin', 'läksin', 'sõitsin', 'nägin', 'tulin'], 3),
    ],
    practice: [
      B.cloze('059_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Viktori reis Riiga', [
        'Eelmisel nädalal {*käis|käib|käima} Viktor Riias. Ta {*sõitis|sõidab|sõitma} sinna bussiga.',
        '',
        'Teekond {*kestis|kestab|kestma} neli tundi. Bussis luges Viktor ajalehte ja {*magas|magab|magama} natuke.',
        '',
        'Riias {*nägi|näeb|nägema} ta vanalinna ja kirikuid. Õhtul {*sõi|sööb|sööma} ta restoranis kala.',
        '',
        'Ta {*ööbis|ööbib|ööbima} väikeses hotellis. Pühapäeval {*tuli|tuleb|tulema} Viktor tagasi Tallinnasse.',
      ], 'g_vocab'),
      B.listening('059_p_listen', 'Kuulamine. Liisi teekond.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Liis.', 'Eelmisel reedel sõitsin ema juurde Valka.', 'Rong väljus Tallinnast kell üheksa viisteist.', 'Rong hilines kümme minutit, aga see ei olnud probleem.',
        'Tartus istusin ümber bussile.', 'Valka jõudsin kell kolm päeval. Ema ootas mind bussijaamas.', 'Ma olin ema juures kaks päeva.', 'Pühapäeva õhtul tulin tagasi bussiga.',
      ], ['Liis sõitis Valka eelmisel [reedel].', 'Rong hilines [kümme|10] minutit.', 'Tartus istus Liis ümber [bussile].', 'Valka jõudis ta kell [kolm|3|15].', 'Ema ootas teda [bussijaamas].', 'Liis oli Valgas [kaks|2] päeva.', 'Tagasi tuli ta [bussiga].', 'Liis sõitis ema juurde [Valka].']),
      B.formtext('059_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna lihtminevikus.', 'Markuse nädalavahetus', [
        'Laupäeval [käis] (käima) Markus sõpradega Tartus.',
        '',
        'Nad [sõitsid] (sõitma) sinna rongiga. Rong [väljus] (väljuma) Tallinnast kell kaheksa.',
        '',
        'Tartus [nägid] (nägema) nad Toomemäge ja ülikooli. Lõunat [sõid] (sööma) nad kohvikus.',
        '',
        'Õhtul [olid] (olema) nad kontserdil. Markus [jõudis] (jõudma) koju alles öösel. Ta [oli] (olema) väsinud, aga rõõmus.',
      ], 'g_notice'),
      B.gaps('059_p_gaps', 'Jaani reis Riiga.', 'Kirjuta sulgudes olev tegusõna lihtminevikus.', [
        'Eelmisel nädalal [käis] (käima) Jaan Riias.', 'Ta [sõitis] (sõitma) sinna bussiga.', 'Teekond [kestis] (kestma) neli tundi.', 'Riias [ööbis] (ööbima) ta sõbra juures.',
        'Jaan ja sõber [nägid] (nägema) vanalinna.', 'Pühapäeval [tuli] (tulema) Jaan tagasi.', 'Ta [oli] (olema) väga rõõmus.', 'Õhtul [sõi] (sööma) Jaan restoranis.']),
      B.choice('059_p_time', 'Eile või homme?', 'Vali lausesse sobiv ajasõna.', [['___ sõitsin ma Tartusse.', 'Eile', 'Homme', 'Ülehomme'], ['___ lähen ma Pärnusse.', 'Homme', 'Eile', 'Eelmisel nädalal'], ['___ käisime me Riias.', 'Aasta tagasi', 'Järgmisel aastal', 'Varsti'], ['Kati tuli ___ tagasi.', 'eile õhtul', 'homme õhtul', 'järgmisel reedel'], ['___ olin ma Narvas.', 'Eelmisel suvel', 'Järgmisel suvel', 'Homme hommikul'], ['Me sõidame Valka ___.', 'järgmisel nädalal', 'eelmisel nädalal', 'eile'], ['Eelmisel nädalal ___ ma Riias.', 'käisin', 'käin', 'käima'], ['Eile ___ Kati rongiga Tartusse.', 'sõitis', 'sõidab', 'sõitsin']], 'full', 'g_notice'),
      B.transformation('059_p_ask', 'Küsi minevikus.', 'Kirjuta küsimus. Vastus on antud.', [
        ['Ma käisin Riias.', 'Kus …?', 'Kus sa käisid?|Kus te käisite?'], ['Ma sõitsin rongiga.', 'Millega …?', 'Millega sa sõitsid?|Millega te sõitsite?'],
        ['Me jõudsime kell kuus.', 'Mis kell …?', 'Mis kell te jõudsite?|Mis kell te kohale jõudsite?'], ['Ta ööbis hotellis.', 'Kus …?', 'Kus ta ööbis?'],
        ['Teekond kestis kaks tundi.', 'Kui kaua …?', 'Kui kaua teekond kestis?'], ['Nad tulid tagasi pühapäeval.', 'Millal …?', 'Millal nad tagasi tulid?'], ['Me sõime kohvikus.', 'Kus …?', 'Kus te sõite?'], ['Ma nägin vana lossi.', 'Mida …?', 'Mida sa nägid?|Mida te nägite?']]),
      B.dialogue('059_p_dialog', 'Kuidas nädalavahetus läks?', 'Täida dialoog. Kirjuta tegusõna minevikus.', 'Jaan', 'Sofia', [
        ['A', 'Tere, Sofia! Kuidas nädalavahetus [läks]?'], ['B', 'Väga hästi! Ma [käisin] Pärnus.'], ['A', 'Tore! Millega sa [sõitsid]?'], ['B', 'Bussiga. Teekond kestis peaaegu kolm tundi.'],
        ['A', 'Mida sa seal [nägid]?'], ['B', 'Randa ja vanalinna. Öösel [ööbisime] Katiga hotellis.'], ['A', 'Millal sa tagasi [tulid]?'], ['B', 'Pühapäeval. Me [jõudsime] Tartusse kell neli.'],
      ]),
      B.dictation('059_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Eile käisin ma Pärnus.', 'Buss väljus kell seitse.', 'Kõigepealt läksin randa.', 'Me ööbisime hotellis.', 'Tagasi sõitsin autoga.', 'Pühapäeval käisime muuseumis.', 'Õhtul olin ma väga väsinud.', 'Kati tuli Pärnusse oma autoga.'], 8),
      B.speaking('059_p_say', 'Intervjuu reisist.', 'Küsi paarilisel viis küsimust tema reisi kohta.', ['Kuhu sa sõitsid?', 'Millal see oli?', 'Millega sa sõitsid?', 'Kus sa ööbisid?', 'Mida sa nägid?'], [60, 90], ['Kuhu sa…?', 'Millega sa…?', 'Ma käisin…']),
    ],
    transfer: [
      B.text('059_t_situation', 'Uus olukord', 'Sinu keelekursusel on teema „Minu reis”. Iga õpilane kirjutab kursuse lehele lühikese loo ja räägib sellest grupile. Kõigepealt loed Markuse lugu.'),
      B.transformation('059_t_trans', 'Markus → mina.', 'Kirjuta lause ma-vormis.', [
        ['Markus sõitis bussiga Virtsu.', 'Ma …', 'Ma sõitsin bussiga Virtsu.'], ['Ta läks praamile.', 'Ma …', 'Ma läksin praamile.'], ['Ta ööbis telgis.', 'Ma …', 'Ma ööbisin telgis.'],
        ['Ta nägi Kaali kraatrit.', 'Ma …', 'Ma nägin Kaali kraatrit.'], ['Ta oli terve päeva hotellis.', 'Ma …', 'Ma olin terve päeva hotellis.'], ['Ta tuli tagasi bussiga.', 'Ma …', 'Ma tulin tagasi bussiga.|Ma tulin bussiga tagasi.'], ['Ta käis lossis.', 'Ma …', 'Ma käisin lossis.'], ['Ta nägi tuuleveskit.', 'Ma …', 'Ma nägin tuuleveskit.']]),
      B.reading('059_t_read', 'Loe Markuse lugu.', 'Loe lugu ja vasta küsimustele.', 'Rattaga Saaremaale',
        'Eelmisel kuul käisin rattaga Saaremaal. Kõigepealt sõitsin bussiga Virtsu. Ratas oli bussis kaasas. Virtsus läksin praamile. Praam sõitis Muhu saarele umbes pool tundi. Siis sõitsin rattaga Kuressaarde. Teekond oli pikk, aga ilus. Esimesel õhtul ööbisin telgis mere ääres. Teisel päeval nägin Kaali kraatrit ja vana tuuleveskit. Kuressaares käisin lossis. Seal oli palju turiste. Kolmandal päeval hakkas sadama ja ma olin terve päeva hotellis. Neljandal päeval oli jälle päike. Tagasi tulin bussiga. Ratas tuli ka kaasa. Tallinnasse jõudsin hilja õhtul. Järgmisel suvel tahan sõita Hiiumaale.',
        [['Millega sõitis Markus Virtsu?', 'bussiga'], ['Kui kaua praam sõitis?', 'umbes pool tundi|pool tundi'], ['Kus ta esimesel õhtul ööbis?', 'telgis mere ääres|telgis|mere ääres'], ['Mida ta teisel päeval nägi?', 'Kaali kraatrit ja vana tuuleveskit|Kaali kraatrit|tuuleveskit'], ['Miks oli ta kolmandal päeval hotellis?', 'hakkas sadama|sadas vihma'], ['Kuhu ta tahab järgmisel suvel sõita?', 'Hiiumaale'], ['Mida Markus Kuressaares tegi?', 'käis lossis|ta käis lossis'], ['Kas lossis oli palju turiste?', 'jah|oli']]),
      B.table('059_t_table', 'Markuse reis lühidalt.', 'Kirjuta tekstist 1–3 sõna.', 'Küsimus, Markus', [
        'Kuhu ta sõitis? | [Saaremaale]', 'Millega ta sõitis? | [bussiga ja rattaga/rattaga]', 'Kus ta ööbis? | [telgis ja hotellis/telgis]', 'Mida ta nägi? | [Kaali kraatrit/lossi/tuuleveskit]', 'Kuidas ta tagasi tuli? | [bussiga]',
      ], 'g_read'),
      B.rolecards('059_t_roles', 'Küsimused pärast lugu.', 'A räägib reisist, B küsib detaile. Siis vahetage.',
        'Räägi oma reisist. Vasta küsimustele täislausega.', 'Kuula ja küsi vähemalt neli küsimust minevikus.',
        ['Ma käisin…', 'Me sõitsime…', 'Seal ma nägin…'], ['Millal sa seal käisid?', 'Kus sa ööbisid?', 'Mis sulle kõige rohkem meeldis?']),
      B.speaking('059_t_tell', 'Räägi grupile.', 'Räägi oma reisist 1–2 minutit. Ära loe paberilt.', ['Kuhu ja millal?', 'Millega?', 'Kus sa ööbisid?', 'Mida sa nägid?', 'Kuidas sa tagasi tulid?'], [60, 120], ['kõigepealt', 'siis', 'lõpuks']),
      B.letter('059_t_card', 'Postkaart sõbrale.', 'Kirjuta sõbrale postkaart: kus sa olid, mida nägid ja millal tuled tagasi.', 'Tere, Kati!', 'Kallistan!', [40, 60]),
      B.rubric('059_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Lugu vastab küsimustele kuhu, millal, millega ja mida tegin.', 'Tegusõnad on lihtminevikus (käisin, läksin, tulin, nägin).', 'Ajasõnad näitavad järjekorda (kõigepealt, siis, lõpuks).', 'Suuline lugu on 6–8 lauset ja kuulaja saab aru.']),
      B.selfcheck('059_t_self', ['Ma saan aru teise inimese reisijutust.', 'Ma kirjutan oma reisist 6–8 lauset.', 'Ma räägin reisist grupile ilma paberita.', 'Ma küsin teiselt reisi kohta minevikus.'], 'Minu reis on kirjas'),
    ],
  },

  'a2-060': {
    title: 'Kontroll 12 — reisimine',
    assessment: true,
    canDo: 'Ma näitan kontrollis, et saan aru tablost, teadaandest ja kassavestlusest, ostan pileti ja räägin lõppenud reisist (vähemalt 70%, aeg ja koht vähemalt 80%).',
    discover: [
      B.text('060_d_situation', 'Kordamine: Anna sõidab Riiga', 'Anna sõidab nädalavahetusel Riiga sõbranna juurde. Ta ostab pileti, vaatab tablood ja kuulab teadaandeid. Pühapäeva õhtul kirjutab ta Markusele, kuidas reis läks.'),
      B.truefalse('060_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Anna sõidab Riiga.', true], ['Anna sõidab sinna tööle.', false], ['Anna vaatab tablood.', true], ['Anna kirjutab Markusele reedel.', false], ['Riias elab Anna sõbranna.', true],
      ]),
      B.reading('060_d_read', 'Loe: Anna sõnum.', 'Loe sõnumit ja vasta küsimustele.', 'Tere, Markus!',
        'Tere, Markus! Ma olen jälle Tallinnas. Reis Riiga oli tore, aga mitte lihtne. Reedel ostsin pileti internetist. Buss pidi väljuma kell 8.30. Hommikul läksin bussijaama trammiga. Seal kuulsin teadaannet: buss hilineb pool tundi. Ma jõin kohvi ja ootasin. Bussis oli palju reisijaid. Juht oli väga sõbralik. Riiga jõudsime kell kaks. Sõbranna Ilze ootas mind bussijaamas. Laupäeval nägime vanalinna ja käisime turul. Pühapäeval tahtsin tagasi sõita bussiga, aga buss oli täis. Siis sõitsin tagasi rongiga. Valgas pidin ümber istuma. Teekond kestis kuus tundi, aga rongis oli mugav. Koju jõudsin kell üksteist õhtul. Kohver oli raske ja ma olin väga väsinud. Järgmine kord ostan ka tagasisõidu pileti varem! Anna',
        [['Kus Anna pileti ostis?', 'internetist'], ['Kuidas Anna bussijaama sõitis?', 'trammiga'], ['Mida Anna bussijaamas kuulis?', 'buss hilineb pool tundi|teadaannet|et buss hilineb'], ['Mis kell buss Riiga jõudis?', 'kell kaks|kaks|14'], ['Miks ei sõitnud Anna tagasi bussiga?', 'buss oli täis'], ['Kus Anna ümber istus?', 'Valgas']]),
      B.table('060_d_find', 'Leia tekstist.', 'Leia tekstist tegusõna minevikus.', 'Tegusõna, Anna sõnumis', [
        'ostma | [ostsin]', 'minema | [läksin]', 'kuulma | [kuulsin]', 'jõudma | [jõudsime/jõudsin]', 'nägema | [nägime]', 'sõitma | [sõitsin]',
      ], 'g_notice'),
      B.notice('060_d_notice', 'Mooduli kokkuvõte', [
        'Millega? **bussiga, rongiga, trammiga** — aga **jalgsi**', 'Kus? kuhu? kust? **jaamas — jaama — jaamast**', 'Tablo: buss **väljub** Tartu**st**, **saabub** Pärnu**sse**, **hilineb** 10 minuti**t**', 'Kassas: **Palun üks pilet Narva. Mis kell…? Kust…?**', 'Minevik: **käisin, läksin, tulin, sõitsin, olin, nägin**',
      ], 'full'),
      B.categorize('060_d_sort', 'Kus seda kuuled või loed?', 'Pane laused õigesse rühma.', [
        ['Kassas', ['Üks ots või edasi-tagasi?', 'Kas soovite sooduspiletit?', 'See maksab kaheksa eurot.']], ['Teadaanne jaamas', ['Rong hilineb kümme minutit.', 'Buss väljub viiendalt platvormilt.', 'Lend on tühistatud.']], ['Sõbra sõnum', ['Ma jõudsin hästi kohale!', 'Reis oli tore.', 'Ootan sind bussijaamas.']],
      ], 'full', 'g_vocab'),
      B.match('060_d_match', 'Küsimus ja vastus.', 'Ühenda küsimus ja vastus.', [
        ['Millega sa Riiga sõitsid?', 'Bussiga.'], ['Mis kell rong väljub?', 'Kell 9.15.'], ['Kust buss läheb?', 'Viiendalt platvormilt.'],
        ['Kui kaua teekond kestis?', 'Neli tundi.'], ['Kus sa ööbisid?', 'Sõbranna juures.'], ['Millal sa tagasi tulid?', 'Pühapäeva õhtul.'],
      ], 'full', 'g_use'),
      B.gaps('060_d_gaps', 'Mooduli vormid.', 'Kirjuta lünka sobiv sõna. Kuus sõna jääb üle.', [
        'Ma sõidan tööle [bussiga].', 'Homme rong [väljub] kell kaheksa.', 'Palun üks pilet [Tartusse].', 'Buss väljub [teiselt] platvormilt.', 'Eile [käisin] ma Narvas.', 'Me [jõudsime] eile koju hilja.',
      ], ['bussiga', 'buss', 'väljub', 'väljus', 'Tartusse', 'Tartus', 'teiselt', 'teine', 'käisin', 'käin', 'jõudsime', 'jõuame']),
      B.transformation('060_d_trans', 'Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Täna sõidan ma rongiga.', 'eile', 'Eile sõitsin ma rongiga.|Eile ma sõitsin rongiga.'], ['Ma lähen jaama.', 'eile', 'Eile läksin ma jaama.|Eile ma läksin jaama.'],
        ['Buss väljub kell kaks.', 'küsimus: Mis kell…?', 'Mis kell buss väljub?'], ['Pilet maksab 8 eurot.', 'küsimus: Kui palju…?', 'Kui palju pilet maksab?'], ['Me oleme Pärnus.', 'eile', 'Eile olime me Pärnus.|Eile me olime Pärnus.'],
      ]),
      B.errorfix('060_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma sõidan tööle buss.', 'Ma sõidan tööle bussiga.'], ['Palun üks pilet Tartus.', 'Palun üks pilet Tartusse.'], ['Rong hilineb kümme minutid.', 'Rong hilineb kümme minutit.'],
        ['Eile ma lähen Riiga.', 'Eile läksin ma Riiga.|Eile ma läksin Riiga.'], ['Ma lähen jalgsiga.', 'Ma lähen jalgsi.'],
      ]),
      B.dialogue('060_d_dialog', 'Kassas.', 'Täida Anna ja kassapidaja vestlus.', 'Anna', 'Kassapidaja', [
        ['A', 'Tere! Palun üks [pilet] Riiga.'], ['B', 'Tere! Üks ots või [edasi-tagasi]?'], ['A', 'Üks ots. Mis kell buss [väljub]?'],
        ['B', 'Kell 8.30. Buss väljub kolmandalt [platvormilt].'], ['A', 'Kas ma saan [kaardiga] maksta?'], ['B', 'Jah. Pilet maksab 25 eurot. Head [reisi]!'],
      ]),
      B.wordorder('060_d_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', ['Hommikul läksin trammiga bussijaama.', 'Buss hilines pool tundi.', 'Riiga jõudsime kell kaks.', 'Tagasi sõitsin rongiga.', 'Kohver oli väga raske.']),
      B.translation('060_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я езжу на работу на трамвае.', 'Один билет до Тарту, пожалуйста.', 'Поезд опаздывает на десять минут.', 'Вчера я была в Риге.', 'Мы приехали домой поздно.']),
      B.dictation('060_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Palun üks pilet Riiga.', 'Buss hilineb pool tundi.', 'Rong väljub teiselt platvormilt.', 'Eile käisin ma Pärnus.', 'Me jõudsime koju hilja.']),
      B.speaking('060_d_say', 'Kordame suuliselt.', 'Vasta paarilise küsimustele.', ['Millega sa tavaliselt tööle sõidad?', 'Kus sa pileti ostad?', 'Kuhu sa viimati sõitsid?', 'Mis reisil juhtus?'], [60, 120]),
      B.writing('060_d_write', 'Minu teekond.', 'Kirjuta 5–7 lauset: kuidas sa eile tööle või kooli sõitsid.', [5, 7], ['sõitsin', 'väljus', 'jõudsin'], 2),
    ],
    practice: [
      B.tip('060_p_how', 'Lugemine ja kuulamine (eksami vormis)', 'See osa on nagu Harno A2 eksam: viis lugemisülesannet ja kaks kuulamisülesannet. Teema on moodul 12. Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda. Eesmärk on 70%, aeg ja koht vähemalt 80%.', 'full'),
      // reading 1: what to say
      B.choice('060_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sa tahad piletit Tartusse. Mida ütled kassas?', 'Palun üks pilet Tartusse.', 'Palun üks pilet Tartus.', 'Palun üks pilet Tartust.'],
        ['Sa ei tea, kust rong väljub. Mida küsid?', 'Kust rong väljub?', 'Kuhu rong eile läks?', 'Kus rong eile oli?'],
        ['Bussis seisab keegi ukse ees. Sa tahad väljuda.', 'Vabandust, kas te väljute?', 'Head isu, palun!', 'Palun üks pilet!'],
        ['Sõber tuli reisilt tagasi. Mida küsid?', 'Kuidas reis läks?', 'Kuhu sa homme lähed?', 'Mis kell rong väljub?'],
        ['Kassapidaja küsib: „Üks ots või edasi-tagasi?”', 'Edasi-tagasi, palun.', 'Kaardiga, palun.', 'Akna all, palun.'],
      ], 'full', 'g_use'),
      // reading 2: a departure board
      B.reading('060_p_board', 'Lugemine 2. Tablo.', 'Loe bussijaama tablood ja vasta küsimustele.', 'Tartu bussijaam — väljumised', [
        'Kell 10.05 — Tallinn — platvorm 3 — väljub õigel ajal.', 'Kell 10.20 — Pärnu — platvorm 5 — hilineb 15 minutit.', 'Kell 10.30 — Narva — platvorm 1 — väljub õigel ajal.',
        'Kell 10.45 — Valga — platvorm 2 — tühistatud.', 'Kell 11.00 — Riia — platvorm 4 — väljub õigel ajal.', 'Kell 11.15 — Viljandi — platvorm 6 — ümberistumine Elvas.',
        'Tähelepanu! Buss Valka on täna tühistatud. Järgmine buss Valka väljub kell 13.45. Pileti saab vahetada kassas tasuta. Kassa on avatud iga päev kella seitsmest üheksani õhtul. Pakihoid on esimese platvormi kõrval. Ootesaalis on kohvik ja tasuta internet. Head reisi!',
      ], [['Mis kell väljub buss Tallinnasse?', '10.05|kell 10.05'], ['Mis platvormilt läheb buss Narva?', 'esimeselt|platvormilt 1|1'], ['Kui palju hilineb buss Pärnusse?', '15 minutit|viisteist minutit'], ['Mis kell väljub järgmine buss Valka?', '13.45|kell 13.45'], ['Kus peab Viljandi reisija ümber istuma?', 'Elvas'], ['Kui palju maksab pileti vahetamine?', 'tasuta|see on tasuta']]),
      // reading 3: signs
      B.match('060_p_signs', 'Lugemine 3. Kuhu minna?', 'Ühenda soov ja silt.', [
        ['Tahad osta piletit.', 'Kassa — avatud 7–21'], ['Tahad jätta kohvri mõneks tunniks.', 'Pakihoid — 2 € päev'], ['Tahad teada, kust rong väljub.', 'Tablo — väljumised ja platvormid'],
        ['Tahad sõita lennujaama.', 'Tramm nr 4 — lennujaam'], ['Tahad sõita laevaga Helsingisse.', 'Sadam — A-terminal'], ['Kaotasid bussis kindad.', 'Leitud asjad — infoletis'],
      ], 'full', 'g_read'),
      // reading 4: a ~140-word text, short answers and 3-option questions
      B.reading('060_p_read', 'Lugemine 4. Puhkus ilma autota.', 'Loe teksti. Vasta lühidalt.', 'Puhkus ilma autota',
        'Eestis saab hästi reisida ka ilma autota. Linnade vahel sõidavad bussid ja rongid. Rongid on mugavad ja seal on tasuta internet. Rongipiletit saab osta ka rongis, aga kassas või internetis on see odavam. Bussipileti on kõige parem osta internetist, sest suvel on bussid tihti täis. Saartele sõidavad praamid. Kui sul on auto, osta praamipilet suvel varem. Jalgsi reisija pääseb praamile tavaliselt ilma probleemita. Tallinnast saab laevaga sõita ka Helsingisse ja Stockholmi. Lennujaam on Tallinna kesklinna lähedal. Sinna sõidab tramm number neli. Linnades on mugav sõita rattaga. Kui sa sõidad bussiga või rongiga, võta kaasa ID-kaart või pilet telefonis. Kontrolör võib seda küsida. Hea reisija planeerib teekonna ette. Aga ta jätab natuke aega ka üllatusteks.',
        [['Mis on rongis tasuta?', 'internet'], ['Millega saab Tallinnast Helsingisse sõita?', 'laevaga'], ['Mis tramm sõidab lennujaama?', 'number neli|neli|4|tramm number neli']]),
      B.choice('060_p_readmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali igale küsimusele üks vastus.', [
        ['Kus on rongipilet odavam?', 'kassas või internetis', 'rongis', 'bussis'], ['Miks on hea osta bussipilet internetist?', 'suvel on bussid täis', 'internetis on pilet tasuta', 'kassa on suvel kinni'],
        ['Kes peab praamipileti suvel varem ostma?', 'autoga reisija', 'jalgsi reisija', 'rattaga reisija'], ['Kus on lennujaam?', 'kesklinna lähedal', 'Helsingis', 'sadama kõrval'],
        ['Mida võib kontrolör küsida?', 'piletit või ID-kaarti', 'raha ja kohvrit', 'aadressi ja telefoni'],
      ]),
      // reading 5: a personal letter with 8 option gaps
      B.cloze('060_p_cloze', 'Lugemine 5. Kiri sõbrale.', 'Vali igasse lünka sobiv sõna.', 'Tere, Ira!', [
        'Ma {*käisin|käin|käima} eelmisel nädalal Narvas. Ma sõitsin {*rongiga|rong|rongis} ja teekond kestis kolm tundi.',
        '',
        'Rong {*väljus|väljub|väljuma} Tallinnast kell kaheksa. Narva {*jõudsin|jõuan|jõudma} ma kell üksteist.',
        '',
        'Kahjuks ma ei {*näinud|nägin|näe} sind, sest sa olid {*puhkusel|puhkus|puhkusele}. Järgmine kord helistan sulle {*varem|hiljem|eile}.',
        '',
        'Kas sa tuled suvel {*Tallinnasse|Tallinnas|Tallinnast}? Kirjuta mulle! Kallistan, Sofia',
      ]),
      // listening 1: a station announcement, answers of 1–2 words
      B.listening('060_p_listen', 'Kuulamine 1. Teadaanne jaamas.', 'Õpetaja loeb teadaande kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tähelepanu, reisijad!', 'Rong Tallinnast Tartusse väljub täna kell kümme kakskümmend.', 'Rong hilineb viisteist minutit.', 'Rong väljub teiselt platvormilt, mitte esimeselt.',
        'Tartus saab ümber istuda Valga rongile.', 'Rongis on kohvik kolmandas vagunis.', 'Pileteid saab osta ka rongis, aga kassas on piletid odavamad. Vabandame!',
      ], ['Rong sõidab Tallinnast [Tartusse].', 'Sõiduplaani järgi väljub rong kell [10.20|kümme kakskümmend].', 'Rong hilineb [15|viisteist] minutit.', 'Rong väljub [teiselt] platvormilt.', 'Tartus saab ümber istuda [Valga] rongile.', 'Kohvik on [kolmandas] vagunis.']),
      // listening 2: a dialogue at the ticket office
      B.listening('060_p_listen2', 'Kuulamine 2. Kassas.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere! Palun kaks piletit Pärnusse.', '— Tere! Mis kellaks?', '— Mis kell järgmine buss väljub?', '— Kell 12.15. Aga see buss on täis. Järgmine on kell 13.40.',
        '— Hästi, siis kell 13.40. Kas see buss sõidab otse?', '— Ei, Viljandis on ümberistumine. Kas soovite sooduspileteid?', '— Üks täispilet ja üks sooduspilet. Minu ema on pensionär.',
        '— Kokku kakskümmend üks eurot. Buss väljub kuuendalt platvormilt.', '— Aitäh! Kas ma saan kohvri bussi panna?', '— Jah, juht aitab teid.',
      ], ['Reisija ostab [kaks|2] piletit.', 'Buss kell 12.15 on [täis].', 'Reisija sõidab bussiga kell [13.40].', 'Ümberistumine on [Viljandis].', 'Piletid maksavad kokku [21|kakskümmend üks] eurot.', 'Buss väljub [kuuendalt] platvormilt.', 'Kohvriga aitab [juht|bussijuht].']),
      B.gaps('060_p_mix', 'Keeleosa. Kirjuta õige vorm.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma sõidan tööle [trammiga] (tramm).', 'Palun üks pilet [Narva|Narvasse] (Narva).', 'Rong saabub [Tartusse] (Tartu) kell 11.', 'Buss hilineb kümme [minutit] (minut).',
        'Eile [läksin] (minema) ma jalgsi koju.', 'Eelmisel nädalal [käisime] (käima) me Riias.',
      ]),
      B.errorfix('060_p_fix', 'Keeleosa. Paranda viga.', 'Kirjuta laused õigesti.', [
        ['Palun kaks pilet Tartusse.', 'Palun kaks piletit Tartusse.'], ['Rong väljub teine platvormilt.', 'Rong väljub teiselt platvormilt.'], ['Eile ma nägisin sõpra.', 'Eile ma nägin sõpra.|Eile nägin ma sõpra.'],
        ['Me jõudsime Riias kell kaks.', 'Me jõudsime Riiga kell kaks.'], ['Kust kell buss väljub?', 'Mis kell buss väljub?'],
      ]),
      B.transformation('060_p_trans', 'Keeleosa. Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Täna sõidan ma rongiga.', 'eile', 'Eile sõitsin ma rongiga.|Eile ma sõitsin rongiga.'], ['Buss väljub kell kaks.', 'küsimus: Mis kell…?', 'Mis kell buss väljub?'],
        ['Pilet maksab kümme eurot.', 'küsimus: Kui palju…?', 'Kui palju pilet maksab?'], ['Ma käisin Narvas.', 'eitus', 'Ma ei käinud Narvas.'], ['Me tulime bussiga.', 'küsimus: Millega…?', 'Millega te tulite?'],
      ]),
      B.wordorder('060_p_order', 'Keeleosa. Pane lause kokku.', 'Kirjuta laused õigesti.', ['Rong hilineb täna viisteist minutit.', 'Tartus saab ümber istuda Valga rongile.', 'Kas see buss sõidab otse?', 'Eelmisel nädalal käisin ma Narvas.', 'Kohvik on kolmandas vagunis.']),
      B.speaking('060_p_say', 'Räägi kuuldust.', 'Räägi paarilisele, mida reisija kassas ostis.', ['Kuhu reisija sõidab?', 'Miks ta ei sõida kell 12.15?', 'Kas buss sõidab otse?', 'Kui palju piletid maksavad?'], [45, 90], ['Reisija ostab…', 'Buss on…', 'Ta peab … ümber istuma.']),
    ],
    transfer: [
      B.text('060_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'See osa on nagu Harno A2 eksami kirjutamise ja rääkimise osa. Kirjuta ilma sõnaraamatuta. Rääkimine on paaris, nagu eksamil.'),
      B.notice('060_t_card', 'Kuulutus', ['Rattarent „Ratas” — rattad päevaks või nädalaks', 'Hind: 15 € päev, 60 € nädal', 'Aadress: Sadama 4, Pärnu (bussijaama kõrval)', 'Avatud: maist septembrini, iga päev 9–20', 'Broneerimine: telefon 5544 3322'], 'full', 'g_read'),
      // writing 1: information transfer, at least 25 words
      B.letter('060_t_info', 'Kirjutamine 1. Soovita rattarenti.', 'Sõber tahab Pärnus rattaga sõita. Kirjuta: kus, millal, hind, kuidas broneerida.', 'Tere, Jaan!', 'Head reisi!', [25, 40]),
      B.planning('060_t_plan', 'Enne kirja.', 'Mõtle läbi ja kirjuta märksõnad.', ['Kuhu ja millal sa sõitsid?', 'Millega sa sõitsid?', 'Mis teel juhtus?', 'Mis sulle meeldis?']),
      // writing 2: a letter, at least 30 words
      B.letter('060_t_letter', 'Kirjutamine 2. Kiri reisist.', 'Kirjuta sõbrale oma viimasest reisist: kuhu, millega, mida nägid.', 'Tere, Kati!', 'Kallistan!', [30, 50]),
      B.writing('060_t_text', 'Kirjutamine 2 (teine valik). Rong hilines.', 'Rong hilines tund. Kirjuta raudteefirmale 4–6 lauset ja küsi raha tagasi.', [4, 6], ['rong', 'hilines', 'pilet', 'palun'], 2),
      B.table('060_t_form', 'Pileti broneerimine.', 'Täida bussipileti broneerimise vorm.', 'Andmed, Sinu vastus', ['Ees- ja perekonnanimi | ', 'Kust? | ', 'Kuhu? | ', 'Kuupäev ja kellaaeg | ', 'Mitu piletit? Täis- või sooduspilet? | ', 'Telefon või e-post | ']),
      // speaking: getting to know, picture description (task 1), idea card and role play (task 2)
      B.speaking('060_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele, nagu eksami alguses.', ['Mis su nimi on?', 'Kus sa elad?', 'Millega sa tööle või kooli sõidad?', 'Kuhu sa tahad suvel sõita?'], [45, 60]),
      B.speaking('060_t_mono', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab pildi: jaam, lennujaam või sadam. Kirjelda üks minut.', ['Kus inimesed on?', 'Mida nad teevad?', 'Kuhu nad sõidavad?', 'Mis kell võib olla?'], [60, 90], ['Pildil on…', 'Vasakul / paremal…', 'Nad ootavad…']),
      B.rolecards('060_t_s1', 'Rääkimine 2. Ideekaart „Reis”.', 'A küsib kaardi märksõnade järgi, B vastab. Siis vahetage.',
        'Küsi paarilisel viis küsimust: kuhu, millega, kui kaua, kus ööbis, mida nägi.', 'Vasta igale küsimusele 2–3 lausega. Räägi oma viimasest reisist.',
        ['Kuhu sa viimati sõitsid?', 'Millega sa sõitsid?', 'Kus sa ööbisid?'], ['Ma käisin…', 'Ma sõitsin …-ga.', 'Ma ööbisin…']),
      B.rolecards('060_t_s2', 'Rääkimine 2. Rollimäng „Kassas”.', 'A on reisija, B on kassapidaja. Siis vahetage.',
        'Osta kaks piletit Tartusse homseks hommikuks. Küsi aega, platvormi ja hinda.', 'Buss kell 8 on täis. Paku teist aega. Küsi: üks ots või edasi-tagasi?',
        ['Palun kaks piletit…', 'Mis kell…?', 'Kust buss väljub?'], ['Kahjuks on buss täis.', 'Järgmine buss väljub…', 'Üks ots või edasi-tagasi?']),
      B.rubric('060_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Ülesanne on täidetud: kõik küsitud info on olemas.', 'Aeg, koht ja transport on täpsed.', 'Minevik on õiges vormis (käisin, sõitsin, nägin).', 'Kirjutamine 1: vähemalt 25 sõna; kirjutamine 2: 30–50 sõna.', 'Rääkimine: küsisin ja vastasin lõpuni.']),
      B.selfcheck('060_t_self', ['Ma kirjutan kuulutuse järgi sõbrale lühikese soovituse.', 'Ma kirjutan oma reisist 30–50 sõna.', 'Ma kirjeldan jaama või sadama pilti.', 'Ma ostan rollimängus pileti ja lahendan probleemi.'], 'Moodul 12 on tehtud'),
    ],
  },
};
