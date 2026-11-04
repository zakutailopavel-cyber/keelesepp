import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import TokenInvoiceDialog from './TokenInvoiceDialog.jsx';
import { TOKEN_ROWS_MAX } from './tokenInvoiceRows.js';
import { tokenInvoiceParts, tokenInvoiceStudentIds, tokenInvoiceUsage, tokenInvoiceUsageLines, tokenPartPackageId } from '../../services/firebase/lessonTokens.js';

// „Ühine tunnipakett” (owner 2026-11-04): one package invoice for a family, every line priced from its own card
const family = { parentName: 'Kati Tamm', parentEmail: 'kati@example.ee', linkedParentId: 'parent-kati', active: true };
const mari = { id: 'mari', name: 'Mari Tamm', subject: 'Eesti keel', ...family };
const jaan = { id: 'jaan', name: 'Jaan Tamm', subject: 'Eesti keel', ...family, enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel', active: true }, { subject: 'Matemaatika', teacher: 'Liza', active: true }] };
const other = { id: 'other', name: 'Peeter Kask', subject: 'Eesti keel', parentName: 'Kask', parentEmail: 'kask@example.ee', active: true };
const plans = [
  { studentId: 'mari', lessonPriceCents: 2000, lessonMinutes: 60 },
  { studentId: 'jaan', lessonPriceCents: 2200, lessonMinutes: 60, subjectPrices: { Matemaatika: { lessonPriceCents: 2500, lessonMinutes: 45 } } },
  { studentId: 'other', lessonPriceCents: 1800, lessonMinutes: 60 },
];
const noDirections = { list: vi.fn().mockResolvedValue([]) };
const tokensApi = { listByStudent: vi.fn().mockResolvedValue([]) };

const openWith = (api) => {
  render(<TokenInvoiceDialog studentCards={[mari, jaan, other]} plans={plans} api={api} tokensApi={tokensApi} directionsService={noDirections} />);
  fireEvent.click(screen.getByRole('button', { name: /Tunnipakett/ }));
  fireEvent.change(screen.getByLabelText('Õpilane'), { target: { value: 'mari' } });
};

describe('„Ühine tunnipakett”', () => {
  it('two children of one parent: a line each at its own price, the total, the payer, one combined request', async () => {
    const api = { createTokens: vi.fn(), createTokensCombined: vi.fn().mockResolvedValue({ invoice: { id: 'inv-family', num: 'KS-2031-100' } }) };
    openWith(api);
    expect(screen.getByText('Kati Tamm')).toBeInTheDocument();
    expect(screen.getByText(/kati@example\.ee/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: /Lisa rida/ }));
    // the same payer's cards are offered first
    const second = screen.getByLabelText('Õpilane (rida 2)');
    expect([...second.querySelectorAll('optgroup')].map((group) => group.label)).toEqual(['Sama maksja', 'Teine maksja (ühisele arvele ei sobi)']);
    fireEvent.change(second, { target: { value: 'jaan' } });
    fireEvent.change(screen.getByLabelText('Aine (rida 2)'), { target: { value: 'Matemaatika' } });
    fireEvent.change(screen.getByLabelText('Tundide arv (rida 2)'), { target: { value: '4' } });
    expect(screen.getByText(/Rida 2: 4 × 25,00 €/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('12 tundi, 2 rida = 260,00 €');
    fireEvent.click(screen.getByRole('button', { name: 'Loo arve' }));
    await waitFor(() => expect(api.createTokensCombined).toHaveBeenCalledWith(expect.objectContaining({
      items: [{ studentId: 'mari', subject: 'Eesti keel', lessons: 8 }, { studentId: 'jaan', subject: 'Matemaatika', lessons: 4 }],
    })));
    expect(api.createTokens).not.toHaveBeenCalled();
  });

  it('another payer\'s child is refused with a clear message; nothing is created', async () => {
    const api = { createTokens: vi.fn(), createTokensCombined: vi.fn() };
    openWith(api);
    fireEvent.click(screen.getByRole('button', { name: /Lisa rida/ }));
    fireEvent.change(screen.getByLabelText('Õpilane (rida 2)'), { target: { value: 'other' } });
    expect(screen.getByText(/erinev maksja/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Loo arve' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Kaartidel on erinev maksja');
    expect(api.createTokensCombined).not.toHaveBeenCalled();
  });

  it('the same card and subject twice is refused; a removed line goes back to the one-card invoice', async () => {
    const api = { createTokens: vi.fn().mockResolvedValue({ invoice: { id: 'inv1' } }), createTokensCombined: vi.fn() };
    openWith(api);
    fireEvent.click(screen.getByRole('button', { name: /Lisa rida/ }));
    fireEvent.change(screen.getByLabelText('Õpilane (rida 2)'), { target: { value: 'mari' } });
    fireEvent.click(screen.getByRole('button', { name: 'Loo arve' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('üks kord');
    fireEvent.click(screen.getByRole('button', { name: 'Eemalda rida 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Loo arve' }));
    await waitFor(() => expect(api.createTokens).toHaveBeenCalledWith(expect.objectContaining({ studentId: 'mari', subject: 'Eesti keel' })));
    expect(api.createTokensCombined).not.toHaveBeenCalled();
  });

  it('at most 12 lines', () => {
    openWith({ createTokens: vi.fn(), createTokensCombined: vi.fn() });
    for (let i = 1; i < TOKEN_ROWS_MAX; i += 1) fireEvent.click(screen.getByRole('button', { name: /Lisa rida/ }));
    expect(screen.getByLabelText(`Õpilane (rida ${TOKEN_ROWS_MAX})`)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Lisa rida/ })).toBeNull();
  });

  it('the finance month line: a line per card, its own package, owed lessons once per card', () => {
    const invoice = {
      id: 'inv-family', billingMode: 'lesson_tokens_v1', combined: true, tokenCredits: 14, tokenStatus: 'credited', studentId: 'mari', studentIds: ['mari', 'jaan'],
      cardParts: [
        { studentId: 'mari', studentName: 'Mari Tamm', subject: 'Eesti keel', tokenCredits: 8 },
        { studentId: 'jaan', studentName: 'Jaan Tamm', subject: 'Matemaatika', tokenCredits: 4 },
        { studentId: 'jaan', studentName: 'Jaan Tamm', subject: 'Eesti keel', tokenCredits: 2 },
      ],
    };
    expect(tokenInvoiceStudentIds(invoice)).toEqual(['mari', 'jaan']);
    expect(tokenInvoiceParts(invoice).map((part) => part.packageId)).toEqual([0, 1, 2].map((index) => tokenPartPackageId('inv-family', index)));
    const packages = [{ consumedCredits: 1, balanceCredits: 7 }, { consumedCredits: 4, balanceCredits: 0 }, null];
    expect(tokenInvoiceUsageLines(invoice, packages, { owedBy: { jaan: 2 }, showOwedFor: () => true })).toEqual([
      'Ühine tunnipakett · 14 tundi',
      'Mari Tamm · Eesti keel: 8 tundi · peetud 1 · alles 7',
      'Jaan Tamm · Matemaatika: 4 tundi · peetud 4 · läbi · võlg 2 tundi (uus arve)',
      'Jaan Tamm · Eesti keel: 2 tundi · ✓ lisatud õpilasele',
    ]);
    expect(tokenInvoiceUsage({ ...invoice, tokenStatus: 'pending' })).toBe('Ühine tunnipakett · 14 tundi · tunnid lisatakse pärast makset; Mari Tamm · Eesti keel: 8 tundi; Jaan Tamm · Matemaatika: 4 tundi; Jaan Tamm · Eesti keel: 2 tundi');
    // a one-card invoice is unchanged
    expect(tokenInvoiceParts({ id: 'one', billingMode: 'lesson_tokens_v1', studentId: 'mari', tokenCredits: 8 })[0].packageId).toBe('tokens_one');
  });
});
