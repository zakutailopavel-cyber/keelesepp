import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
/* global Element */
import { beforeEach, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import PetCompanion from './PetCompanion.jsx';
import { companionHint } from './companionModel.js';

const at = (h, m) => { const d = new Date(2026, 8, 29, h, m, 0); return d.getTime(); };

describe('companion hints', () => {
  it('puts a lesson invitation first, then a lesson that starts soon, then late and due homework', () => {
    const base = { now: at(16, 50), petName: 'Okas', todayLessons: [{ time: '17:00' }], overdue: 2, dueToday: 1 };
    expect(companionHint({ ...base, invitation: { id: 'i1', teacherName: 'Kati' } })).toMatchObject({ urgent: true, text: 'Kati kutsub sind tundi! Vajuta „Liitu tunniga”.' });
    expect(companionHint(base)).toMatchObject({ urgent: true, text: 'Tund algab 10 minuti pärast. Kutse ilmub siia.', action: { to: '/live-classroom' } });
    expect(companionHint({ ...base, now: at(12, 0) })).toMatchObject({ urgent: false, text: '2 kodutööd hilinevad. Teeme kohe?', action: { to: '/homework' } });
    expect(companionHint({ ...base, now: at(12, 0), overdue: 0 }).text).toBe('Täna on kodutöö tähtaeg.');
    expect(companionHint({ now: at(12, 0), petName: 'Okas', tipIndex: 0 }).text).toBe('Tere! Mina olen Okas. Vajuta mulle, kui vajad abi.');
    expect(companionHint({ now: at(12, 0), petName: 'Okas', tipIndex: 0, lang: 'en' }).text).toBe("Hi! I'm Okas. Press me when you need help.");
  });
});

function renderCompanion({ roles = ['student'], preview = null, invite } = {}) {
  let push = () => {};
  const services = {
    pets: { get: vi.fn().mockResolvedValue({ kind: 'rebane', name: 'Rebu' }) },
    invitationsService: { subscribeIncoming: vi.fn((_uid, onData) => { push = onData; onData(invite ? [invite] : []); return () => {}; }) },
    students: { listSelf: vi.fn().mockResolvedValue([{ id: 'st-1', subject: 'Eesti keel' }]) },
    schedule: { listByStudent: vi.fn().mockResolvedValue([]) },
    homework: { listByStudentIds: vi.fn().mockResolvedValue([]), listWorksheetAssignmentsByStudentIds: vi.fn().mockResolvedValue([]) },
  };
  const utils = render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: { uid: 'u1', roles }, preview }}>
        <nav><a href="/student" data-tour="nav-/student">Minu õpingud</a></nav>
        <PetCompanion {...services} now={at(12, 0)} />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  return { ...utils, services, push: (list) => act(() => push(list)) };
}

describe('PetCompanion', () => {
  beforeEach(() => {
    const store = new Map();
    Object.defineProperty(window, 'localStorage', { configurable: true, value: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)) } });
    Element.prototype.getBoundingClientRect = function rect() { return { top: 10, left: 10, width: 100, height: 30, right: 110, bottom: 40 }; };
  });

  it('gives a first-visit tour, then walks and talks when pressed', async () => {
    renderCompanion();
    expect(await screen.findByRole('dialog', { name: 'Tutvustus' })).toBeInTheDocument();
    expect(screen.getByText('Siin on „Minu õpingud”: sinu tunnid, ülesanded ja mina.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Edasi/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Selge!' }));
    expect(screen.queryByRole('dialog', { name: 'Tutvustus' })).toBeNull();
    expect(window.localStorage.getItem('ks-pet-tour-u1')).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: /Rebu: vajuta/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Tere! Mina olen Rebu.');
  });

  it('announces a lesson invitation by itself', async () => {
    window.localStorage.setItem('ks-pet-tour-u1', '1');
    const { push } = renderCompanion();
    await screen.findByRole('button', { name: /Rebu: vajuta/ });
    push([{ id: 'inv-1', status: 'pending', teacherName: 'Kati', expiresAt: new Date(at(12, 5)).toISOString() }]);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Kati kutsub sind tundi!'));
  });

  it('can be hidden and called back; never shown to staff or in preview', async () => {
    window.localStorage.setItem('ks-pet-tour-u1', '1');
    renderCompanion();
    fireEvent.click(await screen.findByRole('button', { name: /Rebu: vajuta/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Peida mind' }));
    expect(screen.getByRole('button', { name: 'Kutsu Rebu tagasi' })).toBeInTheDocument();
    const staff = renderCompanion({ roles: ['teacher'] });
    expect(staff.services.pets.get).not.toHaveBeenCalled();
    const previewed = renderCompanion({ preview: { readOnly: true } });
    expect(previewed.services.pets.get).not.toHaveBeenCalled();
  });
});
