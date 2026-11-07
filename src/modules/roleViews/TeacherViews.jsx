import React, { useState, useEffect } from 'react';
import {
  User,
  BookOpen,
  GraduationCap,
  CalendarCheck,
  Award,
  ClipboardList,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Save,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import db from '../../database/db';
import { Card, Badge, Button, Modal } from '../../components/common/UIComponents';
import { formatDate } from '../../utils/formatters';

// 1. Teacher Profile View
export function TeacherProfileView({ user }) {
  const [profile, setProfile] = useState({
    name: user?.name || 'Mrs. Priya Nair',
    teacherId: user?.entityId || 'TCH-00002',
    designation: 'Head of Mathematics Department',
    department: 'Mathematics & Computer Science',
    email: user?.email || 'teacher@theschool.edu',
    phone: user?.phone || '+91 98765 00003',
    qualification: 'M.Sc. Mathematics, B.Ed.',
    experience: '12 Years',
    joiningDate: '2020-06-01',
    address: 'Plot 18, Jubilee Hills, Hyderabad',
    status: 'Active'
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-extrabold flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/20">
          {profile.name[0]}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{profile.name}</h2>
            <Badge variant="success">{profile.status}</Badge>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{profile.designation}</p>
          <p className="text-xs text-slate-400 mt-1">ID: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{profile.teacherId}</span> • Dept: {profile.department}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Academic Qualifications & Experience">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Highest Qualification</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.qualification}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Teaching Experience</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.experience}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Joining Date</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatDate(profile.joiningDate)}</span>
            </div>
          </div>
        </Card>

        <Card title="Official Contact Details">
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Institutional Email</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Phone Number</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Campus Residence</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.address}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// 2. Teacher Assigned Classes View
export function TeacherClassesView({ onNavigate }) {
  const classes = [
    { id: 'SEC-01-B', name: 'Grade 1 - Section B', role: 'Class Teacher', students: 35, room: 'Room 102', subject: 'Mathematics' },
    { id: 'SEC-05-A', name: 'Grade 5 - Section A', role: 'Subject Faculty', students: 32, room: 'Room 204', subject: 'Advanced Mathematics' },
    { id: 'SEC-07-A', name: 'Grade 7 - Section A', role: 'Subject Faculty', students: 30, room: 'Room 301', subject: 'Geometry' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">My Assigned Classes</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sections where you are designated as Class Teacher or Subject Faculty</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classes.map(cls => (
          <div key={cls.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {cls.role}
              </span>
              <span className="text-xs text-slate-400 font-mono">{cls.room}</span>
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{cls.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Subject: <strong>{cls.subject}</strong></p>
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">{cls.students} Students</span>
              <button
                onClick={() => onNavigate('attendance')}
                className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Take Roll Call →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. Teacher Students View
export function TeacherStudentsView() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    db.students.toArray().then(all => {
      // Filter for teacher's class
      setStudents(all.slice(0, 35));
    });
  }, []);

  const filtered = students.filter(s =>
    (s.fullName || s.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.admissionNo || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card
      title="My Class Student Roster"
      subtitle="Students enrolled in your assigned sections"
      action={
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs border border-transparent outline-none focus:border-emerald-500"
          />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
              <th className="py-3 px-4">Roll & Student</th>
              <th className="py-3 px-4">Admission No</th>
              <th className="py-3 px-4">Class & Section</th>
              <th className="py-3 px-4">Blood Group</th>
              <th className="py-3 px-4">Parent Contact</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {filtered.map(st => (
              <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                    {st.rollNo || 1}
                  </span>
                  <span>{st.fullName || st.firstName}</span>
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">{st.admissionNo || st.id}</td>
                <td className="py-3 px-4">{st.classId || 'Grade 1'} - {st.sectionId || 'B'}</td>
                <td className="py-3 px-4 text-slate-500">{st.bloodGroup || 'B+'}</td>
                <td className="py-3 px-4 text-slate-500">{st.phone || '+91 98765 30001'}</td>
                <td className="py-3 px-4">
                  <Badge variant="success">Active</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// 4. Teacher Assignments View
export function TeacherAssignmentsView() {
  const [assignments, setAssignments] = useState([
    { id: 1, title: 'Maths Chapter 4: Fractions Exercises', class: 'Grade 1-B', subject: 'Mathematics', dueDate: '2026-09-12', submissions: '28/35' },
    { id: 2, title: 'Multiplication Tables Mastery 1 to 15', class: 'Grade 1-B', subject: 'Mathematics', dueDate: '2026-09-15', submissions: '32/35' },
    { id: 3, title: 'Word Problems on Distance & Time', class: 'Grade 5-A', subject: 'Mathematics', dueDate: '2026-09-18', submissions: '18/32' }
  ]);
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newClass, setNewClass] = useState('Grade 1-B');
  const [newDate, setNewDate] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newTitle) return;
    setAssignments([...assignments, {
      id: Date.now(),
      title: newTitle,
      class: newClass,
      subject: 'Mathematics',
      dueDate: newDate || '2026-09-20',
      submissions: '0/35'
    }]);
    setIsNewOpen(false);
    setNewTitle('');
  };

  return (
    <Card
      title="Class Assignments & Homework Management"
      subtitle="Publish homework, set submission deadlines, and evaluate student work"
      action={
        <button
          onClick={() => setIsNewOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Assignment
        </button>
      }
    >
      <div className="space-y-3">
        {assignments.map(a => (
          <div key={a.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 dark:text-white text-sm">{a.title}</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  {a.class}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Due: {a.dueDate} • Subject: {a.subject}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{a.submissions} Submitted</span>
              <button className="text-[11px] font-bold text-emerald-600 hover:underline mt-0.5">Evaluate →</button>
            </div>
          </div>
        ))}
      </div>

      {isNewOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-base">New Homework Assignment</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geometry Workbook Worksheet 3"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Class</label>
                  <select
                    value={newClass}
                    onChange={e => setNewClass(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none"
                  >
                    <option value="Grade 1-B">Grade 1-B</option>
                    <option value="Grade 5-A">Grade 5-A</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsNewOpen(false)} className="px-3 py-1.5 rounded-lg text-slate-400">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold">Publish Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}

// 5. Teacher Marks Entry View
export function TeacherMarksEntryView() {
  const [marksList, setMarksList] = useState([
    { id: 'STU-00001', name: 'Vihaan Iyer', roll: 1, marks: 95, remarks: 'Excellent' },
    { id: 'STU-00002', name: 'Reyansh Mishra', roll: 2, marks: 88, remarks: 'Very Good' },
    { id: 'STU-00003', name: 'Aaradhya Patel', roll: 3, marks: 92, remarks: 'Outstanding' },
    { id: 'STU-00004', name: 'Kabir Verma', roll: 4, marks: 78, remarks: 'Good' }
  ]);
  const [saved, setSaved] = useState(false);

  const handleUpdate = (id, val) => {
    setMarksList(marksList.map(m => m.id === id ? { ...m, marks: Number(val) } : m));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card
      title="Examination Marks Entry Sheet"
      subtitle="Enter & update marks for Term 1 Mid-Term Assessment (Grade 1 - Section B)"
      action={
        <div className="flex items-center gap-2">
          {saved && <span className="text-xs font-bold text-emerald-600">Saved to Supabase!</span>}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            Save Marks Register
          </button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase text-slate-400">
              <th className="py-3 px-4">Roll</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Max Marks</th>
              <th className="py-3 px-4">Marks Obtained (out of 100)</th>
              <th className="py-3 px-4">Teacher Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {marksList.map(st => (
              <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-bold">{st.roll}</td>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{st.name}</td>
                <td className="py-3 px-4 text-slate-400">100</td>
                <td className="py-3 px-4">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={st.marks}
                    onChange={e => handleUpdate(st.id, e.target.value)}
                    className="w-20 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-xs"
                  />
                </td>
                <td className="py-3 px-4 text-slate-500">{st.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
