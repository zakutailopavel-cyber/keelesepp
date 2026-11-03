import { fireEvent, render } from '@testing-library/react';
import Sheet from '../Sheet.jsx';
import { checkDocument, scoreDocument } from '../registry.js';
import { answerKeyOf } from '../answerKey.js';
import { sampleDocument } from '../sample.js';
import { B } from '../../../worksheet-generator/admin/course/blocks.js';
import { harnoPartLine } from './harno.jsx';
import { EXAM_PART_DEFAULTS, HARNO_EXAMS, harnoResult, harnoWeighted } from './harnoScales.js';

// The Harno B1 exam blocks (harno.jsx) built the way course files build them (admin/course/blocks.js), shown to the
// student, the teacher and on paper. The answer round trip of every answerable block is in blocksRoundtrip.test.jsx.
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
const doc = (blocks) => ({ ...sampleDocument(), blocks });
const card = (container, id) => container.querySelector(`.ws-page [data-block="${id}"]`);

const ads = B.adsmatch('r1', 'Leia sobiv kuulutus.', 'Kirjuta olukorra kõrvale kuulutuse täht.', [
  ['Ujula', 'Avatud iga päev 7–21.'], ['Raamatukogu', 'Esmaspäeval suletud.'], ['Rattarent', 'Rattad päevaks või nädalaks.'],
], [['Su poeg tahab ujuma õppida.', 'A'], ['Sa tahad nädalavahetusel sõita.', 'C'], ['Sa otsid ajakirja.', 'B'], ['Sa tahad laupäeval ujuda.', 'A|C']]);

describe('R1 situations ↔ ads', () => {
  it('prints lettered ads and empty letter boxes, scores the letters on screen', () => {
    const { container } = render(<Sheet doc={doc([ads])} mode="print" />);
    const c = card(container, 'r1');
    expect([...c.querySelectorAll('.ws-ad-letter')].map((x) => x.textContent)).toEqual(['A', 'B', 'C']);
    expect([...c.querySelectorAll('.ws-ads-sit .ws-letterbox')].every((x) => x.textContent === '')).toBe(true);
    const answers = { 'r1:0': 'A', 'r1:1': 'B', 'r1:2': 'B', 'r1:3': 'C' };
    expect(scoreDocument(doc([ads]), answers).perBlock.r1.map((i) => i.ok)).toEqual([true, false, true, true]);
  });
  it('gives the teacher the situation and the ad with its title', () => {
    const key = answerKeyOf(doc([ads]))[0];
    expect(key.items[0]).toMatchObject({ prompt: 'Su poeg tahab ujuma õppida.', answer: 'A (Ujula)' });
    expect(key.items[3].answer).toBe('A (Ujula) / C (Rattarent)');
  });
});

describe('exam listening (L1, L2, L4)', () => {
  const tf = B.examListen('l4', 'Intervjuu.', 'Kuulad kaks korda. Õige või vale?', 'truefalse', ['Reporter: Kas jooksete iga päev?', 'Anna: Jah, hommikuti.'], [['Anna jookseb iga päev.', true], ['Anna jookseb õhtuti.', false]]);
  const mt = B.examListen('l9', 'Kes mida ütleb?', 'Ühenda kõneleja ja väide.', 'match', 'Mari: Mulle meeldib talv. Jaan: Mina armastan suve.', [['Mari', 'talv'], ['Jaan', 'suvi']]);
  it('shows how many times the text is heard without audio, and the true/false items', () => {
    const { container } = render(<Sheet doc={doc([tf])} mode="print" />);
    expect(card(container, 'l4').querySelector('.ws-listen-note').textContent).toContain('2 korda');
    expect(card(container, 'l4').querySelectorAll('.ws-tf-row')).toHaveLength(2);
  });
  it('scores true/false and matching like their task blocks and lists them in the answer key', () => {
    expect(scoreDocument(doc([tf]), { 'l4:0': 'true', 'l4:1': 'true' }).perBlock.l4.map((i) => i.ok)).toEqual([true, false]);
    const key = answerKeyOf(doc([tf, mt]));
    expect(key[0].items.map((i) => i.answer)).toEqual(['Õige', 'Vale']);
    expect(key[1].items.map((i) => i.answer)).toEqual(['talv', 'suvi']);
  });
  it('the student answers true/false on screen', () => {
    const answers = {};
    const { container } = render(<Sheet doc={doc([tf])} mode="interactive" answers={answers} setAnswer={(k, v) => { answers[k] = v; }} />);
    fireEvent.click(card(container, 'l4').querySelector('[aria-label="Õige"]'));
    expect(answers['l4:0']).toBe('true');
  });
});

