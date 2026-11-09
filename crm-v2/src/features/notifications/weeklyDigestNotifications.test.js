import { describe, expect, it } from 'vitest';
import { weeklyDigestNotifications } from './notificationModel.js';
import { isoWeekId } from '../../services/firebase/teacherDigest.js';

describe('weekly „Märkimata tunnid” bell notice', () => {
  it('one item per week with the count, opening the list', () => {
    const [item] = weeklyDigestNotifications({ week: '2026-W46', total: 1, status: 'sent' });
    expect(item).toMatchObject({ id: 'unmarked-week:2026-W46', category: 'lesson', title: 'Nädala kokkuvõte: 1 tund märkimata', to: '/calendar/markimata', meta: 'nädal 46' });
    expect(item.detail).toBe('Saatsime nimekirja ka e-postiga. Tunnid alates 01.11.2026.');
  });
  it('without an e-mail (no verified address) the bell still tells; zero or no marker → nothing', () => {
    expect(weeklyDigestNotifications({ week: '2026-W46', total: 5, status: 'no-email' })[0].detail).toBe('Tunnid alates 01.11.2026.');
    expect(weeklyDigestNotifications(null)).toEqual([]);
    expect(weeklyDigestNotifications({ week: '2026-W46', total: 0 })).toEqual([]);
  });
  it('ISO week ids match the server', () => {
    expect(isoWeekId('2026-11-09')).toBe('2026-W46');
    expect(isoWeekId('2026-11-15')).toBe('2026-W46');
    expect(isoWeekId('2027-01-01')).toBe('2026-W53');
    expect(isoWeekId('2024-12-30')).toBe('2025-W01');
  });
});
