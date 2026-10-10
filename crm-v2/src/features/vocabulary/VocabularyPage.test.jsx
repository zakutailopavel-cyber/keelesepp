import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import VocabularyPage from './VocabularyPage.jsx';
import StudySession from './StudySession.jsx';

const sheet = (words, pairs = []) => ({ worksheetDocStatus: 'published', worksheetDoc: { blocks: [{ type: 'vocab', data: { words } }, { type: 'match', data: { pairs } }] } });

function renderPage(overrides = {}) {
  const wordsService = {
    subscribeForStudent: vi.fn((id, onData) => { onData([{ id: 'w1', studentId: 's1', word: 'kass', translation: 'кошка', box: 0, dueAt: '' }, { id: 'w2', studentId: 's1', word: 'koer', translation: 'собака', box: 1, dueAt: '2999-01-01' }]); return vi.fn(); }),
    review: vi.fn().mockResolvedValue({}),
    addOwn: vi.fn().mockResolvedValue({}),
  };
  const props = {
    studentRepository: { listSelf: vi.fn().mockResolvedValue([{ id: 's1', name: 'Mari', level: 'B1' }]) },
    lessonRepository: { listByStudent: vi.fn().mockResolvedValue([{ id: 'l1', topicLessonId: 'b1-003' }]) },
    catalogRepository: { listCurriculum: vi.fn().mockResolvedValue([
      { id: 'b1-003', title: 'Raha ja ost', level: 'B1', topic: '01. Igapäev', roadmapManaged: true, roadmapLessonNumber: 3 },
      { id: 'b1-004', title: 'Pank', level: 'B1', topic: '01. Igapäev', roadmapManaged: true, roadmapLessonNumber: 4 },
    ]) },
    worksheetRepository: { list: vi.fn().mockResolvedValue([sheet('eelarve — бюджет, sääst — экономия', [{ left: 'intress', right: 'laenu hind' }])]) },
    wordsService,
    ...overrides,
  };
  render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'u1', displayName: 'Mari' } }}><VocabularyPage {...props} /></AuthContext.Provider></MemoryRouter>);
  return props;
}

describe('Sõnavara page', () => {
  it('shows my words, the lessons I had and the course lessons of my level', async () => {
    renderPage();
    expect(await screen.findByRole('button', { name: /Minu sõnad.*2 sõna · 1 kordamiseks/ })).toBeInTheDocument();
    const mine = screen.getByRole('heading', { name: 'Tundide sõnad' }).closest('.card') || document.body;
    expect(within(mine).getByRole('button', { name: /3\. Raha ja ost/ })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Tase' })).toHaveValue('B1');
  });

  it('opens a course lesson deck from its published sheets and offers the five ways', async () => {
    const props = renderPage();
    fireEvent.click((await screen.findAllByRole('button', { name: /3\. Raha ja ost/ }))[0]);
    expect(await screen.findByRole('region', { name: 'Õppimine: 3. Raha ja ost' })).toBeInTheDocument();
    expect(props.worksheetRepository.list).toHaveBeenCalledWith('b1-003');
    expect(screen.getByText('3 kaarti')).toBeInTheDocument();
    ['Kaardid', 'Õpi', 'Kirjuta', 'Sobita', 'Test'].forEach((name) => expect(screen.getByRole('button', { name: new RegExp(`^${name}`) })).toBeInTheDocument());
  });

  it('flashcards of my own words move them in their boxes once per session', async () => {
    const props = renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /Minu sõnad/ }));
    fireEvent.click(screen.getByRole('button', { name: /^Kaardid/ }));
    fireEvent.click(screen.getByRole('button', { name: /Tean/ }));
    fireEvent.click(screen.getByRole('button', { name: /Õpin veel/ }));
    await waitFor(() => expect(props.wordsService.review).toHaveBeenCalledTimes(2));
    expect(screen.getByText(/Tean 1, õpin veel 1/)).toBeInTheDocument();
  });

  it('missed course words can be kept in my words', async () => {
    const props = renderPage();
    fireEvent.click((await screen.findAllByRole('button', { name: /3\. Raha ja ost/ }))[0]);
    fireEvent.click(await screen.findByRole('button', { name: /^Kaardid/ }));
    for (let i = 0; i < 3; i += 1) fireEvent.click(screen.getByRole('button', { name: /Õpin veel/ }));
    fireEvent.click(screen.getByRole('button', { name: /Lisa raskemad minu sõnadesse/ }));
    await waitFor(() => expect(props.wordsService.addOwn).toHaveBeenCalledTimes(3));
    expect(props.wordsService.addOwn).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's1', word: expect.any(String), translation: expect.any(String) }));
    expect(props.wordsService.review).not.toHaveBeenCalled();
  });
});

describe('study modes', () => {
  const deck = [
    { id: '1', front: 'eelarve', back: 'бюджет' }, { id: '2', front: 'sääst', back: 'экономия' },
    { id: '3', front: 'intress', back: 'процент' }, { id: '4', front: 'laen', back: 'кредит' },
  ];

  it('„Kirjuta” accepts a near spelling and lists the misses at the end', () => {
    const onResult = vi.fn();
    render(<StudySession deck={deck} title="Raha" onResult={onResult} onBack={vi.fn()} />);
    fireEvent.change(screen.getByRole('combobox', { name: 'Küsimuse suund' }), { target: { value: 'front' } });
    fireEvent.click(screen.getByRole('button', { name: /^Kirjuta/ }));
    for (let i = 0; i < 4; i += 1) {
      const asked = screen.getByText((_, node) => node?.tagName === 'STRONG' && deck.some((card) => card.back === node.textContent));
      const card = deck.find((item) => item.back === asked.textContent);
      fireEvent.change(screen.getByRole('textbox', { name: 'Sinu vastus' }), { target: { value: card.id === '1' ? 'eelarv' : card.id === '2' ? 'vale' : card.front } });
      fireEvent.click(screen.getByRole('button', { name: 'Kontrolli' }));
      fireEvent.click(screen.getByRole('button', { name: /Edasi/ }));
    }
    expect(screen.getByText('Valmis! Õigesti 3/4.')).toBeInTheDocument();
    expect(onResult).toHaveBeenCalledWith(deck[0], true);
    expect(onResult).toHaveBeenCalledWith(deck[1], false);
  });

  it('„Sobita” clears a pair when both sides are picked', () => {
    render(<StudySession deck={deck.slice(0, 2)} title="Raha" onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /^Sobita/ }));
    fireEvent.click(screen.getByRole('button', { name: 'eelarve' }));
    fireEvent.click(screen.getByRole('button', { name: 'бюджет' }));
    expect(screen.queryByRole('button', { name: 'eelarve' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'sääst' }));
    fireEvent.click(screen.getByRole('button', { name: 'экономия' }));
    expect(screen.getByText(/Kõik paarid leitud/)).toBeInTheDocument();
  });

  it('„Test” grades every question and shows the right answers', () => {
    render(<StudySession deck={deck} title="Raha" onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /^Test/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Vaata tulemust' }));
    expect(screen.getByText(/Tulemus: 0\/4/)).toBeInTheDocument();
    expect(screen.getAllByText(/Õige vastus:/).length).toBeGreaterThan(0);
  });
});
