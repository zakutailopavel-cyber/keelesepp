import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import LiveWorksheetPage from './LiveWorksheetPage.jsx';
import WorksheetPlayer from '../homework/WorksheetPlayer.jsx';
import { DocWorksheetSubmissionPreview } from './DocWorksheetPlayer.jsx';
import BlockKeyPanel from './BlockKeyPanel.jsx';
import { blockAnswerKey } from './engine/answerKey.js';
import { SCHEMA } from './engine/schema.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const block = (id, type, data) => ({ id, type, width: 'half', tone: 'white', data });
const doc = {
  schema: SCHEMA, id: 'd', meta: { title: 'Kõne infotelefonile' },
  blocks: [
    block('intro', 'text', { text: 'Sissejuhatus' }),
    block('g', 'gaps', { title: 'Täienda', showBank: 'no', bank: '', sentences: 'Ma helistan [infotelefonile|infoliinile].\nTa [vastab].', explain: 'Kuhu? -le.\nOlevik.' }),
    block('c', 'choice', { title: 'Vali', questions: [{ q: 'Mis kell?', options: 'kaks\n*kolm' }] }),
    block('t', 'truefalse', { title: 'Õige või vale?', statements: [{ text: 'Pood on kinni.', answer: 'false' }] }),
    block('m', 'match', { title: 'Ühenda', pairs: [{ left: 'tere', right: 'hello' }] }),
    block('o', 'wordorder', { title: 'Järjesta', sentences: 'Ma lähen koju.' }),
    block('dc', 'dictation', { title: 'Etteütlus', sentences: 'Täna on ilus ilm.' }),
    block('l', 'listening', { title: 'Kuula', instruction: 'Kuula ja täida.', audio: null, sentences: 'Pood avatakse kell [kümme|10].', transcript: 'Pood avatakse kell kümme.' }),
    block('r', 'rolecards', { title: 'Rollimäng', roleA: 'Klient', roleB: 'Operaator', teacher: 'Õpetaja on operaator.' }),
  ],
};

describe('the answers of one task (teacher)', () => {
  it('lists the right answers per block type, numbered as on the sheet', () => {
    expect(blockAnswerKey(doc, 'intro')).toBeNull();
    expect(blockAnswerKey(doc, 'nope')).toBeNull();
    const g = blockAnswerKey(doc, 'g');
    expect(g).toMatchObject({ num: 1, items: [{ prompt: 'Ma helistan ___.', answer: 'infotelefonile / infoliinile', why: 'Kuhu? -le.' }, { answer: 'vastab', why: 'Olevik.' }] });
    expect(blockAnswerKey(doc, 'c').items[0]).toMatchObject({ prompt: 'Mis kell?', answer: 'kolm' });
    expect(blockAnswerKey(doc, 't').items[0]).toMatchObject({ prompt: 'Pood on kinni.', answer: 'Vale' });
    expect(blockAnswerKey(doc, 'm').items[0]).toMatchObject({ prompt: 'tere', answer: 'hello' });
    // word order and dictation: the sentence itself, no bare item number as a prompt
    expect(blockAnswerKey(doc, 'o').items[0]).toMatchObject({ prompt: '', answer: 'Ma lähen koju.' });
    expect(blockAnswerKey(doc, 'dc').items[0]).toMatchObject({ prompt: '', answer: 'Täna on ilus ilm.' });
    const l = blockAnswerKey(doc, 'l');
    expect(l.transcript).toBe('Pood avatakse kell kümme.');
    expect(l.items[0]).toMatchObject({ prompt: 'Pood avatakse kell ___.', answer: 'kümme / 10' });
    const dialogue = { blocks: [block('d', 'dialogue', { title: 'Dialoog', speakerA: 'Mari', speakerB: 'Jaan', lines: [{ who: 'A', text: 'Mis kell sa [ärkad]?' }, { who: 'B', text: 'Kell [seitse|7].' }] })] };
    expect(blockAnswerKey(dialogue, 'd').items).toMatchObject([{ prompt: 'Mari: Mis kell sa ___?', answer: 'ärkad' }, { prompt: 'Jaan: Kell ___.', answer: 'seitse / 7' }]);
    expect(blockAnswerKey(doc, 'r')).toMatchObject({ num: 8, note: 'Õpetaja on operaator.', items: [] });
  });

  it('renders the panel: answers, why, script, note; share buttons only with onShow', () => {
    const onShow = vi.fn();
    const { rerender } = render(<BlockKeyPanel task={blockAnswerKey(doc, 'l')} onShow={onShow} onClose={() => {}} />);
    const panel = screen.getByRole('region', { name: 'Vastused: ülesanne 7' });
    expect(panel).toHaveTextContent('kümme / 10');
    expect(panel).toHaveTextContent('Kuulamise tekst');
    expect(panel).toHaveTextContent('Õpilane ei näe neid vastuseid.');
    fireEvent.click(screen.getByRole('button', { name: /Näita õpilasele/ }));
    expect(onShow).toHaveBeenCalledWith(true);
    rerender(<BlockKeyPanel task={blockAnswerKey(doc, 'l')} shown shownBy={{ on: true, byName: 'Aleksei', at: '2026-10-26T10:05:00Z' }} onShow={onShow} onClose={() => {}} />);
    expect(screen.getByRole('region')).toHaveTextContent('Õpilane näeb õigeid vastuseid');
    expect(screen.getByRole('region')).toHaveTextContent('Aleksei');
    fireEvent.click(screen.getByRole('button', { name: /Peida/ }));
    expect(onShow).toHaveBeenLastCalledWith(false);
    // an open task: the teacher's note, nothing to share
    rerender(<BlockKeyPanel task={blockAnswerKey(doc, 'r')} onShow={onShow} onClose={() => {}} />);
    expect(screen.getByRole('region')).toHaveTextContent('Õpetaja on operaator.');
    expect(screen.queryByRole('button', { name: /Näita õpilasele/ })).toBeNull();
  });
});

