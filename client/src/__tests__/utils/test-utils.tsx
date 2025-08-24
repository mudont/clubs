import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { configureStore } from '@reduxjs/toolkit';
import { RenderOptions, RenderResult, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { RootState } from '../../store';
import authReducer from '../../store/authSlice';
import { TestUser, createTestUser } from './mock-factories';

// Re-export types and factories from mock-factories
export type {
  TestEvent,
  TestEventAttendee,
  TestExpense,
  TestExpenseSplit,
  TestGroup,
  TestGroupMembership,
  TestIndividualMatch,
  TestTennisMatch,
  TestTennisTeam,
  TestUser,
} from './mock-factories';

export {
  createTestEvent,
  createTestExpense,
  createTestGroup,
  createTestTennisMatch,
  createTestUser,
  factories,
} from './mock-factories';

// Store utilities
export const createTestStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });
};

export const createAuthenticatedState = (user: TestUser): Partial<RootState> => ({
  auth: {
    user,
    token: 'test-token',
    isAuthenticated: true,
    loading: false,
  },
});

// Render utilities
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof createTestStore>;
  mocks?: MockedResponse[];
  initialEntries?: string[];
  addTypename?: boolean;
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    mocks = [],
    initialEntries = ['/'],
    addTypename = false,
    ...renderOptions
  }: CustomRenderOptions = {}
): RenderResult & {
  store: ReturnType<typeof createTestStore>;
} => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <Provider store={store}>
        <MockedProvider mocks={mocks} addTypename={addTypename}>
          {children}
        </MockedProvider>
      </Provider>
    </MemoryRouter>
  );

  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });
  return {
    store,
    ...renderResult,
  };
};

// Authenticated render utility
export const renderWithAuth = (
  ui: ReactElement,
  user: TestUser = createTestUser(),
  options: Omit<CustomRenderOptions, 'preloadedState'> = {}
) => {
  return renderWithProviders(ui, {
    preloadedState: createAuthenticatedState(user),
    ...options,
  });
};

// Router-only render utility (for testing routing without Redux)
export const renderWithRouter = (
  ui: ReactElement,
  { initialEntries = ['/'] }: { initialEntries?: string[] } = {}
): RenderResult & { user: typeof userEvent } => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
  );

  const renderResult = render(ui, { wrapper: Wrapper });
  return {
    user: userEvent,
    ...renderResult,
  };
};

// Apollo-only render utility (for testing GraphQL without Redux)
export const renderWithApollo = (
  ui: ReactElement,
  { mocks = [], addTypename = false }: { mocks?: MockedResponse[]; addTypename?: boolean } = {}
): RenderResult & { user: typeof userEvent } => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <MockedProvider mocks={mocks} addTypename={addTypename}>
      {children}
    </MockedProvider>
  );

  const renderResult = render(ui, { wrapper: Wrapper });
  return {
    user: userEvent,
    ...renderResult,
  };
};

// Wait utilities
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Mock utilities
export const createMockIntersectionObserver = () => {
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
  return mockIntersectionObserver;
};

export const createMockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  return mockResizeObserver;
};

// Form testing utilities
export const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  formData: Record<string, string>,
  container?: HTMLElement
) => {
  for (const [fieldName, value] of Object.entries(formData)) {
    const field = container?.querySelector(`[name="${fieldName}"]`) as HTMLElement;
    if (field) {
      await user.clear(field);
      await user.type(field, value);
    }
  }
};

export const submitForm = async (
  user: ReturnType<typeof userEvent.setup>,
  container?: HTMLElement
) => {
  const form = container?.querySelector('form');
  if (form) {
    const submitButton = form.querySelector('[type="submit"]') as HTMLElement;
    if (submitButton) {
      await user.click(submitButton);
    }
  }
};

// Accessibility testing utilities - use Testing Library queries instead
export const findByLabelText = (container: HTMLElement, text: string | RegExp) => {
  // This is a helper - prefer using screen.getByLabelText in actual tests
  const element =
    container.querySelector(`[aria-label*="${text}"]`) ||
    container.querySelector(`[aria-labelledby]`);
  return element;
};

export const findByRole = (
  container: HTMLElement,
  role: string,
  options?: { name?: string | RegExp }
) => {
  // This is a helper - prefer using screen.getByRole in actual tests
  let selector = `[role="${role}"]`;
  if (options?.name) {
    selector += `[aria-label*="${options.name}"]`;
  }
  return container.querySelector(selector);
};

// Error boundary testing utility
export const ThrowError: React.FC<{ shouldThrow?: boolean; message?: string }> = ({
  shouldThrow = true,
  message = 'Test error',
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

// Custom matchers for better assertions
export const expectToBeVisible = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectToHaveAccessibleName = (element: HTMLElement | null, name: string | RegExp) => {
  expect(element).toBeInTheDocument();
  if (typeof name === 'string') {
    expect(element).toHaveAccessibleName(name);
  } else {
    expect(element?.getAttribute('aria-label')).toMatch(name);
  }
};

// Performance testing utilities
export const measureRenderTime = async (renderFn: () => void): Promise<number> => {
  const start = performance.now();
  renderFn();
  await waitForLoadingToFinish();
  const end = performance.now();
  return end - start;
};

// Local storage utilities for testing
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  return localStorageMock;
};

// Session storage utilities for testing
export const mockSessionStorage = () => {
  const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  });
  return sessionStorageMock;
};
