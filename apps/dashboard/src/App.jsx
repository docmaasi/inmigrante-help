import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import { ProtectedRoute } from '@/components/auth';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Loader2 } from 'lucide-react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

const AdminDashboard = lazy(() =>
  import('@/pages/admin/admin-dashboard').then((module) => ({
    default: module.AdminDashboard,
  }))
);

const UserManagement = lazy(() =>
  import('@/pages/admin/user-management').then((module) => ({
    default: module.UserManagement,
  }))
);

const SystemSettings = lazy(() =>
  import('@/pages/admin/system-settings').then((module) => ({
    default: module.SystemSettings,
  }))
);

const AdminActivity = lazy(() =>
  import('@/pages/admin/admin-activity').then((module) => ({
    default: module.AdminActivity,
  }))
);

const AdminSubscriptions = lazy(() =>
  import('@/pages/admin/admin-subscriptions').then((module) => ({
    default: module.AdminSubscriptions,
  }))
);

const Diagnostics = lazy(() =>
  import('@/pages/Diagnostics').then((module) => ({
    default: module.default,
  }))
);

const AdminExport = lazy(() =>
  import('@/pages/admin/admin-export').then((module) => ({
    default: module.AdminExport,
  }))
);

function AdminLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );
}

const { Pages, Layout, MainPage } = pagesConfig;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const ProtectedRoutes = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName="Dashboard">
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole={['admin', 'super_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route
          path="users"
          element={
            <ProtectedRoute requiredRole="super_admin">
              <Suspense fallback={<AdminLoadingFallback />}>
                <UserManagement />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute requiredRole="super_admin">
              <Suspense fallback={<AdminLoadingFallback />}>
                <SystemSettings />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="activity"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminActivity />
            </Suspense>
          }
        />
        <Route
          path="subscriptions"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminSubscriptions />
            </Suspense>
          }
        />
        <Route
          path="diagnostics"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <Diagnostics />
            </Suspense>
          }
        />
        <Route
          path="export"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminExport />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

const PublicRoute = ({ children }) => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <PublicRoute>
          <ForgotPassword />
        </PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute>
          <ResetPassword />
        </PublicRoute>
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <NavigationTracker />
            <AppRoutes />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
