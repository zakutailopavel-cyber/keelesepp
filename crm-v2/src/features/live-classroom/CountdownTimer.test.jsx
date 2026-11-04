import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { CountdownBadge, CountdownControls } from './CountdownTimer.jsx';
import { useCountdown } from './useCountdown.js';

// a fake room doc: `set` echoes the write with the "server" time, like Firestore does after the commit
function fakeService({ serverAhead = 0, initial = null } = {}) {
  let listener = () => {};
  const service = {
    writes: [],
    subscribe: vi.fn((kind, id, onChange) => { listener = onChange; onChange(initial, { pending: false, receivedAt: Date.now() }); return () => {}; }),
    set: vi.fn(async (kind, id, value) => {
      service.writes.push(value);
      listener(value ? { ...value, updatedAt: Date.now() + serverAhead } : null, { pending: false, receivedAt: Date.now() });
    }),
    push: (raw, meta = {}) => listener(raw, { pending: false, receivedAt: Date.now(), ...meta }),
  };
  return service;
}

function Room({ service, teacher = true, chime }) {
  const timer = useCountdown({ kind: 'lesson', id: 'inv1', user: { uid: 't1' }, teacher, service });
  return <><CountdownBadge timer={timer} chime={chime} />{teacher ? <CountdownControls timer={timer} /> : null}</>;
}

beforeEach(() => { vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'setTimeout', 'clearTimeout', 'Date'] }); vi.setSystemTime(Date.parse('2026-11-04T16:00:00.000Z')); });
afterEach(() => { vi.useRealTimers(); globalThis.localStorage?.clear?.(); });

it('the teacher starts a preset; everyone sees the badge count down, the last 10 s highlighted, then „Aeg läbi!” with one chime', async () => {
  const service = fakeService();
  const chime = vi.fn();
  render(<Room service={service} chime={chime} />);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: '1 min' })); });
  expect(service.writes[0]).toMatchObject({ running: true, remainingMs: 60000, durationMs: 60000, by: 't1' });
  expect(screen.getByRole('timer')).toHaveTextContent('1:00');
  act(() => { vi.advanceTimersByTime(51000); });
  expect(screen.getByRole('timer')).toHaveTextContent('0:09');
  expect(screen.getByRole('timer').className).toContain('is-warn');
  act(() => { vi.advanceTimersByTime(10000); });
  expect(screen.getByRole('timer')).toHaveTextContent('Aeg läbi!');
  expect(chime).toHaveBeenCalledTimes(1);
  act(() => { vi.advanceTimersByTime(5000); });
  expect(chime).toHaveBeenCalledTimes(1);
});

it('pause, resume, +1 min and stop are one write each', async () => {
  const service = fakeService();
  render(<Room service={service} chime={() => {}} />);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: '5 min' })); });
  act(() => { vi.advanceTimersByTime(20000); });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Paus/ })); });
  expect(service.writes[1]).toMatchObject({ running: false, remainingMs: 280000 });
  act(() => { vi.advanceTimersByTime(60000); });
  expect(screen.getByRole('timer')).toHaveTextContent('4:40');
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Jätka/ })); });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Lisa 1 minut' })); });
  expect(service.writes[3]).toMatchObject({ running: true, remainingMs: 340000 });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Lõpeta/ })); });
  expect(service.writes[4]).toBeNull();
  expect(screen.queryByRole('timer')).toBeNull();
});

it('the student derives the time with his clock offset estimated from a live write', async () => {
  const service = fakeService();
  render(<Room service={service} teacher={false} chime={() => {}} />);
  // the server is 30 s ahead of this computer: a write that arrives live gives the offset
  await act(async () => { service.push({ running: true, remainingMs: 120000, durationMs: 120000, by: 't1', updatedAt: Date.now() + 30000 }); });
  expect(screen.getByRole('timer')).toHaveTextContent('2:00');
  act(() => { vi.advanceTimersByTime(30000); });
  expect(screen.getByRole('timer')).toHaveTextContent('1:30');
});

it('a timer that ended before the room was opened stays quiet; the mute toggle is remembered', async () => {
  // the first snapshot is old (opened late): it is no clock sample
  const service = fakeService({ initial: { running: true, remainingMs: 1000, durationMs: 60000, by: 't1', updatedAt: Date.now() - 600000 } });
  const chime = vi.fn();
  render(<Room service={service} teacher={false} chime={chime} />);
  expect(screen.getByRole('timer')).toHaveTextContent('Aeg läbi!');
  expect(chime).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Lülita taimeri heli välja' }));
  expect(globalThis.localStorage.getItem('keelesepp.countdownMuted')).toBe('1');
  await act(async () => { service.push({ running: true, remainingMs: 2000, durationMs: 2000, by: 't1', updatedAt: Date.now() }); });
  act(() => { vi.advanceTimersByTime(3000); });
  expect(screen.getByRole('timer')).toHaveTextContent('Aeg läbi!');
  expect(chime).not.toHaveBeenCalled();
});
