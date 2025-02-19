import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with @testing-library/jest-dom's matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});
