import { collection, getDocs } from "firebase/firestore";
import { requireFirebaseClient } from "./client.js";

async function listCollection(name, dateFields) {
  const { db } = requireFirebaseClient();
  const snapshot = await getDocs(collection(db, name));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((left, right) => {
      const leftDate =
        dateFields.map((field) => left[field]).find(Boolean) || "";
      const rightDate =
        dateFields.map((field) => right[field]).find(Boolean) || "";
      return String(rightDate).localeCompare(String(leftDate));
    });
}

export const payerCreditsService = {
  list() {
    return listCollection("payerCredits", [
      "createdAt",
      "lastAppliedAt",
      "lastRefundedAt",
    ]);
  },
  listRefunds() {
    return listCollection("refunds", ["refundedAt", "createdAt"]);
  },
};
