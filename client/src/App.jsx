import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import AboutPage from './pages/public/AboutPage';
import CoursesPage from './pages/public/CoursesPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import CourseRecommendations from './pages/student/CourseRecommendations';
import ApplicationWizard from './pages/student/ApplicationWizard';
import ApplicationDetails from './pages/student/ApplicationDetails';
import DocumentLocker from './pages/student/DocumentLocker';
import AdmissionSimulator from './pages/student/AdmissionSimulator';
import ScholarshipMatcher from './pages/student/ScholarshipMatcher';
import StudentNotifications from './pages/student/StudentNotifications';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApplications from './pages/admin/AdminApplications';
import AdminApplicationReview from './pages/admin/AdminApplicationReview';
import AdminCourses from './pages/admin/AdminCourses';
import AdminScholarships from './pages/admin/AdminScholarships';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminFairnessAudit from './pages/admin/AdminFairnessAudit';
import AdminPolicySimulator from './pages/admin/AdminPolicySimulator';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Student Portal Routes */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="recommendations" element={<CourseRecommendations />} />
        <Route path="apply" element={<ApplicationWizard />} />
        <Route path="application/:id" element={<ApplicationDetails />} />
        <Route path="documents" element={<DocumentLocker />} />
        <Route path="simulator" element={<AdmissionSimulator />} />
        <Route path="scholarships" element={<ScholarshipMatcher />} />
        <Route path="notifications" element={<StudentNotifications />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="applications/:id" element={<AdminApplicationReview />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="scholarships" element={<AdminScholarships />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="fairness" element={<AdminFairnessAudit />} />
        <Route path="policy-simulator" element={<AdminPolicySimulator />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
