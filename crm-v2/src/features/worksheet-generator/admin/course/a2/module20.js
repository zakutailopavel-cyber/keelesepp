// A2 course (A1 → A2 roadmap), module 20 „A2 eksam ja iseseisev keelekasutus” (a2-096…100), stage A2.
// The whole module, all three phases: exam strategies (096), two full Harno A2 mocks with new content (097, 099),
// error correction of the weakest skill between them (098) and the final A2 check with self-assessment and an
// A2 → B1 plan (100). Harno A2: 80 points, 20 per skill, pass 60 % (48 p) with no skill at 0; KeeleSepp aims at 70 %.
// The mocks follow the exam's task formats (docs/HARNO_LEVEL_REQUIREMENTS.md) with original texts only.
// Reading and listening are on Harjuta, writing and speaking on Kasuta; listening texts are read twice by the teacher.
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-20', course: 'a2', title: 'A2 eksam ja iseseisev keelekasutus', level: 'A2', design: 'v2', template: 'v3' };

const TR = (id, rows) => B.translation(id, 'Tõlgi.', 'Kirjuta eesti keeles.', rows);
const D = (id, rows) => B.dictation(id, 'Etteütlus.', 'Kuula ja kirjuta laused.', rows);
const POINTS = 'Punktid: õiged vastused : kõik vastused × 20.';

