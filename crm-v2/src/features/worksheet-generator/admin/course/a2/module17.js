// A2 course (A1 → A2 roadmap), module 17 „Plaanid, kokkulepped ja tulevik”, all five lessons a2-081…a2-085 (stage A2).
// All three phases: Avasta → Harjuta → Kasuta, each a whole lesson (40–55 min). 082 arranges and moves a meeting until
// the day, time and place are exact, 083 adds the simple condition „kui + olevik, siis …” to plans, 084 writes the
// confirming or changing message (40–70 words) that needs no follow-up question. Time phrases (kell kuus, alates
// kella kuuest) and place forms (kohviku ees, kinos) come back from the earlier modules. 081 says the future with the present
// and time markers (homme teen…, kavatsen + da); 085 is the module check in the Harno A2 form.
// Cast by docs/TEXTBOOK_ART_BIBLE.md §4 in the lessons added 2026-10-13 (Anna office, Markus warehouse, Liis teacher /
// official, Viktor pensioner, Sofia student, Jaan café owner; Oksana + Mia 6, Olga accountant, Kati, Igor as extras).
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-17', course: 'a2', title: 'Plaanid, kokkulepped ja tulevik', level: 'A2', design: 'v2', template: 'v3' };

export const LESSONS = {
  'a2-081': {
    title: 'Homme teen…',
    canDo: 'Ma räägin vähemalt 8 tulevasest tegevusest olevikuvormi ja selge ajamärgiga (homme, ülehomme, järgmisel nädalal, kuu pärast, varsti) ja ütlen, mida ma kavatsen teha.',
    template: 'v3',
    discover: [
      B.text('081_d_situation', 'Anna kalender', 'Anna elab Tallinnas alles kaks kuud. Järgmine nädal on tal väga kiire. Pühapäeva õhtul vaatab ta kalendrit ja kirjutab emale oma plaanidest.'),
      B.reading('081_d_read', 'Loe: Anna kiri emale.', 'Loe kirja ja vasta küsimustele.', 'Tere, ema!',
        'Tere, ema! Järgmine nädal on mul väga kiire. Esmaspäeval alustan tööl uue projektiga. Teisipäeva õhtul lähen esimest korda joogatrenni. Kolmapäeval tuleb mulle külla Kati, minu sõbranna. Ta õpib Tartus ja tal on Tallinnas eksam. Ta ööbib minu juures kaks ööd. Neljapäeval on töö juures koosolek. Pärast seda kavatseme kolleegidega kinno minna. Reedel töötan kodus. Laupäeval aitan naabrit Viktorit, sest ta kolib uude korterisse. Pühapäeval puhkan. Kuu pärast tulen sinu juurde Pärnusse. Järgmisel aastal kavatsen osta auto. Siis saan sind tihemini vaatama tulla. Varsti näeme! Anna',
        [['Mida teeb Anna esmaspäeval?', 'alustab tööl uue projektiga|alustab uue projektiga'], ['Kuhu läheb Anna teisipäeva õhtul?', 'joogatrenni|trenni'], ['Miks tuleb Kati Tallinnasse?', 'tal on eksam|eksamile'], ['Mida kavatsevad kolleegid pärast koosolekut teha?', 'kinno minna|minna kinno'], ['Miks Anna laupäeval Viktorit aitab?', 'Viktor kolib|ta kolib uude korterisse'], ['Millal tuleb Anna ema juurde?', 'kuu pärast'], ['Mida kavatseb Anna järgmisel aastal osta?', 'auto|autot'], ['Mida Anna reedel teeb?', 'töötab kodus']]),
      B.notice('081_d_notice', 'Märka: tulevik = olevik + ajasõna', ['**Homme lähen** ma tööle. (olevik + homme)', '**Järgmisel nädalal sõidan** Tartusse.', '**Kuu pärast tulen** sinu juurde. **Varsti** näeme!', 'Plaan: Ma **kavatsen** kinno **minna**. (kavatsema + da)', 'Ajasõna on ees → tegusõna on teisel kohal: **Homme lähen ma…**'], 'full'),
      B.table('081_d_week', 'Anna nädal.', 'Kirjuta tekstist, mida Anna teeb.', 'Päev, Plaan', [
        'esmaspäev | [alustab uue projektiga/uus projekt]', 'teisipäev | [läheb joogatrenni/jooga]', 'kolmapäev | [Kati tuleb külla/Kati tuleb]', 'neljapäev | [koosolek ja kino/koosolek]', 'reede | [töötab kodus]', 'laupäev | [aitab Viktorit/aitab naabrit]', 'pühapäev | [puhkab]', 'kuu pärast | [tuleb Pärnusse/sõidab ema juurde]'], 'g_read'),
      B.translation('081_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['В пятницу мы пойдём в музей.', 'В субботу утром мы пойдём на рынок.', 'В воскресенье мы поплывём на остров.', 'Скоро увидимся!', 'Что ты хочешь делать в воскресенье?', 'Послезавтра я иду к врачу.', 'В следующем году я собираюсь купить машину.', 'Позже я тебе напишу.']),
      B.transformation('081_d_trans', 'Eile → homme.', 'Kirjuta lause tulevikus antud sõnaga.', [
        ['Eile läksin kinno.', 'Homme …', 'Homme lähen ma kinno.|Homme lähen kinno.'], ['Eile töötasin kodus.', 'Homme …', 'Homme töötan ma kodus.|Homme töötan kodus.'],
        ['Eelmisel nädalal sõitsime Tartusse.', 'Järgmisel nädalal …', 'Järgmisel nädalal sõidame Tartusse.|Järgmisel nädalal sõidame me Tartusse.'], ['Eile tuli Sofia külla.', 'Ülehomme …', 'Ülehomme tuleb Sofia külla.'],
        ['Aasta tagasi õppisin soome keelt.', 'Järgmisel aastal …', 'Järgmisel aastal õpin ma soome keelt.|Järgmisel aastal õpin soome keelt.'], ['Eile õhtul vaatasin filmi.', 'Täna õhtul …', 'Täna õhtul vaatan ma filmi.|Täna õhtul vaatan filmi.'], ['Eile käisin poes.', 'Homme …', 'Homme käin ma poes.|Homme käin poes.'], ['Eelmisel aastal elasin Narvas.', 'Järgmisel aastal …', 'Järgmisel aastal elan ma Narvas.|Järgmisel aastal elan Narvas.']]),
      B.gaps('081_d_gaps', 'Millal?', 'Vali sõnapangast sobiv ajasõna. Üks sõna jääb üle.', [
        '[Homme] hommikul on mul koosolek.', 'Täna on esmaspäev, [ülehomme] on kolmapäev.', 'Ma ei saa praegu, ma helistan [hiljem|varsti].', 'Oota natuke, buss tuleb [varsti].', '[Järgmisel aastal] kavatsen ma Soome sõita.', 'Mida sa [täna õhtul] teed?', 'Laupäeval kolib Viktor, [homme] hakkab ta asju pakkima.', '[Eile] oli pühapäev ja ma puhkasin.',
      ], ['homme', 'ülehomme', 'hiljem', 'varsti', 'järgmisel aastal', 'täna õhtul', 'eile', 'eelmisel aastal']),
      B.speaking('081_d_say', 'Minu järgmine nädal.', 'Räägi paarilisele oma plaanidest.', ['Mida sa homme teed?', 'Mida sa ülehomme teed?', 'Mida sa nädalavahetusel plaanid?', 'Mida sa kuu pärast teed?', 'Mida sa järgmisel aastal kavatsed?'], [60, 90], ['Homme…', 'Järgmisel nädalal…', 'Ma kavatsen…']),
      B.writing('081_d_write', 'Minu plaanid.', 'Kirjuta 8–10 lauset: mida sa järgmisel nädalal teed.', [8, 10], ['homme', 'järgmisel nädalal', 'kavatsen', 'varsti'], 3),
    ],
    practice: [
      B.listening('081_p_listen', 'Kuulamine. Viktori plaanid.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Viktor. Ma olen pensionär, aga mul on palju plaane.', 'Homme hommikul lähen arsti juurde.', 'Ülehomme tuleb mulle külla minu lapselaps.', 'Laupäeval kolin uude korterisse. Anna ja Markus aitavad mind.',
        'Järgmisel nädalal hakkan käima eesti keele kursusel.', 'Kuu pärast sõidan laevaga Helsingisse.', 'Ja järgmisel aastal kavatsen õppida ujuma!',
      ], ['Homme läheb Viktor [arsti juurde|arsti].', 'Ülehomme tuleb külla tema [lapselaps].', 'Laupäeval [kolib] Viktor uude korterisse.', 'Teda aitavad Anna ja [Markus].', 'Kuu pärast sõidab ta [Helsingisse].', 'Järgmisel aastal kavatseb ta õppida [ujuma].', 'Viktor on [pensionär].', 'Järgmisel nädalal hakkab ta käima eesti keele [kursusel].']),
      B.cloze('081_p_cloze', 'Kati sõnum.', 'Vali igasse lünka sobiv sõna.', 'Tere, Anna!', [
        'Ma {*tulen|tulin|tulema} kolmapäeval kell kuus. Rong {*saabub|saabus|saabuma} Balti jaama.',
        '',
        'Neljapäeval {*on|oli|olema} mul eksam. Pärast eksamit {*kavatsen|kavatsesin|kavatseda} vanalinnas {*jalutada|jalutama|jalutan}.',
        '',
        'Reedel {*sõidan|sõitsin|sõitma} tagasi Tartusse. Kuu {*pärast|tagasi|eest} tulen uuesti. {*Varsti|Eile|Eelmisel nädalal} näeme! Kati',
      ], 'g_vocab'),
      B.formtext('081_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna olevikus. Tegevus on tulevikus.', 'Markuse plaanid', [
        'Homme [alustan] (alustama) ma uuel töökohal. Ülehomme [tuleb] (tulema) mulle külla vend.',
        '',
        'Järgmisel nädalal [sõidame] (sõitma) me perega Tartusse. Nädalavahetusel [aitan] (aitama) ma isa maal.',
        '',
        'Kuu pärast [algab] (algama) minu puhkus. Me [kavatseme] (kavatsema) Soome sõita ja seal palju [ujuda] (ujuma).',
        '',
        'Mida sina järgmisel nädalal [teed] (tegema)? Markus',
      ], 'g_notice'),
      B.gaps('081_p_gaps', 'Kirjuta olevikus.', 'Tegevus on tulevikus. Kirjuta tegusõna olevikus.', [
        'Homme [lähen] (minema) ma arsti juurde.', 'Ülehomme [tuleb] (tulema) Sofia külla.', 'Järgmisel nädalal [sõidame] (sõitma) me Tartusse.', 'Kuu pärast [algab] (algama) kursus.',
        'Täna õhtul [vaatavad] (vaatama) nad filmi.', 'Varsti [näeme] (nägema)!', 'Mida te homme [teete] (tegema)?', 'Kus te homme [kohtute] (kohtuma)?']),
      B.choice('081_p_choice', 'Millal see on?', 'Loe lauset. Vali, kas see on minevik, praegu või tulevik.', [
        ['Homme lähen ma tööle.', 'tulevik', 'minevik', 'praegu'], ['Eile läksin ma tööle.', 'minevik', 'tulevik', 'praegu'], ['Praegu ma töötan.', 'praegu', 'minevik', 'tulevik'],
        ['Järgmisel nädalal on mul puhkus.', 'tulevik', 'minevik', 'praegu'], ['Aasta tagasi elasin Narvas.', 'minevik', 'tulevik', 'praegu'], ['Kuu pärast kolin Tartusse.', 'tulevik', 'minevik', 'praegu'], ['Ülehomme on mul eksam.', 'tulevik', 'minevik', 'praegu'], ['Just nüüd sõidan bussiga.', 'praegu', 'minevik', 'tulevik']], 'full', 'g_notice'),
      B.errorfix('081_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Homme ma läksin kinno.', 'Homme lähen ma kinno.|Homme ma lähen kinno.'], ['Järgmisel nädalal me sõitsime Tartusse.', 'Järgmisel nädalal sõidame me Tartusse.|Järgmisel nädalal me sõidame Tartusse.'], ['Homme Sofia tuleb külla.', 'Homme tuleb Sofia külla.'], ['Ma kavatsen kinno minema.', 'Ma kavatsen kinno minna.'], ['Mida sa homme tegid?', 'Mida sa homme teed?'], ['Kuu pärast ma kolisin Tartusse.', 'Kuu pärast kolin ma Tartusse.|Kuu pärast ma kolin Tartusse.'], ['Neljapäeval ma tulin sulle bussijaama vastu.', 'Neljapäeval tulen ma sulle bussijaama vastu.|Neljapäeval tulen sulle bussijaama vastu.'], ['Reedel me lähme muuseumi.', 'Reedel läheme me muuseumi.|Reedel me läheme muuseumi.']]),
      B.translation('081_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Послезавтра ко мне придёт внук.', 'В субботу я переезжаю.', 'Через месяц я поеду в Хельсинки.', 'Что ты делаешь в выходные?', 'Я собираюсь учиться плавать.', 'Позже я позвоню.', 'Завтра я работаю дома.', 'На следующей неделе мы поедем в Тарту.']),
      B.dictation('081_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Homme lähen arsti juurde.', 'Laupäeval kolin uude korterisse.', 'Järgmisel nädalal algab kursus.', 'Kuu pärast sõidan Helsingisse.', 'Ma kavatsen ujuma õppida.', 'Homme lähen ma tööle.', 'Ülehomme tuleb Sofia külla.', 'Järgmisel nädalal on mul koosolek.']),
      B.speaking('081_p_say', 'Küsi plaane.', 'Küsi paarilisel tema plaanide kohta.', ['Mida sa homme teed?', 'Mida sa nädalavahetusel plaanid?', 'Mida sa järgmisel kuul teed?', 'Mida sa järgmisel aastal kavatsed?'], [60, 90]),
    ],
    transfer: [
      B.text('081_t_situation', 'Uus olukord', 'Sinu sõber Dmitri tuleb järgmisel nädalal esimest korda Tallinna. Ta on linnas neljapäevast pühapäevani. Ta küsib: „Mida me teeme?” Tee plaan ja saada see talle.'),
      B.notice('081_t_events', 'Tallinn järgmisel nädalal', ['Neljapäeval kell 19 — džässikontsert vanalinnas, 15 €', 'Reedel kell 10–18 — kunstimuuseum Kumu, õpilastele soodustus', 'Laupäeval kell 9–14 — talupäev Balti jaama turul', 'Laupäeval kell 20 — uus Eesti film kinos Sõprus', 'Pühapäeval — laevasõit Naissaarele, laev kell 11'], 'full', 'g_read'),
      B.listening('081_t_listen', 'Kuula Dmitri häälsõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Siin Dmitri.', 'Ma saabun neljapäeval kell kolm bussiga.', 'Reedel pean ma hommikul töötama, aga pärastlõunal olen vaba.', 'Ma tahan väga minna muuseumi ja merele.', 'Kontserte ma ei armasta.', 'Pühapäeval kell viis sõidan tagasi. Kirjuta mulle plaan!',
      ], ['Dmitri saabub [neljapäeval].', 'Ta tuleb [bussiga].', 'Reedel hommikul peab ta [töötama].', 'Dmitri tahab minna muuseumi ja [merele].', 'Dmitrile ei meeldi [kontserdid].', 'Tagasi sõidab ta pühapäeval kell [viis|5|17].', 'Reede pärastlõunal on Dmitri [vaba].', 'Dmitri palub, et sa kirjutad talle [plaani|plaan].']),
      B.dictation('081_t_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Neljapäeval tulen sulle vastu.', 'Reedel läheme muuseumi.', 'Laupäeval käime turul.', 'Pühapäeval sõidame laevaga.', 'Varsti näeme!', 'Kontserdile me ei lähe.', 'Kumu on avatud kella kuueni.', 'Laev väljub kell üksteist.']),
      B.rolecards('081_t_roles', 'Dmitri helistab.', 'A on Dmitri, B on võõrustaja. Siis vahetage.',
        'Oled Dmitri. Küsi plaani kohta: mis kell, kus, kui palju maksab. Ütle, mis sulle ei sobi.', 'Selgita plaani. Kui midagi ei sobi, paku muud.',
        ['Mida me reedel teeme?', 'Mis kell…?', 'Kahjuks mulle ei meeldi…'], ['Reedel läheme…', 'Kell … algab…', 'Siis võime hoopis…']),
      B.speaking('081_t_say', 'Räägi plaanist.', 'Räägi paarilisele, mida sa Dmitriga järgmisel nädalal teed.', ['Millal Dmitri tuleb?', 'Mida te reedel teete?', 'Mida te nädalavahetusel teete?', 'Millal ta tagasi sõidab?', 'Mis Dmitrile ei meeldi?', 'Mida sa talle kindlasti näitad?'], [60, 120]),
      B.letter('081_t_letter', 'Plaan Dmitrile.', 'Kirjuta Dmitrile 50–70 sõna: mida te igal päeval teete.', 'Tere, Dmitri!', 'Varsti näeme!', [50, 70]),
      B.rubric('081_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Plaanis on päev, kellaaeg ja tegevus.', 'Tulevik on olevikuga ja ajasõnaga (homme lähen, reedel läheme).', 'Ajasõna järel on tegusõna teisel kohal.', 'Plaan arvestab Dmitri soove.']),
      B.selfcheck('081_t_self', ['Ma leian kavast aja ja koha.', 'Ma saan aru sõbra soovidest.', 'Ma kirjutan sõbrale nädala plaani.', 'Ma selgitan plaani telefonis.'], 'Plaan on saadetud'),
    ],
  },

  'a2-082': {
    title: 'Saame kokku',
    canDo: 'Ma lepin sõbra või kolleegiga kokku kohtumise, pakun uue aja, kui aeg ei sobi, ja kinnitan lõpuks täpse päeva, kellaaja ja koha.',
    template: 'v3',
    discover: [
      B.notice('082_d_cal', 'Liisi nädal', ['E kell 17–19 trenn', 'T kell 9–17 tööl, õhtu vaba', 'K kell 18 hambaarst', 'N terve päev vaba', 'R kell 19 kino Annaga'], 'full', 'g_read'),
      B.choice('082_d_choice', 'Mida Liis vastab?', 'Vaata Liisi nädalat. Vali Liisi vastus.', [
        ['Markus: „Kas esmaspäeval kell kuus sobib?”', 'Kahjuks ei saa, mul on trenn.', 'Sobib, olen siis vaba.', 'Jah, lähme koos kinno.'],
        ['Jaan: „Kas teisipäeval kell seitse sobib?”', 'Sobib, õhtu on mul vaba.', 'Kahjuks ei saa, olen tööl.', 'Ei, mul on siis trenn.'],
        ['Sofia: „Saame kokku kolmapäeval kell kuus?”', 'Kahjuks ei saa, mul on hambaarst.', 'Sobib, mul on aega.', 'Jah, pärast kino.'],
        ['Viktor: „Millal sul aega on?”', 'Neljapäeval olen terve päeva vaba.', 'Reedel kell seitse olen vaba.', 'Esmaspäeval kell kuus olen vaba.'],
        ['Anna: „Kas reedel kell seitse kinos?”', 'Jah, sobib, näeme kinos!', 'Kahjuks olen siis tööl.', 'Ei, mul on siis hambaarst.'],
        ['Markus: „Kas teisipäeval kell kaks?”', 'Kahjuks ei saa, olen siis tööl.', 'Sobib, olen siis vaba.', 'Ei, mul on siis trenn.'], ['Jaan: „Kas neljapäeval kell kümme?”', 'Sobib, olen terve päeva vaba.', 'Kahjuks olen siis trennis.', 'Ei, mul on hambaarst.'], ['Anna: „Kas teisipäeva hommikul kell kümme?”', 'Kahjuks ei saa, olen tööl.', 'Sobib, olen vaba.', 'Ei, mul on trenn.']]),
      B.reading('082_d_read', 'Loe: Markus helistab.', 'Loe vestlust ja vasta küsimustele.', 'Korvpall', [
        'Markus: Tere, Andrei! Kas sa tahad sel nädalal korvpalli mängida?',
        'Andrei: Jah, väga! Millal sul aega on?',
        'Markus: Kas teisipäeva õhtu sobib? Näiteks kell seitse?',
        'Andrei: Kahjuks teisipäeval ei saa. Mul on eesti keele tund kella kaheksani.',
        'Markus: Aga kuidas oleks kolmapäeval?',
        'Andrei: Kolmapäeval olen vaba alates kella kuuest.',
        'Markus: Siis võime kohtuda kell pool seitse. Kas spordihallis või pargis?',
        'Andrei: Ilm on praegu külm. Parem spordihallis.',
        'Markus: Hästi. Spordihall on Kooli tänaval, maja number viis.',
        'Andrei: Ma tean seda kohta. Kas ma pean palli kaasa võtma?',
        'Markus: Ei pea, mul on pall olemas. Võta vett kaasa.',
        'Andrei: Selge. Kolmapäeval kell pool seitse spordihallis. Näeme!',
      ], [
        ['Miks teisipäev Andreile ei sobi?', 'tal on eesti keele tund|tal on tund|tund kella kaheksani'],
        ['Mis kellast on Andrei kolmapäeval vaba?', 'alates kella kuuest|kella kuuest|kuuest'],
        ['Mis kell nad lõpuks kohtuvad?', 'pool seitse|kell pool seitse|18.30'],
        ['Miks nad pargis ei mängi?', 'ilm on külm|on külm'],
        ['Kus spordihall asub?', 'Kooli tänaval|Kooli tänav 5|Kooli tänaval, maja number viis'],
        ['Mida peab Andrei kaasa võtma?', 'vett|vee|joogivett'], ['Mis päeval on Andreil eesti keele tund?', 'teisipäeval'], ['Kellel on pall olemas?', 'Markusel']]),
      B.notice('082_d_notice', 'Märka kokkuleppe samme.', ['1. Pakkumine: **Kas** teisipäeva õhtu **sobib**?', '2. Probleem: **Kahjuks** teisipäeval **ei saa**.', '3. Uus aeg: **Aga kuidas oleks** kolmapäeval?', '4. Koht: **Kas** spordihallis **või** pargis?', '5. Kinnitus: Kolmapäeval kell pool seitse spordihallis. **Näeme!**'], 'full'),
      B.wordorder('082_d_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', ['Kas teisipäeva õhtu sobib sulle?', 'Kahjuks on mul teisipäeval koosolek.', 'Kolmapäeval olen ma vaba alates kuuest.', 'Kohtume kell pool seitse spordihallis.', 'Kas ma pean palli kaasa võtma?', 'Kas sulle sobib reedel kell viis?', 'Kahjuks olen ma teisipäeval tööl.', 'Aga kuidas oleks järgmisel nädalal?']),
      B.errorfix('082_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Kas sina sobib reedel?', 'Kas sulle sobib reedel?|Kas reede sulle sobib?'], ['Kahjuks ma ei saan tulla.', 'Kahjuks ma ei saa tulla.'], ['Me kohtume kohvikus ees.', 'Me kohtume kohviku ees.'], ['Ma olen vaba kella viis.', 'Ma olen vaba alates kella viiest.|Ma olen vaba kella viiest.'], ['Mul ei ole aeg.', 'Mul ei ole aega.'], ['Saame kokku kell pool kuus kinos juures.', 'Saame kokku kell pool kuus kino juures.'], ['Ma ei saa tulla, sest mul on koosolekul.', 'Ma ei saa tulla, sest mul on koosolek.'], ['Aga kuidas oleks reede?', 'Aga kuidas oleks reedel?']]),
      B.translation('082_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Пятница подходит всем.', 'Кафе в пятницу закрыто.', 'Встречаемся в ресторане в половине седьмого.', 'Сообщи мне до завтра!', 'Давай встретимся у библиотеки.', 'Мне это подходит.', 'Я работаю до восьми.', 'Позвони мне вечером!']),
      B.speaking('082_d_say', 'Lepi kokku.', 'Lepi paarilisega kokku: päev, kell ja koht.', ['Millal sul aega on?', 'Kas … sobib?', 'Kus me kohtume?', 'Mis kell sulle sobib?', 'Mida me teeme?'], [45, 90], ['Kas … sobib?', 'Kahjuks ei saa.', 'Aga kuidas oleks…?', 'Näeme!']),
      B.writing('082_d_write', 'Sõnum sõbrale.', 'Kirjuta sõbrale 8–10 lauset: paku kaks aega ja koht.', [8, 10], ['sobib', 'kohtume', 'kell', 'või'], 3),
    ],
    practice: [
      B.dialogue('082_p_dialog', 'Täida vestlus.', 'Kirjuta lünka sobiv sõna.', 'Sofia', 'Jaan', [
        ['A', 'Tere, Jaan! Kas me saame sel nädalal [kokku]?'], ['B', 'Jah! Millal sul [aega] on?'], ['A', 'Kas neljapäeval kell viis [sobib]?'],
        ['B', '[Kahjuks] ei saa, mul on siis tööl koosolek.'], ['A', 'Aga kuidas [oleks] reedel kell kuus?'], ['B', 'Reede sobib. Kus me [kohtume]?'],
        ['A', 'Kesklinnas, raamatukogu ees.'], ['B', 'Hästi. Reedel kell kuus. [Näeme]!'],
      ]),
      B.cloze('082_p_cloze', 'Jaani sõnum.', 'Vali igasse lünka sobiv sõna.', 'Tere, Sofia!', [
        'Kas me {*saame|saime|saama} sel nädalal kokku? Kas neljapäev sulle {*sobib|sobis|sobima}?',
        '',
        '{*Kahjuks|Eile|Varsti} olen ma esmaspäeval ja teisipäeval tööl kuni kella {*seitsmeni|seitse|seitsmest}. Aga neljapäeval olen vaba alates kella {*viiest|viis|viieni}.',
        '',
        'Me võime kohtuda {*raamatukogu|raamatukogus|raamatukogule} ees. Kui see aeg ei sobi, siis {*helista|helistasin|helistama} mulle. {*Näeme|Nägime|Näha}! Jaan',
      ], 'g_vocab'),
      B.formtext('082_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Liisi sõnum', [
        'Tere, Anna! Kahjuks ma ei [saa] (saama) neljapäeval tulla, sest mul [on] (olema) trenn.',
        '',
        'Aga reedel olen ma vaba alates kella [viiest] (viis). Kas reede sulle [sobib] (sobima)?',
        '',
        'Me võime [kohtuda] (kohtuma) [kohviku] (kohvik) ees. Ma olen seal kuni kella [kaheksani] (kaheksa).',
        '',
        'Palun [kinnita] (kinnitama) homseks! Liis',
      ], 'g_notice'),
      B.listening('082_p_listen', 'Kuula: kolm häälsõnumit.', 'Õpetaja loeb sõnumid kaks korda. Kirjuta 1–2 sõna.', [
        'Sõnum üks. Tere, Anna! Siin Liis. Kahjuks ma ei saa homme kell kolm tulla. Mul on tööl koosolek. Kas kell viis sobib? Helista mulle!',
        'Sõnum kaks. Tere, Anna! Siin on Jaan. Meie kohtumine jääb samaks, neljapäeval kell kuus. Aga koht muutub. Me ei kohtu kohvikus, vaid raamatukogu ees. Näeme!',
        'Sõnum kolm. Tere! Siin on hambaarsti registratuur. Teie aeg on reedel kell kaheksa. Kahjuks on arst haige. Uus aeg on esmaspäeval kell üksteist. Kui see ei sobi, palun helistage meile.',
      ], [
        'Liis ei saa tulla, sest tal on [koosolek].', 'Liis pakub uueks ajaks kella [viis|viit|5|17].', 'Jaaniga kohtumine on neljapäeval kell [kuus|6|18].',
        'Jaan ja Anna kohtuvad raamatukogu [ees].', 'Reedel arsti juurde ei saa, sest arst on [haige].', 'Uus aeg arsti juures on [esmaspäeval].', 'Jaani sõnumis muutub kohtumise [koht].', 'Kui uus aeg ei sobi, tuleb registratuuri [helistada].']),
      B.choice('082_p_reply', 'Mida vastata?', 'Vali sobiv vastus.', [
        ['„Kas homme kell kaheksa hommikul sobib?” Sa magad siis veel.', 'See on mulle liiga vara.', 'See on mulle liiga hilja.', 'See on mulle liiga kaugel.'],
        ['„Kus me kohtume?”', 'Kino ees.', 'Kell kuus.', 'Reedel.'],
        ['„Millal sul aega on?”', 'Alates kella neljast.', 'Kohviku ees.', 'Jah, sobib.'],
        ['„Kas laupäev sobib?” Laupäeval oled maal.', 'Kahjuks ei saa, olen maal.', 'Sobib, olen maal.', 'Jah, näeme maal.'],
        ['„Kohtume siis reedel kell viis.”', 'Hästi, näeme!', 'Kus sa elad?', 'Mis kell on?'], ['„Kas sa saad homme tulla?” Homme oled tööl kuni kella üheksani.', 'Kahjuks ei saa, olen hilja tööl.', 'Jah, olen terve päeva vaba.', 'Sobib, olen kodus.'], ['„Mis kell sulle sobib?”', 'Pärast kella kuut.', 'Raamatukogu ees.', 'Jah, näeme.'], ['„Kas me võime kohtuda hiljem, kell seitse?”', 'Jah, kell seitse sobib ka.', 'Ei, ma olen kohvikus.', 'Reedel.']], 'full', 'g_use'),
      B.transformation('082_p_trans', 'Ütle viisakalt.', 'Kirjuta lause antud sõnadega.', [['Tule kell viis.', 'Kas … sobib?', 'Kas kell viis sobib?|Kas sulle sobib kell viis?'], ['Ma ei saa teisipäeval.', 'kahjuks', 'Kahjuks ma ei saa teisipäeval.|Kahjuks ei saa ma teisipäeval.'], ['Kohtume reedel.', 'Aga kuidas oleks …?', 'Aga kuidas oleks reedel?'], ['Mul on vaba aeg kuuest.', 'alates', 'Mul on aega alates kella kuuest.|Olen vaba alates kella kuuest.'], ['Kohtume hiljem.', 'võime', 'Võime kohtuda hiljem.|Me võime hiljem kohtuda.'], ['Kohtume kohvikus „Kask”.', 'restoran „Meri”', 'Kohtume restoranis „Meri”.'], ['Kohtume kell kuus.', 'pool seitse', 'Kohtume kell pool seitse.'], ['Kohtume neljapäeval.', 'reede', 'Kohtume reedel.']]),
      B.translation('082_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Когда у тебя есть время?', 'Это для меня слишком рано.', 'Встречаемся перед кино.', 'Я свободен с четырёх.', 'Можем встретиться позже.', 'Давай встретимся в пятницу.', 'Тебе подходит в шесть?', 'К сожалению, во вторник я не могу.']),
      B.dictation('082_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Millal sul aega on?', 'Kas neljapäev sobib?', 'Mul on siis koosolek.', 'Kohtume raamatukogu ees.', 'Uus aeg on esmaspäeval.', 'Helista mulle!', 'Kas kell kuus sobib?', 'Kahjuks ma ei saa.']),
      B.speaking('082_p_say', 'Minu nädal.', 'Räägi paarilisele oma järgmisest nädalast: millal oled vaba ja millal mitte.', ['Millal sul järgmisel nädalal aega on?', 'Mis päev sulle ei sobi ja miks?', 'Mis kell on sulle liiga vara või liiga hilja?', 'Kus sulle meeldib sõpradega kohtuda?'], [60, 90], ['Ma olen vaba alates…', 'Kahjuks … ei sobi, sest…', 'Mulle meeldib kohtuda…']),
    ],
    transfer: [
      B.text('082_t_situation', 'Uus olukord', 'Kursus lõpeb. Sa korraldad lõpuõhtu Annale, Jaanile ja Sofiale. Leia aeg, mis sobib kõigile, ja vali koht.'),
      B.reading('082_t_read', 'Loe: Sofia sõnum.', 'Loe sõnum ja vasta küsimustele.', 'Sofia vastab', [
        'Tere! Aitäh, et sa korraldad lõpuõhtu! Reede sobib mulle väga hästi. Kell pool seitse on ka hea aeg. Aga mul on üks küsimus koha kohta. Kohvik „Kask” on reedel kinni, sest seal on remont. Ma käisin seal eile. Kas me võime minna hoopis restorani „Meri”? See on sadama juures, Mere tänav 8. Seal on head kalatoidud ja hinnad ei ole kallid. Restoranis on ka lastenurk, nii et Anna võib poja kaasa võtta. Auto saab parkida maja ees. Kui sa tahad, siis ma helistan ja broneerin laua. Anna mulle teada homseks! Sofia',
      ], [
        ['Kas reede sobib Sofiale?', 'jah|sobib väga hästi'], ['Miks ei saa minna kohvikusse „Kask”?', 'kohvik on reedel kinni|seal on remont'],
        ['Mida Sofia pakub?', 'restorani „Meri”|restorani Meri|minna restorani'], ['Kus restoran asub?', 'sadama juures|Mere tänav 8'],
        ['Mida Sofia ise teha pakub?', 'helistab ja broneerib laua|broneerib laua'], ['Mis kell sobib Sofiale?', 'pool seitse|kell pool seitse'], ['Kes võib lapse kaasa võtta?', 'Anna'], ['Kus saab autot parkida?', 'maja ees']]),
      B.notice('082_t_cal', 'Kolm kalendrit', ['Anna: E ja K õhtul trenn, R vaba alates kella viiest.', 'Jaan: T õhtul tööl, R kuni kella kuueni tööl.', 'Sofia: N sünnipäev, R ja L vaba.', 'Laupäeval on Anna ja Jaan maal.'], 'full', 'g_read'),
      B.rolecards('082_t_roles', 'Telefonikõne Jaaniga.', 'Lepi Jaaniga lõpuõhtu kokku. Rääkige 2–3 minutit.',
        'Oled korraldaja. Paku reedet ja restorani „Meri”. Vasta Jaani küsimustele.', 'Oled Jaan. Oled reedel tööl kuueni. Küsi kella ja aadressi kohta.',
        ['Kas reedel kell … sobib?', 'Restoran on…', 'Näeme reedel!'], ['Ma olen kuni kella kuueni tööl.', 'Kus see restoran on?', 'Sobib!']),
      B.writing('082_t_write', 'Vastus Sofiale.', 'Vasta Sofiale 4–6 lausega: kas restoran sobib ja kes broneerib.', [4, 6], ['sobib', 'aitäh', 'kohtume', 'kell'], 3),
      B.speaking('082_t_say', 'Teata grupile.', 'Ütle grupile lõpuõhtu plaan 1 minutiga.', ['Mis päev ja kell?', 'Kus? Kuidas sinna saab?', 'Mida kaasa võtta?', 'Kes broneerib laua?', 'Mida teha, kui keegi ei saa tulla?'], [45, 90]),
      B.letter('082_t_letter', 'Sõnum kõigile.', 'Kirjuta grupile: päev, kell, koht, aadress ja palve (50–70 sõna).', 'Tere, Anna, Jaan ja Sofia!', 'Näeme reedel!', [50, 70]),
      B.rubric('082_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Sõnumis on päev, kell, koht ja aadress (50–70 sõna).', 'Valitud aeg sobib kõigile kolmele.', 'Telefonis pakub ja kinnitab kokkulepet viisakalt.', 'Alates/kuni ja koha vormid on õiged.']),
      B.selfcheck('082_t_self', ['Ma leian kalendritest aja, mis sobib kõigile.', 'Ma muudan plaani, kui koht on kinni.', 'Ma lepin telefonis kokku.', 'Ma saadan grupile täpse info.'], 'Lõpuõhtu on kokku lepitud'),
    ],
  },

  'a2-083': {
    title: 'Kui…, siis…',
    canDo: 'Ma ütlen oma plaanide kohta kuus lihtsat lauset mustriga „kui + olevik, siis …” (ilm, aeg, raha) ja teen nende põhjal otsuse.',
    template: 'v3',
    discover: [
      B.text('083_d_intro', 'Laupäeva plaan', 'Jaan küsib: „Mida me laupäeval teeme?” Liis vastab: „Kui ilm on ilus, siis läheme randa. Kui sajab vihma, siis vaatame kodus filmi. Kui Sofia tuleb ka, siis teeme pannkooke.”'),
      B.truefalse('083_d_tf', 'Mis on plaan?', 'Loe Liisi vastust. Õige või vale?', [
        ['Ilusa ilmaga lähevad nad randa.', true], ['Vihmaga lähevad nad kinno.', false], ['Kui sajab, vaatavad nad kodus filmi.', true],
        ['Pannkooke teevad nad igal juhul.', false], ['Liis räägib laupäeva plaanist.', true], ['Liis räägib Jaaniga.', true], ['Sofia tuleb kindlasti.', false], ['Kui Sofia tuleb, teevad nad pannkooke.', true]]),
      B.reading('083_d_read', 'Loe: Markuse nädalavahetus.', 'Loe tekst ja vasta küsimustele.', 'Kui…, siis…', [
        'Markus planeerib nädalavahetust. Laupäeva hommikul tahab ta minna kalale. Kalal käimine on tema lemmik hobi. Kui ilm on ilus, siis sõidab ta järve äärde. Kui sajab vihma, siis jääb ta koju ja parandab jalgratast.',
        'Laupäeva õhtul on tema sõbral Jaanil sünnipäev. Jaan elab teises linnaosas. Kui Markus jõuab õigel ajal koju, siis läheb ta peole. Kui ta jääb hiljaks, siis helistab ta Jaanile. Ta õnnitleb sõpra telefonis.',
        'Pühapäeval tahab Markus minna kinno. Kui piletid ei ole liiga kallid, siis võtab ta kaasa õe Kersti. Kui kinos ei ole head filmi, siis lähevad nad hoopis ujulasse. Markus teab, et plaanid võivad muutuda. Kui midagi ei õnnestu, siis ta ei muretse. Tema arvates on nädalavahetusel kõige tähtsam puhata. Pühapäeva õhtul läheb ta varakult magama, sest esmaspäeval algab töö kell seitse.',
      ], [
        ['Mida teeb Markus laupäeva hommikul, kui ilm on ilus?', 'sõidab järve äärde|läheb kalale|sõidab järve äärde kalale'],
        ['Mida teeb ta, kui sajab vihma?', 'jääb koju ja parandab jalgratast|parandab jalgratast|jääb koju'],
        ['Mis toimub laupäeva õhtul?', 'Jaani sünnipäev|Jaanil on sünnipäev'],
        ['Mida teeb Markus, kui ta jääb hiljaks?', 'helistab Jaanile|õnnitleb telefonis'],
        ['Millal võtab Markus Kersti kinno kaasa?', 'kui piletid ei ole kallid|kui piletid on odavad'],
        ['Miks ei muretse Markus, kui plaan muutub?', 'kõige tähtsam on puhata|tähtis on puhata'],
        ['Miks läheb Markus pühapäeval varakult magama?', 'esmaspäeval algab töö kell seitse|töö algab vara'], ['Kus elab Jaan?', 'teises linnaosas']]),
      B.notice('083_d_notice', 'Märka: kui … siis', ['**Kui** ilm **on** ilus, **siis sõidab** ta järve äärde.', '**Kui** sajab vihma, **siis jääb** ta koju.', 'Ta jääb koju, **kui** sajab vihma.', 'Kui-osa järel on **koma**.'], 'full'),
      B.transformation('083_d_trans', 'Ühenda laused.', 'Tee üks lause: Kui …, siis …', [['Sajab vihma. Me jääme koju.', 'Kui …, siis …', 'Kui sajab vihma, siis jääme koju.|Kui sajab vihma, siis me jääme koju.'], ['On palav. Ma lähen ujuma.', 'Kui …, siis …', 'Kui on palav, siis lähen ujuma.|Kui on palav, siis ma lähen ujuma.'], ['Buss hilineb. Ma võtan takso.', 'Kui …, siis …', 'Kui buss hilineb, siis võtan takso.|Kui buss hilineb, siis ma võtan takso.'], ['Sul on aega. Helista mulle.', 'Kui …, siis …', 'Kui sul on aega, siis helista mulle.'], ['Pood on kinni. Me läheme homme.', 'Kui …, siis …', 'Kui pood on kinni, siis läheme homme.|Kui pood on kinni, siis me läheme homme.'], ['Jään koju, kui sajab.', 'Kui …', 'Kui sajab, siis jään koju.|Kui sajab, jään koju.'], ['Helistan sulle, kui jõuan koju.', 'Kui …', 'Kui jõuan koju, siis helistan sulle.|Kui jõuan koju, helistan sulle.'], ['Me läheme randa, kui on palav.', 'Kui …', 'Kui on palav, siis läheme randa.|Kui on palav, siis me läheme randa.']]),
      B.wordorder('083_d_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', ['Kui ilm on ilus, siis läheme randa.', 'Kui sajab vihma, siis jään koju.', 'Kui sa oled väsinud, siis puhka.', 'Ma helistan sulle, kui ma jõuan koju.', 'Kui pilet on kallis, siis ma ei osta.', 'Kui on külm, siis panen mütsi pähe.', 'Kui tee on libe, siis sõidame bussiga.', 'Kui kinos ei ole head filmi, siis jääme koju.']),
      B.match('083_d_match', 'Kui ja siis.', 'Ühenda lause algus ja lõpp.', [
        ['Kui ma olen haige,', 'siis ma ei lähe tööle.'], ['Kui on palav,', 'siis läheme ujuma.'], ['Kui buss ei tule,', 'siis võtan takso.'],
        ['Kui mul on raha,', 'siis ostan uue telefoni.'], ['Kui pood on täna kinni,', 'siis lähen homme.'], ['Kui sa oled väsinud,', 'siis puhka natuke.'], ['Kui sa tuled varem,', 'siis sööme koos.'], ['Kui on külm,', 'siis pane müts pähe.']], 'full', 'g_notice'),
      B.speaking('083_d_say', 'Lõpeta lause.', 'Lõpeta laused suuliselt. Ütle ka, miks.', ['Kui homme on ilus ilm, siis…', 'Kui mul on vaba päev, siis…', 'Kui ma olen väsinud, siis…', 'Kui sajab vihma, siis…', 'Kui mul on palju raha, siis…'], [45, 90], ['Kui …, siis ma…', '…, sest…']),
      B.writing('083_d_write', 'Minu nädalavahetuse plaan.', 'Kirjuta 8–10 lauset. Vähemalt neli lauset kui-ga.', [8, 10], ['kui', 'siis', 'ilm', 'võib-olla'], 2),
    ],
    practice: [
      B.gaps('083_p_gaps', 'Kui + olevik.', 'Kirjuta sulgudes olev tegusõna olevikus.', [
        'Kui homme [sajab] (sadama) vihma, siis jääme koju.', 'Kui sa [tuled] (tulema) varem, siis sööme koos.', 'Kui mul [on] (olema) aega, siis helistan sulle.',
        'Kui me [jõuame] (jõudma) õigel ajal, siis läheme kinno.', 'Kui lapsed [magavad] (magama), siis loen raamatut.', 'Kui te [soovite] (soovima), siis võime kohtuda pargis.', 'Kui pood [on] (olema) kinni, siis lähen homme.', 'Kui sa [oled] (olema) näljane, siis söö.']),
      B.cloze('083_p_cloze', 'Sofia sõnum.', 'Vali igasse lünka sobiv sõna.', 'Tere, Anna!', [
        'Kui homme {*sajab|sadas|sadama} vihma, siis ma rattaga ei {*sõida|sõidan|sõitma}.',
        '',
        '{*Kui|Siis|Sest} buss tuleb õigel ajal, {*siis|kui|aga} jõuan tööle kell kaheksa. Õhtul, kui ma {*jõuan|jõudsin|jõudma} koju, helistan sulle.',
        '',
        'Kui sul {*on|oled|olema} aega, siis tule külla. Kui sa oled {*väsinud|väsima|väsin}, siis kohtume {*pühapäeval|pühapäev|pühapäevale}. Sofia',
      ], 'g_vocab'),
      B.formtext('083_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna olevikus.', 'Viktori nädalavahetus', [
        'Kui homme [paistab] (paistma) päike, siis [lähen] (minema) ma kalale.',
        '',
        'Kui [sajab] (sadama) vihma, siis [jään] (jääma) ma koju ja loen raamatut.',
        '',
        'Kui lapselaps [tuleb] (tulema) külla, siis [küpsetame] (küpsetama) me koos kooki.',
        '',
        'Kui te [tahate] (tahtma), siis [tulge] (tulema) ka! Viktor',
      ], 'g_notice'),
      B.choice('083_p_choice', 'Vali õige vorm.', 'Vali lausesse sobiv sõna või vorm.', [
        ['Kui homme … ilus ilm, siis läheme randa.', 'on', 'oli', 'olema'],
        ['Kui sa … väsinud, siis puhka.', 'oled', 'olid', 'olla'],
        ['Kui buss ei …, siis kõnnime.', 'tule', 'tulnud', 'tuleb'],
        ['Kui ma palga …, siis ostan pileti.', 'saan', 'sain', 'saama'],
        ['Kui sajab, … jääme koju.', 'siis', 'sest', 'aga'],
        ['Jääme koju, … sajab vihma.', 'kui', 'siis', 'ja'], ['Kui te … vabad, siis tulge külla.', 'olete', 'olite', 'olla'], ['Ma ei tule, … mul ei ole aega.', 'kui', 'siis', 'ja']], 'full', 'g_notice'),
      B.reading('083_p_read', 'Loe: Anna plaan.', 'Loe tekst ja vasta küsimustele.', 'Ilmateade ja plaan', [
        'Ilmateade ütleb, et laupäeva hommikul on päikseline ilm. Pärastlõunal tuleb tugev tuul ja võib sadada vihma. Pühapäeval on külm, aga kuiv. Teed võivad olla libedad. Anna teeb nädalavahetuseks plaani.',
        'Kui laupäeva hommik on päikseline, siis sõidab ta lastega rattaga. Kui pärastlõunal sajab, siis lähevad nad kinno. Kui kinos ei ole lastefilmi, siis mängivad nad kodus lauamänge. Pühapäeval tahab Anna sõita vanaema juurde maale. Kui on külm, siis paneb ta lastele soojad riided selga. Kui tee on libe, siis sõidavad nad bussiga, mitte autoga.',
      ], [
        ['Milline ilm on laupäeva hommikul?', 'päikseline|ilus'], ['Mida teeb pere, kui pärastlõunal sajab?', 'lähevad kinno'],
        ['Mida teevad nad, kui kinos ei ole lastefilmi?', 'mängivad kodus lauamänge|mängivad lauamänge'],
        ['Miks paneb Anna pühapäeval lastele soojad riided?', 'on külm|pühapäeval on külm'], ['Millal sõidavad nad bussiga?', 'kui tee on libe'], ['Milline ilm on pühapäeval?', 'külm, aga kuiv|külm|kuiv'], ['Kuhu tahab Anna pühapäeval sõita?', 'vanaema juurde|maale|vanaema juurde maale'], ['Millal võib sadada vihma?', 'laupäeva pärastlõunal|pärastlõunal']]),
      B.errorfix('083_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Kui ilm on ilus, siis me läheb randa.', 'Kui ilm on ilus, siis me läheme randa.'], ['Kui ma olen aega, siis tulen.', 'Kui mul on aega, siis tulen.'], ['Kui homme sadas vihma, siis jääme koju.', 'Kui homme sajab vihma, siis jääme koju.'], ['Kui buss ei tuleb, siis võtan takso.', 'Kui buss ei tule, siis võtan takso.'], ['Kui mul on aega, siis ma lugema raamatut.', 'Kui mul on aega, siis ma loen raamatut.'], ['Kui laupäeval sajab, siis läheme pühapäev.', 'Kui laupäeval sajab, siis läheme pühapäeval.'], ['Kui pühapäev on ilus ilm, siis matkame.', 'Kui pühapäeval on ilus ilm, siis matkame.'], ['Kui sa ei saab tulla, siis helista.', 'Kui sa ei saa tulla, siis helista.']]),
      B.translation('083_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Если завтра будет дождь, мы останемся дома.', 'Если у меня будет время, я позвоню.', 'Если холодно, надень шапку.', 'Я приду, если успею.', 'Если билет дорогой, я его не куплю.', 'Если погода хорошая, мы идём на пляж.', 'Если идёт дождь, я остаюсь дома.', 'Если у тебя есть время, позвони.']),
      B.dictation('083_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kui on päikseline, sõidame rattaga.', 'Kui sajab, läheme kinno.', 'Kui on külm, pane müts pähe.', 'Kui tee on libe, sõidame bussiga.', 'Ma tulen, kui mul on aega.', 'Kui ilm on ilus, siis läheme randa.', 'Kui sajab, siis jään koju.', 'Kui sul on aega, siis helista.']),
      B.speaking('083_p_say', 'Kaardimäng.', 'A loeb oma kui-kaardi, B vastab. Siis vahetage.', ['Kui homme on ilus ilm, mida sa teed?', 'Kui buss ei tule, mida sa teed?', 'Kui sõber jääb haigeks, mida sa teed?', 'Kui sul on palju raha, mida sa teed?', 'Kui sa oled haige, mida sa teed?'], [45, 90], ['Kui …, siis ma…', 'Võib-olla…']),
    ],
    transfer: [
      B.text('083_t_situation', 'Uus olukord', 'Kursus läheb nädalavahetusel Lahemaale matkama. Sina oled korraldaja. Kuula ilmateadet ja tee plaan A ja plaan B.'),
      B.listening('083_t_listen', 'Kuula: ilmateade.', 'Õpetaja loeb ilmateate kaks korda. Kirjuta 1–2 sõna.', [
        'Head kuulajad, nüüd ilmateade nädalavahetuseks.',
        'Laupäeva hommikul on Põhja-Eestis pilves, aga kuiv. Sooja on kümme kraadi. Kella kahest hakkab sadama vihma. Vihm on tugev ja kestab õhtuni. Rannas puhub tugev tuul.',
        'Pühapäeval on ilm parem. Päike paistab terve päeva ja sooja on viisteist kraadi. Tuul on nõrk. Metsas võib pärast vihma olla märg. Võtke kaasa kummikud! Head nädalavahetust!',
      ], [
        'Laupäeva hommikul on ilm pilves, aga [kuiv].', 'Laupäeval on sooja [kümme|10] kraadi.', 'Vihm hakkab laupäeval kell [kaks|2|14].',
        'Rannas on laupäeval tugev [tuul].', 'Pühapäeval on sooja [viisteist|15] kraadi.', 'Metsa tuleb kaasa võtta [kummikud].', 'Pühapäeval on tuul [nõrk].', 'Laupäeval kestab vihm [õhtuni].']),
      B.gaps('083_t_gaps', 'Plaan A ja plaan B.', 'Kirjuta sulgudes olev tegusõna olevikus.', [
        'Kui laupäeval [sajab] (sadama), siis läheme pühapäeval.', 'Kui pühapäeval [paistab] (paistma) päike, siis matkame rabas.', 'Kui mets [on] (olema) märg, siis paneme kummikud jalga.',
        'Kui keegi [jääb] (jääma) haigeks, siis ta helistab mulle.', 'Kui buss [hilineb] (hilinema), siis ootame jaamas.', 'Kui me [jõuame] (jõudma) varem, siis sööme rannas.', 'Kui sa [tahad] (tahtma), siis võta kaasa termos.', 'Kui me [eksime] (eksima) metsas ära, siis helistame Jaanile.']),
      B.rolecards('083_t_roles', 'Laupäev või pühapäev?', 'Arutage plaani 2–3 minutit ja otsustage.',
        'Sa tahad minna laupäeval. Ütle, mida teha, kui sajab.', 'Sa tahad minna pühapäeval. Räägi ilmateatest ja põhjenda.',
        ['Kui hommikul on kuiv, siis…', 'Kui hakkab sadama, siis…'], ['Pühapäeval paistab päike.', 'Kui laupäeval sajab, siis…']),
      B.speaking('083_t_say', 'Esitle plaani.', 'Tutvusta grupile plaani A ja plaani B 1–2 minutiga.', ['Mis päeval ja kuhu läheme?', 'Mis siis, kui sajab?', 'Mida kaasa võtta?', 'Mis kell ja kus kohtume?', 'Mis siis, kui keegi ei saa tulla?'], [60, 120], ['Kui …, siis…', 'Plaan B on…']),
      B.letter('083_t_letter', 'Sõnum grupile.', 'Kirjuta grupile matka plaan: kui ilm on hea ja kui sajab (50–70 sõna).', 'Tere, kallid kursusekaaslased!', 'Kohtumiseni!', [50, 70]),
      B.writing('083_t_write', 'Minu plaanid.', 'Kirjuta 5–7 lauset: mida sa teed järgmisel nädalal, kui…', [5, 7], ['kui', 'siis', 'võib-olla'], 2),
      B.rubric('083_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Sõnumis on plaan A ja plaan B (kui…, siis…), 50–70 sõna.', 'Kui-osas on olevik ja koma on õigel kohal.', 'Plaan arvestab ilmateadet.', 'Arutelus põhjendab ja otsustab koos paarilisega.']),
      B.selfcheck('083_t_self', ['Ma saan aru ilmateatest.', 'Ma teen plaani A ja plaani B.', 'Ma arutan ja otsustan paarilisega.', 'Ma kirjutan grupile plaani.'], 'Matk on plaanitud'),
    ],
  },

  'a2-084': {
    title: 'Kokkuleppe kinnitamine',
    canDo: 'Ma kirjutan 40–70-sõnalise sõnumi, millega kinnitan või muudan kokkulepet, ja annan kogu vajaliku info: päev, kell, koht, aadress ja mida kaasa võtta.',
    template: 'v3',
    discover: [
      B.text('084_d_intro', 'Kaks sõnumit', 'Sofia saab kaks sõnumit. Esimene: „Kohtume homme!” Teine: „Tere, Sofia! Kinnitan: kohtume homme, neljapäeval, kell 18 kohvikus „Mokka”, Rüütli 12. Anna teada, kui jääd hiljaks. Jaan”'),
      B.reading('084_d_read', 'Loe kolme sõnumit.', 'Loe sõnumid. Vasta tähega (A, B, C) või lühidalt.', 'Kolm sõnumit', [
        'A. Tere, Markus! Kinnitan meie kohtumise. Ootan sind esmaspäeval kell kümme kontoris. Aadress on Pärnu maantee 15, teine korrus. Palun võta kaasa pass. Kui jääd hiljaks, anna teada. Toomas',
        '',
        'B. Kallis Anna! Kahjuks laupäev mulle ei sobi, sest mu poeg on haige. Kas pühapäev kell kaks sobib? Kohtume samas kohas, kohvikus „Kask”. Kirjuta, kas see aeg sobib. Liis',
        '',
        'C. Hei, Jaan! Muutus: trenn ei ole täna spordihallis, vaid staadionil. Aeg on sama, kell kuus. Võta kaasa vesi ja soojad riided. Näeme! Treener Sofia',
      ], [
        ['Milline sõnum kinnitab kohtumist?', 'A'], ['Milline sõnum muudab aega?', 'B'], ['Milline sõnum muudab kohta?', 'C'],
        ['Mida peab Markus kaasa võtma?', 'pass|passi'], ['Miks laupäev Liisile ei sobi?', 'poeg on haige|tema poeg on haige'], ['Mis kell on Jaani trenn?', 'kuus|kell kuus|18'], ['Kus on Toomase kontor?', 'Pärnu maantee 15|teisel korrusel'], ['Mida peab Jaan trenni kaasa võtma?', 'vett ja soojad riided|vesi ja soojad riided|vett']]),
      B.notice('084_d_notice', 'Märka sõnumi osi.', ['1. Tervitus: **Tere, Markus! / Kallis Anna!**', '2. Mis on uut? **Kinnitan… / Kahjuks … ei sobi, sest…**', '3. Info: **päev + kell + koht (+ aadress)**', '4. Palve: **Võta kaasa… / Anna teada, kui…**', '5. Lõpp: **Näeme! / Ootan vastust.** + nimi'], 'full'),
      B.choice('084_d_missing', 'Mis info puudub?', 'Loe sõnumit. Mida adressaat veel ei tea?', [
        ['„Kohtume reedel kohviku ees.”', 'kellaaeg', 'päev', 'koht'],
        ['„Tule kell viis minu juurde!” (Sõber ei tea sinu aadressi.)', 'aadress', 'kellaaeg', 'päev'],
        ['„Trenn on homme spordihallis.”', 'kellaaeg', 'koht', 'päev'],
        ['„Ootan sind kell kuus kino ees.”', 'päev', 'koht', 'kellaaeg'],
        ['„Esmaspäeval kell kümme, Kooli 5.” (Majas on viis korrust.)', 'korrus', 'tänav', 'kellaaeg'], ['„Tule homme kell seitse!”', 'koht', 'päev', 'kellaaeg'], ['„Koosolek on kontoris kell kümme.”', 'päev', 'koht', 'kellaaeg'], ['„Kohtume teisipäeval kell kaks.”', 'koht', 'päev', 'kellaaeg']]),
      B.errorfix('084_d_fix2', 'Paranda Jaani vastus.', 'Kirjuta lause õigesti.', [
        ['Ma tulen laupäev kell kaks.', 'Ma tulen laupäeval kell kaks.'], ['Kahjuks ma ei saa hommikul tulema.', 'Kahjuks ma ei saa hommikul tulla.'],
        ['Ma tulen otse uus korterisse.', 'Ma tulen otse uude korterisse.'], ['Ma ei tea teie uus aadress.', 'Ma ei tea teie uut aadressi.'],
        ['Ma võtan kaasa minu vend.', 'Ma võtan kaasa oma venna.|Ma võtan oma venna kaasa.'], ['Kohtume kino ees kell kuus õhtu.', 'Kohtume kino ees kell kuus õhtul.'], ['Palun anna teada reede.', 'Palun anna teada reedeks.'], ['Kontor on Pärnu maantee 15, kolmas korrus.', 'Kontor on Pärnu maantee 15, kolmandal korrusel.']]),
      B.errorfix('084_d_fix', 'Paranda sõnumi viga.', 'Kirjuta lause õigesti.', [['Kohtume reedel kell kuus kohvik.', 'Kohtume reedel kell kuus kohvikus.'], ['Anna mulle teadma, kui jääd hiljaks.', 'Anna mulle teada, kui jääd hiljaks.'], ['Kahjuks reede ei sobib mulle.', 'Kahjuks reede ei sobi mulle.|Kahjuks ei sobi reede mulle.'], ['Ma ootan sinu vastus.', 'Ma ootan sinu vastust.'], ['Palun võta kaasas pass.', 'Palun võta pass kaasa.|Palun võta kaasa pass.'], ['Kinnitan meie kohtumine.', 'Kinnitan meie kohtumise.|Kinnitan meie kohtumist.'], ['Kohtume esmaspäev kell kümme.', 'Kohtume esmaspäeval kell kümme.'], ['Kontor on teine korrus.', 'Kontor on teisel korrusel.']]),
      B.wordorder('084_d_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', ['Kinnitan meie kohtumise esmaspäeval kell kümme.', 'Kahjuks laupäev mulle ei sobi.', 'Palun võta kaasa soojad riided.', 'Anna teada, kui sa jääd hiljaks.', 'Kontor on teisel korrusel.', 'Kas pühapäev kell kaks sobib sulle?', 'Me ei kohtu kohvikus, vaid kino ees.', 'Palun anna mulle reedeks teada.']),
      B.letter('084_d_letter', 'Kirjuta kinnitus.', 'Kinnita Liisile kohtumine: päev, kell, koht, palve.', 'Tere, Liis!', 'Näeme!', [50, 70]),
      B.speaking('084_d_say', 'Loe ja kontrolli.', 'Loe oma sõnum paarilisele. Paariline ütleb, mis info puudub.', ['Mis päev?', 'Mis kell?', 'Kus?', 'Mida kaasa võtta?', 'Kellele sõnum on?', 'Mida sõber peab vastama?'], [45, 90]),
    ],
    practice: [
      B.cloze('084_p_cloze', 'Liisi vastus.', 'Vali igasse lünka sobiv sõna.', 'Tere, Viktor!', [
        'Aitäh kutse eest! Kahjuks laupäev mulle {*ei sobi|ei sobib|ei sobinud}, sest mul on {*tööl|tööle|töölt} koosolek.',
        'Kas pühapäev {*sobib|sobi|sobima} sulle? Võime kohtuda kell kaks {*kohviku|kohvik|kohvikus} ees.',
        'Kui sul ei ole {*aega|aeg|ajal}, siis anna mulle {*teada|teadma|teab}. Ma võtan {*kaasa|kaasas|kaasast} sinu raamatu.',
        'Ootan sinu {*vastust|vastus|vastusest}!',
        '',
        'Liis',
      ]),
      B.formtext('084_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Toomase sõnum', [
        'Tere, Markus! [Kinnitan] (kinnitama) meie kohtumise [esmaspäeval] (esmaspäev) kell kümme.',
        '',
        'Kontor on Pärnu maanteel, [teisel] (teine) [korrusel] (korrus). Palun [võta] (võtma) kaasa pass.',
        '',
        'Kui sa [jääd] (jääma) hiljaks, siis anna mulle [teada] (teadma).',
        '',
        'Ootan sinu [vastust] (vastus)! Toomas',
      ], 'g_notice'),
      B.choice('084_p_choice', 'Kinnitus või muutus?', 'Mida sõnum teeb? Vali õige vastus.', [
        ['„Jah, kolmapäeval kell kuus sobib. Näeme!”', 'kinnitab', 'muudab aega', 'muudab kohta'],
        ['„Kahjuks kell kuus ei saa. Kas kell seitse sobib?”', 'muudab aega', 'kinnitab', 'muudab kohta'],
        ['„Aeg on sama, aga kohtume kino ees, mitte kohvikus.”', 'muudab kohta', 'muudab aega', 'kinnitab'],
        ['„Kinnitan: reedel kell kaks, Kooli 5.”', 'kinnitab', 'muudab kohta', 'muudab aega'],
        ['„Koosolek ei ole esmaspäeval, vaid teisipäeval.”', 'muudab päeva', 'muudab kohta', 'kinnitab'], ['„Kohtume ikka kell viis, nagu leppisime.”', 'kinnitab', 'muudab aega', 'muudab kohta'], ['„Trenn ei ole staadionil, vaid spordihallis.”', 'muudab kohta', 'muudab aega', 'kinnitab'], ['„Kas kella kahe asemel sobib kell kolm?”', 'muudab aega', 'muudab kohta', 'kinnitab']], 'full', 'g_read'),
      B.gaps('084_p_gaps', 'Sõnumi sõnad.', 'Kirjuta sobiv sõna. Kaks sõna jääb üle.', [
        'Kahjuks kolmapäev mulle ei [sobi].', 'Kas reede [sobib] sulle?', '[Kinnitan] meie kohtumise.', 'Palun anna mulle [teada], kas tuled.',
        'Võta [kaasa] vihmavari.', 'Kontori [aadress] on Kooli 5.', '[Ootan] sinu vastust!', 'Kontor on teisel [korrusel].',
      ], ['sobi', 'sobib', 'kinnitan', 'teada', 'kaasa', 'aadress', 'ootan', 'sobima', 'teadma', 'korrusel']),
      B.transformation('084_p_trans', 'Kirjuta sõnumisse.', 'Kirjuta lause antud sõnadega.', [
        ['Reede sobib mulle.', 'kahjuks', 'Kahjuks reede mulle ei sobi.|Kahjuks reede ei sobi mulle.'],
        ['Ma tulen kell viis.', 'kinnitan, et', 'Kinnitan, et tulen kell viis.'],
        ['Kas sa tuled?', 'anna teada', 'Anna teada, kas sa tuled.|Anna teada, kas tuled.'],
        ['Võta pass.', 'palun … kaasa', 'Palun võta pass kaasa.|Palun võta kaasa pass.'],
        ['Kohtume kell kuus.', 'kella kuue asemel kell seitse', 'Kohtume kella kuue asemel kell seitse.'], ['Kohtume kohvikus.', 'mitte …, vaid kino ees', 'Kohtume mitte kohvikus, vaid kino ees.'], ['Ma jään hiljaks.', 'annan teada, kui', 'Annan teada, kui jään hiljaks.|Ma annan teada, kui jään hiljaks.'], ['Laupäev ei sobi.', 'Kas pühapäev …?', 'Kas pühapäev sobib?|Kas pühapäev sulle sobib?|Kas pühapäev sobib sulle?']]),
      B.translation('084_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Время то же, но место меняется.', 'Встречаемся не в кафе, а у кино.', 'Сообщи мне до пятницы.', 'Жду тебя на втором этаже.', 'Подтверждаю: в пятницу в два.', 'Подтверждаю нашу встречу.', 'К сожалению, суббота мне не подходит.', 'Офис на втором этаже.']),
      B.dictation('084_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kahjuks laupäev ei sobi.', 'Kas pühapäev sobib sulle?', 'Kohtume kohviku ees.', 'Anna mulle teada.', 'Ootan sinu vastust!', 'Kinnitan meie kohtumise.', 'Kohtume esmaspäeval kell kümme.', 'Aadress on Pärnu maantee 15.']),
      B.speaking('084_p_say', 'Telefonis.', 'Helista sõbrale ja muuda kohtumise aega. Siis kinnitage.', ['Miks aeg ei sobi?', 'Mis on uus aeg?', 'Kas koht jääb samaks?', 'Mida sõber peab kaasa võtma?', 'Kuidas sa kokkulepet kinnitad?'], [45, 90], ['Kahjuks…, sest…', 'Kas … sobib?', 'Kinnitan…']),
      B.letter('084_p_letter', 'Muuda kokkulepet.', 'Kohtumine on homme. Muuda aega: miks, uus aeg, koht, palve.', 'Tere, Anna!', 'Vabandust ja kohtumiseni!', [40, 60]),
    ],
    transfer: [
      B.text('084_t_situation', 'Uus olukord', 'Sinu sõber Viktor kolib. Ta saatis sõpradele sõnumi. Sa saad aidata, aga ainult pärastlõunal. Vasta Viktorile nii, et ta ei pea midagi uuesti küsima.'),
      B.reading('084_t_read', 'Loe Viktori sõnumit.', 'Loe sõnum ja vasta küsimustele.', 'Kolimine', [
        'Tere, sõbrad! Ma kolin laupäeval, 12. oktoobril, uude korterisse. Kas te saate mind aidata? Alustame kell üheksa hommikul vanas korteris, Kase tänav 4. Auto tuleb kell kümme ja seda tuleb kiiresti laadida. Uus korter on Tamme tee 21, viiendal korrusel. Kahjuks ei ole majas lifti! Palun võtke kaasa töökindad. Lõunaks teen pitsat ja õhtul on saun. Kui te saate tulla ainult pärastlõunal, siis tulge otse uude korterisse. Palun andke reedeks teada, kas tulete ja mis kell. Kui teil on küsimusi, helistage mulle õhtul. Aitäh, sõbrad! Viktor',
      ], [
        ['Millal Viktor kolib?', 'laupäeval|12. oktoobril|laupäeval, 12. oktoobril'], ['Kus töö hommikul algab?', 'vanas korteris|Kase tänav 4|Kase tänaval'],
        ['Miks on töö raske?', 'majas ei ole lifti|lifti ei ole'], ['Kuhu peab minema, kui saad tulla pärastlõunal?', 'uude korterisse|otse uude korterisse|Tamme tee 21'],
        ['Mida peab Viktorile reedeks teatama?', 'kas tuled ja mis kell|kas tuled|mis kell tuled'], ['Mis kell tuleb auto?', 'kell kümme|kümme|10'], ['Mida Viktor lõunaks teeb?', 'pitsat|pitsa'], ['Mis on õhtul?', 'saun']]),
      B.choice('084_t_choice', 'Mida Viktor peab teadma?', 'Vali, mis on sinu vastuses kõige tähtsam.', [
        ['Sa saad tulla ainult pärastlõunal. Mida kirjutad?', 'Tulen kell kaks uude korterisse.', 'Tulen kell üheksa vanasse korterisse.', 'Ma ei tule laupäeval.'],
        ['Sul ei ole töökindaid. Mida küsid?', 'Kas sul on mulle kindaid?', 'Kas sul on lift?', 'Kas auto tuleb kell kümme?'],
        ['Sa tuled koos õega. Mida kirjutad?', 'Mu õde tuleb ka appi.', 'Mu õde elab Tamme teel.', 'Mu õde ei söö pitsat.'],
        ['Sa ei leia uut maja. Mida küsid?', 'Mis on maja number?', 'Mis on sauna number?', 'Mis kell on lõuna?'],
        ['Sa pead kell kuus lahkuma. Mida kirjutad?', 'Kahjuks pean kell kuus ära minema.', 'Kahjuks tulen kell kuus.', 'Saunas olen kell kuus.'], ['Sa ei saa üldse tulla. Mida kirjutad?', 'Kahjuks ma ei saa laupäeval tulla.', 'Tulen kell üheksa.', 'Mul on töökindad.'], ['Sa tuled autoga. Mida küsid?', 'Kas maja ees saab parkida?', 'Kas majas on lift?', 'Kas saun on soe?'], ['Sa jääd pool tundi hiljaks. Mida kirjutad?', 'Vabandust, jõuan alles pool kolm.', 'Vabandust, ma ei tule.', 'Tulen kell üheksa.']], 'full', 'g_use'),
      B.gaps('084_t_gaps', 'Vastus Viktorile.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma saan tulla alles [pärastlõunal] (pärastlõuna).', 'Tulen otse [uude] (uus) korterisse.', 'Olen seal [kella] (kell) kahest kuni kuueni.',
        'Kahjuks [pean] (pidama) kell kuus lahkuma.', 'Mul ei ole [töökindaid] (töökindad).', 'Kas sa saad mulle [kindad|kindaid] (kindad) anda?', 'Ma võtan kaasa oma [venna] (vend).', 'Ma tulen [autoga] (auto).']),
      B.letter('084_t_letter', 'Vastus Viktorile.', 'Kirjuta 40–60 sõna: kas tuled, mis kell, kuhu, küsimus.', 'Tere, Viktor!', 'Näeme laupäeval!', [40, 60]),
      B.rolecards('084_t_roles', 'Viktor helistab.', 'Viktor helistab ja täpsustab. Rääkige 2 minutit.',
        'Oled Viktor. Küsi, mis kell sõber tuleb ja kas ta toob kindad.', 'Oled sõber. Kinnita aeg, koht ja ütle, kes tuleb kaasa.',
        ['Mis kell sa tuled?', 'Kas sa tead aadressi?', 'Kas sa võtad kindad?'], ['Tulen kell…', 'Kinnitan…', 'Minuga tuleb…']),
      B.speaking('084_t_say', 'Häälsõnum.', 'Jäta Viktorile 1-minutiline häälsõnum: kinnita aeg ja koht.', ['Kes räägib?', 'Mis kell ja kuhu tuled?', 'Mida palud?', 'Kellega sa tuled?', 'Mis kell pead lahkuma?'], [45, 75]),
      B.rubric('084_t_rubric', 'Kas sõnumis on kõik?', 'Kontrolli oma vastust Viktorile.', ['Kas tuled ja kellega.', 'Mis kellast mis kellani.', 'Kuhu tuled: vana või uus korter.', 'Üks küsimus või palve.', '40–60 sõna, tervitus ja lõpp.']),
      B.selfcheck('084_t_self', ['Ma leian sõnumist kogu vajaliku info.', 'Ma kinnitan kokkuleppe kirjalikult.', 'Ma kirjutan, kui plaan muutub.', 'Ma kinnitan kokkuleppe telefonis.'], 'Viktor teab kõike'),
    ],
  },

  'a2-085': {
    title: 'Kontroll 17 — plaanid',
    assessment: true,
    canDo: 'Ma näitan kontrollis, et räägin oma plaanidest, lepin kokku täpse aja ja koha, kasutan lihtsat kui–siis-lauset ja kirjutan kohtumise muutmise sõnumi (vähemalt 70%).',
    discover: [
      B.text('085_d_situation', 'Kordamine: kohviku sünnipäev', 'Jaani kohvik saab järgmisel kuul viis aastat vanaks. Jaan plaanib peo. Ta peab leidma aja, mis sobib kõigile, ja saatma kutse. Kui ilm on ilus, on pidu õues.'),
      B.truefalse('085_d_tf', 'Mis on õige?', 'Loe olukorda. Õige või vale?', [
        ['Jaani kohvik on viis aastat vana.', false], ['Jaan plaanib peo.', true], ['Jaan otsib aega, mis sobib kõigile.', true], ['Pidu on igal juhul sees.', false], ['Jaan peab saatma kutse.', true],
      ]),
      B.reading('085_d_read', 'Loe: Jaani plaan.', 'Loe teksti ja vasta küsimustele.', 'Pidu kohvikus „Muki”',
        'Jaani kohvik „Muki” saab 14. mail viis aastat vanaks. Jaan tahab teha suure peo. Kõigepealt küsis ta sõpradelt, mis päev sobib. Anna ütles, et reede õhtu sobib talle hästi. Markus vastas, et reedel töötab ta kella kaheksani. Talle sobib laupäev. Sofial on reedel eksam, seega eelistab ka tema laupäeva. Jaan otsustas: pidu on laupäeval, 17. mail kell kuus. Kui ilm on ilus, on pidu kohviku terrassil. Kui sajab vihma, jäävad kõik sisse. Viktor lubas tuua oma kitarri. Liis kavatseb küpsetada tordi. Jaan loodab, et tuleb vähemalt kolmkümmend külalist. Kutsed peab ta saatma nädal enne pidu. Tähtaeg on 10. mai. Jaani unistus on avada järgmisel aastal teine kohvik Tartus.',
        [['Mitu aastat saab kohvik vanaks?', 'viis|5'], ['Miks Markusele reede ei sobi?', 'ta töötab kella kaheksani|ta töötab'], ['Millal on pidu?', 'laupäeval, 17. mail kell kuus|laupäeval|17. mail'], ['Kus on pidu, kui sajab vihma?', 'sees|kohviku sees|kohvikus'], ['Mida lubas Viktor tuua?', 'kitarri|oma kitarri'], ['Mis on Jaani unistus?', 'avada teine kohvik Tartus|teine kohvik Tartus'], ['Mida Liis teeb?', 'küpsetab tordi|tordi']]),
      B.notice('085_d_notice', 'Mooduli kokkuvõte', [
        'Tulevik: **Homme lähen…, Järgmisel nädalal sõidame…**', 'Kokkulepe: **Kas … sobib? — Kahjuks ei saa. — Aga kuidas oleks…? — Sobib! Näeme!**', 'Tingimus: **Kui** ilm **on** ilus, **siis** on pidu õues.', 'Sõnum: **Kinnitan: laupäeval, 17. mail kell 18, kohvik „Muki”.**', 'Muutus: **Kahjuks … ei sobi. Kas saaksime … edasi lükata?**',
      ], 'full'),
      B.match('085_d_match', 'Küsimus ja vastus.', 'Ühenda küsimus ja vastus.', [
        ['Kas laupäev sobib?', 'Jah, laupäev sobib hästi.'], ['Mis kell me kohtume?', 'Kell kuus.'], ['Kus me kokku saame?', 'Kohviku ees.'],
        ['Mida sa homme teed?', 'Homme töötan kodus.'], ['Mis siis, kui sajab vihma?', 'Siis jääme sisse.'], ['Kas sa saad tulla?', 'Kahjuks ei saa, mul on eksam.'],
      ], 'full', 'g_use'),
      B.gaps('085_d_gaps', 'Mooduli vormid.', 'Kirjuta lünka sobiv sõna. Kuus sõna jääb üle.', [
        '[Homme] lähen ma Tartusse.', '[Kui] sajab vihma, jääme koju.', 'Kas reede [sobib] sulle?', 'Kahjuks ma ei [saa] tulla.', 'Me [kohtume] homme kohviku ees.', 'Ma [kinnitan] homme, kas saan tulla.',
      ], ['homme', 'eile', 'kui', 'siis', 'sobib', 'sobis', 'saa', 'saan', 'kohtume', 'kohtusime', 'kinnitan', 'kinnitasin']),
      B.transformation('085_d_trans', 'Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Eile läksin kinno.', 'homme', 'Homme lähen ma kinno.|Homme lähen kinno.'], ['Ilm on ilus. Me läheme randa.', 'kui … siis', 'Kui ilm on ilus, siis läheme randa.|Kui ilm on ilus, siis me läheme randa.'],
        ['Reede ei sobi.', 'Kuidas oleks …? (laupäev)', 'Kuidas oleks laupäeval?'], ['Me kohtume kell kuus kohvikus.', 'Kinnitan: …', 'Kinnitan: me kohtume kell kuus kohvikus.|Kinnitan: kohtume kell kuus kohvikus.'], ['Ma tulen.', 'Kahjuks …', 'Kahjuks ma ei tule.|Kahjuks ma ei saa tulla.'],
      ]),
      B.errorfix('085_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Homme ma läksin Tartusse.', 'Homme lähen ma Tartusse.|Homme ma lähen Tartusse.'], ['Kui sajab vihma, siis me jääme kodus.', 'Kui sajab vihma, siis me jääme koju.|Kui sajab vihma, siis jääme koju.'], ['Kas laupäeval sobib sulle?', 'Kas laupäev sobib sulle?'],
        ['Kahjuks ma ei saan tulla.', 'Kahjuks ma ei saa tulla.'], ['Me kohtume kohvik ees.', 'Me kohtume kohviku ees.'], ['Ma kavatsen peole tulema.', 'Ma kavatsen peole tulla.'],
      ]),
      B.dialogue('085_d_dialog', 'Kutse peole.', 'Täida Jaani ja Anna vestlus.', 'Jaan', 'Anna', [
        ['A', 'Tere, Anna! Kas sa tuled laupäeval [peole]?'], ['B', 'Hea meelega! Mis [kell] pidu algab?'], ['A', 'Kell kuus. [Kui] ilm on ilus, on pidu terrassil.'], ['B', 'Tore! Kas ma pean midagi [kaasa] võtma?'],
        ['A', 'Ei pea. Liis [küpsetab] tordi.'], ['B', 'Kahjuks ma [jään] natuke hiljaks. Kas see sobib?'], ['A', 'Muidugi [sobib]! Näeme laupäeval!'],
      ]),
      B.wordorder('085_d_order', 'Pane lause kokku.', 'Kirjuta laused õigesti.', ['Pidu on laupäeval kell kuus.', 'Kui ilm on ilus, on pidu õues.', 'Viktor lubas tuua kitarri.', 'Kutsed peab saatma nädal enne pidu.', 'Järgmisel aastal avab Jaan teise kohviku.']),
      B.translation('085_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Завтра я еду в Тарту.', 'Если будет дождь, мы останемся дома.', 'Суббота тебе подходит?', 'Подтверждаю: в шесть у кафе.', 'К сожалению, я опоздаю.', 'Встречаемся у кафе в шесть.']),
      B.dictation('085_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Pidu on laupäeval kell kuus.', 'Kui sajab vihma, jääme sisse.', 'Kas laupäev sobib sulle?', 'Kahjuks ma jään hiljaks.', 'Näeme laupäeval!']),
      B.speaking('085_d_say', 'Kordame suuliselt.', 'Vasta paarilise küsimustele.', ['Mida sa järgmisel nädalal teed?', 'Kuidas sa kohtumise aega muudad?', 'Mida sa teed, kui sajab vihma?', 'Mis on sinu unistus?'], [60, 120]),
      B.writing('085_d_write', 'Kinnitus.', 'Kirjuta Jaanile 4–6 lauset: kinnita, et tuled, ja küsi üks küsimus.', [4, 6], ['kinnitan', 'laupäeval', 'kell'], 2),
    ],
    practice: [
      B.tip('085_p_how', 'Lugemine ja kuulamine (eksami vormis)', 'See osa on nagu Harno A2 eksam: viis lugemisülesannet ja kaks kuulamisülesannet. Teema on moodul 17. Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda. Aeg ja koht peavad olema täpsed.', 'full'),
      // reading 1: what to say
      B.choice('085_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sõber kutsub kinno, aga sul on trenn.', 'Kahjuks ei saa, mul on trenn.', 'Jah, ma tulin eile kinno.', 'Palju õnne, see on tore!'], ['Sa tahad teada kohtumise kohta.', 'Kus me kokku saame?', 'Kus sa eile olid?', 'Kus sa sündisid?'],
        ['Sa jääd kümme minutit hiljaks.', 'Vabandust, ma jään natuke hiljaks.', 'Vabandust, ma tulin varem.', 'Vabandust, ma ei mäleta.'], ['Pakutud aeg sobib sulle.', 'Sobib, näeme siis!', 'Ei, see ei sobinud.', 'Head reisi sulle!'],
        ['Sa tahad kohtumise teisele päevale viia.', 'Kas saaksime kohtumise reedele lükata?', 'Kas sa said eile kohtumisele?', 'Kas kohtumine oli tore?'],
      ], 'full', 'g_use'),
      // reading 2: a day programme
      B.reading('085_p_programme', 'Lugemine 2. Päevakava.', 'Loe päevakava ja vasta küsimustele.', 'Ekskursioon Lahemaale — päevakava', [
        'Kell 8.00 — buss väljub Viru hotelli eest.', 'Kell 9.30 — Palmse mõis, ringkäik giidiga (1 tund).', 'Kell 11.00 — matk Viru rabas (3 km, võta kaasa kummikud!).', 'Kell 13.00 — lõuna Altja kõrtsis.',
        'Kell 15.00 — vaba aeg Käsmu külas, võimalik ujuda.', 'Kell 17.30 — buss sõidab tagasi, Tallinnas oleme umbes kell 19.',
        'NB! Kui sajab tugevat vihma, siis rabamatka ei toimu. Siis külastame Sagadi metsamuuseumi. Registreerimise tähtaeg on reede. Hind on 45 eurot, lõuna on hinna sees. Kohtade arv on piiratud: bussis on 40 kohta. Küsimuste korral helistage giidile.',
      ], [['Kust buss väljub?', 'Viru hotelli eest'], ['Kui kaua kestab ringkäik mõisas?', 'üks tund|1 tund|tund'], ['Mida tuleb matkale kaasa võtta?', 'kummikud'], ['Kus süüakse lõunat?', 'Altja kõrtsis'], ['Mis juhtub, kui sajab tugevat vihma?', 'rabamatka ei toimu|külastame Sagadi metsamuuseumi|minnakse metsamuuseumi'], ['Mis on registreerimise tähtaeg?', 'reede|reedel']]),
      // reading 3: where to turn
      B.match('085_p_signs', 'Lugemine 3. Kuhu pöörduda?', 'Ühenda soov ja kuulutus.', [
        ['Tahad muuta arsti aega.', 'Perearstikeskus: aja muutmine telefonil'], ['Tahad broneerida laua reedeks.', 'Restoran „Laud”: broneerimine internetis'], ['Tahad teada, millal kontsert algab.', 'Kontserdimaja: kava ja piletid'],
        ['Tahad osta piletit homseks rongiks.', 'Raudtee: piletid ja sõiduplaan'], ['Tahad registreeruda keelekursusele.', 'Keelekool: registreerimine kuni 1. septembrini'], ['Tahad lapsele sünnipäevapeo teha.', 'Mängutuba: peod lastele, broneeri ette'],
      ], 'full', 'g_read'),
      // reading 4: a ~150-word text
      B.reading('085_p_read', 'Lugemine 4. Sofia plaanid.', 'Loe teksti. Vasta lühidalt.', 'Unistuste plaan',
        'Sofia on üheksateist aastat vana ja õpib Tallinna ülikoolis. Tal on palju plaane. Järgmisel kuul on tal kaks eksamit. Kui eksamid lähevad hästi, sõidab ta suvel Itaaliasse. Seal kavatseb ta töötada ühes väikeses hotellis. Ta tahab õppida itaalia keelt. Sügisel tuleb ta tagasi Tallinna. Siis hakkab ta käima laulukooris. Sofia unistus on saada arstiks. Selleks peab ta õppima veel kuus aastat. See on pikk aeg, aga Sofia ei karda. Loodetavasti on ta kümne aasta pärast lastearst. Tema ema arvab, et see on hea plaan. Vanaema on natuke mures, sest Itaalia on kaugel. Sofia lubas, et helistab talle igal pühapäeval. Järgmisel nädalal räägib ta oma plaanist ka ülikooli nõustajaga.',
        [['Mitu eksamit on Sofial järgmisel kuul?', 'kaks|2'], ['Kus kavatseb Sofia suvel töötada?', 'Itaalias|väikeses hotellis|hotellis'], ['Mitu aastat peab ta veel õppima?', 'kuus|6|kuus aastat'], ['Mida Sofia sügisel hakkab tegema?', 'käima laulukooris|laulukooris käima']]),
      B.choice('085_p_readmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali igale küsimusele üks vastus.', [
        ['Millal sõidab Sofia Itaaliasse?', 'kui eksamid lähevad hästi', 'järgmisel nädalal', 'kümne aasta pärast'], ['Mida Sofia sügisel teeb?', 'hakkab käima laulukooris', 'sõidab Itaaliasse', 'töötab hotellis'],
        ['Kelleks tahab Sofia saada?', 'lastearstiks', 'õpetajaks', 'lauljaks'], ['Miks on vanaema mures?', 'Itaalia on kaugel', 'eksamid on rasked', 'Sofia ei helista'],
        ['Mida Sofia lubas?', 'helistada igal pühapäeval', 'jääda Tallinna', 'õppida laulma'],
      ]),
      // reading 5: a message with 8 option gaps
      B.cloze('085_p_cloze', 'Lugemine 5. Sõnum.', 'Vali igasse lünka sobiv sõna.', 'Tere, Markus!', [
        'Kahjuks ma ei {*saa|saanud|saama} homme kell viis tulla, sest mul {*on|oli|olema} arsti juures aeg.',
        '',
        'Kas saaksime kohtumise {*neljapäevale|neljapäeval|neljapäevast} lükata? {*Kui|Siis|Sest} neljapäev sobib, siis kohtume kell kuus kohviku „Muki” ees.',
        '',
        '{*Loodetavasti|Eile|Kahjuks} sobib see sulle. Ma {*võtan|võtsin|võtma} kaasa sinu raamatu. Palun anna {*teada|teadma|tean}, kas sa {*saad|said|saama} tulla! Anna',
      ]),
      // listening 1: a voice message about a changed meeting
      B.listening('085_p_listen', 'Kuulamine 1. Häälsõnum.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Markus! Siin Liis.', 'Meie kohtumine homme kell kaks ei sobi mulle.', 'Mul on just sel ajal koosolek.', 'Kas me saaksime kokku saada ülehomme, reedel?',
        'Reedel olen vaba alates kella neljast.', 'Kohtumispaik võiks olla raamatukogu ees.', 'Kui sobib, saada mulle sõnum. Aitäh!',
      ], ['Kohtumine pidi olema homme kell [kaks|2|14].', 'Liisil on sel ajal [koosolek].', 'Uus päev on [reede|reedel].', 'Reedel on Liis vaba alates kella [neljast|4st|16st].', 'Kohtumispaik on [raamatukogu] ees.', 'Kui aeg sobib, tuleb saata [sõnum].']),
      // listening 2: two friends arrange a film
      B.listening('085_p_listen2', 'Kuulamine 2. Kinno!', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere, Sofia! Kas lähme laupäeval kinno?', '— Tere, Anna! Laupäeval ma kahjuks ei saa. Ma sõidan Tartusse.', '— Aga pühapäeval?', '— Pühapäeval sobib. Mis kell?',
        '— Seanss algab kell seitse. Kas kohtume pool seitse kino ees?', '— Pool seitse on natuke vara. Ma tulen rongiga.', '— Hästi, siis kohtume kümme minutit enne seitset.',
        '— Sobib! Kas sa ostad piletid?', '— Jah, ostan homme internetist.', '— Super, aitäh! Näeme pühapäeval!',
      ], ['Laupäeval sõidab Sofia [Tartusse].', 'Nad lähevad kinno [pühapäeval].', 'Seanss algab kell [seitse|7|19].', 'Sofia tuleb [rongiga].', 'Nad kohtuvad kino [ees].', 'Piletid ostab [Anna].']),
      B.gaps('085_p_mix', 'Keeleosa. Kirjuta õige vorm.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Homme [lähen] (minema) ma Tartusse.', 'Järgmisel nädalal [algab] (algama) kursus.', 'Kui ilm [on] (olema) ilus, läheme randa.', 'Kas reede [sobib] (sobima) sulle?', 'Ma [kavatsen] (kavatsema) kinno minna.', 'Ma tahan sind homme [näha] (nägema).',
      ]),
      B.errorfix('085_p_fix', 'Keeleosa. Paranda viga.', 'Kirjuta laused õigesti.', [
        ['Homme ma tulin hiljem.', 'Homme tulen ma hiljem.|Homme ma tulen hiljem.'], ['Kas neljapäeval sobib sulle?', 'Kas neljapäev sobib sulle?'], ['Kui sajab vihma, siis me jääme kodus.', 'Kui sajab vihma, siis me jääme koju.|Kui sajab vihma, siis jääme koju.'],
        ['Ma kavatsen Soome sõitma.', 'Ma kavatsen Soome sõita.'], ['Kohtume kino ees kell seitse pool.', 'Kohtume kino ees kell pool seitse.|Kohtume kino ees pool seitse.'],
      ]),
      B.transformation('085_p_trans', 'Keeleosa. Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Eile läksin Tartusse.', 'homme', 'Homme lähen Tartusse.|Homme lähen ma Tartusse.'], ['Ilm on ilus. Me sõidame randa.', 'kui … siis', 'Kui ilm on ilus, siis sõidame randa.|Kui ilm on ilus, siis me sõidame randa.'],
        ['Homme ei sobi.', 'Kuidas oleks …? (reede)', 'Kuidas oleks reedel?'], ['Ma lähen kinno.', 'kavatsen', 'Ma kavatsen kinno minna.'], ['Kohtume kell kuus.', 'küsimus: Mis kell…?', 'Mis kell me kohtume?'],
      ]),
      B.wordorder('085_p_order', 'Keeleosa. Pane lause kokku.', 'Kirjuta laused õigesti.', ['Laupäeval ma kahjuks ei saa.', 'Kohtume pühapäeval kino ees.', 'Reedel olen vaba alates kella neljast.', 'Kui sobib, saada mulle sõnum.', 'Kui eksamid lähevad hästi, sõidab ta Itaaliasse.', 'Piletid ostab Anna homme internetist.']),
      B.speaking('085_p_say', 'Räägi kuuldust.', 'Räägi paarilisele Liisi sõnumist.', ['Miks Liis kohtumist muudab?', 'Mis on uus päev ja kellaaeg?', 'Kus nad kohtuvad?', 'Mida peab Markus tegema?'], [45, 90], ['Liisil on…', 'Uus aeg on…', 'Nad kohtuvad…']),
    ],
    transfer: [
      B.text('085_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'See osa on nagu Harno A2 eksami kirjutamise ja rääkimise osa. Kirjuta ilma sõnaraamatuta. Rääkimine on paaris, nagu eksamil. Aeg ja koht peavad olema täpsed.'),
      B.notice('085_t_card', 'Kuulutus', ['Kohvik „Muki” — 5. sünnipäev!', 'Laupäeval, 17. mail kell 18', 'Aadress: Kalamaja 7, Tallinn', 'Kui on ilus ilm, on pidu terrassil', 'Muusika: Viktor ja kitarr. Tasuta kook!'], 'full', 'g_read'),
      // writing 1: information transfer, at least 25 words
      B.letter('085_t_info', 'Kirjutamine 1. Kutsu sõber.', 'Kutsu sõber kuulutuse järgi peole: millal, kus, mis seal toimub.', 'Tere, Kati!', 'Loodan, et tuled!', [25, 40]),
      B.planning('085_t_plan', 'Enne sõnumit.', 'Mõtle läbi ja kirjuta märksõnad.', ['Mis kohtumine see oli?', 'Miks aeg ei sobi?', 'Mis on uus päev, kell ja koht?', 'Mida sa palud?']),
      // writing 2: a message about moving a meeting, at least 30 words
      B.letter('085_t_letter', 'Kirjutamine 2. Kohtumise muutmine.', 'Sa ei saa homme kohtuda. Kirjuta: miks, uus aeg ja koht, palve vastata.', 'Tere, Markus!', 'Vabandust ja tervitades', [30, 50]),
      B.writing('085_t_text', 'Kirjutamine 2 (teine valik). Minu plaanid.', 'Kirjuta 4–6 lauset: mida sa järgmisel aastal teha kavatsed.', [4, 6], ['järgmisel aastal', 'kavatsen', 'kui'], 2),
      B.table('085_t_form', 'Minu nädala kalender.', 'Kirjuta oma järgmise nädala plaan.', 'Päev, Mida teen?, Mis kell ja kus?', ['esmaspäev | | ', 'teisipäev | | ', 'kolmapäev | | ', 'neljapäev | | ', 'reede | | ', 'nädalavahetus | | ']),
      // speaking: getting to know, picture description (task 1), idea card and role play (task 2)
      B.speaking('085_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele, nagu eksami alguses.', ['Mis su nimi on?', 'Mida sa homme teed?', 'Mida sa nädalavahetusel plaanid?', 'Mis on sinu unistus?'], [45, 60]),
      B.speaking('085_t_mono', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab pildi: inimesed kohtuvad, ootavad või vaatavad kalendrit. Kirjelda üks minut.', ['Kus inimesed on?', 'Mida nad teevad?', 'Mida nad plaanivad?', 'Mis võib edasi juhtuda?'], [60, 90], ['Pildil on…', 'Nad ootavad…', 'Võib-olla…']),
      B.rolecards('085_t_s1', 'Rääkimine 2. Ideekaart „Plaanid”.', 'A küsib kaardi märksõnade järgi, B vastab. Siis vahetage.',
        'Küsi paarilisel viis küsimust: homme, nädalavahetus, puhkus, järgmine aasta, unistus.', 'Vasta igale küsimusele 2–3 lausega. Kasuta ajasõnu.',
        ['Mida sa homme teed?', 'Kuhu sa puhkusel sõidad?', 'Mis on sinu unistus?'], ['Homme…', 'Kui ilm on ilus, siis…', 'Ma kavatsen…']),
      B.rolecards('085_t_s2', 'Rääkimine 2. Rollimäng „Saame kokku”.', 'Leppige kokku kohtumine. Lõpus korrake päev, kell ja koht.',
        'Paku kohtumist reedel kell viis. Kui see ei sobi, otsi uus aeg ja vali koht.', 'Reedel sa ei saa. Ütle põhjus ja paku teist aega. Lõpus kinnita kõik.',
        ['Kas reedel kell viis sobib?', 'Aga kuidas oleks…?', 'Kus me kohtume?'], ['Kahjuks reedel ei saa, sest…', 'Kuidas oleks…?', 'Kinnitan: …']),
      B.rubric('085_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Ülesanne on täidetud: kõik küsitud info on olemas.', 'Kokkulepe on täpne: päev, kellaaeg ja koht.', 'Tulevik ajasõnaga ja kui–siis-lause on õiged.', 'Kirjutamine 1: vähemalt 25 sõna; kirjutamine 2: 30–50 sõna.', 'Rääkimine: küsisin ja vastasin lõpuni.']),
      B.selfcheck('085_t_self', ['Ma kirjutan kuulutuse järgi kutse.', 'Ma kirjutan kohtumise muutmise sõnumi.', 'Ma räägin oma plaanidest ja unistusest.', 'Ma lepin kokku täpse aja ja koha.'], 'Moodul 17 on tehtud'),
    ],
  },
};
