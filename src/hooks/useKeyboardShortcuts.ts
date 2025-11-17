import { useEffect } from "react";

interface KeyboardShortcutsConfig {
  deleteModalOpen: boolean;
  unsavedChangesModalOpen: boolean;
  selectedInvoice: any | null;
  handleDeleteConfirm: () => void;
  handleDeleteCancel: () => void;
  handleCloseDetailModal: () => void;
  handleUnsavedChangesConfirm: () => void;
  handleUnsavedChangesCancel: () => void;
}

export const useKeyboardShortcuts = ({
  deleteModalOpen,
  unsavedChangesModalOpen,
  selectedInvoice,
  handleDeleteConfirm,
  handleDeleteCancel,
  handleCloseDetailModal,
  handleUnsavedChangesConfirm,
  handleUnsavedChangesCancel,
}: KeyboardShortcutsConfig) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        // Close unsaved changes modal if open
        if (unsavedChangesModalOpen) {
          handleUnsavedChangesCancel();
        }
        // Close delete modal if open
        else if (deleteModalOpen) {
          handleDeleteCancel();
        }
        // Close detail modal if open
        else if (selectedInvoice) {
          handleCloseDetailModal();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (unsavedChangesModalOpen) {
          handleUnsavedChangesConfirm();
        } else if (deleteModalOpen) {
          handleDeleteConfirm();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    deleteModalOpen,
    unsavedChangesModalOpen,
    selectedInvoice,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleCloseDetailModal,
    handleUnsavedChangesConfirm,
    handleUnsavedChangesCancel,
  ]);
};
