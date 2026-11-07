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
  Printer,
  ChevronDown
} from 'lucide-react';
import db from '../../database/db';
import { Card, Badge, Button, Modal } from '../../components/common/UIComponents';
import { formatCurrency, formatDate } from '../../utils/formatters';

// 1. My Children View
export function ParentChildrenView() {
  const [children, setChildren] = useState([]);

  useEffect(() => {
    db.students.toArray().then(all => {
      setChildren([all[0] || {
        fullName: 'Vihaan Iyer',
        admissionNo: 'ADM-2025-00001',
        rollNo: 1,
        classId: 'Grade 1 - Section B',
        dob: '2018-02-15',
        bloodGroup: 'B+',
        status: 'Active'
      }]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Registered Children</h2>
        <p className="text-xs text-slate-500">Children linked to your parent portal account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map(kid => (
          <div key={kid.id || 1} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-extrabold flex items-center justify-center text-2xl shadow-md">
                {kid.fullName?.[0] || 'V'}
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{kid.fullName || kid.firstName}</h3>
                <p className="text-xs text-sky-600 font-bold">{kid.classId || 'Grade 1 - Section B'}</p>
                <span className="text-[11px] text-slate-400 font-mono">Adm: {kid.admissionNo || 'ADM-2025-00001'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">Roll Number</span>
                <span className="font-bold">{kid.rollNo || 1}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Blood Group</span>
                <span className="font-bold">{kid.bloodGroup || 'B+'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Date of Birth</span>
                <span className="font-bold">{formatDate(kid.dob || '2018-02-15')}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">House</span>
                <span className="font-bold text-amber-600">Tagore (Red)</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2. Parent Attendance View
export function ParentAttendanceView() {
  return (
    <Card title="Monthly Attendance Record" subtitle="Daily presence record for Term 1">
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <div>
            <h4 className="font-bold text-emerald-800 dark:text-emerald-300">Overall Attendance Rate: 96.5%</h4>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Total Working Days: 48 • Present: 46 • Absent: 2 (Medical Leave)</p>
          </div>
          <Badge variant="success">Compliant (&gt;75%)</Badge>
        </div>

        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center">
          <CalendarCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <p className="font-bold text-slate-700 dark:text-slate-300">Student is marked PRESENT in all registered lectures today.</p>
        </div>
      </div>
    </Card>
  );
}

// 3. Parent Exam Results View
export function ParentExamResultsView() {
  const results = [
    { subject: 'Mathematics', max: 100, marks: 95, grade: 'A+', remarks: 'Distinction' },
    { subject: 'English Language', max: 100, marks: 88, grade: 'A', remarks: 'Very Good' },
    { subject: 'Science & Environment', max: 100, marks: 92, grade: 'A+', remarks: 'Distinction' },
    { subject: 'Social Studies', max: 100, marks: 90, grade: 'A+', remarks: 'Distinction' },
    { subject: 'Second Language (Hindi/Telugu)', max: 100, marks: 86, grade: 'A', remarks: 'Good' }
  ];

  return (
    <Card
      title="Official Term 1 Report Card"
      subtitle="Evaluated results with letter grades & teacher comments"
      action={
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          <Printer className="w-3.5 h-3.5" /> Print Marksheet
        </button>
      }
    >
      <div className="overflow-x-auto text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Max Marks</th>
              <th className="py-3 px-4">Marks Obtained</th>
              <th className="py-3 px-4">Grade</th>
              <th className="py-3 px-4">Result Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {results.map((r, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{r.subject}</td>
                <td className="py-3 px-4 text-slate-400">{r.max}</td>
                <td className="py-3 px-4 font-extrabold text-sm text-slate-900 dark:text-white">{r.marks}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold">
                    {r.grade}
                  </span>
                </td>
                <td className="py-3 px-4 text-emerald-600 font-bold">{r.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// 4. Parent Fee Details View
export function ParentFeeDetailsView() {
  const [paid, setPaid] = useState(false);

  return (
    <Card title="Fee Schedule & Online Payment" subtitle="Review pending fees and pay online via UPI or NetBanking">
      <div className="space-y-4 text-xs">
        {paid ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
            Payment of ₹16,000 received! Receipt generated.
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">Term 2 Academic Installment</p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">Due Date: 30 September 2026 • Invoice #INV-2025-00002</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base font-extrabold text-rose-600">₹16,000</span>
              <button
                onClick={() => setPaid(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition"
              >
                Pay Now
              </button>
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Previous Cleared Fees</h4>
          <div className="flex items-center justify-between text-slate-500 py-1 border-b border-slate-200/40">
            <span>Annual Academic Core Fee (Term 1)</span>
            <span className="font-bold text-emerald-600">₹35,000 (Paid on 20 July 2025)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// 5. Parent Download Receipts View
export function ParentReceiptsView() {
  return (
    <Card title="Fee Payment Receipts" subtitle="Download official signed receipts for tax & record keeping">
      <div className="space-y-3 text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Receipt #REC-2025-00001</p>
            <p className="text-[11px] text-slate-400">Paid: ₹35,000 • Method: UPI • Date: 2025-07-20</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </div>
    </Card>
  );
}

// 6. Parent Homework View
export function ParentHomeworkView() {
  return (
    <Card title="Homework & Assignments Tracker" subtitle="Daily tasks assigned to your child">
      <div className="space-y-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Mathematics: Workbook Chapter 4 Fractions</p>
            <p className="text-[11px] text-slate-400">Due: Tomorrow, 08:30 AM</p>
          </div>
          <Badge variant="warning">Pending Submission</Badge>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900 dark:text-white">Science: Read Environmental Science Chapter 3</p>
            <p className="text-[11px] text-slate-400">Due: Friday, Sep 12</p>
          </div>
          <Badge variant="success">Completed</Badge>
        </div>
      </div>
    </Card>
  );
}

// 7. Parent Timetable View
export function ParentTimetableView() {
  const schedule = [
    { period: 'Period 1 (08:30 - 09:15)', subject: 'Mathematics', teacher: 'Mrs. Priya Nair', room: 'Room 102' },
    { period: 'Period 2 (09:15 - 10:00)', subject: 'English', teacher: 'Mrs. Anjali Roy', room: 'Room 102' },
    { period: 'Period 3 (10:15 - 11:00)', subject: 'Science & Lab', teacher: 'Mr. Arvind Rao', room: 'Lab 1' },
    { period: 'Period 4 (11:00 - 11:45)', subject: 'Physical Education / Sports', teacher: 'Mr. Vikram Singh', room: 'Ground' }
  ];

  return (
    <Card title="Class Schedule & Timetable" subtitle="Daily school hours and subject timetable">
      <div className="space-y-3 text-xs">
        {schedule.map((s, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-white">{s.subject} ({s.teacher})</span>
            <span className="text-slate-400">{s.period} • {s.room}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
