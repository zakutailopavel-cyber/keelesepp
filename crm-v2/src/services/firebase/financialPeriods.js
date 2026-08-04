import { collection, getDocs } from "firebase/firestore";
import { requireFirebaseClient } from "./client.js";

export const financialPeriodsService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, "financialPeriods"));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((left, right) =>
        String(right.month || right.id).localeCompare(
          String(left.month || left.id),
        ),
      );
  },
};
