/**
 * Error boundary testing utilities
 */

import { render, screen } from '@testing-library/react';
import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export interface TestErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  shouldCatch?: (error: Error) => boolean;
}

/**
 * Test error boundary component for testing error scenarios
 */
export class TestErrorBoundary extends Component<TestErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: TestErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, shouldCatch } = this.props;

    if (shouldCatch && !shouldCatch(error)) {
      throw error;
    }

    this.setState({ error, errorInfo });
    onError?.(error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return (
        fallback || (
          <div role="alert" data-testid="error-boundary">
            <h2>Something went wrong</h2>
            <p>{error?.message}</p>
          </div>
        )
      );
    }

    return children;
  }
}

/**
 * Component that throws an error for testing
 */
export const ThrowError: React.FC<{
  shouldThrow?: boolean;
  errorMessage?: string;
  errorType?: 'render' | 'effect' | 'event';
}> = ({ shouldThrow = true, errorMessage = 'Test error', errorType = 'render' }) => {
  React.useEffect(() => {
    if (shouldThrow && errorType === 'effect') {
      throw new Error(errorMessage);
    }
  }, [shouldThrow, errorMessage, errorType]);

  const handleClick = () => {
    if (errorType === 'event') {
      throw new Error(errorMessage);
    }
  };

  if (shouldThrow && errorType === 'render') {
    throw new Error(errorMessage);
  }

  return (
    <button onClick={handleClick} data-testid="error-trigger">
      {errorType === 'event' ? 'Click to throw error' : 'No error'}
    </button>
  );
};

/**
 * Utility to test error boundary behavior
 */
export const testErrorBoundary = (
  Component: React.ComponentType<any>,
  props: any = {},
  errorBoundaryProps: Partial<TestErrorBoundaryProps> = {}
) => {
  const onError = jest.fn();

  const renderWithErrorBoundary = () => {
    return render(
      <TestErrorBoundary onError={onError} {...errorBoundaryProps}>
        <Component {...props} />
      </TestErrorBoundary>
    );
  };

  return {
    renderWithErrorBoundary,
    onError,
    expectErrorBoundary: () => {
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    },
    expectNoErrorBoundary: () => {
      expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
    },
    expectErrorCaught: (errorMessage?: string) => {
      expect(onError).toHaveBeenCalled();
      if (errorMessage) {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({ message: errorMessage }),
          expect.any(Object)
        );
      }
    },
  };
};

/**
 * Creates error scenarios for testing
 */
export const createErrorScenarios = () => ({
  renderError: () => <ThrowError errorType="render" errorMessage="Render error" />,
  effectError: () => <ThrowError errorType="effect" errorMessage="Effect error" />,
  eventError: () => <ThrowError errorType="event" errorMessage="Event error" />,
  networkError: () => <ThrowError errorMessage="Network request failed" />,
  validationError: () => <ThrowError errorMessage="Validation failed" />,
});

/**
 * Utility for testing error recovery
 */
export const testErrorRecovery = (
  Component: React.ComponentType<any>,
  triggerError: () => void,
  recoverFromError: () => void
) => {
  const onError = jest.fn();

  const { rerender } = render(
    <TestErrorBoundary onError={onError}>
      <Component />
    </TestErrorBoundary>
  );

  // Trigger error
  triggerError();
  expect(screen.getByTestId('error-boundary')).toBeInTheDocument();

  // Recover from error
  rerender(
    <TestErrorBoundary onError={onError}>
      <Component />
    </TestErrorBoundary>
  );

  recoverFromError();
  expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument();
};

/**
 * Network error simulation utilities
 */
export const createNetworkErrorHelpers = () => {
  const originalFetch = global.fetch;

  return {
    mockNetworkError: (errorMessage = 'Network error') => {
      global.fetch = jest.fn(() => Promise.reject(new Error(errorMessage)));
    },

    mockNetworkTimeout: (delay = 5000) => {
      global.fetch = jest.fn(
        () =>
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), delay))
      );
    },

    mockNetworkSuccess: (data: any) => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(data),
        } as Response)
      );
    },

    restoreNetwork: () => {
      global.fetch = originalFetch;
    },
  };
};

/**
 * Offline scenario testing
 */
export const createOfflineHelpers = () => {
  const originalOnLine = navigator.onLine;

  return {
    goOffline: () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      window.dispatchEvent(new Event('offline'));
    },

    goOnline: () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      window.dispatchEvent(new Event('online'));
    },

    restore: () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: originalOnLine,
      });
    },
  };
};

/**
 * Error boundary test patterns
 */
export const errorBoundaryTestPatterns = {
  /**
   * Test that error boundary catches render errors
   */
  testRenderErrorCatch: (Component: React.ComponentType) => {
    const { renderWithErrorBoundary, expectErrorBoundary, expectErrorCaught } = testErrorBoundary(
      ThrowError,
      { errorType: 'render' }
    );

    renderWithErrorBoundary();
    expectErrorBoundary();
    expectErrorCaught('Test error');
  },

  /**
   * Test that error boundary shows fallback UI
   */
  testFallbackUI: (fallbackComponent: ReactNode) => {
    const { renderWithErrorBoundary } = testErrorBoundary(
      ThrowError,
      { errorType: 'render' },
      { fallback: fallbackComponent }
    );

    renderWithErrorBoundary();
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  },

  /**
   * Test error boundary with retry mechanism
   */
  testRetryMechanism: () => {
    let shouldError = true;
    const RetryComponent = () => {
      if (shouldError) {
        throw new Error('Temporary error');
      }
      return <div>Success</div>;
    };

    const RetryBoundary = ({ children }: { children: ReactNode }) => {
      const [hasError, setHasError] = React.useState(false);

      if (hasError) {
        return (
          <div>
            <p>Something went wrong</p>
            <button
              onClick={() => {
                shouldError = false;
                setHasError(false);
              }}
              data-testid="retry-button"
            >
              Retry
            </button>
          </div>
        );
      }

      return <TestErrorBoundary onError={() => setHasError(true)}>{children}</TestErrorBoundary>;
    };

    render(
      <RetryBoundary>
        <RetryComponent />
      </RetryBoundary>
    );

    // Should show error initially
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click retry
    const retryButton = screen.getByTestId('retry-button');
    retryButton.click();

    // Should show success
    expect(screen.getByText('Success')).toBeInTheDocument();
  },
};
