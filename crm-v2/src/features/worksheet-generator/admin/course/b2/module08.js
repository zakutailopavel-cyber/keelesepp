// B2 course (B1 → B2 roadmap), module 8 „Reisimine ja kultuur” (b1b2-036…040), stage B1+ (roadmap levelStage).
// Design v4 „task-based” (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17) on the v3 station engine, built on the
// samples B1→B2 modules 1–7. Module goal (the learner): „Ma oskan ise reisida ja külalist Eestis vastu võtta: planeerin
// reisi oma rahaga, lahendan reisil tekkinud mure, saan aru kommetest ja soovitan kohta, mida tasub näha”; module product
// „Minu soovitus külalisele” (039 Kasuta, the S1 one-minute talk in 040). Travel and culture from the learner's own angle:
// his own weekend trip and budget, a cancelled flight and a late suitcase (EU rules), culture shock and customs between
// him and his Estonian neighbours or colleagues, a museum, festival or song celebration he recommends to a guest. Not
// repeated from earlier modules: the cancelled train and passenger rights (module 4), the bog hike (module 5), holiday
// food (module 5), hobbies and the choir (module 4).
// Every teaching lesson follows one arc in exactly 4 stations (≤ 75 min of a 90-min lesson):
//   1 hook + pre-task (≤ 80 words, the learner speaks in the first minute) → 2 input + task → 3 language focus
//   (notice in the input → rule → use) → 4 product in class + „Kui aega jääb” + exit check (3 items) + „Ma oskan …”;
//   the long writing and a 1-minute voice message are homework; the lesson words reach „Harjuta” through
//   vocabulary/lessonWords/b1b2.json (Sõnavara → Teemad → Moodul 8).
// One format and one everyday topic a lesson, no two neighbours alike (admin/course/v4Tasks.test.js):
//   036 project „Nädalavahetus 200 euroga — kuhu sõidame?”            free time    final negotiate: the trip plan (S03)
//   037 infogap „Lend tühistati, kohver hilines — mis sulle kuulub?”   money        final complain: the airline desk (W13 home)
//   038 game    „Kingad jalast ja vaikus bussis — kas eestlane on kinnine?”  neighbours  final explain: a custom to a newcomer
//   039 case    „Külaline tuleb suvel — kuhu sa ta viid?”               culture      final advise: „Minu soovitus külalisele”
//   040 exam    Vahehindamine 2 (tunnid 21–40) in Harno B2 form + „Minu soovitus külalisele” as the S1 one-minute talk.
// Grammar line (roadmap 036–039: plan and compromise, complaint with the conditional, careful generalisation, past
// tenses + evaluation; docs/METHODOLOGY_STANDARD.md §5) by discovery and spiralled: relative clauses with the pronoun's
// case — koht, kus …; linn, kuhu …; telk, mille …; sõber, kelle juures … (036; back in the 039 recommendation and 040);
// the quotative in the past — lend olevat tühistatud, kohver olevat jäänud — and the polite demand (palun hüvitage,
// tingiv: Kas oleks võimalik …?) (037, after module 7's present -vat in 032; back in 040); careful generalisation —
// sageli, enamasti, minu kogemuses + V2, sõltub sellest, kas …, keda peetakse milleks (038; back in the 039 review and
// 040); the past tenses in a story with evaluation — käisin / olen käinud / olin kuulnud, väärt, elamus, pettumus (039,
// the roadmap's „Reisikogemus ja hinnang”; back in 040). The one long text of the module is the topic opener (036
// station 2, ≈ 370 words, after a 10-minute hook and pre-taught words). The course's cast is not used.
// Kept: lesson ids, the goal keys of b2/lessonGoals.js and the archetypes (PROJ, KIRJ, RÄÄK, LUGE, EKS) with their exam
// corners (036 R2b, 037 R3, 038 L4, 039 R4). The v2 storyline version (the Kase kool family club, the Setomaa bus, Anna
// in Rome, Olena's jaanipäev, the culture evening „Kaks kodu”) is in git history before 2026-11-18.
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
const WORDS_HOME = 'Tunni sõnad: Sõnavara → Teemad → Moodul 8. Kui teema on läbitud, kordad sõnu „Harjuta” all.';
// a learner who cannot record (no quiet room, no smartphone) says the talk at the start of the next lesson
const NO_RECORDING = 'Kui salvestada ei saa, räägi see järgmise tunni alguses õpetajale.';

export const MODULE = { id: 'b1b2-module-08', course: 'b2', title: 'Reisimine ja kultuur', level: 'B1+', design: 'v3-stations', template: 'v4' };

// an exam part header carries the goal of its part: b2/lessonGoals.test.js asks every non-text block of a B2 sheet for one
// of the lesson's goals, and the header has none of its own (B.examPart: goal '')
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });

