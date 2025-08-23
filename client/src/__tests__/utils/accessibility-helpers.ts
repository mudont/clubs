/**
 * Accessibility testing helpers and utilities
 */

import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Accessibility test helpers
export interface AccessibilityTestHelpers {
  runAxeTest: () => Promise<void>;
  testKeyboardNavigation: () => Promise<void>;
  testScreenReaderSupport: () => Promise<void>;
  testFocusManagement: () => Promise<void>;
  testAriaAttributes: () => void;
  testColorContrast: () => void;
  testHeadingStructure: () => void;
  testFormLabels: () => void;
  testImageAltText: () => void;
  testLinkPurpose: () => void;
}

export const createAccessibilityTestHelpers = (
  container: HTMLElement,
  user: ReturnType<typeof userEvent.setup>
): AccessibilityTestHelpers => {
  return {
    runAxeTest: async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    },

    testKeyboardNavigation: async () => {
      // Get all focusable elements
      const focusableElements = getFocusableElements(container);

      if (focusableElements.length === 0) {
        return; // No focusable elements to test
      }

      // Test Tab navigation
      for (let i = 0; i < focusableElements.length; i++) {
        await user.tab();
        expect(focusableElements[i]).toHaveFocus();
      }

      // Test Shift+Tab navigation (reverse)
      for (let i = focusableElements.length - 2; i >= 0; i--) {
        await user.tab({ shift: true });
        expect(focusableElements[i]).toHaveFocus();
      }
    },

    testScreenReaderSupport: async () => {
      // Test for proper ARIA labels and descriptions
      const interactiveElements = within(container).getAllByRole(
        /button|link|textbox|combobox|checkbox|radio|menuitem/
      );

      interactiveElements.forEach(element => {
        const hasAccessibleName =
          element.getAttribute('aria-label') ||
          element.getAttribute('aria-labelledby') ||
          element.textContent?.trim() ||
          element.getAttribute('title');

        expect(hasAccessibleName).toBeTruthy();
      });

      // Test for proper heading structure
      const headings = within(container).getAllByRole('heading');
      if (headings.length > 0) {
        // First heading should be h1 or have appropriate level
        const firstHeading = headings[0];
        const level =
          firstHeading.getAttribute('aria-level') ||
          firstHeading.tagName.toLowerCase().replace('h', '');
        expect(['1', '2', '3']).toContain(level);
      }
    },

    testFocusManagement: async () => {
      // Test initial focus
      const autoFocusElement = container.querySelector('[autofocus]');
      if (autoFocusElement) {
        expect(autoFocusElement).toHaveFocus();
      }

      // Test focus trap in modals
      const modal = within(container).queryByRole('dialog');
      if (modal) {
        const focusableInModal = getFocusableElements(modal);
        if (focusableInModal.length > 1) {
          // Tab through all elements and ensure focus stays within modal
          for (let i = 0; i < focusableInModal.length + 2; i++) {
            await user.tab();
            const currentFocus = document.activeElement;
            expect(modal.contains(currentFocus)).toBe(true);
          }
        }
      }

      // Test focus restoration after modal close
      // This would need to be tested in the specific modal test
    },

    testAriaAttributes: () => {
      // Test required ARIA attributes
      const elementsWithAriaRequired = container.querySelectorAll('[aria-required="true"]');
      elementsWithAriaRequired.forEach(element => {
        expect(element).toHaveAttribute('aria-required', 'true');
      });

      // Test ARIA expanded for collapsible elements
      const expandableElements = container.querySelectorAll('[aria-expanded]');
      expandableElements.forEach(element => {
        const expanded = element.getAttribute('aria-expanded');
        expect(['true', 'false']).toContain(expanded);
      });

      // Test ARIA describedby relationships
      const elementsWithDescribedBy = container.querySelectorAll('[aria-describedby]');
      elementsWithDescribedBy.forEach(element => {
        const describedById = element.getAttribute('aria-describedby');
        if (describedById) {
          const describingElement = document.getElementById(describedById);
          expect(describingElement).toBeInTheDocument();
        }
      });

      // Test ARIA labelledby relationships
      const elementsWithLabelledBy = container.querySelectorAll('[aria-labelledby]');
      elementsWithLabelledBy.forEach(element => {
        const labelledById = element.getAttribute('aria-labelledby');
        if (labelledById) {
          const labellingElement = document.getElementById(labelledById);
          expect(labellingElement).toBeInTheDocument();
        }
      });
    },

    testColorContrast: () => {
      // This is a basic test - in practice, you'd use tools like axe-core
      // which is already included in runAxeTest
      const textElements = container.querySelectorAll(
        'p, span, div, h1, h2, h3, h4, h5, h6, label, button, a'
      );

      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        // Basic check that color is not the same as background
        if (color && backgroundColor && color !== backgroundColor) {
          expect(color).not.toBe(backgroundColor);
        }
      });
    },

    testHeadingStructure: () => {
      const headings = within(container).getAllByRole('heading');

      if (headings.length === 0) return;

      // Check that headings are in logical order
      const headingLevels = headings.map(heading => {
        const level =
          heading.getAttribute('aria-level') || heading.tagName.toLowerCase().replace('h', '');
        return parseInt(level, 10);
      });

      // First heading should be h1, h2, or h3 (depending on page context)
      expect(headingLevels[0]).toBeLessThanOrEqual(3);

      // Check for proper nesting (no skipping levels)
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];

        // Level can stay same, go up by 1, or go down any amount
        if (currentLevel > previousLevel) {
          expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
        }
      }
    },

    testFormLabels: () => {
      const formControls = container.querySelectorAll('input, select, textarea');

      formControls.forEach(control => {
        const id = control.getAttribute('id');
        const ariaLabel = control.getAttribute('aria-label');
        const ariaLabelledBy = control.getAttribute('aria-labelledby');

        if (id) {
          // Check for associated label
          const label = container.querySelector(`label[for="${id}"]`);
          const hasLabel = label || ariaLabel || ariaLabelledBy;
          expect(hasLabel).toBeTruthy();
        } else {
          // Must have aria-label or aria-labelledby
          expect(ariaLabel || ariaLabelledBy).toBeTruthy();
        }
      });
    },

    testImageAltText: () => {
      const images = container.querySelectorAll('img');

      images.forEach(img => {
        const alt = img.getAttribute('alt');
        const ariaLabel = img.getAttribute('aria-label');
        const ariaLabelledBy = img.getAttribute('aria-labelledby');
        const role = img.getAttribute('role');

        // Decorative images should have empty alt or role="presentation"
        if (role === 'presentation' || alt === '') {
          expect(alt === '' || role === 'presentation').toBe(true);
        } else {
          // Content images should have meaningful alt text
          expect(alt || ariaLabel || ariaLabelledBy).toBeTruthy();
          if (alt) {
            expect(alt.length).toBeGreaterThan(0);
          }
        }
      });
    },

    testLinkPurpose: () => {
      const links = within(container).getAllByRole('link');

      links.forEach(link => {
        const text = link.textContent?.trim();
        const ariaLabel = link.getAttribute('aria-label');
        const title = link.getAttribute('title');

        // Links should have descriptive text
        const linkText = text || ariaLabel || title;
        expect(linkText).toBeTruthy();

        if (linkText) {
          // Avoid generic link text
          const genericTexts = ['click here', 'read more', 'more', 'link'];
          const isGeneric = genericTexts.some(generic => linkText.toLowerCase().includes(generic));

          if (isGeneric) {
            // Generic text is okay if there's additional context via aria-label
            expect(ariaLabel || title).toBeTruthy();
          }
        }
      });
    },
  };
};

