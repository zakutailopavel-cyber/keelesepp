import { requireFirebaseClient } from "./client.js";

const defaultBaseUrl =
    "https://us-central1-keelesepp-5136b.cloudfunctions.net/teacherScopeMigrationApi";

async function post(path, body = {}) {
    const { auth } = requireFirebaseClient();
    if (!auth.currentUser)
          throw new Error("Aktiivne kasutajaseanss puudub. Logi uuesti sisse.");
    const token = await auth.currentUser.getIdToken();
    const baseUrl = String(
          import.meta.env.VITE_TEACHER_SCOPE_MIGRATION_API_URL || defaultBaseUrl,
        ).replace(/\/$/, "");
    const response = await globalThis.fetch(`${baseUrl}${path}`, {
          method: "POST",
          headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
          throw new Error(data.error || "Teacher-scope migratsiooni päring ebaõnnestus.");
    return data;
}

// Admin-only, reversible teacher-scope migration controls. preview() never
// mutates data; apply() backfills teacherUid; enforce() flips strict reads
// on; rollback() turns strict reads back off. Wired to a temporary Settings
// diagnostics panel so an admin can check backfill readiness from the UI.
export const teacherScopeMigrationApi = {
    preview() {
          return post("/preview");
    },
    apply() {
          return post("/apply");
    },
    enforce() {
          return post("/enforce");
    },
    rollback() {
          return post("/rollback");
    },
};
