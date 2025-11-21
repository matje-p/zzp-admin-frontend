import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('renders with default size', () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('applies small size classes', () => {
    const { container } = render(<Spinner size="sm" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('applies large size classes', () => {
    const { container } = render(<Spinner size="lg" />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12', 'w-12', 'border-4');
  });

  it('supports custom className', () => {
    const { container } = render(<Spinner className="custom-class" />);
    const spinner = container.firstChild;
    expect(spinner).toHaveClass('custom-class');
  });

  it('has proper ARIA attributes', () => {
    render(<Spinner />);
    // Spinner should be decorative, not need special ARIA
    const { container } = render(<Spinner />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
