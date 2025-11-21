import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createTestQueryClient } from '@/test/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  usePurchaseInvoices,
  usePurchaseInvoice,
  usePurchaseInvoiceStats,
  useUnpaidPurchaseInvoices,
  useOverduePurchaseInvoices,
  usePurchaseInvoicesByCategory,
  usePurchaseInvoicesByContact,
  useExtractPurchaseInvoice,
  useCreatePurchaseInvoice,
  useUpdatePurchaseInvoice,
  useUpdatePurchaseInvoiceStatus,
  useDeletePurchaseInvoice,
  useAddPurchaseInvoiceLine,
  useDeletePurchaseInvoiceLine,
  usePurchaseInvoicesBySubscription,
} from './usePurchaseInvoices';
import { apiClient } from '@/lib/api';
import type { PurchaseInvoice, InvoiceStats, PurchaseInvoiceLine } from '@/types';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockInvoice: PurchaseInvoice = {
  uuid: 'invoice-1',
  invoiceNumber: 'INV-001',
  invoiceDate: '2025-01-15T00:00:00Z',
  dueDate: '2025-02-15T00:00:00Z',
  supplier: 'Test Supplier',
  supplierEmail: 'supplier@test.com',
  supplierAddress: '123 Supplier St',
  supplierVatNumber: 'NL123456789B01',
  contactUuid: 'contact-1',
  description: 'Test invoice',
  category: 'Office Supplies',
  subtotal: 100,
  vatAmount: 21,
  vatPercentage: 21,
  totalAmount: 121,
  currency: 'EUR',
  status: 'unpaid',
  paidAt: null,
  paymentMethod: null,
  paymentReference: null,
  notes: null,
  documentUuid: 'doc-1',
  purchaseInvoiceUploadUuid: 'upload-1',
  subscriptionUuid: null,
  metadata: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
};

const mockStats: InvoiceStats = {
  total: 10,
  unpaid: 3,
  overdue: 1,
  totalAmount: 1000,
  unpaidAmount: 300,
  overdueAmount: 100,
};

const mockLine: PurchaseInvoiceLine = {
  uuid: 'line-1',
  description: 'Test item',
  quantity: 2,
  unitPrice: 50,
  vatPercentage: 21,
  totalAmount: 121,
};

