import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { requireFirebaseClient } from './client.js';
import { financeApi, financeRequestId } from './financeApi.js';
import { validatePaymentDocument } from './paymentDocuments.js';

// Tarnijad and ostuarved (docs/ACCOUNTING.md): admins read them; every change goes through financeApi, which books the
// OA / VM entries. The invoice PDF is uploaded like an expense receipt (same checks), to its own folder.
export const purchasesService = {
  async load() {
    const { db } = requireFirebaseClient();
    const [suppliers, invoices, accounts, lock] = await Promise.all([
      getDocs(collection(db, 'suppliers')),
      getDocs(collection(db, 'purchaseInvoices')),
      getDocs(collection(db, 'accountingAccounts')),
      getDoc(doc(db, 'accountingSettings', 'lock')),
    ]);
    return {
      suppliers: suppliers.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(a.name).localeCompare(String(b.name), 'et')),
      invoices: invoices.docs.map((item) => ({ id: item.id, ...item.data() })),
      accounts: accounts.docs.map((item) => ({ code: item.id, ...item.data() })).sort((a, b) => a.code.localeCompare(b.code, 'et', { numeric: true })),
      lockedThrough: lock.exists() ? String(lock.data().lockedThrough || '') : '',
    };
  },
  saveSupplier: (supplierId, supplier) => financeApi.saveSupplier(supplierId, supplier),
  saveInvoice: (purchaseInvoiceId, invoice, options) => financeApi.savePurchaseInvoice(purchaseInvoiceId, invoice, options),
  pay: (purchaseInvoiceId, payment) => financeApi.payPurchaseInvoice(purchaseInvoiceId, payment),
  removePayment: (purchaseInvoiceId, paymentId, reason) => financeApi.removePurchasePayment(purchaseInvoiceId, paymentId, reason),
  voidInvoice: (purchaseInvoiceId, reason) => financeApi.voidPurchaseInvoice(purchaseInvoiceId, reason),
  async uploadDocument(purchaseInvoiceId, file) {
    const validation = validatePaymentDocument(file);
    if (!validation.valid) throw new Error(validation.error);
    const documentId = financeRequestId('purchase_document');
    const storagePath = `financial/purchase-invoices/${purchaseInvoiceId}/${documentId}`;
    const { storage } = requireFirebaseClient();
    await uploadBytes(ref(storage, storagePath), file, { contentType: file.type });
    return financeApi.attachPurchaseDocument(purchaseInvoiceId, { requestId: documentId, storagePath, fileName: file.name, contentType: file.type, size: file.size });
  },
  async getDocumentUrl(document) {
    const { storage } = requireFirebaseClient();
    return getDownloadURL(ref(storage, document.storagePath));
  },
};
