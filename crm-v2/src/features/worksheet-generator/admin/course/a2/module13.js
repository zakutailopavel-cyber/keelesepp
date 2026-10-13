// A2 course (A1 → A2 roadmap), module 13 „Töö ja amet”, lessons a2-061 and a2-063 (the other lessons of the module
// are already in the database). Jobs and the workplace (töötan kellena? -na, kus? -s, vastutan mille eest?), the work
// schedule and a simple job ad (vahetus, tööaeg, palk, kogemus, vajalik, kandideerimine; kellast kellani, E–R).
// Harno A2 formats: listening with 1–2-word answers (read twice), notices / ads, writing from a business card (≥ 25
// words) and a short letter (30–50 words), picture description and a role dialogue.
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-13', course: 'a2', title: 'Töö ja amet', level: 'A2' };

export const LESSONS = {
  'a2-061': {
    title: 'Ametid ja töökoht',
    canDo: 'Ma kirjeldan oma või väljamõeldud tööd 6–8 lausega: amet, töökoht, tööaeg ja vähemalt kolm ülesannet.',
    discover: [
      B.text('061_d_situation', 'Uus kolleeg', 'Esmaspäeval tuleb Markuse firmasse uus kolleeg. Tema nimi on Sofia. Ta töötab raamatupidajana. Sofia on pärit Narvast, aga elab nüüd Tallinnas. Markus näitab talle kontorit ja tutvustab teisi kolleege.'),
      B.truefalse('061_d_tf', 'Mis toimub?', 'Loe olukorda. Kas lause on õige või vale?', [
        ['Sofia on Markuse uus kolleeg.', true], ['Sofia töötab müüjana.', false], ['Sofia elab praegu Narvas.', false], ['Markus tutvustab Sofiale kolleege.', true], ['Sofia alustab tööd esmaspäeval.', true],
      ]),
      B.vocab('061_d_vocab', 'Töö sõnad', ['amet — профессия', 'töökoht — место работы', 'kolleeg — коллега', 'klient — клиент', 'ülemus — начальник', 'firma — фирма', 'kontor — офис', 'tööpäev — рабочий день', 'töötama (kellena?) — работать (кем?)', 'vastutama (mille eest?) — отвечать (за что?)', 'teenindama — обслуживать', 'ülesanne — задача'], '2'),
      B.reading('061_d_read', 'Loe: kolm inimest, kolm ametit.', 'Loe tekst ja vasta küsimustele.', 'Kus nad töötavad?',
        'Jaan on viiekümneaastane. Ta töötab bussijuhina juba kakskümmend aastat. Tema töökoht on buss number seitseteist. Jaan alustab tööd kell kuus hommikul. Ta vastutab reisijate ohutuse eest. Bussis kuulab ta tihti raadiot. Talle meeldib, et iga päev näeb ta palju inimesi.\nLiis töötab apteegis farmatseudina. Ta müüb ravimeid ja annab klientidele nõu. Tema tööpäev on kaheksa tundi pikk. Vahel töötab ta ka laupäeval. Liisi kolleegid on noored ja sõbralikud. Liis ütleb, et tema töö on huvitav, aga väsitav.\nViktor on IT-spetsialist. Ta töötab suures firmas, aga kolm päeva nädalas teeb ta tööd kodus. Lõunat sööb ta kontori köögis koos kolleegidega. Ta parandab arvuteid ja aitab kolleege, kui programm ei tööta. Viktor vastutab firma arvutivõrgu eest. Tema ülemus on Viktoriga rahul, sest Viktor on täpne ja kiire.',
        [['Kui kaua on Jaan bussijuhina töötanud?', 'kakskümmend aastat|20 aastat'], ['Mille eest vastutab Jaan?', 'reisijate ohutuse eest|reisijate ohutuse'], ['Mida teeb Liis tööl?', 'müüb ravimeid ja annab nõu|müüb ravimeid|annab klientidele nõu'], ['Kes töötab vahel nädalavahetusel?', 'Liis'], ['Kus töötab Viktor kolm päeva nädalas?', 'kodus'], ['Miks on Viktori ülemus rahul?', 'Viktor on täpne ja kiire|ta on täpne ja kiire|sest ta on täpne ja kiire']]),
      B.notice('061_d_notice', 'Märka: kellena? kus? mille eest?', ['Jaan **töötab bussijuhina**. (bussijuht → bussijuhi**na**)', 'Liis **töötab apteegis**. (kus? → -s)', 'Viktor **on** IT-spetsialist. (kes ta on?)', 'Jaan **vastutab** reisijate ohutuse **eest**.', 'Liis **müüb** ravimeid ja **annab** nõu.'], 'full'),
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
      B.wordorder('061_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Ma töötan suures firmas raamatupidajana.', 'Jaan alustab tööd kell kuus hommikul.', 'Liis annab klientidele nõu.', 'Viktor vastutab arvutite eest.', 'Minu töökoht on kesklinnas.']),
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
        'Minu vend töötab [kokana] (kokk) restoranis.', 'Anna töötab [raamatupidajana] (raamatupidaja).', 'Jaan töötab [bussijuhina] (bussijuht).', 'Liis töötab [apteegis] (apteek).',
        'Viktor teeb kolm päeva nädalas tööd [kodus] (kodu).', 'Markus vastutab [projekti] (projekt) eest.', 'Sofia sõidab tööle [trammiga] (tramm).',
      ]),
      B.transformation('061_p_trans', 'Ütle teisiti.', 'Kirjuta lause. Alusta antud sõnadega.', [
        ['Ma olen müüja.', 'Ma töötan …', 'Ma töötan müüjana.'], ['Minu töökoht on haigla. Ma olen õde.', 'Ma töötan …', 'Ma töötan haiglas õena.|Ma töötan õena haiglas.'],
        ['Jaan on bussijuht.', 'Jaan töötab …', 'Jaan töötab bussijuhina.'], ['Liisi töö on aidata kliente.', 'Liis aitab …', 'Liis aitab kliente.'],
        ['Viktor peab hoolitsema arvutite eest.', 'Viktor vastutab …', 'Viktor vastutab arvutite eest.'], ['Sofia on raamatupidaja suures firmas.', 'Sofia töötab …', 'Sofia töötab suures firmas raamatupidajana.|Sofia töötab raamatupidajana suures firmas.'],
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
      B.reading('061_t_read', 'Loe: töövarjupäev.', 'Loe tekst ja vasta küsimustele.', 'Tõnise töövarjupäev',
        'Kolmapäeval oli Anna pojal Tõnisel töövarjupäev. Tõnis on viieteistkümneaastane. Ta käis terve päeva koos Liisiga tööl. Liis töötab loomaarstina väikeses kliinikus. Tööpäev algas kell kaheksa. Kõigepealt vaatasid nad koos koera, kellel oli valus jalg. Siis tuli kliinikusse vanaproua oma kassiga. Liis rääkis klientidega rahulikult ja selgelt. Lõuna ajal sõid kolleegid koos ja rääkisid naljajutte. Pärastlõunal aitas Tõnis administraatorit. Ta vastas telefonile ja kirjutas kliente arvutisse. Õhtul oli Tõnis väsinud, aga õnnelik. Kodus ütles ta emale, et tahab ka loomaarstiks saada. Anna oli üllatunud, sest varem tahtis Tõnis olla kokk.',
        [['Kellena Liis töötab?', 'loomaarstina|ta on loomaarst|loomaarst'], ['Mis oli koeral viga?', 'tal oli valus jalg|valus jalg|jalg valutas'], ['Mida tegi Tõnis pärastlõunal?', 'aitas administraatorit|vastas telefonile|kirjutas kliente arvutisse'], ['Milline oli Tõnis õhtul?', 'väsinud, aga õnnelik|väsinud ja õnnelik|õnnelik'], ['Miks oli Anna üllatunud?', 'varem tahtis Tõnis olla kokk|Tõnis tahtis enne olla kokk|sest ta tahtis olla kokk']]),
      // Harno A2 writing 1: information transfer from a business card, at least 25 words
      B.tip('061_t_card', 'Visiitkaart', ['**Sofia Ivanova**', 'raamatupidaja', 'firma Arvepidaja, Pärnu maantee 22, Tallinn', 'tööaeg: E–R 9.00–17.00', 'telefon: 5566 7788'], 'full'),
      B.writing('061_t_cardwrite', 'Kirjuta Sofiast.', 'Kirjuta visiitkaardi järgi 4–5 lauset: kes, kus, millal, kuidas ühendust võtta.', [4, 5], ['töötab', 'raamatupidajana', 'helistada'], 2),
      B.transformation('061_t_trans', 'Märkmetest lauseks.', 'Kirjuta kursusekaaslase märkmetest täislause.', [
        ['Amet: kokk', 'Ta töötab …', 'Ta töötab kokana.'], ['Töökoht: hotell', 'Ta töötab …', 'Ta töötab hotellis.'],
        ['Tööaeg: 8–16', 'Tema tööpäev kestab …', 'Tema tööpäev kestab kella kaheksast neljani.|Tema tööpäev kestab kaheksast neljani.'],
        ['Ülesanne: menüü', 'Ta vastutab …', 'Ta vastutab menüü eest.'], ['Kolleegid: 5', 'Tal on …', 'Tal on viis kolleegi.'],
      ]),
      B.choice('061_t_react', 'Mida sa vastad?', 'Loe küsimust. Vali sobiv vastus.', [
        ['Kursusekaaslane küsib: „Mis tööd sa teed?”', 'Ma töötan õpetajana.', 'Ma töötan õpetaja.', 'Ma töötan õpetajat.'],
        ['Kursusekaaslane küsib: „Kus sa töötad?”', 'Ühes väikeses firmas.', 'Ühte väikesesse firmasse.', 'Ühest väikesest firmast.'],
        ['Klient küsib: „Kas te saate mind aidata?”', 'Jah, muidugi. Mida te vajate?', 'Ei, see ei ole minu firma.', 'Jah, minu palk on hea.'],
        ['Uus kolleeg ütleb: „Tere, mina olen Sofia.”', 'Tere tulemast! Mina olen Markus.', 'Head aega, Sofia!', 'Palju õnne, Sofia!'],
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

  'a2-063': {
    title: 'Töögraafik ja lihtne töökuulutus',
    canDo: 'Ma leian töökuulutusest ja töögraafikust vähemalt viis olulist fakti: amet, tööaeg, palk, nõuded ja kandideerimise viis.',
    discover: [
      B.text('063_d_situation', 'Viktor otsib tööd', 'Viktor otsib uut tööd. Ta tahab töötada ainult päeval, sest õhtuti õpib ta eesti keelt. Internetis näeb ta kahte kuulutust. Mõlemas on palk ja tööaeg kirjas.'),
      B.truefalse('063_d_tf', 'Mis toimub?', 'Loe olukorda. Kas lause on õige või vale?', [
        ['Viktor otsib uut tööd.', true], ['Viktor tahab töötada öösel.', false], ['Õhtuti õpib Viktor eesti keelt.', true], ['Viktor leiab kuulutused ajalehest.', false], ['Kuulutustes on kirjas palk.', true],
      ]),
      B.vocab('063_d_vocab', 'Kuulutuse sõnad', ['töökuulutus — объявление о работе', 'vahetus — смена', 'hommikuvahetus / õhtuvahetus — утренняя / вечерняя смена', 'tööaeg — рабочее время', 'töögraafik — график работы', 'palk — зарплата', 'bruto — брутто, до налогов', 'kogemus — опыт', 'vajalik — необходимый', 'kasuks tuleb — будет плюсом', 'kandideerima — подавать заявку', 'CV — резюме'], '2'),
      B.reading('063_d_read', 'Loe kahte kuulutust.', 'Loe kuulutused ja vasta küsimustele.', 'Kaks töökuulutust',
        'A. Kohvik Päikeseratas otsib klienditeenindajat\nTööaeg on graafiku alusel: kaks päeva tööl ja kaks päeva vaba. Vahetus kestab kella 8–20. Palk on 1300 eurot kuus (bruto). Vajalik on eesti keel A2 tasemel. Sa pead olema sõbralik ja täpne. Kogemus ei ole vajalik, me õpetame ise. Saada oma CV kohviku e-postile 15. maiks.\n\nB. Ladu Kiirpakk otsib komplekteerijat\nTööaeg on E–R, hommikuvahetus 7–15 või õhtuvahetus 15–23. Palk on 9 eurot tunnis, õhtuvahetuses 10 eurot tunnis. Vajalik on töökogemus laos vähemalt üks aasta. Kasuks tuleb tõstukijuhi luba. Pakume tasuta lõunat ja bussi linnast lattu. Helista meile või tule kohale.',
        [['Kui pikk on vahetus kohvikus?', 'kaksteist tundi|12 tundi'], ['Kas kohvikusse on vaja töökogemust?', 'ei|ei ole vaja|kogemus ei ole vajalik'], ['Mitu päeva nädalas töötab laos?', 'viis|5|viis päeva|esmaspäevast reedeni'], ['Kui palju teenib laotöötaja ühes õhtuvahetuses?', 'kaheksakümmend eurot|80 eurot|80'], ['Kuidas saab laos tööle kandideerida?', 'helistada või kohale tulla|helistada|tulla kohale'], ['Milline töö sobib Viktorile tööaja järgi?', 'ladu hommikuvahetuses|B hommikuvahetuses|B|ladu']]),
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
        '— Tere! Siin ladu Kiirpakk, Mari kuulab.', '— Tere! Mina olen Viktor. Ma helistan kuulutuse pärast.', '— Väga hea. Kas teil on laotöö kogemus?',
        '— Jah, ma töötasin kaks aastat Narvas laos.', '— Suurepärane. Kas te saate töötada hommikuvahetuses?', '— Jah, hommik sobib mulle hästi. Õhtuti ma õpin.',
        '— Hommikuvahetus algab kell seitse. Meie buss väljub kesklinnast kell pool seitse.', '— Kas buss on tasuta?', '— Jah, buss on töötajatele tasuta. Tulge homme kell kümme vestlusele.',
        '— Aitäh! Kas ma pean midagi kaasa võtma?', '— Võtke kaasa isikutunnistus. Kohtumiseni!',
      ], ['Viktor töötas laos [kaks|2] aastat.', 'Ta töötas varem [Narvas].', 'Viktorile sobib [hommikuvahetus|hommik].', 'Buss väljub kesklinnast kell [pool seitse|6.30].', 'Buss on töötajatele [tasuta].', 'Vestlus on homme kell [kümme|10].', 'Kaasa tuleb võtta [isikutunnistus|isikutunnistuse].']),
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
        'Liis töötab kohvikus [klienditeenindajana] (klienditeenindaja).', 'Tema vahetus kestab kella seitsmest [kolmeni] (kolm).', 'Viktor töötab [esmaspäevast] (esmaspäev) reedeni.',
        'Palk on kümme eurot [tunnis] (tund).', 'Anna vastutab [klientide] (kliendid) eest.', 'Sofia töötab [raamatupidajana] (raamatupidaja) ja tema töökoht on [kontoris] (kontor).',
      ]),
      B.errorfix('063_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma töötan kell kaheksa kuni kell viis.', 'Ma töötan kella kaheksast viieni.|Ma töötan kaheksast viieni.'], ['Palk on kümme eurot tund.', 'Palk on kümme eurot tunnis.'],
        ['Mul on kaks aastat kogemus.', 'Mul on kaks aastat kogemust.|Mul on kahe aasta kogemus.'], ['Ma tahan kandideerima sellele tööle.', 'Ma tahan sellele tööle kandideerida.|Ma tahan kandideerida sellele tööle.'],
        ['Eesti keel on vajalikud.', 'Eesti keel on vajalik.'], ['Ma töötan esmaspäevast reedel.', 'Ma töötan esmaspäevast reedeni.'],
      ]),
      B.reading('063_p_read', 'Loe töögraafikut.', 'Loe graafik ja juhataja märkus. Vasta küsimustele.', 'Kohviku töögraafik, 1.–7. aprill',
        'Anna: E ja T hommikuvahetus 7–15, R ja L õhtuvahetus 15–23.\nMarkus: E, K ja N õhtuvahetus 15–23.\nLiis: T, K ja N hommikuvahetus 7–15.\nJaan: R, L ja P hommikuvahetus 7–15.\n\nMärkus juhatajalt: Kolmapäeval tuleb kohvikusse suur grupp turiste. Sel päeval peab hommikul tööl olema kaks inimest. Kes saab kolmapäeva hommikul tulla, palun kirjutage mulle. Kui sa tahad vahetust vahetada, kirjuta mulle kaks päeva varem. Õhtuvahetuses on palk tunnis üks euro kõrgem. Uus töötaja Sofia alustab järgmisel nädalal. Esimesel päeval õpetab teda Liis.',
        [['Kes töötab esmaspäeva õhtul?', 'Markus'], ['Mitu vahetust on Annal sel nädalal?', 'neli|4'], ['Mitu inimest peab kolmapäeva hommikul tööl olema?', 'kaks|2'], ['Millal peab kirjutama, kui tahad vahetust vahetada?', 'kaks päeva varem|2 päeva varem'], ['Miks on õhtuvahetus rahaliselt parem?', 'palk on kõrgem|tunnis üks euro rohkem|palk on üks euro kõrgem'], ['Kes töötab pühapäeval?', 'Jaan']]),
      B.truefalse('063_p_tf', 'Kas see on õige?', 'Vaata graafikut. Kas lause on õige või vale?', [
        ['Liis töötab kolmapäeva hommikul.', true], ['Markus töötab hommikuti.', false], ['Jaan töötab nädalavahetusel.', true], ['Annal on teisipäeval vaba päev.', false], ['Reede õhtul on tööl Anna.', true],
      ]),
      // Harno A2 reading 5: a personal letter with option gaps
      B.cloze('063_p_cloze', 'Kiri tööandjale.', 'Vali igasse lünka sobiv sõna.', 'Tere!', [
        'Ma nägin teie kuulutust internetis. Ma tahan {*kandideerida|kandideerima|kandideerin} klienditeenindaja kohale. Varem töötasin ma kaks aastat {*müüjana|müüja|müüjat} toidupoes. Ma räägin eesti, vene ja inglise keelt.',
        'Mulle sobib töötada {*graafiku|graafik|graafikut} alusel. Ma saan tööd alustada {*järgmisel|järgmise|järgmist} nädalal. Minu CV on {*kirja|kiri|kirjas} lisas. Ootan teie {*vastust|vastus|vastusega}.',
        '',
        'Lugupidamisega, Sofia Ivanova',
      ]),
      B.transformation('063_p_trans', 'Kirjuta graafikust.', 'Kirjuta graafiku järgi täislause.', [
        ['Anna: E, hommikuvahetus 7–15', 'Esmaspäeval töötab Anna …', 'Esmaspäeval töötab Anna kella seitsmest kolmeni.|Esmaspäeval töötab Anna seitsmest kolmeni.'],
        ['Markus: K, õhtuvahetus', 'Kolmapäeval on Markusel …', 'Kolmapäeval on Markusel õhtuvahetus.'],
        ['Jaan: R–P', 'Jaan töötab …', 'Jaan töötab reedest pühapäevani.'],
        ['Liis: E vaba', 'Esmaspäeval on Liisil …', 'Esmaspäeval on Liisil vaba päev.'],
        ['Õhtul: +1 € tunnis', 'Õhtuvahetuses on palk …', 'Õhtuvahetuses on palk ühe euro võrra kõrgem.|Õhtuvahetuses on palk tunnis üks euro kõrgem.'],
      ]),
      B.wordorder('063_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Minu vahetus algab kell seitse hommikul.', 'Palk on kümme eurot tunnis.', 'Kas selles töös on kogemus vajalik?', 'Ma töötan esmaspäevast reedeni.', 'Ma tahan sellele kohale kandideerida.']),
      B.dialogue('063_p_dialog', 'Vahetuse vahetamine.', 'Täida dialoog. Vaata ka graafikut.', 'Anna', 'Markus', [
        ['A', 'Markus, kas sa saad laupäeval minu [vahetuse] võtta?'], ['B', 'Mis kell su vahetus [algab]?'], ['A', 'Kell kolm. Ja lõpeb kell [üksteist|23].'],
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
      B.text('063_t_situation', 'Uus olukord', 'Sinu sõber Jaan otsib tööd. Ta loeb eesti keelt veel aeglaselt. Jaan saatis sulle kolm töökuulutust. Tal on juhiluba ja ta saab töötada ainult tööpäevadel.'),
      B.reading('063_t_ads', 'Loe kolme kuulutust.', 'Loe kuulutused ja vasta küsimustele.', 'Kolm töökuulutust',
        'A. Pagariäri otsib müüjat. Tööaeg on E–R kella 7–15. Palk on 1200 eurot kuus. Eesti keel peab olema vähemalt A2 tasemel. Kogemus ei ole vajalik. Pakume tasuta kohvi ja saia. Kandideerimiseks helista juhatajale.\n\nB. Kullerfirma otsib autojuhti. Töö on E–R, vahetus kestab kella 9–18. Palk on 1500 eurot kuus. Vajalik on B-kategooria juhiluba. Kasuks tuleb Tallinna tundmine. Firma annab töötajale auto ja telefoni. Saada CV meie kodulehel.\n\nC. Hotell otsib koristajat nädalavahetuseks. Töö on laupäeval ja pühapäeval kella 10–16. Palk on 10 eurot tunnis. Kogemus tuleb kasuks. Hotell asub kesklinnas, bussipeatuse lähedal. Tule vestlusele esmaspäeval kell 12.',
        [['Mis töö sobib Jaanile kõige paremini?', 'B|autojuht|autojuhi töö|kullerfirma töö'], ['Miks ei sobi Jaanile töö C?', 'see on nädalavahetusel|töö on laupäeval ja pühapäeval'], ['Kui palju teenib koristaja ühel päeval?', 'kuuskümmend eurot|60 eurot|60'], ['Kuidas saab kandideerida autojuhi tööle?', 'saata CV kodulehel|kodulehel|saada CV'], ['Mitu tundi päevas töötab pagariäri müüja?', 'kaheksa|8|kaheksa tundi'], ['Mida annab kullerfirma töötajale?', 'auto ja telefoni|autot ja telefoni|auto ja telefon']]),
      B.table('063_t_table', 'Märkmed Jaanile.', 'Kirjuta igast kuulutusest kolm fakti.', 'Kuulutus, Tööaeg, Palk, Vajalik või kasuks', [
        'A müüja | [E–R 7–15/7–15] | [1200 eurot kuus/1200] | [eesti keel/eesti keel A2]', 'B autojuht | [E–R 9–18/9–18] | [1500 eurot kuus/1500] | [juhiluba/B-kategooria juhiluba]', 'C koristaja | [L–P 10–16/10–16] | [10 eurot tunnis/10] | [kogemus/kogemus tuleb kasuks]',
      ], 'g_read'),
      // Harno A2 listening 3: a voicemail, read twice, answers of 1–2 words
      B.listening('063_t_listen', 'Kuula tööandja sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Jaan! Siin on Kati kullerfirmast Kiirkuller.', 'Aitäh, et saatsite oma CV.', 'Me tahame teid vestlusele kutsuda.', 'Vestlus on neljapäeval kell üksteist.',
        'Meie kontor on Pärnu maanteel, maja number kakskümmend.', 'Võtke kaasa juhiluba ja isikutunnistus.', 'Esimesel nädalal sõidate koos kolleegiga.', 'Palun helistage mulle tagasi täna kella viieni. Head päeva!',
      ], ['Vestlus on [neljapäeval].', 'Vestlus algab kell [üksteist|11].', 'Kontor on Pärnu maanteel, maja number [kakskümmend|20].', 'Kaasa tuleb võtta juhiluba ja [isikutunnistus|isikutunnistuse].', 'Esimesel nädalal sõidab Jaan koos [kolleegiga].', 'Jaan peab helistama kella [viieni|5ni|17ni].']),
      B.choice('063_t_check', 'Mida see tähendab?', 'Loe kuulutuse rida. Vali õige tähendus.', [
        ['„Tööaeg graafiku alusel.”', 'Tööpäevad on igal nädalal erinevad.', 'Töö on ainult esmaspäeval.', 'Tööaega ei ole kirjas.'],
        ['„Kogemus tuleb kasuks.”', 'Kogemus on hea, aga mitte kohustuslik.', 'Ilma kogemuseta ei saa tööle.', 'Kogemus ei ole hea.'],
        ['„Palk 10 € tunnis bruto.”', 'Kümme eurot tunnis enne makse.', 'Kümme eurot päevas pärast makse.', 'Kümme eurot kuus.'],
        ['„Kandideerimine kuni 15. maini.”', 'CV peab tulema hiljemalt 15. mail.', 'Töö algab 15. mail.', 'Vestlus on 15. mail.'],
        ['„E–R 9–18.” Millal sa töötad?', 'Esmaspäevast reedeni kella üheksast kuueni.', 'Ainult esmaspäeval ja reedel.', 'Iga päev kella üheksast.'],
      ], 'full', 'g_read'),
      B.errorfix('063_t_fix', 'Kontrolli kirja.', 'Jaan kirjutas kirja. Paranda vead.', [
        ['Ma tahan kandideerima autojuhi kohale.', 'Ma tahan kandideerida autojuhi kohale.'], ['Mul on viis aastat kogemus.', 'Mul on viis aastat kogemust.|Mul on viie aasta kogemus.'],
        ['Ma töötasin kuller.', 'Ma töötasin kullerina.'], ['Ma saan töötada esmaspäevast reedel.', 'Ma saan töötada esmaspäevast reedeni.'], ['Mul on juhiluba B kategooriast.', 'Mul on B-kategooria juhiluba.'],
      ]),
      B.planning('063_t_plan', 'Enne kirja.', 'Mõtle, mida kirjutad tööandjale. Kirjuta märksõnad.', ['Kes sa oled?', 'Mis tööd sa tahad?', 'Mis kogemus sul on?', 'Millal saad alustada?', 'Kuidas sinuga ühendust võtta?']),
      B.writing('063_t_msg', 'Sõnum Jaanile.', 'Kirjuta Jaanile 5–7 lauset: mis töö sobib ja miks.', [5, 7], ['sobib', 'tööaeg', 'palk', 'sest'], 2),
      // Harno A2 writing 2: a short letter, at least 30 words
      B.letter('063_t_letter', 'Kandideeri!', 'Kirjuta kullerfirmale lühike kiri. Tutvusta ennast ja oma kogemust.', 'Tere!', 'Lugupidamisega', [30, 50]),
      B.rolecards('063_t_roles', 'Töövestlus telefonis.', 'Üks on Jaan, teine tööandja. Rääkige 2–3 minutit.',
        'Oled Jaan. Helistad kullerfirmasse. Küsi tööaja, palga ja auto kohta. Räägi oma kogemusest.', 'Oled kullerfirma juht. Küsi kogemuse ja juhiloa kohta. Vasta Jaani küsimustele.',
        ['Ma helistan kuulutuse pärast.', 'Mis kell vahetus algab?', 'Mul on … aastat kogemust.'], ['Kas teil on juhiluba?', 'Kas te tunnete Tallinna?', 'Tööaeg on…']),
      B.speaking('063_t_dream', 'Milline töö sulle sobib?', 'Räägi 1 minut: milline töö ja tööaeg sulle sobivad.', [
        'Mis ametit sa tahad?', 'Mis tööaeg sulle sobib?', 'Kui suur palk on hea?', 'Mis on tööl kõige tähtsam?',
      ], [60, 90], ['Mulle sobib töö…', 'Ma tahan töötada …-st …-ni.', 'Tööl on kõige tähtsam…']),
      B.selfcheck('063_t_self', ['Ma oskan leida kuulutusest tööaja, palga ja nõuded.', 'Ma oskan kasutada sõnu vahetus, tööaeg, palk, kogemus, vajalik.', 'Ma oskan öelda aega: esmaspäevast reedeni, kella seitsmest kolmeni.', 'Ma oskan valida sobiva töö ja kirjutada lühikese kandideerimiskirja.'], 'Leian sobiva töö'),
    ],
  },
};
