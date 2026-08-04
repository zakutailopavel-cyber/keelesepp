import { collection, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { requireFirebaseClient } from './client.js';
import { financeApi, financeRequestId } from './financeApi.js';
import { validatePaymentDocument } from './paymentDocuments.js';

function timestamp(value) {
  if (typeof value === 'string') return value;
  if (value?.toDate) return value.toDate().toISOString();
  return '';
}

export const expensesService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, 'expenses'));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => `${b.expenseDate || ''}|${timestamp(b.createdAt)}`.localeCompare(`${a.expenseDate || ''}|${timestamp(a.createdAt)}`));
  },
  create(values) {
    return financeApi.createExpense(values);
  },
  correct(expenseId, values, reason) {
    return financeApi.correctExpense(expenseId, values, reason);
  },
  void(expenseId, reason) {
    return financeApi.voidExpense(expenseId, reason);
  },
  async uploadDocument(expenseId, file) {
    const validation = validatePaymentDocument(file);
    if (!validation.valid) throw new Error(validation.error);
    const documentId = financeRequestId('expense_document');
    const storagePath = `financial/expenses/${expenseId}/${documentId}`;
    const { storage } = requireFirebaseClient();
    await uploadBytes(ref(storage, storagePath), file, { contentType: file.type });
    return financeApi.attachExpenseDocument(expenseId, {
      requestId: documentId,
      storagePath,
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    });
  },
  async getDocumentUrl(document) {
    const { storage } = requireFirebaseClient();
    return getDownloadURL(ref(storage, document.storagePath));
  },
};