export const LESSONS = withShapes({
  'b1b2-036': {
    title: 'Nädalavahetus 200 euroga — kuhu sõidame?',
    phases: grammar('Keel: kus-, kuhu-, mille- ja kelle-lause — koht, kus …; linn, kuhu …; telk, mille …; sõber, kelle juures …'),
    format: 'project',
    topic: 'freetime',
    canDo: 'Ma võrdlen reisivariante (transport, majutus, programm, hind), lepin kaaslasega kompromissi abil kokku nädalavahetuse plaani ja kirjeldan kohti kõrvallausega (koht, kus …; linn, kuhu …; telk, mille …).',
    teacherPage: {
      goal: 'Ученик планирует выходные на 200 € на двоих, сравнивает три варианта, договаривается о компромиссе и описывает места придаточными (kus, kuhu, mille).',
      core: [1, 3, 4], alt: 2,
      short: 'План Б (устал или слабый): крючок и 1 вопрос; станция 2 — только 3 вопроса к тексту (1, 3, 5), остальной текст дома; станция 3 — правило и 4 строки; станция 4 — карточки и договорённость без смены условий, план в 3 строки.',
      hook: '«У тебя свободные выходные и 200 евро на двоих. Куда поедешь: по Эстонии, за границу или останешься дома? Одна фраза — сразу.» Ответьте сами первым («Ma sõidaksin …, sest …»), потом ученик. Первые 5 минут не исправлять.',
      plan: [
        '0–3: крючок — 200 евро и выходные, ученик отвечает сразу',
        '3–15: станция 1 — разговор: моя последняя поездка и как я её планировал',
        '15–30: станция 2 — слова (2 мин), прогноз «Сколько стоит место для палатки в лесу RMK?», текст темы, 6 вопросов людей',
        '30–42: станция 3 — заметить в тексте kus / mille / mida → правило → заметки друга: 7 предложений в одно',
        '42–57: станция 4 — три варианта поездки, разговор с партнёром (у него другой бюджет и желания), общий план',
        '57–69: «Kui aega jääb» — план Б: в пятницу вечером объявили шторм',
        '69–76: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '76–83: домашнее задание: письмо попутчику, запись 1 минуты, слова',
        '83–90: запас',
      ],
      sources: 'Текст станции 2: Visit Estonia (RMK содержит сотни бесплатных мест для костра и палатки); RMK, условия бронирования лесных домиков 2025 (плата за ключ, бронь заранее); praamid.ee, билеты 2026 г. на линии Virtsu–Kuivastu (взрослый 4,30 €, легковая машина 12 €, переправа около получаса; машина без брони — в общую очередь); Tervisekassa (Европейская карта медицинского страхования бесплатна, для взрослого действует 3 года, не заменяет страховку путешественника). Цены в трёх карточках станции 4 — примерные (2026), на листе это сказано; перед настоящей поездкой проверять.',
      groups: 'Станция 1 — в парах. Текст и вопросы — каждый сам, сверка в паре. Станция 4: пары с разными карточками партнёра (у одного «мало денег», у другого «хочу в город»), потом смена. В 1:1 партнёр — вы.',
      errors: [
        '«linn, kus me sõidame» → «linn, kuhu me sõidame» (sõitma kuhu? — kuhu; olema kus? — kus).',
        '«telk, mis ma laenasin» → «telk, mille ma laenasin» (laenama mida? — täissihitis: mille).',
        '«sõber, kes juures ööbime» → «sõber, kelle juures ööbime» (kelle juures — omastav).',
        'Koma kõrvallause ees: «Me ööbime külalistemajas, kus …» — по-русски тоже запятая, но ученики её забывают.',
      ],
      notes: [
        'Формат — мини-проект: в конце урока у ученика есть свой план выходных (куда, на чём, где ночуем, сколько всё стоит, наш компромисс). Ученику без денег на поездку: «поездка в соседний город на день» или «если бы у тебя было 200 евро»; пенсионеру — поездка с внуками; маме в декрете — с ребёнком и коляской; студенту — с другом, дешевле всего.',
        'Цены не превращать в урок математики: важно, чтобы ученик сказал, на что уходят деньги и где можно сэкономить. Числа из текста (4,30 €, 12 €) — реальные билеты 2026 года; если ученик спросит, что сейчас, ответ: «Kontrolli praamid.ee lehelt».',
        'Обратная связь, 2–3 цели: местоимение в придаточном по вопросу (kus? kuhu? mille? kelle juures?); компромисс («Ma olen nõus …, kui …»); запятая перед придаточным.',
      ],
    },
    discover: [
      station(B.text('036_d_hook', 'Sinu nädalavahetus', 'Sul on vaba nädalavahetus ja 200 eurot kahe inimese peale. Kuhu sa sõidad: Eestis ringi, välismaale või jääd hoopis koju? Ütle kohe üks lause ja üks põhjus.'), 1, 15),
      inLesson(teach(tag(purpose(B.speaking('036_d_talk', 'Minu viimane reis.', 'Vasta igale küsimusele ja too näide oma elust.', [
        'Kuhu sa viimati reisisid ja kellega? Kes reisi planeeris?',
        'Mille peale kulub sinu reisil kõige rohkem raha: sõidule, ööbimisele, söögile või piletitele?',
        'Kas sa reisid pigem plaaniga või ilma? Kas oled midagi hiljem kahetsenud?',
      ], [150, 210], ['Me sõitsime …', 'Kõige rohkem maksis …', 'Ma eelistan …, sest …']), 'Sinu enda reis annab tunni projektile esimese näite.'), { task: 'S01', fluency: true }),
      'Üks-ühele: räägi ka ise lühidalt oma viimasest reisist. Ära paranda; lõpus ütle üks sõna, mida õpilane vajas ja ei teadnud. Kui õpilane ei reisi: „Kuhu sa sõidaksid, kui saaksid valida? Kus sa lapsena suvel käisid?”')),
      station(tag(B.vocab('036_d_vocab', 'Enne lugemist: sõnad.', ['eelarve — бюджет', 'majutus — проживание', 'ööbima — ночевать', 'broneerima — бронировать', 'praam — паром', 'telkimiskoht — место для палатки', 'sihtkoht — пункт назначения', 'varu — запас', 'kompromiss — компромисс', 'tasuta — бесплатно']), { topic: ['eelarve', 'majutus', 'telkimiskoht'] }), 2, 15),
      B.topicOpener('036_d_open', 'Moodul 8. Reis algab plaanist', [
        'Hea reis ei alga piletist, vaid neljast küsimusest: kuhu sõita, millega, kus ööbida ja kui palju kõik kokku maksab. Eelarvesse kuuluvad sõit, majutus, söök ja piletid, näiteks muuseumi või kontserdi omad. Kogenud reisijad jätavad eelarvest umbes 10 protsenti varuks, sest midagi läheb alati teisiti: buss hilineb, ilm muutub või tuleb osta vihmakeep, mis jäi koju. Kui reisib pere, tasub kõik kulud enne sõitu tabelisse kirja panna ja kokku leppida, kes mille eest maksab.',
        'Eesti on väike maa ja peaaegu iga koht on bussi- või autosõidu kaugusel. Bussipileti saab sageli odavamalt, kui ostad selle mõni nädal ette. Suurematele saartele sõidab praam. Virtsust Kuivastusse, kust algab Saaremaa tee, kestab praamisõit umbes pool tundi; 2026. aasta piletitel maksis täiskasvanu pilet 4,30 ja sõiduauto pilet 12 eurot. Suvel tasub sõit praamid.ee kaudu ette broneerida, sest ilma broneeringuta auto jääb üldisesse järjekorda ja ootamine võib võtta tunde.',
        'Ööbida saab hotellis, külalistemajas, puhkemajas või telgis. Riigimetsa Majandamise Keskus ehk RMK haldab sadu lõkke- ja telkimiskohti, mida saab kasutada tasuta. Metsamaja kasutamise eest tuleb maksta ja see tuleb ette broneerida. Telgiga reisija valib koha, kus lõkke tegemine on lubatud, ja viib prügi endaga kaasa. Odavaim öö on sageli see, mille eest ei maksa keegi, aga selleks on vaja telki, magamiskotti ja natuke õnne ilmaga. Pere puhul arvestab enamik inimesi siiski majutusega, kus on soe tuba ja hommikusöök.',
        'Ka välismaa ei ole kaugel: Riia ja Helsingi on bussi või laevaga mõne tunni kaugusel. Euroopa Liidus saab reisida ka ID-kaardiga. Laeva või bussiga reisides tasub vaadata, kui palju pagasit võib tasuta kaasa võtta. Enne sõitu tasub tellida Tervisekassast Euroopa ravikindlustuskaart, mis on tasuta ja kehtib täiskasvanul kolm aastat. Kaart aitab haiglas või arsti juures, aga reisikindlustust see ei asenda: kui lend jääb ära või kohver kaob, kaart ei aita.',
        'Selles moodulis planeerid oma reisi ja lepid kaaslasega kokku, lahendad reisil tekkinud mure, räägid kommetest, mis sind Eestis või välismaal üllatasid, ja soovitad külalisele kohta, mida tasub Eestis näha.',
      ], 'Visit Estonia, „Telkimine Eestis”; RMK loodus- ja metsamajade broneerimistingimused (2025); praamid.ee, Virtsu–Kuivastu piletid (2026); Tervisekassa, „Euroopa ravikindlustuskaart”', [
        'Kuidas planeeriti reise sinu lapsepõlves seal, kus sa üles kasvasid? Mis on Eestis teisiti?',
        'Kas sa oled ööbinud telgis või metsamajas? Kuidas see läks?',
        'Mis on sinu arvates reisil kõige mõistlikum kokkuhoiu koht ja kus ei tasu kokku hoida?',
      ]),
      tag(purpose(B.table('036_d_read', 'Mida ütleb tekst?', 'Vasta igale küsimusele 1–3 sõnaga, nagu tekst ütleb.', 'Küsimus, Vastus', [
        'Sõbranna: „Kui palju eelarvest tasub jätta varuks?” | [10 protsenti/umbes 10 protsenti/10 %/10%/kümme protsenti]',
        'Naaber: „Kui kaua kestab praamisõit Virtsust Kuivastusse?” | [umbes pool tundi/pool tundi/30 minutit]',
        'Kolleeg: „Mis juhtub suvel, kui sõidan autoga praamile ilma broneeringuta?” | [jääd järjekorda/jääb üldisesse järjekorda/üldisesse järjekorda/ootad järjekorras/järjekorda]',
        'Poeg: „Kas RMK telkimiskoha eest peab maksma?” | [ei/ei pea/ei, see on tasuta/tasuta]',
        'Ema: „Mida pead metsamajaga enne sõitu tegema?” | [ette broneerima/broneerima/broneerida/ette broneerida/maksma]',
        'Vend: „Kas ravikindlustuskaart aitab, kui mu kohver kaob?” | [ei/ei aita/ei, ei aita]',
        'Isa: „Mille peaksin enne välisreisi Tervisekassast tellima?” | [Euroopa ravikindlustuskaardi/ravikindlustuskaardi/ravikindlustuskaart/Euroopa ravikindlustuskaart]',
        'Õde: „Mis dokumendiga saab Euroopa Liidus reisida, kui passi ei ole?” | [ID-kaardiga/ID-kaart/ID-kaardiga saab/isikutunnistusega]',
      ], 'g_read'), 'Sinu sõbrad ja pere küsivad reisi kohta; nüüd vastad faktiga.'), { task: 'R15', harno: 'R2b' }),
    ],
    practice: [
      station(B.notice('036_p_notice', 'Märka: koht, kus …; telk, mille …', [
        'Tekstist: Virtsust Kuivastusse, **kust** algab Saaremaa tee · sadu telkimiskohti, **mida** saab kasutada tasuta · öö, **mille** eest ei maksa keegi · vihmakeep, **mis** jäi koju',
        'Kõrvallause täpsustab nimisõna. Küsi kõrvallause seest: **Kus** on soe tuba? → majutus, **kus** on soe tuba. **Kuhu** buss läheb? → linn, **kuhu** buss läheb. **Kust** tee algab? → sadam, **kust** tee algab.',
        '**Mis** ja **kes** käänduvad nagu nimisõna lauses: telk, **mille** naaber laenas (laenas mille? — täissihitis) · koht, **mida** saab kasutada (osastav) · praam, **millega** sõidame · sõber, **kelle juures** ööbime · inimesed, **kellel** on auto',
        'Kõrvallause ette käib **koma**. Kõrvallause tuleb kohe nimisõna järele: Külalistemaja, **kus** me ööbisime, oli mere ääres.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('036_p_notes', 'Sõbra reisimärkmed.', 'Sõber kirjutas reisiplaani lühikeste lausetena. Tee igast kahest lausest üks selge lause pere vestlusesse. Kõrvallause algab antud sõna järel.', [
        ['Me ööbime külalistemajas. Seal on hommikusöök hinnas.', 'külalistemajas, …', 'Me ööbime külalistemajas, kus on hommikusöök hinnas.|Me ööbime külalistemajas, kus hommikusöök on hinnas.'],
        ['Laupäeval sõidame Kuressaarde. Sinna läheb buss kell kaheksa.', 'Kuressaarde, …', 'Laupäeval sõidame Kuressaarde, kuhu läheb buss kell kaheksa.|Laupäeval sõidame Kuressaarde, kuhu buss läheb kell kaheksa.'],
        ['Võtame kaasa telgi. Selle laenas mulle naaber.', 'telgi, …', 'Võtame kaasa telgi, mille laenas mulle naaber.|Võtame kaasa telgi, mille naaber mulle laenas.|Võtame kaasa telgi, mille mulle naaber laenas.'],
        ['Mul on Tartus sõber. Tema juures saame tasuta ööbida.', 'sõber, …', 'Mul on Tartus sõber, kelle juures saame tasuta ööbida.|Mul on Tartus sõber, kelle juures me saame tasuta ööbida.|Mul on sõber Tartus, kelle juures saame tasuta ööbida.'],
        ['Tagasi tuleme praamiga. Selle piletid tuleb ette osta.', 'praamiga, …', 'Tagasi tuleme praamiga, mille piletid tuleb ette osta.|Tagasi tuleme praamiga, mille pileti peab ette ostma.'],
        ['Kaasa tuleb ka minu õde. Temaga on reisil alati lõbus.', 'õde, …', 'Kaasa tuleb ka minu õde, kellega on reisil alati lõbus.'],
        ['Pärnus on rand. Sealt on vanalinna kümme minutit jalgsi.', 'rand, …', 'Pärnus on rand, kust on vanalinna kümme minutit jalgsi.|Pärnus on rand, kust on kümme minutit jalgsi vanalinna.'],
      ], 'full', 'g_notice'), 'Pere loeb ühte selget sõnumit, mitte neliteist lühikest lauset.'), { task: 'G05' }),
      'Pärast iga rida küsi: „Mis küsimus siin on?” (Kus? Kuhu? Kust? Mille? Kellega? Kelle juures?). Nii tuleb sõna õpilaselt, mitte sinult. Rida 3: laenama mida? — täissihitis (mille), mitte „mis”.'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('036_t_cards', 'Kolm varianti, 200 eurot.', 'Loe kaarte ja arvuta, kas variant mahub teie eelarvesse: 200 eurot kahe inimese peale. Hinnad on näidishinnad (2026).', [
        ['Saaremaa bussiga', ['Buss Tallinn–Kuressaare koos praamiga: umbes 25 € inimese kohta ühes suunas.', 'Külalistemaja Kuressaares, hommikusöök hinnas: umbes 70 € öö kahele.', 'Piiskopilinnus ja rand jalgsi kaugusel.', 'Miinus: kaks pikka sõidupäeva.'], []],
        ['Lõuna-Eesti autoga', ['Kütus kahe peale kokku: umbes 50 €.', 'RMK telkimiskoht järve ääres: tasuta, telk on olemas.', 'Matkarajad ja Eesti Rahva Muuseum Tartus.', 'Miinus: öö võib olla külm, lähim pood on kaheksa kilomeetri kaugusel.'], []],
        ['Riia bussiga', ['Buss Tallinn–Riia: 25–35 € inimese kohta ühes suunas.', 'Hostel vanalinnas: umbes 50 € öö kahele.', 'Vanalinn ja turg jalgsi, muuseumid 5–10 €.', 'Miinus: neli ja pool tundi bussis ühe otsa peale.'], []],
      ], '3'), 'Kaardid annavad sinu plaanile päris arvud, mitte ainult soovid.'), { task: 'R11' }), 4, 15, { final: 'negotiate' }),
      tag(purpose(B.table('036_t_budget', 'Kas mahub eelarvesse?', 'Arvuta kaartide järgi kahe inimese kulud: sõit mõlemas suunas ja üks öö.', 'Küsimus, Summa kahele (€)', [
        'Saaremaa bussiga: sõit ja majutus kokku | [170/170 €/170 eurot/umbes 170]',
        'Mitu eurot jääb Saaremaa variandi puhul söögiks ja piletiteks? | [30/30 €/30 eurot]',
        'Lõuna-Eesti autoga: kütus ja öö kokku | [50/50 €/50 eurot]',
        'Riia bussiga: kõige odavamate piletitega kokku | [150/150 €/150 eurot]',
        'Riia bussiga: kõige kallimate piletitega kokku | [190/190 €/190 eurot]',
      ], 'g_read'), 'Arvud näitavad sulle, milline variant jätab raha ka söögiks ja üllatusteks.'), { task: 'R08' }),
      teach(tag(purpose(B.rolecards('036_t_deal', 'Leppige kokku.', 'Räägi oma reisikaaslasega ja leppige kokku üks plaan: kuhu, millega, kus ööbite ja kui palju see maksab.',
        'Olukord: sina ja sinu reisikaaslane (sõber, abikaasa, laps või õde) planeerite nädalavahetust. Raha on kahe peale 200 eurot.\nSinu eesmärk: üks plaan, millega te mõlemad olete nõus, ja vähemalt üks kompromiss.\nPiirang: reisikaaslane tahab midagi muud kui sina.',
        'Reisikaaslase kaart on õpetajal: tema soovid, tema raha ja üks uudis.',
        ['Ma pakun, et sõidame …, kus …', 'Kõige rohkem maksab …, mille …', 'Ma olen nõus …, kui sina …', 'Kompromiss oleks …'], ['Aga mina tahaksin …', 'See on liiga kallis, sest …', 'Kas me ei võiks …?']), 'Tulemus: teie ühine plaan (sihtkoht, sõiduk, ööbimine, summa) ja kompromiss; selle järgi kirjutad kodus kirja.'), { task: 'S03', main: true, level: 4 }),
      'Õpetaja kaart (reisikaaslane; kui õpilasel on pere, võib see olla tema enda pereliige). Ütle ainult seda, mida küsitakse. Varjatud info: sul on tegelikult ainult 80 eurot; sa ei taha telgis magada („selg valutab”); sa tahaksid näha mõnda muuseumi. Uudis keset vestlust: „Laupäeva õhtul on mu õe sünnipäev, pean kell kuus kodus olema!” Õnnestunud, kui õpilane võrdleb vähemalt kahte varianti hinnaga, pakub kompromissi („Ma olen nõus …, kui …”), kasutab vähemalt kolm kõrvallauset (kus, kuhu, mille …) ja te lepite kokku plaani, mis mahub 200 euro sisse. Lõpuks ütleb õpilane plaani 30 sekundiga: sihtkoht, sõiduk, ööbimine, summa ja kompromiss.'),
      extension(teach(tag(purpose(B.rolecards('036_t_more', 'Plaan B: tuleb torm', 'Reede õhtul tuli ilmateade: laupäeval on tugev tuul ja praamid ei pruugi sõita. Lepi viie minutiga kokku uus plaan.',
        'Olukord: teie plaan on valmis, aga reede õhtul lubatakse tormi.\nSinu eesmärk: uus sihtkoht või uus kuupäev, mis maksab sama palju või vähem, ja teade majutusele.\nPiirang: aega on viis minutit, siis sulgeb külalistemaja vastuvõtu.',
        'Õpetaja kaart: reisikaaslane, kes on väga närvis, ja külalistemaja tingimused.',
        ['Kui praam ei sõida, siis …', 'Meil on varuks …', 'Kas broneeringu saab tühistada …?'], ['Mis saab meie rahast?', 'Ma ei taha kodus istuda!', 'Tasuta tühistamine kehtib …']), 'Plaan B näitab, kas sinu plaan peab vastu ka siis, kui midagi muutub.'), { task: 'S05', level: 4 }),
      'Kui aega jääb (12 min). Sina oled kõigepealt närvis reisikaaslane („Kõik on rikutud!”), siis külalistemaja perenaine telefonis. Külalistemaja tingimus: tasuta tühistamine kuni 24 tundi enne saabumist, hiljem 50 % hinnast. Õnnestunud, kui õpilane pakub uue sihtkoha või uue kuupäeva, ütleb, mis saab rahast, ja tühistab või muudab broneeringu viisakalt.'), 12),
      tag(exitCheck(purpose(B.gaps('036_t_exit', 'Kontrolli end: kolm kõrvallauset.', 'Kirjuta lünka sobiv sõna: kus, kuhu, kust, mille, kellega, kelle juures …', [
        'Tartu on linn, [kuhu] ma tahan sel suvel kindlasti sõita.',
        'See on sõber, [kellega] ma käisin eelmisel aastal Riias.',
        'Vali majutus, [mille] hind on alla saja euro.',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas kõrvallause sõna on õiges käändes.')), {}),
      purpose(B.selfcheck('036_t_self', ['Ma räägin oma reisist ja sellest, kuidas ma reisi planeerin.', 'Ma leian tekstist reisi planeerimise faktid: praam, telkimiskoht, metsamaja, ravikindlustuskaart.', 'Ma kirjeldan kohti kõrvallausega: koht, kus …; linn, kuhu …; telk, mille …', 'Ma lepin reisikaaslasega kokku plaani ja pakun kompromissi.'], 'Plaan valmis', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('036_t_letter', 'Kodus: kiri reisikaaslasele.', 'Kirjuta kodus 140–160 sõna: kuhu te sõidate, millega, kus ööbite, kui palju see maksab ja mis on teie kompromiss. Põhjenda vähemalt kolme otsust ja kasuta vähemalt kolme kõrvallauset (kus, kuhu, mille, kellega …).', 'Tere!', 'Kohtumiseni!\n(sinu nimi)', [140, 160]), 'Reisikaaslane loeb kirja ja teab täpselt, mida kaasa võtta ja kui palju raha vaja on.')), { task: 'W03', level: 3 }),
      tag(homeTask(purpose(B.speaking('036_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: minu parim nädalavahetus Eestis või naabermaal — kuhu ja miks.', [
        'Mis koht see on ja mis seal on?',
        'Kellega sa sinna sõidaksid ja kui palju see maksaks?',
      ], [60, 120]), 'Õpetaja kuulab sinu plaani ja ütleb, kas kõrvallaused on õiged.')), { task: 'S15' }),
      homework('036_t_homework', ['1. Kiri reisikaaslasele, 140–160 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-037': {
    title: 'Lend tühistati, kohver hilines — mis sulle kuulub?',
    phases: grammar('Keel: kaudne kõneviis minevikus — lend olevat tühistatud, kohver olevat jäänud · viisakas nõue: Palun hüvitage …, Kas oleks võimalik …?'),
    format: 'infogap',
    topic: 'money',
    canDo: 'Ma räägin lennufirma teenindajaga ja nõuan viisakalt hüvitist, saan kuuldust aru, mis reisil juhtus, loen, mis mulle Euroopa Liidu reeglite järgi kuulub, edastan teenindaja sõnu kaudse kõneviisiga (lend olevat tühistatud) ja kirjutan kaebuse.',
    teacherPage: {
      goal: 'Ученик узнаёт права пассажира (отмена, задержка, багаж), передаёт слова сотрудника формой olevat + -tud / -nud и у стойки авиакомпании добивается положенного.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 3 — правило и 4 пропуска письма; станция 4 — карточки прав и разговор у стойки без второго препятствия. Голосовое (станция 2) — один раз, 3 пропуска.',
      hook: '«На табло у твоего рейса слово „Tühistatud“ (отменён). Что ты делаешь в первые пять минут: идёшь к стойке, звонишь, сам ищешь новый рейс или пишешь другу? Выбери и скажи почему.» Ответьте сами, потом ученик.',
      plan: [
        '0–3: крючок — рейс отменён, ученик выбирает сразу',
        '3–10: станция 1 — разговор: моя самая неудачная поездка',
        '10–25: станция 2 — слова (2 мин), прогноз «Положены ли подруге деньги?», голосовое дважды, 6 пропусков',
        '25–37: станция 3 — заметить «olevat tühistatud» в голосовом → правило → жалоба подруги: 8 пропусков с выбором (R3)',
        '37–52: станция 4 — 4 карточки прав пассажира, разговор у стойки (у учителя скрытая причина и ваучер), план своей жалобы',
        '52–64: «Kui aega jääb» — квартира в Риге не как на фото: звонок хозяину',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: жалоба авиакомпании, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Карточки: Регламент ЕС 261/2004 — europa.eu «Lennureisijate õigused» (компенсация 250 / 400 / 600 € по расстоянию: до 1500 км, 1500–3500 км, дальше; при отмене менее чем за 14 дней и при опоздании на 3 часа и больше; при чрезвычайных обстоятельствах компенсации нет, но еда и гостиница остаются; багаж: повреждение — письменно в течение 7 дней, задержка — 21 дня, ответственность до ≈ 1300 €); TTJA «Lennureisija õigused» (2025, споры — комиссия по потребительским спорам); ERR 13.06.2026 и Европарламент 07.07.2026: реформа сохраняет порог 3 часа и суммы 250–600 €, новые правила — со второй половины 2027 г.; Европейский потребительский центр в Эстонии помогает бесплатно при трансграничных жалобах, сначала нужна письменная жалоба продавцу (europa.eu, ECC-Net). Таллин–Берлин ≈ 1040 км → 250 €. Наталья, её рейс и квартира в Риге — учебные.',
      groups: 'Станция 1 — в парах. Голосовое — каждый сам, сверка в паре. Станция 4 (инфопробел): у одного карточка пассажира, у другого — карточка сотрудника (ваша); потом смена с другой ситуацией (багаж). В 1:1 сотрудник — вы.',
      errors: [
        '«lend olevat tühistanud» → «lend olevat tühistatud» (lendu tühistati — кто-то отменил: -tud; olevat hilinenud — сам: -nud).',
        '«Teenindaja ütles, et lend olevat tühistatud» — можно; но факт, который ты сам видел, — без -vat: «Tablool oli kirjas …».',
        '«Ma tahan raha!» → «Palun hüvitage mulle …» / «Kas oleks võimalik …?» (вежливое требование).',
        '«hüvitis 250 eurot eest» → «hüvitis 250 eurot» / «250 euro suurune hüvitis».',
      ],
      notes: [
        'Формат — информационный пробел: у ученика — его ситуация и права (карточки), у вас — то, чего он не знает: настоящая причина отмены (нехватка экипажа — не чрезвычайное обстоятельство) и предложение ваучера на 100 € вместо 250 € денег. Ученику, который не летает: та же ситуация с автобусом в Ригу или с бронированием жилья (расширение). Пенсионеру — поездка к родственникам; маме — с ребёнком (еда и гостиница особенно важны).',
        'Не обещайте ученику денег: в каждом случае решает компания, потом TTJA или потребительский центр. Учим порядок: сначала письменно компании, хранить чеки, сроки 7 / 21 день.',
        'Обратная связь, 2–3 цели: olevat + -tud / -nud; вежливое требование; точные факты (дата, сумма, номер брони). Поезд и права пассажира поезда были в модуле 4 — здесь самолёт и багаж.',
      ],
    },
    discover: [
      station(B.text('037_d_hook', 'Tablool on sõna „Tühistatud”', 'Lennujaamas on tablool sinu lennu juures sõna „Tühistatud”. Mida teed esimese viie minuti jooksul: lähed lennufirma letti, helistad, otsid uue lennu või kirjutad sõbrale? Vali üks ja ütle kohe, miks.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('037_d_talk', 'Minu reisimure.', 'Vasta ja too näide oma elust.', [
        'Mis on sinu reisil kõige halvemini läinud: hilinemine, kadunud asi, halb majutus või midagi muud?',
        'Kellelt sa abi küsisid ja kas see aitas?',
        'Mida sa teeksid täna teisiti, kui sama asi juhtuks homme?',
        'Mis sa arvad, kas reisijad teavad oma õigusi?',
      ], [150, 210], ['Kord juhtus nii, et …', 'Ma pöördusin …', 'Täna ma …']), 'Sinu enda kogemus näitab, mida sa juba oskad nõuda ja mida veel mitte.'), { task: 'S02', fluency: true }),
      'Üks-ühele: räägi ka ise üks reisimure. Ära paranda. Kui õpilane ei ole lennanud: „Kas sinu buss, rong või broneering on kunagi ära jäänud? Mis siis juhtus?”')),
      station(tag(B.vocab('037_d_vocab', 'Enne kuulamist: sõnad.', ['tühistama — отменять', 'hilinema — опаздывать', 'hüvitis — компенсация', 'pagas — багаж', 'kviitung — чек', 'nõudma — требовать', 'erakorraline — чрезвычайный', 'ümber broneerima — перебронировать', 'kaebus — жалоба', 'teenindaja — сотрудник обслуживания']), { topic: ['hüvitis', 'pagas', 'kaebus', 'teenindaja'] }), 2, 15),
      teach(tag(purpose(B.listening('037_d_voice', 'Sõbranna häälsõnum lennujaamast.', 'Enne kuulamist arva: kas sõbranna saab raha tagasi? Siis kuula kaks korda ja kirjuta lünka 1–2 sõna.', [
        'Tere, siin Natalja! Ma olen ikka veel Tallinna lennujaamas ja ma olen väga väsinud.',
        'Meie lend Berliini tühistati. Teenindaja ütles, et lend olevat tühistatud tormi tõttu. Aga tablool oli põhjuseks kirjas „tehnilistel põhjustel” ja Berliinis paistab täna päike.',
        'Mulle pakuti uut lendu homme hommikul kell seitse. Söögi jaoks anti talong kaheteistkümne euro eest, aga hotelli pidin ise otsima. Hotell maksis üheksakümmend eurot, kviitung on mul alles.',
        'Kõrval istub pere väikese lapsega ja ka neile ei ole keegi midagi seletanud. Ma ei saa aru, miks infot nii vähe antakse.',
        'Ja veel: teenindaja sõnul olevat minu kohver juba lennukisse laaditud ja ma saavat selle kätte alles Berliinis. Mul ei ole isegi hambaharja!',
        'Kolleeg ütles, et mulle kuuluvat hüvitis, aga ma ei tea, kas see on tõsi. Helista mulle, kui saad. Aitäh!',
      ], [
        'Natalja lend pidi täna õhtul Tallinnast otse minema [Berliini].',
        'Lennujaama teenindaja sõnul olevat lend tühistatud [tormi] tõttu.',
        'Lennujaama tablool oli tühistamise põhjuseks hoopis kirjas „[tehnilistel] põhjustel”.',
        'Lennufirma pakutud uus lend väljub järgmisel hommikul kell [seitse|7].',
        'Hotelli pidi Natalja ise otsima ja maksis selle eest [üheksakümmend|90] eurot.',
        'Teenindaja sõnul saab Natalja oma kohvri kätte alles [Berliinis].',
      ], 'g_read'), 'Märkmed näitavad, mis juhtus ja mida Natalja võib nõuda.'), { task: 'L03' }),
      'Kuulamise tsükkel: 1) prognoos: „Kas Natalja saab raha tagasi?”; 2) esimene kuulamine — „Mis on kaks probleemi?” (lend ja kohver); 3) teine kuulamine — lüngad; 4) detail: „Mis on kahtlane?” (torm ja päike); 5) üks lause: „Mida sina temana teeksid?”'),
    ],
    practice: [
      station(B.notice('037_p_notice', 'Märka: lend olevat tühistatud', [
        'Häälsõnumist: lend **olevat tühistatud** tormi tõttu · kohver **olevat** juba lennukisse **laaditud** · mulle **kuuluvat** hüvitis',
        'Tund 32: olevikus **-vat** — ta **saavat** kohvri kätte, mulle **kuuluvat** hüvitis. Nüüd **minevik**: **olevat** + **-nud** (asi juhtus ise): lend **olevat hilinenud** · kohver **olevat jäänud** Riiga.',
        '**olevat** + **-tud** (keegi tegi seda): lend **olevat tühistatud** · kohver **olevat laaditud** · broneering **olevat kinnitatud**. Eitus: **ei olevat** teatatud.',
        'Mida nägid ise, ütle tavaliselt: Tablool **oli** kirjas … Mida keegi väitis ja sina kahtled, ütle -vat-vormiga. Allikas aitab: **teenindaja sõnul**, **lennufirma väitel**.',
        'Viisakas nõue: **Palun hüvitage** mulle … · **Palun teatage**, millal … · **Kas oleks võimalik** …? · **Ootan teie vastust** kahe nädala jooksul.',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.cloze('037_p_letter', 'Natalja kaebus lennufirmale.', 'Natalja kirjutab lennufirmale kaebuse ja palub, et sa selle üle vaataksid. Vali iga lünga neljast vormist see, mis sobib.', 'Kaebus: tühistatud lend Tallinn–Berliin', [
        'Lugupeetud klienditeenindus!',
        '12. märtsil {*tühistati|tühistab|tühistatud|tühistama} minu lend Tallinnast Berliini, mis pidi väljuma kell 18.40. Teie teenindaja sõnul {*olevat|oleks|olema|olles} lend tühistatud tormi tõttu.',
        'Tablool oli aga põhjuseks kirjas „tehnilistel põhjustel” ja Berliini ilmateate järgi {*ei olnud|ei olevat|ei oleks|ei olema} seal tormi.',
        'Mulle {*pakuti|pakkuvat|pakuks|pakkuma} uut lendu järgmisel hommikul. Hotelli pidin otsima ise, kuigi teie töötaja väitel {*ei olevat|ei oleks|ei olema|ei olles} vabu tube.',
        'Palun {*hüvitage|hüvitate|hüvitama|hüvitaks} mulle hotelli kulu 90 eurot; kviitung on lisatud. Lisaks palun maksta Euroopa Liidu määruse järgi 250 euro suurune hüvitis.',
        'Kas {*oleks|olevat|olema|olnud} võimalik hüvitis kanda minu pangakontole? Ootan teie vastust {*kahe nädala jooksul|kaks nädalat jooksul|kahe nädala jooksu|kahele nädalale}.',
        'Lugupidamisega\nNatalja Ivanova',
      ].join('\n\n'), 'g_notice'), 'Õiged vormid teevad kaebusest kirja, millele lennufirma peab vastama.'), { task: 'R03', harno: 'R3' }),
      'Pärast iga lünka küsi: „Kas Natalja teab seda ise või keegi väitis?” Lünk 3 on fakt (ilmateade) — seepärast „ei olnud”, mitte „ei olevat”. Lünk 6: kas tingiv on siin palve (oleks võimalik).'),
      B.know('037_p_know', ['Euroopa Liit uuendab lennureisijate õigusi. 2026. aasta kokkuleppe järgi jääb hüvitis tühistatud või vähemalt kolm tundi hilinenud lennu eest endiseks: 250–600 eurot, sõltuvalt lennu pikkusest. Väike kott, mis mahub istme alla, peab olema piletihinnas. Uued reeglid hakkavad kehtima arvatavasti 2027. aasta teisel poolel.'], 'ERR, „EL-i lennureisijate õiguste reform jätab hilinemishüvitise paika” (13.06.2026); Euroopa Parlament (07.07.2026)', 'Kas teadsid? Uued reeglid alates 2027'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('037_t_rights', 'Mis sulle kuulub?', 'Loe kaarte ja märgi, mis kehtib sinu olukorras.', [
        ['Lend tühistati', ['Lennufirma pakub uut lendu või raha tagasi.', 'Ootamise ajal: söök, vajadusel hotell ja sõit hotelli.', 'Kui teatati vähem kui 14 päeva ette: hüvitis 250, 400 või 600 eurot.', 'Erakorraline asjaolu (torm): hüvitist ei ole, aga söök ja hotell jäävad.'], []],
        ['Lend hilines', ['Kohale vähemalt 3 tundi hiljem: sama hüvitis.', 'Kuni 1500 km: 250 €, 1500–3500 km: 400 €, pikemal lennul: 600 €.'], []],
        ['Kohver hilines või kadus', ['Täida lennujaamas kohe kahjuakt.', 'Hilinenud kohver: kulud kirjalikult 21 päeva jooksul.', 'Kahjustatud kohver: teata 7 päeva jooksul.', 'Hoia alles kõik kviitungid.'], []],
        ['Kui ei vastata', ['Kõigepealt kirjalik kaebus firmale.', 'Siis Tarbijakaitse ja Tehnilise Järelevalve Amet.', 'Mure teises ELi riigis: Euroopa Tarbijakeskus aitab tasuta.'], []],
      ], '2'), 'Kaardid näitavad, mida sa võid nõuda, enne kui lennufirma seda ise ütleb.'), { task: 'R07' }), 4, 15, { final: 'complain' }),
      teach(tag(purpose(B.rolecards('037_t_desk', 'Lennufirma letis.', 'Räägi teenindajaga, saa teada lennu tühistamise tegelik põhjus ja nõua viisakalt kõike, mis sulle kuulub.',
        'Olukord: sinu lend Tallinn–Berliin (umbes 1040 km) tühistati päev enne väljumist. Ööbisid hotellis (90 €). Kohver jõudis kohale kaks päeva hiljem; ostsid hambaharja, laadija ja riideid 45 euro eest.\nSinu eesmärk: tead tühistamise põhjust ja oled kokku leppinud, mida lennufirma maksab.\nPiirang: teenindajal on oma info, mida ta kohe ei ütle.',
        'Teenindaja kaart on õpetajal: tühistamise põhjus ja firma pakkumine.',
        ['Teie kolleegi sõnul olevat lend tühistatud …, aga …', 'Euroopa Liidu reeglite järgi kuulub mulle …', 'Palun hüvitage mulle …', 'Kas oleks võimalik …?'], ['Vabandust, aga …', 'Me võime pakkuda …', 'Selleks on vaja …']), 'Tulemus: sa tead, mida firma maksab, ja sinu kaebuse plaan on valmis.'), { task: 'S09', main: true, level: 4 }),
      'Õpetaja kaart (lennufirma teenindaja). Ütle ainult seda, mida küsitakse. Varjatud info: tegelik põhjus oli meeskonna puudus (see ei ole erakorraline asjaolu); hotelli kulu makstakse kviitungi alusel; kohvri kulud tuleb esitada kirjalikult veebivormil 21 päeva jooksul. Takistused ükshaaval: 1) „Põhjus oli torm, kahjuks hüvitist ei ole.” 2) „Me võime pakkuda 100-eurose kupongi järgmiseks lennuks.” 3) „Kas teil kahjuakt on olemas?” Õnnestunud, kui õpilane kahtleb põhjuses (-vat-vormiga: „Teie kolleegi sõnul olevat …”), nimetab oma õigused (250 €, hotell, kohvri kulud), keeldub viisakalt kupongist või küsib raha, kasutab vähemalt kaks viisakat nõuet ja teab lõpuks, kuidas kirjalik kaebus esitada.'),
      teach(tag(purpose(B.planning('037_t_plan', 'Minu kaebuse plaan.', 'Kirjuta plaan ja kaks esimest lauset. Kirja kirjutad kodus lõpuni.', [
        'Mis juhtus: kuupäev, lend või broneering, põhjus (mida väideti ja mida sa nägid)?',
        'Mida sa nõuad: summa, kulud, kviitungid?',
        'Kaks esimest lauset (Kirjutan seoses …).',
      ], 3), 'Plaaniga on kodus kerge kirjutada kaebust, millele firma vastab.'), { task: 'W02', level: 3 }),
      'Kontrolli kuupäeva, summasid ja seda, kas õpilane eristab fakti (Tablool oli …) ja väidet (Teenindaja sõnul olevat …).'),
      extension(teach(tag(purpose(B.rolecards('037_t_more', 'Rollimäng: korter ei ole nagu pildil', 'Helista broneerimisplatvormi klienditeenindusse ja lepi kokku lahendus: teine korter, hinnaalandus või raha tagasi.',
        'Olukord: broneerisid platvormi kaudu kaheks ööks korteri Riias. Pildil oli rõdu ja uus vannituba; tegelikult rõdu ei ole ja soe vesi ei tööta.\nSinu eesmärk: lahendus veel täna õhtuks.\nPiirang: omanik ei vasta telefonile ja klienditeenindaja kuulis temalt, et kõik on korras.',
        'Klienditeenindaja kaart on õpetajal: omaniku väited ja platvormi pakkumine.',
        ['Kuulutuse järgi pidi siin olema …', 'Tegelikult …', 'Ma tegin fotod, kui saabusin.', 'Palun …, muidu pöördun platvormi poole.'], ['Omaniku sõnul olevat …', 'Ma saan pakkuda …', 'Kas teil on fotod?']), 'Kui majutus ei vasta kirjeldusele, saad lahenduse kohe, mitte nädal hiljem kirjaga.'), { task: 'S05', level: 4 }),
      'Kui aega jääb (12 min). Sina oled platvormi klienditeenindaja. Omaniku väited (edasta neid -vat-vormiga): „Omaniku sõnul olevat rõdu remondis”; „Soe vesi töötavat, tuleb kaua oodata.” Pakkumine pärast kindlat nõuet ja fotode mainimist: 30 % hinnast tagasi või teine korter samas majas. Õnnestunud, kui õpilane võrdleb kuulutust ja tegelikkust, mainib fotosid, kasutab viisakat nõuet ja lepib kokku ühe lahenduse ning tähtaja.'), 12),
      tag(exitCheck(purpose(B.gaps('037_t_exit', 'Kontrolli end: kaks väidet ja üks nõue.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Naabri sõnul olevat tema kohver Roomas [kadunud]. (kaduma)',
        'Hotelli väitel olevat meie broneering juba eile [tühistatud]. (tühistama)',
        'Palun [hüvitage] mulle pileti hind kahe nädala jooksul. (hüvitama)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas mineviku -vat-vorm ja viisakas nõue on käes.')), {}),
      purpose(B.selfcheck('037_t_self', ['Ma räägin oma reisimurest ja sellest, kuidas see lahenes.', 'Ma saan häälsõnumist aru, mis reisil juhtus, ja leian kaartidelt, mis mulle kuulub.', 'Ma edastan teise väidet mineviku kaudse kõneviisiga (olevat tühistatud, olevat jäänud).', 'Ma nõuan teenindajalt ja kirjas viisakalt hüvitist.'], 'Õigus nõutud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      teach(tag(homeTask(purpose(B.letter('037_t_complaint', 'Kodus: kaebus lennufirmale.', 'Kirjuta kodus 140–160 sõna: mis juhtus (kuupäev, lend), mida teenindaja väitis ja mida sina nägid, mis sulle kuulub ja mida nõuad (summa, tähtaeg). Kasuta vähemalt kahte -vat-vormi ja kahte viisakat nõuet. Kui sa ei lenda, kirjuta bussifirmale või majutuse platvormile.', 'Lugupeetud klienditeenindus!', 'Lugupidamisega\n(sinu nimi)', [140, 160]), 'Lennufirma loeb sinu kaebust ja peab sellele vastama.')), { task: 'W13', main: true }),
      'Kodutöö. Järgmises tunnis loe kaebus kui lennufirma teenindaja ja vasta suuliselt („Vabandame, aga …”). Tagasiside: fakt ja väide eraldi, summad ja kuupäevad, viisakas nõue.'),
      tag(homeTask(purpose(B.speaking('037_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: mida sa teed, kui sinu lend või buss jääb ära — kolm sammu.', [
        'Mis on sinu esimene samm ja kellega sa räägid?',
        'Mida sa alles hoiad ja mida nõuad?',
      ], [60, 120]), 'Õpetaja kuulab sinu kolme sammu ja ütleb, kas midagi jäi puudu.')), { task: 'S15' }),
      homework('037_t_homework', ['1. Kaebus lennufirmale, 140–160 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-038': {
    title: 'Kingad jalast ja vaikus bussis — kas eestlane on tõesti kinnine?',
    phases: grammar('Keel: ettevaatlik üldistus — sageli, enamasti, minu kogemuses, sõltub sellest, kas …; peetakse milleks (kinniseks, viisakaks)'),
    format: 'game',
    topic: 'neighbours',
    canDo: 'Ma räägin Eesti ja teiste maade kommetest ettevaatlikult (sageli, enamasti, minu kogemuses, sõltub), saan raadiost aru, kuidas kultuurišokk käib, ja seletan uustulnukale ühe kombe tähendust konkreetse näitega.',
    teacherPage: {
      goal: 'Ученик в игре проверяет представления об обычаях, слушает о культурном шоке, говорит о различиях осторожно (sageli, minu kogemuses, peetakse) и объясняет обычай новичку.',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: игра — 3 утверждения без разговора; станция 3 — правило и 4 предложения; станция 4 — две карточки обычаев вместо четырёх. Радио (станция 2) — один раз, 4 утверждения.',
      hook: '«Правда или миф? Три утверждения: 1) в гостях в Эстонии снимают обувь; 2) эстонец никогда не разговаривает в автобусе; 3) приглашение в сауну — знак доверия. Ответь сразу: правда, миф или „зависит“.» Очки: 1 за ответ, ещё 1 за причину. Ответа не давайте — его дадут радио и карточки обычаев.',
      plan: [
        '0–3: крючок — игра «Õige või müüt?», три утверждения, ученик отвечает сразу',
        '3–10: станция 1 — разговор: что меня удивило в Эстонии или за границей',
        '10–25: станция 2 — слова (2 мин), прогноз «Что самое трудное в первый год?», радио дважды, 7 утверждений верно / неверно (L4), «Kas teadsid?» о кривой культурного шока',
        '25–37: станция 3 — заметить «peetakse … kinnisteks», «minu kogemuses» → правило → 7 резких фраз сделать осторожными',
        '37–52: станция 4 — карточки обычаев, игра: объяснить новому коллеге 4 ситуации (очки), итог',
        '52–64: «Kui aega jääb» — мини-дебаты: должен ли новичок приспосабливаться',
        '64–72: проверка на выходе, «Ma oskan …», итог очков',
        '72–80: домашнее задание: письмо другу, который переезжает в Эстонию, запись 1 минуты, слова',
        '80–90: запас',
      ],
      sources: 'Радио и «Kas teadsid?»: Kalervo Oberg, «Cultural Shock: Adjustment to New Cultural Environments», Practical Anthropology 7 (1960) — четыре фазы (медовый месяц, кризис, привыкание, адаптация); обратный культурный шок при возвращении — Gullahorn & Gullahorn 1963 (W-кривая). Карточки обычаев: Haapsalu linn, «Eesti eluga kohanemise spikker» (2026: уличную обувь снимают дома и в гостях); Visit Estonia, «The stranger sides of Estonian culture»; Rahvakultuuri Keskus — Võromaa suitsusaunakombestik в списке ЮНЕСКО с 2014 г. Тамара, Март и коллега-новичок — учебные; эти обычаи — частые, не правило для всех, это и есть тема урока.',
      groups: 'Игра — все сразу, вы ведёте счёт. Радио — каждый сам, сверка в паре. Станция 4: один — новичок с вашими вопросами, другой объясняет; за каждое объяснение с осторожным обобщением и примером — 2 очка. В 1:1 новичок — вы.',
      errors: [
        '«Minu kogemuses eestlased on abivalmid» → «Minu kogemuses on eestlased abivalmid» (после обстоятельства глагол вторым).',
        '«Eestlasi peetakse kinnised» → «… kinnisteks» (pidama keda milleks — saav, мн. ч. -teks).',
        '«Kõik eestlased …» → «Paljud eestlased … / Eestlased on sageli …» (избегать «все» и «никогда»).',
        '«See sõltub, kas …» → «See sõltub sellest, kas …».',
      ],
      notes: [
        'Формат — игра с очками: крючок, радио (кто больше угадал в прогнозе) и карточки ситуаций. Проигравший рассказывает один обычай своей страны. Не оценивайте культуры как «лучше / хуже»; цель — осторожное обобщение и пример из своей жизни. Ученику без эстонских соседей: коллеги, учителя ребёнка, врач, продавцы.',
        'Тема чувствительная: если ученик говорит «эстонцы нас не любят», не спорьте и не соглашайтесь — попросите конкретный случай и осторожную формулировку («Minu kogemuses …, aga see sõltub …»). Для пенсионера, который давно живёт в Эстонии, — роль «старожила», который объясняет новичку.',
        'Обратная связь, 2–3 цели: глагол вторым после «Minu kogemuses / Võrreldes …»; peetakse + saav; пример после обобщения.',
      ],
    },
    discover: [
      station(B.text('038_d_hook', 'Mäng: õige või müüt?', 'Kolm väidet: 1) Eestis võetakse külas kingad jalast. 2) Eestlane ei räägi bussis kunagi. 3) Saunakutse on usalduse märk. Ütle iga väite kohta kohe: õige, müüt või sõltub. Iga vastus on üks punkt, põhjus veel üks.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('038_d_talk', 'Mis mind üllatas.', 'Vasta ja too näide oma elust.', [
        'Mis sind Eestis või välismaal esimesel aastal kõige rohkem üllatas?',
        'Milline komme riigist, kus sa üles kasvasid, võiks eestlast üllatada?',
        'Kas sa oled kunagi kogemata kedagi solvanud või ise solvunud? Kas sul oli julgust küsida, mis juhtus?',
      ], [150, 210], ['Mind üllatas, et …', 'Meil on kombeks …', 'Hiljem sain aru, et …']), 'Sinu enda kogemus on tunni mängu esimene kaart.'), { task: 'S14', fluency: true }),
      'Üks-ühele: räägi ka ise üks lugu, kus sind üllatas mõni komme. Ära paranda ega vaidle. Kui õpilane elab Eestis kaua: „Mida sa seletaksid inimesele, kes kolis Eestisse eile?”')),
      station(tag(B.vocab('038_d_vocab', 'Enne kuulamist: sõnad.', ['komme — обычай', 'kultuurišokk — культурный шок', 'kohanema — приспосабливаться', 'harjuma — привыкать', 'üldistus — обобщение', 'kinnine — замкнутый', 'viisakas — вежливый', 'solvama — обижать', 'uustulnuk — новичок', 'usaldus — доверие']), { topic: ['komme', 'kohanema', 'üldistus', 'kultuurišokk', 'uustulnuk'] }), 2, 15),
      teach(tag(purpose(B.examListen('038_d_radio', 'Raadio: kuidas kultuurišokk käib.', 'Enne kuulamist arva: mis on uues riigis esimesel aastal kõige raskem? Siis kuula kaks korda ja otsusta, kas väide on õige või vale.', 'truefalse', [
        'Saatejuht: Tere! Täna räägime kultuurišokist. Antropoloog Kalervo Oberg kirjeldas juba tuhande üheksasaja kuuekümnendal aastal, et uues riigis käib inimene läbi mitu etappi: alguses on kõik huvitav, siis tuleb kriis ja lõpuks harjumine. Stuudios on Tamara, kes kolis seitse aastat tagasi Moldovast Tartusse, ja Mart, kes elas viis aastat Hispaanias. Tamara, kuidas sinu esimene aasta läks?',
        'Tamara: Esimestel kuudel meeldis mulle kõik: vanalinn, metsad, see, et kõik toimib. Siis tuli talv. Bussis oli vaikne, kolleegid ei küsinud kunagi mu pere kohta ja ma tundsin end väga üksikuna. Mõtlesin, et eestlased on kinnised ja ma ei meeldi neile.',
        'Saatejuht: Ja nüüd?',
        'Tamara: Nüüd ma arvan, et vaikus bussis ei ole ebaviisakus, vaid austus teise inimese ruumi vastu. Minu kogemuses on eestlased väga abivalmid, kui neilt midagi küsida. Teisel talvel kutsus kolleeg mind oma pere suvilasse sauna. Ma sain aru, et see on usalduse märk.',
        'Saatejuht: Mart, sina olid teisel pool.',
        'Mart: Jah. Hispaanias tulin alati kokkulepitud ajal ja ootasin pool tundi üksi. Kõige huvitavam oli aga tagasitulek: Tallinnas tundusid eestlased mulle esimestel nädalatel külmad. Seda nimetatakse vastupidiseks kultuurišokiks.',
        'Saatejuht: Mida te soovitaksite uustulnukale?',
        'Tamara: Ära tee ühe kogemuse põhjal üldistusi. Küsi. See sõltub väga palju inimesest ja kohast.',
        'Mart: Ja ära arva, et sinu oma komme on ainus õige. Eestlasi peetakse sageli kinnisteks, aga tuttavaks saades on nad väga soojad.',
      ], [
        ['Esimestel kuudel tundus Tamarale Eestis kõik väga raske.', false],
        ['Talvel tundis Tamara end üksikuna, sest kolleegid ei küsinud tema pere kohta.', true],
        ['Tamara arvab nüüd, et vaikus bussis tähendab ebaviisakust.', false],
        ['Kolleegi saunakutse oli Tamara jaoks usalduse märk.', true],
        ['Eestisse tagasi tulles tundusid eestlased Mardile alguses külmad.', true],
      ], 'g_read'), 'Kuuled, et kultuurišokk on tavaline ja läheb üle; see aitab sul oma kogemust mõista.'), { voice: 'interview', task: 'L05', harno: 'L4' }),
      'Kuulamise tsükkel: 1) prognoos; 2) esimene kuulamine — „Mis on kaks kultuurišokki?” (Eestisse tulles ja koju tagasi tulles); 3) teine kuulamine — õige või vale; 4) detail: „Miks oli saunakutse tähtis?”; 5) üks lause: „Mis etapis oled sina?” Mängupunkt igale õigele prognoosile.'),
      B.know('038_d_know', ['Kultuurišokil on uuringute järgi tavaliselt neli etappi: mesinädalad, kriis, harjumine ja kohanemine. Kriis tuleb sageli mõne kuu pärast, kui uudsus on kadunud ja igapäevased mured on alles. Koju naastes võib tulla vastupidine šokk: oma maa tundub äkki võõras.'], 'K. Oberg, Practical Anthropology (1960); J. ja J. Gullahorn (1963)', 'Kas teadsid? Kultuurišoki etapid'),
    ],
    practice: [
      station(B.notice('038_p_notice', 'Märka: sageli, minu kogemuses, peetakse milleks', [
        'Raadiost: Eestlasi **peetakse sageli kinnisteks** · **Minu kogemuses on** eestlased väga abivalmid · **See sõltub** väga palju inimesest ja kohast',
        '**Üldistus** (kõik, alati, mitte kunagi) solvab kergesti. **Pehmenda**: sageli, tihti, enamasti, tavaliselt, mõnikord · **paljud** (mitte kõik) · mulle tundub, et …',
        '**Oma kogemus**: **Minu kogemuses on** … · **Võrreldes** Hispaaniaga **tullakse** Eestis … Lause algab nende sõnadega → **tegusõna on teisel kohal**.',
        '**pidama** keda **milleks** (saav): Eestlasi **peetakse kinnisteks**. Hilinemist **peetakse ebaviisakaks**. Teda **peetakse** heaks naabriks.',
        '**sõltuma**: See **sõltub** inimesest. · See **sõltub sellest, kas** … (tund 31: sõltuma millest)',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.transformation('038_p_soft', 'Ütle ettevaatlikumalt.', 'Uus kolleeg räägib kommetest liiga kindlalt. Ütle iga mõte ettevaatlikumalt, kasutades antud sõnu.', [
        ['Kõik ütlevad, et eestlased on kinnised.', 'peetakse', 'Eestlasi peetakse kinnisteks.|Eestlasi peetakse sageli kinnisteks.'],
        ['Kõik arvavad, et hilinemine on ebaviisakas.', 'peetakse', 'Hilinemist peetakse ebaviisakaks.|Hilinemist peetakse sageli ebaviisakaks.'],
        ['Eestlased tulevad alati täpselt õigel ajal.', 'enamasti', 'Eestlased tulevad enamasti õigel ajal.|Eestlased tulevad enamasti täpselt õigel ajal.|Enamasti tulevad eestlased õigel ajal.|Enamasti tulevad eestlased täpselt õigel ajal.'],
        ['Kõik eestlased käivad saunas.', 'paljud', 'Paljud eestlased käivad saunas.'],
        ['Eestlased on väga abivalmid. (Ütle oma kogemusena.)', 'minu kogemuses', 'Minu kogemuses on eestlased väga abivalmid.'],
        ['Lõunamaal hilinetakse rohkem. (Ütle võrdlusena.)', 'võrreldes Eestiga', 'Võrreldes Eestiga hilinetakse lõunamaal rohkem.|Lõunamaal hilinetakse võrreldes Eestiga rohkem.'],
        ['Saunas ei räägita kunagi tööst.', 'harva', 'Saunas räägitakse tööst harva.|Saunas räägitakse harva tööst.|Tööst räägitakse saunas harva.'],
        ['Kas külas tuleb kingad jalast võtta? Vaata, mida pererahvas teeb.', 'see sõltub sellest, kas', 'See sõltub sellest, kas pererahvas võtab kingad jalast.|See sõltub sellest, kas pererahvas võtab ise kingad jalast.'],
      ], 'full', 'g_notice'), 'Ettevaatlik lause aitab kommetest rääkida nii, et keegi ei solvu.'), { task: 'G02' }),
      'Pärast iga lauset küsi: „Kas see on kõigi kohta tõsi?” ja „Kus on tegusõna?” Ridadel 5 ja 6 algab lause kõrvalisega (Minu kogemuses, Võrreldes Eestiga) → tegusõna teisel kohal. Mängupunkt õige sõnajärje eest.'),
    ],
    transfer: [
      station(tag(purpose(B.profiles('038_t_cards', 'Kommete kaardid.', 'Loe kaarte. Mängus seletad neid uuele kolleegile või naabrile, kes kolis Eestisse eile.', [
        ['Kodus ja külas', ['Õuejalanõud võetakse kodus ja külas tavaliselt jalast, ka siis, kui põrand on puhas.', 'Pererahvas pakub külalisele sageli sussid või paksud sokid.'], []],
        ['Aeg', ['Kokkulepitud ajast peetakse tööl ja külaskäigul enamasti täpselt kinni.', 'Kui jääd hiljaks, helista või kirjuta kohe ja ütle, millal sa jõuad.'], []],
        ['Saun', ['Saunakutset peetakse usalduse märgiks ja sellest keeldumine võib teist inimest kurvastada.', 'Võromaa suitsusauna komme on 2014. aastast UNESCO vaimse kultuuripärandi nimekirjas.'], []],
        ['Vestlus', ['Võõrastega räägitakse bussis ja poes vähem kui paljudes lõunamaades.', 'Vaikust ei peeta ebaviisakaks; tuttavaks saades räägitakse palju avatumalt.'], []],
      ], '2'), 'Kaardid annavad sulle faktid; näite toob sinu enda elu.'), { task: 'R01' }), 4, 15, { final: 'explain' }),
      teach(tag(purpose(B.rolecards('038_t_explain', 'Mäng: seleta uustulnukale.', 'Uustulnuk küsib neli küsimust. Seleta, mis on Eestis tavaline ja miks, too näide oma elust ja võrdle riigiga, mida sa hästi tead. Hea seletus annab kaks punkti.',
        'Olukord: sinu uus kolleeg või naaber kolis Eestisse eile ja ei saa paljust aru.\nSinu eesmärk: ta mõistab nelja kommet ja ei solvu ega solva kedagi.\nTingimus: iga seletus on ettevaatlik (sageli, minu kogemuses, sõltub) ja sellel on näide.',
        'Uustulnuka küsimused on õpetajal.',
        ['Eestis on sageli kombeks …', 'Minu kogemuses on …', 'Seda peetakse …', 'See sõltub sellest, kas …', 'Meil kodus on teisiti: …'], ['Miks nad …?', 'Kas see tähendab, et …?', 'Aga mis siis, kui …?']), 'Tulemus: uustulnuk saab kommetest aru ja sina oskad oma kogemust selgelt seletada.'), { task: 'S13', main: true, level: 4 }),
      'Õpetaja kaart (uustulnuk Diego Hispaaniast; kui õpilasele sobib, on see tema enda uus naaber). Küsimused ükshaaval: 1) „Naaber kutsus mind külla ja kõik võtsid kingad jalast. Kas ma tegin midagi valesti?” 2) „Kolleegid ei räägi lõunasöögi ajal peaaegu üldse. Kas nad on minu peale pahased?” 3) „Mind kutsuti laupäeval sauna. Mida see tähendab ja mida ma pean teadma?” 4) „Ma jäin koosolekule kümme minutit hiljaks ja juht oli vaikne. Mis juhtus?” Punktid: ettevaatlik üldistus (1), näide või võrdlus teise maaga (1). Õnnestunud, kui vähemalt 6 punkti ja vähemalt üks „peetakse …-ks” ning üks „Minu kogemuses on …”.'),
      extension(teach(tag(purpose(B.rolecards('038_t_more', 'Mini-väitlus: kas uustulnuk peab kohanema?', 'Lugege oma kaarti, öelge alguses oma arvamus ja arutage viis minutit. Jõudke lõpuks ühise seisukohani.',
        'Kaart A (poolt). Uustulnuk peaks kohalike kommetega kohanema. Argumendid: nii on lihtsam leida tööd ja sõpru; kombed näitavad austust; lapsed kohanevad niikuinii kiiresti. Lisa oma näide.',
        'Kaart B (vastu). Uustulnuk võib jääda iseendaks. Argumendid: oma kombed on osa inimese identiteedist; Eestis elab inimesi paljudest rahvustest; ka eestlased hindavad ausust ja vabadust. Lisa oma näide.',
        ['Minu kogemuses …', 'See sõltub sellest, kas …', 'Teisalt …'], ['Ma ei ole päris nõus, sest …', 'Millised sinu oskused aitavad …?', 'Kas võiksime leida kompromissi …?']), 'Väitlus näitab, et sama kommet võib näha kahte moodi, ja lõpuks leiate ühise seisukoha.'), { task: 'S17' }),
      'Kui aega jääb (12 min). Võta kaart, mida õpilane ei valinud. Ära hinda kultuure; küsi näiteid: „Kas sina oled midagi oma kombest Eestis maha jätnud? Mida mitte?” Lõpuks leppige kokku üks lause: „Meie arvates …”. Õnnestunud, kui õpilane toob kaks argumenti ja näite, kasutab vähemalt ühe ettevaatliku üldistuse ja reageerib sinu argumendile.'), 12),
      tag(exitCheck(purpose(B.gaps('038_t_exit', 'Kontrolli end: kolm ettevaatlikku lauset.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Eestlasi [peetakse] sageli vaikseks ja tagasihoidlikuks rahvaks, aga see ei ole alati tõsi. (pidama)',
        'Hilinemist peetakse paljudes Eesti kontorites ja koolides [ebaviisakaks]. (ebaviisakas)',
        'Minu kogemuses [on] meie maja naabrid alati väga abivalmid ja sõbralikud. (olema)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas ettevaatlik üldistus on käes.')), {}),
      purpose(B.selfcheck('038_t_self', ['Ma räägin, mis mind Eestis või välismaal üllatas.', 'Ma saan raadiost aru, kuidas kultuurišokk käib.', 'Ma räägin kommetest ettevaatlikult: sageli, enamasti, minu kogemuses, peetakse milleks.', 'Ma seletan uustulnukale kombe tähendust ja toon näite.'], 'Kombed seletatud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.letter('038_t_letter', 'Kodus: kiri sõbrale, kes kolib Eestisse.', 'Kirjuta kodus 140–160 sõna: kolm Eesti kommet näitega, üks asi, mis sind üllatas, ja üks komme, mille sõber võib kaasa tuua. Kasuta sõnu sageli, minu kogemuses ja peetakse.', 'Tere!', 'Ootan sind!\n(sinu nimi)', [140, 160]), 'Sinu sõber loeb kirja enne sõitu ja tunneb end esimesel nädalal kindlamalt.')), { task: 'W08', level: 3 }),
      tag(homeTask(purpose(B.speaking('038_t_home', 'Kodus: räägi 1 minut.', 'Salvesta 1 minut: üks komme sinu perest või kodukohast — mis see on ja mida see tähendab.', [
        'Mis komme see on ja millal seda tehakse?',
        'Kuidas sa seda eestlasele seletaksid?',
      ], [60, 120]), 'Õpetaja kuulab sinu kommet ja ütleb, kas üldistus oli ettevaatlik.')), { task: 'S15' }),
      homework('038_t_homework', ['1. Kiri sõbrale, 140–160 sõna (ülesanne lehel).', '2. Räägi 1 minut ja salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-039': {
    title: 'Külaline tuleb suvel — kuhu sa ta viid?',
    phases: grammar('Keel: minevik loos — käisin, olen käinud, olin kuulnud · hinnang: väärt, elamus, pettumus'),
    format: 'case',
    topic: 'culture',
    canDo: 'Ma räägin oma muuseumi-, kontserdi- või peokülastusest mineviku aegadega ja põhjendatud hinnanguga, valin külalisele sobiva koha või sündmuse ning soovitan seda suuliselt ja kirjalikult.',
    teacherPage: {
      goal: 'Ученик рассказывает о музее или празднике (прошедшие времена + оценка) и советует гостье, куда пойти летом; продукт модуля — карточка «Minu soovitus külalisele».',
      core: [1, 3, 4], alt: 2,
      short: 'План Б: крючок и 1 вопрос; станция 2 — история без банка предложений (прочитать и сказать, что тронуло рассказчицу); станция 3 — правило и 4 предложения; станция 4 — две карточки вместо четырёх, совет без возражений, карточка продукта в 3 строки.',
      hook: '«Твой друг приезжает в июле на три дня в Эстонию. Одно место или событие, куда ты его обязательно поведёшь, — что это и почему? Одна фраза сразу.» Ответьте сами («Ma viiksin ta …, sest …»), потом ученик.',
      plan: [
        '0–3: крючок — гость на три дня, ученик отвечает сразу',
        '3–10: станция 1 — разговор: мой последний музей, концерт или праздник (прошедшие времена)',
        '10–25: станция 2 — слова (2 мин), прогноз «Что больше всего тронуло рассказчицу?», история «Мой первый певческий праздник» с банком предложений (R4)',
        '25–37: станция 3 — käisin / olen käinud / olin kuulnud в истории → правило → 7 предложений о посещении музея',
        '37–52: станция 4 — голосовое родственницы (6 пропусков), 4 карточки мест и событий, совет по телефону, карточка «Minu soovitus külalisele»',
        '52–64: «Kui aega jääb» — у кассы музея: семейный билет, экскурсия, скидки',
        '64–72: проверка на выходе, «Ma oskan …», разбор 3 ошибок',
        '72–80: домашнее задание: отзыв на форуме, запись 1 минуты (тренировка S1 к уроку 40), слова',
        '80–90: запас',
      ],
      sources: 'История станции 2: 2025.laulupidu.ee — XXVIII праздник песни и XXI праздник танца «Iseoma», 3–6 июля 2025, большой концерт 6 июля на певческом поле; певцов около 31 000; билеты на большой концерт распроданы (ERR, 2025). Карточки: Viljandi pärimusmuusika festival — 23–26 июля 2026, около 65 концертов (viljandifolk.ee, обзоры 2026); Eesti Rahva Muuseum — новое здание в Тарту открыто 1 октября 2016 г.; Lennusadam — морской музей в ангаре гидросамолётов, подводная лодка «Lembit»; Muuseumiöö — каждый май (2026 — 16 мая), музеи открыты до позднего вечера, вход бесплатно или около 1 € (ERR 2022, Baltic Times 2026). Рассказчица, родственница Надя и её сын — учебные.',
      groups: 'Станция 1 — в парах. История — каждый сам, сверка в паре. Станция 4: один — Надя с вашей карточкой, другой советует; потом смена. Карточку продукта каждый пишет свою. В 1:1 Надя — вы.',
      errors: [
        '«Ma olen käinud seal eelmisel suvel» → «Ma käisin seal eelmisel suvel» (время названо → lihtminevik).',
        '«Kas sa käisid kunagi laulupeol?» → «Kas sa oled kunagi laulupeol käinud?» (опыт без времени → täisminevik).',
        '«Ma kuulsin sellest, enne kui läksin» → «Ma olin sellest kuulnud, enne kui läksin» (раньше другого прошлого → enneminevik).',
        '«See on väärt külastama» → «See on külastamist väärt» / «Seda tasub külastada».',
      ],
      notes: [
        'Формат — реальный случай: гостья с ребёнком, без машины и с небольшим бюджетом. Ученик выбирает и советует, а не перечисляет всё подряд. Ученику, который мало ходит в музеи: «место, которое ты знаешь лучше всего» — свой город, парк, рынок, Нарвский замок. Пенсионеру — свой опыт певческих праздников; маме — места для детей; студенту — фестивали.',
        'Факты карточек — реальные; цены билетов не называем (меняются). Если ученик спросит, ответ: «Vaata muuseumi kodulehelt».',
        'Обратная связь, 2–3 цели: выбор прошедшего времени (названо ли время? был ли опыт? что было раньше?); оценка с причиной («See oli väärt, sest …»); совет с учётом желаний гостя (kus, kuhu — урок 36; осторожно об обычаях — урок 38).',
      ],
    },
    discover: [
      station(B.text('039_d_hook', 'Külaline tuleb!', 'Sinu sõber või sugulane tuleb juulis kolmeks päevaks Eestisse. Üks koht või sündmus, kuhu sa ta kindlasti viid — mis see on ja miks? Vasta kohe ühe lausega.'), 1, 10),
      inLesson(teach(tag(purpose(B.speaking('039_d_talk', 'Minu viimane kultuurielamus.', 'Meenuta ja vasta; too näide oma elust.', [
        'Millal sa viimati käisid muuseumis, näitusel, teatrietendusel või kontserdil? Mis seal oli?',
        'Mis sulle meeldis ja mis oli pettumus?',
        'Kas sa oled käinud laulupeol, jaanitulel või muuseumiööl? Kui ei, kas tahaksid?',
      ], [150, 210], ['Ma käisin …', 'Mulle jäi meelde …', 'Ma ei ole kunagi …']), 'Sinu enda kogemus annab soovitusele esimese näite.'), { task: 'S07', fluency: true }),
      'Üks-ühele: räägi ka ise oma viimasest kultuurielamusest. Ära paranda; lõpus ütle üks mineviku vorm, mida õpilane hästi kasutas. Kui õpilane ei käi muuseumis: „Mis koht sinu linnas on kõige ilusam? Millal sa seal viimati käisid?”')),
      station(tag(B.vocab('039_d_vocab', 'Enne lugemist: sõnad.', ['elamus — впечатление', 'pettumus — разочарование', 'väärt — стоящий', 'soovitama — советовать', 'hinnang — оценка', 'näitus — выставка', 'etendus — спектакль', 'külastama — посещать', 'külaline — гость', 'rahvarohke — многолюдный']), { topic: ['elamus', 'hinnang', 'soovitama'] }), 2, 15),
      tag(purpose(B.gaps('039_d_story', 'Lugu: minu esimene laulupidu.', 'Enne lugemist arva: mis rääkijat kõige rohkem liigutas? Siis loe lugu ja vali igasse lünka sobiv lause. Üks lause jääb üle.', [
        'Olin laulupeost palju kuulnud, aga ise ei olnud ma seal käinud. [Kui kolleeg pakkus 2025. aasta juulis piletit, ütlesin kohe jah.]',
        'Peo nimi oli „Iseoma” ja suurkontsert toimus 6. juulil lauluväljakul. [Piletid olid ammu välja müüdud, nii et mul vedas.]',
        'Päev varem olime vaadanud rongkäiku. [Paljud inimesed kandsid rahvariideid ja lillepärgi.]',
        'Peol osales üle kolmekümne tuhande laulja. [Nii suurt koori ei olnud ma varem näinud.]',
        'Kõige rohkem liigutas mind vanaproua, kes laulis kõik laulud kaasa. [Ta rääkis, et oli käinud laulupeol lapsest saati.]',
        'Pärast kontserti olin väsinud, aga õnnelik. [Järgmisele laulupeole lähen kindlasti koos lastega.] Sellest ajast olen käinud ka kahel koorikontserdil.',
      ], ['Kui kolleeg pakkus 2025. aasta juulis piletit, ütlesin kohe jah.', 'Piletid olid ammu välja müüdud, nii et mul vedas.', 'Paljud inimesed kandsid rahvariideid ja lillepärgi.', 'Nii suurt koori ei olnud ma varem näinud.', 'Ta rääkis, et oli käinud laulupeol lapsest saati.', 'Järgmisele laulupeole lähen kindlasti koos lastega.', 'Kahjuks hakkas vihma sadama ja kontsert jäeti pooleli.'], 'full', 'g_read'), 'Lugu näitab, kuidas kogemusest ja hinnangust saab soovitus.'), { task: 'R16', harno: 'R4' }),
    ],
    practice: [
      station(B.notice('039_p_notice', 'Märka: käisin, olen käinud, olin kuulnud', [
        'Loost: Olin laulupeost palju **kuulnud**, aga ise **ei olnud** ma seal **käinud** · suurkontsert **toimus** 6. juulil · Sellest ajast **olen käinud** ka kahel koorikontserdil',
        '**Lihtminevik** (käisin, toimus): üks sündmus, mille aeg on teada — eile, 6. juulil, eelmisel suvel. Lugu liigub selles ajas edasi.',
        '**Täisminevik** (olen käinud): kogemus, mille aeg ei ole tähtis või mis kestab praeguseni: **Kas sa oled** kunagi laulupeol **käinud**? **Sellest ajast olen** …',
        '**Enneminevik** (olin kuulnud): juhtus enne teist minevikusündmust: Enne pidu **olin** ma sellest ainult **lugenud**. Eitus: **ei olnud käinud**.',
        '**Hinnang**: Etendus oli tõeline **elamus** / näitus oli väike **pettumus** · Muuseum on **külastamist väärt** · **Seda tasub** näha · **Soovitan** minna hommikul, sest …',
      ], 'full'), 3, 12),
      teach(tag(purpose(B.gaps('039_p_museum', 'Sõbra käik Eesti Rahva Muuseumi.', 'Sõber kirjutab oma muuseumikäigust. Kirjuta sulgudes olev tegusõna sobivas mineviku vormis.', [
        'Kas sa [oled käinud] kunagi Eesti Rahva Muuseumis? (käima)',
        'Mina [käisin] seal möödunud suvel koos õe ja tema lastega. (käima)',
        'Enne seda [olin lugenud] muuseumi kohta ainult artikleid. (lugema)',
        'Muuseum [avati] uues hoones Tartus 2016. aasta oktoobris. (avama)',
        'Kui me kohale jõudsime, oli giidiga ringkäik juba [alanud]. (algama)',
        'Eelmisel aastal [ei jõudnud] me sinna, sest piletid olid otsas. (jõudma, eitus)',
        'Sellest ajast [olen soovitanud] seda muuseumi kõigile oma külalistele. (soovitama)',
      ], '', 'full', 'g_notice'), 'Õige minevik teeb loo selgeks: lugeja teab, mis juhtus enne ja mis on kogemus praeguseni.'), { task: 'G09' }),
      'Pärast iga lauset küsi: „Kas aeg on teada? Kas see oli enne midagi muud? Kas see on kogemus praeguseni?” Rida 6: eitus lihtminevikus — ei + -nud (ei jõudnud).'),
    ],
    transfer: [
      station(teach(tag(purpose(B.listening('039_t_voice', 'Sugulase häälsõnum.', 'Kuula kaks korda ja kirjuta lünka 1–2 sõna: mida Nadja ja tema poeg vajavad.', [
        'Tere, siin Nadja! Suur uudis: tuleme Kaspariga kahekümne neljandast kuni kahekümne kuuenda juulini Eestisse!',
        'Mulle meeldivad väga muusika ja ajalugu. Kaspar on kümme ja tahab kõige rohkem laevu näha.',
        'Ta küsib iga päev, kas Eestis on päris allveelaev. Ta on lugenud, et kuskil Tallinnas olevat muuseum vanas angaaris, aga ma ei tea, kas see on tõsi.',
        'Mina tahaksin kuulda eesti rahvamuusikat ja näha, kuidas inimesed sada aastat tagasi elasid. Ekskursioon võiks olla inglise või vene keeles.',
        'Autot meil ei ole, nii et sõidame igal pool bussiga. Piletiteks on meil kahe peale kokku umbes sada eurot.',
        'Väga rahvarohke koht natuke hirmutab mind, sest Kaspar kaob kergesti ära. Ja kui sajab vihma, tahaksin pojaga olla kuskil toas.',
        'Kuhu sa meid soovitaksid? Helista mulle õhtul, kui saad. Kallistan!',
      ], [
        'Nadjale meeldivad kõige rohkem muusika ja [ajalugu].',
        'Kümneaastane Kaspar tahab Eestis kõige rohkem näha [laevu].',
        'Autot neil ei ole, nii et nad sõidavad igal pool [bussiga].',
        'Piletiteks on neil kahe peale kokku umbes [sada|100] eurot.',
        'Rahvarohke koht hirmutab Nadjat, sest Kaspar [kaob] kergesti ära.',
        'Vihmase ilmaga tahaks Nadja pojaga olla kuskil [toas].',
      ], 'g_read'), 'Häälsõnumist saad teada, mida sinu külaline päriselt vajab; selle järgi valid soovituse.'), { task: 'L04' }),
      'Kuulamise tsükkel: 1) prognoos: „Mida võiks kümneaastane poiss Eestis näha tahta?”; 2) esimene kuulamine — „Mis on Nadja kolm piirangut?” (auto, raha, rahvamass); 3) teine kuulamine — lüngad; 4) üks lause: „Mis on sinu esimene mõte?”'), 4, 15, { final: 'advise' }),
      tag(purpose(B.profiles('039_t_cards', 'Neli võimalust.', 'Loe kaarte ja märgi, mis sobib Nadjale ja Kasparile ning mis mitte.', [
        ['Viljandi folk', ['Pärimusmuusika festival 23.–26. juulil 2026 lossimägedes.', 'Neli päeva, umbes 65 kontserti.', 'Väga rahvarohke; piletid tuleb ette osta.'], []],
        ['Eesti Rahva Muuseum, Tartu', ['Muuseum asutati 1909. aastal, uus hoone avati 2016. aastal Raadi lennuvälja kõrval.', 'Eesti ja soome-ugri rahvaste elu ja kultuur.', 'Sobib vihmase ilmaga ja lastele.'], []],
        ['Lennusadam, Tallinn', ['Meremuuseum vanas vesilennukite angaaris.', 'Allveelaeva Lembit saab seest vaadata.', 'Lastele, kes armastavad laevu.'], []],
        ['Muuseumiöö', ['Igal aastal mais, 2026. aastal 16. mail.', 'Muuseumid on lahti hilisõhtuni.', 'Sissepääs tasuta või sümboolse tasu eest.', 'Allikad: Viljandi pärimusmuusika festival; Eesti Rahva Muuseum; Eesti Meremuuseum; ERR (2022).'], []],
      ], '2', 'g_read'), 'Kaardid annavad sinu soovitusele faktid, et külaline saaks rahulikult otsustada, kuhu minna.'), { task: 'R13' }),
      teach(tag(purpose(B.rolecards('039_t_advice', 'Helista Nadjale.', 'Helista Nadjale, soovita üks või kaks kohta, räägi oma kogemusest ja vasta tema kahtlustele.',
        'Olukord: sinu sugulane Nadja tuleb poja Kaspariga juulis kolmeks päevaks Eestisse ja ootab sinu soovitust.\nSinu eesmärk: Nadja teab, kuhu ja millal minna, kuidas sinna jõuab ja miks see neile sobib.\nPiirang: soovita ainult seda, mis sobib nende soovide ja rahaga.',
        'Nadja kaart on õpetajal: tema kahtlused ja üks uudis.',
        ['Ma soovitan teil minna …, kus …', 'Ma käisin seal …, ja see oli …', 'Kui sajab vihma, siis …', 'Seda tasub näha, sest …'], ['Aga kas see ei ole …?', 'Kas sa oled ise seal käinud?', 'Kuidas me sinna jõuame?']), 'Tulemus: Nadja teab, kuhu ta pojaga läheb, ja tal on plaan B.'), { task: 'S11', main: true, level: 4 }),
      'Õpetaja kaart (Nadja; kui õpilasel on päris külaline tulemas, võib see olla tema). Ütle ainult seda, mida küsitakse. Uudis: „Kaspar jääb laeval merehaigeks — aga muuseumis olevat laev paigal, eks?” Kahtlused ükshaaval: 1) „Folk on vist liiga rahvarohke, Kaspar kaob ära.” 2) „Kas rahvamuuseum ei ole lapsele igav?” 3) „Kas sa oled seal ise käinud? Kuidas oli?” Õnnestunud, kui õpilane jätab Muuseumiöö kõrvale (see on mais), soovitab vähemalt ühe koha põhjusega, räägib oma kogemusest mineviku aegadega (käisin / olen käinud), annab plaani B ja kasutab vähemalt üht hinnangusõna (väärt, elamus).'),
      teach(tag(purpose(B.planning('039_t_product', 'Minu soovitus külalisele.', 'Täida oma kaart: üks koht või sündmus Eestis, mida sina külalisele soovitad. Kui sa ei ole veel kuskil käinud, vali koht oma linnas.', [
        'Mis sihtkoht või sündmus see on ja kus see asub? (koht, kus …)',
        'Millal minna, kuidas sinna jõuab ja mis see umbes maksab?',
        'Miks just see — minu oma kogemus (Ma käisin … / Ma olen …)?',
        'Üks nõuanne kommete kohta ja plaan B vihmase ilma jaoks.',
      ], 3), 'Kaart jääb sulle: sellest räägid vahehindamisel 1 minuti ja selle järgi kirjutad kodus soovituse.'), { task: 'W11', level: 3 }),
      'Kaart on mooduli tulemus (vaja tunnis 040, sõnavõtt 1 minut). Kontrolli, et igal real oleks päris asi: nimi, kuu, sõiduviis, oma kogemus. Väsinud õpilasele: kolm rida.'),
      extension(teach(tag(purpose(B.rolecards('039_t_more', 'Rollimäng: muuseumi kassas', 'Küsi kassast kõike, mida pere külastuseks vajab, ja osta sobivad piletid.',
        'Olukord: oled koos külalise ja tema lapsega muuseumi kassas.\nSinu eesmärk: saada teada perepileti hind, giidiga ringkäigu keel ja aeg ning kas asju saab hoiule jätta.\nPiirang: kassa sulgub kümne minuti pärast.',
        'Kassapidaja kaart on õpetajal: hinnad, ajad ja üks üllatus.',
        ['Kas teil on perepilet?', 'Mis keeles ringkäik on?', 'Kas piletit saab hiljem vahetada?'], ['Perepilet kehtib …', 'Ringkäik algab …', 'Kahjuks …']), 'Kassas saad vastused, mida kodulehelt ei pruugi leida.'), { task: 'S05', level: 4 }),
      'Kui aega jääb (12 min). Sina oled kassapidaja (väljamõeldud hinnad): perepilet (kaks täiskasvanut ja kuni kolm last) 30 €, täiskasvanu 14 €, laps 7 €; giidiga ringkäik eesti ja inglise keeles kell 12 ja 15, vene keeles ainult laupäeval; garderoob on tasuta. Üllatus: täna kell 15 on ringkäik täis. Õnnestunud, kui õpilane küsib vähemalt neli küsimust, arvutab, mis on odavam, ja võtab kokku, mida pere teeb.'), 12),
      tag(exitCheck(purpose(B.gaps('039_t_exit', 'Kontrolli end: kolm minevikku.', 'Kirjuta sulgudes olev tegusõna sobivas mineviku vormis.', [
        'Ma [olen käinud] laulupeol juba kaks korda. (käima)',
        'Eelmisel suvel [käisime] perega Viljandis folgil. (käima)',
        'Kui ma kassasse jõudsin, olid piletid juba otsa [saanud]. (saama)',
      ], '', 'full', 'g_notice'), 'Kolm lauset näitavad, kas mineviku vormid on käes.')), {}),
      purpose(B.selfcheck('039_t_self', ['Ma räägin oma muuseumi-, kontserdi- või peokülastusest.', 'Ma saan aru reisiloost ja leian, kuidas kogemusest saab soovitus.', 'Ma valin õige mineviku: käisin, olen käinud, olin kuulnud.', 'Ma soovitan külalisele kohta tema soovide järgi ja põhjendan oma hinnangut.'], 'Soovitus antud', 'Ma oskan …'), 'Lahkud tunnist ja tead, mida sa nüüd oskad.'),
      tag(homeTask(purpose(B.writing('039_t_review', 'Kodus: soovitus reisifoorumis.', 'Kirjuta kodus 150–180 sõna reisifoorumisse: koht või sündmus, kus sa käisid, mis seal juhtus (minevik), mis oli elamus ja mis pettumus ning kellele ja miks sa seda soovitad. Kasuta kõiki kolme minevikku ja vähemalt kahte hinnangusõna.', [12, 16], ['käisin', 'olen', 'soovitan', 'väärt'], 3, 'g_use'), 'Sinu soovitust loevad inimesed, kes otsustavad, kuhu oma vaba päev minna.')), { task: 'W05', level: 3 }),
      tag(homeTask(purpose(B.speaking('039_t_home', 'Kodus: sõnavõtt (1 minut).', 'Salvesta 1 minut nagu koosolekul: minu soovitus külalisele (kaardi järgi).', [
        'Mis koht see on ja miks just see?',
        'Mis on sinu enda kogemus ja plaan B?',
      ], [60, 120]), 'See on vahehindamise sõnavõtu harjutus; õpetaja annab ühe nõu.')), { task: 'S16' }),
      homework('039_t_homework', ['1. Soovitus reisifoorumis, 150–180 sõna (ülesanne lehel).', '2. Sõnavõtt 1 minut, salvesta (ülesanne lehel).', `3. ${WORDS_HOME}`, NO_RECORDING]),
    ],
  },

  'b1b2-040': {
    title: 'Vahehindamine 2 — tunnid 21–40',
    phases: {
      discover: { label: '1 Lugemine', slot: 1, subtitle: 'Vahehindamine 2, 1. tund: lugemine (45 min).' },
      practice: { label: '2 Kuulamine', slot: 2, subtitle: 'Vahehindamine 2, 1. tund: keeleosa ja kuulamine (50 min).' },
      transfer: { label: '3 Kirjutamine ja rääkimine', slot: 3, subtitle: 'Vahehindamine 2, 2. tund: kirjutamine ja rääkimine (80 min).' },
    },
    format: 'exam',
    assessment: true,
    canDo: 'Ma lahendan Harno B2 vormis lugemis- ja kuulamisülesandeid reisimise ja kultuuri teemal, kirjutan umbes 140-sõnalise kirja ja 180-sõnalise kokkuvõtte andmetest ning räägin 1 minuti oma soovitusest külalisele; kõrvallaused, kaudne kõneviis, ettevaatlik üldistus ja mineviku vormid on õiged.',
    // Vahehindamine 2 in Harno B2 form (v4 module exam, roadmap: 70 % in all, at least 60 % in writing and speaking): two
    // 90-minute lessons — reading (Avasta, 45 min) and the module's language part + listening (Harjuta, 15 + 35 min);
    // writing (60 min) and speaking with the module product (Kasuta, 15 + 5 min). Harno B2 gives R 70, L 40, W 80, S 20
    // min: every part here is a shorter version with the same task types (R1, R2a, R3, R4; L notices, L3, L4; W1, W2a;
    // S1, S2). Own texts on the module's content (the trip plan 036, the cancelled flight 037, customs 038, the guest's
    // visit 039) with threads to modules 5–7 (the conditional of regret, verb government, the essive of a role); timed by
    // the Harno part headers (timeEstimate.js harnoTimedMinutes, docs/COURSE_DESIGN_STATIONS.md §7.3).
    discover: [
      B.tip('040_d_how', 'Vahehindamine: lugemine (eksami vormis, 45 minutit)', 'Vahehindamine kestab kaks tundi ja kordab tunde 21–40. Esimeses tunnis on lugemine ning kuulamine koos keeleosaga, teises kirjutamine ja rääkimine. Lugemises on neli osa nagu Harno B2 eksamil, ainult lühemad. Tee kõik ilma sõnaraamatuta.', 'full'),
      tag(B.vocab('040_d_vocab', 'Tunnid 36–39: sõnad, mis aitavad', ['eelarve — бюджет', 'majutus — проживание', 'praam — паром', 'hüvitis — компенсация', 'kaebus — жалоба', 'komme — обычай', 'kohanema — приспосабливаться', 'elamus — впечатление', 'väärt — стоящий', 'soovitama — советовать'], '2'), { topic: ['hüvitis', 'komme'] }),
      PART('040_d_rpart', 'R', { minutes: 45, points: 30, tasks: 4, target: 70, note: 'Lugemisosa on Harno B2 vormis, lühemana (eksamil 70 minutit): neli ülesannet, 30 punkti. Vahehindamise eesmärk on vähemalt 21 punkti (70 %).' }),
      B.reading('040_d_read', 'Lugemine 1: arvamusartikkel.', 'Loe kõigepealt arvamusartikkel läbi ja vasta kahele küsimusele; osad 1 ja 2 on sama artikli kohta.', 'Turist omal maal', [
        '(A) Kui küsin sõpradelt, kus nad viimati puhkasid, kuulen kõige sagedamini Türgi, Egiptuse või Hispaania nime. Eestist räägitakse harvem, justkui oleks see koht, kus elatakse ja töötatakse, aga mitte koht, kus puhatakse. Ma mõistan seda: talv on pikk ja päike on meil kallis kaup. Kevadel vaatame töö juures lõunamaa pilte, aga oma saarte, rabade ja väikelinnade pilte vaatame harva. Minu kogemuses jäävad aga kõige kauemaks meelde just need reisid, mis algasid kodu lähedalt. Seepärast tahan seista turisti eest, kes avastab omaenda maad.',
        '(B) Statistika näitab, et ma ei ole üksi. Statistikaameti andmetel majutati 2026. aasta esimesel poolel Eesti majutusettevõtetes umbes 1,66 miljonit turisti, neist ligi 790 000 olid Eesti elanikud. Siseturiste oli aastaga 3 protsenti rohkem. Huvitav on ka see, kuhu inimesed sõidavad. Välisturistidest ööbis peaaegu kolm neljandikku Harjumaal, peamiselt Tallinnas. Eesti elanikud jagunesid palju ühtlasemalt: Harjumaale jäi neist umbes kolmandik, teised sõitsid Pärnumaale, Tartumaale ja mujale.',
        '(C) Kõige sagedamini kuulen vastuväidet, et Eestis puhata on kallis. Nädalavahetus Saaremaal maksvat sama palju kui odav lend lõunamaale. Kui aga kõik kulud kokku arvutada, on pilt teine: sõit lennujaama, pagasi lisatasu, söök lennujaamas ja hotell, mis on alati kaugemal, kui pildil tundus. Kodus Eestis ei maksa keegi kohvri eest lisatasu, ilusa ilmaga võib ööbida ka telgis ja eelarvesse jääb raha varuks. Isegi praamipilet maksab sageli vähem kui kohvri koht odavlennul. Lisaks ei pea kodus kartma, et lend tühistatakse ja puhkus algab lennujaama ootesaalis.',
        '(D) Teine põhjus on mõte, et oma maad tunneme niigi. Kas tõesti? Elasin Tallinnas kakskümmend aastat, enne kui jõudsin esimest korda Kihnu saarele. Olin saarest lugenud ainult kooliõpikust ja arvasin, et tean kõike. Esimene päev saarel oli aga nagu välisreis: teistsugune murre, teistsugused kombed ja inimesed, kes ei kiirustanud kuhugi. Sama tunde sain hiljem Setomaal ja Mulgimaal, kus iga küla tundus olevat omaette maailm. Mõistsin, et olin oma maad tundnud ainult kaardi järgi.',
        '(E) Kolmas põhjus on ilm. Eesti suvi ei luba kunagi midagi kindlat ja see hirmutab paljusid. Heal reisiplaanil on aga alati plaan B. Vihmase ilmaga saab minna muuseumi, ja neid on Eestis palju: suurtest, nagu Eesti Rahva Muuseum Tartus, kuni väikeste külamuuseumideni, kus perenaine räägib ise oma vanaema lugu. Muuseumiööl on paljud muuseumid lahti hilisõhtuni ja sissepääs on sageli tasuta. Ka vihmane päev metsas võib olla ilus, kui sul on hea jope.',
        '(F) Mida siis teha? Esiteks võiks iga pere proovida ühte Eesti reisi igal aastaajal. Teiseks tasub küsida soovitust kohalikelt, mitte ainult internetist: parimad kohad ei ole tihti üheski reitingus. Kolmandaks soovitan ööbida väikestes külalistemajades, kus pererahvas teab rohkem kui ükski reisijuht. Nii jõuab raha ka kohaliku pereni, mitte ainult suure hotelliketini. Neljandaks võtke kaasa lapsed. Kes on lapsena käinud laulupeol või metsamatkal, see tuleb sinna ka täiskasvanuna tagasi ja toob omakorda kaasa oma lapsed.',
        '(G) Ma ei väida, et välismaale ei tasu sõita. Reis võõrasse kultuuri õpetab palju, ka seda, kuidas oma kodu teise pilguga näha. Turist omal maal võidab aga kaks korda: ta puhkab ja õpib samal ajal oma kodu tundma. Kui me räägiksime Eesti reisidest sama uhkelt kui lõunamaa puhkusest, näeksid ka meie lapsed, et ilus maailm algab kodu lähedalt. Võib-olla ongi parim aasta selline, kus sõidad kord kaugele ja kord lähedale.',
        'Allikas: autori arvamus; arvud: Statistikaamet (13.08.2026).',
      ].join('\n\n'), [['Mida tahab autor öelda pealkirjaga „Turist omal maal”?', 'oma maad tasub avastada nagu turist|Eestis tasub reisida|oma maal reisimine on väärt'], ['Kuhu sina viiksid Eestis turisti, kes on siin esimest korda? Miks?']]),
      tag(B.choice('040_d_mc', 'Osa 1: vali õige vastus (6 punkti).', 'Vali iga küsimuse juurde artikli põhjal üks õige vastus neljast.', [
        ['Miks räägitakse autori arvates Eestist kui puhkusekohast harvem?', 'Eestit nähakse elamise, mitte puhkamise kohana', 'Eestis ei ole huvitavaid kohti', 'Eestis on reisimine liiga keeruline', 'eestlased ei puhka kunagi'],
        ['Mida näitavad lõigu B arvud Eesti elanikest turistide kohta?', 'neid oli aastaga rohkem kui varem', 'neid oli rohkem kui välisturiste', 'nad kõik ööbisid Tallinnas', 'neid oli aastaga vähem kui varem'],
        ['Milline kulu jääb autori sõnul reisil Eestis tavaliselt ära?', 'pagasi lisatasu', 'majutus', 'söök', 'sõit sihtkohta'],
        ['Miks oli esimene päev Kihnus autori jaoks nagu välisreis?', 'murre ja kombed olid teistsugused', 'saarel räägiti ainult inglise keelt', 'sinna sai ainult lennukiga', 'seal oli väga palju turiste'],
        ['Mida soovitab autor vihmase ilma puhuks?', 'minna muuseumi', 'jääda koju', 'sõita lõunamaale', 'oodata päikest telgis'],
        ['Millise mõttega oleks autor tõenäoliselt nõus?', 'reis Eestis annab puhkuse ja teadmised korraga', 'välismaale ei tasu kunagi sõita', 'Eestis puhata on alati odavam', 'parimad kohad leiab internetist'],
      ], 'full', 'g_read'), { task: 'R02', harno: 'R1' }),
      tag(B.table('040_d_para', 'Osa 2: väide ja lõik (8 punkti).', 'Leia iga väite 1–8 jaoks artikli lõik (A–G), kus see mõte on. Ühte lõiku sobib kaks väidet.', 'Väide, Lõik', [
        '1. Autor mõistab, miks paljud puhkavad lõunamaal. | [A]',
        '2. Välisturistid ja kodumaised turistid valivad eri maakondi. | [B]',
        '3. Odav lennupilet ei tähenda veel odavat reisi. | [C]',
        '4. Autor avastas osa oma maast alles täiskasvanuna. | [D]',
        '5. Halb ilm ei pea reisi ära rikkuma. | [E]',
        '6. Kohalikud teavad häid kohti, mida reitingud ei näita. | [F]',
        '7. Lapsepõlve reisid mõjutavad täiskasvanu valikuid. | [F]',
        '8. Ka välisreisil on oma väärtus. | [G]',
      ], 'g_read'), { task: 'R14', harno: 'R2a' }),
      tag(B.cloze('040_d_cloze', 'Osa 3: vali lünka sobiv vorm (10 punkti).', 'Reisija kirjutab reisifoorumisse arvustuse. Vali iga lünga neljast valikust see, mis sobib.', 'Arvustus: külalistemaja Saaremaal', [
        'Käisime augustis perega Saaremaal ja ööbisime külalistemajas, {*kus|kuhu|kust|mis} hommikusöök oli hinnas.',
        'Perenaise sõnul {*olevat|olema|olnud|olles} maja ehitatud juba üle saja aasta tagasi. Kui me kohale jõudsime, {*oli|on|oleks|olla} ta meile juba sauna kütnud.',
        'Saunas käimist {*peetakse|peab|pidav|pidama} Saaremaal peaaegu kohustuslikuks. Minu kogemuses {*on|olla|olevat|olles} väikesed külalistemajad hotellidest hubasemad.',
        'Ainus {*pettumus|pettunud|petma|pettumust} oli internet, mis ei töötanud. Kui ma {*oleksin|olen|olevat|olles} seda teadnud, oleksin võtnud kaasa raamatu.',
        'Huvitun {*ajaloost|ajalugu|ajaloole|ajalooks}, seepärast meeldis mulle Kuressaare linnus väga. Töötan ise {*giidina|giidiks|giid|giidile} ja tean, et nii head kohta leiab harva.',
        'Soovitan seda kohta kõigile, {*kes|keda|kellele|kelle} otsivad rahu ja vaikust.',
      ].join('\n\n'), 'g_notice'), { task: 'R03', harno: 'R3' }),
      tag(B.gaps('040_d_bank', 'Osa 4: vali lause (6 punkti).', 'Loe lugu „Kuidas me praamist maha jäime”. Vali igasse lünka sobiv lause. Üks lause jääb üle.', [
        'Eelmisel suvel otsustasime sõpradega sõita väikesele saarele, kuhu me polnud kunagi jõudnud. [Praamipiletid olime ostnud juba kuu aega varem.]',
        'Hommikul jäime aga liiklusummikusse ja jõudsime sadamasse viis minutit pärast väljumist. [Praam oli just kai äärest lahkunud ja meie vaatasime seda kaldalt.]',
        'Esimene mõte oli koju tagasi sõita. [Siis märkas sõber kassa juures teadet, et õhtul on veel üks reis.]',
        'Kassapidaja ütles, et meie piletid kehtivad ka õhtusele reisile. [Selleni oli aga jäänud kuus tundi.]',
        'Otsustasime aega mitte raisata ja läksime lähedal asuvasse külamuuseumi. [Seal rääkis vanaproua meile tund aega oma saare lugusid.]',
        'Saarele jõudsime alles hilisõhtul, väsinud, aga rõõmsad. [Nüüd ütleme, et see oli meie reisi parim viga.]',
      ], ['Praamipiletid olime ostnud juba kuu aega varem.', 'Praam oli just kai äärest lahkunud ja meie vaatasime seda kaldalt.', 'Siis märkas sõber kassa juures teadet, et õhtul on veel üks reis.', 'Selleni oli aga jäänud kuus tundi.', 'Seal rääkis vanaproua meile tund aega oma saare lugusid.', 'Nüüd ütleme, et see oli meie reisi parim viga.', 'Seepärast ostsime kohe uued ja palju kallimad piletid.'], 'full', 'g_read'), { task: 'R16', harno: 'R4' }),
    ],
    // the module's language part (outside Harno's parts, before the first header) and listening in Harno B2 form
    practice: [
      B.tip('040_p_how', 'Vahehindamine: keeleosa ja kuulamine (50 minutit)', 'Kuulamine on nagu Harno B2 eksamil, ainult lühem: teateid kuuled üks kord, intervjuud kaks korda ja kolmandat korda õige-vale väidete jaoks. Enne kuulamist on keeleosa: parandad päris sõnumeid ja ütled mõtte teisiti.', 'full'),
      B.tip('040_p_kpart', 'Keeleosa (15 minutit, 12 punkti)', 'Need on päris sõnumid ja laused tundidest 21–40. Paranda ja ütle teisiti nii, et adressaat saab sinust aru.', 'full'),
      B.errorfix('040_p_fix', 'Keeleosa A: paranda sõnum enne saatmist (6 punkti).', 'Reisikaaslane palub sul tema sõnumid enne saatmist üle vaadata. Igas sõnumis on üks viga: kirjuta sõnum õigesti.', [
        ['See on linn, kus me sõidame igal suvel.', 'See on linn, kuhu me sõidame igal suvel.|See on linn, kuhu me igal suvel sõidame.'],
        ['Teenindaja sõnul olevat lend tühistanud.', 'Teenindaja sõnul olevat lend tühistatud.'],
        ['Eestlasi peetakse sageli kinnised.', 'Eestlasi peetakse sageli kinnisteks.'],
        ['Ma olen käinud seal eelmisel suvel.', 'Ma käisin seal eelmisel suvel.|Käisin seal eelmisel suvel.'],
        ['Minu kogemuses naabrid on väga abivalmid.', 'Minu kogemuses on naabrid väga abivalmid.'],
        ['Ma töötan juba viis aastat müüjaks.', 'Ma töötan juba viis aastat müüjana.|Töötan juba viis aastat müüjana.'],
      ]),
      B.transformation('040_p_trans', 'Keeleosa B: ütle teisiti (6 punkti).', 'Ütle sama mõte uuesti nii, et kasutad sulgudes antud sõna või vormi.', [
        ['Me ööbisime külalistemajas. Seal oli saun.', 'kus', 'Me ööbisime külalistemajas, kus oli saun.|Ööbisime külalistemajas, kus oli saun.'],
        ['Teenindaja väitis: „Kohver jäi Riiga.”', 'olevat', 'Kohver olevat jäänud Riiga.|Teenindaja sõnul olevat kohver jäänud Riiga.|Teenindaja väitel olevat kohver jäänud Riiga.'],
        ['Paljud arvavad, et saunakutse on usalduse märk.', 'peetakse', 'Saunakutset peetakse usalduse märgiks.'],
        ['Ma ei teadnud, et praam väljub nii vara, seepärast jäin hiljaks.', 'kui ma oleksin teadnud', 'Kui ma oleksin teadnud, et praam väljub nii vara, ei oleks ma hiljaks jäänud.|Kui ma oleksin teadnud, et praam väljub nii vara, poleks ma hiljaks jäänud.|Kui ma oleksin teadnud, et praam väljub nii vara, ei oleks ma jäänud hiljaks.'],
        ['Seda muuseumi tasub külastada.', 'väärt', 'See muuseum on külastamist väärt.|Muuseum on külastamist väärt.'],
        ['Palun makske mulle hotelli kulu tagasi.', 'hüvitage', 'Palun hüvitage mulle hotelli kulu.|Palun hüvitage mulle hotelli kulud.'],
      ]),
      PART('040_p_lpart', 'L', { minutes: 35, points: 23, tasks: 3, target: 70, note: 'Kuulamisosa on Harno B2 vormis, lühemana (eksamil 35–40 minutit, siin kolm ülesannet neljast): 23 punkti. Vahehindamise eesmärk on vähemalt 17 punkti (70 %).' }),
      B.listening('040_p_notes', 'Kuulamine 1: lühikesed teated (6 punkti).', 'Neli teadet lennujaamast, sadamast, muuseumist ja festivalilt kõlavad ainult üks kord. Kirjuta lünka 1–2 sõna.', [
        '1. Tähelepanu! Lennu Tallinn–Amsterdam väljumine hilineb umbes kaks tundi. Reisijad saavad infoletist toidutalongi. Palun jälgige tablood.',
        '2. Tugeva tuule tõttu on täna pärastlõunased praamireisid saarele tühistatud. Piletiraha makstakse tagasi. Järgmine praam väljub homme kell üheksa.',
        '3. Muuseumiööl on meie muuseum avatud kella kuuest õhtul kuni üheteistkümneni. Sissepääs on tasuta, aga giidiga ringkäigule tuleb registreeruda.',
        '4. Festivali külastajad! Lossimägede telkimisala on täis. Lähim vaba telkimiskoht on järve ääres, kahe kilomeetri kaugusel. Sinna sõidab tasuta buss iga poole tunni järel.',
      ], [
        'Amsterdami lend hilineb umbes [kaks tundi|kaks|2 tundi].',
        'Infoletist saavad reisijad [toidutalongi|talongi].',
        'Tühistatud praamireiside eest makstakse tagasi [piletiraha|raha].',
        'Järgmine praam väljub homme kell [üheksa|9].',
        'Muuseumi giidiga ringkäigule tuleb [registreeruda].',
        'Uude telkimiskohta sõidab buss iga [poole tunni|pool tundi|30 minuti] järel.',
      ]),
      tag(B.listening('040_p_listen', 'Kuulamine 2: raadiointervjuu (9 punkti).', 'Kuula intervjuud kaks korda. Täida lausete lüngad 1–2 sõnaga.', [
        'Saatejuht: Tere! Suvi on läbi ja paljud reisijad otsivad nüüd abi. Stuudios on Euroopa Tarbijakeskuse nõustaja Reet Saar. Reet, millega teie poole kõige sagedamini pöördutakse?',
        'Reet: Kõige rohkem kaebusi on lendude kohta: lend jäi ära või hilines mitu tundi. Teisel kohal on majutus, mis ei vasta kirjeldusele, ja kolmandal autorent.',
        'Saatejuht: Mida peaks reisija kõigepealt tegema?',
        'Reet: Kõigepealt tuleb kirjutada firmale endale. Paljud helistavad ja vaidlevad telefonis, aga kõne ei jää kuhugi alles. Kirjalik kaebus on tõend.',
        'Saatejuht: Mida kirja panna?',
        'Reet: Kuupäev, broneeringu number, mis juhtus ja mida te nõuate. Lisage fotod ja kviitungid. Majutuse puhul soovitan tuba pildistada kohe saabudes, enne kui asjad lahti pakite.',
        'Saatejuht: Ja kui kohver jääb maha?',
        'Reet: Siis täitke lennujaamas kohe kahjuakt. Hilinenud kohvri kuludest tuleb lennufirmale teatada kahekümne ühe päeva jooksul. Paljud jäävad ilma ainult sellepärast, et ootavad liiga kaua.',
        'Saatejuht: Kas lennufirmad maksavad hüvitist kergesti?',
        'Reet: Mitte alati. Sageli väidetakse, et põhjus oli erakorraline, näiteks torm. Siis tasub kontrollida, kas teistel lennufirmadel oli samal ajal probleeme.',
        'Saatejuht: Kas teie abi maksab midagi?',
        'Reet: Ei, meie abi on tarbijale tasuta. Tingimus on see, et firma asub teises Euroopa Liidu riigis ja te olete talle juba kirjutanud.',
        'Saatejuht: Aitäh, Reet!',
      ], [
        'Kõige rohkem kaebusi on [lendude] kohta.',
        'Teisel kohal on majutus, mis ei vasta [kirjeldusele].',
        'Kolmandal kohal on kaebused [autorendi] kohta.',
        'Telefonikõne ei jää alles, aga kirjalik kaebus on [tõend].',
        'Kirjale tuleb lisada fotod ja [kviitungid].',
        'Majutuse tuba soovitab nõustaja pildistada kohe [saabudes|saabumisel|kohale jõudes].',
        'Hilinenud kohvri kuludest tuleb teatada [kahekümne ühe|21] päeva jooksul.',
        'Lennufirmad väidavad sageli, et põhjus oli [erakorraline].',
        'Nõustaja abi on tarbijale [tasuta].',
      ]), { voice: 'interview', task: 'L04', harno: 'L3' }),
      tag(B.truefalse('040_p_tf', 'Kuulamine 3: õige või vale? (8 punkti)', 'Kuula intervjuud kolmandat korda. Otsusta iga väite kohta: õige või vale.', [
        ['Kõige rohkem kaebusi on autorendi kohta.', false],
        ['Nõustaja soovitab kõigepealt firmaga telefonis vaielda.', false],
        ['Kirjas peab olema ka broneeringu number.', true],
        ['Tuba tasub pildistada alles enne lahkumist.', false],
        ['Paljud jäävad hüvitisest ilma, sest ootavad liiga kaua.', true],
        ['Kui lennufirma nimetab tormi, tasub kontrollida teiste lendude olukorda.', true],
        ['Tarbijakeskuse abi eest tuleb maksta väike tasu.', false],
        ['Tarbijakeskus aitab, kui firma asub teises ELi riigis ja talle on juba kirjutatud.', true],
      ], 'full'), { task: 'L05', harno: 'L4' }),
      B.rubric('040_p_self', 'Minu punktid.', 'Loe kokku oma punktid.', ['Lugemine: … / 30 punkti (osa 1 – 6, osa 2 – 8, osa 3 – 10, osa 4 – 6).', 'Kuulamine: … / 23 punkti (teated – 6, intervjuu – 9, õige/vale – 8).', 'Keeleosa: … / 12 punkti (sõnumid – 6, ütle teisiti – 6).', 'Läbitud: kokku vähemalt 70 % ja üheski osas mitte 0 punkti.']),
    ],
    // writing and speaking in Harno B2 form; the speaking talk is the module's product
    transfer: [
      B.text('040_t_situation', 'Vahehindamine: kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno B2 eksami kirjutamise ja rääkimise osa, ainult lühem. Kirjutad külalistemajale kirja ja teed joonise põhjal kokkuvõtte. Sõnavõtus esitled mooduli tulemust: oma soovitust külalisele, mille plaani paned enne kirja.'),
      // the module's product (docs/COURSE_DESIGN_STATIONS.md §7): the learner's recommendation, built in 036–039
      B.planning('040_t_product', 'Mooduli tulemus: minu soovitus külalisele.', 'Võta tunnis 39 täidetud kaart ja lisa sinna iga mooduli tunni tulemus.', ['Mis sihtkoht või sündmus see on ja kuidas sinna jõuab? (tund 36: koht, kus …; eelarve)', 'Mis võib reisil valesti minna ja mida siis teha? (tund 37: hüvitis, kaebus)', 'Mida peaks külaline kommete kohta teadma? (tund 38: sageli, minu kogemuses)', 'Mis on minu enda kogemus ja hinnang? (tund 39: käisin, olen käinud, väärt)']),
      PART('040_t_wpart', 'W', { minutes: 60, points: 25, tasks: 2, target: 60, note: 'Kirjutamine on Harno B2 vormis, lühemana (eksamil 80 minutit). Kirja eest saab 10 ja kokkuvõtte eest 15 punkti; vahehindamise eesmärk on vähemalt 15 punkti (60 %).' }),
      tag(B.letter('040_t_letter', 'Kirjutamine 1: kiri külalistemajale (umbes 140 sõna).', 'Sinu pere tahab augustis kaheks ööks tulla Saaremaale ühte külalistemajja. Kirjuta perenaisele: kes te olete, millal ja mitu inimest tuleb, mida soovite (hommikusöök, parkimine, lapsevoodi või muu), ning küsi hinda ja tühistamise tingimusi.', 'Lugupeetud perenaine!', 'Lugupidamisega', [125, 144]), { task: 'W13', harno: 'W1' }),
      B.chart('040_t_chart', 'Kus ööbisid majutatud turistid 2026. aasta I poolaastal? (%)', { kind: 'bar', unit: '%', series: ['Eesti elanikud', 'Välisturistid'], rows: ['Harjumaa | 33 | 74', 'Pärnumaa | 14 | 11', 'Tartumaa | 11 | 7', 'Muu Eesti | 42 | 8'], source: 'Statistikaamet, „Esimesel poolaastal majutati 4% rohkem turiste kui aasta varem” (13.08.2026)' }),
      tag(B.writing('040_t_summary', 'Kirjutamine 2: kokkuvõte andmetest (umbes 180 sõna).', 'Kirjuta joonise põhjal kokkuvõte: mis on peamine, kuidas erinevad Eesti elanike ja välisturistide valikud ning sinu kommentaar — mis võiks olla põhjus ja kas väiksemad kohad peaksid välisturiste rohkem kutsuma.', [14, 18], ['joonisel', 'võrreldes', 'seevastu', 'minu arvates'], 3), { task: 'W15', harno: 'W2a' }),
      PART('040_t_spart', 'S', { minutes: 15, points: 25, tasks: 2, target: 60, note: 'Rääkimine on Harno B2 vormis, lühemana (eksamil 20 minutit). Sõnavõtu eest saab 10 ja arutelu eest 15 punkti; vahehindamise eesmärk on vähemalt 15 punkti (60 %).' }),
      tag(B.speaking('040_t_present', 'Rääkimine 1: sõnavõtt seminaril (1 minut).', 'Teemakaart: keelekursuse seminaril soovitab igaüks külalisele ühe koha või sündmuse Eestis. Mõtle 2 minutit oma kaardi järgi, räägi 1 minut, siis vasta paarilise küsimusele.', ['Mis koht, näitus, etendus või sündmus see on ja miks just see?', 'Kuidas sinna jõuab ja mis see maksab?', 'Mis on sinu enda kogemus ja hinnang?', 'Paariline küsib: „Mis siis, kui sajab vihma?”', 'Kas turist peaks kohalikke kombeid ette uurima või õppima neid kohapeal? Miks?', 'Mis teeb reisi sinu jaoks meeldejäävaks?'], [90, 120], ['Tahaksin teile soovitada …', 'Ma käisin seal …', 'Kui ilm on halb, siis …']), { task: 'S16', harno: 'S1' }),
      tag(B.rolecards('040_t_debate', 'Rääkimine 2: arutelu argumendikaartidega.', 'Lugege oma kaarti ja öelge alguses oma arvamus. Arutage siis 4 minutit ja jõudke ühise seisukohani.',
        'Kaart A (poolt). Teema: kas Eesti linnad peaksid saama turistidelt turismimaksu küsida? Argumendid: Riias maksab turist ühe öö eest 1 euro ja edaspidi 2 eurot, Vilniuses ja Kaunases 2 eurot; turistid kasutavad linna teenuseid ja tänavaid; raha võiks minna muuseumidele ja korrashoiule. Lisa oma näide.',
        'Kaart B (vastu). Teema: kas Eesti linnad peaksid saama turistidelt turismimaksu küsida? Argumendid: reis läheb kallimaks ja osa turiste võib minna mujale; suvel on hotellid niigi täis, raske on talvel; seadus seda praegu ei luba ja puhkekorterid ei ole kõik registris. Lisa oma näide.',
        ['Minu arvates …', 'Näiteks Riias …', 'Ma saan aru, aga …'], ['Ma ei ole päris nõus, sest …', 'Teisalt …', 'Kas võiksime leida kompromissi, et …?']), { task: 'S17', harno: 'S2' }),
      B.rubric('040_t_rubric', 'Hindamine (Harno B2 vorm).', 'Märgi, mis on täidetud.', ['Kiri: kes sa oled, kuupäevad ja soovid, küsimused hinna ja tingimuste kohta, sobiv pöördumine ja toon, umbes 140 sõna (10 punkti).', 'Kokkuvõte: peamine suundumus, võrdlus arvudega, üldistus ja oma põhjendatud kommentaar, umbes 180 sõna (15 punkti).', 'Sõnavõtt: koht, kogemus ja plaan B 1 minutiga, vastus küsimusele (10 punkti).', 'Arutelu: põhjendasin näitega, reageerisin paarilisele, jõudsime ühisele seisukohale (15 punkti).']),
      B.selfcheck('040_t_self', ['Kirjutamine: … / 25 punkti (kiri 10, kokkuvõte 15).', 'Rääkimine: … / 25 punkti (sõnavõtt 10, arutelu 15).', 'Läbitud: kokku vähemalt 70 %, kirjutamises ja rääkimises vähemalt 60 %.', 'Ma tean, mida enne järgmist moodulit korrata.'], 'Vahehindamine 2 läbitud'),
    ],
  },
}, {
  'b1b2-036': 'PROJ R→W', 'b1b2-037': 'KIRJ L→W', 'b1b2-038': 'RÄÄK L→S', 'b1b2-039': 'LUGE R→S', 'b1b2-040': 'EKS',
});

// Why each answer is right (owner 2026-11-16: after hand-in the learner sees the score, the mistakes and why;
// engine/mistakes.js): one line per key item, in the order the key lists them (courseSheet.js withExplanations).
// Every scored task of the module has its lines (v4Tasks.test.js checks the count).
export const EXPLAIN = {
  // 036
  '036_d_read': [
    '1. lõik: „jätavad eelarvest umbes 10 protsenti varuks”.',
    '2. lõik: „kestab praamisõit umbes pool tundi”.',
    '2. lõik: „ilma broneeringuta auto jääb üldisesse järjekorda”.',
    '3. lõik: RMK telkimiskohti „saab kasutada tasuta”.',
    '3. lõik: metsamaja „tuleb ette broneerida”.',
    '4. lõik: „kui lend jääb ära või kohver kaob, kaart ei aita”.',
    '4. lõik: „tasub tellida Tervisekassast Euroopa ravikindlustuskaart”.',
    '4. lõik: „Euroopa Liidus saab reisida ka ID-kaardiga”.',
  ],
  '036_p_notes': [
    'Kus on hommikusöök? → külalistemajas, kus …',
    'Kuhu buss läheb? → Kuressaarde, kuhu …',
    'Mida naaber laenas? → täissihitis: telgi, mille …',
    'Kelle juures ööbime? → sõber, kelle juures …',
    'Kelle (mille) piletid? → praamiga, mille piletid …',
    'Kellega on lõbus? → õde, kellega …',
    'Kust on vanalinna kümme minutit? → rand, kust …',
  ],
  '036_t_budget': [
    'Buss 25 € × 2 inimest × 2 suunda = 100 € + öö 70 € = 170 €.',
    '200 € − 170 € = 30 €.',
    'Kütus 50 € + telkimiskoht 0 € = 50 €.',
    'Buss 25 € × 4 = 100 € + hostel 50 € = 150 €.',
    'Buss 35 € × 4 = 140 € + hostel 50 € = 190 €.',
  ],
  '036_t_exit': [
    'sõitma kuhu? → kuhu.',
    'käima kellega? → kellega.',
    'kelle või mille hind? → omastav: mille.',
  ],
  // 037
  '037_d_voice': [
    'Natalja: „Meie lend Berliini tühistati.”',
    'Natalja: „lend olevat tühistatud tormi tõttu”.',
    'Natalja: „tablool oli põhjuseks kirjas „tehnilistel põhjustel””.',
    'Natalja: „uut lendu homme hommikul kell seitse”.',
    'Natalja: „Hotell maksis üheksakümmend eurot.”',
    'Natalja: „ma saavat selle kätte alles Berliinis”.',
  ],
  '037_p_letter': [
    'Fakt minevikus, keegi tegi: tühistati (umbisikuline lihtminevik).',
    'Teenindaja sõnul + kaudne kõneviis: olevat (tühistatud).',
    'Ilmateade on fakt, mida Natalja ise teab: ei olnud, mitte -vat.',
    'Fakt, keegi tegi: pakuti.',
    'Töötaja väide, millesse Natalja ei usu: ei olevat.',
    'Viisakas nõue käskivas kõneviisis: hüvitage.',
    'Viisakas küsimus tingivas: Kas oleks võimalik …?',
    'Aja väljend: kahe nädala jooksul (omastav + jooksul).',
  ],
  '037_t_exit': [
    'Kohver kadus ise: olevat + -nud → kadunud.',
    'Keegi tühistas: olevat + -tud → tühistatud.',
    'Viisakas nõue (teie): hüvitage.',
  ],
  // 038
  '038_d_radio': [
    'Vale: „Esimestel kuudel meeldis mulle kõik.”',
    'Tamara: „kolleegid ei küsinud kunagi mu pere kohta ja ma tundsin end väga üksikuna”.',
    'Vale: „vaikus bussis ei ole ebaviisakus, vaid austus”.',
    'Tamara: „Ma sain aru, et see on usalduse märk.”',
    'Mart: „Tallinnas tundusid eestlased mulle esimestel nädalatel külmad.”',
  ],
  '038_p_soft': [
    'pidama keda milleks → eestlasi (osastav) … kinnisteks (saav, mitmus).',
    'Hilinemist (osastav) peetakse ebaviisakaks (saav).',
    '„alati” → „enamasti”: mitte kõik, vaid enamik.',
    '„kõik” → „paljud”.',
    'Minu kogemuses + tegusõna teisel kohal: on eestlased.',
    'Võrreldes Eestiga + tegusõna teisel kohal: hilinetakse.',
    '„mitte kunagi” → „harva”: pehmem üldistus.',
    'sõltuma millest → sellest, kas …',
  ],
  '038_t_exit': [
    'Umbisikuline: peetakse (keegi peab).',
    'pidama milleks → saav: ebaviisakaks.',
    'Minu kogemuses + tegusõna teisel kohal: on.',
  ],
  // 039
  '039_d_story': [
    'Ei olnud käinud → kolleegi pakkumine: ütles jah.',
    'Suurkontsert → piletid olid välja müüdud.',
    'Rongkäik → inimesed rahvariietes ja pärgadega.',
    'Üle 30 000 laulja → nii suurt koori ei olnud ta näinud.',
    'Vanaproua laulis kaasa → ta oli käinud laulupeol lapsest saati.',
    'Väsinud, aga õnnelik → järgmine kord lastega. Üle jääb lause vihmast: kontsert ei jäänud pooleli.',
  ],
  '039_p_museum': [
    'Kogemus, aeg ei ole tähtis: oled käinud.',
    'Aeg on teada (möödunud suvel): käisin.',
    'Enne teist minevikku (enne seda): olin lugenud.',
    'Aeg on teada, keegi tegi: avati.',
    'Juhtus enne kohalejõudmist: oli alanud.',
    'Eitus lihtminevikus: ei jõudnud.',
    'Kogemus praeguseni (sellest ajast): olen soovitanud.',
  ],
  '039_t_voice': [
    'Nadja: „Mulle meeldivad väga muusika ja ajalugu.”',
    'Nadja: Kaspar „tahab kõige rohkem laevu näha”.',
    'Nadja: „sõidame igal pool bussiga”.',
    'Nadja: „umbes sada eurot”.',
    'Nadja: „Kaspar kaob kergesti ära”.',
    'Nadja: „kui sajab vihma, tahaksin pojaga olla kuskil toas”.',
  ],
  '039_t_exit': [
    'Kogemus, aeg ei ole tähtis: olen käinud.',
    'Aeg on teada (eelmisel suvel): käisime.',
    'Enne teist minevikku: olid … saanud.',
  ],
  // 040
  '040_d_read': [
    '(G) lõik: „Turist omal maal võidab aga kaks korda” — oma maad tasub avastada.',
    'Sinu oma vastus: õpetaja vaatab, kas põhjendad oma valikut.',
  ],
  '040_d_mc': [
    '(A) lõik: Eesti on koht, „kus elatakse ja töötatakse, aga mitte koht, kus puhatakse”.',
    '(B) lõik: „Siseturiste oli aastaga 3 protsenti rohkem.”',
    '(C) lõik: „Kodus Eestis ei maksa keegi kohvri eest lisatasu.”',
    '(D) lõik: „teistsugune murre, teistsugused kombed”.',
    '(E) lõik: „Vihmase ilmaga saab minna muuseumi.”',
    '(G) lõik: „ta puhkab ja õpib samal ajal oma kodu tundma”.',
  ],
  '040_d_para': [
    '(A): „Ma mõistan seda: talv on pikk.”',
    '(B): välisturistid Harjumaal, Eesti elanikud „ühtlasemalt”.',
    '(C): kulud „kokku arvutada, on pilt teine”.',
    '(D): „Elasin Tallinnas kakskümmend aastat, enne kui jõudsin …”',
    '(E): „Heal reisiplaanil on aga alati plaan B.”',
    '(F): „parimad kohad ei ole tihti üheski reitingus”.',
    '(F): „Kes on lapsena käinud …, see tuleb sinna ka täiskasvanuna tagasi.”',
    '(G): „Reis võõrasse kultuuri õpetab palju.”',
  ],
  '040_d_cloze': [
    'Kus oli hommikusöök? → kus.',
    'Perenaise sõnul + kaudne kõneviis: olevat (ehitatud).',
    'Enne kohalejõudmist: oli … kütnud (enneminevik).',
    'pidama milleks, umbisikuline: peetakse … kohustuslikuks.',
    'Minu kogemuses + tavaline tegusõna teisel kohal: on.',
    'Lause alus nimetavas: pettumus.',
    'Kahetsus minevikus: Kui ma oleksin teadnud, oleksin võtnud.',
    'huvituma millest → ajaloost.',
    'Roll: olev kääne — giidina.',
    'Kes otsivad? → kes (nimetav, alus).',
  ],
  '040_d_bank': [
    'Otsus sõita → piletid olid ostetud varem.',
    'Viis minutit hiljem → praam oli just lahkunud.',
    'Esimene mõte → aga siis märkas sõber teadet.',
    'Piletid kehtivad → aga oodata tuli kuus tundi.',
    'Külamuuseum → vanaproua rääkis lugusid.',
    'Hilisõhtul rõõmsad → parim viga. Üle jääb lause uutest piletitest: vanad piletid kehtisid.',
  ],
  '040_p_fix': [
    'sõitma kuhu → kuhu.',
    'Keegi tühistas: olevat + -tud → tühistatud.',
    'pidama milleks → saav: kinnisteks.',
    'Aeg on teada (eelmisel suvel) → lihtminevik: käisin.',
    'Minu kogemuses + tegusõna teisel kohal: on naabrid.',
    'Roll või amet: olev kääne — müüjana.',
  ],
  '040_p_trans': [
    'Seal = selles majas → kus.',
    'Teise väide minevikus: olevat + -nud → olevat jäänud.',
    'pidama mida milleks: saunakutset … märgiks.',
    'Kahetsus: Kui ma oleksin teadnud …, ei oleks ma … jäänud.',
    'väärt + osastav -mist: külastamist väärt.',
    'Viisakas nõue: hüvitage.',
  ],
  '040_p_notes': [
    'Teade 1: „hilineb umbes kaks tundi”.',
    'Teade 1: „saavad infoletist toidutalongi”.',
    'Teade 2: „Piletiraha makstakse tagasi.”',
    'Teade 2: „Järgmine praam väljub homme kell üheksa.”',
    'Teade 3: „giidiga ringkäigule tuleb registreeruda”.',
    'Teade 4: „buss iga poole tunni järel”.',
  ],
  '040_p_listen': [
    'Reet: „Kõige rohkem kaebusi on lendude kohta.”',
    'Reet: „majutus, mis ei vasta kirjeldusele”.',
    'Reet: „ja kolmandal autorent”.',
    'Reet: „Kirjalik kaebus on tõend.”',
    'Reet: „Lisage fotod ja kviitungid.”',
    'Reet: „pildistada kohe saabudes”.',
    'Reet: „kahekümne ühe päeva jooksul”.',
    'Reet: „Sageli väidetakse, et põhjus oli erakorraline.”',
    'Reet: „meie abi on tarbijale tasuta”.',
  ],
  '040_p_tf': [
    'Vale: kõige rohkem kaebusi on lendude kohta.',
    'Vale: „Kõigepealt tuleb kirjutada firmale endale.”',
    'Õige: „Kuupäev, broneeringu number …”',
    'Vale: „kohe saabudes, enne kui asjad lahti pakite”.',
    'Õige: „Paljud jäävad ilma ainult sellepärast, et ootavad liiga kaua.”',
    'Õige: „tasub kontrollida, kas teistel lennufirmadel oli samal ajal probleeme”.',
    'Vale: „meie abi on tarbijale tasuta”.',
    'Õige: „firma asub teises Euroopa Liidu riigis ja te olete talle juba kirjutanud”.',
  ],
};
