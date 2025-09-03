import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate, useLocation } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import Navbar from "components/Navbar";
import ProtectedRoute from "components/ProtectedRoute";
import NotFound from "pages/NotFound";
import MessageStatusTracking from './pages/message-status-tracking';
import ModeratorAssignmentDashboard from './pages/moderator-assignment-dashboard';
import CampaignUploadConfiguration from './pages/campaign-upload-configuration';
import AuthenticationRoleAssignment from './pages/authentication-role-assignment';
import RealTimeProgressMonitoring from './pages/real-time-progress-monitoring';
import AnalyticsReportingDashboard from './pages/analytics-reporting-dashboard';
import ModeratorDashboard from './pages/moderator-dashboard';
import AdminUpload from './pages/admin-upload';
import AdminAssign from './pages/admin-assign';
import AdminDashboard from './pages/admin-dashboard';
import BirthdayDashboard from './pages/birthday-dashboard';
import Login from './pages/login';
import { useAuth } from './contexts/AuthContext';

const AppContent = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const showNavbar = isAuthenticated && location.pathname !== '/login';

  return (
    <div className="min-h-screen bg-background">
      {showNavbar && <Navbar />}
      <ScrollToTop />
      <RouterRoutes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/message-status-tracking" element={<MessageStatusTracking />} />
        <Route path="/moderator-assignment-dashboard" element={<ModeratorAssignmentDashboard />} />
        <Route path="/campaign-upload-configuration" element={<CampaignUploadConfiguration />} />
        <Route path="/authentication-role-assignment" element={<AuthenticationRoleAssignment />} />
        <Route path="/real-time-progress-monitoring" element={<RealTimeProgressMonitoring />} />
        <Route path="/analytics-reporting-dashboard" element={<AnalyticsReportingDashboard />} />
        <Route path="/moderator-dashboard" element={
          <ProtectedRoute>
            <ModeratorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin-upload" element={
          <ProtectedRoute adminOnly={true}>
            <AdminUpload />
          </ProtectedRoute>
        } />
        <Route path="/admin-assign" element={
          <ProtectedRoute adminOnly={true}>
            <AdminAssign />
          </ProtectedRoute>
        } />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/birthday-dashboard" element={
          <ProtectedRoute adminOnly={true}>
            <BirthdayDashboard />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
    </div>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
