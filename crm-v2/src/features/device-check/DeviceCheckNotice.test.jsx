import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import DeviceCheckNotice from './DeviceCheckNotice.jsx';

const teacher = { uid: 't1', roles: ['teacher'] };
function show(result, { user = teacher, ...props } = {}) {
  const service = { forStudent: vi.fn(async () => result) };
  const view = render(<DeviceCheckNotice studentId="s1" viewer={user} service={service} {...props} />);
  return { service, view };
}

describe('DeviceCheckNotice', () => {
  it('shows a failed check with the issues in Estonian and the link to send', async () => {
    const { service } = show({ deviceCheck: { at: '2026-11-03T18:00:00Z', status: 'fail', issues: ['mic-denied', 'in-app'], browser: 'Safari 17 iPad' }, hadLiveLesson: true });
    expect(await screen.findByText('Õpilase seadmes on viga')).toBeInTheDocument();
    expect(screen.getByText('mikrofon on keelatud')).toBeInTheDocument();
    expect(screen.getByText(/rakenduse sees/)).toBeInTheDocument();
    expect(screen.getByText(/Safari 17 iPad/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /\/kontroll$/ })).toHaveAttribute('href', '/kontroll');
    expect(service.forStudent).toHaveBeenCalledWith({ studentId: 's1', studentUid: '', teacherUid: 't1', admin: false });
  });

  it('says the student never checked before his first live lesson, and nothing after one', async () => {
    show({ deviceCheck: null, hadLiveLesson: false });
    expect(await screen.findByText('Õpilane pole seadet kontrollinud')).toBeInTheDocument();
    const { service, view } = show({ deviceCheck: null, hadLiveLesson: true });
    await waitFor(() => expect(service.forStudent).toHaveBeenCalled());
    expect(view.container).toBeEmptyDOMElement();
  });

  it('shows nothing when the check was fine or the read failed', async () => {
    const ok = show({ deviceCheck: { at: 'x', status: 'ok', issues: [], browser: 'Chrome' }, hadLiveLesson: false });
    await waitFor(() => expect(ok.service.forStudent).toHaveBeenCalled());
    expect(ok.view.container).toBeEmptyDOMElement();
    const service = { forStudent: vi.fn(async () => { throw new Error('permission-denied'); }) };
    const failed = render(<DeviceCheckNotice studentId="s1" service={service} />);
    await waitFor(() => expect(service.forStudent).toHaveBeenCalled());
    expect(failed.container).toBeEmptyDOMElement();
  });

  it('can be hidden in the room', async () => {
    const onClose = vi.fn();
    show({ deviceCheck: { at: 'x', status: 'warn', issues: ['slow'], browser: 'Chrome' } }, { onClose, studentUid: 'u1' });
    fireEvent.click(await screen.findByRole('button', { name: 'Peida seadme hoiatus' }));
    expect(onClose).toHaveBeenCalled();
  });
});
