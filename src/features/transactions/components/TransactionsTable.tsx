import { useState, useMemo } from 'react';
import { useTransactions, useSyncTransactions } from '../hooks/useTransactions';
import { getUniqueAccounts, filterTransactionsByAccount } from '../utils/transactionUtils';
import type { Transaction } from '../../../types';
import { formatCurrencyAbs, formatDate } from '../../../utils/formatters';
import { getAssignmentStatus } from '../../../utils/status';

export const TransactionsTable = () => {
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

  const uniqueAccounts = useMemo(() => {
    if (!transactions) return [];
    return getUniqueAccounts(transactions);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    return filterTransactionsByAccount(transactions, selectedAccount);
  }, [transactions, selectedAccount]);

  if (isLoading) {
    return <p>Loading transactions...</p>;
  }

  if (error) {
    return <p className="error-message">Error loading transactions: {(error as Error).message}</p>;
  }

  return (
    <>
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
              <th>Amount</th>
              <th>Account</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions && filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction: Transaction) => {
                const status = getAssignmentStatus(transaction.amountAllocated, transaction.amount);

                return (
                  <tr key={transaction.uuid}>
                    <td>{formatDate(transaction.created)}</td>
                    <td>{transaction.counterpartyName || '-'}</td>
                    <td className={transaction.amount < 0 ? 'amount-negative' : 'amount-positive'}>
                      {transaction.amount < 0 ? '-' : '+'}{formatCurrencyAbs(transaction.amount)}
                    </td>
                    <td>
                      <select
                        className="account-selector"
                        value={transaction.monetaryAccountId}
                        onChange={(e) => {
                          console.log('Account changed for transaction:', transaction.uuid, 'to:', e.target.value);
                          // TODO: Implement account update logic
                        }}
                      >
                        <option value="" disabled>Select Account</option>
                        {uniqueAccounts.map((accountId) => (
                          <option key={accountId} value={accountId}>
                            Account {accountId}
                          </option>
                        ))}
                      </select>
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
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                  No transactions found. Click "Refresh Transactions" to reload.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
