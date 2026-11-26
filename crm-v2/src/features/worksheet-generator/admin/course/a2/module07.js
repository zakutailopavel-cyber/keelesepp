// A2 course (A1 → A2 roadmap), module 7 „Pood, raha ja ostud” (a2-031…035), stage A2- (lessons 021–050).
// Methodology v5 for A2 (docs/METHODOLOGY_A2_V5.md) AND methodology v6 (docs/METHODOLOGY_V6.md, gates G14–G25), in the
// pattern of A2 modules 5–6:
//   - every teaching lesson: ≤ 14 blocks (≤ 5 / 4 / 5) in a 60-minute lesson; one input; one learning picture on the page of
//     its task (art/visuals/a2-module-07.js); a 5-minute pronunciation corner (data.pronunciation: 031 välted — the long
//     partitive against the short genitive, kotti / koti; 032 the dictation of prices + varjutamine; 033 intonatsioon;
//     034 vokaalid); the rule box („Märka”, bold forms, one „Vene keeles … — eesti keeles …” line) is produced by the
//     Harjuta form task, whose hints are the dictionary form, a number or the other form of the pair, never the answer;
//   - Kasuta in the standard order: situation → main task (data.taskType, data.support = „Abikaart”, data.stretch =
//     „Lisaväljakutse”) → home task (homeTask, always „Harjuta → moodul 7”) → exit check (exitCheck: 30 s of speech after
//     a speaking main task, one rewritten line after a writing main task) beside the self-check (three success criteria
//     0–1–2 + one own sentence, data.evidence);
//   - main-task types rotate and differ from modules 5–6 (survey, infogap, phone, ranking; presentation, roleplay, project,
//     message): 031 jigsaw (two shop cards, the pair chooses one present for 40 €), 032 mediation (a neighbour who does not
//     read Estonian asks about a shop's flyer), 033 report (a price comparison for the group's „Säästuleht”, a classmate
//     answers: data.peerReply), 034 narrative (a picture story of a return, without ready phrases or a given opening);
//   - spaced retrieval: every vocab block carries data.review (3 words from 3–15 lessons back, used again in the lesson);
//   - real network: 031's message goes to the group chat, 032's home task is the media log („Minu eesti keele võrgustik”,
//     a real shop page with its URL), 033's report goes to a classmate who answers, 034's story to the group's blog;
//   - Harno A2 exam corners spread over the module (COURSE_FINAL_SHAPE_A2.md, finalShape.js profile a2): 031 R2 (sentences
//     ↔ three short texts), 032 L3 (the input, short answers), 033 S1 (the picture + topic questions), 034 W1 (a text from
//     a business card); the control tags R1, R4, L3, W1, S2;
//   - a teacher page per lesson (lesson.teacherPage); until the A2 sheet renders it, the same plan stands in the teacher
//     note of the lesson's „Mäletad?” block.
//   031 PROB R→S  „Mida te otsite?” — a department store's gift leaflet (reading). otsima / vajama / mul on vaja +
//                 adjective and noun in the partitive (sinist tassi, sooja salli) against the nominative (mul on sinine
//                 tass); the module's COLD TASK („Proovi kohe: poes” without help, its parallel is the control's speaking 1);
//                 the store's floors in the picture = guided use; the R2 corner; main: a jigsaw — A knows the store, B the
//                 fair, together they choose a present for 40 €.
//   032 AVAS L→S  „Kahe euro eest” — a store's radio announcement (listening, the L3 corner). Numbers in the genitive:
//                 kümne euro eest, viie euroga, kahekümne protsendi soodustus, kuni kolmekümne euroni; the dictation of
//                 prices (5 sentences); a call about a second-hand ad (bargaining); main: mediation — the learner explains
//                 the flyer in the picture to a neighbour who does not read Estonian.
//   033 KUUL L→W  „Kas teil on suuremat?” — at a second-hand shop (listening). The comparative (odavam, soojem, parem …
//                 kui; Kas teil on suuremat?); a fitting-room role play; Kasuta opens with the S1 corner on the picture of
//                 two jackets; main: a 30–45-word price comparison for the group's „Säästuleht”, read and answered by a
//                 classmate (the situation is in the task card, no separate situation block).
//   034 LUGU R→W  „Kviitung on alles” — the story of a kettle that broke (reading). kuni reedeni, kahe nädala jooksul, kahe
//                 aasta garantii, kviitungiga / ilma karbita, tagastada / vahetada; the info desk with HIDDEN INFORMATION
//                 (G9); the W1 corner (a business card); the module's last teaching lesson: one speech and one text without
//                 ready phrases or a given opening (G9); main: a picture story of a return — keywords per frame beside the
//                 picture (the plan), then 30–45 words on the next page.
//   035 EKS       Control 7 (one sheet, 9 blocks, 45 min): reading, listening, writing, speaking 10 points each; raw points,
//                 the Harno scale (× 2), the thresholds named one way, „ükski osa ei tohi olla 0 punkti”; 4 of the 20 closed
//                 items recycle modules 4–6 (teacher note „Varasemast”); writing parallel to 034's business-card corner,
//                 speaking 1 parallel to 031's cold task.
// No lesson uses the continuing story's cast (G7). Dictation: one, in 032 (5 sentences). Texts are learning texts, the
// people and places are invented (Marta, Igor, Kristel, Galina, kaubamaja Täht, pood „Uus Elu” …); real pages are named only
// by title and URL. The final-shape module (2026-10-29, one storyline with Sofia, Malle, Grete, Anna …) is kept below as OLD:
// every old block keeps its id and comes back hidden (retire), so learners' saved answers keep their key and Harjuta still
// draws on the old form tasks.
import { B, hide, tag, teach, withShapes } from '../blocks.js';
import { exitCheck, homeTask } from '../stationBlocks.js';

