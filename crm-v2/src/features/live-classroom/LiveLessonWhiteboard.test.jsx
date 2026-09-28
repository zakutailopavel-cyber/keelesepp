import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LiveLessonWhiteboard from './LiveLessonWhiteboard.jsx';

const invitation = {
  id: 'invite-1',
  studentId: 'student-1',
  studentName: 'Mari',
  teacherName: 'Pavel',
  title: 'Eesti keel',
  status: 'accepted',
};

function makeService(elements = []) {
  return {
    subscribe: vi.fn((id, onChange) => { onChange(elements); return vi.fn(); }),
    addStroke: vi.fn().mockResolvedValue('stroke-new'),
    removeElement: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  };
}

describe('LiveLessonWhiteboard', () => {
  it('saves a freehand stroke into the invitation-scoped board', async () => {
    const service = makeService();
    render(<LiveLessonWhiteboard invitation={invitation} role="teacher" user={{ uid: 'teacher-1', displayName: 'Pavel' }} service={service} />);
    expect(screen.getByText('Sünkroonitud')).toBeInTheDocument();

    const board = screen.getByRole('img', { name: 'Ühine tahvel' });
    fireEvent.pointerDown(board, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(board, { clientX: 180, clientY: 160, pointerId: 1 });
    fireEvent.pointerUp(board, { clientX: 180, clientY: 160, pointerId: 1 });

    await waitFor(() => expect(service.addStroke).toHaveBeenCalledWith(
      'invite-1',
      expect.objectContaining({ color: '#1C2B3A', strokeWidth: 4, points: expect.any(Array) }),
      expect.objectContaining({ uid: 'teacher-1' }),
    ));
    expect(service.addStroke.mock.calls[0][1].points.length).toBeGreaterThanOrEqual(2);
  });

  it('renders a remote stroke in real time', () => {
    const service = makeService([{ id: 'remote-1', type: 'stroke', points: [{ x: 10, y: 20 }, { x: 40, y: 60 }], color: '#2563EB', strokeWidth: 4, updatedByUid: 'teacher-1' }]);
    render(<LiveLessonWhiteboard invitation={invitation} role="student" user={{ uid: 'student-user-1', displayName: 'Mari' }} service={service} />);
    expect(screen.getByTestId('whiteboard-stroke-remote-1')).toHaveAttribute('stroke', '#2563EB');
    expect(screen.queryByRole('button', { name: /Tühjenda tahvel/i })).not.toBeInTheDocument();
  });

  it('student eraser removes only the student own stroke', async () => {
    const service = makeService([
      { id: 'teacher-stroke', type: 'stroke', points: [{ x: 10, y: 20 }, { x: 40, y: 60 }], color: '#1C2B3A', strokeWidth: 4, updatedByUid: 'teacher-1' },
      { id: 'student-stroke', type: 'stroke', points: [{ x: 20, y: 30 }, { x: 50, y: 70 }], color: '#2563EB', strokeWidth: 4, updatedByUid: 'student-user-1' },
    ]);
    render(<LiveLessonWhiteboard invitation={invitation} role="student" user={{ uid: 'student-user-1', displayName: 'Mari' }} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: /Kustutaja/i }));

    fireEvent.pointerDown(screen.getByTestId('whiteboard-stroke-teacher-stroke'), { pointerId: 2 });
    expect(service.removeElement).not.toHaveBeenCalled();

    fireEvent.pointerDown(screen.getByTestId('whiteboard-stroke-student-stroke'), { pointerId: 3 });
    await waitFor(() => expect(service.removeElement).toHaveBeenCalledWith('invite-1', 'student-stroke'));
  });

  it('teacher can clear the current shared board', async () => {
    const service = makeService([{ id: 'stroke-1', type: 'stroke', points: [{ x: 10, y: 20 }, { x: 40, y: 60 }], color: '#1C2B3A', strokeWidth: 4, updatedByUid: 'student-user-1' }]);
    render(<LiveLessonWhiteboard invitation={invitation} role="teacher" user={{ uid: 'teacher-1', displayName: 'Pavel' }} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: /Tühjenda tahvel/i }));
    await waitFor(() => expect(service.clear).toHaveBeenCalledWith('invite-1'));
  });
});
