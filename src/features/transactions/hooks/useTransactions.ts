import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import type {
  Transaction,
  TransactionsResponse,
  SyncTransactionsResponse,
  SyncTransactionsParams,
} from '../../../types';

// Fetch all transactions
export const useTransactions = (limit = 100, offset = 0) => {
  return useQuery({
    queryKey: ['transactions', limit, offset],
    queryFn: async () => {
      const { data } = await apiClient.get<TransactionsResponse>('/api/transactions', {
        params: { limit, offset }
      });
      return data.data;
    },
  });
};

// Fetch single transaction
export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Transaction>(`/transactions/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create transaction
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, 'id'>) => {
      const { data } = await apiClient.post<Transaction>('/transactions', newTransaction);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Update transaction
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data } = await apiClient.put<Transaction>(`/transactions/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Delete transaction
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Sync transactions
export const useSyncTransactions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params?: SyncTransactionsParams) => {
      const { data } = await apiClient.post<SyncTransactionsResponse>('/api/transactions/sync', params || {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Link transaction to invoice
export const useLinkTransactionToInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, invoiceUuid, amount }: {
      transactionId: string;
      invoiceUuid: string;
      amount?: number;
    }) => {
      const { data } = await apiClient.put(
        `/api/transactions/${transactionId}/link-invoice`,
        { invoiceUuid, amount }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payment-matching'] });
    },
  });
};

// Link transaction to account
export const useLinkTransactionToAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ transactionId, accountUuid, amount }: {
      transactionId: string;
      accountUuid: string;
      amount?: number;
    }) => {
      const { data } = await apiClient.put(
        `/api/transactions/${transactionId}/link-account`,
        { accountUuid, amount }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['payment-matching'] });
    },
  });
};
