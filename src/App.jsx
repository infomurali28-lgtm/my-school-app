import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthContext';
import { ROLES, normalizeRole } from './auth/roles';
import { getRoleNav } from './components/layout/roleNavConfig';
import { LoginPage } from './modules/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import { seedDatabase } from './database/seed/seeder';
import { AccessDenied } from './components/common/AccessDenied';

// Dashboards
import { SuperAdminDashboard } from './modules/dashboard/SuperAdminDashboard';
import { SchoolAdminDashboard } from './modules/dashboard/SchoolAdminDashboard';
import { TeacherDashboard } from './modules/dashboard/TeacherDashboard';
import { AccountantDashboard } from './modules/dashboard/AccountantDashboard';
import { ParentDashboard } from './modules/dashboard/ParentDashboard';
import { StudentDashboard } from './modules/dashboard/StudentDashboard';

// Existing School Operations Modules
import { SchoolSetup } from './modules/schoolSetup/SchoolSetup';
import { StudentList } from './modules/students/StudentList';
import { ParentList } from './modules/parents/ParentList';
import { TeacherList } from './modules/teachers/TeacherList';
import { StaffList } from './modules/staff/StaffList';
import { StudentAttendance } from './modules/attendance/StudentAttendance';
import { TimetableManager } from './modules/academics/TimetableManager';
import { ExaminationManager } from './modules/examinations/ExaminationManager';
import { FeeManager } from './modules/fees/FeeManager';
import { AccountingManager } from './modules/accounting/AccountingManager';
import { CommunicationManager } from './modules/communication/CommunicationManager';
import { CertificateManager } from './modules/certificates/CertificateManager';
import { ReportsCenter } from './modules/reports/ReportsCenter';
import { BackupRestore } from './modules/backup/BackupRestore';
import { SettingsManager } from './modules/settings/SettingsManager';
import { AuditLogs } from './modules/settings/AuditLogs';

// Role-Specific Views
import {
  TeacherProfileView,
  TeacherClassesView,
  TeacherStudentsView,
  TeacherAssignmentsView,
  TeacherMarksEntryView
} from './modules/roleViews/TeacherViews';

import {
  FeeStructuresView,
  FeeCollectionView,
  PaymentHistoryView,
  PendingPaymentsView,
  ReceiptsView,
  FinancialReportsView
} from './modules/roleViews/AccountantViews';

import {
  ParentChildrenView,
  ParentAttendanceView,
  ParentExamResultsView,
  ParentFeeDetailsView,
  ParentReceiptsView,
  ParentHomeworkView,
  ParentTimetableView
} from './modules/roleViews/ParentViews';

import {
  StudentProfileView,
  StudentTimetableView,
  StudentAttendanceView,
  StudentExamResultsView,
  StudentAssignmentsView
} from './modules/roleViews/StudentViews';

