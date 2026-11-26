// A2 course (A1 → A2 roadmap), module 8 „Teenused ja asjaajamine” (a2-036…040), stage A2- (lessons 021–050).
// Methodology v5 for A2 (docs/METHODOLOGY_A2_V5.md) AND methodology v6 (docs/METHODOLOGY_V6.md, gates G14–G25), in the
// pattern of A2 modules 5–7:
//   - every teaching lesson: ≤ 14 blocks (≤ 5 / 4 / 5) in a 60-minute lesson; one input; one learning picture on the page of
//     its task (art/visuals/a2-module-08.js); a 5-minute pronunciation corner (data.pronunciation: 036 välted — the strong
//     partitive against the weak genitive, tundi / tunni, kahte / kahe; 037 intonatsioon — question, rule or ban; 038 the
//     dictation of instructions + varjutamine; 039 vokaalid õ / ü / ä); the rule box („Märka”, bold forms, one „Vene keeles …
//     — eesti keeles …” line) is produced by the Harjuta form task, whose hints are the dictionary form, a clock time or the
//     other form of the pair (oodata → ootama), never the answer;
//   - Kasuta in the standard order: (situation →) main task (data.taskType, data.support = „Abikaart”, data.stretch =
//     „Lisaväljakutse”) → home task (homeTask, always „Harjuta → moodul 8”) → exit check (exitCheck: 30 s of speech after
//     a speaking main task, one rewritten line after a writing main task) beside the self-check (three success criteria
//     0–1–2 + one own sentence, data.evidence);
//   - main-task types rotate and take the types modules 5–7 used only once: 036 survey (three people's free times → a
//     booking message to the library), 037 project (a pair's guide „rules of our school” for a new learner, another pair
//     answers: data.peerReply), 038 presentation (four steps to a family doctor, told to a new neighbour in the teie form),
//     039 ranking — a decision (a phone package for three people under a budget);
//   - spaced retrieval: every vocab block carries data.review (3 words from 3–15 lessons back, used again in the lesson);
//   - real network: 036's home task is a real library's page (title + URL), 037's guide goes to a new learner and another
//     pair answers it, 038's home task is the media log („Minu eesti keele võrgustik”, a real instruction page), 038's main
//     addressee is a neighbour, 039's call has the module's HIDDEN INFORMATION card (G9);
//   - Harno A2 exam corners spread over the module (COURSE_FINAL_SHAPE_A2.md, finalShape.js profile a2): 036 R5 (a letter
//     with 3-option gaps), 037 W2b (the main task: a description with three prompts), 038 S2 (one asks, the other answers),
//     039 R4 (the input, ≈ 120 words); the control tags R1, R4, L3, W2a, S2;
//   - a teacher page per lesson (lesson.teacherPage); until the A2 sheet renders it, the same plan stands in the teacher
//     note of the lesson's „Mäletad?” block.
//   036 PROJ R→W  „Kas teile sobib kolmapäeval?” — a library's services page (reading). mulle / teile sobib, enne + partitive
//                 (enne kella kümmet, enne lõunat), pärast + partitive (pärast kella kahte, pärast tööd), varem / hiljem; the
//                 module's COLD TASK („Proovi kohe: broneeri aeg” without help, its parallel is the control's speaking 1);
//                 the R5 corner; main: a survey — three people's free times against the library's week in the picture,
//                 then a 25–40-word booking message (its parallel is the control's writing).
//   037 KIRJ L→W  „Siin ei tohi süüa” — a guard explains the rules of a service office (listening). pean + ma (pean ootama,
//                 ei pea tooma), võin / saan / tohin + da (võib oodata, saab maksta, ei tohi süüa); the infodesk pair task;
//                 Kasuta opens with the office's signs in the picture (the rules → our school's rules, the plan of the
//                 guide); main and W2b corner: a pair's 30–45-word guide for a new learner, answered by another pair.
//   038 RÄÄK L→S  „Täitke vorm, palun” — a family doctor's registrar gives instructions (listening). The teie-imperative
//                 (täitke, kirjutage, võtke, tulge, tooge, andke) and the ban (ärge unustage); the dictation of
//                 instructions (5 sentences) + varjutamine; the S2 corner; main: a presentation — the four steps of the
//                 picture told to a new neighbour; home: the media log with a real instruction page.
//   039 LUGE R→S  „Klienditeenindus, tere!” — a phone company's notice of three packages (reading, the R4 corner). tahan /
//                 soovin + da (tahan muuta, soovin lõpetada) against lähen / tulen / hakkan + ma (lähen küsima, tuleb
//                 parandama, hakkan maksma); the call to customer service with HIDDEN INFORMATION and the e-mail to the firm —
//                 the module's last teaching lesson: one speech and one text without ready phrases or a given opening (G9);
//                 main: a decision — the pair chooses three packages for three people within 45 €, then orders them by
//                 e-mail.
//   040 EKS       Control 8 (one sheet, 9 blocks, 45 min): reading, listening, writing, speaking 10 points each; raw points,
//                 the Harno scale (× 2), the thresholds named one way, „ükski osa ei tohi olla 0 punkti”; 4 of the 20 closed
//                 items recycle modules 4–7 (teacher note „Varasemast”); writing parallel to 036's booking message, speaking 1
//                 parallel to 036's cold task. 040 closes the first 40 lessons: A2_CURRICULUM_100.md makes every fifth lesson
//                 a formative checkpoint and METHODOLOGY_A2_V5.md §5 keeps mock exams for 097, 099 and 100, so 040 is a
//                 module control (no mock) whose result table also compares with the a2-001 placement diagnostic.
// No lesson uses the continuing story's cast (G7). Dictation: one, in 038 (5 sentences). Texts are learning texts, the
// people and places are invented (Rita, Olga, Rein, Piret, perearstikeskus Pärn, telefonifirma Kõne …); real pages are named
// only by title and URL. The final-shape module (2026-10-29, one storyline with Sofia, Malle, Kristi, Ene …) is kept below as
// OLD: every old block keeps its id and comes back hidden (retire), so learners' saved answers keep their key and Harjuta
// still draws on the old form tasks.
import { B, hide, tag, teach, withShapes } from '../blocks.js';
import { exitCheck, homeTask } from '../stationBlocks.js';

export const MODULE = { id: 'a2-module-08', course: 'a2', title: 'Teenused ja asjaajamine', level: 'A2', design: 'v2', template: 'v4' };

// one line for every block taken off the sheets by the v5 / v6 rewrite
const V6_CUT = 'v5+v6 (2026-11-26): lehelt maha — tunni eelarve (60 min), üks sisend, loo tegelased mitte, uus tunni ülesanne';
// a recording is heard twice (methodV5.js G6); in the control the player is locked
const twice = (block, lock = false) => ({ ...block, data: { ...block.data, plays: 2, ...(lock ? { lockPlays: true } : {}) } });
// a block beside another one on the page (two columns)
const half = (block) => ({ ...block, width: 'half', span: 6 });
// more fields on a block (v6 markers: taskType, support, stretch, review, pronunciation, peerReply, mediaLog, hiddenInfo)
const v6 = (block, data) => ({ ...block, data: { ...block.data, ...data } });
// the self-check of v6 (G24): the main task's three success criteria rated 0–1–2 and one own sentence as evidence
const selfcheck = (id, criteria, stamp) => {
  const b = B.selfcheck(id, criteria, stamp, 'Kuidas mul läks?');
  return { ...b, data: { ...b.data, instruction: 'Hinda iga rida: 0, 1 või 2. Kirjuta üks oma lause.', criteria, scale: [0, 1, 2], evidence: true } };
};
// a check is one sheet with its own label (no „Avasta” subtitle)
const checkSheet = (label, subtitle) => ({ discover: { label, slot: 1, subtitle } });
// the thresholds, named one way everywhere (METHODOLOGY_A2_V5.md §2.9)
const THRESHOLDS = 'Harno: eksam on sooritatud alates 60 %-st ja ükski osa ei tohi olla 0 punkti. KeeleSepp: eksamiks valmis alates 70 %-st, meie sertifikaat alates 80 %-st (sisemine lävi, et eksamil oleks varu).';
// the teacher's plan of a lesson, shown today in the teacher note of its first block (A2 sheets do not render
// lesson.teacherPage yet; METHODOLOGY_V6.md §2 i)
const planNote = (p) => [
  `Õpetaja leht. Eesmärk: ${p.goal}`,
  `Põhitee (60 min): ${p.core}`,
  `Lühike tee (45 min): ${p.short}`,
  `Alternatiiv: ${p.alt}`,
  `Kui aega jääb: ${p.extra}`,
  `Tüüpvead: ${p.errors.join(' · ')}`,
].join('\n');
// the old blocks the new lesson does not reuse come back hidden, in their old phase
const PHASES = ['discover', 'practice', 'transfer'];
function retire(old, lesson) {
  const used = new Set(PHASES.flatMap((p) => (lesson[p] || []).map((b) => b.id)));
  const out = { ...lesson };
  PHASES.forEach((p) => { out[p] = [...(lesson[p] || []), ...(old[p] || []).filter((b) => !used.has(b.id)).map((b) => hide(b, V6_CUT))]; });
  return out;
}

