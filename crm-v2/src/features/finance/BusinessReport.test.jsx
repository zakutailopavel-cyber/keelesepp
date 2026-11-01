import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BusinessReport from './BusinessReport.jsx';
import { businessReport } from './businessReport.js';

describe('BusinessReport people lines', () => {
  it('an archived card is „Lahkunud”, an active card without lessons „Ilma tulevase tunnita”, no percent in a running month', () => {
    const students = [{ id: 'a', name: 'Ann', active: true }, { id: 'b', name: 'Ben', active: true }, { id: 'c', name: 'Cat', active: false }];
    const schedule = [
      { id: 'a1', studentId: 'a', recurring: true, day: 'Sun', startDate: '2026-10-01', duration: 60 },
      { id: 'b1', studentId: 'b', date: '2026-10-05', duration: 60 },
      { id: 'c1', studentId: 'c', date: '2026-10-05', duration: 60 },
    ];
    const lessons = [{ id: 'm', scheduleId: 'a1', studentId: 'a', date: '2026-11-01', status: 'Toimunud' }];
    render(<BusinessReport report={businessReport({ current: '2026-11', months: 1, today: '2026-11-01', students, schedule, lessons })} />);
    expect(screen.getByText('Lahkunud (1):').parentElement).toHaveTextContent('Cat — kaart arhiveeritud');
    expect(screen.getByText('Ilma tulevase tunnita (1):').parentElement).toHaveTextContent('Ben');
    expect(screen.getByText('Aktiivseid õpilasi').parentElement).toHaveTextContent('eelmisel perioodil 3');
    expect(screen.queryByText(/-100%|−100%/)).toBeNull();
  });
});
