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
      <DialogContent onClose={onClose} className="max-w-[1200px] w-[95vw]">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? "Create Purchase Invoice" : "Invoice Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="flex flex-col gap-6 overflow-y-auto">
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

          <div className="flex flex-col gap-3">
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