// ---------------------------------------------------------------- the final-shape module (2026-10-29, one storyline): every
// block stays here with its id; the v6 lessons below take what they reuse and hide the rest (retire).
const OLD = {
  'a2-036': {
    title: 'Aja broneerimine',
    canDo: 'Ma loen panga infot, broneerin telefonis aja, muudan seda ja kirjutan pangale 50–70-sõnalise e-kirja uue aja kohta.',
    discover: [
      B.review('036_d_review', [['Mida sa ütled poes, kui tahad katkist asja tagastada?', 'a2-034'], ['Kui palju maksavad Pannis kohv ja kook koos?', 'a2-029'], 'Mis kell sinu lähim pank või postkontor avatakse?']),
      B.text('036_d_goal', 'Moodul 8: teenused ja asjaajamine', 'Sofia elab Tallinnas juba kaks kuud. Järgmisel esmaspäeval on tal esimene tööintervjuu. Enne seda on vaja palju asju ajada: pank, ID-kaart, raamatukogu, perearst ja telefon. Selles moodulis broneerid aega ja muudad seda. Sa loed reegleid, täidad vorme ja helistad klienditeenindusse. Mooduli lõpus lahendad oma asja telefonis ja kirjutad teenindusele.'),
      tag(B.reading('036_d_list', 'Sofia nimekiri.', 'Enne lugemist arva: mis asju Sofia peab ajama? Siis loe ja vasta lühidalt.', 'Minu asjad',
        'Esmaspäeva hommik. Mul on palju asju ajada. Ma kirjutan nimekirja, muidu ma unustan midagi.\n\nKõigepealt on mul vaja pangakontot. Ilma kontota on raske Mallele üüri maksta. Iga kuu pean ma automaadist sularaha võtma. See maksab iga kord kaks eurot! Pank on Akadeemia teel, bussipeatuse lähedal.\n\nTeiseks vajan ma ID-kaarti. Vana kaart on kahjuks kadunud. Aja teenindusse broneerin ma internetis.\n\nMalle töötab kaks päeva nädalas raamatukogus. Ta ütleb, et lugejakaart on tasuta. Raamatukogus on palju eesti keele õpikuid. Raamatukogu kõrval on perearstikeskus. Mul on vaja ka perearsti.\n\nMinu SIM-kaart on välismaalt. Kõned on väga kallid. Eelmisel kuul maksin ma telefoni eest nelikümmend eurot. Grete ütleb, et poes Kõne on odavad paketid.\n\nJärgmisel esmaspäeval on mul esimene tööintervjuu! See on ühes logistikafirmas. Enne seda tahan ma juuksurisse minna.\n\nPalju tööd! Aga kõigepealt helistan ma panka.',
        [['Miks on Sofial vaja pangakontot?', 'et maksta Mallele üüri|ilma kontota on raske üüri maksta|üüri maksmiseks'], ['Kui palju maksab sularaha võtmine automaadist?', 'kaks eurot|2 eurot'], ['Kus broneerib Sofia aja teenindusse?', 'internetis'], ['Kui palju maksab lugejakaart?', 'see on tasuta|tasuta'], ['Miks tahab Sofia uut SIM-kaarti?', 'kõned on väga kallid|sest kõned on kallid|kõned on kallid'], ['Mis on Sofial järgmisel esmaspäeval?', 'tööintervjuu|esimene tööintervjuu'], ['Kuhu helistab Sofia kõigepealt?', 'panka']]), { task: 'R15' }),
      tag(B.listening('036_d_call', 'Sofia helistab panka.', 'Sofia broneerib aega. Kuula kaks korda ja kirjuta lünka aeg, number või sõna.', [
        'Kristi: Linna Pank, tere! Kristi kuuleb.',
        'Sofia: Tere! Ma soovin aega konsultandi juurde. Ma tahan avada pangakonto.',
        'Kristi: Selge. Kas teile sobib kolmapäeval kell kümme?',
        'Sofia: Kahjuks mitte. Hommikul olen ma keelekoolis.',
        'Sofia: Kas on võimalik tulla hiljem? Näiteks pärast kella kahte?',
        'Kristi: Jah. Kolmapäeval kell pool kolm on vaba.',
        'Sofia: Väga hea. Mida ma pean kaasa võtma?',
        'Kristi: Palun võtke kaasa pass või ID-kaart.',
        'Sofia: Kas konto avamine maksab midagi?',
        'Kristi: Ei, konto avamine on tasuta. Pangakaart maksab kaks eurot kuus.',
        'Kristi: Mis on teie nimi ja telefoninumber?',
        'Sofia: Sofia Mets, 5341 2268.',
        'Kristi: Aitäh! Kinnitan: kolmapäeval kell pool kolm. Saadame teile ka sõnumi.',
      ], ['Esimene aeg, mida Kristi pakub, on kolmapäeval kell [kümme|10].', 'Hommikul ei saa Sofia tulla, sest ta on [keelekoolis].', 'Sofia saab tulla pärast kella [kahte|2].', 'Sofia uus aeg on kolmapäeval kell [pool kolm|14.30].', 'Panka tuleb kaasa võtta pass või [ID-kaart].', 'Konto avamine maksab [null|0] eurot, see on tasuta.', 'Pangakaardi eest maksab Sofia [kaks|2] eurot kuus.', 'Sofia telefoninumber on 5341 [2268].']), { task: 'L10' }),
      B.notice('036_d_notice', 'Märka: kuidas aega küsida', [
        'Klient: **Soovin aega** konsultandi juurde / juuksurisse / arsti juurde.',
        'Klient: **Kas teil on** kolmapäeval **vaba aega**?',
        'Teenindaja: **Kas teile sobib** kolmapäeval kell kümme? · Kas kell kümme **sobib**?',
        'Klient: **Kas on võimalik** tulla **varem / hiljem**?',
        'Päev ja kell: **kolmapäeval** kell pool kolm · **järgmisel nädalal** · **pärast kella** kahte',
        'Lõpus: **Kinnitan**: kolmapäeval kell pool kolm. · Ma pean aega **muutma**.',
      ], 'full'),
      B.categorize('036_d_sort', 'Mida lause teeb?', 'Mõtle telefonikõnele. Pane iga lause õigesse rühma.', [
        ['klient küsib aega', ['Soovin aega konsultandi juurde.', 'Kas teil on reedel vaba aega?', 'Kas on võimalik tulla hiljem?', 'Mida ma pean kaasa võtma?']],
        ['teenindaja pakub aega', ['Kas teile sobib kolmapäeval?', 'Kell pool kolm on vaba.', 'Reede on kahjuks kinni.', 'Meil on vaba aeg kell kümme.']],
        ['kinnitamine või muutmine', ['Kinnitan: kolmapäeval kell pool kolm.', 'Saadame teile ka sõnumi.', 'Ma pean aega muutma.', 'Ma tahan aja tühistada.']],
      ], 'full', 'g_vocab'),
      B.choice('036_d_phrases', 'Mida sa ütled?', 'Sa räägid pangaga. Mis lause sobib olukorda?', [
        ['Sa tahad panka aega. Mida sa ütled?', 'Soovin aega konsultandi juurde.', 'Soovin pangas töötada.', 'Kas pank on kinni?'],
        ['Pakutud aeg on liiga vara. Mida sa küsid?', 'Kas on võimalik tulla hiljem?', 'Kas on võimalik tulla varem?', 'Kas teil on aega?'],
        ['Sa ei tea, kas reedel on aega. Mida sa küsid?', 'Kas teil on reedel vaba aega?', 'Kas te olete reedel?', 'Kas reede on eile?'],
        ['Teenindaja pakub kolmapäeva. See sobib sulle.', 'Jah, kolmapäev sobib mulle hästi.', 'Ei, kolmapäev on kinni.', 'Jah, ma olen kinni.'],
        ['Sa tahad teada, mida panka kaasa võtta.', 'Mida ma pean kaasa võtma?', 'Mida te kaasa võtate?', 'Kas ma võtan teid kaasa?'],
        ['Sa tahad teada teenuse hinda.', 'Kui palju see teenus maksab?', 'Kui kaua see kestab?', 'Kus see asub?'],
        ['Sa ei saa tulla ja tahad aja ära jätta.', 'Ma tahan oma aja tühistada.', 'Ma tahan aja kinnitada.', 'Ma tahan aega broneerida.'],
        ['Teenindaja ütleb aja. Sa kordad selle üle.', 'Kinnitan: kolmapäeval kell pool kolm.', 'Kolmapäev on halb päev.', 'Kas te tulete kolmapäeval?'],
      ], 'full', 'g_vocab'),
      tag(B.vocab('036_d_vocab', 'Tunni sõnad.', ['aeg — время / приём', 'vaba — свободный', 'kinni — занято', 'sobima — подходить', 'varem — раньше', 'hiljem — позже', 'kinnitama — подтверждать', 'muutma — изменять', 'kalender — календарь', 'pangakaart — банковская карта', 'ID-kaart — ID-карта']), { topic: ['kinnitama'] }),
      teach(tag(B.speaking('036_d_survey', 'Küsitlus: kuhu sa aega broneerid?', 'Küsi kolmelt inimeselt samad küsimused. Kes broneerib aega kõige sagedamini?', ['Kuhu sa viimati aega broneerisid?', 'Kas sa helistasid või broneerisid internetis?', 'Mis päeval ja mis kell sul aeg oli?', 'Kas esimene aeg sobis? Miks mitte?', 'Kas sa pidid aega muutma?'], [60, 120], ['Ma broneerisin aega …', 'Esimene aeg ei sobinud, sest …', 'Mul oli aeg … kell …']), { task: 'S09', fluency: true }),
        'Üks-ühele: õpilane küsib samad küsimused õpetajalt kolm korda; õpetaja vastab iga kord teise inimesena (Malle, Grete, Jaan). Lõpus ütleb õpilane, kes broneerib kõige sagedamini.'),
      teach(tag(B.speaking('036_d_432', 'Minu asjaajamise nädal kolm korda.', 'Räägi oma nädala asjadest kolm korda: kõigepealt 2 minutit, siis 1,5 ja 1 minut.', ['Mis asju sul sel nädalal ajada on?', 'Kuhu sa pead aja broneerima?', 'Mis päeval ja mis kell sa sinna lähed?', 'Mida sa pead kaasa võtma?', 'Mis asi on kõige tähtsam ja miks?'], [60, 120], ['Sel nädalal pean ma …', 'Mul on aeg … kell …', 'Kõige tähtsam on …']), { task: 'S08' }),
        'Üks-ühele: õpilane räägib õpetajale kolm korda sama juttu; õpetaja hoiab aega (2 / 1,5 / 1 minut) ja ei paranda. Iga kord on jutt sujuvam.'),
    ],
    practice: [
      tag(B.reading('036_p_prices', 'Panga hinnakiri.', 'Loe panga kodulehelt teenuseid ja hindu. Vasta lühidalt.', 'Linna Pank: teenused ja hinnad',
        'Linna Pank asub Akadeemia tee 12. Kontor on avatud esmaspäevast reedeni kell 9–18. Laupäeval on kontor avatud kell 10–14. Pühapäeval on kontor suletud.\n\nKonsultandi juurde tuleb aeg broneerida. Aega saab broneerida telefonil 640 1000 või internetis. Ilma ajata saab tulla ainult kassasse.\n\nKonto avamine on tasuta. Pangakaart maksab 2 eurot kuus. Õpilastele ja pensionäridele on kaart tasuta. Uus PIN-kood maksab 3 eurot.\n\nAutomaadist saab sularaha võtta tasuta neli korda kuus. Viies kord maksab 1 euro. Automaat on maja ees.\n\nVõtke kaasa pass või ID-kaart ja oma telefon. Konto avamine kestab umbes 30 minutit. Konsultandid räägivad eesti, vene ja inglise keelt.\n\nKui aeg ei sobi, muutke seda vähemalt kaks tundi varem. Seda saab teha telefonis või internetis. Kui te ei tule ja aega ei muuda, ei saa te sel nädalal uut aega.\n\nMaja taga on parkla. Seal saab tasuta parkida üks tund. Bussipeatus on maja ees. Kontoris on ka lastenurk ja tasuta kohv.\n\nKui teil on küsimusi, kirjutage meile e-kiri või helistage. Telefon on avatud tööpäeviti kell 8–20. Me vastame e-kirjale ühe tööpäeva jooksul.',
        [['Mis päeval on kontor suletud?', 'pühapäeval'], ['Kuhu saab tulla ilma ajata?', 'kassasse'], ['Kui palju maksab pangakaart kuus?', '2 eurot|kaks eurot'], ['Kellele on pangakaart tasuta?', 'õpilastele ja pensionäridele|õpilastele|pensionäridele'], ['Mitu korda kuus saab automaadist tasuta raha võtta?', 'neli korda|neli|4'], ['Kui kaua kestab konto avamine?', 'umbes 30 minutit|30 minutit|pool tundi'], ['Millal tuleb aega muuta?', 'vähemalt kaks tundi varem|kaks tundi varem']]), { task: 'R08' }),
      teach(tag(B.cloze('036_p_cloze', 'Eksaminurk: panga e-kiri.', 'Sofia saab pangast e-kirja. Vali igasse lünka üks sobiv sõna.', 'Teie aeg Linna Pangas', [
        'Tere, Sofia Mets!',
        '',
        'Aitäh, et valisite Linna Panga. Eile {*broneerisite|broneerite|broneerima} te aja meie Mustamäe kontoris. Teie aeg on {*kolmapäeval|kolmapäev|kolmapäevast} kell 14.30. Teie konsultant on Kristi Lepik.',
        '',
        'Kontoris avame teile konto ja tellime pangakaardi. Konto avamine on tasuta. Pangakaart maksab kaks {*eurot|euro|eurod} kuus. Kaart tuleb postiga umbes nädala jooksul. Kuni kaart tuleb, saate maksta telefoniga.',
        '',
        'Palun {*võtke|võtame|võtma} kaasa pass või ID-kaart. Võtke kaasa ka oma telefon, sest me paneme sinna panga rakenduse. Konto avamine kestab umbes pool tundi.',
        '',
        'Kui aeg ei {*sobi|sobib|sobima}, helistage meile numbril 640 1000. Aega saab muuta ka internetis. Palun muutke aega vähemalt kaks tundi {*varem|hiljem|eile}.',
        '',
        'Kontor asub Akadeemia teel, bussipeatuse {*lähedal|lähedale|lähedalt}. Bussid 5 ja 17 peatuvad otse kontori ees. Maja ees on pangaautomaat. Kontori taga on parkla, seal saab tasuta parkida üks tund.',
        '',
        'Pärast konto avamist saate kasutada ka internetipanka. Konsultant näitab teile, kuidas see töötab. Internetipangas saate maksta arveid ja üüri.',
        '',
        'Meie konsultandid räägivad eesti, vene ja inglise keelt. Kristi räägib ka natuke soome keelt. Kui soovite, võite konto avamise ajal küsida ka teiste teenuste kohta.',
        '',
        'Kui teil on küsimusi, kirjutage meile. Me vastame ühe tööpäeva {*jooksul|jooksu|jooksult}. Telefon on avatud tööpäeviti kella kaheksast kaheksani.',
        '',
        'Ootame teid {*kolmapäeval|kolmapäevale|kolmapäevani}! Lugupidamisega, Linna Pank',
      ]), { harno: 'R5' }),
        'Nagu Harno A2 lugemise 5. osas: kiri lünkadega, igas lüngas kolm valikut. Eksamil on umbes 100-sõnaline isiklik kiri ja 8 lünka. Aeg umbes 8 minutit.'),
      B.truefalse('036_p_tf', 'Õige või vale?', 'Mõtle panga e-kirjale ja hinnakirjale. Kas lause on õige või vale?', [
        ['Sofia aeg pangas on kolmapäeval kell 14.30.', true], ['Konto avamise eest maksab Sofia kaks eurot.', false], ['Aega pangas saab muuta ka internetis.', true], ['Laupäeval on pank terve päeva kinni.', false],
        ['Pensionäridele on pangakaart tasuta.', true], ['Automaadist võib tasuta raha võtta kümme korda kuus.', false], ['Konto avamine kestab umbes pool tundi.', true], ['Maja taga saab terve päeva tasuta parkida.', false],
      ]),
      B.gaps('036_p_when', 'Millal?', 'Kirjuta päev või kellaaeg sulgudest sobivas vormis.', [
        'Sofia aeg pangas on [kolmapäeval]. (kolmapäev)', 'Kas teil on [reedel] vaba aega? (reede)', 'Ma saan tulla alles [järgmisel] nädalal. (järgmine)', 'Kas on võimalik tulla pärast [kella] kahte? (kell)',
        'Kontor on avatud [üheksast] kuueni. (üheksa)', 'Palun tulge kümme [minutit] varem. (minut)', 'Laupäeval on pank lahti ainult [neljani]. (neli)', 'Ma ei saa tulla, ma tahan aja [tühistada]. (tühistama)',
      ]),
      B.transformation('036_p_polite', 'Küsi viisakalt.', 'Kirjuta lause viisakalt. Algus on antud.', [
        ['Ma tahan aega juuksurisse.', 'Soovin …', 'Soovin aega juuksurisse.'],
        ['Kas reedel on aega?', 'Kas teil …?', 'Kas teil on reedel vaba aega?|Kas teil on reedel aega?'],
        ['Ma tulen kell kolm. Hea?', 'Kas kell kolm …?', 'Kas kell kolm sobib?|Kas kell kolm teile sobib?|Kas kell kolm sobib teile?'],
        ['Ma tahan tulla varem.', 'Kas on võimalik …?', 'Kas on võimalik tulla varem?|Kas on võimalik varem tulla?'],
        ['Ma tahan tulla hiljem.', 'Kas on võimalik …?', 'Kas on võimalik tulla hiljem?|Kas on võimalik hiljem tulla?'],
        ['Mida ma võtan kaasa?', 'Mida ma pean …?', 'Mida ma pean kaasa võtma?'],
        ['Kui palju konto maksab?', 'Kas konto avamine …?', 'Kas konto avamine maksab midagi?|Kas konto avamine maksab?'],
        ['Kolmapäev, kell pool kolm. Korras.', 'Kinnitan: …', 'Kinnitan: kolmapäeval kell pool kolm.|Kinnitan: kolmapäeval kell pool kolm'],
      ]),
      teach(B.examWriting('036_p_card', 'Visiitkaardi järgi.', 'Malle tahab ka Kristi juurde minna. Kirjuta visiitkaardi järgi Mallele 40–60 sõna.', 'teade', {
        situation: 'Visiitkaart: Kristi Lepik, konsultant · Linna Pank, Akadeemia tee 12, Tallinn (Mustamäe kontor) · E–R 9–18, L 10–14 · tel 640 1022 · k.lepik@linnapank.ee',
        points: ['Kes on Kristi Lepik?', 'Kus pank asub?', 'Millal on pank avatud?', 'Kuidas saab Kristiga ühendust võtta?'],
        words: [40, 60], opening: 'Tere, Malle!',
      }),
        'Tekst visiitkaardi järgi, neli küsimust (kes, kus, millal, kontakt). Hinda: iga sisupunkt 1 punkt, keel 0–4 punkti.'),
      teach(tag(B.ideaCard('036_p_week', 'Sofia asjaajamise nädal.', 'Sofial on viis asja ja vähe aega. Leppige kokku, mis päeval ta mida teeb.',
        'Sofia on keelekoolis E–N kell 9–13. Pank on avatud E–R 9–18, teenindus E–R 9–17, raamatukogu E–L 11–19. Juuksuris on vaba aeg ainult reedel ja laupäeval. Tööintervjuu on järgmisel esmaspäeval.',
        ['pank: konto', 'teenindus: ID-kaart', 'raamatukogu: lugejakaart', 'telefonipood: SIM-kaart', 'juuksur', 'vaba õhtu'], 'Mis päeval ja mis kell teeb Sofia iga asja ja miks?', [90, 120]), { task: 'S12' }),
        'Üks-ühele: õpetaja on Sofia ja tahab kõik asjad teha esmaspäeval; õpilane näitab, miks see ei sobi, ja jagab asjad nädala peale. Lõpus kordab õpilane Sofia nädala plaani.'),
    ],
    transfer: [
      B.text('036_t_sit', 'Aeg ei sobi', 'Esmaspäeva õhtul saab Sofia keelekoolist sõnumi: kolmapäeval kell kaks on proovieksam! Nüüd ei sobi tema aeg pangas. Telefonis on ka Kristi häälsõnum. Sofia kuulab sõnumit, vaatab oma kalendrit ja helistab panka. Pärast kirjutab ta Kristile e-kirja. Vaata pilti: klient muudab teeninduslauas oma aega.'),
      tag(B.listening('036_t_voice', 'Kristi häälsõnum.', 'Kristi jättis Sofiale sõnumi. Kuula kaks korda ja tee lünkadesse märkmed.', [
        'Kristi: Tere, Sofia! Siin Kristi Lepik, Linna Pank.',
        'Kristi: Ma helistan teie aja pärast. Teie aeg on kolmapäeval kell pool kolm.',
        'Kristi: Kahjuks olen ma kolmapäeval terve päeva koolitusel.',
        'Kristi: Minu kolleeg Ivo saab teid aidata samal ajal. Ivo räägib ka inglise keelt.',
        'Kristi: Või tulge minu juurde neljapäeval. Siis on vaba kell üksteist ja kell neli.',
        'Kristi: Reedel on kontor kinni, sest meil on remont.',
        'Kristi: Konto avamine kestab umbes pool tundi. Palun tulge viis minutit varem.',
        'Kristi: Palun helistage mulle tagasi täna või homme. Minu number on 640 1022.',
        'Kristi: Kui te ei saa helistada, kirjutage mulle e-kiri. Aadress on kirjas teie broneeringu sõnumis.',
        'Kristi: Ja ärge unustage passi! Telefon võtke ka kaasa, sest seal on panga rakendus.',
        'Kristi: Neljapäeval kell neli on kontoris tavaliselt vähe inimesi. See on hea aeg.',
        'Kristi: Kui uus aeg sobib, saadan teile kinnituse sõnumiga.',
        'Kristi: Kui te tahate ka krediitkaarti, öelge seda kohe. Siis valmistan paberid ette.',
        'Kristi: Pärast konto avamist näitan teile, kuidas internetipank töötab. See võtab umbes kümme minutit.',
        'Kristi: Aitäh ja head päeva!',
      ], ['Kolmapäeval ei ole Kristi kontoris, sest ta on [koolitusel].', 'Kolmapäeval aitab Sofiat Kristi kolleeg [Ivo].', 'Neljapäeva hommikul on vaba aeg kell [üksteist|11].', 'Neljapäeva pärastlõunal on vaba aeg kell [neli|4|16].', 'Uue aja jaoks peab Sofia Kristile tagasi [helistama].', 'Reedel on kontor kinni, sest seal on [remont].', 'Kristi telefoninumber on 640 [1022].', 'Panka peab Sofia kaasa võtma passi ja [telefoni].']), { task: 'L07' }),
      teach(B.phoneCards('036_t_call', 'Helista panka.', 'A on Sofia, B on Kristi. Muutke telefonis panga aega.',
        'Sofia ei saa kolmapäeval tulla, sest tal on proovieksam. Neljapäeva hommikul on Sofia keelekoolis kella üheni.',
        ['Sofia (küsimuste kaart)', ['Ütle, kes sa oled ja miks sa helistad.', 'Ütle, miks kolmapäev ei sobi.', 'Küsi teist aega.', 'Küsi, mida kaasa võtta.', 'Korda uus aeg üle.']],
        ['Kristi (vastuste kaart)', ['Vabad ajad: neljapäeval kell 11 ja kell 16.', 'Kolmapäeval kell 14.30 aitab kolleeg Ivo.', 'Küsi kliendi nime ja telefoni.', 'Kaasa: pass ja telefon.']], [90, 120]),
        'Üks-ühele: õpetaja on Kristi ja pakub kõigepealt neljapäeva kella 11; õpilane ütleb, miks see ei sobi, ja valib teise aja. Siis vahetage: õpetaja muudab oma aega, õpilane on konsultant.'),
      tag(B.examWriting('036_t_mail', 'E-kiri Kristile.', 'Kirjuta Kristile 50–70 sõna: muuda aega ja küsi üks küsimus.', 'kiri', {
        situation: 'Sa oled Sofia. Kolmapäeval kell kaks on proovieksam. Telefonis te leppisite kokku uue aja, nüüd kinnitad selle kirjas.',
        points: ['Miks sa kirjutad?', 'Miks kolmapäev ei sobi?', 'Mis uus aeg sulle sobib?', 'Mida sa veel küsid?'],
        words: [50, 70], opening: 'Tere, Kristi!', closing: 'Lugupidamisega, Sofia Mets',
      }), { main: true }),
      tag(B.writing('036_t_malle', 'Sõnum Mallele.', 'Kirjuta sama info lühidalt Mallele: 5–7 lauset sina-vormis.', [5, 7], ['neljapäeval', 'kell', 'pank', 'muutsin'], 2), { task: 'W12' }),
      tag(B.speaking('036_t_record', 'Salvesta: minu uus aeg.', 'Salvesta kodus 30–60 sekundit: kuhu sul on aeg ja miks sa seda muutsid.', ['Kuhu sul on aeg broneeritud?', 'Mis päeval ja mis kell?', 'Miks esimene aeg ei sobinud?', 'Mida sa pead kaasa võtma?', 'Kuidas sa aja muutsid: telefonis või internetis?'], [30, 60], ['Mul on aeg …', 'Esimene aeg ei sobinud, sest …', 'Ma helistasin ja …']), { task: 'S15' }),
      B.rubric('036_t_rubric', 'Hindamine.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kõnes ütleb õpilane, miks aeg ei sobi, ja valib uue aja.', 'Päev ja kell on õiges vormis: neljapäeval kell neli.', 'E-kirjas on kõik neli punkti (50–70 sõna).', 'Salvestus on arusaadav ja kestab 30–60 sekundit.']),
      B.selfcheck('036_t_self', ['Ma loen panga infot ja hinnakirja.', 'Ma broneerin aja telefonis.', 'Ma küsin, kas on võimalik tulla varem või hiljem.', 'Ma muudan aega telefonis ja e-kirjas.'], 'Aeg on muudetud'),
    ],
  },

  'a2-037': {
    title: 'Pean, saan, võin, tohin',
    canDo: 'Ma saan kuuldust aru asutuse reeglitest (pean, võin, ei tohi, siin makstakse) ja kirjutan kooli lehte 40–60-sõnalise kirjelduse puhkeruumi reeglitest.',
    discover: [
      B.review('037_d_review', [['Mis päeval ja mis kell on Sofia uus aeg pangas?', 'a2-036'], ['Kuidas jõuda sinu kodust lähimasse bussipeatusesse?', 'a2-022'], 'Mis dokumendid on praegu sinu rahakotis?']),
      B.text('037_d_hook', 'Reede hommik teeninduses', 'Reedel kell 9.15 on Sofial aeg teeninduses. Ta taotleb ID-kaarti. Sofia tuleb juba kell pool üheksa. Uks on veel kinni. Ukse kõrval seisab valvur. Uksel on palju silte. Mida siin peab tegema? Mida ei tohi teha?'),
      tag(B.listening('037_d_guard', 'Valvur selgitab.', 'Sofia küsib valvurilt. Kuula kaks korda, kirjuta lünka 1–2 sõna.', [
        'Valvur: Tere hommikust! Teenindus avatakse kell üheksa. Palun oodake natuke.',
        'Sofia: Tere! Mul on aeg kell üheksa viisteist. Kas ma pean võtma järjekorranumbri?',
        'Valvur: Ei, broneeritud ajaga ei pea. Teid kutsutakse nime järgi.',
        'Sofia: Kas ma võin saalis kohvi juua?',
        'Valvur: Kohvi siin ei müüda. Aga vett võib juua, see on tasuta.',
        'Sofia: Kas siin tehakse ka fotosid?',
        'Valvur: Jah, fotosid tehakse teisel korrusel. Foto maksab viis eurot.',
        'Sofia: Kas ma saan maksta sularahas?',
        'Valvur: Ei, siin makstakse ainult kaardiga.',
        'Valvur: Ja palun pange telefon hääletuks. Saalis telefoniga ei räägita.',
        'Sofia: Selge. Kus on ootesaal?',
        'Valvur: Ootesaal on paremal. Seal võib istuda ja ajalehte lugeda.',
        'Sofia: Kas ma võin oma koti siia ukse juurde jätta?',
        'Valvur: Ei, kotti ei tohi siia jätta. Võtke kott kaasa.',
        'Sofia: Mu sõbranna tuleb ka. Kas ta võib minuga koos sisse tulla?',
        'Valvur: Jah, võib. Aga infoletti läheb ainult klient.',
        'Sofia: Kas ma pean ID-kaardi jaoks midagi kaasa võtma?',
        'Valvur: Pass peab olema kaasas. Kui teil on vana ID-kaart, võtke see ka.',
        'Sofia: Minu vana kaart on kadunud.',
        'Valvur: Siis öelge seda teenindajale. Ta täidab kadunud kaardi avalduse.',
        'Sofia: Kas teeninduses on ka tualett?',
        'Valvur: Jah, tualett on ootesaali kõrval. See on tasuta.',
        'Sofia: Kas lapsed võivad ootesaalis mängida? Minu sõbranna tuleb lapsega.',
        'Valvur: Võivad küll. Ootesaalis on väike mängunurk. Aga joosta seal ei tohi.',
        'Sofia: Ja kui ma jään hiljaks? Kas ma pean uue aja broneerima?',
        'Valvur: Kui te jääte hiljaks üle kümne minuti, peate võtma järjekorranumbri ja ootama.',
        'Valvur: Vaadake, kell on üheksa. Uks avatakse. Tulge sisse!',
      ], ['Teenindus avatakse kell [üheksa|9].', 'Sofia aeg on kell üheksa [viisteist|15].', 'Broneeritud ajaga ei pea võtma [järjekorranumbrit].', 'Sofiat kutsutakse [nime] järgi.', 'Kohvi teeninduses ei [müüda].', 'Vett võib juua [tasuta].', 'Fotosid tehakse teisel [korrusel].', 'Teeninduses makstakse ainult [kaardiga].']), { task: 'L03' }),
      B.notice('037_d_notice', 'Märka: pean, võin, ei tohi ja reegel ilma tegijata', [
        '**pean** + ma-vorm: Te **peate ootama**. · Te **ei pea** numbrit **võtma**.',
        '**saan / võin** + da-vorm: Te **saate maksta** kaardiga. Siin **võib istuda**.',
        '**ei tohi** + da-vorm: Saalis **ei tohi süüa**. (keelatud)',
        'Küsi luba: **Kas ma võin** siin oodata? **Kas ma saan** kaardiga maksta?',
        'Tegija ei ole tähtis: Siin **müüakse** SIM-kaarte. Teenindus **avatakse** kell 9. Fotosid **tehakse** teisel korrusel.',
        'Eitus: Siin **ei suitsetata**. Sularaha **ei võeta**. Kohvi **ei müüda**.',
        'Sama reegel: **Siin ei tohi suitsetada.** = **Siin ei suitsetata.**',
      ], 'full'),
      B.table('037_d_rule', 'Leia vorm kuulamisest.', 'Kuidas öeldakse reeglit ilma tegijata? Kirjuta tabelisse umbisikuline vorm.', 'Tegusõna, da-vorm, Umbisikuline vorm', [
        'avama | avada | [avatakse]', 'sulgema | sulgeda | [suletakse]', 'võtma | võtta | [võetakse]', 'tegema | teha | [tehakse]',
        'maksma | maksta | [makstakse]', 'saatma | saata | [saadetakse]', 'suitsetama | suitsetada | ei [suitsetata]', 'rääkima | rääkida | ei [räägita]', 'müüma | müüa | [müüakse]', 'kutsuma | kutsuda | [kutsutakse]',
      ], 'g_notice'),
      B.categorize('037_d_sort', 'Kohustus, luba või keeld?', 'Mida reegel tähendab? Pane iga lause õigesse rühma.', [
        ['peab (kohustus)', ['Te peate järjekorras ootama.', 'Infoletis peate näitama passi.', 'Kaardi jaoks on vaja fotot.', 'Pass peab olema kaasas.', 'Pange telefon hääletuks.', 'Uks tuleb enda järel sulgeda.']],
        ['võib või saab (luba)', ['Ootesaalis võib istuda.', 'Vett võib juua tasuta.', 'Fotot saab teha teeninduses.', 'Riigilõivu saate maksta kaardiga.', 'Lapsed võivad mängida mängunurgas.', 'Ajalehte võib saalis lugeda.']],
        ['ei tohi (keeld)', ['Saalis ei tohi süüa.', 'Siin ei suitsetata.', 'Telefoniga ei räägita valjusti.', 'Koeraga ei tohi siseneda.', 'Sularaha siin ei võeta.', 'Pildistada on keelatud.']],
      ], 'full', 'g_vocab'),
      B.manymatch('037_d_signs', 'Sildid teeninduses.', 'Mis on sildi mõte? Ühenda silt ja selle tähendus.',
        ['Võtke järjekorranumber!', 'Ooteruumis ei sööda', 'Pildistamine keelatud', 'Teenindus avatakse kell 9', 'Ainult kaardimaksed', 'Ainult broneeritud ajaga', 'Siin müüakse marke', 'Mobiiltelefon hääletuks', 'Kassa suletakse kell 16.45'],
        ['Enne ootamist pead võtma numbri.', 'Siin ei tohi süüa.', 'Siin ei tohi pilte teha.', 'Enne kella üheksat ei saa sisse.', 'Sularahas maksta ei saa.', 'Ilma ajata ei saa teenindusse.', 'Siin saab osta marke.', 'Telefon ei tohi heliseda.', 'Pärast veerand viit ei saa kassas maksta.']),
      tag(B.vocab('037_d_vocab', 'Tunni sõnad.', ['reegel — правило', 'järjekord — очередь', 'ootama — ждать', 'dokument — документ', 'lubatud — разрешено', 'keelatud — запрещено', 'pass — паспорт', 'foto — фото', 'maksma — платить', 'kviitung — квитанция']), { topic: ['reegel', 'keelatud'] }),
      teach(tag(B.speaking('037_d_retell', 'Sofia hommik teeninduses kaks korda.', 'Jutusta Sofia hommikust kaks korda. Teine kord räägi kiiremini ja vaata vähem paberit.', ['Miks Sofia teenindusse läks?', 'Mida valvur ütles järjekorranumbri kohta?', 'Mida ootesaalis teha ei tohtinud?', 'Kus tehakse fotosid ja kui palju see maksab?', 'Kuidas teeninduses makstakse?'], [60, 120], ['Sofia läks teenindusse, sest …', 'Valvur ütles, et …', 'Saalis ei tohtinud …']), { task: 'S07', fluency: true }),
        'Üks-ühele: õpilane jutustab õpetajale kaks korda; esimene kord 2 minutit märksõnadega, teine kord 1,5 minutit ilma paberita. Õpetaja ei paranda.'),
      tag(B.writing('037_d_eight', 'Kaheksa minutit: reeglid minu elus.', 'Kirjuta 8 minutit järjest: mida pead tööl või koolis tegema ja mida seal ei tohi.', [8, 10], ['pean', 'võin', 'ei tohi', 'makstakse'], 2), { task: 'W06', fluency: true }),
    ],
    practice: [
      B.choice('037_p_choice', 'Pean, võin või ei tohi?', 'Vali reeglisse sobiv sõna.', [
        ['Ilma ajata ___ järjekorras ootama.', 'peate', 'võite', 'ei tohi'], ['Ootesaalis ___ istuda ja vett juua.', 'võite', 'peate', 'ei tohi'],
        ['Teeninduse saalis ___ võileiba süüa.', 'ei tohi', 'peab', 'saab'], ['Riigilõivu ___ maksta ainult kaardiga.', 'saate', 'peate', 'ei tohi'],
        ['Broneeritud ajaga ___ järjekorranumbrit võtma.', 'ei pea', 'ei tohi', 'võite'], ['Kui kaart on valmis, ___ passi kaasa võtma.', 'peate', 'võite', 'ei tohi'],
        ['Telefoniga ___ ootesaalis valjusti rääkida.', 'ei tohi', 'peab', 'võib'], ['Foto ___ teha ka teeninduse teisel korrusel.', 'saab', 'peab', 'ei tohi'],
      ], 'full', 'g_notice'),
      tag(B.examListen('037_p_desk', 'Infoletis.', 'Heli räägib Sofiaga. Kuula kaks korda. Kas lause on õige või vale?', 'truefalse', [
        'Heli: Tere! Sofia Mets? Palun istuge. Te taotlete ID-kaarti?',
        'Sofia: Jah. Kas ma pean täitma ka vormi?',
        'Heli: Ei, te ei pea. Vorm täidetakse arvutis, mina teen selle.',
        'Heli: Palun näidake passi. Kas teil on ka foto?',
        'Sofia: Jah, foto tehti teisel korrusel.',
        'Heli: Väga hea. Riigilõiv on kolmkümmend viis eurot.',
        'Sofia: Kas ma võin maksta kaardiga?',
        'Heli: Jah, palun. Kviitung saadetakse teile e-postiga.',
        'Sofia: Millal on kaart valmis?',
        'Heli: Umbes kahe nädala pärast. Teile saadetakse sõnum.',
        'Heli: Kaardi saate kätte siin. Siis peate passi jälle kaasa võtma.',
        'Sofia: Kas mu sõber võib kaardi minu eest ära tuua?',
        'Heli: Kahjuks ei tohi. Kaardi peate ise ära tooma.',
        'Heli: Kaarte antakse välja tööpäeviti kella üheksast viieni. Aega pole vaja broneerida.',
        'Sofia: Selge. Kas mul on vaja ka uut fotot, kui kaart on valmis?',
        'Heli: Ei ole vaja. Foto on juba arvutis.',
        'Sofia: Mu vana ID-kaart on kadunud. Mida ma pean tegema?',
        'Heli: Te ei pea politseisse minema. Ma kirjutan siia, et kaart on kadunud.',
        'Heli: Vana kaarti ei saa enam kasutada. Kui leiate selle, tooge see meile.',
        'Sofia: Aitäh! Kas siin saab ka passi taotleda?',
        'Heli: Jah, siin taotletakse passi ja ID-kaarti. Passi tegemine kestab kauem, umbes kuu aega.',
        'Sofia: Kas ma pean passi jaoks uue aja broneerima?',
        'Heli: Jah, passi jaoks on vaja uut aega. Seda saab broneerida internetis või telefonis.',
        'Sofia: Selge. Aitäh, te aitasite mind väga!',
        'Heli: Pole tänu väärt. Head päeva!',
      ], [
        ['Sofia peab ise paberil vormi täitma.', false], ['Heli täidab vormi arvutis.', true], ['Sofia foto tehti teeninduse teisel korrusel.', true], ['Riigilõiv maksab kakskümmend viis eurot.', false],
        ['Kviitung saadetakse Sofiale e-postiga.', true], ['ID-kaart on valmis juba homme.', false], ['Sofia sõber tohib kaardi ära tuua.', false], ['Kaardi kättesaamiseks ei pea aega broneerima.', true],
      ]), { task: 'L05' }),
      tag(B.bankText('037_p_lucia', 'Lucía sõnum.', 'Lucía kirjutab Tomile ujula reeglitest. Pane lünka sõna kastist, kaks sõna jääb üle.', 'Ujulas', [
        'Tere, Tom! Eile käisin ma Kalevi ujulas. Seal on palju reegleid, aga need on head. Ma räägin sulle, sest sa tahad ka ujuma minna.',
        '',
        'Enne ujumist peab iga inimene duši all [[pesema]]. Ujulasse ei tohi minna tänavariietes. Ujumismüts on [[kohustuslik]], aga selle saab ka kassast osta.',
        '',
        'Lapsed alla kümne aasta võivad ujuda ainult koos [[vanemaga]]. Basseini ääres ei tohi joosta, sest põrand on märg.',
        '',
        'Pilet [[makstakse]] kassas kaardiga või sularahas. Õpilastele on pilet [[odavam]]. Telefoniga ei tohi pilte [[teha]].',
        '',
        'Ujula avatakse kell seitse ja [[suletakse]] kell kümme õhtul. Laupäeval on ujulas palju lapsi, aga pühapäeva hommikul on vaikne.',
        '',
        'Kas sa tuled pühapäeval minuga ujuma? Ma võin sulle oma vana ujumismütsi anda. Lucía',
      ], ['pesta', 'Kallim']), { task: 'R04' }),
      tag(B.reading('037_p_post', 'Postkontori teade.', 'Loe postkontori uut teadet. Vasta igale küsimusele lühidalt.', 'Mustamäe postkontor: uued reeglid',
        'Alates esmaspäevast on postkontoris uued reeglid. Palun lugege need läbi.\n\nPostkontor avatakse tööpäeviti kell 9 ja suletakse kell 19. Laupäeval on postkontor avatud kella kümnest kolmeni. Pühapäeval on postkontor kinni.\n\nPaki saamiseks peate võtma järjekorranumbri. Paki saate kätte ainult dokumendiga. Kui pakile tuleb järele teine inimene, peab tal olema teie kirjalik luba.\n\nPakke hoitakse postkontoris kaks nädalat. Pärast seda saadetakse pakk tagasi.\n\nPostkontoris saab maksta kaardiga ja sularahas. Siin müüakse ka ümbrikke, marke ja postkaarte.\n\nKoeri ei tohi postkontorisse tuua. Telefoniga võib rääkida ainult vaikselt.',
        [['Mis kell postkontor tööpäeviti suletakse?', 'kell 19|kell seitse|19'], ['Mis päeval on postkontor kinni?', 'pühapäeval'], ['Mida on vaja paki saamiseks?', 'järjekorranumbrit ja dokumenti|dokumenti|järjekorranumbrit'], ['Mida peab olema teisel inimesel, kes tuleb pakile järele?', 'kirjalik luba|teie kirjalik luba'], ['Kui kaua hoitakse pakke postkontoris?', 'kaks nädalat|2 nädalat'], ['Mida müüakse postkontoris?', 'ümbrikke, marke ja postkaarte|marke|ümbrikke'], ['Keda ei tohi postkontorisse tuua?', 'koeri|koera']]), { task: 'R14' }),
      B.wordforms('037_p_forms', 'Mida siin tehakse?', 'Kirjuta tegusõna umbisikulises vormis, nagu avatakse või müüakse.', [
        ['müüma (müüa)', 'Postkontoris … ka ümbrikke.', 'müüakse'], ['avama (avada)', 'Pank … kell üheksa.', 'avatakse'], ['maksma (maksta)', 'Kassas … kaardiga.', 'makstakse'], ['tegema (teha)', 'Siin … passifotosid.', 'tehakse'],
        ['saatma (saata)', 'Kviitung … e-postiga.', 'saadetakse'], ['rääkima (rääkida)', 'Teeninduses … eesti ja vene keelt.', 'räägitakse'], ['sulgema (sulgeda)', 'Raamatukogu … kell seitse.', 'suletakse'], ['ootama (oodata)', 'Bussipeatuses … bussi.', 'oodatakse'],
      ]),
      B.errorfix('037_p_fix', 'Paranda reegel.', 'Lucía kirjutas reeglid. Igas lauses on üks viga. Kirjuta lause õigesti.', [
        ['Ooteruumis ei tohi kohvi jooma.', 'Ooteruumis ei tohi kohvi juua.'], ['Kas ma võin siin natuke istuma?', 'Kas ma võin siin natuke istuda?'],
        ['Sofia peab infoletis passi näidata.', 'Sofia peab infoletis passi näitama.'], ['Te ei pea fotot kaasa tuua.', 'Te ei pea fotot kaasa tooma.'],
        ['Väikesed lapsed ei tohib üksi tulla.', 'Väikesed lapsed ei tohi üksi tulla.'], ['Teeninduses võib maksta kaardiga või sularaha.', 'Teeninduses võib maksta kaardiga või sularahas.'],
        ['Kas ma saan siin maksan kaardiga?', 'Kas ma saan siin kaardiga maksta?'], ['Klient peab tulema kümme minutit enne.', 'Klient peab tulema kümme minutit varem.'],
      ]),
      teach(tag(B.speaking('037_p_explain', 'Seleta Lucíale.', 'Lucía läheb homme teenindusse. Seleta talle reegleid kaks korda, teine kord kiiremini.', ['Mida ta peab kaasa võtma?', 'Kas ta peab järjekorranumbri võtma?', 'Mida ooteruumis ei tohi teha?', 'Kuidas seal makstakse?', 'Millal ja kuidas saab ta kaardi kätte?'], [60, 120], ['Sa pead …', 'Seal ei tohi …', 'Seal makstakse …']), { task: 'S13', fluency: true }),
        'Üks-ühele: õpetaja on Lucía, kes ei tea teeninduse reegleid, ja küsib „Kas ma võin …? Kas ma pean …?”. Õpilane seletab kaks korda, teine kord kiiremini.'),
    ],
    transfer: [
      B.text('037_t_sit', 'Uus puhkeruum keelekoolis', 'Keelekoolis Sõna on uus puhkeruum. Seal on diivan, kohvimasin, külmkapp ja raamaturiiul. Administraator Ene kirjutab õpilastele kirja. Ruumile on vaja reegleid ja kooli lehte on vaja lühikest teksti. Sofia ja Lucía arutavad, mis on lubatud ja mis on keelatud. Vaata pilti: ka teenindusbüroos on reeglid seinal.'),
      tag(B.insertion('037_t_ene', 'Ene kiri.', 'Loe Ene kirja. Pane igasse lünka sobiv lause, üks lause jääb üle.', 'Uus puhkeruum', [
        'Head õpilased!',
        '',
        'Teisel korrusel on nüüd puhkeruum. [[Seal saab pausi ajal puhata, kohvi juua ja lugeda.]] Kohv on tasuta, aga oma tassi peseb igaüks ise.',
        '',
        'Puhkeruum avatakse kell 8 ja suletakse kell 20. [[Õhtul paneb viimane inimene tule kustu.]]',
        '',
        'Meil on juba probleeme. Eile jäi lauale palju musti tasse. [[Külmkapis on vana toit ja see lõhnab halvasti.]] Keegi kuulas pausi ajal valjusti muusikat. Õpetajad ei saanud tunniks valmistuda.',
        '',
        '[[Palun tehke ruumile reeglid.]] Kirjutage, mida seal peab tegema, mida võib teha ja mida ei tohi teha. Reeglid arutame läbi reedel kell 12. Siis pakume ka kooki.',
        '',
        '[[Kõige paremad reeglid pannakse puhkeruumi seinale.]] Kooli lehte on vaja ka lühikest teksti uuest ruumist.',
        '',
        'Aitäh! Ene',
      ], ['Teenindus avatakse kell üheksa.']), { task: 'R16' }),
      teach(B.ideaCard('037_t_rules', 'Puhkeruumi reeglid.', 'Leppige kokku viis reeglit: mida puhkeruumis peab, võib ja ei tohi teha.',
        'Puhkeruumis käivad õpilased ja õpetajad kell 8–20. Seal on kohvimasin, külmkapp, diivan ja raamaturiiul. Lucía tahab, et seal võib süüa. Dmitri tahab seal muusikat kuulata.',
        ['kohvimasin ja tassid', 'külmkapp', 'lõunasöök', 'muusika ja telefon', 'raamatud', 'tuli õhtul'], 'Mis on teie viis reeglit ja miks?', [90, 120]),
        'Üks-ühele: õpetaja on Lucía ja tahab, et puhkeruumis võib kõike teha; õpilane põhjendab ja koos lepite kokku viis reeglit. Lõpus loeb õpilane reeglid ette.'),
      B.planning('037_t_plan', 'Enne kirjutamist: plaan.', 'Kirjuta iga küsimuse juurde märksõnad. Kasuta peab, võib, ei tohi.', ['Mis puhkeruumis on?', 'Mida seal võib ja saab teha?', 'Mida seal ei tohi teha ja miks?'], 2),
      teach(tag(B.examWriting('037_t_text', 'Eksaminurk: tekst kooli lehte.', 'Kirjuta kooli lehte uuest puhkeruumist 40–60 sõna. Vasta kõigile kolmele küsimusele.', 'jutt', {
        situation: 'Keelekooli lehe teema on „Meie uus puhkeruum”.',
        points: ['Mis puhkeruumis on?', 'Mida seal võib ja saab teha?', 'Mida seal ei tohi teha ja miks?'],
        words: [40, 60],
      }), { harno: 'W2b', main: true }),
        'Nagu Harno A2 kirjutamise 2. osas (kirjeldus kolme küsimuse järgi): eksamil vähemalt 30 sõna, siin 40–60. Kontrolli, et igale küsimusele on vastus ja vormid pean + ma, võin / ei tohi + da on õiged.'),
      tag(B.writing('037_t_edit', 'Paranda oma tekst.', 'Loe oma teksti rubriigi järgi. Paranda vormid ja kirjuta tekst puhtalt.', [5, 7], ['peab', 'võib', 'ei tohi', 'avatakse'], 2), { task: 'W10' }),
      tag(B.speaking('037_t_record', 'Salvesta: reeglid minu majas.', 'Salvesta kodus 30–60 sekundit: mis reeglid on sinu majas või töökohas.', ['Kus sa elad või töötad?', 'Mida seal peab tegema?', 'Mida seal võib teha?', 'Mida seal ei tohi teha?', 'Mis reegel sulle ei meeldi ja miks?'], [30, 60], ['Meie majas peab …', 'Seal võib …', 'Seal ei tohi …']), { task: 'S15' }),
      B.rubric('037_t_rubric', 'Hindamine.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Reeglid on kokku lepitud: kohustus, luba ja keeld.', 'Tekstis on vastus kõigile kolmele küsimusele (40–60 sõna).', 'Pean + ma-vorm ja võin / ei tohi + da-vorm on õiged.', 'Salvestus on arusaadav ja kestab 30–60 sekundit.']),
      B.selfcheck('037_t_self', ['Ma saan aru siltidest: siin ei suitsetata, pank avatakse kell 9.', 'Ma saan kuuldust aru, mida peab, võib ja ei tohi teha.', 'Ma lepin teisega reeglid kokku.', 'Ma kirjutan ruumist ja selle reeglitest lühikese teksti.'], 'Reeglid on seinal'),
    ],
  },

  'a2-038': {
    title: 'Vormid ja juhised',
    canDo: 'Ma saan kuuldust aru vormi täitmise juhistest (täitke, kirjutage, märkige) ja räägin registraatoriga oma andmetest, kui vormis on viga.',
    discover: [
      B.review('038_d_review', [['Mida ei tohi teeninduse ooteruumis teha?', 'a2-037'], ['Mis toad on sinu korteris ja mis mööbel seal on?', 'a2-016'], 'Kas sa täidad vorme pigem paberil või internetis?']),
      B.text('038_d_hook', 'Raamatukogus', 'Malle töötab kaks päeva nädalas Mustamäe raamatukogus. Ta ütleb Sofiale: „Tule raamatukokku! Seal on eesti keele õpikud ja lihtsad raamatud.” Teisipäeval läheb Sofia raamatukokku. Lugejakaardi jaoks peab ta täitma taotluse. Raamatukogu kõrval on perearstikeskus. Sofia vajab ka perearsti.'),
      B.match('038_d_data', 'Mis lahtrisse?', 'Sofia täidab lugejakaardi vormi. Ühenda lahter ja Sofia andmed.', [
        ['Eesnimi *', 'SOFIA'], ['Perekonnanimi *', 'METS'], ['Aadress *', 'AKADEEMIA TEE 30-12, TALLINN'], ['Telefon *', '5341 2268'],
        ['E-post', 'SOFIA.METS@POST.EE'], ['Info keel', 'eesti keel'], ['Uudiskiri', 'X ei soovi'], ['Kuupäev ja allkiri *', '3.12. S. Mets'],
      ], 'full', 'g_vocab'),
      B.listening('038_d_listen', 'Infoletis.', 'Raamatukoguhoidja Marju aitab Sofiat. Kuula kaks korda ja kirjuta lünka üks sõna.', [
        'Marju: Tere! Kuidas ma saan aidata?',
        'Sofia: Tere! Ma soovin lugejakaarti.',
        'Marju: Väga hea. Palun täitke see vorm. Kirjutage trükitähtedega.',
        'Marju: Tärniga lahtrid on kohustuslikud.',
        'Sofia: Minu ID-kaart ei ole veel valmis. Kas pass sobib?',
        'Marju: Jah, pass sobib. Kirjutage vormi ka isikukood.',
        'Marju: E-post ei ole kohustuslik. Aga siis saate meeldetuletuse.',
        'Marju: Märkige ristikesega, mis keeles te infot soovite.',
        'Marju: Lõpus kirjutage kuupäev ja andke allkiri.',
        'Marju: Ärge kirjutage halli lahtrisse. See on minu jaoks.',
        'Sofia: Aitäh! Mitu raamatut ma võin korraga võtta?',
        'Marju: Kuni kümme raamatut. Raamatud tagastatakse kolme nädala jooksul.',
        'Malle: Sofia, vaata! Siin riiulil on lihtsad eesti raamatud.',
        'Sofia: Oi, kui palju! Ma võtan kolm raamatut ja ühe õpiku.',
        'Marju: Palun, siin on teie kaart. Head lugemist!',
      ], ['Sofia soovib [lugejakaarti].', 'Vormi kirjutatakse [trükitähtedega].', 'ID-kaardi asemel näitab Sofia [passi].', 'E-postiga saab lugeja [meeldetuletuse].', 'Keel märgitakse [ristikesega].', 'Halli lahtrisse ei tohi [kirjutada].', 'Korraga võib võtta kuni [kümme|10] raamatut.', 'Raamatud tagastatakse kolme [nädala] jooksul.']),
      tag(B.reading('038_d_guide', 'Perearsti juurde registreerimine.', 'Loe perearstikeskuse juhendit. Mis on esimene, mis viimane samm? Vasta lühidalt.', 'Kuidas saada perearsti?',
        'Kui te elate Mustamäel, võite registreeruda meie perearstikeskusesse. Registreerimine on tasuta. Ka lapsed saavad samasse keskusesse tulla.\n\nKõigepealt valige arst. Meie arstid on dr Tamm, dr Kask ja dr Lill. Dr Tamm võtab vastu hommikul, dr Kask õhtul kella seitsmeni. Dr Lill räägib ka vene ja inglise keelt.\n\nSiis täitke avaldus. Avalduse saate registratuurist või meie kodulehelt. Kirjutage trükitähtedega.\n\nAvaldusse kirjutage oma nimi, isikukood, aadress ja telefon. Märkige ristikesega, kas teil on ravikindlustus.\n\nLõpus kirjutage kuupäev ja andke allkiri. Ärge unustage allkirja, muidu avaldust vastu ei võeta.\n\nAvalduse tooge registratuuri või saatke e-postiga. Registratuur on avatud tööpäeviti kell 8–16.\n\nVastus saadetakse teile viie tööpäeva jooksul. Kui arstil ei ole vaba kohta, pakume teile teist arsti.\n\nEsimesel visiidil võtke kaasa ID-kaart või pass. Tulge kümme minutit varem, sest esimesel korral täidate ka küsimustiku.',
        [['Mida tuleb teha kõigepealt?', 'valida arst|valige arst|arst valida'], ['Milline arst räägib ka vene keelt?', 'dr Lill|Lill'], ['Kust saab avalduse?', 'registratuurist või kodulehelt|registratuurist|kodulehelt'], ['Mida tuleb märkida ristikesega?', 'kas on ravikindlustus|ravikindlustus'], ['Mida tuleb teha lõpus?', 'kirjutada kuupäev ja anda allkiri|kuupäev ja allkiri'], ['Kuhu tuleb avaldus tuua?', 'registratuuri'], ['Millal tuleb vastus?', 'viie tööpäeva jooksul|viie päeva jooksul']]), { task: 'R10' }),
      B.notice('038_d_notice', 'Märka: juhis teile (teie-vorm)', [
        'Juhis: **täitke**, **kirjutage**, **valige**, **märkige**, **andke**, **näidake**, **tooge**',
        'da-vorm → teie-vorm: **kirjutada → kirjutage**, **valida → valige**, **märkida → märkige**',
        'Pea meeles: **täita → täitke**, **võtta → võtke**, **anda → andke**, **tuua → tooge**, **näidata → näidake**',
        'Keeld: **ärge** + teie-vorm: **Ärge kirjutage** halli lahtrisse. **Ärge unustage** allkirja!',
        'Vormis: tärn **\\*** = kohustuslik lahter · **trükitähtedega**: SOFIA METS',
        'Ilma tegijata: avaldus **täidetakse** trükitähtedega, vastus **saadetakse** e-postiga.',
      ], 'full'),
      B.table('038_d_rule', 'Leia juhis tekstist.', 'Kirjuta teie-vorm. Vaata juhendit ja kasti „Märka”.', 'Tegusõna, Sina (käsk), Teie (juhis)', [
        'täitma | täida | [täitke]', 'kirjutama | kirjuta | [kirjutage]', 'valima | vali | [valige]', 'märkima | märgi | [märkige]',
        'andma | anna | [andke]', 'saatma | saada | [saatke]', 'näitama | näita | [näidake]', 'tooma | too | [tooge]',
        'unustama | unusta | [unustage]', 'kontrollima | kontrolli | [kontrollige]',
      ], 'g_notice'),
      tag(B.vocab('038_d_vocab', 'Tunni sõnad.', ['vorm — бланк / форма', 'täitma — заполнять', 'avaldus — заявление', 'allkiri — подпись', 'andmed — данные', 'aadress — адрес', 'perearst — семейный врач', 'registreerima — регистрировать', 'raamatukogu — библиотека', 'juhis — инструкция / указание'])),
      teach(tag(B.speaking('038_d_talk', 'Minu vormid kaks korda.', 'Räägi oma vormidest kaks korda. Teine kord räägi kiiremini.', ['Mis vorme sa viimasel ajal täitsid?', 'Kas sa täitsid need paberil või internetis?', 'Mis lahter oli raske?', 'Kes sind aitas?', 'Kas sa unustasid kunagi allkirja?'], [60, 120], ['Ma täitsin …', 'Raske oli …, sest …', 'Mind aitas …']), { fluency: true }),
        'Üks-ühele: õpilane räägib õpetajale kaks korda; esimene kord 2 minutit, teine kord 1,5 minutit. Õpetaja küsib vahel „Kus? Miks?”, aga ei paranda.'),
      teach(tag(B.speaking('038_d_opinion', 'Paber või internet?', 'Ütle järjest kolmele inimesele oma arvamus: kas vorm on parem paberil või internetis?', ['Kumb on kiirem: paber või internet?', 'Kumb on lihtsam vanale inimesele?', 'Kas internetis on vigu kergem parandada?', 'Mis vorme sa täidad alati paberil?', 'Kas sa küsid abi, kui vorm on raske?'], [60, 120], ['Minu arvates on parem …, sest …', 'Paberil on …', 'Internetis saab …']), { task: 'S11', fluency: true }),
        'Üks-ühele: õpilane ütleb oma arvamuse õpetajale kolm korda, iga kord natuke kiiremini; õpetaja on vahel teisel arvamusel („Paber on kindlam!”) ja õpilane põhjendab.'),
    ],
    practice: [
      B.formtext('038_p_form', 'Registratuuri juhis.', 'Merike kirjutab Sofiale juhise. Pane sulgudes tegusõna teie-vormi.', 'Teie avaldus perearstile', [
        'Tere, Sofia! Aitäh teie kirja eest. Perearsti saamiseks [täitke] (täitma) palun avaldus.',
        '',
        'Avaldus on kirja lisas. [Kirjutage] (kirjutama) see trükitähtedega. [Märkige] (märkima) ristikesega, kas soovite arsti, kes räägib vene keelt.',
        '',
        '[Valige] (valima) ka sobiv arst. Dr Lillel on praegu kõige rohkem vabu kohti.',
        '',
        'Lõpus [andke] (andma) allkiri. [Ärge unustage] (unustama) kirjutada oma telefoni numbrit, sest me helistame teile.',
        '',
        'Avalduse [saatke] (saatma) e-postiga või [tooge] (tooma) registratuuri. Esimesel visiidil [näidake] (näitama) ID-kaarti või passi.',
        '',
        'Esimene visiit kestab umbes pool tundi. Arst küsib teie tervise kohta ja õde mõõdab vererõhku.',
        '',
        'Kui teil on küsimusi, helistage registratuuri tööpäeviti kell 8–16. Lugupidamisega, Merike, Mustamäe perearstikeskus',
      ]),
      tag(B.examListen('038_p_steps', 'Registraator Merike selgitab.', 'Merike räägib telefonis Lucíaga. Kuula kaks korda ja ühenda lause algus ja lõpp.', 'match', [
        'Merike: Mustamäe perearstikeskus, Merike kuuleb.',
        'Lucía: Tere! Siin Lucía. Ma tahan perearsti juurde registreeruda. Mida ma pean tegema?',
        'Merike: Kõigepealt valige arst. Kas te räägite eesti keelt?',
        'Lucía: Natuke. Ma räägin hästi hispaania ja inglise keelt.',
        'Merike: Siis valige dr Lill. Tema räägib ka inglise keelt.',
        'Lucía: Hea. Kust ma saan avalduse?',
        'Merike: Avaldus on meie kodulehel. Laadige see alla ja täitke trükitähtedega.',
        'Lucía: Mul ei ole veel Eesti isikukoodi. Mis ma kirjutan?',
        'Merike: Siis kirjutage sünniaeg. Ja lisage passi koopia.',
        'Lucía: Kuhu ma avalduse saadan?',
        'Merike: Saatke see e-postiga. Aadress on kodulehel.',
        'Lucía: Millal ma vastuse saan?',
        'Merike: Viie tööpäeva jooksul. Me saadame teile e-kirja.',
        'Lucía: Kas registreerimine maksab midagi?',
        'Merike: Ei, see on tasuta. Ärge unustage allkirja!',
        'Lucía: Kas ma võin tulla arsti juurde ka enne vastust?',
        'Merike: Kui teil on kiire probleem, helistage meile. Siis aitab teid õde.',
        'Lucía: Aitäh! Ma täidan avalduse täna õhtul.',
        'Merike: Väga hea. Head õhtut!',
      ], [
        ['Kõigepealt peab Lucía', 'valima arsti'], ['Lucíale sobib dr Lill, sest', 'tema räägib inglise keelt'], ['Avalduse leiab Lucía', 'kodulehelt'], ['Avaldus täidetakse', 'trükitähtedega'],
        ['Isikukoodi asemel kirjutab Lucía', 'sünniaja'], ['Avaldusele lisab Lucía', 'passi koopia'], ['Vastus tuleb', 'viie tööpäeva jooksul'], ['Registreerimine on', 'tasuta'],
      ]), { task: 'L09' }),
      B.errorfix('038_p_fix', 'Paranda juhis.', 'Registratuuri uus töötaja kirjutas juhised vigadega. Kirjuta lause õigesti.', [
        ['Palun täitage see avaldus trükitähtedega.', 'Palun täitke see avaldus trükitähtedega.'], ['Kirjutke avaldusse oma nimi ja aadress.', 'Kirjutage avaldusse oma nimi ja aadress.'],
        ['Valike endale sobiv perearst.', 'Valige endale sobiv perearst.'], ['Avalduse lõpus andage oma allkiri.', 'Avalduse lõpus andke oma allkiri.'],
        ['Ärge kirjuta midagi halli lahtrisse.', 'Ärge kirjutage midagi halli lahtrisse.'], ['Palun näitage registratuuris ID-kaarti.', 'Palun näidake registratuuris ID-kaarti.'],
        ['Võtage esimesele visiidile pass kaasa.', 'Võtke esimesele visiidile pass kaasa.'], ['Kui avaldus on valmis, tooke see registratuuri.', 'Kui avaldus on valmis, tooge see registratuuri.'],
      ]),
      B.wordorder('038_p_order', 'Pane juhis kokku.', 'Pane registratuuri juhise sõnad õigesse järjekorda. Alusta suure tähega sõnast.', [
        'Kirjutage oma nimi trükitähtedega.', 'Avalduse saate registratuurist või kodulehelt.', 'Märkige ristikesega sobiv keel.', 'Ärge unustage avalduse lõpus allkirja.',
        'Vastus saadetakse teile e-postiga.', 'Esimesel visiidil võtke kaasa ID-kaart.', 'Registratuur on avatud tööpäeviti kella neljani.', 'Registreerimine perearsti juurde on tasuta.',
      ]),
      B.crossword('038_p_cross', 'Vormi sõnad.', 'Lahenda ristsõna. Kõik sõnad on vormist ja juhendist.', [
        ['Nimi, mille kirjutad käega vormi lõppu', 'allkiri'], ['Lahter tärniga on …', 'kohustuslik'], ['Sinu tänav, maja ja korter', 'aadress'], ['Arst, kes on sinu pere arst', 'perearst'],
        ['Paber, millega sa midagi palud', 'avaldus'], ['Suured tähed: SOFIA', 'trükitähed'], ['Päev, kuu ja aasta vormi lõpus', 'kuupäev'], ['Kaart, millega võtad raamatukogust raamatuid', 'lugejakaart'],
      ], 'full'),
      tag(B.writing('038_p_join', 'Ühenda laused.', 'Kirjuta Sofia päevast 6–8 lauset. Ühenda mõtted sõnadega ja, aga, sest, siis.', [6, 8], ['sest', 'aga', 'siis', 'avaldus'], 2), { task: 'W09' }),
      teach(tag(B.rolecards('038_p_cards', 'Eksaminurk: küsimuskaart „Asjaajamine”.', 'Üks küsib kaardi märksõnade järgi, teine vastab. Siis vahetage rollid.',
        'Sa küsid. Märksõnad: pank? vorm paberil või internetis? perearst? raamatukogu? järjekord? Küsi iga märksõna kohta üks küsimus.',
        'Sa vastad täislausega ja lisad ühe detaili: kus, millal või miks. Siis küsid sina. Märksõnad: postkontor? telefon? juuksur? dokument? ootamine?',
        ['Kas sa …?', 'Kus sa …?', 'Kui tihti sa …?'], ['Jah, ma …, sest …', 'Ma käin … korda kuus.', 'Mulle ei meeldi …']),
      { harno: 'S2' }),
        'Üks-ühele: nagu Harno A2 rääkimise 2. osas. Õpetaja küsib viis küsimust, õpilane vastab ja lisab detaili; siis küsib õpilane õpetajalt teise kaardi järgi. Kokku 5–6 minutit, hinda nagu eksamil.'),
    ],
    transfer: [
      B.text('038_t_sit', 'Perearstikeskuses', 'Kolmapäeval viib Sofia oma avalduse perearstikeskusesse. Registraator Merike kontrollib avaldust. Seal on kaks probleemi: üks kohustuslik lahter on tühi ja allkiri puudub. Ka Lucía, Dmitri ja Tom tahavad perearsti. Vaata pilti: klient täidab vormi ja teenindaja näitab järgmist lahtrit.'),
      tag(B.profiles('038_t_people', 'Kolm avaldust.', 'Loe kolme sõbra andmeid. Kirjuta lünka, mida nad peavad tegema.', [
        ['Lucía', ['pärit Hispaaniast', 'Eesti isikukoodi veel ei ole', 'räägib hispaania ja inglise keelt', 'elab Mustamäel', 'avaldus on täidetud käekirjaga', 'passi koopia puudub'], ['Isikukoodi asemel kirjutab Lucía [sünniaja].', 'Lucíale sobib arst, kes räägib [inglise] keelt.', 'Avalduse peab Lucía uuesti täitma [trükitähtedega].', 'Lucía avaldusele on vaja lisada passi [koopia].']],
        ['Dmitri', ['kolis eelmisel nädalal', 'uus aadress: Sõpruse puiestee 7-3', 'vormis on vana aadress', 'telefoni lahter on tühi', 'räägib vene keelt'], ['Dmitri peab vormi kirjutama uue [aadressi].', 'Registraator ei saa Dmitrile helistada, sest [telefoni] lahter on tühi.', 'Dmitri elab nüüd [Sõpruse] puiesteel.', 'Dmitrile sobib dr Lill, sest ta räägib [vene] keelt.']],
        ['Tom', ['töötab päeval kesklinnas', 'elab Mustamäel', 'avaldus on täidetud', 'allkiri puudub', 'tahab vastust e-postiga'], ['Ilma allkirjata ei võeta Tomi avaldust [vastu].', 'Tom peab avalduse lõpus andma [allkirja].', 'Vastus saadetakse Tomile [e-postiga].', 'Tom töötab päeval, seepärast sobib talle arst, kes võtab vastu [õhtul].']],
      ]), { task: 'R11' }),
      teach(tag(B.rolecards('038_t_desk', 'Avalduses on vead.', 'A on klient, B on registraator Merike. Lahendage avalduse probleemid.',
        'Sa oled klient ja tahad perearsti. Sinu avalduses on tühi lahter ja allkiri puudub. Ütle oma andmed, nimi tähthaaval. Küsi, millal arst sind vaatab.',
        'Sa oled registraator. Kontrolli avaldust: telefon puudub, allkiri puudub. Palu need lisada. Ütle, et vastus tuleb viie tööpäeva jooksul.',
        ['Vabandust, mida ma pean lisama?', 'Minu nimi tähthaaval: …', 'Millal ma vastuse saan?'], ['Palun kirjutage siia …', 'Palun andke allkiri.', 'Vastus saadetakse …']), { task: 'S10', main: true }),
        'Üks-ühele: õpetaja on Merike ja leiab avaldusest kaks viga; õpilane parandab, ütleb nime tähthaaval ja küsib kaks küsimust. Siis vahetage: õpetaja on klient, õpilane kontrollib avaldust.'),
      teach(B.ideaCard('038_t_help', 'Mis arst sobib?', 'Aidake sõpradel arst valida. Leppige kokku, kes kelle juurde läheb.',
        'Dr Tamm: vastuvõtt hommikul, ainult eesti keel. Dr Kask: vastuvõtt õhtul kuni kella seitsmeni. Dr Lill: räägib vene ja inglise keelt, vastuvõtt päeval. Lucía õpib hommikul, Tom töötab päeval kesklinnas, Dmitri räägib vene keelt.',
        ['dr Tamm', 'dr Kask', 'dr Lill', 'keel', 'vastuvõtu aeg', 'töö ja kool'], 'Kes valib millise arsti ja miks?', [90, 120]),
        'Üks-ühele: õpetaja on Tom ja tahab algul dr Tammi; õpilane seletab, miks dr Kask sobib paremini. Lõpus ütleb õpilane, kes kelle juurde läheb.'),
      tag(B.examWriting('038_t_survey', 'Perearstikeskuse küsimustik.', 'Esimesel visiidil täidad küsimustiku. Vasta igale küsimusele täislausega.', 'kusimustik', {
        situation: 'Mustamäe perearstikeskus küsib uutelt patsientidelt.',
        questions: ['Mis keeles te soovite arstiga rääkida?', 'Mis kell teile vastuvõtt kõige paremini sobib?', 'Kuidas te soovite infot saada: telefonis või e-postiga?', 'Kas teil on ravikindlustus?', 'Kas te käite sageli arsti juures?', 'Kas te teete sporti? Mis spordiala?', 'Kas teil on allergia?', 'Kes on teie hädaabikontakt?', 'Kuidas te keskusesse tulete?', 'Miks te valisite meie perearstikeskuse?'],
      }), { task: 'W01' }),
      tag(B.speaking('038_t_picture', 'Salvesta: pilt teeninduses.', 'Vaata pilti ja salvesta kodus 30–60 sekundit: mis toimub teeninduslauas?', ['Kes on pildil ja kus nad on?', 'Mida klient täidab?', 'Kuhu teenindaja näitab?', 'Mis andmeid sina vormi kirjutad?'], [30, 60], ['Pildil on …', 'Klient täidab …', 'Teenindaja näitab …']), { task: 'S06' }),
      B.rubric('038_t_rubric', 'Hindamine.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Rollimängus parandab õpilane avalduse ja ütleb nime tähthaaval.', 'Teie-vormid ja juhised on õiged: kirjutage, andke, ärge unustage.', 'Küsimustikus on vastus igale küsimusele täislausega.', 'Salvestus on arusaadav ja kestab 30–60 sekundit.']),
      B.selfcheck('038_t_self', ['Ma saan aru juhistest: täitke, märkige, andke allkiri.', 'Ma ütlen oma andmed ja nime tähthaaval.', 'Ma parandan avalduse koos registraatoriga.', 'Ma täidan küsimustiku.'], 'Avaldus on vastu võetud'),
    ],
  },

  'a2-039': {
    title: 'Telefon ja klienditeenindus',
    canDo: 'Ma loen telefonipoe ja klienditeeninduse infot ning helistan klienditeenindusse, et oma probleem lahendada.',
    discover: [
      B.review('039_d_review', [['Mida peab vormi lõppu kirjutama?', 'a2-038'], ['Mida ütleb teenindaja kohvikus, kui toit on otsas?', 'a2-028'], 'Kellele sa viimati helistasid ja miks?']),
      B.text('039_d_hook', 'Uus SIM-kaart', 'Sofia SIM-kaart on välismaalt ja kõned on kallid. Neljapäeval läheb ta telefonipoodi Kõne ja ostab uue SIM-kaardi. Juba järgmisel hommikul ei tööta telefonis internet. Sofia peab helistama klienditeenindusse. Kõigepealt loeb ta Kõne kodulehte.'),
      tag(B.reading('039_d_info', 'Kõne klienditeenindus.', 'Enne lugemist arva: mida küsib teenindaja? Siis loe kiiresti, 5 minutiga, ja vasta.', 'Kõne klienditeenindus',
        'Kas teil on küsimus interneti, arve või lepingu kohta? Helistage meile! Klienditeenindus on avatud iga päev kell 8–20. Helistage numbril 1717. Kõne on tasuta.\n\nKõigepealt kuulete automaati. Siis valige number. Interneti küsimused: vajutage 1. Arve küsimused: vajutage 2. Uus leping: vajutage 3.\n\nPalun oodake. Tavaliselt vastatakse viie minuti jooksul. Hommikul ja õhtul on ootamine lühem. Kõnesid salvestatakse. Kui ootamine on liiga pikk, jätke sõnum. Teile helistatakse tagasi samal päeval.\n\nEnne kõnet otsige üles lepingu number. Teenindaja küsib ka teie nime ja isikukoodi. Klienditeeninduses räägitakse eesti, vene ja inglise keelt.\n\nKui teenindaja ei saa probleemi lahendada, ühendab ta teid tehnikuga. Lihtsaid küsimusi saate lahendada ka meie kodulehel. Seal saate vaadata ka oma arveid ja lepingut. Seal on vestlusaken, kus teenindaja vastab kirjalikult. Vestlusaken on avatud samal ajal kui telefon. Vestlusaknas ei pea te ootama, aga vastust tuleb mõnikord oodata pool tundi.\n\nArvet saab maksta internetipangas või poe kassas. Kui arve on vale, helistage kahe nädala jooksul. Kõik vastused saadetakse teile ka e-postiga.\n\nKas soovite uut telefoni või SIM-kaarti? Kas tahate paketti muuta? Tulge meie poodi Mustamäe keskuses. Pood on avatud iga päev kell 10–20, laupäeval kell 10–18.',
        [['Mis numbril tuleb helistada?', '1717'], ['Mis numbrit vajutad, kui internet ei tööta?', '1|üks'], ['Kui kiiresti tavaliselt vastatakse?', 'viie minuti jooksul|viie minutiga'], ['Mida teha, kui ootamine on liiga pikk?', 'jätta sõnum|jätke sõnum|jätan sõnumi'], ['Mida peab enne kõnet üles otsima?', 'lepingu numbri|lepingu number'], ['Mis keeltes klienditeeninduses räägitakse?', 'eesti, vene ja inglise keelt|eesti, vene ja inglise keeles'], ['Kellega ühendab teenindaja, kui ta ei saa aidata?', 'tehnikuga']]), { task: 'R13', fluency: true }),
      tag(B.examListen('039_d_auto', 'Automaat ja teated.', 'Sofia kuuleb telefonis kaheksa lühikest teadet. Kuula kaks korda ja vali õige vastus.', 'choice', [
        'Automaat: Tere tulemast Kõne klienditeenindusse! Teenindus on avatud iga päev kella kaheksast kaheksani. Kui teil on interneti küsimus, vajutage üks.',
        'Automaat: Kui teil on küsimus arve kohta, vajutage kaks. Kui soovite uut lepingut või uut paketti, vajutage kolm. Kui soovite menüüd uuesti kuulata, vajutage tärni.',
        'Automaat: Teie kõne on meile oluline. Kõik teenindajad on praegu hõivatud. Te olete järjekorras neljas. Palun ärge pange telefoni ära.',
        'Automaat: Ootamise aeg on umbes kuus minutit. Kõnesid salvestatakse. Kui te ei soovi, et teie kõne salvestatakse, öelge seda teenindajale.',
        'Automaat: Kui te ei taha oodata, jätke oma nimi ja telefoninumber pärast piiksu. Öelge ka lühidalt, mis küsimuses te helistate.',
        'Automaat: Teile helistatakse tagasi täna enne kella kaheksat õhtul. Kui helistate pärast kella kaheksat, helistatakse teile tagasi järgmisel hommikul. Aitäh, et ootate!',
        'Automaat: Kui teie küsimus on arve kohta, vaadake ka meie kodulehte. Seal on vastused kõige tavalisematele küsimustele.',
        'Automaat: Kui teie telefon on kadunud, vajutage null. Siis pannakse teie SIM-kaart kohe lukku. Uue kaardi saate poest järgmisel päeval.',
        'Diktor: Kõne poes on sel nädalal pakkumine: uus SIM-kaart maksab ainult üks euro. Pakkumine kehtib pühapäevani. Pakkumine on ainult uutele klientidele.',
        'Diktor: Laupäeval on Kõne pood Mustamäe keskuses avatud kella kuueni. Pühapäeval on pood avatud kella neljani.',
        'Diktor: Kõne pood soovitab: enne poodi tulekut broneerige aeg internetis, siis ei pea te järjekorras ootama. Aega saab broneerida ka telefonis.',
      ], [
        ['Mida vajutab Sofia, kui internet ei tööta?', 'üks', 'kaks', 'kolm'],
        ['Mida vajutab Dmitri, kui tal on küsimus arve kohta?', 'kaks', 'üks', 'kolm'],
        ['Mitmes on Sofia järjekorras?', 'neljas', 'kuues', 'teine'],
        ['Kui kaua tuleb umbes oodata?', 'kuus minutit', 'neli minutit', 'pool tundi'],
        ['Mida teevad kliendid, kes ei taha oodata?', 'jätavad sõnumi', 'helistavad homme', 'lähevad poodi'],
        ['Millal helistatakse kliendile tagasi?', 'täna enne kella kaheksat', 'homme hommikul', 'järgmisel nädalal'],
        ['Kui palju maksab uus SIM-kaart sel nädalal?', 'üks euro', 'kaks eurot', 'viis eurot'],
        ['Mis kellani on pood laupäeval avatud?', 'kella kuueni', 'kella kaheksani', 'kella neljani'],
      ], 'g_vocab'), { task: 'L01' }),
      B.adsmatch('039_d_ads', 'Kolm paketti.', 'Loe telefonipoe pakette. Milline pakett sobib igale inimesele? Kirjuta täht.', [
        ['D. Kõne kaart, 0 € kuus', 'Ilma lepinguta kaart. Raha pannakse kaardile poes või internetis. Üks minut maksab 10 senti. Sobib turistidele ja külalistele, kes on Eestis paar nädalat. Kaardi saab osta igast poest ja kioskist. Kui raha on kaardil otsas, saab ainult vastu võtta kõnesid.'],
        ['A. Pakett Mini, 5 € kuus', 'Sobib inimesele, kes helistab vähe. Kuus saab helistada 100 minutit ja saata 100 sõnumit. Internetti on ainult 1 GB. Leping on ilma tähtajata, seda saab lõpetada iga kuu. Pensionäridele maksab pakett ainult 3 eurot. Sellel paketil on suured numbrid ja lihtne telefon, kui soovite.'],
        ['B. Pakett Maxi, 15 € kuus', 'Helistage ja kasutage internetti ilma piiranguta! Eestis ja teistes Euroopa riikides on hind sama. Õpilastele on hind 20 protsenti odavam. Leping on üheks aastaks. Esimene kuu on tasuta. Sobib inimesele, kes kasutab telefonis kaarte, e-posti ja videokõnesid.'],
        ['C. Pakett Pere, 25 € kuus', 'Neli SIM-kaarti ühele perele. Iga kaardiga saab helistada 300 minutit. Lastel on internetti 5 GB kuus. Vanemad näevad telefonis, kui palju lapsed helistavad. Pere sees on kõned tasuta. Arve tuleb ühele inimesele.'],
      ], [
        ['Malle helistab ainult Sofiale ja oma õele. Internetti ta ei kasuta.', 'A'],
        ['Sofia kasutab telefonis palju kaarte ja e-posti.', 'B'],
        ['Kadri tahab kaarte endale, Jaanile, Miale ja Oskarile.', 'C'],
        ['Lucía sõidab tihti Hispaaniasse ja helistab sealt.', 'B'],
        ['Dmitri ei taha pikka lepingut. Ta tahab lõpetada iga kuu.', 'A'],
        ['Tom õpib keelekoolis ja tahab õpilase hinda.', 'B'],
        ['Kati tuleb Sofiale kaheks nädalaks külla ja tahab Eesti numbrit.', 'D'],
        ['Jaan tahab teada, kui palju lapsed telefonis räägivad.', 'C'],
      ]),
      B.notice('039_d_notice', 'Märka: telefonis', [
        'Teenindaja: **Mis küsimuses** te helistate? · **Palun oodake.** · **Ma ühendan** teid tehnikuga.',
        'Helistaja: **Ma helistan**, sest internet ei tööta. · **Ma helistan** arve **pärast**.',
        'Kui ei kuule: **Vabandust, ma ei kuulnud.** · **Palun korrake!** · **Palun rääkige aeglasemalt.**',
        'Nimi **tähthaaval**: M, E, T, S.',
        'Automaat: Kõnesid **salvestatakse**. · Teile **helistatakse** tagasi.',
        'Lõpus: **Kas ma saan veel aidata?** · **Ei, aitäh. Head päeva!**',
      ], 'full'),
      B.match('039_d_match', 'Mida sa ütled?', 'Ühenda olukord telefonis ja sobiv lause.', [
        ['Sa ei kuulnud teenindaja nime.', 'Vabandust, palun korrake.'], ['Teenindaja räägib liiga kiiresti.', 'Palun rääkige aeglasemalt.'], ['Teenindaja küsib, miks sa helistad.', 'Ma helistan arve pärast.'],
        ['Teenindaja ei saa su nimest aru.', 'Ütlen tähthaaval: M, E, T, S.'], ['Teenindaja ütleb: „Palun oodake.”', 'Hästi, ma ootan.'], ['Sa tahad teada, mis edasi saab.', 'Mis on järgmine samm?'],
        ['Teenindaja küsib: „Kas ma saan veel aidata?”', 'Ei, aitäh. Head päeva!'], ['Sa tahad rääkida tehnikuga.', 'Palun ühendage mind tehnikuga.'],
      ], 'full', 'g_vocab'),
      tag(B.vocab('039_d_vocab', 'Tunni sõnad.', ['helistama — звонить', 'kõne — звонок', 'klienditeenindus — служба поддержки клиентов', 'telefon — телефон', 'kordama — повторять', 'tähthaaval — по буквам', 'leping — договор', 'tagasi helistama — перезвонить', 'internet — интернет', 'number — номер']), { topic: ['klienditeenindus'] }),
      teach(tag(B.speaking('039_d_call', 'Helista kaks korda.', 'Paariline on teenindaja. Ütle telefonis, mis küsimuses sa helistad.', ['Tervita ja ütle oma nimi.', 'Ütle, mis ei tööta.', 'Ütle oma nimi tähthaaval.', 'Küsi, mis on järgmine samm.', 'Täna ja jäta hüvasti.'], [60, 120], ['Ma helistan, sest …', 'Palun korrake!', 'Millal te tagasi helistate?']), { task: 'S01' }),
        'Üks-ühele: õpetaja on teenindaja ja küsib nime tähthaaval ja lepingu numbrit; õpilane helistab (selg selja vastu, nagu telefonis). Siis vahetage rollid: õpetaja helistab, õpilane on teenindaja.'),
    ],
    practice: [
      teach(tag(B.reading('039_p_sim', 'Eksaminurk: uus SIM-kaart.', 'Loe Kõne poe infot ja vasta igale küsimusele lühidalt.', 'Uus SIM-kaart: mida teha?',
        'Aitäh, et valisite Kõne! Teie uus SIM-kaart on ümbrikus. Palun lugege see juhis enne kasutamist läbi. Hoidke ümbrik alles, sest seal on ka teie lepingu number. Kõigepealt lülitage telefon välja. Siis võtke vana SIM-kaart välja ja pange uus kaart sisse.\n\nLülitage telefon jälle sisse. Telefon küsib PIN-koodi. PIN-kood on ümbrikus, kaardi all. Ärge näidake seda koodi teistele inimestele. Kui kirjutate koodi kolm korda valesti, on kaart lukus. Siis helistage klienditeenindusse.\n\nUus kaart hakkab tööle ühe tunni jooksul. Mõnikord võtab see aega kuni kaks tundi. Kui internet ei tööta ka homme, helistage meile. Kõne on tasuta.\n\nTeie pakett on Maxi. Sellega saab helistada ja internetti kasutada ilma piiranguta. Pakett maksab 15 eurot kuus. Õpilastele on hind 20% odavam.\n\nArve saadetakse teile e-postiga iga kuu esimesel päeval. Arvet saab maksta internetipangas.\n\nVana telefoninumbri võite alles jätta. Selle jaoks täitke poes avaldus. Numbri vahetus võtab aega kaks tööpäeva. Selle aja jooksul töötab teie vana kaart edasi.\n\nKui teil on küsimusi, helistage numbril 1717 või kirjutage kodulehe vestlusaknas. Klienditeenindus on avatud iga päev kell 8–20. Vestlusaknas vastatakse tavaliselt mõne minuti jooksul.',
        [['Mida tuleb teha kõigepealt?', 'lülitada telefon välja|lülitage telefon välja|telefon välja lülitada'], ['Kus on PIN-kood?', 'ümbrikus kaardi all|ümbrikus|kaardi all'], ['Mis juhtub, kui koodi kirjutab kolm korda valesti?', 'kaart on lukus|kaart läheb lukku'], ['Millal hakkab kaart tööle?', 'ühe tunni jooksul|tunni jooksul|kuni kahe tunni jooksul'], ['Kui palju maksab pakett Maxi?', '15 eurot kuus|15 eurot|viisteist eurot'], ['Millal saadetakse arve?', 'iga kuu esimesel päeval|kuu esimesel päeval'], ['Mida tuleb teha, kui tahad vana numbrit alles jätta?', 'täita poes avaldus|täitke avaldus|avaldus täita']]), { harno: 'R4' }),
        'Nagu Harno A2 lugemise 4. osas: tekst umbes 150–180 sõna. Eksamil on viis küsimust ja igal kolm valikut; siin vastab õpilane lühidalt. Aeg umbes 9 minutit.'),
      tag(B.examListen('039_p_voice', 'Kolm häälsõnumit.', 'Sofia telefonis on kolm sõnumit. Kuula kaks korda ja vali õige vastus.', 'choice', [
        'Aivar: Tere! Siin Aivar Mustamäe postkontorist. See sõnum on Sofia Metsale.',
        'Aivar: Teile on tulnud pakk Saksamaalt. Pakk on suur ja raske, umbes kümme kilo.',
        'Aivar: Pakk on postkontoris kuni laupäevani. Pärast seda saadame selle tagasi.',
        'Aivar: Võtke kaasa pass või ID-kaart. Pakk antakse välja ainult dokumendiga.',
        'Aivar: Postkontor on avatud tööpäeviti kell 9–19, laupäeval kell 10–15.',
        'Aivar: Kui te ei saa ise tulla, võib tulla ka teine inimene. Siis on vaja teie kirjalikku luba.',
        'Aivar: Paki eest ei pea maksma, see on juba makstud. Head päeva!',
        'Heli: Tere, Sofia! Siin Heli teenindusest. Teie ID-kaardi taotlus on korras.',
        'Heli: Kaart on valmis umbes kahe nädala pärast. Siis saadetakse teile sõnum.',
        'Heli: Kaarte antakse välja tööpäeviti kell 9–17. Aega pole vaja broneerida.',
        'Heli: Siis võtke ootesaalis järjekorranumber. Riigilõiv on juba makstud.',
        'Heli: Palun võtke kaasa ka pass. Ilma passita me kaarti välja ei anna.',
        'Heli: Kaart ootab teid siin kolm kuud.',
        'Kerttu: Tere! Siin Kerttu, juuksurisalong Lõige. Me saime teie sõnumi.',
        'Kerttu: Te soovisite aega reedeks, sest esmaspäeval on teil tööintervjuu.',
        'Kerttu: Meie salong on Akadeemia tee viis, apteegi kõrval. Bussipeatus on maja ees.',
        'Kerttu: Kahjuks on reede kinni. Vaba aeg on laupäeval kell üksteist.',
        'Kerttu: Laupäeval kell kolm on ka vaba, aga siis on lõikus kümme eurot kallim.',
        'Kerttu: Lõikus maksab kolmkümmend eurot. Uutele klientidele on juuksepesu tasuta.',
        'Kerttu: Palun helistage tagasi ja kinnitage aeg. Meie number on 5612 3344.',
      ], [
        ['Kust on Sofia pakk tulnud?', 'Saksamaalt', 'Soomest', 'Lätist'],
        ['Mis päevani on pakk postkontoris?', 'laupäevani', 'reedeni', 'pühapäevani'],
        ['Mida peab Sofia postkontorisse kaasa võtma?', 'passi või ID-kaardi', 'paki numbri', 'raha'],
        ['Mis uudis on Helil?', 'ID-kaardi taotlus on korras', 'ID-kaart on juba valmis', 'foto on vale'],
        ['Mida peab Sofia kaardi järele tulles kõigepealt tegema?', 'võtma järjekorranumbri', 'broneerima aja', 'maksma riigilõivu'],
        ['Kes helistab juuksurisalongist?', 'Kerttu', 'Heli', 'Marju'],
        ['Millal on juuksuris vaba aeg?', 'laupäeval kell üksteist', 'reedel kell üksteist', 'laupäeval kell kaks'],
        ['Mida palub Kerttu Sofial teha?', 'tagasi helistada', 'sõnumi saata', 'homme tulla'],
      ]), { task: 'L02' }),
      B.dialogue('039_p_chat', 'Vestlus kodulehel.', 'Sofia kirjutab Kõne kodulehe vestlusaknas. Kirjuta lünka sobiv sõna.', 'Kõne', 'Sofia', [
        ['A', 'Tere! Siin Kõne klienditeenindus. Mis [küsimuses] te kirjutate?'],
        ['B', 'Tere! Minu uues telefonis ei [tööta] internet.'],
        ['A', 'Kahju! Millal te SIM-kaardi [ostsite]?'],
        ['B', 'Eile õhtul. Ma panin kaardi telefoni ja kirjutasin PIN-koodi.'],
        ['A', 'Palun [kirjutage] oma nimi ja lepingu number.'],
        ['B', 'Sofia Mets, leping 30 482.'],
        ['A', 'Aitäh. Palun lülitage telefon välja ja uuesti [sisse].'],
        ['B', 'Tegin seda juba kaks korda. Internet ikka ei tööta.'],
        ['A', 'Selge. Siis on vaja [tehnikut]. Kas tehnik võib teile helistada?'],
        ['B', 'Jah, palun. Mu telefon töötab, ainult internetti ei ole.'],
        ['A', 'Tehnik [helistab] teile täna enne kella kolme.'],
        ['B', 'Aitäh! Kas see abi maksab midagi?'],
        ['A', 'Ei, abi on [tasuta]. Kas ma saan veel aidata?'],
        ['B', 'Ei, aitäh. Head päeva!'],
      ], 'g_notice'),
      B.transformation('039_p_polite', 'Ütle viisakalt.', 'Telefonis räägime viisakalt. Kirjuta palve teie-vormis, algus on antud.', [
        ['Korda oma telefoninumbrit veel kord!', 'Palun …', 'Palun korrake oma telefoninumbrit veel kord.|Palun korrake oma telefoninumbrit veel kord!'],
        ['Räägi natuke aeglasemalt, ma ei saa aru!', 'Palun …', 'Palun rääkige natuke aeglasemalt, ma ei saa aru.|Palun rääkige natuke aeglasemalt, ma ei saa aru!'],
        ['Ütle oma nimi tähthaaval!', 'Palun …', 'Palun öelge oma nimi tähthaaval.|Palun öelge oma nimi tähthaaval!'],
        ['Oota natuke, ma otsin lepingu numbrit!', 'Palun …', 'Palun oodake natuke, ma otsin lepingu numbrit.|Palun oodake natuke, ma otsin lepingu numbrit!'],
        ['Helista mulle homme tagasi!', 'Palun …', 'Palun helistage mulle homme tagasi.|Palun helistage mulle homme tagasi!'],
        ['Ühenda mind tehnikuga!', 'Palun …', 'Palun ühendage mind tehnikuga.|Palun ühendage mind tehnikuga!'],
        ['Jäta oma nimi ja number pärast piiksu!', 'Palun …', 'Palun jätke oma nimi ja number pärast piiksu.|Palun jätke oma nimi ja number pärast piiksu!'],
        ['Kirjuta mulle homme e-kiri!', 'Palun …', 'Palun kirjutage mulle homme e-kiri.|Palun kirjutage mulle homme e-kiri!'],
      ]),
      B.translation('039_p_tr', 'Kuidas öelda telefonis?', 'Kuidas sa seda telefonis eesti keeles ütled? Tõlgi lause.', [
        'Я звоню по поводу счёта.', 'Повторите, пожалуйста, ещё раз.', 'Говорите, пожалуйста, медленнее.', 'Моя фамилия по буквам: М, Е, Т, С.',
        'У меня не работает интернет.', 'Соедините меня, пожалуйста, с техником.', 'Когда вы мне перезвоните?', 'Спасибо, больше вопросов нет.',
      ], 'full'),
      teach(tag(B.speaking('039_p_habits', 'Telefon minu elus.', 'Küsi kolmelt inimeselt samad küsimused. Kes helistab kõige rohkem?', ['Kellele sa kõige sagedamini helistad?', 'Kas sa helistad või kirjutad sõnumi?', 'Kas sa oled helistanud klienditeenindusse? Miks?', 'Mis keeles sa telefonis räägid?', 'Mis on telefonis raske?'], [60, 120], ['Ma helistan kõige sagedamini …', 'Ma kirjutan parem sõnumi, sest …', 'Telefonis on raske …']), { fluency: true }),
        'Üks-ühele: õpilane küsib samad küsimused õpetajalt kolm korda; õpetaja vastab iga kord teise inimesena (Sofia, Malle, Tom). Lõpus ütleb õpilane, kes helistab kõige rohkem.'),
    ],
    transfer: [
      B.text('039_t_sit', 'Internet ei tööta', 'Reede hommik. Sofia uues telefonis ei ole ikka internetti. Esmaspäeval on tööintervjuu ja Sofia vajab telefonis kaarti ja e-posti. Kätlin kirjutas talle e-kirja. Tehnik Ott jättis häälsõnumi. Sofia helistab klienditeenindusse. Vaata pilti: klient helistab ja teenindaja ühendab kõne tehnikuga.'),
      B.insertion('039_t_mail', 'Kätlini e-kiri.', 'Loe Kätlini kirja. Pane igasse lünka sobiv fraas, kaks fraasi jääb üle.', 'Teie internet', [
        'Tere, Sofia!',
        '',
        'Aitäh, et kirjutasite meile [[eile õhtul]]. Vabandame, et teie internet ei tööta. Me saame aru, et see on teile tähtis.',
        '',
        'Me kontrollisime teie lepingut. Teie pakett on Maxi ja internet peab töötama [[ilma piiranguta]].',
        '',
        'Võib-olla on probleem [[telefoni seadetes]]. See juhtub tihti, kui telefon on teisest riigist. Meie tehnik Ott saab teid telefonis aidata.',
        '',
        'Palun helistage numbril 1717 ja vajutage [[interneti küsimuste jaoks]] üks. Öelge teenindajale oma lepingu number 30 482.',
        '',
        'Kui probleem jääb, tooge telefon [[Mustamäe keskuse poodi]]. Pood on laupäeval avatud kella kuueni. Võtke kaasa ka ID-kaart või pass, sest lepingu omanik peab olema poes ise. Telefoni kontroll on tasuta ja võtab umbes pool tundi.',
        '',
        'Lugupidamisega, Kätlin, Kõne klienditeenindus',
      ], ['arve küsimuste jaoks', 'eelmisel aastal']),
      tag(B.listening('039_t_ott', 'Oti häälsõnum.', 'Ott jättis Sofiale sõnumi. Kuula kaks korda. Mida Sofia peab tegema?', [
        'Ott: Tere, Sofia! Siin Ott, Kõne tehnik.',
        'Ott: Ma vaatasin teie kaarti. Kaart on korras, probleem on telefonis.',
        'Ott: Palun avage telefonis seaded ja valige mobiilne andmeside.',
        'Ott: Andmeside peab olema sees. Praegu on see väljas.',
        'Ott: Siis lülitage telefon välja ja uuesti sisse.',
        'Ott: Kui internet ikka ei tööta, helistage mulle. Ma olen tööl kella neljani.',
        'Ott: Laupäeval ma ei tööta. Siis aitab teid Kätlin poes.',
        'Ott: Kui te tulete poodi, võtke telefon ja SIM-kaardi ümbrik kaasa.',
        'Ott: Ümbrikus on PIN-kood. Ilma selleta me kaarti vahetada ei saa.',
        'Ott: Uus kaart maksab üks euro, aga teile anname selle tasuta, sest viga oli meie pool.',
        'Ott: Kui teil on küsimusi, võite kirjutada ka meie kodulehe vestlusaknas.',
        'Ott: Abi on tasuta. Head päeva!',
      ], ['Ott ütleb, et SIM-kaart on [korras], probleem on telefonis.', 'Telefonis peab Sofia avama [seaded].', 'Mobiilne andmeside peab olema [sees].', 'Pärast seda lülitab Sofia telefoni välja ja uuesti [sisse].', 'Sofia peab Otile helistama enne kella [nelja|4|16].', 'Laupäeval ei saa Ott aidata, sest ta ei [tööta].', 'Laupäeval aitab Sofiat poes [Kätlin].', 'Poodi peab Sofia kaasa võtma telefoni ja SIM-kaardi [ümbriku].']), { task: 'L06', level: 3 }),
      teach(tag(B.phoneCards('039_t_call', 'Helista klienditeenindusse.', 'A on Sofia, B on teenindaja Kätlin. Lahendage interneti probleem telefonis.',
        'Sofia uues telefonis ei tööta internet. Sofia proovis Oti nõu, aga internet ikka ei tööta. Esmaspäeval on tööintervjuu.',
        ['Sofia (küsimuste kaart)', ['Ütle, kes sa oled ja mis küsimuses sa helistad.', 'Ütle lepingu number ja nimi tähthaaval.', 'Ütle, mida sa juba proovisid.', 'Küsi, mis on järgmine samm.', 'Küsi, kas see maksab midagi.']],
        ['Kätlin (vastuste kaart)', ['Küsi lepingu numbrit ja nime.', 'Palun korrake numbrit.', 'Tehnik on hõivatud: ta helistab tagasi täna kell kolm.', 'Kui see ei aita, tooge telefon laupäeval poodi.', 'Abi on tasuta.']], [90, 120]), { main: true }),
        'Üks-ühele: õpetaja on Kätlin ja palub numbrit korrata, nime öelda tähthaaval; õpilane helistab ja kordab lõpus järgmise sammu üle. Siis vahetage: õpetaja helistab, õpilane on teenindaja.'),
      B.examWriting('039_t_reply', 'Vastus Kätlinile.', 'Vasta Kätlini e-kirjale 30–40 sõnaga: mis juhtus ja mida sa edasi teed.', 'vastus', {
        situation: 'Kätlin kirjutas sulle interneti probleemist. Sa helistasid klienditeenindusse.',
        points: ['Kas sa helistasid ja kellega sa rääkisid?', 'Kas internet töötab nüüd?', 'Mida sa edasi teed?', 'Täna Kätlinit.'],
        words: [30, 40], opening: 'Tere, Kätlin!', closing: 'Lugupidamisega, Sofia Mets',
      }),
      tag(B.speaking('039_t_record', 'Salvesta: häälsõnum klienditeenindusele.', 'Salvesta kodus 30–60 sekundit häälsõnum: sa helistad teenindusse ja jätad sõnumi.', ['Kes sa oled ja mis on sinu number?', 'Mis küsimuses sa helistad?', 'Mis on probleem ja millest see algas?', 'Mida sa juba proovisid?', 'Millal sulle võib tagasi helistada?'], [30, 60], ['Tere, siin …', 'Ma helistan, sest …', 'Palun helistage mulle tagasi …']), { task: 'S15' }),
      B.rubric('039_t_rubric', 'Hindamine.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kõnes ütleb õpilane põhjuse, numbri ja nime tähthaaval.', 'Õpilane palub korrata ja kordab järgmise sammu üle.', 'Vastuses on kõik neli punkti (30–40 sõna).', 'Häälsõnum on arusaadav ja kestab 30–60 sekundit.']),
      B.selfcheck('039_t_self', ['Ma loen klienditeeninduse infot.', 'Ma saan aru automaadist ja häälsõnumist.', 'Ma ütlen telefonis, mis küsimuses ma helistan.', 'Ma palun korrata ja ütlen nime tähthaaval.'], 'Internet töötab'),
    ],
  },

  'a2-040': {
    title: 'Kontroll 8 — teenused',
    assessment: true,
    canDo: 'Ma näitan kontrollis, et oskan broneerida aega, kasutada pean / saan / võin / tohin, täita vormi ja saada aru teeninduskõnest (vähemalt 70%).',
    discover: [
      B.text('040_d_situation', 'Kordame', 'Enne kontrolli kordame mooduli tähtsamat: aja broneerimine ja muutmine, modaalverbid, vormid ja juhised, telefon ja klienditeenindus.'),
      B.notice('040_d_notice', 'Mooduli kokkuvõte', ['Aeg: **Soovin aega… Kas … sobib? Kas on võimalik varem / hiljem?**', 'Modaalverbid: **pean minema** · **saan / võin minna** · **ei tohi minna**', 'Juhis: **täitke, kirjutage, valige, märkige, ärge unustage**', 'Telefon: **Mis küsimuses? Palun oodake. Ma ühendan. Palun korrake.**', 'Päev: **esmaspäeval, reedel, järgmisel nädalal**']),
      B.reading('040_d_read', 'Loe: Markuse päev.', 'Loe Markuse vaba päevast ja vasta igale küsimusele lühidalt.', 'Asjaajamise päev',
        'Markusel on vaba päev, aga tal on palju asju ajada. Hommikul helistab ta hambaarstile. Ta soovib aega järgmiseks nädalaks. Esmaspäev on kinni, aga teisipäeval kell neli on vaba. See sobib. Siis läheb Markus linnavalitsusse. Ta peab registreerima uue elukoha. Ta peab võtma järjekorranumbri ja ootama. Ametnik annab talle vormi. Markus täidab vormi trükitähtedega. Ta unustab allkirja, aga ametnik märkab seda. Ametnik ütleb, et vastus tuleb e-postiga kümne päeva jooksul. Pärastlõunal helistab Markus internetifirmasse. Teenindaja küsib tema nime ja aadressi. Markus ütleb tänava nime tähthaaval. Siis ühendab teenindaja ta tehnikuga. Tehnik saab tulla alles reedel. Õhtul on Markus väsinud, aga rahul.',
        [['Millal on Markuse aeg hambaarstil?', 'teisipäeval kell neli|teisipäeval kell 16'], ['Mida Markus linnavalitsuses teeb?', 'registreerib elukoha|registreerib uue elukoha'], ['Kuidas Markus vormi täidab?', 'trükitähtedega'], ['Mida Markus unustab?', 'allkirja|allkiri'], ['Millal tehnik tuleb?', 'reedel']]),
      B.truefalse('040_d_tf', 'Õige või vale?', 'Mõtle Markuse päevale. Kas lause on õige või vale?', [['Markus töötab sel päeval.', false], ['Esmaspäeval ei ole hambaarstil vaba aega.', true], ['Linnavalitsuses ei pea ootama.', false], ['Ametnik märkab, et allkiri puudub.', true], ['Tehnik tuleb samal päeval.', false]]),
      B.manymatch('040_d_match', 'Mida öelda?', 'Mida sa ütled teeninduses? Ühenda olukord ja lause.', ['Sa tahad aega arstile.', 'Pakutud aeg on liiga vara.', 'Sa ei kuulnud numbrit.', 'Sa tahad teada, kas tohib istuda.', 'Teenindaja küsib, miks sa helistad.'], ['Soovin aega arstile.', 'Kas on võimalik hiljem tulla?', 'Palun korrake numbrit.', 'Kas ma võin siin istuda?', 'Ma helistan arve pärast.'], 'full', 'g_use'),
      B.wordforms('040_d_forms', 'Õige vorm.', 'Kirjuta sõna vormis, mis on sulgudes küsitud.', [['ootama', 'pean …', 'ootama'], ['ootama', 'saan …', 'oodata'], ['täitma', 'teie käsk', 'täitke'], ['kirjutama', 'teie käsk', 'kirjutage'], ['reede', 'millal?', 'reedel'], ['tohtima', 'ma (eitus)', 'ei tohi']]),
      B.gaps('040_d_gaps', 'Kordame vorme.', 'Kirjuta lünka sulgudes olev tegusõna või päev sobivas vormis.', ['Ma [pean] homme tööl olema. (pidama)', 'Kas ma võin siin [istuda]? (istuma)', 'Saalis ei tohi [süüa]. (sööma)', 'Palun [täitke] vorm. (täitma, teie)', 'Kas teile sobib [neljapäeval]? (neljapäev)', 'Palun [oodake]! (ootama, teie)']),
      B.transformation('040_d_trans', 'Ütle teisiti.', 'Ütle sama mõte teisiti. Alusta lauset antud sõnadega.', [['Suitsetamine on keelatud.', 'Siin ei tohi …', 'Siin ei tohi suitsetada.'], ['Ma tahan aega hambaarstile.', 'Soovin …', 'Soovin aega hambaarstile.'], ['Täida vorm!', 'Palun …', 'Palun täitke vorm!'], ['Mul on võimalik reedel tulla.', 'Ma saan …', 'Ma saan reedel tulla.|Ma saan tulla reedel.'], ['Korda!', 'Palun …', 'Palun korrake!']]),
      B.errorfix('040_d_fix', 'Paranda viga.', 'Igas lauses on üks vormiviga. Kirjuta lause õigesti.', [['Ma pean minna.', 'Ma pean minema.'], ['Kas teil on reede vaba aega?', 'Kas teil on reedel vaba aega?'], ['Täitage vorm.', 'Täitke vorm.'], ['Siin ei tohi suitsetama.', 'Siin ei tohi suitsetada.'], ['Mis küsimus te helistate?', 'Mis küsimuses te helistate?']]),
      B.crossword('040_d_cross', 'Mooduli sõnad.', 'Loe vihjet ja kirjuta mooduli 8 sõna.', [['Nimi, mille kirjutad dokumendi lõppu', 'allkiri'], ['Kui aeg ei ole vaba, on see …', 'kinni'], ['Paber, millega midagi palud', 'taotlus'], ['Inimesed ootavad seal üksteise järel', 'järjekord'], ['Telefonis: palun …, ma vaatan kalendrit', 'oodake'], ['Raamatus või telefonis päevad ja ajad', 'kalender']]),
      B.translation('040_d_tr', 'Tõlgi eesti keelde.', 'Kuidas öelda seda teeninduses? Kirjuta lause eesti keeles.', ['Я хочу записаться к врачу.', 'Можно прийти раньше?', 'Здесь нельзя есть.', 'Заполните бланк печатными буквами.', 'Подождите, пожалуйста, я вас соединяю.']),
      B.dictation('040_d_dict', 'Etteütlus.', 'Õpetaja loeb viis lauset teenindusest. Kuula ja kirjuta.', ['Soovin aega hambaarstile.', 'Te peate ootama.', 'Siin ei tohi suitsetada.', 'Palun täitke vorm.', 'Ma ühendan teid tehnikuga.'], 5),
      B.wordorder('040_d_order', 'Pane lause kokku.', 'Pane Markuse päeva laused kokku. Alusta suure tähega sõnast.', ['Markus helistab hommikul hambaarstile.', 'Ta peab võtma järjekorranumbri.', 'Ametnik annab talle vormi.', 'Tehnik saab tulla alles reedel.', 'Õhtul on Markus väsinud.']),
      B.speaking('040_d_say', 'Proovieksam: teenindus.', 'Vasta paarilise küsimustele täislausega.', ['Kuhu sa viimati aega broneerisid?', 'Mida sa pead tööl või koolis tegema?', 'Mida ei tohi sinu töökohas teha?', 'Kuhu sa viimati helistasid ja miks?'], [45, 90]),
      B.writing('040_d_write', 'Kordame kirjutamist.', 'Kirjuta 5–7 lauset oma asjaajamise päevast.', [5, 7], ['pean', 'helistasin', 'aeg', 'vorm'], 2),
    ],
    practice: [
      B.tip('040_p_how', 'Kontroll: lugemine, kuulamine, keel (eksami vormis)', 'See leht on nagu Harno A2 eksami lugemine ja kuulamine. Tee kõik ilma abita. Kuulamisteksti loeb õpetaja kaks korda. Eesmärk on vähemalt 70%.', 'full'),
      tag(B.choice('040_p_polite', 'Lugemine 1. Mida öelda?', 'Lugege olukorda. Valige sobiv lause.', [
        ['Sa tahad juuksurisse aega.', 'Soovin aega juuksurisse.', 'Soovin aega kinni olla.', 'Soovin aega tühistada.'], ['Teenindaja räägib väga kiiresti.', 'Palun rääkige aeglasemalt.', 'Palun rääkige kiiremini.', 'Palun ühendage mind.'],
        ['Sa tahad teada, kas saalis tohib süüa.', 'Kas siin tohib süüa?', 'Kas siin peab sööma?', 'Kas siin sööb?'], ['Pakutud aeg sobib sulle.', 'Sobib, ma kinnitan.', 'Sobib, ma tühistan.', 'Ei sobi, aitäh.'],
        ['Teenindaja ütleb: „Palun oodake hetk.”', 'Hästi, ma ootan.', 'Head isu!', 'Palun, võtke.'], ['Sa lõpetad kõne klienditeenindusega.', 'Aitäh abi eest! Head päeva!', 'Tere tulemast!', 'Palun korrake!'],
      ], 'full', 'g_use'), { harno: 'R1' }),
      tag(B.reading('040_p_notice', 'Lugemine 2. Teade.', 'Lugege perearstikeskuse teadet. Vastake küsimustele lühidalt.', 'Perearstikeskuse uued reeglid',
        'Head patsiendid! Alates 1. oktoobrist peate aja broneerima ette. Aega saab broneerida telefonil 742 1000 või internetis. Telefon on avatud tööpäeviti kell 8–16. Ilma ajata võite tulla ainult kiire probleemiga. Kui te ei saa tulla, tühistage aeg vähemalt üks päev varem. Ooteruumis ei tohi telefoniga valjusti rääkida. Lapsed alla 12 aasta peavad tulema koos vanemaga. Esimesel visiidil täitke patsiendi ankeet. Ankeedi saate registratuurist. Võtke kaasa ID-kaart. Retsepti saab tellida telefoni teel. Kui teil on palavik ja köha, helistage enne tulekut. Siis ütleb õde, mida teha. Registratuur aitab teid eesti, vene ja inglise keeles. Ooteruumis on lastele mängunurk. Maja ees võib tasuta parkida kuni üks tund. Arsti vastuvõtt kestab tavaliselt 20 minutit. Kui jääte üle kümne minuti hiljaks, peate võib-olla uue aja võtma. Aitäh, et peate reeglitest kinni!',
        [['Alates millest peab aja ette broneerima?', '1. oktoobrist|esimesest oktoobrist'], ['Millal on telefon avatud?', 'tööpäeviti kell 8–16|kell 8–16'], ['Millal võib tulla ilma ajata?', 'kiire probleemiga|ainult kiire probleemiga'], ['Mida ei tohi ooteruumis teha?', 'telefoniga valjusti rääkida'], ['Kust saab patsiendi ankeedi?', 'registratuurist']]), { harno: 'R4' }),
      B.truefalse('040_p_tf', 'Lugemine 2b. Õige või vale?', 'Kas perearstikeskuse teate järgi on lause õige või vale?', [['Aja võib broneerida internetis.', true], ['Telefon on avatud ka laupäeval.', false], ['Kiire probleemiga võib tulla ilma ajata.', true], ['Lapsed võivad tulla üksi.', false], ['Retsepti saab tellida telefoni teel.', true]]),
      tag(B.cloze('040_p_cloze', 'Lugemine 3. E-kiri.', 'Lugege Liisi e-kirja. Valige igasse lünka üks sõna.', 'Aja muutmine', [
        'Tere! Minu nimi on Liis Saar. Mul on aeg {*neljapäeval|neljapäev|neljapäevale} kell üheksa.',
        'Kahjuks ma {*pean|võin|tohin} sel päeval tööl olema. Kas on võimalik {*tulla|tulema|tulen} hiljem?',
        'Mulle {*sobib|sobivad|sobin} reede või esmaspäev. Palun {*kinnitage|kinnitama|kinnitan} uus aeg e-postiga.',
        'Kas ma pean kaasa {*võtma|võtta|võtan} ka vana retsepti? Aitäh {*vastuse|vastus|vastusega} eest! Liis Saar',
      ]), { harno: 'R5' }),
      tag(B.listening('040_p_listen', 'Kuulamine 1. Häälsõnum.', 'Kuulake autoteeninduse sõnumit kaks korda. Kirjutage lünka 1–2 sõna.', [
        'Tere! Siin Piret autoteenindusest Kiire.', 'See sõnum on Jaan Kasele.', 'Teie aeg oli homme kell kaheksa.', 'Kahjuks ei ole meil homme vajalikku osa.',
        'Me pakume uut aega: esmaspäeval kell üks.', 'Töö kestab umbes kaks tundi.', 'Palun kinnitage aeg telefonil 640 2020.',
      ], ['Helistaja nimi on [Piret].', 'Jaani vana aeg oli homme kell [kaheksa|8].', 'Uus aeg on [esmaspäeval] kell üks.', 'Töö kestab umbes [kaks|2] tundi.', 'Aeg tuleb kinnitada [telefonil|telefoni teel].']), { harno: 'L3' }),
      B.listening('040_p_listen2', 'Kuulamine 2. Kõne pangas.', 'Õpetaja loeb kõne kaks korda. Täida märkmed.', [
        '— Pank, tere! Mis küsimuses te helistate?', '— Tere! Siin Olga Ivanova. Minu kaart ei tööta.', '— Palun öelge oma perekonnanimi tähthaaval.', '— I, V, A, N, O, V, A.',
        '— Aitäh. Teie kaart on vana. Uus kaart on kontoris.', '— Kus kontor asub?', '— Narva maanteel 15. Võtke kaasa pass.',
      ], ['Klient: Olga [Ivanova]', 'Probleem: [kaart] ei tööta', 'Uus kaart on [kontoris]', 'Aadress: Narva maantee [15|viisteist]', 'Kaasa võtta: [pass|passi]']),
      B.gaps('040_p_mix', 'Keel 1.', 'Kirjutage modaalverb või tegusõna sulgudest sobivas vormis.', ['Te [peate] passi kaasa võtma. (pidama)', 'Kas ma [võin] siin oodata? (võima)', 'Lapsed ei tohi üksi [ujuda]. (ujuma)', 'Ma pean homme vara [tõusma]. (tõusma)', 'Palun [kirjutage] oma nimi. (kirjutama, teie)']),
      B.gaps('040_p_mix2', 'Keel 2.', 'Kirjutage päev, sõna või teie-käsk sulgudest sobivas vormis.', ['Kas teile sobib [teisipäeval]? (teisipäev)', 'Ma soovin [aega] juuksurisse. (aeg)', 'Palun [märkige] õige vastus. (märkima, teie)', 'Me [saame] kaardiga maksta. (saama)', 'Ma [ühendan] teid arstiga. (ühendama)']),
      B.wordforms('040_p_forms', 'Keel 3. Vorm.', 'Kirjutage sõna vormis, mida küsitakse.', [['minema', 'pean …', 'minema'], ['minema', 'võin …', 'minna'], ['valima', 'teie käsk', 'valige'], ['andma', 'teie käsk', 'andke'], ['laupäev', 'millal?', 'laupäeval'], ['pidama', 'nad', 'peavad']]),
      B.translation('040_p_tr', 'Keel 5. Tõlgi eesti keelde.', 'Kirjutage teeninduse laused eesti keeles.', ['Можно записаться на пятницу?', 'Вы должны взять с собой паспорт.', 'Здесь нельзя громко говорить.', 'Напишите имя печатными буквами.', 'Я перезвоню вам завтра.']),
      B.errorfix('040_p_fix', 'Keel 4. Paranda viga.', 'Leidke lausest viga ja kirjutage lause õigesti.', [['Ma saan homme tulema.', 'Ma saan homme tulla.'], ['Palun ootage.', 'Palun oodake.'], ['Kas kell kaks sobivad?', 'Kas kell kaks sobib?'], ['Me peame oodata.', 'Me peame ootama.']]),
      B.wordorder('040_p_order', 'Keel 6. Pane lause kokku.', 'Pange sõnad õigesse järjekorda. Esimene sõna algab suure tähega.', ['Kas on võimalik tulla hiljem?', 'Esimesel visiidil täitke ankeet.', 'Ooteruumis ei tohi valjusti rääkida.', 'Palun kinnitage aeg telefonil.']),
      B.writing('040_p_write', 'Kirjutamine. Sõnum.', 'Kirjuta autoteenindusele 5–7 lauset: kinnita või muuda aega.', [5, 7], ['aeg', 'sobib', 'kinnitan'], 2),
      B.speaking('040_p_say', 'Rääkimine. Telefon.', 'Õpetaja on teenindaja. Helista ja broneeri aeg juuksurisse.', ['Ütle, mis küsimuses sa helistad.', 'Küsi vaba aega.', 'Palu teist aega.', 'Ütle nimi tähthaaval ja kinnita aeg.'], [60, 120]),
    ],
    transfer: [
      B.text('040_t_situation', 'Kontroll: kirjutamine ja rääkimine', 'Sa kolisid uude linna. Sul on vaja registreerida elukoht, broneerida aeg perearstile ja helistada internetifirmasse. Õpetaja hindab, eesmärk on vähemalt 70%.'),
      B.table('040_t_form', 'Kirjutamine 1. Vorm.', 'Täida elukoha registreerimise vorm.', 'Lahter, Andmed', ['Ees- ja perekonnanimi * | ', 'Isikukood või sünniaeg * | ', 'Uus aadress * | ', 'Vana aadress | ', 'Telefon * | ', 'E-post | ', 'Kuupäev ja allkiri * | ']),
      tag(B.letter('040_t_letter', 'Kirjutamine 2. E-kiri.', 'Kirjuta perearstikeskusele 40–60 sõna: soovid aega, ütled, millal sobib.', 'Tere!', 'Lugupidamisega', [40, 60]), { harno: 'W2a' }),
      B.listening('040_t_listen', 'Kuulamine. Perearstikeskuse vastus.', 'Kuulake perearstikeskuse sõnumit kaks korda. Kirjutage lünka 1–2 sõna.', [
        'Tere! Siin Kati perearstikeskusest.', 'Aitäh teie kirja eest.', 'Teile sobib aeg kolmapäeval kell pool kaksteist.', 'Arst on doktor Mets, kabinet number seitse.', 'Palun võtke kaasa ID-kaart ja tulge kümme minutit varem.',
      ], ['Helistaja nimi on [Kati].', 'Aeg on [kolmapäeval] kell pool kaksteist.', 'Kabineti number on [seitse|7].', 'Kaasa on vaja [ID-kaart|ID-kaarti].', 'Tuleb tulla [kümme|10] minutit varem.']),
      B.planning('040_t_plan', 'Enne kõnet.', 'Kirjuta märksõnad: mida sa internetifirmale ütled.', ['Kes sa oled ja kus sa elad?', 'Mis on vaja (uus internet)?', 'Millal tehnik võib tulla?'], 2),
      B.rolecards('040_t_roles', 'Rääkimine 1. Telefonikõne.', 'Helista internetifirmasse. Paariline on teenindaja.', 'Oled klient. Sa kolisid. Sul on vaja internetti uude korterisse. Ütle aadress tähthaaval. Sa oled kodus ainult õhtul või laupäeval.', 'Oled teenindaja. Küsi, mis küsimuses klient helistab. Küsi nime ja aadressi. Tehnik saab tulla neljapäeval kell 18 või laupäeval kell 10.', ['Ma helistan, sest…', 'Kas on võimalik…?', 'Palun korrake!'], ['Mis küsimuses te helistate?', 'Palun oodake.', 'Kas … sobib?']),
      tag(B.speaking('040_t_say', 'Rääkimine 1. Pilt ja küsimused.', 'Kirjeldage teeninduse pilti. Siis vastake õpetaja kahele küsimusele.', ['Kes on pildil ja kus nad on?', 'Mis asjad on teeninduslaual?', 'Kuhu sa viimati helistasid ja miks?', 'Mis vormi sa viimati täitsid ja kus?'], [60, 90]), { task: 'S06', harno: 'S1' }),
      tag(B.examWriting('040_t_write', 'Kirjutamine 3. Kirjeldus.', 'Kirjutage teemal „Minu asjaajamise päev” 40–60 sõna. Vastake kolmele küsimusele.', 'jutt', {
        situation: 'Teema: „Minu asjaajamise päev”.',
        points: ['Kuhu sa läksid või helistasid?', 'Mida sa pidid seal tegema?', 'Mis oli lihtne ja mis raske?'],
        words: [40, 60],
      }), { harno: 'W2b' }),
      B.reading('040_t_rules', 'Lugemine. Maja reeglid.', 'Loe uue maja reegleid ja vasta küsimustele.', 'Kortermaja reeglid',
        'Tere tulemast meie majja! Palun lugege reeglid läbi. Prügi peate viima hoovis olevasse konteinerisse. Klaasi ja paberit peate panema eraldi. Trepikojas ei tohi suitsetada. Rattaid võite hoida keldris. Keldri võtme saate juhatuselt. Õhtul pärast kella 22 ei tohi valjusti muusikat kuulata. Remonti võite teha tööpäeviti kell 9–19. Pesu võite kuivatada pööningul. Lemmikloomad on lubatud, aga koer peab trepikojas olema rihma otsas. Autot võite parkida ainult maja taga. Kui midagi on katki, helistage juhatusele. Uus elanik peab registreerima elukoha 30 päeva jooksul. Aitäh!',
        [['Kuhu peab prügi viima?', 'hoovis olevasse konteinerisse|konteinerisse'], ['Kus võib rattaid hoida?', 'keldris'], ['Kust saab keldri võtme?', 'juhatuselt'], ['Millal võib remonti teha?', 'tööpäeviti kell 9–19|tööpäeviti']]),
      B.translation('040_t_tr', 'Tõlgi eesti keelde.', 'Kirjutage kolimise laused eesti keeles.', ['Я переехал в новую квартиру.', 'Мне нужно зарегистрировать место жительства.', 'Мне нужен интернет.', 'Техник может прийти в субботу?', 'В подъезде нельзя курить.']),
      B.rubric('040_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti. Kokku 70% = kontroll on sooritatud.', ['Vormis on kõik kohustuslikud lahtrid täidetud.', 'E-kirjas on tervitus, palve, sobiv aeg ja lõpp (40–60 sõna).', 'Modaalverbid ja päevad on õiges vormis.', 'Telefonis ütleb õpilane põhjuse, aadressi ja lepib aja kokku.', 'Suuline lugu on arusaadav ja kestab umbes minuti.']),
      B.selfcheck('040_t_self', ['Ma täidan vormi ilma abita.', 'Ma kirjutan e-kirja aja saamiseks.', 'Ma lahendan asja telefonis.', 'Ma räägin oma asjaajamisest.'], 'Moodul 8 on läbitud'),
    ],
  },
};

