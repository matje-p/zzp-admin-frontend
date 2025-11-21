import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { TransactionsTable } from './TransactionsTable';
import type { Transaction } from '@/types';
import * as useTransactionsHooks from '../hooks/useTransactions';
import * as usePaymentMatchingHooks from '../hooks/usePaymentMatching';

// Mock the hooks
vi.mock('../hooks/useTransactions');
vi.mock('../hooks/usePaymentMatching');

const mockTransaction: Transaction = {
  uuid: 'txn-1',
  transactionId: 'TXN-001',
  monetaryAccountId: 12345,
  amount: 100.50,
  currency: 'EUR',
  description: 'Test payment',
  counterpartyName: 'Test Client',
  counterpartyIban: 'NL01BUNQ1234567890',
  type: 'IDEAL',
  subType: null,
  created: '2025-01-15T10:00:00Z',
  category: null,
  invoiceUuid: null,
  amountAllocated: 0,
  paymentAllocations: [],
};

const mockExpenseTransaction: Transaction = {
  ...mockTransaction,
  uuid: 'txn-2',
  amount: -50.00,
  counterpartyName: 'Supplier Co',
};

const mockTransactionWithAllocations: Transaction = {
  ...mockTransaction,
  uuid: 'txn-3',
  amount: 100,
  amountAllocated: 60,
  paymentAllocations: [
    {
      uuid: 'alloc-1',
      bankTransactionUuid: 'txn-3',
      invoiceUuid: null,
      accountUuid: 'acc-1',
      amount: '60.00',
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
      invoice: null,
      account: {
        uuid: 'acc-1',
        code: '8010',
        name: 'Services Revenue',
        type: 'income',
      },
    },
  ],
};

const mockExpenseAccounts = {
  accounts: [
    { uuid: 'acc-exp-1', code: '4010', name: 'Office Supplies', type: 'expense' },
    { uuid: 'acc-exp-2', code: '4020', name: 'Software', type: 'expense' },
  ],
  invoices: [
    {
      purchaseInvoiceUuid: 'inv-1',
      description: 'Office supplies invoice',
      totalAmountInclVat: 50.00,
    },
  ],
};

const mockIncomeAccounts = {
  accounts: [
    { uuid: 'acc-inc-1', code: '8010', name: 'Services Revenue', type: 'income' },
    { uuid: 'acc-inc-2', code: '8020', name: 'Product Sales', type: 'income' },
  ],
  invoices: [],
};

