// A2 course (A1 → A2 roadmap), module 13 „Töö ja amet”, all five lessons a2-061…a2-065 (062 pean + ma /
// oskan, saan, tahan + da, 064 listening to work instructions, 065 the module check in the Harno A2 form). Jobs and the workplace (töötan kellena? -na, kus? -s, vastutan mille eest?), the work
// schedule and a simple job ad (vahetus, tööaeg, palk, kogemus, vajalik, kandideerimine; kellast kellani, E–R).
// Harno A2 formats: listening with 1–2-word answers (read twice), notices / ads, writing from a business card (≥ 25
// words) and a short letter (30–50 words), picture description and a role dialogue.
// Cast by docs/TEXTBOOK_ART_BIBLE.md §4 in the lessons added 2026-10-13 (Anna office, Markus warehouse, Liis teacher /
// official, Viktor pensioner, Sofia student, Jaan café owner; Oksana + Mia 6, Olga accountant, Kati, Igor as extras).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-13', course: 'a2', title: 'Töö ja amet', level: 'A2' };

export const LESSONS = {
  'a2-061': {
    title: 'Ametid ja töökoht',
    canDo: 'Ma kirjeldan oma või väljamõeldud tööd 6–8 lausega: amet, töökoht, tööaeg ja vähemalt kolm ülesannet.',
    discover: [
      B.text('061_d_situation', 'Uus kolleeg', 'Esmaspäeval tuleb Liisi kooli uus kolleeg. Tema nimi on Olga. Ta töötab raamatupidajana. Olga on pärit Narvast, aga elab nüüd Tallinnas. Liis näitab talle kooli ja tutvustab teisi kolleege.'),
      B.truefalse('061_d_tf', 'Mis toimub?', 'Loe olukorda. Kas lause on õige või vale?', [
        ['Olga on Liisi uus kolleeg.', true], ['Olga töötab müüjana.', false], ['Olga elab praegu Narvas.', false], ['Liis tutvustab Olgale kolleege.', true], ['Olga alustab tööd esmaspäeval.', true],
      ]),
      B.vocab('061_d_vocab', 'Töö sõnad', ['amet — профессия', 'töökoht — место работы', 'kolleeg — коллега', 'klient — клиент', 'ülemus — начальник', 'firma — фирма', 'kontor — офис', 'tööpäev — рабочий день', 'töötama (kellena?) — работать (кем?)', 'vastutama (mille eest?) — отвечать (за что?)', 'teenindama — обслуживать', 'ülesanne — задача'], '2'),
      B.reading('061_d_read', 'Loe: kolm inimest, kolm ametit.', 'Loe tekst ja vasta küsimustele.', 'Kus nad töötavad?',
        'Urmas on 52-aastane. Ta töötab bussijuhina juba kakskümmend aastat. Tema töökoht on buss number seitseteist. Urmas alustab tööd kell kuus hommikul. Ta vastutab reisijate ohutuse eest. Bussis kuulab ta tihti raadiot. Talle meeldib, et iga päev näeb ta palju inimesi.\nMerle töötab apteegis farmatseudina. Ta müüb ravimeid ja annab klientidele nõu. Tema tööpäev on kaheksa tundi pikk. Vahel töötab ta ka laupäeval. Merle kolleegid on noored ja sõbralikud. Merle ütleb, et tema töö on huvitav, aga väsitav.\nTaras on IT-spetsialist. Ta töötab suures firmas, aga kolm päeva nädalas teeb ta tööd kodus. Lõunat sööb ta kontori köögis koos kolleegidega. Ta parandab arvuteid ja aitab kolleege, kui programm ei tööta. Taras vastutab firma arvutivõrgu eest. Tema ülemus on Tarasega rahul, sest Taras on täpne ja kiire.',
        [['Kui kaua on Urmas bussijuhina töötanud?', 'kakskümmend aastat|20 aastat'], ['Mille eest vastutab Urmas?', 'reisijate ohutuse eest|reisijate ohutuse'], ['Mida teeb Merle tööl?', 'müüb ravimeid ja annab nõu|müüb ravimeid|annab klientidele nõu'], ['Kes töötab vahel nädalavahetusel?', 'Merle'], ['Kus töötab Taras kolm päeva nädalas?', 'kodus'], ['Miks on Tarase ülemus rahul?', 'Taras on täpne ja kiire|ta on täpne ja kiire|sest ta on täpne ja kiire']]),
      B.notice('061_d_notice', 'Märka: kellena? kus? mille eest?', ['Urmas **töötab bussijuhina**. (bussijuht → bussijuhi**na**)', 'Merle **töötab apteegis**. (kus? → -s)', 'Taras **on** IT-spetsialist. (kes ta on?)', 'Urmas **vastutab** reisijate ohutuse **eest**.', 'Merle **müüb** ravimeid ja **annab** nõu.'], 'full'),
      B.match('061_d_match', 'Kes kus töötab?', 'Ühenda amet ja töökoht.', [
        ['arst', 'haiglas'], ['õpetaja', 'koolis'], ['müüja', 'poes'], ['kokk', 'restoranis'], ['raamatupidaja', 'kontoris'], ['juuksur', 'juuksurisalongis'],
      ], 'full'),
      B.wordforms('061_d_forms', 'Kellena sa töötad?', 'Kirjuta sõna -na vormis.', [
        ['arst', 'kellena?', 'arstina'], ['müüja', 'kellena?', 'müüjana'], ['õpetaja', 'kellena?', 'õpetajana'], ['kokk', 'kellena?', 'kokana'],
        ['bussijuht', 'kellena?', 'bussijuhina'], ['koristaja', 'kellena?', 'koristajana'], ['ehitaja', 'kellena?', 'ehitajana'],
      ]),
      B.categorize('061_d_sort', 'Kes mida teeb?', 'Pane tegevused õige ameti juurde.', [
        ['Arst', ['ravib haigeid', 'kirjutab retsepti', 'kuulab patsienti']], ['Müüja', ['teenindab kliente', 'paneb kaupa riiulisse', 'töötab kassas']], ['Kokk', ['teeb süüa', 'ostab toiduaineid', 'koostab menüüd']],
      ], 'full'),
      B.gaps('061_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Minu [amet] on raamatupidaja.', 'Ma [töötan] suures firmas.', 'Minu [töökoht] on kesklinnas.', 'Ma [vastutan] firma raha eest.', 'Minu [kolleeg] Markus aitab mind alati.', 'Me teenindame iga päev palju [kliente].',
      ], ['amet', 'töötan', 'töökoht', 'vastutan', 'kolleeg', 'kliente', 'klient', 'töötama']),
      B.choice('061_d_choice', 'Kes see on?', 'Loe lauset. Vali õige amet.', [
        ['Ta lõikab juukseid.', 'juuksur', 'kokk', 'arst'], ['Ta õpetab lapsi koolis.', 'õpetaja', 'koristaja', 'müüja'], ['Ta ehitab maju.', 'ehitaja', 'õpetaja', 'kokk'],
        ['Ta juhib bussi.', 'bussijuht', 'ehitaja', 'arst'], ['Ta kontrollib firma raha.', 'raamatupidaja', 'juuksur', 'koristaja'], ['Ta koristab kontorit õhtuti.', 'koristaja', 'raamatupidaja', 'bussijuht'],
      ], 'full', 'g_vocab'),
      B.errorfix('061_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma töötan arst.', 'Ma töötan arstina.|Ma olen arst.'], ['Ma töötan koolisse.', 'Ma töötan koolis.'], ['Ma vastutan klientid eest.', 'Ma vastutan klientide eest.'],
        ['Minu ema töötab õpetaja koolis.', 'Minu ema töötab koolis õpetajana.|Minu ema töötab õpetajana koolis.'], ['Ma teenindan klientid.', 'Ma teenindan kliente.'],
      ]),
      B.wordorder('061_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Ma töötan suures firmas raamatupidajana.', 'Urmas alustab tööd kell kuus hommikul.', 'Liis annab klientidele nõu.', 'Taras vastutab arvutite eest.', 'Minu töökoht on kesklinnas.']),
      B.translation('061_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я работаю продавцом.', 'Моя сестра работает в больнице.', 'Он отвечает за клиентов.', 'Мой рабочий день длится восемь часов.', 'Кем ты работаешь?', 'Мои коллеги очень дружелюбные.']),
      B.dictation('061_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma töötan müüjana.', 'Minu töökoht on poes.', 'Ma teenindan iga päev kliente.', 'Minu kolleegid on toredad.', 'Ma vastutan kassa eest.', 'Tööpäev algab kell kaheksa.']),
      B.speaking('061_d_say', 'Minu töö.', 'Räägi paarilisele oma tööst 1 minut.', [
        'Kellena sa töötad?', 'Kus su töökoht on?', 'Mida sa tööl teed?', 'Mis sulle tööl meeldib?',
      ], [60, 120], ['Ma töötan …-na.', 'Ma töötan …-s.', 'Ma vastutan … eest.']),
      B.writing('061_d_write', 'Minu tööpäev.', 'Kirjuta 4–6 lauset oma tööst või unistuste tööst.', [4, 6], ['töötan', 'teen', 'kolleeg'], 2),
      B.selfcheck('061_d_self', ['Ma tean 12 ametit ja töökohta.', 'Ma ütlen: ma töötan arstina, ma töötan haiglas.', 'Ma ütlen, mille eest ma vastutan.', 'Ma räägin oma tööst 1 minuti.'], 'Ametid on selged'),
    ],
    practice: [
      B.crossword('061_p_cross', 'Mäletad?', 'Kirjuta sõna vihje järgi.', [
        ['Ta ravib haigeid.', 'arst'], ['Ta teeb restoranis süüa.', 'kokk'], ['Inimene, kellega koos töötad', 'kolleeg'], ['Inimene, kes ostab või kasutab teenust', 'klient'],
        ['Koht, kus sa töötad', 'töökoht'], ['Raha, mille saad töö eest', 'palk'],
      ]),
      B.choice('061_p_form', 'Vali õige vorm.', 'Vali lünka õige vorm.', [
        ['Ma töötan ___ koolis.', 'õpetajana', 'õpetaja', 'õpetajat'], ['Minu õde on ___.', 'arst', 'arstina', 'arsti'], ['Minu isa töötab ___.', 'haiglas', 'haiglasse', 'haiglast'],
        ['Ta vastutab ___ eest.', 'klientide', 'kliendid', 'kliente'], ['Me teenindame iga päev palju ___.', 'kliente', 'kliendid', 'klientide'], ['Ma sõidan tööle ___.', 'bussiga', 'bussis', 'bussi'],
      ], 'full', 'g_notice'),
      B.gaps('061_p_gaps', 'Kirjuta õiges vormis.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Minu vend töötab [kokana] (kokk) restoranis.', 'Anna töötab [raamatupidajana] (raamatupidaja).', 'Urmas töötab [bussijuhina] (bussijuht).', 'Merle töötab [apteegis] (apteek).',
        'Taras teeb kolm päeva nädalas tööd [kodus] (kodu).', 'Markus vastutab [projekti] (projekt) eest.', 'Olga sõidab tööle [trammiga] (tramm).',
      ]),
      B.transformation('061_p_trans', 'Ütle teisiti.', 'Kirjuta lause. Alusta antud sõnadega.', [
        ['Ma olen müüja.', 'Ma töötan …', 'Ma töötan müüjana.'], ['Minu töökoht on haigla. Ma olen õde.', 'Ma töötan …', 'Ma töötan haiglas õena.|Ma töötan õena haiglas.'],
        ['Urmas on bussijuht.', 'Urmas töötab …', 'Urmas töötab bussijuhina.'], ['Liisi töö on aidata kliente.', 'Liis aitab …', 'Liis aitab kliente.'],
        ['Taras peab hoolitsema arvutite eest.', 'Taras vastutab …', 'Taras vastutab arvutite eest.'], ['Olga on raamatupidaja suures firmas.', 'Olga töötab …', 'Olga töötab suures firmas raamatupidajana.|Olga töötab raamatupidajana suures firmas.'],
      ]),
      B.errorfix('061_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma töötan müüja poes.', 'Ma töötan poes müüjana.|Ma töötan müüjana poes.'], ['Mu vend töötab ehitajaks.', 'Mu vend töötab ehitajana.'], ['Ma vastutan kliendid eest.', 'Ma vastutan klientide eest.'],
        ['Minu amet on töötan kokk.', 'Minu amet on kokk.|Ma töötan kokana.'], ['Ta töötab haiglasse.', 'Ta töötab haiglas.'], ['Mina olen kolleeg Markusega.', 'Ma olen Markuse kolleeg.|Me oleme Markusega kolleegid.'],
      ]),
      B.match('061_p_match', 'Mida nad kasutavad?', 'Ühenda amet ja asi, mida ta tööl kasutab.', [
        ['arst', 'kraadiklaas'], ['kokk', 'pann'], ['juuksur', 'käärid'], ['raamatupidaja', 'arvuti ja tabelid'], ['ehitaja', 'haamer'], ['õpetaja', 'tahvel'],
      ], 'full', 'g_vocab'),
      // Harno A2 listening: an interview, read twice, answers of 1–2 words
      B.listening('061_p_listen', 'Kuula intervjuud.', 'Õpetaja loeb intervjuu kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere! Täna on meie saates Peeter Kask. Peeter, mis on teie amet?', '— Ma olen kokk. Ma töötan restoranis Tartu kesklinnas.', '— Kui kaua te seal töötate?',
        '— Juba kaheksa aastat. Enne töötasin hotellis.', '— Milline on teie tööpäev?', '— Ma alustan kell kümme. Kõigepealt ostan turult kala ja köögivilju.',
        '— Mille eest te vastutate?', '— Ma vastutan menüü eest. Köögis töötab veel neli kokka.', '— Mis teile töös meeldib?', '— Mulle meeldivad rahul kliendid. Aga õhtuti on restoranis palju inimesi ja töö on raske.',
      ], ['Peeter töötab [kokana|kokk].', 'Restoran on [Tartus|Tartu kesklinnas].', 'Restoranis töötab Peeter [kaheksa|8] aastat.', 'Enne töötas ta [hotellis].', 'Tööpäev algab kell [kümme|10].', 'Peeter vastutab [menüü] eest.', 'Õhtuti on restoranis palju [inimesi|kliente].']),
      B.table('061_p_table', 'Kus ja kellena?', 'Kirjuta töökoht ja -na vorm.', 'Amet, Kus ta töötab?, Kellena ta töötab?', [
        'arst | [haiglas/kliinikus] | [arstina]', 'õpetaja | [koolis] | [õpetajana]', 'müüja | [poes/kaupluses] | [müüjana]', 'kokk | [restoranis/köögis] | [kokana]', 'juuksur | [juuksurisalongis/salongis] | [juuksurina]',
      ], 'g_notice'),
      B.wordorder('061_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Minu õde töötab haiglas arstina.', 'Peeter vastutab restoranis menüü eest.', 'Ma sõidan tööle iga päev bussiga.', 'Kas sa töötad kontoris või kodus?', 'Minu kolleegid on väga sõbralikud.']),
      B.translation('061_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Мой брат работает поваром.', 'Она работает в аптеке.', 'Я отвечаю за меню.', 'Где ты работаешь?', 'Мой начальник доволен.', 'Я езжу на работу на трамвае.']),
      B.dictation('061_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Peeter töötab kokana.', 'Tema töökoht on restoranis.', 'Ta vastutab menüü eest.', 'Õhtuti on palju kliente.', 'Mulle meeldib minu töö.']),
      B.speaking('061_p_guess', 'Arva ära amet.', 'Kirjelda ametit 3–4 lausega. Paariline arvab, mis amet see on.', [
        'Kus see inimene töötab?', 'Mida ta teeb?', 'Mille eest ta vastutab?', 'Mida ta tööl kasutab?',
      ], [45, 90], ['Ta töötab …-s.', 'Ta vastutab … eest.', 'Ta kasutab…']),
      B.writing('061_p_write', 'Pereliikme töö.', 'Kirjuta 5–7 lauset: kus ja kellena töötab sinu pereliige.', [5, 7], ['töötab', 'vastutab', 'kolleegid'], 2),
      B.selfcheck('061_p_self', ['Ma kirjutan -na vormi: kokana, müüjana.', 'Ma eristan: ta on kokk, ta töötab kokana.', 'Ma ütlen, mille eest keegi vastutab.', 'Ma saan intervjuust aru.'], 'Töösõnad on minu omad'),
    ],
    transfer: [
      B.text('061_t_situation', 'Uus olukord', 'Sa alustad uuel keelekursusel. Esimeses tunnis tutvustavad kõik oma tööd. Pärast tundi täidad kursuse ankeedi ja kirjutad kolleegist visiitkaardi järgi.'),
      B.reading('061_t_read', 'Loe: töövarjupäev.', 'Loe tekst ja vasta küsimustele.', 'Oskari töövarjupäev',
        'Kolmapäeval oli Liisi pojal Oskaril töövarjupäev. Oskar on viieteistkümneaastane. Ta käis terve päeva koos ema sõbranna Kajaga tööl. Kaja töötab loomaarstina väikeses kliinikus. Tööpäev algas kell kaheksa. Kõigepealt vaatasid nad koos koera, kellel oli valus jalg. Siis tuli kliinikusse vanaproua oma kassiga. Kaja rääkis klientidega rahulikult ja selgelt. Lõuna ajal sõid kolleegid koos ja rääkisid naljajutte. Pärastlõunal aitas Oskar administraatorit. Ta vastas telefonile ja kirjutas kliente arvutisse. Õhtul oli Oskar väsinud, aga õnnelik. Kodus ütles ta emale, et tahab ka loomaarstiks saada. Liis oli üllatunud, sest varem tahtis Oskar olla kokk.',
        [['Kellena Kaja töötab?', 'loomaarstina|ta on loomaarst|loomaarst'], ['Mis oli koeral viga?', 'tal oli valus jalg|valus jalg|jalg valutas'], ['Mida tegi Oskar pärastlõunal?', 'aitas administraatorit|vastas telefonile|kirjutas kliente arvutisse'], ['Milline oli Oskar õhtul?', 'väsinud, aga õnnelik|väsinud ja õnnelik|õnnelik'], ['Miks oli Liis üllatunud?', 'varem tahtis Oskar olla kokk|Oskar tahtis enne olla kokk|sest ta tahtis olla kokk']]),
      // Harno A2 writing 1: information transfer from a business card, at least 25 words
      B.tip('061_t_card', 'Visiitkaart', ['**Olga Ivanova**', 'raamatupidaja', 'firma Arvepidaja, Pärnu maantee 22, Tallinn', 'tööaeg: E–R 9.00–17.00', 'telefon: 5566 7788'], 'full'),
      B.writing('061_t_cardwrite', 'Kirjuta Olgast.', 'Kirjuta visiitkaardi järgi 4–5 lauset: kes, kus, millal, kuidas ühendust võtta.', [4, 5], ['töötab', 'raamatupidajana', 'helistada'], 2),
      B.transformation('061_t_trans', 'Märkmetest lauseks.', 'Kirjuta kursusekaaslase märkmetest täislause.', [
        ['Amet: kokk', 'Ta töötab …', 'Ta töötab kokana.'], ['Töökoht: hotell', 'Ta töötab …', 'Ta töötab hotellis.'],
        ['Tööaeg: 8–16', 'Tema tööpäev kestab …', 'Tema tööpäev kestab kella kaheksast neljani.|Tema tööpäev kestab kaheksast neljani.'],
        ['Ülesanne: menüü', 'Ta vastutab …', 'Ta vastutab menüü eest.'], ['Kolleegid: 5', 'Tal on …', 'Tal on viis kolleegi.'],
      ]),
      B.choice('061_t_react', 'Mida sa vastad?', 'Loe küsimust. Vali sobiv vastus.', [
        ['Kursusekaaslane küsib: „Mis tööd sa teed?”', 'Ma töötan õpetajana.', 'Ma töötan õpetaja.', 'Ma töötan õpetajat.'],
        ['Kursusekaaslane küsib: „Kus sa töötad?”', 'Ühes väikeses firmas.', 'Ühte väikesesse firmasse.', 'Ühest väikesest firmast.'],
        ['Klient küsib: „Kas te saate mind aidata?”', 'Jah, muidugi. Mida te vajate?', 'Ei, see ei ole minu firma.', 'Jah, minu palk on hea.'],
        ['Uus kolleeg ütleb: „Tere, mina olen Olga.”', 'Tere tulemast! Mina olen Liis.', 'Head aega, Olga!', 'Palju õnne, Olga!'],
        ['Sõber küsib: „Kas sulle meeldib su töö?”', 'Jah, sest mu kolleegid on toredad.', 'Jah, sest ma töötan kolleegid.', 'Ei, sest ma olen töö.'],
      ], 'full', 'g_use'),
      B.errorfix('061_t_fix', 'Kontrolli ankeeti.', 'Paranda ankeedi vead.', [
        ['Ma töötan juuksur.', 'Ma töötan juuksurina.|Ma olen juuksur.'], ['Minu töökoht on salongis Kesklinna.', 'Minu töökoht on salongis kesklinnas.|Minu töökoht on kesklinnas salongis.'],
        ['Ma vastutan kliendid ja kassa eest.', 'Ma vastutan klientide ja kassa eest.'], ['Ma sõidan tööle trammis.', 'Ma sõidan tööle trammiga.'], ['Minu kolleegid on sõbralik.', 'Minu kolleegid on sõbralikud.'],
      ]),
      B.wordorder('061_t_order', 'Pane küsimus kokku.', 'Kirjuta küsimus õiges järjekorras.', ['Kellena sa praegu töötad?', 'Kus sinu töökoht asub?', 'Mille eest sa tööl vastutad?', 'Mis kell sinu tööpäev algab?', 'Kas sulle meeldib sinu töö?']),
      B.planning('061_t_plan', 'Minu tutvustus.', 'Mõtle oma tööle. Kirjuta märksõnad.', ['Amet', 'Töökoht', 'Tööaeg', 'Kolm ülesannet', 'Mis meeldib?']),
      B.speaking('061_t_intro', 'Tutvusta ennast kursusel.', 'Räägi grupile oma tööst 1–1,5 minutit.', [
        'Kellena sa töötad?', 'Kus su töökoht on?', 'Mida sa tööpäeval teed?', 'Mille eest sa vastutad?', 'Kuidas sa tööle sõidad?',
      ], [60, 90], ['Ma töötan …-na.', 'Minu töökoht on…', 'Ma vastutan … eest.']),
      B.rolecards('061_t_roles', 'Kohvipausil.', 'Kaks kursuslast räägivad tööst. Küsige ja vastake.',
        'Oled müüja suures poes. Räägi oma tööst. Küsi teise inimese töö kohta 3 küsimust.', 'Oled kokk. Räägi oma tööst. Küsi teise inimese töö kohta 3 küsimust.',
        ['Ma töötan müüjana…', 'Mis tööd sa teed?', 'Kas sulle meeldib su töö?'], ['Ma olen kokk.', 'Ma vastutan … eest.', 'Kui kaua sa seal töötad?']),
      // Harno A2 speaking 1: describe a picture
      B.speaking('061_t_pic', 'Kirjelda pilti.', 'Õpetaja näitab pilti töökohast. Kirjelda pilti 1 minut.', [
        'Kus need inimesed on?', 'Kellena nad töötavad?', 'Mida nad teevad?', 'Kas sa tahaksid seal töötada? Miks?',
      ], [45, 90], ['Pildil on…', 'Ta töötab …-na.', 'Ta teeb…']),
      B.writing('061_t_write', 'Kursuse ankeet: minu töö.', 'Kirjuta ankeeti 6–8 lauset oma tööst.', [6, 8], ['töötan', 'vastutan', 'kolleegid', 'klient'], 2),
      B.selfcheck('061_t_self', ['Ma oskan nimetada 12 ametit ja töökohta.', 'Ma oskan leida tekstist, kes kus ja kellena töötab.', 'Ma oskan öelda: töötan …-na, töötan …-s, vastutan … eest.', 'Ma oskan oma tööd tutvustada suuliselt ja kirjalikult 6–8 lausega.'], 'Tutvustan oma tööd'),
    ],
  },

  'a2-062': {
    title: 'Pean tegema, oskan teha',
    canDo: 'Ma räägin oma tööst ja oskustest mustritega pean + ma-vorm, ei pea + ma-vorm ning oskan / saan / tahan + da-vorm ja valin vähemalt 8 vormi 10-st õigesti.',
    discover: [
      B.text('062_d_situation', 'Uus töökoht', 'Anna töötab nüüd uues firmas Tallinnas. Esimesel päeval räägib juhataja Margit talle, mida ta peab tegema. Anna oskab hästi arvutiga töötada. Aga eesti keeles suhelda on tal veel raske.'),
      B.vocab('062_d_vocab', 'Töö ja oskused', ['pidama (pean) — быть должным', 'ei pea — не нужно', 'oskama (oskan) — уметь', 'saama (saan) — мочь', 'tahtma (tahan) — хотеть', 'kohustus — обязанность', 'nõue — требование', 'juhtima — водить, руководить', 'arvuti — компьютер', 'koristama — убирать', 'suhtlema — общаться', 'aitama — помогать'], '2'),
      B.reading('062_d_read', 'Loe: Anna esimene päev.', 'Loe teksti ja vasta küsimustele.', 'Mida Anna peab tegema?',
        'Anna on firmas uus raamatupidaja. Esimesel päeval rääkis juhataja Margit talle tööst. Iga hommik peab Anna kontrollima arveid. Arved peab ta klientidele saatma kella kolmeni. Reedeti peab ta tegema nädala aruande. Anna oskab hästi arvutiga töötada. Ta oskab ka inglise ja vene keelt. Eesti keeles suhelda on tal veel raske, aga ta tahab õppida. Kliente ei pea ta ise vastu võtma. Seda teeb sekretär Pille. Kontorit ei pea ta ka koristama, sest firmas on koristaja. Lõunal võib Anna minna kohvikusse või süüa köögis. Üks päev nädalas saab ta kodust töötada. Anna küsis: „Kas ma pean ka laupäeval tööl olema?” Margit naeris: „Ei pea! Laupäeval ja pühapäeval sa puhkad.”',
        [['Mida peab Anna iga hommik tegema?', 'kontrollima arveid|ta kontrollib arveid'], ['Kuni mis kellani peab ta arved saatma?', 'kella kolmeni|kolmeni'], ['Mis keeli Anna oskab?', 'inglise ja vene keelt|inglise ja vene'], ['Kes võtab kliente vastu?', 'Pille|sekretär Pille|sekretär'], ['Miks ei pea Anna kontorit koristama?', 'firmas on koristaja|sest firmas on koristaja'], ['Mitu päeva nädalas saab ta kodust töötada?', 'üks päev|ühe päeva|1']]),
      B.notice('062_d_notice', 'Märka: pean + ma, oskan + da', ['Ma **pean** arveid **kontrollima**. (pidama + ma-vorm)', 'Ma **ei pea** laupäeval **töötama**.', 'Ma **oskan** arvutiga **töötada**. (oskama + da-vorm)', 'Ma **saan** kodust **töötada**. Ma **tahan** eesti keelt **õppida**.', 'ma **pean**, sa **pead**, ta **peab**, me **peame**, te **peate**, nad **peavad**'], 'full'),
      B.profiles('062_d_cards', 'Kes mida oskab?', 'Loe kaarte. Kirjuta lünka sobiv vorm.', [
        ['Jaan', ['kohviku omanik', 'oskab head kohvi teha', 'peab alustama kell 6', 'ei pea pühapäeval töötama'], ['Jaan oskab head kohvi [teha].', 'Ta peab hommikul kell kuus [alustama].', 'Pühapäeval ei [pea] ta töötama.']],
        ['Liis', ['õpetaja', 'oskab lastega suhelda', 'peab kodutöid kontrollima', 'tahab saada direktoriks'], ['Liis [oskab] lastega suhelda.', 'Ta peab kodutöid [kontrollima].', 'Ta tahab direktoriks [saada].']],
        ['Markus', ['laotöötaja', 'oskab autot juhtida', 'peab kolleege aitama', 'saab laupäeval puhata'], ['Markus oskab autot [juhtida].', 'Ta peab kolleege [aitama].', 'Ta [saab] laupäeval puhata.']],
      ]),
      B.wordforms('062_d_forms', 'ma-vorm → da-vorm', 'Kirjuta tegusõna da-vormis.', [
        ['kontrollima', 'ma oskan …', 'kontrollida'], ['juhtima', 'ma oskan …', 'juhtida'], ['suhtlema', 'ma tahan …', 'suhelda'], ['aitama', 'ma saan …', 'aidata'],
        ['koristama', 'ma tahan …', 'koristada'], ['õppima', 'ma tahan …', 'õppida'], ['tegema', 'ma oskan …', 'teha'],
      ]),
      B.gaps('062_d_gaps', 'pean või oskan?', 'Vali sõnapangast sobiv sõna. Kaks sõna jääb üle.', [
        'Bussijuht [peab] hommikul vara tõusma.', 'Ma [oskan] hästi süüa teha.', 'Kas sa [saad] homme kauem jääda?', 'Me [ei pea] täna kontorisse minema.', 'Sofia [tahab] eesti keelt paremini õppida.', 'Kas te [oskate] autot juhtida?',
      ], ['peab', 'oskan', 'saad', 'ei pea', 'tahab', 'oskate', 'pead', 'peate']),
      B.transformation('062_d_trans', 'Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Ma töötan arvutiga.', 'oskan', 'Ma oskan arvutiga töötada.'], ['Ta koristab kontorit.', 'peab', 'Ta peab kontorit koristama.'], ['Me õpime eesti keelt.', 'tahame', 'Me tahame eesti keelt õppida.|Me tahame õppida eesti keelt.'],
        ['Ma tulen homme tööle.', 'ei pea', 'Ma ei pea homme tööle tulema.'], ['Sa aitad mind.', 'Kas sa saad …?', 'Kas sa saad mind aidata?'], ['Nad juhivad autot.', 'oskavad', 'Nad oskavad autot juhtida.'],
      ]),
      B.manymatch('062_d_match', 'Amet ja kohustus.', 'Ühenda amet ja see, mida inimene peab tegema.', ['Bussijuht', 'Kokk', 'Õpetaja', 'Koristaja', 'Apteeker', 'Raamatupidaja'], ['peab bussi juhtima.', 'peab süüa tegema.', 'peab tunde andma.', 'peab ruume koristama.', 'peab ravimeid müüma.', 'peab arveid kontrollima.'], 'full', 'g_vocab'),
      B.errorfix('062_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma pean töötada laupäeval.', 'Ma pean laupäeval töötama.|Ma pean töötama laupäeval.'], ['Ta oskab autot juhtima.', 'Ta oskab autot juhtida.'], ['Me tahame õppima eesti keelt.', 'Me tahame eesti keelt õppida.|Me tahame õppida eesti keelt.'],
        ['Sa ei pead homme tulema.', 'Sa ei pea homme tulema.'], ['Kas sa saad mind aitama?', 'Kas sa saad mind aidata?'],
      ]),
      B.translation('062_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я должна проверять счета.', 'Я умею водить машину.', 'Завтра мне не нужно работать.', 'Я хочу учить эстонский язык.', 'Ты можешь мне помочь?']),
      B.dictation('062_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma pean arveid kontrollima.', 'Ma oskan arvutiga töötada.', 'Laupäeval ei pea ma töötama.', 'Ta saab kodust töötada.', 'Me tahame eesti keelt õppida.']),
      B.speaking('062_d_say', 'Pean ja oskan.', 'Räägi paarilisele oma tööst või õpingutest.', ['Mida sa pead tööl iga päev tegema?', 'Mida sa ei pea tegema?', 'Mida sa hästi oskad?', 'Mida sa tahad veel õppida?'], [60, 90], ['Ma pean …-ma.', 'Ma oskan …-da.', 'Ma tahan …-da.']),
      B.writing('062_d_write', 'Minu kohustused ja oskused.', 'Kirjuta 6–8 lauset: mida sa pead tegema ja mida oskad.', [6, 8], ['pean', 'oskan', 'tahan', 'ei pea'], 3),
      B.selfcheck('062_d_self', ['Ma tean: pean + ma-vorm, oskan / saan / tahan + da-vorm.', 'Ma teen da-vormi: kontrollida, suhelda, aidata, teha.', 'Ma leian tekstist, mida inimene peab tegema.', 'Ma räägin oma kohustustest ja oskustest.'], 'Pean ja oskan'),
    ],
    practice: [
      B.reading('062_p_ads', 'Loe kahte kuulutust.', 'Loe kuulutusi ja vasta küsimustele.', 'Otsime töötajat', [
        'A. Kohvik „Mesi” otsib kokka. Sa pead oskama suppi ja salateid teha. Sa pead töötama ka nädalavahetusel. Eesti keelt pead oskama hästi, sest sa suhtled klientidega. Juhiluba ei pea olema. Tööaeg on kella kaheksast neljani. Palk on 1400 eurot kuus.',
        'B. Firma „Puhas Kodu” otsib koristajat. Sa pead oskama iseseisvalt töötada. Sa pead autot juhtima, sest töö on eri linnaosades. Nädalavahetusel ei pea töötama. Eesti keelt ei pea hästi oskama. Tööd saad alustada kohe. Palk on 11 eurot tunnis. Helista!',
      ], [['Keda otsib kohvik?', 'kokka'], ['Mida peab kokk oskama teha?', 'suppi ja salateid'], ['Miks peab kokk hästi eesti keelt oskama?', 'ta suhtleb klientidega|sest ta suhtleb klientidega'], ['Miks peab koristaja autot juhtima?', 'töö on eri linnaosades|sest töö on eri linnaosades'], ['Kas koristaja peab nädalavahetusel töötama?', 'ei|ei pea'], ['Kumb töö sobib inimesele, kellel pole juhiluba?', 'kokk|kohviku töö|A']]),
      B.table('062_p_compare', 'Võrdle nõudeid.', 'Kirjuta: peab või ei pea.', 'Nõue, Kokk, Koristaja', [
        'nädalavahetusel töötama | [peab] | [ei pea]', 'autot juhtima | [ei pea] | [peab]', 'hästi eesti keelt oskama | [peab] | [ei pea]',
      ], 'g_read'),
      B.categorize('062_p_sort', 'Kohustus, oskus või soov?', 'Pane väljendid õigesse rühma.', [
        ['Kohustus: pean…', ['arveid kontrollima', 'kell kaheksa alustama', 'vormiriietust kandma']], ['Oskus: oskan…', ['autot juhtida', 'vene keelt rääkida', 'arvutiga töötada']], ['Soov: tahan…', ['rohkem puhata', 'juhatajaks saada', 'kodust töötada']],
      ], 'full', 'g_vocab'),
      B.wordforms('062_p_forms', 'pidama', 'Kirjuta pidama õiges vormis.', [['ma', 'pidama', 'pean'], ['sa', 'pidama', 'pead'], ['ta', 'pidama', 'peab'], ['me', 'pidama', 'peame'], ['te', 'pidama', 'peate'], ['nad', 'pidama', 'peavad'], ['ma (eitus)', 'pidama', 'ei pea']]),
      B.choice('062_p_choice', 'Vali õige vorm.', 'Vali lausesse sobiv tegusõna vorm.', [
        ['Ma pean homme vara ___.', 'tõusma', 'tõusta', 'tõusen'], ['Kas sa oskad ___?', 'ujuda', 'ujuma', 'ujud'], ['Me ei ___ täna tulema.', 'pea', 'peame', 'pead'],
        ['Ta tahab uut tööd ___.', 'leida', 'leidma', 'leiab'], ['Kas ma saan kodust ___?', 'töötada', 'töötama', 'töötan'], ['Nad peavad arveid ___.', 'kontrollima', 'kontrollida', 'kontrollivad'],
      ], 'full', 'g_notice'),
      B.errorfix('062_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma pean minna arsti juurde.', 'Ma pean minema arsti juurde.|Ma pean arsti juurde minema.'], ['Ta oskab hästi laulma.', 'Ta oskab hästi laulda.'], ['Kas sa tahad kinno tulema?', 'Kas sa tahad kinno tulla?|Kas sa tahad tulla kinno?'],
        ['Me ei peame laupäeval töötama.', 'Me ei pea laupäeval töötama.'], ['Ma saan sind homme aitama.', 'Ma saan sind homme aidata.'], ['Nad peab kell kaheksa alustama.', 'Nad peavad kell kaheksa alustama.'],
      ]),
      B.listening('062_p_listen', 'Kuulamine. Uus töötaja.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Pille, firma sekretär.', 'Ma räägin teile, mida te peate esimesel nädalal tegema.', 'Tööpäev algab kell üheksa. Te peate tulema kümme minutit varem.',
        'Esmaspäeval peate täitma lepingu ja andma mulle oma pangakonto numbri.', 'Arvutiga oskate te kindlasti töötada, aga programm on uus. Siim aitab teid.',
        'Lõunal ei pea te kontoris olema. Lõuna on kella kaheteistkümnest üheni.', 'Reedel saate töötada kodust.',
      ], ['Tööpäev algab kell [üheksa|9].', 'Tööle peab tulema [kümme|10] minutit varem.', 'Esmaspäeval peab täitma [lepingu].', 'Uue programmiga aitab [Siim].', 'Lõuna algab kell [kaksteist|12].', 'Kodust saab töötada [reedel].']),
      B.dialogue('062_p_dialog', 'Töövestlus kohvikus.', 'Täida dialoog sobivate sõnadega.', 'Juhataja', 'Eva', [
        ['A', 'Tere, Eva! Mis keeli te [oskate]?'], ['B', 'Ma oskan eesti, vene ja inglise keelt.'], ['A', 'Väga hea. Kas te oskate suppi [teha]?'], ['B', 'Jah, see on minu lemmiktöö!'],
        ['A', 'Te [peate] töötama ka laupäeval. Kas see sobib?'], ['B', 'Jah. Aga kas ma [pean] töötama ka pühapäeval?'], ['A', 'Ei, pühapäeval te ei [pea] töötama.'], ['B', 'Väga hea. Millal ma [saan] alustada?'],
      ]),
      B.translation('062_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Ты должен прийти в девять.', 'Я не умею плавать.', 'Мы хотим найти новую работу.', 'Вам не нужно работать в воскресенье.', 'Можно мне работать из дома?', 'Они должны убрать офис.']),
      B.speaking('062_p_say', 'Kes mida oskab?', 'Küsi paariliselt ja vasta. Kasuta oskan, pean, tahan.', ['Kas sa oskad autot juhtida?', 'Kas sa oskad süüa teha?', 'Mida sa pead kodus iga päev tegema?', 'Mida sa tahad õppida?'], [45, 90]),
      B.rolecards('062_p_roles', 'Töövestlus.', 'Üks on tööandja, teine kandidaat. Siis vahetage.',
        'Oled tööandja. Küsi, mida kandidaat oskab. Ütle kaks kohustust.', 'Oled kandidaat. Räägi, mida sa oskad ja tahad teha. Küsi tööaja kohta.',
        ['Mida te oskate teha?', 'Te peate…', 'Kas te saate…?'], ['Ma oskan…', 'Ma tahan…', 'Kas ma pean…?']),
      B.letter('062_p_letter', 'Kiri kohvikule.', 'Kirjuta kohvikule: mida sa oskad ja millal saad töötada.', 'Tere!', 'Lugupidamisega', [30, 50]),
      B.selfcheck('062_p_self', ['Ma pööran pidama: pean, pead, peab…', 'Ma valin ma- või da-vormi õigesti.', 'Ma võrdlen kahe töö nõudeid.', 'Ma räägin töövestlusel oma oskustest.'], 'Vormid on paigas'),
    ],
    transfer: [
      B.text('062_t_situation', 'Uus olukord', 'Sinu firmasse tuleb kaheks nädalaks praktikant Rasmus. Ülemus palub: „Kirjuta Rasmusele lühike juhend. Mida ta peab tegema? Mida ta ei pea tegema?” Esimesel päeval näitad sa talle kontorit.'),
      B.notice('062_t_list', 'Ülemuse märkmed', ['Tööaeg: 9–17, lõuna 12–13', 'Peab: vastama telefonile, saatma kirju, tooma posti', 'Ei pea: koosolekutel käima, laupäeviti töötama', 'Saab: kasutada kohvimasinat, parkida maja taga', 'Abi: arvuti — Kati, palk — Anna'], 'full', 'g_read'),
      B.listening('062_t_listen', 'Kuula Rasmuse häälsõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin Rasmus, uus praktikant.', 'Mul on homseks paar küsimust.', 'Kas ma pean tulema kell üheksa või kell kaheksa?', 'Ma oskan Exceliga töötada, aga ma ei oska raamatupidamisprogrammi.',
        'Kas ma saan autoga tulla? Kas maja juures on parkla?', 'Ma tahan võtta kaasa oma sülearvuti. Kas see on võimalik?', 'Palun helista mulle täna kella kuueni. Aitäh!',
      ], ['Rasmus on uus [praktikant].', 'Ta ei tea, kas tulla kell üheksa või [kaheksa|8].', 'Rasmus oskab töötada [Exceliga].', 'Ta ei oska [raamatupidamisprogrammi].', 'Rasmus tahab tulla [autoga].', 'Helistada tuleb kella [kuueni|6ni|18ni].']),
      B.table('062_t_table', 'Rasmuse juhend.', 'Kirjuta märkmete järgi: peab, ei pea või saab.', 'Tegevus, Rasmus', [
        'telefonile vastama | [peab]', 'koosolekutel käima | [ei pea]', 'kohvimasinat kasutama | [saab]', 'laupäeviti töötama | [ei pea]', 'posti tooma | [peab]', 'maja taga parkima | [saab]',
      ], 'g_read'),
      B.gaps('062_t_gaps', 'Juhendi laused.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Sa [pead] (pidama) kell üheksa tööl olema.', 'Sa saad kohvimasinat [kasutada] (kasutama).', 'Kui arvuti ei tööta, võid Katilt abi [küsida] (küsima).', 'Sa ei [pea] (pidama) koosolekutel käima.',
        'Kas sa oskad Exceliga [töötada] (töötama)?', 'Me [peame] (pidama) kõik kirjad kiiresti saatma.',
      ]),
      B.transformation('062_t_formal', 'Sina → teie.', 'Kirjuta lause viisakalt (teie).', [
        ['Sa pead kell üheksa tulema.', 'Te …', 'Te peate kell üheksa tulema.'], ['Sa ei pea laupäeval töötama.', 'Te …', 'Te ei pea laupäeval töötama.'], ['Kas sa oskad Exceliga töötada?', 'Kas te …?', 'Kas te oskate Exceliga töötada?'],
        ['Sa saad maja taga parkida.', 'Te …', 'Te saate maja taga parkida.'], ['Kas sa tahad kohvi juua?', 'Kas te …?', 'Kas te tahate kohvi juua?'],
      ]),
      B.errorfix('062_t_fix', 'Kontrolli juhendit.', 'Kolleeg kirjutas juhendi. Paranda vead.', [
        ['Sa pead tulla kell üheksa.', 'Sa pead tulema kell üheksa.|Sa pead kell üheksa tulema.'], ['Sa saad köögis kohvi tegema.', 'Sa saad köögis kohvi teha.'], ['Sa ei pead koosolekul käima.', 'Sa ei pea koosolekul käima.'],
        ['Kati saab sind aitama.', 'Kati saab sind aidata.'], ['Me peab kõik kirjad saatma.', 'Me peame kõik kirjad saatma.'],
      ]),
      B.translation('062_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Ты должна прийти в девять.', 'Тебе не нужно ходить на совещания.', 'Ты можешь парковаться за домом.', 'Кати может тебе помочь.', 'Ты умеешь работать с компьютером?']),
      B.planning('062_t_plan', 'Enne juhendit.', 'Kirjuta märksõnad.', ['Mis kell tööpäev algab ja lõpeb?', 'Mida Rasmus peab tegema?', 'Mida ta ei pea tegema?', 'Mida ta saab teha? Kes aitab?']),
      B.letter('062_t_letter', 'Juhend praktikandile.', 'Kirjuta Rasmusele juhend 40–60 sõnaga. Kasuta pead, ei pea, saad.', 'Tere, Rasmus!', 'Edu esimesel päeval!', [40, 60]),
      B.writing('062_t_reply', 'Vasta Rasmusele.', 'Kirjuta Rasmusele sõnum 4–6 lausega: vasta tema küsimustele.', [4, 6], ['pead', 'saad', 'ei pea'], 2),
      B.speaking('062_t_tour', 'Esimene päev.', 'Näita Rasmusele kontorit ja selgita tööd. Räägi umbes minut.', ['Mis kell tööpäev algab?', 'Mida Rasmus peab tegema?', 'Kes teda aitab?', 'Mida ta saab köögis teha?'], [60, 90]),
      B.rolecards('062_t_roles', 'Rasmus küsib.', 'A on Rasmus, B on kolleeg. Siis vahetage.',
        'Oled praktikant Rasmus. Küsi vähemalt neli küsimust: Kas ma pean…? Kas ma saan…?', 'Oled kolleeg. Vasta Rasmuse küsimustele märkmete järgi.',
        ['Kas ma pean…?', 'Kas ma saan…?', 'Kes mind aitab?'], ['Jah, sa pead…', 'Ei, sa ei pea…', 'Sa saad…']),
      B.rubric('062_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Juhendis on tööaeg, kohustused ja abi.', 'pean + ma-vorm ja oskan / saan + da-vorm on õiged.', 'Vastus Rasmusele vastab kõigile tema küsimustele.', 'Suuline selgitus on selge ja viisakas.']),
      B.selfcheck('062_t_self', ['Ma saan aru, mida uus kolleeg küsib.', 'Ma kirjutan juhendi: pead, ei pea, saad.', 'Ma selgitan tööd suuliselt.', 'Ma vastan küsimustele teie- ja sina-vormis.'], 'Juhend on valmis'),
    ],
  },

  'a2-063': {
    title: 'Töögraafik ja lihtne töökuulutus',
    canDo: 'Ma leian töökuulutusest ja töögraafikust vähemalt viis olulist fakti: amet, tööaeg, palk, nõuded ja kandideerimise viis.',
    discover: [
      B.text('063_d_situation', 'Andrei otsib tööd', 'Andrei otsib uut tööd. Ta tahab töötada ainult päeval, sest õhtuti õpib ta eesti keelt. Internetis näeb ta kahte kuulutust. Mõlemas on palk ja tööaeg kirjas.'),
      B.truefalse('063_d_tf', 'Mis toimub?', 'Loe olukorda. Kas lause on õige või vale?', [
        ['Andrei otsib uut tööd.', true], ['Andrei tahab töötada öösel.', false], ['Õhtuti õpib Andrei eesti keelt.', true], ['Andrei leiab kuulutused ajalehest.', false], ['Kuulutustes on kirjas palk.', true],
      ]),
      B.vocab('063_d_vocab', 'Kuulutuse sõnad', ['töökuulutus — объявление о работе', 'vahetus — смена', 'hommikuvahetus / õhtuvahetus — утренняя / вечерняя смена', 'tööaeg — рабочее время', 'töögraafik — график работы', 'palk — зарплата', 'bruto — брутто, до налогов', 'kogemus — опыт', 'vajalik — необходимый', 'kasuks tuleb — будет плюсом', 'kandideerima — подавать заявку', 'CV — резюме'], '2'),
      B.reading('063_d_read', 'Loe kahte kuulutust.', 'Loe kuulutused ja vasta küsimustele.', 'Kaks töökuulutust',
        'A. Kohvik Päikeseratas otsib klienditeenindajat\nTööaeg on graafiku alusel: kaks päeva tööl ja kaks päeva vaba. Vahetus kestab kella 8–20. Palk on 1300 eurot kuus (bruto). Vajalik on eesti keel A2 tasemel. Sa pead olema sõbralik ja täpne. Kogemus ei ole vajalik, me õpetame ise. Saada oma CV kohviku e-postile 15. maiks.\n\nB. Ladu Kiirpakk otsib komplekteerijat\nTööaeg on E–R, hommikuvahetus 7–15 või õhtuvahetus 15–23. Palk on 9 eurot tunnis, õhtuvahetuses 10 eurot tunnis. Vajalik on töökogemus laos vähemalt üks aasta. Kasuks tuleb tõstukijuhi luba. Pakume tasuta lõunat ja bussi linnast lattu. Helista meile või tule kohale.',
        [['Kui pikk on vahetus kohvikus?', 'kaksteist tundi|12 tundi'], ['Kas kohvikusse on vaja töökogemust?', 'ei|ei ole vaja|kogemus ei ole vajalik'], ['Mitu päeva nädalas töötab laos?', 'viis|5|viis päeva|esmaspäevast reedeni'], ['Kui palju teenib laotöötaja ühes õhtuvahetuses?', 'kaheksakümmend eurot|80 eurot|80'], ['Kuidas saab laos tööle kandideerida?', 'helistada või kohale tulla|helistada|tulla kohale'], ['Milline töö sobib Andreile tööaja järgi?', 'ladu hommikuvahetuses|B hommikuvahetuses|B|ladu']]),
      B.notice('063_d_notice', 'Märka: aeg ja nõuded', ['kella 8–20 = kella **kaheksast** õhtul **kaheksani**', 'E–R = **esmaspäevast reedeni**', '9 eurot **tunnis**, 1300 eurot **kuus**', '**Vajalik:** eesti keel. = Eesti keel **on vajalik**.', '**Kasuks tuleb:** juhiluba. = Hea, kui sul on juhiluba.', '**Kandideerimine:** saada CV. = Saada oma CV.'], 'full'),
      B.wordforms('063_d_time', 'Kellast kellani?', 'Kirjuta kellaaeg sõnaga küsimuse järgi.', [
        ['8', 'kellast?', 'kaheksast'], ['15', 'kellani?', 'viieteistkümneni, kolmeni'], ['7', 'kellast?', 'seitsmest'], ['23', 'kellani?', 'kahekümne kolmeni, üheteistkümneni'], ['9', 'kellast?', 'üheksast'], ['17', 'kellani?', 'seitsmeteistkümneni, viieni'],
      ]),
      B.match('063_d_match', 'Mis see tähendab?', 'Ühenda sõna ja seletus.', [
        ['bruto', 'palk enne makse'], ['vahetus', 'tööaeg ühel päeval, näiteks 7–15'], ['graafiku alusel', 'tööpäevad on igal nädalal erinevad'],
        ['kogemus', 'sa oled seda tööd varem teinud'], ['kasuks tuleb', 'see ei ole kohustuslik, aga on hea'], ['kandideerima', 'saatma CV ja küsima tööd'],
      ], 'full'),
      B.table('063_d_table', 'Võrdle kuulutusi.', 'Täida tabel kuulutuste järgi.', 'Info, Kohvik, Ladu', [
        'amet | [klienditeenindaja] | [komplekteerija]', 'tööaeg | [8–20/kella 8–20/graafiku alusel] | [7–15 või 15–23/E–R]', 'palk | [1300 eurot kuus/1300] | [9 eurot tunnis/9]',
        'vajalik | [eesti keel/eesti keel A2] | [kogemus/töökogemus]', 'kandideerimine | [saada CV/CV] | [helista/helista või tule]',
      ], 'g_read'),
      B.gaps('063_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Laos on kaks [vahetust]: hommikul ja õhtul.', 'Minu [tööaeg] on kella üheksast viieni.', 'Kohvikus on [palk] 1300 eurot kuus.', 'Eesti keel on selles töös [vajalik].',
        'Mul on kolm aastat [kogemust|töökogemust] laos.', 'Ma tahan sellele kohale [kandideerida].',
      ], ['vahetust', 'tööaeg', 'palk', 'vajalik', 'kogemust', 'kandideerida', 'vahetus', 'kandideerima']),
      B.choice('063_d_choice', 'Kumb kuulutus?', 'Loe lauset. Kas see on kohviku või lao kuulutus?', [
        ['Siin saab tasuta lõunat.', 'ladu', 'kohvik', 'mõlemad'], ['Siin ei ole kogemus vajalik.', 'kohvik', 'ladu', 'mõlemad'], ['Siin töötad kaks päeva ja siis puhkad kaks päeva.', 'kohvik', 'ladu', 'mõlemad'],
        ['Õhtul on palk suurem.', 'ladu', 'kohvik', 'mõlemad'], ['Siin peab saatma CV.', 'kohvik', 'ladu', 'mõlemad'],
      ], 'full', 'g_read'),
      // Harno A2 listening 3: a phone call, read twice, answers of 1–2 words
      B.listening('063_d_listen', 'Kuula telefonikõnet.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere! Siin ladu Kiirpakk, Mari kuulab.', '— Tere! Mina olen Andrei. Ma helistan kuulutuse pärast.', '— Väga hea. Kas teil on laotöö kogemus?',
        '— Jah, ma töötasin kaks aastat Narvas laos.', '— Suurepärane. Kas te saate töötada hommikuvahetuses?', '— Jah, hommik sobib mulle hästi. Õhtuti ma õpin.',
        '— Hommikuvahetus algab kell seitse. Meie buss väljub kesklinnast kell pool seitse.', '— Kas buss on tasuta?', '— Jah, buss on töötajatele tasuta. Tulge homme kell kümme vestlusele.',
        '— Aitäh! Kas ma pean midagi kaasa võtma?', '— Võtke kaasa isikutunnistus. Kohtumiseni!',
      ], ['Andrei töötas laos [kaks|2] aastat.', 'Ta töötas varem [Narvas].', 'Andreile sobib [hommikuvahetus|hommik].', 'Buss väljub kesklinnast kell [pool seitse|6.30].', 'Buss on töötajatele [tasuta].', 'Vestlus on homme kell [kümme|10].', 'Kaasa tuleb võtta [isikutunnistus|isikutunnistuse].']),
      B.transformation('063_d_trans', 'Ütle lausega.', 'Kirjuta kuulutuse info täislausena.', [
        ['Tööaeg: E–R', 'Ma töötan …', 'Ma töötan esmaspäevast reedeni.'], ['Vahetus: 7–15', 'Vahetus kestab …', 'Vahetus kestab kella seitsmest kolmeni.|Vahetus kestab seitsmest kolmeni.'],
        ['Palk: 9 € tunnis', 'Palk on …', 'Palk on üheksa eurot tunnis.|Palk on 9 eurot tunnis.'], ['Vajalik: töökogemus', 'Töökogemus on …', 'Töökogemus on vajalik.'],
        ['Kasuks tuleb: juhiluba', 'Hea, kui …', 'Hea, kui sul on juhiluba.|Hea, kui teil on juhiluba.'], ['Kandideerimine: saada CV', 'Kui tahad kandideerida, …', 'Kui tahad kandideerida, saada CV.|Kui tahad kandideerida, saada oma CV.'],
      ]),
      B.translation('063_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я ищу новую работу.', 'Смена длится восемь часов.', 'Зарплата девять евро в час.', 'Опыт работы необходим.', 'Я работаю с понедельника по пятницу.']),
      B.dictation('063_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma otsin uut tööd.', 'Vahetus kestab kaheksa tundi.', 'Palk on üheksa eurot tunnis.', 'Töökogemus on vajalik.', 'Ma tahan sellele kohale kandideerida.']),
      B.speaking('063_d_say', 'Mis töö sulle sobib?', 'Räägi 1 minut: milline tööaeg ja palk sulle sobivad.', [
        'Kas sa tahad töötada hommikul või õhtul?', 'Kas sa tahad töötada vahetustega?', 'Mis on sulle tähtsam: palk või tööaeg?', 'Miks?',
      ], [60, 120], ['Mulle sobib…', 'Ma tahan töötada kella …-st …-ni.', 'Minu jaoks on tähtis…, sest…']),
      B.writing('063_d_write', 'Kumb töö?', 'Kirjuta 5–7 lauset: kumb töö sobib sulle ja miks.', [5, 7], ['tööaeg', 'palk', 'vajalik', 'sest'], 2),
      B.selfcheck('063_d_self', ['Ma tean kuulutuse sõnu: vahetus, palk, kogemus.', 'Ma loen: E–R, kella 7–15, 9 eurot tunnis.', 'Ma leian kuulutusest viis fakti.', 'Ma ütlen, mis tööaeg mulle sobib.'], 'Kuulutus on selge'),
    ],
    practice: [
      B.categorize('063_p_sort', 'Kus see on kuulutuses?', 'Pane info õigesse rühma.', [
        ['Tööaeg', ['E–R', 'vahetus 7–15', 'graafiku alusel', 'kaks päeva tööl ja kaks vaba']], ['Palk', ['9 eurot tunnis', '1300 eurot kuus', 'bruto', 'lisatasu õhtul']], ['Nõuded', ['töökogemus', 'eesti keel A2', 'juhiluba', 'täpsus']],
      ], 'full', 'g_read'),
      B.choice('063_p_form', 'Vali õige vorm.', 'Vali lünka õige vorm.', [
        ['Ma töötan ___ reedeni.', 'esmaspäevast', 'esmaspäeval', 'esmaspäeva'], ['Vahetus kestab kella seitsmest ___.', 'kolmeni', 'kolmest', 'kolm'],
        ['Palk on üheksa eurot ___.', 'tunnis', 'tund', 'tunniks'], ['Mul on kaks aastat ___.', 'töökogemust', 'töökogemus', 'töökogemusega'],
        ['Ma tahan sellele tööle ___.', 'kandideerida', 'kandideerima', 'kandideerin'], ['Eesti keel on selles töös ___.', 'vajalik', 'vajalikud', 'vajalikku'],
      ], 'full', 'g_notice'),
      B.wordforms('063_p_days', 'Nädalapäevad.', 'Kirjuta nädalapäev küsimuse järgi.', [
        ['esmaspäev', 'mis päevast?', 'esmaspäevast'], ['reede', 'mis päevani?', 'reedeni'], ['teisipäev', 'millal?', 'teisipäeval'],
        ['laupäev', 'mis päevast?', 'laupäevast'], ['pühapäev', 'mis päevani?', 'pühapäevani'], ['neljapäev', 'millal?', 'neljapäeval'],
      ]),
      B.gaps('063_p_gaps', 'Kirjuta õiges vormis.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Liis töötab kohvikus [klienditeenindajana] (klienditeenindaja).', 'Tema vahetus kestab kella seitsmest [kolmeni] (kolm).', 'Markus töötab [esmaspäevast] (esmaspäev) reedeni.',
        'Palk on kümme eurot [tunnis] (tund).', 'Anna vastutab [klientide] (kliendid) eest.', 'Olga töötab [raamatupidajana] (raamatupidaja) ja tema töökoht on [kontoris] (kontor).',
      ]),
      B.errorfix('063_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma töötan kell kaheksa kuni kell viis.', 'Ma töötan kella kaheksast viieni.|Ma töötan kaheksast viieni.'], ['Palk on kümme eurot tund.', 'Palk on kümme eurot tunnis.'],
        ['Mul on kaks aastat kogemus.', 'Mul on kaks aastat kogemust.|Mul on kahe aasta kogemus.'], ['Ma tahan kandideerima sellele tööle.', 'Ma tahan sellele tööle kandideerida.|Ma tahan kandideerida sellele tööle.'],
        ['Eesti keel on vajalikud.', 'Eesti keel on vajalik.'], ['Ma töötan esmaspäevast reedel.', 'Ma töötan esmaspäevast reedeni.'],
      ]),
      B.reading('063_p_read', 'Loe töögraafikut.', 'Loe graafik ja juhataja märkus. Vasta küsimustele.', 'Kohviku töögraafik, 1.–7. aprill',
        'Maarja: E ja T hommikuvahetus 7–15, R ja L õhtuvahetus 15–23.\nLiene: E, K ja N õhtuvahetus 15–23.\nLiis: T, K ja N hommikuvahetus 7–15.\nJaan: R, L ja P hommikuvahetus 7–15.\n\nMärkus juhatajalt: Kolmapäeval tuleb kohvikusse suur grupp turiste. Sel päeval peab hommikul tööl olema kaks inimest. Kes saab kolmapäeva hommikul tulla, palun kirjutage mulle. Kui sa tahad vahetust vahetada, kirjuta mulle kaks päeva varem. Õhtuvahetuses on palk tunnis üks euro kõrgem. Uus töötaja Sofia alustab järgmisel nädalal. Esimesel päeval õpetab teda Liis.',
        [['Kes töötab esmaspäeva õhtul?', 'Liene'], ['Mitu vahetust on Maarjal sel nädalal?', 'neli|4'], ['Mitu inimest peab kolmapäeva hommikul tööl olema?', 'kaks|2'], ['Millal peab kirjutama, kui tahad vahetust vahetada?', 'kaks päeva varem|2 päeva varem'], ['Miks on õhtuvahetus rahaliselt parem?', 'palk on kõrgem|tunnis üks euro rohkem|palk on üks euro kõrgem'], ['Kes töötab pühapäeval?', 'Jaan']]),
      B.truefalse('063_p_tf', 'Kas see on õige?', 'Vaata graafikut. Kas lause on õige või vale?', [
        ['Liis töötab kolmapäeva hommikul.', true], ['Liene töötab hommikuti.', false], ['Jaan töötab nädalavahetusel.', true], ['Maarjal on teisipäeval vaba päev.', false], ['Reede õhtul on tööl Maarja.', true],
      ]),
      // Harno A2 reading 5: a personal letter with option gaps
      B.cloze('063_p_cloze', 'Kiri tööandjale.', 'Vali igasse lünka sobiv sõna.', 'Tere!', [
        'Ma nägin teie kuulutust internetis. Ma tahan {*kandideerida|kandideerima|kandideerin} klienditeenindaja kohale. Varem töötasin ma kaks aastat {*müüjana|müüja|müüjat} toidupoes. Ma räägin eesti, vene ja inglise keelt.',
        'Mulle sobib töötada {*graafiku|graafik|graafikut} alusel. Ma saan tööd alustada {*järgmisel|järgmise|järgmist} nädalal. Minu CV on {*kirja|kiri|kirjas} lisas. Ootan teie {*vastust|vastus|vastusega}.',
        '',
        'Lugupidamisega, Sofia Melnik',
      ]),
      B.transformation('063_p_trans', 'Kirjuta graafikust.', 'Kirjuta graafiku järgi täislause.', [
        ['Maarja: E, hommikuvahetus 7–15', 'Esmaspäeval töötab Maarja …', 'Esmaspäeval töötab Maarja kella seitsmest kolmeni.|Esmaspäeval töötab Maarja seitsmest kolmeni.'],
        ['Liene: K, õhtuvahetus', 'Kolmapäeval on Lienel …', 'Kolmapäeval on Lienel õhtuvahetus.'],
        ['Jaan: R–P', 'Jaan töötab …', 'Jaan töötab reedest pühapäevani.'],
        ['Liis: E vaba', 'Esmaspäeval on Liisil …', 'Esmaspäeval on Liisil vaba päev.'],
        ['Õhtul: +1 € tunnis', 'Õhtuvahetuses on palk …', 'Õhtuvahetuses on palk ühe euro võrra kõrgem.|Õhtuvahetuses on palk tunnis üks euro kõrgem.'],
      ]),
      B.wordorder('063_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Minu vahetus algab kell seitse hommikul.', 'Palk on kümme eurot tunnis.', 'Kas selles töös on kogemus vajalik?', 'Ma töötan esmaspäevast reedeni.', 'Ma tahan sellele kohale kandideerida.']),
      B.dialogue('063_p_dialog', 'Vahetuse vahetamine.', 'Täida dialoog. Vaata ka graafikut.', 'Maarja', 'Liene', [
        ['A', 'Liene, kas sa saad laupäeval minu [vahetuse] võtta?'], ['B', 'Mis kell su vahetus [algab]?'], ['A', 'Kell kolm. Ja lõpeb kell [üksteist|23].'],
        ['B', 'Hästi, aga siis võta sina minu [neljapäeva|kolmapäeva|esmaspäeva] õhtu.'], ['A', 'Sobib! Ma kirjutan [juhatajale] kohe.'],
      ]),
      B.translation('063_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['У меня утренняя смена.', 'Смена начинается в семь часов.', 'Я работаю со среды по пятницу.', 'Вечером зарплата выше.', 'В субботу у меня выходной.', 'Можно поменяться сменами?']),
      B.speaking('063_p_say', 'Sinu graafik.', 'Räägi oma nädala tööajast või õppimisest 1 minut.', [
        'Mis päevadel sa töötad?', 'Kellast kellani?', 'Kas sul on vahetused?', 'Millal sul on vaba päev?',
      ], [60, 120], ['Ma töötan …-st …-ni.', 'Esmaspäeval…', 'Mul on vaba…']),
      B.writing('063_p_write', 'Sõnum juhatajale.', 'Kirjuta juhatajale 5–7 lauset: tahad vahetust vahetada.', [5, 7], ['vahetus', 'kellast', 'kellani', 'palun'], 2),
      B.selfcheck('063_p_self', ['Ma ütlen: esmaspäevast reedeni, kella seitsmest kolmeni.', 'Ma loen töögraafikut.', 'Ma valin õige vormi: kandideerida, tunnis, kogemust.', 'Ma palun vahetust vahetada.'], 'Graafik on käes'),
    ],
    transfer: [
      B.text('063_t_situation', 'Uus olukord', 'Sinu sõber Andrei otsib tööd. Ta loeb eesti keelt veel aeglaselt. Andrei saatis sulle kolm töökuulutust. Tal on juhiluba ja ta saab töötada ainult tööpäevadel.'),
      B.reading('063_t_ads', 'Loe kolme kuulutust.', 'Loe kuulutused ja vasta küsimustele.', 'Kolm töökuulutust',
        'A. Pagariäri otsib müüjat. Tööaeg on E–R kella 7–15. Palk on 1200 eurot kuus. Eesti keel peab olema vähemalt A2 tasemel. Kogemus ei ole vajalik. Pakume tasuta kohvi ja saia. Kandideerimiseks helista juhatajale.\n\nB. Kullerfirma otsib autojuhti. Töö on E–R, vahetus kestab kella 9–18. Palk on 1500 eurot kuus. Vajalik on B-kategooria juhiluba. Kasuks tuleb Tallinna tundmine. Firma annab töötajale auto ja telefoni. Saada CV meie kodulehel.\n\nC. Hotell otsib koristajat nädalavahetuseks. Töö on laupäeval ja pühapäeval kella 10–16. Palk on 10 eurot tunnis. Kogemus tuleb kasuks. Hotell asub kesklinnas, bussipeatuse lähedal. Tule vestlusele esmaspäeval kell 12.',
        [['Mis töö sobib Andreile kõige paremini?', 'B|autojuht|autojuhi töö|kullerfirma töö'], ['Miks ei sobi Andreile töö C?', 'see on nädalavahetusel|töö on laupäeval ja pühapäeval'], ['Kui palju teenib koristaja ühel päeval?', 'kuuskümmend eurot|60 eurot|60'], ['Kuidas saab kandideerida autojuhi tööle?', 'saata CV kodulehel|kodulehel|saada CV'], ['Mitu tundi päevas töötab pagariäri müüja?', 'kaheksa|8|kaheksa tundi'], ['Mida annab kullerfirma töötajale?', 'auto ja telefoni|autot ja telefoni|auto ja telefon']]),
      B.table('063_t_table', 'Märkmed Andreile.', 'Kirjuta igast kuulutusest kolm fakti.', 'Kuulutus, Tööaeg, Palk, Vajalik või kasuks', [
        'A müüja | [E–R 7–15/7–15] | [1200 eurot kuus/1200] | [eesti keel/eesti keel A2]', 'B autojuht | [E–R 9–18/9–18] | [1500 eurot kuus/1500] | [juhiluba/B-kategooria juhiluba]', 'C koristaja | [L–P 10–16/10–16] | [10 eurot tunnis/10] | [kogemus/kogemus tuleb kasuks]',
      ], 'g_read'),
      // Harno A2 listening 3: a voicemail, read twice, answers of 1–2 words
      B.listening('063_t_listen', 'Kuula tööandja sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Andrei! Siin on Kerli kullerfirmast Kiirkuller.', 'Aitäh, et saatsite oma CV.', 'Me tahame teid vestlusele kutsuda.', 'Vestlus on neljapäeval kell üksteist.',
        'Meie kontor on Pärnu maanteel, maja number kakskümmend.', 'Võtke kaasa juhiluba ja isikutunnistus.', 'Esimesel nädalal sõidate koos kolleegiga.', 'Palun helistage mulle tagasi täna kella viieni. Head päeva!',
      ], ['Vestlus on [neljapäeval].', 'Vestlus algab kell [üksteist|11].', 'Kontor on Pärnu maanteel, maja number [kakskümmend|20].', 'Kaasa tuleb võtta juhiluba ja [isikutunnistus|isikutunnistuse].', 'Esimesel nädalal sõidab Andrei koos [kolleegiga].', 'Andrei peab helistama kella [viieni|5ni|17ni].']),
      B.choice('063_t_check', 'Mida see tähendab?', 'Loe kuulutuse rida. Vali õige tähendus.', [
        ['„Tööaeg graafiku alusel.”', 'Tööpäevad on igal nädalal erinevad.', 'Töö on ainult esmaspäeval.', 'Tööaega ei ole kirjas.'],
        ['„Kogemus tuleb kasuks.”', 'Kogemus on hea, aga mitte kohustuslik.', 'Ilma kogemuseta ei saa tööle.', 'Kogemus ei ole hea.'],
        ['„Palk 10 € tunnis bruto.”', 'Kümme eurot tunnis enne makse.', 'Kümme eurot päevas pärast makse.', 'Kümme eurot kuus.'],
        ['„Kandideerimine kuni 15. maini.”', 'CV peab tulema hiljemalt 15. mail.', 'Töö algab 15. mail.', 'Vestlus on 15. mail.'],
        ['„E–R 9–18.” Millal sa töötad?', 'Esmaspäevast reedeni kella üheksast kuueni.', 'Ainult esmaspäeval ja reedel.', 'Iga päev kella üheksast.'],
      ], 'full', 'g_read'),
      B.errorfix('063_t_fix', 'Kontrolli kirja.', 'Andrei kirjutas kirja. Paranda vead.', [
        ['Ma tahan kandideerima autojuhi kohale.', 'Ma tahan kandideerida autojuhi kohale.'], ['Mul on viis aastat kogemus.', 'Mul on viis aastat kogemust.|Mul on viie aasta kogemus.'],
        ['Ma töötasin kuller.', 'Ma töötasin kullerina.'], ['Ma saan töötada esmaspäevast reedel.', 'Ma saan töötada esmaspäevast reedeni.'], ['Mul on juhiluba B kategooriast.', 'Mul on B-kategooria juhiluba.'],
      ]),
      B.planning('063_t_plan', 'Enne kirja.', 'Mõtle, mida kirjutad tööandjale. Kirjuta märksõnad.', ['Kes sa oled?', 'Mis tööd sa tahad?', 'Mis kogemus sul on?', 'Millal saad alustada?', 'Kuidas sinuga ühendust võtta?']),
      B.writing('063_t_msg', 'Sõnum Andreile.', 'Kirjuta Andreile 5–7 lauset: mis töö sobib ja miks.', [5, 7], ['sobib', 'tööaeg', 'palk', 'sest'], 2),
      // Harno A2 writing 2: a short letter, at least 30 words
      B.letter('063_t_letter', 'Kandideeri!', 'Kirjuta kullerfirmale lühike kiri. Tutvusta ennast ja oma kogemust.', 'Tere!', 'Lugupidamisega', [30, 50]),
      B.rolecards('063_t_roles', 'Töövestlus telefonis.', 'Üks on Andrei, teine tööandja. Rääkige 2–3 minutit.',
        'Oled Andrei. Helistad kullerfirmasse. Küsi tööaja, palga ja auto kohta. Räägi oma kogemusest.', 'Oled kullerfirma juht. Küsi kogemuse ja juhiloa kohta. Vasta Andrei küsimustele.',
        ['Ma helistan kuulutuse pärast.', 'Mis kell vahetus algab?', 'Mul on … aastat kogemust.'], ['Kas teil on juhiluba?', 'Kas te tunnete Tallinna?', 'Tööaeg on…']),
      B.speaking('063_t_dream', 'Milline töö sulle sobib?', 'Räägi 1 minut: milline töö ja tööaeg sulle sobivad.', [
        'Mis ametit sa tahad?', 'Mis tööaeg sulle sobib?', 'Kui suur palk on hea?', 'Mis on tööl kõige tähtsam?',
      ], [60, 90], ['Mulle sobib töö…', 'Ma tahan töötada …-st …-ni.', 'Tööl on kõige tähtsam…']),
      B.selfcheck('063_t_self', ['Ma oskan leida kuulutusest tööaja, palga ja nõuded.', 'Ma oskan kasutada sõnu vahetus, tööaeg, palk, kogemus, vajalik.', 'Ma oskan öelda aega: esmaspäevast reedeni, kella seitsmest kolmeni.', 'Ma oskan valida sobiva töö ja kirjutada lühikese kandideerimiskirja.'], 'Leian sobiva töö'),
    ],
  },

  'a2-064': {
    title: 'Tööpäeva juhised',
    canDo: 'Ma kuulan lühikest tööjuhist või häälsõnumit kaks korda ja saan aru vähemalt 75% tegevustest, ajast ja muudatustest; annan ise juhiseid (alusta, too, vii, helista).',
    discover: [
      B.text('064_d_situation', 'Hommik hotellis', 'Liis töötab hotelli vastuvõtus. Kell on 7.50. Juhataja Helen ei ole täna tööl, aga ta jättis Liisile häälsõnumi. Täna on hotellis palju külalisi ja mõned muudatused.'),
      B.vocab('064_d_vocab', 'Juhised', ['alustama → alusta! — начинать → начни!', 'lõpetama → lõpeta! — заканчивать → закончи!', 'tooma → too! — приносить → принеси!', 'viima → vii! — относить → отнеси!', 'helistama → helista! — звонить → позвони!', 'ootama → oota! — ждать → подожди!', 'kontrollima → kontrolli! — проверять → проверь!', 'saatma → saada! — отправлять → отправь!', 'juhis — инструкция', 'muudatus — изменение', 'kohe — сразу', 'täna / homme — сегодня / завтра'], '2'),
      // Harno A2 listening: a voice message, answers of 1–2 words
      B.listening('064_d_listen', 'Kuula juhataja häälsõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Liis! Siin Helen.', 'Ma olen täna haige, nii et sina oled vastuvõtus üksi.', 'Kõigepealt kontrolli broneeringuid arvutis.', 'Kell üheksa tuleb grupp Soomest. Neid on kaksteist inimest.',
        'Vii nende kohvrid teisele korrusele. Tarmo aitab sind.', 'Kell kaksteist helista pesumajja ja küsi, millal nad toovad rätikud.', 'Muudatus: koosolek ei ole täna, vaid homme kell kümme.', 'Kell neli tuleb Kati. Oota teda ja siis lõpeta töö.',
      ], ['Helen on täna [haige].', 'Kõigepealt peab Liis kontrollima [broneeringuid].', 'Grupp tuleb [Soomest].', 'Kohvrid tuleb viia [teisele] korrusele.', 'Kell kaksteist peab Liis helistama [pesumajja].', 'Koosolek on [homme] kell kümme.', 'Kati tuleb kell [neli|4|16].']),
      B.table('064_d_order', 'Mis on järjekord?', 'Kirjuta igale tegevusele number 1–5.', 'Tegevus, Number', [
        'Vii kohvrid teisele korrusele. | [2]', 'Kontrolli broneeringuid. | [1]', 'Helista pesumajja. | [3]', 'Lõpeta töö. | [5]', 'Oota Katit. | [4]',
      ], 'g_read'),
      B.reading('064_d_note', 'Loe juhataja kirja.', 'Loe kirja ja vasta küsimustele.', 'Homseks',
        'Tere, Liis! Aitäh, et sa täna üksi hakkama said. Homme on mõned muudatused. Hommikul ära alusta kell kaheksa, vaid kell seitse. Kell pool kaheksa toob pagar värsked saiad. Vii need kohe kööki. Kell kümme on koosolek minu kabinetis. Too palun kaasa nädala broneeringute nimekiri. Pärast koosolekut saada Soome grupile e-kiri. Kirjuta, et buss lennujaama väljub kell kolm. Kui keegi helistab ja küsib vaba tuba, ütle, et nädalavahetusel on hotell täis. Kui sul on küsimusi, helista mulle. Ma olen homme kontoris kogu päeva. Helen',
        [['Mis kell alustab Liis homme tööd?', 'kell seitse|seitse|7'], ['Mida toob pagar?', 'värsked saiad|saiad|saiu'], ['Kuhu peab Liis saiad viima?', 'kööki'], ['Mida peab Liis koosolekule kaasa tooma?', 'broneeringute nimekirja|nimekirja|nädala broneeringute nimekirja'], ['Mis kell väljub buss lennujaama?', 'kell kolm|kolm|15'], ['Mida ütleb Liis, kui keegi küsib vaba tuba?', 'nädalavahetusel on hotell täis|hotell on täis']]),
      B.notice('064_d_notice', 'Märka: juhis (käskiv kõneviis)', ['ma-vorm → juhis: alusta**ma** → **alusta!**, oota**ma** → **oota!**', 'helista**ma** → **helista!**, kontrolli**ma** → **kontrolli!**', 'Jäta meelde: too**ma** → **too!**, vii**ma** → **vii!**, saat**ma** → **saada!**', 'Eitus: **ära alusta! ära helista!**', 'Viisakalt: **palun helista!** — teie-vorm: **helistage!**'], 'full'),
      B.wordforms('064_d_forms', 'Tee juhis.', 'Kirjuta juhis (sina-vorm).', [['alustama', 'sina', 'alusta'], ['lõpetama', 'sina', 'lõpeta'], ['tooma', 'sina', 'too'], ['viima', 'sina', 'vii'], ['helistama', 'sina', 'helista'], ['saatma', 'sina', 'saada'], ['kontrollima', 'sina', 'kontrolli']]),
      B.manymatch('064_d_match', 'Olukord ja juhis.', 'Ühenda olukord ja sobiv juhis.', ['Klient tahab arvet e-postiga.', 'Kohvrid on fuajees.', 'Juhataja tahab nimekirja.', 'Pesumaja ei ole rätikuid toonud.', 'Kell on neli ja Kati on tulnud.', 'Toa number on vale.'], ['Saada arve kohe!', 'Vii kohvrid tuppa!', 'Too nimekiri kabinetti!', 'Helista pesumajja!', 'Lõpeta töö ja mine koju!', 'Kontrolli broneeringut!'], 'full', 'g_use'),
      B.choice('064_d_choice', 'Mida see juhis tähendab?', 'Vali, mida Liis teeb.', [
        ['„Vii kohvrid teisele korrusele.”', 'Liis paneb kohvrid teisele korrusele.', 'Liis toob kohvrid teiselt korruselt.', 'Liis ootab kohvreid fuajees.'],
        ['„Too nimekiri kaasa.”', 'Liis võtab nimekirja koosolekule kaasa.', 'Liis saadab nimekirja e-postiga.', 'Liis jätab nimekirja koju.'],
        ['„Helista pesumajja.”', 'Liis võtab telefoni ja helistab.', 'Liis läheb ise pesumajja.', 'Liis kirjutab pesumajale kirja.'],
        ['„Oota Katit.”', 'Liis jääb tööle, kuni Kati tuleb.', 'Liis läheb Katile bussi vastu.', 'Liis saadab Katile sõnumi.'],
        ['„Alusta kell seitse.”', 'Tööpäev algab kell seitse.', 'Tööpäev lõpeb kell seitse.', 'Koosolek on kell seitse.'],
      ]),
      B.gaps('064_d_gaps', 'Täida juhised.', 'Vali sõnapangast sobiv juhis. Kaks sõna jääb üle.', [
        'Palun [helista] kliendile tagasi.', '[Vii] see pakk postkontorisse.', '[Too] mulle palun kohvi.', '[Oota] siin, ma tulen kohe.', '[Saada] arve kliendile e-postiga.', 'Palun [lõpeta] töö kell viis.',
      ], ['helista', 'vii', 'too', 'oota', 'saada', 'lõpeta', 'alusta', 'kontrolli']),
      B.wordorder('064_d_order2', 'Pane juhis kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kõigepealt kontrolli broneeringuid arvutis.', 'Vii kohvrid teisele korrusele.', 'Kell kaksteist helista pesumajja.', 'Koosolek ei ole täna, vaid homme.', 'Oota Katit ja siis lõpeta töö.']),
      B.translation('064_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Позвони клиенту.', 'Отнеси чемоданы в номер.', 'Принеси список на совещание.', 'Подожди здесь, пожалуйста.', 'Отправь счёт сразу.']),
      B.dictation('064_d_dict', 'Etteütlus.', 'Kuula ja kirjuta juhised.', ['Kontrolli broneeringuid.', 'Vii kohvrid teisele korrusele.', 'Helista pesumajja.', 'Koosolek on homme kell kümme.', 'Saada grupile e-kiri.']),
      B.rolecards('064_d_roles', 'Juhataja ja töötaja.', 'A annab kolm juhist, B kordab ja küsib. Siis vahetage.',
        'Oled juhataja. Anna töötajale kolm juhist: mida, kuhu ja mis kell.', 'Oled töötaja. Korda juhist ja küsi, kui midagi on ebaselge.',
        ['Palun vii…', 'Kell … helista…', 'Too mulle…'], ['Selge. Ma viin…', 'Kas ma pean kohe…?', 'Palun korrake, mis kell?']),
      B.writing('064_d_write', 'Juhised kolleegile.', 'Kirjuta kolleegile homseks 5–7 juhist.', [5, 7], ['kontrolli', 'vii', 'helista', 'saada'], 2),
      B.selfcheck('064_d_self', ['Ma saan häälsõnumist aru: mida, kuhu, mis kell.', 'Ma tean juhise vorme: alusta, too, vii, helista, saada.', 'Ma märkan muudatust: mitte täna, vaid homme.', 'Ma annan kolleegile juhiseid.'], 'Juhised on selged'),
    ],
    practice: [
      B.listening('064_p_listen', 'Kuulamine 1. Neli ülesannet.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Markus, tere! Siin Toomas.', 'Mul on sulle täna neli ülesannet.', 'Esiteks saada kliendile Tammele pakk. Pakk on kolmandal riiulil.', 'Teiseks helista Andresele, sest arvuti ei tööta.',
        'Kolmandaks too koosolekuruumi kümme tooli.', 'Neljandaks vii kaks kirja postkontorisse. Postkontor on avatud kella kuueni.', 'Koosolek algab kell kolm, mitte kell kaks. Aitäh!',
      ], ['Pakk tuleb saata kliendile [Tammele].', 'Arvuti ei tööta, seepärast tuleb helistada [Andresele].', 'Koosolekuruumi on vaja [kümme|10] tooli.', 'Kirjad tuleb viia [postkontorisse].', 'Postkontor on avatud kella [kuueni|6ni|18ni].', 'Koosolek algab kell [kolm|3|15].']),
      B.truefalse('064_p_tf', 'Õige või vale?', 'Kuula sõnumit veel kord. Õige või vale?', [
        ['Toomas annab Markusele neli ülesannet.', true], ['Pakk on Toomase kabinetis.', false], ['Markus peab tooma koosolekuruumi toolid.', true], ['Postkontor on avatud kella viieni.', false], ['Koosolek algab kell kaks.', false],
      ]),
      B.listening('064_p_change', 'Kuulamine 2. Muudatus.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Markus, siin jälle Toomas. Mul on kaks muudatust.', 'Kliendil Tammel on uus aadress. Ära saada pakki vanale aadressile.', 'Uue aadressi saadan sulle sõnumiga.',
        'Koosolek ei ole kolmandal korrusel, vaid teisel korrusel.', 'Seepärast vii toolid teise korruse saali.', 'Kirjad võid viia postkontorisse homme hommikul.',
      ], ['Kliendil on uus [aadress].', 'Toomas saadab aadressi [sõnumiga].', 'Koosolek on [teisel] korrusel.', 'Toolid tuleb viia teise korruse [saali].', 'Kirjad võib viia [homme] hommikul.']),
      B.table('064_p_changes', 'Enne ja nüüd.', 'Kirjuta, mis muutus.', 'Mis?, Enne, Nüüd', [
        'Koosoleku aeg | kell [kaks/2] | kell [kolm/3]', 'Koosoleku koht | [kolmas] korrus | [teine] korrus', 'Kirjad postkontorisse | [täna] | [homme hommikul/homme]',
      ], 'g_read'),
      B.crossword('064_p_cross', 'Tööjuhiste sõnad.', 'Kirjuta sõna vihje järgi.', [['Seda teed telefoniga.', 'helistama'], ['„alustama” vastand', 'lõpetama'], ['Juhis: kiri kohe ära …!', 'saada'], ['изменение', 'muudatus'], ['инструкция', 'juhis'], ['сразу', 'kohe']]),
      B.gaps('064_p_gaps', 'Kirjuta juhis.', 'Kirjuta sulgudes olev tegusõna juhisena (sina).', [
        'Palun [too] (tooma) mulle uus kaust.', '[Helista] (helistama) kliendile enne lõunat.', '[Vii] (viima) see pakk Viktorile.', '[Oota] (ootama) mind fuajees.', '[Saada] (saatma) mulle aruanne reedeks.', '[Ära alusta] (alustama, eitus) ilma minuta!',
      ]),
      B.transformation('064_p_trans', 'Ütle juhisena.', 'Muuda lause juhiseks.', [
        ['Sa pead arve saatma.', 'Juhis: …', 'Saada arve!|Palun saada arve!'], ['Sa pead kell kaheksa alustama.', 'Juhis: …', 'Alusta kell kaheksa!|Palun alusta kell kaheksa!'],
        ['Sa pead kliendile helistama.', 'Juhis: …', 'Helista kliendile!|Palun helista kliendile!'], ['Sa pead toolid tooma.', 'Juhis: …', 'Too toolid!|Palun too toolid!'],
        ['Sa ei pea ootama.', 'Juhis: …', 'Ära oota!'], ['Te peate kohe helistama.', 'Juhis (teie): …', 'Helistage kohe!|Palun helistage kohe!'],
      ]),
      B.errorfix('064_p_fix', 'Paranda viga.', 'Kirjuta juhis õigesti.', [
        ['Palun helistama kliendile!', 'Palun helista kliendile!'], ['Saatma arve kohe!', 'Saada arve kohe!'], ['Vii mulle palun kohvi!', 'Too mulle palun kohvi!'],
        ['Ära ootad mind!', 'Ära oota mind!'], ['Palun kontrollib broneeringut!', 'Palun kontrolli broneeringut!'],
      ]),
      B.wordorder('064_p_order', 'Pane juhis kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Palun saada pakk kohe kliendile.', 'Helista Andresele, sest arvuti ei tööta.', 'Too koosolekuruumi kümme tooli.', 'Koosolek ei ole kolmandal korrusel.', 'Kirjad võid viia homme hommikul.']),
      B.dialogue('064_p_dialog', 'Telefonis.', 'Täida Markuse ja Toomase vestlus.', 'Markus', 'Toomas', [
        ['A', 'Tere, Toomas! Mul on üks küsimus.'], ['B', 'Jah, [küsi]!'], ['A', 'Kas ma pean paki täna [saatma]?'], ['B', 'Jah, [saada] see kohe, palun.'],
        ['A', 'Selge. Ja kuhu ma toolid [viin]?'], ['B', '[Vii] need teise korruse saali.'], ['A', 'Kas ma pean ka postkontorisse [minema]?'], ['B', 'Ei, täna mitte. [Mine] homme hommikul.'],
      ]),
      B.translation('064_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta juhis eesti keeles.', ['Начни работу в восемь.', 'Закончи отчёт к пятнице.', 'Отнеси письма на почту.', 'Не звони мне после шести.', 'Подожди меня у входа.', 'Проверь, пожалуйста, адрес.']),
      B.speaking('064_p_say', 'Häälsõnum kolleegile.', 'Jäta kolleegile häälsõnum: kolm juhist ja üks muudatus.', ['Tervita ja ütle oma nimi.', 'Anna kolm juhist.', 'Ütle üks muudatus.', 'Lõpeta viisakalt.'], [45, 90], ['Siin…', 'Kõigepealt…', 'Muudatus: … ei ole …, vaid…']),
      B.rolecards('064_p_roles', 'Mis muutus?', 'A ütleb muudatused, B kirjutab üles ja kordab.',
        'Oled juhataja. Ütle kolm muudatust: aeg, koht ja tegevus.', 'Oled töötaja. Kirjuta muudatused üles ja korda need valjult.',
        ['Muudatus: …', '… ei ole kell kaks, vaid…', 'Palun vii…'], ['Kas ma sain õigesti aru…?', 'Niisiis: …', 'Palun korda!']),
      B.writing('064_p_write', 'Markuse märkmed.', 'Kirjuta Toomase sõnumite järgi Markuse ülesanded: 5–7 lauset.', [5, 7], ['saada', 'helista', 'too', 'vii'], 2),
      B.selfcheck('064_p_self', ['Ma kirjutan kuuldud juhisest üles tegevuse ja aja.', 'Ma märkan muudatust kahe sõnumi vahel.', 'Ma teen juhise: saada, helista, ära oota.', 'Ma jätan kolleegile selge häälsõnumi.'], 'Kuulan ja teen'),
    ],
    transfer: [
      B.text('064_t_situation', 'Uus olukord', 'Sa töötad Jaani kohvikus. Homme on Jaan koolitusel ja sina oled kohvikus üksi. Jaan jättis sulle häälsõnumi. Õhtul helistab ka uus töötaja Karl ja küsib, mida ta peab homme tegema.'),
      B.listening('064_t_listen', 'Kuula Jaani sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin Jaan. Homme oled sa kohvikus üksi.', 'Alusta tööd kell seitse. Võti on naabri juures, korteris viis.', 'Kõigepealt lülita sisse kohvimasin.', 'Kell pool kaheksa toob pagar saiad. Kontrolli, kas kõik on olemas.',
        'Kell kümme tuleb uus töötaja Karl. Näita talle kassat.', 'Pärastlõunal helista piimafirmale ja telli kaks kasti piima.', 'Muudatus: kohvik ei sulge kell kuus, vaid kell viis.', 'Lõpuks vii prügi välja ja pane uks lukku. Aitäh!',
      ], ['Tööd tuleb alustada kell [seitse|7].', 'Võti on [naabri] juures.', 'Kõigepealt tuleb sisse lülitada [kohvimasin].', 'Uus töötaja tuleb kell [kümme|10].', 'Piimafirmalt tuleb tellida kaks [kasti].', 'Homme sulgeb kohvik kell [viis|5|17].']),
      B.truefalse('064_t_tf', 'Õige või vale?', 'Kuula Jaani sõnumit uuesti.', [['Võti on Jaani juures.', false], ['Pagar toob saiad kell pool kaheksa.', true], ['Karl tuleb pärastlõunal.', false], ['Piima tuleb tellida.', true], ['Homme on kohvik avatud kella kuueni.', false]]),
      B.categorize('064_t_sort', 'Millal mida teha?', 'Pane juhised õigesse rühma.', [
        ['Hommikul', ['võta võti naabrilt', 'lülita kohvimasin sisse', 'kontrolli saiad']], ['Päeval', ['näita Karlile kassat', 'helista piimafirmale', 'telli piima']], ['Õhtul', ['vii prügi välja', 'pane uks lukku', 'sulge kohvik kell viis']],
      ], 'full', 'g_read'),
      B.wordorder('064_t_order', 'Pane juhis kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Alusta tööd kell seitse.', 'Võti on naabri juures.', 'Näita Karlile kassat.', 'Helista pärastlõunal piimafirmale.', 'Pane uks lukku.']),
      B.transformation('064_t_mia', 'Juhised Karlile (teie).', 'Kirjuta juhis teie-vormis.', [
        ['Tule kell kümme.', 'teie', 'Tulge kell kümme.'], ['Oota mind kassa juures.', 'teie', 'Oodake mind kassa juures.'], ['Too oma ID-kaart kaasa.', 'teie', 'Tooge oma ID-kaart kaasa.'],
        ['Helista, kui jääd hiljaks.', 'teie', 'Helistage, kui jääte hiljaks.'], ['Kontrolli saiad üle.', 'teie', 'Kontrollige saiad üle.'],
      ]),
      B.errorfix('064_t_fix', 'Paranda märkmed.', 'Kolleeg kirjutas juhised valesti. Paranda.', [
        ['Alustama tööd kell seitse!', 'Alusta tööd kell seitse!'], ['Viima prügi välja!', 'Vii prügi välja!'], ['Ära unustad ust lukku panna!', 'Ära unusta ust lukku panna!'],
        ['Karl, palun tulge kell kümme ja ootad mind!', 'Karl, palun tulge kell kümme ja oodake mind!'], ['Helista piimafirmale ja tellib piima.', 'Helista piimafirmale ja telli piima.'],
      ]),
      B.dictation('064_t_dict', 'Etteütlus.', 'Kuula ja kirjuta juhised.', ['Alusta tööd kell seitse.', 'Võti on naabri juures.', 'Kontrolli saiad üle.', 'Telli kaks kasti piima.', 'Pane uks lukku.']),
      B.translation('064_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Ключ у соседа.', 'Сначала включи кофемашину.', 'Покажи Карлу кассу.', 'Закажи два ящика молока.', 'Кафе закрывается в пять.']),
      B.planning('064_t_plan', 'Sinu homne päev.', 'Kirjuta juhised õiges järjekorras.', ['Kell 7:', 'Kell 7.30:', 'Kell 10:', 'Pärastlõunal:', 'Õhtul:']),
      B.letter('064_t_letter', 'Sõnum Karlile.', 'Kirjuta Karlile 40–60 sõna: millal tulla, mida kaasa võtta, mida teha.', 'Tere, Karl!', 'Kohtumiseni homme!', [40, 60]),
      B.speaking('064_t_voice', 'Häälsõnum Jaanile.', 'Jaan ei vasta. Jäta talle häälsõnum: kõik on selge ja üks küsimus.', ['Tervita ja ütle oma nimi.', 'Korda kaks tähtsat juhist.', 'Küsi üks küsimus.', 'Lõpeta viisakalt.'], [45, 90]),
      B.rolecards('064_t_roles', 'Karl helistab.', 'A on Karl, B annab juhiseid. Siis vahetage.',
        'Oled uus töötaja Karl. Küsi: mis kell tulla, mida teha, millal lõpetada.', 'Selgita Karlile homset päeva Jaani sõnumi järgi. Ütle ka muudatus.',
        ['Mis kell ma pean tulema?', 'Mida ma pean tegema?', 'Palun korrake!'], ['Tulge kell…', 'Kõigepealt…', 'Muudatus: …']),
      B.rubric('064_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kuulamisest on kirjas aeg, koht ja tegevused.', 'Juhised on õiges vormis (alusta, vii, helista; tulge, oodake).', 'Sõnumis Karlile on aeg, kaasa võtta ja ülesanded.', 'Telefonis küsib ja täpsustab õpilane, kui ei saa aru.']),
      B.selfcheck('064_t_self', ['Ma saan aru kolleegi häälsõnumist.', 'Ma panen juhised õigesse järjekorda.', 'Ma kirjutan uuele töötajale selged juhised.', 'Ma selgitan päeva plaani telefonis.'], 'Päev on plaanitud'),
    ],
  },

  'a2-065': {
    title: 'Kontroll 13 — töö',
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
      B.selfcheck('065_d_self', ['Ma mäletan ametite ja töö sõnu.', 'Ma kasutan pean + ma ja oskan + da.', 'Ma ütlen tööaja: kella kaheksast neljani.', 'Ma annan ja mõistan juhiseid.'], 'Valmis kontrolliks'),
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
      B.selfcheck('065_p_self', ['Lugemine: leian töökuulutusest tööaja, nõuded ja palga.', 'Lugemine: valin kirja lünka õige vormi.', 'Kuulamine: kirjutan juhisest aja ja koha.', 'Kuulamine: saan aru kahe sõbra vestlusest.'], 'Lugemine ja kuulamine tehtud'),
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
