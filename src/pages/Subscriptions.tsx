import React, { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { useSubscriptions, useCancelSubscription } from '../features/subscriptions';
import type { Subscription } from '../types';
import { usePurchaseInvoicesBySubscription } from '../features/purchase-invoices';
import { formatCurrency, formatDate, formatBillingCycle } from '../utils/formatters';
import './Subscriptions.css';

const Subscriptions = () => {
  const { data: subscriptions, isLoading, error } = useSubscriptions();
  const cancelSubscriptionMutation = useCancelSubscription();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);

  const handleRowClick = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
  };

  const handleCloseDetailModal = () => {
    setSelectedSubscription(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, subscriptionId: string) => {
    e.stopPropagation(); // Prevent row expansion
    setSubscriptionToDelete(subscriptionId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (subscriptionToDelete) {
      try {
        await cancelSubscriptionMutation.mutateAsync(subscriptionToDelete);
        setDeleteModalOpen(false);
        setSubscriptionToDelete(null);
      } catch (error) {
        console.error('Failed to delete subscription:', error);
      }
    }
  }, [subscriptionToDelete, cancelSubscriptionMutation]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setSubscriptionToDelete(null);
  }, []);

  // Handle keyboard events for all modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        // Close detail modal if open
        if (selectedSubscription) {
          handleCloseDetailModal();
        }
        // Close delete modal if open
        if (deleteModalOpen) {
          handleDeleteCancel();
        }
      } else if (e.key === 'Enter' && deleteModalOpen) {
        e.preventDefault();
        handleDeleteConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteModalOpen, selectedSubscription, handleDeleteConfirm, handleDeleteCancel]);

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
      </div>

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
                  onClick={() => handleRowClick(subscription)}
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
                      onClick={(e) => handleDeleteClick(e, subscription.uuid)}
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

      {deleteModalOpen && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Subscription</h2>
            <p>Are you sure you want to delete this subscription?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={handleDeleteConfirm}
                disabled={cancelSubscriptionMutation.isPending}
              >
                {cancelSubscriptionMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSubscription && (
        <SubscriptionDetailModal
          subscription={selectedSubscription}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

interface SubscriptionDetailModalProps {
  subscription: Subscription;
  onClose: () => void;
}

const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({
  subscription,
  onClose,
}) => {
  const { data: invoices, isLoading: loadingInvoices } = usePurchaseInvoicesBySubscription(subscription.uuid);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content subscription-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Subscription Details</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="subscription-detail-content">
          <div className="subscription-detail-left">
            <table className="details-table">
              <tbody>
                <tr>
                  <td className="detail-label">Service:</td>
                  <td className="detail-value">{subscription.name}</td>
                </tr>
                <tr>
                  <td className="detail-label">Provider:</td>
                  <td className="detail-value">{subscription.provider}</td>
                </tr>
                <tr>
                  <td className="detail-label">Category:</td>
                  <td className="detail-value">{subscription.category || '-'}</td>
                </tr>
                <tr>
                  <td className="detail-label">Amount:</td>
                  <td className="detail-value">{formatCurrency(subscription.amount, subscription.currency)}</td>
                </tr>
                <tr>
                  <td className="detail-label">Billing Period:</td>
                  <td className="detail-value">{formatBillingCycle(subscription.billingCycle)}</td>
                </tr>
                <tr>
                  <td className="detail-label">Currency:</td>
                  <td className="detail-value">{subscription.currency}</td>
                </tr>
                <tr>
                  <td className="detail-label">Start Date:</td>
                  <td className="detail-value">{formatDate(subscription.startDate)}</td>
                </tr>
                <tr>
                  <td className="detail-label">End Date:</td>
                  <td className="detail-value">{formatDate(subscription.endDate)}</td>
                </tr>
                <tr>
                  <td className="detail-label">Next Billing:</td>
                  <td className="detail-value">{formatDate(subscription.nextBillingDate)}</td>
                </tr>
                <tr>
                  <td className="detail-label">Status:</td>
                  <td className="detail-value">
                    <span className={`status-badge status-${subscription.status}`}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </td>
                </tr>
                {subscription.cancelledAt && (
                  <tr>
                    <td className="detail-label">Cancelled At:</td>
                    <td className="detail-value">{formatDate(subscription.cancelledAt)}</td>
                  </tr>
                )}
                <tr>
                  <td className="detail-label">Description:</td>
                  <td className="detail-value">{subscription.description || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="subscription-detail-right">
            <h3 className="related-invoices-title">Invoices</h3>
            <table className="subscription-related-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice #</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingInvoices ? (
                  <tr>
                    <td colSpan={4} className="empty-state">Loading...</td>
                  </tr>
                ) : invoices && invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <tr key={invoice.purchaseInvoiceUploadUuid}>
                      <td>
                        {formatDate(invoice.invoiceSentDate)}
                      </td>
                      <td>
                        {invoice.invoiceNumber || '-'}
                      </td>
                      <td>
                        {invoice.amount
                          ? formatCurrency(invoice.amount, invoice.currency)
                          : '-'}
                      </td>
                      <td>
                        <span className={`status-badge status-${invoice.status}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="empty-state">No invoices</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
