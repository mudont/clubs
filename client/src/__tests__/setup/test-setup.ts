/**
 * Additional test setup and configuration
 */

import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Mock performance.memory for memory testing
Object.defineProperty(performance, 'memory', {
  writable: true,
  value: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
});

// Mock console methods in test environment
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Suppress React warnings in tests unless explicitly testing them
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
       args[0].includes('componentWillUpdate'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(): Promise<R>;
      toHaveNoViolations(): Promise<R>;
    }
  }
}

// Custom matchers
expect.extend({
  toBeAccessible: async (received: HTMLElement) => {
    const { axe } = await import('jest-axe');
    const results = await axe(received);

    return {
      pass: results.violations.length === 0,
      message: () => {
        if (results.violations.length === 0) {
          return 'Expected element to have accessibility violations, but none were found';
        }

        const violations = results.violations
          .map(violation => `${violation.id}: ${violation.description}`)
          .join('\n');

        return `Expected element to be accessible, but found violations:\n${violations}`;
      },
    };
  },
});

// Performance testing setup
const performanceObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  entries.forEach((entry) => {
    if (entry.entryType === 'measure') {
      console.log(`Performance: ${entry.name} took ${entry.duration}ms`);
    }
  });
});

if (typeof window !== 'undefined') {
  performanceObserver.observe({ entryTypes: ['measure'] });
}

// Cleanup after each test
afterEach(() => {
  // Clear all timers
  jest.clearAllTimers();

  // Clear all mocks
  jest.clearAllMocks();

  // Reset DOM
  document.body.innerHTML = '';

  // Reset window location
  delete (window as any).location;
  window.location = {
    ...window.location,
    href: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  };

  // Reset localStorage
  localStorage.clear();

  // Reset sessionStorage
  sessionStorage.clear();
});

// Error boundary for tests
export class TestErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Test Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// Test data generators
export const generateTestId = (prefix: string = 'test') =>
  `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

export const generateTestEmail = () =>
  `test-${Math.random().toString(36).substr(2, 9)}@example.com`;

export const generateTestUser = (overrides: any = {}) => ({
  id: generateTestId('user'),
  username: `testuser_${Math.random().toString(36).substr(2, 9)}`,
  email: generateTestEmail(),
  firstName: 'Test',
  lastName: 'User',
  emailVerified: true,
  ...overrides,
});

// Async test helpers
export const waitForNextTick = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForTime = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const createMockResponse = (data: any, status: number = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
});

// Test environment detection
export const isTestEnvironment = () => process.env.NODE_ENV === 'test';

export const isCIEnvironment = () => !!process.env.CI;

// React import
import React from 'react';