// ---------------------------------------------------------------- the v6 lessons
const P036 = {
  goal: 'õppija loeb teenuse infot (lahtiolekuajad, kestus, mida kaasa võtta), küsib ja ütleb, mis aeg sobib (mulle sobib, pärast kella kahte, enne lõunat, varem / hiljem), ja kirjutab kolme inimese vastuste põhjal broneerimise sõnumi.',
  core: 'Mäletad? (3) → sõnad (4) → KÜLM ÜLESANNE „Proovi kohe: broneeri aeg” ilma abita, õpetaja paneb kirja 3 märget (4) → raamatukogu info (8) → Märka (4) → lüngad (5) → hääldusnurk: tundi / tunni (5) → eksaminurk R5: kiri lünkadega (8) → küsitlus kalendri järgi: mis aeg sobib kõigile? (6) → sõnum raamatukogule, kaaslane vastab (8) → väljumine: üks lause uuesti (2) → kodutöö ja enesekontroll (3).',
  short: 'Proovi kohe → raamatukogu info → Märka → lüngad → küsitlus kalendri järgi → sõnum → väljumine; eksaminurk ja hääldusnurk koju (Harjuta).',
  alt: 'küsitluse kaartide asemel päris kalendrid: kaks-kolm õppijat vaatavad oma telefoni kalendrit ja leiavad aja, mis sobib kõigile; sõnum läheb päris raamatukogu e-posti aadressile alles pärast õpetaja kontrolli.',
  extra: 'kuidas broneeritakse aega õppija kodumaal — kolm lauset: seal helistatakse / kirjutatakse …, aeg on tavaliselt …, mulle sobib rohkem ….',
  errors: ['„pärast kella kaks” → pärast kella kahte (osastav)', '„enne kella kümme” → enne kella kümmet', '„mina sobib” (vene „мне подходит”) → mulle sobib', '„kas teie sobib?” → kas teile sobib?'],
};
const P037 = {
  goal: 'õppija saab kuuldust aru asutuse reeglitest, ütleb, mida peab, võib ja ei tohi teha (pean ootama, võib oodata, ei tohi süüa), ja kirjutab paaris uuele õppijale 30–45-sõnalise juhendi, millele teine paar vastab.',
  core: 'Mäletad? (3) → sõnad (4) → teeninduskeskuse valvur 2× (8) → Märka (4) → proovi: minu reeglid (4) → lüngad (5) → hääldusnurk: küsimus või reegel (5) → infoletis paaris (6) → sildid pildil ja meie kool: märksõnad (6) → eksaminurk W2b = põhiülesanne: juhend uuele õppijale, teine paar vastab (10) → väljumine: üks reegel uuesti (2) → kodutöö ja enesekontroll (3).',
  short: 'valvur → Märka → lüngad → sildid → juhend → väljumine; infolett ja hääldusnurk koju (Harjuta).',
  alt: 'kooli asemel päris koht: paar kirjutab juhendi oma maja, spordiklubi või raamatukogu kohta; teine paar küsib ühe küsimuse.',
  extra: 'reeglid õppija kodumaa asutuses — kolm lauset: seal peab …, seal võib …, seal ei tohi ….',
  errors: ['„pean oodata” → pean ootama (pidama + ma)', '„võin ootama” → võin oodata (võima + da)', '„ei tohi sööma” → ei tohi süüa', '„mitte tohi” → ei tohi; „ei pea” = не обязательно, „ei tohi” = нельзя'],
};
const P038 = {
  goal: 'õppija saab aru registraatori juhistest, moodustab teie-käsu ja keelu (täitke, kirjutage, võtke, tooge, ärge unustage) ja räägib pildi järgi uuele naabrile neli sammu, kuidas perearsti juurde registreerida.',
  core: 'Mäletad? (3) → sõnad (4) → registraator 2× (8) → Märka (4) → proovi: sina oled registraator (4) → lüngad (5) → etteütlus ja varjutamine (6) → eksaminurk S2: üks küsib, teine vastab (6) → olukord (1) → juhend naabrile pildi järgi (8) → väljumine: 30 s (2) → kodutöö ja enesekontroll (3).',
  short: 'registraator → Märka → lüngad → juhend naabrile → väljumine; etteütlus ja eksaminurk koju (Harjuta).',
  alt: 'perearsti asemel teine päris asi: kuidas saada raamatukogu lugejakaart või ühiskaart — õppija räägib neli sammu teie-vormis ja naaber (õpetaja) küsib kaks küsimust.',
  extra: 'õppija loeb ühe päris eestikeelse vormi (nt raamatukogu lugejakaardi taotlus) ja ütleb, mis lahtrid on kohustuslikud.',
  errors: ['sina-vorm võõrale: „täida vorm” → täitke vorm (teie)', 'da-vorm käsu asemel: „võtta kaasa pass” → võtke kaasa pass', '„ärge unusta” → ärge unustage', 'tooma → tooge, tegema → tehke (sama mall: da-vorm tuua, teha)'],
};
const P039 = {
  goal: 'õppija loeb telefonifirma teadet (eksaminurk R4), eristab da- ja ma-vormi (tahan muuta, lähen küsima, tuleb parandama), lahendab klienditeeninduses varjatud infoga probleemi ilma valmis lauseteta ja valib kaaslasega kolmele inimesele paketi.',
  core: 'Mäletad? (3) → sõnad (4) → eksaminurk R4: telefonifirma teade (9) → Märka (4) → proovi paaris: probleem ja nõu (5) → lüngad (5) → hääldusnurk: õ, ü, ä (5) → kõne klienditeenindusse VARJATUD INFOGA (7) → otsus: kolm paketti, 45 eurot (8) → e-kiri firmale ilma antud alguseta: telli paketid (7) → väljumine: 30 s (2) → kodutöö ja enesekontroll (3).',
  short: 'teade → Märka → lüngad → kõne klienditeenindusse → otsus pildi järgi → väljumine; e-kiri ja hääldusnurk koju (Harjuta).',
  alt: 'pakettide asemel päris firma: paar vaatab ühe päris Eesti telefonifirma hinnakirja telefonis ja valib endale paketi; õpetaja küsib „miks?”.',
  extra: 'õppija ütleb, mis pakett tal praegu on, mis see maksab ja mida ta tahab muuta — kolm lauset ma- või da-vormiga.',
  errors: ['„tahan muutma” → tahan muuta (tahtma + da)', '„lähen küsida” → lähen küsima (minema + ma)', '„tehnik tuleb parandada” → tuleb parandama', '„hakkan maksta” → hakkan maksma'],
};
const P040 = {
  goal: 'kontroll 8 ja kursuse esimese 40 tunni kokkuvõte: neli oskust 10 punkti, toorpunktid, Harno skaala ja lävendid; võrdlus kontrolliga 7 ja lähtediagnostikaga (tund 1).',
  core: 'kuidas punkte loetakse (2) → lugemine 1–2 (14) → kuulamine 1–2 (10) → kirjutamine (9) → rääkimine üks-ühele (5) → tulemus ja võrdlus (5).',
  short: 'kui aega on 35 minutit: lugemine, kuulamine ja kirjutamine tunnis, rääkimine järgmise tunni alguses (5 min).',
  alt: 'rühmas: rääkimine paaris (üks teenindaja, teine klient; siis vahetus), õpetaja hindab kahte õppijat korraga sama juhendi järgi.',
  extra: 'õppija vaatab tabelit (tund 1 → kontroll 8) ja kirjutab kaks lauset: milles ta on 40 tunniga kasvanud ja mida ta Harjutas kordab.',
  errors: ['kuulamisel kirjutatakse terve lause — piisab 1–2 sõnast', 'kirjutamisel puudub üks neljast punktist', 'rääkimisel „pärast kella kaks” → pärast kella kahte, „mina sobib” → mulle sobib'],
};

