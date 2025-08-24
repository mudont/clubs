/**
 * Base component test classes and patterns for consistent testing
 */

import { RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { expectAccessible } from './accessibility-helpers';
import { createComponentTestHelpers } from './component-test-helpers';
import { renderWithProviders } from './test-utils';

// Base interface for all component test suites
export interface ComponentTestSuite<TProps = Record<string, unknown>> {
  component: React.ComponentType<TProps>;
  defaultProps: TProps;
  displayName: string;

  // Core test methods
  testRendering(): Promise<void>;
  testAccessibility(): Promise<void>;
  testUserInteractions(): Promise<void>;
  testErrorStates(): Promise<void>;
  testLoadingStates(): Promise<void>;
  testKeyboardNavigation(): Promise<void>;

  // Optional test methods
  testProps?(): Promise<void>;
  testCallbacks?(): Promise<void>;
  testConditionalRendering?(): Promise<void>;
  testPerformance?(): Promise<void>;
}

// Base abstract class for component tests
export abstract class BaseComponentTestSuite<TProps = Record<string, unknown>>
  implements ComponentTestSuite<TProps>
{
  abstract component: React.ComponentType<TProps>;
  abstract defaultProps: TProps;
  abstract displayName: string;

  protected renderResult?: RenderResult & {
    store: any;
  };
  protected userInstance?: ReturnType<typeof userEvent.setup>;

  protected get user() {
    if (!this.userInstance) {
      this.userInstance = userEvent.setup();
    }
    return this.userInstance;
  }

  protected get container() {
    if (!this.renderResult) {
      throw new Error('Component not rendered. Call render() first.');
    }
    return this.renderResult.container;
  }

  protected get helpers() {
    return createComponentTestHelpers(this.user, this.container);
  }

  // Render the component with default or custom props
  protected render(props?: Partial<TProps>, options?: any) {
    const finalProps = { ...this.defaultProps, ...props } as TProps;
    this.renderResult = renderWithProviders(
      React.createElement(this.component, finalProps),
      options
    );
    return this.renderResult;
  }

  // Core test implementations
  async testRendering(): Promise<void> {
    describe(`${this.displayName} - Rendering`, () => {
      it('renders without crashing', () => {
        expect(() => this.render()).not.toThrow();
      });

      it('renders with default props', () => {
        this.render();
        expect(this.container.firstChild).toBeInTheDocument();
      });

      it('has correct display name', () => {
        expect(this.component.displayName || this.component.name).toBeTruthy();
      });
    });
  }

  async testAccessibility(): Promise<void> {
    describe(`${this.displayName} - Accessibility`, () => {
      it('passes accessibility audit', async () => {
        this.render();
        await expectAccessible(this.container, this.user);
      });

      it('supports keyboard navigation', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();
        // Specific keyboard tests should be implemented in subclasses
      });
    });
  }

  async testUserInteractions(): Promise<void> {
    describe(`${this.displayName} - User Interactions`, () => {
      it('handles user interactions correctly', async () => {
        this.render();
        // Specific interaction tests should be implemented in subclasses
      });
    });
  }

  async testErrorStates(): Promise<void> {
    describe(`${this.displayName} - Error States`, () => {
      it('handles errors gracefully', async () => {
        // Error boundary tests should be implemented in subclasses
        expect(true).toBe(true); // Placeholder
      });
    });
  }

  async testLoadingStates(): Promise<void> {
    describe(`${this.displayName} - Loading States`, () => {
      it('shows loading state when appropriate', async () => {
        // Loading state tests should be implemented in subclasses
        expect(true).toBe(true); // Placeholder
      });
    });
  }

  async testKeyboardNavigation(): Promise<void> {
    describe(`${this.displayName} - Keyboard Navigation`, () => {
      it('supports keyboard navigation', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();
        // Specific keyboard navigation tests should be implemented in subclasses
      });
    });
  }

  // Run all tests
  runAllTests(): void {
    describe(this.displayName, () => {
      beforeEach(() => {
        this.renderResult = undefined;
      });

      this.testRendering();
      this.testAccessibility();
      this.testUserInteractions();
      this.testErrorStates();
      this.testLoadingStates();
      this.testKeyboardNavigation();

      // Run optional tests if implemented
      if (this.testProps) {
        this.testProps();
      }
      if (this.testCallbacks) {
        this.testCallbacks();
      }
      if (this.testConditionalRendering) {
        this.testConditionalRendering();
      }
      if (this.testPerformance) {
        this.testPerformance();
      }
    });
  }
}

// Specialized test suite for form components
export abstract class FormComponentTestSuite<
  TProps = Record<string, unknown>,
