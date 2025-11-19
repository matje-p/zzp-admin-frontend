import React from "react";
import type { PurchaseInvoiceLine, Account } from "../../../types";

interface InvoiceLineRowProps {
  line: PurchaseInvoiceLine;
  expenseAccounts: Account[] | undefined;
  onLineItemChange: (
    lineUuid: string,
    field: keyof PurchaseInvoiceLine,
    value: any
  ) => void;
}

export const InvoiceLineRow: React.FC<InvoiceLineRowProps> = ({
  line,
  expenseAccounts,
  onLineItemChange,
}) => {
  return (
    <tr>
      <td>
        <input
          type="number"
          className="form-input-compact line-input"
          value={line.quantity ?? ""}
          onChange={(e) =>
            onLineItemChange(
              line.uuid,
              "quantity",
              e.target.value === "" ? null : Number(e.target.value)
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
          className="form-input-compact line-input"
          value={line.description || ""}
          onChange={(e) =>
            onLineItemChange(line.uuid, "description", e.target.value)
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
          className="form-input-compact line-input amount-input"
          value={line.amountExclVat ?? ""}
          onChange={(e) =>
            onLineItemChange(
              line.uuid,
              "amountExclVat",
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          // min="0"
          // step="0.01"
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
            className="form-input-compact line-input vat-input"
            value={line.vatPercentage ?? ""}
            onChange={(e) =>
              onLineItemChange(
                line.uuid,
                "vatPercentage",
                e.target.value === "" ? null : Number(e.target.value)
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
          className="form-select-compact line-input"
          value={line.category || ""}
          onChange={(e) =>
            onLineItemChange(line.uuid, "category", e.target.value)
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
  );
};
