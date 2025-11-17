import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Subscription } from '../../../types';
import { formatCurrency, formatDate, formatBillingCycle } from '../../../utils/formatters';

interface SubscriptionsTableProps {
  subscriptions: Subscription[] | undefined;
  onRowClick: (subscription: Subscription) => void;
  onDeleteClick: (e: React.MouseEvent, subscriptionId: string) => void;
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({
  subscriptions,
  onRowClick,
  onDeleteClick,
}) => {
  return (
    <div className="subscriptions-table-container">
      <table className="subscriptions-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Provider</th>
            <th>Amount</th>
            <th>Billing Period</th>
            <th>Start Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions.map((subscription: Subscription) => (
              <tr
                key={subscription.uuid}
                onClick={() => onRowClick(subscription)}
                className="clickable-row"
              >
                <td className="subscription-name">{subscription.name}</td>
                <td>{subscription.provider}</td>
                <td className="amount-positive">
                  {formatCurrency(subscription.amount, subscription.currency)}
                </td>
                <td>{formatBillingCycle(subscription.billingCycle)}</td>
                <td>{formatDate(subscription.startDate)}</td>
                <td>
                  <span className={`status-badge status-${subscription.status}`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </td>
                <td>
                  <button
                    className="delete-button"
                    onClick={(e) => onDeleteClick(e, subscription.uuid)}
                    title="Delete subscription"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                No subscriptions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
