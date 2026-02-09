import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FacultyManagement from "./pages/FacultyManagement";
import Departments from "./pages/Departments";
import Courses from "./pages/Courses";
import FeedbackAnalysis from "./pages/FeedbackAnalysis";
import Reports from "./pages/Reports";
import SubmitFeedback from "./pages/SubmitFeedback";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirect authenticated users away from auth pages
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <AuthRedirect>
            <Login />
          </AuthRedirect>
        }
      />
      <Route
        path="/register"
        element={
          <AuthRedirect>
            <Register />
          </AuthRedirect>
        }
      />
      <Route path="/feedback/submit" element={<SubmitFeedback />} />

      {/* Protected routes - All authenticated users */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Admin-only routes */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FacultyManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Departments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/feedback"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FeedbackAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* Faculty-specific routes */}
      <Route
        path="/my-courses"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-feedback"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-metrics"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
