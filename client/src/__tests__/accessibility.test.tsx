import { MockedProvider } from '@apollo/client/testing';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import ErrorBoundary from '../components/common/ErrorBoundary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import GroupCard from '../components/groups/GroupCard';
import { store } from '../store';

// Mock data
const mockGroup = {
  id: '1',
  name: 'Test Group',
  description: 'A test group for accessibility testing',
  createdAt: '2023-01-01',
  memberships: [
    {
      id: '1',
      isAdmin: true,
      memberId: 1,
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      },
    },
  ],
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <Provider store={store}>
      <MockedProvider mocks={[]} addTypename={false}>
        {children}
      </MockedProvider>
    </Provider>
  </BrowserRouter>
);

describe('Accessibility Tests', () => {
  describe('ErrorBoundary Component', () => {
    it('should render accessible content in normal state', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should render accessible error state with proper ARIA attributes', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Check for proper ARIA attributes
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should have proper heading structure', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Check heading hierarchy
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Oops! Something went wrong');

      consoleSpy.mockRestore();
    });
  });

  describe('LoadingSpinner Component', () => {
    it('should render with proper accessibility attributes', () => {
      render(<LoadingSpinner message="Loading test content..." />);

      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('aria-live', 'polite');

      // Check screen reader only text
      expect(screen.getByText('Loading test content...', { selector: '.sr-only' })).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<LoadingSpinner message="Loading test content..." />);

      const statusElement = screen.getByRole('status');
      expect(statusElement).toBeInTheDocument();
      expect(statusElement).toHaveAttribute('aria-live', 'polite');

      // Check screen reader only text
      expect(screen.getByText('Loading test content...', { selector: '.sr-only' })).toBeInTheDocument();
    });

    it('should handle different sizes correctly', () => {
      render(<LoadingSpinner size="small" message="Small spinner" />);
      expect(screen.getByRole('status')).toBeInTheDocument();

      render(<LoadingSpinner size="large" message="Large spinner" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('GroupCard Component', () => {
    it('should render with proper accessibility structure', () => {
      render(
        <TestWrapper>
          <GroupCard group={mockGroup} />
        </TestWrapper>
      );

      const article = screen.getByRole('gridcell');
      expect(article).toBeInTheDocument();

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();

      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <GroupCard group={mockGroup} />
        </TestWrapper>
      );

      const article = screen.getByRole('gridcell');
      expect(article).toHaveAttribute('aria-labelledby', `group-title-${mockGroup.id}`);
      expect(article).toHaveAttribute('aria-describedby', `group-description-${mockGroup.id}`);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveAttribute('id', `group-title-${mockGroup.id}`);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-label', `View details for ${mockGroup.name} group`);
    });

    it('should handle group without description', () => {
      const groupWithoutDescription = {
        ...mockGroup,
        description: undefined,
      };

      render(
        <TestWrapper>
          <GroupCard group={groupWithoutDescription} />
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent(mockGroup.name);
    });

    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <GroupCard group={mockGroup} />
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent(mockGroup.name);
    });

    it('should provide meaningful member count information', () => {
      render(
        <TestWrapper>
          <GroupCard group={mockGroup} />
        </TestWrapper>
      );

      const memberCount = screen.getByLabelText(/1 members in this group/i);
      expect(memberCount).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for interactive elements', () => {
      render(
        <TestWrapper>
          <GroupCard group={mockGroup} />
        </TestWrapper>
      );

      const link = screen.getByRole('link');

      // Test that link is focusable
      link.focus();
      expect(link).toHaveFocus();
    });

    it('should have visible focus indicators', () => {
      render(
        <TestWrapper>
          <GroupCard group={mockGroup} />
        </TestWrapper>
      );

      const link = screen.getByRole('link');
      link.focus();

      // Check that focused element has proper styling
      expect(link).toHaveClass('btn-view');
    });
  });

  describe('Visual Accessibility', () => {
    it('should render elements with proper structure', () => {
      render(
        <TestWrapper>
          <GroupCard group={mockGroup} />
        </TestWrapper>
      );

      // Check that all required elements are present
      expect(screen.getByRole('gridcell')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should provide descriptive text for screen readers', () => {
      render(
        <TestWrapper>
          <GroupCard group={mockGroup} />
        </TestWrapper>
      );

      // Check that all text content is meaningful
      expect(screen.getByText(mockGroup.name)).toBeInTheDocument();
      expect(screen.getByText(mockGroup.description!)).toBeInTheDocument();
      expect(screen.getByLabelText(/1 members in this group/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/View details for Test Group group/i)).toBeInTheDocument();
    });

    it('should handle dynamic content updates accessibly', () => {
      const { rerender } = render(
        <TestWrapper>
          <GroupCard group={mockGroup} />
        </TestWrapper>
      );

      const updatedGroup = {
        ...mockGroup,
        name: 'Updated Group Name',
        memberships: [
          ...mockGroup.memberships,
          {
            id: '2',
            isAdmin: false,
            memberId: 2,
            user: { id: '2', username: 'newuser', email: 'newuser@example.com' },
          },
        ],
      };

      rerender(
        <TestWrapper>
          <GroupCard group={updatedGroup} />
        </TestWrapper>
      );

      expect(screen.getByText('Updated Group Name')).toBeInTheDocument();
      expect(screen.getByLabelText(/2 members in this group/i)).toBeInTheDocument();
    });
  });
});
