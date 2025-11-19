import { useState, useMemo, useEffect, useRef } from 'react';
import { useTransactions, useSyncTransactions, useLinkTransactionToInvoice, useLinkTransactionToAccount, useDeleteAllocation, useUpdateAllocation } from '../hooks/useTransactions';
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
  const deleteAllocationMutation = useDeleteAllocation();
  const updateAllocationMutation = useUpdateAllocation();
  const { data: expenseAccounts } = useExpenseMatching();
  const { data: incomeAccounts } = useIncomeMatching();
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [linkMessage, setLinkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDropdownForTransaction, setShowDropdownForTransaction] = useState<string | null>(null);
  const [editingAllocation, setEditingAllocation] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdownForTransaction(null);
      }
    };

    if (showDropdownForTransaction) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdownForTransaction]);

  // Handle clicking outside edit input to save
  useEffect(() => {
    const handleClickOutsideEdit = (event: MouseEvent) => {
      if (editInputRef.current && !editInputRef.current.contains(event.target as Node)) {
        if (editingAllocation) {
          handleSaveEdit(editingAllocation);
        }
      }
    };

    if (editingAllocation) {
      document.addEventListener('mousedown', handleClickOutsideEdit);
      return () => {
        document.removeEventListener('mousedown', handleClickOutsideEdit);
      };
    }
  }, [editingAllocation, editAmount]);

  // Auto-expand dropdown when it becomes visible
  useEffect(() => {
    if (showDropdownForTransaction && selectRef.current) {
      // Use setTimeout to ensure the select is fully rendered
      setTimeout(() => {
        if (selectRef.current) {
          // Try to use showPicker if available (modern browsers)
          if ('showPicker' in selectRef.current) {
            try {
              (selectRef.current as any).showPicker();
            } catch (e) {
              // Fallback: focus and simulate click
              selectRef.current.focus();
              selectRef.current.click();
            }
          } else {
            // Fallback for older browsers
            selectRef.current.focus();
            selectRef.current.click();
          }
        }
      }, 0);
    }
  }, [showDropdownForTransaction]);

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync({ count: 200 });
    } catch (error) {
      console.error('Failed to sync transactions:', error);
    }
  };

  const handleShowDropdown = (transactionUuid: string) => {
    setShowDropdownForTransaction(transactionUuid);
  };

  const handleAccountChange = async (transactionUuid: string, value: string, transactionAmount: number, remainder: number) => {
    if (!value) return;

    console.log('Linking transaction:', { transactionUuid, value, transactionAmount, remainder });

    try {
      // Parse the value to determine if it's an account or invoice
      const [type, id] = value.split(':');

      if (type === 'invoice') {
        // Link to invoice - use full transaction amount
        console.log('Linking to invoice:', { transactionUuid, invoiceUuid: id });
        await linkToInvoiceMutation.mutateAsync({
          transactionId: transactionUuid,
          invoiceUuid: id,
        });
        setLinkMessage({ type: 'success', text: 'Transaction linked to invoice successfully' });
      } else if (type === 'account') {
        // Link to account - use remainder amount with sign
        const accountsData = transactionAmount < 0 ? expenseAccounts : incomeAccounts;
        const account = accountsData?.accounts.find(acc => acc.code === id);

        if (account) {
          // Use uuid if available, otherwise use code
          const accountIdentifier = account.uuid || account.code;
          // Send remainder with its sign (negative for expenses, positive for income)
          console.log('Linking to account:', { transactionUuid, accountUuid: accountIdentifier, accountCode: account.code, amount: remainder });
          await linkToAccountMutation.mutateAsync({
            transactionId: transactionUuid,
            accountUuid: accountIdentifier,
            amount: remainder,
          });
          setLinkMessage({ type: 'success', text: `Transaction linked to account ${account.code} successfully` });
        } else {
          console.error('Account not found:', id);
          setLinkMessage({ type: 'error', text: 'Account not found' });
          setTimeout(() => setLinkMessage(null), 3000);
          return;
        }
      }

      // Clear message after 3 seconds and hide dropdown
      setTimeout(() => setLinkMessage(null), 3000);
      setShowDropdownForTransaction(null);
    } catch (error) {
      console.error('Failed to link transaction:', error);
      setLinkMessage({ type: 'error', text: 'Failed to link transaction. Please try again.' });
      setTimeout(() => setLinkMessage(null), 3000);
    }
  };

  const handleDeleteAllocation = async (allocationUuid: string) => {
    try {
      await deleteAllocationMutation.mutateAsync(allocationUuid);
      setLinkMessage({ type: 'success', text: 'Allocation deleted successfully' });
      setTimeout(() => setLinkMessage(null), 3000);
    } catch (error) {
      console.error('Failed to delete allocation:', error);
      setLinkMessage({ type: 'error', text: 'Failed to delete allocation. Please try again.' });
      setTimeout(() => setLinkMessage(null), 3000);
    }
  };

  const handleEditAllocation = (allocationUuid: string, currentAmount: string) => {
    setEditingAllocation(allocationUuid);
    setEditAmount(parseFloat(currentAmount).toFixed(2));
  };


  const handleSaveEdit = async (allocationUuid: string) => {
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount === 0) {
      setLinkMessage({ type: 'error', text: 'Please enter a valid amount' });
      setTimeout(() => setLinkMessage(null), 3000);
      return;
    }

    try {
      await updateAllocationMutation.mutateAsync({ allocationUuid, amount });
      setLinkMessage({ type: 'success', text: 'Allocation updated successfully' });
      setTimeout(() => setLinkMessage(null), 3000);
      setEditingAllocation(null);
      setEditAmount('');
    } catch (error) {
      console.error('Failed to update allocation:', error);
      setLinkMessage({ type: 'error', text: 'Failed to update allocation. Please try again.' });
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
              <th>Link To</th>
              <th>Remainder</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions && filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction: Transaction) => {
                const status = getAssignmentStatus(transaction.amountAllocated, transaction.amount);
                const isExpense = transaction.amount < 0;
                const matchingData = isExpense ? expenseAccounts : incomeAccounts;

                // Calculate sum of all allocations (use absolute values)
                const totalAllocated = transaction.paymentAllocations?.reduce((sum, allocation) => {
                  return sum + Math.abs(parseFloat(allocation.amount));
                }, 0) || 0;

                // Calculate remainder with same sign as transaction
                // For expenses (negative): remainder is negative when money left to allocate
                // For income (positive): remainder is positive when money left to allocate
                const absoluteRemainder = Math.abs(transaction.amount) - totalAllocated;
                const remainder = transaction.amount < 0 ? -absoluteRemainder : absoluteRemainder;

                return (
                  <tr key={transaction.uuid}>
                    <td>{formatDate(transaction.created)}</td>
                    <td>{transaction.counterpartyName || '-'}</td>
                    <td className={transaction.amount < 0 ? 'amount-negative' : 'amount-positive'}>
                      {transaction.amount < 0 ? '-' : '+'}{formatCurrencyAbs(transaction.amount)}
                    </td>
                    <td>
                      <div
                        className="link-to-cell"
                        ref={showDropdownForTransaction === transaction.uuid ? dropdownRef : null}
                      >
                        {transaction.paymentAllocations && transaction.paymentAllocations.length > 0 && (
                          <div className="allocations-list">
                            {transaction.paymentAllocations.map((allocation) => (
                              <div key={allocation.uuid} className="allocation-item">
                                <div className="allocation-content">
                                  {allocation.account ? (
                                    <span className="allocation-account">
                                      {allocation.account.code} - {allocation.account.name}
                                    </span>
                                  ) : allocation.invoice ? (
                                    <span className="allocation-invoice">
                                      {allocation.invoice.description}
                                    </span>
                                  ) : (
                                    <span className="allocation-unknown">Unknown</span>
                                  )}
                                  {editingAllocation === allocation.uuid ? (
                                    <input
                                      ref={editInputRef}
                                      type="number"
                                      className="allocation-amount-input"
                                      value={editAmount}
                                      onChange={(e) => setEditAmount(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleSaveEdit(allocation.uuid);
                                        }
                                      }}
                                      step="0.01"
                                      autoFocus
                                    />
                                  ) : (
                                    <span
                                      className="allocation-amount allocation-amount-clickable"
                                      onClick={() => handleEditAllocation(allocation.uuid, allocation.amount)}
                                      title="Click to edit amount"
                                    >
                                      €{parseFloat(allocation.amount).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                                <div className="allocation-actions">
                                  {editingAllocation !== allocation.uuid && (
                                    <button
                                      className="allocation-edit-btn"
                                      onClick={() => handleEditAllocation(allocation.uuid, allocation.amount)}
                                      disabled={deleteAllocationMutation.isPending || updateAllocationMutation.isPending}
                                      title="Edit amount"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                    </button>
                                  )}
                                  <button
                                    className="allocation-delete-btn"
                                    onClick={() => handleDeleteAllocation(allocation.uuid)}
                                    disabled={deleteAllocationMutation.isPending || updateAllocationMutation.isPending}
                                    title="Delete allocation"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {showDropdownForTransaction === transaction.uuid ? (
                          <select
                            ref={selectRef}
                            className="form-select-compact account-selector"
                            value={getTransactionDropdownValue(transaction)}
                            onChange={(e) => handleAccountChange(transaction.uuid, e.target.value, transaction.amount, remainder)}
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
                        ) : absoluteRemainder > 0 && (
                          <button
                            className="btn-add-allocation"
                            onClick={() => handleShowDropdown(transaction.uuid)}
                            title="Link Transaction"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`remainder-amount ${remainder === 0 ? 'remainder-zero' : absoluteRemainder > 0 ? 'remainder-unallocated' : 'remainder-overallocated'}`}>
                        {remainder < 0 ? '-' : ''}€{Math.abs(remainder).toFixed(2)}
                      </span>
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
    </>
  );
};
