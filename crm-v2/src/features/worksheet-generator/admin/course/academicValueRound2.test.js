import { B, tag } from './blocks.js';
import {
  factDupProblems, factDuplicates, isLetterTask, isPhoneTask, isRetelling, lessonRound2Problems, listeningSpeakers,
  moduleRound2Problems, numberTokens, thinkType, thinkVaryProblems,
} from './academicValue.js';

// round-2 gates (docs/ACADEMIC_VALUE_ROUND2.md) on small fixture modules: one sheet = { meta, blocks }
const sheet = (phase, blocks, meta = {}) => ({ meta: { level: 'B1', phase, canDo: 'Ma räägin oma arvamusest.', ...meta }, blocks });
const text = (n, w = 'linn') => Array.from({ length: n }, (_, i) => (i % 12 === 11 ? `${w}.` : w)).join(' ');
const article = (id, n = 160) => B.reading(id, 'Loe artiklit.', 'Loe ja vasta.', 'Linnad muutuvad', text(n), [['Mis muutub?', 'linn']]);
const QUESTIONS = ['Mis sind nendes faktides üllatas?', 'Kuidas on see mõnes teises riigis, mida sa hästi tead?', 'Mida peaks linn tegema, et noored jääksid?'];
const opener = (id, facts = 'Tallinnas elab umbes 460 000 inimest ja Tartus 100 000.', questions = QUESTIONS) => B.topicOpener(id, 'Linn ja maa', [`${facts} ${text(230)}`], 'Statistikaamet, 2025', questions);
const talk = (id, q = 'Mis sa arvad, kas linnas on parem elada kui maal?') => B.speaking(id, 'Arutle.', 'Räägi paarilisega 2 minutit.', [q, 'Miks?'], [60, 120]);
const letter = (id) => B.letter(id, 'Kiri vallale.', 'Kirjuta vallale kiri.', 'Tere', 'Lugupidamisega', [70, 90]);
const call = (id) => B.phoneCards(id, 'Helista vallale.', 'A helistab vallale, B on ametnik.', 'Sa helistad.', ['Helistaja', ['Küsi aega.']], ['Ametnik', ['Ütle aeg.']]);
const news = (id) => tag(B.listening(id, 'Uudised.', 'Kuula uudist.', [`Diktor: ${text(130)}`], ['Mis juhtus?']), { voice: 'news' });
const radio = (id, host = 'Ülle') => B.listening(id, 'Raadio.', 'Kuula saadet.', [`${host}: Tere, kuulajad! ${text(130)}`, 'Külaline: Tere!'], ['Kes helistas?']);
const lesson = (k, { discover = [], transfer = [] } = {}) => ({
  discover: sheet('discover', [...discover, article(`${k}_d_art`)]),
  practice: sheet('practice', [B.know(`${k}_p_know`, 'Eestis on üle 2000 saare.', 'Maa- ja Ruumiamet')]),
  transfer: sheet('transfer', [talk(`${k}_t_talk`), ...transfer]),
});
const goodModule = () => ({
  l1: lesson('1', { discover: [opener('1_d_open'), news('1_d_news')], transfer: [letter('1_t_letter')] }),
  l2: lesson('2', { discover: [radio('2_d_radio')], transfer: [B.speaking('2_t_debate', 'Väitlus.', 'A on poolt, B vastu.', ['Kas autod tuleks kesklinnast ära viia?'], [120, 240])] }),
  l3: lesson('3', { transfer: [call('3_t_call')] }),
});
const codes = (ps) => [...new Set(ps.map((p) => p.code))].sort();

