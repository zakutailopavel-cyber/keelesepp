// A2 course (A1 → A2 roadmap), module 7 „Pood, raha ja ostud”, lessons a2-031 … a2-035 (full course sheets, pattern of
// a2/module01.js). Shops, departments and goods; what I look for (Ma otsin musta jopet, Mul on vaja sooja mütsi —
// adjective and noun in the partitive), numbers up to 1000, prices and quantities (kaks eurot, kolm särki), the
// comparative in a fitting room (suurem, odavam … kui; Kas teil on suuremat?), receipts, discounts and returns
// (kehtib reedeni, kviitungiga / ilma kviitungita, 14 päeva jooksul). Harno A2 formats: short listenings with
// 1–2-word answers (read twice), an advert, a receipt and a notice to read, a message of 40–60 words, a role play in
// a shop. Numbers, sizes and forms are trained in one shopping situation (roadmap attention).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-07', course: 'a2', title: 'Pood, raha ja ostud', level: 'A2', design: 'v2', template: 'v3' };

export const LESSONS = {
  'a2-031': {
    title: 'Poes ja kaubad',
    canDo: 'Ma ütlen poes, mida ma otsin (kaup, suurus, värv, hind), leian õige osakonna ja esitan müüjale vähemalt kolm täpsustavat küsimust.',
    template: 'v3',
    discover: [
      B.text('031_d_situation', 'Kaubamajas', 'Talv tuleb. Anna vajab sooja jopet ja Liis otsib uusi saapaid. Nad lähevad kaubamajja. Kaubamajas on neli korrust. Kust leida õige osakond?'),
      B.reading('031_d_info', 'Loe kaubamaja infot.', 'Loe teksti ja vasta küsimustele lühidalt.', 'Tere tulemast kaubamajja Kaubahall!',
        'Esimesel korrusel on toidukaubad. Seal on ka apteek ja kohvik. Teisel korrusel on naiste riided: kleidid, püksid, jakid ja joped. Seal on ka proovikabiinid. Kolmandal korrusel on meeste ja laste riided. Jalanõude osakond on ka kolmandal korrusel, lifti kõrval. Seal on kingad, saapad ja tossud. Laste mänguasjad on samuti kolmandal korrusel. Neljandal korrusel on kodukaubad: tassid, taldrikud, lambid ja voodipesu. Kassad on igal korrusel. Kui sa ei leia õiget suurust, küsi müüjalt. Müüjad aitavad hea meelega. Kaubamaja on avatud iga päev kell 9–21. Pühapäeval on kaubamaja avatud kell 10–18. Parkla on maja taga ja see on klientidele tasuta. Täna on jalanõude osakonnas allahindlus. Talvesaapad on kakskümmend protsenti odavamad. Kui sa ostad üle saja euro, saad kohvikus tasuta kohvi. Head ostlemist!',
        [['Mis on esimesel korrusel?', 'toidukaubad|toidukaubad, apteek ja kohvik'], ['Kus on naiste riided?', 'teisel korrusel'], ['Kus on jalanõude osakond?', 'kolmandal korrusel|kolmandal korrusel, lifti kõrval'], ['Mida saab osta neljandalt korruselt?', 'kodukaupu|kodukaubad|tasse, taldrikuid, lampe'], ['Kellelt küsida, kui ei leia suurust?', 'müüjalt'], ['Mis kell on kaubamaja pühapäeval avatud?', 'kell 10–18|10–18'], ['Kas parkla on klientidele tasuta?', 'jah|jah, on|on'], ['Mis on täna odavam?', 'talvesaapad|jalanõud']]),
      B.notice('031_d_notice', 'Märka: ma otsin musta jopet', ['Ma **otsin** jope**t**, kleiti, särki. (mida? → osastav)', 'Ma **vajan** uu**t** jope**t**. **Mul on vaja** soo**ja** mütsi.', 'Omadussõna ka osastavas: must**a** jopet, sinis**t** kleiti, valge**t** särki', 'Kus on **riiete osakond**? Riided on **teisel korrusel**.', '**Mis suurus?** **Mis värvi?** **Mis see maksab?**']),
      B.wordforms('031_d_forms', 'Ma otsin …', 'Kirjuta sõnad osastavas: Ma otsin …', [
        ['must jope', 'Ma otsin …', 'musta jopet'], ['sinine kleit', 'Ma otsin …', 'sinist kleiti'], ['valge särk', 'Ma otsin …', 'valget särki'], ['punane kott', 'Ma otsin …', 'punast kotti'],
        ['soe müts', 'Ma otsin …', 'sooja mütsi'], ['uus lamp', 'Ma otsin …', 'uut lampi'], ['hall mantel', 'Ma otsin …', 'halli mantlit'], ['kollane sall', 'Ma otsin …', 'kollast salli']]),
      B.gaps('031_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', ['Jalanõude [osakond] on kolmandal korrusel.', 'Riided on teisel [korrusel].', 'Mis [suurus] teil on? — M.', 'Mis [värvi] kleit see on? — Sinine.', 'Poes aitab [müüja] valida.', 'Ma [otsin] musta jopet, aga ma ei leia seda.', 'Mul on [vaja] sooja mütsi.', 'Maksta saab [kassas].'], ['osakond', 'korrusel', 'suurus', 'värvi', 'müüja', 'otsin', 'vaja', 'kassa', 'hind', 'kassas', 'odav']),
      B.errorfix('031_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma otsin must jope.', 'Ma otsin musta jopet.'], ['Mul on vaja soe müts.', 'Mul on vaja sooja mütsi.'], ['Riided on teine korrus.', 'Riided on teisel korrusel.'], ['Mis värv see kleit on?', 'Mis värvi see kleit on?'], ['Ma vajan uus kott.', 'Ma vajan uut kotti.'], ['Kas teil on valge särk?', 'Kas teil on valget särki?'], ['Ma otsin sinine kleit.', 'Ma otsin sinist kleiti.'], ['Kus on riided osakond?', 'Kus on riiete osakond?']]),
      B.translation('031_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я ищу тёплую куртку.', 'Где отдел обуви?', 'Одежда на втором этаже.', 'Какой у вас размер?', 'Мне нужно новое платье.', 'Сколько стоят эти сапоги?', 'Я ищу чёрные сапоги.', 'Где касса?']),
      B.speaking('031_d_say', 'Mida sa otsid?', 'Paariline on müüja. Ütle, mida sa otsid.', ['Mida sa otsid?', 'Mis suurus?', 'Mis värvi?', 'Kui palju see võib maksta?', 'Kus on õige osakond?'], [45, 90], ['Ma otsin…', 'Mul on vaja…', 'Kus on … osakond?']),
      B.writing('031_d_write', 'Minu ostunimekiri.', 'Kirjuta 5–7 lauset: mida sa vajad, mis värvi ja mis suurusega.', [5, 7], ['otsin', 'vajan', 'värvi', 'suurus'], 2),
    ],
    practice: [
      B.cloze('031_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Sofia ostab talvejopet', [
        'Talv tuleb ja Sofia vajab {*sooja|soe|soojad} jopet. Ta läheb kaubamajja.',
        '',
        'Naiste riided on teisel {*korrusel|korrus|korrusele}. Sofia otsib {*musta|must|mustad} jopet, aga musti jopesid ei ole.',
        '',
        'Müüja küsib: „Mis {*suurus|suurust|suurusega} teil on?” Sofia vastab: „S.” Müüja ütleb: „Proovige seda sinist {*jopet|jope|joped}!”',
        '',
        'Sinine jope sobib hästi. See maksab ainult viiskümmend {*eurot|euro|eurod}. Sofia maksab {*kassas|kassa|kassasse} kaardiga ja on väga {*rahul|rahulik|rahu}.',
      ], 'g_vocab'),
      B.listening('031_p_listen', 'Kuulamine. Kaubamaja teadaanne.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Head kliendid!', 'Täna on kaubamajas suur allahindlus.', 'Teisel korrusel on naiste joped kolmkümmend protsenti odavamad.', 'Kolmandal korrusel maksavad laste saapad ainult kakskümmend eurot.',
        'Neljandal korrusel saab osta kaks tassi ühe hinnaga.', 'Esimesel korrusel kohvikus on kohv täna tasuta.', 'Kaubamaja on avatud kella üheksani.',
      ], [
        'Naiste joped on [teisel] korrusel.', 'Joped on [kolmkümmend|30] protsenti odavamad.', 'Laste saapad maksavad [kakskümmend|20] eurot.',
        'Kaks tassi saab osta ühe [hinnaga].', 'Kohvikus on kohv täna [tasuta].', 'Kaubamaja on avatud kella [üheksani|21-ni].', 'Laste saapad on [kolmandal] korrusel.', 'Tasse müüakse [neljandal] korrusel.']),
      B.formtext('031_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna osastavas.', 'Pere ostunimekiri', [
        'Ma lähen poodi, sest mul on vaja [uut] (uus) [kotti] (kott).',
        '',
        'Minu mees otsib [sooja] (soe) [mütsi] (müts). Tütar tahab [punast] (punane) kleiti.',
        '',
        'Poeg vajab [suurt] (suur) jopet. Mina otsin [valget] (valge) särki.',
        '',
        'Kõik riided on kaubamajas [teisel] (teine) korrusel.',
      ], 'g_notice'),
      B.choice('031_p_choice', 'Vali õige vorm.', 'Vali lünka sobiv sõna.', [
        ['Ma otsin ___ jopet.', 'musta', 'must', 'mustad'], ['Mul on vaja ___ mütsi.', 'sooja', 'soe', 'soojad'], ['Kas teil on ___ kleiti?', 'sinist', 'sinine', 'sinised'],
        ['Ma vajan ___ kotti.', 'uut', 'uus', 'uued'], ['Ma otsin ___ särki.', 'valget', 'valge', 'valged'], ['Kus on ___ osakond?', 'jalanõude', 'jalanõud', 'jalanõusid'], ['Ma vajan ___ salli.', 'kollast', 'kollane', 'kollased'], ['Kas teil on ___ lampi?', 'väikest', 'väike', 'väikesed']], 'full', 'g_notice'),
      B.transformation('031_p_ask', 'Küsi müüjalt.', 'Kirjuta küsimus. Vastus on antud.', [
        ['Jalanõud on kolmandal korrusel.', 'Kus …?', 'Kus on jalanõud?|Kus on jalanõude osakond?'], ['Jope maksab 89 eurot.', 'Kui palju …?', 'Kui palju jope maksab?|Kui palju see jope maksab?'],
        ['Kleit on sinine.', 'Mis värvi …?', 'Mis värvi kleit on?|Mis värvi see kleit on?'], ['Mul on suurus M.', 'Mis …?', 'Mis suurus sul on?|Mis suurus teil on?'],
        ['Jah, meil on musti saapaid.', 'Kas teil on …?', 'Kas teil on musti saapaid?'], ['Kassa on ukse juures.', 'Kus …?', 'Kus on kassa?'], ['Pood on avatud kella üheksani.', 'Mis kellani …?', 'Mis kellani pood avatud on?|Mis kellani on pood avatud?'], ['Jah, proovikabiin on seal.', 'Kas …?', 'Kas siin on proovikabiin?|Kas teil on proovikabiin?']]),
      B.dialogue('031_p_dialog', 'Müüja aitab.', 'Täida dialoog sobivate sõnadega.', 'Müüja', 'Liis', [
        ['A', 'Tere! Kas ma saan teid [aidata]?'], ['B', 'Tere! Ma [otsin] talvesaapaid.'], ['A', 'Mis [suurus] teil on?'], ['B', 'Kolmkümmend kaheksa.'],
        ['A', 'Mis [värvi] saapaid te soovite?'], ['B', 'Musti või pruune. Mis need maksavad?'], ['A', 'Mustad saapad maksavad seitsekümmend [eurot].'],
        ['B', 'Hästi. Kus on [kassa]?'], ['A', 'Kassa on ukse juures.'],
      ]),
      B.dictation('031_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Liis otsib sooje talvesaapaid.', 'Mustad saapad maksavad seitsekümmend eurot.', 'Kas teil on halli mantlit?', 'Naiste joped on teisel korrusel.', 'Kohv on täna kohvikus tasuta.', 'Jalanõude osakond on lifti kõrval.', 'Ma vajan uut sinist kotti.', 'Kassa on ukse juures.'], 8),
      B.rolecards('031_p_roles', 'Kaubamajas.', 'Üks on klient, teine müüja. Siis vahetage rollid.', 'Oled klient. Otsi sõbrale kingitust: müts või kott. Küsi värvi, hinda ja osakonda.', 'Oled müüja. Aita klienti. Ütle, kus osakond on ja mis kaup maksab.', ['Ma otsin…', 'Mis värvi…?', 'Kui palju see maksab?'], ['Mida te otsite?', 'See on … korrusel.', 'See maksab…']),
      B.speaking('031_p_say', 'Minu ost.', 'Räägi paarilisele, mida sa viimati poest ostsid.', ['Mida sa ostsid?', 'Mis värvi ja mis suurusega see oli?', 'Kui palju see maksis?', 'Kas sa oled ostuga rahul?'], [60, 90]),
    ],
    transfer: [
      B.text('031_t_situation', 'Uus olukord', 'Sa kolisid uude korterisse. Sul on vaja kodukaupu. Sa loed Kodupoe kataloogi, helistad poodi ja kirjutad sõbrale, mida ostad. Sul on 150 eurot.'),
      B.reading('031_t_cat', 'Loe kataloogi.', 'Loe Kodupoe kataloogi ja vasta küsimustele.', 'Kodupood: kõik uude koju',
        'Kodupood pakub kõike uude koju. Laualamp on valge või must ja maksab 24 eurot. Suur hall vaip maksab 59 eurot. Kuus tassi ja kuus taldrikut maksavad koos 35 eurot. Padi maksab 12 eurot, see on sinine, roheline või hall. Voodipesu on kahes värvis, valge ja kollane, hind on 29 eurot. Rätik maksab 8 eurot. Kui ostad üle 100 euro, on kohaletoomine tasuta. Muidu maksab kohaletoomine 7 eurot. Pood asub Tartus Riia tänaval 12. Pood on avatud esmaspäevast laupäevani kell 10–19. Pühapäeval on pood kinni.',
        [['Mis värvi on laualamp?', 'valge või must|valge, must'], ['Kui palju maksab vaip?', '59 eurot'], ['Mis värvi padjad on?', 'sinine, roheline või hall|sinine, roheline, hall'], ['Millal on kohaletoomine tasuta?', 'kui ostad üle 100 euro|üle 100 euro'], ['Millal on pood kinni?', 'pühapäeval'], ['Kui palju maksab rätik?', '8 eurot|kaheksa eurot'], ['Kus pood asub?', 'Tartus Riia tänaval 12|Riia tänaval 12|Tartus'], ['Kui palju maksavad tassid ja taldrikud koos?', '35 eurot']]),
      B.listening('031_t_listen', 'Kuula müüjat telefonis.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Kodupood, mina olen Triin.', 'Jah, valge laualamp on meil olemas.', 'Lamp maksab kakskümmend neli eurot.', 'Sinist patja kahjuks ei ole, aga hall ja roheline on.',
        'Kohaletoomine maksab seitse eurot.', 'Me toome kauba teisipäeval.',
      ], ['Müüja nimi on [Triin].', 'Lamp maksab [kakskümmend neli|24] eurot.', 'Sinist patja poes [ei ole].', 'Poes on hall ja [roheline] padi.', 'Kohaletoomine maksab [seitse|7] eurot.', 'Kaup tuleb [teisipäeval].', 'Poe nimi on [Kodupood].', 'Laualamp on [valge].']),
      B.gaps('031_t_check', 'Kontrolli vorme.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma otsin [valget] lampi. (valge)', 'Mul on vaja [suurt] vaipa. (suur)', 'Kas teil on [sinist] patja? (sinine)', 'Kodukaubad on [neljandal] korrusel. (neljas)',
        'Kas teil on [rohelist] patja? (roheline)', 'Ma otsin [pehmet] patja. (pehme)', 'Mul on vaja [uut] voodipesu. (uus)', 'Ma tahan [kollast] voodipesu. (kollane)']),
      B.rolecards('031_t_roles', 'Kodupoes.', 'Üks on klient, teine müüja. Leidke sobiv kaup.', 'Oled klient. Sa otsid lampi ja patja. Küsi värvi, hinda ja kohaletoomist.', 'Oled müüja. Valget lampi ei ole, ainult must. Ütle hinnad.', ['Ma otsin…', 'Kas teil on valget…?', 'Kui palju maksab kohaletoomine?'], ['Kahjuks ei ole…', 'Meil on must…', 'See maksab…']),
      B.speaking('031_t_say', 'Minu uus tuba.', 'Räägi umbes üks minut, mida sa oma tuppa vajad.', ['Mida sa vajad?', 'Mis värvi see peab olema?', 'Kust sa selle ostad?', 'Kui palju see maksab?'], [60, 90]),
      B.letter('031_t_letter', 'Kiri sõbrale.', 'Kirjuta sõbrale 40–60 sõna: mida sa uude koju ostad ja miks.', 'Tere!', 'Kallistades', [40, 60]),
      B.rubric('031_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Ostunimekirjas on kaup, värv ja hind; raha jätkub.', 'Kirjas on tervitus, ostud, põhjus ja lõpp.', 'Ma otsin / mul on vaja + osastav on õige.', 'Poes küsib õpilane vähemalt kolm küsimust.']),
      B.selfcheck('031_t_self', ['Ma loen poe kataloogi.', 'Ma kuulen müüja infot telefonis.', 'Ma kirjutan sõbrale oma ostudest.', 'Ma küsin poes värvi, hinda ja kohaletoomist.'], 'Kodu on sisustatud'),
    ],
  },

  'a2-032': {
    title: 'Arvud, hinnad ja kogused',
    canDo: 'Ma saan aru hindadest, numbritest ja kogustest (kuni 1000), ütlen neid ise ja kontrollin kassas, kas hind on õige.',
    template: 'v3',
    discover: [
      B.text('032_d_situation', 'Kassas', 'Markus ostab poes toitu. Kassas on Liis. Kassa ekraanil on 23,70 eurot. Markus arvab, et see on liiga palju. Kas kõik hinnad on õiged?'),
      B.listening('032_d_listen', 'Kuula numbreid.', 'Õpetaja loeb arvud kaks korda. Kirjuta lünka arv numbritega.', [
        'Bussi number on kakskümmend kaks.', 'Korteri number on sada viisteist.', 'Telefon maksab kakssada viiskümmend eurot.',
        'Kotis on kaksteist õuna.', 'Jope maksab üheksakümmend üheksa eurot.', 'Auto maksab kaheksa tuhat eurot.',
      ], ['Bussi number on [22].', 'Korteri number on [115].', 'Telefon maksab [250] eurot.', 'Kotis on [12] õuna.', 'Jope maksab [99] eurot.', 'Auto maksab [8000|8 000] eurot.', 'Kõige kallim on [auto].', 'Kõige odavam on [jope].']),
      B.reading('032_d_read', 'Loe: Markus kassas.', 'Loe teksti ja vasta küsimustele.', 'Kas hind on õige?',
        'Markus läheb pärast tööd poodi. Ta ostab pool kilo juustu, kaks pakki piima ja kuus õuna. Õunad maksavad 30 senti tükk. Ta võtab ka leiva ja kolm jogurtit. Kassas ütleb Liis: „Kokku on 23,70 eurot.” Markus imestab. Ta arvab, et see on liiga kallis. Ta vaatab kviitungit. Juust maksab 4,50 eurot, piim 2,40 eurot ja õunad 1,80 eurot. Leib on 1,60 eurot ja jogurtid 2,10 eurot. Aga kviitungil on ka kohv, 11,30 eurot! Kohvi Markus ei võtnud. Liis vabandab ja võtab kohvi arvelt maha. Nüüd on kokku 12,40 eurot. Markus maksab kaardiga.',
        [['Mitu õuna Markus ostab?', 'kuus|6'], ['Kui palju maksab üks õun?', '30 senti|kolmkümmend senti'], ['Kui palju maksab juust?', '4,50 eurot|4,50'], ['Mis on kviitungil valesti?', 'kohv|seal on kohv'], ['Kui palju on õige summa?', '12,40 eurot|12,40'], ['Kuidas Markus maksab?', 'kaardiga'], ['Mida Markus pärast tööd teeb?', 'läheb poodi|ta läheb poodi'], ['Mitu jogurtit Markus ostab?', 'kolm|3']]),
      B.notice('032_d_notice', 'Märka: arvud ja osastav', ['11 **üksteist**, 20 **kakskümmend**, 35 **kolmkümmend viis**', '100 **sada**, 250 **kakssada viiskümmend**, 1000 **tuhat**', '1 **euro** — 2 **eurot**, 10 **eurot** (2, 3 … + osastav)', 'kolm **särki**, viis **õuna**, kaks **pudelit**', '**pool kilo** juustu, 30 senti **tükk**', 'See maksab **umbes** 5 eurot. See on **odav** / **kallis**.']),
      B.wordforms('032_d_forms', 'Üks või mitu?', 'Kirjuta sõna õiges vormis.', [
        ['euro', 'üks …', 'euro'], ['euro', 'kolm …', 'eurot'], ['sent', 'viiskümmend …', 'senti'], ['särk', 'kaks …', 'särki'],
        ['õun', 'viis …', 'õuna'], ['pudel', 'kolm …', 'pudelit'], ['pakk', 'kaks …', 'pakki'], ['muna', 'kümme …', 'muna']]),
      B.errorfix('032_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['See maksab kolm euro.', 'See maksab kolm eurot.'], ['Ma ostan viis õunad.', 'Ma ostan viis õuna.'], ['Kaks pakk piima, palun.', 'Kaks pakki piima, palun.'], ['Üks eurot ja kümme senti.', 'Üks euro ja kümme senti.'], ['Mul on rahakotis kakskümmend eurod.', 'Mul on rahakotis kakskümmend eurot.'], ['Palun kaks pudel vett.', 'Palun kaks pudelit vett.'], ['See maksab viiskümmend sent.', 'See maksab viiskümmend senti.'], ['Mul on kolm särk.', 'Mul on kolm särki.']]),
      B.translation('032_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Это стоит двадцать евро.', 'Яблоки стоят 30 центов за штуку.', 'Полкило сыра, пожалуйста.', 'У меня в кошельке сто евро.', 'Это слишком дорого.', 'Всего примерно десять евро.', 'Две бутылки воды, пожалуйста.', 'У вас есть карта клиента?']),
      B.speaking('032_d_say', 'Kui palju see maksab?', 'Küsi paariliselt hindu. Vasta numbritega.', ['Kui palju maksab sinu telefon?', 'Kui palju maksab kohv kohvikus?', 'Kui palju maksab bussipilet?', 'Mis on sinu maja number?', 'Mis on kallis, mis on odav?'], [45, 90]),
      B.writing('032_d_write', 'Minu ostud.', 'Kirjuta 5–7 lauset: mida sa ostsid ja mis see maksis.', [5, 7], ['ostsin', 'maksis', 'eurot', 'kokku'], 2),
    ],
    practice: [
      B.formtext('032_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Minu kviitung', [
        'Täna ostsin ma poest kaks [pakki] (pakk) piima ja kolm [pudelit] (pudel) vett.',
        '',
        'Ma võtsin ka kuus [õuna] (õun) ja kaks [leiba] (leib).',
        '',
        'Kõik maksis kokku kaksteist [eurot] (euro) ja viiskümmend [senti] (sent).',
        '',
        'Mul oli rahakotis ainult üks [euro] (euro), seepärast maksin ma [kaardiga] (kaart).',
      ], 'g_notice'),
      B.listening('032_p_listen', 'Kuulamine 1. Kassas.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Kaire: Tere! Kas teil on kliendikaart?', 'Olga: Ei ole.', 'Kaire: Hästi. Kaks pakki piima, üks euro kakskümmend tükk.', 'Kaire: Pool kilo juustu, viis eurot.',
        'Kaire: Kuus muna, kaks eurot nelikümmend.', 'Kaire: Kokku on üheksa eurot kaheksakümmend senti.', 'Olga: Palun, siin on kümme eurot.', 'Kaire: Teile tagasi kakskümmend senti. Aitäh!',
      ], [
        'Olgal ei ole [kliendikaarti].', 'Üks pakk piima maksab üks euro [kakskümmend|20] senti.', 'Juustu ostab Olga pool [kilo].',
        'Munad maksavad kaks eurot [nelikümmend|40] senti.', 'Kokku on üheksa eurot [kaheksakümmend|80] senti.', 'Olga saab tagasi [kakskümmend|20] senti.', 'Kassapidaja nimi on [Kaire].', 'Olga annab kassas [kümme|10] eurot.']),
      B.cloze('032_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Viktor turul', [
        'Laupäeval läheb Viktor turule. Tal on rahakotis kakskümmend {*eurot|euro|eurod}.',
        '',
        'Kõigepealt ostab ta kilo {*kartuleid|kartul|kartulid}. See maksab üks euro ja viiskümmend {*senti|sent|sendid}.',
        '',
        'Siis ostab ta kuus {*muna|munad|munaga} ja pool kilo {*juustu|juust|juustud}. Juust on üsna {*kallis|kallid|kallist}: seitse eurot.',
        '',
        'Lõpuks ostab Viktor lilli. Kokku on viis eurot. Viktor annab kümme eurot ja saab viis eurot {*tagasi|tagant|tagasiga}. Rahakotti jääb alles {*umbes|üle|ümber} kümme eurot.',
      ], 'g_vocab'),
      B.choice('032_p_choice', 'Arvuta ja vali.', 'Loe hindu. Vali õige vastus.', [
        ['Õun maksab 30 senti tükk. Mis maksavad 5 õuna?', 'poolteist eurot', 'kolm eurot', 'viiskümmend senti'],
        ['Sul on rahakotis 20 eurot. Mida saad osta?', 'mütsi 12 euroga', 'jope 89 euroga', 'telefoni 250 euroga'],
        ['Juust maksab 8 eurot kilo. Mis maksab pool kilo?', 'neli eurot', 'kaheksa eurot', 'kaks eurot'],
        ['Kohv maksab 2,50 €. Sa annad 5 €. Mis saad tagasi?', 'kaks eurot viiskümmend senti', 'viis eurot', 'üks euro viiskümmend senti'],
        ['Mis on kõige suurem arv?', 'kakssada kaks', 'sada kakskümmend', 'kakskümmend kaks'], ['Pakk piima maksab 1,20 €. Mis maksavad kaks pakki?', 'kaks eurot nelikümmend senti', 'üks euro nelikümmend senti', 'kaks eurot'], ['Jope maksab 99 €. See on …', 'üsna kallis', 'väga odav', 'tasuta'], ['Müts maksab 12 € ja püksid 24 €. Kokku on …', 'kolmkümmend kuus eurot', 'kakskümmend kuus eurot', 'kolmkümmend eurot']], 'full', 'g_vocab'),
      B.gaps('032_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Palun kolm [pudelit] vett. (pudel)', 'Ma ostan kaks [särki]. (särk)', 'See maksab üks [euro]. (euro)', 'Kokku on seitse [eurot]. (euro)',
        'Kotis on viis [õuna]. (õun)', 'Palun neli [pakki] võid. (pakk)', 'Ma vajan kümme [muna]. (muna)', 'Mul on rahakotis viis [eurot]. (euro)']),
      B.wordorder('032_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Õunad maksavad kolmkümmend senti tükk.', 'Palun pool kilo juustu.', 'Kas teil on kliendikaart?', 'Kokku on üheksa eurot kaheksakümmend senti.', 'Teile tagasi kakskümmend senti.', 'Pakkumine kehtib reedeni.', 'Jalgratas maksab kolmsada kakskümmend eurot.', 'Olgal ei ole kliendikaarti.']),
      B.dictation('032_p_dict', 'Etteütlus. Hinnad.', 'Kuula ja kirjuta laused.', ['Kokku on üheksa eurot kaheksakümmend senti.', 'Jalgratas maksab kolmsada kakskümmend eurot.', 'Pakk piima maksab üks euro kakskümmend senti.', 'Teile tagasi kakskümmend senti, aitäh!', 'Soe müts maksab kaksteist eurot.', 'Ma ostan kuus muna ja pool kilo juustu.', 'Kas teil on kliendikaart?', 'See jope on minu jaoks liiga kallis.'], 8),
      B.rolecards('032_p_roles', 'Kassas.', 'Üks on kassapidaja, teine klient. Siis vahetage rollid.', 'Oled kassapidaja. Ütle iga kauba hind ja summa. Küsi kliendikaarti.', 'Oled klient. Ostad piima, leiba ja õunu. Kontrolli hinda. Maksa sularahas.', ['Kas teil on kliendikaart?', 'Kokku on…', 'Teile tagasi…'], ['Mis see maksab?', 'Kas see on õige?', 'Palun, siin on…']),
      B.speaking('032_p_say', 'Hinnad minu elus.', 'Räägi paarilisele hindadest. Kasuta numbreid.', ['Mis on sinu kõige kallim asi?', 'Mis on odav, mis on kallis?', 'Kui palju maksab nädala toit?', 'Mis maksab Eestis umbes viis eurot?'], [45, 90]),
    ],
    transfer: [
      B.text('032_t_situation', 'Uus olukord', 'Viktor tahab osta kasutatud jalgratast. Tal on 200 eurot. Ta leidis internetist kolm kuulutust. Ta palub sinu abi: võrdle hindu ja aita müüjale helistada.'),
      B.listening('032_t_listen', 'Kuula telefonikõnet.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Viktor: Tere! Kas sinine jalgratas on veel müügil?', 'Jaan: Tere! Jah, on küll.', 'Viktor: Kas hind on sada kaheksakümmend eurot?', 'Jaan: Jah, aga võin anda ka sada seitsekümmend.',
        'Viktor: Väga hea! Kas ma võin homme tulla vaatama?', 'Jaan: Jah, tule kell seitse õhtul. Aadress on Tähe tänav kaksteist.', 'Viktor: Aitäh! Kas ma saan maksta sularahas?', 'Jaan: Jah, sularaha sobib.',
      ], ['Sinine ratas on veel [müügil].', 'Uus hind on [170|sada seitsekümmend] eurot.', 'Viktor tuleb homme kell [seitse|7|19].', 'Aadress on Tähe tänav [12|kaksteist].', 'Viktor maksab [sularahas].', 'Viktor helistab [Jaanile].', 'Viktor tahab homme ratast [vaatama] tulla.', 'Sularaha [sobib].']),
      B.reading('032_t_ads', 'Loe kuulutusi.', 'Loe kolme kuulutust ja vasta küsimustele.', 'Jalgrattad müügil',
        'Kuulutus 1. Müüa sinine jalgratas, vanus kolm aastat. Hind on 180 eurot. Ratas on heas korras. Helista Jaanile, telefon 5512 3456. Kuulutus 2. Müüa must linnaratas, peaaegu uus. Hind on 260 eurot, aga hinnas saab kokku leppida. Rattaga tuleb kaasa lukk ja tuli. Kirjuta Olgale e-posti teel. Kuulutus 3. Müüa punane laste jalgratas. See sobib lapsele vanuses 6–9 aastat. Hind on ainult 45 eurot. Kõik rattad on Tallinnas. Müüjad on kodus õhtuti pärast kella kuut. Ratast võib enne ostmist proovida. Kõik müüjad räägivad eesti ja vene keelt.',
        [['Mis värvi on esimene jalgratas?', 'sinine'], ['Kui palju maksab must linnaratas?', '260 eurot'], ['Mis tuleb musta rattaga kaasa?', 'lukk ja tuli'], ['Kellele sobib punane ratas?', 'lapsele|lapsele vanuses 6–9 aastat'], ['Millal on müüjad kodus?', 'õhtuti pärast kella kuut|õhtuti|pärast kella kuut'], ['Kui vana on sinine ratas?', 'kolm aastat|3 aastat'], ['Kus rattad on?', 'Tallinnas'], ['Mis keelt müüjad räägivad?', 'eesti ja vene keelt|eesti ja vene']]),
      B.choice('032_t_choose', 'Mis ratas sobib?', 'Vali kuulutuste järgi õige vastus.', [
        ['Viktoril on 200 eurot. Mis ratas talle sobib?', 'sinine ratas', 'must ratas', 'punane ratas'], ['Mis ratas on kõige odavam?', 'punane ratas', 'sinine ratas', 'must ratas'],
        ['Mis ratta hinnas saab kokku leppida?', 'must ratas', 'sinine ratas', 'punane ratas'], ['Kellele saab helistada?', 'Jaanile', 'Olgale', 'Viktorile'], ['Mis ratas on kõige kallim?', 'must ratas', 'sinine ratas', 'punane ratas'], ['Kellele saab kirjutada e-posti?', 'Olgale', 'Jaanile', 'Viktorile'], ['Mis ratas sobib seitsmeaastasele lapsele?', 'punane ratas', 'must ratas', 'sinine ratas'], ['Mida saab enne ostmist teha?', 'ratast proovida', 'ratast tasuta võtta', 'hinda kaks korda maksta']]),
      B.rolecards('032_t_roles', 'Helista müüjale.', 'Üks on ostja, teine müüja. Leppige hind kokku.', 'Oled ostja. Helista müüjale. Küsi hinda, värvi ja aadressi. Küsi, kas hind võib olla 160 eurot.', 'Oled müüja. Ratas maksab 180 eurot. Võid anda 10 eurot odavamalt. Ütle aadress.', ['Kas ratas on veel müügil?', 'Kas hind võib olla…?', 'Mis on aadress?'], ['Jah, on küll.', 'Ma võin anda…', 'Aadress on…']),
      B.speaking('032_t_say', 'Viktori ost.', 'Räägi grupile, mis ratta Viktor ostab ja miks.', ['Mis ratta Viktor valib?', 'Kui palju see maksab?', 'Kui palju raha jääb alles?', 'Millal ta ratta ostab?'], [45, 90]),
      B.letter('032_t_letter', 'Sõnum Viktorile.', 'Kirjuta Viktorile 40–60 sõna: mis ratas sobib, mis see maksab, kuhu minna.', 'Tere, Viktor!', 'Head ostu!', [40, 60]),
      B.rubric('032_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Tabelis on värvid ja hinnad õigesti.', 'Sõnumis on ratas, hind, aeg ja aadress (40–60 sõna).', 'Arvud ja hinnad on õiged; eurot, senti on õiges vormis.', 'Telefonis küsib õpilane hinda ja aadressi.']),
      B.selfcheck('032_t_self', ['Ma loen kuulutustest hinda.', 'Ma kuulen telefonis numbreid ja aadressi.', 'Ma kirjutan sõnumi hinna ja aadressiga.', 'Ma lepin müüjaga hinna kokku.'], 'Ratas on ostetud'),
    ],
  },

  'a2-033': {
    title: 'Proovimine ja valimine',
    canDo: 'Ma palun poes teist suurust või värvi, proovin riideid, võrdlen kahte asja (odavam, kallim, suurem) ja otsustan, mida osta.',
    template: 'v3',
    discover: [
      B.text('033_d_situation', 'Proovikabiinis', 'Sofia otsib uut jopet. Poes on kaks jopet: hall ja must. Sofia proovib mõlemat. Hall jope on liiga kitsas. Must jope on soe, aga lühike. Mida valida?'),
      B.dialogue('033_d_dialog', 'Riidepoes.', 'Loe dialoogi. Täida lüngad.', 'Müüja', 'Sofia', [
        ['A', 'Tere! Kas saan aidata?'], ['B', 'Tere! Kas ma võin seda jopet [proovida]?'], ['A', 'Muidugi. [Proovikabiin] on seal.'],
        ['B', 'Vabandust, see on liiga [kitsas|väike]. Kas teil on suuremat?'], ['A', 'Jah, siin on [suurem] suurus, L.'], ['B', 'See [sobib] hästi! Aga mis see maksab?'],
        ['A', 'Kaheksakümmend üheksa eurot. Must jope on [odavam], ainult kuuskümmend.'], ['B', 'Must on odavam, aga hall on [ilusam|parem]. Ma võtan halli!'],
      ]),
      B.reading('033_d_read', 'Loe: Sofia valib jopet.', 'Loe teksti ja vasta küsimustele.', 'Hall või must?',
        'Sofia vajab talveks uut jopet. Laupäeval läheb ta Annaga kaubamajja. Teisel korrusel on palju jopesid. Sofia valib kaks: halli ja musta. Hall jope maksab 89 eurot, must jope 60 eurot. Sofia proovib kõigepealt halli jopet suuruses M. See on liiga kitsas. Müüja toob suurema, L. See sobib hästi. Siis proovib Sofia musta jopet. Must jope on soe, aga see on liiga lühike. Anna ütleb: „Hall jope on pikem ja ilusam. Ja see värv sobib sulle.” Sofia arvab, et must jope on parem. See on ju odavam. Lõpuks ostab ta halli jope, sest talv on pikk ja külm. Kassas saab ta kümme protsenti allahindlust.',
        [['Kus on joped?', 'teisel korrusel'], ['Kui palju maksab hall jope?', '89 eurot'], ['Miks hall jope suuruses M ei sobi?', 'see on liiga kitsas|liiga kitsas'], ['Mis on mustal jopel valesti?', 'see on liiga lühike|liiga lühike'], ['Mis jope on odavam?', 'must|must jope'], ['Mis jope Sofia ostab?', 'halli|halli jope|hall jope'], ['Kellega Sofia kaubamajja läheb?', 'Annaga'], ['Kui palju allahindlust Sofia saab?', 'kümme protsenti|10 protsenti']]),
      B.notice('033_d_notice', 'Märka: suurem, odavam … kui', ['suur → suure**m**, väike → väikse**m**, pikk → pike**m**, lühike → lühe**m**', 'odav → odava**m**, kallis → kalli**m**, ilus → ilusa**m**, lai → laie**m**', 'Must jope on odava**m kui** hall jope.', 'Kas teil on **suuremat** / **väiksemat**? (osastav: -t)', 'See **sobib** mulle. See **ei sobi**: see on **liiga** kitsas.', '**Kas ma võin seda proovida?** Kus on **proovikabiin**?']),
      B.transformation('033_d_compare', 'Võrdle.', 'Kirjuta võrdlus: … on …-m kui …', [
        ['jope A 60 €, jope B 89 €', 'Jope A on … (odav)', 'Jope A on odavam kui jope B.'], ['kleit 120 €, särk 30 €', 'Kleit on … (kallis)', 'Kleit on kallim kui särk.'],
        ['suurus L, suurus M', 'L on … (suur)', 'L on suurem kui M.'], ['Liis 160 cm, Anna 170 cm', 'Liis on … (lühike)', 'Liis on lühem kui Anna.'], ['müts 15 €, sall 10 €', 'Müts on … (kallis)', 'Müts on kallim kui sall.'], ['buss 2 €, takso 15 €', 'Buss on … (odav)', 'Buss on odavam kui takso.'], ['jõgi 50 m lai, järv 5 km lai', 'Järv on … (suur)', 'Järv on suurem kui jõgi.'], ['must kleit 90 cm, punane kleit 110 cm', 'Punane kleit on … (pikk)', 'Punane kleit on pikem kui must kleit.|Punane kleit on pikem kui must.']]),
      B.errorfix('033_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['See jope on suurem mis see.', 'See jope on suurem kui see.'], ['Kas teil on suurem?', 'Kas teil on suuremat?'], ['Hall jope on kallisem.', 'Hall jope on kallim.'], ['See värv sobib sina.', 'See värv sobib sulle.'], ['Püksid on liiga kitsam.', 'Püksid on liiga kitsad.'], ['Kas ma võin seda proovima?', 'Kas ma võin seda proovida?'], ['Sinine on ilusam mis hall.', 'Sinine on ilusam kui hall.'], ['Kas teil on odavam?', 'Kas teil on odavamat?']]),
      B.translation('033_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Можно это примерить?', 'Где примерочная?', 'У вас есть размер побольше?', 'Это платье слишком узкое.', 'Чёрная куртка дешевле, чем серая.', 'Этот цвет тебе идёт.', 'У вас есть поменьше?', 'Эти брюки слишком длинные.']),
      B.speaking('033_d_say', 'Mida valida?', 'Võrdle paarilisega kahte asja ja vali üks.', ['Kaks telefoni: 200 € ja 350 €.', 'Kaks jopet: lühike ja pikk.', 'Kaks kohvikut: odav ja ilus.', 'Kaks korterit: väike ja suur.', 'Kaks puhkust: mere ääres ja metsas.'], [60, 90], ['… on odavam kui …', 'Mulle sobib…', 'Ma valin…']),
      B.writing('033_d_write', 'Minu valik.', 'Kirjuta 6–8 lauset: mis asja sa valisid ja miks.', [6, 8], ['odavam', 'kui', 'sobib', 'valisin'], 2),
    ],
    practice: [
      B.listening('033_p_listen', 'Kuulamine. Proovikabiini juures.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Liis: Kas jope sobib?', 'Anna: Ei, see on liiga lai. Kas teil on väiksemat?', 'Liis: Jah, siin on suurus S.', 'Anna: See sobib paremini. Aga värv ei meeldi mulle.',
        'Liis: Meil on see jope ka rohelisena ja sinisena.', 'Anna: Sinine on ilus. Mis see maksab?', 'Liis: Sinine on natuke kallim, seitsekümmend viis eurot.', 'Anna: Hästi, ma võtan sinise.',
      ], [
        'Esimene jope on liiga [lai].', 'Anna küsib [väiksemat] suurust.', 'Uus suurus on [S].', 'Annale ei meeldi jope [värv].', 'Sinine jope on natuke [kallim].', 'Sinine jope maksab [75|seitsekümmend viis] eurot.', 'Jopet on ka [rohelisena].', 'Lõpuks võtab Anna [sinise].']),
      B.cloze('033_p_cloze', 'Vali lünka sobiv sõna.', 'Loe teksti. Vali igasse lünka üks variant.', 'Markus otsib ülikonda', [
        'Markus läheb sõbra pulma ja vajab uut ülikonda. Poes on kaks ülikonda: hall ja must. Hall on {*odavam|odav|odavalt} kui must.',
        '',
        'Markus proovib halli ülikonda. See on liiga {*lai|laiem|laia}. „Kas teil on {*väiksemat|väiksem|väike}?” küsib ta müüjalt.',
        '',
        'Väiksem ülikond {*sobib|sobin|sobima} hästi. Must ülikond on ilusam, aga see on palju {*kallim|kallis|kallimat}.',
        '',
        'Markus mõtleb: „Hall värv sobib {*mulle|mina|minu} paremini.” Ta ostab halli ülikonna ja valge {*särgi|särk|särki}. Kokku maksab ta sada viiskümmend {*eurot|euro|eurod}.',
      ], 'g_vocab'),
      B.formtext('033_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna keskvõrdes.', 'Minu uus korter', [
        'Minu uus korter on [suurem] (suur) kui vana, aga see on ka [kallim] (kallis).',
        '',
        'Köök on [väiksem] (väike), aga elutuba on [ilusam] (ilus).',
        '',
        'Tööle on nüüd tee [lühem] (lühike) ja buss on [kiirem] (kiire).',
        '',
        'Talvel on uues korteris [soojem] (soe). Ma arvan, et elu on nüüd [parem] (hea).',
      ], 'g_notice'),
      B.gaps('033_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', ['Must kleit on [lühem] kui punane. (lühike)', 'Kas teil on [odavamat] jopet? (odav, osastav)', 'Jope on [soojem] kui mantel. (soe)', 'See värv [sobib] sulle hästi. (sobima)', 'Ma [proovin] seda kleiti. (proovima)', 'Püksid on liiga [kitsad]. (kitsas)', 'Kas ma võin seda [proovida]? (proovima)', 'Must jope on [odavam] kui hall. (odav)']),
      B.transformation('033_p_ask', 'Palu muud.', 'Kirjuta küsimus müüjale.', [
        ['Jope on liiga väike.', 'Kas teil on …?', 'Kas teil on suuremat?'], ['Kleit on liiga suur.', 'Kas teil on …?', 'Kas teil on väiksemat?'], ['Särk on liiga kallis.', 'Kas teil on …?', 'Kas teil on odavamat?'],
        ['Mantel on liiga lühike.', 'Kas teil on …?', 'Kas teil on pikemat?'], ['Saapad on liiga kitsad.', 'Kas teil on …?', 'Kas teil on laiemaid?'], ['Ma tahan jopet proovida.', 'Kas ma võin …?', 'Kas ma võin jopet proovida?|Kas ma võin seda jopet proovida?'], ['Kleit on liiga pikk.', 'Kas teil on …?', 'Kas teil on lühemat?'], ['Müts on liiga kitsas.', 'Kas teil on …?', 'Kas teil on laiemat?']]),
      B.dialogue('033_p_dialog', 'Kingapoes.', 'Täida dialoog sobivate sõnadega.', 'Viktor', 'Müüja', [
        ['A', 'Tere! Ma otsin talvesaapaid.'], ['B', 'Mis [suurus] teil on?'], ['A', 'Nelikümmend kolm. Kas ma võin neid [proovida]?'], ['B', 'Palun. Kuidas on?'],
        ['A', 'Need on liiga [kitsad]. Kas teil on laiemaid?'], ['B', 'Jah, need on laiemad, aga natuke [kallimad].'], ['A', 'Need [sobivad] hästi. Ma võtan need.'], ['B', 'Väga hea valik! Kas te maksate [kaardiga]?'], ['A', 'Jah. Kas ma saan saapaid [vahetada], kui need ei sobi?']]),
      B.dictation('033_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kas teil on seda jopet väiksemas suuruses?', 'Sinine jope on natuke kallim kui roheline.', 'See värv sobib sulle väga hästi.', 'Must jope on odavam kui hall.', 'Ma võtan sinise, aitäh!', 'Kas ma võin neid saapaid proovida?', 'Need püksid on mulle liiga pikad.', 'Proovikabiin on teisel korrusel.'], 8),
      B.rolecards('033_p_roles', 'Proovikabiini juures.', 'Üks on klient, teine müüja. Siis vahetage rollid.', 'Oled klient. Proovi pükse. Need on liiga pikad. Palu teist suurust ja värvi. Võrdle hindu.', 'Oled müüja. Too teine suurus. Sinist värvi ei ole, on must ja hall. Must on odavam.', ['Kas teil on lühemaid?', 'Kas on teist värvi?', 'Mis on odavam?'], ['Siin on väiksem suurus.', 'Sinist kahjuks ei ole.', 'Must on odavam kui hall.']),
      B.speaking('033_p_say', 'Mis on parem?', 'Võrdle kahte asja oma elust.', ['Buss või auto: mis on odavam?', 'Tartu või Tallinn: mis on suurem?', 'Talv või suvi: mis on ilusam?', 'Kohv või tee: mis on parem?'], [45, 90]),
    ],
    transfer: [
      B.text('033_t_situation', 'Uus olukord', 'Markus läheb sõbra pulma. Ta vajab ülikonda (pintsak ja püksid) ja kingi. Tal on 200 eurot. Sina aitad tal valida.'),
      B.reading('033_t_shop', 'Loe poe pakkumisi.', 'Loe poe pakkumisi ja vasta küsimustele.', 'Meeste riided',
        'Ülikond Klassik on tumesinine ja maksab 159 eurot. Suurused on 48–56. Ülikond Linn on hall ja maksab 129 eurot. See on õhem ja sobib suveks. Ülikond Premium on must, hind on 249 eurot. Valge särk maksab 35 eurot, sinine särk 29 eurot. Mustad kingad maksavad 79 eurot, pruunid kingad 65 eurot. Kõiki kaupu saab poes proovida. Proovikabiinid on teisel korrusel. Kui ost ei sobi, saab seda 30 päeva jooksul vahetada. Kohaletoomine on tasuta, kui ost on üle 150 euro. Laupäeviti aitab poes valida stilist.',
        [['Mis värvi on ülikond Klassik?', 'tumesinine'], ['Mis ülikond on kõige odavam?', 'Linn|ülikond Linn|hall ülikond'], ['Mis särk on odavam?', 'sinine|sinine särk'], ['Kui palju maksavad pruunid kingad?', '65 eurot'], ['Kui kaua saab ostu vahetada?', '30 päeva|30 päeva jooksul'], ['Mis suurused on ülikonnal Klassik?', '48–56'], ['Kus on proovikabiinid?', 'teisel korrusel'], ['Kes aitab laupäeviti valida?', 'stilist']]),
      B.truefalse('033_t_tf', 'Kas raha jätkub?', 'Markusel on 200 eurot. Loe ja vali.', [
        ['Ülikond Linn ja sinine särk maksavad kokku 158 eurot.', true], ['Ülikond Premium on kallim kui 200 eurot.', true], ['Ülikond Klassik ja mustad kingad maksavad alla 200 euro.', false],
        ['Pruunid kingad on odavamad kui mustad.', true], ['Kohaletoomine on alati tasuta.', false], ['Valge särk on kallim kui sinine.', true], ['Ülikond Linn sobib eriti hästi talveks.', false], ['Proovikabiinid on esimesel korrusel.', false]]),
      B.listening('033_t_listen', 'Kuula Markuse häälsõnumit.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin Markus.', 'Ma käisin poes ja proovisin ülikonda Klassik.', 'Suurus viiskümmend oli liiga lai.', 'Suurus nelikümmend kaheksa sobis hästi.',
        'Hall ülikond on odavam, aga mulle ei meeldi see värv.', 'Kingi ma veel ei ostnud.', 'Kas sa tuled laupäeval minuga poodi?',
      ], ['Markus proovis ülikonda [Klassik].', 'Suurus 50 oli liiga [lai].', 'Hästi sobis suurus [48|nelikümmend kaheksa].', 'Hall ülikond on [odavam].', 'Markus ei ostnud veel [kingi].', 'Ta tahab minna poodi [laupäeval].', 'Markusele ei meeldi halli ülikonna [värv].', 'Markus kutsub sõbra [poodi].']),
      B.rolecards('033_t_roles', 'Riidepoes.', 'Üks on Markus, teine müüja. Valige ülikond.', 'Oled Markus. Proovi ülikonda. See on liiga lai. Palu väiksemat. Küsi, mis kingad sobivad.', 'Oled müüja. Too väiksem suurus. Soovita värvi ja kingi. Ütle hinnad.', ['Kas teil on väiksemat?', 'Mis kingad sobivad?', 'Mis on odavam?'], ['Siin on suurus 48.', 'Pruunid kingad sobivad.', 'Kokku on…']),
      B.speaking('033_t_say', 'Mida soovitad?', 'Seleta Markusele umbes minut, mis riided talle sobivad.', ['Mis ülikond?', 'Mis särk ja kingad?', 'Kui palju kokku?', 'Miks see valik on hea?'], [60, 90]),
      B.letter('033_t_letter', 'Vastus Markusele.', 'Kirjuta Markusele 50–70 sõna: mida osta ja miks.', 'Tere, Markus!', 'Edu pulmas!', [50, 70]),
      B.rubric('033_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Valik on tehtud ja raha jätkub (kuni 200 eurot).', 'Kirjas on võrdlus: odavam, kallim … kui.', 'Keskvõrre ja Kas teil on suuremat? on õiges vormis.', 'Poes palub õpilane teist suurust ja küsib nõu.']),
      B.selfcheck('033_t_self', ['Ma loen poe pakkumisi ja võrdlen hindu.', 'Ma kuulen sõbra häälsõnumit.', 'Ma soovitan kirjas, mida osta.', 'Ma palun poes teist suurust.'], 'Pulmaks valmis'),
    ],
  },

  'a2-034': {
    title: 'Kviitung, kampaania ja tagastus',
    canDo: 'Ma loen kviitungit, reklaami ja tagastustingimusi ning leian hinna, tähtaja ja tingimuse vähemalt neljas dokumendis viiest.',
    template: 'v3',
    discover: [
      B.text('034_d_situation', 'Kampaania', 'Viktor ostis eile uue veekeetja. Täna nägi ta reklaami: sama veekeetja on 30% odavam! Ja veekeetja ei tööta hästi. Mida teha? Viktor loeb kviitungit ja poe reegleid.'),
      B.reading('034_d_rules', 'Loe poe reegleid.', 'Loe teksti ja vasta küsimustele.', 'Tagastamine ja vahetus',
        'Kauba saab tagastada 14 päeva jooksul. Kaup peab olema puhas ja karbis. Tagastamiseks on vaja kviitungit. Ilma kviitungita me kaupa tagasi ei võta. Kui kaup on katki või sellel on defekt, saab selle tagastada ühe aasta jooksul. Siis saad valida: uus kaup või raha tagasi. Raha tagastame samal viisil, nagu sa maksid: kaardiga või sularahas. Kui ostsid kauba kampaania ajal, saad tagasi kampaania hinna. Allahinnatud kaupa saab ainult vahetada, mitte tagastada. Kliendikaardiga ostud näeme arvutis, siis ei ole kviitungit vaja. Küsimuste korral tule infoletti esimesel korrusel.',
        [['Mitme päeva jooksul saab kaupa tagastada?', '14 päeva jooksul|14|neljateistkümne päeva jooksul'], ['Mida on tagastamiseks vaja?', 'kviitungit|kviitung'], ['Kui kaua saab katkist kaupa tagastada?', 'ühe aasta jooksul|aasta'], ['Mida saab teha allahinnatud kaubaga?', 'vahetada|ainult vahetada'], ['Millal ei ole kviitungit vaja?', 'kui ostsid kliendikaardiga|kliendikaardiga'], ['Kus on infolett?', 'esimesel korrusel'], ['Kuidas pood raha tagastab?', 'samal viisil, nagu sa maksid|kaardiga või sularahas'], ['Mida saad tagasi, kui ostsid kampaania ajal?', 'kampaania hinna|kampaania hinna tagasi']]),
      B.notice('034_d_notice', 'Märka: kuni reedeni, kviitungiga', ['**kuni** reede**ni**, kuni 31. mai**ni** (mis ajani? → -ni)', '**14 päeva jooksul**, **kahe nädala jooksul**', 'kviitungi**ga** (-ga), **ilma** kviitungi**ta** (ilma …-ta)', 'Pakkumine **kehtib** reedeni. Allahindlus on **30%** (kolmkümmend protsenti).', 'Ma tahan jope **tagastada** / suurust **vahetada**.']),
      B.wordforms('034_d_ni', 'Mis ajani?', 'Kirjuta sõna -ni vormis.', [
        ['esmaspäev', 'kuni …', 'esmaspäevani'], ['reede', 'kuni …', 'reedeni'], ['pühapäev', 'kuni …', 'pühapäevani'], ['õhtu', 'kuni …', 'õhtuni'],
        ['kevad', 'kuni …', 'kevadeni'], ['aasta lõpp', 'kuni …', 'aasta lõpuni'], ['kell kuus', 'kuni …', 'kella kuueni'], ['kuu lõpp', 'kuni …', 'kuu lõpuni']]),
      B.errorfix('034_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Pakkumine kehtib kuni reede.', 'Pakkumine kehtib kuni reedeni.'], ['Ma tahan jope tagastama.', 'Ma tahan jope tagastada.'], ['Tagastada saab kviitung.', 'Tagastada saab kviitungiga.'], ['Allahindlus on kolmkümmend protsent.', 'Allahindlus on kolmkümmend protsenti.'], ['Ilma kviitung ei saa.', 'Ilma kviitungita ei saa.'], ['Ma tahan suurus vahetada.', 'Ma tahan suurust vahetada.'], ['Kampaania kehtib kuni pühapäev.', 'Kampaania kehtib kuni pühapäevani.'], ['Ma soovin raha tagasi saama.', 'Ma soovin raha tagasi saada.']]),
      B.gaps('034_d_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', ['Pakkumine kehtib kuni [reedeni]. (reede)', 'Allahindlus kehtib kuni [pühapäevani]. (pühapäev)', 'Tagastada saab [kviitungiga]. (kviitung, -ga)', 'Ilma [kviitungita] ei saa. (kviitung, ilma)', 'Kampaania kestab [neljapäevani]. (neljapäev)', 'Kliendikaardiga saab [soodustust]. (soodustus)', 'Allahindlus on 30 [protsenti]. (protsent)', 'Pakkumine kehtib [laupäevani]. (laupäev)']),
      B.translation('034_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Сохраните чек.', 'Скидка действует до пятницы.', 'Я хочу вернуть куртку.', 'Можно поменять размер?', 'У куртки дефект.', 'С картой клиента скидка 10%.', 'Акция действует до конца октября.', 'Кроссовки на 30% дешевле.']),
      B.speaking('034_d_say', 'Poe reeglid.', 'Seleta paarilisele poe reegleid.', ['Kui kaua saab kaupa tagastada?', 'Mida on vaja?', 'Mida teha, kui kaup on katki?', 'Kas sa hoiad kviitungeid alles?'], [45, 90]),
      B.writing('034_d_write', 'Minu ost.', 'Kirjuta 6–8 lauset: mida sa ostsid ja kas tahad seda tagastada.', [6, 8], ['ostsin', 'kviitung', 'tagastada'], 2),
    ],
    practice: [
      B.reading('034_p_receipt', 'Dokument 1. Kviitung.', 'Loe kviitungit ja vasta küsimustele.', 'Kaubamaja Kaubahall, Tartu',
        'Kuupäev: 12.10.2026, kell 17.45. Veekeetja Kodu maksab 39,90 eurot. Allahindlus on 20%, miinus 7,98 eurot. Rätik, 2 tükki, 8 eurot tükk, kokku 16 eurot. Kõik kokku: 47,92 eurot. Makstud pangakaardiga. Kliendikaart: Viktor Orlov. Kampaania hinnaga kaupa saab vahetada 14 päeva jooksul. Hoidke kviitung alles! Veekeetja garantii on 2 aastat. Teid teenindas kassapidaja Kaire. Järgmisel ostul saate kliendikaardiga 5% soodustust. Kampaania hinnaga kaupa ei saa tagastada, ainult vahetada. Katkise kauba saab tagastada garantii ajal. Pood on avatud iga päev kell 9–21. Aitäh ostu eest ja tulge jälle!',
        [['Mis kuupäev on kviitungil?', '12.10.2026|12. oktoober|12. oktoobril'], ['Kui suur on veekeetja allahindlus?', '20%|20 protsenti'], ['Mitu rätikut Viktor ostis?', 'kaks|2'], ['Kuidas Viktor maksis?', 'pangakaardiga|kaardiga'], ['Kui pikk on veekeetja garantii?', '2 aastat|kaks aastat'], ['Mis kell Viktor ostu tegi?', 'kell 17.45|17.45'], ['Kes Viktorit teenindas?', 'Kaire|kassapidaja Kaire'], ['Mitu protsenti soodustust saab järgmisel ostul?', '5%|5 protsenti|viis protsenti']]),
      B.cloze('034_p_cloze', 'Poe teade.', 'Vali igasse lünka sobiv sõna.', 'Head kliendid!', [
        'Meie pood on remondi tõttu kinni {*esmaspäevani|esmaspäeval|esmaspäevast}. Kõik kampaaniad {*kehtivad|kehtib|kehtima} e-poes edasi.',
        '',
        'Tagastada saab kaupa ainult {*kviitungiga|kviitung|kviitungit}. Kui kaup on {*katki|terve|uus}, kirjutage meile.',
        '',
        'Vahetada saab {*kahe|kaks|kahte} nädala jooksul. Kliendikaardiga saate {*soodustust|soodustus|soodustusega}.',
        '',
        'Allahindlus on kuni viiskümmend {*protsenti|protsent|protsendid}. Vabandame ja {*aitäh|palun|vabandust} kannatlikkuse eest!',
      ], 'g_vocab'),
      B.formtext('034_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Sofia vahetab jopet', [
        'Sofia tahab jopet [tagastada] (tagastama), sest see on liiga väike.',
        '',
        'Ta läheb poodi [kviitungiga] (kviitung). Ilma [kviitungita] (kviitung) ei saa jopet tagastada.',
        '',
        'Müüja ütleb: „Kampaania kaupa saab ainult [vahetada] (vahetama).” Pakkumine kehtib [pühapäevani] (pühapäev).',
        '',
        'Sofia valib [suurema] (suur) jope. Uus jope on viis [eurot] (euro) kallim, aga [kliendikaardiga] (kliendikaart) saab ta soodustust.',
      ], 'g_notice'),
      B.listening('034_p_listen', 'Dokument 4. Teadaanne poes.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Head kliendid!', 'Täna kehtib kõikidele kodukaupadele allahindlus.', 'Tassid ja taldrikud on nelikümmend protsenti odavamad.', 'Kliendikaardiga saate veel kümme protsenti soodustust.',
        'Pakkumine kehtib ainult täna, kella kaheksani.', 'Kampaania kaupa saab vahetada seitsme päeva jooksul.',
      ], ['Allahindlus on täna [kodukaupadele].', 'Tassid on [nelikümmend|40] protsenti odavamad.', 'Kliendikaardiga saab veel [kümme|10] protsenti.', 'Pakkumine kehtib kella [kaheksani|8-ni|20-ni].', 'Vahetada saab [seitsme|7] päeva jooksul.', 'Tassid ja [taldrikud] on odavamad.', 'Pakkumine kehtib ainult [täna].', 'Teadaanne on poe [klientidele].']),
      B.transformation('034_p_rule', 'Ütle lihtsalt.', 'Kirjuta reegel lihtsa lausega.', [
        ['Tagastus 14 päeva.', 'Kauba saab tagastada …', 'Kauba saab tagastada 14 päeva jooksul.'], ['Pakkumine: E–R.', 'Pakkumine kehtib …', 'Pakkumine kehtib reedeni.|Pakkumine kehtib esmaspäevast reedeni.'],
        ['Vahetus: ainult kviitungiga.', 'Vahetada saab ainult …', 'Vahetada saab ainult kviitungiga.'], ['Kliendikaart: -10%.', 'Kliendikaardiga saad …', 'Kliendikaardiga saad 10% soodustust.|Kliendikaardiga saad kümme protsenti soodustust.'],
        ['Kampaaniakaup: tagastus ei.', 'Kampaania kaupa …', 'Kampaania kaupa ei saa tagastada.'], ['Garantii: 2 a.', 'Garantii on …', 'Garantii on kaks aastat.|Garantii on 2 aastat.'], ['Infolett: 1. korrus.', 'Infolett on …', 'Infolett on esimesel korrusel.'], ['Sokid: 3 paari 2 hinnaga.', 'Kui ostad kaks paari, …', 'Kui ostad kaks paari, saad kolmanda tasuta.|Kui ostad kaks paari, saad kolmanda paari tasuta.']]),
      B.dictation('034_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Pakkumine kehtib reedeni.', 'Hoidke kviitung alles.', 'Allahindlus on 30 protsenti.', 'Ilma kviitungita ei saa.', 'Ma tahan jope tagastada.', 'Kliendikaardiga saab soodustust.', 'Veekeetja garantii on kaks aastat.', 'Infolett on esimesel korrusel.'], 8),
      B.rolecards('034_p_roles', 'Infoletis.', 'Üks on klient, teine müüja. Lahendage probleem.', 'Oled klient. Sinu veekeetja ei tööta. Sul on kviitung. Küsi, kas saad raha tagasi.', 'Oled müüja. Kontrolli kviitungit ja kuupäeva. Paku uut veekeetjat või raha tagasi.', ['Minu veekeetja ei tööta.', 'Siin on kviitung.', 'Kas ma saan raha tagasi?'], ['Millal te selle ostsite?', 'Kas teil on kviitung?', 'Kas soovite uut või raha tagasi?']),
      B.speaking('034_p_say', 'Kampaania.', 'Räägi paarilisele ühest kampaaniast või allahindlusest.', ['Mis pood?', 'Mis on odavam ja kui palju?', 'Kui kaua pakkumine kehtib?', 'Kas sa ostad midagi?'], [45, 90]),
    ],
    transfer: [
      B.text('034_t_situation', 'Uus olukord', 'Viktor ostis kaubamajast veekeetja. Nädala pärast läks see katki. Kviitung on alles. Viktor tahab raha tagasi või uut veekeetjat. Sina aitad tal poele kirjutada ja müüjaga rääkida.'),
      B.listening('034_t_listen', 'Kuula infoleti töötajat.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Liis, klienditeenindaja.', 'Ma kontrollisin teie veekeetjat.', 'Jah, sellel on tõesti defekt.', 'Kahjuks sama veekeetjat meil enam ei ole.',
        'Me pakume teile teist veekeetjat, see maksab neli eurot rohkem.', 'Selle vahe maksame meie, teie ei pea midagi maksma.',
      ], ['Klienditeenindaja nimi on [Liis].', 'Veekeetjal on [defekt].', 'Sama veekeetjat poes enam [ei ole].', 'Uus veekeetja maksab [neli|4] eurot rohkem.', 'Viktor ei pea midagi [maksma].', 'Liis kontrollis [veekeetjat].', 'Liis pakub [teist] veekeetjat.', 'Hinnavahe maksab [pood].']),
      B.reading('034_t_mail', 'Loe poe vastust.', 'Loe poe e-kirja ja vasta küsimustele.', 'Tere, Viktor!',
        'Aitäh kirja eest. Kahju, et veekeetja läks katki. Teie veekeetjal on kaks aastat garantiid. Palun tooge veekeetja ja kviitung infoletti esimesele korrusele. Infolett on avatud iga päev kell 10–19. Me kontrollime veekeetjat. Kui sellel on defekt, saate valida: uus veekeetja või raha tagasi. Raha tagastame pangakaardile kolme päeva jooksul. Kui soovite, võite valida ka teise veekeetja. Kui see on kallim, maksate vahe juurde. Kui see on odavam, saate vahe tagasi. Palun võtke kaasa ka karp, kui see on alles. Lugupidamisega, Liis, Kaubahalli klienditeenindus',
        [['Kui pikk on veekeetja garantii?', 'kaks aastat|2 aastat'], ['Kuhu tuleb veekeetja tuua?', 'infoletti|infoletti esimesele korrusele'], ['Mida peab kaasa võtma?', 'kviitungi|veekeetja ja kviitungi'], ['Mis kell on infolett avatud?', 'kell 10–19|10–19'], ['Millal tuleb raha kaardile?', 'kolme päeva jooksul'], ['Mis juhtus veekeetjaga?', 'läks katki|see läks katki'], ['Mida veel kaasa võtta?', 'karp|karbi|karbi, kui see on alles'], ['Kes kirja kirjutas?', 'Liis']]),
      B.rolecards('034_t_roles', 'Infoletis.', 'Üks on klient, teine müüja. Leidke lahendus.', 'Oled klient. Su jope tasku on katki. Ostsid selle 10 päeva tagasi. Sa tahad raha tagasi.', 'Oled müüja. Küsi kviitungit. Paku vahetust: sama jope teises värvis.', ['Mul on probleem jopega.', 'Siin on kviitung.', 'Ma tahan raha tagasi.'], ['Millal te selle ostsite?', 'Kas teil on kviitung?', 'Me võime jope vahetada.']),
      B.transformation('034_t_polite', 'Ütle viisakalt.', 'Kirjuta lause viisakalt (teie).', [
        ['Anna raha tagasi!', 'Kas ma saaksin …?', 'Kas ma saaksin raha tagasi?'], ['Vaheta see jope!', 'Palun …', 'Palun vahetage see jope.|Palun vahetage jope.'],
        ['Ma tahan uut veekeetjat!', 'Ma soovin …', 'Ma soovin uut veekeetjat.'], ['Kontrolli kviitungit!', 'Palun …', 'Palun kontrollige kviitungit.'], ['Kirjuta mulle!', 'Palun …', 'Palun kirjutage mulle.'], ['Ma tahan teist suurust!', 'Kas ma saaksin …?', 'Kas ma saaksin teist suurust?'], ['Ütle, millal raha tuleb!', 'Palun öelge, …', 'Palun öelge, millal raha tuleb.'], ['Too uus veekeetja!', 'Kas te saaksite …?', 'Kas te saaksite tuua uue veekeetja?|Kas te saaksite uue veekeetja tuua?']]),
      B.speaking('034_t_say', 'Halb ost.', 'Räägi umbes minut ühest ostust, mis ei olnud hea.', ['Mida sa ostsid?', 'Mis oli valesti?', 'Kas sa said raha tagasi?', 'Mida sa nüüd teed teisiti?'], [60, 90]),
      B.letter('034_t_letter', 'Kiri poele.', 'Kirjuta poele 40–60 sõna: mis on katki ja mida sa soovid.', 'Tere!', 'Lugupidamisega', [40, 60]),
      B.rubric('034_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kirjas on: mida ostis, millal, mis on katki, mida soovib.', 'Kiri on viisakas (teie-vorm), 40–60 sõna.', 'Vormid on õiged: kviitungiga, kuni …-ni, tagastada.', 'Infoletis lahendab õpilane probleemi ilma abita.']),
      B.selfcheck('034_t_self', ['Ma loen poe vastust ja leian tingimused.', 'Ma kuulan klienditeenindajat.', 'Ma kirjutan poele kaebuse.', 'Ma küsin infoletis raha tagasi või vahetust.'], 'Probleem lahendatud'),
    ],
  },

  'a2-035': {
    title: 'Kontroll 7 — ostud ja raha',
    assessment: true,
    canDo: 'Ma näitan kontrollis, et oskan poes küsida ja valida, saan aru hindadest, kviitungist ja kampaaniast ning lahendan probleemi kaubaga (vähemalt 70%, numbrid 80%).',
    discover: [
      B.text('035_d_situation', 'Kordame', 'Enne kontrolli kordame mooduli tähtsamat: kaubad ja osakonnad, arvud ja hinnad, proovimine ja võrdlemine, kviitung, kampaania ja tagastus.'),
      B.notice('035_d_notice', 'Mooduli kokkuvõte', ['Ma otsin **musta jopet**. Mul on vaja **sooja mütsi**.', 'Arvud: 25 **kakskümmend viis**, 150 **sada viiskümmend**; 2 **eurot**, 3 **särki**', 'Võrdlus: odava**m**, kalli**m**, suure**m kui** …; Kas teil on **suuremat**?', 'Kviitungi**ga**, **ilma** kviitungi**ta**; kehtib kuni reede**ni**', 'Probleem: See on **katki**. Ma tahan **raha tagasi**.']),
      B.reading('035_d_read', 'Loe: Olga ostupäev.', 'Loe teksti ja vasta küsimustele.', 'Saapad ja kott',
        'Laupäeval läks Olga kaubamajja. Ta vajas pojale talvesaapaid ja endale uut kotti. Jalanõude osakond oli kolmandal korrusel. Poja suurus on 33. Esimesed saapad olid liiga kitsad. Müüja tõi laiemad saapad, need sobisid hästi. Saapad maksid 55 eurot, aga täna oli allahindlus 20%. Olga maksis ainult 44 eurot. Siis läks Olga kotte vaatama. Punane kott oli ilus, aga kallis, 70 eurot. Must kott oli odavam, 45 eurot. Olga ostis musta koti. Kodus nägi ta, et koti lukk on katki! Pühapäeval läks Olga tagasi poodi. Tal oli kviitung alles. Müüja vabandas ja andis uue koti.',
        [['Mida Olga vajas?', 'talvesaapaid ja kotti|saapaid ja kotti'], ['Mis suurus on poja jalg?', '33'], ['Kui palju Olga saabaste eest maksis?', '44 eurot'], ['Miks Olga ei ostnud punast kotti?', 'see oli kallis|liiga kallis|see oli kallim'], ['Mis oli kotil valesti?', 'lukk oli katki|lukk on katki|lukk'], ['Mida müüja tegi?', 'vabandas ja andis uue koti|andis uue koti']]),
      B.truefalse('035_d_tf', 'Õige või vale?', 'Loe Olga teksti uuesti.', [
        ['Jalanõud olid kolmandal korrusel.', true], ['Esimesed saapad olid liiga suured.', false], ['Olga maksis saabaste eest 55 eurot.', false], ['Must kott oli odavam kui punane.', true], ['Olgal ei olnud kviitungit.', false],
      ]),
      B.crossword('035_d_cross', 'Mooduli sõnad.', 'Kirjuta sõna vihje järgi.', [
        ['Paber, kus on ostud ja hinnad', 'kviitung'], ['Seal proovid riideid', 'proovikabiin'], ['Hind on madalam kui tavaliselt', 'allahindlus'],
        ['Inimene, kes töötab poes', 'müüja'], ['Siin maksad ostu eest', 'kassa'], ['Selles hoiad raha', 'rahakott'],
      ]),
      B.wordforms('035_d_forms', 'Mis vorm?', 'Kirjuta sõna õiges vormis.', [
        ['must jope', 'ma otsin …', 'musta jopet'], ['soe müts', 'mul on vaja …', 'sooja mütsi'], ['odav', 'keskvõrre', 'odavam'], ['kallis', 'keskvõrre', 'kallim'],
        ['euro', 'kolm …', 'eurot'], ['reede', 'kuni …', 'reedeni'], ['kviitung', 'ilma …', 'kviitungita'],
      ]),
      B.manymatch('035_d_match', 'Mida öelda poes?', 'Ühenda olukord ja lause.', ['Sa otsid osakonda.', 'Särk on liiga väike.', 'Sa tahad proovida.', 'Kaup on katki.', 'Sa tahad teada hinda.'], ['Kus on riiete osakond?', 'Kas teil on suuremat?', 'Kus on proovikabiin?', 'Ma tahan raha tagasi.', 'Mis see maksab?'], 'full', 'g_use'),
      B.transformation('035_d_trans', 'Võrdle.', 'Kirjuta võrdlus sulgudes oleva sõnaga.', [
        ['jope 60 €, mantel 90 €', 'Jope on … (odav)', 'Jope on odavam kui mantel.'], ['kleit S, kleit M', 'M on … (suur)', 'M on suurem kui S.'], ['särk 35 €, T-särk 15 €', 'Särk on … (kallis)', 'Särk on kallim kui T-särk.'],
        ['Liis 160 cm, Kati 172 cm', 'Kati on … (pikk)', 'Kati on pikem kui Liis.'], ['punane kott (ilus), must kott', 'Punane kott on … (ilus)', 'Punane kott on ilusam kui must kott.|Punane kott on ilusam kui must.'],
      ]),
      B.errorfix('035_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma otsin sinine kleit.', 'Ma otsin sinist kleiti.'], ['See maksab viis euro.', 'See maksab viis eurot.'], ['Must on odavam mis punane.', 'Must on odavam kui punane.'],
        ['Kampaania kehtib kuni laupäev.', 'Kampaania kehtib kuni laupäevani.'], ['Kas teil on suurem?', 'Kas teil on suuremat?'], ['Ma tahan jope tagastama.', 'Ma tahan jope tagastada.'],
      ]),
      B.gaps('035_d_gaps', 'Kordame vorme.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma vajan [uut] jopet. (uus)', 'Kotis on kolm [särki]. (särk)', 'Must kott on [odavam] kui punane. (odav)', 'Pakkumine kehtib [pühapäevani]. (pühapäev)',
        'Tagastada saab ainult [kviitungiga]. (kviitung)', 'Kas ma võin seda [proovida]? (proovima)',
      ]),
      B.translation('035_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Я ищу зимние сапоги.', 'Это стоит сорок пять евро.', 'У вас есть размер поменьше?', 'Синяя сумка дороже.', 'Скидка действует до воскресенья.', 'Молния сломана, я хочу деньги обратно.']),
      B.wordorder('035_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Jalanõude osakond on kolmandal korrusel.', 'Laiemad saapad sobisid hästi.', 'Must kott oli odavam.', 'Tal oli kviitung alles.', 'Müüja andis uue koti.']),
      B.speaking('035_d_say', 'Proovieksam: ostud.', 'Vasta paarilise küsimustele, nagu eksamil.', ['Kus te tavaliselt riideid ostate?', 'Mis oli teie viimane ost?', 'Mis on teie jaoks kallis?', 'Kas te olete midagi tagastanud?'], [45, 90]),
      B.writing('035_d_write', 'Kordame kirjutamist.', 'Kirjuta 6–8 lauset: üks ost, hind ja kas see sobis.', [6, 8], ['ostsin', 'maksis', 'sobis'], 2),
    ],
    practice: [
      B.tip('035_p_how', 'Kontroll: lugemine, kuulamine, keel (eksami vormis)', 'See leht on nagu Harno A2 eksami lugemine ja kuulamine. Tee kõik ilma abita. Kuulamisteksti loeb õpetaja kaks korda. Eesmärk on vähemalt 70%, numbrid ja hinnad 80%.', 'full'),
      B.choice('035_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Müüja küsib: „Kas saan aidata?”', 'Jah, ma otsin jopet.', 'Jah, head isu!', 'Ei, ma ei tea.'], ['Püksid on liiga pikad.', 'Kas teil on lühemaid?', 'Kas teil on pikemaid?', 'Kas teil on kallimaid?'],
        ['Sa tahad maksta.', 'Kus on kassa?', 'Kus on proovikabiin?', 'Kus on osakond?'], ['Kaup on katki.', 'Ma tahan seda tagastada.', 'Ma tahan seda proovida.', 'Ma tahan seda osta.'],
        ['Kassapidaja küsib kliendikaarti.', 'Jah, palun, siin on.', 'Jah, see sobib.', 'Ei, see on liiga kallis.'],
      ], 'full', 'g_use'),
      B.reading('035_p_ad', 'Lugemine 2. Reklaam.', 'Loe reklaami ja vasta küsimustele.', 'Kingapood Samm kolib!',
        'Kingapood Samm kolib uude kohta! Kõik jalanõud on kuni 50% odavamad. Allahindlus kehtib 1. juunist kuni 15. juunini. Naiste kingad maksavad nüüd 29 eurot, enne maksid need 59 eurot. Meeste saapad maksavad 45 eurot. Laste sandaalid on ainult 15 eurot. Kliendikaardiga saad veel 5% soodustust. Allahinnatud jalanõusid saab vahetada 7 päeva jooksul, aga mitte tagastada. Uus pood on avatud alates 1. juulist Riia tänaval 20. Vana pood Rüütli tänaval on avatud 15. juunini kell 10–18. Tule ja leia endale uued kingad!',
        [['Kui suur on allahindlus?', 'kuni 50%|50%|kuni 50 protsenti'], ['Kui palju maksavad naiste kingad nüüd?', '29 eurot'], ['Kui palju maksavad laste sandaalid?', '15 eurot'], ['Mitme päeva jooksul saab jalanõusid vahetada?', '7|7 päeva jooksul|seitsme päeva jooksul'], ['Kus on uus pood?', 'Riia tänaval 20|Riia tänaval']]),
      B.cloze('035_p_cloze', 'Lugemine 3. Sõnum.', 'Vali igasse lünka sobiv sõna.', 'Tere, Anna!', [
        'Eile käisin kaubamajas. Ma otsisin {*sooja|soe|soojad} jopet. Hall jope oli liiga {*kitsas|kitsam|kitsast}, aga müüja tõi {*suurema|suurem|suuremat} suuruse.',
        'See sobis {*mulle|mina|minu} hästi. Hind oli 89 {*eurot|euro|eurod}, aga täna oli 20% {*allahindlus|allahindlust|allahindlusega}.',
        'Ma maksin {*kaardiga|kaart|kaarti}. Kviitungi panin {*rahakotti|rahakott|rahakotis}. Sofia',
      ]),
      B.reading('035_p_receipt', 'Lugemine 4. Kviitung.', 'Loe kviitungit ja vasta küsimustele.', 'Toidupood Mari',
        'Kuupäev 14.10.2026, kell 18.20. Leib maksab 1,30. Piim, 2 pakki, 0,99 tükk, kokku 1,98. Juust, pool kilo, 4,20. Õunad, poolteist kilo, 2,10. Kohv maksab 6,90, allahindlus 30%, miinus 2,07. Kokku: 14,41 eurot. Makstud sularahas: 20 eurot. Tagasi: 5,59 eurot. Kliendikaardiga säästsite täna 2,07 eurot. Teid teenindas kassapidaja Kaire. Pood on avatud iga päev kell 8–22. Tagastamine on võimalik ainult kviitungiga. Järgmisel nädalal on kõik puuviljad 20% odavamad. Kliendikaardi saab kassast tasuta. Kaardiga saab iga kuu uusi pakkumisi. Aitäh ostu eest!',
        [['Kui palju maksis juust?', '4,20 eurot|4,20'], ['Mitu pakki piima on kviitungil?', 'kaks|2'], ['Mis oli allahinnatud?', 'kohv'], ['Kui palju raha sai klient tagasi?', '5,59 eurot|5,59'], ['Kes oli kassapidaja?', 'Kaire']]),
      B.listening('035_p_listen', 'Kuulamine 1. Kassas.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere! Kas teil on kliendikaart?', '— Jah, palun.', '— Särk maksab kakskümmend üheksa eurot.', '— Püksid maksavad nelikümmend viis eurot.',
        '— Kliendikaardiga saate kümme protsenti soodustust.', '— Kokku on kuuskümmend kuus eurot kuuskümmend senti.', '— Kas maksate kaardiga?', '— Ei, sularahas. Palun, siin on seitsekümmend eurot.',
      ], ['Särk maksab [29|kakskümmend üheksa] eurot.', 'Püksid maksavad [45|nelikümmend viis] eurot.', 'Soodustus on [kümme|10] protsenti.', 'Kokku on kuuskümmend kuus eurot [kuuskümmend|60] senti.', 'Klient maksab [sularahas].', 'Klient annab [seitsekümmend|70] eurot.']),
      B.listening('035_p_listen2', 'Kuulamine 2. Tagastus.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere! Ma ostsin eelmisel nädalal selle jope.', '— Tere! Mis probleem on?', '— Jope on liiga väike ja lukk on katki.', '— Kas teil on kviitung?', '— Jah, siin on.',
        '— Kas soovite raha tagasi või teist jopet?', '— Ma tahan suuremat jopet, suurust XL.', '— Kahjuks XL-i ei ole. Ma annan teile raha tagasi, kaheksakümmend eurot.',
      ], ['Klient ostis jope eelmisel [nädalal].', 'Jope on liiga [väike].', 'Jope [lukk] on katki.', 'Klient tahab suurust [XL].', 'Klient saab tagasi [kaheksakümmend|80] eurot.']),
      B.gaps('035_p_mix', 'Keel. Viis punkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma otsin [punast] kleiti. (punane)', 'See maksab kolm [eurot]. (euro)', 'Mul on vaja kaks [särki]. (särk)', 'Hall jope on [kallim] kui must. (kallis)', 'Kas teil on [väiksemat]? (väike, osastav)',
      ]),
      B.gaps('035_p_mix2', 'Keel. Veel viis punkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Pakkumine kehtib [reedeni]. (reede)', 'Ilma [kviitungita] ei saa. (kviitung)', 'Ma maksan [kaardiga]. (kaart, -ga)', 'Ma tahan jopet [tagastada]. (tagastama)', 'Allahindlus on 20 [protsenti]. (protsent)',
      ]),
      B.errorfix('035_p_fix', 'Keel. Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma otsin must jope.', 'Ma otsin musta jopet.'], ['See maksab kaks euro.', 'See maksab kaks eurot.'], ['Sinine on ilusam mis hall.', 'Sinine on ilusam kui hall.'], ['Kampaania kehtib kuni pühapäev.', 'Kampaania kehtib kuni pühapäevani.'],
      ]),
      B.wordorder('035_p_order', 'Keel. Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kas teil on suuremat suurust?', 'Allahindlus kehtib kuni reedeni.', 'Ma tahan raha tagasi.', 'Kassa on ukse juures.']),
      B.translation('035_p_tr', 'Keel. Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Сколько стоит эта куртка?', 'Можно это примерить?', 'Чёрная сумка дешевле.', 'Сохраните чек.']),
      B.writing('035_p_write', 'Kirjutamine. Sõnum poele.', 'Kirjuta poele 4–6 lauset: sinu uus ost on katki.', [4, 6], ['ostsin', 'katki', 'kviitung'], 2),
      B.speaking('035_p_say', 'Rääkimine. Ostud.', 'Vasta õpetaja küsimustele täislausega.', ['Kus te ostate toitu?', 'Mis maksab Eestis liiga palju?', 'Kas te ostate kampaania ajal?', 'Mida te teete, kui ost on katki?'], [45, 75]),
    ],
    transfer: [
      B.text('035_t_situation', 'Kontroll: kirjutamine ja rääkimine', 'Sa ostsid e-poest Stiil jope. Jope on liiga väike ja üks tasku on katki. Täida tagastuse vorm, kirjuta poele ja räägi müüjaga. Eesmärk on vähemalt 70%.'),
      B.table('035_t_form', 'Kirjutamine 1. Tagastuse vorm.', 'Täida tagastuse vorm.', 'Andmed, Sinu vastus', ['Nimi | ', 'Tellimuse number | ', 'Kaup | ', 'Suurus | ', 'Hind | ', 'Põhjus | ', 'Raha tagasi või vahetus? | ']),
      B.letter('035_t_letter', 'Kirjutamine 2. Kiri poele.', 'Kirjuta poele 40–60 sõna: mis on valesti ja mida sa soovid.', 'Tere!', 'Lugupidamisega', [40, 60]),
      B.listening('035_t_listen', 'Kuulamine. Klienditeenindus.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin Ene, e-poe Stiil klienditeenindus.', 'Aitäh teie kirja eest.', 'Jope saate tagastada kahe nädala jooksul.', 'Pange jope karpi ja viige postkontorisse.',
        'Tagastamine on tasuta.', 'Raha saate pangakontole viie päeva jooksul.',
      ], ['Klienditeenindaja nimi on [Ene].', 'Jope saab tagastada kahe [nädala] jooksul.', 'Jope tuleb viia [postkontorisse].', 'Tagastamine on [tasuta].', 'Raha tuleb viie [päeva] jooksul.']),
      B.planning('035_t_plan', 'Enne kirja.', 'Kirjuta märksõnad.', ['Mida sa ostsid ja millal?', 'Mis on valesti?', 'Mida sa soovid?'], 2),
      B.transformation('035_t_check', 'Kontrolli lauseid.', 'Kirjuta lause viisakalt (teie).', [
        ['Anna raha tagasi!', 'Kas ma saaksin …?', 'Kas ma saaksin raha tagasi?'], ['Saada uus jope!', 'Palun …', 'Palun saatke uus jope.'], ['Kas on suuremat?', 'Kas teil on …?', 'Kas teil on suuremat?'],
        ['Vasta mulle kiiresti!', 'Palun …', 'Palun vastake mulle kiiresti.'], ['Ütle, kus on postkontor!', 'Palun öelge, …', 'Palun öelge, kus on postkontor.'],
      ]),
      B.writing('035_t_write', 'Kirjutamine 3. Arvustus.', 'Kirjuta e-poe kohta 5–7 lauset: mida ostsid, mis juhtus, kas soovitad poodi.', [5, 7], ['ostsin', 'katki', 'soovitan'], 2),
      B.speaking('035_t_say', 'Rääkimine 1. Minu ostud.', 'Räägi umbes üks minut oma ostudest.', ['Kus sa ostad riideid ja toitu?', 'Mis oli sinu viimane suur ost?', 'Kas sa ostad kampaania ajal?', 'Kas sa oled midagi tagastanud?'], [60, 90]),
      B.rolecards('035_t_roles', 'Rääkimine 2. Poes.', 'Üks on klient, teine müüja. Lahendage ostuprobleem.', 'Oled klient. Su uued saapad on liiga kitsad. Kviitung on olemas. Palu laiemaid või raha tagasi. Küsi hinda.', 'Oled müüja. Laiemad saapad on 10 eurot kallimad. Küsi kviitungit ja paku lahendust.', ['Saapad on liiga kitsad.', 'Kas teil on laiemaid?', 'Kas ma saan raha tagasi?'], ['Kas teil on kviitung?', 'Need on 10 eurot kallimad.', 'Kas soovite vahetada?']),
      B.reading('035_t_reply', 'Lugemine. Poe vastus.', 'Loe e-poe kirja ja vasta küsimustele.', 'Tere!',
        'Aitäh, et kirjutasite. Meil on väga kahju, et jope tasku on katki. Teil on kaks võimalust. Esiteks võite jope vahetada suurema vastu. Suurus L on laos olemas, see maksab sama palju. Teiseks võite jope tagastada ja saada raha tagasi. Tagastamine on tasuta. Pange jope karpi ja viige see lähimasse postkontorisse. Kviitungit ei ole vaja, sest teie tellimus on meie arvutis. Raha tuleb pangakontole viie päeva jooksul. Kui teil on küsimusi, helistage meile tööpäeviti kella üheksast viieni. Vabandame ja ootame teid jälle! E-pood Stiil',
        [['Mis on jopel valesti?', 'tasku on katki|tasku'], ['Mis suurus on laos olemas?', 'L|suurus L'], ['Kui palju maksab suurem jope?', 'sama palju|sama hinnaga'], ['Kuhu tuleb jope viia?', 'postkontorisse|lähimasse postkontorisse'], ['Miks ei ole kviitungit vaja?', 'tellimus on arvutis|sest tellimus on nende arvutis']]),
      B.rubric('035_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti. Kokku 70% = kontroll on sooritatud.', ['Tagastuse vorm on täidetud.', 'Kirjas on probleem, soov ja viisakas lõpp (40–60 sõna).', 'Numbrid, hinnad ja vormid on õiged (vähemalt 80%).', 'Suuline vastus on arusaadav ja kestab umbes minuti.', 'Poes lahendab õpilane probleemi ilma abita.']),
      B.selfcheck('035_t_self', ['Ma täidan tagastuse vormi.', 'Ma kirjutan poele 40–60 sõna.', 'Ma räägin oma ostudest umbes minuti.', 'Ma lahendan poes probleemi.'], 'Moodul 7 on läbitud'),
    ],
  },
};
