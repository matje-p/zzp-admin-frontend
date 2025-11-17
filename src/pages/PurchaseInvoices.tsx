import React, { useState, useCallback } from "react";
import { Trash2 } from "lucide-react";
import {
  usePurchaseInvoices,
  useDeletePurchaseInvoice,
  useContacts,
  useExpenseAccounts,
  useFileUpload,
  useInvoiceModal,
  FileUploadDropzone,
  InvoiceDetailModal,
  DeleteConfirmModal,
  UnsavedChangesModal,
  getPaymentStatus,
} from "../features/purchase-invoices";
import type { PurchaseInvoice } from "../types";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { formatCurrency, formatDate, formatPeriod, truncateDescription } from "../utils/formatters";
import "./PurchaseInvoices.css";

const PurchaseInvoices = () => {
  const { data: invoices, isLoading, error, refetch } = usePurchaseInvoices();
  const { data: contacts } = useContacts();
  const { data: expenseAccounts } = useExpenseAccounts();
  const deleteInvoiceMutation = useDeletePurchaseInvoice();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);

  // File upload hook
  const {
    isDragging,
    uploadStatus,
    uploadMessage,
    processingStatus,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
  } = useFileUpload(refetch);

  // Invoice modal hook
  const {
    selectedInvoice,
    isCreatingInvoice,
    unsavedChangesModalOpen,
    handleOpenInvoice,
    handleCreateInvoice,
    handleCloseDetailModal,
    handleInvoiceChange,
    handleAddLineClick,
    handleLineItemChange,
    handleSaveInvoice,
    handleUnsavedChangesConfirm,
    handleUnsavedChangesCancel,
  } = useInvoiceModal(refetch);

  // Delete modal handlers
  const handleDeleteConfirm = useCallback(async () => {
    if (invoiceToDelete) {
      try {
        await deleteInvoiceMutation.mutateAsync(invoiceToDelete);
        setDeleteModalOpen(false);
        setInvoiceToDelete(null);
      } catch (error) {
        console.error("Failed to delete invoice:", error);
      }
    }
  }, [invoiceToDelete, deleteInvoiceMutation]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setInvoiceToDelete(null);
  }, []);

  const handleDeleteClick = (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation(); // Prevent row expansion
    setInvoiceToDelete(invoiceId);
    setDeleteModalOpen(true);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    deleteModalOpen,
    unsavedChangesModalOpen,
    selectedInvoice,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleCloseDetailModal,
    handleUnsavedChangesConfirm,
    handleUnsavedChangesCancel,
  });

  if (isLoading) {
    return (
      <div className="purchase-invoices-page">
        <div className="page-header">
          <h1>Purchase invoices</h1>
        </div>
        <p>Loading invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="purchase-invoices-page">
        <div className="page-header">
          <h1>Purchase invoices</h1>
        </div>
        <p className="error-message">
          Error loading invoices: {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div className="purchase-invoices-page">
      <div className="page-header">
        <h1>Purchase invoices</h1>
        <button className="btn-primary" onClick={handleCreateInvoice}>
          Add Purchase Invoice
        </button>
      </div>

      <FileUploadDropzone
        isDragging={isDragging}
        uploadStatus={uploadStatus}
        uploadMessage={uploadMessage}
        processingStatus={processingStatus}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileInputChange={handleFileInputChange}
      />

      <div className="purchase-invoices-table-container">
        <table className="purchase-invoices-table">
          <thead>
            <tr>
              <th>Invoice Date</th>
              <th>Contact Name</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Period</th>
              <th>File</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice: PurchaseInvoice) => (
                <tr
                  key={invoice.purchaseInvoiceUploadUuid}
                  onClick={() => handleOpenInvoice(invoice)}
                  className="clickable-row"
                >
                  <td>
                    <div>
                      {formatDate(invoice.invoiceSentDate)}
                      {!invoice.filePath && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            marginTop: "2px",
                          }}
                        >
                          (expected)
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{invoice.contact?.name || invoice.contactName || "-"}</td>
                  <td>{truncateDescription(invoice.description)}</td>
                  <td>{invoice.category || "-"}</td>
                  <td className="amount-positive">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="type-cell">
                    <span className="subscription-badge">
                      {invoice.subscriptionUuid ? "Subscription" : "One-off"}
                    </span>
                  </td>
                  <td>
                    {formatPeriod(
                      invoice.periodStartDate,
                      invoice.periodEndDate
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        invoice.filePath ? "status-uploaded" : "status-expected"
                      }`}
                    >
                      {invoice.filePath ? "Uploaded" : "Not uploaded"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${getPaymentStatus(
                        invoice
                      )}`}
                    >
                      {getPaymentStatus(invoice) === "linked"
                        ? "Linked"
                        : getPaymentStatus(invoice) === "partially-linked"
                        ? "Partially Linked"
                        : "Not Linked"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={(e) =>
                        handleDeleteClick(e, invoice.purchaseInvoiceUploadUuid)
                      }
                      title="Delete invoice"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No invoices found. Click "Refresh Invoices" to reload.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        isDeleting={deleteInvoiceMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      <InvoiceDetailModal
        invoice={selectedInvoice}
        isCreating={isCreatingInvoice}
        contacts={contacts}
        expenseAccounts={expenseAccounts}
        onClose={handleCloseDetailModal}
        onSave={handleSaveInvoice}
        onInvoiceChange={handleInvoiceChange}
        onLineItemChange={handleLineItemChange}
        onAddLine={handleAddLineClick}
      />

      <UnsavedChangesModal
        isOpen={unsavedChangesModalOpen}
        onConfirm={handleUnsavedChangesConfirm}
        onCancel={handleUnsavedChangesCancel}
      />
    </div>
  );
};

export default PurchaseInvoices;
