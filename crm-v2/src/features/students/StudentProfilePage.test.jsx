import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, beforeAll, vi } from 'vitest';
import StudentProfilePage from './StudentProfilePage.jsx';

// Invoice fixtures are dated October 2026: pin the clock (Date only) so "partly paid" does not turn into "overdue".
beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-10-01T09:00:00Z')); });
afterAll(() => { vi.useRealTimers(); });

function renderProfile({
  actor = { roles: ['admin'], displayName: 'Admin' },
  student = { id: 's1', name: 'Mari Maas', teacher: 'Pavel', active: true, skillMap: {} },
  lessons = [],
  invoices = [],
  schedule = [],
} = {}) {
  const apis = {
    studentApi: { getById: vi.fn().mockResolvedValue(student), update: vi.fn() },
    lessonApi: { listByStudent: vi.fn().mockResolvedValue(lessons) },
    invoiceApi: { listByStudent: vi.fn().mockResolvedValue(invoices) },
    scheduleApi: { listByStudent: vi.fn().mockResolvedValue(schedule) },
  };
  render(
    <MemoryRouter initialEntries={['/students/s1']}>
      <Routes>
        <Route path="/students/:studentId" element={<StudentProfilePage {...apis} actor={actor} />} />
      </Routes>
    </MemoryRouter>,
  );
  return apis;
}

