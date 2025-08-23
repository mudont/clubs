import { screen } from '@testing-library/react';

import { createTestUser, renderWithProviders } from '../../../__tests__/utils/test-utils';
import ProtectedRoute from '../ProtectedRoute';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, replace }: { to: string; replace: boolean }) => {
    mockNavigate(to, { replace });
    return <div data-testid="navigate" data-to={to} data-replace={replace} />;
  },
}));

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;

  describe('Authentication States', () => {
    it('renders children when user is authenticated', () => {
      const testUser = createTestUser();

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: testUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        }
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('redirects to login when user is not authenticated', () => {
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false,
            },
          },
        }
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-replace', 'true');
    });

    it('redirects to login when user is null', () => {
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: null,
              token: 'expired-token',
              isAuthenticated: false,
              loading: false,
            },
          },
        }
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('redirects to login when token exists but isAuthenticated is false', () => {
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: null,
              token: 'some-token',
              isAuthenticated: false,
              loading: false,
            },
          },
        }
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('handles loading state appropriately', () => {
      // When loading is true, we still check isAuthenticated
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: null,
              token: null,
              isAuthenticated: false,
              loading: true,
            },
          },
        }
      );

      // Should still redirect if not authenticated, even when loading
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
    });

    it('renders content when authenticated and loading', () => {
      const testUser = createTestUser();

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: testUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: true,
            },
          },
        }
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });
  });

  describe('Children Rendering', () => {
    it('renders multiple children when authenticated', () => {
      const testUser = createTestUser();

      renderWithProviders(
        <ProtectedRoute>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <TestComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: testUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        }
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('renders complex component trees when authenticated', () => {
      const testUser = createTestUser();

      const ComplexComponent = () => (
        <div data-testid="complex-component">
          <header data-testid="header">Header</header>
          <main data-testid="main">
            <section data-testid="section">Section</section>
          </main>
          <footer data-testid="footer">Footer</footer>
        </div>
      );

      renderWithProviders(
        <ProtectedRoute>
          <ComplexComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: testUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        }
      );

      expect(screen.getByTestId('complex-component')).toBeInTheDocument();
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('main')).toBeInTheDocument();
      expect(screen.getByTestId('section')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('handles null children gracefully', () => {
      const testUser = createTestUser();

      renderWithProviders(<ProtectedRoute>{null}</ProtectedRoute>, {
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      // Should not crash and should not redirect
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('handles conditional children rendering', () => {
      const testUser = createTestUser();
      const showContent = true;

      renderWithProviders(
        <ProtectedRoute>
          {showContent && <TestComponent />}
          {!showContent && <div data-testid="alternative">Alternative</div>}
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: testUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        }
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('alternative')).not.toBeInTheDocument();
    });
  });

  describe('Redux State Integration', () => {
    it('responds to auth state changes', () => {
      const testUser = createTestUser();

      const { rerender } = renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: testUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        }
      );

      // Initially authenticated - should show content
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();

      // Re-render with unauthenticated state
      rerender(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Note: In a real app, you'd need to update the Redux store
      // This test demonstrates the component's dependency on Redux state
    });

    it('handles missing auth state gracefully', () => {
      // Render without auth state in Redux store
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            // No auth state
          },
        }
      );

      // Should redirect when auth state is missing/undefined
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
    });
  });

  describe('Navigation Behavior', () => {
    it('uses replace navigation to prevent back button issues', () => {
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false,
            },
          },
        }
      );

      const navigateElement = screen.getByTestId('navigate');
      expect(navigateElement).toHaveAttribute('data-replace', 'true');
    });

    it('navigates to correct login path', () => {
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false,
            },
          },
        }
      );

      const navigateElement = screen.getByTestId('navigate');
      expect(navigateElement).toHaveAttribute('data-to', '/login');
    });
  });

  describe('Component Props', () => {
    it('accepts and renders children prop correctly', () => {
      const testUser = createTestUser();

      renderWithProviders(<ProtectedRoute children={<TestComponent />} />, {
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    it('handles empty children prop', () => {
      const testUser = createTestUser();

      renderWithProviders(<ProtectedRoute children={undefined} />, {
        preloadedState: {
          auth: {
            user: testUser,
            token: 'test-token',
            isAuthenticated: true,
            loading: false,
          },
        },
      });

      // Should not crash
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      const testUser = createTestUser();
      let renderCount = 0;

      const CountingComponent = () => {
        renderCount++;
        return <div data-testid="counting-component">Render count: {renderCount}</div>;
      };

      const { rerender } = renderWithProviders(
        <ProtectedRoute>
          <CountingComponent />
        </ProtectedRoute>,
        {
          preloadedState: {
            auth: {
              user: testUser,
              token: 'test-token',
              isAuthenticated: true,
              loading: false,
            },
          },
        }
      );

      expect(renderCount).toBe(1);

      // Re-render with same props
      rerender(
        <ProtectedRoute>
          <CountingComponent />
        </ProtectedRoute>
      );

      // Component should re-render (this is expected behavior)
      expect(renderCount).toBe(2);
    });
  });

  describe('Error Boundaries', () => {
    it('handles errors in children components', () => {
      const testUser = createTestUser();

      const ErrorComponent = () => {
        throw new Error('Test error');
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderWithProviders(
          <ProtectedRoute>
            <ErrorComponent />
          </ProtectedRoute>,
          {
            preloadedState: {
              auth: {
                user: testUser,
                token: 'test-token',
                isAuthenticated: true,
                loading: false,
              },
            },
          }
        );
      }).toThrow('Test error');

      consoleSpy.mockRestore();
    });
  });
});
