// `firebase/firestore` for the whole CRM (vite.config.js `resolve.alias`): the real SDK, except that a write the rules
// refuse („Missing or insufficient permissions”) is reported to `clientErrors` with its collection pattern
// (`students/{id}/notes`) — never the document id, never the data. The error is re-thrown unchanged, so every page
// still shows its own message. `clientErrors` itself is never reported (no loop before the rules are deployed).
// Imports `@firebase/firestore` (what `firebase/firestore` re-exports) so the alias does not point at itself.
import * as firestore from '@firebase/firestore';
import { REPORTED, clientErrors, isPermissionDenied } from '../../features/client-errors/clientErrorReporter.js';

export * from '@firebase/firestore';

let reporter = clientErrors;
export function setFirestoreErrorReporter(next) { reporter = next || clientErrors; }

function reportIfDenied(error, path, operation) {
  if (!isPermissionDenied(error)) return;
  const list = (Array.isArray(path) ? path : [path]).map((item) => String(item || '').replace(/^\/+/, ''));
  if (list.some((item) => item.startsWith('clientErrors'))) return;
  try {
    reporter.reportPermissionDenied(list, operation);
    if (error && typeof error === 'object') Object.defineProperty(error, REPORTED, { value: true });
  } catch { /* reporting never changes the write's own error */ }
}

const guard = (promise, path, operation) => promise.catch((error) => {
  reportIfDenied(error, path, operation);
  throw error;
});

export function setDoc(reference, ...rest) { return guard(firestore.setDoc(reference, ...rest), reference?.path, 'set'); }
export function updateDoc(reference, ...rest) { return guard(firestore.updateDoc(reference, ...rest), reference?.path, 'update'); }
export function deleteDoc(reference, ...rest) { return guard(firestore.deleteDoc(reference, ...rest), reference?.path, 'delete'); }
export function addDoc(reference, ...rest) { return guard(firestore.addDoc(reference, ...rest), `${reference?.path || ''}/new`, 'add'); }

// a batch: remember which collections it touches, report them when the commit is refused
export function writeBatch(...args) {
  const batch = firestore.writeBatch(...args);
  const paths = new Set();
  for (const method of ['set', 'update', 'delete']) {
    const original = batch[method].bind(batch);
    batch[method] = (reference, ...rest) => { if (reference?.path) paths.add(reference.path); original(reference, ...rest); return batch; };
  }
  const commit = batch.commit.bind(batch);
  batch.commit = () => commit().catch((error) => {
    reportIfDenied(error, [...paths], 'batch');
    throw error;
  });
  return batch;
}

export function runTransaction(...args) { return guard(firestore.runTransaction(...args), '', 'transaction'); }
