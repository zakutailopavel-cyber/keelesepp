import { B, tag, teach } from './blocks.js';
import { castNames, courseAcademicProblems, hasStatistic, lessonAcademicProblems, moduleAcademicProblems, topicMapProblems } from './academicValue.js';
import { REQUIRED_TOPICS, TOPIC_MAP } from './academicTopics.js';

// small fixture modules: one sheet = { meta, blocks }; a lesson = { discover, practice, transfer }
const sheet = (phase, blocks, meta = {}) => ({ meta: { level: 'B1', phase, canDo: 'Ma räägin oma arvamusest.', ...meta }, blocks });
const text = (n, w = 'linn') => Array.from({ length: n }, (_, i) => (i % 12 === 11 ? `${w}.` : w)).join(' ');
const article = (id, n) => B.reading(id, 'Loe artiklit.', 'Loe ja vasta.', 'Linnad muutuvad', text(n), [['Mis muutub?', 'linn']]);
const opinion = (id) => B.speaking(id, 'Arutle.', 'Räägi 2 minutit.', ['Mis sa arvad, kas linnas on parem elada kui maal?', 'Kuidas on see sinu kodumaal?'], [60, 120]);
const know = (id) => B.know(id, 'Eestis on üle 2000 saare.', 'Eesti entsüklopeedia');
const opener = (id, n = 250, questions = ['Kas sa elad pigem linnas või maal?', 'Kuidas on see sinu kodumaal?', 'Mis sa arvad, miks noored kolivad linna?']) => B.topicOpener(id, 'Linn ja maa', [text(n)], 'Statistikaamet, 2025', questions);
const examiner = (id, level = 'B1') => B.examiner(id, 'Linn ja maa', ['Kus sa elad?', 'Kas sulle meeldib seal?', 'Miks?', 'Mis sa arvad, kas linnas on parem?', 'Kumb on lastele parem, linn või maa?', 'Mida linn võiks muuta?'], level);
const goodLesson = (k, extra = {}) => ({
  discover: sheet('discover', [...(extra.discover || []), article(`${k}_d_art`, 160)]),
  practice: sheet('practice', [know(`${k}_p_know`)]),
  transfer: sheet('transfer', [opinion(`${k}_t_talk`), B.letter(`${k}_t_letter`, 'Kirjuta.', 'Kirjuta vallale.', 'Tere', 'Lugupidamisega', [70, 90])]),
});
const goodModule = () => ({ l1: goodLesson('1', { discover: [opener('1_d_open')] }), l2: goodLesson('2'), l3: { ...goodLesson('3'), transfer: sheet('transfer', [examiner('3_t_exam'), opinion('3_t_talk'), B.rubric('3_t_r', 'Hinda.', '', ['Sisu'])]) } });
const codes = (ps) => [...new Set(ps.map((p) => p.code))].sort();

describe('cast names', () => {
  it('finds the cast with case endings, not look-alike words or the verb „anna”', () => {
    expect(castNames('Markusele meeldib Sofiaga rääkida. Jaani koer on Muki.')).toEqual(['Markusele', 'Sofiaga', 'Jaani', 'Muki']);
    expect(castNames('Tuul Logistikas töötab palju inimesi.')).toEqual(['Tuul Logistikas']);
    expect(castNames('Anna mulle raamat. Liisa ja Jaanika elavad Jaanilinnas.')).toEqual([]);
    expect(castNames('Anna läks koju.')).toEqual(['Anna']);
  });
});

describe('a number presented as fact', () => {
  it('is a percentage or a statistics word with a number, not a score, a discount or a question', () => {
    expect(hasStatistic('Statistikaameti andmetel elab Tallinnas üle 450 000 inimese.')).toBe(true);
    expect(hasStatistic('Küsitluse järgi ei tea pooled elanikud naabri nime.')).toBe(true);
    expect(hasStatistic('Eesmärk on vähemalt 80 % igas osas.')).toBe(false);
    expect(hasStatistic('Täna kõik jakid −30 %!')).toBe(false);
    expect(hasStatistic('Kas 50 % on palju?')).toBe(false);
    expect(hasStatistic('Uuringud näitavad, et uni on tähtis.')).toBe(false);
  });
});

