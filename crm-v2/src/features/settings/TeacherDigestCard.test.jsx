import { fireEvent, render, screen } from '@testing-library/react';
import TeacherDigestCard from './TeacherDigestCard.jsx';

const admin = { uid: 'admin-1', roles: ['admin'], displayName: 'Owner', email: 'owner@example.com' };

function makeService(stored = { weeklyUnmarked: false }) {
  return {
    getSettings: vi.fn().mockResolvedValue(stored),
    saveSettings: vi.fn(async (value) => value),
    sendTest: vi.fn().mockResolvedValue({ sent: true, teacherName: 'Kati Kask', total: 12 }),
    listTeachers: vi.fn().mockResolvedValue([{ id: 't1', name: 'Kati Kask' }, { id: 't2', name: 'Tiit Tamm' }]),
  };
}

describe('Seaded → Õpetajatele iganädalane märkimata tundide kiri', () => {
  it('is off by default; the admin switches it on (and off again) through the server', async () => {
    const service = makeService();
    render(<TeacherDigestCard user={admin} service={service} />);
    const toggle = await screen.findByLabelText('Õpetajatele iganädalane märkimata tundide kiri');
    expect(toggle).not.toBeChecked();
    expect(screen.getByText('väljas')).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(await screen.findByText('Nädalakiri on sees: järgmine esmaspäeval kell 08:00.')).toBeInTheDocument();
    expect(service.saveSettings).toHaveBeenCalledWith({ weeklyUnmarked: true });
    fireEvent.click(screen.getByLabelText('Õpetajatele iganädalane märkimata tundide kiri'));
    expect(await screen.findByText('Nädalakiri on välja lülitatud.')).toBeInTheDocument();
    expect(service.saveSettings).toHaveBeenLastCalledWith({ weeklyUnmarked: false });
  });

  it('sends a test copy of the chosen teacher\'s e-mail to the administrator only', async () => {
    const service = makeService();
    render(<TeacherDigestCard user={admin} service={service} />);
    await screen.findByRole('option', { name: 'Tiit Tamm' });
    fireEvent.change(screen.getByLabelText('Proovikiri: kelle kiri'), { target: { value: 't2' } });
    fireEvent.click(screen.getByRole('button', { name: /Saada mulle proovikiri/ }));
    expect(await screen.findByText(/Proovikiri \(Kati Kask: 12 märkimata\) saadeti sinu aadressile owner@example\.com/)).toBeInTheDocument();
    expect(service.sendTest).toHaveBeenCalledWith({ teacherUid: 't2' });
  });

  it('says when the chosen teacher has nothing unmarked', async () => {
    const service = { ...makeService({ weeklyUnmarked: false }), sendTest: vi.fn().mockResolvedValue({ sent: false, teacherName: 'Tiit Tamm', total: 0 }) };
    render(<TeacherDigestCard user={admin} service={service} />);
    expect(await screen.findByText('väljas')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Saada mulle proovikiri/ }));
    expect(await screen.findByText('Tiit Tamm pole märkimata tunde — kirja ei saadetud.')).toBeInTheDocument();
  });
});
