import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthContext } from '../../../app/AuthContext.jsx';
import AiReading from './AiReading.jsx';

describe('AiReading', () => {
  it('asks for a level text, applies the corrections and uses it in the block', async () => {
    let push;
    const service = { requestReading: vi.fn().mockResolvedValue('r1'), subscribe: vi.fn((id, onData) => { push = onData; return vi.fn(); }) };
    const onUse = vi.fn();
    render(<AuthContext.Provider value={{ user: { uid: 't1' } }}><AiReading meta={{ title: 'Nädalavahetus', level: 'A2' }} onUse={onUse} service={service} /></AuthContext.Provider>);
    fireEvent.click(screen.getByRole('button', { name: 'Paku tekst' }));
    await waitFor(() => expect(service.requestReading).toHaveBeenCalledWith({ topic: 'Nädalavahetus', grammar: '', words: 140, level: 'A2' }, { uid: 't1' }));
    act(() => push({ status: 'done', result: { title: 'Minu laupäev', passage: 'Me sööme eile kooki. Ilm oli ilus.', words: 7, level: 'A2', hard: ['popcorne'], questions: [{ q: 'Mida me sõime?', a: 'kooki' }], flagged: [{ sentence: 'Me sööme eile kooki.', suggestion: 'Me sõime eile kooki.' }] } }));
    expect(await screen.findByText(/Üle taseme A2 \(EKI loend\): popcorne/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Paranda kõik' }));
    fireEvent.click(screen.getByRole('button', { name: 'Kasuta seda teksti' }));
    expect(onUse).toHaveBeenCalledWith({ passageTitle: 'Minu laupäev', passage: 'Me sõime eile kooki. Ilm oli ilus.', questions: 'Mida me sõime? [kooki]' });
  });
});
