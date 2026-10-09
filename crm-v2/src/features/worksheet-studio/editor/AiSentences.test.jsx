import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthContext } from '../../../app/AuthContext.jsx';
import AiSentences from './AiSentences.jsx';

describe('AiSentences', () => {
  it('asks the school Mac, shows checked and flagged sentences and adds the picked ones', async () => {
    let push;
    const service = { requestSentences: vi.fn().mockResolvedValue('r1'), subscribe: vi.fn((id, onData) => { push = onData; return vi.fn(); }) };
    const onAdd = vi.fn();
    render(<AuthContext.Provider value={{ user: { uid: 't1' } }}><AiSentences meta={{ title: 'Minu pere', level: 'A2' }} onAdd={onAdd} service={service} /></AuthContext.Provider>);
    fireEvent.change(screen.getByLabelText('Mida lünk harjutab'), { target: { value: 'osastav' } });
    fireEvent.click(screen.getByRole('button', { name: 'Paku laused' }));
    await waitFor(() => expect(service.requestSentences).toHaveBeenCalledWith({ topic: 'Minu pere', grammar: 'osastav', count: 8, level: 'A2' }, { uid: 't1' }));
    expect(await screen.findByText(/Kooli Mac kirjutab/)).toBeInTheDocument();
    act(() => push({ status: 'done', result: [{ text: 'Mul on kaks [venda].', ok: true }, { text: 'Meil on suur [kodu].', ok: false, suggestion: 'Meil on suur maja.' }] }));
    expect(await screen.findByText(/Tartu mudel parandaks: „Meil on suur maja.”/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lisa valitud (1)' }));
    expect(onAdd).toHaveBeenCalledWith(['Mul on kaks [venda].']);
  });
});
