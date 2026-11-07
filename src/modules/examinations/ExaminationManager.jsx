import React, { useState, useEffect } from 'react';
import { Award, Save, Printer, Plus, Search, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import db from '../../database/db';
import { examRepository } from '../../database/repositories/examRepository';
import { Card, Button, Badge, Modal } from '../../components/common/UIComponents';
import { formatDate } from '../../utils/formatters';

export function ExaminationManager() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedExam, setSelectedExam] = useState('EXAM-01');
  const [selectedClass, setSelectedClass] = useState('CLS-05');
  const [selectedSection, setSelectedSection] = useState('SEC-05-A');
  const [selectedSubject, setSelectedSubject] = useState('SUB-01');

  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [absentMap, setAbsentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Marksheet Viewer Modal
  const [reportCardStudentId, setReportCardStudentId] = useState(null);
  const [reportCardData, setReportCardData] = useState(null);

  // New Exam Modal
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [newExamName, setNewExamName] = useState('');
  const [newExamTerm, setNewExamTerm] = useState('Term 1');
  const [newExamStart, setNewExamStart] = useState('');
  const [newExamEnd, setNewExamEnd] = useState('');

  useEffect(() => {
    loadSetup();
  }, []);

  useEffect(() => {
    if (selectedExam && selectedClass && selectedSection && selectedSubject) {
      loadMarksEntrySheet();
    }
  }, [selectedExam, selectedClass, selectedSection, selectedSubject]);

  const loadSetup = async () => {
    const [ex, cls, sec, sub] = await Promise.all([
      db.exams.toArray(),
      db.classes.toArray(),
      db.sections.toArray(),
      db.subjects.toArray()
    ]);
    setExams(ex);
    setClasses(cls);
    setSections(sec);
    setSubjects(sub);
    if (ex.length > 0) setSelectedExam(ex[0].id);
    if (sub.length > 0) setSelectedSubject(sub[0].id);
  };

  const loadMarksEntrySheet = async () => {
    setLoading(true);
    try {
      const classStudents = await db.students
        .where('classId').equals(selectedClass)
        .and(s => s.sectionId === selectedSection)
        .toArray();
      setStudents(classStudents);

      const existing = await examRepository.getMarks(selectedExam, selectedClass, selectedSection, selectedSubject);
      const existingEntry = existing[0];

      const newMarks = {};
      const newAbsent = {};

      classStudents.forEach(st => {
        const found = existingEntry?.records?.find(r => r.studentId === st.id);
        newMarks[st.id] = found ? found.marksObtained : 85;
        newAbsent[st.id] = found ? found.isAbsent : false;
      });

      setMarksMap(newMarks);
      setAbsentMap(newAbsent);
    } catch (err) {
      console.error('Error loading marks sheet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const studentMarks = students.map(s => ({
        studentId: s.id,
        marksObtained: Number(marksMap[s.id] || 0),
        isAbsent: Boolean(absentMap[s.id]),
        remarks: (marksMap[s.id] || 0) >= 40 ? 'Passed' : 'Needs Improvement'
      }));

      await examRepository.saveMarks(selectedExam, selectedClass, selectedSection, selectedSubject, studentMarks);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Error saving marks: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenReportCard = async (studentId) => {
    setReportCardStudentId(studentId);
    const data = await examRepository.getStudentReportCard(studentId, selectedExam);
    setReportCardData(data);
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!newExamName.trim()) return;
    await examRepository.createExam({
      schoolId: 'SCH-00001',
      name: newExamName.trim(),
      academicYearId: 'AY-2025-2026',
      term: newExamTerm,
      startDate: newExamStart || '2025-10-01',
      endDate: newExamEnd || '2025-10-15',
      status: 'Upcoming'
    });
    setIsExamModalOpen(false);
    setNewExamName('');
    const ex = await db.exams.toArray();
    setExams(ex);
  };

  const filteredSections = sections.filter(s => s.classId === selectedClass);
  const currentSubjectObj = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-7 h-7 text-amber-500" />
            Examination & Marks Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enter subject marks, calculate grade points & ranks, and print student report cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Plus} onClick={() => setIsExamModalOpen(true)}>
            New Exam Term
          </Button>
          <Button variant="primary" size="sm" icon={Save} loading={saving} onClick={handleSaveMarks}>
            Save All Marks
          </Button>
        </div>
      </div>

      {/* Selectors Bar */}
      <Card bodyClassName="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Assessment Term</label>
            <select
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
            >
              {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Class / Grade</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Section</label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
            >
              {filteredSections.map(s => <option key={s.id} value={s.id}>Section {s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none"
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
        </div>
      </Card>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Subject marks updated and stored in Supabase PostgreSQL!</span>
        </div>
      )}

      {/* Marks Table */}
      <Card
        title={`Marks Entry — ${currentSubjectObj?.name || 'Subject'}`}
        subtitle={`Max Marks: ${currentSubjectObj?.maxMarks || 100} • Pass Marks: ${currentSubjectObj?.passMarks || 35}`}
        bodyClassName="p-0 overflow-x-auto"
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 w-12 text-center">Roll</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Admission No</th>
              <th className="py-3 px-4 w-36">Marks Obtained (Max {currentSubjectObj?.maxMarks || 100})</th>
              <th className="py-3 px-4 w-28 text-center">Absent?</th>
              <th className="py-3 px-4 text-right">Report Card</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400">Loading student roster...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-slate-400">No students found.</td>
              </tr>
            ) : (
              students.map(s => {
                const score = marksMap[s.id] || 0;
                const isPass = Number(score) >= (currentSubjectObj?.passMarks || 35);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-center">{s.rollNo || '-'}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{s.fullName}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{s.admissionNo}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max={currentSubjectObj?.maxMarks || 100}
                          value={marksMap[s.id] !== undefined ? marksMap[s.id] : ''}
                          onChange={e => setMarksMap({ ...marksMap, [s.id]: e.target.value })}
                          disabled={absentMap[s.id]}
                          className="w-20 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none text-center"
                        />
                        <span className={`text-[10px] font-bold ${isPass ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isPass ? '✓ Pass' : '✗ Fail'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(absentMap[s.id])}
                        onChange={e => setAbsentMap({ ...absentMap, [s.id]: e.target.checked })}
                        className="rounded text-indigo-600 cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={FileText}
                        onClick={() => handleOpenReportCard(s.id)}
                      >
                        Marksheet
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Card>

      {/* Printable Report Card Modal */}
      {reportCardData && (
        <Modal
          isOpen={Boolean(reportCardData)}
          onClose={() => setReportCardData(null)}
          title="Student Academic Report Card"
          subtitle={`Official evaluation for ${reportCardData.exam?.name || 'Assessment'}`}
          maxWidth="max-w-2xl"
          footer={
            <>
              <Button variant="outline" onClick={() => setReportCardData(null)}>Close</Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>Print Marksheet</Button>
            </>
          }
        >
          <div className="p-6 bg-white text-slate-900 rounded-2xl border-2 border-indigo-600 space-y-4 font-sans text-xs">
            {/* Header */}
            <div className="text-center pb-3 border-b-2 border-indigo-600">
              <h2 className="text-lg font-extrabold uppercase text-indigo-900 tracking-tight">The School Management ERP</h2>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">CBSE Affiliation: CBSE/AFF/2026/9921 • Academic Year 2025-2026</p>
              <div className="inline-block mt-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full font-bold text-indigo-700 text-xs">
                {reportCardData.exam?.name || 'Term Assessment Report'}
              </div>
            </div>

            {/* Student Meta */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border text-[11px]">
              <div><strong>Student Name:</strong> {reportCardData.student?.fullName}</div>
              <div><strong>Admission No:</strong> {reportCardData.student?.admissionNo}</div>
              <div><strong>Roll Number:</strong> {reportCardData.student?.rollNo || '-'}</div>
              <div><strong>Class & Section:</strong> {reportCardData.student?.classId} - A</div>
            </div>

            {/* Marks Table */}
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 font-bold border-b">
                  <tr>
                    <th className="p-2.5">Subject</th>
                    <th className="p-2.5 text-center">Max Marks</th>
                    <th className="p-2.5 text-center">Pass Marks</th>
                    <th className="p-2.5 text-center">Marks Obtained</th>
                    <th className="p-2.5 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px]">
                  {reportCardData.subjects?.map(sub => (
                    <tr key={sub.subjectId}>
                      <td className="p-2.5 font-semibold">{sub.subjectName}</td>
                      <td className="p-2.5 text-center">{sub.maxMarks}</td>
                      <td className="p-2.5 text-center">{sub.passMarks}</td>
                      <td className="p-2.5 text-center font-bold">{sub.isAbsent ? 'AB' : sub.marksObtained}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-600">
                        {sub.marksObtained >= sub.passMarks ? 'Pass' : 'Fail'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grand Total & Grade */}
            <div className="p-3 bg-indigo-50/70 rounded-xl flex items-center justify-between border border-indigo-100 font-bold">
              <div>
                <span className="text-slate-500 text-xs">Grand Total: </span>
                <span className="text-sm text-indigo-900">{reportCardData.totalMarksObtained} / {reportCardData.totalMaxMarks}</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Percentage: </span>
                <span className="text-sm text-indigo-900">{reportCardData.percentage}%</span>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Grade: </span>
                <span className="text-sm text-emerald-600 font-extrabold">{reportCardData.grade} ({reportCardData.gradeRemarks})</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between pt-8 text-[11px] text-slate-500">
              <span>Class Teacher Signature: ______________</span>
              <span>Principal Seal & Signature: ______________</span>
            </div>
          </div>
        </Modal>
      )}

      {/* New Exam Modal */}
      {isExamModalOpen && (
        <Modal
          isOpen={isExamModalOpen}
          onClose={() => setIsExamModalOpen(false)}
          title="Schedule New Examination"
          subtitle="Create new assessment term"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsExamModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateExam}>Schedule Exam</Button>
            </>
          }
        >
          <form onSubmit={handleCreateExam} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Exam Name *</label>
              <input
                type="text"
                required
                value={newExamName}
                onChange={e => setNewExamName(e.target.value)}
                placeholder="e.g. Unit Test 2 Assessment"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Assessment Term</label>
              <select
                value={newExamTerm}
                onChange={e => setNewExamTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Final">Final</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newExamStart}
                  onChange={e => setNewExamStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={newExamEnd}
                  onChange={e => setNewExamEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
