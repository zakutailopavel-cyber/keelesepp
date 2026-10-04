import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import { cleanWord, formQuestion, isDue, practiceOrder, review, sameForm, sameWord } from './wordsModel.js';
import LessonWordsPanel from './LessonWordsPanel.jsx';
import MyWordsCard from './MyWordsCard.jsx';

const now = new Date('2026-10-04T10:00:00Z');
const w = (id, extra = {}) => ({ id, studentId: 's-1', invitationId: 'inv-1', word: id, translation: '', example: '', createdAt: '2026-10-01T10:00:00Z', box: 0, dueAt: '2026-10-01T10:00:00Z', reviews: 0, ...extra });

function fakeService(initial = []) {
  let words = [...initial];
  const listeners = new Set();
  const emit = () => listeners.forEach((fn) => fn([...words]));
  return {
    subscribeForStudent: vi.fn((studentId, onData) => { listeners.add(onData); onData([...words]); return () => listeners.delete(onData); }),
    add: vi.fn(async ({ studentId, invitationId, ...input }) => { const item = w(`n${words.length + 1}`, { studentId, invitationId, ...cleanWord(input), createdAt: new Date().toISOString() }); words = [...words, item]; emit(); return item; }),
    remove: vi.fn(async (id) => { words = words.filter((item) => item.id !== id); emit(); }),
    review: vi.fn(async (word, knew) => { const patch = review(word, knew); words = words.map((item) => (item.id === word.id ? { ...item, ...patch } : item)); emit(); return patch; }),
  };
}

describe('wordsModel', () => {
  it('moves a known word one box up and a forgotten one back to today', () => {
    expect(review({ box: 2, reviews: 4 }, true, now)).toEqual({ box: 3, dueAt: '2026-10-11T10:00:00.000Z', reviewedAt: now.toISOString(), reviews: 5 });
    expect(review({ box: 5 }, true, now).box).toBe(5);
    expect(review({ box: 4 }, false, now)).toMatchObject({ box: 0, dueAt: now.toISOString() });
  });
  it('practises due words, oldest first, and finds the same word ignoring case', () => {
    const words = [w('later', { dueAt: '2026-10-09T00:00:00Z' }), w('b', { dueAt: '2026-10-03T00:00:00Z' }), w('a', { dueAt: '2026-10-02T00:00:00Z' })];
    expect(practiceOrder(words, now.getTime()).map((item) => item.id)).toEqual(['a', 'b']);
    expect(isDue({ dueAt: '' }, now.getTime())).toBe(true);
    expect(sameWord([w('Kass')], ' kass ')?.id).toBe('Kass');
    expect(cleanWord({ word: '  tere   päevast ', translation: 'x'.repeat(300) })).toEqual({ word: 'tere päevast', translation: 'x'.repeat(200), example: '', forms: '' });
  });
});

