
import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HomePage } from './pages/HomePage';
import { SalonDetailPage } from './pages/SalonDetailPage';
import { StaffSelection } from './pages/booking/StaffSelection';
import { TimeSelection } from './pages/booking/TimeSelection';
import { Confirmation } from './pages/booking/Confirmation';
import { Login } from './pages/auth/Login';

// Admin Pages
import { Dashboard } from './pages/admin/Dashboard';
import { SalonManager } from './pages/admin/SalonManager';
import { SalonTypeManager } from './pages/admin/SalonTypeManager';
import { ServiceCategoryManager } from './pages/admin/ServiceCategoryManager';
import { ServiceManager } from './pages/admin/ServiceManager';
import { Settings } from './pages/admin/Settings';
import { IYSLogs } from './pages/admin/IYSLogs';

// Helper to scroll to top on route change
const ScrollToTopHelper = () => {
    const { pathname } = useLocation();
    
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    
    return null;
};

// Protected Route Component
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();
    
    if (loading) return <div>Yükleniyor...</div>;
    if (!user || !isAdmin) return <Navigate to="/login" replace />;

    return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <HashRouter>
          <ScrollToTopHelper />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/salon/:id" element={<SalonDetailPage />} />
            <Route path="/booking/:id/staff" element={<StaffSelection />} />
            <Route path="/booking/:id/time" element={<TimeSelection />} />
            <Route path="/booking/:id/confirm" element={<Confirmation />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/salons" element={<ProtectedAdminRoute><SalonManager /></ProtectedAdminRoute>} />
            <Route path="/admin/types" element={<ProtectedAdminRoute><SalonTypeManager /></ProtectedAdminRoute>} />
            <Route path="/admin/service-types" element={<ProtectedAdminRoute><ServiceCategoryManager /></ProtectedAdminRoute>} />
            <Route path="/admin/services" element={<ProtectedAdminRoute><ServiceManager /></ProtectedAdminRoute>} />
            <Route path="/admin/iys-logs" element={<ProtectedAdminRoute><IYSLogs /></ProtectedAdminRoute>} />
            <Route path="/admin/settings" element={<ProtectedAdminRoute><Settings /></ProtectedAdminRoute>} />
            
            {/* Placeholders for other admin routes for now */}
            <Route path="/admin/*" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
          </Routes>
        </HashRouter>
    </AuthProvider>
  );
};

export default App;
