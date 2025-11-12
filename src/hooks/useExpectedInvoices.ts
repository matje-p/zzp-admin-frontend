import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface ExpectedInvoice {
  uuid: string;
  subscriptionUuid: string;
  periodStartDate: string;
  periodEndDate: string;
  expectedAmount: number | null;
  currency: string;
  status: string;
  invoiceUuid: string | null;
  receivedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExpectedInvoicesResponse {
  success: boolean;
  total: number;
  data: ExpectedInvoice[];
}

// Fetch expected invoices by subscription UUID
export const useExpectedInvoicesBySubscription = (subscriptionUuid: string) => {
  return useQuery({
    queryKey: ['expectedInvoices', 'subscription', subscriptionUuid],
    queryFn: async () => {
      const { data } = await apiClient.get<ExpectedInvoicesResponse>('/api/expected-invoice', {
        params: { subscriptionUuid }
      });
      return data.data;
    },
    enabled: !!subscriptionUuid,
  });
};