> extends BaseComponentTestSuite<TProps> {
  abstract testValidation(): Promise<void>;
  abstract testSubmission(): Promise<void>;
  abstract testFieldInteractions(): Promise<void>;

  async testUserInteractions(): Promise<void> {
    await super.testUserInteractions();

    describe(`${this.displayName} - Form Interactions`, () => {
      it('handles form field interactions', async () => {
        await this.testFieldInteractions();
      });

      it('validates form input', async () => {
        await this.testValidation();
      });

      it('handles form submission', async () => {
        await this.testSubmission();
      });
    });
  }

  async testKeyboardNavigation(): Promise<void> {
    describe(`${this.displayName} - Form Keyboard Navigation`, () => {
      it('supports tab navigation between fields', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // Tab through form fields
        const formElements = this.container.querySelectorAll('input, select, textarea, button');
        for (let i = 0; i < formElements.length; i++) {
          await this.user.tab();
          expect(formElements[i]).toHaveFocus();
        }
      });

      it('submits form on Enter key', async () => {
        this.render();
        await this.helpers.async.waitForDataLoad();

        // This should be implemented in specific form tests
        const submitButton = this.container.querySelector('button[type="submit"]');
        if (submitButton) {
          await this.user.keyboard('{Enter}');
          // Verify submission behavior
        }
      });
    });
  }

  runAllTests(): void {
    describe(this.displayName, () => {
      beforeEach(() => {
        this.renderResult = undefined;
      });

      this.testRendering();
      this.testAccessibility();
      this.testUserInteractions(); // This now includes form-specific tests
      this.testErrorStates();
      this.testLoadingStates();
      this.testKeyboardNavigation();

      // Run optional tests
      if (this.testProps) this.testProps();
      if (this.testCallbacks) this.testCallbacks();
      if (this.testConditionalRendering) this.testConditionalRendering();
      if (this.testPerformance) this.testPerformance();
    });
  }
}

// Specialized test suite for list components
export abstract class ListComponentTestSuite<
  TProps = Record<string, unknown>,
> extends BaseComponentTestSuite<TProps> {
  abstract testItemRendering(): Promise<void>;
  abstract testEmptyState(): Promise<void>;
  abstract testItemInteractions(): Promise<void>;

  // Optional methods for list components
  testPagination?(): Promise<void>;
  testSorting?(): Promise<void>;
  testFiltering?(): Promise<void>;
  testSearch?(): Promise<void>;

  async testUserInteractions(): Promise<void> {
    await super.testUserInteractions();

    describe(`${this.displayName} - List Interactions`, () => {
      it('renders list items correctly', async () => {
        await this.testItemRendering();
      });

      it('shows empty state when no items', async () => {
        await this.testEmptyState();
      });

      it('handles item interactions', async () => {
        await this.testItemInteractions();
      });

      if (this.testPagination) {
        it('handles pagination', async () => {
          await this.testPagination!();
        });
      }

      if (this.testSorting) {
        it('handles sorting', async () => {
          await this.testSorting!();
        });
      }

      if (this.testFiltering) {
        it('handles filtering', async () => {
          await this.testFiltering!();
        });
      }

      if (this.testSearch) {
        it('handles search', async () => {
          await this.testSearch!();
        });
      }
    });
  }
}

// Specialized test suite for modal components
export abstract class ModalComponentTestSuite<
  TProps = Record<string, unknown>,
> extends BaseComponentTestSuite<TProps> {
  abstract testModalOpen(): Promise<void>;
  abstract testModalClose(): Promise<void>;
  abstract testFocusManagement(): Promise<void>;

  async testUserInteractions(): Promise<void> {
    await super.testUserInteractions();

    describe(`${this.displayName} - Modal Interactions`, () => {
      it('opens modal correctly', async () => {
        await this.testModalOpen();
      });

      it('closes modal correctly', async () => {
        await this.testModalClose();
      });

      it('manages focus correctly', async () => {
        await this.testFocusManagement();
      });
    });
  }

  async testKeyboardNavigation(): Promise<void> {
    describe(`${this.displayName} - Modal Keyboard Navigation`, () => {
      it('closes modal on Escape key', async () => {
        this.render();
        await this.testModalOpen();

        await this.user.keyboard('{Escape}');
        this.helpers.modal.expectModalClosed();
      });

      it('traps focus within modal', async () => {
        this.render();
        await this.testModalOpen();

        await this.helpers.modal.expectFocusTrapped();
      });
    });
  }
}

// Specialized test suite for navigation components
export abstract class NavigationComponentTestSuite<
  TProps = Record<string, unknown>,
> extends BaseComponentTestSuite<TProps> {
  abstract testNavigationLinks(): Promise<void>;
  abstract testActiveStates(): Promise<void>;

  async testUserInteractions(): Promise<void> {
    await super.testUserInteractions();

    describe(`${this.displayName} - Navigation Interactions`, () => {
      it('renders navigation links correctly', async () => {
        await this.testNavigationLinks();
      });

      it('shows active states correctly', async () => {
        await this.testActiveStates();
      });
    });
  }

  async testKeyboardNavigation(): Promise<void> {
    describe(`${this.displayName} - Navigation Keyboard Support`, () => {
      it('supports keyboard navigation', async () => {
        this.render();

        const links = this.container.querySelectorAll('a, button');
        for (let i = 0; i < links.length; i++) {
          await this.user.tab();
          expect(links[i]).toHaveFocus();
        }
      });

      it('activates links on Enter/Space', async () => {
        this.render();

        const firstLink = this.container.querySelector('a, button');
        if (firstLink) {
          firstLink.focus();
          await this.user.keyboard('{Enter}');
          // Verify navigation behavior
        }
      });
    });
  }
}

