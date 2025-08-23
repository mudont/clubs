/**
 * Specialized testing utilities for different component types
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Form testing utilities
export interface FormTestHelpers {
  fillField: (fieldName: string, value: string) => Promise<void>;
  fillForm: (formData: Record<string, string>) => Promise<void>;
  submitForm: () => Promise<void>;
  expectValidationError: (fieldName: string, errorMessage: string | RegExp) => Promise<void>;
  expectFormSubmission: () => Promise<void>;
  expectFormReset: () => Promise<void>;
}

export const createFormTestHelpers = (
  user: ReturnType<typeof userEvent.setup>,
  container?: HTMLElement
): FormTestHelpers => {
  const getField = (fieldName: string): HTMLElement => {
    const field = container
      ? within(container).getByRole('textbox', { name: new RegExp(fieldName, 'i') }) ||
        within(container).getByLabelText(new RegExp(fieldName, 'i'))
      : screen.getByRole('textbox', { name: new RegExp(fieldName, 'i') }) ||
        screen.getByLabelText(new RegExp(fieldName, 'i'));

    if (!field) {
      throw new Error(`Field with name "${fieldName}" not found`);
    }
    return field;
  };

  const getSubmitButton = (): HTMLElement => {
    const button = container
      ? within(container).getByRole('button', {
          name: /submit|save|create|update|sign in|sign up/i,
        })
      : screen.getByRole('button', { name: /submit|save|create|update|sign in|sign up/i });

    if (!button) {
      throw new Error('Submit button not found');
    }
    return button;
  };

  return {
    fillField: async (fieldName: string, value: string) => {
      const field = getField(fieldName);
      await user.clear(field);
      await user.type(field, value);
    },

    fillForm: async (formData: Record<string, string>) => {
      for (const [fieldName, value] of Object.entries(formData)) {
        await user.clear(getField(fieldName));
        await user.type(getField(fieldName), value);
      }
    },

    submitForm: async () => {
      const submitButton = getSubmitButton();
      await user.click(submitButton);
    },

    expectValidationError: async (fieldName: string, errorMessage: string | RegExp) => {
      await waitFor(() => {
        const errorElement = container
          ? within(container).getByText(errorMessage)
          : screen.getByText(errorMessage);
        expect(errorElement).toBeInTheDocument();
      });
    },

    expectFormSubmission: async () => {
      await waitFor(() => {
        const submitButton = getSubmitButton();
        expect(submitButton).toBeDisabled();
      });
    },

    expectFormReset: async () => {
      await waitFor(() => {
        // Check that form fields are cleared or reset to default values
        const form = container?.querySelector('form') || document.querySelector('form');
        if (form) {
          const inputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
          inputs.forEach(input => {
            expect((input as HTMLInputElement).value).toBe('');
          });
        }
      });
    },
  };
};

// List component testing utilities
export interface ListTestHelpers {
  expectItemCount: (count: number) => void;
  expectEmptyState: (message?: string | RegExp) => void;
  expectLoadingState: () => void;
  clickItem: (itemIndex: number) => Promise<void>;
  clickItemAction: (itemIndex: number, actionName: string | RegExp) => Promise<void>;
  searchList: (query: string) => Promise<void>;
  sortList: (sortBy: string) => Promise<void>;
  filterList: (filterBy: string, value: string) => Promise<void>;
  expectPagination: (currentPage: number, totalPages: number) => void;
  goToPage: (page: number) => Promise<void>;
}

export const createListTestHelpers = (
  user: ReturnType<typeof userEvent.setup>,
  container?: HTMLElement
): ListTestHelpers => {
  const getListContainer = () => {
    return container || document.body;
  };

  const getListItems = () => {
    const listContainer = getListContainer();
    return within(listContainer).getAllByRole('listitem').length > 0
      ? within(listContainer).getAllByRole('listitem')
      : within(listContainer).getAllByTestId(/item|card/i);
  };

  return {
    expectItemCount: (count: number) => {
      if (count === 0) {
        expect(() => getListItems()).toThrow();
      } else {
        const items = getListItems();
        expect(items).toHaveLength(count);
      }
    },

    expectEmptyState: (message = /no.*found|empty|nothing/i) => {
      const listContainer = getListContainer();
      expect(within(listContainer).getByText(message)).toBeInTheDocument();
    },

    expectLoadingState: () => {
      const listContainer = getListContainer();
      expect(
        within(listContainer).getByText(/loading|spinner/i) ||
          within(listContainer).getByRole('progressbar')
      ).toBeInTheDocument();
    },

    clickItem: async (itemIndex: number) => {
      const items = getListItems();
      await user.click(items[itemIndex]);
    },

    clickItemAction: async (itemIndex: number, actionName: string | RegExp) => {
      const items = getListItems();
      const actionButton = within(items[itemIndex]).getByRole('button', { name: actionName });
      await user.click(actionButton);
    },

    searchList: async (query: string) => {
      const listContainer = getListContainer();
      const searchInput =
        within(listContainer).getByRole('searchbox') ||
        within(listContainer).getByPlaceholderText(/search/i);
      await user.clear(searchInput);
      await user.type(searchInput, query);
    },

    sortList: async (sortBy: string) => {
      const listContainer = getListContainer();
      const sortSelect =
        within(listContainer).getByRole('combobox', { name: /sort/i }) ||
        within(listContainer).getByLabelText(/sort/i);
      await user.selectOptions(sortSelect, sortBy);
    },

    filterList: async (filterBy: string, value: string) => {
      const listContainer = getListContainer();
      const filterSelect =
        within(listContainer).getByRole('combobox', { name: new RegExp(filterBy, 'i') }) ||
        within(listContainer).getByLabelText(new RegExp(filterBy, 'i'));
      await user.selectOptions(filterSelect, value);
    },

    expectPagination: (currentPage: number, totalPages: number) => {
      const listContainer = getListContainer();
      expect(
        within(listContainer).getByText(`Page ${currentPage} of ${totalPages}`)
      ).toBeInTheDocument();
    },

    goToPage: async (page: number) => {
      const listContainer = getListContainer();
      const pageButton = within(listContainer).getByRole('button', { name: page.toString() });
      await user.click(pageButton);
    },
  };
};

// Modal testing utilities
export interface ModalTestHelpers {
  expectModalOpen: (title?: string | RegExp) => void;
  expectModalClosed: () => void;
  closeModal: () => Promise<void>;
  closeModalWithEscape: () => Promise<void>;
  closeModalWithBackdrop: () => Promise<void>;
  expectFocusTrapped: () => Promise<void>;
  expectInitialFocus: (elementRole: string, elementName?: string | RegExp) => void;
}

export const createModalTestHelpers = (
  user: ReturnType<typeof userEvent.setup>
): ModalTestHelpers => {
  return {
    expectModalOpen: (title?: string | RegExp) => {
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
      expect(modal).toBeVisible();

      if (title) {
        expect(within(modal).getByText(title)).toBeInTheDocument();
      }
    },

    expectModalClosed: () => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    },

    closeModal: async () => {
      const closeButton = screen.getByRole('button', { name: /close|cancel|×/i });
      await user.click(closeButton);
    },

    closeModalWithEscape: async () => {
      await user.keyboard('{Escape}');
    },

    closeModalWithBackdrop: async () => {
      const modal = screen.getByRole('dialog');
      const backdrop = modal.parentElement;
      if (backdrop) {
        await user.click(backdrop);
      }
    },

    expectFocusTrapped: async () => {
      const modal = screen.getByRole('dialog');
      const focusableElements = within(modal)
        .getAllByRole('button')
        .concat(within(modal).getAllByRole('textbox'), within(modal).getAllByRole('link'));

      if (focusableElements.length > 1) {
        // Tab through all elements and expect focus to cycle back
        for (let i = 0; i < focusableElements.length + 1; i++) {
          await user.tab();
        }
        expect(focusableElements[0]).toHaveFocus();
      }
    },

    expectInitialFocus: (elementRole: string, elementName?: string | RegExp) => {
      const modal = screen.getByRole('dialog');
      const focusedElement = elementName
        ? within(modal).getByRole(elementRole as any, { name: elementName })
        : within(modal).getByRole(elementRole as any);
      expect(focusedElement).toHaveFocus();
    },
  };
};

// Navigation testing utilities
export interface NavigationTestHelpers {
  expectCurrentRoute: (path: string) => void;
  navigateToRoute: (path: string) => Promise<void>;
  clickNavLink: (linkName: string | RegExp) => Promise<void>;
  expectActiveNavLink: (linkName: string | RegExp) => void;
  expectBreadcrumbs: (breadcrumbs: string[]) => void;
  goBack: () => Promise<void>;
  goForward: () => Promise<void>;
}

export const createNavigationTestHelpers = (
  user: ReturnType<typeof userEvent.setup>
): NavigationTestHelpers => {
  return {
    expectCurrentRoute: (path: string) => {
      expect(window.location.pathname).toBe(path);
    },

    navigateToRoute: async (path: string) => {
      // This would typically be handled by the router in tests
      window.history.pushState({}, '', path);
    },

    clickNavLink: async (linkName: string | RegExp) => {
      const link = screen.getByRole('link', { name: linkName });
      await user.click(link);
    },

    expectActiveNavLink: (linkName: string | RegExp) => {
      const link = screen.getByRole('link', { name: linkName });
      expect(link).toHaveAttribute('aria-current', 'page');
    },

    expectBreadcrumbs: (breadcrumbs: string[]) => {
      const breadcrumbNav = screen.getByRole('navigation', { name: /breadcrumb/i });
      breadcrumbs.forEach(breadcrumb => {
        expect(within(breadcrumbNav).getByText(breadcrumb)).toBeInTheDocument();
      });
    },

    goBack: async () => {
      const backButton = screen.getByRole('button', { name: /back|previous/i });
      await user.click(backButton);
    },

    goForward: async () => {
      const forwardButton = screen.getByRole('button', { name: /forward|next/i });
      await user.click(forwardButton);
    },
  };
};

// Table testing utilities
export interface TableTestHelpers {
  expectRowCount: (count: number) => void;
  expectColumnHeaders: (headers: string[]) => void;
  expectCellValue: (row: number, column: number, value: string | RegExp) => void;
  sortByColumn: (columnName: string | RegExp) => Promise<void>;
  selectRow: (rowIndex: number) => Promise<void>;
  selectAllRows: () => Promise<void>;
  expectSelectedRowCount: (count: number) => void;
  clickRowAction: (rowIndex: number, actionName: string | RegExp) => Promise<void>;
}

export const createTableTestHelpers = (
  user: ReturnType<typeof userEvent.setup>,
  container?: HTMLElement
): TableTestHelpers => {
  const getTable = () => {
    return container ? within(container).getByRole('table') : screen.getByRole('table');
  };

  const getRows = () => {
    const table = getTable();
    return within(table).getAllByRole('row').slice(1); // Exclude header row
  };

  const getHeaderRow = () => {
    const table = getTable();
    return within(table).getAllByRole('row')[0];
  };

  return {
    expectRowCount: (count: number) => {
      const rows = getRows();
      expect(rows).toHaveLength(count);
    },

    expectColumnHeaders: (headers: string[]) => {
      const headerRow = getHeaderRow();
      const headerCells = within(headerRow).getAllByRole('columnheader');

      headers.forEach((header, index) => {
        expect(headerCells[index]).toHaveTextContent(header);
      });
    },

    expectCellValue: (row: number, column: number, value: string | RegExp) => {
      const rows = getRows();
      const cells = within(rows[row]).getAllByRole('cell');
      expect(cells[column]).toHaveTextContent(value);
    },

    sortByColumn: async (columnName: string | RegExp) => {
      const headerRow = getHeaderRow();
      const sortButton = within(headerRow).getByRole('button', { name: columnName });
      await user.click(sortButton);
    },

    selectRow: async (rowIndex: number) => {
      const rows = getRows();
      const checkbox = within(rows[rowIndex]).getByRole('checkbox');
      await user.click(checkbox);
    },

    selectAllRows: async () => {
      const headerRow = getHeaderRow();
      const selectAllCheckbox = within(headerRow).getByRole('checkbox');
      await user.click(selectAllCheckbox);
    },

    expectSelectedRowCount: (count: number) => {
      const table = getTable();
      const selectedCheckboxes = within(table).getAllByRole('checkbox', { checked: true });
      expect(selectedCheckboxes).toHaveLength(count);
    },

    clickRowAction: async (rowIndex: number, actionName: string | RegExp) => {
      const rows = getRows();
      const actionButton = within(rows[rowIndex]).getByRole('button', { name: actionName });
      await user.click(actionButton);
    },
  };
};

// Async component testing utilities
export interface AsyncTestHelpers {
  waitForDataLoad: () => Promise<void>;
  expectLoadingState: () => void;
  expectErrorState: (errorMessage?: string | RegExp) => void;
  expectSuccessState: () => void;
  retryFailedRequest: () => Promise<void>;
  expectRefreshButton: () => void;
  refreshData: () => Promise<void>;
}

export const createAsyncTestHelpers = (container?: HTMLElement): AsyncTestHelpers => {
  const getContainer = () => container || document.body;

  return {
    waitForDataLoad: async () => {
      await waitFor(() => {
        const loadingElement =
          within(getContainer()).queryByText(/loading/i) ||
          within(getContainer()).queryByRole('progressbar');
        expect(loadingElement).not.toBeInTheDocument();
      });
    },

    expectLoadingState: () => {
      const loadingElement =
        within(getContainer()).getByText(/loading/i) ||
        within(getContainer()).getByRole('progressbar');
      expect(loadingElement).toBeInTheDocument();
    },

    expectErrorState: (errorMessage = /error|failed|something went wrong/i) => {
      const errorElement = within(getContainer()).getByText(errorMessage);
      expect(errorElement).toBeInTheDocument();
    },

    expectSuccessState: () => {
      const errorElement = within(getContainer()).queryByText(/error|failed/i);
      const loadingElement = within(getContainer()).queryByText(/loading/i);
      expect(errorElement).not.toBeInTheDocument();
      expect(loadingElement).not.toBeInTheDocument();
    },

    retryFailedRequest: async () => {
      const retryButton = within(getContainer()).getByRole('button', { name: /retry|try again/i });
      await userEvent.setup().click(retryButton);
    },

    expectRefreshButton: () => {
      const refreshButton = within(getContainer()).getByRole('button', { name: /refresh|reload/i });
      expect(refreshButton).toBeInTheDocument();
    },

    refreshData: async () => {
      const refreshButton = within(getContainer()).getByRole('button', { name: /refresh|reload/i });
      await userEvent.setup().click(refreshButton);
    },
  };
};

// Utility to create all helpers at once
export const createComponentTestHelpers = (
  user: ReturnType<typeof userEvent.setup>,
  container?: HTMLElement
) => ({
  form: createFormTestHelpers(user, container),
  list: createListTestHelpers(user, container),
  modal: createModalTestHelpers(user),
  navigation: createNavigationTestHelpers(user),
  table: createTableTestHelpers(user, container),
  async: createAsyncTestHelpers(container),
});
