import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout';
import { ErrorFallback } from './components/common';
import Transactions from './pages/Transactions';
import PurchaseInvoices from './pages/PurchaseInvoices';
import SalesInvoices from './pages/SalesInvoices';
import Contacts from './pages/Contacts';
import Subscriptions from './pages/Subscriptions';
import Todos from './pages/Todos';
import ProfitAndLoss from './pages/ProfitAndLoss';
import BalanceSheet from './pages/BalanceSheet';
import './App.css';

function App() {
  const handleError = (error: Error, info: { componentStack?: string | null }) => {
    // Log to error reporting service (e.g., Sentry, LogRocket)
    console.error('Error boundary caught an error:', error, info);
  };

  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/todos" replace />} />
          <Route
            path="todos"
            element={
              <ErrorBoundary
                FallbackComponent={(props) => <ErrorFallback {...props} featureName="Todos" />}
                onError={handleError}
                onReset={() => window.location.reload()}
              >
                <Todos />
              </ErrorBoundary>
            }
          />
          <Route
            path="transactions"
            element={
              <ErrorBoundary
                FallbackComponent={(props) => <ErrorFallback {...props} featureName="Transactions" />}
                onError={handleError}
                onReset={() => window.location.reload()}
              >
                <Transactions />
              </ErrorBoundary>
            }
          />
          <Route
            path="purchase-invoices"
            element={
              <ErrorBoundary
                FallbackComponent={(props) => <ErrorFallback {...props} featureName="Purchase Invoices" />}
                onError={handleError}
                onReset={() => window.location.reload()}
              >
                <PurchaseInvoices />
              </ErrorBoundary>
            }
          />
          <Route
            path="outbound-invoices"
            element={
              <ErrorBoundary
                FallbackComponent={(props) => <ErrorFallback {...props} featureName="Sales Invoices" />}
                onError={handleError}
                onReset={() => window.location.reload()}
              >
                <SalesInvoices />
              </ErrorBoundary>
            }
          />
          <Route
            path="contacts"
            element={
              <ErrorBoundary
                FallbackComponent={(props) => <ErrorFallback {...props} featureName="Contacts" />}
                onError={handleError}
                onReset={() => window.location.reload()}
              >
                <Contacts />
              </ErrorBoundary>
            }
          />
          <Route
            path="subscriptions"
            element={
              <ErrorBoundary
                FallbackComponent={(props) => <ErrorFallback {...props} featureName="Subscriptions" />}
                onError={handleError}
                onReset={() => window.location.reload()}
              >
                <Subscriptions />
              </ErrorBoundary>
            }
          />
          <Route
            path="pl"
            element={
              <ErrorBoundary
                FallbackComponent={(props) => <ErrorFallback {...props} featureName="Profit & Loss" />}
                onError={handleError}
                onReset={() => window.location.reload()}
              >
                <ProfitAndLoss />
              </ErrorBoundary>
            }
          />
          <Route
            path="balance-sheet"
            element={
              <ErrorBoundary
                FallbackComponent={(props) => <ErrorFallback {...props} featureName="Balance Sheet" />}
                onError={handleError}
                onReset={() => window.location.reload()}
              >
                <BalanceSheet />
              </ErrorBoundary>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
