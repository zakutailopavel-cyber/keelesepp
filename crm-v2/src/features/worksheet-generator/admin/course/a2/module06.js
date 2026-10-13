// A2 course (A1 → A2 roadmap), module 6 „Söök, jook ja kohvik”, lessons a2-026 … a2-030 (full course sheets, pattern of
// a2/module01.js). Food and drinks, quantities and the partitive tied to real amounts (liiter piima, kilo kartuleid,
// kaks muna; söön leiba, joon kohvi — but Mulle meeldib kohv), ordering in a café (Ma soovin…, Palun mulle…, Kas teil
// on…?, Arve, palun!), prices in euros and cents, -ga / ilma …-ta and checking the bill. Harno A2 formats: short
// listenings with 1–2-word answers (read twice), a menu and a notice to read, a message of 40–60 words, ordering in a
// role play. The recurring place is Jaan's café (Jaani kohvik, art/visuals/a2-module-06.js).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-06', course: 'a2', title: 'Söök, jook ja kohvik', level: 'A2' };

export const LESSONS = {
  'a2-026': {
    title: 'Toit ja joogid',
    canDo: 'Ma nimetan vähemalt 18 toitu ja jooki, ütlen, mida ma söön ja joon ning mis mulle maitseb, ja kirjutan ostunimekirja.',
    discover: [
      B.text('026_d_situation', 'Mis on külmkapis?', 'On laupäeva hommik. Anna avab külmkapi. Seal on ainult piim ja natuke juustu. Õhtul tulevad külla Jaan ja Sofia. Anna peab minema poodi. Mida osta? Mida külalised söövad ja joovad?'),
      B.vocab('026_d_vocab', 'Toit ja joogid', ['toit — еда', 'jook — напиток', 'leib — хлеб', 'sai — белый хлеб', 'piim — молоко', 'juust — сыр', 'liha — мясо', 'kala — рыба', 'köögivili — овощ', 'puuvili — фрукт', 'supp — суп', 'salat — салат', 'kohv — кофе', 'tee — чай', 'mahl — сок', 'vesi — вода', 'külmkapp — холодильник', 'maitsev — вкусный']),
      B.categorize('026_d_sort', 'Mis kuhu käib?', 'Pane sõnad õigesse rühma.', [
        ['Joogid', ['kohv', 'tee', 'mahl', 'piim', 'vesi']], ['Köögiviljad', ['kartul', 'porgand', 'kurk', 'tomat']],
        ['Puuviljad', ['õun', 'banaan', 'pirn', 'apelsin']], ['Muu toit', ['leib', 'juust', 'kala', 'liha']],
      ]),
      B.reading('026_d_read', 'Loe: Mida me sööme?', 'Loe teksti ja vasta küsimustele lühidalt.', 'Anna ja tema sõbrad',
        'Minu nimi on Anna. Mulle meeldib süüa teha. Hommikul söön ma tavaliselt leiba juustuga ja joon kohvi. Mõnikord söön ma ka putru. Lõunal söön ma tööl suppi või salatit. Õhtul teen ma kodus sooja sööki: kala või kana ja köögivilju. Liha ma söön harva. Minu sõber Jaan on kohviku omanik. Tema kohvik on väike, aga hubane. Jaan sööb palju liha ja kartulit. Ta joob päevas viis tassi kohvi! Sofia on taimetoitlane. Ta ei söö liha ega kala. Talle meeldivad puuviljad ja köögiviljad. Sofia joob teed, kohvi ta ei joo. Täna õhtul tulevad Jaan ja Sofia minu juurde. Ma teen köögiviljasuppi ja salatit. Magustoiduks on õunakook. Joogiks on mahl, vesi ja tee. Jaanile ostan ma natuke kala, sest ta armastab kala. Sofiale ostan ma puuvilju. Poes on täna värske leib ja maitsev juust. Ma ostan ka piima ja kohvi.',
        [['Mida Anna hommikul joob?', 'kohvi'], ['Mida Anna lõunal sööb?', 'suppi või salatit|suppi|salatit'], ['Kes on Jaan?', 'kohviku omanik|ta on kohviku omanik|Anna sõber'], ['Mitu tassi kohvi Jaan päevas joob?', 'viis|viis tassi|5'], ['Miks Sofia ei söö liha?', 'ta on taimetoitlane|sest ta on taimetoitlane'], ['Mis on magustoiduks?', 'õunakook']]),
      B.truefalse('026_d_tf', 'Õige või vale?', 'Loe Anna teksti uuesti.', [
        ['Anna sööb hommikul leiba juustuga.', true], ['Anna sööb palju liha.', false], ['Jaan joob palju kohvi.', true],
        ['Sofia joob kohvi.', false], ['Õhtul teeb Anna köögiviljasuppi.', true],
      ]),
      B.notice('026_d_notice', 'Märka: söön leiba, aga mulle meeldib leib', ['Ma **söön** leib**a**, juust**u**, supp**i**. (mida? → osastav)', 'Ma **joon** kohv**i**, tee**d**, piim**a**, **vett**.', 'Ma **ei söö** liha. Ma **ei joo** kohvi.', 'Aga: Mulle **meeldib** kohv. Mulle **maitseb** kala. (mis? → nimetav)']),
      B.wordforms('026_d_forms', 'Mida sa sööd ja jood?', 'Kirjuta sõna osastavas (mida?).', [
        ['leib', 'ma söön …', 'leiba'], ['juust', 'ma söön …', 'juustu'], ['supp', 'ma söön …', 'suppi'], ['salat', 'ma söön …', 'salatit'],
        ['kohv', 'ma joon …', 'kohvi'], ['tee', 'ma joon …', 'teed'], ['vesi', 'ma joon …', 'vett'],
      ]),
      B.match('026_d_match', 'Mis see on?', 'Ühenda kirjeldus ja sõna.', [
        ['Seda sööd lusikaga, see on kuum.', 'supp'], ['See on külm, seal on palju köögivilju.', 'salat'], ['Seda joome tassist, see on must.', 'kohv'],
        ['See on valge, laps joob seda.', 'piim'], ['See elab vees.', 'kala'], ['Seal hoiame toitu külmas.', 'külmkapp'],
      ]),
      B.gaps('026_d_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Hommikul ma joon [kohvi]. (kohv)', 'Lõunal ma söön [suppi]. (supp)', 'Mulle meeldib [kala]. (kala)', 'Sofia ei söö [liha]. (liha)',
        'Mulle maitseb [juust]. (juust)', 'Laps joob [piima]. (piim)', 'Jaan joob palju [vett]. (vesi)',
      ]),
      B.errorfix('026_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma söön leib.', 'Ma söön leiba.'], ['Ma joon kohv.', 'Ma joon kohvi.'], ['Mulle meeldib kohvi.', 'Mulle meeldib kohv.'],
        ['Sofia joob tee.', 'Sofia joob teed.'], ['Me sööme salat.', 'Me sööme salatit.'],
      ]),
      B.wordorder('026_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Hommikul ma joon kohvi.', 'Sofia ei söö liha ega kala.', 'Mulle meeldivad puuviljad.', 'Supp on väga maitsev.', 'Piim on külmkapis.']),
      B.translation('026_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я ем хлеб с сыром.', 'Я не пью кофе.', 'Мне нравится рыба.', 'Молоко в холодильнике.', 'Суп очень вкусный.']),
      B.dictation('026_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma söön leiba ja juustu.', 'Laps joob piima.', 'Mulle meeldib kala.', 'Sofia ei joo kohvi.', 'Külmkapis on mahl ja vesi.'], 5),
      B.speaking('026_d_say', 'Minu toit.', 'Räägi paarilisele, mida sa sööd ja jood.', [
        'Mida sa hommikul sööd ja jood?', 'Mida sa lõunal sööd?', 'Mis on sinu lemmiktoit?', 'Mida sa ei söö?', 'Mis jook sulle meeldib?',
      ], [45, 90], ['Hommikul ma söön…', 'Mulle meeldib…', 'Ma ei söö…']),
      B.writing('026_d_write', 'Minu toidupäev.', 'Kirjuta 5–7 lauset: mida sa päeva jooksul sööd ja jood.', [5, 7], ['hommikul', 'lõunal', 'õhtul', 'meeldib'], 2),
      B.selfcheck('026_d_self', ['Ma nimetan toite ja jooke.', 'Ma ütlen: ma söön leiba, ma joon kohvi.', 'Ma ütlen, mis mulle meeldib ja mida ma ei söö.', 'Ma saan aru lühikesest tekstist toidust.'], 'Toidusõnad on käes'),
    ],
    practice: [
      B.crossword('026_p_cross', 'Toidusõnad.', 'Kirjuta sõna vihje järgi.', [
        ['Seda joome hommikul tassist', 'kohv'], ['Valge jook, laps joob seda', 'piim'], ['Elab vees, seda saab süüa', 'kala'],
        ['Kollane, seda paneme leivale', 'juust'], ['Punane või roheline puuvili', 'õun'], ['Siin hoiame piima ja juustu', 'külmkapp'],
      ]),
      B.listening('026_p_listen', 'Kuulamine. Mis on külmkapis?', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Jaan ja mul on väike kohvik.', 'Täna hommikul vaatan ma külmkappi.', 'Külmkapis on piim, juust ja natuke kala.',
        'Liha ei ole, kana ka ei ole.', 'Köögivilju on vähe: kaks tomatit ja üks kurk.', 'Ma pean ostma leiba, kartulit ja õunu.',
        'Täna on menüüs kalasupp ja köögiviljasalat.', 'Magustoiduks on õunakook.',
      ], [
        'Jaanil on väike [kohvik].', 'Külmkapis on piim, juust ja natuke [kala].', 'Külmkapis ei ole [liha].', 'Köögivilju on [vähe].',
        'Jaan peab ostma leiba, kartulit ja [õunu].', 'Täna on menüüs [kalasupp].', 'Magustoiduks on [õunakook].',
      ]),
      B.choice('026_p_menu', 'Mida nad võtavad?', 'Loe, mida inimene tahab. Vali sobiv toit või jook.', [
        ['Sofia on taimetoitlane. Mida ta sööb?', 'köögiviljasuppi', 'kanasuppi', 'kalasalatit'],
        ['Mia on kümneaastane. Mida ta joob?', 'piima', 'kohvi', 'õlut'],
        ['Markus ei joo kohvi. Mida ta hommikul joob?', 'teed', 'kohvi', 'kohvi piimaga'],
        ['Kati tahab midagi magusat. Mida ta sööb?', 'õunakooki', 'kalasuppi', 'kartulit'],
        ['Viktor on väga näljane. Mida ta sööb?', 'praadi ja kartulit', 'ühe õuna', 'klaasi vett'],
      ]),
      B.table('026_p_fridge', 'Minu külmkapp.', 'Kirjuta: mis on külmkapis ja mida pead ostma.', 'Külmkapis on, Pean ostma', [' | ', ' | ', ' | ', ' | ', ' | ']),
      B.gaps('026_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Mul on vaja [leiba]. (leib)', 'Kas sa jood [teed]? (tee)', 'Mulle meeldib [salat]. (salat)', 'Ma söön [kala] kaks korda nädalas. (kala)',
        'Jaan ei joo [mahla]. (mahl)', 'Mulle maitseb [supp]. (supp)',
      ]),
      B.transformation('026_p_neg', 'Ütle eitavalt.', 'Kirjuta lause eitavas vormis.', [
        ['Ma söön liha.', 'Ma ei …', 'Ma ei söö liha.'], ['Sofia joob kohvi.', 'Sofia ei …', 'Sofia ei joo kohvi.'], ['Me sööme kala.', 'Me ei …', 'Me ei söö kala.'],
        ['Jaan joob piima.', 'Jaan ei …', 'Jaan ei joo piima.'], ['Mulle meeldib kohv.', 'Mulle ei …', 'Mulle ei meeldi kohv.'], ['Laps sööb suppi.', 'Laps ei …', 'Laps ei söö suppi.'],
      ]),
      B.errorfix('026_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma joon vesi.', 'Ma joon vett.'], ['Mulle meeldib salatit.', 'Mulle meeldib salat.'], ['Ta ei joob kohvi.', 'Ta ei joo kohvi.'],
        ['Ma söön supp.', 'Ma söön suppi.'], ['Me joome tee.', 'Me joome teed.'], ['Mulle ei meeldib liha.', 'Mulle ei meeldi liha.'],
      ]),
      B.dialogue('026_p_dialog', 'Külaline tuleb.', 'Täida dialoog sobivate sõnadega.', 'Anna', 'Sofia', [
        ['A', 'Tere tulemast, Sofia! Kas sa oled [näljane]?'], ['B', 'Jah, natuke. Mida sa teed?'], ['A', 'Ma teen [suppi] ja salatit.'],
        ['B', 'Väga hea! Ma ei söö [liha], tead ju.'], ['A', 'Jah, supis ei ole liha. Mida sa [jood]?'], ['B', 'Palun [teed]. Kohvi ma ei joo.'],
        ['A', 'Ja magustoiduks on [õunakook].'], ['B', 'Mmm, see on kindlasti [maitsev]!'],
      ]),
      B.translation('026_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я не ем мясо.', 'Ты пьёшь чай или кофе?', 'Мне нравятся овощи.', 'Мне нужен хлеб.', 'Утром я ем кашу.', 'Этот салат очень вкусный.']),
      B.dictation('026_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Mul on vaja leiba ja piima.', 'Jaan ei joo mahla.', 'Mulle maitseb supp.', 'Sofia sööb puuvilju.', 'Kas sa jood teed?'], 5),
      B.speaking('026_p_say', 'Küsi paariliselt.', 'Küsi paariliselt toidu kohta. Vasta täislausega.', ['Kas sa sööd liha?', 'Mis jook sulle meeldib?', 'Mida sa hommikul sööd?', 'Mida sa ei söö?', 'Mis on praegu sinu külmkapis?'], [45, 90]),
      B.writing('026_p_write', 'Ostunimekiri ja sõnum.', 'Kirjuta sõbrale 5–7 lauset: mida sa poest ostad ja miks.', [5, 7], ['leib', 'piim', 'vaja', 'meeldib'], 2),
      B.selfcheck('026_p_self', ['Ma kuulen, mis on külmkapis.', 'Ma kirjutan: ma söön leiba, ma joon teed.', 'Ma ütlen eitavalt: ma ei söö liha.', 'Ma kirjutan ostunimekirja.'], 'Külmkapp on täis'),
    ],
    transfer: [
      B.text('026_t_situation', 'Uus olukord', 'Reedel on Kati sünnipäev. Kati kutsub külla kuus sõpra. Sina aitad tal peolauda planeerida. Mõned sõbrad ei söö liha, üks ei joo piima.'),
      B.reading('026_t_msg', 'Loe Kati sõnumit.', 'Loe sõnumit ja vasta küsimustele.', 'Kes mida sööb?',
        'Tere! Aitäh, et aitad mind. Reedel tuleb kuus inimest. Olga on taimetoitlane, ta ei söö liha ega kala. Markus ei joo piima, aga ta sööb kõike muud. Viktorile meeldib väga kala. Liis armastab magusat, talle meeldivad koogid ja puuviljad. Jaan joob ainult vett ja teed, kohvi ta ei joo. Sofia sööb kõike. Mul on kodus leib, juust ja kohv. Kõik muu on vaja osta. Ma tahan teha suppi, kaks salatit ja kooki. Kas sa saad reedel hommikul poodi minna? Mul ei ole aega. Kati',
        [['Mida Olga ei söö?', 'liha ega kala|liha ja kala|liha, kala'], ['Mida Markus ei joo?', 'piima'], ['Mis Viktorile meeldib?', 'kala'], ['Mida Jaan joob?', 'vett ja teed|vett, teed'], ['Mis Katil kodus on?', 'leib, juust ja kohv|leib, juust, kohv'], ['Mida Kati tahab teha?', 'suppi, kaks salatit ja kooki|suppi, salatit ja kooki']]),
      B.manymatch('026_t_menu', 'Mida pakkuda?', 'Ühenda inimene ja talle sobiv toit või jook.', ['Olga (taimetoitlane)', 'Markus (ei joo piima)', 'Viktor', 'Liis', 'Jaan'], ['köögiviljasupp', 'must kohv', 'kalasalat', 'puuviljakook', 'vesi ja tee']),
      B.gaps('026_t_check', 'Kontrolli vorme.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Olga sööb [salatit]. (salat)', 'Jaan joob [vett]. (vesi)', 'Liisile meeldib [kook]. (kook)', 'Markus ei joo [piima]. (piim)', 'Viktor sööb [kala]. (kala)', 'Peol me joome [mahla]. (mahl)',
      ]),
      B.errorfix('026_t_fix', 'Paranda sõnum.', 'Sõbra sõnumis on vead. Kirjuta lause õigesti.', [
        ['Olga ei söö kala ja liha.', 'Olga ei söö kala ega liha.|Olga ei söö liha ega kala.'], ['Markus ei joo piim.', 'Markus ei joo piima.'], ['Viktorile meeldib kalat.', 'Viktorile meeldib kala.'],
        ['Ma ostan leib ja juust.', 'Ma ostan leiba ja juustu.'], ['Liis sööb palju kook.', 'Liis sööb palju kooki.'],
      ]),
      B.table('026_t_list', 'Ostunimekiri.', 'Kirjuta peo ostunimekiri: toit või jook ja kellele.', 'Toit või jook, Kellele?', [' | ', ' | ', ' | ', ' | ', ' | ', ' | ']),
      B.planning('026_t_plan', 'Peomenüü.', 'Planeeri peo menüü.', ['Supp:', 'Salatid:', 'Magustoit:', 'Joogid:'], 2),
      B.letter('026_t_letter', 'Vastus Katile.', 'Kirjuta Katile 40–60 sõna: mida sa ostad ja mis on menüüs.', 'Tere, Kati!', 'Kallistades', [40, 60]),
      B.rolecards('026_t_roles', 'Peol laua ääres.', 'Üks on peoperemees, teine külaline. Paku ja vasta viisakalt.', 'Oled peoperemees. Paku külalisele toitu ja jooki. Küsi, mis talle maitseb.', 'Oled külaline. Sa ei söö liha ja ei joo kohvi. Ütle viisakalt, mida sa tahad.', ['Kas sa soovid…?', 'Palun võta!', 'Kas maitseb?'], ['Aitäh, ma ei söö…', 'Mulle meeldib…', 'Väga maitsev!']),
      B.speaking('026_t_say', 'Minu lemmiktoit.', 'Räägi umbes üks minut oma lemmiktoidust.', ['Mis on sinu lemmiktoit?', 'Millal sa seda sööd?', 'Kes seda teeb?', 'Mis jook sulle meeldib?'], [60, 90], ['Minu lemmiktoit on…', 'Ma söön seda…', 'Mulle maitseb…']),
      B.translation('026_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Что ты будешь пить?', 'Я не ем мясо.', 'Суп очень вкусный!', 'Возьми ещё салат!', 'Мне нравятся фрукты.']),
      B.rubric('026_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Ostunimekirjas on toidud ja joogid kõigile külalistele.', 'Kirjas on tervitus, menüü, ostud ja lõpp.', 'Söön / joon + osastav ja meeldib + nimetav on õiged.', 'Peol pakub ja vastab õpilane viisakalt.']),
      B.selfcheck('026_t_self', ['Ma loen sõnumit külaliste toidust.', 'Ma kirjutan peo ostunimekirja.', 'Ma kirjutan sõbrale menüüst.', 'Ma pakun peol toitu ja jooki.'], 'Pidu on valmis'),
    ],
  },

  'a2-027': {
    title: 'Kui palju? Partitiiv',
    canDo: 'Ma ütlen koguseid (kilo, liiter, pakk, pudel, tass, klaas; palju, vähe, kaks, kolm) koos osastavaga ja kirjutan lihtsa retsepti või ostunimekirja.',
    discover: [
      B.text('027_d_situation', 'Pannkoogid', 'Laupäeval tahab Olga teha pannkooke. Tütar Mia aitab. Retsept on vanas vihikus. Aga kui palju piima on vaja? Kas mune on piisavalt?'),
      B.reading('027_d_read', 'Loe retsepti.', 'Loe retsepti ja vasta küsimustele.', 'Pannkoogid neljale inimesele',
        'Vaja on pool liitrit piima, kolm muna ja kaks klaasi jahu. Veel on vaja üks lusikas suhkrut, natuke soola ja natuke õli. Kõigepealt pane kaussi munad, suhkur ja sool. Sega hästi. Siis vala kaussi pool piima. Lisa jahu ja sega jälle. Lõpuks lisa teine pool piima. Tainas peab olema vedel. Pane pannile natuke õli. Prae pannkooke mõlemalt poolt üks või kaks minutit. Pannkoogid on kõige paremad soojalt. Söö neid moosi või hapukoorega. Mia sööb alati kolm pannkooki ja joob klaasi piima. Olga joob tassi teed. Kui külalisi on rohkem, võta kõike kaks korda rohkem.',
        [['Mitmele inimesele on retsept?', 'neljale|neljale inimesele|4'], ['Kui palju piima on vaja?', 'pool liitrit|pool liitrit piima'], ['Mitu muna on vaja?', 'kolm|kolm muna|3'], ['Kui palju jahu on vaja?', 'kaks klaasi|kaks klaasi jahu'], ['Millega pannkooke süüa?', 'moosi või hapukoorega|moosiga|hapukoorega'], ['Mida Olga joob?', 'tassi teed|teed']]),
      B.vocab('027_d_vocab', 'Kui palju?', ['palju — много', 'vähe — мало', 'natuke — немного', 'kilo — килограмм', 'liiter — литр', 'pool — половина', 'klaas — стакан', 'tass — чашка', 'pudel — бутылка', 'pakk — пачка', 'lusikas — ложка', 'jahu — мука', 'suhkur — сахар', 'sool — соль', 'muna — яйцо', 'retsept — рецепт']),
      B.notice('027_d_notice', 'Märka: kogus + osastav', ['liiter **piima**, pakk **võid**, pudel **mahla**', 'tass **teed**, klaas **vett**, tükk **kooki**', 'kilo **kartuleid**, kilo **õunu** (palju tükke)', '**palju** suhkrut, **vähe** soola, **natuke** juustu', '**kaks** muna, **kolm** õuna (2, 3, 4 … + osastav)', 'Külmkapis **on piima**. (natuke, mitte kogu piim)']),
      B.choice('027_d_choice', 'Vali õige vorm.', 'Vali lünka sobiv sõna.', [
        ['Palun liiter ___.', 'piima', 'piim', 'piimad'], ['Mul on vaja kolm ___.', 'muna', 'munad', 'munaga'], ['Ma joon klaasi ___.', 'vett', 'vesi', 'vee'],
        ['Tassis on palju ___.', 'teed', 'tee', 'teel'], ['Kilo ___, palun.', 'kartuleid', 'kartul', 'kartulid'], ['Kohvi sisse panen natuke ___.', 'suhkrut', 'suhkur', 'suhkrud'],
      ], 'full', 'g_notice'),
      B.wordforms('027_d_forms', 'Kogus + osastav', 'Kirjuta sõna osastavas.', [
        ['piim', 'liiter …', 'piima'], ['vesi', 'klaas …', 'vett'], ['tee', 'tass …', 'teed'], ['või', 'pakk …', 'võid'],
        ['mahl', 'pudel …', 'mahla'], ['muna', 'kolm …', 'muna'], ['kartulid', 'kilo …', 'kartuleid'], ['juust', 'pool kilo …', 'juustu'],
      ]),
      B.match('027_d_match', 'Küsimus ja vastus.', 'Ühenda küsimus ja vastus retsepti järgi.', [
        ['Kui palju piima on vaja?', 'Pool liitrit.'], ['Mitu muna on vaja?', 'Kolm muna.'], ['Kas suhkrut on palju?', 'Ei, ainult üks lusikas.'],
        ['Mida Mia joob?', 'Klaasi piima.'], ['Mida Olga joob?', 'Tassi teed.'], ['Mitu pannkooki Mia sööb?', 'Kolm pannkooki.'],
      ], 'full', 'g_read'),
      B.gaps('027_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Jaan joob päevas [palju] kohvi: viis tassi.', 'Mia sööb [vähe] liha, ainult natuke.', 'Retseptis on pool [liitrit] piima.',
        'Palun üks [pakk] võid.', 'Mul on vaja kuus [muna].', 'Ma joon [klaasi] vett.',
      ], ['palju', 'vähe', 'liitrit', 'pakk', 'muna', 'klaasi', 'pudel', 'kilo']),
      B.transformation('027_d_trans', 'Kirjuta kogusega.', 'Kirjuta lause sulgudes oleva kogusega.', [
        ['Palun piima. (1 l)', 'Palun …', 'Palun liiter piima.|Palun üks liiter piima.'], ['Ma joon vett. (1 klaas)', 'Ma joon …', 'Ma joon klaasi vett.'],
        ['Palun teed. (1 tass)', 'Palun …', 'Palun tass teed.|Palun üks tass teed.'], ['Palun kartuleid. (2 kg)', 'Palun …', 'Palun kaks kilo kartuleid.'],
        ['Retseptis on mune. (3)', 'Retseptis on …', 'Retseptis on kolm muna.'], ['Palun võid. (1 pakk)', 'Palun …', 'Palun pakk võid.|Palun üks pakk võid.'],
      ]),
      B.errorfix('027_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Palun liiter piim.', 'Palun liiter piima.'], ['Mul on vaja kaks munad.', 'Mul on vaja kaks muna.'], ['Ma joon klaas vesi.', 'Ma joon klaasi vett.'],
        ['Kilo kartulid, palun.', 'Kilo kartuleid, palun.'], ['Ta sööb palju suhkur.', 'Ta sööb palju suhkrut.'],
      ]),
      B.translation('027_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Литр молока, пожалуйста.', 'Мне нужно три яйца.', 'Я пью стакан воды.', 'Чашку чая, пожалуйста.', 'Он ест мало мяса.', 'В холодильнике есть сыр.']),
      B.dictation('027_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Palun pool liitrit piima.', 'Mul on vaja kolm muna.', 'Mia joob klaasi piima.', 'Kilo kartuleid, palun.', 'Pane natuke soola.'], 5),
      B.speaking('027_d_say', 'Minu retsept.', 'Räägi paarilisele lihtsast retseptist.', ['Mis toitu sa oskad teha?', 'Mida on vaja?', 'Kui palju on vaja?', 'Mitmele inimesele see on?'], [60, 90], ['Vaja on…', 'kaks muna, liiter piima', 'natuke soola']),
      B.writing('027_d_write', 'Ostunimekiri.', 'Kirjuta 5–7 lauset: mida on pannkookide jaoks vaja ja kui palju.', [5, 7], ['vaja', 'liiter', 'muna', 'natuke'], 2),
      B.selfcheck('027_d_self', ['Ma loen retsepti ja leian kogused.', 'Ma ütlen: liiter piima, kilo kartuleid.', 'Ma ütlen: kaks muna, kolm õuna.', 'Ma kirjutan ostunimekirja kogustega.'], 'Kogused on selged'),
    ],
    practice: [
      B.listening('027_p_listen', 'Kuulamine. Turul.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Markus! Mida sa täna soovid?', '— Tere! Palun kaks kilo kartuleid.', '— Kas veel midagi?', '— Jah, üks kilo õunu ja pool kilo tomateid.',
        '— Meil on täna ka värsket kala.', '— Aitäh, kala ma ei taha. Aga palun kümme muna.', '— Kokku on üheksa eurot.', '— Palun, siin on kümme eurot.',
      ], [
        'Markus ostab kaks kilo [kartuleid].', 'Õunu on vaja üks [kilo].', 'Tomateid on vaja [pool] kilo.', 'Müüjal on täna värsket [kala].',
        'Markus ostab [kümme|10] muna.', 'Kokku maksab ta [üheksa|9] eurot.',
      ]),
      B.gaps('027_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna osastavas.', [
        'Palun pudel [mahla]. (mahl)', 'Mul on vaja pakk [võid]. (või)', 'Klaasis on natuke [vett]. (vesi)', 'Ma joon päevas kolm tassi [kohvi]. (kohv)',
        'Retseptis on kaks [muna]. (muna)', 'Pane supi sisse natuke [soola]. (sool)', 'Kilo [õunu] maksab kaks eurot. (õunad)',
      ]),
      B.cloze('027_p_cloze', 'Ostunimekiri.', 'Vali igasse lünka sobiv sõna.', 'Olga sõnum mehele', [
        'Täna on vaja osta {*liiter|kilo|tükk} piima ja {*pakk|liiter|klaas} võid.', 'Pannkookide jaoks on vaja kuus {*muna|munad|munaga}.',
        'Sa jood palju {*kohvi|kohv|kohvid}, osta suur pakk.', 'Mia tahab {*mahla|mahl|mahlad}, osta kaks pudelit.', 'Ja ära unusta {*leiba|leib|leivad}!',
      ]),
      B.table('027_p_table', 'Kui palju on vaja?', 'Retsept on neljale. Kirjuta kogused kaheksale inimesele.', 'Neljale, Kaheksale', [
        'pool liitrit piima | [liiter piima/üks liiter piima]', 'kolm muna | [kuus muna]', 'kaks klaasi jahu | [neli klaasi jahu]', 'üks lusikas suhkrut | [kaks lusikat suhkrut]', 'üks pakk võid | [kaks pakki võid]',
      ], 'g_notice'),
      B.transformation('027_p_more', 'Üks → mitu.', 'Kirjuta kogus antud arvuga.', [
        ['üks muna', 'kaks …', 'kaks muna'], ['üks õun', 'kolm …', 'kolm õuna'], ['üks tass kohvi', 'kaks …', 'kaks tassi kohvi'],
        ['üks pudel mahla', 'kolm …', 'kolm pudelit mahla'], ['üks kilo kartuleid', 'kaks …', 'kaks kilo kartuleid'], ['üks euro', 'viis …', 'viis eurot'],
      ]),
      B.errorfix('027_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Kaks tass kohvi, palun.', 'Kaks tassi kohvi, palun.'], ['Mul on vaja kolm munad.', 'Mul on vaja kolm muna.'], ['Palun pudel vesi.', 'Palun pudel vett.'],
        ['Ta joob palju piim.', 'Ta joob palju piima.'], ['Kilo õunad maksab kaks eurot.', 'Kilo õunu maksab kaks eurot.'], ['Retseptis on natuke sool.', 'Retseptis on natuke soola.'],
      ]),
      B.dialogue('027_p_dialog', 'Kohvikus: kui palju?', 'Täida dialoog sobivate sõnadega.', 'Jaan', 'Anna', [
        ['A', 'Tere, Anna! Mida sulle täna?'], ['B', 'Tere, Jaan! Palun üks tass [teed].'], ['A', 'Kas suhkrut ka?'],
        ['B', 'Jah, natuke [suhkrut], ainult üks lusikas.'], ['A', 'Ja süüa?'], ['B', 'Palun üks tükk [kooki].'],
        ['A', 'Kas klaas [vett] ka?'], ['B', 'Jah, palun. Mul on janu.'], ['A', 'Kokku on kolm [eurot].'],
      ]),
      B.wordorder('027_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Palun kaks kilo kartuleid.', 'Mul on vaja pool liitrit piima.', 'Jaan joob päevas viis tassi kohvi.', 'Külmkapis on natuke juustu.', 'Retseptis on kolm muna.']),
      B.translation('027_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Литр молока, пожалуйста.', 'Мне нужно два кило картошки.', 'Я пью много воды.', 'Чашку чая, пожалуйста.', 'Три яйца и пачку масла.', 'Он ест мало сахара.']),
      B.dictation('027_p_dict', 'Etteütlus. Kogused.', 'Kuula ja kirjuta laused numbritega.', ['Palun 2 kilo kartuleid.', 'Mul on vaja 6 muna.', 'Ma ostan 3 pudelit vett.', 'Retseptis on pool liitrit piima.', 'Palun 1 pakk võid.', 'Kokku on 9 eurot.'], 6),
      B.speaking('027_p_say', 'Mida sa ostad?', 'Paariline on müüja. Ütle, mida ja kui palju sa ostad.', ['Sa teed suppi neljale inimesele.', 'Sa teed pannkooke.', 'Sul tulevad külalised: kohv ja kook.'], [60, 90], ['Palun kilo…', 'Mul on vaja…', 'Kas teil on…?']),
      B.writing('027_p_write', 'Minu retsept.', 'Kirjuta lihtne retsept 5–7 lausega: mida ja kui palju on vaja.', [5, 7], ['vaja', 'kilo', 'natuke'], 2),
      B.selfcheck('027_p_self', ['Ma kuulen turul kogust ja hinda.', 'Ma kirjutan sõna osastavas pärast kogust.', 'Ma arvutan retsepti kahele korrale.', 'Ma ostan õige koguse.'], 'Kogused on õiged'),
    ],
    transfer: [
      B.text('027_t_situation', 'Uus olukord', 'Laupäeval on eesti keele kursuse piknik. Iga inimene toob midagi. Sina pead ostma joogid ja puuviljad kaheteistkümnele inimesele. Raha on 30 eurot.'),
      B.listening('027_t_listen', 'Kuula õpetaja sõnumit.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin on Kadri, teie õpetaja.', 'Laupäeval on meie piknik pargis kell kaksteist.', 'Meid on kokku kaksteist inimest.', 'Olga toob kaks suurt salatit.',
        'Viktor toob leiba ja juustu.', 'Sina too palun joogid: kuus pudelit vett ja kolm liitrit mahla.', 'Ja palun too ka kaks kilo õunu.', 'Kohvi ei ole vaja.',
      ], [
        'Piknik on pargis kell [kaksteist|12].', 'Piknikul on [kaksteist|12] inimest.', 'Olga toob kaks [salatit].', 'Viktor toob leiba ja [juustu].',
        'Sina tood kuus pudelit [vett].', 'Mahla on vaja kolm [liitrit].', 'Õunu on vaja kaks [kilo].',
      ]),
      B.reading('027_t_ad', 'Loe poe pakkumist.', 'Loe pakkumist ja vasta küsimustele.', 'Toidupood Mari: nädala pakkumised',
        'Tere tulemast Toidupoodi Mari! Sel nädalal on meil head hinnad. Suur pudel vett maksab 0,59 eurot. Kui ostad kolm pudelit, maksad ainult kahe eest. Liiter õunamahla maksab 1,49 eurot. Eesti õunad maksavad 1,20 eurot kilo. Banaanid maksavad 1,40 eurot kilo. Must leib maksab 1,30 eurot. Pakk juustu maksab 3,90 eurot. Kohv on täna kakskümmend protsenti odavam. Pood on avatud iga päev kell 8–22. Kassas saab maksta kaardiga ja sularahas. Pakkumised kehtivad pühapäevani. Kliendikaardiga saad veel viis protsenti soodsamalt. Uued puuviljad tulevad poodi igal hommikul.',
        [['Kui palju maksab liiter õunamahla?', '1,49 eurot|1,49'], ['Kui palju maksab kilo õunu?', '1,20 eurot|1,20'], ['Mitu pudelit vett saad kahe hinnaga?', 'kolm|kolm pudelit|3'], ['Kui palju maksavad kaks kilo õunu?', '2,40 eurot|2,40'], ['Mis on täna odavam?', 'kohv'], ['Kuni mis päevani kehtivad pakkumised?', 'pühapäevani']]),
      B.table('027_t_list', 'Ostunimekiri pikniku jaoks.', 'Kirjuta, mida ostad, kui palju ja mis see maksab.', 'Toode, Kogus, Hind', [' |  | ', ' |  | ', ' |  | ', ' |  | ', ' |  | ']),
      B.gaps('027_t_check', 'Kontrolli koguseid.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma toon kuus pudelit [vett]. (vesi)', 'Mahla on vaja kolm [liitrit]. (liiter)', 'Palun kaks kilo [õunu]. (õunad)',
        'Olga toob kaks [salatit]. (salat)', 'Viktor toob palju [leiba]. (leib)', 'Pikniku jaoks on vaja natuke [juustu]. (juust)',
      ]),
      B.wordorder('027_t_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Ma toon kuus pudelit vett.', 'Mahla on vaja kolm liitrit.', 'Kolm pudelit maksab kahe hinnaga.', 'Kohvi ei ole vaja.', 'Õunad maksavad kokku 2,40 eurot.']),
      B.planning('027_t_plan', 'Kas raha jätkub?', 'Arvuta ja kirjuta märksõnad.', ['Mida sa ostad?', 'Kui palju see kokku maksab?', 'Kui palju raha jääb 30 eurost alles?'], 2),
      B.letter('027_t_letter', 'Sõnum grupile.', 'Kirjuta grupile 40–60 sõna: mida sa tood, kui palju ja mis see maksab.', 'Tere, kõik!', 'Kohtumiseni pargis!', [40, 60]),
      B.rolecards('027_t_roles', 'Turul.', 'Üks on ostja, teine müüja. Ostke pikniku jaoks.', 'Oled ostja. Sul on 30 eurot. Osta vett, mahla ja õunu 12 inimesele. Küsi hinda.', 'Oled müüja. Õunad maksavad 1,50 eurot kilo, mahl 2 eurot liiter. Paku ka midagi muud.', ['Palun kaks kilo…', 'Kui palju see maksab?', 'Kas teil on…?'], ['Mida te soovite?', 'Kas veel midagi?', 'Kokku on…']),
      B.speaking('027_t_say', 'Pikniku plaan.', 'Räägi grupile, mida ja kui palju sa tood.', ['Mida sa tood?', 'Kui palju?', 'Mis see maksab?', 'Mida on veel vaja?'], [45, 90]),
      B.translation('027_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я принесу шесть бутылок воды.', 'Нам нужно три литра сока.', 'Два кило яблок, пожалуйста.', 'Сколько это стоит?', 'Кофе не нужен.']),
      B.rubric('027_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Ostunimekirjas on kogus ja hind.', 'Raha jätkub: kokku kuni 30 eurot.', 'Kogused on õiges vormis (kuus pudelit vett, kaks kilo õunu).', 'Sõnum grupile on arusaadav (40–60 sõna).', 'Turul küsib õpilane hinda ja ütleb koguse.']),
      B.selfcheck('027_t_self', ['Ma kuulen, mida ja kui palju on vaja.', 'Ma loen poe pakkumist ja hindu.', 'Ma kirjutan ostunimekirja kogustega.', 'Ma ostan turul õige koguse.'], 'Piknik on valmis'),
    ],
  },

  'a2-028': {
    title: 'Kohvikus',
    canDo: 'Ma tellin kohvikus süüa ja juua, küsin menüü ja toidu koostise kohta ning palun arvet 8–10 repliigiga dialoogis.',
    discover: [
      B.text('028_d_situation', 'Jaani kohvikus', 'Kell on üks päeval. Markus ja Olga tulevad lõunale Jaani kohvikusse. Kohvikus on palju inimesi. Kelner Liis toob menüü. Olga on taimetoitlane, Markus on väga näljane.'),
      B.dialogue('028_d_dialog', 'Kohvikus.', 'Loe dialoogi. Täida lüngad.', 'Liis', 'Olga', [
        ['A', 'Tere! Siin on [menüü]. Mida te soovite juua?'], ['B', 'Tere! Palun mulle üks tee. Kas teil on [taimetoitu]?'], ['A', 'Jah, meil on köögiviljasupp ja seenepraad.'],
        ['B', 'Mis selles supis on? Mis on supi [koostis]?'], ['A', 'Kartul, porgand, kapsas ja natuke koort.'], ['B', 'Hästi, ma [soovin] suppi.'],
        ['A', 'Kas magustoitu ka?'], ['B', 'Jah, üks [koogitükk], palun.'], ['A', 'Kas veel midagi?'], ['B', 'Ei, aitäh. Kas ma saan kaardiga [maksta]?'],
      ]),
      B.vocab('028_d_vocab', 'Kohvikus', ['kohvik — кафе', 'menüü — меню', 'kelner — официант', 'soovima — желать', 'tellima — заказывать', 'praad — горячее блюдо', 'magustoit — десерт', 'koogitükk — кусок торта', 'taimetoitlane — вегетарианец', 'koostis — состав', 'arve — счёт', 'maksma — платить', 'sularaha — наличные', 'kaardiga — картой']),
      B.reading('028_d_menu', 'Loe menüüd.', 'Loe teksti ja vasta küsimustele.', 'Jaani kohvik: päevapakkumine',
        'Jaani kohvik on avatud iga päev kell 8–20. Päevapakkumine on kell 11–15. Supp ja praad koos maksavad 8 eurot. Täna on supp kanasupp või köögiviljasupp. Praad on kala kartulitega või seenepraad riisiga. Seenepraad on taimetoitlastele. Magustoit on õunakook või jäätis, see maksab 3 eurot. Kohv maksab 2 eurot, tee 1,50 eurot ja mahl 2,50 eurot. Vesi on tasuta. Lastele on väike portsjon poole hinnaga. Maksta saab kaardiga ja sularahas. Laupäeval ja pühapäeval päevapakkumist ei ole. Kohvikus on ka lastenurk ja tasuta wifi. Tere tulemast!',
        [['Mis kell on päevapakkumine?', 'kell 11–15|11–15'], ['Kui palju maksavad supp ja praad koos?', '8 eurot|kaheksa eurot'], ['Mis praad on taimetoitlastele?', 'seenepraad|seenepraad riisiga'], ['Kui palju maksab tee?', '1,50 eurot|1,50'], ['Kui palju maksab vesi?', 'tasuta|see on tasuta|vesi on tasuta'], ['Millal ei ole päevapakkumist?', 'laupäeval ja pühapäeval|nädalavahetusel']]),
      B.notice('028_d_notice', 'Märka: kuidas tellida', ['Tellimine: **Ma soovin** tassi kohvi. **Palun mulle** üks tee.', 'Küsimine: **Kas teil on** taimetoitu? **Mis** selles supis **on**?', 'Valik: **Ma võtan** praadi. **Magustoiduks** jäätist.', 'Lõpp: **Arve, palun!** **Kas ma saan kaardiga maksta?**', 'Kelner: **Mida te soovite?** **Kas veel midagi?** **Head isu!**']),
      B.categorize('028_d_who', 'Kelner või klient?', 'Kes seda ütleb? Pane laused õigesse rühma.', [
        ['Kelner', ['Mida te soovite?', 'Kas veel midagi?', 'Head isu!', 'Siin on teie arve.']], ['Klient', ['Palun arve!', 'Ma soovin teed.', 'Kas teil on taimetoitu?', 'Palun mulle üks kohv.']],
      ], 'full', 'g_use'),
      B.match('028_d_match', 'Küsimus ja vastus.', 'Ühenda küsimus ja vastus.', [
        ['Mida te soovite juua?', 'Palun üks tee.'], ['Kas teil on taimetoitu?', 'Jah, seenepraad.'], ['Mis supis on?', 'Kartul ja porgand.'],
        ['Kas veel midagi?', 'Ei, aitäh.'], ['Kas saab kaardiga maksta?', 'Jah, kaart sobib.'], ['Kas maitses?', 'Väga hea, aitäh!'],
      ], 'full', 'g_use'),
      B.choice('028_d_choice', 'Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sa tahad tellida kohvi.', 'Palun mulle üks kohv.', 'Arve, palun.', 'Head isu!'],
        ['Sa tahad maksta.', 'Arve, palun!', 'Mida te soovite?', 'Palun menüü!'],
        ['Sa ei söö liha.', 'Kas teil on taimetoitu?', 'Kas teil on praadi?', 'Kas teil on kana?'],
        ['Sa ei tea, mis supis on.', 'Mis selles supis on?', 'Kus on supp?', 'Kas supp on kuum?'],
        ['Sul on ainult sularaha.', 'Kas ma saan sularahas maksta?', 'Kas ma saan kaardiga maksta?', 'Kas ma saan seda tellida?'],
      ], 'full', 'g_use'),
      B.gaps('028_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Vabandust, kas ma saaksin [menüü]?', 'Ma [soovin] tassi teed.', 'Mis on selle salati [koostis]?', 'Ma võtan [magustoiduks] jäätist.',
        'Ma olen [taimetoitlane], ma ei söö liha.', 'Palun [arve]!', 'Ma [maksan] kaardiga.',
      ], ['menüü', 'soovin', 'koostis', 'magustoiduks', 'taimetoitlane', 'arve', 'maksan', 'kelner', 'praad']),
      B.wordorder('028_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Ma soovin tassi kohvi.', 'Kas teil on taimetoitu?', 'Palun mulle üks koogitükk.', 'Kas ma saan kaardiga maksta?', 'Mis on supi koostis?']),
      B.transformation('028_d_polite', 'Ütle viisakalt.', 'Kirjuta viisakas lause.', [
        ['Too kohvi!', 'Palun mulle …', 'Palun mulle üks kohv.|Palun mulle kohvi.'], ['Anna menüü!', 'Kas ma saaksin …?', 'Kas ma saaksin menüü?'],
        ['Ma tahan teed.', 'Ma soovin …', 'Ma soovin teed.'], ['Arve!', '… palun!', 'Arve, palun!'], ['Kas on suppi?', 'Kas teil on …?', 'Kas teil on suppi?'],
      ]),
      B.translation('028_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Меню, пожалуйста.', 'Я хочу чашку кофе.', 'У вас есть вегетарианская еда?', 'Что в этом салате?', 'Счёт, пожалуйста.', 'Можно заплатить картой?']),
      B.dictation('028_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma soovin tassi teed.', 'Kas teil on taimetoitu?', 'Mis on supi koostis?', 'Palun mulle üks koogitükk.', 'Arve, palun!'], 5),
      B.speaking('028_d_say', 'Kohvikus.', 'Paariline on kelner. Telli lõuna ja jook.', ['Küsi menüüd.', 'Telli supp või praad.', 'Küsi, mis toidus on.', 'Telli jook ja magustoit.', 'Palu arvet.'], [60, 120], ['Ma soovin…', 'Kas teil on…?', 'Arve, palun!']),
      B.writing('028_d_write', 'Kohviku dialoog.', 'Kirjuta kohviku dialoog: klient ja kelner, 6–8 repliiki.', [6, 8], ['soovin', 'palun', 'arve'], 2),
      B.selfcheck('028_d_self', ['Ma loen kohviku menüüd.', 'Ma tellin: Ma soovin…, Palun mulle…', 'Ma küsin: Kas teil on…? Mis selles on?', 'Ma palun arvet ja maksan.'], 'Tellimine on selge'),
    ],
    practice: [
      B.listening('028_p_listen', 'Kuulamine. Tellimus.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Liis: Tere! Kas te olete valmis tellima?', 'Viktor: Jah. Palun mulle kanasupp ja kala kartulitega.', 'Liis: Vabandust, kala on täna otsas.',
        'Viktor: Kahju. Mis praad teil veel on?', 'Liis: Meil on seenepraad riisiga.', 'Viktor: Hea küll, siis seenepraad. Ja klaas õunamahla.',
        'Liis: Kas magustoitu ka?', 'Viktor: Jah, üks jäätis, palun. Ja arve kohe, ma kiirustan.',
      ], [
        'Viktor soovib kanasuppi ja [kala] kartulitega.', 'Kala on täna [otsas].', 'Seenepraad on [riisiga].', 'Juua võtab Viktor klaasi [õunamahla].',
        'Magustoiduks võtab ta [jäätise|jäätist|jäätis].', 'Viktor palub arve kohe, sest ta [kiirustab].',
      ]),
      B.crossword('028_p_cross', 'Kohviku sõnad.', 'Kirjuta sõna vihje järgi.', [
        ['Ta toob toidu lauale', 'kelner'], ['Siin on toidud ja hinnad', 'menüü'], ['Paber, kus on summa', 'arve'], ['Soe toit, nt kala kartulitega', 'praad'],
        ['Kook või jäätis pärast sööki', 'magustoit'], ['Mis on toidus sees?', 'koostis'], ['Raha paberil ja müntidena', 'sularaha'],
      ]),
      B.manymatch('028_p_answer', 'Mida vastata?', 'Ühenda kelneri küsimus ja kliendi vastus.', ['Mida te soovite juua?', 'Kas soovite magustoitu?', 'Kas maitses?', 'Kuidas te maksate?', 'Kas soovite veel midagi?'], ['Palun klaas mahla.', 'Jah, üks koogitükk.', 'Väga maitsev, aitäh!', 'Kaardiga, palun.', 'Ei, aitäh. Arve, palun.']),
      B.wordforms('028_p_forms', 'Ma soovin …', 'Kirjuta sõna osastavas: Ma soovin …', [
        ['kohv', 'Ma soovin …', 'kohvi'], ['tee', 'Ma soovin …', 'teed'], ['supp', 'Ma soovin …', 'suppi'], ['salat', 'Ma soovin …', 'salatit'],
        ['praad', 'Ma soovin …', 'praadi'], ['jäätis', 'Ma soovin …', 'jäätist'], ['mahl', 'Ma soovin …', 'mahla'], ['vesi', 'Ma soovin …', 'vett'],
      ]),
      B.errorfix('028_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma soovin tee.', 'Ma soovin teed.'], ['Palun mulle üks kohvi.', 'Palun mulle üks kohv.'], ['Kas teil on supp?', 'Kas teil on suppi?'],
        ['Ma tahan maksan kaardiga.', 'Ma tahan kaardiga maksta.|Ma tahan maksta kaardiga.'], ['Kas ma saan sularaha maksta?', 'Kas ma saan sularahas maksta?'], ['Mis on see salati koostis?', 'Mis on selle salati koostis?'],
      ]),
      B.dialogue('028_p_dialog', 'Toit on otsas.', 'Täida dialoog sobivate sõnadega.', 'Jaan', 'Sofia', [
        ['A', 'Tere! Mida te soovite?'], ['B', 'Tere! Palun mulle [seenepraad].'], ['A', 'Vabandust, seenepraadi täna ei [ole].'],
        ['B', 'Kahju. Mida te soovitate?'], ['A', 'Köögiviljasupp on väga [maitsev].'], ['B', 'Kas supis on [liha]?'],
        ['A', 'Ei, supp on ilma lihata.'], ['B', 'Hästi, siis [suppi], palun.'],
      ]),
      B.table('028_p_order', 'Tellimuse leht.', 'Kuula paarilise tellimust ja kirjuta see tabelisse.', 'Mida?, Kui palju?', [' | ', ' | ', ' | ', ' | ']),
      B.translation('028_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Мне, пожалуйста, суп.', 'Рыбы сегодня нет.', 'Что вы посоветуете?', 'Я плачу наличными.', 'Десерт не нужен, спасибо.', 'Было очень вкусно!']),
      B.dictation('028_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kala on täna otsas.', 'Palun mulle seenepraad.', 'Kas supis on liha?', 'Ma maksan kaardiga.', 'Väga maitsev, aitäh!'], 5),
      B.rolecards('028_p_roles', 'Kelner ja klient.', 'Mängige kohvikus. Siis vahetage rollid.', 'Oled klient. Telli supp, praad ja jook. Küsi, mis praes on. Palu arvet.', 'Oled kelner. Anna menüü ja võta tellimus vastu. Üks praad on otsas.', ['Ma soovin…', 'Mis selles on?', 'Arve, palun!'], ['Mida te soovite?', 'Vabandust, … on otsas.', 'Head isu!']),
      B.speaking('028_p_say', 'Minu tellimus.', 'Ütle paarilisele, mida sa tellid ja miks.', ['Mida sa jood?', 'Mida sa sööd?', 'Kas sa võtad magustoitu?', 'Kuidas sa maksad?'], [45, 75]),
      B.writing('028_p_write', 'Kohvik meie tänaval.', 'Kirjuta 5–7 lauset: mis kohvik see on ja mida sa seal tellid.', [5, 7], ['kohvik', 'tellin', 'maksab'], 2),
      B.selfcheck('028_p_self', ['Ma kuulen, mida klient tellib.', 'Ma ütlen: Ma soovin teed, suppi, praadi.', 'Ma tellin midagi muud, kui toit on otsas.', 'Ma mängin kelnerit ja klienti.'], 'Kohvikus olen kindel'),
    ],
    transfer: [
      B.text('028_t_situation', 'Uus olukord', 'Sinu sõbranna on külas Riiast. Ta ei räägi eesti keelt. Te lähete Tartus kohvikusse Mesi. Sina loed menüüd ja tellid mõlemale.'),
      B.reading('028_t_menu', 'Loe menüüd.', 'Loe kohviku Mesi menüüd ja vasta küsimustele.', 'Kohvik Mesi',
        'Kohvik Mesi asub vanalinnas, raekoja lähedal. Kohvik on avatud iga päev kell 9–21. Hommikusöök on kuni kella 12-ni. Puder marjadega maksab 4 eurot, omlett juustuga 5 eurot. Lõunaks on seljanka 5 eurot ja kanapraad kartulitega 9 eurot. Lõhe köögiviljadega maksab 12 eurot. Taimetoitlastele on läätsesupp 5 eurot ja köögiviljavokk 8 eurot. Magustoit on kohupiimakook 3,50 eurot või šokolaadikook 4 eurot. Kohv maksab 2,50 eurot ja tee 2 eurot. Lastele on pannkoogid moosiga, 4 eurot. Kui sul on allergia, küsi kelnerilt toidu koostist.',
        [['Kuni mis kellani on hommikusöök?', 'kella 12-ni|12-ni|kella kaheteistkümneni'], ['Mida saab süüa taimetoitlane?', 'läätsesuppi või köögiviljavokki|läätsesupp või köögiviljavokk|läätsesuppi|köögiviljavokki'], ['Kui palju maksab kanapraad?', '9 eurot|üheksa eurot'], ['Mis on menüüs lastele?', 'pannkoogid moosiga|pannkoogid'], ['Kellelt küsida toidu koostist?', 'kelnerilt']]),
      B.choice('028_t_friend', 'Mida sõber saab võtta?', 'Loe sõbra soovi. Vali menüüst sobiv toit.', [
        ['Sõber ei söö liha ega kala.', 'läätsesupp', 'seljanka', 'lõhe köögiviljadega'],
        ['Sõber tahab hommikul putru.', 'puder marjadega', 'omlett juustuga', 'kanapraad'],
        ['Sõber tahab kala.', 'lõhe köögiviljadega', 'kanapraad', 'köögiviljavokk'],
        ['Sõber tahab magustoitu, aga mitte šokolaadi.', 'kohupiimakook', 'šokolaadikook', 'seljanka'],
        ['Sõbral on ainult 4 eurot.', 'puder marjadega', 'seljanka', 'omlett juustuga'],
      ]),
      B.listening('028_t_listen', 'Kuula kelnerit.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Liis, teie kelner täna.', 'Täna on päevasupp seljanka.', 'Seljankas on liha, aga meil on ka läätsesupp.',
        'Kala on täna väga värske: lõhe köögiviljadega.', 'Kohupiimakook on otsas, aga šokolaadikook on olemas.', 'Kohvi saab tasuta juurde.',
      ], ['Kelneri nimi on [Liis].', 'Päevasupp on [seljanka].', 'Seljankas on [liha].', 'Lõhe on täna väga [värske].', 'Kohupiimakook on [otsas].']),
      B.table('028_t_order', 'Tellimus kahele.', 'Kirjuta, mida sa tellid endale ja sõbrale.', 'Kellele?, Toit, Jook', ['mina |  | ', 'sõber |  | ', 'magustoit |  | ']),
      B.dialogue('028_t_dialog', 'Telefonis: laua broneerimine.', 'Täida dialoog sobivate sõnadega.', 'Kohvik Mesi', 'Markus', [
        ['A', 'Kohvik Mesi, tere!'], ['B', 'Tere! Kas ma saan laua [broneerida]?'], ['A', 'Muidugi. Mis [päeval]?'], ['B', 'Laupäeval kell seitse õhtul.'],
        ['A', 'Mitmele [inimesele]?'], ['B', 'Neljale. Üks meist on [taimetoitlane].'], ['A', 'Pole probleemi. Meil on ka taimetoitu.'],
        ['B', 'Väga hea. Kas saab [kaardiga] maksta?'], ['A', 'Jah, muidugi. Mis on teie [nimi]?'], ['B', 'Markus Koval. Aitäh, [nägemist]!'],
      ]),
      B.errorfix('028_t_fix', 'Paranda tellimus.', 'Kirjuta lause õigesti.', [
        ['Ma soovin läätsesupp.', 'Ma soovin läätsesuppi.'], ['Minu sõber ei söö liha ja kala.', 'Minu sõber ei söö liha ega kala.'], ['Palun mulle kaks kohvid.', 'Palun mulle kaks kohvi.'],
        ['Kas teil on kohupiimakook?', 'Kas teil on kohupiimakooki?'], ['Me maksame kaart.', 'Me maksame kaardiga.'],
      ]),
      B.translation('028_t_tr', 'Sõbra soovid.', 'Sõber ütleb vene keeles. Kirjuta eesti keeles.', ['Я не ем мясо.', 'Мне, пожалуйста, чай без сахара.', 'Что в этом супе?', 'Я хочу десерт.', 'Можно счёт?']),
      B.planning('028_t_plan', 'Enne tellimist.', 'Kirjuta märksõnad.', ['Mida sina tellid?', 'Mida tellid sõbrale?', 'Mida sa küsid kelnerilt?'], 2),
      B.rolecards('028_t_roles', 'Kohvikus Mesi.', 'Üks on klient, teine kelner. Tellige kahele.', 'Oled klient. Telli endale ja sõbrale. Sõber ei söö liha. Küsi koostist ja palu arvet.', 'Oled kelner. Võta tellimus vastu. Üks toit on otsas: paku midagi muud.', ['Me soovime…', 'Mis selles on?', 'Arve, palun!'], ['Mida te soovite?', 'Kahjuks on … otsas.', 'Kas veel midagi?']),
      B.speaking('028_t_say', 'Minu lemmikkohvik.', 'Räägi umbes üks minut oma lemmikkohvikust.', ['Kus see asub?', 'Mida sa seal tellid?', 'Kui palju see maksab?', 'Miks see sulle meeldib?'], [60, 90]),
      B.writing('028_t_review', 'Arvustus.', 'Kirjuta kohvikust 6–8 lauset: mida te sõite ja kuidas maitses.', [6, 8], ['tellisin', 'maitses', 'maksis'], 2),
      B.rubric('028_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Õpilane tellib endale ja sõbrale sobiva toidu.', 'Tellimuses on Ma soovin… / Palun mulle… / Kas teil on…?', 'Õpilane küsib koostist ja palub arvet.', 'Arvustuses on vähemalt kuus arusaadavat lauset.']),
      B.selfcheck('028_t_self', ['Ma loen võõrast menüüd.', 'Ma tellin endale ja sõbrale.', 'Ma broneerin telefonis laua.', 'Ma kirjutan kohvikust arvustuse.'], 'Kohvikus ilma abita'),
    ],
  },

  'a2-029': {
    title: 'Tellimus ja arve',
    canDo: 'Ma saan kahe kuulamise järel aru tellimusest, hindadest ja muudatustest, kontrollin arvet ja ütlen, kui seal on viga.',
    discover: [
      B.text('029_d_situation', 'Arve', 'Markus ja Viktor söövad Jaani kohvikus lõunat. Lõpus toob kelner arve. Markus loeb arvet ja imestab: kokku 36 eurot? Nad ei tellinud ju magustoitu.'),
      B.listening('029_d_listen', 'Kuula hindu.', 'Õpetaja loeb hinnad kaks korda. Kirjuta lünka hind numbritega.', [
        'Kohv maksab kaks eurot viiskümmend senti.', 'Tee maksab üks euro kaheksakümmend senti.', 'Supp maksab viis eurot nelikümmend senti.',
        'Praad maksab üheksa eurot üheksakümmend senti.', 'Koogitükk maksab kolm eurot kakskümmend senti.', 'Mahl maksab kaks eurot kümme senti.',
      ], [
        'Kohv maksab [2,50|2.50] eurot.', 'Tee maksab [1,80|1.80] eurot.', 'Supp maksab [5,40|5.40] eurot.', 'Praad maksab [9,90|9.90] eurot.',
        'Koogitükk maksab [3,20|3.20] eurot.', 'Mahl maksab [2,10|2.10] eurot.',
      ]),
      B.vocab('029_d_vocab', 'Tellimus ja arve', ['hind — цена', 'euro — евро', 'sent — цент', 'kokku — всего, итого', 'veel — ещё', 'ilma — без', 'juurde — в добавку', 'tellimus — заказ', 'muutma — менять', 'tooma — приносить', 'jootraha — чаевые', 'vale — неправильный', 'viga — ошибка', 'summa — сумма']),
      B.dialogue('029_d_dialog', 'Arvel on viga.', 'Loe dialoogi. Täida lüngad.', 'Markus', 'Jaan', [
        ['A', 'Vabandust, Jaan! Arvel on [viga].'], ['B', 'Tõesti? Mis viga?'], ['A', 'Me sõime suppi ja praadi. Magustoitu me ei [tellinud].'],
        ['B', 'Aga arvel on kaks jäätist. Vabandust, see on [vale].'], ['A', 'Ja kohv oli ilma [piimata], aga arvel on kohv piimaga.'],
        ['B', 'Jah, õige. Ma teen uue [arve].'], ['B', 'Uus summa on kokku kolmkümmend üks [eurot].'], ['A', 'Aitäh! Kaks eurot on teile [jootraha].'],
      ]),
      B.notice('029_d_notice', 'Märka: hind, -ga ja ilma …-ta', ['2,50 € = **kaks eurot viiskümmend senti** (lühidalt: **kaks viiskümmend**)', '1 **euro**, 2 **eurot**; 1 **sent**, 50 **senti**', '**Kokku** on 12 eurot. **Kui palju** see **maksab**?', 'Kohv piima**ga** (-ga) — kohv **ilma** piima**ta** (ilma …-ta)', 'Palun **veel** üks tee. Palun leiba **juurde**.']),
      B.reading('029_d_read', 'Loe: Lõuna Jaani kohvikus.', 'Loe teksti ja vasta küsimustele.', 'Arve oli vale',
        'Eile käisid Viktor ja Markus Jaani kohvikus. Viktor tellis kanasupi, kala kartulitega ja tassi kohvi ilma suhkruta. Markus võttis seenepraadi, salatit ja klaasi mahla. Supp maksis 5 eurot, kala 9 eurot ja seenepraad 8 eurot. Salat oli 4 eurot. Kohv ja mahl maksid kumbki 2,50 eurot. Viktor palus ka leiba juurde, see oli tasuta. Lõpus tõi kelner arve. Arvel oli kokku 36 eurot. Markus luges arvet ja nägi seal kahte jäätist. Jäätist nad ei tellinud! Kelner vabandas ja tegi uue arve. Uus summa oli 31 eurot. Mehed maksid kaardiga. Jootrahaks jätsid nad kaks eurot.',
        [['Mida Viktor jõi?', 'kohvi ilma suhkruta|kohvi|tassi kohvi'], ['Kui palju maksis seenepraad?', '8 eurot|kaheksa eurot'], ['Mida Viktor palus juurde?', 'leiba'], ['Mis oli arvel valesti?', 'kaks jäätist|jäätised|seal olid kaks jäätist'], ['Kui palju oli uus summa?', '31 eurot|kolmkümmend üks eurot'], ['Kui palju jootraha nad jätsid?', 'kaks eurot|2 eurot']]),
      B.truefalse('029_d_tf', 'Õige või vale?', 'Loe teksti uuesti.', [
        ['Viktor jõi kohvi suhkruga.', false], ['Leib oli tasuta.', true], ['Mehed tellisid kaks jäätist.', false], ['Esimesel arvel oli viga.', true], ['Mehed maksid sularahas.', false],
      ]),
      B.wordforms('029_d_ga', 'Millega? Ilma milleta?', 'Kirjuta sõna õiges vormis.', [
        ['piim', 'kohv … (-ga)', 'piimaga'], ['suhkur', 'tee … (-ga)', 'suhkruga'], ['juust', 'võileib … (-ga)', 'juustuga'], ['piim', 'kohv ilma …', 'piimata'],
        ['suhkur', 'tee ilma …', 'suhkruta'], ['liha', 'supp ilma …', 'lihata'], ['jää', 'vesi ilma …', 'jääta'],
      ]),
      B.gaps('029_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Palun [veel] üks tee.', 'Palun leiba [juurde].', 'Arvel on [kokku] 12 eurot.', 'Kohv [ilma] suhkruta, palun.', 'Mis on selle supi [hind]?', 'Teie [tellimus] on valmis.',
      ], ['veel', 'juurde', 'kokku', 'ilma', 'hind', 'tellimus', 'vale', 'maksab']),
      B.transformation('029_d_price', 'Hind sõnadega.', 'Kirjuta hind sõnadega.', [
        ['2,50 €', '… eurot … senti', 'kaks eurot viiskümmend senti'], ['1,20 €', '… euro … senti', 'üks euro kakskümmend senti'], ['5,90 €', '… eurot … senti', 'viis eurot üheksakümmend senti'],
        ['12 €', '… eurot', 'kaksteist eurot'], ['0,80 €', '… senti', 'kaheksakümmend senti'], ['31,50 €', '… eurot … senti', 'kolmkümmend üks eurot viiskümmend senti'],
      ]),
      B.errorfix('029_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Kohv maksab kaks euro.', 'Kohv maksab kaks eurot.'], ['Tee ilma suhkur, palun.', 'Tee ilma suhkruta, palun.'], ['Võileib juust, palun.', 'Võileib juustuga, palun.'],
        ['Kokku on viis eurot viiskümmend sent.', 'Kokku on viis eurot viiskümmend senti.'], ['See maksab üks eurot.', 'See maksab üks euro.'],
      ]),
      B.translation('029_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Кофе с молоком, пожалуйста.', 'Чай без сахара.', 'Сколько всего?', 'Ещё один сок, пожалуйста.', 'В счёте ошибка.', 'Это стоит три евро.']),
      B.dictation('029_d_dict', 'Etteütlus. Hinnad.', 'Kuula ja kirjuta laused numbritega.', ['Kohv maksab 2,50 eurot.', 'Kokku on 14,80 eurot.', 'Supp maksab 5,40 eurot.', 'Jätsin 2 eurot jootraha.', 'Uus summa on 31 eurot.'], 5),
      B.speaking('029_d_say', 'Mis see maksab?', 'Küsi paariliselt hindu ja ütle, mis on kokku.', ['Küsi kohvi ja koogi hinda.', 'Ütle, mis on kokku.', 'Telli midagi juurde.', 'Telli midagi ilma millegita.'], [45, 90], ['Kui palju maksab…?', 'Kokku on…', 'Palun … ilma …-ta.']),
      B.writing('029_d_write', 'Minu lõuna kohvikus.', 'Kirjuta 5–7 lauset: mida sa tellisid ja mis see maksis.', [5, 7], ['tellisin', 'maksis', 'kokku'], 2),
      B.selfcheck('029_d_self', ['Ma kuulen ja kirjutan hindu.', 'Ma ütlen hinna sõnadega: kaks eurot viiskümmend senti.', 'Ma ütlen: kohv piimaga, tee ilma suhkruta.', 'Ma leian arvelt vea.'], 'Hinnad on selged'),
    ],
    practice: [
      B.listening('029_p_listen', 'Kuulamine 1. Tellimus muutub.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Liis: Tere! Mida te soovite?', 'Olga: Tere! Palun kaks teed ja kaks pannkooki.', 'Liis: Kas pannkoogid moosiga või hapukoorega?',
        'Olga: Moosiga, palun. Oot, ma muudan tellimust.', 'Olga: Üks tee ilma suhkruta ja üks kakao lapsele.', 'Liis: Hästi. Kas veel midagi?',
        'Olga: Palun veel üks klaas vett juurde.', 'Liis: Kokku on üheksa eurot kakskümmend senti.',
      ], [
        'Pannkoogid on [moosiga].', 'Olga muudab [tellimust].', 'Üks tee on ilma [suhkruta].', 'Lapsele on [kakao].', 'Juurde tuleb klaas [vett].', 'Kokku on üheksa eurot kakskümmend [senti].',
      ]),
      B.listening('029_p_listen2', 'Kuulamine 2. Kolm lauda.', 'Õpetaja loeb tellimused kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Laud üks: kaks kohvi piimaga ja üks juustusai. Kokku kuus eurot.', 'Laud kaks: kanasupp ilma sibulata ja klaas mahla. Kokku seitse eurot viiskümmend senti.',
        'Laud kolm: kolm jäätist ja suur pudel vett. Kokku üksteist eurot.',
      ], [
        'Laud üks: kaks kohvi [piimaga].', 'Laud üks maksab kokku [kuus|6] eurot.', 'Laud kaks: kanasupp ilma [sibulata].',
        'Laud kaks maksab seitse eurot [viiskümmend|50] senti.', 'Laud kolm: kolm [jäätist].', 'Laud kolm maksab kokku [üksteist|11] eurot.',
      ]),
      B.choice('029_p_sum', 'Kui palju on kokku?', 'Loe tellimust. Vali õige summa sõnadega.', [
        ['Kohv 2,50 € ja kook 3,50 €. Kokku on …', 'kuus eurot', 'viis eurot', 'seitse eurot'],
        ['Tee 1,80 € ja vesi on tasuta. Kokku on …', 'üks euro kaheksakümmend senti', 'kaks eurot kaheksakümmend senti', 'üks euro kaheksateist senti'],
        ['Supp 5,40 € ja leib juurde tasuta. Kokku on …', 'viis eurot nelikümmend senti', 'viis eurot neliteist senti', 'neli eurot viiskümmend senti'],
        ['Kaks mahla, üks maksab 2 €. Kokku on …', 'neli eurot', 'kaks eurot', 'kuus eurot'],
        ['Praad maksab 9,90 €. Sa annad 10 €. Tagasi saad …', 'kümme senti', 'üks euro', 'üheksakümmend senti'],
      ], 'full', 'g_vocab'),
      B.gaps('029_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma joon kohvi [piimaga]. (piim, -ga)', 'Palun teed [sidruniga]. (sidrun, -ga)', 'Lapsele salat ilma [sibulata]. (sibul, ilma)', 'See maksab kolm [eurot]. (euro)',
        'Pannkoogid [moosiga], palun. (moos, -ga)', 'Ma võtan supi ilma [lihata]. (liha, ilma)', 'Kokku on viiskümmend [senti]. (sent)',
      ]),
      B.transformation('029_p_change', 'Muuda tellimust.', 'Kirjuta lause: -ga ↔ ilma …-ta.', [
        ['Kohv piimaga.', 'Kohv ilma …', 'Kohv ilma piimata.'], ['Tee suhkruga.', 'Tee ilma …', 'Tee ilma suhkruta.'], ['Supp lihaga.', 'Supp ilma …', 'Supp ilma lihata.'],
        ['Salat ilma juustuta.', 'Salat …', 'Salat juustuga.'], ['Pannkoogid ilma moosita.', 'Pannkoogid …', 'Pannkoogid moosiga.'], ['Vesi jääga.', 'Vesi ilma …', 'Vesi ilma jääta.'],
      ]),
      B.wordorder('029_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Palun veel üks tass kohvi.', 'Kas ma saan tellimust muuta?', 'Arvel on vale summa.', 'Kohv ilma suhkruta, palun.', 'Kokku on kaheksa eurot.']),
      B.dictation('029_p_dict', 'Etteütlus. Hinnad.', 'Kuula ja kirjuta laused numbritega.', ['Kohv maksab 2,50 eurot.', 'Kokku on 9,20 eurot.', 'Supp maksab 5,40 eurot.', 'Palun veel 1 tee.', 'Laud 3 maksab 11 eurot.', 'Jätsin 1 euro jootraha.'], 6),
      B.translation('029_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Чай с лимоном, пожалуйста.', 'Суп без лука.', 'Я хочу изменить заказ.', 'Ещё стакан воды, пожалуйста.', 'Сколько всего?', 'В счёте неправильная сумма.']),
      B.rolecards('029_p_roles', 'Arvel on viga.', 'Üks on klient, teine kelner. Lahendage probleem.', 'Oled klient. Sa tellisid supi (5 €) ja tee (2 €). Arvel on 12 eurot. Ütle, mis on valesti.', 'Oled kelner. Kontrolli arvet. Vabanda ja ütle uus summa.', ['Vabandust, arvel on viga.', 'Ma ei tellinud…', 'Kokku peab olema…'], ['Vabandust!', 'Teil on õigus.', 'Uus summa on…']),
      B.speaking('029_p_say', 'Muuda tellimust.', 'Telli kohvikus. Siis muuda tellimust kaks korda.', ['Telli jook ja toit.', 'Muuda jooki: ilma suhkruta või piimaga.', 'Telli midagi juurde.', 'Küsi, mis on kokku.'], [45, 90]),
      B.writing('029_p_write', 'Sõnum kohvikule.', 'Kirjuta kohvikule 5–7 lauset: arvel oli viga.', [5, 7], ['arve', 'viga', 'tellisin', 'kokku'], 2),
      B.selfcheck('029_p_self', ['Ma kuulen tellimuse muudatusi.', 'Ma kuulen ja kirjutan summasid.', 'Ma ütlen: piimaga, ilma piimata.', 'Ma ütlen kelnerile, et arvel on viga.'], 'Arve on õige'),
    ],
    transfer: [
      B.text('029_t_situation', 'Uus olukord', 'Sinu firmas on homme koosolek. Kolleeg Olga tellib Jaani kohvikust kohvi ja võileibu. Sina kuulad tellimust, loed arvet ja kirjutad kohvikule.'),
      B.listening('029_t_listen', 'Kuula telefonitellimust.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Jaan! Siin on Olga firmast Pilv.', 'Meil on homme koosolek kümnele inimesele.', 'Palun kümme kohvi ja viis teed.', 'Kolm teed ilma suhkruta, palun.',
        'Süüa võtame kümme võileiba juustuga.', 'Kaks inimest on taimetoitlased.', 'Palun tooge kõik kella üheksaks.', 'Me maksame arvega, mitte kaardiga.',
      ], [
        'Koosolekul on [kümme|10] inimest.', 'Olga tellib viis [teed].', 'Kolm teed on ilma [suhkruta].', 'Võileivad on [juustuga].', 'Kaks inimest on [taimetoitlased].', 'Firma maksab [arvega].',
      ]),
      B.table('029_t_order', 'Tellimuse leht.', 'Kirjuta Olga tellimus tabelisse.', 'Mida?, Mitu?, Märkus', [' |  | ', ' |  | ', ' |  | ', ' |  | ']),
      B.reading('029_t_bill', 'Loe arvet.', 'Loe arvet ja vasta küsimustele.', 'Jaani kohvik. Arve nr 245',
        'Klient: firma Pilv, Olga Ivanova. Kuupäev: 14. oktoober. Kohv, 10 tassi, 2 eurot tükk — kokku 20 eurot. Tee, 5 tassi, 1,50 eurot tükk — kokku 7,50 eurot. Võileib lihaga, 10 tükki, 3 eurot tükk — kokku 30 eurot. Kohaletoomine maksab 5 eurot. Arve summa on kokku 62,50 eurot. Palun maksa arve 7 päeva jooksul. Toome kõik kohale kell 8.45, enne koosolekut. Järgmine tellimus on 10 protsenti odavam. Kui teil on küsimusi, helistage numbril 5551 2345. Kui midagi on valesti, kirjutage meile. Aitäh, et valisite meid!',
        [['Mitu tassi kohvi on arvel?', '10|kümme'], ['Kui palju maksab üks tee?', '1,50 eurot|1,50'], ['Mis on arvel valesti?', 'võileivad on lihaga|võileib lihaga, mitte juustuga|lihaga'], ['Kui palju maksab kohaletoomine?', '5 eurot|viis eurot'], ['Millal tuleb arve maksta?', '7 päeva jooksul|seitsme päeva jooksul']]),
      B.truefalse('029_t_tf', 'Kas arve on õige?', 'Võrdle arvet ja Olga tellimust.', [
        ['Arvel on kümme kohvi.', true], ['Arvel on viis teed.', true], ['Võileivad on arvel juustuga.', false], ['Kohaletoomine on tasuta.', false], ['Arve tuleb maksta kohe.', false], ['Järgmine tellimus on odavam.', true],
      ]),
      B.manymatch('029_t_phr', 'Mida öelda telefonis?', 'Ühenda olukord ja sobiv lause.', ['Sa tahad tellida.', 'Sa ei kuulnud hinda.', 'Sa tahad tellimust muuta.', 'Arvel on viga.', 'Sa lõpetad kõne.'], ['Ma soovin tellida…', 'Palun korrake hinda.', 'Kas ma saan tellimust muuta?', 'Arvel on vale summa.', 'Aitäh, nägemist!'], 'full', 'g_use'),
      B.errorfix('029_t_fix', 'Paranda kiri.', 'Kirjuta lause õigesti.', [
        ['Me tellisime võileivad juust.', 'Me tellisime võileivad juustuga.'], ['Arvel on võileivad liha.', 'Arvel on võileivad lihaga.'], ['Kolm teed ilma suhkur.', 'Kolm teed ilma suhkruta.'],
        ['Summa on kuuskümmend kaks euro.', 'Summa on kuuskümmend kaks eurot.'], ['Palun saatke uus arvet.', 'Palun saatke uus arve.'],
      ]),
      B.translation('029_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Мы заказали бутерброды с сыром.', 'В счёте ошибка.', 'Пришлите, пожалуйста, новый счёт.', 'Три чая без сахара.', 'Спасибо за быструю доставку!']),
      B.planning('029_t_plan', 'Enne kirja.', 'Kirjuta märksõnad.', ['Mis on arvel valesti?', 'Mis on õige?', 'Mida sa palud?'], 2),
      B.letter('029_t_letter', 'Kiri kohvikule.', 'Kirjuta Jaanile 40–60 sõna: arvel on viga, palu uut arvet.', 'Tere, Jaan!', 'Lugupidamisega', [40, 60]),
      B.rolecards('029_t_roles', 'Telefonis.', 'Üks helistab kohvikusse, teine on Jaan.', 'Helistad kohvikusse. Telli koosolekuks jooke ja toitu kaheksale inimesele. Ütle, mis peab olema ilma millegita.', 'Oled Jaan. Võta tellimus vastu, küsi täpsustusi ja ütle hind.', ['Ma soovin tellida…', '… ilma suhkruta', 'Kui palju see kokku maksab?'], ['Mitmele inimesele?', 'Kas piimaga või ilma?', 'Kokku on…']),
      B.speaking('029_t_say', 'Mis juhtus?', 'Räägi kolleegile, mis arvega juhtus.', ['Mida te tellisite?', 'Mis oli arvel valesti?', 'Mis on õige summa?', 'Mida sa tegid?'], [45, 90]),
      B.rubric('029_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Tellimuse leht on täidetud õigesti.', 'Kirjas on viga selgelt kirjas ja palve uue arve kohta.', 'Hinnad ja -ga / ilma …-ta on õiged.', 'Telefonis tellib õpilane ilma abita.']),
      B.selfcheck('029_t_self', ['Ma kuulan telefonitellimust.', 'Ma võrdlen tellimust ja arvet.', 'Ma kirjutan kohvikule veast.', 'Ma tellin telefonis koosolekule.'], 'Tellimus kontrollitud'),
    ],
  },

  'a2-030': {
    title: 'Kontroll 6 — söök ja kohvik',
    canDo: 'Ma näitan kontrollis, et oskan nimetada toite, öelda koguseid osastavaga, tellida kohvikus ja aru saada hindadest (vähemalt 70%).',
    discover: [
      B.text('030_d_situation', 'Kordame', 'Enne kontrolli kordame mooduli tähtsamat: toit ja joogid, kogused ja osastav, tellimine kohvikus, hinnad ja arve.'),
      B.notice('030_d_notice', 'Mooduli kokkuvõte', ['Ma söön leib**a**, joon kohv**i**. Aga: Mulle meeldib **kohv**.', 'Kogus: liiter **piima**, kilo **kartuleid**, kaks **muna**', 'Kohvikus: **Ma soovin** teed. **Kas teil on** taimetoitu? **Arve, palun!**', 'Hind: 3,50 € = **kolm eurot viiskümmend senti**', 'Kohv piima**ga** — kohv **ilma** piima**ta**']),
      B.reading('030_d_read', 'Loe: Jaani kohvik.', 'Loe teksti ja vasta küsimustele.', 'Jaan ja tema kohvik',
        'Jaan on 38 aastat vana. Tal on Tartus väike kohvik. Kohvik on avatud iga päev, ainult esmaspäeval on see kinni. Hommikul küpsetab Jaan saia ja kooki. Lõunaks teeb ta suppi ja praadi. Kõige rohkem tellivad kliendid kohvi ja õunakooki. Päevas joovad kliendid umbes kakssada tassi kohvi! Jaan ostab iga päev turult köögivilju ja puuvilju. Liha ja kala ostab ta talust. Taimetoitlastele on alati köögiviljasupp. Lapsed armastavad Jaani pannkooke. Üks pannkook maksab üks euro. Jaan ütleb: „Minu lemmiktoit on lihtne: leib, juust ja tass head kohvi.”',
        [['Millal on kohvik kinni?', 'esmaspäeval'], ['Mida Jaan hommikul küpsetab?', 'saia ja kooki|saia, kooki'], ['Mida kliendid kõige rohkem tellivad?', 'kohvi ja õunakooki|kohvi, õunakooki'], ['Kust Jaan ostab köögivilju?', 'turult'], ['Kui palju maksab üks pannkook?', 'üks euro|1 euro'], ['Mis on Jaani lemmiktoit?', 'leib, juust ja kohv|leib, juust ja tass kohvi']]),
      B.truefalse('030_d_tf', 'Õige või vale?', 'Loe Jaani teksti uuesti.', [
        ['Kohvik on esmaspäeval lahti.', false], ['Jaan teeb lõunaks suppi.', true], ['Kliendid joovad päevas sada tassi kohvi.', false], ['Taimetoitlastele on köögiviljasupp.', true], ['Lastele meeldivad Jaani pannkoogid.', true],
      ]),
      B.crossword('030_d_cross', 'Mooduli sõnad.', 'Kirjuta sõna vihje järgi.', [
        ['Selle saad kohvikus lõpus, et maksta', 'arve'], ['Inimene, kes ei söö liha', 'taimetoitlane'], ['Kohvikus toob ta toidu', 'kelner'],
        ['Seda sööd pärast praadi', 'magustoit'], ['Siin on kirjas toidud ja hinnad', 'menüü'], ['Seal hoiad piima ja juustu', 'külmkapp'],
      ]),
      B.wordforms('030_d_forms', 'Osastav.', 'Kirjuta sõna osastavas.', [
        ['leib', 'ma söön …', 'leiba'], ['vesi', 'klaas …', 'vett'], ['kartulid', 'kilo …', 'kartuleid'], ['tee', 'ma soovin …', 'teed'],
        ['muna', 'kolm …', 'muna'], ['suhkur', 'natuke …', 'suhkrut'], ['juust', 'pool kilo …', 'juustu'], ['mahl', 'pudel …', 'mahla'],
      ]),
      B.manymatch('030_d_match', 'Mida öelda kohvikus?', 'Ühenda olukord ja lause.', ['Sa tahad menüüd.', 'Sa ei söö liha.', 'Sa tahad maksta.', 'Arvel on viga.', 'Sa tahad veel teed.'], ['Kas ma saaksin menüü?', 'Kas teil on taimetoitu?', 'Arve, palun!', 'Vabandust, arvel on vale summa.', 'Palun veel üks tee.'], 'full', 'g_use'),
      B.transformation('030_d_trans', 'Kogus.', 'Kirjuta lause sulgudes oleva kogusega.', [
        ['Palun piima. (1 l)', 'Palun …', 'Palun liiter piima.|Palun üks liiter piima.'], ['Palun kartuleid. (2 kg)', 'Palun …', 'Palun kaks kilo kartuleid.'],
        ['Mul on vaja mune. (6)', 'Mul on vaja …', 'Mul on vaja kuus muna.'], ['Palun teed. (1 tass)', 'Palun …', 'Palun tass teed.|Palun üks tass teed.'], ['Palun mahla. (2 pudelit)', 'Palun …', 'Palun kaks pudelit mahla.'],
      ]),
      B.errorfix('030_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Mulle meeldib kohvi.', 'Mulle meeldib kohv.'], ['Palun kaks kohvid.', 'Palun kaks kohvi.'], ['Tee ilma suhkur.', 'Tee ilma suhkruta.'], ['See maksab kolm euro.', 'See maksab kolm eurot.'], ['Ma soovin tee.', 'Ma soovin teed.'], ['Kohv piim, palun.', 'Kohv piimaga, palun.'],
      ]),
      B.gaps('030_d_gaps', 'Kordame vorme.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Sofia ei söö [liha]. (liha)', 'Ma joon kohvi [piimaga]. (piim, -ga)', 'Palun pudel [vett]. (vesi)', 'Mulle maitseb [supp]. (supp)', 'Kokku on viis [eurot]. (euro)', 'Mul on vaja kaks kilo [õunu]. (õunad)',
      ]),
      B.translation('030_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я не ем рыбу.', 'Литр молока и пачку масла, пожалуйста.', 'У вас есть суп?', 'Кофе без сахара, пожалуйста.', 'Сколько это стоит?', 'Всего десять евро.']),
      B.wordorder('030_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kohvik on esmaspäeval kinni.', 'Kliendid tellivad kohvi ja kooki.', 'Palun veel üks tass teed.', 'Kokku on kaksteist eurot.', 'Jaan ostab turult köögivilju.']),
      B.speaking('030_d_say', 'Proovieksam: toit.', 'Vasta paarilise küsimustele, nagu eksamil.', ['Mida te tavaliselt hommikul sööte?', 'Mis on teie lemmiktoit?', 'Kas te käite kohvikus? Mida te tellite?', 'Mida te ei söö?'], [45, 90]),
      B.writing('030_d_write', 'Kordame kirjutamist.', 'Kirjuta 6–8 lauset: mida sa sööd ja jood ning mis sulle maitseb.', [6, 8], ['söön', 'joon', 'meeldib'], 2),
      B.selfcheck('030_d_self', ['Ma kordasin toite ja jooke.', 'Ma kasutan osastavat pärast kogust.', 'Ma tellin kohvikus ja palun arvet.', 'Ma olen valmis kontrolliks.'], 'Valmis kontrolliks'),
    ],
    practice: [
      B.tip('030_p_how', 'Kontroll: lugemine, kuulamine, keel (eksami vormis)', 'See leht on nagu Harno A2 eksami lugemine ja kuulamine. Tee kõik ilma abita. Kuulamisteksti loeb õpetaja kaks korda. Eesmärk on vähemalt 70%.', 'full'),
      B.choice('030_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Kelner toob toidu. Mida ta ütleb?', 'Head isu!', 'Jõudu tööle!', 'Head ööd!'], ['Sa tahad maksta. Mida sa ütled?', 'Arve, palun!', 'Menüü, palun!', 'Head isu!'],
        ['Sa ei söö liha. Mida sa küsid?', 'Kas teil on taimetoitu?', 'Kas teil on kana?', 'Kas teil on praadi?'], ['Toit oli väga hea. Mida sa ütled?', 'Aitäh, väga maitsev!', 'Vabandust, see on vale!', 'Palun korrake!'],
        ['Sa tahad veel kohvi. Mida sa ütled?', 'Palun veel üks kohv.', 'Palun arve.', 'Palun menüü.'],
      ], 'full', 'g_use'),
      B.reading('030_p_ad', 'Lugemine 2. Kuulutus.', 'Loe kuulutust ja vasta küsimustele.', 'Uus kohvik Supipott!',
        'Uus kohvik Supipott avab uksed 1. novembril! Kohvik asub Tartus, Rüütli tänav 5. Oleme avatud tööpäeviti kell 10–18 ja laupäeviti kell 11–16. Pühapäeval on kohvik kinni. Iga päev on menüüs kolm suppi: üks lihaga, üks kalaga ja üks taimetoitlastele. Supp maksab 5 eurot, väike portsjon 3 eurot. Leib ja vesi on supi juurde tasuta. Magustoiduks pakume kooki ja jäätist. Avamispäeval saab iga klient tassi kohvi tasuta. Lastele on hind alati poole odavam. Kohvikus on kakskümmend kohta, suvel on laudu ka õues. Ootame teid!',
        [['Mis kuupäeval kohvik avab uksed?', '1. novembril|esimesel novembril'], ['Mis päeval on kohvik kinni?', 'pühapäeval'], ['Mitu suppi on iga päev menüüs?', 'kolm|3'], ['Mis on supi juurde tasuta?', 'leib ja vesi|leib, vesi'], ['Mida saab klient avamispäeval tasuta?', 'tassi kohvi|kohvi|tass kohvi']]),
      B.cloze('030_p_cloze', 'Lugemine 3. Sõnum.', 'Vali igasse lünka sobiv sõna.', 'Tere, Markus!', [
        'Täna käisin uues kohvikus Supipott. Ma sõin {*suppi|supp|supiga} ja jõin tassi {*teed|tee|teega}.', 'Supp oli väga {*maitsev|maitsma|maitse}.',
        'Ma ei söö {*liha|lihaga|lihad}, seepärast võtsin köögiviljasupi.', 'Leib oli supi juurde {*tasuta|tasu|maksab}. Kokku maksin ainult kuus {*eurot|euro|eurod}.',
        'Kas sa tuled homme {*minuga|mina|minul} sinna? Kohvik on lahti kella {*kuueni|kuus|kuuest}. Olga',
      ]),
      B.reading('030_p_notice', 'Lugemine 4. Teade köögis.', 'Loe teadet ja vasta küsimustele.', 'Head kolleegid!',
        'Meie köögis on uus külmkapp. Palun kirjutage oma nimi toidukarbile. Reedel õhtul teeme külmkapi tühjaks. Kohvi ja teed võib juua tasuta. Piima ostab firma, kaks liitrit päevas. Kui piim saab otsa, kirjutage sellest Olgale. Suhkur ja sool on kapis. Palun peske oma tass ise! Igal kolmapäeval toob kohvik Supipott meile lõunat. Lõunasöök maksab 6 eurot. Tellida saab teisipäeval kella kolmeni. Menüü on köögi seinal. Kui sa ei söö liha, kirjuta seda tellimuse juurde. Palun ärge jätke musti nõusid lauale. Aitäh! Juhataja Kersti',
        [['Mis on köögis uus?', 'külmkapp'], ['Mis päeval tehakse külmkapp tühjaks?', 'reedel|reedel õhtul'], ['Kui palju piima ostab firma päevas?', 'kaks liitrit|2 liitrit'], ['Kellele kirjutada, kui piim saab otsa?', 'Olgale'], ['Kui palju maksab lõunasöök?', '6 eurot|kuus eurot']]),
      B.listening('030_p_listen', 'Kuulamine 1. Tellimus kohvikus.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere! Mida te soovite?', '— Palun üks kanasupp ja klaas õunamahla.', '— Kas leiba ka?', '— Jah, kaks tükki musta leiba, palun.',
        '— Kas magustoitu soovite?', '— Jah, üks tükk šokolaadikooki.', '— Ja kohvi?', '— Ei, kohvi ma ei joo. Palun tee ilma suhkruta.', '— Kokku on üksteist eurot nelikümmend senti.',
      ], [
        'Supp on [kanasupp].', 'Klient joob klaasi [õunamahla].', 'Leiba on vaja kaks [tükki].', 'Magustoiduks on tükk [šokolaadikooki].', 'Tee on ilma [suhkruta].', 'Kokku maksab klient üksteist eurot nelikümmend [senti].',
      ]),
      B.listening('030_p_listen2', 'Kuulamine 2. Kohviku teade.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Jaan, kohviku omanik.', 'Alates esmaspäevast on meil uus menüü.', 'Iga päev on kaks suppi ja kolm praadi.', 'Lõunapakkumine on kell üksteist kuni kolm.',
        'Supp ja praad koos maksavad üheksa eurot.', 'Kohv on lõunaga tasuta.', 'Laupäeval on lastele pannkoogid poole hinnaga.',
      ], [
        'Jaan on kohviku [omanik].', 'Uus menüü on alates [esmaspäevast].', 'Iga päev on [kaks|2] suppi.', 'Supp ja praad maksavad koos [üheksa|9] eurot.', 'Lõunaga on [kohv] tasuta.', 'Laupäeval on pannkoogid poole [hinnaga].',
      ]),
      B.gaps('030_p_mix', 'Keel. Viis punkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Mulle meeldib [kala]. (kala)', 'Ma joon hommikul [kohvi]. (kohv)', 'Palun liiter [piima]. (piim)', 'Mul on vaja kolm [muna]. (muna)', 'Tee [sidruniga], palun. (sidrun, -ga)',
      ]),
      B.gaps('030_p_mix2', 'Keel. Veel viis punkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Kohv ilma [suhkruta], palun. (suhkur)', 'See maksab kaks [eurot]. (euro)', 'Ma söön [salatit]. (salat)', 'Kilo [kartuleid], palun. (kartulid)', 'Klaas [vett], palun. (vesi)',
      ]),
      B.errorfix('030_p_fix', 'Keel. Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Palun kaks kohvid.', 'Palun kaks kohvi.'], ['Mulle meeldib teed.', 'Mulle meeldib tee.'], ['Kokku on viis euro.', 'Kokku on viis eurot.'], ['Ma joon vesi.', 'Ma joon vett.'],
      ]),
      B.wordorder('030_p_order', 'Keel. Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kas teil on taimetoitu?', 'Palun veel üks tass kohvi.', 'Kohvik on pühapäeval kinni.', 'Leib on supi juurde tasuta.']),
      B.translation('030_p_tr', 'Keel. Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Мне, пожалуйста, суп и чай.', 'Я не пью молоко.', 'Счёт, пожалуйста.', 'Сколько стоит кофе?']),
      B.writing('030_p_write', 'Kirjutamine. Sõnum.', 'Kirjuta sõbrale 4–6 lauset: kutsu ta kohvikusse Supipott.', [4, 6], ['kohvik', 'supp', 'tasuta'], 2),
      B.speaking('030_p_say', 'Rääkimine. Toit.', 'Vasta õpetaja küsimustele täislausega.', ['Mida te tavaliselt lõunaks sööte?', 'Mis on teie lemmikjook?', 'Kas te teete kodus süüa?', 'Mis toitu te ei söö?'], [45, 75]),
      B.selfcheck('030_p_self', ['Ma saan aru kuulutusest ja teatest.', 'Ma kuulen tellimust ja hinda.', 'Ma kasutan osastavat ja -ga / ilma …-ta.', 'Ma vastan küsimustele toidu kohta.'], 'Kontroll tehtud'),
    ],
    transfer: [
      B.text('030_t_situation', 'Kontroll: kirjutamine ja rääkimine', 'Sinu kursus teeb reedel ühise lõuna. Täida küsitlus, kirjuta õpetajale oma soovidest ja telli kohvikus. Õpetaja hindab, eesmärk on vähemalt 70%.'),
      B.table('030_t_form', 'Kirjutamine 1. Küsitlus.', 'Täida lõuna küsitlus oma andmetega.', 'Küsimus, Sinu vastus', ['Nimi | ', 'Mida sa ei söö? | ', 'Kas oled taimetoitlane? | ', 'Mis jook sulle meeldib? | ', 'Supp või salat? | ', 'Magustoit: kook või jäätis? | ']),
      B.letter('030_t_letter', 'Kirjutamine 2. Sõnum.', 'Kirjuta õpetajale 40–60 sõna: mida sa sööd, mida mitte, mis on lemmiktoit.', 'Tere, õpetaja!', 'Parimate soovidega', [40, 60]),
      B.listening('030_t_listen', 'Kuulamine. Õpetaja plaan.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin on Kadri.', 'Reedel läheme kõik koos kohvikusse Supipott.', 'Kohtume kell kaksteist kooli ees.', 'Iga inimene maksab ise, supp maksab viis eurot.',
        'Taimetoitlastele on köögiviljasupp.', 'Pärast lõunat joome kohvi ja räägime eesti keeles.',
      ], ['Reedel läheb grupp [kohvikusse].', 'Kohtumine on kell [kaksteist|12].', 'Kohtumine on kooli [ees].', 'Supp maksab [viis|5] eurot.', 'Taimetoitlastele on [köögiviljasupp].']),
      B.planning('030_t_plan', 'Enne tellimist.', 'Kirjuta märksõnad.', ['Mida sa tellid?', 'Mida sa küsid kelnerilt?', 'Kuidas sa maksad?'], 2),
      B.transformation('030_t_check', 'Kontrolli lauseid.', 'Kirjuta lause viisakalt.', [
        ['Too menüü!', 'Kas ma saaksin …?', 'Kas ma saaksin menüü?'], ['Anna suppi!', 'Ma soovin …', 'Ma soovin suppi.'], ['Kas on taimetoitu?', 'Kas teil on …?', 'Kas teil on taimetoitu?'],
        ['Too arve!', '… palun!', 'Arve, palun!'], ['Kohv, suhkrut ei taha!', 'Kohv ilma …', 'Kohv ilma suhkruta, palun.|Kohv ilma suhkruta.'],
      ]),
      B.writing('030_t_write', 'Kirjutamine 3. Pärast lõunat.', 'Kirjuta sõbrale 5–7 lauset: kus sa käisid, mida sõid ja mis see maksis.', [5, 7], ['sõin', 'jõin', 'maksis'], 2),
      B.speaking('030_t_say', 'Rääkimine 1. Minu toit.', 'Räägi umbes üks minut oma söögiharjumustest.', ['Mida sa sööd hommikul, lõunal ja õhtul?', 'Mis on sinu lemmiktoit?', 'Mida sa ei söö?', 'Kus sa käid söömas?'], [60, 90]),
      B.rolecards('030_t_roles', 'Rääkimine 2. Kohvikus.', 'Üks on klient, teine kelner. Tellige ja makske.', 'Oled klient. Telli supp, jook ja magustoit. Küsi ühe toidu koostist. Palu arvet ja maksa kaardiga.', 'Oled kelner. Võta tellimus vastu. Üks magustoit on otsas. Ütle hind.', ['Ma soovin…', 'Mis selles on?', 'Arve, palun!'], ['Mida te soovite?', 'Kahjuks on … otsas.', 'Kokku on…']),
      B.reading('030_t_reply', 'Lugemine. Kohviku vastus.', 'Loe kohviku kirja ja vasta küsimustele.', 'Tere, Kadri!',
        'Aitäh, et valisite meie kohviku. Reedel kell 12.15 on teie grupile valmis suur laud akna juures. Menüüs on kolm suppi: seljanka, kalasupp ja köögiviljasupp. Iga supi juurde on leib ja vesi tasuta. Supp maksab 5 eurot. Magustoiduks on õunakook, see maksab 3 eurot. Kohv ja tee maksavad 2 eurot. Kui keegi ei söö piima, öelge seda palun ette. Maksta saab kaardiga või sularahas. Iga inimene maksab ise. Kui grupp hilineb, helistage meile. Meie kohvikus on ka lastele väike menüü. Ootame teid! Kohvik Supipott, Mari',
        [['Mis kell on laud valmis?', '12.15|kell 12.15'], ['Kus laud on?', 'akna juures'], ['Mis on supi juurde tasuta?', 'leib ja vesi|leib, vesi'], ['Kui palju maksab õunakook?', '3 eurot|kolm eurot'], ['Kuidas saab maksta?', 'kaardiga või sularahas|kaardiga|sularahas']]),
      B.rubric('030_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti. Kokku 70% = kontroll on sooritatud.', ['Küsitlus on täidetud.', 'Sõnumis on tervitus, toidusoovid ja lõpp (40–60 sõna).', 'Osastav ja kogused on õiges vormis.', 'Suuline vastus on arusaadav ja kestab umbes minuti.', 'Kohvikus tellib õpilane ise, ilma abita.']),
      B.selfcheck('030_t_self', ['Ma täidan toidu küsitluse.', 'Ma kirjutan 40–60-sõnalise sõnumi oma soovidest.', 'Ma räägin oma toidust umbes minuti.', 'Ma tellin kohvikus ilma abita.'], 'Moodul 6 on läbitud'),
    ],
  },
};