export const MODULE = { id: 'a2-module-07', course: 'a2', title: 'Pood, raha ja ostud', level: 'A2', design: 'v2', template: 'v4' };

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
  'a2-031': {
    title: 'Kingitus Mallele',
    canDo: 'Ma ütlen poes, mida ma otsin (sinist tassi, sooja salli), küsin hinda ja värvi ning lepin sõbraga kokku, mis kingitus 40 euro eest osta.',
    discover: [
      B.review('031_d_review', [['Mida sa ütled, kui arvel on viga?', 'a2-029'], ['Mis mööbel on sinu toas? Ütle kolm asja.', 'a2-016'], 'Kas sa maksad poes kaardiga või sularahas?']),
      B.text('031_d_goal', 'Moodul 7: pood, raha ja ostud', 'On novembri lõpp ja Tallinnas on juba külm. Pühapäeval on Malle sünnipäev. Grete ja Sofia tahavad talle kingituse osta. Aga raha on vähe ja Grete on terve nädala tööl. Selles moodulis käid koos Sofiaga kaubamajas, turul ja kasutatud riiete poes. Sa küsid hinda, võrdled ja valid. Mooduli lõpus tagastad poes katkise asja ja kirjutad, kuidas see läks.'),
      tag(B.reading('031_d_chat', 'Grete ja Sofia sõnumid.', 'Loe korteri vestlust. Mis probleem on Gretel ja Sofial? Vasta lühidalt.', 'Korteri vestlus',
        'Grete, 7.50: Sofia, mul on halb uudis. Ma lõhkusin täna hommikul Malle sinise tassi.\n\nSofia, 7.55: Oi ei! See on ju tema lemmiktass. Ta joob sellest iga päev teed.\n\nGrete, 7.58: Jah. Ja pühapäeval on tema sünnipäev. Ostame talle uue sinise tassi?\n\nSofia, 8.02: Hea mõte! Aga kust me sellise tassi saame?\n\nGrete, 8.05: Kaubahallist, neljandalt korruselt. Seal on kodukaubad. Mul on sel kuul raha vähe. Kas kahe peale nelikümmend eurot sobib?\n\nSofia, 8.07: Sobib. Mul on kakskümmend eurot ja sul on ka kakskümmend.\n\nGrete, 8.10: Ma olen kolmapäeval ja neljapäeval terve päeva tööl. Kas sa saad homme üksi poodi minna?\n\nSofia, 8.12: Jah, ma lähen pärast keeletundi. Kaubahallis töötab Anna, Jaani vana tuttav. Ta aitab mind kindlasti.\n\nGrete, 8.15: Super! Malle armastab ka head teed ja lilli. Aga palun ära räägi talle midagi!\n\nSofia, 8.16: Muidugi mitte. See on meie saladus.\n\nGrete, 8.18: Osta palun ka üks ilus kaart. Kirjutame sellele mõlemad midagi head.',
        [['Mis juhtus Malle tassiga?', 'Grete lõhkus selle|see läks katki|Grete lõhkus tassi'], ['Mis värvi oli Malle tass?', 'sinine|sinist värvi'], ['Millal on Malle sünnipäev?', 'pühapäeval'], ['Kui palju raha on Gretel ja Sofial kokku?', 'nelikümmend eurot|40 eurot|40'], ['Miks Sofia läheb poodi üksi?', 'Grete on tööl|sest Grete on tööl|Grete on terve päeva tööl'], ['Kes aitab Sofiat Kaubahallis?', 'Anna|Jaani vana tuttav Anna'], ['Mida Malle veel armastab?', 'head teed ja lilli|teed ja lilli|lilli']]), { task: 'R12' }),
      teach(B.phoneCards('031_d_try', 'Proovi kohe: helista Kaubahalli.', 'Sofia helistab enne poodi Kaubahalli infosse. Proovi kohe, ilma abita.',
        'Sofia otsib Mallele sinist teetassi. Raha on 40 eurot. Ta tahab teada, kas tasse on ja mis need maksavad.',
        ['Sofia', ['Kas teil on sinist teetassi?', 'Mis see maksab?', 'Mis korrusel tassid on?', 'Mis kell pood kinni läheb?', 'Kas kingituse saab pakkida?']],
        ['Kaubahalli info', ['Siniseid tasse on kahte tüüpi: 9 € ja 14 €.', 'Tassid on neljandal korrusel, kodukaupade osakonnas.', 'Pood on lahti kella üheksani.', 'Kingitusi pakime tasuta.', 'Sel nädalal on kaks tassi ühe hinnaga.']], [60, 120]),
        'Üks-ühele: õpetaja on Kaubahalli info ja vastab kaardi järgi. Õpilane proovib kohe, ilma abita; õpetaja kirjutab üles, mida õpilane ei osanud öelda (sinist tassi, valget lampi). Pärast reeglit proovib õpilane Kasutas uuesti.'),
      tag(B.listening('031_p_announce', 'Kaubahalli teadaanne.', 'Sofia on Kaubahallis. Kuula teadaannet kaks korda: kuhu ta peab minema?', [
        'Teadustaja: Head kliendid! Tere tulemast Kaubahalli!',
        'Teadustaja: Täna on teisel korrusel talvejopede päev.',
        'Teadustaja: Kõik talvejoped on kolmkümmend protsenti odavamad.',
        'Teadustaja: Kolmandal korrusel on laste talvesaapad.',
        'Teadustaja: Laste saapad maksavad täna ainult kolmkümmend viis eurot.',
        'Teadustaja: Neljandal korrusel saab osta kaks tassi ühe hinnaga.',
        'Teadustaja: Esimesel korrusel kohvikus on täna tomatisupp.',
        'Teadustaja: Kaubamaja on täna avatud kella üheksani.',
      ], ['Tasside pärast läheb Sofia [neljandale] korrusele.', 'Seal saab täna kaks tassi osta ühe [hinnaga].', 'Talvejopede pärast tuleb minna [teisele] korrusele.', 'Talvejoped on täna [kolmkümmend|30] protsenti odavamad.', 'Laste talvesaapad on [kolmandal] korrusel.', 'Laste saapad maksavad täna [kolmkümmend viis|35] eurot.', 'Kui Sofial on kõht tühi, sööb ta kohvikus [tomatisuppi].', 'Sofia peab ostud tegema enne kella [üheksat|21].']), { task: 'L06' }),
      B.notice('031_d_notice', 'Märka: ma otsin sinist tassi', [
        'Mida? → osastav: Ma **otsin** tassi, lampi, salli.',
        'Omadussõna on ka osastavas: **sinist** tassi, **valget** lampi, **sooja** salli.',
        '**Mul on vaja** uut kotti. Ma **vajan** head teed. **Kas teil on** halli salli?',
        'Mitu asja: Ma otsin **siniseid** tasse ja **sooje** sokke.',
        'Aga: **Mul on** sinine tass. **See on** soe sall. (nimetav)',
        '**Mis värvi?** **Mis suurus?** **Mis see maksab?**',
      ], 'full'),
      B.table('031_d_rule', 'Leia reegel.', 'Kirjuta tabelisse, mida Sofia otsib. Vaata kasti „Märka”.', 'Mis see on?, Ma otsin … (mida?)', [
        'sinine tass | [sinist tassi]', 'valge lamp | [valget lampi]', 'soe sall | [sooja salli]', 'uus kott | [uut kotti]', 'hea tee | [head teed]',
        'hall müts | [halli mütsi]', 'must jope | [musta jopet]', 'väike pott | [väikest potti]', 'punane küünal | [punast küünalt]', 'roheline taldrik | [rohelist taldrikut]',
      ], 'g_notice'),
      B.categorize('031_d_dept', 'Mis osakonnas?', 'Kaubahallis on neli osakonda. Pane iga asi õigesse osakonda.', [
        ['riided', ['jope', 'mantel', 'kampsun', 'sall', 'müts', 'kindad']],
        ['jalanõud', ['saapad', 'kingad', 'tossud', 'sussid', 'sandaalid']],
        ['kodukaubad', ['tass', 'taldrik', 'lamp', 'küünal', 'pott', 'kann']],
        ['toidukaubad', ['tee', 'kohv', 'mesi', 'šokolaad', 'piim']],
      ]),
      B.vocab('031_d_vocab', 'Tunni sõnad.', ['tass — чашка', 'taldrik — тарелка', 'lamp — лампа', 'kott — сумка', 'kingitus — подарок', 'sünnipäev — день рождения', 'osakond — отдел', 'korrus — этаж', 'värv — цвет', 'otsima — искать']),
      teach(tag(B.speaking('031_d_432', 'Mida ma otsin? Kolm korda.', 'Räägi kolm korda, mida sa poest otsid: 2 minutit, siis 1,5 ja 1 minut.', ['Mida sa otsid ja kellele?', 'Mis värvi see on ja mis suurus?', 'Mis korrusel see Kaubahallis on?', 'Kui palju raha sul on?', 'Mida sa müüjalt küsid?'], [60, 120], ['Ma otsin sinist …', 'Mul on vaja …', 'Kas teil on …?']), { task: 'S08' }),
        'Üks-ühele: õpilane räägib õpetajale kolm korda sama juttu; õpetaja hoiab aega (2 / 1,5 / 1 minutit) ja ei paranda. Iga kord on jutt sujuvam ja vormid (sinist tassi) õigemad.'),
    ],
    practice: [
      B.choice('031_p_form', 'Vali õige vorm.', 'Sofia räägib Kaubahallis müüjaga. Vali igasse lausesse õige vorm.', [
        ['Tere! Ma otsin Mallele … teetassi.', 'sinist', 'sinine', 'sinisega'],
        ['Mul on vaja ka pakk … teed.', 'head', 'hea', 'heaga'],
        ['Kas teil on ka … küünalt?', 'valget', 'valge', 'valgel'],
        ['Malle vana tass oli ka …', 'sinine', 'sinist', 'siniseid'],
        ['Ma vajan … kotti, minu kott on katki.', 'uut', 'uus', 'uue'],
        ['Grete otsib endale … salli.', 'sooja', 'soe', 'soojad'],
        ['Lillepoes on täna väga ilusad … roosid.', 'punased', 'punaseid', 'punast'],
        ['Kas teil on ka … tasse?', 'rohelisi', 'rohelised', 'roheline'],
      ], 'full', 'g_notice'),
      tag(B.adsmatch('031_p_shops', 'Eksaminurk: kolm poodi.', 'Loe kolme teksti. Millise teksti kohta lause käib? Kirjuta A, B või C.', [
        ['Kaubahall, 4. korrus: kodukaubad', 'Sel nädalal on kõik teetassid ja kannud 20% odavamad. Kaks tassi saab osta ühe hinnaga. Meil on siniseid, valgeid ja rohelisi tasse. Kingitused pakime tasuta ja ilusasse paberisse. Maksta saab kaardiga ja sularahas. Kaubahall on avatud iga päev kella üheksast üheksani. Kui kaup ei sobi, saab selle vahetada kolmekümne päeva jooksul. Kassad on igal korrusel lifti kõrval. Küsi abi müüjalt!'],
        ['Teine Ring, Mustamäe', 'Teine Ring on kasutatud riiete ja asjade pood. Meil on joped, mantlid ja kampsunid, aga ka vanad tassid ja raamatud. Hinnad on väga odavad: jope maksab 15–40 eurot. Kõik asjad on puhtad ja korras. Pood on lahti esmaspäevast laupäevani kella kümnest kuueni. Maksta saab ainult kaardiga. Kaupa tagastada ei saa. Vanad riided võid tuua meile tasuta.'],
        ['Nõmme turu talupäev', 'Laupäeval on Nõmme turul talupäev. Turg on lahti kella kaheksast kolmeni. Leida müüb oma villaseid sokke, kindaid ja salle. Viktor müüb mett, mune ja õunu. Turu kohvikus on soe tee ja pirukad. Paljud müüjad võtavad ainult sularaha, aga pangaautomaat on turu kõrval. Esimesed kaks tundi saab autot tasuta parkida. Head turupäeva!'],
      ], [
        ['Siin saab tassi kohe kingituseks pakkida.', 'A'],
        ['Siin on müügil vanad ja kasutatud asjad.', 'B'],
        ['Siin peab tavaliselt maksma sularahas.', 'C'],
        ['Siin saab osta kaks tassi ühe tassi hinnaga.', 'A'],
        ['Siin saab laupäeval osta sooje villaseid asju.', 'C'],
        ['Siin ei saa ostetud asja tagasi tuua.', 'B'],
        ['Siin saab ostlemise vahel sooja teed juua.', 'C'],
        ['Siin saab sobimatu kauba kuu aja jooksul vahetada.', 'A'],
      ]), { harno: 'R2' }),
      B.wordforms('031_p_forms', 'Mida nad otsivad?', 'Kirjuta sõnad osastavas: mida inimesed Kaubahallis otsivad?', [
        ['soe kampsun', 'Dmitri otsib …', 'sooja kampsunit'], ['villane sall', 'Grete otsib …', 'villast salli'], ['valge küünal', 'Malle vajab …', 'valget küünalt'], ['pruun kott', 'Tom otsib …', 'pruuni kotti'],
        ['hea raamat', 'Lucía otsib emale …', 'head raamatut'], ['uued saapad', 'Oskar vajab …', 'uusi saapaid'], ['soojad kindad', 'Mial on vaja …', 'sooje kindaid'], ['väike lamp', 'Ene otsib …', 'väikest lampi'],
      ]),
      B.cloze('031_p_cloze', 'Sofia kiri Katile.', 'Sofia kirjutab sõbrale Katile Kaubahallist. Vali lünka sobiv vorm.', 'Tere, Kati!', [
        'Tere, Kati! Täna käisin pärast keeletundi Kaubahallis. Ma otsisin Mallele {*sinist|sinine|sinisel} teetassi.',
        '',
        'Neljandal {*korrusel|korrus|korrusele} töötab Anna, Jaani vana tuttav. Ta on väga sõbralik.',
        '',
        'Anna ütles, et siniseid tasse on alles ainult {*üks|ühte|ühel}. Siis vaatasime koos kataloogi.',
        '',
        'Seal olid ka {*rohelised|rohelist|roheline} tassid, valge lamp ja suur kott.',
        '',
        'Mul endal on vaja {*sooja|soe|soojad} salli, sest õhtuti on väga külm. Kaubahallis olid sallid kahjuks liiga kallid.',
        '',
        'Laupäeval lähen Gretega Nõmme turule. Seal müüb Leida {*villaseid|villased|villane} salle ja sokke.',
        '',
        'Pühapäeval on Malle sünnipäev. Meil on Gretega kahe peale {*nelikümmend|neljakümne|nelja} eurot.',
        '',
        'Õhtul helistan Gretele ja me otsustame koos. Kirjuta, kuidas sul {*läheb|minna|läks}! Kallistan, Sofia',
      ]),
      B.match('031_p_say', 'Lause algus ja lõpp.', 'Ühenda lause algus ja lõpp: mida klient ja müüja poes ütlevad?', [
        ['Kas ma võin seda kampsunit', 'proovida?'], ['Kas teil on seda tassi', 'ka teist värvi?'], ['Palun pakkige see', 'kingituseks.'], ['Mis see sinine', 'tass maksab?'],
        ['Kahjuks on sinised tassid', 'praegu otsas.'], ['Maksta saab kaardiga', 'või sularahas.'], ['Kassa on teisel korrusel', 'lifti kõrval.'], ['Aitäh, ma täna', 'ainult vaatan.'],
      ], 'full', 'g_vocab'),
      tag(B.writing('031_p_link', 'Kingituse plaan.', 'Kirjuta 6–8 lauset: mida te Mallele ostate ja miks. Kasuta: ja, aga, sest.', [6, 8], ['sinist', 'sest', 'aga', 'eurot'], 2), { task: 'W09' }),
      teach(tag(B.speaking('031_p_opinion', 'Mis on hea kingitus?', 'Räägi oma arvamus kolmele kuulajale järjest. Iga kord räägi natuke kiiremini.', ['Mis on sinu arvates hea kingitus?', 'Mida sa kingid oma emale või sõbrale?', 'Kas sa ostad kingituse poest või teed ise?', 'Kui palju raha sa kingitusele kulutad?', 'Mis oli sinu kõige parem kingitus?'], [60, 120], ['Minu arvates on hea kingitus …', 'Ma kingin emale …, sest …', 'Ma kulutan umbes … eurot.']), { task: 'S11', fluency: true }),
        'Üks-ühele: õpilane räägib õpetajale kolm korda; õpetaja on iga kord teine kuulaja (Grete, Malle, Anna) ja küsib ühe lisaküsimuse. Kolmas kord on kõige kiirem.'),
    ],
    transfer: [
      B.text('031_t_sit', 'Kaubahalli neljandal korrusel', 'Kolmapäeval pärast keeletundi on Sofia Kaubahallis. Anna töötab seal kodukaupade osakonnas. Tema kolleeg Siiri pakib kingitusi. Siniseid tasse on alles ainult üks. Anna ja Siiri vaatavad koos kataloogi ja näitavad Sofiale teisi kingitusi. Vaata pilti. Raha on 40 eurot. Õhtul helistab Sofia Gretele ja nad otsustavad koos.'),
      B.profiles('031_t_gifts', 'Kataloogi kingitused.', 'Loe kolme kauba kaarti. Kirjuta lünka sõna või arv.', [
        ['Teetassid „Meri”', ['Kaks sinist tassi koos alustassidega.', 'Hind: 18 € kaks tassi.', 'Sinine tass on poes alles ainult üks.', 'Rohelisi tasse on palju, hind on sama.', 'Tassi kõrvale sobib pakk head teed, 5 €.'], ['Kaks tassi maksavad [18|kaheksateist] eurot.', 'Siniseid tasse on alles ainult [üks|1].', 'Pakk head teed maksab [viis|5] eurot.']],
        ['Laualamp „Valgus”', ['Valge või must väike lamp.', 'Hind: 34 €.', 'Lamp on kerge ja hea lugemiseks õhtul.', 'Garantii on kaks aastat.', 'Lamp sobib hästi voodi kõrvale.'], ['Lamp on valge või [must].', 'Lamp maksab [34|kolmkümmend neli] eurot.', 'Lambiga on õhtul hea [lugeda].']],
        ['Kott „Linn”', ['Pruun või hall kott.', 'Hind: 39 €.', 'Kott on suur ja tugev.', 'Sellega on hea turul ja poes käia.', 'Sel nädalal kotil allahindlust ei ole.'], ['Kott on pruun või [hall].', 'Kott maksab [39|kolmkümmend üheksa] eurot.', 'Sel nädalal ei ole kotil [allahindlust].']],
      ]),
      teach(B.rolecards('031_t_shop', 'Teine katse: Anna aitab.', 'A on Sofia, B on Anna. Leidke kingitus, mis maksab kuni 40 eurot.',
        'Sa oled Sofia. Sa otsid kahte sinist tassi. Kui neid ei ole, küsi teisi värve ja hindu. Palu kingitus pakkida.',
        'Sa oled Anna. Siniseid tasse on ainult üks. Paku rohelisi tasse või valget lampi. Ütle hinnad ja kus kassa on.',
        ['Ma otsin kahte sinist tassi.', 'Kas teil on ka …?', 'Palun pakkige see.'], ['Kahjuks on ainult üks.', 'Meil on rohelisi tasse.', 'See maksab … eurot.']),
        'Üks-ühele: õpetaja on Anna ja muudab olukorda (siniseid tasse on ainult üks). Õpilane küsib värvi ja hinda ning valib. Võrrelge esimese katsega: kas nüüd on vormid õiged (sinist tassi, valget lampi)?'),
      teach(tag(B.ideaCard('031_t_agree', 'Leppige Gretega kokku.', 'Sofia helistab õhtul Gretele. Leppige kokku, mis on Malle kingitus.',
        'Raha on 40 eurot. Malle joob iga päev teed, armastab lilli ja loeb õhtul raamatuid. Sinist tassi on alles ainult üks.',
        ['üks sinine tass ja tee', 'kaks rohelist tassi', 'valge lamp', 'kott', 'lilled'], 'Mis on Malle kingitus, mis see maksab ja miks see sobib?', [90, 120]), { main: true }),
        'Üks-ühele: õpetaja on Grete ja tahab alguses kõige kallimat kotti; õpilane põhjendab hinna ja Malle soovidega. Lõpus ütleb õpilane kokkuleppe ja summa.'),
      tag(B.letter('031_t_letter', 'Sõnum Gretele.', 'Kirjuta Gretele 40–50 sõna: mida sa ostsid, mis see maksis ja miks.', 'Tere, Grete!', 'Sofia', [40, 50]), { task: 'W08' }),
      tag(B.speaking('031_t_record', 'Salvesta: kingitus pildil.', 'Vaata pilti ja salvesta kodus 45–60 sekundit: mida Anna ja Siiri valivad?', ['Kus Anna ja Siiri on?', 'Mida nad kataloogist vaatavad?', 'Mida sina Mallele ostad ja miks?', 'Mida sa kingid oma sõbrale sünnipäevaks?'], [45, 60], ['Pildil on …', 'Nad vaatavad …', 'Ma ostan Mallele …, sest …']), { task: 'S15' }),
      B.rubric('031_t_rubric', 'Hindamine.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Poes küsib õpilane värvi, hinda ja teist võimalust.', 'Kokkulepe on tehtud ja kingitus maksab kuni 40 eurot.', 'Osastav on õige: sinist tassi, valget lampi, head teed.', 'Sõnumis on ost, hind ja põhjus (40–50 sõna).']),
      B.selfcheck('031_t_self', ['Ma ütlen, mida ma otsin: sinist tassi, sooja salli.', 'Ma küsin poes värvi, hinda ja teist võimalust.', 'Ma lepin sõbraga kokku, mis kingitus osta.', 'Ma kirjutan sõbrale oma ostust.'], 'Kingitus on ostetud'),
    ],
  },

  'a2-032': {
    title: 'Hinnad turul ja kassas',
    canDo: 'Ma ütlen hindu ja aegu õiges vormis (kahe euro eest, viie euroga, kaheksast kolmeni), küsin hinda ja lepin korterikaaslasega kokku, mida 25 euro eest osta.',
    discover: [
      B.review('032_d_review', [['Mida sa ütled müüjale, kui otsid sinist tassi?', 'a2-031'], ['Kuidas sa lähed oma kodust lähimasse poodi?', 'a2-022'], 'Mis kell on sinu toidupood lahti?']),
      B.text('032_d_hook', 'Laupäeval Nõmme turul', 'Pühapäeval sai Malle sünnipäevaks kaks rohelist tassi ja paki head teed. Ta oli väga rõõmus! Järgmisel laupäeval lähevad Sofia ja Grete Nõmme turule. Onu Viktor müüb seal mett ja õunu, Leida villaseid sokke ja kindaid. Sofia tahab küsida hinda ja kaubelda. Aga kuidas öelda „kahe euro eest”? Proovi kõigepealt ise.'),
      B.choice('032_d_try', 'Proovi kõigepealt.', 'Ära vaata veel reeglit. Vali sõna, mis sobib lausesse.', [
        ['Ma ostsin sokid … euro eest.', 'kümne', 'kümme', 'kümnes'],
        ['Viktor andis mulle õunad … euroga.', 'kahe', 'kaks', 'kahte'],
        ['Turg on laupäeval lahti kaheksast …', 'kolmeni', 'kolm', 'kolmes'],
        ['Talupäeval on kaubal … protsendi soodustus.', 'kümne', 'kümme', 'kümnel'],
        ['Kingitus võib maksta kuni … euroni.', 'kahekümne', 'kakskümmend', 'kahekümnes'],
        ['Mul on rahakotis täna … eurot.', 'viiskümmend', 'viiekümne', 'viiekümnega'],
        ['Need villased sokid maksavad … eurot.', 'kaheksa', 'kaheksaga', 'kaheksani'],
        ['Kas ma saan need kindad … euro eest?', 'kolmekümne', 'kolmkümmend', 'kolmekümneni'],
      ], 'full', 'g_notice'),
      B.listening('032_d_listen', 'Turul.', 'Sofia ja Grete on turul. Kuula kaks korda ja kirjuta hinnad numbritega.', [
        'Viktor: Tere, tüdrukud! Kas te tahate õunu? Kilo maksab kaks eurot.',
        'Sofia: Tere, onu! Palun kaks kilo õunu ja kümme muna.',
        'Viktor: Munad maksavad kolm eurot. Purk mett maksab viis eurot.',
        'Grete: Ma võtan ühe purgi mett. Teie mesi on väga maitsev!',
        'Leida: Tere! Villased sokid, kindad ja mütsid! Kõik on käsitöö.',
        'Sofia: Tere! Mis need hallid kindad maksavad?',
        'Leida: Kindad maksavad kaksteist eurot. Sokid maksavad kaheksa eurot paar.',
        'Sofia: Kas ma saan kindad ja kaks paari sokke kahekümne viie euro eest?',
        'Leida: Olgu, kahekümne viie euro eest. Te olete täna minu esimene klient!',
        'Grete: Kas te võtate ka kaarti?',
        'Leida: Kahjuks mitte, ainult sularaha. Pangaautomaat on kohviku juures.',
        'Sofia: Pole probleemi. Mul on rahakotis viiskümmend eurot sularaha.',
      ], ['Kilo õunu maksab [2|kaks] eurot.', 'Viktori kümme muna maksavad kokku [3|kolm] eurot.', 'Purk mett maksab [5|viis] eurot.', 'Hallid kindad maksavad [12|kaksteist] eurot.', 'Üks paar sokke maksab [8|kaheksa] eurot.', 'Sofia saab kindad ja sokid [25|kahekümne viie] euro eest.', 'Sofia ostab Viktorilt kaks kilo [õunu].', 'Grete võtab ühe purgi [mett].']),
      tag(B.reading('032_d_read', 'Loe turu infot.', 'Loe Nõmme turu teadet ja vasta lühidalt.', 'Nõmme turg talvel',
        'Nõmme turg on avatud teisipäevast pühapäevani. Turg on lahti kella kaheksast kolmeni. Esmaspäeval on turg kinni.\n\nTurul saab osta köögivilju, puuvilju, mett, liha ja kala. Talvel on turul ka villased sokid, kindad ja mütsid. Turu kohvikus saab süüa sooja suppi ja pirukaid. Kohv maksab seal ainult kaks eurot.\n\nPaljud müüjad on talunikud. Nad toovad turule oma aia õunu, kartuleid, mune ja mett. Kõik on värske ja maitsev. Küsi julgelt, kust kaup tuleb!\n\nAuto saab parkida turu ees. Esimesed kaks tundi on parkimine tasuta.\n\nMüüjad tahavad sageli sularaha. Pangaautomaat on turu kõrval, kohviku juures.\n\nIga laupäev on turul talupäev. Siis on talukaup kümne protsendi soodustusega. Kui ostad rohkem kui kahekümne euro eest, saad kohvikus tasuta tassi kohvi.\n\nDetsembris on turul jõululaat. Laat on lahti iga päev, kella kümnest kuueni. Laadal saab osta käsitööd, mett ja piparkooke.',
        [['Mis päeval on turg kinni?', 'esmaspäeval'], ['Mis kellast mis kellani on turg lahti?', 'kella kaheksast kolmeni|kaheksast kolmeni|8–15'], ['Kui kaua on parkimine tasuta?', 'kaks tundi|esimesed kaks tundi'], ['Kus on pangaautomaat?', 'turu kõrval|kohviku juures|turu kõrval kohviku juures'], ['Kui suur on soodustus laupäeval?', 'kümme protsenti|10%|kümne protsendi'], ['Millal saab kohvikus tasuta kohvi?', 'kui ostad rohkem kui kahekümne euro eest|rohkem kui kahekümne euro eest|üle 20 euro'], ['Mis kell on jõululaat lahti?', 'kella kümnest kuueni|kümnest kuueni|10–18']]), { task: 'R15' }),
      B.notice('032_d_notice', 'Märka: arvud käändes', [
        'Kui palju? **kaks eurot**, **viis muna** (arv + osastav)',
        'Mille eest? Ostsin kindad **kahekümne euro eest**. (omastav + eest)',
        'Mis hinnaga? Sain sokid **viie euroga**. (-ga)',
        'Mis kellast mis kellani? Turg on lahti **kaheksast kolmeni**. (-st … -ni)',
        '**Kümne protsendi** soodustus. Hind on **kuni viiekümne euroni**.',
        'Omastav: üks → **ühe**, kaks → **kahe**, kolm → **kolme**, viis → **viie**, kümme → **kümne**, kakskümmend → **kahekümne**',
      ], 'full'),
      B.table('032_d_rule', 'Leia reegel.', 'Kirjuta arvu omastav kaks korda: mille eest ja mis hinnaga?', 'Arv, Kui palju? (osastav), Mille eest? (omastav), Mis hinnaga? (-ga)', [
        'kaks | kaks eurot | [kahe] euro eest | [kahe] euroga',
        'kolm | kolm eurot | [kolme] euro eest | [kolme] euroga',
        'viis | viis eurot | [viie] euro eest | [viie] euroga',
        'kümme | kümme eurot | [kümne] euro eest | [kümne] euroga',
        'kakskümmend | kakskümmend eurot | [kahekümne] euro eest | [kahekümne] euroga',
        'neli | neli eurot | [nelja] euro eest | [nelja] euroga',
        'sada | sada eurot | [saja] euro eest | [saja] euroga',
        'kuus | kuus eurot | [kuue] euro eest | [kuue] euroga',
        'kaksteist | kaksteist eurot | [kaheteistkümne] euro eest | [kaheteistkümne] euroga',
        'kolmkümmend | kolmkümmend eurot | [kolmekümne] euro eest | [kolmekümne] euroga',
      ], 'g_notice'),
      B.formtext('032_d_again', 'Proovi uuesti.', 'Nüüd tead reeglit. Kirjuta sulgudes olev arv või sõna õiges vormis.', 'Sofia rahakott', [
        'Hommikul oli Sofia rahakotis viiskümmend eurot.',
        '',
        'Turul ostis ta mütsi [kümne] (kümme) euro eest. Sokid sai ta [viie] (viis) euroga.',
        '',
        'Viktor andis talle kümme muna [kolme] (kolm) euro eest.',
        '',
        'Poes oli juust [kahekümne] (kakskümmend) protsendi soodustusega. Sofia ostis ka kaks [pakki] (pakk) piima ja ühe leiva.',
        '',
        'Toidupood on lahti kella [seitsmest] (seitse) kella [üheteistkümneni] (üksteist).',
        '',
        'Grete ostis turult mett [viie] (viis) euro eest ja leiba [kahe] (kaks) euroga.',
        '',
        'Turu kohvik on lahti kella [üheksast] (üheksa) kella [kolmeni] (kolm).',
        '',
        'Õhtul vaatas Sofia rahakotti. Seal oli alles kakskümmend [eurot] (euro).',
      ]),
      tag(B.vocab('032_d_vocab', 'Tunni sõnad.', ['hind — цена', 'maksma — стоить / платить', 'kokku — всего', 'kassa — касса', 'rahakott — кошелёк', 'tükk — штука', 'paar — пара', 'pakk — пачка', 'protsent — процент', 'soodustus — скидка']), { topic: ['soodustus'] }),
      teach(tag(B.speaking('032_d_prices', 'Hinnad minu linnas.', 'Küsi kolmelt inimeselt samad küsimused. Vasta ise alati arvudega.', ['Kui palju maksab sinu linnas kilo õunu?', 'Kui palju maksab tass kohvi kohvikus?', 'Mille eest sa viimati maksid üle kahekümne euro?', 'Mis kellast mis kellani on sinu toidupood lahti?', 'Kas sa maksad sularahas või kaardiga?'], [60, 120], ['See maksab umbes … eurot.', 'Ma ostsin … … euro eest.', 'Pood on lahti …-st …-ni.']), { fluency: true }),
        'Üks-ühele: õpilane küsib samad küsimused õpetajalt kolm korda; õpetaja vastab iga kord teise inimesena (Viktor, Leida, Grete). Iga ring on kiirem; õpetaja kuulab arvude vorme (kahe euro eest, kaheksast kolmeni).'),
    ],
    practice: [
      tag(B.examListen('032_p_till', 'Poe kassas.', 'Sofia maksab toidupoes. Kuula kaks korda ja vali õige number.', 'choice', [
        'Lea: Tere! Kas teil on kliendikaart?',
        'Sofia: Ei ole. Kas kaardiga on hinnad odavamad?',
        'Lea: Jah, kliendikaardiga saate viie protsendi soodustuse.',
        'Lea: Leib maksab üks euro kolmkümmend senti.',
        'Lea: Kaks pakki piima, üks euro tükk.',
        'Lea: Juust maksab neli eurot viiskümmend senti.',
        'Lea: Kokku on seitse eurot kaheksakümmend senti.',
        'Sofia: Palun, siin on kümme eurot.',
        'Lea: Teile tagasi kaks eurot kakskümmend senti. Aitäh!',
      ], [
        ['Kui suure soodustuse saab kliendikaardiga?', '5%', '10%', '15%'],
        ['Kui palju maksab leib?', '1,30 €', '1,13 €', '3,10 €'],
        ['Mitu pakki piima Sofia ostab?', 'kaks', 'üks', 'kolm'],
        ['Kui palju maksab üks pakk piima?', '1 €', '2 €', '0,50 €'],
        ['Kui palju maksab juust?', '4,50 €', '5,40 €', '4,15 €'],
        ['Kui palju on kokku?', '7,80 €', '8,70 €', '7,08 €'],
        ['Mis rahatähe Sofia annab?', '10 €', '20 €', '5 €'],
        ['Kui palju raha Sofia tagasi saab?', '2,20 €', '2,80 €', '3,20 €'],
      ], 'g_vocab'), { task: 'L10' }),
      tag(B.bankText('032_p_letter', 'Grete kiri emale.', 'Grete kirjutab emale turust. Pane lünka sõna kastist, kaks sõna jääb üle.', 'Tere, ema!', [
        'Tere, ema! Laupäeval käisime Sofiaga Nõmme turul. Turg oli lahti kaheksast [[kolmeni]].',
        '',
        'Sofia onu Viktor müüs seal õunu. Ta andis meile kaks kilo õunu [[kahe]] euro eest.',
        '',
        'Mina ostsin ühe purgi mett. Sofia ostis villased kindad ja kaks paari sokke. Kokku maksis ta kakskümmend viis [[eurot]].',
        '',
        'Laupäeval oli talukaup [[kümne]] protsendi soodustusega. Kohvikus jõime teed. Kaks tassi teed maksid ainult [[neli]] eurot.',
        '',
        'Sofia ostis Leidalt kindad ja sokid. Leida tahtis alguses kolmkümmend kaks eurot, aga andis need [[kahekümne viie]] euro eest.',
        '',
        'Detsembris tuleme jälle, siis on turul jõululaat. Kingituste jaoks on mul raha kuni [[kahekümne]] euroni. Kallistan, Grete',
      ], ['nelja', 'Kümme']), { task: 'R04' }),
      B.transformation('032_p_trans', 'Ütle teisiti.', 'Kirjuta lause uue alguse järgi. Pane arv õigesse vormi.', [
        ['Müts maksis viis eurot.', 'Ma ostsin mütsi … eest.', 'Ma ostsin mütsi viie euro eest.'],
        ['Kindad maksid kaksteist eurot.', 'Ma sain kindad … euroga.', 'Ma sain kindad kaheteistkümne euroga.'],
        ['Turg on avatud kell 8–15.', 'Turg on lahti …', 'Turg on lahti kaheksast kolmeni.|Turg on lahti kella kaheksast kolmeni.'],
        ['Allahindlus on 10%.', 'Seal on … soodustus.', 'Seal on kümne protsendi soodustus.'],
        ['Kingitus maksab kõige rohkem 50 €.', 'Kingitus maksab kuni …', 'Kingitus maksab kuni viiekümne euroni.'],
        ['Õunad maksid kaks eurot.', 'Viktor andis õunad … eest.', 'Viktor andis õunad kahe euro eest.'],
        ['Kohvik on avatud kell 10–18.', 'Kohvik on lahti …', 'Kohvik on lahti kümnest kuueni.|Kohvik on lahti kella kümnest kuueni.'],
        ['Kingitus maksis kolm eurot.', 'Sofia ostis kingituse … eest.', 'Sofia ostis kingituse kolme euro eest.'],
      ]),
      B.errorfix('032_p_fix', 'Paranda viga.', 'Grete kirjutas oma ostud kiiresti üles. Leia viga ja kirjuta lause õigesti.', [
        ['Ma ostsin mütsi viis euro eest.', 'Ma ostsin mütsi viie euro eest.'],
        ['Turg on lahti kaheksa kuni kolm.', 'Turg on lahti kaheksast kolmeni.'],
        ['Sokid maksavad kaheksa euro.', 'Sokid maksavad kaheksa eurot.'],
        ['Leida andis kindad kümme euroga.', 'Leida andis kindad kümne euroga.'],
        ['Talukaup on kümme protsendi soodustusega.', 'Talukaup on kümne protsendi soodustusega.'],
        ['Mul on raha kuni kakskümmend euroni.', 'Mul on raha kuni kahekümne euroni.'],
        ['Ma ostsin kaks purki mesi.', 'Ma ostsin kaks purki mett.'],
        ['Kohvik on lahti kümnest kuus.', 'Kohvik on lahti kümnest kuueni.'],
      ]),
      tag(B.manymatch('032_p_signs', 'Märk ja lause.', 'Ühenda poe silt ja lause, mis ütleb sama sõnadega.', ['−10%', 'E–R 9–18', 'kuni 50 €', '2 tk = 5 €', 'L 8–15', '1 kg 2,40 €', 'üle 20 € tasuta kohv', '3 + 1 tasuta'], ['kümne protsendi soodustus', 'esmaspäevast reedeni üheksast kuueni', 'kuni viiekümne euroni', 'kaks tükki viie euro eest', 'laupäeval kaheksast kolmeni', 'kilo maksab kaks eurot nelikümmend senti', 'üle kahekümne euro ostuga tasuta kohv', 'kolme eest saad neli'], 'full', 'g_vocab'), { task: 'G11' }),
      B.examWriting('032_p_invite', 'Kutse jõululaadale.', 'Kutsu Malle 40–60 sõnaga Nõmme turu jõululaadale. Kirjuta aeg ja hinnad.', 'kutse', {
        situation: 'Detsembris on Nõmme turul jõululaat. Sa tahad minna sinna koos Mallega.',
        points: ['Millal ja mis kellast mis kellani laat on lahti?', 'Mida seal saab osta ja mis hinnaga?', 'Kuidas te sinna sõidate?', 'Kus ja mis kell te kohtute?'],
        words: [40, 60], opening: 'Tere, Malle!', closing: 'Sofia',
      }),
      teach(tag(B.phoneCards('032_p_boots', 'Kuulutus: talvesaapad.', 'A helistab kuulutuse peale, B müüb saapaid. Leppige hind kokku. Mängige kaks korda.',
        'Kuulutus: kasutatud talvesaapad, suurus 38, hind 40 €, telefon 5566 7788.',
        ['Ostja', ['Kas saapad on veel müügil?', 'Mis värvi need on?', 'Kas ma saan need kolmekümne euro eest?', 'Millal ma saan neid proovida?']],
        ['Müüja', ['Saapad on mustad ja peaaegu uued.', 'Alla kolmekümne viie euro ma ei anna.', 'Proovida saab homme kella viiest seitsmeni.', 'Aadress on Akadeemia tee 22.']], [60, 120]), { fluency: true }),
        'Üks-ühele: õpetaja on müüja ja ei anna kohe järele. Õpilane helistab, küsib ja lepib hinna kokku. Teine kõne on kohe pärast seda, kiiremini: õpetaja on teine müüja (saapad maksavad 45 €).'),
    ],
    transfer: [
      B.text('032_t_sit', 'Kassas on järjekord', 'Laupäeva õhtul läheb Sofia Kaubahalli toidupoodi. Kassas töötab Siiri, Anna kolleeg. Sofia ees seisab Markus, kohvik Panni püsiklient. Ta paneb letile kolm õuna ja kaks leiba. Vaata pilti. Malle jättis Sofiale häälsõnumi: mida osta ühisesse toidukorvi. Raha on köögis karbis.'),
      tag(B.listening('032_t_malle', 'Malle häälsõnum.', 'Malle jättis Sofiale häälsõnumi. Kuula kaks korda ja tee ostunimekiri.', [
        'Malle: Tere, Sofia! Siin Malle.',
        'Malle: Palun osta kaks leiba ja kolm pakki piima.',
        'Malle: Juustu on vaja pool kilo. Võta seda kollast juustu, see on maitsev.',
        'Malle: Kohvi ära osta, kohvi on meil veel.',
        'Malle: Kartuleid on vaja kaks kilo. Ma teen homme suppi.',
        'Malle: Õunu ei ole vaja, Viktor andis meile turult.',
        'Malle: Kokku võid kulutada kuni viiekümne euroni.',
        'Malle: Kviitung pane palun karpi raha juurde. Aitäh!',
      ], ['Malle palub osta kaks [leiba].', 'Piima on vaja kolm [pakki].', 'Kollast juustu on vaja pool [kilo].', 'Kohvi ei osta Sofia, sest kohvi on [veel].', 'Kartuleid on vaja Malle homse [supi] jaoks.', 'Õunu ei osta Sofia, sest Viktor andis neid [turult].', 'Raha võib kulutada kuni [viiekümne|50] euroni.', 'Pärast poodi läheb kviitung köögis [karpi].']), { task: 'L07' }),
      tag(B.reading('032_t_receipt', 'Loe kviitungit.', 'Sofia vaatab kodus kviitungit. Kas kõik on õige? Vasta lühidalt.', 'Kaubahall, toidupood, kviitung',
        'Kuupäev: 5.12.2026, kell 17.40.\n\nLeib, 2 tk, 1,30 € tükk: 2,60 €.\nPiim, 3 pakki, 1,00 € tükk: 3,00 €.\nJuust, pool kilo: 4,50 €.\nKartulid, 2 kg: 1,80 €.\nKohv, 1 pakk: 6,90 €.\n\nKokku: 18,80 €.\nMakstud sularahas: 20,00 €.\nTagasi: 1,20 €.\n\nTeid teenindas kassapidaja Siiri. Aitäh ostu eest ja tulge jälle!\n\nKaupa saab tagastada 14 päeva jooksul. Tagastamiseks on vaja kviitungit. Kliendikaardiga saate järgmisel ostul viie protsendi soodustuse. Pood on avatud iga päev kella kaheksast kümneni. Kliendikaardi saate kassast tasuta ja see kehtib kõigis Kaubahalli poodides. Head päeva ja ilusat detsembrit!',
        [['Mis on kviitungil üleliigne?', 'kohv|kohvi pakk|üks pakk kohvi'], ['Kui palju maksavad ostud ilma kohvita?', '11,90 €|11,90 eurot|üksteist eurot üheksakümmend senti'], ['Kas Sofia jäi alla viiekümne euro?', 'jah|jah, ta maksis 18,80 €'], ['Kui palju raha Sofia tagasi sai?', '1,20 €|1,20 eurot|üks euro kakskümmend senti'], ['Kui palju raha peab poe kassa Sofiale veel tagasi andma?', '6,90 €|6,90 eurot|kuus eurot üheksakümmend senti'], ['Mitme päeva jooksul saab kohvi tagastada?', '14|neljateistkümne päeva jooksul|14 päeva jooksul'], ['Mida Sofia peab kohvi tagastamiseks kaasa võtma?', 'kviitungi|kviitung|kviitungi ja kohvi']]), { task: 'R08', level: 3 }),
      teach(tag(B.speaking('032_t_picture', 'Eksaminurk: pilt ja küsimused.', 'Kirjelda pilti umbes üks minut. Siis vasta õpetaja küsimustele.', ['Kes on pildil ja kus nad on?', 'Mida Markus letile paneb?', 'Mida Siiri teeb?', 'Kui palju võivad kolm õuna ja kaks leiba maksta?', 'Kus sina tavaliselt toitu ostad? Miks seal?', 'Kas sa maksad kaardiga või sularahas?'], [60, 120], ['Pildil on …', 'Markus paneb letile …', 'See maksab umbes … eurot.']), { task: 'S06', harno: 'S1' }),
        'Üks-ühele: nagu Harno A2 rääkimise 1. osas. Õpilane kirjeldab pilti umbes minuti, õpetaja ei sega. Siis küsib õpetaja teemakaardi küsimused (toit, pood, raha). Kokku 6–7 minutit, hinda nagu eksamil.'),
      teach(tag(B.ideaCard('032_t_basket', 'Ühine toidukorv.', 'A on Sofia, B on Malle. Valige koos, mida 25 euro eest osta.',
        'Raha on 25 eurot. Nädalaks on vaja süüa kolmele. Hinnad: leib 1,30 €, piim 1 €, juust 4,50 €, kartulid 0,90 € kilo, kohv 6,90 €, kana 7 €, õunad 2 € kilo.',
        ['leib ja piim', 'juust', 'kartulid', 'kana', 'kohv', 'õunad'], 'Mida te ostate, kui palju see kokku maksab ja mis jääb välja?', [90, 120]), { task: 'S12', main: true }),
        'Üks-ühele: õpetaja on Malle ja tahab kõike osta; õpilane arvutab ja ütleb, mis maksab kui palju (kahe euro eest, kuni kahekümne viie euroni). Lõpus ütleb õpilane nimekirja ja summa.'),
      tag(B.writing('032_t_msg', 'Sõnum korterikaaslastele.', 'Kirjuta korterikaaslastele 5–7 lauset: mida ostsid, mis see maksis, mis jäi alles.', [5, 7], ['kokku', 'euro eest', 'alles', 'kviitung'], 2), { task: 'W02' }),
      tag(B.speaking('032_t_record', 'Salvesta: minu nädala ostud.', 'Salvesta kodus 45–60 sekundit: mida sa sel nädalal ostsid, kus ja mille eest.', ['Mida sa sel nädalal ostsid?', 'Kus sa käisid poes või turul?', 'Mille eest sa kõige rohkem maksid?', 'Mis kellast mis kellani on see pood lahti?'], [45, 60], ['Ma ostsin … … euro eest.', 'Pood on lahti …-st …-ni.', 'Kokku maksin …']), { task: 'S15' }),
      B.rubric('032_t_rubric', 'Hindamine.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Pildi kirjeldus on umbes minut ja vastused on täislausega.', 'Toidukorv on kokku lepitud ja maksab kuni 25 eurot.', 'Arvud on õiges vormis: kahe euro eest, viie euroga, kaheksast kolmeni.', 'Sõnumis on ostud, summa ja raha, mis jäi alles.']),
      B.selfcheck('032_t_self', ['Ma ütlen: kahe euro eest, viie euroga, kaheksast kolmeni.', 'Ma kuulen hindu ja kontrollin kviitungit.', 'Ma kirjeldan pilti ja vastan küsimustele.', 'Ma lepin kokku, mida 25 euro eest osta.'], 'Raha on kontrollitud'),
    ],
  },

  'a2-033': {
    title: 'Kasutatud riiete poes',
    canDo: 'Ma saan kuuldust aru, mis on odavam, soojem või parem, palun poes teist suurust ja kirjutan sõbrale 50–70-sõnalise kirja, mida ma valisin ja miks.',
    discover: [
      B.review('033_d_review', [['Mille eest sa viimati turult midagi ostsid?', 'a2-032'], ['Mida sa teed tavaliselt laupäeva hommikul?', 'a2-013'], 'Mis on sinu jaoks parem: tee või kohv? Miks?']),
      B.text('033_d_hook', 'Kasutatud riiete pood', 'Sofial on nüüd soojad kindad ja sokid. Aga talvejopet tal veel ei ole. Uus jope Kaubahallis maksab üle saja euro. Grete ütleb: „Lähme Teise Ringi!” Teine Ring on kasutatud riiete pood Mustamäel. Grete ostab seal peaaegu kõik oma riided. Seal on palju häid ja odavaid asju.'),
      B.examListen('033_d_fit', 'Proovikabiini juures.', 'Sofia proovib Teises Ringis jopesid. Kuula kaks korda ja vali õige vastus.', 'choice', [
        'Kristo: Tere! Kas ma saan teid aidata?',
        'Sofia: Tere! Ma otsin sooja talvejopet. Kas ma võin seda halli jopet proovida?',
        'Kristo: Muidugi. Proovikabiin on akna juures.',
        'Sofia: Hm, see on mulle liiga väike. Kas teil on suuremat?',
        'Kristo: Jah, siin on suurem, suurus L. Kuidas see sobib?',
        'Sofia: See on parem. Aga mulle meeldib ka see must jope. See on pikem ja soojem.',
        'Grete: Must jope on ka paksem. Ja sellel on kapuuts!',
        'Kristo: Jah, aga must jope on ka kallim. Hall maksab kolmkümmend viis eurot, must nelikümmend.',
        'Sofia: Hall on odavam, aga must on ilusam. Kas mustal jopel on kõik korras?',
        'Kristo: Ühe tasku lukk on natuke katki. Aga selle saab parandada.',
        'Grete: Sofia, Tallinnas on talvel tugev tuul. Pikem jope on parem.',
        'Sofia: Ma pean veel mõtlema. Mis kellani te täna lahti olete?',
        'Kristo: Täna kuueni. Aga homme on teisipäev. Siis on kõik hinnad kümme protsenti odavamad.',
        'Grete: Sofia, vaata! Siin on ka väike mänguasja pingviin. Mia armastab pingviine!',
        'Kristo: Pingviin maksab ainult kolm eurot.',
        'Sofia: Siis tulen homme tagasi! Pingviini võtan kohe. Aitäh teile!',
      ], [
        ['Mis on esimesel hallil jopel valesti?', 'see on liiga väike', 'see on liiga pikk', 'see on katki'],
        ['Mis suurus on teine hall jope?', 'L', 'M', 'S'],
        ['Milline on must jope?', 'pikem ja soojem', 'lühem ja kergem', 'väiksem ja odavam'],
        ['Mis on mustal jopel veel?', 'kapuuts', 'kaks suurt taskut', 'vöö'],
        ['Kui palju maksab hall jope?', '35 eurot', '40 eurot', '45 eurot'],
        ['Mis on mustal jopel natuke katki?', 'tasku lukk', 'kapuuts', 'varrukas'],
        ['Miks on Grete arvates pikem jope parem?', 'Tallinnas on talvel tugev tuul.', 'Pikk jope on odavam.', 'Must värv on ilusam.'],
        ['Miks Sofia tuleb homme tagasi?', 'Homme on hinnad odavamad.', 'Homme tulevad uued joped.', 'Täna on pood kinni.'],
      ]),
      tag(B.reading('033_d_read', 'Loe Sofia sõnumit.', 'Enne lugemist arva: kumb jope on parem? Siis loe ja kontrolli.', 'Kallis ema!',
        'Kallis ema! Täna käisin Gretega Teises Ringis. See on kasutatud riiete pood Mustamäel. Seal on hinnad palju väiksemad kui Kaubahallis.\n\nMa proovisin kahte jopet. Hall jope on lühem ja kergem. See maksab kolmkümmend viis eurot. Must jope on pikem ja soojem. See maksab nelikümmend eurot.\n\nHall jope on viis eurot odavam kui must. Aga must jope on paksem ja sellel on kapuuts. Talvel on Tallinnas külm ja tuuline. Grete ütleb, et must jope on parem.\n\nMa leidsin ka Miale kingituse. See on väike mänguasja pingviin. Mia armastab pingviine! Pingviin maksis ainult kolm eurot.\n\nHomme on poes kümne protsendi soodustus. Siis ostan ma jope. Grete ütleb, et teisipäeval on poes alati vähem inimesi. Kumb jope on sinu arvates parem?\n\nKallistan! Sofia',
        [['Kus on Teine Ring?', 'Mustamäel'], ['Kus on hinnad väiksemad?', 'Teises Ringis|kasutatud riiete poes'], ['Kui palju maksab hall jope?', 'kolmkümmend viis eurot|35 eurot'], ['Milline on must jope?', 'pikem ja soojem|pikem, soojem ja paksem|soojem|paksem'], ['Kui palju odavam on hall jope?', 'viis eurot|5 eurot|viis eurot odavam'], ['Mida Sofia Miale leidis?', 'mänguasja pingviini|pingviini|väikese pingviini'], ['Millal Sofia jope ostab?', 'homme|homme, kui on soodustus']]), { task: 'R13' }),
      B.examListen('033_d_listen', 'Ema vastab.', 'Helgi vastab Sofiale häälsõnumiga. Kuula kaks korda: kas lause on õige või vale?', 'truefalse', [
        'Helgi: Tere, Sofia! Siin ema. Aitäh sõnumi eest!',
        'Helgi: Mina arvan, et must jope on parem.',
        'Helgi: See on pikem ja soojem. Tallinnas on talv tuulisem kui Tartus.',
        'Helgi: Viis eurot ei ole suur vahe.',
        'Helgi: Aga proovi jopet ka kampsuniga. Talvel kannad sa all paksu kampsunit.',
        'Helgi: Kui jope on siis liiga kitsas, võta suurem suurus.',
        'Helgi: Pingviin on väga armas kingitus. Mia on õnnelik!',
        'Helgi: Kas sa tuled jõuludeks Tartusse? Siis teen ma pannkooke.',
      ], [
        ['Helgi arvates on hall jope parem.', false],
        ['Helgi sõnul on must jope pikem ja soojem.', true],
        ['Helgi arvates on Tartus talv tuulisem kui Tallinnas.', false],
        ['Viis eurot on Helgi jaoks väike vahe.', true],
        ['Helgi soovitab jopet proovida paksu kampsuniga.', true],
        ['Kui jope on kitsas, peab Sofia võtma väiksema suuruse.', false],
        ['Helgi arvates on pingviin armas kingitus.', true],
        ['Jõuludeks küpsetab Helgi Sofiale kooki.', false],
      ]),
      B.notice('033_d_notice', 'Märka: odavam, soojem … kui', [
        'odav → **odavam**, ilus → **ilusam**, kerge → **kergem** (-m)',
        'pikk → **pikem**, soe → **soojem**, paks → **paksem**, lai → **laiem**',
        'kallis → **kallim**, lühike → **lühem**, väike → **väiksem**, hea → **parem**',
        'Hall jope on viis eurot odava**m kui** must.',
        '**Kas teil on suuremat?** (osastav: suurema**t**, väiksema**t**)',
        'See on mulle **liiga** kitsas. See **sobib** mulle.',
      ], 'full'),
      B.categorize('033_d_sort', 'Talveks või suveks?', 'Milline jope sobib talveks, milline suveks? Pane sõnad õigesse rühma.', [
        ['Talveks on parem jope, mis on …', ['soojem', 'pikem', 'paksem', 'pikemate varrukatega', 'kapuutsiga']],
        ['Suveks on parem jope, mis on …', ['kergem', 'lühem', 'õhem', 'heledam', 'lühikeste varrukatega']],
        ['Rahakotile on parem jope, mis on …', ['odavam', 'tugevam', 'paremas korras', 'soodsam', 'soodustusega']],
        ['Poes küsin: Kas teil on …?', ['suuremat', 'väiksemat', 'pikemat', 'odavamat', 'teist värvi']],
      ], 'full', 'g_vocab'),
      B.wordorder('033_d_order', 'Pane võrdlus kokku.', 'Kirjuta Teise Ringi laused õiges järjekorras.', ['Kas teil on suuremat jopet?', 'Must jope on soojem kui hall.', 'See kampsun on mulle liiga kitsas.', 'Kas ma võin neid pükse proovida?', 'Kasutatud riided on odavamad kui uued.', 'Hall jope on viis eurot odavam.', 'Proovikabiin on akna juures.', 'See värv sobib sulle väga hästi.'], 'full'),
      B.vocab('033_d_vocab', 'Tunni sõnad.', ['proovima — примерять', 'sobima — подходить', 'kitsas — узкий', 'lai — широкий', 'pikk — длинный', 'lühike — короткий', 'kerge — лёгкий', 'paks — толстый', 'kasutatud — подержанный', 'parem — лучше']),
      teach(tag(B.speaking('033_d_survey', 'Küsitlus: uus või kasutatud?', 'Küsi kolmelt inimeselt samad küsimused. Kes ostab kõige rohkem kasutatud asju?', ['Kas sa ostad uusi või kasutatud riideid? Miks?', 'Kus on sinu linnas riided odavamad?', 'Mis on sinu jaoks tähtsam: hind või kvaliteet?', 'Mis on sinu kõige soojem riie?', 'Kas sa müüd või kingid oma vanu riideid?'], [60, 120], ['… on odavam kui …', 'Mulle meeldib … rohkem.', 'Minu kõige soojem riie on …']), { task: 'S09', fluency: true }),
        'Üks-ühele: õpilane küsib samad küsimused õpetajalt kolm korda; õpetaja vastab iga kord teise inimesena (Grete, Malle, Kristo). Lõpus ütleb õpilane, kes ostab kõige rohkem kasutatud asju ja miks.'),
    ],
    practice: [
      B.match('033_p_ask', 'Mida sa müüjale ütled?', 'Ühenda probleem proovikabiinis ja palve müüjale.', [
        ['Jope on liiga väike.', 'Kas teil on suuremat?'], ['Püksid on liiga pikad.', 'Kas teil on lühemaid?'], ['Kampsun on liiga kallis.', 'Kas teil on odavamat?'], ['Saapad on liiga kitsad.', 'Kas teil on laiemaid?'],
        ['Kleit on liiga suur.', 'Kas teil on väiksemat?'], ['Sall on liiga lühike.', 'Kas teil on pikemat?'], ['Sulle ei meeldi värv.', 'Kas teil on teist värvi?'], ['Sa ei tea, kus proovida.', 'Kus on proovikabiin?'],
      ], 'full', 'g_vocab'),
      tag(B.listening('033_p_radio', 'Eksaminurk: raadiosaade.', 'Teise Ringi omanik räägib raadios. Kuula kaks korda. Kirjuta vastus 1–2 sõnaga.', [
        'Ülle: Tere, kuulajad! Täna on stuudios Mirjam, kasutatud riiete poe Teine Ring omanik.',
        'Mirjam: Tere! Teine Ring asub Mustamäel, Sõpruse puiesteel. Pood on avatud juba kuus aastat.',
        'Mirjam: Ma avasin poe, sest minu kolmel lapsel oli kodus liiga palju väikeseid riideid.',
        'Mirjam: Meil on naiste, meeste ja laste riided. Meil on ka jalanõud, mänguasjad ja raamatud.',
        'Mirjam: Kõik asjad toovad meile inimesed ise. Me võtame vastu ainult puhtaid ja terveid asju.',
        'Mirjam: Kasutatud jope maksab meil kolm või neli korda vähem kui uus jope.',
        'Mirjam: Kõige rohkem ostavad meilt üliõpilased ja noored pered. Lapsed kasvavad ju kiiresti!',
        'Mirjam: Talvel on kõige populaarsemad soojad joped ja saapad. Need lähevad väga kiiresti.',
        'Mirjam: Uued asjad tulevad poodi igal esmaspäeval. Siis on poes kõige rohkem valikut.',
        'Mirjam: Teisipäeval on meil soodustuspäev. Siis on kõik hinnad kümme protsenti odavamad.',
        'Mirjam: Asjad, mida keegi kahe kuu jooksul ei osta, anname tasuta ära.',
        'Mirjam: Minu lemmikasi poes on vana punane kohver. See on vanem kui mina!',
        'Ülle: Kas kasutatud riideid saab ka tagastada?',
        'Mirjam: Kahjuks mitte. Seepärast proovige riided enne ostu kabiinis selga.',
        'Mirjam: Meil on kolm proovikabiini ja seal mängib alati hea muusika.',
        'Mirjam: Hinnasildil on alati suurus ja hind. Kollase sildiga asjad on veel odavamad.',
        'Mirjam: Meil töötab kolm inimest. Kristo aitab kliente, Liina võtab vastu uusi asju ja mina teen kõike muud.',
        'Mirjam: Detsembris on meil ka jõulunurk: vanad kaunistused, küünlad ja raamatud lastele.',
        'Ülle: Mis on teie kõige odavam asi?',
        'Mirjam: Lastesokid. Paar maksab ainult viiskümmend senti. Kõige kallim on praegu üks nahkmantel, see maksab kuuskümmend eurot.',
        'Mirjam: Kasutatud riided on odavamad ja need on ka loodusele paremad. Tulge julgelt!',
        'Ülle: Aitäh, Mirjam! Teine Ring on lahti esmaspäevast laupäevani kümnest kuueni.',
      ], ['Teine Ring asub [Mustamäel].', 'Pood on avatud juba [kuus|6] aastat.', 'Kasutatud jope on kolm või neli korda [odavam].', 'Kõige rohkem ostavad üliõpilased ja noored [pered].', 'Uued asjad tulevad poodi igal [esmaspäeval].', 'Soodustuspäev on [teisipäeval].', 'Mirjami lemmikasi on vana punane [kohver].', 'Kasutatud riideid ei saa [tagastada].']), { task: 'L03', harno: 'L3' }),
      B.formtext('033_p_form', 'Keskvõrre tekstis.', 'Kirjuta sulgudes olev sõna keskvõrdes: Sofia valib Miale kingitust.', 'Kingitus Miale', [
        'Sofia otsib Miale kingitust. Teises Ringis on kaks mänguasja pingviini.',
        '',
        'Valge pingviin on [suurem] (suur) kui must. Must pingviin on [väiksem] (väike), aga [pehmem] (pehme).',
        '',
        'Valge maksab viis eurot. Must on kaks eurot [odavam] (odav).',
        '',
        'Grete ütleb: „Väike pingviin on [parem] (hea). See mahub Mia kotti.”',
        '',
        'Mia on viieaastane. Tema vend Oskar on kolm aastat [vanem] (vana).',
        '',
        'Sofia ostab musta pingviini. Ta on nüüd [õnnelikum] (õnnelik) kui hommikul. Kingitus on [ilusam] (ilus), kui ta arvas.',
        '',
        'Kodus näitab Sofia pingviini Mallele. Malle ütleb: „Minu lapsepõlve mänguasjad olid palju [lihtsamad] (lihtne).” Aga tema nukk oli [suurem] (suur) kui see pingviin.',
      ]),
      B.transformation('033_p_comp', 'Võrdle.', 'Loe kahte fakti ja kirjuta üks võrdlus sulgudes oleva sõnaga.', [
        ['Must jope on pikk. Hall jope on lühike. (pikk)', 'Must jope on …', 'Must jope on pikem kui hall.'],
        ['Kaubahallis maksab jope 120 €, Teises Ringis 40 €. (kallis)', 'Kaubahallis on jope …', 'Kaubahallis on jope kallim kui Teises Ringis.'],
        ['Valge pingviin on suur. Must pingviin on väike. (väike)', 'Must pingviin on …', 'Must pingviin on väiksem kui valge.'],
        ['Kampsun on soe. T-särk ei ole soe. (soe)', 'Kampsun on …', 'Kampsun on soojem kui T-särk.'],
        ['Uued saapad on head. Vanad saapad on katki. (hea)', 'Uued saapad on …', 'Uued saapad on paremad kui vanad.'],
        ['Kristo on 25 aastat vana, Mirjam 45. (vana)', 'Mirjam on …', 'Mirjam on vanem kui Kristo.'],
        ['Turul maksavad sokid 8 €, poes 12 €. (odav)', 'Turul on sokid …', 'Turul on sokid odavamad kui poes.'],
        ['Hall jope kaalub vähe, must jope palju. (kerge)', 'Hall jope on …', 'Hall jope on kergem kui must.'],
      ]),
      tag(B.writing('033_p_rewrite', 'Arvustus poe kodulehele.', 'Kirjuta Sofia kiri emale ümber poe kodulehe arvustuseks: 6–8 lauset.', [6, 8], ['odavam', 'kui', 'parem', 'soovitan'], 2), { task: 'W12' }),
      teach(tag(B.speaking('033_p_explain', 'Seleta sõbrale.', 'Seleta kahele sõbrale järjest, miks kasutatud riided on head. Teine kord räägi kiiremini.', ['Mis on Teine Ring ja kus see on?', 'Miks on kasutatud riided odavamad?', 'Millal on poes soodustuspäev?', 'Mida tuleb enne ostu teha?', 'Kas sina ostad seal midagi? Miks?'], [60, 120], ['Teine Ring on …', 'Kasutatud jope on odavam kui …', 'Enne ostu proovi …']), { task: 'S13', fluency: true }),
        'Üks-ühele: õpilane seletab õpetajale kaks korda; õpetaja on esimesel korral Malle, teisel korral Tom (ta ei ole kunagi kasutatud riideid ostnud). Teine kord on lühem ja sujuvam.'),
    ],
    transfer: [
      B.text('033_t_sit', 'Lõpuks jope!', 'On teisipäev, Teise Ringi soodustuspäev. Sofia läheb poodi tagasi. Annal on vaba päev ja ta tuleb kaasa. Hall ja must jope on veel alles. Aga poes on ka uus jope: pikk ja tumesinine. Nüüd peab Sofia valima kolme jope vahel. Vaata pilti. Õhtul kirjutab Sofia sõbrale Katile.'),
      tag(B.insertion('033_t_board', 'Kolm jopet.', 'Kristo kirjutas jopede kohta tahvlile. Pane lünka sobiv lause, üks jääb üle.', 'Kolm jopet Teises Ringis', [
        'Täna on Teise Ringi soodustuspäev. [[Kõik hinnad on kümme protsenti odavamad.]]',
        '',
        'Jope 1 on hall, suurus L. See on lühike ja kerge. [[Sellel on kaks suurt taskut.]] Hind on täna 31,50 eurot.',
        '',
        'Jope 2 on must, suurus L. See on pikk ja soe ning sellel on kapuuts. [[Ühe tasku lukk on katki, aga selle saab parandada.]] Hind on täna 36 eurot.',
        '',
        'Jope 3 on tumesinine, suurus M. See on kõige pikem ja kõige soojem. [[Jope on peaaegu uus, aga see on ka kõige kallim.]] Hind on täna 49,50 eurot.',
        '',
        'Kasutatud riideid tagastada ei saa. [[Seepärast proovi jopet kabiinis koos kampsuniga.]] Proovikabiinid on akna juures.',
      ], ['Lillepott maksab täna kaksteist eurot.']), { task: 'R16' }),
      teach(B.ideaCard('033_t_choose', 'Kumb jope? Leppige kokku.', 'A on Sofia, B on Anna. Võrrelge kolme jopet ja valige üks.',
        'Sofial on 50 eurot. Ta vajab talveks sooja jopet. Tema suurus on M või L. Jope peab sobima ka paksu kampsuniga.',
        ['hall jope, 31,50 €', 'must jope, 36 €', 'tumesinine jope, 49,50 €', 'soojus', 'suurus', 'hind'], 'Mis jope Sofia ostab ja miks see on parem kui teised?', [90, 120]),
        'Üks-ühele: õpetaja on Anna ja soovitab alguses kõige kallimat jopet. Õpilane võrdleb (odavam, soojem … kui), küsib „Miks?” ja valib ise. Lõpus ütleb õpilane valiku ja hinna.'),
      B.planning('033_t_plan', 'Enne kirja: plaan.', 'Kirjuta märksõnad: mis on iga jope pluss ja miinus?', ['Hall jope: mis on hea, mis on halb?', 'Must jope: mis on hea, mis on halb?', 'Tumesinine jope: mis on hea, mis on halb?', 'Mis jope sobib talveks kõige paremini?'], 2),
      tag(B.examWriting('033_t_letter', 'Kiri Katile.', 'Kirjuta Sofia nimel Katile 50–70 sõna: mis jope sa ostsid ja miks.', 'kiri', {
        situation: 'Kati küsis, kas sul on juba talvejope. Täna ostsid sa Teises Ringis jope.',
        points: ['Kus sa käisid ja kellega?', 'Milliseid jopesid sa proovisid?', 'Mis jope sa ostsid ja mis see maksis?', 'Miks see on parem kui teised?'],
        words: [50, 70], opening: 'Tere, Kati!', closing: 'Kallistan! Sofia',
      }), { main: true }),
      tag(B.writing('033_t_edit', 'Paranda oma kiri.', 'Kontrolli kirjas võrdlusi (odavam kui …) ja osastavat. Kirjuta parandatud kiri.', [5, 7], ['odavam', 'kui', 'soojem', 'jopet'], 2), { task: 'W10' }),
      tag(B.speaking('033_t_record', 'Salvesta: kaks jopet pildil.', 'Vaata pilti ja salvesta kodus 45–60 sekundit: mida Sofia ja Anna võrdlevad?', ['Kus Sofia ja Anna on?', 'Mida Sofia võrdleb?', 'Kumb jope on pikem ja kumb lühem?', 'Mis on sinu jaoks tähtsam: hind või soojus? Miks?'], [45, 60], ['Pildil on …', 'Must jope on pikem kui …', 'Minu jaoks on tähtsam …']), { task: 'S15' }),
      B.rubric('033_t_rubric', 'Hindamine.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Valik on põhjendatud: hind, soojus ja suurus.', 'Kirjas on vastus kõigile neljale punktile (50–70 sõna).', 'Kirjas on vähemalt kolm võrdlust: … -m kui …', 'Parandatud kirjas on vähem vigu kui esimeses.']),
      B.selfcheck('033_t_self', ['Ma saan kuuldust aru, mis on odavam või soojem.', 'Ma palun poes teist suurust või värvi.', 'Ma võrdlen kahte asja: odavam, soojem … kui.', 'Ma kirjutan sõbrale, mida ma valisin ja miks.'], 'Jope on valitud'),
    ],
  },

  'a2-034': {
    title: 'Katkine veekeetja',
    canDo: 'Ma loen poe reegleid ja kviitungit, tagastan katkise asja (kahe aasta garantii, kuni reedeni, kviitungiga) ja kirjutan loo lõpu 60–80 sõnaga.',
    discover: [
      B.review('034_d_review', [['Kumb jope on sinu arvates parem: hall või must? Miks?', 'a2-033'], ['Mis kell sa hommikul ärkad ja mida sa kõigepealt teed?', 'a2-011'], 'Mis asi läks sinu kodus viimati katki?']),
      B.text('034_d_hook', 'Lugu veekeetjast', 'Detsembri alguses läks Malle vana veekeetja katki. Sofia ostis Kaubahallist uue. Loe, mis juhtus kümne päeva pärast. Kas sa arvad, et Sofia saab oma raha tagasi?'),
      B.reading('034_d_story', 'Loe lugu.', 'Loe Sofia lugu ja vasta küsimustele lühidalt.', 'Veekeetja ei tööta',
        'Detsembri alguses läks Malle vana veekeetja katki. See oli väga vana, Malle ostis selle kakskümmend aastat tagasi. Samal päeval ostis Sofia Kaubahallist uue veekeetja. See oli valge ja maksis 34,90 eurot.\n\nKümme päeva oli kõik hästi. Igal hommikul keetis Malle uues veekeetjas vett. Ta jõi teed oma uutest rohelistest tassidest.\n\nAga eile hommikul ei läinud vesi enam kuumaks. Veekeetja väike tuli põles, aga vesi jäi külmaks. Malle oli kurb: „Hommik ilma teeta ei ole hea hommik!”\n\nSofia vaatas veekeetjat. Juhe oli terve ja vett oli piisavalt. Aga veekeetja ei töötanud.\n\nÕhtul tuli onu Viktor külla. Viktor oskab parandada peaaegu kõike: jalgrattaid, kellasid ja raadioid. „Ära seda paranda,” ütles ta. „See on uus asi ja sellel on garantii. Vii see poodi tagasi.”\n\nSofia otsis kviitungit. Rahakotis seda ei olnud. Laual ja kotis ka mitte. Kus on kviitung?',
        [['Kui vana oli Malle vana veekeetja?', 'kakskümmend aastat|20 aastat|väga vana'], ['Kust Sofia uue veekeetja ostis?', 'Kaubahallist'], ['Kui palju uus veekeetja maksis?', '34,90 eurot|34,90 €|34,90'], ['Mitu päeva töötas uus veekeetja hästi?', 'kümme|10|kümme päeva'], ['Mis veekeetjaga juhtus?', 'vesi ei läinud kuumaks|vesi jäi külmaks'], ['Miks Viktor ei taha veekeetjat parandada?', 'sellel on garantii|see on uus ja sellel on garantii'], ['Mida Sofia ei leia?', 'kviitungit|kviitung']]),
      B.examListen('034_d_listen', 'Sofia helistab Viktorile.', 'Järgmisel hommikul helistab Sofia Viktorile. Kuula kaks korda ja ühenda lause osad.', 'match', [
        'Sofia: Tere, onu! Hea uudis: ma leidsin kviitungi!',
        'Viktor: Tubli! Kus see oli?',
        'Sofia: Köögis, karbis raha juures. Malle paneb kõik kviitungid sinna.',
        'Viktor: Väga hea. Mis kuupäev kviitungil on?',
        'Sofia: Kolmas detsember. Garantii on kaks aastat.',
        'Viktor: Siis ei ole probleemi. Aga kas karp on alles?',
        'Sofia: Ei ole. Ma viisin karbi prügikasti.',
        'Viktor: Pole hullu. Katkise kauba võtavad nad ka ilma karbita.',
        'Sofia: Kas sa tuled minuga poodi kaasa? Mul on täna keeletund kella kolmeni.',
        'Viktor: Hommikul olen ma turul kaheksast kaheteistkümneni. Pärast seda on mul aega.',
        'Sofia: Infolett on lahti kümnest kuueni. Kas kell neli sobib?',
        'Viktor: Sobib. Kohtume kell neli Kaubahalli ukse ees.',
        'Sofia: Aitäh, onu! Malle ootab juba oma teed.',
        'Viktor: Ütle Mallele, et ma toon talle purgi mett!',
      ], [
        ['Sofia leidis kviitungi', 'köögist karbist.'], ['Malle paneb karpi', 'kõik kviitungid.'], ['Veekeetja garantii on', 'kaks aastat.'], ['Veekeetja karp on', 'prügikastis.'],
        ['Katkise kauba võtab pood', 'ka ilma karbita.'], ['Sofial on täna keeletund', 'kella kolmeni.'], ['Viktor on hommikul', 'turul.'], ['Sofia ja Viktor kohtuvad', 'kell neli ukse ees.'],
      ], 'g_notice'),
      tag(B.reading('034_d_rules', 'Loe poe reegleid.', 'Sofia loeb Kaubahalli kodulehte. Kas ta saab veekeetja tagastada?', 'Kaubahall: tagastamine ja vahetus',
        'Terve kauba saab tagastada 14 päeva jooksul. Kaup peab olema puhas ja karbis. Tagastamiseks on vaja kviitungit. Ilma kviitungita me kaupa tagasi ei võta.\n\nKui kaup on katki, saad selle tagastada garantii ajal. Elektrikaupade garantii on kaks aastat. Katkise kauba võtame vastu ka ilma karbita. Siis saad valida: uus kaup või raha tagasi.\n\nRaha tagastame samal viisil, nagu sa maksid: kaardile või sularahas. Raha tuleb kaardile kolme päeva jooksul.\n\nKui ostsid kauba kampaania ajal, saad selle ainult vahetada.\n\nKliendikaardiga ostud näeme arvutis. Siis ei ole kviitungit vaja.\n\nTagastada saab infoletis esimesel korrusel. Infolett on avatud iga päev kella kümnest kuueni.',
        [['Mitme päeva jooksul saab terve kauba tagastada?', '14 päeva jooksul|14|neljateistkümne päeva jooksul'], ['Mida on tagastamiseks vaja?', 'kviitungit|kviitung'], ['Kui pikk on elektrikaupade garantii?', 'kaks aastat|2 aastat'], ['Kas katkise kauba saab tuua ilma karbita?', 'jah|jah, saab'], ['Mida saab valida, kui kaup on katki?', 'uus kaup või raha tagasi|uue kauba või raha tagasi'], ['Millal tuleb raha kaardile?', 'kolme päeva jooksul'], ['Kus ja mis kell saab kaupa tagastada?', 'infoletis kümnest kuueni|infoletis esimesel korrusel|kella kümnest kuueni']]), { task: 'R07' }),
      B.notice('034_d_notice', 'Märka: kuni reedeni, kviitungiga', [
        'Mis ajani? **kuni** reede**ni**, kuni detsembri lõpu**ni**, kella kuue**ni**',
        'Kui kaua? **14 päeva jooksul**, **kahe nädala jooksul**, **kahe aasta** garantii',
        'Millega? kviitungi**ga**, kaardi**ga** · Ilma milleta? **ilma** kviitungi**ta**, ilma karbi**ta**',
        'Pakkumine **kehtib** reedeni. Soodustus on **kümme protsenti**.',
        'Ma tahan veekeetja **tagastada**. Ma tahan suurust **vahetada**. Ma tahan **raha tagasi**.',
      ], 'full'),
      tag(B.vocab('034_d_vocab', 'Tunni sõnad.', ['kviitung — чек', 'tagastama — возвращать (товар)', 'vahetama — обменивать', 'katki — сломан', 'garantii — гарантия', 'jooksul — в течение', 'kuni — до', 'tagasi — назад', 'veekeetja — чайник', 'karp — коробка']), { topic: ['kviitung', 'tagastama'] }),
      teach(tag(B.speaking('034_d_retell', 'Jutusta lugu kaks korda.', 'Jutusta veekeetja lugu kaks korda: esimest korda 2 minutit, teist korda 1 minut.', ['Mis juhtus Malle vana veekeetjaga?', 'Kust ja mille eest Sofia uue ostis?', 'Mis juhtus kümne päeva pärast?', 'Mida Viktor ütles?', 'Kus oli kviitung?'], [60, 120], ['Detsembri alguses …', 'Kümne päeva pärast …', 'Viktor ütles: …']), { task: 'S07', fluency: true }),
        'Üks-ühele: õpilane jutustab õpetajale loo kaks korda; õpetaja hoiab aega (2 minutit, siis 1 minut) ja ei paranda. Teine kord on lühem, aga kõik tähtsad faktid on alles.'),
      tag(B.writing('034_d_nonstop', 'Kaheksa minutit järjest.', 'Kirjuta peatumata kaheksa minutit: mis asi läks sul katki ja mida sa tegid?', [6, 8], ['katki', 'poodi', 'kviitung', 'tagasi'], 2), { task: 'W06', fluency: true }),
    ],
    practice: [
      B.errorfix('034_p_fix', 'Paranda viga.', 'Sofia kirjutas poe reeglid märkmikku. Leia viga ja kirjuta lause õigesti.', [
        ['Pakkumine kehtib kuni reede.', 'Pakkumine kehtib kuni reedeni.'],
        ['Tagastada saab ainult kviitung.', 'Tagastada saab ainult kviitungiga.'],
        ['Katkise kauba võtavad nad ka ilma karp.', 'Katkise kauba võtavad nad ka ilma karbita.'],
        ['Veekeetjal on kaks aasta garantii.', 'Veekeetjal on kahe aasta garantii.'],
        ['Kaupa saab tagastada neliteist päeva jooksul.', 'Kaupa saab tagastada neljateistkümne päeva jooksul.'],
        ['Infolett on avatud kella kümnest kuni kuus.', 'Infolett on avatud kella kümnest kuueni.'],
        ['Ma tahan oma veekeetja tagastama.', 'Ma tahan oma veekeetja tagastada.'],
        ['Raha tuleb kaardile kolm päeva jooksul.', 'Raha tuleb kaardile kolme päeva jooksul.'],
      ]),
      tag(B.examListen('034_p_clips', 'Kaubahalli teadaanded.', 'Kuula kaheksat lühikest teadaannet kaks korda. Vali õige vastus.', 'choice', [
        'Teadustaja: Head kliendid! Infolett on täna avatud kella kümnest kuueni.',
        'Teadustaja: Kõik veekeetjad on sel nädalal kümne protsendi soodustusega.',
        'Teadustaja: Kliendikaardi saab tasuta kassast, esimesel korrusel.',
        'Teadustaja: Jõulukingitusi pakime neljandal korrusel kuni kahekümne kolmanda detsembrini.',
        'Teadustaja: Lapsevanemad! Väike Karl ootab oma ema infoleti juures.',
        'Teadustaja: Talvesaapad on täna kahe paari eest ühe hinnaga.',
        'Teadustaja: Parkimine on kolm tundi tasuta, kui ostad üle kümne euro eest.',
        'Teadustaja: Pühapäeval on Kaubahall avatud kella kümnest kaheksani.',
      ], [
        ['Mis kellani on infolett täna lahti?', 'kella kuueni', 'kella kümneni', 'kella kaheni'],
        ['Kui suur on veekeetjate soodustus?', '10%', '20%', '5%'],
        ['Kust saab kliendikaardi?', 'kassast', 'infoletist', 'kohvikust'],
        ['Mis kuupäevani saab kingitusi pakkida?', 'kuni 23. detsembrini', 'kuni 13. detsembrini', 'kuni 31. detsembrini'],
        ['Kus väike Karl ootab?', 'infoleti juures', 'kassa juures', 'lifti juures'],
        ['Mis on täna talvesaabastega?', 'kaks paari ühe hinnaga', 'kõik on tasuta', 'need on kümme protsenti odavamad'],
        ['Kui kaua on parkimine tasuta?', 'kolm tundi', 'kaks tundi', 'terve päeva'],
        ['Mis kellani on pood pühapäeval lahti?', 'kella kaheksani', 'kella kümneni', 'kella kuueni'],
      ], 'g_vocab'), { task: 'L01' }),
      B.truefalse('034_p_tf', 'Õige või vale?', 'Mõtle poe reeglitele ja Sofia telefonikõnele. Kas lause on õige?', [
        ['Terve kauba saab tagastada kahe nädala jooksul.', true],
        ['Ilma kviitungita võtab Kaubahall kauba alati tagasi.', false],
        ['Elektrikaupade garantii on Kaubahallis üks aasta.', false],
        ['Katkise kauba eest saab raha tagasi või uue asja.', true],
        ['Kampaania ajal ostetud kaupa saab ainult vahetada.', true],
        ['Kaardile tuleb raha kohe samal päeval.', false],
        ['Sofia leidis kviitungi oma rahakotist.', false],
        ['Viktor ja Sofia kohtuvad kell neli Kaubahalli ees.', true],
      ], 'full'),
      B.dictation('034_p_dict', 'Dikteerimine: poe reeglid.', 'Õpetaja loeb iga lause kaks korda. Kirjuta lause täpselt üles.', [
        'Kaupa saab tagastada kahe nädala jooksul.', 'Pakkumine kehtib kuni pühapäevani.', 'Tagastamiseks on vaja kviitungit.',
        'Uuel veekeetjal on kahe aasta garantii.', 'Ilma karbita võtame katkise kauba ka vastu.', 'Infolett on lahti kümnest kuueni.',
      ]),
      tag(B.insertion('034_p_leaflet', 'Pealkiri igale lõigule.', 'Kaubahalli infolehel on viis lõiku. Kirjuta igale lõigule pealkiri, kaks jääb üle.', 'Kuidas kaupa tagastada?', [
        '[[Kviitung]]', 'Hoidke kviitung alles! Ilma kviitungita ei saa me kaupa tagasi võtta. Kliendikaardiga ostud näeme arvutis.',
        '',
        '[[Tähtaeg]]', 'Terve kauba saate tagastada neljateistkümne päeva jooksul. Kaup peab olema puhas ja karbis.',
        '',
        '[[Garantii]]', 'Elektrikaupadel on kahe aasta garantii. Katkise asja eest saate uue asja või raha tagasi.',
        '',
        '[[Raha]]', 'Raha tuleb kaardile kolme päeva jooksul. Kui maksite sularahas, saate raha kohe kassast.',
        '',
        '[[Koht]]', 'Tagastada saab infoletis esimesel korrusel, kassade kõrval.',
      ], ['Kingitused', 'Hinnad'], 'g_vocab'), { task: 'R09' }),
      tag(B.examWriting('034_p_card', 'Eksaminurk: visiitkaart.', 'Viktor andis Sofiale visiitkaardi. Kirjuta Mallele 40–60 sõna: kes, kus, millal, kontakt.', 'teade', {
        situation: 'Visiitkaart: Kodutehnika parandus „Kiir” · meister Raivo Kask · Sõpruse puiestee 14, Mustamäe · E–R 9–18, L 10–14 · tel 5512 9090 · Parandame veekeetjaid, kohvimasinaid ja tolmuimejaid.',
        points: ['Kes on Raivo Kask ja mida ta parandab?', 'Kus töökoda asub?', 'Millal on töökoda lahti?', 'Kuidas saab meistriga ühendust?'],
        words: [40, 60], opening: 'Tere, Malle!', closing: 'Sofia',
      }), { task: 'W07', harno: 'W1', level: 3 }),
      B.speaking('034_p_say', 'Garantii ja tagastamine.', 'Vasta küsimustele ja räägi oma kogemusest. Kasuta sõnu kuni, jooksul ja ilma.', ['Kas sa hoiad kviitungeid alles? Kus?', 'Mitme päeva jooksul saab sinu lemmikpoes kaupa tagastada?', 'Mida sa teed, kui uus asi läheb kohe katki?', 'Kas sa parandad asju ise või viid töökotta?', 'Mis asjal on sinu kodus kõige pikem garantii?'], [60, 120], ['Kaupa saab tagastada … jooksul.', 'Ilma kviitungita …', 'Garantii kehtib kuni …']),
    ],
    transfer: [
      B.text('034_t_sit', 'Kaubahalli infoletis', 'Kell neli on Viktor ja Sofia Kaubahalli infoletis. Viktor hoiab käes katkist veekeetjat ja kviitungit. Infoletis töötab täna Siiri. Ta kontrollib kviitungit ja näitab tagastuskasti. Vaata pilti. Õhtul saadab Kaubahall Sofiale e-kirja. Lõpuks kirjutad sa loo lõpu.'),
      teach(tag(B.rolecards('034_t_desk', 'Infoletis.', 'A on Viktor, B on Siiri. A tagastab katkise veekeetja kviitungiga.',
        'Sa oled Viktor. Veekeetja ei tööta: vesi ei lähe kuumaks. Sofia ostis selle kolmandal detsembril. Kviitung on olemas, karpi ei ole. Küsi võimalusi ja vali üks.',
        'Sa oled Siiri. Kontrolli kviitungit ja kuupäeva. Paku raha tagasi või uut veekeetjat. Uus veekeetja „Tugev” maksab 39 eurot.',
        ['Tere! See veekeetja on katki.', 'Me ostsime selle … päeva tagasi.', 'Kas me saame raha tagasi?'], ['Kas teil on kviitung?', 'Teil on kaks võimalust.', 'Hinnavahe maksate juurde.']), { task: 'S10' }),
        'Üks-ühele: õpilane toob infoletti päris asja ja „kviitungi”. Õpetaja on Siiri, küsib kuupäeva ja pakub kahte võimalust. Siis vahetage rollid: õpetaja on klient ja unustab kviitungi.'),
      B.insertion('034_t_mail', 'Kaubahalli e-kiri.', 'Õhtul tuleb Sofiale e-kiri. Pane lünka sobiv fraas, kaks fraasi jääb üle.', 'Teie veekeetja', [
        'Tere, Sofia!',
        '',
        'Aitäh, et tõite katkise veekeetja [[kviitungiga infoletti]]. Meie meister kontrollis veekeetjat kohe infoleti taga. Sellel on tehase viga, see ei ole teie süü.',
        '',
        'Te valisite uue veekeetja Tugev. See maksab 39 eurot. Vana veekeetja eest saite tagasi [[34 eurot ja 90 senti]]. Hinnavahe maksis teie onu kohe kassas.',
        '',
        'Uuel veekeetjal on ka [[kahe aasta garantii]]. Palun hoidke kviitung alles. Vana veekeetja saadame [[tehasesse tagasi]].',
        '',
        'Kliendikaardiga saate järgmisel ostul [[viie protsendi soodustuse]]. Pakkumine kehtib [[kuni detsembri lõpuni]].',
        '',
        'Kui teil on küsimusi, helistage meile iga päev kella kümnest kuueni. Vabandame ja soovime teile head teed! Kaubahalli klienditeenindus, Siiri',
      ], ['kahe nädala pärast', 'ilma kviitungita']),
      B.examWriting('034_t_form', 'Tagastamise vorm.', 'Täida Kaubahalli tagastamise vorm Sofia ja veekeetja andmetega.', 'kusimustik', {
        situation: 'Infoletis annab Siiri Sofiale tagastamise vormi.',
        questions: ['Kliendi nimi:', 'Mis kaup see on?', 'Ostu kuupäev:', 'Hind:', 'Mis on katki?', 'Mida soovite: raha tagasi või uus kaup? Miks?'],
      }),
      tag(B.examWriting('034_t_story', 'Loo lõpp.', 'Kirjuta veekeetja loo lõpp 60–80 sõnaga: mis juhtus Kaubahallis ja kodus?', 'jutt', {
        situation: 'Pealkiri: „Malle saab jälle teed juua”.',
        points: ['Kuidas Sofia ja Viktor infoletti läksid?', 'Mida Siiri ütles ja pakkus?', 'Mida nad valisid ja kui palju maksid?', 'Mis juhtus õhtul kodus?'],
        words: [60, 80],
      }), { main: true }),
      tag(B.speaking('034_t_record', 'Salvesta: infoletis.', 'Vaata pilti ja salvesta kodus 45–60 sekundit: mis infoletis toimub?', ['Kus Viktor ja Siiri on?', 'Mida Viktor käes hoiab?', 'Mida Siiri kontrollib?', 'Mida on vaja, kui sa tahad kaupa tagastada?'], [45, 60], ['Pildil on …', 'Viktor hoiab käes …', 'Tagastamiseks on vaja …']), { task: 'S15' }),
      B.rubric('034_t_rubric', 'Mooduli lõpp: hindamine.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Infoletis ütleb õpilane, mis on katki ja millal see osteti, ning valib lahenduse.', 'Tagastamise vorm on täidetud õigete andmetega.', 'Loo lõpus on vastus kõigile neljale punktile (60–80 sõna).', 'Vormid on õiged: kviitungiga, kuni reedeni, kahe aasta garantii.']),
      B.selfcheck('034_t_self', ['Ma loen poe reegleid ja kviitungit.', 'Ma tagastan katkise asja kviitungiga.', 'Ma ütlen: kuni reedeni, kahe nädala jooksul, ilma kviitungita.', 'Ma kirjutan loo lõpu.'], 'Uus veekeetja köögis'),
    ],
  },

  'a2-035': {
    title: 'Kontroll 7 — ostud ja raha',
    assessment: true,
    canDo: 'Ma näitan kontrollis, et oskan poes küsida ja valida, saan aru hindadest, kviitungist ja kampaaniast ning lahendan probleemi kaubaga (vähemalt 70%, numbrid 80%).',
    discover: [
      B.text('035_d_situation', 'Kordame', 'Enne kontrolli kordame mooduli tähtsamat: kaubad ja osakonnad, arvud ja hinnad, proovimine ja võrdlemine, kviitung, kampaania ja tagastus.'),
      B.notice('035_d_notice', 'Mooduli kokkuvõte', ['Ma otsin **musta jopet**. Mul on vaja **sooja mütsi**.', 'Arvud: 25 **kakskümmend viis**, 150 **sada viiskümmend**; 2 **eurot**, 3 **särki**', 'Võrdlus: odava**m**, kalli**m**, suure**m kui** …; Kas teil on **suuremat**?', 'Kviitungi**ga**, **ilma** kviitungi**ta**; kehtib kuni reede**ni**', 'Probleem: See on **katki**. Ma tahan **raha tagasi**.']),
      B.reading('035_d_read', 'Loe: Olga ostupäev.', 'Lugege Olga ostupäevast ja vastake küsimustele lühidalt.', 'Saapad ja kott',
        'Laupäeval läks Olga kaubamajja. Ta vajas pojale talvesaapaid ja endale uut kotti. Jalanõude osakond oli kolmandal korrusel. Poja suurus on 33. Esimesed saapad olid liiga kitsad. Müüja tõi laiemad saapad, need sobisid hästi. Saapad maksid 55 eurot, aga täna oli allahindlus 20%. Olga maksis ainult 44 eurot. Siis läks Olga kotte vaatama. Punane kott oli ilus, aga kallis, 70 eurot. Must kott oli odavam, 45 eurot. Olga ostis musta koti. Kodus nägi ta, et koti lukk on katki! Pühapäeval läks Olga tagasi poodi. Tal oli kviitung alles. Müüja vabandas ja andis uue koti.',
        [['Mida Olga vajas?', 'talvesaapaid ja kotti|saapaid ja kotti'], ['Mis suurus on poja jalg?', '33'], ['Kui palju Olga saabaste eest maksis?', '44 eurot'], ['Miks Olga ei ostnud punast kotti?', 'see oli kallis|liiga kallis|see oli kallim'], ['Mis oli kotil valesti?', 'lukk oli katki|lukk on katki|lukk'], ['Mida müüja tegi?', 'vabandas ja andis uue koti|andis uue koti']]),
      B.truefalse('035_d_tf', 'Õige või vale?', 'Loe Olga teksti uuesti.', [
        ['Jalanõud olid kolmandal korrusel.', true], ['Esimesed saapad olid liiga suured.', false], ['Olga maksis saabaste eest 55 eurot.', false], ['Must kott oli odavam kui punane.', true], ['Olgal ei olnud kviitungit.', false],
      ]),
      B.crossword('035_d_cross', 'Mooduli sõnad.', 'Kordamine: lahendage ristsõna poe sõnadega.', [
        ['Paber, kus on ostud ja hinnad', 'kviitung'], ['Seal proovid riideid', 'proovikabiin'], ['Hind on madalam kui tavaliselt', 'allahindlus'],
        ['Inimene, kes töötab poes', 'müüja'], ['Siin maksad ostu eest', 'kassa'], ['Selles hoiad raha', 'rahakott'],
      ]),
      B.wordforms('035_d_forms', 'Mis vorm?', 'Kordamine: kirjutage sõna vormis, mida lause vajab.', [
        ['must jope', 'ma otsin …', 'musta jopet'], ['soe müts', 'mul on vaja …', 'sooja mütsi'], ['odav', 'keskvõrre', 'odavam'], ['kallis', 'keskvõrre', 'kallim'],
        ['euro', 'kolm …', 'eurot'], ['reede', 'kuni …', 'reedeni'], ['kviitung', 'ilma …', 'kviitungita'],
      ]),
      B.manymatch('035_d_match', 'Mida öelda poes?', 'Mida poes öelda? Ühendage olukord ja sobiv lause.', ['Sa otsid osakonda.', 'Särk on liiga väike.', 'Sa tahad proovida.', 'Kaup on katki.', 'Sa tahad teada hinda.'], ['Kus on riiete osakond?', 'Kas teil on suuremat?', 'Kus on proovikabiin?', 'Ma tahan raha tagasi.', 'Mis see maksab?'], 'full', 'g_use'),
      B.transformation('035_d_trans', 'Võrdle.', 'Kirjuta võrdlus sulgudes oleva sõnaga.', [
        ['jope 60 €, mantel 90 €', 'Jope on … (odav)', 'Jope on odavam kui mantel.'], ['kleit S, kleit M', 'M on … (suur)', 'M on suurem kui S.'], ['särk 35 €, T-särk 15 €', 'Särk on … (kallis)', 'Särk on kallim kui T-särk.'],
        ['Siiri 160 cm, Kati 172 cm', 'Kati on … (pikk)', 'Kati on pikem kui Siiri.'], ['punane kott (ilus), must kott', 'Punane kott on … (ilus)', 'Punane kott on ilusam kui must kott.|Punane kott on ilusam kui must.'],
      ]),
      B.errorfix('035_d_fix', 'Paranda viga.', 'Kordamine: igas lauses on üks viga. Kirjutage lause õigesti.', [
        ['Ma otsin sinine kleit.', 'Ma otsin sinist kleiti.'], ['See maksab viis euro.', 'See maksab viis eurot.'], ['Must on odavam mis punane.', 'Must on odavam kui punane.'],
        ['Kampaania kehtib kuni laupäev.', 'Kampaania kehtib kuni laupäevani.'], ['Kas teil on suurem?', 'Kas teil on suuremat?'], ['Ma tahan jope tagastama.', 'Ma tahan jope tagastada.'],
      ]),
      B.gaps('035_d_gaps', 'Kordame vorme.', 'Kordamine: pange sulgudes sõna lausesse õiges vormis.', [
        'Ma vajan [uut] jopet. (uus)', 'Kotis on kolm [särki]. (särk)', 'Must kott on [odavam] kui punane. (odav)', 'Pakkumine kehtib [pühapäevani]. (pühapäev)',
        'Raha tagasi saab ainult [kviitungiga]. (kviitung)', 'Kas ma võin seda kleiti [proovida]? (proovima)',
      ]),
      B.translation('035_d_tr', 'Tõlgi eesti keelde.', 'Kordamine: öelge vene lause eesti keeles ja kirjutage see.', ['Я ищу зимние сапоги.', 'Это стоит сорок пять евро.', 'У вас есть размер поменьше?', 'Синяя сумка дороже.', 'Скидка действует до воскресенья.', 'Молния сломана, я хочу деньги обратно.']),
      B.wordorder('035_d_order', 'Pane lause kokku.', 'Kordamine: pange Olga loo sõnad lauseks õiges järjekorras.', ['Jalanõude osakond on kolmandal korrusel.', 'Laiemad saapad sobisid hästi.', 'Must kott oli odavam.', 'Tal oli kviitung alles.', 'Müüja andis uue koti.']),
      B.speaking('035_d_say', 'Proovieksam: ostud.', 'Proovieksam: vastake õpetaja küsimustele ostude kohta täislausega.', ['Kus te tavaliselt riideid ostate?', 'Mis oli teie viimane ost?', 'Mis on teie jaoks kallis?', 'Kas te olete midagi tagastanud?'], [45, 90]),
      B.writing('035_d_write', 'Kordame kirjutamist.', 'Kirjuta 6–8 lauset: üks ost, hind ja kas see sobis.', [6, 8], ['ostsin', 'maksis', 'sobis'], 2),
    ],
    practice: [
      B.tip('035_p_how', 'Kontroll: lugemine, kuulamine, keel (eksami vormis)', 'See leht on nagu Harno A2 eksami lugemine ja kuulamine. Tee kõik ilma abita. Kuulamisteksti loeb õpetaja kaks korda. Eesmärk on vähemalt 70%, numbrid ja hinnad 80%.', 'full'),
      tag(B.choice('035_p_polite', 'Lugemine 1. Mida öelda?', 'Lugege olukorda poes. Valige sobiv lause (A, B või C).', [
        ['Müüja küsib: „Kas saan aidata?”', 'Jah, ma otsin jopet.', 'Jah, head isu!', 'Ei, ma ei tea.'], ['Püksid on liiga pikad.', 'Kas teil on lühemaid?', 'Kas teil on pikemaid?', 'Kas teil on kallimaid?'],
        ['Sa tahad maksta.', 'Kus on kassa?', 'Kus on proovikabiin?', 'Kus on osakond?'], ['Kaup on katki.', 'Ma tahan seda tagastada.', 'Ma tahan seda proovida.', 'Ma tahan seda osta.'],
        ['Kassapidaja küsib kliendikaarti.', 'Jah, palun, siin on.', 'Jah, see sobib.', 'Ei, see on liiga kallis.'],
      ], 'full', 'g_use'), { harno: 'R1' }),
      tag(B.adsmatch('035_p_ad', 'Lugemine 2. Kolm kuulutust.', 'Lugege kolme kuulutust. Millise kuulutuse kohta lause käib? Kirjutage A, B või C.', [
        ['Kingapood Samm kolib!', 'Kingapood Samm kolib uude kohta. Kõik jalanõud on kuni 50% odavamad. Allahindlus kehtib 1. juunist 15. juunini. Naiste kingad maksavad nüüd 29 eurot, meeste saapad 45 eurot. Allahinnatud jalanõusid saab vahetada 7 päeva jooksul, aga mitte tagastada.'],
        ['Toidupood Mari', 'Meie pood on avatud iga päev kella kaheksast kümneni. Järgmisel nädalal on kõik puuviljad 20% odavamad. Kliendikaardi saab kassast tasuta. Kaardiga saad iga kuu uusi pakkumisi. Kaupa saab tagastada ainult kviitungiga.'],
        ['E-pood Stiil', 'Telli riided koju! Kohaletoomine on tasuta, kui ostad üle viiekümne euro eest. Kui riie ei sobi, saad selle tasuta tagastada kahe nädala jooksul. Raha tuleb pangakontole viie päeva jooksul. Klienditeenindus vastab tööpäeviti kella üheksast viieni.'],
      ], [
        ['Siin ei pea poodi minema, kaup tuleb koju.', 'C'],
        ['Siin on hinnad praegu kuni poole odavamad.', 'A'],
        ['Siin saab tasuta kaardi, millega tulevad pakkumised.', 'B'],
        ['Siin saab soodushinnaga kaupa ainult vahetada.', 'A'],
        ['Siin on pood lahti ka pühapäeva õhtul.', 'B'],
        ['Siin tuleb raha tagasi pangakontole.', 'C'],
      ]), { harno: 'R2' }),
      B.cloze('035_p_cloze', 'Lugemine 3. Sõnum.', 'Lugege Olga sõnumit Annale. Valige igasse lünka sobiv sõna.', 'Tere, Anna!', [
        'Eile käisin kaubamajas. Ma otsisin {*sooja|soe|soojad} jopet. Hall jope oli liiga {*kitsas|kitsam|kitsast}, aga müüja tõi {*suurema|suurem|suuremat} suuruse.',
        'See sobis {*mulle|mina|minu} hästi. Hind oli 89 {*eurot|euro|eurod}, aga täna oli 20% {*allahindlus|allahindlust|allahindlusega}.',
        'Ma maksin {*kaardiga|kaart|kaarti}. Kviitungi panin {*rahakotti|rahakott|rahakotis}. Sofia',
      ]),
      B.reading('035_p_receipt', 'Lugemine 4. Kviitung.', 'Lugege toidupoe kviitungit ja vastake küsimustele.', 'Toidupood Mari',
        'Kuupäev 14.10.2026, kell 18.20. Leib maksab 1,30. Piim, 2 pakki, 0,99 tükk, kokku 1,98. Juust, pool kilo, 4,20. Õunad, poolteist kilo, 2,10. Kohv maksab 6,90, allahindlus 30%, miinus 2,07. Kokku: 14,41 eurot. Makstud sularahas: 20 eurot. Tagasi: 5,59 eurot. Kliendikaardiga säästsite täna 2,07 eurot. Teid teenindas kassapidaja Kaire. Pood on avatud iga päev kell 8–22. Tagastamine on võimalik ainult kviitungiga. Järgmisel nädalal on kõik puuviljad 20% odavamad. Kliendikaardi saab kassast tasuta. Kaardiga saab iga kuu uusi pakkumisi. Aitäh ostu eest!',
        [['Kui palju maksis juust?', '4,20 eurot|4,20'], ['Mitu pakki piima on kviitungil?', 'kaks|2'], ['Mis oli allahinnatud?', 'kohv'], ['Kui palju raha sai klient tagasi?', '5,59 eurot|5,59'], ['Kes oli kassapidaja?', 'Kaire']]),
      B.listening('035_p_listen', 'Kuulamine 1. Kassas.', 'Kuulake kassavestlust kaks korda. Kirjutage lünka 1–2 sõna.', [
        '— Tere! Kas teil on kliendikaart?', '— Jah, palun.', '— Särk maksab kakskümmend üheksa eurot.', '— Püksid maksavad nelikümmend viis eurot.',
        '— Kliendikaardiga saate kümme protsenti soodustust.', '— Kokku on kuuskümmend kuus eurot kuuskümmend senti.', '— Kas maksate kaardiga?', '— Ei, sularahas. Palun, siin on seitsekümmend eurot.',
      ], ['Särk maksab [29|kakskümmend üheksa] eurot.', 'Püksid maksavad [45|nelikümmend viis] eurot.', 'Soodustus on [kümme|10] protsenti.', 'Kokku on kuuskümmend kuus eurot [kuuskümmend|60] senti.', 'Klient maksab [sularahas].', 'Klient annab [seitsekümmend|70] eurot.']),
      B.listening('035_p_listen2', 'Kuulamine 2. Tagastus.', 'Kuulake tagastamise vestlust kaks korda. Kirjutage lünka 1–2 sõna.', [
        '— Tere! Ma ostsin eelmisel nädalal selle jope.', '— Tere! Mis probleem on?', '— Jope on liiga väike ja lukk on katki.', '— Kas teil on kviitung?', '— Jah, siin on.',
        '— Kas soovite raha tagasi või teist jopet?', '— Ma tahan suuremat jopet, suurust XL.', '— Kahjuks XL-i ei ole. Ma annan teile raha tagasi, kaheksakümmend eurot.',
      ], ['Klient ostis jope eelmisel [nädalal].', 'Jope on liiga [väike].', 'Jope [lukk] on katki.', 'Klient tahab suurust [XL].', 'Klient saab tagasi [kaheksakümmend|80] eurot.']),
      B.gaps('035_p_mix', 'Keel. Viis punkti.', 'Keel: kirjutage sulgudes olev sõna lausesse õiges vormis.', [
        'Ma otsin [punast] kleiti. (punane)', 'See maksab kolm [eurot]. (euro)', 'Mul on vaja kaks [särki]. (särk)', 'Hall jope on [kallim] kui must. (kallis)', 'Kas teil on [väiksemat]? (väike, osastav)',
      ]),
      B.gaps('035_p_mix2', 'Keel. Veel viis punkti.', 'Keel: veel viis lauset poe sõnadega, pange sõna õigesse vormi.', [
        'Pakkumine kehtib [reedeni]. (reede)', 'Ilma [kviitungita] ei saa. (kviitung)', 'Ma maksan [kaardiga]. (kaart, -ga)', 'Ma tahan jopet [tagastada]. (tagastama)', 'Allahindlus on 20 [protsenti]. (protsent)',
      ]),
      B.errorfix('035_p_fix', 'Keel. Paranda viga.', 'Keel: leidke ostulausetes viga ja kirjutage lause õigesti.', [
        ['Ma otsin must jope.', 'Ma otsin musta jopet.'], ['See maksab kaks euro.', 'See maksab kaks eurot.'], ['Sinine on ilusam mis hall.', 'Sinine on ilusam kui hall.'], ['Kampaania kehtib kuni pühapäev.', 'Kampaania kehtib kuni pühapäevani.'],
      ]),
      B.wordorder('035_p_order', 'Keel. Pane lause kokku.', 'Keel: pange poe laused õigesse järjekorda.', ['Kas teil on suuremat suurust?', 'Allahindlus kehtib kuni reedeni.', 'Ma tahan raha tagasi.', 'Kassa on ukse juures.']),
      B.translation('035_p_tr', 'Keel. Tõlgi eesti keelde.', 'Keel: tõlkige poes öeldud lause eesti keelde.', ['Сколько стоит эта куртка?', 'Можно это примерить?', 'Чёрная сумка дешевле.', 'Сохраните чек.']),
      B.writing('035_p_write', 'Kirjutamine. Sõnum poele.', 'Kirjutage poele 4–6 lauset: teie uus ost on katki.', [4, 6], ['ostsin', 'katki', 'kviitung'], 2),
      B.speaking('035_p_say', 'Rääkimine. Ostud.', 'Rääkimine: vastake õpetaja küsimustele oma ostude kohta.', ['Kus te ostate toitu?', 'Mis maksab Eestis liiga palju?', 'Kas te ostate kampaania ajal?', 'Mida te teete, kui ost on katki?'], [45, 75]),
    ],
    transfer: [
      B.text('035_t_situation', 'Kontroll: kirjutamine ja rääkimine', 'Sa ostsid e-poest Stiil jope. Jope on liiga väike ja üks tasku on katki. Täida tagastuse vorm, kirjuta poele ja räägi müüjaga. Eesmärk on vähemalt 70%.'),
      B.table('035_t_form', 'Kirjutamine 1. Tagastuse vorm.', 'Täitke e-poe tagastuse vorm oma andmetega.', 'Andmed, Sinu vastus', ['Nimi | ', 'Tellimuse number | ', 'Kaup | ', 'Suurus | ', 'Hind | ', 'Põhjus | ', 'Raha tagasi või vahetus? | ']),
      tag(B.letter('035_t_letter', 'Kirjutamine 2. Kiri poele.', 'Kirjutage poele 40–60 sõna: mis on valesti ja mida te soovite.', 'Tere!', 'Lugupidamisega', [40, 60]), { harno: 'W2a' }),
      tag(B.listening('035_t_listen', 'Kuulamine. Klienditeenindus.', 'Kuulake klienditeeninduse sõnumit kaks korda. Kirjutage lünka 1–2 sõna.', [
        'Tere! Siin Ene, e-poe Stiil klienditeenindus.', 'Aitäh teie kirja eest.', 'Jope saate tagastada kahe nädala jooksul.', 'Pange jope karpi ja viige postkontorisse.',
        'Tagastamine on tasuta.', 'Raha saate pangakontole viie päeva jooksul.',
      ], ['Klienditeenindaja nimi on [Ene].', 'Jope saab tagastada kahe [nädala] jooksul.', 'Jope tuleb viia [postkontorisse].', 'Tagastamine on [tasuta].', 'Raha tuleb viie [päeva] jooksul.']), { task: 'L03', harno: 'L3' }),
      B.planning('035_t_plan', 'Enne kirja.', 'Enne kirja: kirjutage märksõnad kolme küsimuse kohta.', ['Mida sa ostsid ja millal?', 'Mis on valesti?', 'Mida sa soovid?'], 2),
      B.transformation('035_t_check', 'Kontrolli lauseid.', 'Kontrollige: kirjutage nõudmine viisakalt teie-vormis.', [
        ['Anna raha tagasi!', 'Kas ma saan …?', 'Kas ma saan raha tagasi?'], ['Saada uus jope!', 'Palun …', 'Palun saatke uus jope.'], ['Kas on suuremat?', 'Kas teil on …?', 'Kas teil on suuremat?'],
        ['Vasta mulle kiiresti!', 'Palun …', 'Palun vastake mulle kiiresti.'], ['Ütle, kus on postkontor!', 'Palun öelge, …', 'Palun öelge, kus on postkontor.'],
      ]),
      tag(B.examWriting('035_t_write', 'Kirjutamine 3. Visiitkaart.', 'Kirjutage visiitkaardi järgi sõbrale 25–40 sõna: kes, kus, millal, kontakt.', 'teade', {
        situation: 'Visiitkaart: Rätsep Maie Lepp · parandab ja lühendab riideid, vahetab lukke · Kaubahall, 1. korrus · E–L 10–19 · tel 5544 3322.',
        points: ['Kes on Maie Lepp ja mida ta teeb?', 'Kus tema töökoht on?', 'Millal ta töötab?', 'Kuidas saab temaga ühendust?'],
        words: [25, 40], opening: 'Tere!', closing: '',
      }), { harno: 'W1' }),
      tag(B.speaking('035_t_say', 'Rääkimine 1. Pilt ja küsimused.', 'Kirjeldage pilti umbes üks minut. Siis vastake küsimustele oma ostude kohta.', ['Kes on pildil ja kus nad on?', 'Mida Siiri käes hoiab?', 'Kus te tavaliselt riideid ostate?', 'Mis oli teie viimane suur ost?', 'Kas te olete midagi poodi tagasi viinud?'], [60, 90]), { task: 'S06', harno: 'S1' }),
      tag(B.rolecards('035_t_roles', 'Rääkimine 2. Poes.', 'Üks on klient, teine müüja. Lahendage ostuprobleem.', 'Oled klient. Su uued saapad on liiga kitsad. Kviitung on olemas. Palu laiemaid või raha tagasi. Küsi hinda.', 'Oled müüja. Laiemad saapad on 10 eurot kallimad. Küsi kviitungit ja paku lahendust.', ['Saapad on liiga kitsad.', 'Kas teil on laiemaid?', 'Kas ma saan raha tagasi?'], ['Kas teil on kviitung?', 'Need on 10 eurot kallimad.', 'Kas soovite vahetada?']), { harno: 'S2' }),
      B.reading('035_t_reply', 'Lugemine. Poe vastus.', 'Lugege e-poe vastust ja vastake küsimustele.', 'Tere!',
        'Aitäh, et kirjutasite. Meil on väga kahju, et jope tasku on katki. Teil on kaks võimalust. Esiteks võite jope vahetada suurema vastu. Suurus L on laos olemas, see maksab sama palju. Teiseks võite jope tagastada ja saada raha tagasi. Tagastamine on tasuta. Pange jope karpi ja viige see lähimasse postkontorisse. Kviitungit ei ole vaja, sest teie tellimus on meie arvutis. Raha tuleb pangakontole viie päeva jooksul. Kui teil on küsimusi, helistage meile tööpäeviti kella üheksast viieni. Vabandame ja ootame teid jälle! E-pood Stiil',
        [['Mis on jopel valesti?', 'tasku on katki|tasku'], ['Mis suurus on laos olemas?', 'L|suurus L'], ['Kui palju maksab suurem jope?', 'sama palju|sama hinnaga'], ['Kuhu tuleb jope viia?', 'postkontorisse|lähimasse postkontorisse'], ['Miks ei ole kviitungit vaja?', 'tellimus on arvutis|sest tellimus on nende arvutis']]),
      B.rubric('035_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti. Kokku 70% = kontroll on sooritatud.', ['Tagastuse vorm ja visiitkaardi tekst on täidetud.', 'Kirjas on probleem, soov ja viisakas lõpp (40–60 sõna).', 'Numbrid, hinnad ja vormid on õiged (vähemalt 80%).', 'Suuline vastus on arusaadav ja kestab umbes minuti.', 'Poes lahendab õpilane probleemi ilma abita.']),
      B.selfcheck('035_t_self', ['Ma täidan tagastuse vormi.', 'Ma kirjutan poele 40–60 sõna.', 'Ma räägin oma ostudest umbes minuti.', 'Ma lahendan poes probleemi.'], 'Moodul 7 on läbitud'),
    ],
  },
};

