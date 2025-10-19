import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface Invoice {
  purchaseInvoiceUploadUuid: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  contactName: string | null;
  recipient: string | null;
  category: string | null;
  amount: number;
  amountExclVat: number | null;
  vatAmount: number | null;
  vatPercentage: number | null;
  currency: string;
  status: string;
  paidAt: string | null;
  paymentMethod: string | null;
  description: string | null;
  notes: string | null;
  documentUuid: string | null;
}

// Backend response type
interface InvoicesResponse {
  total: number;
  invoices: Invoice[];
}

// Fetch all invoices
export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await apiClient.get<InvoicesResponse>('/api/purchase-invoice');
      return data.invoices;
    },
  });
};

// Fetch single invoice
export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: async () => {
      const { data } = await apiClient.get<Invoice>(`/api/purchase-invoice/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create invoice
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newInvoice: Omit<Invoice, 'id' | 'createdAt'>) => {
      const { data } = await apiClient.post<Invoice>('/api/purchase-invoice', newInvoice);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

// Update invoice
export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data } = await apiClient.put<Invoice>(`/api/purchase-invoice/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

// Delete invoice
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/purchase-invoice/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};
