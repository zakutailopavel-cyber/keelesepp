import { describe, expect, it } from 'vitest';
import { invoiceEmailLine } from './FinanceMonthPage.jsx';

describe('invoice e-mail line', () => {
  it('shows not sent, sending, failed, queued and sent', () => {
    expect(invoiceEmailLine({}).text).toBe('Saatmata');
    expect(invoiceEmailLine({ emailStatus: 'sending' }).text).toBe('Saatmisel…');
    expect(invoiceEmailLine({ emailStatus: 'failed', emailLastError: 'bounce' })).toMatchObject({ text: 'Saatmine ebaõnnestus', tone: 'danger', title: 'bounce' });
    expect(invoiceEmailLine({ emailStatus: 'queued', emailQueuedAt: '2026-10-10T10:00:00Z' }).text).toMatch(/^Järjekorras /);
    const sent = invoiceEmailLine({ emailStatus: 'sent', emailSentAt: '2026-10-10T10:00:00Z', emailRecipient: 'a@b.ee', lastReminderSentAt: '2026-10-12T10:00:00Z' });
    expect(sent.text).toMatch(/^Saadetud .* · Meeldetuletus /);
    expect(sent.title).toBe('a@b.ee');
  });
});
