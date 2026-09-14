import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TakeTest from './pages/TakeTest';
import ReviewTest from './pages/ReviewTest';
import Spinner from './components/Spinner';

const AppContent: React.FC = () => {
  const { user, firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" className="text-brand-600" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Login />;
  }

  if (!user || !user.role) {
    return <RoleSelection />;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          user.role === 'teacher' ? <Navigate to="/teacher" replace /> : <Navigate to="/student" replace />
        } 
      />
      <Route 
        path="/teacher/*" 
        element={
          user.role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/student/*" 
        element={
          user.role === 'student' ? <StudentDashboard /> : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/test/:id" 
        element={
          user.role === 'student' ? <TakeTest /> : <Navigate to="/" replace />
        } 
      />
      <Route 
        path="/review/:id" 
        element={
          <ReviewTest />
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
