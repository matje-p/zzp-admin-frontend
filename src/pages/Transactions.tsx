import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import type { Transaction } from '../hooks/useTransactions';
import './Transactions.css';

const Transactions = () => {
  const { data: transactions, isLoading, error, refetch } = useTransactions();
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSync = () => {
    refetch();
  };

  const getCategory = (amount: number) => {
    return amount >= 0 ? 'Income' : 'Expense';
  };

  const getStatus = (invoiceUuid: string | null): 'assigned' | 'unassigned' => {
    return invoiceUuid ? 'assigned' : 'unassigned';
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
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Transactions'}
          </button>
        </div>
      </div>

      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
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
                const category = getCategory(transaction.amount);
                const status = getStatus(transaction.invoiceUuid);

                return (
                  <tr key={transaction.uuid}>
                    <td>{formatDate(transaction.created)}</td>
                    <td>{transaction.description || '-'}</td>
                    <td>{transaction.counterpartyName || '-'}</td>
                    <td className="account-id">{transaction.monetaryAccountId}</td>
                    <td>
                      <span className={`category-badge ${category.toLowerCase()}`}>
                        {category}
                      </span>
                    </td>
                    <td className={transaction.amount < 0 ? 'amount-negative' : 'amount-positive'}>
                      {transaction.amount < 0 ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </td>
                    <td>
                      <span className={`status-badge status-${status}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
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
