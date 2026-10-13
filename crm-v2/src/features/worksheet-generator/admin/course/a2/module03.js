// A2 course (A1 → A2 roadmap), module 3 „Päev, kell ja harjumused”, lessons a2-011 … a2-015 (written after module 2,
// owner 2026-10-13). The day and its parts (hommikul, päeval, õhtul, öösel; ärkan, lähen, tulen, söön, puhkan), the
// time (Kell on pool kolm / veerand neli / kolmveerand neli; kell seitse; kella üheksast kuni viieni; enne kella
// kümmet, pärast tööd; kestab tund aega), frequency and basic word order (alati, tavaliselt, sageli, mõnikord, harva,
// ei … mitte kunagi; kord nädalas; käin ujumas) and the week (esmaspäeval, reedel, nädalavahetusel, esmaspäeviti;
// kõigepealt, siis, pärast seda, aga, ja). Time and frequency are trained on the learner's own schedule, not on
// isolated sentences. Harno A2 formats: timetables and opening hours to read, announcements and phone calls to
// listen to (read twice, 1–2-word answers), a weekly plan of 70–90 words, talking about one's day.
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-03', course: 'a2', title: 'Päev, kell ja harjumused', level: 'A2' };

export const LESSONS = {
  'a2-011': {
    title: 'Minu päev',
    canDo: 'Ma räägin oma tavalisest päevast umbes poolteist minutit ja kasutan vähemalt kuut ajamarkerit (hommikul, päeval, õhtul, öösel, kell …, pärast tööd).',
    discover: [
      B.text('011_d_situation', 'Kaks erinevat päeva', 'Urmas on bussijuht ja ta ärkab väga vara. Tema naaber Kati on üliõpilane ja ta magab hommikul kaua. Nad elavad samas majas, aga nende päevad on väga erinevad.'),
      B.vocab('011_d_vocab', 'Minu päev', ['päev — день', 'hommikul — утром', 'päeval — днём', 'õhtul — вечером', 'öösel — ночью', 'ärkama — просыпаться', 'minema (lähen) — идти', 'tulema (tulen) — приходить', 'sööma (söön) — есть', 'puhkama — отдыхать', 'magama — спать', 'tavaline — обычный', 'hommikusöök — завтрак']),
      B.reading('011_d_read', 'Loe: Urmase päev.', 'Loe teksti ja vasta küsimustele lühidalt.', 'Bussijuhi päev',
        'Urmas ärkab iga päev kell viis. Ta joob kohvi ja sööb võileiba. Kell pool kuus läheb ta bussiparki. Hommikul on bussis palju inimesi. Nad sõidavad tööle ja kooli. Kell kaksteist on Urmasel lõuna. Ta sööb sööklas suppi. Päeval sõidab ta jälle. Kell kolm lõpeb tema tööpäev ja ta tuleb koju. Pärastlõunal ta puhkab natuke diivanil. Õhtul teeb ta koos naisega süüa. Pärast õhtusööki nad jalutavad pargis või vaatavad telekat. Urmas läheb magama vara, kell kümme. Öösel ta magab hästi, sest ta on väsinud. Laupäeval ja pühapäeval ei ärka Urmas kell viis. Siis ta magab kaheksani ja sõidab kalale.',
        [['Mis kell Urmas ärkab?', 'kell viis|viis|5'], ['Mida ta hommikul sööb?', 'võileiba|võileib'], ['Kus Urmas lõunat sööb?', 'sööklas'], ['Millal lõpeb tööpäev?', 'kell kolm|kolm|15'], ['Mida Urmas õhtul teeb?', 'teeb süüa|jalutab pargis|vaatab telekat'], ['Mida ta nädalavahetusel teeb?', 'sõidab kalale|magab kaheksani']]),
      B.truefalse('011_d_tf', 'Õige või vale?', 'Loe Urmase teksti uuesti.', [
        ['Urmas joob hommikul teed.', false], ['Lõuna on kell kaksteist.', true], ['Urmas tuleb koju kell viis.', false], ['Õhtul teeb Urmas naisega süüa.', true], ['Urmas läheb magama kell kümme.', true],
      ]),
      B.notice('011_d_notice', 'Märka: päeva osad ja tegusõnad', ['**hommikul** ärkan, **päeval** töötan, **õhtul** puhkan, **öösel** magan', 'minema: ma **lähen**, ta **läheb**, nad **lähevad**', 'tulema: ma **tulen**, ta **tuleb**', 'sööma: ma **söön**, ta **sööb**; jooma: ma **joon**, ta **joob**', 'tegema: ma **teen**, ta **teeb**', '**Kell viis** ärkan. **Kell pool kuus** lähen tööle.']),
      B.categorize('011_d_sort', 'Millal Urmas seda teeb?', 'Pane tegevused õigesse rühma.', [
        ['Hommikul', ['ärkab kell viis', 'joob kohvi', 'läheb bussiparki']], ['Päeval', ['sööb sööklas suppi', 'sõidab bussiga']], ['Õhtul', ['teeb süüa', 'jalutab pargis', 'vaatab telekat']], ['Öösel', ['magab hästi']],
      ], 'full', 'g_read'),
      B.wordforms('011_d_forms', 'Pööra tegusõna.', 'Kirjuta tegusõna õiges vormis.', [
        ['minema', 'ma', 'lähen'], ['tulema', 'ta', 'tuleb'], ['sööma', 'me', 'sööme'], ['jooma', 'ta', 'joob'],
        ['tegema', 'nad', 'teevad'], ['ärkama', 'sa', 'ärkad'], ['magama', 'ta (eitus)', 'ei maga'], ['puhkama', 'te', 'puhkate'],
      ]),
      B.match('011_d_match', 'Mida ma teen?', 'Ühenda olukord ja tegevus.', [
        ['Ma olen väsinud.', 'Ma lähen magama.'], ['Ma olen näljane.', 'Ma söön.'], ['Kell on seitse hommikul.', 'Ma ärkan.'],
        ['Tööpäev on läbi.', 'Ma tulen koju.'], ['On laupäev.', 'Ma puhkan.'], ['Mul on janu.', 'Ma joon vett.'],
      ]),
      B.gaps('011_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Kell seitse [hommikul] ma ärkan.', 'Kell üks [öösel] ma juba magan.', 'Ma [ärkan] kell seitse ja joon kohvi.', 'Kell kaheksa ma [lähen] tööle.', 'Kell viis ma [tulen] töölt koju.', 'Pärast tööd ma [puhkan] diivanil.',
      ], ['hommikul', 'öösel', 'ärkan', 'lähen', 'tulen', 'puhkan', 'päeval', 'sööb']),
      B.wordorder('011_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Ma ärkan iga päev kell seitse.', 'Hommikul ma joon kohvi.', 'Pärast tööd ma tulen koju.', 'Õhtul me vaatame telekat.', 'Öösel ma magan hästi.']),
      B.listening('011_d_listen', 'Kuulamine. Kati päev.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Kati: Minu päev algab hilja.', 'Ma ärkan kell üheksa.', 'Hommikul söön ma putru ja joon teed.', 'Kell kümme lähen ma ülikooli.',
        'Päeval on mul loengud ja lõunat söön ma sööklas.', 'Õhtul ma laulan kooris või loen.', 'Ma lähen magama hilja, kell üks öösel.',
      ], ['Kati ärkab kell [üheksa|9].', 'Hommikul sööb ta [putru].', 'Kell kümme läheb ta [ülikooli].', 'Lõunat sööb ta [sööklas].', 'Õhtul laulab ta [kooris].', 'Kati läheb magama kell [üks|1].']),
      B.errorfix('011_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma lähe tööle kell kaheksa.', 'Ma lähen tööle kell kaheksa.'], ['Ta söön hommikul putru.', 'Ta sööb hommikul putru.'], ['Hommikus ma joon kohvi.', 'Hommikul ma joon kohvi.'],
        ['Me tuleb koju kell viis.', 'Me tuleme koju kell viis.'], ['Õhtu ma puhkan.', 'Õhtul ma puhkan.'], ['Nad magab kaheksa tundi.', 'Nad magavad kaheksa tundi.'],
      ]),
      B.translation('011_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Утром я пью кофе.', 'Я иду на работу в восемь.', 'Вечером мы отдыхаем.', 'Ночью я сплю.', 'После работы я прихожу домой.', 'Ребёнок спит десять часов.']),
      B.speaking('011_d_say', 'Minu tavaline päev.', 'Räägi oma päevast umbes poolteist minutit.', ['Mis kell sa ärkad?', 'Mida sa hommikul teed?', 'Mida sa päeval teed?', 'Mida sa õhtul teed?', 'Mis kell sa magama lähed?'], [60, 120], ['Hommikul ma…', 'Päeval…', 'Õhtul…', 'Öösel…']),
      B.writing('011_d_write', 'Minu päev', 'Kirjuta oma päevast 6–8 lauset. Kasuta: hommikul, päeval, õhtul.', [6, 8], ['hommikul', 'päeval', 'õhtul', 'kell'], 3),
      B.selfcheck('011_d_self', ['Ma nimetan päeva osi: hommikul, päeval, õhtul, öösel.', 'Ma pööran: lähen, tulen, söön, joon, teen.', 'Ma saan aru tekstist kellegi päeva kohta.', 'Ma räägin oma päevast poolteist minutit.'], 'Minu päev'),
    ],
    practice: [
      B.listening('011_p_listen', 'Kuulamine. Kaks päeva.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Anna: Tööpäeval ma ärkan kell kuus.', 'Ma viin lapsed kooli ja lasteaeda.', 'Kell kaheksa olen ma juba tööl.', 'Ma tulen koju kell viis ja teen süüa.',
        'Laupäeval ma ärkan alles kell üheksa.', 'Me sööme kogu perega hommikusööki.', 'Päeval me käime metsas või ujumas.',
      ], ['Tööpäeval ärkab Anna kell [kuus|6].', 'Anna viib [lapsed] kooli ja lasteaeda.', 'Kell kaheksa on ta [tööl].', 'Laupäeval ärkab ta kell [üheksa|9].', 'Laupäeval sööb pere koos [hommikusööki].', 'Päeval käivad nad metsas või [ujumas].']),
      B.categorize('011_p_sort', 'Tööpäev või laupäev?', 'Pane Anna tegevused õigesse rühma.', [
        ['Tööpäeval', ['ärkab kell kuus', 'viib lapsed kooli', 'on kell kaheksa tööl']], ['Laupäeval', ['ärkab kell üheksa', 'sööb perega hommikusööki', 'käib metsas']],
      ], 'full', 'g_read'),
      B.gaps('011_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma [lähen] tööle bussiga. (minema)', 'Lapsed [tulevad] koolist kell kaks. (tulema)', 'Me [sööme] õhtul kell seitse. (sööma)', 'Kas sa [jood] hommikul kohvi? (jooma)', 'Isa [teeb] õhtul süüa. (tegema)', 'Laps [magab] kümme tundi. (magama)',
      ]),
      B.choice('011_p_choice', 'Vali õige vorm.', 'Vali lünka sobiv sõna.', [
        ['Hommikul ma ___ kell seitse.', 'ärkan', 'ärkab', 'ärkama'], ['Kati ___ ülikooli kell kümme.', 'läheb', 'lähen', 'minema'], ['Õhtul me ___ telekat.', 'vaatame', 'vaatavad', 'vaatan'],
        ['___ ma magan.', 'Öösel', 'Ööl', 'Öö'], ['Mis kell sa koju ___?', 'tuled', 'tuleb', 'tulen'], ['Pärast tööd ta ___ diivanil.', 'puhkab', 'puhkan', 'puhkame'],
      ], 'full', 'g_notice'),
      B.transformation('011_p_he', 'Ma → tema.', 'Kirjuta lause uue alusega.', [
        ['Ma ärkan kell kuus.', 'Urmas …', 'Urmas ärkab kell kuus.'], ['Ma lähen ülikooli.', 'Kati …', 'Kati läheb ülikooli.'], ['Ma söön putru.', 'Laps …', 'Laps sööb putru.'],
        ['Ma joon teed.', 'Mu ema …', 'Mu ema joob teed.'], ['Ma teen kodutööd.', 'Me …', 'Me teeme kodutööd.'], ['Ma tulen hilja koju.', 'Nad …', 'Nad tulevad hilja koju.'],
      ]),
      B.wordorder('011_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kell seitse ma joon kohvi.', 'Pärast lõunat ma töötan edasi.', 'Õhtul me jalutame pargis.', 'Laupäeval ma magan kaua.', 'Mis kell sa tavaliselt ärkad?']),
      B.manymatch('011_p_time', 'Mis kell?', 'Ühenda kellaaeg ja tegevus.', ['kell 7 hommikul', 'kell 12 päeval', 'kell 4 päeval', 'kell 7 õhtul', 'kell 2 öösel'], ['Ma söön hommikusööki.', 'Ma söön lõunat.', 'Ma tulen töölt koju.', 'Ma söön õhtusööki.', 'Ma magan.']),
      B.crossword('011_p_cross', 'Päeva sõnad.', 'Kirjuta sõna vihje järgi.', [
        ['Sa avad hommikul silmad', 'ärkama'], ['Sa oled öösel voodis', 'magama'], ['Esimene söök päeval', 'hommikusöök'],
        ['Aeg pärast päeva, enne ööd', 'õhtu'], ['Sa ei tööta, sa …', 'puhkama'], ['Mitte eriline, vaid …', 'tavaline'],
      ]),
      B.dialogue('011_p_dialog', 'Varajane ärkaja.', 'Täida dialoog sobivate sõnadega.', 'Liis', 'Jaan', [
        ['A', 'Jaan, mis kell sa hommikul [ärkad]?'], ['B', 'Ma ärkan kell kuus. Kell seitse ma [lähen] tööle.'], ['A', 'Nii vara! Ja mis kell sa koju [tuled]?'],
        ['B', 'Ma tulen koju kell neli. Siis ma [söön] ja puhkan.'], ['A', 'Ja mida sa teed [õhtul]?'], ['B', 'Õhtul mängin ma korvpalli. Ja mis kell sina [magama] lähed?'],
        ['A', 'Mina lähen magama hilja, kell kaksteist.'],
      ]),
      B.dictation('011_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma ärkan kell pool seitse.', 'Hommikul ma söön putru.', 'Päeval ma töötan kontoris.', 'Õhtul me vaatame filmi.', 'Öösel ma magan.'], 5),
      B.translation('011_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Во сколько ты просыпаешься?', 'Я ем кашу на завтрак.', 'Днём я работаю.', 'В субботу я сплю долго.', 'Мы обедаем в двенадцать.', 'Вечером он отдыхает.']),
      B.rolecards('011_p_roles', 'Intervjuu ajakirjale.', 'Üks on ajakirjanik, teine räägib oma päevast.', 'Oled ajakirjanik. Küsi vähemalt viis küsimust: mis kell ta ärkab, mida teeb hommikul, päeval ja õhtul.', 'Räägi oma tavalisest päevast. Ütle iga tegevuse juurde aeg või päeva osa.', ['Mis kell te ärkate?', 'Mida te päeval teete?'], ['Tavaliselt ma…', 'Kell … ma …', 'Õhtul ma…']),
      B.speaking('011_p_say', 'Kaks päeva.', 'Räägi, kuidas sinu tööpäev ja laupäev on erinevad.', ['Mis kell sa tööpäeval ärkad? Aga laupäeval?', 'Mida sa tööpäeval teed?', 'Mida sa laupäeval teed?', 'Kumb päev sulle rohkem meeldib?'], [60, 90]),
      B.writing('011_p_write', 'Paarilise päev.', 'Küsi paarilise päeva kohta. Kirjuta 5–7 lauset.', [5, 7], ['hommikul', 'ärkab', 'läheb'], 2),
      B.selfcheck('011_p_self', ['Ma kuulen, mis kell keegi midagi teeb.', 'Ma kasutan vorme lähen, tuleb, sööme, joob.', 'Ma küsin teise inimese päeva kohta.', 'Ma kirjutan teise inimese päevast.'], 'Päev on selge'),
    ],
    transfer: [
      B.text('011_t_situation', 'Üks päev minu elus', 'Keelekursuse ajakiri teeb rubriiki „Üks päev minu elus”. Toimetaja Liis otsib inimesi, kes kirjutavad oma tavalisest päevast. Sina tahad ka kirjutada.'),
      B.reading('011_t_read', 'Loe Markuse lugu.', 'Loe ajakirja teksti ja vasta küsimustele.', 'Üks päev minu elus: Markus',
        'Minu päev algab kell seitse. Kõigepealt ma joon kohvi ja loen uudiseid. Kell kaheksa sõidan ma rattaga tööle. Ma töötan laos. Tööl ma kontrollin kaste ja pakin kaupa. Kell kaksteist on lõuna. Me sööme kolleegidega lao köögis. Pärastlõunal tulevad sageli uued autod kaubaga. Kell viis lõpeb mu tööpäev. Siis ma lähen jõusaali. Kell seitse tulen ma koju ja teen õhtusööki. Õhtul ma helistan oma emale. Mõnikord ma mängin arvutimänge. Kell üksteist lähen ma magama. Minu päev on tavaline, aga mulle meeldib see. Nädalavahetusel on mu päev hoopis teistsugune.',
        [['Kuidas Markus tööle sõidab?', 'rattaga'], ['Mida Markus tööl teeb?', 'kontrollib kaste ja pakib kaupa|kontrollib kaste|pakib kaupa|töötab laos'], ['Kus ta lõunat sööb?', 'lao köögis|köögis'], ['Kuhu ta läheb pärast tööd?', 'jõusaali'], ['Kellele ta õhtul helistab?', 'emale|oma emale']]),
      B.truefalse('011_t_tf', 'Õige või vale?', 'Loe Markuse teksti uuesti.', [['Markus sõidab tööle bussiga.', false], ['Lõuna on kell kaksteist.', true], ['Pärast tööd läheb Markus koju.', false], ['Õhtul helistab ta emale.', true], ['Markus läheb magama kell üksteist.', true]]),
      B.listening('011_t_listen', 'Kuula Liisi sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin Liis ajakirjast.', 'Aitäh, et tahad ajakirja kirjutada!', 'Palun saada tekst reedeks.', 'Tekst peab olema umbes viiskümmend sõna pikk.',
        'Lisa ka üks foto oma päevast.', 'Intervjuu on teisipäeval kell neli.',
      ], ['Liis töötab [ajakirjas].', 'Tekst peab olema valmis [reedeks].', 'Tekst on umbes [viiskümmend|50] sõna.', 'Lisa ka üks [foto].', 'Intervjuu on [teisipäeval] kell neli.']),
      B.gaps('011_t_gaps', 'Minu päeva sõnad.', 'Vali sõnapangast sobiv sõna.', [
        'Kell seitse ma [ärkan].', 'Kõigepealt ma [joon] kohvi.', 'Kell kaheksa ma [lähen] tööle.', 'Kell viis ma [tulen] koju.', 'Õhtul ma [puhkan] ja loen.', 'Kell üksteist ma lähen [magama].',
      ], ['ärkan', 'joon', 'lähen', 'tulen', 'puhkan', 'magama', 'sööb', 'õhtul']),
      B.wordorder('011_t_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Minu päev algab kell seitse.', 'Kell kaheksa ma sõidan tööle.', 'Lõunat ma söön kolleegidega.', 'Õhtul ma helistan perele.', 'Mulle meeldib minu päev.']),
      B.translation('011_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Мой день начинается в шесть.', 'Сначала я пью кофе.', 'В восемь я еду на работу.', 'Вечером я звоню маме.', 'Мне нравится мой день.']),
      B.planning('011_t_plan', 'Enne kirjutamist.', 'Kirjuta märksõnad oma päeva kohta.', ['Hommik: mis kell, mida teed?', 'Päev: kus oled, mida teed?', 'Õhtu ja öö: mida teed, mis kell magama?'], 2),
      B.letter('011_t_letter', 'Tekst ajakirjale.', 'Kirjuta ajakirjale 40–60 sõna: üks päev sinu elus.', 'Üks päev minu elus', 'Kirjutas: …', [40, 60]),
      B.speaking('011_t_say', 'Intervjuu.', 'Toimetaja küsib sinu päeva kohta. Räägi umbes poolteist minutit.', ['Mis kell sinu päev algab?', 'Mida sa hommikul teed?', 'Mida sa päeval teed?', 'Mida sa õhtul teed?', 'Mis sulle sinu päevas meeldib?'], [60, 120]),
      B.rolecards('011_t_roles', 'Kaks päeva.', 'Võrrelge oma päevi. Leidke kaks erinevust.', 'Sa töötad kontoris. Räägi oma päevast ja küsi, mida paariline teeb hommikul ja õhtul.', 'Sa oled üliõpilane või töötad õhtul. Räägi oma päevast ja küsi, mis kell paariline ärkab ja magama läheb.', ['Ma ärkan kell …', 'Päeval ma …'], ['Aga sina?', 'Mis kell sa …?']),
      B.writing('011_t_write', 'Sõnum sõbrale.', 'Kirjuta sõbrale 5–7 lauset oma tänasest päevast.', [5, 7], ['hommikul', 'päeval', 'õhtul'], 2),
      B.rubric('011_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Tekstis on vähemalt kuus ajamarkerit (hommikul, kell …, õhtul).', 'Tegevused on loogilises järjekorras.', 'Tegusõnad on õiges vormis: lähen, tulen, söön.', 'Suuline tekst kestab umbes poolteist minutit.']),
      B.selfcheck('011_t_self', ['Ma kirjutan ajakirjale oma päevast.', 'Ma räägin oma päevast intervjuus.', 'Ma võrdlen oma päeva teise inimese päevaga.', 'Ma saan aru sõnumist: aeg ja ülesanne.'], 'Päev on kirjas'),
    ],
  },

  'a2-012': {
    title: 'Kellaaeg ja ajaväljendid',
    canDo: 'Ma ütlen ja saan aru, mis kell midagi algab ja lõpeb ning kui kaua see kestab (pool kolm, kella üheksast viieni, enne / pärast) vähemalt 8 olukorras 10-st.',
    discover: [
      B.text('012_d_situation', 'Oksana kiire päev', 'Oksanal on täna palju asju teha: raamatukogu, juuksur, apteek ja lasteaed. Igal kohal on oma lahtiolekuaeg. Oksana vaatab kella ja plaanib päeva.'),
      B.vocab('012_d_vocab', 'Kell ja aeg', ['kell — час, часы', 'pool — половина', 'veerand — четверть', 'kolmveerand — три четверти', 'alates — начиная с', 'kuni — до', 'enne — до, перед', 'pärast — после', 'algama — начинаться', 'lõppema — заканчиваться', 'kestma — длиться', 'tund — час, урок', 'minut — минута']),
      B.clock('012_d_clock', 'Mis kell on?', 'Kirjuta, mis kell on. Kasuta: Kell on …', [
        { time: '07:00', extra: '' }, { time: '08:30', extra: '' }, { time: '09:15', extra: 'veerand kümme' }, { time: '12:00', extra: '' },
        { time: '14:30', extra: '' }, { time: '16:45', extra: 'kolmveerand viis' }, { time: '18:15', extra: 'veerand seitse' }, { time: '21:30', extra: '' },
      ]),
      B.reading('012_d_read', 'Loe: Oksana päev.', 'Loe teksti ja vasta küsimustele lühidalt.', 'Kõik õigel ajal',
        'Oksana tahab täna teha palju asju. Kõigepealt läheb ta raamatukokku. Raamatukogu on avatud kella kümnest kuni kuueni. Oksana läheb sinna kohe kell kümme, sest siis on seal vaikne. Kell pool kaksteist on tal aeg juuksuris. Juuksur töötab ainult kella üheksast kella kolmeni. Lõikus kestab umbes tund aega. Pärast juuksurit läheb Oksana apteeki. Apteek on lahti kogu päeva, kella kaheksast kuni kaheksani. Mia lasteaiapäev lõpeb kell kolm. Oksana peab olema lasteaias enne kella nelja, sest kell neli läheb lasteaed kinni. Õhtul kell seitse algab Oksana eesti keele tund. Tund kestab poolteist tundi ja lõpeb kell pool üheksa. Pärast tundi läheb Oksana koju ja puhkab.',
        [['Mis kellast mis kellani on raamatukogu avatud?', 'kella kümnest kuni kuueni|kümnest kuueni|10–18'], ['Mis kell on Oksanal aeg juuksuris?', 'kell pool kaksteist|pool kaksteist|11.30'], ['Kui kaua lõikus kestab?', 'umbes tund aega|tund aega|tund'], ['Millal peab Oksana olema lasteaias?', 'enne kella nelja|enne nelja'], ['Mis kell algab eesti keele tund?', 'kell seitse|19|kell 19'], ['Kui kaua tund kestab?', 'poolteist tundi|90 minutit']]),
      B.truefalse('012_d_tf', 'Õige või vale?', 'Loe Oksana teksti uuesti.', [
        ['Raamatukogu on avatud kella kümnest.', true], ['Juuksur töötab kella kaheksani õhtul.', false], ['Apteek on lahti kogu päeva.', true], ['Lasteaed läheb kinni kell kuus.', false], ['Eesti keele tund lõpeb kell pool üheksa.', true],
      ]),
      B.notice('012_d_notice', 'Märka: kellaaeg', ['Kell on **pool kolm** (2.30). Kell on **veerand neli** (3.15). Kell on **kolmveerand neli** (3.45).', '**Mis kell** tund algab? — **Kell** seitse.', '**alates** kella kümne**st** — **kuni** kella kuue**ni**', 'kella üheksa**st** kella kolme**ni** (9–15)', '**enne** kella nelja, **pärast** kella kolme; **enne** tööd, **pärast** tundi', 'Tund **algab** kell 7, **lõpeb** kell 8.30 ja **kestab** poolteist tundi.']),
      B.match('012_d_match', 'Kellaaeg sõnadega.', 'Ühenda kellaaeg ja sõnad.', [['7.30', 'pool kaheksa'], ['9.15', 'veerand kümme'], ['10.45', 'kolmveerand üksteist'], ['12.30', 'pool üks'], ['15.15', 'veerand neli'], ['18.45', 'kolmveerand seitse']]),
      B.table('012_d_table', 'Kust kuni?', 'Kirjuta arv õiges vormis.', 'Arv, Alates (kella …st), Kuni (kella …ni)', ['üheksa | [üheksast] | [üheksani]', 'kümme | [kümnest] | [kümneni]', 'viis | [viiest] | [viieni]', 'kolm | [kolmest] | [kolmeni]', 'kaheksa | [kaheksast] | [kaheksani]', 'kuus | [kuuest] | [kuueni]'], 'g_notice'),
      B.gaps('012_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Pood on avatud [alates] kella kaheksast.', 'Ma töötan kella üheksast [kuni] viieni.', 'Tund algab kell kümme. Tule palun [enne] kella kümmet!', 'Töö lõpeb kell viis. [Pärast] tööd ma lähen poodi.', 'Film [algab] kell seitse.', 'Koosolek [kestab] tund aega.',
      ], ['alates', 'kuni', 'enne', 'Pärast', 'algab', 'kestab', 'pool', 'lõpeb']),
      B.choice('012_d_choice', 'Vali õige vastus.', 'Vali lünka sobiv sõna.', [
        ['Mis kell on? (14.30)', 'Kell on pool kolm.', 'Kell on pool kaks.', 'Kell on kolm.'], ['Pood on avatud kella üheksast kuni ___.', 'kuueni', 'kuus', 'kuuest'],
        ['Kell on 8.15. Kell on ___ üheksa.', 'veerand', 'pool', 'kolmveerand'], ['Film algab ___ seitse.', 'kell', 'kella', 'kellal'],
        ['Ma tulen ___ kella kahte.', 'pärast', 'alates', 'kuni'], ['Tund kestab ___ tundi.', 'poolteist', 'pool kaks', 'veerand'],
      ], 'full', 'g_notice'),
      B.listening('012_d_listen', 'Kuulamine. Telefonis.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Hambaarst Kask, tere!', '— Tere! Mul on vaja aega hambaarsti juurde.', '— Kas neljapäev sobib? Meil on vaba aeg kell veerand kaksteist.',
        '— Kahjuks ma töötan kella üheksast kella neljani. Kas pärast nelja on aega?', '— Jah, kell pool viis.', '— Väga hea. Kui kaua see kestab?', '— Umbes pool tundi. Palun tulge kümme minutit varem.',
      ], ['Vaba aeg on [neljapäeval] kell veerand kaksteist.', 'Helistaja töötab kella üheksast kella [neljani].', 'Uus aeg on kell [pool viis|16.30].', 'Visiit kestab umbes [pool tundi].', 'Tuleb tulla kümme minutit [varem].']),
      B.wordorder('012_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Raamatukogu on avatud kella kümnest kuueni.', 'Tund algab kell seitse õhtul.', 'Tule palun enne kella nelja.', 'Film kestab kaks tundi.', 'Pärast tundi ma lähen koju.']),
      B.errorfix('012_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Kell on pool kolme.', 'Kell on pool kolm.'], ['Pood on avatud kella üheksa kuni viis.', 'Pood on avatud kella üheksast kuni viieni.'], ['Ma tulen pärast kell kolm.', 'Ma tulen pärast kella kolme.'],
        ['Film algab kella seitse.', 'Film algab kell seitse.'], ['Tund kestab poolteist tund.', 'Tund kestab poolteist tundi.'],
      ]),
      B.dictation('012_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kell on veerand viis.', 'Pood on avatud kella kümnest kuueni.', 'Tule enne kella kolme.', 'Film kestab poolteist tundi.', 'Pärast lõunat on koosolek.'], 5),
      B.speaking('012_d_say', 'Minu kellaajad.', 'Räägi, mis kell sinu päeva tegevused algavad ja lõpevad.', ['Mis kell sa ärkad?', 'Mis kell algab ja lõpeb sinu töö või kool?', 'Kui kaua sa sõidad tööle?', 'Mida sa teed pärast tööd?', 'Mis kell sa magama lähed?'], [60, 90], ['Kell … ma …', 'Kella …st kuni …ni', 'See kestab …']),
      B.writing('012_d_write', 'Minu kellaajad', 'Kirjuta 5–7 lauset: mis kell ja kui kaua sa midagi teed.', [5, 7], ['kell', 'kuni', 'kestab'], 2),
      B.selfcheck('012_d_self', ['Ma ütlen kellaaega: pool kolm, veerand neli.', 'Ma ütlen: kella üheksast kuni viieni.', 'Ma kasutan sõnu enne ja pärast.', 'Ma saan aru lahtiolekuaegadest.'], 'Kell on selge'),
    ],
    practice: [
      B.clock('012_p_clock', 'Mis kell on?', 'Kirjuta kellaaeg sõnadega.', [
        { time: '06:30', extra: '' }, { time: '10:15', extra: 'veerand üksteist' }, { time: '13:45', extra: 'kolmveerand kaks' }, { time: '17:00', extra: '' }, { time: '19:30', extra: '' }, { time: '22:15', extra: 'veerand üksteist' },
      ]),
      B.listening('012_p_listen', 'Kuulamine. Jaama teadaanne.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tähelepanu! Rong Tartusse väljub kell kümme viisteist.', 'Rong on täna kümme minutit hiljem.', 'Uus väljumisaeg on kell kümme kakskümmend viis.',
        'Sõit kestab kaks tundi.', 'Kohvik rongis on avatud kella üheteistkümnest.',
      ], ['Rong sõidab [Tartusse].', 'Rong on täna [kümme|10] minutit hiljem.', 'Uus väljumisaeg on kell [10.25|kümme kakskümmend viis].', 'Sõit kestab [kaks|2] tundi.', 'Kohvik on avatud kella [üheteistkümnest|11-st].']),
      B.reading('012_p_read', 'Loe: Raamatukogu.', 'Loe teadet ja vasta küsimustele.', 'Linnaraamatukogu lahtiolekuajad',
        'Raamatukogu on avatud esmaspäevast reedeni kella kümnest kuni seitsmeni. Laupäeval on raamatukogu avatud kella kümnest kuni kolmeni. Pühapäeval on raamatukogu suletud. Lastetuba on avatud iga päev alates kella kaheteistkümnest. Eesti keele vestlusring on kolmapäeviti kell 17.30–19.00. Vestlusring kestab poolteist tundi ja on tasuta. Arvuteid saab kasutada tasuta, üks kord päevas kuni tund aega. Raamatuid saab laenutada neljaks nädalaks. Kui tood raamatu hiljem, maksad 10 senti päevas. Uued raamatud on esimesel korrusel. Raamatukogus on ka kohvik. See on avatud kella üheteistkümnest kuni kuueni.',
        [['Mis kellast mis kellani on raamatukogu laupäeval avatud?', 'kella kümnest kuni kolmeni|kümnest kolmeni|10–15'], ['Millal on raamatukogu suletud?', 'pühapäeval'], ['Mis päeval on vestlusring?', 'kolmapäeviti|kolmapäeval'], ['Kui kaua vestlusring kestab?', 'poolteist tundi|90 minutit'], ['Kui kaua võib arvutit kasutada?', 'tund aega|kuni tund aega|tund'], ['Mis kellast on lastetuba avatud?', 'kella kaheteistkümnest|alates kella kaheteistkümnest|12']]),
      B.wordforms('012_p_forms', 'Kust? Kuhuni?', 'Kirjuta arv õiges vormis.', [
        ['üheksa', 'alates kella …', 'üheksast'], ['viis', 'kuni kella …', 'viieni'], ['kaheksa', 'alates kella …', 'kaheksast'], ['kuus', 'kuni kella …', 'kuueni'],
        ['seitse', 'alates kella …', 'seitsmest'], ['kaksteist', 'kuni kella …', 'kaheteistkümneni'], ['neli', 'enne kella …', 'nelja'], ['kaks', 'pärast kella …', 'kahte'],
      ]),
      B.transformation('012_p_words', 'Kirjuta sõnadega.', 'Kirjuta kellaaeg sõnadega.', [
        ['Pood on avatud 9–18.', 'Pood on avatud kella …', 'Pood on avatud kella üheksast kuni kuueni.|Pood on avatud kella üheksast kuueni.'],
        ['Tund algab 17.30.', 'Tund algab kell …', 'Tund algab kell pool kuus.'], ['Film algab 20.15.', 'Film algab kell …', 'Film algab kell veerand üheksa.'],
        ['Ma töötan 8–16.', 'Ma töötan kella …', 'Ma töötan kella kaheksast kuni neljani.|Ma töötan kella kaheksast neljani.'],
        ['Buss tuleb 10.45.', 'Buss tuleb kell …', 'Buss tuleb kell kolmveerand üksteist.'], ['Koosolek kestab 60 minutit.', 'Koosolek kestab …', 'Koosolek kestab tund aega.|Koosolek kestab ühe tunni.'],
      ]),
      B.dialogue('012_p_dialog', 'Kokkulepe telefonis.', 'Täida dialoog sobivate sõnadega.', 'Anna', 'Liis', [
        ['A', 'Tere, Liis! Kas me saame homme kokku?'], ['B', 'Jah! Mis [kell] sulle sobib?'], ['A', 'Ma töötan kella üheksast kuni viieni. [Pärast] tööd olen vaba.'],
        ['B', 'Hea. Kas kell pool kuus sobib? Kohvik on avatud kella kaheksani.'], ['A', 'Väga hea, siis on meil aega [kaks|2] ja pool tundi.'],
        ['B', 'Aga ma ei tohi hiljaks jääda. Ma pean olema kodus [enne] kella üheksat.'], ['A', 'Pole probleemi. Kohtume homme kell [pool kuus]!'],
      ]),
      B.manymatch('012_p_qa', 'Küsimus ja vastus.', 'Ühenda küsimus ja vastus.', ['Mis kell on?', 'Mis kell film algab?', 'Kui kaua film kestab?', 'Mis kellast mis kellani pood on avatud?', 'Millal sa tuled?'], ['Kell on pool neli.', 'Kell seitse.', 'Kaks tundi.', 'Kella üheksast kuueni.', 'Pärast tööd.'], 'full', 'g_use'),
      B.dictation('012_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kell on kolmveerand kaks.', 'Raamatukogu on avatud kella kümnest.', 'Tule pärast kella viit.', 'Koosolek kestab tund aega.', 'Rong väljub kell pool üksteist.'], 5),
      B.translation('012_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Который час? Половина третьего.', 'Магазин открыт с девяти до шести.', 'Приходи до пяти.', 'Урок длится полтора часа.', 'После работы я иду домой.', 'Фильм начинается в четверть восьмого.']),
      B.speaking('012_p_say', 'Küsi aega.', 'Küsi paariliselt, mis kell ta midagi teeb. Vasta täislausega.', ['Mis kell sa tööle või kooli lähed?', 'Mis kellast mis kellani sa töötad?', 'Kui kaua sa sõidad koju?', 'Mida sa teed pärast tööd?'], [45, 90]),
      B.rolecards('012_p_roles', 'Info telefonis.', 'Üks helistab ja küsib, teine vastab.', 'Helista spordiklubisse. Küsi: mis kellast mis kellani klubi on avatud, mis kell algab jooga ja kui kaua see kestab.', 'Töötad spordiklubis. Klubi on avatud 7–22, jooga algab 18.30 ja kestab tund aega. Vasta küsimustele.', ['Mis kellast …?', 'Kui kaua …?'], ['Me oleme avatud kella …st kuni …ni.', 'Tund kestab …']),
      B.writing('012_p_write', 'Sõnum sõbrale.', 'Kirjuta sõbrale 4–6 lauset: millal ja kus te kohtute.', [4, 6], ['kell', 'pärast', 'kuni'], 2),
      B.selfcheck('012_p_self', ['Ma kirjutan kellaaja sõnadega.', 'Ma moodustan: kella üheksast, kella viieni.', 'Ma saan aru teadaandest ja lahtiolekuaegadest.', 'Ma lepin telefonis aja kokku.'], 'Aeg on kokku lepitud'),
    ],
    transfer: [
      B.text('012_t_situation', 'Kinno!', 'Anna ja Liis tahavad koos kinno minna. Aga Anna töötab palju ja Liisil on tunnid ja töö raamatukogus. Nad vaatavad kalendrit ja otsivad aega. Sina aitad neil sobiva aja leida.'),
      B.reading('012_t_read', 'Loe kino kava.', 'Loe kava ja vasta küsimustele.', 'Kino „Sõprus” sel nädalal',
        'Film „Suvi” on draama ja kestab kaks tundi. Kinos on kaks saali. Neljapäeval on seansid kell 18.15 ja 20.30. Reedel on seansid kell 19.00 ja 21.15. Laupäeval on need kell 15.00 ja 18.45. Pilet maksab 8 eurot, õpilastele 6 eurot. Kassa on avatud pool tundi enne esimest seanssi. Kohvik on avatud kella neljast kuni kümneni. Palun tulge kinno vähemalt kümme minutit enne filmi algust. Pärast kella üheksat on parkimine tasuta. Laupäeva hommikul kell 11 näitame lastefilmi. See kestab tund aega. Head vaatamist!',
        [['Kui kaua film „Suvi” kestab?', 'kaks tundi|2 tundi'], ['Mis kell on reedel esimene seanss?', 'kell 19.00|kell seitse|seitse'], ['Kui palju maksab õpilase pilet?', '6 eurot|kuus eurot'], ['Millal on kassa avatud?', 'pool tundi enne esimest seanssi'], ['Mis kellast on kohvik avatud?', 'kella neljast|16.00'], ['Millal on parkimine tasuta?', 'pärast kella üheksat|pärast üheksat']]),
      B.listening('012_t_listen', 'Kuula Liisi sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Anna! Siin Liis.', 'Neljapäeval ma ei saa, mul on tunnid kella kuueni.', 'Reedel olen ma vaba pärast kella viit.',
        'Laupäeval töötan ma raamatukogus kella kaheteistkümnest kuni neljani.', 'Kas reede õhtu sobib? Seanss on kell seitse.', 'Helista mulle pärast lõunat!',
      ], ['Neljapäeval on Liisil tunnid kella [kuueni].', 'Reedel on Liis vaba pärast kella [viit|viite|viie].', 'Laupäeval töötab Liis [raamatukogus].', 'Liis pakub [reede] õhtut.', 'Seanss on kell [seitse|7|19].']),
      B.clock('012_t_clock', 'Seansside ajad.', 'Kirjuta kino kava kellaajad sõnadega.', [
        { time: '18:15', extra: 'veerand seitse' }, { time: '20:30', extra: '' }, { time: '19:00', extra: '' }, { time: '21:15', extra: 'veerand kümme' }, { time: '15:00', extra: '' }, { time: '18:45', extra: 'kolmveerand seitse' },
      ]),
      B.table('012_t_week', 'Minu nädala ajad.', 'Kirjuta, mis kellast mis kellani sa oled hõivatud.', 'Päev, Mis kellast?, Mis kellani?, Mida ma teen?', ['esmaspäev | | | ', 'teisipäev | | | ', 'kolmapäev | | | ', 'neljapäev | | | ', 'reede | | | ']),
      B.errorfix('012_t_fix', 'Paranda sõnum.', 'Anna sõnumis on vead. Kirjuta lause õigesti.', [
        ['Ma töötan kella üheksa kuni viis.', 'Ma töötan kella üheksast kuni viieni.'], ['Ma olen vaba pärast kell viis.', 'Ma olen vaba pärast kella viit.'], ['Film algab kella seitse.', 'Film algab kell seitse.'],
        ['Film kestab kaks tund.', 'Film kestab kaks tundi.'], ['Kohtume kino ees pool seitsme.', 'Kohtume kino ees pool seitse.'],
      ]),
      B.translation('012_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Сеанс начинается в семь.', 'Фильм длится два часа.', 'Я свободна после пяти.', 'Касса открыта с четырёх.', 'Встретимся в половине седьмого.']),
      B.rolecards('012_t_roles', 'Telefonikõne.', 'Leppige kokku, millal te kinno lähete.', 'Oled Anna. Töötad iga päev kella üheksast kuni viieni. Paku kaks aega kino kavast. Küsi, mis kell ja kus te kohtute.', 'Oled Liis. Neljapäeval on tunnid kella kuueni, laupäeval töö kella kaheteistkümnest neljani. Vali sobiv aeg.', ['Kas reedel kell … sobib?', 'Ma olen vaba pärast …'], ['Kahjuks ma ei saa, sest …', 'Kohtume kell …']),
      B.speaking('012_t_say', 'Minu nädal kellaaegadega.', 'Räägi, mis kellast mis kellani sa nädalal oled hõivatud.', ['Mis kellast mis kellani sa töötad või õpid?', 'Millal sa oled vaba?', 'Mis kell sa tavaliselt koju tuled?', 'Millal sa saad kinno minna?'], [60, 90]),
      B.letter('012_t_letter', 'Sõnum Liisile.', 'Kirjuta Liisile 30–50 sõna: mis päev, mis kell ja kus te kohtute.', 'Tere, Liis!', 'Kohtumiseni!', [30, 50]),
      B.writing('012_t_write', 'Teade uksele.', 'Kirjuta klubi uksele teade 4–6 lauset: lahtiolekuajad ja info.', [4, 6], ['avatud', 'kella', 'kuni'], 2),
      B.rubric('012_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Sõnumis on päev, kellaaeg ja koht.', 'Kellaajad on õiges vormis: kell pool seitse, kella viiest.', 'Dialoogis pakub ja valib õpilane aja ning põhjendab.', 'Teates on lahtiolekuajad: kella …st kuni …ni.']),
      B.selfcheck('012_t_self', ['Ma loen kino kava ja leian aja.', 'Ma saan aru sõnumist: millal keegi on vaba.', 'Ma lepin kokku aja telefonis.', 'Ma kirjutan teate lahtiolekuaegadega.'], 'Lähme kinno!'),
    ],
  },

  'a2-013': {
    title: 'Kui tihti?',
    canDo: 'Ma ütlen, kui tihti ma midagi teen (alati, tavaliselt, sageli, mõnikord, harva, mitte kunagi, kord nädalas), ja vähemalt 80% minu lausetest on õige sõnajärjega.',
    discover: [
      B.text('013_d_situation', 'Intervjuu harjumustest', 'Ajakiri „Tervis” küsib inimestelt nende harjumuste kohta. Ajakirjanik räägib Jaaniga. Jaan on kohviku omanik. Tal on koer Muki ja ta mängib korvpalli.'),
      B.vocab('013_d_vocab', 'Kui tihti?', ['alati — всегда', 'tavaliselt — обычно', 'sageli — часто', 'mõnikord — иногда', 'harva — редко', 'mitte kunagi — никогда', 'iga päev — каждый день', 'kord nädalas — раз в неделю', 'harjumus — привычка', 'käima — ходить, посещать', 'suitsetama — курить', 'koristama — убирать']),
      B.manymatch('013_d_scale', 'Kui tihti?', 'Ühenda protsent ja sõna.', ['100%', '80%', '60%', '30%', '10%', '0%'], ['alati', 'tavaliselt', 'sageli', 'mõnikord', 'harva', 'mitte kunagi']),
      B.reading('013_d_read', 'Loe: Intervjuu Jaaniga.', 'Loe intervjuud ja vasta küsimustele.', 'Jaani harjumused',
        '— Jaan, kas teil on head harjumused?\n— Ma arvan, et jah. Ma ärkan alati kell kuus, ka nädalavahetusel. Hommikul joon ma tavaliselt klaasi vett ja siis kohvi.\n— Kas te teete sporti?\n— Jah, ma mängin korvpalli kolm korda nädalas. Mõnikord käin ma ka ujumas. Muki-ga jalutan ma iga päev.\n— Mida te sööte?\n— Tavaliselt söön ma kodus. Kiirtoitu söön ma harva, võib-olla kord kuus.\n— Kas te suitsetate?\n— Ei, ma ei suitseta mitte kunagi.\n— Kas teil on ka halbu harjumusi?\n— Jah. Ma vaatan õhtul sageli telefoni. Ja sageli lähen ma magama hilja, kell üks. See ei ole hea.\n— Kas te loete raamatuid?\n— Jah, tavaliselt õhtul, aga mitte iga päev.\n— Kas te koristate ise?\n— Jah, ma koristan korterit kord nädalas, laupäeval.',
        [['Mis kell Jaan ärkab?', 'kell kuus|kuus|6'], ['Kui tihti Jaan korvpalli mängib?', 'kolm korda nädalas'], ['Kui tihti ta kiirtoitu sööb?', 'harva|kord kuus'], ['Kas Jaan suitsetab?', 'ei|ei suitseta|mitte kunagi'], ['Mis on Jaani halb harjumus?', 'vaatab õhtul telefoni|läheb hilja magama'], ['Millal Jaan koristab?', 'laupäeval|kord nädalas']]),
      B.truefalse('013_d_tf', 'Õige või vale?', 'Loe intervjuud uuesti.', [
        ['Jaan ärkab alati kell kuus.', true], ['Jaan ei tee sporti.', false], ['Jaan sööb sageli kiirtoitu.', false], ['Jaan jalutab koeraga iga päev.', true], ['Jaan koristab iga päev.', false],
      ]),
      B.notice('013_d_notice', 'Märka: kui tihti?', ['**alati** — **tavaliselt** — **sageli** — **mõnikord** — **harva** — **mitte kunagi**', 'Ma **käin** ujumas **kord nädalas**. Ma mängin **kolm korda nädalas**.', 'Sõnajärg: Ma **ärkan alati** kell kuus. **Tavaliselt söön** ma kodus.', 'Eitus: Ma **ei** suitseta **mitte kunagi**.', '**iga päev**, **igal hommikul**, **kord kuus**']),
      B.categorize('013_d_sort', 'Hea või halb harjumus?', 'Pane harjumused õigesse rühma.', [
        ['Hea harjumus', ['joon iga päev vett', 'käin trennis', 'jalutan iga päev', 'koristan kord nädalas']], ['Halb harjumus', ['suitsetan', 'söön sageli kiirtoitu', 'lähen hilja magama', 'vaatan öösel telefoni']],
      ]),
      B.choice('013_d_choice', 'Vali õige sõna.', 'Vali lünka sobiv sõna.', [
        ['Ma ___ mitte kunagi kohvi.', 'ei joo', 'joon', 'ei jooma'], ['Tavaliselt ___ ma kell seitse.', 'ärkan', 'ärkab', 'ärkama'],
        ['Ta sööb kala väga ___, ainult jõulude ajal.', 'harva', 'sageli', 'tihti'], ['Me käime ___ kinos, umbes kord kuus.', 'mõnikord', 'alati', 'iga päev'],
        ['Ma käin ujumas kaks ___ nädalas.', 'korda', 'kord', 'korra'],
      ], 'full', 'g_notice'),
      B.gaps('013_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Ma joon [alati] hommikul kohvi, iga päev ilma eranditeta.', 'Me käime [harva] kinos, ainult kaks korda aastas.', 'Ma ei suitseta [mitte kunagi].', 'Ta käib ujumas [kord nädalas], igal reedel.', '[Tavaliselt] ärkan ma kell seitse, aga täna kell kaheksa.', 'Lapsed söövad [sageli] jäätist, peaaegu iga päev.',
      ], ['alati', 'harva', 'mitte kunagi', 'kord nädalas', 'Tavaliselt', 'sageli', 'kord kuus', 'iga päev']),
      B.wordorder('013_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Ma joon alati hommikul kohvi.', 'Tavaliselt ma söön kodus.', 'Ma käin kord nädalas ujumas.', 'Mu isa ei suitseta mitte kunagi.', 'Me koristame laupäeval kodu.']),
      B.transformation('013_d_trans', 'Lisa sõna.', 'Kirjuta lause, lisa sulgudes olev sõna.', [
        ['Ma ärkan kell seitse. (tavaliselt)', 'Tavaliselt …', 'Tavaliselt ma ärkan kell seitse.|Tavaliselt ärkan ma kell seitse.'], ['Ma käin kinos. (harva)', 'Ma käin …', 'Ma käin harva kinos.|Ma käin kinos harva.'],
        ['Ta joob kohvi. (mitte kunagi)', 'Ta ei …', 'Ta ei joo mitte kunagi kohvi.|Ta ei joo kunagi kohvi.'], ['Me sööme kala. (mõnikord)', 'Mõnikord …', 'Mõnikord me sööme kala.|Mõnikord sööme me kala.'],
        ['Nad hilinevad. (sageli)', 'Sageli …', 'Sageli nad hilinevad.|Sageli hilinevad nad.'], ['Ma koristan. (kord nädalas)', 'Kord nädalas …', 'Kord nädalas ma koristan.|Kord nädalas koristan ma.'],
      ]),
      B.listening('013_d_listen', 'Kuulamine. Liisi harjumused.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Liis: Ma olen väga aktiivne inimene.', 'Ma jooksen igal hommikul pargis.', 'Kaks korda nädalas käin ma tantsimas.', 'Kohvi ma ei joo mitte kunagi, ma joon teed.',
        'Kinos käin ma harva, sest mul ei ole aega.', 'Õhtul ma tavaliselt loen.',
      ], ['Liis jookseb [igal hommikul].', 'Ta käib tantsimas [kaks korda] nädalas.', 'Liis ei joo kunagi [kohvi].', 'Kinos käib Liis [harva].', 'Õhtul ta tavaliselt [loeb].']),
      B.errorfix('013_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma suitsetan mitte kunagi.', 'Ma ei suitseta mitte kunagi.'], ['Ta käib ujuma kord nädalas.', 'Ta käib ujumas kord nädalas.'], ['Me käime kinos kaks kord kuus.', 'Me käime kinos kaks korda kuus.'],
        ['Tavaliselt ma ärkab kell seitse.', 'Tavaliselt ma ärkan kell seitse.'], ['Ma ei joon kunagi kohvi.', 'Ma ei joo kunagi kohvi.'],
      ]),
      B.translation('013_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я всегда пью кофе утром.', 'Мы иногда ходим в кино.', 'Он никогда не курит.', 'Я хожу плавать раз в неделю.', 'Обычно я убираю в субботу.']),
      B.speaking('013_d_say', 'Kui tihti sa…?', 'Küsi paarilise harjumuste kohta. Vasta ka ise.', ['Kui tihti sa sporti teed?', 'Kui tihti sa kinos käid?', 'Kas sa jood alati hommikul kohvi?', 'Mida sa ei tee mitte kunagi?', 'Mis on sinu hea harjumus?'], [45, 90], ['Ma … alati / tavaliselt / harva.', 'Ma käin … kord nädalas.', 'Ma ei … mitte kunagi.']),
      B.writing('013_d_write', 'Minu harjumused', 'Kirjuta oma harjumustest 5–7 lauset. Kasuta vähemalt viit sagedussõna.', [5, 7], ['alati', 'tavaliselt', 'harva', 'kord nädalas'], 3),
      B.selfcheck('013_d_self', ['Ma tean sõnu alati, tavaliselt, sageli, mõnikord, harva, mitte kunagi.', 'Ma ütlen: kord nädalas, kaks korda nädalas.', 'Ma panen sõnad õigesse järjekorda.', 'Ma räägin oma harjumustest.'], 'Harjumused'),
    ],
    practice: [
      B.listening('013_p_listen', 'Kuulamine. Küsitlus tänaval.', 'Õpetaja loeb vastused kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Ajakirjanik: Kui tihti te sporti teete?', 'Mees: Ma käin jõusaalis kolm korda nädalas.', 'Naine: Mina jalutan iga päev koeraga, aga trennis käin harva.',
        'Noormees: Ausalt? Ma ei tee sporti mitte kunagi. Ma mängin arvutimänge.', 'Vanem naine: Ma ujun tavaliselt kaks korda nädalas, esmaspäeval ja neljapäeval.',
      ], ['Mees käib jõusaalis [kolm korda] nädalas.', 'Naine jalutab koeraga [iga päev].', 'Naine käib trennis [harva].', 'Noormees ei tee sporti [mitte kunagi|kunagi].', 'Vanem naine ujub esmaspäeval ja [neljapäeval].']),
      B.choice('013_p_choice', 'Kui tihti?', 'Loe olukorda. Vali sobiv vastus.', [
        ['Sa käid ujumas esmaspäeval, kolmapäeval ja reedel.', 'kolm korda nädalas', 'kord nädalas', 'iga päev'], ['Sa sööd kala ainult jõulude ajal.', 'harva', 'sageli', 'tavaliselt'],
        ['Sa jood igal hommikul teed.', 'iga päev', 'mõnikord', 'harva'], ['Sa ei suitseta. Sa ei ole kunagi suitsetanud.', 'mitte kunagi', 'harva', 'mõnikord'],
        ['Sa käid kinos umbes kord kuus.', 'mõnikord', 'sageli', 'iga päev'],
      ], 'full', 'g_vocab'),
      B.wordforms('013_p_forms', 'Käin … -mas.', 'Kirjuta tegusõna mas-vormis.', [
        ['ujuma', 'käin …', 'ujumas'], ['tantsima', 'käin …', 'tantsimas'], ['jooksma', 'käin …', 'jooksmas'], ['sööma', 'käime väljas …', 'söömas'], ['jalutama', 'käin koeraga …', 'jalutamas'], ['suusatama', 'talvel käin …', 'suusatamas'],
      ]),
      B.gaps('013_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma [käin] trennis kaks korda nädalas. (käima)', 'Ta [ei suitseta] mitte kunagi. (suitsetama)', 'Me [koristame] kodu igal laupäeval. (koristama)', 'Kas sa [jood] alati kohvi? (jooma)', 'Nad [käivad] harva kinos. (käima)', 'Mu ema [teeb] tavaliselt süüa. (tegema)',
      ]),
      B.errorfix('013_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma ei suitsetan mitte kunagi.', 'Ma ei suitseta mitte kunagi.'], ['Ta käib ujuma kord nädalas.', 'Ta käib ujumas kord nädalas.'], ['Me käime kinos kaks kord nädalas.', 'Me käime kinos kaks korda nädalas.'],
        ['Tavaliselt ma ärkab kell seitse.', 'Tavaliselt ma ärkan kell seitse.'], ['Ta koristab iga laupäev.', 'Ta koristab igal laupäeval.'], ['Ma joon kohvi mitte kunagi.', 'Ma ei joo kohvi mitte kunagi.|Ma ei joo mitte kunagi kohvi.'],
      ]),
      B.wordorder('013_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Ma käin kaks korda nädalas trennis.', 'Tavaliselt me sööme õhtul kodus.', 'Mu vanaisa ei suitseta mitte kunagi.', 'Mõnikord ma jalutan pargis.', 'Kui tihti sa koristad?']),
      B.table('013_p_table', 'Minu harjumused.', 'Kirjuta, kui tihti sa seda teed.', 'Tegevus, Kui tihti?', ['joon kohvi | ', 'käin trennis | ', 'koristan kodu | ', 'käin kinos | ', 'söön kiirtoitu | ', 'helistan emale | ']),
      B.dictation('013_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ma käin kord nädalas ujumas.', 'Tavaliselt ma ärkan kell seitse.', 'Ta ei suitseta mitte kunagi.', 'Mõnikord me sööme väljas.', 'Laupäeval me koristame kodu.'], 5),
      B.translation('013_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я редко ем рыбу.', 'Она всегда опаздывает.', 'Мы ходим танцевать по пятницам.', 'Я никогда не пью кофе.', 'Как часто ты убираешь?']),
      B.rolecards('013_p_roles', 'Intervjuu.', 'Üks on ajakirjanik, teine vastab harjumuste kohta.', 'Oled ajakirjanik. Küsi vähemalt viis küsimust: sport, söök, uni, koristamine, telefon. Küsi: kui tihti?', 'Vasta ausalt. Kasuta sõnu alati, tavaliselt, harva, mitte kunagi, kord nädalas.', ['Kui tihti te …?', 'Kas te … alati?'], ['Ma … tavaliselt …', 'Ma ei … mitte kunagi.']),
      B.speaking('013_p_say', 'Küsitlus klassis.', 'Küsi kolmelt inimeselt, kui tihti nad sporti teevad. Räägi tulemused.', ['Kes teeb sporti kõige sagedamini?', 'Kes käib trennis harva?', 'Kes ei tee sporti mitte kunagi?', 'Kui tihti sina sporti teed?'], [60, 90]),
      B.writing('013_p_write', 'Minu uus hea harjumus.', 'Kirjuta 5–6 lauset: mida sa teed sageli ja mida tahad teha harvem.', [5, 6], ['sageli', 'harva', 'tahan'], 2),
      B.selfcheck('013_p_self', ['Ma saan aru, kui tihti keegi midagi teeb.', 'Ma ütlen: käin ujumas, käin tantsimas.', 'Ma parandan sõnajärje ja eituse vead.', 'Ma küsin teistelt nende harjumuste kohta.'], 'Kui tihti? Tean!'),
    ],
    transfer: [
      B.text('013_t_situation', 'Väljakutse „Üks hea harjumus”', 'Jaani arst ütles: „Teil on vaja paremaid harjumusi.” Nüüd jalutab Jaan rohkem koera Mukiga ja joob rohkem vett. Ka sinu kursusel algab väljakutse „Üks hea harjumus”.'),
      B.reading('013_t_read', 'Loe väljakutse kirjeldust.', 'Loe teksti ja vasta küsimustele.', 'Üks hea harjumus',
        'Vali üks hea harjumus ja tee seda neli nädalat. Väljakutse algab järgmisel esmaspäeval. Näiteks jaluta iga päev pool tundi. Või joo kaheksa klaasi vett päevas. Või loe igal õhtul kümme minutit eesti keeles. Kirjuta iga päev oma päevikusse, kas sa tegid seda. Kord nädalas, reedel, räägime tunnis oma harjumustest. Ära muretse, kui sa mõnikord unustad. Tähtis on, et sa teed seda tavaliselt. Neljanda nädala lõpus on väike pidu. Iga osaleja saab tunnistuse. Eelmisel aastal tegi väljakutse kaksteist õpilast. Kümme neist jätkab oma harjumust tänaseni!',
        [['Kui kaua väljakutse kestab?', 'neli nädalat|4 nädalat'], ['Mida tuleb iga päev päevikusse kirjutada?', 'kas sa tegid seda|kas tegid seda'], ['Millal räägitakse tunnis harjumustest?', 'reedel|kord nädalas'], ['Mis on tähtis?', 'et sa teed seda tavaliselt|teha seda tavaliselt'], ['Mitu õpilast jätkab tänaseni?', 'kümme|10']]),
      B.listening('013_t_listen', 'Kuula Jaani lugu.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Jaan: Minu vana harjumus oli halb.', 'Ma vaatasin igal õhtul kaks tundi telefoni.', 'Nüüd jalutan ma iga päev koera Mukiga.', 'Me käime pargis hommikul ja õhtul.',
        'Ma joon nüüd kaheksa klaasi vett päevas.', 'Trennis käin ma kolm korda nädalas: esmaspäeval, kolmapäeval ja reedel.',
      ], ['Jaan vaatas õhtul [telefoni] kaks tundi.', 'Jaani koera nimi on [Muki].', 'Nad käivad pargis hommikul ja [õhtul].', 'Jaan joob [kaheksa|8] klaasi vett päevas.', 'Trennis käib ta [kolm korda] nädalas.']),
      B.truefalse('013_t_tf', 'Õige või vale?', 'Mõtle Jaani loo peale.', [['Jaan jalutab koeraga iga päev.', true], ['Jaan joob kaks klaasi vett päevas.', false], ['Jaan käib trennis kolm korda nädalas.', true], ['Jaan käib trennis laupäeval.', false]]),
      B.categorize('013_t_sort', 'Tervislik või mitte?', 'Pane harjumused õigesse rühma.', [
        ['Tervislik', ['jalutan iga päev', 'joon palju vett', 'magan kaheksa tundi', 'söön puuvilju']], ['Ei ole tervislik', ['suitsetan', 'istun terve päeva', 'vaatan öösel telefoni', 'söön sageli kiirtoitu']],
      ]),
      B.errorfix('013_t_fix', 'Paranda päevik.', 'Päevikus on vead. Kirjuta lause õigesti.', [
        ['Ma jalutan iga päev pool tund.', 'Ma jalutan iga päev pool tundi.'], ['Ma joon vett kaheksa klaas päevas.', 'Ma joon kaheksa klaasi vett päevas.|Ma joon vett kaheksa klaasi päevas.'],
        ['Tavaliselt ma loeb õhtul.', 'Tavaliselt ma loen õhtul.'], ['Ma suitsetan mitte kunagi.', 'Ma ei suitseta mitte kunagi.'], ['Ma käin ujuma kaks korda nädalas.', 'Ma käin ujumas kaks korda nädalas.'],
      ]),
      B.translation('013_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я гуляю каждый день полчаса.', 'Обычно я ложусь спать в одиннадцать.', 'Я редко ем фастфуд.', 'Я никогда не курю.', 'Раз в неделю я хожу в бассейн.']),
      B.planning('013_t_plan', 'Minu harjumuse plaan.', 'Kirjuta märksõnad oma plaani jaoks.', ['Mis harjumuse sa valid?', 'Kui tihti ja mis kell sa seda teed?', 'Mis võib sind segada?'], 2),
      B.letter('013_t_letter', 'Kiri õpetajale.', 'Kirjuta õpetajale 30–50 sõna: mis harjumuse valid, kui tihti ja miks.', 'Tere, õpetaja!', 'Parimate soovidega', [30, 50]),
      B.speaking('013_t_say', 'Väljakutse tunnis.', 'Räägi grupile oma harjumustest. Mida teed sageli, mida harva?', ['Mida sa teed iga päev?', 'Mida sa teed sageli või tavaliselt?', 'Mida sa teed harva või mitte kunagi?', 'Mis harjumuse sa valid ja miks?'], [60, 120]),
      B.rolecards('013_t_roles', 'Arsti juures.', 'Üks on arst, teine patsient. Rääkige harjumustest.', 'Oled arst. Küsi patsiendilt: uni, sport, söök, vesi, suitsetamine. Küsi: kui tihti? Anna üks nõuanne.', 'Oled patsient. Vasta arsti küsimustele. Kasuta: alati, tavaliselt, harva, mitte kunagi.', ['Kui tihti te …?', 'Kas te suitsetate?'], ['Tavaliselt ma …', 'Ma ei … mitte kunagi.']),
      B.writing('013_t_write', 'Minu nädal harjumustega.', 'Kirjuta 6–8 lauset: sinu harjumused praegu ja mida sa muudad.', [6, 8], ['alati', 'tavaliselt', 'harva', 'nüüd'], 2),
      B.rubric('013_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Tekstis on vähemalt viis sagedussõna.', 'Sõnajärg on õige: Ma käin alati…, Tavaliselt ma…', 'Eitus on õige: ma ei … mitte kunagi.', 'Suuline tekst on arusaadav ja kestab umbes minuti.']),
      B.selfcheck('013_t_self', ['Ma saan aru väljakutse reeglitest.', 'Ma valin hea harjumuse ja teen plaani.', 'Ma räägin arstiga oma harjumustest.', 'Ma kirjutan oma harjumustest õpetajale.'], 'Hea harjumus'),
    ],
  },

  'a2-014': {
    title: 'Minu nädal',
    canDo: 'Ma kirjutan oma nädalast ja plaanidest 70–90-sõnalise seotud teksti, kus on vähemalt viis aja- ja seosesõna (esmaspäeval, kõigepealt, siis, pärast seda, aga).',
    discover: [
      B.text('014_d_situation', 'Anna tihe nädal', 'Annal on töö ja kaks last. Tema nädal on väga tihe. Igal pühapäeva õhtul istub ta köögilaua taha ja kirjutab järgmise nädala plaani.'),
      B.vocab('014_d_vocab', 'Nädal', ['nädal — неделя', 'esmaspäev — понедельник', 'teisipäev — вторник', 'kolmapäev — среда', 'neljapäev — четверг', 'reede — пятница', 'laupäev — суббота', 'pühapäev — воскресенье', 'nädalavahetus — выходные', 'kõigepealt — сначала', 'siis — потом', 'pärast seda — после этого', 'plaan — план', 'aga — но']),
      B.reading('014_d_read', 'Loe: Anna nädal.', 'Loe teksti ja vasta küsimustele lühidalt.', 'Minu nädal',
        'Minu nädal on alati tihe. Esmaspäeval lähen ma kell kaheksa tööle. Pärast tööd viin ma Margi korvpalli trenni. Teisipäeval on mul pärast tööd joogatund. Siis toob Igor lapsed koju. Kolmapäeval käin ma ujumas. Pärast seda teen ma kiiresti õhtusööki. Neljapäev on rahulik päev. Õhtul me vaatame koos filmi. Reedel lõpeb mu tööpäev varem, kell kolm. Kõigepealt lähen ma poodi, siis lasteaeda Laurale järele. Nädalavahetusel me puhkame. Laupäeval koristame kõik koos kodu ja pärast seda sõidame vanaema juurde. Pühapäeval magan ma kaua. Siis kirjutan ma uue nädala plaani. Minu nädal on kiire, aga mulle meeldib see.',
        [['Mida Anna teisipäeval pärast tööd teeb?', 'läheb joogatundi|tal on joogatund|joogatund'], ['Mis päeval käib Anna ujumas?', 'kolmapäeval'], ['Mis kell lõpeb reedel tööpäev?', 'kell kolm|kolm|15'], ['Mida pere laupäeval teeb?', 'koristab kodu ja sõidab vanaema juurde|koristavad kodu|sõidavad vanaema juurde'], ['Millal kirjutab Anna uue plaani?', 'pühapäeval'], ['Mis päev on rahulik?', 'neljapäev']]),
      B.table('014_d_table', 'Anna nädal.', 'Loe teksti uuesti ja täida lüngad.', 'Päev, Mida Anna teeb?', ['esmaspäeval | viib Margi [korvpalli] trenni', 'teisipäeval | läheb [joogatundi]', 'kolmapäeval | käib [ujumas]', 'neljapäeval | vaatab perega [filmi]', 'reedel | läheb kõigepealt [poodi]', 'pühapäeval | kirjutab uue nädala [plaani]'], 'g_read'),
      B.notice('014_d_notice', 'Märka: millal? ja järjekord', ['esmaspäev → **esmaspäeval**, reede → **reedel**, nädalavahetus → **nädalavahetusel**', 'iga esmaspäev = **esmaspäeviti**, iga reede = **reedeti**', '**Kõigepealt** lähen poodi, **siis** lasteaeda, **pärast seda** koju.', '**ja** lisab: Me koristame **ja** sööme.', '**aga** vastandab: Nädal on kiire, **aga** mulle meeldib.']),
      B.wordforms('014_d_forms', 'Millal?', 'Kirjuta nädalapäev vormis millal?', [
        ['esmaspäev', 'millal?', 'esmaspäeval'], ['teisipäev', 'millal?', 'teisipäeval'], ['kolmapäev', 'millal?', 'kolmapäeval'], ['neljapäev', 'millal?', 'neljapäeval'],
        ['reede', 'millal?', 'reedel'], ['laupäev', 'millal?', 'laupäeval'], ['pühapäev', 'millal?', 'pühapäeval'], ['nädalavahetus', 'millal?', 'nädalavahetusel'],
      ]),
      B.crossword('014_d_cross', 'Nädala sõnad.', 'Kirjuta sõna vihje järgi.', [
        ['Nädala esimene päev', 'esmaspäev'], ['Päev pärast neljapäeva', 'reede'], ['Nädala keskmine päev', 'kolmapäev'],
        ['Päev enne pühapäeva', 'laupäev'], ['Laupäev ja pühapäev koos', 'nädalavahetus'], ['Mida ma tahan teha: minu …', 'plaan'],
      ]),
      B.gaps('014_d_gaps', 'Seosesõnad.', 'Vali sõnapangast sobiv sõna.', [
        '[Kõigepealt] ma ärkan ja joon kohvi.', 'Kohvi järel ma [siis] lähen tööle.', 'Töö lõpeb kell viis. [Pärast seda] lähen ma poodi.', 'Ma tahan tulla, [aga] mul ei ole aega.', 'Me sööme [ja] vaatame filmi.', '[Nädalavahetusel] me puhkame.',
      ], ['Kõigepealt', 'siis', 'Pärast seda', 'aga', 'ja', 'Nädalavahetusel', 'sest', 'enne']),
      B.wordorder('014_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Esmaspäeval ma lähen tööle.', 'Pärast seda ma lähen koju.', 'Laupäeval me koristame kodu.', 'Kõigepealt ma joon kohvi.', 'Nädal on kiire, aga mulle meeldib see.']),
      B.listening('014_d_listen', 'Kuulamine. Markuse nädal.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Markus: Esmaspäeval ja kolmapäeval käin ma jõusaalis.', 'Teisipäeval on mul eesti keele kursus.', 'Neljapäeval kohtun ma sõpradega kohvikus.',
        'Reede õhtul mängin ma arvutimänge.', 'Laupäeval sõidan ma rattaga järve äärde.', 'Pühapäeval helistan ma emale.',
      ], ['Markus käib jõusaalis esmaspäeval ja [kolmapäeval].', '[Teisipäeval] on tal eesti keele kursus.', 'Neljapäeval kohtub ta sõpradega [kohvikus].', 'Laupäeval sõidab ta [rattaga] järve äärde.', 'Pühapäeval helistab ta [emale].']),
      B.errorfix('014_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Esmaspäev ma lähen tööle.', 'Esmaspäeval ma lähen tööle.'], ['Reedeel on pidu.', 'Reedel on pidu.'], ['Nädalavahetuses me puhkame.', 'Nädalavahetusel me puhkame.'],
        ['Ma tahan tulla, ja mul ei ole aega.', 'Ma tahan tulla, aga mul ei ole aega.'], ['Pärast see ma lähen koju.', 'Pärast seda ma lähen koju.'],
      ]),
      B.translation('014_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['В понедельник я работаю.', 'Сначала я иду в магазин, потом домой.', 'После этого мы смотрим фильм.', 'На выходных мы отдыхаем.', 'По средам я хожу плавать.']),
      B.speaking('014_d_say', 'Minu nädal.', 'Räägi paarilisele oma nädalast. Räägi umbes minut.', ['Mida sa teed esmaspäeval?', 'Mis päev on sinu kõige kiirem päev?', 'Mis päev on rahulik?', 'Mida sa teed nädalavahetusel?'], [60, 90], ['Esmaspäeval ma…', 'Kõigepealt…, siis…', 'Pärast seda…']),
      B.planning('014_d_plan', 'Teksti plaan.', 'Kirjuta iga päeva juurde märksõnad.', ['esmaspäev ja teisipäev', 'kolmapäev ja neljapäev', 'reede', 'nädalavahetus'], 2),
      B.writing('014_d_write', 'Minu nädal', 'Kirjuta oma nädalast 7–9 lauset (70–90 sõna). Kasuta seosesõnu.', [7, 9], ['esmaspäeval', 'kõigepealt', 'siis', 'pärast seda', 'aga'], 4),
      B.selfcheck('014_d_self', ['Minu tekstis on nädalapäevad: esmaspäeval, reedel …', 'Tekstis on vähemalt viis seosesõna: kõigepealt, siis, pärast seda, ja, aga.', 'Tegevused on loogilises järjekorras.', 'Tekstis on 70–90 sõna.'], 'Nädal on plaanitud'),
    ],
    practice: [
      B.reading('014_p_read', 'Loe: Kati sõnum.', 'Loe sõnumit ja vasta küsimustele.', 'Tere, Liis!',
        'Tere, Liis! Sel nädalal on mul väga kiire. Esmaspäeval ja teisipäeval on mul loengud kella kaheksast kuni neljani. Kolmapäeval on eksam, seepärast õpin ma teisipäeva õhtul kaua. Neljapäeval on koori proov kell kuus. Pärast seda lähen ma sõbrannaga kinno. Reedel sõidan ma Viljandisse oma poiss-sõbra juurde. Nädalavahetusel oleme seal. Laupäeval läheme kontserdile ja pühapäeval jalutame järve ääres. Kas sa tahad järgmisel nädalal kohvi juua? Pühapäeva õhtul sõidan ma bussiga Tartusse tagasi. Sõit kestab umbes tund aega. Mul on vaba aega esmaspäeva õhtul. Kirjuta mulle! Kati',
        [['Mis kellast mis kellani on Katil esmaspäeval loengud?', 'kella kaheksast kuni neljani|kaheksast neljani|8–16'], ['Miks Kati õpib teisipäeva õhtul kaua?', 'kolmapäeval on eksam|sest kolmapäeval on eksam'], ['Mis kell on koori proov?', 'kell kuus|kuus|18'], ['Kuhu Kati reedel sõidab?', 'Viljandisse'], ['Millal on Katil järgmisel nädalal vaba aega?', 'esmaspäeva õhtul|esmaspäeval']]),
      B.truefalse('014_p_tf', 'Õige või vale?', 'Loe Kati sõnumit uuesti.', [['Katil on sel nädalal kiire.', true], ['Eksam on neljapäeval.', false], ['Pärast proovi läheb Kati kinno.', true], ['Nädalavahetusel on Kati Tartus.', false], ['Laupäeval läheb Kati kontserdile.', true]]),
      B.gaps('014_p_gaps', 'Millal?', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        '[Esmaspäeval] on mul loengud. (esmaspäev)', '[Reedel] sõidan ma Viljandisse. (reede)', '[Nädalavahetusel] me puhkame. (nädalavahetus)', 'Ma käin ujumas [kolmapäeviti]. (iga kolmapäev)', '[Laupäeval] on kontsert. (laupäev)', '[Neljapäeval] on koori proov. (neljapäev)',
      ]),
      B.transformation('014_p_join', 'Ühenda laused.', 'Ühenda kaks lauset sulgudes oleva sõnaga.', [
        ['Ma tahan tulla. Mul ei ole aega. (aga)', 'Ma tahan tulla, …', 'Ma tahan tulla, aga mul ei ole aega.'], ['Me sööme. Me vaatame filmi. (ja)', 'Me sööme …', 'Me sööme ja vaatame filmi.'],
        ['Tund lõpeb. Ma lähen koju. (pärast seda)', 'Tund lõpeb. Pärast seda …', 'Tund lõpeb. Pärast seda ma lähen koju.|Tund lõpeb. Pärast seda lähen ma koju.'],
        ['Ma koristan. Ma puhkan. (kõigepealt … siis)', 'Kõigepealt …', 'Kõigepealt ma koristan, siis puhkan.|Kõigepealt ma koristan, siis ma puhkan.|Kõigepealt koristan ma, siis puhkan.'],
        ['Kati õpib. Homme on eksam. (sest)', 'Kati õpib, …', 'Kati õpib, sest homme on eksam.'],
      ]),
      B.wordorder('014_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kõigepealt ma joon kohvi.', 'Pärast seda me läheme kinno.', 'Reedel ma sõidan Viljandisse.', 'Esmaspäeviti on mul loengud.', 'Nädalavahetusel me oleme maal.']),
      B.dialogue('014_p_dialog', 'Kohtume!', 'Täida dialoog sobivate sõnadega.', 'Liis', 'Kati', [
        ['A', 'Tere, Kati! Millal sul järgmisel nädalal aega on?'], ['B', '[Esmaspäeva] õhtul. Teisipäeval on mul loengud.'], ['A', 'Mul on esmaspäeval trenn kella kuueni. [Pärast] seda olen vaba.'],
        ['B', 'Väga hea! Kohtume kell seitse. [Kõigepealt] joome kohvi.'], ['A', 'Ja [siis]?'], ['B', 'Siis jalutame pargis. Ma tulen hea meelega, [aga] kella üheksaks pean ma kodus olema.'],
        ['A', 'Pole probleemi. Näeme [esmaspäeval]!'],
      ]),
      B.errorfix('014_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Neljapäev on koori proov.', 'Neljapäeval on koori proov.'], ['Pärast see ma lähen kinno.', 'Pärast seda ma lähen kinno.'], ['Ma olen väsinud, ja ma lähen trenni.', 'Ma olen väsinud, aga ma lähen trenni.'],
        ['Kõigepealt ma söön, pärast ma siis lähen.', 'Kõigepealt ma söön, siis ma lähen.'], ['Laupäevil me koristame.', 'Laupäeviti me koristame.|Laupäeval me koristame.'],
      ]),
      B.dictation('014_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Esmaspäeval ma lähen tööle.', 'Kõigepealt ma joon kohvi.', 'Pärast seda me läheme kinno.', 'Nädalavahetusel me puhkame.', 'Mu nädal on kiire, aga tore.'], 5),
      B.translation('014_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Во вторник у меня курс.', 'Сначала я убираю, потом отдыхаю.', 'После этого я звоню маме.', 'По пятницам мы ходим в кино.', 'Я хочу прийти, но у меня нет времени.']),
      B.planning('014_p_plan', 'Minu nädala kalender.', 'Kirjuta iga päeva juurde, mida sa teed.', ['esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'nädalavahetus'], 2),
      B.speaking('014_p_say', 'Leia vaba aeg.', 'Räägi paarilisele oma nädalast. Leidke päev, kus mõlemad on vabad.', ['Mida sa teed esmaspäevast reedeni?', 'Millal sa oled vaba?', 'Mida sa teed nädalavahetusel?', 'Millal me saame kokku?'], [60, 90]),
      B.writing('014_p_write', 'Minu nädal.', 'Kirjuta oma järgmisest nädalast 7–9 lauset (70–90 sõna).', [7, 9], ['esmaspäeval', 'kõigepealt', 'pärast seda', 'aga'], 3),
      B.selfcheck('014_p_self', ['Ma leian sõnumist päevad ja kellaajad.', 'Ma kirjutan: esmaspäeval, reedel, nädalavahetusel, esmaspäeviti.', 'Ma ühendan lauseid: ja, aga, sest, kõigepealt, siis.', 'Ma kirjutan oma nädalast 70–90 sõna.'], 'Nädal on kirjas'),
    ],
    transfer: [
      B.text('014_t_situation', 'Nädal ilma Igorita', 'Järgmisel nädalal on Anna mees Igor tööreisil Soomes. Anna peab kõike ise tegema: töö, lapsed ja kodu. Ta palub abi oma õelt Kristilt ja planeerib nädalat.'),
      B.listening('014_t_listen', 'Kuula Kristi sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Anna! Siin Kristi.', 'Ma saan sind järgmisel nädalal aidata.', 'Esmaspäeval ja teisipäeval on mul loengud, siis ma ei saa.',
        'Kolmapäeval olen ma vaba pärast kella kahte.', 'Ma võin Laura lasteaiast koju tuua.', 'Neljapäeval ma ei saa, aga reedel saan jälle.', 'Helista mulle õhtul!',
      ], ['Esmaspäeval ja teisipäeval on Kristil [loengud].', 'Kolmapäeval on ta vaba pärast kella [kahte|kahe|2].', 'Kristi võib Laura [lasteaiast] koju tuua.', '[Neljapäeval] Kristi ei saa.', 'Kristi palub helistada [õhtul].']),
      B.reading('014_t_read', 'Loe lasteaia teadet.', 'Loe teadet ja vasta küsimustele.', 'Head lapsevanemad!',
        'Järgmise nädala plaan. Esmaspäeval läheme hommikul metsa, palun pange lastele kummikud. Teisipäeval tuleb lasteaeda nukuteater kell kümme. Etendus kestab pool tundi. Pärast seda joonistavad lapsed pilte. Kolmapäeval on spordipäev, lapsed vajavad spordiriideid. Kui ilm on ilus, oleme õues. Kui sajab vihma, oleme saalis. Neljapäeval on lasteaed avatud ainult kella kolmeni, sest õpetajatel on koolitus. Reedel peame sünnipäevi. Kui teie lapsel on sel kuul sünnipäev, võite tuua puuvilju. Nädalavahetusel on lasteaed suletud. Järgmisel kuul on lasteaias jõulupidu. Küsimuste korral helistage õpetaja Mailele. Ilusat nädalat!',
        [['Mida tuleb esmaspäeval lastele panna?', 'kummikud'], ['Mis kell tuleb nukuteater?', 'kell kümme|10'], ['Mis päeval on spordipäev?', 'kolmapäeval'], ['Mis kellani on lasteaed neljapäeval avatud?', 'kella kolmeni|kolmeni|15'], ['Mida võib reedel tuua?', 'puuvilju']]),
      B.manymatch('014_t_days', 'Lasteaia nädal.', 'Ühenda päev ja tegevus.', ['esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede'], ['metsa minek', 'nukuteater', 'spordipäev', 'lasteaed kella kolmeni', 'sünnipäevad'], 'full', 'g_read'),
      B.table('014_t_plan', 'Anna nädalaplaan.', 'Kirjuta Anna jaoks plaan: kes aitab ja mida võtta kaasa.', 'Päev, Laura vajab, Kes toob Laura koju?', ['esmaspäev | | ', 'teisipäev | | ', 'kolmapäev | | ', 'neljapäev | | ', 'reede | | ']),
      B.wordorder('014_t_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kõigepealt viin ma Laura lasteaeda.', 'Pärast seda lähen ma tööle.', 'Kolmapäeval aitab mind Kristi.', 'Reedel peame lasteaias sünnipäeva.', 'Nädalavahetusel me puhkame.']),
      B.letter('014_t_letter', 'Kiri Kristile.', 'Kirjuta Kristile 70–90 sõna: nädala plaan päevade kaupa.', 'Tere, Kristi!', 'Suur aitäh! Anna', [70, 90]),
      B.speaking('014_t_call', 'Telefonikõne Kristile.', 'Helista Kristile ja räägi nädala plaan läbi.', ['Mis päeval sa vajad abi?', 'Mis kell peab Laura koju tooma?', 'Mida tuleb lasteaeda kaasa võtta?', 'Kuidas sa Kristit tänad?'], [60, 90]),
      B.rolecards('014_t_roles', 'Nädala plaan paaris.', 'Mõlemal on tihe nädal. Leidke aeg ühiseks tegevuseks.', 'Sinu nädal: esmaspäeval trenn, kolmapäeval kursus, reedel töö kella kuueni. Paku kaks vaba aega.', 'Sinu nädal: teisipäeval ja neljapäeval töö õhtul, laupäeval maal. Küsi ja vali aeg.', ['Esmaspäeval ma ei saa, sest …', 'Kas … sobib?'], ['Kahjuks …, aga …', 'Kõigepealt …, siis …']),
      B.writing('014_t_write', 'Sõnum Igorile.', 'Kirjuta Igorile 4–6 lauset: kuidas su nädal läheb.', [4, 6], ['esmaspäeval', 'aga', 'pärast seda'], 2),
      B.rubric('014_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kirjas on 70–90 sõna ja kõik nädalapäevad on õiges vormis.', 'Tekstis on vähemalt viis seosesõna.', 'Plaan on loogiline: lasteaia info ja Kristi aeg on arvesse võetud.', 'Telefonikõne on arusaadav ja viisakas.']),
      B.selfcheck('014_t_self', ['Ma saan aru lasteaia nädalaplaanist.', 'Ma kuulan sõnumist, millal keegi saab aidata.', 'Ma kirjutan 70–90-sõnalise nädala plaani.', 'Ma lepin paarilisega aja kokku.'], 'Nädal on korras'),
    ],
  },

  'a2-015': {
    title: 'Kontroll 3 — päev ja aeg',
    canDo: 'Ma näitan kontrollis, et oskan rääkida oma päevast ja nädalast, öelda kellaaega ja sagedust ning kirjutada nädala plaani (vähemalt 70%).',
    discover: [
      B.text('015_d_situation', 'Kordame', 'Enne kontrolli kordame mooduli tähtsamat: päeva osad, kellaaeg, alates–kuni, enne–pärast, kui tihti, nädalapäevad ja seosesõnad.'),
      B.notice('015_d_notice', 'Mooduli kokkuvõte', ['Päev: **hommikul** ärkan, **õhtul** puhkan; ma **lähen**, **tulen**, **söön**', 'Kell: kell on **pool kolm**, **veerand neli**; **kella üheksast kuni viieni**', '**enne** kella kümmet, **pärast** tööd; tund **kestab** poolteist tundi', 'Kui tihti: **alati, tavaliselt, sageli, mõnikord, harva**, ei … **mitte kunagi**', 'Nädal: **esmaspäeval**, **nädalavahetusel**; **kõigepealt, siis, pärast seda**']),
      B.vocab('015_d_vocab', 'Uued sõnad', ['päevakava — распорядок дня', 'argipäev — будний день', 'vaba aeg — свободное время', 'vara — рано', 'hilja — поздно', 'kiire — быстрый, занятый', 'lõuna — обед', 'õhtusöök — ужин', 'tööpäev — рабочий день']),
      B.reading('015_d_read', 'Loe: Oksana päevakava.', 'Loe teksti ja vasta küsimustele.', 'Minu argipäev',
        'Minu argipäev algab vara. Ma ärkan kell pool seitse. Kõigepealt teen ma hommikusöögi ja äratan Mia. Kell pool kaheksa viin ma Mia lasteaeda. Siis sõidan ma bussiga keelekursusele. Kursus on esmaspäevast neljapäevani kella üheksast kuni kaheteistkümneni. Lõuna on mul tavaliselt kell üks. Pärastlõunal õpin ma kodus eesti keelt ja teen kodutööd. Kell viis lähen ma Miale järele. Õhtusöök on meil kell seitse, siis on ka mu mees kodus. Pärast õhtusööki mängime Miaga ja loeme raamatut. Mia läheb magama kell üheksa. Mina lähen magama hilja, tavaliselt kell üksteist. Reedel on mul vaba päev. Siis käin ma poes ja koristan. Mul on kiire elu, aga ma olen õnnelik.',
        [['Mis kell Oksana ärkab?', 'kell pool seitse|pool seitse|6.30'], ['Kuidas Oksana kursusele sõidab?', 'bussiga'], ['Mis päevadel on kursus?', 'esmaspäevast neljapäevani'], ['Mis kellast mis kellani on kursus?', 'kella üheksast kuni kaheteistkümneni|üheksast kaheteistkümneni|9–12'], ['Mis kell on õhtusöök?', 'kell seitse|seitse|19'], ['Mida Oksana reedel teeb?', 'käib poes ja koristab|käib poes|koristab']]),
      B.truefalse('015_d_tf', 'Õige või vale?', 'Loe Oksana teksti uuesti.', [['Oksana ärkab kell seitse.', false], ['Oksana sõidab kursusele bussiga.', true], ['Kursus on ka reedel.', false], ['Mia läheb magama kell üheksa.', true], ['Oksana läheb magama vara.', false]]),
      B.clock('015_d_clock', 'Oksana kellaajad.', 'Kirjuta kellaaeg sõnadega.', [
        { time: '06:30', extra: '' }, { time: '07:30', extra: '' }, { time: '09:00', extra: '' }, { time: '13:00', extra: '' }, { time: '17:15', extra: 'veerand kuus' }, { time: '22:45', extra: 'kolmveerand üksteist' },
      ]),
      B.wordforms('015_d_forms', 'Kordame vorme.', 'Kirjuta sõna õiges vormis.', [
        ['minema', 'ma', 'lähen'], ['sööma', 'ta', 'sööb'], ['reede', 'millal?', 'reedel'], ['viis', 'kuni kella …', 'viieni'], ['üheksa', 'alates kella …', 'üheksast'], ['ujuma', 'käin …', 'ujumas'],
      ]),
      B.transformation('015_d_trans', 'Ütle teisiti.', 'Kirjuta lause uue algusega.', [
        ['Ma ärkan kell seitse. (tavaliselt)', 'Tavaliselt …', 'Tavaliselt ma ärkan kell seitse.|Tavaliselt ärkan ma kell seitse.'],
        ['Pood on avatud 9–21.', 'Pood on avatud kella …', 'Pood on avatud kella üheksast kuni üheksani.|Pood on avatud kella üheksast üheksani.'],
        ['Ta suitsetab. (mitte kunagi)', 'Ta ei …', 'Ta ei suitseta mitte kunagi.|Ta ei suitseta kunagi.'],
        ['Ma söön. Ma lähen tööle. (kõigepealt … siis)', 'Kõigepealt …', 'Kõigepealt ma söön, siis lähen tööle.|Kõigepealt söön ma, siis lähen tööle.'],
        ['Film algab 18.30.', 'Film algab kell …', 'Film algab kell pool seitse.'], ['Tund kestab 90 minutit.', 'Tund kestab …', 'Tund kestab poolteist tundi.'],
      ]),
      B.errorfix('015_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Hommikus ma ärkan vara.', 'Hommikul ma ärkan vara.'], ['Kell on pool seitsme.', 'Kell on pool seitse.'], ['Ma töötan kella üheksa kuni viis.', 'Ma töötan kella üheksast kuni viieni.'],
        ['Ma suitsetan mitte kunagi.', 'Ma ei suitseta mitte kunagi.'], ['Reedeel ma koristan.', 'Reedel ma koristan.'], ['Pärast see ma lähen koju.', 'Pärast seda ma lähen koju.'],
      ]),
      B.gaps('015_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Ma ärkan väga [vara], kell viis.', 'Ma lähen magama [hilja], kell üks öösel.', 'Täna on mul [kiire] päev, mul ei ole aega.', '[Lõuna] on kell kaksteist.', 'Minu [tööpäev] lõpeb kell viis.', '[Vabal ajal] ma loen raamatuid.',
      ], ['vara', 'hilja', 'kiire', 'Lõuna', 'tööpäev', 'Vabal ajal', 'õhtusöök', 'argipäev']),
      B.listening('015_d_listen', 'Kuulamine. Urmase nädal.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Urmas: Minu tööpäev algab kell pool kuus.', 'Ma töötan esmaspäevast reedeni.', 'Lõuna on mul kell kaksteist, see kestab pool tundi.',
        'Kolmapäeviti käin ma pärast tööd saunas.', 'Laupäeval sõidan ma tavaliselt kalale.', 'Pühapäeval me ei tee midagi, me puhkame.',
      ], ['Urmase tööpäev algab kell [pool kuus|5.30].', 'Ta töötab esmaspäevast [reedeni].', 'Lõuna kestab [pool tundi].', 'Kolmapäeviti käib ta [saunas].', 'Laupäeval sõidab ta tavaliselt [kalale].']),
      B.wordorder('015_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Minu argipäev algab vara.', 'Kõigepealt ma teen hommikusöögi.', 'Reedel on mul vaba päev.', 'Tavaliselt ma lähen magama kell üksteist.']),
      B.translation('015_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Мой рабочий день начинается в восемь.', 'Обед в двенадцать.', 'Я иногда хожу в сауну.', 'В субботу я сплю долго.', 'Сначала я убираю, потом отдыхаю.']),
      B.speaking('015_d_say', 'Proovieksam: minu päev.', 'Räägi oma tavalisest päevast ja nädalast.', ['Mis kell sinu päev algab?', 'Mida sa teed hommikul, päeval ja õhtul?', 'Kui tihti sa sporti teed?', 'Mida sa teed nädalavahetusel?'], [60, 90]),
      B.writing('015_d_write', 'Kordame kirjutamist.', 'Kirjuta 6–8 lauset oma argipäevast. Kasuta kellaaegu ja sagedussõnu.', [6, 8], ['kell', 'tavaliselt', 'kõigepealt', 'siis'], 2),
      B.selfcheck('015_d_self', ['Ma kordasin päeva ja nädala sõnu.', 'Ma ütlen kellaaega ja alates–kuni.', 'Ma kasutan sagedussõnu õige sõnajärjega.', 'Ma olen valmis kontrolliks.'], 'Valmis kontrolliks'),
    ],
    practice: [
      B.tip('015_p_how', 'Kontroll: lugemine, kuulamine, keel (eksami vormis)', 'See leht on nagu Harno A2 eksami lugemine ja kuulamine. Tee kõik ilma abita. Kuulamisteksti loeb õpetaja kaks korda. Eesmärk on vähemalt 70%.', 'full'),
      B.choice('015_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sa tahad teada aega. Mida sa küsid?', 'Vabandust, mis kell on?', 'Kui vana sa oled?', 'Kus sa elad?'], ['Sõber küsib, millal sa vaba oled.', 'Pärast kella viit.', 'Kaks korda.', 'Viis tundi tagasi.'], ['Sa jõuad tundi pool tundi hiljem. Mida sa ütled?', 'Vabandust, ma jäin hiljaks!', 'Head isu!', 'Palju õnne!'],
        ['Sa tahad teada, millal pood avatakse.', 'Mis kellast pood on avatud?', 'Kui suur pood on?', 'Kelle pood see on?'], ['Kolleeg kutsub sind reedel kinno. Sa ei saa.', 'Kahjuks reedel ma ei saa.', 'Jah, hea meelega!', 'Kino on suur.'],
        ['Arst küsib, kui tihti sa sporti teed.', 'Kaks korda nädalas.', 'Kell kaks.', 'Kaks tundi tagasi.'],
      ], 'full', 'g_use'),
      B.reading('015_p_ad', 'Lugemine 2. Kuulutus.', 'Loe spordiklubi kuulutust ja vasta küsimustele.', 'Spordiklubi „Liikumine”',
        'Jooga toimub esmaspäeviti ja kolmapäeviti kell 18.00–19.00. Ujumine on teisipäeviti ja neljapäeviti hommikul kella seitsmest kuni kaheksani. Laupäeviti kell 10.00 on perede tund. Seal võimlevad emad ja isad koos lastega. Tund kestab 45 minutit. Klubi on avatud iga päev kella kuuest kuni kümneni õhtul. Pühapäeval on klubi avatud kella üheksast kuni kuueni. Klubis on ka saun. Saun on avatud õhtul alates kella viiest. Kuukaart maksab 35 eurot, üks kord 8 eurot. Esimene tund on tasuta. Palun tulge kümme minutit enne tunni algust. Registreeri klubi kodulehel või telefonil 5678 1234.',
        [['Mis päevadel on jooga?', 'esmaspäeviti ja kolmapäeviti|esmaspäeval ja kolmapäeval'], ['Mis kell on ujumine?', 'kella seitsmest kuni kaheksani|seitsmest kaheksani|7–8'], ['Kui kaua kestab perede tund?', '45 minutit|nelikümmend viis minutit'], ['Mis kellast mis kellani on klubi pühapäeval avatud?', 'kella üheksast kuni kuueni|üheksast kuueni|9–18'], ['Kui palju maksab kuukaart?', '35 eurot'], ['Millal tuleb kohale tulla?', 'kümme minutit enne tundi|10 minutit enne tunni algust']]),
      B.truefalse('015_p_tf', 'Lugemine 3. Õige või vale?', 'Loe kuulutust uuesti.', [['Jooga on kaks korda nädalas.', true], ['Ujumine on õhtul.', false], ['Perede tund on laupäeviti.', true], ['Esimene tund maksab 8 eurot.', false], ['Pühapäeval on klubi avatud kella kuueni.', true]]),
      B.cloze('015_p_cloze', 'Lugemine 4. Sõnum.', 'Vali igasse lünka sobiv sõna.', 'Tere, Olga!', [
        'Ma käin nüüd spordiklubis {*kaks korda|kaks kord|kahe korda} nädalas. {*Esmaspäeviti|Esmaspäev|Esmaspäevast} käin ma joogas.',
        'Tund algab kell kuus ja kestab {*tund aega|tunni ajal|tundi aega}. Ujumas käin ma {*harva|alati|iga päev}, sest see on liiga vara.',
        'Ujumine on kella {*seitsmest|seitse|seitsmeni} hommikul. {*Pärast|Kell|Kuni} tööd olen ma väsinud, aga jooga aitab.',
        'Kas sa tuled {*laupäeval|laupäev|laupäevani} minuga perede tundi? See algab {*kell|kella|kellal} kümme.',
      ]),
      B.listening('015_p_listen', 'Kuulamine 1. Teade bussijaamas.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tähelepanu! Buss Pärnusse väljub täna kell kolmveerand kaks.', 'Sõit kestab kaks ja pool tundi.', 'Buss on Pärnus kell veerand viis.', 'Bussis on tasuta internet.', 'Järgmine buss Pärnusse väljub kell pool kuus.',
      ], ['Buss sõidab [Pärnusse].', 'Buss väljub kell [kolmveerand kaks|13.45].', 'Sõit kestab [kaks ja pool] tundi.', 'Buss on Pärnus kell [veerand viis|16.15].', 'Järgmine buss väljub kell [pool kuus|17.30].']),
      B.listening('015_p_listen2', 'Kuulamine 2. Telefonikõne.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Juuksur Mari, tere!', '— Tere! Siin Liis. Ma tahan aega juukselõikusele.', '— Kas reedel sobib? Meil on vaba aeg kell kümme.', '— Kahjuks reedel ma töötan. Kas laupäeval on aega?',
        '— Laupäeval oleme avatud kella kümnest kuni kaheni. Vaba aeg on kell pool üksteist.', '— Sobib. Kui kaua see kestab?', '— Umbes tund aega.',
      ], ['Reedel on vaba aeg kell [kümme|10].', 'Liis [töötab] reedel.', 'Laupäeval on juuksur avatud kella kümnest kuni [kaheni].', 'Liisi aeg on kell [pool üksteist|10.30].', 'Lõikus kestab umbes [tund aega|tund].']),
      B.gaps('015_p_mix', 'Keel. Viis punkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Kell on [pool] kolm. (2.30)', 'Pood on avatud kella üheksast kuni [viieni]. (viis)', 'Ma ei suitseta [mitte kunagi]. (0%)', '[Esmaspäeval] on mul tund. (esmaspäev)', 'Ta [läheb] tööle kell kaheksa. (minema)',
      ]),
      B.gaps('015_p_mix2', 'Keel. Veel viis punkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma käin [ujumas] kord nädalas. (ujuma)', 'Tule enne kella [kümmet]. (kümme)', '[Laupäeviti] ma koristan. (iga laupäev)', 'Me [sööme] õhtusööki kell seitse. (sööma)', 'Tund kestab [poolteist] tundi. (1,5)',
      ]),
      B.errorfix('015_p_fix', 'Keel. Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma lähe tööle kell kaheksa.', 'Ma lähen tööle kell kaheksa.'], ['Pood on avatud kella üheksa kuni viis.', 'Pood on avatud kella üheksast kuni viieni.'], ['Reedeel ma puhkan.', 'Reedel ma puhkan.'], ['Ma suitsetan mitte kunagi.', 'Ma ei suitseta mitte kunagi.'], ['Tund kestab poolteist tund.', 'Tund kestab poolteist tundi.'],
      ]),
      B.wordorder('015_p_order', 'Keel. Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Jooga algab kell kuus õhtul.', 'Tavaliselt ma käin trennis reedeti.', 'Pärast tööd ma olen väsinud.', 'Buss väljub kell pool kuus.', 'Ma ei suitseta mitte kunagi.']),
      B.translation('015_p_tr', 'Keel. Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Который час? Четверть пятого.', 'Я работаю с восьми до четырёх.', 'Я редко хожу в кино.', 'В субботу мы отдыхаем.', 'Сначала я ем, потом иду на работу.']),
      B.dictation('015_p_dict', 'Keel. Etteütlus.', 'Kuula ja kirjuta laused.', ['Kell on veerand viis.', 'Ma käin ujumas kaks korda nädalas.', 'Reedel on mul vaba päev.', 'Tund kestab poolteist tundi.'], 4),
      B.writing('015_p_write', 'Kirjutamine. Sõnum klubile.', 'Kirjuta spordiklubile 4–6 lauset: mis tundi tahad tulla ja millal.', [4, 6], ['tahan', 'kell', 'esmaspäeval'], 2),
      B.speaking('015_p_say', 'Rääkimine. Minu päev.', 'Vasta õpetaja küsimustele, nagu eksamil.', ['Mis kell te tavaliselt ärkate?', 'Mis kellast mis kellani te töötate või õpite?', 'Kui tihti te sporti teete?', 'Mida te teete nädalavahetusel?'], [60, 90]),
      B.selfcheck('015_p_self', ['Ma saan aru kuulutusest ja sõnumist.', 'Ma kuulen kellaaegu ja päevi.', 'Ma kasutan aja ja sageduse vorme õigesti.', 'Ma vastan küsimustele oma päeva kohta.'], 'Kontroll tehtud'),
    ],
    transfer: [
      B.text('015_t_situation', 'Kontroll: kirjutamine ja rääkimine', 'Keelekursusel algab uus periood. Sofia ja Liis vaatavad uut nädalaplaani. Sina kirjutad oma päevakava ja nädala plaani ning räägid oma päevast. Õpetaja hindab, eesmärk on vähemalt 70%.'),
      B.listening('015_t_listen', 'Kuulamine. Uus tunniplaan.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Head õpilased! Uus tunniplaan algab esmaspäeval.', 'Tunnid on esmaspäeviti ja kolmapäeviti kella kuuest kuni pool kaheksani.', 'Neljapäeviti on vestlusklubi, see kestab tund aega.',
        'Reedel tunde ei ole.', 'Kontrolltöö on kahe nädala pärast, kolmapäeval.',
      ], ['Uus tunniplaan algab [esmaspäeval].', 'Tunnid on kella kuuest kuni [pool kaheksani|19.30].', 'Vestlusklubi on [neljapäeviti|neljapäeval].', 'Vestlusklubi kestab [tund aega|tund].', 'Kontrolltöö on [kolmapäeval].']),
      B.reading('015_t_read', 'Lugemine. Liisi sõnum.', 'Loe sõnumit ja vasta küsimustele.', 'Tere, Sofia!',
        'Kas sa nägid uut tunniplaani? Mulle sobib see väga. Esmaspäeval ja kolmapäeval olen ma vaba kella viiest. Neljapäeviti töötan ma raamatukogus kella kuueni. Vestlusklubi algab kell seitse, nii et ma jõuan. Kas me joome enne tundi koos kohvi? Kohvik keelekooli kõrval on avatud kella kaheksani. Ma söön seal tavaliselt lõunat. Kas Kati tuleb ka mõnikord kaasa? Ta on nii tore! Tunnid on nüüd hiljem, see on mulle hea. Ma ostsin juba uue vihiku ja pastaka. Kirjuta mulle, mis päev sulle sobib. Liis',
        [['Mis kellast on Liis esmaspäeval vaba?', 'kella viiest|viiest|17'], ['Kus Liis neljapäeviti töötab?', 'raamatukogus'], ['Mis kell algab vestlusklubi?', 'kell seitse|seitse|19'], ['Mida Liis tahab enne tundi teha?', 'koos kohvi juua|juua kohvi'], ['Mis kellani on kohvik avatud?', 'kella kaheksani|kaheksani|20']]),
      B.clock('015_t_clock', 'Kontrolli kellaaegu.', 'Kirjuta kellaaeg sõnadega.', [
        { time: '18:00', extra: '' }, { time: '19:30', extra: '' }, { time: '17:00', extra: '' }, { time: '19:00', extra: '' }, { time: '20:00', extra: '' }, { time: '16:45', extra: 'kolmveerand viis' },
      ]),
      B.table('015_t_day', 'Kirjutamine 1. Minu päevakava.', 'Kirjuta oma argipäeva päevakava.', 'Kell, Mida ma teen?', ['hommikul kell … | ', 'enne lõunat | ', 'lõuna ajal | ', 'pärastlõunal | ', 'õhtul | ', 'kell … lähen magama | ']),
      B.planning('015_t_plan', 'Enne kirjutamist.', 'Kirjuta märksõnad oma nädala kohta.', ['Mida sa teed argipäeviti?', 'Kui tihti sa sporti teed või kursusel käid?', 'Mida sa teed nädalavahetusel?'], 2),
      B.letter('015_t_letter', 'Kirjutamine 2. Minu nädal.', 'Kirjuta sõbrale 70–90 sõna oma nädalast. Kasuta: kõigepealt, siis, pärast seda, aga.', 'Tere!', 'Kohtumiseni!', [70, 90]),
      B.writing('015_t_write', 'Kirjutamine 3. Sõnum.', 'Kirjuta Liisile 4–6 lauset: millal sa saad kohvikusse ja vestlusklubisse tulla.', [4, 6], ['kell', 'neljapäeval', 'pärast'], 2),
      B.speaking('015_t_say', 'Rääkimine 1. Minu päev.', 'Räägi oma tavalisest päevast umbes poolteist minutit.', ['Mis kell sinu päev algab ja lõpeb?', 'Mida sa teed hommikul, päeval ja õhtul?', 'Kui tihti sa sporti teed või sõpradega kohtud?', 'Mis on sinu nädala kõige kiirem päev?'], [60, 120]),
      B.rolecards('015_t_roles', 'Rääkimine 2. Kokkulepe.', 'Leppige kokku, millal te koos õpite.', 'Sinu nädal: E ja K tunnid 18–19.30, N töö kella kuueni, L vaba. Paku kaks aega ja ütle, kui kaua te õpite.', 'Sinu nädal: T ja N trenn kell seitse, R tööl hilja, L hommikul vaba. Vali aeg ja küsi, kus te kohtute.', ['Kas … kell … sobib?', 'Ma olen vaba alates …'], ['Kahjuks …, sest …', 'Kohtume … kell …']),
      B.rubric('015_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti. Kokku 70% = kontroll on sooritatud.', ['Päevakava on täidetud, kellaajad on õiged.', 'Nädala tekstis on 70–90 sõna ja vähemalt viis seosesõna.', 'Aeg ja sagedus on õiges vormis: kella …st, esmaspäeviti, harva.', 'Suuline tekst kestab umbes poolteist minutit.', 'Dialoogis lepitakse aeg kokku.']),
      B.selfcheck('015_t_self', ['Ma kirjutan oma päevakava ja nädala plaani.', 'Ma saan aru tunniplaanist ja sõnumist.', 'Ma räägin oma päevast poolteist minutit.', 'Ma lepin kokku aja.'], 'Moodul 3 on läbitud'),
    ],
  },
};
