/**
 * Constants for invoice processing
 */

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

export const FILE_TYPE_ERROR_MESSAGE = "Please upload only PDF, PNG, or JPG files";

export const DEFAULT_EXPENSE_ACCOUNT_UUID = "4e217aca-210f-401a-9407-400c16f9917b";

export const DEFAULT_VAT_PERCENTAGE = 21;

export const DEFAULT_CURRENCY = "EUR";

export const UPLOAD_STATUS = {
  IDLE: "idle" as const,
  UPLOADING: "uploading" as const,
  SUCCESS: "success" as const,
  ERROR: "error" as const,
};

export const PROCESSING_STATUS = {
  PENDING: "pending" as const,
  IN_PROGRESS: "in_progress" as const,
  COMPLETED: "completed" as const,
  ERROR: "error" as const,
};
