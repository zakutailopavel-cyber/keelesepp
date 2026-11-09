import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LessonEndPanel from './LessonEndPanel.jsx';

// „Lõpeta tund” tells the server whether to mark the calendar lesson held (functions/live-auto-mark.js, owner
// 2026-11-09): 'held' only when „märgi” is ticked and the student was not „Puudub”; the localStorage handoff stays.
const invitation = { id: 'inv-1', studentId: 's-1', teacherUid: 't-1' };
const services = {
  summaryService: { save: vi.fn(async () => ({})) },
  wordsService: { subscribeForStudent: vi.fn(() => () => {}) },
  homeworkService: { listForLesson: vi.fn(async () => []) },
  boardCopies: { save: vi.fn(async () => ({})) },
};
const renderPanel = (props = {}) => {
  const onEnd = vi.fn();
  const saveHandoff = vi.fn();
  render(<LessonEndPanel invitation={invitation} user={{ uid: 't-1' }} lessonKey="sched-1:2026-11-09|2026-11-09" saveHandoff={saveHandoff} onEnd={onEnd} {...services} {...props} />);
  return { onEnd, saveHandoff };
};

describe('LessonEndPanel → server auto-mark', () => {
  it('ticked (default): endMark held, and the calendar handoff is still saved as the fallback', async () => {
    const { onEnd, saveHandoff } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Lõpeta ilma kokkuvõtteta' }));
    await waitFor(() => expect(onEnd).toHaveBeenCalledWith({ endMark: 'held' }));
    expect(saveHandoff).toHaveBeenCalledWith('sched-1:2026-11-09|2026-11-09', expect.any(Object));
  });
  it('unticked: skip', async () => {
    const { onEnd } = renderPanel();
    fireEvent.click(screen.getByRole('checkbox', { name: /Märgi tund kalendris/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Lõpeta ilma kokkuvõtteta' }));
    await waitFor(() => expect(onEnd).toHaveBeenCalledWith({ endMark: 'skip' }));
  });
  it('the student was „Puudub” in the room: skip (an absence is never written by the server)', async () => {
    const { onEnd } = renderPanel({ attendance: { status: 'absent' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lõpeta ilma kokkuvõtteta' }));
    await waitFor(() => expect(onEnd).toHaveBeenCalledWith({ endMark: 'skip' }));
  });
});
