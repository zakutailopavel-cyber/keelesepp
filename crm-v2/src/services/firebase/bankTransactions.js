import { collection, getDocs } from "firebase/firestore";
import { requireFirebaseClient } from "./client.js";

export const bankTransactionsService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, "bankTransactions"));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((left, right) =>
        String(right.paidAt || right.createdAt || "").localeCompare(
          String(left.paidAt || left.createdAt || ""),
        ),
      );
  },
};
