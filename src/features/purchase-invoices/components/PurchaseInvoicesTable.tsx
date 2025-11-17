import React from "react";
import { Trash2 } from "lucide-react";
import type { PurchaseInvoice } from "../../../types";
import { formatCurrency, formatDate, formatPeriod, truncateDescription } from "../../../utils/formatters";
import { getPaymentStatus } from "../utils/invoiceHelpers";

interface PurchaseInvoicesTableProps {
  invoices: PurchaseInvoice[] | undefined;
  onRowClick: (invoice: PurchaseInvoice) => void;
  onDeleteClick: (e: React.MouseEvent, invoiceId: string) => void;
}

export const PurchaseInvoicesTable: React.FC<PurchaseInvoicesTableProps> = ({
  invoices,
  onRowClick,
  onDeleteClick,
}) => {
  return (
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
                onClick={() => onRowClick(invoice)}
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
                <td>
                  <div>
                    {truncateDescription(invoice.subscription?.name || invoice.description)}
                    {invoice.periodStartDate && invoice.periodEndDate && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#6b7280",
                          marginTop: "2px",
                        }}
                      >
                        ({formatPeriod(invoice.periodStartDate, invoice.periodEndDate)})
                      </div>
                    )}
                  </div>
                </td>
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
                      onDeleteClick(e, invoice.purchaseInvoiceUploadUuid)
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
                colSpan={9}
                style={{ textAlign: "center", padding: "20px" }}
              >
                No invoices found. Click "Refresh Invoices" to reload.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
