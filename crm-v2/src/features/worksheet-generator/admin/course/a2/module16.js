// A2 course (A1 → A2 roadmap), module 16 „Minevik ja kogemused”, new lessons a2-078 and a2-079 (stage A2).
// All three phases: Avasta → Harjuta → Kasuta, each a whole lesson (40–55 min). 078 reads a short story in the past
// (who, where, when, what happened, why; the order of events), 079 brings the perfect only as the experience model
// („Kas sa oled kunagi … käinud?”) against the simple past with an exact time. The other lessons of the module are in
// the database already.
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-16', course: 'a2', title: 'Minevik ja kogemused', level: 'A2' };

export const LESSONS = {
  'a2-078': {
    title: 'Lühike lugu minevikus',
    canDo: 'Ma loen 150–180-sõnalist lugu minevikus, vastan küsimustele kes, kus, millal, mis juhtus ja miks ning panen kuus sündmust õigesse järjekorda.',
    discover: [
      B.text('078_d_intro', 'Liisi sõnum', 'Liis kirjutab õhtul sõbrannale Sofiale: „Täna oli kummaline päev! Ma unustasin oma koti bussi. Kotis olid rahakott, võtmed ja sülearvuti. Õnneks leidis bussijuht koti üles. Õhtul sain koti tagasi.”'),
      B.truefalse('078_d_tf', 'Mis juhtus?', 'Loe Liisi sõnumit. Õige või vale?', [
        ['Liis unustas koti bussi.', true], ['Kotis oli ainult telefon.', false], ['Koti leidis bussijuht.', true],
        ['Liis sai koti tagasi järgmisel päeval.', false], ['See juhtus täna.', true],
      ]),
      B.vocab('078_d_vocab', 'Loo sõnad', ['juhtuma — случаться', 'unustama — забывать', 'kaotama — терять', 'leidma — находить', 'äkki — вдруг', 'õnneks — к счастью', 'kahjuks — к сожалению', 'kõigepealt — сначала', 'pärast seda — после этого', 'lõpuks — наконец', 'peatus — остановка', 'tagasi saama — получить обратно'], '2'),
      B.reading('078_d_read', 'Loe: kadunud kott.', 'Loe lugu ja vasta küsimustele.', 'Kadunud kott', [
        'Eelmisel reedel sõitis Liis pärast tööd bussiga koju. Ta oli väga väsinud, sest tööpäev oli pikk. Bussis luges ta telefonist uudiseid. Siis helistas tema ema ja nad rääkisid kaua. Äkki nägi Liis, et buss on juba tema peatuses. Ta hüppas kiiresti bussist välja.',
        'Kodu ukse ees otsis ta võtmeid, aga kotti ei olnud! Kott jäi bussi istmele. Kotis olid rahakott, võtmed ja töö sülearvuti. Liis ei saanud ilma võtmeteta koju minna. Ta oli väga mures. Õnneks oli telefon tal käes.',
        'Kõigepealt helistas ta bussifirmasse. Töötaja ütles, et bussijuht vaatab bussi lõpp-peatuses üle. Liis ootas naabri juures pool tundi. Naaber Viktor pakkus talle teed. Siis tuli bussifirmast sõnum: kott on leitud! Pärast seda sõitis Liis taksoga bussijaama. Takso maksis kaksteist eurot, aga Liis oli õnnelik. Bussijuht andis talle koti kätte. Kõik asjad olid alles. Liis tänas juhti ja ostis talle šokolaadi. Lõpuks jõudis ta koju alles kell kümme õhtul. Nüüd hoiab ta kotti bussis alati süles.',
      ], [
        ['Millal see lugu juhtus?', 'eelmisel reedel|reedel|reede õhtul'],
        ['Miks Liis oma peatust kohe ei märganud?', 'ta rääkis emaga telefonis|ta rääkis emaga|ema helistas'],
        ['Kus Liis märkas, et kotti ei ole?', 'kodu ukse ees|ukse ees'],
        ['Miks ei saanud Liis koju minna?', 'võtmed olid kotis|tal ei olnud võtmeid'],
        ['Kuhu Liis kõigepealt helistas?', 'bussifirmasse|bussifirmale'],
        ['Kuidas Liis bussijuhti tänas?', 'ostis talle šokolaadi|andis šokolaadi|šokolaadiga'],
      ]),
      B.table('078_d_order', 'Mis juhtus enne, mis pärast?', 'Kirjuta igale sündmusele number 1–6.', 'sündmus, number', [
        'Liis sõitis taksoga bussijaama. | [5]', 'Ema helistas Liisile. | [1]', 'Liis otsis ukse ees võtmeid. | [2]',
        'Bussifirmast tuli sõnum. | [4]', 'Liis helistas bussifirmasse. | [3]', 'Liis jõudis koju kell kümme. | [6]',
      ], 'g_read'),
      B.notice('078_d_notice', 'Märka: kuidas lugu liigub?', ['**Kõigepealt** helistas ta bussifirmasse.', '**Siis** tuli sõnum.', '**Pärast seda** sõitis ta taksoga.', '**Lõpuks** jõudis ta koju.', '**Äkki** nägi Liis oma peatust.', '**Õnneks** oli telefon käes.'], 'full'),
      B.tip('078_d_rule', 'Loo plaan', ['Algus: kes? kus? millal?', 'Keskel: mis juhtus? miks?', 'Lõpp: kuidas lugu lõppes?', 'Järjekord: kõigepealt → siis → pärast seda → lõpuks.', 'Tegusõna on teisel kohal: Siis **helistas** ta…'], 'full'),
      B.match('078_d_match', 'Küsimus ja vastus.', 'Ühenda küsimus ja vastus loost.', [
        ['Kes leidis koti?', 'bussijuht'], ['Kus kott oli?', 'bussi istmel'], ['Kellega Liis telefonis rääkis?', 'emaga'],
        ['Kes pakkus Liisile teed?', 'naaber Viktor'], ['Kuidas Liis bussijaama sõitis?', 'taksoga'], ['Mis kell Liis koju jõudis?', 'kell kümme õhtul'],
      ], 'full', 'g_read'),
      B.choice('078_d_choice', 'Mõtle loo üle.', 'Vali igale küsimusele õige vastus.', [
        ['Milline pealkiri sobib loole kõige paremini?', 'Kott jäi bussi', 'Liisi uus töö', 'Ema sünnipäev'],
        ['Miks Liis kiiresti bussist välja hüppas?', 'Buss oli juba tema peatuses.', 'Bussis oli väga palav.', 'Ema ootas teda peatuses.'],
        ['Kuidas Liis end tundis, kui kotti ei olnud?', 'Ta oli mures.', 'Ta oli rõõmus.', 'Ta oli vihane.'],
        ['Kes aitasid Liisil koti tagasi saada?', 'bussifirma ja bussijuht', 'ema ja Sofia', 'politsei ja takso'],
        ['Mida Liis nüüd bussis teeb?', 'Hoiab kotti süles.', 'Sõidab ainult taksoga.', 'Ei võta kotti kaasa.'],
      ]),
      B.wordforms('078_d_forms', 'Mis vorm on loos?', 'Kirjuta tegusõna lihtminevikus.', [
        ['sõitma', 'eile ta …', 'sõitis'], ['nägema', 'eile ta …', 'nägi'], ['tulema', 'eile sõnum …', 'tuli'],
        ['andma', 'eile juht …', 'andis'], ['ostma', 'eile ta …', 'ostis'], ['jõudma', 'eile ta …', 'jõudis'],
      ]),
      B.gaps('078_d_gaps', 'Markuse lugu.', 'Kirjuta sobiv sõna. Kaks sõna jääb üle.', [
        '[Laupäeval] läks Markus metsa seenele.', '[Kõigepealt] sõitis ta autoga metsa äärde.', '[Siis|Pärast seda] kõndis ta kaks tundi metsas.',
        '[Äkki] hakkas tugevalt sadama.', '[Õnneks] oli tal vihmajope kaasas.', '[Pärast seda|Siis] leidis ta palju seeni.', '[Lõpuks] jõudis ta õhtul koju.',
      ], ['laupäeval', 'kõigepealt', 'siis', 'äkki', 'õnneks', 'pärast seda', 'lõpuks', 'kahjuks', 'homme']),
      B.errorfix('078_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Eile ma lähen kinno.', 'Eile läksin ma kinno.|Eile ma läksin kinno.'], ['Ta tulis koju hilja.', 'Ta tuli koju hilja.'],
        ['Me nägisime head filmi.', 'Me nägime head filmi.'], ['Ma ei leidsin võtmeid.', 'Ma ei leidnud võtmeid.'],
        ['Siis Liis helistas emale.', 'Siis helistas Liis emale.'],
      ]),
      B.translation('078_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Вчера я забыла сумку в автобусе.', 'К счастью, водитель нашёл сумку.', 'Сначала я позвонила в фирму.', 'Потом я ждала полчаса.', 'Наконец я пришла домой.']),
      B.dictation('078_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Eile juhtus midagi kummalist.', 'Liis unustas koti bussi.', 'Kõigepealt helistas ta bussifirmasse.', 'Õnneks leidis juht koti.', 'Pärast seda sõitis ta taksoga.', 'Lõpuks jõudis ta koju.']),
      B.speaking('078_d_say', 'Jutusta lugu ümber.', 'Räägi Liisi lugu oma sõnadega. Kasuta loo plaani.', ['Kes? Kus? Millal?', 'Mis juhtus?', 'Mida Liis tegi?', 'Kuidas lugu lõppes?'], [60, 90], ['kõigepealt', 'siis', 'äkki', 'õnneks', 'lõpuks']),
      B.writing('078_d_write', 'Minu kummaline päev.', 'Kirjuta 6–8 lauset ühest päevast, kui midagi juhtus.', [6, 8], ['kõigepealt', 'siis', 'äkki', 'lõpuks'], 3),
      B.selfcheck('078_d_self', ['Ma leian loost: kes, kus, millal.', 'Ma ütlen, mis juhtus ja miks.', 'Ma panen sündmused järjekorda.', 'Ma jutustan loo ümber.'], 'Lugu on loetud'),
    ],
    practice: [
      B.crossword('078_p_cross', 'Mäletad loo sõnu?', 'Kirjuta sõna vihje järgi.', [
        ['„kaotama” vastand', 'leidma'], ['Siin buss peatub.', 'peatus'], ['Ta juhib bussi.', 'juht'],
        ['к счастью', 'õnneks'], ['вдруг', 'äkki'], ['Viimane samm loos: …', 'lõpuks'],
      ]),
      B.choice('078_p_forms', 'Vali õige vorm.', 'Vali lausesse sobiv tegusõna vorm.', [
        ['Eile … Liis bussiga koju.', 'sõitis', 'sõidab', 'sõitma'],
        ['Eile õhtul … bussijuht koti.', 'leidis', 'leiab', 'leida'],
        ['Me … eile kaua telefonis.', 'rääkisime', 'räägime', 'rääkisid'],
        ['Kas sa … eile poes?', 'käisid', 'käid', 'käisime'],
        ['Eile … nad koju alles kell kümme.', 'jõudsid', 'jõuavad', 'jõudis'],
        ['Liis … eile oma peatust.', 'ei märganud', 'ei märka', 'ei märkas'],
      ], 'full', 'g_notice'),
      B.gaps('078_p_gaps', 'Sofia reis.', 'Kirjuta sulgudes olev tegusõna lihtminevikus.', [
        'Eelmisel laupäeval [sõitis] (sõitma) Sofia rongiga Tartusse.', 'Rongis [luges] (lugema) ta raamatut.', 'Tartus [ootas] (ootama) teda vana sõbranna.',
        'Nad [jõid] (jooma) kohvikus kohvi.', 'Õhtul [läksid] (minema) nad teatrisse.', 'Sofia [tuli] (tulema) koju alles pühapäeval.',
      ]),
      B.reading('078_p_read', 'Loe: Viktori halb hommik.', 'Loe lugu ja vasta küsimustele.', 'Halb hommik', [
        'Teisipäeva hommikul ärkas Viktor liiga hilja. Tema äratuskell ei helisenud, sest telefon oli tühi. Ta pani kiiresti riided selga ja jooksis bussipeatusse. Kahjuks sõitis buss just minema. Järgmine buss tuli alles kahekümne minuti pärast. Viktor helistas oma ülemusele ja ütles, et jääb hiljaks. Ülemus vastas, et see ei ole probleem.',
        'Bussis märkas Viktor, et tal on jalas eri värvi sokid. Üks oli must, teine sinine. Tööl naersid kolleegid tema üle, aga ka Viktor ise naeris. Lõuna ajal ostis ta poest uued sokid. Õhtul laadis ta telefoni täis ja pani kella helisema kaks korda.',
      ], [
        ['Miks äratuskell ei helisenud?', 'telefon oli tühi'], ['Miks ei saanud Viktor esimese bussiga sõita?', 'buss sõitis just minema|buss läks ära|ta jäi hiljaks'],
        ['Kui kaua ootas ta järgmist bussi?', 'kakskümmend minutit|20 minutit'], ['Mida Viktor bussis märkas?', 'tal olid eri värvi sokid|sokid olid eri värvi'],
        ['Mida tegi Viktor lõuna ajal?', 'ostis uued sokid'], ['Mida tegi Viktor õhtul teisiti?', 'laadis telefoni täis|pani kella helisema kaks korda'],
      ]),
      B.diagram('078_p_line', 'timeline', { title: 'Viktori päev.', instruction: 'Kirjuta tegusõna lihtminevikus.', nodes: '7.40 | Viktor [ärkas] liiga hilja\n7.50 | ta [jooksis] bussipeatusse\n8.10 | ta [helistas] ülemusele\n12.30 | ta [ostis] uued sokid\n21.00 | ta [laadis] telefoni täis' }, 'full'),
      B.truefalse('078_p_tf', 'Õige või vale?', 'Loe Viktori lugu uuesti.', [
        ['Viktor ärkas õigel ajal.', false], ['Viktor helistas ülemusele.', true], ['Ülemus oli väga vihane.', false],
        ['Viktori sokid olid eri värvi.', true], ['Kolleegid naersid Viktori üle.', true],
      ]),
      B.transformation('078_p_trans', 'Täna → eile.', 'Kirjuta lause minevikus.', [
        ['Täna ärkan ma vara.', 'Eile …', 'Eile ärkasin ma vara.|Eile ma ärkasin vara.'],
        ['Täna läheb ta bussiga tööle.', 'Eile …', 'Eile läks ta bussiga tööle.|Eile ta läks bussiga tööle.'],
        ['Täna ei helista ema.', 'Eile …', 'Eile ei helistanud ema.|Eile ema ei helistanud.'],
        ['Täna sööme kodus.', 'Eile …', 'Eile sõime kodus.|Eile me sõime kodus.'],
        ['Täna nad naeravad palju.', 'Eile …', 'Eile naersid nad palju.|Eile nad naersid palju.'],
      ]),
      B.errorfix('078_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Eile Viktor ärkas hilja.', 'Eile ärkas Viktor hilja.'], ['Ta ei ärkasin õigel ajal.', 'Ta ei ärganud õigel ajal.'],
        ['Bussis ta märkas sokke.', 'Bussis märkas ta sokke.'], ['Kolleegid naeravad eile.', 'Kolleegid naersid eile.'],
        ['Lõpuks ta laadis telefoni.', 'Lõpuks laadis ta telefoni.'],
      ]),
      B.match('078_p_titles', 'Pealkiri ja lugu.', 'Ühenda pealkiri ja lühike lugu.', [
        ['Kadunud võtmed', 'Otsisin terve hommiku võtmeid. Lõpuks leidsin need külmkapist.'],
        ['Hiline buss', 'Ootasin bussi pool tundi. Jõudsin tööle kell kümme.'],
        ['Vihmane matk', 'Läksime metsa, aga äkki hakkas sadama. Jooksime autosse.'],
        ['Üllatus', 'Tulin koju ja kõik sõbrad olid minu köögis.'],
        ['Katkine telefon', 'Telefon kukkus maha. Ekraan läks katki.'],
      ], 'full', 'g_read'),
      B.translation('078_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Утром я проснулся слишком поздно.', 'К сожалению, автобус уже уехал.', 'Я позвонил начальнику.', 'Коллеги смеялись.', 'Вечером я зарядил телефон.']),
      B.dictation('078_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Viktor ärkas liiga hilja.', 'Telefon oli tühi.', 'Buss sõitis just minema.', 'Ta helistas ülemusele.', 'Kolleegid naersid tema üle.', 'Õhtul laadis ta telefoni.']),
      B.speaking('078_p_say', 'Mis sinuga juhtus?', 'Räägi paarilisele hommikust, kui kõik läks valesti.', ['Millal see oli?', 'Mis juhtus kõigepealt?', 'Mida sa tegid?', 'Kuidas päev lõppes?'], [60, 90], ['kõigepealt', 'kahjuks', 'siis', 'lõpuks']),
      B.writing('078_p_write', 'Viktori lugu minu nimel.', 'Kirjuta Viktori hommik ma-vormis: Ma ärkasin…', [6, 8], ['ärkasin', 'kahjuks', 'siis', 'lõpuks'], 3),
      B.selfcheck('078_p_self', ['Ma moodustan lihtmineviku vormi.', 'Ma panen tegusõna teisele kohale.', 'Ma leian loost vajaliku info.', 'Ma jutustan oma halvast hommikust.'], 'Minevik töötab'),
    ],
    transfer: [
      B.text('078_t_situation', 'Uus olukord', 'Kursusel on „Lugude õhtu”. Iga õpilane räägib ühe lühikese loo, mis temaga päriselt juhtus. Kõigepealt kuulad Jaani lugu. Siis valmistad ette oma loo.'),
      B.listening('078_t_listen', 'Kuula: Jaani lugu.', 'Õpetaja loeb loo kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Mina olen Jaan. Ma räägin teile ühe loo.',
        'Eelmisel pühapäeval läksin oma koeraga parki. Koera nimi on Muri. Ilm oli ilus ja pargis oli palju inimesi.',
        'Ma võtsin Murilt rihma ära. Äkki nägi Muri oravat ja jooksis metsa poole. Ma hüüdsin teda, aga ta ei tulnud tagasi.',
        'Kõigepealt otsisin teda üksi. Siis helistasin oma naabrile Markusele. Markus tuli appi ja me otsisime koos üks tund. Ma olin väga mures.',
        'Lõpuks helistas mulle üks võõras naine. Muri oli tema aias ja sõi kassi toitu! Naine luges minu numbrit koera kaelarihmalt.',
        'Õnneks lõppes kõik hästi. Nüüd hoian Murit pargis alati rihma otsas.',
      ], [
        'Jaan läks eelmisel [pühapäeval] parki.', 'Muri jooksis ära, sest ta nägi [oravat].', 'Abi saamiseks helistas Jaan [naabrile|Markusele].',
        'Mehed otsisid koera [üks tund|tund aega|tund].', 'Lõpuks oli koer võõra naise [aias].', 'Naine leidis numbri koera [kaelarihmalt|kaelarihmast].',
      ]),
      B.categorize('078_t_parts', 'Loo osad.', 'Pane Jaani loo osad õigesse rühma.', [
        ['Algus: kes, kus, millal', ['eelmisel pühapäeval', 'pargis', 'mina ja mu koer']],
        ['Keskel: mis juhtus', ['äkki nägi Muri oravat', 'ta ei tulnud tagasi', 'me otsisime üks tund']],
        ['Lõpp', ['lõpuks helistas naine', 'õnneks lõppes kõik hästi', 'nüüd hoian Murit rihmas']],
      ], 'full', 'g_read'),
      B.gaps('078_t_gaps', 'Jaani lugu lühidalt.', 'Kirjuta sulgudes olev tegusõna lihtminevikus.', [
        'Pühapäeval [läks] (minema) Jaan koeraga parki.', 'Koer [nägi] (nägema) oravat.', 'Muri [jooksis] (jooksma) metsa poole.',
        'Jaan [helistas] (helistama) naabrile.', 'Nad [otsisid] (otsima) koera üks tund.', 'Õhtul [sõi] (sööma) Muri kodus õhtusööki.',
      ]),
      B.wordorder('078_t_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Eelmisel pühapäeval läksin ma parki.', 'Äkki jooksis koer metsa poole.', 'Kõigepealt otsisin ma teda üksi.', 'Õnneks helistas mulle üks naine.', 'Lõpuks lõppes kõik hästi.',
      ]),
      B.translation('078_t_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['В прошлое воскресенье я был в парке.', 'Вдруг собака убежала.', 'Сосед пришёл на помощь.', 'К счастью, всё закончилось хорошо.']),
      B.dictation('078_t_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Pühapäeval läksin parki.', 'Äkki jooksis koer ära.', 'Ma olin väga mures.', 'Naaber tuli appi.', 'Õnneks lõppes kõik hästi.']),
      B.planning('078_t_plan', 'Minu loo plaan.', 'Kirjuta märksõnad.', ['Kes? Kus? Millal?', 'Mis juhtus?', 'Mida sa tegid?', 'Kuidas lugu lõppes?']),
      B.speaking('078_t_tell', 'Lugude õhtu.', 'Jutusta grupile oma lugu 1–2 minutit.', ['Kes? Kus? Millal?', 'Mis juhtus?', 'Mida sa tegid?', 'Kuidas lugu lõppes?'], [60, 120], ['kõigepealt', 'siis', 'äkki', 'õnneks', 'lõpuks']),
      B.rolecards('078_t_roles', 'Kuulaja küsib.', 'A jutustab, B küsib. Siis vahetage.',
        'Jutusta oma lugu. Vasta igale küsimusele.', 'Kuula ja küsi vähemalt 4 küsimust.',
        ['Eelmisel nädalal…', 'Äkki…', 'Lõpuks…'], ['Millal see juhtus?', 'Kus sa olid?', 'Miks see juhtus?', 'Mida sa siis tegid?']),
      B.writing('078_t_write', 'Minu lugu kursuse lehele.', 'Kirjuta oma lugu 6–8 lausega.', [6, 8], ['kõigepealt', 'siis', 'äkki', 'lõpuks'], 3),
      B.letter('078_t_msg', 'Sõnum sõbrale.', 'Kirjuta sõbrale: mis eile juhtus, kus, kuidas see lõppes.', 'Tere, Sofia!', 'Kuidas sinul läheb?', [30, 50]),
      B.selfcheck('078_t_self', ['Ma saan aru lühikesest kuuldud loost.', 'Ma teen oma loole plaani.', 'Ma jutustan loo 1–2 minutit.', 'Ma kirjutan loo 6–8 lausega.'], 'Lugu on räägitud'),
    ],
  },

  'a2-079': {
    title: 'Kogemus: olen käinud',
    canDo: 'Ma räägin oma kogemustest 4–5 mudeliga (olen käinud, olen näinud, olen proovinud, ei ole veel …) ja küsin kaaslaselt „Kas sa oled kunagi …?”.',
    discover: [
      B.text('079_d_intro', 'Lõunapausil', 'Markus küsib uuelt kolleegilt Sofialt: „Kas sa oled kunagi Saaremaal käinud?” Sofia vastab: „Jah, olen käinud kaks korda. Viimati käisin seal eelmisel suvel. Aga talisuplust ma ei ole veel proovinud.”'),
      B.truefalse('079_d_tf', 'Mida Sofia ütles?', 'Loe vestlust. Õige või vale?', [
        ['Sofia on Saaremaal käinud.', true], ['Sofia käis Saaremaal üks kord.', false], ['Viimane reis oli eelmisel suvel.', true],
        ['Sofia on talisuplust proovinud.', false], ['Markus küsib Sofia kogemuse kohta.', true],
      ]),
      B.vocab('079_d_vocab', 'Kogemuse sõnad', ['kogemus — опыт', 'kunagi — когда-нибудь', 'juba — уже', 'veel mitte — ещё нет', 'mitte kunagi — никогда', 'üks kord — один раз', 'mitu korda — несколько раз', 'viimati — в последний раз', 'esimest korda — впервые', 'proovima — пробовать', 'käima — бывать', 'tagasi — назад (aega tagasi)'], '2'),
      B.reading('079_d_read', 'Loe: lõunapausi jutt.', 'Loe vestlust ja vasta küsimustele.', 'Kas sa oled kunagi…?', [
        'Markus: Sofia, kas sa oled kunagi Saaremaal käinud?',
        'Sofia: Jah, olen käinud kaks korda. Viimati käisin seal eelmisel suvel.',
        'Markus: Mis sulle seal meeldis?',
        'Sofia: Meri ja vanad tuuleveskid. Seal sõin ma esimest korda suitsukala.',
        'Markus: Kas sa oled Kihnus ka käinud?',
        'Sofia: Ei, seal ma ei ole veel käinud. Aga ma tahan minna.',
        'Markus: Mina olen Kihnus käinud üks kord. See oli kümme aastat tagasi.',
        'Sofia: Kas sa oled talisuplust proovinud?',
        'Markus: Ei, mitte kunagi! Vesi on liiga külm. Aga mu naine Anna on proovinud mitu korda.',
        'Sofia: Kas sa oled metsas hunti näinud?',
        'Markus: Ei ole. Aga ma olen näinud põtra. See oli väga suur!',
      ], [
        ['Mitu korda on Sofia Saaremaal käinud?', 'kaks korda|2 korda'],
        ['Millal käis Sofia viimati Saaremaal?', 'eelmisel suvel'],
        ['Mida proovis Sofia Saaremaal esimest korda?', 'suitsukala|ta sõi suitsukala'],
        ['Kas Sofia on Kihnus käinud?', 'ei|ei ole|ei, veel mitte'],
        ['Kes Markuse perest on talisuplust proovinud?', 'Anna|tema naine|naine Anna'],
        ['Millist looma on Markus metsas näinud?', 'põtra|põder'],
      ]),
      B.notice('079_d_notice', 'Märka: kogemus või kindel aeg?', ['Kas sa **oled** kunagi Saaremaal **käinud**? — kogemus elus', 'Jah, **olen käinud** kaks korda.', 'Viimati **käisin** seal **eelmisel suvel**. — kindel aeg', 'Seal ma **ei ole** veel **käinud**.', 'Ma **olen näinud** põtra.'], 'full'),
      B.tip('079_d_rule', 'olen + nud', ['Kogemus: **olen käinud, oled näinud, on proovinud**.', 'Eitus: ma **ei ole** käinud (mitte: ma ei olen).', 'Kogemuse sõnad: kunagi, juba, mitu korda, veel mitte.', 'Kindel aeg (eile, eelmisel suvel) → lihtminevik: **käisin**.'], 'full'),
      B.table('079_d_forms', 'Moodusta nud-vorm.', 'Kirjuta tegusõna nud-vormis.', 'tegusõna, ma olen …', [
        'käima | ma olen [käinud]', 'nägema | ma olen [näinud]', 'proovima | ma olen [proovinud]', 'sööma | ma olen [söönud]', 'elama | ma olen [elanud]', 'lugema | ma olen [lugenud]',
      ], 'g_notice'),
      B.categorize('079_d_sort', 'Kogemus või kindel aeg?', 'Pane ajasõnad õigesse rühma.', [
        ['Kogemus: olen käinud', ['kunagi', 'juba', 'mitu korda', 'veel mitte']],
        ['Kindel aeg: käisin', ['eile', 'eelmisel suvel', '2019. aastal', 'kaks päeva tagasi']],
      ], 'full', 'g_notice'),
      B.choice('079_d_choice', 'Kumb vorm?', 'Vali lausesse õige vorm.', [
        ['Kas sa oled kunagi Pariisis …?', 'käinud', 'käisid', 'käima'],
        ['Eelmisel aastal ma … Pariisis.', 'käisin', 'olen käinud', 'käinud'],
        ['Ma ei ole seda filmi veel …', 'näinud', 'nägin', 'näen'],
        ['Eile ma … seda filmi kinos.', 'nägin', 'olen näinud', 'näinud'],
        ['Kas te olete sushit …?', 'proovinud', 'proovisite', 'proovima'],
      ], 'full', 'g_notice'),
      B.wordorder('079_d_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Kas sa oled kunagi Saaremaal käinud?', 'Ma ei ole veel talisuplust proovinud.', 'Markus on Kihnus käinud üks kord.', 'Me oleme seda filmi juba näinud.', 'Viimati käisin ma Tartus eelmisel kuul.',
      ]),
      B.transformation('079_d_trans', 'Küsi kogemuse kohta.', 'Tee lausest küsimus „Kas sa oled kunagi …?”.', [
        ['Ma käisin Riias.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi Riias käinud?'],
        ['Ma nägin hunti.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi hunti näinud?'],
        ['Ma sõin suitsukala.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi suitsukala söönud?'],
        ['Ma proovisin talisuplust.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi talisuplust proovinud?'],
        ['Ma elasin maal.', 'Kas sa oled kunagi …?', 'Kas sa oled kunagi maal elanud?'],
      ]),
      B.errorfix('079_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma ei olen Kihnus käinud.', 'Ma ei ole Kihnus käinud.'], ['Kas sa oled kunagi suitsukala sõid?', 'Kas sa oled kunagi suitsukala söönud?'],
        ['Eile ma olen näinud põtra.', 'Eile nägin ma põtra.|Eile ma nägin põtra.'], ['Ta on proovinud talisuplus.', 'Ta on proovinud talisuplust.'],
        ['Me oleme käinud Saaremaal eelmisel suvel.', 'Me käisime Saaremaal eelmisel suvel.|Eelmisel suvel käisime Saaremaal.'],
      ]),
      B.translation('079_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Ты когда-нибудь был в Тарту?', 'Я ещё не пробовал этот суп.', 'Я видел этот фильм два раза.', 'В прошлом году я был в Риге.', 'Мы никогда не жили в деревне.']),
      B.dictation('079_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kas sa oled kunagi Kihnus käinud?', 'Jah, olen käinud üks kord.', 'Viimati käisin seal eelmisel suvel.', 'Ma ei ole veel talisuplust proovinud.', 'Anna on proovinud mitu korda.', 'Ma olen näinud põtra.']),
      B.speaking('079_d_say', 'Kas sa oled kunagi…?', 'Küsi paarilisel 5 küsimust. Vasta ka ise.', ['Kas sa oled kunagi Saaremaal käinud?', 'Kas sa oled talisuplust proovinud?', 'Kas sa oled põtra näinud?', 'Kas sa oled maal elanud?', 'Kas sa oled lennukiga lennanud?'], [60, 90], ['Jah, olen … kaks korda.', 'Ei, veel mitte.', 'Ei, mitte kunagi.', 'Viimati … eelmisel aastal.']),
      B.writing('079_d_write', 'Minu kogemused.', 'Kirjuta 5–7 lauset: mida oled teinud ja mida veel mitte.', [5, 7], ['olen käinud', 'olen proovinud', 'ei ole veel', 'viimati'], 3),
      B.selfcheck('079_d_self', ['Ma küsin: Kas sa oled kunagi…?', 'Ma vastan: olen käinud / ei ole veel käinud.', 'Ma eristan kogemust ja kindlat aega.', 'Ma moodustan 6 nud-vormi.'], 'Kogemus on kirjas'),
    ],
    practice: [
      B.wordforms('079_p_forms', 'nud-vorm.', 'Kirjuta tegusõna nud-vormis: ma olen …', [
        ['tegema', 'ma olen …', 'teinud'], ['jooma', 'ma olen …', 'joonud'], ['tulema', 'ma olen …', 'tulnud'],
        ['minema', 'ma olen …', 'läinud'], ['ujuma', 'ma olen …', 'ujunud'], ['sõitma', 'ma olen …', 'sõitnud'],
      ]),
      B.gaps('079_p_gaps', 'Kogemus või kindel aeg?', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Kas sa oled kunagi hobusega [sõitnud] (sõitma)?', 'Eelmisel suvel [sõitsin] (sõitma) ma esimest korda hobusega.', 'Ma ei ole veel Lätis [käinud] (käima).',
        '2020. aastal [käisime] (käima) me Riias.', 'Kas te olete seda kooki [proovinud] (proovima)?', 'Eile [proovisin] (proovima) ma uut kohvikut.',
      ]),
      B.cloze('079_p_cloze', 'Jaani kiri.', 'Vali igasse lünka sobiv sõna.', 'Tere, Viktor!', [
        'Aitäh kirja eest! Sa küsisid, kas ma olen kunagi Lõuna-Eestis {*käinud|käisin|käima}. Jah, olen! Eelmisel suvel {*käisin|olen käinud|käinud} Otepääl.',
        'Seal {*proovisin|proovinud|proovima} ma esimest korda kanuud. Aga Setomaal ma ei ole veel {*käinud|käisin|käi}.',
        'Kas sina {*oled|oli|olema} seal käinud? Ma olen {*kuulnud|kuulsin|kuulama}, et seal on väga ilus. Võib-olla läheme koos järgmisel suvel?',
        '',
        'Jaan',
      ]),
      B.truefalse('079_p_tf', 'Mida Jaan kirjutas?', 'Loe kirja uuesti. Õige või vale?', [
        ['Jaan on Lõuna-Eestis käinud.', true], ['Jaan käis Otepääl kaks aastat tagasi.', false], ['Jaan sõitis Otepääl kanuuga.', true],
        ['Jaan on Setomaal käinud mitu korda.', false], ['Jaan tahab Viktoriga reisima minna.', true],
      ]),
      B.errorfix('079_p_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma ei olen Soomes käinud.', 'Ma ei ole Soomes käinud.'], ['Kas sa oled kunagi Pariisis käisid?', 'Kas sa oled kunagi Pariisis käinud?'],
        ['Eelmisel aastal ma olen käinud Riias.', 'Eelmisel aastal käisin ma Riias.|Eelmisel aastal ma käisin Riias.'], ['Ma olen sööma sushit.', 'Ma olen söönud sushit.'],
        ['Ta on minnud Tartusse.', 'Ta on läinud Tartusse.'],
      ]),
      B.transformation('079_p_trans', 'Ütle kogemusena.', 'Kirjuta lause antud sõnadega.', [
        ['Ma sõin eile suitsukala.', 'ei ole veel', 'Ma ei ole veel suitsukala söönud.'],
        ['Ta käis 2018. aastal Londonis.', 'on käinud', 'Ta on Londonis käinud.'],
        ['Me proovisime eile talisuplust.', 'kunagi?', 'Kas te olete kunagi talisuplust proovinud?'],
        ['Anna luges selle raamatu läbi.', 'juba', 'Anna on selle raamatu juba läbi lugenud.'],
        ['Ma nägin seda filmi kolm korda.', 'olen … kolm korda', 'Ma olen seda filmi kolm korda näinud.'],
      ]),
      B.wordorder('079_p_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Kas te olete kunagi Lätis käinud?', 'Ma olen hobusega sõitnud ainult üks kord.', 'Sofia ei ole veel Setomaal käinud.', 'Viimati käisime Riias kaks aastat tagasi.', 'Kas Anna on juba koju jõudnud?',
      ]),
      B.table('079_p_survey', 'Klassi küsitlus.', 'Küsi kaaslastelt. Kirjuta nimi ja millal see oli.', 'Kas sa oled kunagi…?, Nimi, Millal?', [
        '…talisuplust proovinud? |  | ', '…Saaremaal käinud? |  | ', '…hobusega sõitnud? |  | ', '…telkis maganud? |  | ', '…seeni korjanud? |  | ',
      ]),
      B.translation('079_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Ты когда-нибудь ездил на лошади?', 'Я ещё не был в Латвии.', 'В прошлом году мы были в Риге.', 'Она уже прочитала эту книгу.', 'Я никогда не спал в палатке.']),
      B.dictation('079_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Kas sa oled kunagi Lätis käinud?', 'Ma ei ole veel kanuud proovinud.', 'Eelmisel suvel käisin Otepääl.', 'Ta on seda filmi näinud.', 'Me oleme mitu korda Riias käinud.', 'Ma ei ole kunagi telkis maganud.']),
      B.speaking('079_p_say', 'Küsitluse tulemused.', 'Räägi klassile, mida said küsitlusest teada.', ['Kes on talisuplust proovinud?', 'Kes ei ole veel Saaremaal käinud?', 'Kes on telkis maganud ja millal?'], [60, 90], ['Viktor on … proovinud.', 'Sofia ei ole veel…', 'Liis käis … eelmisel aastal.']),
      B.writing('079_p_write', 'Kolm jah ja kaks ei.', 'Kirjuta 3 asja, mida oled teinud, ja 2, mida veel mitte.', [5, 7], ['olen', 'ei ole veel', 'mitu korda', 'viimati'], 3),
      B.selfcheck('079_p_self', ['Ma moodustan nud-vormi.', 'Ma ütlen eituse: ma ei ole käinud.', 'Ma valin olen käinud või käisin.', 'Ma teen klassis küsitluse.'], 'Kogemused kogutud'),
    ],
    transfer: [
      B.text('079_t_situation', 'Uus olukord', 'Sa tahad suvel tööle turismiinfosse. Loe kuulutust. Siis valmistu vestluseks: juht Viktor küsib sinu kogemuste kohta.'),
      B.reading('079_t_read', 'Loe kuulutust.', 'Loe kuulutus ja vasta küsimustele.', 'Suvetöö turismiinfos', [
        'Tallinna vanalinna turismiinfo otsib suveks kahte töötajat. Töö kestab juunist augustini. Tööpäev on kella kümnest kella kuueni. Sinu ülesanne on aidata turiste ja vastata nende küsimustele. Sa räägid turistidega eesti, vene ja inglise keeles. Sa müüd ka kaarte ja pileteid.',
        'Kas sa oled varem klientidega töötanud? Kas sa oled vanalinnas palju käinud? Kas sa tunned Tallinna muuseume ja kohvikuid? Siis oled sa meile õige inimene! Turismi kogemus ei ole kohustuslik. Saada oma CV ja lühike kiri 15. maiks. Kirjuta, mida sa oled varem teinud ja miks see töö sulle sobib.',
      ], [
        ['Kui kaua suvetöö kestab?', 'juunist augustini|kolm kuud'], ['Mis keeltes peab töötaja rääkima?', 'eesti, vene ja inglise keeles|eesti, vene, inglise'],
        ['Mida teeb töötaja peale turistide aitamise?', 'müüb kaarte ja pileteid|müüb pileteid'], ['Kas turismi kogemus on vajalik?', 'ei|ei ole kohustuslik'],
        ['Mida peab kirjas kirjutama?', 'mida oled varem teinud ja miks töö sobib|mida oled teinud|miks töö sobib'],
      ]),
      B.choice('079_t_answer', 'Mida vastata?', 'Viktor küsib. Vali sobiv vastus.', [
        ['Kas te olete varem klientidega töötanud?', 'Jah, olen töötanud kaks aastat poes.', 'Jah, ma töötan homme poes.', 'Ei, ma ei tööta poes homme.'],
        ['Kas te olete vanalinnas palju käinud?', 'Jah, olen seal mitu korda käinud.', 'Jah, ma käin seal homme.', 'Ei, vanalinn on kinni.'],
        ['Millal te viimati muuseumis käisite?', 'Eelmisel kuul käisin Kumus.', 'Olen käinud muuseumis.', 'Ma lähen muuseumi.'],
        ['Kas te olete pileteid müünud?', 'Ei, veel mitte, aga ma õpin kiiresti.', 'Ei, pilet on kallis.', 'Jah, ma ostan pileti.'],
        ['Kas te olete turistidega vene keeles rääkinud?', 'Jah, mitu korda.', 'Jah, homme kell kümme.', 'Ei, ma räägin praegu.'],
      ], 'full', 'g_use'),
      B.gaps('079_t_gaps', 'Minu kogemus.', 'Kirjuta sulgudes olev tegusõna õiges vormis.', [
        'Ma olen kolm aastat poes [töötanud] (töötama).', 'Eelmisel suvel [töötasin] (töötama) ma kohvikus.', 'Ma olen palju turistidega [rääkinud] (rääkima).',
        'Vanalinnas olen ma [käinud] (käima) mitu korda.', 'Ma ei ole veel pileteid [müünud] (müüma).', 'Mullu [aitasin] (aitama) ma laulupeol turiste.',
      ]),
      B.transformation('079_t_trans', 'Ütle täpsemalt.', 'Lisa kindel aeg. Kirjuta lause lihtminevikus.', [
        ['Ma olen kohvikus töötanud.', 'eelmisel suvel', 'Eelmisel suvel töötasin ma kohvikus.|Eelmisel suvel töötasin kohvikus.'],
        ['Ma olen Kumus käinud.', 'eelmisel kuul', 'Eelmisel kuul käisin ma Kumus.|Eelmisel kuul käisin Kumus.'],
        ['Ma olen turiste aidanud.', 'mullu', 'Mullu aitasin ma turiste.|Mullu aitasin turiste.'],
        ['Ma olen Soomes elanud.', '2015. aastal', '2015. aastal elasin ma Soomes.|2015. aastal elasin Soomes.'],
      ]),
      B.wordorder('079_t_order', 'Pane lause kokku.', 'Kirjuta laused õiges järjekorras.', [
        'Ma olen klientidega töötanud kaks aastat.', 'Eelmisel suvel töötasin ma kohvikus.', 'Ma ei ole veel pileteid müünud.', 'Kas te olete turismiinfos töötanud?', 'Vanalinnas olen ma käinud mitu korda.',
      ]),
      B.translation('079_t_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Я два года работал в магазине.', 'Прошлым летом я работал в кафе.', 'Я ещё не продавал билеты.', 'Я часто бывал в Старом городе.']),
      B.planning('079_t_plan', 'Enne vestlust.', 'Kirjuta märksõnad oma kogemuste kohta.', ['Kus oled varem töötanud?', 'Milliseid keeli oled kasutanud?', 'Mida oled Tallinnas näinud?', 'Mida sa ei ole veel teinud?']),
      B.rolecards('079_t_roles', 'Töövestlus.', 'A on Viktor, B on kandidaat. Rääkige 3 minutit.',
        'Oled Viktor. Küsi 5 küsimust kandidaadi kogemuste kohta.', 'Oled kandidaat. Vasta ja lisa igale vastusele üks detail.',
        ['Kas te olete varem…?', 'Millal te…?', 'Kas te olete kunagi…?'], ['Jah, olen … töötanud.', 'Eelmisel suvel ma…', 'Veel mitte, aga…']),
      B.speaking('079_t_say', 'Räägi endast.', 'Räägi 1 minut oma kogemustest.', ['Kus oled töötanud?', 'Mida oled proovinud?', 'Mida sa veel ei ole teinud?'], [60, 90]),
      B.letter('079_t_letter', 'Kiri Viktorile.', 'Kirjuta: kes oled, mida oled teinud, miks töö sobib.', 'Tere, Viktor!', 'Lugupidamisega', [30, 50]),
      B.writing('079_t_write', 'Kogemus, mida ma ei unusta.', 'Kirjuta 5–7 lauset ühest kogemusest. Millal see oli?', [5, 7], ['olen', 'esimest korda', 'käisin'], 2),
      B.selfcheck('079_t_self', ['Ma saan aru töökuulutusest.', 'Ma räägin oma kogemustest töövestlusel.', 'Ma ütlen kindla aja lihtminevikus.', 'Ma kirjutan lühikese kirja.'], 'Kandidaat on valmis'),
    ],
  },
};
