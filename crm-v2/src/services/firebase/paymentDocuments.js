import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { requireFirebaseClient } from "./client.js";
import { financeRequestId } from "./financeApi.js";

export const PAYMENT_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
export const PAYMENT_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

export function validatePaymentDocument(file) {
  if (!file) return { valid: false, error: "Vali fail." };
  if (!PAYMENT_DOCUMENT_TYPES.has(String(file.type || "").toLowerCase())) {
    return { valid: false, error: "Lubatud on PDF-, JPEG-, PNG- ja WebP-failid." };
  }
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > PAYMENT_DOCUMENT_MAX_BYTES) {
    return { valid: false, error: "Fail peab olema väiksem kui 10 MB." };
  }
  return { valid: true, error: "" };
}

export function base64DocumentBlob(document) {
  const binary = globalThis.atob(String(document?.contentBase64 || ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new globalThis.Blob([bytes], { type: document?.contentType || "application/octet-stream" });
}

export const paymentDocumentsService = {
  async upload(paymentId, file, financeRepository) {
    const validation = validatePaymentDocument(file);
    if (!validation.valid) throw new Error(validation.error);
    const documentId = financeRequestId("payment_document");
    const storagePath = `financial/payment-orders/${paymentId}/${documentId}`;
    const { storage } = requireFirebaseClient();
    await uploadBytes(ref(storage, storagePath), file, { contentType: file.type });
    return financeRepository.attachPaymentDocument(paymentId, {
      requestId: documentId,
      storagePath,
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    });
  },
  async getUrl(document) {
    const { storage } = requireFirebaseClient();
    return getDownloadURL(ref(storage, document.storagePath));
  },
};
