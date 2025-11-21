/**
 * Profit & Loss data fetching hook
 * Encapsulates API calls and state management for P&L data
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { ProfitAndLossData } from '@/types';

interface ProfitAndLossParams {
  startDate?: string;
  endDate?: string;
}

/**
 * Fetch profit and loss data for a given period
 */
export const useProfitAndLoss = (params?: ProfitAndLossParams) => {
  return useQuery({
    queryKey: ['profitAndLoss', params?.startDate, params?.endDate],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ProfitAndLossData }>(
        '/api/reports/profit-loss',
        { params }
      );
      return data.data;
    },
  });
};
