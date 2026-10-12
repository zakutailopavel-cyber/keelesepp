import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import SelfStudyPage from './SelfStudyPage.jsx';

// the worksheet player measures its canvas
globalThis.ResizeObserver ||= class { observe() {} unobserve() {} disconnect() {} };

const doc = (phase) => ({ meta: { phase, title: `Leht ${phase}` }, blocks: [{ id: 'b1', type: 'text', data: { heading: 'Tere', text: 'Tekst' } }] });
const sheet = (phase) => ({ worksheetId: phase, worksheetDocStatus: 'published', worksheetDoc: doc(phase) });

function renderPage() {
  const homework = {
    listWorksheetAssignmentsByStudentIds: vi.fn().mockResolvedValue([
      { id: 'w1', lessonId: 'b1-003', phase: 'discover', status: 'done', score: { pct: 80 }, worksheetDoc: doc('discover') },
    ]),
    createSelfStudy: vi.fn(async ({ lesson, phase, publishedDoc }) => ({ id: 'new-1', lessonId: lesson.id, phase, status: 'new', answers: {}, worksheetDoc: publishedDoc, source: 'self_study' })),
    saveWorksheetDraft: vi.fn(), submitWorksheet: vi.fn(),
  };
  const props = {
    studentRepository: { listSelf: vi.fn().mockResolvedValue([{ id: 's1', name: 'Mari', level: 'B1' }]) },
    catalogRepository: { listCurriculum: vi.fn().mockResolvedValue([
      { id: 'b1-003', title: 'Raha ja ost', level: 'B1', topic: '01. Igapäev', roadmapManaged: true, roadmapLessonNumber: 3 },
      { id: 'b1-004', title: 'Pank', level: 'B1', topic: '01. Igapäev', roadmapManaged: true, roadmapLessonNumber: 4 },
    ]) },
    worksheetRepository: { list: vi.fn().mockResolvedValue([sheet('discover'), sheet('practice'), sheet('transfer')]) },
    homework,
  };
  render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'u1', displayName: 'Mari' } }}><SelfStudyPage {...props} /></AuthContext.Provider></MemoryRouter>);
  return props;
}

describe('Õpi ise', () => {
  it('goes on with the started lesson and opens its next sheet as the student\'s own', async () => {
    const props = renderPage();
    expect(await screen.findByRole('heading', { name: '3. Raha ja ost' })).toBeInTheDocument();
    expect(screen.getByText('0/2 tundi läbitud')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Jätka/ }));
    expect(await screen.findByText('Tehtud · 80%')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button', { name: /Alusta/ });
    fireEvent.click(buttons[0]);
    await waitFor(() => expect(props.homework.createSelfStudy).toHaveBeenCalledWith(expect.objectContaining({ phase: 'practice', lesson: expect.objectContaining({ id: 'b1-003' }) })));
    expect(props.homework.createSelfStudy.mock.calls[0][0].publishedDoc.meta.phase).toBe('practice');
  });
});
