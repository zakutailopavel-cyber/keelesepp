// B2 course (B1 → B2 roadmap), module 12 „Tehnoloogia ja sotsiaalmeedia” (b1b2-056…060), stage B2-.
// Methodology v5 „lesson budget” (docs/METHODOLOGY_B1_B2_V5.md) AND methodology v6 (docs/METHODOLOGY_V6.md, gates G14–G25),
// built on the pattern of module 11 (the first v6 module). On the v3 station engine with the v4 task formats.
// Module goal (the learner): „Ma saan digimaailmas ise hakkama ja aitan teisi: seletan e-riigi teadet lihtsas keeles,
// otsustan, mida tehisintellektile anda, kontrollin postitust enne jagamist ja kaitsen oma andmeid.” Technology from the
// learner's own angle: a neighbour's e-state notice, the AI tool at work or on the course, a post in the group chat, the
// apps on the phone. Nobody has to tell his real data: every task allows a typical or invented case.
//   Avasta  (4): station 1 — 056 the module's COLD TASK in speech (1 min to think, 1 min to talk, no phrases; module 11
//                measured writing, module 12 measures speaking; its parallel is 060_t_cold), 057–059 the 5-min
//                „Parandatud versioon” of the previous lesson's draft (data.revisionOf, v6 G16); station 2 the words (10
//                + 3 review words from 3–15 lessons back, data.review, v6 G18), ONE input and one scheme — reading
//                ≈ 470–500 words with 3 inference questions (056 „E-riik: mugav kõigile või ainult osavatele?”, 058 „Miks
//                me jagame valet, kuigi me ei taha?”) or listening ≈ 3.5–4 min, 2 voices (057 and 059 „Digitund”), a
//                reading / listening strategy line in the instruction.
//   Harjuta (3–4): the rule box (B1 one-line review, B2 step, one L1-contrast line „Vene keeles …”), one form task of 10
//                items that PRODUCES the rule box's bold forms (hint = the dictionary form, never the answer; v6 G15), one
//                second task of 8 rows, and the 10-min DRAFT of the home text in class (056–058; in 059 the in-class
//                product is the project text itself).
//   Kasuta  (5): station 4 the main task — a type module 11 did not use, except the module's one mediation (v6 G17):
//                056 mediation, 057 survey, 058 presentation, 059 project — each with an „Abikaart” and a
//                „Lisaväljakutse” (data.support / data.stretch, v6 G24) and hidden information on the teacher's card
//                (v5 G9); the EXIT in the main task's skill (v6 G14: 056–058 30–60 s of speech, 059 one line of the
//                project rewritten after the peer's wish); the self-check with 3 criteria rated 0–1–2 and one own
//                sentence as evidence; the home text (finish the draft, ~140 / ~180 words, 1-min voice message,
//                „Harjuta → moodul 12”); the analytic Harno B2 rubric with a borderline sample (v5 G10).
//   056 quest   „Kas sa saad e-riigis ise hakkama?”                   reading   impersonal present + its negative  mediation
//   057 debate  „Mida tohib tehisintellektilt küsida — ja mida mitte?”  radio     -mine / -ja nouns (official style)  survey
//   058 facts   „Kas see uudis on tõsi? Kontrolli, enne kui jagad”      reading   impersonal past and perfect         presentation
//   059 project „Mida sinu telefon sinust teab?”                        radio     terms ↔ plain words (-mine ↔ -takse) project
//   060 exam    Kontroll 12 (vahehindamine 3): one sheet, 45 min, LISTENING + SPEAKING (m10 L + S, m11 R + W). Why the
//                short form and not the full four-skill mock that v5 §5 lists at B2 060: v6 §2 g (the course blueprint:
//                „B2, lesson 5 of a module: 2 skills alternating”) wins over v5 for a v6-strict module, as the
//                coordinator did for 040 (b2/module08.js); reading and writing of lessons 41–55 were tested in 045–055,
//                the next full mock is 080. Why L + S: the module's cold task is spoken (056_d_cold), so its parallel is
//                spoken; e-services, scam calls and house-chat rumours reach the learner as notices and voice messages.
// Real network (v6 G25): real document + link task 056_t_guide (eesti.ee, a 3-item task — the page was not opened by the
// author), media log 058_t_msg („Minu eesti keele võrgustik”), peer exchange 059_t_guide (another pair answers with two
// stars and a wish). Mediation 056_t_call; peer feedback round 059 (v6 §2 l). Texts are adapted learning texts
// („KeeleSepp õppetekst”) without exact statistics (owner 2026-11-25); no story cast, no dictation, no „Kas teadsid?”.
// Module 11's last product (the control letter 055_t_claim) is revised in 056's home task (three marked sentences into
// „Minu vead” in Harjuta): station 1 of 056 holds the cold task, and the sheet has no room for a second 5-min block.
// Kept: lesson ids, titles, topics, the v4 formats; the v4 lessons of 2026-11-19 are kept below as V4 and every block that
// is not on a v6 sheet is taken from there with retire() (hidden, id and learners' answers kept, old explanations in
// OLD_WHY). A kept id keeps its block type.
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
// the home task card at the end of every lesson
const homework = (id, items) => B.phrasebank(id, [['Kodutöö', items]]);
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 12. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';
// nobody has to tell a real story from his own life
const OWN_OR_INVENTED = 'Võid rääkida oma, tuttava või väljamõeldud loo.';

export const MODULE = { id: 'b1b2-module-12', course: 'b2', title: 'Tehnoloogia ja sotsiaalmeedia', level: 'B2-', design: 'v3-stations', template: 'v4' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });
// L1 as on the exam: every short clip is its own recording (tools/listening-audio, `questions[i].script`, one play
// button a clip); the block's transcript stays the whole text the teacher reads
const perClip = (block) => {
  const clips = String(block.data.transcript).split('\n').map((line) => line.replace(/^[^:]{1,20}:\s*/, '').trim()).filter(Boolean);
  return { ...block, data: { ...block.data, questions: block.data.questions.map((q, i) => ({ ...q, script: clips[i] })) } };
};


