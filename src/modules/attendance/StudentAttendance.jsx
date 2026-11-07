import React, { useState, useEffect } from 'react';
import { CalendarCheck, Save, CheckCircle, Check, X, Clock, AlertCircle, FileSpreadsheet } from 'lucide-react';
import db from '../../database/db';
import { attendanceRepository } from '../../database/repositories/attendanceRepository';
import { Card, Button, Badge } from '../../components/common/UIComponents';
import { exportToCSV } from '../../utils/exportHelpers';

export function StudentAttendance() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('CLS-05');
  const [selectedSection, setSelectedSection] = useState('SEC-05-A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadClassOptions();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadAttendanceSheet();
    }
  }, [selectedClass, selectedSection, selectedDate]);

  const loadClassOptions = async () => {
    const [cls, sec] = await Promise.all([
      db.classes.toArray(),
      db.sections.toArray()
    ]);
    setClasses(cls);
    setSections(sec);
    if (cls.length > 0) setSelectedClass(cls[0].id);
  };

  const loadAttendanceSheet = async () => {
    setLoading(true);
    try {
      // 1. Fetch students of this class & section
      const classStudents = await db.students
        .where('classId').equals(selectedClass)
        .and(s => s.sectionId === selectedSection)
        .toArray();
      setStudents(classStudents);

      // 2. Fetch existing attendance record for this date
      const existing = await attendanceRepository.getStudentAttendanceByDate(selectedDate, selectedClass, selectedSection);
      
      const newStatusMap = {};
      const newRemarksMap = {};

      classStudents.forEach(st => {
        const found = existing?.records?.find(r => r.studentId === st.id);
        newStatusMap[st.id] = found ? found.status : 'Present';
        newRemarksMap[st.id] = found?.remarks || '';
      });

      setAttendanceMap(newStatusMap);
      setRemarksMap(newRemarksMap);
    } catch (err) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = students.map(s => ({
        studentId: s.id,
        status: attendanceMap[s.id] || 'Present',
        remarks: remarksMap[s.id] || ''
      }));

      await attendanceRepository.saveStudentAttendance(selectedDate, selectedClass, selectedSection, records);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error saving attendance: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const data = students.map(s => ({
      'Date': selectedDate,
      'Admission No': s.admissionNo,
      'Student Name': s.fullName,
      'Roll No': s.rollNo,
      'Status': attendanceMap[s.id] || 'Present',
      'Remarks': remarksMap[s.id] || ''
    }));
    exportToCSV(data, `attendance-${selectedDate}-${selectedClass}.csv`);
  };

  // Stats calculation
  const total = students.length;
  const present = Object.values(attendanceMap).filter(st => st === 'Present').length;
  const absent = Object.values(attendanceMap).filter(st => st === 'Absent').length;
  const late = Object.values(attendanceMap).filter(st => st === 'Late').length;
  const percentage = total > 0 ? (((present + late * 0.8) / total) * 100).toFixed(1) : 100;

  const filteredSections = sections.filter(s => s.classId === selectedClass);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-7 h-7 text-emerald-600" />
            Student Daily Attendance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mark daily attendance register, track absentees, and generate monthly reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={FileSpreadsheet} onClick={handleExport}>
            Export Sheet
          </Button>
          <Button variant="success" size="sm" icon={Save} loading={saving} onClick={handleSave}>
            Save Attendance
          </Button>
        </div>
      </div>

      {/* Selector & Quick Controls */}
      <Card bodyClassName="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Class / Grade</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
            >
              {filteredSections.map(s => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Batch Chips */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 text-[11px]">Quick Fill:</span>
            <button
              onClick={() => handleMarkAll('Present')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold text-[11px] border border-emerald-200"
            >
              ✓ Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('Absent')}
              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 font-bold text-[11px] border border-rose-200"
            >
              ✗ Mark All Absent
            </button>
          </div>

          <div className="flex items-center gap-3 font-semibold text-[11px]">
            <span className="text-emerald-600">Present: {present}</span>
            <span className="text-rose-600">Absent: {absent}</span>
            <span className="text-amber-600">Late: {late}</span>
            <Badge variant="purple" size="xs">Rate: {percentage}%</Badge>
          </div>
        </div>
      </Card>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs flex items-center gap-2 border border-emerald-200">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Attendance register saved permanently in Supabase PostgreSQL!</span>
        </div>
      )}

      {/* Attendance Table */}
      <Card bodyClassName="p-0 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-12 text-center">Roll</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Admission No</th>
              <th className="py-3 px-4 text-center">Attendance Status</th>
              <th className="py-3 px-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-400">Loading student roster...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-400">No students enrolled in this section.</td>
              </tr>
            ) : (
              students.map(s => {
                const currentStatus = attendanceMap[s.id] || 'Present';
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-center">{s.rollNo || '-'}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.fullName}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{s.admissionNo}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'Present')}
                          className={`px-3 py-1 rounded-xl font-bold transition-all text-xs flex items-center gap-1 ${
                            currentStatus === 'Present'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-emerald-50'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" /> Present
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'Absent')}
                          className={`px-3 py-1 rounded-xl font-bold transition-all text-xs flex items-center gap-1 ${
                            currentStatus === 'Absent'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-rose-50'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" /> Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(s.id, 'Late')}
                          className={`px-3 py-1 rounded-xl font-bold transition-all text-xs flex items-center gap-1 ${
                            currentStatus === 'Late'
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-amber-50'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" /> Late
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={remarksMap[s.id] || ''}
                        onChange={e => setRemarksMap({ ...remarksMap, [s.id]: e.target.value })}
                        placeholder="Optional remarks..."
                        className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
