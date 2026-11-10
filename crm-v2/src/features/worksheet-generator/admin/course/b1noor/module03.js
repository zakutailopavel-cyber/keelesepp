// „B1 noorkeele õppija” (course key b1noor), module 3 „Minu tuba, meie kodu” (b1noor-011…015), stage A2+, lesson
// design v3 stations (docs/COURSE_DESIGN_STATIONS.md §1–§6, the 10 evidence rules of A2B1_EVIDENCE.md). Teen version of
// the blueprint's module 3 „Kodu ja üürileandja” (docs/A2B1_COURSE_BLUEPRINT.md §3.1): describe and compare homes, choose
// a flat from ads with the family (the teen argues for his / her own needs; money stays the parents' matter), report a
// fault at school by phone and in writing, ask when it will be fixed; Harno emphasis R
// (signs, ads → R1); 9th-grade track (§8.3): home place, the language-structure formation task with adjective suffixes.
// Lesson ids and the a2b1 lessons they stand for (the same slot of the grammar spiral):
//   b1noor-011 ≈ a2b1-011  RÄÄK L→S „Minu tuba” — final: advise (Artjom's dark new room, 100 €)
//   b1noor-012 ≈ a2b1-012  PROB R→S „Uus kodu kuulutusest” — final: decide (argue with Daria's mother which flat suits Daria: own room, minutes to school / training)
//   b1noor-013 ≈ a2b1-013  LUGU R→W „Kolimispäev” — final: plan (Kertu's grandmother moves in: what goes where, who carries)
//   b1noor-014 ≈ a2b1-014  PROB L→S „Midagi on katki!” — final: complain (the cold classroom radiator: the class elder calls the school caretaker + a Stuudium note)
//   b1noor-015 = a2b1-015  module check: R1 ads + the 9th-grade formation task, the final task in a new situation (the
//                          class-trip hostel), local cases, suffixes, mis / mille + module 1–2 items, words
// Grammar (blueprint §3.2, module 3): local cases and direction (kus? kuhu? kust?, short illative tuppa / kappi / kööki) — I
// (013); adjective suffixes -line / -ne, -kas, -lik, -tu — I (011, recognised and formed); kes / mis / mille — P (012,
// 014); comparison (suurem kui, kõige …) — R (012); recycled: genitive + postposition (module 2), present tense, negation
// and questions (module 1).
// Cast as in modules 1–2 (Milana, Robin, Artjom, Daria, Kertu, class teacher Kaie); new: Artjom's brother Maksim, Daria's
// mother Olena and sister Vika (5), the cat Murka, flat owner Malle Sepp, school caretaker
// (majandusjuhataja) Peeter Rebane, hostel hostess Ülle. Every price, size and time belongs to the cast's story (the ads
// are invented); the real things named are the streets (Pallasti, Akadeemia tee, Ehitajate tee) and the portals kv.ee /
// city24.ee in the homework.
// Listening: recorded with Neurokõne (tools/listening-audio/build.mjs, listeningAudio.json); after a transcript edit run it again.
import { B, tag, teach, why, withShapes } from '../blocks.js';
import { purpose, station } from '../stationBlocks.js';

export const MODULE = { id: 'b1noor-module-03', course: 'b1noor', title: 'Minu tuba, meie kodu', level: 'A2+', design: 'v3-stations', template: 'v4' };