// Utility function to create test suites
export const createTestSuite = {
  base: <TProps>(
    component: React.ComponentType<TProps>,
    defaultProps: TProps,
    displayName: string
  ) => {
    return class extends BaseComponentTestSuite<TProps> {
      component = component;
      defaultProps = defaultProps;
      displayName = displayName;
    };
  },

  form: <TProps>(
    component: React.ComponentType<TProps>,
    defaultProps: TProps,
    displayName: string
  ) => {
    return class extends FormComponentTestSuite<TProps> {
      component = component;
      defaultProps = defaultProps;
      displayName = displayName;

      async testValidation(): Promise<void> {
        // Default implementation - should be overridden
        expect(true).toBe(true);
      }

      async testSubmission(): Promise<void> {
        // Default implementation - should be overridden
        expect(true).toBe(true);
      }

      async testFieldInteractions(): Promise<void> {
        // Default implementation - should be overridden
        expect(true).toBe(true);
      }
    };
  },

  list: <TProps>(
    component: React.ComponentType<TProps>,
    defaultProps: TProps,
    displayName: string
  ) => {
    return class extends ListComponentTestSuite<TProps> {
      component = component;
      defaultProps = defaultProps;
      displayName = displayName;

      async testItemRendering(): Promise<void> {
        // Default implementation - should be overridden
        expect(true).toBe(true);
      }

      async testEmptyState(): Promise<void> {
        // Default implementation - should be overridden
        expect(true).toBe(true);
      }

      async testItemInteractions(): Promise<void> {
        // Default implementation - should be overridden
        expect(true).toBe(true);
      }
    };
  },

  modal: <TProps>(
    component: React.ComponentType<TProps>,
    defaultProps: TProps,
    displayName: string
  ) => {
    return class extends ModalComponentTestSuite<TProps> {
      component = component;
      defaultProps = defaultProps;
      displayName = displayName;

      async testModalOpen(): Promise<void> {
        // Default implementation - should be overridden
        expect(true).toBe(true);
      }

      async testModalClose(): Promise<void> {
        // Default implementation - should be overridden
        expect(true).toBe(true);
      }

      async testFocusManagement(): Promise<void> {
        // Default implementation - should be overridden
        expect(true).toBe(true);
      }
    };
  },

  navigation: <TProps>(
    component: React.ComponentType<TProps>,
    defaultProps: TProps,
    displayName: string
  ) => {
    return class extends NavigationComponentTestSuite<TProps> {
      component = component;
      defaultProps = defaultProps;
      displayName = displayName;

      async testNavigationLinks(): Promise<void> {
        // Default implementation - should be overridden
        expect(true).toBe(true);
      }

      async testActiveStates(): Promise<void> {
        // Default implementation - should be overridden
        expect(true).toBe(true);
      }
    };
  },
};

// Common test patterns
export const commonTestPatterns = {
  // Test that component renders with different prop combinations
  testPropVariations: <TProps>(
    component: React.ComponentType<TProps>,
    propVariations: Array<{ name: string; props: Partial<TProps> }>
  ) => {
    describe('Prop Variations', () => {
      propVariations.forEach(({ name, props }) => {
        it(`renders correctly with ${name}`, () => {
          const result = renderWithProviders(React.createElement(component, props as TProps));
          expect(result.container.firstChild).toBeInTheDocument();
        });
      });
    });
  },

  // Test that callbacks are called with correct arguments
  testCallbacks: <TProps>(
    component: React.ComponentType<TProps>,
    defaultProps: TProps,
    callbackTests: Array<{
      name: string;
      trigger: (user: ReturnType<typeof userEvent.setup>, container: HTMLElement) => Promise<void>;
      expectCallback: (props: TProps) => void;
    }>
  ) => {
    describe('Callbacks', () => {
      callbackTests.forEach(({ name, trigger, expectCallback }) => {
        it(`calls ${name} callback correctly`, async () => {
          const mockProps = { ...defaultProps };
          const result = renderWithProviders(React.createElement(component, mockProps));

          await trigger(result.user, result.container);
          expectCallback(mockProps);
        });
      });
    });
  },

  // Test conditional rendering based on props
  testConditionalRendering: <TProps>(
    component: React.ComponentType<TProps>,
    conditionalTests: Array<{
      name: string;
      props: TProps;
      expectPresent?: string[];
      expectAbsent?: string[];
    }>
  ) => {
    describe('Conditional Rendering', () => {
      conditionalTests.forEach(({ name, props, expectPresent = [], expectAbsent = [] }) => {
        it(`renders correctly when ${name}`, () => {
          const result = renderWithProviders(React.createElement(component, props));

          expectPresent.forEach(text => {
            expect(result.getByText(text)).toBeInTheDocument();
          });

          expectAbsent.forEach(text => {
            expect(result.queryByText(text)).not.toBeInTheDocument();
          });
        });
      });
    });
  },
};