// ---------------------------------------------------------------- the v6 lessons
const P031 = {
  goal: 'õppija ütleb poes, mida ta otsib (otsin sinist tassi, mul on vaja sooja salli), küsib värvi ja hinda ning valib kaaslasega kahe poe info põhjal kingituse 40 euro eest.',
  core: 'Mäletad? (3) → sõnad (4) → KÜLM ÜLESANNE „Proovi kohe: poes” ilma abita, õpetaja paneb kirja 3 märget (4) → kaubamaja infoleht (7) → Märka (4) → lüngad (5) → kaubamaja korrused pildi järgi paaris (6) → hääldusnurk: kotti / koti (5) → eksaminurk R2: kolm poodi (8) → kingitus kahe kaardiga, kumbki teab üht kaarti (9) → väljumine (2) → kodutöö ja enesekontroll (3).',
  short: 'Proovi kohe → infoleht → Märka → lüngad → korrused pildi järgi → kingitus kahe kaardiga → väljumine; eksaminurk ja hääldusnurk koju (Harjuta).',
  alt: 'kaartide asemel päris e-pood: paar vaatab telefonis kahte poodi (üks kummalgi), räägib, mis seal on ja mis see maksab, ja valib ühe kingituse 40 euro eest.',
  extra: 'mis on hea kingitus õppija kodumaal — kolm lauset: seal kingitakse …, mulle meeldib …, ma ei kingi ….',
  errors: ['„ma otsin sinine tass” → ma otsin sinist tassi (vene „ищу шарф” = nimetava kuju)', '„mul on vaja soe sall” → mul on vaja sooja salli', '„mul on sinist tassi” → mul on sinine tass (omamine + nimetav)', '„kaks sinist tassi” on õige — aga „ma otsin siniseid tasse” (mitmus)'],
};
const P032 = {
  goal: 'õppija ütleb hinna ja soodustuse arvu omastavaga (kümne euro eest, viie euroga, kahekümne protsendi soodustus, kuni kolmekümne euroni) ja seletab poe reklaamlehte lihtsas eesti keeles inimesele, kes seda ei loe.',
  core: 'Mäletad? (3) → sõnad (4) → kaubamaja raadio 2×, eksaminurk L3 (8) → Märka (4) → minu ostud paaris (5) → lüngad (5) → etteütlus ja varjutamine (6) → kuulutus: talvesaapad, kauplemine (7) → naaber küsib: reklaamleht pildilt (10) → väljumine (2) → kodutöö ja enesekontroll (3).',
  short: 'raadio → Märka → lüngad → naaber küsib → väljumine; etteütlus ja kauplemine koju (Harjuta).',
  alt: 'reklaamlehe asemel päris pood: õppija toob tundi ühe eestikeelse poe paberlehe või ekraanipildi ja seletab kaaslasele kolm pakkumist.',
  extra: 'kauplemine õppija kodumaal: kas turul kaubeldakse? Kolm lauset: seal saab … euro eest, ma ostsin … euroga.',
  errors: ['„kümme euro eest” → kümne euro eest (omastav)', '„viis euroga” → viie euroga', '„kaks euro” → kaks eurot (arv + osastav)', '„за два евро” → „eest kaks eurot” → kahe euro eest (eest on lõpus)'],
};
const P033 = {
  goal: 'õppija saab kuuldust aru, mis on odavam, soojem või parem, palub poes teist suurust (Kas teil on suuremat?) ja kirjutab rühma säästulehele 30–45-sõnalise hinnavõrdluse, millele kaaslane vastab.',
  core: 'Mäletad? (3) → sõnad (4) → kasutatud asjade pood 2× (8) → Märka (4) → võrdle paaris (5) → lüngad (5) → hääldusnurk: küsimus või väide (5) → proovikabiinis (5) → eksaminurk S1: kaks jopet pildil ja küsimused (7) → hinnavõrdlus, kaaslane vastab (9) → väljumine: üks lause uuesti (2) → kodutöö ja enesekontroll (3).',
  short: 'kuulamine → Märka → lüngad → eksaminurk S1 → hinnavõrdlus → väljumine; proovikabiin ja hääldusnurk Harjutasse.',
  alt: 'kirjaliku võrdluse asemel paarisarutelu: kaks õppijat võrdlevad kahte päris poodi oma linnas ja ütlevad koos, kumba nad soovitavad ja miks.',
  extra: 'õppija võrdleb hindu Eestis ja kodumaal — kolm lauset: … on Eestis kallim kui …, aga … on odavam.',
  errors: ['„odavam mis” (vene „чем”) → odavam kui', '„rohkem odav” → odavam', '„Kas teil on suurem?” → Kas teil on suuremat? (osastav)', '„hea → heam” → parem; „väike → väikem” → väiksem'],
};
const P034 = {
  goal: 'õppija loeb poe reegleid ja lugu, tagastab või vahetab katkise asja (kuni reedeni, kahe nädala jooksul, kviitungiga / ilma karbita) ja kirjutab ilma abita pildiloo oma ostust.',
  core: 'Mäletad? (3) → sõnad (4) → lugu „Uus veekeetja” (7) → Märka (4) → kas saab tagastada? paaris (5) → lüngad (5) → hääldusnurk: õ, ä, ö, ü (5) → infoletis VARJATUD INFOGA (6) → eksaminurk W1: visiitkaart (8) → plaan pildi järgi (3) → pildilugu (8) → väljumine: üks lause uuesti (2) → kodutöö ja enesekontroll (3).',
  short: 'lugu → Märka → lüngad → infoletis → plaan ja pildilugu → väljumine; visiitkaart ja hääldusnurk koju (Harjuta).',
  alt: 'pildiloo asemel päris kogemus: õppija jutustab ühe oma ostu loo (mis läks katki, mida poes öeldi) ja kaaslane küsib kaks küsimust; siis kirjutab ta loo.',
  extra: 'õppija vaatab ühe päris eestikeelse poe tagastamise tingimusi (kui kaua? kas kviitung on vaja?) ja ütleb kolm lauset.',
  errors: ['„kuni reede” → kuni reedeni', '„jooksul kaks nädalat” (vene „в течение”) → kahe nädala jooksul', '„ilma kviitung” → ilma kviitungita', '„ma tahan tagastama” → ma tahan tagastada'],
};
const P035 = {
  goal: 'kontroll 7: neli oskust 10 punkti, toorpunktid, Harno skaala ja lävendid; võrdlus kontrolliga 6.',
  core: 'kuidas punkte loetakse (2) → lugemine 1–2 (14) → kuulamine 1–2 (10) → kirjutamine (10) → rääkimine üks-ühele (5) → tulemus (4).',
  short: 'kui aega on 35 minutit: lugemine, kuulamine ja kirjutamine tunnis, rääkimine järgmise tunni alguses (5 min).',
  alt: 'rühmas: rääkimine paaris (üks müüja, teine ostja; siis vahetus), õpetaja hindab kahte õppijat korraga sama juhendi järgi.',
  extra: 'õppija vaatab oma kahte nõrgemat rida juhendis ja kirjutab, mida ta Harjutas kordab.',
  errors: ['kuulamisel kirjutatakse terve lause — piisab 1–2 sõnast', 'kirjutamisel puudub üks neljast punktist', 'rääkimisel „ma otsin sinine müts” → sinist mütsi'],
};