describe('per lesson', () => {
  it('a full lesson passes', () => {
    expect(lessonAcademicProblems('l2', goodLesson('2'))).toEqual([]);
  });
  it('a lesson inside the cast story fails voice, opinion and knowledge', () => {
    const cast = {
      discover: sheet('discover', [B.reading('r', 'Loe.', 'Loe.', 'Markuse päev', `Markus ärkas vara. ${text(150)}`, [['Millal?', 'vara']])]),
      transfer: sheet('transfer', [B.speaking('s', 'Räägi.', 'Mida Markus tegi?', ['Mida Markus tegi?', 'Miks Markus hilines?'], [60, 120])]),
    };
    expect(codes(lessonAcademicProblems('l', cast))).toEqual(['av-know', 'av-opinion', 'av-voice']);
  });
  it('a short non-cast text is not enough; a chart with its source is', () => {
    const short = { discover: sheet('discover', [article('a', 60), opinion('o'), know('k')]) };
    expect(codes(lessonAcademicProblems('l', short))).toEqual(['av-voice']);
    const chart = B.chart('c', 'Eesti elanikud', { rows: ['2000 | 1401', '2024 | 1374'], source: 'Statistikaamet' });
    expect(codes(lessonAcademicProblems('l', { discover: sheet('discover', [chart, opinion('o')]) }))).toEqual([]);
  });
  it('an unsourced statistic outside a cast scene fails, also in an exam lesson; inside a cast scene it is fiction', () => {
    const fact = B.text('t', 'Uudis', 'Küsitluse järgi sõidab 40 % tallinlastest tööle bussiga.');
    const exam = { practice: sheet('practice', [fact], { assessment: true }) };
    expect(codes(lessonAcademicProblems('e', exam))).toEqual(['av-fact']);
    const sourced = B.text('t', 'Uudis', 'Küsitluse järgi sõidab 40 % tallinlastest tööle bussiga.\n\nAllikas: Tallinna linnavalitsus, 2024');
    expect(lessonAcademicProblems('e', { practice: sheet('practice', [sourced], { assessment: true }) })).toEqual([]);
    const castScene = B.text('t', 'Tuul Logistika', 'Sofia ütleb: küsitluse järgi on 70 % meie kliente rahul.');
    expect(lessonAcademicProblems('e', { practice: sheet('practice', [castScene], { assessment: true }) })).toEqual([]);
  });
  it('an exam lesson skips the lesson rules', () => {
    expect(lessonAcademicProblems('e', { practice: sheet('practice', [B.text('t', 'Eksam', 'Lugemine.')], { assessment: true }) })).toEqual([]);
  });
});

