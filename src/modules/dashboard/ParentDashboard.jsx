import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Award,
  CircleDollarSign,
  ClipboardList,
  Calendar,
  Bell,
  Download,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import db from '../../database/db';
import { StatCard, Card, Badge, Button } from '../../components/common/UIComponents';
import { formatCurrency, formatDate } from '../../utils/formatters';

export function ParentDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState({ rate: '96.2', present: 45, absent: 2, today: 'Present' });
  const [childInvoices, setChildInvoices] = useState([]);
  const [childPayments, setChildPayments] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [homeworkList, setHomeworkList] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParentData();
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      loadChildSpecificData(selectedChild.id);
    }
  }, [selectedChild]);

  const loadParentData = async () => {
    try {
      setLoading(true);
      const parentId = user?.entityId || 'PAR-00001';

      // Fetch all students belonging to this parent
      const allStudents = await db.students.toArray();
      const parentKids = allStudents.filter(s => s.parentId === parentId);

      const finalKids = parentKids.length > 0 ? parentKids : [
        allStudents[0] || {
          id: 'STU-00001',
          fullName: 'Vihaan Iyer',
          admissionNo: 'ADM-2025-00001',
          rollNo: 1,
          classId: 'CLS-00',
          sectionId: 'SEC-CLS-00-A',
          bloodGroup: 'B+'
        }
      ];

      setChildren(finalKids);
      setSelectedChild(finalKids[0]);

      // Notices
      const allNotices = await db.notices.toArray();
      setNotices(allNotices.slice(0, 3));
    } catch (err) {
      console.error('Parent load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChildSpecificData = async (studentId) => {
    try {
      const [allInvoices, allPayments] = await Promise.all([
        db.feeInvoices.toArray(),
        db.feePayments.toArray()
      ]);

      const kidInvoices = allInvoices.filter(i => i.studentId === studentId);
      const kidPayments = allPayments.filter(p => p.studentId === studentId);

      setChildInvoices(kidInvoices);
      setChildPayments(kidPayments);

      // Exam results preview
      setExamResults([
        { subject: 'Mathematics', marks: 95, max: 100, grade: 'A+', remarks: 'Excellent logical skills' },
        { subject: 'English & Grammar', marks: 88, max: 100, grade: 'A', remarks: 'Good vocabulary' },
        { subject: 'Science & Nature', marks: 92, max: 100, grade: 'A+', remarks: 'Very inquisitive' },
        { subject: 'Second Language', marks: 86, max: 100, grade: 'A', remarks: 'Fluent reading' }
      ]);

      // Homework assignments
      setHomeworkList([
        { title: 'Maths Workbook Chapter 4: Fractions', subject: 'Mathematics', dueDate: 'Tomorrow, 08:30 AM', status: 'Pending' },
        { title: 'Read Environmental Science Chapter 3', subject: 'Science', dueDate: 'Friday, Sep 12', status: 'Submitted' }
      ]);

      setAttendanceStats({
        rate: '96.2',
        present: 44,
        absent: 2,
        today: 'Present'
      });
    } catch (err) {
      console.error('Child specific data load error:', err);
    }
  };

  const pendingFeeTotal = childInvoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Banner with Child Switcher */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-sky-200 mb-2 border border-white/10">
              <Users className="w-3.5 h-3.5 text-sky-300" />
              Parent & Guardian Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name || 'Mr. Rajesh Sharma'}
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm mt-1 max-w-xl">
              Track your child's daily campus attendance, academic grades, examination reports, and school fee receipts.
            </p>
          </div>

          {/* Child Switcher Selector */}
          {children.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center gap-2">
              <span className="text-xs font-bold text-sky-200 pl-2">Child:</span>
              <select
                value={selectedChild?.id || ''}
                onChange={e => {
                  const kid = children.find(k => k.id === e.target.value);
                  if (kid) setSelectedChild(kid);
                }}
                className="bg-white text-slate-900 rounded-xl px-3 py-2 text-xs font-bold border-none outline-none cursor-pointer shadow-sm"
              >
                {children.map(kid => (
                  <option key={kid.id} value={kid.id}>
                    {kid.fullName || kid.firstName} ({kid.classId || 'Grade 1'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Selected Child Summary Ribbon */}
      {selectedChild && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-base shadow-md">
              {selectedChild.fullName?.[0] || 'V'}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {selectedChild.fullName || selectedChild.firstName}
              </h3>
              <p className="text-xs text-slate-400">
                Adm No: <strong className="text-slate-700 dark:text-slate-300">{selectedChild.admissionNo || selectedChild.id}</strong> • Roll No: {selectedChild.rollNo || 1} • Blood Group: {selectedChild.bloodGroup || 'B+'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Today: {attendanceStats.today}
            </span>
            <button
              onClick={() => onNavigate('myChildren')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
            >
              View Full Profile →
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Attendance Rate"
          value={`${attendanceStats.rate}%`}
          subValue={`${attendanceStats.present} Present / ${attendanceStats.absent} Absent`}
          icon={CalendarCheck}
          color="emerald"
          onClick={() => onNavigate('attendance')}
        />
        <StatCard
          title="Pending School Fees"
          value={formatCurrency(pendingFeeTotal)}
          subValue={pendingFeeTotal > 0 ? 'Due Term 2 Installment' : 'All Fees Cleared'}
          icon={CircleDollarSign}
          color={pendingFeeTotal > 0 ? 'amber' : 'emerald'}
          onClick={() => onNavigate('feeDetails')}
        />
        <StatCard
          title="Latest Academic Grade"
          value="A+ (92.8%)"
          subValue="Term 1 Mid-Term Examination"
          icon={Award}
          color="purple"
          onClick={() => onNavigate('examinationResults')}
        />
        <StatCard
          title="Pending Homework"
          value={`${homeworkList.filter(h => h.status === 'Pending').length} Due`}
          subValue="Check assignments checklist"
          icon={ClipboardList}
          color="indigo"
          onClick={() => onNavigate('homeworkAssignments')}
        />
      </div>

      {/* Two Column Grid: Exam Results & Homework */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Performance */}
        <Card
          title="Term Examination Results"
          subtitle="Mid-Term Assessment Subject Scores"
          action={
            <button
              onClick={() => onNavigate('examinationResults')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              Report Card <Download className="w-3.5 h-3.5" />
            </button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {examResults.map((ex, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{ex.subject}</p>
                  <span className="text-[11px] text-slate-400">{ex.remarks}</span>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {ex.marks} / {ex.max}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{ex.marks}%</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-xs">
                    {ex.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Homework & Assignments */}
        <Card
          title="Daily Homework & Tasks"
          subtitle="Assignments assigned by class teacher"
          action={
            <button
              onClick={() => onNavigate('homeworkAssignments')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
            >
              View All
            </button>
          }
        >
          <div className="space-y-3">
            {homeworkList.map((hw, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{hw.title}</p>
                  <span className="text-[11px] text-slate-400">{hw.subject} • Due: {hw.dueDate}</span>
                </div>
                <Badge variant={hw.status === 'Submitted' ? 'success' : 'warning'}>
                  {hw.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fee Payment History & Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paid Invoices & Receipts */}
        <Card
          title="Fee Invoices & Paid Receipts"
          subtitle="Official receipts for download and tax declaration"
          action={
            <button
              onClick={() => onNavigate('downloadReceipts')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
            >
              Download Receipts
            </button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {childInvoices.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No fee invoices found.</p>
            ) : (
              childInvoices.map(inv => (
                <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{inv.title || 'Annual Academic Fee'}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{inv.invoiceNo || inv.id}</span>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {formatCurrency(inv.paidAmount || inv.totalAmount)}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">Paid</span>
                    </div>
                    <button
                      onClick={() => onNavigate('downloadReceipts')}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/40"
                      title="Download PDF Receipt"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Notices */}
        <Card
          title="School Circulars for Parents"
          subtitle="Parent-Teacher Meetings and schedules"
          action={
            <button
              onClick={() => onNavigate('notices')}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
            >
              Notice Board
            </button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notices.map(ntc => (
              <div key={ntc.id} className="py-3 flex items-start gap-3 text-xs">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 shrink-0 mt-0.5">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 dark:text-white">{ntc.title}</p>
                    <span className="text-[10px] text-slate-400">{formatDate(ntc.publishDate)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{ntc.content}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
export default ParentDashboard;
