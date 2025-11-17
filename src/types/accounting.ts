/**
 * Accounting and financial reporting types
 */

export interface ProfitAndLossLineItem {
  name: string;
  amount: number;
  category?: string;
}

export interface ProfitAndLossSection {
  total: number;
  items: ProfitAndLossLineItem[];
}

export interface ProfitAndLossData {
  revenue: ProfitAndLossSection;
  costs: ProfitAndLossSection;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface ProfitAndLossResult {
  revenue: number;
  costs: number;
  result: number;
  margin: number; // Percentage
}
