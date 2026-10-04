import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import InitialAssessmentPanel from './InitialAssessmentPanel.jsx';
import { assessmentPayload, buildInitialAssessment } from './assessmentModel.js';

const student = { id: 's1', name: 'Mari', level: 'B1', targetLevel: 'B2' };
const user = { uid: 't1', displayName: 'Pavel', roles: ['teacher'] };

describe('InitialAssessmentPanel', () => {
  it('creates the first assessment from the empty state', async () => {
    const service = { get: vi.fn().mockResolvedValue(null), save: vi.fn((s, draft, actor, existing) => Promise.resolve(assessmentPayload(draft, s, actor, existing))) };
    render(<InitialAssessmentPanel student={student} user={user} service={service} />);
    fireEvent.click(await screen.findByRole('button', { name: /Loo esmane hindamine/ }));
    fireEvent.change(screen.getByLabelText('Täis- ja osasihitis: tulemus'), { target: { value: '45' } });
    expect(screen.getByLabelText('Täis- ja osasihitis: seis')).toHaveValue('needs_work');
    fireEvent.change(screen.getByLabelText('Uus teema (grammatika)'), { target: { value: 'Hääldus' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Lisa teema/ })[0]);
    fireEvent.change(screen.getByLabelText('Tugevused (üks rea kohta)'), { target: { value: 'Julge rääkija' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta hindamine' }));
    await waitFor(() => expect(service.save).toHaveBeenCalled());
    const [, draft, actor, existing] = service.save.mock.calls[0];
    expect(actor.uid).toBe('t1');
    expect(existing).toBeNull();
    expect(draft.grammarData.at(-1)).toMatchObject({ id: 'custom_haaldus', name: 'Hääldus' });
    const view = await screen.findByRole('region', { name: 'Esmane hindamine' });
    expect(within(view).getByText('B1 → B2')).toBeInTheDocument();
    expect(within(view).getByText('Julge rääkija')).toBeInTheDocument();
    expect(within(view).getByText('Esimesena harjutada')).toBeInTheDocument();
  });

  it('shows a saved assessment and edits it without touching creation fields', async () => {
    const saved = { ...buildInitialAssessment(student, { uid: 'admin', displayName: 'Admin' }, '2026-08-11T09:00:00.000Z'), overallStatus: 'developing' };
    const service = { get: vi.fn().mockResolvedValue(saved), save: vi.fn().mockRejectedValue(Object.assign(new Error('denied'), { code: 'permission-denied' })) };
    render(<InitialAssessmentPanel student={student} user={user} service={service} />);
    expect(await screen.findByText('Areneb')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Muuda/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta hindamine' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(service.save.mock.calls[0][3]).toBe(saved);
    fireEvent.click(screen.getByRole('button', { name: 'Loobu' }));
    expect(screen.getByRole('region', { name: 'Esmane hindamine' })).toBeInTheDocument();
  });
});
