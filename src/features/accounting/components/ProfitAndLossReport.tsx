/**
 * Profit & Loss Report Component
 * Renders the complete P&L report with revenue, costs, and result sections
 */

import type { ProfitAndLossData } from '../../../types';
import { formatCurrency } from '../../../utils/formatters';
import { calculateProfitAndLossResult, getResultClass } from '../utils/profitAndLossCalculations';

interface ProfitAndLossReportProps {
  data: ProfitAndLossData;
}

export const ProfitAndLossReport: React.FC<ProfitAndLossReportProps> = ({ data }) => {
  const result = calculateProfitAndLossResult(data);

  return (
    <div className="pl-content">
      {/* Revenue Section */}
      <div className="pl-section">
        <div className="section-header">
          <h2>Revenue</h2>
          <div className="section-total positive">{formatCurrency(data.revenue.total)}</div>
        </div>
        {data.revenue.items.length === 0 ? (
          <div className="empty-state">No revenue data available</div>
        ) : (
          <div className="pl-items">
            {data.revenue.items.map((item, index) => (
              <div key={index} className="pl-item">
                <span className="item-name">{item.name}</span>
                <span className="item-amount">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expenses Section */}
      <div className="pl-section">
        <div className="section-header">
          <h2>Expenses</h2>
          <div className="section-total negative">{formatCurrency(data.expenses.total)}</div>
        </div>
        {data.expenses.items.length === 0 ? (
          <div className="empty-state">No expense data available</div>
        ) : (
          <div className="pl-items">
            {data.expenses.items.map((item, index) => (
              <div key={index} className="pl-item">
                <span className="item-name">{item.name}</span>
                <span className="item-amount">{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result Section */}
      <div className="pl-section result-section">
        <div className="section-header">
          <h2>Result</h2>
          <div className={`section-total ${getResultClass(result.result)}`}>
            {formatCurrency(result.result)}
          </div>
        </div>
        <div className="pl-summary">
          <div className="summary-item">
            <span className="summary-label">Profit Margin:</span>
            <span className={`summary-value ${getResultClass(result.margin)}`}>
              {result.margin.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
