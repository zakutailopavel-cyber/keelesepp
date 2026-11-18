/* global HTMLMediaElement */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthContext } from '../../../app/AuthContext.jsx';
import DocWorksheetPlayer from '../DocWorksheetPlayer.jsx';
import { SheetCard } from './Sheet.jsx';
import { BLOCKS, blockAnswered, checkDocument, scoreDocument, unmatchedAnswers } from './registry.js';
import { mistakesOf } from './mistakes.js';
import { answerKeyOf } from './answerKey.js';
import { examClock, isExamSheet, isMetaKey, partScore, playLimit } from './examMode.js';
import { LimitedAudio } from './ListenTranscript.jsx';
import { chatTurns, gapParagraphs } from './blocks/bankDropModel.js';
import { pieSlices } from './blocks/chartModel.js';
import { E9_EXAM_DATA, WRITING_GENRES, examPartDefaults } from './blocks/harnoScales.js';
import { harnoPartLine } from './blocks/harno.jsx';
import { didacticCheck, EXAM_EXEMPT } from '../didactics/didacticCheck.js';
import { sheetProblems } from '../../worksheet-generator/admin/course/quality.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

// ---- the e-exam's blocks (docs/E_EXAM_ENGINE.md), small fixtures of mock 1's kind ----
const CLAIMS = ['Ta loeb bussis.', 'Ta kuulab audioraamatuid.', 'Tal ei ole aega.', 'Ta laenutab raamatuid.', 'Ta loeb lapsega.'];
const speakersBlock = (opts) => ({
  id: 'l11', type: 'examlisten', data: {
    title: '1.1. Kuula arvamusi.', mode: 'speakers', topic: 'Mida arvavad inimesed lugemisest?', claims: CLAIMS, plays: 2, audio: null,
    speakers: [{ name: 'Helen', answer: 'D' }, { name: 'Rasmus', answer: 'A' }, { name: 'Kadri', answer: 'E' }],
    explain: 'Helen laenutab raamatuid.\nRasmus loeb bussis.\nKadri loeb koos tütrega.', questions: [], statements: [], pairs: [],
  }, ...(opts ? { opts } : {}),
});
const chatBlock = (opts) => ({
  id: 'r21', type: 'insertion', data: {
    title: '2.1. Täienda vestlust.', layout: 'chat', passageTitle: '',
    passage: '**Sandra:** Tere, Erik!\n\n**Erik:** [[Tere! Mis juhtus?]]\n\n**Sandra:** Lähme matkama?\n\n**Erik:** [[Hea mõte!]]\n\n**Sandra:** Kuhu?\n\n**Erik:** [[Pakri poolsaarele.]]',
    extra: 'Kahjuks olen tööl.', explain: 'Näidis.\nErik nõustub.\nErik pakub koha.',
  }, ...(opts ? { opts } : {}),
});
const chipsBlock = (opts) => ({ id: 'r22', type: 'insertion', data: { title: '2.2.', layout: 'chips', passage: 'Muuseum [[asub]] Tartus. Ta loodi [[1909.]] aastal.\n\nUus maja on lennuvälja [[kõrval]].', extra: 'kaugel\nhoidma' }, ...(opts ? { opts } : {}) });
const clozeBlock = (opts) => ({ id: 'r26', type: 'cloze', data: { title: '2.6.', passage: 'Lahemaa {*asub|asuvad|asuma} põhjas. Park {*loodi|lõi|loob} 1971.' }, ...(opts ? { opts } : {}) });
const formBlock = (opts, hint) => ({ id: 'r27', type: 'formtext', data: { title: '2.7.', passage: 'Eelmisel [suvel] (suvi) töötasin [kohvikus] (kohvik).', ...(hint ? { hint } : {}) }, ...(opts ? { opts } : {}) });
const examDoc = (blocks, meta = {}) => ({ schema: 'keelesepp.worksheet/2', id: 'ex', meta: { title: 'Proovieksam', level: 'B1', exam: 'E9', goals: {}, ...meta }, blocks });

