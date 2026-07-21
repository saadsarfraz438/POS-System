import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = typeof window !== 'undefined' && window.localStorage.getItem('lumensoft-auth') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/salespersons" element={<SalespersonsPage />} />
          <Route path="/pos" element={<PosPage />} />
          <Route path="/sales-records" element={<SalesRecordsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
