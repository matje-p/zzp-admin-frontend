import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface Subscription {
  uuid: string;
  name: string;
  provider: string;
  category: string | null;
  amount: number;
  currency: string;
  billingCycle: string;
  startDate: string;
  endDate: string | null;
  nextBillingDate: string | null;
  status: string;
  cancelledAt: string | null;
  paymentMethod: string | null;
  contactUuid: string | null;
  description: string | null;
  notes: string | null;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
}

// Backend response type
interface SubscriptionsResponse {
  total: number;
  subscriptions: Subscription[];
}

// Fetch all subscriptions
export const useSubscriptions = () => {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data } = await apiClient.get<SubscriptionsResponse>('/api/subscription');
      return data.subscriptions;
    },
  });
};

// Fetch single subscription
export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: ['subscriptions', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Subscription>(`/api/subscription/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create subscription
export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSubscription: Omit<Subscription, 'uuid' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await apiClient.post<{ message: string; subscription: Subscription }>('/api/subscription', newSubscription);
      return data.subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

// Update subscription
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, ...updates }: Partial<Subscription> & { uuid: string }) => {
      const { data } = await apiClient.put<{ message: string; subscription: Subscription }>(`/api/subscription/${uuid}`, updates);
      return data.subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

// Cancel subscription
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      await apiClient.delete(`/api/subscription/${uuid}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};
