import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmModal } from './DeleteConfirmModal';

describe('DeleteConfirmModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    isOpen: true,
    isDeleting: false,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    expect(screen.getByText('Delete Subscription')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this subscription?')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<DeleteConfirmModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Delete Subscription')).not.toBeInTheDocument();
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when Delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('shows deleting state', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

    expect(screen.getByRole('button', { name: /deleting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
  });

  it('disables Delete button while deleting', () => {
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

    const deleteButton = screen.getByRole('button', { name: /deleting/i });
    expect(deleteButton).toBeDisabled();
  });

  it('does not call onConfirm when Delete button is clicked while deleting', async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmModal {...defaultProps} isDeleting={true} />);

    const deleteButton = screen.getByRole('button', { name: /deleting/i });
    await user.click(deleteButton);

    // Button is disabled, so click should not trigger action
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});
