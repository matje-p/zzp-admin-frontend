import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { PurchaseInvoicesTable } from './PurchaseInvoicesTable';
import type { PurchaseInvoice } from '@/types';

const mockInvoice: PurchaseInvoice = {
  purchaseInvoiceUploadUuid: 'inv-1',
  invoiceNumber: 'INV-001',
  invoiceSentDate: '2025-01-15T10:00:00Z',
  dueDate: '2025-02-15T10:00:00Z',
  contactName: 'Supplier Co',
  contactUuid: 'contact-1',
  contact: {
    uuid: 'contact-1',
    name: 'Supplier Co',
    email: 'supplier@example.com',
  },
  subscriptionUuid: null,
  category: 'Office Supplies',
  amount: 150.00,
  amountExclVat: 123.97,
  vatAmount: 26.03,
  vatPercentage: 21,
  currency: 'EUR',
  status: 'unpaid',
  paidAt: null,
  paymentMethod: null,
  description: 'Office supplies for Q1',
  notes: null,
  documentUuid: 'doc-1',
  transactionUuid: null,
  filePath: '/uploads/invoice-001.pdf',
  filename: 'invoice-001.pdf',
  amountAllocated: 0,
  periodStartDate: null,
  periodEndDate: null,
  lines: [],
};

const mockSubscriptionInvoice: PurchaseInvoice = {
  ...mockInvoice,
  purchaseInvoiceUploadUuid: 'inv-2',
  subscriptionUuid: 'sub-1',
  subscription: {
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
  },
  description: null,
  periodStartDate: '2025-01-01T00:00:00Z',
  periodEndDate: '2025-01-31T00:00:00Z',
};

const mockExpectedInvoice: PurchaseInvoice = {
  ...mockInvoice,
  purchaseInvoiceUploadUuid: 'inv-3',
  filePath: null,
  filename: null,
};

const mockPartiallyLinkedInvoice: PurchaseInvoice = {
  ...mockInvoice,
  purchaseInvoiceUploadUuid: 'inv-4',
  amount: 100,
  amountAllocated: 50,
};

const mockFullyLinkedInvoice: PurchaseInvoice = {
  ...mockInvoice,
  purchaseInvoiceUploadUuid: 'inv-5',
  amount: 100,
  amountAllocated: 100,
};

