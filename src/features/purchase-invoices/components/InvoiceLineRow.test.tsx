import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { InvoiceLineRow } from './InvoiceLineRow';
import type { PurchaseInvoiceLine, Account } from '@/types';

const mockLine: PurchaseInvoiceLine = {
  uuid: 'line-1',
  quantity: 2,
  description: 'Office supplies',
  amountExclVat: 50.00,
  vatPercentage: 21,
  category: 'account-1',
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

describe('InvoiceLineRow', () => {
  const mockOnLineItemChange = vi.fn();

  const defaultProps = {
    line: mockLine,
    expenseAccounts: mockAccounts,
    onLineItemChange: mockOnLineItemChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders quantity input with value', () => {
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const quantityInput = screen.getByDisplayValue('2');
      expect(quantityInput).toBeInTheDocument();
      expect(quantityInput).toHaveAttribute('type', 'number');
    });

    it('renders description input with value', () => {
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const descriptionInput = screen.getByDisplayValue('Office supplies');
      expect(descriptionInput).toBeInTheDocument();
      expect(descriptionInput).toHaveAttribute('type', 'text');
    });

    it('renders amount input with value', () => {
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const amountInput = screen.getByDisplayValue('50');
      expect(amountInput).toBeInTheDocument();
      expect(amountInput).toHaveAttribute('type', 'number');
    });

    it('renders VAT percentage input with value', () => {
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const vatInput = screen.getByDisplayValue('21');
      expect(vatInput).toBeInTheDocument();
      expect(vatInput).toHaveAttribute('type', 'number');
    });

    it('renders % symbol next to VAT input', () => {
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      expect(screen.getByText('%')).toBeInTheDocument();
    });

    it('renders category select with accounts', () => {
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      expect(screen.getByText('Office Supplies')).toBeInTheDocument();
      expect(screen.getByText('Software')).toBeInTheDocument();
    });

    it('renders empty inputs when values are null', () => {
      const lineWithNulls: PurchaseInvoiceLine = {
        uuid: 'line-2',
        quantity: null as any,
        description: null,
        amountExclVat: null as any,
        vatPercentage: null,
        category: null,
      };

      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} line={lineWithNulls} />
          </tbody>
        </table>
      );

      // Description input should be empty
      const descriptionInput = screen.getByPlaceholderText('Description');
      expect(descriptionInput).toHaveValue('');
    });
  });

  describe('Quantity input', () => {
    it('calls onLineItemChange when quantity is changed', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const quantityInput = screen.getByDisplayValue('2');
      await user.type(quantityInput, '5');

      expect(mockOnLineItemChange).toHaveBeenCalledWith('line-1', 'quantity', expect.any(Number));
    });

    it('converts empty string to null for quantity', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const quantityInput = screen.getByDisplayValue('2');
      await user.clear(quantityInput);

      expect(mockOnLineItemChange).toHaveBeenCalledWith('line-1', 'quantity', null);
    });

    it('has min, step attributes for quantity', () => {
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const quantityInput = screen.getByDisplayValue('2');
      expect(quantityInput).toHaveAttribute('min', '0');
      expect(quantityInput).toHaveAttribute('step', '0.01');
    });
  });

  describe('Description input', () => {
    it('calls onLineItemChange when description is changed', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const descriptionInput = screen.getByDisplayValue('Office supplies');
      await user.type(descriptionInput, 'x');

      expect(mockOnLineItemChange).toHaveBeenCalledWith('line-1', 'description', expect.any(String));
    });

    it('has placeholder text', () => {
      const lineWithNoDesc: PurchaseInvoiceLine = {
        ...mockLine,
        description: null,
      };

      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} line={lineWithNoDesc} />
          </tbody>
        </table>
      );

      const descriptionInput = screen.getByPlaceholderText('Description');
      expect(descriptionInput).toBeInTheDocument();
    });
  });

  describe('Amount input', () => {
    it('calls onLineItemChange when amount is changed', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const amountInput = screen.getByDisplayValue('50');
      await user.type(amountInput, '.5');

      expect(mockOnLineItemChange).toHaveBeenCalledWith('line-1', 'amountExclVat', expect.any(Number));
    });

    it('converts empty string to null for amount', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const amountInput = screen.getByDisplayValue('50');
      await user.clear(amountInput);

      expect(mockOnLineItemChange).toHaveBeenCalledWith('line-1', 'amountExclVat', null);
    });
  });

  describe('VAT percentage input', () => {
    it('calls onLineItemChange when VAT percentage is changed', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const vatInput = screen.getByDisplayValue('21');
      await user.type(vatInput, '9');

      expect(mockOnLineItemChange).toHaveBeenCalledWith('line-1', 'vatPercentage', expect.any(Number));
    });

    it('converts empty string to null for VAT percentage', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const vatInput = screen.getByDisplayValue('21');
      await user.clear(vatInput);

      expect(mockOnLineItemChange).toHaveBeenCalledWith('line-1', 'vatPercentage', null);
    });

    it('has min, max, step attributes for VAT', () => {
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const vatInput = screen.getByDisplayValue('21');
      expect(vatInput).toHaveAttribute('min', '0');
      expect(vatInput).toHaveAttribute('max', '100');
      expect(vatInput).toHaveAttribute('step', '0.01');
    });
  });

  describe('Category select', () => {
    it('calls onLineItemChange when category is changed', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'account-2');

      expect(mockOnLineItemChange).toHaveBeenCalledWith('line-1', 'category', 'account-2');
    });

    it('displays selected category', () => {
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('account-1');
    });

    it('shows "Select account" option', () => {
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      expect(screen.getByText('Select account')).toBeInTheDocument();
    });

    it('displays all expense accounts', () => {
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      expect(screen.getByText('Office Supplies')).toBeInTheDocument();
      expect(screen.getByText('Software')).toBeInTheDocument();
    });

    it('handles undefined expenseAccounts', () => {
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} expenseAccounts={undefined} />
          </tbody>
        </table>
      );

      expect(screen.getByText('Select account')).toBeInTheDocument();
      expect(screen.queryByText('Office Supplies')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard navigation', () => {
    it('blurs quantity input on Enter key', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const quantityInput = screen.getByDisplayValue('2');
      quantityInput.focus();
      expect(quantityInput).toHaveFocus();

      await user.keyboard('{Enter}');

      expect(quantityInput).not.toHaveFocus();
    });

    it('blurs description input on Enter key', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const descriptionInput = screen.getByDisplayValue('Office supplies');
      descriptionInput.focus();
      expect(descriptionInput).toHaveFocus();

      await user.keyboard('{Enter}');

      expect(descriptionInput).not.toHaveFocus();
    });

    it('blurs amount input on Enter key', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const amountInput = screen.getByDisplayValue('50');
      amountInput.focus();
      expect(amountInput).toHaveFocus();

      await user.keyboard('{Enter}');

      expect(amountInput).not.toHaveFocus();
    });

    it('blurs VAT input on Enter key', async () => {
      const user = userEvent.setup();
      render(
        <table>
          <tbody>
            <InvoiceLineRow {...defaultProps} />
          </tbody>
        </table>
      );

      const vatInput = screen.getByDisplayValue('21');
      vatInput.focus();
      expect(vatInput).toHaveFocus();

      await user.keyboard('{Enter}');

      expect(vatInput).not.toHaveFocus();
    });
  });
});
