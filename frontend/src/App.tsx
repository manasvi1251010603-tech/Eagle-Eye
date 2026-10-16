import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { InspectionProvider, useInspectionSession } from './context/InspectionContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';

import { DashboardPage } from './pages/DashboardPage';
import { NewInspectionPage } from './pages/NewInspectionPage';
import { ReferenceAlignmentPage } from './pages/ReferenceAlignmentPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ResultsPage } from './pages/ResultsPage';
import { RepairPage } from './pages/RepairPage';
import { ReinspectionPage } from './pages/ReinspectionPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';

const AppLayout: React.FC = () => {
  const location = useLocation();

  const getPageHeader = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Inspection Command Center',
          subtitle: 'Real-time overview of electrical control cabinet quality testing.'
        };
      case '/new-inspection':
      case '/new':
        return {
          title: 'New Inspection Workspace',
          subtitle: 'Upload cabinet photographs, GA blueprints (PDF), and Excel wiring schedules.'
        };
      case '/reference-alignment':
      case '/alignment':
        return {
          title: 'Reference & CAD Alignment Workspace',
          subtitle: 'Extract and edit engineering BOM & wiring tables, and calibrate planar perspective homography.'
        };
      case '/processing':
        return {
          title: 'AI Inspection Processing Pipeline',
          subtitle: 'Automated 10-stage computer vision and comparison execution.'
        };
      case '/results':
        return {
          title: 'Quality Control Findings & Evidence',
          subtitle: 'Interactive bounding box markup, severity evaluation, and reviewer overrides.'
        };
      case '/repair':
        return {
          title: 'Guided Repair Assistant',
          subtitle: 'Standard operating correction checklists for identified defects.'
        };
      case '/reinspection':
        return {
          title: 'Reinspection & Rework Verification',
          subtitle: 'Before-and-after image diff and session closure gatekeeper.'
        };
      case '/history':
        return {
          title: 'Inspection Session Archive',
          subtitle: 'Searchable SQLite database of historical inspection records and audits.'
        };
      case '/reports-analytics':
      case '/reports':
      case '/analytics':
        return {
          title: 'QC Reports & Defect Analytics',
          subtitle: 'Official PDF/Excel certificate exports and factory-wide defect intelligence.'
        };
      default:
        return {
          title: 'EAGLE EYE Platform',
          subtitle: 'Industrial Control Cabinet Inspection'
        };
    }
  };

  const headerInfo = getPageHeader();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-charcoal text-gray-100 font-sans">
      {/* Persistent Left Sidebar with exactly 8 items */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
        />

        <main className="flex-1 overflow-y-auto bg-charcoal bg-tech-grid">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/new-inspection" element={<NewInspectionPage />} />
            <Route path="/new" element={<Navigate to="/new-inspection" replace />} />
            <Route path="/reference-alignment" element={<ReferenceAlignmentPage />} />
            <Route path="/alignment" element={<Navigate to="/reference-alignment" replace />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/repair" element={<RepairPage />} />
            <Route path="/reinspection" element={<ReinspectionPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/reports-analytics" element={<ReportsAnalyticsPage />} />
            <Route path="/reports" element={<Navigate to="/reports-analytics" replace />} />
            <Route path="/analytics" element={<Navigate to="/reports-analytics" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <InspectionProvider>
      <Router>
        <AppLayout />
      </Router>
    </InspectionProvider>
  );
};

export default App;
