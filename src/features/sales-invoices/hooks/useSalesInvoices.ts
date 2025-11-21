import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface SalesInvoice {
  uuid: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  clientName: string;
  clientEmail: string | null;
  clientAddress: string | null;
  clientVatNumber: string | null;
  contactUuid: string | null;
  description: string | null;
  items: string | null; // JSON string
  subtotal: number;
  vatAmount: number | null;
  vatPercentage: number | null;
  totalAmount: number;
  currency: string;
  status: string; // draft, sent, paid, overdue, cancelled
  sentAt: string | null;
  paidAt: string | null;
  paymentMethod: string | null;
  paymentReference: string | null;
  notes: string | null;
  termsAndConditions: string | null;
  documentUuid: string | null;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesInvoiceDto {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  clientVatNumber?: string;
  contactUuid?: string;
  description?: string;
  items?: string;
  subtotal: number;
  vatAmount?: number;
  vatPercentage?: number;
  totalAmount: number;
  currency?: string;
  status?: string;
  notes?: string;
  termsAndConditions?: string;
}

// Backend response type
interface SalesInvoicesResponse {
  success: boolean;
  total: number;
  data: SalesInvoice[];
}

// Fetch all sales invoices
export const useSalesInvoices = () => {
  return useQuery({
    queryKey: ['salesInvoices'],
    queryFn: async () => {
      const { data } = await apiClient.get<SalesInvoicesResponse>('/api/sales-invoice');
      return data.data;
    },
  });
};

// Fetch single sales invoice
export const useSalesInvoice = (uuid: string) => {
  return useQuery({
    queryKey: ['salesInvoices', uuid],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: SalesInvoice }>(`/api/sales-invoice/${uuid}`);
      return data.data;
    },
    enabled: !!uuid,
  });
};

// Create sales invoice
export const useCreateSalesInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newInvoice: CreateSalesInvoiceDto) => {
      const { data } = await apiClient.post<{ success: boolean; data: SalesInvoice }>('/api/sales-invoice', newInvoice);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesInvoices'] });
    },
  });
};

// Update sales invoice
export const useUpdateSalesInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, ...updates }: Partial<CreateSalesInvoiceDto> & { uuid: string }) => {
      const { data } = await apiClient.patch<{ success: boolean; data: SalesInvoice }>(`/api/sales-invoice/${uuid}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesInvoices'] });
    },
  });
};

// Delete sales invoice
export const useDeleteSalesInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uuid: string) => {
      await apiClient.delete(`/api/sales-invoice/${uuid}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesInvoices'] });
    },
  });
};
