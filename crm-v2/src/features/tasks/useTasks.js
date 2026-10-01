import { useEffect, useState } from 'react';
import { tasksService } from '../../services/firebase/tasks.js';

// Live team tasks. The Firestore SDK shares one listener between identical queries, so the task page and the
// notification bell both using this hook read the collection once.
export function useTasks(service = tasksService, enabled = true) {
  const [state, setState] = useState({ loading: enabled, tasks: [], error: null });
  useEffect(() => {
    if (!enabled) return undefined;
    const onError = (error) => setState((current) => ({ ...current, loading: false, error }));
    try {
      return service.subscribe((tasks) => setState({ loading: false, tasks, error: null }), onError);
    } catch (error) {
      // Firebase not configured (tests, preview without env): report it instead of breaking the whole shell.
      globalThis.queueMicrotask(() => onError(error));
      return undefined;
    }
  }, [service, enabled]);
  return enabled ? state : { loading: false, tasks: [], error: null };
}
