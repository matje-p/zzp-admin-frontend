import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface PurchaseInvoice {
  purchaseInvoiceUploadUuid: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  contactName: string | null;
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
  subscriptionUuid: string | null;
}

// Backend response type
interface PurchaseInvoicesResponse {
  total: number;
  invoices: PurchaseInvoice[];
}

// Fetch all purchase invoices
export const usePurchaseInvoices = () => {
  return useQuery({
    queryKey: ['purchaseInvoices'],
    queryFn: async () => {
      const { data } = await apiClient.get<PurchaseInvoicesResponse>('/api/purchase-invoice');
      return data.invoices;
    },
  });
};

// Fetch single purchase invoice
export const usePurchaseInvoice = (id: string) => {
  return useQuery({
    queryKey: ['purchaseInvoices', id],
    queryFn: async () => {
      const { data } = await apiClient.get<PurchaseInvoice>(`/api/purchase-invoice/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create purchase invoice
export const useCreatePurchaseInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newInvoice: Omit<PurchaseInvoice, 'id' | 'createdAt'>) => {
      const { data } = await apiClient.post<PurchaseInvoice>('/api/purchase-invoice', newInvoice);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

// Update purchase invoice
export const useUpdatePurchaseInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PurchaseInvoice> & { id: string }) => {
      const { data } = await apiClient.put<PurchaseInvoice>(`/api/purchase-invoice/${id}`, updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

// Delete purchase invoice
export const useDeletePurchaseInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/purchase-invoice/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};
