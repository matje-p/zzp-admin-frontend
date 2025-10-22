import React, { useState } from 'react';
import { useContacts } from '../hooks/useContacts';
import type { Contact } from '../hooks/useContacts';
import './Contacts.css';

const Contacts = () => {
  const { data: contacts, isLoading, error, refetch } = useContacts();
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  const toggleExpand = (contactId: string) => {
    setExpandedContactId(expandedContactId === contactId ? null : contactId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (isLoading) {
    return (
      <div className="contacts-page">
        <div className="page-header">
          <h1>Contacts</h1>
        </div>
        <p>Loading contacts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contacts-page">
        <div className="page-header">
          <h1>Contacts</h1>
        </div>
        <p className="error-message">Error loading contacts: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="contacts-page">
      <div className="page-header">
        <h1>Contacts</h1>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={refetch}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Contacts'}
          </button>
        </div>
      </div>

      <div className="contacts-table-container">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Type</th>
              <th>VAT Number</th>
              <th>Invoices</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {contacts && contacts.length > 0 ? (
              contacts.map((contact: Contact) => {
                const isExpanded = expandedContactId === contact.uuid;
                return (
                  <React.Fragment key={contact.uuid}>
                    <tr
                      onClick={() => toggleExpand(contact.uuid)}
                      className="clickable-row"
                    >
                      <td className="contact-name">{contact.name}</td>
                      <td>{contact.email || '-'}</td>
                      <td>{contact.phone || '-'}</td>
                      <td>
                        <span className={`type-badge type-${contact.type}`}>
                          {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                        </span>
                      </td>
                      <td className="vat-number">{contact.vatNumber || '-'}</td>
                      <td className="invoice-count">{contact.purchaseInvoiceCount}</td>
                      <td>
                        <span className={`status-badge ${contact.isActive ? 'status-active' : 'status-inactive'}`}>
                          {contact.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${contact.uuid}-details`} className="expanded-row">
                        <td colSpan={7}>
                          <div className="contact-details">
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Address:</span>
                                <span className="detail-value">{contact.address || '-'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Created:</span>
                                <span className="detail-value">{formatDate(contact.createdAt)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Last Updated:</span>
                                <span className="detail-value">{formatDate(contact.updatedAt)}</span>
                              </div>
                              <div className="detail-item full-width">
                                <span className="detail-label">Notes:</span>
                                <span className="detail-value">{contact.notes || '-'}</span>
                              </div>
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
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                  No contacts found. Click "Refresh Contacts" to reload.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contacts;
