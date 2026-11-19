// B2 course (B1 → B2 roadmap), module 11 „Raha ja tarbimine” (b1b2-051…055), stage B2- (roadmap levelStage B1+/B2-; a
// step up from module 10: homework 160–180 words, participle phrases and concession in the language focus, a B2 opener).
// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17) on the v3 station engine, built on the
// samples B1→B2 modules 1–10. Module goal (the learner): „Ma oskan oma raha üle ise otsustada: leian eelarvest lekked,
// tunnen ära müügivõtted, kasutan oma õigusi netiostu puhul ja kaalun enne laenu või järelmaksu plusse ja miinuseid”;
// module product „Minu viis rahareeglit” (054 Kasuta, the S1 one-minute talk in 055). Money from the learner's own angle:
// his month, a sale sign, a parcel that does not fit, a broken washing machine. Nobody is asked for real income or debts:
// every task works with a typical or invented household. A themed module (MODULE.theme 'money', §7.1 rule 7, like module 6
// „Tööelu” and module 9 „Tervis”): every lesson has the topic money with its own sub-topic. Not repeated from earlier
// modules: food labels and the shopping basket (9), a complaint to a service (2), a phone scam (3), lending money to a
// friend (10), who pays for learning (7), a 200 € trip (8).
// Every teaching lesson follows one arc in exactly 4 stations (≤ 75 min of a 90-min lesson):
//   1 hook + pre-task (≤ 80 words, the learner speaks in the first minute) → 2 input + task → 3 language focus
//   (notice in the input → rule → use) → 4 product in class + „Kui aega jääb” + exit check (3 items) + „Ma oskan …”;
//   the long writing and a 1-minute voice message are homework; the lesson words reach „Harjuta” through
//   vocabulary/lessonWords/b1b2.json (Sõnavara → Teemad → Moodul 11).
// One format a lesson, no two neighbours alike (admin/course/v4Tasks.test.js):
//   051 facts    „Kuhu kaob raha enne kuu lõppu?”                           budget      final plan: a family's leak plan
//   052 game     „„–70 % ainult täna!” Kas Black Friday on päriselt soodne?” sales       final advise: a friend's offers
//   053 case     „Netist tellitud jope ei sobi — kas raha tuleb tagasi?”     returns     final complain: the e-shop (W13 at home)
//   054 debate   „Pesumasin läks katki: säästud, järelmaks või kiirlaen?”    credit      final decide: debate and vote (S17)
//   055 exam     Kontroll 11 in Harno B2 form + „Minu viis rahareeglit” as the S1 one-minute talk.
// Grammar line of the module (old v2 file and docs/METHODOLOGY_STANDARD.md §5–§7: total vs partial object and subject;
// participles as attributes; the impersonal in terms and the conditional in claims; a weighed opinion), by discovery and
// spiralled: total vs partial object and subject (tühistasin tellimuse / ei tühistanud tellimust; raha ei jäänud üle;
// arveid tuli palju) (051; back in 053's letter and 055); participles as attributes — -v, -tav, -tud, -nud with their own
// phrase (kehtiv pakkumine, enne alandust küsitud hind, automaatselt pikenev leping) (052; back in 053's radio and terms,
// 055); the impersonal in terms and the conditional in polite claims (raha tagastatakse, kaupa ei vahetata; paluksin,
// oleksin tänulik, kas saaksite) (053, after module 4's impersonal; back in 055's R3 letter); a weighed opinion with
// concession (kuigi … siiski, küll … aga, seevastu, ühest küljest … teisest küljest) (054; back in 055's essay and debate).
// The one long text of the module is the topic opener (051 station 2, ≈ 340 words, after a 10-minute hook and pre-taught
// words). The course's cast is not used.
// Kept: lesson ids, the goal keys of b2/lessonGoals.js (053 without g_listen: it has one recording, like 046 in module 10) and the
// archetype set of COURSE_FINAL_SHAPE_B2 §4.1 row 11 in a new order (the topic needs it): 051 LUGU R→W, 052 PROB L→S,
// 053 KUUL L→W, 054 AVAS R→S; exam corners R1 (051), L1 (052), R2b (053), W2b (054). The v2 storyline version (Kohvik Mets,
// „Kokk Pluss”, the sofa from „Mööblimaailm”, the bank meeting) is in git history before 2026-11-19.
import { B, tag, teach, withShapes } from '../blocks.js';
import { exitCheck, extension, homeTask, purpose, station } from '../stationBlocks.js';

// a talk with the teacher as the partner, done in the lesson (engine/inLesson.js), not a home recording
const inLesson = (block) => ({ ...block, inLesson: true });
// the lesson's grammar as the small subtitle under the title on every sheet
const grammar = (text) => ({
  discover: { label: '1 Avasta', slot: 1, subtitle: text },
  practice: { label: '2 Harjuta', slot: 2, subtitle: text },
  transfer: { label: '3 Kasuta', slot: 3, subtitle: text },
});
// the home task card at the end of every lesson
const homework = (id, items) => B.phrasebank(id, [['Kodutöö', items]]);
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 11. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';
// nobody has to tell his real income, debts or purchases
const NO_FIGURES = 'Oma päris summasid ei pea ütlema: võid rääkida tüüpilisest, tuttava või väljamõeldud perest.';

// theme: a themed module may give every lesson its theme's topic, each with its own sub-topic (§7.3, v4Tasks.test.js)
export const MODULE = { id: 'b1b2-module-11', course: 'b2', title: 'Raha ja tarbimine', level: 'B2-', design: 'v3-stations', template: 'v4', theme: 'money' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });

export const LESSONS = withShapes({
  'b1b2-051': {
    title: 'Kuhu kaob raha enne kuu lõppu?',
    phases: grammar('Keel: täis- või osasihitis ja -alus — tühistasin tellimuse / ei tühistanud tellimust; raha ei jäänud üle; arveid tuli palju'),
    format: 'facts',
    topic: 'money',
    subtopic: 'budget',
    canDo: 'Ma võrdlen oma oletusi faktidega Eesti pere kulude kohta, leian kuu väljavõttest väikesed lekked (tellimused, väikeostud) ja kirjutan pereliikmele ettepaneku, kuidas raha paremini planeerida; kasutan õigesti täis- ja osasihitist ning -alust (tühistasin tellimuse, ei tühistanud tellimust, raha ei jäänud üle).',
    teacherPage: {
      goal: 'Факты о расходах семей в Эстонии, «утечки» бюджета (подписки, мелкие покупки) и план семьи; полный и частичный объект и субъект: tühistasin tellimuse / ei tühistanud tellimust.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 1 вопрос; станция 3 — правило и 4 строки; станция 4 — выписка и разговор без карточки. Текст (станция 2) — дома, 7 вопросов в начале следующего урока.',
      hook: '«Возьми телефон: сколько у тебя платных подписок — музыка, фильмы, облако, приложения, спортклуб? Скажи число. И угадай: сколько они стоят вместе в месяц?» Ответьте сами, потом ученик. Сумму можно не называть, хватит догадки.',
      plan: [
        '0–4: крючок — сколько у меня подписок, ученик отвечает сразу',
        '4–15: станция 1 — разговор о мелких расходах (без настоящих сумм)',
        '15–30: станция 2 — слова (2 мин), прогноз карандашом по 7 вопросам, страница темы, проверка прогноза (R1)',
        '30–42: станция 3 — заметить в тексте tühistad / ei jää midagi → правило → итог месяца подруги: 7 пропусков',
        '42–57: станция 4 — выписка семьи за октябрь, разговор: найти утечки, карточка «Minu lekkekaart»',
        '57–69: «Kui aega jääb» — игра «Потребность, желание или утечка?»',
        '69–76: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: письмо члену семьи, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Страница темы: Statistikaamet, leibkonna eelarve uuring 2020 (пресс-релиз: 477 € в месяц на члена домохозяйства, еда 108 €, жильё 78 €, транспорт 66 €, еда и жильё вместе 39 %); новый раунд LEU 2026 (stat.ee); TalTech и Rahandusministeerium, «Eesti elanike rahatarkus 2026. OECD-INFE tulemused» (7.05.2026: 1004 респондента, март–апрель 2026; самые слабые привычки — обдумывать покупку и ставить долгосрочные цели). Расчёт кофе (2,50 € × 20 рабочих дней ≈ 50 € в месяц ≈ 600 € в год) — наш. Семья Kertu и Andrus и выписка — учебные.',
      groups: 'Станция 1 — в парах. Прогноз и текст — каждый сам, сверка в паре. Станция 4: один — друг-советчик, другой — Kertu с вашей карточкой; потом смена. В 1:1 Kertu — вы.',
      errors: [
        '«Ma ei tühistanud tellimuse» → «… tellimust» (в отрицании объект всегда в частичном падеже).',
        '«Ma maksin arvet ära» → «Ma maksin arve ära» (действие закончено, результат целый — полный объект).',
        '«Kuu lõpus ei jäänud raha üle» — верно; «Ei jäänud rahad üle» — ошибка (вещество/деньги — единственное число).',
        '«Mul ei ole reserv» → «Mul ei ole reservi» (отрицание бытия: субъект в partitiiv).',
      ],
      notes: [
        'Формат — анализ фактов: сначала ученик угадывает (сколько тратит человек в месяц, сколько стоит кофе за год), потом читает и проверяет. Деньги — тема деликатная: никто не называет свои доходы и долги; все задания работают с «типичной» или выдуманной семьёй.',
        'Студенту — общежитие и подписки на троих; пенсионеру — пенсия и коммунальные платежи; маме в декрете — детские подписки и доставка еды; уставшему после смены — кофе и перекусы на работе. Каждый находит «утечку», не раскрывая суммы.',
        'Обратная связь, 2–3 цели: отрицание → partitiiv (ei tühistanud tellimust); законченное действие → полный объект (maksin arve ära); число и сумма в предложении («umbes 50 eurot kuus»).',
      ],
    },
    discover: [
      station(B.text('051_d_hook', 'Mitu tellimust sul on?', 'Võta telefon: mitu tasulist tellimust sul on — muusika, filmid, pilveruum, äpid, trenn? Ütle arv kohe. Ja arva: kui palju need kokku kuus maksavad?'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('051_d_talk', 'Väikesed kulud.', `Vasta igale küsimusele ja too näide. ${NO_FIGURES}`, [
        'Mida ostad peaaegu iga päev või iga nädal?',
        'Kas oled maksnud tellimuse eest, mida enam ei kasutanud?',
        'Kuidas sinu kodus raha üle arvet peetakse?',
      ], [150, 210], ['Peaaegu iga päev ostan …', 'Maksin … eest, kuigi …', 'Meil peetakse arvet …']), 'Sinu harjumused annavad tunni faktidele esimese võrdluse.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise üks väike harjumus (võib olla väljamõeldud). Ära küsi päris summasid. Kui õpilane ütleb, et tal pole ühtegi tellimust: „Mida sa ostad nii, et sa seda ei märka — kohv, sai, pilet?” Lõpus ütle üks sõna, mida õpilane vajas.')),
      station(tag(B.vocab('051_d_vocab', 'Enne lugemist: sõnad.', ['eelarve — бюджет', 'kulu — расход', 'sissetulek — доход', 'tellimus — подписка', 'arve — счёт', 'tühistama — отменять', 'säästma — экономить', 'reserv — резерв (запас денег)', 'planeerima — планировать', 'üle jääma — оставаться (лишним)']), { topic: ['reserv'] }), 2, 15),
      B.topicOpener('051_d_open', 'Moodul 11. Kuhu raha kaob?', [
        'Kuu alguses tundub, et raha on piisavalt. Kuu lõpus aga imestame: kuhu see kõik kadus? Suured kulud on tavaliselt teada: üür või kodulaen, toit ja transport. Raha kaob sageli hoopis väikeste summade kaupa, mida me ei märka.',
        'Statistikaameti viimase avaldatud leibkonna eelarve uuringu järgi kulutas üks leibkonnaliige 2020. aastal keskmiselt 477 eurot kuus. Kõige rohkem kulus toidule, seejärel eluasemele ja transpordile; toit ja eluase moodustasid kokku 39 protsenti kõigist kuludest. Praegu kogub Statistikaamet kulude kohta uuesti andmeid: paljud pered panevad mõne nädala jooksul kõik oma ostud kirja kulude päevikusse. Juba see üksi muudab sageli harjumusi, sest kirja pandud kulu on raskem unustada.',
        'Väikesed kulud tunduvad tühised, kuid need korduvad. Kui ostad igal tööpäeval tassi kohvi 2,50 euro eest, teeb see kuus umbes 50 ja aastas umbes 600 eurot. Sama on tellimustega: muusika, filmid, pilveruum ja äpid maksavad tavaliselt mõne euro kuus. Paljud neist algavad tasuta prooviajaga, mis muutub märkamatult tasuliseks, ja tellimus pikeneb automaatselt, kuni sa selle ise tühistad.',
        'Rahandusministeeriumi tellimusel tehtud rahatarkuse uuringus küsiti 2026. aasta kevadel enam kui tuhandelt Eesti elanikult, kuidas nad oma raha korraldavad. Teadmised intressist ja inflatsioonist olid head, kuid kõige nõrgemad harjumused olid ostuotsuse läbimõtlemine ja pikaajaliste rahaliste eesmärkide seadmine. Teisisõnu: me teame, kuidas raha toimib, aga ostame sageli enne, kui mõtleme.',
        'Mida teha? Lihtne nõuanne on panna üheks kuuks kirja kõik kulud, ka kõige väiksemad. Seejärel vaata pangaväljavõttest üle püsimaksed ja tühista need, mida sa ei kasuta. Pane osa sissetulekust kõrvale kohe palgapäeval, mitte kuu lõpus, sest kuu lõpus ei jää sageli midagi üle. Raha hakkab üle jääma siis, kui kulud on ette planeeritud, mitte tagantjärele imestatud. Nii tekib aegamööda reserv ootamatuteks kuludeks, näiteks katkise pesumasina või hambaarsti jaoks, ja laenu ei pea kohe võtma.',
        'Selles moodulis leiad oma eelarvest lekked, tunned ära müügivõtted, kasutad oma õigusi netiostu puhul ja kaalud, kas osta kohe või maksta hiljem. Oma päris summasid ei pea sa kellelegi ütlema.',
      ], 'Statistikaamet, leibkonna eelarve uuring 2020 (pressiteade) ja leibkonna eelarve uuring 2026; TalTech ja Rahandusministeerium, „Eesti elanike rahatarkus 2026. OECD-INFE tulemused” (7.05.2026)', [
        'Kas 477 eurot kuus inimese kohta tundub sulle praegu palju või vähe? Kuidas see summa uues uuringus muutub?',
        'Milline väike kulu kordub sinu või sinu tuttavate elus kõige sagedamini?',
        'Kuidas peeti raha üle arvet seal, kus sa üles kasvasid: ümbrikud, vihik või pank?',
        'Mida võiks pank või äpp teha, et tasuline tellimus ei ununeks?',
      ]),
      teach(tag(purpose(B.choice('051_d_facts', 'Arva ja kontrolli: mida ütlevad numbrid?', 'Enne lugemist arva iga küsimuse vastus pliiatsiga. Siis loe teksti ja vali õige vastus.', [
        ['Miks kaob raha teksti järgi sageli märkamatult?', 'see kaob väikeste summade kaupa, mis korduvad', 'üür ja kodulaen tõusevad iga kuu', 'pank võtab suuri teenustasusid', 'palk tuleb kuu lõpus liiga hilja'],
        ['Kui palju kulutas üks leibkonnaliige Statistikaameti uuringu järgi 2020. aastal keskmiselt kuus?', '477 eurot', '108 eurot', '78 eurot', '600 eurot'],
        ['Milline kulu oli 2020. aasta uuringus inimese kohta kõige suurem?', 'toit', 'eluase', 'transport', 'tellimused'],
        ['Kui palju teeb teksti arvutuse järgi aastas välja kohv igal tööpäeval 2,50 euro eest?', 'umbes 600 eurot', 'umbes 50 eurot', 'umbes 250 eurot', 'umbes 2500 eurot'],
        ['Miks võib tasuta prooviaeg teksti järgi kalliks minna?', 'see muutub tasuliseks ja pikeneb, kuni tellimuse ise tühistad', 'prooviaeg on alati kallim kui tavaline hind', 'pood ei luba tellimust tühistada', 'prooviaja eest tuleb maksta sularahas'],
        ['Mis olid 2026. aasta rahatarkuse uuringu järgi kõige nõrgemad harjumused?', 'ostuotsuse läbimõtlemine ja pikaajalised eesmärgid', 'teadmised intressist ja inflatsioonist', 'arvete maksmine õigel ajal', 'pangaäppide kasutamine'],
        ['Miks soovitab tekst panna osa sissetulekust kõrvale kohe palgapäeval?', 'kuu lõpus ei jää sageli midagi üle', 'palgapäeval maksab pank kõrgemat intressi', 'palgapäeval on poodides allahindlus', 'seadus nõuab seda'],
      ], 'full', 'g_read'), 'Näed, kas sinu tunne raha kohta langeb kokku numbritega.'), { task: 'R13', harno: 'R1' }),
      'Eksaminurk (R1): eksamil on pikem artikkel ja küsimused neljast valikust. Kõigepealt prognoos pliiatsiga (2 min), siis lugemine, siis kontroll. Küsi lõpuks: „Mis number üllatas sind kõige rohkem?” Rõhuta: 477 eurot on 2020. aasta keskmine, praegu on hinnad kõrgemad.'),
    ],
    practice: [
      station(B.notice('051_p_notice', 'Märka: tühistasin tellimuse või ei tühistanud tellimust?', [
        'Tekstist: tellimus pikeneb, kuni sa **selle** ise **tühistad** · kuu lõpus **ei jää** sageli **midagi** üle · pane **osa sissetulekust** kõrvale',
        '**Täissihitis** (nimetav või omastav: kaart, kaardi, kaardid) — tegevus on lõpetatud ja tulemus on terve: **Sulgesin** vana pangakaardi. · **Müüsin** jalgratta maha. · Käskivas: **Sulge** kaart!',
        '**Osasihitis** (osastav: kaarti, raha, kulusid) — 1) **eitus**: Ma **ei sulgenud** kaarti. 2) tegevus kestab: **Maksan** laenu tagasi. 3) hulk on lahtine: Ostsin piima ja leiba. 4) tunde- ja mõttetegusõnad: **vajan**, **armastan**, **kardan** midagi.',
        '**Alus** olemasolu lauses (on, jääb, tuleb): kindel, terve asi → nimetav: Kontole **tuli palk**. · Eitus → osastav: Kontole **ei tulnud palka**. · Lahtine hulk → osastav: Postkastis on **kirju**. · Sõna **raha** on nimetavas ja osastavas sama: Raha jäi üle. · Raha ei jäänud üle. · Kui tühistad tellimused, hakkab raha üle jääma.',
        'Kontrolli kahe küsimusega: kas lauses on **eitus**? Siis osastav. Kas tulemus on **terve ja valmis**? Siis täissihitis.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('051_p_forms', 'Sõbranna kuu kokkuvõte.', 'Otsusta, kas lause vajab täis- või osasihitist (või -alust), ja kirjuta sulgudes olev sõna õiges vormis.', [
        'Septembris tühistasin lõpuks [muusikatellimuse], mida ma pool aastat ei kasutanud. (muusikatellimus)',
        'Filmiplatvormi [tellimust] ma veel ei tühistanud, sest lapsed vaatavad seal multikaid. (tellimus)',
        'Kuu alguses maksin kõik [arved] korraga ära. (arve, mitmus)',
        'Kuu lõpus ei jäänud kontole üle ühtegi [eurot]. (euro)',
        'Ma vajan uut [talvejopet], aga ootan allahindlust. (talvejope)',
        'Sel kuul tuli postkasti [arveid] rohkem kui tavaliselt. (arve, mitmus)',
        'Järgmisel kuul planeerime kõik [kulud] ette ja paneme need ühte tabelisse. (kulu, mitmus)',
      ], '', 'full', 'g_notice'), 'Sõbranna saadab kokkuvõtte oma elukaaslasele; õige vorm näitab, mis on tehtud ja mis mitte.'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kas on eitus? Kas tulemus on valmis?” Rida 4: ühtegi + osastav (eitus). Rida 6: olemasolu lause, lahtine hulk — osaalus mitmuses (arveid). Lisa küsimus: „Mida sina sel kuul tühistasid või ei tühistanud?”'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('051_t_statement', 'Ühe pere oktoober: väljavõte.', 'Kertu ja Andrus elavad Tartus kahe lapsega ja kuu lõpus on konto jälle tühi. Loe osa nende oktoobri väljavõttest (üür, toit ja auto on välja jäetud) ja arvuta, kui palju iga leke maksab.', [
        ['Oktoobri väljavõte (näidis)', ['filmiplatvorm 13,99 € ja teine filmiplatvorm 9,99 € (teist vaadati viimati juulis)', 'muusikaäpi pereplaan 17,99 €', 'pilveruum 2,99 €', 'mänguäpi kristallid 4 × 4,99 €', 'kohv tööl 18 × 2,80 €', 'toidu kojutoomine 5 korda, kokku 96 €', 'spordiklubi 39 € (käidi üks kord)', 'ajakirja prooviaeg lõppes: 1 € asemel nüüd 12,90 €'], [
          'Kaks filmiplatvormi maksavad kokku [23,98|23.98] eurot kuus.',
          'Mänguäpi kristallid maksid oktoobris kokku [19,96|19.96] eurot.',
          'Kohv tööl maksis oktoobris kokku [50,40|50,4|50.40|50.4] eurot.',
          'Spordiklubi ainus külastus läks pere jaoks maksma [39] eurot.',
          'Ajakirja hind tõusis pärast prooviaega [11,90|11.90|11,9] euro võrra.',
        ]],
      ], '1', 'g_read'), 'Väljavõttest näed, kuhu pere raha tegelikult läheb; selle põhjal teete plaani.'), { task: 'R08' }), 4, 15, { final: 'plan' }),
      teach(tag(purpose(B.rolecards('051_t_help', 'Aita peret.', 'Kertu (õpetaja) palub sinult nõu. Vaadake koos väljavõte läbi ja tehke plaan: mida tühistada, mida vähendada ja kui palju raha hakkab kuus üle jääma.',
        'Olukord: Kertu on sinu sõbranna; ta on väsinud ja natuke häbeneb oma väljavõtet.\nSinu eesmärk: leia vähemalt neli leket, arvuta umbes kokku, kui palju need kuus maksavad, ja leppige kokku kolm konkreetset sammu.\nPiirang: ära kritiseeri — iga kulu taga on põhjus; paku lahendus, mitte süüdistus.',
        'Kertu kaart on õpetajal: miks iga kulu tekkis ja mida pere tahab säilitada.',
        ['Ma näen siin kahte filmiplatvormi: …', 'Kas te seda tellimust veel kasutate?', 'Kui te tühistaksite …, jääks kuus üle umbes …', 'Ma ei tühistaks …, sest …', 'Leppigem kokku: …'], ['Aga lapsed vaatavad …', 'Me ei märganudki, et …', 'Hea küll, aga …']), 'Tulemus: perel on kolm sammu ja nad teavad, kui palju raha see kuus säästab.'), { task: 'S13', level: 4 }),
      'Õpetaja kaart (Kertu). Ütle ainult seda, mida küsitakse. Varjatud info: teist filmiplatvormi tellis vanaema külaskäiguks ja keegi ei mäleta parooli; kristallid ostis 9-aastane poeg ema telefonist; spordiklubi oli Andruse uue aasta lubadus; kohv tööl on Kertu ainus paus pikal vahetusel. Takistused ükshaaval: 1) „Kohvi ma ei loobu, see on minu ainus rõõm.” 2) „Lapsed nutavad, kui muusika kaob.” 3) „Kas see üldse on oluline? Need on ju väikesed summad.” Õnnestunud, kui õpilane leiab vähemalt neli leket (teine platvorm, kristallid, spordiklubi, ajakiri, kojutoomine), arvutab umbes kokku (kuus üle 100 euro), kasutab vähemalt kolm korda õiget sihitist (tühistage tellimus / ei tühistanud tellimust) ja pakub kompromissi (nt kohv termosest kaks päeva nädalas, mitte nullist).'),
      tag(purpose(B.planning('051_t_card', 'Minu lekkekaart.', `Täida kaart oma või väljamõeldud pere kohta. ${NO_FIGURES}`, [
        'Kolm väikest kulu, mis korduvad (mis, kui tihti, umbes kui palju kuus)',
        'Üks püsimakse või tellimus, mille tühistan või mida kontrollin (millal prooviaeg lõpeb?)',
        'Kui suure osa sissetulekust panen palgapäeval kõrvale ja kuhu',
        'Kuidas ja millal kontrollin kuu lõpus, kas plaan toimis',
      ], 2), 'Kaardist saab sinu kodutöö kirja plaan ja hiljem esimene rahareegel.'), { task: 'W07', level: 3 }),
      extension(teach(tag(purpose(B.speaking('051_t_more', 'Mäng: vajadus, soov või leke?', 'Õpetaja loeb ette kümme ostu. Otsusta iga kohta kiiresti: vajadus, soov või leke, ja põhjenda ühe lausega. Kui õpetaja vaidleb, kaitse oma otsust.', [
        'Näide: „Teine filmiplatvorm, mida keegi ei vaata” → leke, sest maksame millegi eest, mida ei kasuta.',
        'Kumb on sinu arvates suurem leke: väike igapäevane kulu või unustatud aastatellimus?',
      ], [120, 180], ['See on vajadus, sest …', 'See on pigem soov, kuigi …', 'See on leke: maksame, aga ei kasuta.']), 'Mäng näitab, et sama ost võib ühele olla vajadus ja teisele leke.'), { task: 'S12', fluency: true }),
      'Kui aega jääb (12 min). Ostud: talvesaapad lapsele; kolmas paar kõrvaklappe; bussikaart; ajakiri, mida keegi ei loe; sünnipäevakingitus emale; kohv termosest; kohv kohvikust iga päev; laste trenn; aastatellimus, mille prooviaeg unustati; varuraha ravimiteks. Vaidle vähemalt kahe otsuse üle. Punkt, kui põhjendus sisaldab täis- või osasihitist õigesti.'), 12),
      tag(exitCheck(purpose(B.gaps('051_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma unustasin [tellimuse] tühistada ja maksin jälle 9,99 eurot. (tellimus)',
        'Tööandja ei maksnud sel aastal jõulude eel [preemiat] välja. (preemia)',
        'Me ei ole veel oma [eelarvet] koostanud. (eelarve)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas täis- ja osasihitis ning eitus on käes.')), {}),
      purpose(B.selfcheck('051_t_self', ['Ma räägin oma väikestest kuludest ilma päris summasid ütlemata.', 'Ma saan aru faktidest Eesti pere kulude kohta ja võrdlen neid oma oletustega.', 'Ma kasutan täis- ja osasihitist: tühistasin tellimuse, ei tühistanud tellimust, raha ei jäänud üle.', 'Ma leian väljavõttest lekked ja teen pere jaoks konkreetse plaani.'], 'Lekked leitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('051_t_letter', 'Kodus: ettepanek pereliikmele.', 'Kirjuta kodus pereliikmele, korterikaaslasele või Kertule 160–180 sõna: mida sa kuu kuludes märkasid, kolm leket koos umbkaudse summaga, mida pakud muuta (mida tühistate, mida ostate harvemini, kui palju panete palgapäeval kõrvale) ja kuidas te edaspidi kulusid planeerite. Kasuta vähemalt kolme täis- ja kolme osasihitist. Summad võivad olla väljamõeldud.', 'Tere, …!', 'Sinu\n(sinu nimi)', [160, 180]), 'Pereliige saab kirjast aru, kuhu raha kaob, ja teab, mida te koos muudate.')), { task: 'W04', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('051_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: üks väike kulu, mida sina või keegi tuttav tahaks vähendada, ja kuidas seda teha.', [
        'Mis kulu see on ja miks see korduvalt tekib?',
        'Mida sa teeksid teisiti ja mida see kuus annaks?',
      ], [60, 120]), 'Õpetaja kuulab ja ütleb, kas täis- ja osasihitis on õiged.')), { task: 'S15' }),
      homework('051_t_homework', ['1. Ettepanek pereliikmele, 160–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-052': {
    title: '„–70 % ainult täna!” Kas Black Friday on päriselt soodne?',
    phases: grammar('Keel: kesksõna täiendina — kehtiv pakkumine, allahinnatud jope, enne alandust küsitud hind, automaatselt pikenev leping'),
    format: 'game',
    topic: 'money',
    subtopic: 'sales',
    canDo: 'Ma kuulan ja loen reklaame, leian suure numbri tagant müügivõtte (ajasurve, võlts eelmine hind, pikenev prooviaeg), tean, mida seadus soodushinna kohta nõuab, ja räägin sõbraga, kas pakkumine tasub end ära; kasutan kesksõnu täiendina (kehtiv pakkumine, allahinnatud jope, enne alandust küsitud hind).',
    teacherPage: {
      goal: 'Игра «найди уловку»: короткие рекламы в торговом центре (L1), правило 30 дней TTJA и проверка ЕК, совет другу; причастия как определение: kehtiv pakkumine, enne alandust küsitud hind.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 строки; станция 4 — текст закона и разговор только о двух предложениях. Рекламы (станция 2) — дома по записи.',
      hook: 'Покажите табличку: «Talvejope 199 € → 59 €. –70 %! Pakkumine kehtib veel 2 tundi.» «Купишь? Да или нет — сразу. Что тянет сильнее всего: цена, процент или часы?» Голосуйте оба, без оценки.',
      plan: [
        '0–3: крючок — табличка с курткой, ученик отвечает сразу',
        '3–10: станция 1 — разговор: что я купил со скидкой и пожалел ли',
        '10–25: станция 2 — слова (2 мин), шесть реклам торгового центра один раз (L1), 6 пропусков, сверка',
        '25–37: станция 3 — заметить в рекламах märgistatud / piiratud → правило -v, -tav, -tud, -nud → честное описание: 7 трансформаций',
        '37–52: станция 4 — что говорит закон о скидке, 6 «честно или нет», разговор: три предложения друга',
        '52–64: «Kui aega jääb» — честная реклама за 30 секунд',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: предупреждение в форум, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Текст станции 4: TTJA, «Hinna avaldamise juhend» (2022) и ERR «TTJA: allahindluse puhul tuleb ära näidata viimase 30 päeva madalaim hind»: прежняя цена = самая низкая цена в том же магазине минимум за 30 дней до снижения; Euroopa Komisjon, pressiteade IP/23/418 (30.01.2023): проверено 399 интернет-магазинов, в 148 — хотя бы одна манипулятивная практика, в 42 — ложный таймер. Black Friday 2026 — пятница, 27 ноября. Рекламы и магазины — учебные.',
      groups: 'Рекламы — каждый сам, сверка в паре. Станция 4: один — друг с тремя предложениями (ваша карточка), другой советует; потом смена. В 1:1 друг — вы.',
      errors: [
        '«kehtiva pakkumine» → «kehtiv pakkumine» (причастие на -v согласуется: kehtiv pakkumine, kehtivat pakkumist, kehtivas pakkumises).',
        '«allahinnatud jopeid» → «allahinnatud jopesid» — причастие на -tud не меняется, меняется только существительное.',
        '«enne alandust küsiv hind» → «… küsitud hind» (цену спрашивали раньше и не мы → -tud).',
        '«pikenetud leping» → «pikenev leping» (договор продлевается сам → -v).',
      ],
      notes: [
        'Формат — игра: каждый найденный приём (ложная старая цена, таймер, «бесплатно» с условием, продление после пробного периода) — 1 очко у ученика или у вас. Ученик не обязан признаваться в своих покупках: можно говорить о «знакомом».',
        'Студенту — телефон по договору и спортклуб за 1 €; пенсионеру — ложная старая цена и «только сегодня»; маме — детские вещи «3 по цене 2»; уставшему — доставка «бесплатно от 50 €». Совет другу на станции 4 подходит всем.',
        'Обратная связь, 2–3 цели: тип причастия (-v / -tav / -tud / -nud); причастие + своё дополнение впереди («enne alandust küsitud»); совет с причиной, а не запрет («Mina ootaksin, sest …»).',
      ],
    },
    discover: [
      station(B.text('052_d_hook', 'Ostad või ei osta?', 'Silt poe aknas: „Talvejope 199 € → 59 €. –70 %! Pakkumine kehtib veel 2 tundi.” Kas ostaksid? Ütle kohe jah või ei. Mis sind selles sildis kõige rohkem tõmbab: hind, protsent või kell?'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('052_d_talk', 'Soodushinnad ja mina.', 'Vasta ja too näide. Võid rääkida ka tuttava ostust.', [
        'Mida ostsid viimati allahindlusega? Kas seda oli tõesti vaja?',
        'Kas oled ostnud midagi ainult sellepärast, et pakkumine kohe lõppes?',
        'Kas seal, kus sa üles kasvasid, oli suuri sooduspäevi?',
      ], [150, 210], ['Ostsin … ainult sellepärast, et …', 'Hiljem kahetsesin, sest …']), 'Sinu kogemus näitab, milline võte mõjub just sulle.'), { task: 'S11', fluency: true }),
      'Üks-ühele: räägi ka ise üks ost, mida kahetsesid (võib olla väljamõeldud). Ära hinda. Lõpus ütle: „Pea seda meeles — täna otsime just seda nippi.”')),
      station(tag(B.vocab('052_d_vocab', 'Enne kuulamist: sõnad.', ['allahindlus — скидка', 'reklaam — реклама', 'pakkumine — предложение', 'kehtima — действовать (быть в силе)', 'piiratud — ограниченный', 'kampaania — акция (кампания)', 'tingimus — условие', 'ahvatlema — соблазнять', 'eksitav — вводящий в заблуждение', 'kahetsema — сожалеть']), { topic: ['eksitav', 'ahvatlema'] }), 2, 15),
      teach(tag(purpose(B.listening('052_d_ads', 'Kaubanduskeskuse raadio: kuus reklaami.', 'Kuula kuut lühikest reklaami üks kord, nagu eksamil. Kirjuta lünka 1–3 sõna: mis tingimus peitub suure numbri taga?', [
        'Teadustaja: Esimene reklaam. Black Friday algas! Kõik talvejoped kuni seitsekümmend protsenti odavamad. Allahindlus kehtib ainult märgistatud toodetele ja ainult täna kella kaheksani.',
        'Teadustaja: Teine reklaam. Osta kaks paari talvesaapaid ja kolmas paar on tasuta! Tasuta saad kolmest paarist odavaima. Kogus on piiratud.',
        'Teadustaja: Kolmas reklaam. Uus nutitelefon kõigest üheksa eurot kuus! Hind kehtib kahekümne nelja kuu pikkuse lepinguga, lepingutasu on kakskümmend üheksa eurot.',
        'Teadustaja: Neljas reklaam. Spordiklubi Pulss: esimene kuu ühe euro eest! Pärast prooviaega pikeneb leping automaatselt ja kuutasu on nelikümmend üheksa eurot.',
        'Teadustaja: Viies reklaam. Kõik köögitarbed miinus viiskümmend protsenti! Soodushind on arvutatud viimase kolmekümne päeva madalaimast hinnast.',
        'Teadustaja: Kuues reklaam. Tasuta kohaletoimetamine kõigile tellimustele alates viiekümnest eurost. Kampaania lõpeb pühapäeva südaööl.',
      ], [
        'Jopede allahindlus kehtib ainult [märgistatud] toodetele ja ainult täna kella kaheksani.',
        'Kui ostad kaks paari saapaid, saad kolmest paarist tasuta [odavaima|kõige odavama].',
        'Telefoni hind üheksa eurot kuus kehtib ainult [kahekümne nelja kuu|24 kuu] pikkuse lepinguga.',
        'Pärast ühe euro eest prooviaega pikeneb spordiklubi leping [automaatselt|ise] ja maksab rohkem.',
        'Köögitarvete soodushind on arvutatud viimase [kolmekümne päeva|30 päeva] madalaimast hinnast.',
        'Kuller toob kauba tasuta koju ainult siis, kui tellimus on alates [viiekümnest eurost|50 eurost|viiekümnest].',
      ], 'g_read'), 'Kuuled, mis jääb suure numbri varju; sama võtet otsid hiljem sõbra pakkumistest.'), { task: 'L10', harno: 'L1' }),
      'Eksaminurk (L1): eksamil kuuleb lühikesi teateid ainult üks kord. Enne kuulamist loe lüngad läbi (1 min) ja arva, mis sõna sinna sobib. Pärast kontrolli küsi iga reklaami kohta: „Mis on siin nipp?” (ainult märgistatud, odavaim tasuta, 24 kuud, automaatne pikenemine, aus 30 päeva reegel, tasuta ainult üle 50 euro). Viies reklaam on aus — see on hea arutelu algus.'),
    ],
    practice: [
      station(B.notice('052_p_notice', 'Märka: märgistatud toode, piiratud kogus', [
        'Reklaamidest: allahindlus kehtib ainult **märgistatud** toodetele · kogus on **piiratud** · soodushind on **arvutatud** viimase 30 päeva madalaimast hinnast',
        '**-v** (tegija, praegu): leping **kehtib** → **kehtiv** leping · hind **tõuseb** → **tõusev** hind',
        '**-tav / -dav** (tehakse praegu või saab teha): kaupa **müüakse** → **müüdav** kaup · asja saab **parandada** → **parandatav** asi',
        '**-tud / -dud** (tehti, on tehtud): toode **märgistati** → **märgistatud** toode · kaup **toodi** → **toodud** kaup',
        '**-nud** (tegija, juba juhtunud): hind **langes** → **langenud** hind · tähtaeg **möödus** → **möödunud** tähtaeg',
        '**-v** ja **-tav** käänduvad nagu omadussõna (kehtivat lepingut, müüdavas poes); **-tud** ja **-nud** jäävad samaks (märgistatud toodetele). Kesksõnal võib olla oma laiendus ees: **kaks aastat kehtiv** garantii, **aasta aega sõidetud** jalgratas.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('052_p_part', 'Ütle lühemalt: kesksõna täiendina.', 'Kirjuta kõrvallause asemel kesksõnaga täiend; alusta antud sõnadega.', [
        ['Eile ostsin poest jope, mida oli alla hinnatud 30 protsenti.', 'Eile ostsin poest 30 protsenti …', 'Eile ostsin poest 30 protsenti allahinnatud jope.'],
        ['Enne ostu kontrolli alati hinda, mida küsiti enne alandust.', 'Enne ostu kontrolli alati enne alandust …', 'Enne ostu kontrolli alati enne alandust küsitud hinda.'],
        ['Pärast seda kogemust ei taha ma enam ühtegi tellimust, mis pikeneb automaatselt.', 'Pärast seda kogemust ei taha ma enam ühtegi automaatselt …', 'Pärast seda kogemust ei taha ma enam ühtegi automaatselt pikenevat tellimust.'],
        ['See pood müüb ainult kaupa, mida saab tagastada 14 päeva jooksul.', 'See pood müüb ainult 14 päeva jooksul …', 'See pood müüb ainult 14 päeva jooksul tagastatavat kaupa.'],
        ['Minu õde ostis eelmisel nädalal netist telefoni, mida oli kasutatud kaks kuud.', 'Minu õde ostis eelmisel nädalal netist kaks kuud …', 'Minu õde ostis eelmisel nädalal netist kaks kuud kasutatud telefoni.'],
        ['Sooduskood, mis lõppes eile õhtul, ei kehti enam kassas.', 'Eile õhtul …', 'Eile õhtul lõppenud sooduskood ei kehti enam kassas.'],
        ['Sõbra meelest on pakkumine, mis kehtib ainult internetis, natuke kahtlane.', 'Sõbra meelest on ainult internetis …', 'Sõbra meelest on ainult internetis kehtiv pakkumine natuke kahtlane.'],
      ], 'full', 'g_notice'), 'Kesksõnaga täiend teeb lause lühemaks ja täpsemaks — nii kirjutatakse silte, reklaame ja teateid.'), { task: 'G02' }),
      'Pärast iga rida küsi: „Kes teeb ja millal?” Ise teeb praegu → -v (kehtiv, pikenev); keegi teeb praegu või saab teha → -tav (tagastatav); keegi tegi → -tud (allahinnatud, küsitud, kasutatud); ise juhtus → -nud (lõppenud). Read 2–4: -v ja -tav käänduvad (pikenevat, tagastatavat), -tud ei käändu.'),
    ],
    transfer: [
      station(B.text('052_t_law', 'Mida ütleb seadus allahindluse kohta?', 'Mäletad, mida ütleb soodushinna reegel? Läbi kriipsutatud hind ei tohi olla suvaline: see peab olema madalaim hind, mida samas poes küsiti vähemalt 30 päeva enne kampaaniat. Näide: jope maksis kuu aega tagasi 120 eurot, nädal enne Black Friday kampaaniat tõsteti hind 199 euroni ja nüüd on sildil „–70 %”. Ausalt arvutades tuleb uut hinda võrrelda 120 euroga. Võltsi hinda kontrollib Tarbijakaitse ja Tehnilise Järelevalve Amet (TTJA). Nippe on aga rohkem: 2023. aastal uurisid Euroopa Komisjon ja riikide ametid 399 e-poodi ning leidsid, et 148 neist kasutasid vähemalt üht manipuleerivat võtet; 42 poodi näitasid võltsi taimerit.\n\n*Allikas: TTJA, hinna avaldamise juhend (2022); Euroopa Komisjon, pressiteade 30.01.2023.*'), 4, 15, { final: 'advise' }),
      tag(purpose(B.truefalse('052_t_check', 'Kas pood käitub ausalt?', 'Otsusta teksti järgi: kas pood käitub seaduse järgi (õige) või mitte (vale)?', [
        ['Pood tõstab hinna nädal enne kampaaniat ja arvutab allahindluse kõrgemast hinnast.', false],
        ['Pood näitab soodushinna kõrval viimase 30 päeva madalaimat hinda.', true],
        ['Läbi kriipsutatud hinnaga ei ole seda kaupa selles poes kunagi müüdud.', false],
        ['Kuu aega 120 eurot maksnud jope maksab nüüd 90 eurot ja sildil on „–25 %”.', true],
        ['E-poe taimer näitab „veel 10 minutit”, aga pärast lehe uuendamist algab aeg otsast peale.', false],
        ['Sildil on „–50 %” ja varasem hind on viimase 30 päeva madalaim hind.', true],
      ], 'full', 'g_read'), 'Kui tead reeglit, näed võltsi soodushinda ise ega pea poodi uskuma.'), { task: 'R06' }),
      teach(tag(purpose(B.rolecards('052_t_friend', 'Sõber saadab sulle pakkumisi.', 'Sõber (õpetaja) saadab kolm Black Friday pakkumist ja küsib, kas osta. Iga pakkumise kohta nimeta võte, kontrolli tingimust ja ütle oma soovitus.',
        'Olukord: on Black Friday nädal (2026. aastal reede, 27. november); sõber tahab osta talvejope, tahvelarvuti kuumaksega ja spordiklubi paketi.\nSinu eesmärk: iga pakkumise kohta nimeta võte, üks tingimus, mida kontrollida, ja sinu soovitus.\nPiirang: sõber on väga elevil — ära keela, vaid põhjenda.',
        'Sõbra kaart on õpetajal: kolm pakkumist ja tema põhjused.',
        ['See on ajasurve võte: …', 'Kontrolli, mis oli viimase 30 päeva madalaim hind.', 'Automaatselt pikenev leping tähendab, et …', 'Mina ootaksin, sest …', 'Kui sul on seda tõesti vaja, siis …'], ['Aga see kehtib ainult täna!', 'Kõik ju ostavad!', 'Hea küll, ma kontrollin …']), 'Tulemus: sõber teab, millist pakkumist tasub võtta ja millist mitte.'), { task: 'S14', main: true, level: 4 }),
      'Õpetaja kaart (sõber). Ütle ainult seda, mida küsitakse. Pakkumised: 1) jope 199 → 59 €, „veel 2 tundi” — varjatud info: kuu aega tagasi maksis sama jope 79 eurot; 2) tahvelarvuti 9 €/kuus — 24 kuud, lepingutasu 29 €, kokku 245 eurot, aga sõbral on juba sülearvuti; 3) spordiklubi 1 € esimene kuu, siis 49 €, pikeneb automaatselt — sa käisid trennis viimati kevadel. Takistused ükshaaval: 1) „Aga kell käib!” 2) „Kõik kolleegid ostsid juba.” 3) „Kas sa siis ise ei osta midagi?” Õnnestunud, kui õpilane nimetab kõigi kolme võtte, arvutab tahvelarvuti kogukulu, kasutab vähemalt kolm kesksõna täiendina (kehtiv, pikenev, enne alandust küsitud) ja annab iga pakkumise kohta selge soovituse koos põhjusega.'),
      extension(teach(tag(purpose(B.speaking('052_t_more', 'Mäng: aus reklaam 30 sekundiga', 'Vali üks asi, mis sul praegu käes on (pliiats, kott, võtmehoidja), ja müü seda õpetajale 30 sekundit ausalt: tegelik kasu, tegelik hind ja tingimused, ilma võltsi allahindluse ja taimerita. Õpetaja otsib sinu jutust nippi ja esitab küsimuse; siis vahetate rollid.', [
        'Mis on selle asja tegelik kasu ja kellele see sobib?',
        'Mis on selle tegelik hind ja millised on tingimused?',
        'Mida vastad, kui õpetaja küsib: „Miks ma peaksin ostma just täna?”',
      ], [120, 180], ['See on kaks aastat kasutatud, aga …', 'Hind on …, see kehtib …', 'Ma ei ütle, et see on ainult täna, sest …']), 'Kui oskad ise ausalt müüa, tunned võlts reklaami kiiresti ära.'), { task: 'S16', fluency: true }),
      'Kui aega jääb (12 min). Seejärel vahetage: sina müüd ühe asja „Black Friday stiilis” kõigi nippidega ja õpilane leiab need. Punkt igale leitud nipile ja igale õigele kesksõnale (piiratud, kehtiv, allahinnatud).'), 12),
      tag(exitCheck(purpose(B.gaps('052_t_exit', 'Kontrolli end: kolm kesksõna.', 'Kirjuta sulgudes olev tegusõna kesksõnana õiges vormis.', [
        'Selle [kehtiva] pakkumise lõpuni on jäänud kaks päeva. (kehtima)',
        'Kassas selgus, et [allahinnatud] toodete hulgas mu jopet ei olnudki. (alla hindama)',
        'Sildil oli nädal enne kampaaniat [tõusnud] hind, mitte kuu aja madalaim hind. (tõusma)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas kesksõna liik ja vorm on käes.')), {}),
      purpose(B.selfcheck('052_t_self', ['Ma räägin oma kogemusest sooduspakkumistega.', 'Ma saan lühikestest reklaamidest aru, mis tingimus peitub suure numbri taga.', 'Ma kasutan kesksõnu täiendina: kehtiv pakkumine, allahinnatud jope, enne alandust küsitud hind.', 'Ma annan sõbrale põhjendatud nõu, kas pakkumine tasub end ära.'], 'Nipid leitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('052_t_letter', 'Kodus: hoiatus naabritele.', 'Kirjuta kodus linnaosa foorumisse või maja vestlusesse 160–180 sõna: milliseid Black Friday võtteid sa märkasid (vähemalt kolm näitega), mida seadus soodushinna kohta ütleb ja sinu kolm reeglit enne ostu. Kasuta vähemalt nelja kesksõna täiendina.', 'Tere, naabrid!', 'Ilusat nädalat!\n(sinu nimi)', [160, 180]), 'Naabrid loevad sinu postitust enne sooduspäevi ja teavad, mida kontrollida.')), { task: 'W08', level: 4 }),
      tag(homeTask(purpose(B.speaking('052_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: kas Black Friday on sinu arvates ostjale pigem kasulik või ohtlik ja miks.', [
        'Millal on sooduspäev tõesti kasulik?',
        'Millist võtet sa kõige rohkem kardad?',
      ], [60, 120]), 'Õpetaja kuulab, kas põhjendus on selge ja kesksõnad õiged.')), { task: 'S15' }),
      homework('052_t_homework', ['1. Hoiatus naabritele, 160–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-053': {
    title: 'Netist tellitud jope ei sobi — kas raha tuleb tagasi?',
    phases: grammar('Keel: umbisikuline tegumood tingimustes ja viisakas nõue — raha tagastatakse, kaupa ei vahetata; paluksin, oleksin tänulik, kas saaksite'),
    format: 'case',
    topic: 'money',
    subtopic: 'returns',
    canDo: 'Ma saan tarbijanõustaja raadiosaatest aru, millal võin netiostust taganeda, loen e-poe tingimusi kriitiliselt ja kirjutan poele viisaka, aga kindla taganemisteate; mõistan umbisikulisi tingimusi (raha tagastatakse, kaupa ei vahetata) ja esitan nõude tingivas kõneviisis (paluksin, oleksin tänulik).',
    teacherPage: {
      goal: 'Случай: куртка из интернет-магазина не подошла. Право отказа 14 дней (VÕS), незаконные пункты условий, письмо магазину; безличный залог в условиях и вежливое требование в условном наклонении.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 строки; станция 4 — условия магазина и только 3 вопроса, разговор без третьего препятствия. Радио (станция 2) — дома по записи.',
      hook: '«Ты купил в торговом центре туфли, дома понял, что они не нравятся. Они целые, в коробке. Обязан ли магазин вернуть деньги: да, нет или зависит от магазина? А если ты заказал их в интернете?» Ответьте оба. Ответ не раскрывайте — его даст радио.',
      plan: [
        '0–5: крючок — туфли из магазина и куртка из интернета; голосование: 5 догадок «у кого право» (ответ не говорим)',
        '5–12: станция 1 — разговор: что я возвращал и как это было',
        '12–27: станция 2 — слова (2 мин), радио «Потребитель спрашивает» дважды, 6 пропусков, проверка догадок',
        '27–39: станция 3 — заметить в радио ei tagastata / trükiti → правило → резкое письмо друга сделать вежливым: 7 трансформаций',
        '39–54: станция 4 — условия магазина «Talvemood» и закон, 6 коротких ответов (R2b), звонок в службу клиентов',
        '54–66: «Kui aega jääb» — «линия советов»: три быстрых звонка',
        '66–73: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '73–81: домашнее задание: уведомление об отказе 160–180 слов, запись 1 минуты, слова',
        '81–90: запас',
      ],
      sources: 'Võlaõigusseadus §-d 49 (14 дней отказа от договора на расстоянии, с получения товара), 53 (исключения: товар по заказу покупателя, вскрытая гигиеническая упаковка), 56 (возврат денег в течение 14 дней тем же способом; магазин может ждать возврата товара или доказательства отправки), Riigi Teataja; TTJA, «Ostmine e-poest» (2024): при покупке в обычном магазине без дефекта права вернуть нет, это добрая воля магазина; директива ЕС 2023/2673: кнопка отказа в интернет-магазине с 19.06.2026; дефект — ответственность продавца 2 года (VÕS § 218). Консультант Kaja Tamm, магазин «Talvemood» и звонящие — учебные.',
      groups: 'Радио — каждый сам, сверка в паре. Станция 4: один — покупатель, другой — служба клиентов с вашей карточкой; потом смена. В 1:1 служба клиентов — вы.',
      errors: [
        '«Raha tagastakse» → «Raha tagastatakse» (безличный залог: -takse / -takse, основа tagasta-).',
        '«Allahinnatud kaupa ei tagastatakse» → «… ei tagastata» (в отрицании безличного -ta без -kse).',
        '«Ma palun, et te tagastate raha» звучит как приказ → «Paluksin raha tagastada» / «Oleksin tänulik, kui tagastaksite …».',
        '«Kui te ei tagasta raha, ma pöördun …» → «Kui te raha ei tagasta, pöördun ma …» (после придаточного глагол сразу).',
      ],
      notes: [
        'Формат — реальный случай: у ученика есть заказ, условия магазина и закон. Главное открытие урока: в обычном магазине вернуть целую вещь — добрая воля, в интернете — право на 14 дней. Не превращайте урок в юридическую консультацию: учебные факты, источник — TTJA.',
        'Студенту — наушники и одежда онлайн; пенсионеру — покупка по телефону или в интернете для внуков; маме — детская одежда, которая не подошла по размеру; уставшему — посылка в пакоматe. Ученик без опыта онлайн-покупок играет «помощника» друга.',
        'Обратная связь, 2–3 цели: безличный залог при чтении условий («кто платит?»); вежливое, но твёрдое требование (paluksin, oleksin tänulik + срок); ссылка на закон без угроз.',
      ],
    },
    discover: [
      station(B.text('053_d_hook', 'Kas pood peab raha tagasi andma?', 'Kingad poest ei meeldi kodus. Netist tellitud jope ei sobi. Kas raha tuleb tagasi? Arva kohe ja märgi oma vastused — raadio ütleb hiljem, kellel oli õigus.'), 1, 12),
      teach(tag(purpose(B.choice('053_d_vote', 'Arva: kellel on õigus?', 'Vali iga olukorra juurde vastus, mida sa praegu arvad. Pärast raadiosaadet kontrolli.', [
        ['Ostsid kaubanduskeskusest terved kingad, mis kodus ei meeldi. Kas pood peab raha tagasi andma?', 'ei, see on poe hea tahe', 'jah, 14 päeva jooksul', 'jah, aga ainult kinkekaardina'],
        ['Tellisid netist jope, kuller tõi selle 10 päeva tagasi, suurus ei sobi. Kas saad taganeda?', 'jah, sest 14 päeva ei ole veel möödas', 'ei, sest jope oli allahinnatud', 'ainult siis, kui jopel on puudus'],
        ['Tellisid tassi, millele trükiti sinu lapse pilt. Kas saad selle tagastada, kui see on terve?', 'ei, see on tehtud tellija soovi järgi', 'jah, nagu iga netiostu', 'jah, aga ainult poes'],
        ['Pood teavitas ette, et tagasisaatmine maksab 6 eurot. Kes selle maksab?', 'ostja', 'pood', 'kuller'],
        ['Pood sai sinu taganemisteate kätte. Mis ajaks peab raha tagasi tulema?', '14 päeva jooksul', '30 päeva jooksul', 'siis, kui poel on aega'],
      ], 'full', 'g_read'), 'Sinu oletus on raadiosaate küsimus: kuulates kontrollid, kas teadsid oma õigusi.'), { task: 'L02' }),
      'Hääletus: lase õpilasel kõik viis vastust kiiresti märkida, ära paranda. Pärast raadiot (jaam 2) vaadake koos, mitu oletust oli õige. Paljud arvavad, et poest ostetud terve kauba võib alati tagastada.'),
      inLesson(teach(tag(purpose(B.speaking('053_d_talk', 'Ostud, mis ei sobinud.', 'Vasta ja too näide. Võid rääkida ka tuttava loo.', [
        'Kas oled midagi tagasi viinud või saatnud? Kuidas see läks?',
        'Mida tellid netist ja mida ostad ainult poest?',
        'Mis on tagastamisel kõige ebameeldivam?',
      ], [150, 210], ['Kord tellisin …, aga …', 'Pood vastas, et …']), 'Sinu kogemus annab raadiosaatele esimese küsimuse.'), { task: 'S07', fluency: true }),
      'Üks-ühele: räägi ka ise üks lugu (võib olla väljamõeldud). Kui õpilane netist ei telli: „Mida sa teeksid, kui sugulane palub sul tema eest e-poest midagi tagastada?” Ära ütle veel, kellel on õigus.')),
      station(tag(B.vocab('053_d_vocab', 'Enne kuulamist: sõnad.', ['taganema — отказываться (от договора)', 'tagastama — возвращать', 'kuller — курьер', 'tingimused — условия', 'vahetama — обменивать', 'puudus — дефект (недостаток)', 'tellija — заказчик', 'hea tahe — добрая воля', 'kinkekaart — подарочная карта', 'klienditeenindus — служба клиентов']), { topic: ['taganema', 'kinkekaart'] }), 2, 15),
      teach(tag(purpose(B.listening('053_d_radio', 'Raadio: tarbija küsib, nõustaja vastab.', 'Kolm kuulajat helistavad raadiosaatesse. Kuula kaks korda, kirjuta lünka 1–3 sõna ja kontrolli oma oletusi jaamast 1.', [
        'Saatejuht: Tere! Täna vastab teie küsimustele tarbijanõustaja Kaja Tamm. Esimene helistaja, palun.',
        'Esimene helistaja: Tere! Ostsin kaubanduskeskusest kingad, aga kodus need enam ei meeldinud. Pood keeldub raha tagasi andmast. Kas see on seaduslik?',
        'Kaja: Kahjuks on. Kui ostsite poest kohapeal ja kaubal ei ole puudust, ei ole poel kohustust kaupa tagasi võtta. Paljud poed teevad seda heast tahtest, aga seadus seda ei nõua. Seepärast küsige tagastamise kohta juba enne ostu.',
        'Teine helistaja: Tellisin e-poest talvejope. Sain selle kätte kümme päeva tagasi, aga suurus ei sobi. Tingimustes on kirjas, et allahinnatud kaupa ei tagastata.',
        'Kaja: Netiostust võite seaduse järgi taganeda neljateistkümne päeva jooksul ja see aeg algab kauba kättesaamisest. Põhjust ei pea ütlema. Õigus kehtib ka allahinnatud kaubale, sest seadusest halvemaid tingimusi ei saa pood kehtestada. Kui pood teavitas teid ette, maksate tagasisaatmise kulud ise. Raha peab tulema tagasi neljateistkümne päeva jooksul alates teie teatest, aga pood võib oodata, kuni kaup on kohale jõudnud.',
        'Kolmas helistaja: Tellisin tassi, millele trükiti minu lapse pilt. Kas seda saab tagastada?',
        'Kaja: Kahjuks mitte. Kui kaup on tehtud tellija soovi järgi, taganemisõigust ei ole. Sama kehtib näiteks kõrvaklappide kohta, kui olete kinnise pakendi avanud. Aga kui tass tuli katki, on see puudus ja müüja peab selle parandama, asendama või raha tagastama.',
        'Saatejuht: Aitäh, Kaja!',
      ], [
        'Poest ostetud kauba tagastamise kohta tuleks küsida juba [enne ostu].',
        'Netiostust võib taganeda [neliteist päeva|14 päeva] alates kauba kättesaamisest.',
        'Taganemiseks ei pea poele [põhjust] ütlema.',
        'Taganemisõigus kehtib ka [allahinnatud] kaubale.',
        'Kui pood teavitas ette, maksab ostja ise [tagasisaatmise kulud|saatmiskulud|tagasisaatmise].',
        'Lapse pildiga tassi ei saa tagastada, sest see on tehtud [tellija soovi järgi|ostja soovi järgi|tellija soovil].',
      ], 'g_read'), 'Raadiost saad teada oma õigused; nendele toetud hiljem kirjas poele.'), { voice: 'interview', task: 'L04' }),
      'Kuulamise tsükkel: 1) prognoos: „Kellel on õigus?”; 2) esimene kuulamine — „Kumb helistaja saab raha tagasi?”; 3) teine — lüngad; 4) detail: „Millest algab 14 päeva?”; 5) üks lause: „Mis sind üllatas?” Paljud arvavad, et ka kohapeal ostetud kauba võib alati tagastada: see on poe hea tahe, mitte seadus.'),
    ],
    practice: [
      station(B.notice('053_p_notice', 'Märka: kaupa ei tagastata — paluksin raha tagasi', [
        'Raadiost: allahinnatud kaupa **ei tagastata** · tassile **trükiti** lapse pilt · pood võib oodata, kuni kaup on kohale jõudnud',
        '**Umbisikuline tegumood** — tegija ei ole tähtis või on „pood” üldiselt: kaup **saadetakse** (praegu), kaup **saadeti** (minevikus), kaup **on saadetud** · eitus: **ei saadeta**, **ei saadetud**',
        'Tingimusi lugedes küsi: kes teeb? „Tagasisaatmise kulud **kaetakse** ostja poolt” = ostja maksab. „Aega **arvestatakse** kauba kättesaamisest” = kaup on sinu käes. „Kaup **vahetatakse** heast tahtest” = pood vahetab, kuigi kaubal ei ole puudust. „Summa **makstakse** välja kinkekaardina” = pood ei maksa raha, vaid annab kaardi.',
        '**Viisakas nõue tingivas kõneviisis**: **Paluksin** teil … · **Oleksin tänulik**, kui te … · **Kas saaksite** … ? · Kindlam, aga viisakas: **Palun** tehke seda hiljemalt …',
        '**Tagajärg ilma ähvarduseta**: Kui ma vastust ei **saaks**, **pöörduksin** tarbijavaidluste komisjoni poole.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('053_p_polite', 'Vihasest kirjast viisakas nõue.', 'Sõbra kiri poele on liiga terav. Kirjuta iga lause ümber antud sõnadega: tingimuste lauses umbisikuline, nõudes tingiv kõneviis.', [
        ['Te kirjutate oma tingimustes, et raha tagastate 30 päeva jooksul.', 'Teie tingimustes on kirjas, et raha …', 'Teie tingimustes on kirjas, et raha tagastatakse 30 päeva jooksul.'],
        ['Andke mu raha kohe tagasi!', 'Paluksin …', 'Paluksin raha tagastada.|Paluksin raha tagasi maksta.|Paluksin mulle raha tagastada.|Paluksin raha tagasi kanda.'],
        ['Teie pood ei võta allahinnatud kaupa tagasi.', 'Teie poes …', 'Teie poes allahinnatud kaupa tagasi ei võeta.|Teie poes ei võeta allahinnatud kaupa tagasi.'],
        ['Saatke mulle tagastamise aadress.', 'Kas saaksite …', 'Kas saaksite mulle tagastamise aadressi saata?|Kas saaksite saata mulle tagastamise aadressi?'],
        ['Vastake mulle hiljemalt reedeks!', 'Oleksin tänulik, …', 'Oleksin tänulik, kui vastaksite mulle hiljemalt reedeks.|Oleksin tänulik, kui te vastaksite mulle hiljemalt reedeks.'],
        ['Kuller tõi jope mulle 3. novembril.', 'Jope …', 'Jope toodi mulle 3. novembril.'],
        ['Kui te raha ei tagasta, kirjutan tarbijavaidluste komisjonile.', 'Kui te raha ei tagastaks, …', 'Kui te raha ei tagastaks, kirjutaksin tarbijavaidluste komisjonile.|Kui te raha ei tagastaks, pöörduksin tarbijavaidluste komisjoni poole.'],
      ], 'full', 'g_notice'), 'Viisakas, aga kindel kiri saab kiiremini vastuse kui vihane kiri.'), { task: 'G14' }),
      'Pärast iga rida küsi: „Kas see on tingimus (kes teeb?) või nõue (kui viisakas?)” Rida 3: eitus umbisikulises — ei võeta. Rida 6: aktiivne lause → umbisikuline, tegija (kuller) kaob. Rida 7: tingimus ja tagajärg mõlemad tingivas, kuid ilma ähvarduseta.'),
    ],
    transfer: [
      station(B.text('053_t_terms', 'E-poe „Talvemood” tingimused ja seadus', '**1.** Tagastamine on võimalik 7 päeva jooksul tellimuse esitamisest.\n\n**2.** Allahinnatud kaupa ei tagastata ega vahetata.\n\n**3.** Raha tagastatakse ainult kinkekaardina.\n\n**4.** Raha kantakse tagasi 30 päeva jooksul pärast kauba saabumist lattu.\n\n**5.** Tagasisaatmise kulud kaetakse ostja poolt.\n\n**Seadus:** netiostust võib taganeda 14 päeva jooksul alates kauba kättesaamisest; pood maksab raha tagasi 14 päeva jooksul taganemisteatest samal viisil, nagu maksti; seadusest halvemad tingimused ei kehti. Alates 19. juunist 2026 peab e-poes olema nähtav taganemise nupp.\n\n*Allikas: võlaõigusseadus §-d 49, 53 ja 56 (Riigi Teataja); TTJA, „Ostmine e-poest”; ELi direktiiv 2023/2673.*'), 4, 15, { final: 'complain' }),
      teach(tag(purpose(B.table('053_t_ask', 'Kas see tingimus kehtib?', 'Vasta teksti järgi 1–3 sõnaga.', 'Küsimus, Vastus', [
        'Mitu päeva on seaduse järgi netiostust taganemiseks? | [14/neliteist/14 päeva/neliteist päeva]',
        'Millest algab taganemise aeg: tellimusest või kauba kättesaamisest? | [kauba kättesaamisest/kättesaamisest]',
        'Kas punkt 2 allahinnatud kauba kohta kehtib? | [ei/ei kehti]',
        'Kuidas peab pood raha tagastama: kinkekaardina või samal viisil? | [samal viisil/samamoodi/nagu maksti]',
        'Mitme päeva jooksul taganemisteatest peab raha tagasi tulema? | [14/neliteist/14 päeva/neliteist päeva]',
        'Kas punkt 5 tagasisaatmise kulude kohta võib kehtida? | [jah/võib/jah võib]',
      ], 'g_read'), 'Kui tead, millised tingimused ei kehti, oskad poe vastust kontrollida.'), { task: 'R15', harno: 'R2b' }),
      'Eksaminurk (R2b): eksamil on 200–300-sõnaline teabetekst ja lühivastused 1–3 sõnaga. Siin on tekst lühem, sest põhitöö on kõne poega. Punkt 5 on aus küsimus: kulud võivad jääda ostjale, kui pood teavitas ette.'),
      teach(tag(purpose(B.rolecards('053_t_call', 'Helista klienditeenindusse.', 'Helista e-poe „Talvemood” klienditeenindusse (õpetaja): taganed ostust ja tahad raha tagasi.',
        'Olukord: sina oled tellija — tellisid allahinnatud talvejope 89 euro eest, said selle kätte 10 päeva tagasi, suurus ei sobi. Jope on kandmata ja sildid on küljes.\nSinu eesmärk: teata taganemisest, viita seadusele ja lepi kokku, kuidas ja millal raha tagasi tuleb.\nPiirang: püsi viisakas ka siis, kui teenindaja keeldub; nõua, aga ära ähvarda.',
        'Teenindaja kaart on õpetajal: poe vastuväited ja üks pakkumine.',
        ['Soovin ostust taganeda, sest …', 'Teie tingimustes on kirjas, et …, aga seaduse järgi …', 'Paluksin raha tagastada samal viisil, nagu maksin.', 'Oleksin tänulik, kui …', 'Kas saaksite kinnitada …?'], ['Kahjuks allahinnatud kaupa ei tagastata.', 'Saame pakkuda kinkekaarti.', 'Raha kantakse tagasi 30 päeva jooksul.']), 'Tulemus: tead, millal ja kuidas raha tagasi tuleb, ning sul on see kirjalikult lubatud.'), { task: 'S10', level: 4 }),
      'Õpetaja kaart (teenindaja). Ütle ainult seda, mida küsitakse. Takistused ükshaaval: 1) „Allahinnatud kaupa me ei tagasta, see on tingimustes kirjas.” 2) „Võin pakkuda kinkekaarti, isegi 10 % rohkem!” 3) „Raha kantakse tagasi 30 päeva jooksul.” 4) „Kas jopet on kantud?” Kui õpilane viitab seadusele viisakalt, anna järele ja küsi, kas ta saadab taganemisteate kirjalikult. Õnnestunud, kui õpilane viitab 14 päevale kättesaamisest, keeldub kinkekaardist viisakalt, nõuab raha samal viisil 14 päeva jooksul, kasutab vähemalt kaks tingivat viisakat vormi ja ühe umbisikulise vormi ning lepib kokku kirjaliku kinnituse.'),
      extension(teach(tag(purpose(B.speaking('053_t_more', 'Nõuandeliin: kolm kiiret kõnet', 'Nüüd oled sina tarbijanõustaja. Õpetaja helistab sulle kolme eri inimesena ja kirjeldab oma muret. Kuula, vasta ja põhjenda: kas inimesel on õigus ja mida ta peaks tegema.', [
        'Kõne 1: ostsin poest telefoni, nägin hiljem teises poes odavamat — kas saan tagastada?',
        'Kõne 2: tellisin netist diivani, sain selle 16 päeva tagasi, värv ei meeldi — mis nüüd?',
        'Kõne 3: tellisin emale saapad; e-poes ei leia ma taganemise nuppu, ainult pika vormi — kas see on lubatud?',
      ], [120, 180], ['Teil on õigus …, sest …', 'Kahjuks …, aga võiksite …', 'Soovitaksin kõigepealt …']), 'Kui oskad teistele seletada, tead oma õigusi kindlalt.'), { task: 'L06' }),
      'Kui aega jääb (12 min). Räägi iga mure ühe korra, rahulikult, nagu päris helistaja. Vastused: 1) ei ole kohustust (hea tahe), küsi poe enda reegleid; 2) 14 päeva on möödas — taganemisõigust enam ei ole, kui pood teavitas õigesti; 3) alates 19.06.2026 peab nupp olema nähtav, teata TTJA-le. Õnnestunud, kui õpilane kuulab detailid (päevad, poest või netist) ja põhjendab iga vastust.'), 12),
      tag(exitCheck(purpose(B.gaps('053_t_exit', 'Kontrolli end: kolm vormi.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Teie tingimuste järgi [tagastatakse] raha 14 päeva jooksul pärast taganemisteadet. (tagastama, umbisikuline)',
        'Kahjuks allahinnatud kaupa meie poes ei [vahetata] ega võeta tagasi. (vahetama, umbisikuline eitus)',
        'Seetõttu [paluksin] teil raha minu kontole hiljemalt reedeks tagasi kanda. (paluma, tingiv)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas umbisikuline vorm ja viisakas nõue on käes.')), {}),
      purpose(B.selfcheck('053_t_self', ['Ma räägin oma kogemusest ostudega, mis ei sobinud.', 'Ma saan raadiost aru, millal võin netiostust taganeda ja millal mitte.', 'Ma loen umbisikulisi tingimusi (raha tagastatakse) ja nõuan viisakalt (paluksin, oleksin tänulik).', 'Ma räägin klienditeenindusega kindlalt ja kirjutan taganemisteate.'], 'Õigus kasutatud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('053_t_letter', 'Kodus: taganemisteade e-poele.', 'Kirjuta e-poele „Talvemood” 160–180 sõna: mida ja millal tellisid, et taganed, kaks tingimust, mis seadusega ei sobi, ning kuidas ja mis ajaks raha tagasi palud. Kasuta umbisikulist ja tingivat vormi.', 'Lugupeetud klienditeenindus!', 'Lugupidamisega\n(sinu nimi), tellimus nr …', [160, 180]), 'Pood saab sinu kirjast aru, mida sa nõuad ja mis ajaks; kiri on ka sinu tõend.')), { task: 'W13', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('053_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: seleta sõbrale, mille poolest erineb poest ja e-poest ostmine, kui asi ei sobi.', [
        'Mis juhtub, kui ostsid poest kohapeal?',
        'Mida pead tegema, kui ostsid netist?',
      ], [60, 120]), 'Õpetaja kuulab, kas faktid ja umbisikulised vormid on õiged.')), { task: 'S15' }),
      homework('053_t_homework', ['1. Taganemisteade e-poele, 160–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-054': {
    title: 'Pesumasin läks katki: säästud, järelmaks või kiirlaen?',
    phases: grammar('Keel: kaalutud seisukoht — kuigi …, (siiski); küll …, aga …; ühest küljest …, teisest küljest …; seevastu'),
    format: 'debate',
    topic: 'money',
    subtopic: 'credit',
    canDo: 'Ma loen pakkumisi ja võrdlen ostu rahastamise võimalusi (säästud, järelmaks, kiirlaen, kasutatud asi) kogukulu järgi, tean, mida seadus laenu hinna kohta ütleb, ja räägin väitlusel kaalutud seisukohast; vastuargumendiga arvestan sõnadega kuigi, küll … aga, seevastu.',
    teacherPage: {
      goal: 'Дебаты: сломалась стиральная машина — копить, рассрочка, быстрый кредит или б/у. Ученик считает полную стоимость, знает предел цены кредита и защищает взвешенную позицию: kuigi, küll … aga, seevastu.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 строки; станция 4 — один раунд дебатов без форума, карточка правил — дома. Расчёт (станция 2) — дома, ответы в начале следующего урока.',
      hook: '«Сломалась стиральная машина. Новая стоит 450 €, на счету 200. Что делаешь: копишь и пока ходишь в прачечную, берёшь в рассрочку, быстрый кредит, покупаешь б/у или просишь у родственника? Выбери сразу и одна причина.» Голосуйте оба, без оценки.',
      plan: [
        '0–3: крючок — стиральная машина, ученик выбирает сразу',
        '3–10: станция 1 — разговор: что я купил бы в рассрочку и что никогда',
        '10–25: станция 2 — слова (2 мин), четыре предложения, расчёт полной стоимости (6 ответов), сюрприз: «0 %» рассрочка — не бесплатно',
        '25–37: станция 3 — заметить в карточках kuigi / küll … aga → правило → 7 взвешенных предложений',
        '37–52: станция 4 — форум «рассрочка — помощь или ловушка?», дебаты с карточками A/B, голосование; карточка «Minu viis rahareeglit»',
        '52–64: «Kui aega jääb» — родственник хочет быстрый кредит',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: рассуждение (W2b), запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Võlaõigusseadus § 406² (Riigi Teataja; судебная практика): ставка полной стоимости потребительского кредита не может превышать среднюю ставку Eesti Pank более чем в три раза, иначе договор ничтожен (31.05.2025 средняя 15,68 % → предел 47,04 %); директива ЕС 2023/2225 (CCD2): правила применяются с 20.11.2026, в т. ч. к небольшим и беспроцентным «купи сейчас, плати потом»; в Эстонии — законопроект 947 SE (изменение VÕS). Расчёты наши: рассрочка 12 × 37,50 € + 19 € + 12 × 2,50 € = 499 €, годовая ставка ≈ 22 %; быстрый кредит 12 × 45 € = 540 €, ≈ 41 %; прачечная 3 × 6 × 4 € = 72 €. Предложения, форум (Liina, Marek) — учебные.',
      groups: 'Расчёт — каждый сам, сверка в паре. Дебаты: двое с карточками A и B, третий — ведущий и считает аргументы. В 1:1 вы берёте другую карточку, потом меняетесь.',
      errors: [
        '«Kuigi järelmaks on mugav, see on kallis» → «Kuigi järelmaks on mugav, on see kallis» (после придаточного глагол сразу).',
        '«küll … kuid aga» → «küll …, aga …» или «küll …, kuid …» (одно противительное слово).',
        '«seevastu» в начале без сравнения двух вещей → «Uus masin on kallis, kasutatud masin seevastu odav».',
        '«Ma võtaksin laen» → «Ma võtaksin laenu» (laenu võtma — частичный объект в обороте; в условном тоже).',
      ],
      notes: [
        'Формат — дебаты с голосованием: в начале и в конце ученик голосует; честный результат — «смотря что и сколько», если аргументы взвешены. Не советуйте конкретные финансовые продукты: урок учит считать полную стоимость, а не выбирать банк.',
        'Студенту — телефон в рассрочку; пенсионеру — «звонят и предлагают кредит», б/у техника; маме — детская коляска и стиральная машина; уставшему — машина ломается в конце месяца. Если тема долгов болезненна, ученик говорит о «знакомом».',
        'Обратная связь, 2–3 цели: уступка + вывод (kuigi …, siiski …); число как аргумент («499 eurot, mitte 450»); вежливое несогласие («Ma saan aru, aga …»).',
      ],
    },
    discover: [
      station(B.text('054_d_hook', 'Mida sa teed?', 'Pesumasin läks katki. Uus maksab 450 eurot, kontol on 200. Mida teed: kogud raha ja käid seni pesumajas, ostad järelmaksuga, võtad kiirlaenu, ostad kasutatud masina või küsid sugulaselt? Vali kohe ja ütle üks põhjus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('054_d_talk', 'Kohe või hiljem?', `Vasta ja too näide. ${NO_FIGURES}`, [
        'Mida ostaksid järelmaksuga ja mida mitte kunagi?',
        'Kas ostad kasutatud asju? Mida ja kust?',
        'Kas sinu kodumaal võetakse laenu kergemini?',
      ], [150, 210], ['Kuigi …, ostaksin pigem …', 'Ma ei võtaks kunagi …, sest …']), 'Sinu harjumus annab väitlusele esimese seisukoha.'), { task: 'S03', fluency: true }),
      'Üks-ühele: räägi ka ise (võib olla väljamõeldud). Ära küsi päris laenude ega võlgade kohta. Kirjuta tahvlile õpilase esimene valik: lõpus hääletab ta uuesti.')),
      station(tag(B.vocab('054_d_vocab', 'Enne lugemist: sõnad.', ['järelmaks — рассрочка', 'kiirlaen — быстрый кредит', 'intress — процент', 'tasu — плата', 'makse — платёж', 'leping — договор', 'risk — риск', 'viivis — пеня (за просрочку)', 'võlg — долг', 'kasutatud — подержанный (б/у)']), { topic: ['kiirlaen', 'viivis'] }), 2, 15),
      tag(purpose(B.profiles('054_d_offers', 'Neli võimalust, üks pesumasin.', 'Loe nelja võimalust. Märgi iga juurde, mis on hea ja mis on risk. Pakkumised on näidised. *Allikas: võlaõigusseadus § 406² (Riigi Teataja); Eesti Pank, tarbimislaenude keskmine kulukuse määr (2025).*', [
        ['A · Kogu ja oota', ['raha on koos umbes 3 kuu pärast', 'seni pesumaja: 4 € masinatäis, umbes 6 korda kuus', 'kuigi ootamine on tüütu, võlgu ei jää', 'uus masin 450 €, garantii 2 aastat', 'risk: raha võib vahepeal muuks kuluda'], []],
        ['B · „0 % järelmaks” poes', ['12 kuud × 37,50 €', 'lepingutasu 19 €, kuutasu 2,50 €', 'kuigi intressi ei ole, on krediidi kulukuse määr (laenu tegelik aastahind) umbes 22 %', 'hilinemisel viivis ja maksehäire', 'leping poes kümne minutiga'], []],
        ['C · Kiirlaen äpis', ['raha on kontol 15 minutiga', '450 € 12 kuuks, kuumakse 45 €', 'raha on küll kohe käes, aga kulukuse määr on umbes 41 %', 'seaduse piir: kolm korda Eesti Panga keskmine (2025: umbes 47 %)', 'kiiruse eest maksad: võlg kestab aasta'], []],
        ['D · Kasutatud masin', ['kuulutus: 4 aastat vana, 160 € + transport 25 €', 'müüja annab 3 kuud garantiid', 'hind on küll madal, kuid seisukorda tuleb ise kontrollida', 'vanem masin võib kulutada rohkem elektrit', 'makse sularahas, võlgu ei jää'], []],
      ], '2', 'g_read'), 'Kaardid annavad faktid, millega väitluses oma seisukohta kaitsed.'), { task: 'R11' }),
      teach(tag(purpose(B.table('054_d_cost', 'Arvuta kogukulu.', 'Arvuta kaartide põhjal ja kirjuta vastus.', 'Küsimus, Vastus', [
        'Kui palju maksab B järelmaks kokku (12 × 37,50 + lepingutasu + 12 kuutasu)? | [499/499 €/499 eurot]',
        'Kui palju maksab C kiirlaen kokku 12 kuuga? | [540/540 €/540 eurot]',
        'Mitu eurot on C kallim kui uue masina hind? | [90/90 €/90 eurot]',
        'Kui palju maksab A puhul pesumaja kolme kuuga? | [72/72 €/72 eurot]',
        'Kui palju maksab D koos transpordiga? | [185/185 €/185 eurot]',
        'Milline uue masina variant on kokku kõige odavam: A, B või C? | [B/järelmaks/B järelmaks]',
        'Mitu eurot odavam on B kui A koos pesumajaga? | [23/23 €/23 eurot]',
      ], 'g_read'), 'Numbrid näitavad, et kõige odavam ei ole alati see, mis paistab; neid kasutad väitluses.'), { task: 'R01' }),
      'Pärast arvutamist küsi: „Mis sind üllatas?” Tavaliselt: „0 % järelmaks” maksab ikka 49 eurot rohkem, aga ootamine koos pesumajaga (450 + 72 = 522) on veel kallim. Kiirlaen (540) on kõige kallim, kuigi seaduse piirist allpool. Kasutatud masin (185) on odav, aga riskantne. Ära anna „õiget” vastust — see on väitluse materjal.'),
    ],
    practice: [
      station(B.notice('054_p_notice', 'Märka: kuigi intressi ei ole, …', [
        'Kaartidest: **kuigi** intressi ei ole, **on** krediidi kulukuse määr umbes 22 % · raha on **küll** kohe käes, **aga** kulukuse määr on umbes 41 % · hind on **küll** madal, **kuid** seisukorda tuleb ise kontrollida',
        '**Kuigi** + kõrvallause, siis pealause (sageli **siiski / ikkagi**): **Kuigi** pood on kaugel, **käin** ma seal **siiski** iga nädal. Kui kuigi-lause on ees, tuleb pealauses tegusõna kohe.',
        '**küll …, aga / kuid**: Buss on **küll** aeglane, **aga** odav. · **Ühest küljest** …, **teisest küljest** … · **Samas** … (teine pool)',
        '**seevastu** vastandab kaht asja: Linnas on üür kõrge, maal **seevastu** madal.',
        '**Kaalutud seisukoht** = arvamus + vastuargument + järeldus: **Kuigi** auto on mugav, **eelistaksin** ma bussi, **sest** …',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('054_p_concede', 'Ühenda vastuargumendiga.', 'Ühenda kaks mõtet üheks kaalutud lauseks antud sõnaga.', [
        ['Järelmaks on intressita. Lepingutasu ja kuutasu teevad selle kallimaks.', 'kuigi', 'Kuigi järelmaks on intressita, teevad lepingutasu ja kuutasu selle kallimaks.'],
        ['Kiirlaen on mugav. See on väga kallis.', 'küll … aga', 'Kiirlaen on küll mugav, aga väga kallis.|Kiirlaen on küll mugav, aga see on väga kallis.'],
        ['Uus masin maksab 450 eurot. Vana masin maksab 185 eurot.', 'seevastu', 'Uus masin maksab 450 eurot, vana seevastu 185 eurot.|Uus masin maksab 450 eurot, seevastu vana maksab 185 eurot.'],
        ['Raha kogumine võtab aega. Võlgu ei jää.', 'samas', 'Raha kogumine võtab aega, samas ei jää võlgu.|Raha kogumine võtab aega, samas võlgu ei jää.'],
        ['Kasutatud masin on odav. Selle seisukorda tuleb hoolikalt kontrollida.', 'kuigi … siiski', 'Kuigi kasutatud masin on odav, tuleb selle seisukorda siiski hoolikalt kontrollida.'],
        ['Järelmaks aitab kohe osta. See võib harjutada elama üle oma võimete.', 'ühest küljest … teisest küljest', 'Ühest küljest aitab järelmaks kohe osta, teisest küljest võib see harjutada elama üle oma võimete.'],
      ], 'full', 'g_notice'), 'Kaalutud lause näitab väitluses, et kuulad ka teist poolt; see teeb su seisukoha usutavaks.'), { task: 'W09' }),
      'Pärast iga rida küsi: „Mis on argument ja mis vastuargument?” Rida 1, 5, 7: kuigi-lause ees → pealauses tegusõna kohe (teevad, tuleb, võtaksin). Rida 4: samas → tegusõna teisel kohal (samas ei jää). Rida 3: seevastu vajab kaht asja, mida võrrelda.'),
    ],
    transfer: [
      station(tag(purpose(B.dialogue('054_t_forum', 'Foorum: „Järelmaks — abi või lõks?”', 'Loe foorumi arutelu: millised argumendid on poolt ja millised vastu? *Allikas: ELi tarbijakrediidi direktiiv 2023/2225.*', 'Liina', 'Marek', [
        ['A', 'Ostsin eelmisel aastal järelmaksuga külmiku, sest vana läks juulis katki. Ilma järelmaksuta oleksin pidanud pool aastat koguma ja toitu iga päev poest ostma. Mugav ja intressita!'],
        ['B', 'Intressita? Vaata lepingutasu ja kuutasu. Minu „0 %” tolmuimeja tuli lõpuks peaaegu 60 eurot kallim, kuigi poes rõhutati, et intressi ei ole.'],
        ['A', 'Küll natuke kallim, aga külmiku sain kohe, mitte augustis. Lastega peres on see oluline.'],
        ['B', 'Probleem on see, et järelmaksud kuhjuvad: tolmuimeja, diivan, talvejope. Igaüks on väike, aga kokku tuleb iga kuu suur makse, mida on raske meeles pidada.'],
        ['A', 'Selleks on vaja lihtsalt plaani ja eelarvet. Mina võtan korraga ainult ühe järelmaksu ja panen kuumakse kalendrisse.'],
        ['B', 'Sina küll. Aga kui palk hilineb ühe kuu, tulevad viivised ja maksehäire jääb registrisse.'],
        ['A', 'Seevastu kiirlaenu ei võtaks ma kunagi. Seal on kulukuse määr kordades suurem.'],
        ['B', 'Selles oleme nõus. Ja 20. novembrist 2026 kehtivad ELi uued reeglid ka väikestele järelmaksudele: laenaja peab kontrollima, kas ostja suudab maksta.'],
      ], 'g_read'), 'Foorumist saad päris argumendid ja näited mõlemale poolele.'), { task: 'R12' }), 4, 15, { final: 'decide' }),
      teach(tag(purpose(B.rolecards('054_t_debate', 'Väitlus: kas järelmaks on abi või lõks?', 'Vali kaart A või B. Ütle alguses oma seisukoht, väitle õpetajaga 6–8 minutit ja hääletage lõpus: mida soovitate inimesele, kelle pesumasin läks katki?',
        'Kaart A (järelmaks on abi). Argumendid: vajalik asi on kohe olemas; „0 %” järelmaks võib olla odavam kui ootamine koos pesumajaga; ühe järelmaksu kuumakse on selge ja planeeritav. Lisa oma näide.\nSinu eesmärk: kaitse oma seisukohta, aga arvesta vastuargumendiga (kuigi …, küll …, aga …).',
        'Kaart B (järelmaks on lõks). Argumendid: lisatasud teevad „0 %” kallimaks; mitu väikest järelmaksu kuhjuvad; hilinemisel tulevad viivised ja maksehäire. Lisa oma näide.\nSinu eesmärk: kaitse oma seisukohta, aga arvesta vastuargumendiga.',
        ['Minu arvates …, sest …', 'Kuigi …, on … siiski …', 'Arvutasime, et …', 'Ma saan aru, aga …'], ['Küll …, aga …', 'Seevastu …', 'Ühest küljest …, teisest küljest …', 'Kokkuvõttes soovitaksin …']), 'Tulemus: teil on ühine soovitus ja sa oskad oma seisukohta kaaluda.'), { task: 'S17', main: true, level: 4 }),
      'Õpetaja kaart. Võta teine kaart. Ütle igale argumendile üks vastuargument numbriga (499 vs 450; 540; 522). Takistused: 1) „Aga kõik võtavad järelmaksu!” 2) „Kasutatud masin läheb kuu pärast katki.” 3) „Mis siis, kui raha on vaja kohe — laps on haige?” Lõpus hääletage ja võrrelge õpilase alguse valikuga (tahvlil). Õnnestunud, kui õpilane toob kaks argumenti numbritega, arvestab vähemalt kahe vastuargumendiga (kuigi …, küll … aga, seevastu) ja ütleb kaalutud järelduse („oleneb … , aga …”).'),
      tag(purpose(B.planning('054_t_rules', 'Mooduli tulemus: minu viis rahareeglit.', 'Kirjuta oma viis reeglit: üks igast tunnist ja üks oma.', [
        'Lekked (tund 51): mida kontrollin iga kuu?',
        'Soodushinnad (tund 52): mida kontrollin enne ostu?',
        'Netiost (tund 53): mida teen, kui asi ei sobi?',
        'Laen ja järelmaks (tund 54): millal võtaksin, millal mitte (kuigi …)?',
        'Minu oma reegel: …',
      ], 2), 'Kaart jääb sulle: selle järgi räägid mooduli kontrollis 1 minuti.'), { task: 'W11', level: 3 }),
      extension(teach(tag(purpose(B.speaking('054_t_more', 'Rollimäng: sugulane tahab kiirlaenu', 'Sinu sugulane (õpetaja) tahab võtta 300 eurot kiirlaenu uue sülearvuti jaoks, kuigi vana veel töötab, ja küsib sinu arvamust. Too kaks argumenti numbritega ja paku parem lahendus; ütle ausalt ka seda, mis kiirlaenul hea on.', [
        'Mida ütled kõigepealt, et sugulane sind kuulaks?',
        'Milliseid numbreid kaartidelt kasutad?',
        'Mida pakud kiirlaenu asemel?',
      ], [120, 180], ['Ma saan aru, et sul on sülearvutit vaja, aga …', 'Kuigi raha on kohe käes, maksad lõpuks …', 'Mis oleks, kui …?']), 'Kui oskad lähedast inimest veenda, oskad ka ise kiusatusele vastu panna.'), { task: 'S13', level: 4 }),
      'Kui aega jääb (12 min). Ole veenev: „Ainult 300 eurot, kuumakse on väike!”, „Mul on palk järgmisel nädalal”, „Sina võtsid ju ka järelmaksu.” Õnnestunud, kui õpilane ei moraliseeri, kasutab vähemalt üht numbrit ja ühte kuigi-lauset ning pakub konkreetse alternatiivi (kasutatud sülearvuti, kogumine, vana arvuti parandus).'), 12),
      tag(exitCheck(purpose(B.gaps('054_t_exit', 'Kontrolli end: kolm kaalutud lauset.', 'Kirjuta lünka üks sõna: kuigi, küll või seevastu. Iga sõna sobib ühte lausesse.', [
        '[Kuigi] järelmaks tundus alguses mugav, ei võta ma pärast viiviseid seda enam.',
        'Uus pesumasin on poes üsna kallis, kasutatud masin [seevastu] palju odavam.',
        'Kiirlaen on [küll] kiire ja lihtne, aga lõpuks maksad selle eest palju rohkem.',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas kaalutud seisukoha sõnad on käes.')), {}),
      purpose(B.selfcheck('054_t_self', ['Ma räägin, mida ostaksin kohe ja mida hiljem.', 'Ma võrdlen pakkumisi kogukulu järgi ja tean, mida seadus laenu hinna kohta ütleb.', 'Ma arvestan vastuargumendiga: kuigi …, küll … aga, seevastu.', 'Ma kaitsen väitlusel kaalutud seisukohta ja jõuan ühise soovituseni.'], 'Otsus kaalutud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('054_t_essay', 'Kodus: arutlus (umbes 180 sõna).', 'Kirjuta kodus 170–190 sõna teemal „Kas „osta kohe, maksa hiljem” teeb elu lihtsamaks või ohtlikumaks?”: kaks argumenti poolt ja kaks vastu, igaühele näide, ning kaalutud järeldus. Kasuta sõnu kuigi, küll … aga ja seevastu.', [13, 17], ['kuigi', 'küll', 'seevastu', 'kokkuvõttes'], 3, 'g_use'), 'Tekst on sinu B2-eksami arutluse harjutus; õpetaja annab tagasisidet argumentidele ja järeldusele.')), { task: 'W14', level: 4, harno: 'W2b' }),
      tag(homeTask(purpose(B.speaking('054_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut oma viie rahareegli järgi: millised need on ja milline neist on sulle kõige raskem.', [
        'Millised on sinu viis reeglit?',
        'Milline reegel on sulle kõige raskem ja miks?',
      ], [60, 120]), 'See on mooduli kontrolli sõnavõtu harjutus; õpetaja annab ühe nõu.')), { task: 'S15' }),
      homework('054_t_homework', ['1. Arutlus, umbes 180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-055': {
    title: 'Kontroll 11 — raha ja tarbimine',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Kontroll 11, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Kontroll 11, 1. tund: keeleosa ja kuulamine (50 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Kontroll 11, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid raha ja tarbimise teemal, kirjutan umbes 140-sõnalise poolametliku kirja ja 180-sõnalise arutluse ning räägin 1 minuti oma rahareeglitest; täis- ja osasihitis, kesksõnad, umbisikuline tegumood, viisakas nõue ja kaalutud seisukoht on õiged.',
    // Kontroll 11 in Harno B2 form (v4 module exam): two 90-minute lessons — reading (Avasta, 45 min) and the module's
    // language part + listening (Harjuta, 15 + 35 min); writing (60 min) and speaking with the module product (Kasuta,
    // 15 + 5 min). Harno B2 gives R 70, L 40, W 80, S 20 min: every part here is a shorter version with the same task types
    // (R1, R2a, R3, R4; L notices, L3, L4; W1, W2b; S1, S2). Own texts on the module's content and one new side of it:
    // second-hand buying (opinion article), a gym subscription that kept charging (R3), unsubscribing (R4), short notices
    // and pocket money for children (listening); timed by the Harno part headers (timeEstimate.js harnoTimedMinutes).
    discover: [
      B.tip('055_d_how', 'Kontroll: lugemine (eksami vormis, 45 minutit)', 'Kontroll kestab kaks tundi. Esimeses tunnis on lugemine ning kuulamine koos keeleosaga, teises kirjutamine ja rääkimine. Lugemises on neli osa nagu Harno B2 eksamil, ainult lühemad. Tee kõik ilma sõnaraamatuta.', 'full'),
      tag(B.vocab('055_d_vocab', 'Tunnid 51–54: sõnad, mis aitavad', ['eelarve — бюджет', 'arve — счёт', 'tühistama — отменять', 'allahindlus — скидка', 'eksitav — вводящий в заблуждение', 'taganema — отказываться (от договора)', 'tingimused — условия', 'järelmaks — рассрочка', 'leping — договор', 'kasutatud — подержанный (б/у)'], '2'), { topic: ['taganema'] }),
      PART('055_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Kontrolli eesmärk on vähemalt 24 punkti (80 %).' }),
      B.reading('055_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe artiklit kasutatud asjade ostmisest ja vasta kõigepealt kahele küsimusele. Siis lahenda osad 1 ja 2.', 'Uus või kasutatud?', [
        '(A) Veel kakskümmend aastat tagasi häbenesid paljud kasutatud riideid ja mööblit. Kasutatud asi tähendas, et uue jaoks ei olnud raha, ja seda ei räägitud sõpradele uhkusega. Täna on pilt teine: noored otsivad taaskasutuspoodidest vanu kvaliteetseid riideid, pered müüvad lapse väikeseks jäänud jope internetis edasi ja isegi suured kauplused avavad kasutatud kaupade nurki. Taaskasutus on muutunud tavaliseks valikuks. Minu arvates ei ole see ainult mood, mis homme kaob, vaid targem viis raha ja asjadega ümber käia.',
        '(B) Esimene põhjus on lihtne: kasutatud asi on odavam. Lapse talvekombinesoon, mida kantakse üks talv, maksab uuena kergesti sada eurot, kasutatult aga kolmandiku sellest. Ka mööbli, jalgrataste ja tööriistade puhul võib hinnavahe olla mitmekordne. Kuigi mõnikord tuleb asja parandada või puhastada, jääb rahakotti sageli rohkem, kui alguses arvad. Peres, kus lapsed kasvavad igal aastal uutest riietest välja, on see vahe kuu eelarves kohe näha. Raha, mis nii üle jääb, võib minna reservi.',
        '(C) Teine põhjus on keskkond. Iga asi, mida kasutatakse kauem, tähendab ühte uut toodet vähem, ja uue toote valmistamiseks kulub vett, energiat ning toorainet. Eestis on alates 2025. aasta algusest kohustuslik koguda tekstiilijäätmeid eraldi, kuid 2022. aastal koguti eraldi vaid umbes 1300 tonni tekstiili, samal ajal kui segaolmejäätmetega läks ära üle 18 000 tonni. Eriti kiiresti kuluvad odavad moeriided, mida kantakse vaid mõni kord. Suur osa riietest, mis prügikasti visatakse, oleks võinud kellelegi veel sobida.',
        '(D) Kolmas põhjus on see, et taaskasutusel on Eestis juba hea võrgustik. 2004. aastal loodud MTÜ Uuskasutuskeskus on kasvanud viieteistkümne poe ja e-poega organisatsiooniks. 2023. aastal toodi sinna annetusi ligi 170 000 korral ja keskuse andmetel jõuab üle 95 protsendi sorteeritud asjadest uuesti ringlusse kas poodide või partnerite kaudu; umbes pooled annetustest lähevad koostöö- ja heategevuspartneritele. Lisaks müüvad inimesed asju üksteisele internetiportaalides, kus kuulutuse saab panna üles mõne minutiga.',
        '(E) Kasutatud asja ostmisel on siiski oma riskid. Kui ostad eraisikult, ei kehti tarbija neljateistkümnepäevane taganemisõigus ega müüja kaheaastane vastutus puuduste eest nagu poes. Seepärast kontrolli asja enne maksmist: lülita seade sisse, küsi ostutšekki ja garantiid, kui see on veel alles. Ära maksa ette tundmatule müüjale, kes kiirustab ja pakub hinda, mis tundub liiga hea, et olla tõsi. Kui müüja ei luba asja enne ostu vaadata, on parem loobuda. Kohtuge pigem päeval ja rahvarohkes kohas, mitte õhtul tühjas parklas.',
        '(F) Mõni asi tasub siiski osta uuena. Turvatool, kiiver ja madrats peavad olema kindlasti terved ning nende ajalugu on raske kontrollida. Vana külmik või pesumasin võib kulutada nii palju elektrit, et odav ostuhind kaotab kiiresti mõtte. Siin aitab lihtne küsimus: kui palju see asi maksab kogu oma eluea jooksul, mitte ainult täna kassas? Mõnikord on uus ja säästlik seade pikas plaanis odavam kui kasutatud ja raiskav. Ka lapse turvatooli puhul ei tasu riskida, sest sa ei tea, kas see on kunagi avariis olnud.',
        '(G) Ma ei arva, et kõik peaksid edaspidi ostma ainult kasutatud asju. Kuid enne iga ostu tasub küsida kahte asja: kas mul on seda tõesti vaja ja kas keegi on selle juba teinud? Sageli on vastus teisele küsimusele „jah”. Siis säästame korraga nii raha kui ka loodust ja ostmine muutub teadlikuks otsuseks, mitte harjumuseks. Ja kui asi meil endal enam vaja ei lähe, võime selle omakorda edasi anda, nii et keegi teine ei pea uut ostma.',
        'Allikas: autori arvamus; faktid: Keskkonnaamet, „Tekstiili kogumisest” (2024); Uuskasutuskeskuse jätkusuutlikkuse aruanne 2023; võlaõigusseadus §-d 49 ja 218.',
      ].join('\n\n'), [['Mida tahab autor öelda pealkirjaga „Uus või kasutatud?”', 'kasutatud asi on sageli targem valik|enne ostu tasub mõelda, kas asi võiks olla kasutatud|kasutatud ostmine on tark, aga mitte alati'], ['Kas sina ostad pigem uusi või kasutatud asju? Miks?']]),
      tag(B.choice('055_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Mis on lõigu A järgi viimase kahekümne aastaga muutunud?', 'kasutatud asju ei häbeneta enam', 'kasutatud asjad on kallimaks läinud', 'noored ei osta enam riideid', 'kauplused keelavad kasutatud kauba'],
        ['Miks jääb lõigu B järgi rahakotti sageli rohkem, kui arvad?', 'hinnavahe on suur ka siis, kui asja tuleb parandada', 'kasutatud asjal on alati garantii', 'kasutatud asja ei pea kunagi puhastama', 'pood maksab ostjale lisaks'],
        ['Mida näitavad lõigu C numbrid tekstiili kohta?', 'enamik tekstiili läks segaolmejäätmetega', 'enamik tekstiili koguti eraldi', 'tekstiili eraldi kogumine on keelatud', 'tekstiili visatakse ära vähem kui varem'],
        ['Mida teeb Uuskasutuskeskus lõigu D järgi annetatud asjadega?', 'suunab enamiku uuesti ringlusse', 'viskab enamiku ära', 'müüb kõik ainult e-poes', 'saadab kõik välismaale'],
        ['Miks soovitab autor eraisikult ostes asja enne maksmist kontrollida?', 'tarbija taganemisõigus ja müüja vastutus ei kehti', 'eraisik peab andma kaks aastat garantiid', 'eraisikult ei tohi seadmeid osta', 'eraisik peab raha 14 päeva jooksul tagastama'],
        ['Millise väitega oleks autor kõige tõenäolisemalt nõus?', 'enne ostu tasub mõelda, kas sobiks ka kasutatud asi', 'kõik asjad tuleks osta kasutatult', 'kasutatud asjad on alati ohtlikud', 'uus asi on alati odavam kogu eluea jooksul'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('055_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Varem oli kasutatud asi vaesuse märk. | [A]',
        '2. Lapse riided muutuvad kiiresti väikeseks ja on uuena kallid. | [B]',
        '3. Seadus nõuab, et riided ei läheks tavalisse prügikasti. | [C]',
        '4. Taaskasutuspoodidel on Eestis üle kümne kaupluse. | [D]',
        '5. Liiga soodne pakkumine võib olla ohumärk. | [E]',
        '6. Mõnda asja on turvalisuse pärast parem osta uuena. | [F]',
        '7. Enne ostu tasub endalt kaks küsimust küsida. | [G]',
        '8. Odav vana seade võib elektriarve tõttu kalliks minna. | [F]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.formtext('055_d_cloze', 'Osa 3: pane sõna õigesse vormi (10 punkti).', 'Endine spordiklubi liige kirjutab klubile. Kirjuta sulgudes olev sõna lünka õiges vormis.', 'Kiri spordiklubile', [
        'Lugupeetud klienditeenindus!',
        'Lõpetasin oma lepingu 30. septembril, kuid 5. novembril [võeti] (võtma, umbisikuline) mu kontolt jälle 49 eurot. Teie tingimustes on kirjas, et leping [lõpetatakse] (lõpetama, umbisikuline) ühe kuu jooksul pärast teadet.',
        'Ma ei ole teie teenust novembris [kasutanud] (kasutama). Lisan kirjale lepingu [lõpetamise] (lõpetamine) kinnituse ja pangaväljavõtte.',
        'Seetõttu [paluksin] (paluma, tingiv) teil valesti võetud [summa] (summa) mulle tagasi kanda. Ma ei soovi enam ühtegi automaatselt [pikenevat] (pikenema, kesksõna) lepingut.',
        '[Kuigi] (vastuargument, algab k-tähega) mõistan, et vigu juhtub, [oleksin] (olema, tingiv) tänulik, kui vastaksite nädala jooksul. Kui raha ei [tagastata] (tagastama, umbisikuline eitus) 14 päeva jooksul, pöördun tarbijavaidluste komisjoni poole.',
        'Lugupidamisega\nendine klubiliige',
      ].join('\n\n'), 'g_notice'), { task: 'G03', harno: 'R3' }),
      tag(B.insertion('055_d_bank', 'Osa 4: vali lause (6 punkti).', 'Loe lugu. Vali pangast igasse lünka sobiv lause; üks lause jääb üle.', 'Kuidas ma tellimustest lahti sain', [
        'Eelmisel talvel avastasin, et maksan iga kuu üheksa erineva tellimuse eest. [[Kokku tuli neist üle seitsmekümne euro kuus.]]',
        'Mõne tellimuse olin unustanud täiesti. [[Üks keeleõppe äpp oli pärast tasuta prooviaega kaks aastat vaikselt raha võtnud.]]',
        'Otsustasin, et pean selle asja korda. [[Panin pangaäpis kõik püsimaksed ühte tabelisse.]]',
        'Iga tellimuse juurde kirjutasin, millal seda viimati kasutasin. [[Viis tellimust ei olnud ma kolme kuu jooksul kordagi avanud.]]',
        'Need tühistasin samal õhtul. [[Ühe äpi tühistamiseks pidin küll kolm korda klienditeenindusele kirjutama.]]',
        'Nüüd vaatan püsimaksed üle iga kolme kuu tagant. [[Säästetud raha läheb otse reservkontole.]]',
      ], ['Seepärast võtsin uue tellimuse, mis oli veel kallim.'], 'g_read'), { task: 'R16', harno: 'R4' }),
      // a short productive answer to the article (B2-: the reading sheet is not only recognition)
      tag(B.writing('055_d_reply', 'Lugemise lõpuks: vasta autorile (3–4 lauset).', 'Kas oled autoriga nõus, et enne ostu tasub mõelda, kas sobiks ka kasutatud asi? Kirjuta 3–4 lauset: anna üks autori mõte kaudses kõnes edasi (autor kirjutab, et …), ütle oma kaalutud arvamus (kuigi …) ja too üks näide oma elust.', [3, 4], ['kirjutab, et', 'kuigi'], 1, 'g_read'), { task: 'W02' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening in Harno B2 form
    practice: [
      B.tip('055_p_how', 'Kontroll: keeleosa ja kuulamine (50 minutit)', 'Kuulamine on nagu Harno B2 eksamil, ainult lühem: teateid kuuled üks kord, intervjuud kaks korda ja kolmandat korda õige-vale väidete jaoks. Enne kuulamist on keeleosa: parandad päris sõnumeid ja ütled mõtte teisiti.', 'full'),
      B.tip('055_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on päris sõnumid ja laused tundidest 51–54. Paranda ja ütle teisiti nii, et adressaat saab sinust aru.', 'full'),
      B.errorfix('055_p_fix', 'Keeleosa A: paranda sõnum enne saatmist (6 punkti).', 'Need on sõbra sõnumid poele, pangale ja perele. Igas lauses on üks grammatikaviga: kirjuta lause õigesti.', [
        ['Ma ei tühistanud tellimuse õigel ajal ja maksin jälle terve kuu eest.', 'Ma ei tühistanud tellimust õigel ajal ja maksin jälle terve kuu eest.'],
        ['Kontol ei olnud reserv, kui pesumasin eelmisel kuul ootamatult katki läks.', 'Kontol ei olnud reservi, kui pesumasin eelmisel kuul ootamatult katki läks.'],
        ['Enne suurt ostu kontrolli alati poes enne alandust küsiv hinda.', 'Enne suurt ostu kontrolli alati poes enne alandust küsitud hinda.'],
        ['Poe tingimustes on kirjas, et allahinnatud kaupa ei tagastatakse.', 'Poe tingimustes on kirjas, et allahinnatud kaupa ei tagastata.'],
        ['Oleksin väga tänulik, kui te vastate mu kirjale reedeks.', 'Oleksin väga tänulik, kui te vastaksite mu kirjale reedeks.|Oleksin väga tänulik, kui vastaksite mu kirjale reedeks.'],
        ['Kuigi kiirlaen on kallis, ma võtaksin selle hädaolukorras.', 'Kuigi kiirlaen on kallis, võtaksin ma selle hädaolukorras.|Kuigi kiirlaen on kallis, võtaksin selle hädaolukorras.'],
      ]),
      B.transformation('055_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle iga lause mõte uuesti, kasutades antud sõna või vormi.', [
        ['Ma maksin eelmisel kuul kõik arved õigel ajal ära.', 'ei', 'Ma ei maksnud eelmisel kuul kõiki arveid õigel ajal ära.'],
        ['Kampaania, mis algas esmaspäeval, kestab terve nädala.', 'kesksõna', 'Esmaspäeval alanud kampaania kestab terve nädala.'],
        ['Pood tagastab raha 14 päeva jooksul pärast teie teadet.', 'umbisikuline', 'Raha tagastatakse 14 päeva jooksul pärast teie teadet.'],
        ['Andke mulle raha kohe tagasi!', 'paluksin', 'Paluksin mulle raha tagasi maksta.|Paluksin raha tagastada.|Paluksin raha tagasi maksta.'],
        ['Järelmaks on mugav. Väikesed kuumaksed kuhjuvad kiiresti.', 'kuigi', 'Kuigi järelmaks on mugav, kuhjuvad väikesed kuumaksed kiiresti.|Järelmaks on mugav, kuigi väikesed kuumaksed kuhjuvad kiiresti.'],
        ['Uus jope maksab 120 eurot. Kasutatud jope maksab 35 eurot.', 'seevastu', 'Uus jope maksab 120 eurot, kasutatud jope seevastu 35 eurot.|Uus jope maksab 120 eurot, seevastu kasutatud jope maksab 35 eurot.'],
      ]),
      PART('055_p_lpart', 'L', { minutes: 35, points: 23, tasks: 3, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 35–40 minutit, siin kolm ülesannet neljast): 23 punkti. Kontrolli eesmärk on vähemalt 19 punkti (80 %).' }),
      B.listening('055_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Kuula nelja teadet, igaüht üks kord. Kirjuta lünka 1–2 sõna.', [
        '1. Linnaosa taaskasutuspunkt teatab: laupäeval kella kümnest kahani saab tuua riideid, mänguasju ja väikest mööblit. Katkiseid elektriseadmeid me vastu ei võta. Palun võtke kaasa oma kotid.',
        '2. Linnaraamatukogu kutsub rahatarkuse õhtule. Teemaks on pere eelarve ja tellimuste kontrollimine. Õhtu toimub kolmapäeval kell kuus ja on tasuta, kuid kohti on ainult kakskümmend.',
        '3. Elektrimüüja teatab: alates esimesest jaanuarist muutub fikseeritud paketi hind. Kui te uute tingimustega ei nõustu, saate lepingu lõpetada kolmekümne päeva jooksul.',
        '4. Kaubanduskeskus teatab: sooduskampaania kestab sel aastal neli päeva, reedest esmaspäevani. Parkla on nendel päevadel avatud öösel kella üheni.',
      ], [
        'Laupäeval ei võta taaskasutuspunkt vastu katkiseid [elektriseadmeid].',
        'Riiete ja mänguasjadega tuleb taaskasutuspunkti kaasa võtta oma [kotid].',
        'Raamatukogu rahatarkuse õhtu teemaks on pere eelarve ja [tellimuste kontrollimine|tellimused].',
        'Kolmapäevasel rahatarkuse õhtul on kokku ainult [kakskümmend|20] kohta.',
        'Kes elektrimüüja uute tingimustega ei nõustu, saab lepingu lõpetada [kolmekümne päeva|30 päeva] jooksul.',
        'Kaubanduskeskuse sooduskampaania kestab sel aastal [neli päeva|4 päeva].',
      ]),
      tag(B.listening('055_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Kuula intervjuud kaks korda. Täida lausete lüngad 1–2 sõnaga.', [
        'Saatejuht: Tere! Täna räägime taskurahast. Stuudios on pere rahanõustaja Merike Saar, kellel on endal kolm last. Merike, mis vanuses võiks laps taskuraha saama hakata?',
        'Merike: Siis, kui ta oskab lugeda ja natuke arvutada, tavaliselt kuue või seitsme aasta vanuselt. Alguses piisab paarist eurost nädalas.',
        'Saatejuht: Kas iga nädal või kord kuus?',
        'Merike: Väikesele lapsele iga nädal, sest kuu on tema jaoks liiga pikk aeg. Teismelisele pigem kord kuus, nii õpib ta planeerima.',
        'Saatejuht: Kas taskuraha tuleks siduda kodutöödega?',
        'Merike: Ma ei soovita. Kodutööd on pere ühine asi, taskuraha on õppimiseks. Lisatöö eest, näiteks auto pesemise eest, võib aga maksta eraldi.',
        'Saatejuht: Mida teha, kui laps kulutab kogu raha esimesel päeval ära?',
        'Merike: Mitte midagi. Ärge andke juurde. Laps tunneb ise, et nädala lõpus pole raha, ja see õpetab rohkem kui iga loeng.',
        'Saatejuht: Aga pangakaart?',
        'Merike: Kümneaastaselt võib proovida. Pangaäpis näeb laps, kuhu raha läks. Meie peres on reegel: kümme protsenti igast summast läheb hoiupõrsasse.',
        'Saatejuht: Ja kõige tähtsam nõuanne vanematele?',
        'Merike: Rääkige rahast avalikult. Lapsed näevad, kuidas te poes otsustate, palju rohkem, kui te arvate.',
      ], [
        'Raadiosse tulnud rahanõustajal endal on [kolm|3] last.',
        'Väikesele lapsele piisab alguses paarist eurost [nädalas].',
        'Teismelisele sobib taskuraha nõustaja arvates pigem kord [kuus].',
        'Kodutööd ei ole raha teenimiseks, vaid pere [ühine asi|ühine].',
        'Eraldi võib lapsele maksta lisatöö, näiteks auto [pesemise] eest.',
        'Kui laps kulutab raha kohe ära, ei tohi vanem raha [juurde] anda.',
        'Oma pangakaarti võib laps nõustaja sõnul proovida [kümneaastaselt|10-aastaselt].',
        'Pangaäpis näeb laps hiljem ise, kuhu tema [raha] läks.',
        'Nõustaja peres läheb kümme protsenti igast summast [hoiupõrsasse].',
      ]), { voice: 'interview', task: 'L04', harno: 'L3' }),
      tag(B.truefalse('055_p_tf', 'Kuulamine 3: õige või vale? (8 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Rahanõustaja soovitab anda taskuraha juba kolmeaastasele.', false],
        ['Väikesele lapsele on kuu liiga pikk aeg.', true],
        ['Nõustaja arvates peaks laps taskuraha teenima kodutöödega.', false],
        ['Lisatöö eest võib lapsele eraldi maksta.', true],
        ['Kui raha saab nädala keskel otsa, peaks vanem juurde andma.', false],
        ['Nõustaja arvates õpetab oma kogemus rohkem kui loeng.', true],
        ['Nõustaja peres pannakse hoiupõrsasse pool igast summast.', false],
        ['Lapsed õpivad rahast palju vanemate eeskujul.', true],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.rubric('055_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (sõnumid – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('055_t_situation', 'Kontroll: kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühem. Kirjutad poolametliku kirja ja arutluse. Sõnavõtus esitled mooduli tulemust: oma viit rahareeglit, mille plaani paned enne kirja.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own money rules, built in 051–054
      B.planning('055_t_product', 'Mooduli tulemus: minu viis rahareeglit.', 'Võta oma kaart tunnist 54 ja lisa igale reeglile üks põhjus või näide tundidest 51–53.', ['Lekked: mida kontrollin ja miks? (tund 51: täis- ja osasihitis)', 'Soodushinnad: mida kontrollin enne ostu? (tund 52: kesksõna, nt enne alandust küsitud hind)', 'Netiost: mida teen, kui asi ei sobi? (tund 53: raha tagastatakse …)', 'Järelmaks ja laen: millal jah, millal ei? (tund 54: kuigi …, siiski …)']),
      PART('055_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja arutluse eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('055_t_letter', 'Kirjutamine 1: ettepanek korteriühistule (umbes 140 sõna).', 'Sinu majas visatakse palju korralikke asju prügikasti. Kirjuta korteriühistu juhatusele: mida oled märganud, miks see on raiskamine, sinu ettepanek korraldada maja juures asjade vahetuspäev (millal, kus, kuidas) ja mida palud juhatuselt. Toon on viisakas ja konkreetne.', 'Lugupeetud juhatus!', 'Lugupidamisega', [140, 160]), { task: 'W13', harno: 'W1' }),
      tag(B.writing('055_t_essay', 'Kirjutamine 2: arutlus (umbes 180 sõna).', 'Kirjuta arutlus teemal: kas koolides peaks rahatarkust õpetama eraldi ainena? Too mõlema poole argumendid, igaühele näide, ja sinu kaalutud järeldus.', [14, 18], ['ühelt poolt', 'teiselt poolt', 'kuigi', 'kokkuvõttes'], 3), { task: 'W14', harno: 'W2b' }),
      PART('055_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('055_t_present', 'Rääkimine 1: sõnavõtt (1 minut).', 'Teemakaart: räägi 1 minut oma viiest rahareeglist. Mõtle 2 minutit oma kaardi järgi, räägi 1 minut, siis vasta küsimustele.', ['Millised on sinu reeglid ja kust need tulid?', 'Milline reegel on sulle kõige tähtsam ja miks?', 'Milline reegel on kõige raskem täita?', 'Paariline küsib: „Kas sa järgisid mõnda neist juba sel kuul?”', 'Kas raha üle arve pidamine teeb elu vabamaks või pingelisemaks? Miks?', 'Kes peaks lastele rahast rääkima: kool või pere? Põhjenda.'], [90, 180], ['Minu esimene reegel on …', 'Kuigi …, püüan ma siiski …', 'Kõige raskem on mulle …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('055_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas igaüks peaks pidama kuueelarvet? Argumendid: tead, kuhu raha kaob; reserv tekib kiiremini; pere saab rahast rääkida faktide, mitte tunnete põhjal. Lisa oma näide.',
        'Kaart B (vastu). Teema: kas igaüks peaks pidama kuueelarvet? Argumendid: see võtab aega; pangaäpp näitab kulud niikuinii; iga sendi lugemine tekitab stressi. Lisa oma näide.',
        ['Minu arvates …', 'Näiteks minu tuttav …', 'Kuigi …, on … siiski …'], ['Ma ei ole päris nõus, sest …', 'Küll …, aga …', 'Seevastu …', 'Kas võiksime kokku leppida, et …?']), { task: 'S17', harno: 'S2' }),
      B.rubric('055_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kiri: probleem, põhjendus, konkreetne ettepanek (millal, kus, kuidas), palve juhatusele, viisakas toon, umbes 140 sõna (10 punkti).', 'Arutlus: mõlema poole argumendid näidetega, kaalutud järeldus, sidusus, umbes 180 sõna (15 punkti).', 'Sõnavõtt: viis reeglit, põhjendus ja näide 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin näitega, arvestasin vastuargumendiga, jõudsime ühisele seisukohale (15 punkti).']),
      B.selfcheck('055_t_self', ['Kirjutamine: … / 25 punkti (kiri 10, arutlus 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.', 'Ma tean, mida enne järgmist moodulit korrata.'], 'Moodul 11 läbitud'),
    ],
  },
}, {
  'b1b2-051': 'LUGU R→W', 'b1b2-052': 'PROB L→S', 'b1b2-053': 'KUUL L→W', 'b1b2-054': 'AVAS R→S', 'b1b2-055': 'EKS',
});

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js): one line per key item, in the order the key lists them (courseSheet.js withExplanations).
// Every scored task of the module has its lines (v4Tasks.test.js checks the count).
export const EXPLAIN = {
  // 051
  '051_d_facts': [
    '1. lõik: „Raha kaob sageli hoopis väikeste summade kaupa, mida me ei märka.”',
    '2. lõik: „kulutas üks leibkonnaliige 2020. aastal keskmiselt 477 eurot kuus”.',
    '2. lõik: „Kõige rohkem kulus toidule, seejärel eluasemele ja transpordile”.',
    '3. lõik: „kuus umbes 50 ja aastas umbes 600 eurot”.',
    '3. lõik: prooviaeg „muutub märkamatult tasuliseks” ja tellimus „pikeneb automaatselt, kuni sa selle ise tühistad”.',
    '4. lõik: „kõige nõrgemad harjumused olid ostuotsuse läbimõtlemine ja pikaajaliste rahaliste eesmärkide seadmine”.',
    '5. lõik: „kuu lõpus ei jää sageli midagi üle”.',
  ],
  '051_t_statement': [
    '13,99 + 9,99 = 23,98 eurot kuus kahe platvormi eest; teist ei vaadata.',
    '4 × 4,99 = 19,96 eurot ühe kuuga mänguäpis.',
    '18 × 2,80 = 50,40 eurot kohvi eest.',
    'Kuutasu 39 eurot, käidi üks kord — üks külastus maksis 39 eurot.',
    '12,90 − 1 = 11,90 eurot rohkem kui prooviajal.',
  ],
  '051_p_forms': [
    'Tegevus on lõpetatud (lõpuks tühistasin) → täissihitis: muusikatellimuse.',
    'Eitus (ei tühistanud) → osasihitis: tellimust.',
    'Kõik arved, makstud ära → täissihitis mitmuses: arved.',
    'Eitus + ühtegi → osastav: eurot.',
    'vajama on tundetegusõna → osasihitis: talvejopet.',
    'Olemasolu lause, lahtine hulk → osaalus mitmuses: arveid.',
    'Kõik kulud, tulemus valmis (ette planeerima) → täissihitis mitmuses: kulud.',
  ],
  '051_t_exit': [
    'unustasin tühistada — da-tegevusnime sihitis, tulemus terve → täissihitis: tellimuse.',
    'Eitus (ei maksnud) → osasihitis: preemiat.',
    'Eitus (ei ole koostanud) → osasihitis: eelarvet.',
  ],
  // 052
  '052_d_ads': [
    'Esimene reklaam: „Allahindlus kehtib ainult märgistatud toodetele.”',
    'Teine reklaam: „Tasuta saad kolmest paarist odavaima.”',
    'Kolmas reklaam: „Hind kehtib kahekümne nelja kuu pikkuse lepinguga.”',
    'Neljas reklaam: „pikeneb leping automaatselt”.',
    'Viies reklaam: „viimase kolmekümne päeva madalaimast hinnast”.',
    'Kuues reklaam: „kõigile tellimustele alates viiekümnest eurost”.',
  ],
  '052_p_part': [
    'Jopet hinnati alla (keegi tegi) → -tud, ei käändu: allahinnatud jope.',
    'Hinda küsiti varem (keegi tegi) → -tud: enne alandust küsitud hinda.',
    'Tellimus ise pikeneb → -v; eitus ja ühtegi → osastav: pikenevat tellimust.',
    'Kaupa saab tagastada (keegi teeb) → -tav; kaupa on osastavas → tagastatavat.',
    'Telefoni on kasutatud → -tud: kaks kuud kasutatud telefoni.',
    'Sooduskood ise lõppes → -nud: eile õhtul lõppenud sooduskood.',
    'Pakkumine ise kehtib → -v: ainult internetis kehtiv pakkumine.',
  ],
  '052_t_check': [
    'Vale: varasem hind on viimase 30 päeva madalaim, mitte nädal enne tõstetud hind.',
    'Õige: seadus nõuab varasema hinnana viimase 30 päeva madalaimat hinda.',
    'Vale: TTJA kontrollib, et läbi kriipsutatud hind ei oleks välja mõeldud.',
    'Õige: 120 eurost 90 eurole on 25 % vähem ja 120 oli varasem hind.',
    'Vale: see on võlts taimer — üks manipuleeriv võte, mida Euroopa Komisjon leidis 42 poest.',
    'Õige: soodusprotsent on arvutatud õigest varasemast hinnast.',
  ],
  '052_t_exit': [
    'Pakkumine ise kehtib → -v, omastav: kehtiva.',
    'Hinda on alandatud → -tud, ei käändu: allahinnatud.',
    'Hind ise tõusis → -nud: tõusnud.',
  ],
  // 053
  '053_d_vote': [
    'Raadio: „Kui ostsite poest kohapeal ja kaubal ei ole puudust, ei ole poel kohustust kaupa tagasi võtta.”',
    'Raadio: netiostust võib taganeda 14 päeva jooksul ja „see aeg algab kauba kättesaamisest”, ka allahinnatud kauba puhul.',
    'Raadio: „Kui kaup on tehtud tellija soovi järgi, taganemisõigust ei ole.”',
    'Raadio: „Kui pood teavitas teid ette, maksate tagasisaatmise kulud ise.”',
    'Raadio: „Raha peab tulema tagasi neljateistkümne päeva jooksul alates teie teatest.”',
  ],
  '053_d_radio': [
    'Kaja: „Seepärast küsige tagastamise kohta juba enne ostu.”',
    'Kaja: „neljateistkümne päeva jooksul ja see aeg algab kauba kättesaamisest”.',
    'Kaja: „Põhjust ei pea ütlema.”',
    'Kaja: „Õigus kehtib ka allahinnatud kaubale.”',
    'Kaja: „maksate tagasisaatmise kulud ise”.',
    'Kaja: „Kui kaup on tehtud tellija soovi järgi, taganemisõigust ei ole.”',
  ],
  '053_p_polite': [
    'Tingimus, tegija on pood üldiselt → umbisikuline: tagastatakse.',
    'Käsk → viisakas palve tingivas: paluksin + da-tegevusnimi.',
    'Eitus umbisikulises: ei võeta (tagasi).',
    'Viisakas küsimus tingivas: kas saaksite + saata.',
    'Oleksin tänulik, kui + tingiv: vastaksite.',
    'Tegija (kuller) ei ole tähtis → umbisikuline minevik: toodi.',
    'Tingimus ja tagajärg tingivas, ilma ähvarduseta: ei tagastaks, kirjutaksin / pöörduksin.',
  ],
  '053_t_ask': [
    'Seadus: „netiostust võib taganeda 14 päeva jooksul”.',
    'Seadus: „alates kauba kättesaamisest” — mitte tellimusest.',
    'Ei: „seadusest halvemad tingimused ei kehti” (ka allahinnatud kaup).',
    'Seadus: raha makstakse tagasi „samal viisil, nagu maksti”.',
    'Seadus: „14 päeva jooksul taganemisteatest”.',
    'Jah: kulud võivad jääda ostjale, kui pood teavitas ette (raadio: „Kui pood teavitas teid ette, maksate … ise”).',
  ],
  '053_t_exit': [
    'Umbisikuline olevik: tagasta- + -takse → tagastatakse.',
    'Umbisikuline eitus: ei + vahetata (ilma -kse).',
    'Viisakas palve tingivas: paluksin.',
  ],
  // 054
  '054_d_cost': [
    '12 × 37,50 = 450; + 19 lepingutasu + 12 × 2,50 = 30 kuutasu → 499.',
    '12 × 45 = 540.',
    '540 − 450 = 90.',
    '3 kuud × 6 korda × 4 € = 72.',
    '160 + 25 = 185.',
    'A: 450 + 72 = 522; B: 499; C: 540 → kõige odavam on B.',
    '522 − 499 = 23.',
  ],
  '054_p_concede': [
    'kuigi-lause ees → pealauses tegusõna kohe: teevad.',
    'küll … aga: üks lause, kaks poolt.',
    'seevastu vastandab kaks hinda: uus — kasutatud.',
    'samas tähendab „teisest küljest”; pärast seda tegusõna teisel kohal: ei jää.',
    'kuigi … siiski: vastuargument ja järeldus; pealauses tegusõna kohe: tuleb.',
    'ühest küljest … teisest küljest: kaks poolt, mõlemas tegusõna teisel kohal.',
  ],
  '054_t_exit': [
    'Vastuargument lause alguses: kuigi; pealauses tegusõna kohe (ei võta).',
    'Kahe asja vastandus (uus — kasutatud): seevastu.',
    'Paar küll …, aga …: küll.',
  ],
  // 055
  '055_d_read': [
    '(A), (G): kasutatud asi on sageli tark valik, aga enne ostu tasub mõelda.',
    'Sinu oma vastus: õpetaja vaatab, kas põhjendad oma valikut.',
  ],
  '055_d_mc': [
    '(A): „Täna on pilt teine” — kasutatud asju ei häbeneta.',
    '(B): „Kuigi mõnikord tuleb asja parandada … jääb rahakotti sageli rohkem”.',
    '(C): 1300 tonni eraldi, üle 18 000 tonni segaolmejäätmetega.',
    '(D): „üle 95 protsendi sorteeritud asjadest uuesti ringlusse”.',
    '(E): eraisikult ostes „ei kehti tarbija neljateistkümnepäevane taganemisõigus ega müüja kaheaastane vastutus”.',
    '(G): „enne iga ostu tasub küsida … kas keegi on selle juba teinud?”',
  ],
  '055_d_para': [
    '(A): „Kasutatud asi tähendas, et uue jaoks ei olnud raha.”',
    '(B): talvekombinesoon „mida kantakse üks talv, maksab uuena kergesti sada eurot”.',
    '(C): „on kohustuslik koguda tekstiilijäätmeid eraldi”.',
    '(D): „viieteistkümne poe ja e-poega organisatsiooniks”.',
    '(E): hind, „mis tundub liiga hea, et olla tõsi”.',
    '(F): „Turvatool, kiiver ja madrats peavad olema kindlasti terved”.',
    '(G): „tasub küsida kahte asja”.',
    '(F): vana külmik „võib kulutada nii palju elektrit, et odav ostuhind kaotab kiiresti mõtte”.',
  ],
  '055_d_cloze': [
    'Tegija (klubi) ei ole oluline → umbisikuline minevik: võeti.',
    'Tingimus → umbisikuline olevik: lõpetatakse.',
    'ei ole + -nud: ei ole kasutanud.',
    'lepingu + nimisõna omastavas: lõpetamise kinnituse.',
    'Viisakas palve: paluksin (tingiv).',
    'kanda (da-tegevusnimi), tulemus terve → täissihitis: summa.',
    'ühtegi … lepingut → osastav; leping ise pikeneb → -v: pikenevat.',
    'Vastuargument: kuigi.',
    'oleksin tänulik — viisakas tingiv.',
    'Umbisikuline eitus: ei tagastata.',
  ],
  '055_d_bank': [
    'Üheksa tellimust → mitu eurot kokku: üle seitsmekümne.',
    'Unustatud tellimused → näide: äpp võttis raha kaks aastat.',
    'Otsustasin korda teha → esimene samm: kõik püsimaksed tabelisse.',
    'Millal viimati kasutasin → tulemus: viit ei avanud kolm kuud.',
    'Tühistasin → raskus: ühe äpi pärast kirjutasin kolm korda. Üle jääb „võtsin uue tellimuse”, mis ei sobi loo mõttega.',
    'Vaatan üle iga kolme kuu tagant → säästetud raha läheb reservi.',
  ],
  '055_p_fix': [
    'Eitus → osasihitis: tellimust.',
    'Eitus olemasolu lauses → osaalus: reservi.',
    'Hinda küsiti varem → -tud: küsitud.',
    'Umbisikuline eitus: ei tagastata.',
    'Oleksin tänulik, kui + tingiv: vastaksite.',
    'kuigi-lause ees → pealauses tegusõna kohe: võtaksin.',
  ],
  '055_p_trans': [
    'Eitus → osasihitis mitmuses: kõiki arveid.',
    'Kampaania ise algas → -nud: alanud.',
    'Tegija (pood) kaob → umbisikuline: tagastatakse.',
    'Käsk → viisakas palve: paluksin + da-tegevusnimi.',
    'Vastuargument: kuigi; kuigi-lause ees → tegusõna kohe (kuhjuvad).',
    'Kahe hinna vastandus: seevastu.',
  ],
  '055_p_notes': [
    'Teade 1: „Katkiseid elektriseadmeid me vastu ei võta.”',
    'Teade 1: „Palun võtke kaasa oma kotid.”',
    'Teade 2: „pere eelarve ja tellimuste kontrollimine”.',
    'Teade 2: „kohti on ainult kakskümmend”.',
    'Teade 3: „saate lepingu lõpetada kolmekümne päeva jooksul”.',
    'Teade 4: „kampaania kestab sel aastal neli päeva”.',
  ],
  '055_p_listen': [
    'Saatejuht: „kellel on endal kolm last”.',
    'Merike: „Alguses piisab paarist eurost nädalas.”',
    'Merike: „Teismelisele pigem kord kuus.”',
    'Merike: „Kodutööd on pere ühine asi.”',
    'Merike: „näiteks auto pesemise eest”.',
    'Merike: „Ärge andke juurde.”',
    'Merike: „Kümneaastaselt võib proovida.”',
    'Merike: „Pangaäpis näeb laps, kuhu raha läks.”',
    'Merike: „kümme protsenti igast summast läheb hoiupõrsasse”.',
  ],
  '055_p_tf': [
    'Vale: „tavaliselt kuue või seitsme aasta vanuselt”.',
    'Õige: „kuu on tema jaoks liiga pikk aeg”.',
    'Vale: „Ma ei soovita. Kodutööd on pere ühine asi.”',
    'Õige: „Lisatöö eest … võib aga maksta eraldi.”',
    'Vale: „Ärge andke juurde.”',
    'Õige: „see õpetab rohkem kui iga loeng”.',
    'Vale: hoiupõrsasse läheb kümme protsenti.',
    'Õige: „Lapsed näevad, kuidas te poes otsustate, palju rohkem, kui te arvate.”',
  ],
};
