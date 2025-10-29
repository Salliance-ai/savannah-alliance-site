import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import TrustDashboard from './pages/TrustDashboard';
import EmotionAnalytics from './pages/EmotionAnalytics';
import TherapistFramework from './pages/TherapistFramework';
import UserProfiles from './pages/UserProfiles';
import Settings from './pages/Settings';
import Demo from './pages/Demo';

// Styles
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Navbar />
          
          <div className="flex">
            <Sidebar />
            
            <main className="flex-1 ml-64 p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto"
              >
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/trust-dashboard" element={<TrustDashboard />} />
                  <Route path="/emotion-analytics" element={<EmotionAnalytics />} />
                  <Route path="/therapist-framework" element={<TherapistFramework />} />
                  <Route path="/user-profiles" element={<UserProfiles />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/demo" element={<Demo />} />
                </Routes>
              </motion.div>
            </main>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;