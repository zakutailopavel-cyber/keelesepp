import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TrainingPage from './TrainingPage.jsx';

vi.mock('../../app/AuthContext.jsx', () => ({ useAuth: () => ({ user: { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] } }) }));

const finished = { id: 'c1', title: 'A2 hommikune rühm', curriculum: 'A2', contactHours: 133, independentHours: 67, startDate: '2026-03-09', endDate: '2026-10-30', status: 'finished', teacherName: 'Mari',
  participants: [{ studentId: 's9', name: 'Jaan', startedOn: '2026-03-09', attendancePct: 90, finalTestPct: 70, document: 'tunnistus', documentNumber: '2026-001', documentDate: '2026-10-30' }, { studentId: 's8', name: 'Olga', startedOn: '2026-03-09', attendancePct: 80, finalTestPct: -1 }] };

function setup(courses = [finished]) {
  const repository = {
    list: vi.fn(async () => courses),
    create: vi.fn(async (values) => ({ ...values, id: 'new' })),
    update: vi.fn(async (course, values) => ({ ...course, ...values })),
    lessonsOf: vi.fn(async () => [
      { studentId: 's1', date: '2026-09-14', status: 'Toimunud', duration: 60 },
      { studentId: 's1', date: '2026-09-16', status: 'Toimunud', duration: 60 },
      { studentId: 's1', date: '2026-09-21', status: 'Toimunud', duration: 60 },
      { studentId: 's1', date: '2026-09-23', status: 'Puudus_eta', duration: 60 },
    ]),
  };
  const students = { readList: async () => ({ items: [{ id: 's1', name: 'Anna Kask', level: 'B1' }, { id: 's2', name: 'Sergei Mets', level: 'B1' }] }) };
  const groups = { list: async () => [{ id: 'g1', name: 'B1 õhtu', teacher: 'Liis', students: ['s1', 's2'] }] };
  render(<TrainingPage repository={repository} studentsRepository={students} groupsRepository={groups} today="2026-11-27" />);
  return repository;
}

describe('TrainingPage', () => {
  it('shows the EHIS figures of the year from the finished courses', async () => {
    setup();
    const figures = await screen.findByRole('region', { name: 'Tegevusnäitajad 2026' });
    expect(figures).toHaveTextContent('Alustanud õppijaid2');
    expect(figures).toHaveTextContent('Väljaantud tunnistusi1');
    expect(figures).toHaveTextContent('Vajab tegemist1');
    expect(screen.getByLabelText('Kursused mahu järgi')).toHaveTextContent('81–240 ak t: 1');
    expect(screen.getByRole('button', { name: /A2 hommikune rühm/ })).toHaveTextContent('Eesti keel A2 · 09.03.2026–30.10.2026 · Mari');
    expect(screen.getByText('1 ilma dokumendita')).toBeInTheDocument();
  });

  it('creates a course from a group, reads attendance from the lesson marks and issues a numbered certificate', async () => {
    const repository = setup();
    fireEvent.click(await screen.findByRole('button', { name: /Uus kursus/ }));
    expect(screen.getByLabelText('Kontaktõpe (ak t) *')).toHaveValue(120);
    fireEvent.change(screen.getByLabelText('Kursuse nimi *'), { target: { value: 'B1 õhtune rühm' } });
    fireEvent.change(screen.getByLabelText('Algus *'), { target: { value: '2026-09-14' } });
    fireEvent.change(screen.getByLabelText('Grupp'), { target: { value: 'g1' } });
    expect(screen.getByLabelText('Koolitaja')).toHaveValue('Liis');
    fireEvent.click(screen.getByRole('button', { name: /Lisa grupi õppijad/ }));
    expect(screen.getByLabelText('Õppija 2 nimi')).toHaveValue('Sergei Mets');

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Loe osalus tundidest/ })); });
    expect(repository.lessonsOf).toHaveBeenCalledWith(['s1', 's2']);
    expect(screen.getByLabelText('Anna Kask: osalus %')).toHaveValue('75');
    expect(screen.getByLabelText('Anna Kask: alustas')).toHaveValue('2026-09-14');
    expect(screen.getByRole('status')).toHaveTextContent('1 õppijal uuendatud');

    fireEvent.change(screen.getByLabelText('Anna Kask: lõputest %'), { target: { value: '78' } });
    fireEvent.change(screen.getByLabelText('Sergei Mets: osalus %'), { target: { value: '140' } });
    expect(screen.getByLabelText('Sergei Mets: osalus %')).toHaveValue('');
    const row = screen.getByLabelText('Anna Kask: lõputest %').closest('tr');
    fireEvent.click(within(row).getByRole('button', { name: 'Väljasta tunnistus' }));
    expect(row).toHaveTextContent('Tunnistus nr 2026-00227.11.2026');

    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvesta' })); });
    expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
      title: 'B1 õhtune rühm', curriculum: 'B1', contactHours: 120, independentHours: 60, groupId: 'g1',
      participants: [expect.objectContaining({ studentId: 's1', attendancePct: 75, finalTestPct: 78, document: 'tunnistus', documentNumber: '2026-002', documentDate: '2026-11-27' }), expect.objectContaining({ studentId: 's2', attendancePct: -1, document: '' })],
    }), expect.objectContaining({ uid: 'admin-1' }));
    expect(screen.getByRole('status')).toHaveTextContent('Salvestatud: B1 õhtune rühm');
  });

  it('refuses a finished course without an end date', async () => {
    const repository = setup([]);
    fireEvent.click(await screen.findByRole('button', { name: /Uus kursus/ }));
    fireEvent.change(screen.getByLabelText('Kursuse nimi *'), { target: { value: 'B1' } });
    fireEvent.change(screen.getByLabelText('Algus *'), { target: { value: '2026-09-14' } });
    fireEvent.change(screen.getByLabelText('Seis'), { target: { value: 'finished' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvesta' })); });
    expect(screen.getByRole('alert')).toHaveTextContent('lõpu kuupäev');
    expect(repository.create).not.toHaveBeenCalled();
  });
});