const ctxOf = (answers = {}, extra = {}) => () => ({
  interactive: true, flow: false, review: false, exam: true, focus: {}, setFocus: () => {},
  get: (k) => answers[k], set: (k, v) => { answers[k] = v; }, state: () => undefined, ...extra,
});
const card = (block, answers = {}, extra = {}) => render(<div className="ws-root mode-interactive"><SheetCard block={block} num={1} mode="interactive" ctx={(id) => { const c = ctxOf({}, extra)(); return { ...c, get: (k) => answers[`${id}:${k}`], set: (k, v) => { answers[`${id}:${k}`] = v; } }; }} /></div>);

describe('bookkeeping keys ($startedAt, $plays)', () => {
  it('are no answers: a task with only a play count is not answered, and the key is never „unmatched”', () => {
    expect(isMetaKey('b1:$plays')).toBe(true);
    expect(isMetaKey('b1:$plays.3')).toBe(true);
    expect(isMetaKey('b1:0')).toBe(false);
    const block = speakersBlock();
    expect(blockAnswered(block, { 'l11:$plays': 1 })).toBe(false);
    expect(unmatchedAnswers(examDoc([block]), { 'gone:$plays': 2 })).toEqual([]);
    expect(checkDocument(examDoc([block]), { 'l11:$plays': 2 }).score.total).toBe(0);
  });
});

describe('the part clock (exampart.data.lock)', () => {
  const doc = examDoc([{ id: 'p', type: 'exampart', data: { skill: 'R', exam: 'E9', minutes: 95, points: 40, lock: true } }]);
  it('counts from the stored start, survives a reload and is over at 0', () => {
    expect(examClock(examDoc([]), {})).toBeNull();
    expect(examClock(doc, {})).toMatchObject({ startedAt: 0, over: false, left: 95 * 60 });
    const start = 1_000_000;
    expect(examClock(doc, { 'p:$startedAt': start }, start + 60_000)).toMatchObject({ left: 94 * 60, over: false, deadline: start + 95 * 60_000 });
    expect(examClock(doc, { 'p:$startedAt': start }, start + 96 * 60_000)).toMatchObject({ left: 0, over: true });
  });
  it('the E9 exam key: minutes, points, items, the certificate rule and its line on the header', () => {
    expect(examPartDefaults('E9', 'L')).toEqual({ part: 'Kuulamine', minutes: 50, points: 20, tasks: 5, items: 35 });
    expect(examPartDefaults('E9', 'R')).toMatchObject({ minutes: 95, points: 40, items: 65 });
    expect(E9_EXAM_DATA.rule).toEqual({ levels: [['B1', 0.6]], noZeroPart: true });
    expect(harnoPartLine('E9', 'L', 20, 50)).toMatch(/50 minutit.*35 küsimust annavad kokku 20 punkti.*60 %/);
    expect(WRITING_GENRES.kokkuvote).toBe('Kokkuvõte');
  });
});