function renderLive(repository) {
  const user = { uid: 'teacher-1', displayName: 'Aleksei Merzin', roles: ['teacher'] };
  return render(
    <AuthContext.Provider value={{ user }}>
      <MemoryRouter initialEntries={['/library/worksheets/live/as-1']}>
        <Routes><Route path="/library/worksheets/live/:assignmentId" element={<LiveWorksheetPage repository={repository} />} /></Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('live lesson: the teacher clicks a task and shares its answers', () => {
  it('opens the key under the clicked task, shows / hides it to the learner, recorded with who', async () => {
    let push;
    const repository = {
      subscribeWorksheetAssignment: vi.fn((_id, onData) => { push = onData; return () => {}; }),
      setWorksheetLiveFocus: vi.fn().mockResolvedValue({}),
      setWorksheetLiveStep: vi.fn().mockResolvedValue({}),
      setWorksheetShown: vi.fn().mockResolvedValue([]),
    };
    const { container } = renderLive(repository);
    const base = { id: 'as-1', studentName: 'Mari', status: 'in_progress', answers: { 'g:0.0': 'infotelefonil' }, worksheetDoc: doc };
    act(() => push(base));
    await screen.findByText('Otse tunnis: Mari');
    expect(container.querySelector('.ws-block-key')).toBeNull();
    fireEvent.click(container.querySelector('.ws-page [data-block="g"]'));
    const card = container.querySelector('.ws-page [data-block="g"]');
    const panel = within(card).getByRole('region', { name: 'Vastused: ülesanne 1' });
    expect(panel).toHaveTextContent('infotelefonile / infoliinile');
    // the learner's own answer stays on the teacher's sheet
    expect(card.querySelector('input').value).toBe('infotelefonil');
    fireEvent.click(within(panel).getByRole('button', { name: /Näita õpilasele/ }));
    await waitFor(() => expect(repository.setWorksheetShown).toHaveBeenCalledWith({
      assignmentId: 'as-1', shown: ['g'], change: { blockIds: ['g'], on: true }, user: expect.objectContaining({ uid: 'teacher-1' }),
    }));
    // a click inside the panel does not move the learner's focus again
    expect(repository.setWorksheetLiveFocus).toHaveBeenCalledTimes(1);
    act(() => push({ ...base, liveShown: ['g'], liveShownBy: { g: { on: true, byName: 'Aleksei Merzin', at: '2026-10-26T10:05:00Z' } } }));
    const shownPanel = within(container.querySelector('.ws-page [data-block="g"]')).getByRole('region');
    expect(shownPanel).toHaveTextContent('Aleksei Merzin');
    fireEvent.click(within(shownPanel).getByRole('button', { name: /Peida/ }));
    await waitFor(() => expect(repository.setWorksheetShown).toHaveBeenLastCalledWith(expect.objectContaining({ shown: [], change: { blockIds: ['g'], on: false } })));
    // close with ×: the panel goes, the label „näha” stays for a shown task
    fireEvent.click(screen.getByRole('button', { name: 'Sulge vastused' }));
    expect(container.querySelector('.ws-block-key')).toBeNull();
    expect(container.querySelector('.ws-page [data-block="g"]')).toHaveTextContent('Õiged vastused on õpilasele näha');
  });

  it('„Näita kõik vastused” shows every task that has answers; no share after the sheet is submitted', async () => {
    let push;
    const repository = {
      subscribeWorksheetAssignment: vi.fn((_id, onData) => { push = onData; return () => {}; }),
      setWorksheetLiveFocus: vi.fn().mockResolvedValue({}),
      setWorksheetLiveStep: vi.fn().mockResolvedValue({}),
      setWorksheetShown: vi.fn().mockResolvedValue([]),
    };
    const { container } = renderLive(repository);
    act(() => push({ id: 'as-1', studentName: 'Mari', status: 'in_progress', answers: {}, worksheetDoc: doc }));
    fireEvent.click(await screen.findByRole('button', { name: /Näita kõik vastused/ }));
    await waitFor(() => expect(repository.setWorksheetShown).toHaveBeenCalled());
    const call = repository.setWorksheetShown.mock.calls[0][0];
    expect(call.change.on).toBe(true);
    expect(call.change.blockIds).toEqual(['g', 'c', 't', 'm', 'o', 'dc', 'l']);
    act(() => push({ id: 'as-1', studentName: 'Mari', status: 'done', answers: {}, worksheetDoc: doc }));
    fireEvent.click(container.querySelector('.ws-page [data-block="c"]'));
    expect(within(container.querySelector('.ws-page [data-block="c"]')).getByRole('region')).toHaveTextContent('kolm');
    expect(screen.queryByRole('button', { name: /Näita õpilasele/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Näita kõik vastused/ })).toBeNull();
  });
});

describe('the learner never gets the teacher key', () => {
  it('sees right answers only of the tasks the teacher showed, next to the own answers', () => {
    let push;
    const repository = { saveWorksheetDraft: vi.fn(), submitWorksheet: vi.fn(), saveSelfAssessment: vi.fn(), uploadRecording: vi.fn(), subscribeWorksheetAssignment: vi.fn((_id, onData) => { push = onData; return () => {}; }) };
    const { container } = render(<AuthContext.Provider value={{ user: { uid: 'stu', roles: ['student'] } }}>
      <WorksheetPlayer assignment={{ id: 'as-1', studentId: 's', title: 'Kõne', status: 'in_progress', answers: { 'g:0.0': 'infotelefonil' }, worksheetDoc: doc }} repository={repository} onClose={() => {}} />
    </AuthContext.Provider>);
    expect(container.querySelector('.ws-live-answers')).toBeNull();
    // a click on a task opens nothing for the learner
    fireEvent.click(container.querySelector('.ws-page [data-block="g"]'));
    expect(container.querySelector('.ws-block-key')).toBeNull();
    act(() => push({ liveShown: ['g'], liveShownBy: { g: { on: true, byName: 'Aleksei', at: '2026-10-26T10:05:00Z' } } }));
    const shown = container.querySelectorAll('.ws-page .ws-live-answers');
    expect(shown).toHaveLength(1);
    expect(container.querySelector('.ws-page [data-block="g"] .ws-live-answers')).toHaveTextContent('infotelefonile');
    // the own answer is kept and marked, not replaced
    const input = container.querySelector('.ws-page [data-block="g"] input');
    expect(input.value).toBe('infotelefonil');
    expect(input.className).toContain('is-bad');
    // nothing of the other tasks, no explanations, no listening script
    expect(container.querySelector('.ws-page [data-block="c"] .ws-live-answers')).toBeNull();
    expect(container.textContent).not.toContain('Kuhu? -le.');
    expect(container.textContent).not.toContain('Pood avatakse kell kümme.');
    expect(container.querySelector('.ws-block-key')).toBeNull();
    act(() => push({ liveShown: [] }));
    expect(container.querySelector('.ws-live-answers')).toBeNull();
  });
});

describe('homework review', () => {
  it('staff click a task to see its answers; without answerKey nothing opens', () => {
    const { container, rerender } = render(<DocWorksheetSubmissionPreview worksheetDoc={doc} answers={{ 't:0': 'true' }} answerKey />);
    fireEvent.click(container.querySelector('.ws-page [data-block="t"]'));
    expect(within(container.querySelector('.ws-page [data-block="t"]')).getByRole('region')).toHaveTextContent('Vale');
    expect(screen.queryByRole('button', { name: /Näita õpilasele/ })).toBeNull();
    rerender(<DocWorksheetSubmissionPreview worksheetDoc={doc} answers={{}} />);
    expect(container.querySelector('.ws-block-key')).toBeNull();
    fireEvent.click(container.querySelector('.ws-page [data-block="t"]'));
    expect(container.querySelector('.ws-block-key')).toBeNull();
  });
});
