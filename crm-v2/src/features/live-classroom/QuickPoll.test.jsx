import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import { QuickPollCard, QuickPollPanel } from './QuickPoll.jsx';
import { useQuickPoll } from './useQuickPoll.js';
import { normalizeAnswer, normalizePoll } from './quickPoll.js';

// an in-memory livePolls store shared by the teacher's and the students' screens (like Firestore)
function fakePolls() {
  const state = { poll: null, key: null, answers: {} };
  const listeners = { poll: new Set(), answers: new Set(), key: new Set(), mine: new Map() };
  const emit = () => {
    listeners.poll.forEach((fn) => fn(normalizePoll(state.poll)));
    listeners.key.forEach((fn) => fn(state.key));
    listeners.answers.forEach((fn) => fn(Object.entries(state.answers).map(([uid, data]) => normalizeAnswer(uid, data))));
    listeners.mine.forEach((fns, uid) => fns.forEach((fn) => fn(state.answers[uid] ? normalizeAnswer(uid, state.answers[uid]) : null)));
  };
  const sub = (set, fn, value) => { set.add(fn); fn(value); return () => set.delete(fn); };
  return {
    state,
    subscribe: (kind, roomId, fn) => sub(listeners.poll, fn, normalizePoll(state.poll)),
    subscribeKey: (kind, roomId, fn) => sub(listeners.key, fn, state.key),
    subscribeAnswers: (kind, roomId, fn) => sub(listeners.answers, fn, []),
    subscribeMyAnswer: (kind, roomId, uid, fn) => {
      if (!listeners.mine.has(uid)) listeners.mine.set(uid, new Set());
      return sub(listeners.mine.get(uid), fn, null);
    },
    start: vi.fn(async ({ participantUids, draft, round, user }) => {
      state.poll = { kind: 'group', roomId: 'room-1', teacherUid: user.uid, participantUids, round, ...draft, correctIndex: -1, status: 'open' };
      state.key = { round, correctIndex: draft.correctIndex };
      emit();
    }),
    reveal: vi.fn(async (kind, roomId, correctIndex) => { state.poll = { ...state.poll, status: 'revealed', correctIndex }; emit(); }),
    close: vi.fn(async () => { state.poll = { ...state.poll, status: 'closed' }; emit(); }),
    answer: vi.fn(async ({ round, choice, user }) => {
      if (state.poll.status !== 'open') throw new Error('permission-denied');
      state.answers[user.uid] = { uid: user.uid, name: user.displayName, round, choice, answeredAt: Date.now() };
      emit();
    }),
  };
}

const members = [{ studentUid: 'u1', studentId: 's1', studentName: 'Mari' }, { studentUid: 'u2', studentId: 's2', studentName: 'Jaan' }];
function Teacher({ service, notes, timer = null }) {
  const quick = useQuickPoll({ kind: 'group', roomId: 'room-1', user: { uid: 't1', displayName: 'Õpetaja' }, teacher: true, participantUids: ['u1', 'u2'], service, notes, timer,
    studentIdOf: (uid) => members.find((member) => member.studentUid === uid)?.studentId || '' });
  return <div role="region" aria-label="Õpetaja"><QuickPollPanel quick={quick} timer={timer} names={{ u1: 'Mari', u2: 'Jaan' }} pickText={() => 'Ma elan ... (Tallinn).'} /></div>;
}
function Student({ service, uid, name }) {
  const quick = useQuickPoll({ kind: 'group', roomId: 'room-1', user: { uid, displayName: name }, service });
  return <div role="region" aria-label={name}><QuickPollCard quick={quick} timer={null} /></div>;
}

