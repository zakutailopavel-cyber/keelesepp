// A2 course (A1 → A2 roadmap), module 19 „A2 kirjutamine ja rääkimine” (a2-091…095), stage A2.
// All three phases: Avasta → Harjuta → Kasuta, each a whole lesson (40–55 min).
// The module trains every Harno A2 writing and speaking format in depth: a functional message, invitation, request
// and cancellation (091, writing 2a), information transfer from a business card (091, 095, writing 1), a short
// description with a 4-point plan, draft and final version (092, writing 2b), a 1.5–2-minute monologue with
// follow-up questions and the get-to-know-you start (093, speaking intro + 1), a service dialogue with an unexpected
// change and idea cards (094, speaking 2). 095 „Kontroll 19” checks the module in exam form: Avasta = part A
// (one language task per lesson goal), Harjuta = reading 1–5 and listening, Kasuta = writing 1–2 and speaking 1–2.
// The teacher reads every listening transcript twice (audio is null). Module 18 (notices) and the past tense come back.
import { B } from '../blocks.js';

export const MODULE = { id: 'a2-module-19', course: 'a2', title: 'A2 kirjutamine ja rääkimine', level: 'A2', design: 'v2', template: 'v3' };

const P = (...paragraphs) => paragraphs.join('\n\n');

