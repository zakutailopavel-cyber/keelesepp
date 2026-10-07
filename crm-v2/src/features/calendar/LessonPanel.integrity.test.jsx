import { render, screen } from '@testing-library/react';
import LessonPanel from './LessonPanel.jsx';
it('shows an actionable journal link for a missing accounting record without allowing a second charge', () => {
 render(<LessonPanel item={{ id: 's', studentId: 'p', studentName: 'Maria', status: 'Toimunud', recordProblem: 'missing', occurrenceDate: '2026-10-05', time: '15:00' }} />);
 expect(screen.getByRole('alert')).toHaveTextContent('päevikukannet ei leitud');
 expect(screen.getByRole('link', { name: 'Ava õpilase päevik' })).toHaveAttribute('href', '/students/p');
 expect(screen.queryByText('Tund toimus')).not.toBeInTheDocument();
});