describe('player: exam mode locks and hands in at 0', () => {
  const lockedDoc = examDoc([{ id: 'p', type: 'exampart', data: { skill: 'R', exam: 'E9', part: 'III osa', minutes: 95, points: 40, items: 3, lock: true } }, clozeBlock({ example: true }), formBlock()]);
  const repo = () => ({ saveWorksheetDraft: vi.fn().mockResolvedValue({}), submitWorksheet: vi.fn().mockResolvedValue({}), saveSelfAssessment: vi.fn(), uploadRecording: vi.fn() });
  it('a reload after the time is over: the answers are locked and handed in without asking, with the part points', async () => {
    const repository = repo();
    window.confirm = vi.fn().mockReturnValue(false);
    const answers = { 'p:$startedAt': Date.now() - 96 * 60_000, 'r26:1': 0, 'r27:0': 'suvel' };
    const { container } = render(<DocWorksheetPlayer assignment={{ id: 'a1', studentId: 's', title: 'Eksam', status: 'new', answers, worksheetDoc: lockedDoc }} repository={repository} onClose={() => {}} />);
    await waitFor(() => expect(repository.submitWorksheet).toHaveBeenCalledTimes(1));
    expect(window.confirm).not.toHaveBeenCalled();
    expect(container.querySelector('.ws-page select')).toBeNull();
    // 2 of 3 scored items right (the example gap is not scored): 2/3 × 40 = 26,7
    expect(await screen.findByText(/III osa: 26,7 \/ 40 punkti/)).toBeInTheDocument();
  });
  it('the first answer starts the clock; the sticky clock shows the time left', async () => {
    const repository = repo();
    const { container } = render(<DocWorksheetPlayer assignment={{ id: 'a2', studentId: 's', title: 'Eksam', status: 'new', answers: {}, worksheetDoc: lockedDoc }} repository={repository} onClose={() => {}} />);
    fireEvent.change(container.querySelectorAll('.ws-page select')[0], { target: { value: '0' } });
    await waitFor(() => expect(repository.saveWorksheetDraft).toHaveBeenCalled());
    const saved = repository.saveWorksheetDraft.mock.calls.at(-1)[0].answers;
    expect(Number(saved['p:$startedAt'])).toBeGreaterThan(Date.now() - 5000);
    expect(container.querySelector('.ws-exam-clock')?.textContent).toMatch(/Aega jäänud 1:3[45]:/);
  });
  it('a teacher previewing sees the clock but no lock', async () => {
    const repository = repo();
    const answers = { 'p:$startedAt': Date.now() - 96 * 60_000 };
    const { container } = render(<AuthContext.Provider value={{ user: { uid: 't', roles: ['teacher'] } }}><DocWorksheetPlayer assignment={{ id: 'a3', studentId: 's', title: 'Eksam', status: 'new', answers, worksheetDoc: lockedDoc }} repository={repository} onClose={() => {}} /></AuthContext.Provider>);
    await new Promise((r) => { globalThis.setTimeout(r, 50); });
    expect(repository.submitWorksheet).not.toHaveBeenCalled();
    expect(container.querySelector('.ws-page select')).not.toBeNull();
    expect(container.querySelector('.ws-exam-clock')?.textContent).toMatch(/eelvaade/);
  });
});

describe('a recording heard a set number of times', () => {
  it('playLimit only with lockPlays; the count is kept under $plays', () => {
    const answers = {};
    const ctx = { get: (k) => answers[k], set: (k, v) => { answers[k] = v; } };
    expect(playLimit({ plays: 2 }, ctx)).toBeNull();
    const limit = playLimit({ plays: 2, lockPlays: true }, ctx, 3);
    expect(limit).toMatchObject({ plays: 2, gapSec: 10, used: 0 });
    limit.onUse(1);
    expect(answers).toEqual({ '$plays.3': 1 });
  });
  it('one play button, no controls (no pause, no seeking); a play counts when the sound starts; none left = disabled', () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function play() { this.dispatchEvent(new Event('play')); return Promise.resolve(); });
    const onUse = vi.fn();
    const { container, rerender } = render(<LimitedAudio src="/a.mp3" plays={2} used={0} gapSec={0} onUse={onUse} />);
    expect(container.querySelector('audio').hasAttribute('controls')).toBe(false);
    expect(screen.getByRole('status').textContent).toBe('Kuulamisi jäänud: 2 / 2');
    fireEvent.click(container.querySelector('.ws-plays-btn'));
    expect(onUse).toHaveBeenCalledWith(1);
    rerender(<LimitedAudio src="/a.mp3" plays={2} used={2} gapSec={0} onUse={onUse} />);
    act(() => { container.querySelector('audio').dispatchEvent(new Event('ended')); });
    expect(container.querySelector('.ws-plays-btn').disabled).toBe(true);
    expect(screen.getByRole('status').textContent).toBe('Salvestus on kuulatud.');
    play.mockRestore();
  });
  it('the learner gets the limited player, staff and a checked sheet the free one', () => {
    const block = { id: 'l', type: 'listening', data: { title: 'Kuula.', audio: { src: '/a.mp3' }, sentences: 'Park loodi [1993]. aastal.', plays: 2, lockPlays: true } };
    const { container } = card(block, {});
    expect(container.querySelector('.ws-audio.is-limited')).not.toBeNull();
    const plain = { ...block, data: { ...block.data, lockPlays: false } };
    const { container: free } = card(plain, {});
    expect(free.querySelector('audio[controls]')).not.toBeNull();
  });
});

