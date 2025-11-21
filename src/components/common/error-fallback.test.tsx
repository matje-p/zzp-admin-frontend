import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { ErrorFallback } from './error-fallback';

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  const mockResetErrorBoundary = vi.fn();

  const defaultProps = {
    error: mockError,
    resetErrorBoundary: mockResetErrorBoundary,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders error message', () => {
      render(<ErrorFallback {...defaultProps} />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();
    });

    it('renders feature name when provided', () => {
      render(<ErrorFallback {...defaultProps} featureName="Transactions" />);

      expect(screen.getByText('Error in Transactions')).toBeInTheDocument();
    });

    it('renders error details in collapsed state', () => {
      render(<ErrorFallback {...defaultProps} />);

      expect(screen.getByText('Error details')).toBeInTheDocument();
      // Error message should not be visible initially (in details tag)
      const errorDetails = screen.getByText('Test error message');
      expect(errorDetails).toBeInTheDocument();
    });

    it('renders Try again button', () => {
      render(<ErrorFallback {...defaultProps} />);

      expect(screen.getByText('Try again')).toBeInTheDocument();
    });

    it('renders Go to home button', () => {
      render(<ErrorFallback {...defaultProps} />);

      expect(screen.getByText('Go to home')).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    it('calls resetErrorBoundary when Try again is clicked', async () => {
      const user = userEvent.setup();
      render(<ErrorFallback {...defaultProps} />);

      const tryAgainButton = screen.getByText('Try again');
      await user.click(tryAgainButton);

      expect(mockResetErrorBoundary).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error display', () => {
    it('shows error message in details', () => {
      render(<ErrorFallback {...defaultProps} />);

      const errorMessage = screen.getByText('Test error message');
      expect(errorMessage).toBeInTheDocument();
    });

    it('handles errors without message', () => {
      const errorWithoutMessage = new Error();
      errorWithoutMessage.message = '';

      render(<ErrorFallback {...defaultProps} error={errorWithoutMessage} />);

      // Should still render the component without crashing
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});