it('the teacher asks „Vali õige vorm”, students answer, the teacher sees who answered what, reveals and saves a mistake', async () => {
  const service = fakePolls();
  const notes = { add: vi.fn(async () => 'n1') };
  const timer = { active: false, countdown: null, actions: { start: vi.fn(), stop: vi.fn() } };
  render(<><Teacher service={service} notes={notes} timer={timer} /><Student service={service} uid="u1" name="Mari" /><Student service={service} uid="u2" name="Jaan" /></>);
  const teacher = screen.getByRole('region', { name: 'Õpetaja' });
  // nobody sees a card before a question
  expect(screen.queryByRole('dialog', { name: 'Kiirküsimus' })).toBeNull();

  fireEvent.click(within(teacher).getByRole('radio', { name: 'Vali õige vorm' }));
  fireEvent.click(within(teacher).getByRole('button', { name: 'Võta tahvlilt valitud tekst' }));
  expect(within(teacher).getByLabelText('Lause lüngaga')).toHaveValue('Ma elan ... (Tallinn).');
  fireEvent.change(within(teacher).getByLabelText('Variant 1'), { target: { value: 'Tallinnasse' } });
  fireEvent.change(within(teacher).getByLabelText('Variant 2'), { target: { value: 'Tallinnas' } });
  fireEvent.click(within(teacher).getByRole('radio', { name: 'Variant 2 on õige' }));
  fireEvent.change(within(teacher).getByLabelText('Aeg'), { target: { value: '30' } });
  await act(async () => { fireEvent.click(within(teacher).getByRole('button', { name: 'Küsi õpilastelt' })); });
  expect(service.start).toHaveBeenCalledWith(expect.objectContaining({ participantUids: ['u1', 'u2'], round: 1, draft: expect.objectContaining({ mode: 'gap', sentence: 'Ma elan ___ (Tallinn).', options: ['Tallinnasse', 'Tallinnas'], correctIndex: 1, timeLimitSec: 30 }) }));
  // the time limit runs on the room's countdown
  expect(timer.actions.start).toHaveBeenCalledWith(30000, 'Kiirküsimus');
  // the students do not get the key with the question
  expect(service.state.poll.correctIndex).toBe(-1);

  const mari = within(screen.getByRole('region', { name: 'Mari' }));
  const jaan = within(screen.getByRole('region', { name: 'Jaan' }));
  expect(mari.getByRole('dialog', { name: 'Kiirküsimus' })).toBeInTheDocument();
  await act(async () => { fireEvent.click(mari.getByRole('button', { name: 'Tallinnas' })); });
  expect(mari.getByText(/Vastus on saadetud/)).toBeInTheDocument();
  expect(within(teacher).getByRole('status')).toHaveTextContent('Vastanud 1/2 · ootan: Jaan');
  await act(async () => { fireEvent.click(jaan.getByRole('button', { name: 'Tallinnasse' })); });
  expect(within(teacher).getByText('Vastanud 2/2')).toBeInTheDocument();
  // the teacher already knows who was wrong (his key) and saves it into the student's „Minu vead”
  await act(async () => { fireEvent.click(within(teacher).getByRole('button', { name: 'Lisa „Minu vead” alla' })); });
  expect(notes.add).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's2', kind: 'board', byStaff: true, pageTitle: 'Kiirküsimus', text: 'Kiirküsimus: Ma elan ___ (Tallinn).\nÕige: Ma elan Tallinnas (Tallinn).\nSinu vastus: Tallinnasse' }));
  expect(within(teacher).getByText('„Minu vead” all ✓')).toBeInTheDocument();

  await act(async () => { fireEvent.click(within(teacher).getByRole('button', { name: 'Näita vastust' })); });
  expect(service.reveal).toHaveBeenCalledWith('group', 'room-1', 1);
  expect(mari.getByText('Õige! Tubli!')).toBeInTheDocument();
  expect(mari.getByRole('dialog', { name: 'Kiirküsimus' }).className).toContain('is-right');
  expect(jaan.getByText('Seekord mitte. Õige: Tallinnas')).toBeInTheDocument();
  expect(jaan.getByRole('button', { name: 'Tallinnasse' })).toBeDisabled();

  await act(async () => { fireEvent.click(within(teacher).getByRole('button', { name: 'Lõpeta' })); });
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Kiirküsimus' })).toBeNull());
  expect(within(teacher).getByRole('button', { name: 'Küsi õpilastelt' })).toBeInTheDocument();
});

it('the form says what is missing and the student can close the card until the next question', async () => {
  const service = fakePolls();
  render(<><Teacher service={service} notes={{ add: vi.fn() }} /><Student service={service} uid="u1" name="Mari" /></>);
  const teacher = screen.getByRole('region', { name: 'Õpetaja' });
  await act(async () => { fireEvent.click(within(teacher).getByRole('button', { name: 'Küsi õpilastelt' })); });
  expect(within(teacher).getByRole('alert')).toHaveTextContent('Kirjuta küsimus.');
  expect(service.start).not.toHaveBeenCalled();
  fireEvent.change(within(teacher).getByLabelText('Küsimus'), { target: { value: 'Kas „maja” on nimisõna?' } });
  fireEvent.change(within(teacher).getByLabelText('Variant 1'), { target: { value: 'jah' } });
  fireEvent.change(within(teacher).getByLabelText('Variant 2'), { target: { value: 'ei' } });
  await act(async () => { fireEvent.click(within(teacher).getByRole('button', { name: 'Küsi õpilastelt' })); });
  const mari = within(screen.getByRole('region', { name: 'Mari' }));
  fireEvent.click(mari.getByRole('button', { name: 'Sulge kiirküsimus' }));
  expect(mari.queryByRole('dialog')).toBeNull();
  // a new question brings the card back
  await act(async () => { fireEvent.click(within(teacher).getByRole('button', { name: 'Uus küsimus' })); });
  fireEvent.change(within(teacher).getByLabelText('Küsimus'), { target: { value: 'Kas „ilus” on omadussõna?' } });
  fireEvent.change(within(teacher).getByLabelText('Variant 1'), { target: { value: 'jah' } });
  fireEvent.change(within(teacher).getByLabelText('Variant 2'), { target: { value: 'ei' } });
  await act(async () => { fireEvent.click(within(teacher).getByRole('button', { name: 'Küsi õpilastelt' })); });
  expect(service.start).toHaveBeenLastCalledWith(expect.objectContaining({ round: 2 }));
  expect(mari.getByText('Kas „ilus” on omadussõna?')).toBeInTheDocument();
});
