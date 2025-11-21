import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatCurrencyAbs,
  formatBillingCycle,
  formatPeriod,
  formatAmountInput,
  parseAmountInput,
  truncateDescription
} from './formatters';

describe('formatCurrency', () => {
  it('formats EUR correctly', () => {
    const result = formatCurrency(1234.56, 'EUR');
    expect(result).toContain('€');
    expect(result).toContain('1');
    expect(result).toContain('234');
    expect(result).toContain('56');
  });

  it('formats USD correctly', () => {
    const result = formatCurrency(1234.56, 'USD');
    expect(result).toContain('$');
    expect(result).toContain('1');
    expect(result).toContain('234');
    expect(result).toContain('56');
  });

  it('formats GBP correctly', () => {
    const result = formatCurrency(1234.56, 'GBP');
    expect(result).toContain('£');
    expect(result).toContain('1');
    expect(result).toContain('234');
    expect(result).toContain('56');
  });

  it('handles zero', () => {
    const result = formatCurrency(0, 'EUR');
    expect(result).toContain('€');
    expect(result).toContain('0');
  });

  it('handles negative numbers', () => {
    const result = formatCurrency(-1234.56, 'EUR');
    expect(result).toContain('€');
    expect(result).toContain('1');
    expect(result).toContain('234');
    expect(result).toContain('56');
  });

  it('rounds to 2 decimal places', () => {
    const result = formatCurrency(1234.567, 'EUR');
    expect(result).toContain('€');
    expect(result).toContain('57'); // Rounded up from .567
  });
});

describe('formatCurrencyAbs', () => {
  it('formats positive numbers', () => {
    const result = formatCurrencyAbs(1234.56, 'EUR');
    expect(result).toContain('€');
    expect(result).toContain('1');
    expect(result).toContain('234');
    expect(result).toContain('56');
  });

  it('converts negative to positive', () => {
    const result = formatCurrencyAbs(-1234.56, 'EUR');
    expect(result).toContain('€');
    expect(result).toContain('1');
    expect(result).toContain('234');
    expect(result).toContain('56');
  });

  it('handles zero', () => {
    const result = formatCurrencyAbs(0, 'EUR');
    expect(result).toContain('€');
    expect(result).toContain('0');
  });
});

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2025-01-15T10:30:00Z');
    // Result depends on locale, just check it contains expected parts
    expect(result).not.toBe('-');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });

  it('handles null', () => {
    expect(formatDate(null)).toBe('-');
  });

  it('handles undefined', () => {
    expect(formatDate(undefined)).toBe('-');
  });

  it('handles invalid date string', () => {
    const result = formatDate('invalid');
    // May return - or Invalid Date depending on implementation
    expect(result).toBeTruthy();
  });
});

describe('formatBillingCycle', () => {
  it('formats monthly', () => {
    expect(formatBillingCycle('monthly')).toBe('Monthly');
  });

  it('formats quarterly', () => {
    expect(formatBillingCycle('quarterly')).toBe('Quarterly');
  });

  it('formats yearly', () => {
    expect(formatBillingCycle('yearly')).toBe('Yearly');
  });

  it('formats one-time', () => {
    const result = formatBillingCycle('one-time');
    expect(result).toMatch(/one.time/i);
  });

  it('handles unknown cycle', () => {
    const result = formatBillingCycle('unknown' as any);
    // Should capitalize or handle gracefully
    expect(result).toBeTruthy();
  });
});

describe('formatPeriod', () => {
  it('formats same month and year', () => {
    const result = formatPeriod('2025-07-05T00:00:00Z', '2025-07-15T00:00:00Z');
    expect(result).toContain('5 to 15');
    expect(result).toContain('Jul');
    expect(result).toContain('2025');
  });

  it('formats different months same year', () => {
    const result = formatPeriod('2025-07-05T00:00:00Z', '2025-08-05T00:00:00Z');
    expect(result).toContain('5 Jul to 5 Aug');
    expect(result).toContain('2025');
  });

  it('formats different years', () => {
    const result = formatPeriod('2024-07-05T00:00:00Z', '2025-08-05T00:00:00Z');
    expect(result).toContain('5 Jul 2024');
    expect(result).toContain('5 Aug 2025');
  });

  it('handles null startDate', () => {
    expect(formatPeriod(null, '2025-08-05T00:00:00Z')).toBe('-');
  });

  it('handles null endDate', () => {
    expect(formatPeriod('2025-07-05T00:00:00Z', null)).toBe('-');
  });

  it('handles both dates null', () => {
    expect(formatPeriod(null, null)).toBe('-');
  });
});

describe('formatAmountInput', () => {
  it('formats number with 2 decimals', () => {
    expect(formatAmountInput(1234.56)).toBe('1,234.56');
  });

  it('formats zero', () => {
    expect(formatAmountInput(0)).toBe('0.00');
  });

  it('formats negative number', () => {
    expect(formatAmountInput(-1234.56)).toBe('-1,234.56');
  });

  it('handles large numbers', () => {
    const result = formatAmountInput(1234567.89);
    expect(result).toContain('1,234,567');
    expect(result).toContain('89');
  });

  it('handles null/undefined', () => {
    expect(formatAmountInput(null as any)).toBe('');
    expect(formatAmountInput(undefined as any)).toBe('');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatAmountInput(1234.567)).toBe('1,234.57');
  });
});

describe('parseAmountInput', () => {
  it('parses formatted number', () => {
    expect(parseAmountInput('1,234.56')).toBe(1234.56);
  });

  it('parses unformatted number', () => {
    expect(parseAmountInput('1234.56')).toBe(1234.56);
  });

  it('handles negative numbers', () => {
    expect(parseAmountInput('-1,234.56')).toBe(-1234.56);
  });

  it('handles zero', () => {
    expect(parseAmountInput('0')).toBe(0);
  });

  it('handles empty string', () => {
    expect(parseAmountInput('')).toBe(0);
  });

  it('handles invalid input', () => {
    expect(parseAmountInput('abc')).toBe(0);
  });

  it('handles multiple commas', () => {
    expect(parseAmountInput('1,234,567.89')).toBe(1234567.89);
  });
});

describe('truncateDescription', () => {
  it('returns full description when shorter than max', () => {
    expect(truncateDescription('Short text', 40)).toBe('Short text');
  });

  it('truncates long description with ellipsis', () => {
    const long = 'This is a very long description that exceeds the maximum length';
    const result = truncateDescription(long, 40);
    expect(result).toHaveLength(43); // 40 chars + '...'
    expect(result.endsWith('...')).toBe(true);
    expect(result).toContain('This is a very long');
  });

  it('handles null description', () => {
    expect(truncateDescription(null)).toBe('-');
  });

  it('handles empty string', () => {
    expect(truncateDescription('')).toBe('-');
  });

  it('respects custom maxLength', () => {
    const result = truncateDescription('This is a test description', 10);
    expect(result).toBe('This is a ...');
  });

  it('handles description exactly at max length', () => {
    const text = 'Exactly forty characters in this text!!';
    expect(truncateDescription(text, 40)).toBe(text);
  });
});
