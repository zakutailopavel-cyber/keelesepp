// B2 course (B1 → B2 roadmap), module 10 „Suhted ja konfliktid” (b1b2-046…050), stage B2-.
// Methodology v5 „lesson budget” (docs/METHODOLOGY_B1_B2_V5.md, strictModulesV5.json) on the v3 station engine with the
// v4 task formats (docs/COURSE_DESIGN_STATIONS.md §7), built like modules 1–9 (b2/module01.js … module09.js): one real
// communicative outcome a lesson, ONE input, ≤ 4 / 4 / 5 blocks a sheet and ≤ 14 a lesson, a 75-min core in 4 stations.
// Module goal (the learner): „Ma oskan oma suhetes pinget rahulikult lahendada: kirjeldan inimest õiglaselt, ütlen, mida
// tunnen ja miks, annan teiste sõnad täpselt edasi ja jõuan kokkuleppeni.” Relationships from the learner's own angle: a
// friend he recommends, money lent to a friend, a noisy house and its chat, a family that plans one summer. The learner
// may always choose a neutral or invented story; no personal disclosure is required.
//   Avasta  (4): station 1 one statement (046: the module's cold task in SPEECH, 2 minutes to think + 1 minute; module 9
//                measured writing), station 2 the lesson's words, one explanatory scheme and the ONE input — reading
//                about 450–500 words with 3 inference questions (046 how a friendship grows, 048 a house chat that boils
//                over) or listening about 3.5–4 min with 2 voices and 10 items (047 money between friends, 049 position
//                and interest in a family).
//   Harjuta (4): station 3 the rule (the B1 form as a one-line review, then the B2 step), one form task of 10 items and
//                one coherent text of 10 gaps, both without a word bank (a reference for an animal shelter, a forum post,
//                the minutes of a house meeting, a family chat), and one register / paraphrase task of 8 rows (message to
//                a friend → reference letter, reproach → I-message, order → proposal; in 048 the board's newsletter with a
//                bank of 8 neutral sentences and one angry chat message left over — the Harno R4 corner).
//   Kasuta  (5): station 4 the plan, the product (a reference for a friend, a debate with keyword cards, a mediation
//                between two neighbours, a negotiation game of three generations — each with hidden information), the
//                home writing of ~140 or ~180 words with the 1-min voice message, the analytic Harno B2 rubric (a
//                borderline sample in the teacher's note) and the exit „Ma oskan …” with three success criteria.
//   046 facts   „Kas sul on sõber, kellele saad öösel kell kolm helistada?”  reading „Sõber ei teki iseenesest”       character nouns and opposites
//   047 case    „Sõber ei maksa 300 eurot tagasi — kuidas sellest rääkida?”  radio „Raha ja sõprus”, 2 voices          feelings with their case, -ki / -gi
//   048 infogap „Muusika kell 23 ja majagrupp keeb — kuidas tüli vahendada?”  reading „Kui majagrupp keeb”           reported speech, precisely
//   049 game    „Kaks õde ja üks apelsin: kuidas pere ühise plaani leiab?”    radio „Seisukoht ja huvi”, 2 voices      proposals and conditions
//   050 exam    Module control: one sheet, 45 min, LISTENING + SPEAKING (module 7 L + W, module 8 R + S, module 9 R + W).
//                Why L + S: the module's cold task is spoken (module 9 measured writing), so its parallel task must be
//                spoken too; the module product „Minu kokkulepe” is a talk; conflicts are solved by listening and
//                speaking. Listening opens with L1 as on the exam: eight short notices, each its own clip of 35–45 s heard
//                once (locked); then the v4 interview with a house chairman, now heard twice and locked.
// Module requirements (v5 §2): cold task 046_d_cold (2 + 1 minutes, no phrases) ↔ parallel new task 050_t_cold (same
// conditions, new statement); a speech without phrases in every other station 1 (047–049); hidden-information cards
// 046_t_call, 047_t_talk, 048_t_relay, 049_t_game, 050_t_deal („Varjatud info:”); debate cards with 2–3 keywords an
// argument (047_t_talk); link task 049_t_plan (a real bus or train on Peatus.ee); one scheme a teaching lesson (046 flow,
// 047 formula, 048 flow, 049 compare); texts are adapted learning texts without exact statistics („KeeleSepp õppetekst”,
// owner 2026-11-25); no story cast, no dictation, no „Kas teadsid?”. Module 3 had the adjective, module 7–9 kuna /
// seetõttu / mistõttu, module 2 and 8 the conditional, module 7 the quotative -vat: each comes back here as the one-line
// review, the B2 step is new.
// Kept: lesson ids, titles, the four lesson topics and formats, the archetypes (LUGE, RÄÄK, KIRJ, PROJ, EKS). Removed
// blocks stay in the file as hide(block, why) (blocks.js) — the v4 lessons of 2026-11-19 are kept below as V4 and every
// block not on a v5 sheet is taken from there with retire(): off every sheet, ids and learners' answers kept; their closed
// drills still feed the Harjuta practice engine (practice/engine/extract.js) with their old explanations (OLD_WHY, the
// v4 EXPLAIN map).
import { B, hide, tag, teach, why, withShapes } from '../blocks.js';
import { exitCheck, extension, homeTask, purpose, station } from '../stationBlocks.js';

// a talk with the teacher as the partner, done in the lesson (engine/inLesson.js), not a home recording
const inLesson = (block) => ({ ...block, inLesson: true });
// the lesson's grammar as the small subtitle under the title on every sheet
const grammar = (text) => ({
  discover: { label: '1 Avasta', slot: 1, subtitle: text },
  practice: { label: '2 Harjuta', slot: 2, subtitle: text },
  transfer: { label: '3 Kasuta', slot: 3, subtitle: text },
});
// the home task card at the end of every v4 lesson (hidden in v5: the home task is the writing on the sheet)
const homework = (id, items) => B.phrasebank(id, [['Kodutöö', items]]);
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 10. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';
// nobody has to tell a real story from his own life
const OWN_OR_INVENTED = 'Võid rääkida oma, tuttava või väljamõeldud loo.';
// the home voice message of v5 (§3): one line at the end of the home writing (a learner who cannot record says it in class)
const VOICE_HOME = 'Salvesta ka 1-minutiline häälsõnum samal teemal.';

// why a block left the sheet (v5 §4)
const CUT_INPUT = 'second input of the lesson (v5: one input per lesson)';
const CUT_DRILL = 'closed drill / exit gaps → Harjuta (v5 §4: drills off the lesson sheet)';
const CUT_EXTRA = 'extra task (v5: one product task in Kasuta; „Kui aega jääb” is in the teacher plan)';
const CUT_HOME = 'home card / voice task: the home task is the writing on the sheet with its 1-min voice message (v5 §3)';
const CUT_HOOK = 'v5: station 1 is one statement the learner answers at once (5 min); the hook text and the talk merged';
const CUT_TALK = 'v5: a 2.5–3.5-min talk with phrases in station 1 (audit 2026-11-25: B2 talks 1 min); the cold task 046_d_cold takes its place';
const CUT_STATS = 'exact statistics (owner 2026-11-25: adapted texts, no exact numbers) or a second input';
const CUT_SHORT = 'a short voice message below B2 as the input (audit 2026-11-25): replaced by the lesson\'s one input';
const CUT_OLDTASK = 'v4 task replaced by the v5 task of the same station (new id, other block type)';
const CUT_KNOW = '„Kas teadsid?” (v5 §4: cut unless the task uses it)';
const CUT_CONTROL = 'control is one sheet ≤ 10 blocks, listening + speaking (v5 §5)';

// the analytic Harno B2 writing rubric (v5 G10): four criteria, 0–3 points each, with level descriptors; the teacher's
// note holds a borderline sample with its scoring (the same rubric as modules 1–9, 17 and 18)
const B2_WRITING = [
  ['Ülesande täitmine ja register', '3 — kõik sisupunktid on täidetud, adressaat ja toon sobivad, pikkus on ülesande piires; 2 — üks punkt on nõrk või toon kõigub; 1 — kaks punkti on puudu või toon ei sobi adressaadile; 0 — tekst ei vasta ülesandele'],
  ['Ülesehitus ja sidusus', '3 — lõigud, teemalaused ja mitmekesised sidendid, mõte liigub loogiliselt; 2 — lõigud on olemas, kuid sidendid korduvad; 1 — mõtete loetelu ilma lõikudeta; 0 — järjekorrast ei saa aru'],
  ['Sõnavara', '3 — täpne ja mitmekesine, kordusi väldib; 2 — piisav, mõni kordus või ebatäpne sõna; 1 — piiratud, sõnad korduvad, tähendus on kohati segane; 0 — sõnavara ei kanna sisu'],
  ['Grammatika ja õigekiri', '3 — liitlaused ja vormid (käänded, sõnajärg sidendi järel, kaudne kõne, tingiv kõneviis, tunde sõna rektsioon) on enamasti õiged; 2 — vigu on, kuid need ei takista mõistmist; 1 — vead takistavad kohati mõistmist; 0 — vead takistavad mõistmist pidevalt'],
];
// short: the one-line descriptors (the same four criteria), where the full ones would leave the self-check alone on a page
const B2_WRITING_SHORT = ['3 kõik punktid, sobiv toon · 2 üks nõrk koht · 1 kaks puudu · 0 ei vasta', '3 lõigud ja mitmekesised sidendid · 2 sidendid korduvad · 1 loetelu · 0 segane', '3 täpne ja mitmekesine · 2 mõni kordus · 1 piiratud · 0 ei kanna sisu', '3 vead ei sega · 2 vead ei takista · 1 takistavad kohati · 0 takistavad pidevalt'];
const writingRubric = (id, title, sample, short = false) => {
  const b = B.rubricW2(id, title);
  return teach(purpose({ ...b, goal: 'g_use', data: { ...b.data, instruction: 'Analüütiline hindamisjuhend (Harno B2): neli kriteeriumi, igaüks 0–3 punkti, kokku 12. Sama juhendiga kontrollid oma teksti enne saatmist.', criteria: B2_WRITING.map(([name, hint], i) => ({ name, max: 3, hint: short ? B2_WRITING_SHORT[i] : hint })) } }, 'Enne saatmist näed, mille eest hindaja punkte annab.'), sample);
};
// a home text is written at home: fewer lines on the sheet, so the sheet ends on a full page
const homeLines = (b, lines) => ({ ...b, data: { ...b.data, lines } });
// control: change a kept v4 block's data; the recordings' play count (G6: B2 2×, a short clip 1×, locked in a control)
const patch = (b, data) => ({ ...b, data: { ...b.data, ...data } });
const twice = (b) => ({ ...b, data: { ...b.data, plays: 2, lockPlays: true } });
const once = (b) => ({ ...b, data: { ...b.data, plays: 1, lockPlays: true } });
// L1 as on the exam: every short clip is its own recording (tools/listening-audio, `questions[i].script`, one play
// button a clip); the block's transcript stays the whole text the teacher reads (as b2/module07.js)
const perClip = (block) => {
  const clips = String(block.data.transcript).split('\n').map((line) => line.replace(/^[^:]{1,20}:\s*/, '').trim()).filter(Boolean);
  return { ...block, data: { ...block.data, questions: block.data.questions.map((q, i) => ({ ...q, script: clips[i] })) } };
};

export const MODULE = { id: 'b1b2-module-10', course: 'b2', title: 'Suhted ja konfliktid', level: 'B2-', design: 'v3-stations', template: 'v4' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });

// the v4 lessons of 2026-11-19 (B1+ „task-based”): the source of every block that is not on a v5 sheet
const V4 = {
  'b1b2-046': {
    title: 'Kas sul on sõber, kellele saad öösel kell kolm helistada?',
    phases: grammar('Keel: omadus ja vastand — lahke → lahkus, sõbralik → sõbralikkus → ebasõbralik, tänama → tänamatu'),
    format: 'facts',
    topic: 'freetime',
    canDo: 'Ma kirjutan sõbrale soovituse, kus kirjeldan tema iseloomu tegude kaudu, ja võrdlen oma kogemust faktidega sõpruse ja üksilduse kohta; moodustan omadussõnast nimisõna ja vastandi (lahkus, sõbralikkus, ebasõbralik, tänamatu).',
    teacherPage: {
      goal: 'Ученик проверяет факты о дружбе и одиночестве, описывает человека через поступки и рекомендует друга; словообразование: aus → ausus → ebaaus, kannatlik → kannatamatu.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 1 вопрос; станция 3 — правило и 4 строки; станция 4 — только звонок без слабой стороны друга. Текст (станция 2) — дома, 6 вопросов в начале следующего урока.',
      hook: '«Представь: три часа ночи, у тебя беда. Кому ты звонишь? Что делает этого человека таким другом — одно качество и один поступок». Ответьте сами одной фразой, потом ученик. Можно назвать сестру, соседа или «пока никого» — это тоже честный ответ.',
      plan: [
        '0–4: крючок — кому я позвоню в три часа ночи, ученик отвечает сразу',
        '4–15: станция 1 — разговор о своих друзьях: как познакомились, что важно',
        '15–30: станция 2 — слова (2 мин), прогноз карандашом по 6 вопросам, текст, проверка прогноза',
        '30–42: станция 3 — заметить в тексте → правило → характеристика подруги: 7 пропусков',
        '42–57: станция 4 — сообщение знакомой, звонок: три качества друга с примерами',
        '57–69: «Kui aega jääb» — игра «Угадай качество»',
        '69–76: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: рекомендация, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Текст станции 2: Jeffrey A. Hall, «How many hours does it take to make a friend?», Journal of Social and Personal Relationships (онлайн 2018): около 50 часов — от знакомого к приятелю, около 90 — к другу, более 200 — к близкому другу; Joint Research Centre, EU Loneliness Survey 2022: 13 % одиноки всё или большую часть времени, 35 % — хотя бы иногда; WHO Commission on Social Connection, 30.06.2025: одиночество затрагивает каждого шестого, ≈ 871 000 смертей в год, чаще всего у подростков и молодых; Harvard Gazette (интервью с Robert Waldinger): исследование с 1938 г., 724 мужчины, удовлетворённость отношениями в 50 лет предсказывала здоровье в 80 лучше холестерина. В Эстонии 14 февраля — sõbrapäev. Подруга Кати, знакомая Мерле и её мама — учебные.',
      groups: 'Станция 1 — в парах. Прогноз и текст — каждый сам, сверка в паре. Станция 4: один — Мерле с вашей карточкой, другой рассказывает о друге; потом смена. В 1:1 Мерле — вы.',
      errors: [
        '«Ta on ausus» → «Ta on aus» / «Tema ausus …» (качество человека — прилагательное, качество как вещь — существительное).',
        '«kannatlikus» → «kannatlikkus» (-lik + -kus: два k).',
        '«mitteaus», «ebakannatlik» → «ebaaus», «kannatamatu» (у каждого слова свой антоним: eba- или -matu).',
        '«Ma hindan tema ausus» → «… tema ausust» (hindama — частичный объект).',
      ],
      notes: [
        'Формат — анализ фактов: сначала ученик гадает (сколько часов нужно, чтобы стать друзьями; кто одинок чаще), потом читает и проверяет. Одиночество — тема деликатная: ученик не обязан говорить о себе, можно о «человеке, которого знаю».',
        'Пенсионеру — друг юности или соседка; студенту — сосед по общежитию; маме в декрете — подруга с детской площадки; уставшему — коллега по смене (о работе только как пример друга). Рекомендация на станции 4 может быть о выдуманном человеке.',
        'Обратная связь, 2–3 цели: качество + поступок как доказательство («Ta on täpne: …»); форма существительного или антонима; смягчение слабой стороны («vahel natuke …, aga …»).',
      ],
    },
    discover: [
      station(B.text('046_d_hook', 'Kellele sa helistad?', 'Kell on kolm öösel ja sul on suur mure. Kellele sa helistad? Ütle kohe üks tema omadus ja üks asi, mida ta on sinu heaks teinud.'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('046_d_talk', 'Minu sõbrad.', `Vasta igale küsimusele ja too näide. ${OWN_OR_INVENTED}`, [
        'Kuidas sa oma kõige vanema sõbraga tuttavaks said ja kuidas te üksteist toetate?',
        'Mis on sõbras sulle kõige tähtsam — ausus, otsekohesus või muu — ja mis häirib?',
        'Kas täiskasvanuna on uusi sõpru raskem leida? Miks?',
      ], [150, 210], ['Minu sõber on …: näiteks kord …', 'Mulle on kõige tähtsam …', 'Mind häirib, kui …']), 'Sinu enda sõbrad annavad tunni faktidele esimese võrdluse.'), { task: 'S12', fluency: true }),
      'Üks-ühele: räägi ka ise lühidalt oma sõbrast. Ära paranda; lõpus ütle üks omadussõna, mida õpilane vajas ja ei teadnud. Kui õpilane ütleb, et tal pole sõpru: „Kellega sa viimati pikalt rääkisid? Mis inimene ta on?”')),
      station(tag(B.vocab('046_d_vocab', 'Enne lugemist: sõnad.', ['usaldusväärne — надёжный', 'tähelepanelik — внимательный', 'aus — честный', 'kannatlik — терпеливый', 'hooliv — заботливый', 'üksildus — одиночество', 'tuttav — знакомый', 'usaldus — доверие', 'aega veetma — проводить время', 'toetama — поддерживать']), { topic: ['üksildus'] }), 2, 15),
      B.topicOpener('046_d_open', 'Moodul 10. Sõbrad ja üksildus: mida ütlevad uuringud?', [
        'Eestis on 14. veebruar sõbrapäev. Paljudes riikides on see armastajate päev, aga meil saadetakse kaarte ja kommi ka sõpradele, klassikaaslastele ja kolleegidele. See on hea põhjus küsida, kui palju sõpru inimene vajab ja kuidas sõprus üldse tekib. Lapsepõlves leiame sõbra liivakastist ja koolis istume temaga ühes pingis, kuid täiskasvanuna on päevad täis tööd ja kohustusi ning uus sõprus ei teki enam iseenesest.',
        'Ameerika uurija Jeffrey Hall küsis inimestelt, kui palju aega nad uute tuttavatega veetsid. Tema arvutuse järgi kulub umbes 50 tundi koos veedetud aega, et tuttavast saaks hea tuttav, umbes 90 tundi, et temast saaks sõber, ja üle 200 tunni, et temast saaks lähedane sõber. Tähtis ei ole ainult aeg, vaid ka see, mida koos tehakse: jutuajamine ja ühine tegevus loovad sidet rohkem kui lihtsalt samas ruumis istumine. Seepärast leiavad täiskasvanud uusi sõpru sageli kursusel, koorist, trennist või vabatahtlikust tööst: seal on kohtumine iganädalane harjumus.',
        'Euroopa Komisjoni esimese üleeuroopalise uuringu järgi tundis end viimase nelja nädala jooksul üksildasena kogu aeg või suurema osa ajast 13 protsenti Euroopa Liidu elanikest ja vähemalt aeg-ajalt rohkem kui kolmandik. Paljusid üllatas, et noored ei olnud vähem üksildased kui vanemad inimesed. Maailma Terviseorganisatsiooni 2025. aasta raporti järgi puudutab üksildus umbes iga kuuendat inimest maailmas ja kõige sagedamini noori. Raporti autorid seovad üksildust ligi 871 000 surmaga aastas.',
        'Üksi elamine ei tähenda veel üksildust. Üksildus tekib siis, kui inimesel ei ole kellegagi rääkida, kui midagi juhtub, ega kedagi, kes teda toetaks. Harvardi ülikoolis 1938. aastal alanud uuringus on sadu mehi ja hiljem ka nende peresid jälgitud üle kaheksakümne aasta. Uurijad leidsid, et see, kui rahul oli inimene viiekümneaastaselt oma suhetega, ennustas tema tervist kaheksakümneaastaselt paremini kui kolesterool. Uuringu juhi Robert Waldingeri sõnul ei loe sõprade arv, vaid suhete kvaliteet: kas sul on keegi, keda sa usaldad. Hea sõber ei pea olema iga päev sinu kõrval; tähtis on teadmine, et ta vastab, kui sa teda vajad.',
        'Selles moodulis räägid oma suhetest: kirjeldad inimest tema tegude järgi, ütled, mida tunned ja miks, annad naabrite sõnu edasi ja jõuad pere või sõpradega kokkuleppele. Oma loo võid alati ka välja mõelda.',
      ], 'Jeffrey A. Hall, ajakiri Journal of Social and Personal Relationships (2018); Euroopa Komisjoni Teadusuuringute Ühiskeskus, ELi üksilduse uuring 2022; Maailma Terviseorganisatsiooni sotsiaalse sidususe komisjoni raport (30.06.2025); Harvard Gazette, intervjuu Robert Waldingeriga', [
        'Kas sõbrapäeva tähistatakse ka sinu kodumaal? Mille poolest see erineb Eestist?',
        'Kus sina oled täiskasvanuna uusi sõpru leidnud? Kas 200 tundi tundub sulle palju või vähe?',
        'Miks võivad noored tunda end sama üksildasena kui vanemad inimesed?',
        'Mida võiks sinu maja, kursus või töökoht teha, et keegi ei jääks üksi?',
      ]),
      teach(tag(purpose(B.choice('046_d_facts', 'Arva ja kontrolli: mida ütlevad uuringud?', 'Enne lugemist arva iga küsimuse vastus pliiatsiga. Siis loe teksti ja vali õige vastus.', [
        ['Mille poolest erineb 14. veebruar Eestis sellest päevast paljudes teistes riikides?', 'kaarte saadetakse ka sõpradele ja kolleegidele', 'seda tähistatakse märtsis', 'see on riigipüha ja vaba päev', 'kingitusi tehakse ainult lastele'],
        ['Mis loob uurija Jeffrey Halli järgi kahe inimese vahel kõige rohkem sidet?', 'jutuajamine ja ühine tegevus', 'lihtsalt samas ruumis istumine', 'sõnumite saatmine iga päev', 'ühine töökoht'],
        ['Miks leiavad täiskasvanud teksti järgi uusi sõpru sageli kursusel, koorist või trennist?', 'seal veedetakse regulaarselt aega ja tehakse midagi koos', 'seal on palju noori inimesi', 'need on alati tasuta', 'seal ei pea kellegagi rääkima'],
        ['Mis üllatas paljusid Euroopa Komisjoni uuringus, kus küsiti üksilduse kohta?', 'noored ei olnud vähem üksildased kui vanemad', 'üksildasi oli väga vähe', 'kõik tundsid end vahel üksi', 'vanemad inimesed olid kõige üksildasemad'],
        ['Mis ennustas Harvardi uuringus inimese tervist kaheksakümneaastaselt paremini kui kolesterool?', 'rahulolu oma suhetega viiekümneaastaselt', 'sõprade arv kahekümneaastaselt', 'sissetulek ja haridus', 'üksi või perega elamine'],
        ['Millise sõpruse liigi jaoks kulub Halli arvutuse järgi kõige rohkem koos veedetud aega?', 'lähedane sõber', 'hea tuttav', 'sõber töökohas', 'naaber trepikojas'],
        ['Miks ei tähenda üksi elamine teksti järgi veel üksildust?', 'üksildus tekib siis, kui pole kellegagi rääkida ega kedagi, kes toetaks', 'üksi elavad inimesed on alati õnnelikud', 'üksi elavad ainult noored', 'üksi elamine on Eestis haruldane'],
        ['Millise mõttega oleks teksti autor sõpruse ja üksilduse kohta kõige rohkem nõus?', 'tähtis ei ole sõprade arv, vaid see, kas on keegi, keda usaldad', 'üksi elav inimene on alati üksildane', 'sõprus tekib iseenesest, aega ei ole vaja', 'üksildus puudutab peamiselt eakaid'],
      ], 'full', 'g_read'), 'Näed, kas sinu kogemus ja arvamus sõprusest langevad kokku uuringutega.'), { task: 'R13', harno: 'R1' }),
      'Eksaminurk (R1): eksamil on pikem artikkel ja küsimused neljast valikust. Kõigepealt prognoos pliiatsiga (2 min), siis lugemine, siis kontroll. Küsi lõpuks: „Mis üllatas sind kõige rohkem?” Arv 200 tundi on hea arutelu algus: kui palju aega veedab õpilane praegu oma sõpradega?'),
    ],
    practice: [
      station(B.notice('046_p_notice', 'Märka: lahke → lahkus → ebasõbralik?', [
        'Tekstist: inimene tundis end **üksildasena** → see on **üksildus** · keegi, keda sa **usaldad** → **usaldus** · kui **rahul** oli inimene → **rahulolu**',
        '**Omadus kui asi** (nimisõna) lõpuga -us või -dus: lahke → **lahkus**, julge → **julgus**, üksildane → **üksildus**, otsekohene → **otsekohesus** · -lik muutub -likkus: sõbralik → **sõbralikkus**, ettevaatlik → **ettevaatlikkus**',
        '**Vastand eesliitega eba-**: sõbralik → **ebasõbralik**, õiglane → **ebaõiglane**, kindel → **ebakindel**, meeldiv → **ebameeldiv**',
        '**Vastand lõpuga -matu** (ma-tegevusnimest): tänama → **tänamatu**, mõtlema → **mõtlematu**, tähele panema → **tähelepanematu**',
        'Kontrolli kahe küsimusega: kas lause vajab **omadust** (Ta on julge.) või **asja** (Tema julgus on haruldane.)? Kas mõte on **positiivne** või **vastupidine**? Nimisõna käändub: imetlen tema **julgust**, imestan tema **sõbralikkuse** üle.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('046_p_forms', 'Sõbranna kirjutab oma sõbrast.', 'Otsusta, kas lause vajab omadust, asja või vastandit, ja kirjuta sulgudes olev sõna õiges vormis.', [
        'Kui Kati midagi lubab, teeb ta selle ka ära — tema [usaldusväärsus] on mulle kõige tähtsam. (usaldusväärne)',
        'Ta ei ole kunagi unustanud mu sünnipäeva; selline [tähelepanelikkus] on tänapäeval haruldane. (tähelepanelik)',
        'Ainult järjekorras on ta natuke [kannatamatu]: viis minutit ootamist ja ta hakkab närveerima. (kannatlik)',
        'Kui üks endine kolleeg tema kohta valesid levitas, tegi selline [ebaaus] käitumine talle väga haiget. (aus)',
        'Ta ei jäta kunagi koera kuuma autosse, sest ta ei ole [hoolimatu] inimene. (hoolima)',
        'Ma hindan väga tema [ausust], kuigi vahel võiks ta midagi ka ütlemata jätta. (aus)',
      ], '', 'full', 'g_notice'), 'Sõbranna saadab selle teksti üürileandjale; täpne sõna teeb kirjelduse usaldusväärseks.'), { task: 'G09' }),
      'Pärast iga rida küsi: „Kas siin on omadus, asi või vastand?” Viimane rida: hindama tahab osastavat (ausust). Lisa küsimus: „Kas sinul on mõni neist omadustest? Too näide.”'),
    ],
    transfer: [
      station(tag(purpose(B.dialogue('046_t_chat', 'Tuttav kirjutab sulle.', 'Loe sõnumeid: mida tahab Merle ema sinu sõbra kohta teada?', 'Merle', 'Sina', [
        ['A', 'Tere! Mu ema annab Tartus oma korteris ühe toa üürile. Sinu sõber Kati kandideerib. Kas sa tunned teda hästi?'],
        ['B', 'Tere! Jah, oleme sõbrad juba kaheksa aastat. Tutvusime ülikoolis ja elasime kaks aastat samas ühiselamus.'],
        ['A', 'Ema on 74 ja natuke ettevaatlik. Tal on kolm küsimust: kas Kati maksab õigel ajal, kas ta on vaikne ja kas temaga saab rääkida, kui midagi on valesti?'],
        ['B', 'Mõistlikud küsimused. Las ma mõtlen, mida ma Kati kohta tean.'],
        ['A', 'Eelmine üürnik jättis kaks kuud üüri maksmata ja kuulas öösiti valju muusikat. Pärast seda on emal halb enesetunne iga kord, kui keegi uus tuleb.'],
        ['B', 'Saan aru. Kati on hoopis teistsugune, aga ma räägin sulle näidetega, mitte ainult kiitusega.'],
        ['A', 'Ema palus ka kirjalikku soovitust, sest ta tahab seda rahulikult lugeda ja vajadusel uuesti üle vaadata. Kas saaksid selle reedeks saata?'],
        ['B', 'Muidugi. Homme näeme kohvikus, siis räägin lähemalt ja sa saad kõike küsida.'],
      ], 'g_read'), 'Sõnumitest näed, mida üürileandja tegelikult kardab; sellele vastad oma sõbra näidetega.'), { task: 'R12' }), 4, 15, { final: 'present' }),
      tag(purpose(B.profiles('046_t_card', 'Kui sa ei taha rääkida oma sõbrast: Kati kaart.', 'Loe Kati tegusid ja mõtle iga teo juurde omadus. Kasuta kaarti vestluses, kui ei taha rääkida päris inimesest.', [
        ['Kati (34), sinu sõber', ['maksab arved alati kuu esimesel päeval', 'aitas sul kolida ja tõi kõigile suppi', 'mäletab sinu ema sünnipäeva ja helistab talle', 'ütleb otse, kui talle midagi ei meeldi', 'jääb vahel hiljaks, aga annab alati ette teada', 'hoolitseb naabri kassi eest, kui naaber on ära'], []],
      ], '1', 'g_read'), 'Kaart annab tegelikud teod, mille järgi omadust tõestada.'), { task: 'R08' }),
      teach(tag(purpose(B.rolecards('046_t_call', 'Kohtu Merlega.', 'Räägi Merlele kohvikus oma sõbrast nii, et tema ema saaks otsustada: iga omadus koos näitega.',
        'Olukord: sinu sõber (päris või väljamõeldud) tahab üürida tuba vanemalt prouale.\nSinu eesmärk: vasta ema kolmele küsimusele — iga omadus koos teoga, mida sõber on teinud.\nPiirang: ole aus — nimeta ka üks nõrk külg, aga pehmelt.',
        'Merle kaart on õpetajal: ema kahtlused ja üks lisaküsimus.',
        ['Ta on väga usaldusväärne: näiteks kord …', 'Ta on tähelepanelik: ta märkab …', 'Tema suurim tugevus on …', 'Ausalt öeldes on ta vahel natuke …, aga …', 'Ma soovitan teda, sest …'], ['Aga kas ta …?', 'Kuidas sa seda tead?', 'Mis on tema nõrk külg?']), 'Tulemus: ema teab, kas ta võib sinu sõpra usaldada.'), { task: 'S11', level: 4 }),
      'Õpetaja kaart (Merle). Ütle ainult seda, mida küsitakse. Varjatud info: emal on kass ja ta tahab, et üürnik loomi armastaks; ema tahab, et keegi aitaks tal vahel poes käia; ema magab päeval tund aega. Takistused ükshaaval: 1) „Kõik sõbrad ütlevad oma sõbra kohta head. Too näide!” 2) „Kas tal on mõni halb harjumus?” 3) „Kas ta oleks nõus emal vahel poes abiks käima?” Õnnestunud, kui õpilane nimetab kolm omadust koos teoga, ütleb ühe nõrga külje pehmelt (vahel natuke …, aga …), kasutab vähemalt kaks nimisõna või vastandit (usaldusväärsus, kannatamatu) ja annab selge soovituse.'),
      extension(teach(tag(purpose(B.speaking('046_t_more', 'Mäng: arva omadus', 'Kirjelda ühte inimest (sõpra, naabrit või filmitegelast) ainult tema tegude kaudu, ilma omadussõnata. Paariline arvab omaduse ja ütleb selle ka nimisõnana.', [
        'Näide: „Ta ootas mind vihmas tund aega ega pahandanud.” → kannatlik, kannatlikkus.',
        'Igaüks kirjeldab kolm omadust: kaks positiivset ja ühe vastandi (eba- või -matu).',
      ], [120, 180], ['Kord ta …', 'Ta ei …-nud kunagi …', 'Kas ta on …? Siis on see …-us.']), 'Mäng näitab, et omadust tõestab tegu, ja harjutab sõnu ilma ettevalmistuseta.'), { task: 'G11', fluency: true }),
      'Kui aega jääb (12 min). Mängi kaasa: kirjelda ise kaks inimest tegude kaudu. Punkt: õige omadus + õige nimisõna (või vastand). Kui õpilane ütleb silti („ta on hea”), küsi: „Mida ta tegi?”'), 12),
      tag(exitCheck(purpose(B.gaps('046_t_exit', 'Kontrolli end: kolm sõna.', 'Kirjuta sulgudes olev sõna õiges vormis: omadus, asi või vastand.', [
        'Sõber hilineb alati ega vabanda kunagi — see on [hoolimatu] käitumine. (hoolima)',
        'Kõige rohkem hindan ma inimestes [ausust]. (aus)',
        'Uus naaber tundus alguses [ebaviisakas], aga tegelikult on ta lihtsalt häbelik. (viisakas)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas omadussõna, nimisõna ja vastand on käes.')), {}),
      purpose(B.selfcheck('046_t_self', ['Ma räägin oma sõpradest ja sellest, mis mulle sõpruses tähtis on.', 'Ma saan aru faktidest sõpruse ja üksilduse kohta ja võrdlen neid oma kogemusega.', 'Ma moodustan omadussõnast nimisõna ja vastandi: lahkus, sõbralikkus, ebasõbralik, tänamatu.', 'Ma kirjeldan inimest tema tegude kaudu ja soovitan teda.'], 'Sõber soovitatud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('046_t_letter', 'Kodus: soovitus sõbrale.', 'Kirjuta kodus Merle emale 140–160 sõna: kes sa oled ja kui kaua sõpra tunned, tema kolm omadust koos näitega, üks nõrk külg ausalt, aga pehmelt, ja sinu soovitus. Kasuta vähemalt kolme nimisõna või vastandit (näiteks lahkus, sõbralikkus, ebakindel).', 'Lugupeetud proua …!', 'Lugupidamisega\n(sinu nimi)', [140, 160]), 'Merle ema loeb sinu kirja ja otsustab, kas annab toa sinu sõbrale.')), { task: 'W08', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('046_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: milline on hea sõber ja kas sina oled ise selline sõber.', [
        'Millised kolm omadust on sõbras kõige tähtsamad?',
        'Millise oma omaduse kallal tahaksid veel töötada?',
      ], [60, 120]), 'Õpetaja kuulab ja ütleb, kas omadussõnad ja nimisõnad on õiged.')), { task: 'S15' }),
      homework('046_t_homework', ['1. Soovitus sõbrale, 140–160 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-047': {
    title: 'Sõber ei maksa 300 eurot tagasi — kuidas sellest rääkida?',
    phases: grammar('Keel: tunne, põhjus ja tagajärg — kuna, seetõttu, mistõttu; -ki / -gi — isegi, keegi, ei tulnudki'),
    format: 'case',
    topic: 'money',
    canDo: 'Ma räägin rahamurest sõbraga nii, et suhe jääb alles: nimetan oma tunde täpselt, seon selle põhjuse ja tagajärjega (kuna, seetõttu, mistõttu), rõhutan sõnu -ki või -gi abil (isegi, ei tulnudki) ja kirjutan sõbrale selge, aga sõbraliku kirja.',
    teacherPage: {
      goal: 'Случай: подруга одолжила другу 300 € и три месяца ждёт. Ученик называет чувства, связывает причину и следствие (kuna, seetõttu, mistõttu), -ki/-gi, и договаривается с другом.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 предложения; станция 4 — голосовое и короткий разговор без графика выплат. Переписка (станция 2) — дома, вопросы в начале следующего урока.',
      hook: '«Хороший друг пишет: „Одолжи мне 300 евро, отдам в конце месяца.“ Что ты делаешь: даёшь всё, даёшь меньше или говоришь нет? И одна причина.» Голосуйте оба, вы — с короткой причиной. Не оценивайте выбор ученика.',
      plan: [
        '0–3: крючок — дать в долг или нет, ученик отвечает сразу',
        '3–10: станция 1 — разговор: деньги и дружба (своя, знакомая или выдуманная история)',
        '10–25: станция 2 — слова (2 мин), переписка Олеси и Игоря за три месяца, 6 вопросов: кто что чувствует и почему; «Kas teadsid?» об устном займе',
        '25–37: станция 3 — заметить isegi / -ki и kuna / seetõttu в переписке → правило → честное письмо Олеси: 7 предложений',
        '37–52: станция 4 — голосовое Игоря (6 пропусков), разговор с Игорем в кафе: чувства, договорённость о выплатах',
        '52–64: «Kui aega jääb» — ролевая игра: вежливо сказать «нет» другому знакомому',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: письмо другу, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: '«Kas teadsid?»: võlaõigusseadus § 11 (договор можно заключить устно), tsiviilseadustiku üldosa seadus § 146 (срок давности требований из сделки — 3 года), Riigi Teataja; совет юриста фиксировать крупную сумму письменно — Maaleht, «Jurist soovitab: kui laenad suurema summa raha isegi sõbrale, tasub sõlmida kirjalik leping». Олеся, Игорь и переписка — учебные.',
      groups: 'Станция 1 — в парах. Переписку и вопросы — каждый сам, сверка в паре. Станция 4: один — Олеся (или своя история), другой — Игорь с вашей карточкой; потом смена. В 1:1 Игорь — вы.',
      errors: [
        '«Ma olin pettunud, kuna sa ei vastasid» → «… kuna sa ei vastanud» (отрицание прошедшего: ei + -nud).',
        '«Ta ei tulnudgi» → «Ta ei tulnudki» (после d, t, k, p, g, b, s, h — -ki; после гласных и l, m, n, r, v, j — -gi: keegi, temagi).',
        '«Keegi ei tea» / «Mitte keegi ei tea» — правильно; «Keegi teab» в значении «никто» — ошибка (в отрицании нужно ei).',
        '«Seetõttu ma ei kirjutanud» → в письменной речи «Seetõttu ei kirjutanud ma» (глагол вторым после наречия).',
      ],
      notes: [
        'Формат — реальный случай: деньги между друзьями. Ученик сам решает, говорить ли о своём опыте; есть всегда вариант «знакомая история» или выдуманная. Не спрашивайте о суммах и долгах самого ученика.',
        'Две стороны: на станции 4 ученик может быть и Игорем (тот, кто должен и кому стыдно). Студенту — долг соседу по комнате; пенсионеру — деньги внуку; маме в декрете — подруга, которой нужно на коляску.',
        'Обратная связь, 2–3 цели: чувство + причина + следствие в одном высказывании; -ki/-gi; я-сообщение вместо упрёка («Ma tundsin end …» вместо «Sa oled …»). В разговоре не перебивать, три замечания в конце.',
      ],
    },
    discover: [
      station(B.text('047_d_hook', 'Annad või ei anna?', 'Hea sõber kirjutab: „Kas saaksid mulle laenata 300 eurot? Maksan kuu lõpus tagasi.” Mida sa teed: annad kogu summa, annad vähem või ütled ei? Ütle kohe ja lisa üks põhjus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('047_d_talk', 'Raha ja sõprus.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Kas oled kunagi sõbrale või sugulasele raha laenanud või ise laenanud? Kuidas see lõppes?',
        'Mis tunne on oodata võlga, mida ei maksta — ja mis tunne on ise võlgu olla?',
        'Kas seal, kus sa üles kasvasid, laenatakse sõpradele raha sagedamini kui Eestis?',
      ], [150, 210], ['Ma tundsin end …, kuna …', 'Seetõttu …', 'Kord juhtus nii, et …']), 'Sinu kogemus või tuttava lugu annab tunni juhtumile esimese võrdluse.'), { task: 'S07', fluency: true }),
      'Üks-ühele: räägi ka ise üks lühike lugu (võib olla väljamõeldud). Ära küsi õpilase päris summasid. Lõpus ütle üks tunnet nimetav sõna, mida õpilane vajas.')),
      station(tag(B.vocab('047_d_vocab', 'Enne lugemist: sõnad.', ['laenama — одалживать (давать или брать в долг)', 'võlg — долг', 'tagasi maksma — возвращать (деньги)', 'pettunud — разочарованный', 'solvunud — обиженный', 'ärritunud — раздражённый', 'piinlik — неловко (стыдно)', 'süütunne — чувство вины', 'kergendus — облегчение', 'vältima — избегать']), { topic: ['süütunne', 'vältima'] }), 2, 15),
      tag(purpose(B.dialogue('047_d_chat', 'Olesja ja Igori sõnumid.', 'Sõbranna Olesja saatis sulle oma vestluse ja küsib: „Mida ma valesti tegin ja mida ma talle nüüd ütlen?” Loe sõnumeid.', 'Olesja', 'Igor', [
        ['A', '3. märts: Muidugi aitan! Kandsin sulle 300 eurot üle. Edu uue korteriga!'],
        ['B', 'Suur aitäh! Maksan kindlasti märtsi lõpus tagasi, sa oled tõeline sõber.'],
        ['A', '2. aprill: Tere! Kuidas uus korter on? Kas raha saaks juba tagasi? Mul on endal sel kuul hambaarst.'],
        ['B', 'Vabandust, palk tuli hiljem. Mais kindlasti!'],
        ['A', '20. mai: Igor, kas kõik on korras? Lubasid mais, aga raha ei tulnudki. Ma ei taha tülitada.'],
        ['B', 'Jah, jah, varsti.'],
        ['A', '15. juuni: Nägin pilte, et olid laupäeval kontserdil. Mulle sa isegi ei helista enam.'],
        ['B', 'Kas sa jälgid mind või? Keegi ei ole mulle nii palju kirjutanud! Ma ju ütlesin, et maksan.'],
      ], 'g_read'), 'Sõnumitest näed, kuidas kolme kuuga kasvas pinge; see on sinu nõu alus.'), { task: 'R07' }),
      teach(tag(purpose(B.choice('047_d_feel', 'Mida keegi tunneb ja miks?', 'Vali iga küsimuse juurde vastus, mis sõnumite põhjal kõige paremini sobib.', [
        ['Miks laenas Olesja Igorile raha?', 'Igor kolis uude korterisse ja vajas abi', 'Igor lubas maksta intressi', 'Olesjal oli raha üle', 'Igor oli talle varem laenanud'],
        ['Kuidas muutus Igori toon kolme kuuga?', 'tänulikust ärritunuks', 'ärritunust tänulikuks', 'see ei muutunud üldse', 'see muutus üha sõbralikumaks'],
        ['Miks vajas Olesja aprillis raha tagasi?', 'tal oli endal hambaarst', 'ta tahtis ise kontserdile minna', 'ta kolis samuti uude korterisse', 'pank nõudis temalt raha'],
        ['Mida tunneb Olesja tõenäoliselt juuni sõnumi ajal?', 'ta on pettunud ja solvunud', 'ta tunneb kergendust', 'tal on süütunne', 'ta on rõõmus ja uhke'],
        ['Miks võis Igor juunis nii teravalt vastata?', 'tal on piinlik ja ta tunneb end süüdi', 'ta on raha juba tagasi maksnud', 'ta ei mäleta laenu', 'Olesja solvas teda märtsis'],
        ['Mis oli Olesja juuni sõnumis kõige riskantsem?', 'etteheide kontserdi kohta, mis kõlab nagu jälgimine', 'kuupäev sõnumi alguses', 'see, et sõnum oli lühike', 'see, et ta ei nimetanud summat'],
      ], 'full', 'g_read'), 'Kui mõistad mõlema tundeid, oskad Olesjale nõu anda.'), { task: 'R02' }),
      'Pärast iga vastust küsi: „Kust sa seda näed?” Küsimused 4–6 on järeldused, mitte tsitaadid: õpilane põhjendab sõnumi tooniga. Lõpus: „Mida oleks Olesja pidanud juunis teisiti kirjutama?”'),
      B.know('047_d_know', ['Eesti seaduse järgi võib lepingu sõlmida ka suuliselt, nii et ka sõbrale suusõnal antud laen on laenuleping. Vaidluse korral tuleb aga tõendada, et raha anti laenuks: abiks on pangaülekanne ja sõnumid. Lepingust tuleneva nõude aegumistähtaeg on kolm aastat. Juristide nõuanne: suurema summa korral pange kokkulepe kirja — summa, tähtaeg ja maksegraafik.'], 'võlaõigusseadus § 11; tsiviilseadustiku üldosa seadus § 146 (Riigi Teataja); Maaleht, „Jurist soovitab: kui laenad suurema summa raha isegi sõbrale, tasub sõlmida kirjalik leping”', 'Kas teadsid? Suuline laen on ka leping'),
    ],
    practice: [
      station(B.notice('047_p_notice', 'Märka: isegi, keegi, ei tulnudki', [
        'Sõnumitest: Lubasid mais, aga raha **ei tulnudki**. · Mulle sa **isegi** ei helista enam. · **Keegi** ei ole mulle nii palju kirjutanud!',
        '**-ki / -gi** lisab rõhku. Pärast **k, p, t, g, b, d, s, h** → **-ki** (ei tulnud**ki**, ei maksnud**ki**); muidu **-gi** (tema**gi**, kuna**gi**, kee**gi**).',
        '1) **ei …-ki**: oodati, aga ei juhtunud: Ta **ei vastanudki**. · Jaatavas: juhtus, nagu karta oli: Ta **unustaski**. 2) **isegi / -gi** = isegi: **Temagi** (ka tema) teab seda.',
        '3) **keegi, miski / midagi, kunagi, kuskil**: määramatu inimene, asi, aeg, koht. Eituses: **mitte keegi**, **mitte midagi**, **mitte kunagi** + ei: Mitte keegi **ei** tea.',
        '**Tunne + põhjus + tagajärg**: **Kuna** keegi ei teatanudki, olin mures; **seetõttu** ei maganud ma terve öö. · Ta ei vastanud, **mistõttu** lõpetasin talle kirjutamise. (Pärast seetõttu on tegusõna kohe järgmine.)',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('047_p_ki', 'Olesja aus kiri.', 'Olesja kirjutab Igorile ausa kirja. Kirjuta iga lause ümber antud sõnaga nii, et mõte jääb samaks, aga tunne kõlab selgelt.', [
        ['Ma ootasin raha mais. Raha ei tulnud.', 'ei …-ki', 'Ma ootasin raha mais, aga see ei tulnudki.|Ma ootasin raha mais, aga raha ei tulnudki.'],
        ['Sa ei helistanud mulle. Sa ei helistanud ka minu sünnipäeval.', 'isegi', 'Sa ei helistanud mulle isegi minu sünnipäeval.|Sa ei helistanud isegi minu sünnipäeval.'],
        ['Ma ei ole sellest ühelegi inimesele rääkinud.', 'mitte kellelegi', 'Ma ei ole sellest mitte kellelegi rääkinud.|Ma pole sellest mitte kellelegi rääkinud.'],
        ['Ma olin pettunud. Põhjus: sa ei vastanud mu sõnumile.', 'kuna', 'Ma olin pettunud, kuna sa ei vastanud mu sõnumile.|Kuna sa ei vastanud mu sõnumile, olin ma pettunud.'],
        ['Ma ei saanud raha tagasi. Ma pidin hambaarsti edasi lükkama.', 'mistõttu', 'Ma ei saanud raha tagasi, mistõttu pidin hambaarsti edasi lükkama.|Ma ei saanud raha tagasi, mistõttu pidin ma hambaarsti edasi lükkama.'],
        ['Mul oli piinlik uuesti küsida. Ma ei kirjutanud kuu aega.', 'seetõttu', 'Mul oli piinlik uuesti küsida, seetõttu ei kirjutanud ma kuu aega.|Mul oli piinlik uuesti küsida. Seetõttu ei kirjutanud ma kuu aega.'],
        ['Ka sinu õde arvab, et sa peaksid mulle helistama.', '-gi', 'Sinu õdegi arvab, et sa peaksid mulle helistama.|Isegi sinu õde arvab, et sa peaksid mulle helistama.'],
      ], 'full', 'g_notice'), 'Igor loeb kirja ja saab aru, mida Olesja tundis ja miks — ilma solvanguta.'), { task: 'G05' }),
      'Pärast iga lauset küsi: „Mis tunne siin on ja mis on põhjus?” Rida 6: pärast seetõttu on tegusõna kohe teine (Seetõttu ei kirjutanud ma). Rida 7 on raskem: -gi liitub nimisõnaga (õdegi = isegi õde).'),
    ],
    transfer: [
      station(tag(purpose(B.listening('047_t_voice', 'Igori häälsõnum.', 'Igor saatis Olesjale häälsõnumi. Kuula kaks korda ja kirjuta lünka 1–2 sõna.', [
        'Tere, siin Igor. Ma lugesin su sõnumit mitu korda. Vabandust, ma pean sulle ausalt rääkima.',
        'Ma tean, et sa vajasid seda raha ise ja et sul oli hambaarst. Just see teeb mulle kõige rohkem häbi.',
        'Aprilli alguses jäin ma töötuks. Firma koondas poole meie osakonnast ja ma ei julgenud sellest kellelegi rääkida.',
        'Mul oli nii piinlik, et ma ei vastanudki sulle. Iga kord, kui su nimi telefonis vilkus, tundsin süütunnet.',
        'Kontserdi pileti kinkis mulle õde sünnipäevaks. Ma saan aru, et see nägi halb välja.',
        'Nüüd on mul uus töö laos ja esimene palk tuleb juuli alguses.',
        'Ma pakun nii: maksan alates juulist iga kuu viiskümmend eurot, kuni kogu summa on tagasi makstud. Kui tahad, paneme selle kirja.',
        'Ma kartsin, et kui ma sulle helistan, pead sa mind valetajaks. Aga vaikimine oli veel hullem.',
        'Ma ei taha sind kaotada. Helista mulle, palun, kui oled valmis rääkima.',
      ], [
        'Igor jäi töötuks juba [aprilli alguses|aprillis], aga ei rääkinud sellest kellelegi.',
        'Igor ei vastanud sõnumitele, sest tal oli [piinlik|häbi].',
        'Kui Olesja nimi telefonis vilkus, tundis Igor iga kord [süütunnet].',
        'Kontserdi pileti oli Igorile sünnipäevaks kinkinud tema [õde].',
        'Praegu töötab Igor oma uues töökohas [laos].',
        'Igor pakub, et maksab alates juulist iga kuu [viiskümmend eurot|50 eurot|viiskümmend].',
      ], 'g_read'), 'Häälsõnum näitab teist poolt; ilma selleta oleks su jutt Igoriga ainult süüdistus.'), { task: 'L07' }), 4, 15, { final: 'explain' }),
      teach(tag(purpose(B.rolecards('047_t_talk', 'Kohtu Igoriga.', 'Kohtu Igoriga kohvikus: ütle oma tunded ja nende põhjus, kuula teda ja leppige kokku, kuidas raha tagasi tuleb.',
        'Olukord: sa oled Olesja asemel (või sinu enda sarnane lugu); Igor saatis häälsõnumi ja te kohtute kohvikus.\nSinu eesmärk: ütle, mida tundsid ja miks (tunne + põhjus + tagajärg), kuula ja leppige kokku summa, kuupäevad ja kuidas edaspidi suhelda.\nPiirang: tahad hoida nii raha kui ka sõprust — ära süüdista, räägi endast.',
        'Igori kaart on õpetajal: tema hirm ja üks uus probleem.',
        ['Ma olin pettunud, kuna …', 'Seetõttu ma …', 'Kõige rohkem tegi haiget see, et sa isegi ei …', 'Ma tahan sind toetada, aga …', 'Mis oleks, kui …?', 'Paneme selle kirja: …'], ['Mul oli nii piinlik, et …', 'Ma olin ärritunud, sest …', 'Ma ei osanudki …', 'Kas sa annad mulle andeks?']), 'Tulemus: teil on kokkulepe ja sõprus jääb alles.'), { task: 'S13', main: true, level: 4 }),
      'Õpetaja kaart (Igor; õpilane võib valida ka Igori rolli, siis oled sina Olesja). Ütle ainult seda, mida küsitakse. Varjatud info: juuli palk on väiksem, juulis saad maksta ainult 30 eurot; kardad, et Olesja rääkis sinu võlast ühistele sõpradele; sul on tõesti häbi. Takistused ükshaaval: 1) „Kas sa rääkisid sellest teistele ka?” 2) „Juulis saan maksta ainult kolmkümmend.” 3) „Kas me oleme ikka sõbrad?” Õnnestunud, kui õpilane nimetab vähemalt kaks tunnet koos põhjusega (kuna, seetõttu, mistõttu), kasutab vähemalt kaks -ki/-gi vormi, ei süüdista (mina-laused) ja te lepite kokku summad ja kuupäevad.'),
      extension(teach(tag(purpose(B.speaking('047_t_more', 'Rollimäng: ütle viisakalt ei', 'Tuttav, kellega sa käid koos trennis, palub sult laenuks 500 eurot uue telefoni jaoks ja lubab kahe kuu pärast tagasi maksta. Ütle ei nii, et sõprus jääb. Õpetaja on tuttav ja proovib sind ümber veenda.', [
        'Kuidas ütled selgelt ei ja millega seda lühidalt põhjendad?',
        'Mida sa pakud raha asemel: nõu, abi või aega?',
        'Mida vastad, kui tuttav ütleb: „Aga sa ju laenasid Igorile!”',
      ], [120, 180], ['Mul on kahju, aga ma ei laena raha, kuna …', 'See ei ole sinu pärast, vaid …', 'Ma saan aidata hoopis …', 'Loodan, et sa saad aru.']), 'Kui oskad viisakalt ei öelda, ei pea sa sõprust ja raha valima.'), { task: 'S14', level: 4 }),
      'Kui aega jääb (12 min). Sina oled tuttav. Proovi kolm korda ümber veenda (vt kaart). Õnnestunud, kui õpilane ütleb ei vähemalt kaks korda eri sõnadega, põhjendab ühe lausega (kuna …), pakub ühe muu abi ega hakka valetama.'), 12),
      tag(exitCheck(purpose(B.gaps('047_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta lünka sobiv sõna või vorm. Sulgudes on vihje.', [
        'Ma ootasin terve õhtu, aga ta ei [helistanudki]. (helistama + -ki)',
        'Ma otsisin võtmeid terve hommiku, aga neid ei olnud [kuskil|kusagil]. (kus + -gi)',
        'Ta ei maksnud raha õigel ajal tagasi, [mistõttu] pidin ise laenu võtma. (tagajärg, algab m-tähega)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas -ki/-gi ja tagajärje sõna on käes.')), {}),
      purpose(B.selfcheck('047_t_self', ['Ma räägin rahast ja sõprusest oma või väljamõeldud loo põhjal.', 'Ma saan sõnumitest ja häälsõnumist aru, mida kumbki pool tunneb ja miks.', 'Ma seon tunde põhjuse ja tagajärjega (kuna, seetõttu, mistõttu) ja rõhutan sõnu -ki või -gi abil.', 'Ma räägin sõbraga rahamurest nii, et kokkulepe sünnib ja sõprus jääb.'], 'Jutt räägitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('047_t_letter', 'Kodus: kiri sõbrale.', 'Kirjuta kodus Igorile (või oma loo inimesele) 140–160 sõna: mida sa tundsid ja miks, mis oli kõige raskem, mida sa tema häälsõnumist mõistsid ja millise kokkuleppe pakud (summa, kuupäevad). Kasuta sõnu kuna, seetõttu, mistõttu ja vähemalt kahte -ki/-gi vormi.', 'Tere, Igor!', 'Sinu sõber\n(sinu nimi)', [140, 160]), 'Igor saab kirjast aru, mida sa tunned, ja teab täpselt, mida kokku lepite.')), { task: 'W13', level: 3, harno: 'W1' }),
      tag(homeTask(purpose(B.speaking('047_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: sinu reegel raha laenamiseks sõpradele — kas, kui palju ja miks.', [
        'Mida sa teed, kui sõber palub raha?',
        'Mis aitab sõprust hoida, kui võlg jääb maksmata?',
      ], [60, 120]), 'Õpetaja kuulab sinu reeglit ja ütleb, kas põhjus ja tagajärg on selged.')), { task: 'S15' }),
      homework('047_t_homework', ['1. Kiri sõbrale, 140–160 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-048': {
    title: 'Muusika kell 23 ja majagrupp keeb — kuidas tüli vahendada?',
    phases: grammar('Keel: kaudne kõne — ütles, et …; küsis, kas …; palus, et … / palus mul …-da; väitis, et … (-vat)'),
    format: 'infogap',
    topic: 'neighbours',
    canDo: 'Ma saan aru naabri häälsõnumist, annan kahe naabri sõnad teineteisele täpselt ja erapooletult edasi (ütles, et …; küsis, kas …; palus …; väitis, et …), tean, mida seadus öörahu kohta ütleb, ja kirjutan korteriühistu juhatusele kokkuvõtte koos ettepanekuga.',
    teacherPage: {
      goal: 'Инфогэп: ученик — член правления дома между двумя соседями. Понимает голосовое соседки, передаёт слова обеих сторон косвенной речью, знает закон о тишине и пишет правлению.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 сообщения; станция 4 — без текста о законе, только передача слов соседке и обратно. Голосовое (станция 2) — дома.',
      hook: '«23:15, тебе вставать в шесть. Наверху музыка и громкий смех. Что ты делаешь: ждёшь, стучишь в дверь, пишешь в чат дома или звонишь в полицию? Выбери и одна причина.» Голосуйте оба. Не оценивайте.',
      plan: [
        '0–3: крючок — музыка в 23:15, ученик выбирает сразу',
        '3–10: станция 1 — разговор: какие звуки мешают, был ли я сам «шумным соседом»',
        '10–25: станция 2 — слова (2 мин), прогноз «Что попросит соседка?», голосовое Людмилы дважды, 7 пропусков в косвенной речи',
        '25–37: станция 3 — заметить в своих пропусках «ütles, et / palus, et» → правило → 7 сообщений из чата дома для правления',
        '37–52: станция 4 — что говорит закон (6 коротких ответов), инфогэп: передать слова Людмилы соседу сверху (вы) и принести ответ',
        '52–64: «Kui aega jääb» — спокойное сообщение в чат дома',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: письмо правлению, голосовое 1 минута, слова',
        '80–90: запас',
      ],
      sources: 'Текст станции 4: korrakaitseseadus § 56 lg 2 (Riigi Teataja): не в общественном месте с 22.00 до 6.00, в ночь перед выходным с 0.00 до 7.00 запрещено создавать длительный или повторяющийся шум, существенно мешающий другим; о дневном ремонте KorS часов не задаёт; общие правила дома принимает общее собрание собственников (korteriomandi- ja korteriühistuseadus). Людмила, соседи сверху и чат — учебные.',
      groups: 'Голосовое — каждый сам, сверка в паре. Инфогэп в группе: A — член правления, B — сосед сверху, C — Людмила; A ходит между B и C (они сидят в разных углах). В 1:1 вы играете обоих соседей по очереди.',
      errors: [
        '«Ta ütles, et ta töötas öösiti» → «… et ta töötab öösiti» (в эстонском время при пересказе не сдвигается, как и в русском).',
        '«Ta küsis, kas sa saaksid» → «Ta küsis, kas ma saaksin» (меняется лицо: sa → ma, ma → ta).',
        '«Ta palus mind rääkima» → «Ta palus mul rääkida» / «Ta palus, et ma räägiksin» (palus + kellel + da-инфинитив).',
        '«Ta küsis, et millal» → «Ta küsis, millal …» (вопросительное слово без «et»).',
      ],
      notes: [
        'Формат — инфогэп: у ученика только слова Людмилы; позицию соседей сверху знаете только вы. Он должен спросить, передать и вернуться — без этого задача не решается. Это и есть посредничество (CEFR B2 «mediating communication»).',
        'Ученику без своей квартиры: общежитие, частный дом и соседи через забор (собака, газонокосилка) — те же фразы. Пенсионеру — «я сам член правления дома»; маме — «наш ребёнок шумит». Ни одна сторона не «виновата»: не позволяйте ученику судить.',
        'Обратная связь, 2–3 цели: лицо и место при пересказе (ma → ta, siin → seal); kas / millal без et; нейтральные глаголы (ütles, palus, pakkus — не karjus, nõudis).',
      ],
    },
    discover: [
      station(B.text('048_d_hook', 'Mida sa teed?', 'Kell on 23.15, äratus helistab kell kuus. Ülemisel korrusel mängib muusika ja keegi naerab valjult. Mida sa teed: ootad, koputad uksele, kirjutad majagruppi või helistad politseisse? Vali kohe ja ütle üks põhjus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('048_d_talk', 'Helid minu kodus.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Millised helid sinu kodus või tänaval sind segavad ja millised mitte?',
        'Kas oled ise kunagi naabreid seganud — remont, laps, koer, pidu? Kuidas nad reageerisid?',
        'Kuidas lahendatakse naabritülisid mõnes teises riigis, mida tead: räägitakse otse, kirjutatakse või kutsutakse politsei?',
      ], [150, 210], ['Mind segab, kui …', 'Olin väga ärritunud, kui …', 'Meil oli kombeks …']), 'Sinu enda kodu annab naabritülile esimese võrdluse.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise üks lugu oma majast. Ära paranda. Kui õpilane elab eramajas: „Mis sind naabri juures segab — koer, muruniiduk, auto?”')),
      station(tag(B.vocab('048_d_vocab', 'Enne kuulamist: sõnad.', ['naaber — сосед', 'öörahu — ночная тишина', 'müra — шум', 'segama — мешать', 'kaebus — жалоба', 'korteriühistu — товарищество собственников', 'trepikoda — подъезд', 'vahendaja — посредник', 'erapooletu — беспристрастный', 'edasi andma — передавать']), { topic: ['öörahu', 'korteriühistu', 'vahendaja'] }), 2, 15),
      teach(tag(purpose(B.listening('048_d_voice', 'Naabri häälsõnum.', 'Sa oled korteriühistu juhatuse liige. Naaber teiselt korruselt saatis sulle häälsõnumi. Enne kuulamist arva: mida ta sinult palub? Siis kuula kaks korda ja kirjuta lünka 1–2 sõna.', [
        'Tere, siin Ljudmila. Ma elan teisel korrusel, korteris neli. Vabandust, et nii hilja sõnumi saadan.',
        'Ma töötan haiglas öövahetustes ja magan päeval, tavaliselt kella kaheksast kolmeni.',
        'Ma saan aru, et remonti on vaja teha ja et noored tahavad vahel pidu pidada. Ma ei ole ise ka kunagi vaikne naaber olnud.',
        'Viimased kaks nädalat on ülemisest korterist kostnud päeval puurimist ja õhtul valju muusikat, eriti reedeti. Ma ei saa magada ja mu enesetunne on väga halb.',
        'Ma käisin eile nende uksel, aga keegi ei tulnudki uksele. Siis kirjutasin majagruppi ja nüüd on seal juba nelikümmend sõnumit ja kõik on vihased.',
        'Üks naaber kirjutas, et ma olen lihtsalt tülinorija. See tegi väga haiget.',
        'Ma ei taha politseid kutsuda. Ma palun ainult, et remont oleks tööpäeviti kella kaheteistkümnest kuueni ja et reede õhtul pandaks muusika kella kümneks vaiksemaks.',
        'Kas sa saaksid nendega rääkida? Sind nad usaldavad. Aitäh!',
      ], [
        'Ljudmila ütles, et ta töötab haiglas [öövahetustes|öösiti|öövahetuses].',
        'Ta ütles, et magab päeval kella kaheksast kuni [kolmeni|kella kolmeni].',
        'Ta kurtis, et ülemisest korterist kostab päeval [puurimist|puurimine].',
        'Ta rääkis, et käis naabrite uksel, aga keegi ei tulnud [uksele|avama].',
        'Üks naaber olevat teda majagrupis nimetanud [tülinorijaks].',
        'Ljudmila palus, et remont oleks tööpäeviti kella kaheteistkümnest [kuueni|kella kuueni].',
        'Ta palus ka, et reede õhtul pandaks muusika [kella kümneks|kümneks] vaiksemaks.',
      ], 'g_read'), 'Su märkmed on Ljudmila sõnad kaudses kõnes — just neid viid ülemistele naabritele.'), { task: 'L04' }),
      'Kuulamise tsükkel: 1) prognoos: „Mida ta palub?”; 2) esimene kuulamine — „Mis on tema suurim mure?”; 3) teine — lüngad; 4) detail: „Mis kell ta magab?”; 5) üks lause: „Kumba poolt sa praegu rohkem mõistad ja miks?” Ära lase õpilasel kohe kohut mõista.'),
    ],
    practice: [
      station(B.notice('048_p_notice', 'Märka: Ljudmila ütles, et …', [
        'Häälsõnumist: „**Ma** töötan haiglas.” → Ljudmila ütles, et **ta** töötab haiglas. · „Kas **sa** saaksid nendega rääkida?” → Ta küsis, kas **ma** saaksin nendega rääkida.',
        '**Väide**: ütles / rääkis / kirjutas, **et** … · **Küsimus**: küsis, **kas** … (jah-ei-küsimus) või küsis, **millal / miks / kes** … (ilma sõnata et) · **Palve**: palus, **et** ma räägiksin … või palus **mul** rääkida (da-tegevusnimi).',
        '**Aeg ei muutu**: „Ma magan päeval.” → Ta ütles, et ta **magab** päeval. Muutuvad **isik** (ma → ta, sa → ma, me → nad) ning **koht ja aeg** (siin → seal, täna → sel päeval, homme → järgmisel päeval).',
        'Kui sa väite eest ei vastuta või see võib olla vale, kasuta **-vat** (moodul 7): Naaber **väitis**, et uus elanik **olevat** hoolimatu.',
        '**Erapooletu vahendaja** kasutab neutraalseid tegusõnu: ütles, rääkis, palus, pakkus, küsis — mitte karjus, nõudis, ähvardas.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('048_p_report', 'Majagrupist juhatusele.', 'Juhatus palub sul majagrupi tüli kokku võtta. Anna iga sõnum kaudses kõnes edasi, alusta antud sõnadega.', [
        ['Ülemine naaber: „Me teeme remonti ainult kaks nädalat.”', 'Ülemine naaber kirjutas, et', 'Ülemine naaber kirjutas, et nad teevad remonti ainult kaks nädalat.'],
        ['Ljudmila: „Kas te saaksite reede õhtul muusika vaiksemaks panna?”', 'Ljudmila küsis, kas', 'Ljudmila küsis, kas nad saaksid reede õhtul muusika vaiksemaks panna.'],
        ['Esimese korruse naaber: „Ärge kirjutage siia keset ööd!”', 'Esimese korruse naaber palus, et', 'Esimese korruse naaber palus, et keegi ei kirjutaks sinna keset ööd.|Esimese korruse naaber palus, et nad ei kirjutaks sinna keset ööd.'],
        ['Kolmanda korruse naaber: „Ljudmila on lihtsalt tülinorija.” (Sina seda ei usu.)', 'Kolmanda korruse naaber väitis, et', 'Kolmanda korruse naaber väitis, et Ljudmila olevat lihtsalt tülinorija.'],
        ['Ljudmila: „Millal teie remont lõpeb?”', 'Ljudmila küsis, millal', 'Ljudmila küsis, millal nende remont lõpeb.'],
        ['Juhatuse esimees: „Ma tulen homme kell kuus teie juurde.”', 'Esimees kirjutas, et', 'Esimees kirjutas, et ta tuleb järgmisel päeval kell kuus nende juurde.|Esimees kirjutas, et ta tuleb järgmisel päeval kell kuus meie juurde.'],
        ['Ülemine naaber: „Helistage mulle otse, ärge kirjutage gruppi!”', 'Ülemine naaber palus', 'Ülemine naaber palus talle otse helistada ja mitte gruppi kirjutada.|Ülemine naaber palus, et talle helistataks otse ja gruppi ei kirjutataks.'],
      ], 'full', 'g_notice'), 'Juhatus näeb tüli rahulikult ja täpselt, ilma vihaste sõnadeta.'), { task: 'G14' }),
      'Pärast iga rida küsi: „Kes räägib ja kellele? Mis muutub: isik, koht, aeg?” Rida 4: õpilane ise ei usu väidet, seepärast -vat (olevat). Rida 6: homme → järgmisel päeval. Rida 7: palus + da-tegevusnimi või palus, et + tingiv.'),
    ],
    transfer: [
      station(B.text('048_t_rules', 'Mida ütleb seadus öörahu kohta?', 'Korrakaitseseaduse järgi on mujal kui avalikus kohas, näiteks korterites, kella 22.00-st kuni 6.00-ni keelatud tekitada kestvat või korduvat müra, mis teisi oluliselt häirib. Puhkepäevale eelneval ööl, näiteks reedest laupäeva vastu, kehtib see keeld kella 0.00-st kuni 7.00-ni. Päevase remondi kellaaegu see seadus ei määra, seepärast lepivad paljud majad need kokku oma kodukorras. Kui mure jääb, soovitatakse kõigepealt rääkida naabriga otse ja seejärel pöörduda korteriühistu juhatuse poole. Maja ühised reeglid võtab vastu korteriomanike üldkoosolek.\n\n*Allikas: korrakaitseseadus § 56 (Riigi Teataja); korteriomandi- ja korteriühistuseadus.*'), 4, 15, { final: 'advise' }),
      teach(tag(purpose(B.table('048_t_ask', 'Naabrid küsivad sinult.', 'Vasta teksti järgi 1–3 sõnaga.', 'Küsimus, Vastus', [
        'Ülemine naaber: „Kas kolmapäeval kell 23 võib korteris veel valjult muusikat kuulata?” | [ei/ei või/ei tohi]',
        'Ljudmila: „Mis kell algab öörahu reedest laupäeva vastu?” | [kell 0.00/südaööl/keskööl/kell 0/kell kaksteist öösel]',
        'Teise korruse noormees: „Mis kell lõpeb öörahu pühapäeva hommikul?” | [kell 7.00/kell 7/kell seitse/seitsmel]',
        'Esimese korruse proua: „Kas korrakaitseseadus ütleb, mis kell päeval remonti teha võib?” | [ei/ei ütle/ei määra]',
        'Vanem härra: „Kelle poole pöörduda, kui otse rääkimine ei aidanud?” | [korteriühistu juhatuse poole/juhatuse poole/korteriühistu juhatus/juhatus]',
        'Uus elanik: „Kes võtab vastu maja ühised reeglid?” | [korteriomanike üldkoosolek/üldkoosolek]',
      ], 'g_read'), 'Kui tead reegleid, saad vahendada faktidega, mitte tunnetega.'), { task: 'R15', harno: 'R2b' }),
      'Eksaminurk (R2b): eksamil on 200–300-sõnaline teabetekst ja lühivastused 1–3 sõnaga. Siin on tekst lühem, sest põhitöö on vahendamine. Rõhuta: seadus ei aita, kui inimesed ei räägi.'),
      teach(tag(purpose(B.rolecards('048_t_relay', 'Vahenda naabrite vahel.', 'Mine ülemise korruse naabri juurde (õpetaja), anna Ljudmila sõnad edasi, küsi tema seisukohta ja vii vastus Ljudmilale tagasi.',
        'Kaart A (sina, juhatuse liige): Ljudmila häälsõnum on sinu märkmetes. Sa ei tea, mida ülemised naabrid arvavad.\nSinu eesmärk: anna Ljudmila sõnad erapooletult edasi (ütles, et …; palus, et …), saa teada nende seisukoht ja paku üks lahendus, mida mõlemad võiksid vastu võtta.\nPiirang: sa ei ole kohtunik — ära ütle, kellel on õigus.',
        'Kaart B (ülemine naaber) on õpetajal: tema põhjused ja üks asi, mida Ljudmila ei tea.',
        ['Ljudmila palus mul teile edasi öelda, et …', 'Ütlen otsekoheselt, aga rahulikult: …', 'Ta küsis, kas …', 'Kuidas teie seda näete?', 'Kas ma võin Ljudmilale öelda, et …?', 'Mis oleks, kui …?'], ['Ta ütles, et …, aga …', 'Me ei teadnudki, et …', 'Öelge talle, et …']), 'Tulemus: mõlemad naabrid teavad, mida teine tegelikult ütles, ja neil on üks ühine ettepanek.'), { task: 'S05', level: 4 }),
      'Õpetaja kaart B (ülemine naaber; seejärel mängi Ljudmilat). Varjatud info: peres on kuuekuune laps; vannitoas purunes toru ja kindlustus nõuab remondi lõpetamist kuu lõpuks; reede muusika oli isa neljakümnes sünnipäev, see oli ühekordne; te ei teadnud, et Ljudmila töötab öösiti; teid solvasid nelikümmend vihast sõnumit. Pakkumine, kui küsitakse: järgmisel nädalal puurite ainult 15–18. Takistused: 1) „Miks ta meile ise ei helistanud?” 2) „Me ei saa remonti peatada, kindlustus!” 3) Ljudmila rollis: „Kas nad ütlesid, et nad vabandavad?” Õnnestunud, kui õpilane annab edasi vähemalt neli lauset kaudses kõnes (sh üks küsimus ja üks palve), kasutab neutraalseid tegusõnu, ei mõista kohut ja viib tagasi ühe ühise ettepaneku.'),
      extension(teach(tag(purpose(B.speaking('048_t_more', 'Sõnavõtt majakoosolekul', 'Maja vestluses on nelikümmend vihast sõnumit ja juhatus kutsus kokku majakoosoleku. Räägi juhatuse liikmena koosolekul rahulikult 2–3 minutit. Ära süüdista kedagi ega kasuta silte.', [
        'Mida ütles ja palus Ljudmila ja mida ütlesid ülemised naabrid (kaudses kõnes)?',
        'Mida seadus öörahu kohta ütleb?',
        'Mis on järgmine samm: millal ja kus on koosolek?',
      ], [120, 180], ['Ljudmila palus mul edasi öelda, et …', 'Ülemised naabrid ütlesid, et …', 'Juhatus teeb ettepaneku, et …', 'Palun lõpetame vihaste sõnumite kirjutamise.']), 'Üks rahulik sõnavõtt võib peatada tüli, mis vestluses kasvab.'), { task: 'S16', level: 4 }),
      'Kui aega jääb (12 min). Kuula sõnavõttu nagu ülemine naaber ja nagu Ljudmila: kas kumbki tunneb end rünnatuna? Kontrolli: kaudne kõne, neutraalsed tegusõnad, konkreetne aeg ja koht, mitte ühtegi silti (tülinorija, hoolimatu).'), 12),
      tag(exitCheck(purpose(B.gaps('048_t_exit', 'Kontrolli end: kolm lauset kaudses kõnes.', 'Kirjuta lünka üks sõna.', [
        'Naaber küsis, [kas] me saaksime muusika vaiksemaks panna.',
        'Naaber ütles: „Mul on väike laps.” Naaber ütles, et [tal|temal] on väike laps.',
        'Ülemine naaber palus meil gruppi mitte [kirjutada]. (kirjutama)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas küsimus, isik ja palve kaudses kõnes on käes.')), {}),
      purpose(B.selfcheck('048_t_self', ['Ma räägin, millised helid mind kodus segavad ja kuidas naabritülisid lahendatakse.', 'Ma saan naabri häälsõnumist aru ja tean, mida seadus öörahu kohta ütleb.', 'Ma annan teise sõnad kaudses kõnes edasi: ütles, et …; küsis, kas …; palus …; väitis, et …', 'Ma vahendan kahe naabri vahel erapooletult ja kirjutan juhatusele kokkuvõtte.'], 'Tüli vahendatud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('048_t_letter', 'Kodus: kokkuvõte juhatusele.', 'Kirjuta kodus korteriühistu juhatusele 140–160 sõna: mis juhtus, mida ütles ja palus Ljudmila, mida ütlesid ülemised naabrid (kaudses kõnes, erapooletult), mida ütleb seadus ja sinu ettepanek kokkuleppeks. Ära kirjuta, kellel on õigus.', 'Lugupeetud juhatus!', 'Lugupidamisega\n(sinu nimi), korter …', [140, 160]), 'Juhatus saab sinu kirjast kahe poole täpse pildi ja otsustab, kuidas edasi.')), { task: 'W12', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('048_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mida sa Ljudmilale trepikojas kohtudes räägiksid — mida ülemised naabrid ütlesid ja palusid ja mis on järgmine samm.', [
        'Mida nad ütlesid ja miks?',
        'Mida nad palusid ja mida pakkusid?',
      ], [60, 120]), 'Õpetaja kuulab, kas kaudne kõne on täpne ja toon erapooletu.')), { task: 'S15' }),
      homework('048_t_homework', ['1. Kokkuvõte juhatusele, 140–160 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-049': {
    title: 'Kaks õde ja üks apelsin: kuidas pere ühise plaani leiab?',
    phases: grammar('Keel: pehme ettepanek ja tingimus — ma saan aru, et …; mis oleks, kui …?; kas saaksime …?; olen nõus tingimusel, et …'),
    format: 'game',
    topic: 'family',
    canDo: 'Ma räägin pere või sõpradega läbi ja jõuan konkreetse kokkuleppeni, sest tean, mille poolest erineb seisukoht huvist: näitan, et mõistan teist (ma saan aru, et …), pakun pehmelt (mis oleks, kui …; kas saaksime …) ja seon järeleandmise tingimusega (olen nõus tingimusel, et …).',
    teacherPage: {
      goal: 'Игра-переговоры: семья трёх поколений планирует одно лето. Ученик отличает позицию от интереса (радио), предлагает мягко условным наклонением и с условием и составляет свою «карточку договорённости».',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 пропуска; станция 4 — один раунд игры без карточки условий, карточка договорённости — дома. Радио (станция 2) — дома.',
      hook: '«Две сестры спорят из-за последнего апельсина. Мама режет его пополам. Справедливо? Угадай: чего сёстры хотели на самом деле?» Ответьте оба. Не раскрывайте ответ — его даст радио (одной нужен сок, другой — корка для пирога).',
      plan: [
        '0–3: крючок — апельсин, ученик отвечает сразу',
        '3–10: станция 1 — разговор: из-за чего спорят в семье, кто уступает',
        '10–25: станция 2 — слова (2 мин), радио с семейным медиатором дважды, 6 вопросов; проверка догадки об апельсине',
        '25–37: станция 3 — заметить в радио «ma saan aru, et», «kui oleks küsinud» → правило → семейный спор о Рождестве: 7 пропусков',
        '37–52: станция 4 — три карточки интересов, игра в два раунда с карточкой нового условия, очки; начало «Minu kokkuleppe kaart»',
        '52–64: «Kui aega jääb» — ролевая игра: извиниться так, чтобы сработало',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: письмо-договорённость, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Радио: история об апельсине — классический пример различия позиции и интереса из R. Fisher, W. Ury «Getting to Yes» (1981; приписывается Mary Parker Follett); Sotsiaalkindlustusamet «Perelepitus»: государственная семейная медиация бесплатна для расходящихся родителей, обе стороны подают заявление; perelepitaja прошёл не менее 160 часов базового обучения. Медиатор Тийна Каск, семья и карточки — учебные.',
      groups: 'Радио — каждый сам, сверка в паре. Игра в группе из трёх: каждый берёт одну карточку (бабушка, родитель, подросток); вы ведёте время, тянете карточку условия и считаете очки. В 1:1 ученик выбирает роль, вы играете остальные две.',
      errors: [
        '«Mis oleks, kui me läheme» → «Mis oleks, kui me läheksime» (в предложении-гипотезе — условное наклонение).',
        '«Olen nõus, tingimusel et» → «Olen nõus tingimusel, et …» (запятая перед et, как в juhul, kui); после tingimusel, et обычно изъявительное (sa teed), условное тоже встречается.',
        '«Ma saan aru, et sa oleksid väsinud» → «… et sa oled väsinud» (понимаю факт — изъявительное).',
        '«Kas me saame …» звучит как требование; «Kas me saaksime …?» — мягче.',
      ],
      notes: [
        'Формат — игра с очками: конкретная договорённость (кто, что, когда) — 3 очка, каждое «Ma saan aru, et …» — 1, каждая уступка с условием — 1. Карточка нового условия во втором раунде (машина в ремонте, бюджет меньше, бабушка заболела, фестиваль перенесли) заставляет договариваться заново.',
        'Ученику без семьи рядом: друзья планируют поездку или соседи — общий двор; пенсионер может играть бабушку — это его голос. Тема развода (perelepitus) — только факт из радио; не расспрашивайте о семье ученика.',
        'Обратная связь, 2–3 цели: условное наклонение в предложении; изъявительное после tingimusel, et и ma saan aru, et; конкретность («küll kuidagi» — не договорённость).',
      ],
    },
    discover: [
      station(B.text('049_d_hook', 'Üks apelsin, kaks õde', 'Kaks õde vaidlevad viimase apelsini pärast. Ema lõikab apelsini pooleks ja annab kummalegi poole. Kas see on õiglane lahendus? Arva: mida õed võisid tegelikult tahta? Ütle kohe oma arvamus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('049_d_talk', 'Mille üle peres vaieldakse?', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Mille üle teie peres (või sõbra peres) kõige sagedamini vaieldakse: pühad, puhkus, raha, kodutööd, vanavanemad?',
        'Kes teie peres tavaliselt järele annab ja kes otsustab? Kas see on õiglane?',
        'Kas sinu kodumaal on vanema põlvkonna sõnal peres suurem kaal kui Eestis?',
      ], [150, 210], ['Meil vaieldakse kõige rohkem …', 'Tavaliselt annab järele …, sest …', 'Minu arvates …']), 'Sinu pere või sõprade näide annab mängule päris tausta.'), { task: 'S09', fluency: true }),
      'Üks-ühele: räägi ka ise lühidalt (võib olla väljamõeldud pere). Ära küsi lahutuse ega päris tülide kohta. Lõpus ütle: „Pea meeles oma näidet — mängus kasutame seda.”')),
      station(tag(B.vocab('049_d_vocab', 'Enne kuulamist: sõnad.', ['kompromiss — компромисс', 'kokkulepe — договорённость', 'seisukoht — позиция', 'huvi — интерес (что на самом деле важно)', 'arvestama — считаться (с кем-то)', 'tingimus — условие', 'vastu tulema — идти навстречу', 'lahendus — решение', 'põlvkond — поколение', 'leppima — мириться (договариваться)']), { topic: ['huvi', 'põlvkond'] }), 2, 15),
      teach(tag(purpose(B.examListen('049_d_radio', 'Raadio: kuidas pere kokkuleppele jõuab?', 'Kuula raadiosaadet kaks korda ja vali õige vastus. Kas sinu arvamus apelsini kohta oli õige?', 'choice', [
        'Saatejuht: Tere! Pühad on lähedal ja paljudes peredes algab vaidlus: kus, kellega ja kui kaua. Stuudios on perelepitaja Tiina Kask. Tiina, kust alustada?',
        'Tiina: Ma alustan sageli ühe vana looga. Kaks õde vaidlevad apelsini pärast ja ema lõikab selle pooleks. Üks õde pressib oma poolest mahla ja viskab koore ära. Teine riivib koore kooki ja viskab sisu ära. Kui ema oleks küsinud, milleks neil apelsini vaja on, oleks kumbki saanud kõik, mida ta tegelikult tahtis.',
        'Saatejuht: Mida see lugu meile õpetab?',
        'Tiina: Et seisukoht ja huvi ei ole sama asi. Seisukoht on see, mida inimene nõuab: jõulud on meil! Huvi on see, miks ta seda nõuab: vanaema kardab üksi jääda, noor ema tahab, et laps saaks rahulikult magada. Kui me räägime huvidest, leiame tavaliselt rohkem lahendusi.',
        'Saatejuht: Kuidas seda praktikas teha?',
        'Tiina: Kõigepealt kuula ja ütle oma sõnadega, mida teine tahab: ma saan aru, et sulle on tähtis … Siis otsige koos vähemalt kolm varianti, enne kui midagi otsustate. Ja lõpuks leppige kokku täpselt: kes, mida ja millal. Lause „küll me kuidagi saame” ei ole kokkulepe.',
        'Saatejuht: Ja kui pere ise hakkama ei saa?',
        'Tiina: Siis võib appi kutsuda lepitaja. Eestis pakub Sotsiaalkindlustusamet lahku minevatele vanematele tasuta perelepitust, et nad saaksid lapse huvides kokku leppida. Perelepitaja on läbinud vähemalt sada kuuskümmend tundi koolitust. Lepitaja ei otsusta kellegi eest, ta aitab rääkida.',
        'Saatejuht: Üks nõuanne kuulajatele?',
        'Tiina: Küsi enne vaidlust: miks see sulle tähtis on? Ja vasta ise samale küsimusele.',
      ], [
        ['Miks oleks emal olnud perelepitaja arvates parem õdedelt kõigepealt küsida?', 'kumbki õde oleks saanud kõik, mida ta tegelikult vajas', 'ema oleks saanud apelsini endale', 'apelsin oleks jäänud tervikuks'],
        ['Mis on perelepitaja sõnul huvi ja mille poolest erineb see seisukohast?', 'põhjus, miks inimene midagi nõuab', 'see, mida inimene valjult nõuab', 'kompromiss, mille pere lõpuks leiab'],
        ['Mida tuleks perelepitaja järgi vaidluses teha kõige esimesena?', 'kuulata ja öelda oma sõnadega, mida teine tahab', 'otsustada kiiresti, kes on õiges', 'paluda vanaemal otsustada'],
        ['Mitu varianti soovitab perelepitaja koos leida, enne kui pere midagi otsustab?', 'vähemalt kolm', 'ainult ühe hea', 'nii palju, kui aega on'],
        ['Miks ei ole perelepitaja arvates lause „küll me kuidagi saame” veel kokkulepe?', 'selles pole öeldud, kes mida ja millal teeb', 'see on liiga ebaviisakas', 'see kõlab nagu käsk'],
        ['Kellele pakub Sotsiaalkindlustusamet Eestis raadiosaate järgi tasuta perelepitust?', 'lahku minevatele vanematele', 'kõigile tülis naabritele', 'ainult vanavanematele'],
      ], 'g_read'), 'Saade annab sulle mängu reegli: räägi huvidest, mitte seisukohtadest.'), { voice: 'interview', task: 'L02' }),
      'Kuulamise tsükkel: 1) prognoos (apelsin) on juba tehtud; 2) esimene kuulamine — „Mida õed tahtsid?”; 3) teine — valikvastused; 4) detail: „Mitu varianti?”; 5) üks lause: „Mis on sinu peres tavaline seisukoht ja mis on selle taga olev huvi?”'),
      B.know('049_d_know', ['Kui lahku minevad vanemad ei suuda lapse elu üle ise kokku leppida, pakub Sotsiaalkindlustusamet neile tasuta riiklikku perelepitust. Teenust saab taotleda siis, kui mõlemad vanemad on nõus ja esitavad taotluse. Perelepitaja on läbinud vähemalt 160 tundi baaskoolitust ja tal on kõrgharidus näiteks psühholoogias, õigusteaduses või sotsiaaltöös. Lepitaja ei otsusta pere eest: ta aitab vanematel kuulata ja leida lahenduse, mis arvestab lapse huvidega.'], 'Sotsiaalkindlustusamet, „Perelepitus” (sotsiaalkindlustusamet.ee)', 'Kas teadsid? Perelepitus Eestis'),
    ],
    practice: [
      station(B.notice('049_p_notice', 'Märka: kuidas pakkuda nii, et teine kuulab', [
        'Raadiost: „**Ma saan aru, et** sulle on tähtis …” · „Kui ema **oleks küsinud**, **oleks** kumbki **saanud** kõik.”',
        '**Näita, et mõistad** (kindel kõneviis, sest see on fakt): Ma saan aru, et sul **on** raske. · Mulle tundub, et sulle **on** tähtis …',
        '**Paku tingiva kõneviisiga** (pehmem kui käsk): **Mis oleks, kui** me **läheksime** …? · **Kas** me **saaksime** …? · Me **võiksime** proovida …',
        '**Järeleandmine tingimusega**: Olen nõus **tingimusel, et** sina **teed** … (tingimusel, et + tavaliselt kindel kõneviis) · **Juhul, kui** …, siis … · **Vastutasuks** ma …',
        '**Ära ütle**: Sa alati … · Ei, see ei sobi. → **Ütle**: See on minu jaoks keeruline, sest … Mis oleks, kui …?',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('049_p_mood', 'Jõulud: kus ja kellega?', 'Pere vaidleb, kus jõule veeta. Otsusta, kas lause vajab tingivat või kindlat kõneviisi, ja kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Mis oleks, kui me [veedaksime] jõululaupäeva meil ja esimese püha vanaema juures? (veetma)',
        'Kas me [saaksime] sõita juba reedel, et laps ei peaks õhtul autos magama? (saama)',
        'Ma saan aru, et sa [kardad] pühade ajal üksi jääda. (kartma)',
        'Olen nõus maale sõitma tingimusel, et sina [juhid|juhiksid] tagasiteel autot. (juhtima)',
        'Kui vanaema [tuleks] hoopis meile, ei peaks keegi kaheksa tundi sõitma. (tulema)',
        'Vastutasuks [võiksin] ma vanaemale enne pühi aias appi minna. (võima)',
        'Kui me oleksime varem rääkinud, [poleks|ei oleks] see tüli nii suureks läinud. (olema, eitus)',
      ], '', 'full', 'g_notice'), 'Õige vorm teeb ettepaneku pehmeks ja tingimuse selgeks; see on mängu põhivõte.'), { task: 'G02' }),
      'Pärast iga lauset küsi: „Kas see on fakt või ettepanek?” Fakt → kindel kõneviis (kardad, juhid), ettepanek või mõeldud olukord → tingiv (veedaksime, tuleks). Rida 7 on minevikus: oleks + -nud.'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('049_t_cards', 'Kolm huvi, üks suvi.', 'Loe kaarte ja vali endale üks roll. Tõmba joon alla sellele, mis on sinu rolli tegelik huvi.', [
        ['Vanaema (68)', ['soov: kogu pere tuleb juulis kaheks nädalaks tema maakoju Võrumaale', 'põhjus: vanaisa suri talvel ja tal on raske üksi toime tulla', 'maja katus vajab parandamist ja aed on suur', 'tal ei ole autot, pood on viie kilomeetri kaugusel'], []],
        ['Lapsevanem (38)', ['soov: üks nädal mere ääres Pärnus', 'põhjus: raske tööaasta, ta tahab lihtsalt puhata, magada ja leida tasakaalu töö ja pere vahel', 'puhkust on juulis ainult kaks nädalat', 'pere suvine eelarve on 600 eurot'], []],
        ['Teismeline (15)', ['soov: jääda juulis linna', 'põhjus: 12. juulil on Tallinnas muusikafestival, kuhu lähevad kõik sõbrad', 'tal on suvetöö kohvikus kolmel päeval nädalas', 'maal on internet väga nõrk'], []],
      ], '3', 'g_read'), 'Kaardid näitavad seisukohtade taga olevaid huvisid; neid läheb mängus vaja.'), { task: 'R11', level: 3 }), 4, 15, { final: 'negotiate' }),
      teach(tag(purpose(B.rolecards('049_t_game', 'Läbirääkimismäng: üks suvi, kolm soovi.', 'Mängu lõpuks on teil kompromiss, mis arvestab iga põlvkonnaga. Punktid: konkreetne kokkulepe (kes, mida, millal) 3, iga „Ma saan aru, et …” 1, iga tingimusega järeleandmine 1.',
        'Sinu roll: vali üks kaart (vanaema, lapsevanem või teismeline).\nSinu eesmärk: saada see, mis sulle tegelikult tähtis on — mitte tingimata see, mida alguses nõudsid.\nTingimus: enne igat oma ettepanekut ütle, mida teine tahab (Ma saan aru, et …). Teises voorus muutub üks asi ja kokkulepet tuleb muuta.',
        'Teised rollid ja tingimuste kaardid on õpetajal.',
        ['Ma saan aru, et sulle on tähtis …', 'Mis oleks, kui …?', 'Kas me saaksime …?', 'Olen nõus tingimusel, et …', 'Vastutasuks ma …'], ['See on minu jaoks keeruline, sest …', 'Aga mis siis, kui …?', 'Hea, lepime kokku: …']), 'Tulemus: teie pere suveplaan, kus iga põlvkonna tegelik huvi on arvesse võetud.'), { task: 'S17', main: true, harno: 'S2' }),
      'Õpetaja kaart. Mängi rolle, mida õpilane ei valinud; ütle kõigepealt oma seisukoht, huvi ainult siis, kui küsitakse („Miks see sulle tähtis on?”). 2. voor — tõmba üks tingimus: 1) auto läheb remonti, ainult buss ja rong; 2) eelarve on 400, mitte 600 eurot; 3) vanaema kukkus ja ei saa kaks nädalat aias töötada; 4) festival lükati augustisse. Loe punktid kokku ja hääleta lõpus ka ise. Õnnestunud, kui kokkuleppes on kes, mida ja millal, iga roll saab oma huvi ja õpilane kasutab vähemalt kaks tingivat ettepanekut ja ühe „tingimusel, et”.'),
      tag(purpose(B.planning('049_t_plan', 'Minu kokkuleppe kaart.', 'Täida kaart ühe päris või väljamõeldud tüli kohta (sõber, naaber või pere).', [
        'Kes ja mille üle vaidlesid? Mis oli kummagi seisukoht? Kas oleks vaja vahendajat või lepitajat?',
        'Mis oli kummagi tegelik huvi (miks see talle tähtis oli)?',
        'Kolm varianti, mida võiks proovida.',
        'Meie kokkulepe: kes, mida ja millal? Mis saab, kui see ei toimi?',
      ], 3), 'Kaart jääb sulle: sellest räägid mooduli kontrollis ja selle järgi kirjutad kodus kirja.'), { task: 'W11', level: 3 }),
      extension(teach(tag(purpose(B.speaking('049_t_more', 'Rollimäng: vabanda nii, et see mõjub', 'Sa unustasid oma ema seitsmekümnenda sünnipäeva (või kirjutasid naabrile majagrupis teravalt). Õpetaja on solvunud pereliige või naaber. Vabanda ja paku, kuidas asja heastada; ära vabanda end välja („aga mul oli nii palju tööd”).', [
        'Mis täpselt oli valesti ja kuidas sa seda ütled ilma „aga”-ta?',
        'Kuidas näitad, et mõistad teise tunnet?',
        'Mis on sinu konkreetne samm ja mida teed edaspidi teisiti?',
      ], [120, 180], ['Mul on väga kahju, et …', 'See oli minu viga, ma ei olnud tähelepanelik.', 'Mul on süütunne, sest …', 'Ma saan aru, et sulle tegi haiget see, et …', 'Kas ma saaksin seda heastada nii, et …?']), 'Hea vabandus avab ukse kokkuleppele; halb vabandus teeb tüli suuremaks.'), { task: 'S19', level: 4 }),
      'Kui aega jääb (12 min). Ole solvunud, aga mitte vaenulik; sinu tingimus: „Olgu, aga tingimusel, et …”. Kui õpilane ütleb „aga” või süüdistab olukorda, ütle: „Kuulen õigustust, mitte vabandust.” Õnnestunud, kui vabandus nimetab teo, tunnistab teise tunnet (Ma saan aru, et …), on ilma „aga”-ta ja lõpeb konkreetse sammuga.'), 12),
      tag(exitCheck(purpose(B.gaps('049_t_exit', 'Kontrolli end: kolm ettepanekut.', 'Kirjuta sulgudes olev tegusõna õiges vormis: tingiv või kindel kõneviis.', [
        'Mis oleks, kui me [sõidaksime] seekord rongiga? (sõitma)',
        'Olen nõus tingimusel, et sina [pesed|peseksid] täna nõud. (pesema)',
        'Ma saan aru, et sa [oled] väsinud, aga see on mulle tähtis. (olema)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas tingiv ja kindel kõneviis ettepanekus on käes.')), {}),
      purpose(B.selfcheck('049_t_self', ['Ma räägin, mille üle peres või sõpradega vaieldakse.', 'Ma saan raadiost aru, mille poolest erineb seisukoht huvist.', 'Ma pakun pehmelt (mis oleks, kui …; kas saaksime …) ja seon järeleandmise tingimusega.', 'Ma jõuan läbirääkimisel konkreetse kokkuleppeni: kes, mida ja millal.'], 'Kokkulepe sõlmitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('049_t_letter', 'Kodus: kokkuleppe kiri.', 'Kirjuta kodus oma kokkuleppe kaardi inimesele (sõber, naaber või pereliige) 150–180 sõna: vabandus või tänu, kuidas sina tema huvi mõistad, mida pakud ja mis tingimusel ning konkreetne kokkulepe (kes, mida, millal). Kui lugu on välja mõeldud, kirjuta mõeldud inimesele.', 'Hea …!', 'Parimate soovidega\n(sinu nimi)', [150, 180]), 'Inimene saab kirjast aru, et sa mõistad teda, ja teab täpselt, milles te kokku leppisite.')), { task: 'W04', level: 3 }),
      tag(homeTask(purpose(B.speaking('049_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut oma kokkuleppe kaardi järgi: kes, mille üle, mis oli kummagi huvi ja milles kokku leppisite.', [
        'Mis oli seisukoht ja mis oli huvi?',
        'Milles te kokku leppisite ja mis tingimusel?',
      ], [60, 120]), 'See on mooduli kontrolli sõnavõtu harjutus; õpetaja annab ühe nõu.')), { task: 'S15' }),
      homework('049_t_homework', ['1. Kokkuleppe kiri, 150–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-050': {
    title: 'Kontroll 10 — suhted ja konfliktid',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Kontroll 10, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Kontroll 10, 1. tund: keeleosa ja kuulamine (50 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Kontroll 10, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid suhete ja konfliktide teemal, kirjutan naabrile umbes 140-sõnalise vabandus- ja ettepanekukirja ja 180-sõnalise arutluse ning räägin 1 minuti oma kokkuleppest; iseloomu sõnad, -ki/-gi, kaudne kõne ja pehme ettepanek on õiged.',
    // Kontroll 10 in Harno B2 form (v4 module exam): two 90-minute lessons — reading (Avasta, 45 min) and the module's
    // language part + listening (Harjuta, 15 + 35 min); writing (60 min) and speaking with the module product (Kasuta,
    // 15 + 5 min). Harno B2 gives R 70, L 40, W 80, S 20 min: every part here is a shorter version with the same task types
    // (R1, R2a, R3, R4; L notices, L3, L4; W1, W2b; S1, S2). Own texts on the module's content: friends and character
    // (046), money and feelings (047), neighbours and reported speech (048), family and proposals (049); timed by the Harno
    // part headers (timeEstimate.js harnoTimedMinutes, docs/COURSE_DESIGN_STATIONS.md §7.3).
    discover: [
      B.tip('050_d_how', 'Kontroll: lugemine (eksami vormis, 45 minutit)', 'Kontroll kestab kaks tundi. Esimeses tunnis on lugemine ning kuulamine koos keeleosaga, teises kirjutamine ja rääkimine. Lugemises on neli osa nagu Harno B2 eksamil, ainult lühemad. Tee kõik ilma sõnaraamatuta.', 'full'),
      tag(B.vocab('050_d_vocab', 'Tunnid 46–49: sõnad, mis aitavad', ['usaldusväärne — надёжный', 'üksildus — одиночество', 'võlg — долг', 'süütunne — чувство вины', 'öörahu — ночная тишина', 'neutraalne — нейтральный', 'erapooletu — беспристрастный', 'huvi — интерес', 'tingimus — условие', 'kokkulepe — договорённость'], '2'), { topic: ['öörahu', 'üksildus'] }),
      PART('050_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Kontrolli eesmärk on vähemalt 24 punkti (80 %).' }),
      B.reading('050_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe artiklit tülidest ja vasta kõigepealt kahele küsimusele. Siis lahenda osad 1 ja 2.', 'Tüli ei ole katastroof', [
        '(A) Paljud meist on õppinud, et hea pere, sõprus või naabrus on see, kus ei tülitseta. Kui naaber teeb öösel lärmi, kannatame vaikides. Kui sõber ei maksa laenatud raha tagasi, lõpetame lihtsalt talle helistamise. Kui pühade plaan ei meeldi, noogutame ja oleme siis terve õhtu pahased. Minu arvates on selline vaikne kannatamine headele suhetele üks suurimaid ohte. Konflikt ise ei ole probleem. Probleem on see, kuidas me sellega toime tuleme.',
        '(B) Erimeelsused on paratamatud, sest inimestel on erinevad huvid. Öövahetuses töötav õde vajab päeval und, väikese lapsega pere peab vannitoa ära remontima, teismeline tahab olla sõpradega ja vanaema perega. Keegi neist ei ole halb ega ebausaldusväärne inimene, nad on lihtsalt eri põlvkondadest ja eri eluga. Kui me aga nimetame teist kohe tülinorijaks või isekaks, muutub huvide vaidlus iseloomu vaidluseks ja lahendust on palju raskem leida. Kes tunneb end rünnatuna, see enam ei kuula, vaid kaitseb ennast.',
        '(C) Seadus aitab ainult osaliselt. Korrakaitseseaduse järgi on korterites kella kümnest õhtul kuni kuueni hommikul keelatud kestev või korduv müra, mis teisi oluliselt häirib. Puhkepäevale eelneval ööl kehtib keeld keskööst kella seitsmeni. Seadus ei ütle aga, kui vali on liiga vali, ega aita kahel inimesel samas trepikojas edasi elada. Isegi kui naaber saab trahvi, jääb ta sinu naabriks. Seepärast on kokkulepe peaaegu alati parem kui võit. Kohtuvaidlus naabriga võib kesta kuid, aga kokkuleppe saab sõlmida ühe õhtuga trepikojas.',
        '(D) Eriti kergesti kasvavad tülid internetis. Psühholoog John Suler kirjeldas juba 2004. aastal nähtust, mida eesti keeles võiks nimetada võrgu pidurdamatuseks: ekraani taga ütleme asju, mida näost näkku kunagi ei ütleks. Me ei näe teise nägu ega kuule tema häält ja vastame kohe, vihaselt. Majagrupis võib ühest sõnumist mõne tunniga saada nelikümmend. Hea reegel on lihtne: kui sõnum on vihane, ära saada seda kohe, vaid helista või mine uksele.',
        '(E) Kui kaks poolt ise kokkuleppele ei jõua, võib appi kutsuda kolmanda, erapooletu inimese. Eestis pakub Sotsiaalkindlustusamet lahku minevatele vanematele tasuta perelepitust, et nad saaksid lapse huvides kokku leppida. Perelepitaja on läbinud vähemalt 160 tundi koolitust. Ta ei otsusta kellegi eest ega ütle, kellel on õigus; ta toetab mõlemat poolt rääkimisel ja kuulamisel. Sama põhimõte sobib ka naabritele: korteriühistu juhatuse liige või mõni rahulik naaber võib olla hea vahendaja.',
        '(F) Mida siis teha? Hea nõuanne on lihtne, aga seda on raske täita. Esiteks räägi varakult, kui mure on veel väike. Teiseks räägi oma tundest ja vajadusest, mitte teise iseloomust: lause „Ma ei saa magada, sest töötan öösiti” mõjub hoopis teisiti kui „Te olete hoolimatud”. Kolmandaks kuula ja korda oma sõnadega, mida teine ütles. Neljandaks otsige kompromissi ja leppige kokku konkreetselt: kes, mida ja millal; iga järeleandmine võiks tuua midagi vastutasuks. Viiendaks vaadake mõne nädala pärast üle, kas kokkulepe toimib, ja muutke seda, kui vaja. Kirja pandud kokkulepet on hiljem lihtsam meenutada kui sõnu, mida keegi täpselt ei mäleta.',
        '(G) Ma ei väida, et iga tüli saab lahendada. Mõnikord on mõistlik eemalduda ja mõni suhe ka lõpetada. Kuid enamik tülisid, mida me kardame, on tegelikult lahendatavad, kui keegi julgeb esimesena rahulikult rääkida. Selleks ei pea olema eriti julge ega osav. Piisab sellest, kui ütled, mida tunned, ja küsid, mida teine vajab. Tüli ei ole suhte lõpp. Sageli on see hoopis koht, kus suhe saab tugevamaks.',
        'Allikas: autori arvamus; faktid: korrakaitseseadus § 56; J. Suler, „The Online Disinhibition Effect” (2004); Sotsiaalkindlustusamet, „Perelepitus”.',
      ].join('\n\n'), [['Mida tahab autor öelda pealkirjaga „Tüli ei ole katastroof”?', 'tüli võib suhet tugevdada|tüli on lahendatav|konflikt ei ole probleem, probleem on see, kuidas sellega toime tulla'], ['Kas sina räägid tüli korral pigem kohe või ootad? Miks?']]),
      tag(B.choice('050_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Mida peab autor lõigu A järgi headele suhetele kõige ohtlikumaks?', 'vaikset kannatamist', 'valju tüli', 'trahve', 'liiga palju sõpru'],
        ['Mis juhtub lõigu B järgi, kui teist kohe sildistatakse?', 'huvide vaidlusest saab iseloomu vaidlus', 'lahendus leitakse kiiremini', 'teine hakkab rohkem kuulama', 'tüli lõpeb kohe'],
        ['Miks on kokkulepe lõigu C järgi parem kui võit?', 'naaber jääb ka pärast trahvi sinu naabriks', 'trahv on liiga väike', 'seadus keelab trahvid', 'politsei ei tule kunagi'],
        ['Mida soovitab autor teha vihase sõnumiga?', 'mitte seda kohe saata, vaid rääkida otse', 'saata see öösel', 'saata see kõigile', 'kustutada majagrupp'],
        ['Mida perelepitaja lõigu E järgi EI tee?', 'ei otsusta, kellel on õigus', 'ei kuula kumbagi poolt', 'ei räägi lapse huvidest', 'ei aita pooltel rääkida'],
        ['Millise väitega oleks artikli autor kõige tõenäolisemalt nõus?', 'enamik tülisid on lahendatavad, kui keegi alustab rahulikult', 'iga suhe tuleb igal juhul alles hoida', 'tülisid tuleb alati vältida', 'tüli lahendab alati seadus'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('050_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Paljud jätavad tüli asemel lihtsalt suhtlemise pooleli. | [A]',
        '2. Kõigil osapooltel võivad olla mõistlikud vajadused. | [B]',
        '3. Seadus ei määra, mis on liiga vali. | [C]',
        '4. Ekraani taga oleme julgemad ja teravamad. | [D]',
        '5. Lepitajal on pikk ettevalmistus. | [E]',
        '6. Kokkulepet tuleks hiljem kontrollida. | [F]',
        '7. Mõnikord on õige suhe lõpetada. | [G]',
        '8. Vihase sõnumi asemel on parem helistada või minna uksele. | [D]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.formtext('050_d_cloze', 'Osa 3: pane sõna õigesse vormi (10 punkti).', 'Naaber kirjutab korteriühistu juhatusele. Kirjuta sulgudes olev sõna lünka õiges vormis.', 'Kiri juhatusele', [
        'Lugupeetud juhatus!',
        'Kirjutan teile, sest meie trepikojas on viimasel ajal olnud pingeid. Kolmanda korruse naaber ütles mulle eile, et ta [töötab] (töötama) öösiti ja vajab päeval und. Ta küsis, kas me [saaksime|saame] (saama) remonti teha pärastlõunal.',
        'Kahjuks ei teadnud ma seda varem ja [keegi] (kes + -gi) ei olnud mulle sellest rääkinud. Naabri sõnul [olevat|on] (olema) majagrupis tema kohta kirjutatud väga teravaid asju. Selline käitumine on [ebaviisakas] (viisakas, vastand) ja ma mõistan, et tal on haiget.',
        'Mis oleks, kui me [leiaksime] (leidma) üheskoos aja, mis sobib kõigile? Olen nõus remonti lühendama tingimusel, et ka teised naabrid [arvestavad|arvestaksid] (arvestama) meie tähtajaga.',
        'Minu arvates on naabrite vahel kõige tähtsam [usaldus] (usaldama). Remont lõpeb niikuinii kahe nädala pärast. Ma ei ole selles majas kunagi kellegagi [tülitsenud] (tülitsema) ega taha seda ka nüüd. Ootan teie [vastust] (vastus).',
        'Lugupidamisega\nneljanda korruse elanik',
      ].join('\n\n'), 'g_notice'), { task: 'G03', harno: 'R3' }),
      tag(B.insertion('050_d_bank', 'Osa 4: vali lause (6 punkti).', 'Loe lugu. Vali pangast igasse lünka sobiv lause; üks lause jääb üle.', 'Kuidas ma naabriga leppisin', [
        'Kolm aastat tagasi kolisin uude korterisse ja esimesel nädalal koputas alumine naaber mu uksele. [[Ta ütles, et mu sammud kostavad tema magamistuppa.]]',
        'Ma olin solvunud, sest kõndisin oma kodus täiesti tavaliselt. [[Nädal aega ma teda trepikojas isegi ei tervitanud.]]',
        'Siis kirjutas ta majagruppi, et uus naaber ei arvesta kellegagi. [[Ma vastasin kohe ja väga teravalt.]]',
        'Järgmisel päeval kohtasime teineteist poes. [[Ta seisis üksi kassas ja otsis rahakotist münte.]]',
        'Ma aitasin tal kotid koju kanda ja trepil rääkis ta, et töötab öösiti haiglas. [[Alles siis sain aru, miks iga heli teda nii väga segab.]]',
        'Ostsin toolijalgadele vildist kleebised ja tema tõi mulle pirukaid. [[Nüüd on meil kokkulepe ja me käime vahel koos jalutamas.]]',
      ], ['Seepärast otsustasin kohe teise korterisse kolida.']), { task: 'R16', harno: 'R4' }),
      // a short productive answer to the article (B2-: the reading sheet is not only recognition)
      tag(B.writing('050_d_reply', 'Lugemise lõpuks: vasta autorile (3–4 lauset).', 'Kas oled artikli autori nõuandega „räägi oma tundest, mitte teise iseloomust” nõus? Kirjuta 3–4 lauset: anna üks autori mõte kaudses kõnes edasi (autor kirjutab, et …), ütle oma arvamus ja too üks näide oma elust.', [3, 4], ['kirjutab, et', 'näiteks'], 1, 'g_read'), { task: 'W02' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening in Harno B2 form
    practice: [
      B.tip('050_p_how', 'Kontroll: keeleosa ja kuulamine (50 minutit)', 'Kuulamine on nagu Harno B2 eksamil, ainult lühem: teateid kuuled üks kord, intervjuud kaks korda ja kolmandat korda õige-vale väidete jaoks. Enne kuulamist on keeleosa: parandad päris sõnumeid ja ütled mõtte teisiti.', 'full'),
      B.tip('050_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on päris sõnumid ja laused tundidest 46–49. Paranda ja ütle teisiti nii, et adressaat saab sinust aru.', 'full'),
      B.errorfix('050_p_fix', 'Keeleosa A: paranda sõnum enne saatmist (6 punkti).', 'Sõber palus, et vaataksid tema sõnumid enne saatmist üle. Igas sõnumis on üks viga: kirjuta see õigesti.', [
        ['Mu naaber on väga aus ja ma hindan tema ausus.', 'Mu naaber on väga aus ja ma hindan tema ausust.'],
        ['Ma ootasin terve kuu, aga raha ei tulnudgi.', 'Ma ootasin terve kuu, aga raha ei tulnudki.'],
        ['Naaber küsis, et kas me saaksime vaiksemalt olla.', 'Naaber küsis, kas me saaksime vaiksemalt olla.'],
        ['Ta ütles mulle: „Ma töötan öösiti.” Ta ütles, et ma töötan öösiti.', 'Ta ütles mulle: „Ma töötan öösiti.” Ta ütles, et ta töötab öösiti.|Ta ütles mulle: „Ma töötan öösiti.” Ta ütles, et tema töötab öösiti.'],
        ['Mis oleks, kui me läheme pühadeks vanaema juurde?', 'Mis oleks, kui me läheksime pühadeks vanaema juurde?|Mis oleks, kui läheksime pühadeks vanaema juurde?'],
        ['Ma saan aru, et sa oleksid väga väsinud.', 'Ma saan aru, et sa oled väga väsinud.|Saan aru, et sa oled väga väsinud.'],
      ]),
      B.transformation('050_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle iga lause mõte uuesti, kasutades antud sõna või väljendit.', [
        ['Ta ei ole kannatlik.', 'kannatamatu', 'Ta on kannatamatu.'],
        ['Ma olin pettunud. Põhjus: sa ei helistanud.', 'kuna', 'Ma olin pettunud, kuna sa ei helistanud.|Kuna sa ei helistanud, olin ma pettunud.|Kuna sa ei helistanud, olin pettunud.'],
        ['Ühelegi inimesele ei meeldinud see plaan.', 'mitte kellelegi', 'See plaan ei meeldinud mitte kellelegi.|Mitte kellelegi ei meeldinud see plaan.'],
        ['Naaber: „Palun ärge puurige hommikul!”', 'palus mitte', 'Naaber palus hommikul mitte puurida.|Naaber palus mitte hommikul puurida.|Naaber palus meil hommikul mitte puurida.'],
        ['Lähme seekord mere äärde!', 'mis oleks, kui', 'Mis oleks, kui me läheksime seekord mere äärde?|Mis oleks, kui läheksime seekord mere äärde?'],
        ['Ma annan järele, aga sina pead nõud ära pesema.', 'tingimusel, et', 'Ma annan järele tingimusel, et sina pesed nõud ära.|Ma annan järele tingimusel, et sa pesed nõud ära.|Ma annan järele tingimusel, et sina peseksid nõud ära.|Ma annan järele tingimusel, et sa peseksid nõud ära.'],
      ]),
      PART('050_p_lpart', 'L', { minutes: 35, points: 23, tasks: 3, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 35–40 minutit, siin kolm ülesannet neljast): 23 punkti. Kontrolli eesmärk on vähemalt 19 punkti (80 %).' }),
      B.listening('050_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Kuula nelja teadet maja, raamatukogu, lasteaia ja kogukonnamaja elust, igaüht üks kord. Kirjuta lünka 1–2 sõna.', [
        '1. Korteriühistu teatab: vannitubade torude vahetus algab esmaspäeval. Müra tekitavaid töid tehakse ainult tööpäeviti kella üheksast viieni. Küsimuste korral helistage juhatuse esimehele.',
        '2. Linnaraamatukogu kutsub keelekohvikusse. Kohtume igal neljapäeval kell kuus teise korruse lugemissaalis. Kaasa ei ole vaja midagi, ainult head tuju. Osalemine on tasuta.',
        '3. Lasteaia lapsevanematele: jõulupeo aeg muutus. Pidu toimub reedel kell neli, mitte kell viis. Palume vanematel tuua kaasa oma tass, sest laual on soe mahl.',
        '4. Kogukonnamaja otsib vabatahtlikke, kes käiksid kord nädalas üksi elavate eakate juures külas. Esimene kohtumine on laupäeval kell üksteist. Registreeruda saab e-kirja teel.',
      ], [
        'Müra tekitavaid töid tehakse tööpäeviti kuni kella [viieni|viie|17ni].',
        'Küsimuste korral tuleb helistada juhatuse [esimehele|esimees].',
        'Keelekohvik toimub igal [neljapäeval|neljapäeviti].',
        'Lasteaia jõulupidu algab nüüd kell [neli|16].',
        'Jõulupeole tuleb kaasa võtta oma [tass].',
        'Vabatahtlikud käivad külas üksi elavate [eakate|vanurite] juures.',
      ]),
      tag(B.listening('050_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Kuula intervjuud kaks korda. Täida lausete lüngad 1–2 sõnaga.', [
        'Saatejuht: Tere! Täna räägime naabritest. Stuudios on Peeter Lõhmus, kes on kaheksa aastat juhtinud ühe Tartu kortermaja korteriühistut. Peeter, mitu korterit teie majas on?',
        'Peeter: Kuuskümmend neli. See tähendab umbes sada kakskümmend inimest ja vähemalt kakskümmend koera.',
        'Saatejuht: Mille üle kõige rohkem kurdetakse?',
        'Peeter: Kõige sagedamini müra pärast, teisel kohal on parkimine. Talvel kurdetakse ka lume pärast, mis jääb maja ette.',
        'Saatejuht: Kuidas te tülisid lahendate?',
        'Peeter: Esimene reegel on, et ma ei vali poolt. Kõigepealt räägin kummagi naabriga eraldi ja kuulan. Alles siis kutsun nad kokku, tavaliselt meie maja keldris olevasse ruumi, mitte kellegi koju.',
        'Saatejuht: Miks just keldrisse?',
        'Peeter: Seal on neutraalne koht. Kui tüli arutatakse kellegi köögis, tunneb teine end külalisena ja ei julge kõike öelda.',
        'Saatejuht: Kas majagrupp aitab?',
        'Peeter: Majagrupis jagame ainult teateid. Tülid seal ei lahene, vaid kasvavad. Seepärast lepiti üldkoosolekul kokku, et kaebusi grupis ei arutata.',
        'Saatejuht: Mis on olnud teie kõige parem lahendus?',
        'Peeter: Üks pere tegi remonti ja alumine naaber töötas öösiti. Leppisime kokku, et puuritakse ainult pärastlõunal ja et remondi lõpus kutsub pere kõik naabrid õue kringlile.',
        'Saatejuht: Aitäh, Peeter!',
      ], [
        'Peetri juhitud majas on kokku [kuuskümmend neli|64] korterit.',
        'Kõige sagedamini kurdavad naabrid [müra] pärast.',
        'Teisel kohal kaebuste seas on [parkimine].',
        'Peetri esimene reegel on, et ta ei vali [poolt].',
        'Kõigepealt räägib Peeter kummagi naabriga [eraldi].',
        'Ühine kohtumine toimub tavaliselt maja [keldris].',
        'Peetri sõnul on keldriruum [neutraalne] koht.',
        'Majagrupis jagatakse Peetri majas ainult [teateid].',
        'Remondi lõpus kutsus pere kõik naabrid õue [kringlile].',
      ]), { voice: 'interview', task: 'L04', harno: 'L3' }),
      tag(B.truefalse('050_p_tf', 'Kuulamine 3: õige või vale? (8 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Peetri majas elab umbes sada kakskümmend inimest.', true],
        ['Talvel kurdetakse Peetri majas kõige rohkem lume pärast.', false],
        ['Peeter otsustab tavaliselt kiiresti, kumb naaber on süüdi.', false],
        ['Enne ühist kohtumist kuulab Peeter mõlemat naabrit eraldi.', true],
        ['Peetri arvates on hea arutada tüli ühe naabri köögis.', false],
        ['Peetri sõnul aitab majagrupp tülisid kiiresti lahendada.', false],
        ['Kaebuste kohta grupis lepiti kokku üldkoosolekul.', true],
        ['Remondi ajal tohtis pere puurida ainult hommikul.', false],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.rubric('050_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (sõnumid – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('050_t_situation', 'Kontroll: kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühem. Kirjutad naabrile vabandus- ja ettepanekukirja ning arutluse. Sõnavõtus esitled mooduli tulemust: oma kokkulepet, mille plaani paned enne kirja.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own agreement, built in 046–049
      B.planning('050_t_product', 'Mooduli tulemus: minu kokkulepe.', 'Võta oma kokkuleppe kaart tunnist 49 ja lisa igale reale üks lause tundidest 46–48.', ['Kes on see inimene ja milline ta on? (tund 46: omadus + tegu)', 'Mida ma tundsin ja miks? (tund 47: kuna, seetõttu)', 'Mida tema ütles ja palus? (tund 48: ütles, et …; palus …)', 'Milles me kokku leppisime ja mis tingimusel? (tund 49: tingimusel, et …)']),
      PART('050_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja arutluse eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('050_t_letter', 'Kirjutamine 1: kiri naabrile (umbes 140 sõna).', 'Sa kirjutasid eile majagruppi oma naabri kohta terava sõnumi, sest tema koer haukus öösel. Nüüd sa kahetsed. Kirjuta naabrile: vabanda, ütle, mida sa tundsid ja miks, anna edasi, mida teised naabrid sulle ütlesid, ja paku konkreetne lahendus.', 'Hea naaber!', 'Parimate soovidega', [140, 160]), { task: 'W13', harno: 'W1' }),
      tag(B.writing('050_t_essay', 'Kirjutamine 2: arutlus (umbes 180 sõna).', 'Kirjuta arutlus teemal: kas naabritülisid tuleks lahendada pigem rangete reeglite ja trahvidega või vestluse ja lepitusega? Too mõlema poole argumendid, igaühele näide, ja sinu põhjendatud järeldus.', [14, 18], ['ühelt poolt', 'teiselt poolt', 'näiteks', 'kokkuvõttes'], 3), { task: 'W14', harno: 'W2b' }),
      PART('050_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; kontrolli eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('050_t_present', 'Rääkimine 1: sõnavõtt (1 minut).', 'Teemakaart: räägi 1 minut ühest kokkuleppest, milleni sa jõudsid (või mille välja mõtlesid). Mõtle 2 minutit oma kaardi järgi, räägi 1 minut, siis vasta küsimustele.', ['Kellega ja mille üle oli erimeelsus?', 'Mida kumbki tundis ja mis oli tema tegelik huvi?', 'Milles te kokku leppisite ja kas see toimib?', 'Paariline küsib: „Mida sa järgmine kord teisiti teeksid?”', 'Kas tülid on sinu arvates suhetele pigem kasulikud või kahjulikud? Miks?', 'Kas naabrite või pere tülidesse peaks sekkuma keegi kolmas? Põhjenda.'], [90, 180], ['Tahaksin rääkida ühest kokkuleppest …', 'Mõlemale oli tähtis …', 'Lõpuks leppisime kokku, et …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('050_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas igas kortermajas peaks olema kirjalik kodukord? Argumendid: siis teavad kõik reegleid ette; vaidluses saab viidata kokkuleppele, mitte tunnetele; korrakaitseseadus ei määra päevase remondi aegu. Lisa oma näide.',
        'Kaart B (vastu). Teema: kas igas kortermajas peaks olema kirjalik kodukord? Argumendid: reeglid ei asenda omavahelist vestlust; pikka kodukorda ei loe keegi; liiga palju reegleid teeb naabrid üksteise suhtes valvsaks. Lisa oma näide.',
        ['Minu arvates …', 'Näiteks meie majas …', 'Ma saan aru, et …, aga …'], ['Ma ei ole päris nõus, sest …', 'Vastutasuks võiksime …', 'Mis oleks, kui …?', 'Kas võiksime kokku leppida, et …?']), { task: 'S17', harno: 'S2' }),
      B.rubric('050_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kiri: vabandus, tunne ja põhjus, teiste sõnad kaudses kõnes, konkreetne lahendus, sobiv toon, umbes 140 sõna (10 punkti).', 'Arutlus: mõlema poole argumendid näidetega, selge järeldus, sidusus, umbes 180 sõna (15 punkti).', 'Sõnavõtt: erimeelsus, huvid ja kokkulepe 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin näitega, reageerisin paarilisele, jõudsime ühisele seisukohale (15 punkti).']),
      B.selfcheck('050_t_self', ['Kirjutamine: … / 25 punkti (kiri 10, arutlus 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 60 % ja üheski osas mitte 0 punkti.', 'Ma tean, mida enne järgmist moodulit korrata.'], 'Moodul 10 läbitud'),
    ],
  },
};

// the explanations of the v4 blocks (the v4 EXPLAIN map), kept for the Harjuta practice engine
const OLD_WHY = {
  // 046
  '046_d_facts': [
    '1. lõik: „meil saadetakse kaarte ja kommi ka sõpradele, klassikaaslastele ja kolleegidele”.',
    '2. lõik: „jutuajamine ja ühine tegevus loovad sidet rohkem kui lihtsalt samas ruumis istumine”.',
    '2. lõik: aeg ja ühine tegevus loovad sõprust — kursusel ja koorist on mõlemad olemas.',
    '3. lõik: „Paljusid üllatas, et noored ei olnud vähem üksildased kui vanemad inimesed.”',
    '4. lõik: rahulolu suhetega 50-aastaselt „ennustas tema tervist … paremini kui kolesterool”.',
    '2. lõik: „üle 200 tunni, et temast saaks lähedane sõber” — kõige rohkem aega.',
    '4. lõik: üksildus tekib, „kui inimesel ei ole kellegagi rääkida … ega kedagi, kes teda toetaks”.',
    '4. lõik: „ei loe sõprade arv, vaid suhete kvaliteet: kas sul on keegi, keda sa usaldad”.',
  ],
  '046_p_forms': [
    'Lause vajab asja (tema …): usaldusväärne → usaldusväärsus.',
    'selline + nimisõna: -lik → -likkus (kaks k-d): tähelepanelikkus.',
    'Mõte on vastupidine (hakkab närveerima): kannatama → kannatamatu.',
    'Käitumine oli vale: aus → ebaaus (vastand eesliitega eba-).',
    'ei ole + vastupidine omadus: hoolima → hoolimatu.',
    'hindama + osastav: ausus → ausust.',
  ],
  '046_t_exit': [
    'Käitumine ei arvesta teistega: hoolima → hoolimatu.',
    'hindama + osastav: aus → ausus → ausust.',
    'Alguses tundus vastupidine: viisakas → ebaviisakas.',
  ],
  // 047
  '047_d_feel': [
    'Olesja: „Edu uue korteriga!” — Igor kolis.',
    'Märtsis „Suur aitäh! … sa oled tõeline sõber”, juunis „Kas sa jälgid mind või?”.',
    'Olesja: „Mul on endal sel kuul hambaarst.”',
    'Olesja: „Mulle sa isegi ei helista enam” — pettumus ja solvumine.',
    'Terav vastus kaitseb: kes tunneb piinlikkust ja süüd, ründab sageli ise.',
    'Lause pildist ja kontserdist kõlab nagu jälgimine — Igor vastab: „Kas sa jälgid mind või?”',
  ],
  '047_p_ki': [
    'ei …-ki: oodati, aga ei juhtunud — ei tulnudki (pärast d-d -ki).',
    'isegi rõhutab: isegi sünnipäeval mitte.',
    'Eituses mitte keegi → mitte kellelegi (alaleütlev) + ei ole.',
    'kuna + põhjus; kui kuna-lause on ees, tuleb pealauses tegusõna kohe.',
    'mistõttu + tagajärg samas lauses.',
    'seetõttu + tagajärg; pärast seetõttu on tegusõna kohe: ei kirjutanud ma.',
    'ka tema = temagi / isegi tema / samuti: -gi liitub sõnaga, mida rõhutab (õdegi).',
  ],
  '047_t_voice': [
    'Igor: „Aprilli alguses jäin ma töötuks.”',
    'Igor: „Mul oli nii piinlik, et ma ei vastanudki sulle.”',
    'Igor: „tundsin süütunnet”.',
    'Igor: „Kontserdi pileti kinkis mulle õde sünnipäevaks.”',
    'Igor: „Nüüd on mul uus töö laos.”',
    'Igor: „maksan alates juulist iga kuu viiskümmend eurot”.',
  ],
  '047_t_exit': [
    'ei …-ki: oodati, aga ei juhtunud; helistanud + -ki.',
    'kus + -gi → kuskil / kusagil; eituses: ei olnud kuskil.',
    'Tagajärg samas lauses: mistõttu (siis tegusõna kohe: pidin).',
  ],
  // 048
  '048_d_voice': [
    'Ljudmila: „Ma töötan haiglas öövahetustes.”',
    'Ljudmila: „magan päeval, tavaliselt kella kaheksast kolmeni”.',
    'Ljudmila: „on ülemisest korterist kostnud päeval puurimist”.',
    'Ljudmila: „keegi ei tulnudki uksele”.',
    'Ljudmila: „Üks naaber kirjutas, et ma olen lihtsalt tülinorija” — kaudne kõneviis (olevat), sest see on teise väide.',
    'Ljudmila: „et remont oleks tööpäeviti kella kaheteistkümnest kuueni”.',
    'Ljudmila: „et reede õhtul pandaks muusika kella kümneks vaiksemaks”.',
  ],
  '048_p_report': [
    'Väide: kirjutas, et …; me → nad, aeg jääb samaks (teevad).',
    'Jah-ei-küsimus: küsis, kas …; te → nad (saaksid).',
    'Käsk → palus, et + tingiv eitus: ei kirjutaks; siia → sinna.',
    'Sina väidet ei usu → kaudne kõneviis: olevat.',
    'Küsisõnaga küsimus: küsis, millal … (ilma sõnata et); teie → nende.',
    'homme → järgmisel päeval; ma → ta.',
    'palus + da-tegevusnimi (helistada, mitte kirjutada) või palus, et + umbisikuline tingiv.',
  ],
  '048_t_ask': [
    'Tekst: kella 22.00-st kuni 6.00-ni on häiriv müra keelatud.',
    'Tekst: puhkepäevale eelneval ööl „kella 0.00-st kuni 7.00-ni”.',
    'Pühapäev on puhkepäev, laupäeva öö on enne seda: kuni 7.00.',
    'Tekst: „Päevase remondi kellaaegu see seadus ei määra.”',
    'Tekst: „seejärel pöörduda korteriühistu juhatuse poole”.',
    'Tekst: „Maja ühised reeglid võtab vastu korteriomanike üldkoosolek.”',
  ],
  '048_t_exit': [
    'Jah-ei-küsimus kaudses kõnes: küsis, kas …',
    'Isik muutub: mul → tal (mina → tema).',
    'palus kellel + da-tegevusnimi; eitus: mitte kirjutada.',
  ],
  // 049
  '049_d_radio': [
    'Tiina: „oleks kumbki saanud kõik, mida ta tegelikult tahtis”.',
    'Tiina: „Huvi on see, miks ta seda nõuab.”',
    'Tiina: „Kõigepealt kuula ja ütle oma sõnadega, mida teine tahab.”',
    'Tiina: „otsige koos vähemalt kolm varianti”.',
    'Tiina: kokku tuleb leppida „kes, mida ja millal”.',
    'Tiina: „lahku minevatele vanematele tasuta perelepitust”.',
  ],
  '049_p_mood': [
    'Mis oleks, kui + tingiv: veedaksime.',
    'Pehme küsimus tingivas: kas me saaksime.',
    'Ma saan aru, et + fakt kindlas kõneviisis: kardad.',
    'tingimusel, et + tavaliselt kindel kõneviis: juhid (tingiv juhiksid on samuti võimalik).',
    'Mõeldud olukord kui-lauses: tuleks (pealauses ei peaks).',
    'Pehme pakkumine tingivas: võiksin.',
    'Minevik, mõeldud olukord: oleks + -nud; eitus: poleks / ei oleks läinud.',
  ],
  '049_t_exit': [
    'Mis oleks, kui + tingiv: sõidaksime.',
    'tingimusel, et + tavaliselt kindel kõneviis: pesed (ka peseksid on võimalik).',
    'Ma saan aru, et + fakt: oled.',
  ],
  // 050
  '050_d_read': [
    '(A) ja (G): konflikt ei ole probleem — tüli võib suhte hoopis tugevamaks teha.',
    'Sinu oma vastus: õpetaja vaatab, kas põhjendad oma valikut.',
  ],
  '050_d_mc': [
    '(A): „selline vaikne kannatamine headele suhetele üks suurimaid ohte”.',
    '(B): „muutub huvide vaidlus iseloomu vaidluseks”.',
    '(C): „Isegi kui naaber saab trahvi, jääb ta sinu naabriks.”',
    '(D): „ära saada seda kohe, vaid helista või mine uksele”.',
    '(E): lepitaja „ei otsusta kellegi eest ega ütle, kellel on õigus”.',
    '(G): „enamik tülisid … on tegelikult lahendatavad, kui keegi julgeb esimesena rahulikult rääkida”.',
  ],
  '050_d_para': [
    '(A): „lõpetame lihtsalt talle helistamise”.',
    '(B): „Keegi neist ei ole halb ega ebausaldusväärne inimene.”',
    '(C): „Seadus ei ütle aga, kui vali on liiga vali.”',
    '(D): „ekraani taga ütleme asju, mida näost näkku kunagi ei ütleks”.',
    '(E): „vähemalt 160 tundi koolitust”.',
    '(F): „vaadake mõne nädala pärast üle, kas kokkulepe toimib”.',
    '(G): „Mõnikord on mõistlik eemalduda ja mõni suhe ka lõpetada.”',
    '(D): „helista või mine uksele”.',
  ],
  '050_d_cloze': [
    'Kaudne kõne: aeg ei muutu — ta töötab (ta ütles: „Ma töötan.”).',
    'Kaudne küsimus: kas me saaksime (viisakas) või kas me saame.',
    'kes + -gi → keegi; eituses: keegi ei olnud rääkinud.',
    'Naabri sõnul + kaudne kõneviis olevat (kirjutaja ei vastuta) või tavaline on.',
    'Vastand eesliitega eba-: ebaviisakas (omadussõna, sest „käitumine on …”).',
    'Mis oleks, kui + tingiv: leiaksime.',
    'tingimusel, et + tavaliselt kindel kõneviis: arvestavad (ka arvestaksid).',
    'Kõige tähtsam on asi → nimisõna: usaldama → usaldus.',
    'ei ole + -nud: ei ole tülitsenud.',
    'ootama + osastav: vastust.',
  ],
  '050_d_bank': [
    'Naaber koputas → mida ta ütles: sammud kostavad.',
    'Solvunud → mida ta tegi: ei tervitanudki.',
    'Majagrupi sõnum → tema reaktsioon: vastas teravalt.',
    'Kohtusid poes → mida ta nägi: naaber üksi kassas.',
    'Naaber töötab öösiti → alles siis sai aru. Üle jääb „otsustasin kolida”, mis ei sobi loo lõpuga.',
    'Vildist kleebised ja pirukad → nüüd on kokkulepe.',
  ],
  '050_p_fix': [
    'hindama + osastav: ausust.',
    'Pärast d-d on -ki: ei tulnudki.',
    'Kaudne küsimus: küsis, kas … (ilma sõnata et).',
    'Kaudses kõnes muutub isik: ma → ta (töötab).',
    'Mis oleks, kui + tingiv: läheksime.',
    'Ma saan aru, et + fakt kindlas kõneviisis: oled.',
  ],
  '050_p_trans': [
    'ei ole kannatlik = on kannatamatu (vastand -matu).',
    'Põhjus: kuna sa ei helistanud.',
    'Eituses: mitte kellelegi … ei meeldinud.',
    'Palve kaudses kõnes: palus mitte + da-tegevusnimi (puurida).',
    'Ettepanek: mis oleks, kui + tingiv (läheksime).',
    'Järeleandmine tingimusega: tingimusel, et + tavaliselt kindel kõneviis (pesed).',
  ],
  '050_p_notes': [
    'Teade 1: „kella üheksast viieni”.',
    'Teade 1: „helistage juhatuse esimehele”.',
    'Teade 2: „igal neljapäeval kell kuus”.',
    'Teade 3: „Pidu toimub reedel kell neli, mitte kell viis.”',
    'Teade 3: „tuua kaasa oma tass”.',
    'Teade 4: „üksi elavate eakate juures külas”.',
  ],
  '050_p_listen': [
    'Peeter: „Kuuskümmend neli.”',
    'Peeter: „Kõige sagedamini müra pärast.”',
    'Peeter: „teisel kohal on parkimine”.',
    'Peeter: „ma ei vali poolt”.',
    'Peeter: „räägin kummagi naabriga eraldi”.',
    'Peeter: „meie maja keldris olevasse ruumi”.',
    'Peeter: „Seal on neutraalne koht.”',
    'Peeter: „Majagrupis jagame ainult teateid.”',
    'Peeter: „kutsub pere kõik naabrid õue kringlile”.',
  ],
  '050_p_tf': [
    'Õige: „umbes sada kakskümmend inimest”.',
    'Vale: kõige sagedamini kurdetakse müra pärast; lumi on talvine lisamure.',
    'Vale: „ma ei vali poolt”.',
    'Õige: „Kõigepealt räägin kummagi naabriga eraldi ja kuulan.”',
    'Vale: „mitte kellegi koju” — köögis tunneb teine end külalisena.',
    'Vale: „Tülid seal ei lahene, vaid kasvavad.”',
    'Õige: „lepiti üldkoosolekul kokku, et kaebusi grupis ei arutata”.',
    'Vale: „puuritakse ainult pärastlõunal”.',
  ],
};

// a v4 block that left the sheet: hidden with its reason, its old explanation kept (v5 §4)
const V4_BLOCKS = Object.fromEntries(Object.values(V4).flatMap((l) => ['discover', 'practice', 'transfer'].flatMap((p) => l[p] || [])).map((b) => [b.id, b]));
const retire = (id, reason) => {
  const b = V4_BLOCKS[id];
  if (!b) throw new Error(`module10: v4 plokki ${id} ei ole`);
  return hide(OLD_WHY[id] ? why(b, OLD_WHY[id]) : b, reason);
};

export const LESSONS = withShapes({
  'b1b2-046': {
    title: 'Kas sul on sõber, kellele saad öösel kell kolm helistada?',
    phases: grammar('Kordamine: aus, kannatlik · B2: ausus, sõbralikkus, ebaaus, hoolimatu, abitu; hindan tema ausust'),
    format: 'facts',
    topic: 'freetime',
    canDo: 'Ma soovitan sõpra tegude kaudu, loen artiklit sõprusest ja kirjutan umbes 140-sõnalise soovituskirja.',
    teacherPage: {
      goal: 'Холодная задача устно; статья «как знакомый становится другом»; качество как существительное и антоним; рекомендация друга со скрытой информацией; дома письмо 140 слов.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: холодная задача (5 мин) — обязательно; статья — абзацы 1–5 и вопросы 1–5; станция 3 — правило и 10 предложений; разговор без третьего препятствия.',
      hook: '«Väide: täiskasvanuna on uut sõpra peaaegu võimatu leida.» Ученик 2 минуты думает (можно записать слова) и 1 минуту говорит без помощи. Это холодная задача модуля (устно; модуль 9 мерил письмо): не помогайте, не давайте фраз, не исправляйте. Запишите заметки — в уроке 050 ученик говорит параллельную задачу в тех же условиях.',
      plan: [
        '0–5: станция 1 — холодная задача: 2 минуты подготовки, 1 минута речи без помощи; заметки сохраните до 050',
        '5–25: станция 2 — 10 слов (2 мин), статья (8 мин), 7 вопросов, из них 3 на вывод (7 мин), схема «как знакомый становится другом» (3 мин)',
        '25–45: станция 3 — прилагательное одной строкой, B2: ausus, sõbralikkus, ebaaus, hoolimatu, abitu и падеж существительного; 10 предложений, рекомендация в приют для животных с 10 пропусками без банка, регистр (8 строк): сообщение другу → рекомендательное письмо',
        '45–70: станция 4 — план (3 мин), картинка, разговор с дочерью хозяйки со скрытой информацией (6–8 мин), разбор по трём критериям',
        '70–75: выход: три критерия и «Ma oskan …»; домашнее задание: рекомендательное письмо 140 слов без готового начала и голосовое 1 мин',
        'Kui aega jääb (75–90): игра «Угадай качество» — описать человека только поступками, партнёр называет качество и существительное (kannatlik → kannatlikkus)',
      ],
      sources: 'Статья «Sõber ei teki iseenesest» — учебный текст KeeleSepp, без точной статистики. Общая основа: исследования о времени, нужном для дружбы (например, J. A. Hall, 2018: десятки часов до дружбы, сотни — до близкой), опросы об одиночестве в ЕС (молодые не реже пожилых), долгое исследование Гарварда о качестве отношений. Бухгалтер из Тарту, подруга Кати, Марек, хозяйка комнаты и её дочь — учебные.',
      groups: 'Холодная задача — каждый сам, остальные слушают молча. Статья — каждый сам, вопросы на вывод сравнивают в паре. Станция 4: один рекомендует друга, другой — дочь хозяйки с вашей карточкой; потом смена. В 1:1 дочь — вы.',
      errors: [
        '«Ta on ausus» → «Ta on aus» / «Tema ausus …» (качество человека — прилагательное, качество как вещь — существительное).',
        '«kannatlikus» → «kannatlikkus» (-lik + -kus: два k).',
        '«mitteaus», «ebakannatlik» → «ebaaus», «kannatamatu» (у каждого слова свой антоним: eba- или -matu).',
        '«Ma hindan tema ausus» → «… tema ausust» (hindama — частичный объект); «imestan tema kannatlikkust» → «… kannatlikkuse üle».',
      ],
      notes: [
        'Холодная задача — исходная точка модуля по речи. Отметьте: позиция в первом предложении, причина с примером, контраргумент, связки, 2–3 повторяющиеся ошибки. В 050 ученик говорит параллельную задачу (050_t_cold), вы сравниваете.',
        'Прилагательное (модули 1–3) — повтор одной строкой. Цель B2 — качество как вещь и антоним: существительные на -us / -dus / -likkus, приставка eba-, суффиксы -matu / -tu и падеж в предложении (hindan ausust, imestan kannatlikkuse üle, räägin lahkusest). Это язык характеристики, рекомендации и аргумента.',
        'Одиночество — тема деликатная: ученик не обязан говорить о себе, всегда можно «человек, которого знаю» или выдуманный. Обратная связь, 2–3 цели: качество + поступок как доказательство; форма существительного или антонима; смягчение слабой стороны («vahel natuke …, aga …»).',
      ],
    },
    discover: [
      station(inLesson(teach(tag(purpose(B.speaking('046_d_cold', 'Külm algus: üks minut ilma abita.', 'Väide: „Täiskasvanuna on uut sõpra peaaegu võimatu leida.” Mõtle 2 minutit (märkmeid võib teha) ja räägi 1 minut: kas oled nõus? Valmis fraase ei ole.', [
        'Kas oled väitega nõus, osaliselt nõus või ei ole nõus?',
        'Mis on sinu peamine põhjus? Too üks näide oma elust või tuttava elust.',
        'Mida ütleks keegi, kes arvab teisiti, ja mida sina talle vastaksid?',
      ], [60, 90]), 'See on sinu algus: õpetaja märgib üles, kuidas sa praegu räägid, ja tunnis 50 räägid samadel tingimustel uuest väitest.'), { task: 'S16', fluency: true, harno: 'S1' }),
      'Mooduli külm ülesanne (algtase), 5 minutit, suuliselt (moodul 9 mõõtis kirjutamist, moodul 10 mõõdab rääkimist). Ära aita, ära anna fraase ega paranda. Märgi üles: kas seisukoht on esimeses lauses, mitu põhjust, kas on näide, kas vastuargument tuleb, mitu sidendit (seetõttu, samas …) ja 2–3 korduvat viga. Hoia märkmed alles: tunnis b1b2-050 räägib õppija paralleelse ülesande samades tingimustes (kontrolli rääkimise 1. osa) ja te võrdlete. Üks-ühele: sina oled kuulaja; pärast kõnet küsi ainult „Miks?”. Üksildus on õrn teema: õppija ei pea rääkima endast.')), 1, 5),
      station(tag(B.vocab('046_d_vocab', 'Tunni sõnad.', ['usaldus — доверие', 'usaldusväärne — надёжный', 'vastastikkus — взаимность', 'regulaarsus — регулярность', 'üksildus — одиночество', 'tuttav — знакомый', 'hooliv — заботливый', 'otsekohene — прямой (о человеке)', 'aega veetma — проводить время', 'lubama — обещать']), { topic: ['üksildus', 'usaldus', 'vastastikkus', 'regulaarsus', 'otsekohene'] }), 2, 20),
      why(teach(tag(purpose(B.reading('046_d_text', 'Loe artiklit.', 'Loe artiklit (umbes 8 minutit) ja vasta küsimustele. Küsimustele 5–7 ei ole vastust tekstis sõna-sõnalt: järelda ja näita lauset, millele vastus toetub.', 'Sõber ei teki iseenesest', [
        'Lapsepõlves leiame sõbra peaaegu märkamatult: liivakastist, koolipingist või hoovist, kus samad lapsed mängivad iga päev. Keegi ei planeeri sõprust ega mõtle, kas teisel on aega. Täiskasvanuna on päevad täis tööd, kohustusi ja pereasju ning uus sõprus ei teki enam iseenesest. Eriti tunnevad seda need, kes on kolinud uude linna või riiki. Paljud neist ütlevad, et tuttavaid ja kolleege on palju, aga inimest, kellele öösel kell kolm helistada, ei ole.',
        'Uurijad on küsinud, mis teeb tuttavast sõbra. Vastus on lihtsam, kui arvata võiks: aeg ja ühine tegevus. Et tuttavast saaks sõber, on vaja kümneid tunde koos veedetud aega, lähedase sõbra jaoks koguni sadu. Tähtis ei ole aga ainult tundide arv, vaid ka see, mida nende ajal tehakse. Jutuajamine, ühine mure või ühine töö loovad sidet palju rohkem kui lihtsalt samas ruumis istumine. Ka ühine sõit tööle või lapse trenni ootamine võib saada sõpruse alguseks, kui seal hakatakse päriselt rääkima. Seepärast ei pruugi kolleeg, kellega jagad aastaid sama kontorit, saada sõbraks, kui te räägite ainult tööst.',
        'Täiskasvanud leiavad sõpru sageli seal, kus kohtumine on muutunud harjumuseks: kooris, matkaklubis, keelekursusel, vabatahtlikus töös või naabrite ühisel talgupäeval. Seal näed sama inimest iga nädal ja kohtumiseks ei pea iga kord uut põhjust otsima. Üks Tartusse kolinud raamatupidaja meenutab, et leidis esimese päris sõbra alles teisel aastal — rahvatantsurühmast, kuhu ta läks ainult keele pärast. „Alguses rääkisime ainult sammudest. Pool aastat hiljem aitas ta mul kolida,” ütleb ta.',
        'Üksi elamine ei tähenda veel üksildust. Üksildus on tunne, et kui midagi juhtub, ei ole kellegagi rääkida ega kedagi, kes toetaks. Paljusid üllatab, et noored ei tunne end harvem üksildasena kui vanemad inimesed. Telefonis võib olla sadu kontakte, kuid ükski neist ei too poest leiba, kui palavik on kõrge. Ka see, kes on alati seltskonnas, võib tunda, et keegi ei tunne teda päriselt. Üksildus ei ole iseloomuviga ega nõrkus: see on märk, et inimene vajab sidet, nagu nälg on märk, et ta vajab süüa.',
        'Mis siis teeb sõbrast lähedase? Psühholoogid nimetavad tavaliselt kolme asja: usaldus, vastastikkus ja regulaarsus. Usaldus kasvab tegudest, mitte sõnadest: sõber teeb seda, mida lubab, ja hoiab saladust. Vastastikkus tähendab, et mõlemad annavad ja võtavad. Kes ainult kuulab või ainult räägib, väsib varem või hiljem. Regulaarsus ei tähenda, et peab iga päev kohtuma; mõnikord piisab kord kuus helistamisest, kui see on kindel. Lähedast sõpra ei tee ka see, et ta on alati nõus. Aus sõber ütleb vahel ka seda, mida sa kuulda ei taha, ja jääb ometi sinu kõrvale.',
        'Lõpuks ei ole küsimus selles, kui palju sõpru sul on, vaid kas sul on keegi, keda usaldad. Hea sõber ei pea olema iga päev sinu kõrval. Tähtis on teadmine, et ta vastab, kui sa teda vajad. Ja kui sellist inimest praegu ei ole, pole see häbiasi, vaid ülesanne: vali üks koht, kus käid iga nädal, ja anna sõprusele aega.',
        'Allikas: KeeleSepp õppetekst.',
      ].join('\n\n'), [
        ['Miks tekib lapsepõlves sõprus autori sõnul peaaegu märkamatult?', 'samad lapsed kohtuvad iga päev samas kohas ja keegi ei pea sõprust planeerima'],
        ['Mis teeb uurijate järgi tuttavast sõbra?', 'koos veedetud aeg ja ühine tegevus'],
        ['Miks ei pruugi kolleegist saada sõpra, kuigi te jagate aastaid sama kontorit?', 'kui räägite ainult tööst; puudub jutuajamine, ühine mure või ühine tegevus'],
        ['Milliseid kolme asja nimetavad psühholoogid lähedase sõpruse alusena?', 'usaldus, vastastikkus ja regulaarsus'],
        ['Miks sobivad koor, matkaklubi või keelekursus täiskasvanule sõbra leidmiseks? Järelda.', 'kohtumine on iganädalane harjumus: näed sama inimest regulaarselt ja teete midagi koos, nii kogunevad aeg ja ühine tegevus'],
        ['Mida tahab raamatupidaja öelda lausega „Pool aastat hiljem aitas ta mul kolida”? Järelda.', 'ühisest tegevusest kasvas usaldus: tuttavast sai sõber, kes aitab ka siis, kui on raske'],
        ['Milline on autori hoiak inimese suhtes, kellel praegu lähedast sõpra ei ole? Mida ta vihjab viimase lausega?', 'see ei ole häbiasi; sõprust saab ise teadlikult luua, kui käid regulaarselt samas kohas ja annad aega'],
      ]), 'Pärast lugemist tead, mis teeb tuttavast sõbra, ja oskad oma sõpra tegude kaudu kirjeldada.'), { task: 'R15', voice: 'expert' }),
      'Lugemine, 20 minutit koos sõnade ja skeemiga. Enne lugemist küsi: kus sina oled täiskasvanuna kellegagi tuttavaks saanud? Pärast lugemist lisab õpilane skeemi igale sammule ühe näite tekstist. Küsimused 5–7 on järeldusküsimused: nõua lauset, millele vastus toetub. Tekst on õppetekst ilma statistikata; ära küsi õpilase enda üksilduse kohta.'), [
        '1. lõik: lapsed mängivad „iga päev” samas kohas; „Keegi ei planeeri sõprust”.',
        '2. lõik: „aeg ja ühine tegevus”.',
        '2. lõik: kolleegist ei pruugi saada sõpra, „kui te räägite ainult tööst”.',
        '5. lõik: „usaldus, vastastikkus ja regulaarsus”.',
        'Järeldus 3. lõigust: kohtumine on „muutunud harjumuseks” — sama inimest näed iga nädal.',
        'Järeldus 3. lõigust: alguses räägiti „ainult sammudest”, hiljem tuli abi kolimisel — tuttavast sai sõber.',
        'Järeldus 6. lõigust: „pole see häbiasi, vaid ülesanne: vali üks koht, kus käid iga nädal, ja anna sõprusele aega”.',
      ]),
      purpose(B.diagram('046_d_scheme', 'flow', { title: 'Skeem: kuidas tuttavast saab sõber?', instruction: 'Pärast lugemist kirjuta iga sammu juurde üks näide tekstist. Viimase kasti juurde kirjuta, kes on sinu jaoks selline inimene või kus võiksid teda kohata.', nodes: 'Tuttav: näete teineteist juhuslikult, räägite viisakalt\nÜhine tegevus: koor, trenn, kursus — iga nädal\nAeg: kümned tunnid koos, jutuajamine, ühine mure\nUsaldus ja vastastikkus: teeb, mida lubab; mõlemad annavad ja võtavad\nSõber: vastab, kui sind vaja on' }, 'full', 'g_read'), 'Skeem näitab, mis samm-sammult teeb tuttavast sõbra.'),
      retire('046_d_hook', CUT_HOOK),
      retire('046_d_talk', CUT_TALK),
      retire('046_d_open', CUT_STATS),
      retire('046_d_facts', CUT_STATS),
    ],
    practice: [
      station(teach(B.notice('046_p_notice', 'Märka: aus → ausus → ebaaus', [
        'Artiklist: **usaldus** kasvab tegudest · **vastastikkus** tähendab, et … · **regulaarsus** ei tähenda … · see ei ole **häbiasi** · tunda end **üksildasena** → **üksildus**',
        'Kordamine (B1): omadus on omadussõna — Ta on **aus**, **kannatlik**, **sõbralik**.',
        'B2: omadus kui asi (nimisõna) — **-us / -dus**: aus → **ausus**, julge → **julgus**, üksildane → **üksildus**, otsekohene → **otsekohesus**, abivalmis → **abivalmidus** · **-lik → -likkus** (kaks k-d): sõbralik → **sõbralikkus**, kannatlik → **kannatlikkus**',
        'B2: vastand — **eba-**: aus → **ebaaus**, viisakas → **ebaviisakas**, kindel → **ebakindel** · **-matu** (ma-tegevusnimest): hoolima → **hoolimatu**, tänama → **tänamatu**, kannatama → **kannatamatu** · **-tu**: abi → **abitu**, mõte → **mõttetu**',
        'Nimisõna käändub nagu iga teine: hindan tema **ausust** (osastav) · imestan tema **kannatlikkuse** üle · räägin tema **lahkusest** · Tema **otsekohesus** ehmatab alguses.',
      ], 'full'), 'Kordamine ühe minutiga (omadussõna). Siis B2 samm: omadus kui asi ja vastand ning nimisõna kääne lauses. Lase õpilasel leida artiklist neli nimisõna ja öelda, millisest omadussõnast need tulevad.'), 3, 20),
      why(teach(tag(purpose(B.gaps('046_p_forms', 'Sõbranna kirjutab oma sõbrast.', 'Otsusta, kas lause vajab omadust, asja või vastandit, ja kirjuta sulgudes olev sõna õiges vormis. Panka ei ole.', [
        'Kui Kati midagi lubab, teeb ta selle ka ära — tema [usaldusväärsus] on mulle kõige tähtsam. (usaldusväärne)',
        'Ta ei ole kunagi unustanud mu sünnipäeva; selline [tähelepanelikkus] on haruldane. (tähelepanelik)',
        'Ainult järjekorras on ta natuke [kannatamatu]: viis minutit ootamist ja ta hakkab närveerima. (kannatama)',
        'Kui keegi tema kohta valesid levitas, tegi selline [ebaaus] käitumine talle väga haiget. (aus)',
        'Ta ei jäta kunagi koera kuuma autosse, sest ta ei ole [hoolimatu] inimene. (hoolima)',
        'Ma hindan väga tema [ausust], kuigi vahel võiks ta midagi ka ütlemata jätta. (aus)',
        'Uues linnas tundis ta end esimesel aastal väga [üksildasena]. (üksildane)',
        'Ma imestan tema [kannatlikkuse] üle: ta seletas mu vanaemale kolm korda, kuidas videokõnet teha. (kannatlik)',
        'Tema [otsekohesus] ehmatab alguses mõnda inimest, aga hiljem hinnatakse seda. (otsekohene)',
        'Kui ta haiglas oli, tundis ta end esimest korda elus täiesti [abituna]. (abi; kellena?)',
      ], '', 'full', 'g_notice'), 'Täpne sõna teeb kirjelduse usaldusväärseks: ütled, milline inimene on ja mida sa temas hindad.'), { task: 'G09' }),
      'Pärast iga rida küsi: „Kas siin on omadus, asi või vastand?” Read 6 ja 8: tegusõna nõuab käänet (hindama + osastav, imestama + üle). Lisa küsimus: „Kas sinul on mõni neist omadustest? Too näide.”'), [
        'Lause vajab asja (tema …): usaldusväärne → usaldusväärsus.',
        'selline + nimisõna: -lik → -likkus (kaks k-d): tähelepanelikkus.',
        'Mõte on vastupidine (hakkab närveerima): kannatama → kannatamatu.',
        'Käitumine oli vale: aus → ebaaus (vastand eesliitega eba-).',
        'ei ole + vastupidine omadus: hoolima → hoolimatu.',
        'hindama + osastav: ausus → ausust.',
        'tundis end + kellena: üksildane → üksildasena.',
        'imestama + omastav + üle: kannatlikkuse üle.',
        'Tema + asi lause alguses: otsekohene → otsekohesus.',
        'abi → abitu (ilma abita); tundis end + kellena (olev kääne) → abituna.',
      ]),
      why(purpose(B.formtext('046_p_ref', 'Soovitus loomade varjupaigale.', 'Sõber soovitab Marekit varjupaiga vabatahtlikuks. Kirjuta lünka üks sõna või vorm (vihje sulgudes). Panka ei ole.', 'Soovitus: Marek vabatahtlikuks', [
        'Tere! Kirjutan seoses Mareki sooviga hakata teie varjupaigas vabatahtlikuks. Tunnen teda kuus aastat ja võin tema [usaldusväärsust] (usaldusväärne; osastav) kinnitada.',
        '',
        'Mareki suurim tugevus on [kannatlikkus] (kannatlik). Kui mu koer pärast operatsiooni süüa ei tahtnud, istus ta tunde tema juures. Sellist [hoolivust] (hooliv; osastav) näeb harva.',
        '',
        'Ta on ka väga [otsekohene] (otsekohesus → omadussõna): kui midagi on valesti, ütleb ta seda kohe, aga rahulikult. Tema [ausus] (aus; asi) on mulle alati tähtis olnud.',
        '',
        'Ausalt öeldes on ta vahel natuke [ebakindel] (kindel; vastand), kui peab võõrastega rääkima. Samas ei ole ta kunagi [ebaviisakas] (viisakas; vastand) ja harjub kiiresti.',
        '',
        'Ta ei ole kunagi [hoolimatu] (hoolima; vastand) loomade ega inimeste vastu. Imestan tihti tema [rahulikkuse] (rahulik; … üle) üle.',
        '',
        'Soovitan Marekit soojalt. Olen kindel, et tema [abivalmidus] (abivalmis; asi) tuleb teie loomadele kasuks.',
      ]), 'Samamoodi kirjutad kodus soovituse oma sõbrale: omadus, tegu ja ausalt üks nõrk külg.'), [
        'kinnitama + osastav: usaldusväärsus → usaldusväärsust.',
        'Tugevus on + asi: -lik → -likkus: kannatlikkus.',
        'Sellist + osastav: hoolivus → hoolivust.',
        'Ta on + omadus: otsekohene.',
        'Tema + asi: aus → ausus.',
        'Vastand eesliitega eba-: ebakindel.',
        'Vastand eesliitega eba-: ebaviisakas.',
        'Vastand -matu: hoolima → hoolimatu.',
        'imestama + omastav + üle: rahulikkuse.',
        'abivalmis → abivalmidus.',
      ]),
      why(purpose(tag(B.table('046_p_register', 'Sõnum sõbrale või soovituskiri?', 'Vasakul on sõnum sõbrale, paremal sama mõte soovituskirjas võõrale inimesele. Kirjuta lünka puuduv sõna.', 'Sõnum sõbrale, Soovituskiri', [
        'Kati on super! | Kati on [usaldusväärne] ja hooliv inimene.',
        'Tunnen teda juba ülikoolist. | Oleme Katiga [tuttavad] ülikooli ajast, juba kaheksa aastat.',
        'Ta maksab alati õigel ajal. | Ta täidab oma rahalised [kohustused] alati õigel ajal.',
        'Ta on vahel natuke kärsitu. | Mõnikord võib ta olla veidi [kannatamatu], kuid ta ütleb seda ise välja.',
        'Ta ei valeta kunagi. | Tema [ausus] on minu jaoks väljaspool kahtlust.',
        'Kui midagi on viltu, ütleb ta otse. | Probleemide korral [pöördub] ta kohe otse asjaosalise poole.',
        'Võtke ta julgelt! | [Soovitan] teda teile soojalt.',
        'Helista, kui tahad rohkem teada. | Lisateabe saamiseks võite minuga [ühendust] võtta.',
      ], 'g_notice'), { task: 'W12' }), 'Tead, kuidas sõber kõlab kirjas, mida loeb võõras inimene, kes peab otsustama.'), [
        'super → usaldusväärne (kirjeldav omadus).',
        'tunnen → oleme tuttavad (mitmus).',
        'maksab → täidab oma kohustused.',
        'kärsitu → kannatamatu.',
        'ei valeta → tema ausus.',
        'ütleb otse → pöördub otse asjaosalise poole.',
        'Võtke ta → soovitan teda.',
        'Helista → võite minuga ühendust võtta.',
      ]),
    ],
    transfer: [
      station(purpose(B.planning('046_t_plan', 'Soovitus: plaan (3 minutit).', 'Tuttava 74-aastane ema annab Tartus oma korteris ühe toa üürile ja sinu sõber (päris või väljamõeldud) kandideerib. Emal on kolm küsimust: kas üürnik maksab õigel ajal, kas ta on vaikne ja kas temaga saab rääkida, kui midagi on valesti. Kui ei taha rääkida päris inimesest, kasuta Kati tegusid: maksab arved kuu esimesel päeval; aitas sul kolida ja tõi kõigile suppi; helistab sinu emale sünnipäeval; ütleb otse, kui talle midagi ei meeldi; jääb vahel hiljaks, aga annab alati ette teada. Kirjuta märksõnad. Edukriteeriumid: 1) kolm omadust, igaüks koos teoga; 2) vähemalt kolm nimisõna või vastandit (usaldusväärsus, kannatamatu …); 3) üks nõrk külg pehmelt ja selge soovitus.', ['Omadus 1 ja tegu, mis seda tõendab:', 'Omadus 2 ja tegu:', 'Omadus 3 ja tegu:', 'Nõrk külg pehmelt ja minu soovitus:'], 1), 'Plaan aitab sul tõendada iga omadust teoga, mitte ainult kiita.'), 4, 25, { final: 'present' }),
      teach(tag(purpose(B.rolecards('046_t_call', 'Kohtu tuttavaga: soovita oma sõpra (6–8 minutit).', 'Räägi tuttavale kohvikus oma sõbrast nii, et tema ema saaks otsustada: iga omadus koos teoga. Reageeri, kui ta ütleb midagi, mida sa ei teadnud.',
        'Olukord: sinu sõber tahab üürida tuba 74-aastaselt prouale; sinu tuttav on proua tütar.\nSinu eesmärk: vasta ema kolmele küsimusele, iga omadus koos teoga, ja anna selge soovitus.\nPiirang: ole aus — nimeta ka üks nõrk külg, aga pehmelt.',
        'Tuttava kaart on õpetajal: ema kahtlused ja üks asi, mida sa veel ei tea.',
        ['Ta on väga usaldusväärne: näiteks kord …', 'Ausalt öeldes on ta vahel natuke …, aga …'], ['Kuidas sa seda tead?', 'Kas tal on mõni halb harjumus?']), 'Tulemus: ema teab, kas ta võib sinu sõpra usaldada.'), { task: 'S11', main: true, level: 4 }),
      'Õpetaja kaart: sina oled proua tütar. Ütle ainult seda, mida küsitakse. Takistused ükshaaval: 1) „Kõik ütlevad oma sõbra kohta head. Too näide!” 2) „Kas tal on mõni halb harjumus?” Varjatud info (ütle pärast teist takistust): „Ah jaa — emal on kaks kassi ja ta sõidab kevadel kuuks ajaks sanatooriumi. Üürnik peaks siis kasside eest hoolitsema.” Õpilane peab reageerima ausalt: kas sõber armastab loomi, kas tal on allergia, kas ta on kodus; vajadusel ütleb, et küsib sõbralt üle, mitte ei luba tema eest. Õnnestunud, kui õpilane nimetab kolm omadust koos teoga, ütleb ühe nõrga külje pehmelt (vahel natuke …, aga …), kasutab vähemalt kolm nimisõna või vastandit (usaldusväärsus, kannatamatu, hoolimatu) ja annab selge soovituse. Seejärel üks tugevus ja üks parandus.'),
      tag(homeTask(homeLines(purpose(B.examWriting('046_t_mail', 'Kodus: soovituskiri (umbes 140 sõna).', `Kirjuta 130–150 sõna. Pöördumist ja algust ei anta. ${VOICE_HOME}`, 'kiri', {
        situation: 'Proua palus kirjalikku soovitust: ta tahab seda rahulikult lugeda, enne kui otsustab, kas annab toa sinu sõbrale.',
        points: ['kes sa oled ja kui kaua sõpra tunned', 'tema kolm omadust, igaüks koos teoga', 'üks nõrk külg ausalt, aga pehmelt', 'sinu soovitus ja kuidas sinuga ühendust võtta'],
        words: [130, 150],
      }), 'Proua loeb sinu kirja ja otsustab, kas annab toa sinu sõbrale.'), 6)), { task: 'W08', main: true, level: 4 }),
      writingRubric('046_t_rubric', 'Hindamisjuhend: soovituskiri (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 140 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Kati on minu sõber. Ta on hea ja aus ja tore. Ta on väga hea inimene. Ta maksab raha. Ta ei ole lärmakas. Ma soovitan teda. Ta on super. Tervitades!” Hinnang: ülesanne 2 (soovitus on olemas, kuid tegusid ei ole, ei selgu, kes kirjutab ja kui kaua sõpra tunneb; nõrk külg puudub), ülesehitus 2 (järjekord on selge, lõike ja sidendeid ei ole), sõnavara 2 („hea”, „tore”, „super” ei kirjelda iseloomu; puuduvad usaldusväärsus, hoolivus, kohustused), grammatika 1 (ainult lihtlaused; „maksab raha” → maksab üüri õigel ajal; ühtegi nimisõna ega vastandit pole). Kui õppija lisab iga omaduse juurde teo, ühe pehme nõrga külje ja tutvustuse, saab ta 9/12 (75 %).', true),
      exitCheck(purpose(B.selfcheck('046_t_self', ['Ma loen artiklit sõprusest ja üksildusest ning järeldan autori hoiaku.', 'Ma moodustan omadussõnast nimisõna ja vastandi: ausus, sõbralikkus, ebaaus, hoolimatu, abitu.', 'Ma soovitan sõpra tegude kaudu ja reageerin ootamatule küsimusele ausalt.'], 'Sõber soovitatud', 'Ma oskan sõpra soovitada'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.')),
      retire('046_t_chat', CUT_INPUT),
      retire('046_t_card', 'second input: Kati\'s deeds are now on the plan card 046_t_plan (v5: one input per lesson, ≤ 5 blocks on Kasuta)'),
      retire('046_t_more', CUT_EXTRA),
      retire('046_t_exit', CUT_DRILL),
      retire('046_t_letter', CUT_OLDTASK),
      retire('046_t_home', CUT_HOME),
      retire('046_t_homework', CUT_HOME),
    ],
  },

  'b1b2-047': {
    title: 'Sõber ei maksa 300 eurot tagasi — kuidas sellest rääkida?',
    phases: grammar('Kordamine: kuna, seetõttu · B2: pettusin temas, solvus minu peale, häbeneb võlga; ei vastanudki, isegi'),
    format: 'case',
    topic: 'money',
    canDo: 'Ma saan aru raadiosaatest rahast ja sõprusest, ütlen oma tunde täpselt, arutlen kaartidega ja kirjutan sõbrale umbes 140-sõnalise kirja.',
    teacherPage: {
      goal: 'Радио «Raha ja sõprus» (2 голоса): чувства кредитора и должника; чувство с падежом и -ki/-gi; спор с карточками и скрытой информацией; дома письмо другу 140 слов.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: утверждение (3 мин); радио — один раз и вопросы 1–7; станция 3 — правило и 10 предложений; спор без истории учителя.',
      hook: '«Väide: sõbrale ei tohi kunagi raha laenata.» Ученик сразу говорит, согласен ли, и одну причину, потом минуту — своя, знакомая или выдуманная история. Без фраз, не исправляйте. Не спрашивайте о суммах и долгах самого ученика. Отметьте, как ученик называет чувства (pettunud, solvunud …) — это тема станции 3.',
      plan: [
        '0–5: станция 1 — утверждение и одна минута, без фраз',
        '5–25: станция 2 — 10 слов (2 мин), схема «я-сообщение вместо упрёка» и картинка (3 мин), радио дважды (9 мин), 10 вопросов, из них 3 на вывод (6 мин)',
        '25–45: станция 3 — kuna / seetõttu / mistõttu одной строкой, B2: чувство с падежом (pettuma kelleski, solvuma kelle peale, häbenema mida, mures mille pärast) и -ki / -gi; 10 предложений, пост на форуме с 10 пропусками без банка, регистр (8 строк): упрёк → я-сообщение',
        '45–70: станция 4 — план аргументов (3 мин), спор с карточками ключевых слов ≤ 4 мин со скрытой информацией, разбор по трём критериям',
        '70–75: выход: три критерия и «Ma oskan …»; домашнее задание: письмо другу 140 слов без готового начала и голосовое 1 мин',
        'Kui aega jääb (75–90): ролевая игра — вежливо сказать «нет» знакомому, который просит 500 евро на телефон (вы уговариваете три раза)',
      ],
      sources: 'Радио «Raha ja sõprus» — учебный текст KeeleSepp (ведущий Margus и психолог Triin вымышлены), без статистики. Общая основа: договор займа можно заключить устно (võlaõigusseadus § 11), но юристы советуют крупную сумму фиксировать письменно — сумма, сроки, график; совет «одалживать столько, сколько готов потерять» — общая рекомендация финансовых консультантов. Друг с долгом 300 € и брат с долгом 500 € — учебные.',
      groups: 'Утверждение — каждый сам. Радио — каждый сам, вопросы на вывод сравнивают в паре. Станция 4: пары «за» и «против» с карточками A и B; потом смена сторон. В 1:1 вы берёте сторону, которую ученик не выбрал.',
      errors: [
        '«Ma pettusin temale» → «Ma pettusin temas» (pettuma kelleski — в ком).',
        '«Ta solvus minule» → «Ta solvus minu peale» (solvuma kelle peale — на кого).',
        '«Ta ei tulnudgi» → «Ta ei tulnudki» (после k, p, t, g, b, d, s, h — -ki; после гласных и l, m, n, r, v, j — -gi: keegi, temagi).',
        '«Keegi teab» в значении «никто не знает» → «Mitte keegi ei tea» (в отрицании нужно ei).',
      ],
      notes: [
        'Формат — случай: письмо слушателя на радио (300 евро, три месяца, друг молчит). Ученик решает, на чьей он стороне в споре и что напишет другу. Всегда есть вариант «знакомая история» или выдуманная.',
        'kuna / seetõttu / mistõttu (модули 7–9) — повтор одной строкой. Цель B2 — чувство с управлением (pettuma kelleski, solvuma kelle peale, häbenema mida, kahetsema mida, muretsema mille pärast, tänulik millegi eest) и усиление -ki / -gi. Это язык я-сообщения: сказать, что чувствую и почему, не обвиняя.',
        'Обратная связь, 2–3 цели: управление глагола чувства; я-сообщение вместо упрёка («Ma olin pettunud, kui …» вместо «Sa oled valetaja»); -ki / -gi. В споре не перебивать, три замечания в конце.',
      ],
    },
    discover: [
      station(inLesson(teach(tag(purpose(B.speaking('047_d_talk', 'Väide: sõbrale ei tohi kunagi raha laenata.', `Ütle kohe, kas oled nõus, ja üks põhjus. Siis räägi minut: kas oled raha laenanud ja kuidas see lõppes. ${OWN_OR_INVENTED}`, [
        'Väide: „Sõbrale ei tohi kunagi raha laenata.” Kas oled nõus? Miks?',
        'Mis juhtus, kui sina või keegi tuttav laenas sõbrale raha? Mida tundis see, kes andis, ja mida see, kes võttis?',
      ], [60, 90]), 'Sinu enda kogemus näitab, mida sa juba tead ja mida raadiost veel kuuled.'), { task: 'S07', fluency: true }),
      'Üks-ühele: vasta ka ise ühe lausega (lugu võib olla väljamõeldud). Ära küsi õpilase päris summasid. Pane kirja, milliseid tunde nimetavaid sõnu õpilane kasutab (pettunud, solvunud, piinlik) — need tulevad jaamas 3 tagasi.')), 1, 5),
      station(tag(B.vocab('047_d_vocab', 'Tunni sõnad.', ['laenama — одалживать (давать или брать в долг)', 'võlg — долг', 'osade kaupa maksma — платить частями', 'pettuma (kelleski) — разочароваться (в ком)', 'solvuma (kelle peale) — обидеться (на кого)', 'häbenema (mida) — стыдиться (чего)', 'süütunne — чувство вины', 'vältima — избегать', 'umbusaldus — недоверие', 'kahetsema (mida) — сожалеть (о чём)']), { topic: ['süütunne', 'umbusaldus', 'kahetsema'] }), 2, 20),
      purpose(B.diagram('047_d_scheme', 'formula', { title: 'Skeem: mina-sõnum etteheite asemel.', instruction: 'Kuulates kirjuta iga rea juurde psühholoogi näide. Pärast kuulamist kirjuta oma mina-sõnum ühe päris või väljamõeldud loo kohta.', nodes: 'Sündmus | Mis juhtus? Ilma hinnanguta: „Raha ei tulnud mais.”\nTunne | Mida mina tundsin? „Olin pettunud.” — mitte „Sa oled valetaja.”\nPõhjus | Miks see mulle tähtis on? „Mul endal on sel kuul suured kulud.”\nPalve | Mida ma pakun? „Kas saaksime kokku leppida osamaksed?”' }, 'full', 'g_notice'), 'Skeem näitab, kuidas öelda oma tunne nii, et teine ei pea end kaitsma.'),
      why(teach(tag(purpose(B.examListen('047_d_radio', 'Kuulamine: raadiosaade „Raha ja sõprus”.', 'Raadiosaates räägib saatejuht psühholoogiga sellest, mida teha, kui sõber ei maksa laenatud raha tagasi. Loe enne küsimused läbi. Kuula saadet kaks korda ja vali igale küsimusele õige vastus.', 'choice', [
        'Margus: Tere! Saates „Suhete tund” räägime täna rahast ja sõprusest. Stuudios on psühholoog Triin. Triin, alustame kuulaja kirjaga. Kuulaja kirjutab: „Laenasin märtsis heale sõbrale kolmsada eurot. Ta lubas maksta kuu lõpus tagasi. Nüüd on juuni, raha ei ole ja sõber ei vasta isegi mu sõnumitele. Mul on piinlik uuesti küsida. Mida ma valesti tegin?”',
        'Triin: Tere! Kõigepealt: ta ei teinud midagi valesti. Aidata sõpra on ilus. Aga ma kuulen selles kirjas mitut tunnet korraga. Ta on sõbras pettunud, sest sõber ei pidanud sõna. Ta on solvunud, sest sõber teda väldib. Ja tal on piinlik küsida raha, mis on ju tegelikult tema oma.',
        'Margus: Miks inimene, kes võlgneb, üldse vaikib? Lihtsam oleks ju öelda, et praegu ei saa.',
        'Triin: Väga sageli on põhjus häbi. Võlgnik häbeneb, et ei suuda lubadust pidada. Iga sõnum meenutab talle seda ja nii ta hakkab sõpra vältima. Ta ei vastagi, sest ei tea, mida öelda. Kõrvalt paistab see ükskõiksusena, aga seest on see sageli süütunne.',
        'Margus: Mida kuulaja siis teha võiks?',
        'Triin: Ma soovitaksin mitte kirjutada viiendat sõnumit, vaid helistada või kohtuda. Kirjas kõlab kõik teravamalt. Ja rääkida endast, mitte temast. Mitte „sa oled valetaja”, vaid „ma olin pettunud, kui raha mais ei tulnud, sest mul endal on sel kuul suured kulud”. Nii ei pea teine end kaitsma ja saab hakata lahendust otsima.',
        'Margus: Aga kui ta ikka ei maksa?',
        'Triin: Siis tasub pakkuda väiksemaid osamakseid. Kolmsada eurot korraga võib olla võimatu, aga viiskümmend eurot kuus on paljudele jõukohane. Ja kokkulepe tuleks kirja panna: summa, kuupäevad ja kuidas raha üle kantakse. See ei ole umbusaldus, vaid selgus mõlemale.',
        'Margus: Paljud kuulajad küsivad: kas sõbrale üldse tasub raha laenata?',
        'Triin: Minu rusikareegel on: laena ainult nii palju, kui oled valmis vajadusel kaotama. Kui see summa jääb tagasi saamata, ei tohiks see sinu enda elu segi paisata. Kui summa on suur, on aus öelda ei ja pakkuda muud abi: aega, nõu või abi töö otsimisel. Ja küsi endalt ausalt: kas ma annan selle raha laenuks või tegelikult kingituseks? Mõlemad on lubatud, aga see peab olema mõlemale selge.',
        'Margus: Ei-sõna on ju raske öelda.',
        'Triin: On küll. Aga ei saab öelda soojalt. Näiteks: „Ma hoolin sinust, seepärast ma ei laena raha. Ma ei taha, et raha meie vahele tuleks.” Paljud sõprused ei lõpe mitte sellepärast, et keegi ütles ei, vaid sellepärast, et keegi ütles jah ja hiljem vaikis.',
        'Margus: Kuulaja kirjutas ka, et nägi sotsiaalmeedias pilte, kus sõber oli kontserdil. See tegi talle eriti haiget.',
        'Triin: Seda ma usun. Aga pilt ei näita kogu lugu. Pilet võis olla kingitus, sõber võis olla kaotanud töö ja seda häbeneda. Ma ei ütle, et see on vabandus. Aga enne kui teha järeldus, tasub küsida. Küsimus „Kuidas sul läheb?” avab ukse paremini kui „Kus mu raha on?”.',
        'Margus: Ja kui sõprus on juba katki?',
        'Triin: Siis tuleb otsustada, kumb on tähtsam: raha või suhe. Mõnikord on mõistlik summa unustada ja sõprus päästa. Mõnikord on vastupidi. Aga see peaks olema sinu teadlik otsus, mitte vaikiv solvumine, mis kestab aastaid.',
        'Margus: Aitäh, Triin!',
      ], [
        ['Mida kuulaja oma kirjas küsib?', 'mida ta valesti tegi', 'kuidas raha kiiremini teenida', 'kas ta peaks pöörduma politsei poole'],
        ['Milliseid tundeid kuuleb Triin kuulaja kirjas?', 'pettumust, solvumist ja piinlikkust', 'viha ja kadedust', 'hirmu ja kergendust'],
        ['Miks võlgnik Triini sõnul sageli vaikib?', 'ta häbeneb, et ei suuda lubadust pidada', 'ta on raha juba unustanud', 'ta tahab sõbrale kätte maksta'],
        ['Mida soovitab Triin teha viienda sõnumi asemel?', 'helistada või kohtuda', 'kirjutada pikem kiri', 'oodata veel kolm kuud'],
        ['Kuidas peaks kuulaja Triini järgi oma murest rääkima?', 'endast: mida ta tundis ja miks', 'sõbra vigadest', 'ühiste tuttavate kaudu'],
        ['Mida pakub Triin, kui sõber ei suuda kogu summat korraga maksta?', 'väiksemaid igakuiseid osamakseid', 'uut, suuremat laenu', 'et kuulaja võtaks ise pangalaenu'],
        ['Milline on Triini rusikareegel laenamise kohta?', 'laena ainult nii palju, kui oled valmis kaotama', 'ära laena kunagi kellelegi', 'laena ainult pereliikmetele'],
        ['Mida tahab Triin öelda lausega „See ei ole umbusaldus, vaid selgus mõlemale”? Järelda.', 'kirjalik kokkulepe kaitseb ka sõprust, sest hiljem pole vaja vaielda, mida lubati', 'kuulaja ei usalda enam oma sõpra', 'ilma lepinguta ei saa raha üldse tagasi nõuda'],
        ['Mida võib järeldada Triini lausest, et sõprus lõpeb sageli siis, kui keegi ütles jah ja hiljem vaikis?', 'vaikimine kahjustab sõprust rohkem kui aus ei', 'jah-sõna on alati vale', 'ei-sõna lõpetab iga sõpruse'],
        ['Milline on Triini hoiak saate lõpus?', 'inimene peaks ise teadlikult otsustama, kas tähtsam on raha või suhe', 'raha tuleb alati tagasi nõuda', 'sõprus on alati rahast tähtsam'],
      ], 'g_listen'), 'Kuuled mõlema poole tundeid; kohe arutled, kas sõbrale tasub laenata.'), { voice: 'interview', task: 'L02', harno: 'L2' }),
      'Kuulamine, 20 minutit koos sõnade ja skeemiga (umbes 4 minutit, kaks korda). Enne kuulamist küsi: mida tunneb see, kes ootab oma raha, ja mida see, kes võlgneb? Õpilane loeb küsimused ja joonib alla võtmesõnad. Pärast: õpilane täidab skeemi psühholoogi näidetega. Küsimused 8–10 on järeldusküsimused (psühholoogi hoiak): nõua põhjendust kuuldust. Saade on õppetekst, inimesed on välja mõeldud.'), [
        'Kuulaja: „Mida ma valesti tegin?”',
        'Triin: ta on „sõbras pettunud”, „solvunud” ja tal on „piinlik küsida”.',
        'Triin: „Võlgnik häbeneb, et ei suuda lubadust pidada.”',
        'Triin: „mitte kirjutada viiendat sõnumit, vaid helistada või kohtuda”.',
        'Triin: „rääkida endast, mitte temast”.',
        'Triin: „viiskümmend eurot kuus on paljudele jõukohane”.',
        'Triin: „laena ainult nii palju, kui oled valmis vajadusel kaotama”.',
        'Järeldus: summa, kuupäevad ja ülekanne on kirjas — kumbki ei pea hiljem meenutama ega vaidlema.',
        'Järeldus: sõprus lõpeb, kui „keegi ütles jah ja hiljem vaikis”, mitte ei-sõna pärast.',
        'Järeldus: „see peaks olema sinu teadlik otsus, mitte vaikiv solvumine”.',
      ]),
      retire('047_d_hook', CUT_HOOK),
      retire('047_d_chat', 'v4 input (a chat of 98 words, below B2): the lesson\'s one input is now the radio 047_d_radio (v5: one input per lesson)'),
      retire('047_d_feel', 'questions on the v4 chat; the lesson\'s questions are on the radio 047_d_radio (v5: one input per lesson)'),
      retire('047_d_know', CUT_KNOW),
    ],
    practice: [
      station(teach(B.notice('047_p_notice', 'Märka: pettusin temas, solvus minu peale, ei vastanudki', [
        'Saatest: ta on **sõbras pettunud** · võlgnik **häbeneb**, et … · Ta **ei vastagi**. · ei vasta **isegi** sõnumitele · Kordamine (B1): **kuna** …, **seetõttu** …, **mistõttu** …',
        'B2: **pettuma** kelleski · **solvuma** kelle peale · **häbenema** mida · **kahetsema** mida · **mures** mille pärast · **tänulik** millegi eest',
        'B2: **ei …-ki / -gi** — oodatud asi jäi tulemata (ei vastanud**ki**) · **isegi** / **-gi** · k, p, t, g, b, d, s, h järel **-ki**, muidu **-gi** · **mitte keegi / midagi / kunagi** + ei',
      ], 'full'), 'Kordamine ühe minutiga (kuna, seetõttu, mistõttu). Siis B2 samm: tunde sõna nõuab oma käänet ja -ki / -gi annab rõhu. Lase õpilasel leida saatest kolm tunnet ja öelda küsimus: kelles? kelle peale? mida?'), 3, 20),
      why(teach(tag(purpose(B.transformation('047_p_ki', 'Ütle tunne täpselt.', 'Ütle iga mõte antud sõnadega. Mõtle, millist käänet tunde sõna nõuab. Panka ei ole.', [
        ['Ma ootasin raha mais. Raha ei tulnud.', 'ei …-ki', 'Ma ootasin raha mais, aga see ei tulnudki.|Ma ootasin raha mais, aga raha ei tulnudki.'],
        ['Ta ei helistanud mulle. Ta ei helistanud ka minu sünnipäeval.', 'isegi', 'Ta ei helistanud mulle isegi minu sünnipäeval.|Ta ei helistanud isegi minu sünnipäeval.'],
        ['Ma ei ole sellest ühelegi inimesele rääkinud.', 'mitte kellelegi', 'Ma ei ole sellest mitte kellelegi rääkinud.|Ma pole sellest mitte kellelegi rääkinud.'],
        ['Sõber valetas mulle ja nüüd ma ei usalda teda enam.', 'Ma pettusin …', 'Ma pettusin oma sõbras.|Ma pettusin sõbras.'],
        ['Ta on minu peale pahane, sest ma ütlesin ei.', 'solvus', 'Ta solvus minu peale, sest ma ütlesin ei.|Ta solvus mu peale, sest ma ütlesin ei.'],
        ['Igoril on oma võla pärast piinlik.', 'häbeneb', 'Igor häbeneb oma võlga.'],
        ['Ma muretsen, sest sõbra töökoht on ohus.', 'olen mures … pärast', 'Ma olen mures sõbra töökoha pärast.|Olen mures sõbra töökoha pärast.'],
        ['Sa aitasid mind kolimisel. Aitäh!', 'Olen sulle tänulik …', 'Olen sulle tänulik abi eest.|Olen sulle tänulik kolimisabi eest.|Olen sulle tänulik selle eest, et sa mind kolimisel aitasid.|Olen sulle tänulik, et sa mind kolimisel aitasid.'],
        ['Mul oli piinlik uuesti küsida. Ma ei kirjutanud kuu aega.', 'seetõttu', 'Mul oli piinlik uuesti küsida, seetõttu ei kirjutanud ma kuu aega.|Mul oli piinlik uuesti küsida. Seetõttu ei kirjutanud ma kuu aega.'],
        ['Ma ei saanud raha tagasi. Ma pidin hambaarsti edasi lükkama.', 'mistõttu', 'Ma ei saanud raha tagasi, mistõttu pidin hambaarsti edasi lükkama.|Ma ei saanud raha tagasi, mistõttu pidin ma hambaarsti edasi lükkama.'],
      ], 'full', 'g_notice'), 'Kui tunne on täpne ja kääne õige, saab sõber aru, mida sa tundsid, ilma et ta end rünnatuna tunneks.'), { task: 'G05' }),
      'Pärast iga rida küsi: „Mis tunne siin on ja mis on põhjus?” Rida 9: pärast seetõttu on tegusõna kohe teine (seetõttu ei kirjutanud ma). Read 4–8: küsi tunde sõna küsimus (kelles? kelle peale? mida? mille pärast? mille eest?).'), [
        'Oodatud asi jäi tulemata → ei + -nud + -ki: ei tulnudki (d järel -ki).',
        'Ootamatu rõhk → isegi enne seda sõna, mida rõhutad.',
        'Eitus kõigi kohta → mitte kellelegi + ei.',
        'pettuma kelleski → sõbras (seesütlev).',
        'solvuma kelle peale → minu peale.',
        'häbenema mida → oma võlga (osastav).',
        'mures mille pärast → töökoha pärast.',
        'tänulik millegi eest → abi eest.',
        'Pärast seetõttu on tegusõna kohe teine: seetõttu ei kirjutanud ma.',
        'Tagajärg tervele mõttele → koma ja mistõttu.',
      ]),
      why(purpose(B.formtext('047_p_post', 'Foorumi postitus: kas küsida raha tagasi?', 'Kirjuta lünka üks sõna või vorm (vihje sulgudes). Panka ei ole.', 'Laenasin vennale raha — mida nüüd teha?', [
        'Talvel laenasin vennale viissada eurot. Ta lubas maksta suvel, aga raha ei [tulnudki] (tulema + rõhk). Ausalt öeldes olen ma temas väga [pettunud] (pettuma; kesksõna). Ta ei helista mulle [isegi] (rõhk) jõulude ajal. Ema arvab, et olen tema [peale] (solvunud kelle …?) lihtsalt solvunud.',
        '',
        'Vend [häbeneb] (häbenema; olevik) oma võlga. [Kuna] (põhjus lause alguses) ta kaotas sügisel töö, ei suuda ta praegu maksta. Mul endal on kodulaen, [mistõttu] (tagajärg tervele mõttele) pidin puhkuse ära jätma. Kõige rohkem kahetsen ma [seda] (kahetsema mida?), et me ei pannud midagi kirja.',
        '',
        'Ma ei ole sellest [kellelegi] (kes + -gi; kellele?) peale oma naise rääkinud. Olen tänulik iga [nõuande] (nõuanne; … eest) eest.',
      ]), 'Samamoodi kirjutad kodus sõbrale: tunne, põhjus ja ettepanek, ilma etteheiteta.'), [
        'Oodatud asi jäi tulemata → ei tulnudki.',
        'olema pettunud kelleski → pettunud.',
        'Rõhk → isegi.',
        'solvunud kelle peale → tema peale.',
        'häbenema mida; olevik → häbeneb.',
        'Põhjus lause alguses → Kuna …, ei suuda ta (tegusõna kohe järel).',
        'Tagajärg tervele mõttele → mistõttu.',
        'kahetsema mida → seda, et …',
        'kes + -gi → keegi; kellele + -gi → kellelegi.',
        'tänulik millegi eest → nõuande eest (omastav).',
      ]),
      why(purpose(tag(B.table('047_p_register', 'Etteheide või mina-sõnum?', 'Vasakul on etteheide, paremal sama mõte mina-sõnumina. Kirjuta lünka puuduv sõna.', 'Etteheide, Mina-sõnum', [
        'Sa oled valetaja! | Ma olin [pettunud], kui raha mais ei tulnud.',
        'Sa ei hooli minust üldse. | Mulle tegi [haiget], et sa mu sõnumitele ei vastanud.',
        'Sa unustad alati kõik! | Ma [muretsen], et me unustame oma kokkuleppe.',
        'Maksa kohe ära! | Kas me [saaksime] maksed kokku leppida?',
        'Sinu pärast jäin hambaarstist ilma. | Mul on sel kuul suured [kulud], seetõttu vajan raha.',
        'Sa käid kontserdil, aga mulle ei maksa! | Mind [häirib], et meie kokkulepe on lahtine.',
        'Sinuga ei saa üldse rääkida. | Ma [tahaksin] sinuga rahulikult rääkida.',
        'Kõik teavad, et sa oled selline! | Ma ei ole sellest [kellelegi] rääkinud.',
      ], 'g_notice'), { task: 'W12' }), 'Tead, kuidas sama mure kõlab nii, et sõber jääb sõbraks.'), [
        'Valetaja → mina-tunne: olin pettunud.',
        'Ei hooli → mulle tegi haiget.',
        'Unustad alati → ma muretsen.',
        'Käsk → tingiv küsimus: kas me saaksime.',
        'Sinu pärast → minu olukord: mul on suured kulud.',
        'Süüdistus → mind häirib, kui …',
        'Ei saa rääkida → ma tahaksin rääkida.',
        'Kõik teavad → ma ei ole kellelegi rääkinud (-gi + eitus).',
      ]),
    ],
    transfer: [
      station(purpose(B.planning('047_t_plan', 'Arutelu: argumentide plaan (3 minutit).', 'Teema: kas sõbrale tasub raha laenata? Vali pool: poolt või vastu. Kirjuta märksõnad. Edukriteeriumid: 1) kaks argumenti, igaühel näide raadiosaatest või elust; 2) vähemalt kaks tunnet õige käändega (pettunud kelleski, solvunud kelle peale, häbeneb mida) ja üks -ki / -gi vorm; 3) vastad partneri argumendile ja jõuate lõpus ühise seisukohani või ütled selgelt, milles jäite eri meelt.', ['Minu pool ja esimene lause (30 sekundit):', 'Argument 1 ja näide:', 'Argument 2 ja näide:', 'Mida vastan, kui partner ütleb …:'], 1), 'Plaan aitab sul rääkida argumentidega, mitte ainult tundega.'), 4, 25, { final: 'decide' }),
      teach(tag(purpose(B.rolecards('047_t_talk', 'Arutelu märksõnakaartidega (kuni 4 minutit).', 'Öelge kõigepealt kumbki 30 sekundiga oma arvamus. Siis arutage kaartide ja oma näidetega. Reageeri, kui partner toob uue loo. Lõpus jõudke ühise seisukohani või öelge, milles jäite eri meelt.',
        'Kaart A (poolt): märksõnad, ehita neist ise argument ja too näide. 1) häda — tõeline sõber; 2) kirjalik kokkulepe — selgus; 3) väike summa — kingitus.',
        'Kaart B (vastu): märksõnad, ehita neist ise argument ja too näide. 1) võlg — häbi, vältimine; 2) raha — sõpruse vahel; 3) muu abi — aeg, nõu.',
        ['Ühelt poolt …', 'Ma olin kord pettunud, kui …'], ['Ma ei ole päris nõus, sest …', 'Kas võiksime kokku leppida, et …?']), 'Tulemus: selge seisukoht kahe argumendi ja näitega ning kokkulepe või ausalt nimetatud lahkarvamus.'), { task: 'S17', main: true, level: 4 }),
      'Õpetaja võtab poole, mida õppija ei valinud. Kuula 30 sekundit vahele segamata, siis arutle. Varjatud info (ütle arutelu keskel). Kui õppija on poolt: „Mul on oma lugu: laenasin vennale tuhat eurot. Ta ei maksnudki tagasi ja me ei ole kolm aastat rääkinud.” Kui õppija on vastu: „Mul on oma lugu: kui ma kaotasin töö, laenas sõber mulle üüriraha. Ilma temata oleksin korterist ilma jäänud — ja ma maksin kõik tagasi.” Õppija peab reageerima: küsima täpsustust, näitama, et mõistab tunnet (Ma saan aru, et sa olid oma vennas pettunud …), ja kaaluma oma seisukohta (näiteks laenata ainult summat, mida oled valmis kaotama, ja kirjaliku kokkuleppega). Õnnestunud, kui õppija toob kaks argumenti näitega, kasutab vähemalt kaks tunnet õige käändega ja ühe -ki / -gi vormi, vastab partneri loole ja jõuate kokkuleppele või nimetab selgelt, mis jäi lahti. Seejärel üks tugevus ja üks parandus.'),
      tag(homeTask(homeLines(purpose(B.examWriting('047_t_mail', 'Kodus: kiri sõbrale (umbes 140 sõna).', `Kirjuta 130–150 sõna. Pöördumist ja algust ei anta. ${VOICE_HOME}`, 'kiri', {
        situation: 'Laenasid märtsis heale sõbrale 300 eurot. Ta lubas maksta kuu lõpus, kuid nüüd on juuni ja ta ei vasta sinu sõnumitele. Kirjuta talle kiri, mis hoiab nii raha kui ka sõprust. Võid kirjutada ka väljamõeldud sõbrale.',
        points: ['mida sa tundsid ja miks (mina-sõnum, mitte etteheide)', 'et mõistad, miks ta võib vaikida', 'konkreetne ettepanek: osamaksed, summad ja kuupäevad', 'kuidas te edaspidi suhtlete ja miks sõprus on sulle tähtis'],
        words: [130, 150],
      }), 'Sõber saab kirjast aru, mida sa tunned, ja teab täpselt, mida sa pakud.'), 6)), { task: 'W13', main: true, level: 3 }),
      writingRubric('047_t_rubric', 'Hindamisjuhend: kiri sõbrale (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 140 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Sa ei maksnud raha tagasi. Sa oled halb sõber. Ma olen vihane sinu peal. Kõik ütlevad, et sa valetad. Maksa raha kohe ära. Muidu ma ei räägi sinuga. Tšau!” Hinnang: ülesanne 1 (raha nõutakse, kuid ettepanekut ega kuupäevi ei ole; toon on süüdistav ega hoia sõprust), ülesehitus 2 (järjekord on selge, sidendeid peaaegu ei ole), sõnavara 2 („vihane” ja „halb” on ainsad tunded; puuduvad pettunud, osamakse, kokkulepe), grammatika 2 („vihane sinu peal” → sinu peale; käsk mina-sõnumi asemel). Kui õppija kirjutab mina-sõnumi (Olin pettunud, kui …), pakub osamaksed kuupäevadega ja lõpetab sooja lausega, saab ta 9/12 (75 %).', true),
      exitCheck(purpose(B.selfcheck('047_t_self', ['Ma saan raadiosaatest aru, mida tunnevad laenaja ja võlgnik, ja järeldan psühholoogi hoiaku.', 'Ma ütlen tunde õige käändega ja rõhutan: pettusin temas, solvus minu peale, ei vastanudki, isegi.', 'Ma kaitsen arutelus oma seisukohta ja reageerin partneri loole.'], 'Arutelu peetud', 'Ma oskan rahast ja tunnetest rääkida'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.')),
      retire('047_t_voice', CUT_SHORT),
      retire('047_t_more', CUT_EXTRA),
      retire('047_t_exit', CUT_DRILL),
      retire('047_t_letter', CUT_OLDTASK),
      retire('047_t_home', CUT_HOME),
      retire('047_t_homework', CUT_HOME),
    ],
  },

  'b1b2-048': {
    title: 'Muusika kell 23 ja majagrupp keeb — kuidas tüli vahendada?',
    phases: grammar('Kordamine: ütles, et; küsis, kas · B2: palus + da, palus mitte, väitis, et … olevat; öeldi, paluti'),
    format: 'infogap',
    topic: 'neighbours',
    canDo: 'Ma loen artiklit naabritülist, annan kahe naabri sõnad erapooletult edasi ja kirjutan juhatusele umbes 180-sõnalise kokkuvõtte.',
    teacherPage: {
      goal: 'Статья «Kui majagrupp keeb»: ссора в чате дома, ночная тишина, работа посредника; косвенная речь B2; посредничество со скрытой информацией; дома резюме правлению 180 слов.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: утверждение (3 мин); статья — абзацы 1–4 и вопросы 1–5; станция 3 — правило и 10 предложений; посредничество без третьего препятствия.',
      hook: '«Väide: naabriga tuleb tüli lahendada otse, mitte majagrupis.» Ученик сразу говорит, согласен ли, и одну причину, потом минуту — какие звуки мешают ему дома и что он делал. Без фраз, не исправляйте. Отметьте, как ученик передаёт чужие слова (ta ütles, et …) — это тема станции 3.',
      plan: [
        '0–5: станция 1 — утверждение и одна минута о своём доме, без фраз',
        '5–25: станция 2 — 10 слов (2 мин), картинка и схема «пять шагов посредника» (2 мин), статья (8 мин), 7 вопросов, из них 3 на вывод (8 мин)',
        '25–45: станция 3 — ütles, et / küsis, kas одной строкой, B2: лицо, место и время, palus + da / palus, et + tingiv, palus mitte, väitis, et … olevat, öeldi / paluti; 10 сообщений для правления, протокол собрания с 10 пропусками без банка, бюллетень правления: 8 нейтральных предложений из банка (Harno R4), лишнее — злое сообщение из чата',
        '45–70: станция 4 — план с сообщением Людмилы (3 мин), посредничество: вы — сосед сверху, потом Людмила (8 мин), разбор по трём критериям',
        '70–75: выход: три критерия и «Ma oskan …»; домашнее задание: резюме правлению 180 слов без готового начала и голосовое 1 мин',
        'Kui aega jääb (75–90): спокойное выступление на собрании дома (2 мин): что сказали обе стороны, что говорит закон, следующий шаг — без ярлыков',
      ],
      sources: 'Статья «Kui majagrupp keeb» — учебный текст KeeleSepp, без статистики. Закон: korrakaitseseadus § 56 lg 2 (Riigi Teataja) — не в общественном месте с 22.00 до 6.00, в ночь перед выходным с 0.00 до 7.00 запрещено создавать длительный или повторяющийся шум, существенно мешающий другим; часы дневного ремонта закон не задаёт, их задают правила дома (kodukord), принятые общим собранием (korteriomandi- ja korteriühistuseadus). Медсестра, Людмила, семья сверху и председатель — учебные.',
      groups: 'Утверждение — каждый сам. Статья — каждый сам, вопросы на вывод сравнивают в паре. Посредничество в группе: A — член правления, B — сосед сверху, C — Людмила (B и C сидят в разных углах). В 1:1 вы играете обоих соседей по очереди.',
      errors: [
        '«Ta ütles, et ta töötas öösiti» → «… et ta töötab öösiti» (в эстонском время при пересказе не сдвигается).',
        '«Ta küsis, kas sa saaksid» → «Ta küsis, kas ma saaksin» (меняется лицо: sa → ma, ma → ta).',
        '«Ta palus mind rääkima» → «Ta palus mul rääkida» / «Ta palus, et ma räägiksin» (palus + kellel + da).',
        '«Ta küsis, et millal» → «Ta küsis, millal …» (вопросительное слово без «et»); «Ta palus ei kirjutada» → «Ta palus mitte kirjutada».',
      ],
      notes: [
        'Формат — инфогэп: у ученика только слова Людмилы (на карточке плана); позицию соседей сверху знаете только вы. Он должен спросить, передать и вернуться — без этого задача не решается. Это и есть посредничество (CEFR B2 «mediating communication»).',
        'ütles, et / küsis, kas (модуль 7, B1) — повтор одной строкой; -vat был в модуле 7. Цель B2 — точная передача: лицо, место и время, просьба и запрет (palus + da, palus, et + tingiv, palus mitte + da), сомнение (väitis, et … olevat) и безличная передача (öeldi, paluti, lubati). Нейтральные глаголы: ütles, palus, pakkus — не karjus, nõudis.',
        'Ученику без своей квартиры: общежитие или частный дом и соседи через забор (собака, газонокосилка) — те же фразы. Ни одна сторона не «виновата»: не позволяйте ученику судить. Обратная связь, 2–3 цели: лицо и время при пересказе; kas / millal без et; нейтральный глагол.',
      ],
    },
    discover: [
      station(inLesson(teach(tag(purpose(B.speaking('048_d_talk', 'Väide: naabriga tuleb tüli lahendada otse, mitte majagrupis.', `Ütle kohe, kas oled väitega nõus, ja üks põhjus. Siis räägi umbes minut: millised helid sind kodus segavad ja mida sa oled teinud. ${OWN_OR_INVENTED}`, [
        'Väide: „Naabriga tuleb tüli lahendada otse, mitte majagrupis.” Kas oled nõus? Miks?',
        'Millised helid sind kodus segavad? Mida tegid sina või su naabrid, kui keegi oli liiga vali?',
      ], [60, 90]), 'Sinu enda kodu annab naabritülile esimese võrdluse.'), { task: 'S02', fluency: true }),
      'Üks-ühele: vasta ka ise ühe lausega. Ära paranda. Kui õpilane elab eramajas: „Mis sind naabri juures segab — koer, muruniiduk, auto?” Pane kirja, kuidas õpilane annab teiste sõnu edasi (ta ütles, et …) — see tuleb jaamas 3 tagasi.')), 1, 5),
      station(tag(B.vocab('048_d_vocab', 'Tunni sõnad.', ['öörahu — ночная тишина', 'müra — шум', 'häirima — мешать', 'kodukord — правила дома', 'korteriühistu — товарищество собственников', 'vahendaja — посредник', 'erapooletu — беспристрастный', 'edasi andma — передавать', 'leebe — мягкий', 'kohut mõistma — судить']), { topic: ['öörahu', 'kodukord', 'vahendaja', 'korteriühistu'] }), 2, 20),
      why(teach(tag(purpose(B.reading('048_d_text', 'Loe artiklit.', 'Loe artiklit (umbes 8 minutit) ja vasta küsimustele. Küsimustele 5–7 ei ole vastust tekstis sõna-sõnalt: järelda ja näita lauset, millele vastus toetub.', 'Kui majagrupp keeb', [
        'Kell on pool kaksteist öösel. Teisel korrusel elav naine, kes läheb hommikul kell kuus haiglasse tööle, kuuleb ülemisest korterist muusikat ja naeru. Ta kirjutab maja vestlusgruppi: „Kas siin majas ei ole keegi kuulnud öörahust?” Kümne minuti pärast on vestluses kakskümmend sõnumit. Üks naaber kirjutab, et noored peavadki elama, teine, et tema laps ärkas samuti üles, kolmas lisab vihase näo. Hommikuks ei räägi keegi enam muusikast, vaid sellest, kes on „tülinorija”.',
        'Korteriühistute juhatuse liikmed tunnevad seda pilti hästi. Nende sõnul ei lahene tülid vestlusgrupis, vaid kasvavad. Kirjas puudub hääletoon ja nägu, mistõttu kõlab iga lause teravamalt, kui see oli mõeldud. Mõni kirjutab vihaselt keset ööd ja kahetseb seda juba järgmisel hommikul, kuid sõnum on juba kõigil ees. Lisaks loevad sõnumeid ka need, keda asi ei puuduta, ja igaüks tunneb, et peab poole valima. Paljud majad on seepärast kokku leppinud, et vestlusgrupis jagatakse ainult teateid ja kaebusi seal ei arutata.',
        'Miks me siis üldse vestlusgrupis kirjutame, mitte ei koputa uksele? Sageli on põhjus lihtne: me kardame. Võõra inimese uksele minna on ebamugav, eriti kell pool kaksteist öösel. Kirjutada on palju lihtsam, sest teise inimese reaktsiooni ei pea kohe nägema. Lisaks loodame, et kui teised naabrid meid toetavad, on meil õigus. Kuid toetus vestlusgrupis ei lahenda muret: see teeb ühe poole tugevamaks ja teise vihasemaks.',
        'Mida ütleb seadus? Korrakaitseseaduse järgi ei tohi kella kümnest õhtul kuni kuueni hommikul tekitada kestvat või korduvat müra, mis teisi oluliselt häirib. Puhkepäevale eelneval ööl algab öörahu keskööl ja kestab seitsmeni. Päevase remondi kellaaegu seadus ei määra; need lepitakse kokku maja kodukorras. Seadus on aga viimane abinõu. Enamasti saab asja lahendada ilma politseita, kui inimesed räägivad omavahel õigel ajal ja õigel viisil.',
        'Kogenud vahendajad teevad seda mitmes sammus. Kõigepealt räägivad nad kummagi naabriga eraldi ja kuulavad. Seejärel annavad nad ühe naabri sõnad teisele edasi nii täpselt ja erapooletult kui võimalik: „Naaber ütles, et ta töötab öösiti, ja palus, et reedeti pandaks muusika kümneks vaiksemaks.” Vahendaja ei ütle „ta karjus” ega „ta nõudis”, vaid „ta ütles” ja „ta palus”. Ta ei mõista kohut ega otsusta, kellel on õigus. Kui üks pool ei ole veel valmis teisega kohtuma, viib vahendaja sõnu edasi seni, kuni mõlemad on nõus koos laua taha istuma.',
        'Sageli selgub vahendamisel midagi, mida teine pool ei teadnud. Ülemise korteri pere ei teadnud, et naaber magab päeval; naaber ei teadnud, et reedene pidu oli isa juubel ja juhtus kord aastas. Kui inimene saab teada teise põhjused, muutub ta tavaliselt leebemaks. Üks juhatuse esimees ütleb, et pooled tülid lõpevad juba siis, kui keegi küsib: „Mis teil tegelikult juhtus?” Ühine kohtumine toimub neutraalses kohas, näiteks maja koosolekuruumis või hoovis, mitte kellegi köögis, kus teine tunneks end külalisena.',
        'Hea kokkulepe on konkreetne: mis kell, mis päevadel ja kes kellele helistab, kui midagi juhtub. „Edaspidi oleme vaiksemad” ei ole kokkulepe. „Remonti teeme tööpäeviti kella kaheteistkümnest kuueni ja enne pidu paneme trepikotta teate” on. Kokkulepe tasub kirja panna ja trepikotta üles riputada, et ka uued elanikud seda teaksid. Ja veel üks lihtne reegel, mida juhatuse liikmed korrutavad: kõigepealt koputa uksele, alles siis kirjuta gruppi.',
        'Allikas: KeeleSepp õppetekst.',
      ].join('\n\n'), [
        ['Millest räägitakse vestlusgrupis hommikuks?', 'mitte enam muusikast, vaid sellest, kes on tülinorija'],
        ['Miks kõlab vestlusgrupis iga lause teravamalt, kui see oli mõeldud?', 'kirjas puudub hääletoon ja nägu'],
        ['Mis kell algab öörahu ööl vastu puhkepäeva ja millal see lõpeb?', 'keskööl ja kestab kella seitsmeni'],
        ['Kes määrab päevase remondi kellaajad?', 'maja ise oma kodukorras; seadus neid ei määra'],
        ['Miks kasutab vahendaja sõnu „ütles” ja „palus”, mitte „karjus” ja „nõudis”? Järelda.', 'et jääda erapooletuks: neutraalne tegusõna ei pane teist poolt end kaitsma ega tüli kasvama'],
        ['Miks lõpevad esimehe sõnul pooled tülid juba küsimusega „Mis teil tegelikult juhtus?”? Järelda.', 'inimene saab teada teise põhjused (öötöö, juubel) ja muutub leebemaks'],
        ['Milline on autori hoiak vestlusgrupi ja otse rääkimise kohta? Mida ta vihjab viimase lausega?', 'otse rääkimine lahendab tüli paremini kui grupp; enne kirjutamist tuleks naabriga silmast silma rääkida'],
      ]), 'Pärast lugemist tead, miks tüli majagrupis kasvab ja mida vahendaja teeb; kohe vahendad ise.'), { task: 'R15', voice: 'expert' }),
      'Lugemine, 20 minutit koos sõnade, pildi ja skeemiga. Enne lugemist küsi: mis juhtub sinu arvates majagrupis kümne minutiga? Küsimused 5–7 on järeldusküsimused: nõua lauset, millele vastus toetub. Seaduse kellaajad on lihtsustatud; ära anna õigusnõu („küsi juhatuselt või vaata Riigi Teatajast”).'), [
        '1. lõik: „Hommikuks ei räägi keegi enam muusikast, vaid sellest, kes on „tülinorija”.”',
        '2. lõik: „Kirjas puudub hääletoon ja nägu.”',
        '4. lõik: „Puhkepäevale eelneval ööl algab öörahu keskööl ja kestab seitsmeni.”',
        '4. lõik: „Päevase remondi kellaaegu seadus ei määra; need lepitakse kokku maja kodukorras.”',
        'Järeldus 5. lõigust: vahendaja „ei mõista kohut” — neutraalsed sõnad hoiavad ta erapooletuna.',
        'Järeldus 6. lõigust: „Kui inimene saab teada teise põhjused, muutub ta tavaliselt leebemaks.”',
        'Järeldus 7. lõigust: „kõigepealt koputa uksele, alles siis kirjuta gruppi”.',
      ]),
      purpose(B.diagram('048_d_scheme', 'flow', { title: 'Skeem: kuidas vahendaja töötab?', instruction: 'Pärast lugemist kirjuta iga sammu juurde üks näide tekstist. Siis mõtle: millise sammu jätavad naabrid majagrupis vahele?', nodes: 'Kuula kumbagi eraldi: mis juhtus, mis on tema mure?\nÜtle sõnad edasi erapooletult: ütles, et …; palus, et …\nKüsi teise poole põhjust: „Mis teil tegelikult juhtus?”\nKohtumine neutraalses kohas: hoov, koosolekuruum\nKonkreetne kokkulepe: mis kell, mis päevadel, kes kellele helistab' }, 'full', 'g_read'), 'Skeem näitab vahendaja samme; samamoodi vahendad tunni lõpus ise.'),
      retire('048_d_hook', CUT_HOOK),
      retire('048_d_voice', 'the neighbour\'s voice message (65 s, below B2) as the input: her words are now on the plan card 048_t_plan; the lesson\'s one input is the article 048_d_text'),
    ],
    practice: [
      station(teach(B.notice('048_p_notice', 'Märka: ta ütles, et …; ta palus, et …', [
        'Artiklist: Naaber **ütles, et** ta **töötab** öösiti, ja **palus, et** reedeti **pandaks** muusika vaiksemaks. · Kordamine (B1): **ütles, et** … · **küsis, kas** … · **küsis, millal** … (ilma sõnata et)',
        'B2: muutuvad isik (ma → ta), koht (siin → seal) ja aeg (homme → järgmisel päeval), tegusõna aeg ei muutu · palus **kellel + da** · palus, et + **tingiv** · palus **mitte + da** · väitis, et … **olevat** · **öeldi, paluti, lepiti kokku**',
      ], 'full'), 'Kordamine ühe minutiga (ütles, et; küsis, kas). Siis B2 samm: isik, koht ja aeg, palve ja keeld, -vat ja umbisikuline. Lase õpilasel leida artiklist kaks kaudse kõne lauset ja öelda, mida naaber täpselt ütles (otse kõnes).'), 3, 20),
      why(teach(tag(purpose(B.transformation('048_p_report', 'Majagrupist juhatusele.', 'Ütle iga sõnum kaudses kõnes, alusta antud sõnadega. Panka ei ole.', [
        ['Ülemine naaber: „Me teeme remonti ainult kaks nädalat.”', 'Ülemine naaber kirjutas, et', 'Ülemine naaber kirjutas, et nad teevad remonti ainult kaks nädalat.'],
        ['Ljudmila: „Kas te saaksite reede õhtul muusika vaiksemaks panna?”', 'Ljudmila küsis, kas', 'Ljudmila küsis, kas nad saaksid reede õhtul muusika vaiksemaks panna.'],
        ['Esimese korruse naaber: „Ärge kirjutage siia keset ööd!”', 'Esimese korruse naaber palus mitte', 'Esimese korruse naaber palus mitte kirjutada sinna keset ööd.|Esimese korruse naaber palus keset ööd mitte sinna kirjutada.|Esimese korruse naaber palus mitte keset ööd sinna kirjutada.|Esimese korruse naaber palus keset ööd sinna mitte kirjutada.'],
        ['Kolmanda korruse naaber: „Ljudmila on lihtsalt tülinorija.” (Sina seda ei usu.)', 'Kolmanda korruse naaber väitis, et', 'Kolmanda korruse naaber väitis, et Ljudmila olevat lihtsalt tülinorija.'],
        ['Ljudmila: „Millal teie remont lõpeb?”', 'Ljudmila küsis, millal', 'Ljudmila küsis, millal nende remont lõpeb.'],
        ['Juhatuse esimees: „Ma tulen homme kell kuus teie juurde.”', 'Esimees kirjutas, et', 'Esimees kirjutas, et ta tuleb järgmisel päeval kell kuus nende juurde.|Esimees kirjutas, et ta tuleb järgmisel päeval kell kuus meie juurde.'],
        ['Ülemine naaber: „Helistage mulle otse!”', 'Ülemine naaber palus', 'Ülemine naaber palus talle otse helistada.|Ülemine naaber palus meil talle otse helistada.|Ülemine naaber palus, et talle otse helistataks.|Ülemine naaber palus, et me talle otse helistaksime.'],
        ['Ljudmila: „Ma magan päeval kella kaheksast kolmeni.”', 'Ljudmila ütles, et', 'Ljudmila ütles, et ta magab päeval kella kaheksast kolmeni.'],
        ['Ülemise korteri pere: „Me ei teadnud, et te töötate öösiti.”', 'Pere ütles, et', 'Pere ütles, et nad ei teadnud, et ta töötab öösiti.|Pere ütles, et nad ei teadnud, et Ljudmila töötab öösiti.'],
        ['Juhatus: „Kõik naabrid, palun tulge laupäeval hoovi koosolekule!”', 'Juhatus palus kõigil naabritel', 'Juhatus palus kõigil naabritel tulla laupäeval hoovi koosolekule.|Juhatus palus kõigil naabritel laupäeval hoovi koosolekule tulla.'],
      ], 'full', 'g_notice'), 'Juhatus näeb tüli rahulikult ja täpselt, ilma vihaste sõnadeta.'), { task: 'G14' }),
      'Pärast iga rida küsi: „Kes räägib ja kellele? Mis muutub: isik, koht, aeg?” Rida 4: õpilane ise ei usu väidet, seepärast -vat (olevat). Rida 6: homme → järgmisel päeval. Read 7 ja 10: palus + kellel + da-tegevusnimi.'), [
        'Väide: et + isik muutub (me → nad); aeg jääb: teevad.',
        'Jah-ei-küsimus: kas + isik muutub (te → nad): saaksid.',
        'Keeld: palus mitte + da: kirjutada; siia → sinna.',
        'Sa ei vastuta väite eest: väitis, et … olevat.',
        'Küsisõna ees et puudub: küsis, millal …; teie → nende.',
        'ma → ta; homme → järgmisel päeval; teie → nende (või meie).',
        'Palve: palus + da (helistada) või palus, et + tingiv.',
        'Aeg ei muutu: ma magan → ta magab.',
        'me → nad; te → ta; aeg jääb: ei teadnud, töötab.',
        'palus kellel + da: kõigil naabritel tulla.',
      ]),
      why(purpose(B.formtext('048_p_minutes', 'Majakoosoleku protokoll.', 'Kirjuta lünka üks sõna või vorm (vihje sulgudes). Panka ei ole.', 'Majakoosolek laupäeval hoovis', [
        'Ljudmila ütles, et ta [töötab] (töötama; aeg ei muutu) haiglas öövahetustes ja magab päeval. Ta küsis, [kas] (jah-ei-küsimus) naabrid saaksid reedeti muusika vaiksemaks panna. Samuti palus ta, et remont [toimuks] (toimuma; palus, et …) ainult pärastlõunal.',
        '',
        'Pere selgitas, et toru purunes ja remont [peab] (pidama; aeg ei muutu) kuu lõpuks valmis olema. Nad küsisid, [millal] (aeg) Ljudmila täpselt magab. Pere sõnul oli pidu isa juubel ja see [olevat] (olema; sa ei vastuta väite eest) ühekordne. Nad palusid naabritel enne gruppi kirjutamist neile otse [helistada] (helistama; palusid + …).',
        '',
        'Üks naaber palus keset ööd gruppi [mitte] (keeld) kirjutada. Koosolekul [lepiti] (leppima; umbisikuline minevik) kokku, et kaebusi majagrupis ei arutata. Esimees lubas, et paneb uue kodukorra [järgmisel] (homme → kaudses kõnes) päeval trepikotta üles.',
      ]), 'Samamoodi kirjutad kodus juhatusele: kes mida ütles ja palus, erapooletult.'), [
        'Aeg ei muutu: töötab.',
        'Jah-ei-küsimus → kas.',
        'palus, et + tingiv: toimuks.',
        'Aeg ei muutu: peab.',
        'Küsisõna ees ei ole sõna et: millal.',
        'Sa ei vastuta väite eest → olevat.',
        'palusid kellel + da: helistada.',
        'Keeld → mitte + da.',
        'Umbisikuline minevik: lepiti kokku.',
        'homme → järgmisel päeval.',
      ]),
      why(purpose(tag(B.insertion('048_p_summary', 'Juhatuse uudiskiri: vali erapooletu lause.', 'Vali igasse lünka sobiv lause. Üks lause jääb üle: vihane sõnum majagrupist.', 'Mis meie majas juhtus ja mida me kokku leppisime', [
        'Majagrupis tekkis tüli muusika ja remondi pärast. [[Ljudmila kurtis, et reede õhtul oli kuulda valju muusikat.]] Ta töötab öösiti ja magab päeval. [[Ta palus, et puuritaks ainult pärastlõunal.]] Pere vastas samal päeval. [[Nad ütlesid, et ei teadnud tema öövahetustest.]] Toru purunes ja remont peab kuu lõpuks valmis olema. [[Reedene pidu olevat olnud isa juubel.]] Laupäeval oli hoovis koosolek. [[Seal lepiti kokku, et puuritakse kella kolmest kuueni.]] Reedeti on muusika kümnest vaiksem. [[Kaebusi majagrupis enam ei arutata.]]',
      ], ['Ülemised peavad igal ööl pidu!'], 'g_notice'), { task: 'R16', harno: 'R4' }), 'Näed, kuidas vihane tüli kõlab erapooletus kokkuvõttes, mida loeb kogu maja.'), [
        'Ljudmila mure (kurtis, et …) tuleb kohe pärast tüli kirjeldust.',
        'Pärast põhjust (öövahetused) tuleb palve: palus, et puuritaks …',
        'Pere vastus: nad ütlesid, et … (kaudne kõne, neutraalne).',
        'Pere põhjus, mille eest kirjutaja ei vastuta: olevat olnud.',
        'Koosolek → seal lepiti kokku (umbisikuline).',
        'Teine kokkulepe: kaebusi majagrupis ei arutata.',
      ]),
    ],
    transfer: [
      station(purpose(B.planning('048_t_plan', 'Vahendamine: plaan (3 minutit).', 'Oled korteriühistu juhatuse liige. Naaber Ljudmila jättis sulle sõnumi: „Töötan haiglas öövahetustes ja magan päeval kaheksast kolmeni. Kaks nädalat on ülemisest korterist kostnud päeval puurimist ja reede õhtul valju muusikat. Käisin nende uksel, aga keegi ei avanudki. Majagrupis nimetati mind tülinorijaks. Ma ei taha politseid. Palun, et remont oleks tööpäeviti kaheteistkümnest kuueni ja reede õhtul pandaks muusika kümneks vaiksemaks. Kas sa saaksid nendega rääkida?” Edukriteeriumid: 1) annad Ljudmila sõnad edasi kaudses kõnes (ütles, et …; palus, et …; küsis, kas …); 2) küsid ülemise naabri põhjust ja viid vastuse Ljudmilale; 3) ei mõista kohut ja pakud konkreetse kokkuleppe.', ['Mida Ljudmila ütles (kaudses kõnes):', 'Mida ta palus:', 'Mida küsin ülemiselt naabrilt:', 'Minu ettepanek kokkuleppeks:'], 1), 'Plaan aitab sul anda sõnad edasi täpselt, ilma oma hinnanguta.'), 4, 25, { final: 'advise' }),
      teach(tag(purpose(B.rolecards('048_t_relay', 'Vahenda naabrite vahel (6–8 minutit).', 'Mine ülemise korruse naabri juurde, anna Ljudmila sõnad edasi, küsi tema seisukohta ja vii vastus Ljudmilale tagasi. Reageeri, kui naaber ütleb midagi, mida sa ei teadnud.',
        'Olukord: oled juhatuse liige; Ljudmila sõnum on sinu plaanikaardil. Sa ei tea, mida ülemised naabrid arvavad.\nSinu eesmärk: mõlemad naabrid teavad, mida teine tegelikult ütles, ja neil on üks ühine ettepanek.\nPiirang: sa ei ole kohtunik — ära ütle, kellel on õigus.',
        'Ülemise naabri kaart on õpetajal: tema põhjused ja üks asi, mida Ljudmila ei tea.',
        ['Ljudmila palus mul teile edasi öelda, et …', 'Kas ma võin talle öelda, et …?'], ['Me ei teadnudki, et …', 'Öelge talle, et …']), 'Tulemus: mõlemad naabrid teavad, mida teine tegelikult ütles, ja neil on üks ühine ettepanek.'), { task: 'S05', main: true, level: 4 }),
      'Õpetaja kaart (ülemine naaber; seejärel mängi Ljudmilat). Ütle ainult seda, mida küsitakse. Takistused ükshaaval: 1) „Miks ta meile ise ei helistanud?” 2) „Me ei saa remonti peatada!” Varjatud info (ütle pärast teist takistust): „Vannitoas purunes toru ja kindlustus nõuab, et remont oleks kuu lõpuks valmis. Ja meil on kuuekuune laps, kes magab samuti päeval kella ühest kolmeni. Reedene pidu oli mehe neljakümnes sünnipäev — see oli ühekordne.” Õpilane peab reageerima: arvestama uue asjaoluga ja pakkuma uue aja (näiteks puurida ainult kella kolmest kuueni), siis andma selle kaudses kõnes Ljudmilale edasi. Ljudmila rollis küsi: „Kas nad ütlesid, et nad vabandavad?” Õnnestunud, kui õpilane annab mõlema sõnad edasi kaudses kõnes (vähemalt kolm: ütles, et; palus, et / palus + da; küsis, kas), kasutab neutraalseid tegusõnu, ei mõista kohut ja kokkulepe on konkreetne. Seejärel üks tugevus ja üks parandus.'),
      tag(homeTask(homeLines(purpose(B.examWriting('048_t_mail', 'Kodus: kokkuvõte juhatusele (umbes 180 sõna).', `Kirjuta 170–190 sõna. Pöördumist ja algust ei anta. ${VOICE_HOME}`, 'kiri', {
        situation: 'Juhatus palus sul kirjutada vahendamisest kokkuvõtte. Selle põhjal otsustatakse, kas maja kodukorda tuleks muuta.',
        points: ['mis juhtus ja miks sa vahendasid', 'mida ütlesid ja palusid mõlemad pooled (kaudses kõnes, erapooletult)', 'milles lepiti kokku ja mis jäi lahtiseks', 'sinu ettepanek kodukorra kohta ja miks see on mõistlik'],
        words: [170, 190],
      }), 'Juhatus saab sinu kirjast kahe poole täpse pildi ja otsustab, kuidas edasi.'), 6)), { task: 'W12', main: true, level: 4 }),
      writingRubric('048_t_rubric', 'Hindamisjuhend: kokkuvõte juhatusele (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 180 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere, juhatus! Ljudmila on pahane. Ta karjus, et ülemised on hoolimatud. Ülemised ütles, et neil on remont. Ma arvan, et Ljudmilal on õigus. Nad peavad vaikselt olema. Palun tehke uus kord. Aitäh!” Hinnang: ülesanne 1 (kokkulepet ja ettepaneku põhjendust ei ole; kirjutaja võtab poole), ülesehitus 2 (järjekord on selge, lõike ja sidendeid ei ole), sõnavara 2 („karjus”, „pahane”, „hoolimatud” ei ole erapooletud sõnad), grammatika 2 („Ülemised ütles” → ütlesid; kaudset kõnet on ainult kaks korda, palvet ega küsimust ei ole). Kui õppija annab mõlema poole sõnad edasi neutraalse tegusõnaga (ütles, palus, küsis, kas), kirjutab kokkuleppe kellaaegadega ja põhjendab ettepanekut, saab ta 9/12 (75 %).', true),
      exitCheck(purpose(B.selfcheck('048_t_self', ['Ma loen artiklit naabritülidest ja järeldan, mida autor soovitab.', 'Ma annan teiste sõnad kaudses kõnes edasi: ütles, et …; küsis, kas …; palus + da; palus mitte …; väitis, et … olevat.', 'Ma vahendan kahe naabri vahel erapooletult ja reageerin uuele asjaolule.'], 'Tüli vahendatud', 'Ma oskan vahendada'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.')),
      retire('048_t_rules', 'second input: the law on night rest is now part of the article 048_d_text (v5: one input per lesson)'),
      retire('048_t_ask', CUT_DRILL),
      retire('048_t_more', CUT_EXTRA),
      retire('048_t_exit', CUT_DRILL),
      retire('048_t_letter', CUT_OLDTASK),
      retire('048_t_home', CUT_HOME),
      retire('048_t_homework', CUT_HOME),
    ],
  },

  'b1b2-049': {
    title: 'Kaks õde ja üks apelsin: kuidas pere ühise plaani leiab?',
    phases: grammar('Kordamine: läheksime, saaksime · B2: ma saan aru, et; mis oleks, kui; tingimusel, et; vastutasuks'),
    format: 'game',
    topic: 'family',
    canDo: 'Ma saan aru raadiosaatest seisukohast ja huvist, jõuan pere läbirääkimisel kokkuleppeni ja kirjutan umbes 180-sõnalise kokkuleppe kirja.',
    teacherPage: {
      goal: 'Радио «Seisukoht ja huvi»: позиция и интерес; язык переговоров B2; реальный рейс на Peatus.ee; игра трёх поколений со скрытой информацией; дома письмо-договорённость 180 слов.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: утверждение (3 мин); радио — один раз и утверждения 1–7; станция 3 — правило и 10 предложений; игра в один раунд без карточки условий, расписание — дома.',
      hook: '«Väide: peres peaks viimase sõna ütlema see, kes maksab.» Ученик сразу говорит, согласен ли, и одну причину, потом минуту — из-за чего спорят в его семье или у друзей и кто обычно уступает. Без фраз, не исправляйте. Не расспрашивайте о разводах и настоящих ссорах.',
      plan: [
        '0–5: станция 1 — утверждение и одна минута, без фраз',
        '5–25: станция 2 — 10 слов (2 мин), прогноз «чего на самом деле хотели сёстры?» и схема «позиция или интерес» (3 мин), радио дважды (9 мин), 10 утверждений верно / неверно, из них 3 на вывод (6 мин)',
        '25–45: станция 3 — tingiv одной строкой, B2: ma saan aru, et + kindel; mis oleks, kui + tingiv; tingimusel, et; eeldusel, et; vastutasuks; kui just … ei; 10 предложений, сообщение мамы в семейный чат с 10 пропусками без банка, регистр (8 строк): приказ → предложение',
        '45–70: станция 4 — роль и реальный рейс на Peatus.ee (5 мин), игра в два раунда со скрытой информацией и очками (10 мин), разбор по трём критериям',
        '70–75: выход: три критерия и «Ma oskan …»; домашнее задание: письмо-договорённость 180 слов без готового начала и голосовое 1 мин',
        'Kui aega jääb (75–90): ролевая игра — извиниться так, чтобы сработало (забытый юбилей мамы), без «aga» и с конкретным шагом',
      ],
      sources: 'Радио «Seisukoht ja huvi» — учебный текст KeeleSepp (ведущая Kristiina и семейный медиатор Urmas вымышлены). История об апельсине — классический пример различия позиции и интереса (R. Fisher, W. Ury «Getting to Yes», 1981). Общий факт: Sotsiaalkindlustusamet предлагает расходящимся родителям бесплатную семейную медиацию (perelepitus), если оба согласны. Расписания — реальный сайт https://www.peatus.ee (страница не открывалась при подготовке; при необходимости покажите свой пример). Семья и роли — учебные.',
      groups: 'Утверждение — каждый сам. Радио — каждый сам, выводы сравнивают в паре. Игра в группе из трёх: каждый берёт одну роль (бабушка, родитель, подросток); вы ведёте время, тянете карточку условия и считаете очки. В 1:1 ученик выбирает роль, вы играете остальные две.',
      errors: [
        '«Mis oleks, kui me läheme» → «Mis oleks, kui me läheksime» (в предложении-гипотезе — условное наклонение).',
        '«Olen nõus, tingimusel et» → «Olen nõus tingimusel, et …» (запятая перед et); после tingimusel, et обычно изъявительное (sa juhid), условное тоже встречается.',
        '«Ma saan aru, et sa oleksid väsinud» → «… et sa oled väsinud» (понимаю факт — изъявительное).',
        '«Kas me saame …» звучит как требование; «Kas me saaksime …?» — мягче.',
      ],
      notes: [
        'Формат — игра с очками: конкретная договорённость (кто, что, когда) — 3 очка, каждое «Ma saan aru, et …» — 1, каждая уступка с условием — 1. Карточка условия во втором раунде (скрытая информация) заставляет договариваться заново. Задание-связь: настоящий автобус или поезд с Peatus.ee делает договорённость проверяемой.',
        'Условное наклонение (модули 2 и 8) — повтор одной строкой. Цель B2 — язык переговоров: показать понимание (ma saan aru, et + изъявительное), предложить (mis oleks, kui + условное), уступить с условием (tingimusel, et; eeldusel, et; juhul kui; vastutasuks; kui just … ei).',
        'Ученику без семьи рядом: друзья планируют поездку или соседи — общий двор; пенсионер может играть бабушку — это его голос. Обратная связь, 2–3 цели: условное наклонение в предложении; изъявительное после ma saan aru, et; конкретность («küll kuidagi» — не договорённость).',
      ],
    },
    discover: [
      station(inLesson(teach(tag(purpose(B.speaking('049_d_talk', 'Väide: peres peaks viimase sõna ütlema see, kes maksab.', `Ütle kohe, kas oled väitega nõus, ja üks põhjus. Siis räägi umbes minut: mille üle sinu peres või sõpradega kõige sagedamini vaieldakse ja kes tavaliselt järele annab. ${OWN_OR_INVENTED}`, [
        'Väide: „Peres peaks viimase sõna ütlema see, kes maksab.” Kas oled nõus? Miks?',
        'Mille üle teie peres või sõpradega kõige sagedamini vaieldakse? Kes annab järele ja kas see on õiglane?',
      ], [60, 90]), 'Sinu pere või sõprade näide annab mängule päris tausta.'), { task: 'S09', fluency: true }),
      'Üks-ühele: vasta ka ise ühe lausega (pere võib olla väljamõeldud). Ära küsi lahutuse ega päris tülide kohta. Pane kirja, kas õpilane pakub midagi tingiva kõneviisiga (läheksime, võiksime) — see tuleb jaamas 3 tagasi.')), 1, 5),
      station(tag(B.vocab('049_d_vocab', 'Tunni sõnad.', ['seisukoht — позиция', 'huvi — интерес (что на самом деле важно)', 'kompromiss — компромисс', 'järele andma — уступать', 'tingimus — условие', 'vastutasuks — взамен', 'põlvkond — поколение', 'lepitaja — медиатор', 'kaaluma — взвешивать', 'kokkulepe — договорённость']), { topic: ['seisukoht', 'huvi', 'põlvkond', 'vastutasuks'] }), 2, 20),
      purpose(B.diagram('049_d_scheme', 'compare', { title: 'Skeem: seisukoht või huvi?', instruction: 'Enne kuulamist arva: mida õed tegelikult tahtsid? Kuulates kirjuta paremale poolele iga seisukoha taga olev huvi. Siis lisa üks näide oma perest või sõpradest.', left: 'Seisukoht: mida nõutakse', right: 'Huvi: miks see on tähtis', leftItems: 'Mul on vaja seda apelsini!\nKogu pere tuleb suvel maale!\nMa jään juulis linna!', rightItems: 'üks õde: mahl, teine: koor koogi jaoks\nvanaema: …\nteismeline: …' }, 'full', 'g_notice'), 'Skeem näitab, et seisukohad on vastuolus, aga huvid sageli mitte.'),
      why(teach(tag(purpose(B.examListen('049_d_radio', 'Kuulamine: raadiosaade „Seisukoht ja huvi”.', 'Raadiosaates räägib saatejuht perelepitajaga sellest, kuidas pere jõuab ühise plaanini, kui igaüks tahab midagi muud. Loe väited läbi, kuula kaks korda ja otsusta: õige või vale.', 'truefalse', [
        'Kristiina: Tere! Saates „Suhete tund” räägime täna sellest, kuidas pere jõuab ühise plaanini, kui igaüks tahab midagi muud. Stuudios on perelepitaja Urmas. Urmas, suvi on tulekul ja paljudes peredes algab vaidlus. Kust alustada?',
        'Urmas: Tere! Ma alustan sageli ühe vana looga. Kaks õde vaidlevad viimase apelsini pärast. Ema lõikab selle pooleks ja annab kummalegi poole. Õiglane? Tundub küll. Aga üks õde pressib oma poolest mahla ja viskab koore ära, teine riivib koore kooki ja viskab sisu ära. Kui ema oleks küsinud, milleks neil apelsini vaja on, oleks kumbki saanud kaks korda rohkem seda, mida ta tegelikult tahtis.',
        'Kristiina: Mida see lugu meile õpetab?',
        'Urmas: Et seisukoht ja huvi ei ole sama asi. Seisukoht on see, mida inimene nõuab: „Kogu pere tuleb suvel maale!” Huvi on see, miks ta seda nõuab. Vanaema kardab üksi jääda, isa tahab lõpuks välja magada, teismeline ei taha sõpradest ilma jääda. Seisukohad on vastuolus, aga huvid sageli mitte.',
        'Kristiina: Kuidas huvini jõuda?',
        'Urmas: Küsimusega „Miks see sulle tähtis on?”. Ja siis tuleb öelda oma sõnadega, mida kuulsid: „Ma saan aru, et sa kardad suvel üksi jääda.” Inimene, kes tunneb, et teda on mõistetud, on valmis ka ise järele andma.',
        'Kristiina: Ja siis?',
        'Urmas: Siis otsige koos vähemalt kolm varianti, enne kui midagi otsustate. Esimene idee on harva parim. Kui variandid on laual, saab neid kaaluda: mis oleks, kui me sõidaksime maale kümneks päevaks ja üks nädal oleks mere ääres? Kas saaksime minna pärast festivali?',
        'Kristiina: Meil öeldakse peres sageli lõpus: „Küll me kuidagi saame.” Kas see on kokkulepe?',
        'Urmas: Ei ole. See on lootus. Kokkulepe ütleb, kes, mida ja millal teeb. Näiteks: vanaema juures oleme kümnendast kahekümnenda juulini, isa parandab katuse, teismeline sõidab festivalile bussiga ja tuleb tagasi järgmisel päeval. Hea on lisada ka tingimus: olen nõus tingimusel, et … Ja kokku leppida, mis saab siis, kui midagi muutub.',
        'Kristiina: Aga mida teha, kui keegi peres ütleb lihtsalt: „Mina ei lähe kuhugi”?',
        'Urmas: Siis ei tasu vaielda, vaid küsida, mida ta kardab. Teismeline, kes ütleb „ma ei lähe maale”, mõtleb sageli „ma ei taha sõpradest ilma jääda”. Kui see on välja öeldud, saab otsida lahenduse: võib-olla tuleb ta maale hiljem või sõber tuleb kaasa. Ära lõpeta vestlust ei-sõnaga, vaid küsimusega: mis tingimusel sa oleksid nõus?',
        'Kristiina: Kas vanavanemate sõnal peaks olema suurem kaal?',
        'Urmas: Austus vanema põlvkonna vastu on tähtis, aga kaal ei tähenda vetoõigust. Paljud vanaemad on hoopis rõõmsad, kui neilt küsitakse, mida nad tegelikult vajavad. Tihti selgub, et vajadus on väiksem, kui kõik kartsid: mitte kaks nädalat seltskonda, vaid abi aiatööga ja kindel aeg, millal lapselapsed helistavad.',
        'Kristiina: Ja kui pere ise kokkuleppele ei jõua?',
        'Urmas: Siis võib appi kutsuda lepitaja. Lepitaja ei otsusta kellegi eest. Ta aitab rääkida nii, et igaüks saaks sõna ja keegi ei jääks kõrvale. Lahku minevatele vanematele pakub riik perelepitust tasuta, et nad saaksid lapse huvides kokku leppida.',
        'Kristiina: Üks nõuanne kuulajatele?',
        'Urmas: Enne järgmist vaidlust küsi teistelt: miks see sulle tähtis on? Ja vasta ise samale küsimusele.',
        'Kristiina: Aitäh, Urmas!',
      ], [
        ['Urmase loos lõikas ema apelsini pooleks ja see oli õdedele parim lahendus.', false],
        ['Üks õde vajas apelsinist mahla, teine koort.', true],
        ['Seisukoht on Urmase järgi see, miks inimene midagi nõuab.', false],
        ['Urmase sõnul on pereliikmete huvid sageli vähem vastuolus kui nende seisukohad.', true],
        ['Urmas soovitab enne otsustamist leida koos vähemalt kolm varianti.', true],
        ['Lause „Küll me kuidagi saame” on Urmase sõnul hea kokkulepe.', false],
        ['Urmase arvates peaks vanavanematel olema pere otsustes vetoõigus.', false],
        ['Urmas vihjab, et vanaema tegelik vajadus võib olla väiksem, kui pere kartis.', true],
        ['Urmase sõnadest võib järeldada, et inimene, kes tunneb end mõistetuna, annab kergemini järele.', true],
        ['Urmas annab mõista, et lepitaja otsustab lõpuks, kumb pool on õiges.', false],
      ], 'g_listen'), 'Saade annab sulle mängu reegli: räägi huvidest, mitte seisukohtadest.'), { voice: 'interview', task: 'L05', harno: 'L4' }),
      'Kuulamine, 20 minutit koos sõnade ja skeemiga (umbes 4 minutit, kaks korda). Enne kuulamist arvab õpilane skeemi järgi, mida õed tegelikult tahtsid. Õpilane loeb väited ja joonib alla võtmesõnad. Pärast kuulamist täidab õpilane skeemi parema poole. Väited 8–10 on järeldusväited (lepitaja hoiak): nõua põhjendust kuuldust. Saade on õppetekst, inimesed on välja mõeldud.'), [
        'Vale: ema oleks pidanud küsima, „milleks neil apelsini vaja on”; pooleks lõikamine ei olnud parim.',
        'Õige: üks pressis mahla, teine riivis koore kooki.',
        'Vale: seisukoht on see, mida inimene nõuab; huvi on see, miks ta seda nõuab.',
        'Õige: „Seisukohad on vastuolus, aga huvid sageli mitte.”',
        'Õige: „otsige koos vähemalt kolm varianti, enne kui midagi otsustate”.',
        'Vale: „Ei ole. See on lootus.”',
        'Vale: „kaal ei tähenda vetoõigust”.',
        'Õige (järeldus): „vajadus on väiksem, kui kõik kartsid”.',
        'Õige (järeldus): „Inimene, kes tunneb, et teda on mõistetud, on valmis ka ise järele andma.”',
        'Vale (järeldus): „Lepitaja ei otsusta kellegi eest.”',
      ]),
      retire('049_d_hook', CUT_HOOK),
      retire('049_d_know', CUT_KNOW),
    ],
    practice: [
      station(teach(B.notice('049_p_notice', 'Märka: kuidas pakkuda nii, et teine kuulab?', [
        'Raadiost: „**Ma saan aru, et** sa **kardad** suvel üksi jääda.” · „**Mis oleks, kui** me **sõidaksime** maale kümneks päevaks?” · „**Kas saaksime** minna pärast festivali?” · olen nõus **tingimusel, et** …',
        'Kordamine (B1): tingiv kõneviis — me **läheksime**, sa **saaksid**, ta **tuleks** (-ks-).',
        'B2: näita, et mõistad (fakt → kindel kõneviis): **Ma saan aru, et** sul **on** raske. · **Mulle tundub, et** sulle **on** tähtis …',
        'B2: paku (mõeldud olukord → tingiv): **Mis oleks, kui** me **läheksime** …? · **Kas** me **saaksime** …? · Me **võiksime** proovida … · **Kui** vanaema **tuleks** meile, ei **peaks** keegi sõitma.',
        'B2: tingimus ja vastutasu — olen nõus **tingimusel, et** sa **juhid** (ka tingiv: juhiksid) · **eeldusel, et** … · **juhul, kui** … · **vastutasuks** ma … · **kui just** … **ei** … (= välja arvatud siis, kui).',
      ], 'full'), 'Kordamine ühe minutiga (läheksime, saaksime). Siis B2 samm: mõistmine kindla kõneviisiga, ettepanek tingivaga, järeleandmine tingimusega. Lase õpilasel leida saatest üks lause igast liigist.'), 3, 20),
      why(teach(tag(purpose(B.gaps('049_p_mood', 'Jõulud: kus ja kellega?', 'Pere vaidleb, kus jõule veeta. Otsusta, kas lause vajab tingivat või kindlat kõneviisi, ja kirjuta sulgudes olev tegusõna õiges vormis. Panka ei ole.', [
        'Mis oleks, kui me [veedaksime] jõululaupäeva meil ja esimese püha vanaema juures? (veetma)',
        'Kas me [saaksime] sõita juba reedel, et laps ei peaks õhtul autos magama? (saama)',
        'Ma saan aru, et sa [kardad] pühade ajal üksi jääda. (kartma)',
        'Olen nõus maale sõitma tingimusel, et sina [juhid|juhiksid] tagasiteel autot. (juhtima)',
        'Kui vanaema [tuleks] hoopis meile, ei peaks keegi kaheksa tundi sõitma. (tulema)',
        'Vastutasuks [võiksin] ma vanaemale enne pühi aias appi minna. (võima)',
        'Kui me oleksime varem rääkinud, [poleks|ei oleks] see tüli nii suureks läinud. (olema, eitus)',
        'Mulle tundub, et sulle [on] tähtis, et kõik oleksid koos. (olema)',
        'Me sõidame laupäeval maale, kui just ilm väga halb [ei ole|pole]. (olema, eitus)',
        'Olen nõus linna jääma eeldusel, et sa [helistad|helistaksid] vanaemale iga päev. (helistama)',
      ], '', 'full', 'g_notice'), 'Õige vorm teeb ettepaneku pehmeks ja tingimuse selgeks; see on mängu põhivõte.'), { task: 'G02' }),
      'Pärast iga lauset küsi: „Kas see on fakt või ettepanek?” Fakt → kindel kõneviis (kardad, on), ettepanek või mõeldud olukord → tingiv (veedaksime, tuleks). Rida 7 on minevikus: oleks + -nud. Rida 9: kui just … ei + kindel kõneviis.'), [
        'Mis oleks, kui + tingiv: veedaksime.',
        'Viisakas küsimus → tingiv: saaksime.',
        'Ma saan aru, et + fakt (kindel): kardad.',
        'tingimusel, et + kindel (juhid) või tingiv (juhiksid).',
        'Mõeldud olukord: kui + tingiv: tuleks.',
        'Pakkumine → tingiv: võiksin.',
        'Mineviku mõeldud olukord: ei oleks / poleks + -nud.',
        'Mulle tundub, et + fakt: on.',
        'kui just … ei + kindel kõneviis: ei ole.',
        'eeldusel, et + kindel (helistad) või tingiv (helistaksid).',
      ]),
      why(purpose(B.formtext('049_p_chat', 'Pere vestlus: suveplaan.', 'Ema kirjutab pere vestlusse ettepaneku. Kirjuta lünka üks sõna või vorm (vihje sulgudes). Panka ei ole.', 'Meie suvi — ettepanek', [
        'Kallid! Eile õhtul läks vaidlus üsna teravaks ja mul on kahju. Ma saan aru, et vanaema [tahab] (tahtma; fakt) suvel kogu pere enda juurde.',
        '',
        'Samas tundub mulle, et isa [vajab] (vajama; fakt) pärast rasket aastat lihtsalt puhkust. Mis oleks, kui me [sõidaksime] (sõitma; ettepanek) vanaema juurde kümneks päevaks ja seejärel nädalaks mere äärde?',
        '',
        'Kas me [saaksime] (saama; viisakas küsimus) teha nii, et Mart tuleb maale alles pärast festivali? Olen sellega nõus [tingimusel] (tingimus), et ta sõidab bussiga ja helistab, kui on kohal.',
        '',
        'Isa võiks vanaema juures katuse ära parandada. [Vastutasuks] (vastu + tasu) hoiab vanaema kaks päeva lapsi, et me saaksime kahekesi matkale minna.',
        '',
        'Kui ilm [peaks] (pidama; tingiv) halvaks minema, sõidame mere äärde hiljem. Ja kui keegi selle plaaniga nõus ei [ole] (olema; fakt, eitus), öelge kohe, mitte nädala pärast.',
        '',
        'Lepime kokku [järgmiseks] (järgmine; mis ajaks?) pühapäevaks. Mina helistan vanaemale ja [broneerin] (broneerima; mina, olevik) majutuse Pärnus.',
      ]), 'Samamoodi kirjutad kodus oma kokkuleppe kirja: mõistmine, ettepanek, tingimus ja kes mida millal teeb.'), [
        'Ma saan aru, et + fakt: tahab.',
        'tundub, et + fakt: vajab.',
        'Mis oleks, kui + tingiv: sõidaksime.',
        'Viisakas küsimus → tingiv: saaksime.',
        'Olen nõus tingimusel, et …',
        'Vastutasuks = vastu + tasu (kokku).',
        'Kui … peaks + ma-tegevusnimi: võimalik, aga mitte kindel muutus.',
        'Fakt, eitus: ei ole.',
        'mis ajaks? → saav kääne: järgmiseks.',
        'mina, olevik: broneerin.',
      ]),
      why(purpose(tag(B.table('049_p_register', 'Käsk või ettepanek?', 'Vasakul on käsk või nõudmine, mis teeb vaidluse teravaks. Paremal on sama mõte ettepanekuna. Kirjuta lünka puuduv sõna.', 'Käsk, Ettepanek', [
        'Me läheme Pärnu ja kõik! | Mis oleks, kui me [läheksime] seekord Pärnu?',
        'Sa ei lähe festivalile! | Ma saan aru, et festival on sulle [tähtis], aga ma muretsen.',
        'Vanaema peab meile tulema. | [Kas] vanaema saaks seekord meile tulla?',
        'Sina parandad katuse! | Kas sa [võiksid] katuse ära parandada?',
        'Ma lähen ainult siis, kui sina maksad. | Olen nõus minema [tingimusel], et jagame kulud.',
        'Ei, see ei sobi. | See on minu jaoks [keeruline], sest mul on puhkus alles augustis.',
        'Ära räägi minuga nii! | Mulle [teeb] haiget, kui sa räägid minuga sellisel toonil.',
        'Küll me kuidagi saame. | Lepime [kokku]: kes, mida ja millal teeb.',
      ], 'g_notice'), { task: 'W12' }), 'Tead, kuidas sama soov kõlab nii, et teine tahab kuulata.'), [
        'Käsk → Mis oleks, kui + tingiv: läheksime.',
        'Keeld → näita mõistmist: on sulle tähtis.',
        'Nõudmine → viisakas küsimus: Kas … saaks …?',
        'Käsk → Kas sa võiksid …?',
        'Ultimaatum → tingimusel, et …',
        'Ei sobi → see on minu jaoks keeruline, sest …',
        'Käsk → mina-sõnum: mulle teeb haiget.',
        'Lootus → kokkulepe: lepime kokku.',
      ]),
    ],
    transfer: [
      station(purpose(B.planning('049_t_plan', 'Enne mängu: roll ja päris sõiduplaan (5 minutit).', 'Pere planeerib juulit: vanaema tahab kõiki maale Võrumaale, lapsevanem nädalaks Pärnusse, teismeline linna. Autot ei ole. Vali mängukaardilt üks roll. Leia sõiduplaanide lehelt Peatus.ee (https://www.peatus.ee) üks päris buss või rong oma linnast Võrru või Pärnusse: väljumise aeg, sõiduaeg ja hind; kui telefoni ei ole, kasuta õpetaja näidet. Kirjuta märksõnad. Edukriteeriumid: 1) ütled enne iga ettepanekut, mida teine tahab (Ma saan aru, et …); 2) pakud tingiva kõneviisiga ja seod järeleandmise tingimusega (tingimusel, et …; vastutasuks …); 3) kokkuleppes on kes, mida ja millal, ka päris sõiduaeg.', ['Minu roll ja minu tegelik huvi:', 'Päris ühendus (kust, kuhu, mis kell, hind):', 'Minu kaks ettepanekut:', 'Mida annan vastutasuks ja mis tingimusel:'], 1), 'Päris sõiduaeg teeb kokkuleppe kontrollitavaks: kõik teavad, mis kell keegi kuhu jõuab.'), 4, 25, { final: 'negotiate' }),
      teach(tag(purpose(B.rolecards('049_t_game', 'Läbirääkimismäng: üks suvi, kolm soovi (10 minutit).', 'Punktid: konkreetne kokkulepe (kes, mida, millal) 3, iga „Ma saan aru, et …” 1, iga tingimusega järeleandmine 1. Teises voorus muutub üks asi ja kokkulepet tuleb muuta.',
        'Roll (vali üks): vanaema — kardab üksi jääda, katus ja aed vajavad abi; lapsevanem — raske tööaasta, tahab puhata, puhkust on juulis kaks nädalat; teismeline — festival 12. juulil, suvetöö kolmel päeval nädalas.\nEesmärk: saada see, mis sulle tegelikult tähtis on.',
        'Teised rollid ja tingimuste kaardid on õpetajal.',
        ['Ma saan aru, et sulle on tähtis …', 'Mis oleks, kui …?'], ['Olen nõus tingimusel, et …', 'Hea, lepime kokku: …']), 'Tulemus: teie pere suveplaan, kus iga põlvkonna tegelik huvi on arvesse võetud.'), { task: 'S17', main: true, level: 4 }),
      'Õpetaja kaart. Mängi rolle, mida õpilane ei valinud; ütle kõigepealt oma seisukoht, huvi ainult siis, kui küsitakse („Miks see sulle tähtis on?”). Varjatud info (2. voor, tõmba üks kaart ja ütle see alles siis): 1) vanaema kukkus ja ei saa kaks nädalat aias töötada — abi on vaja just juuli alguses; 2) festival lükati augustisse; 3) Pärnu majutus maksab kaks korda rohkem, kui arvati; 4) buss, mille õpilane leidis, pühapäeviti ei sõida. Õpilane peab reageerima ja kokkulepet muutma. Loe punktid kokku. Õnnestunud, kui kokkuleppes on kes, mida ja millal, iga roll saab oma huvi ja õpilane kasutab vähemalt kaks tingivat ettepanekut ja ühe „tingimusel, et” või „eeldusel, et”. Seejärel üks tugevus ja üks parandus.'),
      tag(homeTask(homeLines(purpose(B.examWriting('049_t_mail', 'Kodus: kokkuleppe kiri (umbes 180 sõna).', `Kirjuta 170–190 sõna. Pöördumist ja algust ei anta. ${VOICE_HOME}`, 'kiri', {
        situation: 'Kirjuta pere vestlusse (või sõpradele) kiri, mis paneb tunnis sõlmitud kokkuleppe kirja.',
        points: ['tänu või vabandus eilse vaidluse pärast', 'kuidas sa mõistad iga pereliikme huvi', 'kokkulepe: kes, mida ja millal, ka päris sõiduaeg', 'tingimus ja mis saab siis, kui midagi muutub'],
        words: [170, 190],
      }), 'Pere loeb kirja ja teab, milles kokku leppisite ja mis saab, kui midagi muutub.'), 5)), { task: 'W04', main: true, level: 4 }),
      writingRubric('049_t_rubric', 'Hindamisjuhend: kokkuleppe kiri (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 180 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Hei kõik! Me läheme vanaema juurde. Siis Pärnu. Mart ka tuleb. Isa teeb katus. See on hea plaan, ma arvan. Küll me kuidagi saame. Kallistused!” Hinnang: ülesanne 1 (kes, mida ja millal on puudu, huvisid ei nimetata, „küll me kuidagi saame” ei ole kokkulepe), ülesehitus 2 (järjekord on selge, lõike ja sidendeid ei ole), sõnavara 2 (puuduvad kokkulepe, tingimus, huvi, vastutasuks), grammatika 2 („teeb katus” → katuse; ühtegi tingivat ettepanekut ega tingimust pole). Kui õppija nimetab iga pereliikme huvi (Ma saan aru, et …), kirjutab kuupäevad ja sõiduaja ning lisab tingimuse, saab ta 9/12 (75 %).', true),
      exitCheck(purpose(B.selfcheck('049_t_self', ['Ma saan raadiost aru, mille poolest erineb seisukoht huvist.', 'Ma pakun ja tingin: mis oleks, kui …; tingimusel, et …; vastutasuks …', 'Ma jõuan kokkuleppeni ja muudan seda, kui midagi muutub.'], 'Kokkulepe sõlmitud', 'Ma oskan läbi rääkida'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.')),
      retire('049_t_cards', 'the three role cards are now in the game card 049_t_game (v5: ≤ 5 blocks on Kasuta)'),
      retire('049_t_more', CUT_EXTRA),
      retire('049_t_exit', CUT_DRILL),
      retire('049_t_letter', CUT_OLDTASK),
      retire('049_t_home', CUT_HOME),
      retire('049_t_homework', CUT_HOME),
    ],
  },

  'b1b2-050': {
    title: 'Kontroll 10 — suhted ja konfliktid',
    format: 'exam',
    assessment: true,
    canDo: 'Ma saan eksami vormis aru kaheksast lühiteatest ja raadiointervjuust, räägin minuti ilma abita ja lepin eksamineerijaga kokku; Harno lävi on 60 %.',
    // Methodology v5 (2026-11-25): one sheet, 45 minutes, two skills — LISTENING + SPEAKING (module 7 L + W, 8 R + S,
    // 9 R + W). Speaking because the module's cold task 046_d_cold was spoken (module 9 measured writing) and the module
    // product „Minu kokkulepe” is a talk; listening because a conflict is solved by listening first. Listening opens with
    // L1 as on the exam: eight short notices, each its own clip of 35–45 s heard once (locked); then the v4 control's
    // interview with a house chairman (same transcript and audio), now locked and heard twice, with its gaps and
    // true/false statements. The speaking part opens with the parallel new task of the cold task (same conditions:
    // 2 minutes to think, 1 minute, no phrases, a new statement), then the module product as a negotiation with the
    // examiner, who holds hidden information. The old three sheets (28 blocks) stay hidden below.
    discover: [
      B.text('050_d_intro', 'Kontroll 10: kuulamine ja rääkimine (45 minutit)', 'Kontrollis on kaks osaoskust. Rääkimine (umbes 15 minutit, üks-ühele eksamineerijaga): üheminutiline sõnavõtt pärast kahte minutit ettevalmistust ja kokkulepe eksamineerijaga — kokku 12 punkti. Kuulamine (umbes 22 minutit): kaheksa lühiteadet (igaüht kuulad üks kord) ning raadiointervjuu (kuulad kaks korda) lünkade ja õige-vale väidetega — kokku 25 punkti. Kokku 37 punkti. Harno: sooritatud alates 60 % (vähemalt 23 punkti) ja ükski osa ei tohi olla 0 punkti. KeeleSepp: eksamiks valmis alates 70 % (26 punkti), meie tunnistus alates 80 % (30 punkti) — see on sisemine lävi. Sõnaraamatut ei kasutata. Kuulamise ajal võid teha märkmeid, kuid vastused kirjuta lehele kohe: salvestust ei saa peatada ega uuesti alustada.'),
      PART('050_t_spart', 'S', { minutes: 15, points: 12, tasks: 2, note: 'Sõnavõtt (2 minutit ettevalmistust, 1 minut kõnet) ja kokkulepe eksamineerijaga (kuni 4 minutit): 4 kriteeriumi × 0–3 = 12 toorpunkti. Harno: sooritatud alates 60 %. KeeleSepp: eksamiks valmis alates 70 %, tunnistus alates 80 % (sisemine lävi).' }),
      teach(tag(patch(B.examiner('050_t_cold', 'suhted ja konfliktid', [
        'Kas tüli võib hea suhte tugevamaks teha? Too näide oma elust või tuttava elust.',
        'Kas sa räägid pigem otse või kirjutad sõnumi, kui oled kellegi peale pahane? Miks?',
        'Kas sõbrale tasub raha laenata ja mis tingimustel oleksid sina nõus seda tegema?',
        'Mida peaks tegema naaber, keda öine müra segab, enne kui ta kirjutab majagruppi?',
        'Kes peaks peres otsustama, kuidas pühad veedetakse, ja kuidas jõuda kokkuleppele?',
        'Milline iseloomu omadus aitab tülis kõige rohkem? Too näide inimesest, keda tead.',
      ], 'B2', [60, 180]), { instruction: 'Väide: „Tüli teeb hea suhte tugevamaks.” Mõtle kaks minutit (märkmeid võib teha) ja räägi siis üks minut: kas oled väitega nõus ja miks? Valmis fraase ei ole. Pärast kõnet vastad eksamineerija küsimustele.' }), { task: 'S16', harno: 'S1' }),
      'Mooduli paralleelne lõpuülesanne: samad tingimused nagu mooduli külmas alguses tunnis b1b2-046 (2 minutit mõtlemiseks, 1 minut kõneks, fraase ei ole), uus väide. Võrdle külma alguse märkmetega: seisukoht esimeses lauses, põhjus ja näide, vastuargument, sidendid, korduvad vead. Ütle õppijale üks konkreetne areng ja üks järgmine samm. Pärast kõnet küsi 2–3 küsimust nimekirjast (kuni 4 minutit) ja esita ühele vastusele vastuargument, millele õpilane viisakalt vastab.'),
      teach(tag(B.rolecards('050_t_deal', 'Rääkimine 2: kokkulepe (kuni 4 minutit).', 'Vali üks olukord ja lepi eksamineerijaga kokku. Ütle, mida tunned ja miks, näita, et mõistad tema huvi, ja paku lahendus tingimusega. Reageeri, kui ta ütleb midagi, mida sa ei teadnud.',
        'Olukord (vali üks): A) sõber, kes ei ole sulle 200 eurot tagasi maksnud, tahab lõpuks rääkida; B) uus naaber teeb õhtuti remonti ja sinu laps ei saa magada; C) õde tahab, et kogu pere veedaks jõulud tema juures, aga sina oled sel aastal kokku leppinud teisiti.\nSinu eesmärk: konkreetne kokkulepe — kes, mida ja millal.\nPiirang: hoia suhet; ära süüdista, räägi endast.',
        'Teise poole kaart on eksamineerijal: tema huvi ja üks asjaolu, mida sa veel ei tea.',
        ['Ma olin pettunud, kui …', 'Mis oleks, kui …?'], ['Ma saan aru, aga …', 'Ja mis siis, kui …?']), { task: 'S13', harno: 'S2' }),
      'Eksamineerija on teine pool. Ütle kõigepealt oma seisukoht, huvi ainult siis, kui küsitakse. Varjatud info (ütle teise vastuse järel): A) „Ma kaotasin töö ja mul on häbi — saan maksta ainult kolmkümmend eurot kuus.” B) „Me ei teadnudki, et teil on väike laps. Meil sünnib kuu lõpus beebi ja lastetuba peab enne valmis saama.” C) „Ema ütles mulle eile, et tal on raske sõita ja ta tahab jõulud veeta just minu juures, sest ma elan tema lähedal.” Õppija peab reageerima ja kokkulepet muutma. Hinda: tunne ja põhjus mina-sõnumiga, mõistab teise huvi (Ma saan aru, et …), reageerib uuele asjaolule, konkreetne kokkulepe tingimusega (tingimusel, et …; vastutasuks …).'),
      PART('050_p_lpart', 'L', { minutes: 22, points: 25, tasks: 3, note: 'Teated (igaüks üks kord, 8 punkti), intervjuu (kaks korda): lüngad (9 punkti) ning õige või vale (8 punkti). Harno: sooritatud alates 60 %. KeeleSepp: eksamiks valmis alates 70 %, tunnistus alates 80 % (sisemine lävi).' }),
      once(why(tag(perClip(B.examListen('050_p_clips', 'Kuulamine 1: kaheksa lühiteadet (8 punkti).', 'Kuulad kaheksat lühikest teadet. Iga teadet kuuled ainult üks kord. Loe enne küsimus läbi, siis kuula ja vali üks õige vastus kolmest.', 'choice', [
        'Teadustaja: Korteriühistu teade. Järgmisel nädalal vahetatakse kõigis korterites veetorud. Müra tekitavaid töid tehakse ainult tööpäeviti kella üheksast viieni, mitte nädalavahetusel. Kolmapäeval on vesi kogu päeva kinni, seepärast varuge vett juba teisipäeva õhtul. Kui teie kodus on väike laps või keegi, kes töötab öösiti, andke juhatusele teada: proovime teie korteris teha tööd pärastlõunal. Küsimuste korral helistage juhatuse esimehele, mitte ehitajatele. Töid tehakse korruste kaupa, alustades ülevalt, ja ühes korteris kestab töö umbes kaks päeva. Täname teid kannatlikkuse eest.',
        'Teadustaja: Linnaraamatukogu kutsub uusi linnaelanikke sõbraõhtule. Kohtume igal teisel neljapäeval kell kuus kolmanda korruse saalis. Räägime eesti keeles, kuid keegi ei pea rääkima täiuslikult: tähtsam on julgus kui grammatika. Igal õhtul on üks teema, näiteks lemmikretsept või kodulinn. Esimesel õhtul räägime sellest, kuidas keegi meist siia linna jõudis, ja tutvume üksteisega väikestes rühmades. Kaasa võib võtta midagi väikest laua jaoks. Osalemine on tasuta, kuid kohti on kakskümmend, seepärast andke oma tulekust teada raamatukogu kodulehel.',
        'Teadustaja: Tere, siin Siim. Vabandust, et nii kaua vaikisin. Mul oli piinlik, sest ma ei suutnud raha õigel ajal tagasi maksta, ja ma ei osanudki sulle midagi öelda. Ma tean, et sa vajasid seda raha ise ja et sul oli hambaarst. Just see teeb mulle kõige rohkem häbi. Nüüd on mul uus töö ja esimene palk tuleb kuu lõpus. Ma pakun nii: maksan kolm kuud järjest viiskümmend eurot ja viimase osa enne jõule. Kui see sulle ei sobi, helista mulle õhtul pärast seitset. Ja aitäh, et sa minust ei loobunud. Loodan, et saame varsti jälle koos kohvi juua.',
        'Teadustaja: Sotsiaalkindlustusamet tuletab meelde, et lahku minevad vanemad saavad lapse elu üle kokku leppida perelepitaja abiga. Perelepitaja ei otsusta kummagi vanema eest ega ütle, kellel on õigus. Ta aitab vanematel rääkida nii, et mõlemad saaksid sõna ja et kokkulepe arvestaks lapse huvidega. Teenust saab taotleda siis, kui mõlemad vanemad on nõus. Kohtumised toimuvad neutraalses kohas ja kestavad tavaliselt paar tundi; mõnikord piisab ühest kohtumisest, mõnikord on vaja mitut. Lisateavet saab ameti kodulehelt ja infotelefonilt tööpäeviti.',
        'Teadustaja: Hoovipäev Pärna tänaval! Laupäeval kella kümnest kolmeni koristame koos hoovi, parandame liivakasti ja istutame kaks uut puud. Tööriistad annab linn, kindad võtke palun ise kaasa. Kell üks on ühine supilõuna, mille eest maksab korteriühistu. Lastele on õues mängud ning vanematele naabritele toome trepikojast toolid välja, et kõik saaksid koos istuda. Eelmisel aastal tutvusid hoovipäeval naabrid, kes olid kümme aastat samas trepikojas elanud ja teineteist ainult tervitanud. Kõik naabrid on oodatud, ka need, kes kolisid majja alles sel sügisel. Vihma korral lükkub hoovipäev nädala võrra edasi.',
        'Teadustaja: Vabatahtlike keskus otsib inimesi, kes käiksid kord nädalas üksi elava eaka inimese juures külas. Ei ole vaja teha midagi erilist: juua koos teed, jalutada või aidata poes käia. Paljud vabatahtlikud ütlevad, et said ise vähemalt sama palju, kui andsid, ja paljud eakad ootavad külaskäiku terve nädala. Enne esimest külaskäiku on kahetunnine koolitus selle kuu viimasel laupäeval; seal räägitakse ka sellest, mida teha, kui eakas tunneb end halvasti. Eesti keelt ei pea oskama täiuslikult; peaasi, et oled usaldusväärne ja tuled kokkulepitud ajal.',
        'Teadustaja: Raadio „Suhete tund” ootab kuulajate kirju. Järgmises saates räägime sellest, kuidas öelda sõbrale ei nii, et sõprus jääb alles. Kirjutage meile oma lugu: millal te ütlesite ei ja mis siis juhtus, või millal oleksite tahtnud ei öelda, aga ei julgenud. Nimesid ega muid isikuandmeid me eetris ei nimeta. Parimad kirjad loeb ette psühholoog, kes annab ka nõu, kuidas sellises olukorras käituda ja mida järgmisel korral teisiti öelda. Kui soovite, võite kirjutada ka anonüümselt. Kirju ootame reede õhtuni saate kodulehel; saade on eetris pühapäeval kell kümme.',
        'Teadustaja: Tere, siin Marika. Elan teisel korrusel. Kirjutan, sest eile õhtul oli trepikojas jälle kuulda koera haukumist. Ma ei ole pahane ja saan aru, et koer on üksi kodus kurb, aga mul on väike laps, kes ärkab iga heli peale. Kas me saaksime kokku leppida, et koer ei jääks õhtuti üksi koju? Kui teil on vaja, võin mõnikord ise temaga jalutama minna. Helistage mulle, kui teil sobib, või koputage mu uksele; minu number on ka postkastil. Ma tean, et kõigil on vahel raske, ja loodan, et leiame koos lahenduse.',
      ], [
        ['Mida palub korteriühistu teha neil, kelle kodus on väike laps või keegi, kes töötab öösiti?', 'anda juhatusele teada', 'helistada ehitajatele', 'olla kolmapäeval kodus'],
        ['Mis on raamatukogu sõbraõhtul teate järgi tähtsam kui grammatika?', 'julgus rääkida', 'täiuslik hääldus', 'hea retsept'],
        ['Miks ei vastanud Siim nii kaua oma sõbra sõnumitele?', 'tal oli piinlik, et ta ei suutnud raha tagasi maksta', 'ta oli välismaal tööl', 'ta oli sõbra peale solvunud'],
        ['Mida teeb perelepitaja teate järgi lahku minevate vanematega?', 'aitab vanematel rääkida ja kokku leppida', 'otsustab, kumb vanem on õiges', 'räägib ainult lapsega'],
        ['Mida tahab teade öelda looga naabritest, kes olid kümme aastat ainult tervitanud?', 'hoovipäev aitab naabritel tuttavaks saada', 'naabrid ei taha omavahel rääkida', 'hoovipäev on ainult koristamiseks'],
        ['Mis on vabatahtliku juures teate järgi kõige tähtsam, kui ta käib eaka inimese juures külas?', 'et ta on usaldusväärne ja tuleb kokkulepitud ajal', 'et ta räägib täiuslikult eesti keelt', 'et ta käib eaka juures iga päev'],
        ['Mida lubab raadiosaade kuulajatele, kes saadavad oma loo?', 'nende nimesid eetris ei nimetata', 'iga kiri loetakse eetris ette', 'neile helistatakse reede õhtul'],
        ['Mida pakub Marika naabritele, kelle koer õhtuti haugub?', 'et ta võib vahel ise koeraga jalutama minna', 'et ta kutsub korteriühistu esimehe', 'et ta kolib lapsega teisele korrusele'],
      ], 'g_read', 1)), { task: 'L01', harno: 'L1' }), [
        'Teade 1: „Kui teie kodus on väike laps või keegi, kes töötab öösiti, andke juhatusele teada.”',
        'Teade 2: „tähtsam on julgus kui grammatika”.',
        'Teade 3: „Mul oli piinlik, sest ma ei suutnud raha õigel ajal tagasi maksta.” Ta „ei osanudki” midagi öelda.',
        'Teade 4: „Ta aitab vanematel rääkida nii, et mõlemad saaksid sõna.” Ta „ei otsusta kummagi vanema eest”.',
        'Teade 5 (järeldus): naabrid, kes olid „teineteist ainult tervitanud”, tutvusid hoovipäeval.',
        'Teade 6: „peaasi, et oled usaldusväärne ja tuled kokkulepitud ajal”.',
        'Teade 7: „Nimesid ega muid isikuandmeid me eetris ei nimeta.”',
        'Teade 8: „Kui teil on vaja, võin mõnikord ise temaga jalutama minna.”',
      ])),
      twice(patch(why(V4_BLOCKS['050_p_listen'], OLD_WHY['050_p_listen']), { instruction: 'Raadios räägib korteriühistu esimees naabritülidest. Loe enne kuulamist läbi lüngad ja osa 3 väited. Kuula intervjuud kaks korda ja täida lüngad 1–2 kuuldud sõnaga.' })),
      patch(why(V4_BLOCKS['050_p_tf'], OLD_WHY['050_p_tf']), { title: 'Kuulamine 3: õige või vale? (8 punkti)', instruction: 'Sama intervjuu: otsusta kuulamise ajal või kohe pärast, kas väide on õige või vale. Väide on õige ainult siis, kui esimees ütleb seda saates.', statements: [
        ['Peetri juhitud majas elab umbes sada kakskümmend inimest ja vähemalt kakskümmend koera.', true],
        ['Talvel kurdavad Peetri maja elanikud kõige rohkem selle pärast, et lund ei koristata maja eest.', false],
        ['Peeter otsustab tavaliselt juba esimese kaebuse järel, kumb naaber on tülis süüdi.', false],
        ['Enne ühist kohtumist räägib Peeter kummagi naabriga eraldi ja kuulab mõlemat.', true],
        ['Peetri arvates on kõige parem arutada tüli selle naabri köögis, kes kaebuse esitas.', false],
        ['Peetri sõnul aitab majagrupp tülisid kiiresti lahendada, sest kõik näevad sõnumeid kohe.', false],
        ['Seda, et kaebusi majagrupis ei arutata, otsustasid naabrid üheskoos üldkoosolekul.', true],
        ['Remondi ajal tohtis pere puurida ainult hommikul, enne kui alumine naaber magama läks.', false],
      ].map(([text, ok]) => ({ text, answer: ok ? 'true' : 'false' })) }),
      B.rubric('050_t_rubric', 'Rääkimise punktid ja kontrolli tulemus.', 'Eksamineerija hindab rääkimist neljas osas, igaüks 0–3 punkti; seejärel liidetakse kõik punktid kokku.', [
        'Sõnavõtt (seisukoht, põhjus näitega, vastuargument) … / 3 · kokkulepe (tunne ja põhjus, mõistab teise huvi, reageerib uuele asjaolule, konkreetne kokkulepe) … / 3',
        'Sõnavara (täpne, iseloomu ja tunde sõnad, sidendid) … / 3 · grammatika ja ladusus (omadus nimisõnana, tunde sõna kääne ja -ki / -gi, kaudne kõne, tingiv ettepanek ja tingimus; vead ei sega mõistmist) … / 3',
        'Kuulamine … / 25 · rääkimine … / 12 · kokku … / 37. Harno: sooritatud alates 60 % (23/37) ja ükski osa ei ole 0 punkti. KeeleSepp: eksamiks valmis alates 70 % (26/37), tunnistus alates 80 % (30/37) — sisemine lävi.',
      ]),
      retire('050_d_how', CUT_CONTROL),
      retire('050_d_vocab', CUT_CONTROL),
      retire('050_d_rpart', CUT_CONTROL),
      retire('050_d_read', CUT_CONTROL),
      retire('050_d_mc', CUT_CONTROL),
      retire('050_d_para', CUT_CONTROL),
      retire('050_d_cloze', CUT_CONTROL),
      retire('050_d_bank', CUT_CONTROL),
      retire('050_d_reply', CUT_CONTROL),
    ],
    practice: [
      retire('050_p_how', CUT_CONTROL),
      retire('050_p_kpart', CUT_CONTROL),
      retire('050_p_fix', CUT_CONTROL),
      retire('050_p_trans', CUT_CONTROL),
      retire('050_p_notes', 'L1 is now 050_p_clips: eight clips of 35–45 s, each its own recording heard once (v5 G6, Harno L1)'),
      retire('050_p_self', CUT_CONTROL),
    ],
    transfer: [
      retire('050_t_situation', CUT_CONTROL),
      retire('050_t_product', 'the module product is the talk 050_t_deal (v5 §5: one sheet, listening + speaking)'),
      retire('050_t_wpart', CUT_CONTROL),
      retire('050_t_letter', CUT_CONTROL),
      retire('050_t_essay', CUT_CONTROL),
      retire('050_t_present', 'speaking 1 is now the parallel new task 050_t_cold (same conditions as the cold task 046_d_cold, no phrases)'),
      retire('050_t_debate', CUT_CONTROL),
      retire('050_t_self', CUT_CONTROL),
    ],
  },
}, {
  'b1b2-046': 'LUGE R→S', 'b1b2-047': 'RÄÄK L→S', 'b1b2-048': 'KIRJ R→W', 'b1b2-049': 'PROJ L→S', 'b1b2-050': 'EKS',
});

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js). Since v5 the explanations travel with each block (why(block, lines)); this map is empty and
// kept for courseSheet.js withExplanations.
export const EXPLAIN = {};
