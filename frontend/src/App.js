import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useAuth } from './context/AuthContext';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentProfile from './pages/student/Profile';
import JobsList from './pages/student/JobsList';
import JobDetails from './pages/student/JobDetails';
import MyApplications from './pages/student/MyApplications';
import AIRecommendations from './pages/student/AIRecommendations';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterJobsList from './pages/recruiter/JobsList';
import JobForm from './pages/recruiter/JobForm';
import RecruiterJobDetails from './pages/recruiter/JobDetails';
import ApplicationsList from './pages/recruiter/ApplicationsList';
import ApplicationDetails from './pages/recruiter/ApplicationDetails';

// Common Pages
import HomePage from './pages/common/HomePage';
import NotFound from './pages/common/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <>
      <Navbar />
      <Container className="container">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/profile" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/jobs" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <JobsList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/jobs/:id" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <JobDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/applications" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <MyApplications />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/recommendations" 
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <AIRecommendations />
              </ProtectedRoute>
            } 
          />
          
          {/* Recruiter Routes */}
          <Route 
            path="/recruiter/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recruiter/jobs" 
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterJobsList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recruiter/jobs/create" 
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <JobForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recruiter/jobs/edit/:jobId" 
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <JobForm />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recruiter/jobs/:jobId" 
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterJobDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recruiter/applications" 
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <ApplicationsList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recruiter/applications/:applicationId" 
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <ApplicationDetails />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
      <Footer />
    </>
  );
}

export default App;
