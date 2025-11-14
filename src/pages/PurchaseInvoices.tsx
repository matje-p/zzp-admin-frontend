import React, { useState, useRef, useEffect, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { usePurchaseInvoices, useDeletePurchaseInvoice } from "../hooks/usePurchaseInvoices";
import type { PurchaseInvoice } from "../hooks/usePurchaseInvoices";
import "./PurchaseInvoices.css";

interface ProcessingStatus {
  processingId: string;
  step: number;
  totalSteps: number;
  stepName: string;
  message: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  data?: any;
  error?: string;
}


const PurchaseInvoices = () => {
  const { data: invoices, isLoading, error, refetch } = usePurchaseInvoices();
  const deleteInvoiceMutation = useDeletePurchaseInvoice();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

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

  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Handle keyboard events for all modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        // Close detail modal if open
        if (selectedInvoice) {
          handleCloseDetailModal();
        }
        // Close delete modal if open
        if (deleteModalOpen) {
          handleDeleteCancel();
        }
      } else if (e.key === "Enter" && deleteModalOpen) {
        e.preventDefault();
        handleDeleteConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteModalOpen, selectedInvoice, handleDeleteConfirm, handleDeleteCancel]);

  const handleRowClick = (invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice);

    // Log when PDF endpoint will be called
    if (invoice.documentUuid) {
      const pdfUrl = `${import.meta.env.VITE_API_URL}/api/purchase-invoice/${invoice.purchaseInvoiceUploadUuid}/document`;
      console.log('📄 Loading PDF from endpoint:', pdfUrl);
    }
  };

  const handleCloseDetailModal = () => {
    setSelectedInvoice(null);
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
      // Check if all files are PDFs, PNGs, or JPGs
      const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
      const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        setUploadStatus("error");
        setUploadMessage("Please upload only PDF, PNG, or JPG files");
        setTimeout(() => setUploadStatus("idle"), 3000);
        return;
      }

      await uploadFiles(files);
    }
  };

  const connectToSSE = (processingId: string) => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/api/upload/stream/${processingId}`
    );

    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const status: ProcessingStatus = JSON.parse(event.data);
      console.log('Processing status:', status);

      setProcessingStatus(status);
      setUploadMessage(status.message);

      // Handle completion
      if (status.status === 'completed') {
        setUploadStatus("success");
        setUploadMessage("Invoice processed successfully!");
        eventSource.close();
        eventSourceRef.current = null;
        setTimeout(() => {
          setProcessingStatus(null);
          refetch();
          setUploadStatus("idle");
        }, 2000);
      }

      // Handle error
      if (status.status === 'error') {
        setUploadStatus("error");
        setUploadMessage(status.error || "Processing failed");
        setTimeout(() => {
          eventSource.close();
          eventSourceRef.current = null;
          setProcessingStatus(null);
          setUploadStatus("idle");
        }, 3000);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);

      // If already closed or completed, ignore the error (normal closure)
      if (eventSource.readyState === EventSource.CLOSED) {
        console.log('SSE connection closed normally');
        return;
      }

      // Only handle actual errors
      eventSource.close();
      eventSourceRef.current = null;
      setUploadStatus("error");
      setUploadMessage("Connection error during processing");
      setTimeout(() => {
        setProcessingStatus(null);
        setUploadStatus("idle");
      }, 3000);
    };
  };

  const uploadFiles = async (files: File[]) => {
    setUploadStatus("uploading");
    setProcessingStatus(null);
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

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      const processingId = data.data.processingId;

      if (!processingId) {
        throw new Error('No processing ID returned');
      }

      console.log('Upload successful, connecting to SSE...');

      // Connect to SSE for real-time updates
      connectToSSE(processingId);

    } catch (err) {
      setUploadStatus("error");
      setUploadMessage(err instanceof Error ? err.message : "Failed to upload invoices");
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

      // Check if all files are PDFs, PNGs, or JPGs
      const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
      const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        setUploadStatus("error");
        setUploadMessage("Please upload only PDF, PNG, or JPG files");
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

  const getPaymentStatus = (invoice: PurchaseInvoice): 'linked' | 'partially-linked' | 'unlinked' => {
    const amountAllocated = invoice.amountAllocated ?? 0;
    const invoiceAmount = Math.abs(invoice.amount);

    // If amountAllocated is 0 or NaN, it's not linked
    if (!amountAllocated || isNaN(amountAllocated)) {
      return 'unlinked';
    }

    const absAmountAllocated = Math.abs(amountAllocated);

    // If amountAllocated equals invoice amount, it's fully linked
    if (absAmountAllocated === invoiceAmount) {
      return 'linked';
    }

    // If amountAllocated is non-zero but less than invoice amount, it's partially linked
    if (absAmountAllocated > 0 && absAmountAllocated < invoiceAmount) {
      return 'partially-linked';
    }

    return 'unlinked';
  };

  const formatPeriod = (startDate: string | null, endDate: string | null): string => {
    if (!startDate || !endDate) {
      return '-';
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const startDay = start.getDate();
    const startMonth = start.toLocaleString('en-US', { month: 'short' });
    const endDay = end.getDate();
    const endMonth = end.toLocaleString('en-US', { month: 'short' });
    const endYear = end.getFullYear();

    // Format: "5 Jul to 5 Aug 2025"
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      // Same month and year: "5 to 15 Jul 2025"
      return `${startDay} to ${endDay} ${endMonth} ${endYear}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      // Same year but different months: "5 Jul to 5 Aug 2025"
      return `${startDay} ${startMonth} to ${endDay} ${endMonth} ${endYear}`;
    } else {
      // Different years: "5 Jul 2024 to 5 Aug 2025"
      const startYear = start.getFullYear();
      return `${startDay} ${startMonth} ${startYear} to ${endDay} ${endMonth} ${endYear}`;
    }
  };

  const truncateDescription = (description: string | null, maxLength: number = 40): string => {
    if (!description) return '-';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
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
        accept="application/pdf,image/png,image/jpeg,image/jpg"
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

      {uploadStatus !== "idle" && uploadStatus !== "uploading" && (
        <div className={`upload-message upload-${uploadStatus}`}>
          {uploadMessage}
        </div>
      )}

      {processingStatus && uploadStatus === "uploading" && (
        <div className="processing-status-container">
          <div className="processing-spinner"></div>
          <div className="processing-step-message-current">
            {processingStatus.message}
          </div>
        </div>
      )}

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
                  onClick={() => handleRowClick(invoice)}
                  className="clickable-row"
                >
                  <td>
                    <div>
                      {formatDate(invoice.invoiceSentDate)}
                      {!invoice.filePath && (
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                          (expected)
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{invoice.contactName || "-"}</td>
                  <td>{truncateDescription(invoice.description)}</td>
                  <td>{invoice.category || "-"}</td>
                  <td className="amount-positive">
                    {formatCurrency(invoice.amount)}
                  </td>
                  <td className="type-cell">
                    <span className="subscription-badge">
                      {invoice.subscriptionUuid ? 'Subscription' : 'One-off'}
                    </span>
                  </td>
                  <td>{formatPeriod(invoice.periodStartDate, invoice.periodEndDate)}</td>
                  <td>
                    <span
                      className={`status-badge ${invoice.filePath ? 'status-uploaded' : 'status-expected'}`}
                    >
                      {invoice.filePath ? 'Uploaded' : 'Not uploaded'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${getPaymentStatus(invoice)}`}
                    >
                      {getPaymentStatus(invoice) === 'linked' ? 'Linked' :
                       getPaymentStatus(invoice) === 'partially-linked' ? 'Partially Linked' :
                       'Not Linked'}
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

      {selectedInvoice && (
        <div className="modal-overlay" onClick={handleCloseDetailModal}>
          <div className="modal-content invoice-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invoice Details</h2>
              <button className="modal-close" onClick={handleCloseDetailModal}>&times;</button>
            </div>
            <div className="invoice-detail-content">
              <div className="invoice-detail-left">
                <div className="invoice-details">
                  <table className="details-table">
                    <tbody>
                      <tr>
                        <td className="detail-label">UUID:</td>
                        <td className="detail-value">{selectedInvoice.purchaseInvoiceUploadUuid || "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Invoice Number:</td>
                        <td className="detail-value">{selectedInvoice.invoiceNumber || "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Invoice Sent Date:</td>
                        <td className="detail-value">{formatDate(selectedInvoice.invoiceSentDate)}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Due Date:</td>
                        <td className="detail-value">{selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Contact Name:</td>
                        <td className="detail-value">{selectedInvoice.contactName || "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Category:</td>
                        <td className="detail-value">{selectedInvoice.category || "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Period:</td>
                        <td className="detail-value">{formatPeriod(selectedInvoice.periodStartDate, selectedInvoice.periodEndDate)}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Amount:</td>
                        <td className="detail-value">{formatCurrency(selectedInvoice.amount)}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Amount (excl. VAT):</td>
                        <td className="detail-value">{selectedInvoice.amountExclVat ? formatCurrency(selectedInvoice.amountExclVat) : "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">VAT Amount:</td>
                        <td className="detail-value">{selectedInvoice.vatAmount ? formatCurrency(selectedInvoice.vatAmount) : "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">VAT Percentage:</td>
                        <td className="detail-value">{selectedInvoice.vatPercentage ? `${selectedInvoice.vatPercentage}%` : "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Currency:</td>
                        <td className="detail-value">{selectedInvoice.currency || "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Status:</td>
                        <td className="detail-value">{selectedInvoice.status || "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Document Status:</td>
                        <td className="detail-value">
                          <span className={`status-badge ${selectedInvoice.documentUuid ? 'status-uploaded' : 'status-expected'}`}>
                            {selectedInvoice.documentUuid ? 'Uploaded' : 'Expected'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="detail-label">Type:</td>
                        <td className="detail-value">
                          <span className="subscription-badge">
                            {selectedInvoice.subscriptionUuid ? 'Subscription' : 'One-off'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="detail-label">Payment:</td>
                        <td className="detail-value">
                          <span className={`status-badge status-${getPaymentStatus(selectedInvoice)}`}>
                            {getPaymentStatus(selectedInvoice) === 'linked' ? 'Linked' :
                             getPaymentStatus(selectedInvoice) === 'partially-linked' ? 'Partially Linked' :
                             'Not Linked'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="detail-label">Paid At:</td>
                        <td className="detail-value">{selectedInvoice.paidAt ? formatDate(selectedInvoice.paidAt) : "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Payment Method:</td>
                        <td className="detail-value">{selectedInvoice.paymentMethod || "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Description:</td>
                        <td className="detail-value">{selectedInvoice.description || "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Notes:</td>
                        <td className="detail-value">{selectedInvoice.notes || "-"}</td>
                      </tr>
                      <tr>
                        <td className="detail-label">Document UUID:</td>
                        <td className="detail-value">{selectedInvoice.documentUuid || "-"}</td>
                      </tr>
                      {selectedInvoice.subscriptionUuid && (
                        <tr>
                          <td className="detail-label">Subscription UUID:</td>
                          <td className="detail-value">{selectedInvoice.subscriptionUuid}</td>
                        </tr>
                      )}
                      {selectedInvoice.transactionUuid && (
                        <tr>
                          <td className="detail-label">Transaction UUID:</td>
                          <td className="detail-value">{selectedInvoice.transactionUuid}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="invoice-detail-right">
              {(() => {
                  console.log('🔍 Checking filePath:', selectedInvoice.filePath);
                  console.log('🔍 Checking filename:', selectedInvoice.filename);
                  console.log('🔍 Invoice UUID:', selectedInvoice.purchaseInvoiceUploadUuid);
                  console.log('🔍 VITE_API_URL:', import.meta.env.VITE_API_URL);

                  const hasDocument = selectedInvoice.filePath || selectedInvoice.filename;

                  if (hasDocument) {
                    const pdfUrl = `${import.meta.env.VITE_API_URL}/api/purchase-invoice/${selectedInvoice.purchaseInvoiceUploadUuid}/document`;
                    console.log('📄 RENDERING IFRAME with URL:', pdfUrl);
                    return (
                      <div className="pdf-viewer-container">
                        <iframe
                          src={pdfUrl}
                          className="pdf-viewer"
                          title="Invoice PDF"
                          onLoad={() => {
                            console.log('✅ PDF iframe onLoad fired');
                          }}
                          onError={() => {
                            console.error('❌ PDF iframe onError fired');
                          }}
                        />
                      </div>
                    );
                  } else {
                    console.log('⚠️ No document file - showing placeholder');
                    return (
                      <div className="pdf-preview-container">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <div className="pdf-preview-text">
                          No document uploaded
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoices;
