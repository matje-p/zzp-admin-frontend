import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export interface PurchaseInvoiceLine {
  uuid: string;
  quantity: number;
  description: string | null;
  amountExclVat: number;
  vatPercentage: number | null;
  category: string | null;
}

export interface PurchaseInvoice {
  purchaseInvoiceUploadUuid: string;
  invoiceNumber: string;
  invoiceSentDate: string;
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
  transactionUuid: string | null;
  filePath: string | null;
  filename: string | null;
  amountAllocated?: number;
  periodStartDate: string | null;
  periodEndDate: string | null;
  lines?: PurchaseInvoiceLine[];
  document?: {
    uuid: string;
    filename: string;
    filePath?: string;
  };
  bankTransactions?: any[];
}

// Backend response types
interface PurchaseInvoicesResponse {
  total: number;
  invoices: PurchaseInvoice[];
}

interface StandardResponse<T> {
  success: boolean;
  count?: number;
  data: T;
}

interface InvoiceStats {
  total: number;
  unpaid: number;
  paid: number;
  overdue: number;
  totalAmount: number;
  unpaidAmount: number;
  paidAmount: number;
}

interface ExtractInvoiceResponse {
  message: string;
  invoice: PurchaseInvoice;
  metadata: {
    sessionId: string;
    provider: string;
    model: string;
  };
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

// Update purchase invoice
export const useUpdatePurchaseInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, ...updates }: Partial<PurchaseInvoice> & { uuid: string }) => {
      const { data } = await apiClient.put<StandardResponse<PurchaseInvoice>>(`/api/purchase-invoice/${uuid}`, updates);
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
