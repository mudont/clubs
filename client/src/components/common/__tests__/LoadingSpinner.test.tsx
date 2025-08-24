import { render, screen } from '@testing-library/react';

import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    const container = screen.getByRole('status');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute('aria-live', 'polite');

    expect(screen.getAllByText('Loading...')).toHaveLength(2); // One in message, one in sr-only
    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Please wait while we process your request...';
    render(<LoadingSpinner message={customMessage} />);

    expect(screen.getAllByText(customMessage)).toHaveLength(2); // One in message, one in sr-only
    expect(screen.getByLabelText(customMessage)).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(document.querySelector('.loading-spinner.small')).toBeInTheDocument();

    rerender(<LoadingSpinner size="medium" />);
    expect(document.querySelector('.loading-spinner.medium')).toBeInTheDocument();

    rerender(<LoadingSpinner size="large" />);
    expect(document.querySelector('.loading-spinner.large')).toBeInTheDocument();
  });

  it('applies full screen class when fullScreen is true', () => {
    render(<LoadingSpinner fullScreen />);

    const container = screen.getByRole('status');
    expect(container).toHaveClass('loading-spinner-container', 'full-screen');
  });

  it('does not apply full screen class when fullScreen is false', () => {
    render(<LoadingSpinner fullScreen={false} />);

    const container = screen.getByRole('status');
    expect(container).toHaveClass('loading-spinner-container');
    expect(container).not.toHaveClass('full-screen');
  });

  it('renders spinner ring elements', () => {
    render(<LoadingSpinner />);

    const spinnerRing = document.querySelector('.spinner-ring');
    expect(spinnerRing).toBeInTheDocument();

    // Check that spinner ring has 4 div elements
    const spinnerElements = spinnerRing?.querySelectorAll('div');
    expect(spinnerElements).toHaveLength(4);
  });

  it('renders screen reader text', () => {
    const message = 'Custom loading message';
    render(<LoadingSpinner message={message} />);

    const srText = document.querySelector('.sr-only');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveTextContent(message);
  });

  it('renders loading message with aria-label', () => {
    const message = 'Processing data...';
    render(<LoadingSpinner message={message} />);

    const loadingMessage = document.querySelector('.loading-message');
    expect(loadingMessage).toBeInTheDocument();
    expect(loadingMessage).toHaveAttribute('aria-label', message);
    expect(loadingMessage).toHaveTextContent(message);
  });

  it('does not render loading message when message is empty', () => {
    render(<LoadingSpinner message="" />);

    const loadingMessage = document.querySelector('.loading-message');
    expect(loadingMessage).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);

    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('role', 'status');
  });

  it('is memoized correctly', () => {
    const { rerender } = render(<LoadingSpinner message="Test" />);
    const firstRender = screen.getByRole('status');

    rerender(<LoadingSpinner message="Test" />);
    const secondRender = screen.getByRole('status');

    // Component should be the same instance due to React.memo
    expect(firstRender).toBe(secondRender);
  });

  it('re-renders when props change', () => {
    const { rerender } = render(<LoadingSpinner message="First message" />);
    expect(screen.getAllByText('First message')).toHaveLength(2);

    rerender(<LoadingSpinner message="Second message" />);
    expect(screen.getAllByText('Second message')).toHaveLength(2);
    expect(screen.queryByText('First message')).not.toBeInTheDocument();
  });
});
