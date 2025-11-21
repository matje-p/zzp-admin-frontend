import { z } from 'zod';

/**
 * Common validation utilities and schemas
 */

// Email validation
export const emailSchema = z.string().email('Invalid email address').or(z.literal(''));

// VAT number validation (basic European format)
export const vatNumberSchema = z.string()
  .regex(/^[A-Z]{2}[0-9A-Z]+$/, 'Invalid VAT number format (e.g., NL123456789B01)')
  .or(z.literal(''));

// Date validation helpers
export const dateSchema = z.string().min(1, 'Date is required');
export const optionalDateSchema = z.string().optional();

// Currency validation
export const currencySchema = z.enum(['EUR', 'USD', 'GBP']);

// Amount validation
export const positiveAmountSchema = z.number().positive('Amount must be greater than 0');
export const nonNegativeAmountSchema = z.number().min(0, 'Amount cannot be negative');

// Percentage validation
export const percentageSchema = z.number().min(0, 'Percentage cannot be negative').max(100, 'Percentage cannot exceed 100');

/**
 * Sales Invoice validation schema
 */
export const salesInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: dateSchema,
  dueDate: optionalDateSchema,
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: emailSchema,
  clientAddress: z.string().optional(),
  clientVatNumber: vatNumberSchema,
  description: z.string().optional(),
  subtotal: positiveAmountSchema,
  vatPercentage: percentageSchema.optional(),
  vatAmount: nonNegativeAmountSchema,
  totalAmount: positiveAmountSchema,
  currency: currencySchema,
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
  notes: z.string().optional(),
  termsAndConditions: z.string().optional(),
});

export type SalesInvoiceFormData = z.infer<typeof salesInvoiceSchema>;

/**
 * Purchase Invoice Header validation schema
 */
export const purchaseInvoiceHeaderSchema = z.object({
  contactUuid: z.string().min(1, 'Contact is required'),
  subscriptionUuid: z.string().nullable().optional(),
  description: z.string().min(1, 'Description is required').optional(),
  invoiceSentDate: dateSchema,
  periodStartDate: optionalDateSchema,
  periodEndDate: optionalDateSchema,
}).refine((data) => {
  // If subscription UUID is provided, description is not required
  // If subscription UUID is not provided, description is required
  if (!data.subscriptionUuid && !data.description) {
    return false;
  }
  return true;
}, {
  message: 'Either subscription or description is required',
  path: ['description'],
}).refine((data) => {
  // If period dates are provided, validate that end date is after start date
  if (data.periodStartDate && data.periodEndDate) {
    return new Date(data.periodEndDate) >= new Date(data.periodStartDate);
  }
  return true;
}, {
  message: 'Period end date must be after or equal to start date',
  path: ['periodEndDate'],
});

export type PurchaseInvoiceHeaderFormData = z.infer<typeof purchaseInvoiceHeaderSchema>;

/**
 * Contact form validation schema (for future use)
 */
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: emailSchema,
  phone: z.string().optional(),
  address: z.string().optional(),
  vatNumber: vatNumberSchema,
  type: z.enum(['client', 'supplier', 'both']),
  isActive: z.boolean(),
  notes: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Subscription form validation schema (for future use)
 */
export const subscriptionSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  provider: z.string().min(1, 'Provider is required'),
  category: z.string().optional(),
  amount: positiveAmountSchema,
  currency: currencySchema,
  billingCycle: z.enum(['monthly', 'quarterly', 'yearly', 'one-time']),
  startDate: dateSchema,
  endDate: optionalDateSchema,
  nextBillingDate: optionalDateSchema,
  status: z.enum(['active', 'inactive', 'cancelled']),
  description: z.string().optional(),
}).refine((data) => {
  // Validate that end date is after start date if provided
  if (data.endDate && data.startDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
