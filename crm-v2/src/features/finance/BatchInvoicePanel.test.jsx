import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BatchInvoicePanel from './BatchInvoicePanel.jsx';

const rows = [
  {
    student: { id: 's1', name: 'Mari Maas' },
    lessonPriceCents: 2500,
    lessons: [
      { id: 'l1', date: '2026-08-03' },
      { id: 'l2', date: '2026-08-10' },
    ],
  },
  {
    student: { id: 's2', name: 'Jaan Tamm' },
    lessonPriceCents: 3000,
    lessons: [{ id: 'l3', date: '2026-08-05' }],
  },
];

describe('BatchInvoicePanel', () => {
  it('previews the selected month and creates one invoice per student', async () => {
    const onCreateInvoice = vi.fn().mockResolvedValue(undefined);
    render(<BatchInvoicePanel rows={rows} onCreateInvoice={onCreateInvoice} />);

    fireEvent.change(screen.getByLabelText('Arvelduskuu'), { target: { value: '2026-08' } });
    expect(screen.getByText(/2 arvet/)).toBeInTheDocument();
    expect(screen.getByText(/3 tundi/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Vaata ja loo arved/i }));
    expect(screen.getByText('Mari Maas')).toBeInTheDocument();
    expect(screen.getByText('Jaan Tamm')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Loo 2 arvet/i }));

    await waitFor(() => expect(onCreateInvoice).toHaveBeenCalledTimes(2));
    expect(onCreateInvoice).toHaveBeenNthCalledWith(1, expect.objectContaining({
      studentId: 's1',
      lessonIds: ['l1', 'l2'],
      description: '2026-08 keeletunnid',
    }));
    expect(onCreateInvoice).toHaveBeenNthCalledWith(2, expect.objectContaining({
      studentId: 's2',
      lessonIds: ['l3'],
    }));
  });

  it('shows blocked students without adding them to the create queue', () => {
    render(<BatchInvoicePanel rows={[{
      student: { id: 's3', name: 'Hinnata Õpilane' },
      lessonPriceCents: 0,
      lessons: [{ id: 'l4', date: '2026-08-06' }],
    }]} onCreateInvoice={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Arvelduskuu'), { target: { value: '2026-08' } });
    expect(screen.getByText(/1 õpilase arvet ei saa luua/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vaata ja loo arved/i })).toBeDisabled();
  });
});
