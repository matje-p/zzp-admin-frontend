import { formatCurrency } from '../utils/formatters';
import './ProfitAndLoss.css';

const ProfitAndLoss = () => {
  // Placeholder data
  const revenue = {
    total: 0,
    items: []
  };

  const costs = {
    total: 0,
    items: []
  };

  const result = revenue.total - costs.total;

  return (
    <div className="pl-page">
      <div className="page-header">
        <h1>Profit & Loss</h1>
      </div>

      <div className="pl-content">
        {/* Revenue Section */}
        <div className="pl-section">
          <div className="section-header">
            <h2>Revenue</h2>
            <div className="section-total positive">{formatCurrency(revenue.total)}</div>
          </div>
          {revenue.items.length === 0 ? (
            <div className="empty-state">No revenue data available</div>
          ) : (
            <div className="pl-items">
              {revenue.items.map((item: any, index: number) => (
                <div key={index} className="pl-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-amount">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Costs Section */}
        <div className="pl-section">
          <div className="section-header">
            <h2>Costs</h2>
            <div className="section-total negative">{formatCurrency(costs.total)}</div>
          </div>
          {costs.items.length === 0 ? (
            <div className="empty-state">No cost data available</div>
          ) : (
            <div className="pl-items">
              {costs.items.map((item: any, index: number) => (
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
            <div className={`section-total ${result >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(result)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitAndLoss;