describe('per module', () => {
  it('a module with all parts passes (B1)', () => {
    expect(moduleAcademicProblems(goodModule(), { profile: 'b1' })).toEqual([]);
  });
  it('the topic opener: present, once, on lesson 1 Avasta, length, no cast, source, 3–4 questions with a home-country one', () => {
    const without = goodModule(); without.l1.discover = sheet('discover', [article('a', 160)]);
    expect(codes(moduleAcademicProblems(without))).toEqual(['av-opener']);
    const late = goodModule(); late.l1.discover = sheet('discover', [article('a', 160)]); late.l3.practice = sheet('practice', [opener('o'), know('k')]);
    expect(moduleAcademicProblems(late).map((p) => p.text).join()).toMatch(/1\. tunni/);
    const short = goodModule(); short.l1.discover.blocks[0] = opener('o', 120);
    expect(moduleAcademicProblems(short).map((p) => p.text).join()).toMatch(/sõna \(B1: 200–350\)/);
    expect(moduleAcademicProblems(goodModule(), { profile: 'b2' }).find((p) => p.code === 'av-opener').text).toMatch(/B2: 300–450/);
    const cast = goodModule(); cast.l1.discover.blocks[0] = B.topicOpener('o', 'Linn', [`Sofia elab linnas. ${text(240)}`], 'ERR', ['Kas linn on hea?', 'Kuidas on sinu kodumaal?', 'Miks?']);
    expect(moduleAcademicProblems(cast).map((p) => p.text).join()).toMatch(/tegelased tekstis \(Sofia\)/);
    const home = goodModule(); home.l1.discover.blocks[0] = opener('o', 250, ['Kas linn on hea?', 'Miks?', 'Mis sa arvad?', 'Kas maa on parem?', 'Kumb?']);
    expect(moduleAcademicProblems(home).map((p) => p.text).join()).toMatch(/5 „Mõtle kaasa” küsimust.*kodumaaga/);
    const twice = goodModule(); twice.l2.discover.blocks.push(opener('o2'));
    expect(moduleAcademicProblems(twice).map((p) => p.text).join()).toMatch(/2 teema avalehte/);
  });
  it('variety caps: 3-2-1 once, home recording twice, Kasuta not all „call → letter”', () => {
    const m = goodModule();
    const retell = (id) => teach(B.speaking(id, 'Räägi kolm korda.', 'Räägi sama lugu kolm korda uuele kuulajale: 3, 2 ja 1 minut.', ['Mis juhtus?'], [60, 180]), 'Üks-ühele: õpetaja hoiab aega.');
    m.l1.practice.blocks.push(retell('r1')); m.l2.practice.blocks.push(retell('r2'));
    const record = (id) => B.speaking(id, 'Kodus: minu linn.', 'Räägi 1–2 minutit ja salvesta.', ['Kus sa elad?'], [60, 120]);
    m.l1.transfer.blocks.push(record('s1')); m.l2.transfer.blocks.push(record('s2')); m.l3.transfer.blocks.push(record('s3'));
    expect(codes(moduleAcademicProblems(m))).toEqual(['av-record', 'av-retell']);
    const call = (id) => B.phoneCards(id, 'Helista.', 'Helista vallale.', 'Sa helistad.', ['Helistaja', ['Küsi aega.']], ['Ametnik', ['Ütle aeg.']]);
    const chain = goodModule(); chain.l2.transfer.blocks.push(call('c2')); chain.l1.transfer.blocks.push(call('c1'));
    expect(codes(moduleAcademicProblems(chain))).toEqual(['av-kasuta']);
  });
  it('the examiner set: 6–8 questions, two asking an opinion, no cast; B2 with a one-minute talk', () => {
    const m = goodModule(); m.l3.transfer.blocks[0] = B.speaking('s', 'Räägi.', 'Vasta.', ['Kus sa elad?', 'Kas sulle meeldib seal?', 'Mis sul on?', 'Kes sa oled?', 'Kuhu sa lähed?', 'Mida sa teed?'], [60, 120]);
    expect(codes(moduleAcademicProblems(m))).toEqual(['av-examiner']);
    const b2 = goodModule(); b2.l2.discover.blocks.push(article('art', 550));
    expect(codes(moduleAcademicProblems(b2, { profile: 'b2' }))).toEqual(['av-examiner', 'av-opener']);
    b2.l3.transfer.blocks[0] = examiner('x', 'B2');
    b2.l1.discover.blocks[0] = opener('o', 350);
    expect(moduleAcademicProblems(b2, { profile: 'b2' })).toEqual([]);
  });
  it('B2: a 500–600-word article without the cast', () => {
    const m = goodModule(); m.l1.discover.blocks[0] = opener('o', 350); m.l3.transfer.blocks[0] = examiner('x', 'B2');
    expect(codes(moduleAcademicProblems(m, { profile: 'b2' }))).toEqual(['av-article']);
    m.l2.discover.blocks.push(article('art', 700));
    expect(codes(moduleAcademicProblems(m, { profile: 'b2' }))).toEqual(['av-article']);
  });
});

describe('per course', () => {
  it('the topic map covers every Harno topic (B1: also media, society, culture, history)', () => {
    expect(topicMapProblems('b1', Object.keys(TOPIC_MAP.b1))).toEqual([]);
    expect(topicMapProblems('b2', Object.keys(TOPIC_MAP.b2))).toEqual([]);
    const thin = { m1: { main: 'tervis', secondary: [] } };
    expect(topicMapProblems('b2', ['m1', 'm2'], thin, REQUIRED_TOPICS.b2).map((p) => p.text).join()).toMatch(/m2: teemakaardil.*maja ja kodu/s);
  });
  it('B1 needs popular-science and fiction excerpts across the course', () => {
    const lesson = (voice) => ({ discover: sheet('discover', [tag(article(`a_${voice}`, 160), { voice })]) });
    const mods = [{ MODULE: { id: 'm' }, LESSONS: {} }];
    const ok = { a: lesson('popsci'), b: lesson('popsci'), c: lesson('popsci'), d: lesson('popsci'), e: lesson('fiction'), f: lesson('fiction'), g: lesson('fiction'), h: lesson('fiction') };
    const problems = (sheets) => courseAcademicProblems('b1', mods, () => sheets).filter((p) => p.code === 'av-genres');
    expect(problems(ok)).toEqual([]);
    expect(problems({ a: lesson('popsci') }).map((p) => p.text)).toHaveLength(2);
    expect(() => tag(article('x', 10), { voice: 'blog' })).toThrow(/tundmatu/);
  });
});
