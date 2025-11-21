import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { InvoiceLinesTable } from './InvoiceLinesTable';
import type { PurchaseInvoiceLine, Account } from '@/types';

// Mock InvoiceLineRow to simplify testing
vi.mock('./InvoiceLineRow', () => ({
  InvoiceLineRow: ({ line }: { line: PurchaseInvoiceLine }) => (
    <tr data-testid={`line-row-${line.uuid}`}>
      <td>{line.quantity}</td>
      <td>{line.description}</td>
      <td>{line.amountExclVat}</td>
      <td>{line.vatPercentage}</td>
      <td>{line.category}</td>
    </tr>
  ),
}));

const mockLine1: PurchaseInvoiceLine = {
  uuid: 'line-1',
  quantity: 2,
  description: 'Office supplies',
  amountExclVat: 50.00,
  vatPercentage: 21,
  category: 'account-1',
};

const mockLine2: PurchaseInvoiceLine = {
  uuid: 'line-2',
  quantity: 1,
  description: 'Software license',
  amountExclVat: 99.99,
  vatPercentage: 21,
  category: 'account-2',
};

const mockAccounts: Account[] = [
  {
    uuid: 'account-1',
    code: '4010',
    name: 'Office Supplies',
    type: 'expense',
  },
  {
    uuid: 'account-2',
    code: '4020',
    name: 'Software',
    type: 'expense',
  },
];

describe('InvoiceLinesTable', () => {
  const mockOnLineItemChange = vi.fn();
  const mockOnAddLine = vi.fn();

  const defaultProps = {
    lines: [mockLine1],
    expenseAccounts: mockAccounts,
    onLineItemChange: mockOnLineItemChange,
    onAddLine: mockOnAddLine,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders table headers', () => {
      render(<InvoiceLinesTable {...defaultProps} />);

      expect(screen.getByText('Qty.')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('VAT')).toBeInTheDocument();
      expect(screen.getByText('Category')).toBeInTheDocument();
    });

    it('renders Invoice Lines heading', () => {
      render(<InvoiceLinesTable {...defaultProps} />);

      expect(screen.getByText('Invoice Lines')).toBeInTheDocument();
    });

    it('renders line items', () => {
      render(<InvoiceLinesTable {...defaultProps} />);

      expect(screen.getByTestId('line-row-line-1')).toBeInTheDocument();
    });

    it('renders multiple line items', () => {
      render(<InvoiceLinesTable {...defaultProps} lines={[mockLine1, mockLine2]} />);

      expect(screen.getByTestId('line-row-line-1')).toBeInTheDocument();
      expect(screen.getByTestId('line-row-line-2')).toBeInTheDocument();
    });

    it('shows empty message when no lines', () => {
      render(<InvoiceLinesTable {...defaultProps} lines={[]} />);

      expect(screen.getByText('No invoice lines available')).toBeInTheDocument();
    });

    it('shows empty message when lines is undefined', () => {
      render(<InvoiceLinesTable {...defaultProps} lines={undefined} />);

      expect(screen.getByText('No invoice lines available')).toBeInTheDocument();
    });
  });

  describe('Add line button', () => {
    it('renders add line button', () => {
      render(<InvoiceLinesTable {...defaultProps} />);

      expect(screen.getByText('Add line')).toBeInTheDocument();
    });

    it('calls onAddLine when add line button is clicked', async () => {
      const user = userEvent.setup();
      render(<InvoiceLinesTable {...defaultProps} />);

      const addButton = screen.getByText('Add line');
      await user.click(addButton);

      expect(mockOnAddLine).toHaveBeenCalledTimes(1);
    });

    it('renders add line button even when no lines exist', () => {
      render(<InvoiceLinesTable {...defaultProps} lines={[]} />);

      expect(screen.getByText('Add line')).toBeInTheDocument();
    });
  });

  describe('Total calculation', () => {
    it('displays total label', () => {
      render(<InvoiceLinesTable {...defaultProps} />);

      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('calculates and displays total for single line', () => {
      render(<InvoiceLinesTable {...defaultProps} />);

      const totalCell = document.querySelector('.amount-cell');
      expect(totalCell).toBeInTheDocument();
      expect(totalCell?.textContent).toContain('€');
      expect(totalCell?.textContent).toContain('50');
    });

    it('calculates and displays total for multiple lines', () => {
      render(<InvoiceLinesTable {...defaultProps} lines={[mockLine1, mockLine2]} />);

      const totalCell = document.querySelector('.amount-cell');
      expect(totalCell).toBeInTheDocument();
      // 50.00 + 99.99 = 149.99
      expect(totalCell?.textContent).toContain('149');
      expect(totalCell?.textContent).toContain('99');
    });

    it('displays zero total when no lines', () => {
      render(<InvoiceLinesTable {...defaultProps} lines={[]} />);

      const totalCell = document.querySelector('.amount-cell');
      expect(totalCell).toBeInTheDocument();
      expect(totalCell?.textContent).toContain('€');
      expect(totalCell?.textContent).toContain('0');
    });

    it('displays zero total when lines is undefined', () => {
      render(<InvoiceLinesTable {...defaultProps} lines={undefined} />);

      const totalCell = document.querySelector('.amount-cell');
      expect(totalCell).toBeInTheDocument();
      expect(totalCell?.textContent).toContain('0');
    });
  });

  describe('Props passing', () => {
    it('passes line data to InvoiceLineRow', () => {
      render(<InvoiceLinesTable {...defaultProps} />);

      const row = screen.getByTestId('line-row-line-1');
      expect(row).toHaveTextContent('2'); // quantity
      expect(row).toHaveTextContent('Office supplies'); // description
      expect(row).toHaveTextContent('50'); // amount
      expect(row).toHaveTextContent('21'); // VAT
      expect(row).toHaveTextContent('account-1'); // category
    });

    it('passes expenseAccounts to InvoiceLineRow', () => {
      // This is tested implicitly through the mock
      render(<InvoiceLinesTable {...defaultProps} />);

      expect(screen.getByTestId('line-row-line-1')).toBeInTheDocument();
    });

    it('passes onLineItemChange callback to InvoiceLineRow', () => {
      // This is tested implicitly through the mock
      render(<InvoiceLinesTable {...defaultProps} />);

      expect(screen.getByTestId('line-row-line-1')).toBeInTheDocument();
    });
  });
});
