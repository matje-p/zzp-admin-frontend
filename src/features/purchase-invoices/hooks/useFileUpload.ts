import { useState, useRef, useEffect, useCallback } from "react";
import { validateFileType } from "../utils/invoiceHelpers";
import { FILE_TYPE_ERROR_MESSAGE } from "@/constants/invoiceConstants";

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

type UploadStatus = "idle" | "uploading" | "success" | "error";

export const useFileUpload = (refetch: () => void) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup SSE connection on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const connectToSSE = useCallback(
    (processingId: string) => {
      const eventSource = new EventSource(
        `${import.meta.env.VITE_API_URL}/api/upload/stream/${processingId}`
      );

      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        const status: ProcessingStatus = JSON.parse(event.data);
        console.log("Processing status:", status);

        setProcessingStatus(status);
        setUploadMessage(status.message);

        // Handle completion
        if (status.status === "completed") {
          setUploadStatus("success");
          setUploadMessage("Invoice processed successfully!");
          eventSource.close();
          eventSourceRef.current = null;
          setTimeout(() => {
            setProcessingStatus(null);
            refetch();
            setUploadStatus("idle");
          }, 2000);
        }

        // Handle error
        if (status.status === "error") {
          setUploadStatus("error");
          setUploadMessage(status.error || "Processing failed");
          setTimeout(() => {
            eventSource.close();
            eventSourceRef.current = null;
            setProcessingStatus(null);
            setUploadStatus("idle");
          }, 3000);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);

        // If already closed or completed, ignore the error (normal closure)
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log("SSE connection closed normally");
          return;
        }

        // Only handle actual errors
        eventSource.close();
        eventSourceRef.current = null;
        setUploadStatus("error");
        setUploadMessage("Connection error during processing");
        setTimeout(() => {
          setProcessingStatus(null);
          setUploadStatus("idle");
        }, 3000);
      };
    },
    [refetch]
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setUploadStatus("uploading");
      setProcessingStatus(null);
      const fileCount = files.length;
      setUploadMessage(
        `Uploading ${fileCount} invoice${fileCount > 1 ? "s" : ""}...`
      );

      try {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/upload?process=true`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Upload failed");
        }

        const processingId = data.data.processingId;

        if (!processingId) {
          throw new Error("No processing ID returned");
        }

        console.log("Upload successful, connecting to SSE...");

        // Connect to SSE for real-time updates
        connectToSSE(processingId);
      } catch (err) {
        setUploadStatus("error");
        setUploadMessage(
          err instanceof Error ? err.message : "Failed to upload invoices"
        );
        setTimeout(() => setUploadStatus("idle"), 3000);
      }
    },
    [connectToSSE]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);

      if (files.length > 0) {
        const invalidFiles = files.filter((file) => !validateFileType(file));
        if (invalidFiles.length > 0) {
          setUploadStatus("error");
          setUploadMessage(FILE_TYPE_ERROR_MESSAGE);
          setTimeout(() => setUploadStatus("idle"), 3000);
          return;
        }

        await uploadFiles(files);
      }
    },
    [uploadFiles]
  );

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (fileList && fileList.length > 0) {
        const files = Array.from(fileList);

        const invalidFiles = files.filter((file) => !validateFileType(file));
        if (invalidFiles.length > 0) {
          setUploadStatus("error");
          setUploadMessage(FILE_TYPE_ERROR_MESSAGE);
          setTimeout(() => setUploadStatus("idle"), 3000);
          return;
        }

        await uploadFiles(files);
      }
      // Reset the input so the same files can be selected again
      e.target.value = "";
    },
    [uploadFiles]
  );

  return {
    isDragging,
    uploadStatus,
    uploadMessage,
    processingStatus,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
  };
};
