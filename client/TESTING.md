# Comprehensive Testing Guide

This document provides guidelines and best practices for testing in our React application.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Testing Tools](#testing-tools)
- [Test Structure](#test-structure)
- [Component Testing](#component-testing)
- [Hook Testing](#hook-testing)
- [Integration Testing](#integration-testing)
- [Accessibility Testing](#accessibility-testing)
- [Performance Testing](#performance-testing)
- [Error Boundary Testing](#error-boundary-testing)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Testing Philosophy

Our testing approach follows the testing pyramid:

1. **Unit Tests (70%)** - Test individual components, hooks, and utilities in isolation
2. **Integration Tests (20%)** - Test component interactions and data flow
3. **End-to-End Tests (10%)** - Test complete user workflows

### Key Principles

- **Test behavior, not implementation** - Focus on what the user sees and does
- **Write tests that give confidence** - Tests should catch real bugs
- **Keep tests simple and readable** - Tests are documentation
- **Test accessibility by default** - Every component should be accessible

## Test Types

### Unit Tests

- Component rendering and props
- User interactions (clicks, form submissions)
- State changes and side effects
- Utility functions and calculations
- Custom hooks behavior

### Integration Tests

- GraphQL queries and mutations
- Redux store interactions
- Router navigation
- Component communication
- API error handling

### Accessibility Tests

- Screen reader compatibility
- Keyboard navigation
- Color contrast and visual design
- ARIA attributes and roles
- Focus management

### Performance Tests

- Render time measurements
- Memory usage monitoring
- Large dataset handling
- Re-render optimization

## Testing Tools

### Core Testing Libraries

- **Jest** - Test runner and assertion library
- **React Testing Library** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom Jest matchers

### Specialized Tools

- **jest-axe** - Accessibility testing
- **@apollo/client/testing** - GraphQL testing
- **Redux Toolkit testing utilities** - State management testing

### Test Utilities

- **Mock factories** - Generate realistic test data
- **Component test suites** - Reusable test patterns
- **Performance helpers** - Measure component performance
- **Accessibility helpers** - Automated a11y testing

## Test Structure

### File Organization

```
src/
├── components/
│   ├── auth/
│   │   ├── Login.tsx
│   │   └── __tests__/
│   │       ├── Login.test.tsx
│   │       └── Login.integration.test.tsx
│   └── expenses/
│       ├── ExpenseForm.tsx
│       └── __tests__/
│           ├── ExpenseForm.test.tsx
│           └── ExpenseForm.a11y.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
├── utils/
│   ├── sorting.ts
│   └── __tests__/
│       └── sorting.test.ts
└── __tests__/
    ├── utils/
    │   ├── test-utils.tsx
    │   ├── mock-factories.ts
    │   ├── accessibility-helpers.ts
    │   └── performance-helpers.ts
    └── integration/
        └── graphql-integration.test.tsx
```

### Test Naming Conventions

- **Unit tests**: `ComponentName.test.tsx`
- **Integration tests**: `ComponentName.integration.test.tsx`
- **Accessibility tests**: `ComponentName.a11y.test.tsx`
- **Performance tests**: `ComponentName.perf.test.tsx`

## Component Testing

### Basic Component Test

```typescript
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../utils/test-utils';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MyComponent />);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### Using Test Suites

```typescript
import { FormComponentTestSuite } from '../utils/base-component-tests';
import { MyForm } from './MyForm';

class MyFormTestSuite extends FormComponentTestSuite {
  component = MyForm;
  defaultProps = { onSubmit: jest.fn() };
  displayName = 'MyForm';

  async testValidation() {
    // Custom validation tests
  }

  async testSubmission() {
    // Custom submission tests
  }
}

const myFormTestSuite = new MyFormTestSuite();
myFormTestSuite.runAllTests();
```

## Hook Testing

### Custom Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

### Hook with Dependencies

```typescript
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useAuth } from './useAuth';
import { createMockStore } from '../utils/test-utils';

describe('useAuth', () => {
  it('returns user from store', () => {
    const store = createMockStore({ auth: { user: mockUser } });
    const wrapper = ({ children }) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toEqual(mockUser);
  });
});
```

## Integration Testing

### GraphQL Integration

```typescript
import { MockedProvider } from '@apollo/client/testing';
import { GET_USER_EXPENSES } from '../graphql/Expenses';

const mocks = [
  {
    request: {
      query: GET_USER_EXPENSES,
      variables: { userId: 'user-1' },
    },
    result: {
      data: { userExpenses: mockExpenses },
    },
  },
];

test('loads and displays expenses', async () => {
  render(
    <MockedProvider mocks={mocks}>
      <ExpensesList userId="user-1" />
    </MockedProvider>
  );

  await waitFor(() => {
    expect(screen.getByText('Lunch: $25.50')).toBeInTheDocument();
  });
});
```

### Router Integration

```typescript
import { MemoryRouter } from 'react-router-dom';

test('navigates to expense detail', async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter initialEntries={['/expenses']}>
      <App />
    </MemoryRouter>
  );

  const expenseLink = screen.getByRole('link', { name: /lunch/i });
  await user.click(expenseLink);

  expect(screen.getByText('Expense Details')).toBeInTheDocument();
});
```

## Accessibility Testing

### Automated Accessibility Testing

```typescript
import { expectAccessible } from '../utils/accessibility-helpers';

test('is accessible', async () => {
  const { container } = render(<MyComponent />);
  await expectAccessible(container);
});
```

### Keyboard Navigation Testing

```typescript
test('supports keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<MyForm />);

  // Tab through form fields
  await user.tab();
  expect(screen.getByLabelText(/name/i)).toHaveFocus();

  await user.tab();
  expect(screen.getByLabelText(/email/i)).toHaveFocus();

  // Submit with Enter
  await user.keyboard('{Enter}');
  expect(mockSubmit).toHaveBeenCalled();
});
```

### Screen Reader Testing

```typescript
test('provides proper screen reader experience', () => {
  render(<DataTable data={mockData} />);

  // Check for proper table structure
  expect(screen.getByRole('table')).toBeInTheDocument();
  expect(screen.getAllByRole('columnheader')).toHaveLength(3);
  expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 data rows

  // Check for accessible labels
  expect(screen.getByLabelText(/sort by name/i)).toBeInTheDocument();
});
```

## Performance Testing

### Render Performance

```typescript
import { measureRenderPerformance } from '../utils/performance-helpers';

test('renders within performance threshold', async () => {
  const metrics = await measureRenderPerformance(
    () => render(<ExpensiveComponent data={largeDataset} />),
    { threshold: { renderTime: 100 } } // 100ms threshold
  );

  expect(metrics.renderTime).toBeLessThan(100);
});
```

### Memory Usage Testing

```typescript
test('does not leak memory', async () => {
  const { hasLeak, memoryGrowth } = await detectMemoryLeaks(
    () => render(<MyComponent />),
    100 // iterations
  );

  expect(hasLeak).toBe(false);
  expect(memoryGrowth).toBeLessThan(1024 * 1024); // Less than 1MB growth
});
```

## Error Boundary Testing

### Testing Error Boundaries

```typescript
import { TestErrorBoundary, ThrowError } from '../utils/error-boundary-helpers';

test('catches and displays errors', () => {
  render(
    <TestErrorBoundary>
      <ThrowError errorMessage="Test error" />
    </TestErrorBoundary>
  );

  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByText('Test error')).toBeInTheDocument();
});
```

### Network Error Testing

```typescript
import { createNetworkErrorHelpers } from '../utils/error-boundary-helpers';

test('handles network errors gracefully', async () => {
  const { mockNetworkError, restoreNetwork } = createNetworkErrorHelpers();

  mockNetworkError('Network request failed');

  render(<DataFetchingComponent />);

  await waitFor(() => {
    expect(screen.getByText(/network request failed/i)).toBeInTheDocument();
  });

  restoreNetwork();
});
```

## Best Practices

### Do's

- ✅ Test user-visible behavior
- ✅ Use semantic queries (getByRole, getByLabelText)
- ✅ Test accessibility by default
- ✅ Use realistic test data
- ✅ Test error states and edge cases
- ✅ Keep tests focused and isolated
- ✅ Use descriptive test names
- ✅ Mock external dependencies
- ✅ Test loading states
- ✅ Verify cleanup and memory management

### Don'ts

- ❌ Test implementation details
- ❌ Use shallow rendering
- ❌ Test internal state directly
- ❌ Write overly complex tests
- ❌ Ignore accessibility in tests
- ❌ Skip error scenarios
- ❌ Use brittle selectors (CSS classes, test IDs when semantic options exist)
- ❌ Mock everything (test real integrations when possible)
- ❌ Write tests that depend on each other
- ❌ Ignore performance implications

### Test Data Management

```typescript
// Use factories for consistent test data
const mockUser = createTestUser({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
});

// Create variations for different scenarios
const adminUser = createTestUser({ role: 'admin' });
const unverifiedUser = createTestUser({ emailVerified: false });
```

### Async Testing

```typescript
// Wait for elements to appear
await waitFor(() => {
  expect(screen.getByText('Data loaded')).toBeInTheDocument();
});

// Wait for elements to disappear
await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));

// Use findBy queries for elements that will appear
const submitButton = await screen.findByRole('button', { name: /submit/i });
```

## Common Patterns

### Form Testing Pattern

```typescript
const testFormSubmission = async (formData, expectedResult) => {
  const user = userEvent.setup();
  const mockSubmit = jest.fn();

  render(<MyForm onSubmit={mockSubmit} />);

  // Fill form
  await user.type(screen.getByLabelText(/name/i), formData.name);
  await user.type(screen.getByLabelText(/email/i), formData.email);

  // Submit
  await user.click(screen.getByRole('button', { name: /submit/i }));

  // Verify
  expect(mockSubmit).toHaveBeenCalledWith(expectedResult);
};
```

### Modal Testing Pattern

```typescript
const testModalBehavior = async () => {
  const user = userEvent.setup();

  render(<ComponentWithModal />);

  // Open modal
  await user.click(screen.getByRole('button', { name: /open modal/i }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  // Close with escape
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
};
```

### List Testing Pattern

```typescript
const testListOperations = async (items) => {
  const user = userEvent.setup();

  render(<ItemList items={items} />);

  // Verify all items rendered
  items.forEach(item => {
    expect(screen.getByText(item.name)).toBeInTheDocument();
  });

  // Test sorting
  await user.click(screen.getByRole('button', { name: /sort by name/i }));

  // Verify sorted order
  const listItems = screen.getAllByRole('listitem');
  expect(listItems[0]).toHaveTextContent(sortedItems[0].name);
};
```

## Troubleshooting

### Common Issues

#### "Unable to find element" errors

```typescript
// Instead of:
screen.getByText('Submit'); // Might fail if button is disabled

// Use:
screen.getByRole('button', { name: /submit/i }); // More robust
```

#### Async timing issues

```typescript
// Instead of:
expect(screen.getByText('Success')).toBeInTheDocument(); // Might fail

// Use:
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

#### Memory leaks in tests

```typescript
// Always cleanup after tests
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});
```

#### GraphQL mock issues

```typescript
// Ensure mocks match exactly
const mocks = [
  {
    request: {
      query: MY_QUERY,
      variables: { id: 'exact-match-required' }, // Must match exactly
    },
    result: { data: { ... } },
  },
];
```

### Debugging Tips

1. **Use screen.debug()** to see current DOM state
2. **Check console for warnings** about accessibility or React issues
3. **Use waitFor with timeout** for slow operations
4. **Mock console methods** to avoid noise in test output
5. **Use data-testid sparingly** - prefer semantic queries

### Performance Debugging

```typescript
// Measure test performance
console.time('test-execution');
// ... test code ...
console.timeEnd('test-execution');

// Profile component rendering
const { container } = render(<MyComponent />);
console.log('Rendered elements:', container.querySelectorAll('*').length);
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- ExpenseForm.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="validation"
```

### Test Categories

```bash
# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run only accessibility tests
npm run test:a11y

# Run performance tests
npm run test:perf
```

### CI/CD Integration

```bash
# Run tests in CI mode
CI=true npm test

# Generate test reports
npm run test:ci
```

## Conclusion

This testing guide provides a comprehensive approach to testing React applications. By following these patterns and best practices, you'll create a robust test suite that gives confidence in your code and catches bugs before they reach production.

Remember: good tests are an investment in code quality and developer productivity. They serve as documentation, prevent regressions, and enable confident refactoring.
