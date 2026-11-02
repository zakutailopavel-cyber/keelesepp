import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
const noExtras = () => Promise.resolve({});

describe('BookPage', () => {
  beforeEach(() => window.localStorage.clear());

  it('builds a book with cover, contents and running page numbers from structured worksheets only', async () => {
    const repository = { list: vi.fn().mockResolvedValue({ curriculumLessons: lessons, exercises: [] }) };
    const { container } = render(<MemoryRouter><BookPage repository={repository} loadExtras={noExtras} /></MemoryRouter>);
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
    // a hand-picked old lesson sheet is marked by its lesson only (it is no phase sheet)
    const marked = container.querySelector('[data-entity="sheet"]');
    expect(marked.dataset.lessonId).toBe('a');
    expect(marked.dataset.worksheetId).toBeUndefined();
  });
});

describe('BookPage by the curriculum', () => {
  beforeEach(() => window.localStorage.clear());

  it('assembles one course as a textbook: cover, contents by module, opener, lesson heads, words and review', async () => {
    const lesson = (id, number, title, phases) => ({ id, title, level: 'B1', levelStage: 'A2', roadmapManaged: true, roadmapModuleNumber: 1, roadmapModuleTitle: '01. Igapäevaelu', roadmapModuleGoal: 'Говорить о повседневной жизни.', roadmapLessonNumber: number, languageFocus: 'olevik ja lihtminevik', worksheetPhases: phases });
    const repository = { list: vi.fn().mockResolvedValue({ curriculumLessons: [
      lesson('a2b1-002', 2, 'Minu päev', { discover: { publishedVersion: 1 } }),
      lesson('a2b1-001', 1, 'Lähtepunkt', { discover: { publishedVersion: 5 }, practice: { publishedVersion: 0, version: 1 } }),
      { id: 'a2-001', title: 'A2 tund', level: 'A2', roadmapManaged: true, roadmapModuleNumber: 1, roadmapLessonNumber: 1 },
    ], exercises: [] }) };
    const sheets = {
      'a2b1-001': [
        { worksheetId: 'discover', publishedWorksheetDoc: doc('Avasta: minu eesti keel', 'B1'), worksheetDocStatus: 'published' },
        { worksheetId: 'practice', worksheetDoc: doc('Harjuta mustand', 'B1'), worksheetDocStatus: 'draft' },
        { worksheetId: 'opik', publishedWorksheetDoc: doc('Õpiku leht', 'B1'), worksheetDocStatus: 'published' },
      ],
      'a2b1-002': [{ worksheetId: 'discover', publishedWorksheetDoc: doc('Avasta: päev', 'B1'), worksheetDocStatus: 'published' }],
    };
    const worksheetRepository = { list: vi.fn((id) => Promise.resolve(sheets[id] || [])) };
    const loadExtras = vi.fn().mockResolvedValue({
      words: { 'a2b1-001': [{ et: 'nimi', ru: 'имя' }, { et: 'keel', ru: 'язык' }], 'a2b1-002': [{ et: 'hommik', ru: 'утро' }, { et: 'nimi', ru: 'имя' }] },
      goals: { 'a2b1-001': { canDo: 'Ma tutvustan ennast.' } },
    });
    const { container } = render(<MemoryRouter><BookPage repository={repository} worksheetRepository={worksheetRepository} loadExtras={loadExtras} /></MemoryRouter>);
    fireEvent.change(await screen.findByLabelText('Õpiku kursus'), { target: { value: 'B1' } });
    expect(screen.getByRole('option', { name: 'Eesti keel B1' })).toBeInTheDocument();
    expect(screen.getByLabelText('Valmidus')).toHaveTextContent('Avasta 2/2 · Harjuta 0/2 · Kasuta 0/2 · Õpik 0/2');
    const toc = within(await waitForToc(container));
    // cover 1, contents 2, opener 3, lesson 1: Avasta 4 + Õpik 5, lesson 2: Avasta 6, Sõnad 7, Korda 8
    expect(toc.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['1. moodul · Igapäevaelu3', '1. Lähtepunkt4', '2. Minu päev6', 'Sõnad ja Korda7']);
    expect(loadExtras).toHaveBeenCalledWith(['a2b1-001', 'a2b1-002']);
    expect(container.querySelector('.ws-book-cover h1').textContent).toBe('Eesti keel B1');
    expect(container.querySelector('.ws-book-cover-level').textContent).toBe('A2 → B1');

    // module opener: goal, lessons with what the learner can do and their pages, key words (a word is listed once)
    const openerEl = container.querySelector('[data-book-page="opener"]');
    const opener = within(openerEl);
    expect(opener.getByRole('heading', { level: 1 })).toHaveTextContent('Igapäevaelu');
    expect(opener.getByText('Говорить о повседневной жизни.')).toBeInTheDocument();
    expect(opener.getByText('Ma tutvustan ennast.')).toBeInTheDocument();
    expect([...openerEl.querySelectorAll('.ws-book-chips b')].map((b) => b.textContent)).toEqual(['nimi', 'keel', 'hommik']);
    expect([...openerEl.querySelectorAll('.ws-book-lessons em')].map((em) => em.textContent)).toEqual(['4', '6']);

    // sheets in lesson order, phases Avasta → … → Õpik, marked for the right-click menu; the lesson head only over the
    // first sheet of a lesson; the book's running head and footer on the sheet pages
    const sheetsInBook = [...container.querySelectorAll('[data-entity="sheet"]')];
    expect(sheetsInBook.map((el) => `${el.dataset.lessonId}:${el.dataset.worksheetId}`)).toEqual(['a2b1-001:discover', 'a2b1-001:opik', 'a2b1-002:discover']);
    expect(sheetsInBook[0].querySelector('.ws-lesson-head')).toHaveTextContent('Ma tutvustan ennast.');
    expect(sheetsInBook[0].querySelector('.ws-lesson-phases').textContent).toBe('AvastaÕpik');
    expect(sheetsInBook[1].querySelector('.ws-lesson-head')).toBeNull();
    expect(sheetsInBook[2].querySelector('.ws-lesson-head')).toHaveTextContent('olevik ja lihtminevik');
    expect(sheetsInBook[0].querySelector('.ws-page .ws-runhead.is-book').textContent).toBe('Eesti keel B1 · 1. moodul · IgapäevaeluTund 1 · Avasta');
    expect(sheetsInBook[1].querySelector('.ws-page .ws-url').textContent).toBe('Eesti keel B1 · 5');
    const ids = new Set(sampleDocument().blocks.map((item) => item.id));
    const blocks = [...sheetsInBook[0].querySelectorAll('.ws-page [data-entity="block"]')];
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.every((el) => ids.has(el.dataset.blockId))).toBe(true);
    expect(container.querySelector('.ws-measure [data-entity="block"]')).toBeNull();
    expect(sheetsInBook.every((el) => el.querySelector('.ws-root.theme-klassika'))).toBe(true);

    // words page: grouped by lesson, et + ru; review page: goals checklist, language focus, self-check pointing to Sõnad
    const words = within(container.querySelector('[data-book-page="words"]'));
    expect(words.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['1. Lähtepunkt', '2. Minu päev']);
    expect(words.getByText('утро')).toBeInTheDocument();
    const review = within(container.querySelector('[data-book-page="review"]'));
    expect(review.getByText('Ma tutvustan ennast.')).toBeInTheDocument();
    expect(review.getAllByText('olevik ja lihtminevik')).toHaveLength(2);
    expect(review.getByText('Kontrolli: Sõnad, lk 7')).toBeInTheDocument();
    expect(container.querySelector('[data-book-page="review"] .ws-url').textContent).toBe('Eesti keel B1 · 8');

    // the optional Õpik sheet is never listed missing
    expect(screen.getByText('Puudu 4 avaldatud lehte')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '1. Lähtepunkt · Harjuta' })).toHaveAttribute('href', '/library/lessons/a2b1-001/worksheets/practice');
  });

  it('leaves the module pages out on request and keeps a sheet\'s own theme when the book look is off', async () => {
    const repository = { list: vi.fn().mockResolvedValue({ curriculumLessons: [
      { id: 'b1b2-001', title: 'Algus', level: 'B2', roadmapManaged: true, roadmapModuleNumber: 1, roadmapModuleTitle: 'Igapäevaelu', roadmapLessonNumber: 1 },
    ], exercises: [] }) };
    const own = { ...doc('Oma teema', 'B2'), meta: { ...doc('Oma teema', 'B2').meta, theme: 'pastel' } };
    const worksheetRepository = { list: vi.fn(() => Promise.resolve([{ worksheetId: 'discover', publishedWorksheetDoc: own, worksheetDocStatus: 'published' }])) };
    const loadExtras = vi.fn().mockResolvedValue({ words: {}, goals: {} });
    const { container } = render(<MemoryRouter><BookPage repository={repository} worksheetRepository={worksheetRepository} loadExtras={loadExtras} /></MemoryRouter>);
    await waitFor(() => expect(container.querySelector('[data-entity="sheet"] .ws-root')).not.toBeNull());
    expect(container.querySelector('[data-book-page="opener"]')).not.toBeNull();
    // no words: no word page, the review page stays
    expect(container.querySelector('[data-book-page="words"]')).toBeNull();
    expect(container.querySelector('[data-book-page="review"]')).not.toBeNull();
    expect(container.querySelector('[data-entity="sheet"] .ws-root.theme-klassika')).not.toBeNull();
    fireEvent.click(screen.getByLabelText(/Ühtne kujundus/));
    expect(container.querySelector('[data-entity="sheet"] .ws-root.theme-pastel')).not.toBeNull();
    fireEvent.click(screen.getByLabelText(/Mooduli avaleht/));
    await waitFor(() => expect(container.querySelector('[data-book-page="opener"]')).toBeNull());
    await waitFor(() => expect(container.querySelector('[data-entity="sheet"]')).not.toBeNull());
    expect(container.querySelector('[data-book-page="review"]')).toBeNull();
    expect(container.querySelector('[data-entity="sheet"] .ws-lesson-head')).toBeNull();
  });
});

