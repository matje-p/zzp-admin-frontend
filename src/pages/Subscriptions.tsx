import React, { useState } from 'react';
import { useSubscriptions } from '../hooks/useSubscriptions';
import type { Subscription } from '../hooks/useSubscriptions';
import './Subscriptions.css';

const Subscriptions = () => {
  const { data: subscriptions, isLoading, error, refetch } = useSubscriptions();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null);

  const toggleExpand = (subscriptionId: string) => {
    setExpandedSubscriptionId(expandedSubscriptionId === subscriptionId ? null : subscriptionId);
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatBillingCycle = (cycle: string) => {
    const cycles: { [key: string]: string } = {
      'monthly': 'Monthly',
      'quarterly': 'Quarterly',
      'yearly': 'Yearly',
      'weekly': 'Weekly'
    };
    return cycles[cycle] || cycle;
  };

  if (isLoading) {
    return (
      <div className="subscriptions-page">
        <div className="page-header">
          <h1>Subscriptions</h1>
        </div>
        <p>Loading subscriptions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="subscriptions-page">
        <div className="page-header">
          <h1>Subscriptions</h1>
        </div>
        <p className="error-message">Error loading subscriptions: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="subscriptions-page">
      <div className="page-header">
        <h1>Subscriptions</h1>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={refetch}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Subscriptions'}
          </button>
        </div>
      </div>

      <div className="subscriptions-table-container">
        <table className="subscriptions-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Provider</th>
              <th>Amount</th>
              <th>Billing Period</th>
              <th>Next Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions && subscriptions.length > 0 ? (
              subscriptions.map((subscription: Subscription) => {
                const isExpanded = expandedSubscriptionId === subscription.uuid;
                return (
                  <React.Fragment key={subscription.uuid}>
                    <tr
                      onClick={() => toggleExpand(subscription.uuid)}
                      className="clickable-row"
                    >
                      <td className="subscription-name">{subscription.name}</td>
                      <td>{subscription.provider}</td>
                      <td className="amount-positive">
                        {formatCurrency(subscription.amount, subscription.currency)}
                      </td>
                      <td>{formatBillingCycle(subscription.billingCycle)}</td>
                      <td>{formatDate(subscription.nextBillingDate)}</td>
                      <td>
                        <span className={`status-badge status-${subscription.status}`}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${subscription.uuid}-details`} className="expanded-row">
                        <td colSpan={6}>
                          <div className="subscription-details">
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Category:</span>
                                <span className="detail-value">{subscription.category || '-'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Start Date:</span>
                                <span className="detail-value">{formatDate(subscription.startDate)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">End Date:</span>
                                <span className="detail-value">{formatDate(subscription.endDate)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Payment Method:</span>
                                <span className="detail-value">{subscription.paymentMethod || '-'}</span>
                              </div>
                              {subscription.cancelledAt && (
                                <div className="detail-item">
                                  <span className="detail-label">Cancelled At:</span>
                                  <span className="detail-value">{formatDate(subscription.cancelledAt)}</span>
                                </div>
                              )}
                              <div className="detail-item full-width">
                                <span className="detail-label">Description:</span>
                                <span className="detail-value">{subscription.description || '-'}</span>
                              </div>
                              {subscription.notes && (
                                <div className="detail-item full-width">
                                  <span className="detail-label">Notes:</span>
                                  <span className="detail-value">{subscription.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  No subscriptions found. Click "Refresh Subscriptions" to reload.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscriptions;
