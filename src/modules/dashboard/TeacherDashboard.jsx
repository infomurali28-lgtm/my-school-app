import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  GraduationCap,
  CalendarCheck,
  Calendar,
  Award,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowRight,
  BookOpen,
  Bell,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import db from '../../database/db';
import { StatCard, Card, Badge, Button } from '../../components/common/UIComponents';
import { formatDate } from '../../utils/formatters';

export function TeacherDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [assignedSections, setAssignedSections] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [pendingMarks, setPendingMarks] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [attendanceDoneToday, setAttendanceDoneToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacherData();
  }, [user]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      const teacherId = user?.entityId || 'TCH-00002';

      // 1. Fetch teacher record
      const [allTeachers, allSections, allStudents, allExams, allNotices] = await Promise.all([
        db.teachers.toArray(),
        db.sections.toArray(),
        db.students.toArray(),
        db.exams.toArray(),
        db.notices.toArray()
      ]);

      const matchedTeacher = allTeachers.find(t => t.id === teacherId) || {
        fullName: user?.name || 'Mrs. Priya Nair',
        designation: 'Head of Mathematics',
        departmentId: 'DEP-003',
        primarySubjectId: 'Mathematics'
      };
      setTeacher(matchedTeacher);

      // 2. Assigned sections
      const sections = allSections.filter(s => s.classTeacherId === teacherId || s.id === 'SEC-01-B' || s.id === 'SEC-CLS-00-A');
      setAssignedSections(sections);

      // 3. Students in assigned sections
      const sectionIds = sections.map(s => s.id);
      const students = allStudents.filter(s => sectionIds.includes(s.sectionId) || sectionIds.length === 0);
      setAssignedStudents(students.length > 0 ? students : allStudents.slice(0, 32));

      // 4. Mock / dynamic today's schedule for teacher
      setTodaySchedule([
        { period: 'Period 1 (08:30 - 09:15)', class: 'Grade 1 - Section B', subject: 'Mathematics', room: 'Room 102' },
        { period: 'Period 3 (10:15 - 11:00)', class: 'Grade 5 - Section A', subject: 'Advanced Mathematics', room: 'Room 204' },
        { period: 'Period 5 (12:45 - 01:30)', class: 'Grade 7 - Section A', subject: 'Algebra & Geometry', room: 'Room 301' },
        { period: 'Period 7 (02:30 - 03:15)', class: 'Grade 1 - Section B', subject: 'Math Lab Activity', room: 'Math Lab' }
      ]);

      // 5. Pending marks entry & exams
      setUpcomingExams(allExams.slice(0, 3));
      setPendingMarks([
        { exam: 'Term 1 Mid-Term Assessment', class: 'Grade 1-B', subject: 'Mathematics', deadline: '2026-09-15', status: 'Pending' },
        { exam: 'Unit Assessment 2', class: 'Grade 5-A', subject: 'Mathematics', deadline: '2026-09-22', status: 'In Progress' }
      ]);

      setRecentNotices(allNotices.slice(0, 3));
      setAttendanceDoneToday(false);
    } catch (err) {
      console.error('Teacher load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Teacher Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-emerald-200 mb-2 border border-white/10">
              <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
              Teacher & Faculty Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {teacher?.fullName || 'Faculty Member'}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
              {teacher?.designation || 'Faculty'} • Department of Mathematics • Assigned Classes: Grade 1-B, Grade 5-A
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onNavigate('attendance')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-extrabold text-xs shadow-md hover:bg-emerald-50 transition active:scale-95"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-700" />
              Mark Today's Attendance
            </button>
            <button
              onClick={() => onNavigate('marksEntry')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow-md transition active:scale-95 border border-emerald-400/40"
            >
              <Award className="w-4 h-4" />
              Enter Marks
            </button>
            <button
              onClick={() => onNavigate('assignments')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow-md transition active:scale-95 border border-emerald-400/40"
            >
              <ClipboardList className="w-4 h-4" />
              New Assignment
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards for Teacher */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Assigned Classes"
          value="2 Sections"
          subValue="Grade 1-B, Grade 5-A"
          icon={BookOpen}
          color="emerald"
          onClick={() => onNavigate('myClasses')}
        />
        <StatCard
          title="Assigned Students"
          value={assignedStudents.length}
          subValue="Active Enrolled"
          icon={GraduationCap}
          color="indigo"
          onClick={() => onNavigate('myStudents')}
        />
        <StatCard
          title="Today's Lectures"
          value={`${todaySchedule.length} Periods`}
          subValue="2 Completed / 2 Remaining"
          icon={Calendar}
          color="purple"
          onClick={() => onNavigate('timetable')}
        />
        <StatCard
          title="Pending Marks Entry"
          value={pendingMarks.length}
          subValue="Mid-Term Assessment"
          icon={AlertCircle}
          color="amber"
          onClick={() => onNavigate('marksEntry')}
        />
      </div>

      {/* Today's Schedule & Attendance Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Timetable */}
        <div className="lg:col-span-2">
          <Card
            title="Today's Lecture Schedule"
            subtitle="Your timetable periods and assigned classrooms for today"
            action={
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Full Week Timetable <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          >
            <div className="space-y-3">
              {todaySchedule.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-extrabold text-xs shrink-0">
                      P{idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.subject} • <span className="text-emerald-600 dark:text-emerald-400">{item.class}</span>
                      </p>
                      <span className="text-[11px] text-slate-400">{item.period} • {item.room}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {idx < 2 ? 'Done' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Daily Attendance Card */}
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Attendance Status
              </span>
              <Badge variant="warning">Action Required</Badge>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Daily roll call for <strong>Grade 1 - Section B</strong> has not been submitted yet for today.
            </p>
            <button
              onClick={() => onNavigate('attendance')}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              Submit Attendance Register
            </button>
          </div>

          {/* Pending Marks Entry */}
          <Card title="Pending Marks Entry" subtitle="Exams awaiting score submission">
            <div className="space-y-3">
              {pendingMarks.map((pm, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{pm.exam}</p>
                    <Badge variant="warning">{pm.status}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{pm.class} • {pm.subject}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Due: {pm.deadline}</span>
                    <button
                      onClick={() => onNavigate('marksEntry')}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Enter Scores →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* School Announcements for Teachers */}
      <Card
        title="Faculty Announcements & Staff Circulars"
        subtitle="Notices from Principal and Administration"
        action={
          <button
            onClick={() => onNavigate('communication')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            All Notices <ArrowRight className="w-3.5 h-3.5" />
          </button>
        }
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentNotices.map(ntc => (
            <div key={ntc.id} className="py-3 flex items-start gap-3 text-xs">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shrink-0 mt-0.5">
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
  );
}
export default TeacherDashboard;
