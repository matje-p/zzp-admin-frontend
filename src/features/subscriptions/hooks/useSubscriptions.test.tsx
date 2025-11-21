import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createTestQueryClient } from '@/test/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSubscriptions, useSubscription, useCreateSubscription, useUpdateSubscription, useCancelSubscription } from './useSubscriptions';
import { apiClient } from '@/lib/api';
import type { Subscription } from '@/types';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockSubscription: Subscription = {
  uuid: 'sub-1',
  name: 'Netflix',
  provider: 'Netflix Inc.',
  category: 'Entertainment',
  amount: 15.99,
  currency: 'EUR',
  billingCycle: 'monthly',
  startDate: '2025-01-01T00:00:00Z',
  endDate: null,
  nextBillingDate: '2025-02-01T00:00:00Z',
  status: 'active',
  description: 'Streaming service',
  cancelledAt: null,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('useSubscriptions hooks', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useSubscriptions', () => {
    it('fetches subscriptions successfully', async () => {
      const mockSubscriptions = [mockSubscription];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { subscriptions: mockSubscriptions },
      });

      const { result } = renderHook(() => useSubscriptions(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/subscription');
      expect(result.current.data).toEqual(mockSubscriptions);
    });

    it('handles fetch error', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSubscriptions(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useSubscription', () => {
    it('fetches single subscription when id is provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockSubscription,
      });

      const { result } = renderHook(() => useSubscription('sub-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/subscription/sub-1');
      expect(result.current.data).toEqual(mockSubscription);
    });

    it('does not fetch when id is empty', () => {
      const { result } = renderHook(() => useSubscription(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('useCreateSubscription', () => {
    it('creates subscription and invalidates cache', async () => {
      const newSubscription = {
        name: 'Spotify',
        provider: 'Spotify AB',
        category: 'Music',
        amount: 9.99,
        currency: 'EUR' as const,
        billingCycle: 'monthly' as const,
        startDate: '2025-01-15T00:00:00Z',
        endDate: null,
        nextBillingDate: '2025-02-15T00:00:00Z',
        status: 'active' as const,
        description: 'Music streaming',
        cancelledAt: null,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { message: 'Created', subscription: { ...newSubscription, uuid: 'new-sub' } },
      });

      const { result } = renderHook(() => useCreateSubscription(), { wrapper });

      result.current.mutate(newSubscription);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/api/subscription', newSubscription);
      expect(result.current.data?.uuid).toBe('new-sub');
    });
  });

  describe('useUpdateSubscription', () => {
    it('updates subscription and invalidates cache', async () => {
      const updates = { uuid: 'sub-1', amount: 17.99 };

      vi.mocked(apiClient.put).mockResolvedValueOnce({
        data: { message: 'Updated', subscription: { ...mockSubscription, amount: 17.99 } },
      });

      const { result } = renderHook(() => useUpdateSubscription(), { wrapper });

      result.current.mutate(updates);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.put).toHaveBeenCalledWith('/api/subscription/sub-1', { amount: 17.99 });
    });
  });

  describe('useCancelSubscription', () => {
    it('cancels subscription and invalidates cache', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: null });

      const { result } = renderHook(() => useCancelSubscription(), { wrapper });

      result.current.mutate('sub-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.delete).toHaveBeenCalledWith('/api/subscription/sub-1');
    });
  });
});
