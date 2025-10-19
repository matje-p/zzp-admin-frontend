import React, { useState } from 'react';
import './OutboundInvoices.css';

const OutboundInvoices = () => {
  return (
    <div className="outbound-invoices-page">
      <div className="page-header">
        <h1>Sales invoices</h1>
        <div className="header-actions">
          <button className="btn-primary">
            Create Invoice
          </button>
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
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                No sales invoices found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OutboundInvoices;
