import { assignRoom, candidateDates, roomChoices, roomConflict } from './roomModel.js';

// 2026-10-15 is a Thursday
const rooms = [{ id: 'r1', name: 'Kabinet 1' }, { id: 'r2', name: 'Kabinet 2' }, { id: 'r3', name: 'Vana', active: false }];
const booking = (extra) => ({ scheduleId: 'b1', roomId: 'r1', recurring: false, date: '2026-10-15', day: 'Thu', time: '10:00', duration: 60, status: 'Planeeritud', ...extra });

describe('rooms (Oleksiy 2026-10-15)', () => {
  it('a room is taken only when the times overlap on that date; a recurring booking every week', () => {
    expect(roomConflict([booking()], { date: '2026-10-15', time: '10:30', duration: 30 }, 'r1')).toBe('2026-10-15');
    expect(roomConflict([booking()], { date: '2026-10-15', time: '11:00', duration: 60 }, 'r1')).toBe('');
    expect(roomConflict([booking()], { date: '2026-10-15', time: '10:00', duration: 60 }, 'r2')).toBe('');
    const weekly = booking({ recurring: true, startDate: '2026-10-01', excludedDates: ['2026-10-15'] });
    expect(roomConflict([weekly], { date: '2026-10-15', time: '10:00' }, 'r1')).toBe('');
    expect(roomConflict([weekly], { date: '2026-10-22', time: '10:00' }, 'r1')).toBe('2026-10-22');
    expect(roomConflict([booking()], { date: '2026-10-15', time: '10:00' }, 'r1', 'b1')).toBe('', 'the lesson itself does not block its room');
  });

  it('a new weekly lesson needs the room on the next weeks too', () => {
    expect(candidateDates({ recurring: true, date: '2026-10-15' })).toHaveLength(12);
    const later = booking({ date: '2026-11-05' });
    expect(roomConflict([later], { recurring: true, date: '2026-10-15', time: '10:00' }, 'r1')).toBe('2026-11-05');
  });

  it('assigns the chosen free room, else the first free one; all taken → only online', () => {
    expect(roomChoices(rooms, [booking()], { date: '2026-10-15', time: '10:00' }).map((room) => [room.id, room.takenOn])).toEqual([['r1', '2026-10-15'], ['r2', '']]);
    expect(assignRoom(rooms, [booking()], { date: '2026-10-15', time: '10:00' })).toEqual({ roomId: 'r2', roomName: 'Kabinet 2' });
    expect(assignRoom(rooms, [booking()], { date: '2026-10-15', time: '10:00', roomId: 'r1' }).error).toMatch(/Kabinet 1 on 2026-10-15 kell 10:00 juba hõivatud/);
    const full = [booking(), booking({ scheduleId: 'b2', roomId: 'r2' })];
    expect(assignRoom(rooms, full, { date: '2026-10-15', time: '10:00' }).error).toMatch(/Kõik kabinetid.*veebitunniks/);
    expect(assignRoom(rooms, full, { date: '2026-10-15', time: '10:00', online: true })).toEqual({ roomId: '', roomName: '' });
    expect(assignRoom([], full, { date: '2026-10-15', time: '10:00' })).toEqual({ roomId: '', roomName: '' });
  });
});
