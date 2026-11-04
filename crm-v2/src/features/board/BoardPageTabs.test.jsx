import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import BoardPageTabs from './BoardPageTabs.jsx';

const pages = [
  { id: 'p1', title: 'Tund 20.10.2026' },
  { id: 'a', title: 'Tööleht: Probleemi lahendamine grammatikaga · Avasta' },
  { id: 'h', title: 'Tööleht: Probleemi lahendamine grammatikaga · Harjuta' },
  { id: 'k', title: 'Tööleht: Probleemi lahendamine grammatikaga · Kasuta' },
];
const renderTab = (page, { label, className }) => <button type="button" role="tab" aria-label={page.title} className={className}>{label}</button>;

function setup(pageId = 'h') {
  const props = { className: 'sb-room-pages', pages, pageId, onBoard: vi.fn(), onChoose: vi.fn(), renderTab };
  return { ...render(<BoardPageTabs {...props} insetRight={240} />), props };
}

describe('BoardPageTabs', () => {
  it('shows one lesson tab with a short chip per phase and the long title as a tooltip', () => {
    const { container } = setup();
    const group = screen.getByRole('group', { name: 'Probleemi lahendamine grammatikaga' });
    expect(within(group).getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Avasta', 'Harjuta', 'Kasuta']);
    expect(group.querySelector('.sb-tabgroup__title')).toHaveAttribute('title', 'Probleemi lahendamine grammatikaga');
    expect(group).toHaveClass('is-open');
    // the bar keeps clear of the video tiles
    expect(container.querySelector('.sb-room-pages').style.getPropertyValue('--sb-tabbar-right')).toBe('240px');
  });

  it('folds into „Lehed ▾” on a narrow bar whose tabs do not fit; the menu switches pages', () => {
    const sizes = vi.spyOn(globalThis.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function width() { return this.classList.contains('sb-tabbar__tabs') ? 300 : 500; });
    const scroll = vi.spyOn(globalThis.HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(900);
    let observed;
    const original = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class { constructor(callback) { observed = callback; } observe() {} disconnect() {} };
    try {
      const { props } = setup('h');
      act(() => { observed(); });
      // only „Tahvel” and the open lesson stay in the row
      expect(screen.queryByRole('tab', { name: 'Tund 20.10.2026' })).toBeNull();
      expect(screen.getByRole('tab', { name: /Harjuta/ })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Lehed/ }));
      const menu = screen.getByRole('menu', { name: 'Lehed' });
      fireEvent.click(within(menu).getByRole('menuitemradio', { name: 'Tund 20.10.2026' }));
      expect(props.onChoose).toHaveBeenCalledWith(pages[0]);
      expect(screen.queryByRole('menu', { name: 'Lehed' })).toBeNull();
    } finally {
      sizes.mockRestore();
      scroll.mockRestore();
      globalThis.ResizeObserver = original;
    }
  });
});
