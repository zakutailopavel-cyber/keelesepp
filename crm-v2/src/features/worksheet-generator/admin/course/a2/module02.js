// A2 course (A1 → A2 roadmap), module 2 „Pere, inimesed ja kirjeldamine”, lessons a2-006 … a2-010 (written after
// module 1, owner 2026-10-13). Family and close people (mul on üks vend / kaks venda, mul ei ole …), whose is it
// (kelle? — the genitive of names, family words and pronouns: Markuse, venna, õe, minu, nende), appearance and
// character (Ta on pikk. Tal on pikad heledad juuksed. väga / üsna / natuke; pikem kui), short personal profiles and
// questions about a person (kes? milline? kui vana? kus elab? mida teeb?). The recurring people keep their module 1
// facts; the textbook cast follows docs/TEXTBOOK_ART_BIBLE.md §4 (Anna 28 office, Markus 34 warehouse, Liis 45
// service desk / teacher, Viktor 63 pensioner, Sofia 19 student, Jaan 38 café owner). Other people: Olga 34 from Narva
// with her son Daniil, Oksana 35 from Ukraine with her husband and daughter Mia, Taras 29 a programmer from Ukraine,
// Liene 22 a student from Latvia, Urmas 52 a bus driver, Kati 20 a medical student, Martin Kati's colleague, Siim
// Anna's colleague. Harno A2 formats: short
// listenings with 1–2-word answers (read twice), a notice to read, a message of 30–50 words, describing a photo.
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-02', course: 'a2', title: 'Pere, inimesed ja kirjeldamine', level: 'A2' };

