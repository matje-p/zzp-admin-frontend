import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createTestQueryClient } from '@/test/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useExpenseAccounts } from './useExpenseAccounts';
import { apiClient } from '@/lib/api';
import type { Account } from '@/types';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockAccount: Account = {
  uuid: 'account-1',
  name: 'Office Supplies',
  code: '6100',
  type: 'expense',
  description: 'General office supplies and materials',
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('useExpenseAccounts', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('fetches expense accounts successfully', async () => {
    const mockAccounts = [mockAccount];
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: mockAccounts },
    });

    const { result } = renderHook(() => useExpenseAccounts(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith('/api/accounting/accounts', {
      params: { type: 'expense' }
    });
    expect(result.current.data).toEqual(mockAccounts);
  });

  it('handles fetch error', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useExpenseAccounts(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeTruthy();
  });

  it('returns empty array when no accounts exist', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, data: [] },
    });

    const { result } = renderHook(() => useExpenseAccounts(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});
