import { useAsyncData } from '../../hooks/useAsyncData.js';

export function useFinanceData({
  canManageFinance,
  invoiceRepository,
  planRepository,
  studentRepository,
  lessonRepository,
  bankRepository,
  periodRepository,
  creditRepository,
  creditNoteRepository,
  auditRepository,
}) {
  return useAsyncData(async () => {
    const [
      invoices,
      plans,
      students,
      lessons,
      bankTransactions,
      periods,
      credits,
      refunds,
      creditNotes,
      auditEntries,
    ] = await Promise.all([
      invoiceRepository.list(),
      planRepository.list(),
      canManageFinance
        ? studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true })
        : Promise.resolve({ items: [] }),
      canManageFinance ? lessonRepository.listForBilling() : Promise.resolve([]),
      canManageFinance ? bankRepository.list() : Promise.resolve([]),
      canManageFinance ? periodRepository.list() : Promise.resolve([]),
      canManageFinance ? creditRepository.list() : Promise.resolve([]),
      canManageFinance ? creditRepository.listRefunds() : Promise.resolve([]),
      canManageFinance ? creditNoteRepository.list() : Promise.resolve([]),
      canManageFinance ? auditRepository.list() : Promise.resolve([]),
    ]);

    return {
      invoices,
      plans,
      students: students.items,
      lessons,
      bankTransactions,
      periods,
      credits,
      refunds,
      creditNotes,
      auditEntries,
    };
  }, [
    auditRepository,
    bankRepository,
    canManageFinance,
    creditNoteRepository,
    creditRepository,
    invoiceRepository,
    lessonRepository,
    periodRepository,
    planRepository,
    studentRepository,
  ]);
}
