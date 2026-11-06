import { attentionItems, lateReviews, lessonsSoon, timelineSplit } from './calmModel.js';

const lesson = (time, phase, extra = {}) => ({ key: time, time, phase, studentName: `Õpilane ${time}`, teacher: 'Kati', path: `/calendar?lesson=${time}`, ...extra });

describe('attentionItems', () => {
  it('orders by urgency: lessons now, unmarked, reviews, invoices, leads, calls, packages, errors, unplanned', () => {
    const { items, rest } = attentionItems({
      soon: [lesson('12:30', 'now')], unmarked: 4, reviewsLate: 2, overdueInvoices: 1, overdueCents: 12000, leads: 3, calls: 5, runningOut: 2, errors: 8, unplanned: 6,
    }, 20);
    expect(items.map((item) => item.key)).toEqual(['soon', 'unmarked', 'reviews', 'invoices', 'leads', 'calls', 'balance', 'errors', 'unplanned']);
    expect(rest).toBe(0);
  });

  it('shows at most 5 lines and says how many did not fit', () => {
    const { items, rest } = attentionItems({ unmarked: 1, reviewsLate: 1, overdueInvoices: 1, leads: 1, calls: 1, runningOut: 1, errors: 1 });
    expect(items).toHaveLength(5);
    expect(items.map((item) => item.key)).toEqual(['unmarked', 'reviews', 'invoices', 'leads', 'calls']);
    expect(rest).toBe(2);
  });

  it('leaves out zero counts and counts that are not loaded / not this role\'s', () => {
    const { items } = attentionItems({ soon: [], unmarked: 0, reviewsLate: null, overdueInvoices: 0, leads: null, errors: 3 });
    expect(items.map((item) => item.key)).toEqual(['errors']);
    expect(items[0]).toMatchObject({ text: '3 uut viga saidil', to: '/vead', linkLabel: 'Vead' });
  });

  it('nothing to do → empty list', () => {
    expect(attentionItems({})).toEqual({ items: [], rest: 0 });
  });

  it('the lesson line names the next lesson and links „Alusta tundi” to it; the teacher only when asked', () => {
    const soon = [lesson('12:30', 'now'), lesson('13:00', 'later')];
    const [first] = attentionItems({ soon }).items;
    expect(first).toMatchObject({ count: 2, text: '2 tundi käib või algab tunni jooksul', detail: 'Järgmine: 13:00 Õpilane 13:00 · Kati', action: { to: '/calendar?lesson=13:00', label: 'Alusta tundi' } });
    expect(attentionItems({ soon: [lesson('12:30', 'now')], showTeacher: false }).items[0].detail).toBe('Käib: 12:30 Õpilane 12:30');
  });

  it('calls and packages open a panel on the page, the rest link to their page', () => {
    const { items } = attentionItems({ calls: 1, runningOut: 1, overdueInvoices: 2, overdueCents: 35000 });
    expect(items.find((item) => item.key === 'calls')).toMatchObject({ panel: 'calls', text: '1 õpilane vajab kõnet' });
    expect(items.find((item) => item.key === 'balance')).toMatchObject({ panel: 'balance' });
    expect(items.find((item) => item.key === 'invoices')).toMatchObject({ to: '/finance?status=overdue', text: '2 tähtaja ületanud arvet' });
    expect(items.find((item) => item.key === 'invoices').detail).toMatch(/350/);
  });
});

describe('lessonsSoon', () => {
  it('running lessons and the ones starting within the hour; not later, not past, not cancelled', () => {
    const list = [lesson('11:00', 'past'), lesson('12:30', 'now'), lesson('13:40', 'later'), lesson('13:41', 'later'), lesson('13:00', 'cancelled')];
    expect(lessonsSoon(list, '12:40').map((item) => item.time)).toEqual(['12:30', '13:40']);
  });
});

describe('lateReviews', () => {
  it('counts works not reviewed for more than 3 days', () => {
    const now = Date.parse('2026-11-06T12:00:00Z');
    expect(lateReviews([
      { reviewStatus: 'pending', completedAt: '2026-11-02T11:00:00Z' },
      { reviewStatus: 'pending', completedAt: '2026-11-04T12:00:00Z' },
      { reviewStatus: 'reviewed', completedAt: '2026-10-01T12:00:00Z' },
      { reviewStatus: 'pending' },
    ], now)).toBe(1);
  });
});

describe('timelineSplit', () => {
  it('next 3 ahead, the rest folded; cancelled is not counted in the total', () => {
    const list = [lesson('08:00', 'past'), lesson('09:00', 'cancelled'), lesson('12:00', 'now'), lesson('13:00', 'later'), lesson('14:00', 'later'), lesson('15:00', 'later')];
    const split = timelineSplit(list);
    expect(split.next.map((item) => item.time)).toEqual(['12:00', '13:00', '14:00']);
    expect(split.ahead).toHaveLength(4);
    expect(split.done).toHaveLength(2);
    expect(split.total).toBe(5);
  });
});
