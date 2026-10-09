import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthContext } from '../../../app/AuthContext.jsx';
import EkiEvaluation from './EkiEvaluation.jsx';
import { sheetText } from '../didactics/sheetText.js';

describe('EkiEvaluation', () => {
  const doc = { meta: { level: 'A2' }, blocks: [
    { id: 'g', type: 'gaps', data: { title: 'T', sentences: 'Kui mul oleks raha, [ostaksin] auto.\nMa elan [Tallinnas] koos perega.' } },
    { id: 'r', type: 'reading', data: { title: 'L', passage: 'Mari elab **Tartus**.', questions: '' } },
  ] };
  it('asks the school Mac to evaluate the solved sheet text and shows what is above the level', async () => {
    expect(sheetText(doc)).toBe('Kui mul oleks raha, ostaksin auto. Ma elan Tallinnas koos perega. Mari elab Tartus.');
    let push;
    const service = { requestText: vi.fn().mockResolvedValue('e1'), subscribe: vi.fn((id, onData) => { push = onData; return vi.fn(); }) };
    render(<AuthContext.Provider value={{ user: { uid: 't1' } }}><EkiEvaluation doc={doc} service={service} /></AuthContext.Provider>);
    fireEvent.click(screen.getByRole('button', { name: 'Hinda EKI-ga' }));
    await waitFor(() => expect(service.requestText).toHaveBeenCalledWith({ kind: 'evaluate', text: sheetText(doc), level: 'A2' }, { uid: 't1' }));
    act(() => push({ status: 'done', result: { words: 14, unknownWords: 0, wordLevels: { A1: 13, B1: 1 }, formLevels: { A1: 10, B1: 1 }, aboveWords: [{ text: 'perega', level: 'B1' }], aboveForms: [{ text: 'ostaksin', form: 'tingiv kõneviis', level: 'B1' }] } }));
    expect(await screen.findByText(/tingiv kõneviis/)).toBeInTheDocument();
    expect(screen.getByText(/Sõnad üle taseme A2: perega \(B1\)/)).toBeInTheDocument();
  });
});
