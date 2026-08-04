import { describe, expect, it } from "vitest";
import {
  base64DocumentBlob,
  PAYMENT_DOCUMENT_MAX_BYTES,
  validatePaymentDocument,
} from "./paymentDocuments.js";

describe("payment documents", () => {
  it("accepts accounting file formats up to 10 MB", () => {
    expect(validatePaymentDocument({ type: "application/pdf", size: 100, name: "payment.pdf" })).toEqual({ valid: true, error: "" });
    expect(validatePaymentDocument({ type: "text/html", size: 100, name: "bad.html" }).valid).toBe(false);
    expect(validatePaymentDocument({ type: "image/png", size: PAYMENT_DOCUMENT_MAX_BYTES + 1, name: "large.png" }).valid).toBe(false);
  });

  it("creates a browser blob from a base64 API document", async () => {
    const blob = base64DocumentBlob({ contentBase64: "JVBERg==", contentType: "application/pdf" });
    expect(blob.type).toBe("application/pdf");
    expect(await blob.text()).toBe("%PDF");
  });
});
