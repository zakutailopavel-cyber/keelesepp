import { addDoc, collection, doc, onSnapshot } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';

// Requests to the local models on the school Mac (tools/lesson-transcriber, Ollama). The browser writes a request,
// the Mac answers on the same document (`status` new → working → done | failed, `result`). Staff only (rules).
export const aiRequestsService = {
  async requestSentences({ topic = '', level = '', grammar = '', count = 8 }, user) {
    if (!user?.uid) throw new Error('Kasutaja puudub.');
    const { db } = requireFirebaseClient();
    const ref = await addDoc(collection(db, 'aiRequests'), {
      kind: 'sentences', topic: String(topic).slice(0, 120), level: String(level).slice(0, 10), grammar: String(grammar).slice(0, 120),
      count: Math.max(1, Math.min(12, Math.round(Number(count) || 8))), createdBy: user.uid, createdAt: new Date().toISOString(), status: 'new',
    });
    return ref.id;
  },
  subscribe(id, onData, onError) {
    const { db } = requireFirebaseClient();
    return onSnapshot(doc(db, 'aiRequests', id), (snap) => onData(snap.exists() ? { id: snap.id, ...snap.data() } : null), (error) => onError?.(error));
  },
};
