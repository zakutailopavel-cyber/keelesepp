// A2 course (A1 → A2 roadmap), module 20 „A2 eksam ja iseseisev keelekasutus” (a2-096…100), level A2, in the final shape
// (docs/COURSE_FINAL_SHAPE_A2.md, row m20: 096 RÄÄK L→S, 098 KIRJ R→W; 097, 099 and 100 are exam lessons; gates V1–V16 of
// docs/COURSE_FINAL_SHAPE_B1.md §8). One storyline, the last three weeks before the Harno A2 exam on Saturday 11 December at Kase kool. The autumn course at
// Keelekool Sõna meets on Mondays and Wednesdays at 18–20 (Maret, Aune, administrator Ene; Tom, Lucía, Dmitri, Olga, Sofia). Sofia works at Tuul Logistika
// (boss Liis Laan, colleagues Anna and Markus).
//   096 RÄÄK L→S  Monday 22 Nov. What the exam is and what each learner fears: Palun korrake!, Ma ei saanud aru, raskem kui, pean + ma / tahan + da; corner L2 (Ülle's
//                 radio talk with Maret, true / false); S05 = `096_p_cards`; main: the pair agrees how they practise (S12); home recording: the picture (S06).
//   097 EKS       Wednesday 24 Nov. Kontroll 20, every part timed (B.examPart): R1–R5, W1, W2a, W2b, L1–L4, S0, S1, S2; it shows each learner's weak part for 098.
//   098 KIRJ R→W  Monday 29 Nov. Tom's writing after Kontroll 20: Maret's feedback, Lucía's model text, three repeating errors, plan, draft, edit;
//                 corner R4 (a school-paper article about Aune's Friday hour, `098_p_aune`); main: a description of 60–80 words (W05), planned (W11) and edited (W10).
//   099 PROOV     Wednesday 1 Dec. Proovieksam 3, all four parts timed (Harno minutes), with the §6.5-style check against 80 %.
//   100 PROOV     Monday 6 Dec. Lõpphindamine (Proovieksam 4), all four parts, the A2 profile and the plan towards B1. Not counted as practice (V6 counts up to 099).
// Reading + writing on Harjuta, listening + speaking on Kasuta in every exam lesson. Mocks use original texts only. No tingiv kõneviis anywhere (B1 grammar).
// The module has no art of its own: the speaking parts show pictures of earlier lessons through `data.img`.
import { B, tag, teach, withShapes } from '../blocks.js';

export const MODULE = { id: 'a2-module-20', course: 'a2', title: 'A2 eksam ja iseseisev keelekasutus', level: 'A2', design: 'v2', template: 'v4' };

const picture = (block, lesson) => ({ ...block, data: { ...block.data, img: `/textbook-art/a2/${lesson}/${lesson}-kasuta-1.webp` } });
const PART = (id, skill, o) => ({ ...B.examPart(id, skill, o), goal: ['R', 'L'].includes(skill) ? 'g_read' : 'g_use' });
// the fixed wording of the Harno formats in the exam lessons (§8 V7 lets exam lessons repeat it)
const R1 = (id, items) => tag(B.choice(id, 'Lugemine 1. Viisakad väljendid.', 'Lugege olukorda. Valige sobiv vastus.', items, 'full', 'g_read'), { harno: 'R1' });
const R2 = (id, texts, items) => tag(B.adsmatch(id, 'Lugemine 2. Kolm teksti.', 'Lugege kolme teksti. Mis tekstis on see info? Kirjutage täht.', texts, items), { harno: 'R2' });
const R3 = (id, signs, meanings) => tag(B.manymatch(id, 'Lugemine 3. Sildid ja teated.', 'Lugege silte. Ühendage iga silt selle tähendusega.', signs, meanings, 'full', 'g_read'), { harno: 'R3' });
const R4 = (id, items) => tag(B.choice(id, 'Lugemine 4. Valige õige vastus.', 'Valige artikli põhjal igale küsimusele üks vastus.', items, 'full', 'g_read'), { harno: 'R4' });
const R5 = (id, opening, passage) => tag(B.cloze(id, 'Lugemine 5. Kiri.', 'Lugege kirja. Valige igasse lünka üks sõna.', opening, passage, 'g_read'), { harno: 'R5' });
const L1 = (id, clips, items) => tag(B.examListen(id, 'Kuulamine 1. Lühikesed teated.', 'Kuulake seitset lühikest teadet. Iga teade kõlab kaks korda. Valige õige vastus.', 'choice', clips, items), { task: 'L01', harno: 'L1' });
const L2 = (id, transcript, items) => tag(B.examListen(id, 'Kuulamine 2. Raadiosaade.', 'Kuulake raadiovestlust kaks korda. Märkige iga lause kohta, kas see on õige või vale.', 'truefalse', transcript, items), { harno: 'L2' });
const L3 = (id, transcript, sentences) => tag(B.listening(id, 'Kuulamine 3. Teade.', 'Kuulake teadet kaks korda. Vastake ühe-kahe sõnaga.', transcript, sentences), { task: 'L03', harno: 'L3' });
const L4 = (id, transcript, pairs) => tag(B.examListen(id, 'Kuulamine 4. Vestlus.', 'Kuulake vestlust kaks korda ja ühendage inimene ja tegevus.', 'match', transcript, pairs), { harno: 'L4' });
const W1 = (id, card, points) => tag(B.examWriting(id, 'Kirjutamine 1. Visiitkaart.', 'Kirjutage visiitkaardi järgi tekst vähemalt 25 sõnaga. Vastake neljale küsimusele.', 'teade', { situation: `Visiitkaart: ${card}`, points, words: [25, 40] }), { harno: 'W1' });
const W2A = (id, situation, points) => tag(B.examWriting(id, 'Kirjutamine 2, teema A. Sõnum.', 'Kirjutage sõbrale sõnum vähemalt 30 sõnaga. Vastake kõigile küsimustele.', 'teade', { situation, points, words: [30, 50], opening: 'Tere!' }), { task: 'W08', harno: 'W2a' });
const W2B = (id, topic, points) => tag(B.examWriting(id, 'Kirjutamine 2, teema B. Kirjeldus.', `Kirjutage teemal „${topic}” vähemalt 30 sõna. Vastake kõigile küsimustele.`, 'jutt', { situation: `Teema: „${topic}”.`, points, words: [30, 50] }), { harno: 'W2b' });
const S0 = (id, questions) => teach(tag(B.speaking(id, 'Rääkimine. Tutvumine.', 'Eksamineerija küsib kaks-kolm küsimust. Vastake lühidalt.', questions, [45, 60]), { task: 'S01', harno: 'S0' }), 'Õpetaja on eksamineerija. Umbes üks minut, hinne ei sõltu sellest osast.');
const S1 = (id, questions, lesson) => picture(teach(tag(B.speaking(id, 'Rääkimine 1. Pilt ja küsimused.', 'Kirjeldage pilti. Siis vastake eksamineerija küsimustele.', questions, [60, 120]), { task: 'S06', harno: 'S1' }), 'Üks-ühele: õpilane kirjeldab pilti umbes minut, õpetaja küsib siis teemaküsimused. Hinda rubriigi järgi.'), lesson);
const S2 = (id, topic, situation, roleA, roleB) => teach(tag(B.phoneCards(id, `Rääkimine 2. Ideekaart „${topic}”.`, 'A küsib ideekaardi järgi, B vastab oma kaardi järgi. Siis vahetage.', situation, ['A (küsimused)', roleA], ['B (vastused)', roleB], [90, 120]), { task: 'S05', harno: 'S2' }), 'Üks-ühele: õpilane küsib ja õpetaja vastab kaardi järgi, siis vahetage ja õpetaja küsib.');

