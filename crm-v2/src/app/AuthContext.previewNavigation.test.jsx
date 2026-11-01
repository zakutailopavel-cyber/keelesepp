import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { beforeEach, vi } from 'vitest';
import { AuthProvider, useAuth, usePreviewNavigation } from './AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

vi.mock('../services/firebase/client.js', () => ({ isFirebaseConfigured: () => true, requireFirebaseClient: () => ({}) }));

const admin = { uid: 'a1', displayName: 'Admin', roles: ['admin'] };
const service = { subscribe: (next) => { next(admin); return () => {}; } };
const target = { user: { uid: 's1', displayName: 'Mari', roles: ['student'] }, studentId: 's1' };

function Card() {
  const preview = usePreviewNavigation();
  return <><p>Õpilase kaart</p><button onClick={() => preview.open(target, '/student')}>Vaata õpilase silmadega</button></>;
}
function Cabinet() {
  const preview = usePreviewNavigation();
  return <><p>Minu õpingud: {useAuth().user.displayName}</p><button onClick={preview.close}>Lõpeta vaade</button></>;
}
// what the pages did before: the role first, the address after it
function OldCard() {
  const { startPreview } = useAuth();
  const navigate = useNavigate();
  return <><p>Õpilase kaart</p><button onClick={() => { startPreview(target); navigate('/student'); }}>Vana nupp</button></>;
}
function App({ card }) {
  return <BrowserRouter><AuthProvider service={service}><Routes>
    <Route path="/forbidden" element={<p>Ligipääs puudub</p>} />
    <Route element={<ProtectedRoute roles={['admin', 'teacher']} />}><Route path="/students/s1" element={card} /></Route>
    <Route element={<ProtectedRoute roles={['student']} />}><Route path="/student" element={<Cabinet />} /></Route>
  </Routes></AuthProvider></BrowserRouter>;
}

describe('opening and closing a staff preview', () => {
  beforeEach(() => window.history.pushState({}, '', '/students/s1'));

  it('the role changed before the route: the case this guards, the viewer lands on Ligipääs puudub', async () => {
    render(<App card={<OldCard />} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Vana nupp' }));
    expect(await screen.findByText('Ligipääs puudub')).toBeInTheDocument();
  });

  it('opens the student view without passing /forbidden and goes back to the card on closing', async () => {
    const visited = [];
    const replace = window.history.replaceState.bind(window.history);
    const spy = vi.spyOn(window.history, 'replaceState').mockImplementation((state, title, url) => { visited.push(String(url)); replace(state, title, url); });
    render(<App card={<Card />} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Vaata õpilase silmadega' }));
    expect(await screen.findByText('Minu õpingud: Mari')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/student');
    fireEvent.click(screen.getByRole('button', { name: 'Lõpeta vaade' }));
    expect(await screen.findByText('Õpilase kaart')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/students/s1');
    expect(screen.queryByText('Ligipääs puudub')).toBeNull();
    expect(visited.filter((url) => url.includes('forbidden'))).toEqual([]);
    spy.mockRestore();
  });
});
