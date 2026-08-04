import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { requireFirebaseClient } from "./client.js";

function timestampValue(value) {
  if (typeof value === "string") return value;
  if (value?.toDate) return value.toDate().toISOString();
  return "";
}

export const financialAuditService = {
  async list(pageSize = 300) {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(query(
      collection(db, "financialAudit"),
      orderBy("createdAt", "desc"),
      limit(Math.min(Math.max(Number(pageSize) || 300, 1), 500)),
    ));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => timestampValue(b.createdAt).localeCompare(timestampValue(a.createdAt)));
  },
};
