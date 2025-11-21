import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { SubscriptionsTable } from './SubscriptionsTable';
import type { Subscription } from '@/types';

const mockSubscription: Subscription = {
  uuid: 'sub-1',
  name: 'Netflix',
  provider: 'Netflix Inc.',
  category: 'Entertainment',
  amount: 15.99,
  currency: 'EUR',
  billingCycle: 'monthly',
  startDate: '2025-01-01T00:00:00Z',
  endDate: null,
  nextBillingDate: '2025-02-01T00:00:00Z',
  status: 'active',
  description: 'Streaming service',
  cancelledAt: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('SubscriptionsTable', () => {
  const mockOnRowClick = vi.fn();
  const mockOnDeleteClick = vi.fn();

  const defaultProps = {
    subscriptions: [mockSubscription],
    onRowClick: mockOnRowClick,
    onDeleteClick: mockOnDeleteClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table headers', () => {
    render(<SubscriptionsTable {...defaultProps} />);

    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.getByText('Provider')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Billing Period')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders subscription data', () => {
    render(<SubscriptionsTable {...defaultProps} />);

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('Netflix Inc.')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays formatted amount', () => {
    render(<SubscriptionsTable {...defaultProps} />);

    // Amount is formatted with currency - just check it contains the numbers
    const amountCell = document.querySelector('.amount-positive');
    expect(amountCell).toBeInTheDocument();
    expect(amountCell?.textContent).toContain('15');
    expect(amountCell?.textContent).toContain('99');
  });

  it('shows active status with success badge', () => {
    render(<SubscriptionsTable {...defaultProps} />);

    const badge = screen.getByText('Active');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-600');
  });

  it('shows cancelled status with error badge', () => {
    const cancelledSubscription = {
      ...mockSubscription,
      status: 'cancelled' as const,
    };

    render(<SubscriptionsTable {...defaultProps} subscriptions={[cancelledSubscription]} />);

    const badge = screen.getByText('Cancelled');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-600');
  });

  it('calls onRowClick when row is clicked', async () => {
    const user = userEvent.setup();
    render(<SubscriptionsTable {...defaultProps} />);

    const row = screen.getByText('Netflix').closest('tr');
    await user.click(row!);

    expect(mockOnRowClick).toHaveBeenCalledTimes(1);
    expect(mockOnRowClick).toHaveBeenCalledWith(mockSubscription);
  });

  it('calls onDeleteClick when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<SubscriptionsTable {...defaultProps} />);

    const deleteButton = screen.getByTitle('Delete subscription');
    await user.click(deleteButton);

    expect(mockOnDeleteClick).toHaveBeenCalledTimes(1);
    // Check second argument is subscription uuid
    expect(mockOnDeleteClick.mock.calls[0][1]).toBe('sub-1');
  });

  it('calls both delete and row click handlers when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<SubscriptionsTable {...defaultProps} />);

    const deleteButton = screen.getByTitle('Delete subscription');
    await user.click(deleteButton);

    // Both handlers are called because event bubbles
    expect(mockOnDeleteClick).toHaveBeenCalledTimes(1);
    expect(mockOnRowClick).toHaveBeenCalledTimes(1);
  });

  it('renders multiple subscriptions', () => {
    const subscriptions = [
      mockSubscription,
      { ...mockSubscription, uuid: 'sub-2', name: 'Spotify', provider: 'Spotify AB' },
      { ...mockSubscription, uuid: 'sub-3', name: 'Adobe', provider: 'Adobe Inc.' },
    ];

    render(<SubscriptionsTable {...defaultProps} subscriptions={subscriptions} />);

    expect(screen.getByText('Netflix')).toBeInTheDocument();
    expect(screen.getByText('Spotify')).toBeInTheDocument();
    expect(screen.getByText('Adobe')).toBeInTheDocument();
  });

  it('shows empty state when no subscriptions', () => {
    render(<SubscriptionsTable {...defaultProps} subscriptions={[]} />);

    expect(screen.getByText('No subscriptions found.')).toBeInTheDocument();
  });

  it('shows empty state when subscriptions is undefined', () => {
    render(<SubscriptionsTable {...defaultProps} subscriptions={undefined} />);

    expect(screen.getByText('No subscriptions found.')).toBeInTheDocument();
  });

  it('renders delete button for each subscription', () => {
    const subscriptions = [
      mockSubscription,
      { ...mockSubscription, uuid: 'sub-2', name: 'Spotify' },
    ];

    render(<SubscriptionsTable {...defaultProps} subscriptions={subscriptions} />);

    const deleteButtons = screen.getAllByTitle('Delete subscription');
    expect(deleteButtons).toHaveLength(2);
  });
});
