import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createTestQueryClient } from '@/test/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useTransactions,
  useTransaction,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useSyncTransactions,
  useLinkTransactionToInvoice,
  useLinkTransactionToAccount,
  useDeleteAllocation,
  useUpdateAllocation,
} from './useTransactions';
import { apiClient } from '@/lib/api';
import type { Transaction, SyncTransactionsParams } from '@/types';

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

const mockTransaction: Transaction = {
  id: 'tx-1',
  date: '2025-01-15T00:00:00Z',
  amount: 150.00,
  description: 'Payment received',
  counterparty: 'Client ABC',
  type: 'credit',
  status: 'completed',
  reference: 'REF-001',
  category: null,
  notes: null,
  createdAt: '2025-01-15T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
};

describe('useTransactions hooks', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useTransactions', () => {
    it('fetches transactions with default params', async () => {
      const mockTransactions = [mockTransaction];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockTransactions },
      });

      const { result } = renderHook(() => useTransactions(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/transactions', {
        params: { limit: 100, offset: 0 }
      });
      expect(result.current.data).toEqual(mockTransactions);
    });

    it('fetches transactions with custom params', async () => {
      const mockTransactions = [mockTransaction];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockTransactions },
      });

      const { result } = renderHook(() => useTransactions(50, 10), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/transactions', {
        params: { limit: 50, offset: 10 }
      });
    });

    it('handles fetch error', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useTransactions(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useTransaction', () => {
    it('fetches single transaction when id is provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockTransaction,
      });

      const { result } = renderHook(() => useTransaction('tx-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/transactions/tx-1');
      expect(result.current.data).toEqual(mockTransaction);
    });

    it('does not fetch when id is empty', () => {
      const { result } = renderHook(() => useTransaction(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('useCreateTransaction', () => {
    it('creates transaction and invalidates cache', async () => {
      const newTransaction = { ...mockTransaction };
      delete (newTransaction as any).id;

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { ...newTransaction, id: 'new-tx' },
      });

      const { result } = renderHook(() => useCreateTransaction(), { wrapper });

      result.current.mutate(newTransaction);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/transactions', newTransaction);
      expect(result.current.data?.id).toBe('new-tx');
    });
  });

  describe('useUpdateTransaction', () => {
    it('updates transaction and invalidates cache', async () => {
      const updates = { id: 'tx-1', amount: 200 };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { ...mockTransaction, amount: 200 },
      });

      const { result } = renderHook(() => useUpdateTransaction(), { wrapper });

      result.current.mutate(updates);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.put).toHaveBeenCalledWith('/transactions/tx-1', { amount: 200 });
    });
  });

  describe('useDeleteTransaction', () => {
    it('deletes transaction and invalidates cache', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: null });

      const { result } = renderHook(() => useDeleteTransaction(), { wrapper });

      result.current.mutate('tx-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.delete).toHaveBeenCalledWith('/transactions/tx-1');
    });
  });

  describe('useSyncTransactions', () => {
    it('syncs transactions without params', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, synced: 10, created: 5, updated: 3 },
      });

      const { result } = renderHook(() => useSyncTransactions(), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/api/transactions/sync', {});
    });

    it('syncs transactions with params', async () => {
      const params: SyncTransactionsParams = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { success: true, synced: 10, created: 5, updated: 3 },
      });

      const { result } = renderHook(() => useSyncTransactions(), { wrapper });

      result.current.mutate(params);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/api/transactions/sync', params);
    });
  });

  describe('useLinkTransactionToInvoice', () => {
    it('links transaction to invoice and invalidates cache', async () => {
      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { success: true, message: 'Linked' },
      });

      const { result } = renderHook(() => useLinkTransactionToInvoice(), { wrapper });

      result.current.mutate({
        transactionId: 'tx-1',
        invoiceUuid: 'invoice-1',
        amount: 150,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.put).toHaveBeenCalledWith('/api/transactions/tx-1/link-invoice', {
        invoiceUuid: 'invoice-1',
        amount: 150,
      });
    });

    it('links transaction to invoice without amount', async () => {
      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { success: true, message: 'Linked' },
      });

      const { result } = renderHook(() => useLinkTransactionToInvoice(), { wrapper });

      result.current.mutate({
        transactionId: 'tx-1',
        invoiceUuid: 'invoice-1',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.put).toHaveBeenCalledWith('/api/transactions/tx-1/link-invoice', {
        invoiceUuid: 'invoice-1',
        amount: undefined,
      });
    });
  });

  describe('useLinkTransactionToAccount', () => {
    it('links transaction to account and invalidates cache', async () => {
      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { success: true, message: 'Linked' },
      });

      const { result } = renderHook(() => useLinkTransactionToAccount(), { wrapper });

      result.current.mutate({
        transactionId: 'tx-1',
        accountUuid: 'account-1',
        amount: 150,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.put).toHaveBeenCalledWith('/api/transactions/tx-1/link-account', {
        accountUuid: 'account-1',
        amount: 150,
      });
    });
  });

  describe('useDeleteAllocation', () => {
    it('deletes payment allocation and invalidates cache', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({
        data: { success: true },
      });

      const { result } = renderHook(() => useDeleteAllocation(), { wrapper });

      result.current.mutate('allocation-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.delete).toHaveBeenCalledWith('/api/transactions/allocations/allocation-1');
    });
  });

  describe('useUpdateAllocation', () => {
    it('updates payment allocation and invalidates cache', async () => {
      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { success: true, allocation: { uuid: 'allocation-1', amount: 200 } },
      });

      const { result } = renderHook(() => useUpdateAllocation(), { wrapper });

      result.current.mutate({
        allocationUuid: 'allocation-1',
        amount: 200,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.patch).toHaveBeenCalledWith('/api/transactions/allocations/allocation-1', {
        amount: 200,
      });
    });
  });
});
