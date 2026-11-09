// „B1 noorkeele õppija” (course key b1noor), module 2 „Pere, sõbrad ja naabrid” (b1noor-006…010), stage A2+, lesson
// design v3 stations (docs/COURSE_DESIGN_STATIONS.md §1–§6, the 10 evidence rules of A2B1_EVIDENCE.md). Teen version of
// the blueprint's module 2 (docs/A2B1_COURSE_BLUEPRINT.md §3.1): describe people and relations, invite, accept /
// decline, agree; Harno emphasis W (A2 message → W1b).
// Lesson ids and the a2b1 lessons they stand for (the same slot of the grammar spiral):
//   b1noor-006 ≈ a2b1-006  LUGU R→W „Minu inimesed” — final: explain (a post for the class blog: who is who in a photo)
//   b1noor-007 ≈ a2b1-007  KUUL L→S „Kes on kes?” — final: decide (recommend a peer mentor for Daria)
//   b1noor-008 ≈ a2b1-008  AVAS R→W „Üllatuspidu” — final: plan (plan the party with Robin, invitation W1b)
//   b1noor-009 ≈ a2b1-009  PROB L→S „Naabrid ja pidu” — final: negotiate (friends over on Saturday, with a parent)
//   b1noor-010 = a2b1-010  module check: W1b message, the final task in a new situation, grammar + words
// Grammar (blueprint §3.2, module 2): genitive and possession (006, with postpositions 008) — I / P; kes / mis clauses
// (007, kelle / mille 009) — I / P; recycled: questions, present tense and word order (module 1), local cases (A2).
// Cast as in module 1 (Milana, Robin, Artjom, Daria, Kertu, class teacher Kaie, coach Raivo); new: Robin's family
// (brother Kevin, aunt Kersti, uncle Marek), Milana's brother Timur, the neighbour Jüri Tamm, peer mentors Liisa, Mart,
// Karina. Real facts (007 station 4) carry their source; every other number belongs to the cast's story.
// Listening: no recordings yet (MODULE.audio 'pending'): the teacher reads the transcripts.
import { B, tag, teach, why, withShapes } from '../blocks.js';
import { purpose, station } from '../stationBlocks.js';

export const MODULE = { id: 'b1noor-module-02', course: 'b1noor', title: 'Pere, sõbrad ja naabrid', level: 'A2+', design: 'v3-stations', template: 'v4', audio: 'pending' };

