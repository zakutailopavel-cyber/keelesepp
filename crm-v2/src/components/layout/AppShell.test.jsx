import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Modal } from '../ui/index.js';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import AppShell from './AppShell.jsx';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}{location.search}</div>;
}

describe('application shell', () => {
  it('shows the global student search to an administrator', async () => {
    const auth = { user: { displayName: 'Admin', roles: ['admin'] }, signOut: vi.fn() };
    render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="*" element={<AppShell />}><Route path="*" element={<LocationProbe />} /></Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    // the staff search downloads with the staff's shell (lazy)
    expect(await screen.findByLabelText('Otsi õpilast', {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it('shows the number of registrations waiting for approval on „Uued kontod”', () => {
    const auth = { user: { uid: 'a1', displayName: 'Admin', roles: ['admin'] }, signOut: vi.fn() };
    const approvals = { subscribePendingCount: vi.fn((onCount) => { onCount(2); return () => {}; }) };
    const messages = { subscribeUnreadCount: vi.fn((who, onCount) => { onCount(5); return () => {}; }) };
    render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="*" element={<AppShell approvals={approvals} messages={messages} />}><Route path="*" element={<LocationProbe />} /></Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>,
    );
    expect(screen.getByLabelText('2 ootel')).toHaveTextContent('2');
    expect(screen.getByLabelText('5 lugemata')).toHaveTextContent('5');
    expect(messages.subscribeUnreadCount.mock.calls[0][0]).toMatchObject({ uid: 'a1', all: true });
  });

  it('shows an admin the number of unmarked past lessons on „Kalender”; a teacher gets no menu count', () => {
    const unmarked = { subscribeCount: vi.fn((who, onCount) => { onCount(4); return () => {}; }) };
    const shell = (roles) => render(
      <AuthContext.Provider value={{ user: { uid: 'u1', displayName: 'X', roles }, signOut: vi.fn() }}>
        <MemoryRouter initialEntries={['/']}><Routes><Route path="*" element={<AppShell unmarked={unmarked} approvals={{}} messages={{}} />}><Route path="*" element={<LocationProbe />} /></Route></Routes></MemoryRouter>
      </AuthContext.Provider>,
    );
    const { unmount } = shell(['admin']);
    expect(screen.getByLabelText('4 märkimata tundi')).toHaveTextContent('4');
    expect(unmarked.subscribeCount.mock.calls[0][0]).toMatchObject({ isAdmin: true });
    unmount();
    unmarked.subscribeCount.mockClear();
    shell(['teacher']);
    expect(unmarked.subscribeCount).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(/märkimata tundi/)).toBeNull();
  });

  it('in a read-only preview a dialog can be closed, every other button stays blocked', () => {
    const answer = vi.fn();
    function Page() {
      const [open, setOpen] = useState(true);
      return open ? <Modal open title="Tunni salvestamine" onClose={() => setOpen(false)} footer={<button onClick={answer}>Nõustun</button>}>tekst</Modal> : <p>Dialoog suletud</p>;
    }
    const auth = { user: { uid: 'p1', displayName: 'Vanem', roles: ['parent'] }, preview: { readOnly: true }, signOut: vi.fn(), stopPreview: vi.fn() };
    render(<AuthContext.Provider value={auth}><MemoryRouter initialEntries={['/parent']}><Routes><Route path="*" element={<AppShell />}><Route path="*" element={<Page />} /></Route></Routes></MemoryRouter></AuthContext.Provider>);
    fireEvent.click(screen.getByRole('button', { name: 'Nõustun' }));
    expect(answer).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Sulge' }));
    expect(screen.getByText('Dialoog suletud')).toBeInTheDocument();
  });
});