describe('LessonWordsPanel', () => {
  it('the teacher adds a word to the student’s list and sees the words of this lesson', async () => {
    const service = fakeService([w('kass', { translation: 'кошка' }), w('vana', { invitationId: 'inv-0' })]);
    render(<LessonWordsPanel studentId="s-1" invitationId="inv-1" user={{ uid: 't1', displayName: 'Kati' }} teacher service={service} />);
    expect(screen.getByRole('heading', { name: 'Selle tunni sõnad (1)' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Sõna või väljend'), { target: { value: 'KASS' } });
    expect(screen.getByRole('status')).toHaveTextContent('on õpilase sõnastikus juba olemas');
    fireEvent.change(screen.getByLabelText('Sõna või väljend'), { target: { value: 'koer' } });
    fireEvent.change(screen.getByLabelText('Tõlge või selgitus'), { target: { value: 'собака' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa sõnastikku' }));
    await waitFor(() => expect(service.add).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's-1', invitationId: 'inv-1', word: 'koer', translation: 'собака' })));
    expect(await screen.findByRole('heading', { name: 'Selle tunni sõnad (2)' })).toBeInTheDocument();
    expect(screen.getByLabelText('Sõna või väljend')).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Kustuta „kass”' }));
    await waitFor(() => expect(service.remove).toHaveBeenCalledWith('kass'));
  });

  it('the student only sees the words, no form and no delete', () => {
    render(<LessonWordsPanel studentId="s-1" invitationId="inv-1" user={{ uid: 's1' }} service={fakeService([w('kass')])} />);
    expect(screen.queryByRole('form', { name: 'Uus sõna' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Kustuta/ })).toBeNull();
    expect(screen.getByText('kass')).toBeInTheDocument();
  });
});

describe('MyWordsCard', () => {
  it('practises the due words with flashcards and counts the result', async () => {
    const service = fakeService([w('kass', { translation: 'кошка', example: 'Kass magab.' }), w('koer'), w('hiljem', { box: 3, dueAt: '2099-01-01T00:00:00Z' })]);
    render(<MyWordsCard studentIds={['s-1']} service={service} />);
    expect(screen.getByText('2 kordamiseks')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Harjuta (2)' }));
    const deck = screen.getByLabelText('Sõnade kordamine');
    fireEvent.click(within(deck).getByRole('button', { name: 'Näita' }));
    const first = within(deck).getByText(/kass|koer/).textContent;
    fireEvent.click(within(deck).getByRole('button', { name: 'Teadsin' }));
    await waitFor(() => expect(service.review).toHaveBeenCalledWith(expect.objectContaining({ id: first }), true));
    fireEvent.click(await screen.findByRole('button', { name: 'Näita' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ei teadnud' }));
    expect(await screen.findByText(/Teadsid 1 sõna, kordamiseks jäi 1/)).toBeInTheDocument();
  });

  it('shows all words and hides practice in the admin preview', () => {
    render(<MyWordsCard studentIds={['s-1']} readOnly service={fakeService([w('kass')])} />);
    expect(screen.queryByRole('button', { name: /Harjuta/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Kõik sõnad (1)' }));
    expect(screen.getByText('kass')).toBeInTheDocument();
  });
});

describe('word forms (TartuNLP + Ekilex through our server)', () => {
  const kass = { formItems: [{ code: 'SgN', label: 'ainsuse nimetav', value: 'kass' }, { code: 'SgG', label: 'ainsuse omastav', value: 'kassi' }, { code: 'PlP', label: 'mitmuse osastav', value: 'kasse' }] };

  it('asks a form every other review, never the base form, and accepts listed variants', () => {
    expect(formQuestion({ word: 'kass', reviews: 0, ...kass })).toBeNull();
    expect(formQuestion({ word: 'kass', reviews: 1, ...kass }).code).toBe('SgG');
    expect(formQuestion({ word: 'kass', reviews: 3, ...kass }).code).toBe('PlP');
    expect(formQuestion({ word: 'kass', reviews: 1 })).toBeNull();
    expect(sameForm(' Kassi ', 'kassi')).toBe(true);
    expect(sameForm('jõge', 'jõge, jõe')).toBe(true);
    expect(sameForm('', 'kassi')).toBe(false);
  });

  it('the teacher fills translation and forms with one click and saves them with the word', async () => {
    const service = fakeService([]);
    const toolsService = { lookupWord: vi.fn().mockResolvedValue({ translation: 'кошка', forms: { available: true, found: true, line: 'kass, kassi, kassi, kasse', forms: kass.formItems } }) };
    render(<LessonWordsPanel studentId="s-1" invitationId="inv-1" user={{ uid: 't1' }} teacher service={service} toolsService={toolsService} />);
    fireEvent.change(screen.getByLabelText('Sõna või väljend'), { target: { value: 'kass' } });
    fireEvent.click(screen.getByRole('button', { name: /Leia tõlge ja vormid/ }));
    await waitFor(() => expect(screen.getByLabelText('Tõlge või selgitus')).toHaveValue('кошка'));
    expect(screen.getByLabelText(/Vormid/)).toHaveValue('kass, kassi, kassi, kasse');
    expect(toolsService.lookupWord).toHaveBeenCalledWith({ word: 'kass', src: 'et' });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa sõnastikku' }));
    await waitFor(() => expect(service.add).toHaveBeenCalledWith(expect.objectContaining({ forms: 'kass, kassi, kassi, kasse', formItems: kass.formItems })));
  });

  it('says when the forms key is not set up yet, and does nothing on its own if the field is filled', async () => {
    const toolsService = { lookupWord: vi.fn().mockResolvedValue({ translation: 'кошка', forms: { available: false, forms: [], line: '' } }) };
    render(<LessonWordsPanel studentId="s-1" invitationId="inv-1" user={{ uid: 't1' }} teacher service={fakeService([])} toolsService={toolsService} />);
    fireEvent.change(screen.getByLabelText('Sõna või väljend'), { target: { value: 'kass' } });
    fireEvent.blur(screen.getByLabelText('Sõna või väljend'));
    expect(await screen.findByText(/EKI sõnastiku võti/)).toBeInTheDocument();
    fireEvent.blur(screen.getByLabelText('Sõna või väljend'));
    expect(toolsService.lookupWord).toHaveBeenCalledTimes(1);
  });

  it('a form question in practice: type, check, go on', async () => {
    const service = fakeService([w('kass', { reviews: 1, translation: 'кошка', forms: 'kass, kassi, kassi, kasse', ...kass })]);
    render(<MyWordsCard studentIds={['s-1']} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: 'Harjuta (1)' }));
    expect(screen.getByText('ainsuse omastav?')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Vorm: ainsuse omastav'), { target: { value: 'kassi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kontrolli' }));
    expect(screen.getByText('Õige!')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Edasi' }));
    await waitFor(() => expect(service.review).toHaveBeenCalledWith(expect.objectContaining({ id: 'kass' }), true));
  });
});
