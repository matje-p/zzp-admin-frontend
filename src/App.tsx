import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/todos" replace />} />
          <Route path="todos" element={<Todos />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="purchase-invoices" element={<PurchaseInvoices />} />
          <Route path="outbound-invoices" element={<SalesInvoices />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="pl" element={<ProfitAndLoss />} />
          <Route path="balance-sheet" element={<BalanceSheet />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
