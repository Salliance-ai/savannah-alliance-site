import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ClinicalOps from './pages/ClinicalOps';
import CareNav from './pages/CareNav';
import Patient360 from './pages/Patient360';
import MarketOps from './pages/MarketOps';
import RevenueOps from './pages/RevenueOps';
import Intelligence from './pages/Intelligence';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clinicalops" element={<ClinicalOps />} />
          <Route path="/carenav" element={<CareNav />} />
          <Route path="/patient360" element={<Patient360 />} />
          <Route path="/marketops" element={<MarketOps />} />
          <Route path="/revenueops" element={<RevenueOps />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
