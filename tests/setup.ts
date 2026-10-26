import { useToastStore } from '@/shared/stores/toast.store';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// App Router context is absent when rendering forms outside Next.js.
const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));

beforeEach(() => {
  useToastStore.setState({ toasts: [] });
  replace.mockReset();
});
afterEach(() => {
  cleanup();
});

export function getReplaceMock() {
  return replace;
}
