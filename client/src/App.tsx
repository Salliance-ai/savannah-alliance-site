import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import Dashboard from './pages/Dashboard/Dashboard';
import PatientList from './pages/Patients/PatientList';
import PatientProfile from './pages/Patients/PatientProfile';
import SchedulingDashboard from './pages/Scheduling/SchedulingDashboard';
import ClinicalDashboard from './pages/Clinical/ClinicalDashboard';
import RevenueDashboard from './pages/Revenue/RevenueDashboard';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import MarketingDashboard from './pages/Marketing/MarketingDashboard';
import SettingsPage from './pages/Settings/SettingsPage';
import LoadingScreen from './components/Common/LoadingScreen';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          }
        />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            user ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Patient Management */}
                  <Route path="/patients" element={<PatientList />} />
                  <Route path="/patients/:patientId" element={<PatientProfile />} />
                  
                  {/* Clinical Operations */}
                  <Route path="/clinical" element={<ClinicalDashboard />} />
                  
                  {/* Scheduling */}
                  <Route path="/scheduling" element={<SchedulingDashboard />} />
                  
                  {/* Revenue Operations */}
                  <Route path="/revenue" element={<RevenueDashboard />} />
                  
                  {/* Marketing & CRM */}
                  <Route path="/marketing" element={<MarketingDashboard />} />
                  
                  {/* Analytics */}
                  <Route path="/analytics" element={<AnalyticsDashboard />} />
                  
                  {/* Settings */}
                  <Route path="/settings" element={<SettingsPage />} />
                  
                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Box>
  );
}

export default App;