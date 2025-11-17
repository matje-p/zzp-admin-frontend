import { useState, useMemo } from 'react';
import { useTransactions, useSyncTransactions } from '../features/transactions';
import type { Transaction } from '../types';
import { formatCurrencyAbs, formatDate } from '../utils/formatters';
import { getAssignmentStatus, getTransactionCategory } from '../utils/status';
import './Transactions.css';

const Transactions = () => {
  const { data: transactions, isLoading, error } = useTransactions();
  const syncMutation = useSyncTransactions();
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync({ count: 200 });
    } catch (error) {
      console.error('Failed to sync transactions:', error);
    }
  };

  // Get unique account IDs
  const uniqueAccounts = useMemo(() => {
    if (!transactions) return [];
    const accountIds = Array.from(new Set(transactions.map(t => t.monetaryAccountId)));
    return accountIds.sort((a, b) => a - b);
  }, [transactions]);

  // Filter transactions based on selected account
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    if (selectedAccount === 'all') return transactions;
    return transactions.filter(t => t.monetaryAccountId.toString() === selectedAccount);
  }, [transactions, selectedAccount]);

  if (isLoading) {
    return (
      <div className="transactions-page">
        <div className="page-header">
          <h1>Transactions</h1>
        </div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="transactions-page">
        <div className="page-header">
          <h1>Transactions</h1>
        </div>
        <p className="error-message">Error loading transactions: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="transactions-page">
      <div className="page-header">
        <h1>Transactions</h1>
        <div className="header-actions">
          <select
            id="account-filter"
            className="account-filter"
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            <option value="all">All Accounts</option>
            {uniqueAccounts.map((accountId) => (
              <option key={accountId} value={accountId.toString()}>
                Account {accountId}
              </option>
            ))}
          </select>
          <button
            className="btn-primary"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? 'Syncing...' : 'Refresh Transactions'}
          </button>
        </div>
      </div>

      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Counterparty</th>
              <th>Account</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions && filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction: Transaction) => {
                const category = getTransactionCategory(transaction.amount);
                const status = getAssignmentStatus(transaction.amountAllocated, transaction.amount);

                return (
                  <tr key={transaction.uuid}>
                    <td>{formatDate(transaction.created)}</td>
                    <td>{transaction.counterpartyName || '-'}</td>
                    <td className="account-id">{transaction.monetaryAccountId}</td>
                    <td>
                      <span className={`category-badge ${category.toLowerCase()}`}>
                        {category}
                      </span>
                    </td>
                    <td className={transaction.amount < 0 ? 'amount-negative' : 'amount-positive'}>
                      {transaction.amount < 0 ? '-' : '+'}{formatCurrencyAbs(transaction.amount)}
                    </td>
                    <td>
                      <span className={`status-badge status-${status}`}>
                        {status === 'assigned' ? 'Linked' :
                         status === 'partially-assigned' ? 'Partially Linked' :
                         'Not Linked'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  No transactions found. Click "Refresh Transactions" to reload.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
