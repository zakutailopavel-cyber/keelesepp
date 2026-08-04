import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import ExpensesPage from './ExpensesPage.jsx';

describe('ExpensesPage', () => {
  it('creates a simple expense without supplier fields', async () => {
    const repository = { list: vi.fn().mockResolvedValue([]), create: vi.fn().mockResolvedValue({}) };
    render(<MemoryRouter><ExpensesPage repository={repository} /></MemoryRouter>);
    await screen.findByText('Valitud kuul kulusid ei ole');
    fireEvent.click(screen.getByRole('button', { name: 'Lisa uus kulu' }));
    expect(screen.queryByLabelText(/tarnija/i)).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Kirjeldus'), { target: { value: 'Videokõne tarkvara' } });
    fireEvent.change(screen.getByLabelText('Summa koos KM-ga (€)'), { target: { value: '24,40' } });
    fireEvent.change(screen.getByLabelText('Käibemaks (€)'), { target: { value: '4,40' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa kulu' }));
    await waitFor(() => expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ description: 'Videokõne tarkvara', amount: '24,40', vatAmount: '4,40' })));
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
