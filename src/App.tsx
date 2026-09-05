import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicHomePage } from './pages/PublicHomePage';
import { StaffLoginPage } from './pages/StaffLoginPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { StaffStudentsPage } from './pages/StaffStudentsPage';
import { StaffStudentFormPage } from './pages/StaffStudentFormPage';
import { StaffStudentDetailPage } from './pages/StaffStudentDetailPage';
import { StaffAttendancePage } from './pages/StaffAttendancePage';
import { StaffFeesPage } from './pages/StaffFeesPage';
import { StaffReportsPage } from './pages/StaffReportsPage';
import { StaffSettingsPage } from './pages/StaffSettingsPage';
import { ProtectedLayout } from './layouts/ProtectedLayout';
import { StaffPortalLayout } from './layouts/StaffPortalLayout';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Honey Bees Play School Website */}
        <Route path="/" element={<PublicHomePage />} />

        {/* Private Honey Bees Tuition Center Staff Login */}
        <Route path="/staff/login" element={<StaffLoginPage />} />

        {/* Protected Staff Portal Routes */}
        <Route path="/staff" element={<ProtectedLayout />}>
          <Route element={<StaffPortalLayout />}>
            <Route path="dashboard" element={<StaffDashboardPage />} />
            <Route path="students" element={<StaffStudentsPage />} />
            <Route path="students/new" element={<StaffStudentFormPage />} />
            <Route path="students/:id" element={<StaffStudentDetailPage />} />
            
            {/* Functional Staff Portal Modules */}
            <Route path="attendance" element={<StaffAttendancePage />} />
            <Route path="fees" element={<StaffFeesPage />} />
            <Route path="reports" element={<StaffReportsPage />} />
            <Route path="settings" element={<StaffSettingsPage />} />

            <Route index element={<Navigate to="/staff/dashboard" replace />} />
          </Route>
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
