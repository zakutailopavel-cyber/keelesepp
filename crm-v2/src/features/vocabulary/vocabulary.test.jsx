import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { cleanWord, isDue, review, sameWord } from './wordsModel.js';
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
  it('knows a due word and finds the same word ignoring case', () => {
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
  it('practises the due words with the same flashcards as „Sõnad” and moves them on their schedule', async () => {
    const service = { ...fakeService([w('kass', { translation: 'кошка', example: 'Kass magab.' }), w('koer', { translation: 'собака' }), w('hiljem', { translation: 'позже', box: 3, dueAt: '2099-01-01T00:00:00Z', reviews: 3, reviewedAt: '2026-09-01T00:00:00Z' })]), rate: vi.fn(async () => ({})) };
    render(<MemoryRouter><MyWordsCard studentIds={['s-1']} service={service} /></MemoryRouter>);
    expect(screen.getByText('2 kordamiseks')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Harjuta (2)' }));
    expect(screen.getByLabelText('Kaardid')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Näita vastust' }));
    fireEvent.click(screen.getByRole('button', { name: /^Hea/ }));
    await waitFor(() => expect(service.rate).toHaveBeenCalledWith(expect.objectContaining({ id: expect.stringMatching(/kass|koer/) }), expect.objectContaining({ rating: 'good' })));
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
});
