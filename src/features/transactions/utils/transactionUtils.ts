import type { Transaction } from '../../../types';

/**
 * Extract unique account IDs from a list of transactions
 */
export const getUniqueAccounts = (transactions: Transaction[]): number[] => {
  const accountIds = Array.from(new Set(transactions.map(t => t.monetaryAccountId)));
  return accountIds.sort((a, b) => a - b);
};

/**
 * Filter transactions by account ID
 */
export const filterTransactionsByAccount = (
  transactions: Transaction[],
  accountId: string
): Transaction[] => {
  if (accountId === 'all') return transactions;
  return transactions.filter(t => t.monetaryAccountId.toString() === accountId);
};
