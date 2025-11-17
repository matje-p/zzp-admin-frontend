import React from "react";
import type { PurchaseInvoiceLine, Account } from "../../../types";
import { InvoiceLineRow } from "./InvoiceLineRow";
import { formatCurrency } from "../../../utils/formatters";
import { calculateLineItemsTotal } from "../utils/invoiceHelpers";

interface InvoiceLinesTableProps {
  lines: PurchaseInvoiceLine[] | undefined;
  expenseAccounts: Account[] | undefined;
  onLineItemChange: (
    lineUuid: string,
    field: keyof PurchaseInvoiceLine,
    value: any
  ) => void;
  onAddLine: () => void;
}

export const InvoiceLinesTable: React.FC<InvoiceLinesTableProps> = ({
  lines,
  expenseAccounts,
  onLineItemChange,
  onAddLine,
}) => {
  return (
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
          {lines && lines.length > 0 ? (
            lines.map((line) => (
              <InvoiceLineRow
                key={line.uuid}
                line={line}
                expenseAccounts={expenseAccounts}
                onLineItemChange={onLineItemChange}
              />
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
              {formatCurrency(calculateLineItemsTotal(lines))}
            </td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
