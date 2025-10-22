import React, { useState, useRef } from "react";
import { Trash2 } from "lucide-react";
import { usePurchaseInvoices, useDeletePurchaseInvoice } from "../hooks/usePurchaseInvoices";
import type { PurchaseInvoice } from "../hooks/usePurchaseInvoices";
import "./PurchaseInvoices.css";

const PurchaseInvoices = () => {
  const { data: invoices, isLoading, error, refetch } = usePurchaseInvoices();
  const deleteInvoiceMutation = useDeletePurchaseInvoice();
  const [isDragging, setIsDragging] = useState(false);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(
    null
  );
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleExpand = (invoiceId: string) => {
    setExpandedInvoiceId(expandedInvoiceId === invoiceId ? null : invoiceId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);

    if (files.length > 0) {
      // Check if all files are PDFs
      const nonPdfFiles = files.filter(file => file.type !== "application/pdf");
      if (nonPdfFiles.length > 0) {
        setUploadStatus("error");
        setUploadMessage("Please upload only PDF files");
        setTimeout(() => setUploadStatus("idle"), 3000);
        return;
      }

      await uploadFiles(files);
    }
  };

  const uploadFiles = async (files: File[]) => {
    setUploadStatus("uploading");
    const fileCount = files.length;
    setUploadMessage(`Uploading ${fileCount} invoice${fileCount > 1 ? 's' : ''}...`);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload?process=true`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setUploadStatus("success");
      setUploadMessage(`${fileCount} invoice${fileCount > 1 ? 's' : ''} uploaded successfully!`);

      // Refresh invoices list after successful upload
      setTimeout(() => {
        refetch();
        setUploadStatus("idle");
      }, 2000);
    } catch (err) {
      setUploadStatus("error");
      setUploadMessage("Failed to upload invoices");
      setTimeout(() => setUploadStatus("idle"), 3000);
    }
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const files = Array.from(fileList);

      // Check if all files are PDFs
      const nonPdfFiles = files.filter(file => file.type !== "application/pdf");
      if (nonPdfFiles.length > 0) {
        setUploadStatus("error");
        setUploadMessage("Please upload only PDF files");
        setTimeout(() => setUploadStatus("idle"), 3000);
        return;
      }

      await uploadFiles(files);
    }
    // Reset the input so the same files can be selected again
    e.target.value = "";
  };

  const handleDeleteClick = (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation(); // Prevent row expansion
    setInvoiceToDelete(invoiceId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (invoiceToDelete) {
      try {
        await deleteInvoiceMutation.mutateAsync(invoiceToDelete);
        setDeleteModalOpen(false);
        setInvoiceToDelete(null);
      } catch (error) {
        console.error("Failed to delete invoice:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setInvoiceToDelete(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
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
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="application/pdf"
        multiple
        style={{ display: "none" }}
      />

      <div
        className={`invoice-dropzone ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleDropzoneClick}
      >
        <svg
          className="paperclip-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
        <span className="dropzone-text">
          {uploadStatus === "uploading"
            ? "Uploading..."
            : "Click or drag invoice(s) here"}
        </span>
      </div>

      {uploadStatus === "uploading" && (
        <div className="progress-bar-container">
          <div className="progress-bar"></div>
        </div>
      )}

      {uploadStatus !== "idle" && (
        <div className={`upload-message upload-${uploadStatus}`}>
          {uploadMessage}
        </div>
      )}

      <div className="purchase-invoices-table-container">
        <table className="purchase-invoices-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Contact Name</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice: PurchaseInvoice) => {
                const isExpanded = expandedInvoiceId === invoice.purchaseInvoiceUploadUuid;
                return (
                  <React.Fragment key={invoice.purchaseInvoiceUploadUuid}>
                    <tr
                      onClick={() => toggleExpand(invoice.purchaseInvoiceUploadUuid)}
                      className="clickable-row"
                    >
                      <td>{formatDate(invoice.invoiceDate)}</td>
                      <td>{invoice.contactName || "-"}</td>
                      <td>{invoice.description || "-"}</td>
                      <td className="amount-positive">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="type-cell">
                        <span className="subscription-badge">
                          {invoice.subscriptionUuid ? 'Subscription' : 'One-off'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge status-${invoice.status}`}
                        >
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <button
                          className="delete-button"
                          onClick={(e) => handleDeleteClick(e, invoice.purchaseInvoiceUploadUuid)}
                          title="Delete invoice"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr
                        className="expanded-row"
                        onClick={() => toggleExpand(invoice.purchaseInvoiceUploadUuid)}
                      >
                        <td colSpan={7}>
                          <div className="invoice-details">
                            <table className="details-table">
                              <tbody>
                                <tr>
                                  <td className="detail-label">UUID:</td>
                                  <td className="detail-value">{invoice.purchaseInvoiceUploadUuid || "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Invoice Number:</td>
                                  <td className="detail-value">{invoice.invoiceNumber || "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Invoice Date:</td>
                                  <td className="detail-value">{formatDate(invoice.invoiceDate)}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Due Date:</td>
                                  <td className="detail-value">{invoice.dueDate ? formatDate(invoice.dueDate) : "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Contact Name:</td>
                                  <td className="detail-value">{invoice.contactName || "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Category:</td>
                                  <td className="detail-value">{invoice.category || "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Amount:</td>
                                  <td className="detail-value">{formatCurrency(invoice.amount)}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Amount (excl. VAT):</td>
                                  <td className="detail-value">{invoice.amountExclVat ? formatCurrency(invoice.amountExclVat) : "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">VAT Amount:</td>
                                  <td className="detail-value">{invoice.vatAmount ? formatCurrency(invoice.vatAmount) : "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">VAT Percentage:</td>
                                  <td className="detail-value">{invoice.vatPercentage ? `${invoice.vatPercentage}%` : "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Currency:</td>
                                  <td className="detail-value">{invoice.currency || "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Status:</td>
                                  <td className="detail-value">{invoice.status || "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Paid At:</td>
                                  <td className="detail-value">{invoice.paidAt ? formatDate(invoice.paidAt) : "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Payment Method:</td>
                                  <td className="detail-value">{invoice.paymentMethod || "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Description:</td>
                                  <td className="detail-value">{invoice.description || "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Notes:</td>
                                  <td className="detail-value">{invoice.notes || "-"}</td>
                                </tr>
                                <tr>
                                  <td className="detail-label">Document UUID:</td>
                                  <td className="detail-value">{invoice.documentUuid || "-"}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No invoices found. Click "Refresh Invoices" to reload.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteModalOpen && (
        <div className="modal-overlay" onClick={handleDeleteCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Invoice</h2>
            <p>Are you sure you want to delete this invoice?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={handleDeleteCancel}>
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={handleDeleteConfirm}
                disabled={deleteInvoiceMutation.isPending}
              >
                {deleteInvoiceMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoices;