export const LESSONS = {
  'a2-091': {
    title: 'Teade, sõnum ja kutse',
    canDo: 'Ma kirjutan olukorra järgi 40–70-sõnalise sõnumi, kutse või teate, kus on kirjas, kes, mida, millal, kus ja miks.',
    template: 'v3',
    discover: [
      B.text('091_d_intro', 'Sõnum telefonis', 'Neljapäeva õhtul saab Anna sõnumi. Markus kirjutab: „Tere, Anna! Mul on laupäeval sünnipäev. Pidu on minu juures kell kuus. Tule kindlasti! Markus” Anna tahab minna, aga tal on küsimusi.'),
      B.truefalse('091_d_warm', 'Loe Markuse sõnumit.', 'Õige või vale?', [
        ['Markus kutsub Anna sünnipäevale.', true], ['Pidu on pühapäeval.', false], ['Pidu on Markuse kodus.', true],
        ['Markus kirjutab, mis kell pidu algab.', true], ['Markus kirjutab, mida kaasa võtta.', false], ['Anna tahab peole minna.', true], ['Annal ei ole küsimusi.', false], ['Markus saatis sõnumi neljapäeva õhtul.', true]]),
      B.reading('091_d_read', 'Loe: kolm sõnumit Annale.', 'Loe sõnumeid. Vasta lühidalt.', 'Anna telefon', P(
        'A. Tere, Anna! Kahjuks ma ei saa kolmapäeval joogasse tulla. Mu poeg on haige ja ma pean temaga kodus olema. Kas sa saad treenerile öelda? Järgmisel nädalal tulen kindlasti. Liis',
        'B. Hei, Anna! Ma kolisin uude korterisse ja tahan seda sõpradele näidata. Pidu on laupäeval kell seitse. Aadress on Tamme tee 21, korter 5. Uks on maja taga. Palun kirjuta reedeks, kas tuled. Viktor',
        'C. Tere, naaber! Ma sõidan homme nädalaks Soome. Kas sa saaksid vahepeal minu lilli kasta? Piisab, kui kastad neid kaks korda. Võti on minu naabri Antsu käes. Ta elab kolmandal korrusel, korter 9. Aitäh juba ette! Sofia',
      ), [
        ['Miks Liis kolmapäeval joogasse ei tule?', 'poeg on haige|tema poeg on haige|ta peab kodus olema'],
        ['Mida peab Anna Liisi jaoks tegema?', 'treenerile ütlema|ütlema treenerile|treenerile öelda'],
        ['Miks Viktor sõbrad külla kutsub?', 'ta kolis uude korterisse|tal on uus korter'],
        ['Kuidas Viktori korterisse sisse saab?', 'maja tagant|uks on maja taga'],
        ['Kust saab Anna Sofia võtme?', 'Antsult|naabri Antsu käest|naabrilt|korterist 9'],
        ['Milline sõnum on kutse ja milline palve?', 'B on kutse, C on palve|B kutse, C palve|kutse B, palve C'], ['Mis ajaks peab Anna Viktorile vastama?', 'reedeks'], ['Kui kauaks Sofia Soome sõidab?', 'nädalaks|üheks nädalaks']]),
      B.notice('091_d_notice', 'Mis on heas sõnumis?', [
        '**Tervitus:** Tere, Anna! / Hei! / Tere, naaber!',
        '**Mis juhtus? Miks?** Kahjuks ma ei saa tulla, **sest** mu poeg on haige.',
        '**Millal? Kus?** **laupäeval kell seitse**, **minu juures**, **kohviku ees**',
        '**Palve:** Kas sa saad…? / Kas sa saaksid…? / Palun kirjuta…',
        '**Lõpp:** Aitäh! / Kohtumiseni! / Ootan vastust! + nimi',
      ], 'full'),
      B.gaps('091_d_gaps', 'Täienda Liisi sõnumit.', 'Kirjuta lünka sobiv sõna.', [
        'Tere, Olga! [Kahjuks] ma ei saa homme tööle tulla.', 'Ma olen haige, [sest] mul on palavik.', '[Kas] sa saad minu eest koosolekul olla?',
        'Ülemusele kirjutasin juba, [aga] ta ei vastanud veel.', '[Palun] helista mulle pärast lõunat.', 'Kui sa ei saa, [siis] kirjuta mulle.', 'Reedel olen jälle tööl. [Kohtumiseni]!', '[Aitäh] ja head päeva! Liis',
      ], ['kahjuks', 'sest', 'kas', 'aga', 'palun', 'aitäh', 'kohtumiseni', 'siis']),
      B.transformation('091_d_polite', 'Ütle viisakamalt.', 'Kirjuta käsk viisaka palvena.', [
        ['Helista mulle!', 'Kas sa saaksid…?', 'Kas sa saaksid mulle helistada?|Kas sa saad mulle helistada?'],
        ['Kasta mu lilli!', 'Kas sa saaksid…?', 'Kas sa saaksid mu lilli kasta?|Kas sa saaksid minu lilli kasta?'],
        ['Ütle treenerile!', 'Kas sa saaksid…?', 'Kas sa saaksid treenerile öelda?'],
        ['Vasta reedeks!', 'Kas sa saaksid…?', 'Kas sa saaksid reedeks vastata?'],
        ['Tule kell kuus!', 'Kas sa saaksid…?', 'Kas sa saaksid kell kuus tulla?'], ['Too mulle leiba!', 'Kas sa saaksid…?', 'Kas sa saaksid mulle leiba tuua?'], ['Võta mu pakk vastu!', 'Kas sa saaksid…?', 'Kas sa saaksid mu paki vastu võtta?|Kas sa saaksid minu paki vastu võtta?'], ['Oota mind kohviku ees!', 'Kas sa saaksid…?', 'Kas sa saaksid mind kohviku ees oodata?']]),
      B.letter('091_d_letter', 'Vasta Markusele.', 'Kirjuta: kas tuled, mida tood, üks küsimus.', 'Tere, Markus!', 'Kohtumiseni!', [40, 60]),
      B.letter('091_d_letter2', 'Vasta Sofiale.', 'Kirjuta: kas saad aidata, millal kastad, kust võtme võtad.', 'Tere, Sofia!', 'Head reisi!', [40, 60]),
      B.speaking('091_d_say', 'Räägi paarilisele.', 'Kellele sa viimati sõnumi kirjutasid? Räägi.', [
        'Kellele sa kirjutasid?', 'Miks sa kirjutasid?', 'Kas ta vastas?', 'Kas sa pigem kirjutad või helistad?', 'Mis on sinu arvates hea sõnum?',
      ], [60, 90], ['Ma kirjutasin…, sest…', 'Ta vastas, et…']),
    ],
    practice: [
      B.wordforms('091_p_time', 'Millal? Aeg sõnumis.', 'Kirjuta sõna küsimuse järgi õiges vormis.', [
        ['laupäev', 'millal?', 'laupäeval'], ['reede', 'mis ajaks?', 'reedeks'], ['hommik', 'millal?', 'hommikul'], ['järgmine nädal', 'millal?', 'järgmisel nädalal'],
        ['kell kuus', 'mis kellani?', 'kella kuueni'], ['õhtu', 'millal?', 'õhtul'], ['kolmapäev', 'mis päevani?', 'kolmapäevani'], ['pühapäev', 'mis ajaks?', 'pühapäevaks']]),
      B.cloze('091_p_cloze', 'Sofia palve.', 'Vali igasse lünka sobiv sõna.', 'Tere, Anna!', [
        'Ma {*sõidan|sõitsin|sõitma} homme nädalaks Soome.',
        '',
        'Kas sa {*saaksid|saad|saama} vahepeal minu lilli kasta? Piisab, kui kastad neid kaks {*korda|kord|korrale}.',
        '',
        'Võti on naabri Antsu {*käes|kätte|käest}. Ta elab kolmandal {*korrusel|korrus|korrusele}. Kui sul ei ole aega, {*siis|sest|kas} kirjuta mulle.',
        '',
        'Aitäh juba {*ette|ees|eest}! {*Kohtumiseni|Kohtuma|Kohtumine}! Sofia',
      ], 'g_vocab'),
      B.formtext('091_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Markuse kutse', [
        'Tere, Liis! Mul on [laupäeval] (laupäev) sünnipäev. Kutsun [sind] (sina) oma peole.',
        '',
        'Pidu on [minu] (mina) juures ja algab kella kuuest. Palun [vasta] (vastama) mulle [reedeks] (reede).',
        '',
        'Kui sa [tahad] (tahtma), võta kaasa oma [venna] (vend).',
        '',
        'Ootan sinu [vastust] (vastus)! Markus',
      ], 'g_notice'),
      B.listening('091_p_listen', 'Kuula häälsõnumit.', 'Õpetaja loeb sõnumi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, Anna! Siin on Jaan. Helistan koori pärast.', 'Homne proov jääb ära, sest meie juhataja on haige.',
        'Uus proov on reedel kell kuus, mitte kell seitse.', 'Proov ei ole koolis, vaid kultuurimajas, teisel korrusel.',
        'Palun võta kaasa uued noodid. Need on sinise kausta sees.', 'Ja veel üks palve. Kas sa saaksid Liisile ka teada anda? Tal ei ole täna telefoni.',
        'Kui sul on küsimusi, kirjuta mulle õhtul. Aitäh ja kohtumiseni!',
      ], [
        'Homne proov jääb ära, sest juhataja on [haige].', 'Uus proov on [reedel].', 'Proov algab kell [kuus|6|18].', 'Proov on [kultuurimajas].',
        'Anna peab kaasa võtma uued [noodid].', 'Anna peab teada andma ka [Liisile|Liisi].', 'Jaanile võib kirjutada [õhtul].', 'Noodid on [sinise] kausta sees.']),
      B.errorfix('091_p_fix', 'Paranda sõnumi viga.', 'Kirjuta lause õigesti.', [
        ['Pidu on laupäev kell kuus.', 'Pidu on laupäeval kell kuus.'], ['Ma ei saan homme tulla.', 'Ma ei saa homme tulla.'],
        ['Tule minu juures!', 'Tule minu juurde!'], ['Kas sa saad mulle helistama?', 'Kas sa saad mulle helistada?'],
        ['Kahjuks ma pean töötada.', 'Kahjuks ma pean töötama.'], ['Ootan sinu vastus.', 'Ootan sinu vastust.'], ['Kas sa saaksid mind aidata homme õhtu?', 'Kas sa saaksid mind homme õhtul aidata?|Kas sa saaksid mind aidata homme õhtul?'], ['Kahjuks proov jääb ära reede.', 'Kahjuks proov jääb reedel ära.|Kahjuks jääb proov reedel ära.']]),
      B.transformation('091_p_cancel', 'Ei saa tulla.', 'Kirjuta lause antud sõnaga.', [
        ['Pidu on laupäeval.', 'Kahjuks … ära.', 'Kahjuks jääb pidu laupäeval ära.|Kahjuks jääb laupäevane pidu ära.'],
        ['Ma tulen homme.', 'Kahjuks ma ei …', 'Kahjuks ma ei tule homme.'], ['Ma saan aidata.', 'Kahjuks ma ei …', 'Kahjuks ma ei saa aidata.'],
        ['Koosolek on reedel.', 'jääb ära', 'Koosolek jääb reedel ära.|Reedene koosolek jääb ära.'],
        ['Ma ei tule. Mul on palavik.', 'sest', 'Ma ei tule, sest mul on palavik.'], ['Kontsert on pühapäeval.', 'jääb ära', 'Kontsert jääb pühapäeval ära.|Pühapäevane kontsert jääb ära.'], ['Ma ei tule. Mu laps on haige.', 'sest', 'Ma ei tule, sest mu laps on haige.'], ['Ma tulen trenni.', 'Kahjuks ma ei …', 'Kahjuks ma ei tule trenni.']]),
      B.translation('091_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Завтрашнее собрание отменяется.', 'Я болен, поэтому не приду.', 'Можешь сказать учителю?', 'Праздник начинается в семь.', 'Жду твоего ответа!', 'К сожалению, я не могу прийти в субботу.', 'Приходи ко мне в пятницу вечером!', 'Не мог бы ты полить мои цветы?']),
      B.wordorder('091_p_order', 'Pane kutse kokku.', 'Kirjuta laused õiges järjekorras.', ['Kutsun sind oma sünnipäevale.', 'Pidu algab kell kuus.', 'Kohtume minu juures Tamme tänaval.', 'Võta kaasa hea tuju!', 'Palun vasta mulle neljapäevaks.', 'Kas sa tuled koos õega?', 'Kahjuks ma ei saa homme tulla.', 'Pidu on laupäeval minu juures.']),
      B.speaking('091_p_voice', 'Jäta häälsõnum.', 'Jäta sõbrale häälsõnum: kohtumine jääb ära.', ['Kes räägib?', 'Mis jääb ära ja miks?', 'Mis on uus aeg?', 'Mida sõber peab tegema?'], [45, 60], ['Tere, siin…', 'Kahjuks…, sest…', 'Kas…?']),
    ],
    transfer: [
      B.text('091_t_situation', 'Uus olukord: kursuse lõpupidu', 'Sinu eesti keele kursus lõpeb. Sina korraldad lõpupeo kohvikus. Pead kirjutama sõbrale, kutse ja vastama kursusekaaslastele. Aga siis tuleb uudis: kohvik on reedel kinni!'),
      B.choice('091_t_reply', 'Kursusekaaslased vastavad.', 'Vali sobiv reaktsioon.', [
        ['„Kahjuks ma ei saa tulla, olen reisil.”', 'Kahju! Head reisi!', 'Tore, kohtumiseni!', 'Palju õnne!'],
        ['„Ma tulen koos abikaasaga. Kas see sobib?”', 'Muidugi sobib!', 'Kahjuks ma ei saa.', 'Head paranemist!'],
        ['„Mis kell pidu algab?”', 'Kell kuus õhtul.', 'Laupäeval kohvikus.', 'Rüütli tänaval.'],
        ['„Kas ma pean midagi kaasa võtma?”', 'Ei pea, toit on kohvikus.', 'Jah, ma võtan kaasa.', 'Ei, ma ei tule.'],
        ['„Ma jään pool tundi hiljaks.”', 'Pole hullu, ootame sind!', 'Aitäh kutse eest!', 'Kahjuks pidu jääb ära.'], ['„Kas kohvikus on ka taimetoitu?”', 'Jah, menüüs on taimetoite.', 'Ei, ma ei söö liha.', 'Kohvik on Rüütli tänaval.'], ['„Kas ma võin tulla hiljem, kell seitse?”', 'Muidugi, tule siis, kui saad!', 'Kahjuks pidu jääb ära.', 'Head reisi!'], ['„Aitäh kutse eest!”', 'Pole tänu väärt, ootame sind!', 'Head reisi!', 'Kahjuks ma ei saa.']], 'full', 'g_vocab'),
      B.errorfix('091_t_check', 'Kontrolli enne saatmist.', 'Kursusekaaslane kirjutas sõnumi. Paranda vead.', [
        ['Pidu on reede kell kuus.', 'Pidu on reedel kell kuus.'], ['Tule kohvikus „Mesi”!', 'Tule kohvikusse „Mesi”!'],
        ['Kohtume kohviku ette.', 'Kohtume kohviku ees.'], ['Palun vasta kolmapäev.', 'Palun vasta kolmapäevaks.'], ['Ma ei saan maksta sularahas.', 'Ma ei saa maksta sularahas.|Ma ei saa sularahas maksta.'], ['Ootan sind kell kuus kohvikus ees.', 'Ootan sind kell kuus kohviku ees.'], ['Kas sa saad tulla laupäev?', 'Kas sa saad tulla laupäeval?|Kas sa saad laupäeval tulla?'], ['Kahjuks kohvik on reedel kinnine.', 'Kahjuks on kohvik reedel kinni.|Kahjuks kohvik on reedel kinni.']]),
      B.letter('091_t_invite', 'Kirjutamine 2. Kutse lõpupeole.', 'Kirjuta kursusekaaslastele kutse. Kirjuta kõik plaani punktid.', 'Head kursusekaaslased!', 'Ootan vastust!', [40, 60]),
      B.writing('091_t_change', 'Muudatuse teade.', 'Kohvik on reedel kinni. Kirjuta 5–7 lauset: mis muutus, uus aeg ja koht.', [5, 7], ['kahjuks', 'sest', 'laupäeval', 'palun'], 2),
      B.rolecards('091_t_call', 'Telefonis kohvikuga.', 'Lugege oma rolli. Rääkige 2 minutit.',
        'Sa tahad broneerida lauda 10 inimesele reedeks kell 18. Küsi hinda ja menüüd.', 'Oled kohviku töötaja. Reedel on kohvik kinni. Paku laupäeva. Küsi nime ja telefoni.',
        ['Tere! Ma tahaksin broneerida…', 'Kas laupäev sobib?', 'Kui palju maksab…?'], ['Kahjuks reedel oleme kinni.', 'Kas laupäev sobib?', 'Mis on teie nimi?']),
      B.speaking('091_t_voice', 'Häälsõnum õpetajale.', 'Jäta õpetajale häälsõnum: pidu on uuel ajal.', ['Kes räägib?', 'Mis muutus ja miks?', 'Millal ja kus on pidu nüüd?', 'Mida õpetaja peab tegema?'], [60, 90]),
      B.rubric('091_t_rubric', 'Kontrolli oma kutset.', 'Märgi, mis on olemas.', ['Tervitus ja lõpp.', 'Kes kutsub ja mis üritus see on.', 'Millal ja kus (laupäeval, kohvikus).', 'Mida kaasa võtta ja millal vastata.', '40–60 sõna.']),
      B.selfcheck('091_t_self', ['Ma oskan kasutada sõnumi väljendeid: kahjuks, kas sa saaksid, ootan vastust.', 'Ma oskan leida visiitkaardilt ja sõnumist kogu vajaliku info.', 'Ma oskan kirjutada aega ja kohta õiges vormis: reedel, kohviku ees.', 'Ma oskan kirjutada kutse ja muudatuse teate nii, et kõik punktid on olemas.'], 'Kutse on saadetud'),
    ],
  },

  'a2-092': {
    title: 'Lihtne kirjeldus',
    canDo: 'Ma kirjutan plaani järgi 70–100-sõnalise kirjelduse inimesest, kohast või sündmusest ja seon laused vähemalt kuue seos- või ajasõnaga.',
    template: 'v3',
    discover: [
      B.text('092_d_intro', 'Kaks lugu, sama info', 'Kursuse ajaleht otsib lugusid. Markus kirjutas: „Laupäeval ma käisin turul. Ma ostsin kala. Ma käisin vanaema juures. Ma vaatasin filmi.” Sofia kirjutas: „Laupäeval käisin kõigepealt turul, sest tahtsin kala osta. Siis sõitsin vanaema juurde. Pärast seda vaatasime koos filmi.”'),
      B.reading('092_d_read', 'Loe: Sofia lugu.', 'Loe tekst. Vasta küsimustele.', 'Minu lemmikkoht Tallinnas', P(
        'Minu lemmikkoht Tallinnas on Kadrioru park. See asub kesklinnast umbes kahe kilomeetri kaugusel. Ma elan pargi lähedal, seepärast käin seal peaaegu iga päev.',
        'Pargis on suured vanad puud, väike järv ja ilus loss. Suvel on seal palju lilli ja järvel ujuvad pardid. Tavaliselt jalutan ma kõigepealt ümber järve. Siis istun pingile ja loen raamatut.',
        'Eelmisel pühapäeval käisin pargis koos väikese venna Mardiga. Kõigepealt toitsime parte. Pärast seda läksime laste mänguväljakule. Lõpuks jõime kohvikus kakaod, sest ilm oli külm.',
        'Mulle meeldib see park, sest seal on vaikne ja roheline. Linn on lähedal, aga pargis seda ei tunne. Kui sa tuled Tallinnasse, mine kindlasti Kadriorgu!',
      ), [
        ['Kus Kadrioru park asub?', 'kesklinnast kahe kilomeetri kaugusel|kesklinna lähedal|Tallinnas'],
        ['Miks käib Sofia pargis peaaegu iga päev?', 'ta elab pargi lähedal|elab lähedal'],
        ['Mida teeb Sofia pargis tavaliselt pärast jalutamist?', 'istub pingile ja loeb|loeb raamatut'],
        ['Mida tegid Sofia ja Mart kõige esimesena?', 'toitsid parte'],
        ['Miks jõid nad kohvikus kakaod?', 'ilm oli külm|sest ilm oli külm'],
        ['Mis on viimases lõigus: lugu, fakt või arvamus?', 'arvamus|Sofia arvamus ja soovitus|soovitus'], ['Mis on pargis peale puude?', 'väike järv ja ilus loss|järv ja loss'], ['Kellega käis Sofia eelmisel pühapäeval pargis?', 'vennaga|väikese venna Mardiga|Mardiga']]),
      B.notice('092_d_notice', 'Kuidas lauseid siduda?', [
        '**Järjekord:** kõigepealt → siis → pärast seda → lõpuks',
        '**Tegusõna on teisel kohal:** **Siis istun** ma pingile. **Pärast seda läksime** mänguväljakule.',
        '**Põhjus:** …, **sest** ilm oli külm. / Ma elan lähedal, **seepärast** käin seal tihti.',
        '**Vastand:** Linn on lähedal, **aga** pargis seda ei tunne.',
        '**Plaan:** 1) mis ja kus? 2) milline? 3) üks lugu 4) miks meeldib?',
      ], 'full'),
      B.gaps('092_d_find', 'Leia tekstist seossõnad.', 'Kirjuta lünka sõna Sofia tekstist.', [
        'Ma elan pargi lähedal, [seepärast] käin seal peaaegu iga päev.', 'Tavaliselt jalutan ma [kõigepealt] ümber järve.', '[Siis] istun pingile ja loen raamatut.',
        '[Pärast seda] läksime laste mänguväljakule.', 'Lõpuks jõime kohvikus kakaod, [sest] ilm oli külm.', 'Linn on lähedal, [aga] pargis seda ei tunne.', '[Lõpuks] jõime kohvikus kakaod.', 'Pargis on väike järv [ja] ilus loss.']),
      B.choice('092_d_choice', 'Vali sobiv seossõna.', 'Vali lausesse sobiv sõna.', [
        ['Ilm oli soe, … me läksime randa.', 'seepärast', 'aga', 'sest'], ['Me jäime koju, … ilm oli vihmane.', 'sest', 'seepärast', 'siis'],
        ['Park on väike, … väga ilus.', 'aga', 'sest', 'lõpuks'], ['Kõigepealt sõime, … läksime jalutama.', 'siis', 'sest', 'aga'],
        ['Me jalutasime kolm tundi. … jõudsime koju.', 'Lõpuks', 'Kõigepealt', 'Sest'], ['… joon ma hommikul kohvi.', 'Tavaliselt', 'Lõpuks', 'Seepärast'], ['Ma olin väsinud, … läksin vara magama.', 'seepärast', 'sest', 'aga'], ['Mulle meeldib see kohvik, … seal on head koogid.', 'sest', 'seepärast', 'lõpuks']], 'full', 'g_vocab'),
      B.wordorder('092_d_order', 'Tegusõna teisel kohal.', 'Pane sõnad õigesse järjekorda.', ['Siis sõitsime bussiga kesklinna.', 'Pärast seda jõime kohvikus teed.', 'Kõigepealt käisin ma turul.', 'Lõpuks jõudsime õhtul koju.', 'Tavaliselt jalutan ma pargis.', 'Minu õde on pikk ja sõbralik.', 'Tal on lühikesed tumedad juuksed.', 'Tavaliselt käime me koos ujumas.']),
      B.transformation('092_d_join', 'Ühenda kaks lauset.', 'Kirjuta üks lause antud sõnaga.', [['Ilm oli külm. Me jõime kakaod.', 'seepärast', 'Ilm oli külm, seepärast jõime me kakaod.|Ilm oli külm, seepärast jõime kakaod.'], ['Me jõime kakaod. Ilm oli külm.', 'sest', 'Me jõime kakaod, sest ilm oli külm.'], ['Park on lähedal. Ma käin seal harva.', 'aga', 'Park on lähedal, aga ma käin seal harva.'], ['Me toitsime parte. Me läksime mänguväljakule.', 'pärast seda', 'Me toitsime parte. Pärast seda läksime mänguväljakule.|Me toitsime parte, pärast seda läksime mänguväljakule.'], ['Ma elan lähedal. Ma jalutan palju.', 'seepärast', 'Ma elan lähedal, seepärast jalutan ma palju.|Ma elan lähedal, seepärast jalutan palju.'], ['Me läksime siis kinno.', 'Siis …', 'Siis läksime me kinno.|Siis läksime kinno.'], ['Ma joon tavaliselt hommikul kohvi.', 'Tavaliselt …', 'Tavaliselt joon ma hommikul kohvi.|Tavaliselt joon hommikul kohvi.'], ['Me sõime pärast seda jäätist.', 'Pärast seda …', 'Pärast seda sõime me jäätist.|Pärast seda sõime jäätist.']]),
      B.speaking('092_d_say', 'Räägi paarilisele.', 'Räägi oma lemmikkohast. Paariline loeb seossõnu.', ['Mis koht see on?', 'Milline see on?', 'Mida sa seal teed?', 'Miks see meeldib?', 'Kellega sa sinna tavaliselt lähed?'], [60, 90], ['Minu lemmikkoht on…', 'Tavaliselt…', 'Mulle meeldib, sest…']),
      B.writing('092_d_write', 'Minu lemmikkoht.', 'Kirjuta plaani järgi 8–10 lauset. Kasuta seossõnu.', [8, 10], ['kõigepealt', 'siis', 'sest', 'aga', 'tavaliselt'], 3),
    ],
    practice: [
      B.gaps('092_p_gaps', 'Vali sobiv seossõna.', 'Kirjuta lünka sõna sõnapangast.', [
        'Ma ei läinud randa, [sest] ilm oli vihmane.', 'Ilm oli külm, [aga|kuid] me ujusime ikka.', 'Kõigepealt sõime hommikust, [siis] läksime metsa.',
        'Mul oli palju tööd, [seepärast] ma ei tulnud.', 'Me mängisime palli [ja] grillisime.', '[Lõpuks] jõudsime kell kümme koju.', 'Park on väike, [aga] väga ilus.', 'Ma olin haige, [seepärast] jäin koju.',
      ], ['sest', 'aga', 'siis', 'seepärast', 'ja', 'lõpuks', 'et', 'kui']),
      B.cloze('092_p_cloze', 'Minu nädalavahetus.', 'Vali igasse lünka sobiv sõna.', 'Rahulik laupäev', [
        'Laupäeval ärkasin hilja, {*sest|seepärast|aga} olin väga väsinud. {*Kõigepealt|Lõpuks|Seepärast} jõin kohvi ja sõin pannkooke.',
        '',
        '{*Siis|Sest|Aga} läksin sõbraga jalutama. Ilm oli külm, {*aga|sest|siis} päike paistis.',
        '',
        'Pärast seda {*käisime|käime|käima} kinos. Film oli pikk, {*seepärast|sest|kõigepealt} jõudsime koju alles kell kümme.',
        '',
        '{*Lõpuks|Kõigepealt|Tavaliselt} vaatasin veel natuke telekat. Mulle meeldis see päev, {*sest|seepärast|aga} see oli rahulik.',
      ], 'g_vocab'),
      B.formtext('092_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev tegusõna lihtminevikus.', 'Laupäev maal', [
        'Eelmisel laupäeval [sõitsime] (sõitma) me maale vanaema juurde.',
        '',
        'Kõigepealt [sõime] (sööma) hommikust ja [jõime] (jooma) teed. Siis [läksime] (minema) metsa seenele.',
        '',
        'Ilm [oli] (olema) soe, seepärast [ujusime] (ujuma) ka järves. Pärast seda [nägime] (nägema) metsas põtra!',
        '',
        'Lõpuks [tulime] (tulema) õhtul koju. See oli tore päev.',
      ], 'g_notice'),
      B.choice('092_p_plan', 'Mis sobib plaani?', 'Vali sobiv lause.', [
        ['Mis on hea esimene lause?', 'Minu lemmikkoht on Pärnu rand.', 'Lõpuks läksime koju.', 'Seepärast see meeldib.'],
        ['Mis on hea viimane lause?', 'Tule kindlasti Pärnu randa!', 'Rand asub kesklinna lähedal.', 'Kõigepealt ujusime.'],
        ['Mis sobib pärast lauset „Kõigepealt ujusime meres.”?', 'Siis mängisime võrkpalli.', 'Kõigepealt sõime jäätist.', 'Minu lemmikkoht on rand.'],
        ['Kus on põhjus?', 'Rand meeldib mulle, sest liiv on puhas.', 'Rand asub kesklinna lähedal.', 'Rannas on palju inimesi.'],
        ['Kus on vastand?', 'Vesi oli külm, aga me ujusime.', 'Vesi oli külm ja me ujusime.', 'Vesi oli külm, sest me ujusime.'], ['Mis sobib pärast lauset „Siis mängisime võrkpalli.”?', 'Pärast seda sõime jäätist.', 'Kõigepealt läksime randa.', 'Minu lemmikkoht on rand.'], ['Kus on järjekord?', 'Kõigepealt ujusime, siis sõime.', 'Ujusime, sest oli palav.', 'Vesi oli külm, aga ilus.'], ['Mis on hea pealkiri?', 'Üks päev Pärnu rannas', 'Lõpuks läksime koju', 'Sest liiv on puhas']], 'full', 'g_read'),
      B.errorfix('092_p_fix', 'Paranda kirjelduse viga.', 'Kirjuta lause õigesti.', [['Eile ma käin poes.', 'Eile käisin ma poes.|Eile ma käisin poes.|Eile käisin poes.'], ['Ilm oli külm, sest me jäime koju.', 'Me jäime koju, sest ilm oli külm.|Ilm oli külm, seepärast jäime koju.'], ['Pargis on suur puud.', 'Pargis on suured puud.'], ['Mulle meeldib seal, aga seal on vaikne.', 'Mulle meeldib seal, sest seal on vaikne.'], ['Pühapäev me olime kodus.', 'Pühapäeval olime me kodus.|Pühapäeval me olime kodus.|Pühapäeval olime kodus.'], ['Kõigepealt me sööme hommikust, siis läksime metsa.', 'Kõigepealt sõime me hommikust, siis läksime metsa.|Kõigepealt me sõime hommikust, siis läksime metsa.'], ['Eelmine laupäev me käisime turul.', 'Eelmisel laupäeval käisime me turul.|Eelmisel laupäeval me käisime turul.'], ['Siis me sõitsime koju, sest oli väsinud.', 'Siis sõitsime koju, sest olime väsinud.|Siis me sõitsime koju, sest olime väsinud.']]),
      B.translation('092_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Мой друг живёт в Тарту.', 'Обычно мы встречаемся в субботу.', 'Сначала мы пьём кофе, потом гуляем.', 'Он немного серьёзный, но добрый.', 'Он мне нравится, потому что он честный.', 'Сначала мы пошли в магазин.', 'Потом мы поехали к бабушке.', 'Было холодно, поэтому мы пили чай.']),
      B.dictation('092_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Minu parim sõber on Kati.', 'Ta elab Tartus ja õpib ülikoolis.', 'Tavaliselt kohtume me laupäeval.', 'Eelmisel laupäeval käisime kinos.', 'Ta meeldib mulle, sest ta on aus.', 'Laupäeval käisin kõigepealt turul.', 'Ma ostsin kala, sest tahtsin suppi teha.', 'Siis sõitsin vanaema juurde.']),
      B.speaking('092_p_say', 'Räägi ilma tekstita.', 'Vaata ainult plaani. Räägi oma lähedasest inimesest.', ['Kes ta on?', 'Milline ta on?', 'Mida te koos teete?', 'Miks ta on tähtis?', 'Mida te viimati koos tegite?'], [60, 90]),
      B.writing('092_p_draft', 'Mustand.', 'Kirjuta plaani järgi 6–8 lauset. Kasuta seossõnu.', [6, 8], ['ja', 'aga', 'sest', 'tavaliselt', 'siis'], 4),
    ],
    transfer: [
      B.text('092_t_situation', 'Uus olukord: kirjutamisvõistlus', 'Linna raamatukogu korraldab keeleõppijatele kirjutamisvõistluse. Teema on „Üks päev minu kodukohas”. Tekst peab olema 70–100 sõna. Parimad lood pannakse raamatukogu kodulehele. Enne kirjutamist loed Jaani mustandit.'),
      B.reading('092_t_draft', 'Loe Jaani mustandit.', 'Loe tekst. Vasta küsimustele.', 'Üks päev Haapsalus', P(
        'Minu kodukoht on Haapsalu. Haapsalu on väike linn mere ääres. Tallinnast on sinna sada kilomeetrit. Linnas on vana loss ja pikk promenaad. Suvel tuleb palju turiste. Talvel on linn vaikne.',
        'Eelmisel laupäeval käisin seal oma tütrega. Rattad laenutasime hotellist. Me jalutasime promenaadil. Me sõime kohvikus kala. Me käisime lossis. Me sõitsime rattaga vana raudteejaama juurde. Raudteejaamas on muuseum. Tütrele meeldis muuseum väga, sest seal on vanad rongid. Muuseumis oli ka väike kohvik. Tütar jõi seal kakaod. Õhtul oli ilm tuuline ja me sõitsime koju.',
      ), [
        ['Kus Haapsalu asub?', 'mere ääres'], ['Mida Jaan ja tütar kõigepealt tegid?', 'jalutasid promenaadil'],
        ['Miks meeldis tütrele muuseum?', 'seal on vanad rongid'], ['Mitu lauset algab sõnaga „Me”?', 'neli|4'],
        ['Mis puudub Jaani tekstis?', 'lõpp|lõpp ja arvamus|miks koht meeldib'], ['Mida sa soovitad Jaanile muuta?'], ['Mis on Haapsalus vana?', 'loss|vana loss'], ['Kust laenutasid nad rattad?', 'hotellist']]),
      B.transformation('092_t_improve', 'Paranda Jaani lauseid.', 'Ühenda laused antud sõnaga.', [
        ['Me jalutasime promenaadil. Me sõime kohvikus kala.', 'siis', 'Me jalutasime promenaadil, siis sõime kohvikus kala.|Kõigepealt jalutasime promenaadil, siis sõime kohvikus kala.'],
        ['Me sõime kala. Me käisime lossis.', 'pärast seda', 'Me sõime kala. Pärast seda käisime me lossis.|Me sõime kala, pärast seda käisime lossis.'],
        ['Ilm oli tuuline. Me sõitsime koju.', 'seepärast', 'Ilm oli tuuline, seepärast sõitsime me koju.|Ilm oli tuuline, seepärast sõitsime koju.'],
        ['Linn on väike. Seal on palju teha.', 'aga', 'Linn on väike, aga seal on palju teha.'],
        ['Suvel tuleb palju turiste. Seal on ilus rand.', 'sest', 'Suvel tuleb palju turiste, sest seal on ilus rand.'], ['Tütrele meeldis muuseum. Seal on vanad rongid.', 'sest', 'Tütrele meeldis muuseum, sest seal on vanad rongid.'], ['Me laenutasime rattad. Me sõitsime jaama juurde.', 'siis', 'Me laenutasime rattad, siis sõitsime jaama juurde.|Me laenutasime rattad, siis sõitsime me jaama juurde.'], ['Me sõitsime koju. Päev oli väga tore.', 'lõpuks', 'Lõpuks sõitsime koju. Päev oli väga tore.|Lõpuks sõitsime me koju. Päev oli väga tore.']]),
      B.writing('092_t_write', 'Üks päev minu kodukohas.', 'Kirjuta 70–100 sõna. Kasuta vähemalt 6 seos- või ajasõna.', [8, 10], ['kõigepealt', 'siis', 'pärast seda', 'lõpuks', 'sest', 'aga'], 4),
      B.letter('092_t_letter', 'Kutsu sõber külla.', 'Kutsu sõber oma kodukohta. Kirjuta, mida seal koos teete.', 'Tere!', 'Ootan sind!', [40, 60]),
      B.rolecards('092_t_peer', 'Paarilise küsimused.', 'Lugege oma rolli. Siis vahetage.',
        'Tutvusta oma lugu ilma tekstita. Vasta paarilise küsimustele.', 'Kuula paarilise lugu. Küsi kolm küsimust: millal, miks, mis edasi.',
        ['Minu lugu räägib…', 'Kõigepealt…, siis…', 'Mulle meeldib, sest…'], ['Millal see oli?', 'Miks sa sinna läksid?', 'Mis sa pärast seda tegid?']),
      B.speaking('092_t_present', 'Tutvusta lugu rühmale.', 'Räägi oma loost 1 minut. Ära loe!', ['Mis on sinu kodukoht?', 'Mida sa seal tegid?', 'Miks see meeldib?'], [60, 90]),
      B.rubric('092_t_rubric', 'Kontrolli oma lugu.', 'Märgi, mis on olemas.', ['Pealkiri ja 4 osa: sissejuhatus, kaks detaili, lõpp.', '70–100 sõna.', 'Vähemalt 6 seos- või ajasõna.', 'Ajasõna järel on tegusõna teisel kohal.', 'Mineviku vormid on õiged.']),
      B.selfcheck('092_t_self', ['Ma oskan kasutada seossõnu: kõigepealt, siis, pärast seda, sest, aga.', 'Ma oskan leida tekstist plaani osad ja öelda, mis puudub.', 'Ma oskan panna tegusõna ajasõna järel teisele kohale.', 'Ma oskan kirjutada plaani, mustandi ja 70–100-sõnalise loo.'], 'Minu lugu on valmis'),
    ],
  },

  'a2-093': {
    title: 'A2 monoloog',
    canDo: 'Ma räägin tuttaval teemal 1,5–2 minutit märksõnade järgi, ilma paberilt lugemata, ja vastan vähemalt kolmele lisaküsimusele.',
    template: 'v3',
    discover: [
      B.text('093_d_intro', 'Eksamil räägid sina', 'Harno A2 eksami alguses küsib eksamineerija sinu kohta. Siis kirjeldad pilti ja räägid teemal. Sergei kardab, et ta ei oska kaks minutit rääkida. Õpetaja ütleb: „Ära õpi teksti pähe. Tee märksõnaplaan: algus, kolm-neli fakti, lõpp.”'),
      B.truefalse('093_d_warm', 'Mida õpetaja soovitab?', 'Õige või vale?', [
        ['Sergei peab teksti pähe õppima.', false], ['Monoloogis on algus, faktid ja lõpp.', true], ['Märksõnaplaan aitab rääkida.', true],
        ['Eksami alguses küsib eksamineerija õpilase kohta.', true], ['Eksamil räägib õpilane ainult pildist.', false], ['Sergei kardab rääkida.', true], ['Õpetaja soovitab teha märksõnaplaani.', true], ['Monoloogis ei ole lõppu.', false]]),
      B.reading('093_d_read', 'Loe: Sergei monoloog.', 'Loe monoloogi. Vasta küsimustele.', 'Minu kodu', P(
        'Ma räägin oma kodust. Ma elan Narvas, kesklinna lähedal. Meie korter on viiendal korrusel. Korteris on kolm tuba, köök ja vannituba.',
        'Kõigepealt räägin elutoast. See on kõige suurem tuba. Seal on diivan, suur aken ja palju raamatuid. Õhtuti vaatame seal perega filmi.',
        'Teiseks, mulle meeldib meie köök. Köök on väike, aga hele. Ma teen süüa iga päev, sest mulle meeldib süüa teha.',
        'Varem elasime me Sillamäel väikeses majas. Seal oli aed, aga töö oli kaugel. Kaks aastat tagasi kolisime Narva. Nüüd käin ma tööl jala. See võtab ainult kümme minutit.',
        'Kokkuvõtteks: meie kodu ei ole suur, aga see on mugav ja soe. Mulle meeldib siin elada. Aitäh!',
      ), [
        ['Kus Sergei elab?', 'Narvas|Narvas kesklinna lähedal'], ['Mitu tuba on Sergei korteris?', 'kolm|3'],
        ['Mida teeb pere õhtuti elutoas?', 'vaatab filmi|vaatavad filmi'], ['Miks teeb Sergei iga päev süüa?', 'talle meeldib süüa teha'],
        ['Miks kolis pere Narva?', 'töö oli kaugel|Sillamäelt oli töö kaugel'], ['Mis on monoloogi viimane mõte?', 'kodu on mugav ja soe|talle meeldib seal elada'], ['Mitmendal korrusel on korter?', 'viiendal|5.|viiendal korrusel'], ['Kui kaua läheb Sergei tööle?', 'kümme minutit|10 minutit']]),
      B.notice('093_d_notice', 'Monoloogi plaan.', [
        '**Algus:** Ma räägin oma …st. / Täna räägin …',
        '**Faktid:** Kõigepealt… Teiseks… Kolmandaks…',
        '**Näide ja põhjus:** Näiteks… / …, sest…',
        '**Varem ja nüüd:** Varem **elasime** Sillamäel. Nüüd **elame** Narvas.',
        '**Lõpp:** Kokkuvõtteks… / Mulle meeldib… Aitäh!',
        '**Ära loe!** Vaata ainult märksõnu: Narva – 3 tuba – elutuba – köök – varem Sillamäe.',
      ], 'full'),
      B.listening('093_d_listen', 'Kuula Merle monoloogi.', 'Õpetaja loeb monoloogi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Ma räägin oma tööst.', 'Ma töötan apteegis Tartu kesklinnas. Ma olen seal töötanud neli aastat.',
        'Kõigepealt räägin oma tööpäevast. Tööpäev algab kell kaheksa. Ma räägin klientidega ja müün ravimeid.',
        'Teiseks, mulle meeldivad minu kolleegid. Meil on väike ja sõbralik meeskond.',
        'Varem töötasin ma poes. See töö oli raske, sest ma pidin palju seisma.', 'Nüüd saan ma vahel ka istuda ja arvutiga töötada.',
        'Kokkuvõtteks: minu töö on huvitav, aga mõnikord väsitav. Aitäh!',
      ], [
        'Merle töötab [apteegis].', 'Ta on seal töötanud [neli aastat|4 aastat|neli].', 'Tööpäev algab kell [kaheksa|8].',
        'Merle meeskond on väike ja [sõbralik].', 'Varem töötas Merle [poes].', 'Poes pidi ta palju [seisma].', 'Merle räägib klientidega ja müüb [ravimeid].', 'Nüüd saab Merle vahel ka [istuda].']),
      B.choice('093_d_answer', 'Lisaküsimus ja vastus.', 'Eksamineerija küsib. Vali parim vastus.', [
        ['Kas teil on rõdu?', 'Jah, meil on väike rõdu.', 'Jah, ma elasin Sillamäel.', 'Ei, ma käin jala.'],
        ['Kus te varem elasite?', 'Varem elasin ma Sillamäel.', 'Nüüd elan ma Narvas.', 'Ma elan viiendal korrusel.'],
        ['Miks te kolisite?', 'Sest töö oli kaugel.', 'Kaks aastat tagasi.', 'Narva kesklinna.'],
        ['Kui kaua te tööle lähete?', 'Umbes kümme minutit.', 'Kell kaheksa.', 'Jala ja bussiga.'],
        ['Mida te õhtuti teete?', 'Tavaliselt vaatame filmi.', 'Eile vaatasin filmi.', 'Film oli hea.'],
        ['Kellega te koos elate?', 'Naise ja kahe lapsega.', 'Viiendal korrusel.', 'Kesklinna lähedal.'], ['Mis on teie lemmiktuba?', 'Elutuba, sest seal on suur aken.', 'Eile olin köögis.', 'Kolm tuba.'], ['Kas teile meeldib süüa teha?', 'Jah, ma teen süüa iga päev.', 'Jah, ma sõin eile.', 'Ei, köök on väike.']], 'full', 'g_use'),
      B.transformation('093_d_past', 'Ütle minevikus.', 'Kirjuta lause sõnaga „varem”.', [['Ma elan Tallinnas.', 'Varem …', 'Varem elasin ma Tallinnas.|Varem elasin Tallinnas.'], ['Ma töötan koolis.', 'Varem …', 'Varem töötasin ma koolis.|Varem töötasin koolis.'], ['Me käime tihti kinos.', 'Varem …', 'Varem käisime me tihti kinos.|Varem käisime tihti kinos.'], ['Mul on auto.', 'Varem …', 'Varem oli mul auto.'], ['Ma sõidan tööle bussiga.', 'Varem …', 'Varem sõitsin ma tööle bussiga.|Varem sõitsin tööle bussiga.'], ['Kus te varem elasite? (Pärnu)', 'Varem …', 'Varem elasin ma Pärnus.|Varem elasin Pärnus.'], ['Mida te eile tegite? (kino)', 'Eile …', 'Eile käisin ma kinos.|Eile käisin kinos.'], ['Kus te töötate? (kool)', 'Ma …', 'Ma töötan koolis.']]),
      B.speaking('093_d_say', 'Proovi: üks minut.', 'Räägi oma märksõnade järgi. Ära loe lauseid!', ['Mis on sinu teema?', 'Mis on 3 fakti?', 'Mis oli varem?', 'Kuidas lõpetad?', 'Mida sa veel lisaksid?'], [60, 90], ['Ma räägin oma…', 'Kõigepealt…', 'Kokkuvõtteks…']),
      B.writing('093_d_write', 'Märksõnadest lauseteks.', 'Kirjuta oma märksõnadest 8–10 lauset.', [8, 10], ['kõigepealt', 'teiseks', 'varem', 'nüüd', 'kokkuvõtteks'], 3),
    ],
    practice: [
      B.cloze('093_p_cloze', 'Oksana monoloog.', 'Vali igasse lünka õige vorm.', 'Minu pere', [
        'Ma räägin oma perest. Minu pere {*on|oli|olema} väike: mina, mu mees ja tütar Mia. Me {*elame|elasime|elama} Tartus, Annelinnas.',
        'Varem {*elasime|elame|elada} me Ukrainas. Kolm aastat tagasi {*kolisime|kolime|kolima} Eestisse.',
        'Kõigepealt räägin oma mehest. Ta {*töötab|töötavad|töötama} bussijuhina. Teiseks räägin tütrest. Mia on kuueaastane ja käib lasteaias. Ta {*tahab|tahtis|tahta} kõike teada. Näiteks eile {*küsis|küsib|küsima} ta, miks taevas on sinine.',
        'Nädalavahetusel {*sõidame|sõidavad|sõitma} tihti vanaema juurde maale. Kokkuvõtteks: mu pere on väike, aga õnnelik.',
      ], 'g_notice'),
      B.formtext('093_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Minu töö', [
        'Ma räägin oma [tööst] (töö). Ma [töötan] (töötama) kaupluses kassapidajana.',
        '',
        'Varem [töötasin] (töötama) ma kohvikus. Seal [oli] (olema) töö raske.',
        '',
        'Nüüd [käin] (käima) ma tööl bussiga. Mulle meeldib [suhelda] (suhtlema) klientidega.',
        '',
        'Kokkuvõtteks: mu töö on huvitav, sest [kolleegid] (kolleeg) on toredad. Aitäh [kuulamast] (kuulama)!',
      ], 'g_notice'),
      B.gaps('093_p_phrases', 'Monoloogi väljendid.', 'Kirjuta lünka sobiv väljend.', [
        '[Ma räägin] oma perest.', '[Kõigepealt] räägin oma vanematest.', '[Teiseks] räägin oma õest.', '[Näiteks] eelmisel suvel käisime koos Soomes.',
        'Mul on suur pere, [sest] mul on kolm venda.', '[Lõpuks] räägin oma vanaemast.', 'Õde elab Tartus, [aga] vend elab Narvas.', '[Kokkuvõtteks]: pere on minu jaoks väga tähtis.',
      ], ['Ma räägin', 'Kõigepealt', 'Teiseks', 'Näiteks', 'sest', 'Kokkuvõtteks', 'Lõpuks', 'aga']),
      B.choice('093_p_help', 'Kui jääd vait.', 'Mida teha, kui ei tea, mida öelda? Vali parim.', [
        ['Unustasid sõna „rõdu”.', 'Ütle teisiti: väike koht korteri juures.', 'Ole vait ja oota.', 'Ütle sõna vene keeles.'],
        ['Sa ei saanud küsimusest aru.', 'Vabandust, kas te saaksite korrata?', 'Jah, kindlasti.', 'Ma ei tea midagi.'],
        ['Rohkem fakte ei tule meelde.', 'Räägi, mis oli varem.', 'Alusta algusest uuesti.', 'Ütle: „See on kõik.”'],
        ['Sa tahad näidet tuua.', 'Näiteks eelmisel nädalal…', 'Kokkuvõtteks…', 'Ma räägin oma…'],
        ['Aeg on peaaegu läbi.', 'Kokkuvõtteks: mulle meeldib…', 'Kõigepealt räägin…', 'Teiseks räägin…'], ['Sa ei mäleta, mis aastal kolisid.', 'Ütle: umbes kolm aastat tagasi.', 'Ütle: ma ei tea midagi.', 'Ole vait ja oota.'], ['Eksamineerija küsib lisaküsimuse.', 'Vasta kahe lausega.', 'Vasta ühe sõnaga.', 'Küsi vastu sama küsimus.'], ['Sa tahad põhjust öelda.', '…, sest mulle meeldib…', 'Kokkuvõtteks…', 'Kõigepealt…']], 'full', 'g_use'),
      B.errorfix('093_p_fix', 'Paranda monoloogi viga.', 'Kirjuta lause õigesti.', [['Ma räägin minu pere.', 'Ma räägin oma perest.'], ['Varem ma elan Pärnus.', 'Varem elasin ma Pärnus.|Varem ma elasin Pärnus.'], ['Mulle meeldib ujuma.', 'Mulle meeldib ujuda.'], ['Minu tütar on kuus aastat.', 'Minu tütar on kuueaastane.|Minu tütar on kuus aastat vana.'], ['Ma töötan kool.', 'Ma töötan koolis.'], ['Eile me käime kinos.', 'Eile käisime kinos.|Eile me käisime kinos.'], ['Ma räägin minu töö.', 'Ma räägin oma tööst.'], ['Varem ma töötan pangas.', 'Varem töötasin ma pangas.|Varem ma töötasin pangas.']]),
      B.translation('093_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Я расскажу о своём свободном времени.', 'Два раза в неделю я хожу плавать.', 'Раньше я играл в футбол.', 'Например, в прошлую субботу я был в лесу.', 'Спасибо за внимание!', 'Я расскажу о своей работе.', 'Сначала расскажу о своём рабочем дне.', 'Раньше я работал в магазине.']),
      B.dictation('093_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Täna räägin ma oma tööst.', 'Ma töötan kaupluses kassapidajana.', 'Tööpäev algab kell üheksa.', 'Varem töötasin ma kohvikus.', 'Mulle meeldib minu töö, sest kolleegid on toredad.', 'Aitäh kuulamast!', 'Ma räägin oma perest.', 'Minu pere on väike.']),
      B.wordorder('093_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', [
        'Täna räägin ma oma vabast ajast.', 'Kõigepealt räägin oma hobist.', 'Kaks korda nädalas käin ma ujumas.', 'Varem mängisin ma korvpalli.', 'Kokkuvõtteks: vaba aeg on mulle tähtis.', 'Teiseks räägin ma oma sõpradest.', 'Näiteks eelmisel laupäeval käisime metsas.', 'Aitäh kuulamast!']),
      B.speaking('093_p_mono', 'Monoloog 1,5 minutit.', 'Räägi märksõnade järgi. Paariline mõõdab aega.', ['Mis on sinu hobi?', 'Kellega ja kui tihti?', 'Mida tegid eelmisel nädalavahetusel?', 'Miks see sulle meeldib?'], [90, 120], ['Ma räägin oma…', 'Kõigepealt…', 'Kokkuvõtteks…']),
    ],
    transfer: [
      B.text('093_t_situation', 'Uus olukord: tutvumisõhtu tööl', 'Sinu firmas on uus meeskond. Igaüks räägib kaks minutit ühest teemast: kodu, pere, töö, vaba aeg, ostud või reisid. Aga teema loositakse! Pärast räägivad kolleegid ja küsivad küsimusi.'),
      B.notice('093_t_cards', 'Teemakaardid', [
        '**Kodu:** kus? milline? mis toas? varem ja nüüd',
        '**Pere:** kes? kus elab? mida koos teete?',
        '**Töö või õppimine:** kus? mida teed? mis meeldib?',
        '**Vaba aeg:** hobi, kellega, kui tihti, eelmine nädalavahetus',
        '**Ostud:** kus käid? mida ostad? viimane ost',
        '**Reis:** kuhu? kellega? mida tegid? mis meeldis?',
      ], 'full', 'g_vocab'),
      B.listening('093_t_listen', 'Kuula Markuse monoloogi.', 'Õpetaja loeb monoloogi kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere! Ma räägin oma reisist Lätti.', 'Eelmisel suvel sõitsime perega autoga Riiga. Sõit kestis viis tundi.',
        'Kõigepealt jalutasime vanalinnas. Seal on palju vanu kirikuid ja kitsaid tänavaid.',
        'Teiseks käisime turul. Riia turg on väga suur. Ostsime seal kala ja puuvilju.',
        'Kolmandaks olime kaks päeva mere ääres. Lapsed ujusid iga päev.', 'Üks probleem oli ka: hotellis ei töötanud internet.',
        'Kokkuvõtteks: reis oli lühike, aga väga tore. Järgmisel aastal tahame minna Leetu. Aitäh!',
      ], [
        'Markus sõitis Riiga [autoga].', 'Sõit kestis [viis tundi|5 tundi].', 'Turul ostsid nad kala ja [puuvilju|puuvilja].',
        'Mere ääres olid nad [kaks päeva|2 päeva].', 'Hotellis ei töötanud [internet].', 'Järgmisel aastal tahavad nad minna [Leetu].', 'Vanalinnas on palju vanu [kirikuid].', 'Mere ääres [ujusid] lapsed iga päev.']),
      B.speaking('093_t_mono1', 'Monoloog 1. Loositud teema.', 'Räägi 1,5–2 minutit. Vaata ainult märksõnu.', ['Algus', '3–4 fakti', 'Varem ja nüüd', 'Lõpp'], [90, 120]),
      B.rolecards('093_t_roles', 'Kolleegide küsimused.', 'Üks räägib, teine küsib. Siis vahetage.',
        'Sa rääkisid oma teemast. Vasta igale küsimusele 2–3 lausega.', 'Kuula kolleegi monoloogi. Küsi vähemalt kolm küsimust: kus, miks, millal.',
        ['Jah, sest…', 'Varem… aga nüüd…', 'Näiteks…'], ['Miks sa…?', 'Kus sa varem…?', 'Mida sa järgmiseks plaanid?']),
      B.speaking('093_t_mono2', 'Monoloog 2. Uus teema.', 'Paariline valib sulle uue teema. Mõtle 30 sekundit, siis räägi.', ['Algus', '3 fakti', 'Näide', 'Lõpp'], [90, 120]),
      B.letter('093_t_letter', 'Kiri sõbrale.', 'Kirjuta sõbrale oma uuest meeskonnast ja tutvumisõhtust.', 'Tere!', 'Kirjuta, kuidas sul läheb!', [40, 60]),
      B.rubric('093_t_rubric', 'Kuula paarilist ja hinda.', 'Märgi, mis oli olemas.', ['Algus, 3–4 fakti ja lõpp.', 'Rääkis 1,5–2 minutit.', 'Ei lugenud paberilt.', 'Vastas kolmele küsimusele.', 'Kasutas minevikku ja olevikku.']),
      B.selfcheck('093_t_self', ['Ma oskan alustada ja lõpetada monoloogi: Ma räägin…, Kokkuvõtteks…', 'Ma oskan kuulata monoloogi ja leida selle faktid.', 'Ma oskan vastata küsimusele samas ajavormis: Kus elasid? – Elasin…', 'Ma oskan rääkida 1,5–2 minutit ilma paberita ja vastata kolmele küsimusele.'], 'Räägin kaks minutit'),
    ],
  },

  'a2-094': {
    title: 'A2 dialoog ja olukord',
    canDo: 'Ma lahendan dialoogis lihtsa igapäevase ülesande (kohvik, pood, arst, transport, teenindus): küsin, täpsustan, reageerin muutusele ja lõpetan viisakalt.',
    template: 'v3',
    discover: [
      B.text('094_d_intro', 'Reede õhtu kohvikus', 'Anna ja Jaan tulevad reedel pärast tööd kohvikusse „Mesi”. Kell on seitse ja kohvik on täis. Anna on taimetoitlane. Jaan tahab suppi. Neil on aega ainult tund, sest kell kaheksa algab kino.'),
      B.reading('094_d_read', 'Loe: dialoog kohvikus.', 'Loe dialoogi. Vasta küsimustele.', 'Kohvikus „Mesi”', [
        'Teenindaja: Tere õhtust! Kas teil on laud broneeritud?', 'Jaan: Ei ole. Kas teil on vaba laud kahele?',
        'Teenindaja: Praegu kahjuks mitte. Kas te saaksite kümme minutit oodata?', 'Jaan: Hästi, ootame.',
        'Teenindaja: Palun, laud akna all on nüüd vaba. Mida te soovite?', 'Anna: Ma olen taimetoitlane. Mida te soovitate?',
        'Teenindaja: Meil on köögiviljasupp ja seenerisoto.', 'Anna: Ma võtan risoto. Kui kaua see võtab?', 'Teenindaja: Umbes kakskümmend minutit.',
        'Jaan: Mina tahaksin kanasuppi.', 'Teenindaja: Vabandust, kanasupp on täna otsas. Kas võtate hoopis köögiviljasupi?', 'Jaan: Jah, sobib. Ja palun kaks teed.',
        'Jaan: Vabandust, kas me saaksime arve? Meil on kiire, kino algab kell kaheksa.', 'Teenindaja: Muidugi. Kas maksate kaardiga?', 'Anna: Jah, kaardiga. Aitäh, kõik oli väga maitsev!',
      ], [
        ['Miks pidid Anna ja Jaan ootama?', 'vaba lauda ei olnud|kohvik oli täis|laud ei olnud vaba'], ['Mida tellis Anna?', 'seenerisoto|risoto'],
        ['Miks ei saanud Jaan kanasuppi?', 'see oli otsas|kanasupp oli otsas'], ['Mida tellis Jaan hoopis?', 'köögiviljasupi|köögiviljasuppi'],
        ['Miks küsis Jaan arvet kiiresti?', 'kino algab kell kaheksa|neil on kiire'], ['Kuidas nad maksid?', 'kaardiga'], ['Kus oli vaba laud?', 'akna all'], ['Kui kaua võtab risoto?', 'kakskümmend minutit|20 minutit|umbes kakskümmend minutit']]),
      B.notice('094_d_notice', 'Dialoog samm-sammult.', [
        '**1. Küsi:** Kas teil on…? / Mul on vaja… / Kas ma saaksin…?',
        '**2. Täpsusta:** Kui kaua? Kui palju see maksab? Mis kell? Kus?',
        '**3. Muutus:** Kahjuks… on otsas / ei ole / ei saa.',
        '**4. Reageeri:** Sobib! / Siis võtan hoopis… / Kas on midagi muud?',
        '**5. Lõpeta:** Aitäh! / Head päeva! / Kõik oli väga hea.',
      ], 'full'),
      B.dialogue('094_d_pharmacy', 'Täienda: apteegis.', 'Täida dialoog sobivate sõnadega.', 'Apteeker', 'Sofia', [
        ['A', 'Tere! Kuidas saan aidata?'], ['B', 'Tere! Mul on [vaja] midagi peavalu vastu.'], ['A', 'Meil on need tabletid. Pakis on kakskümmend tabletti.'],
        ['B', 'Kui [palju] need maksavad?'], ['A', 'Neli eurot. Aga suur pakk on kahjuks [otsas].'], ['B', 'Pole hullu, väike pakk [sobib].'],
        ['A', 'Kas maksate kaardiga?'], ['B', 'Jah. [Kas] ma saaksin ka koti?'], ['A', 'Muidugi. Palun!'], ['B', '[Aitäh]! Head päeva!'],
      ]),
      B.transformation('094_d_polite', 'Küsi viisakalt.', 'Kirjuta lause viisaka küsimusena.', [
        ['Anna mulle arve!', 'Kas ma saaksin …?', 'Kas ma saaksin arve?'], ['Ma tahan vett.', 'Kas ma saaksin …?', 'Kas ma saaksin vett?|Kas ma saaksin klaasi vett?'],
        ['Ütle hind!', 'Kui palju …?', 'Kui palju see maksab?'], ['Ma tahan maksta kaardiga.', 'Kas ma saaksin …?', 'Kas ma saaksin kaardiga maksta?'],
        ['Kus on bussipeatus?', 'Vabandust, kas te teate, …', 'Vabandust, kas te teate, kus on bussipeatus?|Vabandust, kas te teate, kus bussipeatus on?'], ['Ütle mulle, mis kell buss läheb!', 'Kas te saaksite öelda, …', 'Kas te saaksite öelda, mis kell buss läheb?'], ['Too menüü!', 'Kas ma saaksin …?', 'Kas ma saaksin menüü?'], ['Ma tahan kotti.', 'Kas ma saaksin …?', 'Kas ma saaksin koti?|Kas ma saaksin kotti?']]),
      B.choice('094_d_react', 'Midagi muutus.', 'Vali sobiv reaktsioon.', [
        ['Teenindaja: „Kala on täna otsas.”', 'Siis võtan hoopis kana.', 'Aitäh, kõik oli maitsev!', 'Tere, kas teil on laud?'],
        ['Bussijuht: „See buss ei lähe kesklinna.”', 'Mis buss läheb kesklinna?', 'Head reisi!', 'Mulle meeldib see buss.'],
        ['Registratuur: „Täna vabu aegu ei ole.”', 'Kas homme on vaba aeg?', 'Ma olen täna terve.', 'Tänan, kõik oli hea!'],
        ['Müüja: „Seda suurust meil ei ole.”', 'Kas teil on suurem suurus?', 'Aitäh, ma maksan kaardiga.', 'Mul on vaja arvet.'],
        ['Juuksur: „Kell kolm on kinni.”', 'Kas kell neli sobib?', 'Kell kolm sobib hästi.', 'Mul on pikad juuksed.'], ['Kassapidaja: „Kaardimakse täna ei tööta.”', 'Kas ma saan sularahas maksta?', 'Aitäh, kaart töötab.', 'Ma ei taha midagi.'], ['Teenindaja: „Laud vabaneb kümne minuti pärast.”', 'Hästi, me ootame.', 'Ei, ma ei söö.', 'Head isu!'], ['Apteeker: „Seda ravimit ilma retseptita ei saa.”', 'Kas teil on midagi ilma retseptita?', 'Siis võtan kaks pakki.', 'Aitäh, ma olen terve.']], 'full', 'g_use'),
      B.errorfix('094_d_fix', 'Paranda viga.', 'Kirjuta lause õigesti.', [['Ma tahan üks kohv.', 'Ma tahan ühte kohvi.|Ma tahaksin ühte kohvi.|Üks kohv, palun.'], ['Mul on vaja arst.', 'Mul on vaja arsti.'], ['Ma tahan maksma kaardiga.', 'Ma tahan maksta kaardiga.|Ma tahan kaardiga maksta.'], ['Kas see buss läheb kesklinnas?', 'Kas see buss läheb kesklinna?'], ['Kas ma saan ostma pileti?', 'Kas ma saan pileti osta?|Kas ma saaksin pileti osta?'], ['Kas te saaksite mulle aidata?', 'Kas te saaksite mind aidata?'], ['Ma ootan teie vastus.', 'Ma ootan teie vastust.'], ['Mul on vaja uus telefon.', 'Mul on vaja uut telefoni.']]),
      B.rolecards('094_d_roles', 'Proovi: kohvikus.', 'Lugege oma rolli. Rääkige 2 minutit.',
        'Oled klient. Telli toit ja jook. Küsi, kui kaua see võtab. Sul on kiire.', 'Oled teenindaja. Üks roog on otsas. Paku midagi muud. Too arve.',
        ['Kas teil on…?', 'Ma võtan…', 'Kui kaua see võtab?', 'Kas ma saaksin arve?'], ['Mida te soovite?', 'Kahjuks… on otsas.', 'Kas võtate hoopis…?', 'Kas maksate kaardiga?']),
      B.writing('094_d_write', 'Kirjuta dialoog.', 'Kirjuta kliendi ja müüja dialoog poes. Kasuta viit sammu.', [8, 10], ['kas teil on', 'kui palju', 'kahjuks', 'hoopis', 'aitäh'], 3),
    ],
    practice: [
      B.gaps('094_p_qwords', 'Küsisõnad.', 'Kirjuta lünka sobiv küsisõna.', [
        '[Kui palju] see jope maksab? — 59 eurot.', '[Kui kaua] parandus võtab? — Umbes tund.', '[Mis kell] buss väljub? — Kell 14.20.',
        '[Kust] ma saan pileti osta? — Automaadist.', '[Mitu] tabletti päevas? — Kaks.', '[Kuhu] see buss läheb? — Kesklinna.', '[Kus] on lähim apteek? — Pargi tänaval.', '[Millal] arst vastu võtab? — Hommikuti.',
      ], ['kui palju', 'kui kaua', 'mis kell', 'kust', 'kus', 'mitu', 'kuhu', 'millal']),
      B.cloze('094_p_cloze', 'Riidepoes.', 'Vali igasse lünka sobiv sõna.', 'Uus jope', [
        '— Tere! Kas teil {*on|oli|olema} seda jopet ka suuremas suuruses?',
        '— Kahjuks suurem suurus on {*otsas|otsa|otsast}. Aga meil on {*hoopis|kohe|ainult} sinine jope.',
        '— Kui {*palju|kaua|mitu} see maksab? — Viiskümmend üheksa eurot.',
        '— Kas ma {*saaksin|saan|saama} seda proovida? — Muidugi, proovikabiin on seal.',
        '— See {*sobib|sobi|sobima} hästi. Kas ma saaksin {*kaardiga|kaart|kaardil} maksta?',
        '— Jah, palun. {*Aitäh|Palun|Tere} ja head päeva!',
      ], 'g_vocab'),
      B.formtext('094_p_formtext', 'Pane sõnad õigesse vormi.', 'Kirjuta sulgudes olev sõna õiges vormis.', 'Registratuuris', [
        '— Mul [on] (olema) kaks päeva palavik ja kurk [valutab] (valutama).',
        '',
        '— Ma [tahaksin] (tahtma, viisakalt) aega arsti juurde. Kas te [saaksite] (saama, viisakalt) mind täna aidata?',
        '',
        '— Kahjuks täna vabu [aegu] (aeg) ei ole. Kas te [sooviksite] (soovima, viisakalt) tulla homme kell üheksa?',
        '',
        '— Hästi. Kas ma pean [dokumendi] (dokument) kaasa võtma? — Jah. Palun [tulge] (tulema) kümme minutit varem.',
      ], 'g_notice'),
      B.listening('094_p_listen', 'Kuula: kõne rattaparandusse.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Tere! Rattaparandus „Ratas”, kuulan.', '— Tere! Siin Viktor Kask. Minu jalgratta pidur ei tööta. Kas te saaksite selle täna parandada?',
        '— Täna kahjuks mitte. Meil on palju tööd. Kas homme sobib?', '— Homme olen ma tööl. Kas laupäeval olete avatud?',
        '— Laupäeval oleme avatud kella kümnest kaheni.', '— Hästi. Kui kaua parandus võtab?', '— Umbes üks tund. Te võite oodata või hiljem tagasi tulla.',
        '— Kui palju see maksab?', '— Uus pidur maksab viisteist eurot ja töö kümme eurot.', '— Selge. Kus te asute?',
        '— Kalda tänav 3, kaubanduskeskuse taga.', '— Suur aitäh! Tulen laupäeval kell kümme.',
      ], [
        'Viktori rattal ei tööta [pidur].', 'Täna ei saa, sest neil on palju [tööd].', 'Laupäeval on töökoda lahti kella kümnest kuni [kaheni|kella kaheni|14-ni].',
        'Parandus võtab umbes [tund|üks tund|ühe tunni].', 'Töö maksab [kümme eurot|10 eurot|10].', 'Töökoda asub kaubanduskeskuse [taga].', 'Viktor tuleb laupäeval kell [kümme|10].', 'Uus pidur maksab [viisteist eurot|15 eurot|15].']),
      B.transformation('094_p_change', 'Reageeri muutusele.', 'Kirjuta vastus. Kasuta sõna sulgudes.', [['Kanasupp on otsas. (köögiviljasupp)', 'Siis võtan hoopis …', 'Siis võtan hoopis köögiviljasupi.|Siis võtan hoopis köögiviljasuppi.'], ['Kell kolm ei sobi. (kell neli)', 'Kas … sobib?', 'Kas kell neli sobib?'], ['Suurt pakki ei ole. (väike pakk)', 'Siis võtan …', 'Siis võtan väikese paki.'], ['Buss number viis ei sõida. (buss number kolm)', 'Kas … läheb kesklinna?', 'Kas buss number kolm läheb kesklinna?|Kas kolmas buss läheb kesklinna?'], ['Arst on puhkusel. (teine arst)', 'Kas ma saaksin …?', 'Kas ma saaksin teise arsti juurde?|Kas ma saaksin aja teise arsti juurde?'], ['Sa tahad teada hinda.', 'Kui palju …?', 'Kui palju see maksab?|Kui palju pilet maksab?'], ['Sa tahad teada, millal buss läheb.', 'Mis kell …?', 'Mis kell buss läheb?|Mis kell buss väljub?'], ['Sa tahad maksta sularahas.', 'Kas ma saaksin …?', 'Kas ma saaksin sularahas maksta?']]),
      B.wordorder('094_p_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kas teil on see jope ka mustana?', 'Mul on vaja aega arsti juurde.', 'Kas te saaksite seda korrata?', 'Siis võtan hoopis väikese paki.', 'Kas ma saaksin kaardiga maksta?', 'Kas teil on vaba laud kahele?', 'Kui kaua see võtab?', 'Mida te soovitate?']),
      B.translation('094_p_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Мне нужно записаться к врачу.', 'Сколько времени займёт ремонт?', 'К сожалению, это время не подходит.', 'Тогда я приду в субботу.', 'Не могли бы вы повторить?', 'У вас есть свободный столик?', 'Что вы посоветуете?', 'Сколько это стоит?']),
      B.dictation('094_p_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Tere! Mul on vaja uut telefoni.', 'Kui palju see maksab?', 'Kahjuks see mudel on otsas.', 'Siis võtan hoopis selle.', 'Aitäh ja head päeva!', 'Kas ma saaksin kaardiga maksta?', 'Kui kaua parandus võtab?', 'Kas te saaksite seda korrata?']),
      B.speaking('094_p_retell', 'Räägi kuuldust.', 'Räägi paarilisele, kuidas Viktor rattaparanduse aja sai.', ['Mis juhtus?', 'Miks täna ei saanud?', 'Millal ta läheb?', 'Kui palju see maksab?', 'Kuhu ta peab minema?'], [60, 90], ['Viktori rattal…', 'Ta läheb…', 'See maksab…']),
    ],
    transfer: [
      B.text('094_t_situation', 'Uus olukord: kolm päeva Tartus', 'Sa oled kolm päeva tööasjus Tartus. Sul on palju ülesandeid: osta pilet, parandada telefon ja käia arsti juures. Igas olukorras läheb midagi teisiti, kui plaanisid. Sinu eesmärk: lahenda probleem.'),
      B.choice('094_t_choice', 'Mis on hea lahendus?', 'Vali parim vastus.', [
        ['Rong on hiljaks jäänud. Koosolek algab kohe.', 'Helistan ja ütlen, et jään hiljaks.', 'Lähen koju tagasi.', 'Ootan ja ei ütle midagi.'],
        ['Telefoni parandus võtab kolm päeva.', 'Küsin, kas saan asendustelefoni.', 'Ostan kohe uue maja.', 'Viskan telefoni ära.'],
        ['Apteegis ravimit ei ole.', 'Küsin, kas on sarnane ravim.', 'Lähen kinno.', 'Ütlen „Head isu!”.'],
        ['Hotellis ei ole sooja vett.', 'Ütlen administraatorile ja küsin teist tuba.', 'Maksan kaks korda.', 'Kirjutan sõbrale kutse.'],
        ['Taksojuht ei tea aadressi.', 'Näitan aadressi telefonis.', 'Lähen bussiga Pärnusse.', 'Ütlen „Palju õnne!”.'], ['Arst ütleb, et pead kolm päeva kodus olema.', 'Helistan tööle ja ütlen, et olen haige.', 'Lähen kohe tööle.', 'Ostan uue telefoni.'], ['Kassas ei saa kaardiga maksta.', 'Küsin, kus on lähim pangaautomaat.', 'Lähen ilma piletita bussi.', 'Viskan kaardi ära.'], ['Hotelli hommikusöök on juba läbi.', 'Küsin, kus on lähim kohvik.', 'Jään terveks päevaks nälga.', 'Lähen arsti juurde.']], 'full', 'g_read'),
      B.gaps('094_t_warm', 'Meenuta.', 'Kirjuta lünka sobiv sõna.', [
        'Kas teil on vaba [aeg] homme?', 'Kui [kaua] parandus võtab?', 'Kahjuks see buss on [täis].', 'Siis võtan [hoopis] järgmise bussi.', 'Kas ma [saaksin] kaardiga maksta?', 'Kui palju see [maksab]?', 'Kahjuks kanasupp on [otsas].', 'Kui [palju] pilet Pärnusse maksab?',
      ], ['aeg', 'kaua', 'täis', 'hoopis', 'saaksin', 'maksab', 'palju', 'otsas']),
      B.rolecards('094_t_bus', 'Olukord 1. Bussijaamas.', 'Lugege oma rolli. Rääkige 2 minutit.',
        'Sa tahad piletit Pärnusse kell 15.00. Küsi hinda. Sul on vaja jõuda Pärnusse enne kella seitset.', 'Oled kassapidaja. Kell 15.00 buss on täis. Järgmine buss on kell 17.30 ja jõuab Pärnu kell 20.',
        ['Üks pilet Pärnusse, palun.', 'Kas on mõni teine buss?', 'Siis võtan…'], ['Kahjuks see buss on täis.', 'Järgmine buss on…', 'Kas maksate kaardiga?']),
      B.rolecards('094_t_phone', 'Olukord 2. Telefoni parandus.', 'Lugege oma rolli. Rääkige 2 minutit.',
        'Sinu telefoni ekraan on katki. Sul on telefoni homme tööks vaja. Küsi hinda ja aega.', 'Oled parandaja. Parandus võtab kolm päeva ja maksab 80 eurot. Paku asendustelefoni.',
        ['Mul on vaja…', 'Kui kaua see võtab?', 'Kas on mõni lahendus?'], ['Parandus võtab…', 'Kahjuks kiiremini ei saa.', 'Kas soovite asendustelefoni?']),
      B.speaking('094_t_tell', 'Kuidas läks?', 'Räägi paarilisele, kuidas üks olukord lõppes.', ['Mis oli sinu eesmärk?', 'Mis läks teisiti?', 'Kuidas sa probleemi lahendasid?', 'Kas oled rahul?'], [60, 90]),
      B.letter('094_t_letter', 'Sõnum kolleegile.', 'Sa jääd bussi pärast hiljaks. Kirjuta kolleegile: miks, millal tuled, palve.', 'Tere!', 'Vabandust!', [40, 60]),
      B.rubric('094_t_rubric', 'Kas eesmärk on täidetud?', 'Märgi iga olukorra järel.', ['Küsisin selgelt, mida mul vaja on.', 'Täpsustasin: hind, aeg või koht.', 'Reageerisin muutusele ja leidsin lahenduse.', 'Lõpetasin viisakalt.', 'Paariline sai minust aru.']),
      B.selfcheck('094_t_self', ['Ma oskan kasutada teeninduse väljendeid: Kas teil on…?, Mul on vaja…, Kahjuks…', 'Ma oskan aru saada, mis on probleem ja mis on lahendus.', 'Ma oskan küsida viisakalt ja täpsustada: Kas ma saaksin…?, Kui kaua…?', 'Ma oskan lahendada olukorra ka siis, kui midagi muutub.'], 'Probleem on lahendatud'),
    ],
  },

  'a2-095': {
    title: 'Kontroll 19 — kirjutamine ja rääkimine',
    assessment: true,
    canDo: 'Ma kirjutan A2 eksami vormis sõnumi ja kirjelduse, räägin teemal 1,5–2 minutit ja lahendan dialoogis olukorra; kokku saan vähemalt 70%.',
    discover: [
      B.text('095_d_intro', 'Osa A. Keel enne kontrolli', 'Kontroll 19 on nagu Harno A2 eksam. Selles lehes kordad mooduli keelt: sõnum, kirjeldus, monoloog ja dialoog. Iga ülesanne kontrollib ühe tunni eesmärki. Tee kõik ilma abita, siis kontrolli vastuseid.'),
      B.truefalse('095_d_warm', 'Mida sa eksamist tead?', 'Õige või vale?', [
        ['A2 eksamil on neli osa.', true], ['Kuulamistekst loetakse kaks korda.', true], ['Esimeses kirjutamisülesandes kirjutad vähemalt 25 sõna.', true],
        ['Rääkimise osas oled üksi eksamineerijaga.', false], ['Kuulamisel vastad pikkade lausetega.', false],
      ]),
      B.gaps('095_d_a1', 'A1. Sõnum: aeg ja koht.', 'Vali sõnapangast õige vorm.', [
        'Kohtume [reedel] kell viis.', 'Palun vasta [neljapäevaks].', 'Pidu on [meie juures].', 'Tule pärast tööd [meie juurde].', 'Ootan sind [kino ees].', 'Pood on avatud [kella kuueni].',
      ], ['reedel', 'reede', 'neljapäevaks', 'neljapäeval', 'meie juures', 'meie juurde', 'kino ees', 'kino ette', 'kella kuueni', 'kell kuus']),
      B.transformation('095_d_a2', 'A2. Kirjeldus: seo laused.', 'Kirjuta lause antud sõnaga.', [
        ['Me sõime kõigepealt hommikust.', 'Kõigepealt …', 'Kõigepealt sõime me hommikust.|Kõigepealt sõime hommikust.'],
        ['Me läksime siis randa.', 'Siis …', 'Siis läksime me randa.|Siis läksime randa.'],
        ['Ilm oli soe. Me ujusime.', 'seepärast', 'Ilm oli soe, seepärast ujusime me.|Ilm oli soe, seepärast ujusime.'],
        ['Rand oli täis. Me leidsime koha.', 'aga', 'Rand oli täis, aga me leidsime koha.'],
        ['Me sõitsime lõpuks koju.', 'Lõpuks …', 'Lõpuks sõitsime me koju.|Lõpuks sõitsime koju.'],
        ['Me jäime koju. Ilm oli vihmane.', 'sest', 'Me jäime koju, sest ilm oli vihmane.'],
      ]),
      B.wordforms('095_d_a3', 'A3. Monoloog: varem.', 'Kirjuta tegusõna lihtminevikus.', [
        ['elama', 'ma (varem)', 'elasin'], ['töötama', 'ma (varem)', 'töötasin'], ['käima', 'me (varem)', 'käisime'],
        ['olema', 'see (varem)', 'oli'], ['minema', 'ta (varem)', 'läks'], ['tegema', 'me (varem)', 'tegime'],
      ]),
      B.choice('095_d_a4', 'A4. Dialoog: viisakas küsimus.', 'Vali olukorda sobiv lause.', [
        ['Tahad kohvikus maksta.', 'Kas ma saaksin arve?', 'Kas sa annad arve?', 'Arve on minu.'],
        ['Sa ei saanud aru.', 'Vabandust, kas te saaksite korrata?', 'Vabandust, ma kordan.', 'Jah, ma sain aru.'],
        ['Tahad teada hinda.', 'Kui palju see maksab?', 'Kui kaua see võtab?', 'Mis kell see on?'],
        ['Supp on otsas.', 'Siis võtan hoopis salati.', 'Siis võtan ka supi.', 'Aitäh, supp oli hea.'],
        ['Tahad teada, kui kaua parandus kestab.', 'Kui kaua see võtab?', 'Kui palju see maksab?', 'Kus see asub?'],
        ['Kell kolm ei sobi sulle.', 'Kas kell neli oleks võimalik?', 'Kell kolm sobib hästi.', 'Kas kell kolm on vaba?'],
      ], 'full', 'g_use'),
      B.errorfix('095_d_a5', 'A5. Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Me ei saame reedel tulla.', 'Me ei saa reedel tulla.'], ['Kas te saaksite mulle aidata?', 'Kas te saaksite mind aidata?'],
        ['Eile me sõidame Tartusse.', 'Eile sõitsime me Tartusse.|Eile me sõitsime Tartusse.|Eile sõitsime Tartusse.'], ['Mul on vaja uus telefon.', 'Mul on vaja uut telefoni.'],
        ['Mulle meeldib lugema.', 'Mulle meeldib lugeda.'], ['Tule meie juures külla!', 'Tule meile külla!|Tule meie juurde külla!'],
      ]),
      B.reading('095_d_read', 'Loe: Liisi kiri.', 'Loe kirja. Vasta küsimustele.', 'Tere, Sofia!', P(
        'Kirjutan sulle oma uuest tööst. Alates märtsist töötan ma raamatukogus. Raamatukogu asub kesklinnas, turu lähedal. See on vana kahekorruseline maja.',
        'Minu tööpäev algab kell üheksa. Kõigepealt vastan klientide kirjadele. Siis aitan lugejaid, kes otsivad raamatuid. Pärast lõunat loen lastele raamatuid ette. See meeldib mulle kõige rohkem, sest lapsed on väga rõõmsad.',
        'Varem töötasin ma poes. Seal oli palk parem, aga töö oli igav. Nüüd on mul huvitav töö ja toredad kolleegid. Mul on ka rohkem aega perele, sest ma ei tööta õhtuti.',
        'Kas sa tuled mulle järgmisel kuul külla? Siis näitan sulle raamatukogu!',
        'Kallistan, Liis',
      ), [
        ['Kus Liis praegu töötab?', 'raamatukogus'], ['Kus raamatukogu asub?', 'kesklinnas turu lähedal|kesklinnas'],
        ['Mida teeb Liis tööpäeva alguses?', 'vastab kirjadele|vastab klientide kirjadele'], ['Miks meeldib Liisile lastele lugeda?', 'lapsed on rõõmsad'],
        ['Mis oli eelmises töös hea ja mis halb?', 'palk oli parem, aga töö oli igav|parem palk, igav töö'], ['Miks on Liisil nüüd rohkem aega perele?', 'ta ei tööta õhtuti'],
      ]),
      B.notice('095_d_notice', 'Eksami meelespea', [
        '**Kirjutamine 1:** visiitkaardi järgi — kes, kus, millal, kontakt; vähemalt 25 sõna.',
        '**Kirjutamine 2:** sõnum või kutse VÕI kirjeldus 3 punkti järgi; vähemalt 30 sõna.',
        '**Rääkimine:** tutvumine → pildi kirjeldus ja küsimused → ideekaart: küsi ja vasta.',
        '**Kuulamine:** tekst kaks korda; vasta 1–2 sõnaga.',
        '**Lugemine:** viisakad fraasid, sildid, teated, tekst ~150 sõna, lünkadega kiri.',
      ], 'full'),
      B.categorize('095_d_sort', 'Mis osa see on?', 'Pane ülesanded eksami osadesse.', [
        ['Kirjutamine', ['info visiitkaardilt', 'sõnum või kutse', 'kirjeldus']], ['Rääkimine', ['tutvumine', 'pildi kirjeldus', 'ideekaart']],
        ['Kuulamine', ['vastus 1–2 sõnaga', 'teade raadios']], ['Lugemine', ['viisakad fraasid', 'sildid', 'lünkadega kiri']],
      ]),
      B.wordorder('095_d_order', 'Pane lause kokku.', 'Kirjuta sõnad õiges järjekorras.', ['Kahjuks ma ei saa homme tulla.', 'Siis läksime me randa.', 'Varem elasin ma Pärnus.', 'Kas ma saaksin arve?', 'Kokkuvõtteks: mulle meeldib siin.']),
      B.translation('095_d_tr', 'Tõlgi.', 'Kirjuta eesti keeles.', ['Приходи ко мне в субботу!', 'Потом мы пошли в кафе.', 'Раньше я жил в Нарве.', 'Не могли бы вы повторить?', 'Тогда я возьму маленькую пачку.']),
      B.dictation('095_d_dict', 'Etteütlus.', 'Kuula ja kirjuta laused.', ['Tere, Anna!', 'Kahjuks ma ei saa reedel tulla.', 'Mul on tööl koosolek.', 'Kas laupäev sobib sulle?', 'Kohtume kell kuus kohviku ees.', 'Ootan vastust!']),
      B.writing('095_d_write', 'Proovi: minu nädalavahetus.', 'Kirjuta 4–6 lauset: kus olid, mida tegid, mis meeldis.', [4, 6], ['laupäeval', 'kõigepealt', 'siis', 'sest'], 2),
      B.speaking('095_d_intro2', 'Proovi: tutvumine.', 'Vasta paarilise küsimustele nagu eksami alguses.', ['Mis su nimi on?', 'Kus sa elad ja kellega?', 'Mida sa teed tööl või koolis?', 'Mida sa eelmisel nädalavahetusel tegid?'], [45, 60]),
    ],
    practice: [
      B.tip('095_p_how', 'Lugemine ja kuulamine (eksami vormis)', 'See osa on nagu Harno A2 eksam: viis lugemisülesannet ja kaks kuulamisülesannet. Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda.', 'full'),
      B.choice('095_p_polite', 'Lugemine 1. Mida öelda?', 'Vali igasse olukorda sobiv lause.', [
        ['Sõbral on sünnipäev.', 'Palju õnne!', 'Head isu!', 'Jõudu tööle!'], ['Kolleeg läheb puhkusele.', 'Head puhkust!', 'Head paranemist!', 'Tere tulemast!'],
        ['Sa astusid kogemata kellegi jalale.', 'Vabandust!', 'Pole viga!', 'Terviseks!'], ['Keegi ütleb sulle: „Aitäh!”', 'Pole tänu väärt!', 'Palju õnne!', 'Head aega!'],
        ['Sõber on haige.', 'Saa ruttu terveks!', 'Head reisi!', 'Kohtumiseni!'], ['Külaline tuleb sinu koju.', 'Tere tulemast!', 'Head teed!', 'Head ööd!'],
      ]),
      B.reading('095_p_three', 'Lugemine 2. Kolm teadet.', 'Loe teateid. Vasta teate tähega (A, B, C) või lühidalt.', 'Kuulutused', P(
        'A. Kohvik „Mesi” otsib teenindajat. Töö on kolm päeva nädalas, ka laupäeviti. Kogemus ei ole vajalik, me õpetame. Vajalik on eesti keel A2 tasemel ja sõbralik iseloom. Palk on 9 eurot tunnis. Saada oma CV 20. maiks: info@kohvikmesi.ee.',
        'B. Linnaraamatukogu kutsub! Igal kolmapäeval kell 18 toimub raamatukogus eesti keele vestlusklubi. Räägime lihtsas keeles tööst, perest, reisidest ja toidust. Klubi on tasuta ja registreerida ei ole vaja. Sel kuul räägime kevadest ja aiatöödest. Kohtumiseni teisel korrusel!',
        'C. Head maja elanikud! Esmaspäeval, 12. mail, vahetatakse majas veetorusid. Kella üheksast kolmeni ei ole korterites vett. Palun varuge vett eelmisel õhtul. Kui teil on küsimusi, helistage majahaldurile Ants Tammele. Vabandame! Korteriühistu',
      ), [
        ['Kus saab tasuta eesti keelt rääkida?', 'B'], ['Kus otsitakse töötajat?', 'A'], ['Millal ei ole majas vett?', 'esmaspäeval|12. mail|kella 9–15'],
        ['Kellele helistada, kui on küsimusi vee kohta?', 'majahaldurile|Ants Tammele'], ['Mida peab töö soovija tegema 20. maiks?', 'saatma CV|saada CV'],
        ['Mis teemal räägitakse sel kuul klubis?', 'kevadest ja aiatöödest|kevad|aiatööd'],
      ]),
      B.match('095_p_signs', 'Lugemine 3. Mida silt tähendab?', 'Ühenda silt ja selle tähendus.', [
        ['Ainult töötajatele', 'Kliendid siia sisse minna ei tohi.'], ['Avatud 24 h', 'Siin saab käia ka öösel.'], ['Värvitud!', 'Ära puuduta, see on veel märg.'],
        ['Tasuta parkimine 2 h', 'Kaks tundi ei pea parkimise eest maksma.'], ['Hoida külmkapis', 'Toode peab olema külmas.'], ['Mitte segada', 'Palun ära koputa ega tule sisse.'],
      ], 'full', 'g_read'),
      B.reading('095_p_read', 'Lugemine 4. Markuse uus hobi.', 'Loe tekst. Vasta lühidalt.', 'Markuse uus hobi', P(
        'Markus töötab laos. Ta tõstab terve päeva raskeid kaste. Eelmisel aastal hakkas tal selg valutama. Arst ütles, et Markus peab selga tugevdama ja vabal ajal rohkem liikuma.',
        'Markus ei tahtnud jõusaali minna, sest see on tema arvates igav. Siis kutsus naaber Viktor ta matkama. Esimene matk oli raske. Nad kõndisid metsas kümme kilomeetrit ja Markus oli väga väsinud. Aga loodus oli ilus ja õhk oli värske.',
        'Nüüd matkavad Markus ja Viktor igal laupäeval. Talvel kõnnivad nad lühemalt, suvel pikemalt. Vahel tulevad kaasa ka Markuse naine ja poeg. Seljakotis on alati vesi, võileivad ja kaart. Pärast matka joovad nad tavaliselt kohvikus kuuma teed.',
        'Markuse selg enam ei valuta. Ta magab paremini ja tal on rohkem energiat. Järgmisel suvel tahab ta matkata Lõuna-Eestis. Seal on palju järvi ja ilusaid metsi. Viktor on teekonna juba planeerinud. Markus ütleb, et matkamine on tema parim otsus.',
      ), [
        ['Miks hakkas Markuse selg valutama?', 'ta tõstab raskeid kaste|ta tõstab terve päeva raskeid kaste|raskete kastide pärast'], ['Miks ei tahtnud Markus jõusaali minna?', 'see on igav|jõusaal on igav'],
        ['Mis on Markuse seljakotis alati?', 'vesi, võileivad ja kaart'], ['Kuidas on matkamine Markust aidanud?', 'selg ei valuta|ta magab paremini|tal on rohkem energiat'],
        ['Kuhu tahab Markus järgmisel suvel minna?', 'Lõuna-Eestisse|matkama Lõuna-Eestisse'],
      ]),
      B.choice('095_p_readmc', 'Lugemine 4. Vali õige vastus.', 'Loe teksti uuesti. Vali üks vastus.', [
        ['Kui pikk oli esimene matk?', '10 kilomeetrit', '5 kilomeetrit', '20 kilomeetrit'], ['Millal matkavad mehed?', 'igal laupäeval', 'igal pühapäeval', 'ainult suvel'],
        ['Kes tulevad vahel kaasa?', 'Markuse naine ja poeg', 'Viktori naine ja poeg', 'Markuse kolleegid'],
        ['Mida teevad nad pärast matka?', 'joovad kohvikus teed', 'lähevad jõusaali', 'sõidavad Lõuna-Eestisse'], ['Kes planeeris järgmise suve matka?', 'Viktor', 'Markus', 'Markuse naine'],
      ]),
      B.cloze('095_p_cloze', 'Lugemine 5. Kiri sõbrannale.', 'Vali igasse lünka sobiv sõna.', 'Tere, Sofia!', [
        'Aitäh sinu kirja {*eest|eesse|ees}! Mul läheb hästi. Eelmisel nädalal {*käisin|käin|käima} ma Tartus kursusel. Kursus oli väga huvitav, {*sest|aga|kui} õpetaja rääkis palju praktilisi asju.',
        'Laupäeval on minu {*sünnipäev|sünnipäeval|sünnipäeva}. Ma tahan sind külla {*kutsuda|kutsuma|kutsun}. Pidu algab kell kuus {*minu juures|minu juurde|minu juurest}. Kui sa ei saa tulla, palun {*kirjuta|kirjutab|kirjutama} mulle reedeks.',
        'Võta kaasa ka oma sõbranna. Ootan teid {*väga|palju|suur}!',
        'Kallistan, Anna',
      ]),
      B.listening('095_p_listen', 'Kuulamine 1. Teated kultuurimajas.', 'Õpetaja loeb teated kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tere, head külalised! Siin on kultuurimaja teated järgmiseks nädalaks.', 'Esmaspäeval on maja suletud, sest meil on remont.',
        'Teisipäeval kell seitse toimub kontsert. Esineb laste koor. Pilet maksab viis eurot.', 'Kolmapäeval algab uus tantsukursus. Kursus on täiskasvanutele ja kestab kaks kuud.',
        'Registreerida saab kassas või meie kodulehel.', 'Reedel on suures saalis filmiõhtu. Film on eesti keeles, aga subtiitrid on inglise keeles.',
        'Laupäeval on maja ees käsitöölaat kella kümnest kaheni. Tulge kindlasti!', 'Kultuurimaja kohvik on avatud iga päev kella üheteistkümnest kuueni. Aitäh ja head nädalat!',
      ], [
        'Esmaspäeval on maja kinni, sest on [remont].', 'Teisipäeval laulab laste [koor].', 'Kontserdi pilet maksab [viis eurot|5 eurot|5].', 'Tantsukursus kestab [kaks kuud|2 kuud].',
        'Kursusele saab registreerida kassas või [kodulehel|internetis].', 'Filmi subtiitrid on [inglise keeles|inglise].', 'Laat on maja [ees].',
      ]),
      B.listening('095_p_listen2', 'Kuulamine 2. Kõne juuksurisse.', 'Õpetaja loeb vestluse kaks korda. Kirjuta lünka 1–2 sõna.', [
        '— Juuksur „Kamm”, tere!', '— Tere! Siin Liis Tamm. Ma tahaksin aega juukselõikusele.', '— Mis päeval teile sobib?', '— Neljapäeval pärast tööd, umbes kell viis.',
        '— Neljapäeval kell viis on kahjuks kinni. Kas kell kuus sobib?', '— Kell kuus on natuke hilja. Mul on siis trenn. Kas reedel on midagi?',
        '— Reedel on vaba aeg kell neli.', '— Reede kell neli sobib hästi. Kui palju lõikus maksab?', '— Lühikeste juuste lõikus maksab kakskümmend viis eurot.',
        '— Kas ma saan maksta kaardiga?', '— Jah, muidugi. Meie salong on Pikal tänaval, apteegi kõrval.', '— Aitäh! Siis kohtumiseni reedel!',
      ], [
        'Liis tahab aega [juukselõikusele|lõikusele].', 'Neljapäeval kell kuus on Liisil [trenn].', 'Uus aeg on reedel kell [neli|4|16].',
        'Lõikus maksab [kakskümmend viis eurot|25 eurot|25].', 'Liis maksab [kaardiga].', 'Salong on apteegi [kõrval].',
      ]),
      B.gaps('095_p_mix', 'Keeleosa. Kirjuta õige vorm.', 'Kirjuta sulgudes olev sõna õiges vormis.', [
        'Kohtume [laupäeval] (laupäev) kell kuus.', 'Palun vasta [reedeks] (reede).', 'Tule pärast tööd [minu juurde] (mina, juures/juurde).',
        'Eile [käisin] (käima) ma raamatukogus.', 'Kas ma [saaksin] (saama, viisakalt) arve?', 'Mul on vaja [uut] (uus) telefoni.',
      ]),
      B.errorfix('095_p_fix', 'Keeleosa. Paranda viga.', 'Kirjuta lause õigesti.', [
        ['Ma ei saan homme tulla.', 'Ma ei saa homme tulla.'], ['Pärast seda me läheme koju eile.', 'Pärast seda läksime me koju.|Pärast seda me läksime koju.'],
        ['Mulle meeldib matkama.', 'Mulle meeldib matkata.'], ['Mul on vaja arst.', 'Mul on vaja arsti.'], ['Kohtume kino ette.', 'Kohtume kino ees.'],
      ]),
      B.transformation('095_p_trans', 'Keeleosa. Ütle teisiti.', 'Kirjuta lause antud sõnaga.', [
        ['Ma ei tule. Ma olen haige.', 'sest', 'Ma ei tule, sest ma olen haige.|Ma ei tule, sest olen haige.'],
        ['Ma elan Tartus.', 'Varem … (Pärnu)', 'Varem elasin ma Pärnus.|Varem elasin Pärnus.'],
        ['Anna mulle arve!', 'Kas ma saaksin …?', 'Kas ma saaksin arve?'],
        ['Me sõime. Me läksime jalutama.', 'Siis …', 'Me sõime. Siis läksime jalutama.|Me sõime, siis läksime jalutama.'],
        ['Pidu on laupäeval.', 'Kahjuks … ära.', 'Kahjuks jääb pidu laupäeval ära.'],
      ]),
      B.speaking('095_p_say', 'Räägi kuuldust.', 'Räägi paarilisele, kuidas Liis juuksuri aja sai.', ['Mida Liis tahtis?', 'Miks neljapäev ei sobinud?', 'Mis on uus aeg?', 'Kus salong on?'], [45, 60], ['Liis tahtis…', 'Neljapäev ei sobinud, sest…', 'Uus aeg on…']),
    ],
    transfer: [
      B.text('095_t_situation', 'Kirjutamine ja rääkimine (eksami vormis)', 'See osa on nagu Harno A2 eksami kirjutamise ja rääkimise osa. Kirjuta ilma sõnaraamatuta. Rääkimine on paaris, nagu eksamil. Õpetaja hindab iga ülesannet kolme kriteeriumi järgi.'),
      B.notice('095_t_card', 'Visiitkaart', ['**Rattaparandus „Ratas”** — jalgrataste parandus ja hooldus', 'Kalda 3, Tartu (kaubanduskeskuse taga)', 'Avatud: E–R 10–18, L 10–14', 'Telefon: 5567 1234, e-post: info@ratas.ee'], 'full', 'g_read'),
      B.letter('095_t_info', 'Kirjutamine 1. Soovita töökoda.', 'Sõbra jalgratas on katki. Kirjuta: mis koht, kus, millal avatud, kontakt.', 'Tere, Kati!', 'Edu!', [25, 40]),
      B.planning('095_t_plan', 'Enne kirjutamist 2.', 'Vali valik A või B. Kirjuta märksõnad.', ['A: kes, mida, millal, kus?', 'A: miks ja mida sõber peab tegema?', 'B: kus olid ja kellega?', 'B: mida tegid ja mis meeldis?']),
      B.letter('095_t_letter', 'Kirjutamine 2, valik A. Kutse.', 'Kutsu sõber laupäeval matkama. Kirjuta: kuhu, mis kell, mida kaasa võtta.', 'Tere, Viktor!', 'Ootan vastust!', [30, 50]),
      B.writing('095_t_text', 'Kirjutamine 2, valik B. Minu nädalavahetus.', 'Kirjuta 5–7 lauset: kus olid, mida tegid, mis meeldis.', [5, 7], ['kõigepealt', 'siis', 'sest', 'aga'], 3),
      B.table('095_t_form', 'Täida kursuse ankeet.', 'Kirjuta oma andmed.', 'Andmed, Sinu vastus', ['Ees- ja perekonnanimi | ', 'Elukoht | ', 'Telefon või e-post | ', 'Millal sul on aega õppida? | ', 'Miks sa eesti keelt õpid? | ']),
      B.speaking('095_t_intro', 'Rääkimine. Tutvumine.', 'Vasta õpetaja küsimustele nagu eksami alguses.', ['Mis su nimi on?', 'Kus sa elad ja kellega?', 'Mida sa teed tööl või koolis?', 'Mida sa sel nädalal tegid?'], [45, 60]),
      B.speaking('095_t_picture', 'Rääkimine 1. Kirjelda pilti.', 'Õpetaja annab pildi: kohvik, pood või park. Kirjelda 1 minut.', ['Kes on pildil?', 'Kus nad on?', 'Mida nad teevad?', 'Mis aastaaeg või kellaaeg võiks olla?'], [60, 90], ['Pildil on…', 'Vasakul / paremal…', 'Nad…']),
      B.speaking('095_t_mono', 'Rääkimine 1. Teemaleht.', 'Räägi pildi teemal 1,5–2 minutit. Siis vasta küsimustele.', ['Kas sa käid tihti kohvikus või pargis?', 'Mida sa seal tavaliselt teed?', 'Mida sa tegid seal viimati?', 'Miks see koht sulle meeldib või ei meeldi?'], [90, 120]),
      B.rolecards('095_t_s1', 'Rääkimine 2. Ideekaart „Pood ja ostud”.', 'A küsib kaardi märksõnade järgi, B vastab. Siis vahetage.',
        'Küsi 5 küsimust märksõnade järgi: kus, kui tihti, mida, viimane ost, kas sularaha või kaart.', 'Vasta igale küsimusele 2–3 lausega. Ütle ka üks detail.',
        ['Kus sa tavaliselt poes käid?', 'Mida sa viimati ostsid?', 'Kas maksad kaardiga?'], ['Tavaliselt käin…', 'Eelmisel nädalal ostsin…', 'Ma maksan…, sest…']),
      B.rolecards('095_t_s2', 'Rääkimine 2. Olukord „Teenindus”.', 'Nüüd on B klient ja A teenindaja.',
        'Oled kohviku teenindaja. Üks roog on otsas. Paku midagi muud ja too arve.', 'Oled klient. Telli toit, küsi, kui kaua see võtab, ja reageeri muutusele.',
        ['Mida te soovite?', 'Kahjuks… on otsas.', 'Kas võtate hoopis…?'], ['Ma võtan…', 'Kui kaua see võtab?', 'Siis võtan hoopis…']),
      B.rubric('095_t_rubric', 'Hindamine (õpetaja).', 'Iga ülesanne: 3 kriteeriumi × 0–2 punkti.', ['Ülesande täitmine (0–2): kõik punktid on olemas.', 'Arusaadavus ja seotus (0–2): ja, aga, sest, siis.', 'Keel (0–2): vead ei sega mõistmist.', 'Kokku 70% ja rohkem: oskan. 50–69%: harjutan. Alla 50%: kordame.']),
      B.selfcheck('095_t_self', ['Ma oskan kasutada mooduli väljendeid ilma abita: sõnumi algus ja lõpp, seossõnad, viisakad küsimused.', 'Ma oskan leida visiitkaardilt info ja kirjutada selle põhjal sõbrale.', 'Ma oskan kirjutada aega, kohta ja minevikku õiges vormis.', 'Ma oskan kirjutada sõnumi või kirjelduse, rääkida 1,5–2 minutit ja lahendada dialoogi.'], 'Moodul 19 on tehtud'),
    ],
  },
};
