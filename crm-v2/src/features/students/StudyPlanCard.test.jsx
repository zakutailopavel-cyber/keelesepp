import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import StudyPlanCard from './StudyPlanCard.jsx';

const curriculumLessons = [1, 2, 3].map((n) => ({ id: `b1-${n}`, title: `Tund ${n}`, level: 'B1', roadmapModuleTitle: 'Igapäevaelu', roadmapModuleNumber: 1, roadmapLessonNumber: n }));

describe('StudyPlanCard', () => {
  it('builds a plan from the student results and saves it on the card', async () => {
    const students = { saveStudyPlan: vi.fn(async (id, plan) => ({ ...plan, updatedAt: '2026-10-27T10:00:00Z', updatedByName: 'Pavel' })) };
    const homework = { listWorksheetAssignmentsByStudentIds: vi.fn(async () => [{ lessonId: 'b1-1', status: 'done', score: { pct: 95 } }, { lessonId: 'b1-2', status: 'done', score: { pct: 30 } }]) };
    render(<StudyPlanCard student={{ id: 's1', name: 'Mia', level: 'B1' }} user={{ displayName: 'Pavel' }} canEdit
      library={{ list: vi.fn(async () => ({ curriculumLessons, exercises: [] })) }} homework={homework} students={students} />);
    const recommendations = await screen.findByRole('region', { name: 'Soovitused' });
    expect(within(recommendations).getByText('Korda: tulemus 30%')).toBeInTheDocument();
    expect(within(recommendations).queryByText('Tund 1')).toBeNull(); // learned well
    fireEvent.click(screen.getByRole('button', { name: 'Koosta plaan automaatselt' }));
    const plan = screen.getByRole('region', { name: 'Plaan' });
    expect(within(plan).getAllByRole('listitem').map((item) => within(item).getByRole('strong', { hidden: true }).textContent)).toEqual(['Tund 2', 'Tund 3']);
    fireEvent.change(screen.getByLabelText('Eesmärk'), { target: { value: 'Lõpueksam B1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta plaan' }));
    await waitFor(() => expect(students.saveStudyPlan).toHaveBeenCalledWith('s1', expect.objectContaining({ level: 'B1', goal: 'Lõpueksam B1', lessons: [{ id: 'b1-2', status: 'planned' }, { id: 'b1-3', status: 'planned' }] }), expect.anything()));
    expect(await screen.findByText('Õppeplaan salvestati.')).toBeInTheDocument();
  });
});
