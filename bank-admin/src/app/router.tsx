import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ClientsPage } from '../pages/ClientsPage';
import { MerchantsPage } from '../pages/MerchantsPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { AuditPage } from '../pages/AuditPage';
import { HostedPaymentPage } from '../pages/HostedPaymentPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/pay/:paymentRef"
        element={
          <PublicLayout>
            <HostedPaymentPage />
          </PublicLayout>
        }
      />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/merchants" element={<MerchantsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/audit" element={<AuditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
