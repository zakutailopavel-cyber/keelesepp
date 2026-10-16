// B1 course (A2 → B1 roadmap), module 2 „Mina, pere ja suhted” (a2b1-006…010), stage A2.
// Avasta → Harjuta → Kasuta, each a whole lesson (40–55 min): the same core words, the genitive (kelle?), on / tal on and
// sest-reasons are practised in different task types, then used in new situations. Material also from the
// KeeleSepp A2→B1 workbook, lessons 11–12 (Perekond ja suhted; Välimus ja iseloom).
import { B } from '../../../blocks.js';

export const MODULE = { id: 'a2b1-module-02', course: 'b1', title: 'Mina, pere ja suhted', level: 'A2' };

export const LESSONS = {
  'a2b1-006': {
    title: 'Pere ja lähedased',
    canDo: 'Ma tutvustan 4–5 lähedast inimest ja lisan igaühe kohta vähemalt ühe sisulise detaili.',
    discover: [
      B.text('006_d_intro', 'Kes on kes?', 'Anna sai laupäeval 28-aastaseks. Peol oli kogu tema pere. Esmaspäeval näitab Anna kolleegile Evale pilte. Eva küsib: „Kes see on? Kes ta sulle on?” Selles tunnis õpid pere sõnu ja küsimust kelle?'),
      B.vocab('006_d_vocab', 'Pere sõnad', ['pere — семья', 'vanemad — родители', 'vanaema — бабушка', 'vanaisa — дедушка', 'vend — брат', 'õde — сестра', 'poeg — сын', 'tütar — дочь', 'onu — дядя', 'tädi — тётя', 'õetütar — племянница', 'abikaasa — супруг(а)', 'sugulane — родственник', 'lähedane — близкий человек', 'kelle? — чей?'], '2'),
      B.reading('006_d_read', 'Loe: Anna pere.', 'Loe teksti ja vasta küsimustele.', 'Anna pere',
        'Anna on 28 aastat vana ja elab Tallinnas. Tema abikaasa nimi on Igor. Igor on arst. Anna vanemad elavad Pärnus. Anna ema on raamatupidaja ja isa on bussijuht. Annal on üks vend ja üks õde. Venna nimi on Rasmus. Ta on 32-aastane ja elab Soomes. Rasmusel on naine ja väike poeg. Anna õde Grete on üliõpilane. Ta on Annast kuus aastat noorem. Anna vanaema ja vanaisa elavad maal. Vanaema on 85, aga ta on väga aktiivne. Anna ema õde, tädi Ülle, elab vanaema lähedal. Tädi aitab vanaemal aias. Anna sünnipäeval oli kogu pere koos. Rasmus ei saanud tulla, sest ta oli tööl. Ta helistas Annale video kaudu. Vanaema tõi Annale kingituseks sooja salli. Anna arvab, et pere on tema jaoks kõige tähtsam.',
        [['Kus elavad Anna vanemad?', 'Pärnus'], ['Mis tööd teeb Anna abikaasa?', 'ta on arst|arst'], ['Mitu õde-venda Annal on?', 'kaks|üks vend ja üks õde'], ['Kes on Rasmus Annale?', 'vend|tema vend'], ['Kes on tädi Ülle?', 'Anna ema õde|ema õde'], ['Miks ei tulnud Rasmus peole?', 'ta oli tööl|sest ta oli tööl']]),
      B.truefalse('006_d_tf', 'Õige või vale?', 'Loe Anna lugu uuesti.', [
        ['Anna abikaasa on bussijuht.', false], ['Rasmusel on poeg.', true], ['Grete on Annast vanem.', false], ['Tädi Ülle elab vanaema lähedal.', true], ['Vanaema kinkis Annale salli.', true],
      ]),
      B.notice('006_d_notice', 'Märka: kelle?', ['**Kelle** pilt see on? — See on **Anna** pilt.', 'vend → **venna** naine, õde → **õe** tütar', 'tütar → **tütre** kool, poeg → **poja** auto', 'isa õde = **tädi**, ema vend = **onu**', 'Kes ta **sulle** on? — Ta on **minu ema õde**.', 'Mul on vend. → **Minu vend** elab Soomes.'], 'full'),
      B.categorize('006_d_sort', 'Naine või mees?', 'Sorteeri pere sõnad kolme rühma.', [
        ['Naised', ['vanaema', 'tädi', 'õde', 'tütar', 'õetütar']], ['Mehed', ['vanaisa', 'onu', 'vend', 'poeg']], ['Mõlemad', ['abikaasa', 'sugulane', 'vanem', 'laps']],
      ]),
      B.wordforms('006_d_forms', 'Kelle? Omastav.', 'Kirjuta sõna omastavas.', [
        ['vend', 'kelle naine?', 'venna'], ['õde', 'kelle tütar?', 'õe'], ['tütar', 'kelle kool?', 'tütre'], ['poeg', 'kelle auto?', 'poja'],
        ['isa', 'kelle õde?', 'isa'], ['vanaema', 'kelle maja?', 'vanaema'], ['sugulane', 'kelle pulm?', 'sugulase'], ['abikaasa', 'kelle töö?', 'abikaasa'],
      ]),
      B.gaps('006_d_gaps', 'Kes ta sulle on?', 'Mõtle ja kirjuta sobiv pere sõna.', [
        'Minu ema õde on minu [tädi].', 'Minu isa vend on minu [onu].', 'Minu ema ema on minu [vanaema].', 'Minu õe tütar on minu [õetütar].', 'Minu isa isa on minu [vanaisa].', 'Minu mees on minu [abikaasa].',
      ], ['tädi', 'onu', 'vanaema', 'õetütar', 'vanaisa', 'abikaasa', 'vend', 'poeg']),
      B.transformation('006_d_trans', 'Ütle kelle-vormiga.', 'Tee kahest lausest üks lause.', [
        ['Mul on vend. Tal on auto.', 'See on …', 'See on minu venna auto.'], ['Mul on õde. Tal on kass.', 'See on …', 'See on minu õe kass.'],
        ['Mul on tädi. Tal on maja.', 'See on …', 'See on minu tädi maja.'], ['Mul on tütar. Tal on jalgratas.', 'See on …', 'See on minu tütre jalgratas.'],
        ['Mul on poeg. Tal on kitarr.', 'See on …', 'See on minu poja kitarr.'],
      ]),
      B.errorfix('006_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['See on minu vend naine.', 'See on minu venna naine.'], ['Ta on minu ema õde, minu onu.', 'Ta on minu ema õde, minu tädi.'], ['Minu õde tütar on viieaastane.', 'Minu õe tütar on viieaastane.'],
        ['Kelle see on pilt?', 'Kelle pilt see on?'], ['Minu poeg kool on lähedal.', 'Minu poja kool on lähedal.'],
      ]),
      B.listening('006_d_listen', 'Kuula: Sofia pere.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Sofia. Ma olen 19-aastane ja õpin Tartus ülikoolis.',
        'Minu pere elab Narvas. Meie peres on kuus inimest.',
        'Minu ema on õpetaja. Ta töötab koolis ja on väga rahulik.',
        'Minu isa on autojuht. Tema töö on raske, sest ta sõidab palju.',
        'Mul on kaks venda. Vanem vend Andrei on 25 ja elab Tallinnas.',
        'Noorem vend Mart käib veel koolis. Ta on 14 ja mängib jalgpalli.',
        'Minu vanaema elab meiega koos. Ta teeb kõige paremaid pannkooke.',
        'Igal õhtul helistan ma emale. Suvel sõidan ma koju.',
      ], ['Sofia õpib [Tartus].', 'Sofia pere elab [Narvas].', 'Sofia ema töötab [koolis].', 'Sofia isa on [autojuht].', 'Vanem vend elab [Tallinnas].', 'Vanaema teeb häid [pannkooke].']),
      B.translation('006_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Это моя тётя, сестра мамы.', 'Мой брат живёт в Финляндии.', 'Это машина моего мужа.', 'Кто он тебе?', 'У моей сестры есть дочь.']),
      B.speaking('006_d_say', 'Minu lähedased.', 'Tutvusta nelja lähedast. Ütle igaühe kohta üks detail.', ['Kes ta sulle on?', 'Kus ta elab?', 'Mida ta teeb?', 'Milline ta on?'], [60, 90], ['Minu ema õde on…', 'Ta elab…', 'Ta töötab…']),
      B.writing('006_d_write', 'Minu pere.', 'Kirjuta 6–8 lauset: kes on sinu peres ja üks detail.', [6, 8], ['minu', 'elab', 'venna', 'õe'], 2),
      B.selfcheck('006_d_self', ['Ma tean 15 pere sõna.', 'Ma ütlen, kes kellele on.', 'Ma moodustan omastava: venna, õe, tütre.', 'Ma tutvustan nelja lähedast.'], 'Minu pere on sõnades'),
    ],
    practice: [
      B.match('006_p_words', 'Kes on kes?', 'Ühenda sõna ja seletus.', [
        ['vanaema', 'ema või isa ema'], ['onu', 'ema või isa vend'], ['tädi', 'ema või isa õde'], ['õetütar', 'õe või venna tütar'],
        ['abikaasa', 'mees või naine abielus'], ['sugulane', 'pereliige laiemas mõttes'],
      ], 'half'),
      B.truefalse('006_p_logic', 'Pereloogika.', 'Mõtle ja vasta: õige või vale?', [
        ['Minu isa vend on minu onu.', true], ['Minu ema õde on minu vanaema.', false], ['Minu õe tütar on minu vennatütar.', false],
        ['Abikaasa on mees või naine, kellega oled abielus.', true], ['Minu vanaema poeg võib olla minu isa.', true],
      ]),
      B.gaps('006_p_gen', 'Kelle? Kasuta omastavat.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma elan koos [ema] (ema) ja [õega] (õde).', 'Pühapäeval läheme [vanaema] (vanaema) juurde.', 'See on minu [venna] (vend) jalgratas.',
        'Minu [isa] (isa) õde elab Pärnus.', 'Kas see on sinu [tädi] (tädi) koer?', 'Me tähistame [onu] (onu) sünnipäeva maal.',
      ]),
      B.wordorder('006_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', [
        'Minu õde elab Tartus koos mehega.', 'Vanaisa parandab meiega jalgrattaid.', 'Me käime vanaema juures kaks korda kuus.', 'Minu parim sõber on mulle nagu vend.',
      ]),
      B.crossword('006_p_cross', 'Pere ristsõna.', 'Kirjuta sõna vihje järgi.', [
        ['Ema ja isa koos', 'vanemad'], ['Vanaema ja vanaisa koos', 'vanavanemad'], ['Minu ema ema', 'vanaema'], ['Poeg või tütar', 'laps'], ['Isa või ema', 'vanem'],
      ]),
      B.speaking('006_p_photo', 'Näita pilti ja räägi.', 'Kirjelda pere- või sõprade fotot. Räägi 1 minut.', [
        'Kes on pildil?', 'Kes ta sulle on?', 'Kus ja millal pilt tehti?', 'Mida te seal tegite?', 'Kellega sa kõige sagedamini suhtled?',
      ], [45, 90], ['Pildil on…', 'Vasakul on minu…', 'Ta on minu ema õde.', 'Me olime…']),
      B.reading('006_p_read', 'Loe: Kaisa pere.', 'Loe tekst. Vasta täislausega.', 'Kaisa suur pere',
        'Kaisa on kahekümne viie aastane ja elab Tallinnas. Tema pere on suur. Kaisa vanemad elavad Pärnus. Ema on õpetaja ja isa töötab sadamas. Kaisal on kaks venda ja üks õde. Vanem vend Martin elab Soomes koos naise ja kahe lapsega. Noorem vend Rasmus õpib ülikoolis. Kaisa õde Liisa on temast kolm aastat noorem. Õed räägivad telefonis peaaegu iga päev. Suvel tuleb kogu pere vanaema juurde maale. Vanaema maja on väike, aga kõigil on seal hea olla. Kaisa arvab, et pere on tema jaoks kõige tähtsam.',
        [['Kus elavad Kaisa vanemad?', 'Pärnus'], ['Mis tööd teeb Kaisa ema?', 'ta on õpetaja|õpetaja'], ['Mitu õde-venda Kaisal on?', 'kolm|kaks venda ja üks õde'], ['Mitu last on Kaisa vanematel?', 'neli|4|neli last'], ['Kui vana on Liisa?', 'kakskümmend kaks|22|ta on 22-aastane'], ['Kus pere suvel kohtub?', 'vanaema juures maal|maal']]),
      B.wordforms('006_p_gen2', 'Kelle? Omastav kääne.', 'Kirjuta sõna omastavas.', [
        ['ema', 'kelle?', 'ema'], ['isa', 'kelle?', 'isa'], ['vend', 'kelle?', 'venna'], ['õde', 'kelle?', 'õe'], ['tütar', 'kelle?', 'tütre'], ['poeg', 'kelle?', 'poja'], ['vanaema', 'kelle?', 'vanaema'], ['laps', 'kelle?', 'lapse'],
      ]),
      B.gaps('006_p_poss', 'Minu, sinu, tema…', 'Vali sobiv asesõna.', [
        'Mina olen Kaisa. See on [minu] pere.', 'Sina oled Martin. Kas see on [sinu] naine?', 'Liisal on koer. See on [tema] koer.', 'Meil on suur maja. See on [meie] maja.',
        'Teil on kaks last. Kas need on [teie] lapsed?', 'Neil on uus auto. See on [nende] auto.',
      ], ['minu', 'sinu', 'tema', 'meie', 'teie', 'nende', 'mina', 'temal']),
      B.transformation('006_p_who', 'Ütle teisiti.', 'Kirjuta lause sõnaga „minu”.', [
        ['Mul on vend. Ta elab Soomes.', 'Minu …', 'Minu vend elab Soomes.'], ['Mul on õde. Ta on õpetaja.', 'Minu …', 'Minu õde on õpetaja.'],
        ['Mul on vanaema. Ta elab maal.', 'Minu …', 'Minu vanaema elab maal.'], ['Mul on poeg. Ta käib koolis.', 'Minu …', 'Minu poeg käib koolis.'],
        ['Mul on onu. Ta töötab sadamas.', 'Minu …', 'Minu onu töötab sadamas.'], ['Mul on tütar. Ta on viieaastane.', 'Minu …', 'Minu tütar on viieaastane.'],
      ]),
      B.translation('006_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Мой брат живёт в Тарту.', 'Это машина моего отца.', 'У меня две сестры.', 'Мы часто ездим к бабушке.', 'Моя мама работает в школе.', 'Кто тебе этот человек?']),
      B.dictation('006_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Minu pere on suur.', 'Minu vanemad elavad Pärnus.', 'Mul on kaks venda ja üks õde.', 'Vanaema elab maal väikeses majas.', 'Suvel kohtub kogu pere.', 'Pere on minu jaoks väga tähtis.']),
      B.writing('006_p_write', 'Minu pere.', 'Kirjuta 6–8 lauset oma perest. Kasuta omastavat.', [6, 8], ['minu', 'elab', 'töötab', 'venna', 'õe'], 3),
      B.selfcheck('006_p_self', ['Ma tean 10 pere sõna.', 'Ma ütlen, kes kellele on.', 'Ma kasutan omastavat: venna, õe, ema.', 'Ma räägin fotost 1 minuti.'], 'Pere sõnad on minu omad'),
    ],
    transfer: [
      B.text('006_t_situation', 'Uus olukord', 'Sa kolisid uude majja. Naaber kutsub sind kohvile ja tahab sinu perest rohkem teada.'),
      B.choice('006_t_reply', 'Sõbra vastus.', 'Sõber kirjutas tagasi. Vali sobiv reaktsioon.', [
        ['„Mu vanaema sai eile 90-aastaseks!”', 'Palju õnne talle!', 'Head paranemist talle!', 'Kahju küll!'],
        ['„Mul sündis õetütar.”', 'Kui tore! Mis ta nimi on?', 'Väga kahju. Mis juhtus?', 'Head paranemist!'],
        ['„Mu vend kolis Soome.”', 'Kas sa igatsed teda?', 'Millal ta Soomest tagasi tuli?', 'Kas te elate nüüd koos?'],
        ['„Me käisime perega matkal.”', 'Kuhu te läksite?', 'Kuhu te homme lähete?', 'Kas sa lähed üksi?'],
      ], 'full', 'g_use'),
      B.rolecards('006_t_roles', 'Naabrid tutvuvad.', 'Lugege oma rolli. Rääkige 2–3 minutit.',
        'Oled uus elanik. Tutvusta oma peret: vähemalt 4 inimest ja üks detail igaühe kohta. Küsi naabri pere kohta 2 küsimust.',
        'Oled naaber. Küsi uue elaniku pere kohta. Räägi ka oma lastest ja koerast.',
        ['Minu peres on…', 'Minu õde on…', 'Ta töötab…', 'Kas teil on lapsi?'], ['Kellega te siin elate?', 'Kas teie pere on suur?', 'Meil on kaks last.', 'See on meie koer Pontu.']),
      B.planning('006_t_plan', 'Enne kirjutamist.', 'Vali 4 lähedast inimest. Kirjuta märksõnad.', ['Kes ta on?', 'Kus ta elab?', 'Mida ta teeb?', 'Mida te koos teete?']),
      B.writing('006_t_write', 'Kiri sõbrale välismaale.', 'Sõber küsib sinu pere kohta. Kirjuta 6–8 lauset.', [6, 8], ['minu', 'elab', 'koos', 'sest'], 3),
      B.reading('006_t_profile', 'Loe tutvustust.', 'Uus kolleeg kirjutas endast. Loe ja vasta.', 'Tere, mina olen Mihkel!',
        'Tere! Mina olen Mihkel ja alustan sel nädalal teie meeskonnas. Ma olen pärit Tartust, aga nüüd elan Tallinnas koos abikaasa Kertuga. Kertu on arst ja töötab haiglas. Meil on kaks last. Tütar Lotte on seitsmeaastane ja käib esimeses klassis. Poeg Oskar on kolmene ja käib lasteaias. Minu vanemad elavad endiselt Tartus. Nädalavahetusel sõidame tihti nende juurde. Minu isa on suur kalamees ja võtab lapsed sageli kaasa järvele. Vabal ajal mängin korvpalli ja käin lastega ujumas. Minu õde elab Tallinnas meie lähedal ja meie lapsed mängivad tihti koos. Ootan teiega tutvumist!',
        [['Kust on Mihkel pärit?', 'Tartust'], ['Kellega ta Tallinnas elab?', 'abikaasa Kertuga|naisega ja lastega'], ['Kui vana on Lotte?', 'seitse|7'], ['Miks sõidab pere nädalavahetusel tihti Tartusse?', 'seal elavad Mihkli vanemad|Mihkli vanemad elavad seal|vanemate juurde'], ['Mida teeb Mihkli isa lastega?', 'võtab nad järvele kaasa|läheb kalale']]),
      B.writing('006_t_answer', 'Vasta kolleegile.', 'Kirjuta Mihklile vastus: tutvusta oma peret. 6–8 lauset.', [6, 8], ['minu', 'meil on', 'elab', 'koos'], 3),
      B.speaking('006_t_photo', 'Fotoalbum.', 'Näita paarilisele 3 pereliikme pilti telefonist. Räägi igast 30 sekundit.', ['Kes ta sulle on?', 'Kus ta elab ja mida teeb?', 'Milline ta on?', 'Mida te koos teete?'], [90, 120], ['See on minu…', 'Ta elab…', 'Me tavaliselt…']),
      B.table('006_t_tree', 'Minu sugupuu.', 'Kirjuta oma lähedased tabelisse.', 'Kes?, Nimi, Kus elab?, Üks detail', ['ema | | |', 'isa | | |', 'õde või vend | | |', 'vanaema või vanaisa | | |', 'teine lähedane | | |']),
      B.rolecards('006_t_party', 'Sünnipäeval.', 'Sa oled sõbra sünnipäeval ja ei tunne kedagi. Rääkige 2–3 minutit.',
        'Tutvusta ennast ja oma peret. Küsi, kes on kellele kes.', 'Oled sünnipäevalapse õde. Tutvusta oma peret ja küsi külalise pere kohta.',
        ['Mina olen…', 'Kes sa sünnipäevalapsele oled?', 'Minu pere elab…'], ['Ma olen tema õde.', 'Kas sul on õdesid-vendi?', 'Kus su pere elab?']),
      B.selfcheck('006_t_self', ['Ma tutvustan peret ilma näidiseta.', 'Ma küsin teise inimese pere kohta.', 'Ma kirjutan kirja 6–8 lausega.', 'Ma reageerin sõbra uudisele.'], 'Tutvustan oma lähedasi'),
    ],
  },

  'a2b1-007': {
    title: 'Välimus ja iseloom',
    canDo: 'Ma kirjeldan inimese välimust ja iseloomu vähemalt 8 seotud lausega ning kasutan 10 teemakohast omadussõna.',
    discover: [
      B.text('007_d_intro', 'Uued kolleegid', 'Anna töötab kontoris. Sel kuul tuli tööle kolm uut inimest. Anna kirjutab sõbrannale Kristile, millised nad on. Selles tunnis õpid kirjeldama välimust ja iseloomu.'),
      B.vocab('007_d_vocab', 'Välimus ja iseloom', ['välimus — внешность', 'iseloom — характер', 'pikk — высокий', 'lühike — низкий', 'juuksed — волосы', 'prillid — очки', 'habe — борода', 'sale — стройный', 'sõbralik — дружелюбный', 'rahulik — спокойный', 'abivalmis — отзывчивый', 'tagasihoidlik — скромный', 'naljakas — весёлый', 'kannatlik — терпеливый', 'töökas — трудолюбивый', 'üsna — довольно'], '2'),
      B.reading('007_d_read', 'Loe: Anna kiri.', 'Loe kirja ja vasta küsimustele.', 'Meie uued kolleegid',
        'Tere, Kristi! Meie kontoris on kolm uut inimest. Peeter on pikk ja sale. Tal on lühikesed tumedad juuksed ja habe. Ta on üsna tagasihoidlik ja räägib vähe. Aga ta on väga töökas. Eva on keskmist kasvu. Tal on pikad heledad juuksed ja sinised silmad. Ta on väga sõbralik ja naljakas. Lõuna ajal räägib ta palju nalja. Toivo on kõige vanem, ta on viiskümmend. Tal on prillid ja hall habe. Ta on rahulik ja kannatlik. Kui mul on arvutiga probleem, aitab mind Toivo. Ta on väga abivalmis. Minu ülemus on natuke närviline, aga uued kolleegid on toredad. Reedel läheme kõik koos kohvikusse. Tule ka, siis näed neid ise! Kallistan, Anna',
        [['Milline on Peetri välimus?', 'pikk ja sale|pikk, lühikesed tumedad juuksed ja habe|pikk'], ['Milline on Peetri iseloom?', 'tagasihoidlik ja töökas|tagasihoidlik|töökas'], ['Mis värvi silmad on Eval?', 'sinised|sinised silmad'], ['Miks on lõunal Evaga lõbus?', 'ta räägib palju nalja|ta on naljakas'], ['Kes aitab Annat arvutiga?', 'Toivo'], ['Kes on uutest kolleegidest kõige vanem?', 'Toivo']]),
      B.manymatch('007_d_who', 'Kes on milline?', 'Ühenda inimene ja omadused. Mitu vastust on võimalik.', ['Peeter', 'Eva', 'Toivo', 'Anna ülemus'], ['pikk', 'tagasihoidlik', 'naljakas', 'kannatlik', 'prillidega', 'närviline', 'heledate juustega']),
      B.notice('007_d_notice', 'Märka: ta on või tal on?', ['Iseloom ja kasv: **Ta on** rahulik. **Ta on** pikk.', 'Juuksed, silmad, prillid, habe: **Tal on** habe.', 'Mitmus: Tal on **pikad heledad** juukse**d**.', 'Kui palju? **natuke** < **üsna** < **väga** naljakas', 'Vastand: pikk ↔ lühike, rahulik ↔ närviline'], 'full'),
      B.gaps('007_d_gaps', 'Tal on … juuksed.', 'Kirjuta omadussõna mitmuses.', [
        'Tal on [pikad] (pikk) juuksed.', 'Tal on [sinised] (sinine) silmad.', 'Tal on [lühikesed] (lühike) juuksed.', 'Tal on [tumedad] (tume) silmad.', 'Tal on [suured] (suur) prillid.', 'Tal on [heledad] (hele) juuksed.',
      ]),
      B.choice('007_d_choice', 'Vali õige lause.', 'Loe küsimust. Vali õige lause.', [
        ['Millised on Eva juuksed?', 'Tal on pikad heledad juuksed.', 'Ta on pikad heledad juuksed.', 'Tal on pikk hele juuksed.'],
        ['Milline on Peeter?', 'Ta on üsna tagasihoidlik.', 'Tal on üsna tagasihoidlik.', 'Ta on üsna tagasihoidlikud.'],
        ['Mis Toivol on?', 'Tal on prillid.', 'Ta on prillid.', 'Tal on prillis.'],
        ['Millised on Eva silmad?', 'Tal on sinised silmad.', 'Ta on sinised silmad.', 'Tal on sinine silmad.'],
        ['Milline on Toivo?', 'Ta on rahulik ja kannatlik.', 'Tal on rahulik ja kannatlik.', 'Ta on rahulikud ja kannatlik.'],
      ], 'full', 'g_notice'),
      B.crossword('007_d_cross', 'Milline ta on?', 'Kirjuta sobiv omadussõna.', [
        ['Ta ei ole pikk. Ta on…', 'lühike'], ['Ta ei ole närviline. Ta on…', 'rahulik'], ['Ta töötab palju. Ta on…', 'töökas'],
        ['Ta räägib palju nalja. Ta on…', 'naljakas'], ['Ta aitab kõiki. Ta on…', 'abivalmis'], ['Ta ootab rahulikult. Ta on…', 'kannatlik'],
      ]),
      B.wordorder('007_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Minu kolleegil on lühikesed tumedad juuksed.', 'Eva on väga sõbralik ja naljakas.', 'Toivo on rahulik ja kannatlik.', 'Peeter on pikk, aga tagasihoidlik.', 'Minu õel on sinised silmad.']),
      B.listening('007_d_listen', 'Kuula: Markuse kolleegid.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Markus. Ma töötan suures laos.',
        'Meie tiimis on viis inimest. Täna räägin kahest kolleegist.',
        'Esimene on Toomas. Ta on väga pikk, umbes kaks meetrit.',
        'Tal on punased juuksed ja suur habe. Ta on tugev ja töökas.',
        'Toomas räägib vähe, aga ta on väga abivalmis.',
        'Teine on Kadri. Ta on lühike ja sale. Tal on prillid.',
        'Kadri on meie tiimi juht. Ta on natuke tõsine, aga sõbralik.',
        'Pärast tööd mängime vahel koos korvpalli.',
      ], ['Toomas on umbes [kaks|2] meetrit pikk.', 'Toomasel on punased juuksed ja suur [habe].', 'Toomas räägib vähe, aga on väga [abivalmis].', 'Kadri on lühike ja [sale].', 'Kadril on [prillid].', 'Kadri on natuke [tõsine].']),
      B.errorfix('007_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Peeter on habe.', 'Peetril on habe.'], ['Tal on väga naljakas.', 'Ta on väga naljakas.'], ['Evale on sinised silmad.', 'Eval on sinised silmad.'],
        ['Tal on pikk juuksed.', 'Tal on pikad juuksed.'], ['Toivo on rahulik ja kannatlikud.', 'Toivo on rahulik ja kannatlik.'], ['Kadri on lühike juuksed.', 'Kadril on lühikesed juuksed.'],
      ]),
      B.dictation('007_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ta on pikk ja sale.', 'Tal on lühikesed juuksed.', 'Eva on väga sõbralik.', 'Toivol on prillid.', 'Peeter on natuke tagasihoidlik.']),
      B.speaking('007_d_say', 'Minu kolleeg või sõber.', 'Kirjelda üht inimest 1 minut: välimus ja iseloom.', ['Milline ta välja näeb?', 'Milline ta iseloomult on?', 'Mida ta hästi oskab?'], [45, 90], ['Ta on…', 'Tal on…', 'Ta on üsna…']),
      B.writing('007_d_write', 'Vasta Annale.', 'Kirjuta Annale 6–8 lauset oma kolleegist või sõbrast.', [6, 8], ['ta on', 'tal on', 'väga', 'aga'], 2),
      B.selfcheck('007_d_self', ['Ma tean 15 välimuse ja iseloomu sõna.', 'Ma eristan „ta on” ja „tal on”.', 'Ma ütlen: natuke, üsna, väga.', 'Ma kirjeldan inimest 6–8 lausega.'], 'Kirjeldan inimesi'),
    ],
    practice: [
      B.categorize('007_p_sort', 'Välimus või iseloom?', 'Sorteeri sõnad kahte rühma.', [
        ['Välimus', ['pikk', 'lühike', 'heledate juustega', 'prillidega', 'habemega', 'sale']], ['Iseloom', ['sõbralik', 'rahulik', 'abivalmis', 'tagasihoidlik', 'naljakas', 'kannatlik']],
      ]),
      B.match('007_p_opposites', 'Leia vastand.', 'Ühenda vastandsõnad.', [
        ['pikk', 'lühike'], ['rahulik', 'närviline'], ['avatud', 'tagasihoidlik'], ['tõsine', 'naljakas'], ['noor', 'vana'], ['laisk', 'töökas'],
      ], 'half'),
      B.gaps('007_p_onTal', 'Ta on või tal on?', 'Vali sõnapangast õige algus.', [
        '[Ta on] väga sõbralik.', '[Tal on] pikad heledad juuksed.', '[Ta on] natuke tagasihoidlik.', '[Tal on] sinised silmad.', '[Ta on] keskmist kasvu.', '[Tal on] alati hea tuju.',
      ], ['ta on', 'tal on'], 'half'),
      B.errorfix('007_p_fix', 'Paranda kirjeldus.', 'Kirjuta lause õigesti.', [
        ['Ta on pikad juuksed.', 'Tal on pikad juuksed.'], ['Tal on väga sõbralik.', 'Ta on väga sõbralik.'], ['Minu õde on lühike juuksed.', 'Minu õel on lühikesed juuksed.'], ['Ta on prillid.', 'Tal on prillid.'],
      ]),
      B.choice('007_p_degree', 'Kui tugev on omadus?', 'Vali lause, mis sobib olukorraga.', [
        ['Mari naerab alati ja räägib palju nalja.', 'Ta on väga naljakas.', 'Ta on natuke naljakas.', 'Ta ei ole naljakas.'],
        ['Jaan räägib võõrastega vähe, aga sõpradega palju.', 'Ta on natuke tagasihoidlik.', 'Ta on väga avatud.', 'Ta on väga tagasihoidlik.'],
        ['Kati aitab kõiki ja küsib, kuidas läheb.', 'Ta on väga hooliv.', 'Ta on natuke hooliv.', 'Ta ei ole hooliv.'],
        ['Peeter ootab rahulikult ka tund aega.', 'Ta on väga kannatlik.', 'Ta on natuke kannatlik.', 'Ta ei ole kannatlik.'],
      ], 'full', 'g_vocab'),
      B.dialogue('007_p_dialog', 'Kes see on?', 'Täida dialoog sobivate sõnadega.', 'Liis', 'Omar', [
        ['A', 'Kes on see mees akna juures?'], ['B', 'See on meie uus õpetaja. [Tal on] habe ja prillid.'], ['A', 'Milline ta [on]?'],
        ['B', 'Ta on [rahulik] ja kannatlik. Ta ei karju kunagi.'], ['A', 'Ja kas ta on [naljakas]?'], ['B', 'Natuke. Ta räägib vahel nalja, aga tunnis on ta tõsine.'],
      ]),
      B.speaking('007_p_guess', 'Arva ära, kes see on.', 'Kirjelda tuntud inimest. Paariline arvab, kes see on.', [
        'Milline ta välja näeb?', 'Milline ta iseloomult on?', 'Mida ta teeb?', 'Miks inimesed teda tunnevad?',
      ], [45, 90], ['Ta on…', 'Tal on…', 'Iseloomult on ta…', 'Ta on natuke / üsna / väga…']),
      B.reading('007_p_read', 'Loe: kolm sõpra.', 'Loe kirjeldusi. Vasta küsimustele.', 'Kolm sõpra, kolm iseloomu',
        'Anna, Toomas ja Kristi on sõbrad juba koolist saadik. Anna on pikk ja tal on pikad tumedad juuksed ja ümmargused prillid. Ta on väga energiline ja räägib palju. Toomas on keskmist kasvu, tal on habe ja prillid. Ta on rahulik ja tagasihoidlik, aga väga tark. Kristi on lühikest kasvu ja tal on lühikesed heledad juuksed. Ta on naljakas ja abivalmis. Kui keegi vajab abi, tuleb Kristi esimesena. Sõbrad on väga erinevad, aga neil on koos alati lõbus. Nädalavahetusel lähevad nad tihti matkama. Anna planeerib teekonna, Toomas võtab kaasa kaardi ja Kristi teeb kõigile võileibu.',
        [['Milline on Anna välimus?', 'pikk, pikad tumedad juuksed ja prillid|pikk, pikad tumedad juuksed|pikk'], ['Milline on Anna iseloom?', 'energiline|väga energiline'], ['Kes valmistab matkal kõigile süüa?', 'Kristi|Kristi teeb võileibu'], ['Mis Toomasel on?', 'habe ja prillid'], ['Miks tuleb Kristi esimesena?', 'ta on abivalmis']]),
      B.wordforms('007_p_adj', 'Omadussõna mitmuses.', 'Kirjuta mitmuse vorm (tal on … juuksed).', [
        ['pikk', 'mitmus', 'pikad'], ['lühike', 'mitmus', 'lühikesed'], ['hele', 'mitmus', 'heledad'], ['tume', 'mitmus', 'tumedad'], ['lokkis', 'mitmus', 'lokkis'], ['sinine', 'mitmus', 'sinised'],
      ]),
      B.gaps('007_p_much', 'Natuke, üsna või väga?', 'Vali sobiv sõna. Mõtle tähendusele.', [
        'Ta naerab kogu aeg. Ta on [väga] naljakas.', 'Ta räägib uute inimestega vähe. Ta on [natuke] tagasihoidlik.', 'Ta on 190 cm pikk. Ta on [väga] pikk.',
        'Ta jookseb hommikuti, aga mitte iga päev. Ta on [üsna] sportlik.', 'Ta aitab vahel, kui aega on. Ta on [üsna|natuke] abivalmis.', 'Ta jääb mõnikord hiljaks. Ta on [natuke] hajameelne.',
      ], ['natuke', 'üsna', 'väga']),
      B.transformation('007_p_but', 'Ühenda „aga”-ga.', 'Tee kahest lausest üks lause.', [
        ['Ta on tagasihoidlik. Sõpradega räägib ta palju.', 'aga', 'Ta on tagasihoidlik, aga sõpradega räägib ta palju.'], ['Ta on noor. Ta on väga tark.', 'aga', 'Ta on noor, aga väga tark.'],
        ['Tal on tõsine nägu. Ta on naljakas.', 'aga', 'Tal on tõsine nägu, aga ta on naljakas.'], ['Ta on lühike. Ta mängib korvpalli.', 'aga', 'Ta on lühike, aga mängib korvpalli.'],
      ]),
      B.wordorder('007_p_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', ['Minu õel on pikad tumedad juuksed.', 'Ta on väga sõbralik ja abivalmis.', 'Minu isa on natuke tõsine.', 'Meie õpetaja kannab alati prille.', 'Ta tundub vaikne, aga on naljakas.']),
      B.writing('007_p_write', 'Kirjelda sõpra.', 'Kirjuta 6–8 lauset: välimus, iseloom ja üks näide.', [6, 8], ['ta on', 'tal on', 'väga', 'aga', 'sest'], 3),
      B.translation('007_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['У него короткие тёмные волосы.', 'Она очень дружелюбная.', 'Мой брат немного стеснительный.', 'У неё голубые глаза.', 'Он спокойный, но весёлый.']),
      B.speaking('007_p_pic', 'Kirjelda pilti.', 'Õpetaja näitab kahe inimese pilti. Võrdle neid 1–2 minutit.', ['Milline on esimene inimene?', 'Milline on teine?', 'Mille poolest nad erinevad?', 'Kes on sulle sarnasem?'], [60, 120], ['Esimesel on…, teisel on…', 'Mõlemad on…']),
      B.selfcheck('007_p_self', ['Ma eristan ta on ja tal on.', 'Ma tean 6 vastandpaari.', 'Ma täpsustan: natuke, üsna, väga.', 'Ma kirjeldan inimest nii, et teine arvab ära.'], 'Kirjeldan täpselt'),
    ],
    transfer: [
      B.reading('007_t_ad', 'Loe kuulutust.', 'Loe kuulutus ja vasta küsimustele.', 'Otsime lapsehoidjat',
        'Meie pere otsib lapsehoidjat kahele lapsele. Emma on viieaastane ja väga energiline. Ta armastab joonistada, laulda ja palju küsida. Kaspar on kaheksa. Ta on tagasihoidlik, aga väga tark. Ta mängib malet ja loeb palju. Uute inimestega on ta alguses vaikne, aga hiljem räägib palju. Otsime rahulikku ja kannatlikku inimest. Hea, kui oskad mängida õues ja lugeda raamatuid. Sa peaksid olema ka täpne, sest lapsed lähevad kell kuus trenni. Töö on kolm päeva nädalas pärast kooli, kella kolmest seitsmeni. Kirjuta meile ja räägi endast!',
        [['Mitu tundi päevas lapsehoidja töötab?', 'neli|4|neli tundi'], ['Milline on Emma?', 'energiline|väga energiline'], ['Mida teeb Kaspar meelsasti?', 'mängib malet ja loeb|mängib malet|loeb'], ['Millist inimest pere otsib?', 'rahulikku ja kannatlikku|rahulik ja kannatlik'], ['Mitu päeva nädalas on töö?', 'kolm|3']]),
      B.planning('007_t_plan', 'Kas sobid?', 'Mõtle, miks sa sobid lapsehoidjaks.', ['Milline sa oled?', 'Mida sa oskad lastega teha?', 'Milline kogemus sul on?', 'Millal sul aega on?']),
      B.letter('007_t_letter', 'Vasta kuulutusele.', 'Kirjuta perele. Kirjelda ennast ja põhjenda, miks sobid.', 'Tere, Emma ja Kaspari pere!', 'Parimate soovidega', [60, 90]),
      B.rolecards('007_t_roles', 'Telefonikõne.', 'Rääkige 2 minutit. Seejärel vahetage rollid.',
        'Oled lapsehoidja. Ema helistab. Kirjelda ennast ja küsi laste kohta.', 'Oled laste ema. Küsi, milline lapsehoidja on ja mida ta lastega teeks.',
        ['Ma olen kannatlik, sest…', 'Mulle meeldib…', 'Milline on Kaspar?'], ['Milline te olete?', 'Mida te lastega teeksite?', 'Emma on väga energiline.']),
      B.speaking('007_t_compare', 'Võrdle ennast.', 'Kas sa sarnaned oma pereliikmega? Räägi 1 minut.', [
        'Kellega sa sarnaned välimuselt?', 'Kellega sa sarnaned iseloomult?', 'Mille poolest te erinete?',
      ], [45, 90], ['Me oleme mõlemad…', 'Tema on…, aga mina olen…', 'Välimuselt…']),
      B.manymatch('007_t_jobs', 'Milline iseloom sobib?', 'Ühenda töö ja sobivad omadused. Mitu vastust on võimalik.', ['lapsehoidja', 'müüja', 'arst', 'raamatupidaja', 'giid'], ['kannatlik', 'sõbralik', 'rahulik', 'täpne', 'avatud']),
      B.writing('007_t_wanted', 'Kirjuta kuulutus.', 'Sinu pere otsib koerale hoidjat. Kirjuta, millist inimest otsite. 5–7 lauset.', [5, 7], ['otsime', 'ta peab olema', 'sobib'], 2),
      B.speaking('007_t_famous', 'Kuulus inimene.', 'Kirjelda tuntud inimest 1 minutiga. Grupp arvab ära.', ['Milline ta välja näeb?', 'Milline ta iseloomult on?', 'Mida ta teeb?'], [60, 90], ['Tal on…', 'Ta on…', 'Ta on tuntud, sest…']),
      B.rolecards('007_t_meet', 'Kohtumine jaamas.', 'Sa pead jaamas vastu võtma inimese, keda sa ei tunne. Lepi telefonis kokku.',
        'Kirjelda ennast: välimus ja riided. Küsi, kuidas teist ära tunda.', 'Kirjelda ennast. Ütle, kus täpselt ootad.',
        ['Ma olen pikk ja mul on…', 'Mul on seljas…', 'Kuidas ma su ära tunnen?'], ['Mul on lühikesed juuksed.', 'Ma kannan prille.', 'Ootan kella all.']),
      B.selfcheck('007_t_self', ['Ma mõistan kuulutust.', 'Ma kirjeldan ennast töö jaoks.', 'Ma põhjendan, miks sobin.', 'Ma võrdlen ennast teisega.'], 'Kirjeldan ennast ja teisi'),
    ],
  },

  'a2b1-008': {
    title: 'Kelle? Kelle oma?',
    canDo: 'Ma küsin ja vastan kuuluvuse kohta ning kasutan genitiivi õigesti vähemalt 8 juhul 10-st.',
    discover: [
      B.text('008_d_intro', 'Kelle oma see on?', 'Liis on õpetaja. Reedel koristab ta õpetajate tuba. Toas on palju asju, aga kelle omad need on? Selles tunnis õpid küsima ja vastama: kelle oma?'),
      B.vocab('008_d_vocab', 'Asjad ja omanikud', ['kelle oma? — чей?', 'kuuluma — принадлежать', 'omanik — владелец', 'kolleeg — коллега', 'kruus — кружка', 'vihmavari — зонт', 'müts — шапка', 'võti — ключ', 'kott — сумка', 'rahakott — кошелёк', 'leidma — находить', 'kaotama — терять', 'unustama — забывать'], '2'),
      B.reading('008_d_read', 'Loe: õpetajate toas.', 'Loe teksti ja vasta küsimustele.', 'Kelle asjad?',
        'Reedel pärast tunde koristab Liis õpetajate tuba. Laual on viis kruusi. Sinine kruus on Peetri oma, sest sellel on tema nimi. Punane kruus on direktori oma. Aknal on must vihmavari. Liis teab, et see on Kaja oma. Kaja unustab oma vihmavarju tihti kooli. Tooli peal on väike roheline müts. See on vist mõne lapse oma. Kapi juures on suur spordikott. Liis ei tea, kelle oma see on. Ta küsib kolleeg Markolt, kas see on tema kott. Marko vastab, et see ei ole tema oma. See on spordiõpetaja oma. Lõpuks leiab Liis laua alt võtmed. Need on Liisi võtmed! Ta otsis neid terve nädala.',
        [['Kelle oma on sinine kruus?', 'Peetri oma|Peetri'], ['Kuidas Liis seda teab?', 'kruusil on Peetri nimi|sellel on tema nimi'], ['Kelle oma on must vihmavari?', 'Kaja oma|Kaja'], ['Kelle oma võib olla roheline müts?', 'mõne lapse oma|lapse oma'], ['Kelle oma on spordikott?', 'spordiõpetaja oma|spordiõpetaja'], ['Mida leidis Liis laua alt?', 'oma võtmed|võtmed|Liisi võtmed']]),
      B.choice('008_d_choice', 'Kelle? Vali vorm.', 'Vali lünka õige vorm.', [
        ['See on … kruus. (Peeter)', 'Peetri', 'Peeter', 'Peetrile'], ['See on … vihmavari. (Kaja)', 'Kaja', 'Kajale', 'Kajal'],
        ['Kas see on … kott? (sina)', 'sinu', 'sina', 'sind'], ['Need on … võtmed. (nemad)', 'nende', 'nemad', 'neil'], ['See ei ole … oma. (mina)', 'minu', 'mina', 'mul'],
      ], 'full', 'g_notice'),
      B.notice('008_d_notice', 'Märka: kelle oma?', ['**Kelle** kruus see on? — See on **Peetri** kruus.', '**Kelle oma** see on? — See on **Kaja oma**.', 'mina → **minu**, sina → **sinu**, tema → **tema**', 'meie → **meie**, teie → **teie**, nemad → **nende**', 'Raamat **kuulub** Marile. = See on **Mari** raamat.', 'Ma võtan **oma** koti. (minu enda kott)'], 'full'),
      B.wordforms('008_d_forms', 'Kelle?', 'Kirjuta sõna omastavas.', [
        ['Peeter', 'kelle kruus?', 'Peetri'], ['õpetaja', 'kelle laud?', 'õpetaja'], ['naaber', 'kelle kass?', 'naabri'], ['sõber', 'kelle jope?', 'sõbra'],
        ['kolleeg', 'kelle arvuti?', 'kolleegi'], ['laps', 'kelle müts?', 'lapse'], ['direktor', 'kelle kabinet?', 'direktori'], ['Liis', 'kelle võtmed?', 'Liisi'],
      ]),
      B.gaps('008_d_gaps', 'Minu, sinu, nende…', 'Vali sobiv sõna.', [
        'Mina olen Kaja. See on [minu] vihmavari.', 'Marko, kas see on [sinu] kott?', 'Peeter otsib [oma] kruusi.', 'Meil on uus klass. See on [meie] klass.',
        'Lapsed, kas need on [teie] mütsid?', 'Õpetajad joovad kohvi. Need on [nende] kruusid.',
      ], ['minu', 'sinu', 'oma', 'meie', 'teie', 'nende', 'mina', 'nemad']),
      B.profiles('008_d_cards', 'Kelle asjad?', 'Loe kaarte. Kirjuta lünka sobiv sõna.', [
        ['Peeter', ['matemaatikaõpetaja', 'sinine kruus', 'must jalgratas'], ['See on [Peetri] kruus.', 'Jalgratas [kuulub] Peetrile.']],
        ['Kaja', ['inglise keele õpetaja', 'must vihmavari', 'punane kott'], ['Vihmavari on [Kaja] oma.', '[Kaja] kott on punane.']],
        ['Marko', ['kunstiõpetaja', 'roheline sall', 'vanad võtmed'], ['Sall [kuulub] Markole.', 'Need on [Marko] võtmed.']],
      ]),
      B.wordorder('008_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kelle oma see punane kott on?', 'See vihmavari ei ole minu oma.', 'Need on minu naabri võtmed.', 'Kas see on sinu õe müts?', 'Raamat kuulub minu kolleegile.']),
      B.errorfix('008_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['See on Peeter kruus.', 'See on Peetri kruus.'], ['Kelle oma see on? — See on mina oma.', 'See on minu oma.'], ['See on nemad laud.', 'See on nende laud.'],
        ['Raamat kuulub Mari.', 'Raamat kuulub Marile.'], ['Ma otsin minu võtmeid.', 'Ma otsin oma võtmeid.'],
      ]),
      B.listening('008_d_listen', 'Kuula: asjad autos.', 'Õpetaja loeb häälsõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Svetlana! Siin Viktor, sinu naaber. Eile viisin oma lapselapse ja sinu lapsed randa.',
        'Täna leidsin autost palju asju. Ma ei tea, kelle omad need on.',
        'Seal on sinine rätik. Ma arvan, et see on sinu poja oma.',
        'Siis on seal väike roosa müts. See ei ole minu lapselapse oma, tema müts on valge.',
        'Tagaistmel on ka päikeseprillid. Need on vist sinu tütre omad.',
        'Ja üks pall. Pall on minu lapselapse oma, sest sellel on tema nimi.',
        'Ma panin teie asjad kotti. Kott on minu ukse ees.',
        'Tule õhtul järele, kui sul on aega. Head päeva!',
      ], ['Viktor viis lapsed eile [randa].', 'Asjad olid Viktori [autos].', 'Sinine rätik on Svetlana [poja] oma.', 'Viktori lapselapse müts on [valge].', 'Päikeseprillid on vist Svetlana [tütre] omad.', 'Kott on Viktori [ukse] ees.']),
      B.translation('008_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Чья это кружка?', 'Это не моё.', 'Это ключи моего коллеги.', 'Зонт принадлежит Кае.', 'Я ищу свою сумку.']),
      B.speaking('008_d_say', 'Pere asjad.', 'Räägi 1 minut: mis asjad on kodus kelle omad?', ['Kelle oma on auto?', 'Kelle oma on arvuti?', 'Kelle tuba on kõige suurem?'], [45, 90], ['See on minu…', 'Auto on meie pere oma.', 'Arvuti kuulub…']),
      B.writing('008_d_write', 'Sõnum kolleegile.', 'Sa leidsid asja. Kirjuta 5–6 lauset: mis, kus, kelle oma.', [5, 6], ['leidsin', 'kelle', 'oma'], 2),
      B.selfcheck('008_d_self', ['Ma küsin: kelle oma see on?', 'Ma moodustan omastava: Peetri, naabri, sõbra.', 'Ma tean minu, sinu, tema, meie, teie, nende.', 'Ma kasutan sõna „oma”.'], 'Tean, kelle oma'),
    ],
    practice: [
      B.table('008_p_table', 'Omastav vorm.', 'Kirjuta puuduv vorm.', 'nimetav, omastav (kelle?), näide', [
        'ema | [ema] | ema auto', 'õde | [õe] | õe tuba', 'vend | [venna] | venna ratas', 'sõber | [sõbra] | sõbra kass', 'laps | [lapse] | lapse mänguasi', 'õpetaja | [õpetaja] | õpetaja laud',
      ]),
      B.wordforms('008_p_pron', 'Kelle oma?', 'Kirjuta asesõna omastavas.', [
        ['mina', 'kelle?', 'minu'], ['sina', 'kelle?', 'sinu'], ['tema', 'kelle?', 'tema'], ['meie', 'kelle?', 'meie'], ['teie', 'kelle?', 'teie'], ['nemad', 'kelle?', 'nende'],
      ]),
      B.manymatch('008_p_owners', 'Kellele mis kuulub?', 'Ühenda ese ja omanik. Mõni omanik sobib mitu korda.',
        ['tööraamat', 'stetoskoop', 'mänguauto', 'võtmed', 'pall'], ['õpetaja', 'arst', 'laps', 'koristaja']),
      B.transformation('008_p_trans', 'Ütle teisiti.', 'Kirjuta lause kelle-vormiga.', [
        ['Raamat kuulub Marile.', 'See on …', 'See on Mari raamat.'], ['Jope kuulub minu vennale.', 'See on …', 'See on minu venna jope.'],
        ['Kass kuulub naabrile.', 'See on …', 'See on naabri kass.'], ['Auto kuulub meile.', 'See on …', 'See on meie auto.'],
      ]),
      B.errorfix('008_p_fix', 'Leia viga.', 'Kirjuta lause õigesti.', [
        ['See on minu vend auto.', 'See on minu venna auto.'], ['Kelle oma see kott on? — See on õde.', 'See on õe oma.'], ['Ma lähen sõber juurde.', 'Ma lähen sõbra juurde.'], ['See on nemad maja.', 'See on nende maja.'],
      ]),
      B.speaking('008_p_lost', 'Leitud asjad.', 'Õpetaja näitab asju. Küsi ja vasta paaris.', [
        'Kelle oma see on?', 'Kas see on sinu oma?', 'Kuidas sa tead?', 'Kellele me selle anname?',
      ], [45, 90], ['See on minu / sinu / tema oma.', 'See ei ole minu oma.', 'Ma arvan, et see on … oma, sest…']),
      B.reading('008_p_read', 'Loe: pärast peo lõppu.', 'Loe tekst ja leia omanikud.', 'Kelle asjad jäid maha?',
        'Laupäeval oli Sandra sünnipäev. Pidu oli tema korteris ja külalisi oli palju. Pühapäeva hommikul leidis Sandra korterist mitu asja. Esikus oli punane vihmavari. See on tema töökaaslase Kaja oma. Diivanil oli must müts. Sandra arvab, et see on venna sõbra oma. Köögilaual oli telefon, aga Sandra ei tea, kelle oma see on. Vannitoas oli kallis käekell. Selle peal oli nimi „Leo”. Leo on Sandra naabri poeg. Sandra kirjutas kõigile sõnumi ja ootas vastuseid. Kaja vastas kohe ja lubas õhtul vihmavarjule järele tulla.',
        [['Kelle oma on punane vihmavari?', 'Kaja oma|töökaaslase oma'], ['Miks arvab Sandra, et käekell on Leo oma?', 'kellal oli Leo nimi|selle peal oli nimi Leo|sellel oli nimi Leo'], ['Kelle oma on müts Sandra arvates?', 'venna sõbra oma|venna sõbra'], ['Mida Sandra ei tea?', 'kelle oma on telefon'], ['Kes on Leo?', 'naabri poeg']]),
      B.gaps('008_p_gen', 'Ava sulud.', 'Kirjuta sõna omastavas.', [
        'See on [õpetaja] (õpetaja) laud.', 'Ma lähen [sõbra] (sõber) juurde.', 'Kas see on [naabri] (naaber) kass?', 'Me ootame [venna] (vend) perekonda.', '[Lapse] (laps) mänguasjad on põrandal.', 'See on [arsti] (arst) kabinet.', 'Kus on [Mari] (Mari) kott?', '[Ema] (ema) sõbranna tuleb külla.',
      ]),
      B.choice('008_p_q', 'Õige küsimus.', 'Vali küsimus, mis sobib vastusega.', [
        ['See on Mari kott.', 'Kelle kott see on?', 'Kus kott on?', 'Mis see on?'], ['Ei, see ei ole minu oma.', 'Kas see on sinu oma?', 'Kelle oma see on?', 'Kus see on?'],
        ['See kuulub mu vennale.', 'Kellele see kuulub?', 'Kes see on?', 'Millal see on?'], ['Need on nende lapsed.', 'Kelle lapsed need on?', 'Kus lapsed on?', 'Mitu last on?'],
        ['See on õpetaja oma.', 'Kelle oma see on?', 'Kes on õpetaja?', 'Mis see on?'],
      ], 'full', 'g_use'),
      B.translation('008_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Это книга моего брата.', 'Чья это сумка?', 'Это не моё, это её.', 'Я иду к другу.', 'Это машина наших соседей.']),
      B.dialogue('008_p_dlg', 'Kelle oma?', 'Täida dialoog.', 'Õpetaja', 'Õpilane', [
        ['A', 'Kelle [vihik] see on? Laual on vihik ilma nimeta.'], ['B', 'See ei ole [minu] oma. Ma arvan, et see on Toomase oma.'], ['A', 'Toomas, kas see on [sinu] vihik?'],
        ['B', 'Ei, see on minu [õe] vihik. Ta käib ka siin koolis.'], ['A', 'Hästi, palun vii see talle.'],
      ]),
      B.writing('008_p_write', 'Minu toas.', 'Kirjuta 7–9 lauset: mis on sinu toas ja kelle omad need on.', [7, 9], ['minu', 'kelle', 'oma', 'venna', 'õe'], 3),
      B.errorfix('008_p_fix2', 'Veel vigu.', 'Kirjuta lause õigesti.', [['Ma elan minu vanemate juures.', 'Ma elan oma vanemate juures.'], ['Kelle see on raamat?', 'Kelle raamat see on?'], ['Kelle omad need võtmed on? — Need on tema.', 'Need on tema omad.'], ['Ma võtsin sõber ratta.', 'Ma võtsin sõbra ratta.']]),
      B.speaking('008_p_class', 'Klassiruumis.', 'Võta 5 asja laualt ja küsi paariliselt, kelle omad need on.', ['Kelle oma see on?', 'Kas see on sinu oma?', 'Kelle pliiats see on?'], [60, 90]),
      B.selfcheck('008_p_self', ['Ma moodustan omastava 6 sõnast.', 'Ma tean minu, sinu, tema, meie, teie, nende.', 'Ma ütlen sama mõtte teisiti.', 'Ma küsin: kelle oma see on?'], 'Kelle? — tean!'),
    ],
    transfer: [
      // Harno A2 listening 3: a short announcement, read twice, answers of 1–2 words
      B.listening('008_t_listen', 'Kuula teadet.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tähelepanu, kallid õpilased ja lapsevanemad! Kooli infolauas on palju leitud asju.',
        'Esimene on sinine müts. See on ilmselt 2.b klassi õpilase oma, sest mütsil on klassi silt.',
        'Teine on must telefon. Telefon on täiesti uus. Telefoni ekraanil on pilt väikesest pruunist koerast.',
        'Kolmas asi on suur punane vihmavari. See on õpetaja Kase oma. Ta unustas selle eile sööklasse.',
        'Neljas asi on lapse jope. Jope taskus on raamatukogu kaart nimega Emma Lepp. Emma käib esimeses klassis. Emma ema, palun tulge jopele järele.',
        'Viies asi on võtmed. Võtmete küljes on kollane pall.',
        'Kõik asjad saab kätte reedeni infolauast. Infolaud on avatud kella kaheksast kella neljani.',
        'Pärast reedet viime asjad kooli keldrisse. Kui te ei saa tulla, helistage kooli sekretärile. Ta paneb teie asja kõrvale. Aitäh!',
      ], ['Leitud on sinine [müts].', 'Telefoni ekraanil on pilt [koerast|väikesest koerast|pruunist koerast].', 'Vihmavari on õpetaja [Kase] oma.', 'Jope taskus on [raamatukogu kaart|kaart].', 'Võtmete küljes on kollane [pall].', 'Infolaud on avatud kella [neljani|16ni|4ni].', 'Pärast reedet on asjad kooli [keldris].']),
      B.choice('008_t_check', 'Kontrolli mõtet.', 'Vali õige vastus.', [
        ['„See on Kase oma.” Mis see tähendab?', 'Asi kuulub Kasele.', 'Kask leidis selle asja.', 'Kask otsib oma asja.'],
        ['Mis küsimus sobib: „See on nende maja.”?', 'Kelle maja see on?', 'Kus maja on?', 'Mis värvi maja on?'],
        ['Mis on õige?', 'Ma lähen sõbra juurde.', 'Ma lähen sõber juurde.', 'Ma lähen sõbrale juurde.'],
        ['Mis on õige?', 'See on õe tuba.', 'See on õde tuba.', 'See on õel tuba.'],
      ], 'full', 'g_use'),
      B.text('008_t_situation', 'Uus olukord', 'Sa jätsid kooli või tööle oma asja. Pead kirjutama infolauale ja seda kirjeldama.'),
      B.writing('008_t_note', 'Teade infolauale.', 'Kirjuta 5–7 lauset: mis, milline, kelle oma, kust leida.', [5, 7], ['minu', 'oma', 'see on'], 2),
      B.rolecards('008_t_roles', 'Infolaua juures.', 'Rääkige. Üks on infolaua töötaja, teine kaotas asja.',
        'Sa kaotasid koti. Kirjelda seda ja tõesta, et see on sinu oma.', 'Sa töötad infolauas. Sul on kaks sarnast kotti. Küsi täpsustavaid küsimusi.',
        ['See on minu oma.', 'Kotis on minu õe…', 'Seal on minu nimi.'], ['Milline teie kott on?', 'Mis kotis on?', 'Kelle oma see siis on?']),
      B.reading('008_t_notice', 'Loe kuulutusi.', 'Loe kolme kuulutust ja vasta.', 'Kadunud ja leitud',
        'Kadunud: väike pruun koer nimega Pontu. Pontu on minu tütre lemmikloom. Ta kadus eile õhtul pargis. Palun helistage numbril 5555 1234. Leitud: sinine jalgratas Kase tänaval. Ratas seisis kolm päeva maja ees. Kas see on teie või teie lapse oma? Ratta korv on punane ja selle peal on kleebis. Küsige majahaldurilt. Kadunud: must rahakott bussis number kaheksa. Rahakotis on minu ema pilt ja pangakaart. Leidjale väike tänu! Kirjutage meile e-posti teel. Leitud: lapse punane müts mänguväljakul. Müts on nüüd lasteaia kontoris. Kelle laps on mütsi kaotanud?',
        [['Kelle lemmikloom on Pontu?', 'kirjutaja tütre|tütre'], ['Kuidas saab rahakoti leidja omanikuga ühendust võtta?', 'e-posti teel|kirjutab e-kirja|saadab e-kirja'], ['Kus seisis sinine jalgratas?', 'Kase tänaval maja ees|maja ees'], ['Kellelt tuleb ratta kohta küsida?', 'majahaldurilt'], ['Kelle pilt on rahakotis?', 'kirjutaja ema|ema']]),
      B.writing('008_t_ad', 'Kirjuta kuulutus.', 'Sa leidsid kellegi asja. Kirjuta kuulutus 5–6 lausega.', [5, 6], ['leidsin', 'kelle', 'oma', 'helistage'], 2),
      B.speaking('008_t_mine', 'Minu lemmikasi.', 'Räägi 1 minut ühest asjast, mis on sulle kallis.', ['Mis see on?', 'Kelle oma see enne oli?', 'Miks see on sulle tähtis?'], [60, 90]),
      B.rolecards('008_t_return', 'Asja tagastamine.', 'Sa leidsid naabri ukse eest paki. Rääkige 2 minutit.',
        'Sa leidsid paki. Küsi naabrilt, kas see on tema oma.', 'Oled naaber. Pakk ei ole sinu oma, aga sa tead, kelle oma see võib olla.',
        ['Vabandage, kas see pakk on teie oma?', 'Kelle oma see siis on?'], ['Ei, see ei ole minu oma.', 'See on ilmselt…', 'Tema korter on…']),
      B.translation('008_t_tr', 'Tõlgi sõnum.', 'Kirjuta eesti keeles.', ['Я нашёл твой телефон.', 'Это ключи твоей мамы?', 'Чья это собака?', 'Это не наша машина.']),
      B.gaps('008_t_msg', 'Sõnum naabrile.', 'Täida sõnum sobivate sõnadega.', ['Tere! Ma leidsin [teie] paki trepikojast.', 'Pakil on [teie] nimi.', 'Ma panin selle [oma] ukse juurde.', 'Kui te ei ole kodus, annan selle [teie] pojale.', 'Pakk on päris raske, [sest] selles on vist raamatud.'], ['teie', 'oma', 'minu', 'nende', 'sest', 'aga']),
      B.selfcheck('008_t_self', ['Ma saan aru lühikesest teatest.', 'Ma kirjeldan oma asja.', 'Ma tõestan, et asi on minu oma.', 'Ma valin õige kelle-vormi.'], 'Asi leitud!'),
    ],
  },

  'a2b1-009': {
    title: 'Koos veedetud aeg',
    canDo: 'Ma räägin 1,5–2 minutit ühest lähedasest inimesest ja meie ühistest tegevustest ning põhjendan vähemalt kahte eelistust.',
    discover: [
      B.text('009_d_intro', 'Pühapäev on pere päev', 'Jaan on 38-aastane. Tal on Tallinnas väike kohvik. Nädala sees on tal väga vähe vaba aega. Pühapäeval on kohvik kinni. See päev on pere ja koera Muki jaoks.'),
      B.vocab('009_d_vocab', 'Ühine aeg', ['koos — вместе', 'aega veetma — проводить время', 'süüa tegema — готовить еду', 'jalutama — гулять', 'matkama — ходить в поход', 'uisutama — кататься на коньках', 'lauamäng — настольная игра', 'filmi vaatama — смотреть фильм', 'igatsema — скучать', 'tavaliselt — обычно', 'vahel — иногда', 'harva — редко', 'sest — потому что', 'ühine — общий', 'ettepanek — предложение'], '2'),
      B.reading('009_d_read', 'Loe: Jaani pühapäev.', 'Loe teksti ja vasta küsimustele.', 'Jaani pühapäev',
        'Jaanil on kohvik ja ta töötab palju. Pühapäeval on kohvik kinni. Siis veedab Jaan aega perega. Hommikul jalutab ta koos koera Mukiga pargis. Muki on väike ja väga rõõmsameelne koer. Pärast jalutuskäiku teeb Jaan pannkooke. Tavaliselt aitab teda tütar Laura. Laura on kümneaastane. Talle meeldib koos isaga süüa teha. Lõuna ajal sõidavad nad vahel Jaani ema juurde. Ema elab maal ja tal on suur aed. Talvel käib pere tihti uisutamas. Õhtul mängivad nad lauamänge. Filme vaatavad nad harva, sest Jaanile meeldib rohkem rääkida. Jaani naine Kristel ütleb: „Pühapäev on meie kõige tähtsam päev.” Jaan arvab sama. Ta igatseb pühapäeva juba esmaspäeval!',
        [['Miks on Jaanil nädala sees vähe aega?', 'ta töötab palju|ta töötab kohvikus'], ['Kellega jalutab Jaan hommikul?', 'koera Mukiga|Mukiga'], ['Mida teeb Jaan pärast jalutuskäiku?', 'pannkooke|teeb pannkooke'], ['Kes aitab Jaani köögis?', 'tütar Laura|Laura'], ['Miks vaatab pere harva filme?', 'Jaanile meeldib rohkem rääkida|Jaan räägib meelsamini'], ['Mida teeb pere talvel?', 'käib uisutamas|uisutab']]),
      B.truefalse('009_d_tf', 'Õige või vale?', 'Loe Jaani lugu uuesti.', [
        ['Jaani kohvik on pühapäeval avatud.', false], ['Muki on rõõmsameelne koer.', true], ['Laura on viieaastane.', false], ['Jaani ema elab maal.', true], ['Pere vaatab tihti filme.', false], ['Talvel käib pere uisutamas.', true],
      ]),
      B.notice('009_d_notice', 'Märka: koos, tavaliselt, sest', ['Mulle **meeldib koos** isa**ga** süüa **teha**. (meeldib + da-vorm)', 'Kellega? koos tütre**ga**, koos koera Muki**ga**', 'Me jalutame **tavaliselt** pargis. **Vahel** sõidame maale.', 'Filme vaatame **harva**, **sest** Jaanile meeldib rääkida.', 'Ettepanek: **Kas lähme** …? **Äkki** …? — **Hea mõte!** / **Kahjuks ei saa, sest** …'], 'full'),
      B.categorize('009_d_sort', 'Kui tihti?', 'Sorteeri sõnad kolme rühma.', [
        ['Tihti', ['alati', 'tavaliselt', 'sageli', 'iga päev']], ['Mõnikord', ['vahel', 'mõnikord', 'aeg-ajalt']], ['Harva või mitte', ['harva', 'peaaegu kunagi', 'mitte kunagi']],
      ]),
      B.wordforms('009_d_forms', 'Mulle meeldib…', 'Kirjuta tegusõna da-vormis.', [
        ['jalutama', 'da-vorm', 'jalutada'], ['mängima', 'da-vorm', 'mängida'], ['ujuma', 'da-vorm', 'ujuda'], ['vaatama', 'da-vorm', 'vaadata'],
        ['tegema', 'da-vorm', 'teha'], ['sõitma', 'da-vorm', 'sõita'], ['uisutama', 'da-vorm', 'uisutada'], ['matkama', 'da-vorm', 'matkata'],
      ]),
      B.dialogue('009_d_dialog', 'Ettepanek.', 'Täida dialoog sobivate sõnadega.', 'Helen', 'Jaan', [
        ['A', 'Jaan, [kas] lähme pühapäeval metsa matkama?'], ['B', 'Hea [mõte]! Võtame Muki ka kaasa.'], ['A', 'Muidugi. Kas me [sõidame] ka sinu ema juurde?'],
        ['B', 'Kahjuks mitte, [sest] ema on sel nädalal Soomes.'], ['A', 'Siis teeme õhtul [koos] süüa?'], ['B', 'Jah! Ja pärast mängime [lauamänge].'],
      ]),
      B.choice('009_d_choice', 'Mida vastata?', 'Vali sobiv vastus.', [
        ['Kas lähme laupäeval kinno?', 'Hea mõte! Mis kell?', 'Jah, ma käisin seal eile.', 'Kino on kesklinnas.'],
        ['Äkki teeme pühapäeval pannkooke?', 'Jah, mina ostan jahu.', 'Pannkoogid olid eile.', 'Ma ei tea, kus pood on.'],
        ['Kas sa tuled meiega matkama?', 'Kahjuks ei saa, sest olen tööl.', 'Ma matkasin eile kaua.', 'Mets on linnast kaugel.'],
        ['Kui tihti te perega kohtute?', 'Tavaliselt iga pühapäev.', 'Eile õhtul kell viis.', 'Meie pere on suur.'],
        ['Miks sulle meeldib vennaga aega veeta?', 'Sest temaga on lõbus.', 'Ta elab Tartus.', 'Vend on 30-aastane.'],
      ], 'full', 'g_use'),
      B.listening('009_d_listen', 'Kuula: Liisi nädalavahetus.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Liis. Ma töötan koolis õpetajana.',
        'Mul on vähe vaba aega, aga nädalavahetus on pere jaoks.',
        'Laupäeval käin tavaliselt ema juures. Ema on 70 ja elab üksi.',
        'Me joome koos kohvi ja räägime pikalt. Vahel teeme ka aiatööd.',
        'Mu õde elab Pärnus. Me näeme harva, sest tee on pikk.',
        'Aga me helistame teineteisele iga päev.',
        'Suvel läheme õega koos mere äärde. See on meie ühine traditsioon.',
        'Mulle meeldib õega aega veeta, sest temaga on alati lõbus.',
      ], ['Laupäeval käib Liis tavaliselt [ema] juures.', 'Liis ja ema joovad koos [kohvi].', 'Vahel teevad nad [aiatööd].', 'Liisi õde elab [Pärnus].', 'Õed helistavad teineteisele iga [päev].', 'Suvel lähevad õed mere [äärde].']),
      B.dictation('009_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Me veedame pühapäeva koos.', 'Tavaliselt jalutame pargis.', 'Vahel sõidame vanaema juurde.', 'Filme vaatame harva.', 'Mulle meeldib koos isaga süüa teha.', 'Õhtul mängime lauamänge.']),
      B.translation('009_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Мне нравится гулять с собакой.', 'Обычно мы обедаем вместе.', 'Иногда мы играем в настольные игры.', 'Мы редко смотрим фильмы.', 'Я скучаю по брату.', 'Давай пойдём в кино?']),
      B.speaking('009_d_say', 'Minu lähedane.', 'Räägi 1,5 minutit inimesest, kellega veedad palju aega.', ['Kes ta on?', 'Mida te tavaliselt koos teete?', 'Mida te teete vahel?', 'Miks see sulle meeldib?'], [60, 120], ['Me tavaliselt…', 'Vahel me…', 'Mulle meeldib, sest…']),
      B.writing('009_d_write', 'Minu pühapäev.', 'Kirjuta 6–8 lauset: kellega veedad pühapäeva ja miks.', [6, 8], ['koos', 'tavaliselt', 'vahel', 'sest'], 3),
      B.selfcheck('009_d_self', ['Ma nimetan 8 ühist tegevust.', 'Ma ütlen, kui tihti: tavaliselt, vahel, harva.', 'Ma põhjendan sõnaga „sest”.', 'Ma teen ettepaneku ja vastan sellele.'], 'Koos on tore'),
    ],
    practice: [
      B.diagram('009_p_map', 'mind', { title: 'Mida me koos teeme?', instruction: 'Kirjuta puuduvad tegusõnad.', center: 'Koos', nodes: 'kodus\n- [teeme] süüa\n- vaatame filmi\nõues\n- [jalutame]\n- sõidame rattaga\nreisil\n- [ujume]\n- pildistame' }),
      B.match('009_p_why', 'Tegevus ja põhjus.', 'Ühenda lause algus ja põhjus.', [
        ['Me jalutame õhtuti,', 'sest siis saame rahulikult rääkida.'], ['Me teeme koos süüa,', 'sest mõlemale meeldib proovida uusi retsepte.'],
        ['Me käime harva kinos,', 'sest piletid on kallid.'], ['Me helistame iga päev,', 'sest elame eri linnades.'],
      ], 'half', 'g_use'),
      B.gaps('009_p_freq', 'Kui tihti?', 'Vali sobiv sõna. Iga sõna üks kord.', [
        'Me sööme pühapäeviti [alati] koos lõunat.', 'Me käime [tavaliselt] laupäeval poes.', '[Vahel] läheme kinno.', 'Me reisime [harva], sest aega on vähe.', 'Me ei tülitse [peaaegu kunagi|kunagi].',
      ], ['alati', 'tavaliselt', 'vahel', 'harva', 'peaaegu kunagi', 'eile', 'kunagi'], 'half'),
      B.wordorder('009_p_order', 'Sõnajärg sagedusega.', 'Pane laused kokku.', [
        'Me käime tavaliselt laupäeval ujumas.', 'Vahel teeme vanaemaga pannkooke.', 'Mulle meeldib koos vennaga mängida.', 'Me jalutame õhtul, sest ilm on ilus.',
      ]),
      B.truefalse('009_p_text', 'Loe ja otsusta.', 'Loe lauset. Kas järeldus on õige?', [
        ['Me kohtume harva. → Me kohtume väga tihti.', false], ['Mulle meeldib temaga süüa teha. → Mul on temaga hea koos olla.', true],
        ['Me helistame iga päev. → Me suhtleme sageli.', true], ['Me ei käi kunagi koos kinos. → Me käime vahel kinos.', false],
      ], 'full'),
      B.writing('009_p_write', 'Meie nädalavahetus.', 'Kirjuta 8–10 lauset. Kasuta kahte sagedussõna ja sest.', [8, 10], ['tavaliselt', 'vahel', 'sest', 'koos'], 3),
      B.reading('009_p_read', 'Loe: meie pühapäevad.', 'Loe tekst ja vasta.', 'Pühapäev on pere päev',
        'Meie peres on pühapäev eriline päev. Hommikul magame kauem, sest nädala sees on kõigil kiire. Umbes kell kümme teeb isa pannkooke. Pärast hommikusööki läheme tavaliselt metsa jalutama. Vahel võtame kaasa ka vanaema koera. Lõuna ajal sööme koos vanaema juures, sest ta elab lähedal. Pärastlõunal mängime lauamänge või vaatame filmi. Mulle meeldivad need päevad väga, sest siis on kogu pere koos. Talvel käime ka uisutamas, aga suvel ujume järves. Õhtul helistame vanemale vennale, kes elab Saksamaal. Nii on ka tema natuke meie pühapäevas.',
        [['Miks pere pühapäeval kauem magab?', 'nädala sees on kiire|sest nädala sees on kõigil kiire'], ['Miks helistab pere õhtul vanemale vennale?', 'ta elab Saksamaal|et ka tema oleks pühapäevas|sest ta elab Saksamaal'], ['Mida pere pärast hommikusööki teeb?', 'läheb metsa jalutama|jalutab metsas'], ['Miks süüakse vanaema juures?', 'ta elab lähedal'], ['Mida pere talvel teeb?', 'käib uisutamas|uisutab']]),
      B.categorize('009_p_seasons', 'Millal mida teha?', 'Sorteeri tegevused.', [['Suvel', ['ujume', 'matkame', 'grillime']], ['Talvel', ['uisutame', 'suusatame', 'teeme lumememme']], ['Iga kord', ['räägime', 'sööme koos', 'naerame']]]),
      B.transformation('009_p_because', 'Lisa põhjus.', 'Ühenda laused sõnaga „sest”.', [
        ['Me kohtume harva. Me elame eri linnades.', 'sest', 'Me kohtume harva, sest elame eri linnades.'], ['Mulle meeldib matkata. Looduses on rahulik.', 'sest', 'Mulle meeldib matkata, sest looduses on rahulik.'],
        ['Me helistame iga päev. Me igatseme teineteist.', 'sest', 'Me helistame iga päev, sest igatseme teineteist.'], ['Me ei lähe täna välja. Ilm on halb.', 'sest', 'Me ei lähe täna välja, sest ilm on halb.'],
      ]),
      B.translation('009_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Мы обычно встречаемся в субботу.', 'Иногда мы ходим в кино.', 'Мне нравится готовить с мамой.', 'Мы редко путешествуем, потому что мало времени.', 'Нам вместе всегда весело.']),
      B.speaking('009_p_habits', 'Pere harjumused.', 'Küsi paariliselt 5 küsimust tema pere harjumuste kohta.', ['Mida teete pühapäeval?', 'Kui tihti kohtute?', 'Mis teile koos meeldib?', 'Mida teete harva?'], [90, 120]),
      B.dictation('009_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Me kohtume tavaliselt laupäeval.', 'Vahel läheme koos kinno.', 'Mulle meeldib vennaga süüa teha.', 'Me jalutame, sest ilm on ilus.', 'Pühapäeval sööme vanaema juures.']),
      B.wordorder('009_p_order2', 'Veel lauseid.', 'Pane laused kokku.', ['Me reisime harva, sest aega on vähe.', 'Talvel käime perega suusatamas.', 'Õhtul mängime vahel lauamänge.', 'Pühapäeval sööme alati koos lõunat.', 'Suvel käime sageli vanaema juures.']),
      B.gaps('009_p_fill', 'Täida tekst.', 'Vali sobiv sõna.', ['Me [veedame] palju aega koos.', 'Pühapäeval [sööme] vanaema juures lõunat.', 'Pärast lõunat [jalutame] pargis.', 'Õhtul [mängime] lauamänge.', 'Mulle meeldib see päev, [sest] kõik on koos.'], ['veedame', 'sööme', 'jalutame', 'mängime', 'sest', 'käime', 'aga']),
      B.selfcheck('009_p_self', ['Ma nimetan 6 ühist tegevust.', 'Ma ütlen, kui tihti me midagi teeme.', 'Ma põhjendan sest-lausega.', 'Ma kirjutan seotud teksti.'], 'Meil on koos tore'),
    ],
    transfer: [
      B.dialogue('009_t_chat', 'Sõnumid nädalavahetuseks.', 'Loe sõnumeid ja täida lüngad.', 'Kadri', 'Mart', [
        ['A', 'Kas sul on [laupäeval] aega?'], ['B', 'Hommikul mitte, sest mul on trenn. [Aga] pärastlõunal olen vaba.'], ['A', 'Äkki [läheme|lähme] koos randa jalutama?'],
        ['B', 'Hea mõte! [Kohtume] kell neli bussipeatuses?'], ['A', 'Sobib! Võtan kaasa termose.'],
      ]),
      B.planning('009_t_plan', 'Planeeri päev.', 'Vali lähedane inimene ja planeeri ühine laupäev.', ['Kellega?', 'Mida te teete?', 'Mis kell ja kus kohtute?', 'Miks just see tegevus?']),
      B.rolecards('009_t_roles', 'Lepi kokku.', 'Tehke kokkulepe. Esimene aeg ei sobi.',
        'Tee ettepanek ühiseks tegevuseks. Kui aeg ei sobi, paku uus aeg.', 'Sul on plaan juba olemas. Keeldu viisakalt ja paku muu tegevus.',
        ['Kas lähme…?', 'Äkki…?', 'Kas … sobib?'], ['Kahjuks ma ei saa, sest…', 'Aga kas…?', 'Sobib!']),
      B.speaking('009_t_story', 'Räägi tähtsast inimesest.', 'Räägi 1,5–2 minutit ilma tekstita.', [
        'Kes see inimene on?', 'Mida te tavaliselt koos teete?', 'Mida te teete vahel?', 'Miks see sulle meeldib?', 'Mida tahaksite koos veel teha?',
      ], [90, 120], ['Me tavaliselt…', 'Vahel me…', 'Mulle meeldib, sest…', 'Tahaksime kunagi…']),
      B.writing('009_t_post', 'Postitus.', 'Kirjuta postitus fotole: kellega, kus, miks see oli tore. 7–8 lauset.', [7, 8], ['koos', 'sest', 'mulle meeldis'], 2),
      B.manymatch('009_t_who', 'Kellega mida teha?', 'Kellega sa teeksid mida? Mitu vastust on võimalik.', ['kinno minna', 'matkata', 'süüa teha', 'reisida', 'lauamänge mängida'], ['vanematega', 'sõpradega', 'õe või vennaga', 'üksi']),
      B.reading('009_t_poll', 'Loe küsitlust.', 'Loe küsitluse tulemusi ja vasta.', 'Kuidas eestlased koos aega veedavad?',
        'Küsitlus tehti selle aasta märtsis. Ajakiri küsis tuhandelt inimeselt, kuidas nad pere ja sõpradega aega veedavad. Kõige populaarsem tegevus on koos söömine. Nädalavahetusel teeb seda kaheksa inimest kümnest. Teisel kohal on jalutamine looduses. Kolmandal kohal on külaskäigud sugulaste juurde. Noored eelistavad kino ja kontserte. Vanemad inimesed eelistavad aiatööd ja külaskäike. Lastega pered käivad tihti ujumas ja mänguväljakul. Pooled vastajad ütlesid, et nad tahaksid perega rohkem aega veeta. Suurim takistus on töö: paljud töötavad ka laupäeval. Teine takistus on pikk tee, sest sugulased elavad sageli teises linnas. Ainult iga kümnes inimene veedab vaba aega peamiselt üksi. Kõige vähem aega veedavad perega noored mehed. Paljud ütlesid, et telefon segab koos olemist. Seetõttu on mõnes peres söögilaual telefonid keelatud. Ajakirja arvates on koos veedetud aeg tervisele sama tähtis kui sport.',
        [['Mitmelt inimeselt küsiti?', 'tuhandelt|1000'], ['Mis on teisel kohal?', 'jalutamine looduses|jalutamine'], ['Mis on teine takistus?', 'pikk tee|sugulased elavad teises linnas'], ['Mitu vastajat veedab vaba aega peamiselt üksi?', 'sada|100|iga kümnes']]),
      // Harno A2 reading 4: a ~150-word text with 3-option questions
      B.choice('009_t_pollmc', 'Vali õige vastus.', 'Loe küsitlust uuesti. Vali igale küsimusele üks vastus.', [
        ['Mida teeb nädalavahetusel kaheksa inimest kümnest?', 'sööb koos perega või sõpradega', 'jalutab looduses', 'käib kinos ja kontserdil'],
        ['Mida eelistavad vanemad inimesed?', 'aiatööd ja külaskäike', 'kino ja kontserte', 'ujumist ja mänguväljakut'],
        ['Miks ei saa paljud perega rohkem aega veeta?', 'nad töötavad ka laupäeval', 'nad ei taha perega olla', 'nad käivad palju trennis'],
        ['Miks on mõnes peres söögilaual telefonid keelatud?', 'telefon segab koos olemist', 'telefonid on väga kallid', 'lapsed on veel väikesed'],
        ['Mida arvab ajakiri?', 'koos olemine on tervisele tähtis', 'sport on tähtsam kui pere', 'üksi olla on kõige parem'],
      ]),
      B.writing('009_t_opinion', 'Sinu arvamus.', 'Kas sina veedad perega piisavalt aega? Kirjuta 6–8 lauset ja põhjenda.', [6, 8], ['sest', 'tavaliselt', 'vahel', 'tahaksin'], 3),
      B.translation('009_t_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Давай встретимся в субботу?', 'К сожалению, в субботу я не могу.', 'А как насчёт воскресенья?', 'Договорились, встретимся в пять.']),
      B.speaking('009_t_plan2', 'Esitle plaani.', 'Tutvusta grupile oma ühise laupäeva plaani 1–2 minutit.', ['Kellega?', 'Mida teete?', 'Miks just see?'], [60, 120]),
      B.selfcheck('009_t_self', ['Ma mõistan sõnumivestlust.', 'Ma planeerin ühise päeva.', 'Ma lepin kokku uue aja.', 'Ma räägin 1,5 minutit ja põhjendan.'], 'Lepin kokku ja põhjendan'),
    ],
  },

  // Kontroll 2 in the Harno A2 exam format: Harjuta = reading (tasks 1–5) and listening, Kasuta = writing (tasks 1–2)
  // and speaking (picture, idea card), on the module's topic family and relations
  'a2b1-010': {
    title: 'Kontroll 2 — pere ja suhted',
    canDo: 'Ma saan pere ja suhete teemalisest tekstist aru ning kasutan kirjeldusi ja kuuluvuse vorme iseseisvalt.',
    discover: [
      B.text('010_d_intro', 'Kordame moodulit', 'Järgmises tunnis on kontroll. Täna kordad mooduli 2 teemasid: pere, välimus ja iseloom, kelle oma ja ühine aeg. Loe, kuula, räägi ja kirjuta.'),
      B.vocab('010_d_vocab', 'Kordamise sõnad', ['silm — глаз', 'rõõmsameelne — жизнерадостный', 'hooliv — заботливый', 'vaikne — тихий', 'korralik — аккуратный', 'osav — умелый', 'tõsine — серьёзный', 'põlvkond — поколение', 'kaugel — далеко', 'tähtis — важный', 'sarnane — похожий', 'erinev — разный'], '2'),
      B.reading('010_d_read', 'Loe: suur pere.', 'Loe teksti ja vasta küsimustele.', 'Kolm põlvkonda ühes majas',
        'Viktor on 63-aastane ja elab Tallinnas suures majas. Majas elab kolm põlvkonda. Esimesel korrusel elavad Viktor ja tema naine Galina. Teisel korrusel elab nende poeg Marko koos perega. Marko naine on Kersti ja neil on kaks last. Viktor on vaikne, aga väga osav. Ta parandab kõike, mis on katki. Galina on rõõmsameelne ja hooliv. Ta teeb pühapäeval kogu perele lõunat. Marko on Viktoriga väga sarnane. Tal on samuti sinised silmad ja ta on vaikne. Lapsed on aga väga erinevad. Poeg Rasmus on tõsine ja korralik. Tütar Lena on naljakas ja räägib palju. Vahel on majas lärmakas, aga keegi ei ole üksi. Viktori tütar elab Saksamaal. Ta elab kaugel, aga helistab iga nädal. Viktor ütleb: „Pere on mulle kõige tähtsam.”',
        [['Mitu põlvkonda majas elab?', 'kolm|3'], ['Kes elab teisel korrusel?', 'Marko pere|Marko koos perega|poeg Marko'], ['Mida Viktor hästi oskab?', 'parandada|ta parandab kõike'], ['Kellega on Marko sarnane?', 'Viktoriga|isaga'], ['Milline on Rasmus?', 'tõsine ja korralik'], ['Kus elab Viktori tütar?', 'Saksamaal']]),
      B.match('010_d_match', 'Kes on milline?', 'Ühenda inimene ja kirjeldus.', [
        ['Viktor', 'vaikne, aga osav'], ['Galina', 'rõõmsameelne ja hooliv'], ['Marko', 'isaga sarnane'], ['Rasmus', 'tõsine ja korralik'], ['Lena', 'naljakas ja jutukas'], ['Viktori tütar', 'elab kaugel'],
      ], 'full', 'g_read'),
      B.notice('010_d_notice', 'Mooduli 2 mustrid', ['Kelle? ema → **ema**, vend → **venna**, õde → **õe**, poeg → **poja**', '**Ta on** rõõmsameelne. **Tal on** sinised silmad.', 'Kes ta sulle on? — Ta on minu **isa õde**.', 'Kelle oma? — See on **minu** / **nende** oma.', 'Me kohtume **harva**, **sest** elame kaugel.'], 'full'),
      B.table('010_d_table', 'Omastav.', 'Kirjuta puuduv vorm.', 'nimetav, omastav (kelle?), näide', [
        'vend | [venna] | venna auto', 'õde | [õe] | õe tuba', 'poeg | [poja] | poja kool', 'tütar | [tütre] | tütre sünnipäev', 'naaber | [naabri] | naabri koer', 'nemad | [nende] | nende maja',
      ], 'g_notice'),
      B.gaps('010_d_gaps', 'Täida lüngad.', 'Loe teksti uuesti. Kirjuta sobiv sõna.', [
        'Marko on Viktori ja Galina [poeg].', 'Rasmus ja Lena on Viktori [lapselapsed].', 'Markol [on] sinised silmad.', 'Galina teeb lõunat, [sest] pere on talle tähtis.', 'Viktori tütar elab [kaugel], Saksamaal.', 'Marko on isaga väga [sarnane].',
      ], ['poeg', 'lapselapsed', 'on', 'sest', 'kaugel', 'sarnane', 'erinev', 'aga']),
      B.errorfix('010_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Minu vend naine on arst.', 'Minu venna naine on arst.'], ['Minu tädi on pikad heledad juuksed.', 'Minu tädil on pikad heledad juuksed.'], ['See on meie naaber koer.', 'See on meie naabri koer.'],
        ['Me kohtume harva, sest me elame kaugele.', 'Me kohtume harva, sest me elame kaugel.'], ['Tal on väga hooliv.', 'Ta on väga hooliv.'],
      ]),
      B.wordorder('010_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Minu venna tütar on väga rõõmsameelne.', 'Me kohtume harva, sest elame kaugel.', 'Vanaisal on sinised silmad.', 'Kelle oma see punane auto on?', 'Pühapäeval sööme tavaliselt koos.']),
      B.listening('010_d_listen', 'Kuula: parim sõbranna.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Anna. Täna räägin oma parimast sõbrannast.',
        'Tema nimi on Kristi. Me tunneme teineteist juba koolist.',
        'Kristi on lühike ja tal on lokkis punased juuksed.',
        'Ta on väga rõõmsameelne, aga natuke hajameelne.',
        'Kristi elab nüüd Tartus ja mina Tallinnas. Me kohtume harva.',
        'Aga me helistame tavaliselt kaks korda nädalas.',
        'Suvel läheme koos matkama, sest mõlemale meeldib loodus.',
        'Kristi on mulle nagu õde.',
      ], ['Anna ja Kristi tunnevad teineteist [koolist].', 'Kristil on lokkis punased [juuksed].', 'Kristi on rõõmsameelne, aga natuke [hajameelne].', 'Kristi elab praegu [Tartus].', 'Sõbrannad helistavad [kaks|2] korda nädalas.', 'Suvel lähevad nad koos [matkama].']),
      B.dictation('010_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Majas elab kolm põlvkonda.', 'Vanaema on rõõmsameelne ja hooliv.', 'Tal on sinised silmad.', 'See on minu venna auto.', 'Me kohtume harva, sest elame kaugel.']),
      B.translation('010_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Это дом моих родителей.', 'У неё голубые глаза.', 'Мой дедушка тихий, но умелый.', 'Мы обычно встречаемся в воскресенье.', 'Семья для меня очень важна.']),
      B.speaking('010_d_say', 'Pere pilt.', 'Kirjelda oma pere või sõprade fotot 1 minut.', ['Kes on pildil?', 'Kes ta sulle on?', 'Milline ta on?', 'Mida te koos teete?'], [60, 90], ['Pildil on minu…', 'Ta on…', 'Tal on…']),
      B.writing('010_d_write', 'Kiri sõbrale.', 'Kirjuta 6–8 lauset ühest pereliikmest: kes, milline, mida koos teete.', [6, 8], ['ta on', 'tal on', 'koos', 'sest'], 3),
      B.selfcheck('010_d_self', ['Ma tutvustan oma peret.', 'Ma kirjeldan välimust ja iseloomu.', 'Ma kasutan kelle-vormi õigesti.', 'Ma räägin ühisest ajast ja põhjendan.'], 'Valmis kontrolliks'),
    ],
    practice: [
      B.tip('010_p_how', 'Lugemine ja kuulamine (eksami vormis)', 'See leht on nagu Harno A2 eksam: viis lugemisülesannet ja kaks kuulamisülesannet. Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda.', 'full'),
      // reading 1: everyday phrases and politeness
      B.choice('010_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sõbra vanaema sai 90-aastaseks. Mida sa ütled?', 'Palju õnne talle!', 'Head paranemist talle!', 'Jõudu tööle!'],
        ['Sa tutvustad oma ema naabrile. Mida sa ütled?', 'Saage tuttavaks, see on minu ema.', 'Vabandust, kas te nägite mu ema?', 'Tere tulemast koju, ema!'],
        ['Naaber aitas sul kapi tuppa tuua. Mida sa ütled?', 'Suur aitäh teile abi eest!', 'Pole midagi, aitan hea meelega.', 'Palun väga, tulge jälle!'],
        ['Sõber ütleb: „Mu isa on haiglas.” Mida sa ütled?', 'Kahju küll! Head paranemist talle!', 'Tore, palju õnne talle!', 'Head reisi talle ja sulle!'],
        ['Sa lahkud sõbra sünnipäevalt. Mida sa ütled?', 'Aitäh, oli väga tore õhtu!', 'Tere tulemast meie juurde!', 'Head isu ja jätku leivale!'],
        ['Telefonis küsitakse Martinit, aga ta pole kodus. Mida sa ütled?', 'Teda pole praegu kodus. Kas ütlen talle midagi?', 'Jah, mina olen Martin, kuulan teid.', 'Vabandust, te valisite vale numbri.'],
      ]),
      // reading 2: three short texts (ads), answers by letter or in 1–2 words
      B.reading('010_p_three', 'Lugemine 2. Kolm kuulutust.', 'Loe kolme kuulutust. Vasta kuulutuse tähega (A, B, C) või lühidalt.', 'Pere ja vaba aeg',
        'A. Perekohvik „Pesa”. Ootame emasid ja isasid koos väikeste lastega. Lastele on mängutuba ja raamatud. Vanemad saavad rahulikult kohvi juua ja teiste vanematega rääkida. Avatud tööpäeviti kella kümnest kella kaheni. Nädalavahetusel on kohvik suletud.\n\nB. Vanavanemate klubi. Kohtume igal kolmapäeval kell viis raamatukogu saalis. Räägime, laulame ja teeme käsitööd. Kord kuus käime koos teatris või muuseumis. Uued liikmed on väga oodatud. Klubi on tasuta.\n\nC. Laste sünnipäevad meie mängumajas! Pidu kestab kaks tundi. Meie töötaja mängib lastega ja teeb näomaalinguid. Tordi ja joogid võite tuua ise. Pidu saab tellida ka nädalavahetusel. Ühe lapse hind on kümme eurot.',
        [['Kuhu saab minna laupäeval lapse sünnipäeva pidama?', 'C|mängumajja'], ['Kus saab vanaema teiste inimestega laulda?', 'B|klubis|vanavanemate klubis'], ['Kuhu saab minna väikese lapsega kohvi jooma?', 'A|perekohvikusse|Pesasse'], ['Kas klubis peab maksma?', 'ei|ei, klubi on tasuta'], ['Millal on perekohvik suletud?', 'nädalavahetusel|laupäeval ja pühapäeval']]),
      // reading 3: short notices matched to what they mean
      B.match('010_p_notices', 'Lugemine 3. Mida kuulutus tähendab?', 'Ühenda kuulutus ja selle tähendus.', [
        ['Beebikool teisipäeviti kell 10', 'Siia saab minna koos väikese lapsega.'], ['Vanavanemate päev: lapselapsed tasuta muuseumisse', 'Lapselaps saab koos vanaemaga tasuta sisse.'],
        ['Otsin lapsehoidjat kaheks õhtuks nädalas', 'Pere vajab kedagi, kes hoiab lapsi.'], ['Pulmasaal üürile, 80 kohta', 'Siin saab pidada suurt pidu.'],
        ['Leitud: väike pruun koer Kase tänaval', 'Keegi on leidnud looma.'], ['Kolin ära! Annan tasuta lastevoodi', 'Siit saab ilma rahata mööblit.'],
      ], 'full', 'g_read'),
      // reading 4: a ~150-word text with 3-option questions
      B.reading('010_p_read', 'Lugemine 4. Vanaema sünnipäev.', 'Loe tekst. Vasta lühidalt.', 'Kaheksakümmend aastat',
        'Eelmisel laupäeval tähistas Liisa pere vanaema kaheksakümnendat sünnipäeva. Pidu oli vanaema juures maal, sest vanaema ei taha linnas pidu pidada. Pidu algas kell kaks päeval. Kokku tuli kakskümmend kaks külalist. Kõige kaugemalt tuli onu Peeter, kes elab Rootsis. Ta sõitis laevaga ja jõudis alles õhtul. Liisa ema tegi suure tordi ja isa grillis õues liha. Liisa vend Robin on vaikne, aga sel päeval mängis ta kitarri ja laulis. Vanaema oli väga rõõmus ja natuke nuttis ka. Kõige rohkem meeldis talle kingitus lapselastelt. Nad tegid albumi vanadest perepiltidest. Liisa ja Robin tegid seda terve kuu. Igal pildil oli lühike lugu. Õhtul istusid kõik koos aias ja vaatasid albumit. Vanaema rääkis, kes kellele on ja kus keegi elab. Lapsed said teada palju uut. Nüüd on album vanaema elutoas riiulil. Järgmisel aastal tahab pere jälle kokku tulla, aga siis Rootsis.',
        [['Kus pidu oli?', 'vanaema juures maal|maal|vanaema juures'], ['Mitu külalist tuli?', 'kakskümmend kaks|22'], ['Mida tegi Liisa isa?', 'grillis liha|grillis õues liha']]),
      B.choice('010_p_readmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali igale küsimusele üks vastus.', [
        ['Miks oli pidu maal?', 'Vanaema ei taha linnas pidu pidada.', 'Linnas ei olnud vaba saali.', 'Külalisi oli linna jaoks liiga palju.'],
        ['Kuidas onu Peeter peole tuli?', 'laevaga Rootsist', 'autoga Tallinnast', 'rongiga Tartust'],
        ['Mis oli Robini juures sel päeval eriline?', 'Vaikne Robin mängis ja laulis.', 'Robin tegi ise suure tordi.', 'Robin tuli peole Rootsist.'],
        ['Mis meeldis vanaemale kõige rohkem?', 'lapselaste tehtud album', 'Liisa ema tehtud tort', 'onu Peetri kingitus'],
        ['Mida plaanib pere järgmiseks aastaks?', 'kohtuda jälle, aga Rootsis', 'teha veel ühe albumi', 'pidada pidu linnas'],
      ]),
      // reading 5: a personal letter with 8 option gaps
      B.cloze('010_p_cloze', 'Lugemine 5. Kiri sõbrannalt.', 'Vali igasse lünka sobiv sõna.', 'Tere, Kati!', [
        'Aitäh {*sinu|sina|sind} kirja eest! Meil läheb hästi ja mul on sulle palju uudiseid. Minu {*venna|vend|vennale} pere kolis eelmisel kuul meie lähedale. Nüüd näen ma tema lapsi {*tihti|tihe|tiheda}.',
        '',
        'Vanem tüdruk Emma on viieaastane. {*Tal on|Ta on|Teda on} pikad heledad juuksed ja ta naerab palju. Väike Oskar on alles kaks ja käib juba lasteaias. Ta on natuke {*tagasihoidlik|tagasihoidlikud|tagasihoidlikku}, aga minuga mängib ta hea meelega.',
        '',
        'Pühapäeviti sööme kõik koos {*vanaema|vanaemal|vanaemale} juures. Ma armastan neid päevi, {*sest|aga|või} siis on terve pere koos. Kas sa tuled suvel meile külla? Siis saad {*minu|mina|mind} perega tuttavaks!',
        '',
        'Kallistan, Anu',
      ]),
      // listening 3 of the A2 exam: a monologue, read twice, answers of 1–2 words
      B.listening('010_p_listen', 'Kuulamine 1. Häälsõnum.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Kati! Siin räägib sinu nõbu Marko. Helistan sugulaste kokkutuleku pärast.',
        'Kokkutulek on sel aastal juuli teisel laupäeval. Me kohtume vanaisa talus Viljandi lähedal. Algus on kell kaksteist.',
        'Kõigepealt sööme koos lõunat. Pärast lõunat on lastele mängud ja täiskasvanutele jalutuskäik järve äärde. Õhtul teeme lõkke ja laulame.',
        'Kõik peavad kaasa võtma ühe toidu. Minu ema teeb kartulisalatit, meie toome kooki. Palun võta sina kaasa leiba või puuvilju.',
        'Ööbida saab talus, aga voodeid on vähe. Seepärast võta kaasa magamiskott. Kui sul on koer, võta ta ka kaasa. Talus on suur aed.',
        'Kokku tuleb umbes nelikümmend inimest. Tulevad ka sugulased Soomest ja Saksamaalt.',
        'Autoga saab parkida talu ees. Kui sa tuled bussiga, tulen sulle peatusse vastu. Palun anna mulle nädala lõpuks teada, mitu inimest teie perest tuleb. Kohtumiseni!',
      ], ['Kokkutulek on juuli teisel [laupäeval].', 'Kohtutakse vanaisa [talus].', 'Algus on kell [kaksteist|12].', 'Õhtul teevad kõik [lõkke].', 'Kati peab kaasa võtma leiba või [puuvilju].', 'Ööbimiseks on vaja [magamiskotti|magamiskott].', 'Kokku tuleb umbes [nelikümmend|40] inimest.']),
      // a conversation (A2 listening 2 and 4), answers of 1–2 words
      B.listening('010_p_listen2', 'Kuulamine 2. Pulmapildid.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Mari! Kas need on sinu pulmapildid?', '— Jah, vaata. See pikk mees prillidega on minu isa.',
        '— Ja kes on see naine punases kleidis?', '— See on minu tädi Ülle, ema õde. Ta elab Pärnus. Ta on kõige naljakam inimene meie peres.',
        '— Kes on see väike poiss koeraga?', '— See on minu õepoeg Rasmus. Ta on kuueaastane. Koer on tema oma, selle nimi on Pontu.',
        '— Ja see vanem naine, kes istub?', '— See on minu vanaema. Ta on juba üheksakümmend aastat vana, aga väga tubli.',
        '— Kus pidu oli?', '— Mere ääres, ühes vanas mõisas. Külalisi oli sada.',
        '— Sada! Kas sa tundsid kõiki?', '— Ei, pooled olid mehe sugulased. Neid ma veel hästi ei tunne.',
        '— Kas te käisite ka reisil?', '— Jah, me sõitsime pärast pulmi nädalaks Itaaliasse.',
      ], ['Mari isa kannab [prille].', 'Tädi Ülle on Mari [ema] õde.', 'Tädi Ülle elab [Pärnus].', 'Rasmus on Mari [õepoeg].', 'Mari vanaema on [üheksakümmend|90] aastat vana.', 'Pärast pulmi sõitsid nad [Itaaliasse].']),
      B.wordforms('010_p_forms', 'Keeleosa. Kaheksa vormi.', 'Kirjuta sõna omastavas.', [
        ['sõber', 'kelle?', 'sõbra'], ['naaber', 'kelle?', 'naabri'], ['õde', 'kelle?', 'õe'], ['laps', 'kelle?', 'lapse'], ['nemad', 'kelle?', 'nende'], ['tütar', 'kelle?', 'tütre'], ['poeg', 'kelle?', 'poja'], ['meie', 'kelle?', 'meie'],
      ]),
      B.errorfix('010_p_fix', 'Keeleosa. Paranda neli viga.', 'Kirjuta laused õigesti.', [
        ['Ta on sinised silmad.', 'Tal on sinised silmad.'], ['See on nemad koer.', 'See on nende koer.'], ['Ma räägin oma õde.', 'Ma räägin oma õega.'], ['Me läheme pühapäeval vanaema juures.', 'Me läheme pühapäeval vanaema juurde.'],
      ]),
      B.transformation('010_p_trans', 'Keeleosa. Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Raamat kuulub õele.', 'See on …', 'See on õe raamat.'], ['Mul on vend. Ta on arst.', 'Minu …', 'Minu vend on arst.'], ['Ta räägib palju nalja.', 'naljakas', 'Ta on naljakas.'], ['Me kohtume iga nädal.', 'tihti', 'Me kohtume tihti.'],
      ]),
      B.speaking('010_p_retell', 'Räägi kuuldust.', 'Räägi paarilisele, kes on Mari pulmapiltidel.', ['Kes on pildil?', 'Kes ta Marile on?', 'Milline ta on?'], [45, 75], ['See on Mari…', 'Ta on…', 'Tal on…']),
      B.selfcheck('010_p_self', ['Lugemine: valin olukorda sobiva viisaka lause.', 'Lugemine: leian kuulutusest ja tekstist vajaliku info.', 'Lugemine: valin kirja lünka õige vormi.', 'Kuulamine: kirjutan vastuse 1–2 sõnaga.'], 'Lugemine ja kuulamine tehtud'),
    ],
    transfer: [
      B.text('010_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'See leht on nagu Harno A2 eksami kirjutamise ja rääkimise osa. Kirjuta ilma sõnaraamatuta. Rääkimine on paaris, nagu eksamil.'),
      B.notice('010_t_card', 'Visiitkaart', ['Kristi Kask — lapsehoidja', '8 aastat kogemust, räägib eesti ja vene keelt', 'Töötab Tartus, Annelinnas', 'Aeg: tööpäeviti 15–20, laupäeval kokkuleppel', 'Telefon: 5512 3456'], 'full', 'g_read'),
      // writing 1: information transfer (who, where, when, contact), at least 25 words
      B.letter('010_t_info', 'Kirjutamine 1. Soovita lapsehoidjat.', 'Kirjuta sõbrale visiitkaardi põhjal: kes, kus, millal, kuidas ühendust võtta.', 'Tere, Liina! Sa otsid lapsehoidjat.', 'Edu otsimisel!', [25, 40]),
      B.planning('010_t_plan', 'Enne kutset.', 'Mõtle läbi ja kirjuta märksõnad.', ['Mis pidu see on?', 'Millal ja kus?', 'Kes tulevad?', 'Mida kaasa võtta?']),
      // writing 2: a message or invitation, at least 30 words
      B.letter('010_t_letter', 'Kirjutamine 2. Kutse peole.', 'Kutsu sõber oma pere peole: mis pidu, millal, kus, mida kaasa võtta.', 'Tere!', 'Ootan sind!', [30, 50]),
      B.writing('010_t_week', 'Kirjutamine 2 (teine valik). Nädalavahetus perega.', 'Kirjuta 4–6 lauset: kellega olid, mida tegite, mis meeldis.', [4, 6], ['koos', 'sest', 'meeldis'], 2),
      B.table('010_t_form', 'Täida ankeet.', 'Sa registreerid pere spordipäevale. Kirjuta andmed.', 'Andmed, Sinu vastus', ['Ees- ja perekonnanimi | ', 'Telefon | ', 'Mitu inimest tuleb? | ', 'Kes nad sulle on? | ', 'Laste vanus | ']),
      B.rubric('010_t_rubric', 'Kontrolli kirjutamist.', 'Märgi, mis on olemas.', ['Kirjutamine 1: kes, kus, millal, kontakt — vähemalt 25 sõna.', 'Kirjutamine 2: pidu, aeg ja koht, mida kaasa võtta — 30–50 sõna.', 'Laused on seotud: ja, aga, sest.', 'Kelle-vormid ja ta on / tal on on õiged.', 'Rääkimises vastasin igale küsimusele kahe lausega.']),
      // speaking: getting to know, picture description (task 1), idea cards (task 2)
      B.speaking('010_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele, nagu eksami alguses.', ['Mis su nimi on?', 'Kus sa elad?', 'Kellega sa elad?', 'Mida sa vabal ajal teed?'], [45, 60]),
      B.speaking('010_t_mono', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab kummalegi erineva perepildi. Kirjelda oma pilti 1 minut.', ['Kes on pildil?', 'Milline keegi välja näeb?', 'Mida nad teevad?', 'Kus nad on?'], [60, 90], ['Pildil on…', 'Vasakul / paremal on…', 'Tal on…', 'Nad…']),
      B.speaking('010_t_compare', 'Rääkimine 1. Võrdle pilte.', 'Võrdle oma pilti paarilise pildiga. Vasta õpetaja küsimustele.', ['Mis on piltidel sarnast?', 'Mis on erinevat?', 'Kas sinu pere teeb ka nii?', 'Miks?'], [60, 90]),
      B.rolecards('010_t_roles', 'Rääkimine 2. Ideekaart „Pere”.', 'A küsib kaardi märksõnade järgi, B vastab. Siis vahetage.',
        'Küsi paarilisel 5 küsimust märksõnade järgi: pere suurus, kus elavad, õed-vennad, ühine aeg, pere pidu.', 'Vasta igale küsimusele 2–3 lausega. Ütle ka üks detail.',
        ['Kui suur on sinu pere?', 'Kus sinu vanemad elavad?', 'Mida te koos teete?'], ['Minu peres on…', 'Mul on…', 'Me tavaliselt…, sest…']),
      B.rolecards('010_t_friends', 'Rääkimine 2. Ideekaart „Sõbrad”.', 'Nüüd küsib B ja A vastab.',
        'Vasta igale küsimusele 2–3 lausega.', 'Küsi 5 küsimust märksõnade järgi: parim sõber, kus tutvusite, milline ta on, mida koos teete, kui tihti kohtute.',
        ['Minu parim sõber on…', 'Ta on…', 'Me kohtume…'], ['Kes on sinu parim sõber?', 'Kus te tutvusite?', 'Kui tihti te kohtute?']),
      B.selfcheck('010_t_self', ['Kirjutamine: kirjutan visiitkaardi põhjal 25–40 sõna.', 'Kirjutamine: kirjutan kutse 30–50 sõnaga.', 'Rääkimine: kirjeldan pilti 1 minut.', 'Rääkimine: küsin ja vastan ideekaardi järgi.'], 'Moodul 2 tehtud'),
    ],
  },
};
