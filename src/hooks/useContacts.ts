import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type: 'client' | 'supplier' | 'other';
}

// Fetch all contacts
export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data } = await apiClient.get<Contact[]>('/contacts');
      return data;
    },
  });
};

// Fetch single contact
export const useContact = (id: string) => {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Contact>(`/contacts/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create contact
export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newContact: Omit<Contact, 'id'>) => {
      const { data } = await apiClient.post<Contact>('/contacts', newContact);
      return data;
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
    mutationFn: async ({ id, ...updates }: Partial<Contact> & { id: string }) => {
      const { data } = await apiClient.put<Contact>(`/contacts/${id}`, updates);
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
    mutationFn: async (id: string) => {
      await apiClient.delete(`/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};
