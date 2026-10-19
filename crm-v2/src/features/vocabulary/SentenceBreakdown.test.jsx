import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import SentenceAnalyzer from './SentenceBreakdown.jsx';
import { sentenceAround } from '../worksheet-studio/WordLookup.jsx';

const word = (text, lemma, pos, extra = {}) => ({ text, lemma, pos, posEt: '', posRu: '', formEt: '', formRu: '', gloss: '', level: '', punct: false, space: true, ...extra });
const ANALYSIS = {
  text: 'Ma saan kõigest aru.',
  translation: 'Я всё понимаю.',
  tokens: [
    word('Ma', 'mina', 'P'),
    word('saan', 'saama', 'V', { posEt: 'tegusõna', posRu: 'глагол', formEt: 'olevik, mina', formRu: 'наст. вр., 1 л. ед. ч. (ma)', gloss: 'получать', level: 'A1' }),
    word('kõigest', 'kõik', 'P'),
    word('aru', 'aru', 'S', { space: false }),
    { text: '.', lemma: '.', pos: 'Z', punct: true },
  ],
  expressions: [{ phrase: 'aru saama', ru: 'понимать', government: 'elatiiv (kellest/millest)', tokens: [1, 3] }],
  source: 'EKI etLex, TartuNLP Neurotõlge',
};

describe('Lause lahti', () => {
  it('takes a sentence apart: base forms, the form of a tapped word, expressions and the translation', async () => {
    const service = { analyzeSentence: vi.fn(async () => ANALYSIS) };
    render(<SentenceAnalyzer service={service} />);
    fireEvent.change(screen.getByLabelText('Kirjuta või kleebi eestikeelne lause'), { target: { value: ' Ma saan kõigest aru. ' } });
    fireEvent.click(screen.getByRole('button', { name: /Võta lause lahti/ }));
    expect(service.analyzeSentence).toHaveBeenCalledWith({ text: 'Ma saan kõigest aru.', tgt: 'ru' });
    expect(await screen.findByText('Я всё понимаю.')).toBeInTheDocument();
    expect(screen.getByText('kõik')).toBeInTheDocument();
    expect(screen.getByText('aru saama')).toBeInTheDocument();
    expect(screen.getByText('rektsioon: elatiiv (kellest/millest)')).toBeInTheDocument();
    const saan = screen.getByRole('button', { name: /saan/ });
    expect(saan).toHaveClass('is-phrase');
    fireEvent.click(saan);
    expect(screen.getByText('наст. вр., 1 л. ед. ч. (ma)')).toBeInTheDocument();
    expect(screen.getByText('получать')).toBeInTheDocument();
    expect(screen.getByText('Osa väljendist „aru saama”.')).toBeInTheDocument();
  });

  it('runs at once when opened from a worksheet word and shows a failure plainly', async () => {
    const service = { analyzeSentence: vi.fn(async () => { throw new Error('EKI morphology unavailable'); }) };
    render(<SentenceAnalyzer service={service} initialText="Ma saan aru." autoRun />);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('EKI morphology unavailable'));
  });

  it('finds the sentence around a word in a longer text', () => {
    const text = 'Tere! Ma saan kõigest eesti keeles aru, aga midagi öelda ei oska. Aitäh.';
    expect(sentenceAround(text, text.indexOf('keeles'))).toBe('Ma saan kõigest eesti keeles aru, aga midagi öelda ei oska.');
    expect(sentenceAround(text, 0)).toBe('Tere!');
  });
});
