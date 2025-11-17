/**
 * Contact-related type definitions
 */

export interface Contact {
  uuid: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  vatNumber: string | null;
  type: string;
  isActive: boolean;
  notes: string | null;
  purchaseInvoiceCount: number;
  createdAt: string;
  updatedAt: string;
}