describe('usePurchaseInvoices hooks', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('usePurchaseInvoices', () => {
    it('fetches all invoices successfully', async () => {
      const mockInvoices = [mockInvoice];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { invoices: mockInvoices },
      });

      const { result } = renderHook(() => usePurchaseInvoices(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/purchase-invoice');
      expect(result.current.data).toEqual(mockInvoices);
    });

    it('handles fetch error', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => usePurchaseInvoices(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('usePurchaseInvoice', () => {
    it('fetches single invoice when uuid is provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockInvoice,
      });

      const { result } = renderHook(() => usePurchaseInvoice('invoice-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/purchase-invoice/invoice-1');
      expect(result.current.data).toEqual(mockInvoice);
    });

    it('does not fetch when uuid is empty', () => {
      const { result } = renderHook(() => usePurchaseInvoice(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('usePurchaseInvoiceStats', () => {
    it('fetches invoice statistics successfully', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockStats },
      });

      const { result } = renderHook(() => usePurchaseInvoiceStats(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/purchase-invoice/stats');
      expect(result.current.data).toEqual(mockStats);
    });
  });

  describe('useUnpaidPurchaseInvoices', () => {
    it('fetches unpaid invoices successfully', async () => {
      const mockInvoices = [mockInvoice];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockInvoices },
      });

      const { result } = renderHook(() => useUnpaidPurchaseInvoices(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/purchase-invoice/unpaid');
      expect(result.current.data).toEqual(mockInvoices);
    });
  });

  describe('useOverduePurchaseInvoices', () => {
    it('fetches overdue invoices successfully', async () => {
      const mockInvoices = [mockInvoice];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockInvoices },
      });

      const { result } = renderHook(() => useOverduePurchaseInvoices(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/purchase-invoice/overdue');
      expect(result.current.data).toEqual(mockInvoices);
    });
  });

  describe('usePurchaseInvoicesByCategory', () => {
    it('fetches invoices by category when category is provided', async () => {
      const mockInvoices = [mockInvoice];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockInvoices },
      });

      const { result } = renderHook(() => usePurchaseInvoicesByCategory('Office Supplies'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/purchase-invoice/category/Office Supplies');
      expect(result.current.data).toEqual(mockInvoices);
    });

    it('does not fetch when category is empty', () => {
      const { result } = renderHook(() => usePurchaseInvoicesByCategory(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('usePurchaseInvoicesByContact', () => {
    it('fetches invoices by contact when contactName is provided', async () => {
      const mockInvoices = [mockInvoice];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockInvoices },
      });

      const { result } = renderHook(() => usePurchaseInvoicesByContact('Test Supplier'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/purchase-invoice/contact/Test Supplier');
      expect(result.current.data).toEqual(mockInvoices);
    });

    it('does not fetch when contactName is empty', () => {
      const { result } = renderHook(() => usePurchaseInvoicesByContact(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('usePurchaseInvoicesBySubscription', () => {
    it('fetches invoices by subscription when subscriptionUuid is provided', async () => {
      const mockInvoices = [mockInvoice];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { invoices: mockInvoices },
      });

      const { result } = renderHook(() => usePurchaseInvoicesBySubscription('sub-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/purchase-invoice', {
        params: { subscriptionUuid: 'sub-1' }
      });
      expect(result.current.data).toEqual(mockInvoices);
    });

    it('does not fetch when subscriptionUuid is empty', () => {
      const { result } = renderHook(() => usePurchaseInvoicesBySubscription(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('useExtractPurchaseInvoice', () => {
    it('extracts invoice from document and invalidates cache', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, invoice: mockInvoice },
      });

      const { result } = renderHook(() => useExtractPurchaseInvoice(), { wrapper });

      result.current.mutate('doc-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/api/purchase-invoice/extract/doc-1');
    });
  });

  describe('useCreatePurchaseInvoice', () => {
    it('creates invoice and invalidates cache', async () => {
      const newInvoice = { ...mockInvoice };
      delete (newInvoice as any).purchaseInvoiceUploadUuid;

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: { ...newInvoice, uuid: 'new-invoice' } },
      });

      const { result } = renderHook(() => useCreatePurchaseInvoice(), { wrapper });

      result.current.mutate(newInvoice);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/api/purchase-invoice', newInvoice);
      expect(result.current.data?.uuid).toBe('new-invoice');
    });
  });

  describe('useUpdatePurchaseInvoice', () => {
    it('updates invoice and invalidates cache', async () => {
      const updates = { uuid: 'invoice-1', totalAmount: 150 };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { data: { ...mockInvoice, totalAmount: 150 } },
      });

      const { result } = renderHook(() => useUpdatePurchaseInvoice(), { wrapper });

      result.current.mutate(updates);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.put).toHaveBeenCalledWith('/api/purchase-invoice/invoice-1', { totalAmount: 150 });
    });

    it('includes line items when updating', async () => {
      const updates = { uuid: 'invoice-1', lines: [mockLine] };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { data: mockInvoice },
      });

      const { result } = renderHook(() => useUpdatePurchaseInvoice(), { wrapper });

      result.current.mutate(updates);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.put).toHaveBeenCalledWith('/api/purchase-invoice/invoice-1', { lineItems: [mockLine] });
    });
  });

  describe('useUpdatePurchaseInvoiceStatus', () => {
    it('updates invoice status and invalidates cache', async () => {
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { message: 'Updated', invoice: { ...mockInvoice, status: 'paid' } },
      });

      const { result } = renderHook(() => useUpdatePurchaseInvoiceStatus(), { wrapper });

      result.current.mutate({ uuid: 'invoice-1', status: 'paid', paidAt: '2025-02-01T00:00:00Z' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.patch).toHaveBeenCalledWith('/api/purchase-invoice/invoice-1/status', {
        status: 'paid',
        paidAt: '2025-02-01T00:00:00Z',
      });
    });
  });

  describe('useDeletePurchaseInvoice', () => {
    it('deletes invoice and invalidates cache', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } });

      const { result } = renderHook(() => useDeletePurchaseInvoice(), { wrapper });

      result.current.mutate('invoice-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.delete).toHaveBeenCalledWith('/api/purchase-invoice/invoice-1');
    });
  });

  describe('useAddPurchaseInvoiceLine', () => {
    it('adds line to invoice and invalidates cache', async () => {
      const newLine = { ...mockLine };
      delete (newLine as any).uuid;

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: { ...newLine, uuid: 'new-line' } },
      });

      const { result } = renderHook(() => useAddPurchaseInvoiceLine(), { wrapper });

      result.current.mutate({ invoiceUuid: 'invoice-1', line: newLine });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/api/purchase-invoice/invoice-1/lines', newLine);
    });
  });

  describe('useDeletePurchaseInvoiceLine', () => {
    it('deletes line from invoice and invalidates cache', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: { success: true } });

      const { result } = renderHook(() => useDeletePurchaseInvoiceLine(), { wrapper });

      result.current.mutate({ invoiceUuid: 'invoice-1', lineUuid: 'line-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.delete).toHaveBeenCalledWith('/api/purchase-invoice/invoice-1/lines/line-1');
    });
  });
});
