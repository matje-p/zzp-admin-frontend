import React from 'react';
import type { Subscription } from '@/types';
import { usePurchaseInvoicesBySubscription } from '../../purchase-invoices';
import { formatCurrency, formatDate, formatBillingCycle } from '@/utils/formatters';
import { Badge, Spinner, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/common';

interface SubscriptionDetailModalProps {
  subscription: Subscription;
  onClose: () => void;
}

export const SubscriptionDetailModal: React.FC<SubscriptionDetailModalProps> = ({
  subscription,
  onClose,
}) => {
  const { data: invoices, isLoading: loadingInvoices } = usePurchaseInvoicesBySubscription(subscription.uuid);
  const [isOpen, setIsOpen] = React.useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent onClose={handleClose} className="subscription-detail-modal">
        <DialogHeader>
          <DialogTitle>Subscription Details</DialogTitle>
        </DialogHeader>
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
                    <Badge variant={subscription.status === 'active' ? 'success' : 'error'}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </Badge>
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
                    <td colSpan={4} className="empty-state"><Spinner size="sm" /></td>
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
                        <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'unpaid' ? 'error' : 'default'}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </Badge>
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
      </DialogContent>
    </Dialog>
  );
};
