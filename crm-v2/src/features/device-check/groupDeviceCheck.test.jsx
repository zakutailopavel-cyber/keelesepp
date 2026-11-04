import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { groupDeviceWarnings } from './deviceCheckModel.js';
import GroupDeviceCheckNotice from './GroupDeviceCheckNotice.jsx';
import LessonPanel from '../calendar/LessonPanel.jsx';

afterEach(cleanup);

const fail = { hasAccount: true, hadLiveLesson: true, deviceCheck: { at: '2026-11-03T18:00:00Z', status: 'fail', issues: ['camera-busy'], browser: 'Chrome 130' } };
const warn = { hasAccount: true, hadLiveLesson: false, deviceCheck: { at: '2026-11-02T18:00:00Z', status: 'warn', issues: [], browser: 'Safari 17' } };
const ok = { hasAccount: true, hadLiveLesson: true, deviceCheck: { at: '2026-11-02T18:00:00Z', status: 'ok', issues: [], browser: 'Chrome 130' } };
const none = { hasAccount: true, hadLiveLesson: true, deviceCheck: null };

describe('groupDeviceWarnings', () => {
  it('lists fail, warn and missing checks, worst first; fine and unreadable members are left out', () => {
    const summary = groupDeviceWarnings([
      { id: 'a', name: 'Olga', result: none },
      { id: 'b', name: 'Mari', result: ok },
      { id: 'c', name: 'Jaan', result: warn },
      { id: 'd', name: 'Kati', result: fail },
      { id: 'e', name: 'Peeter', result: null },
    ]);
    expect(summary.level).toBe('fail');
    expect(summary.rows.map((row) => [row.name, row.warning.level])).toEqual([['Kati', 'fail'], ['Jaan', 'warn'], ['Olga', 'none']]);
    expect(summary.title).toBe('2 õpilase seadmes on vigu või märkusi · 1 õpilane pole seadet kontrollinud');
    // in a group a missing check is listed even after earlier live lessons
    expect(summary.rows[2].hadLiveLesson).toBe(true);
  });

  it('null when every device is fine; a title for one warning or several unchecked', () => {
    expect(groupDeviceWarnings([{ id: 'b', name: 'Mari', result: ok }])).toBeNull();
    expect(groupDeviceWarnings([])).toBeNull();
    expect(groupDeviceWarnings([{ id: 'c', name: 'Jaan', result: warn }]).title).toBe('1 õpilase seadmes on märkusi');
    expect(groupDeviceWarnings([{ id: 'a', name: 'A', result: none }, { id: 'b', name: 'B', result: none }])).toMatchObject({ level: 'none', title: '2 õpilast pole seadet kontrollinud' });
  });
});

describe('GroupDeviceCheckNotice', () => {
  it('reads every member once and lists the problems with the /kontroll link', async () => {
    const service = { forStudent: vi.fn(async ({ studentId }) => ({ s1: fail, s2: ok, s3: none }[studentId])) };
    render(<GroupDeviceCheckNotice viewer={{ uid: 't1', roles: ['teacher'] }} service={service}
      students={[{ studentId: 's1', studentUid: 'u1', name: 'Kati' }, { studentId: 's2', name: 'Mari' }, { studentId: 's3', name: 'Olga' }]} />);
    const box = await screen.findByRole('status', { name: 'Õpilaste seadme kontroll' });
    expect(service.forStudent).toHaveBeenCalledTimes(3);
    expect(service.forStudent).toHaveBeenCalledWith({ studentId: 's1', studentUid: 'u1', teacherUid: 't1', admin: false });
    expect(box.textContent).toMatch(/Kati — viga: .+3\.11\.2026, Chrome 130/);
    expect(box.textContent).not.toContain('Mari');
    expect(box.textContent).toContain('Olga — pole seadet kontrollinud (videotunnis on varem olnud)');
    expect(box.querySelector('a').getAttribute('href')).toBe('/kontroll');
    expect(box.className).toContain('dcn--fail');
  });

  it('nothing when all is fine or the reads fail', async () => {
    const service = { forStudent: vi.fn(async ({ studentId }) => { if (studentId === 's2') throw new Error('denied'); return ok; }) };
    const { container } = render(<GroupDeviceCheckNotice viewer={{ uid: 't1' }} service={service} students={[{ studentId: 's1', name: 'A' }, { studentId: 's2', name: 'B' }]} />);
    await waitFor(() => expect(service.forStudent).toHaveBeenCalledTimes(2));
    expect(container.innerHTML).toBe('');
  });
});

describe('LessonPanel: calendar group lesson', () => {
  it('shows the members’ device warning before the group lesson, not after it', async () => {
    const deviceCheck = { forStudent: vi.fn(async () => fail) };
    const item = { id: 'group:g:1', isGroup: true, studentIds: ['s1', 's2'], studentName: 'Õhtune grupp', status: 'Planeeritud', occurrenceDate: '2026-11-05', time: '18:00' };
    const members = [{ id: 's1', name: 'Kati' }, { id: 's2', name: 'Vana', active: false }];
    const planned = render(<LessonPanel item={item} groupStudents={members} deviceCheck={deviceCheck} viewer={{ uid: 't1', roles: ['teacher'] }}><p>members</p></LessonPanel>);
    expect(await screen.findByRole('status', { name: 'Õpilaste seadme kontroll' })).toHaveTextContent('Kati — viga');
    // an archived member is not asked about
    expect(deviceCheck.forStudent).toHaveBeenCalledTimes(1);
    planned.unmount();
    render(<LessonPanel item={{ ...item, status: 'Toimunud' }} groupStudents={members} deviceCheck={deviceCheck} viewer={{ uid: 't1' }}><p>members</p></LessonPanel>);
    expect(screen.queryByRole('status', { name: 'Õpilaste seadme kontroll' })).toBeNull();
    expect(deviceCheck.forStudent).toHaveBeenCalledTimes(1);
  });
});
