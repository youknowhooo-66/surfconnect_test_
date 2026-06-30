import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import LoginRegister from './pages/LoginRegister';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';

/**
 * Root component that redirects authenticated users to their corresponding dashboard
 * or guides unauthenticated users to the login screen.
 */
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 bg-gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400 font-medium">Carregando SurfConnect...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'ADMIN':
      return <Navigate to="/admin" replace />;
    case 'INSTRUCTOR':
      return <Navigate to="/instructor" replace />;
    case 'STUDENT':
    default:
      return <Navigate to="/student" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<LoginRegister />} />

          {/* Protected Role-Based Dashboards */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor" 
            element={
              <ProtectedRoute allowedRoles={['INSTRUCTOR']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Root Redirect Routing */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Fallback Catch-All Routing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