describe('speakers ↔ statements (examlisten mode speakers)', () => {
  it('scores per speaker, the example row is not scored, and the mistakes show the letter with its statement and why', () => {
    const block = speakersBlock({ example: true });
    const doc = examDoc([block]);
    const answers = { 'l11:1': 'A', 'l11:2': 'B' };
    const { results, score } = checkDocument(doc, answers);
    expect(score).toMatchObject({ correct: 1, total: 2 });
    expect(results['l11:0']).toBeUndefined();
    const { tasks } = mistakesOf(doc, answers, results);
    expect(tasks[0].wrong).toEqual([{ key: '2', prompt: '3. kõneleja (Kadri)', given: 'B — Ta kuulab audioraamatuid.', right: 'E — Ta loeb lapsega.', why: 'Kadri loeb koos tütrega.' }]);
    expect(answerKeyOf(doc)[0].items.map((it) => it.answer)).toEqual(['D — Ta laenutab raamatuid.', 'A — Ta loeb bussis.', 'E — Ta loeb lapsega.']);
  });
  it('a row per speaker with a letter dropdown; a letter taken by another speaker cannot be chosen again; item 0 numbered 0', () => {
    const answers = { 'l11:1': 'A' };
    const { container } = card(speakersBlock({ example: true }), answers);
    const selects = container.querySelectorAll('select.ws-speaker-sel');
    expect(selects).toHaveLength(2);
    expect([...selects[1].options].find((o) => o.value === 'A').disabled).toBe(true);
    expect([...selects[1].options].find((o) => o.value === 'D').disabled).toBe(true);
    expect(container.querySelector('.ws-speaker.is-example').textContent).toMatch(/^0\. näidis/);
    expect(container.querySelectorAll('.ws-speakers-claims tr')).toHaveLength(5);
  });
});

describe('drag into a text and into a conversation (insertion layouts chips / chat)', () => {
  it('parses the conversation and the running text', () => {
    expect(chatTurns(chatBlock().data.passage).map((t) => [t.who, t.side, t.gap])).toEqual([['Sandra', 'a', null], ['Erik', 'b', 0], ['Sandra', 'a', null], ['Erik', 'b', 1], ['Sandra', 'a', null], ['Erik', 'b', 2]]);
    expect(gapParagraphs(chipsBlock().data.passage).flat().filter((p) => 'gap' in p).map((p) => p.gap)).toEqual([0, 1, 2]);
  });
  it('tap a chip, then a gap; a chip is used once (placed again it moves); tap a filled gap to send it back', () => {
    const answers = {};
    const { container, rerender } = card(chipsBlock(), answers);
    const redraw = () => rerender(<div className="ws-root mode-interactive"><SheetCard block={chipsBlock()} num={1} mode="interactive" ctx={(id) => ({ ...ctxOf()(), get: (k) => answers[`${id}:${k}`], set: (k, v) => { answers[`${id}:${k}`] = v; } })} /></div>);
    const chip = (text) => [...container.querySelectorAll('button.ws-dropchip')].find((b) => b.textContent === text);
    const gap = (n) => container.querySelector(`[data-drop-gap="${n}"]`);
    // the bank is in alphabetical order, as in EIS
    expect([...container.querySelectorAll('button.ws-dropchip')].map((b) => b.textContent)).toEqual(['1909.', 'asub', 'hoidma', 'kaugel', 'kõrval']);
    fireEvent.click(chip('kõrval'));
    fireEvent.click(gap(2));
    expect(answers).toEqual({ 'r22:2': 2 });
    redraw();
    expect(chip('kõrval').disabled).toBe(true);
    fireEvent.click(chip('kaugel'));
    fireEvent.click(gap(0));
    fireEvent.click(chip('asub'));
    fireEvent.click(gap(0));
    expect(answers['r22:0']).toBe(0);
    redraw();
    // move „kõrval” from gap 2 to gap 1: gap 2 is emptied
    fireEvent.keyDown(gap(2), { key: 'Delete' });
    expect(answers['r22:2']).toBe('');
  });
  it('item 0 stands solved and greyed in the chat, is not scored, and a wrong reply shows in the mistakes with why', () => {
    const block = chatBlock({ example: true });
    const { container } = card(block, {});
    expect(container.querySelector('[data-drop-gap="0"]').disabled).toBe(true);
    expect(container.querySelector('[data-drop-gap="0"]').textContent).toMatch(/Tere! Mis juhtus\?/);
    expect(container.querySelector('[data-drop-gap="0"]').className).toMatch(/is-example/);
    const doc = examDoc([block]);
    const answers = { 'r21:1': 3, 'r21:2': 2 };
    const { results, score } = checkDocument(doc, answers);
    expect(score).toMatchObject({ correct: 1, total: 2 });
    const wrong = mistakesOf(doc, answers, results).tasks[0].wrong[0];
    expect(wrong).toMatchObject({ key: '1', given: 'Kahjuks olen tööl.', right: 'Hea mõte!', why: 'Erik nõustub.' });
  });
});

