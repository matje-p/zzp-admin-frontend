import React from "react";

interface DocumentViewerProps {
  invoiceUuid: string;
  filePath: string | null;
  filename: string | null;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  invoiceUuid,
  filePath,
  filename,
}) => {
  console.log("🔍 Checking filePath:", filePath);
  console.log("🔍 Checking filename:", filename);
  console.log("🔍 Invoice UUID:", invoiceUuid);
  console.log("🔍 VITE_API_URL:", import.meta.env.VITE_API_URL);

  const hasDocument = filePath || filename;

  if (hasDocument) {
    const pdfUrl = `${import.meta.env.VITE_API_URL}/api/purchase-invoice/${invoiceUuid}/document`;
    console.log("📄 RENDERING IFRAME with URL:", pdfUrl);

    return (
      <div className="pdf-viewer-container">
        <iframe
          src={pdfUrl}
          className="pdf-viewer"
          title="Invoice PDF"
          onLoad={() => {
            console.log("✅ PDF iframe onLoad fired");
          }}
          onError={() => {
            console.error("❌ PDF iframe onError fired");
          }}
        />
      </div>
    );
  }

  console.log("⚠️ No document file - showing placeholder");

  return (
    <div className="pdf-preview-container">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      <div className="pdf-preview-text">No document uploaded</div>
    </div>
  );
};
