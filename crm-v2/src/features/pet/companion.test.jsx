import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
/* global Element */
import { beforeEach, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import PetCompanion from './PetCompanion.jsx';
import { celebrationHint, companionHint } from './companionModel.js';
import { petCelebrate, petQuiet } from './petEvents.js';

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

function renderCompanion({ roles = ['student'], preview = null, invite, pet = { kind: 'rebane', name: 'Rebu' }, path = '/student' } = {}) {
  let push = () => {};
  const services = {
    pets: { get: vi.fn().mockResolvedValue(pet), update: vi.fn(async ({ current, ...flags }) => ({ ...(current || {}), ...flags })) },
    invitationsService: { subscribeIncoming: vi.fn((_uid, onData) => { push = onData; onData(invite ? [invite] : []); return () => {}; }) },
    students: { listSelf: vi.fn().mockResolvedValue([{ id: 'st-1', subject: 'Eesti keel' }]) },
    schedule: { listByStudent: vi.fn().mockResolvedValue([]) },
    homework: { listByStudentIds: vi.fn().mockResolvedValue([]), listWorksheetAssignmentsByStudentIds: vi.fn().mockResolvedValue([]) },
  };
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
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

  it('remembers the tour and hiding on the account', async () => {
    const { services } = renderCompanion();
    fireEvent.click(await screen.findByRole('button', { name: 'Jäta vahele' }));
    await waitFor(() => expect(services.pets.update).toHaveBeenCalledWith(expect.objectContaining({ uid: 'u1', tourDoneAt: expect.any(String) })));
    fireEvent.click(screen.getByRole('button', { name: /Rebu: vajuta/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Peida mind' }));
    await waitFor(() => expect(services.pets.update).toHaveBeenCalledWith(expect.objectContaining({ hidden: true })));
  });

  it('does not appear for a student who said no thanks, and skips the tour already done on another device', async () => {
    const out = renderCompanion({ pet: { optedOut: true } });
    await waitFor(() => expect(out.services.pets.get).toHaveBeenCalled());
    await act(async () => {});
    expect(out.container.querySelector('.pet-lane, .pet-dock, .pet-tour')).toBeNull();
    out.unmount();
    renderCompanion({ pet: { kind: 'kakk', name: 'Tark', tourDoneAt: '2026-09-28T10:00:00Z' } });
    expect(await screen.findByRole('button', { name: /Tark: vajuta/ })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Tutvustus' })).toBeNull();
  });

  it('stays silent while a worksheet is open and celebrates afterwards', async () => {
    window.localStorage.setItem('ks-pet-tour-u1', '1');
    renderCompanion();
    await screen.findByRole('button', { name: /Rebu: vajuta/ });
    act(() => petQuiet(true));
    expect(screen.queryByRole('button', { name: /Rebu: vajuta/ })).toBeNull();
    act(() => petCelebrate({ xp: 20, goals: 1 }));
    act(() => petQuiet(false));
    expect(await screen.findByRole('status')).toHaveTextContent('Tubli! Tööleht on esitatud ja 1 tunni eesmärk. +20 mulle!');
  });

  it('gives a one-time hint on Kodutööd and keeps still in the lesson room', async () => {
    window.localStorage.setItem('ks-pet-tour-u1', '1');
    const hw = renderCompanion({ path: '/homework' });
    expect(await screen.findByRole('status')).toHaveTextContent('Vajuta töölehele');
    fireEvent.click(screen.getByRole('button', { name: 'Selge' }));
    expect(window.localStorage.getItem('ks-pet-page-u1-/homework')).toBe('1');
    hw.unmount();
    renderCompanion({ path: '/live-classroom', invite: { id: 'inv-9', status: 'pending', teacherName: 'Kati', expiresAt: new Date(at(12, 5)).toISOString() } });
    expect(await screen.findByRole('status')).toHaveTextContent('Käivita video ja mikrofon');
  });
});

describe('celebration text', () => {
  it('counts experience and goals', () => {
    expect(celebrationHint({ xp: 15 }).text).toBe('Tubli! Tööleht on esitatud. +15 mulle!');
    expect(celebrationHint({ xp: 25, goals: 2 }).hint).toBe('Молодец! Лист сдан и выполнено целей: 2. +25 мне!');
  });
});
