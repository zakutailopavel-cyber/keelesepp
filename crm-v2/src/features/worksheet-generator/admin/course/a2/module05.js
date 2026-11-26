// A2 course (A1 → A2 roadmap), module 5 „Linn, kohad ja tee” (a2-021…025), stage A2- (lessons 021–050).
// Methodology v5 for A2 (docs/METHODOLOGY_A2_V5.md) AND methodology v6 (docs/METHODOLOGY_V6.md, gates G14–G25) — the first
// A2 module written to v6, so it sets the pattern for the A2 retrofit:
//   - every teaching lesson: 14 blocks (5 / 4 / 5) in a 60-minute lesson; one input; one learning picture on the page of its
//     task (art/visuals/a2-module-05.js); a 5-minute pronunciation corner (data.pronunciation: välted, vokaalid,
//     varjutamine — in 023 it is the dictation, heard for the long and short sounds); the rule box („Märka”, bold forms)
//     is produced by the Harjuta form task, whose hints are the dictionary form, a number or an arrow, never the answer;
//   - Kasuta in the standard order: situation → main task (data.taskType, data.support = „Abikaart”, data.stretch =
//     „Lisaväljakutse”) → product / home task (homeTask, always „Harjuta → moodul 5”) → exit check (exitCheck: 30 s of
//     speech in the main task's skill, the lesson's last in-class step) beside the self-check (three success criteria
//     0–1–2 + one own sentence, data.evidence);
//   - Avasta: „Mäletad?” → words → the one input → rule box „Märka” → guided use (021 and 023: the lesson's picture task);
//     Harjuta: form task beside the pronunciation corner → whole sentences → pair talk (half widths keep pages ≥ 70 % full);
//   - main-task types rotate: 021 survey (classmates), 022 infogap (two maps), 023 phone (hidden information), 024 ranking
//     (a Saturday errand route under opening hours);
//   - spaced retrieval: every vocab block carries data.review (3 words from 3–15 lessons back, used again in the input);
//   - real network: 021 asks classmates, 022's home task is the media log („Minu eesti keele võrgustik”, a real public
//     page), 024's home message goes to a classmate who answers (data.peerReply) after checking a real library page;
//   - a teacher page per lesson (lesson.teacherPage: goal, core path, alternative, short path, „Kui aega jääb”, errors);
//     until the A2 sheet renders it, the same plan stands in the teacher note of the lesson's „Mäletad?” block.
//   021 LUGE R→S  „Kuhu ja miks?” — Irina's week in town (reading). lähen + kuhu? + -ma (lähen apteeki rohtu ostma);
//                 the week planner picture is the pair gap; a survey of three classmates; home: my week in town.
//   022 AVAS L→S  „Kuidas ma sinna saan?” — a phone call with directions (listening). otse, paremale, kuni + -ni
//                 (ristmikuni), üle + mille? (üle silla); the cold task of the module („Proovi kohe” without help, its
//                 parallel is the control's speaking 1); two half-maps = the information gap; home: the media log.
//   023 LUGE R→S  „Ostke pilet!” — a city leaflet for newcomers (reading). Imperative sina / teie and ära / ärge; the
//                 ticket-machine picture; a phone call from the station with HIDDEN INFORMATION (G9); home: a written
//                 guide for a new learner (its parallel is the control's writing).
//   024 KUUL L→S  „Millal on avatud?” — a service centre's answering machine (listening). kella üheksast kuueni,
//                 esmaspäevast reedeni, tööpäeviti. The module's last teaching lesson: no ready phrases (G9); the
//                 Saturday route decided under opening hours; home: a message to a classmate who answers, after checking
//                 a real library page (G13, G25).
//   025 EKS       Control 5 (one sheet, 9 blocks, 45 min): reading, listening, writing, speaking 10 points each; raw points,
//                 the Harno scale (× 2), the thresholds named one way, „ükski osa ei tohi olla 0 punkti”; 4 of the 20 closed
//                 items recycle modules 1–4 (teacher note „Varasemast”), writing and speaking are parallel to 023 and 022.
// No lesson uses the continuing story's cast (G7). Dictation: one, in 023 (5 sentences). Texts are learning texts, the
// people and places are invented (Kase, Lena, Irina …); real pages are named only by title and URL.
// The v4 module (one storyline with Sofia, Malle, Jaan …) is kept below as V4: every old block keeps its id and comes
// back hidden (retire), so learners' saved answers keep their key and Harjuta still draws on the old form tasks.
import { B, hide, tag, teach, why, withShapes } from '../blocks.js';
import { exitCheck, homeTask } from '../stationBlocks.js';

export const MODULE = { id: 'a2-module-05', course: 'a2', title: 'Linn, kohad ja tee', level: 'A2', design: 'v2', template: 'v4' };

// one line for every block taken off the sheets by the v5 / v6 rewrite
const V6_CUT = 'v5+v6 (2026-11-26): lehelt maha — tunni eelarve (60 min), üks sisend, loo tegelased mitte, uus tunni ülesanne';
// a recording is heard twice (methodV5.js G6); in the control the player is locked
const twice = (block, lock = false) => ({ ...block, data: { ...block.data, plays: 2, ...(lock ? { lockPlays: true } : {}) } });
// a block beside another one on the page (two columns)
const half = (block) => ({ ...block, width: 'half', span: 6 });
// a block that starts a new page of the sheet (the page above would otherwise end with a cut task)
const brk = (block) => ({ ...block, pageBreakBefore: true });
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

