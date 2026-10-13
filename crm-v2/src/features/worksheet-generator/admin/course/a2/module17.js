// A2 course (A1 → A2 roadmap), module 17 „Plaanid, kokkulepped ja tulevik”, new lessons a2-082…084 (stage A2).
// All three phases: Avasta → Harjuta → Kasuta, each a whole lesson (40–55 min). 082 arranges and moves a meeting until
// the day, time and place are exact, 083 adds the simple condition „kui + olevik, siis …” to plans, 084 writes the
// confirming or changing message (40–70 words) that needs no follow-up question. Time phrases (kell kuus, alates
// kella kuuest) and place forms (kohviku ees, kinos) come back from the earlier modules. The other lessons of the
// module are in the database already.
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-17', course: 'a2', title: 'Plaanid, kokkulepped ja tulevik', level: 'A2' };

export const LESSONS = {
  'a2-082': {
    title: 'Saame kokku',
    canDo: 'Ma lepin sõbra või kolleegiga kokku kohtumise, pakun uue aja, kui aeg ei sobi, ja kinnitan lõpuks täpse päeva, kellaaja ja koha.',
    discover: [
      B.text('082_d_intro', 'Anna ja Liis', 'Anna kirjutab: „Kas saame neljapäeval kokku? Kas kell kuus sobib?” Liis vastab: „Kahjuks neljapäeval ei saa, mul on trenn. Aga reedel olen vaba.” Anna: „Reedel kell viis kohvikus „Kask”?” Liis: „Sobib! Näeme!”'),
      B.truefalse('082_d_tf', 'Millal nad kohtuvad?', 'Loe sõnumeid. Õige või vale?', [
        ['Anna pakub neljapäeva.', true], ['Neljapäev sobib Liisile.', false], ['Liisil on neljapäeval trenn.', true],
        ['Nad kohtuvad reedel kell kuus.', false], ['Nad kohtuvad kohvikus.', true],
      ]),
      B.vocab('082_d_vocab', 'Kokkuleppe sõnad', ['kokku saama — встретиться', 'kohtuma — встречаться', 'sobima — подходить', 'vaba — свободный', 'mul on aega — у меня есть время', 'kahjuks — к сожалению', 'kokkulepe — договорённость', 'muutma — изменять', 'varem — раньше', 'hiljem — позже', 'kinnitama — подтверждать', 'Näeme! — Увидимся!'], '2'),
      B.reading('082_d_read', 'Loe: Markus helistab.', 'Loe vestlust ja vasta küsimustele.', 'Korvpall', [
        'Markus: Tere, Viktor! Kas sa tahad sel nädalal korvpalli mängida?',
        'Viktor: Jah, väga! Millal sul aega on?',
        'Markus: Kas teisipäeva õhtu sobib? Näiteks kell seitse?',
        'Viktor: Kahjuks teisipäeval ei saa. Mul on koosolek kella kaheksani.',
        'Markus: Aga kuidas oleks kolmapäeval?',
        'Viktor: Kolmapäeval olen vaba alates kella kuuest.',
        'Markus: Siis võime kohtuda kell pool seitse. Kas spordihallis või pargis?',
        'Viktor: Ilm on praegu külm. Parem spordihallis.',
        'Markus: Hästi. Spordihall on Kooli tänaval, maja number viis.',
        'Viktor: Ma tean seda kohta. Kas ma pean palli kaasa võtma?',
        'Markus: Ei pea, mul on pall olemas. Võta vett kaasa.',
        'Viktor: Selge. Kolmapäeval kell pool seitse spordihallis. Näeme!',
      ], [
        ['Miks teisipäev Viktorile ei sobi?', 'tal on koosolek|koosolek kella kaheksani'],
        ['Mis kellast on Viktor kolmapäeval vaba?', 'alates kella kuuest|kella kuuest|kuuest'],
        ['Mis kell nad lõpuks kohtuvad?', 'pool seitse|kell pool seitse|18.30'],
        ['Miks nad pargis ei mängi?', 'ilm on külm|on külm'],
        ['Kus spordihall asub?', 'Kooli tänaval|Kooli tänav 5|Kooli tänaval, maja number viis'],
        ['Mida peab Viktor kaasa võtma?', 'vett|vee|joogivett'],
      ]),
      B.notice('082_d_notice', 'Märka kokkuleppe samme.', ['1. Pakkumine: **Kas** teisipäeva õhtu **sobib**?', '2. Probleem: **Kahjuks** teisipäeval **ei saa**.', '3. Uus aeg: **Aga kuidas oleks** kolmapäeval?', '4. Koht: **Kas** spordihallis **või** pargis?', '5. Kinnitus: Kolmapäeval kell pool seitse spordihallis. **Näeme!**'], 'full'),
      B.notice('082_d_cal', 'Liisi nädal', ['E kell 17–19 trenn', 'T kell 9–17 tööl, õhtu vaba', 'K kell 18 hambaarst', 'N terve päev vaba', 'R kell 19 kino Annaga'], 'full', 'g_read'),
      B.choice('082_d_choice', 'Mida Liis vastab?', 'Vaata Liisi nädalat. Vali Liisi vastus.', [
        ['Markus: „Kas esmaspäeval kell kuus sobib?”', 'Kahjuks ei saa, mul on trenn.', 'Sobib, olen siis vaba.', 'Jah, lähme koos kinno.'],
        ['Jaan: „Kas teisipäeval kell seitse sobib?”', 'Sobib, õhtu on mul vaba.', 'Kahjuks ei saa, olen tööl.', 'Ei, mul on siis trenn.'],
        ['Sofia: „Saame kokku kolmapäeval kell kuus?”', 'Kahjuks ei saa, mul on hambaarst.', 'Sobib, mul on aega.', 'Jah, pärast kino.'],
        ['Viktor: „Millal sul aega on?”', 'Neljapäeval olen terve päeva vaba.', 'Reedel kell seitse olen vaba.', 'Esmaspäeval kell kuus olen vaba.'],
        ['Anna: „Kas reedel kell seitse kinos?”', 'Jah, sobib, näeme kinos!', 'Kahjuks olen siis tööl.', 'Ei, mul on siis hambaarst.'],
        ['Markus: „Kas teisipäeval kell kaks?”', 'Kahjuks ei saa, olen siis tööl.', 'Sobib, olen siis vaba.', 'Ei, mul on siis trenn.'],
      ]),
      B.match('082_d_match', 'Mida inimene teeb?', 'Ühenda lause ja selle eesmärk.', [
        ['Kas reedel kell viis sobib?', 'pakub aega'], ['Kahjuks ma ei saa.', 'ütleb ei'], ['Aga kuidas oleks laupäeval?', 'pakub uut aega'],
        ['Kus me kohtume?', 'küsib kohta'], ['Sobib! Näeme reedel.', 'kinnitab'], ['Kas me võime hiljem kohtuda?', 'muudab aega'],
      ], 'full', 'g_use'),
      B.gaps('082_d_gaps', 'Kokkulepe.', 'Kirjuta sobiv sõna. Kaks sõna jääb üle.', [
        'Kas kell kuus sulle [sobib]?', '[Kahjuks] ma neljapäeval ei saa.', 'Aga kuidas [oleks] reedel?', 'Kus me [kohtume]?', 'Mul on [aega] alates kella viiest.', '[Näeme] reedel!',
      ], ['sobib', 'kahjuks', 'oleks', 'kohtume', 'aega', 'näeme', 'sobima', 'aeg']),
      B.clock('082_d_clock', 'Mis kell?', 'Kirjuta kellaaeg sõnadega.', [
        { time: '18:00', extra: '' }, { time: '18:30', extra: '' }, { time: '17:00', extra: '' }, { time: '19:30', extra: '' }, { time: '14:00', extra: '' }, { time: '10:30', extra: '' },
      ]),
      B.wordorder('082_d_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Kas teisipäeva õhtu sobib sulle?', 'Kahjuks on mul teisipäeval koosolek.', 'Kolmapäeval olen ma vaba alates kuuest.', 'Kohtume kell pool seitse spordihallis.', 'Kas ma pean palli kaasa võtma?',
      ]),
      B.errorfix('082_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Kas sina sobib reedel?', 'Kas sulle sobib reedel?|Kas reede sulle sobib?'], ['Kahjuks ma ei saan tulla.', 'Kahjuks ma ei saa tulla.'],
        ['Me kohtume kohvikus ees.', 'Me kohtume kohviku ees.'], ['Ma olen vaba kella viis.', 'Ma olen vaba alates kella viiest.|Ma olen vaba kella viiest.'],
        ['Mul ei ole aeg.', 'Mul ei ole aega.'],
      ]),
      B.translation('082_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Давай встретимся в пятницу.', 'Тебе подходит в шесть?', 'К сожалению, во вторник я не могу.', 'А как насчёт среды?', 'Я свободна с пяти часов.', 'Увидимся у кафе!']),
      B.dictation('082_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kas kell kuus sobib?', 'Kahjuks ma ei saa.', 'Aga kuidas oleks reedel?', 'Mul on aega alates viiest.', 'Kohtume kohviku ees.']),
      B.speaking('082_d_say', 'Lepi kokku.', 'Lepi paarilisega kokku: päev, kell ja koht.', ['Millal sul aega on?', 'Kas … sobib?', 'Kus me kohtume?'], [45, 90], ['Kas … sobib?', 'Kahjuks ei saa.', 'Aga kuidas oleks…?', 'Näeme!']),
      B.writing('082_d_write', 'Sõnum sõbrale.', 'Kirjuta sõbrale 6–8 lauset: paku kaks aega ja koht.', [6, 8], ['sobib', 'kohtume', 'kell', 'või'], 3),
      B.selfcheck('082_d_self', ['Ma pakun aega: Kas … sobib?', 'Ma ütlen viisakalt ei.', 'Ma pakun uue aja.', 'Ma kinnitan päeva, kella ja koha.'], 'Kokkulepe on olemas'),
    ],
    practice: [
      B.dialogue('082_p_dialog', 'Täida vestlus.', 'Kirjuta lünka sobiv sõna.', 'Sofia', 'Jaan', [
        ['A', 'Tere, Jaan! Kas me saame sel nädalal [kokku]?'], ['B', 'Jah! Millal sul [aega] on?'], ['A', 'Kas neljapäeval kell viis [sobib]?'],
        ['B', '[Kahjuks] ei saa, mul on siis tööl koosolek.'], ['A', 'Aga kuidas [oleks] reedel kell kuus?'], ['B', 'Reede sobib. Kus me [kohtume]?'],
        ['A', 'Kesklinnas, raamatukogu ees.'], ['B', 'Hästi. Reedel kell kuus. [Näeme]!'],
      ]),
      B.wordforms('082_p_forms', 'Alates … kuni …', 'Kirjuta number õiges vormis.', [
        ['kuus', 'alates kella …', 'kuuest'], ['kaheksa', 'kuni kella …', 'kaheksani'], ['viis', 'alates kella …', 'viiest'],
        ['seitse', 'kuni kella …', 'seitsmeni'], ['kolm', 'alates kella …', 'kolmest'], ['üks', 'kuni kella …', 'üheni'],
      ]),
      B.gaps('082_p_place', 'Kus kohtume?', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Kohtume [kohviku] ees (kohvik).', 'Film on [kinos] (kino) kell seitse.', 'Ootan sind [bussipeatuses] (bussipeatus).',
        'Saame kokku [poe] juures (pood).', 'Tule õhtul [minu] juurde (mina).', 'Kas lähme pärast tööd [parki] (park)?',
      ]),
      B.categorize('082_p_sort', 'Jah, ei või uus aeg?', 'Pane laused õigesse rühma.', [
        ['Sobib', ['Sobib!', 'Hea mõte!', 'Olen nõus.', 'Näeme siis!']],
        ['Ei sobi', ['Kahjuks ei saa.', 'Mul on siis trenn.', 'See on liiga vara.', 'Mul ei ole aega.']],
        ['Uus pakkumine', ['Aga kuidas oleks reedel?', 'Kas kell seitse sobib?', 'Võime kohtuda hiljem.']],
      ], 'full', 'g_use'),
      B.listening('082_p_listen', 'Kuula: kolm häälsõnumit.', 'Õpetaja loeb sõnumid kaks korda. Kirjuta 1–2 sõna.', [
        'Sõnum üks. Tere, Anna! Siin Liis. Kahjuks ma ei saa homme kell kolm tulla. Mul on tööl koosolek. Kas kell viis sobib? Helista mulle!',
        'Sõnum kaks. Tere, Anna! Siin on Jaan. Meie kohtumine jääb samaks, neljapäeval kell kuus. Aga koht muutub. Me ei kohtu kohvikus, vaid raamatukogu ees. Näeme!',
        'Sõnum kolm. Tere! Siin on hambaarsti registratuur. Teie aeg on reedel kell kaheksa. Kahjuks on arst haige. Uus aeg on esmaspäeval kell üksteist. Kui see ei sobi, palun helistage meile.',
      ], [
        'Liis ei saa tulla, sest tal on [koosolek].', 'Liis pakub uueks ajaks kella [viis|viit|5|17].', 'Jaaniga kohtumine on neljapäeval kell [kuus|6|18].',
        'Jaan ja Anna kohtuvad raamatukogu [ees].', 'Reedel arsti juurde ei saa, sest arst on [haige].', 'Uus aeg arsti juures on [esmaspäeval].',
      ]),
      B.choice('082_p_reply', 'Mida vastata?', 'Vali sobiv vastus.', [
        ['„Kas homme kell kaheksa hommikul sobib?” Sa magad siis veel.', 'See on mulle liiga vara.', 'See on mulle liiga hilja.', 'See on mulle liiga kaugel.'],
        ['„Kus me kohtume?”', 'Kino ees.', 'Kell kuus.', 'Reedel.'],
        ['„Millal sul aega on?”', 'Alates kella neljast.', 'Kohviku ees.', 'Jah, sobib.'],
        ['„Kas laupäev sobib?” Laupäeval oled maal.', 'Kahjuks ei saa, olen maal.', 'Sobib, olen maal.', 'Jah, näeme maal.'],
        ['„Kohtume siis reedel kell viis.”', 'Hästi, näeme!', 'Kus sa elad?', 'Mis kell on?'],
      ], 'full', 'g_use'),
      B.transformation('082_p_trans', 'Ütle viisakalt.', 'Kirjuta lause antud sõnadega.', [
        ['Tule kell viis.', 'Kas … sobib?', 'Kas kell viis sobib?|Kas sulle sobib kell viis?'],
        ['Ma ei saa teisipäeval.', 'kahjuks', 'Kahjuks ma ei saa teisipäeval.|Kahjuks ei saa ma teisipäeval.'],
        ['Kohtume reedel.', 'Aga kuidas oleks …?', 'Aga kuidas oleks reedel?'],
        ['Mul on vaba aeg kuuest.', 'alates', 'Mul on aega alates kella kuuest.|Olen vaba alates kella kuuest.'],
        ['Kohtume hiljem.', 'võime', 'Võime kohtuda hiljem.|Me võime hiljem kohtuda.'],
      ]),
      B.errorfix('082_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Saame kokku kell pool kuus kinos juures.', 'Saame kokku kell pool kuus kino juures.'], ['Ma ei saa tulla, sest mul on koosolekul.', 'Ma ei saa tulla, sest mul on koosolek.'],
        ['Aga kuidas oleks reede?', 'Aga kuidas oleks reedel?'], ['Ma olen tööl kuni kella kuus.', 'Ma olen tööl kuni kella kuueni.'],
        ['Me võime kohtume hiljem.', 'Me võime hiljem kohtuda.|Me võime kohtuda hiljem.'],
      ]),
      B.wordorder('082_p_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Kas sulle sobib reedel kell viis?', 'Kahjuks olen ma teisipäeval tööl.', 'Aga kuidas oleks järgmisel nädalal?', 'Me võime kohtuda raamatukogu ees.', 'Mul on aega alates kella neljast.',
      ]),
      B.translation('082_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Когда у тебя есть время?', 'Это для меня слишком рано.', 'Встречаемся перед кино.', 'Я свободен с четырёх.', 'Можем встретиться позже.']),
      B.dictation('082_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Millal sul aega on?', 'Kas neljapäev sobib?', 'Mul on siis koosolek.', 'Kohtume raamatukogu ees.', 'Uus aeg on esmaspäeval.', 'Helista mulle!']),
      B.rolecards('082_p_roles', 'Kalendrid ei klapi.', 'Leppige kokku aeg ja koht. Rääkige 2–3 minutit.',
        'Sinu nädal: E trenn 18–20, K tööl kuni 19, R vaba. Paku aega ja koht.', 'Sinu nädal: E vaba, K koosolek 17–18, R kuni 16 tööl. Ütle ei ja paku uus aeg.',
        ['Kas … sobib?', 'Kohtume…', 'Näeme!'], ['Kahjuks ei saa.', 'Aga kuidas oleks…?', 'Kus me kohtume?']),
      B.writing('082_p_write', 'Muuda kohtumist.', 'Kirjuta sõbrale 4–6 lauset: miks aeg ei sobi ja uus aeg.', [4, 6], ['kahjuks', 'sest', 'kuidas oleks', 'kohtume'], 3),
      B.selfcheck('082_p_self', ['Ma ütlen alates kella … kuni kella …', 'Ma ütlen kohtumise koha õiges vormis.', 'Ma saan aru häälsõnumist.', 'Ma lepin paarilisega kokku.'], 'Aeg ja koht on paigas'),
    ],
    transfer: [
      B.text('082_t_situation', 'Uus olukord', 'Kursus lõpeb. Sa korraldad lõpuõhtu Annale, Jaanile ja Sofiale. Leia aeg, mis sobib kõigile, ja vali koht.'),
      B.notice('082_t_cal', 'Kolm kalendrit', ['Anna: E ja K õhtul trenn, R vaba alates kella viiest.', 'Jaan: T õhtul tööl, R kuni kella kuueni tööl.', 'Sofia: N sünnipäev, R ja L vaba.', 'Laupäeval on Anna ja Jaan maal.'], 'full', 'g_read'),
      B.choice('082_t_choice', 'Mis sobib kõigile?', 'Vaata kalendreid ja vali õige vastus.', [
        ['Kas esmaspäeva õhtu sobib Annale?', 'ei, tal on trenn', 'jah, ta on vaba', 'ei, ta on maal'],
        ['Kes on laupäeval maal?', 'Anna ja Jaan', 'Sofia ja Jaan', 'ainult Sofia'],
        ['Mis päev sobib kõigile kolmele?', 'reede', 'neljapäev', 'laupäev'],
        ['Mis kellast saab Jaan reedel tulla?', 'kella kuuest', 'kella viiest', 'kella neljast'],
        ['Mis kell on reedel kõige parem?', 'kell pool seitse', 'kell neli', 'kell viis'],
      ]),
      B.reading('082_t_read', 'Loe: Sofia sõnum.', 'Loe sõnum ja vasta küsimustele.', 'Sofia vastab', [
        'Tere! Aitäh, et sa korraldad lõpuõhtu! Reede sobib mulle väga hästi. Kell pool seitse on ka hea aeg. Aga mul on üks küsimus koha kohta. Kohvik „Kask” on reedel kinni, sest seal on remont. Ma käisin seal eile. Kas me võime minna hoopis restorani „Meri”? See on sadama juures, Mere tänav 8. Seal on head kalatoidud ja hinnad ei ole kallid. Restoranis on ka lastenurk, nii et Anna võib poja kaasa võtta. Auto saab parkida maja ees. Kui sa tahad, siis ma helistan ja broneerin laua. Anna mulle teada homseks! Sofia',
      ], [
        ['Kas reede sobib Sofiale?', 'jah|sobib väga hästi'], ['Miks ei saa minna kohvikusse „Kask”?', 'kohvik on reedel kinni|seal on remont'],
        ['Mida Sofia pakub?', 'restorani „Meri”|restorani Meri|minna restorani'], ['Kus restoran asub?', 'sadama juures|Mere tänav 8'],
        ['Mida Sofia ise teha pakub?', 'helistab ja broneerib laua|broneerib laua'],
      ]),
      B.gaps('082_t_gaps', 'Lõpuõhtu plaan.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Lõpuõhtu on [reedel] (reede).', 'Me oleme restoranis [kella] kümneni (kell).', 'Me läheme [restorani] (restoran) „Meri”.',
        'Restoran on [sadama] juures (sadam).', 'Jaan on tööl [kuueni|kella kuueni] (kuus).', 'Anna on vaba alates [viiest|kella viiest] (viis).',
      ]),
      B.transformation('082_t_trans', 'Muuda plaani.', 'Kirjuta lause uue infoga.', [
        ['Kohtume kohvikus „Kask”.', 'restoran „Meri”', 'Kohtume restoranis „Meri”.'],
        ['Kohtume kell kuus.', 'pool seitse', 'Kohtume kell pool seitse.'],
        ['Kohtume neljapäeval.', 'reede', 'Kohtume reedel.'],
        ['Ma broneerin laua.', 'Sofia', 'Sofia broneerib laua.'],
      ]),
      B.translation('082_t_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Пятница подходит всем.', 'Кафе в пятницу закрыто.', 'Встречаемся в ресторане в половине седьмого.', 'Сообщи мне до завтра!']),
      B.dictation('082_t_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Reede sobib kõigile.', 'Kohvik on reedel kinni.', 'Kohtume restoranis „Meri”.', 'Restoran on sadama juures.', 'Anna mulle homseks teada!']),
      B.planning('082_t_plan', 'Lõpuõhtu plaan.', 'Kirjuta märksõnad.', ['Mis päev?', 'Mis kell?', 'Kus? Aadress?', 'Kes broneerib laua?']),
      B.rolecards('082_t_roles', 'Telefonikõne Jaaniga.', 'Lepi Jaaniga lõpuõhtu kokku. Rääkige 2–3 minutit.',
        'Oled korraldaja. Paku reedet ja restorani „Meri”. Vasta Jaani küsimustele.', 'Oled Jaan. Oled reedel tööl kuueni. Küsi kella ja aadressi kohta.',
        ['Kas reedel kell … sobib?', 'Restoran on…', 'Näeme reedel!'], ['Ma olen kuni kella kuueni tööl.', 'Kus see restoran on?', 'Sobib!']),
      B.speaking('082_t_say', 'Teata grupile.', 'Ütle grupile lõpuõhtu plaan 1 minutiga.', ['Mis päev ja kell?', 'Kus? Kuidas sinna saab?', 'Mida kaasa võtta?'], [45, 90]),
      B.letter('082_t_letter', 'Sõnum kõigile.', 'Kirjuta grupile: päev, kell, koht, aadress ja palve.', 'Tere, Anna, Jaan ja Sofia!', 'Näeme reedel!', [30, 50]),
      B.writing('082_t_write', 'Vastus Sofiale.', 'Vasta Sofiale 4–6 lausega: kas restoran sobib ja kes broneerib.', [4, 6], ['sobib', 'aitäh', 'kohtume', 'kell'], 3),
      B.selfcheck('082_t_self', ['Ma leian kalendritest aja, mis sobib kõigile.', 'Ma muudan plaani, kui koht on kinni.', 'Ma lepin telefonis kokku.', 'Ma saadan grupile täpse info.'], 'Lõpuõhtu on kokku lepitud'),
    ],
  },
  'a2-083': {
    title: 'Kui…, siis…',
    canDo: 'Ma ütlen oma plaanide kohta kuus lihtsat lauset mustriga „kui + olevik, siis …” (ilm, aeg, raha) ja teen nende põhjal otsuse.',
    discover: [
      B.text('083_d_intro', 'Laupäeva plaan', 'Jaan küsib: „Mida me laupäeval teeme?” Liis vastab: „Kui ilm on ilus, siis läheme randa. Kui sajab vihma, siis vaatame kodus filmi. Kui Sofia tuleb ka, siis teeme pannkooke.”'),
      B.truefalse('083_d_tf', 'Mis on plaan?', 'Loe Liisi vastust. Õige või vale?', [
        ['Ilusa ilmaga lähevad nad randa.', true], ['Vihmaga lähevad nad kinno.', false], ['Kui sajab, vaatavad nad kodus filmi.', true],
        ['Pannkooke teevad nad igal juhul.', false], ['Liis räägib laupäeva plaanist.', true],
      ]),
      B.vocab('083_d_vocab', 'Plaani ja ilma sõnad', ['kui — если', 'siis — то, тогда', 'ilm — погода', 'sajab vihma — идёт дождь', 'paistab päike — светит солнце', 'tuul — ветер', 'külm — холодный', 'soe — тёплый', 'plaan — план', 'otsustama — решать', 'koju jääma — остаться дома', 'võib-olla — может быть'], '2'),
      B.reading('083_d_read', 'Loe: Viktori nädalavahetus.', 'Loe tekst ja vasta küsimustele.', 'Kui…, siis…', [
        'Viktor planeerib nädalavahetust. Laupäeva hommikul tahab ta minna kalale. Kalal käimine on tema lemmik hobi. Kui ilm on ilus, siis sõidab ta järve äärde. Kui sajab vihma, siis jääb ta koju ja parandab jalgratast.',
        'Laupäeva õhtul on tema sõbral Markusel sünnipäev. Markus elab teises linnaosas. Kui Viktor jõuab õigel ajal koju, siis läheb ta peole. Kui ta jääb hiljaks, siis helistab ta Markusele. Ta õnnitleb sõpra telefonis.',
        'Pühapäeval tahab Viktor minna kinno. Kui piletid ei ole liiga kallid, siis võtab ta kaasa õe Sofia. Kui kinos ei ole head filmi, siis lähevad nad hoopis ujulasse. Viktor teab, et plaanid võivad muutuda. Kui midagi ei õnnestu, siis ta ei muretse. Tema arvates on nädalavahetusel kõige tähtsam puhata. Pühapäeva õhtul läheb ta varakult magama, sest esmaspäeval algab töö kell seitse.',
      ], [
        ['Mida teeb Viktor laupäeva hommikul, kui ilm on ilus?', 'sõidab järve äärde|läheb kalale|sõidab järve äärde kalale'],
        ['Mida teeb ta, kui sajab vihma?', 'jääb koju ja parandab jalgratast|parandab jalgratast|jääb koju'],
        ['Mis toimub laupäeva õhtul?', 'Markuse sünnipäev|Markusel on sünnipäev'],
        ['Mida teeb Viktor, kui ta jääb hiljaks?', 'helistab Markusele|õnnitleb telefonis'],
        ['Millal võtab Viktor Sofia kinno kaasa?', 'kui piletid ei ole kallid|kui piletid on odavad'],
        ['Miks ei muretse Viktor, kui plaan muutub?', 'kõige tähtsam on puhata|tähtis on puhata'],
        ['Miks läheb Viktor pühapäeval varakult magama?', 'esmaspäeval algab töö kell seitse|töö algab vara'],
      ]),
      B.notice('083_d_notice', 'Märka: kui … siis', ['**Kui** ilm **on** ilus, **siis sõidab** ta järve äärde.', '**Kui** sajab vihma, **siis jääb** ta koju.', 'Ta jääb koju, **kui** sajab vihma.', 'Kui-osa järel on **koma**.'], 'full'),
      B.tip('083_d_rule', 'Kui + olevik, siis…', ['Kui + olevik, siis + olevik: Kui **sajab**, siis **jään** koju.', 'Kui-osa ees: kõigepealt kui, siis siis-osa.', 'Kui-osa lõpus: Jään koju, kui sajab. (siis ei ole)', 'Siis-osas on tegusõna teisel kohal: siis **läheb** ta…'], 'full'),
      B.match('083_d_match', 'Kui ja siis.', 'Ühenda lause algus ja lõpp.', [
        ['Kui ma olen haige,', 'siis ma ei lähe tööle.'], ['Kui on palav,', 'siis läheme ujuma.'], ['Kui buss ei tule,', 'siis võtan takso.'],
        ['Kui mul on raha,', 'siis ostan uue telefoni.'], ['Kui pood on täna kinni,', 'siis lähen homme.'], ['Kui sa oled väsinud,', 'siis puhka natuke.'],
      ], 'full', 'g_notice'),
      B.gaps('083_d_gaps', 'Kui või siis?', 'Kirjuta lünka kui või siis.', [
        '[Kui] ilm on ilus, siis sõidame maale.', 'Kui sajab vihma, [siis] jääme koju.', 'Ma tulen kaasa, [kui] mul on aega.',
        '[Kui] sa tuled varem, siis sööme koos.', 'Kui pilet on odav, [siis] ostan kaks.', 'Võtan vihmavarju, [kui] taevas on pilves.',
      ]),
      B.wordorder('083_d_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Kui ilm on ilus, siis läheme randa.', 'Kui sajab vihma, siis jään koju.', 'Kui sa oled väsinud, siis puhka.', 'Ma helistan sulle, kui ma jõuan koju.', 'Kui pilet on kallis, siis ma ei osta.',
      ]),
      B.transformation('083_d_trans', 'Ühenda laused.', 'Tee üks lause: Kui …, siis …', [
        ['Sajab vihma. Me jääme koju.', 'Kui …, siis …', 'Kui sajab vihma, siis jääme koju.|Kui sajab vihma, siis me jääme koju.'],
        ['On palav. Ma lähen ujuma.', 'Kui …, siis …', 'Kui on palav, siis lähen ujuma.|Kui on palav, siis ma lähen ujuma.'],
        ['Buss hilineb. Ma võtan takso.', 'Kui …, siis …', 'Kui buss hilineb, siis võtan takso.|Kui buss hilineb, siis ma võtan takso.'],
        ['Sul on aega. Helista mulle.', 'Kui …, siis …', 'Kui sul on aega, siis helista mulle.'],
        ['Pood on kinni. Me läheme homme.', 'Kui …, siis …', 'Kui pood on kinni, siis läheme homme.|Kui pood on kinni, siis me läheme homme.'],
      ]),
      B.wordforms('083_d_forms', 'Kui-osa tegusõna.', 'Kirjuta tegusõna olevikus.', [
        ['sadama', 'kui homme …', 'sajab'], ['olema', 'kui sa … väsinud', 'oled'], ['tulema', 'kui buss ei …', 'tule'],
        ['jõudma', 'kui ma … koju', 'jõuan'], ['paistma', 'kui päike …', 'paistab'], ['saama', 'kui me … piletid', 'saame'],
      ]),
      B.translation('083_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Если погода хорошая, мы идём на пляж.', 'Если идёт дождь, я остаюсь дома.', 'Если у тебя есть время, позвони.', 'Я приду, если успею.', 'Если ты устал, отдохни.', 'Может быть, мы пойдём в кино.']),
      B.dictation('083_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kui ilm on ilus, siis läheme randa.', 'Kui sajab, siis jään koju.', 'Kui sul on aega, siis helista.', 'Ma tulen, kui ma jõuan.', 'Kui pilet on kallis, siis ma ei osta.', 'Võib-olla jääme koju.']),
      B.speaking('083_d_say', 'Lõpeta lause.', 'Lõpeta laused suuliselt. Ütle ka, miks.', ['Kui homme on ilus ilm, siis…', 'Kui mul on vaba päev, siis…', 'Kui ma olen väsinud, siis…', 'Kui sajab vihma, siis…', 'Kui mul on palju raha, siis…'], [45, 90], ['Kui …, siis ma…', '…, sest…']),
      B.writing('083_d_write', 'Minu nädalavahetuse plaan.', 'Kirjuta 6–8 lauset. Vähemalt neli lauset kui-ga.', [6, 8], ['kui', 'siis', 'ilm', 'võib-olla'], 2),
      B.selfcheck('083_d_self', ['Ma leian tekstist, mida inimene teeb mis juhul.', 'Ma ütlen: Kui …, siis …', 'Ma panen koma õigesse kohta.', 'Ma räägin oma plaanist tingimusega.'], 'Plaan A ja plaan B'),
    ],
    practice: [
      B.gaps('083_p_gaps', 'Kui + olevik.', 'Kirjuta sulgudes olev tegusõna olevikus.', [
        'Kui homme [sajab] (sadama) vihma, siis jääme koju.', 'Kui sa [tuled] (tulema) varem, siis sööme koos.', 'Kui mul [on] (olema) aega, siis helistan sulle.',
        'Kui me [jõuame] (jõudma) õigel ajal, siis läheme kinno.', 'Kui lapsed [magavad] (magama), siis loen raamatut.', 'Kui te [soovite] (soovima), siis võime kohtuda pargis.',
      ]),
      B.choice('083_p_choice', 'Vali õige vorm.', 'Vali lausesse sobiv sõna või vorm.', [
        ['Kui homme … ilus ilm, siis läheme randa.', 'on', 'oli', 'olema'],
        ['Kui sa … väsinud, siis puhka.', 'oled', 'olid', 'olla'],
        ['Kui buss ei …, siis kõnnime.', 'tule', 'tulnud', 'tuleb'],
        ['Kui ma palga …, siis ostan pileti.', 'saan', 'sain', 'saama'],
        ['Kui sajab, … jääme koju.', 'siis', 'sest', 'aga'],
        ['Jääme koju, … sajab vihma.', 'kui', 'siis', 'ja'],
      ], 'full', 'g_notice'),
      B.reading('083_p_read', 'Loe: Anna plaan.', 'Loe tekst ja vasta küsimustele.', 'Ilmateade ja plaan', [
        'Ilmateade ütleb, et laupäeva hommikul on päikseline ilm. Pärastlõunal tuleb tugev tuul ja võib sadada vihma. Pühapäeval on külm, aga kuiv. Teed võivad olla libedad. Anna teeb nädalavahetuseks plaani.',
        'Kui laupäeva hommik on päikseline, siis sõidab ta lastega rattaga. Kui pärastlõunal sajab, siis lähevad nad kinno. Kui kinos ei ole lastefilmi, siis mängivad nad kodus lauamänge. Pühapäeval tahab Anna sõita vanaema juurde maale. Kui on külm, siis paneb ta lastele soojad riided selga. Kui tee on libe, siis sõidavad nad bussiga, mitte autoga.',
      ], [
        ['Milline ilm on laupäeva hommikul?', 'päikseline|ilus'], ['Mida teeb pere, kui pärastlõunal sajab?', 'lähevad kinno'],
        ['Mida teevad nad, kui kinos ei ole lastefilmi?', 'mängivad kodus lauamänge|mängivad lauamänge'],
        ['Miks paneb Anna pühapäeval lastele soojad riided?', 'on külm|pühapäeval on külm'], ['Millal sõidavad nad bussiga?', 'kui tee on libe'],
      ]),
      B.errorfix('083_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Kui ilm on ilus, siis me läheb randa.', 'Kui ilm on ilus, siis me läheme randa.'], ['Kui ma olen aega, siis tulen.', 'Kui mul on aega, siis tulen.'],
        ['Kui homme sadas vihma, siis jääme koju.', 'Kui homme sajab vihma, siis jääme koju.'], ['Kui buss ei tuleb, siis võtan takso.', 'Kui buss ei tule, siis võtan takso.'],
        ['Kui mul on aega, siis ma lugema raamatut.', 'Kui mul on aega, siis ma loen raamatut.'],
      ]),
      B.transformation('083_p_trans', 'Tõsta kui-osa ette.', 'Alusta lauset sõnaga Kui.', [
        ['Jään koju, kui sajab.', 'Kui …', 'Kui sajab, siis jään koju.|Kui sajab, jään koju.'],
        ['Helistan sulle, kui jõuan koju.', 'Kui …', 'Kui jõuan koju, siis helistan sulle.|Kui jõuan koju, helistan sulle.'],
        ['Me läheme randa, kui on palav.', 'Kui …', 'Kui on palav, siis läheme randa.|Kui on palav, siis me läheme randa.'],
        ['Ta kõnnib, kui buss ei tule.', 'Kui …', 'Kui buss ei tule, siis ta kõnnib.|Kui buss ei tule, siis kõnnib ta.'],
        ['Ostan pileti, kui see on odav.', 'Kui …', 'Kui see on odav, siis ostan pileti.|Kui pilet on odav, siis ostan selle.'],
      ]),
      B.wordorder('083_p_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Kui on külm, siis panen mütsi pähe.', 'Kui tee on libe, siis sõidame bussiga.', 'Kui kinos ei ole head filmi, siis jääme koju.', 'Ma tulen sinuga, kui mul on aega.', 'Kui sa oled näljane, siis söö.',
      ]),
      B.table('083_p_cards', 'Kui-kaardid.', 'Lõpeta iga lause oma plaaniga.', 'Kui…, siis…', [
        'Kui homme on ilus ilm, siis … | ', 'Kui mul on vaba õhtu, siis … | ', 'Kui buss ei tule, siis … | ', 'Kui sõber jääb haigeks, siis … | ', 'Kui mul on palju raha, siis … | ',
      ]),
      B.translation('083_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Если завтра будет дождь, мы останемся дома.', 'Если у меня будет время, я позвоню.', 'Если холодно, надень шапку.', 'Я приду, если успею.', 'Если билет дорогой, я его не куплю.']),
      B.dictation('083_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kui on päikseline, sõidame rattaga.', 'Kui sajab, läheme kinno.', 'Kui on külm, pane müts pähe.', 'Kui tee on libe, sõidame bussiga.', 'Ma tulen, kui mul on aega.']),
      B.speaking('083_p_say', 'Kaardimäng.', 'A loeb oma kui-kaardi, B vastab. Siis vahetage.', ['Kui homme on ilus ilm, mida sa teed?', 'Kui buss ei tule, mida sa teed?', 'Kui sõber jääb haigeks, mida sa teed?'], [45, 90], ['Kui …, siis ma…', 'Võib-olla…']),
      B.writing('083_p_write', 'Anna plaan minu jaoks.', 'Kirjuta 5–7 lauset: sinu nädalavahetus eri ilmaga.', [5, 7], ['kui', 'siis', 'sajab', 'päike'], 2),
      B.selfcheck('083_p_self', ['Ma kasutan kui-osas olevikku.', 'Ma panen koma kui-osa järele.', 'Ma tõstan kui-osa lause algusesse.', 'Ma räägin plaanist eri ilmaga.'], 'Kui-laused töötavad'),
    ],
    transfer: [
      B.text('083_t_situation', 'Uus olukord', 'Kursus läheb nädalavahetusel Lahemaale matkama. Sina oled korraldaja. Kuula ilmateadet ja tee plaan A ja plaan B.'),
      B.listening('083_t_listen', 'Kuula: ilmateade.', 'Õpetaja loeb ilmateate kaks korda. Kirjuta 1–2 sõna.', [
        'Head kuulajad, nüüd ilmateade nädalavahetuseks.',
        'Laupäeva hommikul on Põhja-Eestis pilves, aga kuiv. Sooja on kümme kraadi. Kella kahest hakkab sadama vihma. Vihm on tugev ja kestab õhtuni. Rannas puhub tugev tuul.',
        'Pühapäeval on ilm parem. Päike paistab terve päeva ja sooja on viisteist kraadi. Tuul on nõrk. Metsas võib pärast vihma olla märg. Võtke kaasa kummikud! Head nädalavahetust!',
      ], [
        'Laupäeva hommikul on ilm pilves, aga [kuiv].', 'Laupäeval on sooja [kümme|10] kraadi.', 'Vihm hakkab laupäeval kell [kaks|2|14].',
        'Rannas on laupäeval tugev [tuul].', 'Pühapäeval on sooja [viisteist|15] kraadi.', 'Metsa tuleb kaasa võtta [kummikud].',
      ]),
      B.categorize('083_t_pack', 'Mida kaasa võtta?', 'Pane asjad õigesse rühma.', [
        ['Kui sajab', ['vihmajope', 'kummikud', 'vihmavari', 'soe kampsun']],
        ['Kui paistab päike', ['päikeseprillid', 'müts', 'päikesekreem', 'veepudel']],
      ], 'full', 'g_vocab'),
      B.gaps('083_t_gaps', 'Plaan A ja plaan B.', 'Kirjuta sulgudes olev tegusõna olevikus.', [
        'Kui laupäeval [sajab] (sadama), siis läheme pühapäeval.', 'Kui pühapäeval [paistab] (paistma) päike, siis matkame rabas.', 'Kui mets [on] (olema) märg, siis paneme kummikud jalga.',
        'Kui keegi [jääb] (jääma) haigeks, siis ta helistab mulle.', 'Kui buss [hilineb] (hilinema), siis ootame jaamas.', 'Kui me [jõuame] (jõudma) varem, siis sööme rannas.',
      ]),
      B.errorfix('083_t_fix', 'Paranda Jaani sõnum.', 'Kirjuta lause õigesti.', [
        ['Kui laupäeval sajab, siis läheme pühapäev.', 'Kui laupäeval sajab, siis läheme pühapäeval.'], ['Kui pühapäev on ilus ilm, siis matkame.', 'Kui pühapäeval on ilus ilm, siis matkame.'],
        ['Kui sa ei saab tulla, siis helista.', 'Kui sa ei saa tulla, siis helista.'], ['Kui on märg, siis ma panen kummikud.', 'Kui on märg, siis panen kummikud jalga.|Kui on märg, siis ma panen kummikud jalga.'],
      ]),
      B.wordorder('083_t_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Kui laupäeval sajab, siis matkame pühapäeval.', 'Kui mets on märg, siis paneme kummikud jalga.', 'Kui buss hilineb, siis ootame jaamas.', 'Helista mulle, kui sa ei saa tulla.', 'Kui päike paistab, siis võta müts.',
      ]),
      B.translation('083_t_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Если в субботу будет дождь, пойдём в воскресенье.', 'Если светит солнце, возьми шапку.', 'Если лес мокрый, наденем резиновые сапоги.', 'Если не сможешь прийти, позвони мне.', 'Если автобус опоздает, мы подождём.', 'Возьмите с собой воду.']),
      B.dictation('083_t_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Laupäeval hakkab sadama.', 'Pühapäeval paistab päike.', 'Kui sajab, läheme pühapäeval.', 'Võtke kaasa kummikud.', 'Kohtume bussijaamas.']),
      B.planning('083_t_plan', 'Plaan A ja plaan B.', 'Kirjuta märksõnad.', ['Plaan A: mis päev, kuhu, mis kell?', 'Plaan B: kui sajab, siis…?', 'Mida kaasa võtta?', 'Mis siis, kui keegi ei saa tulla?']),
      B.rolecards('083_t_roles', 'Laupäev või pühapäev?', 'Arutage plaani 2–3 minutit ja otsustage.',
        'Sa tahad minna laupäeval. Ütle, mida teha, kui sajab.', 'Sa tahad minna pühapäeval. Räägi ilmateatest ja põhjenda.',
        ['Kui hommikul on kuiv, siis…', 'Kui hakkab sadama, siis…'], ['Pühapäeval paistab päike.', 'Kui laupäeval sajab, siis…']),
      B.speaking('083_t_say', 'Esitle plaani.', 'Tutvusta grupile plaani A ja plaani B 1–2 minutiga.', ['Mis päeval ja kuhu läheme?', 'Mis siis, kui sajab?', 'Mida kaasa võtta?'], [60, 120], ['Kui …, siis…', 'Plaan B on…']),
      B.letter('083_t_letter', 'Sõnum grupile.', 'Kirjuta grupile matka plaan: kui ilm on hea ja kui sajab.', 'Tere, kallid kursusekaaslased!', 'Kohtumiseni!', [30, 50]),
      B.writing('083_t_write', 'Minu plaanid.', 'Kirjuta 4–6 lauset: mida sa teed järgmisel nädalal, kui…', [4, 6], ['kui', 'siis', 'võib-olla'], 2),
      B.selfcheck('083_t_self', ['Ma saan aru ilmateatest.', 'Ma teen plaani A ja plaani B.', 'Ma arutan ja otsustan paarilisega.', 'Ma kirjutan grupile plaani.'], 'Matk on plaanitud'),
    ],
  },

  'a2-084': {
    title: 'Kokkuleppe kinnitamine',
    canDo: 'Ma kirjutan 40–70-sõnalise sõnumi, millega kinnitan või muudan kokkulepet, ja annan kogu vajaliku info: päev, kell, koht, aadress ja mida kaasa võtta.',
    discover: [
      B.text('084_d_intro', 'Kaks sõnumit', 'Sofia saab kaks sõnumit. Esimene: „Kohtume homme!” Teine: „Tere, Sofia! Kinnitan: kohtume homme, neljapäeval, kell 18 kohvikus „Mokka”, Rüütli 12. Anna teada, kui jääd hiljaks. Jaan”'),
      B.truefalse('084_d_tf', 'Kumb sõnum on parem?', 'Loe sõnumeid. Õige või vale?', [
        ['Esimesest sõnumist ei tea Sofia kellaaega.', true], ['Teises sõnumis on aadress.', true], ['Kohtumine on reedel.', false],
        ['Jaan palub teada anda, kui Sofia jääb hiljaks.', true], ['Esimene sõnum on täpsem kui teine.', false],
      ]),
      B.vocab('084_d_vocab', 'Sõnumi sõnad', ['kinnitama — подтверждать', 'kinnitus — подтверждение', 'muutma — изменять', 'muutus — изменение', 'aadress — адрес', 'anna teada — сообщи', 'kohtume — встречаемся', 'sobib — подходит', 'ei sobi — не подходит', 'kaasa võtma — взять с собой', 'ootan vastust — жду ответа', 'korrus — этаж'], '2'),
      B.reading('084_d_read', 'Loe kolme sõnumit.', 'Loe sõnumid. Vasta tähega (A, B, C) või lühidalt.', 'Kolm sõnumit', [
        'A. Tere, Markus! Kinnitan meie kohtumise. Ootan sind esmaspäeval kell kümme kontoris. Aadress on Pärnu maantee 15, teine korrus. Palun võta kaasa pass. Kui jääd hiljaks, anna teada. Viktor',
        '',
        'B. Kallis Anna! Kahjuks laupäev mulle ei sobi, sest mu poeg on haige. Kas pühapäev kell kaks sobib? Kohtume samas kohas, kohvikus „Kask”. Kirjuta, kas see aeg sobib. Liis',
        '',
        'C. Hei, Jaan! Muutus: trenn ei ole täna spordihallis, vaid staadionil. Aeg on sama, kell kuus. Võta kaasa vesi ja soojad riided. Näeme! Treener Sofia',
      ], [
        ['Milline sõnum kinnitab kohtumist?', 'A'], ['Milline sõnum muudab aega?', 'B'], ['Milline sõnum muudab kohta?', 'C'],
        ['Mida peab Markus kaasa võtma?', 'pass|passi'], ['Miks laupäev Liisile ei sobi?', 'poeg on haige|tema poeg on haige'], ['Mis kell on Jaani trenn?', 'kuus|kell kuus|18'],
      ]),
      B.notice('084_d_notice', 'Märka sõnumi osi.', ['1. Tervitus: **Tere, Markus! / Kallis Anna!**', '2. Mis on uut? **Kinnitan… / Kahjuks … ei sobi, sest…**', '3. Info: **päev + kell + koht (+ aadress)**', '4. Palve: **Võta kaasa… / Anna teada, kui…**', '5. Lõpp: **Näeme! / Ootan vastust.** + nimi'], 'full'),
      B.tip('084_d_rule', 'Enne saatmist kontrolli', ['Kas sõber teab: mis päev? mis kell? kus?', 'Kas aadress on täpne (tänav, maja, korrus)?', 'Kas on selge, mida kaasa võtta?', 'Kas sõber teab, mida ta peab vastama?'], 'full'),
      B.categorize('084_d_sort', 'Sõnumi osad.', 'Pane laused õigesse rühma.', [
        ['Tervitus', ['Tere, Markus!', 'Kallis Anna!', 'Hei, Jaan!']],
        ['Kinnitus või muutus', ['Kinnitan meie kohtumise.', 'Kahjuks reede ei sobi.', 'Muutus: trenn on staadionil.']],
        ['Palve', ['Anna teada, kui jääd hiljaks.', 'Võta kaasa pass.', 'Kirjuta, kas aeg sobib.']],
        ['Lõpp', ['Näeme!', 'Ootan vastust.', 'Kõike head!']],
      ], 'full', 'g_notice'),
      B.table('084_d_info', 'Mis on sõnumis?', 'Kirjuta iga sõnumi päev, kell ja koht.', 'sõnum, päev, kell, koht', [
        'A | [esmaspäeval|esmaspäev] | [kell kümme|10|kümme] | [kontoris|Pärnu maantee 15]',
        'B | [pühapäeval|pühapäev] | [kell kaks|2|14|kaks] | [kohvikus „Kask”|kohvikus Kask|kohvikus]',
        'C | [täna] | [kell kuus|6|18|kuus] | [staadionil]',
      ], 'g_read'),
      B.choice('084_d_missing', 'Mis info puudub?', 'Loe sõnumit. Mida adressaat veel ei tea?', [
        ['„Kohtume reedel kohviku ees.”', 'kellaaeg', 'päev', 'koht'],
        ['„Tule kell viis minu juurde!” (Sõber ei tea sinu aadressi.)', 'aadress', 'kellaaeg', 'päev'],
        ['„Trenn on homme spordihallis.”', 'kellaaeg', 'koht', 'päev'],
        ['„Ootan sind kell kuus kino ees.”', 'päev', 'koht', 'kellaaeg'],
        ['„Esmaspäeval kell kümme, Kooli 5.” (Majas on viis korrust.)', 'korrus', 'tänav', 'kellaaeg'],
      ]),
      B.errorfix('084_d_fix', 'Paranda sõnumi viga.', 'Kirjuta lause õigesti.', [
        ['Kohtume reedel kell kuus kohvik.', 'Kohtume reedel kell kuus kohvikus.'], ['Anna mulle teadma, kui jääd hiljaks.', 'Anna mulle teada, kui jääd hiljaks.'],
        ['Kahjuks reede ei sobib mulle.', 'Kahjuks reede ei sobi mulle.|Kahjuks ei sobi reede mulle.'], ['Ma ootan sinu vastus.', 'Ma ootan sinu vastust.'],
        ['Palun võta kaasas pass.', 'Palun võta pass kaasa.|Palun võta kaasa pass.'],
      ]),
      B.wordorder('084_d_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Kinnitan meie kohtumise esmaspäeval kell kümme.', 'Kahjuks laupäev mulle ei sobi.', 'Palun võta kaasa soojad riided.', 'Anna teada, kui sa jääd hiljaks.', 'Kontor on teisel korrusel.',
      ]),
      B.translation('084_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Подтверждаю нашу встречу.', 'К сожалению, суббота мне не подходит.', 'Офис на втором этаже.', 'Возьми с собой паспорт.', 'Сообщи, если опоздаешь.']),
      B.dictation('084_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kinnitan meie kohtumise.', 'Kohtume esmaspäeval kell kümme.', 'Aadress on Pärnu maantee 15.', 'Palun võta kaasa pass.', 'Anna teada, kui jääd hiljaks.']),
      B.planning('084_d_plan', 'Enne kirjutamist.', 'Kirjuta märksõnad.', ['Kellele sa kirjutad?', 'Mis päev ja kell?', 'Kus? Aadress?', 'Mida palud?']),
      B.letter('084_d_letter', 'Kirjuta kinnitus.', 'Kinnita Liisile kohtumine: päev, kell, koht, palve.', 'Tere, Liis!', 'Näeme!', [40, 60]),
      B.speaking('084_d_say', 'Loe ja kontrolli.', 'Loe oma sõnum paarilisele. Paariline ütleb, mis info puudub.', ['Mis päev?', 'Mis kell?', 'Kus?', 'Mida kaasa võtta?'], [45, 90]),
      B.selfcheck('084_d_self', ['Ma leian sõnumist päeva, kella ja koha.', 'Ma märkan, mis info puudub.', 'Ma tean sõnumi viit osa.', 'Ma kirjutan kinnituse 40–60 sõnaga.'], 'Sõnum on täpne'),
    ],
    practice: [
      B.gaps('084_p_gaps', 'Sõnumi sõnad.', 'Kirjuta sobiv sõna. Kaks sõna jääb üle.', [
        'Kahjuks kolmapäev mulle ei [sobi].', 'Kas reede [sobib] sulle?', '[Kinnitan] meie kohtumise.', 'Palun anna mulle [teada], kas tuled.',
        'Võta [kaasa] vihmavari.', 'Kontori [aadress] on Kooli 5.', '[Ootan] sinu vastust!',
      ], ['sobi', 'sobib', 'kinnitan', 'teada', 'kaasa', 'aadress', 'ootan', 'sobima', 'teadma']),
      B.cloze('084_p_cloze', 'Liisi vastus.', 'Vali igasse lünka sobiv sõna.', 'Tere, Viktor!', [
        'Aitäh kutse eest! Kahjuks laupäev mulle {*ei sobi|ei sobib|ei sobinud}, sest mul on {*tööl|tööle|töölt} koosolek.',
        'Kas pühapäev {*sobib|sobi|sobima} sulle? Võime kohtuda kell kaks {*kohviku|kohvik|kohvikus} ees.',
        'Kui sul ei ole {*aega|aeg|ajal}, siis anna mulle {*teada|teadma|teab}. Ma võtan {*kaasa|kaasas|kaasast} sinu raamatu.',
        'Ootan sinu {*vastust|vastus|vastusest}!',
        '',
        'Liis',
      ]),
      B.match('084_p_match', 'Sõnum ja vastus.', 'Ühenda sõnum ja sobiv vastus.', [
        ['Kas homme kell viis sobib?', 'Sobib, näeme kell viis!'], ['Kahjuks ma ei saa täna tulla.', 'Pole hullu. Kas homme saad?'],
        ['Kus me kohtume?', 'Kino ees, Vabaduse 3.'], ['Mida ma pean kaasa võtma?', 'Võta kaasa pass.'], ['Ma jään kümme minutit hiljaks.', 'Pole probleemi, ma ootan.'],
      ], 'full', 'g_use'),
      B.choice('084_p_choice', 'Kinnitus või muutus?', 'Mida sõnum teeb? Vali õige vastus.', [
        ['„Jah, kolmapäeval kell kuus sobib. Näeme!”', 'kinnitab', 'muudab aega', 'muudab kohta'],
        ['„Kahjuks kell kuus ei saa. Kas kell seitse sobib?”', 'muudab aega', 'kinnitab', 'muudab kohta'],
        ['„Aeg on sama, aga kohtume kino ees, mitte kohvikus.”', 'muudab kohta', 'muudab aega', 'kinnitab'],
        ['„Kinnitan: reedel kell kaks, Kooli 5.”', 'kinnitab', 'muudab kohta', 'muudab aega'],
        ['„Koosolek ei ole esmaspäeval, vaid teisipäeval.”', 'muudab päeva', 'muudab kohta', 'kinnitab'],
      ], 'full', 'g_read'),
      B.transformation('084_p_trans', 'Kirjuta sõnumisse.', 'Kirjuta lause antud sõnadega.', [
        ['Reede sobib mulle.', 'kahjuks', 'Kahjuks reede mulle ei sobi.|Kahjuks reede ei sobi mulle.'],
        ['Ma tulen kell viis.', 'kinnitan, et', 'Kinnitan, et tulen kell viis.'],
        ['Kas sa tuled?', 'anna teada', 'Anna teada, kas sa tuled.|Anna teada, kas tuled.'],
        ['Võta pass.', 'palun … kaasa', 'Palun võta pass kaasa.|Palun võta kaasa pass.'],
        ['Kohtume kell kuus.', 'kella kuue asemel kell seitse', 'Kohtume kella kuue asemel kell seitse.'],
      ]),
      B.errorfix('084_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Kinnitan meie kohtumine.', 'Kinnitan meie kohtumise.|Kinnitan meie kohtumist.'], ['Kohtume esmaspäev kell kümme.', 'Kohtume esmaspäeval kell kümme.'],
        ['Kontor on teine korrus.', 'Kontor on teisel korrusel.'], ['Ootan sind kino ees kell kuus õhtu.', 'Ootan sind kino ees kell kuus õhtul.'],
        ['Võta kaasa soe riided.', 'Võta kaasa soojad riided.'],
      ]),
      B.wordorder('084_p_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Kas pühapäev kell kaks sobib sulle?', 'Me ei kohtu kohvikus, vaid kino ees.', 'Palun anna mulle reedeks teada.', 'Ootan sind kontoris teisel korrusel.', 'Aeg on sama, aga koht muutub.',
      ]),
      B.translation('084_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Время то же, но место меняется.', 'Встречаемся не в кафе, а у кино.', 'Сообщи мне до пятницы.', 'Жду тебя на втором этаже.', 'Подтверждаю: в пятницу в два.']),
      B.dictation('084_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kahjuks laupäev ei sobi.', 'Kas pühapäev sobib sulle?', 'Kohtume kohviku ees.', 'Anna mulle teada.', 'Ootan sinu vastust!']),
      B.speaking('084_p_say', 'Telefonis.', 'Helista sõbrale ja muuda kohtumise aega. Siis kinnitage.', ['Miks aeg ei sobi?', 'Mis on uus aeg?', 'Kas koht jääb samaks?'], [45, 90], ['Kahjuks…, sest…', 'Kas … sobib?', 'Kinnitan…']),
      B.writing('084_p_write', 'Kolm lühisõnumit.', 'Kirjuta 3 sõnumit: kinnitus, uus aeg ja uus koht.', [4, 6], ['kinnitan', 'kahjuks', 'mitte', 'vaid'], 3),
      B.letter('084_p_letter', 'Muuda kokkulepet.', 'Kohtumine on homme. Muuda aega: miks, uus aeg, koht, palve.', 'Tere, Anna!', 'Vabandust ja kohtumiseni!', [40, 60]),
      B.selfcheck('084_p_self', ['Ma valin õige sõna: sobib / ei sobi.', 'Ma kirjutan kinnituse.', 'Ma kirjutan, mis muutub: mitte …, vaid …', 'Ma kirjutan muutmise sõnumi 40–60 sõnaga.'], 'Sõnumid on selged'),
    ],
    transfer: [
      B.text('084_t_situation', 'Uus olukord', 'Sinu sõber Viktor kolib. Ta saatis sõpradele sõnumi. Sa saad aidata, aga ainult pärastlõunal. Vasta Viktorile nii, et ta ei pea midagi uuesti küsima.'),
      B.reading('084_t_read', 'Loe Viktori sõnumit.', 'Loe sõnum ja vasta küsimustele.', 'Kolimine', [
        'Tere, sõbrad! Ma kolin laupäeval, 12. oktoobril, uude korterisse. Kas te saate mind aidata? Alustame kell üheksa hommikul vanas korteris, Kase tänav 4. Auto tuleb kell kümme ja seda tuleb kiiresti laadida. Uus korter on Tamme tee 21, viiendal korrusel. Kahjuks ei ole majas lifti! Palun võtke kaasa töökindad. Lõunaks teen pitsat ja õhtul on saun. Kui te saate tulla ainult pärastlõunal, siis tulge otse uude korterisse. Palun andke reedeks teada, kas tulete ja mis kell. Kui teil on küsimusi, helistage mulle õhtul. Aitäh, sõbrad! Viktor',
      ], [
        ['Millal Viktor kolib?', 'laupäeval|12. oktoobril|laupäeval, 12. oktoobril'], ['Kus töö hommikul algab?', 'vanas korteris|Kase tänav 4|Kase tänaval'],
        ['Miks on töö raske?', 'majas ei ole lifti|lifti ei ole'], ['Kuhu peab minema, kui saad tulla pärastlõunal?', 'uude korterisse|otse uude korterisse|Tamme tee 21'],
        ['Mida peab Viktorile reedeks teatama?', 'kas tuled ja mis kell|kas tuled|mis kell tuled'],
      ]),
      B.choice('084_t_choice', 'Mida Viktor peab teadma?', 'Vali, mis on sinu vastuses kõige tähtsam.', [
        ['Sa saad tulla ainult pärastlõunal. Mida kirjutad?', 'Tulen kell kaks uude korterisse.', 'Tulen kell üheksa vanasse korterisse.', 'Ma ei tule laupäeval.'],
        ['Sul ei ole töökindaid. Mida küsid?', 'Kas sul on mulle kindaid?', 'Kas sul on lift?', 'Kas auto tuleb kell kümme?'],
        ['Sa tuled koos õega. Mida kirjutad?', 'Mu õde tuleb ka appi.', 'Mu õde elab Tamme teel.', 'Mu õde ei söö pitsat.'],
        ['Sa ei leia uut maja. Mida küsid?', 'Mis on maja number?', 'Mis on sauna number?', 'Mis kell on lõuna?'],
        ['Sa pead kell kuus lahkuma. Mida kirjutad?', 'Kahjuks pean kell kuus ära minema.', 'Kahjuks tulen kell kuus.', 'Saunas olen kell kuus.'],
      ], 'full', 'g_use'),
      B.gaps('084_t_gaps', 'Vastus Viktorile.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Ma saan tulla alles [pärastlõunal] (pärastlõuna).', 'Tulen otse [uude] (uus) korterisse.', 'Olen seal [kella] (kell) kahest kuni kuueni.',
        'Kahjuks [pean] (pidama) kell kuus lahkuma.', 'Mul ei ole [töökindaid] (töökindad).', 'Kas sa saad mulle [kindad|kindaid] (kindad) anda?',
      ]),
      B.errorfix('084_t_fix', 'Paranda Jaani vastus.', 'Kirjuta lause õigesti.', [
        ['Ma tulen laupäev kell kaks.', 'Ma tulen laupäeval kell kaks.'], ['Kahjuks ma ei saa hommikul tulema.', 'Kahjuks ma ei saa hommikul tulla.'],
        ['Ma tulen otse uus korterisse.', 'Ma tulen otse uude korterisse.'], ['Ma ei tea teie uus aadress.', 'Ma ei tea teie uut aadressi.'],
        ['Ma võtan kaasa minu vend.', 'Ma võtan kaasa oma venna.|Ma võtan oma venna kaasa.'],
      ]),
      B.wordorder('084_t_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Ma saan tulla alles pärastlõunal.', 'Tulen kell kaks otse uude korterisse.', 'Kahjuks pean ma kell kuus lahkuma.', 'Kas sul on mulle töökindaid?', 'Minu vend tuleb ka appi.',
      ]),
      B.translation('084_t_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Я могу прийти только после обеда.', 'Приду прямо в новую квартиру.', 'К сожалению, в шесть мне надо уйти.', 'Мой брат тоже придёт помочь.', 'Какой номер дома?']),
      B.planning('084_t_plan', 'Enne vastamist.', 'Kirjuta märksõnad.', ['Kas tuled? Kellega?', 'Mis kellast mis kellani?', 'Kuhu tuled?', 'Mida küsid või palud?']),
      B.letter('084_t_letter', 'Vastus Viktorile.', 'Kirjuta 40–60 sõna: kas tuled, mis kell, kuhu, küsimus.', 'Tere, Viktor!', 'Näeme laupäeval!', [40, 60]),
      B.writing('084_t_write', 'Plaan muutus.', 'Reedel muutub su plaan. Kirjuta Viktorile 4–6 lauset.', [4, 6], ['kahjuks', 'sest', 'mitte', 'vaid'], 2),
      B.rolecards('084_t_roles', 'Viktor helistab.', 'Viktor helistab ja täpsustab. Rääkige 2 minutit.',
        'Oled Viktor. Küsi, mis kell sõber tuleb ja kas ta toob kindad.', 'Oled sõber. Kinnita aeg, koht ja ütle, kes tuleb kaasa.',
        ['Mis kell sa tuled?', 'Kas sa tead aadressi?', 'Kas sa võtad kindad?'], ['Tulen kell…', 'Kinnitan…', 'Minuga tuleb…']),
      B.speaking('084_t_say', 'Häälsõnum.', 'Jäta Viktorile 1-minutiline häälsõnum: kinnita aeg ja koht.', ['Kes räägib?', 'Mis kell ja kuhu tuled?', 'Mida palud?'], [45, 75]),
      B.rubric('084_t_rubric', 'Kas sõnumis on kõik?', 'Kontrolli oma vastust Viktorile.', ['Kas tuled ja kellega.', 'Mis kellast mis kellani.', 'Kuhu tuled: vana või uus korter.', 'Üks küsimus või palve.', '40–60 sõna, tervitus ja lõpp.']),
      B.selfcheck('084_t_self', ['Ma leian sõnumist kogu vajaliku info.', 'Ma kinnitan kokkuleppe kirjalikult.', 'Ma kirjutan, kui plaan muutub.', 'Ma kinnitan kokkuleppe telefonis.'], 'Viktor teab kõike'),
    ],
  },
};
