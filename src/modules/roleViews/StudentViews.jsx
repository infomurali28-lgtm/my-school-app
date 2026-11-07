import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  CalendarCheck,
  Award,
  ClipboardList,
  FileText,
  Clock,
  Bell,
  CheckCircle2,
  BookOpen,
  Sparkles,
  User,
  Star,
  Printer
} from 'lucide-react';
import db from '../../database/db';
import { Card, Badge } from '../../components/common/UIComponents';

// 1. Student Profile View
export function StudentProfileView({ user }) {
  const profile = {
    name: user?.name || 'Aarav Sharma',
    admissionNo: 'ADM-2025-00001',
    rollNo: 1,
    grade: 'Grade 1 - Section B',
    house: 'Tagore House (Red)',
    dob: '2018-02-15',
    bloodGroup: 'B+',
    parentName: 'Mr. Rajesh Sharma',
    contact: '+91 98765 30001',
    address: '11, Knowledge Park Road, Jubilee Hills, Hyderabad',
    academicYear: '2025 - 2026'
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="p-8 rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="font-extrabold text-lg text-white">The School</h3>
            <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">Student Identification Card</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-extrabold text-[10px]">
            {profile.academicYear}
          </span>
        </div>

        <div className="my-6 flex items-center gap-6">
          <div className="w-24 h-28 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-extrabold shadow-inner shrink-0">
            {profile.name[0]}
          </div>
          <div className="space-y-1 text-xs">
            <h2 className="text-xl font-extrabold text-white">{profile.name}</h2>
            <p className="text-indigo-200 font-bold">{profile.grade}</p>
            <p className="text-slate-300">Roll No: <strong>{profile.rollNo}</strong> • Adm: <strong className="font-mono">{profile.admissionNo}</strong></p>
            <p className="text-slate-300">House: <strong className="text-amber-400">{profile.house}</strong></p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase">Guardian</span>
            <span>{profile.parentName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase">Emergency Phone</span>
            <span>{profile.contact}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Student Timetable View
export function StudentTimetableView() {
  const timetable = [
    { period: 'Period 1 (08:30 - 09:15)', subject: 'Mathematics', teacher: 'Mrs. Priya Nair', room: 'Room 102' },
    { period: 'Period 2 (09:15 - 10:00)', subject: 'English Literature', teacher: 'Mrs. Anjali Roy', room: 'Room 102' },
    { period: 'Period 3 (10:15 - 11:00)', subject: 'Science & Lab', teacher: 'Mr. Arvind Rao', room: 'Science Lab 1' },
    { period: 'Period 4 (11:00 - 11:45)', subject: 'Social Studies', teacher: 'Mr. Vikram Singh', room: 'Room 102' },
    { period: 'Period 5 (12:45 - 01:30)', subject: 'Computer Science', teacher: 'Mrs. Priya Nair', room: 'IT Lab A' }
  ];

  return (
    <Card title="Weekly Class Timetable" subtitle="Daily lecture schedule and classroom allocations">
      <div className="space-y-3 text-xs">
        {timetable.map((t, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold flex items-center justify-center text-xs">
                P{idx + 1}
              </span>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{t.subject}</p>
                <span className="text-[11px] text-slate-400">{t.teacher} • {t.room}</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500">{t.period}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 3. Student Attendance View
export function StudentAttendanceView() {
  return (
    <Card title="Attendance Diary & Streak" subtitle="Your campus presence record">
      <div className="space-y-4 text-xs">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Attendance Percentage: 96.5%</h4>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">46 Days Present out of 48 School Days</p>
          </div>
          <Badge variant="success">Excellent</Badge>
        </div>
      </div>
    </Card>
  );
}

// 4. Student Exam Results View
export function StudentExamResultsView() {
  const marks = [
    { subject: 'Mathematics', marks: 95, max: 100, grade: 'A+' },
    { subject: 'Science', marks: 92, max: 100, grade: 'A+' },
    { subject: 'English', marks: 88, max: 100, grade: 'A' },
    { subject: 'Social Studies', marks: 90, max: 100, grade: 'A+' },
    { subject: 'Computer Science', marks: 98, max: 100, grade: 'O' }
  ];

  return (
    <Card
      title="My Examination Scores & Report Card"
      subtitle="Term 1 Mid-Term Assessment Results"
      action={
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {marks.map((m, idx) => (
              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{m.subject}</td>
                <td className="py-3 px-4 text-slate-400">{m.max}</td>
                <td className="py-3 px-4 font-extrabold text-sm">{m.marks}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-extrabold">
                    {m.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// 5. Student Assignments View
export function StudentAssignmentsView() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Maths Exercise 4.2 - Problems 1 to 10', subject: 'Mathematics', due: 'Tomorrow, 08:30 AM', done: false },
    { id: 2, title: 'Write an Essay on "Renewable Energy"', subject: 'English', due: 'Friday, Sep 12', done: false },
    { id: 3, title: 'Draw Digestive System diagram with labels', subject: 'Science', due: 'Monday, Sep 15', done: true }
  ]);

  const toggle = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <Card title="My Homework & Assignments Checklist" subtitle="Track tasks and mark completion">
      <div className="space-y-3 text-xs">
        {tasks.map(t => (
          <div
            key={t.id}
            onClick={() => toggle(t.id)}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => {}}
                className="w-4 h-4 rounded text-rose-600 cursor-pointer"
              />
              <div>
                <p className={`font-bold ${t.done ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                  {t.title}
                </p>
                <span className="text-[11px] text-slate-400">{t.subject} • Due: {t.due}</span>
              </div>
            </div>
            <Badge variant={t.done ? 'success' : 'warning'}>
              {t.done ? 'Completed' : 'Pending'}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
