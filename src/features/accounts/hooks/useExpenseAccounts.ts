import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import type { Account } from '../../../types';

/**
 * Fetch expense accounts
 */
export const useExpenseAccounts = () => {
  return useQuery({
    queryKey: ['accounts', 'expense'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: Account[] }>('/api/accounting/accounts', {
        params: { type: 'expense' }
      });
      return data.data;
    },
  });
};
