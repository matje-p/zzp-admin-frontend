import { describe, it, expect } from 'vitest';
import { getAssignmentStatus, getTransactionCategory } from './status';

describe('getAssignmentStatus', () => {
  it('returns "assigned" when fully allocated', () => {
    expect(getAssignmentStatus(100, 100)).toBe('assigned');
  });

  it('returns "assigned" when allocated equals total (negative numbers)', () => {
    expect(getAssignmentStatus(-100, -100)).toBe('assigned');
  });

  it('returns "partially-assigned" when partially allocated', () => {
    expect(getAssignmentStatus(50, 100)).toBe('partially-assigned');
  });

  it('returns "partially-assigned" for partial negative amounts', () => {
    expect(getAssignmentStatus(-50, -100)).toBe('partially-assigned');
  });

  it('returns "unassigned" when allocation is zero', () => {
    expect(getAssignmentStatus(0, 100)).toBe('unassigned');
  });

  it('returns "unassigned" when allocation is undefined', () => {
    expect(getAssignmentStatus(undefined, 100)).toBe('unassigned');
  });

  it('returns "unassigned" when allocation is NaN', () => {
    expect(getAssignmentStatus(NaN, 100)).toBe('unassigned');
  });

  it('handles large numbers correctly', () => {
    expect(getAssignmentStatus(1000000, 1000000)).toBe('assigned');
    expect(getAssignmentStatus(500000, 1000000)).toBe('partially-assigned');
  });

  it('handles decimal numbers correctly', () => {
    expect(getAssignmentStatus(99.99, 100)).toBe('partially-assigned');
    expect(getAssignmentStatus(100.00, 100)).toBe('assigned');
  });

  it('uses absolute values for comparison', () => {
    // Mixed signs should use absolute values
    expect(getAssignmentStatus(-100, 100)).toBe('assigned');
    expect(getAssignmentStatus(100, -100)).toBe('assigned');
  });
});

describe('getTransactionCategory', () => {
  it('returns "Income" for positive amount', () => {
    expect(getTransactionCategory(100)).toBe('Income');
  });

  it('returns "Income" for zero', () => {
    expect(getTransactionCategory(0)).toBe('Income');
  });

  it('returns "Expense" for negative amount', () => {
    expect(getTransactionCategory(-100)).toBe('Expense');
  });

  it('handles large positive numbers', () => {
    expect(getTransactionCategory(1000000)).toBe('Income');
  });

  it('handles large negative numbers', () => {
    expect(getTransactionCategory(-1000000)).toBe('Expense');
  });

  it('handles small decimal amounts', () => {
    expect(getTransactionCategory(0.01)).toBe('Income');
    expect(getTransactionCategory(-0.01)).toBe('Expense');
  });
});
