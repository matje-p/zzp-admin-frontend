import React from "react";
import type {
  PurchaseInvoice,
  PurchaseInvoiceLine,
  Contact,
  Account,
} from "../../../types";
import { formatCurrency } from "../../../utils/formatters";
import { calculateLineItemsTotal } from "../utils/invoiceHelpers";

interface InvoiceDetailModalProps {
  invoice: PurchaseInvoice | null;
  isCreating: boolean;
  contacts: Contact[] | undefined;
  expenseAccounts: Account[] | undefined;
  onClose: () => void;
  onSave: () => void;
  onInvoiceChange: (updates: Partial<PurchaseInvoice>) => void;
  onLineItemChange: (
    lineUuid: string,
    field: keyof PurchaseInvoiceLine,
    value: any
  ) => void;
  onAddLine: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isCreating,
  contacts,
  expenseAccounts,
  onClose,
  onSave,
  onInvoiceChange,
  onLineItemChange,
  onAddLine,
}) => {
  if (!invoice) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content invoice-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>
            {isCreating ? "Create Purchase Invoice" : "Invoice Details"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="invoice-detail-content">
          <div className="invoice-detail-left">
            {/* Top Section - Key Information */}
            <div className="invoice-detail-top">
              <div className="detail-field">
                <span className="field-label">Contact</span>
                <select
                  className="field-input"
                  value={invoice.contactUuid || ""}
                  onChange={(e) => {
                    const contactUuid = e.target.value;
                    const contact = contacts?.find(
                      (c) => c.uuid === contactUuid
                    );
                    onInvoiceChange({
                      contactUuid: contactUuid || null,
                      contactName: contact?.name || null,
                      contact: contact,
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.stopPropagation();
                  }}
                >
                  {contacts?.map((contact) => (
                    <option key={contact.uuid} value={contact.uuid}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="detail-field">
                <span className="field-label">Description</span>
                <input
                  type="text"
                  className="field-input"
                  value={invoice.description || ""}
                  onChange={(e) =>
                    onInvoiceChange({ description: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  placeholder="Description"
                />
              </div>
              <div className="detail-field">
                <span className="field-label">Invoice Date</span>
                <input
                  type="date"
                  className="field-input"
                  value={
                    invoice.invoiceSentDate
                      ? invoice.invoiceSentDate.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    onInvoiceChange({
                      invoiceSentDate: new Date(e.target.value).toISOString(),
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </div>
              <div className="detail-field">
                <span className="field-label">Period Start</span>
                <input
                  type="date"
                  className="field-input"
                  value={
                    invoice.periodStartDate
                      ? invoice.periodStartDate.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    onInvoiceChange({
                      periodStartDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </div>
              <div className="detail-field">
                <span className="field-label">Period End</span>
                <input
                  type="date"
                  className="field-input"
                  value={
                    invoice.periodEndDate
                      ? invoice.periodEndDate.split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    onInvoiceChange({
                      periodEndDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : null,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                />
              </div>
              <div className="detail-field">
                <span className="field-label">Subscription</span>
                <span className="field-value">
                  <span className="subscription-badge">
                    {invoice.subscriptionUuid ? "Subscription" : "One-off"}
                  </span>
                </span>
              </div>
            </div>

            {/* Bottom Section - Invoice Lines */}
            <div className="invoice-detail-bottom">
              <h3>Invoice Lines</h3>
              <table className="invoice-lines-table">
                <thead>
                  <tr>
                    <th>Qty.</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>VAT</th>
                    <th>Category</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lines && invoice.lines.length > 0 ? (
                    invoice.lines.map((line) => (
                      <tr key={line.uuid}>
                        <td>
                          <input
                            type="number"
                            className="line-input"
                            value={line.quantity ?? ""}
                            onChange={(e) =>
                              onLineItemChange(
                                line.uuid,
                                "quantity",
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value)
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                            }}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="line-input"
                            value={line.description || ""}
                            onChange={(e) =>
                              onLineItemChange(
                                line.uuid,
                                "description",
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                            }}
                            placeholder="Description"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="line-input amount-input"
                            value={line.amountExclVat ?? ""}
                            onChange={(e) =>
                              onLineItemChange(
                                line.uuid,
                                "amountExclVat",
                                e.target.value === ""
                                  ? null
                                  : Number(e.target.value)
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                            }}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <input
                              type="number"
                              className="line-input vat-input"
                              value={line.vatPercentage ?? ""}
                              onChange={(e) =>
                                onLineItemChange(
                                  line.uuid,
                                  "vatPercentage",
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value)
                                )
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") e.currentTarget.blur();
                              }}
                              min="0"
                              max="100"
                              step="0.01"
                            />
                            <span>%</span>
                          </div>
                        </td>
                        <td>
                          <select
                            className="line-input"
                            value={line.category || ""}
                            onChange={(e) =>
                              onLineItemChange(
                                line.uuid,
                                "category",
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.stopPropagation();
                            }}
                          >
                            <option value="">Select account</option>
                            {expenseAccounts?.map((account) => (
                              <option key={account.uuid} value={account.uuid}>
                                {account.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="no-lines-message">
                        No invoice lines available
                      </td>
                    </tr>
                  )}
                  <tr className="add-line-row">
                    <td colSpan={5}>
                      <button className="btn-add-line" onClick={onAddLine}>
                        Add line
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td></td>
                    <td>Total</td>
                    <td className="amount-cell">
                      {formatCurrency(calculateLineItemsTotal(invoice.lines))}
                    </td>
                    <td></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div className="invoice-detail-right">
            {(() => {
              console.log("🔍 Checking filePath:", invoice.filePath);
              console.log("🔍 Checking filename:", invoice.filename);
              console.log(
                "🔍 Invoice UUID:",
                invoice.purchaseInvoiceUploadUuid
              );
              console.log("🔍 VITE_API_URL:", import.meta.env.VITE_API_URL);

              const hasDocument = invoice.filePath || invoice.filename;

              if (hasDocument) {
                const pdfUrl = `${
                  import.meta.env.VITE_API_URL
                }/api/purchase-invoice/${
                  invoice.purchaseInvoiceUploadUuid
                }/document`;
                console.log("📄 RENDERING IFRAME with URL:", pdfUrl);
                return (
                  <div className="pdf-viewer-container">
                    <iframe
                      src={pdfUrl}
                      className="pdf-viewer"
                      title="Invoice PDF"
                      onLoad={() => {
                        console.log("✅ PDF iframe onLoad fired");
                      }}
                      onError={() => {
                        console.error("❌ PDF iframe onError fired");
                      }}
                    />
                  </div>
                );
              } else {
                console.log("⚠️ No document file - showing placeholder");
                return (
                  <div className="pdf-preview-container">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <div className="pdf-preview-text">No document uploaded</div>
                  </div>
                );
              }
            })()}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-save-invoice" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
