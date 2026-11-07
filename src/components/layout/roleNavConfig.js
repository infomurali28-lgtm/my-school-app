import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  UserCheck,
  CalendarCheck,
  BookOpen,
  Calendar,
  Award,
  CircleDollarSign,
  Receipt,
  Bell,
  FileCheck,
  BarChart3,
  DatabaseBackup,
  Settings,
  ShieldCheck,
  User,
  CreditCard,
  FileText,
  Clock,
  ClipboardList,
  CheckCircle2,
  TrendingUp,
  Download,
  School,
  Wallet
} from 'lucide-react';
import { ROLES } from '../../auth/roles.js';

export const ROLE_NAVIGATION = {
  [ROLES.SUPER_ADMIN]: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schools', label: 'Schools Management', icon: School },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'platformAdmins', label: 'Platform Admins', icon: ShieldCheck },
    { id: 'reports', label: 'Platform Reports', icon: BarChart3 },
    { id: 'auditLogs', label: 'System Activity', icon: ClipboardList },
    { id: 'settings', label: 'Platform Settings', icon: Settings }
  ],

  [ROLES.SCHOOL_ADMIN]: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schoolSetup', label: 'School Setup', icon: Building2 },
    { id: 'students', label: 'Students', icon: GraduationCap },
    { id: 'parents', label: 'Parents', icon: Users },
    { id: 'teachers', label: 'Teachers', icon: UserCheck },
    { id: 'staff', label: 'Staff & HR', icon: Users },
    { id: 'classes', label: 'Classes & Sections', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'academics', label: 'Academics', icon: BookOpen },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'examinations', label: 'Examinations', icon: Award },
    { id: 'fees', label: 'Fees & Finance', icon: CircleDollarSign },
    { id: 'accounting', label: 'Accounting', icon: Receipt },
    { id: 'communication', label: 'Communication', icon: Bell },
    { id: 'certificates', label: 'Certificates', icon: FileCheck },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'backupRestore', label: 'Backup & Restore', icon: DatabaseBackup },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'auditLogs', label: 'Audit Logs', icon: ShieldCheck }
  ],

  [ROLES.TEACHER]: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'myProfile', label: 'My Profile', icon: User },
    { id: 'myClasses', label: 'My Classes', icon: BookOpen },
    { id: 'myStudents', label: 'My Students', icon: GraduationCap },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'examinations', label: 'Examinations', icon: Award },
    { id: 'marksEntry', label: 'Marks Entry', icon: CheckCircle2 },
    { id: 'studentPerformance', label: 'Student Performance', icon: TrendingUp },
    { id: 'communication', label: 'Communication', icon: Bell }
  ],

  [ROLES.ACCOUNTANT]: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'myProfile', label: 'My Profile', icon: User },
    { id: 'fees', label: 'Student Fee Management', icon: CircleDollarSign },
    { id: 'feeStructures', label: 'Fee Structures', icon: CreditCard },
    { id: 'feeCollection', label: 'Fee Collection', icon: Wallet },
    { id: 'paymentHistory', label: 'Payment History', icon: Clock },
    { id: 'pendingPayments', label: 'Pending Payments', icon: FileText },
    { id: 'receipts', label: 'Receipts', icon: Receipt },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: CircleDollarSign },
    { id: 'accounting', label: 'Accounting', icon: Receipt },
    { id: 'financialReports', label: 'Financial Reports', icon: BarChart3 }
  ],

  [ROLES.PARENT]: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'myChildren', label: 'My Children', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'academicPerformance', label: 'Academic Performance', icon: TrendingUp },
    { id: 'examinationResults', label: 'Examination Results', icon: Award },
    { id: 'homeworkAssignments', label: 'Homework & Assignments', icon: ClipboardList },
    { id: 'feeDetails', label: 'Fee Details', icon: CircleDollarSign },
    { id: 'paymentHistory', label: 'Payment History', icon: Clock },
    { id: 'downloadReceipts', label: 'Download Receipts', icon: Download },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'myProfile', label: 'My Profile', icon: User }
  ],

  [ROLES.STUDENT]: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'myProfile', label: 'My Profile', icon: User },
    { id: 'timetable', label: 'My Timetable', icon: Calendar },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'examinationResults', label: 'Examination Results', icon: Award },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
    { id: 'homework', label: 'Homework', icon: FileText },
    { id: 'academicPerformance', label: 'Academic Performance', icon: TrendingUp },
    { id: 'notices', label: 'Notices', icon: Bell }
  ]
};

export function getRoleNav(role) {
  return ROLE_NAVIGATION[role] || ROLE_NAVIGATION[ROLES.SCHOOL_ADMIN];
}
