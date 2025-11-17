/**
 * Accounting and financial reporting types
 */

export interface ProfitAndLossLineItem {
  code: string;
  name: string;
  amount: number;
}

export interface ProfitAndLossSection {
  total: number;
  items: ProfitAndLossLineItem[];
}

export interface ProfitAndLossData {
  revenue: ProfitAndLossSection;
  expenses: ProfitAndLossSection;
  period: {
    startDate: string | null;
    endDate: string | null;
  };
  netProfit: number;
  netProfitPercentage: number;
}

export interface ProfitAndLossResult {
  revenue: number;
  expenses: number;
  result: number;
  margin: number; // Percentage
}
