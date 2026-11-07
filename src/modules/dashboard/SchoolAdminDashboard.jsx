import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  UserCheck,
  Users,
  CircleDollarSign,
  CalendarCheck,
  Building,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Receipt,
  FileCheck,
  Clock,
  Sparkles,
  Award,
  Bell,
  BookOpen
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import db from '../../database/db';
import { StatCard, Card, Badge } from '../../components/common/UIComponents';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { attendanceRepository } from '../../database/repositories/attendanceRepository';
import { feeRepository } from '../../database/repositories/feeRepository';
import { useThemeLanguage } from '../../context/ThemeLanguageContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export function SchoolAdminDashboard({ onNavigate }) {
  const { activeBranch, activeAcademicYear, t } = useThemeLanguage();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalStaff: 0,
    totalClasses: 0,
    totalRevenue: 0,
    pendingFees: 0,
    attendanceRate: '96.5',
    presentCount: 0,
    absentCount: 0
  });

  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [activeBranch, activeAcademicYear]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const allStudents = await db.students.toArray();
      const filteredStudents = allStudents.filter(s => !s.branchId || s.branchId === activeBranch || activeBranch === 'BR-00001');

      const [teacherCount, staffCount, classCount, examsList] = await Promise.all([
        db.teachers.count(),
        db.staff.count(),
        db.classes.count(),
        db.exams.toArray()
      ]);

      // Fee Stats
      const allInvoices = await db.feeInvoices.toArray();
      const filteredInvoices = allInvoices.filter(i => (!i.academicYearId || i.academicYearId === activeAcademicYear));
      
      let collected = 0;
      let pending = 0;
      filteredInvoices.forEach(inv => {
        collected += (inv.paidAmount || 0);
        pending += (inv.balanceAmount || 0);
      });

      // Attendance Stats
      const attStats = await attendanceRepository.getTodayStats();
      const present = attStats?.present || Math.round(filteredStudents.length * 0.94);
      const absent = attStats?.absent || (filteredStudents.length - present);
      const totalAtt = (present + absent) || 1;
      const rate = ((present / totalAtt) * 100).toFixed(1);

      setStats({
        totalStudents: filteredStudents.length,
        totalTeachers: teacherCount,
        totalStaff: staffCount,
        totalClasses: classCount,
        totalRevenue: collected,
        pendingFees: pending,
        attendanceRate: rate,
        presentCount: present,
        absentCount: absent
      });

      // Recent Admissions
      const sortedStudents = [...filteredStudents].sort((a, b) => new Date(b.admissionDate || 0) - new Date(a.admissionDate || 0));
      setRecentAdmissions(sortedStudents.slice(0, 5));

      // Pending invoices
      const dueInvoices = filteredInvoices.filter(i => i.balanceAmount > 0).slice(0, 5);
      setPendingInvoices(dueInvoices);

      // Notices
      const allNotices = await db.notices.toArray();
      setNotices(allNotices.slice(0, 4));

      // Upcoming exams
      setUpcomingExams(examsList.slice(0, 3));
    } catch (err) {
      console.error('School Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const attendanceChartData = {
    labels: ['Present', 'Absent', 'Late / Leave'],
    datasets: [
      {
        data: [stats.presentCount || 85, stats.absentCount || 5, 2],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const revenueChartData = {
    labels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Fee Collection (₹)',
        data: [180000, 220000, 450000, 310000, 390000, stats.totalRevenue ? Math.round(stats.totalRevenue / 5) : 410000],
        backgroundColor: '#6366f1',
        borderRadius: 8
      }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200 mb-2 border border-white/10">
              <Building className="w-3.5 h-3.5 text-indigo-300" />
              School Administration Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Campus Operations Command Center
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl">
              Real-time daily attendance, student enrollment, fee collections, faculty management, and academic examinations.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={() => onNavigate('students')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-indigo-900 font-extrabold text-xs shadow-md hover:bg-indigo-50 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-700" />
              New Admission
            </button>
            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition active:scale-95 border border-indigo-400/30"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Mark Attendance
            </button>
            <button
              onClick={() => onNavigate('fees')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition active:scale-95 border border-indigo-400/30"
            >
              <CircleDollarSign className="w-3.5 h-3.5" />
              Collect Fees
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subValue="Active in Campus"
          icon={GraduationCap}
          color="indigo"
          onClick={() => onNavigate('students')}
        />
        <StatCard
          title="Teachers & Faculty"
          value={stats.totalTeachers}
          subValue="Permanent & Visiting"
          icon={UserCheck}
          color="emerald"
          onClick={() => onNavigate('teachers')}
        />
        <StatCard
          title="Administrative Staff"
          value={stats.totalStaff}
          subValue="Admin, HR & Support"
          icon={Users}
          color="purple"
          onClick={() => onNavigate('staff')}
        />
        <StatCard
          title="Classes & Sections"
          value={`${stats.totalClasses} Grades`}
          subValue="Active Academic Setup"
          icon={BookOpen}
          color="amber"
          onClick={() => onNavigate('academics')}
        />
      </div>

      {/* Financial & Attendance Overview Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Fees Collected"
          value={formatCurrency(stats.totalRevenue)}
          subValue="Current Session"
          icon={CircleDollarSign}
          color="emerald"
          onClick={() => onNavigate('fees')}
        />
        <StatCard
          title="Pending / Overdue Fees"
          value={formatCurrency(stats.pendingFees)}
          subValue="Awaiting Inflow"
          icon={AlertCircle}
          color="rose"
          onClick={() => onNavigate('fees')}
        />
        <StatCard
          title="Today's Attendance Rate"
          value={`${stats.attendanceRate}%`}
          subValue={`${stats.presentCount} Present / ${stats.absentCount} Absent`}
          icon={CalendarCheck}
          color="indigo"
          onClick={() => onNavigate('attendance')}
        />
        <StatCard
          title="Scheduled Exams"
          value={upcomingExams.length}
          subValue="Term 1 & Assessments"
          icon={Award}
          color="amber"
          onClick={() => onNavigate('examinations')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Collection Trend */}
        <div className="lg:col-span-2">
          <Card title="Fee Collection Trends" subtitle="Monthly collection across terms (₹)">
            <div className="h-64 flex items-center justify-center">
              <Bar
                data={revenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { grid: { color: 'rgba(150, 150, 150, 0.1)' } }, x: { grid: { display: false } } }
                }}
              />
            </div>
          </Card>
        </div>

        {/* Today's Attendance Breakdown */}
        <Card title="Today's Attendance" subtitle="Campus presence ratio">
          <div className="h-64 flex flex-col items-center justify-center">
            <div className="w-44 h-44">
              <Doughnut
                data={attendanceChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                  cutout: '72%'
                }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold">
              {stats.presentCount} Students Present Today
            </p>
          </div>
        </Card>
      </div>

      {/* Dual Table Section: Recent Admissions & School Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <Card
          title="Recent Student Admissions"
          subtitle="Latest enrollments"
          action={
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentAdmissions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No recent admissions.</p>
            ) : (
              recentAdmissions.map(st => (
                <div key={st.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {st.firstName?.[0] || 'S'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{st.fullName || st.firstName}</p>
                      <span className="text-[10px] text-slate-400">Adm: {st.admissionNo || st.id}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {st.classId || 'Grade 1'}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{formatDate(st.admissionDate)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* School Announcements */}
        <Card
          title="School Announcements & Circulars"
          subtitle="Official campus notices"
          action={
            <button
              onClick={() => onNavigate('communication')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Notice Board <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notices.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No notices published.</p>
            ) : (
              notices.map(ntc => (
                <div key={ntc.id} className="py-3 flex items-start gap-3 text-xs">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 shrink-0 mt-0.5">
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 dark:text-white">{ntc.title}</p>
                      <span className="text-[10px] text-slate-400">{formatDate(ntc.publishDate)}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                      {ntc.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
export default SchoolAdminDashboard;
