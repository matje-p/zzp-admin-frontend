import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api';
import type {
  PurchaseInvoice,
  PurchaseInvoiceLine,
  Contact,
  Account,
  InvoiceStats,
  ExtractInvoiceResponse,
  PurchaseInvoicesResponse,
  StandardResponse,
} from '../../../types';

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
export const usePurchaseInvoice = (uuid: string) => {
  return useQuery({
    queryKey: ['purchaseInvoices', uuid],
    queryFn: async () => {
      const { data } = await apiClient.get<PurchaseInvoice>(`/api/purchase-invoice/${uuid}`);
      return data;
    },
    enabled: !!uuid,
  });
};

// Fetch invoice statistics
export const usePurchaseInvoiceStats = () => {
  return useQuery({
    queryKey: ['purchaseInvoices', 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<StandardResponse<InvoiceStats>>('/api/purchase-invoice/stats');
      return data.data;
    },
  });
};

// Fetch unpaid invoices
export const useUnpaidPurchaseInvoices = () => {
  return useQuery({
    queryKey: ['purchaseInvoices', 'unpaid'],
    queryFn: async () => {
      const { data } = await apiClient.get<StandardResponse<PurchaseInvoice[]>>('/api/purchase-invoice/unpaid');
      return data.data;
    },
  });
};

// Fetch overdue invoices
export const useOverduePurchaseInvoices = () => {
  return useQuery({
    queryKey: ['purchaseInvoices', 'overdue'],
    queryFn: async () => {
      const { data } = await apiClient.get<StandardResponse<PurchaseInvoice[]>>('/api/purchase-invoice/overdue');
      return data.data;
    },
  });
};

// Fetch invoices by category
export const usePurchaseInvoicesByCategory = (category: string) => {
  return useQuery({
    queryKey: ['purchaseInvoices', 'category', category],
    queryFn: async () => {
      const { data } = await apiClient.get<StandardResponse<PurchaseInvoice[]>>(`/api/purchase-invoice/category/${category}`);
      return data.data;
    },
    enabled: !!category,
  });
};

// Fetch invoices by contact name
export const usePurchaseInvoicesByContact = (contactName: string) => {
  return useQuery({
    queryKey: ['purchaseInvoices', 'contact', contactName],
    queryFn: async () => {
      const { data } = await apiClient.get<StandardResponse<PurchaseInvoice[]>>(`/api/purchase-invoice/contact/${contactName}`);
      return data.data;
    },
    enabled: !!contactName,
  });
};

// Extract invoice from document
export const useExtractPurchaseInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentUuid: string) => {
      const { data } = await apiClient.post<ExtractInvoiceResponse>(`/api/purchase-invoice/extract/${documentUuid}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

// Create purchase invoice
export const useCreatePurchaseInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoice: Omit<PurchaseInvoice, 'purchaseInvoiceUploadUuid'>) => {
      const { data } = await apiClient.post<StandardResponse<PurchaseInvoice>>('/api/purchase-invoice', invoice);
      return data.data;
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
    mutationFn: async ({ uuid, lines, ...updates }: Partial<PurchaseInvoice> & { uuid: string }) => {
      // Include line items if present
      const payload = {
        ...updates,
        ...(lines && { lineItems: lines })
      };
      const { data } = await apiClient.put<StandardResponse<PurchaseInvoice>>(`/api/purchase-invoice/${uuid}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

// Update purchase invoice status
export const useUpdatePurchaseInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, status, paidAt }: { uuid: string; status: string; paidAt?: string }) => {
      const { data } = await apiClient.patch<{ message: string; invoice: PurchaseInvoice }>(`/api/purchase-invoice/${uuid}/status`, {
        status,
        paidAt,
      });
      return data.invoice;
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
    mutationFn: async (uuid: string) => {
      const { data } = await apiClient.delete<StandardResponse<void>>(`/api/purchase-invoice/${uuid}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
};

// Add purchase invoice line
export const useAddPurchaseInvoiceLine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceUuid, line }: { invoiceUuid: string; line: Omit<PurchaseInvoiceLine, 'uuid'> }) => {
      const { data } = await apiClient.post<StandardResponse<PurchaseInvoiceLine>>(
        `/api/purchase-invoice/${invoiceUuid}/lines`,
        line
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
    },
  });
};

// Delete purchase invoice line
export const useDeletePurchaseInvoiceLine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceUuid, lineUuid }: { invoiceUuid: string; lineUuid: string }) => {
      const { data } = await apiClient.delete<StandardResponse<void>>(
        `/api/purchase-invoice/${invoiceUuid}/lines/${lineUuid}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseInvoices'] });
    },
  });
};

// Fetch invoices by subscription
export const usePurchaseInvoicesBySubscription = (subscriptionUuid: string) => {
  return useQuery({
    queryKey: ['purchaseInvoices', 'subscription', subscriptionUuid],
    queryFn: async () => {
      const { data } = await apiClient.get<PurchaseInvoicesResponse>('/api/purchase-invoice', {
        params: { subscriptionUuid }
      });
      return data.invoices;
    },
    enabled: !!subscriptionUuid,
  });
};

// Fetch all contacts
export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ total: number; contacts: Contact[] }>('/api/contact');
      return data.contacts;
    },
  });
};

// Fetch expense accounts
export const useExpenseAccounts = () => {
  return useQuery({
    queryKey: ['accounts', 'expense'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: Account[] }>('/api/accounting/accounts', {
        params: { type: 'expense' }
      });
      return data.data;
    },
  });
};
