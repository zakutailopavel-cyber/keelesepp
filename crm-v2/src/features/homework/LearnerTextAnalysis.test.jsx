import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthContext } from '../../app/AuthContext.jsx';
import { aiRequestsService } from '../../services/firebase/aiRequests.js';
import LearnerTextAnalysis, { learnerTexts } from './LearnerTextAnalysis.jsx';

describe('LearnerTextAnalysis', () => {
  it('finds the written answers and shows corrections and the levels the learner used', async () => {
    const doc = { meta: { level: 'A2' }, blocks: [{ id: 'w', type: 'writing', data: { title: 'Kirjuta endast' } }, { id: 'g', type: 'gaps', data: {} }] };
    const texts = learnerTexts({ worksheetDoc: doc, answers: { 'w:text': 'Ma elan Tallinnas koos minu ema.', 'g:0': 'x' } });
    expect(texts).toEqual([{ id: 'w', label: 'Kirjuta endast', text: 'Ma elan Tallinnas koos minu ema.' }]);
    let push;
    const req = vi.spyOn(aiRequestsService, 'requestText').mockResolvedValue('t1');
    const sub = vi.spyOn(aiRequestsService, 'subscribe').mockImplementation((id, onData) => { push = onData; return vi.fn(); });
    const onFeedback = vi.fn();
    try {
      render(<AuthContext.Provider value={{ user: { uid: 't' } }}><LearnerTextAnalysis texts={texts} level="A2" onFeedback={onFeedback} /></AuthContext.Provider>);
      fireEvent.click(screen.getByRole('button', { name: /Analüüsi teksti/ }));
      await waitFor(() => expect(req).toHaveBeenCalledWith({ kind: 'learnerText', text: texts[0].text, level: 'A2' }, { uid: 't' }));
      act(() => push({ status: 'done', result: { sentences: 1, corrections: [{ said: 'Ma elan Tallinnas koos minu ema.', corrected: 'Ma elan Tallinnas koos oma emaga.' }], evaluation: { wordLevels: { A1: 6 }, formLevels: { A1: 4, A2: 1 }, topForms: [{ text: 'emaga', form: 'ainsuse kaasaütlev', level: 'A2' }], aboveWords: [] } } }));
      expect(await screen.findByText(/Kasutab juba: emaga — ainsuse kaasaütlev \(A2\)/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Lisa parandused tagasisidesse' }));
      expect(onFeedback).toHaveBeenCalledWith(['„Ma elan Tallinnas koos minu ema.” → „Ma elan Tallinnas koos oma emaga.”']);
    } finally { req.mockRestore(); sub.mockRestore(); }
  });
});

describe('fixParts', () => {
  it('puts the learner words before the correction', async () => {
    const { fixParts } = await import('./LearnerTextAnalysis.jsx');
    const parts = fixParts('Palju õpilasi tahab jalutada', 'Paljud õpilased tahavad jalutada');
    const firstIns = parts.findIndex((p) => p.type === 'ins');
    const firstDel = parts.findIndex((p) => p.type === 'del');
    expect(firstDel).toBeLessThan(firstIns);
    expect(parts.filter((p) => p.type === 'del').map((p) => p.text).join(' ')).toBe('Palju õpilasi tahab');
  });
});