describe('writing task card (W1, W2)', () => {
  const note = B.examWriting('w1', 'Kirjuta teade.', 'Kirjuta umbes 50 sõna.', 'teade', { situation: 'Sa ei saa homme tulla.', points: ['miks', 'millal', 'kus', 'mida'], words: [40, 60], opening: 'Tere, Kati!' });
  const form = B.examWriting('w0', 'Täida küsimustik.', 'Vasta igale küsimusele.', 'kusimustik', { situation: 'Veekeskus küsib arvamust.', questions: ['Kui tihti käite?', 'Miks?'] });
  it('prints the card with genre, word target and points, and a word line on paper', () => {
    const { container } = render(<Sheet doc={doc([note])} mode="print" />);
    const c = card(container, 'w1');
    expect(c.querySelector('.ws-taskcard-kind').textContent).toBe('Teade / sõnum · 40–60 sõna');
    expect(c.querySelectorAll('.ws-taskcard li')).toHaveLength(4);
    expect(c.textContent).toContain('Sõnu: ______');
  });
  it('counts the words on screen against the target', () => {
    const text = Array(45).fill('sõna').join(' ');
    const { container } = render(<Sheet doc={doc([note])} mode="interactive" answers={{ 'w1:text': text }} setAnswer={() => {}} />);
    const pill = card(container, 'w1').querySelector('.ws-pill');
    expect(pill.textContent).toBe('45 sõna · eesmärk 40–60 sõna');
    expect(pill.className).toContain('ok');
  });
  it('a questionnaire has one answer line per question', () => {
    const { container } = render(<Sheet doc={doc([form])} mode="interactive" answers={{}} setAnswer={() => {}} />);
    expect(card(container, 'w0').querySelectorAll('.ws-questionnaire li textarea.ws-line')).toHaveLength(2);
    expect(card(container, 'w0').querySelector('textarea.ws-ruled')).toBeNull();
  });
});

describe('speaking cards (S1b, S2)', () => {
  it('the agreement idea card and the phone call cards render on paper and record on screen', () => {
    const idea = B.ideaCard('s1', 'Leppige kokku.', 'Arutage ja leppige kokku.', 'Sõber kolib.', ['taim', 'raamat', 'lamp'], 'Mida te ostate?');
    const phone = B.phoneCards('s2', 'Helista spordiklubisse.', 'A helistab, B vastab.', 'Sa tahad trenni minna.', ['Sa helistad.', ['Kas on vaba aega?', 'Mis maksab?']], ['Sa töötad klubis.', ['E ja K kell 18', '10 eurot']]);
    const { container } = render(<Sheet doc={doc([idea, phone])} mode="print" />);
    expect(card(container, 's1').querySelectorAll('.ws-idea')).toHaveLength(3);
    expect(card(container, 's1').textContent).toContain('Kokkulepe:');
    expect([...card(container, 's2').querySelectorAll('.ws-rolecards section > b')].map((b) => b.textContent)).toEqual(['Küsimuste kaart', 'Vastuste kaart']);
    const live = render(<Sheet doc={doc([idea])} mode="interactive" answers={{}} setAnswer={() => {}} />);
    expect(card(live.container, 's1').querySelector('.ws-recbtn')).not.toBeNull();
  });
});

describe('exam rubrics and part headers', () => {
  it('W1 names the task points; W2 and speaking have Harno raw totals 12 and 20, target 80 %', () => {
    const w1 = B.rubricW1('rw1', ['miks', 'millal', 'kus', 'mida']);
    expect(w1.data.criteria.map((c) => c.name).slice(0, 2)).toEqual(['Sisu: miks', 'Sisu: millal']);
    const { container } = render(<Sheet doc={doc([w1, B.rubricW2('rw2'), B.rubricSpeaking('rs')])} mode="print" />);
    expect(card(container, 'rw1').querySelector('.ws-examrubric-total').textContent).toContain('/ 8 punkti · eesmärk vähemalt 7 (80 %)');
    expect(card(container, 'rw2').querySelector('.ws-examrubric-total').textContent).toContain('/ 12 punkti · eesmärk vähemalt 10');
    expect(card(container, 'rs').querySelector('.ws-examrubric-total').textContent).toContain('/ 20 punkti · eesmärk vähemalt 16');
  });
  it('the teacher gives points on screen and the total adds up', () => {
    const rs = B.rubricSpeaking('rs');
    const answers = {};
    const view = render(<Sheet doc={doc([rs])} mode="interactive" answers={answers} setAnswer={(k, v) => { answers[k] = v; }} />);
    fireEvent.click(card(view.container, 'rs').querySelector('[aria-label="Sõnavara: 4 punkti"]'));
    expect(answers['rs:2']).toBe(4);
    const review = render(<Sheet doc={doc([rs])} mode="review" answers={{ 'rs:0': 5, 'rs:1': 4, 'rs:2': 4, 'rs:3': 3 }} results={checkDocument(doc([rs]), {}).results} />);
    expect(card(review.container, 'rs').querySelector('.ws-examrubric-total b').textContent).toBe('16');
  });
  it('an exam part shows minutes, points and the 80 % target; a timer on screen, start/end lines on paper', () => {
    const part = B.examPart('pr', 'R');
    const paper = render(<Sheet doc={doc([part])} mode="print" />);
    const c = card(paper.container, 'pr');
    expect(c.querySelector('h4').textContent).toBe('Lugemine');
    expect(c.textContent).toContain('50 min');
    expect(c.textContent).toContain('eesmärk vähemalt 27 p (80 %)');
    expect(c.textContent).toContain('Algus: ______');
    const screen = render(<Sheet doc={doc([part])} mode="interactive" answers={{}} setAnswer={() => {}} />);
    fireEvent.click(card(screen.container, 'pr').querySelector('.ws-recbtn'));
    expect(card(screen.container, 'pr').querySelector('[role="timer"]').textContent).toContain('Aega jäänud 50:00');
  });
});