// ---------------------------------------------------------------- the v4 module (2026-10, one storyline): every block stays
// here with its id; the v6 lessons below take what they reuse and hide the rest (retire).
const V4 = {
  'a2-021': {
    title: 'Kohad linnas',
    canDo: 'Ma räägin, kuhu ma linnas lähen ja mida seal teen (apteeki, apteegis, apteegist), ja lepin sõbraga kokku vaba laupäeva plaani.',
    discover: [
      B.review('021_d_review', [['Mis on Malle maja lähedal: pood, park või peatus?', 'a2-019'], ['Mis kell algab Sofia keelekursus?', 'a2-011'], 'Kuhu sa täna pärast tundi lähed?']),
      B.text('021_d_goal', 'Moodul 5: linn, kohad ja tee', 'Sofia elab Tallinnas juba kuu aega. Oma linnaosa ta tunneb, aga kesklinna veel mitte. Selles moodulis õpid koos Sofiaga linna tundma. Sa räägid kohtadest linnas ja küsid teed. Sa sõidad bussi ja trammiga ning loed silte. Mooduli lõpus juhatad telefonis kaaslast keelekoolist kohvikusse. Siis kirjutad talle kirja teejuhise ja kellaaegadega.'),
      B.choice('021_d_try', 'Proovi kõigepealt.', 'Sa ei tea veel reeglit. Vali vorm, mis sinu arvates sobib.', [
        ['Pärast tundi läheb Sofia … (apteek)', 'apteeki', 'apteegis', 'apteegist'],
        ['Mallele ostab ta köharohtu … (apteek)', 'apteegist', 'apteeki', 'apteek'],
        ['Kella kolmeni on Sofia … (raamatukogu)', 'raamatukogus', 'raamatukokku', 'raamatukogust'],
        ['Ta laenab … kaks raamatut. (raamatukogu)', 'raamatukogust', 'raamatukogus', 'raamatukokku'],
        ['Homme viib Sofia paki … (postkontor)', 'postkontorisse', 'postkontoris', 'postkontorist'],
        ['Malle pakk ootab … (pakiautomaat)', 'pakiautomaadis', 'pakiautomaati', 'pakiautomaadist'],
        ['Laupäeval ostab Jaan kala … (turg)', 'turult', 'turul', 'turule'],
        ['Õhtul jalutab Sofia koeraga … (park)', 'pargis', 'parki', 'pargist'],
      ], 'full', 'g_notice'),
      tag(B.reading('021_d_list', 'Sofia nimekiri.', 'Sofia kirjutab päevikusse, kus ta täna käib. Vasta 1–3 sõnaga.', 'Minu kolmapäev linnas',
        'Täna on kolmapäev. Pärast tundi on mul palju asju. Hommikul kirjutan ma nimekirja: kaart, apteek, pakk, raamatukogu ja turg.\n\nKõigepealt lähen ma kioskisse. Seal ostan ma ühiskaardi. Müüja on noor ja räägib aeglaselt, seepärast saan ma kõigest aru. Kaart maksab kaks eurot. Tallinna elanikud sõidavad bussi ja trammiga tasuta. Aga kaart peab alati kaasas olema.\n\nSiis sõidan ma bussiga Mustamäe keskusesse. Keskuses on palju poode, kohvikuid ja üks pank. Apteek on esimesel korrusel. Apteegist ostan ma Mallele köharohtu, sest Malle on haige. Apteeker räägib ka vene keelt, aga ma räägin temaga eesti keeles.\n\nKeskuse ees on pakiautomaat. Seal ootab mind pakk Tartust. Ema saadab mulle tihti pakke. Pakis on soojad sokid ja kook.\n\nPärast lõunat lähen ma raamatukokku. Raamatukogus teen ma lugejakaardi. See on tasuta. Ma laenan kaks lihtsat raamatut eesti keeles.\n\nÕhtul lähen ma veel turule. Turg on Balti jaama kõrval ja seal on alati palju inimesi. Turult ostan ma õunu ja kala. Müüja on lahke ja annab mulle ühe õuna tasuta. Kell kuus olen ma jälle kodus. Homme lähen ma postkontorisse ja saadan Katile Saksamaale paki.',
        [['Mida Sofia kioskist ostab?', 'ühiskaardi|ühiskaart'], ['Kui palju kaart maksab?', 'kaks eurot|2 eurot'], ['Mis korrusel on apteek?', 'esimesel|esimesel korrusel'], ['Kellele Sofia köharohtu ostab?', 'Mallele'], ['Kus on pakiautomaat?', 'keskuse ees'], ['Mida Sofia turult ostab?', 'õunu ja kala|õunu|kala'], ['Kuhu Sofia homme läheb?', 'postkontorisse']]), { task: 'R15' }),
      tag(B.listening('021_d_malle', 'Malle helistab.', 'Malle on haige ja palub Sofialt abi. Kuula kaks korda, vasta 1–2 sõnaga.', [
        'Malle: Tere, Sofia! Kas sa oled praegu linnas?',
        'Sofia: Tere, Malle! Jah, ma olen Mustamäe keskuses, kohvikus.',
        'Malle: Väga hea. Kas sa saad mind aidata? Mul on gripp ja ma olen terve päeva kodus.',
        'Sofia: Oi, kahju! Muidugi aitan. Mida on vaja?',
        'Malle: Kõigepealt mine palun apteeki. Mul on vaja köharohtu ja vitamiine.',
        'Sofia: Apteek on siin keskuses, esimesel korrusel. Mis veel?',
        'Malle: Minu pakk on pakiautomaadis, keskuse ees. Ma saadan sulle koodi telefoni.',
        'Sofia: Selge. Kas pakk on suur? Mul on ainult väike kott.',
        'Malle: Ei, väike. Seal on raamat minu sõbrannalt.',
        'Malle: Ja homme vii palun minu raamatud raamatukokku. Need on minu toas, laual.',
        'Sofia: Kas raamatukogu on homme avatud? Mul on tund kella kaheteistkümneni.',
        'Malle: Jah, kella üheteistkümnest. Aga mina töötan seal alles reedel.',
        'Sofia: Hästi. Kas poest on ka midagi vaja?',
        'Malle: Jah, osta palun sidrunit ja mett. Tee meega on gripi vastu hea.',
        'Sofia: Ma tulen koju kella viie paiku. Kas sul on veel midagi vaja?',
        'Malle: Ei, aitäh, kullake! Sa oled väga hea üürnik.',
        'Sofia: Pole tänu väärt! Joo palju teed ja puhka. Ma helistan sulle apteegist, kui midagi ei ole.',
        'Malle: Hästi. Ja ära unusta oma vihmavarju, täna õhtul sajab vihma!',
      ], ['Sofia istub Mustamäe keskuses [kohvikus].', 'Mallel on [gripp] ja ta on kodus.', 'Apteegist peab Sofia ostma köharohtu ja [vitamiine].', 'Apteek on keskuse esimesel [korrusel].', 'Pakiautomaadi koodi saadab Malle Sofia [telefoni|telefonile].', 'Homme viib Sofia Malle raamatud [raamatukokku|raamatukogusse].', 'Poest ostab Sofia sidrunit ja [mett].', 'Sofia tuleb koju kella [viie] paiku.']), { task: 'L03' }),
      B.notice('021_d_notice', 'Märka: kus? kuhu? kust? linnas', [
        'Kus? **-s**: apteegi**s**, keskuse**s**, raamatukogu**s** · Kust? **-st**: apteegi**st**, kioski**st**',
        'Kuhu? **-sse**: kioski**sse**, keskuse**sse**, postkontori**sse**',
        'Kuhu? lühike vorm: **apteeki**, **panka**, **parki**, **raamatukokku** (= raamatukogusse)',
        'Peal: turu**l** – turu**le** – turu**lt** (nagu tööl, tööle, töölt)',
        '**Ostan** apteegist, **laenan** raamatukogust, **saadan** postkontorist: kust? → **-st**',
        'Vaata nüüd uuesti oma vastuseid harjutuses „Proovi kõigepealt”.',
      ], 'full'),
      B.table('021_d_rule', 'Leia reegel.', 'Täida tabel. Siis paranda oma esimesed vastused.', 'Koht, Kus?, Kuhu?, Kust?', [
        'apteek | apteegis | [apteeki] | [apteegist]', 'kiosk | [kioskis] | [kioskisse] | kioskist', 'postkontor | postkontoris | [postkontorisse] | [postkontorist]', 'raamatukogu | [raamatukogus] | raamatukokku | [raamatukogust]',
        'pank | [pangas] | [panka] | pangast', 'keskus | keskuses | [keskusesse] | [keskusest]', 'turg | [turul] | [turule] | turult', 'park | [pargis] | parki | [pargist]',
      ], 'g_notice'),
      B.categorize('021_d_what', 'Mida kus teed?', 'Kus sa seda teed? Pane iga tegevus õige koha alla.', [
        ['kioskis', ['ostan ühiskaardi', 'ostan ajalehe', 'ostan jäätist', 'ostan bussipileti', 'ostan ajakirja']],
        ['apteegis', ['ostan vitamiine', 'näitan retsepti', 'ostan köharohtu', 'küsin ravimi kohta nõu', 'ostan plaastrit']],
        ['raamatukogus', ['laenan raamatu', 'teen lugejakaardi', 'loen ajakirju', 'toon raamatud tagasi', 'kasutan arvutit']],
        ['postkontoris', ['saadan paki', 'ostan margi', 'saadan kirja', 'ostan ümbriku', 'maksan paki eest']],
        ['pangas', ['avan pangakonto', 'küsin laenu kohta', 'saan uue pangakaardi', 'võtan sularaha', 'maksan arve']],
      ], 'full', 'g_vocab'),
      tag(B.vocab('021_d_vocab', 'Tunni sõnad.', ['apteek — аптека', 'pank — банк', 'postkontor — почта', 'raamatukogu — библиотека', 'pakk — посылка', 'turg — рынок', 'keskus — центр', 'kino — кино', 'laenama — брать на время', 'saatma — отправлять']), { topic: ['apteek', 'laenama'] }),
      teach(tag(B.speaking('021_d_survey', 'Kolm küsitlust.', 'Küsi kolmelt paariliselt samad küsimused. Lõpus ütle, kes käib linnas kõige rohkem.', ['Kuhu sa lähed, kui sul on vaja ravimeid?', 'Kas sa käid raamatukogus? Mida sa sealt laenad?', 'Kust sa saad oma pakid: postkontorist või pakiautomaadist?', 'Kus sa ostad toitu: poest või turult?', 'Mis koht sulle sinu linnas kõige rohkem meeldib?'], [60, 120], ['Ma lähen apteeki …', 'Raamatukogust laenan ma …', 'Kõige rohkem meeldib mulle …']), { task: 'S09', fluency: true }),
        'Üks-ühele: õpilane küsib samad küsimused õpetajalt kolm korda; õpetaja vastab iga kord teise inimese nimel (Malle, Jaan, Lucía). Lõpus ütleb õpilane, kes käib linnas kõige rohkem ja kuhu.'),
    ],
    practice: [
      B.formtext('021_p_letter', 'Sofia kiri Katile.', 'Kirjuta sulgudes olev sõna õiges kohavormis: kus, kuhu või kust?', 'Tere, Kati!', [
        'Tere, Kati! Tallinn on ilus, aga suur. Iga päev sõidan ma bussiga [keelekooli] (keelekool). Tund algab kell üheksa.',
        '',
        'Pärast tundi käin ma tihti Mustamäe [keskuses] (keskus). Seal on palju poode, kohvikuid ja üks suur apteek. Kohvikus joon ma kohvi ja loen eestikeelseid ajalehti.',
        '',
        'Täna ootab mind pakk [pakiautomaadis] (pakiautomaat). Ema saadab mulle sooje sokke ja kooki.',
        '',
        'Pärast lõunat lähen ma [raamatukokku|raamatukogusse] (raamatukogu). [Raamatukogust] (raamatukogu) laenan ma lihtsaid raamatuid eesti keeles.',
        '',
        'Laupäeval läheme Jaaniga [turule] (turg). Jaan ostab [turult] (turg) kala oma kohvikule.',
        '',
        'Homme lähen ma [postkontorisse] (postkontor) ja saadan sulle väikese paki. Kirjuta, kas sa saad selle kätte! Kallistan! Sofia',
      ]),
      B.adsmatch('021_p_ads', 'Linna kuulutused.', 'Kuhu iga inimene läheb? Kirjuta kuulutuse täht. Üks kuulutus sobib mitmele.', [
        ['Mustamäe raamatukogu', 'Avatud E–R 11–19 ja L 11–17. Lugejakaart on tasuta, võta kaasa ID-kaart. Teisipäeval kell 18 on eesti keele vestlusklubi. Neljapäeval kell 17 on lastele lugemistund.'],
        ['Apteek Kase', 'Akadeemia tee 25. Avatud iga päev 8–22. Retseptiravimid on kassas number 2. Proviisor annab nõu ka vene ja inglise keeles.'],
        ['Postkontor, Mustamäe keskus', 'Avatud E–R 9–18 ja L 10–15. Paki saad saata ka välismaale. Margid ja ümbrikud on kassas. Lõuna on kella 13–14.'],
        ['Nõmme turg', 'Avatud T–P 8–16. Värske kala, köögivili ja marjad. Laupäeval müüvad inimesed turul ka vana mööblit ja raamatuid.'],
        ['Kiosk Hobujaama peatuses', 'Ühiskaart maksab 2 €. Meil on ajalehed, ajakirjad ja kohv kaasa. Avatud iga päev kella seitsmest üheksani õhtul.'],
      ], [
        ['Dmitri tahab osta ühiskaarti ja tassi kohvi.', 'E'], ['Lucía tahab rääkida eesti keelt teiste õppijatega.', 'A'], ['Tom saadab emale Iirimaale paki.', 'C'], ['Malle tahab pühapäeval kala ja marju osta.', 'D'],
        ['Grete vajab õhtul kell üheksa retseptiravimit.', 'B'], ['Mia tahab kuulata muinasjuttu.', 'A'], ['Viktor otsib odavat vana tooli.', 'D'], ['Sofia ostab ümbriku ja kaks marki.', 'C'],
      ]),
      B.wordforms('021_p_forms', 'Üks koht või mitu?', 'Kirjuta sõna vormis, mida vihje sulgudes küsib.', [
        ['pood (mitmus, kus?)', 'Laupäeval on … palju inimesi.', 'poodides'], ['park (mitmus, kus?)', 'Mustamäe … mängivad lapsed.', 'parkides'], ['kohvik (mitmus, kus?)', 'Kesklinna … on kohv kallis.', 'kohvikutes'], ['tänav (mitmus, kus?)', 'Vanalinna … on palju turiste.', 'tänavatel'],
        ['raamatukogu (kuhu?)', 'Sofia viib raamatud …', 'raamatukokku|raamatukogusse'], ['kiosk (kust?)', 'Ühiskaardi ostan ma …', 'kioskist'], ['pakiautomaat (kus?)', 'Ema pakk ootab …', 'pakiautomaadis'], ['turg (kus?)', 'Viktor müüb õunu …', 'turul'],
      ]),
      B.match('021_p_where', 'Mida ja kust?', 'Ühenda tegevus ja koht, kust või kuhu see käib.', [
        ['Laenan raamatu', 'raamatukogust'], ['Saadan paki', 'postkontorist'], ['Ostan ravimit', 'apteegist'], ['Võtan sularaha', 'pangaautomaadist'],
        ['Ostan värsket kala', 'turult'], ['Ostan ühiskaardi', 'kioskist'], ['Toon Malle paki', 'pakiautomaadist'], ['Viin raamatud tagasi', 'raamatukokku'],
      ], 'full', 'g_vocab'),
      B.dictation('021_p_dict', 'Etteütlus: Sofia päev.', 'Õpetaja loeb kaheksa lauset Sofia päevast. Kirjuta iga lause vihikusse.', ['Pärast tundi läheb Sofia kioskisse.', 'Kioskist ostab ta uue ühiskaardi.', 'Apteek on keskuse esimesel korrusel.', 'Malle pakk ootab pakiautomaadis.', 'Raamatukogust laenab Sofia kaks raamatut.', 'Laupäeval läheb Jaan Balti jaama turule.', 'Postkontorisse viib Sofia homme paki.', 'Õhtul on Sofia jälle kodus.'], 8),
      teach(B.rolecards('021_p_roles', 'Raamatukogus.', 'A teab raamatukogu infot, B küsib. Siis vahetage ja kontrollige vastuseid.',
        'Sa töötad raamatukogus. Sinu info: avatud E–R 11–19, L 11–17; lugejakaart on tasuta, vaja on ID-kaarti; raamatu saab laenata neljaks nädalaks; vestlusklubi on teisipäeval kell 18.',
        'Sa oled uus lugeja. Küsi: mis kell raamatukogu avatud on, mida on kaardi jaoks vaja, kui kauaks saab raamatu laenata, millal on vestlusklubi. Kirjuta vastused üles.',
        ['Me oleme avatud …', 'Palun teie ID-kaart.', 'Raamatu saab laenata … nädalaks.'], ['Mis kell te avatud olete?', 'Mida on lugejakaardi jaoks vaja?', 'Kui kauaks ma saan raamatu laenata?']),
        'Üks-ühele: õpetaja töötab raamatukogus ja vastab info järgi; õpilane küsib ja kirjutab vastused üles. Siis vahetage: õpilane annab infot oma kodu lähedal oleva poe või apteegi kohta, õpetaja küsib.'),
      tag(B.writing('021_p_free', 'Minu linn kaheksa minutiga.', 'Kirjuta 8 minutit ilma peatumata: kuhu sa oma linnas lähed ja miks?', [7, 8], ['apteeki', 'raamatukogust', 'poodides', 'turul'], 2), { task: 'W06', fluency: true }),
    ],
    transfer: [
      B.text('021_t_sit', 'Vaba laupäev linnas', 'Laupäeval on Sofial vaba päev. Jaan töötab kohvikus Pann kella neljani. Pärast tööd tahavad nad koos linna minna. Hommikul saadab Jaan Sofiale sõnumi. Linnas on laupäeval palju üritusi. Vaata ka pilti: Sofia seisab kohviku ees ja vaatab kaarti. Lepi Jaaniga kokku, kuhu te lähete.'),
      tag(B.insertion('021_t_jaan', 'Jaani sõnum.', 'Jaani sõnumist on viis lauset puudu. Pane need õigesse kohta, üks jääb üle.', 'Tere, Sofia!', [
        'Tere, Sofia! Kas sul on laupäeval aega? [[Ma lõpetan töö kell neli.]] Siis olen ma vaba ja tahan sinuga linna minna.',
        '',
        'Kadri on lastega Tartus vanaema juures. [[Kodus on vaikne ja ma ei taha üksi olla.]] Mul on mõned ideed, aga vali ka sina!',
        '',
        'Kadrioru pargis on kell viis kontsert. Kui sajab vihma, on kontsert muuseumis. [[Võta kaasa soe jope!]] Õhtul võime minna kinno või süüa vanalinnas.',
        '',
        'Hommikul enne tööd käin ma Balti jaama turul. [[Kohvikule on vaja värsket kala ja köögivilja.]] Turult toon ma ka sulle midagi head.',
        '',
        'Kirjuta, mis sulle sobib. [[Kohtume kohviku ees kell pool viis.]] Sinu vend Jaan',
      ], ['Oskaril on teisipäeval jalgpallitrenn.']), { task: 'R16' }),
      B.profiles('021_t_events', 'Laupäev linnas.', 'Loe nelja kuulutust. Kirjuta lünka koht, aeg või hind.', [
        ['Keskraamatukogu, Estonia pst 8', ['kell 11–13 lugemistund lastele', 'kell 17 räägib kirjanik oma uuest raamatust', 'sissepääs on tasuta', 'kohvik on teisel korrusel'], ['Raamatukogus saab kohvi juua teisel [korrusel].', 'Kirjanikuga kohtumine algab kell [viis|17].', 'Hommikul on lugemistund [lastele].']],
        ['Kadrioru park', ['kell 17 kontsert õues', 'võta kaasa tekk ja piknikukorv', 'vihma korral kunstimuuseumis', 'sissepääs on tasuta'], ['Kontsert on [õues] pargis.', 'Kaasa tuleb võtta [tekk|piknikukorv].', 'Kui sajab vihma, on kontsert [kunstimuuseumis|muuseumis].']],
        ['Kino Sõprus, vanalinn', ['kell 18.30 eesti film', 'subtiitrid on inglise keeles', 'pilet maksab 8 €', 'piletid kassast või internetist'], ['Film algab kell pool [seitse|7].', 'Subtiitrid on [inglise] keeles.', 'Pilet maksab kaheksa [eurot].']],
        ['Lennusadam (meremuuseum)', ['avatud kella 10–18', 'vanad laevad ja allveelaev', 'laupäeval on lastele tasuta', 'kohvik on mere ääres'], ['Muuseum on avatud kella [kuueni|18-ni].', 'Seal saab vaadata vanu [laevu].', 'Kohvikust näeb [merd].']],
      ], '2', 'g_read'),
      teach(tag(B.ideaCard('021_t_plan', 'Kuhu me laupäeval läheme?', 'A on Sofia, B on Jaan. Valige kolm kohta ja leppige kokku aeg.', 'Jaan lõpetab töö kell neli. Kell kümme õhtul tahab ta kodus olla. Sofia tahab näha midagi uut.', ['kontsert Kadrioru pargis', 'kirjanik raamatukogus', 'eesti film kinos', 'Lennusadam ja vanad laevad', 'õhtusöök vanalinnas', 'jalutuskäik mere ääres'], 'Mis kolm kohta te valite, mis kell ja kuidas te sinna saate?'), { main: true }),
        'Üks-ühele: õpetaja on Jaan ja tahab alguses minna teistesse kohtadesse; õpilane teeb ettepanekuid, põhjendab ja lepib kokku kolm kohta ning aja. Siis vahetage rollid.'),
      teach(tag(B.speaking('021_t_say', 'Kodus: minu lemmikkoht linnas.', 'Salvesta 45–60 sekundit: mis on sinu lemmikkoht linnas ja mida sa seal teed?', ['Mis koht see on ja kus see asub?', 'Kuidas sa sinna saad?', 'Mida sa seal teed?', 'Kellega sa sinna lähed?', 'Miks see koht sulle meeldib?'], [45, 60], ['Minu lemmikkoht on …', 'Ma lähen sinna …', 'Seal ma …']), { task: 'S15', level: 3 }),
        'Kodune monoloog. Tunnis kuulab õpetaja salvestuse ja küsib kaks küsimust („Kui tihti sa seal käid?”, „Mis kell see on avatud?”).'),
      B.examWriting('021_t_note', 'Teade Jaanile.', 'Kirjuta Jaanile teade laupäeva plaanist. Kirjuta kõigist neljast punktist.', 'teade', {
        situation: 'Jaan palub: „Kirjuta meie laupäeva plaan lühidalt üles, siis ma ei unusta midagi!”',
        points: ['kus ja mis kell te kohtute', 'kuhu te lähete kõigepealt ja kuhu siis', 'kuidas te sinna saate', 'mida peab kaasa võtma'],
        words: [40, 60], opening: 'Tere, Jaan!', closing: 'Sofia',
      }),
      B.rubric('021_t_rubric', 'Hindamine.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kokkuleppes on kolm kohta, aeg ja põhjus.', 'Kohavormid on õiged: kinno, pargis, raamatukogust, turule.', 'Teates on kõik neli punkti (40–60 sõna).', 'Salvestus on arusaadav ja kestab 45–60 sekundit.']),
      B.selfcheck('021_t_self', ['Ma ütlen: apteegis, apteeki, apteegist.', 'Ma loen linna kuulutusi ja leian aja ning koha.', 'Ma lepin sõbraga kokku vaba päeva plaani.', 'Ma räägin oma lemmikkohast linnas.'], 'Kohad linnas'),
    ],
  },

  'a2-022': {
    title: 'Kuidas ma sinna saan?',
    canDo: 'Ma saan aru teejuhisest, küsin teed ja kirjutan 50–70-sõnalise loo sellest, kuidas keegi linnas uue tee leiab.',
    discover: [
      B.review('022_d_review', [['Kuhu Sofia ja Jaan laupäeval lähevad?', 'a2-021'], ['Mis päeval hoiab Sofia Jaani lapsi?', 'a2-012'], 'Kuidas sa täna keelekooli tulid?']),
      B.text('022_d_hook', 'Teisipäev', 'Teisipäeval on Kadri ja Jaan tööl. Sofia peab Oskari koolist ära tooma. Oskar käib Kase koolis, teises klassis. Vaata loo pealkirja. Kas Sofia leiab kooli kohe?'),
      tag(B.reading('022_d_story', 'Sofia otsib kooli.', 'Vaata pealkirja ja arva, mis juhtub. Siis loe lugu ja kontrolli.', 'Kus on Kase kool?',
        'Teisipäeval lõpeb tund kell kaksteist. Sofia peab kell pool kolm Kase kooli juures olema. Oskar ootab teda kooli ees. Aga Sofia ei tea, kus kool asub.\n\nPärast tundi küsib ta abi Dmitrilt. Dmitri on bussijuht ja tunneb Tallinna väga hästi. „Kase kool on Kristiines,” ütleb Dmitri. „Sõida trammiga.”\n\nSofia istub Hobujaama peatuses trammi number neli. Sõit kestab viisteist minutit. Ta vaatab aknast linna ja kuulab peatuste nimesid. Trammis on palju koolilapsi ja üks vana mees koeraga. Vineeri peatuses ta väljub.\n\nPeatuse juures on suur ristmik. Dmitri juhise järgi tuleb siin pöörata vasakule. Aga vasakul on ainult pood ja parkla. Kooli ei ole näha. Telefonis on ainult kaks protsenti akut!\n\nSofia küsib teed ühelt vanemalt naiselt. Naine räägib kiiresti. „Vabandage, palun korrake aeglaselt!” ütleb Sofia. Naine naeratab ja näitab käega: „Ristmikul paremale, siis üle silla.”\n\nViis minutit enne poolt kolme on Sofia kooli ees. Oskar istub pingil ja sööb õuna. „Tädi Sofia, sa oled täpne!” ütleb ta. Sofia naerab. Täpne? Ta tunneb ennast täna nagu väike turist suures linnas.',
        [['Mis kell peab Sofia kooli juures olema?', 'pool kolm|kell pool kolm|14.30'], ['Kellelt Sofia pärast tundi abi küsib?', 'Dmitrilt'], ['Millega Sofia Kristiinesse sõidab?', 'trammiga|trammiga number neli'], ['Kus Sofia trammist väljub?', 'Vineeri peatuses'], ['Miks ei saa Sofia telefonist teed vaadata?', 'telefonis on vähe akut|aku on peaaegu tühi|telefonis on ainult kaks protsenti akut'], ['Mida Sofia ütleb, kui naine räägib kiiresti?', 'palun korrake aeglaselt|palun korrake'], ['Mida Oskar pingil teeb?', 'sööb õuna']]), { task: 'R13' }),
      B.listening('022_d_dmitri', 'Dmitri juhatab teed.', 'Mida Dmitri pärast tundi soovitab? Kuula kaks korda, kirjuta lünka sõna või number.', [
        'Sofia: Dmitri, kas sa tead, kuidas ma saan Kase kooli?',
        'Dmitri: Jah, Kase kool on Kristiines. Kõige parem on sõita trammiga.',
        'Sofia: Kus on trammipeatus?',
        'Dmitri: Hobujaama peatus on siin lähedal, Narva maanteel.',
        'Dmitri: Sõida trammiga number neli Tondi poole.',
        'Sofia: Kui kaua sõit kestab?',
        'Dmitri: Umbes viisteist minutit. Välju Vineeri peatuses.',
        'Sofia: Kas kool on peatuse lähedal?',
        'Dmitri: Jah. Mine peatusest otse kuni ristmikuni. Seal pööra vasakule.',
        'Dmitri: Kool on pargi kõrval, suur kollane maja.',
        'Sofia: Kas ma pean piletit ostma?',
        'Dmitri: Ei, sul on ühiskaart. Aga pane kaart trammis kohe lugeja vastu!',
      ], ['Kase kool asub [Kristiines].', 'Kõige parem on sõita [trammiga].', 'Trammipeatus on [Narva] maanteel.', 'Sofia sõidab trammiga number [neli|4].', 'Sõit kestab umbes [viisteist|15] minutit.', 'Sofia väljub [Vineeri] peatuses.', 'Ristmikul tuleb pöörata [vasakule].', 'Kool on suur [kollane] maja pargi kõrval.']),
      B.notice('022_d_notice', 'Märka: küsi, juhata, kontrolli', [
        'Küsi: **Vabandage, kuidas ma saan** Kase kooli**?** · **Kus on** trammipeatus?',
        'Kontrolli: **Kas see on kaugel?** · **Kas** ristmikul **paremale?** · **Palun korrake!**',
        'Suund: **otse, paremale, vasakule, tagasi** · **kuni** ristmiku**ni** · **üle** silla (üle + omastav)',
        'Transport: sõidan **trammiga** · istun **trammi** · **väljun** peatuses · istun **ümber** bussile',
        'Kaugus: **viis minutit jalgsi** · **kaks peatust** trammiga',
      ], 'full'),
      B.categorize('022_d_sort', 'Küsin, juhatan või kontrollin?', 'Mis lause see on? Pane iga lause õigesse rühma.', [
        ['küsin teed', ['Vabandage, kuidas ma saan raamatukokku?', 'Kus on lähim bussipeatus?', 'Mis trammiga ma sõidan?', 'Kas te teate, kus on apteek?', 'Kuidas ma saan jaama?', 'Kus asub Kase kool?']],
        ['juhatan', ['Sõida bussiga kaks peatust.', 'Mine üle silla.', 'Pood on panga vastas.', 'Teisel ristmikul pööra vasakule.', 'Mine otse kuni kirikuni.', 'Välju Vineeri peatuses.']],
        ['kontrollin', ['Kas see on kaugel?', 'Kas pärast silda paremale?', 'Kas ma väljun järgmises peatuses?', 'Palun korrake veel kord!', 'Kas kool on pargi kõrval?', 'Kas ma pean ümber istuma?']],
      ], 'full', 'g_vocab'),
      B.match('022_d_answers', 'Küsimus ja vastus.', 'Mida vastab inimene tänaval? Ühenda küsimus ja vastus.', [
        ['Vabandage, kus on lähim apteek?', 'Ristmiku taga, panga kõrval.'], ['Kas see on kaugel?', 'Ei, jalgsi viis minutit.'], ['Mis trammiga ma Kadriorgu saan?', 'Number üks või kolm.'], ['Kus ma pean väljuma?', 'Järgmises peatuses.'],
        ['Kas ma pean ümber istuma?', 'Jah, Vabaduse väljakul bussile.'], ['Kas pärast silda paremale?', 'Ei, pärast silda otse.'], ['Kui kaua sõit kestab?', 'Umbes kakskümmend minutit.'], ['Kus on bussipeatus?', 'Üle tee, kioski juures.'],
      ], 'full', 'g_vocab'),
      tag(B.vocab('022_d_vocab', 'Tunni sõnad.', ['tee — дорога', 'otse — прямо', 'paremale — направо', 'vasakul — слева', 'ristmik — перекрёсток', 'sild — мост', 'tramm — трамвай', 'väljuma — выходить', 'kaugel — далеко', 'jalgsi — пешком']), { topic: ['ristmik'] }),
      teach(tag(B.speaking('022_d_retell', 'Jutusta Sofia lugu.', 'Jutusta paarilisele Sofia lugu kaks korda: 2 minutit, siis 1 minut.', ['Kuhu Sofia teisipäeval peab minema ja miks?', 'Kellelt ta abi küsib ja mida ta kuuleb?', 'Millega ta sõidab ja kus ta väljub?', 'Mis probleem tal ristmikul on?', 'Kuidas ta lõpuks kooli leiab?'], [60, 120], ['Kõigepealt …', 'Ristmikul …', 'Lõpuks …']), { task: 'S07', fluency: true }),
        'Üks-ühele: õpilane jutustab õpetajale kaks korda, õpetaja hoiab aega. Teisel korral on aega vähem — jutt peab tulema sujuvamalt, mitte lühemalt.'),
      tag(B.writing('022_d_join', 'Lugu järjekorras.', 'Kirjuta Sofia teest 6–8 lauset. Kasuta sõnu kõigepealt, siis, pärast seda, sest.', [6, 8], ['kõigepealt', 'siis', 'sest', 'peatuses'], 2, 'g_use'), { task: 'W09' }),
    ],
    practice: [
      B.choice('022_p_phrases', 'Mida sa tänaval ütled?', 'Loe olukorda ja vali lause, mida sa ütled.', [
        ['Sa ei tea, kus on Kase kool.', 'Vabandage, kas te teate, kus on Kase kool?', 'Vabandage, kas Kase kool on teie oma?', 'Vabandage, mis kell on Kase kool?'],
        ['Võõras räägib sinuga väga kiiresti.', 'Palun rääkige aeglasemalt!', 'Palun rääkige kiiremini!', 'Palun minge aeglasemalt!'],
        ['Sa tahad teada, kas kool on kaugel.', 'Kas see on siit kaugel?', 'Kas see on siit suur?', 'Kas see on siit vana?'],
        ['Sa ei ole kindel, kus pöörata.', 'Vabandage, kas ristmikul paremale?', 'Vabandage, kas ristmik on ilus?', 'Vabandage, kas teil on ristmik?'],
        ['Sa tahad teada, mis peatuses väljuda.', 'Mis peatuses ma pean väljuma?', 'Mis peatusest ma tulen?', 'Mis peatus sulle meeldib?'],
        ['Võõras küsib sinult teed, aga sa ei tea.', 'Vabandust, ma ei ole siit.', 'Jah, palun, siin see on.', 'Aitäh, väga lahke!'],
        ['Naine juhatab sulle teed. Sa tänad teda.', 'Suur aitäh, te olete väga lahke!', 'Head isu, te olete väga lahke!', 'Palju õnne, te olete väga lahke!'],
        ['Trammis istub sinu kõrval turist kaardiga.', 'Kas ma saan teid aidata?', 'Kas te saate mind oodata?', 'Kas te tahate minu kaarti osta?'],
      ], 'full', 'g_notice'),
      B.examListen('022_p_ask', 'Vineeri peatuses.', 'Sofia küsib tänaval teed. Kuula kaks korda ja ühenda juhise osad.', 'match', [
        'Sofia: Vabandage, kas te teate, kus on Kase kool?',
        'Naine: Kase kool? Jah. Minge otse kuni ristmikuni.',
        'Sofia: Ja ristmikul vasakule?',
        'Naine: Ei, ristmikul paremale. Vasakul on haigla.',
        'Sofia: Vabandage, palun korrake!',
        'Naine: Ristmikul pöörake paremale. Siis minge üle väikese silla.',
        'Sofia: Kas see on kaugel?',
        'Naine: Ei ole. Jalgsi umbes viis minutit.',
        'Naine: Kool on pargi kõrval. Staadion on kooli taga.',
        'Sofia: Suur aitäh! Head päeva!',
      ], [
        ['Kõigepealt minna', 'otse kuni ristmikuni'], ['Ristmikul pöörata', 'paremale'], ['Ristmikust vasakul', 'on haigla'], ['Pärast ristmikku minna', 'üle väikese silla'],
        ['Jalgsi kooli', 'umbes viis minutit'], ['Kase kool', 'pargi kõrval'], ['Staadion', 'kooli taga'], ['Sofia palub naisel', 'korrata'],
      ]),
      B.transformation('022_p_polite', 'Küsi viisakalt.', 'Kirjuta viisakas küsimus. Alusta antud sõnadega.', [
        ['Kus on raamatukogu?', 'Vabandage, kas te teate, kus …?', 'Vabandage, kas te teate, kus on raamatukogu?'],
        ['Sa tahad minna turule.', 'Vabandage, kuidas ma …?', 'Vabandage, kuidas ma saan turule?'],
        ['Inimene räägib liiga kiiresti.', 'Palun …', 'Palun rääkige aeglasemalt!'],
        ['Sa tahad teada, kas kool on kaugel.', 'Kas …?', 'Kas kool on kaugel?'],
        ['Sa ei tea, mis trammiga sõita.', 'Mis trammiga ma pean …?', 'Mis trammiga ma pean sõitma?'],
        ['Sa ei tea, kus väljuda.', 'Mis peatuses ma pean …?', 'Mis peatuses ma pean väljuma?'],
        ['Sa ei tea, kui kaua sõit kestab.', 'Kui kaua …?', 'Kui kaua sõit kestab?'],
        ['Sa ei tea, kas pead ümber istuma.', 'Kas ma pean …?', 'Kas ma pean ümber istuma?'],
      ]),
      B.truefalse('022_p_tf', 'Dmitri või naine?', 'Mõtle loole ja kuulamistele. Kas lause on õige või vale?', [
        ['Sofia sõidab Kase kooli trammiga.', true], ['Sõit kestab umbes pool tundi.', false], ['Dmitri juhise järgi tuleb ristmikul pöörata vasakule.', true], ['Naine ütleb samuti, et ristmikul tuleb pöörata vasakule.', false],
        ['Ristmikust vasakul on haigla.', true], ['Sofia ei saa naisest kohe aru ja palub korrata.', true], ['Kool on peatusest kaugel, jalgsi kakskümmend minutit.', false], ['Oskar ootab Sofiat staadionil kooli taga.', false],
      ], 'full'),
      B.reading('022_p_kadri', 'Kadri sõnum.', 'Kadri kirjutab Sofiale, mida teisipäeval teha. Loe ja vasta.', 'Teisipäev',
        'Tere, Sofia! Suur aitäh, et sa tood teisipäeval Oskari koolist! Oskari tunnid lõpevad kell 14.30. Oskar ootab sind kooli ees, pingil.\n\nKõigepealt minge koju. Meie maja, Männi 8, on kooli lähedal, kümme minutit jalgsi. Võti on naabri juures, korteris 5. Külmkapis on supp. Pärast sööki tehke koos kodutööd. Oskaril on matemaatika ja lugemine, need ei ole pikad.\n\nKell viis on Oskaril jalgpallitrenn. Staadion on kooli taga. Minge sinna läbi pargi, see on kõige lühem tee. Spordikott on esikus, nagi all. Ärge unustage veepudelit!\n\nJaan tuleb staadionile kell kuus ja viib Oskari koju. Kui midagi on valesti, helista mulle. Ma olen haiglas tööl, aga telefon on mul taskus. Kallistan! Kadri',
        [['Mis kell Oskari tunnid lõpevad?', '14.30|kell 14.30|pool kolm'], ['Kus Oskar Sofiat ootab?', 'kooli ees|pingil|kooli ees, pingil'], ['Kui kaugel on maja koolist?', 'kümme minutit|kümme minutit jalgsi'], ['Kus on korteri võti?', 'naabri juures|korteris 5'], ['Mida nad pärast sööki teevad?', 'kodutööd|teevad kodutööd'], ['Kuidas on staadionile kõige lühem tee?', 'läbi pargi'], ['Miks peab Sofia Kadrile helistama?', 'kui midagi on valesti|kui on probleem']]),
      teach(tag(B.rolecards('022_p_roles', 'Juhata sõpra.', 'A küsib teed, B juhatab. Tehke kaks korda: teine kord teise kohaga ja kiiremini.',
        'Sa oled linnas uus. Sul on vaja minna kooli, apteeki või jaama. Küsi teed ja kontrolli kaks korda: kas see on kaugel, kus pöörata.',
        'Sa elad siin. Joonista lihtne kaart. Juhata teed 4–5 sammuga: otse, paremale, vasakule, kuni ristmikuni, üle silla.',
        ['Vabandage, kuidas ma saan …?', 'Kas see on kaugel?', 'Kas ristmikul paremale?'], ['Mine otse kuni …', 'Siis pööra …', 'See on … kõrval.']), { task: 'S13', fluency: true }),
        'Üks-ühele: õpetaja joonistab lihtsa kaardi ja juhatab teed; õpilane küsib ja kontrollib kaks korda. Siis juhatab õpilane õpetajat oma kodu kaardi järgi, teist korda kiiremini.'),
      tag(B.speaking('022_p_opinion', 'Kas uues linnas on lihtne?', 'Ütle oma arvamus ja põhjenda: kas uues linnas on lihtne teed leida?', ['Kas sa küsid tänaval teed või vaatad telefoni?', 'Kas sinu linnas on head sildid ja kaardid?', 'Mis on parem: tramm, buss või jalgsi?', 'Mida teha, kui telefonis ei ole akut?', 'Mis koht on sinu linnas raske leida? Miks?'], [60, 120], ['Minu arvates …', 'Mulle meeldib rohkem …, sest …', 'Kui telefon ei tööta, siis …']), { task: 'S11' }),
    ],
    transfer: [
      B.text('022_t_sit', 'Tee on suletud', 'Kell on pool viis. Sofia ja Oskar lähevad läbi pargi staadionile. Aga pargis on teetööd ja tee on suletud! Trenn algab kell viis. Mis nüüd? Vaata ka pilti: jaama juures on samuti tee suletud ja onu Viktor juhatab ühele naisele uut teed.'),
      teach(tag(B.rolecards('022_t_picture', 'Pilt: tee on suletud.', 'A kirjeldab pilti, B küsib. Siis võrrelge pilti oma linnaga.',
        'Vaata pilti. Kirjelda: kus inimesed on, mis on suletud ja mida Viktor kaardil näitab. Ütle, kuhu naine läheb.',
        'Kuula ja küsi kaks küsimust. Siis räägi: kas sinu linnas on praegu teetöid? Kuidas sa siis liigud?',
        ['Pildil on …', 'Tee on suletud, sest …', 'Viktor näitab kaardil …'], ['Kus nad seisavad?', 'Mis on kaardil?', 'Minu linnas …']), { task: 'S06' }),
        'Üks-ühele: õpilane kirjeldab pilti, õpetaja küsib kaks küsimust. Siis räägib õpetaja teetöödest oma linnas ja õpilane küsib. Lõpus võrdlevad nad pilti oma linnaga.'),
      tag(B.bankText('022_t_story', 'Mis edasi juhtub?', 'Loe loo jätku. Pane fraasid õigesse kohta, üks fraas jääb üle.', 'Uus tee staadionile', [
        'Pargi väravas on suur silt: „Teetööd. Tee on suletud.” Oskar vaatab kella ja ütleb: „Trenn algab kümne minuti pärast!”',
        '',
        'Sofia ei tunne seda linnaosa. Ta küsib teed [[ühelt mehelt]], kes jalutab koeraga. Mees on lahke. „Minge tagasi [[kuni ristmikuni]],” ütleb ta. „Seal pöörake vasakule ja minge mööda tänavat otse.”',
        '',
        '„Kas see on kaugel?” küsib Sofia. „Ei ole,” vastab mees. „Jalgsi viis minutit. Siis minge [[üle väikese silla]]. Staadion on silla taga, [[spordihalli kõrval]].”',
        '',
        'Oskar jookseb ees, Sofia tuleb järel. Tänaval on palju autosid, seepärast võtab Sofia Oskaril käest kinni. Ristmikul ootavad nad [[rohelist tuld]].',
        '',
        'Üks minut enne viit on nad staadionil. Treener Raivo naeratab: „Täpselt õigel ajal!” Oskar annab Sofiale [[oma jope]] ja jookseb väljakule.',
      ], ['raamatukogu juurde']), { task: 'R05' }),
      B.planning('022_t_plan', 'Loo plaan.', 'Mõtle, kuidas sinu lugu läheb. Kirjuta märksõnad viie küsimuse järgi.', ['Kus Sofia ja Oskar on? Mis kell on?', 'Mis on suletud ja miks?', 'Keda nad küsivad ja mida ta ütleb?', 'Kuidas nad lähevad: 4–5 sammu.', 'Mis juhtub staadionil?'], 2),
      teach(tag(B.speaking('022_t_say', 'Kodus: minu tee.', 'Salvesta 45–60 sekundit: kuidas sinu kodust lähimasse poodi või peatusesse saab?', ['Kust sa alustad?', 'Kas sa lähed otse või pöörad?', 'Mis on teel: ristmik, sild või park?', 'Kui kaua see kestab?', 'Mis on poe või peatuse kõrval?'], [45, 60], ['Ma lähen kodust välja ja …', 'Ristmikul pööran …', 'Pood on … kõrval.']), { task: 'S15', level: 3 }),
        'Kodune monoloog. Tunnis kuulab õpetaja salvestuse ja küsib kaks küsimust („Kas see on kaugel?”, „Kus sa pöörad?”).'),
      tag(B.examWriting('022_t_write', 'Lugu: uus tee staadionile.', 'Kirjuta Sofia ja Oskari lugu olevikus. Kirjuta kõigist neljast punktist.', 'jutt', {
        situation: 'Kooli ajaleht kogub lugusid teemal „Kuidas ma linnas teed otsin”. Kirjuta Sofia ja Oskari lugu.',
        points: ['kuhu Sofia ja Oskar lähevad ja miks', 'mis on suletud', 'keda nad küsivad ja kuidas nad lähevad', 'kuidas lugu lõpeb'],
        words: [50, 70],
      }), { main: true }),
      B.rubric('022_t_rubric', 'Hindamine.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Loos on kõik neli punkti (50–70 sõna) ja selge lõpp.', 'Teejuhis on õige: kuni ristmikuni, üle silla, paremale, vasakule.', 'Pildi kirjelduses ütleb õpilane, kus inimesed on ja mis probleem neil on.', 'Salvestus on arusaadav ja kestab 45–60 sekundit.']),
      B.selfcheck('022_t_self', ['Ma küsin teed viisakalt ja palun korrata.', 'Ma saan aru juhisest: otse, paremale, kuni ristmikuni, üle silla.', 'Ma kirjeldan pilti ja võrdlen seda oma linnaga.', 'Ma kirjutan loo uuest teest.'], 'Tee leitud'),
    ],
  },

  'a2-023': {
    title: 'Ema tuleb Tallinna',
    canDo: 'Ma annan juhiseid käskivas kõneviisis (mine, osta, ära oota; minge, ostke) ja selgitan suuliselt telefonis, kuidas bussijaamast keelekooli saab.',
    discover: [
      B.review('023_d_review', [['Kuidas jõuavad Sofia ja Oskar staadionile?', 'a2-022'], ['Mida sa teed kõigepealt, kui koju tuled?', 'a2-014'], 'Mis trammi või bussiga sa keelekooli sõidad?']),
      B.text('023_d_hook', 'Ema kiri', 'Helgil on koolivaheaeg. Neljapäeval tuleb ta bussiga Tartust Tallinna. Buss jõuab bussijaama kell 11.20. Sofia on siis veel keelekoolis. Ema kirjutab: „Kuidas ma sinu juurde saan? Ma ei tunne Tallinna trammi!” Proovi kohe aidata.'),
      teach(tag(B.speaking('023_d_try', 'Esimene katse: aita ema.', 'Räägi paarilisele, kuidas bussijaamast keelekooli saab. Siis räägi sama uuesti, kiiremini.', ['Kus on bussijaama lähedal trammipeatus?', 'Mis trammiga ema sõidab?', 'Kus ta pileti ostab?', 'Kus ta väljub?', 'Kuidas ta peatusest keelekooli leiab?'], [60, 120], ['Ema sõidab …', 'Pilet on …', 'Keelekool on …']), { task: 'S02', fluency: true }),
        'Üks-ühele: õpilane selgitab õpetajale teed nii, nagu oskab; õpetaja on ema ja küsib „Ja siis?”. Teist korda räägib õpilane sama kiiremini. Õpetaja kirjutab üles, mida õpilane ütleb, ja näitab seda tunni lõpus.'),
      tag(B.reading('023_d_chat', 'Pere vestlus.', 'Loe pere vestlust. Mida Jaan ja Kadri emale soovitavad?', 'Pere vestlus: ema tuleb!',
        'Helgi: Tere, lapsed! Neljapäeval tulen Tallinna. Buss jõuab kell 11.20. Kuidas ma Sofia keelekooli saan?\n\nJaan: Tere, ema! Bussijaama kõrval on trammipeatus. Istu trammi number neli. Pileti saad osta peatuses automaadist.\n\nKadri: Või osta pilet telefonis, see on lihtsam. Pane trammis kaart või telefon kohe lugeja vastu!\n\nHelgi: Mul on vana telefon ja ma ei oska sellega piletit osta. Ma ostan automaadist.\n\nJaan: Hästi. Sõida kaks peatust ja välju Hobujaamas. Siis mine üle tee ja pööra vasakule.\n\nKadri: Keelekool on Narva maantee 7, teisel korrusel. Ära mine liftiga, see on katki!\n\nHelgi: Ma kirjutan kõik üles. Aga mul on raske kott, seal on kook ja moos.\n\nJaan: Ära muretse! Kui kott on liiga raske, võta takso. Takso maksab umbes kümme eurot.\n\nSofia: Ema, oota mind peatuses! Tund lõpeb kell kaksteist. Ma tulen sulle vastu.\n\nHelgi: Aitäh, kallis! Siis me sööme koos lõunat. Ma toon teile kõigile kooki.',
        [['Mis kell jõuab Helgi buss Tallinna?', '11.20|kell 11.20'], ['Kus on bussijaama juures trammipeatus?', 'bussijaama kõrval'], ['Kust saab Helgi pileti osta?', 'automaadist|peatuses automaadist'], ['Miks Helgi telefonis piletit ei osta?', 'tal on vana telefon|vana telefon'], ['Kus Helgi trammist väljub?', 'Hobujaamas|Hobujaama peatuses'], ['Miks ei tohi Helgi liftiga minna?', 'lift on katki|sest lift on katki'], ['Mida Helgi teeb, kui kott on liiga raske?', 'võtab takso|sõidab taksoga']]), { task: 'R12' }),
      tag(B.bankText('023_d_guide', 'Jaani juhend: piletiautomaat.', 'Jaan kirjutab emale juhendi. Pane käsud lünkadesse, kaks sõna jääb üle.', 'Kuidas osta piletit automaadist?', [
        'Piletiautomaat on peatuse ees, kioski kõrval. Kõigepealt [[vajuta]] ekraanil nuppu „Eesti keel”. Siis [[vali]] pilet: üks sõit või tund aega. Tunni pilet maksab kaks eurot.',
        '',
        'Nüüd [[pane]] pangakaart automaadi alla. Kui automaat küsib PIN-koodi, [[kirjuta]] see. Sularahaga maksta ei saa. [[Ära unusta]] kaarti automaati!',
        '',
        'Kui makse on korras, piiksub automaat. Automaat annab paberpileti. [[Võta]] pilet ja [[hoia]] see alles. Trammis on tihti kontrolörid ja nad küsivad piletit. Trammis pane pilet kohe lugeja vastu. Lugeja on ukse juures, see on väike hall kast.',
        '',
        'Kui automaat ei tööta, mine kioskisse ja osta pilet sealt. Kui midagi muud ei tööta, [[helista]] mulle. Ma olen kohvikus tööl, aga vastan kohe. Jaan',
      ], ['Mine', 'oota'], 'g_vocab'), { task: 'R04' }),
      B.notice('023_d_notice', 'Märka: käskiv kõneviis', [
        '**Sina** (sõbrale, emale, lapsele): ma vaatan → **vaata!** · ma ootan → **oota!** · ma vajutan → **vajuta!**',
        'Erandid: ma lähen → **mine!** · ma tulen → **tule!** · ma teen → **tee!** · ma söön → **söö!**',
        '**Teie** (võõrale või mitmele), lõpus g + e: minna → **minge**, tulla → **tulge**, panna → **pange**',
        'Teie-vorm, lõpus k + e: vaadata → **vaadake**, oodata → **oodake**, võtta → **võtke**, osta → **ostke**',
        'Eitus: **ära** + sina-vorm: **ära mine, ära oota** · **ärge** + teie-vorm: **ärge minge, ärge oodake**',
        'Kadri emale: **Ära mine liftiga!** · Juht turistile: **Minge üle tee! Ärge oodake!**',
      ], 'full'),
      B.table('023_d_rule', 'Leia reegel: käsk.', 'Kirjuta puuduv käsk. Kontrolli Jaani juhendist ja kastist „Märka”.', 'Ma-vorm, Sina!, Teie!, Eitus (sina)', [
        'ma vaatan | [vaata] | [vaadake] | ära vaata', 'ma ootan | oota | [oodake] | [ära oota]', 'ma pööran | pööra | [pöörake] | [ära pööra]', 'ma võtan | [võta] | [võtke] | ära võta',
        'ma lähen | mine | [minge] | [ära mine]', 'ma tulen | [tule] | tulge | [ära tule]', 'ma ostan | [osta] | [ostke] | ära osta', 'ma vajutan | [vajuta] | vajutage | [ära vajuta]',
      ], 'g_notice'),
      B.vocab('023_d_vocab', 'Tunni sõnad.', ['bussijaam — автовокзал', 'pilet — билет', 'pangakaart — банковская карта', 'ekraan — экран', 'valima — выбирать', 'hoidma — держать / хранить', 'ootama — ждать', 'unustama — забывать', 'takso — такси', 'vanalinn — старый город']),
      tag(B.writing('023_d_again', 'Teine katse: juhend turistile.', 'Kirjuta sama juhend võõrale turistile teie-vormis: 6–8 käsku.', [6, 8], ['minge', 'ostke', 'vajutage', 'ärge'], 2, 'g_use'), { task: 'W12' }),
    ],
    practice: [
      tag(B.wordforms('023_p_forms', 'Sina või teie?', 'Kirjuta käsk. Vaata, kellele inimene räägib.', [
        ['istuma', 'Härra, … palun!', 'istuge'], ['sõitma', 'Oskar, … rattaga aeglaselt!', 'sõida'], ['helistama', 'Proua, … homme uuesti!', 'helistage'], ['tooma', 'Grete, … palun leiba!', 'too'],
        ['sööma', 'Lapsed, … supp ära!', 'sööge'], ['maksma', 'Proua, … kassas, palun!', 'makske'], ['kiirustama', 'Lucía, ära …! Meil on aega.', 'kiirusta'], ['ootama', 'Härrad, ärge … siin, buss ei peatu!', 'oodake'],
      ]), { task: 'G05' }),
      tag(B.reading('023_p_tickets', 'Info trammipeatuses.', 'Loe trammipeatuse infot. Mis on Helgile õige?', 'Peatus „Bussijaam”',
        'Trammid: number 4 sõidab Tondi ja Lennujaama vahel iga 10 minuti järel. Number 2 sõidab iga 12 minuti järel.\n\nPiletid: 1 tund – 2 €, 1 päev – 5 €, 3 päeva – 10 €. Tallinna elanikud sõidavad ühiskaardiga tasuta. Külalised ja turistid ostavad pileti. Ka Helgi on külaline, sest ta elab Tartus.\n\nAutomaat on peatuse ees. Maksa pangakaardiga, sularaha automaat ei võta. Pileti saab osta ka telefonist või kioskist. Lastele, kes on alla seitsme aasta vanad, on sõit tasuta.\n\nTrammis pane pilet või kaart kohe lugeja vastu. Roheline tuli tähendab: kõik on korras. Punane tuli tähendab: vaata uuesti!\n\nTrammis käivad kontrolörid. Ilma piletita tuleb maksta trahvi 40 eurot.\n\nKüsimuste korral helista infotelefonil 1345 või küsi kioskist. Kiosk on peatuse kõrval ja avatud iga päev kella 7–21.',
        [['Kui tihti sõidab tramm number neli?', 'iga 10 minuti järel|iga kümne minuti järel'], ['Helgi sõidab ühe korra. Mis pilet talle sobib?', '1 tund|tunnipilet|ühe tunni pilet'], ['Kui palju see pilet maksab?', '2 €|kaks eurot'], ['Helgil on ainult sularaha. Kas ta saab automaadist piletit osta?', 'ei|ei saa'], ['Mida tähendab punane tuli?', 'vaata uuesti|probleem'], ['Kui suur on trahv?', '40 eurot|nelikümmend eurot'], ['Kus saab veel küsida, kui automaat ei tööta?', 'kioskist|infotelefonil']]), { task: 'R08' }),
      B.examListen('023_p_guide', 'Giid vanalinnas.', 'Turistid on vanalinnas. Kuula giidi kaks korda ja vali õige vastus.', 'choice', [
        'Giid: Tere tulemast! Me oleme Viru värava juures.',
        'Giid: See värav on üle 600 aasta vana. Vaadake neid kahte torni!',
        'Turist: Kas me läheme nüüd Raekoja platsile?',
        'Giid: Jah. Tulge minu järel mööda Viru tänavat.',
        'Giid: Tänav on kitsas, seepärast hoidke paremale.',
        'Turist: Kas me võime pilti teha?',
        'Giid: Muidugi! Aga ärge jääge maha. Vanalinnas on lihtne ära eksida.',
        'Giid: Raekoja platsil on meil pool tundi vaba aega.',
        'Giid: Kohtume kell kaks raekoja ukse ees. Ärge hilinege!',
      ], [
        ['Kus on grupp alguses?', 'Viru värava juures', 'Raekoja platsil', 'Toompeal'],
        ['Kui vana on Viru värav?', 'üle 600 aasta', 'üle 60 aasta', 'üle 100 aasta'],
        ['Mida palub giid turistidel vaadata?', 'kahte torni', 'vana apteeki', 'merd'],
        ['Kuhu grupp nüüd läheb?', 'Raekoja platsile', 'bussijaama', 'muuseumi'],
        ['Miks peab Viru tänaval paremale hoidma?', 'tänav on kitsas', 'tänaval on palju autosid', 'tänaval on remont'],
        ['Mida turist giidilt küsib?', 'kas võib pilti teha', 'kus on WC', 'kui palju pilet maksab'],
        ['Kui palju vaba aega on grupil platsil?', 'pool tundi', 'üks tund', 'kaks tundi'],
        ['Kus grupp kell kaks kohtub?', 'raekoja ukse ees', 'Viru värava juures', 'kohvikus'],
      ]),
      B.cloze('023_p_cloze', 'Lucía kiri Tomile.', 'Lucía kutsub Tomi vanalinna. Vali igasse lünka õige sõna.', 'Tere, Tom!', [
        'Tere, Tom! Laupäeval {*tule|tulge|tuleb} meiega vanalinna! Ma näitan sulle oma lemmikkohti.',
        '',
        'Me kohtume laupäeval kell üksteist Viru {*värava|värav|väravas} juures, lillede müüjate kõrval. {*Ära|Ärge|Ei} jää hiljaks!',
        '',
        'Kõigepealt läheme mööda Viru tänavat Raekoja {*platsile|platsil|platsilt}. Seal on vana apteek ja kõrge {*torn|torni|tornis}. Raekoja torni otsas on vana mees, tema nimi on Vana Toomas.',
        '',
        'Vanalinna tänavad on {*kitsad|kitsas|kitsast} ja kivised. {*Pane|Pange|Paneb} jalga mugavad jalanõud!',
        '',
        'Mina eksin seal alati. Seepärast {*võta|võtke|võtab} kaasa telefon ja kaart. Pärast jalutuskäiku joome Raekoja platsil kohvi. Kohtumiseni! Lucía',
      ], 'g_vocab'),
      B.errorfix('023_p_fix', 'Paranda käsk.', 'Kirjuta lause õigesti. Mõtle: sina või teie?', [
        ['Härra, palun pööra paremale!', 'Härra, palun pöörake paremale!'], ['Oskar, ära tulge hiljaks!', 'Oskar, ära tule hiljaks!'], ['Lapsed, ära jookske!', 'Lapsed, ärge jookske!'], ['Sofia, ostab palun leiba!', 'Sofia, osta palun leiba!'],
        ['Ära minna sinna, see on vale tee!', 'Ära mine sinna, see on vale tee!'], ['Proua, võtke number ja ootage!', 'Proua, võtke number ja oodake!'], ['Lucía, vaadake! Seal on raekoda!', 'Lucía, vaata! Seal on raekoda!'], ['Ärge oota, härra, buss tuleb kohe!', 'Ärge oodake, härra, buss tuleb kohe!'],
      ]),
      teach(tag(B.rolecards('023_p_roles', 'Giid kolm korda.', 'A on giid, B on turist. Juhata kolm korda: 3, 2 ja 1,5 minutit.',
        'Sa oled giid. Juhata turisti Viru väravast Raekoja platsile ja Toompeale. Kasuta teie-vormi: minge, vaadake, ärge kiirustage.',
        'Sa oled turist. Küsi iga kord vähemalt kaks küsimust: kas see on kaugel, kus on kohvik, kus saab pilti teha.',
        ['Minge otse …', 'Vaadake, see on …', 'Ärge unustage …'], ['Kas see on kaugel?', 'Kus on siin hea kohvik?', 'Kus ma saan pilti teha?']), { task: 'S08' }),
        'Üks-ühele: õpilane on giid ja juhatab õpetajat kolm korda, iga kord lühema ajaga (3 – 2 – 1,5 minutit); õpetaja on turist ja küsib. Siis on õpetaja giid ja õpilane turist.'),
      B.examWriting('023_p_survey', 'Linna küsitlus.', 'Linn küsib elanikelt ühistranspordi kohta. Vasta igale küsimusele lausega.', 'kusimustik', {
        questions: ['Kuidas sa tavaliselt linnas liigud?', 'Mitu korda nädalas sa sõidad bussi või trammiga?', 'Kus sa pileti või ühiskaardi ostad?', 'Mis peatuses sa kõige tihedamini väljud?', 'Mis on ühistranspordis hea?', 'Mis ei ole hea? Miks?', 'Mida sa ütled turistile, kes ei leia peatust?', 'Mida peab linn paremaks tegema?'],
      }),
    ],
    transfer: [
      B.text('023_t_sit', 'Ema on teel', 'Neljapäev, kell 10.40. Helgi istub bussis. Sofia on keelekoolis ja tund lõpeb kell kaksteist. Kõigepealt mõtle koos sõbraga: mis on emale kõige parem tee? Siis tuleb emalt häälsõnum. Vaata ka pilti: üks naine õpetab mehele piletiautomaati.'),
      teach(tag(B.ideaCard('023_t_choose', 'Mis on emale parim tee?', 'A ja B: valige koos, kuidas Helgi bussijaamast keelekooli tuleb.', 'Helgil on raske kott. Ta tunneb Tallinna halvasti. Tal on pangakaart ja natuke sularaha.', ['tramm number neli', 'takso (umbes 10 €)', 'jalgsi (25 minutit)', 'Sofia tuleb peatusesse vastu', 'Jaan toob ema autoga', 'buss ja siis jalgsi'], 'Mis tee te valite ja miks? Mis on teine variant?'), { task: 'S12' }),
        'Üks-ühele: õpetaja eelistab alguses taksot; õpilane võrdleb variante (hind, aeg, raske kott), paneb need järjekorda ja lepib õpetajaga kokku parima tee ning varuvariandi.'),
      tag(B.listening('023_t_voice', 'Ema häälsõnum.', 'Helgi jätab bussist sõnumi. Kuula kaks korda: mida see Sofiale tähendab?', [
        'Helgi: Tere, Sofia! Siin ema. Ma olen bussis, praegu oleme Paides.',
        'Helgi: Teel on remont ja buss sõidab aeglaselt. Juht ütleb, et buss on kakskümmend minutit hiljem.',
        'Helgi: Ma olen bussijaamas alles kell kaksteist.',
        'Helgi: Minu telefonis on vähe akut. Palun ära helista pikalt, kirjuta lühidalt.',
        'Helgi: Mul on pangakaart, aga sularaha on ainult viis eurot. Pangaautomaati ma bussijaamas ei otsi, mul pole aega.',
        'Helgi: Kott on raske, seal on kook ja kaks purki moosi.',
        'Helgi: Kas keelekoolis on lift? Ma ei taha kotiga trepist minna.',
        'Helgi: Ma ei tea, kus bussijaamas on trammipeatus. Seal on nii palju inimesi ja busse.',
        'Helgi: Kui sa saad, tule mulle bussijaama vastu. Kui ei saa, siis helista mulle kell kaksteist ja juhata mind.',
        'Helgi: Ma ootan sind bussijaama ukse juures, kohviku ees. Mul on seljas punane mantel, nii et sa näed mind kohe.',
        'Helgi: Ja pärast tundi tahan ma süüa. Jaani kohvikusse on ju lähedalt minna? Musi!',
      ], ['Buss jääb hiljaks, sest teel on [remont].', 'Helgi jõuab bussijaama alles kell [kaksteist|12].', 'Sofia tund lõpeb samal ajal, seega saab Sofia minna emale [vastu].', 'Akut on vähe, seepärast peab Sofia kirjutama [lühidalt].', 'Takso jaoks on Helgil sularaha ainult [viis|5] eurot.', 'Piletiautomaadis saab Helgi maksta [pangakaardiga|kaardiga].', 'Kotis on kook ja kaks purki [moosi].', 'Kotiga ei taha Helgi minna [trepist|trepist üles].']), { task: 'L06', level: 3 }),
      teach(tag(B.phoneCards('023_t_call', 'Ema helistab bussijaamast.', 'A on Helgi, B on Sofia. B juhatab sina-vormis, A kontrollib kaks korda.', 'Kell on 12.05. Helgi on bussijaamas. Õpetaja Maret palub Sofial tunni järel jääda. Sofia ei saa vastu tulla ja juhatab ema telefonis.',
        ['Helgi (helistab)', ['Ütle, kus sa oled ja mida sa näed.', 'Küsi, kus on trammipeatus.', 'Küsi, kuidas automaadist piletit osta.', 'Küsi, kus väljuda.', 'Kontrolli: kas Hobujaamas vasakule?', 'Küsi, mis korrusel keelekool on.']],
        ['Sofia (juhatab)', ['Mine bussijaamast välja, peatus on maja kõrval.', 'Automaadis vali „1 tund”, maksa kaardiga, võta pilet.', 'Sõida trammiga number neli kaks peatust, välju Hobujaamas.', 'Mine üle tee ja pööra vasakule.', 'Narva maantee 7, teine korrus. Lift on katki, ära kiirusta.', 'Ma ootan sind ukse juures!']]), { main: true }),
        'Üks-ühele: õpetaja on Helgi ja helistab bussijaamast; õpilane juhatab sina-vormis ja vastab kontrollküsimustele. Siis vahetage: õpetaja juhatab, õpilane on turist ja kontrollib teie-vormis.'),
      teach(tag(B.speaking('023_t_say', 'Kodus: häälsõnum emale.', 'Salvesta emale 45–60-sekundiline häälsõnum: kuidas bussijaamast keelekooli tulla.', ['Kust ema alustab?', 'Kuidas ta pileti ostab?', 'Mis trammiga ta sõidab ja kus väljub?', 'Kuhu ta peatusest läheb?', 'Mida ta ei tohi unustada?'], [45, 60], ['Mine …', 'Osta …', 'Ära …']), { task: 'S15', level: 3 }),
        'Kodune monoloog. Tunnis kuulab õpetaja salvestuse ja küsib kaks küsimust („Mis trammiga?”, „Kus ta väljub?”); käsud peavad olema sina-vormis.'),
      B.examWriting('023_t_reply', 'Vastus emale.', 'Vasta ema sõnumile. Kirjuta kõigist neljast punktist ja kasuta käske.', 'vastus', {
        situation: 'Ema küsib pere vestluses: „Kirjuta mulle täpselt, mida teha!”',
        points: ['kus on trammipeatus ja kuidas piletit osta', 'mis trammiga sõita ja kus väljuda', 'kuidas peatusest keelekooli saab', 'kus te pärast tundi lõunat sööte'],
        words: [40, 60], opening: 'Kallis ema!', closing: 'Kallistan! Sofia',
      }),
      B.rubric('023_t_rubric', 'Hindamine.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Telefonis juhatab õpilane 5–6 sammuga ja vastab ema küsimustele.', 'Käsud on õiges vormis: mine, osta, välju, ära unusta.', 'Vastuses emale on kõik neli punkti (40–60 sõna).', 'Häälsõnum on selge ja kestab 45–60 sekundit.']),
      B.selfcheck('023_t_self', ['Ma ütlen käsu sina- ja teie-vormis.', 'Ma ütlen keelu: ära oota, ärge oodake.', 'Ma juhatan telefonis ema bussijaamast keelekooli.', 'Ma kirjutan emale lühikese juhendi.'], 'Käsud selged'),
    ],
  },

  'a2-024': {
    title: 'Sildid, kaardid ja lahtiolekuajad',
    canDo: 'Ma saan kuuldust aru, mis kell kohad on avatud, ja kirjutan sõbrale 50–70-sõnalise kirja: kuidas kohvikusse saab ja millal see avatud on.',
    discover: [
      B.review('024_d_review', [['Kuidas ostab Helgi automaadist pileti?', 'a2-023'], ['Kui tihti sa käid poes või turul?', 'a2-013'], 'Mis kell on sinu lähim pood avatud?']),
      B.text('024_d_hook', 'Reede on pikk päev', 'Reedel on Sofial palju asju. Onu Viktor tuleb rongiga Tallinna, sest ta vajab uut ID-kaarti. Kõigepealt lähevad nad Mustamäe keskusesse. Keskuses on palju poode, silte ja teadaandeid. Kuula hästi: mis kell midagi on avatud?'),
      tag(B.examListen('024_d_clips', 'Keskuse teadaanded.', 'Kuula kaheksat lühikest teadaannet kaks korda. Vali igale küsimusele vastus.', 'choice', [
        'Diktor: Head kliendid! Toidupood on täna avatud kauem, kella kümneni õhtul. Värske leib ja saiad tulevad poodi kell kuus.',
        'Diktor: Teise korruse riidepoodides on suur allahindlus kuni pühapäevani. Kõik talvejopid ja mütsid on kolmkümmend protsenti odavamad.',
        'Diktor: Postkontor teisel korrusel on täna lõuna ajal suletud, kella ühest kaheni. Pakiautomaadid keskuse ees töötavad nagu alati.',
        'Diktor: Lastetuba on täna remondis ja suletud. Lapsed saavad mängida kolmanda korruse kohvikus, seal on väike mängunurk.',
        'Diktor: Kolmanda korruse kohvikus maksab täna päevapraad kuus eurot. Lõunat pakume kella kaheteistkümnest kolmeni. Kohv on tasuta.',
        'Diktor: Tähelepanu! Väike poiss Kevin ootab ema infoleti juures, esimesel korrusel. Kevinil on punane müts ja sinine jope.',
        'Diktor: Head kliendid! Peasissepääs on täna remondis. Palun kasutage sissepääsu parkla poolt. Lift ja trepp on ukse kõrval.',
        'Diktor: Mustamäe keskus on avatud iga päev kella üheksani õhtul. Parkla on kolm tundi tasuta. Aitäh ja head ostlemist!',
      ], [
        ['Mis kellani on toidupood täna avatud?', 'kella kümneni', 'kella üheksani', 'kella kuueni'],
        ['Kui palju odavamad on jopid?', '30 %', '13 %', '50 %'],
        ['Millal on postkontor suletud?', 'kella ühest kaheni', 'terve päeva', 'kella kahest kolmeni'],
        ['Kus saavad lapsed täna mängida?', 'kohvikus kolmandal korrusel', 'lastetoas', 'infoleti juures'],
        ['Kui palju maksab kohvikus päevapraad?', 'kuus eurot', 'kolm eurot', 'kaksteist eurot'],
        ['Kus ootab väike Kevin oma ema?', 'infoleti juures', 'kohvikus', 'parklas'],
        ['Kust saab täna keskusesse sisse?', 'parkla poolt', 'peauksest', 'lastetoast'],
        ['Kui kaua saab parklas tasuta olla?', 'kolm tundi', 'kaks tundi', 'terve päeva'],
      ]), { task: 'L01' }),
      tag(B.listening('024_d_phone', 'Teeninduskeskuse automaatvastaja.', 'Viktor helistab teeninduskeskusse. Kuula kaks korda, kirjuta lünka aeg või sõna.', [
        'Automaatvastaja: Tere! Te helistate Tallinna teeninduskeskusse.',
        'Automaatvastaja: Oleme avatud esmaspäevast reedeni kella üheksast viieni.',
        'Automaatvastaja: Neljapäeval oleme avatud kella seitsmeni õhtul.',
        'Automaatvastaja: Laupäeval ja pühapäeval on teeninduskeskus suletud.',
        'Automaatvastaja: ID-kaardi jaoks broneerige aeg kodulehel.',
        'Automaatvastaja: Võtke kaasa vana dokument ja foto.',
        'Automaatvastaja: Teeninduskeskus asub Mustamäe keskuses, teisel korrusel.',
        'Automaatvastaja: Sissepääs on parkla poolt. Lift on ukse kõrval.',
        'Automaatvastaja: Kui te ei saa tulla, tühistage aeg kodulehel või helistage uuesti.',
        'Automaatvastaja: Kui teil on küsimus passi kohta, vajutage üks. Kui ID-kaardi kohta, vajutage kaks.',
        'Automaatvastaja: Kui soovite rääkida teenindajaga, jääge ootele. Aitäh!',
      ], ['Teeninduskeskus on avatud esmaspäevast [reedeni].', 'Tavaliselt on keskus avatud kella üheksast [viieni].', 'Neljapäeval on keskus avatud kella [seitsmeni].', 'Nädalavahetusel on teeninduskeskus [suletud].', 'Aja peab broneerima [kodulehel].', 'Kaasa tuleb võtta vana dokument ja [foto].', 'Teeninduskeskus on teisel [korrusel].', 'Sissepääs on [parkla] poolt.']), { task: 'L10' }),
      B.notice('024_d_notice', 'Märka: kella mitmest kella mitmeni?', [
        '**E–R 9–17** = esmaspäevast reedeni kella üheksast viieni',
        'Algus: **-st** — kella üheksa**st**, esmaspäeva**st** · Lõpp: **-ni** — kella viie**ni**, reede**ni**',
        'kell 1 → kella **ühest** / **üheni** · kell 2 → **kahest** / **kaheni** · kell 3 → **kolmest** / **kolmeni**',
        'kell 5 → **viiest** / **viieni** · kell 7 → **seitsmest** / **seitsmeni** · kell 10 → **kümnest** / **kümneni**',
        '**avatud** = lahti · **suletud** = kinni · **lõuna** = lõunapaus · **L–P** = nädalavahetus',
        'Sildid: **Sissepääs** – **Väljapääs** · **Lükake** – **Tõmmake** · **Info** · **Kassa**',
      ], 'full'),
      B.formtext('024_d_times', 'Keskuse lahtiolekuajad.', 'Kirjuta sulgudes olev number või päev sõnaga õiges vormis.', 'Mustamäe keskus: millal on avatud?', [
        'Mustamäe keskuses on palju poode ja igal poel on oma aeg. Toidupood on avatud iga päev kella [kaheksast] (8) kümneni. Apteek on avatud kella üheksast [üheksani] (9) õhtul.',
        '',
        'Postkontor on avatud esmaspäevast [reedeni] (reede). Postkontoris on lõuna kella ühest [kaheni] (2).',
        '',
        'Teeninduskeskus on avatud kella üheksast [viieni] (5), aga neljapäeval kella [seitsmeni] (7).',
        '',
        'Lastetuba on avatud kella [kümnest] (10) seitsmeni, seal saavad lapsed kaks tundi tasuta mängida. Muuseum keskuse kõrval on [esmaspäeval] (esmaspäev) suletud.',
        '',
        'Kohvik kolmandal korrusel on avatud iga päev. Kohvikus saab süüa sooja lõunat ja juua head kohvi. Laupäeval ja pühapäeval on keskuses palju inimesi, sest siis on kõik vabad.',
      ]),
      B.crossword('024_d_cross', 'Linna sõnad.', 'Lahenda ristsõna: kirjuta iga vihje juurde linna sõna.', [['Siit lähed majja sisse.', 'sissepääs'], ['Siit lähed majast välja.', 'väljapääs'], ['Pood ei ole avatud, see on …', 'suletud'], ['Päev, kui inimesed ei tööta.', 'puhkepäev'], ['Siin maksad ostu eest.', 'kassa'], ['Siin laenad raamatu.', 'raamatukogu'], ['Bussi ootamise koht.', 'peatus'], ['Maja esimene, teine või kolmas …', 'korrus']]),
      B.vocab('024_d_vocab', 'Tunni sõnad.', ['avatud — открыто', 'suletud — закрыто', 'silt — табличка', 'sissepääs — вход', 'väljapääs — выход', 'lõuna — обеденный перерыв', 'puhkepäev — выходной день', 'korrus — этаж', 'kassa — касса', 'tasuta — бесплатно']),
      tag(B.table('024_d_form', 'Broneeri aeg.', 'Sul on vaja uut ID-kaarti. Täida broneeringu vorm enda andmetega.', 'Küsimus, Minu vastus', ['Eesnimi ja perekonnanimi | ', 'Mida on vaja (teenus)? | ', 'Kuupäev ja kellaaeg | ', 'Mis teeninduskeskus? | ', 'Telefon | ', 'E-post | ', 'Mida võtad kaasa? | ', 'Mis keeles soovid teenindust? | '], 'g_use'), { task: 'W07' }),
      teach(tag(B.speaking('024_d_quick', 'Kiire küsimusvoor.', 'Paariline küsib, sina vastad kiiresti. Siis vahetage ja proovige veel kiiremini.', ['Mis kell on sinu lähim pood avatud?', 'Kas apteek on pühapäeval avatud?', 'Mis päeval on postkontor suletud?', 'Kuhu saad minna hilja õhtul?', 'Mis koht on sinu linnas avatud ööpäev läbi?'], [60, 120], ['… on avatud kella …st …ni.', 'Pühapäeval on … suletud.', 'Hilja õhtul saan ma minna …']), { task: 'S02', fluency: true }),
        'Üks-ühele: õpetaja küsib õpilase kodu lähedal olevate kohtade aegu ja hoiab aega; õpilane vastab. Siis küsib õpilane õpetajalt ja teisel korral vastavad mõlemad kiiremini.'),
    ],
    practice: [
      B.manymatch('024_p_signs', 'Sildid.', 'Mida silt tähendab? Leia igale sildile õige selgitus.', ['Lükake', 'Tõmmake', 'Remont. Kasutage teist ust.', 'Tagasi kell 15', 'Ainult personalile', 'Ettevaatust, märg põrand!', 'Avariiväljapääs', 'Rattaparkla'],
        ['Lükka ust, siis see avaneb.', 'Võta käepidemest ja tõmba uks enda poole.', 'See uks ei tööta, mine teise ukse juurde.', 'Töötaja tuleb tagasi kolme ajal.', 'Sinna võivad minna ainult töötajad.', 'Kõnni aeglaselt, sa võid kukkuda.', 'Siit saab välja, kui on tulekahju.', 'Siia saad panna oma jalgratta.'], 'full', 'g_vocab'),
      tag(B.reading('024_p_read', 'Keskuse infoleht.', 'Sofia loeb keskuse infolehte. Mis lõigus on see info? Kirjuta lõigu number.', 'Tere tulemast Mustamäe keskusesse!',
        '1. Mustamäe keskus on avatud iga päev kella 9–21. Keskuses on kolm korrust ja üle neljakümne poe.\n\n2. Esimesel korrusel on toidupood, apteek ja lillepood. Toidupood on avatud kauem, kella 8–22. Apteek on avatud kella 9–21, pühapäeval kella 10–18.\n\n3. Teisel korrusel on riidepoed, postkontor ja teeninduskeskus. Postkontoris on lõuna kella 13–14. Teeninduskeskus on nädalavahetusel suletud.\n\n4. Kolmandal korrusel on kohvikud ja lastetuba. Kohvikutes saab süüa hommikust ja lõunat. Lastetuba on avatud kella 10–19. Seal võivad lapsed tasuta mängida kaks tundi.\n\n5. Pakiautomaadid on keskuse ees ja parkla poolt. Parkla on kolm tundi tasuta. Bussipeatus on peaukse ees.\n\n6. WC on igal korrusel, lifti kõrval. Kui sul on küsimusi, tule infoletti esimesel korrusel. Infoletis saab ka kaardiga maksta parkla eest.',
        [['Viktor tahab saata paki postkontorist. Mis lõigus on postkontori lõuna?', '3|kolmandas'], ['Mia tahab mängida. Mis lõigus on lastetuba?', '4|neljandas'], ['Sofia ostab pühapäeval ravimit. Mis lõigus on apteegi aeg?', '2|teises'], ['Viktor tuleb autoga. Mis lõigus on parkla?', '5|viiendas'], ['Kus on WC? Mis lõigus see on kirjas?', '6|kuuendas'], ['Mitu korrust on keskuses? Mis lõigus see on?', '1|esimeses'], ['Sofia tahab süüa lõunat. Mis lõigus on kohvikud?', '4|neljandas']]), { task: 'R14' }),
      B.examListen('024_p_plan', 'Sofia ja Viktor teevad plaani.', 'Kuula Sofia ja Viktori vestlust kaks korda. Kas lause on õige või vale?', 'truefalse', [
        'Viktor: Sofia, mul on teeninduskeskuses aeg kell pool kaks. Mida me enne teeme?',
        'Sofia: Kõigepealt läheme apteeki. Apteek on esimesel korrusel ja avatud kella üheksast.',
        'Viktor: Hea. Mul on arsti retsept. Siis tahan Helgile paki saata.',
        'Sofia: Postkontor on teisel korrusel. Aga kella ühest kaheni on seal lõuna.',
        'Viktor: Siis läheme postkontorisse enne ühte. Kas teeninduskeskus on ka teisel korrusel?',
        'Sofia: Jah, lifti kõrval. Ära unusta vana ID-kaarti ja fotot!',
        'Viktor: Foto on mul taskus. Pärast sööme lõunat. Mina maksan!',
        'Sofia: Aitäh, onu! Kolmanda korruse kohvikus on päevapraad kuus eurot.',
        'Viktor: Väga hea. Kas sa tuled pärast minuga ka turule?',
        'Sofia: Kahjuks ei saa. Kell neli ootab mind Grete.',
      ], [
        ['Viktori aeg teeninduskeskuses on kell pool kaks.', true], ['Apteek on avatud kella kümnest.', false], ['Viktoril on apteegi jaoks retsept.', true], ['Postkontor on esimesel korrusel.', false],
        ['Nad lähevad postkontorisse enne kella ühte.', true], ['Teeninduskeskus asub lifti kõrval.', true], ['Viktoril ei ole fotot kaasas.', false], ['Lõuna eest maksab Sofia.', false],
      ]),
      B.wordorder('024_p_order', 'Pane teade kokku.', 'Kirjuta keskuse teated: pane sõnad õigesse järjekorda.', ['Toidupood on täna avatud kella kümneni.', 'Teeninduskeskus on nädalavahetusel suletud.', 'Pakiautomaadid on keskuse ees ja parkla poolt.', 'Lastetuba on avatud kella kümnest seitsmeni.', 'Apteek asub esimesel korrusel lifti kõrval.', 'Pühapäeval on raamatukogu terve päeva kinni.', 'Kohvikus saab lõunat süüa kella kolmeni.', 'Bussipeatus on keskuse peaukse ees.'], 'full'),
      B.translation('024_p_tr', 'Tõlgi silt.', 'Kirjuta sildi tekst eesti keeles.', ['Открыто с девяти до пяти.', 'В субботу закрыто.', 'Обед с часу до двух.', 'Вход со стороны парковки.', 'Касса на втором этаже.', 'Вернусь через десять минут.', 'Аптека открыта каждый день.', 'Парковка три часа бесплатно.'], 'full', 'g_notice'),
      teach(tag(B.rolecards('024_p_roles', 'Teeninduskeskuses on probleem.', 'A on Viktor, B on teenindaja. Lahendage probleem ja leppige kokku uus aeg.',
        'Sa oled Viktor. Sinu aeg on kell 13.30, aga nüüd on kell 13.45. Postkontoris on pikk järjekord. Selgita ja küsi uut aega veel täna.',
        'Sa töötad teeninduskeskuses. Tänased ajad on täis. Paku uut aega: esmaspäeval kell 10 või neljapäeval kell 18. Ütle, mida kaasa võtta.',
        ['Vabandage, minu aeg on kell pool kaks.', 'Kas täna on veel vaba aega?', 'Neljapäev sobib mulle.'], ['Kahjuks on täna kõik ajad täis.', 'Kas esmaspäev kell kümme sobib?', 'Võtke kaasa vana dokument ja foto.']), { task: 'S10' }),
        'Üks-ühele: õpetaja on teenindaja ja ütleb alguses „Täna ei saa”; õpilane on Viktor, selgitab probleemi ja lepib kokku uue aja. Siis vahetage: õpilane on teenindaja.'),
      B.examWriting('024_p_invite', 'Kutse kohvikusse.', 'Kutsu oma kaaslased kohvikusse Pann. Kirjuta kõigist neljast punktist.', 'kutse', {
        situation: 'Moodul on läbi. Järgmisel neljapäeval pärast tundi läheb grupp Jaani kohvikusse.',
        points: ['kus kohvik asub', 'mis päeval ja mis kell te kohtute', 'mis kell kohvik kinni läheb', 'mida seal teha või süüa'],
        words: [30, 50], opening: 'Tere, Lucía, Dmitri ja Tom!', closing: 'Sofia',
      }),
    ],
    transfer: [
      B.text('024_t_sit', 'Mooduli projekt: kohtume kohvikus', 'Neljapäeval pärast tundi läheb grupp Jaani kohvikusse Pann. Tom jääb keelekooli, sest administraator Ene aitab teda arvega. Jaan kirjutab, kuidas kohvikusse saab: „Sõitke Hobujaamast trammiga 1 või 3 Kadrioru poole. Väljuge viimases peatuses. Minge üle tee ja pöörake paremale. Kohvik on apteegi kõrval, pargi vastas. Sissepääs on hoovist. Kohvik on avatud kella neljani, köök kella kolmeni.” Vaata ka pilti: Sofia ja Viktor loevad silti.'),
      tag(B.listening('024_t_tom', 'Tomi häälsõnum.', 'Tom jätab Sofiale sõnumi. Kuula kaks korda ja tee endale märkmed.', [
        'Tom: Tere, Sofia! Siin Tom.',
        'Tom: Ma olen veel keelekoolis. Ene aitab mind arvega, see võtab natuke aega.',
        'Tom: Ma tulen kohvikusse hiljem, umbes kell üks. Palun öelge Jaanile, et ma tulen kindlasti.',
        'Tom: Aga ma ei tea, kus kohvik Pann asub. Ma ei tunne Kadriorgu, ma elan Lasnamäel.',
        'Tom: Mul on ainult ühiskaart, autot ei ole. Kas ma saan sinna trammiga?',
        'Tom: Ja mis peatuses ma pean väljuma? Ma ei taha jälle eksida.',
        'Tom: Mis kell kohvik kinni läheb? Ma tahan ka lõunat süüa, ma olen väga näljane.',
        'Tom: Kas kohvikus on ka midagi ilma piimata? Sa tead, mul on piimaallergia. Jaan teab seda kindlasti, ta on hea kokk.',
        'Tom: Minu telefon on peaaegu tühi. Palun kirjuta mulle e-kiri, ma loen seda keelekoolis arvutist.',
        'Tom: Ma loen seda umbes kell pool üks, enne kui ma keelekoolist välja lähen.',
        'Tom: Ja kui grupp istub kohvikus väljas, siis kirjuta ka see, ma võtan jope kaasa.',
        'Tom: Aitäh ja kohtumiseni!',
      ], ['Tom on praegu [keelekoolis].', 'Ene aitab Tomi [arvega].', 'Tom tuleb kohvikusse umbes kell [üks|1|13].', 'Tom ei tunne [Kadriorgu].', 'Tom tahab sõita [trammiga].', 'Tom tahab teada, mis [peatuses] väljuda.', 'Tomil on [piimaallergia|allergia].', 'Tom palub kirjutada [e-kirja|kirja].']), { task: 'L07' }),
      teach(tag(B.rolecards('024_t_call', 'Tom helistab.', 'A on Tom, B on kohvikus. Tehke kõne kaks korda, teine kord kiiremini.',
        'Sa oled Tom. Kell on 12.50, sa oled Kadrioru peatuses, aga ei näe kohvikut. Ütle, mida sa näed. Küsi teed, sissepääsu ja köögi aega. Kontrolli kaks korda.',
        'Sa oled kohvikus. Küsi, kus Tom on ja mida ta näeb. Juhata: üle tee, paremale, apteegi kõrval, pargi vastas, sissepääs hoovist. Köök on avatud kella kolmeni.',
        ['Ma olen … peatuses.', 'Ma näen parki ja …', 'Kas üle tee ja siis paremale?'], ['Kus sa praegu oled?', 'Mine üle tee ja pööra …', 'Kohvik on … kõrval. Tule hoovist!']), { task: 'S04', fluency: true }),
        'Üks-ühele: õpetaja on Tom ja helistab peatusest; õpilane küsib, mida Tom näeb, ja juhatab. Teist korda tehakse kõne kiiremini ja õpetaja on teises kohas (pargi juures).'),
      teach(tag(B.speaking('024_t_say', 'Kodus: minu lemmikkohvik.', 'Salvesta 45–60 sekundit: kus on sinu lemmikkohvik ja millal see avatud on?', ['Mis kohvik see on ja kus see asub?', 'Kuidas sinna saab?', 'Mis kell see on avatud?', 'Mida sa seal tavaliselt sööd või jood?', 'Miks see sulle meeldib?'], [45, 60], ['Minu lemmikkohvik on …', 'See on avatud kella …st …ni.', 'Sinna saab …']), { task: 'S15', level: 3 }),
        'Kodune monoloog. Tunnis kuulab õpetaja salvestuse ja küsib kaks küsimust („Kas see on pühapäeval avatud?”, „Mis seal maksab?”).'),
      tag(B.examWriting('024_t_letter', 'Kiri Tomile.', 'Kirjuta Tomile 50–70-sõnaline kiri. Kirjuta kõigist neljast punktist.', 'kiri', {
        situation: 'Tomi telefon on peaaegu tühi. Ta palub: „Kirjuta mulle e-kiri, siis ma loen selle arvutist.”',
        points: ['mis trammiga sõita ja kus väljuda', 'kuidas peatusest kohvikusse saab', 'mis kell kohvik ja köök on avatud', 'kus grupp kohvikus istub'],
        words: [50, 70], opening: 'Tere, Tom!', closing: 'Kohtumiseni! Sofia',
      }), { main: true }),
      tag(B.writing('024_t_edit', 'Kiri puhtalt.', 'Loe kiri hindamise ridadega läbi. Paranda ajad ja käsud ning kirjuta puhtalt.', [5, 7], ['kella', 'pööra', 'peatuses'], 2), { task: 'W10' }),
      B.rubric('024_t_rubric', 'Mooduli projekt: hindamine.', 'Õpetaja hindab: iga rida 0–2 punkti.', ['Kirjas on kõik neli punkti (50–70 sõna), tervitus ja lõpp.', 'Ajad on õiged: kella kaheksast neljani, köök kella kolmeni.', 'Telefonis juhatab õpilane 4–5 sammuga ja vastab Tomi küsimustele.', 'Salvestus on arusaadav ja kestab 45–60 sekundit.']),
      B.selfcheck('024_t_self', ['Ma saan aru teadaannetest ja automaatvastajast.', 'Ma ütlen: kella üheksast viieni, esmaspäevast reedeni.', 'Ma juhatan sõpra telefonis.', 'Ma kirjutan sõbrale kirja teejuhise ja ajaga.'], 'Moodul 5: linn, kohad ja tee'),
    ],
  },

  'a2-025': {
    title: 'Kontroll 5 — linn ja tee',
    assessment: true,
    canDo: 'Ma näitan kontrollis, et oskan nimetada kohti linnas, küsida ja juhatada teed, anda juhiseid käskivas kõneviisis ja lugeda silte ning lahtiolekuaegu (vähemalt 70%).',
    discover: [
      B.text('025_d_situation', 'Kordame', 'Enne kontrolli kordame mooduli tähtsamat: kohad linnas, tee küsimine ja juhatamine, käskiv kõneviis, sildid ja lahtiolekuajad.'),
      B.notice('025_d_notice', 'Mooduli kokkuvõte', ['Kohad: **apteegis – apteeki – apteegist, raamatukokku, postkontorisse**', 'Tee: **Vabandage, kuidas ma saan …? Kas see on kaugel?**', 'Juhis: **mine / minge otse, pööra / pöörake vasakule, üle silla**', 'Keeld: **ära mine! ärge oodake!**', 'Ajad: **E–R 9–18 = esmaspäevast reedeni kella üheksast kuueni**']),
      B.vocab('025_d_vocab', 'Mooduli sõnad.', ['linn — город', 'koht — место', 'tänav — улица', 'peatus — остановка', 'pood — магазин', 'jaam — вокзал / станция', 'sõitma — ехать', 'pöörama — поворачивать', 'avatud — открыто', 'suletud — закрыто']),
      B.reading('025_d_read', 'Loe: Viktori laupäev.', 'Lugege teksti Viktori laupäevast ja vastake küsimustele.', 'Viktor kesklinnas',
        'Laupäeval sõitis Viktor trammiga kesklinna. Kõigepealt läks ta panka, aga pank oli suletud. Uksel oli silt: „L–P suletud”. Siis kasutas ta sularahaautomaati. Pangast läks ta postkontorisse ja saatis pojale paki. Postkontor oli avatud kella kaheni. Siis tahtis ta minna muuseumi, aga ei leidnud seda. Ta küsis teed noorelt naiselt. Naine ütles, et tuleb minna otse kuni väljakuni. Seal tuleb pöörata vasakule. Muuseum on kiriku vastas. Viktor küsis, kas see on kaugel. Naine vastas, et jalgsi on see viis minutit. Muuseumis oli Viktor kaks tundi. Õhtul istus ta kesklinnas trammile ja sõitis koju.',
        [['Millega sõitis Viktor kesklinna?', 'trammiga'], ['Miks ei saanud Viktor panka minna?', 'pank oli suletud|laupäeval suletud'], ['Mida Viktor postkontoris tegi?', 'saatis pojale paki|saatis paki'], ['Kus tuli vasakule pöörata?', 'väljakul|väljaku juures'], ['Kus asub muuseum?', 'kiriku vastas']]),
      B.manymatch('025_d_match', 'Kus seda tehakse?', 'Ühenda tegevus ja koht.', ['ostan ravimit', 'saadan paki', 'laenan raamatu', 'ootan rongi', 'lõikan juukseid'], ['apteegis', 'postkontoris', 'raamatukogus', 'jaamas', 'juuksuris']),
      B.wordforms('025_d_forms', 'Käsud.', 'Kirjuta käsk küsitud vormis.', [['minema', 'sina', 'mine'], ['pöörama', 'teie', 'pöörake'], ['ootama', 'sina, eitus', 'ära oota'], ['võtma', 'teie', 'võtke'], ['tulema', 'teie, eitus', 'ärge tulge'], ['vaatama', 'sina', 'vaata']]),
      B.transformation('025_d_trans', 'Küsi teed.', 'Kirjuta viisakas küsimus.', [['Tahan minna apteeki.', 'Vabandage, kuidas ma …?', 'Vabandage, kuidas ma saan apteeki?'], ['Postkontor?', 'Vabandage, kus …?', 'Vabandage, kus asub postkontor?|Vabandage, kus on postkontor?'], ['Pikk tee?', 'Kas see …?', 'Kas see on kaugel?'], ['Ei kuulnud.', 'Palun …', 'Palun korrake!'], ['Mis kell avatakse?', 'Mis kell pank …?', 'Mis kell pank avatakse?|Mis kell pank avatud on?']]),
      B.errorfix('025_d_fix', 'Paranda viga.', 'Leidke igas lauses viga ja kirjutage lause õigesti.', [['Ma lähen apteegis.', 'Ma lähen apteeki.'], ['Ära minge sinna! (sõbrale)', 'Ära mine sinna!'], ['Pank on avatud kella üheksa.', 'Pank on avatud kella üheksast.|Pank on avatud kella üheksani.'], ['Pöörage paremale!', 'Pöörake paremale!'], ['Minge üle sild.', 'Minge üle silla.']]),
      B.translation('025_d_tr', 'Tõlgi eesti keelde.', 'Tõlkige laused vene keelest eesti keelde.', ['Извините, где находится вокзал?', 'Идите прямо и поверните налево.', 'Не ждите меня!', 'Аптека открыта до восьми.', 'Я иду на почту.']),
      B.categorize('025_d_sort', 'Mis rühma?', 'Pane sõnad õigesse rühma.', [['koht', ['apteek', 'postkontor', 'raamatukogu', 'jaam']], ['suund', ['otse', 'paremale', 'vasakule', 'tagasi']], ['silt', ['avatud', 'suletud', 'sissepääs', 'keelatud']]]),
      B.gaps('025_d_gaps', 'Kordame vorme.', 'Pange sulgudes olev sõna lauses õigesse vormi.', ['Ma lähen [postkontorisse]. (postkontor)', 'Ma tulen [raamatukogust]. (raamatukogu)', '[Pööra] ristmikul paremale! (pöörama, sina)', '[Oodake] siin! (ootama, teie)', 'Pood on avatud kella [kümneni]. (kümme)', 'Minge üle [silla]! (sild)']),
      B.listening('025_d_listen', 'Kuulamine. Tee muuseumi.', 'Õpetaja loeb juhise kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Tulge trammist välja väljaku peatuses.', 'Minge otse kuni kirikuni.', 'Kiriku juures pöörake paremale.', 'Minge üle silla.', 'Muuseum on silla taga, raamatukogu kõrval.',
      ], ['Väljuge [väljaku] peatuses.', 'Minge otse kuni [kirikuni].', 'Kiriku juures pöörake [paremale].', 'Minge üle [silla].', 'Muuseum on [raamatukogu] kõrval.']),
      B.dictation('025_d_dict', 'Etteütlus.', 'Õpetaja loeb viis lauset. Kirjutage need vihikusse.', ['Vabandage, kuidas ma saan jaama?', 'Minge otse ja pöörake vasakule.', 'Ära oota mind!', 'Pank on laupäeval suletud.', 'Ma lähen postkontorisse.'], 5),
      B.wordorder('025_d_order', 'Pane lause kokku.', 'Pange Viktori loo sõnad õigesse järjekorda.', ['Viktor sõitis trammiga kesklinna.', 'Pangast läks ta postkontorisse.', 'Muuseum on kiriku vastas.', 'Õhtul sõitis ta koju.']),
      B.speaking('025_d_say', 'Proovieksam: minu linn.', 'Vastake paarilise küsimustele oma linna kohta, nagu eksamil.', ['Mis kohad on teie kodu lähedal?', 'Kuidas te kesklinna saate?', 'Kuidas teie juurde tulla?', 'Mis kell on teie lähim pood avatud?'], [45, 90]),
      B.writing('025_d_write', 'Kordame kirjutamist.', 'Kirjuta 7–9 lauset: tee sinu kodust lähimasse poodi.', [7, 9], ['mine', 'pööra', 'otse', 'avatud'], 3),
    ],
    practice: [
      B.tip('025_p_how', 'Kontroll: lugemine, kuulamine, keel (eksami vormis)', 'See leht on nagu Harno A2 eksami lugemine ja kuulamine. Tee kõik ilma abita. Kuulamisteksti loeb õpetaja kaks korda. Eesmärk on vähemalt 70%.', 'full'),
      tag(B.choice('025_p_signs', 'Lugemine 1. Sildid.', 'Lugege silti. Valige, mida see tähendab.', [
        ['„TÕMMAKE”', 'Võtke uksest kinni ja tõmmake enda poole.', 'Lükake uks eemale.', 'Uks on suletud.'], ['„E–R 9–17, L–P suletud”', 'Laupäeval ei saa sisse.', 'Laupäeval on avatud kella üheksast.', 'Esmaspäeval on suletud.'],
        ['„Sissepääs hoovist”', 'Uks on maja taga.', 'Hoovis on keelatud.', 'Hoovis on parkla.'], ['„Pühapäeval tasuta”', 'Pühapäeval ei pea piletit ostma.', 'Pühapäeval on suletud.', 'Pühapäeval on pilet kallim.'],
      ]), { harno: 'R3' }),
      B.reading('025_p_read', 'Lugemine 2. Teade.', 'Lugege raamatukogu teadet ja vastake küsimustele.', 'Raamatukogu kolib!',
        'Head lugejad! Linnaraamatukogu kolib uude majja. Vana raamatukogu Kooli tänaval on viimast päeva avatud 30. septembril. Uus raamatukogu avatakse 7. oktoobril. Uus maja asub kesklinnas, Turu väljakul, panga ja apteegi vahel. Bussiga saab sinna liinidega 5 ja 7, peatus on „Turu”. Uus raamatukogu on avatud E–R 10–19 ja L 10–16. Pühapäev on puhkepäev. Raamatuid saab 1.–6. oktoobrini tagastada automaati, mis on vana maja ukse kõrval. Esimesel korrusel on lastetuba ja kohvik. Teisel korrusel on lugemissaal. Lift on sissepääsu kõrval. Maja taga on jalgrataste parkla. Autoga tulles parkige Turu väljaku parklas, esimene tund on tasuta. Avamispäeval, 7. oktoobril, on raamatukogus pidu. Kell kaksteist räägib lastele muinasjutte kirjanik. Kõigile on kohvi ja kooki. Uues majas on ka arvutiklass, kus saab tasuta internetti kasutada. Tulge vaatama! Teie linnaraamatukogu',
        [['Millal avatakse uus raamatukogu?', '7. oktoobril|seitsmendal oktoobril'], ['Kus asub uus raamatukogu?', 'Turu väljakul|kesklinnas, Turu väljakul|panga ja apteegi vahel'], ['Mis bussiga sinna saab?', '5 ja 7|liinidega 5 ja 7'], ['Kas raamatukogu on pühapäeval avatud?', 'ei|ei, pühapäev on puhkepäev'], ['Kus on lugemissaal?', 'teisel korrusel']]),
      B.truefalse('025_p_tf', 'Lugemine 2b. Õige või vale?', 'Loe teadet uuesti.', [['Vana raamatukogu on Kooli tänaval.', true], ['Uus raamatukogu on pühapäeval avatud.', false], ['Raamatuid saab tagastada automaati.', true], ['Lugemissaal on esimesel korrusel.', false], ['Avamispäeval on raamatukogus pidu.', true]]),
      B.cloze('025_p_cloze', 'Lugemine 3. Sõnum.', 'Lugege Liisi sõnumit ja valige igasse lünka sobiv sõna.', 'Tere, Kati!', [
        'Homme lähen ma uude {*raamatukokku|raamatukogus|raamatukogust}. Kas sa tuled kaasa? Sõida bussiga number viis ja {*välju|väljud|väljuma} „Turu” peatuses.',
        'Raamatukogu on panga ja {*apteegi|apteek|apteeki} vahel. Ma ootan sind {*sissepääsu|sissepääs|sissepääsus} juures kell neli.',
        '{*Ära|Ärge|Ei} unusta oma raamatukogu kaarti! Kohvik on {*esimesel|esimene|esimeseks} korrusel. Liis',
      ]),
      B.listening('025_p_listen', 'Kuulamine 1. Tee jaama.', 'Olga küsib tänaval teed. Kuulake kaks korda ja kirjutage lünka 1–2 sõna.', [
        'Olga: Vabandage, kuidas ma saan jaama?', 'Mees: Jaama? See on üsna kaugel, jalgsi kakskümmend minutit.', 'Mees: Parem sõitke trammiga number neli.',
        'Olga: Kus on trammipeatus?', 'Mees: Minge otse ja esimesel ristmikul pöörake vasakule. Peatus on apteegi ees.', 'Olga: Kas peatus on kaugel?', 'Mees: Ei, kaks minutit.',
      ], ['Jalgsi on jaama [kakskümmend|20] minutit.', 'Olga peab sõitma trammiga number [neli|4].', 'Esimesel ristmikul tuleb pöörata [vasakule].', 'Peatus on [apteegi] ees.', 'Peatuseni on [kaks|2] minutit.']),
      tag(B.examListen('025_p_listen2', 'Kuulamine 2. Teadaanded.', 'Kuulake nelja lühikest teadaannet kaks korda. Valige igale küsimusele õige vastus.', 'choice', [
        'Teade üks. Postkontor on täna avatud kella kolmeni.', 'Teade kaks. Kaubanduskeskuse peasissepääs on remondis. Kasutage sissepääsu parkla poolt.',
        'Teade kolm. Tramm number kolm ei sõida täna vanalinna. Istuge väljakul ümber bussile.', 'Teade neli. Muuseum on esmaspäeval suletud.',
      ], [
        ['Mis kellani on postkontor täna avatud?', 'kella kolmeni', 'kella kaheni', 'kella kuueni'],
        ['Kust saab täna kaubanduskeskusesse sisse?', 'parkla poolt', 'peauksest', 'hoovist'],
        ['Kuhu tramm number kolm täna ei sõida?', 'vanalinna', 'väljakule', 'jaama'],
        ['Kus tuleb bussile ümber istuda?', 'väljakul', 'vanalinnas', 'muuseumi juures'],
        ['Millal on muuseum suletud?', 'esmaspäeval', 'pühapäeval', 'täna õhtul'],
      ]), { harno: 'L1' }),
      B.gaps('025_p_mix', 'Keel 1. Viis punkti.', 'Kirjutage kohanimi sulgudest õiges kohavormis.', ['Ma lähen [apteeki]. (apteek)', 'Me tuleme [pangast]. (pank)', 'Pakk on [postkontoris]. (postkontor)', 'Laps on [raamatukogus]. (raamatukogu)', 'Rong väljub [jaamast] kell kaks. (jaam)']),
      B.wordforms('025_p_mix2', 'Keel 2. Veel viis punkti.', 'Kirjuta käsk küsitud vormis.', [['minema', 'teie', 'minge'], ['pöörama', 'sina', 'pööra'], ['ootama', 'teie, eitus', 'ärge oodake'], ['ostma', 'sina', 'osta'], ['unustama', 'sina, eitus', 'ära unusta']]),
      B.wordorder('025_p_order', 'Keel 3. Pane lause kokku.', 'Pange raamatukogu teate sõnad õigesse järjekorda.', ['Uus raamatukogu asub Turu väljakul.', 'Esimesel ristmikul pöörake vasakule.', 'Peatus on apteegi ees.', 'Pühapäev on puhkepäev.']),
      B.errorfix('025_p_fix', 'Keel 4. Paranda viga.', 'Igas lauses on üks viga. Kirjutage lause parandatult.', [['Kuidas ma saan jaamas?', 'Kuidas ma saan jaama?'], ['Ärge oota mind! (võõrale)', 'Ärge oodake mind!'], ['Pood on avatud kella kümme.', 'Pood on avatud kella kümneni.'], ['Mine üle sild!', 'Mine üle silla!']]),
      B.translation('025_p_tr', 'Keel 5. Tõlgi eesti keelde.', 'Tõlkige silt või lause eesti keelde.', ['Где ближайшая аптека?', 'Поверните направо.', 'В воскресенье закрыто.', 'Не забудь билет!']),
      B.dictation('025_p_dict', 'Keel 6. Etteütlus.', 'Kuulake õpetajat ja kirjutage viis lauset täpselt üles.', ['Raamatukogu on avatud kella seitsmeni.', 'Pöörake teisel ristmikul paremale.', 'Ärge unustage piletit!', 'Pank on apteegi kõrval.', 'Ma lähen jaama.'], 5),
      B.speaking('025_p_say', 'Rääkimine. Küsi teed.', 'Küsi õpetajalt teed. Täpsusta kaks korda.', ['Küsi teed jaama.', 'Küsi, kas see on kaugel.', 'Küsi, mis trammiga sõita.', 'Täna ja jäta hüvasti.'], [45, 75]),
      B.writing('025_p_write', 'Kirjutamine. Sõnum.', 'Kirjuta Liisile 6–8 lauset: kas sa tuled raamatukokku ja millal.', [6, 8], ['raamatukokku', 'kell', 'peatus'], 2),
    ],
    transfer: [
      B.text('025_t_situation', 'Kontroll: kirjutamine ja rääkimine', 'Sinu sõber tuleb esimest korda sinu linna. Kirjuta talle tee jaamast sinu koju, kirjelda pilti ja aita teda telefonis. Õpetaja hindab, eesmärk on vähemalt 70%.'),
      B.listening('025_t_listen', 'Kuulamine. Sõbra küsimused.', 'Jaan jätab teile häälsõnumi. Kuulake kaks korda, kirjutage lünka 1–2 sõna.', [
        'Tere! Siin Jaan.', 'Ma jõuan reedel rongiga, kell pool seitse õhtul.', 'Mul on kaasas jalgratas.', 'Kas ma saan jalgrattaga sinu juurde sõita?',
        'Ja kas lähedal on pood? Ma tahan osta lilli.', 'Mis kell pood kinni läheb?',
      ], ['Jaan jõuab [reedel].', 'Ta jõuab kell pool [seitse|7].', 'Jaanil on kaasas [jalgratas].', 'Jaan tahab poest osta [lilli].']),
      B.table('025_t_route', 'Kirjutamine 1. Tee plaan.', 'Kirjuta 5–6 sammu jaamast sinu koju.', 'samm, mida teha?, mis seal on?', ['1 | | ', '2 | | ', '3 | | ', '4 | | ', '5 | | ']),
      B.planning('025_t_plan', 'Enne kirjutamist.', 'Kirjuta märksõnad: mida sa Jaanile kirjutad.', ['Kuidas jaamast välja tulla?', 'Kus pöörata ja mis on teel?', 'Kus on pood ja millal see on avatud?'], 2),
      B.letter('025_t_letter', 'Kirjutamine 2. Juhend sõbrale.', 'Kirjuta Jaanile 40–60 sõna: tee jaamast sinu koju ja poe lahtiolekuaeg.', 'Tere, Jaan!', 'Kohtumiseni!', [40, 60]),
      B.gaps('025_t_check', 'Kontrolli juhendit.', 'Kirjuta sulgudes olev sõna käskivas vormis (sina).', ['Jaamast [sõida] otse kuni ristmikuni. (sõitma)', 'Ristmikul [pööra] vasakule. (pöörama)', '[Ära sõida] üle silla! (sõitma, eitus)', 'Kiriku juures [vaata] paremale. (vaatama)', 'Pood on avatud kella seitsmeni, [tule] enne seda. (tulema)', 'Kui eksid, [helista] mulle! (helistama)']),
      B.dictation('025_t_dict', 'Etteütlus.', 'Kuula ja kirjuta juhised.', ['Sõida jaamast otse.', 'Ristmikul pööra vasakule.', 'Ära sõida üle silla.', 'Minu maja on kiriku vastas.', 'Pood on avatud kella seitsmeni.'], 5),
      tag(B.examWriting('025_t_write', 'Kirjutamine 3. Visiitkaardi järgi.', 'Lugege visiitkaarti. Kirjutage raamatukogust tekst, vähemalt 25 sõna. Vastake kõigile neljale küsimusele.', 'teade', {
        situation: 'Visiitkaart: Linnaraamatukogu · Turu väljak 3, Tallinn (panga ja apteegi vahel) · avatud E–R 10–19, L 10–16 · tel 640 1234 · info@linnaraamatukogu.ee',
        points: ['mis asutus see on', 'kus see asub', 'millal see on avatud', 'kuidas saab ühendust võtta'],
        words: [25, 40],
      }), { harno: 'W1' }),
      tag(B.speaking('025_t_voice', 'Rääkimine 1. Pilt ja küsimused.', 'Vaadake pilti ja kirjeldage seda. Siis vastake õpetaja küsimustele.', ['Kes on pildil ja kus nad on?', 'Mida Anna Markusele näitab?', 'Kuidas jõuda teie kodust lähimasse bussipeatusesse?', 'Kas te küsite linnas teed või vaatate kaarti? Miks?'], [60, 90]), { task: 'S06', harno: 'S1' }),
      B.rolecards('025_t_roles', 'Rääkimine 2. Dialoog.', 'Jaan helistab ja on eksinud. Aidake teda.', 'Sa oled Jaan. Sa oled eksinud. Ütle, mis sinu ümber on. Küsi teed, täpsusta kaks korda.', 'Sa ootad Jaani kodus. Küsi, kus ta on. Juhata teed: mine, pööra, ära sõida.', ['Ma olen eksinud.', 'Ma näen kirikut.', 'Kas paremale?'], ['Mis sinu ümber on?', 'Mine tagasi …', 'Pööra …']),
      B.reading('025_t_reply', 'Lugemine. Jaani vastus.', 'Loe Jaani sõnumit ja vasta küsimustele.', 'Ma olen kohal!',
        'Tere! Aitäh juhendi eest! Kõik oli väga selge. Jaamast sõitsin ma jalgrattaga otse kuni ristmikuni. Seal pöörasin vasakule, nagu sa kirjutasid. Siis nägin ma parki ja kirikut. Kiriku juures ma eksisin, sest seal on kaks tänavat. Ma küsisin teed ühelt naiselt. Ta ütles, et pean sõitma paremale, mööda jõge. Jõe ääres oli väga ilus. Seal jalutasid inimesed koertega. Pood oli sinu maja kõrval, aga see oli juba suletud. Uksel oli silt: avatud E–L 9–19. Lilli ma osta ei saanud. Vabandust! Ma ootan sind praegu sinu maja ees, pingil. Tule välja! Jaan',
        [['Millega sõitis Jaan jaamast?', 'jalgrattaga'], ['Kus Jaan pööras vasakule?', 'ristmikul'], ['Kus Jaan eksis?', 'kiriku juures'], ['Miks Jaan lilli ei ostnud?', 'pood oli suletud|pood oli juba suletud'], ['Kus Jaan praegu ootab?', 'maja ees, pingil|maja ees|pingil']]),
      B.errorfix('025_t_fix', 'Kontrolli lauseid.', 'Jaani juhendis on neli viga. Kirjutage laused õigesti.', [['Jaamast mine paremal.', 'Jaamast mine paremale.'], ['Pood on avatud kella üheksa.', 'Pood on avatud kella üheksani.'], ['Minu maja on kirik vastas.', 'Minu maja on kiriku vastas.'], ['Ära sõitke üle silla! (sõbrale)', 'Ära sõida üle silla!']]),
      B.rubric('025_t_rubric', 'Hindamise tingimused.', 'Õpetaja hindab: iga rida 0–2 punkti. Kokku 70% = kontroll on sooritatud.', ['Tee plaanis on 5–6 selget sammu.', 'Kirjas on tee, poe aeg, tervitus ja lõpp (40–60 sõna).', 'Käsud ja kohavormid on õiged.', 'Pildi kirjeldus ja vastused on arusaadavad ja täpsed.', 'Dialoogis küsib ja täpsustab õpilane.']),
      B.selfcheck('025_t_self', ['Ma kirjutan tee juhendi 5–6 sammuga.', 'Ma kirjeldan pilti ja vastan küsimustele.', 'Ma juhatan sõpra telefonis.', 'Ma loen sõbra vastust.'], 'Moodul 5 on läbitud'),
    ],
  },
};

