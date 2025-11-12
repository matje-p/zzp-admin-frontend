import React, { useState, useEffect } from 'react';
import { useCreateSalesInvoice, type CreateSalesInvoiceDto } from '../hooks/useSalesInvoices';
import './SalesInvoiceForm.css';

interface SalesInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalesInvoiceForm: React.FC<SalesInvoiceFormProps> = ({ isOpen, onClose }) => {
  const createMutation = useCreateSalesInvoice();

  const [formData, setFormData] = useState<CreateSalesInvoiceDto>({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    clientVatNumber: '',
    description: '',
    subtotal: 0,
    vatPercentage: 21,
    vatAmount: 0,
    totalAmount: 0,
    currency: 'EUR',
    status: 'draft',
    notes: '',
    termsAndConditions: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate VAT and total when subtotal or VAT percentage changes
      if (name === 'subtotal' || name === 'vatPercentage') {
        const subtotal = parseFloat(name === 'subtotal' ? value : updated.subtotal.toString()) || 0;
        const vatPercentage = parseFloat(name === 'vatPercentage' ? value : updated.vatPercentage?.toString() || '0') || 0;
        const vatAmount = subtotal * (vatPercentage / 100);
        const totalAmount = subtotal + vatAmount;

        return {
          ...updated,
          subtotal,
          vatPercentage,
          vatAmount,
          totalAmount
        };
      }

      return updated;
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.invoiceNumber.trim()) {
      newErrors.invoiceNumber = 'Invoice number is required';
    }
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'Invoice date is required';
    }
    if (formData.subtotal <= 0) {
      newErrors.subtotal = 'Subtotal must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await createMutation.mutateAsync(formData);

      // Reset form and close modal
      setFormData({
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        clientName: '',
        clientEmail: '',
        clientAddress: '',
        clientVatNumber: '',
        description: '',
        subtotal: 0,
        vatPercentage: 21,
        vatAmount: 0,
        totalAmount: 0,
        currency: 'EUR',
        status: 'draft',
        notes: '',
        termsAndConditions: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create sales invoice:', error);
      setErrors({ submit: 'Failed to create invoice. Please try again.' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Sales Invoice</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="sales-invoice-form">
          <div className="form-section">
            <h3>Invoice Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="invoiceNumber">Invoice Number *</label>
                <input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  className={errors.invoiceNumber ? 'error' : ''}
                  placeholder="INV-2025-001"
                />
                {errors.invoiceNumber && <span className="error-message">{errors.invoiceNumber}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="invoiceDate">Invoice Date *</label>
                <input
                  type="date"
                  id="invoiceDate"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  className={errors.invoiceDate ? 'error' : ''}
                />
                {errors.invoiceDate && <span className="error-message">{errors.invoiceDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Client Information</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="clientName">Client Name *</label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  className={errors.clientName ? 'error' : ''}
                  placeholder="Company Name or Person"
                />
                {errors.clientName && <span className="error-message">{errors.clientName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clientEmail">Client Email</label>
                <input
                  type="email"
                  id="clientEmail"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  placeholder="client@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="clientVatNumber">Client VAT Number</label>
                <input
                  type="text"
                  id="clientVatNumber"
                  name="clientVatNumber"
                  value={formData.clientVatNumber}
                  onChange={handleChange}
                  placeholder="NL123456789B01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="clientAddress">Client Address</label>
                <input
                  type="text"
                  id="clientAddress"
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleChange}
                  placeholder="Street Address, City, Country"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Invoice Items</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe the services or products"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="subtotal">Subtotal (excl. VAT) *</label>
                <input
                  type="number"
                  id="subtotal"
                  name="subtotal"
                  value={formData.subtotal}
                  onChange={handleChange}
                  className={errors.subtotal ? 'error' : ''}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                {errors.subtotal && <span className="error-message">{errors.subtotal}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="vatPercentage">VAT %</label>
                <input
                  type="number"
                  id="vatPercentage"
                  name="vatPercentage"
                  value={formData.vatPercentage}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="vatAmount">VAT Amount</label>
                <input
                  type="number"
                  id="vatAmount"
                  name="vatAmount"
                  value={formData.vatAmount}
                  readOnly
                  className="readonly-field"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="totalAmount">Total Amount</label>
                <input
                  type="number"
                  id="totalAmount"
                  name="totalAmount"
                  value={formData.totalAmount}
                  readOnly
                  className="readonly-field total-amount"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Internal notes (not shown to client)"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="termsAndConditions">Terms and Conditions</label>
                <textarea
                  id="termsAndConditions"
                  name="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Payment terms, conditions, etc."
                />
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="form-error">
              {errors.submit}
            </div>
          )}

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesInvoiceForm;
