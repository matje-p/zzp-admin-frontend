import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import type { Subscription, SubscriptionsResponse } from '../../../types';

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
