import React, { useState } from 'react';
import './Subscriptions.css';

const Subscriptions = () => {
  return (
    <div className="subscriptions-page">
      <div className="page-header">
        <h1>Subscriptions</h1>
        <div className="header-actions">
          <button className="btn-primary">
            Add Subscription
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
            <tr>
              <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                No subscriptions found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscriptions;
