import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import AnnouncementsAdminPage from './AnnouncementsAdminPage.jsx';
import LearnerAnnouncementsCard from './LearnerAnnouncementsCard.jsx';

const admin = { uid: 'a1', displayName: 'Pavel', roles: ['admin'] };
const published = {
  id: 'n1', title: 'Sobivad ajad jaanuarist', body: 'Palun märgi', audience: 'parents', subjects: [], levels: ['B1'], studentIds: [],
  activeFrom: '2026-01-01', activeTo: '', responseType: 'availability', question: { mode: 'text', options: [], allowOther: false },
  allowChange: false, status: 'published', publishedAt: '2026-01-01T08:00:00.000Z', createdAt: '2026-01-01T08:00:00.000Z',
};
const students = { list: vi.fn().mockResolvedValue({ items: [
  { id: 's1', name: 'Mari', active: true, subject: 'Eesti keel', level: 'B1' },
  { id: 's2', name: 'Jüri', active: true, subject: 'Eesti keel', level: 'A2' },
] }) };
const renderPage = (service) => render(
  <AuthContext.Provider value={{ user: admin }}><MemoryRouter><AnnouncementsAdminPage service={service} studentRepository={students} /></MemoryRouter></AuthContext.Provider>,
);

describe('„Teated” for the administrator', () => {
  it('writes a question and publishes it', async () => {
    const service = { list: vi.fn().mockResolvedValue([]), save: vi.fn().mockResolvedValue('new'), setStatus: vi.fn(), report: vi.fn() };
    renderPage(service);
    fireEvent.click(await screen.findByRole('button', { name: /Uus teade/ }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Avalda' }));
    expect(within(dialog).getByText('Pealkiri on puudu.')).toBeInTheDocument();
    expect(service.save).not.toHaveBeenCalled();

    fireEvent.change(within(dialog).getByLabelText('Pealkiri'), { target: { value: 'Talvelaager' } });
    fireEvent.change(within(dialog).getByLabelText('Tekst'), { target: { value: 'Kas tuled?\nВы придёте?' } });
    fireEvent.change(within(dialog).getByLabelText('Saajad'), { target: { value: 'students' } });
    fireEvent.click(within(dialog).getByLabelText('B1'));
    expect(within(dialog).getByText(/Sobib 1 õpilase kaardile/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByLabelText(/Küsimus/));
    fireEvent.change(within(dialog).getByLabelText('Variant 1'), { target: { value: 'Jah' } });
    fireEvent.change(within(dialog).getByLabelText('Variant 2'), { target: { value: 'Ei' } });
    fireEvent.click(within(dialog).getByLabelText(/Muu/));
    fireEvent.click(within(dialog).getByLabelText(/Luba vastust hiljem muuta/));
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Avalda' })); });

    const [current, form, user, status] = service.save.mock.calls[0];
    expect(current).toBeNull();
    expect(user).toBe(admin);
    expect(status).toBe('published');
    expect(form).toMatchObject({ title: 'Talvelaager', audience: 'students', levels: ['B1'], responseType: 'question', allowChange: true, question: { mode: 'single', options: ['Jah', 'Ei'], allowOther: true } });
    expect(service.list).toHaveBeenCalledTimes(2);
  });

  it('shows who answered and who not, and archives', async () => {
    const service = {
      list: vi.fn().mockResolvedValue([published]),
      save: vi.fn(),
      setStatus: vi.fn().mockResolvedValue(),
      report: vi.fn().mockResolvedValue({ total: 2, answered: 1, rows: [
        { key: 'c_s2', kind: 'parent', names: ['Isa'], studentName: 'Jüri', answered: false, slots: [], preferred: [] },
        { key: 'c_s1', kind: 'parent', names: ['Ema'], studentName: 'Mari', answered: true, answeredAt: '2026-01-02T08:00:00.000Z', answeredByName: 'Ema', slots: ['Tue-18:00', 'Tue-18:30'], preferred: [] },
      ] }),
    };
    renderPage(service);
    expect(await screen.findByText('Sobivad ajad jaanuarist')).toBeInTheDocument();
    expect(screen.getByText(/Lapsevanemad · B1/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Vastused/ }));
    expect(await screen.findByText('Vastanud 1 / 2')).toBeInTheDocument();
    expect(screen.getByText('T 18–19')).toBeInTheDocument();
    expect(screen.getByText('Ootab')).toBeInTheDocument();
    expect(service.report).toHaveBeenCalledWith('n1');
    fireEvent.click(screen.getByRole('button', { name: 'Sulge' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Arhiveeri/ })); });
    expect(service.setStatus).toHaveBeenCalledWith(published, 'archived', admin);
  });
});

describe('„Teated” on the learner home', () => {
  const past = (allowChange) => ({ pending: [], past: [{
    announcement: { id: 'q1', title: 'Laager', body: 'Kas tuled?', responseType: 'question', question: { mode: 'single', options: ['Jah', 'Ei'], allowOther: false }, allowChange, activeFrom: '2026-10-01' },
    target: { key: 'u_stu1', kind: 'student', studentId: 's1', studentName: 'Mari' },
    response: { answer: { choices: ['Jah'], other: '' }, answeredAt: '2026-10-02T10:00:00.000Z' },
  }] });

  it('lists answered announcements to read again; the answer is final unless allowed', async () => {
    const service = { mine: vi.fn().mockResolvedValue(past(false)), respond: vi.fn() };
    render(<LearnerAnnouncementsCard user={{ uid: 'stu1' }} service={service} />);
    fireEvent.click(await screen.findByRole('button', { name: /Laager/ }));
    expect(screen.getByText('Kas tuled?')).toBeInTheDocument();
    expect(screen.getByText('Jah')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Muuda vastust/ })).toBeNull();
  });

  it('changes the answer when the administrator allowed it', async () => {
    const service = { mine: vi.fn().mockResolvedValue(past(true)), respond: vi.fn().mockResolvedValue({ ok: true }) };
    render(<LearnerAnnouncementsCard user={{ uid: 'stu1' }} service={service} />);
    fireEvent.click(await screen.findByRole('button', { name: /Laager/ }));
    fireEvent.click(screen.getByRole('button', { name: /Muuda vastust/ }));
    fireEvent.click(screen.getByLabelText('Ei'));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Saada vastus/ })); });
    expect(service.respond).toHaveBeenCalledWith({ announcementId: 'q1', targetKey: 'u_stu1', answer: { choices: ['Ei'], other: '' } });
    expect(service.mine).toHaveBeenCalledTimes(2);
  });

  it('stays hidden when there is nothing or the server is not reachable', async () => {
    const service = { mine: vi.fn().mockRejectedValue(new Error('404')) };
    const { container } = render(<LearnerAnnouncementsCard user={{ uid: 'stu1' }} service={service} />);
    await act(async () => {});
    expect(container).toBeEmptyDOMElement();
  });
});