describe('round 2: per lesson (av-boltedon)', () => {
  it('a cast-free main text of the stage length makes a lesson', () => {
    expect(lessonRound2Problems('l', goodModule().l1)).toEqual([]);
  });
  it('a cast episode with a fact box, a tip, a chart or the radio host is bolted on', () => {
    const cast = B.reading('r', 'Loe.', 'Loe.', 'Markuse päev', `Markus ärkas vara. ${text(150)}`, [['Millal?', 'vara']]);
    const box = B.know('k', text(160), 'ERR');
    const chart = B.chart('c', 'Eesti elanikud', { rows: ['2000 | 1401', '2024 | 1374'], source: 'Statistikaamet' });
    const l = { discover: sheet('discover', [cast, box, chart, radio('u')]), transfer: sheet('transfer', [talk('t')]) };
    expect(codes(lessonRound2Problems('l', l))).toEqual(['av-boltedon']);
    expect(lessonRound2Problems('l', { discover: sheet('discover', [article('a', 100)]) })[0].text).toMatch(/≥ 120 sõna/);
    expect(lessonRound2Problems('l', { discover: sheet('discover', [article('a', 100)], { level: 'A2+' }) })).toEqual([]);
  });
  it('an exam lesson is not checked', () => {
    expect(lessonRound2Problems('e', { practice: sheet('practice', [B.text('t', 'Eksam', 'Lugemine.')], { assessment: true }) })).toEqual([]);
  });
});