export function App() {
  const { user } = useAuth();
  const [currentModule, setCurrentModule] = useState('dashboard');
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    // Seed / verify database on startup
    seedDatabase().then(() => {
      setDbReady(true);
    });
  }, []);

  // When user changes (login or logout), reset module to dashboard
  useEffect(() => {
    setCurrentModule('dashboard');
  }, [user?.id, user?.role]);

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold tracking-wider text-slate-300">Initializing The School ERP Database...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const role = normalizeRole(user.role);
  const permittedNavItems = getRoleNav(role);
  const permittedModuleIds = new Set(permittedNavItems.map(item => item.id));

  // Render role-specific dashboard
  const renderDashboardByRole = () => {
    switch (role) {
      case ROLES.SUPER_ADMIN:
        return <SuperAdminDashboard onNavigate={setCurrentModule} />;
      case ROLES.SCHOOL_ADMIN:
        return <SchoolAdminDashboard onNavigate={setCurrentModule} />;
      case ROLES.TEACHER:
        return <TeacherDashboard onNavigate={setCurrentModule} />;
      case ROLES.ACCOUNTANT:
        return <AccountantDashboard onNavigate={setCurrentModule} />;
      case ROLES.PARENT:
        return <ParentDashboard onNavigate={setCurrentModule} />;
      case ROLES.STUDENT:
        return <StudentDashboard onNavigate={setCurrentModule} />;
      default:
        return <SchoolAdminDashboard onNavigate={setCurrentModule} />;
    }
  };

  // Render module with strict RBAC permission check
  const renderModule = () => {
    if (currentModule === 'dashboard') {
      return renderDashboardByRole();
    }

    // Security Gate: Ensure the active module is allowed for the user's role
    if (!permittedModuleIds.has(currentModule)) {
      return (
        <AccessDenied
          moduleName={currentModule}
          role={role}
          onBackToDashboard={() => setCurrentModule('dashboard')}
        />
      );
    }

    // Role-specific module routing
    switch (role) {
      case ROLES.TEACHER:
        switch (currentModule) {
          case 'myProfile':
            return <TeacherProfileView user={user} />;
          case 'myClasses':
            return <TeacherClassesView onNavigate={setCurrentModule} />;
          case 'myStudents':
            return <TeacherStudentsView />;
          case 'attendance':
            return <StudentAttendance />;
          case 'timetable':
            return <TimetableManager />;
          case 'assignments':
            return <TeacherAssignmentsView />;
          case 'examinations':
            return <ExaminationManager />;
          case 'marksEntry':
            return <TeacherMarksEntryView />;
          case 'studentPerformance':
            return <ReportsCenter />;
          case 'communication':
            return <CommunicationManager />;
          default:
            return <TeacherDashboard onNavigate={setCurrentModule} />;
        }

      case ROLES.ACCOUNTANT:
        switch (currentModule) {
          case 'myProfile':
            return <TeacherProfileView user={user} />;
          case 'fees':
            return <FeeManager />;
          case 'feeStructures':
            return <FeeStructuresView />;
          case 'feeCollection':
            return <FeeCollectionView />;
          case 'paymentHistory':
            return <PaymentHistoryView />;
          case 'pendingPayments':
            return <PendingPaymentsView />;
          case 'receipts':
            return <ReceiptsView />;
          case 'income':
          case 'expenses':
          case 'accounting':
            return <AccountingManager />;
          case 'financialReports':
            return <FinancialReportsView />;
          default:
            return <AccountantDashboard onNavigate={setCurrentModule} />;
        }

      case ROLES.PARENT:
        switch (currentModule) {
          case 'myChildren':
          case 'myProfile':
            return <ParentChildrenView />;
          case 'attendance':
            return <ParentAttendanceView />;
          case 'academicPerformance':
          case 'examinationResults':
            return <ParentExamResultsView />;
          case 'homeworkAssignments':
            return <ParentHomeworkView />;
          case 'feeDetails':
            return <ParentFeeDetailsView />;
          case 'paymentHistory':
          case 'downloadReceipts':
            return <ParentReceiptsView />;
          case 'timetable':
            return <ParentTimetableView />;
          case 'notices':
            return <CommunicationManager />;
          default:
            return <ParentDashboard onNavigate={setCurrentModule} />;
        }

      case ROLES.STUDENT:
        switch (currentModule) {
          case 'myProfile':
            return <StudentProfileView user={user} />;
          case 'timetable':
            return <StudentTimetableView />;
          case 'attendance':
            return <StudentAttendanceView />;
          case 'examinationResults':
          case 'academicPerformance':
            return <StudentExamResultsView />;
          case 'assignments':
          case 'homework':
            return <StudentAssignmentsView />;
          case 'notices':
            return <CommunicationManager />;
          default:
            return <StudentDashboard onNavigate={setCurrentModule} />;
        }

      case ROLES.SUPER_ADMIN:
        switch (currentModule) {
          case 'schools':
          case 'subscriptions':
            return <SuperAdminDashboard onNavigate={setCurrentModule} />;
          case 'platformAdmins':
          case 'settings':
            return <SettingsManager />;
          case 'reports':
            return <ReportsCenter />;
          case 'auditLogs':
            return <AuditLogs />;
          default:
            return <SuperAdminDashboard onNavigate={setCurrentModule} />;
        }

      case ROLES.SCHOOL_ADMIN:
      default:
        switch (currentModule) {
          case 'schoolSetup':
            return <SchoolSetup />;
          case 'students':
            return <StudentList />;
          case 'parents':
            return <ParentList />;
          case 'teachers':
            return <TeacherList />;
          case 'staff':
            return <StaffList />;
          case 'classes':
          case 'academics':
          case 'timetable':
            return <TimetableManager />;
          case 'attendance':
            return <StudentAttendance />;
          case 'examinations':
            return <ExaminationManager />;
          case 'fees':
            return <FeeManager />;
          case 'accounting':
            return <AccountingManager />;
          case 'communication':
            return <CommunicationManager />;
          case 'certificates':
            return <CertificateManager />;
          case 'reports':
            return <ReportsCenter />;
          case 'backupRestore':
            return <BackupRestore />;
          case 'settings':
            return <SettingsManager />;
          case 'auditLogs':
            return <AuditLogs />;
          default:
            return <SchoolAdminDashboard onNavigate={setCurrentModule} />;
        }
    }
  };

  return (
    <Layout currentModule={currentModule} onSelectModule={setCurrentModule}>
      {renderModule()}
    </Layout>
  );
}

export default App;
