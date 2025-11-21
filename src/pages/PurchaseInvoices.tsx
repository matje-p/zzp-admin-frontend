import React, { useState, useCallback } from "react";
import {
  usePurchaseInvoices,
  useDeletePurchaseInvoice,
  useFileUpload,
  useInvoiceModal,
  FileUploadDropzone,
  InvoiceDetailModal,
  DeleteConfirmModal,
  UnsavedChangesModal,
  PurchaseInvoicesTable,
} from "@/features/purchase-invoices";
import { useContacts } from "@/features/contacts";
import { useExpenseAccounts } from "@/features/accounts";
import { useSubscriptions } from "@/features/subscriptions";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Button } from "@/components/common";
import { showToast } from "@/lib/toast";
import "./PurchaseInvoices.css";

const PurchaseInvoices = () => {
  const { data: invoices, isLoading, error, refetch } = usePurchaseInvoices();
  const { data: contacts } = useContacts();
  const { data: subscriptions } = useSubscriptions();
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
        showToast.success("Invoice deleted successfully");
        setDeleteModalOpen(false);
        setInvoiceToDelete(null);
      } catch (error) {
        console.error("Failed to delete invoice:", error);
        showToast.error("Failed to delete invoice. Please try again.");
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
        <Button onClick={handleCreateInvoice}>
          Add Purchase Invoice
        </Button>
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

      <PurchaseInvoicesTable
        invoices={invoices}
        onRowClick={handleOpenInvoice}
        onDeleteClick={handleDeleteClick}
      />

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
        subscriptions={subscriptions}
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