export const LESSONS = withShapes({
  // ---------------------------------------------------------------- 011 RÄÄK L→S: adjective suffixes, my room
  'b1noor-011': {
    title: 'Minu tuba',
    canDo: 'Ma kirjeldan oma tuba omadussõnadega (päikeseline, ruumikas, lärmakas) ja annan sõbrale nõu, mida oma toas muuta.',
    teacherPage: {
      goal: 'Ученик описывает свою комнату прилагательными с суффиксами (-line, -kas, -lik, -tu) и советует другу, как переделать тёмную комнату за 100 €.',
      core: [2, 4, 5], alt: 1,
      short: 'Станция 2 (10 мин: правило и образование слов) → станция 5 (15 мин). Аудио (ст. 1) и долгота (ст. 3) — дома или в начале следующего урока.',
      errors: [
        '«päikesene tuba» вместо «päikeseline» — от päike суффикс -line (основа päikese-).',
        '«Ma elan päikeseline toas» вместо «päikeselises toas» — прилагательное склоняется вместе с существительным.',
        '«Panen riided kapis» вместо «kappi» (куда? — краткий иллатив; станция 3, урок 13).',
      ],
      notes: [
        'Четыре пряди: ст. 1 — понимание на слух, ст. 2 — форма (словообразование), ст. 3 — произношение, ст. 4 — беглость, ст. 5 — продукция (совет).',
        '9 класс: ст. 2 — та же форма, что задание на словообразование в экзамене 9 класса (часть «язык»); на контроле 15 — снова.',
        'Обратная связь: на ст. 2 и 3 сначала подсказка (повторить слово с вопросительной интонацией), модель — только если ученик не исправил сам. На ст. 4 и 5 не перебивать; в конце 2–3 пункта по «Типичным ошибкам».',
        'Дом 10 + 1: «Harjuta» 10 минут ≥ 4 дней (слова урока в обе стороны + предложения: суффиксы -line / -kas / -lik / -tu, kes / mis из модуля 2, вопросы из модуля 1). Реальное задание на выбор: (а) описать свою комнату в 5 предложениях с тремя такими прилагательными; (б) открыть одно объявление на kv.ee или city24.ee и выписать 3 прилагательных о квартире.',
      ],
    },
    discover: [
      station(teach(purpose(B.listening('011_d_robin', 'Robini toa video.', 'Enne kuulamist arva vastused. Õpetaja loeb kaks korda, sina kirjuta lünka üks sõna või number.', [
        'Robin: Tere! Täna näitan teile oma tuba. See on väike, ainult kümme ruutmeetrit, aga see on minu oma.',
        'Robin: Aken on lõuna poole, nii et päeval on tuba väga päikeseline. Suvel on siin isegi liiga palav.',
        'Robin: Akna all on kirjutuslaud. Siin teen kodutöid ja mängin arvutis.',
        'Robin: Voodi on seina ääres. Voodi all on kaks suurt sahtlit, sinna mahuvad kõik mu talveriided.',
        'Robin: Ukse kõrval on kapp. Kapi uks ei lähe hästi kinni, isa lubab selle ära parandada.',
        'Robin: Seinal on korvpalliplakat ja riiul, kus on mu karikad.',
        'Robin: Ainus probleem: tuba on tänava pool ja öösel on natuke lärmakas. Siis panen kõrvaklapid pähe.',
      ], [
        'Robini tuba on [kümme|10] ruutmeetrit.',
        'Aken on [lõuna] poole.',
        'Kirjutuslaud on akna [all].',
        'Voodi all on kaks suurt [sahtlit].',
        'Kapi [uks] ei lähe hästi kinni.',
        'Öösel on tuba natuke [lärmakas].',
      ]), 'Robin tegi klassi vestlusesse video oma toast. Kirjutad üles, mis kus on, et oma toast samamoodi rääkida.'),
      'Kuulamise tsükkel: 1) 30 s ennustamist (mis võiks olla akna all?); 2) esimene kuulamine ilma kirjutamata — „Kas Robinile tema tuba meeldib?”; 3) õpilane võrdleb oma ennustust; 4) teine kuulamine, lüngad; 5) üks rida „mis aitas / mis jäi kuulmata”.'), 1, 10),
      tag(B.vocab('011_d_vocab', 'Tunni sõnad.', ['tuba — комната', 'kirjutuslaud — письменный стол', 'kapp — шкаф', 'riiul — полка', 'sahtel — ящик', 'sein — стена', 'aken — окно', 'ruutmeeter — квадратный метр', 'päikeseline — солнечный', 'ruumikas — просторный', 'lärmakas — шумный', 'hubane — уютный']), {}),
      station(B.notice('011_d_rule', 'Märka: sõnast omadussõna', [
        '**-line / -ne**: päike → **päikeseline** tuba · värv → **värviline** vaip',
        '**-kas**: ruum → **ruumikas** kapp · lärm → **lärmakas** tänav',
        '**-lik**: sõber → **sõbralik** naaber · oht → **ohtlik** trepp',
        '**-tu** (ilma): mõte → **mõttetu** ost · värv → **värvitu** sein',
        'Omadussõna käänub koos nimisõnaga: **päikeselises** toas · **ruumika** toa aken (moodul 2: omastav)',
      ], 'full'), 2, 10),
      purpose(B.wordforms('011_d_make', 'Tee sõnast omadussõna.', 'Tee sulgudes olevast sõnast omadussõna ja kirjuta see lünka.', [
        ['päike', 'Hommikul paistab päike otse aknasse: tuba on väga …', 'päikeseline'],
        ['ruum', 'Tuba on suur ja …, sinna mahub ka diivan.', 'ruumikas'],
        ['lärm', 'Aken on tänava poole ja öösel on tuba …', 'lärmakas'],
        ['värv', 'Seinad on valged, aga vaip on …', 'värviline'],
        ['oht', 'Juhe on keset põrandat, see on …: keegi võib kukkuda.', 'ohtlik'],
        ['mõte', 'Nii väikesesse tuppa suurt kappi osta on …', 'mõttetu'],
      ], 'full'), 'Robin kirjutab oma video alla kommentaare. Teed sõnadest omadussõnad, et tema kirjeldus oleks lühike ja täpne.'),
    ],
    practice: [
      station(teach(purpose(B.categorize('011_p_sound', 'Kapi või kappi?', 'Kuula õpetajat. Iga lause esimene sõna on kas lühem (kelle? mille?) või pikem (kuhu?). Pane lause õigesse veergu, siis loe ise.', [
        ['Lühem: kapi, saali, linna (mille?)', ['Kapi uks ei lähe kinni.', 'Saali aknad on suured.', 'Linna park on ilus.']],
        ['Pikem: kappi, saali, linna (kuhu?)', ['Kappi mahuvad kõik riided.', 'Saali tuleb palju inimesi.', 'Linna sõidame bussiga.']],
      ], 'full', 'g_notice'), 'Eesti keeles on „kapi uks” ja „pane kappi” eri vormid, mis erinevad ainult pikkuse poolest. Harjutad, et sinu juhis oleks õigesti mõistetav.'),
      'Kõigepealt taju: õpetaja ütleb paarid kapi — kappi, saali — saali, linna — linna (teine on pikem, III välde) ja õpilane näitab käega lühem / pikem. Siis loeb õpilane laused, õpetaja kuulab ainult esimese sõna pikkust.'), 3, 8),
      station(teach(tag(purpose(B.speaking('011_p_room', 'Minu tuba 90 sekundiga.', 'Õpetaja on Robin, kes pole sinu juures käinud: räägi 90 sekundit oma toast. Siis tee vanaemale 30-sekundiline häälsõnum: mida sa oma toas muudaksid?', [
        'Kui suur sinu tuba on?', 'Mis on akna all ja mis seina ääres?', 'Kas sinu tuba on päikeseline või pigem pime?', 'Mis sulle oma toas kõige rohkem meeldib?', 'Kas sul on oma tuba või jagad seda kellegagi?', 'Mis on sinu toas mõttetu või üleliigne?',
      ], [90, 130], ['Minu tuba on…', 'Akna all on…', 'Mulle meeldib, et…', 'Kahjuks on…']), 'Robin tahab teada, milline on sinu tuba, aga ta ei ole sinu juures käinud. Räägid vabalt ja kiiresti, nagu videokõnes.'), { fluency: true }),
      'Ladusus: küsi kiiresti, ära paranda vahele. Häälsõnum on uus kuulaja (vanaema) ja uus eesmärk (mida muuta), mitte sama jutt. Lõpus 2 märkust omadussõnade kohta.'), 4, 10),
    ],
    transfer: [
      station(B.text('011_t_sit', 'Artjomi uus tuba', 'Artjomi vend Maksim läks Tartusse ülikooli ja Artjom saab nüüd tema toa. Tuba on suurem kui Artjomi vana tuba, aga pime ja igav: aken on põhja poole, seinad on hallid ja vana diivan on katki. Artjomil on toa jaoks 100 eurot, mille ta sai sünnipäevaks. Ta helistab sulle videokõnega, näitab tuba ja küsib nõu. Sinu variant: anna nõu sõbrale või pereliikmele, kelle tuba sa tead.'), 5, 15, { final: 'advise' }),
      B.phrasebank('011_t_phrases', [
        ['Nõu', ['Minu arvates võiksid…', 'Proovi…', 'Ma ei ostaks…, sest…']],
        ['Milline tuba?', ['päikeseline', 'hubane', 'ruumikas', 'värviline', 'mõttetu']],
        ['Raha', ['See on odav.', 'See maksab umbes…', '100 euro eest saab…']],
      ]),
      teach(tag(purpose(B.rolecards('011_t_advice', 'Videokõne Artjomiga.', 'Õpetaja on Artjom. Mida ja kuidas öelda, otsusta ise.',
        'Olukord: Artjom näitab videokõnes oma uut tuba ja küsib nõu.\nSinu eesmärk: anna Artjomile vähemalt kolm nõuannet, mis mahuvad 100 euro sisse, ja põhjenda neid omadussõnadega (päikeseline, hubane, ruumikas…).\nPiirang: sa näed tuba ainult telefoni ekraanilt ega tea, mida Artjomi ema lubab.',
        'Artjomi kaart on õpetajal: tal on oma soovid ja üks keeld.',
        ['Minu arvates võiksid…', 'Kui aken on põhja poole, siis…', 'See on odav ja…', 'Mõttetu on osta…, sest…'], ['Mis sa arvad?', 'Aga see on kallis!', 'Ema ei luba…']), 'Artjom tahab, et uus tuba oleks tema oma, aga raha on vähe. Annad nõu, mille järgi ta saab kohe poodi minna.'), { main: true, level: 4 }),
      'Üks-ühele, õpetaja kaart (Artjom). Varjatud info: ema ei luba seinu värvida enne kevadet; Artjom tahab kõige rohkem suurt telerit (300 €); vana diivani võib viia taaskasutuskeskusesse ja Maksimi raamaturiiul jäi tuppa. Takistused (ükshaaval, oota õpilase reaktsiooni): 1) „Aga ma tahan suurt telerit!”; 2) „Ema ei luba seinu värvida.”; 3) „Lambid on nii kallid…” Õnnestunud, kui: õpilane annab vähemalt kolm nõuannet 100 euro piires (nt hele vaip, lamp, värvilised padjad, plakatid), kasutab vähemalt kaks järelliitega omadussõna õigesti ja leiab keelule või teleri soovile teise lahenduse. Tagasiside alles lõpus.'),
    ],
  },

  // ---------------------------------------------------------------- 012 PROB R→S: mis / mille, comparison, ads
  'b1noor-012': {
    title: 'Uus kodu kuulutusest',
    canDo: 'Ma loen korterikuulutusi, seletan neid lihtsalt teistele ja põhjendan, milline korter sobib mulle kõige paremini.',
    teacherPage: {
      goal: 'Ученик читает объявления, объясняет их маме и доказывает, какая квартира подходит ему (своя комната, минуты до школы), сравнивая (lähemal kui, kõige …) и с mis / mille.',
      core: [1, 2, 5], alt: 3,
      short: 'Станция 2 (10 мин) → станция 5 (15 мин). Объявления (ст. 1) — дома; ст. 3 и 4 — в следующий раз.',
      errors: [
        '«korter, mis rõdu on suur» вместо «korter, mille rõdu…» (чей? — mille; повтор модуля 2).',
        '«odavam nagu…» вместо «odavam kui…» — после сравнительной степени kui.',
        '«kõige suur» вместо «kõige suurem» — после kõige сравнительная форма.',
      ],
      notes: [
        'Четыре пряди: ст. 1 — чтение (Harno R1), ст. 2 — форма, ст. 3 — медиация (продукция), ст. 4 — онлайн-переписка, ст. 5 — продукция (решение).',
        'Медиация (ст. 3): мама Дарьи читает по-эстонски медленно. Ученик объясняет сокращения и условия своими словами; если «мама» не понимает, сказать по-другому, а не громче. Деньги решают родители — в финале это не критерий ученика (его критерии: своя комната, минуты до школы и тренировки, этаж, балкон).',
        'Онлайн (ст. 4): мама говорит по-русски, что ответить, ученик пишет хозяйке по-эстонски в чате портала и задаёт свой вопрос (велосипед, балкон, своя комната). Учитель-хозяйка отвечает: кошка можно, если спокойная, но залог больше — ученик передаёт это маме одной фразой.',
        'Обратная связь: на ст. 2 подсказка, потом модель; на ст. 3 и 5 не перебивать, 2–3 пункта в конце.',
        'Дом 10 + 1: «Harjuta» 10 минут ≥ 4 дней (слова + предложения: mis / mille, сравнение, суффиксы из урока 11, родительный + послелог из модуля 2). Реальное задание на выбор: (а) найти на kv.ee или city24.ee два объявления и сравнить их в 4 предложениях; (б) объяснить дома одному человеку (можно по-русски) одно эстонское объявление о квартире.',
      ],
    },
    discover: [
      station(tag(purpose(B.adsmatch('012_d_ads', 'Korterikuulutused.', 'Millist korterit (A–E) vajab iga inimene? Kirjuta täht. Üks korter võib sobida kahele.', [
        ['Lasnamäe, 3 tuba', '62 m², 5. korrus, lift. Kool ja pood maja kõrval. Üür 650 €.'],
        ['Mustamäe, 1 tuba', '30 m², 2. korrus. Sobib üliõpilasele. Üür 420 €.'],
        ['Nõmme, paarismaja pool', '4 tuba ja oma aed. Lemmikloomad lubatud. Üür 1100 €.'],
        ['Kalamaja, 2 tuba', '45 m², rõdu, vaikne hoov. Meri on lähedal. Üür 800 €.'],
        ['Õismäe, 3 tuba', '70 m², 9. korrus. Lift on remondis detsembrini. Üür 600 €.'],
      ], [
        ['Daria pere on kolmekesi ja tahab, et kool oleks lähedal.', 'A'],
        ['Robini vend Kevin läheb ülikooli ja otsib väikest korterit.', 'B'],
        ['Karina perel on suur koer.', 'C'],
        ['Robini tädi Kersti tahab rõduga korterit mere lähedal.', 'D'],
        ['Vanaema ei saa trepist käia, aga tahab kolmetoalist korterit.', 'A'],
        ['Mareki pere tahab võimalikult suurt ja odavat korterit.', 'E'],
      ]), 'Daria pere peab detsembriks kolima ja sõbrad otsivad ka kodu. Leiad igaühele korteri, mis sobib tema soovidega.'), { harno: 'R1' }), 1, 12),
      tag(B.vocab('012_d_vocab', 'Tunni sõnad.', ['kuulutus — объявление', 'üür — арендная плата', 'odav — дешёвый', 'omanik — хозяин', 'tagatisraha — залог', 'kaugusel — на расстоянии', 'rõdu — балкон', 'lift — лифт', 'korrus — этаж', 'lähedal — близко', 'lemmikloom — домашнее животное', 'kolima — переезжать']), {}),
      station(B.notice('012_d_rule', 'Märka: korter, mis… / mille… ja võrdlemine', [
        '**mis** — korter, **mis** on viiendal korrusel (moodul 2)',
        '**mille** — mille oma?: korter, **mille** rõdu on hoovi poole',
        'Võrdle: suur → **suurem kui** · odav → **odavam kui** · kallis → **kallim kui** · hea → **parem kui**',
        'Kui kaugel?: lähedal → **lähemal kui** · kaugel → **kaugemal kui** — kool on Lasnamäelt **lähemal kui** Õismäelt',
        '**Kõige** + võrdlusvorm: **kõige odavam** korter · **kõige suurem** tuba',
      ], 'full'), 2, 10),
      purpose(B.gaps('012_d_compare', 'Milline korter?', 'Kirjuta sulgudes olev sõna õiges vormis või vali mis / mille.', [
        'Korter A on [suurem] (suur) kui korter B.',
        'Nõmme maja on [kallim] (kallis) kui Lasnamäe korter.',
        'Mustamäe korter on kõige [odavam] (odav), aga see on väike.',
        'Õismäe korteris on kõige [rohkem] (palju) ruumi.',
        'Lasnamäelt on kool [lähemal] (lähedal) kui Mustamäelt.',
        'Me otsime korterit, [mis] (mis / mille) on kooli lähedal.',
        'Kalamaja korter, [mille] (mis / mille) rõdu on hoovi poole, on vaikne.',
      ], '', 'full', 'g_notice'), 'Daria teeb korterite võrdluse. Paned sõnad õigesse vormi, et ema näeks kohe, mis on suurem ja kust on kool lähemal.'),
    ],
    practice: [
      station(B.text('012_p_ad', 'Kuulutus, millest ema aru ei saa', 'Üürile anda 3-toaline korter Lasnamäel, Pallasti tänaval. 62 m², korrus 5/9, lift. Üür 650 € kuus. Tagatisraha: ühe kuu üür. Vaba alates 1. detsembrist. Ainult lemmikloomadeta perele. Kool, lasteaed ja pood on 5 minuti kaugusel, bussipeatus on maja ees. Keldris on rattaruum. Omanik Malle Sepp.'), 3, 12),
      teach(purpose(B.speaking('012_p_explain', 'Seleta emale.', 'Õpetaja on Daria ema Olena, kes loeb eesti keelt veel aeglaselt. Seleta kuulutust lihtsate sõnadega.', [
        'Mida tähendab „5/9”?', 'Mis on tagatisraha?', 'Millal me saame sisse kolida?', 'Kas meie kass Murka võib kaasa tulla?', 'Kui kaugel on sinu kool ja Vika lasteaed?', 'Kuhu sa seal oma ratta paned?',
      ], [90, 150], ['See tähendab, et…', 'Teiste sõnadega…', 'Kuulutuses on kirjas, et…', 'Minu jaoks on hea, et…']), 'Daria ema tahab täna omanikule vastata, aga kõik sõnad pole talle selged. Seletad kuulutuse lihtsalt, et ema saaks otsustada.'),
      'Vahendamine, õpetaja on Olena: küsi „Mida see tähendab?” sõnade „tagatisraha”, „lemmikloomadeta”, „rattaruum” kohta — õpilane seletab teiste sõnadega (võib ka vene keeles), ei tõlgi sõna-sõnalt. Õnnestunud, kui ema teab: korrus 5 üheksast ja lift on olemas, tagatisraha on ühe kuu üür ja see tuleb hiljem tagasi, kolida saab 1. detsembril, kassi kuulutuse järgi ei lubata, kool ja lasteaed on 5 minuti kaugusel, ratta saab panna keldrisse. Raha üle otsustab ema — õpilane ainult seletab.'),
      station(B.text('012_p_chat', 'Omaniku sõnum portaalis', 'Tere! Aitäh huvi eest. Korterit saab vaadata laupäeval kell 12 või pühapäeval kell 17. Mitu inimest hakkab korteris elama? Kas teil on lemmikloomi? Malle Sepp'), 4, 10),
      teach(purpose(B.writing('012_p_reply', 'Vastus omanikule.', 'Ema ütleb sulle vene keeles, mida vastata, sina kirjutad eesti keeles 3–5 lausega: millal tulete vaatama ja kes elama hakkab. Vasta ausalt kassi kohta ja küsi üks asi, mis on sulle endale tähtis (rattaruum, rõdu, sinu tuba).', [3, 5], ['laupäeval', 'pühapäeval', 'kass'], 1), 'Ema kirjutab eesti keeles aeglaselt ja palub sinu abi. Kirjutad viisaka ja selge vastuse, et pere saaks korterit vaatama minna.'),
      'Veebisuhtlus: õpetaja on Malle Sepp ja vastab õpilase küsimusele kirjalikult (nt „Jah, keldris on rattaruum.”) ja lisab: kass võib tulla, kui ta on rahulik, aga siis on tagatisraha suurem. Õpilane annab selle emale ühe lausega edasi. Õnnestunud, kui vastuses on aeg, inimeste arv, aus vastus kassi kohta ja üks selge küsimus.'),
    ],
    transfer: [
      station(B.text('012_t_sit', 'Kolm korterit, üks otsus', 'Laupäeval vaatasid Daria, ema ja Vika kolme korterit. 1. detsembril peab pere ajutisest korterist välja kolima. Ema ütleb: „Raha on minu mure, kõik kolm sobivad. Aga sina elad seal ka — kus sul oleks parem?” Sina oled Daria: mõtle oma toale, koolile, trennile ja sõpradele, loe kaarte ja veena ema. Sinu variant: milline korter või maja sobiks sulle endale ja miks?'), 5, 15, { final: 'decide' }),
      purpose(B.profiles('012_t_flats', 'Kolm korterit.', 'Loe kaarte. Võrdle, kas sul on oma tuba ja mitu minutit on kooli ja trenni.', [
        ['Lasnamäe, Pallasti tänav', ['3 tuba, 62 m², 5. korrus, lift', 'sul on oma tuba (9 m²), aken hoovi poole', 'kooli 5 minutit jala', 'trenni 40 minutit kahe bussiga'], ''],
        ['Mustamäe, Akadeemia tee', ['2 tuba, 48 m², 1. korrus', 'oma tuba ei ole: jagad tuba Vikaga', 'kooli 25 minutit bussiga', 'spordihall on 5 minuti kaugusel, aga akna all on lärmakas tänav'], ''],
        ['Õismäe, Ehitajate tee', ['3 tuba, 70 m², 9. korrus', 'sul on oma tuba (12 m²) rõduga', 'kooli 35 minutit bussiga, Kertu elab samas majas', 'lift on remondis detsembri lõpuni'], ''],
      ]), 'Ema küsib täna õhtul sinu arvamust. Loed kaarte, et oma valikut minutite ja faktidega põhjendada.'),
      teach(tag(purpose(B.rolecards('012_t_choose', 'Milline korter?', 'Õpetaja on Daria ema Olena. Mida ja kuidas öelda, otsusta ise.',
        'Olukord: sina oled Daria; ema tahab täna õhtul ühele omanikule vastata ja küsib, kus sinul oleks parem elada.\nSinu eesmärk: veena ema, milline korter sobib sulle kõige paremini; põhjenda kahe võrdlusega (lähemal kui…, suurem kui…, kõige…) ja ühe mis- või mille-lausega.\nPiirang: ema mõtleb kogu pere peale — ka Vika ja kassi Murka peale.',
        'Ema kaart on õpetajal: tal on oma mure ja üks uudis.',
        ['… on lähemal kui…', 'Kõige parem on…, sest…', 'Korter, mille…', 'Aga mis siis, kui…?'], ['Ma ei tea…', 'Aga Vika?', 'Hea küll, siis…']), 'Ema otsustab ise, aga tahab teada, kus sul oleks hea elada ja õppida. Põhjendad oma valikut nii, et ema arvestab sinu soove.'), { main: true, level: 4 }),
      'Üks-ühele, õpetaja kaart (ema Olena). Varjatud info: ema sai jaanuarist uue töö Lasnamäel; Vika lasteaed on praegu Mustamäel; kass Murka tuleb kindlasti kaasa. Raha üle otsustab ema, sellest õpilane rääkima ei pea. Takistused (ükshaaval): 1) „Õismäel on sul rõduga tuba, aga kooli sõidad 35 minutit — kas sa jõuad hommikul?”; 2) „Õismäel on lift remondis, ja Vika on alles viie-aastane.”; 3) „Mustamäel on trenn lähedal, aga sa jagad tuba Vikaga — kus sa kodutöid teed?” Õnnestunud, kui: õpilane valib ühe korteri, kasutab kahte võrdlust ja ühte mis- või mille-lauset, põhjendab oma vajadustega (oma tuba, minutid kooli ja trenni, korrus, rõdu) ja vastab vähemalt ühele vastuväitele, mõeldes ka Vika peale.'),
    ],
  },

  // ---------------------------------------------------------------- 013 LUGU R→W: local cases, moving day
  'b1noor-013': {
    title: 'Kolimispäev',
    canDo: 'Ma räägin ja kirjutan täpselt, kus mis on ja kuhu mida panna, ning teen sõpradega kolimise plaani.',
    teacherPage: {
      goal: 'Ученик точно говорит, где что стоит и куда что нести (kus? kuhu? kust?, tuppa / kappi / kööki), и составляет с друзьями план переезда.',
      core: [2, 3, 4], alt: 1,
      short: 'Станция 2 (10 мин) → станция 4 (15 мин). Чтение (ст. 1) — дома; беглость (ст. 3) — в начале следующего урока.',
      errors: [
        '«Pane kastid köögisse» — правильно и так, но чаще говорят «kööki»; ошибка — «Pane kastid köögis» (где? вместо куда?).',
        '«tuba → tubasse» вместо «tuppa» (короткая форма куда? у tuba, kapp, köök, kool).',
        '«Ta tuli toas» вместо «toast» (откуда? — -st).',
      ],
      notes: [
        'Четыре пряди: ст. 1 — чтение, ст. 2 — форма (местные падежи), ст. 3 — беглость, ст. 4 — продукция (план) + сообщение в чат класса (онлайн).',
        'Блог Дарьи написан в прошедшем времени (A2): вопросы можно отвечать одним-двумя словами, прошедшее время подробно — модуль 5.',
        'Обратная связь: на ст. 2 подсказка «kus või kuhu?», потом модель; ст. 3 — не перебивать; сообщение (ст. 4) — подчеркнуть строку, ученик исправляет сам.',
        'Дом 10 + 1: «Harjuta» 10 минут ≥ 4 дней (смешанно: kus / kuhu / kust, суффиксы из урока 11, mis / mille из урока 12, родительный + послелог из модуля 2: kapi taga, voodi alla). Реальное задание на выбор: (а) написать 5 предложений, куда что поставить в своей комнате; (б) отправить по-эстонски сообщение, где лежит одна вещь дома (кому-то из семьи или себе).',
      ],
    },
    discover: [
      station(purpose(B.reading('013_d_blog', 'Daria blogi: kolimispäev.', 'Loe Daria postitust ja vasta küsimustele lühidalt.', 'Laupäev kastide vahel', [
        'Laupäeval kolisime lõpuks uude korterisse Mustamäel. Hommikul kell 9 tõi onu Ivan kaubiku maja ette. Artjom ja Robin tassisid diivani trepist üles, sest lift oli liiga väike. Milana pakkis kööginõud kastidest lahti ja pani need kappi. Vika jooksis kogu aeg toast tuppa ja otsis kassi Murkat. Lõpuks leidsime ta vannitoast pesumasina tagant! Kõige raskem oli minu kirjutuslaud: see ei mahtunud uksest sisse, nii et poisid võtsid laua jalad ära. Õhtul sõime põrandal pitsat, sest laud oli veel autos. Ema ütles, et see oli tema aasta parim õhtusöök.',
      ], [
        ['Kuhu Daria pere kolis?', 'Mustamäele|uude korterisse Mustamäel|uude korterisse'],
        ['Miks tassisid poisid diivani trepist üles?', 'lift oli liiga väike|sest lift oli liiga väike'],
        ['Kuhu pani Milana kööginõud?', 'kappi'],
        ['Kust leiti kass Murka?', 'vannitoast|pesumasina tagant|vannitoast pesumasina tagant'],
        ['Miks võtsid poisid laua jalad ära?', 'laud ei mahtunud uksest sisse|see ei mahtunud uksest sisse|ei mahtunud uksest sisse'],
        ['Kus sõid nad õhtul pitsat?', 'põrandal'],
      ]), 'Kertu ei saanud kolimisele tulla ja küsib, kuidas läks. Loed Daria postitust, et talle õigesti vastata.'), 1, 12),
      tag(B.vocab('013_d_vocab', 'Tunni sõnad.', ['kolima — переезжать', 'kast — коробка', 'kaubik — фургон', 'tassima — тащить', 'diivan — диван', 'kööginõud — посуда', 'voodi — кровать', 'laud — стол', 'trepp — лестница', 'ruum — место, помещение', 'põrand — пол', 'mööbel — мебель']), {}),
      station(B.notice('013_d_rule', 'Märka: kus? kuhu? kust? kodus', [
        'Kus? **toas** · **köögis** · **kapis** · **laual** · **rõdul**',
        'Kuhu? **tuppa** · **kööki** · **kappi** · **lauale** · **rõdule**',
        'Kust? **toast** · **köögist** · **kapist** · **laualt** · **rõdult**',
        'Lühike kuhu-vorm: tuba → **tuppa** · köök → **kööki** · kapp → **kappi** · kool → **kooli**',
        'Kaassõnaga (moodul 2): **kapi taga** (kus?) · **kapi taha** (kuhu?) · **kapi tagant** (kust?)',
      ], 'full'), 2, 10),
      purpose(B.gaps('013_d_where', 'Kuhu see läheb?', 'Kirjuta sulgudes olev sõna õiges vormis. Vaata küsimust: kus, kuhu või kust?', [
        'Pane raamatud [riiulile] (riiul, kuhu?).',
        'Kööginõud on juba [kapis] (kapp, kus?).',
        'Too palun lamp [autost] (auto, kust?).',
        'Vika viib oma mänguasjad [tuppa] (tuba, kuhu?).',
        'Kass magab [rõdul] (rõdu, kus?).',
        'Kõik toidukastid tuleb tuua [kööki] (köök, kuhu?).',
      ], '', 'full', 'g_notice'), 'Daria ema kirjutab kastidele, kuhu need lähevad. Paned sõnad õigesse vormi, et abilised viiksid kastid õigesse kohta.'),
    ],
    practice: [
      station(teach(tag(purpose(B.speaking('013_p_move', 'Kolimine 60 sekundiga.', 'Õpetaja on Kertu, kes ei saanud kolimisele tulla: räägi 60 sekundit, kuidas Daria kolimine läks. Siis tee Daria tädile Ukrainasse 30-sekundiline häälsõnum: ainult kõige naljakam hetk.', [
        'Millal ja kuhu Daria pere kolis?', 'Kes aitas ja kes pakkis kööginõud lahti?', 'Mis oli kõige raskem?', 'Kus kass oli?', 'Mida te õhtul sõite?', 'Kas sina oled kunagi kolinud? Kuhu?',
      ], [60, 120], ['Laupäeval kolisime…', 'Kõige raskem oli…', 'Kass oli…', 'Lõpuks…']), 'Kertu tahab kõike teada, aga tal on ainult üks minut aega. Räägid vabalt ja kiiresti, nagu vahetunnis.'), { fluency: true }),
      'Ladusus: küsi kiiresti, ära paranda. Häälsõnum on uus kuulaja (tädi) ja uus eesmärk (üks naljakas hetk), mitte sama jutt lühemalt. Kui õpilane on ise kolinud, võib ta rääkida oma kolimisest. Lõpus 2 märkust kus / kuhu / kust kohta.'), 3, 10),
    ],
    transfer: [
      station(B.text('013_t_sit', 'Kertu vanaema kolib', 'Kertu vanaema kolib Tartust Tallinna Kertu pere juurde ja saab Kertu toa. Kertu kolib väiksemasse tuppa, mis on köögi kõrval. Laupäeval on kolimine: Kertu isa toob kaubiku, abilised on sina, Robin ja Artjom. Lifti majas ei ole, kõik tuleb trepist tassida. Tee Kertuga plaan: mis mööbel kuhu läheb, kes mida tassib, kes pakib kastid lahti ja mis kell alustate. Siis kirjuta plaan klassi vestlusesse abilistele. Sinu variant: planeeri oma päris kolimine või toa ümberpaigutamine.'), 4, 15, { final: 'plan' }),
      teach(purpose(B.table('013_t_plan', 'Kuhu mis läheb?', 'Täida tabel koos Kertuga (õpetaja). Kirjuta iga asja juurde, kust see tuleb ja kuhu see läheb.', 'Asi, Kust?, Kuhu?, Kes tassib?', [
        'Kertu voodi |  |  | ', 'Vanaema diivan |  |  | ', 'Kirjutuslaud |  |  | ', 'Raamaturiiul |  |  | ', 'Kastid kööginõudega |  |  | ', 'Vanaema riided vannitoa kappi |  |  | ',
      ]), 'Kolimisel on neli abilist ja ainult üks päev. Teed Kertuga tabeli, et keegi ei tassiks asju valesse tuppa.'),
      'Õpetaja on Kertu. Varjatud info: vanaema diivan ei mahu Kertu uude tuppa, see läheb elutuppa; Kertu isal on haige selg — ta ei tohi tassida, aga võib autot juhtida; majas ei ole lifti, vanaema korter on kolmandal korrusel. Takistused: 1) „Diivan ei mahu minu tuppa! Kuhu me selle paneme?”; 2) „Isa ei tohi tassida.”; 3) „Mis kell me alustame? Vanaema rong tuleb kell 14.” Õnnestunud, kui tabelis on iga asja juures kust ja kuhu õiges vormis ja tassijad, ning ajakava jõuab enne vanaema tulekut.'),
      tag(purpose(B.writing('013_t_msg', 'Plaan klassi vestlusesse.', 'Kirjuta abilistele 4–6 lausega: mis kell ja kus kohtume, kes mida tassib ja kuhu mis läheb.', [4, 6], ['tuppa', 'kell'], 2), 'Abilised loevad sõnumi laupäeva hommikul telefonist. Kirjutad plaani nii selgelt, et keegi ei pea Kertule helistama ja üle küsima.'), { main: true, level: 4 }),
    ],
  },

  // ---------------------------------------------------------------- 014 PROB L→S: mis / mille + negation, a fault
  'b1noor-014': {
    title: 'Midagi on katki!',
    canDo: 'Ma teatan telefonis ja kirjalikult, mis on kodus või koolis katki, ja lepin kokku, millal see parandatakse.',
    teacherPage: {
      goal: 'Ученик как староста класса сообщает завхозу по телефону и в Stuudium о поломке в школе (что, где, с каких пор, что пробовали) и договаривается, когда починят.',
      core: [2, 4, 6], alt: 5,
      short: 'Станция 2 (10 мин) → станция 6 (15 мин, только звонок). Аудио (ст. 1) и гласные (ст. 3) — дома или в следующий раз.',
      errors: [
        '«kraan, mis tilgub» — правильно; ошибка — «kapp, mis uks on katki» вместо «kapp, mille uks…».',
        '«Radiaator ei soojendab» вместо «ei soojenda» — в отрицании без окончания (модуль 1).',
        '«külm» и «kolm», «köök» и «kook» — из-за гласных собеседник не понимает, что сломано (ст. 3).',
      ],
      notes: [
        'Четыре пряди: ст. 1 — слушание, ст. 2 — форма, ст. 3 — произношение, ст. 4 — онлайн-переписка, ст. 5 — беглость, ст. 6 — продукция (звонок завхозу + записка, Harno W1b).',
        'Роль подростка: ученик не звонит арендодателю сам. Финал — школа (староста класса, холодный класс). «Sinu variant» дома: ученик помогает маме или папе объяснить поломку хозяину по-эстонски (медиация).',
        'Онлайн (ст. 4): ответ завхозу в Stuudium на уточняющие вопросы и своё предложение времени.',
        'Обратная связь: на ст. 2 и 3 подсказка, потом модель; на ст. 5 и 6 не перебивать, в конце 2–3 пункта по целям; записку ученик сначала проверяет сам по 4 пунктам.',
        'Дом 10 + 1: «Harjuta» 10 минут ≥ 4 дней (смешанно: mis / mille, отрицание из модуля 1, kus / kuhu / kust из урока 13, сравнение из урока 12). Реальное задание на выбор: (а) найти дома или в школе одну вещь, которая не работает, и написать о ней 3 предложения (что, где, с каких пор); (б) прочитать одно объявление в подъезде или в школе о ремонте и сказать одним предложением, что оно сообщает.',
      ],
    },
    discover: [
      station(teach(purpose(B.listening('014_d_owner', 'Majandusjuhataja häälsõnum.', 'Enne kuulamist arva vastused. Õpetaja loeb kaks korda, sina kirjuta lünka üks sõna või number.', [
        'Peeter: Tere, siin Peeter Rebane, kooli majandusjuhataja. Sain teie klassi sõnumi kätte.',
        'Peeter: Kui teie klassis on radiaator külm, siis keerake kõigepealt radiaatori nuppu paremale, viie peale.',
        'Peeter: Kui see ei aita, tulen ise neljapäeval pärast kuuendat tundi ja lasen radiaatorist õhu välja.',
        'Peeter: Tüdrukute WC kraani pärast ärge muretsege. Torumees tuleb reedel hommikul kell kümme.',
        'Peeter: Torumees vaatab reedel ka teie radiaatorit. Jätke klassi võti hommikul kantseleisse.',
        'Peeter: Kui midagi veel katki läheb, kirjutage mulle parem Stuudiumis, mitte e-kirja. Head päeva!',
      ], [
        'Radiaatori nuppu tuleb keerata [paremale].',
        'Majandusjuhataja tuleb ise [neljapäeval].',
        'Ta tuleb pärast [kuuendat|6.] tundi.',
        'Torumees tuleb [reedel] hommikul.',
        'Klassi võtme võib jätta [kantseleisse].',
        'Majandusjuhatajale on parem kirjutada [Stuudiumis].',
      ]), 'Klassijuhataja Kaie on koolitusel ja palus sul kui klassivanemal majandusjuhataja sõnumit kuulata. Kirjutad üles, mida teha ja millal keegi tuleb.'),
      'Kuulamise tsükkel: ennusta (mis võib koolis katki olla?) → esimene kuulamine: kas majandusjuhataja on rahulik või pahane? → võrdle → teine kuulamine: lüngad → üks rida „mis aitas / mis jäi kuulmata”.'), 1, 10),
      tag(B.vocab('014_d_vocab', 'Tunni sõnad.', ['katki — сломан', 'parandama — чинить', 'radiaator — батарея', 'kraan — кран', 'tilkuma — капать', 'torumees — сантехник', 'klassivanem — староста класса', 'võti — ключ', 'lukk — замок', 'pistikupesa — розетка', 'majandusjuhataja — завхоз', 'teatama — сообщать']), {}),
      station(B.notice('014_d_rule', 'Märka: mis on katki?', [
        'Asi, **mis** ei tööta: kraan, **mis** tilgub · lamp, **mis** ei põle',
        'Asi, **mille** osa on katki: kapp, **mille** uks ei lähe kinni (moodul 2: mille oma?)',
        'Eitus (moodul 1): radiaator **ei soojenda** · lukk **ei avane** · kraan **ei tilgu** enam',
        'Kus ja kui kaua: **meie klassis** · **koridoris** · **esmaspäevast** saadik · juba **kolm päeva**',
      ], 'full'), 2, 10),
      purpose(B.transformation('014_d_report', 'Mis on katki?', 'Tee kahest lausest üks. Kasuta antud sõna.', [
        ['WC-s on kraan. Kraan tilgub.', 'mis', 'WC-s on kraan, mis tilgub.'],
        ['Meie klassis on radiaator. Radiaator on külm.', 'mis', 'Meie klassis on radiaator, mis on külm.'],
        ['Mul on kapp. Kapi uks ei lähe kinni.', 'mille', 'Mul on kapp, mille uks ei lähe kinni.'],
        ['Klassis on projektor. Projektor ei tööta.', 'mis', 'Klassis on projektor, mis ei tööta.'],
        ['Spordisaalis on uks. Ukse lukk ei avane.', 'mille', 'Spordisaalis on uks, mille lukk ei avane.'],
        ['Koridoris on lamp. Lamp ei põle.', 'mis', 'Koridoris on lamp, mis ei põle.'],
      ]), 'Klassivanemana teed majandusjuhatajale nimekirja, mis koolis katki on. Teed laused lühemaks ja selgemaks, et ta saaks kohe aru.'),
    ],
    practice: [
      station(teach(purpose(B.choice('014_p_vowels', 'Õ, ö või ü?', 'Õpetaja ütleb igast reast ühe sõna. Vali sõna, mida kuulsid, siis ütle see ise.', [
        ['Rida 1: mis sõna õpetaja ütleb?', 'köök', 'kook', 'kõik'],
        ['Rida 2: mis sõna õpetaja ütleb?', 'külm', 'kolm', 'kelm'],
        ['Rida 3: mis sõna õpetaja ütleb?', 'küla', 'kõla', 'kola'],
        ['Rida 4: mis sõna õpetaja ütleb?', 'süda', 'sõda', 'sada'],
        ['Rida 5: mis sõna õpetaja ütleb?', 'töö', 'too', 'tee'],
        ['Rida 6: mis sõna õpetaja ütleb?', 'süü', 'suu', 'soo'],
      ], 'full', 'g_notice'), 'Kui ütled telefonis „kolm” asemel „külm”, ei saa majandusjuhataja aru, mis lahti on. Harjutad õ, ö ja ü kuulmist ja hääldamist.'),
      'Kõigepealt taju: õpetaja ütleb igast reast esimese (õige) sõna, õpilane valib. Siis ütleb õpetaja reast kõik kolm ja õpilane kordab ainult õiget. Kõik valikud on päris sõnad, tähendus muutub: külm — kolm, köök — kook, küla — kõla — kola, süda — sõda, töö — too, süü — suu. Kui sõna on võõras (kelm, kõla, süü), ütle tähendus vene keeles.'), 3, 8),
      station(B.text('014_p_thread', 'Stuudiumi sõnumid', [
        'Milana → majandusjuhataja Peeter Rebane: Tere! Minu kapi uks teisel korrusel ei lähe kinni ja lukk ei tööta. Kas seda saab parandada? Milana, 9. b',
        'Peeter Rebane: Tere, Milana! Aitäh, et teatasid. Mis on kapi number? Kas katki on uks või lukk või mõlemad? Kas kapis on praegu sinu asjad? Ma saan tulla homme pärast kolmandat tundi.',
        'Milana märkmik: kapp nr 214; homme pärast 3. tundi on matemaatika kontrolltöö.',
      ].join('\n\n')), 4, 10),
      teach(purpose(B.writing('014_p_reply', 'Vasta majandusjuhatajale.', 'Sa oled Milana. Vasta Peetrile 6–8 lausega ja paku teine aeg.', [6, 8], ['number', 'uks', 'lukk'], 1), 'Majandusjuhataja parandab ühe päevaga palju asju ja vajab täpset infot. Vastad nii, et ta teab, mida kaasa võtta ja millal tulla.'),
      'Veebisuhtlus: õpetaja on Peeter ja vastab õpilase sõnumile kirjalikult: „Sobib, tulen pärast viiendat tundi. Too võti kaasa.” Õnnestunud, kui vastuses on kapi number, mis on katki (uks, lukk või mõlemad), info asjade kohta ja uus aeg.'),
      station(teach(tag(purpose(B.speaking('014_p_story', 'Kõik läks katki!', 'Räägi sõbrale 90 sekundit, mis läks katki. Siis 30-sekundiline häälsõnum klassi vestlusesse.', [
        'Mis läks katki ja kus?', 'Millal see juhtus?', 'Mida sa kõigepealt tegid?', 'Kellele sa helistasid?', 'Kes selle parandas?', 'Kuidas lugu lõppes?',
      ], [90, 130], ['Eile läks katki…', 'Kõigepealt ma…', 'Siis helistasin…', 'Lõpuks…']), 'Sõber tahab kuulda, mis sinuga juhtus. Räägid vabalt ja kiiresti, nagu päris jutuajamises.'), { fluency: true }),
      'Õpetaja on sõber. Lugu võib olla päris või väljamõeldud (kodus või koolis). Ladusus: küsi kiiresti, ära paranda. Häälsõnum on uus kuulaja (klass) ja uus eesmärk (ainult see, mida teised peavad teadma), mitte sama jutt lühemalt.'), 5, 10),
    ],
    transfer: [
      station(B.text('014_t_sit', 'Radiaator on külm', 'On november ja väljas on viis kraadi külma. Teie klassis (ruum 21) on radiaator juba kolm päeva külm, kuigi koridoris on soe, ja tunnis istutakse jopedega. Majandusjuhataja Peeter lubas neljapäeval tulla, aga ei tulnud. Klassijuhataja Kaie on koolitusel ja palub sul kui klassivanemal Peetrile helistada ning pärast kõnet kokkulepe Stuudiumis kirja panna. Sinu variant: teata millestki, mis sinu koolis päriselt katki on, või aita emal või isal eesti keeles seletada, mis kodus katki on.'), 6, 15, { final: 'complain' }),
      teach(tag(purpose(B.rolecards('014_t_call', 'Kõne majandusjuhatajale.', 'Õpetaja on majandusjuhataja Peeter. Mida ja kuidas öelda, otsusta ise.',
        'Olukord: sinu klassis (ruum 21) on radiaator kolm päeva külm; Peeter lubas neljapäeval tulla, aga ei tulnud.\nSinu eesmärk: seleta täpselt, mis on katki ja kus, mida te juba proovisite, ja lepi kokku kindel aeg, millal see parandatakse.\nPiirang: homme on ruumis 21 kontrolltöö; klass on tühi ainult enne kella 8.15 ja pärast kella 14.',
        'Majandusjuhataja kaart on õpetajal: tal on oma vabandused ja üks lahendus.',
        ['Meie klassis on radiaator, mis…', 'Me juba proovisime…', 'Kas te saaksite…?', 'Lepime kokku, et…'], ['Ah jaa, vabandust…', 'Kas te nuppu keerasite?', 'Ma ei saa enne…']), 'Klassis on nii külm, et keegi ei saa keskenduda. Seletad majandusjuhatajale probleemi nii, et lepite kokku kindla aja.'), { main: true, level: 4 }),
      'Üks-ühele, õpetaja kaart (majandusjuhataja Peeter). Varjatud info: unustas neljapäeva ära; torumees saab tulla alles esmaspäeval kell 12 (siis on klassis tund); täna pärast tunde saab ta tuua klassi kaks elektriradiaatorit, homme võib klass olla ka ruumis 25. Takistused (ükshaaval): 1) „Kas te nuppu keerasite? Viie peale?”; 2) „Torumees saab tulla alles esmaspäeval kell 12.”; 3) „Esmaspäeval kell 12 on teil ju tund — kas see sobib?” Õnnestunud, kui: õpilane ütleb, mis on katki, kus ja kui kaua (mis-lause), mida juba proovisid, saab kindla aja ja ajutise lahenduse (elektriradiaator või teine klass) ning kordab lõpus kokkuleppe.'),
      tag(purpose(B.examWriting('014_t_note', 'Sõnum majandusjuhatajale.', 'Kirjuta 40–60 sõnaga. Kirjuta kõigist neljast punktist.', 'teade', {
        situation: 'Pärast kõnet kirjutad Stuudiumis majandusjuhataja Peeter Rebasele sõnumi, et kokkulepe jääks kirja.',
        points: ['mis on katki ja kus', 'mida te juba proovisite', 'millal klass on tühi', 'mida majandusjuhataja lubas teha ja millal'],
        words: [40, 60], opening: 'Tere!',
      }), 'Kui kokkulepe on kirjas, ei saa seda enam unustada. Kirjutad sõnumi, millest on näha, mis on katki ja mida majandusjuhataja lubas.'), { harno: 'W1b' }),
    ],
  },

  // ---------------------------------------------------------------- 015 module check (= a2b1-015)
  // Blueprint §5.2: A — the module's exam format (R1 ads) + the 9th-grade language-structure formation task (§8.3); B — the
  // final task in a new situation (the class-trip hostel: a call to the hostess and a written note); C — local cases,
  // adjective suffixes, mis / mille + module 2 (genitive + postposition, kelle) and module 1 (negation, questions) items and
  // the module's words. Pass mark 70 % a part; no new words or grammar.
  'b1noor-015': {
    title: 'Kontroll 3: kodu ja tuba',
    assessment: true,
    shortSheet: true,
    canDo: 'Ma loen kuulutusi, teatan telefonis ja kirjalikult, mis on katki, ning kasutan kohakäändeid, omadussõnu ja mis- / mille-lauseid õigesti.',
    discover: [
      B.text('015_d_intro', 'Kontroll 3', 'See on mooduli 3 kontroll. Osa A: loed kuulutusi nagu eksamil ja teed sõnadest omadussõnu nagu 9. klassi eksamil. Osa B: uus olukord — klassireisil on hostelis midagi katki: helistad ja kirjutad. Osa C: lugemine, keel ja sõnad. Eesmärk on igas osas vähemalt 70%. Uusi sõnu ega reegleid siin ei ole.'),
      B.examPart('015_d_part', 'R', { part: 'Osa A ja C. Lugemine, keel ja sõnad', minutes: 40, points: 44, tasks: 6, target: 70, note: 'Sõnaraamatut ei kasuta.' }),
      B.vocab('015_d_vocab', 'Kontrolli sõnad.', ['kontroll — проверка', 'eesmärk — цель', 'klassireis — классная поездка', 'hostel — хостел', 'vastuvõtt — ресепшен', 'tekk — одеяло']),
      tag(B.adsmatch('015_d_ads', 'Osa A. Lugemine 1. Kuulutused.', 'Millist kuulutust (A–F) vajab iga inimene? Kirjuta täht. Üks kuulutus võib sobida kahele.', [
        ['Tuba üliõpilasele', 'Tuba kesklinna lähedal, köök ja dušš koridoris. 250 € kuus, kõik kulud on hinna sees.'],
        ['Kolimisabi', 'Kaks tugevat noormeest ja kaubik. Tallinnas 40 € tund. Tassime ka 5. korrusele trepist.'],
        ['Müüa kirjutuslaud', 'Valge ja praktiline, kolme sahtliga. Sobib väikesesse tuppa. 25 €, järele tulla Nõmmele.'],
        ['Torumees 24/7', 'Tilkuv kraan või külm radiaator? Tulen samal päeval, ka nädalavahetusel.'],
        ['Hoiuruum', 'Kodus ei ole ruumi? Rendi hoiuruum kuuks või aastaks. Alates 30 € kuus.'],
        ['Kingitakse ära', 'Vana diivan ja raamaturiiul. Tasuta, aga ise tuleb ära viia. Mustamäe, 3. korrus.'],
      ], [
        ['Kevin läheb Tallinnas ülikooli ja vajab odavat tuba.', 'A'],
        ['Kertu pere kolib laupäeval ja vajab abi raske mööbli tassimisel.', 'B'],
        ['Artjom otsib oma uude tuppa odavat lauda, kus kodutöid teha.', 'C'],
        ['Daria köögis hakkas pühapäeva õhtul kraan tilkuma.', 'D'],
        ['Robini perel on palju jalgrattaid ja suuski, aga korter on väike.', 'E'],
        ['Milana tahab raamatutele riiulit, aga raha tal ei ole.', 'F'],
        ['Vanaemal on radiaator külm ja ta tahab, et keegi tuleks kohe.', 'D'],
        ['Marek kolib ja tal on palju kaste, aga autot ei ole.', 'B'],
      ]), { harno: 'R1' }),
      B.reading('015_d_rules', 'Lugemine 2. Hosteli kodukord.', 'Loe kodukorda ja vasta küsimustele lühidalt.', 'Metsamaja hostel', [
        'Tere tulemast Metsamaja hostelisse! Meie maja on metsa ääres, väikese järve lähedal, ja ümber järve läheb viie kilomeetri pikkune matkarada. Vastuvõtt on avatud kell 8–22. Toa võtmel on puust silt, palun ära seda kaota: uus võti maksab 20 eurot. Igas toas on neli voodit, riidekapp ja laud. Dušid on koridori lõpus, sooja vett on hommikul kella 7-st 10-ni ja õhtul kella 18-st 23-ni. Ühisköögis võib ise süüa teha, aga pärast tuleb kööginõud ära pesta. Vaikne aeg on kella 23-st kella 7-ni. Kui toas midagi ei tööta, helista vastuvõttu või kirjuta hosteli vestlusesse. Elektriasju ära paranda ise! Hommikusöök on ühisköögis kell 8–10. Saunas võib käia õhtuti kella 21-ni, aga sauna aja peab enne vastuvõtus kirja panema. Lahkumispäeval too võti vastuvõttu kella 11-ks.',
      ], [
        ['Mis kell on vastuvõtt avatud?', 'kell 8–22|8–22|kaheksast kümneni'],
        ['Mis juhtub, kui võti kaob?', 'uus võti maksab 20 eurot|tuleb maksta 20 eurot|20 eurot'],
        ['Mitu voodit on igas toas?', 'neli|4'],
        ['Kus on dušid?', 'koridori lõpus'],
        ['Mida tuleb teha, kui toas midagi ei tööta?', 'helistada vastuvõttu|helista vastuvõttu|kirjutada hosteli vestlusesse|helistada vastuvõttu või kirjutada vestlusesse'],
        ['Mis kellaks tuleb lahkumispäeval võti tagasi tuua?', 'kella 11-ks|11-ks|kella üheteistkümneks'],
      ]),
      B.match('015_d_words', 'Sõnad. Mis on mis?', 'Ühenda sõna ja selgitus.', [
        ['kraan', 'koht, kust tuleb vesi'],
        ['radiaator', 'see teeb toa soojaks'],
        ['üür', 'raha, mida maksad iga kuu korteri eest'],
        ['omanik', 'inimene, kellele korter kuulub'],
        ['tagatisraha', 'raha, mille omanik annab tagasi, kui kõik on korras'],
        ['kolima', 'minema elama uude kohta'],
        ['torumees', 'inimene, kes parandab kraane ja torusid'],
        ['rõdu', 'maja küljes olev koht, kus saab väljas istuda'],
      ], 'full', 'g_vocab'),
      why(B.wordforms('015_d_make', 'Osa A (9. klass). Keel 1. Tee sõnast omadussõna.', 'Tee sulgudes olevast sõnast omadussõna ja kirjuta see lünka.', [
        ['päike', 'Meie hosteli tuba oli hommikul …', 'päikeseline'],
        ['ruum', 'Ühisköök on suur ja …', 'ruumikas'],
        ['sõber', 'Vastuvõtus töötab väga … noormees.', 'sõbralik'],
        ['lärm', 'Koridoris oli öösel …', 'lärmakas'],
        ['oht', 'Katkine pistikupesa on …', 'ohtlik'],
        ['värv', 'Hosteli koridor on rõõmus ja …', 'värviline'],
      ], 'full'), ['-line: päike → päikeseline (tund 11).', '-kas: ruum → ruumikas (tund 11).', '-lik: sõber → sõbralik (tund 11).', '-kas: lärm → lärmakas (tund 11).', '-lik: oht → ohtlik (tund 11).', '-line: värv → värviline (tund 11).']),
      why(B.cloze('015_d_cloze', 'Keel 2. Kertu sõnum Dariale.', 'Vali Kertu sõnumis igasse lünka õige vorm.', 'Tere, Daria!', [
        'Tere, Daria! Kuidas uues korteris on? Kas su tuba on {*suurem|suur|suurim} kui vana? Meie tuba on hosteli teisel {*korrusel|korrusele|korruselt}. Aga mul on mure: dušš, {*mis|kes|mille} on koridori lõpus, on külm. Ka meie toa aken, {*mille|mis|kelle} käepide on katki, ei lähe kinni.',
        '',
        'Ma panin oma asjad {*kappi|kapis|kapist}, aga toa võti on {*Robini|Robin|Robinit} juures. Õhtul läheme {*metsa|metsas|metsast} matkama. Ma {*ei tea|ei tean|ei teadma}, mis kell me tagasi tuleme. Kertu',
      ]), ['Võrdlus: suurem kui (tund 12).', 'Kus? → korrusel (tund 13).', 'Mis — asi, alus (tund 12, 14).', 'Mille — mille oma? (tund 12, 14).', 'Kuhu? → kappi (tund 13).', 'Omastav + kaassõna: Robini juures (moodul 2).', 'Kuhu? → metsa (tund 13).', 'Eitus: ei + tüvi (moodul 1).']),
      why(B.gaps('015_d_where', 'Keel 3. Kus, kuhu või kust?', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Pane märjad sokid [radiaatorile] (radiaator, kuhu?).',
        'Hommikusöök on [ühisköögis] (ühisköök, kus?).',
        'Too palun oma kott [toast] (tuba, kust?).',
        'Õhtul läheme kõik [sauna] (saun, kuhu?).',
        'Võti on [vastuvõtus] (vastuvõtt, kus?).',
        'Robin tõi vett [köögist] (köök, kust?).',
      ], '', 'full', 'g_notice'), ['Kuhu? → -le: radiaatorile.', 'Kus? → -s: ühisköögis.', 'Kust? → -st: toast.', 'Kuhu? → lühike vorm: sauna.', 'Kus? → -s: vastuvõtus (tt → t).', 'Kust? → -st: köögist (k → g).']),
    ],
    practice: [
      B.examPart('015_p_lpart', 'L', { part: 'Osa C. Kuulamine', minutes: 15, points: 12, tasks: 2, target: 70, note: 'Õpetaja loeb iga teksti kaks korda.' }),
      B.listening('015_p_host', 'Kuulamine 1. Perenaise häälsõnum.', 'Õpetaja loeb perenaise häälsõnumi kaks korda. Kirjuta lünka üks sõna või number.', [
        'Ülle: Tere! Siin Metsamaja hosteli perenaine Ülle. Kuulsin, et teie toas on probleem.',
        'Ülle: Duši vesi on praegu külm, sest boiler on väike. Soe vesi tuleb tagasi poole tunni pärast.',
        'Ülle: Akna käepideme parandab meie majamees Jaan. Ta tuleb kell neli.',
        'Ülle: Seni võite istuda ühisköögis, seal on soe.',
        'Ülle: Kui toas on öösel külm, võtke kapist teine tekk.',
        'Ülle: Õhtusöök on kell seitse. Head päeva!',
      ], [
        'Duši vesi on külm, sest boiler on [väike].',
        'Soe vesi tuleb tagasi poole [tunni] pärast.',
        'Käepideme parandab [majamees] Jaan.',
        'Jaan tuleb kell [neli|4|16].',
        'Teise teki saab [kapist].',
        'Õhtusöök on kell [seitse|7|19].',
      ]),
      B.examListen('015_p_notices', 'Kuulamine 2. Teated.', 'Õpetaja loeb viis lühikest teadet kaks korda. Vali õige vastus.', 'choice', [
        'Teade üks.', 'Majandusjuhataja: Kolmanda korruse WC on remondi tõttu suletud. Kasutage teise korruse WC-d.',
        'Teade kaks.', 'Ühistu: Homme kella kümnest kaheni ei ole majas sooja vett.',
        'Teade kolm.', 'Klassijuhataja: Klassi projektor on katki, nii et tund on täna arvutiklassis.',
        'Teade neli.', 'Ühistu: Lift ei tööta. Mehaanik tuleb neljapäeval.',
        'Teade viis.', 'Isa: Köögikraan tilgub. Ära seda kasuta, ma helistasin juba torumehele.',
      ], [
        ['Kus on WC suletud?', 'kolmandal korrusel', 'teisel korrusel', 'esimesel korrusel'],
        ['Mida homme majas ei ole?', 'sooja vett', 'elektrit', 'internetti'],
        ['Kus on tund täna?', 'arvutiklassis', 'aulas', 'raamatukogus'],
        ['Millal tuleb mehaanik?', 'neljapäeval', 'homme', 'reedel'],
        ['Kellele isa helistas?', 'torumehele', 'ühistule', 'omanikule'],
      ]),
      B.examPart('015_p_wpart', 'W', { part: 'Osa B. Kirjutamine', minutes: 25, points: 20, tasks: 3, target: 70, note: 'Uus olukord, sama oskus nagu tunnis 14.' }),
      why(B.errorfix('015_p_fix', 'Keel 4. Paranda viga.', 'Igas lauses on üks viga. Kirjuta lause õigesti.', [
        ['Pane raamat riiulil.', 'Pane raamat riiulile.'],
        ['Meie tuba on päikesene.', 'Meie tuba on päikeseline.'],
        ['See on kapp, mis uks on katki.', 'See on kapp, mille uks on katki.'],
        ['Mustamäe korter on odavam nagu Lasnamäe korter.', 'Mustamäe korter on odavam kui Lasnamäe korter.'],
        ['Võti on Robin juures.', 'Võti on Robini juures.'],
        ['Kraan ei tilgub enam.', 'Kraan ei tilgu enam.'],
      ]), ['Kuhu? → riiulile (tund 13).', 'päike → päikeseline (tund 11).', 'Mille — mille oma? (tund 12, 14).', 'Võrdlus: odavam kui (tund 12).', 'Omastav + kaassõna (moodul 2).', 'Eitus: ei + tüvi (moodul 1).']),
      tag(B.examWriting('015_p_note', 'Kirjutamine. Sõnum hostelile.', 'Kirjuta 40–60 sõnaga. Kirjuta kõigist neljast punktist.', 'teade', {
        situation: 'Klassireisil Metsamaja hostelis on teie toas aken katki ja dušš külm. Vastuvõtt telefonile ei vasta. Kirjuta hosteli vestlusesse.',
        points: ['kes sa oled ja mis toas te elate', 'mis on katki ja kus', 'mida te juba proovisite', 'millal keegi saab tulla — üks küsimus'],
        words: [40, 60], opening: 'Tere!',
      }), { harno: 'W1b' }),
      B.rubricW1('015_p_r1', ['kes ja mis tuba', 'mis on katki ja kus', 'mida proovisite', 'küsimus: millal?']),
    ],
    transfer: [
      B.examPart('015_t_part', 'S', { part: 'Osa B. Rääkimine', minutes: 15, points: 20, tasks: 2, target: 70, note: 'Õpetajaga üks-ühele.' }),
      B.choice('015_t_which', 'Enne rääkimist. Mis sobib?', 'Vali sobiv sõna.', [
        ['Meie toas on aken, … ei lähe kinni.', 'mis', 'mille', 'kes'],
        ['See on dušš, … vesi on külm.', 'mille', 'mis', 'kelle'],
        ['Robin on poiss, … kott on meie toas.', 'kelle', 'kes', 'mille'],
        ['Kas te saaksite tulla meie …?', 'tuppa', 'toas', 'toast'],
        ['Ma helistan …, sest Jaan ei tulnud.', 'vastuvõttu', 'vastuvõtus', 'vastuvõtust'],
        ['Meie tuba on … kui Robini tuba.', 'külmem', 'külm', 'kõige külm'],
      ], 'full', 'g_notice'),
      teach(B.dialogue('015_t_phone', 'Kõne vastuvõttu.', 'Kirjuta Kertu küsimustesse puuduv küsisõna.', 'Kertu', 'Ülle', [
        ['A', 'Tere! Siin Kertu toast neli. [Kas] keegi saaks meie akent vaadata?'],
        ['B', 'Muidugi. Mis aknaga juhtus?'],
        ['A', 'Käepide on katki. [Millal] majamees tulla saab?'],
        ['B', 'Kell neli.'],
        ['A', '[Kus] me seni olla võime? Toas on külm.'],
        ['B', 'Ühisköögis, seal on soe.'],
        ['A', '[Kust] me saame teise teki?'],
        ['B', 'Toa kapist.'],
      ], 'g_notice'), 'Üks-ühele: pärast lünkade täitmist loevad õpilane (Kertu) ja õpetaja (Ülle) dialoogi ette.'),
      teach(tag(B.rolecards('015_t_call', 'Osa B. Kõne hostelisse.', 'Õpetaja on hosteli perenaine Ülle. Mida ja kuidas öelda, otsusta ise.',
        'Olukord: klassireis, Metsamaja hostel, tuba 4. Kell on 21: radiaator on külm, aken ei lähe kinni ja vastuvõtt suletakse kell 22.\nSinu eesmärk: seleta telefonis täpselt, mis on katki ja kus, ning lepi kokku, mis täna õhtul tehakse.\nPiirang: klassijuhataja Kaie on teises majas ega vasta telefonile.',
        'Perenaise kaart on õpetajal.',
        ['Meie toas on…, mis…', 'Me juba proovisime…', 'Kas te saaksite…?', 'Lepime kokku, et…'], ['Mis toas te olete?', 'Aga…?']), { harno: 'S2', main: true }),
      'Osa B, õpetaja kaart (perenaine Ülle). Varjatud info: majamees on kodus ja saab tulla alles hommikul kell 8; vaba on tuba 7, aga seal on ainult kolm voodit (neid on neli); lisatekid on koridori kapis. Takistused: 1) „Kas te proovisite radiaatori nuppu keerata?”; 2) „Majamees saab tulla alles hommikul.” Õnnestunud (2 punkti), kui õpilane ütleb, mis on katki, kus ja kui kaua (mis- või mille-lause), küsib vähemalt kaks küsimust, lepib kokku lahenduse tänaseks õhtuks (teine tuba või lisatekid) ja kordab kokkuleppe. Abiga 1, ei õnnestu 0.'),
      B.rubricSpeaking('015_t_rs'),
      teach(B.table('015_t_result', 'Võrdle kontrolliga 2.', 'Kirjuta oma tulemus ja kontrolli 2 tulemus. Mis paranes?', 'Osa, Kontroll 2, Kontroll 3, Mis paranes?', [
        'A. Lugemine: kuulutused |  |  | ', 'A. Omadussõnad (9. klass) |  |  | ', 'B. Kirjutamine ja kõne |  |  | ', 'C. Lugemine ja kuulamine |  |  | ', 'C. Keel: kus / kuhu / kust, mis / mille |  |  | ', 'C. Sõnad |  |  | ',
      ]), 'Õpetajale: alla 70% osas → üks sihitud kodutöö („Harjuta” selle vormi harjutused) ja lõpuülesanne uuesti järgmise tunni esimese jaamana. Moodulit ei korrata.'),
      B.selfcheck('015_t_self', ['Ma kirjeldan oma tuba omadussõnadega.', 'Ma loen korterikuulutusi ja võrdlen kortereid.', 'Ma ütlen täpselt, kus mis on ja kuhu mida panna.', 'Ma teatan telefonis ja kirjalikult, mis on katki.', 'Ma vastan sõnumile ja pakun uue aja.'], 'Moodul 3 tehtud'),
    ],
  },
}, {
  'b1noor-011': 'RÄÄK L→S', 'b1noor-012': 'PROB R→S', 'b1noor-013': 'LUGU R→W', 'b1noor-014': 'PROB L→S', 'b1noor-015': 'EKS',
});