export const LESSONS = withShapes({
  // ---------------------------------------------------------------- 006 LUGU R→W: genitive, possession
  'b1noor-006': {
    title: 'Minu inimesed',
    canDo: 'Ma seletan, kes on minu pere ja sõbrad ning kelle kes on, ja kirjutan klassi blogisse postituse pere fotost.',
    teacherPage: {
      goal: 'Ученик объясняет, кто есть кто в семье и среди друзей (родительный падеж: «ema õde», «venna sõber»), и пишет пост к семейной фотографии.',
      core: [2, 4, 5], alt: 3,
      short: 'Станция 2 (10 мин) → станция 5 (15 мин). Чтение (ст. 1) и аудио (ст. 3) — дома или в следующий раз.',
      errors: [
        '«minu vend sõber» вместо «minu venna sõber» — тот, кому принадлежит, стоит в родительном падеже.',
        '«õde poeg» вместо «õe poeg», «sõber ema» вместо «sõbra ema» — у многих слов основа меняется (õde → õe, sõber → sõbra).',
        '«Mul on kaks vend» вместо «kaks venda» (после числа — партитив; повтор A2).',
      ],
      notes: [
        'Четыре пряди: ст. 1 — чтение, ст. 2 — форма, ст. 3 — слушание, ст. 4 — беглость, ст. 5 — письмо.',
        'Обратная связь: на ст. 2 подсказка («kelle sõber? vend…?»), потом модель; на ст. 4 не перебивать; письмо (ст. 5) — подчеркнуть ошибки по целям, ученик исправляет сам.',
        'Личное: ученик может писать о выдуманной семье или о друзьях, настоящие имена не обязательны.',
        'Дом 10 + 1: «Harjuta» 10 минут ≥ 4 дней (слова семьи в обе стороны + предложения: родительный падеж, вопросы из модуля 1). Реальное задание на выбор: (а) подписать по-эстонски 3 фотографии в своём телефоне («minu isa õde…»); (б) рассказать по-эстонски одному человеку в школе, кто твой лучший друг и чей он сын / брат.',
      ],
    },
    discover: [
      station(purpose(B.reading('006_d_blog', 'Robini perepäev.', 'Loe Robini postitust ja vasta küsimustele lühidalt.', 'Pühapäev vanaema juures', [
        'Pühapäeval oli meil suur perelõuna vanaema juures Nõmmel. Kohal olid kõik: minu ema ja isa, minu vend Kevin ja tema tüdruksõber Laura. Tuli ka ema õde Kersti, kes elab Tartus. Kersti poeg Sander on minu nõbu, ta on alles üheksa. Vanaisa tegi grilli ja vanaema küpsetas kooki. Pärast sööki mängisime isa vennaga korvpalli. Onu Marek on minu lemmiksugulane, sest ta käis noorena samas koolis nagu mina. Õhtul vaatasime vanu fotosid. Ema ütles, et ma olen nagu tema isa noorena.',
      ], [
        ['Kus oli perelõuna?', 'vanaema juures|Nõmmel|vanaema juures Nõmmel'],
        ['Kes on Laura?', 'Kevini tüdruksõber|venna tüdruksõber|Robini venna tüdruksõber'],
        ['Kus elab ema õde Kersti?', 'Tartus'],
        ['Kes on Sander Robinile?', 'nõbu'],
        ['Kellega mängis Robin korvpalli?', 'isa vennaga|onu Marekiga|Marekiga|onuga'],
        ['Miks on onu Marek Robini lemmiksugulane?', 'ta käis samas koolis|ta käis noorena samas koolis|käis samas koolis'],
      ]), 'Milana läheb laupäeval Robini juurde ja tahab teada, keda ta seal kohtab. Loed Robini postitust, et kõik nimed selgeks saada.'), 1, 12),
      tag(B.vocab('006_d_vocab', 'Tunni sõnad.', ['pere — семья', 'vanemad — родители', 'vend — брат', 'õde — сестра', 'onu — дядя', 'tädi — тётя', 'vanaema — бабушка', 'nõbu — двоюродный брат или сестра', 'sugulane — родственник', 'sõber — друг', 'naaber — сосед', 'sünnipäev — день рождения']), {}),
      station(B.notice('006_d_rule', 'Märka: kelle? — omastav', [
        'Kelle oma? **Robini** vend · **minu ema** õde · **Milana** kool · **kooli** õu (moodul 1)',
        'Mõnel sõnal muutub tüvi: vend → **venna** · õde → **õe** · sõber → **sõbra** · naaber → **naabri** · nõbu → **nõo**',
        'Mõnel sõnal jääb sama: ema → **ema** · isa → **isa** · tädi → **tädi** · onu → **onu**',
        'Kaks omastavat järjest: **minu venna** tüdruksõber · **isa õe** poeg',
      ], 'full'), 2, 10),
      purpose(B.gaps('006_d_whose', 'Kelle oma?', 'Kirjuta sulgudes olev sõna omastavas.', [
        'Laupäeval on minu [õe] (õde) sünnipäev.',
        'Kevin sõidab [isa] (isa) autoga.',
        'Pärast trenni lähen [sõbra] (sõber) juurde.',
        'See on meie [naabri] (naaber) koer.',
        '[Robini] (Robin) vanaema elab Nõmmel.',
        'Minu [venna] (vend) tüdruksõber on Laura.',
      ], '', 'full', 'g_notice'), 'Robin kirjutab fotode alla allkirju. Aitad tal õiged vormid valida, et sugulased end piltidelt ära tunneksid.'),
    ],
    practice: [
      station(teach(purpose(B.listening('006_p_milana', 'Milana pere.', 'Enne kuulamist arva vastused. Õpetaja loeb sõnumi kaks korda, sina kirjuta lünka üks sõna.', [
        'Milana: Tere, Robin! Sa küsisid mu pere kohta. Meid on kodus neli: ema, isa, mina ja mu väike vend Timur.',
        'Milana: Timur on kaheksa ja käib teises klassis. Ta armastab legosid.',
        'Milana: Mu isa töötab Tallinna sadamas, ema on haiglas medõde.',
        'Milana: Vanaema elab ikka veel Narvas. Me sõidame tema juurde rongiga iga kuu.',
        'Milana: Mu isa vend, onu Sergei, elab Soomes. Tema tütar Alina on minu nõbu, ta on minuga sama vana.',
        'Milana: Kui tahad, tule laupäeval meile. Ema teeb pelmeene!',
      ], [
        'Milana vend on [kaheksa|8] aastat vana.',
        'Milana isa töötab [sadamas].',
        'Milana ema on haiglas [medõde].',
        'Vanaema juurde sõidab pere [rongiga].',
        'Onu Sergei elab [Soomes].',
        'Alina on Milana [nõbu].',
      ]), 'Robin küsis Milana pere kohta ja sai häälsõnumi. Kirjutad üles, kes kes on, et Robin laupäeval kõiki nimepidi tervitaks.'),
      'Kuulamise tsükkel: ennusta (30 s) → esimene kuulamine: mitu inimest on Milana peres? → võrdle → teine kuulamine: lüngad → üks rida „mis aitas / mis jäi kuulmata”.'), 3, 10),
      station(teach(tag(purpose(B.speaking('006_p_family', 'Pere 90 sekundiga.', 'Õpetaja on Robini ema: vasta 90 sekundit. Siis räägi Dariale 30 sekundit oma suurimast abilisest.', [
        'Kui suur sinu pere on?', 'Kellega sa kodus kõige rohkem räägid?', 'Kus sinu vanavanemad elavad?', 'Kas sul on nõbusid? Kus nad elavad?', 'Mida teie pere koos teeb?', 'Kelle moodi sa oled?',
      ], [90, 130], ['Meid on kodus…', 'Minu ema õde…', 'Ma olen oma … moodi', 'Kõige rohkem aitab mind…, sest…']), 'Robini ema tahab külalist laua taga tundma õppida. Vastad vabalt ja kiiresti, nagu päris vestluses.'), { fluency: true }),
      'Ladusus: küsi kiiresti, ära paranda. Daria on uus kuulaja ja jutt on teine (üks inimene, mitte kogu pere). Lõpus 2 märkust omastava kohta.'), 4, 10),
    ],
    transfer: [
      station(B.text('006_t_sit', 'Klassi blogi „Meie pered”', 'Koolis on perepäev. Klassijuhataja Kaie teeb Stuudiumis klassi blogi „Meie pered”: iga õpilane paneb üles ühe foto ja kirjutab, kes pildil on ja kelle kes on. Robin kirjutas juba: „Vasakul on minu isa vend Marek, tema kõrval minu vend Kevin…”. Kirjuta oma postitus. Sinu variant: kasuta oma päris pere või sõprade fotot; päris nimesid ei pea kirjutama.'), 5, 15, { final: 'explain' }),
      B.phrasebank('006_t_phrases', [
        ['Kus pildil?', ['Vasakul on…', 'Paremal seisab…', 'Keskel istub…', 'Taga on…']],
        ['Kelle kes?', ['minu ema õde', 'isa vend', 'venna tüdruksõber', 'tädi poeg — minu nõbu']],
        ['Miks see pilt?', ['Pilt on tehtud…', 'Mulle meeldib see pilt, sest…']],
      ]),
      teach(tag(purpose(B.writing('006_t_post', 'Minu foto blogis.', 'Kirjuta 6–9 lausega, kes pildil on ja kelle kes on. Kasuta omastavat.', [6, 9], ['vasakul', 'paremal', 'keskel'], 1), 'Klassi blogi loevad õpetajad ja teiste perede vanemad perepäeval. Seletad oma postitusega, kes pildil on, nii et võõras saab aru.'), { main: true, level: 4 }),
      'Õpetaja on Robin ja kirjutab postituse alla kommentaari: „Kes see on, kes seisab taga?” Õpilane vastab ühe-kahe lausega. Õnnestunud, kui postituses on vähemalt neli inimest koos suhtega (minu ema õde, venna sõber), koht pildil ja üks põhjus, miks see pilt on tähtis. Vead parandab õpilane ise pärast kirjutamist, õpetaja näitab ainult rida.'),
    ],
  },

  // ---------------------------------------------------------------- 007 KUUL L→S: kes / mis clauses
  'b1noor-007': {
    title: 'Kes on kes?',
    canDo: 'Ma kirjeldan inimesi kes- ja mis-lausetega ja soovitan uuele õpilasele sobiva tugiõpilase.',
    teacherPage: {
      goal: 'Ученик описывает людей придаточными с kes / mis и рекомендует классному руководителю наставника для новой ученицы, с двумя причинами.',
      core: [2, 4, 5], alt: 1,
      short: 'Станция 2 (10 мин) → станция 5 (15 мин). Аудио (ст. 1) и ударение (ст. 3) — в следующий раз.',
      errors: [
        '«ring, kes on reedeti» — kes только о людях, о вещах и местах mis: «ring, mis on reedeti».',
        'Без запятой перед kes / mis: в письме «Kertu on tüdruk, kes…».',
        'Ударение на втором слоге (vaNAema, peREkond) — в эстонском ударный первый слог.',
      ],
      notes: [
        'Четыре пряди: ст. 1 — слушание, ст. 2 — форма, ст. 3 — произношение, ст. 4 — продукция (игра «угадай», настоящий информационный пробел), ст. 5 — продукция.',
        'Обратная связь: на ст. 2 и 3 подсказка, потом модель; на ст. 4 и 5 не перебивать, в конце 2–3 пункта.',
        'Факты ст. 4 (общеизвестные, перед уроком можно сверить на ERR): Kelly Sildaru — бронза Олимпиады 2022 (слоупстайл); Ott Tänak — чемпион мира по ралли 2019; Alika — Эстония на Евровидении 2023; Arvo Pärt — композитор. Если ученик не знает этих людей, пусть выберет человека из своей школы или любимого блогера.',
        'Дом 10 + 1: «Harjuta» 10 минут ≥ 4 дней (слова + предложения: kes / mis, родительный падеж из урока 6, вопросы из модуля 1). Реальное задание на выбор: (а) описать по-эстонски трёх людей из своей школы предложениями с kes (без имён — пусть друг угадает); (б) прочитать на ERR Novaator или в школьной газете одну заметку о человеке и записать 2 предложения с kes.',
      ],
    },
    discover: [
      station(teach(purpose(B.listening('007_d_who', 'Kes see on?', 'Enne kuulamist arva vastused. Õpetaja loeb vestluse kaks korda, sina kirjuta lünka üks sõna.', [
        'Daria: Kes see poiss on, kes seisab akna juures?',
        'Milana: See on Robin. Ta on poiss, kes aitas mind esimesel päeval.',
        'Daria: Ja tüdruk, kellel on punased juuksed?',
        'Milana: See on Kertu. Ta käib väitlusklubis, mis on reedeti raamatukogus.',
        'Daria: Aga mees, kes kannab dressipluusi?',
        'Milana: See on treener Raivo, kes otsib korvpallivõistkonda uusi mängijaid.',
        'Daria: Ja naine, kes räägib telefoniga?',
        'Milana: See on meie klassijuhataja Kaie. Ta on õpetaja, keda kõik armastavad.',
      ], [
        'Robin on poiss, kes [aitas] Milanat esimesel päeval.',
        'Kertul on [punased] juuksed.',
        'Väitlusklubi on reedeti [raamatukogus].',
        'Treener Raivo kannab [dressipluusi].',
        'Raivo otsib võistkonda uusi [mängijaid].',
        'Kaie on õpetaja, keda kõik [armastavad].',
      ]), 'Daria on koolis teist nädalat ja ei tea veel, kes kes on. Kirjutad üles, mida Milana räägib, et Daria inimesed ära tunneks.'),
      'Kuulamise tsükkel: ennusta (kes võiks pildil olla?) → esimene kuulamine: mitu inimest? → võrdle → teine kuulamine: lüngad → üks rida refleksiooni.'), 1, 10),
      tag(B.vocab('007_d_vocab', 'Tunni sõnad.', ['tugiõpilane — ученик-наставник', 'soovitama — рекомендовать', 'aitama — помогать', 'otsima — искать', 'inimene — человек', 'kirjeldama — описывать', 'põhjus — причина', 'juuksed — волосы', 'kandma — носить', 'sõber — друг', 'klassijuhataja — классный руководитель', 'trenn — тренировка']), {}),
      station(B.notice('007_d_rule', 'Märka: kes ja mis', [
        'Kahest lausest üks: Robin on poiss. Robin aitas mind. → Robin on poiss, **kes** aitas mind.',
        '**Kes** — inimene: sõber, **kes** elab Narvas. **Mis** — asi või koht: ring, **mis** on reedeti.',
        'Enne **kes** ja **mis** on koma.',
        'Mitte segamini: ~~ring, kes~~ → ring, **mis** · ~~õpetaja, mis~~ → õpetaja, **kes**',
      ], 'full'), 2, 10),
      purpose(B.transformation('007_d_join', 'Kaks lauset üheks.', 'Tee kahest lausest üks. Kasuta antud sõna.', [
        ['Kertu on tüdruk. Kertu käib väitlusklubis.', 'kes', 'Kertu on tüdruk, kes käib väitlusklubis.'],
        ['See on ring. Ring on kolmapäeviti.', 'mis', 'See on ring, mis on kolmapäeviti.'],
        ['Raivo on treener. Raivo otsib uusi mängijaid.', 'kes', 'Raivo on treener, kes otsib uusi mängijaid.'],
        ['Noortekeskus on maja. Maja on kooli kõrval.', 'mis', 'Noortekeskus on maja, mis on kooli kõrval.'],
        ['Mul on nõbu. Nõbu elab Soomes.', 'kes', 'Mul on nõbu, kes elab Soomes.'],
        ['Ma loen raamatut. Raamat on väga põnev.', 'mis', 'Ma loen raamatut, mis on väga põnev.'],
      ]), 'Milana kirjutab Dariale koolist lühikese juhendi. Teed tema laused lühemaks ja selgemaks, et Daria loeks need kiiresti läbi.'),
    ],
    practice: [
      station(teach(purpose(B.choice('007_p_stress', 'Kuidas ütleb eestlane?', 'Õpetaja ütleb sõna kolmel moel. Vali eesti moodi, siis ütle ise.', [
        ['Kuidas ütled sõna „perekond”?', 'rõhk 1. silbil: PE-re-kond', 'rõhk 2. silbil: pe-RE-kond', 'rõhk 3. silbil: pe-re-KOND'],
        ['Kuidas ütled sõna „vanaema”?', 'rõhk 1. silbil: VA-na-e-ma', 'rõhk 2. silbil: va-NA-e-ma', 'rõhk 3. silbil: va-na-E-ma'],
        ['Kuidas ütled sõna „sünnipäev”?', 'rõhk 1. silbil: SÜN-ni-päev', 'rõhk 2. silbil: sün-NI-päev', 'rõhk 3. silbil: sün-ni-PÄEV'],
        ['Kuidas ütleb eestlane nime „Milana”?', 'rõhk 1. silbil: MI-la-na', 'rõhk 2. silbil: mi-LA-na', 'rõhk 3. silbil: mi-la-NA'],
        ['Kuidas ütleb eestlane nime „Daria”?', 'rõhk 1. silbil: DA-ri-a', 'rõhk 2. silbil: da-RI-a', 'rõhk 3. silbil: da-ri-A'],
        ['Kuidas ütled sõna „klassijuhataja”?', 'rõhk 1. silbil: KLAS-si-ju-ha-ta-ja', 'rõhk 3. silbil: klas-si-JU-ha-ta-ja', 'rõhk 5. silbil: klas-si-ju-ha-TA-ja'],
      ], 'full', 'g_notice'), 'Eesti keeles on rõhk sõna alguses. Kui ütled nime eesti moodi, saab kuulaja sinust kohe aru.'),
      'Kõigepealt taju: õpetaja ütleb iga sõna kolmel moel (rõhk 1., 2., 3. silbil), õpilane valib. Siis hääldus: õpilane ütleb, õpetaja kuulab ainult rõhku. Nimed on eesti suus samuti esisilbirõhuga.'), 3, 8),
      station(teach(purpose(B.speaking('007_p_guess', 'Arva ära, kes see on!', 'Vali üks inimene, nime ära ütle. Kirjelda teda kes- ja mis-lausetega.', [
        'Kelly Sildaru — suusataja, kes võitis 2022. aasta olümpiamängudel pronksmedali',
        'Ott Tänak — rallisõitja, kes oli 2019. aastal maailmameister',
        'Alika — laulja, kes esindas Eestit 2023. aasta Eurovisioonil',
        'Arvo Pärt — helilooja, kelle muusikat mängitakse üle maailma',
        'Või keegi sinu koolist, keda õpetaja ei tea',
      ], [60, 120], ['See on inimene, kes…', 'Ta teeb asja, mis…', 'Ta elab linnas, mis…']), 'Mängid õpetajaga äraarvamismängu. Õpetaja ei tea, kelle sa valisid, nii et pead inimest nii kirjeldama, et teda saab ära tunda.'),
      'Päris infolõhe: õpetaja ei vaata, kelle õpilane valis, ja küsib kas-küsimusi („Kas see on keegi, kes laulab?”). Kui õpilane valib inimese oma koolist või oma lemmikblogija, on mäng veel ehtsam.'), 4, 10),
    ],
    transfer: [
      station(B.text('007_t_sit', 'Tugiõpilane Dariale', 'Daria vajab tugiõpilast: vanemat õpilast, kes aitab tal esimestel kuudel koolis hakkama saada. Klassijuhataja Kaie peab homseks ühe valima ja küsib sinu nõu, sest sa tunned Dariat kõige paremini. Loe kolme kandidaadi kaarte ja soovita ühte. Sinu variant: keda sinu koolist sa soovitaksid uuele õpilasele ja miks?'), 5, 15, { final: 'decide' }),
      purpose(B.profiles('007_t_cards', 'Kandidaadid.', 'Loe kaarte. Mõtle, kes sobib Dariale kõige paremini.', [
        ['Liisa, 16, 10. klass', ['räägib eesti, vene ja inglise keelt', 'käib kooliteatris', 'vaba aega on ainult reedeti'], ''],
        ['Mart, 15, 9. klass', ['räägib ainult eesti keelt', 'mängib korvpallivõistkonnas', 'elab Dariaga samas majas'], ''],
        ['Karina, 16, 10. klass', ['tuli ise kaks aastat tagasi Ukrainast', 'räägib ukraina, vene ja eesti keelt', 'käib kunstistuudios kolmapäeviti'], ''],
      ]), 'Kaie peab kolmest kandidaadist ühe valima. Loed kaarte, et oma soovitust põhjendada.'),
      teach(tag(purpose(B.rolecards('007_t_talk', 'Kaie küsib nõu.', 'Õpetaja on klassijuhataja Kaie. Mida ja kuidas öelda, otsusta ise.',
        'Olukord: Kaie peab homseks tugiõpilase valima ja küsib sinu arvamust.\nSinu eesmärk: soovita ühte kandidaati ja veena Kaiet kahe põhjusega; seleta, miks teised kaks sobivad vähem.\nPiirang: Liisat ja Marti tunned sa ainult nägupidi.',
        'Kaie kaart on õpetajal: tal on oma info ja oma lemmik.',
        ['Minu arvates sobib…, sest…', 'Ta on inimene, kes…', 'Daria vajab kedagi, kes…', 'Aga … ei sobi, sest…'], ['Miks just tema?', 'Aga Mart elab ju samas majas!', 'Hea küll, siis…']), 'Kaie otsustab homme ja tahab kuulda kedagi, kes Dariat tunneb. Soovitad ühe kandidaadi nii, et Kaie saab otsuse teha.'), { main: true, level: 4 }),
      'Üks-ühele, õpetaja kaart (Kaie). Varjatud info: Karinal on kevadel palju eksameid; Mart on Kaie lemmik, sest elab Dariaga samas majas; Daria on häbelik ja joonistab väga hästi (Kaie teab seda, õpilane võib-olla mitte). Takistused (ükshaaval): 1) „Mart elab ju samas majas — see on kõige mugavam!”; 2) „Karinal on kevadel eksamid, tal ei ole aega.”; 3) „Kas Daria ei peaks rohkem eesti keelt rääkima? Siis on Mart parem.” Õnnestunud, kui: õpilane nimetab ühe kandidaadi, annab kaks põhjust kes- või mis-lausega („Karina on tüdruk, kes…”), vastab vähemalt ühele vastuväitele ja Kaie saab otsuse teha (ka kompromiss sobib: Karina + Mart vahel).'),
    ],
  },

  // ---------------------------------------------------------------- 008 AVAS R→W: genitive + postpositions, the invitation
  'b1noor-008': {
    title: 'Üllatuspidu',
    canDo: 'Ma planeerin sõbra sünnipäeva, vastan klassi vestluses küsimustele ja kirjutan 40–60-sõnalise kutse.',
    teacherPage: {
      goal: 'Ученик планирует с одноклассником праздник (кто, где, когда, что), отвечает на вопросы в чате класса и пишет приглашение из 40–60 слов (подготовка к Harno W1b).',
      core: [2, 4, 5], alt: 1,
      short: 'Станция 2 (10 мин) → станция 5 (15 мин, только приглашение). Ст. 1 и 3 — дома или в следующий раз.',
      errors: [
        '«kool ees», «Robin juures» — перед послелогом родительный падеж: «kooli ees», «Robini juures».',
        'Путают juures / juurde / juurest (где / куда / откуда): «Tule Robini juurde», «Pidu on Robini juures».',
        'В приглашении нет одного из четырёх пунктов (что, где и когда, что принести, что держать в секрете).',
      ],
      notes: [
        'Четыре пряди: ст. 1 — чтение, ст. 2 — форма, ст. 3 — произношение, ст. 4 — онлайн-переписка (продукция), ст. 5 — продукция.',
        'Онлайн-взаимодействие: ст. 4 — ответы двум людям в чате класса и уточняющий вопрос.',
        'Обратная связь в письме по целям (родительный + послелог, 4 пункта приглашения): ученик сначала проверяет сам по рубрике W1.',
        'Дом 10 + 1: «Harjuta» 10 минут ≥ 4 дней (слова + предложения: juures / juurde / juurest, kes / mis из урока 7, порядок слов из модуля 1). Реальное задание на выбор: (а) написать (не обязательно отправлять) приглашение по-эстонски на свой настоящий праздник или встречу; (б) ответить по-эстонски на одно сообщение в чате класса или кружка.',
      ],
    },
    discover: [
      station(B.text('008_d_invite', 'Robini sõnum klassi vestluses', 'Tere, 9. b! Reedel, 27. novembril on Daria sünnipäev. Teeme talle üllatuspeo! Pidu on noortekeskuse väikeses saalis kell 17–20. Saal on tasuta, aga toit ja kaunistused tuleb ise tuua. Igaüks võtab kaasa midagi süüa või juua. Kingiks ostame Dariale ühise kingituse, kunstitarvete komplekti, sest ta joonistab väga hästi. Palun andke viis eurot Milanale kolmapäevaks. Ja kõige tähtsam: Daria ei tohi midagi teada! Kirjutage siia, kes tuleb. Robin'), 1, 10),
      purpose(B.choice('008_d_check', 'Mida Robin kirjutas?', 'Loe sõnumit ja vali õige vastus.', [
        ['Millal on Daria sünnipäev?', 'reedel, 27. novembril', 'kolmapäeval', 'laupäeval, 28. novembril'],
        ['Kus on pidu?', 'noortekeskuse väikeses saalis', 'Robini juures', 'kooli sööklas'],
        ['Kui palju maksab saal?', 'ei maksa midagi', 'viis eurot', 'kakskümmend eurot'],
        ['Mida võtab igaüks kaasa?', 'midagi süüa või juua', 'oma kingituse', 'kaunistused kõigile'],
        ['Miks ostavad nad kunstitarbeid?', 'Daria joonistab hästi', 'need on odavad', 'Milana soovitas'],
        ['Kellele tuleb raha anda?', 'Milanale', 'Robinile', 'Dariale'],
      ]), 'Sa oled Milana ja vastutad raha eest. Kontrollid, kas said Robini sõnumist õigesti aru, enne kui teistele vastad.'),
      tag(B.vocab('008_d_vocab', 'Tunni sõnad.', ['kutse — приглашение', 'kutsuma — приглашать', 'pidu — праздник', 'üllatus — сюрприз', 'kingitus — подарок', 'külaline — гость', 'saal — зал', 'kaunistus — украшение', 'saladus — секрет', 'sünnipäev — день рождения', 'sõnum — сообщение', 'vestlus — разговор, чат']), {}),
      station(B.notice('008_d_rule', 'Märka: omastav + kaassõna', [
        'Kus? **Robini juures** · Kuhu? **Robini juurde** · Kust? **Robini juurest**',
        '**kooli ees** · **noortekeskuse kõrval** · **söökla taga** · **maja juures**',
        'Enne kaassõna on omastav: pidu → **peo ajal** · sõber → **sõbra juurde** · Daria → **Daria eest** (saladuses)',
      ], 'full'), 2, 10),
      purpose(B.gaps('008_d_where', 'Kus pidu on?', 'Kirjuta sulgudes olev sõna omastavas.', [
        'Pidu on [noortekeskuse] (noortekeskus) saalis.',
        'Me kohtume [kooli] (kool) ees kell pool viis.',
        'Kingitus on [Milana] (Milana) juures.',
        'Pärast tunde lähen [Robini] (Robin) juurde.',
        'Saal on [söökla] (söökla) kõrval.',
        'Daria ei tohi [peo] (pidu) kohta midagi teada.',
      ], '', 'full', 'g_notice'), 'Robin teeb peo plaani ja kirjutab, kus mis on. Paned sõnad õigesse vormi, et keegi ei läheks valesse kohta.'),
    ],
    practice: [
      station(teach(purpose(B.categorize('008_p_long', 'Pikk või lühike?', 'Kuula õpetajat: kas lause esimene sõna on pikk või lühike? Pane lause veergu, siis loe.', [
        ['Lühike: tule, sada, koli', ['Tule meile!', 'Sada eurot on palju.', 'Koli on keldris.']],
        ['Pikk: tuule, saada, kooli', ['Saada mulle kutse!', 'Tuule tõttu on pidu toas.', 'Kooli ees on park.']],
      ], 'full', 'g_notice'), 'Tule ja tuule, sada ja saada on eesti keeles eri sõnad. Harjutad pikkust, et sinu kutse ei läheks valesti.'),
      'Kõigepealt taju: õpetaja loeb paarid tule — tuule, sada — saada, koli — kooli ja õpilane näitab käega lühike / pikk. Siis loeb õpilane laused, õpetaja kuulab ainult pikkust.'), 3, 8),
      station(B.text('008_p_chat', 'Klassi vestlus pärast Robini sõnumit', [
        'Kertu: Ma tulen! Aga kas saal on esimesel või teisel korrusel?',
        'Artjom: Mina ka, aga hiljem, sest mul on trenn kuni kuueni.',
        'Kertu: Mida ma süüa võtan? Kas keegi teeb ka torti?',
        'Artjom: Kas Daria sõber Karina on ka kutsutud? Ta ei ole meie klassis.',
        'Kertu: Ma ei saa raha kolmapäevaks tuua. Kas neljapäev sobib?',
        'Artjom: Kuidas me Daria saali toome, nii et ta midagi ei arva?',
      ].join('\n\n')), 4, 10),
      teach(purpose(B.writing('008_p_reply', 'Milana vastab vestluses.', 'Sa oled Milana. Vasta kahele inimesele. Mida sa ei tea, küsi Robinilt.', [3, 5], ['Kertu', 'Artjom', 'Robin'], 2), 'Klass ootab vastuseid, muidu keegi ei tea, mida tuua. Vastad vestluses kahele inimesele ja küsid Robinilt, mis on veel lahtine.'),
      'Veebisuhtlus: õpilane valib ise, kellele vastab. Õpetaja on Robin ja vastab õpilase küsimusele kirjalikult või suuliselt (saal on teisel korrusel; Karina on kutsutud; torti teeb Kevini tüdruksõber Laura). Õnnestunud, kui vastus on kahele nimele ja on üks selge täpsustav küsimus.'),
    ],
    transfer: [
      station(B.text('008_t_sit', 'Peo plaan', 'Robin on haige ja palub, et sina teeksid peo plaani lõpuni. Helista Robinile, lepi kokku, kes mida teeb, ja kirjuta siis klassi vestlusesse lõplik kutse. Sinu variant: planeeri oma päris pidu või kokkusaamine (sünnipäev, filmiõhtu, klassiõhtu).'), 5, 15, { final: 'plan' }),
      teach(purpose(B.rolecards('008_t_call', 'Kõne Robinile.', 'Õpetaja on Robin. Mida ja kuidas öelda, otsusta ise.',
        'Olukord: klassilt on kogutud 40 eurot, saal on vaba ainult kell 17–20 ja Dariat on vaja kuidagi saali tuua.\nSinu eesmärk: leppida Robiniga kokku, kes toob tordi, kes toob Daria saali ja mis kell kõik kohtuvad.\nPiirang: Daria trenn lõpeb kell 17 spordisaalis.',
        'Robini kaart on õpetajal: tal on oma ideed.',
        ['Mis sa arvad, kes…?', 'Kas oleks hea, kui…?', 'Daria trenn lõpeb…, siis…', 'Lepime kokku, et…'], ['Ma mõtlesin, et…', 'See ei sobi, sest…', 'Hea küll!']), 'Pidu on kolme päeva pärast ja plaanis on veel augud. Lepid Robiniga kokku, kes mida teeb, et kõik toimiks.'),
      'Üks-ühele, õpetaja kaart (Robin). Varjatud info: Laura teeb tordi, aga see maksab 15 eurot; kingitus maksis 30 eurot, nii et raha ei jätku; Artjom käib Dariaga samas trennis. Takistused (ükshaaval): 1) „Tort ja kingitus kokku on 45 eurot — meil on 40!”; 2) „Mina ei saa Dariat tuua, ma olen haige.”; 3) „Kas me kohtume kell 17? Siis on Daria juba teel!” Õnnestunud, kui: lepitakse kokku tort (või odavam lahendus), kes toob Daria (nt Artjom pärast trenni) ja kohtumisaeg enne Dariat (nt 16.30 saali ees).'),
      tag(purpose(B.examWriting('008_t_invite', 'Kutse klassi vestlusesse.', 'Kirjuta 40–60 sõnaga. Kirjuta kõigist neljast punktist.', 'kutse', {
        situation: 'Klassi vestlus „9. b”. Daria ei ole selles vestluses.',
        points: ['mis pidu ja kelle jaoks', 'kus ja mis kell kohtume', 'mida igaüks kaasa võtab', 'mida peab Daria eest saladuses hoidma'],
        words: [40, 60],
      }), 'Klass vajab ühte selget sõnumit, mille järgi kõik teavad, kuhu ja millal tulla. Kirjutad kutse, mida keegi ei pea üle küsima.'), { harno: 'W1b', main: true, level: 4 }),
    ],
  },

  // ---------------------------------------------------------------- 009 PROB L→S: kes / kelle / mis / mille, neighbours
  'b1noor-009': {
    title: 'Naabrid ja pidu',
    canDo: 'Ma seletan teistele maja kodukorda ja lepin vanemaga kokku, kuidas sõbrad saavad tulla nii, et naabrid ei kurda.',
    teacherPage: {
      goal: 'Ученик пересказывает правила дома простыми словами (медиация) и договаривается с родителем о вечере с друзьями: время, шум, соседи, уборка.',
      core: [2, 3, 5], alt: 1,
      short: 'Станция 3 (12 мин: правила дома → объяснить другу) → станция 5 (15 мин). Ст. 2 — домашнее задание.',
      errors: [
        '«naaber, kes koer haugub» вместо «naaber, kelle koer haugub» (чей? — kelle, родительный падеж).',
        '«maja, mis katus on uus» вместо «maja, mille katus on uus».',
        'В договоре нет условий: полезны «Ma luban, et…» и «Kui…, siis…» (условие увидим в модуле 15, здесь — как фраза).',
      ],
      notes: [
        'Четыре пряди: ст. 1 — слушание, ст. 2 — форма, ст. 3 — чтение + медиация, ст. 4 — беглость, ст. 5 — продукция (переговоры) + онлайн-сообщение.',
        'Медиация: Артём не читал объявление — ученик объясняет простыми словами, что можно и что нельзя; не переводит фразу за фразой.',
        'Обратная связь: ст. 2 — подсказка, потом модель; ст. 4 и 5 — не перебивать, в конце 2–3 пункта по целям.',
        'Дом 10 + 1: «Harjuta» 10 минут ≥ 4 дней (смешанно: kes / kelle / mis / mille, родительный + послелог из урока 8, отрицание из модуля 1). Реальное задание на выбор: (а) прочитать объявление в своём подъезде или в школе и сказать одним предложением, что оно просит; (б) договориться по-эстонски с кем-то дома или в кружке об одной простой вещи и записать договорённость.',
      ],
    },
    discover: [
      station(teach(purpose(B.listening('009_d_tamm', 'Naaber kõneleb.', 'Enne kuulamist arva vastused. Õpetaja loeb kaks korda, sina kirjuta lünka üks sõna.', [
        'Hr Tamm: Tere! Mina olen Jüri Tamm, ma elan teie all, korteris seitse.',
        'Hr Tamm: Laupäeva õhtul oli teie korteris väga lärmakas. Muusika mängis hilja öösel.',
        'Hr Tamm: Minu naine töötab haiglas ja pidi pühapäeval kell kuus tööle minema.',
        'Hr Tamm: Ma ei ole pidude vastu, noored peavad ka lõbutsema.',
        'Hr Tamm: Aga majas on vaikne aeg kella üheteistkümnest õhtul kella seitsmeni hommikul.',
        'Hr Tamm: Järgmine kord pange palun teade trepikotta, siis me teame ette.',
      ], [
        'Hr Tamm elab korteris [seitse|7].',
        'Laupäeval mängis muusika hilja [öösel].',
        'Tamme naine töötab [haiglas].',
        'Pühapäeval pidi ta tööle minema kell [kuus|6].',
        'Vaikne aeg algab kell [üksteist|11|23].',
        'Järgmine kord tuleb panna teade [trepikotta].',
      ]), 'Naaber helistas uksekella ja ema palus sul kuulata, mida ta ütleb. Kirjutad üles faktid, et neid emale täpselt edasi anda.'),
      'Kuulamise tsükkel: ennusta (miks naaber tuleb?) → esimene kuulamine: kas ta on vihane või rahulik? → võrdle → teine kuulamine: lüngad → üks rida refleksiooni.'), 1, 10),
      tag(B.vocab('009_d_vocab', 'Tunni sõnad.', ['naaber — сосед', 'trepikoda — подъезд', 'korter — квартира', 'vaikne aeg — время тишины', 'kodukord — правила дома', 'teade — объявление', 'luba — разрешение', 'lubama — разрешать', 'koristama — убирать', 'pidu — праздник', 'sõber — друг', 'sõnum — сообщение']), {}),
      station(B.notice('009_d_rule', 'Märka: kes, kelle, mis, mille', [
        '**kes** — inimene: naaber, **kes** elab meie all',
        '**kelle** — kelle oma?: naaber, **kelle** koer haugub',
        '**mis** — asi: teade, **mis** on trepikojas · **mille** — mille oma?: maja, **mille** uks on punane',
      ], 'full'), 2, 10),
      purpose(B.cloze('009_d_house', 'Meie maja inimesed.', 'Vali igasse lünka sobiv sõna.', 'Milana maja', [
        'Meie majas elab palju inimesi. Hr Tamm on naaber, {*kes|kelle|mis} elab meie all. Tema naine on arst, {*kelle|kes|mille} töö algab vara hommikul. Üleval elab pere, {*kelle|kes|mis} koer haugub öösiti. Trepikojas on teade, {*mis|kes|mille} räägib vaiksest ajast. Meie maja, {*mille|mis|kelle} katus on uus, on väga vana. Minu lemmiknaaber on vanaproua Helju, {*kes|kelle|mis} küpsetab meile pirukaid.',
      ]), 'Milana kirjutab Dariale oma majast. Valid õiged sõnad, et oleks selge, kellest või millest jutt käib.'),
    ],
    practice: [
      station(B.text('009_p_rules', 'Teade trepikojas', 'Head elanikud! Meie maja kodukord: vaikne aeg on iga päev kella 23-st kella 7-ni. Kui teil on pidu, pange paar päeva varem trepikotta teade. Jalgrattaid ja lapsevankreid ei tohi jätta trepikotta. Prügi viige prügimajja, mitte ukse ette. Rõdul ei tohi grillida. Küsimuste korral kirjutage ühistu e-posti aadressile. Ühistu juhatus'), 3, 12),
      teach(purpose(B.speaking('009_p_tell', 'Seleta Artjomile.', 'Õpetaja on Artjom, kes teadet ei lugenud. Seleta lihtsalt, mis laupäeval lubatud on.', [
        'Kas me võime kella kaheni muusikat kuulata?', 'Kuhu ma oma ratta panen?', 'Kas rõdul saab grillida?', 'Mida me pärast pidu prügiga teeme?',
      ], [90, 150], ['Teates on kirjas, et…', 'See tähendab, et…', 'Ei tohi…, aga võib…', 'Pärast kella 23…']), 'Artjom tuleb laupäeval külla ja tahab teada, mis majas lubatud on. Seletad talle kodukorra lihtsalt, et keegi ei peaks kurtma.'),
      'Vahendamine, õpetaja on Artjom: küsi „Mis see tähendab?” sõnade „kodukord”, „prügimaja” kohta — õpilane seletab teiste sõnadega. Õnnestunud, kui Artjom teab: muusika vaiksemaks kell 23, ratas mitte trepikotta, rõdul ei grillita, prügi prügimajja.'),
      station(tag(purpose(B.speaking('009_p_house', 'Minu maja 90 sekundiga.', 'Õpetaja on uus naaber: räägi 90 sekundit oma majast. Siis tee sõbrale 30-sekundiline häälsõnum lemmiknaabrist.', [
        'Kus sinu maja on ja kui suur see on?', 'Kes sinu naabrid on?', 'Kas sa tunned oma naabreid?', 'Mis sinu majas on hästi ja mis halvasti?', 'Mida naabrid sinu arvates teha ei tohi?',
      ], [90, 130], ['Meie maja on…', 'Meie all elab…, kelle…', 'Mulle meeldib, et…', 'Kahjuks…']), 'Uus naaber tahab maja kohta kõike teada. Räägid vabalt ja ladusalt, nagu trepikojas juttu ajades.'), { fluency: true }), 4, 10),
    ],
    transfer: [
      station(B.text('009_t_sit', 'Laupäeval meile?', 'Sa tahad laupäeval kutsuda neli sõpra külla: filmiõhtu ja pitsa. Vanem ei ole kindel, sest eelmisel korral kaebas naaber hr Tamm. Lepi vanemaga kokku, mis kell sõbrad tulevad, kui kaua jäävad, mida teete, kes koristab ja kuidas maja kodukord ning naabrid rahule jäävad. Siis kirjuta sõpradele sõnum. Sinu variant: lepi kokku oma päris plaan (sünnipäev, filmiõhtu, koos õppimine).'), 5, 15, { final: 'negotiate' }),
      teach(tag(purpose(B.rolecards('009_t_talk', 'Kas sõbrad võivad tulla?', 'Õpetaja on sinu ema või isa. Mida ja kuidas öelda, otsusta ise.',
        'Olukord: sõbrad ootavad vastust täna õhtuks; eelmisel korral kaebas naaber müra pärast.\nSinu eesmärk: saada luba laupäevaks nii, et sõbrad saavad jääda vähemalt kella kümneni.\nPiirang: pühapäeva hommikul kell 10 on sul trenn.',
        'Vanema kaart on õpetajal: tal on oma tingimused.',
        ['Ma luban, et…', 'Me võiksime…', 'Kui sa tahad, siis…', 'Kas sobib, kui…?'], ['Ma ei tea…', 'Aga eelmine kord…', 'Hea küll, aga…']), 'Sõbrad ootavad vastust ja vanem on kahtlev. Lepid kokku plaani, millega nõustuvad nii vanem kui ka naabrid.'), { main: true, level: 4 }),
      'Üks-ühele, õpetaja kaart (vanem). Varjatud info: oled nõus kella 22-ni, kui trepikojas on teade ja pärast koristatakse; tahad sõpru näha ja tead, et Artjomi ema on sinu tuttav. Takistused (ükshaaval): 1) „Neli on liiga palju — kaks sõpra!”; 2) „Kes pärast koristab? Eelmine kord tegin mina.”; 3) „Ja hr Tamm? Ma ei taha jälle tema juttu kuulata.” Õnnestunud, kui: lepitakse kokku sõprade arv, kellaaeg, koristamine ja teade naabritele; õpilane pakub vähemalt ühe kompromissi ja kordab lõpus kokkuleppe ühe-kahe lausega.'),
      purpose(B.writing('009_t_msg', 'Sõnum sõpradele.', 'Kirjuta sõprade vestlusesse 3–5 lausega, milles te vanemaga kokku leppisite.', [3, 5], ['kell', 'naabri'], 1), 'Sõbrad ootavad vastust ja peavad teadma reegleid enne tulekut. Kirjutad sõnumi, mille järgi igaüks teab, mis kell ja mis tingimustel tulla.'),
    ],
  },

  // ---------------------------------------------------------------- 010 module check (= a2b1-010)
  // Blueprint §5.2: A — the module's exam format (W1b message), B — the final task in a new situation (Timur's babysitter:
  // describe people and recommend one; a message to grandma), C — genitive, kes / mis / kelle + module 1 items (questions,
  // present, negation) and the module's words. Pass mark 70 % a part; no new words or grammar.
  'b1noor-010': {
    title: 'Kontroll 2: minu inimesed',
    assessment: true,
    shortSheet: true,
    canDo: 'Ma kirjutan 40–60-sõnalise sõnumi nelja punktiga, kirjeldan inimesi ja kasutan omastavat ning kes- ja mis-lauseid õigesti.',
    discover: [
      B.text('010_d_intro', 'Kontroll 2', 'See on mooduli 2 kontroll. Osa A: kirjutad sõnumi nagu eksamil. Osa B: uus olukord — leiad väikesele vennale lapsehoidja ja kutsud vanaema sünnipäevale. Osa C: lugemine, keel ja sõnad. Eesmärk on igas osas vähemalt 70%. Uusi sõnu ega reegleid siin ei ole.'),
      B.examPart('010_d_part', 'R', { part: 'Osa C. Lugemine, keel ja sõnad', minutes: 40, points: 44, tasks: 6, target: 70, note: 'Sõnaraamatut ei kasuta.' }),
      B.vocab('010_d_vocab', 'Kontrolli sõnad.', ['lapsehoidja — няня', 'kontroll — проверка', 'eesmärk — цель', 'kingitus — подарок', 'sünnipäev — день рождения', 'sugulane — родственник']),
      B.reading('010_d_letter', 'Lugemine 1. Vanaema kiri.', 'Loe vanaema kirja ja vasta küsimustele lühidalt.', 'Kiri Narvast', [
        'Kallis Milana! Aitäh sinu kirja eest. Mul on hea meel, et sul on uues koolis juba sõpru. Robin, kelle pildi sa saatsid, tundub tore poiss. Siin Narvas on kõik vanaviisi. Naabrinaine Galina, kelle koer kogu aeg haukus, kolis tütre juurde Tartusse. Nüüd on trepikojas vaikne. Minu õe poeg Igor käib mul iga nädal külas ja aitab poes käia. Detsembris saan seitsekümmend. Ma tahan teha väikese peo, mis ei ole liiga suur: ainult pere ja paar sõpra. Pidu on laupäeval, kahekümnendal detsembril, minu juures. Söögi teen ise, ainult tordi tellin pagariäris, mis on meie maja kõrval. Sugulased Sillamäelt lubasid ka tulla. Kas te tulete kõik Tallinnast? Timur võib magada minu juures diivanil. Kirjuta mulle, mis kingitust Timur tahaks, ta on ju jõulude ajal jälle aasta vanem. Kallistan sind ja Timurit! Vanaema',
      ], [
        ['Mis on Milanal uues koolis juba olemas?', 'sõbrad|sõpru'],
        ['Kuhu kolis naabrinaine Galina?', 'tütre juurde Tartusse|Tartusse|tütre juurde'],
        ['Kes käib vanaemal iga nädal külas?', 'Igor|õe poeg Igor|vanaema õe poeg'],
        ['Mitu aastat saab vanaema detsembris?', 'seitsekümmend|70'],
        ['Keda vanaema peole kutsub?', 'pere ja paar sõpra|pere ja sõpru|ainult pere ja paar sõpra'],
        ['Kus võib Timur magada?', 'vanaema juures diivanil|diivanil|vanaema juures'],
      ]),
      B.match('010_d_words', 'Sõnad. Mis on mis?', 'Ühenda sõna ja selgitus.', [
        ['nõbu', 'onu või tädi laps'],
        ['vanavanemad', 'ema ja isa vanemad'],
        ['naaber', 'inimene, kes elab sinu kõrval'],
        ['tugiõpilane', 'vanem õpilane, kes aitab uut õpilast'],
        ['kutse', 'sõnum, millega sind peole kutsutakse'],
        ['kingitus', 'asi, mille sa sünnipäeval kingid'],
        ['trepikoda', 'maja osa, kus on trepp ja korterite uksed'],
        ['kodukord', 'maja reeglid'],
      ], 'full', 'g_vocab'),
      why(B.wordorder('010_d_order', 'Keel 1. Pane lause kokku.', 'Pane sõnad õigesse järjekorda. Alusta suure tähega sõnast.', [
        'Igor | on | vanaema | õe | poeg',
        'Timur | magab | vanaema | juures',
        'Robin | on | poiss, | kes | aitas | mind',
        'Detsembris | on | vanaema | juubel',
        'Pagariäri | on | meie | maja | kõrval',
        'Laupäeval | ei | ole | mul | aega',
      ], 'full', 'g_notice'), ['Omastav: õe poeg (tund 6).', 'Omastav + kaassõna (tund 8).', 'Kes-lause, enne kes koma (tund 7).', 'Aeg ees, tegusõna teisel kohal (moodul 1).', 'Omastav + kaassõna (tund 8).', 'Eitus, mul ei ole + osastav (moodul 1).']),
      why(B.cloze('010_d_cloze', 'Keel 2. Milana vastus vanaemale.', 'Vali Milana kirjas igasse lünka õige vorm.', 'Kallis vanaema!', [
        'Kallis vanaema! Aitäh kirja eest! Muidugi me tuleme sinu {*juubelile|juubel|juubelist}. Isa võtab vaba päeva ja me sõidame {*Narva|Narvas|Narvast} rongiga. Robin on poiss, {*kes|kelle|mis} aitas mind esimesel päeval. Tema {*venna|vend|vennaga} tüdruksõber Laura teeb väga häid torte, võib-olla küsin temalt retsepti.',
        '',
        'Timur tahab legosid, {*mis|kes|kelle} on robotitega. Ta {*ei räägi|ei räägib|ei rääkima} sellest kellelegi, see on saladus! Kas Igor on ka {*sinu|sina|sind} peol? Kallistan! Milana',
      ]), ['Kuhu? → juubelile (alaleütlev).', 'Kuhu? → Narva (lühike sisseütlev).', 'Kes — inimene, alus (tund 7).', 'Omastav: venna tüdruksõber (tund 6).', 'Mis — asi (tund 7).', 'Eitus: ei + tüvi (moodul 1).', 'Omastav: sinu peol (tund 6).']),
      why(B.gaps('010_d_ask', 'Keel 3. Küsi vanaemalt.', 'Kirjuta küsimusse puuduv küsisõna.', [
        '[Millal] sinu pidu algab? — Kell kolm.',
        '[Kus] pidu on? — Minu juures.',
        '[Kas] Igor tuleb ka? — Jah, tuleb.',
        '[Kelle] juures Timur magab? — Minu juures.',
        '[Mida] me kaasa võtame? — Ainult head tuju.',
        '[Kust] Igor tuleb? — Ta tuleb Sillamäelt.',
      ], '', 'full', 'g_notice'), ['Millal? — aeg (moodul 1).', 'Kus? — koht.', 'Kas-küsimus, vastus jah.', 'Kelle? — omastav (tund 6).', 'Mida? — sihitis.', 'Kust? — koht, kust tullakse.']),
    ],
    practice: [
      B.examPart('010_p_lpart', 'L', { part: 'Osa C. Kuulamine', minutes: 15, points: 12, tasks: 2, target: 70, note: 'Õpetaja loeb iga teksti kaks korda.' }),
      B.listening('010_p_mom', 'Kuulamine 1. Ema häälsõnum.', 'Õpetaja loeb ema häälsõnumi kaks korda. Kirjuta lünka üks sõna või number.', [
        'Ema: Milana, siin ema. Laupäeval on mul tööl pikk päev, kella kaheksast kuni kuueni.',
        'Ema: Isa on Soomes onu Sergei juures, ta tuleb alles pühapäeval.',
        'Ema: Timur ei saa üksi kodus olla, ta on alles kaheksa.',
        'Ema: Kas sa saaksid leida talle lapsehoidja? Sinul on ju laupäeval võistlus.',
        'Ema: Maksta saame kuus eurot tunnis. Lapsehoidja peab oskama ka eesti keelt, sest Timur õpib eesti koolis.',
        'Ema: Helista mulle õhtul pärast kaheksat. Aitäh, kallis!',
      ], [
        'Ema töötab laupäeval kella [kaheksast|8] kuni kuueni.',
        'Isa on Soomes [onu] Sergei juures.',
        'Timur on alles [kaheksa|8] aastat vana.',
        'Laupäeval on Milanal [võistlus].',
        'Lapsehoidjale saab maksta [kuus|6] eurot tunnis.',
        'Lapsehoidja peab oskama [eesti] keelt.',
      ]),
      B.examListen('010_p_who', 'Kuulamine 2. Kes see on?', 'Õpetaja loeb viis lühikest kirjeldust kaks korda. Vali õige vastus.', 'choice', [
        'Üks.', 'Milana: Minu nõbu Alina on tüdruk, kes elab Soomes ja tantsib balletti.',
        'Kaks.', 'Robin: Minu onu Marek on mees, kelle auto on punane.',
        'Kolm.', 'Daria: Karina on tugiõpilane, kes aitab mind matemaatikas.',
        'Neli.', 'Artjom: Minu naaber on vanaproua, kelle kass istub alati aknal.',
        'Viis.', 'Kertu: Väitlusklubi on ring, mis on reedeti raamatukogus.',
      ], [
        ['Mida teeb Alina?', 'tantsib balletti', 'mängib korvpalli', 'joonistab'],
        ['Mis on Mareki juures punane?', 'auto', 'jope', 'maja'],
        ['Milles aitab Karina Dariat?', 'matemaatikas', 'eesti keeles', 'kunstis'],
        ['Kus istub naabri kass?', 'aknal', 'trepikojas', 'diivanil'],
        ['Millal on väitlusklubi?', 'reedeti', 'esmaspäeviti', 'laupäeviti'],
      ]),
      B.examPart('010_p_wpart', 'W', { part: 'Osa A. Kirjutamine', minutes: 25, points: 20, tasks: 3, target: 70, note: 'Harno B1 kirjutamine 1 vormis: 40–60 sõna, neli punkti.' }),
      why(B.formtext('010_p_forms', 'Keel 4. Kelle oma?', 'Kirjuta sulgudes olev sõna omastavas.', 'Peo plaan', [
        'Pidu on [vanaema] (vanaema) juures. Me sõidame [isa] (isa) autoga. [Igori] (Igor) ema toob kooki.',
        'Timur magab [diivani] (diivan) peal. Mina istun [nõo] (nõbu) Alina kõrval. Kingitus on [õe] (õde) kotis.',
      ]), ['vanaema → vanaema (sama).', 'isa → isa (sama).', 'Igor → Igori.', 'diivan → diivani.', 'nõbu → nõo.', 'õde → õe.']),
      why(B.errorfix('010_p_fix', 'Keel 5. Paranda viga.', 'Igas lauses on üks viga. Kirjuta lause õigesti.', [
        ['See on minu vend sõber.', 'See on minu venna sõber.'],
        ['Väitlusklubi on ring, kes on reedeti.', 'Väitlusklubi on ring, mis on reedeti.'],
        ['Pidu on Robin juures.', 'Pidu on Robini juures.'],
        ['Naaber, kes koer haugub, kolis ära.', 'Naaber, kelle koer haugub, kolis ära.'],
        ['Kas kus sa elad?', 'Kus sa elad?'],
        ['Timur ei räägib sellest.', 'Timur ei räägi sellest.'],
      ]), ['Omastav: venna sõber (tund 6).', 'Mis — asi (tund 7).', 'Omastav + kaassõna (tund 8).', 'Kelle — kelle oma? (tund 9).', 'Küsisõna järel kas ei tule (moodul 1).', 'Eitus: ei + tüvi (moodul 1).']),
      tag(B.examWriting('010_p_note', 'Kirjutamine. Sõnum vanaemale.', 'Kirjuta vanaemale 40–60 sõnaga. Kirjuta kõigist neljast punktist.', 'teade', {
        situation: 'Vanaema kutsus kogu pere oma 70. sünnipäevale Narva. Vasta talle Messengeris.',
        points: ['aitäh kutse eest ja kes teie perest tuleb', 'millal ja millega te tulete', 'mida Timur kingiks tahab', 'üks küsimus peo kohta'],
        words: [40, 60], opening: 'Kallis vanaema!',
      }), { harno: 'W1b' }),
      B.rubricW1('010_p_r1', ['kes tuleb', 'millal ja millega', 'Timuri kingisoov', 'küsimus peo kohta']),
    ],
    transfer: [
      B.examPart('010_t_part', 'S', { part: 'Osa B. Rääkimine', minutes: 15, points: 20, tasks: 2, target: 70, note: 'Õpetajaga üks-ühele.' }),
      B.choice('010_t_which', 'Enne rääkimist. Kes või mis?', 'Vali sobiv sõna.', [
        ['Mulle on vaja lapsehoidjat, … räägib eesti keelt.', 'kes', 'mis', 'kelle'],
        ['Timur armastab mänge, … on robotitega.', 'mis', 'kes', 'kelle'],
        ['Karina on tüdruk, … ema töötab koolis.', 'kelle', 'kes', 'mis'],
        ['See on maja, … uks on punane.', 'mille', 'mis', 'kelle'],
        ['Mart on poiss, … mängib korvpalli.', 'kes', 'mis', 'mille'],
        ['Ma otsin ringi, … on kolmapäeviti.', 'mis', 'kes', 'kelle'],
      ], 'full', 'g_notice'),
      teach(B.dialogue('010_t_phone', 'Kõne lapsehoidjale.', 'Kirjuta Milana küsimustesse puuduv küsisõna.', 'Milana', 'Liisa', [
        ['A', 'Tere! [Kas] sa saaksid laupäeval Timurit hoida?'],
        ['B', 'Võib-olla. Mis kell?'],
        ['A', 'Kaheksast kuueni. [Kui] palju sa tunnis küsid?'],
        ['B', 'Viis eurot.'],
        ['A', '[Kus] sa elad?'],
        ['B', 'Teie kõrvalmajas.'],
        ['A', '[Millega] sa vabal ajal tegeled?'],
        ['B', 'Ma käin kooliteatris.'],
      ], 'g_notice'), 'Üks-ühele: pärast lünkade täitmist loevad õpilane (Milana) ja õpetaja (Liisa) dialoogi ette.'),
      teach(tag(B.rolecards('010_t_choose', 'Osa B. Kes hoiab Timurit?', 'Õpetaja on sinu ema. Mida ja kuidas öelda, otsusta ise.',
        'Olukord: ema helistab õhtul; sina rääkisid kolme lapsehoidjaga: Liisa (16, naaber, räägib eesti ja vene keelt, 5 € tunnis), Mart (15, korvpallur, räägib ainult eesti keelt, 6 € tunnis), Karina (16, kogemus oma väikese õega, aga laupäeval vaba alles kella kümnest, 6 € tunnis).\nSinu eesmärk: kirjelda kõiki kolme lühidalt ja soovita emale ühte kahe põhjusega.\nPiirang: ema peab otsustama täna õhtul.',
        'Ema kaart on õpetajal.',
        ['… on tüdruk / poiss, kes…', 'Minu arvates sobib…, sest…', 'Aga … ei sobi, sest…'], ['Kes neist…?', 'Aga…?']), { harno: 'S1a', main: true }),
      'Osa B, õpetaja kaart (ema). Varjatud info: Timur kardab koeri ja Liisal on suur koer; ema eelistab, et lapsehoidja räägiks ka vene keelt. Takistused: 1) „Liisal on ju suur koer, Timur kardab!”; 2) „Karina ei saa kella kaheksast — mis siis?” Õnnestunud (2 punkti), kui õpilane kirjeldab kõiki kolme kes- või mis-lausega, soovitab ühe kahe põhjusega ja leiab lahenduse vastuväitele. Abiga 1, ei õnnestu 0.'),
      B.rubricSpeaking('010_t_rs'),
      teach(B.table('010_t_result', 'Võrdle kontrolliga 1.', 'Kirjuta oma tulemus ja kontrolli 1 tulemus. Mis paranes?', 'Osa, Kontroll 1, Kontroll 2, Mis paranes?', [
        'A. Kirjutamine |  |  | ', 'B. Rääkimine |  |  | ', 'C. Lugemine ja kuulamine |  |  | ', 'C. Keel: omastav, kes / mis |  |  | ', 'C. Keel: küsimused ja eitus (moodul 1) |  |  | ', 'C. Sõnad |  |  | ',
      ]), 'Õpetajale: alla 70% osas → üks sihitud kodutöö („Harjuta” selle vormi harjutused) ja lõpuülesanne uuesti järgmise tunni esimese jaamana. Moodulit ei korrata.'),
      B.selfcheck('010_t_self', ['Ma seletan, kes on minu pere ja kelle kes on.', 'Ma kirjeldan inimest kes- ja mis-lausega.', 'Ma kirjutan kutse või sõnumi nelja punktiga.', 'Ma vastan klassi vestluses ja küsin täpsustust.', 'Ma lepin kokku ja pakun kompromissi.'], 'Moodul 2 tehtud'),
    ],
  },
}, {
  'b1noor-006': 'LUGU R→W', 'b1noor-007': 'KUUL L→S', 'b1noor-008': 'AVAS R→W', 'b1noor-009': 'PROB L→S', 'b1noor-010': 'EKS',
});
