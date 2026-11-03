import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LessonPlanPanel, { LessonPlanPill } from './LessonPlanPanel.jsx';
import LessonEndPanel from './LessonEndPanel.jsx';
import { useLessonPlan } from './useLessonPlan.js';
import { defaultPlanSteps } from './lessonPlan.js';

function fakeService(initial = null) {
  let listener = () => {};
  const service = {
    saved: [],
    subscribe: vi.fn((roomKey, onChange) => { listener = onChange; globalThis.queueMicrotask(() => onChange(initial)); return () => {}; }),
    save: vi.fn(async (roomKey, plan) => { service.saved.push(plan); listener({ ...plan }); }),
  };
  return service;
}

function Harness({ service, participants, startMs = 0 }) {
  const planState = useLessonPlan({ roomKey: 'inv-1', user: { uid: 't1' }, defaultSteps: defaultPlanSteps({ minutes: 45 }), service });
  return <><LessonPlanPill clock={planState.clock} onClick={() => {}} /><LessonPlanPanel planState={planState} participants={participants} startMs={startMs} /></>;
}

describe('LessonPlanPanel: the teacher’s plan and attendance in the room', () => {
  it('shows the default plan without writing; „Alusta” and „Järgmine samm” save the timestamps only', async () => {
    const service = fakeService();
    render(<Harness service={service} participants={[]} />);
    expect(await screen.findByText(/Plaan 45 min/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tunniplaan' })).toBeInTheDocument();
    expect(service.save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Alusta' }));
    await waitFor(() => expect(service.save).toHaveBeenCalledTimes(1));
    expect(service.saved[0]).toMatchObject({ current: 0, startedAt: expect.any(String), stepStartedAt: expect.any(String), kind: 'lesson' });
    expect(await screen.findByRole('button', { name: /Tunniplaan: samm 1\/5 Soojendus/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Järgmine samm' }));
    await waitFor(() => expect(service.save).toHaveBeenCalledTimes(2));
    expect(service.saved[1].current).toBe(1);
    expect(await screen.findByRole('button', { name: /samm 2\/5 Avasta/ })).toBeInTheDocument();
  });

  it('a running plan from the doc (after a reload) shows the step over time', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    try {
      const now = Date.now();
      const stored = { steps: [{ id: 'a', label: 'Soojendus', minutes: 5, spentMs: 0 }, { id: 'b', label: 'Kokkuvõte', minutes: 5, spentMs: 0 }], current: 0, startedAt: new Date(now - 7 * 60_000).toISOString(), stepStartedAt: new Date(now - 7 * 60_000).toISOString(), attendance: {} };
      render(<Harness service={fakeService(stored)} participants={[]} />);
      await act(async () => { await Promise.resolve(); });
      expect(screen.getByRole('button', { name: /samm 1\/2 Soojendus, aeg on läbi/ })).toHaveClass('is-over');
      expect(screen.getByText(/7:00 \/ 5 min · aeg läbi/)).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('prefills attendance and saves the teacher’s mark', async () => {
    const service = fakeService();
    const startMs = Date.parse('2026-11-04T14:00:00.000Z');
    render(<Harness service={service} startMs={startMs} participants={[
      { studentId: 's1', name: 'Mari', joinedAt: '2026-11-04T14:12:00.000Z' },
      { studentId: 's2', name: 'Jaan', joinedAt: null, online: false },
    ]} />);
    expect(await screen.findByText(/Soovitus: Hilines 12 min/)).toBeInTheDocument();
    expect(screen.getByText('Soovitus: Puudub')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('group', { name: 'Kohalolu: Mari' }).querySelectorAll('button')[0]);
    await waitFor(() => expect(service.save).toHaveBeenCalled());
    expect(service.saved[0].attendance).toEqual({ s1: { name: 'Mari', status: 'present', lateMinutes: 0, joinedAt: '2026-11-04T14:12:00.000Z' } });
    expect(service.saved[0].startedAt).toBe('');
  });

  it('„Lõpeta tund” hands a Puudub mark to the calendar as „Puudus (ei teatanud)”', async () => {
    const saveHandoff = vi.fn();
    const onEnd = vi.fn();
    render(<LessonEndPanel invitation={{ id: 'inv-1', studentId: 's1' }} user={{ uid: 't1' }} lessonKey="sched-1:2026-11-04|2026-11-04" saveHandoff={saveHandoff} onEnd={onEnd}
      attendance={{ studentId: 's1', name: 'Mari', status: 'absent', lateMinutes: 0, auto: false }}
      summaryService={{ save: vi.fn() }} wordsService={{ subscribeForStudent: () => () => {} }} homeworkService={{ listForLesson: async () => [] }} />);
    expect(screen.getByText('Puudub')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Märgi tund kalendris: Puudus \(ei teatanud\)/ })).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Lõpeta ilma kokkuvõtteta' }));
    expect(saveHandoff).toHaveBeenCalledWith('sched-1:2026-11-04|2026-11-04', { notes: '', lessonIds: [], status: 'Puudus_eta' });
    expect(onEnd).toHaveBeenCalled();
  });
});
