import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from './store/authContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LandingLayout from './layouts/LandingLayout';
import LoadingSkeleton from './components/LoadingSkeleton';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Gyms = lazy(() => import('./pages/Gyms'));
const Coaches = lazy(() => import('./pages/Coaches'));
const Facilities = lazy(() => import('./pages/Facilities'));
const Classes = lazy(() => import('./pages/Classes'));
const Schedules = lazy(() => import('./pages/Schedules'));
const Members = lazy(() => import('./pages/Members'));
const MemberDetail = lazy(() => import('./pages/MemberDetail'));
const AttendanceCheckIn = lazy(() => import('./pages/AttendanceCheckIn'));
const AttendanceLogs = lazy(() => import('./pages/AttendanceLogs'));
const MembershipPlans = lazy(() => import('./pages/MembershipPlans'));
const Promotions = lazy(() => import('./pages/Promotions'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="dark bg-gray-950 min-h-screen flex items-center justify-center">
                <LoadingSkeleton rows={4} columns={3} />
              </div>
            }
          >
            <Routes>
              {/* Public Landing Page */}
              <Route element={<LandingLayout />}>
                <Route path="/landing" element={<LandingPage />} />
              </Route>

              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
              </Route>

              {/* Protected Dashboard Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="gyms" element={<Gyms />} />
                <Route path="coaches" element={<Coaches />} />
                <Route path="facilities" element={<Facilities />} />
                <Route path="classes" element={<Classes />} />
                <Route path="schedules" element={<Schedules />} />
                <Route path="members" element={<Members />} />
                <Route path="members/:id" element={<MemberDetail />} />
                <Route path="attendance/check-in" element={<AttendanceCheckIn />} />
                <Route path="attendance/logs" element={<AttendanceLogs />} />
                <Route path="membership-plans" element={<MembershipPlans />} />
                <Route path="promotions" element={<Promotions />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
      <Toaster position="top-right" theme="dark" richColors />
    </QueryClientProvider>
  );
}

export default App;
