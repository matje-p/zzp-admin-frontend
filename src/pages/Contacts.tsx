import React, { useState } from 'react';
import { useContacts } from '@/features/contacts';
import type { Contact } from '@/types';
import { formatDate } from '@/utils/formatters';
import { Button, Badge, Spinner } from '@/components/common';
import './Contacts.css';

const Contacts = () => {
  const { data: contacts, isLoading, error, refetch } = useContacts();
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  const toggleExpand = (contactId: string) => {
    setExpandedContactId(expandedContactId === contactId ? null : contactId);
  };

  if (isLoading) {
    return (
      <div className="contacts-page">
        <div className="page-header">
          <h1>Contacts</h1>
        </div>
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <span>Loading contacts...</span>
        </div>
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
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Loading...</span>
              </div>
            ) : (
              'Refresh Contacts'
            )}
          </Button>
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
                        <Badge variant="default">
                          {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                        </Badge>
                      </td>
                      <td className="vat-number">{contact.vatNumber || '-'}</td>
                      <td className="invoice-count">{contact.purchaseInvoiceCount}</td>
                      <td>
                        <Badge variant={contact.isActive ? 'success' : 'error'}>
                          {contact.isActive ? 'Active' : 'Inactive'}
                        </Badge>
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