describe('solved example item 0 in cloze, formtext and insertion', () => {
  it('is filled in, read-only, numbered 0 on an exam sheet, and not scored', () => {
    const { container } = card(clozeBlock({ example: true }), {});
    expect(container.querySelectorAll('.ws-page select, select')).toHaveLength(1);
    expect(container.querySelector('.ws-cloze-gap.is-example').textContent).toBe('(0) asub');
    expect(container.querySelector('select option').textContent).toBe('(1)');
    const doc = examDoc([clozeBlock({ example: true }), formBlock({ example: true })]);
    const { perBlock } = scoreDocument(doc, { 'r26:1': 0, 'r27:1': 'kohvikus' });
    expect(perBlock.r26.map((it) => it.key)).toEqual(['1']);
    expect(perBlock.r27.map((it) => it.key)).toEqual(['1']);
    expect(BLOCKS.insertion.example(chipsBlock().data)).toEqual({ 0: 0 });
  });
  it('a sheet without meta.exam keeps numbering from 1', () => {
    const answers = {};
    const { container } = render(<SheetCard block={clozeBlock({ example: true })} num={1} mode="interactive" ctx={() => ({ ...ctxOf(answers)(), exam: false })} />);
    expect(container.querySelector('.ws-cloze-gap.is-example').textContent).toBe('(1) asub');
  });
});

describe('formtext: the base form inside the box (hint inside)', () => {
  it('is the field placeholder; the default stays „(base)” after the line', () => {
    const { container } = card(formBlock(null, 'inside'), {});
    expect([...container.querySelectorAll('input.ws-gapline')].map((i) => i.placeholder)).toEqual(['suvi', 'kohvik']);
    expect(container.textContent).not.toMatch(/\(suvi\)/);
    const { container: plain } = card(formBlock(), {});
    expect(plain.querySelector('input.ws-gapline').getAttribute('placeholder')).toBeNull();
    expect(plain.textContent).toMatch(/\(suvi\)/);
  });
});

describe('W1 letter with margin notes', () => {
  it('draws the e-mail with each note beside its sentence', () => {
    const block = { id: 'w1', type: 'examwriting', data: { title: '1.', genre: 'vastus', about: 'u 100 sõna', letterSubject: 'Muuseumiöö', letter: [{ text: 'Tere!' }, { text: 'Kus sa käisid?', note: 'Vastan' }, { text: 'Muuseumid on igavad!', note: 'Pole sellega nõus!', side: 'left' }], minWords: 80, maxWords: 120, lines: 8 } };
    const { container } = card(block, {});
    expect(container.querySelector('.ws-letter-subject').textContent).toMatch(/Muuseumiöö/);
    const rows = container.querySelectorAll('.ws-letter-row.has-note');
    expect([...rows].map((r) => [r.querySelector('.ws-letter-text').textContent, r.querySelector('.ws-letter-note').textContent, r.className.includes('is-left')])).toEqual([['Kus sa käisid?', 'Vastan', false], ['Muuseumid on igavad!', 'Pole sellega nõus!', true]]);
    expect(container.querySelector('.ws-pill').textContent).toBe('0 sõna · u 100 sõna');
  });
});