// ---------------------------------------------------------------- the v6 lessons
const P021 = {
  goal: 'õppija ütleb, kuhu ta linnas läheb ja mida seal teeb (lähen apteeki rohtu ostma), ja küsitleb kolme kaaslast.',
  core: 'Mäletad? (3) → sõnad (5) → Irina nädal (8) → Märka (4) → Proovi kohe (5) → lüngad (5) → terved laused (6) → hääldusnurk (5) → Toomase nädal paaris (6) → küsitlus (8) → väljumine (2) → kodutöö ja enesekontroll (3).',
  short: 'Mäletad? → Irina nädal → Märka → lüngad → Toomase nädal → küsitlus → väljumine; terved laused ja hääldusnurk koju (Harjuta).',
  alt: 'küsitluse asemel „Meie rühma linnakaart”: iga õppija kirjutab tahvlile ühe koha ja ühe tegevuse (lähen … -ma), rühm loeb kaardi ette.',
  extra: 'kuhu lähevad inimesed õppija kodumaal laupäeval (turule, kirikusse, sauna) — kolm lauset -ma-vormiga.',
  errors: ['„lähen apteegis” → lähen apteeki (kuhu?)', '„lähen osta” → lähen ostma (liikumine + -ma; vene „иду купить”)', '„saadama” → saatma (ma saadan, aga saatma)'],
};
const P022 = {
  goal: 'õppija küsib teed, saab aru juhisest telefonis ja juhatab teed (otse, paremale, kuni ristmikuni, üle silla).',
  core: 'Mäletad? (3) → sõnad (4) → KÜLM ÜLESANNE „Proovi kohe” ilma abita, õpetaja paneb kirja 3 märget (4) → Lena kõne 2× (8) → Märka (4) → lüngad (5) → paranda juhis (5) → hääldusnurk (5) → „Arva koht” paaris (5) → kaart A / B (10) → väljumine (2) → kodutöö ja enesekontroll (3).',
  short: 'Proovi kohe → Lena kõne → Märka → lüngad → kaart A / B → väljumine; paranda juhis ja hääldusnurk koju.',
  alt: 'kaardi asemel päris tee: õppija juhatab telefonis õpetajat koolimaja uksest lähima peatuseni, õpetaja „kõnnib” paberkaardil.',
  extra: 'kuidas küsitakse teed õppija kodulinnas — kas inimesed juhatavad tänaval? Kolm lauset eesti keeles.',
  errors: ['„kuni ristmik” → kuni ristmikuni', '„pööra paremal” → pööra paremale (kuhu?)', '„üle sild” → üle silla (mille?)', '„ristmikus” → ristmikul'],
};
const P023 = {
  goal: 'õppija annab juhiseid käskivas kõneviisis (vali, vajuta, ära unusta; valige, vajutage, ärge unustage) ja juhatab kaaslast telefonis jaamast kooli.',
  core: 'Mäletad? (3) → sõnad (4) → linna infoleht (8) → Märka (4) → Proovi kohe (4) → lüngad (5) → sina → teie (5) → etteütlus ja välted (6) → automaat paaris (5) → kõne jaamast VARJATUD INFOGA (10) → väljumine (2) → kodutöö ja enesekontroll (4).',
  short: 'infoleht → Märka → lüngad → automaat paaris → kõne jaamast → väljumine; sina → teie ja etteütlus koju (Harjuta).',
  alt: 'kõne asemel „Giid”: õppija juhatab õpetajat (turist, teie-vorm) pildi järgi automaadi juurest trammi.',
  extra: 'kuidas osta piletit õppija kodulinnas — kolm käsku sina-vormis ja kolm teie-vormis.',
  errors: ['„Ära unustage!” → Ärge unustage! (teie)', '„Minke” → Minge, „Tulke” → Tulge', '„Vajutage” võõrale, aga sõbrale „Vajuta”', '„Osta pilet!” võõrale → Ostke pilet!'],
};
const P024 = {
  goal: 'õppija saab aru lahtiolekuaegadest, ütleb kella …st kella …ni ja esmaspäevast reedeni ning planeerib kaaslasega laupäeva käigud — ilma valmis fraasideta.',
  core: 'Mäletad? (3) → sõnad (4) → automaatvastaja 2× (8) → Märka (4) → Proovi kohe (4) → lüngad (5) → silt → lause (6) → hääldusnurk: varjutamine (5) → juuksurisse broneerimine (5) → laupäeva järjekord pildi järgi (10) → väljumine ilma märkmeteta (2) → kodutöö ja enesekontroll (4).',
  short: 'automaatvastaja → Märka → lüngad → laupäeva järjekord → väljumine; silt → lause ja hääldusnurk koju.',
  alt: 'laupäeva järjekorra asemel päris nädal: õppija vaatab telefonis oma lähima poe ja raamatukogu lahtiolekuaja ja planeerib oma laupäeva.',
  extra: 'millal on poed avatud õppija kodumaal — kas pühapäeval on poed lahti? Võrdle Eestiga.',
  errors: ['„kella üheksa kuni kuus” → kella üheksast kuueni', '„esmaspäevast reedeni” — kaks lõppu: -st ja -ni', '„laupäeval on kinnine” → laupäeval on kinni / suletud'],
};
const P025 = {
  goal: 'kontroll 5: neli oskust 10 punkti, toorpunktid, Harno skaala ja lävendid; võrdlus kontrolliga 4.',
  core: 'kuidas punkte loetakse (2) → lugemine 1–2 (14) → kuulamine 1–2 (10) → kirjutamine (10) → rääkimine üks-ühele (5) → tulemus (4).',
  short: 'kui aega on 35 minutit: lugemine, kuulamine ja kirjutamine tunnis, rääkimine järgmise tunni alguses (5 min).',
  alt: 'rühmas: rääkimine paaris, õpetaja hindab kahte õppijat korraga sama juhendi järgi.',
  extra: 'õppija vaatab oma kahte nõrgemat rida juhendis ja kirjutab, mida ta Harjutas kordab.',
  errors: ['kuulamisel kirjutatakse terve lause — piisab 1–2 sõnast', 'kirjutamisel puudub üks neljast punktist'],
};

