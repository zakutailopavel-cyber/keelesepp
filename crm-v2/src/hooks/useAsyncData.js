import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsyncData(loader, dependencies = []) {
  const [state, setState] = useState({ loading: true, data: null, error: null });
  // only the newest load may write the state: an older one that answers late would bring back older data — and wipe
  // what `mutate` put in meanwhile (calendar marks, audit 2026-11-28)
  const latest = useRef(0);
  const reload = useCallback(async () => {
    const run = ++latest.current;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await loader();
      if (run === latest.current) setState({ loading: false, data, error: null });
      return data;
    } catch (error) {
      if (run === latest.current) setState({ loading: false, data: null, error });
      return null;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // change the loaded data in place (what the user just saved), without a round trip; no-op before the first load
  const mutate = useCallback((update) => {
    setState((current) => (current.data === null ? current : { ...current, data: update(current.data) }));
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload, mutate };
}
