import { act, fireEvent, render, screen, within } from '@testing-library/react';
import StudentDirectionsCard from './StudentDirectionsCard.jsx';

const student = {
  id: 's1', name: 'Milan', subject: 'Eesti keel',
  enrollments: [
    { id: 'et', subject: 'Eesti keel', teacher: 'Pavel Zakutailo', teacherUid: 'p1', level: 'A2', targetLevel: 'B1', active: true },
    { id: 'ma', subject: 'Matemaatika', teacher: 'Yelyzaveta', teacherUid: 'y1', active: true, status: 'paused' },
  ],
};
const schedule = [{ id: 'w1', subject: 'Eesti keel', recurring: true, day: 'Mon', startDate: '2026-09-01', time: '15:00' }];

describe('student card „Õppesuunad”', () => {
  it('shows every direction with teacher, level, price and whether lessons are ahead', () => {
    render(<StudentDirectionsCard student={student} schedule={schedule} plan={{ lessonPriceCents: 2000, lessonMinutes: 60 }} canViewFinance today="2026-10-24" />);
    const rows = screen.getAllByRole('listitem');
    expect(within(rows[0]).getByText('Eesti keel')).toBeInTheDocument();
    expect(rows[0]).toHaveTextContent('Pavel Zakutailo · A2 → B1');
    expect(rows[0]).toHaveTextContent('Järgmine tund 26.10 kell 15:00');
    expect(rows[0]).toHaveTextContent('Hind: 20,00 € / 60 min');
    expect(within(rows[0]).getByText('Käib')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Paus')).toBeInTheDocument();
    expect(rows[1]).toHaveTextContent('kaardi hind');
    expect(screen.queryByRole('button', { name: 'Lõpeta' })).toBeNull();
  });

  it('hides prices without finance rights', () => {
    render(<StudentDirectionsCard student={student} schedule={schedule} plan={{ lessonPriceCents: 2000 }} today="2026-10-24" />);
    expect(screen.queryByText(/Hind:/)).toBeNull();
  });

  it('the admin pauses, resumes and ends a direction', async () => {
    const service = { updateEnrollment: vi.fn().mockResolvedValue({}) };
    const onChanged = vi.fn();
    render(<StudentDirectionsCard student={student} schedule={schedule} canEdit service={service} onChanged={onChanged} today="2026-10-24" />);
    const [et, ma] = screen.getAllByRole('listitem');
    await act(async () => { fireEvent.click(within(et).getByRole('button', { name: 'Paus' })); });
    expect(service.updateEnrollment).toHaveBeenLastCalledWith('s1', 'eesti keel|p1', expect.objectContaining({ status: 'paused', active: true }));
    await act(async () => { fireEvent.click(within(ma).getByRole('button', { name: 'Jätka' })); });
    expect(service.updateEnrollment).toHaveBeenLastCalledWith('s1', 'matemaatika|y1', expect.objectContaining({ status: '', active: true }));
    await act(async () => { fireEvent.click(within(ma).getByRole('button', { name: 'Lõpeta' })); });
    expect(service.updateEnrollment).toHaveBeenLastCalledWith('s1', 'matemaatika|y1', expect.objectContaining({ status: 'ended', active: false }));
    expect(onChanged).toHaveBeenCalledTimes(3);
  });
});
