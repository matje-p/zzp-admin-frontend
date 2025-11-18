import { TransactionsTable } from '../features/transactions';
import './Transactions.css';

/**
 * Transactions Page
 * Maps the /transactions URL to the transactions screen
 * Composes the TransactionsTable feature component
 */
const Transactions = () => {
  return (
    <div className="transactions-page">
      <TransactionsTable />
    </div>
  );
};

export default Transactions;
