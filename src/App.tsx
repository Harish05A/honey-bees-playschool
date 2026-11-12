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
import { StaffSchoolStudentsPage } from './pages/StaffSchoolStudentsPage';
import { StaffSchoolStudentFormPage } from './pages/StaffSchoolStudentFormPage';
import { StaffSchoolStudentDetailPage } from './pages/StaffSchoolStudentDetailPage';
import { StaffTeachersPage } from './pages/StaffTeachersPage';
import { StaffTeacherFormPage } from './pages/StaffTeacherFormPage';
import { StaffTeacherDetailPage } from './pages/StaffTeacherDetailPage';
import { SchoolDashboardPage } from './pages/SchoolDashboardPage';
import { SchoolAttendancePage } from './pages/SchoolAttendancePage';
import { SchoolFeesPage } from './pages/SchoolFeesPage';
import { SchoolSalariesPage } from './pages/SchoolSalariesPage';
import { SchoolMessagingPage } from './pages/SchoolMessagingPage';
import { ProtectedLayout } from './layouts/ProtectedLayout';
import { StaffPortalLayout } from './layouts/StaffPortalLayout';
import { SchoolPortalLayout } from './layouts/SchoolPortalLayout';

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

            {/* Play School Redirects */}
            <Route path="school-students" element={<Navigate to="/school/students" replace />} />
            <Route path="teachers" element={<Navigate to="/school/teachers" replace />} />

            <Route index element={<Navigate to="/staff/dashboard" replace />} />
          </Route>
        </Route>

        {/* Protected Play School Portal Routes */}
        <Route path="/school" element={<ProtectedLayout />}>
          <Route element={<SchoolPortalLayout />}>
            <Route path="dashboard" element={<SchoolDashboardPage />} />
            <Route path="students" element={<StaffSchoolStudentsPage />} />
            <Route path="students/new" element={<StaffSchoolStudentFormPage />} />
            <Route path="students/:id" element={<StaffSchoolStudentDetailPage />} />
            <Route path="attendance" element={<SchoolAttendancePage />} />
            <Route path="fees" element={<SchoolFeesPage />} />
            <Route path="teachers" element={<StaffTeachersPage />} />
            <Route path="teachers/new" element={<StaffTeacherFormPage />} />
            <Route path="teachers/:id" element={<StaffTeacherDetailPage />} />
            <Route path="salaries" element={<SchoolSalariesPage />} />
            <Route path="messaging" element={<SchoolMessagingPage />} />
            <Route index element={<Navigate to="/school/dashboard" replace />} />
          </Route>
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
