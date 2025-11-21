import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createTestQueryClient } from '@/test/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useContacts, useContact, useCreateContact, useUpdateContact, useDeleteContact } from './useContacts';
import { apiClient } from '@/lib/api';
import type { Contact } from '@/types';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockContact: Contact = {
  uuid: 'contact-1',
  name: 'Test Contact',
  email: 'test@example.com',
  phone: '+1234567890',
  address: '123 Test St',
  vatNumber: 'NL123456789B01',
  type: 'client',
  isActive: true,
  notes: 'Test notes',
  purchaseInvoiceCount: 5,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
};

describe('useContacts', () => {
  let queryClient: ReturnType<typeof createTestQueryClient>;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useContacts', () => {
    it('fetches contacts successfully', async () => {
      const mockContacts = [mockContact];
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { contacts: mockContacts },
      });

      const { result } = renderHook(() => useContacts(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/contact');
      expect(result.current.data).toEqual(mockContacts);
    });

    it('handles fetch error', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useContacts(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useContact', () => {
    it('fetches single contact when id is provided', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockContact,
      });

      const { result } = renderHook(() => useContact('contact-1'), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.get).toHaveBeenCalledWith('/api/contact/contact-1');
      expect(result.current.data).toEqual(mockContact);
    });

    it('does not fetch when id is empty', () => {
      const { result } = renderHook(() => useContact(''), { wrapper });

      expect(result.current.fetchStatus).toBe('idle');
      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  describe('useCreateContact', () => {
    it('creates contact and invalidates cache', async () => {
      const newContact = {
        name: 'New Contact',
        email: 'new@example.com',
        phone: '',
        address: '',
        vatNumber: '',
        type: 'client' as const,
        isActive: true,
        notes: '',
        purchaseInvoiceCount: 0,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { message: 'Created', contact: { ...newContact, uuid: 'new-uuid' } },
      });

      const { result } = renderHook(() => useCreateContact(), { wrapper });

      result.current.mutate(newContact);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.post).toHaveBeenCalledWith('/api/contact', newContact);
      expect(result.current.data?.uuid).toBe('new-uuid');
    });
  });

  describe('useUpdateContact', () => {
    it('updates contact and invalidates cache', async () => {
      const updates = { uuid: 'contact-1', name: 'Updated Name' };

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { ...mockContact, name: 'Updated Name' },
      });

      const { result } = renderHook(() => useUpdateContact(), { wrapper });

      result.current.mutate(updates);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.patch).toHaveBeenCalledWith('/api/contact/contact-1', { name: 'Updated Name' });
    });
  });

  describe('useDeleteContact', () => {
    it('deletes contact and invalidates cache', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: null });

      const { result } = renderHook(() => useDeleteContact(), { wrapper });

      result.current.mutate('contact-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(apiClient.delete).toHaveBeenCalledWith('/api/contact/contact-1');
    });
  });
});
