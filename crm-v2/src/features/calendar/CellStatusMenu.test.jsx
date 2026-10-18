import { render, screen } from '@testing-library/react';
import CellStatusMenu from './CellStatusMenu.jsx';

it('a cell near the bottom of the screen opens the menu above the pointer (Oleksiy 2026-10-17)', () => {
  const rect = vi.spyOn(globalThis.HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ height: 420, width: 280, top: 0, left: 0, right: 280, bottom: 420, x: 0, y: 0 });
  globalThis.innerHeight = 900;
  render(<CellStatusMenu cell={{ date: '2026-10-20', start: '19:30', end: '20:00', x: 400, y: 850 }} onStatus={vi.fn()} onLesson={vi.fn()} onClose={vi.fn()} />);
  const top = parseFloat(screen.getByRole('dialog').style.top);
  expect(top + 420).toBeLessThanOrEqual(900 - 8);
  expect(top).toBe(850 - 420 - 8);
  rect.mockRestore();
});
