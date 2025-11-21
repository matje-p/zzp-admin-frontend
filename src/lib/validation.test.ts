import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  vatNumberSchema,
  dateSchema,
  currencySchema,
  positiveAmountSchema,
  nonNegativeAmountSchema,
  percentageSchema,
  salesInvoiceSchema,
  purchaseInvoiceHeaderSchema,
  contactSchema,
  subscriptionSchema,
} from './validation';

describe('emailSchema', () => {
  it('validates correct email', () => {
    expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
  });

  it('allows empty string', () => {
    expect(emailSchema.parse('')).toBe('');
  });

  it('rejects invalid email', () => {
    expect(() => emailSchema.parse('invalid')).toThrow('Invalid email address');
  });

  it('rejects email without domain', () => {
    expect(() => emailSchema.parse('test@')).toThrow();
  });
});

describe('vatNumberSchema', () => {
  it('validates correct VAT number', () => {
    expect(vatNumberSchema.parse('NL123456789B01')).toBe('NL123456789B01');
  });

  it('allows empty string', () => {
    expect(vatNumberSchema.parse('')).toBe('');
  });

  it('rejects invalid format (lowercase)', () => {
    expect(() => vatNumberSchema.parse('nl123456789b01')).toThrow();
  });

  it('rejects invalid format (no country code)', () => {
    expect(() => vatNumberSchema.parse('123456789B01')).toThrow();
  });

  it('validates various EU formats', () => {
    expect(vatNumberSchema.parse('DE123456789')).toBe('DE123456789');
    expect(vatNumberSchema.parse('FR12345678901')).toBe('FR12345678901');
    expect(vatNumberSchema.parse('GB123456789')).toBe('GB123456789');
  });
});

describe('dateSchema', () => {
  it('validates non-empty string', () => {
    expect(dateSchema.parse('2025-01-15')).toBe('2025-01-15');
  });

  it('rejects empty string', () => {
    expect(() => dateSchema.parse('')).toThrow('Date is required');
  });
});

describe('currencySchema', () => {
  it('validates EUR', () => {
    expect(currencySchema.parse('EUR')).toBe('EUR');
  });

  it('validates USD', () => {
    expect(currencySchema.parse('USD')).toBe('USD');
  });

  it('validates GBP', () => {
    expect(currencySchema.parse('GBP')).toBe('GBP');
  });

  it('rejects invalid currency', () => {
    expect(() => currencySchema.parse('JPY')).toThrow();
  });
});

describe('positiveAmountSchema', () => {
  it('validates positive number', () => {
    expect(positiveAmountSchema.parse(100.50)).toBe(100.50);
  });

  it('rejects zero', () => {
    expect(() => positiveAmountSchema.parse(0)).toThrow('Amount must be greater than 0');
  });

  it('rejects negative number', () => {
    expect(() => positiveAmountSchema.parse(-10)).toThrow();
  });
});

describe('nonNegativeAmountSchema', () => {
  it('validates positive number', () => {
    expect(nonNegativeAmountSchema.parse(100.50)).toBe(100.50);
  });

  it('allows zero', () => {
    expect(nonNegativeAmountSchema.parse(0)).toBe(0);
  });

  it('rejects negative number', () => {
    expect(() => nonNegativeAmountSchema.parse(-10)).toThrow('Amount cannot be negative');
  });
});

describe('percentageSchema', () => {
  it('validates valid percentage', () => {
    expect(percentageSchema.parse(21)).toBe(21);
  });

  it('allows zero', () => {
    expect(percentageSchema.parse(0)).toBe(0);
  });

  it('allows 100', () => {
    expect(percentageSchema.parse(100)).toBe(100);
  });

  it('rejects negative', () => {
    expect(() => percentageSchema.parse(-1)).toThrow('Percentage cannot be negative');
  });

  it('rejects over 100', () => {
    expect(() => percentageSchema.parse(101)).toThrow('Percentage cannot exceed 100');
  });
});

