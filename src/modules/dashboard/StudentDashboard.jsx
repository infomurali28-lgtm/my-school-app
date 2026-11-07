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
  Star
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import db from '../../database/db';
import { StatCard, Card, Badge } from '../../components/common/UIComponents';
import { formatDate } from '../../utils/formatters';

export function StudentDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [marks, setMarks] = useState([]);
  const [homework, setHomework] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const studentId = user?.entityId || 'STU-00001';

      // Load student
      const allStudents = await db.students.toArray();
      const st = allStudents.find(s => s.id === studentId) || allStudents[0] || {
        fullName: user?.name || 'Aarav Sharma',
        admissionNo: 'ADM-2025-00001',
        rollNo: 1,
        classId: 'CLS-01',
        sectionId: 'SEC-01-B',
        houseId: 'HSE-02 (Tagore House)',
        bloodGroup: 'B+'
      };
      setStudent(st);

      // Today's Timetable
      setTimetable([
        { period: 'Period 1 (08:30 - 09:15)', subject: 'Mathematics', teacher: 'Mrs. Priya Nair', room: 'Room 102' },
        { period: 'Period 2 (09:15 - 10:00)', subject: 'English Literature', teacher: 'Mrs. Anjali Roy', room: 'Room 102' },
        { period: 'Period 3 (10:15 - 11:00)', subject: 'Science & Lab', teacher: 'Mr. Arvind Rao', room: 'Science Lab 1' },
        { period: 'Period 4 (11:00 - 11:45)', subject: 'Social Studies', teacher: 'Mr. Vikram Singh', room: 'Room 102' },
        { period: 'Period 5 (12:45 - 01:30)', subject: 'Computer Science', teacher: 'Mrs. Priya Nair', room: 'IT Lab A' }
      ]);

      // Subject Marks
      setMarks([
        { subject: 'Mathematics', marks: 95, max: 100, grade: 'A+', rank: '1st in Class' },
        { subject: 'Science', marks: 92, max: 100, grade: 'A+', rank: '2nd in Class' },
        { subject: 'English', marks: 88, max: 100, grade: 'A', rank: '4th in Class' },
        { subject: 'Social Studies', marks: 90, max: 100, grade: 'A+', rank: '3rd in Class' },
        { subject: 'Computer Science', marks: 98, max: 100, grade: 'O', rank: '1st in Class' }
      ]);

      // Homework
      setHomework([
        { title: 'Maths Exercise 4.2 - Problems 1 to 10', subject: 'Mathematics', dueDate: 'Tomorrow, 08:30 AM', status: 'Pending' },
        { title: 'Write an Essay on "Renewable Energy"', subject: 'English', dueDate: 'Friday, Sep 12', status: 'In Progress' },
        { title: 'Draw Digestive System diagram with labels', subject: 'Science', dueDate: 'Monday, Sep 15', status: 'Done' }
      ]);

      // Upcoming Exams
      setUpcomingExams([
        { name: 'Term 1 Final Summative Assessment', date: '2026-09-25', subjects: 'All Subjects', daysLeft: 17 },
        { name: 'Olympiad Mathematics Exam', date: '2026-10-05', subjects: 'Maths & Logic', daysLeft: 27 }
      ]);

      // Notices
      const allNotices = await db.notices.toArray();
      setNotices(allNotices.slice(0, 3));
    } catch (err) {
      console.error('Student load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Student Profile Header Card */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-extrabold flex items-center justify-center text-2xl shadow-xl shrink-0">
              {student?.fullName?.[0] || 'A'}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-rose-200 mb-1 border border-white/10">
                <GraduationCap className="w-3.5 h-3.5 text-rose-300" />
                Student Learning Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {student?.fullName || 'Aarav Sharma'}
              </h1>
              <p className="text-rose-100 text-xs sm:text-sm mt-0.5">
                Class: <strong>Grade 1 - Section B</strong> • Roll No: <strong>{student?.rollNo || 1}</strong> • Adm No: <strong className="font-mono">{student?.admissionNo || 'ADM-2025-00001'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-xs font-bold text-white border border-white/20 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              Tagore House (Red)
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/80 backdrop-blur-md text-xs font-bold text-white border border-emerald-400/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Today: Present
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Attendance Rate"
          value="96.5%"
          subValue="45 Present / 2 Absent"
          icon={CalendarCheck}
          color="emerald"
          onClick={() => onNavigate('attendance')}
        />
        <StatCard
          title="Academic Grade"
          value="A+ (92.6%)"
          subValue="Rank 2 in Section"
          icon={Award}
          color="purple"
          onClick={() => onNavigate('examinationResults')}
        />
        <StatCard
          title="Pending Homework"
          value={`${homework.filter(h => h.status !== 'Done').length} Tasks`}
          subValue="Due this week"
          icon={ClipboardList}
          color="rose"
          onClick={() => onNavigate('homework')}
        />
        <StatCard
          title="Upcoming Exams"
          value="17 Days Left"
          subValue="Term 1 Final Assessment"
          icon={Clock}
          color="indigo"
          onClick={() => onNavigate('examinationResults')}
        />
      </div>

      {/* Today's Timetable & Homework Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timetable */}
        <div className="lg:col-span-2">
          <Card
            title="Today's Timetable & Periods"
            subtitle="Follow your class schedule and room allocations"
            action={
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
              >
                Full Week
              </button>
            }
          >
            <div className="space-y-3">
              {timetable.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 flex items-center justify-center font-extrabold text-xs shrink-0">
                      P{idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {item.subject} • <span className="text-slate-500 font-normal">{item.teacher}</span>
                      </p>
                      <span className="text-[11px] text-slate-400">{item.period} • {item.room}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                    {idx < 2 ? 'Completed' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Homework Tasks Checklist */}
        <Card
          title="Homework Diary"
          subtitle="Assignments to complete"
          action={
            <button
              onClick={() => onNavigate('homework')}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              All Tasks
            </button>
          }
        >
          <div className="space-y-3">
            {homework.map((hw, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{hw.title}</span>
                  <Badge variant={hw.status === 'Done' ? 'success' : hw.status === 'In Progress' ? 'info' : 'warning'}>
                    {hw.status}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{hw.subject}</span>
                  <span>{hw.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Two Column Grid: Exam Scores & Student Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-Wise Examination Scores */}
        <Card
          title="Subject-Wise Examination Scores"
          subtitle="Mid-Term Assessment Marks & Class Rankings"
          action={
            <button
              onClick={() => onNavigate('examinationResults')}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Report Card
            </button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {marks.map((m, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{m.subject}</p>
                  <span className="text-[10px] text-emerald-600 font-bold">{m.rank}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {m.marks} / {m.max}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-xs">
                    {m.grade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Student Announcements */}
        <Card
          title="School Notices & Assembly Circulars"
          subtitle="Events, sports & holidays"
          action={
            <button
              onClick={() => onNavigate('notices')}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
            >
              Notice Board
            </button>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notices.map(ntc => (
              <div key={ntc.id} className="py-3 flex items-start gap-3 text-xs">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 shrink-0 mt-0.5">
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
export default StudentDashboard;