// the v4 lessons of 2026-11-19 („task-based”): the source of every block that is not on a v6 sheet
const V4 = {
  'b1b2-056': {
    title: 'Kas sa saad e-riigis ise hakkama?',
    phases: grammar('Keel: umbisikuline olevik — kuidas midagi tehakse: retsept kirjutatakse välja, dokument allkirjastatakse, paberit ei anta'),
    format: 'quest',
    topic: 'town',
    canDo: 'Ma kasutan e-riigi teenuseid ise ja seletan teisele samm-sammult, kuidas asju aetakse (retsept kirjutatakse välja, paberit ei anta, dokument allkirjastatakse PIN2-ga); kirjutan abi vajavale inimesele selge juhendi.',
    teacherPage: {
      goal: 'Квест по e-Eesti: ID-карта, PIN1/PIN2, цифровой рецепт, место жительства, e-выборы. Ученик помогает соседке и объясняет «как это делается» (tehakse, ei tehta).',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 1 вопрос; станция 2 — только 4 вопроса из 8, текст темы дочитать дома; станция 3 — правило и 4 строки; станция 4 — голосовое и звонок только по двум контрольным пунктам (рецепт и PIN-коды).',
      hook: '«Что тебе проще: сделать дело в интернете с ID-картой или Smart-ID — или пойти в учреждение и постоять в очереди? Одно дело, которое ты недавно сделал онлайн, и одно, ради которого всё-таки пришлось идти лично». Ответьте сами одной фразой, потом ученик. «Я всё делаю через детей» — тоже честный ответ.',
      plan: [
        '0–4: крючок — онлайн или в очереди, ученик отвечает сразу',
        '4–15: станция 1 — разговор: какие e-услуги я использую, чего боюсь, кто мне помогает',
        '15–30: станция 2 — слова (2 мин), прогноз карандашом по 8 вопросам, текст темы «E-riik: mis on päriselt internetis?», проверка прогноза',
        '30–42: станция 3 — заметить в тексте «kirjutatakse välja», «paberit ei anta» → правило → памятка соседке: 7 пропусков',
        '42–57: станция 4 — голосовое соседки (6 пропусков), четыре контрольные карточки, в субботу у соседки на кухне: объяснить шаг за шагом',
        '57–69: «Kui aega jääb» — мини-дебаты «бумага или экран: должно ли государство оставить выбор?»',
        '69–76: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: письмо-инструкция соседке, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Текст темы и карточки: ERR / The Baltic Times (12.2024) — с декабря 2024 заявление о разводе подаётся онлайн, по словам государства это последняя услуга, ставшая электронной; одна встреча с чиновником остаётся; valimised.ee и ERR News — Riigikogu 2023: 312 181 e-голос, 51,1 % всех голосов, впервые больше половины (2015 — 30,5 %, 2019 — около 44 %); ERR News, Tervisekassa — цифровой рецепт с 2010 г., ≈ 99 % рецептов; RIA «Andmejälgija» (с 2017 г., в eesti.ee видно, кто смотрел твои данные в государственных базах, охват неполный); ID-карта: PIN1 — вход, PIN2 — подпись, три неверные попытки блокируют код, PUK разблокирует; цифровая подпись равна собственноручной; регистрация места жительства — через eesti.ee или в самоуправлении (в течение 30 дней после переезда, с согласия владельца жилья). Соседка Наталья — учебная.',
      groups: 'Станция 1 — в парах. Прогноз и текст — каждый сам, сверка в паре. Станция 4: один — Наталья (карточка учителя), другой объясняет по карточкам; потом смена, второй берёт другие два пункта. В 1:1 Наталья — вы.',
      errors: [
        '«Retsept kirjutakse» → «kirjutatakse» (безличная форма от da-инфинитива: kirjutada → kirjutatakse).',
        '«Paberit ei antakse» → «ei anta» (в отрицании короткая форма: ei tehta, ei anta, ei küsita).',
        '«Dokument allkirjastatakse PIN1-ga» → «PIN2-ga» (PIN1 — вход, PIN2 — подпись).',
        '«Retsepti kirjutatakse välja» — частичный объект возможен при процессе; для одного рецепта естественнее «retsept kirjutatakse välja».',
      ],
      notes: [
        'Формат — квест: четыре контрольных пункта (рецепт, место жительства, PIN-коды, e-голосование). Ученик проходит их с карточками и объясняет соседке; учитель отмечает пройденные пункты на доске.',
        'Пенсионеру — он может играть себя и спросить то, что сам не знает; студенту — регистрация места жительства в общежитии; маме в декрете — рецепт для ребёнка; уставшему — только два пункта. Тему выборов не обсуждаем политически: только как технически голосуют.',
        'Обратная связь, 2–3 цели: безличная форма настоящего (-takse / -dakse) и её отрицание; порядок шагов (kõigepealt, siis, lõpuks); вежливое объяснение без «это же просто».',
      ],
    },
    discover: [
      station(B.text('056_d_hook', 'Internetis või järjekorras?', 'Mis on sinu jaoks lihtsam: ajada asi internetis ID-kaardi või Smart-ID-ga või minna kohale ja oodata järjekorras? Ütle kohe üks asi, mille tegid viimati internetis, ja üks, mille pärast pidid siiski kohale minema.'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('056_d_talk', 'Mina ja e-riik.', `Vasta igale küsimusele ja too näide. ${OWN_OR_INVENTED}`, [
        'Milliseid e-teenuseid sa kasutad kõige sagedamini ja milliseid mitte kunagi?',
        'Kes aitab sind, kui midagi ei tööta — või keda aitad sina?',
        'Mille poolest erineb asjaajamine Eestis riigist, mida sa hästi tead?',
      ], [150, 210], ['Ma kasutan kõige sagedamini …', 'Ma ei julge veel …, sest …', 'Seal, kus ma varem elasin, …']), 'Sinu enda kogemus näitab, millised kontrollpunktid sul juba läbitud on.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise üks lugu, kus e-teenus ei töötanud. Ära paranda; lõpus ütle üks sõna, mida õpilane vajas ja ei teadnud. Kui õpilane ütleb „kõike teevad lapsed”: „Mida sa tahaksid ise osata?”')),
      station(tag(B.vocab('056_d_vocab', 'Enne lugemist: sõnad.', ['ID-kaart — ID-карта', 'PIN-kood — PIN-код', 'sisse logima — входить (в систему)', 'allkirjastama — подписывать', 'digiallkiri — цифровая подпись', 'retsept — рецепт', 'välja kirjutama — выписывать', 'riigiportaal — государственный портал', 'elukoht — место жительства', 'hääletama — голосовать']), { topic: ['digiallkiri', 'riigiportaal'] }), 2, 15),
      B.topicOpener('056_d_open', 'Moodul 12. E-riik: mis on päriselt internetis?', [
        'Eestis on harjutud, et riigiga suheldakse arvuti või telefoni kaudu. ID-kaart on Eesti kodaniku põhiline isikut tõendav dokument ja sellel on kaks koodi: PIN1 on sisselogimiseks ja PIN2 allkirjastamiseks. Kui koodi sisestatakse kolm korda valesti, blokeeritakse see ja selle saab avada PUK-koodiga. Allkiri, mis antakse ID-kaardi ja PIN2-ga, on seaduse järgi sama väärtuslik kui allkiri paberil. Telefonis teevad sama tööd mobiilsed lahendused, mida paljud kasutavad juba rohkem kui kaarti.',
        'Paljud teenused on nii tavalised, et me ei mõtle nende peale. Retsept kirjutatakse välja digitaalselt juba alates 2010. aastast ja praegu on digitaalsed peaaegu kõik retseptid, umbes 99 protsenti. Apteegis näidatakse isikut tõendavat dokumenti ja ravim antakse kätte, paberit ei anta. Riigikogu valimistel anti 2023. aastal esimest korda üle poole kõigist häältest arvutis. Kaheksa aastat varem oli see osa umbes kolmandik.',
        '2024. aasta detsembris jõudis Eesti verstapostini, millest kirjutati ka välismaal: abielu lahutamise avalduse saab nüüd esitada internetis. Riigi sõnul oli see viimane riigiteenus, mis veel veebi ei olnud jõudnud. Täielikult ilma inimeseta asi siiski ei käi: lahutuse puhul tuleb üks kord ametnikuga kohtuda.',
        'Mugavusel on ka teine pool. Kõik ei ole kasvanud arvutiga ja mõnele tundub iga uus nupp ohtlik. Paljud kardavad, et vajutavad midagi valesti ja kaotavad raha või andmed. Seepärast aitavad raamatukogud, kohalikud omavalitsused ja lähedased: kõige paremini õpib inimene siis, kui ta vajutab ise ja keegi istub kannatlikult kõrval. Sageli ei puudu inimesel mitte oskus, vaid julgus.',
        'E-riik tähendab ka seda, et sinu andmed on riigi andmekogudes. Riigiportaalis on alates 2017. aastast andmejälgija, kust saab vaadata, kes on mõnes andmekogus sinu andmeid kasutanud. Kõik andmekogud seal veel ei ole, kuid neid tuleb juurde. Nii saab inimene ise kontrollida, et keegi ei vaata tema andmeid ilma põhjuseta.',
        'Selles moodulis kasutad sa digimaailma ise: ajad asju e-riigis, otsustad, mida tehisintellektilt küsida, kontrollid uudist enne jagamist ja kaitsed oma andmeid. Tunni lõpuks oskad seletada ka teisele, kuidas asju aetakse.',
      ], 'ERR ja The Baltic Times (e-lahutus, detsember 2024); Riigi valimisteenistus, valimised.ee (Riigikogu valimised 2015 ja 2023); ERR News ja Tervisekassa (digiretsept); Riigi Infosüsteemi Amet (andmejälgija)', [
        'Millist teksti fakti sa teadsid ja mis oli sulle uus?',
        'Miks võis arvutis antud häälte osa kaheksa aastaga nii palju kasvada?',
        'Kas riigis, mida sa hästi tead, saab retsepti või allkirja anda ka digitaalselt? Kuidas see seal käib?',
        'Kas sa tahaksid näha, kes sinu andmeid vaatab? Miks?',
      ]),
      teach(tag(purpose(B.choice('056_d_facts', 'Arva ja kontrolli: kontrollpunktid.', 'Enne lugemist arva iga vastus pliiatsiga. Siis loe teksti ja vali õige vastus.', [
        ['Milleks kasutatakse teksti järgi ID-kaardi teist koodi ehk PIN2-te?', 'dokumentide allkirjastamiseks', 'sisselogimiseks', 'koodi avamiseks pärast viga', 'pangakaardiga maksmiseks'],
        ['Mis juhtub teksti järgi siis, kui PIN-koodi sisestatakse kolm korda järjest valesti?', 'kood blokeeritakse', 'ID-kaart kustutatakse', 'politseile saadetakse teade', 'midagi ei juhtu'],
        ['Mida näidatakse apteegis, kui arst on retsepti digitaalselt välja kirjutanud?', 'isikut tõendavat dokumenti', 'paberretsepti', 'arsti tõendit', 'telefoni numbrit'],
        ['Mis juhtus 2023. aasta Riigikogu valimistel Eestis teksti järgi esimest korda?', 'üle poole häältest anti arvutis', 'kõik hääletasid arvutis', 'valimisjaoskonnad suleti', 'arvutis sai hääle anda ainult üks päev'],
        ['Milline riigiteenus jõudis riigi sõnul 2024. aasta detsembris veebi kõige viimasena?', 'abielu lahutamise avaldus', 'digiretsept', 'e-hääletamine', 'elukoha registreerimine'],
        ['Mida tuleb abielu lahutamise puhul ka e-avalduse järel siiski kohapeal teha?', 'üks kord ametnikuga kohtuda', 'tuua paberil avaldus', 'maksta lõiv sularahas', 'tuua kaasa kaks tunnistajat'],
        ['Mida saab inimene teksti järgi näha riigiportaali andmejälgijas?', 'kes on mõnes riigi andmekogus sinu andmeid kasutanud', 'kõik sinu sõnumid', 'kõikide firmade andmed sinu kohta', 'teiste inimeste retseptid'],
        ['Millist järeldust toetaks teksti autor kõige rohkem?', 'e-riik on mugav, kuid inimest vajatakse vahel ikka', 'e-riigis ei ole inimest enam üldse vaja', 'digiallkiri on vähem väärt kui paberil allkiri', 'e-teenused on mõeldud ainult noortele'],
      ], 'full', 'g_read'), 'Näed, mida sa e-riigist juba tead ja milline kontrollpunkt on veel läbimata.'), { task: 'R13', harno: 'R1' }),
      'Eksaminurk (R1): eksamil on pikem artikkel ja valikvastused. Kõigepealt prognoos pliiatsiga (2 min), siis lugemine, siis kontroll. Küsi lõpuks: „Mis üllatas sind kõige rohkem?” Kui õpilane hakkab vaidlema e-valimiste üle, too jutt tagasi tehnikale: kuidas see käib, mitte keda valida.'),
    ],
    practice: [
      station(B.notice('056_p_notice', 'Märka: kuidas seda tehakse?', [
        'Tekstist: retsept **kirjutatakse välja** digitaalselt · apteegis **näidatakse** isikut tõendavat dokumenti · ravim **antakse** kätte, paberit **ei anta**',
        '**Umbisikuline olevik** = tegija ei ole tähtis või on „inimesed üldiselt”. Võta **da-tegevusnimi** ja lisa lõpp -takse või -dakse: kirjutada → **kirjutatakse**, näidata → **näidatakse**, saata → **saadetakse**, hääletada → **hääletatakse**',
        'Lühikese da-vormiga sõnadel: tuua → **tuuakse**, süüa → **süüakse**, teha → **tehakse**, anda → **antakse**, öelda → **öeldakse**',
        '**Eitus**: ei + lühem vorm lõpuga -ta või -da: paberit **ei anta**, koodi **ei küsita**, seda **ei tehta** · Küsimus: **Kas** siin **makstakse** kaardiga?',
        'Sihitis jääb samaks kui tavalauses: arst kirjutab **retsepti** → **retsept** kirjutatakse välja (üks tervik) · arst kirjutab **retsepte** → **retsepte** kirjutatakse (palju, protsess).',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('056_p_forms', 'Meelespea naabrile: kuidas e-riigis asju aetakse.', 'Otsusta, kas lause on jaatav või eitav, ja kirjuta sulgudes olev tegusõna umbisikulise oleviku vormis.', [
        'Riigiportaali [logitakse] sisse ID-kaardi, Mobiil-ID või Smart-ID-ga. (logima)',
        'Dokument [allkirjastatakse] PIN2-ga, mitte PIN1-ga. (allkirjastama)',
        'Arsti juures paberretsepti enam [ei anta]. (andma, eitus)',
        'Elukoht [registreeritakse] riigiportaalis 30 päeva jooksul pärast kolimist. (registreerima)',
        'Pangast või politseist ei [küsita] kunagi telefonis sinu PIN-koode. (küsima)',
        'Arvutis hääletades [tehakse] valik ekraanil ja kinnitatakse PIN2-ga. (tegema)',
        'Kui koodi sisestatakse kolm korda valesti, [suletakse|blokeeritakse] see ajutiselt. (sulgema)',
      ], '', 'full', 'g_notice'), 'Naaber loeb su meelespead ja teab, kuidas asjad käivad, ilma et peaks iga kord helistama.'), { task: 'G02' }),
      'Pärast iga rida küsi: „Kes seda teeb? Kas tegija on oluline?” Rida 3 ja 5: eitus lühema vormiga (ei anta, ei küsita). Rida 6: teha → tehakse. Rida 7: sulgema → suletakse (blokeeritakse on ka õige). Lisa küsimus: „Mida sina oskad juba ise teha?”'),
    ],
    transfer: [
      station(teach(tag(purpose(B.listening('056_t_voice', 'Naabri häälsõnum.', 'Naaber Natalja saatis sulle häälsõnumi. Enne kuulamist arva: mida ta küsib? Siis kuula kaks korda ja kirjuta lünka 1–2 sõna.', [
        'Tere, siin Natalja, sinu naaber kolmandalt korruselt. Vabandust, et tülitan.',
        'Mu tütar elab nüüd Soomes ja tema ajas kõik minu asjad internetis. Nüüd pean ise hakkama saama.',
        'Mul on kolm muret. Esiteks: perearst ütles, et kirjutas mulle uue retsepti, aga paberit ma ei saanud. Kuidas ma ravimi apteegist kätte saan?',
        'Teiseks: ma kolisin eelmisel kuul siia ja keegi ütles, et elukoht tuleb registreerida. Kas selleks peab linnavalitsusse minema?',
        'Ja kolmandaks: mul on ID-kaart ja kaks PIN-koodi, aga ma ei mäleta, kumb on milleks. Ma kardan, et vajutan midagi valesti ja kõik läheb lukku.',
        'Kas sa saaksid mulle laupäeval kümme minutit seletada? Mul on kook ka. Aitäh!',
      ], [
        'Natalja tütar, kes varem kõik asjad internetis ajas, elab praegu [Soomes].',
        'Perearst ütles, et kirjutas Nataljale uue [retsepti], aga paberit ta ei saanud.',
        'Natalja kolis uude koju [eelmisel kuul] ja peab nüüd elukoha registreerima.',
        'Natalja küsib, kas elukoha registreerimiseks peab ise kohale minema [linnavalitsusse].',
        'Natalja on segaduses, sest ta ei mäleta, kumb [PIN-kood|kood] on milleks.',
        'Natalja palub, et sa tuleksid talle [laupäeval] kümneks minutiks appi.',
      ], 'g_read'), 'Su märkmed on Natalja kolm küsimust — need on sinu kontrollpunktid.'), { task: 'L04' }),
      'Kuulamise tsükkel: 1) prognoos: „Mida naaber küsib?”; 2) esimene kuulamine — „Mitu muret tal on?”; 3) teine — lüngad; 4) detail: „Miks ta ise ei oska?”; 5) üks lause: „Mida sina temast mõistad?” Ära lase õpilasel naerda: „see on ju lihtne” ei ole abi.'), 4, 15, { final: 'explain' }),
      tag(purpose(B.profiles('056_t_cards', 'Neli kontrollpunkti.', 'Loe kaarte. Igal kaardil on üks samm, mida Natalja vajab. Mõtle, millises järjekorras sa talle seletad.', [
        ['1. Digiretsept', ['arst saadab retsepti retseptikeskusesse', 'apteegis näidatakse ID-kaarti või öeldakse isikukood', 'ravimi võib välja osta ka teine inimene (näiteks pereliige), kui ta teab sinu isikukoodi', 'paberit ei anta'], []],
        ['2. Elukoht', ['elukoht registreeritakse 30 päeva jooksul pärast kolimist', 'riigiportaalis eesti.ee või kohalikus omavalitsuses', 'kui korter ei ole sinu oma, on vaja omaniku nõusolekut', 'kohale ei pea minema, kui ID-kaart töötab'], []],
        ['3. PIN-koodid', ['PIN1 — sisselogimiseks (4 numbrit)', 'PIN2 — allkirjastamiseks (5 numbrit)', 'kolm valet katset → kood blokeeritakse, PUK avab', 'koode ei kirjutata ID-kaardi ümbrisele'], []],
        ['4. Valimised arvutis', ['hääle saab anda eelhääletamise päevadel arvutis', 'sisse logitakse PIN1-ga, valik kinnitatakse PIN2-ga', 'arvutis antud häält saab muuta, kui annad uue hääle', 'ka valimisjaoskonnas võib hääletada'], []],
      ], '2', 'g_read'), 'Kaardid annavad sulle iga sammu, mida Natalja vajab; sina teed neist lihtsa seletuse.'), { task: 'R08' }),
      teach(tag(purpose(B.rolecards('056_t_call', 'Laupäeval Natalja köögis.', 'Seleta Nataljale tema köögilaua taga samm-sammult, kuidas ta oma kolm muret ise lahendab. Kasuta umbisikulist olevikku ja ütle järjekord.',
        'Olukord: sinu naaber (või sinu ema, tädi, vanaisa — vali ise) on uues kodus ja ei saa e-teenustega hakkama.\nSinu eesmärk: seleta talle kolm kontrollpunkti (retsept, elukoht, PIN-koodid) nii, et ta saab ise hakkama.\nPiirang: ära tee asju tema eest — ütle, kuidas seda tehakse, ja kontrolli, kas ta sai aru.',
        'Natalja kaart on õpetajal: tema hirm ja üks lisaküsimus.',
        ['Kõigepealt logitakse sisse …', 'Siis valitakse …', 'Retsepti puhul paberit ei anta, vaid …', 'PIN1 on …, PIN2 on …', 'Kas sa said aru? Ütle oma sõnadega.'], ['Aga mis siis, kui …?', 'Kas seda tehakse ka …?', 'Ma kardan, et …']), 'Tulemus: Natalja teab, mida teha, ja saab järgmine kord ise hakkama.'), { task: 'S13', level: 4 }),
      'Õpetaja kaart (Natalja). Ütle ainult seda, mida küsitakse. Varjatud info: sa kirjutasid PIN-koodid ID-kaardi ümbrisele; sa ei ole korteri omanik, korter on tütre nimel; sa tahaksid ka valimistel hääletada, aga kardad internetti. Takistused ükshaaval: 1) „Ma kirjutasin koodid kaardi peale, et ei unustaks.” 2) „Aga korter on tütre oma.” 3) „Kas ma võin ka paberil hääletada?” Õnnestunud, kui õpilane seletab vähemalt kolm sammu umbisikulises olevikus (sh üks eitus), ütleb järjekorra (kõigepealt, siis, lõpuks), kontrollib, kas Natalja sai aru, ja ei tee asju tema eest.'),
      extension(teach(tag(purpose(B.speaking('056_t_more', 'Minidebatt: paber või ekraan?', 'Kas riik peaks jätma igale teenusele ka paberil või kohapeal asjaajamise võimaluse? Õpetaja on alguses vastu, sina poolt; siis vahetage pooli ja leidke kompromiss.', [
        'Kellele on kohapeal asjaajamine vajalik ja miks?',
        'Mida maksab riigile kahe süsteemi pidamine ja mida saaks selle raha eest teha?',
        'Milline lahendus sobiks mõlemale poolele?',
      ], [120, 180], ['Minu arvates peaks riik …, sest …', 'Teisalt …', 'Näiteks minu naaber …', 'Kompromiss võiks olla, et …']), 'Arutelu näitab, et e-riigi küsimus ei ole ainult tehniline.'), { task: 'S14' }),
      'Kui aega jääb (12 min). Esimeses voorus oled vastu (kulud, aeglus), teises poolt (valikuvabadus, eakad, maapiirkonnad). Õnnestunud, kui õpilane toob mõlemas voorus vähemalt ühe näite ja jõuab lõpus kompromissini (näiteks raamatukogude digiabi).'), 12),
      tag(exitCheck(purpose(B.gaps('056_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev tegusõna umbisikulise oleviku vormis.', [
        'Kui arst kirjutab retsepti digitaalselt välja, siis paberit patsiendile enam [ei anta]. (andma, eitus)',
        'Riigikogu valimistel [hääletatakse] eelhääletamise ajal ka internetis. (hääletama)',
        'Üürilepingud ja muud dokumendid [allkirjastatakse] ID-kaardi ja PIN2-ga. (allkirjastama)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas umbisikuline olevik ja selle eitus on käes.')), {}),
      purpose(B.selfcheck('056_t_self', ['Ma räägin, milliseid e-teenuseid kasutan ja mida veel ei julge.', 'Ma saan aru faktidest e-riigi kohta ja naabri häälsõnumist.', 'Ma kasutan umbisikulist olevikku ja selle eitust: kirjutatakse välja, ei anta.', 'Ma seletan teisele samm-sammult, kuidas asju e-riigis aetakse.'], 'Kontrollpunktid läbitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('056_t_letter', 'Kodus: juhend naabrile.', 'Kirjuta kodus Nataljale (või oma lähedasele) 140–160 sõna: vasta tema kolmele murele, seleta igaühe juures sammud õiges järjekorras ja lisa üks hoiatus. Kasuta vähemalt viit umbisikulist vormi (kirjutatakse, antakse, ei küsita …).', 'Tere, Natalja!', 'Sinu naaber\n(sinu nimi)', [140, 160]), 'Natalja paneb su kirja külmkapi uksele ja saab ise hakkama.')), { task: 'W12', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('056_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: üks e-teenus, mida sa kasutad, ja kuidas seda tehakse.', [
        'Milline teenus see on ja milleks seda vajad?',
        'Kuidas seda tehakse — samm-sammult?',
      ], [60, 120]), 'Õpetaja kuulab, kas sammud on selged ja umbisikulised vormid õiged.')), { task: 'S15' }),
      homework('056_t_homework', ['1. Juhend naabrile, 140–160 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-057': {
    title: 'Mida tohib tehisintellektilt küsida — ja mida mitte?',
    phases: grammar('Keel: -mine ja -ja ametlikus tekstis — isikuandmete sisestamine, faktide kontrollimine, kasutaja, saatja'),
    format: 'debate',
    topic: 'work',
    canDo: 'Ma loen töökoha või kursuse juhendit tehisintellekti kasutamise kohta, arutlen argumendikaartidega, mida tohib masinale anda ja mida mitte, ning sõnastan reeglid ametlikus stiilis (isikuandmete sisestamine on keelatud, vastutab saatja).',
    teacherPage: {
      goal: 'Дебаты: что можно доверить ИИ на работе или на курсе. Правила (R2b), карточки A/B, общие правила; номинализация -mine/-ja (isikuandmete sisestamine, kasutaja).',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: голосование и 1 вопрос; станция 2 — правила и 4 вопроса из 8; станция 3 — правило и 4 строки; станция 4 — один раунд дебатов без смены позиции.',
      hook: '«Три ситуации — да или нет, сразу: 1) просишь ИИ исправить ошибки в своём письме-жалобе; 2) вставляешь анализы от врача и спрашиваешь, что с тобой; 3) загружаешь резюме коллеги и просишь его оценить». Голосуйте оба, причину — одной фразой. Ученик, который ИИ не пользуется, голосует «как я думаю».',
      plan: [
        '0–3: крючок — три ситуации, да или нет',
        '3–10: станция 1 — разговор: пользуюсь ли я ИИ и для чего',
        '10–25: станция 2 — слова (2 мин), правила рабочего места, 8 коротких ответов (R2b); данные Eurostat — устно (они есть в экзамене 060)',
        '25–37: станция 3 — заметить «isikuandmete sisestamine», «kasutaja» → правило → 7 правил из живого языка в официальный и обратно',
        '37–52: станция 4 — переписка двух коллег (аргументы обеих сторон), дебаты по карточкам A / B, смена позиции, общее решение: три правила',
        '52–64: «Kui aega jääb» — игра: расставить 7 запросов к ИИ от безопасного к рискованному',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: рассуждение, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: '«Kas teadsid?»: Eurostat, новость 16.12.2025 и 10.02.2026 (опрос ИКТ в домохозяйствах 2025): генеративный ИИ использовали 32,7 % жителей ЕС 16–74 лет, в Эстонии 46,6 % (2-е место после Дании); 16–24 лет — ЕС 63,8 %, Эстония 82,8 %; для работы — ЕС 15,1 %, Эстония 25,1 %; Министерство образования (hm.ee): программа TI-Hüpe с 1.09.2025, ≈ 20 000 учеников 10–11 классов и их учителя; регламент ЕС об ИИ: человек должен знать, что говорит с чат-ботом. Правила рабочего места — учебные (составлены по принципам GDPR: личные данные не вносят в чужую систему).',
      groups: 'Голосование — все вместе. Правила и вопросы — каждый сам, сверка в паре. Дебаты в группе: половина — карточка A, половина — B, через 4 минуты смена; в конце группа пишет три общих правила на доске. В 1:1 вы — другая сторона.',
      errors: [
        '«Isikuandmed sisestamine on keelatud» → «Isikuandmete sisestamine» (объект глагола становится родительным падежом перед -mine).',
        '«Kontrollimine faktide» → «faktide kontrollimine» (определение стоит перед словом).',
        '«Teksti vastutab saatja» → «Teksti eest vastutab saatja» (vastutama + eest).',
        '«Kasutajad peab kontrollima» → «Kasutaja peab kontrollima» / «Kasutajad peavad …» (согласование числа).',
      ],
      notes: [
        'Формат — дебаты с голосованием: сначала личное «да / нет», потом карточки A / B, потом смена позиции и общее решение. Работа появляется в модуле один раз — здесь; ученику без работы те же правила как правила языковой школы или курса (карточка на листе это говорит).',
        'Студенту — ИИ и домашние задания (TI-Hüpe в гимназиях); пенсионеру — «я не пользуюсь, но внук пользуется»: он может играть осторожную сторону; маме в декрете — ИИ для писем в детский сад и врачу (тема личных данных ребёнка!).',
        'Обратная связь, 2–3 цели: -mine с родительным падежом объекта; -ja как деятель; аргумент + пример + вывод вместо «ИИ хороший / плохой» (внимание дорожной карты).',
      ],
    },
    discover: [
      station(B.text('057_d_hook', 'Jah või ei?', 'Kas annaksid selle ülesande tehisintellektile? 1) Palud parandada oma kaebuskirja vead. 2) Kirjutad sisse oma vereanalüüsi tulemused ja küsid, mis sul viga on. 3) Laadid üles kolleegi CV ja palud seda hinnata. Ütle iga kohta kohe jah või ei ja üks põhjus.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('057_d_talk', 'Mina ja tehisintellekt.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Kas sa kasutad vestlusrobotit? Milleks — või miks mitte?',
        'Millal on masin sind aidanud ja millal eksinud?',
        'Mida sa tehisintellektile kindlasti ei räägiks? Miks?',
      ], [150, 210], ['Ma kasutan seda, kui …', 'Kord juhtus nii, et masin …', 'Ma ei paneks sinna kunagi …, sest …']), 'Sinu enda kogemus näitab, kus on sinu piir.'), { task: 'S11', fluency: true }),
      'Üks-ühele: räägi ka ise, milleks sa tehisintellekti kasutad või ei kasuta. Kui õpilane pole kunagi proovinud, küsi: „Mida sa tahaksid, et ta sinu eest teeks?” Hääletuse tulemused kirjuta tahvlile — tund lõpeb nendega.')),
      station(tag(B.vocab('057_d_vocab', 'Enne lugemist: sõnad.', ['tehisintellekt — искусственный интеллект', 'vestlusrobot — чат-бот', 'isikuandmed — персональные данные', 'sisestama — вводить', 'kontrollima — проверять', 'vastutus — ответственность', 'vastutama — отвечать (за что-то)', 'kasutaja — пользователь', 'lubatud — разрешено', 'keelatud — запрещено']), { topic: ['isikuandmed', 'vestlusrobot', 'tehisintellekt'] }), 2, 15),
      B.text('057_d_rules', 'Juhend: tehisintellekt igapäevatöös', '**Lubatud:** tekstide keeleline parandamine, ideede kogumine, pikkade dokumentide kokkuvõtete tegemine ja avalike tekstide tõlkimine.\n\n**Keelatud:** klientide ja kolleegide isikuandmete sisestamine (nimi, isikukood, terviseandmed), firma lepingute ja hinnapakkumiste üleslaadimine ning töötajate hindamine masina abil.\n\n**Isikuandmed:** kui sa ei ole kindel, kas tekstis on isikuandmeid, eemalda enne sisestamist kõik nimed ja numbrid. Tööks kasutatakse ainult firma kontot, mitte oma isiklikku kontot.\n\n**Kontrollimine:** iga masina kirjutatud teksti loeb enne saatmist läbi inimene. Faktide, numbrite ja seaduste kontrollimine on kasutaja kohustus.\n\n**Vastutus:** kliendile saadetud teksti eest vastutab alati selle saatja, mitte programm.\n\n**Teavitamine:** kui kliendile vastab vestlusrobot, peab klient seda teadma.\n\n**Uued tööriistad:** uue programmi kasutuselevõtt kooskõlastatakse enne IT-osakonnaga, et andmed jääksid turvaliseks.\n\n*Kui sa ei tööta, mõtle oma keelekursuse või kooli reeglitele: need on väga sarnased.*\n\n*Allikas: juhendi põhimõtted tulevad isikuandmete kaitse üldmäärusest ja Euroopa Liidu tehisintellekti määrusest (inimene peab teadma, kui ta suhtleb masinaga).*'),
      teach(tag(purpose(B.table('057_d_ask', 'Kolleeg küsib sinult.', 'Vasta juhendi järgi 1–3 sõnaga.', 'Küsimus, Vastus', [
        'Uus kolleeg: „Kas ma võin lasta masinal tõlkida firma lepingut?” | [ei/ei või/ei tohi]',
        'Praktikant: „Kes peab masina teksti enne saatmist läbi lugema?” | [inimene/töötaja/saatja/kasutaja]',
        'Müügijuht: „Kelle kohustus on numbrite kontrollimine?” | [kasutaja/kasutaja kohustus]',
        'Klienditeenindaja: „Kes vastutab kliendile saadetud teksti eest?” | [saatja/teksti saatja]',
        'Personalijuht: „Kas töötajaid võib masina abil hinnata?” | [ei/ei või/ei tohi]',
        'Uus töötaja: „Mille kokkuvõtteid tohib masin teha?” | [pikkade dokumentide/dokumentide]',
        'Klient: „Mida ma pean teadma, kui mulle vastab masin?” | [et see on vestlusrobot/et vastab vestlusrobot/vestlusrobotist]',
        'Kolleeg: „Kellega tuleb uus programm kooskõlastada?” | [IT-osakonnaga]',
      ], 'g_read'), 'Kui tead reegleid, saad vaielda faktidega, mitte ainult tunnetega.'), { task: 'R15', harno: 'R2b' }),
      'Eksaminurk (R2b): eksamil on 200–300-sõnaline teabetekst ja lühivastused 1–3 sõnaga. Siin on tekst lühem, sest põhitöö on arutelu. Küsi pärast: „Milline reegel on sinu arvates liiga range ja milline puudub?”'),
    ],
    practice: [
      station(B.notice('057_p_notice', 'Märka: sisestama → sisestamine, kasutama → kasutaja', [
        'Juhendist: isikuandmete **sisestamine** on keelatud · faktide **kontrollimine** on **kasutaja** kohustus · vastutab teksti **saatja**',
        '**Tegevus kui asi** (ma-tegevusnimi → -mine): sisestama → **sisestamine**, kontrollima → **kontrollimine**, tõlkima → **tõlkimine** · Tegevuse sihitis läheb **omastavasse** ja ette: (sisestada) **andmeid** → **andmete** sisestamine, (kontrollida) **fakte** → **faktide** kontrollimine',
        '**Tegija** (-ja): kasutama → **kasutaja**, saatma → **saatja**, õppima → **õppija**, tõlkima → **tõlkija** · Ka: vastutama → **vastutus**, kasutusele võtma → **kasutuselevõtt**',
        '**Ametlik stiil** (juhend, leping): Isikuandmete sisestamine on keelatud. · **Tavaline jutt**: Isikuandmeid ei tohi sisestada. / Isikuandmeid ei sisestata. (umbisikuline, tund 56)',
        '-mine käändub nagu nimisõna: **kontrollimist** (osastav), **kontrollimiseks** (milleks?), **kontrollimise** eest — Aega kulub **faktide kontrollimisele**.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('057_p_nom', 'Juhendi keel ja tavaline keel.', 'Kirjuta iga lause ümber: kui vihjes on „juhend”, tee -mine- või -ja-vormiga ametlik lause; kui „tavaline”, tee tegusõnaga lause.', [
        ['Kliendi isikukoodi ei tohi masinasse sisestada.', 'juhend: … sisestamine', 'Kliendi isikukoodi sisestamine on keelatud.|Kliendi isikukoodi sisestamine masinasse on keelatud.|Kliendi isikukoodi masinasse sisestamine on keelatud.'],
        ['Masin võib teha pikkadest dokumentidest kokkuvõtteid.', 'juhend: … tegemine', 'Pikkade dokumentide kokkuvõtete tegemine on lubatud.|Pikkade dokumentide kokkuvõtete tegemine masinaga on lubatud.|Pikkadest dokumentidest kokkuvõtete tegemine on lubatud.'],
        ['Inimene, kes saadab kirja, vastutab selle sisu eest.', 'juhend: -ja', 'Kirja saatja vastutab selle sisu eest.|Kirja saatja vastutab kirja sisu eest.'],
        ['Kes programmi kasutab, peab numbrid üle kontrollima.', 'juhend: -ja', 'Programmi kasutaja peab numbrid üle kontrollima.'],
        ['Töötajate hindamine masina abil on keelatud.', 'tavaline: ei tohi', 'Töötajaid ei tohi masina abil hinnata.|Töötajaid ei tohi hinnata masina abil.'],
        ['Avalike tekstide tõlkimine on lubatud.', 'tavaline: võib', 'Avalikke tekste võib tõlkida.|Avalikke tekste tohib tõlkida.|Avalikke tekste võib masinaga tõlkida.'],
        ['Isikuandmete eemaldamine enne sisestamist on kasutaja kohustus.', 'tavaline: kasutaja peab', 'Kasutaja peab isikuandmed enne sisestamist eemaldama.|Kasutaja peab enne sisestamist isikuandmed eemaldama.|Kasutaja peab enne sisestamist eemaldama isikuandmed.'],
      ], 'full', 'g_notice'), 'Juhendi keelt oskad lugeda ja seletada kolleegile tavaliste sõnadega.'), { task: 'G14' }),
      'Pärast iga rida küsi: „Kes teeb? Mida teeb? Kuhu läheb sihitis?” Ridadel 1–2 läheb sihitis omastavasse ette (isikukoodi → isikukoodi sisestamine). Rida 7: kohustus → peab + ma-tegevusnimi. Lisa küsimus: „Milline neist reeglitest on sinu meelest kõige tähtsam?”'),
    ],
    transfer: [
      station(tag(purpose(B.dialogue('057_t_chat', 'Kaks kolleegi arutavad.', 'Loe kahe kolleegi vestlust uue juhendi üle: kumma poolt sa praegu rohkem toetad ja miks?', 'Kaarel', 'Merit', [
        ['A', 'Lugesid uut juhendit? Mulle tundub, et see on liiga range. Ma kirjutan klientidele iga päev kümneid kirju.'],
        ['B', 'Lugesin. Aga mäletad eelmist kuud? Masin pani kliendi kirja vale hinna ja keegi ei märganud.'],
        ['A', 'See oli inimese viga, mitte masina. Kirja saatja oleks pidanud numbrid üle kontrollima.'],
        ['B', 'Just! Seepärast ongi reegel, et vastutab saatja. Ma ei ole masina vastu, ma olen kontrollimata kirjade vastu.'],
        ['A', 'Hea küll. Aga isikuandmete keeld? Ilma kliendi nimeta ei saa ju kirja kirjutada.'],
        ['B', 'Saad küll: lase masinal kirjutada tekst ilma nimeta ja lisa nimi ise lõpus.'],
        ['A', 'Kas kliendile peaks siis ütlema, et kirja aitas kirjutada masin?'],
        ['B', 'Ma ei ole kindel. Arutame seda reedel koosolekul.'],
      ], 'g_read'), 'Vestlusest saad argumente mõlemale poolele, enne kui ise vaidled.'), { task: 'R12' }), 4, 15, { final: 'decide' }),
      teach(tag(purpose(B.truefalse('057_t_tf', 'Mida kolleegid tegelikult arvavad?', 'Otsusta vestluse põhjal iga väite kohta: õige või vale.', [
        ['Kaarel kirjutab tööl klientidele iga päev palju kirju ja peab uut juhendit liiga rangeks.', true],
        ['Merit on täiesti vastu sellele, et tööl kasutataks tehisintellekti.', false],
        ['Eelmisel kuul läks kliendile kiri, kus oli vale hind, sest keegi ei kontrollinud seda.', true],
        ['Meriti arvates võib masin kirjutada kirja ka siis, kui kliendi nimi lisatakse alles hiljem.', true],
        ['Kaarel arvab, et eelmise kuu viga oli masina, mitte inimese süü.', false],
        ['Kolleegid lepivad vestluse lõpus kokku, et kliendile ei öelda masina kasutamisest midagi.', false],
      ], 'full', 'g_read'), 'Kui saad aru teiste argumentidest, saad neile arutelus vastata.'), { task: 'R06' }),
      'Pärast iga väidet küsi: „Kust sa seda näed?” Väide 2: Merit ütleb „Ma ei ole masina vastu”. Väide 5: nad ei ole kindlad ja arutavad reedel — see on avatud küsimus ka sinu arutelus.'),
      teach(tag(purpose(B.rolecards('057_t_debate', 'Arutelu argumendikaartidega.', 'Kas sinu töökohas või kursusel peaks tehisintellekt tohtima kirjutada kirju klientidele (või kodutöid õpetajale)? Ütle alguses oma arvamus kaardi järgi, arutage 4 minutit, vahetage pooli ja jõudke ühiste reegliteni.',
        'Kaart A (poolt): 1) Kiri on kiiresti valmis ja keeleliselt korrektne. 2) Töötajal jääb aega keerulistele juhtumitele. 3) Ka see, kes kirjutab eesti keeles aeglaselt, saab hakkama. Lisa oma näide.',
        'Kaart B (vastu): 1) Masin võib välja mõelda fakte, mida ei ole olemas. 2) Kliendi andmed võivad sattuda võõrasse süsteemi. 3) Kes ise ei kirjuta, see ei õpi. Lisa oma näide.',
        ['Minu arvates tuleks …, sest …', 'Näiteks minu töökohas / kursusel …', 'Sinu mõte on õige, kuid …', 'Kas võiksime kokku leppida, et …?'], ['Ma ei ole päris nõus, sest …', 'Mis saab siis, kui …?', 'Teksti saatja vastutab …', 'Ühine reegel võiks olla: … on lubatud, … on keelatud.']), 'Tulemus: kolm ühist reeglit (lubatud, keelatud, kes vastutab), mida sina oma töökohas või kursusel järgiksid.'), { task: 'S17', main: true }),
      'Õpetaja kaart (teine pool). Alusta kaardi B-ga, kui õpilane valis A, ja vastupidi. Takistused: 1) „Aga kui masin teeb vea ja klient kaebab?” 2) „Kas õpetaja / juht tohib siis ka sinu tööd masinaga hinnata?” 3) Poole vahetus: „Nüüd kaitse teist poolt!” Õnnestunud, kui õpilane toob mõlemal poolel vähemalt ühe argumendi koos näitega, reageerib partneri mõttele (Sinu mõte on õige, kuid …) ja te sõnastate kolm reeglit, vähemalt kaks -mine- või -ja-vormiga.'),
      extension(teach(tag(purpose(B.speaking('057_t_more', 'Mäng: ohutu või riskantne?', 'Järjesta need seitse küsimust tehisintellektile ohutumast riskantsemani ja põhjenda. Õpetaja järjestab ka; võrrelge ja vaielge, kus te ei nõustu.', [
        'Retsept õhtusöögiks sellest, mis külmkapis on.',
        'Ametliku kirja vigade parandamine, kus on sinu nimi ja aadress.',
        'Selgitus, mida tähendab sinu arsti kirjutatud diagnoos.',
        'Kokkuvõte firma uuest lepingust kliendiga.',
        'Kas pangalaenu pakkumine sobib sinu pere eelarvega? (sisestad oma sissetuleku)',
        'Ideed lapse sünnipäevaks.',
        'Vastus küsimusele, kas sinu naaber võib sinu aias puu maha võtta.',
      ], [120, 180], ['See on kõige ohutum, sest …', 'Siin on risk, et …', 'Sellega ma oleksin ettevaatlik: …', 'Ma ei nõustu, sest …']), 'Mäng näitab, et piir ei ole „masin või inimene”, vaid see, mis andmed ja mis vastutus.'), { task: 'S12' }),
      'Kui aega jääb (12 min). Järjesta ise enne õpilast (oma järjestus kaardil peidus). Vaidle vähemalt kahe koha üle. Õnnestunud, kui õpilane nimetab iga riskantse küsimuse juures andmed või vastutuse (isikuandmete sisestamine, faktide kontrollimine).'), 12),
      tag(exitCheck(purpose(B.gaps('057_t_exit', 'Kontrolli end: kolm reeglit.', 'Kirjuta sulgudes oleva sõna põhjal -mine- või -ja-vorm.', [
        'Meie töökoha juhendi järgi on kliendi andmete [sisestamine] vestlusrobotisse keelatud. (sisestama)',
        'Kliendile saadetud kirja sisu eest vastutab alati selle kirja [saatja]. (saatma, tegija)',
        'Numbrite ja faktide [kontrollimine] on iga kasutaja enda kohustus. (kontrollima)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas -mine ja -ja on käes.')), {}),
      purpose(B.selfcheck('057_t_self', ['Ma räägin, milleks kasutan tehisintellekti ja kus on minu piir.', 'Ma loen juhendit ja leian sealt reegli 1–3 sõnaga.', 'Ma kasutan -mine- ja -ja-vorme: isikuandmete sisestamine, kasutaja, saatja.', 'Ma arutlen argumentide ja näidetega ning jõuan teistega ühiste reegliteni.'], 'Reeglid kokku lepitud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('057_t_essay', 'Kodus: arutlus.', 'Kirjuta kodus arutlus (160–180 sõna): kas tehisintellekt peaks sinu töökohas või kursusel olema kirjade kirjutamisel lubatud? Mõlema poole argumendid näitega, järelduseks teie kolm reeglit.', [14, 18], ['ühelt poolt', 'teiselt poolt', 'näiteks', 'kokkuvõttes'], 3), 'Su juht või õpetaja näeb, et oled mõlemat poolt kaalunud.')), { task: 'W14', level: 4 }),
      tag(homeTask(purpose(B.speaking('057_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: sinu kolm reeglit tehisintellektiga — mida sa küsid, mida mitte ja miks.', [
        'Milleks on masin sulle kasulik?',
        'Mida sa sinna kunagi ei kirjuta?',
      ], [60, 120]), 'Õpetaja kuulab, kas reeglitel on põhjus ja näide.')), { task: 'S15' }),
      homework('057_t_homework', ['1. Arutlus, umbes 160–180 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-058': {
    title: 'Kas see uudis on tõsi? Kontrolli, enne kui jagad',
    phases: grammar('Keel: umbisikuline minevik ja täisminevik — küsiti, näidati, on töödeldud, ei ole kinnitatud'),
    format: 'facts',
    topic: 'culture',
    canDo: 'Ma kontrollin uudist või pilti enne jagamist (autor, kuupäev, teised allikad), saan aru uuringust, miks inimesed valet jagavad, kirjutan lühikese faktikontrolli umbisikulise mineviku ja täisminevikuga (jagati, on töödeldud, ei ole kinnitatud) ja annan sõbrale rahulikult nõu.',
    teacherPage: {
      goal: 'Анализ фактов: почему мы делимся ложью (Nature 2021), пять постов по трём вопросам, совет другу; безличное прошедшее и перфект (jagati, on töödeldud, ei ole kinnitatud).',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: игра и 1 вопрос; станция 2 — текст без банка предложений, только 3 вопроса устно; станция 3 — таблица и 4 пропуска; станция 4 — три поста из пяти и короткий ответ другу.',
      hook: '«Правда или ложь, сразу: 1) На выборах в Рийгикогу 2023 года больше половины голосов отдали через компьютер. 2) С января в Таллинне запрещают наличные. 3) Люди делятся ложью в основном потому, что в неё верят». Не раскрывайте ответ: 1 — правда (урок 56), 2 и 3 — ложь (текст урока: люди просто не думают о правде в этот момент).',
      plan: [
        '0–4: крючок — правда или ложь, ученик голосует сразу',
        '4–15: станция 1 — разговор: откуда я беру новости, делился ли я чем-то ложным',
        '15–30: станция 2 — слова (2 мин), прогноз «почему люди делятся ложью?», текст об исследовании в Nature с банком предложений (R4)',
        '30–42: станция 3 — заметить «näidati», «küsiti», «on avaldatud» → таблица безличных форм → факт-чек «Наводнение в Тарту?»: 8 пропусков',
        '42–57: станция 4 — четыре поста и пересланное голосовое (5 пропусков), таблица «делюсь / не делюсь / проверяю», разговор с другом, который уже поделился',
        '57–69: «Kui aega jääb» — игра: два заголовка, один ложный, партнёр угадывает',
        '69–76: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: факт-чек для друзей, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Текст станции 2: G. Pennycook, Z. Epstein, M. Mosleh, A. Arechar, D. Eckles, D. Rand, «Shifting attention to accuracy can reduce misinformation online», Nature 592 (2021): правдивость заголовка сильно влияет на оценку точности, но мало — на желание поделиться; короткая просьба оценить точность одного заголовка улучшает качество того, чем делятся потом (опросные эксперименты и полевой эксперимент в Twitter; пресс-релиз MIT Sloan: обмен ложью примерно вдвое меньше). «Kas teadsid?»: фактчекинг Eesti Päevaleht / Delfi с 2017 г. по принципам IFCN (ERR); регламент ЕС об ИИ 2024/1689, ст. 50 — дипфейки маркируются. Исследование MIT 2018 и боковое чтение — в модуле 15, здесь их нет. Посты на станциях 3 и 4 — учебные.',
      groups: 'Игра — все вместе. Текст и банк предложений — каждый сам, сверка в паре. Станция 4: таблица в паре, затем один — друг, который поделился постом (карточка учителя), другой советует; смена с другим постом. В 1:1 друг — вы.',
      errors: [
        '«Pilt töödeldi» и «pilti on töödeldud» — оба правильно: прошедшее (когда-то) и перфект (результат сейчас); «pilt on töödeldatud» — ошибка: -tud от da-основы töödelda → töödeldud.',
        '«Uudist ei jagatud» (прошедшее) ≠ «uudist ei jagata» (настоящее) — следите за временем.',
        '«Seda ei ole kinnitatakse» → «ei ole kinnitatud» (после ei ole — форма на -tud).',
        '«Katses näidati, et inimesed jagavad …» — в придаточном обычный глагол, безличная форма только там, где деятель неважен.',
      ],
      notes: [
        'Формат — анализ фактов: сначала догадка, потом исследование, потом проверка реальных типов фейка (поддельный скриншот, старое фото, дипфейк-реклама, слух без источника). Никаких политических споров: мы проверяем способ, а не мнение.',
        'Пенсионеру — новости из семейного чата и Telegram; студенту — видео и мемы; маме — «опасная игрушка» или слухи в родительских группах; уставшему — достаточно трёх вопросов: кто, когда, где ещё.',
        'Обратная связь, 2–3 цели: безличное прошедшее и перфект (jagati / on jagatud); -tud после ei ole; совет без насмешки над тем, кто поделился.',
      ],
    },
    discover: [
      station(B.text('058_d_hook', 'Tõsi või vale?', 'Ütle iga väite kohta kohe: tõsi või vale? 1) 2023. aasta Riigikogu valimistel anti üle poole häältest arvutis. 2) Jaanuarist keelatakse Tallinnas sularaha. 3) Inimesed jagavad valet peamiselt sellepärast, et nad seda usuvad.'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('058_d_talk', 'Kust ma uudiseid saan?', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Kust sa uudiseid saad: televisioon, uudisteportaal, sotsiaalmeedia, sõbrad?',
        'Kas oled kunagi jaganud midagi, mis osutus valeks? Mis juhtus?',
        'Kas riigis, mida sa hästi tead, usaldatakse ajakirjandust rohkem või vähem kui Eestis?',
      ], [150, 210], ['Kõige sagedamini loen …', 'Kord jagasin …, aga hiljem selgus, et …', 'Ma usaldan …, sest …']), 'Sinu harjumused näitavad, kus vale sinuni kõige kergemini jõuab.'), { task: 'S07', fluency: true }),
      'Üks-ühele: räägi ka ise üks lugu, kus uskusid valet. Ära naera õpilase loo üle. Mängu vastused ütle alles pärast lugemist: 1 on tõsi (tund 56), 2 ja 3 on vale (tekst: inimesed ei mõtle sel hetkel tõele).')),
      station(tag(B.vocab('058_d_vocab', 'Enne lugemist: sõnad.', ['valeinfo — ложная информация', 'allikas — источник', 'väide — утверждение', 'tõend — доказательство', 'kinnitama — подтверждать', 'levima — распространяться', 'jagama — делиться (в соцсетях)', 'töödeldud — обработанный (о фото)', 'kahtlane — подозрительный', 'usaldusväärne — надёжный']), { topic: ['valeinfo'] }), 2, 15),
      teach(tag(purpose(B.insertion('058_d_article', 'Miks me jagame valet?', 'Enne lugemist arva: miks jagavad inimesed valeuudiseid? Siis loe teksti ja kirjuta igasse lünka sobiv lause pangast. Üks lause jääb üle.', 'Miks me jagame valet?', [
        'Miks jagavad inimesed valeuudiseid? Kanada ja Ameerika teadlased uurisid seda mitmes katses, mille tulemused avaldati ajakirjas Nature. [[Katses näidati inimestele päris ja valesid uudiste pealkirju sotsiaalmeediast.]]',
        'Kui küsiti, kas pealkiri on tõsi, eristasid inimesed tõde ja valet hästi. [[Kui aga küsiti, kas nad seda jagaksid, oli vahe palju väiksem.]]',
        'Järeldus oli üllatav. [[Paljud ei jaga valet sellepärast, et nad seda usuvad, vaid sellepärast, et nad ei mõtle sel hetkel tõele.]]',
        'Siis prooviti lihtsat nippi. [[Enne jagamist paluti inimestel hinnata ühe pealkirja õigsust.]] Pärast seda jagasid nad oluliselt rohkem tõeseid uudiseid. [[Sama tulemus saadi ka sotsiaalvõrgustikus tehtud katses.]]',
        'Mida siis teha? [[Enne jagamist küsi endalt üks lihtne küsimus: kas see on tõsi?]] Kontrolli, kes on autor ja millal on see avaldatud.',
        'Allikas: Gordon Pennycook, David Rand jt, ajakiri Nature (2021).',
      ].join('\n\n'), ['Uuringu järgi ei suuda inimesed tõest ja valest pealkirja üldse eristada.'], 'g_read'), 'Kui tead, miks inimesed valet jagavad, märkad seda ka iseendas.'), { task: 'R16', harno: 'R4' }),
      'Eksaminurk (R4): eksamil on 350–400-sõnaline tekst ja kaheksa lauset, üks jääb üle. Küsi iga lünga juures: „Mis sõna eelmises või järgmises lauses andis vihje?” Üleliigne lause räägib tekstile vastu (inimesed eristasid tõde päris hästi). Lõpus: „Kas mängu kolmas väide oli tõsi?”'),
    ],
    practice: [
      station(B.notice('058_p_notice', 'Märka: näidati, küsiti, on avaldatud', [
        'Tekstist: katses **näidati** pealkirju · kui **küsiti**, kas see on tõsi · **paluti** hinnata · tulemused **avaldati** · millal **on** see **avaldatud**?',
        '**Umbisikuline minevik** (millal? kindel aeg minevikus): da-tegevusnimi + lõpp -ti või -di: küsida → **küsiti**, näidata → **näidati**, jagada → **jagati**, saada → **saadi**, teha → **tehti**',
        '**Täisminevik** (tulemus on praegu oluline): **on** + vorm lõpuga -tud või -dud: **on jagatud**, **on avaldatud**, **on tehtud**, **on töödeldud** (töödelda) · Eitus: **ei ole kinnitatud** / **pole kinnitatud**',
        '**Tabel**: olevik jagatakse / ei jagata · minevik jagati / ei jagatud · täisminevik on jagatud / ei ole jagatud · Sama -tud-vorm on ka omadussõna: **töödeldud** pilt, **kontrollimata** (ilma kontrollita) uudis.',
        'Faktikontrollis: **Väidetakse**, et … (olevik) · Pilt **tehti** 2019. aastal (minevik) · Pilti **on** juba varem **kasutatud** (täisminevik) · Seda **ei ole kinnitatud** (eitus).',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.formtext('058_p_check', 'Faktikontroll: „Üleujutus Tartus?”', 'Kirjuta sulgudes olev tegusõna umbisikulises vormis: minevik, täisminevik või olevik — nagu lause nõuab.', 'Faktikontroll', [
        'Eile õhtul [jagati] (jagama, minevik) sotsiaalmeedias pilti, millel on näha vee all olev kesklinna tänav. Postituse järgi [tehti] (tegema, minevik) see pilt eile hommikul Tartus Emajõe ääres.',
        'Kontrollimisel selgus, et sama pilti [on kasutatud] (kasutama, täisminevik) juba mitu aastat tagasi ühes välismaa uudises. Pildi autorit ega pildistamise aega postituses ei [nimetatud] (nimetama, minevik).',
        'Linnavalitsuse teatel ei [ole] (olema) sel nädalal Tartus ühtegi tänavat üle ujutatud. Postitust [on jagatud] (jagama, täisminevik) sellest hoolimata juba üle kahe tuhande korra.',
        'Postituses [väidetakse] (väitma, olevik) ka, et linn varjab infot. Selle kohta ei ole tõendeid [esitatud] (esitama).',
        'Kokkuvõte: pilt on vana, see on tehtud mujal ja postituse väide ei ole tõsi.',
      ], 'g_notice'), 'Õige vorm teeb faktikontrolli täpseks: lugeja näeb, mis juhtus kunagi ja mis kehtib praegu.'), { task: 'G03' }),
      'Pärast iga lünka küsi: „Kas see on kindel aeg minevikus või tulemus praegu?” Lünk „ei [ole] … üle ujutatud”: eituses ole + -tud. Ütle õpilasele: see postitus on tunni jaoks välja mõeldud, kuid nii näevad päris juhtumid välja.'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('058_t_posts', 'Viis postitust sinu uudisvoos.', 'Loe postitusi ja vaata kolme asja: kes on autor, millal see on avaldatud ja kas see on kuskil mujal kinnitatud.', [
        ['A. Ekraanipilt', ['pealkiri: „Alates 1. jaanuarist kaotatakse Eestis sularaha!”', 'uudisteportaali logo on udune, linki ei ole', 'jagatud 3400 korda'], []],
        ['B. Pilt', ['üleujutatud tänav, tekst „Tartu täna hommikul”', 'pildiotsing: sama pilt on internetis olnud 2019. aastast', 'autorit ei ole'], []],
        ['C. Ilmahoiatus', ['Riigi Ilmateenistus: homme tugev tuul, puhanguti kuni 25 m/s', 'link ilmateenistuse lehele — usaldusväärne allikas', 'avaldatud täna kell 9'], []],
        ['D. Video', ['tuntud poliitik kiidab investeerimisplatvormi, lubadus: „1000 eurot nädalas!”', 'hääl on ebaloomulik, huuled ei liigu sõnadega kokku', 'all on link registreerimiseks'], []],
      ], '3', 'g_read'), 'Need on tüüpiline valeinfo ja üks päris teade; viies, edasi saadetud häälsõnum, on kuulamisel. Sinu ülesanne on need eristada.'), { task: 'R11', level: 3 }), 4, 15, { final: 'advise' }),
      teach(tag(purpose(B.listening('058_t_voice', 'E. Edasi saadetud häälsõnum.', 'Tuttav saatis sulle häälsõnumi, mida jagatakse sõprade vahel. Kuula kaks korda ja kirjuta lünka 1–2 sõna.', [
        'Tere kõigile! Saadan edasi, mida mu õe naabri tuttav ütles. Ta töötab haiglas ja teab seda kindlalt.',
        'Homsest suletakse kõik Tallinna apteegid kolmeks päevaks, sest arvutisüsteemi uuendatakse. Retseptiravimeid ei saa sel ajal üldse kätte.',
        'Minge juba täna õhtul apteeki ja ostke ravimeid varuks!',
        'Saatke see sõnum kõigile, keda tunnete, eriti vanematele inimestele.',
        'Ametlikult sellest ei räägita, sest ei taheta paanikat tekitada. Aga parem karta kui kahetseda!',
      ], [
        'Häälsõnumi järgi on selle info algne allikas saatja õe naabri [tuttav], kes töötab haiglas.',
        'Sõnumi järgi suletakse arvutisüsteemi uuendamise tõttu homsest kõik Tallinna [apteegid].',
        'Sõnumi väitel olevat apteegid suletud järjest [kolm päeva|kolmeks päevaks|kolm].',
        'Sõnum soovitab minna juba täna õhtul apteeki ja osta ravimeid [varuks].',
        'Sõnumi järgi ei räägita sellest ametlikult, sest kardetavasti ei taheta [paanikat] tekitada.',
        'Sõnumi saatja palub, et sa saadaksid selle edasi eriti [vanematele inimestele|vanematele].',
      ], 'g_read'), 'Kuulad nagu faktikontrollija: kes ütles, kust ta teab ja mida sinult palutakse.'), { task: 'L03' }),
      'Kuulamise tsükkel: 1) prognoos: „Mida edasi saadetud sõnum tavaliselt palub?”; 2) esimene kuulamine — „Mis on mure?”; 3) teine — lüngad; 4) detail: „Kes on allikas?”; 5) üks lause: „Mida sa selle sõnumiga teed?” Ütle: sõnum on tunni jaoks välja mõeldud, aga sellised sõnumid levivad päriselt.'),
      teach(tag(purpose(B.planning('058_t_decide', 'Jagad või ei jaga?', 'Kirjuta iga postituse (A–E) juurde: jagan, ei jaga või kontrollin — ja üks tõend või puudus, mis su otsuse tegi.', [
        'A. Ekraanipilt sularahast: …, sest …',
        'B. Pilt „Tartu täna hommikul”: …, sest …',
        'C. Ilmateenistuse hoiatus: …, sest …',
        'D. Poliitiku video ja investeerimise pakkumine: …, sest …',
        'E. Häälsõnum apteekidest: …, sest …',
      ], 1), 'Su otsus kaitseb sõpru: üks jagamata vale on parem kui sada jagatud.'), { task: 'W01' }),
      'Pärast iga rida küsi: „Mis kolmest kontrollist siin puudub? Mis on tõend?” Oodatud: A, B, D — ei jaga (link puudub, vana pilt, võltsvideo ja pettus); C — jagan (ametlik allikas, link, kuupäev); E — ei jaga või kontrollin apteegi või Ravimiameti lehelt (allikas „õe naabri tuttav”).'),
      teach(tag(purpose(B.rolecards('058_t_friend', 'Sõber jagas juba.', 'Sinu sõber jagas postitust A (sularaha) oma 300 sõbrale ja kirjutab: „Kas sa nägid? Hirmus!” Räägi temaga nii, et ta kustutab postituse ega solvu.',
        'Olukord: sõber (või sugulane, kolleeg — vali ise) jagas võltsitud ekraanipilti.\nSinu eesmärk: seleta rahulikult, miks see ei ole usaldusväärne (kolm kontrolli), ja paku, mida teha.\nPiirang: ära naera ega ütle „sa oled rumal” — räägi faktidest.',
        'Sõbra kaart on õpetajal: tema hirm ja tema vastuargument.',
        ['Ma vaatasin järele: …', 'Kahtlane on see, et …', 'Tõendit ei ole: …', 'Seda ei ole kinnitatud ühestki usaldusväärsest allikast.', 'Järgmine kord kontrolli …'], ['Aga kõik jagavad seda!', 'Kust sa tead, et …?', 'Mis siis, kui see on ikka tõsi?']), 'Tulemus: sõber kustutab postituse ja teab, kuidas järgmine kord kontrollida.'), { task: 'S14', level: 4 }),
      'Õpetaja kaart (sõber). Varjatud info: sa said pildi oma õelt, keda sa usaldad; sa kardad, et su pension tuleb nüüd ainult kaardile; sa ei tea, kuidas postitust kustutada. Takistused ükshaaval: 1) „Aga õde ei valeta!” 2) „Mis siis, kui see on ikka tõsi?” 3) „Kuidas ma selle nüüd ära kustutan?” Õnnestunud, kui õpilane nimetab vähemalt kaks kontrolli (autor, kuupäev, teised allikad), kasutab vähemalt kaks umbisikulist minevikuvormi (seda ei ole kinnitatud, pilti on muudetud), pakub konkreetse sammu ega solva.'),
      extension(teach(tag(purpose(B.speaking('058_t_more', 'Mäng: kaks pealkirja', 'Mõtle välja kaks lühikest uudist oma linnast: üks tõene, üks vale. Loe need ette; paariline (või õpetaja) arvab, kumb on vale, ja ütleb, mida ta kontrolliks.', [
        'Kirjuta kumbki pealkiri umbisikulises vormis (näiteks: Kesklinnas avati uus raamatukogu.).',
        'Mis teeb vale pealkirja usutavaks?',
        'Mida paariline kontrollis, et vale ära tunda?',
      ], [120, 180], ['Eile avati …', 'Väidetakse, et …', 'Ma kontrolliksin …', 'See on vale, sest …']), 'Kui oled ise valet kirjutanud, tunned selle kergemini ära.'), { task: 'G11', fluency: true }),
      'Kui aega jääb (12 min). Mängi kaasa: tee ise kaks pealkirja, üks väga usutav vale. Punkt: õige arvamine + üks kontrollimise viis. Kui õpilase vale on liiga naljakas, küsi: „Kuidas teha see usutavamaks?”'), 12),
      tag(exitCheck(purpose(B.gaps('058_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev tegusõna umbisikulises vormis.', [
        'Pilti [on töödeldud], seepärast tundub see päris. (töötlema, täisminevik)',
        'Katses [paluti] inimestel enne jagamist hinnata pealkirja õigsust. (paluma, minevik)',
        'Postituse autorit ei [nimetatud]. (nimetama, minevik)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas umbisikuline minevik ja täisminevik on käes.')), {}),
      purpose(B.selfcheck('058_t_self', ['Ma räägin, kust saan uudiseid ja kuidas neid usaldan.', 'Ma saan aru uuringust, miks inimesed valet jagavad.', 'Ma kasutan umbisikulist minevikku ja täisminevikku: jagati, on töödeldud, ei ole kinnitatud.', 'Ma kontrollin postitust kolme küsimusega ja annan sõbrale rahulikult nõu.'], 'Kontrollitud enne jagamist', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('058_t_letter', 'Kodus: faktikontroll sõpradele.', 'Kirjuta kodus sõpradele 150–170 sõna ühest postitusest (A, B, D, E või päris): mida väidetakse, mida kontrollisid, mis selgus, mida soovitad. Vähemalt viis umbisikulist vormi.', 'Head sõbrad!', 'Teie\n(sinu nimi)', [150, 170]), 'Sõbrad saavad aru, miks postitus on vale, ja õpivad ise kontrollima.')), { task: 'W08', main: true, level: 4 }),
      tag(homeTask(purpose(B.speaking('058_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: kuidas sina kontrollid uudist, enne kui jagad.', [
        'Mis kolm asja sa vaatad?',
        'Kuidas sa tead, et allikas on usaldusväärne?',
        'Milline valeinfo on sind ennast kunagi peaaegu petnud?',
      ], [60, 120]), 'Õpetaja kuulab, kas sammud on selged ja minevikuvormid õiged.')), { task: 'S15' }),
      homework('058_t_homework', ['1. Faktikontroll sõpradele, 150–170 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-059': {
    title: 'Mida sinu telefon sinust teab?',
    phases: grammar('Keel: privaatsustingimused lihtsas keeles — andmete kogumine ↔ andmeid kogutakse, asukoha jagamine ↔ asukohta jagatakse'),
    format: 'project',
    topic: 'freetime',
    canDo: 'Ma saan aru, milliseid õigusi mul oma andmete üle on (nõusolek, andmepäring, kustutamine, andmejälgija), muudan privaatsustingimuste ametliku keele lihtsaks ja vastupidi (andmete kogumine ↔ andmeid kogutakse) ning koostan ja esitlen oma digireeglid.',
    teacherPage: {
      goal: 'Мини-проект: права на свои данные (радио, L2), политика конфиденциальности простыми словами и обратно, продукт модуля «Minu digireeglid» и минутное выступление.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 2 — радио один раз и 4 вопроса; станция 3 — правило и 4 строки; станция 4 — карточка «Minu digireeglid» с двумя действиями, выступление — дома.',
      hook: '«Посмотри на свой телефон или просто подумай: сколько приложений сейчас знает, где ты находишься? Угадай число и назови одно приложение, которое это точно знает». Кто не хочет доставать телефон — угадывает. Потом можно вместе открыть настройки (по желанию).',
      plan: [
        '0–3: крючок — сколько приложений знают, где я',
        '3–10: станция 1 — разговор: какие приложения я люблю, что я им разрешил, читал ли я условия',
        '10–25: станция 2 — слова (2 мин), прогноз, радио с юристом по защите данных дважды, 6 вопросов (L2)',
        '25–37: станция 3 — заметить «andmete kogumine» ↔ «andmeid kogutakse» → правило → 7 строк политики конфиденциальности простыми словами и обратно',
        '37–52: станция 4 — пять проверок телефона, карточка «Minu digireeglid», минутное выступление перед группой и вопрос учителя',
        '52–64: «Kui aega jääb» — обсуждение: недельный эксперимент с уведомлениями',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: запрос данных в фирму, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Радио и карточки: Общий регламент ЕС о защите данных (действует с 25.05.2018): согласие добровольное, право узнать свои данные (ответ обычно в течение месяца, бесплатно, ст. 12 и 15), право на удаление (ст. 17), штрафы до 20 млн € (ст. 83); isikuandmete kaitse seadus § 8 (Riigi Teataja): ребёнок с 13 лет сам даёт согласие на онлайн-сервис, младше — родитель; Andmekaitse Inspektsioon принимает жалобы онлайн; RIA «Andmejälgija» в eesti.ee (с 2017 г., не все базы). Юрист Марика Тамм — учебная.',
      groups: 'Радио — каждый сам, сверка в паре. Станция 4: каждый заполняет свою карточку; в группе по очереди минутное выступление, остальные задают по одному вопросу. В 1:1 вопрос задаёте вы. Телефон ученик открывает только по желанию — личные настройки не показываем другим.',
      errors: [
        '«Andmed kogumine» → «andmete kogumine» (объект перед -mine — в родительном).',
        '«Teie andmeid kogutakse» и «Teie andmed kogutakse» — правильно первое: частичный объект при процессе.',
        '«Ma keeldusin küpsised» → «Ma keeldusin küpsistest» (keelduma + elatiiv -st).',
        '«Nõusolek on vaja» → «Nõusolekut on vaja» / «Nõusolek on vajalik».',
      ],
      notes: [
        'Формат — мини-проект с продуктом модуля: карточка «Minu digireeglid» (три действия, когда, кому помогу) идёт на экзамен 060 как минутное выступление (S1). Свободное время — потому что речь о приложениях для хобби, спорта, игр и покупок.',
        'Пенсионеру — карточки скидок и приложение аптеки; студенту — соцсети и бесплатные приложения; маме — приложения для детей (с 13 лет ребёнок даёт согласие сам); уставшему — один шаг: геолокация «только во время использования».',
        'Обратная связь, 2–3 цели: превращение -mine-фразы в простое предложение и обратно; keelduma + -st, nõusolek / nõustuma; конкретность действий (что, когда).',
      ],
    },
    discover: [
      station(B.text('059_d_hook', 'Kes teab, kus sa oled?', 'Vaata oma telefoni või lihtsalt mõtle: mitu rakendust teab praegu, kus sa oled? Arva arv ja nimeta kohe üks rakendus, mis seda kindlasti teab.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('059_d_talk', 'Minu rakendused.', `Vasta ja too näide. ${OWN_OR_INVENTED}`, [
        'Milliseid rakendusi kasutad vabal ajal kõige rohkem: sport, mängud, muusika, ostlemine?',
        'Kas oled kunagi lugenud rakenduse tingimusi? Miks või miks mitte?',
        'Kas sulle on juhtunud, et reklaam teadis sinust midagi, mida sa ei olnud kellelegi rääkinud?',
      ], [150, 210], ['Ma kasutan iga päev …', 'Tingimusi ma ei loe, sest …', 'Kord nägin reklaami, mis …']), 'Sinu oma telefon on selle projekti materjal.'), { task: 'S09', fluency: true }),
      'Üks-ühele: räägi ka ise oma lemmikrakendusest. Telefoni seadeid avab õpilane ainult siis, kui ta ise tahab; teistele neid ei näidata.')),
      station(tag(B.vocab('059_d_vocab', 'Enne kuulamist: sõnad.', ['privaatsus — приватность', 'nõusolek — согласие', 'küpsis — куки (файл cookie)', 'asukoht — местоположение', 'luba — разрешение', 'kustutama — удалять', 'andmed — данные', 'seaded — настройки', 'jälgima — отслеживать', 'keelduma — отказываться']), { topic: ['nõusolek', 'küpsis'] }), 2, 15),
      teach(tag(purpose(B.examListen('059_d_radio', 'Raadio: mida sinu telefon sinust teab?', 'Enne kuulamist arva: mida soovitab andmekaitsejurist kõigepealt teha? Siis kuula kaks korda ja vali õige vastus.', 'choice', [
        'Saatejuht: Tere! Täna räägime sellest, mida meie telefon meist teab. Stuudios on andmekaitsejurist Marika Tamm. Marika, kust alustada?',
        'Marika: Kõigepealt seadetest. Vaadake, millistel rakendustel on luba kasutada teie asukohta, mikrofoni ja kontakte. Ilmarakendus vajab asukohta, aga taskulamp küll mitte.',
        'Saatejuht: Aga küpsised? Iga veebileht küsib nõusolekut.',
        'Marika: Isikuandmete kaitse üldmäärus kehtib alates kahe tuhande kaheksateistkümnenda aasta maist. Nõusolek peab olema vabatahtlik. Vajalikke küpsiseid võib leht kasutada ilma loata, aga reklaamiküpsistest võite keelduda. Keeldumine peaks olema sama lihtne kui nõustumine.',
        'Saatejuht: Kui ma tahan teada, mida mingi firma minu kohta teab?',
        'Marika: Teil on õigus küsida. Firma peab üldjuhul vastama ühe kuu jooksul ja see on tasuta. Võite paluda ka oma andmed kustutada, kui neid ei ole enam vaja.',
        'Saatejuht: Ja riik?',
        'Marika: Riigiportaalis eesti.ee on andmejälgija. Sealt näeb, kes on mõnes riigi andmekogus teie andmeid vaadanud. Kõik andmekogud seal veel ei ole, aga neid tuleb juurde.',
        'Saatejuht: Kuidas on lastega?',
        'Marika: Eestis võib laps alates kolmeteistkümnendast eluaastast ise nõusoleku anda. Noorema lapse eest otsustab vanem.',
        'Saatejuht: Kuhu pöörduda, kui firma ei vasta?',
        'Marika: Andmekaitse Inspektsiooni. Kaebuse saab esitada internetis. Rasketel juhtudel võib firma saada väga suure trahvi, kuni kakskümmend miljonit eurot.',
        'Saatejuht: Üks nõuanne kuulajatele?',
        'Marika: Enne kui vajutate „Nõustun kõigega”, lugege vähemalt esimest lõiku. Kolm sekundit on teie andmete väärt.',
      ], [
        ['Mida soovitab andmekaitsejurist telefoni omanikul kõige esimesena teha?', 'vaadata, millistel rakendustel on milline luba', 'kustutada kõik rakendused', 'osta uus telefon'],
        ['Mida võib kasutaja juristi sõnul teha, kui veebileht küsib küpsiste kohta nõusolekut?', 'keelduda reklaamiküpsistest', 'keelata kõik küpsised seaduse järgi', 'maksta, et küpsiseid ei oleks'],
        ['Kui kiiresti peab firma üldjuhul vastama, kui inimene küsib oma andmete kohta?', 'ühe kuu jooksul', 'ühe nädala jooksul', 'kolme päeva jooksul'],
        ['Mida saab inimene riigiportaali andmejälgijast teada?', 'kes on riigi andmekogus sinu andmeid vaadanud', 'mida firmad sinu kohta teavad', 'kõik sinu küpsised'],
        ['Mis vanusest alates võib laps Eestis rakendusele ise nõusoleku anda?', 'kolmeteistkümnest', 'kümnest', 'kaheksateistkümnest'],
      ], 'g_read'), 'Raadio annab sulle sinu õigused; nende järgi teed oma digireeglid.'), { voice: 'interview', task: 'L02', harno: 'L2' }),
      'Kuulamise tsükkel: 1) prognoos: „Mida soovitab jurist esimesena?”; 2) esimene kuulamine — „Mitu õigust ta nimetab?”; 3) teine — valikvastused; 4) detail: „Mis vanusest?”; 5) üks lause: „Mida sa täna õhtul teed?” Eksaminurk (L2): eksamil on 3–4-minutiline intervjuu ja valikvastused; siin on see lühem.'),
      B.know('059_d_know', ['Euroopa Liidu isikuandmete kaitse üldmäärus kehtib alates 25. maist 2018. Kui firma andmed lekivad, peab ta sellest üldjuhul 72 tunni jooksul teatama Andmekaitse Inspektsioonile. Rasketel juhtudel võib trahv olla kuni 20 miljonit eurot või 4 protsenti firma ülemaailmsest aastakäibest — olenevalt sellest, kumb on suurem.'], 'isikuandmete kaitse üldmäärus (EL) 2016/679, artiklid 33 ja 83', 'Kas teadsid? Andmeleke ja trahv'),
    ],
    practice: [
      station(B.notice('059_p_notice', 'Märka: andmete kogumine = andmeid kogutakse', [
        'Raadiost ja tingimustest: nõusolek peab olema vabatahtlik · võite paluda andmete **kustutamist** = andmed **kustutatakse** · tingimustes: „Teie asukohaandmete **kogumine** toimub …”',
        '**Ametlik keel** (tingimused) kasutab **-mine**-fraasi: andmete **kogumine**, asukoha **jagamine**, küpsiste **kasutamine** · **Lihtne keel** kasutab tegusõna: andmeid **kogutakse** (umbisikuline, tund 56) või **me kogume** andmeid',
        'Kuidas muuta: **-mine** → tegusõna, **omastav** → **osastav** või **nimetav** sihitis: asukoha jagamine → **asukohta jagatakse** · andmete kustutamine → **andmed kustutatakse** (tervik)',
        'Tagasi: Me jagame su **asukohta** partneritega. → Asukoha**andmete jagamine** partneritega · Tegija -ja: kasutaja, töötleja (andmete töötleja = firma, kes andmeid kasutab)',
        'Otsi tingimustest kolme küsimust: **mida** kogutakse, **kellele** antakse ja **kui kaua** hoitakse.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('059_p_plain', 'Tingimused lihtsas keeles.', 'Muuda tingimuste lause lihtsaks või lihtne lause ametlikuks. Alusta antud sõnadega.', [
        ['Teie asukohaandmete kogumine toimub ainult rakenduse kasutamise ajal.', 'Sinu asukohta …', 'Sinu asukohta kogutakse ainult siis, kui sa rakendust kasutad.|Sinu asukohta kogutakse ainult rakenduse kasutamise ajal.|Sinu asukohta kogutakse ainult siis, kui kasutad rakendust.'],
        ['Andmete edastamine reklaamipartneritele eeldab teie nõusolekut.', 'Sinu andmeid …', 'Sinu andmeid antakse reklaamipartneritele ainult sinu nõusolekul.|Sinu andmeid antakse reklaamipartneritele ainult siis, kui sa nõustud.|Sinu andmeid edastatakse reklaamipartneritele ainult sinu nõusolekul.'],
        ['Konto sulgemise järel toimub andmete kustutamine 30 päeva jooksul.', 'Kui sa konto sulged, …', 'Kui sa konto sulged, kustutatakse andmed 30 päeva jooksul.|Kui sa konto sulged, kustutatakse sinu andmed 30 päeva jooksul.'],
        ['Mikrofoni kasutamine on vajalik ainult häälsõnumite saatmiseks.', 'Mikrofoni …', 'Mikrofoni kasutatakse ainult häälsõnumite saatmiseks.|Mikrofoni on vaja ainult häälsõnumite saatmiseks.'],
        ['Me jagame sinu asukohta partneritega ainult sinu loal.', 'Asukoha …', 'Asukoha jagamine partneritega toimub ainult sinu loal.|Asukoha jagamine partneritega on lubatud ainult sinu loal.|Asukoha jagamine partneritega toimub ainult sinu nõusolekul.'],
        ['Sinu andmeid ei müüda kolmandatele isikutele.', 'Andmete …', 'Andmete müümine kolmandatele isikutele on keelatud.|Andmete müümine kolmandatele isikutele ei ole lubatud.'],
        ['Kes rakendust kasutab, võib igal ajal oma nõusoleku tagasi võtta.', 'Rakenduse …', 'Rakenduse kasutaja võib igal ajal oma nõusoleku tagasi võtta.|Rakenduse kasutaja võib oma nõusoleku igal ajal tagasi võtta.'],
      ], 'full', 'g_notice'), 'Kui oskad tingimused lihtsaks teha, tead, millega nõustud.'), { task: 'G05' }),
      'Pärast iga rida küsi: „Mida kogutakse, kellele antakse, kui kaua?” Ridadel 1–4 tuleb -mine-fraasist tegusõna, ridadel 5–7 vastupidi. Rida 3: „andmed” on tervik → nimetav (kustutatakse andmed). Lisa küsimus: „Millise lausega sa ei nõustuks?”'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('059_t_checks', 'Viis kontrolli: mida rakendused tohivad?', 'Loe kaarte ja vali kolm, mida sa järgmise nädala jooksul teed. Mõtle, mida sa igal kaardil täpselt muudad.', [
        ['1. Asukoht', ['Seaded → Privaatsus → Asukoht', 'vali „ainult kasutamise ajal” või „mitte kunagi”', 'ilmarakendus ja kaart vajavad, mäng ja taskulamp mitte'], []],
        ['2. Mikrofon ja kaamera', ['vaata, millistel rakendustel on luba', 'võta luba ära rakendustelt, mida sa ei kasuta'], []],
        ['3. Küpsised', ['vali „Keeldu mittevajalikest” või „Ainult vajalikud”', 'keeldumine peaks olema sama lihtne kui nõustumine'], []],
        ['4. Andmejälgija', ['eesti.ee → logi sisse → andmejälgija', 'vaata, kes on sinu andmeid riigi andmekogudes kasutanud'], []],
        ['5. Andmepäring', ['kirjuta firmale: millised andmed teil minust on?', 'vastus tavaliselt ühe kuu jooksul, tasuta', 'võid paluda andmed kustutada', 'ka siis, kui tühistasid tellimuse või prooviperioodi'], []],
      ], '3', 'g_read'), 'Kaardid annavad sulle valmis sammud; sina valid, mis sinu elus kõige rohkem loeb.'), { task: 'R07' }), 4, 15, { final: 'plan' }),
      tag(purpose(B.planning('059_t_plan', 'Minu digireeglid.', 'Täida oma kaart: kolm sammu, millal sa need teed ja keda sa aitad. See on mooduli tulemus.', [
        'Minu kolm sammu (mida täpselt muudan?)',
        'Millal ma need teen ja kuidas kontrollin, et need toimivad?',
        'Kellele ma neist räägin või keda aitan (ema, laps, naaber, kolleeg)?',
        'Üks reegel tundidest 56–58: e-riik, tehisintellekt või uudiste kontroll.',
      ], 3), 'Kaart jääb sulle: sellest räägid vahehindamisel ja selle järgi kirjutad kodus kirja.'), { task: 'W11', level: 3 }),
      teach(tag(purpose(inLesson(B.speaking('059_t_talk', 'Esitle oma digireegleid.', 'Räägi oma kaardi järgi 1 minut grupile (või õpetajale): mida sa muudad, millal ja miks. Siis vasta ühele küsimusele.', [
        'Millised kolm sammu sa valisid ja miks just need?',
        'Mis on sinu jaoks kõige raskem?',
        'Kuulaja küsib: „Aga kui rakendus ilma loata ei tööta?”',
      ], [90, 180], ['Tahaksin tutvustada oma digireegleid …', 'Kõige tähtsam on minu jaoks …', 'Järgmisel nädalal ma …', 'Hea küsimus. Ma arvan, et …'])), 'Tulemus: sinu digireeglid on valmis ja sa oskad neid ka teistele põhjendada.'), { task: 'S16', main: true, level: 4 }),
      'Õpetaja: kuula ja küsi üks küsimus (kaardilt või oma). Õnnestunud, kui õpilane räägib 1 minuti ilma paberist lugemata, nimetab kolm konkreetset sammu ja aja, põhjendab vähemalt üht ja vastab küsimusele. See on vahehindamise S1 harjutus.'),
      extension(teach(tag(purpose(B.rolecards('059_t_more', 'Arutelu: teavituste eksperiment', 'Vaata pilti. Kas sa julgeksid üheks nädalaks välja lülitada kõik teavitused peale kõnede ja sõnumite? Arutage oma rolli järgi ja leppige kokku eksperimendi reegel.',
        'Roll A (proovime!): teavitused segavad keskendumist ja und; nädal ilma nendeta säästab aega. Mõtle, milliseid teavitusi sa päriselt vajad.',
        'Roll B (kahtleja): kardad jääda millestki tähtsast ilma — töö, lapse kool, pank. Mõtle, mis peab kindlasti sisse jääma.',
        ['Ma vajan kindlasti …', 'Minu reegel oleks …'], ['Ma kardan, et …', 'Nädala pärast vaataksin, kas …']), 'Teavitused on samuti andmed: rakendus teab, millal ja kui kaua sa ekraani vaatad.'), { task: 'S19' }),
      'Kui aega jääb (12 min). Arutle kaasa ja too oma näide. Õnnestunud, kui õpilane nimetab vajalikud ja mittevajalikud teavitused, ütleb ühe hirmu ja sõnastab eksperimendi reegli (mida, kui kaua, kuidas mõõta).'), 12),
      tag(exitCheck(purpose(B.gaps('059_t_exit', 'Kontrolli end: kolm lauset.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Kui sa ei taha, et rakendus teaks, kus sa oled, saab [asukoha] jagamise seadetes välja lülitada. (asukoht)',
        'Kui sa rakendust enam ei kasuta, on sul õigus nõuda oma andmete [kustutamist]. (kustutamine)',
        'Tingimustes on kirjas, et teie andmeid [kogutakse] ainult teenuse osutamiseks. (koguma, umbisikuline)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas tingimuste keel on sulle selge.')), {}),
      purpose(B.selfcheck('059_t_self', ['Ma räägin, milliseid rakendusi kasutan ja mida neile luban.', 'Ma saan raadiost aru oma õigustest: nõusolek, andmepäring, kustutamine, andmejälgija.', 'Ma muudan tingimuste keele lihtsaks ja vastupidi: andmete kogumine ↔ andmeid kogutakse.', 'Ma koostan oma digireeglid ja esitlen neid 1 minutiga.'], 'Digireeglid valmis', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('059_t_letter', 'Kodus: andmepäring firmale.', 'Kirjuta kodus firmale, mille rakendust kasutad, 140–160 sõna: kes sa oled, mida tahad teada (mida kogutakse, kellele antakse, kui kaua hoitakse), mida palud ja millal ootad vastust.', 'Lugupeetud klienditeenindus!', 'Lugupidamisega\n(sinu nimi)', [140, 160]), 'Firma peab sulle vastama; sina saad teada, mida su rakendused tegelikult jagavad.')), { task: 'W13', level: 4 }),
      tag(homeTask(purpose(B.speaking('059_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut oma kaardi „Minu digireeglid” järgi, nagu räägiksid koosolekul.', [
        'Mida sa muudad ja millal?',
        'Miks see on sulle tähtis?',
      ], [60, 120]), 'See on vahehindamise sõnavõtu harjutus; õpetaja annab ühe nõu.')), { task: 'S15' }),
      homework('059_t_homework', ['1. Andmepäring firmale, 140–160 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-060': {
    title: 'Vahehindamine 3 — tunnid 41–60',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Vahehindamine 3, 1. tund: lugemine (60 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Vahehindamine 3, 1.–2. tund: keeleosa ja kuulamine (55 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Vahehindamine 3, 2.–3. tund: kuulamise osa 1, lugemise osa 2b, kirjutamine ja rääkimine (95 min).' },
    },
    format: 'exam',
    assessment: true,
    canDo: 'Ma sooritan proovieksami Harno B2 vormis tundide 41–60 oskustega (teemad: digielu, tervis, raha ja suhtlus): kuulamine (lühiteated, jutusaade, intervjuu lünkadega, õige või vale), lugemine (valikvastused, väide ja lõik, lühivastused, valiklüngad, lauselüngad), kiri (umbes 140 sõna) ja andmete kokkuvõte (umbes 180 sõna), sõnavõtt oma digireeglitest ja paarisarutelu; igas osas vähemalt 60 %, eesmärk 80 %.',
    // Vahehindamine 3 is the first full Harno B2 mock of the course (COURSE_FINAL_SHAPE_B2.md §4: 060 PROOV, all four parts
    // timed with B.examPart): reading R1 + R2a (one opinion article), R3, R4 (Lugemine, 60 min); the language part and
    // listening L1–L4 (Kuulamine, 15 + 40 min); R2b, writing W1 + W2a and speaking S1 + S2 (80 + 20 min). Own texts on the
    // module's content and the threads of modules 9–11; real facts with their sources; timed by the Harno part headers
    // (timeEstimate.js harnoTimedMinutes, docs/COURSE_DESIGN_STATIONS.md §7.3).
    discover: [
      B.tip('060_d_how', 'Vahehindamine: lugemine (eksami vormis, 60 minutit)', 'Vahehindamine 3 on täielik proovieksam Harno B2 vormis ja kordab tunde 41–60. Esimeses osas on lugemine, siis keeleosa ja kuulamine, lõpuks kirjutamine ja rääkimine. Tee kõik ilma sõnaraamatuta. Läbitud: igas osas vähemalt 60 %, eesmärk 80 %.', 'full'),
      tag(B.vocab('060_d_vocab', 'Tunnid 56–59: sõnad, mis aitavad', ['digiallkiri — цифровая подпись', 'riigiportaal — государственный портал', 'isikuandmed — персональные данные', 'vastutus — ответственность', 'valeinfo — ложная информация', 'allikas — источник', 'kinnitama — подтверждать', 'nõusolek — согласие', 'kustutama — удалять', 'turvaline — безопасный'], '2'), { topic: ['isikuandmed', 'nõusolek'] }),
      PART('060_d_rpart', 'R', { minutes: 60, points: 43, tasks: 5, note: 'Lugemisosa Harno B2 vormis: osa 1 (7), osa 2a (8), osa 3 (12) ja osa 4 (8) siin, osa 2b (8) kirjutamise lehe alguses — kokku 43 punkti. Eesmärk on vähemalt 35 punkti (80 %).' }),
      B.reading('060_d_read', 'Lugemine: arvamusartikkel.', 'Loe artikkel läbi ja vasta kahele küsimusele. Osad 1 ja 2a on sama artikli kohta.', 'Digiriik — kõigile või ainult osavatele?', [
        '**A** 2024. aasta detsembris jõudis Eesti verstapostini, millest kirjutati ka välismaal: abielu lahutamise avalduse saab nüüd esitada internetis ja riigi sõnul on seega kõik riigiteenused veebis. Juba 2023. aasta Riigikogu valimistel anti esimest korda üle poole häältest internetis. Retseptidest on digitaalsed peaaegu kõik. Paljudele meist tundub see loomulik: asi aetakse köögilaua taga paari minutiga ja järjekorras seista ei tule. Ka pangad, apteegid ja kauplused eeldavad üha sagedamini, et klient oskab asja ise ekraanil ajada.',
        '**B** Samas ei tähenda „kõik teenused veebis”, et kõik inimesed oleksid veebis. Igal nädalal tuleb raamatukogudesse inimesi, kes ei tea, kumb PIN-kood on milleks, või kardavad, et üks vale vajutus võtab neilt pensioni. Nad ei ole rumalad ega laisad. Neil ei olnud kooliajal arvutit ja nüüd ei ole kõrval kedagi, kes kannatlikult seletaks. Mõni neist on kunagi saanud petukõne ja kardab nüüd iga sõnumit. Teine on häbelik ja ei julge abi küsida, sest talle tundub, et kõik teised oskavad.',
        '**C** Teine rühm on need, kes oskavad liiga hästi. Eurostati andmetel kasutas 2025. aastal tehisintellekti tööriistu 46,6 protsenti Eesti 16–74-aastastest elanikest, kui Euroopa Liidu keskmine oli 32,7 protsenti. Noortest tegi seda üle 80 protsendi. Oskus nuppu vajutada ei tähenda aga oskust hinnata, kas masina vastus on õige. Kiirus ja usaldus on kaks eri asja. Masin võib kirjutada viisaka kirja sekundiga, kuid see ei tähenda, et kirjas olevad numbrid või seadused on õiged. Kes ei kontrolli, võib saata ametiasutusele vale info ja vastutab selle eest ise.',
        '**D** Mida peaks riik tegema? Üks võimalus on jätta igale teenusele ka paberil või kohapeal asjaajamise tee. Selle pooldajad ütlevad, et valikuvabadus on demokraatia osa ja keegi ei tohi jääda ilma ravimist või toetusest ainult sellepärast, et tal ei ole nutitelefoni. Vastased leiavad, et kaks paralleelset süsteemi on kallid ja aeglustavad arengut: iga euro, mis kulub paberile, jääb puudu kuskilt mujalt. Mõlemal poolel on oma tõde: maapiirkonnas, kus pank ja postkontor on suletud, ei ole paberi võimalus luksus, vaid vajadus. Linnas, kus kõigil on nutitelefon, on see aga harva kasutatav kulu.',
        '**E** Minu arvates ei ole küsimus selles, kas paber või ekraan. Küsimus on selles, kas inimesel on kellegi poole pöörduda. Raamatukogude digiabi, omavalitsuste klienditeenindus ja lähedased, kes ei tee asju vanemate eest, vaid koos nendega, on digiriigi nähtamatu vundament. Kui see vundament puudub, jääb ükskõik kui ilus e-teenus tühjaks. Inimene, kellel on keegi kõrval, julgeb proovida. Inimene, kes on üksi, sageli ei proovigi.',
        '**F** Ka riik ise on seda mõistnud. Riigiportaalis eesti.ee on andmejälgija, kust saab vaadata, kes on riigi andmekogudes sinu andmeid kasutanud, sest usaldus on sama tähtis kui mugavus. Lahutuse puhul tuleb e-avalduse järel siiski üks kord ametnikuga kohtuda. Täielik digitaalsus ei tähenda seega, et inimest enam ei vajata: vahel annab just inimene kindlustunde.',
        '**G** Digiriigi edu ei mõõdeta selle järgi, mitu teenust on veebis, vaid selle järgi, mitu inimest julgeb neid kasutada. Seepärast võiks iga inimene, kes oskab, õpetada ühte inimest, kes veel ei oska. Mitte teha tema eest, vaid istuda kõrvale ja oodata, kuni ta ise vajutab. See võtab rohkem aega, kuid ainult nii jääb oskus inimesele endale ja ta ei pea järgmine kord kedagi appi kutsuma. Võib-olla on see kõige tähtsam digioskus üldse.',
        'Allikas: autori arvamus; faktid: ERR ja The Baltic Times (e-lahutus, 2024), Riigi valimisteenistus (2023), Eurostat (2025), Riigi Infosüsteemi Amet (andmejälgija).',
      ].join('\n\n'), [
        ['Mis on autori arvates digiriigi „nähtamatu vundament”?', 'inimesed, kes aitavad|digiabi ja lähedased, kes aitavad|see, et inimesel on kellegi poole pöörduda'],
        ['Kas sina oled kedagi e-teenuste kasutamisel aidanud või on keegi aidanud sind? Kuidas?'],
      ]),
      tag(B.choice('060_d_mc', 'Lugemine 1: valikvastused (7 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus.', [
        ['Milleks on artiklis vaja lõiku A?', 'näidata, kui kaugele on Eesti digiteenustega jõudnud', 'kritiseerida e-valimisi', 'selgitada, kuidas abielu lahutatakse', 'kiita ainult noori'],
        ['Miks ei saa paljud eakad autori sõnul e-teenustega hakkama?', 'neil ei olnud arvutit ja neil puudub abiline', 'nad ei taha midagi uut õppida', 'e-teenused on nende jaoks liiga kallid', 'nad ei usalda riiki'],
        ['Mida tahab autor öelda lauses „Kiirus ja usaldus on kaks eri asja”?', 'kiire kasutaja ei pruugi masina vastust kontrollida', 'noored ei usalda tehisintellekti', 'tehisintellekt töötab liiga aeglaselt', 'usaldus tekib ainult kiirusest'],
        ['Mis on lõigu D järgi paberi säilitamise vastaste peamine argument?', 'kahe süsteemi pidamine on kallis ja aeglustab arengut', 'paberil asjaajamine on ebademokraatlik', 'nutitelefon on kõigil olemas', 'ravimeid ei saa paberretseptiga osta'],
        ['Mis on autori enda seisukoht?', 'tähtsam kui paber või ekraan on see, et inimesel on abi', 'riik peaks paberi kohe kaotama', 'igale teenusele tuleks jätta paberi võimalus', 'e-teenused on mõeldud ainult osavatele'],
        ['Miks toob autor lõigus F näite lahutusest?', 'näidata, et inimest vajatakse ka täiesti digitaalses riigis', 'kritiseerida ametnikke', 'selgitada, miks lahutusi on palju', 'tõestada, et e-teenus ei tööta'],
        ['Milline mõte sobib kõige paremini lõigu G kokkuvõtteks?', 'õpeta teist nii, et ta saab ise hakkama', 'tee lähedaste eest kõik ise ära', 'loe kokku, mitu teenust on veebis', 'kutsu alati abiline'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('060_d_para', 'Lugemine 2a: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Mõni inimene kardab, et üks viga võib talle palju maksma minna. | [B]',
        '2. Ka täielikult digitaalses teenuses jääb üks kohtumine silmast silma. | [F]',
        '3. Osa inimesi kasutab uusi tööriistu, kuid ei hinda nende vastuseid kriitiliselt. | [C]',
        '4. Teise eest tegemine ei õpeta teda. | [G]',
        '5. Raha kulub topelt, kui mõlemad võimalused alles jäävad. | [D]',
        '6. Riigi asjaajamine on paljudele muutunud igapäevaseks ja lihtsaks. | [A]',
        '7. Abistajateta ei ole e-teenusest kasu. | [E]',
        '8. Riik annab inimesele võimaluse oma andmete kasutajaid näha. | [F]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.formtext('060_d_cloze', 'Lugemine 3: pane sõna õigesse vormi (12 punkti).', 'Loe blogipostitust. Kirjuta sulgudes olev sõna lünka sellises vormis, nagu lause nõuab.', 'Kuidas ma oma vanad kontod kustutasin', [
        'Möödunud kuul otsustasin teha oma telefonis suurpuhastuse. Kõigepealt [vaatasin] (vaatama) üle, mitu kontot mul internetis on. Neid oli kokku kolmkümmend kaks! Mõnda neist polnud ma kasutanud juba kümme aastat. Ühel vanal foorumil oli alles isegi minu kooliaegne pilt, mida ma ei tahtnud kindlasti kellelegi näidata. Paljudest ma ei [mäletanudki] (mäletama + -ki) enam midagi.',
        'Kõige lihtsam oli vanade mängude [kustutamine] (kustutama, nimisõna). Mõnes rakenduses oli konto sulgemise nupp aga nii hästi peidetud, et [selle] (see) leidmiseks kulus pool tundi. Ühes e-poes [öeldi] (ütlema, umbisikuline minevik) mulle, et konto saab kustutada ainult e-kirja teel.',
        'Kirjutasin poele ja palusin oma andmed kustutada. [Seaduse] (seadus) järgi peab firma üldjuhul vastama ühe kuu jooksul. Vastus tuli juba nädala pärast: minu andmed [on kustutatud] (kustutama, umbisikuline täisminevik), välja arvatud arved, mida tuleb seaduse järgi seitse aastat [säilitada] (säilitama).',
        'Avastasin ka, et mitmel rakendusel oli luba minu asukohta [jälgida] (jälgima). Lülitasin selle välja kõigil rakendustel, [millel] (mis) seda tegelikult vaja ei olnud. Kõige rohkem üllatas mind üks taskulambirakendus, mis teadis mu asukohta ja kontaktide nimekirja. Taskulambil ei ole selleks mingit põhjust.',
        'Lõpuks jäi alles kaksteist kontot. Kõige [tähtsam] (tähtis) õppetund oli see, et kontot on lihtne luua, kuid raske kaotada. Nüüd mõtlen enne iga uue konto [loomist] (loomine) kaks korda, kas mul seda tõesti vaja on. Suurpuhastus võttis kokku kaks õhtut, kuid tunne pärast seda oli väga hea. Soovitan seda igaühele, kes ei mäleta, kui palju kontosid tal tegelikult on.',
      ].join('\n\n'), 'g_notice'), { task: 'G03', harno: 'R3' }),
      tag(B.insertion('060_d_sent', 'Lugemine 4: lause lünka (8 punkti).', 'Loe lugu. Vali pangast igasse lünka sobiv lause; üks lause jääb üle.', 'Kuidas ema digiriigiga sõbraks sai', [
        'Mu ema on seitsekümmend kaks ja ta on alati öelnud, et arvuti on noorte jaoks. Kui isa eelmisel aastal suri, jäid kõik pere asjad tema hooleks. Isa oli peres alati see, kes paberid korda ajas. [[Esimese kuu jooksul helistas ta mulle peaaegu iga päev.]] Kord oli vaja retsepti, kord maksuteadet, kord pangaülekannet.',
        'Elan Tallinnas ja tema Rakveres, nii et kõike ma telefoni teel teha ei saanud. Ühel õhtul ütlesin talle otse, et nii edasi minna ei saa. Ma tundsin end halvasti, aga teadsin, et olin õigesti öelnud. [[Ta solvus ja ei vastanud kaks päeva mu kõnedele.]] Kolmandal päeval helistas ta ise ja küsis, kas ma tuleksin nädalavahetusel appi.',
        'Laupäeval istusime köögilaua taha. Ma ei võtnud tema telefoni enda kätte, vaid lasin tal ise vajutada. [[See oli minu jaoks raskem kui talle, sest ma oleksin kõik kahe minutiga ära teinud.]] Kõigepealt paigaldasime Smart-ID. PIN-koodid kirjutasime paberile ja panime selle kappi, mitte rahakotti. Ema kirjutas kõik sammud vihikusse, sest ta tahtis neid hiljem ise korrata.',
        'Seejärel logis ema esimest korda ise riigiportaali sisse. Ta nägi seal oma retsepte, pensioni andmeid ja isegi seda, millal ta oli viimati arsti juures käinud. [[Kõige rohkem üllatas teda andmejälgija.]] Ta tahtis kohe teada, kes on tema andmeid vaadanud, ja leidis sealt ainult perearsti ja apteegi. Ta ütles, et tunneb end nüüd nagu detektiiv.',
        'Pühapäeval harjutasime pangaülekannet. Tegime ühe euro suuruse ülekande minu kontole. [[Kui raha kohale jõudis, naeris ema nagu laps.]] Siis rääkisime pettustest: pank ega politsei ei küsi kunagi telefonis PIN-koode ja kahtluse korral tuleb kõne lõpetada. Ema kirjutas ka need reeglid vihikusse ja tõmbas nende alla kaks joont. Järgmisel nädalal tegi ta juba ise kümne euro suuruse ülekande naabrile, kes oli talle poest leiba toonud.',
        'Pärast seda nädalavahetust on ema helistanud mulle palju harvemini. [[Kui helistab, siis enamasti lihtsalt juttu ajama.]] Raamatukogus käib ta nüüd kord kuus digikursusel, kus on kümme temaealist inimest. Teised kursuslased käivad tal nüüd isegi nõu küsimas.',
        'Möödunud kuul saatis ta mulle esimese ise allkirjastatud dokumendi. [[Faili nimi oli „Ema esimene allkiri”.]] Ta lisas sõnumisse naerunäo, mida ta varem kunagi kasutanud ei olnud. Mõtlesin siis, et kõige suurem takistus ei olnud kunagi tehnika. [[See oli hirm teha viga ja tunne, et kedagi ei ole kõrval.]]',
      ], ['Ema müüs oma vana telefoni ja ostis endale uue sülearvuti.']), { task: 'R16', harno: 'R4' }),
      // a short productive answer to the article (B2-: the reading sheet is not only recognition)
      tag(B.writing('060_d_reply', 'Lugemise lõpuks: vasta autorile (3–4 lauset).', 'Kas oled autoriga nõus, et digiriigi edu mõõdetakse inimeste julgusega? Kirjuta 3–4 lauset: anna üks autori mõte kaudses kõnes edasi (autor kirjutab, et …), ütle oma arvamus ja too näide.', [3, 4], ['kirjutab, et', 'näiteks'], 1, 'g_read'), { task: 'W02' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening L1–L4 in Harno B2 form
    practice: [
      B.tip('060_p_how', 'Vahehindamine: keeleosa ja kuulamine (55 minutit)', 'Kõigepealt keeleosa (15 minutit): parandad päris sõnumeid ja ütled mõtte teisiti. Siis kuulamine nagu Harno B2 eksamil: jutusaadet ja intervjuud kuuled kaks korda, intervjuud kolmandat korda õige-vale väidete jaoks. Kuulamise osa 1 (lühiteated, kuuled üks kord) on viimase lehe alguses.', 'full'),
      B.tip('060_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on laused tundidest 56–59. Paranda ja ütle teisiti nii, et lugeja saab sinust aru.', 'full'),
      B.errorfix('060_p_fix', 'Keeleosa A: paranda enne saatmist (6 punkti).', 'Kolleeg palus, et vaataksid tema laused enne saatmist üle. Igas lauses on üks viga: kirjuta lause õigesti.', [
        ['Retsepti saab apteegist ID-kaardiga, paberit ei antakse.', 'Retsepti saab apteegist ID-kaardiga, paberit ei anta.'],
        ['Seda pilti on töödeldatud, see ei ole päris.', 'Seda pilti on töödeldud, see ei ole päris.'],
        ['Isikuandmeid sisestamine on keelatud.', 'Isikuandmete sisestamine on keelatud.'],
        ['Masina kirjutatud teksti vastutab saatja.', 'Masina kirjutatud teksti eest vastutab saatja.'],
        ['Uuringus leidsiti, et vale levib kiiremini.', 'Uuringus leiti, et vale levib kiiremini.'],
        ['Firma küsis, et kas ma soovin oma andmed kustutada.', 'Firma küsis, kas ma soovin oma andmed kustutada.|Firma küsis, kas ma soovin oma andmeid kustutada.'],
      ]),
      B.transformation('060_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle iga lause mõte uuesti nii, et kasutad antud vormi.', [
        ['Arst kirjutas retsepti eile välja.', 'umbisikuline minevik', 'Retsept kirjutati eile välja.|Eile kirjutati retsept välja.|Retsept kirjutati välja eile.'],
        ['Keegi ei ole seda väidet kontrollinud.', 'umbisikuline täisminevik', 'Seda väidet ei ole kontrollitud.|Seda väidet pole kontrollitud.'],
        ['Töötajad ei tohi kliendi isikukoodi sisestada.', '-mine', 'Kliendi isikukoodi sisestamine on keelatud.|Kliendi isikukoodi sisestamine ei ole lubatud.'],
        ['Kes rakendust kasutab, peab tingimusi lugema.', '-ja', 'Rakenduse kasutaja peab tingimusi lugema.|Rakenduse kasutaja peab tingimused läbi lugema.'],
        ['Ekspert ütles: „Ma ei jaga uudist enne kontrollimist.”', 'kaudne kõne', 'Ekspert ütles, et ta ei jaga uudist enne kontrollimist.|Ekspert ütles, et tema ei jaga uudist enne kontrollimist.'],
        ['Kontrolli allikat, siis ei jaga sa valeinfot.', 'kui + tingiv', 'Kui sa kontrolliksid allikat, ei jagaks sa valeinfot.|Kui sa allikat kontrolliksid, ei jagaks sa valeinfot.|Kui kontrolliksid allikat, ei jagaks sa valeinfot.'],
      ]),
      PART('060_p_lpart', 'L', { minutes: 40, points: 34, tasks: 4, note: 'Kuulamisosa Harno B2 vormis: osad 2–4 siin, osa 1 viimase lehe alguses — neli ülesannet, 34 punkti. Eesmärk on vähemalt 28 punkti (80 %).' }),
      tag(B.examListen('060_p_show', 'Kuulamine 2: jutusaade „Tehisintellekt koolis” (6 punkti).', 'Kuula jutusaadet kaks korda. Enne esimest kuulamist loe küsimused läbi. Vali igale küsimusele üks õige vastus kolmest.', 'choice', [
        'Saatejuht: Tere! Täna räägime tehisintellektist koolis. Kahe tuhande kahekümne viienda aasta sügisel alustas programm TI-Hüpe, mis tõi tehisintellekti õppevahendid gümnaasiumi kümnendasse ja üheteistkümnendasse klassi. Stuudios on eesti keele õpetaja Maarja ja üheteistkümnenda klassi õpilane Rein. Maarja, mis teie tunnis muutus?',
        'Maarja: Esimene muutus oli minu enda juures. Kõigepealt koolitati meid, õpetajaid, ja alles siis said vahendid õpilased. Ma kartsin, et nüüd kirjutab masin kõik kirjandid. Tegelikult muutsin ülesandeid: kirjutame rohkem tunnis ja kodus palun hoopis masina vastust kritiseerida.',
        'Saatejuht: Rein, kuidas sina seda kasutad?',
        'Rein: Kõige rohkem küsin selgitust, kui ma tunnis millestki aru ei saanud. Masin on kannatlik, ta seletab kümme korda. Aga ma olen juba kaks korda tabanud teda valelt: ta mõtles välja raamatu, mida ei ole olemas.',
        'Saatejuht: Kas see on ohtlik?',
        'Maarja: Ohtlik on see, kui keegi ei kontrolli. Ma ütlen õpilastele: masin on nagu väga enesekindel klassivend, kes vahel valetab. Kuula teda, aga kontrolli.',
        'Rein: Ja isikuandmeid me sinna ei pane. Meile öeldi kohe esimeses tunnis, et oma ega sõprade nimesid ja terviseandmeid masinasse ei kirjutata.',
        'Saatejuht: Kas hinded on paranenud?',
        'Maarja: Seda on veel vara öelda. Aga küsimusi on tunnis rohkem ja see on minu jaoks hea märk.',
        'Saatejuht: Viimane küsimus: mida soovitate vanematele?',
        'Rein: Küsige oma lapselt, mida ta masinalt eile küsis. See on parem kui keelamine.',
        'Maarja: Ja proovige ise. Raske on rääkida asjast, mida pole kunagi kasutanud.',
      ], [
        ['Mis juhtus Maarja sõnul programmi alguses kõige esimesena?', 'koolitati õpetajaid', 'õpilased said vahendid', 'muudeti hindamist'],
        ['Kuidas muutis Maarja oma kodutöid pärast seda, kui vahendid tulid?', 'õpilased kritiseerivad kodus masina vastust', 'kodutöid ei anta enam üldse', 'kodutööd kirjutab masin'],
        ['Milleks kasutab õpilane Rein vestlusrobotit kõige sagedamini?', 'selgituse küsimiseks', 'kirjandite kirjutamiseks', 'raamatute otsimiseks'],
        ['Mida tegi masin Reini sõnul valesti juba kaks korda?', 'mõtles välja raamatu, mida ei ole olemas', 'kustutas tema töö', 'hindas teda ebaõiglaselt'],
        ['Mida ei tohi Reini koolis õpilased masinasse kirjutada?', 'isikuandmeid', 'kodutööde küsimusi', 'raamatute pealkirju'],
        ['Mida soovitab Rein lapsevanematele keelamise asemel teha?', 'küsida lapselt, mida ta masinalt küsis', 'keelata masina kasutamine', 'kontrollida lapse telefoni'],
      ], 'g_read'), { voice: 'interview', task: 'L02', harno: 'L2' }),
      tag(B.listening('060_p_listen', 'Kuulamine 3: raadiointervjuu (10 punkti).', 'Kuula intervjuud raamatukogu digiabi juhiga kaks korda. Kirjuta igasse lünka üks või kaks sõna.', [
        'Saatejuht: Tere! Stuudios on Andres Kask, kes juhib ühe Tallinna linnaraamatukogu digiabi. Andres, mis on digiabi?',
        'Andres: See on tasuta abi neile, kes ei saa e-teenustega üksi hakkama. Meie juures käib nädalas umbes kuuskümmend inimest. Enamik on üle kuuekümne viie, aga üllatavalt palju on ka noori, kes on just Eestisse kolinud.',
        'Saatejuht: Millega kõige sagedamini tullakse?',
        'Andres: Esikohal on Smart-ID ja PIN-koodid. Teisel kohal on retseptid ja perearsti aja broneerimine. Kolmandaks küsitakse, kuidas teha pangaülekannet.',
        'Saatejuht: Kas te teete asju inimese eest?',
        'Andres: Ei, see on meie esimene reegel. Me ei võta inimese telefoni enda kätte. Istume kõrvale ja inimene vajutab ise. Nii jääb oskus talle, mitte meile.',
        'Saatejuht: Aga PIN-koodid?',
        'Andres: Neid me ei vaata ega kirjuta üles. Vahel tuleb inimene, kes on koodid kirjutanud ID-kaardi ümbrisele. Siis soovitame need kohe vahetada.',
        'Saatejuht: Kas on ka keerulisi juhtumeid?',
        'Andres: Kõige keerulisem on hirm. Mõni inimene ei julge midagi vajutada, sest ta kardab, et kaotab pensioni. Esimesel korral harjutame ainult sisse- ja väljalogimist. Teisel korral juba retsepti vaatamist.',
        'Saatejuht: Kes teid aitavad?',
        'Andres: Meil on kaks töötajat ja kevadest ka kuus gümnaasiumi õpilast vabatahtlikena. Noortele on see hea praktika ja eakad räägivad nendega meelsasti, sest noored on kannatlikud.',
        'Saatejuht: Mis on teie suurim mure?',
        'Andres: Aeg. Üks konsultatsioon kestab tavaliselt pool tundi, aga järjekord on kaks nädalat. Seepärast hakkame jaanuarist korraldama ka rühmatunde, kus on korraga kuni kaheksa inimest.',
        'Saatejuht: Mida soovitate lähedastele?',
        'Andres: Ärge tehke kõike oma ema või isa eest. Näidake, istuge kõrvale ja olge kannatlik. Ja öelge julgelt, et küsida ei ole häbi.',
        'Saatejuht: Aitäh, Andres!',
      ], [
        'Andrese sõnul käib raamatukogu digiabis nädalas umbes [kuuskümmend|60] inimest.',
        'Lisaks eakatele käib digiabis üllatavalt palju [noori], kes on just Eestisse kolinud.',
        'Kõige sagedamini küsitakse digiabis abi [Smart-ID|Smart-ID-ga] ja PIN-koodidega.',
        'Teisel kohal on küsimuste seas retseptid ja perearsti aja [broneerimine].',
        'Digiabi esimene reegel on, et inimese [telefoni] ei võeta enda kätte.',
        'Vahel tuleb inimene, kes on oma PIN-koodid kirjutanud ID-kaardi [ümbrisele].',
        'Andrese sõnul on digiabis kõige keerulisem inimese [hirm] midagi valesti teha.',
        'Esimesel kohtumisel harjutatakse inimesega ainult sisse- ja [väljalogimist].',
        'Kevadest aitavad töötajaid vabatahtlikena kuus gümnaasiumi [õpilast].',
        'Pika järjekorra tõttu hakatakse jaanuarist korraldama ka [rühmatunde].',
      ], 'g_read'), { task: 'L04', harno: 'L3' }),
      tag(B.truefalse('060_p_tf', 'Kuulamine 4: õige või vale? (12 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Raamatukogu digiabi on kõigile, kes seda vajavad, tasuta.', true],
        ['Digiabis käivad Andrese sõnul ainult üle kuuekümne viie aastased inimesed.', false],
        ['Kõige sagedamini küsitakse digiabis, kuidas teha pangaülekannet.', false],
        ['Digiabi töötajad ei tee toiminguid inimese eest, vaid istuvad kõrval.', true],
        ['Töötajad kirjutavad inimese PIN-koodid üles, et need meelest ei läheks.', false],
        ['Kui koodid on ID-kaardi ümbrisele kirjutatud, soovitatakse need kohe vahetada.', true],
        ['Mõni inimene kardab, et üks vale vajutus võib talle raha maksma minna.', true],
        ['Esimesel kohtumisel vaadatakse koos kohe inimese retsepte.', false],
        ['Raamatukogu digiabis töötab praegu kaks töötajat.', true],
        ['Digiabi vabatahtlikud abilised on ülikooli tudengid.', false],
        ['Praegu tuleb konsultatsiooni järjekorras oodata umbes kaks nädalat.', true],
        ['Andres soovitab lähedastel teha keerulised asjad vanemate eest ära.', false],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.writing('060_p_say', 'Kirjuta kuuldust (5–6 lauset).', 'Võta intervjuu digiabist kokku: mis on digiabi, millised on selle reeglid ja mis on suurim mure. Lõpus kirjuta, kas sinu kodukohas oleks sellist abi vaja ja miks.', [5, 6], ['digiabi', 'reegel', 'sest'], 2),
      B.rubric('060_p_score', 'Minu punktid.', 'Loe kokku oma punktid. Igas osas on vaja vähemalt 60 %.', ['Lugemine (leht 1): osa 1 … / 7, osa 2a … / 8, osa 3 … / 12, osa 4 … / 8 (osa 2b on kirjutamise lehel).', 'Keeleosa: … / 12 (paranda 6, ütle teisiti 6).', 'Kuulamine: osa 2 … / 6, osa 3 … / 10, osa 4 … / 12 (osa 1 on viimase lehe alguses) — kokku koos osaga 1 … / 34.', 'Läbitud: igas osas vähemalt 60 %, eesmärk 80 %.']),
    ],
    // reading part 2b, then writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('060_t_situation', 'Vahehindamine: lühiteated, lugemise osa 2b, kirjutamine ja rääkimine', 'Kõigepealt kuulad kuut lühiteadet (kuulamise osa 1, kuuled üks kord). Siis loed spordiklubi teadet liikmetele ja vastad küsimustele (lugemise osa 2b). Seejärel kirjutad klubile kirja ja kokkuvõtte andmetest ning räägid oma digireeglitest ja arutled paariga.'),
      tag(perClip(B.examListen('060_p_clips', 'Kuulamine 1: kuus lühiteadet (6 punkti).', 'Kuulad kuut lühikest teadet. Iga teadet kuuled ainult üks kord. Vali igale küsimusele üks õige vastus kolmest.', 'choice', [
        'Teadustaja: Esimene teade. Linnaraamatukogu digiabi on alates detsembrist avatud ka laupäeviti kella kümnest kaheni. Abi saab riigiportaali, retseptide ja pangaülekannete puhul. Eelnevalt registreeruma ei pea, aga võtke kaasa oma ID-kaart ja telefon. Teenus on tasuta.',
        'Teadustaja: Teine teade. Riigi Ilmateenistus hoiatab: homme pärastlõunal tõuseb Lääne-Eesti rannikul tugev tuul, puhanguti kuni kakskümmend viis meetrit sekundis. Saartele sõitvad praamid võivad hilineda. Jälgige ametlikke teateid ja ärge jagage kontrollimata valeinfot.',
        'Teadustaja: Kolmas teade. Perearstikeskus teatab: alates esmaspäevast saab vastuvõtuaega broneerida ka riigiportaali kaudu. Telefoni teel registreerimine jääb alles, kuid hommikuti on liinid sageli hõivatud. Kiire mure korral helistage perearsti nõuandeliinile üks kaks kaks null.',
        'Teadustaja: Neljas teade. Kauplusekett teatab: meie nimel saadetakse praegu e-kirju, milles lubatakse auhinnamängu võitjale viissada eurot ja suurt allahindlust. Meie sellist mängu ei korralda ega küsi kunagi teie pangakaardi andmeid. Palun kustutage kahtlane kiri ja ärge vajutage lingile.',
        'Teadustaja: Viies teade. Ülikooli avatud loengus räägitakse täna tehisintellektist hariduses. Lektor selgitab, kuidas õpilased saavad kasutada vestlusrobotit õppimiseks, mitte kodutööde kirjutamiseks. Loeng algab kell kuusteist kolmkümmend aulas ja seda kantakse üle ka veebis.',
        'Teadustaja: Kuues teade. Mobiilioperaator teatab: ööl vastu kolmapäeva tehakse kella kahest neljani võrgus hooldustöid. Sel ajal ei pruugi mobiilne internet töötada, kuid hädaabinumbrile üks üks kaks saab helistada alati.',
      ], [
        ['Mis muutub teate järgi alates detsembrist linnaraamatukogu digiabis?', 'see on avatud ka laupäeviti', 'sinna tuleb ette registreeruda', 'see muutub tasuliseks'],
        ['Mida soovitab ilmateenistus inimestel tugeva tuule ajal teha?', 'jälgida ametlikke teateid', 'loobuda praamisõidust', 'jääda koju'],
        ['Mis on perearstikeskuses alates esmaspäevast teisiti kui varem?', 'aja saab broneerida riigiportaalis', 'telefoni teel enam registreerida ei saa', 'keskus on hommikuti suletud'],
        ['Mida palub kauplusekett oma klientidel teha, kui nad sellise kirja saavad?', 'kustutada kahtlane kiri', 'sisestada kaardi andmed', 'helistada kauplusesse'],
        ['Millest räägitakse täna õhtul ülikooli avatud loengus?', 'kuidas vestlusrobotit õppimiseks kasutada', 'kuidas kodutöid masinaga kirjutada', 'kuidas saada ülikooli'],
        ['Mis töötab mobiilioperaatori sõnul ka öiste hooldustööde ajal?', 'hädaabikõne', 'mobiilne internet', 'kõik teenused tavaliselt'],
      ], 'g_read', 1)), { task: 'L01', harno: 'L1' }),
      B.text('060_t_notice', 'Lugemine 2b: klubi teade liikmetele', 'Head liikmed!\n\n12. novembril avastasime, et meie broneerimissüsteemi oli sisse tunginud kõrvaline isik. Asi sai alguse sellest, et üks liige märkas oma kontol broneeringut, mida ta ise ei olnud teinud. Uurimine näitas, et süsteemi pääseti ühe töötaja vana parooli abil. Lekkida võisid liikmete nimed, e-posti aadressid, telefoninumbrid ja trennide ajalugu. Pangakaartide andmeid meie süsteemis ei hoita, seega neid ei lekkinud.\n\nJuhtumist teavitati 72 tunni jooksul Andmekaitse Inspektsiooni, nagu seadus nõuab. Süsteemi paroolid on vahetatud ja turvaauk on suletud. Väline ekspert kontrollib järgmisel nädalal üle kogu süsteemi. Edaspidi peavad kõik töötajad kasutama kaheastmelist sisselogimist.\n\nPalume teil kõigepealt vahetada oma klubi konto parool, eriti kui kasutate sama parooli ka mujal. Olge ettevaatlik e-kirjadega, mis paluvad tasuda „liikmemaksu võlga” või sisestada andmeid: meie selliseid kirju ei saada. Ärge vastake sõnumitele, kus küsitakse PIN-koodi. Kui märkate oma kontol midagi kahtlast, kirjutage meile kohe.\n\nKui soovite teada, milliseid andmeid me teie kohta hoiame, või soovite oma andmed kustutada, kirjutage klubi andmekaitsespetsialistile. Vastame ühe kuu jooksul. Kui te meie vastusega rahul ei ole, võite pöörduda Andmekaitse Inspektsiooni poole.\n\nKõik liikmed, kelle andmed võisid lekkida, saavad detsembris ühe tasuta trenni. Klubi tööd see juhtum ei mõjuta: kõik trennid toimuvad tavapäraselt. Vabandame juhtunu pärast ja täname kõiki, kes andsid meile kiiresti teada.\n\nKlubi juhatus'),
      tag(B.table('060_t_ask', 'Lugemine 2b: lühivastused (8 punkti).', 'Vasta teate järgi igale küsimusele 1–3 sõnaga.', 'Küsimus, Vastus', [
        'Mis kuupäeval sai klubi teada, et süsteemi oli sisse tungitud? | [12. novembril/kaheteistkümnendal novembril]',
        'Milliseid liikmete andmeid klubi süsteemis üldse ei olnud? | [pangakaartide andmeid/pangakaardi andmeid/pangakaartide andmed]',
        'Kellele andis klubi juhtumist kolme päeva jooksul teada? | [Andmekaitse Inspektsioonile/inspektsioonile]',
        'Kes kontrollib järgmisel nädalal kogu süsteemi? | [väline ekspert/ekspert]',
        'Mida peaks liige tegema, eriti kui tal on mitmes kohas sama parool? | [parooli vahetama/vahetama parooli/vahetama]',
        'Millise võla nime all võivad tulla petukirjad? | [liikmemaksu võla/liikmemaksu võlg/liikmemaksu]',
        'Kelle käest saab küsida, milliseid andmeid klubi hoiab? | [andmekaitsespetsialistilt/klubi andmekaitsespetsialistilt]',
        'Mida saavad liikmed vabanduseks detsembris? | [tasuta trenni/ühe tasuta trenni/ühe trenni]',
      ], 'g_read'), { task: 'R15', harno: 'R2b' }),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's own digital rules, built in 056–059
      B.planning('060_t_product', 'Mooduli tulemus: minu digireeglid.', 'Võta oma kaart „Minu digireeglid” tunnist 59 ja lisa igale reale üks lause tundidest 56–58.', ['Mida ma e-riigis nüüd ise teen? (tund 56: kuidas seda tehakse)', 'Mida ma tehisintellektile ei anna? (tund 57: … sisestamine on keelatud)', 'Kuidas ma uudist enne jagamist kontrollin? (tund 58: seda ei ole kinnitatud)', 'Mida ma oma telefonis muutsin? (tund 59: asukoha jagamine, küpsised)']),
      PART('060_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, note: 'Kirjutamine Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja kokkuvõtte eest 15 punkti; eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.letter('060_t_letter', 'Kirjutamine 1: kiri klubile (umbes 140 sõna).', 'Sa lugesid klubi teadet. Kirjuta juhatusele: mida tundsid, mida juba tegid, kaks küsimust oma andmete kohta ja mida klubilt palud. Poolametlik stiil.', 'Lugupeetud juhatus!', 'Lugupidamisega', [140, 160]), { task: 'W13', harno: 'W1' }),
      B.chart('060_t_data', 'Generatiivse tehisintellekti kasutajad 2025. aastal (% elanikest)', { kind: 'bar', unit: '%', series: 'Euroopa Liit, Eesti', rows: ['kasutas tehisintellekti tööriistu (16–74-aastased) | 32,7 | 46,6', 'kasutas neid tööl (16–74-aastased) | 15,1 | 25,1', 'kasutas tehisintellekti tööriistu (16–24-aastased) | 63,8 | 82,8'], source: 'Eurostat, IKT kasutamise uuring 2025 (uudised 16.12.2025 ja 10.02.2026)' }),
      tag(B.writing('060_t_summary', 'Kirjutamine 2: kokkuvõte ja kommentaar (umbes 180 sõna).', 'Kirjuta keelekursuse uudiskirja joonise põhjal kokkuvõte: mida arvud näitavad, kaks olulisemat erinevust Eesti ja Euroopa Liidu vahel ning sinu kommentaar koos näitega, mida see tähendab inimestele, kes tehisintellekti tööl või õppimisel kasutavad.', [12, 14], ['võrreldes', 'samas', 'protsenti', 'kõige rohkem', 'seega'], 4), { task: 'W15', harno: 'W2a' }),
      PART('060_t_spart', 'S', { minutes: 20, points: 25, tasks: 2, note: 'Rääkimine Harno B2 vormis. Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; eesmärk on vähemalt 20 punkti (80 %).' }),
      tag(B.speaking('060_t_present', 'Rääkimine 1: sõnavõtt (1 minut).', 'Teemakaart: keelekursuse seminaril tutvustab igaüks oma digireegleid. Mõtle 2 minutit oma kaardi järgi, räägi 1 minut, siis vasta küsimustele.', ['Millised on sinu kolm digireeglit ja miks just need?', 'Mida sa e-riigis nüüd ise teed?', 'Mida sa tehisintellektile ei annaks? Põhjenda.', 'Paariline küsib: „Kuidas sa kontrollid uudist, enne kui jagad?”', 'Kas sinu arvates on mugavus tähtsam kui privaatsus? Miks?', 'Kes peaks aitama inimesi, kes e-teenustega hakkama ei saa: riik, raamatukogu või pere? Põhjenda.'], [90, 180], ['Tahaksin tutvustada oma digireegleid …', 'Kõige tähtsam on minu jaoks …', 'Näiteks …', 'Seepärast soovitan …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('060_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas tehisintellekti loodud pildid ja videod peavad olema alati märgistatud? Argumendid: võltsvideo võib petta tuhandeid inimesi; märgistus aitab lugejal otsustada; ELi tehisintellekti määrus nõuab, et inimene teaks, kui ta suhtleb masinaga. Lisa oma näide.',
        'Kaart B (vastu). Teema: kas tehisintellekti loodud pildid ja videod peavad olema alati märgistatud? Argumendid: petis märgistust niikuinii ei pane; kui iga parandatud foto on märgistatud, ei loe keegi märgiseid; tähtsam on õpetada inimesi allikat kontrollima. Lisa oma näide.',
        ['Minu arvates …', 'Näiteks nägin hiljuti …', 'Ma saan aru, et …, aga …'], ['Ma ei ole päris nõus, sest …', 'Mis saab siis, kui …?', 'Kas võiksime kokku leppida, et …?', 'Ühine seisukoht võiks olla …']), { task: 'S17', harno: 'S2' }),
      B.rubric('060_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi punktid. Igas osas on vaja vähemalt 60 %.', ['Kuulamine 1: … / 6 (lisa kuulamise lehe punktidele).', 'Lugemine 2b: … / 8 (lisa lugemise lehe punktidele).', 'Kiri: juhtum ja tunne, mida tegid, kaks küsimust, selge palve, sobiv pöördumine ja toon, umbes 140 sõna (10 punkti).', 'Kokkuvõte: üldistus andmetest, kaks erinevust numbritega, põhjendatud kommentaar näitega, umbes 180 sõna (15 punkti).', 'Sõnavõtt: kolm reeglit ja põhjendus 1 minutiga, vastus küsimustele (10 punkti).', 'Arutelu: argumendid näidetega, reageerimine paarilisele, ühine seisukoht (15 punkti).']),
      B.selfcheck('060_t_self', ['Lugemine: … / 43 punkti; kuulamine: … / 34 punkti.', 'Kirjutamine: … / 25 punkti (kiri 10, kokkuvõte 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Ma tean, mida enne järgmist moodulit korrata.'], 'Vahehindamine 3 tehtud'),
    ],
  },
};

// the v4 explanations of the retired blocks (shown with the hidden block, courseSheet.js withExplanations)
const OLD_WHY = {
  // 056
  '056_d_facts': [
    '1. lõik: „PIN1 on sisselogimiseks ja PIN2 allkirjastamiseks”.',
    '1. lõik: „blokeeritakse see ja selle saab avada PUK-koodiga”.',
    '2. lõik: „Apteegis näidatakse isikut tõendavat dokumenti ja ravim antakse kätte”.',
    '2. lõik: „anti 2023. aastal esimest korda üle poole kõigist häältest arvutis”.',
    '3. lõik: „abielu lahutamise avalduse saab nüüd esitada internetis … viimane riigiteenus”.',
    '3. lõik: „lahutuse puhul tuleb üks kord ametnikuga kohtuda”.',
    '4. lõik: andmejälgijast saab vaadata, „kes on mõnes andmekogus sinu andmeid kasutanud”.',
    '3. lõik: „Täielikult ilma inimeseta asi siiski ei käi” — mugav, aga inimest on vahel vaja.',
  ],
  '056_p_forms': [
    'logima → logida → logitakse.',
    'allkirjastama → allkirjastada → allkirjastatakse.',
    'Eitus lühema vormiga: anda → ei anta.',
    'registreerima → registreerida → registreeritakse.',
    'Eitus: küsida → ei küsita.',
    'teha → tehakse (lühike da-vorm).',
    'sulgeda → suletakse; ka blokeeritakse sobib.',
  ],
  '056_t_voice': [
    'Natalja: „Mu tütar elab nüüd Soomes.”',
    'Natalja: „kirjutas mulle uue retsepti”.',
    'Natalja: „ma kolisin eelmisel kuul siia”.',
    'Natalja: „Kas selleks peab linnavalitsusse minema?”',
    'Natalja: „ma ei mäleta, kumb on milleks” (kaks PIN-koodi).',
    'Natalja: „Kas sa saaksid mulle laupäeval … seletada?”',
  ],
  '056_t_exit': [
    'Eitus lühema vormiga: anda → ei anta.',
    'hääletama → hääletada → hääletatakse.',
    'allkirjastama → allkirjastatakse (PIN2-ga).',
  ],
  // 057
  '057_d_ask': [
    'Juhend: firma lepingute üleslaadimine on keelatud, tõlkida tohib ainult avalikke tekste.',
    'Juhend: „iga masina kirjutatud teksti loeb enne saatmist läbi inimene”.',
    'Juhend: „Faktide, numbrite ja seaduste kontrollimine on kasutaja kohustus.”',
    'Juhend: „vastutab alati selle saatja, mitte programm”.',
    'Juhend: „töötajate hindamine masina abil” on keelatud.',
    'Juhend: lubatud on „pikkade dokumentide kokkuvõtete tegemine”.',
    'Juhend: „kui kliendile vastab vestlusrobot, peab klient seda teadma”.',
    'Juhend: „kasutuselevõtt kooskõlastatakse IT-osakonnaga”.',
  ],
  '057_p_nom': [
    'Ei tohi sisestada → sisestamine on keelatud; sihitis läheb omastavasse: isikukoodi sisestamine.',
    'Võib teha → tegemine on lubatud; kokkuvõtteid → kokkuvõtete tegemine.',
    'Inimene, kes saadab → saatja (-ja).',
    'Kes kasutab → kasutaja (-ja).',
    'Hindamine on keelatud → ei tohi hinnata; töötajate → töötajaid (osastav).',
    'Tõlkimine on lubatud → võib tõlkida; avalike tekstide → avalikke tekste (osastav).',
    'On kohustus → peab + ma-tegevusnimi (eemaldama); isikuandmete eemaldamine → isikuandmed eemaldama.',
  ],
  '057_t_exit': [
    'sisestama → sisestamine; sihitis ees omastavas: andmete sisestamine.',
    'Kes saadab → saatja.',
    'kontrollima → kontrollimine: numbrite kontrollimine.',
  ],
  // 058
  '058_d_article': [
    'Eelmine lause: teadlased „uurisid seda mitmes katses” → mida katses tehti: näidati pealkirju.',
    '„Kui küsiti, kas pealkiri on tõsi …” → vastand: „Kui aga küsiti, kas nad seda jagaksid …”',
    '„Järeldus oli üllatav.” → mis järeldus: inimesed ei mõtle sel hetkel tõele.',
    '„lihtsat nippi” → mis nipp: paluti hinnata pealkirja õigsust.',
    '„ka” → sama tulemus teises katses. Üleliigne lause ütleb vastupidist: inimesed eristasid tõde päris hästi.',
    '„Mida siis teha?” → nõuanne: küsi endalt, kas see on tõsi.',
  ],
  '058_p_check': [
    'Eile õhtul = kindel aeg minevikus → jagati.',
    'Postituse järgi eile → tehti.',
    'Juba 2019. aastal ja tulemus praegu → on kasutatud.',
    'Minevik, eitus → ei nimetatud.',
    'Eitus täisminevikus: ei ole + -tud (üle ujutatud).',
    'Tulemus praegu (juba üle 2000 korra) → on jagatud.',
    'Väide kehtib praegu → väidetakse.',
    'ei ole + -tud → esitatud.',
  ],
  '057_t_tf': [
    'Kaarel: „see on liiga range. Ma kirjutan klientidele iga päev kümneid kirju.”',
    'Merit: „Ma ei ole masina vastu, ma olen kontrollimata kirjade vastu.”',
    'Merit: „Masin pani kliendi kirja vale hinna ja keegi ei märganud.”',
    'Merit: „lase masinal kirjutada tekst ilma nimeta ja lisa nimi ise lõpus”.',
    'Kaarel: „See oli inimese viga, mitte masina.”',
    'Merit: „Ma ei ole kindel. Arutame seda reedel koosolekul.” — kokkulepet veel ei ole.',
  ],
  '058_t_voice': [
    'Häälsõnum: „mu õe naabri tuttav ütles” — allikas on kolmandast suust.',
    'Häälsõnum: „Homsest suletakse kõik Tallinna apteegid”.',
    'Häälsõnum: „kolmeks päevaks”.',
    'Häälsõnum: „ostke ravimeid varuks”.',
    'Häälsõnum: „ei taheta paanikat tekitada”.',
    'Häälsõnum: „Saatke see sõnum kõigile …, eriti vanematele inimestele.”',
  ],
  '058_t_exit': [
    'Tulemus praegu → täisminevik: on töödeldud (töödelda → töödeldud).',
    'Katse tehti minevikus → minevik: paluti.',
    'Minevik, eitus → ei nimetatud.',
  ],
  // 059
  '059_d_radio': [
    'Marika: „Vaadake, millistel rakendustel on luba kasutada teie asukohta …”',
    'Marika: „reklaamiküpsistest võite keelduda”.',
    'Marika: „Firma peab üldjuhul vastama ühe kuu jooksul.”',
    'Marika: andmejälgijast „näeb, kes on mõnes riigi andmekogus teie andmeid vaadanud”.',
    'Marika: „alates kolmeteistkümnendast eluaastast”.',
  ],
  '059_p_plain': [
    'kogumine toimub → kogutakse; asukohaandmete → asukohta.',
    'edastamine eeldab nõusolekut → antakse (edastatakse) ainult sinu nõusolekul.',
    'kustutamine toimub → kustutatakse; andmed on tervik → nimetav.',
    'kasutamine on vajalik → kasutatakse / on vaja.',
    'jagame asukohta → asukoha jagamine (sihitis omastavas ees).',
    'ei müüda → müümine on keelatud / ei ole lubatud.',
    'Kes kasutab → kasutaja.',
  ],
  '059_t_exit': [
    'jagamine + sihitis omastavas: asukoha jagamine.',
    'nõudma + osastav: kustutamist.',
    'koguma → koguda → kogutakse.',
  ],
  // 060
  '060_d_read': [
    '(E): „lähedased, kes ei tee asju vanemate eest, vaid koos nendega, on digiriigi nähtamatu vundament”.',
    'Sinu oma vastus: õpetaja vaatab, kas tood näite.',
  ],
  '060_d_mc': [
    '(A) loetleb saavutused: kõik teenused veebis, e-hääled, digiretseptid.',
    '(B): „Neil ei olnud kooliajal arvutit ja nüüd ei ole kõrval kedagi …”',
    '(C): „Oskus nuppu vajutada ei tähenda aga oskust hinnata, kas masina vastus on õige.”',
    '(D): „kaks paralleelset süsteemi on kallid ja aeglustavad arengut”.',
    '(E): „Minu arvates ei ole küsimus selles, kas paber või ekraan … kas inimesel on kellegi poole pöörduda.”',
    '(F): „Täielik digitaalsus ei tähenda seega, et inimest enam ei vajata.”',
    '(G): „Mitte teha tema eest, vaid istuda kõrvale ja oodata, kuni ta ise vajutab.”',
  ],
  '060_d_para': [
    '(B): „kardavad, et üks vale vajutus võtab neilt pensioni”.',
    '(F): „tuleb e-avalduse järel siiski üks kord ametnikuga kohtuda”.',
    '(C): „Oskus nuppu vajutada ei tähenda aga oskust hinnata …”',
    '(G): „Mitte teha tema eest …” — ainult nii jääb oskus inimesele.',
    '(D): „iga euro, mis kulub paberile, jääb puudu kuskilt mujalt”.',
    '(A): „asi aetakse köögilaua taga paari minutiga”.',
    '(E): „Kui see vundament puudub, jääb … e-teenus tühjaks.”',
    '(F): andmejälgijast „saab vaadata, kes on … sinu andmeid kasutanud”.',
  ],
  '060_d_cloze': [
    'Mina-jutustus minevikus: vaatasin.',
    'ei + -nud + -ki: ei mäletanudki (rõhk: üldse mitte).',
    'Kõige lihtsam oli … → nimisõna: kustutamine.',
    'leidmiseks + omastav: selle leidmiseks.',
    'Tegija pole tähtis, minevik: öeldi.',
    'järgi + omastav: seaduse järgi.',
    'Tulemus praegu, umbisikuline: on kustutatud.',
    'tuleb + da-tegevusnimi: säilitada.',
    'luba + da-tegevusnimi: jälgida.',
    'rakendustel → millel (kellel on inimeste kohta).',
    'Kõige + ülivõrre: kõige tähtsam.',
    'enne + osastav: enne konto loomist.',
  ],
  '060_d_sent': [
    'Ema jäi üksi kõigi asjadega → helistas iga päev; järgmine lause loetleb põhjused.',
    'Ütlesin otse → ta solvus; „Kolmandal päeval helistas ta ise”.',
    'Lasin tal ise vajutada → see oli mulle raske.',
    'Ta nägi oma andmeid → kõige rohkem üllatas andmejälgija; järgmine lause räägib sellest.',
    'Ülekanne → kui raha kohale jõudis.',
    'Helistab harvemini → kui helistab, siis juttu ajama.',
    'Esimene allkirjastatud dokument → faili nimi.',
    'Takistus ei olnud tehnika → see oli hirm. Üle jääb lause sülearvutist, mis ei sobi loo mõttega.',
  ],
  '060_p_fix': [
    'Eitus lühema vormiga: ei anta.',
    'töödelda → töödeldud.',
    '-mine ees on sihitis omastavas: isikuandmete sisestamine.',
    'vastutama + eest: teksti eest.',
    'leidma → leida → leiti.',
    'Kaudne küsimus: küsis, kas … (ilma sõnata et).',
  ],
  '060_p_trans': [
    'Umbisikuline minevik: kirjutati; tervik sihitis nimetavas (retsept).',
    'Eituses ei ole + -tud: ei ole kontrollitud.',
    'ei tohi sisestada → sisestamine on keelatud (isikukoodi — omastav).',
    'Kes kasutab → kasutaja.',
    'Kaudses kõnes muutub isik: ma → ta.',
    'Tingimus: kui + tingiv, pealauses ka tingiv (kontrolliksid, ei jagaks).',
  ],
  '060_p_clips': [
    'Teade 1: „avatud ka laupäeviti”.',
    'Teade 2: „Jälgige ametlikke teateid”.',
    'Teade 3: „saab vastuvõtuaega broneerida ka riigiportaali kaudu”.',
    'Teade 4: „Palun kustutage kiri ja ärge vajutage lingile.”',
    'Teade 5: „kuidas õpilased saavad kasutada vestlusrobotit õppimiseks”.',
    'Teade 6: „hädaabinumbrile … saab helistada alati”.',
  ],
  '060_p_show': [
    'Maarja: „Kõigepealt koolitati meid, õpetajaid.”',
    'Maarja: „kodus palun hoopis masina vastust kritiseerida”.',
    'Rein: „Kõige rohkem küsin selgitust.”',
    'Rein: „ta mõtles välja raamatu, mida ei ole olemas”.',
    'Rein: „isikuandmeid me sinna ei pane”.',
    'Rein: „Küsige oma lapselt, mida ta masinalt eile küsis.”',
  ],
  '060_p_listen': [
    'Andres: „nädalas umbes kuuskümmend inimest”.',
    'Andres: „üllatavalt palju on ka noori”.',
    'Andres: „Esikohal on Smart-ID ja PIN-koodid.”',
    'Andres: „Teisel kohal on retseptid ja perearsti aja broneerimine.”',
    'Andres: „Me ei võta inimese telefoni enda kätte.”',
    'Andres: „koodid kirjutanud ID-kaardi ümbrisele”.',
    'Andres: „Kõige keerulisem on hirm.”',
    'Andres: „harjutame ainult sisse- ja väljalogimist”.',
    'Andres: „kuus gümnaasiumi õpilast vabatahtlikena”.',
    'Andres: „hakkame jaanuarist korraldama ka rühmatunde”.',
  ],
  '060_p_tf': [
    'Õige: „See on tasuta abi.”',
    'Vale: „palju on ka noori”.',
    'Vale: esikohal on Smart-ID ja PIN-koodid, pangaülekanne on kolmas.',
    'Õige: „Istume kõrvale ja inimene vajutab ise.”',
    'Vale: „Neid me ei vaata ega kirjuta üles.”',
    'Õige: „Siis soovitame need kohe vahetada.”',
    'Õige: „ta kardab, et kaotab pensioni”.',
    'Vale: esimesel korral ainult sisse- ja väljalogimine, retsept teisel korral.',
    'Õige: „Meil on kaks töötajat.”',
    'Vale: vabatahtlikud on gümnaasiumi õpilased.',
    'Õige: „järjekord on kaks nädalat”.',
    'Vale: „Ärge tehke kõike oma ema või isa eest.”',
  ],
  '060_t_ask': [
    'Teade: „12. novembril avastasime …”',
    'Teade: „Pangakaartide andmeid meie süsteemis ei hoita.”',
    'Teade: „teavitati 72 tunni jooksul Andmekaitse Inspektsiooni” (72 tundi = kolm päeva).',
    'Teade: „Väline ekspert kontrollib järgmisel nädalal üle kogu süsteemi.”',
    'Teade: „vahetada oma klubi konto parool, eriti kui kasutate sama parooli ka mujal”.',
    'Teade: e-kirjad, „mis paluvad tasuda „liikmemaksu võlga””.',
    'Teade: „kirjutage klubi andmekaitsespetsialistile”.',
    'Teade: „saavad detsembris ühe tasuta trenni”.',
  ],
};

// ---- v6 helpers (the same mechanisms as b2/module11.js) ---------------------------------------------------------------
// G18: the vocab block brings back three old words (3–15 lessons back); they are named on the sheet and used in the input
const withReview = (b, review) => ({ ...b, data: { ...b.data, title: `${b.data.title} Kordamiseks: ${review.join(', ')}.`, review } });
// G17 / G24: the main task of Kasuta — its type, the „Abikaart” (2–3 sentence starters) and the „Lisaväljakutse” line;
// both are printed on the learner's card too (the fold-out card is UI work, v6 §2 i)
const mainTask = (b, taskType, support, stretch, tags = {}) => tag({ ...b, data: { ...b.data, taskType, support, stretch } }, { main: true, level: 4, ...tags });
// G16: the 5-min „Parandatud versioon” that opens lessons 057–059 (replaces the warm-up statement, not an extra block)
const revision = (id, of, instruction) => {
  const b = B.writing(id, 'Parandatud versioon.', instruction, [3, 4]);
  return teach(tag({ ...b, data: { ...b.data, revisionOf: of } }, { task: 'W10' }),
    '„Parandatud versioon” (5 minutit, v6): õppija kirjutab ümber kolm lauset, mille sa eelmise tunni mustandis või kodutekstis märkisid (ainult märgi, ära paranda ise), ja ütleb ühe reaga, mis muutus. Kontrolli kohe: kas viga on parandatud? Korduv viga läheb õppija „Minu vead” nimekirja Harjutas. Kui õppija kodutööd ei teinud, parandab ta tunni mustandi kolm lauset.');
};
// G16: the in-class draft of the home text's first paragraph (≈ 10 min, feedback on one rubric criterion)
const draft = (id, title, instruction, criterion, range = [5, 7]) => teach(tag(B.writing(id, `Mustand tunnis: ${title} (10 minutit).`, instruction, range), { task: 'W11', level: 3 }),
  `Mustand tunnis, 10 minutit (v6): see on kodutöö esimene lõik. Tagasiside ainult ühele kriteeriumile — ${criterion}. Märgi kolm lauset (ära paranda): järgmise tunni alguses kirjutab õppija need ümber („Parandatud versioon”). Paaris: kaaslane loeb ja ütleb hindamisjuhendi selle rea järgi üht head ja üht parandust. Kui aega jääb vähe, piisab kolmest lausest.`);
// G14: the exit — 30–60 s of speech performing the lesson's can-do (the main task's skill), done in class
const exitTalk = (id, instruction, questions, note) => teach(tag(exitCheck(inLesson(B.speaking(id, 'Väljumine: 30 sekundit.', instruction, questions, [30, 60]))), { task: 'S11', fluency: true }),
  `Väljumiskontroll (v6 G14), 3 minutit: üks sooritus tunni oskusest, mitte vormiküsimused. Kuula, ära sega vahele. ${note} Lõpus üks tugevus ja üks parandus.`);
// G24: the self-check — three success criteria rated 0–1–2 and one own sentence as evidence
const selfCheck = (id, criteria, stamp, titleMore) => {
  const b = B.selfcheck(id, criteria, stamp, titleMore);
  return { ...b, data: { ...b.data, instruction: 'Hinda iga rida: 0 — veel mitte, 1 — osaliselt, 2 — jah. Kirjuta alla üks oma lause, mis seda tõendab.', criteria, evidence: true } };
};
// the home text: the draft finished at home + the 1-min voice message + Harjuta (v6 G18); the sheet gives few lines
const homeLines = (b, lines) => ({ ...b, data: { ...b.data, lines } });
// G25: the module's peer exchange (another pair reads the product and answers) and media log („Minu eesti keele võrgustik”)
const peerReply = (b) => ({ ...b, data: { ...b.data, peerReply: 'Teine paar loeb juhendi ja vastab: kaks tugevat kohta ja üks soov (edukriteeriumide järgi).', realAddressee: 'kursusekaaslased' } });
const mediaLog = (b) => ({ ...b, data: { ...b.data, mediaLog: true } });
// a control's rubric stays directly under the task it scores (courseSheet.js lessonOrder)
const keepPlace = (b) => ({ ...b, data: { ...b.data, keepPlace: true } });
// v5 G6: a control's recordings are locked; short clips are heard once, the interview twice
const once = (b) => ({ ...b, data: { ...b.data, plays: 1, lockPlays: true } });
const twice = (b) => ({ ...b, data: { ...b.data, plays: 2, lockPlays: true } });
const HARJUTA = 'Harjuta → moodul 12: sõnad ja vormid (10 min).';

// the analytic Harno B2 writing rubric (v5 G10): four criteria, 0–3 points each, with level descriptors; the teacher's
// note holds a borderline sample with its scoring (the same rubric as module 11)
const B2_WRITING = [
  ['Ülesande täitmine ja register', '3 — kõik sisupunktid on täidetud, adressaat ja toon sobivad, pikkus on ülesande piires; 2 — üks punkt on nõrk või toon kõigub; 1 — kaks punkti on puudu või toon ei sobi adressaadile; 0 — tekst ei vasta ülesandele'],
  ['Ülesehitus ja sidusus', '3 — lõigud, teemalaused ja mitmekesised sidendid, mõte liigub loogiliselt; 2 — lõigud on olemas, kuid sidendid korduvad; 1 — mõtete loetelu ilma lõikudeta; 0 — järjekorrast ei saa aru'],
  ['Sõnavara', '3 — täpne ja mitmekesine, kordusi väldib; 2 — piisav, mõni kordus või ebatäpne sõna; 1 — piiratud, sõnad korduvad, tähendus on kohati segane; 0 — sõnavara ei kanna sisu'],
  ['Grammatika ja õigekiri', '3 — liitlaused ja vormid (umbisikuline olevik ja minevik, -mine ja -ja, sihitis) on enamasti õiged; 2 — vigu on, kuid need ei takista mõistmist; 1 — vead takistavad kohati mõistmist; 0 — vead takistavad mõistmist pidevalt'],
];
const B2_WRITING_SHORT = ['3 kõik punktid, sobiv toon · 2 üks nõrk koht · 1 kaks puudu · 0 ei vasta', '3 lõigud ja mitmekesised sidendid · 2 sidendid korduvad · 1 loetelu · 0 segane', '3 täpne ja mitmekesine · 2 mõni kordus · 1 piiratud · 0 ei kanna sisu', '3 vead ei sega · 2 vead ei takista · 1 takistavad kohati · 0 takistavad pidevalt'];
const writingRubric = (id, title, sample) => {
  const b = B.rubricW2(id, title);
  return teach({ ...b, goal: 'g_use', data: { ...b.data, instruction: 'Neli kriteeriumi, igaüks 0–3 punkti, kokku 12. Kontrolli oma teksti enne saatmist.', criteria: B2_WRITING.map(([name], i) => ({ name, max: 3, hint: B2_WRITING_SHORT[i] })) } }, sample);
};
// the analytic speaking rubric of the control's discussion (12 points: four criteria 0–3, the same scale as writing)
const SPEAKING_12 = [
  ['Ülesande täitmine ja suhtlus', '3 seisukoht kohe, reageerib partnerile ja uuele infole, jõuab ühise reeglini · 2 üks neist nõrk · 1 räägib, aga ei reageeri · 0 ei vasta ülesandele'],
  ['Sujuvus ja ülesehitus', '3 räägib sujuvalt, põhjendab ja seob mõtted · 2 pausid ei sega · 1 pausid segavad kohati · 0 üksikud sõnad'],
  ['Sõnavara', '3 täpne ja mitmekesine (mooduli sõnad) · 2 piisav, mõni kordus · 1 piiratud · 0 ei kanna sisu'],
  ['Grammatika ja hääldus', '3 vead ei sega (umbisikuline, -mine, minevik) · 2 vead ei takista · 1 takistavad kohati · 0 takistavad pidevalt'],
];

// why a v4 block left the sheet
const CUT_HOOK = 'v5/v6: station 1 is the cold task (056) or the 5-min „Parandatud versioon” (057–059); the hook text and the warm-up talk merged into it';
const CUT_INPUT = 'second input of the lesson (v5: one input per lesson)';
const CUT_STATS = 'exact statistics (owner 2026-11-25: adapted texts, no exact numbers) or a second input';
const CUT_DRILL = 'exit gaps → Harjuta (v6 G14: the exit is a performance of the can-do, not three form items)';
const CUT_EXTRA = 'extra task (v5: one product task in Kasuta; „Kui aega jääb” is in the teacher plan)';
const CUT_HOME = 'home card / voice task: the home text on the sheet carries the 1-min voice message and the Harjuta link (v5 §3, v6 G18)';
const CUT_OLDTASK = 'v4 task replaced by the v6 task of the same station (new id, other block type)';
const CUT_CONTROL = 'control is one sheet ≤ 10 blocks, listening + speaking (v6 §2 g: B2 lesson 5 = 2 skills alternating)';
const RETIRE_WHY = {
  '056_d_open': CUT_STATS, '056_d_facts': CUT_STATS, '056_t_voice': CUT_INPUT, '056_t_cards': 'the four checkpoint cards: the notice on the mediation card 056_t_call is the case now (v5: ≤ 5 blocks on Kasuta)',
  '057_d_rules': 'v4 input (work rules, ≈ 150 words): the lesson\'s one input is now the radio 057_d_radio (v5: inputs alternate reading / listening, B2 listening 3–4 min)',
  '057_d_ask': CUT_INPUT, '057_t_chat': CUT_INPUT, '057_t_tf': CUT_INPUT, '057_t_debate': CUT_OLDTASK,
  '058_d_article': 'v4 input (sentence bank, ≈ 300 words): the lesson\'s one input is now the article 058_d_text (v5: reading 400–600 words with inference)',
  '058_t_posts': 'five posts: three of them are on the presentation card 058_t_present (v5: one input, ≤ 5 blocks on Kasuta)', '058_t_voice': CUT_INPUT, '058_t_decide': CUT_OLDTASK, '058_t_friend': CUT_OLDTASK,
  '059_d_know': CUT_STATS, '059_t_checks': CUT_INPUT, '059_t_plan': 'planning card „Minu digireeglid”: the module product is the project 059_t_guide (v6 G17 project)', '059_t_talk': CUT_OLDTASK,
};
const reasonFor = (id) => RETIRE_WHY[id] || (/^060_/.test(id) ? CUT_CONTROL : /_d_(hook|talk)$/.test(id) ? CUT_HOOK : /_t_more$/.test(id) ? CUT_EXTRA
  : /_t_exit$/.test(id) ? CUT_DRILL : /_t_(home|homework|letter|essay)$/.test(id) ? CUT_HOME : CUT_OLDTASK);

// a v4 block that left the sheet: hidden with its reason, its old explanation kept (v5 §4)
const V4_BLOCKS = Object.fromEntries(Object.values(V4).flatMap((l) => ['discover', 'practice', 'transfer'].flatMap((p) => l[p] || [])).map((b) => [b.id, b]));
const retire = (id) => {
  const b = V4_BLOCKS[id];
  if (!b) throw new Error(`module12: v4 plokki ${id} ei ole`);
  return hide(OLD_WHY[id] ? why(b, OLD_WHY[id]) : b, reasonFor(id));
};
// every v4 block of the lesson that is not on the v6 sheet goes, hidden, to the end of its own phase (a kept id must keep
// its block type)
const withRetired = (lessons) => Object.fromEntries(Object.entries(lessons).map(([id, l]) => {
  const used = new Map(['discover', 'practice', 'transfer'].flatMap((p) => (l[p] || []).map((b) => [b.id, b])));
  const phases = Object.fromEntries(['discover', 'practice', 'transfer'].map((p) => {
    const old = (V4[id]?.[p] || []).filter((b) => !used.has(b.id)).map((b) => retire(b.id));
    return [p, [...(l[p] || []), ...old]];
  }));
  used.forEach((b, bid) => {
    if (V4_BLOCKS[bid] && V4_BLOCKS[bid].type !== b.type) throw new Error(`module12: ${bid} oli ${V4_BLOCKS[bid].type}, nüüd ${b.type}`);
  });
  return [id, { ...l, ...phases }];
}));

// the purpose of every task („kes, kellele, mis tulemus”, stations.js st-purpose) for the teacher page — not printed in the
// instruction (v6 §2 e, G22: the instruction stays ≤ 25 words)
const PURPOSE = {
  '056_d_cold': 'Õpetaja kuuleb mooduli alguses, kuidas sa praegu arvamust ütled.',
  '056_d_text': 'Tead pärast lugemist, kellele e-riik on mugav ja kust saab abi.',
  '056_d_scheme': 'Skeem on sinu seletuse järjekord naabrile.',
  '056_p_forms': 'Naabri meelespeas on kirjas, kuidas asju aetakse ja mida ei tehta.',
  '056_p_active': 'Juhend räägib asjast, mitte inimesest, kes seda teeb.',
  '056_p_draft': 'Juhendi algus on valmis ja õpetaja märgib kolm lauset.',
  '056_t_call': 'Naaber saab teatest aru ja teab, mida ta ise teeb.',
  '056_t_say': 'Näitad 30 sekundiga, et oskad teadet lihtsas keeles seletada.',
  '056_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '056_t_guide': 'Naaber hoiab juhendit külmkapi uksel ja saab ise hakkama.',
  '056_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '057_d_revise': 'Sinu juhend naabrile saab paremaks ja sa näed oma vigu.',
  '057_d_radio': 'Kuuled koolitajalt, mida vestlusrobotile anda ja mida mitte.',
  '057_d_scheme': 'Skeemist näed, mis robotile sobib ja mis mitte.',
  '057_p_forms': 'Kursuse reeglid on kirjas lühidalt ja ametlikult.',
  '057_p_nom': 'Oskad ametlikku reeglit seletada ja tavalist lauset ametlikuks teha.',
  '057_p_draft': 'Arutluse esimene lõik on valmis ja õpetaja märgib kolm lauset.',
  '057_t_survey': 'Rühm teab, kuidas inimesed robotit kasutavad, ja saab reeglisoovituse.',
  '057_t_say': 'Näitad 30 sekundiga, et oskad küsitluse tulemust esitada.',
  '057_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '057_t_argue': 'Kursuse uudiskirja lugejad saavad kaalutud arvamuse.',
  '057_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '058_d_revise': 'Sinu arutlus saab paremaks ja sa näed oma vigu.',
  '058_d_text': 'Tead pärast lugemist, miks valeinfo levib ja kuidas seda peatada.',
  '058_d_scheme': 'Kolm küsimust on sinu esitluse plaan.',
  '058_p_check': 'Faktikontrolli lugeja teab, mis juhtus ja mis on praegu tõsi.',
  '058_p_fix': 'Faktikontrolli lugeja usaldab teksti, sest selles pole vigu.',
  '058_p_draft': 'Sõnumi esimene lõik on valmis ja õpetaja märgib kolm lauset.',
  '058_t_present': 'Rühm teab, millist postitust jagada ja millist mitte.',
  '058_t_say': 'Näitad 30 sekundiga, et oskad sõbrale rahulikult seletada.',
  '058_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '058_t_msg': 'Sõber kustutab vale postituse ega tunne end rünnatuna.',
  '058_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '059_d_revise': 'Sinu sõnum sõbrale saab paremaks ja sa näed oma vigu.',
  '059_d_radio': 'Kuuled juristilt, millised õigused sul oma andmete üle on.',
  '059_d_scheme': 'Skeem tõlgib tingimuste keele lihtsaks keeleks.',
  '059_p_forms': 'Saad aru tingimustest ja oskad neid teisele lihtsalt öelda.',
  '059_p_plain': 'Oskad tingimuste lauset lihtsaks teha ja vastupidi.',
  '059_p_talk': 'Paar teab, millised viis reeglit oma juhendisse panna.',
  '059_t_guide': 'Uus kursuslane teab viit reeglit ja saab teiselt paarilt tagasisidet.',
  '059_t_line': 'Näitad, et oskad oma teksti tagasiside järgi paremaks teha.',
  '059_t_self': 'Hindad ise, mida sa tunnis õppisid, ja tõendad seda oma lausega.',
  '059_t_request': 'Firma saab kirjast aru ja saadab sinu andmed.',
  '059_t_rubric': 'Enne saatmist näed, mille eest hindaja punkte annab.',
  '060_p_clips': 'Näitad, et saad lühiteatest aru ka siis, kui kuuled seda üks kord.',
  '060_p_listen': 'Näitad, et saad intervjuust aru ka siis, kui vastus on teiste sõnadega.',
  '060_t_cold': 'Näed, kuidas su rääkimine on mooduli algusest muutunud.',
  '060_t_rubric': 'Näed, mille eest üheminutilise arvamuse punktid tulevad.',
  '060_t_prep': 'Arutelu alguses on sul seisukoht ja argumendid valmis.',
  '060_t_debate': 'Näitad, et oskad arutelus seisukohta kaitsta ja kokku leppida.',
  '060_t_srubric': 'Näed, mille eest arutelu punktid tulevad.',
};
const withPurposes = (lessons) => Object.fromEntries(Object.entries(lessons).map(([id, l]) => [id, { ...l, ...Object.fromEntries(['discover', 'practice', 'transfer'].map((p) => [p, (l[p] || []).map((b) => (PURPOSE[b.id] ? { ...b, data: { ...b.data, purpose: PURPOSE[b.id] } } : b))])) }]));

export const LESSONS = withPurposes(withShapes(withRetired({
  'b1b2-056': {
    title: 'Kas sa saad e-riigis ise hakkama?',
    phases: grammar('Kordamine: tehakse, öeldakse · B2: retsept kirjutatakse välja, teade saadetakse, paberit ei anta, koode ei öelda'),
    format: 'quest',
    topic: 'town',
    canDo: 'Ma loen artiklit e-riigist, seletan naabrile lihtsas keeles, mida tema e-riigi teade tähendab ja mida ta peab tegema, ning kirjutan talle umbes 140-sõnalise juhendi; kasutan umbisikulist olevikku ja selle eitust.',
    teacherPage: {
      goal: 'Холодная задача устно; статья о e-riik; безличная форма и её отрицание; посредничество: уведомление соседке простыми словами; черновик в классе, дома инструкция 140 слов + eesti.ee.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: холодная задача (5 мин) — обязательно; статья — абзацы 1–4 и вопросы 1–5; станция 3 — правило и 10 предложений, черновик 3 предложения; посредничество без третьего препятствия.',
      hook: '«Väide: riik peaks jätma igale teenusele ka paberil asjaajamise võimaluse.» Ученик думает 1 минуту и говорит 1 минуту без помощи. Это холодная задача модуля (устно; модуль 11 мерил письмо): не помогайте, не давайте фраз, не исправляйте; запишите, если можно. В уроке 060 ученик говорит параллельную задачу в тех же условиях (060_t_cold).',
      plan: [
        '0–5: станция 1 — холодная задача: 1 минута подумать, 1 минута говорить; заметки или запись сохраните до 060',
        '5–30: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: пробежать заголовок и первые фразы абзацев (1 мин), статья (6 мин), 7 вопросов, из них 3 на вывод (10 мин), схема «как идёт e-услуга» (5 мин)',
        '30–52: станция 3 — безличная форма одной строкой (B1), B2: -takse / -dakse и отрицание ei anta / ei öelda; 10 предложений, «деятель уходит» (8 строк); черновик первого абзаца инструкции (10 мин), обратная связь — порядок шагов',
        '52–70: станция 4 — посредничество: соседка не понимает уведомление; вы — соседка со скрытой информацией',
        '70–75: выход: 30 секунд соседке; самооценка 0–1–2 + своё предложение; домашнее задание: инструкция 140 слов + три вещи со страницы eesti.ee, голосовое 1 мин, Harjuta; три отмеченных предложения из письма 055 — в «Minu vead»',
        'Kui aega jääb (75–90): мини-дебаты «бумага или экран» — вы против, ученик за, потом наоборот, в конце компромисс',
      ],
      sources: 'Статья «E-riik: mugav kõigile või ainult osavatele?» — учебный текст KeeleSepp, без точной статистики (раньше: e-голоса 2023, digiретсепт 99 %, e-развод 2024 — убраны). Общая основа: PIN1 — вход, PIN2 — подпись, цифровая подпись равна собственноручной, коды блокируются после трёх ошибок; digiabi в библиотеках и самоуправлениях; доверенность (volitus) на eesti.ee; andmejälgija в eesti.ee. Уведомление на карточке и соседка — учебные.',
      groups: 'Холодная задача — каждый сам. Статья — каждый сам, вопросы на вывод сравнивают в паре. Черновик — каждый сам, партнёр читает по строке рубрики «Ülesande täitmine». Станция 4 — пары: один объясняет, другой — соседка по вашей карточке, потом смена; в 1:1 соседка — вы.',
      errors: [
        '«Retsept kirjutakse välja» → «kirjutatakse» (от da-инфинитива: kirjutada → kirjutatakse).',
        '«Paberit ei antakse» → «ei anta» (в отрицании короткая форма без -kse: ei anta, ei öelda, ei tehta).',
        '«Koodid ei küsita» → «Koode ei küsita» (отрицание → частичный объект).',
        '«Nad kirjutavad retsepti» в инструкции → «Retsept kirjutatakse välja» (русское «выписывают» = эстонское безличное).',
      ],
      notes: [
        'Холодная задача — исходная точка модуля по устной речи. Отметьте: позиция в первой фразе, причина с примером, контраргумент, связки, 2–3 повторяющиеся ошибки. В 060 ученик говорит параллельную задачу (060_t_cold), вы сравниваете.',
        'Посредничество (v6 §2 l): ученик не читает уведомление вслух, а объясняет его своими словами. Пенсионеру — он может играть себя; студенту — соседка = бабушка; уставшему — только два шага. Тему выборов не обсуждаем.',
        'Слова на повтор (tingimused, tõend из урока 53, leping из 53–54) есть в статье: попросите ученика найти их и сказать, откуда он их знает.',
      ],
    },
    discover: [
      station(teach(tag(inLesson(B.speaking('056_d_cold', 'Külm algus: arvamus ühe minutiga.', 'Väide: „Riik peaks jätma igale teenusele ka paberil asjaajamise võimaluse.” Mõtle 1 minut. Räägi 1 minut: seisukoht, põhjus, näide, vastuargument.', [
        'Kas oled väitega nõus? Miks?',
        'Too üks näide oma elust või tuttava elust.',
        'Mida ütleks keegi, kes arvab teisiti?',
      ], [60, 90])), { task: 'S11', harno: 'S1', fluency: true }),
      'Mooduli külm ülesanne (algtase), 5 minutit, suuliselt (moodul 11 mõõtis kirjutamist, moodul 12 mõõdab rääkimist). Ära aita, ära anna fraase ega algust, ära paranda. Märgi üles: kas seisukoht on esimeses lauses, mitu põhjust, kas on näide, kas vastuargument tuleb, mitu sidendit (kuigi, seetõttu, samas …) ja 2–3 korduvat viga. Võimalusel salvesta. Tunnis b1b2-060 räägib õppija paralleelse ülesande samades tingimustes (kontrolli rääkimise 1. osa) ja te võrdlete.'), 1, 5),
      station(withReview(tag(B.vocab('056_d_vocab', 'Tunni sõnad.', ['e-teenus — электронная услуга', 'riigiportaal — государственный портал', 'sisse logima — входить (в систему)', 'allkirjastama — подписывать', 'digiallkiri — цифровая подпись', 'teade — уведомление', 'kehtivus — срок действия', 'mugavus — удобство', 'volitus — доверенность', 'andmekogu — база данных (государственная)']), { topic: ['e-teenus', 'riigiportaal', 'digiallkiri', 'andmekogu', 'volitus', 'kehtivus'] }), ['tingimused', 'tõend', 'leping']), 2, 25),
      why(teach(tag(B.reading('056_d_text', 'Loe artiklit.', 'Vaata enne pealkirja ja lõikude esimesi lauseid (1 minut). Siis loe ja vasta. Küsimustele 5–7 järelda ja näita lauset tekstist.', 'E-riik: mugav kõigile või ainult osavatele?', [
        'Eestis on harjutud, et riigiga suheldakse arvuti või telefoni kaudu. Retsept kirjutatakse välja digitaalselt, maksudeklaratsioon esitatakse mõne minutiga ja üürileping allkirjastatakse kodust lahkumata. Välismaalt tulnud külaline imestab sageli, et paberit ei anta peaaegu kuskil. Paljude jaoks on see nii tavaline, et nad ei mõtle selle peale enam üldse. Kuid kas e-riik on tõesti kõigi jaoks sama mugav?',
        'Süsteem põhineb kahel koodil. Esimese koodiga logitakse riigiportaali või panka sisse, teisega antakse digiallkiri. Digiallkiri on seaduse järgi sama väärtuslik kui allkiri paberil: kui allkirjastad lepingu, oled selle tingimustega nõus täpselt nii, nagu oleksid kirjutanud oma nime pastakaga. Kui koodi sisestatakse mitu korda valesti, blokeeritakse see ajutiselt. Seepärast ei kirjutata koode kunagi kaardi peale ja neid ei öelda kellelegi telefonis — ka mitte inimesele, kes ütleb, et helistab pangast.',
        'Mugavusel on hind, mida igaüks ei maksa ühtemoodi. Kes on kasvanud arvutiga, vajutab nuppe julgelt ja parandab vea kiiresti. Eakam inimene või hiljuti Eestisse kolinud pere tunneb end aga sageli nagu eksamil, mille küsimusi keegi ette ei öelnud. Riigiportaali tekstid on kirjutatud ametlikus keeles ja üks vale klõps võib tähendada, et taotlus jääb pooleli. Mõni loobub ja palub lapselt abi, mõni ootab, kuni dokumendi kehtivus on juba läbi. Kes keelt veel hästi ei oska, peab lisaks otsima sõnaraamatust iga teist sõna. Nii võtab viieminutiline asi tund aega ja tuju on rikutud.',
        'Riik ei ole kohapealset teenindust siiski kaotanud. Paljudes omavalitsustes ja raamatukogudes aidatakse inimest arvuti taga, kui ta selleks aja broneerib. Abistaja ei tee asja inimese eest, vaid istub kõrval ja seletab, mida järgmisena vajutada. Kui keegi teine peab sinu asju ajama, näiteks haiglas oleva vanema eest, antakse talle volitus. Ilma volituseta ei tohi isegi lähedane sinu nimel dokumente allkirjastada.',
        'E-riik tähendab ka seda, et sinu andmed on riigi andmekogudes. Riigiportaalis on teenus, kust saab vaadata, kes on sinu andmeid mõnes andmekogus kasutanud. Kõik andmekogud seal veel ei ole, kuid inimene saab vähemalt osaliselt ise kontrollida, et keegi ei vaata tema andmeid ilma põhjuseta. Kui tekib kahtlus, võib küsida selgitust ja nõuda tõendit, miks andmeid vaadati.',
        'Kõige rohkem muresid ei tule siiski tehnikast, vaid unustamisest. ID-kaardi kehtivus lõpeb, kuid inimene märkab seda alles siis, kui ta peab kiiresti lepingut allkirjastama. Riik saadab enne aegumist teate e-posti aadressile, mis on riigiportaali kirja pandud. Kui see aadress on vana, ei jõua teade kohale. Sama kehtib telefoninumbri kohta: kui number on vahetunud, ei jõua kohale ka kinnituskood. Seepärast soovitavad abistajad kord aastas oma kontaktandmed üle vaadata — see võtab vähem aega kui tassi kohvi joomine.',
        'Kas e-riik on kõigile mugav? Pigem on ta mugav neile, kes julgevad küsida. Sageli ei puudu inimesel mitte oskus, vaid julgus. Kõige paremini õpib see, kes vajutab ise ja kelle kõrval istub keegi kannatlikult. Kui sina oskad, siis ära tee naabri eest, vaid seleta talle, kuidas asju aetakse. Järgmisel korral saab ta juba ise hakkama.',
        'Allikas: KeeleSepp õppetekst.',
      ].join('\n\n'), [
        ['Milleks kasutatakse teksti järgi kahte koodi?', 'esimese koodiga logitakse sisse, teisega antakse digiallkiri'],
        ['Mis juhtub, kui koodi sisestatakse mitu korda valesti?', 'kood blokeeritakse ajutiselt'],
        ['Kuidas aidatakse inimest raamatukogus või omavalitsuses?', 'abistaja istub kõrval ja seletab, mida vajutada, aga ei tee asja tema eest'],
        ['Mida peab lähedane saama, et sinu nimel dokumente allkirjastada?', 'volituse|volitus'],
        ['Miks võrdleb autor e-riiki eksamiga, mille küsimusi keegi ette ei öelnud? Järelda.', 'eakas või uus inimene ei tea, mida temalt oodatakse, ja kardab eksida'],
        ['Miks ei jõua aegumise teade mõne inimeseni? Järelda, mida ta oleks pidanud tegema.', 'tema e-posti aadress on vana; ta oleks pidanud kontaktandmed üle vaatama'],
        ['Mida tahab autor öelda lausega „Sageli ei puudu inimesel mitte oskus, vaid julgus”? Milline on tema hoiak?', 'inimesed saavad e-riigiga hakkama, kui keegi neid julgustab ja kõrval aitab'],
      ]), { task: 'R15', voice: 'article' }), 'Lugemine, umbes 25 minutit koos sõnade ja skeemiga. Strateegia (v6 §2 l, lugemine: silmitse → otsi → arva kontekstist): enne lugemist vaatab õppija 1 minuti pealkirja ja lõikude esimesi lauseid ning ütleb, millest tekst räägib. Küsimused 5–7 on järeldusküsimused: nõua lauset, millele vastus toetub. Kordamise sõnad (tingimused, tõend, leping) on tekstis: lase need leida. Tekst on õppetekst ilma täpse statistikata.'), [
        '2. lõik: „Esimese koodiga logitakse … sisse, teisega antakse digiallkiri.”',
        '2. lõik: „Kui koodi sisestatakse mitu korda valesti, blokeeritakse see ajutiselt.”',
        '4. lõik: „Abistaja ei tee asja inimese eest, vaid istub kõrval ja seletab …”',
        '4. lõik: „Ilma volituseta ei tohi isegi lähedane sinu nimel dokumente allkirjastada.”',
        'Järeldus 3. lõigust: ta „tunneb end … nagu eksamil”, tekstid on ametlikus keeles ja „üks vale klõps” võib asja rikkuda.',
        'Järeldus 6. lõigust: teade läheb aadressile, „mis on riigiportaali kirja pandud”; abistajad soovitavad „kontaktandmed üle vaadata”.',
        'Järeldus 7. lõigust: „Kõige paremini õpib see, kes vajutab ise ja kelle kõrval istub keegi kannatlikult.”',
      ]),
      teach(B.diagram('056_d_scheme', 'flow', { title: 'Skeem: kuidas e-teenus käib?', instruction: 'Kirjuta iga kasti juurde üks näide tekstist. Viimase kasti juurde kirjuta, kust saab abi.', nodes: 'Sisse logimine: esimene kood\nVorm: andmed kontrollitakse üle\nKinnitamine: teine kood, digiallkiri\nTeade: kinnitus saadetakse e-postile\nKui ei tööta: …' }, 'full', 'g_read'),
        'Skeem on õppija seletuse järjekord jaamas 4 (kõigepealt, siis, lõpuks). Õppija täidab selle pärast lugemist; viimase kasti vastus (raamatukogu, omavalitsus, lähedane volitusega) on hiljem tema juhendi lõpp.'),
    ],
    practice: [
      station(teach(B.notice('056_p_notice', 'Märka: retsept kirjutatakse välja — paberit ei anta', [
        'Artiklist: retsept **kirjutatakse** välja · paberit **ei anta** · koode **ei öelda** kellelegi · inimest **aidatakse** arvuti taga',
        'Kordamine (B1): umbisikuline tegumood = tegija ei ole tähtis: Eestis **tehakse** palju internetis.',
        'B2: da-tegevusnimi + -takse / -dakse: allkirjastada → **allkirjastatakse**, saata → **saadetakse**, kontrollida → **kontrollitakse**, maksta → **makstakse** · lühike da-vorm: tuua → **tuuakse**, anda → **antakse**, öelda → **öeldakse**',
        'B2, eitus: ei + vorm ilma lõputa -kse: **ei anta**, **ei küsita**, **ei kirjutata**, **ei tehta**',
        'Sihitis jääb nagu tavalauses: arst kirjutab retsepti välja → retsept kirjutatakse välja · eituses osastav: retsepti ei kirjutata.',
        'Vene keeles öeldakse sageli „выписывают” (3. isik mitmus) — eesti keeles on umbisikuline vorm: kirjutatakse.',
      ], 'full'), 'Kordamine ühe minutiga (tehakse). Siis B2 samm: vormi moodustamine da-tegevusnimest ja eitus ilma lõputa -kse. Lase õppijal leida artiklist kolm lauset ja öelda, kes tegelikult tegija on. L1 rida: vene keele „они выписывают” ei ole eesti keeles „nad kirjutavad”, vaid „kirjutatakse”.'), 3, 22),
      why(teach(tag(B.gaps('056_p_forms', 'Meelespea naabrile.', 'Kas lause on jaatav või eitav? Kirjuta sulgudes olev tegusõna umbisikulises vormis. Panka ei ole.', [
        'Retsept [kirjutatakse] arsti juures välja digitaalselt ja paberit ei ole vaja. (välja kirjutama)',
        'Üürileping [allkirjastatakse] teise koodiga, mitte esimesega. (allkirjastama)',
        'Apteegis paberretsepti enam [ei anta], sest kõik on arvutis olemas. (andma)',
        'Teade dokumendi aegumisest [saadetakse] e-posti aadressile. (saatma)',
        'Pangast ei [küsita] kunagi telefonis sinu koode. (küsima)',
        'Raamatukogus [aidatakse] inimest arvuti taga, kui ta aja broneerib. (aitama)',
        'Kas sinu linnas [tehakse] seda ka kohapeal, kui inimesel arvutit ei ole? (tegema)',
        'Kõik andmed [kontrollitakse] enne kinnitamist veel kord üle. (kontrollima)',
        'Koode [ei öelda] kellelegi, ka mitte sugulasele ega pangatöötajale. (ütlema)',
        'Kas teenuse eest [makstakse] kaardiga või pangalingiga? (maksma)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kes seda teeb? Kas tegija on tähtis?” Read 3 ja 9: eitus ilma lõputa -kse (ei anta, ei öelda). Rida 7: teha → tehakse. Lisa küsimus: „Mida sina oskad juba ise teha?”'), [
        'kirjutada → kirjutatakse.',
        'allkirjastada → allkirjastatakse.',
        'Eitus ilma lõputa -kse: anda → ei anta.',
        'saata → saadetakse.',
        'Eitus: küsida → ei küsita (ei on lauses juba olemas).',
        'aidata → aidatakse.',
        'teha → tehakse (lühike da-vorm).',
        'kontrollida → kontrollitakse.',
        'Eitus: öelda → ei öelda.',
        'maksta → makstakse.',
      ]),
      why(teach(tag(B.transformation('056_p_active', 'Tegija jääb ära.', 'Tee lausest umbisikuline lause: tegijat ei nimetata. Sihitis jääb õigesse vormi.', [
        ['Perearst kirjutab retsepti välja digitaalselt juba samal päeval.', 'Retsept …', 'Retsept kirjutatakse välja digitaalselt juba samal päeval.'],
        ['Apteeker ei anna sulle apteegis enam paberretsepti kätte.', 'Paberretsepti …', 'Paberretsepti ei anta sulle apteegis enam kätte.|Paberretsepti ei anta apteegis enam kätte.'],
        ['Riik saadab teate dokumendi aegumisest sinu e-posti aadressile.', 'Teade …', 'Teade dokumendi aegumisest saadetakse sinu e-posti aadressile.'],
        ['Abistaja näitab raamatukogus nuppe, mida järgmisena vajutada.', 'Raamatukogus …', 'Raamatukogus näidatakse nuppe, mida järgmisena vajutada.'],
        ['Pank ei küsi kunagi telefoni teel sinu koode.', 'Sinu koode …', 'Sinu koode ei küsita kunagi telefoni teel.'],
        ['Lähedane allkirjastab dokumendi sinu nimel ainult volituse alusel.', 'Dokument …', 'Dokument allkirjastatakse sinu nimel ainult volituse alusel.'],
        ['Inimesed toovad vana dokumendi uue kättesaamisel kaasa.', 'Vana dokument …', 'Vana dokument tuuakse uue kättesaamisel kaasa.'],
        ['Raamatukogu abistaja ei tee seda kunagi sinu eest.', 'Raamatukogus …', 'Raamatukogus ei tehta seda kunagi sinu eest.'],
      ], 'full', 'g_notice'), { task: 'G05' }),
      'Juhendis on tähtis asi, mitte tegija. Kontrolli sihitist: terve asi → nimetav (retsept, teade, dokument), eitus ja hulk → osastav (paberit, koode, nuppe).'), [
        'Terve asi → nimetav: retsept kirjutatakse välja.',
        'Eitus → osastav: paberretsepti ei anta.',
        'Terve teade → nimetav: teade saadetakse.',
        'Lahtine hulk → osastav mitmus: nuppe näidatakse.',
        'Eitus → osastav: koode ei küsita.',
        'Üks terve dokument → nimetav: dokument allkirjastatakse.',
        'tuua → tuuakse.',
        'Eitus: teha → ei tehta.',
      ]),
      draft('056_p_draft', 'juhendi esimene lõik', 'Kirjuta naabrile vähemalt 6 lauset: mida ta peab kõigepealt tegema ja kuidas seda tehakse? Kasuta kolme umbisikulist vormi.', 'Ülesande täitmine (sammud õiges järjekorras, lihtne keel)', [6, 10]),
    ],
    transfer: [
      station(teach(mainTask(B.rolecards('056_t_call', 'Naabri teade: seleta lihtsas keeles (8–10 minutit).', 'Naaber ei saa e-riigi teatest aru. Seleta lihtsas keeles, mida see tähendab ja mida ta teeb. Kontrolli, kas ta sai aru.',
        'Sinu kaart. Naaber (eakas, hiljuti kolinud) näitab sulle telefonis teadet:\n„Teie isikutunnistuse (ID-kaardi) kehtivus lõpeb 30 päeva pärast. Uue dokumendi taotlus esitatakse riigiportaalis. Taotlemiseks on vaja kehtivat dokumenti ja uut fotot. Pärast kehtivuse lõppu ei ole digiallkirja andmine ega e-teenustesse sisselogimine võimalik.”\nSeleta naabrile kolm asja: mis juhtub, mida ta kõigepealt teeb, mida ta ei pea kartma.\nAbikaart: See teade tähendab, et … · Kõigepealt logitakse sisse …, siis … · Sa ei pea kartma, sest …\nLisaväljakutse: seleta ka, kuidas naaber saab vajadusel anda tütrele volituse.',
        'Naabri kaart on õpetajal.', [], []), 'mediation',
      ['See teade tähendab, et …', 'Kõigepealt logitakse sisse …, siis …', 'Sa ei pea kartma, sest …'],
      'Seleta ka, kuidas naaber saab vajadusel anda tütrele volituse.', { task: 'S13' }),
      'Vahendus (v6 §2 l): õppija ei loe teadet ette, vaid ütleb selle oma sõnadega lihtsas keeles. Sina oled naaber. Ütle ainult seda, mida küsitakse. Varjatud info (ütle ükshaaval): 1) „Ma kirjutasin koodid kaardi taha, et ei unustaks.” 2) „Mul ei ole arvutit, ainult telefon.” 3) „Mu tütar elab Soomes — kas tema võib minu eest taotluse teha?” Õppija peab reageerima: koodid → kaardi pealt ära, uued koodid; telefon → raamatukogu või omavalitsuse digiabi (aeg broneeritakse); tütar → volitus (ilma volituseta ei tohi). Õnnestunud, kui õppija ütleb lihtsas keeles kolm asja, kasutab vähemalt kolm umbisikulist vormi (sh eitus), küsib „Ütle oma sõnadega, mida sa teed?” ega tee asja naabri eest. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 18, { final: 'explain' }),
      exitTalk('056_t_say', 'Ütle naabrile 30 sekundiga, mida teade tähendab ja mida ta teeb esimesena. Kasuta üht eitust.', ['Mida teade tähendab?', 'Mida naaber kõigepealt teeb?'], 'Kas õppija ütleb lihtsas keeles kaks asja ja kasutab umbisikulist vormi koos eitusega (paberit ei anta, koode ei öelda)?'),
      selfCheck('056_t_self', ['Leidsin artiklist vajaliku info ja järeldasin autori hoiaku.', 'Kasutasin umbisikulist olevikku ja eitust (kirjutatakse, ei anta).', 'Seletasin naabrile lihtsas keeles kolm sammu ja kontrollisin, kas ta sai aru.'], 'Teade seletatud', 'Ma oskan teisele e-riigi teadet seletada'),
      tag(homeTask(homeLines(B.examWriting('056_t_guide', 'Kodus: juhend naabrile (umbes 140 sõna).', `Lõpeta tunni mustand juhendiks (130–150 sõna). Algust ei anta. Salvesta ka 1-minutiline häälsõnum. ${HARJUTA}`, 'kiri', {
        situation: 'Naaber palus, et kirjutaksid talle sammud paberile, mida ta saab külmkapi uksel hoida. Päris allikas: riigiportaal eesti.ee (https://www.eesti.ee) — leia sealt isikut tõendava dokumendi taotlemise juhend ja kirjuta üles kolm asja: kus taotlus esitatakse, mida on vaja üles laadida ja kuidas dokument kätte saadakse. Lisa need juhendisse. Kontrolli 055 kiri: kirjuta kolm õpetaja märgitud lauset parandatult Harjutas „Minu vead” alla.',
        points: ['mida teade tähendab (lihtsas keeles)', 'sammud õiges järjekorras: kõigepealt, siis, lõpuks (umbisikuline vorm)', 'mida ei tehta ja mille eest hoiduda (koodid, võõrad helistajad)', 'kust saab abi, kui midagi ei tööta (info eesti.ee lehelt)'],
        words: [130, 150],
      }), 6)), { task: 'W12' }),
      writingRubric('056_t_rubric', 'Hindamisjuhend: juhend naabrile (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 140 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Sinu kaart lõpeb. Sa pead minna internetis. Seal kirjutakse taotlus. Sa paned foto. Koodid ära ütle. Kui ei saa, küsi. Head aega!” Hinnang: ülesanne 2 (sammud on olemas, kuid eesti.ee info ja abi koht puuduvad), ülesehitus 2 (järjekord on selge, sidendeid kõigepealt / siis / lõpuks ei ole), sõnavara 2 (puuduvad kehtivus, taotlus esitatakse, volitus), grammatika 1 („pead minna” → pead minema, „kirjutakse” → kirjutatakse, „Koodid ära ütle” → Koode ära ütle). Kui õppija lisab eesti.ee kolm asja, sidendid ja parandab vormid, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-057': {
    title: 'Mida tohib tehisintellektilt küsida — ja mida mitte?',
    phases: grammar('Kordamine: lugemine, kirjutamine · B2: isikuandmete sisestamine, faktide kontrollimine, teksti kasutaja, kirja saatja'),
    format: 'debate',
    topic: 'work',
    canDo: 'Ma saan aru umbes 3,5-minutilisest raadiosaatest tehisintellektist igapäevaelus, küsitlen kaaslasi nende harjumuste kohta ja esitan tulemused ning kirjutan kursuse uudiskirja umbes 180-sõnalise arutluse; kasutan -mine- ja -ja-nimisõnu.',
    teacherPage: {
      goal: 'Радио «Digitund»: чат-бот как «быстрый практикант»; номинализация -mine / -ja (isikuandmete sisestamine, kasutaja); опрос группы и доклад за 1 минуту; черновик рассуждения в классе, дома 180 слов.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: исправленная версия (5 мин); радио — один раз и вопросы 1–7; станция 3 — правило и 10 предложений, черновик 3 предложения; опрос — два человека и три вопроса.',
      hook: 'Станция 1 — «Parandatud versioon»: ученик переписывает три предложения, которые вы отметили в черновике или инструкции урока 056, и одной строкой говорит, что изменил. Вопрос, если есть время: «Ты спрашивал(а) что-нибудь у чат-бота на этой неделе?»',
      plan: [
        '0–5: станция 1 — исправленная версия трёх отмеченных предложений (56)',
        '5–27: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: прочитать вопросы и предсказать ответы (2 мин), радио дважды (9 мин), 10 вопросов, из них 3 на вывод (5 мин), схема «что можно дать роботу — что нет» (4 мин)',
        '27–50: станция 3 — -mine одной строкой (B1), B2: -mine с родительным определением и -ja; 10 предложений, официально ↔ обычно (8 строк); черновик рассуждения (10 мин), обратная связь — структура',
        '50–70: станция 4 — опрос: 4 вопроса трём людям, заметки, доклад группе за 1 минуту; скрытая информация от вас как одного из опрошенных',
        '70–75: выход: 30 секунд — главный результат и одно правило; самооценка; домашнее задание: рассуждение 180 слов, голосовое 1 мин, Harjuta',
        'Kui aega jääb (75–90): ученик даёт боту (на телефоне учителя или своём) один безопасный запрос из схемы и проверяет ответ по второму источнику',
      ],
      sources: 'Радио «Digitund» — учебный текст KeeleSepp (ведущая Piret и тренер Andres вымышлены). Общая основа: GDPR (персональные данные), AI Act ЕС (человек должен знать, что общается с машиной), бесплатные чат-боты могут использовать введённый текст для обучения, «галлюцинации» — уверенно выдуманные ссылки и законы; школьные правила ИИ в Эстонии (TI-Hüpe) — без цифр.',
      groups: 'Радио — каждый сам, вопросы на вывод сравнивают в паре. Опрос: каждый спрашивает трёх человек (двое из группы + вы); в 1:1 вы отвечаете за трёх людей по карточкам «студент, бухгалтер, пенсионер». Доклад — каждый сам.',
      errors: [
        '«Isikuandmed sisestamine on keelatud» → «Isikuandmete sisestamine» (объект перед -mine — в родительном падеже).',
        '«Kontrollimine faktide» → «faktide kontrollimine» (определение стоит перед словом).',
        '«Teksti vastutab saatja» → «Teksti eest vastutab saatja» (vastutama + eest).',
        '«Kasutajad peab kontrollima» → «Kasutaja peab …» / «Kasutajad peavad …» (согласование числа).',
      ],
      notes: [
        'Опрос (v6 §2 d): ученик сам задаёт вопросы, записывает ответы и обобщает («kolmest inimesest kaks …»). Работа — одна из возможных тем: безработному — правила курса, пенсионеру — «я не пользуюсь, но внук пользуется».',
        'Слова на повтор (eksitav из урока 52, kahetsema и kompromiss из модулей 10–11) есть в радио: спросите, где они прозвучали.',
        'Обратная связь, 2–3 цели: -mine с родительным определением; -ja как деятель; обобщение результатов опроса без «все говорят».',
      ],
    },
    discover: [
      station(revision('057_d_revise', 'b1b2-056', 'Kirjuta ümber kolm lauset, mille õpetaja sinu juhendis naabrile märkis. Lisa üks rida: mida sa muutsid ja miks?'), 1, 5),
      station(withReview(tag(B.vocab('057_d_vocab', 'Tunni sõnad.', ['tehisintellekt — искусственный интеллект', 'vestlusrobot — чат-бот', 'isikuandmed — персональные данные', 'sisestama — вводить', 'kasutaja — пользователь', 'kontrollima — проверять', 'vastutama (millegi eest) — отвечать (за что-то)', 'otsustama — решать', 'usaldusväärne — надёжный', 'allikas — источник']), { topic: ['tehisintellekt', 'vestlusrobot', 'isikuandmed'] }), ['eksitav', 'kahetsema', 'kompromiss']), 2, 22),
      teach(B.diagram('057_d_scheme', 'compare', { title: 'Skeem: mida robotile anda — mida mitte?', instruction: 'Kuulates täida mõlemad pooled. Lisa kummalegi poole üks oma näide.', left: 'Võib anda', right: 'Ei anna', leftItems: 'oma kirja mustand ilma nimedeta\nsõna, millest ei saa aru\n…\n…', rightItems: 'isikukood\n…\n…\n…' }, 'half', 'g_notice'),
        'Skeem täidetakse kuulates (teisel korral). Vasakule: tekstide parandamine, ideede kogumine, sõnade seletamine, nädala toiduplaan. Paremale: isikukood, terviseandmed, kliendi nimi ja aadress, pangaandmed, arsti tõend. Skeemist saab hiljem küsitluse 2. küsimus.'),
      why(teach(tag(B.examListen('057_d_radio', 'Kuulamine: raadiosaade „Digitund”.', 'Enne kuulamist loe küsimused ja ennusta vastused. Kuula kaks korda ja vali õige vastus.', 'choice', [
        'Piret: Tere! Saates „Digitund” räägime täna tehisintellektist. Paljud kasutavad vestlusrobotit juba iga päev: kirjade parandamiseks, tõlkimiseks, retseptide otsimiseks. Stuudios on täiskasvanute koolitaja Andres. Andres, kas see on hea või halb uudis?',
        'Andres: Tere! Mõlemat. Vestlusrobot on nagu väga kiire praktikant: ta teeb palju tööd ära, aga tema tööd tuleb alati kontrollida. Halb uudis algab siis, kui inimene unustab, et vastutus jääb ikka temale.',
        'Piret: Milleks sa ise seda kasutad?',
        'Andres: Kõige rohkem tekstide parandamiseks ja ideede kogumiseks. Kui kirjutan pika kirja, palun robotil leida kordused ja liiga pikad laused. Aga seda, mida ma lõpuks saadan, otsustan ise.',
        'Piret: Kuulajad küsivad kõige sagedamini isikuandmete kohta. Mida ei tohiks sisestada?',
        'Andres: Lihtne reegel: ära sisesta midagi, mida sa ei kirjutaks postkaardile. Isikukood, terviseandmed, kliendi nimi ja aadress, pangaandmed — need ei kuulu vestlusrobotisse. Paljud tasuta teenused kasutavad sisestatud teksti oma süsteemi arendamiseks. Kui saadad arsti tõendi, et robot selle lihtsamalt ümber sõnastaks, võib see tekst jääda kuhugi, mille üle sul pole kontrolli.',
        'Piret: Aga kui nimed enne ära kustutada?',
        'Andres: See on hea harjumus. Asenda nimi sõnaga „klient” või „kolleeg” ja kustuta numbrid. Siis saab robot ikka aidata, aga keegi ei tunne inimest ära.',
        'Piret: Teine mure on vead. Kas vestlusrobot eksib tihti?',
        'Andres: Ta ei eksi nagu inimene, kes väsib. Ta eksib enesekindlalt. Ta võib välja mõelda seaduse paragrahvi või raamatu, mida pole olemas, ja kirjutada selle väga veenvalt. Seepärast on faktide kontrollimine kasutaja töö. Kui vastus on tähtis — tervis, raha, leping —, otsi kinnitust usaldusväärsest allikast.',
        'Piret: Kas koolid peaksid robotit keelama?',
        'Andres: Minu meelest mitte. Keelamine ei aita, sest kodus kasutatakse seda niikuinii. Parem on kokku leppida, millal see on lubatud. Näiteks võib robotiga harjutada sõnu või paluda selgitust, aga kontrolltöö kirjutab õppija ise. Mõnel kursusel tuleb kodutöö lõppu kirjutada ka üks lause selle kohta, kuidas robotit kasutati.',
        'Piret: Kas eksitav vastus võib ka kahju teha?',
        'Andres: Võib küll. Tean inimest, kes kirjutas üürileandjale roboti abil väga range kirja. Kiri oli eksitav, sest robot oli võtnud aluseks teise riigi seaduse. Hiljem ta kahetses, sest suhe üürileandjaga läks halvaks. Hea kompromiss on lasta robotil teha mustand ja siis see oma sõnadega üle vaadata.',
        'Piret: Mida soovitad inimesele, kes pole seda kunagi proovinud?',
        'Andres: Alusta väikesest. Palu robotil seletada mõnda sõna või teha nädala toiduplaan. Küsi alati: kust see info pärineb? Ja ära unusta, et robot ei tunne sind ega sinu olukorda. Ta pakub keskmist vastust, aga sinu elu ei ole keskmine.',
        'Piret: Aitäh, Andres!',
      ], [
        ['Millega võrdleb täiskasvanute koolitaja Andres saate alguses vestlusrobotit ja miks?', 'kiire praktikandiga, kelle tööd tuleb alati kontrollida', 'kogenud juristiga, kes teab kõiki seadusi', 'tasuta tõlkijaga, kes ei tee kunagi vigu', 'väsinud kolleegiga, kes eksib õhtuti'],
        ['Milleks kasutab Andres vestlusrobotit oma igapäevases töös kõige rohkem?', 'tekstide parandamiseks ja ideede kogumiseks', 'kirjade saatmiseks otse klientidele', 'kursuse kontrolltööde kirjutamiseks', 'arvete ja maksete tegemiseks'],
        ['Millise lihtsa reegli annab Andres kuulajatele isikuandmete sisestamise kohta?', 'ära sisesta midagi, mida sa postkaardile ei kirjutaks', 'sisesta ainult oma nimi ja aadress', 'kasuta isikuandmetega ainult tasulist teenust', 'küsi enne igalt kliendilt kirjalik luba'],
        ['Mida soovitab Andres teha inimeste nimedega enne seda, kui sisestad teksti?', 'asendada need sõnaga „klient” või „kolleeg”', 'kirjutada need suurte tähtedega', 'jätta need teksti lõppu eraldi reale', 'tõlkida need enne inglise keelde'],
        ['Kuidas vestlusrobot Andrese sõnul tavaliselt eksib, kui ta vastab valesti?', 'enesekindlalt ja nii veenvalt, et viga on raske märgata', 'ainult siis, kui ta on pikalt töötanud', 'harva ja alati väga märgatavalt', 'ainult numbrites ja kuupäevades'],
        ['Kelle töö on Andrese sõnul faktide kontrollimine, kui vastus on tähtis?', 'teksti kasutaja töö', 'programmi looja töö', 'kursuse õpetaja töö', 'riigi ametniku töö'],
        ['Mida arvab Andres sellest, kui kool vestlusroboti kasutamise täielikult keelab?', 'see ei aita, parem on kokku leppida, millal see on lubatud', 'see on ainus mõistlik lahendus koolis', 'see sobib ainult ülikoolis, mitte koolis', 'see tuleks kirjutada riigi seadusesse'],
        ['Miks läks Andrese tuttava suhe üürileandjaga pärast kirja halvaks? Järelda.', 'robot võttis aluseks teise riigi seaduse ja kiri oli eksitav', 'kiri jäi saatmata, sest robot ei töötanud', 'üürileandja ei osanud eesti keelt lugeda', 'üürnik ei olnud mitu kuud üüri maksnud'],
        ['Mida tahab Andres öelda saate lõpus lausega „sinu elu ei ole keskmine”? Järelda.', 'robot ei tunne sinu olukorda, vastust tuleb oma eluga kohandada', 'robot annab alati parima võimaliku vastuse', 'keskmine inimene ei kasuta vestlusrobotit', 'robotit tohib kasutada ainult keerulistel juhtudel'],
        ['Milline on Andrese hoiak vestlusroboti suhtes kogu saate jooksul?', 'robot on kasulik abiline, kui vastutajaks jääb inimene', 'robot on ohtlik ja tuleks igal pool keelata', 'robot teeb inimese töö alati paremini', 'robotit kasutavad ainult noored inimesed'],
      ], 'g_listen'), { voice: 'interview', task: 'L02', harno: 'L2' }),
      'Kuulamine, umbes 22 minutit koos sõnade ja skeemiga (umbes 3,5 minutit, kaks korda). Strateegia (v6 §2 l, kuulamine: ennusta → võtmesõnad → kontrolli): õppija loeb küsimused, ennustab pliiatsiga ja kontrollib kuulates. Küsimused 8–10 on järeldusküsimused: nõua põhjendust kuuldust. Kordamise sõnad (eksitav, kahetsema, kompromiss) on saates. Saade on õppetekst, inimesed on välja mõeldud.'), [
        'Andres: „Vestlusrobot on nagu väga kiire praktikant … tema tööd tuleb alati kontrollida.”',
        'Andres: „Kõige rohkem tekstide parandamiseks ja ideede kogumiseks.”',
        'Andres: „ära sisesta midagi, mida sa ei kirjutaks postkaardile”.',
        'Andres: „Asenda nimi sõnaga „klient” või „kolleeg” ja kustuta numbrid.”',
        'Andres: „Ta eksib enesekindlalt … ja kirjutab selle väga veenvalt.”',
        'Andres: „faktide kontrollimine on kasutaja töö”.',
        'Andres: „Keelamine ei aita … Parem on kokku leppida, millal see on lubatud.”',
        'Järeldus: robot „oli võtnud aluseks teise riigi seaduse” ja kiri oli „väga range” ning eksitav.',
        'Järeldus: robot „ei tunne sind ega sinu olukorda” ja pakub „keskmist vastust”.',
        'Järeldus kogu saatest: „vastutus jääb ikka temale”; robot aitab, kui inimene kontrollib.',
      ]),
    ],
    practice: [
      station(teach(B.notice('057_p_notice', 'Märka: isikuandmete sisestamine, teksti kasutaja', [
        'Saatest: faktide **kontrollimine** on kasutaja töö · tekstide parandamiseks · ära sisesta isikuandmeid',
        'Kordamine (B1): tegusõnast nimisõna -mine: lugema → lugemine, õppima → õppimine.',
        'B2, -mine = tegevus kui asi: sisestama → **sisestamine**, kasutama → **kasutamine**, keelama → **keelamine**, tõlkima → **tõlkimine** · sihitis läheb omastavasse ette: sisestan isikuandmeid → **isikuandmete** sisestamine, kontrollin fakte → **faktide** kontrollimine',
        'B2, -ja = kes teeb: kasutama → **kasutaja**, saatma → **saatja**, looma → **looja**, koolitama → **koolitaja**',
        'Ametlik stiil: Isikuandmete sisestamine on keelatud. = Isikuandmeid ei tohi sisestada. · Vastutab saatja. = Selle eest vastutab see, kes saadab.',
        'Vene keeles „ввод данных” — eesti keeles on laiend ees ja omastavas: andmete sisestamine (mitte „sisestamine andmed”).',
      ], 'full'), 'Kordamine ühe minutiga (lugemine). Siis B2 samm: -mine koos omastava laiendiga ja -ja tegijana. Lase õppijal leida saatest või skeemist kolm reeglit ja öelda need ametlikult. L1 rida: vene keeles on laiend järel (ввод данных), eesti keeles ees (andmete sisestamine).'), 3, 23),
      why(teach(tag(B.gaps('057_p_forms', 'Kursuse reeglid.', 'Kirjuta sulgudes oleva tegusõna -mine- või -ja-vorm. Laiend läheb ette omastavasse. Panka ei ole.', [
        'Reegel 1: [isikuandmete sisestamine] vestlusrobotisse on keelatud. (isikuandmed, sisestama)',
        'Reegel 2: iga vastuse puhul on [faktide kontrollimine] kasutaja kohustus. (faktid, kontrollima)',
        'Reegel 3: kirja sisu eest vastutab alati selle [saatja], mitte programm. (saatma)',
        'Reegel 4: kui robot eksib, peab seda märkama teksti [kasutaja]. (kasutama)',
        'Reegel 5: robotiga [tõlkimine] on lubatud ainult avalike tekstide puhul. (tõlkima)',
        'Andrese arvates ei ole roboti [keelamine] koolis hea lahendus. (keelama)',
        'Uue programmi [kasutamine] lepitakse enne kokku juhatajaga. (kasutama)',
        'Ka kursuse [koolitaja] kasutab robotit harjutuste koostamiseks. (koolitama)',
        'Kodutöö lõpus on kohustuslik ühe lause [kirjutamine] roboti kasutamise kohta. (kirjutama)',
        'Programmi [looja] ei vastuta selle eest, mida sina saadad. (looma)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kas see on tegevus või tegija?” Read 1 ja 2: laiend omastavas ette (isikuandmete, faktide). Read 3, 4, 8, 10: -ja. Lisa küsimus: „Milline neist reeglitest on sinu arvates liiga range?”'), [
        'Tegevus + sihitis → omastav laiend ette: isikuandmete sisestamine.',
        'kontrollin fakte → faktide kontrollimine.',
        'Kes saadab → saatja.',
        'Kes kasutab → kasutaja.',
        'Tegevus → tõlkimine.',
        'Tegevus → keelamine.',
        'Tegevus → kasutamine.',
        'Kes koolitab → koolitaja.',
        'Tegevus → kirjutamine.',
        'Kes loob → looja.',
      ]),
      why(teach(tag(B.transformation('057_p_nom', 'Reegel kahel viisil.', 'Tee lausest -mine- või -ja-vormiga lause või vastupidi. Alusta antud sõnadega.', [
        ['Kliendi isikuandmeid ei tohi kunagi vestlusrobotisse sisestada.', 'Isikuandmete …', 'Isikuandmete sisestamine vestlusrobotisse on alati keelatud.|Isikuandmete sisestamine vestlusrobotisse on keelatud.'],
        ['Fakte peab enne saatmist kontrollima see, kes teksti kasutab.', 'Faktide …', 'Faktide kontrollimine enne saatmist on kasutaja kohustus.|Faktide kontrollimine enne saatmist on kasutaja töö.'],
        ['Kirja sisu eest vastutab alati see, kes kirja saadab.', 'Kirja sisu eest …', 'Kirja sisu eest vastutab alati kirja saatja.|Kirja sisu eest vastutab alati saatja.'],
        ['Avalike tekstide tõlkimine robotiga on meie kursusel lubatud.', 'Avalikke tekste …', 'Avalikke tekste tohib meie kursusel robotiga tõlkida.|Avalikke tekste võib meie kursusel robotiga tõlkida.'],
        ['Töötajate ja klientide hindamine masina abil on keelatud.', 'Töötajaid ja kliente …', 'Töötajaid ja kliente ei tohi masina abil hinnata.'],
        ['Paroolide jagamine kolleegidega ei ole meil lubatud.', 'Paroole …', 'Paroole ei tohi kolleegidega jagada.|Paroole ei tohi jagada kolleegidega.'],
        ['See, kes teksti loeb, peab selle enne saatmist üle kontrollima.', 'Teksti …', 'Teksti lugeja peab selle enne saatmist üle kontrollima.'],
        ['Masina vastuseid tuleb tervise ja raha puhul alati kontrollida.', 'Masina vastuste …', 'Masina vastuste kontrollimine on tervise ja raha puhul kohustuslik.|Masina vastuste kontrollimine tervise ja raha puhul on kohustuslik.'],
      ], 'full', 'g_notice'), { task: 'G05' }),
      'Ametlik reegel on lühike, tavaline lause on selgem. Kontrolli omastavat laiendit (isikuandmete, faktide, paroolide) ja eitust tavalises lauses (ei tohi + da-tegevusnimi).'), [
        'isikuandmeid sisestada → isikuandmete sisestamine.',
        'kontrollida fakte → faktide kontrollimine; see, kes kasutab → kasutaja.',
        'see, kes saadab → saatja.',
        'tõlkimine on lubatud → tohib / võib tõlkida.',
        'hindamine on keelatud → ei tohi hinnata (eituses osastav: kliente).',
        'jagamine on keelatud → ei tohi jagada.',
        'see, kes loeb → lugeja.',
        'tuleb kontrollida → kontrollimine on kohustuslik.',
      ]),
      draft('057_p_draft', 'arutluse esimene lõik', 'Kirjuta 5–7 lauset: kas robot peaks sinu töökohas või kursusel olema lubatud? Kasuta kolme -mine- või -ja-sõna.', 'Ülesehitus ja sidusus (seisukoht, põhjus, näide)'),
    ],
    transfer: [
      station(teach(mainTask(B.ideaCard('057_t_survey', 'Küsitlus: kuidas me tehisintellekti kasutame? (12–15 minutit)', 'Küsi neli küsimust kolme inimese käest ja märgi vastused lühidalt. Siis esita tulemused 1 minutiga.', [
        'Kursus koostab ühised reeglid tehisintellekti kasutamiseks. Enne seda on vaja teada, kuidas inimesed seda päriselt kasutavad.',
        'Vastajad: kaks õppijat ja õpetaja; üks-ühele vastab õpetaja kolme kaardi järgi. Märgi vastused tabelisse oma vihikus.',
        'Abikaart: Kolmest vastajast kaks kasutavad robotit … · Keegi ei sisesta …, sest … · Minu soovitus kursusele: … on lubatud, … on keelatud.',
        'Lisaväljakutse: leia vastustest üks vastuolu ja paku selle kohta reegel.',
      ], [
        'Milleks sa vestlusrobotit kasutad (või miks mitte)?',
        'Mida sa sinna kunagi ei sisestaks?',
        'Kas sa kontrollid vastuseid? Kuidas?',
        'Milline reegel peaks meie kursusel kehtima?',
      ], 'Üheminutiline kokkuvõte: kolm tulemust ja üks reeglisoovitus (-mine- ja -ja-sõnadega).', [120, 180]), 'survey',
      ['Kolmest vastajast kaks kasutavad robotit …', 'Keegi ei sisesta …, sest …', 'Minu soovitus kursusele: … on lubatud, … on keelatud.'],
      'Leia vastustest üks vastuolu ja paku selle kohta reegel.', { task: 'S09' }),
      'Küsitlus (v6 §2 d): õppija küsib ise, kirjutab vastused üles ja üldistab („kolmest inimesest kaks …”). Sina oled üks vastajatest. Varjatud info (ütle 3. küsimuse juures): „Ausalt öeldes panin eelmisel nädalal oma kliendi lepingu robotisse, et see lühemaks teha. Nimed olid sees.” Õppija peab kokkuvõttes sellele reageerima (isikuandmete sisestamine on keelatud → nimed enne kustutada; vastutab saatja) ja tegema sellest reegli. Üks-ühele vastad kolme kaardi järgi: tudeng (kasutab iga päev, ei kontrolli), raamatupidaja (ei kasuta, kardab andmete pärast), pensionär (lapselaps kasutab tema eest). Õnnestunud, kui õppija esitab tulemused üldistades, kasutab vähemalt kolm -mine- või -ja-sõna ja pakub ühe reegli. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 20, { final: 'advise' }),
      exitTalk('057_t_say', 'Ütle 30 sekundiga küsitluse tähtsaim tulemus ja üks reegel. Kasuta üht -mine-sõna.', ['Mis oli küsitluse tähtsaim tulemus?', 'Millise reegli sa pakud?'], 'Kas õppija üldistab tulemuse (kolmest kaks …) ja sõnastab reegli -mine-sõnaga (isikuandmete sisestamine on keelatud)?'),
      selfCheck('057_t_self', ['Sain raadiosaatest aru ja järeldasin koolitaja hoiaku.', 'Kasutasin -mine- ja -ja-sõnu (isikuandmete sisestamine, kasutaja).', 'Küsitlesin kolme inimest ja esitasin tulemused üldistades.'], 'Küsitlus tehtud', 'Ma oskan küsitluse tulemusi esitada'),
      tag(homeTask(homeLines(B.examWriting('057_t_argue', 'Kodus: arutlus uudiskirja (umbes 180 sõna).', `Lõpeta tunni mustand arutluseks (170–190 sõna). Pealkirja ja algust ei anta. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'arutlus', {
        situation: 'Kursuse uudiskiri kogub arvamusi teemal „Kas tehisintellekt peaks kursusel ja tööl olema lubatud?”. Kasuta oma küsitluse tulemusi.',
        points: ['sinu seisukoht ja miks teema on oluline', 'kaks argumenti näitega (küsitluse tulemused, raadiosaade)', 'vastuargument ja sinu vastus sellele', 'kolm reeglit ametlikus stiilis (-mine, -ja)'],
        words: [170, 190],
      }), 6)), { task: 'W14' }),
      writingRubric('057_t_rubric', 'Hindamisjuhend: arutlus (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 180 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tehisintellekt on hea. Ma kasutan iga päev. Aga mõnikord on vale. Sisestamine andmed on keelatud. Minu kolleeg panis lepingu. See oli halb. Kokkuvõttes robot on hea ja halb.” Hinnang: ülesanne 2 (seisukoht ja näide on olemas, kuid reeglid ja vastuargumendile vastamine puuduvad), ülesehitus 2 (lõike ja sidendeid ei ole, järeldus kordab algust), sõnavara 2 („hea”, „halb” korduvad; puuduvad vastutus, kasutaja, usaldusväärne allikas), grammatika 1 („Sisestamine andmed” → andmete sisestamine; „Kokkuvõttes robot on” → Kokkuvõttes on robot). Kui õppija lisab kolm reeglit, vastuargumendi ja parandab vormid, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-058': {
    title: 'Kas see uudis on tõsi? Kontrolli, enne kui jagad',
    phases: grammar('Kordamine: tehti, öeldi · B2: postitust jagati, pilti on töödeldud, väidet ei ole kinnitatud, allikat ei leitud'),
    format: 'facts',
    topic: 'culture',
    canDo: 'Ma loen artiklit sellest, miks inimesed valeinfot jagavad, kontrollin postitust kolme küsimusega, esitlen 1–2 minutiga oma faktikontrolli ja kirjutan sõbrale umbes 140-sõnalise sõnumi; kasutan umbisikulist minevikku ja täisminevikku.',
    teacherPage: {
      goal: 'Статья «почему мы делимся ложью»; безличное прошедшее и перфект (jagati, on töödeldud, ei ole kinnitatud); презентация факт-чека 1–2 минуты; черновик сообщения в классе, дома 140 слов + медиадневник.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: исправленная версия (5 мин); статья — абзацы 1–5 и вопросы 1–5; станция 3 — правило и 10 пропусков, черновик 3 предложения; презентация — один пост, без вопросов аудитории.',
      hook: 'Станция 1 — «Parandatud versioon»: ученик переписывает три предложения, отмеченные в черновике или рассуждении урока 057. Вопрос, если есть время: «Ты когда-нибудь поделился новостью, которая оказалась неправдой?»',
      plan: [
        '0–5: станция 1 — исправленная версия трёх отмеченных предложений (57)',
        '5–30: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: пробежать первые фразы абзацев, потом искать ответы (scan); статья (6 мин), 7 вопросов, из них 3 на вывод (10 мин), схема «три вопроса» (5 мин)',
        '30–50: станция 3 — безличное прошедшее одной строкой (B1), B2: -ti / -di, on + -tud, отрицание; факт-чек с 10 пропусками, исправить 8 строк; черновик сообщения другу (10 мин), обратная связь — грамматика',
        '50–70: станция 4 — презентация: один из трёх постов, 1–2 минуты, два вопроса аудитории; скрытая информация в вопросе',
        '70–75: выход: 30 секунд другу; самооценка; домашнее задание: сообщение 140 слов + медиадневник, голосовое, Harjuta',
        'Kui aega jääb (75–90): игра «два заголовка» — ученик придумывает одну правдивую и одну ложную новость о своём городе, вы угадываете',
      ],
      sources: 'Статья «Miks me jagame valet, kuigi me ei taha?» — учебный текст KeeleSepp без цифр. Общая основа: исследования Pennycook & Rand (вопрос о точности перед шерингом снижает распространение фейков), эмоции и скорость распространения ложных новостей, советы факт-чекеров (кто, когда, где ещё; обратный поиск по картинке). Посты на карточке — учебные.',
      groups: 'Статья — каждый сам, вопросы на вывод сравнивают в паре. Станция 4: каждый выбирает пост, 3 минуты подготовки, потом презентации по очереди; слушатели задают два вопроса. В 1:1 вы — аудитория.',
      errors: [
        '«Pilt tehakse eile» → «Pilt tehti eile» (время известно → прошедшее).',
        '«Väidet ei olnud kinnitatakse» → «Väidet ei ole kinnitatud» (перфект: on / ei ole + -tud).',
        '«Pilti on töötletud» → «töödeldud» (töötlema → töödeldud).',
        '«Teist allikat ei leiti» → «ei leitud» (отрицание прошедшего = ei + -tud).',
      ],
      notes: [
        'Презентация (v6 §2 d): у ученика нет готового текста — только план из схемы (кто, когда, где ещё, решение). Не заставляйте зачитывать.',
        'Слова на повтор (tõend из урока 53, ahvatlema из 52, harjumus из модулей 9–11) есть в статье.',
        'Медиадневник (v6 §2 k) — в домашнем задании: один эстонский источник новостей, одно новое слово, одно предложение. В следующем уроке спросите одного ученика.',
      ],
    },
    discover: [
      station(revision('058_d_revise', 'b1b2-057', 'Kirjuta ümber kolm lauset, mille õpetaja sinu arutluses märkis. Lisa üks rida: mida sa muutsid ja miks?'), 1, 5),
      station(withReview(tag(B.vocab('058_d_vocab', 'Tunni sõnad.', ['valeinfo — ложная информация', 'väide — утверждение', 'kinnitama — подтверждать', 'uuring — исследование', 'jagama — делиться (в соцсетях)', 'töödeldud — обработанный (о фото)', 'pealkiri — заголовок', 'kahtlane — подозрительный', 'järeldus — вывод', 'faktikontroll — проверка фактов']), { topic: ['valeinfo', 'faktikontroll', 'töödeldud'] }), ['tõend', 'ahvatlema', 'harjumus']), 2, 25),
      why(teach(tag(B.reading('058_d_text', 'Loe artiklit.', 'Loe lõikude esimesed laused (1 minut). Siis otsi tekstist vastused. Küsimustele 5–7 järelda ja näita lauset tekstist.', 'Miks me jagame valet, kuigi me ei taha?', [
        'Igaüks on vähemalt korra jaganud midagi, mis hiljem osutus valeks. Võib-olla oli see pilt üleujutatud tänavast, mis tegelikult tehti teises riigis aastaid tagasi, või hoiatus, et homme suletakse kõik pangaautomaadid. Jagaja ei olnud halb inimene. Ta tahtis sõpru hoiatada. Teadlased, kes on uurinud, miks valeinfo levib, on jõudnud järeldusele, et enamik inimesi ei jaga valet meelega, vaid kiirustades.',
        'Esimene põhjus on emotsioon. Uudis, mis tekitab hirmu, viha või imestust, levib kiiremini kui rahulik ja täpne tekst. Sellised pealkirjad on tehtud nii, et need ahvatlevad klõpsama: „Seda ei näidatud teile uudistes!” või „Arstid vaikivad!”. Kui tunne on tugev, ei jõua mõistus järele. Me vajutame jagamisnuppu enne, kui oleme küsinud, kas see on üldse tõsi.',
        'Teine põhjus on harjumus. Sotsiaalmeedias liigume uudisvoos kiiresti ja otsustame sekundiga. Ühes uuringus paluti inimestel enne jagamist vastata ainult ühele küsimusele: kui täpne see pealkiri sinu arvates on? Juba see väike paus vähendas valeuudiste jagamist märgatavalt. Inimesed ei muutunud targemaks, nad lihtsalt mõtlesid hetke. See näitab, et probleem ei ole alati teadmatus, vaid kiirus: me teame küll, et internetis on valet, aga ei mõtle sellele õigel hetkel.',
        'Kolmas põhjus on usaldus. Me usume rohkem seda, mille saatis sõber või sugulane, kui seda, mis tuli võõralt. Kui tädi saadab pere vestlusrühma häälsõnumi, mille on salvestanud „üks tuttav arst”, tundub see usaldusväärne, kuigi keegi ei tea, kes see arst on. Valeinfo levib sageli just lähedaste inimeste kaudu, sest nende saadetut ei kontrollita.',
        'Mida siis teha? Faktikontrollijad soovitavad kolme lihtsat küsimust. Kes on autor ja kas tal on nimi? Millal tekst või pilt avaldati? Kas sama on kirjutanud ka mõni teine, usaldusväärne allikas? Kui pilt on töödeldud või vana, saab seda sageli kontrollida pildiotsinguga. Kui väidet ei ole kinnitanud ükski teine allikas, tasub oodata. Tõeline uudis ei kao tunniga kuhugi.',
        'Viimastel aastatel on lisandunud veel üks mure: pilte ja hääli saab teha tehisintellektiga. Video, kus tuntud inimene ütleb midagi šokeerivat, võib olla täiesti välja mõeldud. Selliseid videoid on raske ära tunda, kuid ka siin aitavad samad küsimused. Kui tuntud inimene oleks tõesti midagi sellist öelnud, kirjutaksid sellest kõik suured väljaanded. Kui seda ei ole teinud keegi peale ühe anonüümse konto, on põhjust kahelda.',
        'Valeinfot ei levita ainult inimesed. Mõnikord teevad seda võltskontod, mille taga ei ole ühtegi päris inimest. Need jagavad sama postitust sadu kordi, et see tunduks populaarne. Kui näed, et sama lause on kümnes kommentaaris sõna-sõnalt, on see märk, et keegi püüab arvamust kunstlikult suuremaks teha.',
        'Raskem on siis, kui sõber on valeinfot juba jaganud. Avalik kommentaar „see on vale!” paneb inimese kaitsesse ja ta ei taha enam kuulata. Parem on kirjutada talle eraldi, rahulikult ja tõendiga: „Ma kontrollisin seda, vaata siit.” Nii ei kaota keegi nägu ja vale ei levi edasi. Kui sõber vastab ärritunult, ära vaidle edasi. Piisab sellest, et tõend on tema käes; sageli kustutab ta postituse hiljem ise.',
        'Valeinfost ei saa lahti ühe korraga, aga igaüks saab olla väike filter. Kui iga inimene peatub enne jagamist mõneks sekundiks, liigub internetis vähem müra ja rohkem tõde. See ei nõua eriteadmisi, ainult harjumust küsida: kust see tuli?',
        'Allikas: KeeleSepp õppetekst.',
      ].join('\n\n'), [
        ['Miks jagab enamik inimesi teadlaste järgi valeinfot?', 'kiirustades, mitte meelega'],
        ['Millised uudised levivad kiiremini kui rahulikud tekstid?', 'need, mis tekitavad hirmu, viha või imestust'],
        ['Mida paluti uuringus inimestel enne jagamist teha?', 'vastata, kui täpne pealkiri nende arvates on'],
        ['Milliseid kolme küsimust soovitavad faktikontrollijad?', 'kes on autor, millal see avaldati, kas teine usaldusväärne allikas kinnitab seda'],
        ['Miks levib valeinfo autori arvates just lähedaste kaudu? Järelda.', 'lähedasi usaldatakse ja nende saadetut ei kontrollita'],
        ['Miks ei soovita autor kirjutada avalikku kommentaari „see on vale!”? Järelda.', 'inimene tunneb end rünnatuna, ei kuula ja kaotab nägu'],
        ['Mida tahab autor öelda lausega „Tõeline uudis ei kao tunniga kuhugi”?', 'jagamisega võib oodata, sest õige info on ka hiljem olemas'],
      ]), { task: 'R15', voice: 'popsci' }), 'Lugemine, umbes 25 minutit koos sõnade ja skeemiga. Strateegia (v6 §2 l, lugemine: silmitse → otsi): õppija loeb lõikude esimesed laused, ütleb, mis lõigus on põhjused ja mis lõigus nõuanded, ning otsib siis vastused. Küsimused 5–7 on järeldusküsimused: nõua lauset tekstist. Kordamise sõnad (tõend, ahvatlema, harjumus) on tekstis. Tekst on õppetekst ilma täpse statistikata.'), [
        '1. lõik: „enamik inimesi ei jaga valet meelega, vaid kiirustades”.',
        '2. lõik: „Uudis, mis tekitab hirmu, viha või imestust, levib kiiremini.”',
        '3. lõik: „paluti inimestel … vastata … kui täpne see pealkiri sinu arvates on?”',
        '5. lõik: „Kes on autor …? Millal … avaldati? Kas sama on kirjutanud ka mõni teine, usaldusväärne allikas?”',
        'Järeldus 4. lõigust: „Me usume rohkem seda, mille saatis sõber …” ja „nende saadetut ei kontrollita”.',
        'Järeldus 6. lõigust: kommentaar „paneb inimese kaitsesse”; eraldi kirjutades „ei kaota keegi nägu”.',
        'Järeldus 5. lõigust: „Kui väidet ei ole kinnitanud ükski teine allikas, tasub oodata.”',
      ]),
      teach(B.diagram('058_d_scheme', 'flow', { title: 'Skeem: kolm küsimust enne jagamist', instruction: 'Kirjuta iga kasti juurde üks näide tekstist. Viimases kastis vali: jagan, ootan või ei jaga.', nodes: 'Postitus: tugev tunne — hirm, viha, imestus\nKes? Autor ja tema nimi\nMillal? Kuupäev, vana pilt\nKust veel? Teine usaldusväärne allikas\nOtsus: …' }, 'half', 'g_read'),
        'Skeem on õppija esitluse plaan jaamas 4. Õppija täidab selle pärast lugemist; viimase kasti otsus vajab põhjendust („sest teist allikat ei leitud”).'),
    ],
    practice: [
      station(teach(B.notice('058_p_notice', 'Märka: pilt avaldati, väidet ei ole kinnitatud', [
        'Artiklist: inimestel **paluti** vastata · pilt **tehti** teises riigis · seda ei **näidatud** teile · pilt on **töödeldud** · väidet ei ole **kinnitatud**',
        'Kordamine (B1): umbisikuline olevik: kontrollitakse, jagatakse (tund 56).',
        'B2, lihtminevik -ti / -di: jagada → **jagati**, avaldada → **avaldati**, öelda → **öeldi**, leida → **leiti** · eitus: ei + -tud / -dud: **ei jagatud**, **ei leitud**',
        'B2, täisminevik: on + -tud / -dud: pilti **on töödeldud**, uudist **on jagatud** tuhat korda · eitus: **ei ole kinnitatud**, **ei ole avaldatud**',
        'Kumb? Lihtminevik — aeg on teada (eile, aastaid tagasi pilt tehti); täisminevik — tähtis on tulemus praegu (pilti on muudetud, seepärast ma seda ei usu).',
        'Vene keeles on mõlemad sageli „было сделано” — eesti keeles küsi: kas aeg on teada (tehti) või on tähtis tulemus praegu (on tehtud)?',
      ], 'full'), 'Kordamine ühe minutiga (kontrollitakse). Siis B2 samm: kaks minevikku ja nende eitus. Lase õppijal leida artiklist kolm vormi ja öelda, kas aeg on teada. L1 rida: vene keele üks vorm vastab kahele eesti vormile.'), 3, 20),
      why(teach(tag(B.formtext('058_p_check', 'Faktikontroll: „Üleujutus vanalinnas?”', 'Kirjuta sulgudes olev tegusõna umbisikulises minevikus. Kas aeg on teada või on tähtis tulemus? Panka ei ole.', 'Faktikontroll', [
        'Eile õhtul [jagati] (jagama) sotsiaalmeedias pilti, kus vanalinna tänav on vee all. Postituse all [kirjutati] (kirjutama), et vesi tõusis paari tunniga.',
        'Kontrollisime pilti. Selgus, et foto [tehti] (tegema) tegelikult teises riigis ja juba aastaid tagasi. Pilti [on töödeldud] (töötlema): taevas on tumedamaks muudetud.',
        'Ühtegi teist allikat, mis üleujutust kinnitaks, [ei leitud] (leidma). Linnavalitsus teatas, et ühtegi tänavat [ei suletud] (sulgema).',
        'Postitust [on jagatud] (jagama) juba üle tuhande korra, kuid väidet [ei ole kinnitatud] (kinnitama). Postituse autori nime [ei avaldatud] (avaldama).',
        'Kokkuvõte: pilt on vana. Seda [on kasutatud] (kasutama) varemgi, et inimesi hirmutada.',
      ], 'g_notice'), { task: 'G03', harno: 'R3' }),
      'Pärast iga lünka küsi: „Kas aeg on teada või on tähtis tulemus praegu?” Lüngad 1–3, 5, 6 ja 9: aeg on teada (eile, aastaid tagasi) → lihtminevik ja selle eitus. Lüngad 4, 7, 8 ja 10: tulemus praegu → täisminevik.'), [
        'Aeg on teada (eile õhtul) → jagati.',
        'Aeg on teada → kirjutati.',
        'Aeg on teada (aastaid tagasi) → tehti.',
        'Tulemus praegu (pilt on teistsugune) → on töödeldud.',
        'Eitus, aeg teada → ei leitud.',
        'Eitus, aeg teada → ei suletud.',
        'Tulemus praegu (jagamisi on tuhat) → on jagatud.',
        'Eitus, tulemus praegu → ei ole kinnitatud.',
        'Eitus, aeg teada → ei avaldatud.',
        'Tulemus praegu → on kasutatud.',
      ]),
      why(teach(tag(B.errorfix('058_p_fix', 'Paranda faktikontroll enne avaldamist.', 'Igas lauses on üks minevikuvormi viga. Kirjuta lause õigesti.', [
        ['Pilt tehakse eile õhtul Tartus, aga postitati alles täna hommikul.', 'Pilt tehti eile õhtul Tartus, aga postitati alles täna hommikul.'],
        ['Väidet ei ole kinnitatakse ühegi teise usaldusväärse allikaga.', 'Väidet ei ole kinnitatud ühegi teise usaldusväärse allikaga.'],
        ['Postitust on jagatakse juba tuhat korda, kuigi see on vale.', 'Postitust on jagatud juba tuhat korda, kuigi see on vale.'],
        ['Autori nime eile ei avaldati ja kontaktandmeid ei olnud.', 'Autori nime eile ei avaldatud ja kontaktandmeid ei olnud.'],
        ['Eile õhtul öeldati raadios, et tee on remondi tõttu suletud.', 'Eile õhtul öeldi raadios, et tee on remondi tõttu suletud.'],
        ['Pilti on töötletud: taevas on tumedam ja vett on rohkem.', 'Pilti on töödeldud: taevas on tumedam ja vett on rohkem.'],
        ['Ühtegi teist allikat ei leiti, kuigi otsisime terve õhtu.', 'Ühtegi teist allikat ei leitud, kuigi otsisime terve õhtu.'],
        ['Sama videot näidatud juba mitu aastat tagasi teises riigis.', 'Sama videot näidati juba mitu aastat tagasi teises riigis.'],
      ], 'full', 'g_notice'), { task: 'G06' }),
      'Need on tüüpilised vead vene keelt kõnelevalt õppijalt. Lase õppijal öelda reegel kahe sõnaga (aeg teada / tulemus praegu, eitus -tud).'), [
        'Aeg on teada (eile) → lihtminevik: tehti.',
        'Täisminevik: ei ole + -tud: kinnitatud.',
        'Täisminevik: on + -tud: jagatud.',
        'Eitus minevikus: ei + -tud: ei avaldatud.',
        'öelda → öeldi.',
        'töötlema → töödeldud.',
        'Eitus minevikus: ei leitud.',
        'Aeg on teada → näidati (lauses puudus tegusõna).',
      ]),
      draft('058_p_draft', 'sõnumi esimene lõik', 'Kirjuta sõbrale vähemalt 6 lauset: mida postituses väideti ja mida sa kontrollisid? Kasuta kolme minevikuvormi (jagati, on töödeldud …).', 'Grammatika ja õigekiri (umbisikuline minevik ja täisminevik)', [6, 12]),
    ],
    transfer: [
      station(teach(mainTask(B.ideaCard('058_t_present', 'Faktikontroll: esitlus (1–2 minutit).', 'Vali üks postitus. Kontrolli seda skeemi kolme küsimusega ja esitle tulemus 1–2 minutiga. Vasta siis kahele küsimusele.', [
        'Sinu kursuse vestlusgrupis jagati eile kolme postitust. Teised õppijad palusid, et vaataksid need üle.',
        'Esitluse plaan: mida väideti → mida kontrollisid (kes, millal, kust veel) → sinu otsus: jagan, ootan või ei jaga.',
        'Abikaart: Postituses väideti, et … · Kontrollisin … ja selgus, et … · Seepärast soovitan …',
        'Lisaväljakutse: ütle, miks see postitus inimesi ahvatleb, ja paku sellele ausam pealkiri.',
      ], [
        'A. Anonüümne leht: „Homme suletakse kõik pangaautomaadid! Võtke sularaha kohe välja!” Avaldatud täna, autorit pole, tuhandeid jagamisi.',
        'B. Linnavalitsuse leht: „Kesklinna parkla on remondi tõttu kolm päeva suletud.” Avaldatud eile, kontaktisiku nimi ja telefon.',
        'C. Video „Hunt jalutab kaubanduskeskuses!” Postitaja ütleb, et see juhtus täna. Video all on kommentaar: „Nägin seda juba eelmisel talvel.”',
      ], 'Esitlus 1–2 minutit ja otsus (jagan / ootan / ei jaga) koos tõendiga.', [60, 120]), 'presentation',
      ['Postituses väideti, et …', 'Kontrollisin … ja selgus, et …', 'Seepärast soovitan …'],
      'Ütle, miks see postitus inimesi ahvatleb, ja paku sellele ausam pealkiri.', { task: 'S16' }),
      'Esitlus (v6 §2 d): 3 minutit ettevalmistust skeemi järgi, siis 1–2 minutit ilma ettelugemiseta. Sina oled kuulaja. Varjatud info (ütle pärast esitlust, vali postituse järgi): A — „Aga mu ema sai sama teate ka SMS-iga, seal oli panga nimi!” (õppija: pangad sellist teadet ei saada, kontrolli panga enda lehelt või äpist, ära vajuta lingile); B — „Aga see on ju ametlik leht, miks sa kontrollid?” (õppija: ametlik leht on hea allikas, aga kuupäev ja koht tuleb ikka vaadata); C — „Aga video on ju päris, mitte töödeldud!” (õppija: päris video, kuid vana — aeg ja koht ei ole tõesed). Õnnestunud, kui õppija esitleb plaani järgi, kasutab vähemalt kolm minevikuvormi (jagati, on töödeldud, ei leitud), annab tõendiga otsuse ja reageerib uuele infole. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 20, { final: 'present' }),
      exitTalk('058_t_say', 'Ütle 30 sekundiga sõbrale, miks sa seda postitust ei jaga. Kasuta üht minevikuvormi: jagati, on töödeldud …', ['Mida postituses väideti?', 'Mida sa kontrollisid ja mis selgus?'], 'Kas õppija ütleb rahulikult (mitte „see on vale!”) ühe tõendi ja kasutab umbisikulist minevikku või täisminevikku?'),
      selfCheck('058_t_self', ['Sain artiklist aru ja järeldasin, miks valeinfo levib.', 'Kasutasin umbisikulist minevikku ja täisminevikku (jagati, ei ole kinnitatud).', 'Esitlesin faktikontrolli plaani järgi ja vastasin küsimustele.'], 'Postitus kontrollitud', 'Ma oskan postitust enne jagamist kontrollida'),
      tag(homeTask(homeLines(mediaLog(B.examWriting('058_t_msg', 'Kodus: sõnum sõbrale (umbes 140 sõna).', `Lõpeta tunni mustand sõnumiks (130–150 sõna) ja täida meediapäevik. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'kiri', {
        situation: 'Sõber jagas postitust A oma suhtlusrühmas. Kirjuta talle eraldi, rahulikult ja tõendiga; algust ei anta. Minu eesti keele võrgustik (meediapäevik): vali üks eestikeelne uudisteallikas, mida jälgid — näiteks ERR uudised, https://www.err.ee, raadio või taskuhääling. Kirjuta sõnumi alla kolm rida: mida kuulasid või lugesid, üks uus sõna ja üks lause selle kohta.',
        points: ['mida postituses väideti ja miks see sind kahtlema pani', 'mida sa kontrollisid ja mis selgus (jagati, ei leitud, ei ole kinnitatud)', 'mida sa soovitad teha (kustutada, parandada, oodata)', 'kuidas sa ise edaspidi enne jagamist kontrollid'],
        words: [130, 150],
      })), 6)), { task: 'W08' }),
      writingRubric('058_t_rubric', 'Hindamisjuhend: sõnum sõbrale (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 140 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Sinu postitus on vale. Pank ei sulgeb automaate. Ma kontrollin ja see ei olnud kinnitatakse. Kustuta! Sa alati usud kõike.” Hinnang: ülesanne 2 (väide ja soovitus on olemas, kuid kontrollimise viis ja oma reegel puuduvad), ülesehitus 2 (järjekord on selge, sidendeid ei ole), sõnavara 2 (puuduvad allikas, väide, kinnitama, avaldama), grammatika 1 („ei sulgeb” → ei sulge, „ei olnud kinnitatakse” → ei ole kinnitatud); toon („Sa alati usud kõike”) paneb sõbra kaitsesse. Kui õppija lisab tõendi, rahuliku tooni ja parandab vormid, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-059': {
    title: 'Mida sinu telefon sinust teab?',
    phases: grammar('Kordamine: andmeid kogutakse (tund 56), andmete kogumine (tund 57) · B2: tingimuste keel ↔ lihtne keel: asukoha jagamine = asukohta jagatakse'),
    format: 'project',
    topic: 'freetime',
    canDo: 'Ma saan aru umbes 3,5-minutilisest raadiosaatest oma andmete õigustest, muudan privaatsustingimuste keele lihtsaks ja vastupidi, koostan paaris juhendi „Minu digireeglid” ning kirjutan firmale umbes 140-sõnalise andmepäringu.',
    teacherPage: {
      goal: 'Радио о правах на данные; язык условий ↔ простой язык; проект в парах «Minu digireeglid», ответ другой пары; дома запрос данных фирме 140 слов.',
      core: [1, 2, 4], alt: 3,
      short: 'План Б: исправленная версия (5 мин); радио — один раз и утверждения 1–7; станция 3 — правило и 10 предложений; проект — три правила вместо пяти.',
      hook: 'Станция 1 — «Parandatud versioon»: ученик переписывает три предложения, отмеченные в черновике или сообщении урока 058. Вопрос, если есть время: «Сколько приложений на твоём телефоне знают, где ты сейчас?»',
      plan: [
        '0–5: станция 1 — исправленная версия трёх отмеченных предложений (58)',
        '5–25: станция 2 — 10 слов + 3 на повтор (2 мин), стратегия: подчеркнуть ключевые слова в утверждениях (2 мин), радио дважды (9 мин), 10 утверждений «верно / неверно» (4 мин), схема «язык условий — простой язык» (3 мин)',
        '25–45: станция 3 — повтор 56–57 одной строкой, B2: -mine ↔ -takse; 10 предложений, условия ↔ простой язык (8 строк)',
        '45–70: станция 4 — проект в парах: пять правил с причинами (15 мин), обмен с другой парой: две звезды и пожелание (5 мин), выход: одна строка переписана по пожеланию (5 мин)',
        '70–75: самооценка; домашнее задание: запрос данных фирме 140 слов, голосовое, Harjuta',
        'Kui aega jääb (75–90): ученик открывает настройки своего телефона и проверяет, у каких приложений есть доступ к местоположению (никто не обязан показывать телефон)',
      ],
      sources: 'Радио «Digitund» — учебный текст KeeleSepp (ведущая Piret и юрист Mart вымышлены). Общая основа: GDPR — право на доступ к данным (ответ обычно в течение месяца, бесплатно), исправление и удаление; Andmekaitse Inspektsioon (aki.ee) — куда обращаться; разрешения приложений в настройках телефона. Без статистики.',
      groups: 'Радио — каждый сам, утверждения на вывод сравнивают в паре. Проект — пары; две пары обмениваются листами и пишут «две звезды и пожелание». В 1:1 ученик пишет сам, вы — «другая пара».',
      errors: [
        '«Asukohta jagamine» → «asukoha jagamine» (перед -mine — родительный).',
        '«Andmed kogutakse» → «Andmeid kogutakse» (процесс, частичный объект при безличной форме).',
        '«Ma tahan teada minu andmed» → «Ma tahan teada, milliseid andmeid te minu kohta hoiate» (косвенный вопрос).',
        '«Kustutage minu andmeid» → «Kustutage minu andmed» (результат целый → полный объект).',
      ],
      notes: [
        'Проект (v6 §2 d): продукт модуля «Minu digireeglid» — пять правил с причинами для нового курсанта; он опирается на уроки 56–58 (e-riik, ИИ, проверка постов). Это и есть письмо в классе (v6 G16): дома пишется отдельный запрос данных.',
        'Обмен с другой парой (data.peerReply, v6 G25): «две звезды и пожелание» по трём критериям самооценки. Выход — одна строка проекта переписана по пожеланию (письмо, навык главной задачи).',
        'Слова на повтор (tellimus и tühistama из урока 51, volitus из 56) есть в радио.',
      ],
    },
    discover: [
      station(revision('059_d_revise', 'b1b2-058', 'Kirjuta ümber kolm lauset, mille õpetaja sinu sõnumis sõbrale märkis. Lisa üks rida: mida sa muutsid ja miks?'), 1, 5),
      station(withReview(tag(B.vocab('059_d_vocab', 'Tunni sõnad.', ['privaatsus — приватность', 'nõusolek — согласие', 'asukoht — местоположение', 'luba — разрешение', 'andmed — данные', 'kustutama — удалять', 'jälgima — отслеживать', 'rakendus — приложение', 'andmepäring — запрос (своих) данных', 'säilitamine — хранение']), { topic: ['andmepäring', 'privaatsus', 'säilitamine'] }), ['tellimus', 'tühistama', 'volitus']), 2, 20),
      teach(B.diagram('059_d_scheme', 'compare', { title: 'Skeem: tingimuste keel — lihtne keel', instruction: 'Pärast kuulamist kirjuta paremale lihtne lause umbisikulise vormiga.', left: 'Tingimustes on kirjas', right: 'Lihtsas keeles', leftItems: 'isikuandmete töötlemine\nandmete edastamine kolmandatele isikutele\nandmete säilitamine viis aastat\nturunduslike teadete saatmine\nasukohaandmete kogumine', rightItems: 'sinu andmeid kasutatakse\n…\n…\n…\n…' }, 'half', 'g_notice'),
        'Skeem on tunni grammatika sild: vasakul tingimuste -mine-keel, paremal umbisikuline lause. Õige: andmeid antakse teistele firmadele; andmeid hoitakse viis aastat; sulle saadetakse reklaami; sinu asukohta kogutakse.'),
      why(teach(tag(B.examListen('059_d_radio', 'Kuulamine: raadiosaade „Digitund”: sinu andmed.', 'Enne kuulamist joonista väidetes alla võtmesõnad. Kuula kaks korda: kas väide on õige või vale?', 'truefalse', [
        'Piret: Tere tulemast „Digitundi”! Täna küsime, mida meie telefon meist teab. Stuudios on andmekaitsejurist Mart. Mart, kas telefon tõesti teab minust rohkem kui mu sõbrad?',
        'Mart: Mõnes mõttes küll. Telefon teab, kus sa käid, millal sa magad, mida sa otsid ja kellega suhtled. Iga rakendus küsib paigaldamisel lubasid: asukoht, kaamera, mikrofon, kontaktid. Enamik inimesi vajutab „luba” lugemata, sest tahab rakendust kohe kasutada.',
        'Piret: Kas see on ohtlik?',
        'Mart: Mitte alati. Kaardirakendus vajab asukohta, see on loogiline. Aga kui taskulambi rakendus küsib ligipääsu kontaktidele, tasub küsida: milleks? Kui vastust ei ole, keeldu. Rakendus töötab enamasti ka ilma selle loata.',
        'Piret: Paljud kuulajad kirjutavad, et nad ei saa privaatsustingimustest aru.',
        'Mart: Need tekstid on pikad ja ametlikud: isikuandmete töötlemine toimub õigustatud huvi alusel. Lihtsas keeles tähendab see: me kasutame sinu andmeid, sest see on meile kasulik. Hea nõks on otsida tekstist kolm sõna: kolmandad isikud, säilitamine ja turundus. Siis näed, kellele andmeid antakse, kui kaua neid hoitakse ja kas sulle hakatakse reklaami saatma.',
        'Piret: Kas inimesel on ka õigusi?',
        'Mart: Muidugi. Euroopa Liidus kehtib isikuandmete kaitse üldmäärus. Sul on õigus küsida firmalt, milliseid andmeid ta sinu kohta hoiab. Seda nimetatakse andmepäringuks. Firma peab vastama üldjuhul ühe kuu jooksul ja tasuta. Sul on ka õigus nõuda andmete parandamist ja teatud juhtudel nende kustutamist.',
        'Piret: Kuidas andmepäringut teha?',
        'Mart: Kirjuta firma klienditeenindusele või andmekaitse kontaktile. Ütle, kes sa oled, milliseid andmeid küsid, ja palu ka teada, kellele neid on edasi antud. Hoia kirjast koopia. Kui vastust ei tule, võid pöörduda Andmekaitse Inspektsiooni poole.',
        'Piret: Mis on kõige lihtsam asi, mida kuulaja täna õhtul teha saab?',
        'Mart: Ava telefoni seaded ja vaata, millised rakendused tohivad sinu asukohta näha. Sageli on neid palju, aga vaja on paari. Teiseks vaata üle tellimused: paljud tasuta prooviajad on muutunud tasuliseks ja koos nendega jagad andmeid ka rakendustega, mida sa ammu ei kasuta. Tühista need, mida sa ei vaja, ja kustuta rakendus.',
        'Piret: Ja kui hoolitsed vanema sugulase telefoni eest?',
        'Mart: Siis tee seda koos temaga, mitte tema eest. Kui pead tema nimel firmaga suhtlema, küsi temalt volitus. Ka lähedane ei tohi lihtsalt teise inimese andmeid küsida.',
        'Piret: Kas me peaksime telefoni kartma?',
        'Mart: Ei. Telefon on tööriist. Aga tööriista omanik peaks teadma, mida see teeb. Andmed on nagu raha: kui sina ei tea, kuhu need lähevad, siis teab seda keegi teine.',
        'Piret: Aitäh, Mart!',
      ], [
        ['Marti sõnul vajutab enamik inimesi lubade küsimisel „luba” teksti lugemata.', true],
        ['Kaardirakendus ei peaks Marti arvates kunagi asukohta küsima.', false],
        ['Kui rakendus küsib luba põhjuseta, soovitab Mart sellest keelduda.', true],
        ['Sõna „turundus” näitab tingimustes, kui kaua andmeid hoitakse.', false],
        ['Firma peab andmepäringule vastama üldjuhul ühe kuu jooksul.', true],
        ['Andmepäringu eest tuleb tavaliselt maksta.', false],
        ['Kui firma ei vasta, võib pöörduda Andmekaitse Inspektsiooni poole.', true],
        ['Mart soovitab vanema sugulase telefoni seaded tema eest üksi ära muuta.', false],
        ['Saatest võib järeldada, et unustatud prooviaeg võib maksta nii raha kui ka andmeid.', true],
        ['Saatest võib järeldada, et Marti arvates tuleks nutitelefonist loobuda.', false],
      ], 'g_listen'), { voice: 'interview', task: 'L05', harno: 'L4' }),
      'Kuulamine, umbes 20 minutit koos sõnade ja skeemiga (umbes 3,5 minutit, kaks korda). Strateegia (v6 §2 l, kuulamine: võtmesõnad): õppija joonib väidetes alla võtmesõnad ja kuulab neid. Väited 9–10 on järeldusväited: nõua põhjendust kuuldust. Kordamise sõnad (tellimus, tühistama, volitus) on saates. Saade on õppetekst, inimesed on välja mõeldud.'), [
        'Õige: „Enamik inimesi vajutab „luba” lugemata.”',
        'Vale: „Kaardirakendus vajab asukohta, see on loogiline.”',
        'Õige: „Kui vastust ei ole, keeldu.”',
        'Vale: turundus näitab, „kas sulle hakatakse reklaami saatma”; kui kaua hoitakse — säilitamine.',
        'Õige: „Firma peab vastama üldjuhul ühe kuu jooksul ja tasuta.”',
        'Vale: „ühe kuu jooksul ja tasuta”.',
        'Õige: „võid pöörduda Andmekaitse Inspektsiooni poole”.',
        'Vale: „tee seda koos temaga, mitte tema eest”.',
        'Õige järeldus: prooviajad „on muutunud tasuliseks ja koos nendega jagad andmeid”.',
        'Vale järeldus: „Telefon on tööriist” — kartma ei pea, tuleb teada, mida see teeb.',
      ]),
    ],
    practice: [
      station(teach(B.notice('059_p_notice', 'Märka: asukoha jagamine = asukohta jagatakse', [
        'Saatest: isikuandmete **töötlemine** · andmete **säilitamine** · kui kaua neid **hoitakse** · sulle **saadetakse** reklaami',
        'Kordamine: umbisikuline olevik (tund 56: kontrollitakse) ja -mine (tund 57: sisestamine).',
        'B2, tingimuste keel → lihtne keel: asukoha **jagamine** → asukohta **jagatakse** · andmete **kogumine** → andmeid **kogutakse** · andmete **kustutamine** → andmed **kustutatakse**',
        'B2, lihtne keel → tingimuste keel: me anname andmeid teistele → andmete **edastamine** · kes rakendust kasutab → rakenduse **kasutaja**',
        'Sihitis: andmeid kogutakse (osa, protsess) ↔ andmete kogumine (laiend omastavas ees) · eitus: andmeid **ei jagata**',
        'Vene keeles „сбор данных” — eesti keeles andmete kogumine; lihtsas keeles eelistatakse tegusõna: andmeid kogutakse.',
      ], 'full'), 'Kordamine ühe minutiga (tunnid 56 ja 57). Siis B2 samm: sama mõte kahes stiilis. Lase õppijal võtta skeemi vasakult üks rida ja öelda see lihtsas keeles. L1 rida: vene keele „сбор данных” on eesti keeles „andmete kogumine”, aga lihtne tekst eelistab tegusõna.'), 3, 20),
      why(teach(tag(B.gaps('059_p_forms', 'Tingimused lihtsas keeles.', 'Kirjuta sulgudes oleva tegusõna põhjal -mine-vorm või umbisikuline olevik, nagu lause nõuab. Panka ei ole.', [
        'Tingimustes: asukoha [jagamine] on vabatahtlik. (jagama)',
        'Lihtsas keeles: sinu asukohta [jagatakse] ainult siis, kui sa lubad. (jagama)',
        'Tingimustes: andmete [kogumine] algab rakenduse paigaldamisel. (koguma)',
        'Lihtsas keeles: sinu andmeid [kogutakse] kohe, kui rakenduse paigaldad. (koguma)',
        'Tingimustes: konto sulgemisel toimub andmete [kustutamine] kuu aja jooksul. (kustutama)',
        'Lihtsas keeles: kui konto suletakse, [kustutatakse] andmed kuu aja jooksul. (kustutama)',
        'Tingimustes: andmete [säilitamine] kestab viis aastat. (säilitama)',
        'Lihtsas keeles: sinu andmeid [hoitakse] viis aastat. (hoidma)',
        'Lihtsas keeles: reklaami [saadetakse] ainult sinu nõusolekul. (saatma)',
        'Lihtsas keeles: ilma loata sinu andmeid teistele firmadele ei [anta]. (andma)',
      ], '', 'full', 'g_notice'), { task: 'G13' }),
      'Pärast iga rida küsi: „Kas see on tingimuste keel või lihtne keel?” Tingimustes -mine (jagamine, kogumine), lihtsas keeles umbisikuline olevik (jagatakse, kogutakse). Rida 10: eitus ilma lõputa -kse (ei anta). Lisa küsimus: „Mis rakendus sinu telefonis teab sinu asukohta?”'), [
        'Tingimuste keel → -mine: jagamine.',
        'Lihtne keel → umbisikuline: jagatakse.',
        'Tingimuste keel → kogumine.',
        'Lihtne keel → kogutakse.',
        'Tingimuste keel → kustutamine.',
        'Lihtne keel → kustutatakse.',
        'Tingimuste keel → säilitamine.',
        'Lihtne keel → hoitakse (hoida → hoitakse).',
        'Lihtne keel → saadetakse.',
        'Eitus ilma lõputa -kse: ei anta.',
      ]),
      why(teach(tag(B.transformation('059_p_plain', 'Tingimuste lause ja lihtne lause.', 'Tee tingimuste lausest lihtne lause või vastupidi. Alusta antud sõnadega.', [
        ['Isikuandmete töötlemine toimub teie nõusolekul.', 'Teie andmeid …', 'Teie andmeid töödeldakse teie nõusolekul.|Teie andmeid kasutatakse teie nõusolekul.'],
        ['Andmete edastamine teistele firmadele on lubatud.', 'Teie andmeid …', 'Teie andmeid võib anda teistele firmadele.|Teie andmeid tohib anda teistele firmadele.|Teie andmeid antakse teistele firmadele.'],
        ['Reklaamteadete saatmine toimub e-posti teel.', 'Reklaami …', 'Reklaami saadetakse e-postiga.|Reklaami saadetakse e-posti teel.'],
        ['Asukohta jälgitakse ainult rakenduse kasutamise ajal.', 'Asukoha …', 'Asukoha jälgimine toimub ainult rakenduse kasutamise ajal.'],
        ['Me kustutame andmed kuu aja jooksul.', 'Andmete …', 'Andmete kustutamine toimub kuu aja jooksul.'],
        ['See, kes rakendust kasutab, peab olema vähemalt 13-aastane.', 'Rakenduse …', 'Rakenduse kasutaja peab olema vähemalt 13-aastane.'],
        ['Nõusoleku andmine on vabatahtlik.', 'Nõusolekut …', 'Nõusolekut ei pea andma.'],
        ['Küpsiseid kasutatakse statistika kogumiseks.', 'Küpsiste …', 'Küpsiste kasutamise eesmärk on statistika kogumine.|Küpsiste kasutamine toimub statistika kogumiseks.'],
      ], 'full', 'g_notice'), { task: 'G05' }),
      'Lihtne lause = umbisikuline tegusõna (töödeldakse, saadetakse); tingimuste lause = -mine + toimub / on (jälgimine toimub, kasutaja peab). Kontrolli omastavat laiendit (asukoha, andmete, küpsiste).'), [
        'töötlemine toimub → töödeldakse (või lihtsamalt: kasutatakse).',
        'edastamine on lubatud → võib / tohib anda.',
        'saatmine toimub → saadetakse.',
        'jälgitakse → asukoha jälgimine toimub.',
        'me kustutame → andmete kustutamine toimub.',
        'see, kes kasutab → kasutaja.',
        'andmine on vabatahtlik → ei pea andma.',
        'kasutatakse … kogumiseks → kasutamise eesmärk on kogumine.',
      ]),
      teach(tag(inLesson(B.speaking('059_p_talk', 'Paaris enne projekti: mis sa arvad?', 'Arutage paaris 5 minutit. Siis valige viis reeglit, mis lähevad teie juhendisse.', [
        'Mis sa arvad, kas inimesed loevad tingimusi enne, kui vajutavad „luba”? Miks?',
        'Kas Eestis ja sinu kodumaal räägitakse andmete kaitsest piisavalt?',
        'Milline tundide 56–58 reegel on uuele kursuslasele kõige tähtsam ja miks?',
      ], [180, 240])), { task: 'S11', fluency: true }),
      'Projekti ettevalmistus (5 minutit, paaris; üks-ühele oled sina partner): arvamus põhjendusega, siis valik. Ära paranda vorme, kuula põhjendusi. Lõpus peab paaril olema viie reegli nimekiri märksõnadega.'),
    ],
    transfer: [
      station(teach(mainTask(peerReply(B.examWriting('059_t_guide', 'Projekt: „Minu digireeglid” uuele kursuslasele (15 minutit).', 'Kirjutage paaris juhend: viis reeglit, igaühel põhjus. Siis vahetage juhend teise paariga.', 'teade', {
        situation: 'Kursusele tuleb uus õppija, kes kolis Eestisse eelmisel kuul. Kirjutage talle juhend „Minu digireeglid”: üks reegel e-riigi kohta (tund 56), üks tehisintellekti kohta (57), üks postituste kohta (58) ja kaks telefoni ja andmete kohta (59). Iga reegli juurde üks põhjus. Teine paar loeb juhendi ja kirjutab alla kaks tähte ja ühe soovi.\nAbikaart: Koode ei öelda kellelegi, sest … · Isikuandmete sisestamine robotisse on keelatud, sest … · Enne jagamist kontrollitakse …\nLisaväljakutse: lisa juhendi lõppu üks lause lihtsas keeles ühe tingimuste lause kohta.',
        points: ['viis reeglit, igaühel põhjus', 'vähemalt kaks umbisikulist vormi (kontrollitakse, ei anta) ja kaks -mine-vormi (asukoha jagamine)', 'lihtne keel: uus kursuslane saab aru'],
        words: [100, 130],
      })), 'project',
      ['Koode ei öelda kellelegi, sest …', 'Isikuandmete sisestamine robotisse on keelatud, sest …', 'Enne jagamist kontrollitakse …'],
      'Lisa juhendi lõppu üks tingimuste lause lihtsas keeles.', { task: 'W02' }),
      'Projekt (v6 §2 d): mooduli toode, mis kogub tunnid 56–59 kokku; paarid kirjutavad koos 15 minutit (see on tunni kirjutamine, v6 G16). Kaaslase vastus (v6 G25): paarid vahetavad juhendid, loevad ja kirjutavad alla kaks tähte ja ühe soovi enesekontrolli kolme kriteeriumi järgi (5 minutit). Varjatud info (ütle, kui paarid kirjutavad): „Uus kursuslane on 70-aastane ja tal on ainult nupptelefon ning ID-kaart.” Õppijad peavad vähemalt ühe reegli sellele inimesele kohandama (digiabi raamatukogus, volitus lähedasele, kaarti ja koode koos ei hoita). Õnnestunud, kui juhendis on viis reeglit põhjustega, vähemalt kaks umbisikulist ja kaks -mine-vormi ning üks reegel on kohandatud. Üks-ühele: õppija kirjutab üksi, sina oled „teine paar”. Abikaarti võib kasutada; pane kirja, kas õppija seda vajas.'), 4, 25, { final: 'plan' }),
      teach(tag(exitCheck(B.writing('059_t_line', 'Väljumine: üks reegel paremaks.', 'Kirjuta üks reegel juhendist teise paari soovi järgi uuesti (1–2 lauset).', [1, 2])), { task: 'W10' }),
        'Väljumiskontroll (v6 G14), 3 minutit: üks rida tootest, ümber kirjutatud kaaslase soovi järgi (põhiülesande oskus on kirjutamine). Kas uus rida on selgem ja kas vorm on õige (koode ei öelda, asukoha jagamine)? Lõpus üks tugevus ja üks parandus.'),
      selfCheck('059_t_self', ['Sain raadiosaatest aru oma õigustest (luba, andmepäring, kustutamine).', 'Muutsin tingimuste keele lihtsaks ja vastupidi (andmete kogumine = andmeid kogutakse).', 'Kirjutasime viis selget reeglit põhjustega ja parandasime ühe kaaslase soovi järgi.'], 'Digireeglid valmis', 'Ma oskan oma andmeid kaitsta ja reegleid teisele seletada'),
      tag(homeTask(homeLines(B.examWriting('059_t_request', 'Kodus: andmepäring firmale (umbes 140 sõna).', `Kirjuta firmale andmepäring (130–150 sõna). Pöördumist ja algust ei anta. Salvesta 1-minutiline häälsõnum. ${HARJUTA}`, 'kiri', {
        situation: 'Vali rakendus, pood või kliendikaart, mida kasutad (või mõtle välja). Kirjuta firma klienditeenindusele või andmekaitse kontaktile. Oma päris andmeid ei pea kirjutama: kasuta väljamõeldud nime ja numbrit.',
        points: ['kes sa oled ja mis teenust kasutad', 'milliseid andmeid küsid ja kellele neid on edasi antud', 'mida palud kustutada või parandada ja miks', 'mis ajaks ootad vastust (üldjuhul kuu jooksul) ja mida teed, kui vastust ei tule'],
        words: [130, 150],
      }), 6)), { task: 'W13' }),
      writingRubric('059_t_rubric', 'Hindamisjuhend: andmepäring (12 punkti).', 'Piiripealne näidis (lühendatud, terve tekst on umbes 140 sõna; 7/12 ≈ 58 %, veel mitte 60 %): „Tere! Ma kasutan teie äpp. Ma tahan teada minu andmed. Kustutage minu andmeid. Vastake kiiresti. Aitäh!” Hinnang: ülesanne 2 (palve on olemas, kuid tähtaeg ja küsimus, kellele andmeid on antud, puuduvad), ülesehitus 2 (lühikesed laused ilma sidenditeta), sõnavara 2 (puuduvad andmepäring, nõusolek, edastamine, kolmandad isikud), grammatika 1 („teie äpp” → teie äppi, „tahan teada minu andmed” → tahan teada, milliseid andmeid te minu kohta hoiate, „Kustutage minu andmeid” → minu andmed); toon on liiga käskiv. Kui õppija lisab tähtaja, viisaka palve (paluksin) ja parandab vormid, saab ta 9/12 (75 %).'),
    ],
  },

  'b1b2-060': {
    title: 'Kontroll 12 — kuulamine ja rääkimine (vahehindamine 3)',
    format: 'exam',
    assessment: true,
    canDo: 'Ma saan eksami vormis aru kaheksast lühiteatest, mida kuulen üks kord, ja umbes 3-minutilisest intervjuust ning räägin: ühe minuti arvamuse samades tingimustes nagu mooduli alguses ja arutelu, kus jõuan partneriga ühise reeglini; Harno lävi on 60 %.',
    teacherPage: {
      goal: 'Контроль модуля 12 (vahehindamine 3) на одном листе, 45 минут: аудирование (16 баллов) + говорение (18 баллов). Параллельная задача к холодной задаче урока 056, обсуждение с аналитической рубрикой.',
      core: [1], alt: 1,
      short: 'Если времени мало: аудирование (20 мин) в классе со всеми; говорение — парами в следующем уроке в тех же условиях (без подготовки дома).',
      hook: 'Почему короткая форма, а не полный пробный экзамен: v5 §5 ставит в B2 060 полный экзамен, но v6 §2 g (blueprint курса: B2, урок 5 модуля = два навыка по очереди) для v6-модуля важнее; так же поступили с 040. Чтение и письмо уроков 41–55 проверены в 045–055, следующий полный экзамен — 080. Почему аудирование + говорение: контроль B2 чередует R + W и L + S (модуль 11 был R + W); холодная задача модуля устная (056_d_cold), поэтому и параллельная — устная; e-услуги, звонки мошенников и слухи в чате приходят к ученику как объявления и голосовые сообщения.',
      plan: [
        '0–2: инструкция, баллы и пороги (Harno 60 %, KeeleSepp 70 % и 80 %, ни одна часть не 0)',
        '2–11: аудирование 1 — восемь коротких объявлений по 35–45 секунд, каждое один раз, 8 вопросов с выбором',
        '11–22: аудирование 2 — интервью ≈ 3 минуты дважды, 8 пропусков по 1–3 слова (4 из них — перефразированы, не слово в слово)',
        '22–45: говорение парами: 1 — параллельная задача (1 мин подумать, 1 мин говорить, новое утверждение); 2 — обсуждение по карточкам A / B, 4 минуты, общее правило; вы вносите новую информацию',
      ],
      sources: 'Объявления и интервью — учебные тексты KeeleSepp (Heino и организации вымышлены). Правила: 14 дней отказа при покупке в интернете (võlaõigusseadus), банк не спрашивает коды по телефону, digiabi в библиотеках.',
      groups: 'Аудирование — все вместе, без словаря, запись заблокирована (объявления — 1 раз, интервью — 2 раза). Говорение — парами, остальные ждут вне класса или читают; в 1:1 партнёр — вы.',
      errors: [
        'Varasemast (≈ 25 % аудирования, v6 §2 f): объявление 2 — звонок «из банка» (модули 10–11: доверие, мошенничество), объявление 3 — отказ от интернет-покупки (урок 053), объявление 5 — слухи в чате дома (модуль 10: majagrupp), объявление 7 — пробный период и подписка (урок 051); в обсуждении — kompromiss и tingimusel, et (модули 10–11).',
        'Сравнение с холодной задачей: положите рядом заметки (или запись) 056_d_cold и 060_t_cold и назовите ученику одно развитие и один следующий шаг.',
      ],
      notes: [
        'Баллы: аудирование 8 + 8 = 16; говорение 1 — 6 баллов по трём строкам 0/1/2; говорение 2 — 12 баллов (4 критерия × 0–3). Всего 34. Harno 60 % = 21, KeeleSepp 70 % = 24, 80 % = 28. Ни одна часть не может быть 0 баллов.',
      ],
    },
    // Methodology v5 + v6 (2026-11-26): one sheet, 45 minutes, ≤ 10 blocks, LISTENING + SPEAKING; points add up (v6 G20:
    // L 8 + 8 items = 16 points; S 6 + 12 = the rubrics' maxima), the no-zero rule is stated (G21), the level is at least
    // the lessons' (the interview ≈ 3 min ≥ 150 s, 4 of 8 gap answers paraphrased; clips 35–45 s heard once), the cold →
    // parallel speaking is the same task with a new statement. The v4 full mock (three sheets, 30 blocks) stays hidden below.
    discover: [
      B.text('060_d_intro', 'Kontroll 12: kuulamine ja rääkimine (45 minutit)', 'Kontrollis on kaks osaoskust. Kuulamine (umbes 20 minutit): kaheksa lühiteadet, igaüht kuuled üks kord, ja intervjuu, mida kuuled kaks korda, kokku 16 punkti. Rääkimine (umbes 25 minutit, paaris): ühe minuti arvamus (6 punkti) ja arutelu (12 punkti) — kokku 18 punkti. Kokku 34 punkti. Harno: sooritatud alates 60 % (vähemalt 21 punkti) ja ükski osa ei tohi olla 0 punkti. KeeleSepp: eksamiks valmis alates 70 % (24 punkti), meie tunnistus alates 80 % (28 punkti) — see on sisemine lävi.'),
      PART('060_d_lpart', 'L', { minutes: 20, points: 16, tasks: 2, note: 'Kuulamine 1: kaheksa lühiteadet, igaüks üks kord (8 punkti). Kuulamine 2: intervjuu kaks korda, 8 lünka (8 punkti). Harno: sooritatud alates 60 %. KeeleSepp: eksamiks valmis alates 70 %, tunnistus alates 80 % (sisemine lävi).' }),
      why(teach(tag(once(perClip(B.examListen('060_p_clips', 'Kuulamine 1: kaheksa lühiteadet (8 punkti).', 'Loe enne küsimus. Iga teadet kuuled ainult üks kord. Vali õige vastus.', 'choice', [
        'Tähelepanu, raamatukogu külastajad! Alates järgmisest kuust saab meie teisel korrusel digiabi ka laupäeviti. Abistaja aitab ID-kaardi ja mobiilse lahendusega sisse logida, taotlusi täita ja dokumente allkirjastada. Abistaja ei tee asju teie eest, vaid näitab, kuidas neid tehakse. Palume aja eelnevalt broneerida telefoni teel või infoletis, sest ühe inimese kohta on aega pool tundi. Kaasa võtke oma ID-kaart ja vajaduse korral prillid. Koode me teilt ei küsi — need sisestate te ise. Digiabi on tasuta ja kestab kevadeni. Kui te ise helistada ei saa, võib aja teie eest broneerida ka lähedane.',
        'Hea klient! Viimastel päevadel on meie klientidele helistanud inimesed, kes esinevad panga töötajana. Nad ütlevad, et teie kontoga on probleem, ja paluvad kinnitada makse või öelda koodi. Pank ei küsi kunagi telefonis teie koode ega palu teil raha turvalisele kontole kanda. Kui saite sellise kõne, lõpetage see kohe ja helistage ise panga numbril, mis on kirjas kaardi tagaküljel. Kui olete koodi juba öelnud, võtke meiega kohe ühendust. Pidage meeles: panga töötaja ei palu teil kunagi midagi kiiresti teha ega ähvarda konto sulgemisega.',
        'Tere, siin e-pood Kodukaup. Teie tellitud tolmuimeja jõuab pakiautomaati homme. Kui toode ei sobi, võite neljateistkümne päeva jooksul lepingust taganeda. Selleks täitke meie kodulehel taganemisavaldus ja saatke toode tagasi originaalpakendis. Kui toode on terve ja töötab, maksab tagasisaatmise kulu ostja. Kui tootel on puudus, tasume saatmise ise. Raha kantakse teie kontole hiljemalt neljateistkümne päeva jooksul pärast avalduse saamist. Kui teil on küsimusi, kirjutage meie klienditeenindusele, mis vastab tööpäeviti kahe tunni jooksul.',
        'Lugupeetud lapsevanemad! Alates uuest veerandist kehtib meie koolis tehisintellekti kasutamise kord. Kodutöödes võib vestlusrobotit kasutada ideede kogumiseks ja sõnade selgitamiseks, kuid iga töö lõppu kirjutab õpilane ühe lause selle kohta, kuidas ta robotit kasutas. Kontrolltöödes on robot keelatud. Õpilaste isikuandmeid ega hindeid robotisse ei sisestata. Küsimuste korral kirjutage klassijuhatajale e-koolis. Järgmisel kuul korraldab kool lapsevanematele ka infotunni, kus näidatakse, kuidas vestlusrobotit ohutult kasutada.',
        'Head elanikud! Korteriühistu juhatus teatab, et maja vestlusrühmas on viimasel ajal jagatud teateid, mis ei ole tõesed. Vee sulgemise aeg ei muutu: vesi suletakse kolmapäeval kella kümnest kaheni. Ametlikud teated pannakse alati ka trepikoja stendile ja saadetakse e-postiga. Palume enne murettekitava teate edasisaatmist kontrollida, kas see on stendil. Vaidlusi palume rühmas mitte arutada, vaid kirjutada juhatusele. Kui vesi peaks mingil põhjusel kauem kinni olema, saadab juhatus kõigile korteritele kohe uue teate. Aitäh kõigile, kes aitavad hoida maja rühmas rahulikku õhkkonda!',
        'Ja nüüd lühidalt tehnikauudistest. Populaarne treeningrakendus muutis oma tingimusi: edaspidi näevad kasutajate jooksuradu vaikimisi kõik. Andmekaitse spetsialistid soovitavad seaded üle vaadata, sest nii võib võõras inimene näha, kus sa elad ja millal sa kodust lahkud. Seadete muutmiseks avage profiil, valige privaatsus ja märkige „ainult mina”. Rakenduse esindaja ütles, et muudatusest teatati kõigile kasutajatele e-kirjaga. Kes ei soovi oma andmeid jagada, võib konto ka täielikult kustutada. Selleks tuleb saata rakendusele andmete kustutamise taotlus.',
        'Hea klient! Teie muusikateenuse tasuta prooviaeg lõpeb kolme päeva pärast. Kui te tellimust ei tühista, muutub see automaatselt tasuliseks ja igakuine tasu võetakse teie kaardilt. Tellimuse saate tühistada rakenduse seadetes, kui valite „Minu konto” ja „Lõpeta tellimus”. Pärast tühistamist võite teenust kasutada prooviaja lõpuni. Kui teil on küsimusi, vastab meie klienditeenindus e-kirjale ühe tööpäeva jooksul. Kui soovite teenust edasi kasutada, ei pea te midagi tegema: tasu võetakse iga kuu samal kuupäeval. Hinnad leiate meie kodulehelt. Täname, et proovisite meie teenust!',
        'Raadiouudiste lõpus üks parandus. Eile levis sotsiaalmeedias video, mille kohta väideti, et see näitab tormi Pärnu rannas. Meie toimetus kontrollis videot ja selgus, et see filmiti mitu aastat tagasi teises riigis. Pärnus eile tormi ei olnud ja rand on avatud nagu tavaliselt. Palume enne murettekitava video jagamist kontrollida, millal ja kus see tehti. Täpsemat infot leiate meie kodulehelt, kus on ka ilmateenistuse ametlik hoiatus. Täname kuulajaid, kes saatsid meile video kontrollimiseks, ja tuletame meelde: tõeline uudis ei kao tunniga kuhugi.',
      ], [
        ['1. Mida peab raamatukogu digiabi kasutaja enne tulekut tegema?', 'aja ette kokku leppima', 'oma koodid abistajale ütlema', 'tulema ainult laupäeval', 'tooma kaasa sülearvuti'],
        ['2. Mida soovitab pank teha, kui keegi küsib telefonis sinu koodi?', 'kõne katkestama ja ise panka helistama', 'koodi ütlema ainult panga töötajale', 'raha turvalisele kontole kandma', 'ootama, kuni pank uuesti helistab'],
        ['3. Millal maksab e-pood toote tagasisaatmise eest ise, mitte ostja?', 'kui tootel on viga', 'kui ostja saadab toote kahe päeva jooksul', 'alati, kui toode ei sobi', 'kui toode on originaalpakendis'],
        ['4. Mida peab õpilane uue korra järgi koduse töö lõppu lisama?', 'selgituse, kuidas ta robotit kasutas', 'roboti vastuse koopia', 'vanema allkirja', 'klassijuhataja kinnituse'],
        ['5. Kust saab elanik kontrollida, kas vestlusrühma teade on õige?', 'trepikoja teadetetahvlilt', 'maja vestlusrühmast', 'naabritelt küsides', 'veefirma kodulehelt'],
        ['6. Miks soovitavad spetsialistid treeningrakenduse seadeid muuta?', 'võõras võib teada saada, millal kodu on tühi', 'rakendus muutub muidu tasuliseks', 'jooksurajad kustutatakse ilma loata', 'e-kirju tuleb muidu liiga palju'],
        ['7. Mida peab klient tegema, et tema kaardilt raha ei võetaks?', 'tellimuse enne prooviaja lõppu lõpetama', 'kirjutama klienditeenindusele kaebuse', 'oma pangakaardi sulgema', 'ootama prooviaja lõpuni'],
        ['8. Mida selgus videost, mida eile sotsiaalmeedias jagati?', 'see on vana ja tehtud mujal', 'Pärnu rand on tormi tõttu suletud', 'torm jõuab Pärnusse homme', 'video filmis raadio toimetus'],
      ], 'g_listen', 1))), { task: 'L02', harno: 'L1' }),
      'Kuulamine 1 nagu Harno B2 eksamil: iga teade 35–45 sekundit, kuulatakse üks kord, salvestis on lukus. Lase õppijatel enne iga teadet küsimus läbi lugeda (10 sekundit). Vastused on teiste sõnadega kui teates (broneerida → aja ette kokku leppida, puudus → viga, stend → teadetetahvel). Varasemast: teated 2, 3, 5 ja 7 kordavad moodulite 10–11 teemasid.'), [
        'Teade 1: „Palume aja eelnevalt broneerida …” (aja broneerimine = aja ette kokku leppimine).',
        'Teade 2: „lõpetage see kohe ja helistage ise panga numbril”. (Varasemast: moodulid 10–11.)',
        'Teade 3: „Kui tootel on puudus, tasume saatmise ise.” (Varasemast: tund 53.)',
        'Teade 4: „iga töö lõppu kirjutab õpilane ühe lause selle kohta, kuidas ta robotit kasutas”.',
        'Teade 5: „Ametlikud teated pannakse alati ka trepikoja stendile.” (Varasemast: moodul 10, majagrupp.)',
        'Teade 6: võõras võib näha, „kus sa elad ja millal sa kodust lahkud”.',
        'Teade 7: „Kui te tellimust ei tühista, muutub see automaatselt tasuliseks.” (Varasemast: tund 51, tellimus ja prooviaeg.)',
        'Teade 8: video „filmiti mitu aastat tagasi teises riigis”.',
      ]),
      why(teach(tag(twice(B.listening('060_p_listen', 'Kuulamine 2: raadiointervjuu (8 punkti).', 'Kuula intervjuud kaks korda. Kirjuta igasse lünka 1–3 sõna. Vastus võib olla teiste sõnadega kui intervjuus.', [
        'Saatejuht: Tere! Täna on stuudios Heino, kes käib kord nädalas vabatahtlikuna raamatukogus eakaid digimaailmas aitamas. Heino, kuidas te selle tööni jõudsite?',
        'Heino: Ma olin ise pensionil ja märkasin, et mu naabrid helistavad mulle iga kord, kui arvuti midagi küsib. Siis mõtlesin, et kui juba aitan, võiksin seda teha korralikult. Nüüd olen raamatukogus juba kolm aastat igal neljapäeval.',
        'Saatejuht: Millega inimesed kõige sagedamini tulevad?',
        'Heino: Kõige rohkem retseptide ja ID-kaardiga. Paljud ei tea, et retsepti ei pea paberil kaasas kandma. Teisel kohal on pangaasjad. Ja viimasel ajal küsitakse palju ka tehisintellekti kohta: lapselapsed kasutavad, vanaema tahab aru saada, mis see on.',
        'Saatejuht: Mis on teie töö kõige tähtsam reegel?',
        'Heino: Ma ei puuduta kunagi inimese hiirt ega klaviatuuri. Ma istun kõrval ja seletan. Kui ma teen ise, on asi küll kiiresti tehtud, aga järgmisel nädalal tuleb inimene sama murega tagasi. Kui ta vajutab ise, jääb see meelde.',
        'Saatejuht: Ja koodid?',
        'Heino: Koode ma ei vaata ega kirjuta üles. Palun inimesel need ise sisestada ja pööran end selleks ajaks ära. See on usalduse küsimus.',
        'Saatejuht: Mis on kõige suurem takistus?',
        'Heino: Hirm. Inimene kardab, et vajutab valesti ja kaotab raha. Seepärast alustame alati millestki ohutust, näiteks vaatame ilmateadet või raamatukogu lahtiolekuaegu. Kui esimene õnnestumine on käes, läheb edasi palju kergemini.',
        'Saatejuht: Kas teie juurde tuleb ka nooremaid inimesi?',
        'Heino: Tuleb küll. Eelmisel kuul tuli kolmekümneaastane mees, kes oli just Eestisse kolinud. Arvutit oskas ta paremini kui mina, aga ametlikest sõnadest ei saanud ta aru. Me istusime koos tund aega ja tegime talle väikese sõnastiku. Nüüd saadab ta mulle vahel sõnumi, et sai jälle ise hakkama.',
        'Saatejuht: Kas olete ka ise midagi õppinud?',
        'Heino: Väga palju. Näiteks kannatlikkust. Ja seda, et ametlikku teksti tuleb seletada lihtsas keeles. Kui kirjas on „taotluse menetlemine”, siis ma ütlen: riik vaatab su avalduse läbi. Inimese nägu läheb kohe rõõmsamaks.',
        'Saatejuht: Mida soovitaksite neile, kes tahaksid samuti aidata?',
        'Heino: Alustage oma majast. Igas trepikojas on keegi, kes vajab abi, aga ei julge küsida. Pange stendile väike teade ja kirjutage, millal te kodus olete. Ja ärge kunagi öelge „see on ju lihtne”. Inimesele, kes teeb seda esimest korda, ei ole see lihtne.',
        'Saatejuht: Aitäh, Heino!',
      ], [
        'Heino aitab raamatukogus inimesi igal [neljapäeval].',
        'Kõige sagedamini on inimestel küsimusi retseptide ja [ID-kaardi|ID-kaardiga] kohta.',
        'Kui inimene teeb ise, ei pea ta järgmisel nädalal sama murega [tagasi tulema|uuesti tulema].',
        'Kui inimene sisestab koode, vaatab Heino [mujale|teisele poole].',
        'Kõige suurem takistus on inimeste [hirm].',
        'Kui esimene asi [õnnestub|läheb hästi|läheb korda], on edasi palju kergem.',
        'Ametliku teksti asemel kasutab Heino [lihtsat keelt|lihtsaid sõnu].',
        'Heino soovitab uutel abistajatel alustada [oma majast].',
      ], 'g_listen')), { voice: 'interview', task: 'L04', harno: 'L3' }),
      'Kuulamine 2 (≈ 3 minutit, kaks korda, salvestis lukus). Lüngad 3, 4, 6 ja 7 on ümbersõnastatud (vastus ei ole intervjuus sõna-sõnalt): aktsepteeri iga sisult õiget 1–3-sõnalist vastust. Kontrolli taset: salvestis on pikem kui tundide klipid ja sama pikk kui tundide raadiosaated (v6 G20).'), [
        'Heino: „olen raamatukogus juba kolm aastat igal neljapäeval”.',
        'Heino: „Kõige rohkem retseptide ja ID-kaardiga.”',
        'Ümbersõnastatud: „järgmisel nädalal tuleb inimene sama murega tagasi” → ei pea tagasi tulema.',
        'Ümbersõnastatud: „pööran end selleks ajaks ära” → vaatab mujale.',
        'Heino: „Hirm.”',
        'Ümbersõnastatud: „Kui esimene õnnestumine on käes” → kui esimene asi õnnestub.',
        'Ümbersõnastatud: „ametlikku teksti tuleb seletada lihtsas keeles” → lihtsat keelt.',
        'Heino: „Alustage oma majast.”',
      ]),
      PART('060_t_spart', 'S', { minutes: 25, points: 18, tasks: 2, note: 'Rääkimine 1 (6 punkti): kolm rida 0–2 — samad tingimused nagu mooduli külmas alguses (tund 56). Rääkimine 2 (12 punkti): analüütiline juhend, neli kriteeriumi 0–3. Kontrolli tulemus: kuulamine … / 16 + rääkimine … / 18 = … / 34.' }),
      teach(tag(inLesson(B.speaking('060_t_cold', 'Rääkimine 1: arvamus ühe minutiga (6 punkti).', 'Väide: „Sotsiaalmeedia teeb inimesi pigem üksildaseks, kui ühendab neid.” Mõtle 1 minut. Räägi 1 minut: seisukoht, põhjus, näide, vastuargument.', [
        'Kas oled väitega nõus? Miks?',
        'Too üks näide oma elust või tuttava elust.',
        'Mida ütleks keegi, kes arvab teisiti?',
      ], [60, 90], '', 'g_use')), { task: 'S11', harno: 'S1', fluency: true }),
      'Mooduli paralleelne lõpuülesanne: samad tingimused nagu mooduli külmas alguses tunnis b1b2-056 (1 minut mõtlemiseks, 1 minut rääkimiseks, fraase ega algust ei ole), uus väide samast teemast. Hinda kolme rea järgi 0–2 (hindamine all). Võrdle külma alguse märkmetega: ütle õppijale üks konkreetne areng ja üks järgmine samm.'),
      keepPlace(B.rubric('060_t_rubric', 'Hindamine: rääkimine 1 (6 punkti).', 'Iga rida 0–2 punkti.', ['Seisukoht esimeses lauses, põhjus ja näide (0–2).', 'Vastuargument ja vastus sellele (0–2).', 'Keel: sidendid (kuigi …, siiski; seetõttu) ja mooduli vormid (tehakse, jagati, andmete kogumine) (0–2).'])),
      B.planning('060_t_prep', 'Rääkimine 2: ettevalmistus (1 minut).', 'Loe oma kaarti. Kirjuta märksõnadega kaks argumenti ja üks näide. Punkte selle eest ei anta.', ['Minu seisukoht:', 'Argumendid ja näide:', 'Mida ma võin partnerile järele anda (tingimusel, et …)?'], 2),
      teach(tag(B.rolecards('060_t_debate', 'Rääkimine 2: arutelu argumendikaartidega (4 minutit, 12 punkti).', 'Lugege oma kaarti. Öelge alguses oma seisukoht. Arutage 4 minutit ja jõudke ühise reeglini.',
        'Kaart A. Teema: kas keelekursusel peaks tehisintellekti kasutamine kodutöödes olema lubatud? Sina oled pigem poolt: robot seletab sõnu ka öösel; kirja mustandi parandamine aitab vigu näha; keelamine ei aita, sest kodus kasutatakse seda niikuinii. Lisa üks oma näide.',
        'Kaart B. Sina oled pigem vastu: õppija ei õpi, kui robot kirjutab tema eest; õpetaja ei näe, mida õppija päriselt oskab; isikuandmete sisestamine on oht. Lisa üks oma näide.',
        ['Minu arvates peaks …, sest …', 'Ma saan aru, mida sa mõtled, aga …', 'Kas me võiksime kokku leppida, et …?'],
        ['Ma ei ole päris nõus, sest …', 'Näiteks …', 'Olgu, aga ainult tingimusel, et …']), { task: 'S17', harno: 'S2' }),
      'Arutelu 4 minutit (paaris; üks-ühele oled sina partner). Varjatud info (ütle teise minuti lõpus): „Eelmisel nädalal leiti kahest kodutööst täpselt sama roboti tekst.” Õppijad peavad sellele reageerima ja lisama reeglisse tingimuse (näiteks: robotit võib kasutada, kui kodutöö lõppu kirjutatakse, kuidas seda kasutati). Hinda all oleva juhendiga (4 × 0–3).'),
      keepPlace(teach({ ...B.rubricSpeaking('060_t_srubric', 'Hindamine: rääkimine 2 (12 punkti).'), goal: 'g_use', data: { ...B.rubricSpeaking('060_t_srubric').data, title: 'Hindamine: rääkimine 2 (12 punkti).', instruction: 'Neli kriteeriumi, igaüks 0–3 punkti, kokku 12.', criteria: SPEAKING_12.map(([name, hint]) => ({ name, max: 3, hint })) } },
        'Hinda arutelu nelja kriteeriumi järgi (0–3). Piiripealne näidis (≈ 7/12): õppija ütleb seisukoha ja ühe põhjuse, aga ei reageeri partneri argumendile ega uuele infole (ülesanne 1), räägib pausidega (2), sõnavara on piisav (2), vead ei takista (2). Mooduli keel on grammatika kriteeriumi osa: umbisikuline (tehakse, ei anta), -mine (isikuandmete sisestamine), minevik (jagati, on kinnitatud). Kontrolli tulemus = kuulamine … / 16 + rääkimine 1 … / 6 + rääkimine 2 … / 12.')),
    ],
  },
}), {
  'b1b2-056': 'LUGE R→S', 'b1b2-057': 'KUUL L→S', 'b1b2-058': 'AVAS R→S', 'b1b2-059': 'PROJ L→W', 'b1b2-060': 'EKS',
}));

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js). Since v6 the explanations travel with each block (why(block, lines)); this map is empty and
// kept for courseSheet.js withExplanations.
export const EXPLAIN = {};
