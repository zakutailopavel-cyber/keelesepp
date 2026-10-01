import { requireFirebaseClient } from './client.js';

const defaultUrl = 'https://us-central1-keelesepp-5136b.cloudfunctions.net/interactiveLessonApi';

// Interactive lessons assigned in CRM v1 (`interactiveAssignments`, server-only collection). CRM v2 lets students finish
// them and teachers give feedback through the existing interactiveLessonApi; nothing new is assigned from v2.
async function call(action, data = {}) {
  const { auth } = requireFirebaseClient();
  if (!auth.currentUser) throw new Error('Aktiivne kasutajaseanss puudub. Logi uuesti sisse.');
  const token = await auth.currentUser.getIdToken();
  const url = String(import.meta.env.VITE_INTERACTIVE_LESSON_API_URL || defaultUrl);
  const response = await globalThis.fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...data }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = response.status === 409
      ? 'Vahepeal salvestati teine versioon. Laadi tund uuesti.'
      : body.error || 'Interaktiivse tunni päring ebaõnnestus.';
    throw Object.assign(new Error(message), { status: response.status });
  }
  return body;
}

export const interactiveAssignmentsService = {
  async list() {
    const items = [];
    let cursor = null;
    for (let page = 0; page < 10; page += 1) {
      const data = await call('list', cursor ? { cursor } : {});
      items.push(...(data.assignments || []));
      cursor = data.nextCursor;
      if (!cursor) break;
    }
    return items;
  },
  get(assignmentId) {
    return call('get', { assignmentId });
  },
  save(record, answers, currentActivityId) {
    return call('save', { assignmentId: record.id, revision: record.revision, answers, currentActivityId });
  },
  submit(record, answers, currentActivityId) {
    return call('submit', { assignmentId: record.id, revision: record.revision, answers, currentActivityId });
  },
  review(record, feedback) {
    return call('review', { assignmentId: record.id, revision: record.revision, feedback });
  },
};
