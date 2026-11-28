import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAsyncData } from './useAsyncData.js';

describe('useAsyncData', () => {
  it('mutate changes the loaded data in place; it does nothing before the first load', async () => {
    let finish;
    const { result } = renderHook(() => useAsyncData(() => new Promise((resolve) => { finish = resolve; }), []));
    act(() => result.current.mutate(() => ['never']));
    expect(result.current.data).toBeNull();
    await act(async () => { finish(['a']); });
    act(() => result.current.mutate((data) => [...data, 'b']));
    expect(result.current.data).toEqual(['a', 'b']);
  });

  it('only the newest load writes: an older one answering late does not bring old data back', async () => {
    const pending = [];
    const { result } = renderHook(() => useAsyncData(() => new Promise((resolve) => { pending.push(resolve); }), []));
    await act(async () => { pending[0](['first']); });
    let slow; let fast;
    act(() => { slow = result.current.reload(); });
    act(() => { fast = result.current.reload(); });
    await act(async () => { pending[2](['newest']); await fast; });
    await act(async () => { pending[1](['stale']); await slow; });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(['newest']);
  });
});