export const LESSONS = {
  'a2-096': {
    title: 'A2 osaoskuste strateegiad',
    canDo: 'Ma valin igale A2 eksami osale ühe strateegia ja kontrollin sellega oma vastust neljas minijaamas.',
    template: 'v3',
    discover: [
      B.text('096_d_situation', 'Kuu aega eksamini', 'Markus teeb kuu aja pärast A2 eksami. Ta on natuke närvis. Ta küsib nõu Sofialt. Sofia tegi eksami eelmisel aastal. Mida sina juba eksamist tead?'),
      B.truefalse('096_d_guess', 'Mida sa arvad?', 'Enne lugemist: kas lause on õige või vale?', [
        ['A2 eksamil on neli osa.', true],
        ['Kuulamisteksti kuuleb ainult üks kord.', false],
        ['Kirjutamises on kaks ülesannet.', true],
        ['Iga osa eest saab kuni 20 punkti.', true],
        ['Rääkimise osa teeb iga inimene üksi.', false], ['Lugemises tuleb iga sõna tõlkida.', false], ['Eksamil on ka kirjutamise osa.', true], ['Rääkimises võib paluda korrata.', true]], 'full'),
      B.reading('096_d_read', 'Loe: Sofia nõuanded.', 'Loe Sofia kirja ja vasta küsimustele.', 'Sofia kiri Markusele',
        'Tere, Markus! Eksam ei ole nii hirmus, kui sa arvad. Seal on neli osa: kirjutamine, kuulamine, lugemine ja rääkimine. Iga osa eest saab kuni 20 punkti. Lugemises loe kõigepealt küsimust. Siis otsi tekstist märksõna. Ära tõlgi iga sõna! Kuulamises kuuled iga teksti kaks korda. Esimesel korral kirjuta lühidalt, teisel korral kontrolli. Kirjutamises on kaks ülesannet. Vasta kõigile küsimustele, mis on juhises. Kirjuta vähemalt 25 või 30 sõna. Lõpus loe oma tekst veel kord läbi. Rääkimises on sul paariline. Kui sa ei saa aru, palu julgelt korrata. Mina kaotasin kõige rohkem punkte kirjutamises. Mul sai seal aeg otsa. Nüüd ma tean: vaata kella! Edu sulle! Sofia',
        [['Mitu osa on eksamil?', 'neli|4|neli osa'], ['Mida peab lugemises kõigepealt tegema?', 'lugema küsimust|loe küsimust|lugema kõigepealt küsimust'], ['Mitu korda kuuleb kuulamisteksti?', 'kaks korda|kaks|2'], ['Mida tuleb kuulamises teisel korral teha?', 'kontrollida|kontrolli|kontrollida vastuseid'], ['Mida teha rääkimises, kui sa ei saa aru?', 'paluda korrata|palu korrata|küsida uuesti'], ['Miks kaotas Sofia kirjutamises punkte?', 'aeg sai otsa|tal sai aeg otsa|sest aeg sai otsa'], ['Mis osad on eksamil?', 'kirjutamine, kuulamine, lugemine ja rääkimine|kirjutamine, kuulamine, lugemine, rääkimine'], ['Mida tuleb kirjutamise lõpus teha?', 'loe tekst läbi|lugeda tekst läbi|tekst veel kord läbi lugeda']]),
      B.notice('096_d_notice', 'Märka juhise tegusõnu.', ['**Loe** kõigepealt küsimust.', '**Otsi** tekstist märksõna.', '**Ära tõlgi** iga sõna!', 'Teisel korral **kontrolli**.', 'Kui ei saa aru, ütle: „Palun **korrake**!”', 'käsk: **loe, otsi, kontrolli** · keeld: **ära** + sama vorm'], 'full'),
      B.listening('096_d_listen', 'Kuula: Markuse häälsõnum.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Sofia! Siin Markus. Aitäh sinu kirja eest!',
        'Ma lugesin seda bussis kaks korda.',
        'Minu jaoks on kõige raskem kuulamine. Inimesed räägivad nii kiiresti.',
        'Nüüd kuulan ma iga päev raadiot, umbes kümme minutit.',
        'Lugemine on kergem. Seal on mul rohkem aega.',
        'Kas sa saad laupäeval minuga harjutada? Näiteks kell kaks raamatukogus?',
        'Ma võtan kaasa vanad eksamiülesanded. Helista mulle!',
      ], ['Markus luges kirja [bussis].', 'Markusele on kõige raskem [kuulamine].', 'Iga päev kuulab ta [raadiot].', 'Ta kuulab umbes [kümme minutit|10 minutit].', 'Ta tahab harjutada [laupäeval].', 'Nad kohtuvad [raamatukogus].', 'Lugemises on Markusel rohkem [aega].', 'Markus võtab kaasa vanad [eksamiülesanded].']),
      B.gaps('096_d_gaps', 'Anna nõu.', 'Kirjuta lünka sobiv käsk. Pangas on lisasõnu.', [
        '[Loe] kõigepealt küsimust.', '[Otsi] tekstist märksõna.', '[Ära tõlgi] iga sõna.', 'Teisel korral [kontrolli] vastust.', 'Kui sa ei saa aru, [küsi] uuesti.', 'Kirjutamise ajal [vaata] kella!', 'Kuulamises [kirjuta] lühidalt 1–2 sõna.', 'Rääkimises [palu] julgelt korrata.',
      ], ['loe', 'loeb', 'otsi', 'ära tõlgi', 'ära tõlgib', 'kontrolli', 'küsi', 'vaata', 'kirjuta', 'palu']),
      D('096_d_dict', ['Loe kõigepealt küsimust.', 'Otsi tekstist märksõna.', 'Kuulamistekst on kaks korda.', 'Kirjuta vähemalt kolmkümmend sõna.', 'Lõpus loe tekst läbi.', 'Palun korrake!', 'Vaata kella!', 'Edu eksamil!']),
      B.speaking('096_d_say', 'Mis on sinu jaoks raske?', 'Räägi paarilisele umbes 1 minut.', ['Milline osa on sinu jaoks kõige raskem?', 'Miks?', 'Mis sind aitab?', 'Mida sa eksamipäeval kindlasti teed?', 'Kuidas sa enne eksamit puhkad?'], [60, 90], ['Minu jaoks on kõige raskem…, sest…', 'Mind aitab, kui ma…']),
      B.writing('096_d_write', 'Minu eksamiplaan.', 'Kirjuta 7–9 lauset: mis on raske, mida harjutad, millal.', [7, 9], ['raske', 'harjutan', 'iga päev'], 2),
    ],
    practice: [
      B.tip('096_p_how', 'Neli minijaama', 'Igas jaamas: loe ülesannet → vali strateegia → kontrolli vastust. Igas jaamas on umbes 10 minutit.', 'full'),
      B.reading('096_p_read', 'Jaam 1. Loe kuulutust.', 'Leia märksõna ja vasta lühidalt.', 'Kuulutus trepikojas',
        'Head elanikud! Esmaspäeval, 14. novembril, ei ole majas sooja vett. Torumehed parandavad keldris vanu torusid. Töö algab kell kaheksa hommikul. Töö lõpeb kell neli pärastlõunal. Palun ärge pange sel ajal pesumasinat tööle. Külma vett saab kasutada nagu tavaliselt. Keldri uks on sel päeval lahti. Palun ärge jätke keldrisse jalgrattaid ega kaste. Kui teil on küsimusi, helistage majahaldurile. Tema number on 5566 7788. Majahaldur vastab tööpäeviti kella üheksast viieni. Õhtul ja nädalavahetusel võib kirjutada e-kirja. Kui keldris on vesi põrandal, helistage kohe. Vabandame ebamugavuse pärast! Majaühistu',
        [['Mis päeval ei ole sooja vett?', 'esmaspäeval|14. novembril'], ['Kus torumehed töötavad?', 'keldris'], ['Mis kell töö lõpeb?', 'kell neli|kell 16|neli pärastlõunal'], ['Mida ei tohi sel ajal teha?', 'pesumasinat tööle panna|pesumasinat kasutada|pesu pesta'], ['Kellele saab helistada?', 'majahaldurile'], ['Mis kell töö algab?', 'kell kaheksa|kaheksa hommikul|8'], ['Mis on majahalduri telefoninumber?', '5566 7788|55667788'], ['Mida teha, kui keldris on vesi põrandal?', 'helistada kohe|helista kohe|kohe helistada']]),
      B.listening('096_p_listen', 'Jaam 2. Kuula teadet.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, head kuulajad! Linna raamatukogus on uus kursus.',
        'Kursus on kõigile, kes õpivad eesti keelt.',
        'Tunnid on teisipäeviti kell kuus õhtul.',
        'Kursus algab kolmandal detsembril ja kestab kaks kuud.',
        'Kursus on tasuta, aga registreerida tuleb ette.',
        'Registreerida saab raamatukogu kodulehel või telefoni teel.',
        'Kaasa võtke vihik ja pastakas. Raamatud saate raamatukogust.',
        'Tunnid on teisel korrusel, saalis number viis.',
      ], ['Kursus on [raamatukogus|linna raamatukogus].', 'Tunnid on [teisipäeviti|teisipäeval].', 'Tund algab kell [kuus|6|18].', 'Kursus kestab [kaks kuud|2 kuud].', 'Kursus maksab: [tasuta|ei maksa midagi].', 'Kaasa tuleb võtta vihik ja [pastakas|pastaka].', 'Saal on [teisel|2.] korrusel.', 'Raamatud saab [raamatukogust].']),
      B.choice('096_p_strat', 'Jaam 1. Lugemine: mis aitab?', 'Vali parim strateegia.', [
        ['Küsimus: „Mis kell pood suletakse?” Mida otsid tekstist?', 'kellaaega', 'poe nime', 'hinda'],
        ['Tekstis on palju uusi sõnu. Mida teed?', 'Otsin ainult vajalikku infot.', 'Tõlgin iga sõna.', 'Jätan ülesande vahele.'],
        ['Sa ei tea vastust ja aega on vähe. Mida teed?', 'Valin kõige loogilisema vastuse.', 'Jätan vastuse tühjaks.', 'Kirjutan kaks vastust.'],
        ['Ülesandes on kolm sõnumit ja kuus küsimust. Mida teed kõigepealt?', 'Loen küsimused läbi.', 'Õpin sõnumid pähe.', 'Kirjutan sõnumid ümber.'],
        ['Juhis ütleb: „Vasta 1–2 sõnaga.” Mis on hea vastus?', 'kell kuus', 'Ta tuleb koju kell kuus õhtul.', 'Ma arvan, et kuus.'], ['Kuulamises ei saanud sa esimesel korral aru. Mida teed?', 'Kuulan teisel korral hoolega.', 'Jätan ülesande vahele.', 'Lahkun ruumist.'], ['Kirjutamises on juhises neli punkti. Mida teed?', 'Vastan kõigile neljale punktile.', 'Vastan ainult ühele.', 'Kirjutan ainult nime.'], ['Rääkimises paariline räägib kiiresti. Mida ütled?', 'Palun korrake aeglasemalt!', 'Ma ei räägi.', 'Head aega!']]),
      B.cloze('096_p_cloze', 'Markuse kiri Sofiale.', 'Vali igasse lünka sobiv sõna.', 'Tere, Sofia!', [
        'Aitäh sinu {*kirja|kiri|kirjas} eest! Nüüd ma tean, mida eksamil teha.',
        '',
        'Lugemises loen kõigepealt {*küsimust|küsimus|küsimusega}. Kuulamises {*kuulen|kuulsin|kuulama} iga teksti kaks korda.',
        '',
        'Kirjutamises vaatan {*kella|kell|kellale}, sest ma ei taha, et aeg {*otsa|otsas|otsast} saab. Rääkimises palun {*korrata|korrake|kordama}, kui ma aru ei saa.',
        '',
        'Kas me saame laupäeval {*raamatukogus|raamatukokku|raamatukogust} kokku? Ma võtan {*kaasa|kaasas|kaasast} vanad ülesanded. Markus',
      ], 'g_vocab'),
      B.formtext('096_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Minu eksamiplaan', [
        'Kuu aja pärast [teen] (tegema) ma A2 eksami. Minu jaoks on kõige [raskem] (raske) kuulamine.',
        '',
        'Seepärast [kuulan] (kuulama) ma iga päev raadiot. Laupäeviti [harjutame] (harjutama) sõbraga [raamatukogus] (raamatukogu).',
        '',
        'Eksamil [loen] (lugema) ma kõigepealt küsimust ja [otsin] (otsima) tekstist märksõna.',
        '',
        'Kirjutamise lõpus [kontrollin] (kontrollima) oma teksti.',
      ], 'g_notice'),
      B.errorfix('096_p_fix', 'Jaam 3. Paranda sõnum.', 'Kirjuta lause õigesti.', [
        ['Ma pean minna arsti juurde.', 'Ma pean minema arsti juurde.'], ['Eile ma lähen kinno.', 'Eile ma läksin kinno.|Eile läksin ma kinno.'], ['Mina ei ole aega.', 'Mul ei ole aega.'], ['Ma ei tulin tööle.', 'Ma ei tulnud tööle.'], ['Kohtume bussipeatus juures.', 'Kohtume bussipeatuse juures.'], ['Ma helistan sulle õhtu.', 'Ma helistan sulle õhtul.'], ['Ma ootan sind kell viis kohvik ees.', 'Ma ootan sind kell viis kohviku ees.'], ['Me läheme koos kino.', 'Me läheme koos kinno.'],
      ]),
      TR('096_p_tr', ['Курс в библиотеке.', 'Я иду в библиотеку.', 'Урок начинается в шесть.', 'Курс длится до восьми.', 'Я пойду с другом.', 'Мне нужно взять с собой тетрадь.', 'Встретимся у автобусной остановки.', 'Прочитай сначала вопрос.']),
      B.speaking('096_p_say', 'Jaam 4. Tutvumine.', 'Vasta paarilise küsimustele, nagu eksami alguses.', ['Kus sa praegu elad?', 'Kellega sa koos elad?', 'Mida sa vabal ajal teed?', 'Miks sa eksamit teed?', 'Kui kaua sa eesti keelt õpid?'], [45, 75], ['Ma elan…', 'Vabal ajal ma…', 'Ma teen eksamit, sest…']),
    ],
    transfer: [
      B.text('096_t_situation', 'Proovijaam: Viktor', 'Viktor teeb kursusel proovijaama. Tal on 30 minutit kirjutamiseks ja 15 minutit rääkimiseks. Sina oled Viktor. Kasuta strateegiaid, mida täna õppisid.'),
      B.notice('096_t_card', 'Visiitkaart', ['Mari Saar — juuksur', 'Ilusalong „Kaunis”, Pikk 7, Rakvere', 'Avatud: T–L kell 10–18', 'Aeg: 5123 4567 või mari@kaunis.ee'], 'full', 'g_read'),
      B.errorfix('096_t_fix', 'Kontrolli Viktori mustandit.', 'Paranda viga.', [
        ['Mari töötab ilusalong.', 'Mari töötab ilusalongis.'], ['Salong on avatud kell kümme kuni kuus.', 'Salong on avatud kella kümnest kuueni.'], ['Sa pead helistama või kirjutada.', 'Sa pead helistama või kirjutama.'], ['Mina meeldib see juuksur.', 'Mulle meeldib see juuksur.'], ['Eile ma ei käisin seal.', 'Eile ma ei käinud seal.'], ['Ma tahan minna juuksurile.', 'Ma tahan minna juuksuri juurde.'], ['Kontsert algab laupäev kell seitse.', 'Kontsert algab laupäeval kell seitse.'], ['Kohtume kontserdimaja ees kell pool seitsme.', 'Kohtume kontserdimaja ees kell pool seitse.']]),
      B.letter('096_t_info', 'Kirjutamine 1. Soovita juuksurit.', 'Sõbranna otsib juuksurit. Kirjuta: kes, kus, millal, kuidas ühendust võtta.', 'Tere, Liis!', 'Kallistan!', [40, 60]),
      B.letter('096_t_invite', 'Kirjutamine 2. Kutse.', 'Kutsu sõber laupäeval kontserdile. Kirjuta: kuhu, millal, kus kohtute, mida kaasa võtta.', 'Tere, Jaan!', 'Kirjuta, kas tuled!', [40, 60]),
      B.speaking('096_t_pic', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab pildi: pere pargis. Räägi umbes 1 minut.', ['Kes on pildil?', 'Kus nad on?', 'Mida nad teevad?', 'Mis aastaaeg see on?'], [60, 90], ['Pildil on…', 'Vasakul…, paremal…', 'Ma arvan, et…']),
      B.rolecards('096_t_idea', 'Rääkimine 2. Ideekaart „Toit”.', 'A küsib märksõnade järgi, B vastab. Siis vahetage.',
        'Küsi 5 küsimust: lemmiktoit, kus sööd, kes teeb süüa, kohvik, eilne õhtusöök.', 'Vasta 2–3 lausega. Kui ei saa aru, palu korrata.',
        ['Mis on sinu lemmiktoit?', 'Kes teie peres süüa teeb?', 'Mida sa eile õhtul sõid?'], ['Minu lemmiktoit on…', 'Vabandust, palun korrake!', 'Eile ma sõin…']),
      B.rubric('096_t_rubric', 'Kontrolli oma tööd.', 'Märgi, mis on tehtud.', ['Kirjutamine 1: kõik neli punkti — kes, kus, millal, kontakt.', 'Kirjutamine 2: vähemalt 40 sõna, kõik punktid on vastatud.', 'Lugesin teksti lõpus läbi ja parandasin vead.', 'Rääkimises palusin vajadusel korrata.']),
      B.selfcheck('096_t_self', ['Ma oskan juhise tegusõnu ja valin igale osale strateegia.', 'Ma oskan leida visiitkaardilt vajaliku info.', 'Ma oskan kontrollida vormi: kus, kuhu, kust, pean + ma-vorm.', 'Ma oskan kirjutada 40–60 sõna ja kutse 40–60 sõnaga.', 'Ma oskan kirjeldada pilti ja küsida ideekaardi järgi.'], 'Strateegia on olemas'),
    ],
  },

  'a2-097': {
    title: 'A2 proovieksam 1',
    assessment: true,
    canDo: 'Ma teen A2 proovieksami neli osa etteantud aja jooksul ja kirjutan üles oma punktid iga osaoskuse kohta.',
    discover: [
      B.text('097_d_situation', 'Proovieksami hommik', 'Täna teeb Jaan proovieksami. Ta tuleb kooli kell üheksa. Mida ta peab teadma? Mida ta peab kaasa võtma?'),
      B.truefalse('097_d_guess', 'Mida sa arvad?', 'Enne lugemist: kas lause on õige või vale?', [
        ['Eksamile tuleb võtta kaasa isikut tõendav dokument.', true],
        ['Lugemise osa kestab 30 minutit.', false],
        ['Kokku saab eksamil 80 punkti.', true],
        ['Eksam on sooritatud, kui tulemus on vähemalt 60 %.', true],
        ['Kui ühes osas on 0 punkti, on eksam ikkagi sooritatud.', false],
      ], 'full'),
      B.vocab('097_d_vocab', 'Eksamipäeva sõnad', ['isikutunnistus — удостоверение личности', 'pass — паспорт', 'paus — перерыв', 'kestma — длиться', 'sooritama — сдать (экзамен)', 'tulemus — результат', 'protsent — процент', 'paaris — в паре', 'väsinud — уставший', 'rahul — доволен']),
      B.reading('097_d_read', 'Loe: Jaani eksamipäev.', 'Loe tekst ja vasta küsimustele.', 'Jaani eksamipäev',
        'Jaan ärkas kell seitse. Ta sõi hommikust ja jõi tassi teed. Kotti pani ta isikutunnistuse, kaks pastakat ja veepudeli. Telefoni jättis ta koju. Kell üheksa algas kirjutamine. Jaanil oli aega 30 minutit. Esimeses ülesandes kirjutas ta visiitkaardi põhjal ühest arstist. Teises ülesandes kirjutas ta kutse sõbrale. Siis tuli kuulamine. Iga teksti kuulis ta kaks korda. Pärast väikest pausi oli lugemine. See kestis 50 minutit ja oli kõige pikem osa. Kõige raskem oli Jaanile kiri lünkadega. Ta ei olnud kindel, kas õige on „tulla” või „tulema”. Pärastlõunal oli rääkimine. Jaan rääkis paarilisega pildist. Siis küsis ta ideekaardi järgi küsimusi. Õhtul oli ta väsinud, aga rahul. Ta teab nüüd, mida veel harjutada.',
        [['Mida Jaan kotti pani?', 'isikutunnistuse, pastakad ja veepudeli|isikutunnistuse|dokumendi, pastakad ja vee'], ['Kus oli Jaani telefon?', 'kodus|ta jättis selle koju'], ['Mis osa oli kõige pikem?', 'lugemine'], ['Mis oli Jaanile kõige raskem?', 'kiri lünkadega|lünkadega kiri'], ['Mida Jaan rääkimises tegi?', 'rääkis pildist ja küsis küsimusi|rääkis pildist|küsis ideekaardi järgi'], ['Miks oli Jaan õhtul rahul?', 'ta teab, mida harjutada|ta teab nüüd, mida veel harjutada|ta tegi eksami ära']]),
      B.notice('097_d_notice', 'Eksami ajad ja punktid', ['Kirjutamine — **30 min**, 2 ülesannet, **20 p**', 'Kuulamine — **30 min**, 4 ülesannet, **20 p**', 'Lugemine — **50 min**, 5 ülesannet, **20 p**', 'Rääkimine — umbes **15 min** paaris, 2 ülesannet, **20 p**', 'Kokku **80 p**. Sooritatud: vähemalt **48 p (60 %)** ja ükski osa ei ole **0 p**.'], 'full'),
      B.diagram('097_d_line', 'timeline', { title: 'Jaani eksamipäev.', instruction: 'Kirjuta puuduv osa.', nodes: '9.00 | [Kirjutamine] — 30 minutit\n9.30 | [Kuulamine] — 30 minutit\n10.15 | [Lugemine] — 50 minutit\n14.00 | [Rääkimine] — paaris' }, 'full'),
      B.gaps('097_d_points', 'Arvuta punktid.', 'Kirjuta number sõnade või numbriga.', [
        'Eksamil on kokku [80|kaheksakümmend] punkti.', 'Iga osa eest saab kuni [20|kakskümmend] punkti.', '60 % 80 punktist on [48|nelikümmend kaheksa] punkti.', 'Markusel on 50 punkti, aga kuulamises 0. Eksam [ei ole] sooritatud.', 'Sofial on 52 punkti, igas osas üle 10. Eksam [on] sooritatud.', 'Lugemise osa kestab [50|viiskümmend] minutit.',
      ]),
      B.match('097_d_match', 'Juhis ja tegevus.', 'Ühenda juhis ja see, mida sa teed.', [['Ühenda.', 'Panen kokku kaks osa.'], ['Vali õige vastus.', 'Märgin ühe kolmest.'], ['Kirjuta 1–2 sõna.', 'Kirjutan väga lühidalt.'], ['Kirjuta vähemalt 30 sõna.', 'Kirjutan lühikese teksti.'], ['Märgi, kas lause on õige.', 'Kirjutan Õ või V.'], ['Kirjelda pilti.', 'Räägin, mida pildil näen.']], 'full', 'g_vocab'),
      TR('097_d_tr', ['Повторите, пожалуйста.', 'Я не понял вопрос.', 'Сколько у меня времени?', 'Где мне писать ответ?', 'Я закончил.', 'Можно мне воды?', 'Я взял с собой паспорт.', 'Экзамен начинается в девять.']),
      B.choice('097_d_choice', 'Mida võtad kaasa?', 'Vali õige vastus.', [
        ['Mida on eksamil kindlasti vaja?', 'isikutunnistust või passi', 'sõnaraamatut', 'telefoni'],
        ['Millega kirjutad eksamil?', 'pastakaga', 'telefoniga', 'arvutiga'],
        ['Kus on sinu telefon eksami ajal?', 'kotis või kodus', 'laual', 'käes'],
        ['Mis osa on kõige pikem?', 'lugemine', 'kirjutamine', 'rääkimine'],
        ['Kellega teed rääkimise osa?', 'paarilisega', 'üksi', 'sõbraga telefonis'],
        ['Mitu korda kuuled kuulamisteksti?', 'kaks korda', 'üks kord', 'kolm korda'],
      ]),
      B.table('097_d_plan', 'Minu eksamipäeva plaan.', 'Kirjuta oma plaan.', 'Mis, Minu vastus', ['Mis kell ma ärkan? | ', 'Mida ma hommikul söön? | ', 'Mida ma kotti panen? | ', 'Kuidas ma kooli sõidan? | ', 'Mida ma pärast eksamit teen? | ']),
      B.writing('097_d_write', 'Minu eksamipäev.', 'Kirjuta 5–7 lauset: mida võtad kaasa, mis kell tuled, mida teed pärast.', [5, 7], ['kaasa', 'kell', 'pärast'], 2),
      B.speaking('097_d_say', 'Kuidas sa end tunned?', 'Räägi paarilisele umbes 1 minut.', ['Kuidas sa end enne eksamit tunned?', 'Mida sa eksami hommikul teed?', 'Milline osa on sulle kõige kergem?'], [60, 90], ['Ma olen natuke närvis, sest…', 'Hommikul ma…', 'Kõige kergem on…']),
      B.rolecards('097_d_call', 'Eksamile registreerimine.', 'A helistab keelekooli, B vastab. Siis vahetage.',
        'Küsi: millal on proovieksam, mis kell, kus, mida kaasa võtta.', 'Vasta: laupäeval kell 9, ruum 12, isikutunnistus ja pastakas.',
        ['Millal on proovieksam?', 'Kus see toimub?', 'Mida ma pean kaasa võtma?'], ['Proovieksam on…', 'Ruum on…', 'Võtke kaasa…']),
    ],
    practice: [
      B.tip('097_p_how', 'Lugemine ja kuulamine (eksami vormis)', `Tee see osa nagu eksamil: lugemine 50 minutit, kuulamine 30 minutit. Ära kasuta sõnaraamatut. Kuulamistekstid loeb õpetaja kaks korda. ${POINTS}`, 'full'),
      // reading 1: everyday phrases and politeness (6 items, 3 options)
      B.choice('097_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sõbral on sünnipäev. Mida ütled?', 'Palju õnne!', 'Head paranemist!', 'Jõudu tööle!'],
        ['Kolleeg läheb puhkusele. Mida ütled?', 'Head puhkust!', 'Head isu!', 'Tere tulemast!'],
        ['Sa astud bussis kogemata võõrale jalale. Mida ütled?', 'Vabandust!', 'Pole tänu väärt!', 'Terviseks!'],
        ['Keegi ütleb sulle „Aitäh!”. Mida vastad?', 'Pole tänu väärt.', 'Vabandust, ma ei tea.', 'Head aega!'],
        ['Sa helistad ja vastab võõras inimene. Mida ütled?', 'Vabandust, valisin vale numbri.', 'Tere, kuidas läheb?', 'Ma helistan homme jälle.'],
        ['Naaber aitas sul kotte tassida. Mida ütled?', 'Suur aitäh abi eest!', 'Palun, võta veel!', 'Pole viga, juhtub!'],
      ]),
      // reading 2: three short texts (~55 words each), answers by letter
      B.reading('097_p_three', 'Lugemine 2. Kolm teksti.', 'Loe tekste. Vasta tähega (A, B, C) ja lühidalt.', 'Kuulutus, teade, sõnum',
        'A. Müüa laste jalgratas. Ratas on punane ja peaaegu uus. Poeg sõitis sellega ainult ühe suve. Nüüd on ta pikemaks kasvanud. Ratas sobib 5–8-aastasele lapsele. Kaasa anname ka kiivri. Hind on 40 eurot. Ratast saab vaadata õhtuti pärast kella kuut. Asume Tallinnas, Lasnamäel. Helista: 5512 3344. Olga\n\nB. Tähelepanu, ujula külastajad! Alates 1. märtsist muutuvad lahtiolekuajad. Esmaspäevast reedeni oleme avatud kella seitsmest kümneni. Laupäeval ja pühapäeval oleme avatud kella üheksast kaheksani. Pühapäeva hommikul on peredele sooduspilet. Ujulasse tuleb võtta ujumismüts. Mütsi saab osta ka kassast.\n\nC. Tere, Markus! Kas sa saad mind laupäeval kolimisel aidata? Minu uus korter on Kalamajas, kolmandal korrusel. Lifti majas ei ole. Auto on mul olemas, aga kapp ja diivan on väga rasked. Alustame kell kümme. Pärast teen kõigile pitsat. Palun anna täna õhtul teada! Andrei',
        [['Kes vajab abi?', 'C|Andrei'], ['Kust saab osta mütsi?', 'B|kassast|ujula kassast'], ['Kellele sobib ratas?', 'A|5–8-aastasele lapsele|lapsele'], ['Millal on ujula nädalavahetusel avatud?', 'B|kella üheksast kaheksani|9–20'], ['Miks on Andreil abi vaja?', 'C|kapp ja diivan on rasked|lifti ei ole'], ['Mis kell saab ratast vaadata?', 'A|pärast kella kuut|õhtuti pärast kuut']]),
      // reading 3: notices matched to information (5 items, 2 extra signs)
      B.notice('097_p_signlist', 'Lugemine 3. Sildid', ['A — Apteek: retseptiravimid ainult apteekrilt', 'B — Ujumine keelatud! Vesi on sügav', 'C — Pakiautomaat: võta pakk 7 päeva jooksul', 'D — Postkontor: E–R 9–18, L 10–14', 'E — Parkimine ainult elanikele', 'F — Lasteaed: palun sulge värav!', 'G — Kohvik remondi tõttu suletud'], 'full', 'g_read'),
      B.table('097_p_signs', 'Lugemine 3. Kus see silt on?', 'Kirjuta iga info juurde sildi täht. Kaks silti jääb üle.', 'Info, Silt', [
        'Sa tahad laupäeval kirja saata. | [D]', 'Sinu pakk ootab sind üks nädal. | [C]', 'Siin ei tohi vette minna. | [B]', 'Siin ei saa praegu kohvi juua. | [G]', 'Lapsed ei tohi üksi tänavale joosta. | [F]',
      ], 'g_read'),
      // reading 4: a ~150-word text, 5 questions with 3 options
      B.reading('097_p_text', 'Lugemine 4. Anna uus hobi.', 'Loe tekst. Siis vasta kahele küsimusele lühidalt.', 'Anna uus hobi',
        'Anna töötab raamatupidajana. Ta istub terve päeva arvuti taga. Eelmisel aastal hakkas tal selg valutama. Arst ütles, et Anna peab rohkem liikuma. Alguses ei teadnud Anna, mida teha. Jooksmine tundus talle igav ja jõusaal liiga kallis. Siis nägi ta raamatukogus kuulutust. Kepikõnni rühm otsis uusi liikmeid. Rühm kohtub kaks korda nädalas Pirita metsas. Osalemine on tasuta ja kepid saab alguses laenata. Anna läks esimest korda vihmase ilmaga. Rühmas oli kaheksa inimest, enamik neist pensionärid. Kõik olid väga sõbralikud. Juhendaja näitas, kuidas keppe õigesti hoida. Nüüd käib Anna rühmas juba pool aastat. Selg enam ei valuta. Tal on palju uusi tuttavaid. Laupäeviti joovad nad pärast kõndi koos teed. Järgmisel kuul plaanib rühm matka Lahemaale.',
        [['Kus rühm kohtub?', 'Pirita metsas|metsas'], ['Kui kaua käib Anna juba rühmas?', 'pool aastat|kuus kuud']]),
      B.choice('097_p_textmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali üks vastus.', [
        ['Miks pidi Anna rohkem liikuma?', 'Tal valutas selg.', 'Ta tahtis kaalust alla võtta.', 'Ta sai uue töö.'],
        ['Miks ei läinud Anna jõusaali?', 'See oli liiga kallis.', 'See oli liiga kaugel.', 'Seal oli liiga palju inimesi.'],
        ['Kust sai Anna rühmast teada?', 'raamatukogu kuulutusest', 'arstilt', 'kolleegilt'],
        ['Mis on rühmas alguses tasuta?', 'osalemine ja kepid', 'ainult tee', 'matk Lahemaale'],
        ['Mida teeb rühm laupäeviti pärast kõndi?', 'joob koos teed', 'läheb matkale', 'käib jõusaalis'],
      ]),
      // reading 5: a personal letter (~100 words), 8 gaps with 3 options
      B.cloze('097_p_cloze', 'Lugemine 5. Kiri sõbrannale.', 'Vali igasse lünka sobiv sõna.', 'Tere, Sofia!', [
        'Aitäh sinu kirja eest! Mul läheb hästi. Eelmisel nädalal {*kolisime|kolime|kolima} uude korterisse. Korter on {*kesklinnas|kesklinna|kesklinnast}, bussipeatuse lähedal. Nüüd ma ei pea enam autoga {*sõitma|sõita|sõidan}. Tööle lähen jalgsi, see võtab ainult kümme minutit. Meil on kaks tuba ja suur köök. {*Köögis|Kööki|Köögist} on aken parki. Lapsed on väga rahul, sest kool on {*maja|majas|majast} kõrval.',
        '',
        'Kas sa {*tahad|tahta|tahtma} meile külla tulla? Sa võid {*tulla|tulema|tuled} näiteks järgmisel laupäeval. Ma teen {*sulle|sinu|sind} oma kuulsat õunakooki.',
        '',
        'Kallistan, Anna',
      ]),
      // listening: an announcement (monologue), answers of 1–2 words
      B.listening('097_p_listen', 'Kuulamine 1. Teade jaamas.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Head reisijad! Tallinnast Tartusse sõitev rong väljub täna hiljem.',
        'Rong ei välju kell kümme, vaid kell kümme kolmkümmend.',
        'Põhjus on tehniline rike.',
        'Rong väljub teiselt platvormilt.',
        'Rongis on avatud kohvik. Kohvik on kolmandas vagunis.',
        'Pileti saab osta rongist, kaardiga või sularahas.',
        'Pensionäridele ja õpilastele on pilet poole odavam.',
        'Jalgratta võib panna esimesse vagunisse.',
        'Vabandame hilinemise pärast ja soovime head reisi!',
      ], ['Rong sõidab Tallinnast [Tartusse].', 'Rong väljub kell [kümme kolmkümmend|10.30|pool üksteist].', 'Hilinemise põhjus on tehniline [rike].', 'Rong väljub [teiselt|2.] platvormilt.', 'Kohvik on [kolmandas|3.] vagunis.', 'Pensionäridele on pilet poole [odavam].', 'Jalgratta saab panna [esimesse|1.] vagunisse.']),
      // listening: a dialogue on personal life, answers of 1–2 words
      B.listening('097_p_listen2', 'Kuulamine 2. Laupäeva plaan.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Markus! Kas sul on laupäeval aega?', '— Tere, Liis! Hommikul mitte, siis on mul trenn. Mis sa plaanid?',
        '— Ma tahan minna loomaaeda. Tütar tahab näha uusi tiigreid.', '— Tore mõte! Mis kell te lähete?',
        '— Me tahtsime minna kell üksteist. Aga sinu trenn…', '— Trenn lõpeb kell kaksteist. Kas kell üks sobib?',
        '— Sobib küll. Kus me kohtume?', '— Loomaaia värava juures. Ma tulen bussiga.',
        '— Hea. Ma võtan kaasa võileivad ja mahla.', '— Siis mina ostan piletid. Täiskasvanu pilet maksab kaksteist eurot.',
        '— Aga lapse pilet?', '— Lapse pilet maksab kuus eurot.',
        '— Hästi. Ja kui sajab vihma?', '— Siis läheme hoopis muuseumi. Näeme laupäeval!',
      ], ['Laupäeva hommikul on Markusel [trenn].', 'Liisi tütar tahab näha [tiigreid|uusi tiigreid].', 'Nad kohtuvad kell [üks|1|13].', 'Nad kohtuvad loomaaia [värava] juures.', 'Liis võtab kaasa võileivad ja [mahla].', 'Lapse pilet maksab [kuus eurot|6 eurot|kuus].', 'Kui sajab vihma, lähevad nad [muuseumi].']),
      B.gaps('097_p_forms', 'Keeleosa. Vali õige vorm.', 'Vali pangast. Pangas on lisavorme.', [
        'Ma pean homme varakult [tõusma].', 'Kas sa saad mulle õhtul [helistada]?', 'Eile me [käisime] loomaaias.', 'Ma ootan sind [kino] ees.', 'Lapsed [ei läinud] eile kooli.', 'Suvel sõidame [maale].',
      ], ['tõusma', 'tõusta', 'helistada', 'helistama', 'käisime', 'käime', 'kino', 'kinos', 'ei läinud', 'ei läksid', 'maale', 'maal']),
      B.errorfix('097_p_fix', 'Keeleosa. Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Eile ma ei käisin trennis.', 'Eile ma ei käinud trennis.'], ['Mul on kaks lapsed.', 'Mul on kaks last.'], ['Ma elan Tartu.', 'Ma elan Tartus.'], ['Ta läheb arstile juurde.', 'Ta läheb arsti juurde.'], ['Ma oskan rääkida eesti keel.', 'Ma oskan rääkida eesti keelt.'], ['Ma tahan minema koju.', 'Ma tahan minna koju.'],
      ]),
      D('097_p_dict', ['Rong väljub teiselt platvormilt.', 'Kohvik on kolmandas vagunis.', 'Pilet on poole odavam.', 'Kohtume loomaaia värava juures.', 'Lapse pilet maksab kuus eurot.', 'Kui sajab vihma, läheme muuseumi.']),
      B.speaking('097_p_retell', 'Räägi kuuldust.', 'Räägi paarilisele Liisi ja Markuse plaanist.', ['Kuhu nad lähevad?', 'Miks mitte hommikul?', 'Kus ja mis kell nad kohtuvad?', 'Mis saab, kui sajab vihma?'], [60, 90], ['Nad lähevad…, sest…', 'Nad kohtuvad…', 'Kui sajab vihma, siis…']),
    ],
    transfer: [
      B.text('097_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'Nüüd teed proovieksami teise poole. Kirjutamiseks on 30 minutit, sõnaraamatut ei kasuta. Rääkimine on paaris ja kestab umbes 15 minutit.'),
      B.notice('097_t_card', 'Visiitkaart', ['Dr Kristi Kask — hambaarst', 'Hambakliinik „Naeratus”, Vabaduse 12, Pärnu', 'Vastuvõtt: E, K, R kell 8–16', 'Registreerimine: 444 5566, info@naeratus.ee'], 'full', 'g_read'),
      B.table('097_t_form', 'Täida eksami registreerimise ankeet.', 'Kirjuta oma andmed.', 'Andmed, Sinu vastus', ['Ees- ja perekonnanimi | ', 'Sünniaeg | ', 'Elukoht | ', 'E-post | ', 'Kus sa eesti keelt õppisid? | ']),
      // writing 1: information transfer from the card, at least 25 words
      B.letter('097_t_info', 'Kirjutamine 1. Soovita hambaarsti.', 'Kolleegil valutab hammas. Kirjuta: kes, kus, millal, kuidas ühendust võtta.', 'Tere, Siim!', 'Kõike head!', [25, 40]),
      // writing 2: one of two options, at least 30 words
      B.letter('097_t_found', 'Kirjutamine 2 (valik A). Leitud telefon.', 'Leidsid bussist naabri telefoni. Kirjuta: kus, milline see on, kuidas kätte saab.', 'Tere, Jaan!', 'Sinu naaber Anna', [30, 50]),
      B.writing('097_t_place', 'Kirjutamine 2 (valik B). Minu lemmikkoht.', 'Kirjuta 4–6 lauset: mis koht, kus see on, miks sulle meeldib.', [4, 6], ['sest', 'seal', 'tihti'], 2),
      B.wordorder('097_t_order', 'Ideekaardi küsimused.', 'Pane küsimus kokku.', ['Kas sa teed iga päev sporti?', 'Mitu tundi sa öösel magad?', 'Mida sa teed, kui oled haige?', 'Kuhu sa eelmisel suvel sõitsid?', 'Kellega sa koos reisid?', 'Mis sulle reisil kõige rohkem meeldis?']),
      B.speaking('097_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele, nagu eksami alguses.', ['Mis su nimi on?', 'Kus sa elad ja kellega?', 'Mida sa teed tööl või koolis?', 'Mida sa eelmisel nädalavahetusel tegid?'], [45, 60]),
      B.speaking('097_t_pic', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab kummalegi pildi turust. Kirjelda umbes 1 minut.', ['Kes on pildil?', 'Mida inimesed ostavad?', 'Mis aastaaeg see on?', 'Kas sulle meeldib turul käia?'], [60, 90], ['Pildil on…', 'Vasakul / paremal…', 'Ma arvan, et…']),
      B.speaking('097_t_topic', 'Rääkimine 1. Küsimused „Ostlemine”.', 'Vasta õpetaja küsimustele 2–3 lausega.', ['Kus sa tavaliselt toitu ostad?', 'Mida sa eile ostsid?', 'Kas sa ostad ka internetist?', 'Kumb on parem, turg või pood?'], [45, 90]),
      B.rolecards('097_t_s1', 'Rääkimine 2. Ideekaart „Tervis”.', 'A küsib kaardi järgi, B vastab. Siis vahetage.',
        'Küsi 5 küsimust: sport, uni, arst, tervislik toit, kui oled haige.', 'Vasta igale küsimusele 2–3 lausega. Ütle ka üks detail.',
        ['Kas sa teed sporti?', 'Mitu tundi sa magad?', 'Mida sa teed, kui oled haige?'], ['Ma käin… kaks korda nädalas.', 'Tavaliselt ma magan…', 'Kui ma olen haige, siis…']),
      B.rolecards('097_t_s2', 'Rääkimine 2. Ideekaart „Reisimine”.', 'Nüüd küsib B ja A vastab.',
        'Vasta igale küsimusele 2–3 lausega.', 'Küsi 5 küsimust: kuhu, kellega, millega, kus elasid, mis meeldis.',
        ['Eelmisel suvel ma sõitsin…', 'Me elasime…', 'Kõige rohkem meeldis mulle…'], ['Kuhu sa eelmisel suvel sõitsid?', 'Kellega sa sõitsid?', 'Mis sulle meeldis?']),
      B.rubric('097_t_profile', 'Minu proovieksami profiil.', 'Kirjuta punktid. Kirjutamist ja rääkimist hindab õpetaja.', ['Lugemine: … / 20 p', 'Kuulamine: … / 20 p', 'Kirjutamine: … / 20 p', 'Rääkimine: … / 20 p', 'Kokku: … / 80 p. Kas vähemalt 48 p ja ükski osa pole 0?', 'Minu 3 kõige sagedasemat viga: …']),
      B.selfcheck('097_t_self', ['Ma oskan mõista eksami juhiseid ilma sõnaraamatuta.', 'Ma oskan kirjutada visiitkaardi põhjal 25–40 sõna.', 'Ma oskan valida õige vormi: kus, kuhu, ma- või da-vorm.', 'Ma oskan kirjeldada pilti ja küsida ideekaardi järgi.', 'Ma oskan nimetada oma nelja osa punkte.'], 'Proovieksam 1 on tehtud'),
    ],
  },

  'a2-098': {
    title: 'Veaparandus ja nõrk osaoskus',
    canDo: 'Ma parandan oma proovieksami kolm korduvat viga ja teen nõrga osa ülesande uue sisuga kahe kriteeriumi järgi paremini.',
    template: 'v3',
    discover: [
      B.text('098_d_situation', 'Anna tulemused', 'Anna sai proovieksami tulemused. Lugemine 17, kuulamine 15, kirjutamine 9 ja rääkimine 14 punkti. Mis on Anna nõrk osa? Mida ta peab tegema?'),
      B.reading('098_d_read', 'Loe: õpetaja tagasiside.', 'Loe õpetaja kirja ja vasta küsimustele.', 'Kiri Annale',
        'Tere, Anna! Sinu lugemine ja kuulamine on head. Kirjutamises said 9 punkti 20-st. Sinu tekstides on hea sisu, aga kolm viga kordub. Esiteks: pärast sõna „pean” kirjutad sa „minna”. Õige on „pean minema”. Pärast „tahan”, „võin” ja „saan” on aga „minna”. Teiseks: minevikus kirjutad sa „ei läksin”. Eituses on alati nud-vorm: „ma ei läinud”. Kolmandaks: sa kirjutad „ma lähen kodus”. Küsimus „kuhu?” – vastus „koju”. Küsimus „kus?” – vastus „kodus”. Teine probleem on aeg. Teises ülesandes kirjutasid ainult 22 sõna. Vaja on vähemalt 30. Soovitan nii: kirjuta kõigepealt märksõnad, siis tekst. Lõpus loe sõnad kokku. Proovime järgmisel nädalal uuesti! Õpetaja Liis',
        [['Mitu punkti sai Anna kirjutamises?', '9|üheksa|9 punkti'], ['Mis on Anna tekstides hea?', 'sisu|hea sisu'], ['Kuidas on õige: „pean minna” või „pean minema”?', 'pean minema'], ['Mis vorm on mineviku eituses?', 'nud-vorm|ei läinud'], ['Miks kaotas Anna teises ülesandes punkte?', 'tekst oli liiga lühike|ainult 22 sõna|vähem kui 30 sõna'], ['Mida peab Anna tegema enne teksti?', 'kirjutama märksõnad|märksõnad'], ['Mitu sõna kirjutas Anna teises ülesandes?', '22|kakskümmend kaks'], ['Mida peab Anna lõpus tegema?', 'lugema sõnad kokku|sõnad kokku lugema']]),
      B.notice('098_d_notice', 'Märka kolme viga.', ['**pean** + ma-vorm: pean **minema**, pean **tegema**', '**tahan / võin / saan** + da-vorm: tahan **minna**, võin **teha**', 'eitus minevikus: ma **ei läinud**, ma **ei teinud**', '**kuhu?** koju, poodi · **kus?** kodus, poes'], 'full'),
      B.listening('098_d_listen', 'Kuula: Anna plaan.', 'Õpetaja loeb Anna sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Liis! Aitäh tagasiside eest!',
        'Ma olin natuke kurb, aga nüüd tean, mida teha.',
        'Iga päev kirjutan ma viis lauset oma päevast.',
        'Laused kontrollib minu mees. Ta on eestlane.',
        'Ma tegin ka väikese kaardi. Seal on kolm reeglit.',
        'Kaart on mul rahakotis. Bussis ma vaatan seda.',
        'Järgmisel nädalal kirjutan proovikirja uuesti. Siis loen sõnad kokku!',
      ], ['Alguses oli Anna natuke [kurb].', 'Iga päev kirjutab Anna [viis|5] lauset.', 'Laused kontrollib Anna [mees].', 'Kaardil on kolm [reeglit].', 'Kaart on Anna [rahakotis].', 'Järgmisel nädalal kirjutab ta proovikirja [uuesti].', 'Kaarti vaatab Anna [bussis].', 'Anna mees on [eestlane].']),
      B.gaps('098_d_gaps', 'Õige vorm Anna lausetes.', 'Vali pangast. Pangas on lisavorme.', [
        'Ma pean homme tööle [minema].', 'Ma tahan õhtul kinno [minna].', 'Eile ma [ei läinud] trenni.', 'Pärast tööd lähen ma [koju].', 'Laupäeval olen ma terve päeva [kodus].', 'Eile ma [ei teinud] kodutööd.', 'Homme ma [pean] varem tõusma.', 'Õhtul ma [tahan] puhata.',
      ], ['minema', 'minna', 'ei läinud', 'ei läksin', 'koju', 'kodus', 'ei teinud', 'ei tegin', 'pean', 'tahan']),
      B.wordforms('098_d_forms', 'Anna parandab.', 'Kirjuta tegusõna õiges vormis.', [
        ['minema', 'Ma pean …', 'minema'], ['minema', 'Ma tahan …', 'minna'], ['minema', 'Eile ma ei …', 'läinud'], ['tegema', 'Ma võin …', 'teha'], ['tegema', 'Eile ma ei …', 'teinud'], ['olema', 'Eile ma ei … kodus.', 'olnud'], ['tulema', 'Kas sa saad …?', 'tulla'], ['tõusma', 'Ma pean vara …', 'tõusma']]),
      B.errorfix('098_d_fix', 'Leia Anna kirjast viga.', 'Kirjuta lause õigesti.', [['Ma pean minna poodi.', 'Ma pean minema poodi.'], ['Eile ma ei läksin trenni.', 'Eile ma ei läinud trenni.'], ['Õhtul ma lähen kodus.', 'Õhtul ma lähen koju.'], ['Ma tahan minema kinno.', 'Ma tahan minna kinno.'], ['Ma ei tegin süüa.', 'Ma ei teinud süüa.'], ['Laupäeval olen ma koju.', 'Laupäeval olen ma kodus.'], ['Ma pean minna panka.', 'Ma pean minema panka.'], ['Ma tahan minema puhkusele.', 'Ma tahan minna puhkusele.']]),
      B.speaking('098_d_say', 'Minu nõrk osa.', 'Räägi paarilisele umbes 1 minut.', ['Mis on sinu proovieksami nõrgim osa?', 'Mis viga sul kordub?', 'Mida sa teed nüüd teisiti?', 'Kuidas sa oma viga meeles pead?'], [60, 90], ['Minu nõrgim osa on…', 'Mul kordub viga…', 'Nüüd ma…']),
      B.writing('098_d_write', 'Minu tulemused.', 'Kirjuta 8–10 lauset: mis osa on tugev, mis nõrk, mida teed.', [8, 10], ['tugev', 'nõrk', 'pean'], 2),
    ],
    practice: [
      B.cloze('098_p_cloze', 'Anna kiri õpetajale.', 'Vali igasse lünka sobiv sõna.', 'Tere, Liis!', [
        'Aitäh {*tagasiside|tagasisidet|tagasisidest} eest! Eile ma {*ei läinud|ei läksin|ei lähe} trenni, sest pidin kodus {*õppima|õppida|õpin}.',
        '',
        'Ma kirjutasin kirja uuesti. Nüüd tahan ma selle sulle {*saata|saatma|saadan}. Seekord kirjutasin {*kõigepealt|lõpuks|eile} märksõnad.',
        '',
        'Lõpus lugesin sõnad {*kokku|kokkuga|koos}. Tekstis on nüüd {*rohkem|rohkesti|rohke} kui 40 sõna.',
        '',
        'Homme pärast tööd lähen ma {*koju|kodus|kodust} ja harjutan veel. Anna',
      ], 'g_vocab'),
      B.formtext('098_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna või sõna õiges vormis.', 'Oksana nädal', [
        'Eile ma [ei läinud] (minema, eitus) tööle, sest olin haige.',
        '',
        'Esmaspäeval pean ma arsti juurde [minema] (minna). Hommikul ei tohi ma [süüa] (sööma).',
        '',
        'Pärast arsti tahan ma [koju] (kodu) minna ja [puhata] (puhkama).',
        '',
        'Kas sa [saad] (saama) mind autoga [viia] (viima)? Eile ma ka [ei teinud] (tegema, eitus) süüa.',
      ], 'g_notice'),
      B.choice('098_p_where', 'Kus, kuhu või kust?', 'Vali lausesse õige vorm.', [
        ['Pärast tööd lähen ma …', 'koju', 'kodus', 'kodust'],
        ['Laupäeval olen ma terve päeva …', 'kodus', 'koju', 'kodust'],
        ['Lapsed mängivad …', 'õues', 'õue', 'õuest'],
        ['Ma panen piima …', 'külmkappi', 'külmkapis', 'külmkapist'],
        ['Võti on …', 'laual', 'lauale', 'laualt'],
        ['Ma tulen just …', 'poest', 'poodi', 'poes'], ['Ma lähen nüüd …', 'tööle', 'tööl', 'töölt'], ['Ta tuli just …', 'trennist', 'trenni', 'trennis']], 'full', 'g_notice'),
      B.wordforms('098_p_inf', 'pean või tahan?', 'Kirjuta tegusõna õiges vormis.', [
        ['minema', 'Ma pean …', 'minema'], ['minema', 'Ma tahan …', 'minna'], ['tegema', 'Sa võid … pausi.', 'teha'], ['ostma', 'Ma pean leiba …', 'ostma'], ['ostma', 'Kas sa saad leiba …?', 'osta'], ['lugema', 'Mulle meeldib …', 'lugeda'], ['õppima', 'Ma pean rohkem …', 'õppima'], ['kirjutama', 'Ma pean rohkem …', 'kirjutama']]),
      B.gaps('098_p_past', 'Eile või täna?', 'Vali pangast. Pangas on lisavorme.', [
        'Eile ma [ei läinud] tööle, sest olin haige.', 'Täna ma [ei lähe] tööle.', 'Eelmisel nädalal me [käisime] teatris.', 'Eile ta [ei teinud] süüa.', 'Kas sa [nägid] eile Liisi?', 'Ei, ma [ei näinud] teda.', 'Eile me [ei olnud] kodus.', 'Täna ma [olen] terve päeva kodus.',
      ], ['ei läinud', 'ei lähe', 'ei läksin', 'käisime', 'käime', 'ei teinud', 'ei tegi', 'nägid', 'näed', 'ei näinud', 'ei olnud', 'olen']),
      B.transformation('098_p_trans', 'Ütle minevikus.', 'Kirjuta lause eilse päeva kohta.', [
        ['Ma lähen poodi.', 'Eile…', 'Eile ma läksin poodi.|Eile läksin ma poodi.'], ['Ma ei lähe trenni.', 'Eile…', 'Eile ma ei läinud trenni.'], ['Me teeme süüa.', 'Eile…', 'Eile me tegime süüa.|Eile tegime me süüa.'], ['Ta ei tule tööle.', 'Eile…', 'Eile ta ei tulnud tööle.'], ['Ma olen kodus.', 'Eile…', 'Eile ma olin kodus.|Eile olin ma kodus.'], ['Ma ei tee kodutööd.', 'Eile…', 'Eile ma ei teinud kodutööd.'], ['Me läheme kinno.', 'Eile…', 'Eile me läksime kinno.|Eile läksime me kinno.'], ['Ta ei ole tööl.', 'Eile…', 'Eile ta ei olnud tööl.']]),
      TR('098_p_tr', ['Мне нужно завтра идти к врачу.', 'Я хочу пойти в кино.', 'Вчера я не был дома.', 'Ты можешь мне помочь?', 'Я иду домой.', 'Мне нужно больше писать.', 'Вчера я не ходил на работу.', 'Я хочу пойти домой.']),
      D('098_p_dict', ['Ma pean homme panka minema.', 'Eile ma ei teinud süüa.', 'Kas sa võid mulle helistada?', 'Lapsed mängivad õues.', 'Ma tulen just poest.', 'Võti on laual.', 'Ma pean homme varem tõusma.', 'Ma ei läinud eile tööle.']),
      B.speaking('098_p_say', 'Räägi, mida parandasid.', 'Räägi paarilisele 1 minut: mis viga oli, mis on õige.', ['Mis viga sul oli?', 'Mis on õige vorm?', 'Kuidas sa seda meeles pead?', 'Mida sa nüüd teisiti teed?'], [45, 75], ['Mul oli viga…', 'Õige on…', 'Ma mäletan, sest…']),
    ],
    transfer: [
      B.text('098_t_situation', 'Oksana teine katse', 'Oksana nõrgim osa oli kuulamine: 8 punkti 20-st. Ta valis kaks kriteeriumi: vastan 1–2 sõnaga ja kirjutan numbrid õigesti. Täna proovib ta uuesti. Tee koos Oksanaga. Siis vali oma nõrk osa.'),
      B.listening('098_t_listen', 'Kuulamine. Sõnum perearstilt.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin on Tartu perearstikeskus. Helistan Oksana Bondarile.',
        'Teie aeg perearsti juurde muutub. Arst on reedel koolitusel.',
        'Teie uus aeg on esmaspäeval, kaheksandal mail, kell kaksteist viisteist.',
        'Palun tulge kümme minutit varem ja võtke kaasa isikutunnistus.',
        'Vereanalüüs tuleb teha enne visiiti, kolmandal korrusel.',
        'Enne analüüsi ei tohi hommikul süüa. Vett võib juua.',
        'Kui uus aeg ei sobi, helistage numbril 734 1122.',
        'Aitäh ja head päeva!',
      ], ['Reedel on arst [koolitusel].', 'Uus aeg on [esmaspäeval].', 'Kuupäev on [kaheksas mai|8. mai|8. mail].', 'Uus aeg on kell [kaksteist viisteist|12.15|veerand üks].', 'Analüüs on [kolmandal|3.] korrusel.', 'Enne analüüsi võib juua [vett].', 'Keskus helistab [Oksanale|Oksana Bondarile].', 'Kaasa tuleb võtta [isikutunnistus].']),
      B.reading('098_t_read', 'Kui sinu nõrk osa on lugemine.', 'Leia märksõna ja vasta lühidalt.', 'Teade kooli kodulehel',
        'Head lapsevanemad! Neljapäeval, 12. oktoobril, on koolis sügispidu. Pidu algab kell viis õhtul aulas. Lapsed esitavad laule ja tantse. Esimesena laulab teine klass. Pärast kontserti on söökla avatud. Seal saab osta kooki ja teed. Koogid teevad lapsed ise koos õpetajatega. Raha läheb klassi ekskursiooni jaoks. Palun tulge õigel ajal, sest uksed suletakse kell viis. Parkida saab kooli taga. Kui teil on küsimusi, kirjutage klassijuhatajale. Väikesed vennad ja õed on ka oodatud. Pärast pidu aitavad vanemad saali koristada. Pidu lõpeb umbes kell seitse. Ootame kõiki!',
        [['Mis päeval on pidu?', 'neljapäeval|12. oktoobril'], ['Kus pidu on?', 'aulas|koolis'], ['Mida saab söögalas osta?', 'kooki ja teed|kooki'], ['Mille jaoks raha kogutakse?', 'ekskursiooni jaoks|klassi ekskursiooniks'], ['Kus saab parkida?', 'kooli taga'], ['Mis kell pidu algab?', 'kell viis|viis õhtul|17'], ['Kes laulab esimesena?', 'teine klass'], ['Mida teevad vanemad pärast pidu?', 'koristavad saali|aitavad saali koristada']]),
      B.errorfix('098_t_fix', 'Paranda Oksana sõnum perele.', 'Kirjuta lause õigesti.', [
        ['Ma pean minna arsti juurde esmaspäev.', 'Ma pean minema arsti juurde esmaspäeval.'], ['Ma ei tohi süüa hommik.', 'Ma ei tohi hommikul süüa.'], ['Reedel ma ei läksin arsti juurde.', 'Reedel ma ei läinud arsti juurde.'], ['Analüüs on kolmas korrusel.', 'Analüüs on kolmandal korrusel.'], ['Kas sa saad mind viima?', 'Kas sa saad mind viia?'], ['Ma võin tulema kell kaks.', 'Ma võin tulla kell kaks.'], ['Pärast arsti lähen ma kodus.', 'Pärast arsti lähen ma koju.'], ['Eile ma ei söönud hommik.', 'Eile ma ei söönud hommikul.']]),
      B.rolecards('098_t_call', 'Helista ja muuda aega.', 'A on patsient, B registratuur. Siis vahetage.',
        'Sa ei saa esmaspäeval tulla. Küsi uut aega. Ütle, miks.', 'Paku kaks uut aega. Ütle, mida kaasa võtta.',
        ['Kahjuks ma ei saa esmaspäeval tulla, sest…', 'Kas teil on aega …?', 'Mida ma pean kaasa võtma?'], ['Kas teisipäev kell … sobib?', 'Võtke kaasa…', 'Palun tulge … varem.']),
      B.letter('098_t_letter', 'Kui sinu nõrk osa on kirjutamine (2).', 'Naabri pakk on sinu juures. Kirjuta: kus pakk on, millal ta saab tulla.', 'Tere, naaber!', 'Sinu naaber', [40, 60]),
      B.speaking('098_t_pic', 'Kui sinu nõrk osa on rääkimine.', 'Kirjelda pilti „Perearsti ooteruum” umbes 1 minut.', ['Kes on pildil?', 'Mida nad teevad?', 'Kuidas nad end tunnevad?', 'Millal sina viimati arsti juures käisid?'], [60, 90], ['Pildil on…', 'Üks mees…', 'Ma arvan, et…']),
      B.rubric('098_t_rubric', 'Kas ma paranesin?', 'Märgi ja kirjuta.', ['Kriteerium 1 on täidetud: …', 'Kriteerium 2 on täidetud: …', 'Täna tegin selle osa paremini kui proovieksamil.', 'Järgmisel nädalal harjutan: …']),
      B.selfcheck('098_t_self', ['Ma oskan nimetada oma vea ja nõrga osa.', 'Ma oskan leida kuulamisest ja lugemisest aja, koha ja numbri.', 'Ma oskan parandada kolm viga: pean + ma, tahan + da, ei + nud.', 'Ma oskan teha nõrga osa ülesande uuesti kahe kriteeriumi järgi.'], 'Nõrk osa on tugevam'),
    ],
  },

  'a2-099': {
    title: 'A2 proovieksam 2',
    assessment: true,
    canDo: 'Ma teen teise A2 proovieksami uue sisuga, võrdlen punkte esimesega ja nimetan oma järgmise sammu.',
    discover: [
      B.text('099_d_situation', 'Viktori kaks proovieksamit', 'Viktor tegi kuu aega tagasi esimese proovieksami. Täna teeb ta teise. Kas ta on nüüd parem? Mida ta tegi teisiti?'),
      B.notice('099_d_table', 'Viktori punktid', ['Proovieksam 1: lugemine 14, kuulamine 9, kirjutamine 12, rääkimine 13 = **48 p**', 'Proovieksam 2: lugemine 16, kuulamine 14, kirjutamine 13, rääkimine 15 = **58 p**'], 'full', 'g_read'),
      B.truefalse('099_d_tf', 'Õige või vale?', 'Vaata Viktori punkte. Kas lause on õige?', [
        ['Teisel korral sai Viktor rohkem punkte.', true],
        ['Kõige rohkem paranes kuulamine.', true],
        ['Esimesel korral oli tulemus alla 60 %.', false],
        ['Kirjutamine paranes ainult ühe punkti.', true],
        ['Rääkimine läks teisel korral halvemini.', false],
      ], 'full'),
      B.reading('099_d_read', 'Loe: kuidas Viktor harjutas.', 'Loe tekst ja vasta küsimustele.', 'Viktori kuu',
        'Pärast esimest proovieksamit oli Viktor pettunud. Kuulamises sai ta ainult üheksa punkti. Õpetaja ütles, et Viktor kirjutab liiga pikki vastuseid. Siis ei jõua ta järgmist küsimust kuulata. Viktor tegi plaani. Iga päev kuulas ta kümme minutit raadiot. Bussis kuulas ta telefonist eestikeelseid saateid. Ta harjutas vastama ühe või kahe sõnaga. Nädalavahetusel vaatas ta lastega eesti multifilme. Kirjutamises oli tal teine probleem. Ta unustas lõpus teksti kontrollida. Nüüd on tal paberil väike nimekiri: tegusõna, käänded, sõnade arv. Teisel proovieksamil oli kuulamine palju kergem. Viktor sai neliteist punkti. See on viis punkti rohkem kui esimesel korral. Kirjutamine paranes vähem, ainult ühe punkti. Viktor teab, et peab veel harjutama.',
        [['Miks oli Viktor pettunud?', 'kuulamises oli ainult 9 punkti|ta sai kuulamises vähe punkte'], ['Mis oli Viktori viga kuulamises?', 'ta kirjutas liiga pikki vastuseid|liiga pikad vastused'], ['Kus Viktor saateid kuulas?', 'bussis'], ['Mis on Viktori nimekirjas?', 'tegusõna, käänded, sõnade arv'], ['Mitu punkti rohkem sai Viktor kuulamises?', 'viis|5|viis punkti'], ['Miks peab Viktor veel harjutama?', 'kirjutamine paranes vähe|kirjutamine paranes ainult ühe punkti']]),
      B.notice('099_d_notice', 'Märka võrdlust.', ['Kuulamine oli **kergem kui** enne.', 'Viktor sai **rohkem** punkte **kui** esimesel korral.', 'Kirjutamine paranes **vähem**.', 'Teine tulemus on **parem**.', 'hea → **parem** · palju → **rohkem** · vähe → **vähem** · kerge → **kergem**'], 'full'),
      B.wordforms('099_d_forms', 'Kirjuta keskvõrre.', 'Kirjuta sõna võrdluse vormis.', [
        ['kerge', '… kui enne', 'kergem'], ['raske', '… kui lugemine', 'raskem'], ['hea', '… tulemus', 'parem'], ['palju', '… punkte', 'rohkem'], ['vähe', '… vigu', 'vähem'], ['kiire', '… kui varem', 'kiirem'], ['pikk', '… tekst', 'pikem'],
      ]),
      B.gaps('099_d_gaps', 'Võrdle tulemusi.', 'Vali pangast. Pangas on lisasõnu.', [
        'Teine tulemus on [parem] kui esimene.', 'Kuulamises sai Viktor viis punkti [rohkem].', 'Nüüd teeb ta [vähem] vigu.', 'Lugemine oli [kergem] kui kuulamine.', 'Kirjutamine on Viktorile [raskem] kui rääkimine.',
      ], ['parem', 'hea', 'rohkem', 'palju', 'vähem', 'kergem', 'raskem']),
      B.listening('099_d_listen', 'Kuula: Viktor helistab Sofiale.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Sofia! Mul on hea uudis.', '— Tere, Viktor! Räägi!',
        '— Ma tegin teise proovieksami. Sain viiskümmend kaheksa punkti.', '— Tubli! See on palju parem kui esimesel korral.',
        '— Jah, kuulamine oli palju kergem. Raadio aitas.', '— Ja kirjutamine?',
        '— Kirjutamine on ikka raske. Ma unustan käänded.', '— Kirjuta igal õhtul paar lauset. Ma võin neid kontrollida.',
        '— Aitäh! Ma saadan sulle laupäeval esimese teksti.', '— Hästi. Ja pühapäeval läheme koos kohvikusse harjutama.',
      ], ['Viktor sai [viiskümmend kaheksa|58] punkti.', 'Kuulamist aitas [raadio].', 'Kirjutamises unustab Viktor [käänded|käändeid].', 'Sofia soovitab kirjutada igal [õhtul].', 'Viktor saadab teksti [laupäeval].', 'Pühapäeval lähevad nad [kohvikusse].']),
      B.match('099_d_match', 'Probleem ja lahendus.', 'Ühenda probleem ja lahendus.', [['Vastused on liiga pikad.', 'Kirjutan 1–2 sõna.'], ['Unustan teksti kontrollida.', 'Kasutan nimekirja.'], ['Ma ei saa kõnest aru.', 'Kuulan iga päev raadiot.'], ['Aeg saab otsa.', 'Vaatan kella.'], ['Tekstis on palju uusi sõnu.', 'Otsin ainult märksõnu.'], ['Ma ei tea, mida paarilisele öelda.', 'Küsin ideekaardi järgi.']], 'full', 'g_read'),
      B.choice('099_d_choice', 'Mis on õige?', 'Vali õige lause.', [
        ['Viktor räägib tulemusest.', 'Nüüd on mul rohkem punkte.', 'Nüüd on mul rohkemad punkte.', 'Nüüd on mul palju punktid.'],
        ['Kuulamine paranes.', 'Kuulamine on nüüd kergem.', 'Kuulamine on nüüd kergemad.', 'Kuulamine on nüüd rohkem kerge.'],
        ['Kirjutamine on raske.', 'Kirjutamine on raskem kui lugemine.', 'Kirjutamine on raskem nagu lugemine.', 'Kirjutamine on raske kui lugemine.'],
        ['Vigu on vähem.', 'Ma teen vähem vigu.', 'Ma teen vähem vead.', 'Ma teen vähe vigade.'],
        ['Tulemus on hea.', 'Teine tulemus on parem.', 'Teine tulemus on paremam.', 'Teine tulemus on rohkem hea.'],
      ], 'full', 'g_notice'),
      TR('099_d_tr', ['Во второй раз было легче.', 'Я получил на пять баллов больше.', 'Моё письмо стало лучше.', 'Я делаю меньше ошибок.', 'Мне нужно ещё тренироваться.', 'Аудирование сложнее, чем чтение.', 'Каждый день я слушаю радио.', 'Мой результат лучше, чем в первый раз.']),
      B.table('099_d_count', 'Arvuta muutus.', 'Kirjuta, mitu punkti rohkem Viktor sai.', 'Osa, Proovieksam 1, Proovieksam 2, Muutus', ['Lugemine | 14 | 16 | [+2|2|kaks]', 'Kuulamine | 9 | 14 | [+5|5|viis]', 'Kirjutamine | 12 | 13 | [+1|1|üks]', 'Rääkimine | 13 | 15 | [+2|2|kaks]', 'Kokku | 48 | 58 | [+10|10|kümme]'], 'g_notice'),
      B.writing('099_d_write', 'Minu kuu.', 'Kirjuta 5–7 lauset: mida sa pärast esimest proovieksamit harjutasid?', [5, 7], ['iga päev', 'rohkem', 'parem'], 2),
      B.speaking('099_d_say', 'Võrdle.', 'Võrdle paarilisele oma lugemist ja kuulamist umbes 1 minut.', ['Kumb on sulle kergem?', 'Miks?', 'Mida sa teed, et teine osa oleks parem?'], [60, 90], ['… on kergem kui…, sest…', 'Ma teen nüüd rohkem…']),
      B.rolecards('099_d_cards', 'Viktor ja Sofia.', 'A on Viktor, B on Sofia. Rääkige tulemustest. Siis vahetage.',
        'Räägi oma kahest tulemusest. Ütle, mis paranes ja miks.', 'Küsi 4 küsimust: punktid, mis paranes, mis on raske, mida edasi teha.',
        ['Teisel korral sain…', '… oli kergem kui enne.', 'Kirjutamine on veel raske, sest…'], ['Mitu punkti sa said?', 'Mis paranes kõige rohkem?', 'Mida sa nüüd teed?']),
    ],
    practice: [
      B.tip('099_p_how', 'Kuulamine ja lugemine (eksami vormis)', `Nüüd on järjekord nagu eksamil: kõigepealt kuulamine (30 min), siis lugemine (50 min). Õpetaja loeb iga teksti kaks korda. ${POINTS}`, 'full'),
      // listening 1: short announcements, answers of 1–2 words
      B.listening('099_p_listen', 'Kuulamine 1. Lühikesed teated.', 'Õpetaja loeb kuus teadet kaks korda. Kirjuta lünka 1–2 sõna.', [
        '1. Tähelepanu! Kauplus suletakse kümne minuti pärast. Palun minge kassasse.',
        '2. Täna on päikeseline ilm. Õhtul tuleb vihma. Sooja on kuni kaksteist kraadi.',
        '3. Buss number kaheksa sõidab täna teist teed, sest Tartu maanteel on remont.',
        '4. Spordiklubi teatab: jooga ei ole kell kuus, vaid kell seitse.',
        '5. Apteek „Tervis” on pühapäeval avatud kella kümnest kolmeni.',
        '6. Kontsert algab kell seitse. Palun lülitage telefonid välja.',
      ], ['Kauplus suletakse [kümne minuti] pärast.', 'Õhtul tuleb [vihma].', 'Sooja on kuni [kaksteist|12] kraadi.', 'Buss sõidab teist teed, sest teel on [remont].', 'Jooga on kell [seitse|7|19].', 'Pühapäeval on apteek avatud kella [kolmeni|15-ni].', 'Kontserdi ajal tuleb [telefon|telefonid] välja lülitada.']),
      // listening 2: a dialogue on personal life, gaps and true/false
      B.listening('099_p_listen2', 'Kuulamine 2. Puhkus Saaremaal.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Jaan! Kuidas puhkus läks?', '— Tere, Sofia! Väga hästi. Olime perega nädal aega Saaremaal.',
        '— Tore! Kuidas te sinna sõitsite?', '— Autoga ja siis praamiga. Praam sõitis ainult pool tundi.',
        '— Kus te elasite?', '— Me üürisime väikese maja mere ääres. Seal oli ka saun.',
        '— Kas ilm oli hea?', '— Esimesed kolm päeva sadas vihma. Siis tuli päike välja.',
        '— Mida te vihmaga tegite?', '— Käisime Kuressaare lossis muuseumis. Lastele meeldis väga.',
        '— Kas te ujuda ka saite?', '— Jah, aga vesi oli külm, ainult seitseteist kraadi. Ujusin ainult mina.',
        '— Kas lähete järgmisel aastal jälle?', '— Ei, järgmisel suvel tahame minna Hiiumaale.',
      ], ['Jaan oli Saaremaal [nädal|nädal aega|seitse päeva].', 'Praam sõitis [pool tundi|30 minutit].', 'Maja juures oli [saun].', 'Vihma sadas [kolm|3] päeva.', 'Vihmaga käisid nad [lossis|muuseumis].', 'Vesi oli [seitseteist|17] kraadi.']),
      B.truefalse('099_p_tf', 'Kuulamine 2. Õige või vale?', 'Kuula vestlust teist korda. Märgi õige või vale.', [
        ['Sofia küsib, kuidas puhkus läks.', true], ['Jaan sõitis Saaremaale bussiga.', false], ['Pere elas hotellis.', false], ['Lastele meeldis muuseum.', true], ['Kogu pere käis meres ujumas.', false], ['Järgmisel suvel lähevad nad Hiiumaale.', true],
      ], 'full'),
      // reading 1: everyday phrases and politeness
      B.choice('099_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sõber kolis uude korterisse. Mida ütled?', 'Palju õnne uue kodu puhul!', 'Head reisi!', 'Jõudu tööle!'],
        ['Sa tuled hommikul tööle. Mida ütled kolleegidele?', 'Tere hommikust!', 'Head õhtut!', 'Head ööd!'],
        ['Kolleeg on haige. Mida kirjutad?', 'Saa ruttu terveks!', 'Head isu!', 'Edu eksamil!'],
        ['Sa tahad poes abi küsida. Kuidas alustad?', 'Vabandage, kas te saaksite aidata?', 'Kuule, anna see siia!', 'Aitäh, kõik on korras.'],
        ['Sõber ütleb: „Ma sain uue töö!” Mida vastad?', 'Tubli! Palju õnne!', 'Kahju küll!', 'Pole viga!'],
        ['Sa lahkud külast. Mida ütled võõrustajale?', 'Aitäh, oli väga tore!', 'Tere tulemast!', 'Head isu!'],
      ]),
      // reading 2: three short ads, answers by letter
      B.reading('099_p_ads', 'Lugemine 2. Kolm kuulutust.', 'Loe kuulutusi. Vasta tähega (A, B, C) ja lühidalt.', 'Kuulutused',
        'A. Otsime kohvikusse abikokka. Töö on hommikuti kella seitsmest kolmeni. Nädalavahetusel on vaba. Eesti keel peab olema suhtlustasemel. Kogemus ei ole vajalik, õpetame ise. Kirjuta: tööd@kohvikmaasikas.ee\n\nB. Müüa korralik diivan. Värv on hall, pikkus kaks meetrit. Diivanist saab teha voodi. Hind 120 eurot. Pead ise ära viima, kolmandalt korruselt. Lifti ei ole. Helista õhtuti: 5345 1122.\n\nC. Kaotasin pühapäeval Raekoja platsil musta rahakoti. Rahakotis on pangakaart ja pere foto. Raha seal palju ei ole. Leidjale annan 30 eurot. Palun helista: 5678 9900. Sofia',
        [['Kus saab tööd ilma kogemuseta?', 'A|kohvikus'], ['Mida Sofia kaotas?', 'C|rahakoti|musta rahakoti'], ['Mis värvi on diivan?', 'B|hall'], ['Millal ei pea kohvikus töötama?', 'A|nädalavahetusel'], ['Mida saab diivanist teha?', 'B|voodi'], ['Kui palju raha saab leidja?', 'C|30 eurot|kolmkümmend eurot']]),
      // reading 3: signs matched to their meaning
      B.match('099_p_signs', 'Lugemine 3. Mida silt tähendab?', 'Ühenda silt ja selle tähendus.', [
        ['Ainult sularaha', 'Kaardiga siin maksta ei saa.'], ['Märg põrand!', 'Siin tuleb ettevaatlikult käia.'], ['Koertega sisenemine keelatud', 'Koeraga siia minna ei tohi.'], ['Avatud 24 h', 'Siia saab minna ka öösel.'], ['Hoida külmkapis', 'Toode peab olema külmas.'], ['Mitte segada!', 'Palun ära koputa ega tule sisse.'],
      ], 'full', 'g_read'),
      // reading 4: a ~140-word text, 5 questions with 3 options
      B.reading('099_p_text', 'Lugemine 4. Aleksei uus töö.', 'Loe tekst. Siis vasta kahele küsimusele lühidalt.', 'Aleksei uus töö',
        'Aleksei elas kümme aastat Narvas ja töötas tehases. Eelmisel kevadel sai ta uue töö Tallinnas. Nüüd on ta bussijuht. Alguses oli see raske. Ta pidi õppima linna tänavaid ja peatuste nimesid. Paljud reisijad küsivad temalt eesti keeles teed. Aleksei ei saanud alguses kõigest aru, sest inimesed rääkisid kiiresti. Siis hakkas ta keelekursusel käima. Kursus on kaks korda nädalas õhtuti. Nüüd räägib Aleksei reisijatega julgelt. Kõige raskemad on telefonikõned dispetšeriga, sest liinil on müra. Aleksei naine ja poeg kolisid Tallinnasse alles sügisel. Poeg läks uude kooli ja leidis kiiresti sõpru. Pere elab Mustamäel kahetoalises korteris. Nädalavahetusel sõidavad nad tihti Narva. Seal elavad Aleksei vanemad. Aleksei plaanib järgmisel aastal teha B1 eksami.',
        [['Kus pere praegu elab?', 'Mustamäel|Tallinnas'], ['Mis eksami tahab Aleksei teha?', 'B1|B1 eksami']]),
      B.choice('099_p_textmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali üks vastus.', [
        ['Mis tööd tegi Aleksei Narvas?', 'Ta töötas tehases.', 'Ta oli bussijuht.', 'Ta oli õpetaja.'],
        ['Miks oli alguses raske reisijatest aru saada?', 'Nad rääkisid kiiresti.', 'Nad rääkisid ainult vene keelt.', 'Buss oli liiga täis.'],
        ['Mis on Alekseile praegu kõige raskem?', 'telefonikõned dispetšeriga', 'linna tänavad', 'peatuste nimed'],
        ['Millal kolis pere Tallinnasse?', 'sügisel', 'eelmisel kevadel', 'kümme aastat tagasi'],
        ['Miks sõidab pere tihti Narva?', 'Seal elavad Aleksei vanemad.', 'Seal on Aleksei töö.', 'Poeg käib seal koolis.'],
      ]),
      // reading 5: a personal letter, 8 gaps with 3 options
      B.cloze('099_p_cloze', 'Lugemine 5. Kiri sõbrannale.', 'Vali igasse lünka sobiv sõna.', 'Tere, Kadri!', [
        'Kuidas sul läheb? Mul on suur uudis: ma {*leidsin|leian|leidma} uue töö! Alates märtsist töötan ma {*raamatukogus|raamatukokku|raamatukogust}. Töö algab kell üheksa ja lõpeb kell viis. Ma ei {*pea|pean|pidin} enam nii vara tõusma. Eile käisin ma oma uute {*kolleegidega|kolleegid|kolleegide} tutvumas. Kõik olid väga sõbralikud.',
        '',
        'Laupäeval tahan ma seda {*tähistada|tähistama|tähistan} väikese peoga. Kas sa {*saad|saada|saame} tulla? Pidu algab kell seitse minu {*juures|juurde|juurest}. Palun võta kaasa {*oma|omad|omaga} kitarr!',
        '',
        'Ootan sinu vastust! Liis',
      ]),
      B.transformation('099_p_trans', 'Keeleosa. Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Ma ei saa homme tulla.', 'eile', 'Ma ei saanud eile tulla.|Eile ma ei saanud tulla.'], ['Ma lähen tööle.', 'pean', 'Ma pean tööle minema.|Ma pean minema tööle.'], ['Pood on avatud 9–18.', 'alates … kuni', 'Pood on avatud alates kella üheksast kuni kella kuueni.'], ['Lugemine on kerge. Kuulamine on raske.', 'kergem kui', 'Lugemine on kergem kui kuulamine.'], ['Me käime ujumas.', 'eelmisel suvel', 'Eelmisel suvel me käisime ujumas.|Eelmisel suvel käisime me ujumas.'],
      ]),
      B.errorfix('099_p_fix', 'Keeleosa. Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma kaotasin minu rahakott.', 'Ma kaotasin oma rahakoti.'], ['Diivan on suurem minu voodi.', 'Diivan on suurem kui minu voodi.|Diivan on minu voodist suurem.'], ['Me sõitsime Saaremaa praamiga.', 'Me sõitsime Saaremaale praamiga.'], ['Ta ei saanud aru, sest inimesed räägisid kiiresti.', 'Ta ei saanud aru, sest inimesed rääkisid kiiresti.'], ['Ma tahan töötada kohvikus kokk.', 'Ma tahan töötada kohvikus kokana.'], ['Eile ma ei ujusin.', 'Eile ma ei ujunud.'], ['Ma tulen sinu pidu laupäeval.', 'Ma tulen sinu peole laupäeval.'], ['Pakk on minu juurde.', 'Pakk on minu juures.'],
      ]),
      B.wordforms('099_p_forms', 'Keeleosa. Kirjuta õige vorm.', 'Kirjuta sõna lünka sobivas vormis.', [
        ['hea', 'See töö on … kui vana.', 'parem'], ['kolleeg', 'Ma käisin … tutvumas.', 'kolleegidega'], ['raamatukogu', 'Ma töötan …', 'raamatukogus'], ['Hiiumaa', 'Järgmisel suvel sõidame …', 'Hiiumaale'], ['leidma', 'Eile ma … rahakoti.', 'leidsin'], ['ujuma', 'Vesi oli külm, ma ei …', 'ujunud'],
      ]),
      B.speaking('099_p_retell', 'Räägi kuuldust.', 'Räägi paarilisele Jaani puhkusest.', ['Kus Jaan oli ja kui kaua?', 'Kuidas nad sinna sõitsid?', 'Mida nad vihmaga tegid?', 'Kuhu nad järgmisel suvel lähevad?'], [60, 90], ['Jaan oli…', 'Nad sõitsid…', 'Järgmisel suvel…']),
    ],
    transfer: [
      B.text('099_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'Proovieksami teine pool. Kirjuta 30 minutit ilma sõnaraamatuta. Siis räägi paarilisega. Lõpus võrdle tulemust esimese proovieksamiga.'),
      B.notice('099_t_card', 'Visiitkaart', ['Peeter Lepp — automehaanik', 'Töökoda „Kiire Ratas”, Tööstuse 3, Viljandi', 'Avatud: E–R kell 8–17, L kell 9–13', 'Tel 5678 1234, www.kiireratas.ee'], 'full', 'g_read'),
      B.table('099_t_compare', 'Võrdle tulemusi.', 'Kirjuta mõlema proovieksami punktid.', 'Osa, Proovieksam 1, Proovieksam 2, Muutus', ['Lugemine | | | ', 'Kuulamine | | | ', 'Kirjutamine | | | ', 'Rääkimine | | | ', 'Kokku (… / 80) | | | ']),
      B.planning('099_t_plan', 'Enne kirjutamist.', 'Kirjuta märksõnad. Mõtle oma vigadele.', ['Kes, kus, millal, kontakt?', 'Kirjutamine 2: kus, millal, mida kaasa võtta?', 'Minu kolm viga, mida kontrollin:', 'Mitu sõna ma kirjutan?']),
      B.letter('099_t_info', 'Kirjutamine 1. Soovita automehaanikut.', 'Naabri auto ei käivitu. Kirjuta: kes, kus, millal, kuidas ühendust võtta.', 'Tere, Sofia!', 'Head päeva!', [25, 40]),
      B.letter('099_t_invite', 'Kirjutamine 2 (valik A). Kutse piknikule.', 'Kutsu kolleegid piknikule. Kirjuta: kus, millal, mida kaasa võtta.', 'Head kolleegid!', 'Ootan teid! Markus', [30, 50]),
      B.writing('099_t_summer', 'Kirjutamine 2 (valik B). Minu eelmine suvi.', 'Kirjuta 4–6 lauset: kus olid, mida tegid, mis meeldis kõige rohkem.', [4, 6], ['eelmisel', 'sest', 'kõige'], 2),
      B.speaking('099_t_pics', 'Rääkimine 1. Võrdle pilte.', 'Sinul on pilt „Pere kodus”, paarilisel „Pere looduses”. Kirjelda ja võrdle.', ['Kes on pildil ja mida nad teevad?', 'Mis on piltidel sarnast?', 'Mis on erinevat?', 'Kumb päev meeldib sulle rohkem? Miks?'], [60, 90], ['Minu pildil…', 'Sinu pildil aga…', 'Mulle meeldib rohkem…, sest…']),
      B.rolecards('099_t_s1', 'Rääkimine 2. Ideekaart „Töö”.', 'A küsib kaardi järgi, B vastab. Siis vahetage.',
        'Küsi 5 küsimust: amet, tööaeg, kolleegid, tee tööle, unistuste töö.', 'Vasta igale küsimusele 2–3 lausega.',
        ['Mis tööd sa teed?', 'Kuidas sa tööle sõidad?', 'Mis on sinu unistuste töö?'], ['Ma töötan…', 'Ma sõidan…, see võtab…', 'Ma tahaksin…']),
      B.rolecards('099_t_s2', 'Rääkimine 2. Ideekaart „Kodu”.', 'Nüüd küsib B ja A vastab.',
        'Vasta igale küsimusele 2–3 lausega.', 'Küsi 5 küsimust: korter või maja, toad, naabrid, mis meeldib, mida muudaksid.',
        ['Ma elan…', 'Meil on… tuba.', 'Mulle meeldib, et…'], ['Kas sa elad korteris või majas?', 'Mitu tuba teil on?', 'Millised on su naabrid?']),
      B.speaking('099_t_result', 'Räägi oma tulemusest.', 'Räägi paarilisele: mis läks paremini, mis halvemini ja miks.', ['Mis osa paranes kõige rohkem?', 'Mis on veel raske?', 'Mis on sinu järgmine samm?'], [45, 90], ['… läks paremini kui esimesel korral.', '… on endiselt raskem, sest…', 'Järgmiseks ma…']),
      B.rubric('099_t_rubric', 'Hindamine.', 'Kirjuta punktid ja märgi.', ['Kirjutamine: … / 20 p (õpetaja hindab)', 'Rääkimine: … / 20 p (õpetaja hindab)', 'Kokku: … / 80 p. Esimesel korral: … / 80 p.', 'Vähemalt 48 p ja ükski osa ei ole 0 p.', 'Minu järgmine samm: …']),
      B.selfcheck('099_t_self', ['Ma oskan mõista uute teemade tekste ilma sõnaraamatuta.', 'Ma oskan teha lugemise ja kuulamise õigel ajal.', 'Ma oskan võrrelda: parem, rohkem, vähem kui.', 'Ma oskan kirjutada ja rääkida eksami vormis.', 'Ma oskan nimetada oma järgmise sammu.'], 'Proovieksam 2 on tehtud'),
    ],
  },

  'a2-100': {
    title: 'Kontroll 20 — A2 lõpphindamine',
    assessment: true,
    canDo: 'Ma lahendan A2 lõpphindamise neli osa iseseisvalt, hindan oma oskusi „Ma oskan…” lausetega ja koostan oma A2 → B1 plaani.',
    discover: [
      B.text('100_d_situation', 'Kursuse viimane tund', 'Oksana alustas A2 kursust aasta tagasi. Siis oskas ta ainult ennast tutvustada. Nüüd ajab ta eesti keeles asju poes, arsti juures ja tööl. Järgmisena tahab ta õppida B1 tasemel. Ja sina?'),
      B.truefalse('100_d_tf', 'Õige või vale?', 'Loe sissejuhatust. Kas lause on õige?', [
        ['Oksana alustas kursust kuu aega tagasi.', false],
        ['Kursuse alguses oskas Oksana ennast tutvustada.', true],
        ['Nüüd räägib Oksana arsti juures eesti keelt.', true],
        ['Oksana ei taha enam eesti keelt õppida.', false],
        ['Oksana järgmine eesmärk on B1.', true],
      ], 'full'),
      B.reading('100_d_read', 'Loe: Oksana A2 teekond.', 'Loe tekst ja vasta küsimustele.', 'Oksana aasta',
        'Aasta tagasi tuli Oksana esimesse eesti keele tundi. Ta oskas öelda ainult oma nime ja vanust. Poes näitas ta näpuga. Arsti juurde läks ta koos tütrega, sest tütar rääkis eesti keelt. Kursusel õppis ta kõigepealt rääkima endast ja oma perest. Siis tulid pood, linn, tervis ja töö. Kõige raskem oli Oksanale minevik. „Läksin, tulin, tegin” – need vormid tundusid võimatud. Ta kirjutas iga päev kolm lauset oma päevast. Pool aastat hiljem märkas ta, et vormid tulevad ise. Nüüd helistab Oksana ise perearstile ja paneb aja kinni. Tööl räägib ta kolleegidega lõunal eesti keeles. Proovieksamil sai ta 61 punkti 80-st. Kõige parem oli lugemine, kõige nõrgem kuulamine. Järgmisel aastal tahab Oksana teha B1 eksami. Tema plaan on lihtne: iga päev kümme minutit raadiot ja kord nädalas vestlusklubi raamatukogus.',
        [['Mida oskas Oksana aasta tagasi öelda?', 'oma nime ja vanust|nime ja vanust'], ['Miks läks Oksana arsti juurde koos tütrega?', 'tütar rääkis eesti keelt|ta ei osanud ise eesti keelt'], ['Mis oli Oksanale kõige raskem?', 'minevik|mineviku vormid'], ['Kuidas Oksana minevikku harjutas?', 'kirjutas iga päev kolm lauset|kirjutas iga päev oma päevast'], ['Kas Oksana sooritaks eksami 61 punktiga? Miks?', 'jah, sest see on üle 48 punkti|jah, üle 60 %|jah'], ['Mida Oksana B1 jaoks teeb?', 'kuulab raadiot ja käib vestlusklubis|iga päev raadio, kord nädalas vestlusklubi']]),
      B.notice('100_d_notice', 'Märka: kuidas ennast hinnata.', ['**Ma oskan** perearstile helistada.', '**Ma oskan juba** kolleegidega rääkida.', '**Ma veel ei oska** kiiret kõnet hästi kuulata.', '**Mul on vaja** rohkem kuulamist harjutada.', '**Järgmisena tahan** teha B1 eksami.', 'oskan + **da**-vorm: oskan **rääkida**, oskan **kirjutada**'], 'full'),
      B.categorize('100_d_cat', 'Mis osaoskus?', 'Pane iga „Ma oskan…” lause õige osa alla.', [
        ['Lugemine', ['loen kuulutust', 'leian sildilt lahtiolekuaja']],
        ['Kuulamine', ['saan aru teatest jaamas', 'kirjutan telefonist kuuldud kellaaja']],
        ['Kirjutamine', ['kirjutan kutse', 'täidan ankeedi']],
        ['Rääkimine', ['kirjeldan pilti', 'panen telefonis aja kinni']],
      ], 'full', 'g_vocab'),
      B.wordforms('100_d_da', 'Ma oskan + da-vorm.', 'Kirjuta tegusõna da-vormis.', [
        ['rääkima', 'Ma oskan …', 'rääkida'], ['kirjutama', 'Ma oskan …', 'kirjutada'], ['lugema', 'Ma oskan …', 'lugeda'], ['helistama', 'Ma oskan arstile …', 'helistada'], ['kuulama', 'Ma oskan raadiot …', 'kuulata'], ['täitma', 'Ma oskan ankeeti …', 'täita'],
      ]),
      B.gaps('100_d_gaps', 'Oksana lausetes.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Aasta tagasi [tuli] (tulema) Oksana esimesse tundi.', 'Ta [ei osanud] (oskama, eitus) palju öelda.', 'Nüüd helistab ta ise [perearstile] (perearst).', 'Lõunal räägib ta [kolleegidega] (kolleegid).', 'Kuulamine on talle [raskem] (raske) kui lugemine.', 'Kord nädalas läheb ta [raamatukokku] (raamatukogu).',
      ]),
      B.errorfix('100_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma oskan rääkima eesti keelt.', 'Ma oskan rääkida eesti keelt.'], ['Aasta tagasi ma ei oskasin midagi.', 'Aasta tagasi ma ei osanud midagi.'], ['Ma helistan perearst.', 'Ma helistan perearstile.'], ['Kuulamine on raskem lugemine.', 'Kuulamine on raskem kui lugemine.'], ['Ma lähen vestlusklubis.', 'Ma lähen vestlusklubisse.'], ['Mina meeldib eesti keel.', 'Mulle meeldib eesti keel.'], ['Ma räägin kolleegid eesti keeles.', 'Ma räägin kolleegidega eesti keeles.'], ['Ma tahan teha B1 eksam.', 'Ma tahan teha B1 eksami.'],
      ]),
      B.listening('100_d_listen', 'Kuula: õpetaja soovitused.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Head õppijad! A2 on käes või peaaegu käes. Mis edasi?',
        'Kuulake iga päev vähemalt kümme minutit eesti raadiot.',
        'Lugege lihtsaid uudiseid. Neid on internetis palju.',
        'Kirjutage nädalas üks lühike kiri või sõnum, näiteks sõbrale.',
        'Rääkige eesti keelt ka poes ja tööl, isegi kui teete vigu.',
        'Raamatukogus on igal neljapäeval vestlusklubi. See on tasuta.',
        'B1 kursus algab veebruaris. Registreerida saab jaanuaris.',
      ], ['Raadiot tuleb kuulata iga päev [kümme minutit|10 minutit].', 'Internetis saab lugeda lihtsaid [uudiseid].', 'Nädalas tuleb kirjutada üks [kiri|sõnum].', 'Vestlusklubi on igal [neljapäeval].', 'Vestlusklubi on [tasuta].', 'B1 kursus algab [veebruaris].']),
      D('100_d_dict', ['Ma oskan perearstile helistada.', 'Ma saan aru lühikestest teadetest.', 'Kirjutamine on mulle veel raske.', 'Ma tahan teha B1 eksami.', 'Iga päev kuulan ma raadiot.', 'Kord nädalas käin vestlusklubis.', 'Ma loen lihtsaid uudiseid.', 'Ma ei karda enam rääkida.']),
      B.transformation('100_d_trans', 'Siis ja nüüd.', 'Kirjuta lause antud sõnaga.', [
        ['Ma ei oska helistada.', 'nüüd', 'Nüüd ma oskan helistada.|Nüüd oskan ma helistada.'], ['Ma oskan ainult nime öelda.', 'aasta tagasi', 'Aasta tagasi ma oskasin ainult nime öelda.|Aasta tagasi oskasin ma ainult nime öelda.'], ['Kuulamine on raske. Lugemine on kerge.', 'raskem kui', 'Kuulamine on raskem kui lugemine.'], ['Ma kuulan raadiot.', 'pean', 'Ma pean raadiot kuulama.'], ['Ma lähen vestlusklubisse.', 'tahan', 'Ma tahan vestlusklubisse minna.|Ma tahan minna vestlusklubisse.'],
      ]),
      B.writing('100_d_write', 'Minu A2 aasta.', 'Kirjuta 5–7 lauset: mida oskasid alguses, mida oskad nüüd, mis on veel raske.', [5, 7], ['alguses', 'nüüd', 'oskan', 'veel'], 3),
      B.speaking('100_d_say', 'Mida sa nüüd oskad?', 'Räägi paarilisele 1–2 minutit.', ['Mida sa kursuse alguses oskasid?', 'Mida sa nüüd eesti keeles teed?', 'Mis on veel raske?', 'Mida sa järgmisena tahad õppida?'], [60, 120], ['Alguses ma oskasin ainult…', 'Nüüd ma oskan…', 'Mul on vaja rohkem…']),
    ],
    practice: [
      B.tip('100_p_how', 'Lõpphindamine. Osa A ja B', `Osa B on lugemine ja kuulamine, osa A on keel. Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda. ${POINTS} Eesmärk on vähemalt 70 %.`, 'full'),
      // reading 1: everyday phrases and politeness
      B.choice('100_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Kolleeg läheb homme eksamile. Mida ütled?', 'Edu!', 'Terviseks!', 'Head isu!'],
        ['Sa kohtad õhtul naabrit. Mida ütled?', 'Tere õhtust!', 'Tere hommikust!', 'Head ööd!'],
        ['Sõber aevastab. Mida ütled?', 'Terviseks!', 'Edu!', 'Palju õnne!'],
        ['Sa ei saanud telefonis nimest aru. Mida ütled?', 'Vabandust, kas te saaksite nime korrata?', 'Aitäh, kõik on selge.', 'Head aega!'],
        ['Sõber kutsub sind kinno, aga sul pole aega. Mida ütled?', 'Aitäh, aga täna ma kahjuks ei saa.', 'Jah, tulen hea meelega!', 'Pole tänu väärt.'],
        ['Reede õhtul lahkud töölt. Mida ütled kolleegidele?', 'Head nädalavahetust!', 'Head uut aastat!', 'Tere tulemast!'],
      ]),
      // reading 2: three short texts, answers by letter
      B.reading('100_p_three', 'Lugemine 2. Kolm teksti.', 'Loe tekste. Vasta tähega (A, B, C) ja lühidalt.', 'Kuulutus, teade, sõnum',
        'A. Kadunud kass! Meie hall kass Miisu kadus pühapäeva õhtul Kuuse tänaval. Tal on valge saba ja punane kaelarihm. Miisu on sõbralik, aga kardab koeri. Kui sa nägid teda, palun helista: 5233 4455. Leidjale anname 50 eurot. Aitäh! Perekond Tamm\n\nB. Linnaraamatukogu teatab: suvel muutuvad lahtiolekuajad. Juunis, juulis ja augustis oleme avatud E–R kella kümnest kuueni. Laupäeval ja pühapäeval on raamatukogu suletud. Raamatuid saab tagastada ka maja ees olevasse kasti. Lastele on suvel lugemisvõistlus.\n\nC. Tere, Anna! Tänan, et sa eile lapsi hoidsid. Nad räägivad ainult sinust! Kahjuks unustas Eliise sinu juurde oma mütsi. Kas ma võin homme pärast tööd selle ära tuua? Ma saan tulla umbes kella kuue paiku. Kui see ei sobi, kirjuta mulle. Liis',
        [['Kes otsib oma looma?', 'A|perekond Tamm'], ['Kes tahab midagi ära tuua?', 'C|Liis'], ['Kuhu saab suvel raamatuid tagastada?', 'B|kasti|maja ees olevasse kasti'], ['Mis värvi on kassi kaelarihm?', 'A|punane'], ['Millal on raamatukogu suvel suletud?', 'B|laupäeval ja pühapäeval|nädalavahetusel'], ['Mida Eliise unustas?', 'C|mütsi|oma mütsi']]),
      // reading 3: notices matched to situations (5 items, 2 extra)
      B.notice('100_p_signlist', 'Lugemine 3. Kuulutused', ['A — Juuksur: aeg ainult internetis', 'B — Tasuta parkimine 2 tundi', 'C — Pood: E–P 8–22', 'D — Rattaparandus: valmib 1 päevaga', 'E — Ujula suletud 1.–15. juulini', 'F — Pagariäri: värske sai iga päev kell 7', 'G — Kirjad ja pakid: kontor 2. korrusel'], 'full', 'g_read'),
      B.table('100_p_signs', 'Lugemine 3. Kuhu sa lähed?', 'Kirjuta iga olukorra juurde kuulutuse täht. Kaks jääb üle.', 'Olukord, Kuulutus', [
        'Sa tahad hommikul sooja saia. | [F]', 'Sa tahad pühapäeva õhtul piima osta. | [C]', 'Sinu jalgratas on katki. | [D]', 'Sa tahad juukseid lõigata. | [A]', 'Juuli alguses ei saa siin ujuda. | [E]',
      ], 'g_read'),
      // reading 4: a ~145-word text, 5 questions with 3 options
      B.reading('100_p_text', 'Lugemine 4. Jaani peenar.', 'Loe tekst. Siis vasta kahele küsimusele lühidalt.', 'Jaani peenar',
        'Jaan elab Tallinnas kortermajas. Tal ei ole oma aeda, aga ta armastab köögivilju kasvatada. Eelmisel kevadel kuulis ta raadiost, et linnas on uus ühine aed. Seal saab iga inimene rentida väikese peenra. Rent maksab kakskümmend eurot aastas. Jaan läks kohe vaatama. Aed asub jõe ääres, bussipeatusest viie minuti kaugusel. Jaan istutas kartulit, porgandit ja tilli. Vett saab võtta suurest tünnist. Aias on ka väike maja, kus on tööriistad. Iga kuu esimesel laupäeval teevad kõik koos talgud. Pärast talguid süüakse koos suppi. Jaani naaber aias on vanem proua Maie. Ta õpetas Jaanile palju. Sügisel oli saak hea. Jaan andis porgandeid ka oma kolleegidele. Järgmisel aastal tahab ta kasvatada ka maasikaid.',
        [['Kus aed asub?', 'jõe ääres'], ['Mida Jaan istutas?', 'kartulit, porgandit ja tilli|kartulit ja porgandit']]),
      B.choice('100_p_textmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali üks vastus.', [
        ['Miks rendib Jaan peenra?', 'Tal ei ole oma aeda.', 'Ta tahab tööd leida.', 'Tal on vaja raha.'],
        ['Kui palju maksab peenar?', '20 eurot aastas', '20 eurot kuus', 'see on tasuta'],
        ['Mida teevad inimesed iga kuu esimesel laupäeval?', 'teevad koos talgud', 'müüvad köögivilju', 'käivad jões ujumas'],
        ['Kes on Maie?', 'Jaani naaber aias', 'Jaani kolleeg', 'aia juht'],
        ['Mida tahab Jaan järgmisel aastal kasvatada?', 'maasikaid', 'kartulit', 'tilli'],
      ]),
      // reading 5: a personal letter, 8 gaps with 3 options
      B.cloze('100_p_cloze', 'Lugemine 5. Kiri sõbrale.', 'Vali igasse lünka sobiv sõna.', 'Kallis Markus!', [
        'Aitäh, et sa eile mind {*aitasid|aitad|aitama}! Üksi oleks kolimine olnud väga raske. Uus korter on {*suurem|suur|suurim} kui vana. Mul on nüüd ka rõdu. Hommikul joon ma {*rõdul|rõdule|rõdult} kohvi. Lähim pood on {*maja|majas|majja} kõrval. Täna {*ei läinud|ei läksin|ei minema} ma tööle, sest pakkisin kaste lahti.',
        '',
        'Järgmisel laupäeval teen väikese peo. Kas sa {*tahaksid|tahtma|tahta} tulla? Pidu algab kell kuus. Sa võid {*kaasa võtta|kaasa võtma|kaasa võtad} ka oma naise. Kirjuta, kas sa {*saad|saada|saame} tulla!',
        '',
        'Sinu sõber Andrei',
      ]),
      // listening: an announcement and a phone call, answers of 1–2 words
      B.listening('100_p_listen', 'Kuulamine 1. Spordiklubi teade.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin on spordiklubi „Energia”. Kuulake meie uudiseid.',
        'Alates esmaspäevast on klubi avatud juba kell kuus hommikul.',
        'Uus treener Kati juhib joogat teisipäeval ja neljapäeval.',
        'Tund kestab üks tund ja algab kell seitse õhtul.',
        'Võtke kaasa oma matt ja veepudel.',
        'Kuu pilet maksab nüüd kolmkümmend viis eurot.',
        'Õpilastele ja pensionäridele on pilet kakskümmend eurot.',
        'Parkida saab maja taga, see on tasuta.',
      ], ['Klubi on avatud kell [kuus|6] hommikul.', 'Jooga treener on [Kati].', 'Jooga on teisipäeval ja [neljapäeval].', 'Kaasa tuleb võtta matt ja [veepudel|vesi].', 'Kuu pilet maksab [kolmkümmend viis|35] eurot.', 'Parkida saab maja [taga].']),
      B.listening('100_p_listen2', 'Kuulamine 2. Ema sünnipäev.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, ema! Kuidas läheb?', '— Tere, Anna! Hästi. Kas sa tuled laupäeval minu sünnipäevale?',
        '— Muidugi tulen! Mis kell?', '— Tule kell kolm. Tädi Malle tuleb ka.',
        '— Mida ma kaasa võtan? Kas teen salatit?', '— Ei, salati teen ise. Palun too kook.',
        '— Hea. Kas šokolaadikook või õunakook?', '— Isa armastab õunakooki. Too see.',
        '— Selge. Ma tulen rongiga, sest auto on remondis.', '— Siis isa tuleb sulle jaama vastu.',
        '— Aitäh! Rong jõuab kohale veerand kolm.', '— Väga hea. Ootame sind!',
      ], ['Ema sünnipäev on [laupäeval].', 'Anna peab tulema kell [kolm|3|15].', 'Salati teeb [ema].', 'Anna toob [õunakoogi|õunakooki|kooki].', 'Anna sõidab [rongiga].', 'Jaama tuleb vastu [isa].']),
      // part A: language, one task per lesson goal of the module (forms, places, errors)
      B.gaps('100_p_forms', 'Osa A. Kirjuta õige vorm.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Kas sa saad mind homme [aidata] (aitama)?', 'Me [ei olnud] (olema, eitus) eile kodus.', 'Täna on ilm [soojem] (soe) kui eile.', 'Ma panen võtme [lauale] (laud).', 'Ta tuli just [poest] (pood).', 'Mul on kaks [venda] (vend).',
      ]),
      B.wordforms('100_p_where', 'Osa A. Kuhu, kus, kust?', 'Kirjuta sõna õiges vormis.', [
        ['kool', 'kuhu?', 'kooli'], ['töö', 'kus?', 'tööl'], ['arst', 'kelle juurde?', 'arsti juurde'], ['turg', 'kust?', 'turult'], ['Tallinn', 'kuhu?', 'Tallinnasse|Tallinna'], ['saun', 'kus?', 'saunas'],
      ]),
      B.errorfix('100_p_fix', 'Osa A. Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma lähen poes.', 'Ma lähen poodi.'], ['Eile ma ei tulin.', 'Eile ma ei tulnud.'], ['Ta on suurem minu.', 'Ta on suurem kui mina.|Ta on minust suurem.'], ['Ma tahan õppima eesti keelt.', 'Ma tahan õppida eesti keelt.'], ['Mul on palju sõbrad.', 'Mul on palju sõpru.'], ['Mina meeldib jalgpall.', 'Mulle meeldib jalgpall.'], ['Ma sõidan rongis Tartusse.', 'Ma sõidan rongiga Tartusse.'], ['Ema palus tuua õunakook.', 'Ema palus tuua õunakoogi.'],
      ]),
      TR('100_p_tr', ['Я иду в школу.', 'Вчера меня не было дома.', 'Ты можешь мне помочь?', 'Сегодня теплее, чем вчера.', 'У меня два брата.']),
      B.speaking('100_p_retell', 'Räägi kuuldust.', 'Räägi paarilisele Anna ema sünnipäevast.', ['Millal ja mis kell on sünnipäev?', 'Mida Anna kaasa võtab?', 'Kuidas Anna sinna sõidab?', 'Kes ta jaamas vastu võtab?'], [60, 90], ['Sünnipäev on…', 'Anna toob…', 'Ta sõidab…, sest…']),
    ],
    transfer: [
      B.listening('100_t_message', 'Osa C. Jelena häälsõnum.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin Jelena. Mul on suur uudis: ma kolin Pärnusse!',
        'Mu mees sai seal uue töö. Me kolime juba märtsis.',
        'Ma otsin Pärnus ka tööd, võib-olla raamatukogus.',
        'Ja ma tahan seal B1 kursusel käia. Kas sa tead mõnda head kooli?',
        'Laupäeval teen väikese lahkumispeo. Kas sa aitad mul seda korraldada?',
        'Helista mulle õhtul pärast kuut!',
      ], ['Jelena kolib [Pärnusse].', 'Nad kolivad [märtsis].', 'Jelena tahab töötada [raamatukogus].', 'Ta tahab käia [B1] kursusel.', 'Lahkumispidu on [laupäeval].', 'Helistada tuleb pärast kella [kuut|6|18].']),
      B.notice('100_t_card', 'Visiitkaart', ['Keelekool „Samm-sammult”', 'Kooli 4, Pärnu (bussijaama lähedal)', 'B1 kursus: T ja N kell 18–20, algus 1. veebruaril', 'Info ja registreerimine: 5600 7700, info@sammsammult.ee'], 'full', 'g_read'),
      B.table('100_t_form', 'Täida kursuse registreerimisvorm.', 'Kirjuta oma andmed, nagu registreeruksid ise.', 'Andmed, Sinu vastus', ['Ees- ja perekonnanimi | ', 'Telefon või e-post | ', 'Minu tase praegu | ', 'Millal sul on aega õppida? | ', 'Miks sa tahad B1 kursusele tulla? | ']),
      B.letter('100_t_info', 'Kirjutamine 1. Soovita kursust.', 'Kirjuta Jelenale: mis kursus, kus, millal, kuidas registreerida.', 'Tere, Jelena!', 'Edu Pärnus!', [25, 40]),
      B.letter('100_t_invite', 'Kirjutamine 2. Kutse lahkumispeole.', 'Kutsu sõbrad Jelena lahkumispeole. Kirjuta: kus, millal, mida kaasa võtta, miks.', 'Head sõbrad!', 'Ootan teid!', [30, 50]),
      B.speaking('100_t_pic', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab pildi „Kolimine”. Kirjelda umbes 1 minut ja vasta küsimustele.', ['Kes on pildil?', 'Mida nad teevad?', 'Mis on kastides?', 'Kas sina oled palju kolinud?'], [60, 90], ['Pildil on…', 'Nad tassivad…', 'Ma arvan, et…']),
      B.rolecards('100_t_idea', 'Rääkimine 2. Ideekaart „Uus linn”.', 'A on Jelena ja küsib, B vastab. Siis vahetage.',
        'Küsi 5 küsimust: korter, töö, kool lapsele, keelekursus, vaba aeg uues linnas.', 'Vasta igale küsimusele 2–3 lausega ja anna üks soovitus.',
        ['Kus on hea korter leida?', 'Kus ma saan eesti keelt õppida?', 'Mida Pärnus vabal ajal teha?'], ['Ma soovitan…, sest…', 'Seal on…', 'Sa võid…']),
      B.transformation('100_t_advice', 'Anna Jelenale nõu.', 'Kirjuta lause käskiva vormiga.', [
        ['Sa pead registreeruma jaanuaris.', 'käsk', 'Registreeru jaanuaris!'], ['Sa pead helistama koolile.', 'käsk', 'Helista koolile!'], ['Sa võiksid raadiot kuulata.', 'käsk', 'Kuula raadiot!'], ['Sa ei pea kartma.', 'keeld', 'Ära karda!'], ['Sa ei pea kõike tõlkima.', 'keeld', 'Ära tõlgi kõike!'],
      ]),
      B.writing('100_t_plan', 'Minu A2 → B1 plaan.', 'Kirjuta 5–7 lauset: tugev osa, nõrk osa, mida teed iga päev ja iga nädal.', [5, 7], ['iga päev', 'kord nädalas', 'tahan', 'pean'], 3),
      B.speaking('100_t_self', 'Räägi oma plaanist.', 'Räägi paarilisele oma A2 → B1 plaanist umbes 1 minut.', ['Mis osa on sinu tugev osa?', 'Mida sa harjutad kõige rohkem?', 'Millal sa tahad teha B1 eksami?'], [60, 90], ['Minu tugev osa on…', 'Ma pean rohkem…', 'Ma tahan…']),
      B.rubric('100_t_teacher', 'Osa C. Õpetaja hindab.', 'Iga kriteerium 0–2 punkti.', ['Ülesande täitmine: kõik punktid on vastatud (0–2 p).', 'Keel: vormid ja sõnajärg on arusaadavad (0–2 p).', 'Seotus ja suhtlus: laused on seotud, vestlus jätkub (0–2 p).']),
      B.rubric('100_t_profile', 'Minu A2 profiil.', 'Kirjuta kõigi nelja osa punktid.', ['Lugemine: … / 20 p', 'Kuulamine: … / 20 p', 'Kirjutamine: … / 20 p', 'Rääkimine: … / 20 p', 'Kokku: … / 80 p. Harno: vähemalt 48 p ja ükski osa pole 0. KeeleSepp: 56 p (70 %).']),
      B.selfcheck('100_t_self_check', ['Ma oskan kasutada A2 põhisõnavara ilma sõnaraamatuta.', 'Ma oskan saada lugemises ja kuulamises vähemalt 70 % õigeid vastuseid.', 'Ma oskan kasutada kus-, kuhu-, kust-vorme, ma- ja da-vormi ning minevikku.', 'Ma oskan kirjutada ja rääkida uues olukorras.', 'Ma oskan nimetada oma tugeva ja nõrga osa ning plaani B1 jaoks.'], 'A2 on käes — edasi B1 poole!'),
    ],
  },
};
