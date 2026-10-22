import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../../app/AuthContext.jsx';
import CourseHealthPage from './CourseHealthPage.jsx';
import { COURSE_MODULES, moduleSheets } from '../admin/course/registry.js';

const mod = COURSE_MODULES.find((m) => m.MODULE.id === 'a2b1-module-05');
const sheets = moduleSheets(mod);
const [first, second] = Object.keys(sheets);

function renderPage(repository, roles = ['admin']) {
  render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'a', roles } }}><CourseHealthPage repository={repository} modules={[mod]} textbookSheets={[]} /></AuthContext.Provider></MemoryRouter>);
}

describe('CourseHealthPage', () => {
  it('compares the code with Õppevara and lists the lessons that need attention', async () => {
    const published = (doc) => ({ publishedWorksheetDoc: doc, worksheetDocStatus: 'published', worksheetDocVersion: 1, publishedWorksheetDocVersion: 1 });
    const repository = { list: vi.fn(async (id) => {
      if (id === first) return Object.entries(sheets[id]).map(([worksheetId, doc]) => ({ worksheetId, ...published(doc) }));
      if (id === second) return [{ worksheetId: 'discover', ...published({ ...sheets[id].discover, blocks: [] }) }];
      return [];
    }) };
    renderPage(repository);
    fireEvent.click(screen.getByRole('button', { name: 'Kontrolli Õppevaraga' }));
    await waitFor(() => expect(screen.getByLabelText('Kokkuvõte')).toBeInTheDocument());
    expect(repository.list).toHaveBeenCalledTimes(Object.keys(sheets).length);
    expect(screen.getByLabelText('Kokkuvõte')).toHaveTextContent('Avaldatud, erineb koodist: 1');
    expect(screen.getByLabelText('Kokkuvõte')).toHaveTextContent(`Avaldatud, sama mis koodis: ${Object.keys(sheets[first]).length}`);
    // the fully same lesson is hidden under „only problems”, the other one is listed
    expect(screen.queryByText(new RegExp(`^${first}$`))).not.toBeInTheDocument();
    expect(screen.getByText(second)).toBeInTheDocument();
  });

  it('is for admins only', () => {
    renderPage({ list: vi.fn() }, ['teacher']);
    expect(screen.getByText('Puudub ligipääs')).toBeInTheDocument();
  });
});
