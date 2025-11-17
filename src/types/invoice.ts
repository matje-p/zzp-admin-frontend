/**
 * Invoice-related type definitions
 */

import type { Subscription } from './subscription';

export interface PurchaseInvoiceLine {
  uuid: string;
  quantity: number;
  description: string | null;
  amountExclVat: number;
  vatPercentage: number | null;
  category: string | null;
}

export interface Contact {
  uuid: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface Account {
  uuid: string;
  code: string;
  name: string;
  type: string;
}

export interface PurchaseInvoice {
  purchaseInvoiceUploadUuid: string;
  invoiceNumber: string;
  invoiceSentDate: string;
  dueDate: string | null;
  contactName: string | null;
  contactUuid: string | null;
  contact?: Contact;
  subscriptionUuid: string | null;
  subscription?: Subscription;
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

export interface InvoiceStats {
  total: number;
  unpaid: number;
  paid: number;
  overdue: number;
  totalAmount: number;
  unpaidAmount: number;
  paidAmount: number;
}

export interface ExtractInvoiceResponse {
  message: string;
  invoice: PurchaseInvoice;
  metadata: {
    sessionId: string;
    provider: string;
    model: string;
  };
}
