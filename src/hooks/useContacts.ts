import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface Contact {
  uuid: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  vatNumber: string | null;
  type: string;
  isActive: boolean;
  notes: string | null;
  purchaseInvoiceCount: number;
  createdAt: string;
  updatedAt: string;
}

// Backend response type
interface ContactsResponse {
  total: number;
  contacts: Contact[];
}

// Fetch all contacts
export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data } = await apiClient.get<ContactsResponse>('/api/contact');
      return data.contacts;
    },
  });
};

// Fetch single contact
export const useContact = (id: string) => {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Contact>(`/api/contact/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create contact
export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newContact: Omit<Contact, 'uuid' | 'createdAt' | 'updatedAt'>) => {
      const { data } = await apiClient.post<{ message: string; contact: Contact }>('/api/contact', newContact);
      return data.contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

// Update contact
export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, ...updates }: Partial<Contact> & { uuid: string }) => {
      const { data } = await apiClient.patch<Contact>(`/api/contact/${uuid}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

// Delete contact
export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      await apiClient.delete(`/api/contact/${uuid}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

// Deactivate contact
export const useDeactivateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      await apiClient.delete(`/api/contact/${uuid}/deactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};
