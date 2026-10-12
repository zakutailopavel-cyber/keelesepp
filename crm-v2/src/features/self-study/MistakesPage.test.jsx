import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import MistakesPage from './MistakesPage.jsx';

const page = (words) => render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'u1' } }}>
  <MistakesPage studentRepository={{ listSelf: vi.fn().mockResolvedValue([{ id: 's1', name: 'Mari' }]) }}
    wordsService={{ subscribeForStudent: vi.fn((id, next) => { next(words); return () => {}; }) }} />
</AuthContext.Provider></MemoryRouter>);

describe('Minu vead', () => {
  it('lists the student\'s own corrected sentences and starts a drill', async () => {
    page([{ id: 'e1', word: 'Ma läksin panka', translation: 'Sinu lause: Mina läksin pank' }, { id: 'w', word: 'raha', translation: 'деньги' }]);
    expect(await screen.findByText('1 lauset tundidest')).toBeInTheDocument();
    expect(screen.getByText('Mina läksin pank')).toBeInTheDocument();
    expect(screen.queryByText('raha')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Alusta/ }));
    expect(await screen.findByText('Milline lause on õige?')).toBeInTheDocument();
  });

  it('explains where mistakes come from when there are none', async () => {
    page([]);
    expect(await screen.findByText('Vigu veel ei ole')).toBeInTheDocument();
  });
});
