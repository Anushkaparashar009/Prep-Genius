import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

import { AuthProvider } from './context/AuthContext.jsx';
import { ErrorBoundary } from './components/feedback/ErrorBoundary.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import VerifyOtp from './pages/auth/VerifyOtp.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import LegalPages from './pages/legal/LegalPages.jsx';
import Dashboard from './pages/dashboard/Dashboard.jsx';
import Tutor from './pages/tutor/Tutor.jsx';
import ProblemList from './pages/problems/ProblemList.jsx';
import ResumeReview from './pages/resume/ResumeReview.jsx';
import InterviewPage from './pages/interview/InterviewPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CookieBanner from './components/common/CookieBanner.jsx';

export default function App() {
  const hasAnalyticsConsent = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pg_cookie_consent_v1') || '{}');
      return saved.level === 'all';
    } catch {
      return false;
    }
  })();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Public Legal & Policy Routes */}
            <Route path="/privacy" element={<LegalPages />} />
            <Route path="/terms" element={<LegalPages />} />
            <Route path="/cookies" element={<LegalPages />} />

            {/* Protected Candidate Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/problems"
              element={
                <ProtectedRoute>
                  <ProblemList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor"
              element={
                <ProtectedRoute>
                  <Tutor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tutor/:slug"
              element={
                <ProtectedRoute>
                  <Tutor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/resume"
              element={
                <ProtectedRoute>
                  <ResumeReview />
                </ProtectedRoute>
              }
            />

            <Route
              path="/interview"
              element={
                <ProtectedRoute>
                  <InterviewPage />
                </ProtectedRoute>
              }
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <CookieBanner />
          {hasAnalyticsConsent && <SpeedInsights />}
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}