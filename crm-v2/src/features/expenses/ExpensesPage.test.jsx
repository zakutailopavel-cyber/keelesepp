import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ExpensesPage from './ExpensesPage.jsx';

describe('ExpensesPage', () => {
  it('is an archive: new costs are entered as purchase invoices (the accountant 2026-10-23)', async () => {
    const repository = { list: vi.fn().mockResolvedValue([]), create: vi.fn() };
    render(<MemoryRouter><ExpensesPage repository={repository} /></MemoryRouter>);
    await screen.findByText('Valitud kuul kulusid ei ole');
    expect(screen.queryByRole('button', { name: 'Lisa uus kulu' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Uus ostuarve' })).toHaveAttribute('href', '/finance/ostuarved');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('requires a reason before correcting an expense', async () => {
    const date = new Date().toISOString().slice(0, 10);
    const repository = { list: vi.fn().mockResolvedValue([{ id: 'e1', expenseDate: date, category: 'rent', description: 'Klassiruumi üür', amountCents: 10000, vatAmountCents: 0, netAmountCents: 10000, paymentMethod: 'bank', status: 'active', documents: [] }]), correct: vi.fn() };
    render(<MemoryRouter><ExpensesPage repository={repository} /></MemoryRouter>);
    await screen.findByText('Klassiruumi üür');
    fireEvent.click(screen.getByRole('button', { name: 'Paranda' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta parandus' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Lisa paranduse põhjus.');
    expect(repository.correct).not.toHaveBeenCalled();
  });
});
