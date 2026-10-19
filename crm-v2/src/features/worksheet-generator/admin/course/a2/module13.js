// A2 course (A1 → A2 roadmap), module 13 „Töö ja amet”, all five lessons a2-061…a2-065 (062 pean + ma /
// oskan, saan, tahan + da, 064 listening to work instructions, 065 the module check in the Harno A2 form). Jobs and the workplace (töötan kellena? -na, kus? -s, vastutan mille eest?), the work
// schedule and a simple job ad (vahetus, tööaeg, palk, kogemus, vajalik, kandideerimine; kellast kellani, E–R).
// Harno A2 formats: listening with 1–2-word answers (read twice), notices / ads, writing from a business card (≥ 25
// words) and a short letter (30–50 words), picture description and a role dialogue.
// Cast by docs/TEXTBOOK_ART_BIBLE.md §4 in the lessons added 2026-10-13 (Anna office, Markus warehouse, Liis teacher /
// official, Viktor pensioner, Sofia student, Jaan café owner; Oksana + Mia 6, Olga accountant, Kati, Igor as extras).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-13', course: 'a2', title: 'Töö ja amet', level: 'A2', design: 'v2', template: 'v3' };

export const LESSONS = {
  'a2-061': {
    title: 'Ametid ja töökoht',
    canDo: 'Ma kirjeldan oma või väljamõeldud tööd 6–8 lausega: amet, töökoht, tööaeg ja vähemalt kolm ülesannet.',
    template: 'v3',
    discover: [
      B.text('061_d_situation', 'Uus kolleeg', 'Esmaspäeval tuleb Liisi kooli uus kolleeg. Tema nimi on Olga. Ta töötab raamatupidajana. Olga on pärit Narvast, aga elab nüüd Tallinnas. Liis näitab talle kooli ja tutvustab teisi kolleege.'),
      B.reading('061_d_read', 'Loe: kolm inimest, kolm ametit.', 'Loe tekst ja vasta küsimustele.', 'Kus nad töötavad?',
        'Urmas on 52-aastane. Ta töötab bussijuhina juba kakskümmend aastat. Tema töökoht on buss number seitseteist. Urmas alustab tööd kell kuus hommikul. Ta vastutab reisijate ohutuse eest. Bussis kuulab ta tihti raadiot. Talle meeldib, et iga päev näeb ta palju inimesi.\nMerle töötab apteegis farmatseudina. Ta müüb ravimeid ja annab klientidele nõu. Tema tööpäev on kaheksa tundi pikk. Vahel töötab ta ka laupäeval. Merle kolleegid on noored ja sõbralikud. Merle ütleb, et tema töö on huvitav, aga väsitav.\nTaras on IT-spetsialist. Ta töötab suures firmas, aga kolm päeva nädalas teeb ta tööd kodus. Lõunat sööb ta kontori köögis koos kolleegidega. Ta parandab arvuteid ja aitab kolleege, kui programm ei tööta. Taras vastutab firma arvutivõrgu eest. Tema ülemus on Tarasega rahul, sest Taras on täpne ja kiire.',
        [['Kui kaua on Urmas bussijuhina töötanud?', 'kakskümmend aastat|20 aastat'], ['Mille eest vastutab Urmas?', 'reisijate ohutuse eest|reisijate ohutuse'], ['Mida teeb Merle tööl?', 'müüb ravimeid ja annab nõu|müüb ravimeid|annab klientidele nõu'], ['Kes töötab vahel nädalavahetusel?', 'Merle'], ['Kus töötab Taras kolm päeva nädalas?', 'kodus'], ['Miks on Tarase ülemus rahul?', 'Taras on täpne ja kiire|ta on täpne ja kiire|sest ta on täpne ja kiire'], ['Mis kell Urmas tööd alustab?', 'kell kuus|kuus hommikul|kell kuus hommikul'], ['Mis on Merle amet?', 'farmatseut|ta on farmatseut']]),
      B.notice('061_d_notice', 'Märka: kellena? kus? mille eest?', ['Urmas **töötab bussijuhina**. (bussijuht → bussijuhi**na**)', 'Merle **töötab apteegis**. (kus? → -s)', 'Taras **on** IT-spetsialist. (kes ta on?)', 'Urmas **vastutab** reisijate ohutuse **eest**.', 'Merle **müüb** ravimeid ja **annab** nõu.'], 'full'),
      B.wordforms('061_d_forms', 'Kellena sa töötad?', 'Kirjuta sõna -na vormis.', [
        ['arst', 'kellena?', 'arstina'], ['müüja', 'kellena?', 'müüjana'], ['õpetaja', 'kellena?', 'õpetajana'], ['kokk', 'kellena?', 'kokana'],
        ['bussijuht', 'kellena?', 'bussijuhina'], ['koristaja', 'kellena?', 'koristajana'], ['ehitaja', 'kellena?', 'ehitajana'], ['raamatupidaja', 'kellena?', 'raamatupidajana']]),
      B.gaps('061_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', ['Minu [amet] on raamatupidaja.', 'Ma [töötan] suures firmas.', 'Minu [töökoht] on kesklinnas.', 'Ma [vastutan] firma raha eest.', 'Minu [kolleeg] Markus aitab mind alati.', 'Me teenindame iga päev palju [kliente].', 'Minu esimene [klient] tuleb kell üheksa.', 'Homme hakkan ma uues kohas [töötama].'], ['amet', 'töötan', 'töökoht', 'vastutan', 'kolleeg', 'kliente', 'klient', 'töötama', 'kolleegid', 'ametis']),
      B.errorfix('061_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma töötan arst.', 'Ma töötan arstina.|Ma olen arst.'], ['Ma töötan koolisse.', 'Ma töötan koolis.'], ['Ma vastutan klientid eest.', 'Ma vastutan klientide eest.'], ['Minu ema töötab õpetaja koolis.', 'Minu ema töötab koolis õpetajana.|Minu ema töötab õpetajana koolis.'], ['Ma teenindan klientid.', 'Ma teenindan kliente.'], ['Ma töötan müüja poes.', 'Ma töötan poes müüjana.|Ma töötan müüjana poes.'], ['Mu vend töötab ehitajaks.', 'Mu vend töötab ehitajana.'], ['Ma vastutan kliendid eest.', 'Ma vastutan klientide eest.']]),
      B.translation('061_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я работаю продавцом.', 'Моя сестра работает в больнице.', 'Он отвечает за клиентов.', 'Мой рабочий день длится восемь часов.', 'Кем ты работаешь?', 'Мои коллеги очень дружелюбные.', 'Мой брат работает поваром.', 'Она работает в аптеке.']),
      B.speaking('061_d_say', 'Minu töö.', 'Räägi paarilisele oma tööst 1 minut.', [
        'Kellena sa töötad?', 'Kus su töökoht on?', 'Mida sa tööl teed?', 'Mis sulle tööl meeldib?',
      ], [60, 120], ['Ma töötan …-na.', 'Ma töötan …-s.', 'Ma vastutan … eest.']),
      B.writing('061_d_write', 'Minu tööpäev.', 'Kirjuta 6–8 lauset oma tööst või unistuste tööst.', [6, 8], ['töötan', 'teen', 'kolleeg'], 2),
    ],
    practice: [
      B.cloze('061_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Taras ja tema töö', [
        'Taras on 29 aastat vana. Ta töötab {*programmeerijana|programmeerija|programmeerijat} IT-firmas.',
        '',
        'Tema {*töökoht|tööline|töötaja} on Tartus, aga kolm päeva nädalas teeb ta tööd {*kodus|koju|kodust}.',
        '',
        'Taras {*vastutab|vastutan|vastutama} firma arvutite eest. Tal on viis {*kolleegi|kolleeg|kolleegid}. Nad on noored ja sõbralikud.',
        '',
        'Tarase tööpäev algab kell üheksa ja {*lõpeb|lõpp|lõpuks} kell viis. Talle meeldib tema {*amet|ametis|ametit}, sest see on {*huvitav|huvi|huvitavalt}.',
      ], 'g_vocab'),
      B.listening('061_p_listen', 'Kuula intervjuud.', 'Õpetaja loeb intervjuu kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere! Täna on meie saates Peeter Kask. Peeter, mis on teie amet?', '— Ma olen kokk. Ma töötan restoranis Tartu kesklinnas.', '— Kui kaua te seal töötate?',
        '— Juba kaheksa aastat. Enne töötasin hotellis.', '— Milline on teie tööpäev?', '— Ma alustan kell kümme. Kõigepealt ostan turult kala ja köögivilju.',
        '— Mille eest te vastutate?', '— Ma vastutan menüü eest. Köögis töötab veel neli kokka.', '— Mis teile töös meeldib?', '— Mulle meeldivad rahul kliendid. Aga õhtuti on restoranis palju inimesi ja töö on raske.',
      ], ['Peeter töötab [kokana|kokk].', 'Restoran on [Tartus|Tartu kesklinnas].', 'Restoranis töötab Peeter [kaheksa|8] aastat.', 'Enne töötas ta [hotellis].', 'Tööpäev algab kell [kümme|10].', 'Peeter vastutab [menüü] eest.', 'Õhtuti on restoranis palju [inimesi|kliente].', 'Köögis töötab veel [neli|4] kokka.']),
      B.formtext('061_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Minu pere tööd', [
        'Minu ema töötab [õpetajana] (õpetaja) [koolis] (kool).',
        '',
        'Isa töötab [kokana] (kokk) [restoranis] (restoran). Ta vastutab [köögi] (köök) eest.',
        '',
        'Minu vend töötab [ehitajana] (ehitaja). Ta ehitab maju.',
        '',
        'Mina töötan [müüjana] (müüja) ja teenindan iga päev palju [kliente] (klient).',
      ], 'g_notice'),
      B.choice('061_p_form', 'Vali õige vorm.', 'Vali lünka õige vorm.', [['Ma töötan ___ koolis.', 'õpetajana', 'õpetaja', 'õpetajat'], ['Minu õde on ___.', 'arst', 'arstina', 'arsti'], ['Minu isa töötab ___.', 'haiglas', 'haiglasse', 'haiglast'], ['Ta vastutab ___ eest.', 'klientide', 'kliendid', 'kliente'], ['Me teenindame iga päev palju ___.', 'kliente', 'kliendid', 'klientide'], ['Ma sõidan tööle ___.', 'bussiga', 'bussis', 'bussi'], ['Ta lõikab juukseid.', 'juuksur', 'kokk', 'arst'], ['Ta õpetab lapsi koolis.', 'õpetaja', 'koristaja', 'müüja']], 'full', 'g_notice'),
      B.gaps('061_p_gaps', 'Kirjuta õiges vormis.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Minu vend töötab [kokana] (kokk) restoranis.', 'Anna töötab [raamatupidajana] (raamatupidaja).', 'Urmas töötab [bussijuhina] (bussijuht).', 'Merle töötab [apteegis] (apteek).',
        'Taras teeb kolm päeva nädalas tööd [kodus] (kodu).', 'Markus vastutab [projekti] (projekt) eest.', 'Olga sõidab tööle [trammiga] (tramm).', 'Kaja töötab [loomaarstina] (loomaarst).']),
      B.transformation('061_p_trans', 'Ütle teisiti.', 'Kirjuta lause. Alusta antud sõnadega.', [
        ['Ma olen müüja.', 'Ma töötan …', 'Ma töötan müüjana.'], ['Minu töökoht on haigla. Ma olen õde.', 'Ma töötan …', 'Ma töötan haiglas õena.|Ma töötan õena haiglas.'],
        ['Urmas on bussijuht.', 'Urmas töötab …', 'Urmas töötab bussijuhina.'], ['Liisi töö on aidata kliente.', 'Liis aitab …', 'Liis aitab kliente.'],
        ['Taras peab hoolitsema arvutite eest.', 'Taras vastutab …', 'Taras vastutab arvutite eest.'], ['Olga on raamatupidaja suures firmas.', 'Olga töötab …', 'Olga töötab suures firmas raamatupidajana.|Olga töötab raamatupidajana suures firmas.'], ['Merle on farmatseut.', 'Merle töötab …', 'Merle töötab farmatseudina.'], ['Minu töökoht on kool. Ma olen õpetaja.', 'Ma töötan …', 'Ma töötan koolis õpetajana.|Ma töötan õpetajana koolis.']]),
      B.wordorder('061_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Minu õde töötab haiglas arstina.', 'Peeter vastutab restoranis menüü eest.', 'Ma sõidan tööle iga päev bussiga.', 'Kas sa töötad kontoris või kodus?', 'Minu kolleegid on väga sõbralikud.', 'Ma töötan suures firmas raamatupidajana.', 'Urmas alustab tööd kell kuus hommikul.', 'Liis annab klientidele nõu.']),
      B.dictation('061_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma töötan müüjana.', 'Minu töökoht on poes.', 'Ma teenindan iga päev kliente.', 'Minu kolleegid on toredad.', 'Ma vastutan kassa eest.', 'Tööpäev algab kell kaheksa.', 'Urmas töötab bussijuhina juba kakskümmend aastat.', 'Mille eest sa tööl vastutad?'], 8),
      B.speaking('061_p_guess', 'Arva ära amet.', 'Kirjelda ametit 3–4 lausega. Paariline arvab, mis amet see on.', [
        'Kus see inimene töötab?', 'Mida ta teeb?', 'Mille eest ta vastutab?', 'Mida ta tööl kasutab?',
      ], [45, 90], ['Ta töötab …-s.', 'Ta vastutab … eest.', 'Ta kasutab…']),
    ],
    transfer: [
      B.text('061_t_situation', 'Uus olukord', 'Sa alustad uuel keelekursusel. Esimeses tunnis tutvustavad kõik oma tööd. Pärast tundi täidad kursuse ankeedi ja kirjutad kolleegist visiitkaardi järgi.'),
      B.reading('061_t_read', 'Loe: töövarjupäev.', 'Loe tekst ja vasta küsimustele.', 'Oskari töövarjupäev',
        'Kolmapäeval oli Liisi pojal Oskaril töövarjupäev. Oskar on viieteistkümneaastane. Ta käis terve päeva koos ema sõbranna Kajaga tööl. Kaja töötab loomaarstina väikeses kliinikus. Tööpäev algas kell kaheksa. Kõigepealt vaatasid nad koos koera, kellel oli valus jalg. Siis tuli kliinikusse vanaproua oma kassiga. Kaja rääkis klientidega rahulikult ja selgelt. Lõuna ajal sõid kolleegid koos ja rääkisid naljajutte. Pärastlõunal aitas Oskar administraatorit. Ta vastas telefonile ja kirjutas kliente arvutisse. Õhtul oli Oskar väsinud, aga õnnelik. Kodus ütles ta emale, et tahab ka loomaarstiks saada. Liis oli üllatunud, sest varem tahtis Oskar olla kokk.',
        [['Kellena Kaja töötab?', 'loomaarstina|ta on loomaarst|loomaarst'], ['Mis oli koeral viga?', 'tal oli valus jalg|valus jalg|jalg valutas'], ['Mida tegi Oskar pärastlõunal?', 'aitas administraatorit|vastas telefonile|kirjutas kliente arvutisse'], ['Milline oli Oskar õhtul?', 'väsinud, aga õnnelik|väsinud ja õnnelik|õnnelik'], ['Miks oli Liis üllatunud?', 'varem tahtis Oskar olla kokk|Oskar tahtis enne olla kokk|sest ta tahtis olla kokk'], ['Kui vana on Oskar?', 'viisteist|15|viieteistkümneaastane'], ['Mis kell tööpäev algas?', 'kell kaheksa|kaheksa'], ['Mida tegid kolleegid lõuna ajal?', 'sõid koos ja rääkisid naljajutte|sõid koos']]),
      B.transformation('061_t_trans', 'Märkmetest lauseks.', 'Kirjuta kursusekaaslase märkmetest täislause.', [
        ['Amet: kokk', 'Ta töötab …', 'Ta töötab kokana.'], ['Töökoht: hotell', 'Ta töötab …', 'Ta töötab hotellis.'],
        ['Tööaeg: 8–16', 'Tema tööpäev kestab …', 'Tema tööpäev kestab kella kaheksast neljani.|Tema tööpäev kestab kaheksast neljani.'],
        ['Ülesanne: menüü', 'Ta vastutab …', 'Ta vastutab menüü eest.'], ['Kolleegid: 5', 'Tal on …', 'Tal on viis kolleegi.'], ['Töökoht: kliinik', 'Ta töötab …', 'Ta töötab kliinikus.'], ['Amet: loomaarst', 'Ta töötab …', 'Ta töötab loomaarstina.'], ['Ülesanne: kliendid', 'Ta vastutab …', 'Ta vastutab klientide eest.']]),
      B.choice('061_t_react', 'Mida sa vastad?', 'Loe küsimust. Vali sobiv vastus.', [
        ['Kursusekaaslane küsib: „Mis tööd sa teed?”', 'Ma töötan õpetajana.', 'Ma töötan õpetaja.', 'Ma töötan õpetajat.'],
        ['Kursusekaaslane küsib: „Kus sa töötad?”', 'Ühes väikeses firmas.', 'Ühte väikesesse firmasse.', 'Ühest väikesest firmast.'],
        ['Klient küsib: „Kas te saate mind aidata?”', 'Jah, muidugi. Mida te vajate?', 'Ei, see ei ole minu firma.', 'Jah, minu palk on hea.'],
        ['Uus kolleeg ütleb: „Tere, mina olen Olga.”', 'Tere tulemast! Mina olen Liis.', 'Head aega, Olga!', 'Palju õnne, Olga!'],
        ['Sõber küsib: „Kas sulle meeldib su töö?”', 'Jah, sest mu kolleegid on toredad.', 'Jah, sest ma töötan kolleegid.', 'Ei, sest ma olen töö.'], ['Klient küsib: „Mis kell te avate?”', 'Me avame kell üheksa.', 'Me avame kell üheksast.', 'Me avamine kell üheksa.'], ['Ülemus küsib: „Kas sa saad homme varem tulla?”', 'Jah, ma saan tulla kell seitse.', 'Jah, ma tulin eile.', 'Ei, ma olen kokk.'], ['Kolleeg ütleb: „Aitäh abi eest!”', 'Pole tänu väärt!', 'Head isu!', 'Palju õnne!']], 'full', 'g_use'),
      B.rolecards('061_t_roles', 'Kohvipausil.', 'Kaks kursuslast räägivad tööst. Küsige ja vastake.',
        'Oled müüja suures poes. Räägi oma tööst. Küsi teise inimese töö kohta 3 küsimust.', 'Oled kokk. Räägi oma tööst. Küsi teise inimese töö kohta 3 küsimust.',
        ['Ma töötan müüjana…', 'Mis tööd sa teed?', 'Kas sulle meeldib su töö?'], ['Ma olen kokk.', 'Ma vastutan … eest.', 'Kui kaua sa seal töötad?']),
      B.speaking('061_t_intro', 'Tutvusta ennast kursusel.', 'Räägi grupile oma tööst 1–1,5 minutit.', [
        'Kellena sa töötad?', 'Kus su töökoht on?', 'Mida sa tööpäeval teed?', 'Mille eest sa vastutad?', 'Kuidas sa tööle sõidad?',
      ], [60, 90], ['Ma töötan …-na.', 'Minu töökoht on…', 'Ma vastutan … eest.']),
      B.writing('061_t_write', 'Kursuse ankeet: minu töö.', 'Kirjuta ankeeti 6–8 lauset oma tööst.', [6, 8], ['töötan', 'vastutan', 'kolleegid', 'klient'], 2),
      B.rubric('061_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Tekstis on amet, töökoht, ülesanded ja kolleegid (6–8 lauset).', 'Vormid on õiged: töötan …-na, töötan …-s, vastutan … eest.', 'Rollimängus küsitakse vähemalt kolm küsimust töö kohta.', 'Suuline tutvustus on arusaadav ja kestab umbes minuti.']),
      B.selfcheck('061_t_self', ['Ma oskan nimetada 12 ametit ja töökohta.', 'Ma oskan leida tekstist, kes kus ja kellena töötab.', 'Ma oskan öelda: töötan …-na, töötan …-s, vastutan … eest.', 'Ma oskan oma tööd tutvustada suuliselt ja kirjalikult 6–8 lausega.'], 'Tutvustan oma tööd'),
    ],
  },

  'a2-062': {
    title: 'Pean tegema, oskan teha',
    canDo: 'Ma räägin oma tööst ja oskustest mustritega pean + ma-vorm, ei pea + ma-vorm ning oskan / saan / tahan + da-vorm ja valin vähemalt 8 vormi 10-st õigesti.',
    template: 'v3',
    discover: [
      B.text('062_d_situation', 'Uus töökoht', 'Anna töötab nüüd uues firmas Tallinnas. Esimesel päeval räägib juhataja Margit talle, mida ta peab tegema. Anna oskab hästi arvutiga töötada. Aga eesti keeles suhelda on tal veel raske.'),
      B.profiles('062_d_cards', 'Kes mida oskab?', 'Loe kaarte. Kirjuta lünka sobiv vorm.', [
        ['Jaan', ['kohviku omanik', 'oskab head kohvi teha', 'peab alustama kell 6', 'ei pea pühapäeval töötama'], ['Jaan oskab head kohvi [teha].', 'Ta peab hommikul kell kuus [alustama].', 'Pühapäeval ei [pea] ta töötama.']],
        ['Liis', ['õpetaja', 'oskab lastega suhelda', 'peab kodutöid kontrollima', 'tahab saada direktoriks'], ['Liis [oskab] lastega suhelda.', 'Ta peab kodutöid [kontrollima].', 'Ta tahab direktoriks [saada].']],
        ['Markus', ['laotöötaja', 'oskab autot juhtida', 'peab kolleege aitama', 'saab laupäeval puhata'], ['Markus oskab autot [juhtida].', 'Ta peab kolleege [aitama].', 'Ta [saab] laupäeval puhata.']],
      ]),
      B.reading('062_d_read', 'Loe: Anna esimene päev.', 'Loe teksti ja vasta küsimustele.', 'Mida Anna peab tegema?',
        'Anna on firmas uus raamatupidaja. Esimesel päeval rääkis juhataja Margit talle tööst. Iga hommik peab Anna kontrollima arveid. Arved peab ta klientidele saatma kella kolmeni. Reedeti peab ta tegema nädala aruande. Anna oskab hästi arvutiga töötada. Ta oskab ka inglise ja vene keelt. Eesti keeles suhelda on tal veel raske, aga ta tahab õppida. Kliente ei pea ta ise vastu võtma. Seda teeb sekretär Pille. Kontorit ei pea ta ka koristama, sest firmas on koristaja. Lõunal võib Anna minna kohvikusse või süüa köögis. Üks päev nädalas saab ta kodust töötada. Anna küsis: „Kas ma pean ka laupäeval tööl olema?” Margit naeris: „Ei pea! Laupäeval ja pühapäeval sa puhkad.”',
        [['Mida peab Anna iga hommik tegema?', 'kontrollima arveid|ta kontrollib arveid'], ['Kuni mis kellani peab ta arved saatma?', 'kella kolmeni|kolmeni'], ['Mis keeli Anna oskab?', 'inglise ja vene keelt|inglise ja vene'], ['Kes võtab kliente vastu?', 'Pille|sekretär Pille|sekretär'], ['Miks ei pea Anna kontorit koristama?', 'firmas on koristaja|sest firmas on koristaja'], ['Mitu päeva nädalas saab ta kodust töötada?', 'üks päev|ühe päeva|1'], ['Mida peab Anna reedeti tegema?', 'nädala aruande|tegema nädala aruande'], ['Kes on Margit?', 'juhataja']]),
      B.notice('062_d_notice', 'Märka: pean + ma, oskan + da', ['Ma **pean** arveid **kontrollima**. (pidama + ma-vorm)', 'Ma **ei pea** laupäeval **töötama**.', 'Ma **oskan** arvutiga **töötada**. (oskama + da-vorm)', 'Ma **saan** kodust **töötada**. Ma **tahan** eesti keelt **õppida**.', 'ma **pean**, sa **pead**, ta **peab**, me **peame**, te **peate**, nad **peavad**'], 'full'),
      B.gaps('062_d_gaps', 'pean või oskan?', 'Vali sõnapangast sobiv sõna. Kaks sõna jääb üle.', ['Bussijuht [peab] hommikul vara tõusma.', 'Ma [oskan] hästi süüa teha.', 'Kas sa [saad] homme kauem jääda?', 'Me [ei pea] täna kontorisse minema.', 'Sofia [tahab] eesti keelt paremini õppida.', 'Kas te [oskate] autot juhtida?', 'Sa [pead] homme varem tulema.', 'Te [peate] selle vormi täitma.'], ['peab', 'oskan', 'saad', 'ei pea', 'tahab', 'oskate', 'pead', 'peate', 'oskab', 'tahan']),
      B.transformation('062_d_trans', 'Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Ma töötan arvutiga.', 'oskan', 'Ma oskan arvutiga töötada.'], ['Ta koristab kontorit.', 'peab', 'Ta peab kontorit koristama.'], ['Me õpime eesti keelt.', 'tahame', 'Me tahame eesti keelt õppida.|Me tahame õppida eesti keelt.'],
        ['Ma tulen homme tööle.', 'ei pea', 'Ma ei pea homme tööle tulema.'], ['Sa aitad mind.', 'Kas sa saad …?', 'Kas sa saad mind aidata?'], ['Nad juhivad autot.', 'oskavad', 'Nad oskavad autot juhtida.'], ['Ma joonistan hästi.', 'oskan', 'Ma oskan hästi joonistada.'], ['Te pargite maja taga.', 'saate', 'Te saate maja taga parkida.']]),
      B.errorfix('062_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma pean töötada laupäeval.', 'Ma pean laupäeval töötama.|Ma pean töötama laupäeval.'], ['Ta oskab autot juhtima.', 'Ta oskab autot juhtida.'], ['Me tahame õppima eesti keelt.', 'Me tahame eesti keelt õppida.|Me tahame õppida eesti keelt.'], ['Sa ei pead homme tulema.', 'Sa ei pea homme tulema.'], ['Kas sa saad mind aitama?', 'Kas sa saad mind aidata?'], ['Ma pean minna arsti juurde.', 'Ma pean minema arsti juurde.|Ma pean arsti juurde minema.'], ['Ta oskab hästi laulma.', 'Ta oskab hästi laulda.'], ['Kas sa tahad kinno tulema?', 'Kas sa tahad kinno tulla?|Kas sa tahad tulla kinno?']]),
      B.speaking('062_d_say', 'Pean ja oskan.', 'Räägi paarilisele oma tööst või õpingutest.', ['Mida sa pead tööl iga päev tegema?', 'Mida sa ei pea tegema?', 'Mida sa hästi oskad?', 'Mida sa tahad veel õppida?', 'Mida sa tahad tööl paremini osata?'], [60, 90], ['Ma pean …-ma.', 'Ma oskan …-da.', 'Ma tahan …-da.']),
      B.writing('062_d_write', 'Minu kohustused ja oskused.', 'Kirjuta 6–8 lauset: mida sa pead tegema ja mida oskad.', [6, 8], ['pean', 'oskan', 'tahan', 'ei pea'], 3),
    ],
    practice: [
      B.reading('062_p_ads', 'Loe kahte kuulutust.', 'Loe kuulutusi ja vasta küsimustele.', 'Otsime töötajat', [
        'A. Kohvik „Mesi” otsib kokka. Sa pead oskama suppi ja salateid teha. Sa pead töötama ka nädalavahetusel. Eesti keelt pead oskama hästi, sest sa suhtled klientidega. Juhiluba ei pea olema. Tööaeg on kella kaheksast neljani. Palk on 1400 eurot kuus.',
        'B. Firma „Puhas Kodu” otsib koristajat. Sa pead oskama iseseisvalt töötada. Sa pead autot juhtima, sest töö on eri linnaosades. Nädalavahetusel ei pea töötama. Eesti keelt ei pea hästi oskama. Tööd saad alustada kohe. Palk on 11 eurot tunnis. Helista!',
      ], [['Keda otsib kohvik?', 'kokka'], ['Mida peab kokk oskama teha?', 'suppi ja salateid'], ['Miks peab kokk hästi eesti keelt oskama?', 'ta suhtleb klientidega|sest ta suhtleb klientidega'], ['Miks peab koristaja autot juhtima?', 'töö on eri linnaosades|sest töö on eri linnaosades'], ['Kas koristaja peab nädalavahetusel töötama?', 'ei|ei pea'], ['Kumb töö sobib inimesele, kellel pole juhiluba?', 'kokk|kohviku töö|A'], ['Kui palju teenib kokk kuus?', '1400 eurot'], ['Millal saab koristaja tööd alustada?', 'kohe']]),
      B.cloze('062_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Markuse töö laos', [
        'Markus töötab laos. Iga päev {*peab|oskab|tahab} ta kontrollima kaste ja pakkima kaupa.',
        '',
        'Markus {*oskab|peab|saab} hästi autot juhtida, seepärast viib ta vahel kaupa ka poodidesse.',
        '',
        'Laupäeval ei {*pea|pead|peab} ta töötama, siis ta {*saab|peab|oskab} puhata. Markus tahab ka uut programmi {*õppida|õppima|õpib}.',
        '',
        'Ülemus ütleb: „Sa {*võid|pead|oskad} küsida abi kolleeg Siimult. Ta {*oskab|oskama|oskan} sind aidata.”',
      ], 'g_vocab'),
      B.formtext('062_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', 'Eva tahab kohvikusse tööle', [
        'Eva oskab hästi süüa [teha] (tegema). Ta tahab kohvikus [töötada] (töötama).',
        '',
        'Kohvikus saab ta klientidega eesti keeles [suhelda] (suhtlema).',
        '',
        'Eva [peab] (pidama) töötama ka laupäeval, aga pühapäeval ei [pea] (pidama).',
        '',
        '„Kas sa [oskad] (oskama) head kohvi [keeta] (keetma)?” küsib juhataja. „Jah, ja ma tahan veel palju [õppida] (õppima)!”',
      ], 'g_notice'),
      B.wordforms('062_p_forms', 'pidama', 'Kirjuta pidama õiges vormis.', [['ma', 'pidama', 'pean'], ['sa', 'pidama', 'pead'], ['ta', 'pidama', 'peab'], ['me', 'pidama', 'peame'], ['te', 'pidama', 'peate'], ['nad', 'pidama', 'peavad'], ['ma (eitus)', 'pidama', 'ei pea'], ['te (eitus)', 'pidama', 'ei pea']]),
      B.choice('062_p_choice', 'Vali õige vorm.', 'Vali lausesse sobiv tegusõna vorm.', [
        ['Ma pean homme vara ___.', 'tõusma', 'tõusta', 'tõusen'], ['Kas sa oskad ___?', 'ujuda', 'ujuma', 'ujud'], ['Me ei ___ täna tulema.', 'pea', 'peame', 'pead'],
        ['Ta tahab uut tööd ___.', 'leida', 'leidma', 'leiab'], ['Kas ma saan kodust ___?', 'töötada', 'töötama', 'töötan'], ['Nad peavad arveid ___.', 'kontrollima', 'kontrollida', 'kontrollivad'], ['Ma ei ___ täna kaua jääda.', 'saa', 'saan', 'saama'], ['Kas te ___ hästi eesti keelt?', 'oskate', 'oskab', 'oskama']], 'full', 'g_notice'),
      B.listening('062_p_listen', 'Kuulamine. Uus töötaja.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Pille, firma sekretär.', 'Ma räägin teile, mida te peate esimesel nädalal tegema.', 'Tööpäev algab kell üheksa. Te peate tulema kümme minutit varem.',
        'Esmaspäeval peate täitma lepingu ja andma mulle oma pangakonto numbri.', 'Arvutiga oskate te kindlasti töötada, aga programm on uus. Siim aitab teid.',
        'Lõunal ei pea te kontoris olema. Lõuna on kella kaheteistkümnest üheni.', 'Reedel saate töötada kodust.',
      ], ['Tööpäev algab kell [üheksa|9].', 'Tööle peab tulema [kümme|10] minutit varem.', 'Esmaspäeval peab täitma [lepingu].', 'Uue programmiga aitab [Siim].', 'Lõuna algab kell [kaksteist|12].', 'Kodust saab töötada [reedel].', 'Pille on firma [sekretär].', 'Pangakonto numbri tuleb anda [Pillele].']),
      B.dialogue('062_p_dialog', 'Töövestlus kohvikus.', 'Täida dialoog sobivate sõnadega.', 'Juhataja', 'Eva', [
        ['A', 'Tere, Eva! Mis keeli te [oskate]?'], ['B', 'Ma oskan eesti, vene ja inglise keelt.'], ['A', 'Väga hea. Kas te oskate suppi [teha]?'], ['B', 'Jah, see on minu lemmiktöö!'],
        ['A', 'Te [peate] töötama ka laupäeval. Kas see sobib?'], ['B', 'Jah. Aga kas ma [pean] töötama ka pühapäeval?'], ['A', 'Ei, pühapäeval te ei [pea] töötama.'], ['B', 'Väga hea. Millal ma [saan] alustada?'], ['A', 'Te saate alustada [esmaspäeval].']]),
      B.rolecards('062_p_roles', 'Töövestlus.', 'Üks on tööandja, teine kandidaat. Siis vahetage.',
        'Oled tööandja. Küsi, mida kandidaat oskab. Ütle kaks kohustust.', 'Oled kandidaat. Räägi, mida sa oskad ja tahad teha. Küsi tööaja kohta.',
        ['Mida te oskate teha?', 'Te peate…', 'Kas te saate…?'], ['Ma oskan…', 'Ma tahan…', 'Kas ma pean…?']),
      B.speaking('062_p_say', 'Kes mida oskab?', 'Küsi paariliselt ja vasta. Kasuta oskan, pean, tahan.', ['Kas sa oskad autot juhtida?', 'Kas sa oskad süüa teha?', 'Mida sa pead kodus iga päev tegema?', 'Mida sa tahad õppida?'], [45, 90]),
    ],
    transfer: [
      B.text('062_t_situation', 'Uus olukord', 'Sinu firmasse tuleb kaheks nädalaks praktikant Rasmus. Ülemus palub: „Kirjuta Rasmusele lühike juhend. Mida ta peab tegema? Mida ta ei pea tegema?” Esimesel päeval näitad sa talle kontorit.'),
      B.listening('062_t_listen', 'Kuula Rasmuse häälsõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin Rasmus, uus praktikant.', 'Mul on homseks paar küsimust.', 'Kas ma pean tulema kell üheksa või kell kaheksa?', 'Ma oskan Exceliga töötada, aga ma ei oska raamatupidamisprogrammi.',
        'Kas ma saan autoga tulla? Kas maja juures on parkla?', 'Ma tahan võtta kaasa oma sülearvuti. Kas see on võimalik?', 'Palun helista mulle täna kella kuueni. Aitäh!',
      ], ['Rasmus on uus [praktikant].', 'Ta ei tea, kas tulla kell üheksa või [kaheksa|8].', 'Rasmus oskab töötada [Exceliga].', 'Ta ei oska [raamatupidamisprogrammi].', 'Rasmus tahab tulla [autoga].', 'Helistada tuleb kella [kuueni|6ni|18ni].', 'Rasmus tahab kaasa võtta oma [sülearvuti].', 'Rasmusel on homseks paar [küsimust].']),
      B.transformation('062_t_formal', 'Sina → teie.', 'Kirjuta lause viisakalt (teie).', [
        ['Sa pead kell üheksa tulema.', 'Te …', 'Te peate kell üheksa tulema.'], ['Sa ei pea laupäeval töötama.', 'Te …', 'Te ei pea laupäeval töötama.'], ['Kas sa oskad Exceliga töötada?', 'Kas te …?', 'Kas te oskate Exceliga töötada?'],
        ['Sa saad maja taga parkida.', 'Te …', 'Te saate maja taga parkida.'], ['Kas sa tahad kohvi juua?', 'Kas te …?', 'Kas te tahate kohvi juua?'], ['Sa pead kirjad kiiresti saatma.', 'Te …', 'Te peate kirjad kiiresti saatma.'], ['Kas sa saad homme kauem jääda?', 'Kas te …?', 'Kas te saate homme kauem jääda?'], ['Sa võid küsida abi Katilt.', 'Te …', 'Te võite küsida abi Katilt.|Te võite Katilt abi küsida.']]),
      B.rolecards('062_t_roles', 'Rasmus küsib.', 'A on Rasmus, B on kolleeg. Siis vahetage.',
        'Oled praktikant Rasmus. Küsi vähemalt neli küsimust: Kas ma pean…? Kas ma saan…?', 'Oled kolleeg. Vasta Rasmuse küsimustele märkmete järgi.',
        ['Kas ma pean…?', 'Kas ma saan…?', 'Kes mind aitab?'], ['Jah, sa pead…', 'Ei, sa ei pea…', 'Sa saad…']),
      B.speaking('062_t_tour', 'Esimene päev.', 'Näita Rasmusele kontorit ja selgita tööd. Räägi umbes minut.', ['Mis kell tööpäev algab?', 'Mida Rasmus peab tegema?', 'Kes teda aitab?', 'Mida ta saab köögis teha?'], [60, 90]),
      B.letter('062_t_letter', 'Juhend praktikandile.', 'Kirjuta Rasmusele juhend 50–70 sõnaga. Kasuta pead, ei pea, saad.', 'Tere, Rasmus!', 'Edu esimesel päeval!', [50, 70]),
      B.writing('062_t_reply', 'Vasta Rasmusele.', 'Kirjuta Rasmusele sõnum 6–8 lausega: vasta tema küsimustele.', [6, 8], ['pead', 'saad', 'ei pea'], 2),
      B.rubric('062_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Juhendis on tööaeg, kohustused ja abi.', 'pean + ma-vorm ja oskan / saan + da-vorm on õiged.', 'Vastus Rasmusele vastab kõigile tema küsimustele.', 'Suuline selgitus on selge ja viisakas.']),
      B.selfcheck('062_t_self', ['Ma saan aru, mida uus kolleeg küsib.', 'Ma kirjutan juhendi: pead, ei pea, saad.', 'Ma selgitan tööd suuliselt.', 'Ma vastan küsimustele teie- ja sina-vormis.'], 'Juhend on valmis'),
    ],
  },

  'a2-063': {
    title: 'Töögraafik ja lihtne töökuulutus',
    canDo: 'Ma leian töökuulutusest ja töögraafikust vähemalt viis olulist fakti: amet, tööaeg, palk, nõuded ja kandideerimise viis.',
    template: 'v3',
    discover: [
      B.text('063_d_situation', 'Andrei otsib tööd', 'Andrei otsib uut tööd. Ta tahab töötada ainult päeval, sest õhtuti õpib ta eesti keelt. Internetis näeb ta kahte kuulutust. Mõlemas on palk ja tööaeg kirjas.'),
      B.reading('063_d_read', 'Loe kahte kuulutust.', 'Loe kuulutused ja vasta küsimustele.', 'Kaks töökuulutust',
        'A. Kohvik Päikeseratas otsib klienditeenindajat\nTööaeg on graafiku alusel: kaks päeva tööl ja kaks päeva vaba. Vahetus kestab kella 8–20. Palk on 1300 eurot kuus (bruto). Vajalik on eesti keel A2 tasemel. Sa pead olema sõbralik ja täpne. Kogemus ei ole vajalik, me õpetame ise. Saada oma CV kohviku e-postile 15. maiks.\n\nB. Ladu Kiirpakk otsib komplekteerijat\nTööaeg on E–R, hommikuvahetus 7–15 või õhtuvahetus 15–23. Palk on 9 eurot tunnis, õhtuvahetuses 10 eurot tunnis. Vajalik on töökogemus laos vähemalt üks aasta. Kasuks tuleb tõstukijuhi luba. Pakume tasuta lõunat ja bussi linnast lattu. Helista meile või tule kohale.',
        [['Kui pikk on vahetus kohvikus?', 'kaksteist tundi|12 tundi'], ['Kas kohvikusse on vaja töökogemust?', 'ei|ei ole vaja|kogemus ei ole vajalik'], ['Mitu päeva nädalas töötab laos?', 'viis|5|viis päeva|esmaspäevast reedeni'], ['Kui palju teenib laotöötaja ühes õhtuvahetuses?', 'kaheksakümmend eurot|80 eurot|80'], ['Kuidas saab laos tööle kandideerida?', 'helistada või kohale tulla|helistada|tulla kohale'], ['Milline töö sobib Andreile tööaja järgi?', 'ladu hommikuvahetuses|B hommikuvahetuses|B|ladu'], ['Mis kuupäevaks tuleb kohvikusse CV saata?', '15. maiks|15. maini'], ['Mis tasemel peab olema eesti keel kohvikus?', 'A2|A2 tasemel']]),
      B.notice('063_d_notice', 'Märka: aeg ja nõuded', ['kella 8–20 = kella **kaheksast** õhtul **kaheksani**', 'E–R = **esmaspäevast reedeni**', '9 eurot **tunnis**, 1300 eurot **kuus**', '**Vajalik:** eesti keel. = Eesti keel **on vajalik**.', '**Kasuks tuleb:** juhiluba. = Hea, kui sul on juhiluba.', '**Kandideerimine:** saada CV. = Saada oma CV.'], 'full'),
      B.wordforms('063_d_time', 'Kellast kellani?', 'Kirjuta kellaaeg sõnaga küsimuse järgi.', [
        ['8', 'kellast?', 'kaheksast'], ['15', 'kellani?', 'viieteistkümneni, kolmeni'], ['7', 'kellast?', 'seitsmest'], ['23', 'kellani?', 'kahekümne kolmeni, üheteistkümneni'], ['9', 'kellast?', 'üheksast'], ['17', 'kellani?', 'seitsmeteistkümneni, viieni'], ['10', 'kellast?', 'kümnest'], ['18', 'kellani?', 'kaheksateistkümneni, kuueni']]),
      B.gaps('063_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', ['Laos on kaks [vahetust]: hommikul ja õhtul.', 'Minu [tööaeg] on kella üheksast viieni.', 'Kohvikus on [palk] 1300 eurot kuus.', 'Eesti keel on selles töös [vajalik].', 'Mul on kolm aastat [kogemust|töökogemust] laos.', 'Ma tahan sellele kohale [kandideerida].', 'Hommikune [vahetus] algab kell seitse.', 'Kas sa tahad sellele tööle [kandideerima] hakata?'], ['vahetust', 'tööaeg', 'palk', 'vajalik', 'kogemust', 'kandideerida', 'vahetus', 'kandideerima', 'tunnis', 'graafik']),
      B.transformation('063_d_trans', 'Ütle lausega.', 'Kirjuta kuulutuse info täislausena.', [
        ['Tööaeg: E–R', 'Ma töötan …', 'Ma töötan esmaspäevast reedeni.'], ['Vahetus: 7–15', 'Vahetus kestab …', 'Vahetus kestab kella seitsmest kolmeni.|Vahetus kestab seitsmest kolmeni.'],
        ['Palk: 9 € tunnis', 'Palk on …', 'Palk on üheksa eurot tunnis.|Palk on 9 eurot tunnis.'], ['Vajalik: töökogemus', 'Töökogemus on …', 'Töökogemus on vajalik.'],
        ['Kasuks tuleb: juhiluba', 'Hea, kui …', 'Hea, kui sul on juhiluba.|Hea, kui teil on juhiluba.'], ['Kandideerimine: saada CV', 'Kui tahad kandideerida, …', 'Kui tahad kandideerida, saada CV.|Kui tahad kandideerida, saada oma CV.'], ['Vahetus: 15–23', 'Õhtuvahetus kestab …', 'Õhtuvahetus kestab kella kolmest üheteistkümneni.|Õhtuvahetus kestab kolmest üheteistkümneni.'], ['Palk: 1300 € kuus', 'Palk on …', 'Palk on 1300 eurot kuus.|Palk on tuhat kolmsada eurot kuus.']]),
      B.translation('063_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я ищу новую работу.', 'Смена длится восемь часов.', 'Зарплата девять евро в час.', 'Опыт работы необходим.', 'Я работаю с понедельника по пятницу.', 'У меня утренняя смена.', 'Смена начинается в семь часов.', 'Я работаю со среды по пятницу.']),
      B.speaking('063_d_say', 'Mis töö sulle sobib?', 'Räägi 1 minut: milline tööaeg ja palk sulle sobivad.', [
        'Kas sa tahad töötada hommikul või õhtul?', 'Kas sa tahad töötada vahetustega?', 'Mis on sulle tähtsam: palk või tööaeg?', 'Miks?',
      ], [60, 120], ['Mulle sobib…', 'Ma tahan töötada kella …-st …-ni.', 'Minu jaoks on tähtis…, sest…']),
      B.writing('063_d_write', 'Kumb töö?', 'Kirjuta 6–8 lauset: kumb töö sobib sulle ja miks.', [6, 8], ['tööaeg', 'palk', 'vajalik', 'sest'], 2),
    ],
    practice: [
      B.cloze('063_p_cloze', 'Kiri tööandjale.', 'Vali igasse lünka sobiv sõna.', 'Tere!', [
        'Ma nägin teie kuulutust internetis. Ma tahan {*kandideerida|kandideerima|kandideerin} klienditeenindaja kohale.',
        '',
        'Varem töötasin ma kaks aastat {*müüjana|müüja|müüjat} toidupoes. Praegu {*töötan|töötab|töötama} ma ülikooli raamatukogus. Mul on ka kohviku {*kogemus|kogemust|kogemusega}.',
        '',
        'Ma räägin eesti, vene ja inglise keelt. Mulle sobib töötada {*graafiku|graafik|graafikut} alusel, ka nädalavahetusel.',
        '',
        'Ma saan tööd alustada {*järgmisel|järgmise|järgmist} nädalal. Minu CV on {*kirja|kiri|kirjas} lisas. Ootan teie {*vastust|vastus|vastusega}. Lugupidamisega, Sofia Melnik',
      ], 'g_vocab'),
      B.choice('063_p_form', 'Vali õige vorm.', 'Vali lünka õige vorm.', [
        ['Ma töötan ___ reedeni.', 'esmaspäevast', 'esmaspäeval', 'esmaspäeva'], ['Vahetus kestab kella seitsmest ___.', 'kolmeni', 'kolmest', 'kolm'],
        ['Palk on üheksa eurot ___.', 'tunnis', 'tund', 'tunniks'], ['Mul on kaks aastat ___.', 'töökogemust', 'töökogemus', 'töökogemusega'],
        ['Ma tahan sellele tööle ___.', 'kandideerida', 'kandideerima', 'kandideerin'], ['Eesti keel on selles töös ___.', 'vajalik', 'vajalikud', 'vajalikku'], ['Kohvik on avatud ___ seitsmeni.', 'kella', 'kell', 'kellal'], ['Õhtuvahetuses on palk ___.', 'kõrgem', 'kõrge', 'kõrgemat']], 'full', 'g_notice'),
      B.formtext('063_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Minu töö laos', [
        'Ma töötan laos [esmaspäevast] (esmaspäev) [reedeni] (reede).',
        '',
        'Minu vahetus kestab kella [seitsmest] (seitse) kella [kolmeni] (kolm).',
        '',
        'Palk on kümme eurot [tunnis] (tund). Õhtuvahetuses on palk [kõrgem] (kõrge).',
        '',
        'Mul on kolm aastat [töökogemust] (töökogemus). [Laupäeval] (laupäev) on mul vaba päev.',
      ], 'g_notice'),
      B.wordforms('063_p_days', 'Nädalapäevad.', 'Kirjuta nädalapäev küsimuse järgi.', [
        ['esmaspäev', 'mis päevast?', 'esmaspäevast'], ['reede', 'mis päevani?', 'reedeni'], ['teisipäev', 'millal?', 'teisipäeval'],
        ['laupäev', 'mis päevast?', 'laupäevast'], ['pühapäev', 'mis päevani?', 'pühapäevani'], ['neljapäev', 'millal?', 'neljapäeval'], ['kolmapäev', 'millal?', 'kolmapäeval'], ['esmaspäev', 'mis päevani?', 'esmaspäevani']]),
      B.gaps('063_p_gaps', 'Kirjuta õiges vormis.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Liis töötab kohvikus [klienditeenindajana] (klienditeenindaja).', 'Tema vahetus kestab kella seitsmest [kolmeni] (kolm).', 'Markus töötab [esmaspäevast] (esmaspäev) reedeni.',
        'Palk on kümme eurot [tunnis] (tund).', 'Anna vastutab [klientide] (kliendid) eest.', 'Olga töötab [raamatupidajana] (raamatupidaja) ja tema töökoht on [kontoris] (kontor).', 'Jaan töötab [pühapäeval] (pühapäev) hommikul.']),
      B.errorfix('063_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma töötan kell kaheksa kuni kell viis.', 'Ma töötan kella kaheksast viieni.|Ma töötan kaheksast viieni.'], ['Palk on kümme eurot tund.', 'Palk on kümme eurot tunnis.'], ['Mul on kaks aastat kogemus.', 'Mul on kaks aastat kogemust.|Mul on kahe aasta kogemus.'], ['Ma tahan kandideerima sellele tööle.', 'Ma tahan sellele tööle kandideerida.|Ma tahan kandideerida sellele tööle.'], ['Eesti keel on vajalikud.', 'Eesti keel on vajalik.'], ['Ma töötan esmaspäevast reedel.', 'Ma töötan esmaspäevast reedeni.'], ['Ma tahan kandideerima autojuhi kohale.', 'Ma tahan kandideerida autojuhi kohale.'], ['Mul on viis aastat kogemus.', 'Mul on viis aastat kogemust.|Mul on viie aasta kogemus.']]),
      B.reading('063_p_read', 'Loe töögraafikut.', 'Loe graafik ja juhataja märkus. Vasta küsimustele.', 'Kohviku töögraafik, 1.–7. aprill',
        'Maarja: E ja T hommikuvahetus 7–15, R ja L õhtuvahetus 15–23.\nLiene: E, K ja N õhtuvahetus 15–23.\nLiis: T, K ja N hommikuvahetus 7–15.\nJaan: R, L ja P hommikuvahetus 7–15.\n\nMärkus juhatajalt: Kolmapäeval tuleb kohvikusse suur grupp turiste. Sel päeval peab hommikul tööl olema kaks inimest. Kes saab kolmapäeva hommikul tulla, palun kirjutage mulle. Kui sa tahad vahetust vahetada, kirjuta mulle kaks päeva varem. Õhtuvahetuses on palk tunnis üks euro kõrgem. Uus töötaja Sofia alustab järgmisel nädalal. Esimesel päeval õpetab teda Liis.',
        [['Kes töötab esmaspäeva õhtul?', 'Liene'], ['Mitu vahetust on Maarjal sel nädalal?', 'neli|4'], ['Mitu inimest peab kolmapäeva hommikul tööl olema?', 'kaks|2'], ['Millal peab kirjutama, kui tahad vahetust vahetada?', 'kaks päeva varem|2 päeva varem'], ['Miks on õhtuvahetus rahaliselt parem?', 'palk on kõrgem|tunnis üks euro rohkem|palk on üks euro kõrgem'], ['Kes töötab pühapäeval?', 'Jaan'], ['Kes töötab neljapäeva hommikul?', 'Liis'], ['Kui palju kõrgem on õhtuvahetuse palk?', 'üks euro tunnis|1 euro|üks euro']]),
      B.wordorder('063_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Minu vahetus algab kell seitse hommikul.', 'Palk on kümme eurot tunnis.', 'Kas selles töös on kogemus vajalik?', 'Ma töötan esmaspäevast reedeni.', 'Ma tahan sellele kohale kandideerida.', 'Õhtuvahetus kestab kella kolmest üheteistkümneni.', 'Kolmapäeval tuleb kohvikusse suur grupp turiste.', 'Kas sa saad laupäeval minu vahetuse võtta?']),
      B.speaking('063_p_say', 'Sinu graafik.', 'Räägi oma nädala tööajast või õppimisest 1 minut.', [
        'Mis päevadel sa töötad?', 'Kellast kellani?', 'Kas sul on vahetused?', 'Millal sul on vaba päev?',
      ], [60, 120], ['Ma töötan …-st …-ni.', 'Esmaspäeval…', 'Mul on vaba…']),
    ],
    transfer: [
      B.text('063_t_situation', 'Uus olukord', 'Sinu sõber Andrei otsib tööd. Ta loeb eesti keelt veel aeglaselt. Andrei saatis sulle kolm töökuulutust. Tal on juhiluba ja ta saab töötada ainult tööpäevadel.'),
      B.reading('063_t_ads', 'Loe kolme kuulutust.', 'Loe kuulutused ja vasta küsimustele.', 'Kolm töökuulutust',
        'A. Pagariäri otsib müüjat. Tööaeg on E–R kella 7–15. Palk on 1200 eurot kuus. Eesti keel peab olema vähemalt A2 tasemel. Kogemus ei ole vajalik. Pakume tasuta kohvi ja saia. Kandideerimiseks helista juhatajale.\n\nB. Kullerfirma otsib autojuhti. Töö on E–R, vahetus kestab kella 9–18. Palk on 1500 eurot kuus. Vajalik on B-kategooria juhiluba. Kasuks tuleb Tallinna tundmine. Firma annab töötajale auto ja telefoni. Saada CV meie kodulehel.\n\nC. Hotell otsib koristajat nädalavahetuseks. Töö on laupäeval ja pühapäeval kella 10–16. Palk on 10 eurot tunnis. Kogemus tuleb kasuks. Hotell asub kesklinnas, bussipeatuse lähedal. Tule vestlusele esmaspäeval kell 12.',
        [['Mis töö sobib Andreile kõige paremini?', 'B|autojuht|autojuhi töö|kullerfirma töö'], ['Miks ei sobi Andreile töö C?', 'see on nädalavahetusel|töö on laupäeval ja pühapäeval'], ['Kui palju teenib koristaja ühel päeval?', 'kuuskümmend eurot|60 eurot|60'], ['Kuidas saab kandideerida autojuhi tööle?', 'saata CV kodulehel|kodulehel|saada CV'], ['Mitu tundi päevas töötab pagariäri müüja?', 'kaheksa|8|kaheksa tundi'], ['Mida annab kullerfirma töötajale?', 'auto ja telefoni|autot ja telefoni|auto ja telefon'], ['Mida pakub pagariäri töötajatele?', 'tasuta kohvi ja saia|kohvi ja saia'], ['Mis kategooria juhiluba on autojuhil vaja?', 'B|B-kategooria']]),
      B.listening('063_t_listen', 'Kuula tööandja sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Andrei! Siin on Kerli kullerfirmast Kiirkuller.', 'Aitäh, et saatsite oma CV.', 'Me tahame teid vestlusele kutsuda.', 'Vestlus on neljapäeval kell üksteist.',
        'Meie kontor on Pärnu maanteel, maja number kakskümmend.', 'Võtke kaasa juhiluba ja isikutunnistus.', 'Esimesel nädalal sõidate koos kolleegiga.', 'Palun helistage mulle tagasi täna kella viieni. Head päeva!',
      ], ['Vestlus on [neljapäeval].', 'Vestlus algab kell [üksteist|11].', 'Kontor on Pärnu maanteel, maja number [kakskümmend|20].', 'Kaasa tuleb võtta juhiluba ja [isikutunnistus|isikutunnistuse].', 'Esimesel nädalal sõidab Andrei koos [kolleegiga].', 'Andrei peab helistama kella [viieni|5ni|17ni].']),
      B.choice('063_t_check', 'Mida see tähendab?', 'Loe kuulutuse rida. Vali õige tähendus.', [
        ['„Tööaeg graafiku alusel.”', 'Tööpäevad on igal nädalal erinevad.', 'Töö on ainult esmaspäeval.', 'Tööaega ei ole kirjas.'],
        ['„Kogemus tuleb kasuks.”', 'Kogemus on hea, aga mitte kohustuslik.', 'Ilma kogemuseta ei saa tööle.', 'Kogemus ei ole hea.'],
        ['„Palk 10 € tunnis bruto.”', 'Kümme eurot tunnis enne makse.', 'Kümme eurot päevas pärast makse.', 'Kümme eurot kuus.'],
        ['„Kandideerimine kuni 15. maini.”', 'CV peab tulema hiljemalt 15. mail.', 'Töö algab 15. mail.', 'Vestlus on 15. mail.'],
        ['„E–R 9–18.” Millal sa töötad?', 'Esmaspäevast reedeni kella üheksast kuueni.', 'Ainult esmaspäeval ja reedel.', 'Iga päev kella üheksast.'], ['„Pakume tasuta lõunat.”', 'Lõuna on töötajale tasuta.', 'Lõuna maksab palju.', 'Lõunat ei ole.'], ['„Töö algab kohe.”', 'Võid tööd alustada kohe.', 'Töö algab aasta pärast.', 'Tööd ei ole.'], ['„Tööaeg L–P.”', 'Sa töötad nädalavahetusel.', 'Sa töötad esmaspäeval.', 'Sa ei tööta kunagi.']], 'full', 'g_read'),
      B.rolecards('063_t_roles', 'Töövestlus telefonis.', 'Üks on Andrei, teine tööandja. Rääkige 2–3 minutit.',
        'Oled Andrei. Helistad kullerfirmasse. Küsi tööaja, palga ja auto kohta. Räägi oma kogemusest.', 'Oled kullerfirma juht. Küsi kogemuse ja juhiloa kohta. Vasta Andrei küsimustele.',
        ['Ma helistan kuulutuse pärast.', 'Mis kell vahetus algab?', 'Mul on … aastat kogemust.'], ['Kas teil on juhiluba?', 'Kas te tunnete Tallinna?', 'Tööaeg on…']),
      B.speaking('063_t_dream', 'Milline töö sulle sobib?', 'Räägi 1 minut: milline töö ja tööaeg sulle sobivad.', [
        'Mis ametit sa tahad?', 'Mis tööaeg sulle sobib?', 'Kui suur palk on hea?', 'Mis on tööl kõige tähtsam?',
      ], [60, 90], ['Mulle sobib töö…', 'Ma tahan töötada …-st …-ni.', 'Tööl on kõige tähtsam…']),
      B.letter('063_t_letter', 'Kandideeri!', 'Kirjuta kullerfirmale lühike kiri. Tutvusta ennast ja oma kogemust.', 'Tere!', 'Lugupidamisega', [40, 60]),
      B.rubric('063_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kirjas on amet, kogemus, sobiv tööaeg ja kontakt (40–60 sõna).', 'Aeg on õiges vormis: esmaspäevast reedeni, kella seitsmest kolmeni.', 'Telefonivestluses küsitakse tööaega, palka ja nõudeid.', 'Valik on põhjendatud vähemalt kahe põhjusega.']),
      B.selfcheck('063_t_self', ['Ma oskan leida kuulutusest tööaja, palga ja nõuded.', 'Ma oskan kasutada sõnu vahetus, tööaeg, palk, kogemus, vajalik.', 'Ma oskan öelda aega: esmaspäevast reedeni, kella seitsmest kolmeni.', 'Ma oskan valida sobiva töö ja kirjutada lühikese kandideerimiskirja.'], 'Leian sobiva töö'),
    ],
  },

  'a2-064': {
    title: 'Tööpäeva juhised',
    canDo: 'Ma kuulan lühikest tööjuhist või häälsõnumit kaks korda ja saan aru vähemalt 75% tegevustest, ajast ja muudatustest; annan ise juhiseid (alusta, too, vii, helista).',
    template: 'v3',
    discover: [
      B.text('064_d_situation', 'Hommik hotellis', 'Liis töötab hotelli vastuvõtus. Kell on 7.50. Juhataja Helen ei ole täna tööl, aga ta jättis Liisile häälsõnumi. Täna on hotellis palju külalisi ja mõned muudatused.'),
      B.listening('064_d_listen', 'Kuula juhataja häälsõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Liis! Siin Helen.', 'Ma olen täna haige, nii et sina oled vastuvõtus üksi.', 'Kõigepealt kontrolli broneeringuid arvutis.', 'Kell üheksa tuleb grupp Soomest. Neid on kaksteist inimest.',
        'Vii nende kohvrid teisele korrusele. Tarmo aitab sind.', 'Kell kaksteist helista pesumajja ja küsi, millal nad toovad rätikud.', 'Muudatus: koosolek ei ole täna, vaid homme kell kümme.', 'Kell neli tuleb Kati. Oota teda ja siis lõpeta töö.',
      ], ['Helen on täna [haige].', 'Kõigepealt peab Liis kontrollima [broneeringuid].', 'Grupp tuleb [Soomest].', 'Kohvrid tuleb viia [teisele] korrusele.', 'Kell kaksteist peab Liis helistama [pesumajja].', 'Koosolek on [homme] kell kümme.', 'Kati tuleb kell [neli|4|16].', 'Kohvreid aitab viia [Tarmo].']),
      B.reading('064_d_note', 'Loe juhataja kirja.', 'Loe kirja ja vasta küsimustele.', 'Homseks',
        'Tere, Liis! Aitäh, et sa täna üksi hakkama said. Homme on mõned muudatused. Hommikul ära alusta kell kaheksa, vaid kell seitse. Kell pool kaheksa toob pagar värsked saiad. Vii need kohe kööki. Kell kümme on koosolek minu kabinetis. Too palun kaasa nädala broneeringute nimekiri. Pärast koosolekut saada Soome grupile e-kiri. Kirjuta, et buss lennujaama väljub kell kolm. Kui keegi helistab ja küsib vaba tuba, ütle, et nädalavahetusel on hotell täis. Kui sul on küsimusi, helista mulle. Ma olen homme kontoris kogu päeva. Helen',
        [['Mis kell alustab Liis homme tööd?', 'kell seitse|seitse|7'], ['Mida toob pagar?', 'värsked saiad|saiad|saiu'], ['Kuhu peab Liis saiad viima?', 'kööki'], ['Mida peab Liis koosolekule kaasa tooma?', 'broneeringute nimekirja|nimekirja|nädala broneeringute nimekirja'], ['Mis kell väljub buss lennujaama?', 'kell kolm|kolm|15'], ['Mida ütleb Liis, kui keegi küsib vaba tuba?', 'nädalavahetusel on hotell täis|hotell on täis'], ['Mis kell on koosolek?', 'kell kümme|kümme|10'], ['Kellele peab Liis e-kirja saatma?', 'Soome grupile|grupile']]),
      B.notice('064_d_notice', 'Märka: juhis (käskiv kõneviis)', ['ma-vorm → juhis: alusta**ma** → **alusta!**, oota**ma** → **oota!**', 'helista**ma** → **helista!**, kontrolli**ma** → **kontrolli!**', 'Jäta meelde: too**ma** → **too!**, vii**ma** → **vii!**, saat**ma** → **saada!**', 'Eitus: **ära alusta! ära helista!**', 'Viisakalt: **palun helista!** — teie-vorm: **helistage!**'], 'full'),
      B.gaps('064_d_gaps', 'Täida juhised.', 'Vali sõnapangast sobiv juhis. Kaks sõna jääb üle.', ['Palun [helista] kliendile tagasi.', '[Vii] see pakk postkontorisse.', '[Too] mulle palun kohvi.', '[Oota] siin, ma tulen kohe.', '[Saada] arve kliendile e-postiga.', 'Palun [lõpeta] töö kell viis.', '[Alusta] tööd homme kell seitse.', '[Kontrolli] palun see broneering üle.'], ['helista', 'vii', 'too', 'oota', 'saada', 'lõpeta', 'alusta', 'kontrolli', 'vala', 'pane']),
      B.wordorder('064_d_order2', 'Pane juhis kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kõigepealt kontrolli broneeringuid arvutis.', 'Vii kohvrid teisele korrusele.', 'Kell kaksteist helista pesumajja.', 'Koosolek ei ole täna, vaid homme.', 'Oota Katit ja siis lõpeta töö.', 'Kell pool kaheksa toob pagar värsked saiad.', 'Too koosolekule broneeringute nimekiri.', 'Nädalavahetusel on hotell täis.']),
      B.translation('064_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Позвони клиенту.', 'Отнеси чемоданы в номер.', 'Принеси список на совещание.', 'Подожди здесь, пожалуйста.', 'Отправь счёт сразу.', 'Начни работу в восемь.', 'Закончи отчёт к пятнице.', 'Отнеси письма на почту.']),
      B.rolecards('064_d_roles', 'Juhataja ja töötaja.', 'A annab kolm juhist, B kordab ja küsib. Siis vahetage.',
        'Oled juhataja. Anna töötajale kolm juhist: mida, kuhu ja mis kell.', 'Oled töötaja. Korda juhist ja küsi, kui midagi on ebaselge.',
        ['Palun vii…', 'Kell … helista…', 'Too mulle…'], ['Selge. Ma viin…', 'Kas ma pean kohe…?', 'Palun korrake, mis kell?']),
      B.writing('064_d_write', 'Juhised kolleegile.', 'Kirjuta kolleegile homseks 6–8 juhist.', [6, 8], ['kontrolli', 'vii', 'helista', 'saada'], 2),
    ],
    practice: [
      B.formtext('064_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna juhisena (sina).', 'Homme oled poes üksi', [
        'Homme oled sa poes üksi. [Alusta] (alustama) tööd kell kaheksa.',
        '',
        'Kõigepealt [kontrolli] (kontrollima) kassat ja [lülita] (lülitama) tuled sisse.',
        '',
        'Kell kümme [helista] (helistama) tarnijale ja [telli] (tellima) piima.',
        '',
        'Ära [unusta] (unustama) prügi välja viia. Õhtul [pane] (panema) uks lukku ja [saada] (saatma) mulle sõnum.',
      ], 'g_notice'),
      B.listening('064_p_listen', 'Kuulamine 1. Neli ülesannet.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Markus, tere! Siin Toomas.', 'Mul on sulle täna neli ülesannet.', 'Esiteks saada kliendile Tammele pakk. Pakk on kolmandal riiulil.', 'Teiseks helista Andresele, sest arvuti ei tööta.',
        'Kolmandaks too koosolekuruumi kümme tooli.', 'Neljandaks vii kaks kirja postkontorisse. Postkontor on avatud kella kuueni.', 'Koosolek algab kell kolm, mitte kell kaks. Aitäh!',
      ], ['Pakk tuleb saata kliendile [Tammele].', 'Arvuti ei tööta, seepärast tuleb helistada [Andresele].', 'Koosolekuruumi on vaja [kümme|10] tooli.', 'Kirjad tuleb viia [postkontorisse].', 'Postkontor on avatud kella [kuueni|6ni|18ni].', 'Koosolek algab kell [kolm|3|15].', 'Sõnumi jätab [Toomas].', 'Pakk on kolmandal [riiulil].']),
      B.cloze('064_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Sofia esimene päev raamatukogus', [
        'Sofia töötab esimest päeva raamatukogus. Juhataja ütleb: „Kõigepealt {*kontrolli|kontrollib|kontrollima} e-posti.',
        '',
        'Siis {*vii|viib|viima} uued raamatud teisele korrusele. Kell kaksteist {*helista|helistab|helistama} kirjastusse.',
        '',
        'Kui lugeja küsib abi, {*aita|aitab|aitama} teda. Ära {*unusta|unustab|unustama} lõunapausi!',
        '',
        'Kell viis {*lõpeta|lõpetab|lõpetama} töö ja {*pane|paneb|panema} arvuti kinni. Kui sul on küsimusi, {*küsi|küsib|küsima} minult.”',
      ], 'g_vocab'),
      B.listening('064_p_change', 'Kuulamine 2. Muudatus.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Markus, siin jälle Toomas. Mul on kaks muudatust.', 'Kliendil Tammel on uus aadress. Ära saada pakki vanale aadressile.', 'Uue aadressi saadan sulle sõnumiga.',
        'Koosolek ei ole kolmandal korrusel, vaid teisel korrusel.', 'Seepärast vii toolid teise korruse saali.', 'Kirjad võid viia postkontorisse homme hommikul.',
      ], ['Kliendil on uus [aadress].', 'Toomas saadab aadressi [sõnumiga].', 'Koosolek on [teisel] korrusel.', 'Toolid tuleb viia teise korruse [saali].', 'Kirjad võib viia [homme] hommikul.', 'Sõnum on [Markusele].', 'Pakki ei tohi saata [vanale] aadressile.', 'Toomasel on kaks [muudatust].']),
      B.gaps('064_p_gaps', 'Kirjuta juhis.', 'Kirjuta sulgudes olev tegusõna juhisena (sina).', [
        'Palun [too] (tooma) mulle uus kaust.', '[Helista] (helistama) kliendile enne lõunat.', '[Vii] (viima) see pakk Viktorile.', '[Oota] (ootama) mind fuajees.', '[Saada] (saatma) mulle aruanne reedeks.', '[Ära alusta] (alustama, eitus) ilma minuta!', '[Kontrolli] (kontrollima) arvel olevat summat.', 'Palun [ära unusta] (unustama, eitus) võtit!']),
      B.transformation('064_p_trans', 'Ütle juhisena.', 'Muuda lause juhiseks.', [
        ['Sa pead arve saatma.', 'Juhis: …', 'Saada arve!|Palun saada arve!'], ['Sa pead kell kaheksa alustama.', 'Juhis: …', 'Alusta kell kaheksa!|Palun alusta kell kaheksa!'],
        ['Sa pead kliendile helistama.', 'Juhis: …', 'Helista kliendile!|Palun helista kliendile!'], ['Sa pead toolid tooma.', 'Juhis: …', 'Too toolid!|Palun too toolid!'],
        ['Sa ei pea ootama.', 'Juhis: …', 'Ära oota!'], ['Te peate kohe helistama.', 'Juhis (teie): …', 'Helistage kohe!|Palun helistage kohe!'], ['Sa pead paki viima.', 'Juhis: …', 'Vii pakk!|Palun vii pakk!'], ['Te peate ootama.', 'Juhis (teie): …', 'Oodake!|Palun oodake!']]),
      B.errorfix('064_p_fix', 'Paranda viga.', 'Kirjuta juhis õigesti.', [['Palun helistama kliendile!', 'Palun helista kliendile!'], ['Saatma arve kohe!', 'Saada arve kohe!'], ['Vii mulle palun kohvi!', 'Too mulle palun kohvi!'], ['Ära ootad mind!', 'Ära oota mind!'], ['Palun kontrollib broneeringut!', 'Palun kontrolli broneeringut!'], ['Alustama tööd kell seitse!', 'Alusta tööd kell seitse!'], ['Viima prügi välja!', 'Vii prügi välja!'], ['Ära unustad ust lukku panna!', 'Ära unusta ust lukku panna!']]),
      B.dialogue('064_p_dialog', 'Telefonis.', 'Täida Markuse ja Toomase vestlus.', 'Markus', 'Toomas', [
        ['A', 'Tere, Toomas! Mul on üks küsimus.'], ['B', 'Jah, [küsi]!'], ['A', 'Kas ma pean paki täna [saatma]?'], ['B', 'Jah, [saada] see kohe, palun.'],
        ['A', 'Selge. Ja kuhu ma toolid [viin]?'], ['B', '[Vii] need teise korruse saali.'], ['A', 'Kas ma pean ka postkontorisse [minema]?'], ['B', 'Ei, täna mitte. [Mine] homme hommikul.'],
      ]),
      B.speaking('064_p_say', 'Häälsõnum kolleegile.', 'Jäta kolleegile häälsõnum: kolm juhist ja üks muudatus.', ['Tervita ja ütle oma nimi.', 'Anna kolm juhist.', 'Ütle üks muudatus.', 'Lõpeta viisakalt.'], [45, 90], ['Siin…', 'Kõigepealt…', 'Muudatus: … ei ole …, vaid…']),
    ],
    transfer: [
      B.text('064_t_situation', 'Uus olukord', 'Sa töötad Jaani kohvikus. Homme on Jaan koolitusel ja sina oled kohvikus üksi. Jaan jättis sulle häälsõnumi. Õhtul helistab ka uus töötaja Karl ja küsib, mida ta peab homme tegema.'),
      B.listening('064_t_listen', 'Kuula Jaani sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin Jaan. Homme oled sa kohvikus üksi.', 'Alusta tööd kell seitse. Võti on naabri juures, korteris viis.', 'Kõigepealt lülita sisse kohvimasin.', 'Kell pool kaheksa toob pagar saiad. Kontrolli, kas kõik on olemas.',
        'Kell kümme tuleb uus töötaja Karl. Näita talle kassat.', 'Pärastlõunal helista piimafirmale ja telli kaks kasti piima.', 'Muudatus: kohvik ei sulge kell kuus, vaid kell viis.', 'Lõpuks vii prügi välja ja pane uks lukku. Aitäh!',
      ], ['Tööd tuleb alustada kell [seitse|7].', 'Võti on [naabri] juures.', 'Kõigepealt tuleb sisse lülitada [kohvimasin].', 'Uus töötaja tuleb kell [kümme|10].', 'Piimafirmalt tuleb tellida kaks [kasti].', 'Homme sulgeb kohvik kell [viis|5|17].', 'Sõnumi jätab [Jaan].', 'Karlile tuleb näidata [kassat].']),
      B.truefalse('064_t_tf', 'Õige või vale?', 'Kuula Jaani sõnumit uuesti.', [['Võti on Jaani juures.', false], ['Pagar toob saiad kell pool kaheksa.', true], ['Karl tuleb pärastlõunal.', false], ['Piima tuleb tellida.', true], ['Homme on kohvik avatud kella kuueni.', false], ['Pagar toob saiad kohvikusse.', true], ['Prügi tuleb välja viia hommikul.', false], ['Karl on kohvikus uus töötaja.', true]]),
      B.transformation('064_t_mia', 'Juhised Karlile (teie).', 'Kirjuta juhis teie-vormis.', [
        ['Tule kell kümme.', 'teie', 'Tulge kell kümme.'], ['Oota mind kassa juures.', 'teie', 'Oodake mind kassa juures.'], ['Too oma ID-kaart kaasa.', 'teie', 'Tooge oma ID-kaart kaasa.'],
        ['Helista, kui jääd hiljaks.', 'teie', 'Helistage, kui jääte hiljaks.'], ['Kontrolli saiad üle.', 'teie', 'Kontrollige saiad üle.'], ['Võta võti naabrilt.', 'teie', 'Võtke võti naabrilt.'], ['Pane uks lukku.', 'teie', 'Pange uks lukku.'], ['Ära unusta prügi.', 'teie', 'Ärge unustage prügi.']]),
      B.rolecards('064_t_roles', 'Karl helistab.', 'A on Karl, B annab juhiseid. Siis vahetage.',
        'Oled uus töötaja Karl. Küsi: mis kell tulla, mida teha, millal lõpetada.', 'Selgita Karlile homset päeva Jaani sõnumi järgi. Ütle ka muudatus.',
        ['Mis kell ma pean tulema?', 'Mida ma pean tegema?', 'Palun korrake!'], ['Tulge kell…', 'Kõigepealt…', 'Muudatus: …']),
      B.speaking('064_t_voice', 'Häälsõnum Jaanile.', 'Jaan ei vasta. Jäta talle häälsõnum: kõik on selge ja üks küsimus.', ['Tervita ja ütle oma nimi.', 'Korda kaks tähtsat juhist.', 'Küsi üks küsimus.', 'Lõpeta viisakalt.', 'Ütle, millal sa tagasi helistad.'], [45, 90]),
      B.letter('064_t_letter', 'Sõnum Karlile.', 'Kirjuta Karlile 50–70 sõna: millal tulla, mida kaasa võtta, mida teha.', 'Tere, Karl!', 'Kohtumiseni homme!', [50, 70]),
      B.rubric('064_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kuulamisest on kirjas aeg, koht ja tegevused.', 'Juhised on õiges vormis (alusta, vii, helista; tulge, oodake).', 'Sõnumis Karlile on aeg, kaasa võtta ja ülesanded.', 'Telefonis küsib ja täpsustab õpilane, kui ei saa aru.']),
      B.selfcheck('064_t_self', ['Ma saan aru kolleegi häälsõnumist.', 'Ma panen juhised õigesse järjekorda.', 'Ma kirjutan uuele töötajale selged juhised.', 'Ma selgitan päeva plaani telefonis.'], 'Päev on plaanitud'),
    ],
  },

  'a2-065': {
    title: 'Kontroll 13 — töö',
    assessment: true,
    canDo: 'Ma näitan kontrollis, et oskan rääkida oma tööst ja kohustustest, saan aru töökuulutusest ja tööjuhisest ning kasutan pean / oskan + infinitiivi (vähemalt 70%).',
    discover: [
      B.text('065_d_situation', 'Kordamine: Markuse uus töö', 'Markus leidis lõpuks uue töö. Nüüd töötab ta suures firmas laotöötajana. Tööpäev on kella kaheksast neljani. Esimesel nädalal õpib ta palju uut.'),
      B.truefalse('065_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Markus otsib veel tööd.', false], ['Markus töötab laos.', true], ['Firma on väike.', false], ['Tööpäev lõpeb kell neli.', true], ['Markus õpib tööl palju uut.', true],
      ]),
      B.reading('065_d_read', 'Loe: Markuse esimene nädal.', 'Loe teksti ja vasta küsimustele.', 'Uus töö laos',
        'Markus oli kaks kuud töötu. Eelmisel kuul nägi ta internetis kuulutust: firma „Kiir” otsib laotöötajat. Markus saatis oma CV ja läks töövestlusele. Juhataja küsis: „Kas te oskate arvutiga töötada?” Markus vastas: „Natuke oskan. Aga ma oskan hästi autot juhtida.” Esmaspäeval allkirjastas ta lepingu. Markus töötab esmaspäevast reedeni kella kaheksast neljani. Lõuna on kell kaksteist. Ta peab kontrollima pakke ja viima need autodesse. Arvutiga ei pea ta palju töötama. Esimesel päeval oli ta väga väsinud. Kolmapäeval oli kontoris koosolek. Juhataja ütles: „Kui olete haige, helistage kohe mulle.” Reedel ütles Markus sõbrale: „Töö on raske, aga kolleegid on toredad. Ma tahan siin kaua töötada.”',
        [['Kui kaua oli Markus töötu?', 'kaks kuud|2 kuud'], ['Kus Markus kuulutust nägi?', 'internetis'], ['Mida Markus hästi oskab?', 'autot juhtida|juhtida autot'], ['Millal Markus lepingu allkirjastas?', 'esmaspäeval'], ['Mida Markus peab tööl tegema?', 'kontrollima pakke ja viima need autodesse|kontrollima pakke|pakke kontrollima'], ['Mida tuleb teha, kui oled haige?', 'helistama juhatajale|helistama kohe juhatajale|helistada juhatajale']]),
      B.table('065_d_find', 'Leia tekstist.', 'Kirjuta tekstist sobiv vorm.', 'Mida otsid?, Tekstist', [
        'peab + ma-vorm | [peab kontrollima/peab viima]', 'oskan + da-vorm | [oskan juhtida/oskate töötada]', 'ei pea + ma-vorm | [ei pea töötama]', 'tahan + da-vorm | [tahan töötada]', 'juhis teie-vormis | [helistage]', 'kellast kellani | [kella kaheksast neljani]',
      ], 'g_notice'),
      B.notice('065_d_notice', 'Mooduli kokkuvõte', [
        'Amet: Ta on **kokk**. Ta töötab **kokana** restoranis.', 'Graafik: **esmaspäevast reedeni, kella kaheksast neljani**', 'Kohustus ja oskus: **pean töötama** — **oskan / saan / tahan töötada** — **ei pea töötama**', 'Juhis: **alusta, too, vii, helista!** — teie: **helistage!**', 'Kuulutus: **vajalik, kasuks tuleb, palk, kandideeri**',
      ], 'full'),
      B.categorize('065_d_sort', 'Mis sõna kuhu?', 'Pane sõnad õigesse rühma.', [
        ['Amet', ['kokk', 'raamatupidaja', 'bussijuht']], ['Töökoht', ['kontor', 'ladu', 'apteek']], ['Leping ja aeg', ['leping', 'vahetus', 'tööaeg']], ['Tööpäeval', ['koosolek', 'lõuna', 'paus']],
      ], 'full', 'g_vocab'),
      B.match('065_d_match', 'Küsimus ja vastus.', 'Ühenda küsimus ja vastus.', [
        ['Kellena sa töötad?', 'Raamatupidajana.'], ['Kus sa töötad?', 'Ühes väikeses firmas.'], ['Mis kellast sa töötad?', 'Kella üheksast viieni.'],
        ['Mida sa pead tegema?', 'Ma pean arveid kontrollima.'], ['Mida sa hästi oskad?', 'Ma oskan arvutiga töötada.'], ['Kas sa pead laupäeval töötama?', 'Ei, ma ei pea.'],
      ], 'full', 'g_use'),
      B.gaps('065_d_gaps', 'Mooduli vormid.', 'Kirjuta lünka sobiv sõna. Kuus sõna jääb üle.', [
        'Ta töötab [kokana] restoranis.', 'Pood on avatud [esmaspäevast] reedeni.', 'Ma pean homme vara [tõusma].', 'Kas sa oskad autot [juhtida]?', 'Palun [helista] mulle kohe!', 'Me ei [pea] laupäeval töötama.',
      ], ['kokana', 'kokk', 'esmaspäevast', 'esmaspäeval', 'tõusma', 'tõusta', 'juhtida', 'juhtima', 'helista', 'helistama', 'pea', 'peame']),
      B.transformation('065_d_trans', 'Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Ma töötan arvutiga.', 'oskan', 'Ma oskan arvutiga töötada.'], ['Ma tulen homme tööle.', 'pean', 'Ma pean homme tööle tulema.'], ['Sa pead kliendile helistama.', 'juhis', 'Helista kliendile!|Palun helista kliendile!'],
        ['Ta on õpetaja.', 'töötab', 'Ta töötab õpetajana.'], ['Pood on avatud 9–17.', 'kellast kellani', 'Pood on avatud kella üheksast viieni.'],
      ]),
      B.errorfix('065_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ta töötab kokk.', 'Ta töötab kokana.'], ['Ma pean töötada laupäeval.', 'Ma pean laupäeval töötama.|Ma pean töötama laupäeval.'], ['Kas sa oskad ujuma?', 'Kas sa oskad ujuda?'],
        ['Pood on avatud kaheksa kuni neli.', 'Pood on avatud kella kaheksast neljani.'], ['Palun helistama mulle!', 'Palun helista mulle!'],
      ]),
      B.dialogue('065_d_dialog', 'Töövestlus.', 'Täida juhataja ja Markuse vestlus.', 'Juhataja', 'Markus', [
        ['A', 'Tere! Kellena te varem [töötasite]?'], ['B', 'Ma töötasin autojuhina kaks aastat.'], ['A', 'Kas te oskate arvutiga [töötada]?'], ['B', 'Natuke oskan. Aga ma oskan hästi autot [juhtida].'],
        ['A', 'Te [peate] töötama esmaspäevast reedeni.'], ['B', 'Sobib. Kas ma pean ka laupäeval [töötama]?'], ['A', 'Ei, laupäeval te ei [pea] töötama.'], ['B', 'Millal ma [saan] alustada?'],
      ]),
      B.wordorder('065_d_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', ['Markus oli kaks kuud töötu.', 'Esmaspäeval allkirjastas ta lepingu.', 'Ta peab kontrollima pakke.', 'Arvutiga ei pea ta palju töötama.', 'Ma tahan siin kaua töötada.']),
      B.translation('065_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Он работает поваром.', 'Магазин открыт с девяти до пяти.', 'Я должна работать в субботу.', 'Я умею водить машину.', 'Позвони мне сразу!']),
      B.dictation('065_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ta töötab kokana.', 'Ma pean homme vara tõusma.', 'Kas sa oskad autot juhtida?', 'Pood on avatud kella üheksast viieni.', 'Palun helista mulle kohe!']),
      B.speaking('065_d_say', 'Kordame suuliselt.', 'Vasta paarilise küsimustele oma töö kohta.', ['Kellena ja kus sa töötad?', 'Mis kellast mis kellani sa töötad?', 'Mida sa pead tööl tegema?', 'Mida sa hästi oskad?'], [60, 120]),
      B.writing('065_d_write', 'Markuse töö.', 'Kirjuta 5–7 lauset: mida Markus peab tegema ja mida ta oskab.', [5, 7], ['peab', 'oskab', 'töötab'], 2),
    ],
    practice: [
      B.tip('065_p_how', 'Lugemine ja kuulamine (eksami vormis)', 'See osa on nagu Harno A2 eksam: viis lugemisülesannet ja kaks kuulamisülesannet. Teema on moodul 13. Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda.', 'full'),
      // reading 1: what to say at work
      B.choice('065_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sa jääd tööle hiljaks. Mida kirjutad ülemusele?', 'Vabandust, ma jään kümme minutit hiljaks.', 'Head isu, ma tulen varsti koju!', 'Palju õnne, ma olen juba tööl!'],
        ['Uus kolleeg alustab täna. Mida ütled?', 'Tere tulemast meie firmasse!', 'Head reisi ja kohtumiseni!', 'Jõudu ja head ööd!'],
        ['Sa oled haige. Mida ütled ülemusele?', 'Ma olen haige ja ei saa täna tulla.', 'Ma olen terve ja tulen kohe.', 'Ma olen puhkusel ja tulen täna.'],
        ['Sa ei saanud juhisest aru. Mida ütled?', 'Vabandust, kas te saate korrata?', 'Aitäh, kõik on väga selge!', 'Ma tean, ma tegin juba.'],
        ['Kolleeg lahkub reedel õhtul. Mida ütled?', 'Head nädalavahetust!', 'Head hommikut!', 'Head isu!'],
      ], 'full', 'g_use'),
      // reading 2: a job ad
      B.reading('065_p_ad', 'Lugemine 2. Töökuulutus.', 'Loe kuulutust ja vasta küsimustele.', 'Hotell „Meri” otsib administraatorit',
        'Hotell „Meri” Pärnus otsib administraatorit. Töö on vahetustega: üks päev 8–20, siis kaks päeva vaba. Sa pead võtma vastu külalisi, vastama telefonile ja kontrollima broneeringuid. Vajalik: eesti ja inglise keel, arvutioskus. Kasuks tuleb vene või soome keel. Kogemust ei pea olema, me õpetame sind. Palk on 1500 eurot kuus. Töötajad saavad tasuta lõunat. Leping on kõigepealt üheks aastaks. Praktika kestab kaks nädalat. Tööle saab tulla juunist. Saada CV ja lühike kiri kuni 15. maini. Küsimuste korral helista juhatajale Helen Saarele.',
        [['Mis linnas hotell on?', 'Pärnus'], ['Kui pikk on üks vahetus?', '12 tundi|kaksteist tundi|kella kaheksast kaheksani'], ['Mis keeli on vaja?', 'eesti ja inglise keelt|eesti ja inglise'], ['Kas kogemus on vajalik?', 'ei|ei ole|kogemust ei pea olema'], ['Mida saavad töötajad tasuta?', 'lõunat|lõuna'], ['Kuni mis kuupäevani saab kandideerida?', '15. maini|viieteistkümnenda maini']]),
      // reading 3: signs at work
      B.match('065_p_signs', 'Lugemine 3. Kuhu minna?', 'Ühenda olukord ja silt.', [
        ['Tahad kolleegidega kohvi juua.', 'Köök — kohvimasin ja külmkapp'], ['Pead allkirjastama lepingu.', 'Personaliosakond — 2. korrus, tuba 204'], ['Arvuti ei tööta.', 'IT-abi — helista 1234'],
        ['Pead panema riided kappi.', 'Riietusruum — ainult töötajatele'], ['Kell on 12 ja tahad süüa.', 'Söökla — lõuna 12–13'], ['Koosolek algab kohe.', 'Nõupidamisruum — lülita telefon välja'],
      ], 'full', 'g_read'),
      // reading 4: a ~150-word text
      B.reading('065_p_read', 'Lugemine 4. Praktika apteegis.', 'Loe teksti. Vasta lühidalt.', 'Sofia praktika',
        'Sofia õpib ülikoolis farmaatsiat. Eelmisel kuul oli tal praktika apteegis. Praktika kestis neli nädalat. Sofia pidi tulema tööle kell kaheksa. Kõigepealt pidi ta kontrollima, kas kõik ravimid on riiulis. Siis aitas ta kolleegil kliente teenindada. Ravimeid ise müüa ta veel ei saanud. Seda teevad ainult apteekrid. Sofia oskas hästi vene ja inglise keelt. Seepärast küsisid kolleegid tihti tema abi. Mõned kliendid olid haiged ja väsinud. Sofia pidi olema rahulik ja viisakas. Lõunapaus oli pool tundi. Neljapäeviti oli töötajate koosolek. Seal rääkis juhataja, mida järgmisel nädalal teha. Praktika lõpus sai Sofia hea hinde. Juhataja ütles: „Kui ülikool on läbi, tule meile tööle!” Sofia on väga õnnelik. Nüüd ta teab, et see on tema amet.',
        [['Kui kaua praktika kestis?', 'neli nädalat|4 nädalat'], ['Mis kell pidi Sofia tööle tulema?', 'kell kaheksa|kaheksa|8'], ['Millal oli töötajate koosolek?', 'neljapäeviti|neljapäeval']]),
      B.choice('065_p_readmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali igale küsimusele üks vastus.', [
        ['Mida Sofia kõigepealt tegi?', 'kontrollis ravimeid', 'müüs ravimeid', 'läks koosolekule'], ['Miks küsisid kolleegid Sofia abi?', 'ta oskas vene ja inglise keelt', 'ta oli juba apteeker', 'ta tuli tööle varem'],
        ['Kes müüvad apteegis ravimeid?', 'apteekrid', 'praktikandid', 'kliendid'], ['Milline pidi Sofia klientidega olema?', 'rahulik ja viisakas', 'kiire ja vali', 'väsinud ja haige'],
        ['Mida juhataja Sofiale pakkus?', 'tööd pärast kooli', 'uut praktikat', 'pikemat lõunat'],
      ]),
      // reading 5: a letter with 8 option gaps
      B.cloze('065_p_cloze', 'Lugemine 5. Kiri ülemusele.', 'Vali igasse lünka sobiv sõna.', 'Tere, Ülle!', [
        'Kahjuks ma {*olen|on|oled} täna haige ja ei {*saa|saan|saab} tööle tulla. Arst ütles, et ma pean kolm päeva kodus {*olema|olla|olen}.',
        '',
        'Arve on valmis. Palun {*saada|saatma|saadab} see kliendile. Homme on koosolek. Kas ma {*võin|pean|oskan} osaleda telefoni teel?',
        '',
        'Kui vaja, ma {*saan|pean|tahan} kodus arvutiga töötada. Ma {*helistan|helistasin|helistama} sulle lõuna ajal. Tööle {*tulen|tulin|tulema} ma tagasi esmaspäeval.',
        '',
        'Vabandust! Parimate soovidega, Olga',
      ]),
      // listening 1: instructions for the first day
      B.listening('065_p_listen', 'Kuulamine 1. Juhataja sõnum.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin on Helen Saar, hotelli juhataja.', 'Teie esimene tööpäev on esmaspäeval, kolmandal juunil.', 'Palun tulge kell seitse, mitte kell kaheksa.', 'Kõigepealt minge teisele korrusele personaliosakonda ja allkirjastage leping.',
        'Võtke kaasa ID-kaart ja pangakonto number.', 'Vormiriided saate meilt. Kingad peavad olema mustad.', 'Kui teil on küsimusi, helistage mulle.',
      ], ['Esimene tööpäev on [esmaspäeval|kolmandal juunil].', 'Tööle tuleb tulla kell [seitse|7].', 'Personaliosakond on [teisel] korrusel.', 'Seal tuleb allkirjastada [leping].', 'Kaasa tuleb võtta ID-kaart ja [pangakonto number].', 'Kingad peavad olema [mustad].']),
      // listening 2: a dialogue between two colleagues
      B.listening('065_p_listen2', 'Kuulamine 2. Kaks sõpra.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Anna! Kuidas uus töö on?', '— Tere, Jaan! Väga hea. Ma töötan nüüd raamatupidajana.', '— Kas sa pead ka laupäeval töötama?', '— Ei pea. Ma töötan esmaspäevast reedeni, kella üheksast viieni.',
        '— Ja reedel saad kodust töötada?', '— Jah. Aga homme on koosolek, siis pean kontoris olema.', '— Mis kell koosolek algab?', '— Kell kümme. Pärast koosolekut on meil koos lõuna.',
        '— Tore! Kas sul on suvel ka puhkus?', '— Jah, juulis on mul kaks nädalat puhkust.',
      ], ['Anna töötab [raamatupidajana].', 'Anna töötab kella üheksast [viieni].', 'Laupäeval ta [ei pea] töötama.', 'Koosolek algab kell [kümme|10].', 'Pärast koosolekut on [lõuna].', 'Puhkus on [juulis].']),
      B.gaps('065_p_mix', 'Keeleosa. Kirjuta õige vorm.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ta töötab [õpetajana] (õpetaja).', 'Pood on avatud kella üheksast [kuueni] (kuus).', 'Kas sa oskad arvutiga [töötada] (töötama)?', 'Palun [too] (tooma) mulle leping!', 'Me [peame] (pidama) reedel aruande saatma.', 'Ma tahan uut tööd [leida] (leidma).',
      ]),
      B.errorfix('065_p_fix', 'Keeleosa. Paranda viga.', 'Kirjuta laused õigesti.', [
        ['Ta töötab müüja poes.', 'Ta töötab poes müüjana.|Ta töötab müüjana poes.'], ['Ma pean töötada homme.', 'Ma pean homme töötama.|Ma pean töötama homme.'], ['Kas te oskate autot juhtima?', 'Kas te oskate autot juhtida?'],
        ['Palun saatma mulle arve!', 'Palun saada mulle arve!'], ['Me ei peame laupäeval tulema.', 'Me ei pea laupäeval tulema.'],
      ]),
      B.transformation('065_p_trans', 'Keeleosa. Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Ma tulen tööle kell kaheksa.', 'pean', 'Ma pean tööle tulema kell kaheksa.|Ma pean kell kaheksa tööle tulema.'], ['Ta on arst.', 'töötab', 'Ta töötab arstina.'],
        ['Sa pead lepingu allkirjastama.', 'juhis', 'Allkirjasta leping!|Palun allkirjasta leping!'], ['Ma töötan laupäeval.', 'ei pea', 'Ma ei pea laupäeval töötama.'], ['Me räägime soome keelt.', 'oskame', 'Me oskame soome keelt rääkida.'],
      ]),
      B.wordorder('065_p_order', 'Keeleosa. Pane lause kokku.', 'Kirjuta laused õigesti.', ['Tööle saab tulla juunist.', 'Kõigepealt minge personaliosakonda.', 'Kingad peavad olema mustad.', 'Reedel saan ma kodust töötada.', 'Juulis on mul kaks nädalat puhkust.']),
      B.speaking('065_p_say', 'Räägi kuuldust.', 'Räägi paarilisele Anna tööst.', ['Kellena Anna töötab?', 'Mis päevadel ja mis kellast?', 'Millal ta saab kodust töötada?', 'Millal on tema puhkus?'], [45, 90], ['Anna töötab…', 'Ta ei pea…', 'Juulis…']),
    ],
    transfer: [
      B.text('065_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'See osa on nagu Harno A2 eksami kirjutamise ja rääkimise osa. Kirjuta ilma sõnaraamatuta. Rääkimine on paaris, nagu eksamil.'),
      B.notice('065_t_card', 'Visiitkaart', ['Helen Saar — hotelli „Meri” juhataja', 'Aadress: Ranna puiestee 5, Pärnu', 'Tööaeg: esmaspäevast reedeni 9–17', 'Telefon: 5566 7788', 'E-post: helen@hotellmeri.ee'], 'full', 'g_read'),
      // writing 1: information transfer, at least 25 words
      B.letter('065_t_info', 'Kirjutamine 1. Anna sõbrale infot.', 'Sõber otsib tööd hotellis. Kirjuta visiitkaardi järgi: kellele, kuhu ja millal helistada.', 'Tere, Andrei!', 'Edu!', [25, 40]),
      B.planning('065_t_plan', 'Enne kirja.', 'Mõtle läbi ja kirjuta märksõnad.', ['Mis tööd sa tahad?', 'Mida sa oskad?', 'Millal sa saad töötada?', 'Mida sa küsid?']),
      // writing 2: a letter, at least 30 words
      B.letter('065_t_letter', 'Kirjutamine 2. Kandideerimiskiri.', 'Kirjuta hotellile: mida sa oskad, millal saad töötada, üks küsimus.', 'Tere, Helen Saar!', 'Lugupidamisega', [30, 50]),
      B.writing('065_t_text', 'Kirjutamine 2 (teine valik). Minu töö.', 'Kirjuta 4–6 lauset: kus ja kellena sa töötad, mida pead tegema.', [4, 6], ['töötan', 'pean', 'oskan'], 2),
      B.table('065_t_form', 'Tööankeet.', 'Täida hotelli tööankeet.', 'Andmed, Sinu vastus', ['Ees- ja perekonnanimi | ', 'Telefon ja e-post | ', 'Soovitud amet | ', 'Keeled, mida oskad | ', 'Millal saad alustada? | ', 'Mis päevadel saad töötada? | ']),
      // speaking: getting to know, picture description (task 1), idea card and role play (task 2)
      B.speaking('065_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele, nagu eksami alguses.', ['Mis su nimi on?', 'Kellena sa töötad või tahad töötada?', 'Mis kellast mis kellani sa töötad?', 'Mida sa oma töös hästi oskad?'], [45, 60]),
      B.speaking('065_t_mono', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab pildi: kontor, kohvik või ladu. Kirjelda üks minut.', ['Kus inimesed on?', 'Kellena nad töötavad?', 'Mida nad teevad?', 'Mida nad peavad veel tegema?'], [60, 90], ['Pildil on…', 'Ta töötab …-na.', 'Ta peab…']),
      B.rolecards('065_t_s1', 'Rääkimine 2. Ideekaart „Töö”.', 'A küsib kaardi märksõnade järgi, B vastab. Siis vahetage.',
        'Küsi paarilisel viis küsimust: amet, töökoht, tööaeg, kohustused, oskused.', 'Vasta igale küsimusele 2–3 lausega. Räägi oma või unistuste tööst.',
        ['Kellena sa töötad?', 'Mida sa pead tegema?', 'Mida sa oskad?'], ['Ma töötan…', 'Ma pean…', 'Ma oskan…']),
      B.rolecards('065_t_s2', 'Rääkimine 2. Rollimäng „Töövestlus”.', 'A on tööandja, B on kandidaat. Siis vahetage.',
        'Oled hotelli juhataja. Küsi keeli, oskusi ja millal saab alustada. Ütle kaks kohustust.', 'Oled kandidaat. Räägi oma oskustest. Küsi tööaja ja palga kohta.',
        ['Mis keeli te oskate?', 'Te peate…', 'Millal te saate alustada?'], ['Ma oskan…', 'Kas ma pean…?', 'Kui suur on palk?']),
      B.rubric('065_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Ülesanne on täidetud: kõik küsitud info on olemas.', 'Amet ja tööaeg on õigesti öeldud (töötan …-na, kella … -st … -ni).', 'pean + ma-vorm ja oskan + da-vorm on õiged.', 'Kirjutamine 1: vähemalt 25 sõna; kirjutamine 2: 30–50 sõna.', 'Rääkimine: küsisin ja vastasin lõpuni.']),
      B.selfcheck('065_t_self', ['Ma kirjutan visiitkaardi järgi sõbrale info.', 'Ma kirjutan lühikese kandideerimiskirja.', 'Ma kirjeldan töökoha pilti.', 'Ma räägin töövestlusel oma oskustest.'], 'Moodul 13 on tehtud'),
    ],
  },
};
