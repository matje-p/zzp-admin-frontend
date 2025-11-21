/**
 * Profit & Loss calculation utilities
 * Pure functions for P&L domain-specific calculations
 */

import type { ProfitAndLossData, ProfitAndLossResult } from '@/types';

/**
 * Calculate P&L result metrics from revenue and expenses
 */
export function calculateProfitAndLossResult(data: ProfitAndLossData): ProfitAndLossResult {
  const revenue = data.revenue.total;
  const expenses = data.expenses.total;
  const result = revenue - expenses;
  const margin = revenue > 0 ? (result / revenue) * 100 : 0;

  return {
    revenue,
    expenses,
    result,
    margin,
  };
}

/**
 * Determine if a result is profitable
 */
export function isProfitable(result: number): boolean {
  return result >= 0;
}

/**
 * Get CSS class for result display
 */
export function getResultClass(result: number): 'positive' | 'negative' {
  return result >= 0 ? 'positive' : 'negative';
}