describe('student profile tabs and role access', () => {
  it('shows a concise overview first and switches to the lessons tab with planned and unmarked lessons', async () => {
    renderProfile({
      schedule: [{ id: 'sc1', date: '2026-10-10', time: '15:00', teacher: 'Pavel' }, { id: 'sc0', date: '2026-08-10', time: '15:00', teacher: 'Pavel', status: 'Planeeritud' }],
    });

    expect(await screen.findByRole('tab', { name: 'Ülevaade' }, { timeout: 4000 })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Mari Maas' })).toBeInTheDocument();
    expect(screen.getByText('MM')).toBeInTheDocument();
    expect(screen.getByText('2', { selector: '.student-profile-hero__stats strong' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Põhiandmed' })).toBeInTheDocument();
    expect(screen.queryByText('2026-10-10 · 15:00')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Tunnid' }));

    expect(screen.getByRole('tab', { name: 'Tunnid' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByText('2026-10-10 · 15:00', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText(/1 möödunud tundi on märkimata \(2026-08-10\)/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Põhiandmed' })).not.toBeInTheDocument();
  });

  it('shows held lessons in Tunnid and progress in Areng', async () => {
    renderProfile({
      student: {
        id: 's1',
        name: 'Mari Maas',
        teacher: 'Pavel',
        active: true,
        skillMap: { Lugemine: 82 },
      },
      lessons: [{ id: 'l1', date: '2026-08-04', time: '14:00', status: 'Toimunud', subject: 'Eesti keel' }],
    });

    await screen.findByRole('tab', { name: 'Tunnid' }, { timeout: 4000 });
    expect(screen.queryByText('2026-08-04 · 14:00')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Tunnid' }));
    expect(await screen.findByText('2026-08-04 · 14:00', {}, { timeout: 4000 })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Areng' }));
    expect(screen.getByText('Lugemine')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
  });

  it('renders detailed finance history only after an administrator opens the finance tab', async () => {
    renderProfile({
      invoices: [
        { id: 'i1', num: 'KS-101', date: '2026-10-01', due: '2026-10-10', amountCents: 8000, paidAmountCents: 3000, balanceDueCents: 5000, status: 'Ootel' },
        { id: 'i2', num: 'KS-100', date: '2026-07-01', due: '2026-07-10', amountCents: 4000, paidAmountCents: 4000, balanceDueCents: 0, status: 'Makstud' },
      ],
    });

    await screen.findByRole('tab', { name: 'Finantsid' }, { timeout: 4000 });
    expect(screen.queryByText('KS-101')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Finantsid' }));

    const finance = (await screen.findByRole('heading', { name: 'Arved ja maksed' }, { timeout: 4000 })).closest('section');
    expect(await screen.findByText('KS-101', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('KS-100')).toBeInTheDocument();
    expect(screen.getByText('Osaliselt makstud')).toBeInTheDocument();
    expect(screen.getAllByText('Makstud').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Loo arve/ })).toHaveAttribute('href', '/finance#kuuarved');
    expect(within(finance).getAllByText('50,00 €').length).toBeGreaterThan(0);
  });

  it('shows a clear empty finance state in the finance tab', async () => {
    renderProfile();
    await screen.findByRole('tab', { name: 'Finantsid' }, { timeout: 4000 });
    fireEvent.click(screen.getByRole('tab', { name: 'Finantsid' }));

    expect(await screen.findByText('Õpilasel ei ole veel arveid', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getAllByText('0,00 €')).toHaveLength(3);
  });

  it('blocks a teacher from another teacher’s student before loading related data', async () => {
    const apis = renderProfile({
      actor: { roles: ['teacher'], displayName: 'Pavel Zakutailo' },
      student: { id: 's1', name: 'Mari', teacher: 'Jelena' },
    });

    expect(await screen.findByText('Ligipääs puudub')).toBeInTheDocument();
    expect(apis.lessonApi.listByStudent).not.toHaveBeenCalled();
    expect(apis.scheduleApi.listByStudent).not.toHaveBeenCalled();
    expect(apis.invoiceApi.listByStudent).not.toHaveBeenCalled();
  });

  it('shows an assigned student to a teacher without exposing the finance tab', async () => {
    const apis = renderProfile({
      actor: { roles: ['teacher'], displayName: 'Pavel Zakutailo' },
      schedule: [{ id: 'sc1', day: 'Mon', time: '12:00' }],
    });

    expect(await screen.findByText('Mari Maas')).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Finantsid' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Tunnid' }));
    expect(await screen.findByText('Iganädalane · Mon · 12:00', {}, { timeout: 4000 })).toBeInTheDocument();
    expect(apis.invoiceApi.listByStudent).not.toHaveBeenCalled();
  });

  it('shows an admin the Facebook and Instagram contact with message links; a teacher does not see them', async () => {
    renderProfile({ student: { id: 's1', name: 'Mari Maas', teacher: 'Pavel Zakutailo', active: true, skillMap: {}, facebook: 'mari.maasikas', instagram: '@mari_m' } });
    expect(await screen.findByRole('link', { name: 'mari.maasikas' }, { timeout: 4000 })).toHaveAttribute('href', 'https://www.facebook.com/mari.maasikas');
    const write = screen.getAllByRole('link', { name: 'Kirjuta' });
    expect(write.map((link) => link.getAttribute('href'))).toEqual(['https://m.me/mari.maasikas', 'https://ig.me/m/mari_m']);
  });

  it('hides the social contacts from a teacher', async () => {
    renderProfile({ actor: { roles: ['teacher'], displayName: 'Pavel Zakutailo' }, student: { id: 's1', name: 'Mari Maas', teacher: 'Pavel Zakutailo', active: true, skillMap: {}, facebook: 'mari.maasikas' } });
    expect(await screen.findByRole('heading', { name: 'Põhiandmed' }, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.queryByText('Facebook')).not.toBeInTheDocument();
  });

  it('lets an admin mark a held lesson checked, change and remove a mark; a teacher only sees the mark', async () => {
    const lesson = { id: 'l1', date: '2026-09-04', time: '14:00', status: 'Toimunud', subject: 'Eesti keel', studentName: 'Mari Maas' };
    const apis = renderProfile({ lessons: [lesson, { id: 'l2', date: '2026-09-02', status: 'Puudus_p' }] });
    apis.lessonApi.setVerified = vi.fn().mockImplementation(async (record, verified) => ({ ...record, verified, verifiedByName: 'Admin' }));
    apis.lessonApi.changeMark = vi.fn().mockImplementation(async (record, status) => ({ ...record, status, verified: false }));
    apis.lessonApi.removeMark = vi.fn().mockResolvedValue(undefined);
    fireEvent.click(await screen.findByRole('tab', { name: 'Tunnid' }, { timeout: 4000 }));

    const mark = await screen.findByRole('combobox', { name: 'Tunni 2026-09-04 staatus' });
    expect(mark).toHaveValue('Toimunud');
    fireEvent.change(mark, { target: { value: 'verified' } });
    expect(await screen.findByText(/Kontrollis Admin/)).toBeInTheDocument();
    expect(apis.lessonApi.setVerified).toHaveBeenCalledWith(expect.objectContaining({ id: 'l1' }), true, expect.anything());
    expect(screen.getByRole('combobox', { name: 'Tunni 2026-09-04 staatus' })).toHaveValue('verified');

    fireEvent.change(screen.getByRole('combobox', { name: 'Tunni 2026-09-04 staatus' }), { target: { value: 'Puudus_eta' } });
    expect(await screen.findByText(/Puudus \(ei teatanud\)\./)).toBeInTheDocument();
    expect(apis.lessonApi.changeMark).toHaveBeenCalledWith(expect.objectContaining({ id: 'l1' }), 'Puudus_eta', expect.anything(), { scheduleRecurring: true });

    const confirm = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    fireEvent.change(screen.getByRole('combobox', { name: 'Tunni 2026-09-02 staatus' }), { target: { value: 'remove' } });
    expect(await screen.findByText(/Märge eemaldati/)).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'Tunni 2026-09-02 staatus' })).not.toBeInTheDocument();
    confirm.mockRestore();
  });

  it('shows a teacher the marks without the status control', async () => {
    renderProfile({
      actor: { roles: ['teacher'], displayName: 'Pavel Zakutailo' },
      lessons: [{ id: 'l1', date: '2026-09-04', status: 'Toimunud', verified: true, verifiedByName: 'Admin' }],
    });
    fireEvent.click(await screen.findByRole('tab', { name: 'Tunnid' }, { timeout: 4000 }));
    expect(await screen.findByText('Toimunud ja kontrollitud')).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /staatus/ })).not.toBeInTheDocument();
  });

  it('lists the student\'s works; checking one with skill grades updates the skill map in Areng', async () => {
    const work = { id: 'w1', submissionKind: 'worksheet', studentId: 's1', studentName: 'Mari Maas', title: 'Pere tööleht', completedAt: '2026-09-20T10:00:00.000Z', percentage: 80, score: { correct: 4, total: 5 }, answers: { a: 'ema' }, reviewStatus: 'pending', skillGrades: {}, source: {} };
    const homeworkApi = {
      listSubmissionsByStudentIds: vi.fn().mockResolvedValue([work]),
      saveSubmissionAnnotations: vi.fn(),
      reviewSubmission: vi.fn().mockImplementation(async ({ submission, skillGrades }) => ({ ...submission, reviewStatus: 'reviewed', skillGrades, skillMap: { Lugemine: 82, Grammatika: 80 } })),
    };
    render(
      <MemoryRouter initialEntries={['/students/s1']}>
        <Routes><Route path="/students/:studentId" element={<StudentProfilePage studentApi={{ getById: vi.fn().mockResolvedValue({ id: 's1', name: 'Mari Maas', teacher: 'Pavel', active: true, skillMap: { Lugemine: 82 } }) }} lessonApi={{ listByStudent: vi.fn().mockResolvedValue([]) }} invoiceApi={{ listByStudent: vi.fn().mockResolvedValue([]) }} scheduleApi={{ listByStudent: vi.fn().mockResolvedValue([]) }} homeworkApi={homeworkApi} actor={{ uid: 'a', roles: ['admin'], displayName: 'Admin' }} />} /></Routes>
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole('tab', { name: 'Tööd' }, { timeout: 4000 }));
    fireEvent.click(await screen.findByRole('button', { name: /Pere tööleht/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Pere tööleht' });
    expect(within(dialog).getByText('Lugemine')).toBeInTheDocument();
    fireEvent.change(within(dialog).getByRole('combobox', { name: 'Oskus Grammatika' }), { target: { value: '4' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Saada tagasiside/ }));
    expect(await screen.findByText(/Oskuste hinnang on arengukaardil/)).toBeInTheDocument();
    expect(homeworkApi.reviewSubmission).toHaveBeenCalledWith(expect.objectContaining({ skillGrades: { Grammatika: 4 } }));

    fireEvent.click(screen.getByRole('tab', { name: 'Areng' }));
    expect(screen.getByText('Grammatika')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
  });
});