export const LESSONS = withShapes({
  'a2-096': {
    title: 'Kolm nädalat eksamini',
    canDo: 'Ma saan kuuldud eksamisaatest aru, räägin, mis on mulle raske, ja lepin paarilisega kokku, kuidas me eksamiks harjutame.',
    discover: [
      B.review('096_d_review', [['Mida sa ütled teenindajale, kui sa ei saanud temast aru?', 'a2-094'], ['Mida sa teed, kui tablool on kirjas, et sinu rong hilineb?', 'a2-087'], 'Mis on sinu jaoks eesti keeles praegu kõige raskem?']),
      B.text('096_d_situation', 'Eksam tuleb!', 'Esmaspäev, 22. november, Keelekool Sõna. Tund algab kell kuus. Maret kirjutab tahvlile: „Harno A2 eksam: laupäeval, 11. detsembril.” Klassis läheb vaikseks. Tom vaatab Lucíat, Lucía vaatab Dmitrit. Maret naerab ja ütleb: „Kolm nädalat on palju aega. Aga kõigepealt rääkige: mida te kardate?”'),
      teach(tag(B.examListen('096_d_voices', 'Mida nad kardavad?', 'Viis õppijat räägib oma murest. Kuula kaks korda ja vali igaühe kohta õige vastus.', 'choice', [
        'Tom: Mina ei karda lugemist ega kuulamist. Minu mure on kirjutamine. Ma teen sõnades palju vigu ja parandan neid kaua. Viimati ei jõudnud ma teist ülesannet lõpetada.',
        'Lucía: Minu jaoks on kuulamine kõige raskem. Eestlased räägivad raadios väga kiiresti. Kui ma ühte sõna ei tea, siis mõtlen ma sellele ja järgmine lause on juba läbi.',
        'Dmitri: Ma oskan päris palju, aga rääkides olen ma närvis. Eksamil istub laua taga võõras inimene. Kui ta mind vaatab, siis unustan ma kõik sõnad.',
        'Olga: Mulle meeldib lugeda, aga lugemises saab aeg otsa. Eelmisel korral lugesin ma iga sõna. Viimased kaks ülesannet jäid mul tegemata.',
        'Sofia: Mina kardan, et jään hiljaks. Eksam algab laupäeval kell üheksa ja buss sõidab nädalavahetusel harva. Seepärast tuleb Viktor mulle autoga järele.',
      ], [
        ['Mis on Tomi mure?', 'kirjutamine', 'kuulamine', 'lugemine'],
        ['Mis juhtub, kui Lucía ühte sõna ei tea?', 'ta ei kuule järgmist lauset', 'ta küsib õpetajalt', 'ta paneb raadio kinni'],
        ['Millal unustab Dmitri sõnad?', 'kui võõras inimene teda vaatab', 'kui ta kirjutab', 'kui ta on väsinud'],
        ['Miks jäid Olgal ülesanded tegemata?', 'ta luges iga sõna', 'ta jäi hiljaks', 'ta oli haige'],
        ['Kuidas Sofia eksamile tuleb?', 'Viktori autoga', 'bussiga', 'jala'],
      ]), { task: 'L01' }), 'Mängi kaks korda. Pärast küsi: kelle mure on ka sinu mure?'),
      tag(B.reading('096_d_letter', 'Sofia kiri Tomile.', 'Vaata pealkirja ja arva, mida Sofia soovitab. Siis loe kirja ja vasta.', 'Viis nõuannet', [
        'Tere, Tom! Sa küsisid, kuidas ma eksamiks õpin. Ma küsisin Liisilt ja Maretilt nõu ja nüüd on mul viis reeglit.',
        'Lugemises loen ma kõigepealt küsimust. Siis otsin tekstist ainult märksõna. Ma ei tõlgi iga sõna. Kuulamises kuulan ma esimesel korral rahulikult ja kirjutan väga lühidalt. Teisel korral kontrollin. Kirjutamises vaatan ma kella. Ma kirjutan kõigist punktidest ja lõpus loen teksti veel kord läbi.',
        'Rääkimises ma ei karda vigu. Kui ma ei saa aru, siis palun ma korrata. Kui mul ei tule sõna meelde, siis ütlen ma „üks hetk” ja mõtlen rahulikult edasi. Ja viimane reegel: ma magan enne eksamit hästi. Mina kaotasin kontrollis kõige rohkem punkte kirjutamises, sest aeg sai otsa. Nüüd ma tean: vaata kella! Sofia',
      ].join('\n\n'), [
        ['Kellelt Sofia nõu küsis?', 'Liisilt ja Maretilt|Maretilt ja Liisilt'], ['Mida teeb Sofia lugemises kõigepealt?', 'loeb küsimust|ta loeb küsimust'], ['Mida ta tekstist otsib?', 'märksõna|ainult märksõna'], ['Mida ta teeb kuulamises teisel korral?', 'kontrollib|ta kontrollib'],
        ['Mida ta teeb kirjutamise lõpus?', 'loeb teksti läbi|loeb teksti veel kord läbi'], ['Mida ta teeb, kui ta ei saa aru?', 'palub korrata'], ['Miks kaotas Sofia kirjutamises punkte?', 'aeg sai otsa|sest aeg sai otsa'], ['Mida Sofia ütleb, kui sõna ei tule meelde?', 'üks hetk'], ['Mis on viimane reegel?', 'magada hästi|ta magab enne eksamit hästi'],
      ]), { task: 'R13' }),
      B.match('096_d_say', 'Mida see lause teeb?', 'Õppijad harjutavad eksami lauseid. Ühenda iga lause ja see, mida inimene sellega teeb.', [
        ['Palun korrake!', 'Ta palub öelda sama veel kord.'], ['Ma ei saanud aru.', 'Ta ütleb, et jutt ei olnud selge.'], ['Kuidas seda eesti keeles öeldakse?', 'Ta otsib ühte sõna.'], ['Kas te mõtlete, et …?', 'Ta kontrollib, kas sai õigesti aru.'],
        ['Üks hetk, palun.', 'Ta tahab veidi mõelda.'], ['Rääkige palun aeglasemalt!', 'Ta palub rääkida mitte nii kiiresti.'], ['Minu arvates on see raske.', 'Ta ütleb oma mõtte.'],
      ], 'full', 'g_vocab'),
      B.notice('096_d_notice', 'Märka: nii saad vestluses edasi.', [
        '**Kui sa ei saa aru:** Palun **korrake**! · **Rääkige** palun aeglasemalt! · Ma ei **saanud** aru.',
        '**Kui sõna ei tule:** Üks hetk, palun. · Kuidas seda eesti keeles **öeldakse**?',
        '**Võrdlus:** kuulamine on **raskem kui** lugemine · kirjutamine on **kergem kui** rääkimine',
        '**Mida ma pean? Mida ma tahan?** ma **pean** + ma-vorm: pean **harjutama** · ma **tahan** + da-vorm: tahan **harjutada**',
        'Uued sõnad: mure — забота · hetk — миг · närvis — нервничает · punkt — балл · paariline — партнёр · sõnaraamat — словарь · ideekaart — карточка с идеями · tulemus — результат · ülesanne — задание',
      ], 'full'),
      B.table('096_d_rule', 'Leia reegel.', 'Vaata õppijate lauseid. Kirjuta tabelisse, mis vormi tegusõna on: ma-vorm või da-vorm.', 'Õppija lause, Tegusõna, Vorm', [
        'Ma pean rohkem kirjutama. | kirjutama | [ma-vorm]', 'Ma tahan raadiot kuulata. | kuulata | [da-vorm]', 'Ma hakkan iga päev lugema. | lugema | [ma-vorm]', 'Ma võin sinuga harjutada. | harjutada | [da-vorm]', 'Mul on vaja rääkida. | rääkida | [da-vorm]', 'Me läheme raamatukokku õppima. | õppima | [ma-vorm]',
      ], 'g_notice'),
      B.categorize('096_d_sort', 'Mis osa see on?', 'Tom paneb eksami sõnad korda. Pane iga sõna selle osa juurde, kus sa seda kõige rohkem vajad.', [
        ['kirjutamine', ['visiitkaart', 'sõnade arv', 'kutse']], ['kuulamine', ['raadiosaade', 'kaks korda', 'lühivastus']], ['lugemine', ['silt', 'kuulutus', 'lünk']], ['rääkimine', ['pilt', 'ideekaart', 'paariline']],
      ], 'full', 'g_vocab'),
      teach(tag(B.speaking('096_d_poll', 'Küsi paariliselt.', 'Küsi paariliselt kõiki küsimusi. Siis ütle klassile lühidalt, mida ta kardab ja miks.', [
        'Mis osa on sinu jaoks kõige raskem?', 'Mis osa on kõige kergem?', 'Mis on raskem, kuulamine või lugemine?', 'Mida sa tegid viimase kontrolltöö ajal, kui aeg sai otsa?', 'Mida sa kardad kõige rohkem?',
      ], [60, 120], ['Minu jaoks on … raskem kui …, sest …', 'Ta kardab, et …', 'Üks hetk, palun.']), { task: 'S09', fluency: true }),
        'Üks-ühele: õpetaja vastab samadele küsimustele. Õpilane teeb märkmed ja räägib õpetaja vastused lõpuks ümber. Ära paranda.'),
      teach(tag(B.speaking('096_d_opinion', 'Mis on sinu arvates parem?', 'Ütle oma mõte ja põhjendus. Pärast küsi, mida õpetaja arvab.', [
        'Kas on parem õppida iga päev natuke või üks kord palju?', 'Kas on parem harjutada üksi või koos?', 'Kas parem on kuulata raadiot või vaadata filmi?', 'Kas enne eksamit tuleb õppida või puhata?',
      ], [60, 120], ['Minu arvates on parem …, sest …', 'Mina arvan teisiti: …', 'Mis sina arvad?']), { task: 'S11' }),
        'Üks-ühele: õpetaja vaidleb natuke vastu, et õpilane peab põhjendama. Paranda ainult siis, kui mõte jääb segaseks.'),
    ],
    practice: [
      B.listening('096_p_ene', 'Ene helistab Tomile.', 'Ene räägib Tomile, kuidas eksamile registreerida. Kuula kaks korda. Kirjuta lünka 1–2 sõna.', [
        'Ene: Tere, Tom! Siin Ene Keelekoolist Sõna. Helistan eksami pärast. Sa pead end sel nädalal registreerima. Viimane päev on reede, 26. november.',
        'Tom: Tere, Ene! Mida ma pean selleks tegema?',
        'Ene: Mine kodulehele ja täida ankeet. Sinna tuleb kirjutada sinu nimi, isikukood ja e-post. Eksam on Kase koolis, teisel korrusel, ruumis kaksteist.',
        'Tom: Kase kool on minu lähedal! Mis kell ma pean kohal olema?',
        'Ene: Eksam algab kell üheksa, aga tule kaheksa kolmkümmend. Võta kaasa dokument ja kaks pastakat.',
        'Tom: Selge. Aitäh, Ene! Kas ma võin ka vett kaasa võtta?',
        'Ene: Võid küll. Aga telefon peab olema kotis. Head õppimist!',
      ], ['Viimane registreerimise päev on [reede|26. november].', 'Kodulehel tuleb täita [ankeet].', 'Eksam on [Kase koolis].', 'Eksami ruum on number [kaksteist|12].', 'Tom peab kohal olema kell [kaheksa kolmkümmend|8.30|pool üheksa].', 'Kaasa tuleb võtta dokument ja kaks [pastakat].', 'Telefon peab olema [kotis].']),
      B.choice('096_p_what', 'Mida ütled eksamil?', 'Sa oled eksamiruumis. Vali iga olukorra jaoks lause, mis sind aitab.', [
        ['Eksamineerija räägib väga kiiresti.', 'Rääkige palun aeglasemalt!', 'Ma ei taha rääkida.', 'Head aega!'],
        ['Sa ei kuulnud küsimust hästi.', 'Palun korrake küsimust!', 'See on väga kallis.', 'Mul on kõik korras.'],
        ['Sa ei tea sõna ja tahad veidi mõelda.', 'Üks hetk, palun.', 'Ole lahke.', 'Pole tänu väärt.'],
        ['Paariline ütleb midagi ja sa ei ole kindel, kas said õigesti aru.', 'Kas sa mõtled, et lähed esmaspäeval?', 'Ära küsi rohkem.', 'Kahjuks ma lõpetan.'],
        ['Sa tahad teada ühe asja eestikeelset nime.', 'Kuidas seda eesti keeles öeldakse?', 'Kes see on?', 'Kui palju see maksab?'],
        ['Sa lõpetasid ja tahad lehe ära anda.', 'Ma olen valmis.', 'Tere hommikust!', 'Ma ei saanud aru.'],
      ], 'full', 'g_notice'),
      teach(tag(B.examListen('096_p_radio', 'Eksaminurk: raadio.', 'Ülle räägib raadios Maretiga eksamist. Kuula kaks korda ja märgi, kas lause on õige või vale.', 'truefalse', [
        'Ülle: Tere, head kuulajad! Stuudios on täna õpetaja Maret Keelekoolist Sõna. Detsembris teevad paljud inimesed A2 eksami. Maret, mis seal ees ootab?',
        'Maret: Tere! Eksamil on neli osa: kirjutamine, kuulamine, lugemine ja rääkimine. Iga osa eest saab kuni kakskümmend punkti, kokku kaheksakümmend.',
        'Ülle: Kui palju punkte on vaja?',
        'Maret: Eksam on tehtud, kui sul on vähemalt nelikümmend kaheksa punkti. See on kuuskümmend protsenti. Aga ükski osa ei tohi olla null punkti. Meie koolis on eesmärk suurem: kaheksakümmend protsenti igas osas.',
        'Ülle: Mis osa on kõige pikem?',
        'Maret: Lugemine. Selleks on aega viiskümmend minutit. Kirjutamiseks ja kuulamiseks on kummalgi kolmkümmend minutit. Rääkimine kestab umbes viisteist minutit.',
        'Ülle: Kas kuulamise teksti kuuleb ainult üks kord?',
        'Maret: Ei, iga teksti kuuled kaks korda. Esimesel korral kuula rahulikult ja tee väike märge. Teisel korral kontrolli. Ära jää ühe sõna juurde, see on kõige sagedasem viga.',
        'Ülle: Ja rääkimine? Paljud kardavad seda kõige rohkem.',
        'Maret: Jah. Aga sa ei ole seal üksi. Kõigepealt tutvud, siis kirjeldad pilti ja lõpuks küsid ideekaardi järgi. Kui sa ei saa aru, siis võid rahulikult öelda: „Palun korrake!” Selle eest ei võeta punkte ära.',
        'Ülle: Kas sõnaraamatu võib kaasa võtta?',
        'Maret: Ei, sõnaraamatut ega telefoni ei tohi kasutada. Kaasa tuleb võtta dokument ja pastakas.',
        'Ülle: Mida te viimasel nädalal soovitate?',
        'Maret: Ärge õppige öösel uusi sõnu! Harjutage iga päev natuke, rääkige kellegagi ja magage enne eksamit hästi. Ja tulge varem kohale, siis ei pea te bussi pärast muretsema. Eksami hommikul sööge korralikult, sest see päev on pikk.',
        'Ülle: Kas tulemused tulevad kiiresti?',
        'Maret: Ei, tulemused tulevad umbes kuu aja pärast. Oodata on raske, aga vahepeal võib juba järgmist kursust vaadata.',
        'Ülle: Aitäh, Maret! Edu kõigile!',
      ], [
        ['Eksamil on kokku kaheksakümmend punkti.', true], ['Eksam on tehtud ka siis, kui üks osa on null punkti.', false], ['Keelekooli eesmärk on suurem kui eksami nõue.', true], ['Kirjutamine on eksami kõige pikem osa.', false],
        ['Iga kuulamise teksti kuuleb kaks korda.', true], ['Kui sa palud korrata, siis saad vähem punkte.', false], ['Rääkimises tuleb ka ideekaardi järgi küsida.', true], ['Telefoni võib eksamil kasutada.', false],
      ]), { harno: 'L2' }), 'Nagu Harno A2 kuulamise 2. osas: raadiovestlus, õige või vale, tekst kõlab kaks korda. Eksamil on 6 lauset. Aeg umbes 8 minutit. Üks punkt lause eest.'),
      B.vocab('096_p_vocab', 'Eksami sõnad.', ['eksam — экзамен', 'osa — часть', 'tulemus — результат', 'ülesanne — задание', 'viga — ошибка', 'dokument — документ', 'harjutama — упражняться', 'kordama — повторять']),
      B.adsmatch('096_p_offers', 'Kus saab harjutada?', 'Keelekooli seinal on kolm kuulutust. Kuhu see õppija läheb? Kirjuta täht.', [
        ['Rääkimisklubi', 'Neljapäeviti kell 17 kohvikus Pann. Õpetaja Kadi aitab kirjeldada pilte ja küsida ideekaardi järgi. Tasuta, tule ilma registreerimata.'],
        ['Kirjutamise tund', 'Reedeti kell 16 keelekoolis, ruumis 3. Aune loeb sinu teksti ja parandab vead. Too oma tekst kaasa. Üks tund maksab 10 eurot.'],
        ['Kuulamise nurk', 'Raamatukogus on iga päev kella 10–18 kõrvaklapid ja vanad eksamitekstid. Võid olla seal nii kaua, kui tahad. Raamatukogu kaart on vajalik.'],
      ], [['Dmitri tahab pilti kirjeldada ja ei taha maksta.', 'A'], ['Tom tahab oma teksti õpetajale näidata.', 'B'], ['Lucía saab kuulata ainult hommikul.', 'C'], ['Dmitri ei taha enne ennast kirja panna.', 'A'], ['Tom on valmis maksma kümme eurot.', 'B'], ['Lucía vajab kõrvaklappe.', 'C']]),
      B.transformation('096_p_polite', 'Ütle viisakamalt.', 'Tomi laused on eksami jaoks liiga järsud. Kirjuta iga lause antud alguse järgi viisakalt.', [
        ['Korda!', 'Palun …', 'Palun korrake!'], ['Räägi aeglasemalt!', 'Palun …', 'Palun rääkige aeglasemalt!|Rääkige palun aeglasemalt!'], ['Oota!', 'Üks …', 'Üks hetk, palun.'], ['Mis see sõna on?', 'Kuidas …', 'Kuidas seda sõna eesti keeles öeldakse?|Kuidas seda eesti keeles öeldakse?'],
        ['Kirjutamine on raske. Lugemine on kerge.', 'Kirjutamine on …', 'Kirjutamine on raskem kui lugemine.'], ['Ma pean harjutama.', 'Ma tahan …', 'Ma tahan harjutada.'],
      ]),
      B.wordorder('096_p_order', 'Pane lause kokku.', 'Lucía kirjutas oma märkmed kiiresti. Pane iga lause sõnad õigesse järjekorda.', ['Palun rääkige natuke aeglasemalt.', 'Minu jaoks on kuulamine raskem kui lugemine.', 'Iga päev tahan ma raadiot kuulata.', 'Kas me saame neljapäeval koos harjutada?', 'Ma pean eksamiks rohkem kirjutama.', 'Laupäeval algab eksam kell üheksa.']),
      teach(B.rolecards('096_p_cards', 'Ideekaart „Eksam”.', 'A küsib märksõnade järgi, B vastab ja ütleb ühe detaili. Siis vahetage rollid.',
        'Küsi viis küsimust: raske osa, harjutamine, aeg, koht, abi.', 'Vasta igale küsimusele kahe lausega. Kui sa ei saa aru, palu korrata.',
        ['Mis osa on sulle kõige raskem?', 'Kuidas sa seda harjutad?', 'Kes sind aitab?'], ['Minu jaoks on … raskem kui …', 'Ma harjutan … iga päev.', 'Palun korrake!']),
        'Üks-ühele: õpetaja vastab, kui õpilane küsib, ja ütleb ühe lause meelega kiiresti, et õpilane palub korrata.'),
      teach(tag(B.speaking('096_p_432', 'Räägi kolm korda.', 'Räägi paarilisele oma eksamist: esimesel korral kaks minutit, siis 1,5 minutit, lõpuks üks minut.', [
        'Mis on eksamil sinu jaoks raske?', 'Mis on kerge?', 'Mida sa viimaseks nädalaks plaanid?', 'Mida sa eksamipäeva hommikul teed?',
      ], [60, 120], ['Minu jaoks on …', 'Kõigepealt ma …', 'Ma pean …']), { task: 'S08', fluency: true }),
        'Üks-ühele: õpilane räägib õpetajale kolm korda sama juttu, iga kord kiiremini. Õpetaja hoiab aega ega paranda.'),
    ],
    transfer: [
      B.text('096_t_situation', 'Kolm nädalat koos', 'Tom ja Lucía otsustavad koos harjutada, sest Tomile on raske kirjutamine ja Lucíale kuulamine. Neil on vaba aega esmaspäeval enne tundi, neljapäeva õhtul ja laupäeva hommikul. Sina ja sinu paariline teete sama: te lepite kokku, kuidas ja millal järgmised kolm nädalat harjutate.'),
      teach(tag(B.ideaCard('096_t_agree', 'Meie eksamiplaan.', 'Rääkige, mis on kummalegi raske. Leppige kokku kaks asja, mida te koos teete: mida, millal, kus. Lõpus öelge oma plaan õpetajale.',
        'Eksamini on kolm nädalat. Teil on kummalgi üks nõrk osa ja vähe vaba aega.', ['rääkimisklubi neljapäeval', 'kirjutamise tund reedel', 'kuulamise nurk raamatukogus', 'raadio bussis', 'tekstid üksteisele parandada', 'telefonikõne eesti keeles'], 'Mis kaks asja te valite, millal ja miks?', [180, 300]), { task: 'S12', main: true }),
        'Üks-ühele: õpetaja on paariline ja tal on oma nõrk osa. Ta ei nõustu kohe, et õpilane peab põhjendama. Lõpus peab olema kokkulepe.'),
      B.phrasebank('096_t_phrases', [['Mis on raske?', ['Minu jaoks on … raskem kui …', 'Mul on vaja rohkem …']], ['Ettepanek', ['Kas me võime koos …?', 'Äkki läheme … ?', 'Kas … sobib sulle?']], ['Kokkulepe', ['Hea, lepime nii kokku.', 'Kahjuks ma ei saa, aga …', 'Siis kohtume …']]]),
      teach(tag(B.examWriting('096_t_note', 'Sõnum pärast tundi.', 'Kirjuta paarilisele sõnum 40–60 sõnaga: mida te kokku leppisite.', 'teade', {
        situation: 'Sa tahad, et teie plaan ei ununeks. Kirjuta talle kõik üles.',
        points: ['Mida te harjutate?', 'Millal ja kus te kohtute?', 'Mida kumbki kaasa võtab?', 'Mida sa kuni selle ajani üksi teed?'],
        words: [40, 60], opening: 'Tere!',
      }), { task: 'W02' }), 'Üks-ühele: õpilane kirjutab sõnumi õpetajale, sest õpetaja oli tema paariline.'),
      teach(tag(B.letter('096_t_reply', 'Vastus Lucíalt.', 'Lucía kirjutab: „Ma ei saa neljapäeval tulla.” Vasta talle 40–60 sõnaga ja paku uus aeg.', 'Tere, Lucía!', 'Kohtumiseni!', [40, 60]), { task: 'W04' }), 'Õpilane kirjutab üksi. Õpetaja kontrollib, kas uus aeg ja koht on kirjas.'),
      tag(B.letter('096_t_maret', 'Kiri Maretile.', 'Kirjuta Maretile sama plaan teie-vormis, 40–60 sõna. Küsi ka üks küsimus eksami kohta.', 'Tere, Maret!', 'Lugupidamisega', [40, 60]), { task: 'W12' }),
      picture(tag(B.speaking('096_t_record', 'Salvesta: pilt ja sinu plaan.', 'Salvesta kodus 45–60 sekundit. Kirjelda pilti ja räägi siis, kuidas sina eksamiks õpid.', ['Kes on pildil ja kus nad on?', 'Mida Sofia teeb?', 'Mis on laual?', 'Mis on sinu plaan järgmiseks nädalaks?', 'Mis aitab sind kõige rohkem?'], [45, 60], ['Pildil on …', 'Laual on …', 'Ma pean …', 'Ma tahan …']), { task: 'S06' }), 'a2-068'),
      B.rubricSpeaking('096_t_rubric', 'Hindamine: meie eksamiplaan (20 punkti).'),
      B.selfcheck('096_t_self', ['Ma saan kuuldud saatest aru, kuidas eksam käib.', 'Ma ütlen, mis on mulle raske ja miks.', 'Ma palun korrata ja küsin, kui ma ei saa aru.', 'Ma lepin kokku, kuidas me harjutame.'], 'Plaan on olemas'),
    ],
  },

  'a2-097': {
    title: 'Kontroll 20: kus ma praegu olen?',
    assessment: true,
    canDo: 'Ma teen eksami neli osa etteantud aja jooksul ja saan teada, mis osa on minu jaoks kõige nõrgem (eesmärk on vähemalt 80% igas osas).',
    discover: [
      B.text('097_d_intro', 'Kontroll 20 Harno A2 vormis', 'Kolmapäev, 24. november. Täna on kontroll: neli osa nagu eksamil, igal osal on oma aeg. See leht on soojendus: loe, kuidas eksamipäev käib, ja korda juhiseid. Kontroll näitab, mis osa on sinu jaoks kõige nõrgem. Esmaspäeval töötame just sellega.'),
      B.truefalse('097_d_guess', 'Mida sa juba tead?', 'Sa kuulasid Mareti saadet raadiost. Kas need asjad on nii? Otsusta enne, kui hakkad lugema.', [
        ['Eksamile tuleb võtta kaasa isikut tõendav dokument.', true], ['Lugemise jaoks on ainult pool tundi.', false], ['Sooritamiseks on vaja vähemalt 60 % punktidest.', true], ['Kirjutamises tuleb valida teine ülesanne kahest teemast.', true], ['Eksamil saab ise otsustada, mis osa jääb tegemata.', false],
      ], 'full'),
      B.vocab('097_d_vocab', 'Eksamipäeva sõnad.', ['pass — паспорт', 'kestma — длиться', 'pastakas — ручка', 'protsent — процент', 'rahul — доволен', 'tööl — на работе']),
      B.reading('097_d_read', 'Ene kiri õppijatele.', 'Ene kirjutab, kuidas eksamipäev käib. Loe kirja ja kirjuta vastused lühidalt.', 'Head õppijad!', [
        'Eksamipäeval tulge Kase kooli kella poole üheksaks. Võtke kaasa isikutunnistus või pass, kaks pastakat ja veepudel. Telefon peab olema kotis ja kinni. Sõnaraamatut ei tohi kasutada.',
        'Kell üheksa algab kirjutamine. Selleks on 30 minutit. Esimeses ülesandes kirjutate visiitkaardi põhjal, teises valite ühe teema kahest. Siis tuleb kuulamine, mis kestab samuti 30 minutit. Iga teksti kuulete kaks korda. Pärast väikest pausi on lugemine. See kestab 50 minutit ja on kõige pikem osa.',
        'Rääkimine on pärast lõunat. Te räägite paarilisega umbes 15 minutit: kõigepealt tutvumine, siis pilt ja lõpuks ideekaart. Õhtul olete väsinud, aga rahul. Edu teile! Ene',
      ].join('\n\n'), [
        ['Mis kell tuleb kohal olla?', 'poole üheksaks|kella poole üheksaks|8.30'], ['Kus peab telefon olema?', 'kotis|kotis ja kinni'], ['Mis osa on esimene?', 'kirjutamine'], ['Mis osa on kõige pikem?', 'lugemine'], ['Mitu teemat on teises kirjutamisülesandes?', 'kaks|2'], ['Millal on rääkimine?', 'pärast lõunat'],
      ]),
      B.notice('097_d_notice', 'Eksami ajad ja punktid', ['Kirjutamine — **30 min**, 2 ülesannet, **20 p**', 'Kuulamine — **30 min**, 4 ülesannet, **20 p**', 'Lugemine — **50 min**, 5 ülesannet, **20 p**', 'Rääkimine — umbes **15 min**, 2 ülesannet, **20 p**', 'Kokku **80 p**. Sooritatud: vähemalt **48 p (60 %)** ja ükski osa ei ole **0 p**. KeeleSepa eesmärk: **80 %** igas osas.', 'Uued sõnad: isikutunnistus — удостоверение личности · paus — перерыв · väsinud — уставший'], 'full'),
      B.diagram('097_d_line', 'timeline', { title: 'Eksamipäev.', instruction: 'Ene kirja järgi on päeval kindel järjekord. Kirjuta iga kellaaja juurde puuduv osa.', nodes: '9.00 | [Kirjutamine] — 30 minutit\n9.30 | [Kuulamine] — 30 minutit\n10.15 | [Lugemine] — 50 minutit\n13.00 | [Rääkimine] — paaris' }, 'full'),
      B.gaps('097_d_points', 'Arvuta punktid.', 'Olga arvutab, kas tulemusest piisab. Kirjuta lünka number või sõna.', [
        'Eksamil on kokku [80|kaheksakümmend] punkti.', 'Iga osa eest saab kuni [20|kakskümmend] punkti.', 'Kuuskümmend protsenti kaheksakümnest on [48|nelikümmend kaheksa] punkti.', 'Dmitril on 50 punkti, aga kuulamises 0. Eksam [ei ole] sooritatud.', 'Sofial on 52 punkti, igas osas üle 10. Eksam [on] sooritatud.', 'Lugemise jaoks on aega [50|viiskümmend] minutit.',
      ]),
      B.match('097_d_match', 'Juhis ja tegevus.', 'Mida eksami juhis sinult tahab? Ühenda juhis ja see, mida sa teed.', [['Ühendage.', 'Panen kokku kaks osa.'], ['Valige õige vastus.', 'Märgin ühe kolmest.'], ['Vastake ühe-kahe sõnaga.', 'Kirjutan väga lühidalt.'], ['Kirjutage vähemalt 30 sõna.', 'Kirjutan lühikese teksti.'], ['Märkige, kas lause on õige.', 'Otsustan, kas see on nii.'], ['Kirjeldage pilti.', 'Räägin, mida pildil näen.']], 'full', 'g_vocab'),
      B.choice('097_d_choice', 'Mis on eksamil lubatud?', 'Tom kontrollib oma kotti ja plaani. Mõtle eksamile ja vali iga küsimuse kohta õige vastus.', [
        ['Mida on eksamil kindlasti vaja?', 'dokumenti', 'sõnaraamatut', 'arvutit'], ['Millega kirjutad eksamil?', 'pastakaga', 'telefoniga', 'arvutiga'], ['Kus on telefon eksami ajal?', 'kotis', 'laual', 'käes'], ['Mitu korda kuuled iga teksti?', 'kaks korda', 'üks kord', 'kolm korda'], ['Mitu protsenti on vaja KeeleSepa eesmärgiks?', '80 %', '60 %', '100 %'],
      ]),
      B.wordorder('097_d_order', 'Eksami küsimused.', 'Sõnad läksid ideekaardi küsimustes sassi. Pane iga küsimus kokku.', ['Kas sa teed iga päev sporti?', 'Mitu tundi sa öösel magad?', 'Mida sa teed, kui oled haige?', 'Kuhu sa eelmisel suvel sõitsid?', 'Mis sulle reisil kõige rohkem meeldis?']),
      B.rolecards('097_d_call', 'Helista keelekooli.', 'A helistab keelekooli, B on Ene. Siis vahetage.',
        'Küsi: mis päeval on eksam, mis kell, kus, mida kaasa võtta.', 'Vasta: laupäeval, 11. detsembril, kell 9, Kase koolis, dokument ja pastakas.',
        ['Millal on eksam?', 'Kus see toimub?', 'Mida ma pean kaasa võtma?'], ['Eksam on …', 'See on …', 'Võtke kaasa …']),
      B.writing('097_d_write', 'Minu eksamipäev.', 'Kirjuta 5–7 lauset: mida võtad kaasa, mis kell tuled, mida teed pärast.', [5, 7], ['kaasa', 'kell', 'pärast'], 2),
      teach(B.speaking('097_d_warm', 'Enne kontrolli.', 'Õpetaja küsib nagu eksamil. Vasta igale küsimusele kaks-kolm lauset.', ['Kuidas sa ennast täna tunned?', 'Mis osa on sinu jaoks kõige kergem?', 'Mida sa oled sel nädalal harjutanud?'], [60, 90]),
        'Õpetaja küsib nagu eksamineerija. Ära paranda, pane tähele ainult sõnajärge.'),
    ],
    practice: [
      PART('097_p_wpart', 'W', { minutes: 30, points: 20, tasks: 2, note: 'Kirjutage ilma sõnaraamatuta. Kirjutage kõigist punktidest. Teises ülesandes valige üks kahest teemast. Eesmärk on vähemalt 16 punkti (80 %).' }),
      W1('097_p_w1', 'Mari Saar, juuksur · Ilusalong Kaunis, Pikk 7, Rakvere · T–L 10–18 · tel 5123 4567 · mari@kaunis.ee', ['Kes on Mari Saar?', 'Kus ta töötab?', 'Millal ta tööl on?', 'Kuidas saab aega kinni panna?']),
      B.rubricW1('097_p_rw1', ['kes ta on', 'kus ta töötab', 'millal ta tööl on', 'kuidas aega kinni panna']),
      W2A('097_p_w2a', 'Sa leidsid bussist oma naabri telefoni. Kirjuta talle.', ['Kus sa telefoni leidsid?', 'Milline see telefon on?', 'Kuidas naaber selle kätte saab?']),
      W2B('097_p_w2b', 'Minu lemmikkoht', ['Mis koht see on?', 'Kus see asub?', 'Miks sulle seal meeldib?']),
      B.rubricW2('097_p_rw2'),
      PART('097_p_rpart', 'R', { minutes: 50, points: 29, tasks: 5, note: 'Viis ülesannet nagu eksamil. Lugege iga ülesande juhist hoolikalt. Eksamil on selle osa eest 20 punkti, õpetaja arvutab tulemuse ümber. Eesmärk on vähemalt 24 punkti (80 %).' }),
      R1('097_p_r1', [
        ['Sõbral on sünnipäev. Mida ütled?', 'Palju õnne!', 'Head paranemist!', 'Jõudu tööle!'], ['Kolleeg läheb puhkusele. Mida ütled?', 'Head puhkust!', 'Head isu!', 'Tere tulemast!'], ['Sa astud bussis kogemata võõrale jalale. Mida ütled?', 'Vabandust!', 'Pole tänu väärt!', 'Terviseks!'],
        ['Keegi ütleb sulle „Aitäh!”. Mida vastad?', 'Pole tänu väärt.', 'Vabandust, ma ei tea.', 'Head aega!'], ['Sa helistad ja vastab võõras inimene. Mida ütled?', 'Vabandust, valisin vale numbri.', 'Tere, kuidas läheb?', 'Ma helistan homme jälle.'], ['Naaber aitas sul kotte tassida. Mida ütled?', 'Suur aitäh abi eest!', 'Palun, võta veel!', 'Head isu!'],
      ]),
      R2('097_p_r2', [
        ['Laste jalgratas', 'Müüa laste jalgratas. Ratas on punane ja peaaegu uus. Poeg sõitis sellega ainult ühe suve, nüüd on ta pikemaks kasvanud. Ratas sobib 5–8-aastasele lapsele. Kaasa anname ka kiivri. Hind on 40 eurot. Ratast saab vaadata õhtuti pärast kella kuut. Asume Lasnamäel. Helista: 5512 3344. Katrin'],
        ['Ujula uued ajad', 'Tähelepanu, ujula külastajad! Alates 1. märtsist muutuvad lahtiolekuajad. Esmaspäevast reedeni oleme avatud kella seitsmest kümneni. Laupäeval ja pühapäeval oleme avatud kella üheksast kaheksani. Pühapäeva hommikul on peredele odavam pilet. Ujulasse tuleb võtta ujumismüts. Mütsi saab osta ka kassast.'],
        ['Abi kolimisel', 'Tere, Markus! Kas sa saad mind laupäeval kolimisel aidata? Minu uus korter on Kalamajas, kolmandal korrusel. Lifti majas ei ole. Auto on mul olemas, aga kapp ja diivan on väga rasked. Alustame kell kümme. Pärast teen kõigile pitsat. Palun anna täna õhtul teada! Andrei'],
      ], [['Selle asjaga saab tasuta ka kiivri.', 'A'], ['Siia ei saa tulla ilma mütsita.', 'B'], ['See inimene pakub abilistele süüa.', 'C'], ['Pühapäeva hommikul maksab pere siin vähem.', 'B'], ['Selles majas tuleb trepist minna.', 'C'], ['Seda saab vaadata ainult õhtul.', 'A']]),
      B.notice('097_p_signlist', 'Lugemine 3. Sildid', ['A — Apteek: retseptiravimid ainult apteekrilt', 'B — Ujumine keelatud! Vesi on sügav', 'C — Pakiautomaat: võta pakk 7 päeva jooksul', 'D — Postkontor: E–R 9–18, L 10–14', 'E — Parkimine ainult elanikele', 'F — Lasteaed: palun sulge värav!', 'G — Kohvik remondi tõttu suletud'], 'full', 'g_read'),
      tag(B.table('097_p_r3', 'Lugemine 3. Kus see silt on?', 'Kirjutage iga info juurde sildi täht. Kaks silti jääb üle.', 'Info, Silt', [
        'Sa tahad laupäeval kirja saata. | [D]', 'Sinu pakk ootab sind üks nädal. | [C]', 'Siin ei tohi vette minna. | [B]', 'Siin ei saa praegu kohvi juua. | [G]', 'Lapsed ei tohi üksi tänavale joosta. | [F]',
      ], 'g_read'), { task: 'R07', harno: 'R3' }),
      B.reading('097_p_text', 'Lugemine 4. Tekst.', 'Lugege ajakirja lugu ühe naise uuest hobist. Küsimused tulevad pärast teksti.', 'Merle uus hobi', [
        'Merle töötab raamatupidajana. Ta istub terve päeva arvuti taga. Eelmisel aastal hakkas tal selg valutama. Arst ütles, et Merle peab rohkem liikuma. Alguses ei teadnud ta, mida teha. Jooksmine tundus talle igav ja spordiklubi liiga kallis. Õhtuti oli ta ka väsinud ja tahtis ainult diivanil istuda.',
        'Siis nägi ta raamatukogus kuulutust. Üks kõndimise rühm otsis uusi liikmeid. Rühm kohtub kaks korda nädalas Pirita metsas. Osalemine on tasuta ja kepid saab alguses laenata. Merle läks esimest korda vihmase ilmaga. Rühmas oli kaheksa inimest, enamik neist pensionärid. Kõik olid väga sõbralikud. Üks vanem naine näitas Merlele, kuidas keppe õigesti hoida.',
        'Nüüd käib Merle rühmas juba pool aastat. Selg enam ei valuta. Tal on palju uusi tuttavaid. Laupäeviti joovad nad pärast kõndi koos teed. Järgmisel kuul plaanib rühm matka Lahemaale.',
      ].join('\n\n'), []),
      R4('097_p_r4', [
        ['Miks pidi Merle rohkem liikuma?', 'Tal valutas selg.', 'Ta tahtis uut hobi.', 'Ta sai uue töö.'], ['Miks ei läinud Merle spordiklubisse?', 'See oli liiga kallis.', 'See oli liiga kaugel.', 'Seal oli liiga palju inimesi.'], ['Kust sai Merle rühmast teada?', 'raamatukogu kuulutusest', 'arstilt', 'kolleegilt'],
        ['Mis on rühmas alguses tasuta?', 'osalemine ja kepid', 'ainult tee', 'matk Lahemaale'], ['Mida teeb rühm laupäeviti pärast kõndi?', 'joob koos teed', 'läheb matkale', 'käib ujumas'],
      ]),
      R5('097_p_r5', 'Tere, Sofia!', [
        'Aitäh sinu kirja eest! Mul läheb hästi. Eelmisel nädalal {*kolisime|kolime|kolima} uude korterisse. Korter on {*kesklinnas|kesklinna|kesklinnast}, bussipeatuse lähedal. Nüüd ma ei pea enam autoga {*sõitma|sõita|sõidan}. Tööle lähen jalgsi, see võtab ainult kümme minutit. Meil on kaks tuba ja suur köök. {*Köögis|Kööki|Köögist} on aken parki. Lapsed on väga rahul, sest kool on {*maja|majas|majast} kõrval.',
        '',
        'Kas sa {*tahad|tahta|tahtma} meile külla tulla? Sa võid {*tulla|tulema|tuled} näiteks järgmisel laupäeval. Ma teen {*sulle|sinu|sind} oma kuulsat õunakooki.',
        '',
        'Kallistan, Merilin',
      ]),
    ],
    transfer: [
      B.text('097_t_intro', 'Kuulamine ja rääkimine', 'Kõigepealt on kuulamine, siis rääkimine. Vaata pilti rääkimisosas: Sofia ja õpetaja Aune valivad, kuidas õppida. Rääkimisosas on õpetaja sinu partner.'),
      PART('097_t_lpart', 'L', { minutes: 30, points: 25, tasks: 4, note: 'Iga teksti kuulete kaks korda. Enne iga ülesannet on aega küsimusi lugeda. Eksamil on selle osa eest 20 punkti, õpetaja arvutab tulemuse ümber. Eesmärk on vähemalt 20 punkti (80 %).' }),
      L1('097_t_l1', [
        'Head reisijad! Rong Tartusse ei välju täna kell kümme, vaid kell kümme kolmkümmend. Põhjus on tehniline rike. Palun oodake teisel perroonil. Vabandame hilinemise pärast ja soovime head reisi!',
        'Head kliendid! Meie kauplus suletakse kümne minuti pärast. Palun minge nüüd kassasse. Homme oleme avatud kella kaheksast. Kala ja liha on homme kümme protsenti odavam. Aitäh ja head õhtut!',
        'Spordiklubi teatab: jooga ei ole täna kell kuus, vaid kell seitse, sest uus treener Kati jõuab hiljem. Tund on teisel korrusel, ruumis kolm. Võtke kaasa oma matt ja veepudel.',
        'Apteek Tervis teatab: sel pühapäeval oleme avatud kella kümnest kolmeni. Esmaspäevast on jälle tavalised ajad. Retsepti saab ka telefoni teel uuendada. Täname, et te meie juures käite!',
        'Ja nüüd ilm. Täna on päikeseline ilm ja sooja on kuni kaksteist kraadi. Õhtul tuleb vihma ja tuul läheb tugevamaks. Homme on jälle kuiv, aga jahedam, ainult kaheksa kraadi.',
        'Tähelepanu! Buss number kaheksa sõidab täna teist teed, sest Tartu maanteel on remont. Peatus Kivi ei tööta. Palun minge järgmisse peatusesse, see on kaks minutit jalgsi.',
        'Head külalised! Kontsert algab kümne minuti pärast, kell seitse. Palun lülitage telefonid välja ja võtke oma kohad sisse. Vaheajal saab teisel korrusel kohvi ja kooki osta.',
      ], [
        ['Mis kell rong väljub?', 'kell 10.30', 'kell 10', 'kell 11'], ['Mis tuleb inimestel nüüd teha?', 'minna kassasse', 'osta kala', 'tulla homme'], ['Mis kell on täna jooga?', 'kell 7', 'kell 6', 'kell 3'], ['Mis kellani on apteek pühapäeval avatud?', 'kella kolmeni', 'kella kümneni', 'kella kuueni'],
        ['Mis tuleb õhtul?', 'vihm', 'päike', 'lumi'], ['Miks sõidab buss teist teed?', 'teel on remont', 'buss on katki', 'peatus on uus'], ['Mida tuleb enne kontserti teha?', 'lülitada telefon välja', 'osta kohvi', 'minna teisele korrusele'],
      ]),
      L2('097_t_l2', [
        'Ülle: Tere, kuulajad! Täna on stuudios Viktor, kes parandab jalgrattaid. Viktor, kus teie töökoda on?',
        'Viktor: Tere! Töökoda on Mustamäel, ühes vanas hoovis. Tulete Sõpruse peatuses bussist maha ja näete rohelist ust. Esmaspäeval on kinni, teistel päevadel olen ma seal.',
        'Ülle: Te olete pensionär. Miks te ikka töötate?',
        'Viktor: Sest mulle meeldib! Ma ei taha kodus istuda. Lapsed toovad mulle oma rattaid ja räägivad, kuhu nad sõitsid. Täiskasvanutele ei meeldi nii väga rääkida, nemad vaatavad ainult kella.',
        'Ülle: Mis rattaga kõige rohkem juhtub?',
        'Viktor: Kett! Kett läheb katki või kukub maha. Sügisel on ka kumm tihti tühi. Väikese asja parandan ma kohe ära, see võtab kümme minutit. Suure töö jaoks on vaja kaks päeva.',
        'Ülle: Kas see on kallis?',
        'Viktor: Ei ole. Lastelt ma raha ei võta, kui töö on väike. Täiskasvanu maksab viis või kümme eurot.',
        'Ülle: Kas te sõidate ise ka rattaga?',
        'Viktor: Muidugi. Suvel sõidan ma Tallinnast oma tallu, see on umbes viiskümmend kilomeetrit. Minu õde Helgi ütleb, et see on hull mõte, aga mina olen väga rahul.',
      ], [
        ['Viktori töökoda on Mustamäel.', true], ['Töökoda on esmaspäeval lahti.', false], ['Viktorile meeldib lastega rääkida.', true], ['Viktor parandab väikese töö kahe päevaga.', false], ['Lapsed ei pea väikese töö eest maksma.', true], ['Viktor ei sõida ise enam rattaga.', false],
      ]),
      L3('097_t_l3', [
        'Teadustaja: Tere, head kuulajad! Linna raamatukogus algab uus kursus. Kursus on kõigile, kes õpivad eesti keelt ja tahavad rohkem rääkida. Tunnid on teisipäeviti kell kuus õhtul, teisel korrusel, saalis number viis.',
        'Teadustaja: Kursus algab kolmandal detsembril ja kestab kaks kuud. Kursus on tasuta, aga registreerida tuleb ette, sest kohti on ainult viisteist. Registreerida saab raamatukogu kodulehel või telefoni teel.',
        'Teadustaja: Tundides räägime igapäevastest asjadest: poest, arstist, tööst ja vabast ajast. Õpik ei ole vajalik, sest raamatud saate raamatukogust. Kaasa võtke ainult vihik ja pastakas. Õpetaja on Kadi, kes on selles töös juba kümme aastat olnud. Tulge ja tooge ka oma sõber kaasa!',
      ], ['Tunnid on [teisipäeviti|teisipäeval].', 'Kursus kestab [kaks kuud|2 kuud].', 'Kursusel on [viisteist|15] kohta.', 'Raamatud saab [raamatukogust].', 'Kaasa tuleb võtta vihik ja [pastakas|pastaka].', 'Õpetaja nimi on [Kadi].']),
      L4('097_t_l4', [
        'Tom: Lucía, kuidas sa eksamiks valmistud? Ma kuulsin, et kõik teevad midagi uut.',
        'Lucía: Jah! Mina kuulan iga päev raadiot, juba kümme minutit hommikul. Olga loeb nüüd igal õhtul uudiseid. Ta loeb ainult pealkirja ja esimest lauset, sest nii läheb kiiremini.',
        'Tom: Tubli! Ja Dmitri? Ta on ju rääkimise pärast nii närvis.',
        'Lucía: Dmitri käib neljapäeviti rääkimisklubis kohvikus Pann. Viimati kirjeldas ta seal pilti ja keegi ei naernud. Ta oli väga rõõmus.',
        'Tom: See on hea. Sofia ütles, et ta kirjutab nüüd tööl ainult eesti keeles.',
        'Lucía: Tõesti? Ta kirjutab oma ülemusele Liisile kirju eesti keeles. Liis parandab ühe vea päevas ja saadab tagasi. Väga tore ülemus.',
        'Tom: Ja mina teen seda: kirjutan iga õhtu viis lauset oma päevast. Aga ma ei tea, kes neid parandab.',
        'Lucía: Küsi Aunelt! Aune loeb reedeti keelekoolis õppijate tekste. See tund on reedel kell neli.',
        'Tom: Hea mõte. Kas sa kuulsid, et Ene tegi ka midagi?',
        'Lucía: Ene pani seinale suure kalendri. Seal on iga päeva juures üks väike ülesanne. Täna on: küsi võõralt, kui palju kell on.',
        'Tom: Naljakas! Aga Maret? Kas tal on ka uus plaan?',
        'Lucía: Maret ütleb, et plaani pole vaja, vaid und. Ta ütles, et enne eksamit tuleb vara magama minna. Ta ise läheb sel nädalal metsa jalutama, et rahulik olla.',
      ], [['Olga', 'loeb õhtuti uudiseid.'], ['Dmitri', 'käib rääkimisklubis.'], ['Sofia', 'kirjutab ülemusele eesti keeles.'], ['Aune', 'loeb reedeti õppijate tekste.'], ['Ene', 'pani seinale suure kalendri.'], ['Maret', 'läheb metsa jalutama.']]),
      PART('097_t_spart', 'S', { minutes: 15, points: 20, tasks: 2, note: 'Rääkimine on paaris või õpetajaga: kõigepealt tutvumine, siis pilt ja küsimused, lõpuks ideekaart. Eesmärk on vähemalt 16 punkti (80 %).' }),
      S0('097_t_s0', ['Kuidas teie nimi on?', 'Kus te elate ja kellega?', 'Mida te vabal ajal teete?']),
      S1('097_t_s1', ['Kes on pildil ja mida nad teevad?', 'Mis asjad on laual?', 'Kus sina eesti keelt õpid?', 'Mis aitab sul kõige rohkem õppida?', 'Mida sa eile eesti keeles tegid?'], 'a2-070'),
      S2('097_t_s2', 'Tervis', 'Õhtu pärast tööd. A tahab teada, kuidas B oma tervise eest hoolitseb.', ['Kas sa teed sporti?', 'Mitu tundi sa magad?', 'Millal sa viimati arsti juures käisid?', 'Mida sa sööd hommikul?', 'Mida sa teed, kui oled haige?'], ['Ujumine kaks korda nädalas', 'Seitse tundi', 'Eelmisel kuul', 'Putru ja kohvi', 'Jään koju ja joon teed']),
      B.rubricSpeaking('097_t_rs'),
      B.selfcheck('097_t_self', ['Ma teen eksami osad etteantud aja jooksul.', 'Ma tean, mis osa on minu jaoks kõige kergem.', 'Ma tean, mis osa on minu jaoks kõige nõrgem.', 'Ma tean, mida ma esmaspäevaks parandan.'], 'Kontroll 20 on tehtud'),
    ],
  },

  'a2-098': {
    title: 'Tomi teine katse',
    canDo: 'Ma loen näidisteksti, leian oma korduvad vead ja kirjutan plaani järgi 60–80 sõnaga kirjelduse, mille ma ise üle kontrollin.',
    discover: [
      B.review('098_d_review', [['Kuidas sa ütled, et kuulamine on raskem kui lugemine?', 'a2-096'], ['Mida sa kirjutad kuulutusse, kui sa müüd jalgratast?', 'a2-086'], 'Mis osa läks sul viimases kontrollis kõige paremini?']),
      B.text('098_d_situation', 'Tomi punktid', 'Esmaspäev, 29. november. Maret annab tagasi Kontroll 20 tööd. Tomil on lugemises ja kuulamises head punktid, aga kirjutamises ainult 9 punkti 20-st. Tom on pettunud. Maret saatis talle ka kirja. Mida Tom nüüd tegema peab?'),
      tag(B.reading('098_d_letter', 'Mareti kiri Tomile.', 'Loe kirja ja vasta lühidalt: mis on Tomi vead ja mida ta teeb?', 'Tere, Tom!', [
        'Sinu lugemine ja kuulamine on head. Kirjutamises said sa 9 punkti 20-st. Sinu tekstides on hea sisu, aga kolm viga kordub.',
        'Esiteks: pärast sõna „pean” kirjutad sa „minna”. Õige on „pean minema”. Pärast „tahan”, „võin” ja „saan” on aga „minna”. Teiseks: minevikus kirjutad sa „ei läksin”. Eituses on alati nud-vorm: „ma ei läinud”. Kolmandaks: sa kirjutad „ma lähen kodus”. Küsimus „kuhu?” – vastus „koju”. Küsimus „kus?” – vastus „kodus”.',
        'Teine probleem on aeg. Teises ülesandes kirjutasid sa ainult 22 sõna, aga vaja on vähemalt 30. Soovitan nii: kirjuta kõigepealt märksõnad, siis tekst. Lõpus loe sõnad kokku. Vaata ka Lucía teksti, see on hea näide. Proovime kolmapäeval uuesti! Maret',
      ].join('\n\n'), [
        ['Mitu punkti sai Tom kirjutamises?', '9|üheksa|9 punkti'], ['Mis on Tomi tekstides hea?', 'sisu|hea sisu'], ['Mis tuleb pärast sõna „pean”?', 'ma-vorm|minema|pean minema'], ['Mis vorm on mineviku eituses?', 'nud-vorm|ei läinud'],
        ['Miks kaotas Tom teises ülesandes punkte?', 'tekst oli liiga lühike|ainult 22 sõna|vähem kui 30 sõna'], ['Mida peab Tom tegema enne teksti?', 'kirjutama märksõnad|märksõnad'], ['Mida peab Tom tegema lõpus?', 'lugema sõnad kokku|sõnad kokku lugema'], ['Kelle tekst on hea näide?', 'Lucía|Lucía tekst'],
      ]), { task: 'R14' }),
      B.insertion('098_d_model', 'Lucía näidistekst.', 'Lucía tekstist on neli lauset ära võetud. Pane need õigesse kohta. Üks jääb üle.', 'Minu pühapäev', [
        '[[Eelmisel pühapäeval olin ma terve päeva Tallinnas.]] Ema Maria helistas mulle hommikul Hispaaniast. Me rääkisime kaua, sest ta tuli oktoobris siia ja tahab kevadel jälle tulla.',
        '',
        '[[Kõigepealt läksin ma raamatukokku.]] Seal kuulasin ma kõrvaklappidega vanu eksamitekste. Kuulamine on mulle raskem kui lugemine, seepärast pean ma palju harjutama.',
        '',
        '[[Pärast seda kohtusin ma kohvikus Olgaga.]] Me jõime kohvi ja rääkisime eesti keeles. Ma ei läinud koju enne kella kuut.',
        '',
        '[[See päev meeldis mulle, sest ma olin väga tubli.]] Õhtul tegin ma kodus süüa ja läksin vara magama.',
      ], ['Homme lähen ma tööle bussiga.'], 'g_read'),
      B.notice('098_d_notice', 'Märka: hea tekst ja kolm viga.', [
        '**Plaan:** algus (kus? millal?) → **kõigepealt** … → **pärast seda** … → lõpp (**mulle meeldis**, sest …)',
        '**pean** + ma-vorm: pean **minema**, pean **harjutama** · **tahan / võin / saan** + da-vorm: tahan **minna**, võin **teha**',
        '**Eitus minevikus:** ma **ei läinud**, ma **ei teinud**, ma **ei olnud** (mitte: ei läksin)',
        '**kuhu?** koju, poodi, raamatukokku · **kus?** kodus, poes, raamatukogus',
        '**Pärast ajasõna on tegusõna teine:** Kõigepealt **läksin** ma … · Eile **olin** ma …',
      ], 'full'),
      B.wordforms('098_d_forms', 'Tom parandab.', 'Tom kordab kolme viga. Kirjuta igasse ritta tegusõna või kohasõna õiges vormis.', [
        ['minema', 'Homme pean ma panka …', 'minema'], ['minema', 'Laupäeval tahan ma randa …', 'minna'], ['minema', 'Eile ma ei … trenni.', 'läinud'], ['tegema', 'Eile ma ei … kodutööd.', 'teinud'], ['kodu', 'Õhtul lähen ma …', 'koju'], ['kodu', 'Pühapäeval olen ma terve päeva …', 'kodus'], ['tulema', 'Kas sa saad meile …?', 'tulla'], ['tõusma', 'Homme pean ma vara …', 'tõusma'],
      ]),
      tag(B.gaps('098_d_bank', 'Lucía väikesed sõnad.', 'Lucía laused on seotud. Vali pangast sobiv sõna. Pangas on üks lisasõna.', [
        'Eile olin ma väsinud, [sest] ma töötasin kaua.', 'Ma tahtsin kinno minna, [aga] mul ei olnud aega.', 'Kuulamine on raske, [seepärast] kuulan ma iga päev raadiot.', '[Kõigepealt] sõime me hommikust, siis läksime linna.', 'Pärast seda istusime me kohvikus ja [lõpuks] läksime koju.',
      ], ['sest', 'aga', 'seepärast', 'kõigepealt', 'lõpuks', 'või'], 'full', 'g_vocab'), { task: 'G08' }),
      tag(B.reading('098_d_first', 'Tomi esimene tekst.', 'Tom kirjutas kontrollis selle teksti. Loe kiiresti ja leia vastused.', 'Minu nädalavahetus', [
        'Eelmisel nädalavahetusel ma ei läksin kuhugi. Laupäeval ma olin kodus ja pesin pesu. Siis ma lähen poodi, sest mul ei olnud piima. Pühapäeval tuli minu naaber Lembit. Me jõime kohvi ja rääkisime tema kassist. Õhtul pean ma õppima, aga ma olin väsinud. Ma tahtsin kirjutada Lucíale, aga ma ei tegin seda. Ma vaatasin filmi ja läksin kodus magama. Hommikul ma ei tahan tõusta, sest ilm oli külm ja vihma sadas. Ma jõin kohvi ja läksin tööle bussiga. Buss oli täis ja ma pidin kogu aeg seisma.',
      ], [
        ['Kus oli Tom laupäeval?', 'kodus'], ['Miks Tom poodi läks?', 'tal ei olnud piima|piima pärast'], ['Kes tuli pühapäeval?', 'Lembit|naaber Lembit'], ['Mis Tom Lembitiga jõi?', 'kohvi'], ['Mida Tom õhtul vaatas?', 'filmi'], ['Kellele Tom kirjutada tahtis?', 'Lucíale'], ['Kuidas Tom tööle läks?', 'bussiga'], ['Kuidas ilm hommikul oli?', 'külm|külm ja vihmane|sadas vihma'],
      ]), { task: 'R15', fluency: true }),
      tag(B.writing('098_d_tomweek', 'Tomi tekst korda.', 'Kirjuta Tomi tekst parandatult ümber. Kasuta vähemalt kahte seotud sõna.', [4, 6], ['kõigepealt', 'sest'], 1), { task: 'W06' }),
      teach(tag(B.speaking('098_d_talk', 'Sinu tulemus.', 'Räägi paarilisele oma Kontroll 20 tulemusest. Siis küsi tema tulemuse kohta.', [
        'Mis osa läks sul kõige paremini?', 'Mis osa oli kõige nõrgem?', 'Mis viga sul kordub?', 'Mida sa nüüd teisiti teed?', 'Kes saab sind aidata?',
      ], [60, 120], ['Minu nõrgim osa on …', 'Mul kordub viga …', 'Nüüd ma …']), { task: 'S02', fluency: true }),
        'Üks-ühele: õpilane räägib oma tööst, õpetaja küsib lõpus ainult „Mida sa nüüd teed?”. Ära paranda.'),
    ],
    practice: [
      B.categorize('098_p_where', 'Kuhu, kus või kust?', 'Tomi kolmas viga. Pane iga sõna selle küsimuse alla, millele ta vastab.', [
        ['kuhu?', ['koju', 'poodi', 'tööle', 'raamatukokku']], ['kus?', ['kodus', 'poes', 'tööl', 'raamatukogus']], ['kust?', ['kodust', 'poest', 'töölt', 'raamatukogust']],
      ], 'full', 'g_notice'),
      teach(tag(B.reading('098_p_aune', 'Eksaminurk: reede kell neli.', 'Keelekooli lehes on lugu Aunest. Loe ilma abita ja vasta igale küsimusele paari sõnaga.', 'Reede kell neli', [
        'Igal reedel kell neli on keelekooli ruumis 3 väga vaikne. Seal istub õpetaja Aune ja tema ees on palju paberit. Aune alustas selle tunniga sel sügisel. Enne töötas ta üheksa aastat ajalehes ja luges iga päev teiste inimeste tekste.',
        'Õppijad toovad oma teksti kaasa. Aune ei paranda kohe kõiki vigu. Kõigepealt loeb ta teksti läbi ja ütleb, mis on hea. Siis märgib ta ainult kolm viga. „Kui ma parandan kakskümmend viga, siis ei mäleta inimene ühtegi,” ütleb Aune. Õppija kirjutab need laused ise uuesti. Alles siis saab ta järgmise ülesande.',
        'Alguses tuli tundi ainult kaks inimest. Nüüd on neid kaheksa, rohkem tuppa ei mahu. Üks tund maksab kümme eurot, aga kes toob sõbra, saab järgmise tunni tasuta. Eriti palju on õppijaid enne eksamit.',
        'Aune annab ka ühe lihtsa nõu: kirjuta iga päev viis lauset ja ära viska neid ära. Kuu aja pärast loe esimesi lauseid uuesti. Siis näed ise, kui palju sa oled õppinud.',
      ].join('\n\n'), [
        ['Mis tööd tegi Aune enne keelekooli?', 'töötas ajalehes|ajalehes'], ['Mida teeb Aune tekstiga kõigepealt?', 'loeb läbi|loeb teksti läbi'], ['Mitu viga ta märgib?', 'kolm|3|kolm viga'], ['Kes kirjutab need laused uuesti?', 'õppija|õppija ise'],
        ['Mitu inimest praegu tunnis käib?', 'kaheksa|8'], ['Mida saab õppija, kes toob sõbra?', 'järgmise tunni tasuta|tasuta tunni'], ['Millal tuleb vanu lauseid uuesti lugeda?', 'kuu aja pärast'],
      ]), { task: 'R02', harno: 'R4' }),
        'Nagu Harno A2 lugemise 4. osas: üks tekst ja küsimused. Eksamil on tekst umbes 150 sõna, küsimusi on 5 ja igal küsimusel kolm valikut. Õpilane loeb ise, ilma abita; aeg umbes 8 minutit. Üks punkt küsimuse eest.'),
      B.vocab('098_p_vocab', 'Teksti sõnad.', ['tekst — текст', 'lause — предложение', 'plaan — план', 'tähtis — важный', 'lõpuks — наконец', 'kontrollima — проверять', 'parandama — исправлять', 'vorm — форма']),
      tag(B.transformation('098_p_join', 'Kaks lauset üheks.', 'Tomi laused on väga lühikesed. Ühenda kaks lauset üheks antud sõnaga.', [
        ['Ma jäin koju. Ma olin haige.', 'sest', 'Ma jäin koju, sest ma olin haige.'], ['Ma tahtsin ujuma minna. Ujula oli kinni.', 'aga', 'Ma tahtsin ujuma minna, aga ujula oli kinni.'], ['Kirjutamine on raske. Ma kirjutan iga päev.', 'seepärast', 'Kirjutamine on raske, seepärast kirjutan ma iga päev.|Kirjutamine on raske, seepärast ma kirjutan iga päev.'],
        ['Me sõime. Me läksime parki.', 'kõigepealt … siis', 'Kõigepealt me sõime, siis läksime parki.|Kõigepealt sõime me, siis läksime parki.'], ['Ma lugesin teksti. Ma parandasin vead.', 'pärast seda', 'Ma lugesin teksti, pärast seda parandasin vead.'], ['Ma olin väsinud. Päev oli tore.', 'aga', 'Ma olin väsinud, aga päev oli tore.'],
      ], 'full', 'g_vocab'), { task: 'W09' }),
      B.errorfix('098_d_fix', 'Tomi vanad laused.', 'Need laused on Tomi kontrolltööst. Kirjuta iga lause veata.', [
        ['Ma pean minna poodi leiba ostma.', 'Ma pean minema poodi leiba ostma.'], ['Eelmisel nädalal ma ei läksin kinno.', 'Eelmisel nädalal ma ei läinud kinno.'], ['Pärast tööd ma lähen kodus.', 'Pärast tööd ma lähen koju.'], ['Ma tahan minema sõbra juurde.', 'Ma tahan minna sõbra juurde.'],
        ['Ma ei tegin eile süüa.', 'Ma ei teinud eile süüa.'], ['Eile hommikul ma lähen kohvikusse.', 'Eile hommikul ma läksin kohvikusse.|Eile hommikul läksin ma kohvikusse.'],
      ]),
      tag(B.listening('098_p_voice', 'Mareti häälsõnum.', 'Maret jättis Tomile sõnumi. Kuula kaks korda ja kirjuta lünka üks-kaks sõna.', [
        'Maret: Tere, Tom! Siin Maret. Lugesin sinu uut teksti ja see on palju parem. Sa kirjutasid juba nelikümmend kaks sõna. Kolm vana viga on alles ainult ühes kohas: sa kirjutasid „ma lähen kodus”. Palun paranda see ära.',
        'Maret: Kolmapäeval on proovieksam. Tule veidi varem, kell viis ja nelikümmend. Võta kaasa kaks pastakat ja oma väike nimekiri. Sõnaraamatut pole vaja, seda ei tohi kasutada.',
        'Maret: Reedel saad sa Aune juures veel ühe teksti läbi vaadata. Tema tund on kell neli, ruumis kolm. Too see tekst paberil, Aune ei loe telefonist. Ja Tom, ära muretse! Sa oled palju õppinud. Kohtume kolmapäeval!',
      ], ['Tomi uues tekstis on [nelikümmend kaks|42] sõna.', 'Viga on sõnas [kodus].', 'Kolmapäeval on [proovieksam].', 'Tom peab tulema kell [viis nelikümmend|17.40].', 'Kaasa tuleb võtta kaks [pastakat].', 'Aune tund on reedel kell [neli|4|16].', 'Aune tund on ruumis [kolm|3].', 'Teksti tuleb tuua [paberil].']), { task: 'L07' }),
      teach(tag(B.speaking('098_p_retell', 'Jutusta: mis Tomiga juhtus.', 'Jutusta paarilisele ühe minutiga Tomi lugu. Siis jutusta sama lugu veel kord kiiremini.', [
        'Mitu punkti Tom sai?', 'Mis vead tal korduvad?', 'Mida soovitas Maret?', 'Kes teda aitab?',
      ], [60, 90], ['Tom sai …', 'Tal kordub …', 'Maret soovitas …', 'Lucía …']), { task: 'S07', fluency: true }),
        'Üks-ühele: õpilane jutustab õpetajale kaks korda, õpetaja hoiab aega ega paranda.'),
      teach(tag(B.rolecards('098_p_rank', 'Mis aitab kõige rohkem?', 'A ja B panevad nõuanded järjekorda ja lepivad kokku, mis on kõige tähtsam.',
        'Sinu arvates on kõige tähtsam kirjutada kõigepealt märksõnad. Põhjenda.', 'Sinu arvates on kõige tähtsam lugeda lõpus tekst üle. Põhjenda.',
        ['Kõige rohkem aitab …, sest …', 'Mina panen teisele kohale …'], ['Mina arvan teisiti: …', 'Lepime kokku, et …']), { task: 'S03' }),
        'Üks-ühele: õpetaja paneb nõuanded teise järjekorda. Õpilane põhjendab ja te lepite kokku ühe järjekorra.'),
      tag(B.planning('098_p_plan', 'Minu plaan: „Üks tore päev sel sügisel”.', 'Kirjuta iga küsimuse juurde märksõnad. Täislauseid pole vaja.', ['Kus ja millal see oli? Kellega sa olid?', 'Mida sa kõigepealt tegid?', 'Mida sa pärast seda tegid?', 'Mis sulle kõige rohkem meeldis ja miks?'], 2), { task: 'W11' }),
    ],
    transfer: [
      B.text('098_t_situation', 'Sinu teine katse', 'Kolmapäeval on proovieksam. Täna kirjutab iga õppija oma teise katse. Maret loeb tööd läbi ja ütleb Tomile: „Sinu vead on väiksemad, kui sa arvad.” Nüüd on sinu kord. Teema on „Üks tore päev sel sügisel”. Sul on plaan juba olemas.'),
      tag(B.examWriting('098_t_text', 'Üks tore päev sel sügisel.', 'Kirjuta oma plaani järgi 60–80 sõnaga kirjeldus. Kasuta vähemalt kolme seotud sõna, näiteks kõigepealt, seepärast, aga.', 'jutt', {
        situation: 'Teema: „Üks tore päev sel sügisel”. Teksti loeb sinu õpetaja.',
        points: ['Kus ja millal see oli? Kellega sa olid?', 'Mida sa kõigepealt tegid?', 'Mida sa pärast seda tegid?', 'Mis sulle kõige rohkem meeldis ja miks?'],
        words: [60, 80],
      }), { main: true }),
      tag(B.writing('098_t_edit', 'Loe oma tekst üle.', 'Kontrolli rubriigi järgi kolme viga ja sõnade arvu. Kirjuta tekst puhtalt ümber.', [6, 8], ['kõigepealt', 'sest', 'pärast'], 2), { task: 'W10' }),
      teach(tag(B.examWriting('098_t_invite', 'Kutse pärast eksamit.', 'Kirjuta kursuse inimestele 30–50 sõnaga kutse: pärast eksamit lähevad kõik sööma.', 'kutse', {
        situation: 'Laupäeval, 11. detsembril, on eksam läbi. Sina korraldad väikese lõuna.',
        points: ['Kus ja mis kell te kohtute?', 'Mida te seal teete?', 'Kuidas saab sulle vastata?'],
        words: [30, 50], opening: 'Head sõbrad!', closing: 'Ootan teid!',
      }), { task: 'W03' }), 'Õpilane kirjutab üksi. Õpetaja loeb kutse ja vastab sellele suuliselt.'),
      teach(tag(B.rolecards('098_t_swap', 'Paariline loeb.', 'Vaheta tekstid. A ütleb, mis oli hea ja mida parandada. B küsib. Siis vahetage.',
        'Loe B teksti. Ütle üks hea asi ja üks parandus.', 'Küsi, kas kõik neli punkti on olemas ja mida sa võid veel parandada.',
        ['Mulle meeldis, et …', 'Siin peab olema …', 'Ma soovitan …'], ['Kas kõik punktid on olemas?', 'Kas sa leidsid mõne vea?', 'Mida ma veel parandan?']), { task: 'S13' }),
        'Üks-ühele: õpetaja loeb õpilase teksti ja õpilane õpetaja lühikest näiteteksti. Õpilane ütleb üks hea asi ja üks parandus.'),
      tag(B.speaking('098_t_record', 'Salvesta: minu tore päev.', 'Salvesta kodus 45–60 sekundit. Jutusta oma päevast ilma paberit lugemata.', ['Kus ja millal see oli?', 'Mida sa kõigepealt tegid?', 'Mis siis juhtus?', 'Miks see päev oli tore?'], [45, 60], ['Sel sügisel …', 'Kõigepealt …', 'Pärast seda …', 'Mulle meeldis, sest …']), { task: 'S15' }),
      B.rubricW2('098_t_rubric'),
      B.selfcheck('098_t_self', ['Ma loen näidisteksti ja leian selle plaani.', 'Ma tean oma kolme korduvat viga.', 'Ma seon lauseid: kõigepealt, seepärast, aga.', 'Ma kirjutan kirjelduse 60–80 sõnaga ja loen selle üle.'], 'Teine katse on tehtud'),
    ],
  },

  'a2-099': {
    title: 'Proovieksam 3: kõik neli osa',
    assessment: true,
    canDo: 'Ma teen proovieksami kõik neli osa õigel ajal, võrdlen punkte Kontroll 20 tulemusega ja nimetan oma järgmise sammu (eesmärk on vähemalt 80% igas osas).',
    discover: [
      B.text('099_d_situation', 'Olga kaks tööd', 'Kolmapäev, 1. detsember. Täna on kolmas proovieksam Harno A2 vormis. Eksamini on kümme päeva. Olga tegi eelmisel nädalal Kontroll 20 ja kuulamine läks halvasti. Nädal aega harjutas ta iga päev. Kas ta on nüüd parem? See leht on soojendus enne proovieksamit.'),
      B.notice('099_d_table', 'Olga punktid (igas osas kuni 20)', ['Kontroll 20: lugemine 14, kuulamine 9, kirjutamine 12, rääkimine 13 = **48 p**', 'Harjutustöö pühapäeval: lugemine 16, kuulamine 14, kirjutamine 13, rääkimine 15 = **58 p**'], 'full', 'g_read'),
      B.truefalse('099_d_tf', 'Mida punktid näitavad?', 'Vaata Olga kahe töö punkte. Kas see, mida Tom ütleb, on nii?', [
        ['Teisel korral sai Olga rohkem punkte.', true], ['Kõige rohkem paranes kuulamine.', true], ['Esimesel korral oli tulemus alla 60 %.', false], ['Kirjutamine paranes ainult ühe punkti.', true], ['Rääkimine läks teisel korral halvemini.', false],
      ], 'full'),
      B.reading('099_d_read', 'Kuidas Olga harjutas.', 'Loe, mida Olga sel nädalal tegi. Vasta igale küsimusele lühidalt.', 'Olga nädal', [
        'Pärast kontrolli oli Olga pettunud. Kuulamises sai ta ainult üheksa punkti. Maret ütles, et Olga kirjutab liiga pikki vastuseid. Siis ei jõua ta järgmist küsimust kuulata. Olga tegi plaani. Iga päev kuulas ta kümme minutit raadiot. Bussis kuulas ta telefonist eestikeelseid saateid. Ta harjutas vastama ühe või kahe sõnaga.',
        'Kirjutamises oli tal teine probleem. Ta unustas lõpus teksti kontrollida. Nüüd on tal paberil väike nimekiri: tegusõna, käänded, sõnade arv. Pühapäeval oli kuulamine palju kergem. Olga sai neliteist punkti. See on viis punkti rohkem kui esimesel korral. Kirjutamine paranes vähem, ainult ühe punkti. Olga teab, et peab veel harjutama.',
      ].join('\n\n'), [
        ['Miks oli Olga pettunud?', 'kuulamises oli ainult 9 punkti|ta sai kuulamises vähe punkte'], ['Mis oli Olga viga kuulamises?', 'ta kirjutas liiga pikki vastuseid|liiga pikad vastused'], ['Kus Olga saateid kuulas?', 'bussis'], ['Mis on Olga nimekirjas?', 'tegusõna, käänded, sõnade arv'], ['Mitu punkti rohkem sai Olga kuulamises?', 'viis|5|viis punkti'], ['Miks peab Olga veel harjutama?', 'kirjutamine paranes vähe|kirjutamine paranes ainult ühe punkti'],
      ]),
      B.notice('099_d_notice', 'Märka võrdlust.', ['Kuulamine oli **kergem kui** enne.', 'Olga sai **rohkem** punkte **kui** esimesel korral.', 'Kirjutamine paranes **vähem**.', 'Teine tulemus on **parem**.', 'hea → **parem** · palju → **rohkem** · vähe → **vähem** · kerge → **kergem**'], 'full'),
      B.wordforms('099_d_forms', 'Kirjuta võrdlus.', 'Olga võrdleb oma kahte tööd. Kirjuta iga sõna võrdluse vormis.', [
        ['kerge', '… kui enne', 'kergem'], ['raske', '… kui lugemine', 'raskem'], ['hea', '… tulemus', 'parem'], ['palju', '… punkte', 'rohkem'], ['vähe', '… vigu', 'vähem'], ['kiire', '… kui varem', 'kiirem'], ['pikk', '… tekst', 'pikem'],
      ]),
      B.gaps('099_d_gaps', 'Võrdle tulemusi.', 'Tom kirjutab Olgale tulemuste kohta. Vali pangast sobiv sõna. Pangas on lisasõnu.', [
        'Teine tulemus on [parem] kui esimene.', 'Kuulamises sai Olga viis punkti [rohkem].', 'Nüüd teeb ta [vähem] vigu.', 'Lugemine oli [kergem] kui kuulamine.', 'Kirjutamine on Olgale [raskem] kui rääkimine.',
      ], ['parem', 'hea', 'rohkem', 'palju', 'vähem', 'kergem', 'raskem']),
      B.match('099_d_match', 'Probleem ja lahendus.', 'Õppijatel on viimasel nädalal mured. Ühenda iga mure ja selle lahendus.', [['Vastused on liiga pikad.', 'Kirjutan 1–2 sõna.'], ['Unustan teksti kontrollida.', 'Kasutan nimekirja.'], ['Ma ei saa kõnest aru.', 'Kuulan iga päev raadiot.'], ['Aeg saab otsa.', 'Vaatan kella.'], ['Tekstis on palju uusi sõnu.', 'Otsin ainult märksõnu.'], ['Ma ei tea, mida paarilisele öelda.', 'Küsin ideekaardi järgi.']], 'full', 'g_read'),
      B.choice('099_d_choice', 'Mis lause on õige?', 'Olga räägib oma tulemusest. Igas reas on üks õige lause. Vali see.', [
        ['Olga räägib punktidest.', 'Nüüd on mul rohkem punkte.', 'Nüüd on mul rohkemad punkte.', 'Nüüd on mul palju punktid.'], ['Kuulamine paranes.', 'Kuulamine on nüüd kergem.', 'Kuulamine on nüüd kergemad.', 'Kuulamine on nüüd rohkem kerge.'],
        ['Kirjutamine on raske.', 'Kirjutamine on raskem kui lugemine.', 'Kirjutamine on raskem nagu lugemine.', 'Kirjutamine on raske kui lugemine.'], ['Vigu on vähem.', 'Ma teen vähem vigu.', 'Ma teen vähem vead.', 'Ma teen vähe vigade.'], ['Tulemus on hea.', 'Teine tulemus on parem.', 'Teine tulemus on parim.', 'Teine tulemus on rohkem hea.'],
      ], 'full', 'g_notice'),
      B.table('099_d_count', 'Arvuta muutus.', 'Kui palju Olga kahe töö vahel paranes? Kirjuta muutus tabelisse.', 'Osa, Kontroll 20, Pühapäev, Muutus', ['Lugemine | 14 | 16 | [+2|2|kaks]', 'Kuulamine | 9 | 14 | [+5|5|viis]', 'Kirjutamine | 12 | 13 | [+1|1|üks]', 'Rääkimine | 13 | 15 | [+2|2|kaks]', 'Kokku | 48 | 58 | [+10|10|kümme]'], 'g_notice'),
      B.rolecards('099_d_cards', 'Olga ja Tom.', 'A on Olga, B on Tom. Rääkige tulemustest. Siis vahetage.',
        'Räägi oma kahest tulemusest. Ütle, mis paranes ja miks.', 'Küsi neli küsimust: punktid, mis paranes, mis on raske, mida edasi teha.',
        ['Teisel korral sain …', '… oli kergem kui enne.', 'Kirjutamine on veel raske, sest …'], ['Mitu punkti sa said?', 'Mis paranes kõige rohkem?', 'Mida sa nüüd teed?']),
      B.writing('099_d_write', 'Minu nädal.', 'Kirjuta 5–7 lauset: mida sa pärast kontrolli harjutasid?', [5, 7], ['iga päev', 'rohkem', 'parem'], 2),
      B.translation('099_d_tr', 'Olga mõtted.', 'Olga mõtleb vene keeles. Ütle sama eesti keeles.', ['Во второй раз было легче.', 'Я получила на пять баллов больше.', 'Я делаю меньше ошибок.', 'Мне нужно ещё тренироваться.', 'Аудирование сложнее, чем чтение.', 'Каждый день я слушаю радио.']),
      teach(B.speaking('099_d_warm', 'Võrdle oma osi.', 'Võrdle enne eksamit õpetajale oma lugemist ja kuulamist. Räägi umbes üks minut.', ['Kumb on sulle kergem?', 'Miks?', 'Mida sa sel nädalal rohkem harjutasid?'], [60, 90], ['… on kergem kui …, sest …', 'Ma tegin rohkem …']),
        'Õpetaja küsib nagu eksamineerija. Ära paranda, pane tähele ainult võrdlust.'),
    ],
    practice: [
      PART('099_p_wpart', 'W', { minutes: 30, points: 20, tasks: 2, note: 'Kirjutage ilma sõnaraamatuta. Kirjutage kõigist punktidest. Teises ülesandes valige üks kahest teemast. Proovieksami eesmärk on vähemalt 16 punkti (80 %).' }),
      W1('099_p_w1', 'Peeter Lepp, automehaanik · Töökoda Kiire Ratas, Tööstuse 3, Viljandi · E–R 8–17, L 9–13 · tel 5678 1234 · info@kiireratas.ee', ['Kes on Peeter Lepp?', 'Kus ta töötab?', 'Millal töökoda avatud on?', 'Kuidas saab temaga ühendust võtta?']),
      B.rubricW1('099_p_rw1', ['kes ta on', 'kus ta töötab', 'millal töökoda avatud on', 'kuidas ühendust võtta']),
      W2A('099_p_w2a', 'Sa tahad pühapäeval minna sõbraga jõuluturule. Kirjuta talle.', ['Kuhu ja mis päeval te lähete?', 'Mis kell ja kus te kohtute?', 'Mida sa seal teha tahad?']),
      W2B('099_p_w2b', 'Minu eelmine suvi', ['Kus sa olid ja kellega?', 'Mida sa seal tegid?', 'Mis sulle kõige rohkem meeldis ja miks?']),
      B.rubricW2('099_p_rw2'),
      PART('099_p_rpart', 'R', { minutes: 50, points: 29, tasks: 5, note: 'Viis ülesannet nagu eksamil. Lugege iga ülesande juhist hoolikalt. Eksamil on selle osa eest 20 punkti, õpetaja arvutab tulemuse ümber. Proovieksami eesmärk on vähemalt 24 punkti (80 %).' }),
      R1('099_p_r1', [
        ['Sõber kolis uude korterisse. Mida ütled?', 'Palju õnne uue kodu puhul!', 'Head reisi!', 'Jõudu tööle!'], ['Sa tuled hommikul tööle. Mida ütled kolleegidele?', 'Tere hommikust!', 'Head õhtut!', 'Head ööd!'], ['Kolleeg on haige. Mida kirjutad talle?', 'Saa ruttu terveks!', 'Head isu!', 'Edu eksamil!'],
        ['Sa tahad poes abi küsida. Kuidas alustad?', 'Vabandage, kas te saate mind aidata?', 'Kuule, anna see siia!', 'Aitäh, kõik on korras.'], ['Sõber ütleb: „Ma sain uue töö!” Mida vastad?', 'Tubli! Palju õnne!', 'Kahju küll!', 'Pole viga!'], ['Sa olid õhtul sõbra juures ja lähed nüüd koju. Mida ütled talle?', 'Aitäh, oli väga tore!', 'Tere tulemast!', 'Head isu!'],
      ]),
      R2('099_p_r2', [
        ['Otsime abikokka', 'Otsime kohvikusse abikokka. Töö on hommikuti kella seitsmest kolmeni, nädalavahetusel on vaba. Eesti keel peab olema suhtlustasemel. Kogemus ei ole vajalik, õpetame ise. Töö algab jaanuaris. Lõuna on tasuta ja kohvi saad nii palju, kui tahad. Kirjuta: tood@kohvikmaasikas.ee'],
        ['Müüa diivan', 'Müüa korralik diivan. Värv on hall, pikkus kaks meetrit. Diivanist saab teha ka voodi, nii et külaline saab sellel magada. Hind on 120 eurot. Pead ise ära viima, kolmandalt korruselt, lifti majas ei ole. Maksta saab ainult sularahas. Helista õhtuti: 5345 1122.'],
        ['Kadunud rahakott', 'Kaotasin pühapäeval Raekoja platsil musta rahakoti. Rahakotis on pangakaart ja pere foto. Raha seal palju ei ole, aga foto on mulle väga tähtis. Leidjale annan 30 eurot. Palun helista või kirjuta mulle igal ajal. Tel 5678 9900. Aitäh! Piret'],
      ], [['Kes seda tööd varem teinud ei ole, võib ka kirjutada.', 'A'], ['Seda asja tuleb ise trepist alla tassida.', 'B'], ['Selle inimese jaoks on kõige tähtsam üks pilt.', 'C'], ['Sellel saab ka külaline magada.', 'B'], ['Nädalavahetusel ei pea tööle tulema.', 'A'], ['Kes selle asja üles leiab, saab raha.', 'C']]),
      R3('099_p_r3', ['Ainult sularaha', 'Märg põrand!', 'Koertega sisenemine keelatud', 'Avatud 24 h', 'Hoida külmkapis'], ['Kaardiga siin maksta ei saa.', 'Siin tuleb ettevaatlikult käia.', 'Koeraga siia minna ei tohi.', 'Siia saab minna ka öösel.', 'Toode peab olema külmas.']),
      B.reading('099_p_text', 'Lugemine 4. Lugu.', 'Lugege lehe lugu ühe mehe uuest tööst. Küsimused on järgmises ülesandes.', 'Aleksei uus töö', [
        'Aleksei elas kümme aastat Narvas ja töötas tehases. Eelmisel kevadel sai ta uue töö Tallinnas. Nüüd on ta bussijuht. Alguses oli see raske. Ta pidi õppima linna tänavaid ja peatuste nimesid. Paljud reisijad küsivad temalt eesti keeles teed. Aleksei ei saanud alguses kõigest aru, sest inimesed rääkisid kiiresti.',
        'Siis hakkas ta keelekursusel käima. Kursus on kaks korda nädalas õhtuti. Nüüd räägib Aleksei reisijatega julgelt. Kõige raskemad on telefonikõned, sest liinil on müra.',
        'Aleksei naine ja poeg kolisid Tallinnasse alles sügisel. Poeg läks uude kooli ja leidis kiiresti sõpru. Pere elab Mustamäel kahetoalises korteris. Nädalavahetusel sõidavad nad tihti Narva. Seal elavad Aleksei vanemad. Aleksei plaanib järgmisel aastal teha B1 eksami, sest ta tahab tööl edasi jõuda.',
      ].join('\n\n'), []),
      R4('099_p_r4', [
        ['Mis tööd tegi Aleksei Narvas?', 'Ta töötas tehases.', 'Ta oli bussijuht.', 'Ta oli õpetaja.'], ['Miks oli alguses raske reisijatest aru saada?', 'Nad rääkisid kiiresti.', 'Nad rääkisid ainult vene keelt.', 'Buss oli liiga täis.'], ['Mis on Alekseile praegu kõige raskem?', 'telefonikõned', 'linna tänavad', 'peatuste nimed'],
        ['Millal kolis pere Tallinnasse?', 'sügisel', 'eelmisel kevadel', 'kümme aastat tagasi'], ['Miks sõidab pere tihti Narva?', 'Seal elavad Aleksei vanemad.', 'Seal on Aleksei töö.', 'Poeg käib seal koolis.'],
      ]),
      R5('099_p_r5', 'Tere, Kaja!', [
        'Kuidas sul läheb? Mul on suur uudis: ma {*leidsin|leian|leidma} uue töö! Alates märtsist töötan ma {*raamatukogus|raamatukokku|raamatukogust}. Töö algab kell üheksa ja lõpeb kell viis. Ma ei {*pea|pean|pidin} enam nii vara tõusma. Eile käisin ma oma uute {*kolleegidega|kolleegid|kolleegide} tutvumas. Kõik olid väga sõbralikud.',
        '',
        'Laupäeval tahan ma seda {*tähistada|tähistama|tähistan} väikese peoga. Kas sa {*saad|saada|saame} tulla? Pidu algab kell seitse minu {*juures|juurde|juurest}. Palun võta kaasa {*oma|omad|omaga} kitarr!',
        '',
        'Ootan sinu vastust! Piret',
      ]),
    ],
    transfer: [
      B.text('099_t_intro', 'Proovieksam: kuulamine ja rääkimine', 'Nüüd on järjekorras kuulamine ja siis rääkimine. Pildil rääkimisosas on Anna ja Sofia, kes võrdlevad järgmise nädala plaane. Lõpus võrdled oma punkte Kontroll 20 tulemusega.'),
      PART('099_t_lpart', 'L', { minutes: 30, points: 25, tasks: 4, note: 'Iga teksti kuulete kaks korda. Enne iga ülesannet on aega küsimusi lugeda. Eksamil on selle osa eest 20 punkti, õpetaja arvutab tulemuse ümber. Proovieksami eesmärk on vähemalt 20 punkti (80 %).' }),
      L1('099_t_l1', [
        'Tähelepanu! Täna õhtul kell kuus on majas vee väljalülitamine. Vett ei ole kella kaheksani. Palun võtke vett varem kõrvale. Kui on küsimusi, helistage majahaldurile. Täname mõistva suhtumise eest!',
        'Lõunasöögi aeg on täna muutunud. Söökla on avatud kella kaheteistkümnest kuni kella kaheni. Supp maksab kaks eurot ja praad neli eurot. Kohvi saab tasuta, kui sul on oma tass kaasas.',
        'Raadiokuulajad, tähelepanu! Täna öösel tuleb palju lund. Tallinnas võib olla kümme sentimeetrit lund. Autojuhid, sõitke aeglaselt! Homme hommikul minge tööle bussiga või tulge varem välja.',
        'Lugupeetud külastajad! Muuseum suletakse poole tunni pärast, kell viis. Pileteid enam ei müüda. Muuseumi pood on avatud veel kümme minutit pärast muuseumi. Täname külastamast ja tulge jälle!',
        'Tere! Siin kooli direktor. Homme, reedel, tunde ei ole, sest koolimajas on remont. Lapsed saavad kodutööd e-kooli. Esmaspäeval algab kool tavalisel ajal, kell kaheksa. Head nädalavahetust!',
        'Hea klient! Teie pakk on jõudnud pakiautomaati Kaubamaja juures. Teie kood on neli-kaks-seitse-üks. Pakk ootab teid viis päeva. Pärast seda läheb pakk tagasi saatjale. Aitäh, et meid kasutasite!',
        'Ja nüüd sport. Täna õhtul mängis Tallinna meeskond Tartuga ja võitis kolm üks. Kolm väravat lõi noor mängija Martin Kask. Järgmine mäng on pühapäeval kell neli Tartus.',
      ], [
        ['Mis kellani vett ei ole?', 'kella kaheksani', 'kella kuueni', 'kella viieni'], ['Mis maksab neli eurot?', 'praad', 'supp', 'kohv'], ['Mis tuleb täna öösel?', 'lumi', 'vihm', 'tuul'], ['Mis kell muuseum suletakse?', 'kell viis', 'kell neli', 'kell kuus'],
        ['Miks reedel tunde ei ole?', 'majas on remont', 'õpetaja on haige', 'on püha'], ['Mitu päeva pakk ootab?', 'viis', 'neli', 'seitse'], ['Kes võitis mängu?', 'Tallinn', 'Tartu', 'keegi ei võitnud'],
      ]),
      L2('099_t_l2', [
        'Ülle: Tere, kuulajad! Täna räägime puhkusest. Stuudios on kokk Jaan Mets. Jaan, te olite suvel perega Saaremaal?',
        'Jaan: Tere! Jah, olime nädal aega. Sõitsime autoga ja siis praamiga. Praam sõitis ainult pool tundi. Lapsed tahtsid kogu aeg laevast merd vaadata.',
        'Ülle: Kus te elasite?',
        'Jaan: Me üürisime väikese maja mere ääres. Seal oli ka saun. Muki, meie koer, oli väga rahul, sest ta sai kogu aeg väljas joosta.',
        'Ülle: Kas ilm oli hea?',
        'Jaan: Esimesed kolm päeva sadas vihma. Siis tuli päike välja. Vihmaga käisime Kuressaare lossis muuseumis. Lastele meeldis väga, eriti Oskarile.',
        'Ülle: Te olete kokk. Kas te tegite puhkusel ka süüa?',
        'Jaan: Muidugi! Kadri ütles, et ma ei tohi puhkusel köögis olla, aga ma ei saa teisiti. Tegin igal õhtul kala. Kala ostsin otse kaluritelt.',
        'Ülle: Kas te saite ka ujuda?',
        'Jaan: Jah, aga vesi oli külm, ainult seitseteist kraadi. Ujusin ainult mina. Teised vaatasid mind kaldalt ja naersid.',
        'Ülle: Kas lähete järgmisel aastal jälle?',
        'Jaan: Ei, järgmisel suvel tahame minna Hiiumaale. Seal on rahulik ja ma pole seal kunagi käinud.',
      ], [
        ['Jaan sõitis Saaremaale bussiga.', false], ['Pere elas väikeses majas mere ääres.', true], ['Esimestel päevadel oli ilm väga ilus.', false], ['Lastele meeldis loss.', true], ['Jaan ostis kala kaluritelt.', true], ['Kogu pere käis meres ujumas.', false],
      ]),
      L3('099_t_l3', [
        'Teadustaja: Tere! Siin on spordiklubi Energia. Kuulake meie uudiseid. Alates esmaspäevast on klubi avatud juba kell kuus hommikul, sest paljud inimesed tahavad enne tööd trenni teha.',
        'Teadustaja: Meil on uus treener Kati. Tema juhib joogat teisipäeval ja neljapäeval. Tund kestab ühe tunni ja algab kell seitse õhtul. Esimene tund on tasuta. Võtke kaasa oma matt ja veepudel.',
        'Teadustaja: Hinnad muutuvad ka. Kuu pilet maksab nüüd kolmkümmend viis eurot. Õpilastele ja pensionäridele on pilet kakskümmend eurot. Pileti saab osta kassast või internetist.',
        'Teadustaja: Parkida saab maja taga, see on tasuta. Jalgrattad pange palun ukse kõrvale. Kui teil on küsimusi, küsige kassast. Tulge trenni, kohtume Energias!',
      ], ['Klubi on hommikul avatud kell [kuus|6].', 'Uue treeneri nimi on [Kati].', 'Jooga on teisipäeval ja [neljapäeval].', 'Esimene tund maksab: [tasuta|mitte midagi].', 'Kuu pilet maksab [kolmkümmend viis|35] eurot.', 'Parkida saab maja [taga].']),
      L4('099_t_l4', [
        'Sofia: Jaan, ema küsis, kes mida jõuludeks teeb. Ta tuleb meile kahekümne neljandal. Kas sul on plaan?',
        'Jaan: Muidugi! Mina teen praadi ja kartuleid. Seda ma oskan. Aga köögis on vaja abi. Kadri teeb piparkoogid. Ta tegi neid juba eelmisel aastal lastega ja need olid väga head.',
        'Sofia: Tore. Aga kuusk? Eelmisel aastal oli meil väike ja kõver kuusk.',
        'Jaan: Viktor toob kuuse oma metsast. Ta lubas, et see on seekord suur ja sirge. Ta tuleb autoga juba reedel.',
        'Sofia: Väga hea. Ma ostan siis kingitused lastele. Mia tahab uusi värve ja Oskar palli. Ma lähen pühapäeval turule.',
        'Jaan: Hea. Ja Mia lubas juba, et joonistab kõigile kaardi. Ta teeb seda iga päev pärast lasteaeda.',
        'Sofia: Kui armas! Ja Oskar? Ta ei taha ju kunagi midagi teha.',
        'Jaan: Oskar õpib koolis uue laulu ja laulab seda laua ääres. Ta on väga närvis, aga ma ütlesin, et me kõik laulame temaga koos.',
        'Sofia: Ja ema? Ta tahab kindlasti ka midagi teha.',
        'Jaan: Muidugi. Ema küpsetab oma pannkoogid jõuluhommikuks. Seda ta ei anna kellelegi teisele.',
        'Sofia: Selge. Siis on kõik korras. Ma helistan talle õhtul ja räägin.',
      ], [['Kadri', 'teeb piparkoogid.'], ['Viktor', 'toob metsast kuuse.'], ['Sofia', 'ostab lastele kingitused.'], ['Mia', 'joonistab kõigile kaardi.'], ['Oskar', 'laulab uue laulu.'], ['Helgi', 'küpsetab pannkoogid.']]),
      PART('099_t_spart', 'S', { minutes: 15, points: 20, tasks: 2, note: 'Rääkimine on paaris või õpetajaga: kõigepealt tutvumine, siis pilt ja küsimused, lõpuks ideekaart. Proovieksami eesmärk on vähemalt 16 punkti (80 %).' }),
      S0('099_t_s0', ['Mis on teie nimi ja kust te pärit olete?', 'Mis tööd te teete?', 'Kui kaua te eesti keelt õpite?']),
      S1('099_t_s1', ['Kes on pildil ja mida nad teevad?', 'Mis on seinal?', 'Mis on sinu plaan järgmiseks nädalaks?', 'Mida sa tavaliselt laupäeval teed?', 'Kumb sulle rohkem meeldib, tööpäev või vaba päev? Miks?'], 'a2-085'),
      S2('099_t_s2', 'Kodu', 'Õhtu pärast tööd. A läheb esimest korda B-le külla ja küsib tema kodu kohta.', ['Kas sa elad korteris või majas?', 'Mitu tuba teil on?', 'Millised on su naabrid?', 'Mis sulle kodus kõige rohkem meeldib?', 'Kuidas sa siit tööle saad?'], ['Korteris, neljandal korrusel', 'Kolm tuba ja köök', 'Vanad ja sõbralikud', 'Suur aken parki', 'Bussiga, kakskümmend minutit']),
      B.rubricSpeaking('099_t_rs'),
      B.table('099_t_compare', 'Võrdle punkte.', 'Kirjuta oma Kontroll 20 ja Proovieksam 3 punktid. Märgi, kus sa oled juba 80 % juures.', 'Osa, Kontroll 20, Proovieksam 3, Muutus', ['Lugemine | | | ', 'Kuulamine | | | ', 'Kirjutamine | | | ', 'Rääkimine | | | ']),
      B.selfcheck('099_t_self', ['Ma teen kõik neli osa õigel ajal.', 'Ma võrdlen punkte: parem, rohkem, vähem kui.', 'Ma tean, mis osas ma olen juba 80 % juures.', 'Ma tean oma järgmist sammu enne eksamit.'], 'Proovieksam 3 on tehtud'),
    ],
  },

  'a2-100': {
    title: 'Lõpphindamine: A2 on käes',
    assessment: true,
    canDo: 'Ma lahendan lõpphindamise neli osa iseseisvalt, hindan oma oskusi „Ma oskan…” lausetega ja koostan oma plaani B1 poole (eesmärk on vähemalt 80% igas osas).',
    discover: [
      B.text('100_d_situation', 'Kursuse viimane tund', 'Esmaspäev, 6. detsember. Kursuse viimane tund. Laupäeval on eksam. Olga alustas A2 kursust aasta tagasi. Siis oskas ta ainult ennast tutvustada. Nüüd ajab ta eesti keeles asju poes, arsti juures ja tööl. Täna teed sina viimase proovi, Lõpphindamise. See leht on soojendus.'),
      B.truefalse('100_d_tf', 'Mis on sellest aastast meeles?', 'Mõtle Olga loole ja ütle, kas see, mida Lucía räägib, on nii.', [
        ['Olga alustas kursust kuu aega tagasi.', false], ['Kursuse alguses oskas Olga ennast tutvustada.', true], ['Nüüd räägib Olga arsti juures eesti keelt.', true], ['Olga ei taha enam eesti keelt õppida.', false], ['Olga järgmine eesmärk on B1.', true],
      ], 'full'),
      B.reading('100_d_read', 'Olga A2 teekond.', 'Olga kirjutas kursuse lehele oma loo. Loe seda ja vasta igale küsimusele lühidalt.', 'Olga aasta', [
        'Aasta tagasi tulin ma esimesse eesti keele tundi. Ma oskasin öelda ainult oma nime ja vanust. Poes näitasin ma näpuga. Arsti juurde läksin ma koos naabriga, sest naaber rääkis eesti keelt. Kursusel õppisin ma kõigepealt rääkima endast ja oma perest. Siis tulid pood, linn, tervis ja töö.',
        'Kõige raskem oli minevik. „Läksin, tulin, tegin” – need vormid tundusid võimatud. Ma kirjutasin iga päev kolm lauset oma päevast. Pool aastat hiljem märkasin ma, et vormid tulevad ise. Nüüd helistan ma ise perearstile ja panen aja kinni. Tööl räägin ma kolleegidega lõunal eesti keeles.',
        'Kuulamine on mul veel kõige nõrgem. Järgmisel aastal tahan ma teha B1 eksami. Minu plaan on lihtne: iga päev kümme minutit raadiot ja kord nädalas rääkimisklubi.',
      ].join('\n\n'), [
        ['Mida oskas Olga aasta tagasi öelda?', 'oma nime ja vanust|nime ja vanust'], ['Miks läks Olga arsti juurde koos naabriga?', 'naaber rääkis eesti keelt|ta ei osanud ise eesti keelt'], ['Mis oli Olgale kõige raskem?', 'minevik|mineviku vormid'], ['Kuidas Olga minevikku harjutas?', 'kirjutas iga päev kolm lauset|kirjutas iga päev oma päevast'], ['Mis on Olgal praegu kõige nõrgem?', 'kuulamine'], ['Mida Olga B1 jaoks teeb?', 'kuulab raadiot ja käib rääkimisklubis|iga päev raadio, kord nädalas rääkimisklubi'],
      ]),
      B.notice('100_d_notice', 'Märka: kuidas ennast hinnata.', ['**Ma oskan** perearstile helistada.', '**Ma oskan juba** kolleegidega rääkida.', '**Ma veel ei oska** kiiret kõnet hästi kuulata.', '**Mul on vaja** rohkem kuulamist harjutada.', '**Järgmisena tahan** teha B1 eksami.', 'oskan + **da**-vorm: oskan **rääkida**, oskan **kirjutada**'], 'full'),
      B.categorize('100_d_cat', 'Mis osaoskus?', 'Pane iga „Ma oskan…” lause selle osa alla, kuhu see kuulub.', [
        ['Lugemine', ['loen kuulutust', 'leian sildilt lahtiolekuaja']], ['Kuulamine', ['saan aru teatest jaamas', 'kirjutan telefonist kuuldud kellaaja']], ['Kirjutamine', ['kirjutan kutse', 'täidan ankeedi']], ['Rääkimine', ['kirjeldan pilti', 'panen telefonis aja kinni']],
      ], 'full', 'g_vocab'),
      B.wordforms('100_d_da', 'Ma oskan + da-vorm.', 'Mida sa oskad? Kirjuta iga tegusõna da-vormis.', [
        ['rääkima', 'Ma oskan …', 'rääkida'], ['kirjutama', 'Ma oskan …', 'kirjutada'], ['lugema', 'Ma oskan …', 'lugeda'], ['helistama', 'Ma oskan arstile …', 'helistada'], ['kuulama', 'Ma oskan raadiot …', 'kuulata'], ['täitma', 'Ma oskan ankeeti …', 'täita'],
      ]),
      B.gaps('100_d_gaps', 'Olga lausetes.', 'Olga loos on sõnad puudu. Kirjuta sulgudes olev sõna lausesse õiges vormis.', [
        'Aasta tagasi [tuli] (tulema) Olga esimesse tundi.', 'Ta [ei osanud] (oskama, eitus) palju öelda.', 'Nüüd helistab ta ise [perearstile] (perearst).', 'Lõunal räägib ta [kolleegidega] (kolleegid).', 'Kuulamine on talle [raskem] (raske) kui lugemine.', 'Kord nädalas läheb ta [rääkimisklubisse] (rääkimisklubi).',
      ]),
      B.transformation('100_d_trans', 'Siis ja nüüd.', 'Mis on aastaga muutunud? Kirjuta lause antud sõnaga.', [
        ['Ma ei oska helistada.', 'nüüd', 'Nüüd ma oskan helistada.|Nüüd oskan ma helistada.'], ['Ma oskan ainult nime öelda.', 'aasta tagasi', 'Aasta tagasi ma oskasin ainult nime öelda.|Aasta tagasi oskasin ma ainult nime öelda.'], ['Kuulamine on raske. Lugemine on kerge.', 'raskem kui', 'Kuulamine on raskem kui lugemine.'], ['Ma kuulan raadiot.', 'pean', 'Ma pean raadiot kuulama.'], ['Ma lähen rääkimisklubisse.', 'tahan', 'Ma tahan rääkimisklubisse minna.|Ma tahan minna rääkimisklubisse.'],
      ]),
      B.dictation('100_d_dict', 'Viimane etteütlus.', 'Õpetaja loeb kuus lauset sellest, mida õppija oskab. Kirjuta iga lause üles.', ['Ma oskan perearstile helistada.', 'Ma saan aru lühikestest teadetest.', 'Kirjutamine on mulle veel raske.', 'Ma tahan teha B1 eksami.', 'Kord nädalas käin ma rääkimisklubis.', 'Ma ei karda enam rääkida.'], 6),
      B.writing('100_d_write', 'Minu A2 aasta.', 'Kirjuta 5–7 lauset: mida oskasid alguses, mida oskad nüüd, mis on veel raske.', [5, 7], ['alguses', 'nüüd', 'oskan', 'veel'], 3),
      B.rolecards('100_d_cards', 'Mida sa nüüd oskad?', 'A küsib, mida B aasta jooksul õppis, B vastab. Siis vahetage.',
        'Küsi neli küsimust: mis oli raske, mis on nüüd kerge, kus sa eesti keelt räägid, mis on järgmine samm.', 'Vasta igale küsimusele kahe lausega.',
        ['Mis oli sulle kõige raskem?', 'Kus sa nüüd eesti keelt räägid?', 'Mis on sinu järgmine samm?'], ['Alguses oli raske …', 'Nüüd ma räägin …', 'Järgmisena tahan …']),
      teach(B.speaking('100_d_warm', 'Kuidas aasta läks?', 'Räägi õpetajale umbes kaks minutit, kuidas sinu aasta läks.', ['Mida sa kursuse alguses oskasid?', 'Mida sa nüüd eesti keeles teed?', 'Mis on veel raske?', 'Mida sa järgmisena tahad õppida?'], [60, 120], ['Alguses ma oskasin ainult …', 'Nüüd ma oskan …', 'Mul on vaja rohkem …']),
        'Õpetaja kuulab ega paranda. See on soojendus ja väike tagasivaade.'),
    ],
    practice: [
      PART('100_p_wpart', 'W', { minutes: 30, points: 20, tasks: 2, note: 'Kirjutage ilma sõnaraamatuta. Kirjutage kõigist punktidest. Teises ülesandes valige üks kahest teemast. Lõpphindamise eesmärk on vähemalt 16 punkti (80 %).' }),
      W1('100_p_w1', 'Keelekool Samm-sammult · Kooli 4, Pärnu, bussijaama lähedal · B1 kursus T ja N 18–20, algus 1. veebruaril · tel 5600 7700 · info@sammsammult.ee', ['Mis kool see on ja mis kursus seal on?', 'Kus kool asub?', 'Millal kursus toimub?', 'Kuidas saab registreerida?']),
      B.rubricW1('100_p_rw1', ['mis kool ja kursus', 'kus kool asub', 'millal kursus toimub', 'kuidas registreerida']),
      W2A('100_p_w2a', 'Sinu sõber kolib teise linna. Sina korraldad talle väikese peo. Kirjuta teisele sõbrale.', ['Miks sa peo teed?', 'Kus ja millal pidu on?', 'Mida tuleb kaasa võtta?']),
      W2B('100_p_w2b', 'Minu eesti keele aasta', ['Mida sa aasta alguses oskasid?', 'Mida sa nüüd oskad?', 'Mis on sinu jaoks veel raske?']),
      B.rubricW2('100_p_rw2'),
      PART('100_p_rpart', 'R', { minutes: 50, points: 29, tasks: 5, note: 'Viis ülesannet nagu eksamil. Tehke kõik ilma abita. Eksamil on selle osa eest 20 punkti, õpetaja arvutab tulemuse ümber. Lõpphindamise eesmärk on vähemalt 24 punkti (80 %).' }),
      R1('100_p_r1', [
        ['Kolleeg läheb homme eksamile. Mida ütled?', 'Edu!', 'Terviseks!', 'Head isu!'], ['Sa kohtad õhtul naabrit. Mida ütled?', 'Tere õhtust!', 'Tere hommikust!', 'Head ööd!'], ['Sõber aevastab. Mida ütled?', 'Terviseks!', 'Edu!', 'Palju õnne!'],
        ['Sa ei saanud telefonis nimest aru. Mida ütled?', 'Vabandust, palun korrake nime!', 'Aitäh, kõik on selge.', 'Head aega!'], ['Sõber kutsub sind kinno, aga sul pole aega. Mida ütled?', 'Aitäh, aga täna ma kahjuks ei saa.', 'Jah, tulen hea meelega!', 'Pole tänu väärt.'], ['Reede õhtul lahkud töölt. Mida ütled kolleegidele?', 'Head nädalavahetust!', 'Head uut aastat!', 'Tere tulemast!'],
      ]),
      R2('100_p_r2', [
        ['Kadunud kass', 'Kadunud kass! Meie hall kass Kiki kadus pühapäeva õhtul Kuuse tänaval. Tal on valge saba ja punane kaelarihm. Kiki on sõbralik, aga kardab koeri. Kui sa nägid teda, palun helista: 5233 4455. Leidjale anname 50 eurot. Lapsed on väga kurvad ja ootavad teda koju. Aitäh! Perekond Tamm'],
        ['Raamatukogu suvel', 'Linnaraamatukogu teatab: suvel muutuvad lahtiolekuajad. Juunis, juulis ja augustis oleme avatud esmaspäevast reedeni kella kümnest kuueni. Laupäeval ja pühapäeval on raamatukogu suletud. Raamatuid saab tagastada ka maja ees olevasse kasti. Lastele on suvel lugemisvõistlus ja võitja saab raamatu.'],
        ['Unustatud müts', 'Tere, Anna! Tänan, et sa eile lapsi hoidsid. Nad räägivad ainult sinust! Kahjuks unustas Eliise sinu juurde oma mütsi. Kas ma võin homme pärast tööd selle ära tuua? Ma saan tulla umbes kella kuue paiku. Kui see ei sobi, kirjuta mulle. Toon sulle kooki ka. Kaja'],
      ], [['Selle teksti kirjutaja otsib oma looma.', 'A'], ['See inimene tahab midagi ära tuua.', 'C'], ['Siia saab raamatu tuua ka siis, kui uks on kinni.', 'B'], ['Selles tekstis on kirjas looma kaelarihma värv.', 'A'], ['Nädalavahetusel ei saa siia sisse.', 'B'], ['Selle kirja kirjutaja tänab abi eest.', 'C']]),
      tag(B.match('100_p_r3', 'Lugemine 3. Sildid ja teated.', 'Lugege silte. Ühendage iga silt selle tähendusega.', [
        ['Juuksur: aeg ainult internetis', 'Sa pead enne arvuti taga aja kinni panema.'], ['Pood: E–P 8–22', 'Sa saad pühapäeva õhtul piima osta.'], ['Rattaparandus: valmib 1 päevaga', 'Sinu jalgratas on homme korras.'], ['Ujula suletud 1.–15. juulini', 'Juuli alguses ei saa siin ujuda.'], ['Pagariäri: värske sai iga päev kell 7', 'Hommikul saad siit sooja saia.'],
      ], 'full', 'g_read'), { task: 'R07', harno: 'R3' }),
      B.reading('100_p_text', 'Lugemine 4. Jaani peenar.', 'Lugege ajakirjast lugu ühest linnamehest ja tema aiast. Küsimused on järgmises ülesandes.', 'Jaani peenar', [
        'Jaan elab Tallinnas vanas puumajas. Tal ei ole oma aeda, aga ta armastab köögivilju kasvatada. Eelmisel kevadel kuulis ta raadiost, et linnas on uus ühine aed. Seal saab iga inimene rentida väikese peenra. Rent maksab kakskümmend eurot aastas. Jaan läks kohe vaatama, sest ta tahtis oma lastele näidata, kuidas toit kasvab.',
        'Aed asub jõe ääres, bussipeatusest viie minuti kaugusel. Jaan istutas kartulit, porgandit ja tilli. Vett saab võtta suurest tünnist. Aias on ka väike maja, kus on tööriistad. Iga kuu esimesel laupäeval teevad kõik koos aias tööd. Pärast seda süüakse koos suppi.',
        'Jaani naaber aias on vanem proua Leida. Ta õpetas Jaanile palju. Sügisel oli saak hea. Jaan andis porgandeid ka oma kolleegidele ja kohvikus tehti neist hea supp. Järgmisel aastal tahab ta kasvatada ka maasikaid.',
      ].join('\n\n'), []),
      R4('100_p_r4', [
        ['Miks rendib Jaan peenra?', 'Tal ei ole oma aeda.', 'Ta tahab tööd leida.', 'Tal on vaja raha.'], ['Kui palju maksab peenar?', '20 eurot aastas', '20 eurot kuus', 'see on tasuta'], ['Mida teevad inimesed iga kuu esimesel laupäeval?', 'teevad koos aias tööd', 'müüvad köögivilju', 'käivad jões ujumas'],
        ['Kes on Leida?', 'Jaani naaber aias', 'Jaani kolleeg', 'aia juht'], ['Mida tahab Jaan järgmisel aastal kasvatada?', 'maasikaid', 'kartulit', 'tilli'],
      ]),
      R5('100_p_r5', 'Kallis Markus!', [
        'Aitäh, et sa eile mind {*aitasid|aitad|aitama}! Üksi oli kolimine väga raske. Uus korter on {*suurem|suur|suurim} kui vana. Mul on nüüd ka rõdu. Hommikul joon ma {*rõdul|rõdule|rõdult} kohvi. Lähim pood on {*maja|majas|majja} kõrval. Täna {*ei läinud|ei läksin|ei minema} ma tööle, sest pakkisin kaste lahti.',
        '',
        'Järgmisel laupäeval teen väikese peo. Kas sa {*tahad|tahtma|tahta} tulla? Pidu algab kell kuus. Sa võid {*kaasa võtta|kaasa võtma|kaasa võtad} ka oma õe. Kirjuta, kas sa {*saad|saada|saame} tulla!',
        '',
        'Sinu sõber Andrei',
      ]),
    ],
    transfer: [
      B.text('100_t_intro', 'Lõpphindamine: kuulamine ja rääkimine', 'Viimased kaks osa. Pildil rääkimisosas on Sofia oma vabal päeval linnas, kaart käes. Pärast rääkimist kirjutad oma plaani B1 poole.'),
      PART('100_t_lpart', 'L', { minutes: 30, points: 25, tasks: 4, note: 'Iga teksti kuulete kaks korda. Enne iga ülesannet on aega küsimusi lugeda. Eksamil on selle osa eest 20 punkti, õpetaja arvutab tulemuse ümber. Lõpphindamise eesmärk on vähemalt 20 punkti (80 %).' }),
      L1('100_t_l1', [
        'Tähelepanu, reisijad! Lennuk Riiast hilineb nelikümmend minutit. Uus saabumise aeg on kell kaheksateist kakskümmend. Palun oodake teisel korrusel kohvikus. Vabandame ebamugavuse pärast ja täname teid!',
        'Head kliendid! Täna on meie poes suur soodustus. Kõik talvejoped on poole odavamad. Pakkumine kehtib ainult täna kella üheksani õhtul. Jopesid leiate teiselt korruselt, trepist üles ja vasakule.',
        'Tere, siin hambakliinik Naeratus. Teie aeg on homme kell üksteist, doktor Rebase juures. Palun tulge viisteist minutit varem. Kui te ei saa tulla, helistage meile täna kella viieni.',
        'Tähelepanu! Kalamaja pargis on laupäeval suur jõulupidu. Pidu algab kell kolm ja on lastele tasuta. Lapsed saavad seal piparkooke teha. Kuuse juurde tuleb ka jõuluvana. Riietuge soojalt!',
        'Ilmateade homseks. Hommikul on külm, kuni kümme kraadi alla nulli. Päeval paistab päike. Õhtul hakkab sadama lund. Autojuhid, olge õhtul teel ettevaatlikud. Tuul on nõrk.',
        'Lapsevanemad, tähelepanu! Kooli jõulukontsert ei ole kolmapäeval, vaid neljapäeval. Kontsert algab kell kuus, aulas. Enne kontserti saab klassis kingitusi teha. Pärast kontserti on kohvilaud. Kooki toovad vanemad ise.',
        'Hea raamatukogu lugeja! Teie raamat tuleb tagasi tuua reedeks. Kui te ei jõua, võite selle aega pikendada internetis või telefoni teel. Hilinemise eest maksate kümme senti päevas. Aitäh!',
      ], [
        ['Mis kell jõuab lennuk Riiast kohale?', 'kell 18.20', 'kell 18.40', 'kell 17.40'], ['Mis on täna poole odavam?', 'talvejoped', 'kingad', 'mütsid'], ['Mis kell on aeg hambaarsti juures?', 'kell 11', 'kell 5', 'kell 15'], ['Mida saavad lapsed peol teha?', 'piparkooke', 'lumememme', 'jõulukaarte'],
        ['Mis õhtul juhtub?', 'hakkab sadama lund', 'paistab päike', 'on tugev tuul'], ['Mis päeval on kontsert?', 'neljapäeval', 'kolmapäeval', 'reedel'], ['Mis päevaks tuleb raamat tagasi tuua?', 'reedeks', 'esmaspäevaks', 'homseks'],
      ]),
      L2('100_t_l2', [
        'Ülle: Tere, kuulajad! Paljud õppijad teevad sel laupäeval A2 eksami. Stuudios on õpetaja Maret ja tema õppija Sofia. Maret, mis saab pärast eksamit?',
        'Maret: Tere! Kõigepealt puhake! Tulemused tulevad umbes kuu aja pärast. Aga ärge lõpetage eesti keelt. Kui keel seisab, siis see kaob.',
        'Ülle: Sofia, mis teie plaan on?',
        'Sofia: Tere! Ma tahan järgmisel sügisel B1 kursusele minna. Enne seda kuulan ma iga päev raadiot, kas või kümme minutit. Lugeda tahan ma lihtsaid uudiseid. Neid on internetis palju.',
        'Ülle: Kas A2 on teile juba elus aidanud?',
        'Sofia: Väga palju! Kevadel ma kartsin telefoni. Nüüd helistan ma klientidele ise. Mu ülemus Liis ütleb, et ma räägin juba julgelt, kuigi ma teen vigu.',
        'Ülle: Maret, kas vigadega rääkimine on hea?',
        'Maret: Parem kui vaikida! Inimene saab aru ka siis, kui lõpp on vale. Rääkige poes ja tööl, isegi kui teete vigu. Raamatukogus on igal neljapäeval vestlusklubi. See on tasuta.',
        'Ülle: Kui suur vahe on A2 ja B1 vahel?',
        'Maret: Päris suur. B1 jaoks tuleb õppida umbes aasta. Aga kui sa teed iga päev natuke, siis see õnnestub. Meie järgmine kursus algab veebruaris ja registreerida saab jaanuaris.',
        'Ülle: Aitäh teile! Edu laupäevaks!',
      ], [
        ['Eksami tulemused tulevad järgmisel päeval.', false], ['Sofia tahab järgmisel sügisel B1 kursusele minna.', true], ['Sofia kardab endiselt telefoniga rääkida.', false], ['Liisi arvates räägib Sofia juba julgelt.', true], ['Vestlusklubi eest tuleb raamatukogus maksta.', false], ['Järgmine kursus algab veebruaris.', true],
      ]),
      L3('100_t_l3', [
        'Ene: Head õppijad! Siin Ene. Täna oli viimane tund, seega räägin mõned tähtsad asjad veel kord ära. Eksam on laupäeval, üheteistkümnendal detsembril, Kase koolis. Olge kohal kell kaheksa kolmkümmend. Bussiga saab sinna numbriga seitseteist, peatus on Kase.',
        'Ene: Võtke kaasa isikutunnistus või pass. Ilma dokumendita te eksamile ei saa. Söök on teie enda asi, aga koolis on kohvik, mis on laupäeval lahti kella kaheni. Rääkimine algab pärast lõunat, kell üks.',
        'Ene: Pärast eksamit on meil väike pidu. Pidu on keelekoolis kell viis. Maret toob koogi ja Aune teeb kohvi. Tooge kaasa üks laul oma kodumaalt! Tulemused saate kirja teel, jaanuaris.',
        'Ene: Ja veel: B1 kursuse info on kodulehel. Kui teil on küsimusi, helistage mulle kuni reedeni. Edu teile!',
      ], ['Eksam toimub [Kase koolis].', 'Buss on number [seitseteist|17].', 'Dokument on [isikutunnistus|pass].', 'Rääkimine algab kell [üks|1|13].', 'Pidu algab kell [viis|5|17].', 'Tulemused tulevad [jaanuaris].']),
      L4('100_t_l4', [
        'Sofia: Tom, mis sa pärast eksamit teed? Ma olen nii väsinud, et tahan ainult magada.',
        'Tom: Mina sõidan pühapäeval Londonisse. Emma ootab mind jõuludeks. Ja sina?',
        'Sofia: Mina lähen Tartusse ema juurde. Aga enne tuleb Viktor mulle järele ja viib mind eksamile. Pärast eksamit ta parandab Dmitri ratta, see on juba mitu nädalat tema töökojas.',
        'Tom: Dmitri rääkis, et ta sai sadamas uue koha. Jaanuarist töötab ta seal kontoris. Ta ütles, et kontoris on vaja palju eesti keelt.',
        'Sofia: Väga tore! Aga Lucía? Tal on ju raske, sest ta on nii kaugel oma perest.',
        'Tom: Lucía sõidab kaheks nädalaks Hispaaniasse. Tema ema Maria ootab teda. Ta tuleb tagasi ja läheb siis kohe vestlusklubisse.',
        'Sofia: Olga rääkis, et ta sõidab jõuludeks lastega Narva oma õe juurde.',
        'Tom: Tõesti? Lapsed on kindlasti väga rõõmsad. Kas ta jääb sinna kauaks?',
        'Sofia: Ei, ainult üheks nädalaks. Ta ütles, et räägib seal õega ainult eesti keeles. Naljakas! Aga Maret? Ta on ju terve aasta meiega töötanud.',
        'Tom: Maret läheb nädalaks Lapimaale. Ta ütles, et seal ei räägi keegi eesti keelt ja ta saab puhata.',
        'Sofia: Ja Ene peab vist ikka tööl olema. Ta kirjutab juba uue kursuse nimekirja.',
        'Tom: Jah, Ene ei puhka kunagi. Hästi, näeme laupäeval! Ära hiljaks jää!',
      ], [['Tom', 'sõidab Londonisse.'], ['Dmitri', 'hakkab sadama kontoris tööle.'], ['Lucía', 'sõidab Hispaaniasse.'], ['Olga', 'sõidab lastega Narva.'], ['Maret', 'läheb Lapimaale.'], ['Ene', 'kirjutab uue kursuse nimekirja.']]),
      PART('100_t_spart', 'S', { minutes: 15, points: 20, tasks: 2, note: 'Rääkimine on paaris või õpetajaga: kõigepealt tutvumine, siis pilt ja küsimused, lõpuks ideekaart. Lõpphindamise eesmärk on vähemalt 16 punkti (80 %).' }),
      S0('100_t_s0', ['Kes te olete ja kust te tulete?', 'Kellega te koos elate?', 'Miks te eesti keelt õpite?']),
      S1('100_t_s1', ['Kes on pildil ja kus ta on?', 'Mida ta vaatab ja mida ta teha tahab?', 'Mida sina oma vabal päeval teed?', 'Mis sinu linnas sulle kõige rohkem meeldib?', 'Kuhu sa järgmisena minna tahad?'], 'a2-021'),
      S2('100_t_s2', 'Uus linn', 'Sõber kolib sinu linna. A on sõber ja küsib, B teab linna hästi. Siis vahetage.', ['Kus on hea korterit leida?', 'Kuidas siin tööle saab?', 'Kus lapsed koolis käivad?', 'Kus ma saan eesti keelt õppida?', 'Mida siin vabal ajal teha?'], ['Kesklinnas, aga seal on kallis', 'Bussiga, pilet on odav', 'Kase koolis, see on hea', 'Keelekoolis, õhtuti', 'Mere ääres jalutada']),
      B.rubricSpeaking('100_t_rs'),
      B.rubric('100_t_profile', 'Minu A2 profiil.', 'Kirjuta kõigi nelja osa tulemused protsentides. Õpetaja arvutab need 20 punkti skaalale.', ['Lugemine: … / 20 p', 'Kuulamine: … / 20 p', 'Kirjutamine: … / 20 p', 'Rääkimine: … / 20 p', 'Kokku: … / 80 p. Harno nõue: vähemalt 48 p ja ükski osa pole 0. KeeleSepa eesmärk: 80 % igas osas (16 p).', 'Kui mõni osa on alla 80 %, teen enne laupäeva selle osa ülesanded veel kord.']),
      tag(B.writing('100_t_plan', 'Minu plaan B1 poole.', 'Kirjuta 5–7 lauset: mis osa on sul tugev, mis nõrk, mida teed iga päev ja iga nädal.', [5, 7], ['iga päev', 'kord nädalas', 'tahan', 'pean'], 3), { task: 'W11' }),
      B.selfcheck('100_t_self', ['Ma kasutan A2 põhisõnavara ilma sõnaraamatuta.', 'Ma saan lugemises ja kuulamises vähemalt 80 % õigeid vastuseid.', 'Ma kasutan kus-, kuhu-, kust-vorme, ma- ja da-vormi ning minevikku.', 'Ma kirjutan ja räägin uues olukorras.', 'Ma nimetan oma tugeva ja nõrga osa ning plaani B1 jaoks.'], 'A2 on käes — edasi B1 poole!'),
    ],
  },
}, {
  'a2-096': 'RÄÄK L→S', 'a2-097': 'EKS', 'a2-098': 'KIRJ R→W', 'a2-099': 'PROOV', 'a2-100': 'PROOV',
});