describe('BookPage editing', () => {
  beforeEach(() => window.localStorage.clear());

  it('opens a sheet in its editor and shows the published change when the book tab is back', async () => {
    const repository = { list: vi.fn().mockResolvedValue({ curriculumLessons: [
      { id: 'b1b2-002', title: 'Minu tavaline päev', level: 'B2', roadmapManaged: true, roadmapModuleNumber: 1, roadmapModuleTitle: 'Igapäevaelu', roadmapLessonNumber: 2, worksheetPhases: { discover: { publishedVersion: 1 } } },
    ], exercises: [] }) };
    let sheets = [{ worksheetId: 'discover', publishedWorksheetDoc: doc('Vana pealkiri', 'B2'), worksheetDocStatus: 'published' }];
    const worksheetRepository = { list: vi.fn(() => Promise.resolve(sheets)) };
    const { container } = render(<MemoryRouter><BookPage repository={repository} worksheetRepository={worksheetRepository} loadExtras={noExtras} /></MemoryRouter>);
    await waitForToc(container);
    const edit = await screen.findByRole('link', { name: /Muuda lehte: 2\. Minu tavaline päev · Avasta/ });
    expect(edit).toHaveAttribute('href', '/library/lessons/b1b2-002/worksheets/discover?tagasi=opik');
    expect(edit).toHaveAttribute('target', '_blank');
    fireEvent.click(edit);
    sheets = [{ worksheetId: 'discover', publishedWorksheetDoc: doc('Uus pealkiri', 'B2'), worksheetDocStatus: 'published' }];
    fireEvent(window, new window.Event('focus'));
    expect((await screen.findAllByText('Uus pealkiri')).length).toBeGreaterThan(0);
    expect(screen.queryByText('Vana pealkiri')).toBeNull();
    expect(worksheetRepository.list).toHaveBeenLastCalledWith('b1b2-002');
  });
});

async function waitForToc(container) {
  let toc;
  await waitFor(() => { toc = container.querySelector('.ws-book-toc'); expect(toc.querySelectorAll('li').length).toBeGreaterThan(1); });
  return toc;
}
