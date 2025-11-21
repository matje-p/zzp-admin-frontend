import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent } from "./card";

export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  featureName?: string;
}

export const ErrorFallback = ({
  error,
  resetErrorBoundary,
  featureName
}: ErrorFallbackProps) => {
  return (
    <div className="error-fallback-container" style={{ padding: "2rem" }}>
      <Card>
        <CardHeader>
          <CardTitle>
            {featureName ? `Error in ${featureName}` : "Something went wrong"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ marginBottom: "0.5rem" }}>
              An unexpected error occurred. Please try again or contact support if the problem persists.
            </p>
            {error?.message && (
              <details style={{ marginTop: "1rem" }}>
                <summary style={{ cursor: "pointer", fontWeight: 500 }}>
                  Error details
                </summary>
                <pre
                  style={{
                    marginTop: "0.5rem",
                    padding: "0.75rem",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                    overflow: "auto",
                    fontSize: "0.875rem",
                  }}
                >
                  {error.message}
                </pre>
              </details>
            )}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button onClick={resetErrorBoundary}>
              Try again
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.href = "/"}
            >
              Go to home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
