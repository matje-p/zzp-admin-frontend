import { describe, it, expect } from 'vitest';
import {
  getPaymentStatus,
  calculateLineItemsTotal,
  createNewInvoice,
  createNewInvoiceLine,
  validateFileType,
  transformLineItemsForBackend,
} from './invoiceHelpers';
import type { PurchaseInvoice, PurchaseInvoiceLine } from '@/types';

describe('invoiceHelpers', () => {
  describe('getPaymentStatus', () => {
    it('returns "unlinked" when amount is not allocated', () => {
      const invoice: PurchaseInvoice = {
        amount: 100,
        amountAllocated: 0,
      } as PurchaseInvoice;

      expect(getPaymentStatus(invoice)).toBe('unlinked');
    });

    it('returns "linked" when fully allocated', () => {
      const invoice: PurchaseInvoice = {
        amount: 100,
        amountAllocated: 100,
      } as PurchaseInvoice;

      expect(getPaymentStatus(invoice)).toBe('linked');
    });

    it('returns "partially-linked" when partially allocated', () => {
      const invoice: PurchaseInvoice = {
        amount: 100,
        amountAllocated: 50,
      } as PurchaseInvoice;

      expect(getPaymentStatus(invoice)).toBe('partially-linked');
    });

    it('returns "unlinked" when amountAllocated is undefined', () => {
      const invoice: PurchaseInvoice = {
        amount: 100,
        amountAllocated: undefined,
      } as PurchaseInvoice;

      expect(getPaymentStatus(invoice)).toBe('unlinked');
    });

    it('handles negative amounts correctly', () => {
      const invoice: PurchaseInvoice = {
        amount: -100,
        amountAllocated: -100,
      } as PurchaseInvoice;

      expect(getPaymentStatus(invoice)).toBe('linked');
    });
  });

  describe('calculateLineItemsTotal', () => {
    it('returns 0 when lines is undefined', () => {
      expect(calculateLineItemsTotal(undefined)).toBe(0);
    });

    it('returns 0 when lines is empty array', () => {
      expect(calculateLineItemsTotal([])).toBe(0);
    });

    it('calculates total for single line item', () => {
      const lines: PurchaseInvoiceLine[] = [
        {
          uuid: '1',
          quantity: 2,
          description: 'Item 1',
          amountExclVat: 50,
          vatPercentage: 21,
          category: null,
        },
      ];

      expect(calculateLineItemsTotal(lines)).toBe(50);
    });

    it('calculates total for multiple line items', () => {
      const lines: PurchaseInvoiceLine[] = [
        {
          uuid: '1',
          quantity: 2,
          description: 'Item 1',
          amountExclVat: 50,
          vatPercentage: 21,
          category: null,
        },
        {
          uuid: '2',
          quantity: 1,
          description: 'Item 2',
          amountExclVat: 75.50,
          vatPercentage: 21,
          category: null,
        },
        {
          uuid: '3',
          quantity: 3,
          description: 'Item 3',
          amountExclVat: 25,
          vatPercentage: 21,
          category: null,
        },
      ];

      expect(calculateLineItemsTotal(lines)).toBe(150.50);
    });

    it('handles line items with amountExclVat as 0', () => {
      const lines: PurchaseInvoiceLine[] = [
        {
          uuid: '1',
          quantity: 1,
          description: 'Free item',
          amountExclVat: 0,
          vatPercentage: 21,
          category: null,
        },
        {
          uuid: '2',
          quantity: 1,
          description: 'Paid item',
          amountExclVat: 100,
          vatPercentage: 21,
          category: null,
        },
      ];

      expect(calculateLineItemsTotal(lines)).toBe(100);
    });
  });

  describe('createNewInvoice', () => {
    it('creates a new invoice with default values', () => {
      const invoice = createNewInvoice();

      expect(invoice.purchaseInvoiceUploadUuid).toContain('temp-');
      expect(invoice.invoiceNumber).toBe('');
      expect(invoice.contactUuid).toBeNull();
      expect(invoice.amount).toBe(0);
      expect(invoice.currency).toBe('EUR');
      expect(invoice.status).toBe('unpaid');
      expect(invoice.lines).toEqual([]);
    });

    it('creates invoice with current date', () => {
      const beforeCreate = new Date().toISOString();
      const invoice = createNewInvoice();
      const afterCreate = new Date().toISOString();

      // Invoice date should be between before and after
      expect(invoice.invoiceSentDate >= beforeCreate).toBe(true);
      expect(invoice.invoiceSentDate <= afterCreate).toBe(true);
    });

    it('creates temp IDs starting with temp-', () => {
      const invoice1 = createNewInvoice();
      const invoice2 = createNewInvoice();

      expect(invoice1.purchaseInvoiceUploadUuid).toContain('temp-');
      expect(invoice2.purchaseInvoiceUploadUuid).toContain('temp-');
    });
  });

  describe('createNewInvoiceLine', () => {
    it('creates a new invoice line with default values', () => {
      const line = createNewInvoiceLine();

      expect(line.uuid).toContain('temp-');
      expect(line.quantity).toBe(1);
      expect(line.description).toBeNull();
      expect(line.amountExclVat).toBe(0);
      expect(line.vatPercentage).toBe(21);
      expect(line.category).toBeNull();
    });

    it('creates temp IDs starting with temp-', () => {
      const line1 = createNewInvoiceLine();
      const line2 = createNewInvoiceLine();

      expect(line1.uuid).toContain('temp-');
      expect(line2.uuid).toContain('temp-');
    });
  });

  describe('validateFileType', () => {
    it('returns true for PDF files', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      expect(validateFileType(file)).toBe(true);
    });

    it('returns true for PNG files', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      expect(validateFileType(file)).toBe(true);
    });

    it('returns true for JPEG files', () => {
      const file = new File([''], 'test.jpeg', { type: 'image/jpeg' });
      expect(validateFileType(file)).toBe(true);
    });

    it('returns true for JPG files', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpg' });
      expect(validateFileType(file)).toBe(true);
    });

    it('returns false for unsupported file types', () => {
      const file = new File([''], 'test.doc', { type: 'application/msword' });
      expect(validateFileType(file)).toBe(false);
    });

    it('returns false for text files', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      expect(validateFileType(file)).toBe(false);
    });

    it('returns false for Excel files', () => {
      const file = new File([''], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      expect(validateFileType(file)).toBe(false);
    });
  });

  describe('transformLineItemsForBackend', () => {
    it('transforms line items with permanent UUIDs', () => {
      const lines: PurchaseInvoiceLine[] = [
        {
          uuid: 'permanent-uuid-1',
          quantity: 2,
          description: 'Item 1',
          amountExclVat: 50,
          vatPercentage: 21,
          category: 'account-uuid-1',
        },
      ];

      const result = transformLineItemsForBackend(lines);

      expect(result).toEqual([
        {
          uuid: 'permanent-uuid-1',
          description: 'Item 1',
          quantity: 2,
          totalAmountExclVat: 50,
          vatPercentage: 21,
          accountUuid: 'account-uuid-1',
        },
      ]);
    });

    it('removes temp UUIDs', () => {
      const lines: PurchaseInvoiceLine[] = [
        {
          uuid: 'temp-123456',
          quantity: 1,
          description: 'New item',
          amountExclVat: 100,
          vatPercentage: 21,
          category: 'account-uuid-1',
        },
      ];

      const result = transformLineItemsForBackend(lines);

      expect(result[0].uuid).toBeUndefined();
    });

    it('uses default account UUID when category is null', () => {
      const lines: PurchaseInvoiceLine[] = [
        {
          uuid: 'permanent-uuid-1',
          quantity: 1,
          description: 'Item',
          amountExclVat: 50,
          vatPercentage: 21,
          category: null,
        },
      ];

      const result = transformLineItemsForBackend(lines);

      expect(result[0].accountUuid).toBe('4e217aca-210f-401a-9407-400c16f9917b');
    });

    it('transforms multiple line items', () => {
      const lines: PurchaseInvoiceLine[] = [
        {
          uuid: 'permanent-uuid-1',
          quantity: 2,
          description: 'Item 1',
          amountExclVat: 50,
          vatPercentage: 21,
          category: 'account-uuid-1',
        },
        {
          uuid: 'temp-123',
          quantity: 1,
          description: 'Item 2',
          amountExclVat: 75,
          vatPercentage: 9,
          category: 'account-uuid-2',
        },
      ];

      const result = transformLineItemsForBackend(lines);

      expect(result).toHaveLength(2);
      expect(result[0].uuid).toBe('permanent-uuid-1');
      expect(result[1].uuid).toBeUndefined();
      expect(result[0].totalAmountExclVat).toBe(50);
      expect(result[1].totalAmountExclVat).toBe(75);
    });

    it('maps field names correctly', () => {
      const lines: PurchaseInvoiceLine[] = [
        {
          uuid: 'uuid-1',
          quantity: 3,
          description: 'Test item',
          amountExclVat: 150,
          vatPercentage: 21,
          category: 'cat-1',
        },
      ];

      const result = transformLineItemsForBackend(lines);

      expect(result[0]).toHaveProperty('totalAmountExclVat');
      expect(result[0]).not.toHaveProperty('amountExclVat');
      expect(result[0]).toHaveProperty('accountUuid');
      expect(result[0]).not.toHaveProperty('category');
    });
  });
});
