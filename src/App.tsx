import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import SalespersonsPage from './pages/SalespersonsPage.jsx';
import PosPage from './pages/PosPage.jsx';
import SalesRecordsPage from './pages/SalesRecordsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { getDefaultPathForRole, getStoredSession } from './lib/auth.js';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles: Array<'admin' | 'salesperson'> }) {
  const session = getStoredSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(session.role)) {
    return <Navigate to={getDefaultPathForRole(session.role)} replace />;
  }

  return children;
}

function HomeRedirect() {
  const session = getStoredSession();
  return <Navigate to={session ? getDefaultPathForRole(session.role) : '/login'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="salespersons" element={<SalespersonsPage />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="sales-records" element={<SalesRecordsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/sales" element={<ProtectedRoute roles={['salesperson']}><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="pos" replace />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