// the real Harno exams (docs/HARNO_LEVEL_REQUIREMENTS.md, verified table 2026-11-03)
describe('Harno exam parts: raw points, weighting, pass rule', () => {
  it('keeps the verified per-level table', () => {
    const row = (l) => ['W', 'L', 'R', 'S'].map((s) => `${HARNO_EXAMS[l].parts[s].minutes}/${HARNO_EXAMS[l].parts[s].raw}→${HARNO_EXAMS[l].parts[s].weighted}`).join(' ');
    expect(row('A2')).toBe('30/20→20 30/25→20 50/30→20 15/20→20');
    expect(row('B1')).toBe('35/20→25 35/30→25 50/33→25 15/20→25');
    expect(row('B2')).toBe('80/null→25 40/32→25 70/35→25 20/null→25');
    expect(row('C1')).toBe('90/24→25 45/27→25 60/34→25 20/20→25');
    expect(EXAM_PART_DEFAULTS.R).toEqual({ part: 'Lugemine', minutes: 50, points: 33, tasks: 4 });
    expect(EXAM_PART_DEFAULTS.S.tasks).toBe(2);
  });
  it('weighs raw points and passes at 60 % with no part at 0', () => {
    expect(harnoWeighted('B1', 'R', 33)).toBe(25);
    expect(harnoWeighted('B1', 'L', 15)).toBe(12.5);
    expect(harnoWeighted('A2', 'R', 15)).toBe(10);
    const ok = harnoResult('B1', { W: 12, L: 18, R: 20, S: 12 });
    expect(ok).toMatchObject({ total: 60.2, max: 100, need: 60, passed: true, zero: [] });
    const zero = harnoResult('B1', { W: 20, L: 30, R: 33, S: 0 });
    expect(zero).toMatchObject({ total: 75, passed: false, zero: ['S'] });
    expect(harnoResult('A2', { W: 12, L: 15, R: 18, S: 12 })).toMatchObject({ total: 48, max: 80, need: 48, passed: true });
    expect(harnoResult('B1', { W: 10, L: 15, R: 16, S: 10 }, { R: 26 }).parts.R).toBe(15.4);
  });
  it('a header with the course exam says how Harno weighs the part', () => {
    expect(harnoPartLine('B1', 'R', 33, 50)).toBe('Harno B1 eksamil kaalutakse need 33 punkti lõpptulemuses 25 punktiks. Eksam on sooritatud, kui kokku on vähemalt 60 punkti 100-st (60 %) ja ükski osa ei ole 0 punkti.');
    expect(harnoPartLine('B1', 'L', 30, 30)).toMatch(/^Harno B1 eksamil kaalutakse need 30 punkti/);
    expect(harnoPartLine('B1', 'R', 26, 40)).toMatch(/^Harno B1 eksamil on lugemises 33 punkti \(50 min\), mis kaalutakse lõpptulemuses 25 punktiks\./);
    expect(harnoPartLine('A2', 'W', 20, 30)).toMatch(/^Harno A2 eksamil annab kirjutamine lõpptulemuses 20 punkti 80-st\. Eksam on sooritatud, kui kokku on vähemalt 48 punkti 80-st/);
    expect(harnoPartLine('B2', 'S', 25, 20)).toMatch(/^Harno B2 eksamil annab rääkimine lõpptulemuses 25 punkti 100-st\./);
    expect(harnoPartLine('', 'R', 33, 50)).toBe('');
    const part = { ...B.examPart('pc', 'L', { exam: 'C1' }) };
    expect(part.data).toMatchObject({ exam: 'C1', minutes: 45, points: 27, tasks: 3 });
    const { container } = render(<Sheet doc={doc([part])} mode="print" />);
    expect(card(container, 'pc').querySelector('.ws-exampart-harno').textContent).toContain('kaalutakse need 27 punkti lõpptulemuses 25 punktiks');
  });
});
