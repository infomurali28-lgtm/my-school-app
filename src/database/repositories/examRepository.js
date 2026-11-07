import db from '../db';
import { auditRepository } from './auditRepository';

export const examRepository = {
  async getExams() {
    return await db.exams.toArray();
  },
  async createExam(data) {
    const id = data.id || `EXAM-${Date.now().toString().slice(-4)}`;
    const exam = { ...data, id, status: data.status || 'Upcoming' };
    await db.exams.add(exam);
    await auditRepository.log('CREATE_EXAM', 'Exams', id, `Scheduled examination ${data.name}`);
    return exam;
  },
  async getMarks(examId, classId, sectionId, subjectId) {
    const records = await db.marks
      .where('examId').equals(examId)
      .and(m => m.classId === classId && (!sectionId || m.sectionId === sectionId) && (!subjectId || m.subjectId === subjectId))
      .toArray();
    return records;
  },
  async saveMarks(examId, classId, sectionId, subjectId, studentMarks) {
    const id = `MRK-${examId}-${classId}-${sectionId}-${subjectId}`;
    const record = {
      id,
      examId,
      classId,
      sectionId,
      subjectId,
      records: studentMarks,
      updatedAt: new Date().toISOString()
    };
    await db.marks.put(record);
    await auditRepository.log('SAVE_MARKS', 'Exams', id, `Saved marks for exam ${examId}, class ${classId}, subject ${subjectId}`);
    return record;
  },
  async getStudentReportCard(studentId, examId) {
    const student = await db.students.get(studentId);
    if (!student) return null;
    const exam = await db.exams.get(examId);
    const marksList = await db.marks.where('examId').equals(examId).and(m => m.classId === student.classId).toArray();
    const subjects = await db.subjects.toArray();
    const subMap = new Map(subjects.map(s => [s.id, s]));

    const subjectResults = [];
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;

    marksList.forEach(m => {
      const entry = (m.records || []).find(r => r.studentId === studentId);
      const subObj = subMap.get(m.subjectId) || { name: m.subjectId, maxMarks: 100, passMarks: 35 };
      if (entry) {
        const score = entry.marksObtained || 0;
        totalMarksObtained += score;
        totalMaxMarks += subObj.maxMarks || 100;
        subjectResults.push({
          subjectId: m.subjectId,
          subjectName: subObj.name,
          maxMarks: subObj.maxMarks || 100,
          passMarks: subObj.passMarks || 35,
          marksObtained: score,
          isAbsent: entry.isAbsent || false,
          remarks: entry.remarks || ''
        });
      }
    });

    const percentage = totalMaxMarks > 0 ? (totalMarksObtained / totalMaxMarks) * 100 : 0;
    const grades = await db.grades.toArray();
    const gradeObj = grades.find(g => percentage >= g.minScore && percentage <= g.maxScore) || { gradeName: 'D', description: 'Pass' };

    return {
      student,
      exam,
      subjects: subjectResults,
      totalMarksObtained,
      totalMaxMarks,
      percentage: Number(percentage.toFixed(2)),
      grade: gradeObj.gradeName,
      gradeRemarks: gradeObj.description
    };
  }
};