describe('round 2: per module', () => {
  it('a module with all parts passes', () => {
    expect(moduleRound2Problems(goodModule())).toEqual([]);
  });
  it('av-opener-numbers: at most 8 numbers in the opener body (years, percentages, 450 000 as one)', () => {
    expect(numberTokens('450 000 inimest, 7,3 tundi, aastatel 2019–2021, 84 %')).toEqual(['450 000', '7,3', '2019', '2021', '84']);
    const m = goodModule();
    m.l1.discover.blocks[0] = opener('o', 'Aastal 2021 elas Tallinnas 437 000, Tartus 97 000, Narvas 54 000 ja Pärnus 51 000 inimest; 2000. aastal 400 000, 101 000, 68 000 ja 45 000.');
    expect(moduleRound2Problems(m).map((p) => `${p.code}: ${p.text}`)).toEqual([expect.stringMatching(/^av-opener-numbers: .* 10 arvu \(kuni 8\)/)]);
  });
  it('av-thinkvary: the opener asks at least three kinds of question', () => {
    expect(['Mis sind üllatas?', 'Kuidas on see sinu kodumaal?', 'Kas sa oled seal käinud?', 'Mis sa arvad, kas see on hea?', 'Mida peaks vald tegema?', 'Kas 2040. aastal sõidab rong Pärnusse?'].map(thinkType))
      .toEqual(['reaction', 'home', 'experience', 'opinion', 'problem', 'prediction']);
    const m = goodModule();
    m.l1.discover.blocks[0] = opener('o', undefined, ['Mis sa arvad, kas linn on hea?', 'Kuidas on see sinu kodumaal?', 'Miks?']);
    expect(codes(moduleRound2Problems(m))).toEqual(['av-thinkvary']);
  });
  it('av-retell2: every form of repeated retelling counts, one a module', () => {
    const sp = (instruction) => B.speaking('s', 'Räägi.', instruction, ['Mis juhtus?'], [60, 180]);
    ['Räägi 4-3-2: kolm korda uuele kuulajale.', 'Räägi sama lugu kolm korda: 3, 2 ja 1 minut.', 'Räägi kaks korda: esimest korda 2 minutit, teist korda 90 sekundit.',
      'Tutvusta end järjest kolmele uuele inimesele, iga kord lühemalt.', 'Jutusta lugu pildi järgi. Siis jutusta see uuesti ilma pildita ja kiiremini.',
      'Räägi mitu korda järjest.', 'Räägi oma päevast 2 minutit. Siis räägi sama lugu uuele kuulajale.']
      .forEach((ins) => expect(isRetelling(sp(ins)), ins).toBe(true));
    ['Räägi, mida sa teed kaks korda nädalas.', 'Räägi paarilisele oma kodust.', 'Ma käisin seal esimest korda.'].forEach((ins) => expect(isRetelling(sp(ins)), ins).toBe(false));
    const m = goodModule();
    m.l1.practice.blocks.push(sp('Räägi kolm korda uuele paarilisele.'));
    expect(moduleRound2Problems(m)).toEqual([]);
    m.l2.practice.blocks.push(B.speaking('s2', 'Räägi.', 'Tutvusta end järjest kolmele inimesele, iga kord lühemalt.', ['Kes sa oled?'], [60, 180]));
    expect(codes(moduleRound2Problems(m))).toEqual(['av-retell2']);
  });
  it('av-kasuta2: at least half of the Kasuta sheets without a phone task, at most half ending with a letter', () => {
    expect(isPhoneTask(call('c'))).toBe(true);
    expect(isPhoneTask(B.listening('v', 'Häälsõnum.', 'Kuula häälsõnumit.', ['Tere!'], ['Mis?']))).toBe(true);
    expect(isPhoneTask(B.rolecards('r', 'Kõne klienditeenindusse.', 'A on klient.', 'Klient', 'Teenindaja', '', ''))).toBe(true);
    expect(isPhoneTask(B.speaking('k', 'Kõne koosolekul.', 'Pea kõne 2 minutit.', ['Mis on sinu ettepanek?'], [60, 120]))).toBe(false);
    expect(isPhoneTask(B.listening('k', 'Raadiosaade.', 'Kuula, mida helistajad räägivad.', ['Tere!'], ['Mis?']))).toBe(false);
    expect(isLetterTask(letter('l'))).toBe(true);
    expect(isLetterTask(B.writing('w', 'Foorumipostitus.', 'Kirjuta foorumisse oma arvamus.', [5, 8]))).toBe(false);
    expect(isLetterTask(B.writing('w', 'E-kiri sõbrale.', 'Kirjuta sõbrale.', [5, 8]))).toBe(true);
    const phone = goodModule();
    phone.l2.transfer.blocks.push(call('c2'));
    expect(moduleRound2Problems(phone).map((p) => p.text)).toEqual([expect.stringMatching(/^2\/3 Kasuta lehel on telefonikõne/)]);
    const letters = goodModule();
    letters.l2.transfer.blocks.push(letter('l2'));
    expect(moduleRound2Problems(letters).map((p) => p.text)).toEqual([expect.stringMatching(/^2\/3 Kasuta lehte lõpeb kirja/)]);
  });
  it('av-homecountry: „kodumaa” in any case at most twice a module', () => {
    const m = goodModule();
    m.l1.transfer.blocks.push(talk('h1', 'Kuidas on see sinu kodumaal?'));
    m.l2.transfer.blocks.push(talk('h2', 'Mida süüakse sinu kodumaa pidudel?'));
    expect(moduleRound2Problems(m)).toEqual([]);
    m.l3.transfer.blocks.push(talk('h3', 'Võrdle Eestit oma kodumaaga.'));
    expect(moduleRound2Problems(m).map((p) => p.text)).toEqual([expect.stringMatching(/^„kodumaa” 3 korda .*mõnes teises riigis/)]);
  });
  it('av-voices: one recurring voice opens at most two listening texts; one listening text is from outside the cast', () => {
    expect(listeningSpeakers(radio('r'))).toEqual(['Ülle', 'Külaline']);
    expect(listeningSpeakers(B.listening('v', 'Sõnum.', 'Kuula.', ['Tere, Anna! Siin Liis. Homme on tähtis päev.'], ['Mis?']))).toEqual(['Liis']);
    const m = goodModule();
    m.l3.discover.blocks.push(radio('3_d_radio'));
    expect(moduleRound2Problems(m)).toEqual([]);
    m.l3.practice.blocks.push(radio('3_p_radio'));
    expect(moduleRound2Problems(m).map((p) => p.text)).toEqual([expect.stringMatching(/^Ülle alustab 3 kuulamisteksti/)]);
    const cast = goodModule();
    cast.l1.discover.blocks.splice(1, 1);
    cast.l1.practice.blocks.push(B.listening('liis', 'Liis.', 'Kuula.', [`Liis: ${text(130)}`, 'Sofia: Jah.'], ['Mis?']));
    expect(moduleRound2Problems(cast).map((p) => p.text)).toEqual([expect.stringMatching(/^moodulis pole kuulamisteksti väljastpoolt/)]);
  });
});

