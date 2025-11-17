import React, { useRef } from "react";

interface ProcessingStatus {
  processingId: string;
  step: number;
  totalSteps: number;
  stepName: string;
  message: string;
  status: "pending" | "in_progress" | "completed" | "error";
  data?: any;
  error?: string;
}

interface FileUploadDropzoneProps {
  isDragging: boolean;
  uploadStatus: "idle" | "uploading" | "success" | "error";
  uploadMessage: string;
  processingStatus: ProcessingStatus | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  isDragging,
  uploadStatus,
  uploadMessage,
  processingStatus,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInputChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInputChange}
        accept="application/pdf,image/png,image/jpeg,image/jpg"
        multiple
        style={{ display: "none" }}
      />

      <div
        className={`invoice-dropzone ${isDragging ? "dragging" : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
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

      {uploadStatus !== "idle" && uploadStatus !== "uploading" && (
        <div className={`upload-message upload-${uploadStatus}`}>
          {uploadMessage}
        </div>
      )}

      {processingStatus && uploadStatus === "uploading" && (
        <div className="processing-status-container">
          <div className="processing-spinner"></div>
          <div className="processing-step-message-current">
            {processingStatus.message}
          </div>
        </div>
      )}
    </>
  );
};
