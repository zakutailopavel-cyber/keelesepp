import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BusinessReport from './BusinessReport.jsx';
import { businessReport } from './businessReport.js';

describe('BusinessReport work list', () => {
  it('an archived card is „Lahkunud”, an active card without lessons „Ilma tulevase tunnita”, no percent in a running month', () => {
    const students = [{ id: 'a', name: 'Ann', active: true }, { id: 'b', name: 'Ben', active: true }, { id: 'c', name: 'Cat', active: false }];
    const schedule = [
      { id: 'a1', studentId: 'a', recurring: true, day: 'Sun', startDate: '2026-10-01', duration: 60 },
      { id: 'b1', studentId: 'b', date: '2026-10-05', duration: 60 },
      { id: 'c1', studentId: 'c', date: '2026-10-05', duration: 60 },
    ];
    const lessons = [{ id: 'm', scheduleId: 'a1', studentId: 'a', date: '2026-11-01', status: 'Toimunud' }];
    render(<BusinessReport report={businessReport({ current: '2026-11', months: 1, today: '2026-11-01', students, schedule, lessons })} />);
    // the work list: a count, the names, what it means
    expect(screen.getByTestId('br-todo-lost')).toHaveTextContent('1LahkunudCat — kaart arhiveeritud');
    expect(screen.getByTestId('br-todo-quiet')).toHaveTextContent('1Ilma tulevase tunnitaBen');
    expect(screen.getByTestId('br-todo-new')).toHaveTextContent('0Uued õpilasedpole');
    fireEvent.click(screen.getByRole('button', { name: 'Tunnid ja arvud' }));
    expect(screen.getByText('Aktiivseid õpilasi').parentElement).toHaveTextContent('eelmisel perioodil 3');
    expect(screen.queryByText(/-100%|−100%/)).toBeNull();
  });

  it('where the money comes from: by teacher with what stays with the school, by subject; a long list opens', () => {
    const students = Array.from({ length: 10 }, (_, index) => ({ id: `s${index}`, name: `Õpilane ${index}`, active: true, subject: index ? 'Eesti keel' : 'Inglise keel' }));
    const plans = students.map((student) => ({ studentId: student.id, lessonPriceCents: 2000 }));
    const schedule = students.map((student, index) => ({ id: `e${index}`, studentId: student.id, teacher: index % 2 ? 'Rein Tamm' : 'Liis Põld', date: '2026-10-05', duration: 60 }));
    const teachers = [{ id: 't1', name: 'Rein Tamm', role: 'teacher', workHourlyRateCents: 1000 }, { id: 't2', name: 'Liis Põld', role: 'teacher' }];
    render(<BusinessReport report={businessReport({ current: '2026-10', months: 1, today: '2026-10-20', students, plans, schedule, teachers })} />);
    const sources = screen.getByRole('region', { name: 'Kust raha tuleb' });
    // 5 lessons × 20 € each; Rein is paid 5 h × 10 €
    expect(sources).toHaveTextContent('Rein Tamm50 € 50% · tulu 100 €');
    expect(sources).toHaveTextContent('Liis Põld100 € tunnitasu määramata · tulu 100 €');
    fireEvent.click(within(sources).getByRole('button', { name: 'Ained' }));
    expect(sources).toHaveTextContent('Eesti keel180 € 90% · 9 tundi');
    // nobody has a lesson ahead: eight names, the rest behind „Näita kõiki”
    const ahead = screen.getByTestId('br-todo-ahead');
    expect(ahead).toHaveTextContent('perioodis tõid 200 €');
    expect(ahead).not.toHaveTextContent('Õpilane 9');
    fireEvent.click(within(ahead).getByRole('button', { name: 'Näita kõiki (10)' }));
    expect(ahead).toHaveTextContent('Õpilane 9');
    expect(within(ahead).getByRole('link', { name: 'Õpilane 9' })).toHaveAttribute('href', '/students/s9');
    expect(screen.getByTestId('br-todo-unrated')).toHaveTextContent('Liis Põld');
  });
});