export const LESSONS = withShapes({
  // ---------------------------------------------------------------- 021 reading: where and why in town
  'a2-021': retire(V4['a2-021'], {
    title: 'Kuhu ja miks?',
    canDo: 'Ma räägin, kuhu ma linnas lähen ja mida seal teen (lähen apteeki rohtu ostma), ja küsitlen kolme kaaslast nende nädala kohta.',
    teacherPage: P021,
    discover: [
      teach(B.review('021_d_review', [['Mis on sinu maja kõrval? Mis on maja vastas?', 'a2-019'], ['Mis kell on sinu pood avatud? Millal on see kinni?', 'a2-012'], 'Kuhu sa täna pärast tundi lähed?']), planNote(P021)),
      tag(v6(B.vocab('021_d_vocab', 'Tunni sõnad.', ['apteek — аптека', 'postkontor — почта', 'pank — банк', 'kino — кино', 'muuseum — музей', 'juuksur — парикмахер', 'rohi — лекарство', 'pakk — посылка', 'saatma — отправлять', 'kesklinn — центр города']),
        { review: ['raamatukogu', 'avatud', 'nädalavahetus'] }), { topic: ['apteek', 'ujula', 'laenama'] }),
      teach(tag(B.reading('021_d_list', 'Irina nädal linnas.', 'Loe Irina nädalast. Vasta ühe-kolme sõnaga.', 'Minu nädal linnas',
        'Tere! Mina olen Irina. Ma elan Tallinnas, Mustamäel. Minu nädal on alati kiire.\n\nEsmaspäeval lähen ma pärast tööd postkontorisse pakki saatma. Pakk läheb minu emale Narva.\n\nTeisipäeval lähen ma raamatukokku raamatuid laenama. Raamatukogu on avatud kella seitsmeni.\n\nKolmapäeval sõidan ma bussiga panka uut kaarti tooma. Neljapäeval lähen ma ujulasse ujuma. Ujula on meie maja vastas.\n\nReedel lähen ma apteeki rohtu ostma, sest minu poeg on haige.\n\nNädalavahetusel läheme me kogu perega kinno filmi vaatama. Pärast kino läheme kohvikusse sööma. Pühapäeva õhtul olen ma kodus ja puhkan.',
        [['Kuhu läheb Irina esmaspäeval?', 'postkontorisse'], ['Kellele pakk läheb?', 'emale|tema emale|emale Narva'], ['Mida Irina raamatukogus teeb?', 'laenab raamatuid|laenab'], ['Kus on ujula?', 'maja vastas|meie maja vastas'], ['Miks Irina apteeki läheb?', 'poeg on haige|sest poeg on haige'], ['Kuhu läheb pere nädalavahetusel?', 'kinno|kinno ja kohvikusse'], ['Mida pere pärast kino teeb?', 'läheb kohvikusse sööma|sööb kohvikus|läheb kohvikusse']]), { task: 'R13' }),
      'Lugemisstrateegia (üks lause enne lugemist): „Vaata kõigepealt nädalapäevi.” Üks-ühele: õpilane ütleb enne lugemist, kuhu tema arvates Irina nädalas läheb; pärast lugemist kontrollib ja vastab. Lõpus küsi: „Kas sinu nädal on sarnane?” Vanad sõnad (raamatukogu, avatud, nädalavahetus) tulevad tekstis tagasi — küsi need üle.'),
      B.notice('021_d_notice', 'Märka: kuhu ja mida tegema?', [
        'Leia tekstist: Ma lähen **postkontorisse** pakki **saatma**.',
        'Liikumine (minema, tulema, sõitma) + kuhu? + mida tegema? (-ma):',
        'lähen **apteeki** rohtu **ostma** · lähen **ujulasse** **ujuma**',
        'lähen **raamatukokku** raamatuid **laenama** · lähen **kinno** filmi **vaatama**',
        'lähen kohvikusse **sööma** · sõidan panka raha võtma',
        'ma ostan → **ostma** · ma saadan → **saatma** (d → t) · ma söön → **sööma**',
        'Aga: ma tahan osta (tahtma + -da). Liikumise järel on -ma: lähen ostma.',
        'Vene keeles „иду купить” — eesti keeles lähen ostma (-ma, mitte -da).',
      ], 'full'),
      teach(tag(B.rolecards('021_d_toomas', 'Proovi kohe: Toomase nädal.', 'A vaatab päevi E–K, B päevi N–L. Rääkige ja kirjutage.',
        'Vaata pilti, ainult päevi E, T ja K (kata teine pool). Ütle iga päeva kohta üks lause: kuhu Toomas läheb ja mida tegema (Esmaspäeval läheb Toomas postkontorisse pakki saatma). Siis küsi B-lt päevi N, R ja L ja kirjuta vastused üles.',
        'Vaata pilti, ainult päevi N, R ja L (kata teine pool). Kuula ja kirjuta A vastused. Siis ütle oma päevade kohta: kuhu Toomas läheb ja mida tegema. Lõpus vaadake koos kogu pilti ja kontrollige.',
        ['Esmaspäeval läheb Toomas …', 'Kuhu ta neljapäeval läheb?'], ['Neljapäeval läheb ta …', 'Mida ta seal teeb?']), { task: 'S06' }),
      'Üks-ühele: õpetaja vaatab päevi N–L, õpilane E–K; siis vahetage. Pildil on koht ja asi algvormis (postkontor + pakk), nii et õpilane peab ise tegema kuhu-vormi ja -ma: E postkontorisse pakki saatma, T panka raha võtma, K juuksurisse juukseid lõikama, N ujulasse ujuma, R apteeki rohtu ostma, L kinno filmi vaatama.'),
    ],
    practice: [
      tag(B.gaps('021_p_gaps', 'Kuhu ja mida tegema?', 'Kirjuta koht ja tegevus õiges vormis.', [
        'Mul on vaja rohtu. Ma lähen [apteeki] rohtu [ostma]. (apteek; ma ostan)',
        'Neljapäeval läheb Toomas [ujulasse] [ujuma]. (ujula; ma ujun)',
        'Kas sa tuled homme [raamatukokku|raamatukogusse] raamatuid [laenama]? (raamatukogu; ma laenan)',
        'Laupäeval läheme [kinno] uut filmi [vaatama]. (kino; ma vaatan)',
      ], '', 'half'), { task: 'G03' }),
      teach(tag(v6(B.choice('021_p_pron', 'Hääldusnurk: pikk ja lühike.', 'Kuula õpetajat ja vali sõna. Siis varjuta üks lause.', [
        ['Sõna 1', 'linna', 'lina'],
        ['Sõna 2', 'kino', 'kinno'],
        ['Sõna 3', 'saada', 'sada'],
        ['Sõna 4', 'kolli', 'koli'],
        ['Sõna 5', 'kotti', 'koti'],
        ['Sõna 6', 'tulle', 'tule'],
      ], 'half', 'g_listen'), { pronunciation: 'välted' }), { task: 'L01' }),
      'Hääldusnurk, 5 min. Kõigepealt ütle koos õpilasega kolm pikkust: sada (100) – saada (ma tahan raha saada) – saada (saada mulle kiri!, ülipikk). Siis ütle igast reast võtmes oleva sõna (linna, kino, saada, kolli, kotti, tulle); õpilane valib. Lõpuks varjutamine: loe „Ma lähen postkontorisse pakki saatma.”, õpilane räägib kohe kaasa, kaks korda. Paranda ainult pikkust: saatma pika aa-ga.'),
      teach(why(B.transformation('021_p_trans', 'Kuhu ja miks?', 'Kirjuta üks terve lause: kuhu ja mida tegema.', [
        ['Ma tahan pakki saata. (postkontor)', 'Ma lähen …', 'Ma lähen postkontorisse pakki saatma.'],
        ['Ma tahan süüa. (kohvik)', 'Ma lähen …', 'Ma lähen kohvikusse sööma.'],
        ['Ta tahab raha võtta. (pank)', 'Ta läheb …', 'Ta läheb panka raha võtma.'],
        ['Me tahame kala osta. (turg)', 'Me läheme …', 'Me läheme turule kala ostma.'],
        ['Nad tahavad filmi vaadata. (kino)', 'Nad lähevad …', 'Nad lähevad kinno filmi vaatama.'],
        ['Sa tahad ajalehti lugeda. (raamatukogu)', 'Sa lähed …', 'Sa lähed raamatukokku ajalehti lugema.|Sa lähed raamatukogusse ajalehti lugema.'],
      ]), [
        'postkontor → postkontorisse; saata → saatma.',
        'kohvik → kohvikusse; süüa → sööma.',
        'pank → panka (lühike vorm); võtta → võtma.',
        'turg → turule (peal); osta → ostma.',
        'kino → kinno; vaadata → vaatama.',
        'raamatukogu → raamatukokku; lugeda → lugema.',
      ]), 'Üks-ühele: õpilane kirjutab ja loeb lause ette; õpetaja küsib iga lause järel „Ja sina? Kuhu sina lähed …?” ja õpilane ütleb oma lause.'),
      teach(tag(B.table('021_p_week', 'Minu nädal: kirjuta ja räägi.', 'Kirjuta oma nädal. Siis räägi paarilisele.', 'Päev, Kuhu? (koht), Mida tegema? (-ma)', [
        'esmaspäev |  | ',
        'teisipäev |  | ',
        'kolmapäev |  | ',
        'neljapäev |  | ',
        'reede |  | ',
        'laupäev |  | ',
        'pühapäev |  | ',
      ], 'g_use'), { task: 'S02', level: 3, fluency: true }),
      'Üks-ühele: õpilane kirjutab igale päevale koha ja tegevuse, siis räägib oma nädala õpetajale kaks korda, teisel korral kiiremini ja ilma tabelit vaatamata (sujuvus). Õpetaja räägib oma nädala ja õpilane küsib: „Kuhu sa reedel lähed?” Paranda ainult kahte asja: kuhu-vorm (apteeki, kinno) ja -ma (ostma, mitte osta).'),
    ],
    transfer: [
      B.text('021_t_sit', 'Olukord: meie rühma linnakaart', 'Teie rühm teeb linnakaardi: kuhu me linnas läheme ja miks? Täna küsitled kolme kaaslast. Kirjuta nende vastused tabelisse: nimi, koht, tegevus. Lõpus ütled rühmale, mis koht on teie rühmas kõige populaarsem. Kodus kirjutad oma nädalast.'),
      teach(tag(v6(B.table('021_t_survey', 'Küsitlus: kuhu sa linnas lähed?', 'Küsi kolmelt kaaslaselt. Kirjuta vastused lühidalt tabelisse.', 'Küsimus, Kaaslane 1, Kaaslane 2, Kaaslane 3', [
        'Nimi |  |  | ',
        'Kuhu sa sel nädalal lähed? |  |  | ',
        'Mida sa seal teed? |  |  | ',
        'Kuhu sa lähed, kui sul on vaja raha või rohtu? |  |  | ',
        'Mis koht on sinu kodu lähedal? |  |  | ',
        'Kuhu sa nädalavahetusel lähed ja miks? |  |  | ',
        'Mis koht sulle linnas kõige rohkem meeldib? |  |  | ',
        'Kuidas sa sinna sõidad? |  |  | ',
        'Kellega sa sinna lähed? |  |  | ',
      ], 'g_use'), {
        taskType: 'survey', realAddressee: 'kolm kaaslast',
        support: ['Kuhu sa … lähed?', 'Ma lähen … (kuhu?) … (mida tegema?), sest …', 'Kolm inimest lähevad …'],
        stretch: 'Küsi igalt kaaslaselt ka „Miks?” ja ütle lõpus üks erinevus kaaslaste vahel.',
      }), { task: 'S09', main: true, level: 4 }),
      'Üks-ühele: õpetaja vastab kolm korda kolme inimese nimel (kaardilt: üliõpilane, pensionär, ema kahe lapsega); õpilane küsib ja kirjutab vastused üles. Abikaart: kui õpilane jääb vait, näita kolme lausealgust (märgi, et seda kasutati). Lisaväljakutse: küsi „Miks?” ja võrdle.'),
      homeTask(teach(tag(v6(B.writing('021_t_home', 'Kodus: minu nädal linnas.', 'Kirjuta 4–6 lauset. Siis Harjuta → moodul 5 (10 min).', [4, 6], ['lähen', 'sest'], 1), { lines: 12 }), { task: 'W06' }),
        'Kodutöö: 4–6 lauset (25–45 sõna), iga päev üks koht ja üks tegevus (-ma). Harjuta → moodul 5: sõnad ja vormid. Järgmise tunni „Mäletad?” küsib seda.')),
      half(exitCheck(tag(B.speaking('021_t_exit', 'Väljumine: meie rühma linn.', 'Ütle 30 sekundiga, kuhu kaaslased lähevad ja miks.', [
        'Kuhu läheb kõige rohkem inimesi?',
        'Mida nad seal teevad?',
      ], [30, 45]), { task: 'S16', level: 3, fluency: true }))),
      half(teach(selfcheck('021_t_self', ['Ma ütlen koha kuhu-vormis: apteeki, kinno, ujulasse.', 'Ma ütlen tegevuse -ma-vormis: ostma, saatma, ujuma.', 'Ma küsitlen kolme kaaslast ja ütlen tulemuse.'], 'Tund 21 on läbitud'), 'Üks-ühele: õpilane hindab end kolmel real; õpetaja ütleb oma hinde samale reale ja võrdlete. Õpilane kirjutab ühe oma lause tõendiks.')),
    ],
  }),

  // ---------------------------------------------------------------- 022 listening: asking and giving the way
  'a2-022': retire(V4['a2-022'], {
    title: 'Kuidas ma sinna saan?',
    canDo: 'Ma küsin teed, saan aru teejuhisest telefonis ja juhatan teed (otse, paremale, kuni ristmikuni, üle silla).',
    teacherPage: P022,
    discover: [
      teach(B.review('022_d_review', [['Kuhu sa sel nädalal lähed ja mida seal teed?', 'a2-021'], ['Mis kell sa hommikul kodust välja lähed?', 'a2-011'], 'Kuidas sa täna tundi tulid? Mis on sinu kodu lähedal?']), planNote(P022)),
      tag(v6(B.vocab('022_d_vocab', 'Tunni sõnad.', ['otse — прямо', 'paremale — направо', 'vasakule — налево', 'ristmik — перекрёсток', 'nurk — угол', 'sild — мост', 'kirik — церковь', 'pöörama — поворачивать', 'kaugel — далеко', 'jalgsi — пешком'], '3'),
        { review: ['kõrval', 'vastas', 'lähedal'] }), { topic: ['vasakule', 'ristmik', 'valgusfoor'] }),
      teach(tag(B.speaking('022_d_say', 'Proovi kohe: juhata teed.', 'Juhata õpetajat klassist lähima poeni. Ilma abita.', [
        'Kust sa alustad?',
        'Kuhu ta läheb: otse, paremale või vasakule?',
        'Mis on teel? Mis on poe kõrval või vastas?',
      ], [45, 60]), { task: 'S13', level: 3 }),
      'MOODULI KÜLM ÜLESANNE (2–3 min, enne kuulamist ja reeglit): õpilane juhatab ilma abita, õpetaja ei aita ega paranda. Pane kirja kolm märget: mitu sammu, kas suunad on õiged (paremale, vasakule), kas on kuni …-ni või üle …. Kontrolli 5 rääkimise 1. ülesanne on selle paralleel (uus tee, samad kriteeriumid) — võrdle.'),
      half(twice(teach(tag(B.listening('022_d_way', 'Lena helistab Martinile.', 'Kuula kaks korda. Kirjuta lünka üks-kaks sõna.', [
        'Lena: Tere, Martin! Ma olen bussist väljas, Kase peatuses. Kuidas ma raamatukokku saan?',
        'Martin: Tere! See ei ole kaugel, jalgsi viis minutit.',
        'Martin: Mine kõigepealt otse kuni valgusfoorini.',
        'Lena: Kuni valgusfoorini. Ja siis?',
        'Martin: Valgusfoori juures pööra paremale.',
        'Martin: Siis mine üle silla.',
        'Lena: Üle silla. Kas raamatukogu on silla lähedal?',
        'Martin: Jah. Pärast silda on ristmik. Ristmikul pööra vasakule.',
        'Martin: Raamatukogu on kiriku vastas. See on suur hall maja.',
        'Lena: Kiriku vastas. Selge! Kus sa mind ootad?',
        'Martin: Ma ootan sind raamatukogu ees, pingil.',
        'Lena: Aitäh! Ma tulen kohe.',
      ], ['Lena on [Kase] peatuses.', 'Raamatukokku on jalgsi [viis|5] minutit.', 'Kõigepealt läheb Lena otse kuni [valgusfoorini].', 'Valgusfoori juures pöörab ta [paremale].', 'Siis läheb ta üle [silla].', 'Ristmikul pöörab ta [vasakule].', 'Raamatukogu on [kiriku] vastas.', 'Martin ootab raamatukogu ees, [pingil].']), { task: 'L04' }),
      'Kuulamisstrateegia (enne esimest kuulamist): „Ennusta: mis sõnad tulevad? (otse, paremale …)” Esimesel korral kirjutab õpilane ainult suunad, teisel korral kohad. Vanad sõnad: lähedal, vastas.'))),
      B.notice('022_d_notice', 'Märka: kuidas juhatada teed?', [
        'Suund: mine **otse**, pööra **paremale** või **vasakule**',
        'Kuni kuhu? -ni: kuni **valgusfoorini**, kuni **ristmikuni**, kuni **kirikuni**',
        'Üle + mille?: mine üle **silla**, üle **tee**',
        'Kus pöörata? **ristmikul**, valgusfoori **juures**',
        'Vene keeles „до перекрёстка” — eesti keeles üks sõna: ristmikuni.',
      ], 'half'),
    ],
    practice: [
      tag(B.gaps('022_p_gaps', 'Juhata teed.', 'Kirjuta sulgudes olev sõna õiges vormis. Nool on suund.', [
        'Mine otse kuni [ristmikuni]. (ristmik)',
        '[Ristmikul] pööra [paremale]. (ristmik; →)',
        'Siis mine üle [silla]. (sild)',
        'Kõnni kuni [kirikuni] ja pööra [vasakule]. (kirik; ←)',
        'Sõida kuni [valgusfoorini]. (valgusfoor)',
        'Kohvik on [kiriku] juures. (kirik)',
      ], '', 'half'), { task: 'G08' }),
      teach(tag(v6(B.choice('022_p_pron', 'Hääldusnurk: õ, ä, ö, ü.', 'Kuula õpetajat ja vali sõna. Siis loe read paarilisele.', [
        ['Sõna 1', 'sõda', 'süda', 'sööda'],
        ['Sõna 2', 'käel', 'keel'],
        ['Sõna 3', 'pööra', 'püüa'],
        ['Sõna 4', 'üle', 'õle'],
      ], 'half', 'g_listen'), { pronunciation: 'vokaalid' }), { task: 'G13' }),
      'Hääldusnurk, 5 min. Näita suu kuju: õ — huuled laiad, keel taga; ö ja ü — huuled ümarad; ä — suu lahti. Ütle igast reast võtmes oleva sõna (sõda, käel, pööra, üle); õpilane valib. Siis loeb õpilane kõik read paarilisele ja varjutab kaks korda: „Valgusfoori juures pööra paremale.” Vene keelt kõnelejal: õ ei ole „ы”, ä on lahtisem kui „э”.'),
      teach(why(B.errorfix('022_p_fix', 'Paranda juhis.', 'Igas juhises on üks viga. Kirjuta lause õigesti.', [
        ['Mine otse kuni ristmik.', 'Mine otse kuni ristmikuni.'],
        ['Pööra paremal.', 'Pööra paremale.'],
        ['Mine üle sild.', 'Mine üle silla.'],
        ['Ristmikus pööra vasakule.', 'Ristmikul pööra vasakule.'],
        ['Kool on kirik vastas.', 'Kool on kiriku vastas.'],
        ['Kõnni kuni valgusfoorile.', 'Kõnni kuni valgusfoorini.'],
        ['Mine üle tänav.', 'Mine üle tänava.'],
        ['Valgusfoori juures pööra vasakul.', 'Valgusfoori juures pööra vasakule.'],
        ['Apteek on pank kõrval.', 'Apteek on panga kõrval.'],
        ['Mine otse kuni kirikuni ja siis pööra paremal.', 'Mine otse kuni kirikuni ja siis pööra paremale.'],
      ]), [
        'kuni + -ni: ristmikuni.',
        'kuhu? → paremale (-le).',
        'üle + mille?: silla.',
        'ristmik on „peal”: ristmikul.',
        'mille? vastas: kiriku vastas.',
        'kuni + -ni: valgusfoorini.',
        'üle + mille?: tänava.',
        'kuhu? → vasakule (-le).',
        'mille? kõrval: panga kõrval (pank → panga).',
        'kuhu? → paremale (-le).',
      ]), 'Üks-ühele: õpilane parandab ja loeb lause ette; siis ütleb sama lause oma kodutänava kohta.'),
      teach(tag(B.rolecards('022_p_roles', 'Arva koht.', 'A juhatab teed klassist, B arvab: mis koht see on?',
        'Mõtle üks koht kooli lähedal (pood, peatus, apteek, park). Ära ütle nime. Juhata B-d klassist sinna 4–5 sammuga: otse, paremale, kuni …-ni, üle ….',
        'Kuula ja küsi üle, kui sa ei saa aru (Kas paremale? Kas see on kaugel?). Joonista tee vihikusse lihtsa kaardina. Lõpus arva: mis koht see on? Kui arvasid valesti, küsi veel üks küsimus. Siis vahetage: nüüd sina juhatad.',
        ['Mine otse kuni …', 'Siis pööra …'], ['Kas see on kaugel?', 'Kas see on … kõrval?']), { task: 'S07' }),
      'Üks-ühele: õpetaja juhatab, õpilane arvab; siis vastupidi. Õpilane peab kasutama vähemalt üht kuni …-ni ja üht üle ….'),
    ],
    transfer: [
      B.text('022_t_sit', 'Olukord: uus õppija ei tunne linna', 'Teie kursusel on uus õppija. Ta tahab minna linnas eri kohtadesse, aga ei tunne linna. Teil on sama kaart, aga kummalgi on kolm kohta puudu. Alustage alati bussipeatusest. Küsi ja juhata teed, kuni kõik kohad on kaardil. Vaata pilti.'),
      teach(tag(v6(B.rolecards('022_t_map', 'Kaart: kus on apteek?', 'A vaatab kaarti A, B kaarti B. Küsige ja juhatage.',
        'Sinu kaardil on apteek, pank ja kino. Sul puuduvad postkontor, ujula ja raamatukogu. Küsi B-lt teed bussipeatusest sinna ja kirjuta koht oma kaardile. Siis juhata B-d sinu kohtadesse.',
        'Sinu kaardil on postkontor, ujula ja raamatukogu. Sul puuduvad apteek, pank ja kino. Juhata A-d bussipeatusest sinu kohtadesse. Siis küsi A-lt teed ja kirjuta kohad oma kaardile.',
        [], []), {
        taskType: 'infogap',
        support: ['Vabandage, kuidas ma saan … (kuhu?)?', 'Mine otse kuni …, siis pööra …', 'Kas see on … kõrval või vastas?'],
        stretch: 'Juhata teed ilma kaardita ja ütle, mitu minutit see jalgsi võtab.',
      }), { task: 'S05', main: true, level: 4 }),
      'Üks-ühele: õpetaja on B. Lõpus võrdlete kaarte: kas kõik kuus kohta on õigel kohal? Kaart A: apteek ristmiku ja valgusfoori vahel paremal, pank silla taga vasakul, kino kiriku kõrval. Kaart B: postkontor peatuse vastas, ujula pargi kõrval, raamatukogu kiriku vastas. Abikaart: kolm lausealgust, kui õpilane jääb vait (märgi kasutamine). Lisaväljakutse: juhatab ilma kaardita.'),
      homeTask(teach(v6(B.planning('022_t_home', 'Kodus: minu eesti keele võrgustik.', 'Vaata üht eestikeelset lehte. Kirjuta kolm rida. Harjuta → moodul 5.', [
        'Mida sa vaatasid? (nt „Tallinna ühistransport” https://transport.tallinn.ee või oma linna bussiliinide leht)',
        'Üks uus sõna sellelt lehelt:',
        'Üks lause sellest: mis buss või tramm sõidab sinu kodu lähedalt?',
        'Kas sa soovitad seda lehte kaaslasele? Miks?',
      ], 5), { mediaLog: true }),
      'Meediapäevik „Minu eesti keele võrgustik” (mooduli kirje): õppija valib ühe päris eestikeelse lehe või saate ja kirjutab kolm rida. Järgmisel tunnil loeb ta oma lause ette. Harjuta → moodul 5: sõnad ja vormid (10 min).')),
      half(exitCheck(tag(B.speaking('022_t_exit', 'Väljumine: juhata teed.', 'Juhata 30 sekundiga koolist bussipeatuseni. Siis veel kord, kiiremini.', [
        'Kust ta alustab ja kuhu läheb?',
        'Kus ta pöörab?',
        'Mis on peatuse kõrval?',
      ], [20, 40]), { task: 'S08', level: 3, fluency: true }))),
      half(teach(selfcheck('022_t_self', ['Ma ütlen suuna: otse, paremale, vasakule.', 'Ma ütlen: kuni ristmikuni, üle silla.', 'Paariline leiab minu juhise järgi õige koha.'], 'Tund 22 on läbitud'), 'Üks-ühele: õpetaja on paariline, kes leidis (või ei leidnud) koha õpilase juhise järgi; õpilane hindab kolme rida ja kirjutab ühe oma juhise lause.')),
    ],
  }),

  // ---------------------------------------------------------------- 023 reading: the imperative — tickets and instructions
  'a2-023': retire(V4['a2-023'], {
    title: 'Ostke pilet, minge üle tee!',
    canDo: 'Ma annan juhiseid käskivas kõneviisis (vali, vajuta, ära unusta; valige, vajutage), selgitan suuliselt telefonis, kuidas jaamast keelekooli saab, ja kirjutan uuele õppijale juhendi.',
    teacherPage: P023,
    discover: [
      teach(B.review('023_d_review', [['Kuidas sa saad koolist lähima poeni? Juhata.', 'a2-022'], ['Mida sa teed hommikul kõigepealt?', 'a2-011'], 'Kuidas sa ostad bussipiletit?']), planNote(P023)),
      tag(v6(B.vocab('023_d_vocab', 'Tunni sõnad.', ['pilet — билет', 'ühiskaart — проездная карта', 'kaart — карта', 'peatus — остановка', 'tramm — трамвай', 'ekraan — экран', 'valima — выбирать', 'maksma — платить', 'väljuma — выходить', 'unustama — забывать']),
        { review: ['kõigepealt', 'tavaliselt', 'lähedal'] }), { topic: ['ühiskaart', 'automaat', 'kiosk', 'lugeja', 'nupp', 'vajutama'] }),
      teach(tag(B.reading('023_d_read', 'Linna infoleht.', 'Loe linna infolehte. Vasta ühe-kolme sõnaga.', 'Uus linnas? Nii sõidate bussi ja trammiga',
        'Kõigepealt ostke ühiskaart. Kaart maksab kaks eurot. Selle saate osta kioskist või automaadist. Automaat on tavaliselt peatuse lähedal.\n\nAutomaadis valige keel ja vajutage nuppu „Pilet”. Siis valige pilet: üks tund või üks päev. Makske pangakaardiga. Ärge unustage pangakaarti automaati!\n\nTulge bussi eest uksest. Pange ühiskaart kohe lugeja vastu. Lugeja on ukse juures, see on väike hall kast. Ärge sõitke ilma piletita: bussis on tihti kontroll.\n\nKui te ei tea, kus väljuda, küsige juhilt või vaadake ekraani. Ekraanil on järgmise peatuse nimi. Bussist väljuge teisest uksest. Head sõitu!',
        [['Kust saab ühiskaardi osta?', 'kioskist või automaadist|kioskist|automaadist'], ['Kui palju kaart maksab?', 'kaks eurot|2 eurot'], ['Millega te automaadis maksate?', 'pangakaardiga'], ['Mida ei tohi automaati unustada?', 'pangakaarti'], ['Mis uksest te tulete bussi?', 'eest|eest uksest'], ['Kust näete järgmise peatuse nime?', 'ekraanilt|ekraanil']]), { task: 'R15' }),
      'Lugemisstrateegia (üks lause enne lugemist): „Otsi tegusõnu: mida peab tegema?” Üks-ühele: õpilane joonib alla kõik käsud (ostke, valige …) ja ütleb, mitu neid on (13). Siis vastab küsimustele. Vanad sõnad: kõigepealt, tavaliselt, lähedal.'),
      B.notice('023_d_notice', 'Märka: käskiv kõneviis', [
        'Sina (sõbrale): ma vaatan → **vaata**, ma valin → **vali**, ma vajutan → **vajuta**',
        'Teie (võõrale, mitmele): **valige**, **vajutage**, **makske**, **ostke**',
        'Erandid: ma lähen → **mine**, **minge** · ma tulen → **tule**, **tulge**',
        'Eitus: **ära** unusta! · **ärge** unustage!',
        'Vene keeles „не забудь” ja „не забудьте” — eesti keeles ära unusta ja ärge unustage.',
      ], 'full'),
      teach(tag(B.rolecards('023_d_machine', 'Proovi kohe: piletiautomaat.', 'Vaata pilti. A juhendab turisti, teie-vormis. B näitab pildil.',
        'Sa töötad peatuses. Turist ei oska automaati kasutada. Ütle talle pildi järgi viis käsku (Valige keel. Vajutage …). Ütle ka üks „ärge”-lause (Ärge unustage …!).',
        'Sa oled turist. Näita sõrmega pildil, mida sa teed. Kui sa ei saa aru, küsi (Mida ma nüüd vajutan?). Siis vahetage: sina räägid sõbrale sina-vormis.',
        ['Kõigepealt valige …', 'Ärge unustage …!'], ['Mida ma nüüd teen?', 'Kas nii?']), { task: 'S10', level: 3 }),
      'Üks-ühele: õpetaja on turist ja eksib korra (vajutab valet nuppu); õpilane parandab käsuga („Ei, vajutage …”). Siis vahetage: õpetaja juhendab sina-vormis.'),
    ],
    practice: [
      tag(B.gaps('023_p_gaps', 'Sina või teie?', 'Kirjuta käsk. Vaata, kellele sa räägid.', [
        'Sõbrale: [Vali] keel ja [vajuta] „Pilet”. (valima; vajutama)',
        'Turistile: [Valige] keel ja [vajutage] „Pilet”. (valima; vajutama)',
        'Emale: [Mine] eest uksest sisse. (minema)',
        'Turistidele: [Minge] üle tee. (minema)',
        'Lapsele: [Tule] siia ja [ära unusta] kotti! (tulema; unustama)',
      ], '', 'full'), { task: 'G03' }),
      teach((v6(tag(B.dictation('023_p_dict', 'Etteütlus ja hääldus: pikk ja lühike.', 'Kuula, korda ja kirjuta. Märka pikka häälikut.', [
        'Osta pilet automaadist.',
        'Pane kaart kohe lugeja vastu.',
        'Sõida kolm peatust.',
        'Ära unusta oma kotti!',
        'Linna sõidab buss kell kaheksa.',
      ], 5), { task: 'L08' }), { pronunciation: 'välted' })),
      'Hääldusnurk + etteütlus, 6 min. Enne: ütle paarid kott – koti, linna – lina, sada – saada; õpilane kordab ja ütleb, kumb on pikem. Siis loe iga lause kaks korda; õpilane kordab valjusti ja kirjutab. Kontrolli topelttähti: kotti, linna, kaheksa (üks k).'),
      teach(why(B.transformation('023_p_trans', 'Sina → teie.', 'Kirjuta sama käsk võõrale inimesele, teie-vormis.', [
        ['Osta pilet!', 'Teie: …', 'Ostke pilet!'],
        ['Maksa kaardiga!', 'Teie: …', 'Makske kaardiga!'],
        ['Tule eest uksest!', 'Teie: …', 'Tulge eest uksest!'],
        ['Ära unusta kaarti!', 'Teie: …', 'Ärge unustage kaarti!'],
        ['Vaata ekraani!', 'Teie: …', 'Vaadake ekraani!'],
        ['Mine järgmises peatuses välja!', 'Teie: …', 'Minge järgmises peatuses välja!'],
      ]), [
        'osta → ostke (-ke).',
        'maksa → makske.',
        'tule → tulge (-ge).',
        'ära → ärge, unusta → unustage.',
        'vaata → vaadake.',
        'mine → minge.',
      ]), 'Üks-ühele: õpilane kirjutab ja loeb käsud ette viisaka häälega; õpetaja on turist ja teeb käsu järgi.'),
      teach(tag(B.speaking('023_p_try', 'Juhend sõbrale.', 'Ütle sõbrale kolme käsuga, kuidas automaadist piletit osta.', [
        'Mida ta teeb kõigepealt?',
        'Mida ta siis valib ja vajutab?',
        'Mida ta ei tohi unustada?',
      ], [45, 60], ['Kõigepealt vali …', 'Siis vajuta …', 'Ära unusta …!']), { task: 'S02', level: 3, fluency: true }),
      'Üks-ühele: õpilane juhendab õpetajat (sina-vorm), õpetaja „vajutab” paberil. Siis teeb sama teie-vormis, nagu turistile.'),
    ],
    transfer: [
      B.text('023_t_sit', 'Olukord: kaaslane helistab jaamast', 'Sinu kursusekaaslane tuleb esimest korda keelekooli. Ta tuleb rongiga Balti jaama ja helistab sulle. Keelekool on Narva maanteel, Hobujaama peatuse lähedal. Juhata teda telefonis: kust osta pilet, mis trammiga sõita, kus väljuda ja kuidas kooli leida. Kõik ei lähe nii, nagu plaanisite.'),
      teach(tag(v6(B.phoneCards('023_t_call', 'Kaaslane helistab jaamast.', 'A on jaamas ja helistab, B juhatab. Siis vahetage.',
        'Kaaslane on Balti jaamas. Keelekool on Narva maantee 7, Hobujaama peatuse lähedal.',
        ['Kaaslane jaamas', ['Ütle, kus sa oled.', 'Küsi, kust osta pilet.', 'Küsi, mis trammiga sõita ja kus väljuda.', 'Küsi, kuidas peatusest kooli saab.', 'Korda juhis lõpus üle.']],
        ['Sina juhatad', ['Ütle, kust pilet osta: automaat või kiosk.', 'Trammid 1 ja 2 sõidavad Hobujaama.', 'Ütle, kus väljuda.', 'Peatusest: üle tee, siis vasakule, maja number 7.', 'Palu tal juhis üle korrata.']], [60, 150]), {
        taskType: 'phone', hiddenInfo: true,
        support: ['Osta pilet … (kust?).', 'Sõida trammiga … ja välju …', 'Mine üle tee ja pööra …'],
        stretch: 'Kaaslasel on suur kohver: paku teist teed (takso või buss) ja ütle, miks.',
      }), { task: 'S04', main: true, level: 4 }),
      'Üks-ühele: õpetaja on kaaslane jaamas. Varjatud info (ütle alles siis, kui õpilane on juhise andnud): automaat on katki ja tramm 2 täna ei sõida (teetööd). Õpilane peab kohanduma: pilet kioskist või telefonist, ainult tramm 1. Kui õpilane ei kontrolli („Kas sa said aru?”), küsi ise „Kas tramm 2?” ja vaata, kas ta parandab. Lõpus kordab õpilane kogu juhise. Siis vahetage: õpilane on jaamas, õpetaja juhatab ja teeb ühe vea, mida õpilane küsib üle.'),
      homeTask(teach(tag(B.examWriting('023_t_home', 'Kodus: juhend uuele õppijale.', 'Kirjuta juhend 30–45 sõnaga. Siis Harjuta → moodul 5.', 'teade', {
        situation: 'Teie kursusele tuleb uus õppija. Kirjuta talle sina-vormis, kuidas tulla jaamast keelekooli. Pane juhend kursuse vestlusesse.',
        points: ['kust osta pilet', 'mis bussi või trammiga sõita', 'kus väljuda ja kuhu minna', 'mida ei tohi unustada'],
        words: [30, 45], opening: 'Tere!',
      }), { task: 'W04', main: true }),
      'Kodutöö. Kontrolli 5 kirjutamine on selle paralleel (uus koht, samad neli punkti). Harjuta → moodul 5: käsud (10 min).')),
      half(exitCheck(tag(B.speaking('023_t_exit', 'Väljumine: kolm käsku.', 'Ütle 30 sekundiga juhis: kuidas sinu kodust kesklinna saab.', [
        'Mis bussi või trammiga ta sõidab?',
        'Kus ta väljub ja mida ta ei tohi unustada?',
      ], [20, 40]), { task: 'S16', level: 3, fluency: true }))),
      half(teach(selfcheck('023_t_self', ['Ma annan käsu sina-vormis: vali, vajuta, mine.', 'Ma annan käsu teie-vormis: valige, minge, ärge unustage.', 'Kaaslane jõuab minu juhise järgi kooli.'], 'Tund 23 on läbitud'), 'Üks-ühele: õpetaja ütleb, kas ta „jõudis kooli” õpilase juhise järgi; õpilane hindab kolme rida ja kirjutab ühe oma käsu tõendiks.')),
    ],
  }),

  // ---------------------------------------------------------------- 024 listening: opening hours (the module's last teaching lesson)
  'a2-024': retire(V4['a2-024'], {
    title: 'Millal on avatud?',
    canDo: 'Ma saan kuuldust aru, millal kohad on avatud, räägin kaaslasega laupäeva käikudest ja kirjutan talle ilma abita sõnumi.',
    teacherPage: P024,
    discover: [
      teach(B.review('024_d_review', [['Ütle kolm käsku: kuidas osta piletit?', 'a2-023'], ['Mis kell sinu tööpäev algab ja lõpeb?', 'a2-012'], 'Mis kell on sinu lähim pood avatud?']), planNote(P024)),
      tag(v6(B.vocab('024_d_vocab', 'Tunni sõnad.', ['lahti — открыто', 'avama — открывать', 'sulgema — закрывать', 'suletud — закрыто', 'puhkepäev — выходной', 'tööpäev — рабочий день', 'lõuna — обед', 'järjekord — очередь', 'kassa — касса', 'kuni — до'], '3'),
        { review: ['avatud', 'kinni', 'nädalavahetus'] }), { topic: ['lahtiolekuaeg', 'lõunapaus', 'teeninduskeskus', 'broneerima', 'tööpäeviti'] }),
      twice(teach(tag(B.listening('024_d_hours', 'Teeninduskeskuse automaatvastaja.', 'Kuula automaatvastajat kaks korda. Kirjuta lünka üks-kaks sõna.', [
        'Automaat: Tere! Te helistasite Kase teeninduskeskusesse.',
        'Automaat: Meie postkontor on avatud esmaspäevast reedeni kella üheksast kuueni.',
        'Automaat: Laupäeval on postkontor avatud kella kümnest kaheni. Pühapäeval on postkontor kinni.',
        'Automaat: Lõunapaus on iga päev kella ühest kaheni.',
        'Automaat: Juuksur töötab teisipäevast laupäevani kella kümnest seitsmeni. Aja saab broneerida telefonis.',
        'Automaat: Pank on avatud ainult tööpäeviti, kella kümnest viieni. Nädalavahetusel on pank suletud.',
        'Automaat: Apteek on avatud iga päev kella kaheksast kümneni õhtul.',
        'Automaat: Raamatukogu on avatud teisipäevast laupäevani kella üheteistkümnest kuueni.',
        'Automaat: Teeninduskeskus asub Kase tänaval, bussipeatuse vastas.',
        'Automaat: Kui teil on küsimusi, helistage tööpäeviti kella üheksast neljani. Aitäh!',
      ], ['Postkontor on avatud esmaspäevast [reedeni].', 'Tööpäeval sulgub postkontor kell [kuus|6|18].', 'Laupäeval on postkontor avatud kella kümnest [kaheni|kella kaheni|14-ni].', 'Pühapäeval on postkontor [kinni|suletud].', 'Lõunapaus on kella ühest [kaheni|kella kaheni].', 'Juuksur töötab teisipäevast [laupäevani].', 'Juuksurisse saab aja broneerida [telefonis|telefoni teel].', 'Pank on avatud ainult [tööpäeviti|tööpäeval].']), { task: 'L06' }),
      'Kuulamisstrateegia (enne esimest kuulamist): „Ennusta: mis numbrid ja päevad tulevad?” Esimesel korral kirjutab õpilane ainult numbrid, teisel korral sõnad. Vanad sõnad: avatud, kinni, nädalavahetusel.')),
      B.notice('024_d_notice', 'Märka: mis kellast mis kellani?', [
        'Mis kellast? -st: kella **üheksast**, kella **kümnest**, kella **ühest**',
        'Mis kellani? -ni: kella **kuueni**, kella **kaheni**, kella **seitsmeni**',
        'Mis päevast mis päevani? **esmaspäevast** **reedeni**, **teisipäevast** **laupäevani**',
        '**tööpäeviti** = esmaspäevast reedeni',
        'Vene keeles „с девяти до шести” — eesti keeles kella üheksast kuueni.',
      ], 'half'),
      half(teach(tag(B.speaking('024_d_ask', 'Proovi kohe: küsi aega.', 'Küsi paariliselt kolm küsimust. Vasta ka ise.', [
        'Mis kellast mis kellani sa töötad või õpid?',
        'Millal on sinu lähim pood avatud?',
        'Mis päeval on sinu raamatukogu kinni?',
      ], [45, 60]), { task: 'S01', level: 3, fluency: true }),
      'Üks-ühele, ilma valmis fraasideta (mooduli viimane tund): õpilane küsib, õpetaja vastab; siis vastupidi, teisel korral kiiremini. Paranda ainult -st / -ni: kella üheksast kuueni.')),
    ],
    practice: [
      teach(half(tag(B.table('024_p_rule', 'Leia reegel: mis kellast mis kellani?', 'Kirjuta silt sõnadega. Esimene rida on näide.', 'Silt, Mis kellast? / Mis päevast?, Mis kellani? / Mis päevani?', [
        'Postkontor 9–18 | kella üheksast | kella kuueni',
        'Raamatukogu 11–19 | kella [üheteistkümnest] | kella [seitsmeni/üheksateistkümneni]',
        'Juuksur 10–15 | kella [kümnest] | kella [kolmeni/viieteistkümneni]',
        'Lõunapaus 13–14 | kella [ühest/kolmeteistkümnest] | kella [kaheni/neljateistkümneni]',
        'Pank E–R | [esmaspäevast] | [reedeni]',
        'Juuksur T–L | [teisipäevast] | [laupäevani]',
      ], 'g_notice'), { task: 'G02', level: 2 })),
      'Üks-ühele: õpilane täidab tabeli ja ütleb reegli ise: mis kellast? -st, mis kellani? -ni; tüvi on sama mis „mitmes”: kuus → kuueni, kaks → kaheni, seitse → seitsmeni. Siis ütleb ta iga rea terve lausega.'),
      teach(tag(v6(B.choice('024_p_pron', 'Hääldusnurk: kuula, vali ja varjuta.', 'Kuula õpetajat ja vali aeg. Siis räägi lause kaasa.', [
        ['Lause 1', 'kella üheksast kuueni', 'kella üheteistkümnest kuueni', 'kella üheksast kaheni'],
        ['Lause 2', 'kella kümnest kaheni', 'kella kümnest kaheksani', 'kella kahest kümneni'],
        ['Lause 3', 'esmaspäevast reedeni', 'esmaspäevast neljapäevani', 'teisipäevast reedeni'],
        ['Lause 4', 'kella ühest kaheni', 'kella ühest kaheksani', 'kella üheksast kaheni'],
      ], 'half', 'g_listen'), { pronunciation: 'varjutamine' }), { task: 'L10' }),
      'Hääldusnurk, 5 min. Loe automaatvastaja laused võtmes oleva ajaga (Postkontor on avatud kella üheksast kuueni …); õpilane valib aja. Siis loe iga lause uuesti ja õpilane räägib kohe kaasa (varjutamine), kaks korda. Lõpus küsib ta kaks küsimust („Mis kell te avate?”): eesti küsimus läheb lõpus alla, mitte üles nagu vene keeles.'),
      teach(tag(why(B.transformation('024_p_signs2', 'Silt → lause.', 'Loe silti. Kirjuta terve lause.', [
        ['Apteek · E–P 8–22', 'Apteek on …', 'Apteek on iga päev avatud kella kaheksast kümneni.'],
        ['Pank · E–R 10–17', 'Pank on …', 'Pank on avatud tööpäeviti kella kümnest viieni.'],
        ['Ujula · L 9–15', 'Laupäeval on ujula …', 'Laupäeval on ujula avatud kella üheksast kolmeni.'],
        ['Postkontor · P suletud', 'Pühapäeval …', 'Pühapäeval on postkontor kinni.|Pühapäeval on postkontor suletud.'],
        ['Juuksur · T–L 10–19', 'Juuksur töötab …', 'Juuksur töötab teisipäevast laupäevani kella kümnest seitsmeni.'],
        ['Lõuna · 13–14', 'Lõunapaus on …', 'Lõunapaus on kella ühest kaheni.'],
      ]), [
        'E–P = iga päev; 8 → kaheksast, 22 → kümneni (õhtul; ka „kahekümne kaheni” on õige).',
        'E–R = tööpäeviti; 17 → viieni.',
        'L = laupäeval; 15 → kolmeni.',
        'suletud = kinni.',
        'T–L = teisipäevast laupäevani.',
        '13–14 = kella ühest kaheni.',
      ]), { task: 'R07' }), 'Üks-ühele: õpilane kirjutab ja loeb lause ette; õpetaja küsib „Kas see sobib sulle? Millal sa lähed?”.'),
      teach(tag(B.rolecards('024_p_roles', 'Broneeri aeg.', 'A helistab juuksurisse, B vastab kaardi järgi. Siis vahetage.',
        'Sa tahad juuksurisse laupäeval enne kella kahte. Küsi, millal juuksur avatud on ja kas aega on. Lepi aeg kokku ja ütle oma nimi.',
        'Sa töötad juuksuris. Avatud T–R 10–19, L 10–15, P ja E kinni. Laupäeval on vaba ainult kell 10.30 ja kell 14. Paku aega ja küsi nime.',
        [], []), { task: 'S04' }),
      'Üks-ühele: ilma valmis fraasideta. Õpetaja on juuksur; aeg „enne kella kahte” sobib ainult kell 10.30 — õpilane peab küsima ja otsustama. Siis vahetage.'),
    ],
    transfer: [
      B.text('024_t_sit', 'Olukord: laupäev on lühike', 'Laupäeval on sul ja kaaslasel aega neli tundi, kella kümnest kaheni. Teil on vaja käia viies kohas, iga koht võtab umbes pool tundi. Kõik kohad ei ole laupäeval kogu aeg avatud. Vaadake pilti ja otsustage, mis järjekorras te lähete ja mis jääb esmaspäevaks.'),
      teach(tag(v6(B.ideaCard('024_t_route', 'Mis järjekorras me läheme?', 'Vaadake pilti. Pange kohad järjekorda ja põhjendage.',
        'Laupäev, kella 10–14. Te lähete koos jalgsi. Juuksur on kell 12.',
        ['postkontor: pakk ootab', 'juuksur: aeg kell 12', 'pank: uus pangakaart', 'turg: kala ja köögivili', 'raamatukogu: raamatud tagasi'],
        'Mis järjekorras te lähete ja miks? Mis jääb esmaspäevaks?', [60, 150]), {
        taskType: 'ranking',
        support: ['Märksõnad: kõigepealt · siis · pärast seda · lõpuks', 'kella …st kella …ni · kinni · avatud', 'sest · aga · kas sobib?'],
        stretch: 'Turg sulgub täna juba kell 12: tehke uus plaan ja ütle, mis muutus.',
      }), { task: 'S12', main: true, level: 4 }),
      'Üks-ühele, ilma valmis fraasideta: õpetaja on kaaslane ja tahab alguses minna panka (pank on laupäeval kinni — õpilane peab seda pildilt märkama). Õige lahendus: turg (kinni kell 13) ja postkontor (kinni kell 14) enne juuksurit või kohe pärast; raamatukogu avatakse alles kell 11; pank jääb esmaspäevaks. Abikaart on märksõnad, mitte laused (märgi kasutamine). Lisaväljakutse: turg sulgub kell 12.'),
      homeTask(teach(tag(v6(B.examWriting('024_t_msg', 'Kodus: sõnum kaaslasele.', 'Kirjuta kaaslasele 30–45 sõna. Kaaslane vastab. Harjuta → moodul 5.', 'kutse', {
        situation: 'Kutsu kaaslane laupäeval raamatukokku. Vaata enne lehelt „Tallinna Keskraamatukogu” (https://www.keskraamatukogu.ee) või oma linna raamatukogu lehelt, millal raamatukogu laupäeval avatud on. Saada sõnum kursuse vestlusesse.',
        points: ['kuhu te lähete ja miks', 'millal raamatukogu laupäeval avatud on (kella …st kella …ni)', 'kus ja mis kell te kohtute', 'mida kaasa võtta'],
        words: [30, 45],
      }), { lines: 6, peerReply: true, realAddressee: 'kursusekaaslane (kursuse vestlus)' }), { task: 'W03', main: true }),
      'Mooduli viimane tund: ilma antud alguse ja märksõnadeta. Kaaslase vastus (mooduli kaaslase vahetus): kaaslane loeb sõnumi ja vastab ühe küsimusega või „kaks tärni ja üks soov” (kas kõik neli punkti on olemas?). Järgmisel tunnil loeb õppija oma sõnumi ja kaaslase vastuse ette. Lehte avab õppija ise, leht on päris (lehte sisse ei kopeerita). Harjuta → moodul 5 (10 min).')),
      half(exitCheck(tag(B.speaking('024_t_exit', 'Väljumine: meie laupäev.', 'Ütle 30 sekundiga ilma märkmeteta: kuhu ja mis kell te lähete.', [
        'Kuhu te lähete kõigepealt ja mis kell?',
        'Mis jääb esmaspäevaks ja miks?',
      ], [20, 40]), { task: 'S07', level: 4, fluency: true }))),
      half(teach(selfcheck('024_t_self', ['Ma saan aru, millal koht on avatud: kella …st kella …ni.', 'Ma planeerin kaaslasega laupäeva ja põhjendan järjekorda.', 'Ma räägin ja kirjutan ilma valmis fraasideta.'], 'Moodul 5: linn, kohad ja tee'), 'Üks-ühele: õpilane hindab kolme rida, õpetaja ütleb oma hinde; õpilane kirjutab ühe lause oma laupäeva plaanist tõendiks.')),
    ],
  }),

  // ---------------------------------------------------------------- 025 control 5: one sheet, four skills
  'a2-025': retire(V4['a2-025'], {
    title: 'Kontroll 5 — linn ja tee',
    assessment: true,
    phases: checkSheet('Kontroll', 'Lugemine, kuulamine, kirjutamine ja rääkimine, igaüks 10 punkti (45 min)'),
    canDo: 'Ma näitan ilma abita, et loen silte ja kutset, saan aru teejuhisest ja teadaandest, kirjutan teejuhise ja juhatan teed; ma tean oma punkte ja lävendeid.',
    teacherPage: P025,
    discover: [
      teach(B.text('025_d_situation', 'Kontroll 5: kuidas punkte loetakse', `Kontrollis on neli osa, igas 10 punkti, kokku 40. Töötad 45 minutit ilma abita. Harno A2 eksamil on igas osas 20 punkti: korruta oma punktid kahega. ${THRESHOLDS} Lõpus võrdled tulemust kontrolliga 4 (tund 20).`), planNote(P025)),
      teach(tag(B.choice('025_p_signs', 'Lugemine 1. Sildid linnas.', 'Mida silt tähendab? Vali üks vastus. (5 punkti)', [
        ['Silt apteegi uksel: „Avatud E–P 8–22”', 'Apteek on avatud iga päev.', 'Apteek on pühapäeval kinni.', 'Apteek on avatud ainult õhtul.'],
        ['Silt peatuses: „Pilet automaadist või kioskist”', 'Pileti saab osta automaadist.', 'Piletit ei ole vaja.', 'Pileti saab ainult bussijuhilt.'],
        ['Silt pargis: „Tee on suletud. Minge üle silla.”', 'Pargi tee on kinni, tuleb minna üle silla.', 'Sild on kinni.', 'Park on suletud.'],
        ['Silt postkontoris: „Lõuna 13–14”', 'Kella ühest kaheni ei saa pakki saata.', 'Postkontor sulgub kell üks.', 'Lõunat saab süüa postkontoris.'],
        ['Silt trepikojas: „Lift ei tööta. Kasutage treppi.”', 'Tuleb minna trepist.', 'Lift on uus.', 'Trepp on remondis.'],
      ], 'full', 'g_read'), { task: 'R01' }),
      'Varasemast: 5. küsimus (lift, trepp) on moodulist 4. Iga õige vastus 1 punkt.'),
      teach(tag(B.reading('025_d_read', 'Lugemine 2. Kutse.', 'Loe sõbra sõnumit. Vasta ühe-kolme sõnaga. (5 punkti)', 'Tule laupäeval külla!',
        'Tere! Tule laupäeval meile külla, kell neli. Me elame nüüd Kase tänaval, maja number 12, kolmandal korrusel. Meie uus korter on väike, aga väga hele. Lift on, aga see on vana, nii et mine parem trepist.\n\nKuidas siia saada? Sõida kesklinnast bussiga number 5 ja välju Kase peatuses. Sõit kestab umbes kakskümmend minutit. Peatusest mine otse kuni valgusfoorini. Valgusfoori juures pööra vasakule ja mine üle väikese silla. Meie maja on pargi vastas, apteegi kõrval.\n\nKui sa tahad lilli tuua, siis lillepood on peatuse kõrval. See on laupäeval avatud kella kümnest kolmeni, nii et osta lilled enne kolme. Kooki ära too, mina teen koogi ise! Teisi külalisi tuleb ka, kokku oleme kuuekesi.\n\nKui sa eksid, helista mulle: 5123 4567. Ootan sind! Kati',
        [['Mitmendal korrusel Kati elab?', 'kolmandal|kolmandal korrusel|3.'], ['Mis bussiga tuleb sõita?', 'number 5|bussiga number 5|5'], ['Kus tuleb pöörata vasakule?', 'valgusfoori juures|valgusfoori juures'], ['Mis on Kati maja kõrval?', 'apteek'], ['Mis kellani on lillepood laupäeval avatud?', 'kolmeni|kella kolmeni|15-ni']]), { task: 'R15' }),
      'Varasemast: 1. küsimus (mitmendal korrusel) on moodulist 4. Harno-pikkune tekst (≈ 130 sõna).'),
      twice(teach(tag(B.listening('025_p_listen', 'Kuulamine 1. Tee muuseumi.', 'Kuula Pille juhist kaks korda. Kirjuta lünka üks-kaks sõna. (5 punkti)', [
        'Andres: Tere, Pille! Siin Andres. Ma olen trammipeatuses, aga ma ei tea, kuidas muuseumi saada.',
        'Pille: Tere! See on lihtne. Mine otse kuni ristmikuni.',
        'Pille: Ristmikul pööra paremale ja mine mööda tänavat kuni kirikuni.',
        'Pille: Kiriku juures mine üle tee. Muuseum on kiriku vastas, suur valge maja.',
        'Andres: Kas see on kaugel?',
        'Pille: Ei, jalgsi kümme minutit. Muuseum on avatud kella kuueni. Ma ootan sind ukse ees.',
      ], ['Andres on [trammipeatuses].', 'Ristmikul pöörab ta [paremale].', 'Ta läheb kuni [kirikuni].', 'Muuseum on kiriku [vastas].', 'Muuseum on avatud kella [kuueni|kuus|6|18].']), { task: 'L03' }),
      'Varasemast pole (mooduli 5 juhis). Iga õige lünk 1 punkt; kirjaviga ei loe, kui sõna on arusaadav.'), true),
      twice(teach(tag(B.examListen('025_p_listen2', 'Kuulamine 2. Teadaanne keskuses.', 'Kuula kaks korda. Õige või vale? (5 punkti)', 'truefalse', [
        'Teadaanne: Head kliendid! Kase keskus on täna avatud kella kümnest kaheksani.',
        'Teadaanne: Postkontor on teisel korrusel. Täna sulgub postkontor juba kell neli.',
        'Teadaanne: Apteek on esimesel korrusel, panga kõrval. Apteek on avatud kuni kaheksani.',
        'Teadaanne: Juuksur on täna kinni.',
        'Teadaanne: Bussid kesklinna sõidavad keskuse eest iga viieteistkümne minuti järel. Ilusat päeva!',
      ], [
        ['Keskus on täna avatud kella kümnest kaheksani.', true],
        ['Postkontor on esimesel korrusel.', false],
        ['Apteek on panga kõrval.', true],
        ['Juuksur töötab täna kella neljani.', false],
        ['Buss kesklinna sõidab iga viieteistkümne minuti järel.', true],
      ], 'g_listen'), { task: 'L05' }),
      'Varasemast: 2. väide (teisel korrusel) on moodulist 4, 5. väide (iga viieteistkümne minuti järel) moodulist 3.'), true),
      teach(tag(B.examWriting('025_t_write', 'Kirjutamine. Teejuhis sõbrale.', 'Kirjuta sõbrale teejuhis, 25–40 sõna, kõigist neljast punktist. (10 punkti)', 'teade', {
        situation: 'Sõber tuleb rongiga sinu linna ja tahab tulla sinu juurde. Kirjuta talle juhis.',
        points: ['mis bussi või trammiga sõita ja kus väljuda', 'kuidas peatusest sinu majani saab (2–3 sammu)', 'mis on sinu maja lähedal', 'mis kell ta võib tulla ja mida ta ei tohi unustada'],
        words: [25, 40],
      }), { task: 'W04' }),
      'Üks-ühele: õpilane kirjutab üksi, ilma abita. See on tunni 23 kodutöö („Juhend uuele õppijale”) paralleel: sama neli punkti, uus koht. Hinda allpool oleva juhendi järgi (kirjutamise viis rida).'),
      teach(tag(B.speaking('025_t_voice', 'Rääkimine. Juhata teed ja küsi aega.', 'Juhata õpetajat ja küsi kaks küsimust. (10 punkti)', [
        'Juhata õpetajat sinu kodust lähima bussipeatuseni (4–5 sammu).',
        'Mis on sinu kodu lähedal ja mida sa seal teed?',
        'Küsi õpetajalt kaks küsimust: millal tema pood või raamatukogu avatud on.',
      ], [45, 75]), { task: 'S01' }),
      'Üks-ühele: õpetaja on eksamineerija. 1. osa on tunni 22 külma ülesande („Proovi kohe: juhata teed”) paralleel — uus tee, samad kriteeriumid; võrdle oma märkmetega. Ära aita. Varasemast: „mis on kodu lähedal” (moodul 4). Hinda allpool oleva juhendi järgi.'),
      teach(B.table('025_t_route', 'Hindamine: kirjutamine ja rääkimine.', 'Õpetaja annab igale reale 0, 1 või 2 punkti.', 'Hindamisrida (0 / 1 / 2), Punktid', [
        'Kirjutamine, sisu: 2 = kõik neli punkti; 1 = kaks-kolm punkti; 0 = üks punkt või vähem. | ',
        'Kirjutamine, pikkus ja sõnum: 2 = 25–40 sõna ja sõber leiab tee; 1 = alla 25 sõna või osa on segane; 0 = juhisest ei saa aru. | ',
        'Kirjutamine, juhis: 2 = käsud ja suunad õiged (mine, pööra, kuni …-ni, üle …); 1 = mitu viga, aga tee on selge; 0 = suunda ei saa aru. | ',
        'Kirjutamine, sõnavara: 2 = kohad ja tee sõnad õiged; 1 = mõni sõna puudub või on vale; 0 = sõnu on väga vähe. | ',
        'Kirjutamine, algus ja lõpp: 2 = tervitus ja lõpp sobivad; 1 = üks puudub; 0 = mõlemad puuduvad. | ',
        'Rääkimine, juhis: 2 = 4–5 selget sammu; 1 = 2–3 sammu; 0 = üks samm või vähem. | ',
        'Rääkimine, vormid: 2 = paremale, kuni …-ni, üle …, kuhu-vormid peaaegu alati õiged; 1 = mitu viga, aga arusaadav; 0 = raske aru saada. | ',
        'Rääkimine, küsimused: 2 = kaks arusaadavat küsimust aja kohta; 1 = üks; 0 = ei ühtegi. | ',
        'Rääkimine, sõnavara: 2 = kohad ja tee sõnad õiged; 1 = mõni sõna puudub; 0 = sõnu on väga vähe. | ',
        'Rääkimine, arusaadavus: 2 = kuulaja saab kõigest aru (pausid on lubatud); 1 = kuulaja peab mõnikord üle küsima; 0 = raske aru saada. | ',
      ]), 'Õpetajale: kirjutamise viis rida annavad kirjutamise punktid (/10), rääkimise viis rida rääkimise punktid (/10). Lugemine 5 + 5 küsimust ja kuulamine 5 + 5 küsimust, iga õige vastus 1 punkt — kokku 10 + 10 + 10 + 10 = 40.'),
      teach(B.table('025_t_result', 'Minu tulemus: moodul 5.', 'Kirjuta oma punktid ja korruta need kahega. Ükski osa ei tohi olla 0 punkti.', 'Osa, Punktid (/10), Harno skaala (/20), Kontroll 4 (%), Mida harjutada?', [
        'Lugemine |  |  |  | ',
        'Kuulamine |  |  |  | ',
        'Kirjutamine |  |  |  | ',
        'Rääkimine |  |  |  | ',
        'Kokku (/40) |  |  |  | ',
      ]), 'Õpetajale: Harno järgi sooritatud = kokku ≥ 24/40 (60 %) ja ükski osa ei ole 0. KeeleSepa sisemine lävi: eksamiks valmis ≥ 28/40 (70 %), sertifikaat ≥ 32/40 (80 %). Kui osa on alla 6/10, anna üks parandusülesanne: lugemine → Harjuta „Lugemine” (moodul 5), kuulamine → tunni 22 või 24 salvestis uuesti ilma tekstita, kirjutamine → sama juhis parandatult, rääkimine → uus salvestus „Minu tee bussipeatusse”. Varasemast (moodulid 1–4) on 4 küsimust 20-st (20 %): lugemine 1.5, lugemine 2.1, kuulamine 2.2 ja 2.5.'),
    ],
  }),
}, {
  'a2-021': 'AVAS R→S', 'a2-022': 'RÄÄK L→S', 'a2-023': 'KIRJ R→W', 'a2-024': 'KUUL L→W', 'a2-025': 'EKS',
});
