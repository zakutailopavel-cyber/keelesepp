import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import OwnWordForm from './OwnWordForm.jsx';
import OwnWordsCard from './OwnWordsCard.jsx';

const user = { uid: 'u1', displayName: 'Mari' };
const answer = (extra = {}) => ({ status: 'ok', words: [{ text: 'kass', lemma: 'kass', known: true, suggestions: [] }], suggestion: '', lemma: 'kass', translation: 'кошка', translationOf: 'kass', forms: { line: 'kass, kassi, kassi', forms: [] }, sources: ['EKI etLex', 'TartuNLP Neurotõlge'], ...extra });

describe('OwnWordForm', () => {
  it('checks the word, fills the translation and forms, saves with source and verdict', async () => {
    const toolsService = { checkOwnWord: vi.fn().mockResolvedValue(answer()) };
    const service = { addStudentWord: vi.fn().mockResolvedValue({}) };
    render(<OwnWordForm studentId="s1" user={user} toolsService={toolsService} service={service} />);
    fireEvent.change(screen.getByLabelText(/Sõna või väljend/), { target: { value: 'kass' } });
    fireEvent.click(screen.getByRole('button', { name: /Kontrolli ja tõlgi/ }));
    expect(await screen.findByText(/Sõna on sõnastikus/)).toBeInTheDocument();
    expect(toolsService.checkOwnWord).toHaveBeenCalledWith({ text: 'kass', lang: 'et', tgt: 'ru' });
    expect(screen.getByLabelText(/Tõlge või selgitus/)).toHaveValue('кошка');
    // the student may change the machine translation
    fireEvent.change(screen.getByLabelText(/Tõlge või selgitus/), { target: { value: 'кот, кошка' } });
    fireEvent.change(screen.getByLabelText(/Näitelause/), { target: { value: 'Kass magab.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa minu sõnadesse' }));
    await waitFor(() => expect(service.addStudentWord).toHaveBeenCalled());
    expect(service.addStudentWord.mock.calls[0][0]).toMatchObject({ studentId: 's1', word: 'kass', translation: 'кот, кошка', example: 'Kass magab.', forms: 'kass, kassi, kassi', checked: 'ok' });
  });

  it('offers „Kas mõtlesid” and takes the suggestion with a new check', async () => {
    const toolsService = { checkOwnWord: vi.fn()
      .mockResolvedValueOnce(answer({ status: 'suggest', words: [{ text: 'raamatukoggu', lemma: 'raamatukoggu', known: false, suggestions: ['raamatukogu'] }], suggestion: 'raamatukogu', lemma: '', translation: 'библиотеку' }))
      .mockResolvedValueOnce(answer({ words: [{ text: 'raamatukogu', lemma: 'raamatukogu', known: true }], lemma: 'raamatukogu', translation: 'библиотека' })) };
    render(<OwnWordForm studentId="s1" user={user} toolsService={toolsService} service={{ addStudentWord: vi.fn() }} />);
    fireEvent.change(screen.getByLabelText(/Sõna või väljend/), { target: { value: 'raamatukoggu' } });
    fireEvent.click(screen.getByRole('button', { name: /Kontrolli ja tõlgi/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'raamatukogu' }));
    await waitFor(() => expect(screen.getByLabelText(/Sõna või väljend/)).toHaveValue('raamatukogu'));
    await waitFor(() => expect(screen.getByLabelText(/Tõlge või selgitus/)).toHaveValue('библиотека'));
    expect(toolsService.checkOwnWord).toHaveBeenLastCalledWith({ text: 'raamatukogu', lang: 'et', tgt: 'ru' });
  });

  it('a partial answer (slow service) names what is missing; „Proovi uuesti” checks again and fills the translation', async () => {
    const toolsService = { checkOwnWord: vi.fn()
      .mockResolvedValueOnce(answer({ translation: '', translationOf: '', partial: true, missing: ['translation'] }))
      .mockResolvedValueOnce(answer()) };
    render(<OwnWordForm studentId="s1" user={user} toolsService={toolsService} service={{ addStudentWord: vi.fn() }} />);
    fireEvent.change(screen.getByLabelText(/Sõna või väljend/), { target: { value: 'kass' } });
    fireEvent.click(screen.getByRole('button', { name: /Kontrolli ja tõlgi/ }));
    expect(await screen.findByText(/Puudu: tõlge/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tõlge või selgitus/)).toHaveValue('');
    fireEvent.click(screen.getByRole('button', { name: 'Proovi uuesti' }));
    await waitFor(() => expect(screen.getByLabelText(/Tõlge või selgitus/)).toHaveValue('кошка'));
    expect(screen.queryByRole('button', { name: 'Proovi uuesti' })).toBeNull();
    expect(toolsService.checkOwnWord).toHaveBeenCalledTimes(2);
  });

  it('a failing check never blocks: the word is saved unchecked with the typed translation', async () => {
    const toolsService = { checkOwnWord: vi.fn().mockRejectedValue(new Error('down')) };
    const service = { addStudentWord: vi.fn().mockResolvedValue({}) };
    render(<OwnWordForm studentId="s1" user={user} toolsService={toolsService} service={service} />);
    fireEvent.change(screen.getByLabelText(/Sõna või väljend/), { target: { value: 'kass' } });
    fireEvent.click(screen.getByRole('button', { name: /Kontrolli ja tõlgi/ }));
    expect(await screen.findByText(/Kontroll ei õnnestunud/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Tõlge või selgitus/), { target: { value: 'кошка' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa minu sõnadesse' }));
    await waitFor(() => expect(service.addStudentWord.mock.calls[0][0]).toMatchObject({ word: 'kass', translation: 'кошка', checked: 'unchecked' }));
  });

  it('shows a duplicate and opens the existing word', async () => {
    const onOpen = vi.fn();
    render(<OwnWordForm studentId="s1" user={user} words={[{ id: 'w1', word: 'Kass' }]} onOpen={onOpen} toolsService={{ checkOwnWord: vi.fn() }} service={{}} />);
    fireEvent.change(screen.getByLabelText(/Sõna või väljend/), { target: { value: 'kass' } });
    expect(screen.getByText(/on sinu sõnade hulgas juba olemas/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ava' }));
    expect(onOpen).toHaveBeenCalledWith({ id: 'w1', word: 'Kass' });
  });
});

describe('LessonWordsPanel (student side)', () => {
  it('the student opens „Lisa ise sõna” in the lesson; English lesson words are only translated', async () => {
    const { default: LessonWordsPanel } = await import('./LessonWordsPanel.jsx');
    const service = { subscribeForStudent: vi.fn((id, onData) => { onData([]); return () => {}; }), addStudentWord: vi.fn() };
    render(<LessonWordsPanel studentId="s1" invitationId="inv" user={user} service={service} lang="en" toolsService={{ checkOwnWord: vi.fn() }} />);
    fireEvent.click(screen.getByRole('button', { name: /Lisa ise sõna/ }));
    expect(screen.getByRole('button', { name: /^Tõlgi$/ })).toBeInTheDocument();
  });
});

describe('OwnWordsCard', () => {
  it('lists the words, marks own ones and edits only those', async () => {
    const words = [
      { id: 'w1', studentId: 's1', word: 'kass', translation: 'кошка', createdByUid: 'u1', source: 'student', checked: 'ok', createdAt: '2026-11-04T10:00:00Z' },
      { id: 'w2', studentId: 's1', word: 'koer', translation: 'собака', createdByUid: 'teacher', createdAt: '2026-11-03T10:00:00Z' },
    ];
    const service = { updateOwn: vi.fn().mockResolvedValue() };
    render(<OwnWordsCard students={[{ id: 's1', subject: 'Eesti keel' }]} words={words} user={user} service={service} toolsService={{ checkOwnWord: vi.fn() }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Kõik minu sõnad (2)' }));
    expect(screen.getByText('lisasin ise')).toBeInTheDocument();
    expect(screen.getByText('kontrollitud')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Muuda „koer”' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Muuda „kass”' }));
    fireEvent.change(screen.getByLabelText(/Tõlge või selgitus/), { target: { value: 'кот' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(service.updateOwn).toHaveBeenCalledWith('w1', expect.objectContaining({ word: 'kass', translation: 'кот', checked: 'unchecked' })));
  });

  it('the add form opens with „Lisa sõna”; preview shows no form', () => {
    const { unmount } = render(<OwnWordsCard students={[{ id: 's1' }]} words={[]} user={user} toolsService={{ checkOwnWord: vi.fn() }} service={{}} />);
    fireEvent.click(screen.getByRole('button', { name: /Lisa sõna/ }));
    expect(screen.getByRole('form', { name: 'Lisa oma sõna' })).toBeInTheDocument();
    unmount();
    render(<OwnWordsCard students={[{ id: 's1' }]} words={[]} user={user} preview toolsService={{ checkOwnWord: vi.fn() }} service={{}} />);
    expect(screen.queryByRole('button', { name: /Lisa sõna/ })).toBeNull();
  });
});
