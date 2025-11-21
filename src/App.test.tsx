import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/common';

// Component that throws an error
const BrokenComponent = () => {
  throw new Error('Test error in component');
};

// Component that works
const WorkingComponent = () => {
  return <div>Working component</div>;
};

describe('Error Boundary Integration', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  beforeEach(() => {
    // Suppress console errors in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('catches errors and displays error fallback', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary
          FallbackComponent={(props) => <ErrorFallback {...props} featureName="Test Feature" />}
        >
          <BrokenComponent />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    // Error boundary should catch the error and show fallback
    expect(screen.getByText('Error in Test Feature')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('does not show error fallback when no error occurs', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary
          FallbackComponent={(props) => <ErrorFallback {...props} featureName="Test Feature" />}
        >
          <WorkingComponent />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    // Should render the working component
    expect(screen.getByText('Working component')).toBeInTheDocument();
    // Should not show error message
    expect(screen.queryByText('Error in Test Feature')).not.toBeInTheDocument();
  });

  it('shows error details in fallback UI', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary
          FallbackComponent={(props) => <ErrorFallback {...props} featureName="Test Feature" />}
        >
          <BrokenComponent />
        </ErrorBoundary>
      </QueryClientProvider>
    );

    // Error message should be visible in details
    expect(screen.getByText('Test error in component')).toBeInTheDocument();
  });
});
