import { collection, getDocs } from "firebase/firestore";
import { requireFirebaseClient } from "./client.js";

export const creditNotesService = {
  async list() {
    const { db } = requireFirebaseClient();
    const snapshot = await getDocs(collection(db, "creditNotes"));
    return snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => String(b.date || b.createdAt || "").localeCompare(String(a.date || a.createdAt || "")));
  },
};
