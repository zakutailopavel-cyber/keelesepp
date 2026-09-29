import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, vi } from 'vitest';
import BookPage from './BookPage.jsx';
import { sampleDocument } from './engine/sample.js';

const store = new Map();
Object.defineProperty(window, 'localStorage', { configurable: true, value: { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), clear: () => store.clear() } });
globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const doc = (title, level) => ({ ...sampleDocument(), meta: { ...sampleDocument().meta, title, level } });
const lessons = [
  { id: 'a', title: 'Minu päev', level: 'A2', worksheetDoc: doc('Minu päev', 'A2') },
  { id: 'b', title: 'Pere', level: 'A1', worksheetDoc: doc('Minu pere', 'A1') },
  { id: 'img', title: 'Ainult pilt', files: [{ url: 'https://f.example/x.png' }] },
];

describe('BookPage', () => {
  beforeEach(() => window.localStorage.clear());

  it('builds a book with cover, contents and running page numbers from structured worksheets only', async () => {
    const repository = { list: vi.fn().mockResolvedValue({ curriculumLessons: lessons, exercises: [] }) };
    const { container } = render(<MemoryRouter><BookPage repository={repository} /></MemoryRouter>);
    await screen.findByText('Õpik töölehtedest');
    expect(screen.queryByText('Ainult pilt')).toBeNull();
    fireEvent.change(screen.getByLabelText('Pealkiri'), { target: { value: 'Eesti keel' } });
    fireEvent.click(screen.getByRole('button', { name: /Minu pere/ }));
    fireEvent.click(screen.getByRole('button', { name: /Minu päev/ }));
    expect(container.querySelector('.ws-book-cover h1').textContent).toBe('Eesti keel');
    const toc = within(container.querySelector('.ws-book-toc'));
    expect(toc.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['A1 · Minu pere3', 'A2 · Minu päev4']);
    const footers = [...container.querySelectorAll('.ws-book .ws-page .ws-url')].map((f) => f.textContent);
    expect(footers.some((t) => t.endsWith(' · 3'))).toBe(true);
    expect(footers.some((t) => t.endsWith(' · 4'))).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Üles: Minu päev' }));
    expect(toc.getAllByRole('listitem')[0].textContent).toBe('A2 · Minu päev3');
    expect(JSON.parse(window.localStorage.getItem('ks-worksheet-book-draft')).ids).toEqual(['a', 'b']);
  });
});