describe('PurchaseInvoicesTable', () => {
  const mockOnRowClick = vi.fn();
  const mockOnDeleteClick = vi.fn();

  const defaultProps = {
    invoices: [mockInvoice],
    onRowClick: mockOnRowClick,
    onDeleteClick: mockOnDeleteClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders table headers', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      expect(screen.getByText('Invoice Date')).toBeInTheDocument();
      expect(screen.getByText('Contact Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('File')).toBeInTheDocument();
      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('renders invoice data', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      expect(screen.getByText('Supplier Co')).toBeInTheDocument();
      expect(screen.getByText('Office Supplies')).toBeInTheDocument();
      expect(screen.getByText('Office supplies for Q1')).toBeInTheDocument();
    });

    it('shows empty state when no invoices', () => {
      render(<PurchaseInvoicesTable {...defaultProps} invoices={[]} />);

      expect(screen.getByText(/No invoices found/)).toBeInTheDocument();
      expect(screen.getByText(/Refresh Invoices/)).toBeInTheDocument();
    });

    it('shows empty state when invoices is undefined', () => {
      render(<PurchaseInvoicesTable {...defaultProps} invoices={undefined} />);

      expect(screen.getByText(/No invoices found/)).toBeInTheDocument();
    });

    it('renders multiple invoices', () => {
      const invoices = [
        mockInvoice,
        { ...mockInvoice, purchaseInvoiceUploadUuid: 'inv-2', contactName: 'Vendor Inc', contact: undefined },
        { ...mockInvoice, purchaseInvoiceUploadUuid: 'inv-3', contactName: 'Service Provider', contact: undefined },
      ];

      render(<PurchaseInvoicesTable {...defaultProps} invoices={invoices} />);

      expect(screen.getByText('Supplier Co')).toBeInTheDocument();
      expect(screen.getByText('Vendor Inc')).toBeInTheDocument();
      expect(screen.getByText('Service Provider')).toBeInTheDocument();
    });
  });

  describe('Contact display', () => {
    it('displays contact name from contact object if available', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      expect(screen.getByText('Supplier Co')).toBeInTheDocument();
    });

    it('displays contactName if contact object not available', () => {
      const invoice = {
        ...mockInvoice,
        contact: undefined,
        contactName: 'Direct Contact Name',
      };

      render(<PurchaseInvoicesTable {...defaultProps} invoices={[invoice]} />);

      expect(screen.getByText('Direct Contact Name')).toBeInTheDocument();
    });

    it('displays dash when no contact info available', () => {
      const invoice = {
        ...mockInvoice,
        contact: undefined,
        contactName: null,
      };

      render(<PurchaseInvoicesTable {...defaultProps} invoices={[invoice]} />);

      const cells = document.querySelectorAll('td');
      const contactCell = Array.from(cells).find(cell => cell.textContent === '-');
      expect(contactCell).toBeInTheDocument();
    });
  });

  describe('Description display', () => {
    it('displays subscription name when subscription exists', () => {
      render(<PurchaseInvoicesTable {...defaultProps} invoices={[mockSubscriptionInvoice]} />);

      expect(screen.getByText('Netflix')).toBeInTheDocument();
    });

    it('displays description when no subscription', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      expect(screen.getByText('Office supplies for Q1')).toBeInTheDocument();
    });

    it('displays period when periodStartDate and periodEndDate exist', () => {
      render(<PurchaseInvoicesTable {...defaultProps} invoices={[mockSubscriptionInvoice]} />);

      // Period should be formatted by formatPeriod
      const periodText = screen.getByText(/1 to 31 Jan 2025/);
      expect(periodText).toBeInTheDocument();
    });

    it('does not display period when dates are missing', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      const periodText = screen.queryByText(/Jan 2025/);
      expect(periodText).not.toBeInTheDocument();
    });
  });

  describe('Invoice type badge', () => {
    it('shows "Subscription" badge for subscription invoices', () => {
      render(<PurchaseInvoicesTable {...defaultProps} invoices={[mockSubscriptionInvoice]} />);

      expect(screen.getByText('Subscription')).toBeInTheDocument();
    });

    it('shows "One-off" badge for non-subscription invoices', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      expect(screen.getByText('One-off')).toBeInTheDocument();
    });
  });

  describe('File upload status', () => {
    it('shows "Uploaded" badge when filePath exists', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      expect(screen.getByText('Uploaded')).toBeInTheDocument();
    });

    it('shows "Not uploaded" badge when filePath is null', () => {
      render(<PurchaseInvoicesTable {...defaultProps} invoices={[mockExpectedInvoice]} />);

      expect(screen.getByText('Not uploaded')).toBeInTheDocument();
    });

    it('shows "(expected)" label when file not uploaded', () => {
      render(<PurchaseInvoicesTable {...defaultProps} invoices={[mockExpectedInvoice]} />);

      expect(screen.getByText('(expected)')).toBeInTheDocument();
    });

    it('does not show "(expected)" label when file is uploaded', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      expect(screen.queryByText('(expected)')).not.toBeInTheDocument();
    });
  });

  describe('Payment status', () => {
    it('shows "Not Linked" with error badge for unlinked invoice', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      const badge = screen.getByText('Not Linked');
      expect(badge).toBeInTheDocument();
    });

    it('shows "Linked" with success badge for fully linked invoice', () => {
      render(<PurchaseInvoicesTable {...defaultProps} invoices={[mockFullyLinkedInvoice]} />);

      const badge = screen.getByText('Linked');
      expect(badge).toBeInTheDocument();
    });

    it('shows "Partially Linked" with warning badge for partially linked invoice', () => {
      render(<PurchaseInvoicesTable {...defaultProps} invoices={[mockPartiallyLinkedInvoice]} />);

      const badge = screen.getByText('Partially Linked');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Amount display', () => {
    it('displays formatted currency amount', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      const amountCell = document.querySelector('.amount-positive');
      expect(amountCell).toBeInTheDocument();
      expect(amountCell?.textContent).toContain('€');
      expect(amountCell?.textContent).toContain('150');
    });
  });

  describe('Row click', () => {
    it('calls onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      render(<PurchaseInvoicesTable {...defaultProps} />);

      const row = screen.getByText('Supplier Co').closest('tr');
      await user.click(row!);

      expect(mockOnRowClick).toHaveBeenCalledTimes(1);
      expect(mockOnRowClick).toHaveBeenCalledWith(mockInvoice);
    });

    it('applies clickable-row class to rows', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      const row = screen.getByText('Supplier Co').closest('tr');
      expect(row).toHaveClass('clickable-row');
    });
  });

  describe('Delete action', () => {
    it('renders delete button for each invoice', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      const deleteButton = screen.getByTitle('Delete invoice');
      expect(deleteButton).toBeInTheDocument();
    });

    it('calls onDeleteClick when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<PurchaseInvoicesTable {...defaultProps} />);

      const deleteButton = screen.getByTitle('Delete invoice');
      await user.click(deleteButton);

      expect(mockOnDeleteClick).toHaveBeenCalledTimes(1);
      // Check that the event and invoice ID were passed
      expect(mockOnDeleteClick.mock.calls[0][1]).toBe('inv-1');
    });

    it('renders delete button for each invoice when multiple invoices', () => {
      const invoices = [
        mockInvoice,
        { ...mockInvoice, purchaseInvoiceUploadUuid: 'inv-2' },
        { ...mockInvoice, purchaseInvoiceUploadUuid: 'inv-3' },
      ];

      render(<PurchaseInvoicesTable {...defaultProps} invoices={invoices} />);

      const deleteButtons = screen.getAllByTitle('Delete invoice');
      expect(deleteButtons).toHaveLength(3);
    });
  });

  describe('Category display', () => {
    it('displays category when available', () => {
      render(<PurchaseInvoicesTable {...defaultProps} />);

      expect(screen.getByText('Office Supplies')).toBeInTheDocument();
    });

    it('displays dash when category is null', () => {
      const invoice = { ...mockInvoice, category: null };

      render(<PurchaseInvoicesTable {...defaultProps} invoices={[invoice]} />);

      const cells = document.querySelectorAll('td');
      const categoryCell = Array.from(cells).find(cell => cell.textContent === '-');
      expect(categoryCell).toBeInTheDocument();
    });
  });
});
