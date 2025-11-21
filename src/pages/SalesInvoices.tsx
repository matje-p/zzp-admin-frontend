import { useState } from 'react';
import { useSalesInvoices, SalesInvoiceForm } from '@/features/sales-invoices';
import type { SalesInvoice } from '@/features/sales-invoices/hooks/useSalesInvoices';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Button, Badge } from '@/components/common';
import './SalesInvoices.css';

const SalesInvoices = () => {
  const { data: invoices, isLoading, error } = useSalesInvoices();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const getStatusVariant = (status: string): "default" | "success" | "warning" | "error" | "info" | "secondary" => {
    switch (status) {
      case 'paid': return 'success';
      case 'sent': return 'info';
      case 'overdue': return 'error';
      case 'cancelled': return 'secondary';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="outbound-invoices-page">
        <div className="page-header">
          <h1>Sales Invoices</h1>
        </div>
        <p>Loading sales invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="outbound-invoices-page">
        <div className="page-header">
          <h1>Sales Invoices</h1>
        </div>
        <p className="error-message">Error loading sales invoices: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="outbound-invoices-page">
      <div className="page-header">
        <h1>Sales Invoices</h1>
        <div className="header-actions">
          <Button onClick={() => setIsFormOpen(true)}>
            Create Invoice
          </Button>
        </div>
      </div>

      <div className="outbound-invoices-table-container">
        <table className="outbound-invoices-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice: SalesInvoice) => (
                <tr key={invoice.uuid}>
                  <td className="invoice-number">{invoice.invoiceNumber}</td>
                  <td>{formatDate(invoice.invoiceDate)}</td>
                  <td>{invoice.clientName}</td>
                  <td className="amount">{formatCurrency(invoice.totalAmount)}</td>
                  <td>{invoice.dueDate ? formatDate(invoice.dueDate) : '-'}</td>
                  <td>
                    <Badge variant={getStatusVariant(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                  No sales invoices found. Click "Create Invoice" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SalesInvoiceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default SalesInvoices;
