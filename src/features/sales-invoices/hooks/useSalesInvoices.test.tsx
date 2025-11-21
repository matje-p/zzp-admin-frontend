import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createTestQueryClient } from '@/test/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useSalesInvoices,
  useSalesInvoice,
  useCreateSalesInvoice,
  useUpdateSalesInvoice,
  useDeleteSalesInvoice,
  type SalesInvoice,
  type CreateSalesInvoiceDto,
} from './useSalesInvoices';
import { apiClient } from '@/lib/api';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockSalesInvoice: SalesInvoice = {
  uuid: 'sales-invoice-1',
  invoiceNumber: 'SI-001',
  invoiceDate: '2025-01-15T00:00:00Z',
  dueDate: '2025-02-15T00:00:00Z',
  clientName: 'Test Client',
  clientEmail: 'client@test.com',
  clientAddress: '456 Client Ave',
  clientVatNumber: 'NL987654321B01',
  contactUuid: 'contact-1',
  description: 'Consulting services',
  items: JSON.stringify([
    { description: 'Service 1', quantity: 10, unitPrice: 50, amount: 500 }
  ]),
  subtotal: 500,
  vatAmount: 105,
  vatPercentage: 21,
  totalAmount: 605,
  currency: 'EUR',
  status: 'sent',
  sentAt: '2025-01-15T10:00:00Z',
  paidAt: null,
  paymentMethod: null,
  paymentReference: null,
  notes: 'Please pay within 30 days',
  termsAndConditions: 'Standard terms apply',
  documentUuid: 'doc-2',
  metadata: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
};

describe('useSalesInvoices hooks', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useSalesInvoices', () => {
    it('fetches all sales invoices successfully', async () => {
      const mockInvoices = [mockSalesInvoice];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { success: true, total: 1, data: mockInvoices },
      });

      const { result } = renderHook(() => useSalesInvoices(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/sales-invoice');
      expect(result.current.data).toEqual(mockInvoices);
    });

    it('handles fetch error', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSalesInvoices(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useSalesInvoice', () => {
    it('fetches single sales invoice when uuid is provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { success: true, data: mockSalesInvoice },
      });

      const { result } = renderHook(() => useSalesInvoice('sales-invoice-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/sales-invoice/sales-invoice-1');
      expect(result.current.data).toEqual(mockSalesInvoice);
    });

    it('does not fetch when uuid is empty', () => {
      const { result } = renderHook(() => useSalesInvoice(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('useCreateSalesInvoice', () => {
    it('creates sales invoice and invalidates cache', async () => {
      const newInvoice: CreateSalesInvoiceDto = {
        invoiceNumber: 'SI-002',
        invoiceDate: '2025-01-20T00:00:00Z',
        dueDate: '2025-02-20T00:00:00Z',
        clientName: 'New Client',
        clientEmail: 'newclient@test.com',
        subtotal: 300,
        vatAmount: 63,
        vatPercentage: 21,
        totalAmount: 363,
        currency: 'EUR',
        status: 'draft',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, data: { ...newInvoice, uuid: 'new-sales-invoice' } },
      });

      const { result } = renderHook(() => useCreateSalesInvoice(), { wrapper });

      result.current.mutate(newInvoice);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/api/sales-invoice', newInvoice);
      expect(result.current.data?.uuid).toBe('new-sales-invoice');
    });
  });

  describe('useUpdateSalesInvoice', () => {
    it('updates sales invoice and invalidates cache', async () => {
      const updates = { uuid: 'sales-invoice-1', status: 'paid', paidAt: '2025-02-01T00:00:00Z' };

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { success: true, data: { ...mockSalesInvoice, status: 'paid', paidAt: '2025-02-01T00:00:00Z' } },
      });

      const { result } = renderHook(() => useUpdateSalesInvoice(), { wrapper });

      result.current.mutate(updates);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.patch).toHaveBeenCalledWith('/api/sales-invoice/sales-invoice-1', {
        status: 'paid',
        paidAt: '2025-02-01T00:00:00Z',
      });
    });
  });

  describe('useDeleteSalesInvoice', () => {
    it('deletes sales invoice and invalidates cache', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: null });

      const { result } = renderHook(() => useDeleteSalesInvoice(), { wrapper });

      result.current.mutate('sales-invoice-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.delete).toHaveBeenCalledWith('/api/sales-invoice/sales-invoice-1');
    });
  });
});
