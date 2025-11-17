/**
 * Status calculation utilities
 */

/**
 * Status for transactions/invoices based on amount allocation
 */
export type AssignmentStatus = 'assigned' | 'partially-assigned' | 'unassigned';

/**
 * Get assignment status based on allocated amount vs total amount
 * Used for both invoices and transactions
 */
export function getAssignmentStatus(
  amountAllocated: number | undefined,
  totalAmount: number
): AssignmentStatus {
  const allocated = Math.abs(amountAllocated ?? 0);
  const total = Math.abs(totalAmount);

  // If amountAllocated is 0 or NaN, it's not assigned
  if (!allocated || isNaN(allocated)) {
    return 'unassigned';
  }

  // If amountAllocated equals total amount, it's fully assigned
  if (allocated === total) {
    return 'assigned';
  }

  // If amountAllocated is non-zero but less than total amount, it's partially assigned
  if (allocated > 0 && allocated < total) {
    return 'partially-assigned';
  }

  return 'unassigned';
}

/**
 * Get category based on transaction amount (Income vs Expense)
 */
export function getTransactionCategory(amount: number): 'Income' | 'Expense' {
  return amount >= 0 ? 'Income' : 'Expense';
}
