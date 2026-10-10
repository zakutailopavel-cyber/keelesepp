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
    fireEvent.click(screen.getByRole('tab', { name: 'Vali käsitsi' }));
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

describe('BookPage by the curriculum', () => {
  beforeEach(() => window.localStorage.clear());

  it('assembles the published phase sheets of a level in curriculum order and lists what is missing', async () => {
    const lesson = (id, number, title, phases) => ({ id, title, level: 'B1', roadmapManaged: true, roadmapModuleNumber: 1, roadmapModuleTitle: '01. Igapäevaelu', roadmapLessonNumber: number, worksheetPhases: phases });
    const repository = { list: vi.fn().mockResolvedValue({ curriculumLessons: [
      lesson('a2b1-002', 2, 'Minu päev', { discover: { publishedVersion: 1 } }),
      lesson('a2b1-001', 1, 'Lähtepunkt', { discover: { publishedVersion: 5 }, practice: { publishedVersion: 0, version: 1 } }),
      { id: 'a2-001', title: 'A2 tund', level: 'A2', roadmapManaged: true, roadmapModuleNumber: 1, roadmapLessonNumber: 1 },
    ], exercises: [] }) };
    const sheets = {
      'a2b1-001': [
        { worksheetId: 'discover', publishedWorksheetDoc: doc('Avasta: minu eesti keel', 'B1'), worksheetDocStatus: 'published' },
        { worksheetId: 'practice', worksheetDoc: doc('Harjuta mustand', 'B1'), worksheetDocStatus: 'draft' },
      ],
      'a2b1-002': [{ worksheetId: 'discover', publishedWorksheetDoc: doc('Avasta: päev', 'B1'), worksheetDocStatus: 'published' }],
    };
    const worksheetRepository = { list: vi.fn((id) => Promise.resolve(sheets[id] || [])) };
    const { container } = render(<MemoryRouter><BookPage repository={repository} worksheetRepository={worksheetRepository} /></MemoryRouter>);
    fireEvent.change(await screen.findByLabelText('Õpiku tase'), { target: { value: 'B1' } });
    expect(screen.getByLabelText('Valmidus')).toHaveTextContent('Avasta 2/2 · Harjuta 0/2 · Kasuta 0/2');
    const toc = within(await waitForToc(container));
    expect(toc.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['1. Igapäevaelu', '1. Lähtepunkt · Avasta3', '2. Minu päev · Avasta4']);
    expect(worksheetRepository.list).toHaveBeenCalledWith('a2b1-001');
    expect(screen.getByText('Puudu 4 avaldatud lehte')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '1. Lähtepunkt · Harjuta' })).toHaveAttribute('href', '/library/lessons/a2b1-001/worksheets/practice');
    expect(container.querySelector('.ws-book-cover h1').textContent).toBe('Eesti keel B1');
  });
});

async function waitForToc(container) {
  const { waitFor } = await import('@testing-library/react');
  let toc;
  await waitFor(() => { toc = container.querySelector('.ws-book-toc'); expect(toc.querySelectorAll('li').length).toBeGreaterThan(1); });
  return toc;
}