export const LESSONS = withShapes({
  // ---------------------------------------------------------------- 036 reading: what time suits you (project lesson)
  'a2-036': retire(OLD['a2-036'], {
    title: 'Kas teile sobib kolmapäeval?',
    canDo: 'Ma loen raamatukogu infot, küsin, mis aeg sobib, ja kirjutan broneerimise sõnumi.',
    teacherPage: P036,
    discover: [
      teach(B.review('036_d_review', [['Mida sa ütled infoletis, kui ost on katki?', 'a2-034'], ['Mis kell on sinu lähim pood lahti?', 'a2-024'], 'Kus sa käid asju ajamas: pangas, postkontoris, raamatukogus?']), planNote(P036)),
      tag(v6(B.vocab('036_d_vocab', 'Tunni sõnad.', ['broneerima — бронировать', 'aeg — время, приём', 'vaba — свободный', 'kinni — занят, закрыт', 'varem — раньше', 'hiljem — позже', 'enne — до, перед', 'pärast — после', 'kalender — календарь', 'kinnitama — подтверждать']),
        { review: ['tasuta', 'lahti', 'pank'] }), { topic: ['broneerima', 'kinnitama', 'lugejakaart', 'lugejakaardi', 'lugejakaardiks', 'teenused', 'ekskursioon', 'arvutiabi', 'rühmatuba', 'raamatukoguhoidja', 'teenus', 'lugejatele', 'e-post', 'e-posti'] }),
      teach(tag(B.speaking('036_d_cold', 'Proovi kohe: broneeri aeg.', 'Helista õpetajale ja broneeri aeg. Ilma abita.', [
        'Mida sa soovid? Millal?',
        'Kas see aeg sobib? Kui ei, mis aeg sobib?',
        'Mida on vaja kaasa võtta?',
      ], [45, 60]), { task: 'S01', level: 3 }),
      'MOODULI KÜLM ÜLESANNE (2–3 min, enne lugemist ja reeglit): õpetaja on raamatukoguhoidja, õpilane broneerib ilma abita arvutiabi aja. Õpetaja pakub esimesena aega, mis ei sobi (teisipäeval kell kümme), ega aita ega paranda. Pane kirja kolm märget: kas õpilane ütleb aja õiges vormis (kolmapäeval, pärast kella kahte, enne lõunat), kas ta küsib teist aega (Kas on võimalik hiljem?), kas ta kordab aja lõpus üle ja on viisakas. Kontrolli 8 rääkimise 1. osa on selle paralleel (juuksur, samad kriteeriumid) — võrdle.'),
      teach(tag(B.reading('036_d_lib', 'Raamatukogu info.', 'Loe infot. Vasta ühe-kolme sõnaga.', 'Linnaosa raamatukogu: meie teenused',
        'Linnaosa raamatukogu on lahti esmaspäevast reedeni kella kümnest seitsmeni ja laupäeval kella kümnest kolmeni. Pühapäeval on raamatukogu kinni.\n\nLugejakaart on tasuta. Võta kaasa ID-kaart või pass.\n\nArvutiabi: raamatukoguhoidja aitab sind arvutiga, näiteks kui pank on kinni ja sa tahad maksta arvet internetis. Aeg kestab pool tundi. Arvutiabi on teisipäeval ja neljapäeval enne kella kahte.\n\nRühmatuba: seal saab kuni kuus inimest koos õppida kaks tundi. Tuba on vaba iga päev pärast kella kolme.\n\nEkskursioon uutele lugejatele on reedel kell neli. See on ka tasuta.\n\nAega saab broneerida telefonil 600 1234 või e-posti teel. Kui aeg sulle ei sobi, palun helista üks päev varem.',
        [['Mis päeval on raamatukogu kinni?', 'pühapäeval'], ['Kui palju maksab lugejakaart?', 'see on tasuta|tasuta|null eurot'], ['Mida on vaja lugejakaardiks kaasa võtta?', 'ID-kaart või pass|ID-kaart|pass'], ['Kui kaua kestab arvutiabi?', 'pool tundi|30 minutit'], ['Mis päevadel on arvutiabi?', 'teisipäeval ja neljapäeval|teisipäeval|neljapäeval'], ['Mitu inimest saab rühmatoas õppida?', 'kuni kuus|kuus|6'], ['Millal on rühmatuba vaba?', 'pärast kella kolme|pärast kolme'], ['Millal on ekskursioon?', 'reedel kell neli|reedel|kell neli'], ['Millal tuleb helistada, kui aeg ei sobi?', 'üks päev varem|päev varem']]), { task: 'R15' }),
      'Lugemisstrateegia (üks lause enne lugemist): „Silmitse: mis teenused siin on? Siis otsi päeva ja kellaaega.” Üks-ühele: õpilane joonib alla kõik ajad (enne kella kahte, pärast kella kolme, üks päev varem) — Märka-kastis teeb ta nendest reegli. Vanad sõnad: tasuta, lahti, pank.'),
      B.notice('036_d_notice', 'Märka: pärast kella kahte', [
        'Kellele sobib? **mulle sobib**, **teile sobib**, talle ei sobi',
        'enne + osastav: **enne kella kümmet**, **enne lõunat**',
        'pärast + osastav: **pärast kella kahte**, **pärast tööd**',
        'Kas on võimalik **varem**? **hiljem**?',
        'Lõpus kinnita: Hästi, kolmapäeval pärast kella kahte.',
        'Vene keeles „после двух” — eesti keeles pärast kella kahte (osastav).',
      ], 'half'),
    ],
    practice: [
      half(tag(B.gaps('036_p_gaps', 'Mis aeg sobib?', 'Vaata sulge ja kirjuta sobiv vorm.', [
        'Kas [teile] sobib kolmapäeval? (teie)',
        '[Mulle] sobib reedel. (mina)',
        'Ma saan tulla enne [kella] [kümmet]. (kell 10)',
        'Ma tulen pärast [tööd]. (töö)',
        'Kell kümme on mulle liiga vara. Kas saab [hiljem]? (hilja)',
        'Kell viis on liiga hilja. Kas saab [varem]? (vara)',
      ], '', 'half'), { task: 'G08' })),
      teach(tag(v6(B.choice('036_p_pron', 'Hääldusnurk: tundi või tunni?', 'Kuula sõna, vali õige. Siis ütle lause kaasa.', [
        ['Sõna 1', 'tundi', 'tunni'],
        ['Sõna 2', 'kahe', 'kahte'],
        ['Sõna 3', 'kümne', 'kümmet'],
      ], 'half', 'g_listen'), { pronunciation: 'välted' }), { task: 'G13' }),
      'Hääldusnurk, 5 min. Ütle igast reast võtmes oleva sõna (tundi, kahe, kümne); õpilane valib. Selgita: osastav on pikk ja tugev (pärast tundi, pärast kella kahte, enne kella kümmet), omastav lühike ja nõrk (tunni aja pärast, kahe inimese jaoks, kümne minuti pärast). Siis varjutamine: loe „Mulle sobib neljapäeval pärast kella kahte.”, õpilane räägib kohe kaasa, kaks korda. Vene keelt kõnelejal: topelttäht (mm, nn) on päriselt pikem, mitte ainult tugevam.'),
      teach(tag(B.cloze('036_p_mail', 'Eksaminurk: kiri sõbrale.', 'Loe kirja. Vali igasse lünka sobiv sõna.', 'Tere, Olga!', [
        'Eile käisin {*raamatukogus|raamatukogu|raamatukogule} ja tegin endale lugejakaardi. See on tasuta! Raamatukoguhoidja oli väga sõbralik.',
        '',
        'Seal on ka arvutiabi. Ma broneerisin {*aja|aeg|ajal} neljapäevaks. Kell kümme oli kinni, aga kell üksteist {*sobis|sobib|sobima} mulle hästi.',
        '',
        'Reedel on raamatukogus ekskursioon uutele {*lugejatele|lugejad|lugeja}. Kas sa tuled ka? See algab kell neli, nii et saad tulla pärast {*tööd|töö|tööga}.',
        '',
        'Kui reede sulle ei sobi, {*kirjuta|kirjutama|kirjutad} mulle. Ma helistan raamatukokku ja küsin teist {*aega|aeg|aja}. Raamatukogu on lahti ka {*laupäeval|laupäev|laupäevani}.',
        '',
        'Kallistan, Rita',
      ]), { harno: 'R5', level: 3 }),
      'Eksaminurk nagu Harno A2 lugemise 5. osas: isiklik kiri (≈ 80 sõna) ja 8 lünka, igas kolm valikut; 8 min, ilma abita. Siis kontroll: miks just see vorm? Õpilane ütleb reegli (pärast + osastav: pärast tööd; millal? laupäeval).'),
    ],
    transfer: [
      teach({ ...tag(B.table('036_t_cal', 'Küsitlus: mis aeg sobib kõigile?', 'Küsi kahelt. Vaata kalendrit. Kirjuta, mis aeg sobib.', 'Kes?, Mis päev sobib?, Mis kell sobib?, Mis ei sobi?', [
        'Mina |  |  | ',
        'Inimene 2 |  |  | ',
        'Inimene 3 |  |  | ',
        'Rühmatuba (pilt): vaba |  |  | ',
        'Meie aeg |  |  | ',
      ]), { task: 'S09', level: 3, fluency: true }), inLesson: true },
      'Küsitlus kalendri järgi (6 min). Olukord: rühm (kolm inimest) tahab raamatukogu rühmatuba kaheks tunniks. Õpilane küsib kahelt täislausega (Mis päeval sulle sobib? Kas pärast kella nelja sobib?), kirjutab vastused märksõnadena, vaatab pildilt, millal tuba on vaba, ja leiab aja, mis sobib kõigile. Rühmas vastavad kaaslased oma päris aja järgi. Üks-ühele: õpetaja vastab kahe kaardi järgi — Rein: esmaspäeval ei saa, kolmapäeval ja reedel sobib alles pärast kella nelja (pärast tööd); õpetaja ise: esmaspäev või kolmapäev sobib, reedel mitte. Kalender pildil: rühmatuba 15–17 esmaspäeval vaba, teisipäeval kinni, kolmapäeval vaba, neljapäeval kinni, reedel vaba (arvutiabi ja ekskursioon on teised teenused). Võti üks-ühele: kõigile sobib kolmapäeval pärast kella nelja. Paranda ainult aega (pärast kella nelja) ja sõna mulle / teile.'),
      teach(tag(v6(B.examWriting('036_t_mail', 'Sõnum raamatukogule: meie aeg.', 'Kirjuta küsitluse järgi raamatukogule 25–40 sõna.', 'teade', {
        situation: 'Rühm (kolm inimest) tahab rühmatuba kaheks tunniks. Kaaslane on raamatukoguhoidja ja vastab.',
        points: ['kes te olete ja mida soovite', 'mis päeval ja mis kell teile sobib', 'mis aeg ei sobi', 'üks küsimus (nt mida kaasa võtta)'],
        words: [25, 40],
      }), {
        lines: 4, taskType: 'survey', realAddressee: 'raamatukogu (rühma broneering)',
        support: ['Tere! Meie rühm soovib …', 'Meile sobib … pärast kella …', '… ei sobi, sest …'],
        stretch: 'Paku ka teine aeg, kui see aeg on kinni.',
      }), { task: 'W02', main: true, level: 4 }),
      'Kirjutamine tunnis, 8 min, küsitluse järgi (kõigile sobiv aeg). Siis vastab kaaslane raamatukoguhoidjana ühe lausega (Kolmapäeval kell neli on tuba vaba. / Kahjuks on kinni, kas kell viis sobib?). Üks-ühele: õpetaja vastab. Abikaart: kolm lausealgust (märgi kasutamine). Lisaväljakutse: teine aeg. Kontrolli 8 kirjutamine on selle paralleel (aja muutmine perearstikeskuses, samad neli punkti).'),
      homeTask(teach(tag(B.speaking('036_t_home', 'Kodus: minu raamatukogu.', 'Vaata päris raamatukogu lehte. Salvesta 45 sekundit. Siis Harjuta → moodul 8.', [
        'Keskraamatukogu (https://www.keskraamatukogu.ee) või sinu raamatukogu: millal lahti, millal sulle sobib?',
      ], [45, 60]), { task: 'S15' }),
      'Seosülesanne: õppija avab ise ühe päris raamatukogu lehe (lehte sisse ei kopeerita) ja salvestab 45–60 s: lahtiolekuajad ja mis aeg talle sobib (pärast tööd, enne lõunat). Harjuta → moodul 8: sõnad ja aeg (10 min). Järgmise tunni „Mäletad?” küsib seda.')),
      half(exitCheck(tag(v6(B.writing('036_t_exit', 'Väljumine: parem lause.', 'Kirjuta üks lause sõnumist uuesti, kaaslase vastuse järgi.', [1, 2]), { lines: 2 }), { task: 'W10', level: 3 }))),
      half(teach(selfcheck('036_t_self', ['Loen infost aja.', 'Ütlen: pärast kella kahte.', 'Kirjutan, mis aeg sobib.'], 'Tund 36 on läbitud'), 'Üks-ühele: õpilane hindab kolme rida; õpetaja ütleb, kas tema kui raamatukoguhoidja sai sõnumist kõigest aru. Õpilane kirjutab ühe lause (Meile sobib …) tõendiks.')),
    ],
  }),

  // ---------------------------------------------------------------- 037 listening: must, may, must not
  'a2-037': retire(OLD['a2-037'], {
    title: 'Siin ei tohi süüa',
    canDo: 'Ma saan kuuldust aru asutuse reeglitest ja kirjutan uuele õppijale juhendi: mida peab, võib ja ei tohi.',
    teacherPage: P037,
    discover: [
      teach(B.review('037_d_review', [['Mis aeg sulle sobib: enne või pärast tööd?', 'a2-036'], ['Kuidas sa maksad poes: kaardiga või sularahas?', 'a2-029'], 'Mis reeglid on sinu töökohas või koolis?']), planNote(P037)),
      tag(v6(B.vocab('037_d_vocab', 'Tunni sõnad.', ['silt — табличка, знак', 'pidama — быть должным', 'võima — мочь, можно', 'tohtima — сметь, разрешено', 'lubatud — разрешено', 'ootama — ждать', 'dokument — документ', 'number — номер', 'ekraan — экран', 'foto — фото']),
        { review: ['järjekord', 'maksma', 'kassa'] }), { topic: ['teeninduskeskus', 'reegel', 'reeglid', 'keelatud', 'järjekorranumbri', 'järjekorranumber', 'ooteruum', 'ooteruumis', 'tohtima', 'pildistama', 'pildistada', 'valvur', 'juhend', 'valjusti', 'lauda'] }),
      twice(teach(tag(B.listening('037_d_guard', 'Teeninduskeskuses.', 'Kuula valvurit kaks korda. Kirjuta lünka üks-kaks sõna.', [
        'Klient: Tere! Ma tulin ID-kaarti tegema. Kuhu ma pean minema?',
        'Valvur: Tere! Kõigepealt peate võtma järjekorranumbri. Automaat on ukse kõrval.',
        'Klient: Kas järjekord on pikk? Kas ma pean kaua ootama?',
        'Valvur: Täna on palju inimesi. Te võite oodata umbes pool tundi.',
        'Klient: Kas ma võin vahepeal kohvi juua?',
        'Valvur: Kohvi võite juua kohvikus. Ooteruumis ei tohi süüa ega juua.',
        'Klient: Selge. Kas ma saan maksta sularahas?',
        'Valvur: Ei, siin saab maksta ainult kaardiga. Kassat meil ei ole.',
        'Klient: Kas ma pean foto kaasa tooma?',
        'Valvur: Ei pea. Foto teeme siin ja see on tasuta.',
        'Valvur: Ooteruumis ei tohi telefoniga valjusti rääkida. Kui teie number tuleb ekraanile, peate minema lauda neli.',
      ], ['Kõigepealt peab võtma [järjekorranumbri|numbri].', 'Täna võib oodata umbes [pool tundi|30 minutit].', 'Ooteruumis ei tohi [süüa] ega juua.', 'Teeninduses saab maksta ainult [kaardiga].', 'Foto teeb teenindus ise ja see on [tasuta].', 'Kui number tuleb ekraanile, peab minema lauda [neli|4].'], 'g_listen'), { task: 'L04' }),
      'Kuulamisstrateegia (enne esimest kuulamist): „Ennusta: mida teeninduses peab tegema? Loe laused enne läbi.” Esimesel korral kirjutab õpilane ainult kindlad vastused, teisel korral ülejäänud. Siis küsi: mida ei tohi teha? (süüa, juua, valjusti rääkida). Vanad sõnad: järjekord, maksma, kassa.')),
      B.notice('037_d_notice', 'Märka: pean ootama, võin oodata', [
        'pidama + ma: **pean ootama**, **pead võtma**',
        'võima, saama, tohtima + da: **võin oodata**, **saab maksta**',
        'Keeld: **ei tohi süüa**, **ei tohi rääkida** · pole vaja: **ei pea tooma**',
        'Vene keeles „должен ждать” ja „можно ждать” (üks vorm) — eesti keeles pean ootama, aga võin oodata.',
      ], 'half'),
      half(teach(tag(B.speaking('037_d_mine', 'Proovi: minu reeglid.', 'Ütle kolm reeglit oma tööst või koolist.', [
        'Mida sa pead seal tegema?',
        'Mida sa seal võid või saad teha?',
        'Mida seal ei tohi teha?',
      ], [60, 75]), { task: 'S02', level: 3, fluency: true }),
      'Juhendatud kasutus kohe pärast Märka-kasti: õpilane ütleb kolm reeglit oma elust (Tööl pean kell kaheksa alustama. Lõunal võin süüa köögis. Koolis ei tohi tunnis telefoniga rääkida.). Õpetaja kordab õiget vormi, kui õpilane ütleb pean oodata või võin ootama.')),
    ],
    practice: [
      half(tag(B.gaps('037_p_gaps', 'Pean, võin, ei tohi.', 'Kirjuta tegusõna õiges vormis.', [
        'Kõigepealt pead [võtma] järjekorranumbri. (võtta)',
        'Ooteruumis võib [oodata]. (ootama)',
        'Siin ei tohi [süüa]. (sööma)',
        'Kas ma saan [maksta] kaardiga? (maksma)',
        'Ma pean homme uuesti [tulema]. (tulla)',
        'Telefoniga ei tohi valjusti [rääkida]. (rääkima)',
        'Fotot ei pea kaasa [tooma]. (tuua)',
        'Kas siin [tohib] pildistada? (tohtima)',
      ], '', 'half'), { task: 'G03' })),
      teach(tag(v6(B.choice('037_p_pron', 'Hääldusnurk: küsimus või reegel?', 'Kuula lauset. Vali: küsimus või reegel. Siis korda.', [
        ['Lause 1', 'küsimus', 'reegel'],
        ['Lause 2', 'reegel', 'küsimus'],
        ['Lause 3', 'küsimus', 'reegel'],
        ['Lause 4', 'reegel', 'küsimus'],
      ], 'half', 'g_listen'), { pronunciation: 'intonatsioon' }), { task: 'G13' }),
      'Hääldusnurk, 5 min. Loe: 1 „Kas siin tohib süüa?” 2 „Siin ei tohi süüa.” 3 „Kas ma pean ootama?” 4 „Te võite oodata.” Õpilane valib, siis kordab iga lause kaks korda (varjutamine). Eesti küsimus Kas …? läheb lõpus alla — küsimuse teeb sõna kas, mitte hääl üles nagu vene keeles. Keelus on rõhk sõnal tohi: „Siin ei TOHI süüa.” Rõhk on alati sõna esimesel silbil (ootama, oodata).'),
      teach(tag(B.rolecards('037_p_info', 'Infoletis.', 'A küsib, B vastab reeglite järgi. Siis vahetage.',
        'Sa tahad teha uue passi. Küsi: kas pead võtma numbri, kas võid oodata kohvikus, kas saad maksta sularahas, kas pead foto kaasa tooma?',
        'Sa oled teenindaja. Reeglid: number on vaja; kohvikus võib oodata, number tuleb ka telefoni; maksta saab ainult kaardiga; foto teeme siin, see on tasuta.',
        [], []), { task: 'S10', level: 3, fluency: true }),
      'Üks-ühele: õpetaja on teenindaja ja vastab kaardi järgi; teisel korral kiiremini ja õpilane on teenindaja (õpetaja küsib). Paranda ainult pean + ma ja võin / saan / tohin + da.'),
    ],
    transfer: [
      teach(tag(B.speaking('037_t_signs', 'Sildid: mida siin tohib?', 'Vaata silte. Ütle: mida peab, võib, ei tohi?', [
        'Sildid 1–2: mida siin peab tegema?',
        'Sildid 3–4: mida siin võib või saab teha?',
        'Sildid 5–6: mida siin ei tohi teha?',
        'Ja meie koolis: üks reegel, mis on sama, ja üks, mis on teine?',
      ], [60, 75]), { task: 'S06', level: 3 }),
      'Enne kirjutamist (6 min, plaani asemel): pildil on teeninduskeskuse kuus silti, sõnad algvormis (number, ekraan, wifi tasuta, kaart, söök, telefon valjusti). Õpilane teeb ise lause modaalverbiga. Võti: 1 = Kõigepealt peab võtma numbri. 2 = Peab ootama, kuni number tuleb ekraanile. 3 = Wifi võib kasutada tasuta. 4 = Maksta saab ainult kaardiga. 5 = Siin ei tohi süüa. 6 = Telefoniga ei tohi valjusti rääkida. 4. küsimus viib juhendini: paar ütleb, mis reeglid on koolis samad ja mis teised, ja paneb need märksõnadena kirja. Paranda ainult ma / da (pean ootama, võib oodata).'),
      teach(tag(v6(B.examWriting('037_t_text', 'Juhend uuele õppijale.', 'Kirjuta paaris 30–45 sõna: meie kooli reeglid.', 'kirjeldus', {
        situation: 'Rühma tuleb uus õppija. Juhend läheb seinale; teine paar loeb ja küsib ühe küsimuse.',
        points: ['mida peab tegema (nt kui tuled hiljaks)', 'mida võib või saab teha (nt köök, raamatud)', 'mida ei tohi teha', 'kelle käest küsida'],
        words: [30, 45],
      }), {
        lines: 4, taskType: 'project', peerReply: true, realAddressee: 'uus õppija ja rühma kaaslased (juhend seinal)',
        support: ['Meie koolis peab …', 'Köögis võib …', 'Tunnis ei tohi …'],
        stretch: 'Lisa üks reegel, mida koolis veel ei ole, aga mis on vaja.',
      }), { harno: 'W2b', task: 'W05', main: true, level: 4 }),
      'Eksaminurk nagu Harno A2 kirjutamise 2. osas (kirjeldus kolme küsimuse järgi, ≥ 30 sõna) — siin on see ka tunni põhiülesanne. Kirjutamine paaris, 10 min. Siis teise paari vastus (mooduli kaaslase vahetus): lehed liiguvad, teine paar loeb ja kirjutab alla ühe küsimuse (Kas köögis võib ka süüa?) või „kaks tärni ja üks soov” (kas kõik neli punkti on olemas? kas pean + ma, võin + da on õiged?). Üks-ühele: õpetaja on teine paar. Abikaart: kolm lausealgust (märgi kasutamine). Lisaväljakutse: uus reegel.'),
      homeTask(teach(tag(B.speaking('037_t_home', 'Kodus: reeglid minu majas.', 'Salvesta 45 sekundit: reeglid sinu majas või töökohas. Siis Harjuta → moodul 8.', [
        'Mida seal peab tegema? Mida võib? Mida ei tohi?',
      ], [45, 60]), { task: 'S15' }),
      'Kodune salvestus: kolm reeglit oma majast, töökohast või spordiklubist, igaühes pean / võin / ei tohi. Tunnis kuulab õpetaja salvestuse ja küsib ühe küsimuse. Harjuta → moodul 8: pean + ma, võin + da (10 min).')),
      half(exitCheck(tag(v6(B.writing('037_t_exit', 'Väljumine: parem reegel.', 'Kirjuta üks reegel uuesti, teise paari küsimuse järgi.', [1, 2]), { lines: 2 }), { task: 'W10', level: 3 }))),
      half(teach(selfcheck('037_t_self', ['Saan aru: peab, võib.', 'Kirjutan: pean ootama.', 'Uus õppija saab aru.'], 'Tund 37 on läbitud'), 'Üks-ühele: õpilane hindab kolme rida; õpetaja ütleb, kas uus õppija saaks juhendist aru. Õpilane kirjutab ühe reegli tõendiks.')),
    ],
  }),

  // ---------------------------------------------------------------- 038 listening: the teie-imperative at the family doctor's
  'a2-038': retire(OLD['a2-038'], {
    title: 'Täitke vorm, palun',
    canDo: 'Ma saan kuuldust aru registraatori juhistest ja räägin uuele naabrile sammhaaval, mida teha.',
    teacherPage: P038,
    discover: [
      teach(B.review('038_d_review', [['Mida peab teeninduskeskuses kõigepealt tegema?', 'a2-037'], ['Mida sa ütled, kui arvel on viga?', 'a2-029'], 'Kas sa oled Eestis mõne vormi täitnud? Mis vormi?']), planNote(P038)),
      tag(v6(B.vocab('038_d_vocab', 'Tunni sõnad.', ['vorm — бланк, форма', 'täitma — заполнять', 'allkiri — подпись', 'andmed — данные', 'perearst — семейный врач', 'registreerima — регистрировать', 'isikukood — личный код', 'aadress — адрес', 'valima — выбирать', 'alla kirjutama — подписать']),
        { review: ['muutma', 'viga', 'kuni'] }), { topic: ['perearst', 'perearstikeskus', 'perearstikeskuses', 'registraator', 'registreerima', 'registreerida', 'isikukood', 'trükitähed', 'trükitähtedega', 'kohustuslik', 'allkiri', 'allkirja', 'registratuur', 'registratuuri', 'juhend', 'doktor'] }),
      twice(teach(tag(B.listening('038_d_listen', 'Perearstikeskuses.', 'Kuula registraatorit kaks korda. Kirjuta lünka üks-kaks sõna.', [
        'Registraator: Tere! Perearstikeskus, kuidas saan aidata?',
        'Klient: Tere! Ma kolisin Tallinna ja tahan siin perearsti juurde registreerida.',
        'Registraator: Selge. Palun täitke see vorm. Kirjutage trükitähtedega.',
        'Klient: Mida ma pean kirjutama?',
        'Registraator: Kirjutage oma nimi, isikukood, aadress ja telefon. E-post ei ole kohustuslik.',
        'Registraator: Valige ka arst: doktor Tamm või doktor Kask.',
        'Klient: Kas andmeid saab hiljem muuta?',
        'Registraator: Jah, kuni reedeni saab andmeid muuta.',
        'Klient: Oi, ma tegin vea. Aadress on vale.',
        'Registraator: Pole hullu, see on väike viga. Võtke uus vorm.',
        'Registraator: Kirjutage alla ja andke vorm mulle tagasi. Ja ärge unustage allkirja!',
      ], ['Klient tahab registreerida [perearsti] juurde.', 'Vormi tuleb kirjutada [trükitähtedega].', 'Vormis ei ole kohustuslik [e-post].', 'Arsti saab valida: doktor Tamm või doktor [Kask].', 'Andmeid saab muuta kuni [reedeni].', 'Kliendi vormis on vale [aadress].', 'Lõpus ei tohi unustada [allkirja].'], 'g_listen'), { task: 'L03' }),
      'Kuulamisstrateegia: „Kuula märksõnu: mida kirjutada? mida valida? mida mitte unustada?” Esimesel korral kirjutab õpilane ainult kindlad vastused, teisel korral ülejäänud. Siis loe stsenaariumist kõik käsud (täitke, kirjutage, valige, võtke, andke, ärge unustage) — need on Märka-kasti näited. Vanad sõnad: muutma, viga, kuni.')),
      B.notice('038_d_notice', 'Märka: täitke vorm, palun', [
        'Teie, palun: **täitke**, **kirjutage**, **võtke**, **tulge**',
        'da-vormist: kirjutada → **kirjutage**, võtta → **võtke**, täita → täitke',
        'Keeld: **ärge unustage**, **ärge tulge** hiljaks',
        'Sina: võta, täida! → teie: võtke, täitke! (viisakas)',
        'Vene keeles „заполните” — eesti keeles täitke (lõpus -ke või -ge).',
      ], 'half'),
      half(teach(tag(B.speaking('038_d_try', 'Proovi: sina oled registraator.', 'Ütle kliendile kolm juhist. Kasuta teie-vormi.', [
        'Mida klient peab vormi kirjutama?',
        'Mida ta peab kaasa võtma?',
        'Mida ta ei tohi unustada?',
      ], [45, 60]), { task: 'S02', level: 3, fluency: true }),
      'Juhendatud kasutus kohe pärast Märka-kasti: õpilane on registraator, õpetaja klient. Võti: Kirjutage nimi ja isikukood trükitähtedega. Võtke kaasa ID-kaart. Ärge unustage allkirja! Õpetaja kordab õiget vormi, kui õpilane ütleb sina-vormi (kirjuta → kirjutage).')),
    ],
    practice: [
      half(tag(B.gaps('038_p_gaps', 'Teie, palun!', 'Kirjuta käsk teie-vormis.', [
        'Palun [täitke] see vorm. (täitma)',
        '[Kirjutage] trükitähtedega. (kirjutama)',
        '[Võtke] kaasa pass. (võtma)',
        'Palun [tulge] kell kümme. (tulema)',
        '[Andke] vorm mulle tagasi. (andma)',
        '[Tooge] homme ka foto. (tooma)',
        '[Ärge] [unustage] allkirja! (ära unusta)',
        '[Valige] endale arst. (valima)',
      ], '', 'half'), { task: 'G05' })),
      teach(half(v6(tag(B.dictation('038_p_dict', 'Etteütlus ja varjutamine: juhised.', 'Kuula, räägi kaasa ja kirjuta lause.', [
        'Palun täitke see vorm.',
        'Kirjutage oma nimi trükitähtedega.',
        'Isikukood on kohustuslik.',
        'Võtke kaasa ID-kaart.',
        'Ärge unustage allkirja.',
      ], 5), { task: 'L08' }), { pronunciation: 'varjutamine' })),
      'Hääldusnurk + etteütlus, 6 min. Enne: varjutamine — loe registraatori kaks lauset („Palun täitke see vorm. Kirjutage trükitähtedega.”), õpilane räägib kohe kaasa, kaks korda; rõhk on esimesel silbil (täitke, kirjutage). Siis loe iga etteütluse lause kaks korda; õpilane kordab valjusti ja kirjutab. Kontrolli: täitke (tk), võtke (tk), trükitähtedega, isikukood.'),
      teach(tag(B.rolecards('038_p_card', 'Eksaminurk: küsi ja vasta.', 'A küsib kaardi järgi, B vastab. Siis vahetage.',
        'Küsi B-lt perearstikeskuse kohta: kus see on? · millal on lahti? · kuidas registreerida? · mida kaasa võtta? · kas see maksab?',
        'Küsi A-lt raamatukogu kohta: kus see on? · millal on lahti? · kuidas saada lugejakaart? · mida kaasa võtta? · kas see maksab?',
        [], []), { harno: 'S2', task: 'S05', level: 3 }),
      'Eksaminurk nagu Harno A2 rääkimise 2. osas: märksõnakaart, üks küsib täislausega, teine vastab; siis vahetus. 6 min. Õpilane vastab oma linna päris info järgi või mõtleb välja. Üks-ühele: õpetaja vastab kõigepealt (perearstikeskus Kase tänaval, E–R 8–16, vorm registratuuris, ID-kaart, tasuta), siis küsib tema. Hinda nagu eksamil: kas küsimused on täislaused (Kus see asub? Millal see on lahti?).'),
    ],
    transfer: [
      B.text('038_t_sit', 'Olukord: uus naaber', 'Sinu majja kolis uus naaber. Ta on sinust vanem ja ei tea, kuidas Eestis perearsti juurde registreerida. Vaata pilti: neli sammu. Räägi talle lihtsalt ja selgelt. Ütle talle „teie”.'),
      teach(tag(v6(B.speaking('038_t_steps', 'Juhend naabrile: neli sammu.', 'Vaata pilti. Seleta naabrile 45–60 sekundiga, mida teha.', [
        'Sammud 1–4: mida naaber peab tegema? Kasuta teie-vormi.',
        'Naaber küsib: Kas see maksab? Millal ma vastuse saan?',
      ], [45, 75]), {
        taskType: 'presentation', realAddressee: 'uus naaber, kes ei tea, kuidas perearsti valida',
        support: ['Kõigepealt minge …', 'Siis täitke …', 'Ärge unustage …'],
        stretch: 'Naaber ei saa keskusesse minna: seleta, kuidas seda teha internetis.',
      }), { task: 'S13', main: true, level: 4 }),
      'Esitlus pildi järgi, 8 min: õpilane räägib neli sammu teie-vormis, siis küsib naaber (õpetaja) kaks küsimust. Pildi võti: 1 vali arst (dr Tamm või dr Kask) → Valige arst. 2 täida vorm trükitähtedega: nimi, isikukood, aadress, telefon → Täitke vorm trükitähtedega. 3 kirjuta alla → Kirjutage alla, ärge unustage allkirja. 4 anna vorm registratuuri → Andke vorm registratuuri; vastus tuleb SMS-iga kahe nädala jooksul, see on tasuta. Üks-ühele: õpetaja on naaber ja küsib uuesti, kui õpilane ütleb sina-vormi. Abikaart: kolm lausealgust (märgi kasutamine). Lisaväljakutse: internetis.'),
      homeTask(teach(v6(tag(B.examWriting('038_t_home', 'Kodus: minu eesti keele võrgustik.', 'Loe üht päris juhendit. Kirjuta 25–40 sõna. Harjuta → moodul 8.', 'teade', {
        situation: 'Leia üks päris eestikeelne juhend, nt „Perearsti valimine” portaalis eesti.ee (https://www.eesti.ee) või oma perearstikeskuse lehel. Kirjuta oma meediapäevikusse.',
        points: ['mis lehte sa lugesid', 'üks uus sõna sellelt lehelt', 'üks juhis teie-vormis (nt Täitke …)', 'kas juhend oli lihtne või raske ja miks'],
        words: [25, 40],
      }), { task: 'W12' }), { mediaLog: true }),
      'Meediapäevik „Minu eesti keele võrgustik” (mooduli kirje): õppija avab ise ühe päris eestikeelse juhendi (lehte sisse ei kopeerita) ja kirjutab neli punkti, ühe juhise teie-vormis. Järgmisel tunnil loeb ta oma uue sõna ette. Harjuta → moodul 8: teie-käsk (10 min).')),
      half(exitCheck(tag(B.speaking('038_t_exit', 'Väljumine: juhend lühidalt.', 'Ütle 30 sekundiga uuesti: neli sammu naabrile.', [
        'Mida naaber peab tegema? Teie-vormis.',
      ], [30, 45]), { task: 'S16', level: 3, fluency: true }))),
      half(teach(selfcheck('038_t_self', ['Saan aru registraatori juhistest.', 'Ütlen: täitke, võtke, ärge unustage.', 'Naaber saab minust aru.'], 'Tund 38 on läbitud'), 'Üks-ühele: õpetaja ütleb, kas „naaber” sai kõigest aru; õpilane hindab kolme rida ja kirjutab ühe juhise teie-vormis tõendiks.')),
    ],
  }),

  // ---------------------------------------------------------------- 039 reading: customer service (the module's last teaching lesson)
  'a2-039': retire(OLD['a2-039'], {
    title: 'Klienditeenindus, tere!',
    canDo: 'Ma loen telefonifirma teadet, räägin klienditeenindusega ilma valmis lauseteta ja valin kaaslasega paketi.',
    teacherPage: P039,
    discover: [
      teach(B.review('039_d_review', [['Mida naaber peab perearsti juures tegema? Ütle teie-vormis.', 'a2-038'], ['Kui palju sa maksad kuus telefoni eest?', 'a2-029'], 'Kas sa helistad vahel klienditeenindusse? Miks?']), planNote(P039)),
      tag(v6(B.vocab('039_d_vocab', 'Tunni sõnad.', ['pakett — пакет услуг', 'leping — договор', 'klient — клиент', 'kõne — звонок', 'lõpetama — заканчивать', 'kuus — в месяц', 'internet — интернет', 'firma — фирма', 'minut — минута', 'teade — объявление']),
        { review: ['hind', 'arve', 'kokku'] }), { topic: ['pakett', 'paketti', 'paketid', 'leping', 'lepingu', 'klienditeenindus', 'klienditeenindusse', 'piiramatu', 'piiramatud', 'tehnik', 'kehtima', 'kliendinumber', 'GB', 'telefonifirma', 'Mini', 'Pere', 'Hea'] }),
      teach(tag(B.reading('039_d_info', 'Eksaminurk: telefonifirma teade.', 'Loe teadet. Vasta küsimustele ühe-kolme sõnaga.', 'Telefonifirma Kõne: uued paketid',
        'Head kliendid! Alates 1. jaanuarist on meil kolm uut paketti.\n\nPakett Mini maksab 5 eurot kuus. Sellega saab helistada 100 minutit ja internetti on 5 GB.\n\nPakett Hea maksab 12 eurot kuus. Kõned on piiramatud ja internetti on 30 GB.\n\nPakett Pere on kolmele inimesele. Igaühel on piiramatud kõned ja 50 GB internetti. Kolm inimest maksavad kokku 25 eurot kuus.\n\nKui soovid paketti muuta, helista klienditeenindusse 1500 või tule meie poodi. Paketti saab muuta üks kord kuus. Uus hind hakkab kehtima järgmise kuu esimesest päevast.\n\nArve saadame iga kuu viiendal päeval e-posti. Kui arvel on viga, kirjuta meile kahe nädala jooksul.\n\nKlienditeenindus on avatud iga päev kella kaheksast kaheksani.',
        [['Kui palju maksab pakett Mini kuus?', '5 eurot|viis eurot'], ['Mis paketis on kõned piiramatud ja hind 12 eurot?', 'Hea|pakett Hea'], ['Mitmele inimesele on pakett Pere?', 'kolmele|kolmele inimesele|3'], ['Kuhu helistada, kui soovid paketti muuta?', 'klienditeenindusse|numbril 1500|1500'], ['Mitu korda kuus saab paketti muuta?', 'üks kord|üks|1'], ['Mis päeval tuleb arve?', 'viiendal päeval|kuu viiendal päeval|viiendal'], ['Mille jooksul tuleb arve veast kirjutada?', 'kahe nädala jooksul|kahe nädala'], ['Mis kellast on klienditeenindus avatud?', 'kaheksast|kella kaheksast|8-st']]), { harno: 'R4', task: 'R13' }),
      'Eksaminurk nagu Harno A2 lugemise 4. osas (≈ 120-sõnaline tekst; eksamil 150 sõna ja valikvastused), 9 min ilma abita. Lugemisstrateegia: „Loe küsimused enne läbi, siis otsi tekstist numbrid.” Kontroll: õpilane näitab tekstis sõna, mis aitas. Vanad sõnad: hind, arve, kokku.'),
      B.notice('039_d_notice', 'Märka: tahan muuta, lähen küsima', [
        'Mida teha? (da): **tahan muuta**, **soovin lõpetada**',
        'Kuhu? Mida tegema? (ma): **lähen küsima**, tehnik **tuleb parandama**',
        'Hakkan ka + ma: **hakkan maksma**',
        'Tund 37: pean + ma (pean ootama), võin + da (võin oodata)',
        'Vene keeles „хочу узнать” ja „пойду узнать” (üks vorm) — eesti keeles tahan teada, aga lähen küsima.',
      ], 'half'),
      teach(tag(B.rolecards('039_d_try', 'Proovi: mida sa teed?', 'A ütleb probleemi, B annab nõu. Siis vahetage.',
        'Sinu probleemid: 1) internet ei tööta kaks päeva; 2) arve on 30 eurot, aga pakett maksab 12; 3) pakett on sulle liiga kallis. Ütle B-le üks probleem korraga ja ütle, mida sa tahad.',
        'Kuula A probleemi. Ütle, mida A peab tegema või kuhu minema. Siis ütle, mida sina teed, kui sul on sama probleem.',
        [], []), { task: 'S11', level: 3 }),
      'Juhendatud kasutus, ilma valmis fraasideta (mooduli viimane tund): õpilane ütleb igale probleemile kaks lauset, üks da- ja üks ma-vormiga. Võti nt: 1 = Ma tahan teada, miks internet ei tööta. Ma lähen poodi küsima. 2 = Ma tahan arvet kontrollida. Ma hakkan helistama klienditeenindusse. 3 = Ma soovin paketti muuta. Kui õpilane ütleb ainult ühe lause, küsi: „Ja siis?” Teisel korral vahetage: õpetaja ütleb probleemi, õpilane annab nõu (Te peate helistama … / Minge poodi küsima).'),
    ],
    practice: [
      half(tag(B.gaps('039_p_gaps', 'Ma või da?', 'Ma või da? Kirjuta sobiv vorm.', [
        'Ma tahan oma paketti [muuta]. (muutma)',
        'Ma soovin lepingu [lõpetada]. (lõpetama)',
        'Homme lähen poodi [küsima]. (küsida)',
        'Tehnik tuleb neljapäeval internetti [parandama]. (parandada)',
        'Uue paketi eest hakkan [maksma] 12 eurot kuus. (maksta)',
        'Kas te saate arve e-posti [saata]? (saatma)',
        'Ma tulin poodi uut telefoni [vaatama]. (vaadata)',
        'Mulle ei meeldi telefoniga kaua [oodata]. (ootama)',
      ], '', 'half'), { task: 'G02' })),
      teach(tag(v6(B.choice('039_p_pron', 'Hääldusnurk: õ, ü, ä.', 'Kuula ja vali õige sõna. Siis räägi kaasa.', [
        ['Sõna 1', 'kõik', 'kiik'],
        ['Sõna 2', 'sõda', 'süda'],
        ['Sõna 3', 'kära', 'kera'],
        ['Sõna 4', 'võib', 'viib'],
      ], 'half', 'g_listen'), { pronunciation: 'vokaalid' }), { task: 'L01' }),
      'Hääldusnurk, 5 min. Ütle igast reast võtmes oleva sõna (kõik, sõda, kära, võib); õpilane valib. Näita suu kuju: õ — huuled laiad, keel taga; ü — huuled ümarad nagu u, keel ees nagu i; ä — suu lahti. Siis varjutamine: loe „Ma tahan oma paketti muuta. Kas te saate mind aidata?”, õpilane räägib kohe kaasa, kaks korda. Vene keelt kõnelejal: õ ei ole „ы”, ü ei ole „ю”, ä on lahtisem kui „э”.'),
      teach(v6(tag(B.rolecards('039_p_call', 'Kõne klienditeenindusse.', 'A helistab, B on teenindaja. Lahendage probleem ilma valmis lauseteta.',
        'Sinu kodus ei tööta internet juba kolm päeva. Sinu pakett maksab 12 eurot, aga sel kuul on arve 30 eurot. Arve number on A-1234. Helista ja lahenda mõlemad asjad.',
        'Sa oled klienditeenindaja. Küsi nime ja kliendinumbrit või arve numbrit. Kuula probleemi ja paku lahendus.',
        [], []), { task: 'S04', level: 4, fluency: true }), { hiddenInfo: true }),
      'Üks-ühele, ilma valmis fraasideta: õpetaja on teenindaja. Varjatud info (ütle alles kõne ajal): 1) tehnik saab tulla alles neljapäeval kella kümnest kaheni ja klient peab siis kodus olema — kui see ei sobi, peab klient ise küsima teist aega; 2) arvel on viga, 18 eurot tuleb tagasi järgmisel arvel, aga ainult siis, kui klient ütleb arve numbri (A-1234). Kui õpilane ei küsi, millal raha tagasi tuleb, ära ütle seda ise. Teisel korral vahetage: õpilane on teenindaja.'),
    ],
    transfer: [
      teach(tag(v6(B.rolecards('039_t_pick', 'Otsus: kolm paketti.', 'Vaata pilti. Valige koos igale inimesele pakett.',
        'Sina räägid vanaemast ja õpilasest: mida nad teevad telefoniga ja mis pakett neile sobib? Pere maksab kokku kuni 45 eurot kuus.',
        'Sina räägid perest (ema, isa, poeg): mida nad teevad telefoniga? Siis arvutage koos: kas 45 eurost piisab?',
        [], []), {
        taskType: 'ranking',
        support: ['vanaema · helistab palju · Mini või Hea?', 'õpilane · videod · palju GB', 'kokku · 45 € · sobib / liiga kallis'],
        stretch: 'Hinnad tõusevad 2 eurot: kas teie otsus muutub?',
      }), { task: 'S03', main: true, level: 4 }),
      'Otsus paaris, 8 min, pildi järgi (kolm inimest ja kolm paketti). Abikaart on märksõnad, mitte laused (mooduli viimane tund). Võimalik lahendus: vanaema helistab iga päev pool tundi → Mini (100 minutit) ei piisa → Hea 12 €; õpilane vaatab palju videoid → Hea 12 €; pere → Pere 25 €; kokku 49 € — liiga kallis. Siis peab paar otsustama: vanaemale Mini (5 €) ja ta helistab vähem või õpilane võtab Mini; nt 5 + 12 + 25 = 42 €. Õige on iga põhjendatud otsus kuni 45 euroni. Üks-ühele: õpetaja on B ja tahab alguses kõigile kõige paremat paketti; õpilane arvutab ja põhjendab. Lisaväljakutse: hinnad + 2 €.'),
      teach(tag(B.examWriting('039_t_order', 'E-kiri firmale: meie paketid.', 'Kirjuta firmale Kõne 25–40 sõna. Ilma antud alguseta.', 'teade', {
        situation: 'Te valisite kolm paketti. Nüüd kirjuta telefonifirma Kõne klienditeenindusele ja telli need.',
        points: ['mis paketid te soovite ja kellele', 'millest alates', 'mis on teie küsimus (nt arve, leping)', 'sinu nimi ja telefon'],
        words: [25, 40],
      }), { task: 'W08', level: 3 }),
      'Mooduli viimane tund: kiri ilma antud alguse ja valmis lauseteta, 8 min, otsuse järgi. Kontrolli: kas kõik neli punkti on olemas, kas da / ma on õige (soovin tellida, hakkame maksma), kas kuupäev ja hind on õiged (alates esimesest jaanuarist, 42 eurot kuus). Kui aega ei jää, on see kodune kiri (Harjuta → moodul 8).'),
      homeTask(teach(tag(B.speaking('039_t_home', 'Kodus: minu telefon ja internet.', 'Salvesta 45 sekundit: kas sinu pakett sobib? Siis Harjuta → moodul 8.', [
        'Mis pakett sul on, mis see maksab ja mida sa tahad muuta?',
      ], [45, 60]), { task: 'S15' }),
      'Kodune salvestus ilma valmis fraasideta: oma telefon või internet (või välja mõeldud). Tunnis kuulab õpetaja salvestuse ja küsib ühe küsimuse. Harjuta → moodul 8: ma- ja da-vorm (10 min); kirjuta oma üks viga Harjutas „Minu vead” alla õigesti.')),
      half(exitCheck(tag(B.speaking('039_t_exit', 'Väljumine: meie otsus.', 'Ütle 30 sekundiga: mis paketid te valisite ja miks?', [
        'Kellele mis pakett ja miks? Kui palju see kokku maksab?',
      ], [30, 45]), { task: 'S16', level: 3, fluency: true }))),
      half(teach(selfcheck('039_t_self', ['Leian teatest hinna ja reegli.', 'Räägin teenindajaga ilma abita.', 'Valime paketid ja põhjendame.'], 'Moodul 8: teenused ja asjaajamine'), 'Üks-ühele: õpilane hindab kolme rida, õpetaja ütleb oma hinde; õpilane kirjutab ühe lause oma otsusest tõendiks.')),
    ],
  }),

  // ---------------------------------------------------------------- 040 control 8: one sheet, four skills (the first 40 lessons)
  'a2-040': retire(OLD['a2-040'], {
    title: 'Kontroll 8 — teenused ja asjaajamine',
    assessment: true,
    phases: checkSheet('Kontroll', 'Lugemine, kuulamine, kirjutamine ja rääkimine, igaüks 10 punkti (45 min)'),
    canDo: 'Ma näitan ilma abita, et loen teenuste teateid, saan aru teeninduse kõnedest, kirjutan aja muutmise kirja ja broneerin aega; ma tean oma punkte ja lävendeid.',
    teacherPage: P040,
    discover: [
      teach(B.text('040_d_situation', 'Kontroll 8: kuidas punkte loetakse', `Kontrollis on neli osa, igas 10 punkti, kokku 40. Töötad 45 minutit ilma abita. Harno A2 eksamil on igas osas 20 punkti: korruta oma punktid kahega. ${THRESHOLDS} Kontroll 8 lõpetab kursuse esimesed 40 tundi: lõpus võrdled tulemust kontrolliga 7 (tund 35) ja lähtediagnostikaga (tund 1).`), planNote(P040)),
      teach(tag(B.choice('040_p_polite', 'Lugemine 1. Mida öelda?', 'Mida sa ütled? Vali sobiv lause. (5 punkti)', [
        ['Pakutud aeg ei sobi sulle.', 'Kas on võimalik tulla hiljem?', 'Aitäh, see aeg sobib mulle.', 'Ma tulen kindlasti.'],
        ['Sa ei saanud teenindaja numbrist aru.', 'Palun korrake.', 'Palun oodake.', 'Palun täitke.'],
        ['Teenindaja ütleb: „Palun võtke järjekorranumber.”', 'Kust ma numbri saan?', 'Head isu!', 'Mul on kiire, head aega.'],
        ['Sa tahad teada, kas ooteruumis võib süüa.', 'Kas siin tohib süüa?', 'Kas siin peab sööma?', 'Kas te sööte siin?'],
        ['Kampsun on sulle liiga väike.', 'Kas teil on suuremat?', 'Kas teil on väiksemat?', 'Kas see on odavam?'],
      ], 'full', 'g_read'), { harno: 'R1', task: 'R01' }),
      'Varasemast: 5. küsimus (suuremat) on moodulist 7. Iga õige vastus 1 punkt.'),
      teach(tag(B.reading('040_d_read', 'Lugemine 2. Perearstikeskuse teade.', 'Loe teadet. Vasta ühe-kolme sõnaga. (5 punkti)', 'Perearstikeskus Pärn: uued reeglid',
        'Alates jaanuarist on perearstikeskus Pärn uues majas, Kase tänav 3, esimesel korrusel. Me oleme avatud esmaspäevast reedeni kella kaheksast neljani.\n\nArsti juurde peate aja broneerima. Aega saab broneerida telefonil 655 4433 või meie kodulehel. Aeg arsti juures on tavaliselt kakskümmend minutit. Kui aeg ei sobi, palun muutke seda vähemalt üks päev varem. Kui te ei saa tulla, helistage meile kindlasti. Ilma ajata võite tulla ainult kiire probleemiga, kella kaheksast üheksani.\n\nUued patsiendid, palun täitke registratuuris vorm. Võtke kaasa ID-kaart või pass. Lastele on vaja ka ema või isa allkirja. Kui teil on küsimusi, aitab registraator teid hea meelega.\n\nOoteruumis ei tohi telefoniga valjusti rääkida. Kohvi saab juua teisel korrusel kohvikus.\n\nMaja ees on parkla. Seal võib tasuta parkida üks tund. Buss number 12 peatub maja kõrval. Tere tulemast!',
        [['Mis korrusel on perearstikeskus?', 'esimesel|esimesel korrusel'], ['Mis kellani on keskus avatud?', 'neljani|kella neljani|16-ni'], ['Millal tuleb aega muuta?', 'üks päev varem|päev varem|vähemalt üks päev varem'], ['Mida peavad uued patsiendid täitma?', 'vormi|vormi registratuuris'], ['Kui kaua võib maja ees tasuta parkida?', 'üks tund|ühe tunni|tund']]), { task: 'R15', harno: 'R4' }),
      'Varasemast: 1. küsimus (mis korrusel) on moodulist 4, 2. küsimus (mis kellani) moodulist 5. Harno-pikkune tekst (≈ 125 sõna). Iga õige vastus 1 punkt; kirjaviga ei loe, kui sõna on arusaadav.'),
      twice(teach(tag(B.listening('040_p_listen', 'Kuulamine 1. Häälsõnum.', 'Kuula häälsõnumit kaks korda. Kirjuta lünka üks-kaks sõna. (5 punkti)', [
        'Piret: Tere! Siin on Piret juuksurisalongist Täpp.',
        'Piret: Teie aeg on homme, kolmapäeval, kell kümme.',
        'Piret: Kahjuks olen ma homme hommikul haige.',
        'Piret: Kas teile sobib neljapäeval pärast kella kahte, näiteks kell pool kolm?',
        'Piret: Või reedel enne lõunat, kell üksteist.',
        'Piret: Palun helistage mulle tagasi täna kella kuueni.',
        'Piret: Minu number on viis viis üks kaks, kolm neli viis kuus. Vabandust ja aitäh!',
      ], ['Vana aeg on kolmapäeval kell [kümme|10].', 'Juuksur on homme [haige].', 'Uus aeg neljapäeval on kell [pool kolm|14.30].', 'Reedel saab tulla enne [lõunat].', 'Tagasi tuleb helistada täna kella [kuueni|18-ni].'], 'g_listen'), { task: 'L03', harno: 'L3' }),
      'Mooduli 8 aeg (tund 36). Iga õige lünk 1 punkt; kirjaviga ei loe, kui sõna on arusaadav.'), true),
      twice(teach(tag(B.listening('040_p_listen2', 'Kuulamine 2. Kõne klienditeenindusse.', 'Kuula kõnet kaks korda. Kirjuta lünka üks-kaks sõna. (5 punkti)', [
        'Teenindaja: Klienditeenindus, tere! Kuidas saan aidata?',
        'Olga: Tere! Minu arvel on viga. Arve on kakskümmend eurot, aga minu pakett maksab kümme.',
        'Teenindaja: Palun öelge oma nimi ja kliendinumber.',
        'Olga: Olga Ivanova, kliendinumber neli kaks seitse üheksa.',
        'Teenindaja: Aitäh. Jah, arvel on viga. Raha tuleb tagasi järgmisel arvel.',
        'Olga: Hästi. Ja ma tahan oma paketti muuta. Ma vajan rohkem internetti.',
        'Teenindaja: Pakett Hea maksab kaksteist eurot kuus. Uus pakett hakkab kehtima esimesel jaanuaril.',
        'Olga: Sobib. Aitäh!',
      ], ['Arve on [kakskümmend|20] eurot.', 'Kliendi pakett maksab [kümme|10] eurot.', 'Raha tuleb tagasi järgmisel [arvel].', 'Klient vajab rohkem [internetti].', 'Uus pakett maksab [kaksteist|12] eurot kuus.'], 'g_listen'), { task: 'L03', harno: 'L3' }),
      'Varasemast: 1. lünk (arve summa — viga arvel) on moodulist 6. Iga õige lünk 1 punkt; kirjaviga ei loe, kui sõna on arusaadav.'), true),
      teach(tag(B.examWriting('040_t_write', 'Kirjutamine. Uus aeg.', 'Kirjuta perearstikeskusele 25–40 sõna. (10 punkti)', 'teade', {
        situation: 'Sul on reedel kell üheksa aeg perearsti juurde. Reedel sa ei saa: sul on tööl koosolek. Kirjuta perearstikeskusele e-kiri.',
        points: ['kes sa oled ja mis aeg sul on', 'miks see aeg ei sobi', 'mis päeval ja mis kell sulle sobib', 'üks küsimus (nt mida kaasa võtta)'],
        words: [25, 40],
      }), { task: 'W04', harno: 'W2a' }),
      'Üks-ühele: õpilane kirjutab üksi, ilma abita ja ilma antud alguseta. See on tunni 36 põhiülesande („Sõnum raamatukogule: meie aeg”) paralleel: samad neli punkti, uus asutus. Hinda allpool oleva juhendi järgi (kirjutamise viis rida).'),
      teach(tag(B.speaking('040_t_say', 'Rääkimine. Aeg telefonis ja minu asjad.', 'Broneeri õpetajalt aeg ja vasta kahele küsimusele. (10 punkti)', [
        '1. osa: broneeri juuksuri juurde aeg (mis päeval, mis kell, mis ei sobi, kinnita aeg).',
        '2. osa: mis reeglid on sinu majas või töökohas?',
        '2. osa: kuidas sa maksad arveid: internetis, poes või pangas? Miks?',
      ], [45, 75]), { task: 'S04', harno: 'S2' }),
      'Üks-ühele: õpetaja on juuksur, siis eksamineerija. 1. osa on tunni 36 külma ülesande („Proovi kohe: broneeri aeg”) paralleel — teine teenus, samad kolm märget (aeg õiges vormis, küsib teist aega, kinnitab ja on viisakas); esimene pakutud aeg ei sobi. Võrdle oma märkmetega. Ära aita. Hinda allpool oleva juhendi järgi.'),
      teach(B.table('040_t_score', 'Hindamine: kirjutamine ja rääkimine.', 'Õpetaja paneb igale reale 0, 1 või 2 punkti.', 'Hindamisrida (0 / 1 / 2), Punktid', [
        'Kirjutamine, sisu: 2 = kõik neli punkti; 1 = kaks-kolm punkti; 0 = üks punkt või vähem. | ',
        'Kirjutamine, pikkus ja sõnum: 2 = 25–40 sõna ja keskus saab kõigest aru; 1 = alla 25 sõna või osa on segane; 0 = tekstist ei saa aru. | ',
        'Kirjutamine, vormid: 2 = päev, kellaaeg (pärast kella kahte) ja mulle / teile sobib peaaegu alati õiged; 1 = mitu viga, aga arusaadav; 0 = vormidest ei saa aru. | ',
        'Kirjutamine, sõnavara: 2 = teenuse ja aja sõnad õiged; 1 = mõni sõna puudub või on vale; 0 = sõnu on väga vähe. | ',
        'Kirjutamine, algus ja lõpp: 2 = tervitus ja lõpp sobivad; 1 = üks puudub; 0 = mõlemad puuduvad. | ',
        'Rääkimine, broneerimine: 2 = ütleb, mida soovib, küsib teist aega ja kinnitab; 1 = üks-kaks asja; 0 = broneerimist ei ole. | ',
        'Rääkimine, vormid: 2 = pärast kella kahte, mulle sobib, pean / võin peaaegu alati õiged; 1 = mitu viga, aga arusaadav; 0 = raske aru saada. | ',
        'Rääkimine, vastused: 2 = kaks vastust täislausega ja detailiga; 1 = üks vastus või ainult sõnad; 0 = ei vasta. | ',
        'Rääkimine, sõnavara: 2 = teenuse, aja ja raha sõnad õiged; 1 = mõni sõna puudub; 0 = sõnu on väga vähe. | ',
        'Rääkimine, arusaadavus: 2 = kuulaja saab kõigest aru (pausid on lubatud); 1 = kuulaja peab mõnikord üle küsima; 0 = raske aru saada. | ',
      ]), 'Õpetajale: kirjutamise viis rida annavad kirjutamise punktid (/10), rääkimise viis rida rääkimise punktid (/10). Lugemine 5 + 5 küsimust ja kuulamine 5 + 5 lünka, iga õige vastus 1 punkt — kokku 10 + 10 + 10 + 10 = 40.'),
      teach(B.table('040_t_result', 'Minu tulemus: tunnid 1–40.', 'Kirjuta punktid ja võrdle. Ükski osa ei tohi olla 0 punkti.', 'Osa, Punktid (/10), Harno skaala (/20), Kontroll 7 (%), Tund 1 (%), Mida harjutada?', [
        'Lugemine |  |  |  |  | ',
        'Kuulamine |  |  |  |  | ',
        'Kirjutamine |  |  |  |  | ',
        'Rääkimine |  |  |  |  | ',
        'Kokku (/40) |  |  |  |  | ',
      ]), 'Õpetajale: Harno järgi sooritatud = kokku ≥ 24/40 (60 %) ja ükski osa ei ole 0. KeeleSepa sisemine lävi: eksamiks valmis ≥ 28/40 (70 %), sertifikaat ≥ 32/40 (80 %). Tund 1 (%) = lähtediagnostika (a2-001) sama osa protsent — nii näeb õppija oma 40 tunni kasvu. Kui osa on alla 6/10, anna üks parandusülesanne: lugemine → Harjuta „Lugemine” (moodul 8), kuulamine → tunni 37 või 38 salvestis uuesti ilma tekstita, kirjutamine → sama kiri parandatult, rääkimine → uus salvestus „Minu aeg juuksuri juures”. Varasemast (moodulid 4–7) on 4 küsimust 20-st (20 %): lugemine 1.5, lugemine 2.1 ja 2.2, kuulamine 2.1.'),
    ],
  }),
}, {
  'a2-036': 'PROJ R→W', 'a2-037': 'KIRJ L→W', 'a2-038': 'RÄÄK L→S', 'a2-039': 'LUGE R→S', 'a2-040': 'EKS',
});
