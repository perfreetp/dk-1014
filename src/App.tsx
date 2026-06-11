import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TasksPage from './pages/TasksPage';
import TaskDetailPage from './pages/TaskDetailPage';
import MerchantsPage from './pages/MerchantsPage';
import MerchantDetailPage from './pages/MerchantDetailPage';
import VerifyPage from './pages/VerifyPage';
import DiagnosisPage from './pages/DiagnosisPage';
import CommunicationPage from './pages/CommunicationPage';
import DisposalPage from './pages/DisposalPage';
import StatisticsPage from './pages/StatisticsPage';
import ReviewCalendarPage from './pages/ReviewCalendarPage';
import SummaryPage from './pages/SummaryPage';
import DailySummaryPage from './pages/DailySummaryPage';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/:id" element={<TaskDetailPage />} />
          <Route path="/merchants" element={<MerchantsPage />} />
          <Route path="/merchants/:id" element={<MerchantDetailPage />} />
          <Route path="/merchants/:id/verify" element={<VerifyPage />} />
          <Route path="/merchants/:id/diagnosis" element={<DiagnosisPage />} />
          <Route path="/merchants/:id/communication" element={<CommunicationPage />} />
          <Route path="/merchants/:id/disposal" element={<DisposalPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/review-calendar" element={<ReviewCalendarPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/daily-summary" element={<DailySummaryPage />} />
          <Route path="/" element={<TasksPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}