describe('round 2: per course', () => {
  it('av-thinkvary: the home-country question not in the same slot everywhere, not one question pattern everywhere', () => {
    const op = (i, qs) => ({ moduleId: `m${i}`, questions: qs });
    const same = ['Mis sa arvad, kas see on hea?', 'Kuidas on see sinu kodumaal?', 'Kas sa oled seal käinud?'];
    const varied = (i) => op(i, i % 3 === 0 ? same : i % 3 === 1 ? ['Kuidas on see sinu kodumaal?', 'Mis sind üllatas?', 'Mida peaks vald tegema?'] : ['Mis sind üllatas?', 'Mida peaks vald tegema?', 'Kuidas on see teistes riikides?']);
    expect(thinkVaryProblems(Array.from({ length: 9 }, (_, i) => varied(i)))).toEqual([]);
    const problems = thinkVaryProblems(Array.from({ length: 9 }, (_, i) => op(i, same))).map((p) => p.text);
    expect(problems).toEqual([expect.stringMatching(/^kodumaa \/ teise riigi küsimus on 9 avalehel 2\. kohal \(kuni 3\)/), expect.stringMatching(/^9 avalehe küsimused on sama mustriga opinion-home-experience \(kuni 3\)/)]);
  });
  it('av-fact-dup: a key fact or a near-duplicate sentence in a second module, not inside one module or with other numbers', () => {
    const know = (id, t) => B.know(id, t, 'ERR');
    const mod = (id, blocks) => ({ id, sheets: { [`${id}-l1`]: { practice: sheet('practice', blocks) } } });
    const roam = 'Eestis kehtib igaüheõigus: metsas võib liikuda ja marju korjata.';
    const rest = 'Töölepingu seaduse järgi peab töötaja saama iga 24 tunni jooksul puhata vähemalt 11 tundi järjest.';
    const rest2 = 'Töölepingu seaduse järgi peab töötajal jääma iga 24 tunni jooksul vähemalt 11 tundi järjestikust puhkeaega.';
    // the same frame, another figure (in words on one side): not the same fact
    const sleep = 'Uuringu järgi kulub Eesti inimestel magamisele keskmiselt peaaegu üheksa tundi ööpäevas.';
    const work = 'Uuringu järgi kulub tasulisele tööle keskmiselt 3,3 tundi ööpäevas.';
    const dups = factDuplicates([mod('m1', [know('a', roam), know('b', rest), know('c', sleep)]), mod('m2', [know('d', roam), know('e', rest2), know('f', work)])]);
    expect(dups.map((d) => [d.kind, d.first.blockId, d.again.blockId])).toEqual([['key', 'a', 'd'], ['sentence', 'b', 'e']]);
    expect(factDupProblems(dups)[0]).toMatchObject({ lessonId: 'm2-l1', code: 'av-fact-dup', moduleId: 'm2' });
    expect(factDupProblems(dups)[0].text).toMatch(/sama fakt \(igaüheõigus\) on juba moodulis m1/);
    expect(factDuplicates([mod('m1', [know('a', roam), know('b', roam)])])).toEqual([]);
    // a cast scene is fiction, not a repeated fact
    expect(factDuplicates([mod('m1', [know('a', roam)]), mod('m2', [know('d', `Sofia ütleb: ${roam}`)])])).toEqual([]);
  });
});
