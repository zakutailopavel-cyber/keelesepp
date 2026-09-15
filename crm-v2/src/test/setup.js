import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Keep each jsdom test isolated. Several page suites render the same controls,
// so retaining a prior document makes accessible queries target stale UI.
afterEach(() => {
  cleanup();
});
