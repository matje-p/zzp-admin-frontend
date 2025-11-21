import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateSalesInvoice, type CreateSalesInvoiceDto } from '../hooks/useSalesInvoices';
import { Button, Input, Select, Textarea, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, FormField } from '@/components/common';
import { salesInvoiceSchema, type SalesInvoiceFormData } from '@/lib/validation';
import { showToast } from '@/lib/toast';
import './SalesInvoiceForm.css';

interface SalesInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalesInvoiceForm: React.FC<SalesInvoiceFormProps> = ({ isOpen, onClose }) => {
  const createMutation = useCreateSalesInvoice();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SalesInvoiceFormData>({
    resolver: zodResolver(salesInvoiceSchema),
    defaultValues: {
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
    }
  });

  // Watch subtotal and VAT percentage for auto-calculation
  const subtotal = watch('subtotal');
  const vatPercentage = watch('vatPercentage');

  // Auto-calculate VAT and total when subtotal or VAT percentage changes
  React.useEffect(() => {
    const subtotalNum = parseFloat(subtotal?.toString() || '0') || 0;
    const vatPercentageNum = parseFloat(vatPercentage?.toString() || '0') || 0;
    const vatAmount = subtotalNum * (vatPercentageNum / 100);
    const totalAmount = subtotalNum + vatAmount;

    setValue('vatAmount', parseFloat(vatAmount.toFixed(2)));
    setValue('totalAmount', parseFloat(totalAmount.toFixed(2)));
  }, [subtotal, vatPercentage, setValue]);

  const onSubmit = async (data: SalesInvoiceFormData) => {
    try {
      await createMutation.mutateAsync(data as CreateSalesInvoiceDto);
      showToast.success('Sales invoice created successfully');
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create sales invoice:', error);
      showToast.error('Failed to create sales invoice. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose}>
        <DialogHeader>
          <DialogTitle>Create Sales Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="sales-invoice-form">
          <div className="form-section">
            <h3>Invoice Details</h3>
            <div className="form-row">
              <FormField
                name="invoiceNumber"
                label="Invoice Number"
                required
                error={errors.invoiceNumber?.message}
              >
                <Input
                  {...register('invoiceNumber')}
                  placeholder="INV-2025-001"
                />
              </FormField>

              <FormField
                name="invoiceDate"
                label="Invoice Date"
                required
                error={errors.invoiceDate?.message}
              >
                <Input
                  type="date"
                  {...register('invoiceDate')}
                />
              </FormField>

              <FormField
                name="dueDate"
                label="Due Date"
                error={errors.dueDate?.message}
              >
                <Input
                  type="date"
                  {...register('dueDate')}
                />
              </FormField>
            </div>
          </div>

          <div className="form-section">
            <h3>Client Information</h3>
            <div className="form-row">
              <FormField
                name="clientName"
                label="Client Name"
                required
                error={errors.clientName?.message}
                className="full-width"
              >
                <Input
                  {...register('clientName')}
                  placeholder="Company Name or Person"
                />
              </FormField>
            </div>

            <div className="form-row">
              <FormField
                name="clientEmail"
                label="Client Email"
                error={errors.clientEmail?.message}
              >
                <Input
                  type="email"
                  {...register('clientEmail')}
                  placeholder="client@example.com"
                />
              </FormField>

              <FormField
                name="clientVatNumber"
                label="Client VAT Number"
                error={errors.clientVatNumber?.message}
              >
                <Input
                  {...register('clientVatNumber')}
                  placeholder="NL123456789B01"
                />
              </FormField>
            </div>

            <div className="form-row">
              <FormField
                name="clientAddress"
                label="Client Address"
                error={errors.clientAddress?.message}
                className="full-width"
              >
                <Input
                  {...register('clientAddress')}
                  placeholder="Street Address, City, Country"
                />
              </FormField>
            </div>
          </div>

          <div className="form-section">
            <h3>Invoice Items</h3>
            <div className="form-row">
              <FormField
                name="description"
                label="Description"
                error={errors.description?.message}
                className="full-width"
              >
                <Textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Describe the services or products"
                />
              </FormField>
            </div>

            <div className="form-row">
              <FormField
                name="subtotal"
                label="Subtotal (excl. VAT)"
                required
                error={errors.subtotal?.message}
              >
                <Input
                  type="number"
                  {...register('subtotal', { valueAsNumber: true })}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </FormField>

              <FormField
                name="vatPercentage"
                label="VAT %"
                error={errors.vatPercentage?.message}
              >
                <Input
                  type="number"
                  {...register('vatPercentage', { valueAsNumber: true })}
                  step="0.01"
                  min="0"
                  max="100"
                />
              </FormField>

              <FormField
                name="vatAmount"
                label="VAT Amount"
                error={errors.vatAmount?.message}
              >
                <Input
                  type="number"
                  {...register('vatAmount', { valueAsNumber: true })}
                  readOnly
                  className="readonly-field"
                  step="0.01"
                />
              </FormField>

              <FormField
                name="totalAmount"
                label="Total Amount"
                error={errors.totalAmount?.message}
              >
                <Input
                  type="number"
                  {...register('totalAmount', { valueAsNumber: true })}
                  readOnly
                  className="readonly-field total-amount"
                  step="0.01"
                />
              </FormField>
            </div>

            <div className="form-row">
              <FormField
                name="currency"
                label="Currency"
                error={errors.currency?.message}
              >
                <Select {...register('currency')}>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </Select>
              </FormField>

              <FormField
                name="status"
                label="Status"
                error={errors.status?.message}
              >
                <Select {...register('status')}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormField>
            </div>
          </div>

          <div className="form-section">
            <h3>Additional Information</h3>
            <div className="form-row">
              <FormField
                name="notes"
                label="Notes"
                error={errors.notes?.message}
                className="full-width"
              >
                <Textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Internal notes (not shown to client)"
                />
              </FormField>
            </div>

            <div className="form-row">
              <FormField
                name="termsAndConditions"
                label="Terms and Conditions"
                error={errors.termsAndConditions?.message}
                className="full-width"
              >
                <Textarea
                  {...register('termsAndConditions')}
                  rows={3}
                  placeholder="Payment terms, conditions, etc."
                />
              </FormField>
            </div>
          </div>

          {createMutation.isError && (
            <div className="form-error">
              Failed to create invoice. Please try again.
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SalesInvoiceForm;
