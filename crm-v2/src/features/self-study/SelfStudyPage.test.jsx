import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import SelfStudyPage from './SelfStudyPage.jsx';

const vocabSheet = { worksheetId: 'discover', worksheetDocStatus: 'published', worksheetDoc: { meta: { phase: 'discover' }, blocks: [{ id: 'v', type: 'vocab', data: { words: 'raha — деньги, pank — банк, arve — счёт, hind — цена' } }] } };

function renderPage({ lessons = [{ topicLessonId: 'b1-003', date: '2026-10-08' }] } = {}) {
  const props = {
    studentRepository: { listSelf: vi.fn().mockResolvedValue([{ id: 's1', name: 'Mari', level: 'B1' }]) },
    lessonRepository: { listByStudent: vi.fn().mockResolvedValue(lessons) },
    catalogRepository: { listCurriculum: vi.fn().mockResolvedValue([
      { id: 'b1-003', title: 'Raha ja ost', level: 'B1', topic: '01. Igapäev', roadmapManaged: true, roadmapLessonNumber: 3 },
      { id: 'b1-004', title: 'Pank', level: 'B1', topic: '01. Igapäev', roadmapManaged: true, roadmapLessonNumber: 4 },
    ]) },
    worksheetRepository: { list: vi.fn().mockResolvedValue([vocabSheet]) },
    wordsService: { subscribeForStudent: vi.fn((id, next) => { next([{ id: 'w1', word: 'Ma läksin panka', translation: 'Sinu lause: Mina läksin pank' }]); return () => {}; }) },
    formsLoader: vi.fn().mockResolvedValue({ pank: ['pank', 'panga', 'panka'] }),
  };
  render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'u1' } }}><SelfStudyPage {...props} /></AuthContext.Provider></MemoryRouter>);
  return props;
}

describe('Kordamine page', () => {
  it('shows only held lessons and never the course worksheets', async () => {
    renderPage();
    expect(await screen.findByText('3. Raha ja ost')).toBeInTheDocument();
    expect(screen.queryByText(/Pank$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Avasta|Kasuta/)).not.toBeInTheDocument();
    expect(await screen.findByText('1 parandatud lauset')).toBeInTheDocument();
  });

  it('runs a drill one task at a time', async () => {
    const props = renderPage();
    fireEvent.click(await screen.findByText('3. Raha ja ost'));
    await waitFor(() => expect(props.worksheetRepository.list).toHaveBeenCalledWith('b1-003'));
    expect(await screen.findByText(/^1\//)).toBeInTheDocument();
  });

  it('explains that review opens after the first lesson', async () => {
    renderPage({ lessons: [] });
    expect(await screen.findByText('Kordamine avaneb pärast esimest tundi')).toBeInTheDocument();
  });
});