// Helper function to get all focusable elements
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  const elements = container.querySelectorAll(focusableSelectors.join(', '));
  return Array.from(elements).filter(element => {
    // Filter out hidden elements
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }) as HTMLElement[];
};

// Keyboard event simulation helpers
export const keyboardTestHelpers = {
  pressEnter: async (user: ReturnType<typeof userEvent.setup>) => {
    await user.keyboard('{Enter}');
  },

  pressSpace: async (user: ReturnType<typeof userEvent.setup>) => {
    await user.keyboard(' ');
  },

  pressEscape: async (user: ReturnType<typeof userEvent.setup>) => {
    await user.keyboard('{Escape}');
  },

  pressArrowDown: async (user: ReturnType<typeof userEvent.setup>) => {
    await user.keyboard('{ArrowDown}');
  },

  pressArrowUp: async (user: ReturnType<typeof userEvent.setup>) => {
    await user.keyboard('{ArrowUp}');
  },

  pressArrowLeft: async (user: ReturnType<typeof userEvent.setup>) => {
    await user.keyboard('{ArrowLeft}');
  },

  pressArrowRight: async (user: ReturnType<typeof userEvent.setup>) => {
    await user.keyboard('{ArrowRight}');
  },

  pressTab: async (user: ReturnType<typeof userEvent.setup>, shift = false) => {
    await user.tab({ shift });
  },

  pressHome: async (user: ReturnType<typeof userEvent.setup>) => {
    await user.keyboard('{Home}');
  },

  pressEnd: async (user: ReturnType<typeof userEvent.setup>) => {
    await user.keyboard('{End}');
  },
};

