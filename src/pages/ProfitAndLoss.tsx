/**
 * Profit & Loss Page
 *
 * Responsibilities:
 * - Maps URL to screen
 * - Composes feature components
 * - Handles page-level layout
 *
 * Does NOT:
 * - Contain business logic
 * - Make API calls directly
 * - Have complex state management
 * - Include domain calculations
 */

import { useProfitAndLoss, ProfitAndLossReport } from '@/features/accounting';
import './ProfitAndLoss.css';

const ProfitAndLoss = () => {
  // Fetch P&L data using feature hook
  const { data: profitAndLossData, isLoading, error } = useProfitAndLoss();

  if (isLoading) {
    return (
      <div className="pl-page">
        <div className="page-header">
          <h1>Profit & Loss</h1>
        </div>
        <p>Loading profit and loss data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pl-page">
        <div className="page-header">
          <h1>Profit & Loss</h1>
        </div>
        <p className="error-message">Error loading data: {(error as Error).message}</p>
      </div>
    );
  }

  if (!profitAndLossData) {
    return (
      <div className="pl-page">
        <div className="page-header">
          <h1>Profit & Loss</h1>
        </div>
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="pl-page">
      <div className="page-header">
        <h1>Profit & Loss</h1>
      </div>

      {/* Feature component handles all P&L rendering logic */}
      <ProfitAndLossReport data={profitAndLossData} />
    </div>
  );
};

export default ProfitAndLoss;