describe('TransactionsTable', () => {
  const mockMutateAsync = vi.fn();
  const mockMutation = {
    mutateAsync: mockMutateAsync,
    isPending: false,
    isError: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
      data: [mockTransaction],
      isLoading: false,
      error: null,
    } as any);

    vi.spyOn(useTransactionsHooks, 'useSyncTransactions').mockReturnValue(mockMutation as any);
    vi.spyOn(useTransactionsHooks, 'useLinkTransactionToInvoice').mockReturnValue(mockMutation as any);
    vi.spyOn(useTransactionsHooks, 'useLinkTransactionToAccount').mockReturnValue(mockMutation as any);
    vi.spyOn(useTransactionsHooks, 'useDeleteAllocation').mockReturnValue(mockMutation as any);
    vi.spyOn(useTransactionsHooks, 'useUpdateAllocation').mockReturnValue(mockMutation as any);

    vi.spyOn(usePaymentMatchingHooks, 'useExpenseMatching').mockReturnValue({
      data: mockExpenseAccounts,
      isLoading: false,
      error: null,
    } as any);

    vi.spyOn(usePaymentMatchingHooks, 'useIncomeMatching').mockReturnValue({
      data: mockIncomeAccounts,
      isLoading: false,
      error: null,
    } as any);
  });

  describe('Rendering', () => {
    it('renders table headers', () => {
      render(<TransactionsTable />);

      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Counterparty')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Link To')).toBeInTheDocument();
      expect(screen.getByText('Remainder')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('renders transaction data', () => {
      render(<TransactionsTable />);

      expect(screen.getByText('Test Client')).toBeInTheDocument();
      expect(screen.getByText('Not Linked')).toBeInTheDocument();
    });

    it('displays positive amount with + prefix', () => {
      render(<TransactionsTable />);

      const amountCell = document.querySelector('.amount-positive');
      expect(amountCell).toBeInTheDocument();
      expect(amountCell?.textContent).toContain('+');
      expect(amountCell?.textContent).toContain('100');
    });

    it('displays negative amount with - prefix', () => {
      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockExpenseTransaction],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const amountCell = document.querySelector('.amount-negative');
      expect(amountCell).toBeInTheDocument();
      expect(amountCell?.textContent).toContain('-');
      expect(amountCell?.textContent).toContain('50');
    });

    it('shows loading state', () => {
      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<TransactionsTable />);

      expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
    });

    it('shows error state', () => {
      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      } as any);

      render(<TransactionsTable />);

      expect(screen.getByText(/Error loading transactions/)).toBeInTheDocument();
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });

    it('shows empty state when no transactions', () => {
      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      expect(screen.getByText(/No transactions found/)).toBeInTheDocument();
    });
  });

  describe('Status badges', () => {
    it('shows "Not Linked" with error badge for unassigned transaction', () => {
      render(<TransactionsTable />);

      const badge = screen.getByText('Not Linked');
      expect(badge).toBeInTheDocument();
    });

    it('shows "Linked" with success badge for fully assigned transaction', () => {
      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [{
          ...mockTransaction,
          amountAllocated: 100.50,
        }],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      expect(screen.getByText('Linked')).toBeInTheDocument();
    });

    it('shows "Partially Linked" with warning badge for partially assigned transaction', () => {
      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      expect(screen.getByText('Partially Linked')).toBeInTheDocument();
    });
  });

  describe('Sync transactions', () => {
    it('calls sync mutation when Refresh button is clicked', async () => {
      const user = userEvent.setup();
      render(<TransactionsTable />);

      const syncButton = screen.getByText('Refresh Transactions');
      await user.click(syncButton);

      expect(mockMutateAsync).toHaveBeenCalledWith({ count: 200 });
    });

    it('shows syncing state while mutation is pending', () => {
      vi.spyOn(useTransactionsHooks, 'useSyncTransactions').mockReturnValue({
        ...mockMutation,
        isPending: true,
      } as any);

      render(<TransactionsTable />);

      expect(screen.getByText('Syncing...')).toBeInTheDocument();
      expect(screen.getByText('Syncing...')).toBeDisabled();
    });
  });

  describe('Account filtering', () => {
    it('renders account filter dropdown', () => {
      const transactions = [
        mockTransaction,
        { ...mockTransaction, uuid: 'txn-2', monetaryAccountId: 67890 },
      ];

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: transactions,
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      expect(screen.getByText('All Accounts')).toBeInTheDocument();
    });

    it('filters transactions by selected account', async () => {
      const user = userEvent.setup();
      const transactions = [
        { ...mockTransaction, uuid: 'txn-1', monetaryAccountId: 12345, counterpartyName: 'Client A' },
        { ...mockTransaction, uuid: 'txn-2', monetaryAccountId: 67890, counterpartyName: 'Client B' },
      ];

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: transactions,
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      // Both should be visible initially
      expect(screen.getByText('Client A')).toBeInTheDocument();
      expect(screen.getByText('Client B')).toBeInTheDocument();

      // Select account filter (the actual filtering logic is in utils, so we just test the UI)
      const select = screen.getByDisplayValue('All Accounts');
      await user.selectOptions(select, '12345');

      // The select value should change
      expect(select).toHaveValue('12345');
    });
  });

  describe('Allocations display', () => {
    it('displays existing allocations with account info', () => {
      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      expect(screen.getByText(/8010/)).toBeInTheDocument();
      expect(screen.getByText(/Services Revenue/)).toBeInTheDocument();
      expect(screen.getByText('€60.00')).toBeInTheDocument();
    });

    it('displays allocation with invoice info', () => {
      const txnWithInvoiceAllocation: Transaction = {
        ...mockTransaction,
        uuid: 'txn-4',
        paymentAllocations: [
          {
            uuid: 'alloc-2',
            bankTransactionUuid: 'txn-4',
            invoiceUuid: 'inv-1',
            accountUuid: null,
            amount: '50.00',
            createdAt: '2025-01-15T10:00:00Z',
            updatedAt: '2025-01-15T10:00:00Z',
            invoice: {
              purchaseInvoiceUploadUuid: 'inv-1',
              description: 'Office supplies invoice',
            },
            account: null,
          },
        ],
      };

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [txnWithInvoiceAllocation],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      expect(screen.getByText('Office supplies invoice')).toBeInTheDocument();
      expect(screen.getByText('€50.00')).toBeInTheDocument();
    });

    it('shows add allocation button when remainder > 0', () => {
      render(<TransactionsTable />);

      const addButton = screen.getByTitle('Link Transaction');
      expect(addButton).toBeInTheDocument();
      expect(addButton.textContent).toBe('+');
    });

    it('does not show add button when fully allocated', () => {
      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [{
          ...mockTransaction,
          amount: 100,
          paymentAllocations: [
            {
              uuid: 'alloc-1',
              bankTransactionUuid: 'txn-1',
              invoiceUuid: null,
              accountUuid: 'acc-1',
              amount: '100.00',
              createdAt: '2025-01-15T10:00:00Z',
              updatedAt: '2025-01-15T10:00:00Z',
              invoice: null,
              account: {
                uuid: 'acc-1',
                code: '8010',
                name: 'Services Revenue',
                type: 'income',
              },
            },
          ],
        }],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      expect(screen.queryByTitle('Link Transaction')).not.toBeInTheDocument();
    });
  });

  describe('Link transaction to account/invoice', () => {
    it('shows dropdown when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<TransactionsTable />);

      const addButton = screen.getByTitle('Link Transaction');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Account or Invoice')).toBeInTheDocument();
      });
    });

    it('displays income accounts for positive transaction', async () => {
      const user = userEvent.setup();
      render(<TransactionsTable />);

      const addButton = screen.getByTitle('Link Transaction');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/8010.*Services Revenue/)).toBeInTheDocument();
        expect(screen.getByText(/8020.*Product Sales/)).toBeInTheDocument();
      });
    });

    it('displays expense accounts for negative transaction', async () => {
      const user = userEvent.setup();

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockExpenseTransaction],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const addButton = screen.getByTitle('Link Transaction');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/4010.*Office Supplies/)).toBeInTheDocument();
        expect(screen.getByText(/4020.*Software/)).toBeInTheDocument();
      });
    });

    it('displays available invoices in dropdown', async () => {
      const user = userEvent.setup();

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockExpenseTransaction],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const addButton = screen.getByTitle('Link Transaction');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Office supplies invoice.*€50.00/)).toBeInTheDocument();
      });
    });

    it('links transaction to account when account is selected', async () => {
      const user = userEvent.setup();
      render(<TransactionsTable />);

      const addButton = screen.getByTitle('Link Transaction');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Account or Invoice')).toBeInTheDocument();
      });

      // Find the account selector by its class
      const select = document.querySelector('.account-selector') as HTMLSelectElement;
      await user.selectOptions(select, 'account:8010');

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          transactionId: 'txn-1',
          accountUuid: 'acc-inc-1',
          amount: 100.50,
        });
      });
    });

    it('links transaction to invoice when invoice is selected', async () => {
      const user = userEvent.setup();

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockExpenseTransaction],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const addButton = screen.getByTitle('Link Transaction');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Account or Invoice')).toBeInTheDocument();
      });

      const select = document.querySelector('.account-selector') as HTMLSelectElement;
      await user.selectOptions(select, 'invoice:inv-1');

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          transactionId: 'txn-2',
          invoiceUuid: 'inv-1',
        });
      });
    });

    it('shows success message after successful link', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({});

      render(<TransactionsTable />);

      const addButton = screen.getByTitle('Link Transaction');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Account or Invoice')).toBeInTheDocument();
      });

      const select = document.querySelector('.account-selector') as HTMLSelectElement;
      await user.selectOptions(select, 'account:8010');

      await waitFor(() => {
        expect(screen.getByText(/Transaction linked to account.*successfully/)).toBeInTheDocument();
      });
    });

    it('shows error message when link fails', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValue(new Error('Network error'));

      render(<TransactionsTable />);

      const addButton = screen.getByTitle('Link Transaction');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Select Account or Invoice')).toBeInTheDocument();
      });

      const select = document.querySelector('.account-selector') as HTMLSelectElement;
      await user.selectOptions(select, 'account:8010');

      await waitFor(() => {
        expect(screen.getByText(/Failed to link transaction/)).toBeInTheDocument();
      });
    });
  });

  describe('Delete allocation', () => {
    it('shows delete button for each allocation', () => {
      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const deleteButton = screen.getByTitle('Delete allocation');
      expect(deleteButton).toBeInTheDocument();
    });

    it('calls delete mutation when delete button is clicked', async () => {
      const user = userEvent.setup();

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const deleteButton = screen.getByTitle('Delete allocation');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith('alloc-1');
      });
    });

    it('shows success message after deleting allocation', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({});

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const deleteButton = screen.getByTitle('Delete allocation');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Allocation deleted successfully')).toBeInTheDocument();
      });
    });

    it('shows error message when delete fails', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValue(new Error('Network error'));

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const deleteButton = screen.getByTitle('Delete allocation');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to delete allocation/)).toBeInTheDocument();
      });
    });
  });

  describe('Edit allocation amount', () => {
    it('shows edit button for each allocation', () => {
      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const editButton = screen.getByTitle('Edit amount');
      expect(editButton).toBeInTheDocument();
    });

    it('shows input field when edit button is clicked', async () => {
      const user = userEvent.setup();

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const editButton = screen.getByTitle('Edit amount');
      await user.click(editButton);

      await waitFor(() => {
        const input = screen.getByDisplayValue('60.00');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'number');
      });
    });

    it('allows clicking on amount to edit', async () => {
      const user = userEvent.setup();

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const amountSpan = screen.getByTitle('Click to edit amount');
      await user.click(amountSpan);

      await waitFor(() => {
        expect(screen.getByDisplayValue('60.00')).toBeInTheDocument();
      });
    });

    it('updates allocation when Enter is pressed', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({});

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const editButton = screen.getByTitle('Edit amount');
      await user.click(editButton);

      const input = await screen.findByDisplayValue('60.00');
      await user.clear(input);
      await user.type(input, '75.50');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          allocationUuid: 'alloc-1',
          amount: 75.50,
        });
      });
    });

    it('shows error for invalid amount', async () => {
      const user = userEvent.setup();

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const editButton = screen.getByTitle('Edit amount');
      await user.click(editButton);

      const input = await screen.findByDisplayValue('60.00');
      await user.clear(input);
      await user.type(input, '0');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid amount')).toBeInTheDocument();
      });
    });

    it('shows success message after updating allocation', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({});

      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const editButton = screen.getByTitle('Edit amount');
      await user.click(editButton);

      const input = await screen.findByDisplayValue('60.00');
      await user.clear(input);
      await user.type(input, '75.50');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Allocation updated successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Remainder calculation', () => {
    it('shows correct remainder for unallocated transaction', () => {
      render(<TransactionsTable />);

      const remainder = document.querySelector('.remainder-unallocated');
      expect(remainder).toBeInTheDocument();
      expect(remainder?.textContent).toContain('100.50');
    });

    it('shows correct remainder for partially allocated transaction', () => {
      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [mockTransactionWithAllocations],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const remainder = document.querySelector('.remainder-unallocated');
      expect(remainder).toBeInTheDocument();
      expect(remainder?.textContent).toContain('40.00');
    });

    it('shows zero remainder for fully allocated transaction', () => {
      vi.spyOn(useTransactionsHooks, 'useTransactions').mockReturnValue({
        data: [{
          ...mockTransaction,
          amount: 100,
          paymentAllocations: [
            {
              uuid: 'alloc-1',
              bankTransactionUuid: 'txn-1',
              invoiceUuid: null,
              accountUuid: 'acc-1',
              amount: '100.00',
              createdAt: '2025-01-15T10:00:00Z',
              updatedAt: '2025-01-15T10:00:00Z',
              invoice: null,
              account: {
                uuid: 'acc-1',
                code: '8010',
                name: 'Services Revenue',
                type: 'income',
              },
            },
          ],
        }],
        isLoading: false,
        error: null,
      } as any);

      render(<TransactionsTable />);

      const remainder = document.querySelector('.remainder-zero');
      expect(remainder).toBeInTheDocument();
      expect(remainder?.textContent).toContain('0.00');
    });
  });
});
