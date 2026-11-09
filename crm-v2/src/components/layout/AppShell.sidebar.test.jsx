import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import AppShell from './AppShell.jsx';
import { PEEK_DELAY_MS, SIDEBAR_STORAGE_KEY } from './useSidebarRail.js';

// a student's shell listens for live-lesson invitations and shows the pet (both Firebase): not part of the menu
vi.mock('./LessonInvitationOverlay.jsx', () => ({ default: () => null }));
vi.mock('../../features/pet/PetCompanion.jsx', () => ({ default: () => null }));

function setViewport({ width, desktop }) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
  window.matchMedia = vi.fn((query) => ({ matches: desktop, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
}

// a student's / parent's shell first asks the announcement and missing-data gates (async); both answer „nothing to ask”
const noGate = { announcements: { mine: async () => ({ pending: [] }) }, missingData: { mine: async () => null } };

async function renderShell(roles = ['admin'], props = {}) {
  const auth = { user: { uid: 'u1', displayName: 'Mari Maasikas', roles }, signOut: vi.fn() };
  const unmarked = { subscribeCount: vi.fn((who, onCount) => { onCount(231); return () => {}; }) };
  const view = render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/']}>
        <Routes><Route path="*" element={<AppShell unmarked={unmarked} approvals={{}} messages={{}} {...noGate} {...props} />}><Route path="*" element={<p>leht</p>} /></Route></Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
  for (let i = 0; i < 5; i += 1) await act(async () => {});
  return view;
}

const shell = (container) => container.querySelector('.app-shell');
const aside = (container) => container.querySelector('aside.sidebar');

describe('collapsible desktop side menu', () => {
  const realMatchMedia = window.matchMedia;
  const realWidth = window.innerWidth;
  beforeEach(() => { window.localStorage.clear(); });
  afterEach(() => {
    vi.useRealTimers();
    window.matchMedia = realMatchMedia;
    Object.defineProperty(window, 'innerWidth', { value: realWidth, configurable: true, writable: true });
  });

  it('starts expanded on a wide screen; the toggle collapses it and the choice is remembered on this device', async () => {
    setViewport({ width: 1440, desktop: true });
    const { container, unmount } = await renderShell();
    expect(shell(container)).not.toHaveClass('is-collapsed');
    fireEvent.click(screen.getByRole('button', { name: 'Ahenda menüü' }));
    expect(shell(container)).toHaveClass('is-collapsed');
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe('collapsed');
    unmount();

    const again = await renderShell();
    expect(shell(again.container)).toHaveClass('is-collapsed');
    fireEvent.click(screen.getByRole('button', { name: 'Laienda menüü' }));
    expect(shell(again.container)).not.toHaveClass('is-collapsed');
    expect(window.localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe('expanded');
  });

  it('starts as a rail on a laptop-size window (1024–1280 px) when nothing is saved; „[” switches it', async () => {
    setViewport({ width: 1200, desktop: true });
    const { container } = await renderShell(['teacher']);
    expect(shell(container)).toHaveClass('is-collapsed');
    fireEvent.keyDown(window, { key: '[' });
    expect(shell(container)).not.toHaveClass('is-collapsed');
    // not while typing
    const input = document.createElement('input');
    document.body.appendChild(input);
    fireEvent.keyDown(input, { key: '[' });
    expect(shell(container)).not.toHaveClass('is-collapsed');
    input.remove();
  });

  it('the rail keeps every link named by its label, with a tooltip, and keeps the badges', async () => {
    setViewport({ width: 1440, desktop: true });
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'collapsed');
    const { container } = await renderShell(['admin']);
    expect(shell(container)).toHaveClass('is-collapsed');
    const calendar = container.querySelector('nav a[href="/calendar"]');
    expect(calendar).toHaveAttribute('title', 'Kalender');
    expect(screen.getByLabelText('231 märkimata tundi')).toHaveTextContent('231');
    for (const link of container.querySelectorAll('nav a.nav-item')) {
      expect(link.getAttribute('title')).toBeTruthy();
      expect(link.querySelector('svg')).not.toBeNull();
    }
    expect(screen.getByRole('button', { name: 'Logi välja' })).toBeInTheDocument();
  });

  for (const roles of [['teacher'], ['finance'], ['student'], ['parent']]) {
    it(`the rail works for ${roles[0]}`, async () => {
      setViewport({ width: 1440, desktop: true });
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'collapsed');
      const { container } = await renderShell(roles);
      expect(shell(container)).toHaveClass('is-collapsed');
      const links = container.querySelectorAll('nav a.nav-item');
      expect(links.length).toBeGreaterThan(0);
      for (const link of links) expect(link.getAttribute('title')).toBe(link.querySelector('.nav-label').firstChild.textContent);
    });
  }

  it('hovering the rail slides the full menu out over the page after a moment; leaving or Esc slides it back', async () => {
    vi.useFakeTimers();
    setViewport({ width: 1440, desktop: true });
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'collapsed');
    const { container } = await renderShell();
    fireEvent.mouseEnter(aside(container));
    act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS - 50); });
    expect(aside(container)).not.toHaveClass('is-peek');
    act(() => { vi.advanceTimersByTime(60); });
    expect(aside(container)).toHaveClass('is-peek');
    // the page keeps its place: the shell stays collapsed while the menu is out
    expect(shell(container)).toHaveClass('is-collapsed');
    expect(container.querySelector('nav a[href="/calendar"]')).not.toHaveAttribute('title');
    fireEvent.mouseLeave(aside(container));
    expect(aside(container)).not.toHaveClass('is-peek');

    // a quick pass over the rail does not open it
    fireEvent.mouseEnter(aside(container));
    act(() => { vi.advanceTimersByTime(100); });
    fireEvent.mouseLeave(aside(container));
    act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
    expect(aside(container)).not.toHaveClass('is-peek');

    // keyboard: focus opens it, Esc closes it, focus leaving the menu closes it
    const calendar = container.querySelector('nav a[href="/calendar"]');
    fireEvent.focus(calendar);
    act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
    expect(aside(container)).toHaveClass('is-peek');
    fireEvent.keyDown(calendar, { key: 'Escape' });
    expect(aside(container)).not.toHaveClass('is-peek');
    fireEvent.blur(calendar, { relatedTarget: document.body });
    fireEvent.focus(calendar);
    act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS); });
    expect(aside(container)).toHaveClass('is-peek');
    fireEvent.blur(calendar, { relatedTarget: document.body });
    expect(aside(container)).not.toHaveClass('is-peek');
  });

  it('the expanded menu never slides out', async () => {
    vi.useFakeTimers();
    setViewport({ width: 1440, desktop: true });
    const { container } = await renderShell();
    fireEvent.mouseEnter(aside(container));
    act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS * 2); });
    expect(aside(container)).not.toHaveClass('is-peek');
  });

  it('a phone keeps the off-canvas menu: no rail, no toggle effect, even with a saved rail', async () => {
    vi.useFakeTimers();
    setViewport({ width: 390, desktop: false });
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, 'collapsed');
    const { container } = await renderShell(['student']);
    expect(shell(container)).not.toHaveClass('is-collapsed');
    fireEvent.mouseEnter(aside(container));
    act(() => { vi.advanceTimersByTime(PEEK_DELAY_MS * 2); });
    expect(aside(container)).not.toHaveClass('is-peek');
    fireEvent.keyDown(window, { key: '[' });
    expect(shell(container)).not.toHaveClass('is-collapsed');
    fireEvent.click(screen.getByRole('button', { name: 'Ava menüü' }));
    expect(aside(container)).toHaveClass('is-open');
    expect(container.querySelector('nav a.nav-item')).not.toHaveAttribute('title');
  });

  it('a broken storage (private mode) does not break the menu', async () => {
    setViewport({ width: 1440, desktop: true });
    const getItem = vi.spyOn(window.Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    const setItem = vi.spyOn(window.Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    try {
      const { container } = await renderShell();
      fireEvent.click(screen.getByRole('button', { name: 'Ahenda menüü' }));
      expect(shell(container)).toHaveClass('is-collapsed');
    } finally { getItem.mockRestore(); setItem.mockRestore(); }
  });
});
