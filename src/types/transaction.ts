/**
 * Transaction-related type definitions
 */

export interface PaymentAllocation {
  uuid: string;
  bankTransactionUuid: string;
  invoiceUuid: string | null;
  accountUuid: string | null;
  amount: string;
  createdAt: string;
  updatedAt: string;
  invoice: {
    purchaseInvoiceUploadUuid: string;
    description: string;
  } | null;
  account: {
    uuid: string;
    code: string;
    name: string;
    type: string;
  } | null;
}

export interface Transaction {
  uuid: string;
  transactionId: string;
  monetaryAccountId: number;
  amount: number;
  currency: string;
  description: string | null;
  counterpartyName: string | null;
  counterpartyIban: string | null;
  type: string;
  subType: string | null;
  created: string;
  category: string | null;
  invoiceUuid: string | null;
  amountAllocated?: number;
  paymentAllocations?: PaymentAllocation[];
}

export interface SyncTransactionsResponse {
  success: boolean;
  message: string;
  totalFetched: number;
  totalSaved: number;
  accounts: Array<{
    accountId: number;
    fetched: number;
    saved: number;
    error?: string;
  }>;
}

export interface SyncTransactionsParams {
  userId?: number;
  monetaryAccountId?: number;
  count?: number;
}