describe('salesInvoiceSchema', () => {
  const validInvoice = {
    invoiceNumber: 'INV-001',
    invoiceDate: '2025-01-15',
    dueDate: '2025-02-15',
    clientName: 'Test Client',
    clientEmail: 'client@test.com',
    clientAddress: '123 Test St',
    clientVatNumber: 'NL123456789B01',
    description: 'Test invoice',
    subtotal: 100,
    vatPercentage: 21,
    vatAmount: 21,
    totalAmount: 121,
    currency: 'EUR' as const,
    status: 'draft' as const,
    notes: 'Test notes',
    termsAndConditions: 'Standard terms',
  };

  it('validates complete valid invoice', () => {
    expect(salesInvoiceSchema.parse(validInvoice)).toEqual(validInvoice);
  });

  it('validates minimal valid invoice', () => {
    const minimal = {
      invoiceNumber: 'INV-001',
      invoiceDate: '2025-01-15',
      clientName: 'Test Client',
      clientEmail: '',
      clientVatNumber: '',
      subtotal: 100,
      vatAmount: 0,
      totalAmount: 100,
      currency: 'EUR' as const,
      status: 'draft' as const,
    };
    expect(() => salesInvoiceSchema.parse(minimal)).not.toThrow();
  });

  it('rejects missing invoice number', () => {
    const invalid = { ...validInvoice, invoiceNumber: '' };
    expect(() => salesInvoiceSchema.parse(invalid)).toThrow('Invoice number is required');
  });

  it('rejects missing client name', () => {
    const invalid = { ...validInvoice, clientName: '' };
    expect(() => salesInvoiceSchema.parse(invalid)).toThrow('Client name is required');
  });

  it('rejects invalid email', () => {
    const invalid = { ...validInvoice, clientEmail: 'invalid-email' };
    expect(() => salesInvoiceSchema.parse(invalid)).toThrow();
  });

  it('rejects zero subtotal', () => {
    const invalid = { ...validInvoice, subtotal: 0 };
    expect(() => salesInvoiceSchema.parse(invalid)).toThrow();
  });

  it('rejects negative VAT amount', () => {
    const invalid = { ...validInvoice, vatAmount: -10 };
    expect(() => salesInvoiceSchema.parse(invalid)).toThrow();
  });

  it('rejects invalid status', () => {
    const invalid = { ...validInvoice, status: 'invalid' };
    expect(() => salesInvoiceSchema.parse(invalid)).toThrow();
  });

  it('accepts all valid statuses', () => {
    const statuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    statuses.forEach(status => {
      const invoice = { ...validInvoice, status };
      expect(() => salesInvoiceSchema.parse(invoice)).not.toThrow();
    });
  });
});

describe('purchaseInvoiceHeaderSchema', () => {
  const validHeader = {
    contactUuid: 'contact-1',
    subscriptionUuid: 'sub-1',
    description: 'Test invoice',
    invoiceSentDate: '2025-01-15',
    periodStartDate: '2025-01-01',
    periodEndDate: '2025-01-31',
  };

  it('validates complete valid header', () => {
    expect(purchaseInvoiceHeaderSchema.parse(validHeader)).toMatchObject(validHeader);
  });

  it('validates with subscription UUID (no description required)', () => {
    const header = {
      contactUuid: 'contact-1',
      subscriptionUuid: 'sub-1',
      invoiceSentDate: '2025-01-15',
    };
    expect(() => purchaseInvoiceHeaderSchema.parse(header)).not.toThrow();
  });

  it('validates with description (no subscription required)', () => {
    const header = {
      contactUuid: 'contact-1',
      subscriptionUuid: null,
      description: 'One-time purchase',
      invoiceSentDate: '2025-01-15',
    };
    expect(() => purchaseInvoiceHeaderSchema.parse(header)).not.toThrow();
  });

  it('rejects missing both subscription and description', () => {
    const invalid = {
      contactUuid: 'contact-1',
      invoiceSentDate: '2025-01-15',
    };
    expect(() => purchaseInvoiceHeaderSchema.parse(invalid)).toThrow('Either subscription or description is required');
  });

  it('rejects end date before start date', () => {
    const invalid = {
      ...validHeader,
      periodStartDate: '2025-01-31',
      periodEndDate: '2025-01-01',
    };
    expect(() => purchaseInvoiceHeaderSchema.parse(invalid)).toThrow('Period end date must be after or equal to start date');
  });

  it('allows equal start and end dates', () => {
    const header = {
      ...validHeader,
      periodStartDate: '2025-01-15',
      periodEndDate: '2025-01-15',
    };
    expect(() => purchaseInvoiceHeaderSchema.parse(header)).not.toThrow();
  });
});

