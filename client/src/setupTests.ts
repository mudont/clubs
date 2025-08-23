// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Import jest-axe for accessibility testing
import { toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
    }
  }
}

expect.extend(toHaveNoViolations);

// Mock window.matchMedia for components that use it
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

// Mock IntersectionObserver for components that use lazy loading
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: jest.fn(() => []),
});
global.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver for components that use it
const mockResizeObserver = jest.fn();
mockResizeObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
global.ResizeObserver = mockResizeObserver;

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// Mock HTMLElement.scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock window.location
delete (window as unknown as { location: unknown }).location;
window.location = {
  ...window.location,
  assign: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  href: 'http://localhost:3000',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/',
  search: '',
  hash: '',
  ancestorOrigins: {} as DOMStringList,
};

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
    readText: jest.fn().mockResolvedValue(''),
  },
  writable: true,
});

// Mock geolocation API
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
  writable: true,
});

// Mock Web APIs that might be used
global.fetch = jest.fn();
global.Request = jest.fn() as jest.MockedFunction<typeof Request>;
global.Response = jest.fn() as jest.MockedFunction<typeof Response>;

// Mock File and FileReader for file upload tests
global.File = class MockFile {
  constructor(
    public parts: (string | Blob | ArrayBuffer | ArrayBufferView)[],
    public name: string,
    public options?: FilePropertyBag
  ) {}

  get size() {
    return 1024;
  }
  get type() {
    return this.options?.type || 'text/plain';
  }
  get lastModified() {
    return this.options?.lastModified || Date.now();
  }

  slice() {
    return new Blob();
  }
  stream() {
    return new ReadableStream();
  }
  text() {
    return Promise.resolve('');
  }
  arrayBuffer() {
    return Promise.resolve(new ArrayBuffer(0));
  }
} as unknown as typeof File;

global.FileReader = class MockFileReader {
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  readyState: number = 0;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
  onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
  onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
  onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;

  readAsText() {
    this.result = 'mock file content';
  }
  readAsDataURL() {
    this.result = 'data:text/plain;base64,bW9jayBmaWxlIGNvbnRlbnQ=';
  }
  readAsArrayBuffer() {
    this.result = new ArrayBuffer(0);
  }
  readAsBinaryString() {
    this.result = 'mock file content';
  }
  abort() {}

  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return true;
  }
} as unknown as typeof FileReader;

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    ...window.performance,
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByName: jest.fn(() => []),
    getEntriesByType: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
    now: jest.fn(() => Date.now()),
  },
  writable: true,
});

// Suppress console warnings in tests unless explicitly testing them
const originalConsole = {
  warn: console.warn,
  error: console.error,
  log: console.log,
};

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
  // Keep console.log for debugging in tests
});

afterAll(() => {
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.log = originalConsole.log;
});

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clear localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // Reset document title
  document.title = 'Test';

  // Clear any timers
  jest.clearAllTimers();
});

// Global test timeout
jest.setTimeout(10000);
