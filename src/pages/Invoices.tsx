import React, { useState, useRef } from "react";
import { useInvoices } from "../hooks/useInvoices";
import type { Invoice } from "../hooks/useInvoices";
import "./Invoices.css";

const Invoices = () => {
  const { data: invoices, isLoading, error, refetch } = useInvoices();
  const [isDragging, setIsDragging] = useState(false);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(
    null
  );
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadMessage, setUploadMessage] = useState<string>("");
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
      <div className="invoices-page">
        <div className="page-header">
          <h1>Purchase invoices</h1>
        </div>
        <p>Loading invoices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invoices-page">
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
    <div className="invoices-page">
      <div className="page-header">
        <h1>Purchase invoices</h1>
        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={refetch}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Refresh Invoices"}
          </button>
        </div>
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

      <div className="invoices-table-container">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Contact Name</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice: Invoice) => {
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
                          {invoice.notes && invoice.notes.toLowerCase().includes('recurring') ? 'Recurring' : 'One-off'}
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
                    </tr>
                    {isExpanded && (
                      <tr
                        className="expanded-row"
                        onClick={() => toggleExpand(invoice.purchaseInvoiceUploadUuid)}
                      >
                        <td colSpan={6}>
                          <div className="invoice-details">
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">
                                  Description:
                                </span>
                                <span className="detail-value">
                                  {invoice.description || "-"}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Category:</span>
                                <span className="detail-value">
                                  {invoice.category || "-"}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">
                                  Amount (excl. VAT):
                                </span>
                                <span className="detail-value">
                                  {invoice.amountExclVat
                                    ? formatCurrency(invoice.amountExclVat)
                                    : "-"}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">
                                  VAT Amount:
                                </span>
                                <span className="detail-value">
                                  {invoice.vatAmount
                                    ? formatCurrency(invoice.vatAmount)
                                    : "-"}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">
                                  VAT Percentage:
                                </span>
                                <span className="detail-value">
                                  {invoice.vatPercentage
                                    ? `${invoice.vatPercentage}%`
                                    : "-"}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">
                                  Payment Method:
                                </span>
                                <span className="detail-value">
                                  {invoice.paymentMethod || "-"}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Paid At:</span>
                                <span className="detail-value">
                                  {invoice.paidAt
                                    ? formatDate(invoice.paidAt)
                                    : "-"}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Notes:</span>
                                <span className="detail-value">
                                  {invoice.notes || "-"}
                                </span>
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
                <td
                  colSpan={6}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No invoices found. Click "Refresh Invoices" to reload.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
