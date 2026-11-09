import { beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { readTheme, saveTheme, THEME_STORAGE_KEY } from '../../app/theme.js';
import ThemeMenu from './ThemeMenu.jsx';

describe('„Teema: Hele / Tume / Süsteem”', () => {
  beforeEach(() => { globalThis.localStorage.clear(); document.documentElement.removeAttribute('data-theme'); });

  it('defaults to the system theme and sets it on <html>', () => {
    render(<ThemeMenu uid="u1" supported />);
    expect(screen.getByRole('button', { name: 'Teema: Süsteem' })).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('system');
  });

  it('a choice is applied at once and kept for the user and as the device default', () => {
    render(<ThemeMenu uid="u1" supported />);
    fireEvent.click(screen.getByRole('button', { name: 'Teema: Süsteem' }));
    expect(screen.getByRole('radiogroup', { name: 'Teema' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Tume' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(globalThis.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(globalThis.localStorage.getItem(`${THEME_STORAGE_KEY}.u1`)).toBe('dark');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Teema: Tume' })).toBeInTheDocument();
  });

  it('the signed-in user’s own choice wins over the device’s last one', () => {
    saveTheme('dark', 'other-person');
    saveTheme('light', 'u2');
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(readTheme('u2')).toBe('light');
    expect(readTheme('u3')).toBe('dark');
    render(<ThemeMenu uid="u2" supported />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('ignores junk in storage and hides itself where the browser cannot draw the dark theme', () => {
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    expect(readTheme()).toBe('system');
    const { container } = render(<ThemeMenu uid="u1" supported={false} />);
    expect(container).toBeEmptyDOMElement();
  });
});
