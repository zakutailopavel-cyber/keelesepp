import { act, fireEvent, render, screen } from '@testing-library/react';
import { AuthContext } from '../../../app/AuthContext.jsx';
import CourseProductionPage from './CourseProductionPage.jsx';

const admin = { uid: 'a', roles: ['admin'] };
const page = (repository) => render(<AuthContext.Provider value={{ user: admin }}><CourseProductionPage repository={repository} /></AuthContext.Provider>);

describe('CourseProductionPage', () => {
  it('shows the module sheets with the quality gate and publishes a lesson after confirmation', async () => {
    const repository = {
      load: vi.fn(async (lessonId, phase) => { if (lessonId === 'a2b1-006' && phase === 'practice') return { worksheetDocVersion: 2, worksheetDocUpdatedAt: 't' }; throw new Error('Töölehte ei leitud.'); }),
      publish: vi.fn(async ({ lessonId, worksheetId }) => ({ lessonId, worksheetId, worksheetDocVersion: 1, publishedWorksheetDocVersion: 1 })),
    };
    page(repository);
    expect(await screen.findByText(/Kvaliteedikontroll läbitud/)).toBeInTheDocument();
    expect(await screen.findByText(/a2b1-006 · Pere ja lähedased/)).toBeInTheDocument();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    await act(async () => { fireEvent.click(screen.getAllByRole('button', { name: 'Avalda tund' })[0]); });
    expect(confirm.mock.calls[0][0]).toMatch(/asendatakse uue versiooniga: 2 Harjuta/);
    expect(repository.publish).toHaveBeenCalledTimes(2);
    expect(repository.publish.mock.calls[0][0]).toMatchObject({ lessonId: 'a2b1-006', worksheetId: 'practice', baseUpdatedAt: 't', slot: 2 });
    confirm.mockRestore();
  });

  it('is for admins only', () => {
    render(<AuthContext.Provider value={{ user: { uid: 't', roles: ['teacher'] } }}><CourseProductionPage repository={{ load: vi.fn() }} /></AuthContext.Provider>);
    expect(screen.getByText('Puudub ligipääs')).toBeInTheDocument();
  });
});
