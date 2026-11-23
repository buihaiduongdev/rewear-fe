import { useDebounce } from '@/shared/hooks';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('useDebounce hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 350));
    expect(result.current).toBe('initial');
  });

  it('should debounce value change until specified delay passes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'first', delay: 350 },
      },
    );

    expect(result.current).toBe('first');

    // Rerender with a new value
    rerender({ value: 'second', delay: 350 });

    // Value should not have changed yet
    expect(result.current).toBe('first');

    // Fast-forward time partly
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('first');

    // Advance past delay
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('second');
  });

  it('should cancel previous timer if value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 350),
      {
        initialProps: { value: 'a' },
      },
    );

    rerender({ value: 'ab' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'abc' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('abc');
  });
});
