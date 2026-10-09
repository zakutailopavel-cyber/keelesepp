import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import EkiEvaluation from './EkiEvaluation.jsx';
import { sheetText } from '../didactics/sheetText.js';

describe('EkiEvaluation', () => {
  const doc = { meta: { level: 'A2' }, blocks: [
    { id: 'g', type: 'gaps', data: { title: 'T', sentences: 'Kui mul oleks raha, [ostaksin] auto.\nMa elan [Tallinnas] koos perega.' } },
    { id: 'r', type: 'reading', data: { title: 'L', passage: 'Mari elab **Tartus**.', questions: '' } },
  ] };
  it('sends the solved sheet text and shows words and forms above the level', async () => {
    expect(sheetText(doc)).toBe('Kui mul oleks raha, ostaksin auto. Ma elan Tallinnas koos perega. Mari elab Tartus.');
    const evaluate = vi.fn().mockResolvedValue({ words: 14, unknownWords: 0, lix: 20, wordLevels: { A1: 13, B1: 1 }, formLevels: { A1: 10, B1: 1 }, aboveWords: [{ text: 'perega', level: 'B1' }], aboveForms: [{ text: 'ostaksin', form: 'tingiv kõneviis', level: 'B1' }] });
    render(<EkiEvaluation doc={doc} evaluate={evaluate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Hinda EKI-ga' }));
    await waitFor(() => expect(evaluate).toHaveBeenCalledWith({ text: sheetText(doc), level: 'A2' }));
    expect(await screen.findByText(/tingiv kõneviis/)).toBeInTheDocument();
    expect(screen.getByText(/Sõnad üle taseme A2: perega \(B1\)/)).toBeInTheDocument();
  });
});
