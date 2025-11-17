/**
 * Subscription-related type definitions
 */

export interface Subscription {
  uuid: string;
  name: string;
  provider: string;
  category: string | null;
  amount: number;
  currency: string;
  billingCycle: string;
  startDate: string;
  endDate: string | null;
  nextBillingDate: string | null;
  status: string;
  cancelledAt: string | null;
  paymentMethod: string | null;
  contactUuid: string | null;
  description: string | null;
  notes: string | null;
  metadata: string | null;
  createdAt: string;
  updatedAt: string;
}