describe('contactSchema', () => {
  const validContact = {
    name: 'Test Contact',
    email: 'contact@test.com',
    phone: '+1234567890',
    address: '123 Test St',
    vatNumber: 'NL123456789B01',
    type: 'client' as const,
    isActive: true,
    notes: 'Test notes',
  };

  it('validates complete valid contact', () => {
    expect(contactSchema.parse(validContact)).toEqual(validContact);
  });

  it('validates minimal valid contact', () => {
    const minimal = {
      name: 'Test Contact',
      email: '',
      vatNumber: '',
      type: 'client' as const,
      isActive: true,
    };
    expect(() => contactSchema.parse(minimal)).not.toThrow();
  });

  it('rejects missing name', () => {
    const invalid = { ...validContact, name: '' };
    expect(() => contactSchema.parse(invalid)).toThrow('Name is required');
  });

  it('rejects invalid type', () => {
    const invalid = { ...validContact, type: 'invalid' };
    expect(() => contactSchema.parse(invalid)).toThrow();
  });

  it('accepts all valid types', () => {
    const types = ['client', 'supplier', 'both'];
    types.forEach(type => {
      const contact = { ...validContact, type };
      expect(() => contactSchema.parse(contact)).not.toThrow();
    });
  });
});

describe('subscriptionSchema', () => {
  const validSubscription = {
    name: 'Netflix',
    provider: 'Netflix Inc.',
    category: 'Entertainment',
    amount: 15.99,
    currency: 'EUR' as const,
    billingCycle: 'monthly' as const,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    nextBillingDate: '2025-02-01',
    status: 'active' as const,
    description: 'Streaming service',
  };

  it('validates complete valid subscription', () => {
    expect(subscriptionSchema.parse(validSubscription)).toEqual(validSubscription);
  });

  it('validates minimal valid subscription', () => {
    const minimal = {
      name: 'Netflix',
      provider: 'Netflix Inc.',
      amount: 15.99,
      currency: 'EUR' as const,
      billingCycle: 'monthly' as const,
      startDate: '2025-01-01',
      status: 'active' as const,
    };
    expect(() => subscriptionSchema.parse(minimal)).not.toThrow();
  });

  it('rejects missing name', () => {
    const invalid = { ...validSubscription, name: '' };
    expect(() => subscriptionSchema.parse(invalid)).toThrow('Service name is required');
  });

  it('rejects missing provider', () => {
    const invalid = { ...validSubscription, provider: '' };
    expect(() => subscriptionSchema.parse(invalid)).toThrow('Provider is required');
  });

  it('rejects zero amount', () => {
    const invalid = { ...validSubscription, amount: 0 };
    expect(() => subscriptionSchema.parse(invalid)).toThrow();
  });

  it('rejects end date before start date', () => {
    const invalid = {
      ...validSubscription,
      startDate: '2025-12-31',
      endDate: '2025-01-01',
    };
    expect(() => subscriptionSchema.parse(invalid)).toThrow('End date must be after or equal to start date');
  });

  it('allows equal start and end dates', () => {
    const subscription = {
      ...validSubscription,
      startDate: '2025-01-01',
      endDate: '2025-01-01',
    };
    expect(() => subscriptionSchema.parse(subscription)).not.toThrow();
  });

  it('accepts all valid billing cycles', () => {
    const cycles = ['monthly', 'quarterly', 'yearly', 'one-time'];
    cycles.forEach(billingCycle => {
      const subscription = { ...validSubscription, billingCycle };
      expect(() => subscriptionSchema.parse(subscription)).not.toThrow();
    });
  });

  it('accepts all valid statuses', () => {
    const statuses = ['active', 'inactive', 'cancelled'];
    statuses.forEach(status => {
      const subscription = { ...validSubscription, status };
      expect(() => subscriptionSchema.parse(subscription)).not.toThrow();
    });
  });
});
