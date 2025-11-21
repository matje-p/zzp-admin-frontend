import React from "react";
import type {
  PurchaseInvoice,
  PurchaseInvoiceLine,
  Contact,
  Account,
} from "@/types";
import type { Subscription } from "@/types/subscription";
import { InvoiceHeaderForm } from "./InvoiceHeaderForm";
import { InvoiceLinesTable } from "./InvoiceLinesTable";
import { DocumentViewer } from "./DocumentViewer";
import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/common";

interface InvoiceDetailModalProps {
  invoice: PurchaseInvoice | null;
  isCreating: boolean;
  contacts: Contact[] | undefined;
  subscriptions: Subscription[] | undefined;
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
  subscriptions,
  expenseAccounts,
  onClose,
  onSave,
  onInvoiceChange,
  onLineItemChange,
  onAddLine,
}) => {
  if (!invoice) return null;

  return (
    <Dialog open={!!invoice} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onClose={onClose} className="invoice-detail-modal">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Create Purchase Invoice" : "Invoice Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="invoice-detail-content">
          <div className="invoice-detail-left">
            <InvoiceHeaderForm
              invoice={invoice}
              contacts={contacts}
              subscriptions={subscriptions}
              onInvoiceChange={onInvoiceChange}
            />

            <InvoiceLinesTable
              lines={invoice.lines}
              expenseAccounts={expenseAccounts}
              onLineItemChange={onLineItemChange}
              onAddLine={onAddLine}
            />
          </div>

          <div className="invoice-detail-right">
            <DocumentViewer
              invoiceUuid={invoice.purchaseInvoiceUploadUuid}
              filePath={invoice.filePath}
              filename={invoice.filename}
            />
          </div>
        </div>

        <DialogFooter>
          <Button className="btn-save-invoice" onClick={onSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
