import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface PaymentMatchingAccount {
  uuid?: string;
  code: string;
  name: string;
  type?: string;
  isExpenseAccount?: boolean;
  isIncomeAccount?: boolean;
}

export interface UnmatchedInvoice {
  purchaseInvoiceUuid: string;
  description: string;
  invoiceDate: string;
  totalAmountInclVat: number;
  allocatedAmountInclVat: number;
}

interface PaymentMatchingResponse {
  success: boolean;
  data: {
    unmatchedInvoices: UnmatchedInvoice[];
    expenseAccounts?: PaymentMatchingAccount[];
    incomeAccounts?: PaymentMatchingAccount[];
  };
}

export interface PaymentMatchingData {
  accounts: PaymentMatchingAccount[];
  invoices: UnmatchedInvoice[];
}

/**
 * Fetch payment matching data for expense accounts and unmatched invoices
 */
export const useExpenseMatching = () => {
  return useQuery({
    queryKey: ['payment-matching', 'expense'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaymentMatchingResponse>(
        '/api/payment-matching/payment-matches',
        { params: { isExpense: true } }
      );
      return {
        accounts: data.data.expenseAccounts || [],
        invoices: data.data.unmatchedInvoices || [],
      };
    },
  });
};

/**
 * Fetch payment matching data for income accounts and unmatched invoices
 */
export const useIncomeMatching = () => {
  return useQuery({
    queryKey: ['payment-matching', 'income'],
    queryFn: async () => {
      const { data } = await apiClient.get<PaymentMatchingResponse>(
        '/api/payment-matching/payment-matches',
        { params: { isIncome: true } }
      );
      return {
        accounts: data.data.incomeAccounts || [],
        invoices: data.data.unmatchedInvoices || [],
      };
    },
  });
};