export const LESSONS = {
  'a2-006': {
    title: 'Pere ja lähedased',
    canDo: 'Ma räägin oma perest ja lähedastest: nimetan vähemalt neli inimest ja ütlen igaühe kohta ühe detaili (vanus, elukoht või töö).',
    discover: [
      B.text('006_d_situation', 'Perefoto', 'Lõunapausil näitab Anna kolleegile Siimule telefonis perefotot. Fotol on palju inimesi. Siim küsib: „Kes see on? Kas see on sinu ema?” Anna naeratab ja hakkab rääkima.'),
      B.vocab('006_d_vocab', 'Pere ja lähedased', ['pere — семья', 'ema — мать', 'isa — отец', 'vanemad — родители', 'laps — ребёнок', 'poeg — сын', 'tütar — дочь', 'vend — брат', 'õde — сестра', 'vanaema — бабушка', 'vanaisa — дедушка', 'abikaasa — супруг(а)', 'abielus olema — быть в браке', 'lähedane — близкий человек']),
      B.reading('006_d_read', 'Loe: Anna räägib oma perest.', 'Loe teksti ja vasta küsimustele lühidalt.', 'Minu pere',
        'Mul on suur pere. Minu ema nimi on Tiina. Ta on 58 aastat vana ja töötab koolis. Minu isa nimi on Peeter. Ta on bussijuht. Mu vanemad elavad Pärnus. Mul on üks vend ja üks õde. Minu vend Andres on 30 aastat vana. Ta elab Tartus ja töötab hotellis. Minu õde Kristi on noorem kui mina. Ta on 20 ja õpib ülikoolis. Kristi elab ühiselamus. Minu ema ja isa on väga lahked. Igal pühapäeval helistan ma neile. Ma olen abielus. Minu abikaasa nimi on Igor. Meil on kaks last, poeg ja tütar. Poeg Mark on seitse aastat vana ja käib esimeses klassis. Tütar Laura on neli ja käib lasteaias. Minu vanaema elab maal. Ta on 80 aastat vana, aga väga aktiivne. Vanaisa ei ela enam. Suvel sõidame kõik vanaema juurde. Siis on maja täis inimesi.',
        [['Kus Anna vanemad elavad?', 'Pärnus'], ['Mis tööd teeb Anna isa?', 'ta on bussijuht|bussijuht'], ['Kus töötab Anna vend?', 'hotellis|Tartus hotellis'], ['Mida teeb Anna õde?', 'õpib ülikoolis|ta õpib ülikoolis'], ['Mitu last on Annal?', 'kaks|kaks last'], ['Kus elab Anna vanaema?', 'maal']]),
      B.truefalse('006_d_tf', 'Õige või vale?', 'Loe Anna teksti uuesti.', [
        ['Anna vanemad elavad Tartus.', false], ['Anna vend on 30 aastat vana.', true], ['Kristi on noorem kui Anna.', true],
        ['Anna on abielus.', true], ['Laura käib koolis.', false], ['Anna vanaisa elab maal.', false],
      ]),
      B.notice('006_d_notice', 'Märka: mul on …', ['Mul on **üks vend**. — Mul on **kaks venda**.', 'Mul on **üks õde**. — Mul on **kaks õde**.', 'Meil on **üks laps**. — Meil on **kaks last**.', 'Eitus: Mul **ei ole venda**. Mul **ei ole last**.', 'ema + isa = **vanemad**; poeg + tütar = **lapsed**']),
      B.diagram('006_d_tree', 'mind', { title: 'Anna pere', instruction: 'Kirjuta Anna pereliikmete nimed.', center: 'Anna', nodes: 'ema\n- [Tiina]\nisa\n- [Peeter]\nvend\n- [Andres]\nõde\n- [Kristi]\nabikaasa\n- [Igor]\ntütar\n- [Laura]' }, 'full'),
      B.categorize('006_d_sort', 'Mees või naine?', 'Pane sõnad õigesse rühma.', [
        ['Mees', ['isa', 'vend', 'poeg', 'vanaisa']], ['Naine', ['ema', 'õde', 'tütar', 'vanaema']], ['Mees või naine', ['laps', 'abikaasa', 'lähedane']],
      ]),
      B.match('006_d_match', 'Kes see on?', 'Ühenda selgitus ja sõna.', [
        ['ema ema', 'vanaema'], ['isa isa', 'vanaisa'], ['ema ja isa koos', 'vanemad'], ['minu mees või naine', 'abikaasa'], ['poeg ja tütar koos', 'lapsed'], ['tüdruk, kes on minu laps', 'tütar'],
      ]),
      B.wordforms('006_d_forms', 'Üks → kaks', 'Kirjuta sõna õiges vormis.', [
        ['vend', 'kaks …', 'venda'], ['õde', 'kolm …', 'õde'], ['laps', 'kaks …', 'last'], ['poeg', 'kaks …', 'poega'], ['tütar', 'kolm …', 'tütart'], ['vend', 'mul ei ole …', 'venda'],
      ]),
      B.gaps('006_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Minu ema ja isa on minu [vanemad].', 'Mul on üks [õde], tema nimi on Kristi.', 'Ma olen [abielus], mu mehe nimi on Igor.', 'Meil on kaks [last], poeg ja tütar.', 'Minu [vanaema] on 80 aastat vana.', 'Mul ei ole [venda].',
      ], ['vanemad', 'õde', 'abielus', 'last', 'vanaema', 'venda', 'lapsed', 'vend']),
      B.wordorder('006_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Minu vanemad elavad Pärnus.', 'Mul on üks vend ja üks õde.', 'Meie poeg käib koolis.', 'Suvel sõidame vanaema juurde.', 'Minu õde õpib ülikoolis.']),
      B.listening('006_d_listen', 'Kuulamine. Tarase pere.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Taras.', 'Minu pere elab Ukrainas, Lvivis.', 'Minu ema on arst ja isa on insener.', 'Mul on üks vend. Tema nimi on Oleg.',
        'Oleg on kakskümmend viis aastat vana ja õpib ülikoolis.', 'Mul ei ole õde.', 'Ma ei ole abielus, aga mul on tüdruksõber. Ta elab ka Tartus.',
      ], [
        'Tarase pere elab [Lvivis|Ukrainas].', 'Tarase ema on [arst].', 'Tarase isa on [insener].', 'Tarase venna nimi on [Oleg].', 'Oleg on [25|kakskümmend viis] aastat vana.', 'Taras [ei ole] abielus.',
      ]),
      B.errorfix('006_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Mul on kaks vend.', 'Mul on kaks venda.'], ['Meil on kolm laps.', 'Meil on kolm last.'], ['Minu vanemad elab Pärnus.', 'Minu vanemad elavad Pärnus.'],
        ['Ma olen abielu.', 'Ma olen abielus.'], ['Mul on kaks tütar.', 'Mul on kaks tütart.'], ['Vanaema on 80 aastat vanad.', 'Vanaema on 80 aastat vana.'],
      ]),
      B.translation('006_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['У меня есть брат и сестра.', 'Мои родители живут в Нарве.', 'У нас двое детей.', 'Я замужем.', 'Моей бабушке 75 лет.']),
      B.speaking('006_d_say', 'Minu pere.', 'Räägi paarilisele oma perest. Räägi umbes üks minut.', [
        'Kui suur on sinu pere?', 'Kes on sinu pereliikmed?', 'Kus nad elavad?', 'Mida nad teevad?', 'Kes on sulle kõige lähedasem?',
      ], [60, 90], ['Mul on…', 'Minu … elab …', 'Ta töötab …']),
      B.writing('006_d_write', 'Minu lähedased', 'Kirjuta oma perest 5–7 lauset. Kirjuta vähemalt neljast inimesest.', [5, 7], ['mul on', 'ema', 'elab', 'töötab'], 2),
      B.selfcheck('006_d_self', ['Ma nimetan pereliikmeid: ema, isa, vend, õde, vanemad, lapsed.', 'Ma ütlen: mul on kaks venda, mul ei ole õde.', 'Ma saan aru lühikesest tekstist kellegi pere kohta.', 'Ma räägin oma perest vähemalt neljast inimesest.'], 'Minu pere'),
    ],
    practice: [
      B.crossword('006_p_cross', 'Pere sõnad.', 'Kirjuta sõna vihje järgi.', [
        ['Minu ema ema', 'vanaema'], ['Minu vanemate poeg, aga mitte mina', 'vend'], ['Minu vanemate tütar, aga mitte mina', 'õde'],
        ['Minu mees või naine', 'abikaasa'], ['Ema ja isa koos', 'vanemad'], ['Minu isa isa', 'vanaisa'],
      ]),
      B.listening('006_p_listen', 'Kuulamine. Oksana pere.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Minu nimi on Oksana.', 'Ma elan Tartus koos mehe ja tütrega.', 'Minu tütar Mia on kuus aastat vana.', 'Ta käib lasteaias.',
        'Minu mees töötab ehitusel.', 'Minu vanemad elavad Ukrainas.', 'Mul on üks õde. Ta elab Poolas ja on õpetaja.',
      ], [
        'Oksana elab [Tartus].', 'Mia on [kuus|6] aastat vana.', 'Mia käib [lasteaias].', 'Oksana mees töötab [ehitusel].', 'Oksana vanemad elavad [Ukrainas].', 'Oksana õde on [õpetaja].',
      ]),
      B.choice('006_p_choice', 'Vali õige sõna.', 'Vali lünka sobiv sõna.', [
        ['Minu isa ja ema on minu ___.', 'vanemad', 'lapsed', 'õed'], ['Mul on kaks ___.', 'venda', 'vend', 'vennad'],
        ['Meil ei ole ___.', 'last', 'laps', 'lapsed'], ['Minu ema ema on minu ___.', 'vanaema', 'tädi', 'tütar'],
        ['Ma olen ___, minu mehe nimi on Igor.', 'abielus', 'abikaasa', 'pere'], ['Mul on kaks ___: Mari ja Kati.', 'õde', 'õed', 'venda'],
      ], 'full', 'g_notice'),
      B.gaps('006_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Mul on kaks [venda]. (vend)', 'Meil on kolm [last]. (laps)', 'Neil on kaks [tütart]. (tütar)', 'Minu vanemad [elavad] maal. (elama)', 'Minu vend [on] abielus. (olema)', 'Tal on kaks [poega]. (poeg)',
      ]),
      B.transformation('006_p_neg', 'Ütle eitavalt.', 'Kirjuta lause eitavas vormis.', [
        ['Mul on vend.', 'Mul ei ole …', 'Mul ei ole venda.'], ['Mul on õde.', 'Mul ei ole …', 'Mul ei ole õde.'], ['Meil on laps.', 'Meil ei ole …', 'Meil ei ole last.'],
        ['Tal on tütar.', 'Tal ei ole …', 'Tal ei ole tütart.'], ['Neil on poeg.', 'Neil ei ole …', 'Neil ei ole poega.'], ['Ma olen abielus.', 'Ma ei …', 'Ma ei ole abielus.'],
      ]),
      B.dialogue('006_p_dialog', 'Perefoto.', 'Täida dialoog sobivate sõnadega.', 'Siim', 'Anna', [
        ['A', 'Anna, kas see naine fotol on sinu [ema]?'], ['B', 'Jah, see on minu ema Tiina. Mees tema kõrval on minu [isa].'], ['A', 'Ja kes see noor mees on?'],
        ['B', 'See on minu [vend] Andres. Tal on naine, ta on [abielus].'], ['A', 'Kas neil on lapsi?'], ['B', 'Ei ole. Aga kui suur on sinu [pere], Siim?'],
        ['A', 'Meil on neli inimest: mina, naine ja kaks [last].'], ['B', 'Kui [vanad] su lapsed on?'], ['A', 'Poeg on kaksteist ja tütar on üheksa.'],
      ]),
      B.manymatch('006_p_who', 'Küsimus ja vastus.', 'Ühenda küsimus ja vastus.', ['Kes on sinu ema ema?', 'Mitu last teil on?', 'Kas sa oled abielus?', 'Kus su vanemad elavad?', 'Kui vana su vend on?'], ['Minu vanaema Maria.', 'Meil on kaks last.', 'Jah, olen abielus.', 'Nad elavad Narvas.', 'Ta on 30 aastat vana.'], 'full', 'g_use'),
      B.table('006_p_table', 'Üks, kaks, ei ole.', 'Kirjuta sõna õiges vormis.', 'Üks, Kaks, Ei ole', [
        'üks vend | kaks [venda] | ei ole [venda]', 'üks õde | kaks [õde] | ei ole [õde]', 'üks laps | kaks [last] | ei ole [last]', 'üks poeg | kaks [poega] | ei ole [poega]', 'üks tütar | kaks [tütart] | ei ole [tütart]',
      ], 'g_notice'),
      B.errorfix('006_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Mul on kolm õed.', 'Mul on kolm õde.'], ['Tal ei ole vend.', 'Tal ei ole venda.'], ['Minu lapsed käib koolis.', 'Minu lapsed käivad koolis.'],
        ['Meil on üks last.', 'Meil on üks laps.'], ['Minu vanaisa elavad maal.', 'Minu vanaisa elab maal.'], ['Tal on kaks tütar.', 'Tal on kaks tütart.'],
      ]),
      B.wordorder('006_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Minu tütar käib lasteaias.', 'Oksana mees töötab ehitusel.', 'Mul ei ole venda.', 'Meie pere on väike.', 'Kas sul on õde või vend?']),
      B.dictation('006_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Mul on üks vend ja kaks õde.', 'Minu vanemad elavad maal.', 'Meil on kaks last.', 'Minu vanaema on väga aktiivne.', 'Ma ei ole abielus.'], 5),
      B.translation('006_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['У меня нет брата.', 'У нас трое детей.', 'Мой брат женат.', 'Моя дочь ходит в детский сад.', 'Где живут твои родители?', 'У неё две сестры.']),
      B.speaking('006_p_say', 'Küsi ja vasta.', 'Küsi paarilise pere kohta. Siis räägi grupile tema perest.', [
        'Kas sul on õde või vend?', 'Kus su vanemad elavad?', 'Kas sa oled abielus?', 'Kas sul on lapsi?', 'Kes on sulle kõige lähedasem?',
      ], [60, 90]),
      B.writing('006_p_write', 'Paarilise pere.', 'Kirjuta paarilise perest 5–6 lauset.', [5, 6], ['tal on', 'elab', 'töötab'], 2),
      B.selfcheck('006_p_self', ['Ma saan aru lühikesest tekstist kellegi pere kohta.', 'Ma kirjutan õigesti: kaks venda, kaks last, ei ole õde.', 'Ma küsin teise inimese pere kohta.', 'Ma kirjutan teise inimese perest 5 lauset.'], 'Pere sõnad on käes'),
    ],
    transfer: [
      B.text('006_t_situation', 'Vanaema sünnipäev', 'Anna vanaemal on varsti 80. sünnipäev. Kogu pere sõidab maale. Anna näitab Siimule sugupuud ja räägib, kes on kes. Sina räägid ka oma perest ja vastad kutsele.'),
      B.reading('006_t_invite', 'Loe kutset.', 'Loe Anna ema kirja ja vasta küsimustele.', 'Kallid lapsed ja lapselapsed!',
        'Laupäeval, 14. juunil on vanaema Maria 80. sünnipäev. Me tähistame sünnipäeva maal, vanaema majas. Pidu algab kell 14. Tulge kõik: lapsed, lapselapsed ja teised sugulased! Andres, palun too grill. Kristi, palun võta kaasa kitarr. Anna ja Igor, teie lapsed saavad mängida aias. Õhtul sööme koos ja vaatame vanu perefotosid. Kes tahab, võib jääda ööseks. Majas on kolm tuba ja aias on telk. Vanaema tahab näha kõiki oma lapselapsi. Ta küpsetab ise suure koogi. Palun ärge ostke kallist kingitust. Palun kirjutage mulle reedeni, kas te tulete. Ootame teid! Ema Tiina',
        [['Millal on vanaema sünnipäev?', 'laupäeval|14. juunil|laupäeval, 14. juunil'], ['Kus on pidu?', 'maal|vanaema majas|maal, vanaema majas'], ['Mida peab Andres tooma?', 'grilli|grill'], ['Mida teevad lapsed?', 'mängivad aias|nad saavad mängida aias'], ['Mida pere õhtul teeb?', 'sööb koos ja vaatab fotosid|vaatavad vanu perefotosid|söövad koos'], ['Mis päevani tuleb vastata?', 'reedeni']]),
      B.listening('006_t_listen', 'Kuula Andrese sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Anna! Siin Andres.', 'Ma tulen laupäeval vanaema juurde.', 'Minu tüdruksõber Eva tuleb ka.', 'Me tuleme Tartust autoga.',
        'Me oleme kohal kell üks.', 'Grilli võtan ma kaasa.', 'Helista mulle õhtul!',
      ], ['Andres tuleb [laupäeval] vanaema juurde.', 'Andrese tüdruksõbra nimi on [Eva].', 'Nad tulevad [autoga].', 'Nad on kohal kell [üks|1|13].', 'Andres võtab kaasa [grilli].']),
      B.table('006_t_tree', 'Minu sugupuu.', 'Täida tabel oma pere andmetega.', 'Pereliige, Nimi, Vanus, Kus elab?, Mida teeb?', ['ema | | | | ', 'isa | | | | ', 'õde või vend | | | | ', 'vanaema või vanaisa | | | | ', 'abikaasa või laps | | | | ']),
      B.wordorder('006_t_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Aitäh kutse eest!', 'Me tuleme laupäeval kell kaks.', 'Minu abikaasa tuleb ka.', 'Me toome kaasa koogi.', 'Palju õnne vanaemale!']),
      B.translation('006_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Спасибо за приглашение!', 'Мы приедем всей семьёй.', 'Моя сестра не может прийти.', 'Мой сын очень активный.', 'До субботы!']),
      B.planning('006_t_plan', 'Enne rääkimist.', 'Kirjuta märksõnad: kellest sa räägid.', ['Kes on sinu pere?', 'Kus nad elavad ja mida teevad?', 'Kes on sulle kõige lähedasem ja miks?'], 2),
      B.speaking('006_t_say', 'Minu sugupuu.', 'Tutvusta oma sugupuud grupile. Räägi umbes üks minut.', ['Kes on sinu pereliikmed?', 'Kui vanad nad on?', 'Kus nad elavad?', 'Mida nad teevad?'], [60, 90], ['See on minu …', 'Ta on … aastat vana.', 'Mul on …']),
      B.rolecards('006_t_roles', 'Perefoto telefonis.', 'Näita paarilisele perefotot. Küsige ja vastake.', 'Näitad telefonis oma perefotot. Ütle iga inimese kohta, kes ta on, kui vana ta on ja kus ta elab.', 'Vaatad sõbra fotot. Küsi vähemalt neli küsimust: kes see on, kui vana, kus elab, mida teeb.', ['See on minu …', 'Ta elab …', 'Tal on …'], ['Kes see on?', 'Kui vana ta on?', 'Kas ta on abielus?']),
      B.letter('006_t_letter', 'Vastus kutsele.', 'Kirjuta Tiinale 30–50 sõna: kas tuled, kellega tuled ja mida tood.', 'Tere, Tiina!', 'Kallistades', [30, 50]),
      B.writing('006_t_write', 'Sõnum sõbrale.', 'Kirjuta sõbrale 4–6 lauset oma vanaemast või vanaisast.', [4, 6], ['vanaema', 'elab', 'on'], 2),
      B.rubric('006_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Suulises tekstis on vähemalt neli pereliiget ja igaühe kohta üks detail.', 'Kirjas on tervitus, vastus kutsele ja lõpp (30–50 sõna).', 'Vormid on õiged: kaks venda, mul ei ole …, elavad.', 'Küsimused paarilisele on arusaadavad.']),
      B.selfcheck('006_t_self', ['Ma tutvustan oma sugupuud.', 'Ma saan aru kutsest: millal, kus, mida tuua.', 'Ma vastan kutsele lühikese kirjaga.', 'Ma küsin sõbra pere kohta.'], 'Pere on koos'),
    ],
  },

  'a2-007': {
    title: 'Kelle oma? Genitiiv',
    canDo: 'Ma küsin „Kelle … see on?” ja vastan omastavaga (See on Markuse kott. See on minu oma.) — vähemalt 8 vormi 10-st on õiged.',
    discover: [
      B.text('007_d_situation', 'Kelle asjad?', 'Tund on läbi. Õpilased lähevad koju. Laua peale jäävad kott, võti, prillid ja telefon. Õpetaja Kadri vaatab asju ja küsib: „Kelle asjad need on?”'),
      B.vocab('007_d_vocab', 'Kelle oma?', ['kelle? — чей?', 'oma — свой', 'omanik — владелец', 'kott — сумка', 'võti — ключ', 'raamat — книга', 'auto — машина', 'mantel — пальто', 'prillid — очки', 'telefon — телефон', 'vihik — тетрадь', 'meie — наш', 'teie — ваш', 'nende — их']),
      B.dialogue('007_d_dialog', 'Pärast tundi.', 'Loe dialoogi. Täida lüngad.', 'Õpetaja', 'Sofia', [
        ['A', 'Sofia, [kelle] kott see on?'], ['B', 'See on [minu] kott. Aitäh! (mina)'], ['A', 'Ja see võti? Kas see on Markuse võti?'],
        ['B', 'Ei, see ei ole [Markuse] oma. See on Liisi võti.'], ['A', 'Ja kelle prillid need on?'], ['B', 'Need on [Viktori] prillid. (Viktor)'],
        ['A', 'Ja see telefon? Kas see on [sinu] telefon? (sina)'], ['B', 'Ei, see on [teie] telefon, õpetaja! (teie)'],
      ]),
      B.notice('007_d_notice', 'Märka: kelle? — omastav', ['**Kelle** kott see on? — See on **Anna** kott.', 'Markus → **Markuse** auto, Viktor → **Viktori** prillid, Liis → **Liisi** võti', 'vend → **venna** auto, õde → **õe** mantel, laps → **lapse** müts', 'mina → **minu (mu)**, sina → **sinu (su)**, tema → **tema (ta)**', 'meie → **meie**, teie → **teie**, nemad → **nende**', 'See on **minu oma**. (= minu asi)']),
      B.reading('007_d_read', 'Loe: Kadunud asjade kast.', 'Loe teksti ja vasta küsimustele lühidalt.', 'Kelle asi see on?',
        'Meie keelekeskuses on kadunud asjade kast. See on esimesel korrusel, administraatori laua juures. Kastis on palju asju. Seal on Viktori sall ja Kati vihik. Seal on ka üks must võti. Kelle võti see on? Keegi ei tea. Liis töötab keelekeskuses administraatorina. Ta kirjutab igale asjale sildi: kuupäev ja ruum. Kui sa kaotad oma asja, mine Liisi juurde. Liis küsib: „Milline teie asi on? Mis värvi see on?” Siis annab ta asja omanikule tagasi. Eile tuli Oksana. Ta otsis oma tütre mütsi. Müts oli kastis! Oksana oli väga rõõmus. Kast on avatud iga päev kell 9–18. Kui omanik ei tule ühe kuu jooksul, annab Liis asja ära.',
        [['Kus on kadunud asjade kast?', 'esimesel korrusel|administraatori laua juures'], ['Kelle sall on kastis?', 'Viktori|Viktori sall'], ['Mida Liis igale asjale kirjutab?', 'sildi|silt|kuupäeva ja ruumi'], ['Mida Oksana otsis?', 'tütre mütsi|oma tütre mütsi|mütsi'], ['Millal on kast avatud?', 'iga päev kell 9–18|iga päev|kell 9–18'], ['Mis saab asjast ühe kuu pärast?', 'Liis annab selle ära|annab ära']]),
      B.manymatch('007_d_owner', 'Kelle asi?', 'Ühenda asi ja omanik.', ['sall', 'vihik', 'müts', 'must võti', 'kadunud asjade kast'], ['Viktori oma', 'Kati oma', 'Oksana tütre oma', 'keegi ei tea', 'keelekeskuse oma'], 'full', 'g_read'),
      B.table('007_d_table', 'Kes? — Kelle?', 'Kirjuta asesõna omastavas.', 'Kes?, Kelle?', ['mina | [minu/mu]', 'sina | [sinu/su]', 'tema | [tema/ta]', 'meie | [meie]', 'teie | [teie]', 'nemad | [nende]'], 'g_notice'),
      B.choice('007_d_choice', 'Vali õige vorm.', 'Vali lünka sobiv sõna.', [
        ['See on ___ auto. (Markus)', 'Markuse', 'Markus', 'Markusel'], ['Need on ___ prillid. (vanaisa)', 'vanaisa', 'vanaisad', 'vanaisal'],
        ['See on ___ mantel. (õde)', 'õe', 'õde', 'õed'], ['Kas see on ___ telefon? (sina)', 'sinu', 'sina', 'sul'],
        ['See on ___ maja. (nemad)', 'nende', 'nemad', 'neil'], ['See on ___ võti. (vend)', 'venna', 'vend', 'venda'],
      ], 'full', 'g_notice'),
      B.gaps('007_d_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna omastavas.', [
        'See on [Liisi] kott. (Liis)', 'Kus on [isa] võti? (isa)', '[Venna] auto on punane. (vend)', 'Need on [lapse] mänguasjad. (laps)', '[Jaani] telefon heliseb. (Jaan)', 'Kas see on [teie] raamat? (teie)',
      ]),
      B.transformation('007_d_trans', 'Ütle teisiti.', 'Kirjuta lause, kasuta omastavat.', [
        ['Mul on raamat.', 'See on …', 'See on minu raamat.|See on mu raamat.'], ['Markusel on auto.', 'See on …', 'See on Markuse auto.'], ['Õel on mantel.', 'See on …', 'See on õe mantel.'],
        ['Neil on maja.', 'See on …', 'See on nende maja.'], ['Sul on telefon.', 'See on …', 'See on sinu telefon.|See on su telefon.'], ['Isal on prillid.', 'Need on …', 'Need on isa prillid.'],
      ]),
      B.errorfix('007_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['See on Markus auto.', 'See on Markuse auto.'], ['Kes kott see on?', 'Kelle kott see on?'], ['See on minu vend auto.', 'See on minu venna auto.'],
        ['See on mina telefon.', 'See on minu telefon.'], ['See on õde mantel.', 'See on õe mantel.'], ['Need on nemad lapsed.', 'Need on nende lapsed.'],
      ]),
      B.crossword('007_d_cross', 'Kelle sõnad.', 'Kirjuta sõna vihje järgi.', [
        ['Küsisõna: … kott see on?', 'kelle'], ['Sellega avad ukse', 'võti'], ['Need on ninal, et paremini näha', 'prillid'],
        ['Inimene, kelle oma asi on', 'omanik'], ['Sellega sõidad, sellel on neli ratast', 'auto'], ['Pikk soe riie talveks', 'mantel'],
      ]),
      B.dictation('007_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kelle kott see on?', 'See on minu ema kott.', 'Need on vanaisa prillid.', 'Venna auto on punane.', 'See ei ole minu oma.'], 5),
      B.speaking('007_d_say', 'Kelle oma?', 'Pane asjad lauale. Küsi ja vasta: kelle oma see on?', ['Kelle telefon see on?', 'Kas see on sinu kott?', 'Kelle võti see on?', 'Kelle raamat see on?', 'Kas see on õpetaja pastakas?'], [45, 90], ['See on … oma.', 'See ei ole minu oma.', 'Ma arvan, et see on …']),
      B.writing('007_d_write', 'Asjad minu kodus', 'Kirjuta 6–8 lauset: kelle asjad on sinu kodus?', [6, 8], ['minu', 'kelle', 'oma'], 2),
      B.selfcheck('007_d_self', ['Ma küsin: Kelle … see on?', 'Ma tean: Markuse, venna, õe, minu, nende.', 'Ma saan aru tekstist kadunud asjadest.', 'Ma ütlen: See on minu oma. See ei ole minu oma.'], 'Kelle oma? Tean!'),
    ],
    practice: [
      B.listening('007_p_listen', 'Kuulamine. Kelle asjad?', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Anna: Mark, kelle jope see on?', 'Mark: See on Laura jope.', 'Anna: Ja kelle saapad need on?', 'Mark: Need on isa saapad.',
        'Anna: Kelle telefon on laual?', 'Mark: See on vanaema telefon. Ta unustas selle siia.', 'Anna: Ja kelle raamat see on?', 'Mark: See on minu oma. Ma loen seda koolis.',
      ], ['See on [Laura] jope.', 'Need on [isa] saapad.', 'Laual on [vanaema] telefon.', 'Vanaema [unustas] telefoni siia.', 'Mark loeb raamatut [koolis].']),
      B.reading('007_p_read', 'Loe: Sõit maale.', 'Loe teksti ja vasta küsimustele.', 'Urmase auto',
        'Reede õhtul sõidab Urmase pere maale. Urmase auto on väike, aga asju on palju. Taga istuvad Urmase naine Irina ja nende tütar Nadja. Pagasiruumis on Irina suur kott ja Nadja jalgratas. Urmase kalapüügi asjad on katusel. Vanaema kook on Irina süles. Nadja kass sõidab ka kaasa. Kassi korv on Nadja jalgade juures. Pool tundi hiljem küsib Irina: „Urmas, kus on maja võti?” Urmas vaatab oma taskusse. Võtit ei ole. Võti on kodus, köögilaual. Nad sõidavad tagasi. Nadja naerab, kass magab korvis edasi. Irina ütleb: „Järgmine kord võtan võtme mina.”',
        [['Kes istuvad taga?', 'Irina ja Nadja|Urmase naine ja tütar'], ['Kelle kott on pagasiruumis?', 'Irina|Irina kott'], ['Mis on katusel?', 'Urmase kalapüügi asjad|kalapüügi asjad'], ['Kelle kook on Irina süles?', 'vanaema|vanaema kook'], ['Kus on maja võti?', 'kodus|köögilaual|kodus köögilaual']]),
      B.wordforms('007_p_forms', 'Kes? → kelle?', 'Kirjuta sõna omastavas.', [
        ['Markus', 'kelle?', 'Markuse'], ['Viktor', 'kelle?', 'Viktori'], ['tütar', 'kelle?', 'tütre'], ['vend', 'kelle?', 'venna'],
        ['õde', 'kelle?', 'õe'], ['laps', 'kelle?', 'lapse'], ['naaber', 'kelle?', 'naabri'], ['sõber', 'kelle?', 'sõbra'],
      ]),
      B.categorize('007_p_sort', 'Kes või kelle?', 'Pane sõnad õigesse rühma.', [
        ['Kes? (nimetav)', ['Markus', 'vend', 'õde', 'laps', 'naaber']], ['Kelle? (omastav)', ['Markuse', 'venna', 'õe', 'lapse', 'naabri']],
      ], 'full', 'g_notice'),
      B.gaps('007_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        '[Kelle] mantel see on? (kes)', 'See on minu [õe] mantel. (õde)', 'Kas see on [sinu] auto? (sina)', 'Need on [nende] lapsed. (nemad)', 'Meie [naabri] koer on suur. (naaber)', '[Lapse] müts on punane. (laps)',
      ]),
      B.wordorder('007_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kelle võti see on?', 'See on minu venna auto.', 'Need on vanaisa uued prillid.', 'Kas see on teie laps?', 'See telefon ei ole minu oma.']),
      B.errorfix('007_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['See on Viktor kott.', 'See on Viktori kott.'], ['Kes raamat see on?', 'Kelle raamat see on?'], ['See on minu naaber auto.', 'See on minu naabri auto.'],
        ['Need on nemad asjad.', 'Need on nende asjad.'], ['See on tütar mänguasi.', 'See on tütre mänguasi.'], ['Kas see on sina telefon?', 'Kas see on sinu telefon?'],
      ]),
      B.transformation('007_p_ask', 'Küsi.', 'Kirjuta küsimus. Vastus on antud.', [
        ['See on Kati sall.', 'Kelle …?', 'Kelle sall see on?'], ['Need on Jaani raamatud.', 'Kelle …?', 'Kelle raamatud need on?'], ['See on õpetaja võti.', 'Kelle …?', 'Kelle võti see on?'],
        ['Jah, see on minu kott.', 'Kas see on sinu …?', 'Kas see on sinu kott?'], ['See on nende auto.', 'Kelle …?', 'Kelle auto see on?'],
      ]),
      B.dialogue('007_p_dialog', 'Garderoobis.', 'Täida dialoog sobivate sõnadega.', 'Töötaja', 'Olga', [
        ['A', 'Tere! Kas see on [teie] mantel? (teie)'], ['B', 'Ei, minu mantel on pikk ja must.'], ['A', 'Kas see must mantel on teie [oma]?'],
        ['B', 'Jah, aitäh! Ja see sall on minu [poja] sall. (poeg)'], ['A', 'Palun. Kas teil on veel midagi?'], ['B', 'Jah, minu [mehe] müts. (mees)'],
        ['A', 'Kas see hall müts?'], ['B', 'Jah, see on [tema] oma. Aitäh! (tema)'],
      ]),
      B.dictation('007_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kelle jope see on?', 'See on minu tütre jope.', 'Need on Viktori võtmed.', 'Kas see on teie kott?', 'Nende maja on suur.'], 5),
      B.translation('007_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Чья это сумка?', 'Это машина моего брата.', 'Это не моё.', 'Это очки дедушки.', 'Это их дом.', 'Ваш ребёнок в школе?']),
      B.speaking('007_p_say', 'Kelle pilt see on?', 'Näita telefonis pilte. Paariline küsib: kelle … see on?', ['Kelle maja see on?', 'Kelle auto see on?', 'Kelle koer see on?', 'Kelle laps see on?'], [45, 90]),
      B.writing('007_p_write', 'Kadunud asi.', 'Kirjuta keelekeskusele 4–6 lauset: mida sa kaotasid ja milline see on.', [4, 6], ['minu', 'kott', 'oma'], 2),
      B.selfcheck('007_p_self', ['Ma kuulen, kelle asi see on.', 'Ma moodustan omastava: Markuse, tütre, venna, naabri.', 'Ma parandan vead: Viktor kott → Viktori kott.', 'Ma küsin ja vastan: kelle … see on?'], 'Omastav töötab'),
    ],
    transfer: [
      B.text('007_t_situation', 'Kadunud asjade laud', 'Keelekeskuses on kadunud asjade laud. Seal töötab administraator Liis. Täna oled sina Liisi abiline. Sa kuulad teadet, aitad Oksanat ja kirjutad uue teate.'),
      B.reading('007_t_mail', 'Loe Oksana kirja.', 'Loe kirja ja vasta küsimustele.', 'Tere, Liis!',
        'Tere, Liis! Eile oli minu tütar Mia minuga keelekeskuses. Ta ootas mind tunni ajal raamatukogus. Kui me koju läksime, ei olnud tal mütsi. Müts on punane ja sellel on valge lill. See on Mia lemmikmüts, vanaema tegi selle. Mia on väga kurb, sest ta tahab oma mütsi tagasi. Talv tuleb varsti ja tal on vaja sooja mütsi. Kas see on teie kadunud asjade kastis? Minu kursus on täna kell 17. Ma tulen natuke varem. Kas ma võin tulla administraatori lauda? Kui mütsi ei ole, palun kirjutage mulle. Aitäh! Oksana Bondar',
        [['Kes kaotas mütsi?', 'Mia|Oksana tütar|Mia, Oksana tütar'], ['Kus Mia ootas?', 'raamatukogus'], ['Milline müts on?', 'punane|punane, valge lillega|punane ja sellel on valge lill'], ['Kes tegi mütsi?', 'vanaema'], ['Mis kell on Oksana kursus?', 'kell 17|17']]),
      B.listening('007_t_listen', 'Kuula Liisi teadet.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Head õpilased! Kadunud asjade kastis on palju asju.', 'Seal on üks must võti ja punane sall.', 'Sall on Kati oma. Kati, tule palun administraatori juurde!',
        'Aga kelle võti see on? Me ei tea.', 'Seal on ka sinine vihik. Vihikul on nimi: Jaan Kask.', 'Kast on avatud iga päev kella üheksast kuueni.',
      ], ['Kastis on must [võti].', 'Punane sall on [Kati] oma.', 'Kati peab tulema [administraatori] juurde.', 'Sinine [vihik] on Jaani oma.', 'Keegi [ei tea], kelle võti see on.']),
      B.manymatch('007_t_owner', 'Kelle asi?', 'Ühenda asi ja omanik.', ['punane sall', 'sinine vihik', 'punane müts valge lillega', 'must võti'], ['Kati', 'Jaan', 'Mia', 'keegi ei tea'], 'full', 'g_read'),
      B.dialogue('007_t_dialog', 'Administraatori laua juures.', 'Täida dialoog sobivate sõnadega.', 'Oksana', 'Liis', [
        ['A', 'Tere! Ma otsin oma [tütre] mütsi. (tütar)'], ['B', 'Tere! Mis [värvi] müts on?'], ['A', 'Punane, sellel on valge lill.'],
        ['B', 'Kas see on [teie] tütre müts? (teie)'], ['A', 'Jah! See on [Mia] oma. Aitäh!'], ['B', 'Palun. Ja kas see sall on ka teie [oma]?'],
        ['A', 'Ei, see ei ole minu sall. See on [Kati] sall.'],
      ]),
      B.transformation('007_t_ask', 'Küsi omanikku.', 'Kirjuta küsimus. Vastus on antud.', [
        ['See on Kati sall.', 'Kelle …?', 'Kelle sall see on?'], ['Need on Jaani raamatud.', 'Kelle …?', 'Kelle raamatud need on?'], ['See on õpetaja võti.', 'Kelle …?', 'Kelle võti see on?'],
        ['Mul on sinine kott.', 'Kas see on sinu …?', 'Kas see on sinu kott?'], ['See on nende vihik.', 'Kelle …?', 'Kelle vihik see on?'],
      ]),
      B.errorfix('007_t_fix', 'Paranda teade.', 'Liisi abilise teates on vead. Kirjuta lause õigesti.', [
        ['Leitud: Kati sall ja Jaan vihik.', 'Leitud: Kati sall ja Jaani vihik.'], ['Kes võti see on?', 'Kelle võti see on?'], ['See on mina kott!', 'See on minu kott!'],
        ['Need on nemad raamatud.', 'Need on nende raamatud.'], ['See on minu vend jope.', 'See on minu venna jope.'],
      ]),
      B.translation('007_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Это моя сумка, спасибо!', 'Чей это ключ?', 'Это шарф Кати.', 'Это не моё.', 'Где тетрадь Яана?']),
      B.rolecards('007_t_roles', 'Kadunud asi.', 'Üks on õpilane, teine administraator. Leidke õige asi.', 'Sa kaotasid keelekeskuses asja (kott, telefon või mantel). Ütle, mis asi see on, mis värvi see on ja kelle oma see on.', 'Oled administraator. Kastis on palju asju. Küsi, milline asi see on. Küsi nime ja anna asi omanikule.', ['Ma otsin oma …', 'See on minu …', 'See on minu õe oma.'], ['Kelle … see on?', 'Mis värvi see on?', 'Kas see on teie oma?']),
      B.speaking('007_t_say', 'Minu tähtis asi.', 'Räägi ühest asjast, mis on sulle tähtis. Räägi umbes minut.', ['Mis asi see on?', 'Kelle oma see enne oli?', 'Kus see sinu kodus on?', 'Miks see sulle tähtis on?'], [45, 90]),
      B.letter('007_t_letter', 'Teade seinale.', 'Kirjuta keelekeskuse seinale teade 30–50 sõna: mida leidsid ja kelle oma see on.', 'Leitud!', 'Administraatori abiline', [30, 50]),
      B.writing('007_t_write', 'Vastus Oksanale.', 'Kirjuta Oksanale 4–6 lauset: kas müts on kastis ja millal ta selle saab.', [4, 6], ['müts', 'Mia', 'oma'], 2),
      B.rubric('007_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Omastav on õige: Kati sall, Jaani vihik, tütre müts.', 'Teates on, mis asi leiti, kus see on ja kelle oma see on.', 'Dialoogis küsib õpilane: kelle … see on? Kas see on teie oma?', 'Suuline tekst on arusaadav ja kestab umbes minuti.']),
      B.selfcheck('007_t_self', ['Ma küsin, kelle asi see on.', 'Ma kirjutan teate leitud asjast.', 'Ma saan aru teatest ja kirjast.', 'Ma kasutan omastavat suhtluses.'], 'Asjad on omanikel'),
    ],
  },

  'a2-008': {
    title: 'Välimus ja iseloom',
    canDo: 'Ma kirjeldan inimese välimust ja iseloomu vähemalt 10 omadussõnaga (Ta on pikk ja rahulik. Tal on lühikesed tumedad juuksed.) ja võrdlen kahte inimest.',
    discover: [
      B.text('008_d_situation', 'Arva ära!', 'Kursusel on mäng „Arva ära!”. Üks õpilane kirjeldab inimest, teised arvavad, kes see on. Anna alustab: „See inimene on pikk ja rahulik. Tal on lühikesed tumedad juuksed.”'),
      B.vocab('008_d_vocab', 'Välimus ja iseloom', ['välimus — внешность', 'iseloom — характер', 'pikk — высокий, длинный', 'lühike — низкий, короткий', 'noor — молодой', 'juuksed — волосы', 'silmad — глаза', 'hele — светлый', 'tume — тёмный', 'sõbralik — дружелюбный', 'rahulik — спокойный', 'aktiivne — активный', 'lõbus — весёлый', 'väga / üsna / natuke — очень / довольно / немного']),
      B.profiles('008_d_cards', 'Kes on kes?', 'Loe kaarte. Kirjuta lünka sobiv sõna.', [
        ['Markus', ['34 aastat vana', 'pikk', 'lühikesed tumedad juuksed', 'habe', 'rahulik'], ['Markus on [pikk].', 'Tal on lühikesed [tumedad] juuksed.', 'Ta on [rahulik].']],
        ['Liis', ['45 aastat vana', 'üsna lühike', 'lühikesed heledad juuksed', 'sinised silmad', 'väga aktiivne'], ['Liis on üsna [lühike].', 'Tal on [sinised] silmad.', 'Ta on väga [aktiivne].']],
        ['Viktor', ['63 aastat vana', 'keskmist kasvu', 'hallid juuksed', 'kannab mütsi', 'sõbralik ja lõbus'], ['Viktoril on [hallid] juuksed.', 'Ta kannab [mütsi].', 'Ta on [sõbralik] ja lõbus.']],
      ]),
      B.reading('008_d_read', 'Loe: Minu kaks sõbrannat.', 'Loe Kati teksti ja vasta küsimustele.', 'Olga ja Oksana',
        'Mul on kaks head sõbrannat, Olga ja Oksana. Nad on väga erinevad. Olga on pikk. Tal on pikad heledad juuksed ja sinised silmad. Ta on 34 aastat vana. Olga on rahulik ja natuke tõsine. Ta räägib vähe, aga kuulab hästi. Oksana on lühem kui Olga. Tal on lühikesed tumedad juuksed ja pruunid silmad. Oksana on 35, ta on natuke vanem. Ta on väga aktiivne ja lõbus. Ta räägib palju ja naerab tihti. Hommikul jookseb ta pargis. Olga loeb õhtul raamatuid. Olga töötab raamatupidajana, Oksana õpib eesti keelt. Mõlemad on väga sõbralikud. Kui mul on probleem, aitab Olga mul mõelda. Kui mul on halb tuju, teeb Oksana mind rõõmsaks.',
        [['Kellel on pikad heledad juuksed?', 'Olgal|Olga'], ['Mis värvi silmad on Oksanal?', 'pruunid'], ['Kes on lühem?', 'Oksana'], ['Milline on Olga iseloom?', 'rahulik ja natuke tõsine|rahulik|tõsine'], ['Mida Oksana hommikul teeb?', 'jookseb pargis|jookseb'], ['Mida Olga õhtul teeb?', 'loeb raamatuid|loeb']]),
      B.truefalse('008_d_tf', 'Õige või vale?', 'Loe Kati teksti uuesti.', [
        ['Olga on pikk.', true], ['Oksanal on heledad juuksed.', false], ['Oksana on vanem kui Olga.', true], ['Olga räägib palju.', false], ['Oksana on lõbus.', true],
      ]),
      B.notice('008_d_notice', 'Märka: ta on … / tal on …', ['Ta **on** pikk. Ta **on** rahulik. (milline ta on?)', '**Tal on** pikad juuksed. (mis tal on?)', 'juuksed, silmad = palju: **pikad** juuksed, **sinised** silmad', 'pikk → pikad, hele → heledad, tume → tumedad, sinine → sinised', '**väga** pikk — **üsna** pikk — **natuke** pikk', 'Võrdle: pikk → **pikem kui**, noor → **noorem**, lõbus → **lõbusam**']),
      B.categorize('008_d_sort', 'Välimus või iseloom?', 'Pane sõnad õigesse rühma.', [
        ['Välimus', ['pikk', 'lühike', 'heledad juuksed', 'sinised silmad', 'noor']], ['Iseloom', ['sõbralik', 'rahulik', 'aktiivne', 'lõbus', 'tõsine']],
      ]),
      B.match('008_d_match', 'Vastand.', 'Ühenda sõna ja vastand.', [['pikk', 'lühike'], ['noor', 'vana'], ['hele', 'tume'], ['lõbus', 'tõsine'], ['suur', 'väike'], ['vanem', 'noorem']]),
      B.wordforms('008_d_forms', 'Üks → palju', 'Kirjuta omadussõna mitmuses.', [
        ['pikk', '… juuksed', 'pikad'], ['hele', '… juuksed', 'heledad'], ['tume', '… silmad', 'tumedad'], ['sinine', '… silmad', 'sinised'], ['lühike', '… juuksed', 'lühikesed'], ['pruun', '… silmad', 'pruunid'],
      ]),
      B.choice('008_d_choice', 'Vali õige sõna.', 'Vali lünka sobiv sõna.', [
        ['Olga on ___ kui Oksana.', 'pikem', 'pikk', 'pikad'], ['Tal on ___ juuksed.', 'heledad', 'hele', 'heledam'],
        ['Viktor on 63, Markus on 34. Markus on ___.', 'noorem', 'vanem', 'vana'], ['Tal on lühikesed tumedad ___.', 'juuksed', 'silmad', 'prillid'],
        ['Ta naerab palju. Ta on ___.', 'lõbus', 'tõsine', 'rahulik'],
      ], 'full', 'g_notice'),
      B.wordorder('008_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Tal on pikad heledad juuksed.', 'Oksana on lühem kui Olga.', 'Minu isa on väga rahulik inimene.', 'Minu õel on sinised silmad.', 'Ta räägib palju ja naerab tihti.']),
      B.listening('008_d_listen', 'Kuulamine. Milline on Martin?', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Kati: Kas sa tead Martini? Ta on minu kolleeg.', 'Ta on kakskümmend kuus aastat vana.', 'Ta on väga pikk, umbes kaks meetrit.', 'Tal on lühikesed heledad juuksed ja habe.',
        'Tal on rohelised silmad.', 'Martin on sõbralik ja aktiivne. Ta mängib korvpalli.', 'Aga hommikul on ta natuke tõsine.',
      ], ['Martin on Kati [kolleeg].', 'Martin on väga [pikk].', 'Tal on lühikesed [heledad] juuksed.', 'Tal on [rohelised] silmad.', 'Martin mängib [korvpalli].', 'Hommikul on ta natuke [tõsine].']),
      B.translation('008_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['У неё длинные светлые волосы.', 'Мой брат высокий и спокойный.', 'У него голубые глаза.', 'Она моложе, чем я.', 'Он очень дружелюбный.']),
      B.speaking('008_d_say', 'Arva ära!', 'Kirjelda üht kursuslast. Paariline arvab, kes see on.', ['Kas ta on pikk või lühike?', 'Millised juuksed tal on?', 'Mis värvi silmad tal on?', 'Milline ta on iseloomult?'], [45, 90], ['Ta on üsna…', 'Tal on … juuksed.', 'Ta on väga…']),
      B.writing('008_d_write', 'Minu sõber', 'Kirjelda oma sõpra 6–8 lausega: välimus ja iseloom.', [6, 8], ['pikk', 'juuksed', 'silmad', 'sõbralik'], 2),
      B.selfcheck('008_d_self', ['Ma kirjeldan välimust: Ta on pikk. Tal on heledad juuksed.', 'Ma kirjeldan iseloomu: rahulik, lõbus, aktiivne.', 'Ma kasutan: väga, üsna, natuke.', 'Ma võrdlen: pikem kui, noorem kui.'], 'Kirjeldan inimest'),
    ],
    practice: [
      B.crossword('008_p_cross', 'Milline ta on?', 'Kirjuta sõna vihje järgi.', [
        ['Mitte tume, vaid …', 'hele'], ['Mitte noor, vaid …', 'vana'], ['Ta naerab palju, ta on …', 'lõbus'],
        ['Ta ei kiirusta kunagi, ta on …', 'rahulik'], ['Ta teeb palju sporti, ta on …', 'aktiivne'], ['Silmad, juuksed ja pikkus: inimese …', 'välimus'],
      ]),
      B.listening('008_p_listen', 'Kuulamine. Teade kaubanduskeskuses.', 'Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tähelepanu! Kaubanduskeskuses otsib ema oma poega.', 'Poisi nimi on Robin. Ta on viis aastat vana.', 'Robin on üsna lühike, tal on heledad lokkis juuksed.',
        'Tal on suured sinised silmad.', 'Tal on seljas punane jope ja peas roheline müts.', 'Kui te näete Robinit, tulge palun infoleti juurde.',
      ], ['Poisi nimi on [Robin].', 'Ta on [viis|5] aastat vana.', 'Tal on [heledad] lokkis juuksed.', 'Tal on suured sinised [silmad].', 'Tal on seljas punane [jope].', 'Tuleb minna [infoleti] juurde.']),
      B.truefalse('008_p_tf', 'Õige või vale?', 'Mõtle teate peale.', [['Robin on viis aastat vana.', true], ['Robinil on tumedad juuksed.', false], ['Tal on punane jope.', true], ['Tal on peas sinine müts.', false]]),
      B.gaps('008_p_gaps', 'Täida lüngad.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Tal on [pikad] juuksed. (pikk)', 'Mu õel on [sinised] silmad. (sinine)', 'Isal on [tumedad] juuksed. (tume)', 'Martin on [pikem] kui Markus. (pikk)', 'Kati on [noorem] kui Olga. (noor)', 'Lapsel on [heledad] juuksed. (hele)',
      ]),
      B.table('008_p_table', 'Võrdlus.', 'Kirjuta omadussõna võrdlusvorm.', 'Omadussõna, Võrdlus (… kui)', ['pikk | [pikem]', 'noor | [noorem]', 'vana | [vanem]', 'lühike | [lühem]', 'lõbus | [lõbusam]', 'rahulik | [rahulikum]', 'aktiivne | [aktiivsem]', 'sõbralik | [sõbralikum]'], 'g_notice'),
      B.transformation('008_p_compare', 'Võrdle.', 'Kirjuta võrdlus. Kasuta sõna kui.', [
        ['Olga on 34. Kati on 20.', 'Kati on …', 'Kati on noorem kui Olga.|Kati on Olgast noorem.'], ['Martin on 2 meetrit. Markus on 1,80.', 'Martin on …', 'Martin on pikem kui Markus.|Martin on Markusest pikem.'],
        ['Viktor on 63. Markus on 34.', 'Viktor on …', 'Viktor on vanem kui Markus.|Viktor on Markusest vanem.'], ['Oksana naerab palju. Olga naerab vähe.', 'Oksana on …', 'Oksana on lõbusam kui Olga.|Oksana on Olgast lõbusam.'],
        ['Liis jookseb iga päev. Anna ei jookse.', 'Liis on …', 'Liis on aktiivsem kui Anna.|Liis on Annast aktiivsem.'],
      ]),
      B.errorfix('008_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Tal on pikk juuksed.', 'Tal on pikad juuksed.'], ['Ta on sinised silmad.', 'Tal on sinised silmad.'], ['Olga on pikk kui Oksana.', 'Olga on pikem kui Oksana.'],
        ['Minu vend on väga sõbralikud.', 'Minu vend on väga sõbralik.'], ['Tal on hele juuksed.', 'Tal on heledad juuksed.'], ['Ta on üsna rahulikud.', 'Ta on üsna rahulik.'],
      ]),
      B.manymatch('008_p_who', 'Milline ta on?', 'Ühenda lause ja omadussõna.', ['Ta naerab palju ja teeb nalja.', 'Ta ei kiirusta ega närvitse.', 'Ta teeb palju sporti.', 'Ta aitab alati teisi.', 'Ta räägib vähe ja mõtleb palju.'], ['lõbus', 'rahulik', 'aktiivne', 'abivalmis', 'tõsine']),
      B.dialogue('008_p_dialog', 'Uus õpetaja.', 'Täida dialoog sobivate sõnadega.', 'Liis', 'Markus', [
        ['A', 'Markus, kas sa tead, kes on meie uus õpetaja?'], ['B', 'Jah, ma nägin teda. Ta on üsna [noor], umbes kakskümmend viis.'], ['A', 'Kas ta on pikk või [lühike]?'],
        ['B', 'Ta on pikk. Tal on lühikesed juuksed. Need ei ole heledad, need on [tumedad].'], ['A', 'Kas ta on tõsine?'], ['B', 'Ei, ta ei ole tõsine. Ta on väga [lõbus], ta naerab palju.'],
        ['A', 'Tore! Kas ta on ka sõbralik?'], ['B', 'Jah, väga [sõbralik]. Ta aitab kõiki.'],
      ]),
      B.dictation('008_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Tal on pikad heledad juuksed.', 'Minu isa on rahulik inimene.', 'Kati on noorem kui Olga.', 'Ta on väga sõbralik ja lõbus.', 'Tal on suured pruunid silmad.'], 5),
      B.translation('008_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Мой муж выше, чем я.', 'У дочки светлые волосы.', 'Учитель довольно молодой.', 'Она немного серьёзная.', 'У него карие глаза.']),
      B.speaking('008_p_say', 'Võrdle kahte inimest.', 'Võrdle kahte oma pereliiget. Räägi umbes minut.', ['Kes on pikem?', 'Kes on vanem?', 'Millised juuksed ja silmad neil on?', 'Kes on rahulikum, kes aktiivsem?'], [60, 90], ['… on pikem kui …', 'Tal on …, aga temal on …']),
      B.rolecards('008_p_roles', 'Kes see on?', 'Üks kirjeldab tuntud inimest, teine küsib ja arvab.', 'Mõtle ühele inimesele (näitleja, sportlane või kursuslane). Vasta ainult jah või ei ja kirjelda teda.', 'Küsi küsimusi välimuse ja iseloomu kohta. Arva ära, kes see on.', ['Jah, ta on …', 'Ei, tal ei ole …'], ['Kas ta on pikk?', 'Kas tal on heledad juuksed?', 'Kas ta on lõbus?']),
      B.writing('008_p_write', 'Kaks sõpra.', 'Võrdle kahte sõpra 5–6 lausega.', [5, 6], ['kui', 'pikem', 'tal on'], 2),
      B.selfcheck('008_p_self', ['Ma saan aru kirjeldusest: välimus ja riided.', 'Ma kirjutan: pikad juuksed, sinised silmad.', 'Ma võrdlen: pikem kui, noorem kui.', 'Ma kirjeldan ja arvan ära inimese.'], 'Võrdlen julgelt'),
    ],
    transfer: [
      B.text('008_t_situation', 'Kohtumine lennujaamas', 'Oksana ema tuleb homme Tallinna. Oksanal on kursus ja ta ei saa lennujaama minna. Tema sõber Jaan läheb. Jaan ei ole Oksana ema kunagi näinud. Oksana peab ema kirjeldama.'),
      B.reading('008_t_mail', 'Loe Oksana sõnumit.', 'Loe sõnumit ja vasta küsimustele.', 'Tere, Jaan!',
        'Tere, Jaan! Suur aitäh, et sa lähed homme lennujaama! Minu ema lennuk tuleb kell 15.20. Mu ema nimi on Halina. Ta on 62 aastat vana. Ta on üsna lühike. Tal on lühikesed hallid juuksed ja prillid. Tal on seljas pikk pruun mantel. Ta räägib vene ja ukraina keelt, eesti keelt ta ei oska. Ema on väga sõbralik, aga natuke närviline, sest ta lendab esimest korda. Tal on suur sinine kohver. Palun hoia käes silti „HALINA”. Kirjuta mulle, kui ema on autos! Aitäh! Oksana',
        [['Mis kell lennuk tuleb?', '15.20|kell 15.20'], ['Kui vana on Halina?', '62|62 aastat'], ['Millised juuksed tal on?', 'lühikesed hallid|hallid|lühikesed hallid juuksed'], ['Mis keeli Halina räägib?', 'vene ja ukraina keelt|vene ja ukraina'], ['Miks on ema närviline?', 'ta lendab esimest korda|lendab esimest korda'], ['Mida peab Jaan käes hoidma?', 'silti|silt|silti HALINA']]),
      B.truefalse('008_t_tf', 'Õige või vale?', 'Loe Oksana sõnumit uuesti.', [['Halina on pikk.', false], ['Halinal on prillid.', true], ['Halina räägib eesti keelt.', false], ['Halinal on sinine kohver.', true], ['Halina lendab esimest korda.', true]]),
      B.listening('008_t_listen', 'Kuula Jaani sõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Oksana! Siin Jaan. Ma olen lennujaamas.', 'Siin on kaks naist, neil on hallid juuksed.', 'Üks naine on pikk ja tal on punane mantel.',
        'Teine on lühike, tal on pruun mantel ja prillid.', 'Tal on ka suur sinine kohver.', 'Ma arvan, et see on sinu ema. Ma lähen tema juurde!',
      ], ['Jaan on [lennujaamas].', 'Kahel naisel on [hallid] juuksed.', 'Pikal naisel on [punane] mantel.', 'Lühikesel naisel on [prillid] ja pruun mantel.', 'Lühikesel naisel on sinine [kohver].']),
      B.errorfix('008_t_fix', 'Paranda sõnum.', 'Jaani sõnumis on vead. Kirjuta lause õigesti.', [
        ['Ta on prillid.', 'Tal on prillid.'], ['Tal on pikk pruun mantlid.', 'Tal on pikk pruun mantel.'], ['Ta on väga sõbralikud.', 'Ta on väga sõbralik.'],
        ['Ta on natuke närviline kui mina.', 'Ta on närvilisem kui mina.'], ['Tal on suur sinised kohver.', 'Tal on suur sinine kohver.'],
      ]),
      B.translation('008_t_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Моя мама невысокая.', 'У неё короткие седые волосы.', 'Она очень дружелюбная.', 'Он выше, чем я.', 'У неё большой синий чемодан.']),
      B.planning('008_t_plan', 'Enne kirjutamist.', 'Kirjuta märksõnad: keda sa kirjeldad.', ['Kes ta on ja kui vana ta on?', 'Milline on tema välimus? (pikkus, juuksed, silmad, riided)', 'Milline on tema iseloom?'], 2),
      B.letter('008_t_letter', 'Sõnum Jaanile.', 'Kirjuta Jaanile 30–50 sõna: kes tuleb, millal ja milline ta välja näeb.', 'Tere, Jaan!', 'Tänan!', [30, 50]),
      B.speaking('008_t_call', 'Telefonikõne.', 'Helista Jaanile ja kirjelda oma sõpra. Räägi umbes minut.', ['Kes ta on ja kui vana ta on?', 'Kas ta on pikk või lühike?', 'Millised juuksed ja silmad tal on?', 'Milline ta on iseloomult?'], [60, 90]),
      B.rolecards('008_t_roles', 'Arva ära!', 'Üks kirjeldab kursuslast, teine vaatab ringi ja arvab.', 'Vali üks inimene klassist. Kirjelda tema välimust ja iseloomu. Ära ütle nime!', 'Kuula kirjeldust. Küsi kaks täpsustavat küsimust. Arva ära, kes see on.', ['Ta on üsna …', 'Tal on … juuksed.', 'Ta on väga …'], ['Kas tal on prillid?', 'Kas ta on pikem kui mina?', 'Kas see on …?']),
      B.writing('008_t_write', 'Minu lähedane inimene.', 'Kirjuta 6–8 lauset lähedasest inimesest: välimus ja iseloom.', [6, 8], ['on', 'tal on', 'väga'], 2),
      B.rubric('008_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kirjelduses on välimus (pikkus, juuksed, silmad) ja iseloom.', 'Omadussõnad on õiges vormis: pikad juuksed, sinised silmad.', 'Sõnumis on aeg, nimi ja kirjeldus (30–50 sõna).', 'Kirjelduse järgi saab inimese ära tunda.']),
      B.selfcheck('008_t_self', ['Ma kirjeldan inimest nii, et teine tunneb ta ära.', 'Ma saan aru kirjeldusest sõnumis ja kõnes.', 'Ma kasutan vähemalt 10 omadussõna.', 'Ma võrdlen kahte inimest.'], 'Inimene on leitud'),
    ],
  },

  'a2-009': {
    title: 'Minu inimesed',
    canDo: 'Ma loen lühikesi isiklikke kirjeldusi, leian faktid (kes, kui vana, kus elab, mida teeb, milline on) ja jutustan ühest inimesest 5–6 lausega.',
    discover: [
      B.text('009_d_situation', 'Ajaleht „Meie maja”', 'Tartus ühes majas teevad naabrid väikest ajalehte. Selles numbris on rubriik „Meie naabrid”. Kolm naabrit kirjutavad endast lühidalt. Loe ja tutvu nendega!'),
      B.vocab('009_d_vocab', 'Inimese kirjeldus', ['milline? — какой?', 'kui vana? — сколько лет?', 'elukutse — профессия', 'huvi — интерес', 'abielus — женат, замужем', 'lahutatud — разведён(а)', 'pensionär — пенсионер', 'õpilane — ученик', 'üliõpilane — студент', 'naaber — сосед', 'lahke — добрый', 'kirjeldus — описание']),
      B.reading('009_d_read', 'Loe: Meie naabrid.', 'Loe naabrite tutvustusi ja vasta küsimustele.', 'Meie naabrid',
        'Urmas, 52. Ma elan esimesel korrusel koos naise Irinaga. Olen abielus juba 28 aastat. Minu elukutse on bussijuht. Meil on kaks täiskasvanud last. Poeg elab Tallinnas, tütar Nadja õpib Tartus. Minu suur huvi on kalapüük. Olen rahulik ja räägin aeglaselt. Suvel sõidan ma igal nädalavahetusel järve äärde.\nKati, 20. Ma elan teisel korrusel. Olen üliõpilane, õpin ülikoolis meditsiini. Ma ei ole abielus, aga mul on poiss-sõber. Ta elab Viljandis. Mul on palju huvisid: jooksen, laulan kooris ja joonistan. Olen väga aktiivne, kodus olen harva. Mulle meeldib ka küpsetada, aga mul ei ole aega.\nHelmi, 74. Ma elan neljandal korrusel. Olen pensionär, enne töötasin raamatukogus. Olen lahutatud, mu endine mees elab Pärnus. Mul on kolm lapselast. Nad tulevad mulle sageli külla. Hommikul jalutan ma oma koeraga pargis. Mulle meeldib küpsetada ja ma pakun naabritele kooki. Minu uks on alati avatud!',
        [['Kes on abielus?', 'Urmas'], ['Mis on Urmase elukutse?', 'bussijuht'], ['Mida Kati õpib?', 'meditsiini'], ['Kus elab Kati poiss-sõber?', 'Viljandis'], ['Kes on pensionär?', 'Helmi'], ['Kus Helmi enne töötas?', 'raamatukogus'], ['Mida Helmi naabritele pakub?', 'kooki']]),
      B.categorize('009_d_sort', 'Kelle kohta see käib?', 'Pane sõnad õige naabri juurde.', [
        ['Urmas', ['bussijuht', 'abielus', 'kalapüük']], ['Kati', ['üliõpilane', 'koor', 'poiss-sõber']], ['Helmi', ['pensionär', 'lahutatud', 'kook']],
      ], 'full', 'g_read'),
      B.truefalse('009_d_tf', 'Õige või vale?', 'Loe naabrite tekste uuesti.', [
        ['Urmas elab esimesel korrusel.', true], ['Urmase tütar elab Tallinnas.', false], ['Kati on abielus.', false], ['Kati on tihti kodus.', false], ['Helmil on kolm lapselast.', true],
      ]),
      B.notice('009_d_notice', 'Märka: küsimused inimese kohta', ['**Kes** ta on? — Ta on Kati, üliõpilane.', '**Kui vana** ta on? — Ta on 20.', '**Kus** ta elab? — Teisel korrusel.', '**Mida** ta teeb? — Ta õpib meditsiini.', '**Milline** ta on? — Ta on aktiivne.', '**Kas** ta on abielus? — Ei, ta ei ole.']),
      B.match('009_d_match', 'Küsimus ja vastus.', 'Ühenda küsimus ja vastus.', [
        ['Kui vana Helmi on?', '74 aastat.'], ['Mis on Urmase elukutse?', 'Ta on bussijuht.'], ['Milline Kati on?', 'Väga aktiivne.'],
        ['Kus Helmi enne töötas?', 'Raamatukogus.'], ['Kas Urmas on abielus?', 'Jah, juba 28 aastat.'], ['Mida Kati õpib?', 'Meditsiini.'],
      ], 'full', 'g_read'),
      B.transformation('009_d_ask', 'Küsi.', 'Kirjuta küsimus. Vastus on antud.', [
        ['Kati on 20 aastat vana.', 'Kui …?', 'Kui vana Kati on?|Kui vana on Kati?'], ['Helmi elab neljandal korrusel.', 'Kus …?', 'Kus Helmi elab?|Kus elab Helmi?'],
        ['Urmas on rahulik.', 'Milline …?', 'Milline Urmas on?|Milline on Urmas?'], ['Kati õpib meditsiini.', 'Mida …?', 'Mida Kati õpib?'],
        ['Helmi on lahutatud.', 'Kas …?', 'Kas Helmi on lahutatud?'], ['Urmas on bussijuht.', 'Mis on …?', 'Mis on Urmase elukutse?|Mis on Urmase amet?'],
      ]),
      B.gaps('009_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Vanaisa ei tööta enam, ta on [pensionär].', 'Minu poeg käib koolis, ta on [õpilane].', 'Kati õpib ülikoolis, ta on [üliõpilane].', 'Mu vanemad ei ela enam koos, nad on [lahutatud].', 'Ta aitab alati teisi, ta on väga [lahke].', 'Tal on palju [huvisid]: sport, muusika ja kunst.',
      ], ['pensionär', 'õpilane', 'üliõpilane', 'lahutatud', 'lahke', 'huvisid', 'abielus', 'naaber']),
      B.table('009_d_table', 'Helmi profiil.', 'Täida tabel Helmi kohta.', 'Küsimus, Helmi', ['Kui vana? | [74]', 'Kus elab? | [neljandal korrusel]', 'Kus töötas enne? | [raamatukogus]', 'Abielus või lahutatud? | [lahutatud]', 'Mitu lapselast? | [kolm/3]'], 'g_read'),
      B.crossword('009_d_cross', 'Inimesed.', 'Kirjuta sõna vihje järgi.', [
        ['Inimene, kes vanuse pärast enam ei tööta', 'pensionär'], ['Ta õpib ülikoolis', 'üliõpilane'], ['Inimene, kes elab sinu kõrval', 'naaber'],
        ['Hea ja abivalmis', 'lahke'], ['Amet, töö', 'elukutse'], ['Abielu on läbi, ta on …', 'lahutatud'],
      ]),
      B.listening('009_d_listen', 'Kuulamine. Uus naaber Oksana.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Oksana. Ma olen kolmkümmend viis aastat vana.', 'Ma elan kolmandal korrusel koos mehe ja tütrega.', 'Minu tütar Mia on kuus aastat vana.',
        'Ukrainas olin ma õpetaja. Praegu ma õpin eesti keelt.', 'Minu huvi on fotograafia. Ma pildistan meie maja ja aeda.', 'Ma olen rahulik ja sõbralik.',
      ], ['Oksana on [35|kolmkümmend viis] aastat vana.', 'Ta elab [kolmandal] korrusel.', 'Mia on [kuus|6] aastat vana.', 'Ukrainas oli Oksana [õpetaja].', 'Oksana huvi on [fotograafia].']),
      B.dictation('009_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Ta on pensionär ja elab üksi.', 'Kati on väga aktiivne.', 'Mul on palju huvisid.', 'Milline inimene ta on?', 'Meie naaber on lahke.'], 5),
      B.errorfix('009_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Kati on üliõpilased.', 'Kati on üliõpilane.'], ['Helmi on pensionär ja ta elavad üksi.', 'Helmi on pensionär ja ta elab üksi.'], ['Milline vana ta on?', 'Kui vana ta on?'],
        ['Urmas on abielu.', 'Urmas on abielus.'], ['Mis Kati õpib?', 'Mida Kati õpib?'],
      ]),
      B.speaking('009_d_say', 'Jutusta ümber.', 'Vali üks naaber. Räägi temast 5–6 lauset.', ['Kes ta on ja kui vana ta on?', 'Kus ta elab?', 'Mida ta teeb?', 'Milline ta on?', 'Mis on tema huvid?'], [60, 90], ['Ta on …', 'Ta elab …', 'Tema huvi on …']),
      B.writing('009_d_write', 'Minu naaber', 'Kirjuta oma naabrist või kolleegist 5–6 lauset.', [5, 6], ['ta on', 'elab', 'huvi'], 2),
      B.selfcheck('009_d_self', ['Ma leian tekstist: vanus, elukoht, elukutse, huvid.', 'Ma küsin: kes, milline, kui vana, kus, mida.', 'Ma jutustan teisest inimesest 5–6 lausega.', 'Ma tean sõnu: pensionär, üliõpilane, lahutatud, lahke.'], 'Tunnen naabreid'),
    ],
    practice: [
      B.reading('009_p_read', 'Loe: Meie kursus.', 'Loe kursuse kodulehelt kolme tutvustust ja vasta küsimustele.', 'Meie kursuslased',
        'Olga, 34. Olen pärit Narvast, elan Tallinnas. Töötan raamatupidajana. Olen abielus, meil on poeg. Olen rahulik ja täpne. Mu huvi on lugemine. Õhtuti käin ma pojaga ujumas.\nTaras, 29. Olen pärit Ukrainast, elan Tartus. Olen programmeerija. Ma ei ole abielus. Olen pikk ja sportlik, käin iga päev jõusaalis. Mulle meeldivad ka arvutimängud. Nädalavahetusel sõidan ma sõpradega maale.\nLiene, 22. Olen pärit Lätist ja õpin Tallinnas ülikoolis. Elan ühiselamus koos sõbrannaga. Olen väga aktiivne ja lõbus. Mul on palju huvisid: tantsimine, matkamine ja kokkamine. Õhtuti töötan kohvikus.',
        [['Kes on raamatupidaja?', 'Olga'], ['Kus elab Taras?', 'Tartus'], ['Mida Taras iga päev teeb?', 'käib jõusaalis|ta käib jõusaalis'], ['Kellega Liene elab?', 'sõbrannaga|koos sõbrannaga'], ['Kus Liene õhtuti töötab?', 'kohvikus'], ['Milline on Olga?', 'rahulik ja täpne|rahulik|täpne']]),
      B.choice('009_p_choice', 'Kes see on?', 'Loe tutvustusi uuesti. Vali õige vastus.', [
        ['Kes on abielus?', 'Olga', 'Taras', 'Liene'], ['Kes on kõige noorem?', 'Liene', 'Olga', 'Taras'], ['Kes käib iga päev jõusaalis?', 'Taras', 'Olga', 'Liene'],
        ['Kes on pärit Lätist?', 'Liene', 'Olga', 'Taras'], ['Kellel on laps?', 'Olgal', 'Tarasel', 'Lienel'],
      ]),
      B.transformation('009_p_retell', 'Jutusta ümber.', 'Kirjuta lause ta-vormis.', [
        ['Ma olen pärit Narvast.', 'Olga …', 'Olga on pärit Narvast.'], ['Ma töötan raamatupidajana.', 'Olga …', 'Olga töötab raamatupidajana.'], ['Ma ei ole abielus.', 'Taras …', 'Taras ei ole abielus.'],
        ['Ma käin iga päev jõusaalis.', 'Taras …', 'Taras käib iga päev jõusaalis.'], ['Ma elan ühiselamus.', 'Liene …', 'Liene elab ühiselamus.'], ['Mul on palju huvisid.', 'Lienel …', 'Lienel on palju huvisid.'],
      ]),
      B.wordforms('009_p_forms', 'ma → ta', 'Kirjuta tegusõna õiges vormis.', [
        ['olema', 'ta', 'on'], ['töötama', 'ta', 'töötab'], ['käima', 'ta', 'käib'], ['elama', 'nad', 'elavad'], ['õppima', 'ta', 'õpib'], ['tegema', 'ta', 'teeb'], ['minema', 'ta', 'läheb'],
      ]),
      B.gaps('009_p_gaps', 'Küsisõna.', 'Vali sõnapangast sobiv küsisõna.', [
        '[Kus] Taras elab? – Tartus.', '[Milline] Olga on? – Rahulik ja täpne.', '[Kui vana] Liene on? – 22.', '[Mida] Liene õhtuti teeb? – Töötab kohvikus.', '[Kas] Olga on abielus? – Jah.', '[Kellega] Liene elab? – Sõbrannaga.',
      ], ['Kus', 'Milline', 'Kui vana', 'Mida', 'Kas', 'Kellega', 'Kes', 'Mis']),
      B.wordorder('009_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Olga on rahulik ja täpne.', 'Taras käib iga päev jõusaalis.', 'Liene töötab õhtuti kohvikus.', 'Tal on palju huvisid.', 'Minu vanaisa on juba pensionär.']),
      B.errorfix('009_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Olga on abielu.', 'Olga on abielus.'], ['Taras on programmeerija ja ta elavad Tartus.', 'Taras on programmeerija ja ta elab Tartus.'], ['Kui vana ta oled?', 'Kui vana ta on?'],
        ['Liene on pärit Läti.', 'Liene on pärit Lätist.'], ['Helmi on lahke naabrid.', 'Helmi on lahke naaber.'],
      ]),
      B.listening('009_p_listen', 'Kuulamine. Kolm inimest.', 'Õpetaja loeb tekstid kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Mart. Ma olen seitsekümmend aastat vana.', 'Olen pensionär. Mu suur huvi on aed.', 'Tere! Mina olen Eva. Ma olen kuusteist.',
        'Ma olen õpilane ja käin gümnaasiumis. Mulle meeldib tantsida.', 'Tervist! Mina olen Toomas, olen nelikümmend.', 'Olen arst ja lahutatud. Mul on kaks poega.',
      ], ['Mart on [70|seitsekümmend] aastat vana.', 'Mardi huvi on [aed].', 'Eva on [õpilane].', 'Evale meeldib [tantsida].', 'Toomas on [arst].', 'Toomasel on kaks [poega].']),
      B.dictation('009_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Olga on pärit Narvast.', 'Taras on pikk ja sportlik.', 'Liene elab ühiselamus.', 'Mul on palju huvisid.', 'Mu vanaisa on pensionär.'], 5),
      B.translation('009_p_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Какой он человек?', 'Сколько ей лет?', 'Мой дедушка пенсионер.', 'Её родители разведены.', 'У него много интересов.']),
      B.speaking('009_p_say', 'Jutusta ümber.', 'Vali üks inimene tekstist. Jutusta temast 5–6 lauset.', ['Kes ta on ja kui vana ta on?', 'Kust ta on pärit ja kus ta elab?', 'Mida ta teeb?', 'Milline ta on ja mis on tema huvid?'], [60, 90]),
      B.writing('009_p_write', 'Minu profiil.', 'Kirjuta endast kursuse lehele profiil 5–7 lausega.', [5, 7], ['olen', 'elan', 'huvi'], 2),
      B.selfcheck('009_p_self', ['Ma leian tekstist inimese kohta faktid.', 'Ma jutustan ümber ta-vormis: Olga töötab, Taras käib.', 'Ma valin õige küsisõna.', 'Ma kirjutan endast profiili.'], 'Faktid on leitud'),
    ],
    transfer: [
      B.text('009_t_situation', 'Näitus „Minu inimesed”', 'Keelekursusel teeme näituse „Minu inimesed”. Iga õpilane teeb ühest lähedasest profiilikaardi ja toob foto. Sofia kirjutab oma vanaemast. Nüüd on sinu kord.'),
      B.reading('009_t_read', 'Loe Sofia profiilikaarti.', 'Loe teksti ja vasta küsimustele.', 'Minu vanaema',
        'Minu vanaema Olena on 81 aastat vana. Ta elab Ukrainas, väikeses külas Lvivi lähedal. Enne oli ta õpetaja, nüüd on ta pensionär. Vanaema on lühike. Tal on pikad hallid juuksed ja soojad pruunid silmad. Ta on väga lahke ja rahulik, aga natuke range. Tal on suur aed. Seal kasvavad õunad, kirsid ja lilled. Vanaema küpsetab väga head leiba. Ta räägib mulle vanu lugusid. Kui ma olin väike, elasin ma igal suvel tema juures. Nüüd me räägime telefonis iga pühapäev. Vanaema on minu jaoks väga tähtis inimene. Ta õpetas mulle, et pere on kõige tähtsam.',
        [['Kui vana on Sofia vanaema?', '81|81 aastat'], ['Kus vanaema elab?', 'Ukrainas|külas Lvivi lähedal|Ukrainas, väikeses külas'], ['Mis oli vanaema elukutse?', 'õpetaja'], ['Millised juuksed vanaemal on?', 'pikad hallid|hallid'], ['Millal Sofia vanaemaga räägib?', 'iga pühapäev|pühapäeval'], ['Mida vanaema küpsetab?', 'leiba']]),
      B.choice('009_t_choice', 'Milline on Olena?', 'Vali õige vastus.', [
        ['Kes on Olena?', 'Sofia vanaema', 'Sofia ema', 'Sofia õde'], ['Mis on Olena praegu?', 'pensionär', 'õpetaja', 'arst'],
        ['Milline on vanaema?', 'lahke ja rahulik', 'lõbus ja aktiivne', 'tõsine ja kuri'], ['Mis kasvab vanaema aias?', 'õunad ja kirsid', 'kartulid ja kapsad', 'tomatid ja kurgid'],
        ['Kus elas Sofia lapsena suviti?', 'vanaema juures', 'Tallinnas', 'laagris'],
      ]),
      B.listening('009_t_listen', 'Kuula Liene tutvustust.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Mina räägin oma tädist. Tema nimi on Inga.', 'Ta on nelikümmend viis aastat vana ja elab Riias.', 'Tädi Inga on arst lastehaiglas.',
        'Ta on pikk, tal on lühikesed punased juuksed.', 'Ta on väga lõbus ja naerab palju.', 'Igal suvel sõidame koos mere äärde.',
      ], ['Liene tädi nimi on [Inga].', 'Inga elab [Riias].', 'Inga on [arst].', 'Tal on lühikesed [punased] juuksed.', 'Inga on väga [lõbus].']),
      B.table('009_t_card', 'Minu profiilikaart.', 'Kirjuta oma lähedase inimese andmed.', 'Küsimus, Minu lähedane', ['Kes ta on? | ', 'Kui vana ta on? | ', 'Kus ta elab? | ', 'Mis on tema elukutse? | ', 'Milline on tema välimus? | ', 'Milline on tema iseloom? | ', 'Mis on tema huvid? | ']),
      B.speaking('009_t_say', 'Näitusel.', 'Tutvusta oma lähedast grupile. Räägi umbes minut.', ['Kes ta on ja kui vana ta on?', 'Kus ta elab ja mida ta teeb?', 'Milline ta on?', 'Miks ta on sulle tähtis?'], [60, 90]),
      B.rolecards('009_t_roles', 'Foto näitusel.', 'Üks näitab fotot, teine küsib.', 'Näitad oma lähedase fotot. Räägi, kes ta on, kus ta elab ja milline ta on.', 'Vaatad fotot. Küsi vähemalt neli küsimust: kes, kui vana, kus elab, milline, mis on tema huvid.', ['See on minu …', 'Ta on …', 'Ta elab …'], ['Kes see on?', 'Milline ta on?', 'Mis on tema huvid?']),
      B.writing('009_t_write', 'Profiilitekst.', 'Kirjuta oma lähedasest 6–8 lauset näituse jaoks.', [6, 8], ['ta on', 'elab', 'tal on'], 2),
      B.letter('009_t_letter', 'Kiri lähedasele.', 'Kirjuta oma lähedasele 30–50 sõna: miks ta on sulle tähtis.', 'Kallis …!', 'Kallistan', [30, 50]),
      B.rubric('009_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Profiilis on faktid: kes, vanus, elukoht, töö.', 'Tekstis on välimus ja iseloom.', 'Tegusõnad on ta-vormis: elab, töötab, on.', 'Suuline tutvustus on 5–6 lauset ja arusaadav.']),
      B.selfcheck('009_t_self', ['Ma saan aru teise inimese profiilist.', 'Ma täidan profiilikaardi.', 'Ma tutvustan lähedast inimest grupile.', 'Ma kirjutan lähedasele lühikese kirja.'], 'Minu inimesed'),
    ],
  },

  'a2-010': {
    title: 'Kontroll 2 — pere ja inimesed',
    canDo: 'Ma näitan kontrollis, et oskan rääkida perest, öelda, kelle oma asi on, ja kirjeldada inimest vähemalt kuue lausega (vähemalt 70%).',
    discover: [
      B.text('010_d_situation', 'Kordame', 'Enne kontrolli kordame mooduli tähtsamat: pere ja sugulased, kelle? (omastav), välimus ja iseloom, võrdlemine ning küsimused inimese kohta.'),
      B.notice('010_d_notice', 'Mooduli kokkuvõte', ['Pere: Mul on **kaks venda**. Mul **ei ole õde**.', 'Kelle?: **Markuse** auto, **venna** kott, **õe** mantel, **nende** maja', 'Välimus: Ta **on** pikk. **Tal on** pikad heledad juuksed.', 'Võrdlus: Isa on **pikem kui** ema.', 'Küsimused: **Kes? Milline? Kui vana? Kus ta elab? Mida ta teeb?**']),
      B.vocab('010_d_vocab', 'Uued sõnad', ['foto — фотография', 'perekond — семья', 'sugulane — родственник', 'onu — дядя', 'tädi — тётя', 'nõbu — двоюродный брат, сестра', 'lõbus — весёлый', 'tõsine — серьёзный', 'sarnane — похожий']),
      B.reading('010_d_read', 'Loe: Perefoto.', 'Loe Tarase teksti ja vasta küsimustele.', 'Minu perekond fotol',
        'See foto on vanaema sünnipäevalt Lvivis. Keskel istub vanaema. Tema kõrval on minu vanemad. Ema on lühike ja lõbus, isa on pikk ja tõsine. Taga seisavad minu onu ja tädi. Onu Petro on ema vend. Ta on emaga väga sarnane: tal on samasugused tumedad juuksed ja pruunid silmad. Tädi Marta on onu naine. Ees on minu nõbu Bohdan. Ta on kümme aastat vana ja väga aktiivne. Ta ei saa kunagi rahulikult istuda. Kus olen mina? Mina olen pildil kõige pikem, paremal ääres. Mul on lühikesed juuksed ja prillid. Minu vend Oleg ei ole pildil, sest ta oli siis Poolas. Meil on suur perekond ja palju sugulasi.',
        [['Kus istub vanaema?', 'keskel'], ['Milline on Tarase isa?', 'pikk ja tõsine|pikk|tõsine'], ['Kes on onu Petro?', 'ema vend|Tarase ema vend'], ['Kellega on onu sarnane?', 'emaga|Tarase emaga'], ['Kui vana on Bohdan?', 'kümme|10|kümme aastat'], ['Miks Oleg ei ole pildil?', 'ta oli Poolas|oli Poolas']]),
      B.truefalse('010_d_tf', 'Õige või vale?', 'Loe Tarase teksti uuesti.', [['Tarase ema on pikk.', false], ['Onu Petro on ema vend.', true], ['Tädi Marta on Tarase ema õde.', false], ['Bohdan on aktiivne.', true], ['Oleg on fotol.', false]]),
      B.match('010_d_match', 'Sugulased.', 'Ühenda selgitus ja sõna.', [['ema vend', 'onu'], ['isa õde', 'tädi'], ['tädi või onu laps', 'nõbu'], ['ema ja isa', 'vanemad'], ['ema ema', 'vanaema'], ['kõik pereliikmed koos', 'perekond']]),
      B.wordforms('010_d_forms', 'Kes? → kelle?', 'Kirjuta sõna omastavas.', [['vend', 'kelle?', 'venna'], ['õde', 'kelle?', 'õe'], ['tütar', 'kelle?', 'tütre'], ['poeg', 'kelle?', 'poja'], ['Taras', 'kelle?', 'Tarase'], ['naaber', 'kelle?', 'naabri']]),
      B.transformation('010_d_trans', 'Ütle teisiti.', 'Kirjuta uus lause algusega.', [
        ['Isa on pikk. Ema on lühike.', 'Isa on …', 'Isa on pikem kui ema.|Isa on emast pikem.'], ['Bohdan on 10. Taras on 29.', 'Bohdan on …', 'Bohdan on noorem kui Taras.|Bohdan on Tarasest noorem.'],
        ['Ema naerab palju. Isa naerab vähe.', 'Ema on …', 'Ema on lõbusam kui isa.|Ema on isast lõbusam.'], ['Markusel on raamat.', 'See on …', 'See on Markuse raamat.'],
        ['Onul on auto.', 'See on …', 'See on onu auto.'], ['Neil on maja.', 'See on …', 'See on nende maja.'],
      ]),
      B.errorfix('010_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Mul on kolm vend.', 'Mul on kolm venda.'], ['See on minu õde mantel.', 'See on minu õe mantel.'], ['Tal on pikk heledad juuksed.', 'Tal on pikad heledad juuksed.'],
        ['Isa on pikk kui ema.', 'Isa on pikem kui ema.'], ['Kui vana ta oled?', 'Kui vana ta on?'], ['Minu onu ja tädi elab Pärnus.', 'Minu onu ja tädi elavad Pärnus.'],
      ]),
      B.gaps('010_d_gaps', 'Täida lüngad.', 'Vali sõnapangast sobiv sõna.', [
        'Minu ema vend on minu [onu].', 'Minu isa õde on minu [tädi].', 'Minu tädi poeg on minu [nõbu].', 'Õde on emaga väga [sarnane].', 'Ta naerab palju, ta on [lõbus].', 'Mul on palju [sugulasi].',
      ], ['onu', 'tädi', 'nõbu', 'sarnane', 'lõbus', 'sugulasi', 'tõsine', 'perekond']),
      B.listening('010_d_listen', 'Kuulamine. Olga pere.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Olga.', 'Minu perekond on väike: mina, mu mees ja poeg Daniil.', 'Daniil on kaheksa aastat vana.', 'Ta on isaga väga sarnane: tal on heledad juuksed ja sinised silmad.',
        'Minu õde elab Narvas. Tal on kaks tütart.', 'Laupäeval sõidame kõik Narva, minu ema juurde.',
      ], ['Olga perekond on [väike].', 'Daniil on [kaheksa|8] aastat vana.', 'Daniil on sarnane [isaga].', 'Olga õde elab [Narvas].', 'Õel on kaks [tütart].', 'Laupäeval sõidavad nad [Narva].']),
      B.wordorder('010_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Keskel istub vanaema.', 'Onu on emaga väga sarnane.', 'Minu nõbu on kümme aastat vana.', 'Meil on suur perekond.']),
      B.translation('010_d_tr', 'Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['Это мой двоюродный брат.', 'Мой дядя живёт в Тарту.', 'Сестра похожа на маму.', 'Чья это фотография?', 'У меня большая семья.']),
      B.speaking('010_d_say', 'Proovieksam: foto.', 'Kirjelda perefotot. Räägi umbes minut.', ['Kes on fotol?', 'Kus nad on?', 'Milline on iga inimene?', 'Kes on kellega sarnane?'], [60, 90]),
      B.writing('010_d_write', 'Kordame kirjutamist.', 'Kirjuta 6–8 lauset oma sugulasest: kes ta on ja milline ta on.', [6, 8], ['on', 'tal on', 'elab'], 2),
      B.selfcheck('010_d_self', ['Ma kordasin pere ja sugulaste sõnu.', 'Ma kasutan omastavat: venna, õe, Markuse.', 'Ma kirjeldan ja võrdlen inimesi.', 'Ma olen valmis kontrolliks.'], 'Valmis kontrolliks'),
    ],
    practice: [
      B.tip('010_p_how', 'Kontroll: lugemine, kuulamine, keel (eksami vormis)', 'See leht on nagu Harno A2 eksami lugemine ja kuulamine. Tee kõik ilma abita. Kuulamisteksti loeb õpetaja kaks korda. Eesmärk on vähemalt 70%.', 'full'),
      B.choice('010_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sõber näitab perefotot. Mida sa küsid?', 'Kes see on?', 'Mis kell on?', 'Kus on pood?'], ['Sa ei tea, kelle kott see on. Mida sa küsid?', 'Kelle kott see on?', 'Kus kott on?', 'Mis kott maksab?'],
        ['Sõbral sündis tütar. Mida sa ütled?', 'Palju õnne!', 'Head isu!', 'Pole viga!'], ['Kolleeg küsib, kas sul on lapsi. Sul ei ole. Mida sa vastad?', 'Ei, mul ei ole lapsi.', 'Jah, mul on kaks last.', 'Jah, ma olen abielus.'],
        ['Uus naaber on väga abivalmis. Mida sa ütled?', 'Te olete väga lahke!', 'Te olete väga vana!', 'Te olete väga pikk!'],
      ], 'full', 'g_use'),
      B.reading('010_p_ad', 'Lugemine 2. Kuulutus.', 'Loe kuulutust ja vasta küsimustele.', 'Otsime lapsehoidjat!',
        'Meie pere elab Tartus, Karlova linnaosas. Meil on kaks last: poeg Rasmus ja tütar Grete. Rasmus on kuueaastane ja käib lasteaias. Grete on kolm, ta on kodus. Rasmus on aktiivne ja armastab jalgpalli. Grete on rahulik, talle meeldivad raamatud. Meie kodu on suur ja hele, aias on mänguväljak. Otsime lahket ja rõõmsat inimest, kes räägib eesti keelt. Töö on esmaspäevast reedeni kell 8–13. Hommikul tuleb viia Rasmus lasteaeda. Siis tuleb mängida Gretega ja teha lõunasööki. Palk on 9 eurot tunnis. Kui oled huvitatud, helista emale Kertule: 5566 7788.',
        [['Kus pere elab?', 'Tartus|Karlovas|Tartus, Karlova linnaosas'], ['Kui vana on Grete?', '3|kolm|kolm aastat'], ['Mis Rasmusele meeldib?', 'jalgpall|jalgpalli'], ['Milline peab lapsehoidja olema?', 'lahke ja rõõmus|lahke|rõõmus'], ['Mis kell on töö?', 'kell 8–13|8–13|kaheksast üheni'], ['Kellele tuleb helistada?', 'emale Kertule|Kertule|emale']]),
      B.truefalse('010_p_tf', 'Lugemine 3. Õige või vale?', 'Loe kuulutust uuesti.', [['Peres on kaks last.', true], ['Grete käib lasteaias.', false], ['Grete on rahulik.', true], ['Töö on ka laupäeval.', false], ['Lapsehoidja teeb lõunasööki.', true]]),
      B.cloze('010_p_cloze', 'Lugemine 4. Kiri.', 'Vali igasse lünka sobiv sõna.', 'Tere, Kati!', [
        'Mul on nüüd uus töö: ma olen {*lapsehoidja|lapsehoidjat|lapsehoidjad} ühes peres. Peres on kaks {*last|laps|lapsed}.',
        'Poeg on väga {*aktiivne|aktiivsed|aktiivset}. Tütar on {*rahulikum|rahulik|rahulikud} kui poeg.',
        '{*Rasmuse|Rasmus|Rasmusel} ema Kertu on väga lahke. Tal on pikad {*heledad|hele|heledam} juuksed.',
        'Tema mees on {*pikem|pikk|pikad} kui minu mees. Kas sa tuled laupäeval meile? {*Minu|Mina|Mul} tütar tahab sind näha.',
      ]),
      B.listening('010_p_listen', 'Kuulamine 1. Perefoto.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'See on minu pere foto. Vasakul on minu isa.', 'Ta on pikk ja tal on hallid juuksed.', 'Isa kõrval on minu ema. Ta on lühike ja väga lõbus.',
        'Paremal on minu õde Maarja.', 'Maarjal on pikad punased juuksed.', 'Ees istub minu vend Karl. Ta on üheksa aastat vana.',
      ], ['Vasakul on [isa].', 'Isal on [hallid] juuksed.', 'Ema on lühike ja väga [lõbus].', 'Paremal on õde [Maarja].', 'Maarjal on pikad [punased] juuksed.', 'Karl on [üheksa|9] aastat vana.']),
      B.listening('010_p_listen2', 'Kuulamine 2. Telefonikõne.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere! Siin Kertu Mets.', '— Tere! Mina olen Oksana. Ma helistan kuulutuse pärast.', '— Väga tore! Kas teil on lapsi?', '— Jah, mul on tütar. Ta on kuus aastat vana.',
        '— Kas te räägite eesti keelt?', '— Jah, natuke. Ma õpin kursusel.', '— Kas te saate tulla neljapäeval kell kümme?', '— Jah, sobib. Aitäh!',
      ], ['Helistaja nimi on [Oksana].', 'Oksanal on [tütar].', 'Tütar on [kuus|6] aastat vana.', 'Oksana õpib eesti keelt [kursusel].', 'Kohtumine on [neljapäeval] kell kümme.']),
      B.gaps('010_p_mix', 'Keel. Viis punkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'See on [Markuse] auto. (Markus)', 'Mul on kaks [venda]. (vend)', 'Tal on [sinised] silmad. (sinine)', 'Õde on [noorem] kui mina. (noor)', 'Kas see on [teie] laps? (teie)',
      ]),
      B.gaps('010_p_mix2', 'Keel. Veel viis punkti.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Need on [nende] asjad. (nemad)', 'Meil ei ole [last]. (laps)', '[Õe] mantel on pikk. (õde)', 'Isa on [pikem] kui ema. (pikk)', 'Mu vanemad [elavad] maal. (elama)',
      ]),
      B.errorfix('010_p_fix', 'Keel. Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Tal on pikk juuksed.', 'Tal on pikad juuksed.'], ['See on Viktor auto.', 'See on Viktori auto.'], ['Mul on kaks tütar.', 'Mul on kaks tütart.'], ['Ta on lühike kui mina.', 'Ta on lühem kui mina.'], ['Need on nemad lapsed.', 'Need on nende lapsed.'],
      ]),
      B.wordorder('010_p_order', 'Keel. Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Rasmus käib hommikul lasteaias.', 'Grete on väga rahulik laps.', 'Kelle telefon see on?', 'Mu õde on minust noorem.', 'Meil ei ole lapsehoidjat.']),
      B.translation('010_p_tr', 'Keel. Tõlgi eesti keelde.', 'Kirjuta lause eesti keeles.', ['У меня два брата.', 'Это машина моего отца.', 'У неё тёмные волосы.', 'Он моложе, чем я.', 'Чья это сумка?']),
      B.writing('010_p_write', 'Kirjutamine. Sõnum Kertule.', 'Kirjuta Kertule 4–6 lauset: kes sa oled ja miks sobid lapsehoidjaks.', [4, 6], ['olen', 'mul on', 'lapsed'], 2),
      B.speaking('010_p_say', 'Rääkimine. Minu pere.', 'Vasta õpetaja küsimustele, nagu eksamil.', ['Kui suur on teie pere?', 'Kes on teie pereliikmed?', 'Milline on teie ema või isa?', 'Kellega te olete sarnane?'], [45, 75]),
      B.selfcheck('010_p_self', ['Ma saan aru kuulutusest ja kirjast.', 'Ma kuulen nime, vanust ja kirjeldust.', 'Ma kasutan omastavat, mitmust ja võrdlust õigesti.', 'Ma vastan küsimustele oma pere kohta.'], 'Kontroll tehtud'),
    ],
    transfer: [
      B.text('010_t_situation', 'Kontroll: kirjutamine ja rääkimine', 'Sa oled pargis sõbraga. Te räägite oma peredest ja kirjeldate inimesi. Siis kirjutad perefoto juurde teksti ja sõnumi. Õpetaja hindab, eesmärk on vähemalt 70%.'),
      B.listening('010_t_listen', 'Kuulamine. Anna kirjeldab.', 'Õpetaja loeb teksti kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Anna: Kas sa tead minu nõbu Kristot?', 'Ta on kolmkümmend kaks aastat vana.', 'Ta on väga pikk ja tal on lühikesed mustad juuksed.',
        'Tal on habe ja prillid.', 'Ta on natuke tõsine, aga väga lahke.', 'Ta töötab Tartus arstina.',
      ], ['Kristo on Anna [nõbu].', 'Kristo on [32|kolmkümmend kaks] aastat vana.', 'Tal on lühikesed [mustad] juuksed.', 'Kristo on natuke [tõsine].', 'Ta töötab [arstina].']),
      B.reading('010_t_reply', 'Lugemine. Sõbra vastus.', 'Loe Oksana sõnumit ja vasta küsimustele.', 'Tere!',
        'Tere! Aitäh kutse eest! Ma tulen hea meelega laupäeval teie juurde. Kas ma võin võtta kaasa ka Mia? Ta tahab väga sinu lastega mängida. Mia on kuus aastat vana, ta on aktiivne ja lõbus. Ta räägib juba natuke eesti keelt. Minu mees ei saa tulla, sest ta töötab laupäeval. Ma toon kaasa Ukraina koogi, see on minu vanaema retsept. Mis kell me võime tulla? Kas kell kaks sobib? Kirjuta mulle palun oma aadress. Ma ei tea, kus su maja on. Kohtumiseni! Oksana',
        [['Kes tuleb Oksanaga kaasa?', 'Mia|tütar Mia'], ['Milline on Mia?', 'aktiivne ja lõbus|aktiivne|lõbus'], ['Miks Oksana mees ei tule?', 'ta töötab laupäeval|töötab'], ['Mida Oksana kaasa toob?', 'Ukraina koogi|kooki|koogi'], ['Mida Oksana ei tea?', 'aadressi|kus maja on']]),
      B.table('010_t_tree', 'Kirjutamine 1. Sugupuu.', 'Täida tabel oma pere andmetega.', 'Pereliige, Nimi, Vanus, Milline ta on?', ['ema | | | ', 'isa | | | ', 'õde või vend | | | ', 'onu või tädi | | | ', 'vanaema või vanaisa | | | ']),
      B.wordorder('010_t_order', 'Kontrolli lauseid.', 'Kirjuta sõnad õiges järjekorras.', ['Fotol on minu perekond.', 'Vasakul seisab minu vend.', 'Tal on lühikesed tumedad juuksed.', 'Minu tädi on väga lõbus.', 'Ma olen isaga sarnane.']),
      B.errorfix('010_t_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Minu õel on kaks laps.', 'Minu õel on kaks last.'], ['Minu tädi elavad Pärnus.', 'Minu tädi elab Pärnus.'],
        ['Mu nõbu on pikk kui mina.', 'Mu nõbu on pikem kui mina.'], ['Tal on sinine silmad.', 'Tal on sinised silmad.'], ['See on mina foto.', 'See on minu foto.'],
      ]),
      B.planning('010_t_plan', 'Enne kirjutamist.', 'Kirjuta märksõnad perefoto teksti jaoks.', ['Kes on fotol?', 'Kus ja millal on foto tehtud?', 'Milline on iga inimene?'], 2),
      B.letter('010_t_letter', 'Kirjutamine 2. Perefoto.', 'Kirjuta perefoto juurde 60–80 sõna: kes on fotol ja millised nad on.', 'Minu perefoto', 'Kirjutas: …', [60, 80]),
      B.writing('010_t_write', 'Kirjutamine 3. Sõnum.', 'Kirjuta Oksanale 4–6 lauset: vasta tema küsimustele ja kirjuta aadress.', [4, 6], ['kell', 'Mia', 'aadress'], 2),
      B.speaking('010_t_say', 'Rääkimine 1. Kirjelda inimest.', 'Kirjelda üht oma pereliiget. Räägi umbes minut.', ['Kes ta on ja kui vana ta on?', 'Kus ta elab ja mida ta teeb?', 'Milline on tema välimus?', 'Milline on tema iseloom?'], [60, 90]),
      B.rolecards('010_t_roles', 'Rääkimine 2. Dialoog pargis.', 'Rääkige oma peredest. Küsige ja vastake.', 'Kirjelda oma sugulast: välimus, iseloom, mida ta teeb. Ära ütle, kes ta on. Lase sõbral arvata.', 'Kuula, küsi täpsustavaid küsimusi ja arva: kas see on vend, onu, tädi või nõbu?', ['Ta on üsna …', 'Tal on …', 'Ta elab …'], ['Kui vana ta on?', 'Kas ta on sinu …?', 'Kelle laps ta on?']),
      B.rubric('010_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti. Kokku 70% = kontroll on sooritatud.', ['Perefoto tekstis on 60–80 sõna ja vähemalt neli inimest.', 'Inimese kirjeldus on vähemalt kuus lauset: välimus ja iseloom.', 'Omastav, mitmus ja võrdlus on õiges vormis.', 'Sõnum vastab Oksana küsimustele.', 'Dialoogis küsib ja vastab õpilane arusaadavalt.']),
      B.selfcheck('010_t_self', ['Ma kirjutan perefoto juurde 60–80 sõna.', 'Ma kirjeldan inimest vähemalt kuue lausega.', 'Ma vastan sõbra sõnumile.', 'Ma räägin oma perest dialoogis.'], 'Moodul 2 on läbitud'),
    ],
  },
};