export const LESSONS = withShapes({
  // ---------------------------------------------------------------- 031 reading: what I am looking for (problem lesson)
  'a2-031': retire(OLD['a2-031'], {
    title: 'Mida te otsite?',
    canDo: 'Ma ütlen poes, mida ma otsin (sinist tassi), küsin hinda ja lepin kaaslasega kingituse kokku.',
    teacherPage: P031,
    discover: [
      teach(B.review('031_d_review', [['Mida sa ütled, kui arvel on viga?', 'a2-029'], ['Mis korrusel sa elad? Kas majas on lift?', 'a2-019'], 'Mida sa kingid sõbrale sünnipäevaks?']), planNote(P031)),
      tag(v6(B.vocab('031_d_vocab', 'Tunni sõnad.', ['kingitus — подарок', 'sünnipäev — день рождения', 'otsima — искать', 'vaja — нужно', 'värv — цвет', 'sinine — синий', 'soe — тёплый', 'sall — шарф', 'müts — шапка', 'osakond — отдел']),
        { review: ['korrus', 'kassa', 'odav'] }), { topic: ['vajama', 'kaubamaja', 'kinkekaart', 'villane', 'laualamp', 'teetass', 'pakkima', 'šokolaad', 'kodukaubad', 'laat', 'pangaautomaat'] }),
      teach(tag(B.speaking('031_d_cold', 'Proovi kohe: poes.', 'Küsi õpetajalt poes kingitust. Ilma abita.', [
        'Mida sa otsid? Kellele?',
        'Mis värvi see on? Mis see maksab?',
        'Kus see on? Kas seda saab pakkida?',
      ], [45, 60]), { task: 'S01', level: 3 }),
      'MOODULI KÜLM ÜLESANNE (2–3 min, enne lugemist ja reeglit): õpetaja on müüja, õpilane küsib ilma abita kingitust (nt emale); õpetaja ei aita ega paranda. Pane kirja kolm märget: kas omadussõna ja nimisõna on osastavas (otsin sinist tassi, sooja salli), kas õpilane küsib värvi ja hinda, kas ta on viisakas (tere, palun, aitäh). Kontrolli 7 rääkimise 1. osa on selle paralleel (teine kingitus, samad kriteeriumid) — võrdle.'),
      teach(tag(B.reading('031_d_shop', 'Kaubamaja infoleht.', 'Loe infolehte. Vasta ühe-kolme sõnaga.', 'Kaubamaja Täht: kingituste nädal',
        'Kas sa otsid sõbrale sünnipäevaks kingitust? Kaubamaja Täht aitab!\n\nEsimesel korrusel on toidukaubad: hea tee, kohv ja šokolaad. Teisel korrusel on riiete osakond. Seal on sooje salle, mütse ja kindaid. Hall villane sall maksab 15 eurot.\n\nKolmandal korrusel on kodukaubad: tassid, taldrikud ja lambid. Sinine teetass maksab 9 eurot, valge laualamp 25 eurot. Sel nädalal saab kaks tassi ühe hinnaga!\n\nKas sa ei tea, mida osta? Kassas on kinkekaardid: 10, 20 või 50 eurot. Kingitusi pakime tasuta, kassa on lifti kõrval. Odav ja ilus kingitus on ka lill: lillepood on maja ees. Kaubamaja on avatud iga päev kella üheksast üheksani.',
        [['Mis korrusel on riided?', 'teisel|teisel korrusel'], ['Kui palju maksab hall sall?', '15 eurot|viisteist eurot|15'], ['Mis on kolmandal korrusel?', 'kodukaubad|tassid ja lambid|tassid, taldrikud, lambid'], ['Mida saab sel nädalal ühe hinnaga?', 'kaks tassi|tassid'], ['Kus on kassa?', 'lifti kõrval'], ['Mis maksab 9 eurot?', 'sinine teetass|teetass|tass'], ['Mis kellani on kaubamaja avatud?', 'üheksani|kella üheksani|21-ni'], ['Mis on esimesel korrusel?', 'toidukaubad|tee, kohv, šokolaad|toit'], ['Kus on lillepood?', 'maja ees'], ['Mis värvi on laualamp?', 'valge']]), { task: 'R15' }),
      'Lugemisstrateegia (üks lause enne lugemist): „Silmitse kõigepealt: mis korrusel mis on?” Üks-ühele: õpilane joonib alla kõik asjad koos omadussõnaga (hea tee, hall villane sall, sinine teetass, valge laualamp) — Märka-kastis teeb ta neist osastava. Vanad sõnad: korrus, kassa, odav.'),
      B.notice('031_d_notice', 'Märka: ma otsin sinist tassi', [
        'Mida? otsima, vajama + osastav: ma otsin **sinist tassi**, **sooja salli**',
        'Mul on vaja **halli mütsi**, **valget lampi**, **head teed**',
        'Mitu: ma otsin **sooje kindaid**, **siniseid tasse**',
        'Aga: mul on **sinine tass**, see on **soe sall** (nimetav)',
        'Küsi: Mis värvi? Mis see maksab? Kas teil on …?',
        'Vene keeles „ищу шарф” (nagu nimetav) — eesti keeles ma otsin salli (osastav).',
      ], 'half'),
    ],
    practice: [
      half(tag(B.gaps('031_p_gaps', 'Mida nad otsivad?', 'Kirjuta sõnad õiges vormis.', [
        'Ma otsin emale [sinist] [tassi]. (sinine tass)',
        'Talvel on mul vaja [sooja] [salli]. (soe sall)',
        'Isa vajab [halli] [mütsi]. (hall müts)',
        'Kas teil on [valget] [lampi]? (valge lamp)',
        'Vanaema tahab [head] [teed]. (hea tee)',
        'Lapsed otsivad [sooje] [kindaid]. (soojad kindad)',
        'Mul on juba [sinine] [tass]. (Ma otsin sinist tassi.)',
        'See [soe] [sall] on ilus. (Ma vajan sooja salli.)',
      ], '', 'half'), { task: 'G03' })),
      half(teach(tag(B.rolecards('031_p_floors', 'Proovi: kes mida otsib?', 'Vaata pilti. Ütle, mida klient otsib ja mis korrusel.',
        'Sina räägid klientidest 1 ja 2. Ütle iga kliendi kohta kaks lauset: Klient … otsib … See on … korrusel. Siis küsi B-lt: mida otsib klient 3?',
        'Kuula A-d ja kontrolli pildilt korrust. Siis räägi sina kliendist 3: mida ta otsib ja mis korrusel see on? Lõpuks ütle: mida sina seal otsid?',
        [], []), { task: 'S05', level: 3, fluency: true }),
      'Üks-ühele: õpilane räägib klientidest 1 ja 2, õpetaja kontrollib korrust; siis räägib õpilane kliendist 3. Pildil on asjad algvormis (sall — soe, hall), nii et õpilane teeb ise osastava: 1 = Ta otsib sooja halli salli. See on teisel korrusel. 2 = Ta otsib kahte sinist tassi. Need on kolmandal korrusel. 3 = Ta vajab valget lampi ja head teed: lamp on kolmandal, tee esimesel korrusel. Paranda ainult osastavat.')),
      teach(tag(v6(B.choice('031_p_pron', 'Hääldusnurk: kotti või koti?', 'Kuula sõna ja vali. Siis räägi lause kaasa.', [
        ['Sõna 1', 'kotti', 'koti'],
        ['Sõna 2', 'lambi', 'lampi'],
        ['Sõna 3', 'kappi', 'kapi'],
        ['Sõna 4', 'poti', 'potti'],
      ], 'half', 'g_listen'), { pronunciation: 'välted' }), { task: 'G13' }),
      'Hääldusnurk, 5 min. Ütle igast reast võtmes oleva sõna (kotti, lambi, kappi, poti); õpilane valib. Selgita: osastav on pikk ja tugev (Ma otsin kotti, lampi, kappi, potti), omastav lühike (koti hind, lambi värv). Siis varjutamine: loe „Ma otsin sooja salli ja sinist tassi.”, õpilane räägib kohe kaasa, kaks korda. Vene keelt kõnelejal: topelttäht on päriselt pikem, mitte ainult tugevam.'),
      teach(tag(B.adsmatch('031_p_shops', 'Eksaminurk: kolm poodi.', 'Loe kolme teksti. Kirjuta lause juurde A, B või C.', [
        ['A. Kaubamaja Täht, 3. korrus', 'Sel nädalal on kõik tassid 20 % odavamad. Kingitused pakime tasuta. Kui kaup ei sobi, saab selle vahetada kahe nädala jooksul.'],
        ['B. Pood „Uus Elu”', 'Meil on vanad, aga ilusad asjad: joped, tassid ja raamatud. Maksta saab ainult kaardiga. Kaupa tagasi tuua ei saa.'],
        ['C. Laat kooli hoovis', 'Laupäeval kella kümnest kaheni on kooli hoovis laat: villased sokid, sallid ja mesi. Müüjad võtavad ainult sularaha.'],
      ], [
        ['Siin saab kingituse tasuta pakkida.', 'A'],
        ['Siin on vanad ja kasutatud asjad.', 'B'],
        ['Siin on vaja sularaha.', 'C'],
        ['Siin saab villaseid asju osta ainult ühel päeval.', 'C'],
        ['Siin ei saa ostu tagasi tuua.', 'B'],
        ['Siin saab tassi vahetada, kui see ei sobi.', 'A'],
        ['Siin saab maksta ainult kaardiga.', 'B'],
        ['Siin on tass praegu odavam.', 'A'],
      ]), { harno: 'R2', level: 3 }),
      'Eksaminurk nagu Harno A2 lugemise 2. osas (lause ↔ kolm lühikest teksti), 8 min, ilma abita. Siis kontroll: miks just see tekst? Õpilane ütleb tekstist ühe sõna, mis aitas (tasuta, kasutatud, sularaha …).'),
    ],
    transfer: [
      B.text('031_t_sit', 'Olukord: kingitus kaaslasele', 'Kaaslasel on järgmisel nädalal sünnipäev. Rühm kogus 40 eurot. A käis kaubamajas, B laadal kooli hoovis. Kumbki teab ainult oma kaarti. Kaaslane joob palju teed ja tal on alati külm.'),
      teach(tag(v6(B.rolecards('031_t_jigsaw', 'Kingitus kahe kaardiga.', 'Räägi oma kaardist. Siis valige koos kingitus.',
        'Kaubamaja Täht: sinine teetass ja pakk head teed — 14 €, hall villane sall — 15 €, valge laualamp — 25 €. Pakkimine on tasuta.',
        'Laat kooli hoovis: soojad villased sokid — 8 €, punane müts ja kindad — 18 €, purk mett — 6 €. Maksta saab ainult sularahas.',
        [], []), {
        taskType: 'jigsaw', realAddressee: 'rühma kaaslane (sünnipäevakingitus)',
        support: ['Kaubamajas / laadal on … See maksab … eurot.', 'Me võime osta … ja …, kokku … eurot.', 'Ma arvan, et … on hea, sest kaaslane …'],
        stretch: 'Raha on ainult 30 eurot: muutke valikut ja öelge, miks.',
      }), { task: 'S03', main: true, level: 4 }),
      'Kahe kaardi töö: A näeb ainult kaubamaja kaarti, B ainult laada kaarti — teineteise kaarti ei vaata. Kumbki räägib oma kaardist (mis seal on, mis värvi, mis maksab), siis valivad nad koos kingituse kuni 40 euroni. Võimalik: teetass ja tee 14 + sokid 8 + mesi 6 = 28 € või sall 15 + müts ja kindad 18 = 33 €. Üks-ühele: õpetaja on B ja tahab alguses kõige kallimat (lamp + müts ja kindad = 43 €); õpilane põhjendab hinna ja kaaslase sooviga. Abikaart: kolm lausealgust (märgi kasutamine). Lisaväljakutse: 30 eurot.'),
      homeTask(teach(v6(tag(B.speaking('031_t_home', 'Kodus: häälsõnum rühmale.', 'Salvesta rühmale 45 sekundit: mis kingitus ja miks. Siis Harjuta → moodul 7.', [
        'Mida te ostate, mis see maksab ja miks see sobib?',
      ], [45, 60]), { task: 'S15' }), { realAddressee: 'rühma vestlus (häälsõnum)' }),
      'Kodutöö: häälsõnum rühma vestlusesse (45–60 s), ilma kaarti vaatamata: mida te ostate, mis värvi, mis see maksab ja miks see sobib. Harjuta → moodul 7: sõnad ja osastav (10 min). Järgmise tunni „Mäletad?” küsib seda.')),
      half(exitCheck(tag(B.speaking('031_t_exit', 'Väljumine: meie kingitus.', 'Ütle 30 sekundiga: mida te ostate ja miks?', [
        'Mida te ostate, mis see maksab ja miks?',
      ], [30, 45]), { task: 'S16', level: 3, fluency: true }))),
      half(teach(selfcheck('031_t_self', ['Ütlen: otsin sinist tassi.', 'Küsin värvi ja hinda.', 'Valime kingituse 40 € eest.'], 'Tund 31 on läbitud'), 'Üks-ühele: õpilane hindab kolme rida; õpetaja ütleb, kas „kaaslane” sai kõigest aru. Õpilane kirjutab ühe oma lause (Ma otsin …) tõendiks.')),
    ],
  }),

  // ---------------------------------------------------------------- 032 listening: prices in the genitive
  'a2-032': retire(OLD['a2-032'], {
    title: 'Kahe euro eest',
    canDo: 'Ma saan kuuldust aru poe teadaandest, ütlen hinna (kümne euro eest) ja räägin naabrile, mida reklaamleht pakub.',
    teacherPage: P032,
    discover: [
      teach(B.review('032_d_review', [['Mida sa otsid poest? Ütle värviga.', 'a2-031'], ['Mis kell on sinu lähim pood lahti?', 'a2-024'], 'Mis on sinu poes odav ja mis on kallis?']), planNote(P032)),
      tag(v6(B.vocab('032_d_vocab', 'Tunni sõnad.', ['hind — цена', 'soodustus — скидка', 'protsent — процент', 'eest — за', 'raha — деньги', 'sularaha — наличные', 'rahakott — кошелёк', 'paar — пара', 'müüja — продавец', 'ostja — покупатель']),
        { review: ['kokku', 'järjekord', 'kilo'] }), { topic: ['soodustus', 'sularaha', 'pakkumine', 'kliendikaart', 'kliendikaardiga', 'müüma', 'talvemüts', 'mänguasi', 'mänguasjad', 'sooduspäev', 'kaubamaja', 'ostlemine', 'naaber', 'talvesaapad', 'reklaamleht', 'kauplema'] }),
      twice(teach(tag(B.listening('032_d_radio', 'Eksaminurk: teadaanne kaubamajas.', 'Kuula teadet kaks korda. Kirjuta lünka üks-kaks sõna.', [
        'Diktor: Head kliendid! Tere tulemast kaubamajja Pihlakas!',
        'Diktor: Täna on meil suur sooduspäev.',
        'Diktor: Kõik talvemütsid ja sallid saate täna kümne euro eest.',
        'Diktor: Teisel korrusel saate kaks paari sokke viie euro eest.',
        'Diktor: Kliendikaardiga on kohvil kahekümne protsendi soodustus.',
        'Diktor: Esimesel korrusel on värsked õunad: kilo maksab ainult üks euro.',
        'Diktor: Kui ostate kokku üle kolmekümne euro, saate kohvikus tasuta tassi teed.',
        'Diktor: Lastele on kolmandal korrusel mänguasjad kuni viieteistkümne euroni.',
        'Diktor: Kliendikaardi saate kassast tasuta. Kingitusi pakime ka tasuta.',
        'Diktor: Täna on avatud kuus kassat, nii et järjekorda ei ole.',
        'Diktor: Kaubamaja on täna avatud kella üheksast kümneni. Head ostlemist!',
      ], ['Talvemütsid saab täna [kümne] euro eest.', 'Kohvil on [kahekümne|20] protsendi soodustus.', 'Kilo õunu maksab [üks] euro.', 'Tasuta tee saad, kui ostad üle [kolmekümne|30] euro.', 'Mänguasjad on [kolmandal] korrusel.', 'Kaubamaja on lahti kella [kümneni|22-ni].'], 'g_listen'), { harno: 'L3', task: 'L03' }),
      'Eksaminurk nagu Harno A2 kuulamise 3. osas (lühivastused). Kuulamisstrateegia: „Ennusta: mis numbrid tulevad? Loe laused enne läbi.” Esimesel korral kirjutab õpilane ainult numbrid, teisel korral sõna õiges vormis (kümne euro eest, aga viis eurot). Vanad sõnad: kokku, järjekord, kilo.')),
      B.notice('032_d_notice', 'Märka: kahe euro eest', [
        'Kui palju? **kaks eurot** (osastav)',
        'Mille eest? **kümne euro eest**',
        'Mis hinnaga? **viie euroga**',
        '**kahekümne protsendi** soodustus, kuni **kolmekümne euroni**',
        'kaks → **kahe**, neli → **nelja**, viis → **viie**',
        'Vene keeles „за два евро” — eesti keeles kahe euro eest.',
      ], 'half'),
      half(teach(tag(B.speaking('032_d_mine', 'Proovi kohe: minu ostud.', 'Küsi paariliselt. Vasta alati hinnaga.', [
        'Mille eest sa ostsid telefoni?',
        'Mis hinnaga sa ostad leiba?',
        'Mis maksab kuni kahe euroni?',
      ], [45, 60]), { task: 'S09', level: 3, fluency: true }),
      'Juhendatud kasutus kohe pärast Märka-kasti: üks-ühele küsib õpilane õpetajalt ja vastab ise. Õpetaja kuulab ainult arvu omastavat (kahesaja euro eest, kahe euroga, kuni kahe euroni) ja kordab õiget vormi, kui see on vale.')),
    ],
    practice: [
      half(tag(B.gaps('032_p_gaps', 'Mille eest?', 'Kirjuta arv või sõna õiges vormis.', [
        'Ma ostsin mütsi [kümne] euro eest. (10)',
        'Sokid sain [viie] euroga. (5)',
        'Leiva sain [kahe] euroga. (2)',
        'Kaks kohvi [nelja] euro eest, palun. (4)',
        'Kliendikaardiga on [kahekümne] protsendi soodustus. (20)',
        'Kingitus võib maksta kuni [kolmekümne] euroni. (30)',
        'Kassas maksin kolm [eurot]. (3 €)',
        'Turg on lahti [kaheksast] [kolmeni]. (8–15)',
      ], '', 'half'), { task: 'G08' })),
      teach(half(v6(tag(B.dictation('032_p_dict', 'Etteütlus ja varjutamine: hinnad.', 'Kuula lauset, korda valjusti ja kirjuta.', [
        'Müts maksab kümme eurot.',
        'Ma ostsin sokid viie euro eest.',
        'Kliendikaardiga on kümne protsendi soodustus.',
        'Pood on lahti kaheksast kuueni.',
        'Kingitus maksab kuni kahekümne euroni.',
      ], 5), { task: 'L08' }), { pronunciation: 'varjutamine' })),
      'Hääldusnurk + etteütlus, 6 min. Enne: varjutamine — loe raadiost kaks lauset („Kõik talvemütsid ja sallid saate täna kümne euro eest.”, „Kaubamaja on täna avatud kella üheksast kümneni.”), õpilane räägib kohe kaasa, kaks korda. Märka paari kümme – kümne: mm on pikk, m lühike. Siis loe iga etteütluse lause kaks korda; õpilane kordab valjusti ja kirjutab. Kontrolli: kümme (kaks m), kümne (üks m), viie, kahekümne.'),
      teach(tag(B.phoneCards('032_p_boots', 'Kuulutus: talvesaapad.', 'A helistab kuulutuse peale, B müüb. Leppige hind kokku.',
        'Kuulutus: kasutatud talvesaapad, suurus 38, mustad, hind 40 €, telefon 5566 7788.',
        ['Ostja', ['Kas saapad on veel müügil?', 'Mis värvi need on?', 'Kas ma saan need kolmekümne euro eest?', 'Millal ma saan neid proovida?']],
        ['Müüja', ['Saapad on mustad ja peaaegu uued.', 'Alla kolmekümne viie euro ma ei anna.', 'Proovida saab homme kella viiest seitsmeni.', 'Aadress on Akadeemia tee 22.']], [60, 120]), { task: 'S04', fluency: true }),
      'Üks-ühele: õpetaja on müüja ja ei anna kohe järele. Õpilane helistab, küsib ja kaupleb: „Kas ma saan need kolmekümne euro eest?” Teine kõne kohe pärast seda, kiiremini: õpetaja on teine müüja (saapad maksavad 45 €, alla neljakümne ei anna). Paranda ainult arvu vormi (kolmekümne viie euro eest).'),
    ],
    transfer: [
      B.text('032_t_sit', 'Olukord: naaber küsib', 'Sinu naaber Galina on Eestis uus. Ta ei loe veel eesti keelt. Postkastis on poe reklaamleht (vaata pilti). Galina helistab sulle ja küsib: mis on odav, mis see maksab ja millal pood on lahti? Seleta lihtsalt eesti keeles. Kõike ei pea ütlema: ütle ainult seda, mida Galina vajab.'),
      teach(tag(v6(B.rolecards('032_t_flyer', 'Naaber küsib: reklaamleht.', 'Vaata pilti. A seletab, B küsib. Siis vahetage.',
        'Sina näed reklaamlehte (pilt). Galina küsib. Vasta lühidalt ja lihtsalt: mis maksab kui palju, mille eest ja millal pood on lahti. Lõpus ütle, mida sina ostad.',
        'Sa oled Galina. Sa tahad osta piima, leiba, kohvi ja talvemütsi. Raha on 20 eurot. Küsi: mis on odav? Kas kilo õunu on tasuta? Mis kell pood lahti on? Kui sa ei saa aru, küsi uuesti.',
        [], []), {
        taskType: 'mediation', realAddressee: 'naaber, kes eesti keelt ei loe',
        support: ['Seal on … kümne protsendi soodustus.', 'Kaks … saab … euro eest.', 'Pood on lahti …st …ni.'],
        stretch: 'Galina tahab ka kingitust lapsele: leia lehelt üks kuni kümne euroni ja seleta.',
      }), { task: 'S13', main: true, level: 4 }),
      'Vahendus: õppija ei loe lehte ette, vaid valib Galinale vajaliku (piim, leib, kohv, müts) ja ütleb selle lihtsalt. Võti pildi järgi: piim 2 tk 2 € (kaks pakki kahe euro eest), leib 1,50 €, kohv 6 € ja kliendikaardiga 10 % odavam, talvemütsid kõik kümne euro eest, üle 20 euro ostuga kilo õunu tasuta; E–R 8–20, L 9–16, P suletud. Galina 20 eurost: 2 + 1,50 + 6 + 10 = 19,50 € — õunu tasuta ei saa. Üks-ühele: õpetaja on Galina ja küsib uuesti, kui õppija loeb lehte sõna-sõnalt. Abikaart: kolm lausealgust (märgi kasutamine). Lisaväljakutse: mänguasi kuni kümne euroni.'),
      homeTask(teach(v6(tag(B.examWriting('032_t_home', 'Kodus: minu eesti keele võrgustik.', 'Vaata üht päris poe pakkumisi. Kirjuta 25–40 sõna. Harjuta → moodul 7.', 'teade', {
        situation: 'Vaata üht päris eestikeelset poe pakkumiste lehte, nt „Selver: pakkumised” (https://www.selver.ee) või oma poe reklaamlehte. Kirjuta oma meediapäevikusse.',
        points: ['mis lehte sa vaatasid', 'üks uus sõna sellelt lehelt', 'mis oli odav ja mille eest', 'kas sa ostad seda ja miks'],
        words: [25, 40],
      }), { task: 'W12' }), { mediaLog: true }),
      'Meediapäevik „Minu eesti keele võrgustik” (mooduli kirje): õppija avab ise ühe päris eestikeelse poe lehe (lehte sisse ei kopeerita) ja kirjutab neli punkti, ühe hinna omastavaga (… euro eest). Järgmisel tunnil loeb ta oma uue sõna ette. Harjuta → moodul 7: arvud ja hinnad (10 min).')),
      half(exitCheck(tag(B.speaking('032_t_exit', 'Väljumine: nädala pakkumine.', 'Ütle 30 sekundiga: mis on sel nädalal odav?', [
        'Mida saab osta ja mille eest?',
        'Millal pood on lahti?',
      ], [30, 45]), { task: 'S16', level: 3, fluency: true }))),
      half(teach(selfcheck('032_t_self', ['Ütlen: kümne euro eest.', 'Saan teadaandest aru.', 'Naaber saab minust aru.'], 'Tund 32 on läbitud'), 'Üks-ühele: õpetaja ütleb, kas „Galina” sai kõigest aru; õpilane hindab kolme rida ja kirjutab ühe hinna lause (… euro eest) tõendiks.')),
    ],
  }),

  // ---------------------------------------------------------------- 033 listening: the comparative at a second-hand shop
  'a2-033': retire(OLD['a2-033'], {
    title: 'Kas teil on suuremat?',
    canDo: 'Ma saan kuuldust aru, mis on odavam või parem, küsin suuremat ja kirjutan lühikese hinnavõrdluse.',
    teacherPage: P033,
    discover: [
      teach(B.review('033_d_review', [['Mille eest sa ostsid oma mütsi või jope? Umbes.', 'a2-032'], ['Kas sa lähed poodi jalgsi või bussiga?', 'a2-022'], 'Kas sa ostad vahel kasutatud asju?']), planNote(P033)),
      tag(v6(B.vocab('033_d_vocab', 'Tunni sõnad.', ['jope — куртка', 'kampsun — свитер', 'suurus — размер', 'proovima — примерять', 'sobima — подходить', 'kasutatud — подержанный', 'kerge — лёгкий', 'paks — толстый', 'kitsas — узкий', 'parem — лучше']),
        { review: ['kallis', 'otsas', 'turg'] }), { topic: ['talvejope', 'proovikabiin', 'säästuleht', 'peaaegu', 'villane', 'puuvillane', 'odavam', 'soojem', 'kallim', 'suurem', 'väiksem', 'pikem', 'kergem', 'paksem'] }),
      twice(teach(tag(B.listening('033_d_shop', 'Kasutatud asjade poes.', 'Kuula kaks korda. Kirjuta lünka üks-kaks sõna: mis on erinev?', [
        'Kristel: Tere! Kas ma saan aidata?',
        'Igor: Tere! Ma otsin sooja talvejopet. Uus jope on poes väga kallis.',
        'Kristel: Meil on kaks head jopet. Hall maksab kakskümmend viis eurot, must maksab nelikümmend.',
        'Igor: Miks must on kallim?',
        'Kristel: Must on peaaegu uus ja soojem. Hall on vanem, aga väga kerge.',
        'Igor: Ma proovin musta. Hm, see on mulle väike. Kas teil on suuremat?',
        'Kristel: Kahjuks suuremad mustad joped on otsas. Aga hall on suurus L.',
        'Igor: Hall sobib hästi! Aga kas see on talvel soe?',
        'Kristel: Paksu kampsuniga küll. Turul on kampsunid odavamad kui siin.',
        'Igor: Hea mõte. Ma võtan halli jope. Kas ma saan maksta kaardiga?',
        'Kristel: Jah, muidugi. Aitäh ja ilusat päeva!',
      ], ['Igor otsib sooja [talvejopet|jopet].', 'Hall jope maksab [kakskümmend viis|25] eurot.', 'Must jope on peaaegu uus ja [soojem].', 'Must jope on Igorile [väike|liiga väike].', 'Hall jope on suurus [L].', 'Turul on kampsunid [odavamad].', 'Igor maksab [kaardiga].'], 'g_listen'), { task: 'L04' }),
      'Kuulamisstrateegia (enne esimest kuulamist): „Loe laused läbi ja jooni alla võrdlussõnad: kallim, soojem, odavamad.” Esimesel korral märgib õpilane ainult kindlad vastused, teisel korral ülejäänud. Vanad sõnad: kallis, otsas, turg.')),
      B.notice('033_d_notice', 'Märka: odavam kui …', [
        'odav → **odavam**, soe → **soojem**, kallis → **kallim**',
        'suur → **suurem**, väike → **väiksem**, pikk → **pikem**, hea → **parem**',
        'Hall jope on odavam **kui** must.',
        'Poes: Kas teil on **suuremat**? **väiksemat**? (osastav)',
        'Vene keeles „дешевле, чем” — eesti keeles odavam kui (mitte „odavam mis”).',
      ], 'half'),
      half(teach(tag(B.speaking('033_d_compare', 'Proovi: kumb on parem?', 'Võrdle paarilisega. Ütle ka, miks.', [
        'Kumb on odavam: turg või pood?',
        'Kumb on soojem: jope või mantel?',
        'Kumb on sulle parem: uus või kasutatud?',
      ], [45, 60]), { task: 'S02', level: 3, fluency: true }),
      'Juhendatud kasutus kohe pärast Märka-kasti: õpilane vastab täislausega ja põhjendab (… on odavam kui …, sest …); siis küsib ta sama õpetajalt. Paranda ainult keskvõrret ja sõna „kui”.')),
    ],
    practice: [
      half(tag(B.gaps('033_p_gaps', 'Võrdle.', 'Kirjuta omadussõna keskvõrdes.', [
        'Hall jope on [odavam] kui must. (odav)',
        'Villane sall on [soojem] kui õhuke sall. (soe)',
        'Must kott on [kallim] kui pruun. (kallis)',
        'See jope on mulle väike. Kas teil on [suuremat]? (suur)',
        'Need kingad on suured. Kas teil on [väiksemat] suurust? (väike)',
        'Kasutatud jope on hea, aga uus on [parem]. (hea)',
        'Tom on pikk, aga Igor on veel [pikem]. (pikk)',
        'Turul on õunad [odavamad] kui poes. (odav)',
      ], '', 'half'), { task: 'G05' })),
      teach(tag(v6(B.choice('033_p_pron', 'Hääldusnurk: küsimus või väide?', 'Kuula õpetajat. Vali: küsimus või väide. Siis korda.', [
        ['Lause 1', 'küsimus', 'väide'],
        ['Lause 2', 'väide', 'küsimus'],
        ['Lause 3', 'küsimus', 'väide'],
      ], 'half', 'g_listen'), { pronunciation: 'intonatsioon' }), { task: 'G13' }),
      'Hääldusnurk, 5 min. Loe: 1 „Kas teil on suuremat?” 2 „Hall on parem.” 3 „Kumb on odavam?” Siis ütle ise üks lause („Must on kallim.” või „Kas must on kallim?”), õpilane arvab. Õpilane valib, siis kordab iga lause kaks korda (varjutamine). Eesti küsimus Kas …? ja Kumb …? läheb lõpus alla — küsimuse teeb sõna kas / kumb, mitte hääl üles nagu vene keeles. Rõhk on sõna esimesel silbil (odavam, soojem), mitte lõpus.'),
      teach(tag(B.rolecards('033_p_fitting', 'Proovikabiinis.', 'A ostab, B müüb. Siis vahetage.',
        'Sa otsid sooja jopet kuni 40 euroni. Proovi kahte jopet: hall ja must. Must on väike: küsi suuremat. Küsi hinda ja vali.',
        'Sa oled müüja. Hall jope: 25 €, suurus L, kerge. Must jope: 40 €, suurus M, soe. Suuremat musta ei ole. Ütle, kumb on soojem ja kumb odavam.',
        ['Kas ma võin seda proovida?', 'Kas teil on suuremat?'], ['Hall on odavam kui must.', 'See sobib teile.']), { task: 'S12', fluency: true }),
      'Üks-ühele: õpetaja on müüja; õpilane proovib, küsib suuremat ja valib 40 euro eest. Teisel korral kiiremini; siis vahetage.'),
    ],
    transfer: [
      teach(tag(B.speaking('033_p_picture', 'Eksaminurk: pilt ja küsimused.', 'Kirjelda pilti umbes üks minut. Siis vasta küsimustele.', [
        'Kes on pildil ja kus nad on?',
        'Mis jopesid nad vaatavad? Mis on erinev?',
        'Kumb jope on sinu arvates parem? Miks?',
        'Kus sina tavaliselt riideid ostad?',
        'Kas sa ostad kasutatud asju? Miks?',
      ], [60, 75]), { harno: 'S1', task: 'S06' }),
      'Eksaminurk nagu Harno A2 rääkimise 1. osas: õpilane kirjeldab pilti umbes minuti, õpetaja ei sega; siis küsib õpetaja teemaküsimused (riided, pood, raha). Kokku 6–7 minutit, hinda nagu eksamil. Pildil: hall jope 25 €, L, kerge; must jope 40 €, M, soe, peaaegu uus.'),
      teach(tag(v6(B.examWriting('033_t_report', 'Säästuleht: minu võrdlus.', 'Võrdle kahte poodi või asja. Kirjuta 30–45 sõna.', 'teade', {
        situation: 'Rühma „Säästuleht” seinal: kus on odavam ja parem osta? Kaaslane loeb ja küsib ühe küsimuse.',
        points: ['mida sa võrdled', 'mis on odavam (hinnaga)', 'mis on parem ja miks', 'mida sa soovitad'],
        words: [30, 45],
      }), {
        lines: 5, taskType: 'report', peerReply: true, realAddressee: 'rühma kaaslased (säästuleht seinal)',
        support: ['… on odavam kui …', '… on parem, sest …', 'Ma soovitan …'],
        stretch: 'Lisa üks number: kui palju odavam see on (nt viis eurot).',
      }), { task: 'W05', main: true, level: 4 }),
      'Kirjutamine tunnis, 8 min. Siis kaaslase vastus (mooduli kaaslase vahetus): lehed liiguvad paremale, kaaslane loeb ja kirjutab alla ühe küsimuse või „kaks tärni ja üks soov” (kas kõik neli punkti on olemas? kas võrdlus on … kui …?). Üks-ühele: õpetaja on kaaslane ja küsib ühe küsimuse. Abikaart: kolm lausealgust (märgi kasutamine). Lisaväljakutse: number.'),
      homeTask(teach(tag(B.speaking('033_t_home', 'Kodus: soovita poodi.', 'Salvesta 45 sekundit: kumb pood on parem? Siis Harjuta → moodul 7.', [
        'Kumb pood on odavam ja parem? Miks? Mida sa seal ostad?',
      ], [45, 60]), { task: 'S15' }),
      'Kodune salvestus: säästulehe võrdlus suuliselt, ilma lehte vaatamata. Tunnis kuulab õpetaja salvestuse ja küsib ühe küsimuse. Harjuta → moodul 7: keskvõrre (10 min).')),
      half(exitCheck(tag(v6(B.writing('033_t_exit', 'Väljumine: parem lause.', 'Kirjuta üks lause võrdlusest uuesti, kaaslase küsimuse järgi.', [1, 2]), { lines: 2 }), { task: 'W10', level: 3 }))),
      half(teach(selfcheck('033_t_self', ['Saan aru: odavam, soojem.', 'Võrdlen: … odavam kui …', 'Kaaslane saab aru.'], 'Tund 33 on läbitud'), 'Üks-ühele: õpilane hindab kolme rida; õpetaja ütleb, kas tema kui kaaslane leidis kõik neli punkti. Õpilane kirjutab ühe võrdluse lause tõendiks.')),
    ],
  }),

  // ---------------------------------------------------------------- 034 reading: the return (the module's last teaching lesson)
  'a2-034': retire(OLD['a2-034'], {
    title: 'Kviitung on alles',
    canDo: 'Ma loen poe reegleid, vahetan katkise asja ja kirjutan loo oma ostust.',
    teacherPage: P034,
    discover: [
      teach(B.review('034_d_review', [['Kumb on parem: pood või turg?', 'a2-033'], ['Mis kell on sinu pood lahti?', 'a2-024'], 'Mis läks sul viimati katki?']), planNote(P034)),
      tag(v6(B.vocab('034_d_vocab', 'Tunni sõnad.', ['kviitung — чек', 'tagastama — возвращать (товар)', 'vahetama — обменивать', 'katki — сломан', 'garantii — гарантия', 'jooksul — в течение', 'karp — коробка', 'veekeetja — чайник', 'tagasi — обратно', 'parandama — чинить'], '3'),
        { review: ['kassa', 'kesklinn', 'lahti'] }), { topic: ['kviitung', 'tagastama', 'kehtima', 'veekeetja', 'infolett', 'infoletti', 'infoletis', 'kodulehte', 'parandustöökoda', 'laualamp', 'lukk'] }),
      teach(tag(B.reading('034_d_story', 'Loe lugu.', 'Loe lugu. Vasta ühe-kolme sõnaga.', 'Uus veekeetja',
        'Marta ostis novembri lõpus kesklinna kaubamajast uue veekeetja. See maksis 29 eurot. Kassas ütles müüja: „Hoidke kviitung alles! Veekeetjal on kahe aasta garantii.” Marta pani kviitungi rahakotti. Kümme päeva hiljem veekeetja enam ei töötanud.\n\nPoe kodulehel oli kirjas: „Kaupa saab tagastada 14 päeva jooksul. Tagastamiseks on vaja kviitungit.” Laupäeval läks Marta kaubamaja infoletti, see on lahti kella kümnest. Kaasas oli veekeetja, karp ja kviitung. Müüja ütles: „Vabandust! Saate uue veekeetja.” Pakkumine kehtis kuni pühapäevani: Marta sai ka tasuta paki head teed.',
        [['Kui pikk on garantii?', 'kaks aastat|kahe aasta|2 aastat'], ['Kus oli kviitung?', 'rahakotis'], ['Mitme päeva jooksul saab kaupa tagastada?', '14|14 päeva jooksul|neljateistkümne päeva jooksul'], ['Mida Marta võttis infoletti kaasa?', 'veekeetja, karbi, kviitungi|kviitungi ja karbi|kviitungi'], ['Mida sai tasuta kuni pühapäevani?', 'paki teed|pakk teed|teed']]), { task: 'R13' }),
      'Lugemisstrateegia (üks lause enne lugemist): „Silmitse: mis juhtus? Siis otsi aega ja tingimust: mitme päeva jooksul? kuni millal?” Üks-ühele: õpilane joonib alla kõik ajasõnad (kahe aasta, 14 päeva jooksul, kuni pühapäevani) — need on reegli näited. Vanad sõnad: kassa, kesklinn, lahti.'),
      B.notice('034_d_notice', 'Märka: kuni reedeni, kahe nädala jooksul', [
        'Mis ajani? kuni **reedeni**, kuni **pühapäevani**',
        'Kui kaua? **kahe nädala jooksul**, **kahe aasta** garantii',
        '**kviitungiga**, ilma **karbita** · **tagastada**, **vahetada**',
        'Vene keeles „в течение недели” — eesti keeles nädala jooksul.',
      ], 'half'),
      half(teach(tag(B.speaking('034_d_try', 'Proovi: kas saab tagastada?', 'Loe olukorda. Ütle, mida klient saab teha ja miks.', [
        'Kampsun on väike: 5 päeva, kviitung on.',
        'Lamp ei põle: 3 kuud, garantii 2 aastat.',
        'Kingad on kitsad: 20 päeva, kviitungit pole.',
      ], [45, 60]), { task: 'S11', level: 3 }),
      'Juhendatud kasutus, ilma valmis fraasideta (mooduli viimane tund): õpilane ütleb poe reegli järgi (tagastada 14 päeva jooksul, vahetada garantii ajal, kviitungiga). Võti: 1 = saab tagastada või vahetada, sest 14 päeva ei ole läbi ja kviitung on; 2 = saab vahetada või parandada, sest garantii on kahe aasta jooksul; 3 = tagastada ei saa, sest 14 päeva on läbi ja kviitungit ei ole. Kui õpilane ütleb ainult „saab / ei saa”, küsi: „Miks?”')),
    ],
    practice: [
      tag(B.gaps('034_p_gaps', 'Mis ajani? Millega?', 'Kirjuta aeg või sõna õiges vormis.', [
        'Pakkumine kehtib kuni [reedeni]. (reede)',
        'Pood on lahti kuni [pühapäevani]. (pühapäev)',
        'Kaupa saab tagastada kahe [nädala] [jooksul]. (kaks nädalat)',
        'Lambil on kahe [aasta] garantii. (kaks aastat)',
        'Raha saab tagasi ainult [kviitungiga]. (kviitung)',
        'Ilma [karbita] ei saa vahetada. (karp)',
        'Ma tahan jope [tagastada]. (tagastama)',
        'Kas ma saan suurust [vahetada]? (vahetama)',
      ], '', 'full'), { task: 'G02' }),
      teach(tag(v6(B.choice('034_p_pron', 'Hääldusnurk: õ, ä, ö, ü.', 'Kuula ja vali õige täishäälik. Siis räägi kaasa.', [
        ['Sõna 1', 'korv', 'kõrv'],
        ['Sõna 2', 'tüli', 'tuli'],
        ['Sõna 3', 'pära', 'pere'],
        ['Sõna 4', 'töö', 'too'],
      ], 'full', 'g_listen'), { pronunciation: 'vokaalid' }), { task: 'L01' }),
      'Hääldusnurk, 5 min. Ütle igast reast võtmes oleva sõna (korv, tüli, pära, töö); õpilane valib. Näita suu kuju: õ — huuled laiad, keel taga; ü ja ö — huuled ümarad; ä — suu lahti. Siis varjutamine: loe „Ma tahan veekeetja tagastada. Kviitung on mul kaasas.”, õpilane räägib kohe kaasa, kaks korda. Vene keelt kõnelejal: õ ei ole „ы”, ä on lahtisem kui „э”, ü ei ole „ю”.'),
      teach(v6(tag(B.rolecards('034_t_desk', 'Infoletis.', 'A on klient, B müüja. Lahendage probleem ilma valmis lauseteta.',
        'Sa ostsid kolm nädalat tagasi laualambi, 25 eurot. Nüüd see ei põle. Kviitung on sul kaasas, karpi ei ole. Mida sa tahad: uut lampi või raha tagasi? Räägi müüjaga.',
        'Sa oled infoleti müüja. Küsi: mis juhtus, millal klient ostis, kas kviitung on kaasas. Poe reegel: tagastada saab 14 päeva jooksul, vahetada kahe aasta garantii ajal.',
        [], []), { task: 'S10', level: 4, fluency: true }), { hiddenInfo: true }),
      'Üks-ühele, ilma valmis fraasideta: õpetaja on müüja. Varjatud info (ütle alles vestluse ajal): raha tagasi ei saa, sest 14 päeva on läbi; garantii ajal saab lambi vahetada, aga uus lamp tuleb poodi alles reedel — klient peab otsustama, kas ta tuleb kuni reedeni tagasi või võtab kohe teise lambi (30 €, maksab 5 eurot juurde). Ilma karbita vahetus on lubatud. Kui õpilane ei küsi, millal uus lamp tuleb, ära ütle seda ise.'),
      teach(tag(B.examWriting('034_p_card', 'Eksaminurk: visiitkaart.', 'Kirjuta sõbrale visiitkaardi järgi 25–40 sõna.', 'teade', {
        situation: 'Visiitkaart: Parandustöökoda „Kiire Käsi” · parandame veekeetjaid, lampe ja telefone · Pärnu mnt 15, 2. korrus · E–R 9–18, L 10–14 · tel 5566 7788. Sinu sõbra lamp on katki.',
        points: ['mis koht see on ja mida seal tehakse', 'kus see asub', 'millal see on lahti', 'kuidas sinna helistada'],
        words: [25, 40],
      }), { harno: 'W1' }),
      'Eksaminurk nagu Harno A2 kirjutamise 1. osas (tekst visiitkaardi järgi, ≥ 25 sõna), 8 min, ilma antud alguse ja valmis lauseteta. Kontrolli 7 kirjutamine on selle paralleel (uus visiitkaart, samad neli punkti). Üks-ühele: õpetaja on sõber ja küsib ühe küsimuse (Kas laupäeval ka?).'),
    ],
    transfer: [
      teach(tag(B.planning('034_t_plan', 'Enne kirjutamist: plaan.', 'Vaata pilti. Kirjuta iga pildi kohta märksõnad.', ['Pilt 1: millal? mida? mille eest?', 'Pilt 2: mis juhtus?', 'Pilt 3: mis oli kaasas? mida sa ütlesid?', 'Pilt 4: kuidas lõppes?'], 1), { task: 'W11', level: 3 }),
      'Plaan 3 min: ainult märksõnad (kuupäev, hind, lukk katki, kviitung, kahe nädala jooksul). Teie rühmal on blogi „Meie ostulood”: lood ostudest, mis läksid hästi või halvasti. Plaan ei ole valmis laused — need kirjutab õppija pildiloos ise.'),
      teach(tag(v6(B.examWriting('034_t_story', 'Pildilugu: jope lukk.', 'Kirjuta lugu plaani järgi, 30–45 sõna. Ilma antud alguseta.', 'teade', {
        situation: 'Neli pilti: ost, katkine lukk, infolett, lõpp. Lugu läheb rühma blogisse „Meie ostulood”.',
        points: ['millal, mida ja mille eest ostsid', 'mis juhtus', 'mis oli infoletis kaasas', 'kuidas lugu lõppes'],
        words: [30, 45],
      }), {
        lines: 5, taskType: 'narrative', realAddressee: 'rühma kaaslased (blogi „Meie ostulood”)',
        support: ['Märksõnad: 3.12 · jope · 59 €', 'lukk · katki · 10.12', 'infolett · kviitung · kahe nädala jooksul · uus jope'],
        stretch: 'Kirjuta ka, mida müüja ütles: üks lause jutumärkides.',
      }), { task: 'W06', main: true, level: 4 }),
      'Mooduli viimane tund: ilma antud alguse ja valmis lauseteta. Kirjutamine tunnis, 10 min; siis loeb kaaslane lugu ja ütleb ühe märkuse (kas kõik neli punkti on olemas?). Abikaart on märksõnad, mitte laused (märgi kasutamine). Lisaväljakutse: müüja lause. Pildi võti: 3.12 ostsin jope 59 euro eest; 10.12 lukk läks katki; 12.12 infoletis: kviitung ja jope kaasas, vahetada saab kahe nädala jooksul; uus jope.'),
      homeTask(teach(tag(B.speaking('034_t_home', 'Kodus: minu ostulugu.', 'Salvesta 45 sekundit: räägi üht oma ostulugu. Siis Harjuta → moodul 7.', [
        'Mida ja kus sa ostsid? Mis juhtus? Kuidas see lõppes?',
      ], [45, 60]), { task: 'S15' }),
      'Kodune salvestus ilma valmis fraasideta: üks päris ostulugu (või väljamõeldud). Tunnis kuulab õpetaja salvestuse ja küsib ühe küsimuse. Harjuta → moodul 7: kuni …-ni, … jooksul, -ga / ilma …-ta (10 min); kirjuta oma üks viga Harjutas „Minu vead” alla õigesti.')),
      half(exitCheck(tag(v6(B.writing('034_t_exit', 'Väljumine: parem lause.', 'Kirjuta üks lause loost uuesti, kaaslase märkuse järgi.', [1, 2]), { lines: 2 }), { task: 'W10', level: 3 }))),
      half(teach(selfcheck('034_t_self', ['Loen reegleid: 14 päeva jooksul.', 'Räägin infoletis ilma abita.', 'Kirjutan loo ilma abita.'], 'Moodul 7: pood, raha ja ostud'), 'Üks-ühele: õpilane hindab kolme rida, õpetaja ütleb oma hinde; õpilane kirjutab ühe lause oma loost tõendiks.')),
    ],
  }),

  // ---------------------------------------------------------------- 035 control 7: one sheet, four skills
  'a2-035': retire(OLD['a2-035'], {
    title: 'Kontroll 7 — pood, raha ja ostud',
    assessment: true,
    phases: checkSheet('Kontroll', 'Lugemine, kuulamine, kirjutamine ja rääkimine, igaüks 10 punkti (45 min)'),
    canDo: 'Ma näitan ilma abita, et loen poe teateid ja pakkumisi, saan aru hindadest ja tagastamisest, kirjutan visiitkaardi järgi teksti, küsin poes ja räägin oma ostudest; ma tean oma punkte ja lävendeid.',
    teacherPage: P035,
    discover: [
      teach(B.text('035_d_situation', 'Kontroll 7: kuidas punkte loetakse', `Kontrollis on neli osa, igas 10 punkti, kokku 40. Töötad 45 minutit ilma abita. Harno A2 eksamil on igas osas 20 punkti: korruta oma punktid kahega. ${THRESHOLDS} Lõpus võrdled tulemust kontrolliga 6 (tund 30).`), planNote(P035)),
      teach(tag(B.choice('035_p_polite', 'Lugemine 1. Mida öelda?', 'Loe olukorda. Vali sobiv lause. (5 punkti)', [
        ['Müüja küsib: „Kas ma saan aidata?”', 'Jah, ma otsin sooja mütsi.', 'Jah, head isu!', 'Ei, aitäh, ma maksan.'],
        ['Jope on sulle väike.', 'Kas teil on suuremat?', 'Kas teil on väiksemat?', 'Kas teil on kallimat?'],
        ['Sa tahad teada hinda.', 'Mis see maksab?', 'Mis kell on?', 'Mis värvi see on?'],
        ['Uus lamp ei põle.', 'Ma tahan seda vahetada.', 'Ma tahan seda proovida.', 'Ma tahan seda pakkida.'],
        ['Kohvikus on söök läbi. Sa tahad maksta.', 'Arve, palun!', 'Menüü, palun!', 'Head isu!'],
      ], 'full', 'g_read'), { harno: 'R1', task: 'R01' }),
      'Varasemast: 5. küsimus (arve, palun) on moodulist 6. Iga õige vastus 1 punkt.'),
      teach(tag(B.reading('035_p_read', 'Lugemine 2. Pood teatab.', 'Loe teadet. Vasta ühe-kolme sõnaga. (5 punkti)', 'Spordipood Samm: talvine sooduskuu',
        'Detsembris on spordipoes Samm sooduskuu! Pood asub kesklinnas, Kauba tänaval 5, teisel korrusel. Oleme avatud esmaspäevast laupäevani kella kümnest seitsmeni ja pühapäeval kella kümnest neljani.\n\nKõik talvejoped on kahekümne protsendi soodustusega. Soojad mütsid ja kindad saab osta kümne euro eest. Kaks paari villaseid sokke maksavad kaheksa eurot. Suusad on sel kuul odavamad kui novembris. Kliendikaardiga saad veel viis protsenti soodustust. Kaardi saab kassast tasuta. Kui ostad üle saja euro eest, saad sooja mütsi tasuta.\n\nKui jope või saapad ei sobi, saab neid vahetada kahe nädala jooksul. Tagastamiseks on vaja kviitungit. Soodushinnaga kaupa saab ainult vahetada, raha tagasi ei saa.\n\nLaupäeval kell üks on laste suusapäev: lapsed saavad suuski tasuta proovida. Suusapäev kestab kaks tundi ja on poe vastas, pargis. Tule ja too sõber kaasa!',
        [['Mis korrusel pood on?', 'teisel|teisel korrusel'], ['Mis kellani on pood pühapäeval lahti?', 'neljani|kella neljani|16-ni'], ['Mis maksab kümne euro eest?', 'mütsid ja kindad|mütsid|kindad'], ['Mitme nädala jooksul saab vahetada?', 'kahe|kahe nädala jooksul|kaks nädalat'], ['Mida saavad lapsed laupäeval teha?', 'suuski proovida|proovida suuski|suuski tasuta proovida']]), { task: 'R15', harno: 'R4' }),
      'Varasemast: 1. küsimus (mis korrusel) on moodulist 4, 2. küsimus (mis kellani) moodulist 5. Harno-pikkune tekst (≈ 125 sõna). Iga õige vastus 1 punkt; kirjaviga ei loe, kui sõna on arusaadav.'),
      twice(teach(tag(B.listening('035_p_listen', 'Kuulamine 1. Kassas.', 'Kuula kassavestlust kaks korda. Kirjuta lünka üks-kaks sõna. (5 punkti)', [
        'Müüja: Tere! Kas teil on kliendikaart?',
        'Klient: Jah, palun.',
        'Müüja: Hall müts maksab kaksteist eurot.',
        'Müüja: Kindad maksavad kaheksa eurot.',
        'Müüja: Kliendikaardiga saate kümne protsendi soodustuse. Kokku on kaheksateist eurot.',
        'Klient: Kas ma saan maksta sularahas?',
        'Müüja: Jah, muidugi. Kviitungi panen kotti. Mütsi saab vahetada kahe nädala jooksul.',
      ], ['Müts maksab [kaksteist|12] eurot.', 'Kindad maksavad [kaheksa|8] eurot.', 'Soodustus on [kümme|10] protsenti.', 'Klient maksab [sularahas].', 'Mütsi saab vahetada kahe [nädala] jooksul.'], 'g_listen'), { task: 'L03', harno: 'L3' }),
      'Varasemast: 4. lünk (sularahas — kuidas maksta) on moodulist 6. Iga õige lünk 1 punkt; kirjaviga ei loe, kui sõna on arusaadav.'), true),
      twice(teach(tag(B.listening('035_p_listen2', 'Kuulamine 2. Tagastus.', 'Kuula tagastamist kaks korda. Kirjuta lünka üks-kaks sõna. (5 punkti)', [
        'Klient: Tere! Ma ostsin eile selle veekeetja. See ei tööta.',
        'Müüja: Vabandust! Kas teil on kviitung?',
        'Klient: Jah, siin on. Karp on ka kaasas.',
        'Müüja: Kas soovite uut veekeetjat või raha tagasi?',
        'Klient: Uut, palun. Aga kas teil on odavamat?',
        'Müüja: Jah, valge veekeetja on viis eurot odavam. Ma annan teile viis eurot tagasi.',
        'Klient: Aitäh! Kas sellel on ka garantii?',
        'Müüja: Jah, garantii on kaks aastat.',
      ], ['Klient ostis veekeetja [eile].', 'Kliendil on kaasas kviitung ja [karp].', 'Klient tahab [odavamat] veekeetjat.', 'Valge veekeetja on [viis|5] eurot odavam.', 'Garantii on [kaks|2] aastat.'], 'g_listen'), { task: 'L03', harno: 'L3' }),
      'Mooduli 7 tagastus (tund 34). Iga õige lünk 1 punkt; kirjaviga ei loe, kui sõna on arusaadav.'), true),
      teach(tag(B.examWriting('035_t_write', 'Kirjutamine. Tekst visiitkaardi järgi.', 'Kirjuta kaaslasele visiitkaardi järgi 25–40 sõna. (10 punkti)', 'teade', {
        situation: 'Visiitkaart: Õmblustöökoda „Nõel” · parandame jopesid, vahetame lukke, lühendame pükse · Tartu mnt 8, 1. korrus · E–R 10–18 · tel 5123 4567. Sinu kaaslase jope lukk on katki.',
        points: ['mis koht see on ja mida seal tehakse', 'kus see asub ja kuidas sinna saab', 'millal see on lahti', 'kuidas sinna helistada'],
        words: [25, 40],
      }), { task: 'W03', harno: 'W1' }),
      'Üks-ühele: õpilane kirjutab üksi, ilma abita ja ilma antud alguseta. See on tunni 34 eksaminurga („Visiitkaart”) paralleel: samad neli punkti, uus töökoda. Varasemast: „kuidas sinna saab” (moodul 5). Hinda allpool oleva juhendi järgi (kirjutamise viis rida).'),
      teach(tag(B.speaking('035_t_say', 'Rääkimine. Poes ja minu ostud.', 'Küsi õpetajalt poes ja vasta kahele küsimusele. (10 punkti)', [
        '1. osa: küsi poes kingitust sõbrale (mida otsid, värv, hind, pakkimine).',
        '2. osa: kus sa tavaliselt riideid ostad ja miks seal?',
        '2. osa: mis oli sinu viimane ost? Kas see oli odavam või kallim, kui arvasid?',
      ], [45, 75]), { task: 'S02', harno: 'S2' }),
      'Üks-ühele: õpetaja on müüja, siis eksamineerija. 1. osa on tunni 31 külma ülesande („Proovi kohe: poes”) paralleel — uus kingitus, samad kriteeriumid; võrdle oma märkmetega. Ära aita. Hinda allpool oleva juhendi järgi.'),
      teach(B.table('035_t_score', 'Hindamine: kirjutamine ja rääkimine.', 'Õpetaja annab igale hindamisreale 0, 1 või 2 punkti.', 'Hindamisrida (0 / 1 / 2), Punktid', [
        'Kirjutamine, sisu: 2 = kõik neli punkti; 1 = kaks-kolm punkti; 0 = üks punkt või vähem. | ',
        'Kirjutamine, pikkus ja sõnum: 2 = 25–40 sõna ja kaaslane saab kõigest aru; 1 = alla 25 sõna või osa on segane; 0 = tekstist ei saa aru. | ',
        'Kirjutamine, vormid: 2 = kellaajad, korrus ja osastav peaaegu alati õiged; 1 = mitu viga, aga arusaadav; 0 = vormidest ei saa aru. | ',
        'Kirjutamine, sõnavara: 2 = poe ja teenuse sõnad õiged; 1 = mõni sõna puudub või on vale; 0 = sõnu on väga vähe. | ',
        'Kirjutamine, algus ja lõpp: 2 = tervitus ja lõpp sobivad; 1 = üks puudub; 0 = mõlemad puuduvad. | ',
        'Rääkimine, küsimine poes: 2 = ütleb, mida otsib, ja küsib värvi ja hinda; 1 = üks-kaks asja; 0 = küsimust ei ole. | ',
        'Rääkimine, vormid: 2 = otsin sooja mütsi, … euro eest, odavam kui peaaegu alati õiged; 1 = mitu viga, aga arusaadav; 0 = raske aru saada. | ',
        'Rääkimine, vastused: 2 = kaks vastust täislausega ja detailiga; 1 = üks vastus või ainult sõnad; 0 = ei vasta. | ',
        'Rääkimine, sõnavara: 2 = poe, raha ja riiete sõnad õiged; 1 = mõni sõna puudub; 0 = sõnu on väga vähe. | ',
        'Rääkimine, arusaadavus: 2 = kuulaja saab kõigest aru (pausid on lubatud); 1 = kuulaja peab mõnikord üle küsima; 0 = raske aru saada. | ',
      ]), 'Õpetajale: kirjutamise viis rida annavad kirjutamise punktid (/10), rääkimise viis rida rääkimise punktid (/10). Lugemine 5 + 5 küsimust ja kuulamine 5 + 5 lünka, iga õige vastus 1 punkt — kokku 10 + 10 + 10 + 10 = 40.'),
      teach(B.table('035_t_result', 'Minu tulemus: moodul 7.', 'Kirjuta oma punktid ja Harno skaala. Ükski osa ei tohi olla 0 punkti.', 'Osa, Punktid (/10), Harno skaala (/20), Kontroll 6 (%), Mida harjutada?', [
        'Lugemine |  |  |  | ',
        'Kuulamine |  |  |  | ',
        'Kirjutamine |  |  |  | ',
        'Rääkimine |  |  |  | ',
        'Kokku (/40) |  |  |  | ',
      ]), 'Õpetajale: Harno järgi sooritatud = kokku ≥ 24/40 (60 %) ja ükski osa ei ole 0. KeeleSepa sisemine lävi: eksamiks valmis ≥ 28/40 (70 %), sertifikaat ≥ 32/40 (80 %). Kui osa on alla 6/10, anna üks parandusülesanne: lugemine → Harjuta „Lugemine” (moodul 7), kuulamine → tunni 32 või 33 salvestis uuesti ilma tekstita, kirjutamine → sama tekst parandatult, rääkimine → uus salvestus „Minu kingitus sõbrale”. Varasemast (moodulid 4–6) on 4 küsimust 20-st (20 %): lugemine 1.5, lugemine 2.1 ja 2.2, kuulamine 1.4.'),
    ],
  }),
}, {
  'a2-031': 'PROB R→S', 'a2-032': 'AVAS L→S', 'a2-033': 'KUUL L→W', 'a2-034': 'LUGU R→W', 'a2-035': 'EKS',
});
