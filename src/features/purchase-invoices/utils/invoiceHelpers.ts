/**
 * Helper utilities for invoice operations
 */

import type { PurchaseInvoice, PurchaseInvoiceLine } from "../../../types";
import { getAssignmentStatus, type AssignmentStatus } from "../../../utils/status";

/**
 * Get payment status for an invoice (linked/partially-linked/unlinked)
 * Uses the generic assignment status logic
 */
export const getPaymentStatus = (
  invoice: PurchaseInvoice
): "linked" | "partially-linked" | "unlinked" => {
  const status = getAssignmentStatus(invoice.amountAllocated, invoice.amount);

  // Map assignment status to payment status
  const statusMap: Record<AssignmentStatus, "linked" | "partially-linked" | "unlinked"> = {
    'assigned': 'linked',
    'partially-assigned': 'partially-linked',
    'unassigned': 'unlinked',
  };

  return statusMap[status];
};

export const calculateLineItemsTotal = (
  lines: PurchaseInvoiceLine[] | undefined
): number => {
  if (!lines || lines.length === 0) return 0;
  return lines.reduce((sum, line) => sum + (line.amountExclVat || 0), 0);
};

export const createNewInvoice = (): PurchaseInvoice => {
  return {
    purchaseInvoiceUploadUuid: `temp-${Date.now()}`,
    invoiceNumber: "",
    invoiceSentDate: new Date().toISOString(),
    dueDate: null,
    contactName: null,
    contactUuid: null,
    category: null,
    amount: 0,
    amountExclVat: null,
    vatAmount: null,
    vatPercentage: null,
    currency: "EUR",
    status: "unpaid",
    paidAt: null,
    paymentMethod: null,
    description: null,
    notes: null,
    documentUuid: null,
    subscriptionUuid: null,
    transactionUuid: null,
    filePath: null,
    filename: null,
    periodStartDate: null,
    periodEndDate: null,
    lines: [],
  };
};

export const createNewInvoiceLine = (): PurchaseInvoiceLine => {
  return {
    uuid: `temp-${Date.now()}`,
    quantity: 1,
    description: null,
    amountExclVat: 0,
    vatPercentage: 21,
    category: null,
  };
};

export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];
  return allowedTypes.includes(file.type);
};

export const transformLineItemsForBackend = (lines: PurchaseInvoiceLine[]) => {
  return lines.map((line) => ({
    uuid: line.uuid.startsWith("temp-") ? undefined : line.uuid,
    description: line.description,
    quantity: line.quantity,
    totalAmountExclVat: line.amountExclVat,
    vatPercentage: line.vatPercentage,
    accountUuid: line.category || "4e217aca-210f-401a-9407-400c16f9917b",
  }));
};