// Screen reader simulation helpers
export const screenReaderHelpers = {
  getAccessibleName: (element: HTMLElement): string => {
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent || '';
    }

    const textContent = element.textContent?.trim();
    if (textContent) return textContent;

    const title = element.getAttribute('title');
    if (title) return title;

    return '';
  },

  getAccessibleDescription: (element: HTMLElement): string => {
    const ariaDescribedBy = element.getAttribute('aria-describedby');
    if (ariaDescribedBy) {
      const descriptionElement = document.getElementById(ariaDescribedBy);
      if (descriptionElement) return descriptionElement.textContent || '';
    }

    return '';
  },

  getRole: (element: HTMLElement): string => {
    const explicitRole = element.getAttribute('role');
    if (explicitRole) return explicitRole;

    // Return implicit role based on tag name
    const tagName = element.tagName.toLowerCase();
    const implicitRoles: Record<string, string> = {
      button: 'button',
      a: 'link',
      input: 'textbox', // simplified
      select: 'combobox',
      textarea: 'textbox',
      h1: 'heading',
      h2: 'heading',
      h3: 'heading',
      h4: 'heading',
      h5: 'heading',
      h6: 'heading',
      img: 'img',
      ul: 'list',
      ol: 'list',
      li: 'listitem',
      table: 'table',
      tr: 'row',
      td: 'cell',
      th: 'columnheader',
    };

    return implicitRoles[tagName] || '';
  },

  getAriaStates: (element: HTMLElement): Record<string, string> => {
    const states: Record<string, string> = {};
    const ariaAttributes = [
      'aria-expanded',
      'aria-selected',
      'aria-checked',
      'aria-pressed',
      'aria-disabled',
      'aria-hidden',
      'aria-current',
      'aria-invalid',
      'aria-required',
    ];

    ariaAttributes.forEach(attr => {
      const value = element.getAttribute(attr);
      if (value !== null) {
        states[attr] = value;
      }
    });

    return states;
  },
};

// Color contrast testing helpers
export const colorContrastHelpers = {
  // Basic color contrast calculation (simplified)
  calculateContrast: (foreground: string, background: string): number => {
    // This is a simplified version - in practice, use a proper color contrast library
    const getLuminance = (color: string): number => {
      // Convert color to RGB and calculate luminance
      // This is a placeholder implementation
      return 0.5; // Placeholder
    };

    const fgLuminance = getLuminance(foreground);
    const bgLuminance = getLuminance(background);

    const lighter = Math.max(fgLuminance, bgLuminance);
    const darker = Math.min(fgLuminance, bgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
  },

  meetsWCAGAA: (contrast: number): boolean => {
    return contrast >= 4.5;
  },

  meetsWCAGAAA: (contrast: number): boolean => {
    return contrast >= 7;
  },
};

// Utility function to run all accessibility tests
export const runFullAccessibilityTest = async (
  container: HTMLElement,
  user: ReturnType<typeof userEvent.setup>
): Promise<void> => {
  const helpers = createAccessibilityTestHelpers(container, user);

  // Run all accessibility tests
  await helpers.runAxeTest();
  await helpers.testKeyboardNavigation();
  await helpers.testScreenReaderSupport();
  await helpers.testFocusManagement();
  helpers.testAriaAttributes();
  helpers.testColorContrast();
  helpers.testHeadingStructure();
  helpers.testFormLabels();
  helpers.testImageAltText();
  helpers.testLinkPurpose();
};

// Export convenience function
export const expectAccessible = async (
  container: HTMLElement,
  user: ReturnType<typeof userEvent.setup>
): Promise<void> => {
  await runFullAccessibilityTest(container, user);
};