describe('pie chart', () => {
  it('slices from one value per row; the chart draws a path and a label with % per slice', () => {
    const data = { chartTitle: 'Kuidas jõuad kooli?', kind: 'pie', unit: '%', rows: 'Buss | 34\nAuto | 29\nJala | 26\nRatas | 11' };
    const slices = pieSlices(data);
    expect(slices.map((s) => Math.round(s.share * 100))).toEqual([34, 29, 26, 11]);
    expect(slices.at(-1).to).toBeCloseTo(1);
    const { container } = render(<BLOCKS.chart.View data={data} />);
    expect(container.querySelectorAll('.ws-pie-slice path')).toHaveLength(4);
    expect(container.querySelector('svg').getAttribute('aria-label')).toBe('Kuidas jõuad kooli?: Buss 34 %; Auto 29 %; Jala 26 %; Ratas 11 %');
    expect(container.querySelectorAll('.ws-chart-legend li')).toHaveLength(4);
  });
});

describe('part points (35 items → 20 p, 65 → 40 p)', () => {
  it('converts the scored items of the sheet; an unanswered task counts 0', () => {
    const head = { id: 'p', type: 'exampart', data: { skill: 'L', exam: 'E9', part: 'II osa · Kuulamine', minutes: 50, points: 20 } };
    const doc = examDoc([head, speakersBlock({ example: true }), clozeBlock()]);
    // 1 of 2 speakers right, the cloze (2 gaps) unanswered → 1 / 4 × 20 = 5
    expect(partScore(doc, { 'l11:1': 'A', 'l11:2': 'B' })).toMatchObject({ correct: 1, items: 4, points: 5, max: 20, part: 'II osa · Kuulamine' });
    expect(partScore(examDoc([{ ...head, data: { ...head.data, exam: 'B1' } }, clozeBlock()]), {})).toBeNull();
  });
});

describe('gates: an exam sheet is exempt from the lesson norms', () => {
  const twelve = { id: 'g', type: 'gaps', opts: { example: true }, data: { title: 'Lüngad.', bank: '', showBank: 'no', sentences: Array.from({ length: 12 }, (_, i) => `Lause ${i} on [siin].`).join('\n') } };
  it('items per task and the solved example are checked on a lesson sheet, not on an exam sheet', () => {
    const lesson = didacticCheck({ ...examDoc([twelve]), meta: { title: 'Tund', level: 'B1' } });
    expect(lesson.checks.map((c) => c.code)).toEqual(expect.arrayContaining(['items-g', 'example-g']));
    const exam = didacticCheck(examDoc([twelve]));
    expect(exam.checks.map((c) => c.code)).not.toContain('items-g');
    expect(exam.checks.map((c) => c.code)).not.toContain('example-g');
    expect(EXAM_EXEMPT).toEqual(expect.arrayContaining(['items', 'example', 'bank', 'closed-share']));
    expect(isExamSheet(examDoc([]))).toBe(true);
  });
  it('the lesson-shape rules (blocks, minutes, variety, end) do not apply to an exam sheet; ids still do', () => {
    const lessonDoc = { ...examDoc([twelve]), meta: { title: 'Tund', level: 'B1', phase: 'practice' } };
    expect(sheetProblems(lessonDoc).map((p) => p.code)).toEqual(expect.arrayContaining(['length', 'variety']));
    expect(sheetProblems(examDoc([twelve])).map((p) => p.code)).toEqual([]);
    expect(sheetProblems(examDoc([twelve, twelve])).map((p) => p.code)).toEqual(['ids']);
  });
});
