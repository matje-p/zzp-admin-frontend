import { useState, useMemo } from 'react';
import { useTransactions, useSyncTransactions, useLinkTransactionToInvoice, useLinkTransactionToAccount } from '../hooks/useTransactions';
import { useExpenseMatching, useIncomeMatching } from '../hooks/usePaymentMatching';
import { getUniqueAccounts, filterTransactionsByAccount } from '../utils/transactionUtils';
import type { Transaction } from '../../../types';
import { formatCurrencyAbs, formatDate } from '../../../utils/formatters';
import { getAssignmentStatus } from '../../../utils/status';

export const TransactionsTable = () => {
  const { data: transactions, isLoading, error } = useTransactions();
  const syncMutation = useSyncTransactions();
  const linkToInvoiceMutation = useLinkTransactionToInvoice();
  const linkToAccountMutation = useLinkTransactionToAccount();
  const { data: expenseAccounts } = useExpenseMatching();
  const { data: incomeAccounts } = useIncomeMatching();
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [linkMessage, setLinkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync({ count: 200 });
    } catch (error) {
      console.error('Failed to sync transactions:', error);
    }
  };

  const handleLinkTransaction = async (transactionUuid: string, value: string, transactionAmount: number) => {
    if (!value) return;

    console.log('Linking transaction:', { transactionUuid, value, transactionAmount });

    try {
      // Parse the value to determine if it's an account or invoice
      const [type, id] = value.split(':');

      if (type === 'invoice') {
        // Link to invoice
        console.log('Linking to invoice:', { transactionUuid, invoiceUuid: id });
        await linkToInvoiceMutation.mutateAsync({
          transactionId: transactionUuid,
          invoiceUuid: id,
          amount: Math.abs(transactionAmount),
        });
        setLinkMessage({ type: 'success', text: 'Transaction linked to invoice successfully' });
      } else if (type === 'account') {
        // Link to account - need to find the account by code
        const accountsData = transactionAmount < 0 ? expenseAccounts : incomeAccounts;
        const account = accountsData?.accounts.find(acc => acc.code === id);

        if (account) {
          // Use uuid if available, otherwise use code
          const accountIdentifier = account.uuid || account.code;
          console.log('Linking to account:', { transactionUuid, accountUuid: accountIdentifier, accountCode: account.code });
          await linkToAccountMutation.mutateAsync({
            transactionId: transactionUuid,
            accountUuid: accountIdentifier,
            amount: Math.abs(transactionAmount),
          });
          setLinkMessage({ type: 'success', text: `Transaction linked to account ${account.code} successfully` });
        } else {
          console.error('Account not found:', id);
          setLinkMessage({ type: 'error', text: 'Account not found' });
          setTimeout(() => setLinkMessage(null), 3000);
        }
      }

      // Clear message after 3 seconds
      setTimeout(() => setLinkMessage(null), 3000);
    } catch (error) {
      console.error('Failed to link transaction:', error);
      setLinkMessage({ type: 'error', text: 'Failed to link transaction. Please try again.' });
      setTimeout(() => setLinkMessage(null), 3000);
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

  // Get the current dropdown value for a transaction
  const getTransactionDropdownValue = (transaction: Transaction): string => {
    // Check if linked to invoice
    if (transaction.invoiceUuid) {
      return `invoice:${transaction.invoiceUuid}`;
    }
    // Check if linked to account (category field stores account code or UUID)
    if (transaction.category) {
      // Find account by UUID or code to get the code for dropdown value
      const isExpense = transaction.amount < 0;
      const accountsData = isExpense ? expenseAccounts : incomeAccounts;

      // Try to find by UUID first, then by code
      const account = accountsData?.accounts.find(
        acc => acc.uuid === transaction.category || acc.code === transaction.category
      );

      if (account) {
        return `account:${account.code}`;
      }

      // Fallback: assume category is already a code
      return `account:${transaction.category}`;
    }
    return '';
  };

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

      {linkMessage && (
        <div className={`sync-message ${linkMessage.type === 'success' ? 'sync-success' : 'sync-error'}`}>
          {linkMessage.text}
        </div>
      )}

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
                const isExpense = transaction.amount < 0;
                const matchingData = isExpense ? expenseAccounts : incomeAccounts;

                return (
                  <tr key={transaction.uuid}>
                    <td>{formatDate(transaction.created)}</td>
                    <td>{transaction.counterpartyName || '-'}</td>
                    <td className={transaction.amount < 0 ? 'amount-negative' : 'amount-positive'}>
                      {transaction.amount < 0 ? '-' : '+'}{formatCurrencyAbs(transaction.amount)}
                    </td>
                    <td>
                      <select
                        className="form-select-compact account-selector"
                        value={getTransactionDropdownValue(transaction)}
                        onChange={(e) => {
                          handleLinkTransaction(transaction.uuid, e.target.value, transaction.amount);
                        }}
                        disabled={linkToInvoiceMutation.isPending || linkToAccountMutation.isPending}
                      >
                        <option value="">Select Account or Invoice</option>

                        {matchingData?.accounts && matchingData.accounts.length > 0 && (
                          <optgroup label="Accounts">
                            {matchingData.accounts.map((account) => (
                              <option key={account.code} value={`account:${account.code}`}>
                                {account.code} - {account.name}
                              </option>
                            ))}
                          </optgroup>
                        )}

                        {matchingData?.invoices && matchingData.invoices.length > 0 && (
                          <optgroup label="Unmatched Invoices">
                            {matchingData.invoices.map((invoice) => (
                              <option key={invoice.purchaseInvoiceUuid} value={`invoice:${invoice.purchaseInvoiceUuid}`}>
                                {invoice.description} - €{invoice.totalAmountInclVat.toFixed(2)}
                              </option>
                            ))}
                          </optgroup>
                        )}
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
