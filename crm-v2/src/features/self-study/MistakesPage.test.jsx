import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import MistakesPage from './MistakesPage.jsx';
import { localDate } from '../../utils/localDate.js';

const page = (words, profile = {}) => render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'u1', profile } }}>
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

  it('shows the board\'s bookmarks as notes from lessons; the student deletes only his own', async () => {
    const notes = [
      { id: 'n1', studentId: 's1', text: 'Kordan: kass → kassi', ink: [{ d: 'M1 1L20 20', c: '#1C2B3A', w: 3 }], color: '#FEF3C7', pageTitle: 'Tund 3', byStaff: true, createdByUid: 't1', createdByName: 'Kati', createdAt: '2026-11-04T10:00:00Z' },
      { id: 'n2', studentId: 's1', text: 'Minu märge', ink: [], color: '#DCFCE7', pageTitle: '', byStaff: false, createdByUid: 'u1', createdByName: 'Mari', createdAt: '2026-11-04T11:00:00Z' },
    ];
    const remove = vi.fn(async () => {});
    globalThis.confirm = vi.fn(() => true);
    render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'u1', profile: {} } }}>
      <MistakesPage studentRepository={{ listSelf: vi.fn().mockResolvedValue([{ id: 's1', name: 'Mari' }]) }}
        wordsService={{ subscribeForStudent: vi.fn((id, next) => { next([]); return () => {}; }) }}
        notesService={{ subscribeForStudent: vi.fn((id, next) => { next(notes); return () => {}; }), remove }} />
    </AuthContext.Provider></MemoryRouter>);
    expect(await screen.findByRole('region', { name: 'Märkmed tunnist' })).toBeInTheDocument();
    expect(screen.getByText('Kordan: kass → kassi')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Käsitsi kirjutatud märge' })).toBeInTheDocument();
    expect(screen.getByText(/Õpetaja Kati/)).toBeInTheDocument();
    const buttons = screen.getAllByRole('button', { name: 'Kustuta märge' });
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]);
    await vi.waitFor(() => expect(remove).toHaveBeenCalledWith('n2'));
  });

  it('explains where mistakes come from when there are none', async () => {
    page([]);
    expect(await screen.findByText('Vigu veel ei ole')).toBeInTheDocument();
  });

  it('shows today\'s result saved on the account (another device)', async () => {
    page([{ id: 'e1', word: 'Ma läksin panka', translation: 'Sinu lause: Mina läksin pank' }], { practice: { errorsDate: localDate(), errorsPct: 90 } });
    expect(await screen.findByText('Täna tehtud · 90%')).toBeInTheDocument();
  });
});
