import { useState, useCallback } from "react";
import type { PurchaseInvoice, PurchaseInvoiceLine } from "@/types";
import { createNewInvoice, createNewInvoiceLine, transformLineItemsForBackend } from "../utils/invoiceHelpers";
import { useUpdatePurchaseInvoice } from "./usePurchaseInvoices";

export const useInvoiceModal = (refetch: () => void) => {
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [originalInvoice, setOriginalInvoice] = useState<PurchaseInvoice | null>(null);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);

  const updateInvoiceMutation = useUpdatePurchaseInvoice();

  const hasUnsavedChanges = useCallback((): boolean => {
    if (!selectedInvoice || !originalInvoice) return false;
    return JSON.stringify(selectedInvoice) !== JSON.stringify(originalInvoice);
  }, [selectedInvoice, originalInvoice]);

  const handleUnsavedChangesConfirm = useCallback(() => {
    setUnsavedChangesModalOpen(false);
    setSelectedInvoice(null);
    setOriginalInvoice(null);
    setIsCreatingInvoice(false);
  }, []);

  const handleUnsavedChangesCancel = useCallback(() => {
    setUnsavedChangesModalOpen(false);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    if (hasUnsavedChanges()) {
      setUnsavedChangesModalOpen(true);
      return;
    }
    setSelectedInvoice(null);
    setOriginalInvoice(null);
    setIsCreatingInvoice(false);
  }, [hasUnsavedChanges]);

  const handleOpenInvoice = useCallback((invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice);
    setOriginalInvoice(JSON.parse(JSON.stringify(invoice))); // Deep copy

    // Log when PDF endpoint will be called
    if (invoice.documentUuid) {
      const pdfUrl = `${import.meta.env.VITE_API_URL}/api/purchase-invoice/${
        invoice.purchaseInvoiceUploadUuid
      }/document`;
      console.log("📄 Loading PDF from endpoint:", pdfUrl);
    }
  }, []);

  const handleCreateInvoice = useCallback(() => {
    const newInvoice = createNewInvoice();
    setSelectedInvoice(newInvoice);
    setOriginalInvoice(JSON.parse(JSON.stringify(newInvoice))); // Deep copy
    setIsCreatingInvoice(true);
  }, []);

  const handleInvoiceChange = useCallback((updates: Partial<PurchaseInvoice>) => {
    if (selectedInvoice) {
      setSelectedInvoice({ ...selectedInvoice, ...updates });
    }
  }, [selectedInvoice]);

  const handleAddLineClick = useCallback(() => {
    if (selectedInvoice) {
      const lineToAdd = createNewInvoiceLine();
      const updatedLines = [...(selectedInvoice.lines || []), lineToAdd];
      setSelectedInvoice({
        ...selectedInvoice,
        lines: updatedLines,
      });
    }
  }, [selectedInvoice]);

  const handleLineItemChange = useCallback(
    (lineUuid: string, field: keyof PurchaseInvoiceLine, value: any) => {
      if (selectedInvoice && selectedInvoice.lines) {
        const updatedLines = selectedInvoice.lines.map((line) => {
          if (line.uuid === lineUuid) {
            return { ...line, [field]: value };
          }
          return line;
        });
        setSelectedInvoice({ ...selectedInvoice, lines: updatedLines });
      }
    },
    [selectedInvoice]
  );

  const handleSaveInvoice = useCallback(async () => {
    if (selectedInvoice) {
      try {
        if (isCreatingInvoice) {
          // Creating new invoice - backend endpoint doesn't exist yet
          alert(
            "Create invoice endpoint not implemented in backend yet. Please use the upload feature or ask backend team to add POST /api/purchase-invoice endpoint."
          );
          return;
        } else {
          // Updating existing invoice with line items
          const {
            lines,
          } = selectedInvoice;

          console.log("Lines from selectedInvoice:", lines);
          console.log("Full selectedInvoice:", selectedInvoice);

          const payload: any = {
            invoiceNumber: selectedInvoice.invoiceNumber,
            invoiceSentDate: selectedInvoice.invoiceSentDate,
            dueDate: selectedInvoice.dueDate,
            contactUuid: selectedInvoice.contactUuid,
            category: selectedInvoice.category,
            amount: selectedInvoice.amount,
            description: selectedInvoice.description,
            status: selectedInvoice.status,
            subscriptionUuid: selectedInvoice.subscriptionUuid,
            periodStartDate: selectedInvoice.periodStartDate,
            periodEndDate: selectedInvoice.periodEndDate,
          };

          // Add line items if they exist, transforming to backend format
          if (lines && lines.length > 0) {
            const transformedLines = transformLineItemsForBackend(lines);
            console.log("Transformed lines before filter:", transformedLines);
            payload.lineItems = transformedLines.filter(
              (line) => line.uuid !== undefined || line.description
            );
            console.log("Line items after filter:", payload.lineItems);
          }

          console.log("Final payload:", payload);

          await updateInvoiceMutation.mutateAsync({
            uuid: selectedInvoice.purchaseInvoiceUploadUuid,
            ...payload,
          });
        }
        await refetch();
        // Reset original invoice to prevent unsaved changes warning
        setOriginalInvoice(null);
        handleCloseDetailModal();
      } catch (error) {
        console.error("Failed to save invoice:", error);
        alert(
          "Failed to save invoice: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
      }
    }
  }, [selectedInvoice, isCreatingInvoice, updateInvoiceMutation, refetch, handleCloseDetailModal]);

  return {
    selectedInvoice,
    isCreatingInvoice,
    unsavedChangesModalOpen,
    hasUnsavedChanges,
    handleOpenInvoice,
    handleCreateInvoice,
    handleCloseDetailModal,
    handleInvoiceChange,
    handleAddLineClick,
    handleLineItemChange,
    handleSaveInvoice,
    handleUnsavedChangesConfirm,
    handleUnsavedChangesCancel,
  };
};
