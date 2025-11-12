import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface Transaction {
  uuid: string;
  transactionId: string;
  monetaryAccountId: number;
  amount: number;
  currency: string;
  description: string | null;
  counterpartyName: string | null;
  counterpartyIban: string | null;
  type: string;
  subType: string | null;
  created: string;
  category: string | null;
  invoiceUuid: string | null;
  linked?: boolean;
}

// Backend response type
interface TransactionsResponse {
  success: boolean;
  count: number;
  data: Transaction[];
}

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
export interface SyncTransactionsResponse {
  success: boolean;
  message: string;
  totalFetched: number;
  totalSaved: number;
  accounts: Array<{
    accountId: number;
    fetched: number;
    saved: number;
    error?: string;
  }>;
}

export interface SyncTransactionsParams {
  userId?: number;
  monetaryAccountId?: number;
  count?: number;
}

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
